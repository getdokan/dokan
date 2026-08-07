import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { StripeExpressPage, STRIPE_CARDS, STRIPE_EXPRESS_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    VENDOR_ID,
    hasCredentials,
    ensureStripeExpressConfigured,
    ensureClassicCheckoutPage,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
} from './helpers';

/**
 * Stripe Express — SE-GUEST (guest checkout, no login).
 *
 * Every other checkout spec runs as a logged-in customer (customerAuth). These cases exercise
 * a TRUE guest: a fresh browser context with NO storageState (empty session cart, customer_id 0),
 * paying a connected-vendor product via the Express gateway. Block + classic happy paths settle
 * to a paid GUEST order; a declined card surfaces an error and never reaches order-received.
 *
 * Serial because beforeAll seeds the shared vendor (VENDOR_ID) as a connected Express account and
 * configures the global gateway. Checkout/charge tests self-skip without keys (`!hasCredentials`).
 */
test.describe.serial('Stripe Express — SE-GUEST (guest checkout) @pro', () => {
    // 240s (not 150s): on CI runner IPs Stripe Link's invisible hCaptcha escalates to a visible
    // challenge that blocks the in-page card confirm, so the SPA never redirects to /order-received.
    // The order still settles via the server-side PaymentIntent-confirm fallback (real payment,
    // verified locally with SIMULATE_CONFIRM_BLOCK=1 ≈ 90s), but the wasted redirect wait + the
    // fallback poll overran the old 150s budget on the slower shared runner (all 3 attempts hit
    // exactly 150s). Match the sibling real-card+confirm+fallback specs (savedCards/settings/3ds).
    test.describe.configure({ timeout: 240_000 });

    let productId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeExpressConfigured();
        await ensureClassicCheckoutPage();
        // A connected-vendor product to buy. Guest checkout itself needs no saved address.
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Express Guest Product' }, payloads.vendorAuth);
        productId = id;
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    });

    // ---- SE-GUEST-01 — block checkout (the site default /checkout/) ----

    test('SE-GUEST-01: a guest buys via Stripe Express on block checkout → order received', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive the Payment Element');

        // NO storageState → a real guest with a fresh, empty session cart.
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        let orderId: string | undefined;
        try {
            const stripe = new StripeExpressPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails({
                email: 'guest.block.stripeexpress@example.com',
                firstName: 'Guest',
                lastName: 'Buyer',
                address: '123 Test Street',
                city: 'New York',
                state: 'NY',
                postcode: '10001',
                country: 'US',
            });
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            orderId = await stripe.placeBlockOrderExpectReceived();
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'guest reached order-received on block checkout').toBeTruthy();

        // The order is a GUEST order (customer_id 0) paid via the Stripe Express gateway.
        const ctx2 = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const res = await ctx2.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=status,payment_method,customer_id,billing`);
            const o = (await res.json()) as { status: string; payment_method: string; customer_id: number; billing: { email: string } };
            expect(o.payment_method, 'guest order paid via the Stripe Express gateway').toBe(StripeExpressPage.GATEWAY_ID);
            expect(o.status, 'guest order should settle to a paid status').toMatch(/processing|completed/);
            expect(o.customer_id, 'order was placed as a GUEST (customer_id 0)').toBe(0);
            expect(o.billing?.email, 'guest billing email was captured').toBe('guest.block.stripeexpress@example.com');
        } finally {
            await ctx2.dispose();
        }
        log.success(`SE-GUEST-01: guest bought via Stripe Express (block) → guest order ${orderId} settled`);
    });

    // ---- SE-GUEST-02 — classic checkout ([woocommerce_checkout] shortcode page) ----

    test('SE-GUEST-02: a guest buys via Stripe Express on classic checkout → order received', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive the Payment Element');

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        let orderId: string | undefined;
        try {
            const stripe = new StripeExpressPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic({
                firstName: 'Guest',
                lastName: 'Buyer',
                email: 'guest.classic.stripeexpress@example.com',
                phone: '+14152367890',
                address1: '123 Test Street',
                city: 'New York',
                postcode: '10001',
                country: 'US',
                state: 'NY',
            });
            await stripe.selectClassicGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            orderId = await stripe.placeClassicOrderExpectReceived();
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'guest reached order-received on classic checkout').toBeTruthy();

        const ctx2 = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const res = await ctx2.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=status,payment_method,customer_id,billing`);
            const o = (await res.json()) as { status: string; payment_method: string; customer_id: number; billing: { email: string } };
            expect(o.payment_method, 'guest order paid via the Stripe Express gateway').toBe(StripeExpressPage.GATEWAY_ID);
            expect(o.status, 'guest order should settle to a paid status').toMatch(/processing|completed/);
            expect(o.customer_id, 'order was placed as a GUEST (customer_id 0)').toBe(0);
            expect(o.billing?.email, 'guest billing email was captured').toBe('guest.classic.stripeexpress@example.com');
        } finally {
            await ctx2.dispose();
        }
        log.success(`SE-GUEST-02: guest bought via Stripe Express (classic) → guest order ${orderId} settled`);
    });

    // ---- SE-GUEST-03 — declined guest → error, no order ----

    test('SE-GUEST-03: a guest with a declined card sees an error and no order is placed', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive the Payment Element');

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails({
                email: 'guest.declined.stripeexpress@example.com',
                firstName: 'Guest',
                lastName: 'Declined',
                address: '123 Test Street',
                city: 'New York',
                state: 'NY',
                postcode: '10001',
                country: 'US',
            });
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.declined);
            // Asserts the inline block error surfaces AND the page never reaches order-received.
            await stripe.placeBlockOrderExpectError();
        } finally {
            await page.close();
            await ctx.close();
        }
        log.success('SE-GUEST-03: guest declined card surfaced an error and placed no order');
    });
});
