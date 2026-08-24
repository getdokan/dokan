import { test, expect, request } from '@utils/test';
import { SERVER_URL, toPath } from '@utils/helpers';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads, MOBILE_TEST_PHONE } from '@utils/payloads';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECT_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { VENDOR_ID, CUSTOMER_ID, customerAuth, hasCredentials, ensureStripeConnectConfigured, restoreStripeExpress, ensureClassicCheckoutPage, ensureCustomerAddress, seedStripeConnectVendor, removeStripeConnectVendor, getOrderStatus, getConnectIntentIdForOrder, getOrderNotes } from './helpers';

/**
 * Stripe Connect — card checkout on both checkout surfaces (SCPE-01/02/03/06/07).
 *
 * Happy paths prove a card charge settles a real order on the block and classic checkouts, as a
 * guest and as a logged-in customer. Negative paths prove a declined card surfaces a readable error
 * and creates NO paid order.
 *
 * Serial because beforeAll flips the site's active Stripe gateway to Connect (Express and Connect
 * are mutually exclusive — only one can own the checkout) and seeds the shared vendor as connected.
 * afterAll puts Express back so an Express spec sharing the shard still finds its own gateway.
 */
test.describe.serial('Stripe Connect — card checkout @pro', () => {
    // 240s: matches the Express card+confirm+fallback specs. On CI the SPA redirect to
    // order-received is unreliable, so the budget has to cover the wasted redirect wait AND the
    // server-side settle poll that actually decides the verdict.
    test.describe.configure({ timeout: 240_000 });

    const guestBilling = {
        email: 'guest.block.stripeconnect@example.com',
        firstName: 'Guest',
        lastName: 'Buyer',
        address: '123 Test Street',
        city: 'New York',
        state: 'NY',
        postcode: '10001',
        country: 'US',
        phone: MOBILE_TEST_PHONE,
    };

    let productId: string;
    let productPrice: number;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        await ensureClassicCheckoutPage();
        await ensureCustomerAddress();
        await seedStripeConnectVendor(VENDOR_ID, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1);

        // A dedicated product with a known price, so the expected order total is recomputed from
        // the fixture rather than hardcoded against whatever the site happened to be seeded with.
        const api = new ApiUtils(await request.newContext());
        const payload = { ...payloads.createProduct(), name: 'Stripe Connect Checkout Product' };
        const [, id] = await api.createProduct(payload, payloads.vendorAuth);
        productId = id;
        productPrice = Number(payload.regular_price);
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await removeStripeConnectVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
        // Hand the checkout back to Stripe Express.
        await restoreStripeExpress();
    });

    /** The order total the site actually charged, read back from WC REST. */
    async function orderTotal(orderId: string): Promise<number> {
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=total,payment_method`);
            const body = (await res.json()) as { total: string; payment_method: string };
            expect(body.payment_method, 'the order must have been paid through the Stripe Connect gateway').toBe(StripeConnectPage.GATEWAY_ID);
            return Number(body.total);
        } finally {
            await ctx.dispose();
        }
    }

    // ---- SCPE-01 — guest, block checkout ----

    test('SCPE-01: a guest pays with a card on the block checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        // NO storageState → a real guest with a fresh, empty session cart.
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails(guestBilling);
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);

            const orderId = await test.step('place the order', async () => stripe.placeBlockOrderExpectReceived());

            await test.step('the order settled and was charged through Stripe Connect', async () => {
                expect(await getOrderStatus(orderId), 'a paid card order should reach a paid status').toMatch(/processing|completed/);
                expect(await orderTotal(orderId), 'the order total should be at least the product price').toBeGreaterThanOrEqual(productPrice);
                // A PaymentIntent id on the order is the proof the money leg actually ran; an order
                // can otherwise reach "processing" for reasons that have nothing to do with Stripe.
                expect(await getConnectIntentIdForOrder(orderId), 'the order must carry a Stripe PaymentIntent id').toMatch(/^pi_/);
            });
            log.success(`SCPE-01 order ${orderId} paid on the block checkout`);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SCPE-02 — guest, classic checkout ----

    test('SCPE-02: a guest pays with a card on the classic checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.selectClassicGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);

            const orderId = await test.step('place the order', async () => stripe.placeClassicOrderExpectReceived());

            await test.step('the order settled and was charged through Stripe Connect', async () => {
                expect(await getOrderStatus(orderId), 'a paid card order should reach a paid status').toMatch(/processing|completed/);
                expect(await orderTotal(orderId), 'the order total should be at least the product price').toBeGreaterThanOrEqual(productPrice);
                expect(await getConnectIntentIdForOrder(orderId), 'the order must carry a Stripe PaymentIntent id').toMatch(/^pi_/);
            });
            log.success(`SCPE-02 order ${orderId} paid on the classic checkout`);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SCPE-03 — logged-in customer, block checkout ----

    test('SCPE-03: a logged-in customer pays on the block checkout and sees exactly one order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);

            const orderId = await test.step('place the order', async () => stripe.placeBlockOrderExpectReceived());

            await test.step('the order settled', async () => {
                expect(await getOrderStatus(orderId), 'a paid card order should reach a paid status').toMatch(/processing|completed/);
                expect(await getConnectIntentIdForOrder(orderId), 'the order must carry a Stripe PaymentIntent id').toMatch(/^pi_/);
            });

            await test.step('My Account lists that order exactly once after a hard reload', async () => {
                await page.goto(toPath('my-account/orders'));
                await page.reload();
                const rows = page.locator(`.woocommerce-orders-table__row:has-text("${orderId}")`);
                await expect(rows, 'the paid order should appear exactly once in My Account → Orders').toHaveCount(1);
            });
            log.success(`SCPE-03 order ${orderId} paid as a logged-in customer`);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SC-48 (Tier 3, validated here) — the completion note must describe what happened ----

    test('SC-48: a non-3DS payment must not be described as "3d secure" in the order notes', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        // The browser work is finished and the context closed BEFORE the expected-failure assertion.
        // Throwing inside a try/finally that still owns a page makes the cleanup itself error, and
        // that cleanup error is reported instead of the expected failure.
        let completion = '';
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails({ ...guestBilling, email: 'guest.note.stripeconnect@example.com' });
            await stripe.selectBlockGateway();
            // The plain test card. Stripe presents NO challenge for it, which is the entire premise.
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            const orderId = await stripe.placeBlockOrderExpectReceived();
            const notes = await getOrderNotes(orderId);
            completion = notes.find(n => /payment is completed via/i.test(n)) ?? '';
            log.info(`SC-48 order ${orderId} completion note: ${completion}`);
        } finally {
            await page.close();
            await ctx.close();
        }

        expect(completion, 'the order should carry a completion note at all').toBeTruthy();

        /*
         * CONFIRMED DEFECT — getdokan/plugin-internal-tasks#2299 (the first of its two claims).
         * Independently reproduced here: orders 34, 35, 36, all paid with 4242 4242 4242 4242 and
         * never challenged, each carry "payment is completed via Stripe Connect 3d secure."
         *
         * It moves no money, but it is the record support and finance read when answering a
         * chargeback, and it asserts an authentication that never happened.
         *
         * test.fail() is imperative, one line before the failing assertion, so the positive control
         * above (a completion note exists at all) still reports honestly.
         */
        test.fail();
        expect(completion.toLowerCase(), 'a payment with no 3DS challenge must not be recorded as "3d secure"').not.toContain('3d secure');
    });

    // ---- SCPE-06 — declined card, block checkout ----

    test('SCPE-06: a declined card on the block checkout fails cleanly', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails({ ...guestBilling, email: 'guest.declined.stripeconnect@example.com' });
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.declined);

            // placeBlockOrderExpectError asserts the visible error, the absence of a redirect, AND
            // that no NEW paid Stripe Connect order appeared — the last of those is what stops a
            // "clean failure" that quietly charged someone.
            await test.step('place the order and expect a decline', async () => stripe.placeBlockOrderExpectError());

            await test.step('the cart is still usable for a retry', async () => {
                await page.goto(toPath('cart'));
                await expect(page.locator('body'), 'a declined payment must leave the cart intact').not.toContainText(/your cart is currently empty/i);
            });
            log.success('SCPE-06 declined card surfaced an error and created no paid order');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SCPE-07 — declined card, classic checkout ----

    test('SCPE-07: a declined card on the classic checkout fails cleanly', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.selectClassicGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.declined);

            await test.step('place the order and expect a decline', async () => stripe.placeClassicOrderExpectError());

            await test.step('the cart is still usable for a retry', async () => {
                await page.goto(toPath('cart'));
                await expect(page.locator('body'), 'a declined payment must leave the cart intact').not.toContainText(/your cart is currently empty/i);
            });
            log.success('SCPE-07 declined card surfaced an inline error and created no paid order');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});
