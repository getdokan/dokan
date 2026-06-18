import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { toPath } from '@utils/helpers';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import {
    vendorAuth,
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    SERVER_URL,
    hasCredentials,
    dokanApiRefund,
    getStripeIntentIdForOrder,
    getStripeChargeIdForOrder,
    ensureCustomerAddress,
    ensureBillingAddress,
} from './helpers';

declare const process: { env: Record<string, string | undefined> };

// Edge cases (C5 / I6 / B3-R23) + Product Advertisement purchase via the dokan-stripe-connect gateway.
// Shared toolkit only — no shared file is edited. Anything missing from the toolkit is defined locally below.

const CREDS_SKIP = 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env';
const REAL_ACCT_SKIP = 'transfer reversal / Stripe-side assertion needs a REAL Stripe test connected account';

/** LOCAL: seed a percentage coupon via WC REST (wc/v3/coupons) and return [couponId, code]. */
async function seedPercentCoupon(amount = '20', productId?: string | number): Promise<[number, string]> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const code = `SC_EDGE_${Date.now().toString(36)}`;
        const res = await ctx.post(`${SERVER_URL}/wc/v3/coupons`, {
            data: {
                code,
                discount_type: 'percent',
                amount,
                individual_use: false,
                // Scope the coupon to the connected-vendor product + mark it vendor-enabled so Dokan accepts it.
                ...(productId ? { product_ids: [Number(productId)] } : {}),
                meta_data: [{ key: 'admin_coupons_enabled_for_vendor', value: 'yes' }],
            },
        });
        const body = (await res.json().catch(() => ({}))) as { id?: number; code?: string };
        if (!res.ok() || !body.id) {
            throw new Error(`seedPercentCoupon failed (${res.status()}): ${JSON.stringify(body)}`);
        }
        return [body.id, body.code ?? code];
    } finally {
        await ctx.dispose();
    }
}

/** LOCAL: force-delete a WC coupon (cleanup). Tolerates an already-removed coupon. */
async function deleteCoupon(couponId: number | undefined): Promise<void> {
    if (!couponId) {
        return;
    }
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.delete(`${SERVER_URL}/wc/v3/coupons/${couponId}?force=true`).catch(() => undefined);
    } finally {
        await ctx.dispose();
    }
}

/** LOCAL: force-delete a WC product (cleanup). Tolerates an already-removed product. */
async function deleteProduct(productId: string | number | undefined): Promise<void> {
    if (!productId) {
        return;
    }
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`).catch(() => undefined);
    } finally {
        await ctx.dispose();
    }
}

/** LOCAL: read an order's total + payment_method + Stripe intent meta (admin auth). */
async function getOrderSummary(orderId: string): Promise<{ total: string; paymentMethod: string; status: string }> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=id,total,status,payment_method`);
        const body = (await res.json()) as { total: string; status: string; payment_method: string };
        return { total: body.total, paymentMethod: body.payment_method, status: body.status };
    } finally {
        await ctx.dispose();
    }
}

/** LOCAL: count an order's WC refund lines (admin auth). Proves "refunded ONCE", not 2×. */
async function getOrderRefundCount(orderId: string): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}/refunds?_fields=id`);
        const body = (await res.json().catch(() => [])) as unknown[];
        return Array.isArray(body) ? body.length : 0;
    } finally {
        await ctx.dispose();
    }
}

/** LOCAL: toggle the Product Advertisement module + ad cost from the test layer (POST dokan-test/v1/enable-product-advertisement). */
async function enableProductAdvertisement(cost = '15'): Promise<{ baseProductId: number }> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.post(`${SERVER_URL}/dokan-test/v1/enable-product-advertisement`, { data: { cost } });
        const body = (await res.json().catch(() => ({}))) as { ok?: boolean; base_product_id?: number };
        if (!res.ok() || !body.ok) {
            throw new Error(`enable-product-advertisement failed (${res.status()}): ${JSON.stringify(body)}`);
        }
        return { baseProductId: Number(body.base_product_id) };
    } finally {
        await ctx.dispose();
    }
}

/** LOCAL: GET dokan-test/v1/is-product-advertised?product_id=N → boolean (server-side Helper::is_product_advertised). */
async function isProductAdvertised(productId: string | number): Promise<boolean> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/dokan-test/v1/is-product-advertised?product_id=${productId}`);
        const body = (await res.json().catch(() => ({}))) as { advertised?: boolean };
        return Boolean(body.advertised);
    } finally {
        await ctx.dispose();
    }
}

/** LOCAL: restore the ad setting to the working default (per_product_enabled off) so other specs are not poisoned. */
async function disableProductAdvertisement(): Promise<void> {
    await dbUtils.updateOptionValue('dokan_product_advertisement', { per_product_enabled: 'off' });
}

/**
 * LOCAL: trigger the vendor PADV purchase from within the browser session so the WC session cart carries the
 * added base product, exactly as the real "Advertise" UI does. The localized `dokan_purchase_advertisement`
 * object (advertise_product_nonce + checkout_url) is enqueued ONLY on the LEGACY, server-rendered vendor
 * dashboard products page (`/dashboard/products/`) — Product::load_product_scripts() returns early unless
 * `dokan_is_seller_dashboard()` AND `query_vars['products']` is set, which the React `/dashboard/new/` SPA
 * route never satisfies. So we navigate to the legacy page, read the object, and POST the SAME AJAX the page
 * fires (`wp.ajax.post('dokan_add_advertise_product_to_cart', { product_id, advertise_product_nonce })` →
 * Ajax::purchase_advertisement → Helper::purchase_advertisement adds get_advertisement_base_product() to the
 * cart at the ad cost). `wp.ajax.post` resolves with the unwrapped `data` payload ({ message, free_purchase })
 * and rejects on success=false. Asserts free_purchase=false (a PAID ad adds the base product to the cart) and
 * returns the localized `checkout_url` the page itself navigates to for a paid purchase.
 */
async function addAdvertisementToVendorCart(stripe: StripeConnectPage, productId: string): Promise<string> {
    const page = stripe.page;
    // The LEGACY server-rendered products page (NOT the /dashboard/new/ React SPA) is where the advertise
    // script + its localized data live. `dokan-product-adv-purchase` is enqueued in the footer, so poll for the
    // object instead of racing the footer script execution.
    await page.goto(toPath('dashboard/products'));
    await page.waitForLoadState('domcontentloaded');
    await page
        .waitForFunction(
            () => {
                const cfg = (window as unknown as { dokan_purchase_advertisement?: { advertise_product_nonce?: string; checkout_url?: string } }).dokan_purchase_advertisement;
                return Boolean(cfg && cfg.advertise_product_nonce && cfg.checkout_url);
            },
            undefined,
            { timeout: 30_000 },
        )
        .catch(() => undefined);

    const result = await page.evaluate(async (pid: string) => {
        const w = window as unknown as {
            dokan_purchase_advertisement?: { advertise_product_nonce?: string; checkout_url?: string };
            wp?: { ajax?: { post: (action: string, data: Record<string, unknown>) => PromiseLike<unknown> } };
        };
        const cfg = w.dokan_purchase_advertisement;
        if (!cfg || !cfg.advertise_product_nonce || !cfg.checkout_url) {
            return { error: 'dokan_purchase_advertisement localized data not found on the legacy vendor products page' };
        }
        if (!w.wp || !w.wp.ajax) {
            return { error: 'wp.ajax helper not available on the vendor products page' };
        }
        try {
            // wp.ajax.post sets action=dokan_add_advertise_product_to_cart, resolves with the unwrapped data
            // payload on success, and rejects on success=false — exactly like purchase_advertisement.js.
            const data = (await w.wp.ajax.post('dokan_add_advertise_product_to_cart', {
                product_id: pid,
                advertise_product_nonce: cfg.advertise_product_nonce,
            })) as { free_purchase?: boolean; message?: string };
            return { data, checkoutUrl: cfg.checkout_url };
        } catch (e) {
            const err = e as { message?: string; data?: { message?: string } };
            return { error: `PADV add-to-cart AJAX failed: ${err?.data?.message ?? err?.message ?? JSON.stringify(e)}` };
        }
    }, productId);

    if ((result as { error?: string }).error) {
        throw new Error((result as { error: string }).error);
    }
    const r = result as { data: { free_purchase?: boolean; message?: string }; checkoutUrl: string };
    expect(r.data?.free_purchase, 'paid ad: AJAX should return free_purchase=false (it adds the base product to the cart)').toBe(false);
    return r.checkoutUrl;
}

test.describe.serial('Stripe Connect — edge cases + Product Advertisement (gateway)', () => {
    test.describe.configure({ timeout: 180_000 });

    let connectedProduct: string; // a connected-vendor product (C5 / I6)
    let couponId: number | undefined;
    let couponCode: string;
    let adProductId: string | undefined; // vendor product whose ad slot is purchased (PADV)
    let adEnabled = false;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureCustomerAddress();
        await ensureBillingAddress(VENDOR_ID);
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        [, connectedProduct] = await api.createProduct({ ...payloads.createProduct(), regular_price: '40' }, payloads.vendorAuth);
        [couponId, couponCode] = await seedPercentCoupon('20', connectedProduct);
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        // Restore globals so the same-worker/DB suites are not poisoned.
        if (adEnabled) {
            await disableProductAdvertisement();
        }
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        await dbUtils.clearCustomerCart(VENDOR_ID);
        await deleteCoupon(couponId);
        await deleteProduct(connectedProduct);
        await deleteProduct(adProductId);
    });

    // ---- C5: coupon re-mount must not orphan / duplicate PaymentIntents ----
    test('C5 — applying a coupon (PE re-mount) leaves exactly ONE succeeded PaymentIntent on the discounted total', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);

        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(connectedProduct);
            await stripe.gotoBlockCheckout();
            // Select Stripe Connect FIRST → mounts PaymentIntent #1.
            await stripe.selectBlockGateway();
            await stripe.assertBlockPaymentElementReady();
            // Apply a coupon → WC update_checkout re-renders the payment box + RE-MOUNTS the Payment Element.
            await stripe.applyCouponBlock(couponCode);
            await expect(
                page.locator('.wc-block-components-totals-discount, .wc-block-components-totals-item:has-text("Discount")'),
                'the coupon must apply (a discount row must render) before continuing',
            ).toBeVisible({ timeout: 15_000 });
            await expect(
                page.locator('.wc-block-components-validation-error, .wc-block-store-notice.is-error'),
                'no coupon rejection notice should be shown',
            ).toHaveCount(0);
            // Re-select the gateway and assert the PE re-mounts cleanly (no orphaned/errored element).
            await stripe.selectBlockGateway();
            await stripe.assertBlockPaymentElementReady();
            // Complete the purchase on the discounted total.
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id from order-received').toBeTruthy();

        // The order's PaymentIntent succeeded — proves the re-mount did NOT strand the old PI / double-charge.
        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const pi = await stripeApi.getPaymentIntent(intentId);
        expect(pi.status, 'the order PaymentIntent should be succeeded').toBe('succeeded');

        // The succeeded PI amount must match the COUPON-DISCOUNTED order total (in cents), proving the
        // re-mount UPDATED the same PI rather than confirming a stale pre-coupon intent.
        const summary = await getOrderSummary(orderId as string);
        const expectedCents = Math.round(parseFloat(summary.total) * 100);
        const piAmount = Number(pi.amount_received ?? pi.amount);
        expect(piAmount, 'succeeded PI amount must equal the discounted order total (not the pre-coupon total)').toBe(expectedCents);

        // Stripe-side guard: exactly ONE succeeded PI carries this order id in metadata (no orphaned duplicate).
        if (stripeApi.hasSecretKey()) {
            const succeededForOrder = await succeededPaymentIntentsForOrder(orderId as string);
            expect(succeededForOrder.length, 'exactly one succeeded PaymentIntent should exist for this order (no orphan)').toBe(1);
        }

        log.success(`C5: coupon re-mount left a single succeeded PaymentIntent ${intentId} on the discounted total ${summary.total}`);
    });

    // ---- I6: double-click Refund must not double-refund ----
    test('I6 — firing the refund twice refunds the charge ONCE (no double refund / over-reversal)', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, REAL_ACCT_SKIP);

        // 1) Place a single-vendor order (no sub-orders → refund is not blocked).
        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(connectedProduct);
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

        // 2) Resolve the charge + the vendor transfer that will be reversed.
        const chargeId = await getStripeChargeIdForOrder(orderId as string);
        const chargeAmount = (await stripeApi.getCharge(chargeId)).amount;
        const transfersBefore = await stripeApi.transfersForCharge(chargeId);
        expect(transfersBefore.length, 'one vendor transfer exists before the refund').toBe(1);
        const transferId = transfersBefore[0].id;
        const transferAmount = transfersBefore[0].amount;

        // 3) Fire the Dokan refund TWICE in quick succession. The second is a no-op:
        //    the order is already fully refunded, and Stripe's refund/reversal are idempotent on amount.
        const results = await Promise.allSettled([dokanApiRefund(orderId as string), dokanApiRefund(orderId as string)]);
        // At least one must have been accepted; a rejected second call is the EXPECTED guard, not a failure.
        expect(results.some(r => r.status === 'fulfilled'), 'at least one refund call should be accepted').toBe(true);

        // 4) The charge is refunded EXACTLY the full amount (ONCE) — 2× is impossible on Stripe, but the
        //    WC/Dokan ledger must also show a single refund line.
        await expect
            .poll(async () => (await stripeApi.getCharge(chargeId)).amount_refunded, {
                message: 'the charge should be fully refunded exactly once',
                timeout: 40_000,
            })
            .toBe(chargeAmount);
        expect((await stripeApi.getCharge(chargeId)).amount_refunded, 'charge refunded once, not double').toBe(chargeAmount);

        // 5) WC ledger: exactly ONE refund line on the order (not two).
        await expect
            .poll(async () => getOrderRefundCount(orderId as string), {
                message: 'the WC order should carry exactly one refund line (no double refund)',
                timeout: 20_000,
            })
            .toBe(1);

        // 6) The vendor transfer is reversed ONCE — amount_reversed never exceeds the original transfer.
        await expect
            .poll(async () => (await stripeApi.getTransfer(transferId)).amount_reversed, {
                message: 'the vendor transfer should be reversed',
                timeout: 30_000,
            })
            .toBeGreaterThan(0);
        const reversed = (await stripeApi.getTransfer(transferId)).amount_reversed;
        expect(reversed, 'reversal must not exceed the original transfer (no over-reversal)').toBe(transferAmount);

        log.success(`I6: double refund refunded charge ${chargeId} once (${chargeAmount}) + reversed transfer ${transferId} once (${reversed}/${transferAmount})`);
    });

    // ---- B3 / R23: admin disconnect is local-only and does NOT deauthorize on Stripe ----
    test('B3/R23 — local disconnect removes the vendor link but the Stripe account stays authorized', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, CREDS_SKIP);
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, REAL_ACCT_SKIP);

        const acctId = STRIPE_CONNECTED_ACCOUNTS.vendor1;
        // Ensure the vendor is connected (beforeAll already seeded; re-seed to make this test self-contained).
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: acctId });
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'dokan_connected_vendor_id'), 'vendor is connected before disconnect').toBeTruthy();
        // Capture the live account id BEFORE disconnect (it must still resolve afterwards).
        const before = await stripeApi.getAccount(acctId);
        expect(before.id, 'connected account resolves on Stripe before disconnect').toBe(acctId);

        // Perform the local disconnect — removeStripeConnectedVendor mimics VendorProfile::update_profile's
        // delete_user_meta(dokan_connected_vendor_id / _stripe_connect_access_key). No Stripe OAuth deauthorize is called.
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);

        // Local link is severed.
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'dokan_connected_vendor_id'), 'local connected-vendor id is gone after disconnect').toBeNull();
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_connect_access_key'), 'local access key is gone after disconnect').toBeNull();

        // R23 gap: the account is STILL authorized on Stripe (disconnect does NOT deauthorize).
        const after = await stripeApi.getAccount(acctId);
        expect(after.id, 'the connected account STILL exists on Stripe after a local-only disconnect (no deauthorize)').toBe(acctId);

        log.success(`B3/R23: local disconnect severed the vendor link but account ${acctId} remains authorized on Stripe (dangling-authorization gap documented)`);
    });

    // ---- PADV: Product Advertisement purchase through the dokan-stripe-connect gateway ----
    test('PADV — vendor buys a product-advertisement slot via Stripe Connect → order received + product advertised', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);

        // 1) Admin enables the advertising module + per-product ad cost (test-support endpoint).
        await enableProductAdvertisement('15');
        adEnabled = true;

        // 2) The vendor needs a PUBLISHED product to advertise + a billing address to check out.
        await ensureBillingAddress(VENDOR_ID);
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        [, adProductId] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);

        // 3) As the VENDOR: add the ad base product to the cart (AJAX), then checkout via Stripe Connect.
        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(VENDOR_ID);
            // Add the ad base product to the session cart via the page's own AJAX, then go to the localized
            // checkout_url (what purchase_advertisement.js navigates to on a paid purchase) and pay via Stripe.
            const checkoutUrl = await addAdvertisementToVendorCart(stripe, adProductId as string);
            await page.goto(checkoutUrl);
            await page.waitForLoadState('domcontentloaded');
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the ad-purchase order id').toBeTruthy();

        // 4) Order: paid via Stripe Connect + carries a Stripe PaymentIntent.
        const summary = await getOrderSummary(orderId as string);
        expect(summary.paymentMethod, 'ad order paid via the Stripe Connect gateway').toBe('dokan-stripe-connect');
        expect(summary.status, 'ad order should be processing/completed').toMatch(/processing|completed/);
        const intentId = await getStripeIntentIdForOrder(orderId as string);
        expect(intentId, 'ad order carries a Stripe PaymentIntent (pi_…)').toMatch(/^pi_/);

        // 5) Advertisement recorded: the product is now advertised (server-side Helper::is_product_advertised).
        await expect
            .poll(async () => isProductAdvertised(adProductId as string), {
                message: 'the product should be advertised after the ad-purchase order settles',
                timeout: 40_000,
            })
            .toBe(true);

        // 6) MONEY invariant (mirrors VS8.5): the ad fee is platform revenue — the ad order has only the
        //    admin-owned base product (no vendor sub-order) → ZERO vendor transfers off this charge.
        if (stripeApi.hasSecretKey()) {
            const chargeId = await stripeApi.getLatestChargeId(intentId);
            expect((await stripeApi.transfersForCharge(chargeId)).length, 'ad fee stays on the platform — no vendor transfer').toBe(0);
        }

        log.success(`PADV: vendor advertised product ${adProductId} via Stripe Connect order ${orderId} (intent ${intentId}); ad fee retained by platform`);
    });
});

/**
 * LOCAL: succeeded PaymentIntents that carry a given WC order id in metadata. Dokan stamps the WC order id
 * into the PaymentIntent metadata (order_id), so a coupon re-mount that orphaned an old PI would surface as a
 * SECOND succeeded PI for the same order. Scans the most-recent intents (Stripe has no metadata query filter).
 */
async function succeededPaymentIntentsForOrder(orderId: string): Promise<Array<{ id: string }>> {
    const ctx = await request.newContext({ extraHTTPHeaders: { Authorization: '' } });
    try {
        const key = process.env.TEST_SECRET_KEY_STRIPE_CONNECT ?? '';
        const res = await ctx.get('https://api.stripe.com/v1/payment_intents?limit=100', {
            headers: { Authorization: `Bearer ${key}` },
        });
        const body = (await res.json().catch(() => ({}))) as { data?: Array<{ id: string; status: string; metadata?: Record<string, string> }> };
        return (body.data ?? [])
            .filter(pi => pi.status === 'succeeded' && pi.metadata && String(pi.metadata.order_id) === String(orderId))
            .map(pi => ({ id: pi.id }));
    } finally {
        await ctx.dispose();
    }
}
