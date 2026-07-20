import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { StripeExpressPage, STRIPE_CARDS, STRIPE_EXPRESS_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    adminAuth,
    vendorAuth,
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    hasCredentials,
    ensureStripeExpressConfigured,
    ensureCustomerAddress,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
} from './helpers';

/**
 * Stripe Express — master suite (SE-MOD / SE-SET core / SE-RDY / SE-ONB seeded / SE-CHK block).
 *
 * Serial because it touches global gateway/module state. The gateway is configured once in
 * beforeAll (idempotent), the customer is seeded an address, and vendor1 is DB-seeded as a
 * connected Express account (a REAL acct_ when STRIPE_EXPRESS_VENDOR1_ACCT is set, so the
 * transfer path is real). Checkout/charge tests self-skip without keys.
 */
test.describe.serial('Stripe Express — master @pro', () => {
    test.describe.configure({ timeout: 150_000 });

    let productId: string;

    test.beforeAll(async () => {
        await ensureStripeExpressConfigured();
        await ensureCustomerAddress();
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Express Master Product' }, payloads.vendorAuth);
        productId = id;
        await api.dispose();
    });

    test.afterAll(async () => {
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    });

    // ---- Admin: module + settings invariants ----

    test('SE-MOD: stripe_express module is active and the legacy stripe module is inactive', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await stripe.gotoModules();
            expect(await stripe.isModuleEnabled(StripeExpressPage.MODULE_SLUG), 'stripe_express module should be active').toBe(true);
            expect(await stripe.isModuleEnabled('stripe'), 'legacy stripe (Connect) module should be inactive').toBe(false);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    test('SE-SET-03: the gateway has NO enable_3d_secure field (SCA is unconditional)', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway settings page needs the gateway registered');
        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        try {
            await new StripeExpressPage(page).assertNo3dSecureField();
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    test('SE-SET-04: the gateway has NO allow_non_connected_sellers field', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway settings page needs the gateway registered');
        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        try {
            await new StripeExpressPage(page).assertNoAllowNonConnectedField();
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    test('SE-SET-01: the gateway settings persisted (enabled + testmode + keys)', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing');
        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        try {
            await new StripeExpressPage(page).assertGatewayConfigured({ enabled: true, testmode: true });
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- Vendor: connected onboarding UI (seeded) ----

    test('SE-ONB-04: a DB-seeded connected vendor shows the connected UI (Disconnect + Visit Dashboard)', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the onboarding page needs the gateway ready');
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            await new StripeExpressPage(page).assertVendorConnectedUI();
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- Customer: block checkout (the validated happy path + declined) ----

    test('SE-CHK-B-01: customer pays with a valid card on block checkout → order received', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive the Payment Element');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            // placeBlockOrderExpectReceived asserts a genuinely NEW paid Stripe Express order settled
            // (its poll requires a processing|completed|on-hold status) and returns that order id. We
            // assert on the id rather than the browser URL: on CI the in-page confirm is hCaptcha-blocked
            // so the SPA never redirects to /order-received even though the payment settled server-side.
            const orderId = await stripe.placeBlockOrderExpectReceived();
            expect(Number(orderId), 'a successful Express payment should settle a paid order').toBeGreaterThan(0);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    test('SE-CHK-B-03: a declined card on block checkout surfaces an error and does NOT place an order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive the Payment Element');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.declined);
            await stripe.placeBlockOrderExpectError();
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});
