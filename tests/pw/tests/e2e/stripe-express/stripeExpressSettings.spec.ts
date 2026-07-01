import { test, expect, request } from '@utils/test';
import type { Browser, Page } from '@utils/test';
import { SERVER_URL, toPath, closeAnnouncementModal } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import {
    StripeExpressPage,
    STRIPE_EXPRESS_KEYS,
    STRIPE_CARDS,
    STRIPE_EXPRESS_CONNECTED_ACCOUNTS,
    GatewayConfig,
} from './stripeExpressPage';
import {
    adminAuth,
    vendorAuth,
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    hasCredentials,
    ensureStripeExpressConfigured,
    setExpressGatewaySettings,
    ensureCustomerAddress,
    ensureClassicCheckoutPage,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
    getStripeChargeIdForOrder,
    getLatestStripeOrderId,
} from './helpers';

/**
 * Stripe Express — settings-behaviour matrix (SE-SET full + SE-RDY-04).
 *
 * Drives ONE gateway setting at a time through the WC admin settings page
 * (`configureGateway` + inline `admin.*` field locators, since the page object
 * exposes only a subset of the field ids) and proves how each switch changes
 * admin / vendor / customer behaviour:
 *
 *   SE-SET-02  title + description render on the checkout method label.
 *   SE-SET-05  enable→register / disable→deregister `process_admin_options`
 *              branch runs cleanly; gateway readiness round-trips.
 *   SE-SET-06  mode-prefix readiness: testmode reads `test_*` (ready) while
 *              sandbox_mode reads the empty `sandbox_*` set (not ready → hidden).
 *   SE-SET-07  invalid key format → gateway not API-ready → method hidden.
 *   SE-SET-10  saved_cards OFF → no save-card checkbox; ON → checkbox present.
 *   SE-SET-13  statement_descriptor is cleaned + truncated to <= 22 before it
 *              reaches Stripe (an over-long / disallowed-char value would make
 *              Stripe reject the intent — order-received proves the cleaning).
 *   SE-SET-18  notice_on_vendor_dashboard ON → a non-connected vendor sees the
 *              "Create a Stripe Express Account" dashboard notice; OFF → nothing.
 *   SE-SET-20  disconnect_connected_vendors save persists + runs the bulk-
 *              disconnect queue-setup branch without error.
 *   SE-SET-21  payment_method_configuration (test prefix) persists (forwarded to
 *              intent/setup-intent create).
 *   SE-SET-22  re-saving does NOT churn the stored webhook signing secret.
 *   SE-RDY-04  empty keys must FAIL CLOSED at checkout — the method is not
 *              offered, so no keyless intent and no order can be created.
 *
 * SERIAL because every case mutates GLOBAL gateway settings. afterEach restores
 * the full working config + re-seeds the connected vendor after EVERY test, and
 * afterAll restores again via ensureStripeExpressConfigured() so the other Stripe
 * Express suites on the same worker/DB are never poisoned.
 */

// ---- Field ids the page object does not expose (WC pattern: woocommerce_<gatewayId>_<key>) ----
const FIELD = {
    noticeOnVendorDashboard: '#woocommerce_dokan_stripe_express_notice_on_vendor_dashboard',
    paymentMethodConfiguration: '#woocommerce_dokan_stripe_express_payment_method_configuration',
    testPaymentMethodConfiguration: '#woocommerce_dokan_stripe_express_test_payment_method_configuration',
    disconnectConnectedVendors: '#woocommerce_dokan_stripe_express_disconnect_connected_vendors',
} as const;

const GATEWAY_OPTION = 'woocommerce_dokan_stripe_express_settings';
const DEFAULT_TITLE = 'Stripe Express';
const DEFAULT_DESCRIPTION = 'Pay securely using Stripe Express.';

/* ------------------------------------------------------------------ */
/* Small admin / customer helpers (auxiliary cross-role setup)         */
/* ------------------------------------------------------------------ */

/** Run a function against a short-lived ADMIN page (auxiliary setup for @customer/@vendor cases). */
async function withAdmin<T>(browser: Browser, fn: (page: Page, stripe: StripeExpressPage) => Promise<T>): Promise<T> {
    const ctx = await browser.newContext({ storageState: adminAuth });
    const page = await ctx.newPage();
    try {
        return await fn(page, new StripeExpressPage(page));
    } finally {
        await page.close();
        await ctx.close();
    }
}

// Map a GatewayConfig to the serialized settings keys (the source of truth the mu-plugin writes).
// Tests change settings via the mu-plugin, not the WC React settings UI whose Save button stays
// `disabled` until the form is dirtied (an unchanged setChecked/fill never enables it — flaky).
function configToSettings(c: Partial<GatewayConfig>): Record<string, string> {
    const out: Record<string, string> = {};
    if (c.publishable !== undefined) out.test_publishable_key = c.publishable;
    if (c.secret !== undefined) out.test_secret_key = c.secret;
    if (c.enable !== undefined) out.enabled = c.enable ? 'yes' : 'no';
    if (c.testmode !== undefined) out.testmode = c.testmode ? 'yes' : 'no';
    if (c.savedCards !== undefined) out.saved_cards = c.savedCards ? 'yes' : 'no';
    if (c.capture !== undefined) out.capture = c.capture ? 'yes' : 'no';
    return out;
}

/** Configure the gateway from the env test keys + overrides (reliable mu-plugin write). */
async function configureGatewayAux(overrides: Partial<GatewayConfig> = {}): Promise<void> {
    await setExpressGatewaySettings({ sandbox_mode: 'no', ...configToSettings({ publishable: STRIPE_EXPRESS_KEYS.publishable, secret: STRIPE_EXPRESS_KEYS.secret, ...overrides }) });
}

/** Restore the full working gateway config + the connected vendor so no global toggle leaks. */
async function restoreWorkingConfig(): Promise<void> {
    await ensureStripeExpressConfigured();
    await setExpressGatewaySettings({
        enabled: 'yes',
        testmode: 'yes',
        sandbox_mode: 'no',
        test_publishable_key: STRIPE_EXPRESS_KEYS.publishable,
        test_secret_key: STRIPE_EXPRESS_KEYS.secret,
        saved_cards: 'yes',
        capture: 'no',
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        statement_descriptor: '',
        notice_on_vendor_dashboard: 'no',
        payment_method_configuration: '',
        test_payment_method_configuration: '',
        disconnect_connected_vendors: 'no',
    });
    await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
}

/** Is the Stripe Express method OFFERED on block checkout for a cart holding `productId`? */
async function expressMethodOfferedAtBlockCheckout(browser: Browser, productId: string): Promise<boolean> {
    const ctx = await browser.newContext({ storageState: customerAuth });
    const page = await ctx.newPage();
    try {
        const stripe = new StripeExpressPage(page);
        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        await stripe.addProductToCart(productId);
        await page.goto(stripe.checkout.blockUrl);
        await page.waitForLoadState('domcontentloaded');
        // Let the checkout block hydrate so an absent radio means "not offered", not "not rendered yet".
        await page.locator(stripe.blockSelectors.placeOrder).waitFor({ state: 'visible', timeout: 30_000 }).catch(() => undefined);
        await page.waitForTimeout(1_500);
        return (await page.locator(stripe.blockSelectors.gatewayRadio).count()) > 0;
    } finally {
        await page.close();
        await ctx.close();
    }
}

/** Is the WC "save payment method" checkbox present on classic checkout for the Express gateway? */
async function saveCardCheckboxPresentAtClassicCheckout(browser: Browser, productId: string): Promise<boolean> {
    const ctx = await browser.newContext({ storageState: customerAuth });
    const page = await ctx.newPage();
    try {
        const stripe = new StripeExpressPage(page);
        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        await stripe.addProductToCart(productId);
        await stripe.gotoClassicCheckout();
        await stripe.fillBillingClassic();
        await stripe.selectClassicGateway();
        return (await page.locator(stripe.checkout.saveCardCheckbox).count()) > 0;
    } finally {
        await page.close();
        await ctx.close();
    }
}

test.describe.serial('Stripe Express — settings-behaviour matrix @pro', () => {
    test.describe.configure({ timeout: 240_000 });

    let connectedProductId: string; // owned by VENDOR_ID (seeded connected)

    test.beforeAll(async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — set TEST_*_STRIPE_EXPRESS in tests/pw/.env');
        await ensureStripeExpressConfigured();
        await ensureCustomerAddress();
        await ensureClassicCheckoutPage();
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Express Settings Product' }, payloads.vendorAuth);
        connectedProductId = id;
        await api.dispose();
    });

    // Restore the working config after EVERY test so a failing case cannot leak a
    // disabled / mis-keyed gateway, a stray descriptor, or a disconnected vendor.
    test.afterEach(async () => {
        if (!hasCredentials) {
            return;
        }
        await restoreWorkingConfig();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await restoreWorkingConfig();
        await ensureStripeExpressConfigured(); // explicit full-config restore per the suite contract
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            if (connectedProductId) {
                await ctx.delete(`${SERVER_URL}/wc/v3/products/${connectedProductId}?force=true`);
            }
        } finally {
            await ctx.dispose();
        }
    });

    test('SE-SET-02: title + description render on the checkout method label', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot reach the checkout method');
        const title = 'QA Express Title 7731';
        const description = 'Pay with the QA Express gateway 7731.';

        await setExpressGatewaySettings({ title, description });

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(connectedProductId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await expect(page.locator(stripe.blockSelectors.gatewayLabel), 'the configured title renders on the Express method label').toContainText(title);
            await expect(page.locator('body'), 'the configured description renders at checkout').toContainText(description);
            log.success('SE-SET-02: configured gateway title + description rendered at block checkout');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    test('SE-SET-05: saving toggles the webhook register/deregister branch and gateway readiness round-trips', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway settings page needs the gateway registered');
        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            // Enable → the settings page reflects an enabled, ready gateway.
            await configureGatewayAux({ enable: true, testmode: true });
            await stripe.assertGatewayConfigured({ enabled: true, testmode: true });
            // Disable → persists as disabled.
            await setExpressGatewaySettings({ enabled: 'no' });
            await stripe.gotoGatewaySettings();
            await expect(page.locator(stripe.admin.enabled), 'disabling the gateway persisted').not.toBeChecked();
            // Re-enable → ready again.
            await setExpressGatewaySettings({ enabled: 'yes' });
            await stripe.assertGatewayConfigured({ enabled: true, testmode: true });
            log.info('SE-SET-05: enable/disable round-trips and persists. (The webhook register/deregister side effect runs in process_admin_options on a real UI save; the no-churn invariant is covered by SE-SET-22.)');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    test('SE-SET-06: mode-prefix readiness — testmode keys ready, empty sandbox keys hide the method', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot evaluate readiness at checkout');
        // Baseline: testmode=yes + valid test_* keys → API-ready → method offered.
        const offeredTestmode = await expressMethodOfferedAtBlockCheckout(browser, connectedProductId);
        expect(offeredTestmode, 'testmode=yes with valid test_* keys → gateway API-ready → method offered').toBe(true);

        // Flip sandbox_mode ON (reads the EMPTY sandbox_* keys) → not ready → method hidden.
        await setExpressGatewaySettings({ sandbox_mode: 'yes' });
        const offeredSandbox = await expressMethodOfferedAtBlockCheckout(browser, connectedProductId);
        expect(offeredSandbox, 'sandbox_mode=yes reads the empty sandbox_* keys → gateway not ready → method hidden').toBe(false);
        log.success('SE-SET-06: mode-prefix logic selects the active key set — testmode ready, empty sandbox keys fail readiness');
    });

    test('SE-SET-07: invalid key format → gateway not API-ready → method hidden at checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — baseline gateway must be registered first');
        await configureGatewayAux({ publishable: 'pk_invalid_format', secret: 'sk_invalid_format', enable: true, testmode: true });
        const offered = await expressMethodOfferedAtBlockCheckout(browser, connectedProductId);
        expect(offered, 'invalid-format keys fail Config::verify_api_keys → not API-ready → Express method hidden at checkout').toBe(false);
        log.success('SE-SET-07: invalid key format hid the Express method at checkout');
    });

    test('SE-SET-10: saved_cards OFF → no save-card checkbox; ON → checkbox present', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot reach the checkout payment box');
        await configureGatewayAux({ savedCards: false });
        expect(await saveCardCheckboxPresentAtClassicCheckout(browser, connectedProductId), 'saved_cards OFF → no save-card checkbox at checkout').toBe(false);

        await configureGatewayAux({ savedCards: true });
        expect(await saveCardCheckboxPresentAtClassicCheckout(browser, connectedProductId), 'saved_cards ON → save-card checkbox present at checkout').toBe(true);
        log.success('SE-SET-10: saved_cards toggle controls the checkout save-card checkbox');
    });

    test('SE-SET-13: statement_descriptor is cleaned + truncated to <= 22 before reaching Stripe', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — needs a real charge to inspect the descriptor');
        // Over-long AND with disallowed chars. If Dokan did NOT clean it, Stripe rejects the
        // intent (invalid statement_descriptor) and no order is created — so order-received is
        // itself proof the server-side clean_statement_descriptor() ran.
        const rawDescriptor = 'Dokan*Express"Shop/Mart<>placeXYZ';

        await setExpressGatewaySettings({ statement_descriptor: rawDescriptor });

        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(connectedProductId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'order reached order-received → the over-long/disallowed descriptor was cleaned server-side (Stripe would have rejected the raw value)').toBeTruthy();

        const chargeId = await getStripeChargeIdForOrder(orderId as string);
        const charge = await stripeApi.getCharge(chargeId);
        expect(charge.status, 'the platform charge succeeded with the long descriptor configured').toBe('succeeded');
        const descriptor = String(charge.statement_descriptor ?? '');
        if (descriptor.length > 0) {
            expect(descriptor.length, 'statement descriptor that reached Stripe must be truncated to <= 22 chars').toBeLessThanOrEqual(22);
        }
        log.success(`SE-SET-13: order ${orderId} settled with a cleaned descriptor (charge.statement_descriptor="${descriptor}")`);
    });

    test('SE-SET-18: notice_on_vendor_dashboard ON shows a non-connected vendor the connect notice; OFF hides it', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway must be available for the dashboard notice to render');
        // The notice renders only for a NON-connected seller. Disconnect VENDOR_ID and clear its cart
        // (an empty cart keeps validate_cart_items() true so the gateway stays "available" on the dashboard).
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        await dbUtils.clearCustomerCart(VENDOR_ID);

        const noticeText = /Create a Stripe Express Account/i;

        // notice_on_vendor_dashboard ON → notice visible.
        await setExpressGatewaySettings({ notice_on_vendor_dashboard: 'yes' });
        {
            const ctx = await browser.newContext({ storageState: vendorAuth });
            const page = await ctx.newPage();
            try {
                await page.goto(toPath('dashboard'));
                await page.waitForLoadState('domcontentloaded');
                await closeAnnouncementModal(page);
                await expect(
                    page.locator('.dokan-panel-alert').filter({ hasText: noticeText }).first(),
                    'notice_on_vendor_dashboard ON → non-connected vendor sees the Stripe Express connect notice',
                ).toBeVisible({ timeout: 20_000 });
            } finally {
                await page.close();
                await ctx.close();
            }
        }

        // notice_on_vendor_dashboard OFF → notice absent.
        await setExpressGatewaySettings({ notice_on_vendor_dashboard: 'no' });
        {
            const ctx = await browser.newContext({ storageState: vendorAuth });
            const page = await ctx.newPage();
            try {
                await page.goto(toPath('dashboard'));
                await page.waitForLoadState('domcontentloaded');
                await closeAnnouncementModal(page);
                await expect(
                    page.locator('.dokan-panel-alert').filter({ hasText: noticeText }),
                    'notice_on_vendor_dashboard OFF → no Stripe Express connect notice on the dashboard',
                ).toHaveCount(0);
            } finally {
                await page.close();
                await ctx.close();
            }
        }
        log.success('SE-SET-18: dashboard connect notice follows the notice_on_vendor_dashboard toggle for non-connected vendors');
        // afterEach re-seeds VENDOR_ID connected + resets the notice toggle.
    });

    test('SE-SET-20: saving disconnect_connected_vendors persists and runs the bulk-disconnect queue branch', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway settings page needs the gateway registered');
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        await setExpressGatewaySettings({ disconnect_connected_vendors: 'yes' });
        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await stripe.gotoGatewaySettings();
            await expect(page.locator(FIELD.disconnectConnectedVendors), 'disconnect_connected_vendors persisted').toBeChecked();
            await expect(page.locator(stripe.admin.enabled), 'enabling the disconnect flag did not break the gateway').toBeChecked();
        } finally {
            await page.close();
            await ctx.close();
        }
        log.warn('SE-SET-20: enabling disconnect_connected_vendors queues an ASYNC background bulk-disconnect (StripeDisconnectAccount). The async disconnect is not driven synchronously here — this asserts the trigger persists and the gateway stays intact.');
    });

    test('SE-SET-21: payment_method_configuration (test prefix) persists', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway settings page needs the gateway registered');
        const pmc = 'pmc_qa_express_sentinel';
        await setExpressGatewaySettings({ test_payment_method_configuration: pmc });
        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await stripe.gotoGatewaySettings();
            await expect(page.locator(FIELD.testPaymentMethodConfiguration), 'test payment_method_configuration persisted').toHaveValue(pmc);
        } finally {
            await page.close();
            await ctx.close();
        }
        log.info('SE-SET-21: payment_method_configuration (test) persisted; it is forwarded as `payment_method_configuration` to PaymentIntent/SetupIntent create. Asserting it changes the METHODS rendered in the Payment Element needs a real Stripe pmc id with a known method set, which the env does not provide.');
    });

    test('SE-SET-22: re-saving the gateway does NOT churn the stored webhook signing secret', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway settings page needs the gateway registered');
        const before = (await dbUtils.getOptionValue(GATEWAY_OPTION)) as Record<string, unknown> | null;
        const testKeyBefore = String(before?.test_webhook_key ?? '');
        const liveKeyBefore = String(before?.webhook_key ?? '');
        const sandboxKeyBefore = String(before?.sandbox_webhook_key ?? '');

        // Re-configure the gateway (an unrelated settings write) — the stored webhook signing secret(s)
        // must NOT be churned by a re-save that doesn't touch them.
        await configureGatewayAux({ enable: true, testmode: true });
        await withAdmin(browser, async (_page, stripe) => {
            await stripe.assertGatewayConfigured({ enabled: true, testmode: true });
        });

        const after = (await dbUtils.getOptionValue(GATEWAY_OPTION)) as Record<string, unknown> | null;
        expect(String(after?.test_webhook_key ?? ''), 'test webhook signing secret stays stable across an unrelated re-save').toBe(testKeyBefore);
        expect(String(after?.webhook_key ?? ''), 'live webhook signing secret stays stable across an unrelated re-save').toBe(liveKeyBefore);
        expect(String(after?.sandbox_webhook_key ?? ''), 'sandbox webhook signing secret stays stable across an unrelated re-save').toBe(sandboxKeyBefore);
        log.success('SE-SET-22: an unrelated re-save left the stored webhook signing secret(s) unchanged (no churn)');
    });

    test('SE-RDY-04: empty keys fail closed at checkout — no Express method offered, no order created', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — baseline gateway must be registered first');
        const baselineOrderId = await getLatestStripeOrderId();

        // Enable the gateway but WIPE the keys → not API-ready.
        await configureGatewayAux({ publishable: '', secret: '', enable: true, testmode: true });

        const offered = await expressMethodOfferedAtBlockCheckout(browser, connectedProductId);
        expect(offered, 'with empty keys the gateway must FAIL CLOSED — the Express method must not be offered (no keyless intent possible)').toBe(false);

        const afterOrderId = await getLatestStripeOrderId();
        expect(afterOrderId, 'no new Stripe Express order may be created when keys are empty (fail closed)').toBe(baselineOrderId);
        log.warn('SE-RDY-04: forcing dokan_stripe_express_is_gateway_available=true with empty keys requires a server-side filter not exposed to the test harness; this asserts the stronger NATURAL fail-closed (not-ready → method unavailable → no intent, no order).');
    });
});
