import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { customerAuth, VENDOR_ID, CUSTOMER_ID, SERVER_URL, hasCredentials, ensureCustomerAddress, getStripeIntentIdForOrder } from './helpers';

/**
 * Suite — shipping method on block checkout (the shipping half of the audit's C5
 * "coupon/shipping change re-mount" case; the coupon half is covered by C5 in
 * stripeConnectEdgeAdvertisement.spec.ts).
 *
 * Changing the shipping method fires WC update_checkout, which re-renders the totals and
 * RE-MOUNTS the Stripe Payment Element. This asserts the PE re-mounts cleanly on the change and
 * the succeeded PaymentIntent equals the NEW order total (with the new shipping cost) — proving
 * shipping is correctly priced into the charge and the re-mount did not strand a stale pre-change PI.
 */
test.describe.serial('Stripe Connect — Suite (shipping method change)', () => {
    test.describe.configure({ timeout: 150_000 });

    let productId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureCustomerAddress();
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        [, productId] = await api.createProduct({ ...payloads.createProduct(), regular_price: '40' }, payloads.vendorAuth);
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

    test('changing the shipping method re-mounts the PE and the succeeded PaymentIntent matches the new total', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');

        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            // Select Stripe Connect → PE mounts on the default (flat-rate) total.
            await stripe.selectBlockGateway();
            await stripe.assertBlockPaymentElementReady();

            // Switch to Free shipping → update_checkout re-renders the totals + RE-MOUNTS the PE.
            await stripe.selectBlockShippingMethod(/free shipping/i);
            await stripe.selectBlockGateway();
            await stripe.assertBlockPaymentElementReady(); // re-mounts cleanly — no "Could not initialize Stripe"

            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id from order-received').toBeTruthy();

        // The order carries the chosen (free) shipping + paid via the gateway.
        const octx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        let total = 0;
        try {
            const res = await octx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=total,shipping_total,payment_method,shipping_lines`);
            const o = (await res.json()) as { total: string; shipping_total: string; payment_method: string };
            total = parseFloat(o.total);
            expect(o.payment_method, 'paid via the Stripe Connect gateway').toBe('dokan-stripe-connect');
            // Free shipping took effect — the $10 flat rate is gone (proves the shipping change applied).
            expect(parseFloat(o.shipping_total), 'free shipping selected → order shipping_total is 0').toBe(0);
        } finally {
            await octx.dispose();
        }

        // The succeeded PaymentIntent equals the NEW order total (incl. the changed shipping), proving the
        // re-mount UPDATED the same PI rather than confirming a stale pre-change (flat-rate) intent.
        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const pi = await stripeApi.getPaymentIntent(intentId);
        expect(pi.status, 'the order PaymentIntent should be succeeded').toBe('succeeded');
        expect(Number(pi.amount_received ?? pi.amount), 'succeeded PI must equal the new order total (with the changed shipping)').toBe(Math.round(total * 100));
        log.success(`Shipping change: PE re-mounted and order ${orderId} charged the new total ${total} (free shipping)`);
    });
});
