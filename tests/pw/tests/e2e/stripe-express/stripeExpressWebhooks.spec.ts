import { test, expect, request, Browser } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeExpressPage, STRIPE_CARDS } from './stripeExpressPage';
import {
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    hasCredentials,
    HAS_REAL_CONNECTED_ACCOUNTS,
    STRIPE_EXPRESS_CONNECTED_ACCOUNTS,
    ensureStripeExpressConfigured,
    ensureCustomerAddress,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
    getStripeIntentIdForOrder,
    getStripeChargeIdForOrder,
    getOrderStatus,
    getOrderNotes,
    setOrderStatus,
    injectStripeWebhook,
    postWebhookEvent,
} from './helpers';

/**
 * Stripe Express — Webhooks (SE-WH 01..17).
 *
 * Endpoint: `?wc-api=dokan-stripe-express` (hyphens; the gateway id uses underscores).
 *
 * Two delivery paths (BOTH read from suite source — `Controllers/Webhook.php`,
 * `Utilities/Factories/WebhookEvents.php`, `Utilities/Abstracts/WebhookEvent.php`):
 *
 *  1. postWebhookEvent({id,type,account?}, userAgent?) — the LIVE endpoint. It builds the
 *     event from the POSTed body (`Event::constructFrom`) and dispatches it; it does NOT
 *     re-fetch the event from Stripe. The helper sends only {id,type,account} (no
 *     `data.object`), so this path is the VALIDATION-layer probe. The endpoint's response
 *     code is the deterministic signal:
 *       • 204 = REJECTED  (validate_request → status_header(204); exit)
 *       • 200 = ACCEPTED  (validation passed → handler runs → status_header(200); exit;
 *                          handlers no-op gracefully when the body carries no object)
 *     With NO webhook secret stored (the suite config sets none) the verifier falls back to
 *     a User-Agent check: a request is VALID when the UA is empty OR contains "Stripe"
 *     (`validate_request_user_agent`, Webhook.php:226-234) — a deliberately broad gate. A
 *     non-Stripe UA → STATUS_USER_AGENT_INVALID → 204. When a webhook secret IS configured
 *     an unsigned/invalid-signature request hits the SAME 204 branch (STATUS_SIGNATURE_*).
 *
 *  2. injectStripeWebhook({type,data_object,account?}) — the test mu-plugin
 *     (`dokan-test-express/v1/express-webhook`) constructs a FULL event (with data.object)
 *     and calls `WebhookEvents::handle()` directly, bypassing signature/UA. This is how we
 *     drive the actual handler side-effects (each handler reads its object via
 *     `WebhookEvent::get_payload()` = `$event->data->object`). It reports whether handle()
 *     threw and whether the throw was a PHP \Error (an uncatchable-in-prod fatal).
 *
 * localhost can't receive real Stripe deliveries, so synthetic injection is the default for
 * handler effects; the live endpoint is used for the validation matrix + the real signed
 * event id (SE-WH-01).
 *
 * Serial: places real orders and mutates the seeded vendor's account_info. Charge/checkout
 * tests skip without keys (the gateway/module must be configured for the endpoint to be
 * "ready" and for the injector to find the module classes). Transfer tests skip without real
 * connected accounts.
 */
test.describe.serial('Stripe Express — Webhooks (SE-WH) @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    let productId: string;

    // Order-meta keys the handlers resolve orders by (Helper::meta_key — '_<gatewayId>_<key>').
    const META = {
        paymentIntentId: '_dokan_stripe_express_payment_intent_id', // Order::get_order_by_intent_id(false)
        setupIntentId: '_dokan_stripe_express_setup_intent_id', // Order::get_order_by_intent_id(true)
        transactionId: '_dokan_stripe_express_transaction_id', // Order::get_order_by_charge_id
    } as const;
    // Mode-correct connected-account user-meta (testmode → `test_` infix).
    const ACCOUNT_INFO_META = '_dokan_stripe_express_test_account_info';
    const VENDOR1_ACCT = STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1;

    /** Place a single connected-vendor order as the customer through block checkout. */
    async function placeNormalOrder(browser: Browser): Promise<string> {
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            const id = page.url().match(/order-received\/(\d+)/)?.[1];
            expect(id, 'captured the order id from the order-received URL').toBeTruthy();
            return id as string;
        } finally {
            await page.close();
            await ctx.close();
        }
    }

    /**
     * Create a PENDING `dokan_stripe_express` order via REST and stamp it with the lookup
     * meta a handler resolves orders by. No real Stripe payment — used to drive the
     * charge.failed / setup_intent.* / forged-paid handlers against a known unpaid order.
     */
    async function createPendingExpressOrder(meta: Array<{ key: string; value: string }>): Promise<number> {
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const res = await ctx.post(`${SERVER_URL}/wc/v3/orders`, {
                data: {
                    payment_method: StripeExpressPage.GATEWAY_ID,
                    payment_method_title: 'Stripe Express',
                    status: 'pending',
                    set_paid: false,
                    customer_id: Number(CUSTOMER_ID),
                    billing: payloads.createOrder.billing,
                    line_items: [{ product_id: Number(productId), quantity: 1 }],
                    meta_data: meta,
                },
            });
            const body = (await res.json().catch(() => ({}))) as { id?: number };
            if (!res.ok() || !body.id) {
                throw new Error(`createPendingExpressOrder failed (${res.status()}): ${JSON.stringify(body).slice(0, 200)}`);
            }
            return body.id;
        } finally {
            await ctx.dispose();
        }
    }

    test.beforeAll(async () => {
        await ensureStripeExpressConfigured();
        await ensureCustomerAddress();
        // A connected vendor: real acct_ when STRIPE_EXPRESS_VENDOR1_ACCT is set (real transfer
        // path), else a placeholder that still renders connected + charges on the platform.
        await seedStripeExpressConnectedVendor(VENDOR_ID, VENDOR1_ACCT);
        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Express Webhook Product' }, payloads.vendorAuth);
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

    // ============================================================
    // SE-WH-01 — a real signed payment_intent.succeeded reconciles
    // ============================================================
    test('SE-WH-01: a real payment_intent.succeeded delivered to the live endpoint is accepted and reconciles the order', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — needs a real charge + a real Stripe event id');

        const orderId = await placeNormalOrder(browser);
        const intentId = await getStripeIntentIdForOrder(orderId);

        // Resolve the REAL event id Stripe emitted for this intent (propagation can lag a few s).
        let eventId: string | undefined;
        try {
            await expect
                .poll(
                    async () => {
                        const e = await stripeApi.findEventForObject('payment_intent.succeeded', intentId);
                        eventId = (e as { id?: string } | undefined)?.id;
                        return eventId ?? '';
                    },
                    { message: 'waiting for the real Stripe payment_intent.succeeded event for this intent', timeout: 45_000, intervals: [2_000, 3_000, 5_000] },
                )
                .not.toBe('');
        } catch {
            /* event not yet propagated — handled by the skip below */
        }
        test.skip(!eventId, 'Stripe has not emitted the payment_intent.succeeded event yet (propagation delay) — cannot exercise the live signed-event path');

        // The live endpoint accepts the real event under the no-secret UA fallback (200 = processed).
        const status = await postWebhookEvent({ id: eventId as string, type: 'payment_intent.succeeded' }, 'Stripe/1.0');
        expect(status, 'the live webhook endpoint should accept (200) a real payment_intent.succeeded under the UA fallback').toBe(200);

        // Reconcile is idempotent for an already-paid order; prove the handler runs cleanly too.
        const res = await injectStripeWebhook({
            type: 'payment_intent.succeeded',
            data_object: { id: intentId, object: 'payment_intent', status: 'succeeded' },
        });
        expect(res.threw, `payment_intent.succeeded must be handled without error (got: ${res.error ?? 'none'})`).toBe(false);

        expect(await getOrderStatus(orderId), 'the order stays paid after the payment_intent.succeeded reconcile').toMatch(/processing|completed/);
        log.success('SE-WH-01: real payment_intent.succeeded accepted (200) + order reconciled/paid');
    });

    // ============================================================
    // SE-WH-02 — unsigned / invalid request is rejected (HTTP 204)
    // ============================================================
    test('SE-WH-02: an unsigned webhook with a non-Stripe User-Agent is rejected (204) and changes no order state', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway must be ready for the endpoint to validate');

        const orderId = await createPendingExpressOrder([{ key: META.paymentIntentId, value: `pi_unsigned_e2e_${Date.now()}` }]);

        // No webhook secret is configured by the suite, so the verifier uses the UA fallback: a
        // non-Stripe, non-empty UA → STATUS_USER_AGENT_INVALID → status_header(204); exit. (With a
        // webhook secret an unsigned/invalid-signature request lands on the SAME 204 branch.)
        const status = await postWebhookEvent(
            { id: `evt_unsigned_e2e_${Date.now()}`, type: 'payment_intent.succeeded' },
            'Mozilla/5.0 (e2e-forged-not-stripe)',
        );
        expect(status, 'an unsigned webhook from a non-Stripe User-Agent must be rejected with 204').toBe(204);

        expect(await getOrderStatus(orderId), 'a rejected webhook must not change order state').toBe('pending');
        log.success('SE-WH-02: unsigned/non-Stripe-UA webhook rejected (204), order untouched');
    });

    // ============================================================
    // SE-WH-03 — no-secret UA fallback accepts a Stripe-UA request
    // ============================================================
    test('SE-WH-03: with no webhook secret stored, a request carrying the Stripe User-Agent is accepted (200)', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway must be ready for the endpoint to validate');

        // Documents the no-secret fallback (Webhook.php:226-234): UA contains "Stripe" → valid → 200.
        const status = await postWebhookEvent({ id: `evt_ua_e2e_${Date.now()}`, type: 'payment_intent.succeeded' }, 'Stripe/1.0');
        expect(status, 'the no-secret UA fallback should ACCEPT (200) a request whose UA contains "Stripe"').toBe(200);
        log.success('SE-WH-03: UA fallback accepted a Stripe-User-Agent webhook (200)');
    });

    // ============================================================
    // SE-WH-04 — replay must not create a duplicate vendor transfer
    // ============================================================
    test('SE-WH-04: replaying payment_intent.succeeded does not create a duplicate vendor transfer', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials || !HAS_REAL_CONNECTED_ACCOUNTS, 'Real connected accounts required — set STRIPE_EXPRESS_VENDOR*_ACCT');

        const orderId = await placeNormalOrder(browser);
        const intentId = await getStripeIntentIdForOrder(orderId);
        const chargeId = await getStripeChargeIdForOrder(orderId);

        // disburse_mode is ON_ORDER_COMPLETED — completing the order fires the vendor Transfer.
        await setOrderStatus(orderId, 'completed');
        let countBefore = 0;
        await expect
            .poll(
                async () => {
                    countBefore = (await stripeApi.transfersForChargeToVendor(chargeId, VENDOR1_ACCT)).length;
                    return countBefore;
                },
                { message: 'the vendor transfer should fire after order completion', timeout: 120_000, intervals: [3_000, 5_000, 8_000] },
            )
            .toBeGreaterThanOrEqual(1);

        // Replay the success event — the handler guards on order status (already paid) + a
        // processing lock, so it must NOT mint a second transfer.
        const res = await injectStripeWebhook({
            type: 'payment_intent.succeeded',
            data_object: { id: intentId, object: 'payment_intent', status: 'succeeded' },
        });
        expect(res.threw, `a payment_intent.succeeded replay must be handled without error (got: ${res.error ?? 'none'})`).toBe(false);

        const countAfter = (await stripeApi.transfersForChargeToVendor(chargeId, VENDOR1_ACCT)).length;
        expect(countAfter, `a payment_intent.succeeded replay must not duplicate the vendor transfer (before=${countBefore}, after=${countAfter})`).toBe(countBefore);
        log.success(`SE-WH-04: replay created no duplicate transfer (count stayed ${countAfter})`);
    });

    // ============================================================
    // SE-WH-05 — charge.refunded is a tolerated no-op on Express
    // ============================================================
    test('SE-WH-05: charge.refunded is handled without error and does NOT reconcile the order (no Express handler)', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — needs a real charge to reference');

        const orderId = await placeNormalOrder(browser);
        const intentId = await getStripeIntentIdForOrder(orderId);
        const chargeId = await getStripeChargeIdForOrder(orderId);
        const before = await getOrderStatus(orderId);

        // ACTUAL behaviour: unlike Stripe Connect, Express's supported-events map
        // (Processors\Webhook::get_supported_events) has NO charge.refunded entry, so the factory
        // returns no handler → tolerated no-op. Refund reconciliation in Express flows through the
        // Dokan refund controller (Controllers\Refund), covered by the SE-REF suite — NOT this webhook.
        const res = await injectStripeWebhook({
            type: 'charge.refunded',
            data_object: { id: chargeId, object: 'charge', payment_intent: intentId, refunded: true, amount_refunded: 100 },
        });
        expect(res.threw, `charge.refunded must be tolerated without error (got: ${res.error ?? 'none'})`).toBe(false);
        expect(res.fatal, 'charge.refunded must not fatal').toBe(false);

        expect(await getOrderStatus(orderId), `charge.refunded alone must not reconcile the order to refunded (was '${before}')`).not.toBe('refunded');
        log.success('SE-WH-05: charge.refunded tolerated as a no-op (no Express reconcile handler) — order status unchanged');
    });

    // ============================================================
    // SE-WH-07 — charge.dispute.created moves the order to on-hold
    // ============================================================
    test('SE-WH-07: charge.dispute.created puts a non-final order on-hold with a dispute note', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the dispute handler re-fetches the intent from Stripe');

        const orderId = await placeNormalOrder(browser);
        const intentId = await getStripeIntentIdForOrder(orderId);

        // Express's ChargeDisputeCreated resolves the order via get_order_from_stripe_object
        // (payment_intent → PaymentIntent::get → Order::get_order_by_intent_id) and guards the
        // vendor-subscription branch — so a NORMAL order is handled cleanly (no Connect-J6 fatal).
        const res = await injectStripeWebhook({
            type: 'charge.dispute.created',
            data_object: { id: `dp_e2e_${Date.now()}`, object: 'dispute', payment_intent: intentId, status: 'needs_response', reason: 'fraudulent' },
        });
        expect(res.fatal, `charge.dispute.created must not fatal the handler (got: ${res.error ?? 'none'})`).toBe(false);
        expect(res.threw, `charge.dispute.created must be handled without throwing (got: ${res.error ?? 'none'})`).toBe(false);

        await expect.poll(() => getOrderStatus(orderId), { message: 'a dispute should move a non-final order to on-hold', timeout: 30_000 }).toBe('on-hold');
        const notes = await getOrderNotes(orderId);
        expect(notes.some(n => /dispute/i.test(n)), `the order should carry a dispute note (notes: ${JSON.stringify(notes)})`).toBe(true);
        log.success('SE-WH-07: dispute moved the order to on-hold + recorded a dispute note');
    });

    // ============================================================
    // SE-WH-08 — account.updated syncs the connected account_info
    // ============================================================
    test('SE-WH-08: account.updated for a connected vendor syncs the stored account_info', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials || !HAS_REAL_CONNECTED_ACCOUNTS, 'account.updated re-fetches the account from Stripe — needs a real connected acct_');

        await seedStripeExpressConnectedVendor(VENDOR_ID, VENDOR1_ACCT);

        // AccountUpdated reads only $data->id from the event, then Account::get($id) (re-fetch) and
        // writes the result back to the vendor's account_info — so the synced data is Stripe truth.
        const res = await injectStripeWebhook({
            type: 'account.updated',
            account: VENDOR1_ACCT,
            data_object: { id: VENDOR1_ACCT, object: 'account', charges_enabled: true, payouts_enabled: true },
        });
        expect(res.threw, `account.updated must be handled without error (got: ${res.error ?? 'none'})`).toBe(false);

        const after = String((await dbUtils.getUserMetaValue(VENDOR_ID, ACCOUNT_INFO_META)) ?? '');
        expect(after, 'account.updated should leave a connected account_info referencing the vendor acct_').toContain(VENDOR1_ACCT);
        expect(after, 'a real connected account should remain charges-enabled after the sync').not.toMatch(/charges_enabled";b:0/);
        log.success('SE-WH-08: account.updated synced the connected account_info from Stripe');
    });

    // ============================================================
    // SE-WH-09 — setup_intent.succeeded completes a pending order
    // ============================================================
    test('SE-WH-09: setup_intent.succeeded completes the order behind the setup intent', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the Express module must be loaded for the injector');

        const setupIntent = `seti_ok_e2e_${Date.now()}`;
        const orderId = await createPendingExpressOrder([{ key: META.setupIntentId, value: setupIntent }]);

        // SetupIntentSucceeded resolves the order via the SETUP intent meta and calls payment_complete().
        const res = await injectStripeWebhook({
            type: 'setup_intent.succeeded',
            data_object: { id: setupIntent, object: 'setup_intent', status: 'succeeded' },
        });
        expect(res.threw, `setup_intent.succeeded must be handled without error (got: ${res.error ?? 'none'})`).toBe(false);

        await expect.poll(() => getOrderStatus(orderId), { message: 'setup_intent.succeeded should complete the pending order', timeout: 30_000 }).toMatch(/processing|completed/);
        log.success('SE-WH-09: setup_intent.succeeded finalized (payment_complete) the order');
    });

    // ============================================================
    // SE-WH-10 — an event for an unknown order is a clean no-op (200)
    // ============================================================
    test('SE-WH-10: an event for an unknown/missing order no-ops and the endpoint still acknowledges 200', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway must be ready for the endpoint');

        // Handler side: an intent that maps to no order → "Could not find order" → clean return.
        const res = await injectStripeWebhook({
            type: 'payment_intent.succeeded',
            data_object: { id: `pi_unknown_e2e_${Date.now()}`, object: 'payment_intent', status: 'succeeded' },
        });
        expect(res.threw, `an unknown-order event must no-op without error (got: ${res.error ?? 'none'})`).toBe(false);
        expect(res.fatal, 'an unknown-order event must not fatal').toBe(false);

        // Endpoint side: a webhook must 2xx even when it resolves no order (Stripe retries on non-2xx).
        const status = await postWebhookEvent({ id: `evt_unknown_e2e_${Date.now()}`, type: 'payment_intent.succeeded' }, 'Stripe/1.0');
        expect(status, 'the endpoint must acknowledge an unknown-order event with 200').toBe(200);
        log.success('SE-WH-10: unknown-order event no-oped (handler) and endpoint acknowledged 200');
    });

    // ============================================================
    // SE-WH-11 — forged "paid" under the UA fallback (SUSPECTED BUG)
    // ============================================================
    test('SE-WH-11: a forged payment_intent.succeeded must NOT mark an unpaid order paid (SUSPECTED BUG — verify)', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway/module must be configured');

        const forgedIntent = `pi_forged_e2e_${Date.now()}`;
        const orderId = await createPendingExpressOrder([{ key: META.paymentIntentId, value: forgedIntent }]);
        expect(await getOrderStatus(orderId), 'the forge target starts unpaid (pending)').toBe('pending');

        // (a) Document the over-broad gate: the no-secret UA fallback ACCEPTS (200) an unsigned
        //     event from anyone able to set a "Stripe" UA. (It carries no object, so it cannot pay.)
        const gateStatus = await postWebhookEvent({ id: `evt_forged_pi_${Date.now()}`, type: 'payment_intent.succeeded' }, 'Stripe/1.0');
        log.info(`SE-WH-11: no-secret UA fallback returned ${gateStatus} for an unsigned payment_intent.succeeded`);

        // (b) The real exploit surface — a forged object handed to the handler. PaymentIntentSucceeded
        //     resolves the order from the (trusted) object id; a richly-forged "succeeded" object is the
        //     strongest probe. If the order flips to paid the suspected bug is CONFIRMED.
        const res = await injectStripeWebhook({
            type: 'payment_intent.succeeded',
            data_object: {
                id: forgedIntent,
                object: 'payment_intent',
                status: 'succeeded',
                amount: 2000,
                currency: 'usd',
                latest_charge: 'ch_forged_e2e',
                charges: { object: 'list', data: [{ id: 'ch_forged_e2e', object: 'charge', status: 'succeeded', paid: true, captured: true, amount: 2000 }] },
            },
        });
        const after = await getOrderStatus(orderId);
        log.info(`SE-WH-11: forged payment_intent.succeeded → order '${after}' (handler threw=${res.threw}, error=${res.error ?? 'none'})`);

        // Assert the security invariant — do NOT pre-assume; if this fails, the forgery succeeded.
        expect(
            after,
            `SUSPECTED BUG SE-WH-11: a forged/unverified payment_intent.succeeded marked an UNPAID order paid (order='${after}'). The handler must verify the intent with Stripe before settling — CONFIRM and file to bugs/.`,
        ).not.toMatch(/processing|completed/);
        log.success('SE-WH-11: forged payment_intent.succeeded did not mark the unpaid order paid');
    });

    // ============================================================
    // SE-WH-12 — charge.failed (the real failed-payment event; supersedes SE-WH-06)
    // ============================================================
    test('SE-WH-12: charge.failed fails a pending order, then skips an already-failed order (supersedes SE-WH-06)', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the Express module must be loaded for the injector');

        // Express has NO payment_intent.payment_failed handler; the real failed-payment event is
        // charge.failed (ChargeFailed → Order::get_order_by_charge_id → update_status('failed')).
        const forgedCharge = `ch_failed_e2e_${Date.now()}`;
        const orderId = await createPendingExpressOrder([{ key: META.transactionId, value: forgedCharge }]);

        const res1 = await injectStripeWebhook({
            type: 'charge.failed',
            data_object: { id: forgedCharge, object: 'charge', status: 'failed', failure_message: 'card declined (e2e)' },
        });
        expect(res1.threw, `charge.failed must be handled without error (got: ${res1.error ?? 'none'})`).toBe(false);
        await expect.poll(() => getOrderStatus(orderId), { message: 'charge.failed should move a pending order to failed', timeout: 30_000 }).toBe('failed');

        // Already-failed guard: a second charge.failed is a no-op (stays failed, no error).
        const res2 = await injectStripeWebhook({
            type: 'charge.failed',
            data_object: { id: forgedCharge, object: 'charge', status: 'failed', failure_message: 'card declined (e2e replay)' },
        });
        expect(res2.threw, `a repeat charge.failed must be handled without error (got: ${res2.error ?? 'none'})`).toBe(false);
        expect(await getOrderStatus(orderId), 'an already-failed order stays failed (no double-processing)').toBe('failed');
        log.success('SE-WH-12: charge.failed → pending order failed; repeat event skipped');
    });

    // ============================================================
    // SE-WH-13 — setup_intent.setup_failed fails the order
    // ============================================================
    test('SE-WH-13: setup_intent.setup_failed fails the order behind the setup intent', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the Express module must be loaded for the injector');

        const setupIntent = `seti_failed_e2e_${Date.now()}`;
        const orderId = await createPendingExpressOrder([{ key: META.setupIntentId, value: setupIntent }]);

        // SetupIntentSetupFailed resolves via the SETUP intent meta and (no status_final) fails the order.
        const res = await injectStripeWebhook({
            type: 'setup_intent.setup_failed',
            data_object: { id: setupIntent, object: 'setup_intent', last_setup_error: { message: 'SCA authentication failed (e2e)' } },
        });
        expect(res.threw, `setup_intent.setup_failed must be handled without error (got: ${res.error ?? 'none'})`).toBe(false);

        await expect.poll(() => getOrderStatus(orderId), { message: 'setup_intent.setup_failed should fail the order', timeout: 30_000 }).toBe('failed');
        log.success('SE-WH-13: setup_intent.setup_failed failed the order (SCA authentication failed)');
    });

    // ============================================================
    // SE-WH-14 — balance.available drives the awaiting-disbursement sweep
    // ============================================================
    test('SE-WH-14: balance.available runs the awaiting-disbursement sweep without error', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials || !HAS_REAL_CONNECTED_ACCOUNTS, 'The disbursement sweep is meaningful only with real connected accounts');

        // BalanceAvailable queries awaiting-disbursement orders and dispatches the background process.
        // The observable effect (a delayed transfer) belongs to SE-PAY; here we assert the sweep runs clean.
        const res = await injectStripeWebhook({
            type: 'balance.available',
            data_object: { id: `ba_e2e_${Date.now()}`, object: 'balance', available: [{ amount: 10000, currency: 'usd' }] },
        });
        expect(res.threw, `balance.available must be handled without error (got: ${res.error ?? 'none'})`).toBe(false);
        expect(res.fatal, 'balance.available must not fatal the sweep').toBe(false);
        log.success('SE-WH-14: balance.available ran the awaiting-disbursement sweep cleanly');
    });

    // ============================================================
    // SE-WH-15 — review.opened → on-hold; review.closed → restored
    // ============================================================
    test('SE-WH-15: review.opened holds the order, review.closed restores it', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the review handler re-fetches the intent from Stripe');

        const orderId = await placeNormalOrder(browser);
        const intentId = await getStripeIntentIdForOrder(orderId);

        // ReviewOpened stores status-before-hold (processing) then on-holds the order.
        const opened = await injectStripeWebhook({
            type: 'review.opened',
            data_object: { id: `prv_e2e_${Date.now()}`, object: 'review', payment_intent: intentId, reason: 'rule', open: true },
        });
        expect(opened.threw, `review.opened must be handled without error (got: ${opened.error ?? 'none'})`).toBe(false);
        await expect.poll(() => getOrderStatus(orderId), { message: 'review.opened should hold the order', timeout: 30_000 }).toBe('on-hold');

        // ReviewClosed restores the stored before-hold status (processing).
        const closed = await injectStripeWebhook({
            type: 'review.closed',
            data_object: { id: `prv_e2e_${Date.now()}`, object: 'review', payment_intent: intentId, reason: 'approved', open: false },
        });
        expect(closed.threw, `review.closed must be handled without error (got: ${closed.error ?? 'none'})`).toBe(false);
        await expect.poll(() => getOrderStatus(orderId), { message: 'review.closed should restore the held order', timeout: 30_000 }).toBe('processing');
        log.success('SE-WH-15: review opened→on-hold then closed→restored to processing');
    });

    // ============================================================
    // SE-WH-16 — forged account.updated under UA fallback (SUSPECTED BUG)
    // ============================================================
    test('SE-WH-16: a forged account.updated must NOT flip the vendor charges/payouts (SUSPECTED BUG — verify)', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway/module must be configured');

        await seedStripeExpressConnectedVendor(VENDOR_ID, VENDOR1_ACCT);

        // (a) Document the over-broad gate: the no-secret UA fallback ACCEPTS (200) an unsigned
        //     account.updated for the vendor's acct (it carries no object, so it cannot inject values).
        const gateStatus = await postWebhookEvent({ id: `evt_forged_acct_${Date.now()}`, type: 'account.updated', account: VENDOR1_ACCT }, 'Stripe/1.0');
        log.info(`SE-WH-16: no-secret UA fallback returned ${gateStatus} for an unsigned account.updated`);

        // (b) The forgery: an injected charges_enabled:false. AccountUpdated re-fetches the account
        //     from Stripe (Account::get) and IGNORES the body's flags — so the forged false should not
        //     stick. If the stored account_info DID flip to false, the suspected bug is CONFIRMED.
        const res = await injectStripeWebhook({
            type: 'account.updated',
            account: VENDOR1_ACCT,
            data_object: { id: VENDOR1_ACCT, object: 'account', charges_enabled: false, payouts_enabled: false, details_submitted: false },
        });
        expect(res.threw, `account.updated must be handled without error (got: ${res.error ?? 'none'})`).toBe(false);

        const after = String((await dbUtils.getUserMetaValue(VENDOR_ID, ACCOUNT_INFO_META)) ?? '');
        expect(
            after,
            'SUSPECTED BUG SE-WH-16: a forged account.updated flipped the vendor to charges_enabled=false (the handler trusted the event body instead of re-fetching from Stripe) — CONFIRM and file to bugs/.',
        ).not.toMatch(/charges_enabled";b:0/);
        expect(after, 'the vendor should still carry a connected account_info after the forged event').toContain(VENDOR1_ACCT);
        log.success('SE-WH-16: forged account.updated did not flip the vendor charges/payouts');
    });

    // ============================================================
    // SE-WH-17 — replayed delivery passes verification (no event-id dedup)
    // ============================================================
    test('SE-WH-17: a replayed delivery passes verification each time (no event-id dedup at the verify layer)', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the gateway must be ready for the endpoint');

        // The verifier checks only the secret/UA, never an event-id seen-before set — so the SAME
        // delivery is accepted on every replay (within the 5-min skew when a secret is set; always
        // under the no-secret UA fallback). Idempotency is enforced downstream by the handlers'
        // order-status + processing-lock guards, NOT at verification.
        const event = { id: `evt_replay_e2e_${Date.now()}`, type: 'payment_intent.succeeded' };
        const first = await postWebhookEvent(event, 'Stripe/1.0');
        const second = await postWebhookEvent(event, 'Stripe/1.0');
        expect(first, 'first delivery should pass verification (200)').toBe(200);
        expect(second, 'a replay of the SAME event id should also pass verification (no dedup → 200)').toBe(200);
        log.success('SE-WH-17: replayed delivery accepted twice — verify layer performs no event-id dedup');
    });
});
