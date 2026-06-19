import { test, expect, request, Browser } from '@utils/test';
import { log } from '@utils/logger';
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
    getStripeChargeIdForOrder,
    getStripeIntentIdForOrder,
    getOrderStatus,
    getOrderNotes,
    injectStripeWebhook,
} from './helpers';

/**
 * Suite J — Stripe Connect webhook handlers (the WebhooksEvents/* classes dispatched from
 * ?wc-api=dokan_stripe → EventFactory::get($event)->handle()).
 *
 * localhost cannot receive real Stripe webhooks, so these tests inject events DIRECTLY into the
 * EventFactory + handler via the test mu-plugin (helpers.injectStripeWebhook → dokan-test/v1/
 * stripe-webhook). The handler runs against a REAL charge/intent from a real order, so its Stripe
 * API reads (Charge::retrieve, etc.) resolve. The injector reports whether handle() threw and
 * whether the throw was a PHP \Error (an uncatchable-in-prod fatal).
 *
 * OPTIONAL faithful path: with the Stripe CLI you can instead forward real events —
 *   stripe listen --forward-to "http://localhost:9999/?wc-api=dokan_stripe"
 *   stripe trigger charge.dispute.created
 * — which exercises the live endpoint (and proves the missing signature check, R2). The injection
 * path is the default because it needs no external process and runs in CI.
 */
test.describe.serial('Stripe Connect — Suite J (webhook handlers)', () => {
    test.describe.configure({ timeout: 180_000 });

    let productId: string;

    /** Place a single-vendor (non-subscription) order as the customer; return its order id. */
    async function placeNormalOrder(browser: Browser): Promise<string | undefined> {
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
            return page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
    }

    test.beforeAll(async () => {
        await ensureCustomerAddress();
        // A placeholder connected vendor is enough: the charge lands on the platform account, and the
        // dispute handler reads the charge (not a vendor transfer), so no real connected account is needed.
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
        productId = id;
    });

    test.afterAll(async () => {
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    });

    // J6 / R-dispute (CONFIRMED bug): ChargeDisputeCreated::handle() assumes the disputed charge belongs to a
    // subscription invoice — it does Invoice::retrieve($charge->invoice) and get_vendor_id_by_subscription(...),
    // then $order->set_status() on the result. For a NORMAL (non-subscription) order the charge has no invoice,
    // so the handler throws / fatals on a perfectly valid Stripe event. A webhook handler must never crash on a
    // valid event (Stripe will retry, and a fatal can corrupt processing). This asserts the CORRECT invariant
    // (handle() does NOT throw); test.fail() runs it as an expected failure so CI exercises the path and pins the
    // bug — PASS while present, FLIPS to a real failure once the handler tolerates non-subscription disputes.
    test('J6: charge.dispute.created on a NORMAL (non-subscription) order must not crash the webhook handler', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.fail(true, 'R-dispute: ChargeDisputeCreated::handle() assumes invoice/subscription → throws/fatals on a normal-order dispute (ChargeDisputeCreated.php:42-53). Expected-fail until fixed; see bugs-found.md');

        const orderId = await placeNormalOrder(browser);
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();

        const chargeId = await getStripeChargeIdForOrder(orderId as string);
        const result = await injectStripeWebhook({
            type: 'charge.dispute.created',
            data_object: {
                id: 'dp_e2e_test',
                object: 'dispute',
                charge: chargeId,
                status: 'needs_response',
                reason: 'fraudulent',
            },
        });

        log.info(`charge.dispute.created on a normal order → threw=${result.threw} fatal=${result.fatal} error=${result.error ?? 'none'}`);
        expect(
            result.threw,
            `a charge.dispute.created webhook on a normal order must be handled without throwing/fataling (got: ${result.error ?? 'no error'})`,
        ).toBe(false);
        log.success('J6: normal-order dispute handled without crashing the webhook handler');
    });

    // J3 / out-of-order: PaymentIntentPaymentFailed::handle() flips ANY non-failed order to 'failed' with NO guard
    // that the order is already PAID. A stale / out-of-order / retried `payment_intent.payment_failed` arriving
    // AFTER a successful payment therefore knocks a paid order back to 'failed' (lost sale). The CORRECT invariant
    // is "a paid order must not be flipped to failed by a later failure event"; test.fail() pins the missing guard.
    test('J3: a stale payment_intent.payment_failed must NOT flip an already-paid order to failed', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.fail(true, 'R-J3: PaymentIntentPaymentFailed has no is_paid() guard → a stale failure event flips a paid order to failed (PaymentIntentPaymentFailed.php:49-64). Expected-fail until guarded.');

        const orderId = await placeNormalOrder(browser);
        expect(orderId, 'captured the order id').toBeTruthy();
        const paidStatus = await getOrderStatus(orderId as string);
        expect(paidStatus, 'order should be paid (processing/completed) before the stale event').toMatch(/processing|completed/);

        const intentId = await getStripeIntentIdForOrder(orderId as string);
        await injectStripeWebhook({
            type: 'payment_intent.payment_failed',
            data_object: { id: intentId, object: 'payment_intent', last_payment_error: { message: 'stale out-of-order failure (e2e)' } },
        });

        const after = await getOrderStatus(orderId as string);
        log.info(`order ${orderId} status after a stale payment_intent.payment_failed: ${after}`);
        expect(after, 'a paid order must not be flipped to failed by a stale/out-of-order failure event').not.toBe('failed');
        log.success('J3: paid order survived a stale payment_intent.payment_failed');
    });

    // charge.refunded (positive path) — ChargeRefunded::handle() reconciles a Stripe-side refund by adding an
    // order note. This is a GENUINE green test: it proves (a) the webhook-injection harness drives a real handler
    // to an observable effect, and (b) refund/transfer-style order notes DO render on the order (the Admin
    // "order notes" surface the audit flagged as zero-coverage). No real connected account needed.
    test('charge.refunded webhook adds a reconciliation order note', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');

        const orderId = await placeNormalOrder(browser);
        expect(orderId, 'captured the order id').toBeTruthy();
        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const chargeId = await getStripeChargeIdForOrder(orderId as string);

        const result = await injectStripeWebhook({
            type: 'charge.refunded',
            data_object: { id: chargeId, object: 'charge', payment_intent: intentId, amount_refunded: 100, refunded: true },
        });
        expect(result.threw, `charge.refunded must be handled without error (got: ${result.error ?? 'no error'})`).toBe(false);

        const notes = await getOrderNotes(orderId as string);
        expect(
            notes.some(n => /charge\.refunded webhook received/i.test(n)),
            `the order should carry the charge.refunded reconciliation note (notes: ${JSON.stringify(notes)})`,
        ).toBe(true);
        log.success('charge.refunded: reconciliation order note rendered on the order');
    });
});
