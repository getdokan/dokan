import { test, expect, request } from '@utils/test';
import type { Page } from '@playwright/test';
import { SERVER_URL } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import { payloads, MOBILE_TEST_PHONE } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { log } from '@utils/logger';
import { StripeExpressPage, STRIPE_CARDS, STRIPE_EXPRESS_KEYS, STRIPE_EXPRESS_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    adminAuth,
    customerAuth,
    VENDOR_ID,
    VENDOR2_ID,
    CUSTOMER_ID,
    hasCredentials,
    ensureStripeExpressConfigured,
    ensureCustomerAddress,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
} from './helpers';

/**
 * Stripe Express — SE-EDGE (edge cases & resilience).
 *
 * Covers SE-EDGE-01..07 from the catalog:
 *   01 gateway disabled mid-session → not offered after reload (serial · restore in afterAll)
 *   02 empty cart → Express method not offered on block checkout
 *   03 switch gateway away + back → the Payment Element re-mounts cleanly
 *   04 declined payment can be retried in the same block session and then succeeds (update_failed_order path)
 *   05 order with ONLY a non-connected vendor still completes (charge on platform)
 *   06 very long / unicode billing details pass through to Stripe without breaking the PE
 *   07 gateway keys removed mid-flow → in-flight checkout submit errors (serial · restore in afterAll)
 *
 * The two config-MUTATING cases (01, 07) live in a `describe.serial` block that restores the full
 * working gateway config in its afterAll (and each test also restores in its own finally to keep the
 * disabled/keyless window tiny). The non-mutating cases run independently. Every case self-skips
 * without keys (the Payment Element cannot be driven). vendor1 is seeded connected; vendor2 is left
 * unconnected for SE-EDGE-05.
 */

const CREDS_SKIP = 'Stripe Express keys missing — the gateway / Payment Element cannot be driven';
const EDGE_TIMEOUT = 180_000;

let connectedProductId: string;
let nonConnectedProductId: string;

/** Best-effort: make sure a SECOND block gateway (BACS) is enabled so SE-EDGE-03 has something to switch to. */
async function ensureBacsEnabled(): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.put(`${SERVER_URL}/wc/v3/payment_gateways/bacs`, { data: { enabled: true } });
    } finally {
        await ctx.dispose();
    }
}

/** Overwrite a customer's billing + shipping address (used by SE-EDGE-06 to inject long/unicode values). */
async function setCustomerAddress(userId: string | number, billing: Record<string, string>, shipping: Record<string, string>): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.put(`${SERVER_URL}/wc/v3/customers/${userId}`, { data: { billing, shipping } });
    } finally {
        await ctx.dispose();
    }
}

async function deleteProduct(id: string | undefined): Promise<void> {
    if (!id) {
        return;
    }
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.delete(`${SERVER_URL}/wc/v3/products/${id}?force=true`);
    } finally {
        await ctx.dispose();
    }
}

/** Click the first enabled block payment method that is NOT Express; returns its radio id (or null when none). */
async function selectAnotherBlockGateway(page: Page): Promise<string | null> {
    const expressId = 'radio-control-wc-payment-method-options-dokan_stripe_express';
    const radios = page.locator('input[id^="radio-control-wc-payment-method-options-"]');
    await radios.first().waitFor({ state: 'attached', timeout: 15_000 }).catch(() => undefined);
    const ids = await radios.evaluateAll(els => els.map(el => (el as HTMLInputElement).id).filter(Boolean));
    const otherId = ids.find(id => id !== expressId) ?? null;
    if (!otherId) {
        return null;
    }
    await page.locator(`label[for="${otherId}"]`).click();
    return otherId;
}

test.beforeAll(async () => {
    await ensureStripeExpressConfigured();
    await ensureCustomerAddress();
    // vendor1 = connected; vendor2 = explicitly NOT connected (SE-EDGE-05 buys a vendor2 product).
    await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
    await removeStripeExpressConnectedVendor(VENDOR2_ID);
    await ensureBacsEnabled();
    const api = new ApiUtils(await request.newContext());
    const [, v1] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Express Edge Connected Product' }, payloads.vendorAuth);
    const [, v2] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Express Edge NonConnected Product' }, payloads.vendor2Auth);
    connectedProductId = v1;
    nonConnectedProductId = v2;
    await api.dispose();
});

test.afterAll(async () => {
    await removeStripeExpressConnectedVendor(VENDOR_ID);
    await deleteProduct(connectedProductId);
    await deleteProduct(nonConnectedProductId);
    // Final safety net: restore the working gateway config in case a mutation test left it disabled/keyless.
    await ensureStripeExpressConfigured();
});

test.describe('Stripe Express — edge & resilience @pro', () => {
    test.describe.configure({ timeout: EDGE_TIMEOUT });

    // ---- SE-EDGE-02 — empty cart offers no Express method ----

    test('SE-EDGE-02: an empty cart offers no Express payment method on block checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            // Navigate to the block checkout DIRECTLY — gotoBlockCheckout waits on the place-order button,
            // which an empty cart never renders.
            await page.goto(stripe.checkout.blockUrl);
            await page.waitForLoadState('networkidle').catch(() => undefined);
            await expect(page.locator(stripe.blockSelectors.gatewayRadio), 'an empty cart must not offer the Express method').toHaveCount(0, { timeout: 15_000 });
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-EDGE-03 — switch gateway away + back → PE re-mounts cleanly ----

    test('SE-EDGE-03: switching away from Express to another gateway and back re-mounts the Payment Element cleanly', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(connectedProductId);
            await stripe.gotoBlockCheckout();
            // Select Express → the Payment Element mounts (#1).
            await stripe.selectBlockGateway();
            await stripe.assertBlockPaymentElementReady();
            // Switch AWAY to another enabled gateway.
            const otherId = await selectAnotherBlockGateway(page);
            if (!otherId) {
                log.skip('SE-EDGE-03: no second block payment gateway is enabled on this site — the away/back switch needs a non-Express method to select. Render-only re-mount cannot be driven here.');
                test.skip(true, 'No second block payment gateway available to switch to.');
                return;
            }
            // The Express PE should detach while another method is selected.
            await expect(page.locator(stripe.checkout.blockMount), 'the Express PE should detach when another gateway is selected').toBeHidden({ timeout: 15_000 });
            // Switch BACK to Express → the PE must re-mount cleanly (no init error, real card iframe).
            await stripe.selectBlockGateway();
            await stripe.assertBlockPaymentElementReady();
            // Prove the re-mounted element is fully functional by completing the purchase on it.
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            // The helper asserts a NEW paid order settled and returns its id (on CI the in-page confirm is
            // hCaptcha-blocked so the SPA never redirects — assert the settled order, not the URL).
            const orderId = await stripe.placeBlockOrderExpectReceived();
            expect(Number(orderId), 'the re-mounted Express PE should settle a paid order').toBeGreaterThan(0);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-EDGE-04 — failed payment can be retried on the same checkout (update_failed_order path) ----

    test('SE-EDGE-04: a declined payment can be retried in the same block checkout session and then succeeds', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(connectedProductId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            // Capture the baseline BEFORE the declined attempt: the block reuses its draft order across the
            // retry, so the paid order the retry produces has the same id as the draft created here. A
            // baseline taken after the decline would equal that id and the settle check would never match.
            const baseline = await stripe.stripeOrderBaseline();
            // First attempt: a declined card surfaces an inline error and creates no paid order.
            await stripe.fillCardDetails(STRIPE_CARDS.declined);
            await stripe.placeBlockOrderExpectError();
            // Retry on the SAME checkout (the block reuses its draft order): a valid card now succeeds.
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            // Assert the settled paid order (helper return), not the URL — hCaptcha blocks the in-page confirm
            // on CI so the SPA never redirects even though the retry payment settled server-side.
            const orderId = await stripe.placeBlockOrderExpectReceived(baseline);
            expect(Number(orderId), 'the retry with a valid card should settle a paid order').toBeGreaterThan(0);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-EDGE-05 — Express is NOT offered for a non-connected-vendor cart ----

    test('SE-EDGE-05: Stripe Express is NOT offered at checkout when the cart vendor is not connected', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            // vendor2 is intentionally NOT connected (see beforeAll). Stripe Express requires EVERY cart
            // vendor to be connected + payout-activated (Order::validate_cart_items → is_seller_activated):
            // it must NOT accept a payment it cannot pay out, so the method is ABSENT at checkout. (This
            // corrects the catalog premise that the gateway is "available regardless of connection".)
            await stripe.addProductToCart(nonConnectedProductId);
            await stripe.gotoBlockCheckout();
            // Prove the block payment methods rendered (BACS is enabled in beforeAll) before asserting absence.
            await expect(page.locator('input[id^="radio-control-wc-payment-method-options-"]').first(), 'block payment methods should render').toBeVisible({ timeout: 30_000 });
            await expect(page.locator(stripe.blockSelectors.gatewayRadio), 'Express must NOT be offered when a cart vendor is not connected').toHaveCount(0);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-EDGE-06 — long / unicode billing passes through without breaking the PE ----

    test('SE-EDGE-06: very long / unicode billing details pass through to Stripe without breaking the Payment Element', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        const longUnicodeFirst = 'Renée-Ünüçödé-名前-' + 'あ'.repeat(12);
        const longUnicodeLast = 'Tëst-Sürñámé-日本語-' + 'Ω'.repeat(12);
        const longUnicodeAddr = 'Straße Ñoño 日本語 番地 ' + 'Ä'.repeat(48);
        const billing = { first_name: longUnicodeFirst, last_name: longUnicodeLast, company: '', address_1: longUnicodeAddr, address_2: '', city: 'New York', state: 'NY', postcode: '10003', country: 'US', email: 'customer1@email.com', phone: MOBILE_TEST_PHONE };
        const shipping = { first_name: longUnicodeFirst, last_name: longUnicodeLast, company: '', address_1: longUnicodeAddr, address_2: '', city: 'New York', state: 'NY', postcode: '10003', country: 'US' };
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            await setCustomerAddress(CUSTOMER_ID, billing, shipping);
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(connectedProductId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            // The PE must mount cleanly despite the long/unicode billing pre-fill.
            await stripe.assertBlockPaymentElementReady();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            // Assert the settled paid order (helper return), not the browser URL — the in-page confirm is
            // hCaptcha-blocked on CI so the SPA never redirects even though the payment settled.
            const orderId = await stripe.placeBlockOrderExpectReceived();
            expect(Number(orderId), 'long/unicode billing should still settle a paid Express order').toBeGreaterThan(0);
        } finally {
            // Restore the customer's standard address so later specs pre-fill predictably.
            await ensureCustomerAddress();
            await page.close();
            await ctx.close();
        }
    });
});

test.describe.serial('Stripe Express — edge gateway-config mutations @pro', () => {
    test.describe.configure({ timeout: EDGE_TIMEOUT });

    // Restore the full working gateway config after the mutating cases (each also restores in its finally).
    test.afterAll(async () => {
        await ensureStripeExpressConfigured();
    });

    // ---- SE-EDGE-01 — gateway disabled mid-session → not offered after reload ----

    test('SE-EDGE-01: a gateway disabled mid-session is no longer offered on the already-open checkout after reload', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        const customerCtx = await browser.newContext({ storageState: customerAuth });
        const page = await customerCtx.newPage();
        const adminCtx = await browser.newContext({ storageState: adminAuth });
        const adminPage = await adminCtx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(connectedProductId);
            await stripe.gotoBlockCheckout();
            // Express IS offered to start (mid-session precondition).
            await stripe.selectBlockGateway();
            await expect(page.locator(stripe.blockSelectors.gatewayRadio), 'Express should be offered before it is disabled').toBeVisible();
            // Admin disables the gateway (enabled → off) while the customer's checkout is open.
            await new StripeExpressPage(adminPage).configureGateway({
                publishable: STRIPE_EXPRESS_KEYS.publishable,
                secret: STRIPE_EXPRESS_KEYS.secret,
                enable: false,
            });
            // Reloading the customer's checkout no longer offers Express.
            await page.reload();
            await page.waitForLoadState('networkidle').catch(() => undefined);
            await expect(page.locator(stripe.blockSelectors.gatewayRadio), 'a disabled gateway must not be offered after reload').toHaveCount(0, { timeout: 15_000 });
        } finally {
            // Restore the full working config immediately (afterAll also restores as a safety net).
            await ensureStripeExpressConfigured();
            await page.close();
            await customerCtx.close();
            await adminPage.close();
            await adminCtx.close();
        }
    });

    // ---- SE-EDGE-07 — gateway keys removed mid-flow → in-flight submit errors, no order ----

    test('SE-EDGE-07: clearing the gateway keys mid-flow makes the in-flight checkout submit error and place no order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        const customerCtx = await browser.newContext({ storageState: customerAuth });
        const page = await customerCtx.newPage();
        const adminCtx = await browser.newContext({ storageState: adminAuth });
        const adminPage = await adminCtx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(connectedProductId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.assertBlockPaymentElementReady();
            // Card entered while the gateway is still API-ready.
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            // Admin clears the API keys mid-flow → the server can no longer create/confirm a PaymentIntent
            // (gateway stays "enabled" but is not ready). The in-flight submit must fail.
            await new StripeExpressPage(adminPage).configureGateway({ publishable: '', secret: '', enable: true });
            await stripe.placeBlockOrderExpectError();
        } finally {
            await ensureStripeExpressConfigured();
            await page.close();
            await customerCtx.close();
            await adminPage.close();
            await adminCtx.close();
        }
    });
});
