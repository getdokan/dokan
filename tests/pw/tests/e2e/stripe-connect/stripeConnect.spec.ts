import { test, expect, request, Page, BrowserContext } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CONNECT_KEYS, STRIPE_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS, STRIPE_CARDS } from './stripeConnectPage';
import path from 'path';

declare const process: { env: Record<string, string | undefined> };

const adminAuth = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const vendorAuth = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const customerAuth = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');
const VENDOR_ID = process.env.VENDOR_ID ?? '3';
const VENDOR2_ID = process.env.VENDOR2_ID ?? '5';
const CUSTOMER_ID = process.env.CUSTOMER_ID ?? '2';
const SERVER_URL = process.env.SERVER_URL ?? 'http://localhost:9999/wp-json';

/**
 * Trigger a full API Dokan refund for an order via the test-support mu-plugin
 * (`dokan-test/v1/refund`). This fires `dokan_refund_request_created` with
 * method=1, which runs the gateway's process_3ds_refund → Stripe refund + vendor
 * transfer reversal. There is no public REST endpoint to create a Dokan refund.
 */
async function dokanApiRefund(orderId: string | number, amount?: number): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const data: Record<string, unknown> = { order_id: Number(orderId) };
        if (amount !== undefined) {
            data.amount = amount;
        }
        const res = await ctx.post(`${SERVER_URL}/dokan-test/v1/refund`, { data });
        const body = await res.json().catch(() => ({}));
        if (!res.ok()) {
            throw new Error(`Dokan API refund failed (${res.status()}): ${JSON.stringify(body)}`);
        }
    } finally {
        await ctx.dispose();
    }
}

/**
 * Assert the newest Stripe Connect order settled to a paid status. Used by the
 * 3DS tests: completing the SCA challenge settles the ORDER server-side, but the
 * browser doesn't reliably redirect to order-received in automation — so we
 * verify the order status, not the URL.
 */
/** Newest dokan-stripe-connect order id (0 if none) — a baseline to pin against. */
async function getLatestStripeOrderId(): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=10&orderby=date&order=desc&_fields=id,payment_method`);
        const orders = (await res.json().catch(() => [])) as Array<{ id: number; payment_method: string }>;
        const o = Array.isArray(orders) ? orders.find(x => x.payment_method === 'dokan-stripe-connect') : undefined;
        return o ? Number(o.id) : 0;
    } finally {
        await ctx.dispose();
    }
}

/**
 * Assert that a NEW Stripe Connect order (id > baseline, i.e. created by this
 * test) settled to a paid status. Pinning to "newer than baseline" prevents a
 * false PASS by re-reading a prior test's already-settled order — important for
 * the 3DS tests, where the browser redirect to order-received is unreliable.
 */
async function assertStripeOrderSettledSince(baselineOrderId: number): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await expect
            .poll(
                async () => {
                    const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=10&orderby=date&order=desc&_fields=id,status,payment_method`);
                    const orders = (await res.json().catch(() => [])) as Array<{ id: number; status: string; payment_method: string }>;
                    const o = Array.isArray(orders)
                        ? orders.find(x => x.payment_method === 'dokan-stripe-connect' && Number(x.id) > baselineOrderId)
                        : undefined;
                    return o ? o.status : 'none';
                },
                { message: 'a NEW Stripe order (created by this test) should settle to a paid status after SCA', timeout: 60_000 },
            )
            .toMatch(/processing|completed/);
    } finally {
        await ctx.dispose();
    }
}

/** Resolve the Stripe charge id for a WC order (via its PaymentIntent meta). */
async function getStripeChargeIdForOrder(orderId: string): Promise<string> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=meta_data`);
        const body = (await res.json()) as { meta_data: Array<{ key: string; value: string }> };
        const intentId = body.meta_data.find(m => m.key === '_stripe_intent_id' || m.key === 'dokan_stripe_intent_id')?.value;
        if (!intentId) {
            throw new Error(`order ${orderId} has no Stripe PaymentIntent meta`);
        }
        return await stripeApi.getLatestChargeId(String(intentId));
    } finally {
        await ctx.dispose();
    }
}

/** Resolve the Stripe PaymentIntent id for a WC order (from its meta). */
async function getStripeIntentIdForOrder(orderId: string): Promise<string> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=meta_data`);
        const body = (await res.json()) as { meta_data: Array<{ key: string; value: string }> };
        const intentId = body.meta_data.find(m => m.key === '_stripe_intent_id' || m.key === 'dokan_stripe_intent_id')?.value;
        if (!intentId) {
            throw new Error(`order ${orderId} has no Stripe PaymentIntent meta`);
        }
        return String(intentId);
    } finally {
        await ctx.dispose();
    }
}

const WEBHOOK_URL = `${(process.env.BASE_URL ?? 'http://localhost:9999').replace(/\/$/, '')}/?wc-api=dokan_stripe`;

/**
 * POST a Stripe event to the gateway webhook endpoint, UNSIGNED (the handler does
 * no signature verification — R2 — and re-fetches the event by id). Returns the
 * HTTP status. Used to simulate webhook delivery + replay.
 */
async function postWebhookEvent(event: { id: string; type: string; account?: string | null }): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: { Authorization: '' } });
    try {
        const res = await ctx.post(WEBHOOK_URL, { data: { id: event.id, type: event.type, account: event.account ?? null } });
        return res.status();
    } finally {
        await ctx.dispose();
    }
}

/** Give the customer a saved billing+shipping address so the block checkout pre-fills. */
async function ensureCustomerAddress(): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.put(`${SERVER_URL}/wc/v3/customers/${CUSTOMER_ID}`, {
            data: { billing: payloads.createOrder.billing, shipping: payloads.createOrder.shipping },
        });
    } finally {
        await ctx.dispose();
    }
}

/** Ensure a [woocommerce_checkout] shortcode page exists at /classic-checkout/ (idempotent). */
async function ensureClassicCheckoutPage(): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wp/v2/pages?slug=classic-checkout&status=publish`);
        const pages = (await res.json().catch(() => [])) as unknown[];
        if (!Array.isArray(pages) || pages.length === 0) {
            await ctx.post(`${SERVER_URL}/wp/v2/pages`, {
                data: { title: 'Classic Checkout', slug: 'classic-checkout', status: 'publish', content: '[woocommerce_checkout]' },
            });
        }
    } finally {
        await ctx.dispose();
    }
}

const MODULE_STRIPE = 'stripe';
const MODULE_STRIPE_EXPRESS = 'stripe_express';

// Credentials gate. Building the suite never requires keys; running the
// gateway/vendor steps does. `hasCredentials` => can configure the gateway.
// `isReadyCapable` => gateway can become "ready" (needs a client id for the
// SAME Connect account), which is what surfaces the vendor connect button.
const hasCredentials = Boolean(STRIPE_CONNECT_KEYS.publishable && STRIPE_CONNECT_KEYS.secret);
const isReadyCapable = hasCredentials && Boolean(STRIPE_CONNECT_KEYS.clientId);

/**
 * Pre-setup that the Stripe Connect checkout/money specs depend on. Ordered
 * (describe.serial): disable the conflicting Stripe Express module → ensure the
 * Stripe Connect module is active → configure the gateway with test keys → save.
 * All steps are idempotent so re-runs are safe.
 */
test.describe.serial('Stripe Connect — pre-setup (admin gateway configuration)', () => {
    let aPage: Page;
    let aCtx: BrowserContext;
    let stripe: StripeConnectPage;

    test.beforeAll(async ({ browser }) => {
        aCtx = await browser.newContext({ storageState: adminAuth });
        aPage = await aCtx.newPage();
        stripe = new StripeConnectPage(aPage);
    });

    test.afterAll(async () => {
        await aPage?.close();
        await aCtx?.close();
    });

    test('admin can disable Stripe Express module', { tag: ['@pro', '@admin'] }, async () => {
        await stripe.gotoModules();
        if (!(await stripe.isModuleEnabled(MODULE_STRIPE_EXPRESS))) {
            log.skip('Stripe Express module already disabled — skipping the toggle');
        }
        await stripe.setModuleEnabled(MODULE_STRIPE_EXPRESS, false); // idempotent: only toggles if needed
        expect(await stripe.isModuleEnabled(MODULE_STRIPE_EXPRESS), 'Stripe Express must be disabled').toBe(false);
        log.success('Stripe Express module is disabled');
    });

    test('admin can enable Stripe Connect module', { tag: ['@pro', '@admin'] }, async () => {
        await stripe.gotoModules();
        if (await stripe.isModuleEnabled(MODULE_STRIPE)) {
            log.skip('Stripe Connect module already enabled — skipping the toggle');
        }
        await stripe.setModuleEnabled(MODULE_STRIPE, true); // idempotent
        expect(await stripe.isModuleEnabled(MODULE_STRIPE), 'Stripe Connect must be enabled').toBe(true);
        log.success('Stripe Connect module is enabled');
    });

    test('admin can add Stripe Connect payment method', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(
            !hasCredentials,
            'Stripe Connect test keys missing — set TEST_PUBLISH_KEY_STRIPE_CONNECT / TEST_SECRET_KEY_STRIPE_CONNECT in tests/pw/.env',
        );
        await stripe.configureGateway({
            publishable: STRIPE_CONNECT_KEYS.publishable,
            secret: STRIPE_CONNECT_KEYS.secret,
            clientId: STRIPE_CONNECT_KEYS.clientId, // empty unless provided → gateway stays "almost ready"
            enable: true,
            testmode: true,
            savedCards: true,
        });
        await stripe.assertGatewayConfigured({ enabled: true, testmode: true });
        log.success('Stripe Connect gateway enabled with test credentials (test mode)');
    });

    test('Stripe Connect 3D Secure / SCA field is disabled', { tag: ['@pro', '@admin'] }, async () => {
        await stripe.assert3dSecureFieldDisabled();
        log.success('3D Secure / SCA field is rendered disabled (SCA is unconditional)');
    });

    test('gateway readiness reflects client-id presence', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Gateway not configured — test keys missing');
        if (isReadyCapable) {
            await stripe.assertGatewayReady();
            log.success('Gateway reports ready (client id present)');
        } else {
            await stripe.assertGatewayAlmostReady();
            log.warn(
                'Gateway "almost ready"',
                'no TEST_CLIENT_ID_STRIPE_CONNECT set → Stripe Connect withdraw method + vendor connect button will not appear',
            );
        }
    });

    test('admin can enable Stripe Connect as a vendor withdraw method', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(
            !isReadyCapable,
            'Gateway not ready — needs TEST_CLIENT_ID_STRIPE_CONNECT; the withdraw method only registers once ready',
        );
        // Enabling this in Dokan settings → Withdraw Options is what surfaces the
        // connect button in the vendor dashboard (idempotent).
        await stripe.setStripeWithdrawMethodEnabled(true);
        log.success('Stripe Connect enabled as a vendor withdraw method');
    });
});

/**
 * Vendor onboarding. Gated on the gateway being "ready" (needs a client id for
 * the same Connect account). The OAuth round-trip itself is Stripe-hosted and
 * not automatable — these assert the connect UI surfaces and initiates OAuth;
 * an actually-connected vendor for money tests is seeded via user meta.
 */
test.describe.serial('Stripe Connect — vendor onboarding', () => {
    let vPage: Page;
    let vCtx: BrowserContext;
    let stripe: StripeConnectPage;

    test.beforeAll(async ({ browser }) => {
        vCtx = await browser.newContext({ storageState: vendorAuth });
        vPage = await vCtx.newPage();
        stripe = new StripeConnectPage(vPage);
    });

    test.afterAll(async () => {
        await vPage?.close();
        await vCtx?.close();
    });

    test('vendor can add Stripe Connect payment method', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(
            !isReadyCapable,
            'Gateway not ready — set TEST_CLIENT_ID_STRIPE_CONNECT (same Connect account as the keys); the connect button does not render until the gateway is ready',
        );
        if (await stripe.isVendorConnected()) {
            log.skip('Vendor already connected to Stripe — skipping connect-button assertion');
            return;
        }
        await stripe.assertConnectButtonVisible();
        log.success('Vendor Stripe connect button is visible');
    });

    test('vendor connect button initiates Stripe OAuth', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(!isReadyCapable, 'Gateway not ready — set TEST_CLIENT_ID_STRIPE_CONNECT to test the OAuth redirect');
        test.skip(await stripe.isVendorConnected(), 'Vendor already connected — disconnect to re-test the OAuth redirect');
        await stripe.clickConnectExpectStripeRedirect();
        log.success('Connect button redirected to Stripe OAuth (round-trip completion is manual/seeded)');
    });
});

/**
 * Establishing the connected vendor state WITHOUT the Stripe OAuth login, by
 * seeding the same user-meta the OAuth callback writes. This is the precondition
 * the checkout/money specs use. Self-contained: seeds, asserts, then restores
 * the unconnected state so it doesn't affect the onboarding tests above.
 *
 * A placeholder acct_ is enough to show "connected" + unblock checkout; real
 * transfer assertions need a genuine Stripe test connected account (acct_).
 */
test.describe.serial('Stripe Connect — vendor connection seeded via DB (no OAuth)', () => {
    const seededAccount = 'acct_seeded_e2e_vendor';

    test('vendor can be connected by DB seed and shows the connected UI', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: seededAccount });
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.assertVendorConnectedUI(seededAccount); // Disconnect button + Merchant ID
            log.success('Vendor seeded as connected via DB — Disconnect UI + Merchant ID shown, no OAuth');
        } finally {
            await page.close();
            await ctx.close();
            // restore the unconnected state for the onboarding tests / re-runs
            await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        }
    });
});

/**
 * Classic checkout (Payment Elements). Precondition: gateway configured (handled
 * by the admin pre-setup describe above, run earlier in this file) + a connected
 * vendor + a purchasable vendor product. Classic = a [woocommerce_checkout]
 * shortcode page (the site default /checkout/ is the WC Checkout block).
 */
test.describe.serial('Stripe Connect — classic checkout (Payment Elements)', () => {
    test.describe.configure({ timeout: 120_000 }); // real card entry + Stripe confirm/redirect is slow
    let productId: string;

    test.beforeAll(async () => {
        await ensureClassicCheckoutPage();
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        [, productId] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
    });

    test('customer can buy product using Stripe Connect payment method', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.selectClassicGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeClassicOrderExpectReceived();
            log.success('Customer paid with Stripe Connect on classic checkout — order received');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    test('classic checkout: declined card shows an error and creates no order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.selectClassicGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.declined);
            await stripe.placeClassicOrderExpectError();
            log.success('Declined card surfaced an inline error and created no order');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});

/**
 * Block checkout (WC Cart & Checkout blocks — the site default /checkout/).
 * The customer is given a saved address (ensureCustomerAddress) so the block
 * pre-fills contact/shipping and the payment step + place-order are reachable.
 */
test.describe.serial('Stripe Connect — block checkout (Cart & Checkout Blocks)', () => {
    test.describe.configure({ timeout: 120_000 });
    let productId: string;

    test.beforeAll(async () => {
        await ensureCustomerAddress();
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        [, productId] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
    });

    test('customer can buy product using Stripe Connect on block checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            log.success('Customer paid with Stripe Connect on block checkout — order received');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    test('block checkout: declined card shows an error and creates no order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.declined);
            await stripe.placeBlockOrderExpectError();
            log.success('Block declined card surfaced an error and created no order');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});

/**
 * Marketplace split / money correctness (the highest-value risk area). Buys one
 * product from each of two connected vendors in a single order, then verifies
 * against the Stripe API that EXACTLY ONE transfer landed on each vendor's
 * connected account for that charge — the no-double-transfer guarantee (R1) +
 * the split fans out correctly. Requires REAL Stripe test connected accounts.
 *
 * Coverage note: Stripe webhooks can't reach localhost without the Stripe CLI,
 * so only the SYNCHRONOUS transfer path runs here. The webhook-replay form of R1
 * (deliver payment_intent.succeeded twice) needs `stripe listen`/`events resend`
 * and is logged as an uncovered gap, not silently skipped.
 */
test.describe.serial('Stripe Connect — multi-vendor split (real transfers)', () => {
    test.describe.configure({ timeout: 120_000 });
    let product1: string;
    let product2: string;

    test.beforeAll(async () => {
        await ensureCustomerAddress();
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        await dbUtils.seedStripeConnectedVendor(VENDOR2_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor2 });
        const api = new ApiUtils(await request.newContext());
        [, product1] = await api.createProduct({ ...payloads.createProduct(), regular_price: '30' }, payloads.vendorAuth);
        [, product2] = await api.createProduct({ ...payloads.createProduct(), regular_price: '20' }, payloads.vendor2Auth);
    });

    test.afterAll(async () => {
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        await dbUtils.removeStripeConnectedVendor(VENDOR2_ID);
    });

    test('two connected vendors in one cart → exactly one transfer to each (no double transfer)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.skip(
            !HAS_REAL_CONNECTED_ACCOUNTS,
            'needs REAL Stripe test connected accounts (STRIPE_VENDOR1_ACCT/STRIPE_VENDOR2_ACCT) — placeholder accounts cannot receive transfers',
        );

        // 1) One order containing a product from each connected vendor.
        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(product1);
            await stripe.addProductToCart(product2);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the parent order id from the order-received URL').toBeTruthy();

        // 2) Resolve the charge for the parent order.
        const api = new ApiUtils(await request.newContext());
        const [, order] = await api.getSingleOrder(orderId as string, payloads.adminAuth);
        const intentId = (order.meta_data ?? []).find(
            (m: { key: string }) => m.key === '_stripe_intent_id' || m.key === 'dokan_stripe_intent_id',
        )?.value;
        expect(intentId, 'order should carry the Stripe PaymentIntent id').toBeTruthy();
        const chargeId = await stripeApi.getLatestChargeId(String(intentId));

        // 3) EXACTLY ONE transfer per connected vendor for this charge (R1 + split fan-out).
        await expect
            .poll(async () => (await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor1)).length, {
                message: 'exactly one transfer to vendor1 for this charge (no double transfer)',
                timeout: 25_000,
            })
            .toBe(1);
        await expect
            .poll(async () => (await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor2)).length, {
                message: 'exactly one transfer to vendor2 for this charge (no double transfer)',
                timeout: 25_000,
            })
            .toBe(1);

        // 4) Split sanity: each transfer > 0 and the sum doesn't exceed the captured charge.
        const v1 = await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor1);
        const v2 = await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor2);
        expect(v1[0].amount, 'vendor1 transfer amount > 0').toBeGreaterThan(0);
        expect(v2[0].amount, 'vendor2 transfer amount > 0').toBeGreaterThan(0);
        const pi = await stripeApi.getPaymentIntent(String(intentId));
        const captured = pi.amount_received ?? pi.amount;
        expect(v1[0].amount + v2[0].amount, 'sum of vendor transfers must not exceed the charge').toBeLessThanOrEqual(captured);

        log.success(`Multi-vendor split verified: v1=${v1[0].amount}, v2=${v2[0].amount}, charge=${captured} (one transfer each)`);
    });

    test('webhook: replaying payment_intent.succeeded does not duplicate vendor transfers (R1/J2)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'needs REAL Stripe test connected accounts');

        // 1) Place a multi-vendor order (sync path → one transfer per vendor).
        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(product1);
            await stripe.addProductToCart(product2);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the parent order id').toBeTruthy();

        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const chargeId = await stripeApi.getLatestChargeId(intentId);
        // Poll — the sync transfers may still be propagating to Stripe (eventual consistency).
        await expect
            .poll(async () => (await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor1)).length, {
                message: 'one transfer to vendor1 before replay', timeout: 25_000,
            })
            .toBe(1);
        await expect
            .poll(async () => (await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor2)).length, {
                message: 'one transfer to vendor2 before replay', timeout: 25_000,
            })
            .toBe(1);

        // 2) Deliver + replay the payment_intent.succeeded webhook, UNSIGNED (R2 — the
        //    handler has no signature verification and re-fetches the event by id).
        const event = await stripeApi.findPaymentIntentSucceededEvent(intentId);
        expect(event, 'found the payment_intent.succeeded event').toBeTruthy();
        const status1 = await postWebhookEvent(event);
        const status2 = await postWebhookEvent(event);
        expect(status1, 'webhook accepts the unsigned event (R2 — no signature verification)').toBeLessThan(500);
        expect(status2, 'webhook accepts the replayed unsigned event').toBeLessThan(500);

        // 3) Still EXACTLY one transfer per vendor — replay must not double-pay (R1).
        await new Promise(resolve => setTimeout(resolve, 6_000));
        expect((await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor1)).length, 'no duplicate transfer to vendor1 after webhook replay (R1)').toBe(1);
        expect((await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor2)).length, 'no duplicate transfer to vendor2 after webhook replay (R1)').toBe(1);
        log.success('Webhook replay did not duplicate transfers — R1/J2 idempotency holds');
        log.skip('The webhook-BEFORE-sync race (G6) needs Stripe CLI timing control — not covered here');
    });
});

/**
 * Refunds with transfer-reversal assertions (money correctness). A single-vendor
 * order is fully refunded via Dokan's API refund flow; we verify against the
 * Stripe API that BOTH the customer charge is refunded AND the vendor's transfer
 * is reversed (funds pulled back). Single-vendor (no sub-orders) because Dokan
 * blocks refunding a parent order that has sub-orders.
 */
test.describe.serial('Stripe Connect — refunds (transfer reversal)', () => {
    test.describe.configure({ timeout: 120_000 });
    let product1: string;
    let product2: string;

    test.beforeAll(async () => {
        await ensureCustomerAddress();
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        await dbUtils.seedStripeConnectedVendor(VENDOR2_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor2 });
        const api = new ApiUtils(await request.newContext());
        [, product1] = await api.createProduct({ ...payloads.createProduct(), regular_price: '40' }, payloads.vendorAuth);
        [, product2] = await api.createProduct({ ...payloads.createProduct(), regular_price: '25' }, payloads.vendor2Auth);
    });

    test.afterAll(async () => {
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        await dbUtils.removeStripeConnectedVendor(VENDOR2_ID);
    });

    test('full refund reverses the vendor transfer and refunds the customer', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.skip(
            !HAS_REAL_CONNECTED_ACCOUNTS,
            'transfer reversal needs a REAL Stripe test connected account (a placeholder has no transfer to reverse)',
        );

        // 1) Place a single-vendor order so there are no sub-orders to block the refund.
        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(product1);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();

        // 2) Resolve the charge + the vendor transfer that needs reversing.
        const api = new ApiUtils(await request.newContext());
        const [, order] = await api.getSingleOrder(orderId as string, payloads.adminAuth);
        const intentId = (order.meta_data ?? []).find(
            (m: { key: string }) => m.key === '_stripe_intent_id' || m.key === 'dokan_stripe_intent_id',
        )?.value;
        expect(intentId, 'order should carry the Stripe PaymentIntent id').toBeTruthy();
        const chargeId = await stripeApi.getLatestChargeId(String(intentId));
        const transfersBefore = await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor1);
        expect(transfersBefore.length, 'one vendor transfer exists before the refund').toBe(1);
        const transfer = transfersBefore[0];
        const chargeAmount = (await stripeApi.getCharge(chargeId)).amount;

        // 3) Full API refund → Stripe customer refund + vendor transfer reversal.
        await dokanApiRefund(orderId as string);

        // 4) Customer fully refunded on the platform charge.
        await expect
            .poll(async () => (await stripeApi.getCharge(chargeId)).amount_refunded, {
                message: 'the customer charge should be fully refunded',
                timeout: 30_000,
            })
            .toBe(chargeAmount);

        // 5) The vendor transfer is reversed (funds pulled back from the vendor).
        await expect
            .poll(async () => (await stripeApi.getTransfer(transfer.id)).amount_reversed, {
                message: 'the vendor transfer should be reversed',
                timeout: 30_000,
            })
            .toBeGreaterThan(0);
        const reversed = (await stripeApi.getTransfer(transfer.id)).amount_reversed;
        expect(reversed, 'reversal cannot exceed the original transfer').toBeLessThanOrEqual(transfer.amount);

        log.success(`Refund verified: charge ${chargeId} fully refunded + transfer ${transfer.id} reversed (${reversed}/${transfer.amount})`);
    });

    test('refund of an order missing the intent meta does not reverse the transfer', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'needs a REAL Stripe test connected account (a placeholder has no transfer)');

        // 1) Place a single-vendor order (sync path writes dokan_stripe_intent_id + creates a transfer).
        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(product1);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id').toBeTruthy();

        const apiCtx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            // 2) Capture the charge + the vendor transfer that SHOULD be reversed by a refund.
            const orderRes = await apiCtx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=id,meta_data`);
            const orderBody = (await orderRes.json()) as { meta_data: Array<{ key: string; value: string }> };
            const intentId = orderBody.meta_data.find(m => m.key === '_stripe_intent_id' || m.key === 'dokan_stripe_intent_id')?.value;
            expect(intentId, 'order has a PaymentIntent id').toBeTruthy();
            const chargeId = await stripeApi.getLatestChargeId(String(intentId));
            const transfers = await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor1);
            expect(transfers.length, 'a vendor transfer exists').toBe(1);
            const transferId = transfers[0].id;

            // 3) Reproduce the R8 condition: a redirect/webhook-settled order never gets
            //    dokan_stripe_intent_id written (sync-path only). Clear it.
            await apiCtx.put(`${SERVER_URL}/wc/v3/orders/${orderId}`, {
                data: { meta_data: [{ key: 'dokan_stripe_intent_id', value: '' }] },
            });

            // 4) Attempt a full API refund. process_3ds_refund early-returns when the
            //    intent meta is empty (Refund.php:71) — so nothing happens on Stripe.
            await dokanApiRefund(orderId as string);
            await new Promise(resolve => setTimeout(resolve, 6_000)); // give any processing a chance

            // 5) R8 impact: the customer is NOT refunded and the vendor transfer is NOT
            //    reversed — the order is silently un-refundable, vendor keeps the funds.
            const charge = await stripeApi.getCharge(chargeId);
            const transfer = await stripeApi.getTransfer(transferId);
            expect(charge.amount_refunded, 'R8: customer NOT refunded (intent meta missing)').toBe(0);
            expect(transfer.amount_reversed, 'R8: vendor transfer NOT reversed (intent meta missing)').toBe(0);
            log.warn(
                'Order missing dokan_stripe_intent_id',
                'refund reversed nothing and refunded nothing — behaviour tracked in internal QA notes',
            );
        } finally {
            await apiCtx.dispose();
        }
    });

    test('partial refund reverses a proportional part of the vendor transfer', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'needs a REAL Stripe test connected account');

        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(product1);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id').toBeTruthy();

        const chargeId = await getStripeChargeIdForOrder(orderId as string);
        const before = await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor1);
        expect(before.length, 'one vendor transfer before the refund').toBe(1);
        const transfer = before[0];

        await dokanApiRefund(orderId as string, 10); // partial: refund $10

        await expect
            .poll(async () => (await stripeApi.getCharge(chargeId)).amount_refunded, {
                message: 'customer should be partially refunded ($10 = 1000 cents)',
                timeout: 30_000,
            })
            .toBe(1000);
        await expect
            .poll(async () => (await stripeApi.getTransfer(transfer.id)).amount_reversed, {
                message: 'vendor transfer should be partially reversed',
                timeout: 30_000,
            })
            .toBeGreaterThan(0);
        const reversed = (await stripeApi.getTransfer(transfer.id)).amount_reversed;
        expect(reversed, 'partial reversal must be less than the full transfer').toBeLessThan(transfer.amount);
        log.success(`Partial refund verified: customer refunded 1000¢, transfer partially reversed (${reversed}/${transfer.amount})`);
    });

    test('multi-vendor: refunding one sub-order reverses only that vendor transfer', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'needs REAL Stripe test connected accounts');
        // KNOWN ISSUE: refunding a multi-vendor sub-order currently errors out (tracked in
        // internal QA notes). Marked expected-fail so it documents the gap and flips to a
        // real pass once fixed.
        test.fail(true, 'multi-vendor sub-order refund currently errors — tracked in internal QA notes');

        // 1) One order spanning both connected vendors → parent + 2 sub-orders, 1 transfer each.
        let parentOrderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(product1);
            await stripe.addProductToCart(product2);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            parentOrderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(parentOrderId, 'captured the parent order id').toBeTruthy();

        const chargeId = await getStripeChargeIdForOrder(parentOrderId as string);
        const v1Before = await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor1);
        const v2Before = await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor2);
        expect(v1Before.length, 'vendor1 transfer exists').toBe(1);
        expect(v2Before.length, 'vendor2 transfer exists').toBe(1);

        // 2) Find vendor1's sub-order (the one carrying vendor1's transfer id).
        const apiCtx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        let v1SubOrderId: number | undefined;
        try {
            const subRes = await apiCtx.get(`${SERVER_URL}/wc/v3/orders?parent=${parentOrderId}&per_page=20&_fields=id,meta_data`);
            const subs = (await subRes.json()) as Array<{ id: number; meta_data: Array<{ key: string; value: string }> }>;
            v1SubOrderId = subs.find(s => s.meta_data?.some(m => m.key === '_dokan_stripe_transfer_id' && m.value === v1Before[0].id))?.id;
        } finally {
            await apiCtx.dispose();
        }
        expect(v1SubOrderId, 'found vendor1 sub-order').toBeTruthy();

        // 3) Refund vendor1's sub-order in full.
        await dokanApiRefund(v1SubOrderId as number);

        // 4) Only vendor1's transfer is reversed; vendor2's is untouched.
        await expect
            .poll(async () => (await stripeApi.getTransfer(v1Before[0].id)).amount_reversed, {
                message: 'vendor1 transfer should be reversed', timeout: 30_000,
            })
            .toBeGreaterThan(0);
        const v2 = await stripeApi.getTransfer(v2Before[0].id);
        expect(v2.amount_reversed, "vendor2 transfer must be untouched").toBe(0);
        log.success('Multi-vendor refund: vendor1 sub-order reversed, vendor2 transfer untouched');
    });
});

/**
 * 3DS / SCA. The new gateway always uses PaymentIntents, so `4000…3155` forces an
 * in-page SCA challenge; completing it must settle the order. Single-vendor order.
 */
test.describe.serial('Stripe Connect — 3DS / SCA', () => {
    test.describe.configure({ timeout: 120_000 });
    let productId: string;

    test.beforeAll(async () => {
        await ensureCustomerAddress();
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        [, productId] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
    });

    test('classic checkout: 3DS card completes after the SCA challenge', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.selectClassicGateway();
            const baseline = await getLatestStripeOrderId(); // pin: only a NEWER order (this test's) counts
            await stripe.fillCardDetails(STRIPE_CARDS.threeDS);
            await page.locator(stripe.checkout.placeOrderClassic).click();
            await stripe.complete3DSChallenge();
            await assertStripeOrderSettledSince(baseline);
            log.success('Classic 3DS order settled after completing the SCA challenge');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    test('block checkout: 3DS card completes after the SCA challenge', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            const baseline = await getLatestStripeOrderId(); // pin: only a NEWER order (this test's) counts
            await stripe.fillCardDetails(STRIPE_CARDS.threeDS);
            await page.locator(stripe.blockSelectors.placeOrder).click();
            await stripe.complete3DSChallenge();
            await assertStripeOrderSettledSince(baseline);
            log.success('Block 3DS order settled after completing the SCA challenge');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});
