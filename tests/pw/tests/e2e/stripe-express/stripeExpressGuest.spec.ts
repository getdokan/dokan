import { test, expect } from '@utils/test';
import { log } from '@utils/logger';
import { StripeExpressPage } from './stripeExpressPage';
import { hasCredentials, CREDENTIALS_SKIP, PRODUCT_V1, ensureStripeExpressConfigured, ensureClassicCheckoutPage, seedStripeExpressConnectedVendor, removeStripeExpressConnectedVendor, getOrderSummary, VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS } from './helpers';

/**
 * Stripe Express — guest checkout (DOK-TC-SE-69 / -70).
 *
 * A guest is a distinct payment path, not a variant of the logged-in one: there is no WooCommerce
 * customer to attach the PaymentIntent to, so the order must settle with `customer_id = 0` while
 * still recording the billing details the buyer typed. Both checkout surfaces are covered because
 * they mount the Payment Element differently — blocks in-page, classic through the shortcode.
 */
test.describe.serial('Stripe Express — guest checkout @pro', () => {
    test.describe.configure({ timeout: 240_000 });

    test.beforeAll(async () => {
        await ensureStripeExpressConfigured();
        // A fresh environment has no classic-checkout page, and gotoClassicCheckout then lands on the
        // 404 with #place_order never rendering. Local runs hide this because an earlier run already
        // created the page; CI does not. Dropping this call is what broke SE-GUEST-02 on run 32354048263.
        await ensureClassicCheckoutPage();
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
    });

    test.afterAll(async () => {
        await removeStripeExpressConnectedVendor(VENDOR_ID);
    });

    test('SE-GUEST-01: a guest buys via Stripe Express on block checkout → order received', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        const email = 'guest.block.stripeexpress@example.com';

        const orderId = await StripeExpressPage.placeGuestBlockOrder(browser, PRODUCT_V1, email);

        const order = await getOrderSummary(orderId);
        expect(order.payment_method, 'guest order paid via the Stripe Express gateway').toBe(StripeExpressPage.GATEWAY_ID);
        expect(order.status, 'guest order should settle to a paid status').toMatch(/processing|completed/);
        expect(order.customer_id, 'the order was placed as a GUEST (customer_id 0), not silently attached to an account').toBe(0);
        expect(order.billing_email, 'the guest billing email was captured on the order').toBe(email);
        log.success(`SE-GUEST-01: guest order ${orderId} settled on block checkout`);
    });

    test('SE-GUEST-02: a guest buys via Stripe Express on classic checkout → order received', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        const email = 'guest.classic.stripeexpress@example.com';

        const orderId = await StripeExpressPage.placeGuestClassicOrder(browser, PRODUCT_V1, email);

        const order = await getOrderSummary(orderId);
        expect(order.payment_method, 'guest order paid via the Stripe Express gateway').toBe(StripeExpressPage.GATEWAY_ID);
        expect(order.status, 'guest order should settle to a paid status').toMatch(/processing|completed/);
        expect(order.customer_id, 'the order was placed as a GUEST (customer_id 0), not silently attached to an account').toBe(0);
        expect(order.billing_email, 'the guest billing email was captured on the order').toBe(email);
        log.success(`SE-GUEST-02: guest order ${orderId} settled on classic checkout`);
    });
});
