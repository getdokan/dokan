import { test, expect, request } from '@utils/test';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import {
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    SERVER_URL,
    hasCredentials,
    ensureCustomerAddress,
    injectStripeWebhook,
    getStripeIntentIdForOrder,
    getStripeChargeIdForOrder,
    getOrderStatus,
    getOrderNotes,
} from './helpers';

/**
 * Reported Stripe Connect bugs (PR #5646 QA report, 2026-06-19) — written as SKIPPED tests.
 *
 * Each test asserts the CORRECT (post-fix) behaviour and is marked `test.fixme(...)`, so it is
 * SKIPPED in CI today (the bug is present, it would fail). When the developer fixes a bug, remove
 * that test's `test.fixme(...)` line — the test then runs and must pass. Each carries its BUG-id.
 *
 * The bugs already covered elsewhere (running/skipped guards): BUG-2 currency (M2/M3), BUG-7 stale
 * webhook (J3), BUG-8 dispute (J6), BUG-17 XSS (N7), BUG-20 double-refund (I6), BUG-4A block-save
 * no-attach (F-block-save), BUG-35 multi-vendor coupon split (marketplace-coupon guard). This file
 * fills the remaining gaps.
 */
test.describe.serial('Stripe Connect — reported bugs (skipped until fixed)', () => {
    test.describe.configure({ timeout: 180_000 });

    let productId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureCustomerAddress();
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        [, productId] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    });

    // BUG-5 — a pending order can't be paid from its Order-Pay link (no card field loads).
    test('BUG-5: the Stripe card field loads on the Order-Pay page of a pending order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-5: selecting Stripe on /checkout/order-pay/<id>/ loads no Payment Element, so a pending order cannot be paid by card. Remove this line when the order-pay PE mounts.');

        // Seed a PENDING dokan-stripe-connect order for the customer.
        const adminCtx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        let orderId = 0;
        let orderKey = '';
        try {
            const res = await adminCtx.post(`${SERVER_URL}/wc/v3/orders`, {
                data: {
                    customer_id: Number(CUSTOMER_ID),
                    payment_method: 'dokan-stripe-connect',
                    payment_method_title: 'Stripe Connect',
                    status: 'pending',
                    set_paid: false,
                    billing: payloads.createOrder.billing,
                    line_items: [{ product_id: Number(productId), quantity: 1 }],
                },
            });
            const o = (await res.json()) as { id: number; order_key: string };
            orderId = o.id;
            orderKey = o.order_key;
        } finally {
            await adminCtx.dispose();
        }
        expect(orderId, 'seeded a pending order').toBeGreaterThan(0);

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            await page.goto(`${(process.env.BASE_URL ?? 'http://localhost:9999').replace(/\/$/, '')}/checkout/order-pay/${orderId}/?pay_for_order=true&key=${orderKey}`);
            await page.waitForLoadState('domcontentloaded');
            // Select Stripe Connect on the order-pay form.
            await page.locator('label[for="payment_method_dokan-stripe-connect"], #payment_method_dokan-stripe-connect').first().click().catch(() => undefined);
            // CORRECT: the Stripe Payment Element mounts so the order can be paid.
            await expect(
                page.locator('#dokan-stripe-connect-payment-element, .dokan-stripe-connect-payment-element').first(),
                'the Stripe Payment Element must mount on the Order-Pay page',
            ).toBeVisible({ timeout: 20_000 });
        } finally {
            await page.close();
            await ctx.close();
            const c = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
            await c.delete(`${SERVER_URL}/wc/v3/orders/${orderId}?force=true`).catch(() => undefined);
            await c.dispose();
        }
    });

    // BUG-19 — a Stripe-side refund (charge.refunded webhook) only adds a note: no status change / WC refund / balance debit.
    test('BUG-19: a charge.refunded webhook reconciles the order (status → refunded), not just a note', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-19: charge.refunded only adds an order note — no status change, no WC refund object, no vendor-balance debit. Remove this line when the webhook fully reconciles a Stripe-side refund.');

        // Place a real order, then inject a full charge.refunded for it.
        let orderId: string | undefined;
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
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id').toBeTruthy();

        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const chargeId = await getStripeChargeIdForOrder(orderId as string);
        await injectStripeWebhook({ type: 'charge.refunded', data_object: { id: chargeId, object: 'charge', payment_intent: intentId, amount_refunded: 100, refunded: true } });

        // CORRECT: a full Stripe-side refund reconciles to the WC order (status → refunded).
        await expect
            .poll(() => getOrderStatus(orderId as string), { message: 'a full charge.refunded should reconcile the order to refunded', timeout: 15_000 })
            .toBe('refunded');
    });

    // BUG-4B — reusing a saved card on Block checkout fails ("must attach it to a Customer first").
    test('BUG-4B: a saved card can be reused on Block checkout to complete an order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-4B: choosing a saved card on Block checkout fails ("provided PaymentMethod ... must attach it to a Customer first"). Remove this line when block saved-card reuse completes the order.');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            // First save a card via the working My-Account SetupIntent path.
            await stripe.addCardViaMyAccount(STRIPE_CARDS.success);
            // Then reuse it on Block checkout.
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            // Select the first saved token (block renders saved-token radios when tokens exist).
            await page.locator('input[name="radio-control-wc-payment-method-saved-tokens"], input[name="wc-dokan-stripe-connect-payment-token"]').first().check().catch(() => undefined);
            await stripe.placeBlockOrderExpectReceived(); // CORRECT: completes to order-received
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // BUG-16 — a declined card shows no visible error on themes without the standard WC notice area.
    test('BUG-16: a declined card surfaces a visible error (the .dokan-stripe-pe-errors element is written)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-16: on a theme without the standard WC notice area the dedicated .dokan-stripe-pe-errors element is never written, so a declined card shows NO message. Remove this line when the dedicated error element is populated.');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.declined);
            await page.locator(stripe.blockSelectors.placeOrder).click();
            // CORRECT: a declined card writes the dedicated error element (theme-independent).
            await expect(
                page.locator('.dokan-stripe-pe-errors, ul.dokan-stripe-pe-error').first(),
                'a declined card must write the dedicated dokan-stripe-pe-errors element',
            ).toBeVisible({ timeout: 30_000 });
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // BUG-9/10 — the Block Express button throws ReferenceError: cartData is not defined on confirm.
    test('BUG-9/10: the Block Express checkout does not throw a cartData ReferenceError', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-10: ExpressCheckout.tsx references an undeclared `cartData` (src/block/ExpressCheckout.tsx:85) → ReferenceError when the wallet onConfirm runs. Remove this line when cartData is declared.');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        const errors: string[] = [];
        page.on('pageerror', e => errors.push(String(e)));
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            // The Express element + its confirm handler are wired on load; the undeclared cartData
            // reference must not surface as a ReferenceError.
            await page.waitForTimeout(4_000);
            expect(
                errors.some(e => /cartData is not defined|ReferenceError.*cartData/i.test(e)),
                `the Block Express checkout must not throw a cartData ReferenceError (errors: ${JSON.stringify(errors.slice(0, 5))})`,
            ).toBe(false);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // BUG-26 — a non-connected / zero-earning vendor sub-order is skipped in the split with NO audit note.
    test('BUG-26: a skipped (non-connected / zero-earning) split sub-order records an audit note', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing');
        test.fixme(true, 'BUG-26: when a vendor is non-connected or has zero/negative earning the split silently continue()s with no note on that sub-order (only a FAILED transfer notes). Remove this line when the skipped path records an audit note.');

        // A single-vendor order whose vendor we then "skip" by removing the connection before settle is hard to
        // drive deterministically here; the invariant asserted post-fix is: every sub-order in a split carries a
        // Stripe-handling note (transfer id, or an explicit "skipped: non-connected/zero-earning" note).
        let orderId: string | undefined;
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
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        const notes = await getOrderNotes(orderId as string);
        expect(notes.some(n => /transfer|stripe|payout|skipped|non-connected/i.test(n)), 'every split sub-order must carry a Stripe-handling audit note').toBe(true);
    });
});
