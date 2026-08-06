import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import {
    CUSTOMER_ID,
    VENDOR_ID,
    VENDOR2_ID,
    PAYPAL_GATEWAY_ID,
    PAYPAL_EVENTS,
    PAYPAL_UNHANDLED_EVENTS,
    PAYPAL_MERCHANTS,
    PAYPAL_WEBHOOK_URL,
    MODULE_PRODUCT_SUBSCRIPTION,
    hasCredentials,
    ensurePayPalConfigured,
    getPayPalStatus,
    seedPayPalConnectedVendor,
    injectPayPalWebhook,
    postUnsignedWebhook,
    getOrderMetaValue,
    getOrderNotes,
    getOrderStatus,
    setOrderMeta,
    armInterceptor,
    disarmInterceptor,
    readCapturedVerifyRequest,
} from './helpers';
import type { PayPalStatus, WebhookInjectResult } from './helpers';

// The suite tsconfig is strict and does not pull @types/node.
declare const process: { env: Record<string, string | undefined> };

/**
 * PayPal Marketplace — Webhooks (PP-WHK-01 … PP-WHK-25).
 *
 * ---------------------------------------------------------------------------
 * Why this file exists in the shape it does
 * ---------------------------------------------------------------------------
 *
 * Two delivery paths, and only one of them can reach a handler deterministically:
 *
 *  1. `injectPayPalWebhook()` — the test mu-plugin route `dokan-test-paypal/v1/paypal-webhook`
 *     builds a real nested-stdClass event and calls `EventFactory::handle()` directly. This is
 *     the ONLY way to drive handler side effects: `WebhookHandler::handle_events()` verifies the
 *     signature through `Processor::verify_webhook_request()`, which is a LIVE outbound POST to
 *     PayPal's verify-webhook-signature API with no filter, constant or test-mode bypass. A
 *     signed event simply cannot be forged locally.
 *  2. `postUnsignedWebhook()` — the live `?wc-api=dokan-paypal` endpoint. Used only for the
 *     cases that are ABOUT the endpoint (PP-WHK-02 / 21 / 23 / 24).
 *
 *     Caveat recorded rather than papered over: that helper calls `request.newContext()` with no
 *     `extraHTTPHeaders`, so it INHERITS the shared config's admin Basic auth — the probe is not
 *     anonymous. It does not change any outcome here, because `WebhookHandler::handle_events()`
 *     performs no capability check whatsoever (it is a `woocommerce_api_*` endpoint gated only by
 *     PayPal's signature), so an authenticated and an anonymous delivery follow the identical code
 *     path. PP-WHK-21 needs a raw body the helper cannot express and therefore builds its own
 *     request, where `Authorization: ''` IS set explicitly.
 *
 * ---------------------------------------------------------------------------
 * The three traps every assertion in this file is written against
 * ---------------------------------------------------------------------------
 *
 *  - `WebhookHandler.php:53` returns HTTP 200 and `exit()`s BEFORE reading the request body when
 *    `Helper::is_ready()` is false. A 200 from the live endpoint is therefore consistent with a
 *    completely dead gateway. No test here asserts on a status code alone.
 *  - `EventFactory::__callStatic` (`Factories/EventFactory.php:51`) catches every `\Exception`
 *    itself and only logs it, so the injector's `threw` flag reports `\Error`-class fatals and
 *    little else. `threw === false` proves almost nothing on its own.
 *  - Asserting a negative ("nothing happened") on a site where the handler could never have run
 *    passes trivially. Every negative case below therefore establishes a POSITIVE control first —
 *    a handled event that provably mutates state on the very same order in the very same test —
 *    before asserting that the thing under test changed nothing.
 *
 * Consequently every test asserts a STATE MUTATION: order meta, an order note, a
 * `dokan_refund` row, a `dokan_vendor_balance` row, or a user meta.
 *
 * ---------------------------------------------------------------------------
 * Credentials
 * ---------------------------------------------------------------------------
 *
 * Most of this file needs NO PayPal credentials — the handlers it drives are pure local state
 * machines. The exceptions are called out on each test:
 *   - PP-WHK-03 (the approved handler's only mutation sits behind a live capture call),
 *   - PP-WHK-02 / 23 / 24 / 25 (they need `Helper::is_ready() === true`, which is
 *     `enabled && partner_id && client_id && client_secret`).
 *
 * ---------------------------------------------------------------------------
 * Serial, and why
 * ---------------------------------------------------------------------------
 *
 * PP-WHK-02 / 24 / 25 temporarily mutate GLOBAL gateway state (the `enabled` setting, the stored
 * webhook id option). `test.describe.serial` keeps them from racing each other inside this file;
 * each restores what it changed in a `finally`. Never tagged `@serial` — `playwright.config.ts:13`
 * grepInverts that tag in BOTH lanes, which would silently delete this file from CI.
 */
// NOT `test.describe.serial`, deliberately. Playwright already runs every test in a single file
// sequentially in one worker, so `.serial` bought no ordering here — its only extra behaviour is
// ABORTING the rest of the group on the first failure. On 2026-07-31 that cost 46 of 68 cases:
// one early failure in each of the three PayPal files silently erased every case declared after it,
// and the run still summarised as mostly green. A skipped case reports as "not a failure", which is
// exactly the fake-green shape this suite exists to prevent — the cascade hides far more than it
// protects. Ordering is preserved; only the cascade is gone.
test.describe('PayPal Marketplace — Webhooks (PP-WHK)', () => {
    test.describe.configure({ timeout: 180_000 });

    const dbPrefix = process.env.DB_PREFIX ?? 'wp';

    /** An event string the module maps to nothing at all — PP-WHK-20. */
    const UNKNOWN_EVENT = 'DOKAN.E2E.NO-SUCH.EVENT';

    /** An order id that cannot exist, for PP-WHK-22. */
    const NONEXISTENT_ORDER_ID = 999_999_991;

    /**
     * No helper in this suite creates a PayPal-side billing subscription, and none can:
     * `POST /v1/billing/subscriptions` needs an approved buyer session on paypal.com. Gates
     * PP-WHK-16, whose handler fetches the subscription over the network before mutating anything.
     */
    const HAS_PAYPAL_SUBSCRIPTION_FIXTURE = false;

    let status: PayPalStatus | null = null;
    let moduleActive = false;
    let subscriptionModuleActive = false;
    let productId = '';
    /** A `product_pack`-typed product, needed by the subscription activate / re-activate handlers. */
    let packProductId = '';

    /* ------------------------------------------------------------------ */
    /* Fixtures                                                            */
    /* ------------------------------------------------------------------ */

    /**
     * Create a WooCommerce order paid with (or at least attributed to) the PayPal Marketplace
     * gateway. Almost every handler starts with
     * `$order->get_payment_method() !== Helper::get_gateway_id() → return`, so the payment method
     * is the single most load-bearing field here.
     */
    async function createPayPalOrder(
        opts: { status?: string; setPaid?: boolean; customerId?: string | number; meta?: Array<{ key: string; value: unknown }>; productId?: string } = {},
    ): Promise<number> {
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const res = await ctx.post(`${SERVER_URL}/wc/v3/orders`, {
                data: {
                    payment_method: PAYPAL_GATEWAY_ID,
                    payment_method_title: 'Dokan PayPal Marketplace',
                    status: opts.status ?? 'pending',
                    set_paid: opts.setPaid ?? false,
                    customer_id: Number(opts.customerId ?? CUSTOMER_ID),
                    billing: payloads.createOrder.billing,
                    line_items: [{ product_id: Number(opts.productId ?? productId), quantity: 1 }],
                    ...(opts.meta ? { meta_data: opts.meta } : {}),
                },
            });
            const body = (await res.json().catch(() => ({}))) as { id?: number };
            if (!res.ok() || !body.id) {
                throw new Error(`createPayPalOrder failed (${res.status()}): ${JSON.stringify(body).slice(0, 300)}`);
            }
            return body.id;
        } finally {
            await ctx.dispose();
        }
    }

    /**
     * A `CHECKOUT.ORDER.COMPLETED` resource carrying everything
     * `OrderManager::store_capture_payment_data()` dereferences without an `isset` guard:
     * `payments.captures[0].id`, `.seller_receivable_breakdown.paypal_fee.{currency_code,value}`
     * and `.net_amount.value`. A thinner payload produces a PHP `\Error`, not a clean skip.
     */
    function completedOrderResource(orderId: number, paypalOrderId: string, captureId: string): Record<string, unknown> {
        return {
            id: paypalOrderId,
            intent: 'CAPTURE',
            status: 'COMPLETED',
            purchase_units: [
                {
                    // Resolves the PARENT order (`handle_order_complete_status`).
                    invoice_id: String(orderId),
                    // Resolves the order the capture data is written onto (`store_capture_payment_data`).
                    custom_id: String(orderId),
                    amount: { currency_code: 'USD', value: '10.00' },
                    payments: {
                        captures: [
                            {
                                id: captureId,
                                status: 'COMPLETED',
                                amount: { currency_code: 'USD', value: '10.00' },
                                seller_receivable_breakdown: {
                                    gross_amount: { currency_code: 'USD', value: '10.00' },
                                    paypal_fee: { currency_code: 'USD', value: '0.54' },
                                    net_amount: { currency_code: 'USD', value: '9.46' },
                                    platform_fees: [{ amount: { currency_code: 'USD', value: '1.00' } }],
                                },
                            },
                        ],
                    },
                },
            ],
        };
    }

    /**
     * A refund-shaped resource. `PAYMENT.CAPTURE.REFUNDED` and `PAYMENT.CAPTURE.REVERSED` share
     * one handler, so the same builder serves both (PP-WHK-07 / 08 / 19 / 22).
     */
    function refundResource(orderId: number | string, refundId: string): Record<string, unknown> {
        return {
            id: refundId,
            status: 'COMPLETED',
            custom_id: String(orderId),
            note_to_payer: 'e2e webhook refund',
            amount: { currency_code: 'USD', value: '10.00' },
            seller_payable_breakdown: {
                gross_amount: { currency_code: 'USD', value: '10.00' },
                paypal_fee: { currency_code: 'USD', value: '0.54' },
                net_amount: { currency_code: 'USD', value: '9.46' },
                total_refunded_amount: { currency_code: 'USD', value: '10.00' },
                platform_fees: [{ amount: { currency_code: 'USD', value: '1.00' } }],
            },
        };
    }

    /* ------------------------------------------------------------------ */
    /* Server-state readers (raw SQL — no mu-plugin route reports these)   */
    /* ------------------------------------------------------------------ */

    async function refundRowsForOrder(orderId: number | string): Promise<Array<{ id: number; status: number; refund_amount: string }>> {
        return (await dbUtils.dbQuery(`SELECT id, status, refund_amount FROM ${dbPrefix}_dokan_refund WHERE order_id = ?;`, [String(orderId)])) as Array<{
            id: number;
            status: number;
            refund_amount: string;
        }>;
    }

    async function balanceRowsForOrder(orderId: number | string, trnType: string): Promise<Array<{ id: number; credit: string; debit: string }>> {
        return (await dbUtils.dbQuery(`SELECT id, credit, debit FROM ${dbPrefix}_dokan_vendor_balance WHERE trn_id = ? AND trn_type = ?;`, [
            String(orderId),
            trnType,
        ])) as Array<{ id: number; credit: string; debit: string }>;
    }

    /** Raw option read that tolerates an absent row — `dbUtils.getOptionValue()` throws on one. */
    async function rawOptionValue(optionName: string): Promise<string | null> {
        const rows = (await dbUtils.dbQuery(`SELECT option_value FROM ${dbPrefix}_options WHERE option_name = ?;`, [optionName])) as Array<{ option_value: string }>;
        return rows.length ? rows[0]!.option_value : null;
    }

    /** Post-meta read. `Helper::log_paypal_error()` writes with `update_post_meta()`, and this site runs HPOS. */
    async function rawPostMetaValue(postId: number | string, metaKey: string): Promise<string | null> {
        const rows = (await dbUtils.dbQuery(`SELECT meta_value FROM ${dbPrefix}_postmeta WHERE post_id = ? AND meta_key = ?;`, [
            String(postId),
            metaKey,
        ])) as Array<{ meta_value: string }>;
        return rows.length ? rows[0]!.meta_value : null;
    }

    /* ------------------------------------------------------------------ */
    /* Gates                                                               */
    /* ------------------------------------------------------------------ */

    /**
     * Every test starts here. Without the module the injector route answers 500 and every
     * assertion below would ERROR rather than test anything — which is a different and much
     * worse signal than a skip.
     */
    function requireModule(): void {
        test.skip(
            !moduleActive,
            'The paypal_marketplace module is not active on this site, so EventFactory is not loaded and the injection route answers HTTP 500 — every webhook assertion here would error out instead of testing anything. Activate the module first (ensurePayPalConfigured() does it, but only when the three PayPal credentials are present).',
        );
    }

    function requireSubscriptionModule(): void {
        test.skip(
            !subscriptionModuleActive,
            `The ${MODULE_PRODUCT_SUBSCRIPTION} module is inactive, and every BILLING.SUBSCRIPTION.* handler returns at Helper::has_vendor_subscription_module() before touching a single row — the test would assert "nothing happened" against a handler that was never allowed to start, which is exactly the fake-green shape this file exists to avoid.`,
        );
    }

    /* ------------------------------------------------------------------ */
    /* Setup                                                               */
    /* ------------------------------------------------------------------ */

    // No `test.skip` in here: inside beforeAll it silently voids the whole describe. Every gate
    // is a per-test skip that names precisely what is missing.
    test.beforeAll(async () => {
        await ensurePayPalConfigured();

        status = await getPayPalStatus();
        moduleActive = status?.module_active === true;

        const activeModules = (await dbUtils.dbQuery(`SELECT option_value FROM ${dbPrefix}_options WHERE option_name = 'dokan_pro_active_modules';`)) as Array<{
            option_value: string;
        }>;
        subscriptionModuleActive = activeModules.length ? activeModules[0]!.option_value.includes(MODULE_PRODUCT_SUBSCRIPTION) : false;

        const api = new ApiUtils(await request.newContext());
        [, productId] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Webhook Product' }, payloads.vendorAuth);

        // A `product_pack` product for the subscription-activation handlers. Converted through
        // the same DB path the rest of the suite uses; there is no REST route for the type.
        const [, simpleId] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Webhook Subscription Pack' }, payloads.vendorAuth);
        await dbUtils.setSubscriptionProductType();
        await dbUtils.updateProductType(simpleId);
        packProductId = simpleId;

        if (moduleActive) {
            // Six mode-swapped metas, not two. Seeding fewer produces a vendor that READS as
            // connected while `Helper::is_seller_enable_for_receive_payment()` stays false.
            await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: 'dokangit@vendor1.com' });
        }

        log.info(
            `PP-WHK setup: module_active=${moduleActive}, is_ready=${status?.is_ready}, is_test_mode=${status?.is_test_mode}, ${MODULE_PRODUCT_SUBSCRIPTION}=${subscriptionModuleActive}, credentials=${hasCredentials}.`,
        );
    });

    test.afterAll(async () => {
        // The subscription handlers write onto the ORDER CUSTOMER, which is the site customer
        // here (see PP-WHK-14 for why it is not a vendor). Leaving `can_post_product` or a stale
        // `product_order_id` behind would change how later specs see that user.
        await dbUtils.deleteUserMeta(CUSTOMER_ID, [
            'product_order_id',
            'product_package_id',
            'product_pack_startdate',
            'product_pack_enddate',
            'product_no_with_pack',
            'can_post_product',
            '_customer_recurring_subscription',
            'dokan_has_active_cancelled_subscrption',
            '_dokan_paypal_marketplace_vendor_subscription_id',
            '_dokan_subscription_is_on_trial',
            '_dokan_subscription_trial_until',
        ]);

        // PP-WHK-25 requires BOTH webhook-id options cleared: the live twin exists and is easy to
        // forget, and a stale value there would make a later live-mode run believe a webhook is
        // already registered with PayPal.
        await dbUtils.deleteOptionRow(['dokan_paypal_marketplace_test_webhook', 'dokan_paypal_marketplace_webhook']);
    });

    /* ================================================================== */
    /* PP-WHK-01 — the trust precondition for everything below            */
    /* ================================================================== */

    test('PP-WHK-01: the injection route reaches a real handler and reports no throw or fatal', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();

        const orderId = await createPayPalOrder();
        const result: WebhookInjectResult = await injectPayPalWebhook(
            PAYPAL_EVENTS.checkoutOrderCompleted,
            completedOrderResource(orderId, `PP-E2E-WHK01-${Date.now()}`, `CAP-E2E-WHK01-${Date.now()}`),
        );

        expect(result.is_handled, `the module maps ${PAYPAL_EVENTS.checkoutOrderCompleted} in Helper::get_supported_webhook_events(); if the factory no longer resolves it, every other case in this file is dispatching into a void and reporting green.`).toBe(true);
        expect(result.handler, 'CHECKOUT.ORDER.COMPLETED must resolve to the CheckoutOrderCompleted class — a different class name here means the event map was re-pointed and the rest of this file is testing the wrong handler.').toBe('CheckoutOrderCompleted');
        expect(result.fatal, `the handler raised a PHP \\Error, which EventFactory does NOT catch (it only catches \\Exception) — in production this is an uncaught fatal that returns a 500 to PayPal and triggers its retry schedule. Error: ${result.error}`).toBe(false);
        expect(result.threw, `the handler threw outside EventFactory's \\Exception catch: ${result.error}`).toBe(false);

        // The flags above are all consistent with a dead gateway, so the case is only worth
        // anything with a mutation attached.
        const captured = await getOrderMetaValue(orderId, '_dokan_paypal_payment_charge_captured');
        expect(captured, `the injection route reported success but order #${orderId} carries no _dokan_paypal_payment_charge_captured meta — the handler never actually ran, so is_handled/threw/fatal cannot be trusted as evidence anywhere else in this file.`).toBe('yes');

        log.success('PP-WHK-01: injection route drives a real handler and the handler mutates state.');
    });

    /* ================================================================== */
    /* PP-WHK-02 — the 200-means-nothing trap, documented explicitly       */
    /* ================================================================== */

    test('PP-WHK-02: a not-ready gateway answers 200 without processing the event', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();
        test.skip(
            !hasCredentials,
            'This case has to prove the gateway was READY before it makes it not-ready, otherwise "no state changed" is trivially true on an unconfigured site. Readiness needs TEST_MERCHANT_ID_PAYPAL_MARKETPLACE + TEST_CLIENT_ID_PAYPAL_MARKETPLACE + TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE.',
        );

        const before = await getPayPalStatus();
        expect(before.is_ready, 'the positive baseline for this case: the gateway must be READY first, or "not-ready produced no state change" proves nothing at all.').toBe(true);

        const orderId = await createPayPalOrder();
        const statusBefore = await getOrderStatus(orderId);

        try {
            await ensurePayPalConfigured({ enabled: 'no' });
            const notReady = await getPayPalStatus();
            expect(notReady.is_ready, 'disabling the gateway must make Helper::is_ready() false — without that this case never reaches the branch it exists to document.').toBe(false);

            const httpStatus = await postUnsignedWebhook(PAYPAL_EVENTS.checkoutOrderCompleted, completedOrderResource(orderId, 'PP-E2E-WHK02', 'CAP-E2E-WHK02'));

            // WebhookHandler.php:53 — status_header(200); exit() BEFORE file_get_contents('php://input').
            expect(httpStatus, 'the not-ready branch of WebhookHandler::handle_events() answers 200 and exits; anything else means that early return moved and PayPal is now being told to retry deliveries a disabled gateway will never process.').toBe(200);

            // The whole point: that 200 is indistinguishable from success, so assert the state.
            expect(await getOrderStatus(orderId), `order #${orderId} changed status while the gateway was disabled — a not-ready gateway must not process an event.`).toBe(statusBefore);
            expect(
                await getOrderMetaValue(orderId, '_dokan_paypal_payment_charge_captured'),
                `order #${orderId} was marked captured by a webhook delivered while the gateway was NOT ready — the 200 was a real processing run, not the documented early exit.`,
            ).toBeUndefined();
        } finally {
            await ensurePayPalConfigured({ enabled: 'yes' });
        }

        const after = await getPayPalStatus();
        expect(after.is_ready, 'the gateway must be re-enabled after this case, or every PayPal spec that runs afterwards silently skips or fails.').toBe(true);

        log.success('PP-WHK-02: 200 from the live endpoint is not evidence of processing — pinned.');
    });

    /* ================================================================== */
    /* PP-WHK-03 — CHECKOUT.ORDER.APPROVED                                 */
    /* ================================================================== */

    test('PP-WHK-03: CHECKOUT.ORDER.APPROVED runs the capture for a pending order and skips one already paid', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();
        test.skip(
            !hasCredentials,
            'CheckoutOrderApproved has exactly one observable effect and it sits behind Processor::capture_payment(), a live outbound call to PayPal. Without credentials the token request fails before PayPal is ever reached, the WP_Error carries no paypal-debug-id, and nothing at all is written — so the case could only assert "nothing happened", which is what a dead handler looks like too.',
        );

        // The discriminator. Both orders receive the SAME event; only the pending one is allowed
        // past `$order->has_status( [ 'processing', 'completed' ] )` into the capture call, and
        // the failed capture records PayPal's debug id via Helper::log_paypal_error().
        const pendingOrderId = await createPayPalOrder({ status: 'pending' });
        const paidOrderId = await createPayPalOrder({ status: 'processing', setPaid: true });

        const approvedFor = (orderId: number) => ({
            id: `PP-E2E-WHK03-${orderId}`,
            status: 'APPROVED',
            intent: 'CAPTURE',
            purchase_units: [{ invoice_id: String(orderId), custom_id: String(orderId), amount: { currency_code: 'USD', value: '10.00' } }],
        });

        const pendingResult = await injectPayPalWebhook(PAYPAL_EVENTS.checkoutOrderApproved, approvedFor(pendingOrderId));
        expect(pendingResult.handler, 'CHECKOUT.ORDER.APPROVED must resolve to CheckoutOrderApproved.').toBe('CheckoutOrderApproved');
        expect(pendingResult.fatal, `CheckoutOrderApproved raised a PHP \\Error, which EventFactory does not catch — PayPal would receive a 500 and retry. Error: ${pendingResult.error}`).toBe(false);

        await injectPayPalWebhook(PAYPAL_EVENTS.checkoutOrderApproved, approvedFor(paidOrderId));

        // `Helper::log_paypal_error()` writes with update_post_meta(), so this is read from
        // postmeta directly rather than through the order data store (this site runs HPOS).
        const pendingDebugId = await rawPostMetaValue(pendingOrderId, '_dokan_paypal_capture_payment_debug_id');
        const paidDebugId = await rawPostMetaValue(paidOrderId, '_dokan_paypal_capture_payment_debug_id');

        expect(
            pendingDebugId,
            `order #${pendingOrderId} is pending, so CheckoutOrderApproved should have called Processor::capture_payment() and recorded PayPal's debug id for the (expected) failure against a synthetic PayPal order id. Nothing was recorded, which means the handler returned before the capture — the approval webhook is not driving captures at all, and a customer who approves on PayPal is never charged.`,
        ).not.toBeNull();

        expect(
            paidDebugId,
            `order #${paidOrderId} is already processing, so CheckoutOrderApproved must return at its has_status() guard without contacting PayPal. It attempted a capture anyway (debug id ${paidDebugId}) — a redelivered approval event would double-charge an order that is already paid.`,
        ).toBeNull();

        log.success('PP-WHK-03: the approved handler captures for pending orders and short-circuits for paid ones.');
    });

    /* ================================================================== */
    /* PP-WHK-04 — CHECKOUT.ORDER.COMPLETED                                */
    /* ================================================================== */

    test('PP-WHK-04: CHECKOUT.ORDER.COMPLETED stores the capture data and completes payment', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();

        const orderId = await createPayPalOrder({ status: 'pending', setPaid: false });
        const paypalOrderId = `PP-E2E-WHK04-${Date.now()}`;
        const captureId = `CAP-E2E-WHK04-${Date.now()}`;

        const result = await injectPayPalWebhook(PAYPAL_EVENTS.checkoutOrderCompleted, completedOrderResource(orderId, paypalOrderId, captureId));
        expect(result.fatal, `CheckoutOrderCompleted raised a PHP \\Error: ${result.error}`).toBe(false);

        expect(
            await getOrderMetaValue(orderId, '_dokan_paypal_payment_capture_id'),
            `the capture id was never stored on order #${orderId}. Without it no automatic refund can ever be issued for this order — Refund::process_refund() aborts on a missing _dokan_paypal_payment_capture_id.`,
        ).toBe(captureId);

        expect(
            await getOrderMetaValue(orderId, '_dokan_paypal_payment_charge_captured'),
            `order #${orderId} was not flagged as captured, so a redelivered CHECKOUT.ORDER.COMPLETED would process the same payment a second time (OrderManager::is_charge_captured is the only guard).`,
        ).toBe('yes');

        // Order completion is driven by THIS event. There is no PAYMENT.CAPTURE.COMPLETED handler
        // in this module — see PP-WHK-05.
        const orderStatus = await getOrderStatus(orderId);
        expect(
            orderStatus,
            `order #${orderId} is still "${orderStatus}" after a COMPLETED capture event. payment_complete() never ran, so the customer has paid PayPal while the shop shows the order unpaid and the vendor is never credited.`,
        ).toMatch(/^(processing|completed)$/);

        const notes = await getOrderNotes(orderId);
        expect(
            notes.some(n => n.includes('payment is completed via')),
            `order #${orderId} carries no completion note. Notes seen: ${JSON.stringify(notes).slice(0, 300)}`,
        ).toBe(true);

        log.success('PP-WHK-04: completion is driven by CHECKOUT.ORDER.COMPLETED, capture data stored.');
    });

    /* ================================================================== */
    /* PP-WHK-05 / 06 — the two events the brief assumed and the module    */
    /*                  does not implement                                 */
    /* ================================================================== */

    for (const [caseId, eventType, gap] of [
        [
            'PP-WHK-05',
            PAYPAL_UNHANDLED_EVENTS.captureCompleted,
            'order completion is driven by CHECKOUT.ORDER.COMPLETED instead (PP-WHK-04), so the absence is survivable — but it is invisible, and anyone reading PayPal\'s event catalogue would reasonably assume this is the completion path.',
        ],
        [
            'PP-WHK-06',
            PAYPAL_UNHANDLED_EVENTS.captureDenied,
            'there is therefore NO decline path in this module at all: when PayPal denies a capture the shop is never told, and the order sits pending forever with no note, no status change and no customer email. That is a genuine functional gap, not merely an unimplemented handler.',
        ],
    ] as const) {
        test(`${caseId}: ${eventType} resolves to no handler and mutates nothing`, { tag: ['@pro', '@guest'] }, async () => {
            requireModule();

            const orderId = await createPayPalOrder({ status: 'pending', setPaid: false });

            // POSITIVE CONTROL. Without this, "the unhandled event changed nothing" is exactly
            // what a completely dead injection route also produces.
            const control = await injectPayPalWebhook(
                PAYPAL_EVENTS.checkoutOrderCompleted,
                completedOrderResource(orderId, `PP-E2E-${caseId}`, `CAP-E2E-${caseId}`),
            );
            expect(control.is_handled, 'positive control: a mapped event must resolve.').toBe(true);
            expect(
                await getOrderMetaValue(orderId, '_dokan_paypal_payment_charge_captured'),
                `positive control failed — a mapped event did not mutate order #${orderId}, so the "no handler" assertion below would pass for the wrong reason.`,
            ).toBe('yes');

            const statusAfterControl = await getOrderStatus(orderId);
            const notesAfterControl = (await getOrderNotes(orderId)).length;
            const refundsAfterControl = (await refundRowsForOrder(orderId)).length;

            const result = await injectPayPalWebhook(eventType, refundResource(orderId, `REF-E2E-${caseId}`));

            expect(
                result.is_handled,
                `${eventType} now resolves to a handler ("${result.handler}"). If a handler was added, this case is stale and the coverage gap it pins has closed — update the catalogue rather than deleting the assertion. Gap as recorded: ${gap}`,
            ).toBe(false);
            expect(result.handler, `${eventType} must map to nothing in Helper::get_supported_webhook_events().`).toBeNull();
            expect(result.threw, `dispatching an unmapped event must not throw — EventFactory::get() returns early for it. Error: ${result.error}`).toBe(false);
            expect(result.fatal, `dispatching an unmapped event raised a PHP \\Error: ${result.error}`).toBe(false);

            expect(await getOrderStatus(orderId), `order #${orderId} changed status from an event the module maps to no handler.`).toBe(statusAfterControl);
            expect((await getOrderNotes(orderId)).length, `order #${orderId} gained an order note from an unmapped event.`).toBe(notesAfterControl);
            expect((await refundRowsForOrder(orderId)).length, `an unmapped event created a dokan_refund row against order #${orderId}.`).toBe(refundsAfterControl);

            log.warn(`${caseId}: ${eventType} has no handler in dokan-pro 5.0.9 — ${gap}`);
        });
    }

    /* ================================================================== */
    /* PP-WHK-07 — PAYMENT.CAPTURE.REFUNDED                                */
    /* ================================================================== */

    test('PP-WHK-07: PAYMENT.CAPTURE.REFUNDED creates an approved Dokan refund and reverses the vendor balance', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();

        const orderId = await createPayPalOrder({ status: 'processing', setPaid: true });
        const refundId = `REF-E2E-WHK07-${Date.now()}`;

        expect((await refundRowsForOrder(orderId)).length, 'a freshly created order must start with no refund rows, or the count assertions below mean nothing.').toBe(0);

        const result = await injectPayPalWebhook(PAYPAL_EVENTS.captureRefunded, refundResource(orderId, refundId));
        expect(result.handler, 'PAYMENT.CAPTURE.REFUNDED must resolve to PaymentCaptureRefunded.').toBe('PaymentCaptureRefunded');
        expect(result.fatal, `PaymentCaptureRefunded raised a PHP \\Error: ${result.error}`).toBe(false);

        const rows = await refundRowsForOrder(orderId);
        expect(
            rows.length,
            `a refund completed on PayPal produced ${rows.length} dokan_refund rows for order #${orderId} instead of 1 — the shop's ledger no longer matches what PayPal actually refunded.`,
        ).toBe(1);

        expect(
            String(await getOrderMetaValue(orderId, '_dokan_paypal_refund_id')),
            `the PayPal refund id was not recorded on order #${orderId}. That meta is the ONLY replay guard PaymentCaptureRefunded has, so without it a redelivered refund event books the same refund twice.`,
        ).toContain(refundId);

        const notes = await getOrderNotes(orderId);
        expect(
            notes.some(n => n.includes('Refund Processed Via PayPal Dashboard')),
            `order #${orderId} has no refund note, so a refund issued from the PayPal dashboard leaves no audit trail in the shop. Notes seen: ${JSON.stringify(notes).slice(0, 300)}`,
        ).toBe(true);

        // status: 0 = pending, 1 = approved (see dbUtils.createRefundRequest).
        expect(
            Number(rows[0]!.status),
            `the refund row for order #${orderId} is still pending. The money has already left PayPal, so an unapproved row means the vendor's earnings were never reversed and the marketplace is short by the refunded amount until someone approves it by hand.`,
        ).toBe(1);

        const balanceRows = await balanceRowsForOrder(orderId, 'dokan_refund');
        expect(
            balanceRows.length,
            `no dokan_vendor_balance row of type dokan_refund exists for order #${orderId} — the vendor keeps the earnings on a refunded order.`,
        ).toBeGreaterThan(0);

        log.success('PP-WHK-07: refund webhook creates an approved refund and a vendor-balance reversal.');
    });

    /* ================================================================== */
    /* PP-WHK-08 — PAYMENT.CAPTURE.REVERSED aliases to the refund handler  */
    /* ================================================================== */

    test('PP-WHK-08: PAYMENT.CAPTURE.REVERSED is booked as an ordinary refund', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();

        const orderId = await createPayPalOrder({ status: 'processing', setPaid: true });
        const reversalId = `REF-E2E-WHK08-${Date.now()}`;

        const result = await injectPayPalWebhook(PAYPAL_EVENTS.captureReversed, refundResource(orderId, reversalId));

        expect(
            result.handler,
            'PAYMENT.CAPTURE.REVERSED is mapped to PaymentCaptureRefunded in Helper::get_supported_webhook_events() — the same class as a merchant refund. If that mapping changes, a chargeback would start behaving differently from a refund and this case is the only place that difference is pinned.',
        ).toBe('PaymentCaptureRefunded');
        expect(result.fatal, `the reversal handler raised a PHP \\Error: ${result.error}`).toBe(false);

        const rows = await refundRowsForOrder(orderId);
        expect(
            rows.length,
            `a PayPal reversal produced ${rows.length} dokan_refund rows for order #${orderId} instead of 1. Note the behavioural consequence being pinned here: a chargeback-style reversal is INDISTINGUISHABLE from a merchant-initiated refund in Dokan's ledger — nothing records that the money was clawed back rather than given back.`,
        ).toBe(1);

        const notes = await getOrderNotes(orderId);
        expect(
            notes.some(n => n.includes('Refund Processed Via PayPal Dashboard')),
            `order #${orderId} carries no note for the reversal. Notes seen: ${JSON.stringify(notes).slice(0, 300)}`,
        ).toBe(true);

        // ---------------------------------------------------------------
        // The open question recorded on this case: does a real reversal payload carry the
        // refund-shaped `seller_payable_breakdown`? PaymentCaptureRefunded.php:85 dereferences it
        // with no isset guard and then reads five nested properties off it, so a payload without
        // one produces "Attempt to read property on null" — a PHP \Error, which EventFactory does
        // NOT catch (it catches \Exception only). This probe answers the question from the
        // product's side: whatever PayPal sends, the handler must not fatal on it.
        // ---------------------------------------------------------------
        const bareOrderId = await createPayPalOrder({ status: 'processing', setPaid: true });
        const bareResult = await injectPayPalWebhook(PAYPAL_EVENTS.captureReversed, {
            id: `REF-E2E-WHK08-BARE-${Date.now()}`,
            status: 'COMPLETED',
            custom_id: String(bareOrderId),
            amount: { currency_code: 'USD', value: '10.00' },
        });

        expect(
            bareResult.fatal,
            `a PAYMENT.CAPTURE.REVERSED payload without seller_payable_breakdown fatalled the handler (${bareResult.error}). PaymentCaptureRefunded.php:85 reads $event->resource->seller_payable_breakdown unguarded and then walks five properties off it; a \\Error is not caught by EventFactory, so the endpoint answers 500 and PayPal retries the delivery on its full schedule. Worse, _dokan_paypal_refund_id was already written and saved before the fatal, so each retry finds the refund "already processed" and returns early — the refund is never actually booked. CONFIRM against a real reversal payload and file this if it holds.`,
        ).toBe(false);

        log.success('PP-WHK-08: reversal aliases to the refund handler; breakdown-less payload probed.');
    });

    /* ================================================================== */
    /* PP-WHK-09 — PAYMENT.SALE.COMPLETED renewal                          */
    /* ================================================================== */

    test('PP-WHK-09: PAYMENT.SALE.COMPLETED creates exactly one renewal order per event', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();
        requireSubscriptionModule();

        const subscriptionId = `I-E2EWHK09${Date.now()}`;
        const transactionId = `SALE-E2E-WHK09-${Date.now()}`;

        // A subscription order that has already been paid once — `$is_renewal` is
        // `! empty( _dokan_paypal_payment_capture_id )`, so the initial capture id is what puts
        // this event on the renewal branch at all.
        const orderId = await createPayPalOrder({
            status: 'processing',
            setPaid: true,
            customerId: CUSTOMER_ID,
            meta: [
                { key: '_dokan_vendor_subscription_order', value: 'yes' },
                { key: '_dokan_paypal_marketplace_vendor_subscription_id', value: subscriptionId },
                { key: '_dokan_paypal_payment_capture_id', value: `CAP-E2E-WHK09-INITIAL` },
            ],
        });

        const saleResource = {
            id: transactionId,
            state: 'completed',
            billing_agreement_id: subscriptionId,
            custom: String(orderId),
            amount: { total: '10.00', currency: 'USD' },
            transaction_fee: { currency: 'USD', value: '0.54' },
        };

        // Baselined rather than assumed to be zero: a renewal order is a CHILD of the
        // subscription order, and Dokan's own order splitter also produces children. Only the
        // delta caused by the event is this case's business.
        const childrenBefore = (await dbUtils.getChildOrderIds(String(orderId))).length;

        const first = await injectPayPalWebhook(PAYPAL_EVENTS.saleCompleted, saleResource);
        expect(first.handler, 'PAYMENT.SALE.COMPLETED must resolve to PaymentSaleCompleted.').toBe('PaymentSaleCompleted');
        expect(first.fatal, `PaymentSaleCompleted raised a PHP \\Error: ${first.error}`).toBe(false);

        const afterFirst = await dbUtils.getChildOrderIds(String(orderId));
        expect(
            afterFirst.length - childrenBefore,
            `one PAYMENT.SALE.COMPLETED produced ${afterFirst.length - childrenBefore} renewal orders for subscription order #${orderId} instead of exactly 1 — the vendor is billed once by PayPal but the shop records a different number of renewals, so subscription validity dates and earnings both drift.`,
        ).toBe(1);

        // Redelivery. PayPal retries a delivery it did not get a 200 for, so the same sale event
        // arriving twice is ordinary, not exotic.
        const second = await injectPayPalWebhook(PAYPAL_EVENTS.saleCompleted, saleResource);
        expect(second.fatal, `the redelivered sale event raised a PHP \\Error: ${second.error}`).toBe(false);

        const afterSecond = await dbUtils.getChildOrderIds(String(orderId));

        // Everything above this line is a control and must go RED on its own. From here on the case
        // asserts behaviour DOK-025 currently gets wrong, so only the last assertion is expected to
        // fail — and the moment it stops failing, Playwright reports "expected to fail, but passed"
        // and this marker is what gets deleted. Same treatment as its twin, PP-SUB-09.
        test.fail();

        expect(
            afterSecond.length - childrenBefore,
            `a REDELIVERED PAYMENT.SALE.COMPLETED created a second renewal order (${afterSecond.length - childrenBefore} now exist for order #${orderId}). CONFIRMED defect DOK-025, verified against dokan-pro 5.0.9 source: the dedup query at ` +
                `modules/paypal-marketplace/includes/WebhookEvents/PaymentSaleCompleted.php:110 searches for meta key "_dokan_stripe_payment_capture_id", a STRIPE key, while this module writes "_dokan_paypal_payment_capture_id" through SubscriptionOrderMetaBuilder( $subscription, 'paypal' ). The dedup can therefore never match, and every PayPal retry bills the vendor another renewal order and extends the pack again. This assertion states the CORRECT behaviour; when it starts passing, DOK-025 is fixed and the test.fail() above must be removed.`,
        ).toBe(1);

        log.success('PP-WHK-09: one renewal order per sale event, including on redelivery.');
    });

    /* ================================================================== */
    /* PP-WHK-10 — PAYMENT.REFERENCED-PAYOUT-ITEM.COMPLETED                */
    /* ================================================================== */

    test('PP-WHK-10: PAYMENT.REFERENCED-PAYOUT-ITEM.COMPLETED releases a parked disbursement', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();

        const orderId = await createPayPalOrder({ status: 'processing', setPaid: true });

        // Park the disbursement the way the product does it: with a non-INSTANT disbursement mode
        // on the order, `OrderManager::insert_vendor_withdraw_balance( $withdraw, false )` stores
        // the withdraw payload as order meta instead of crediting the vendor.
        await setOrderMeta(orderId, [{ key: '_dokan_paypal_payment_disbursement_mode', value: 'DELAYED' }]);
        await injectPayPalWebhook(PAYPAL_EVENTS.checkoutOrderCompleted, completedOrderResource(orderId, `PP-E2E-WHK10-${Date.now()}`, `CAP-E2E-WHK10-${Date.now()}`));

        // Precondition PROVEN, not assumed — the payout handler returns immediately when the
        // balance was already added, so a test that skipped this would pass on an empty branch.
        expect(
            await getOrderMetaValue(orderId, '_dokan_paypal_payment_withdraw_balance_added'),
            `order #${orderId} was expected to hold a PARKED disbursement (balance_added = "no") after a delayed-mode capture. Without that precondition the payout handler has nothing to release and the assertions below would pass against a no-op.`,
        ).toBe('no');
        expect(await getOrderMetaValue(orderId, '_dokan_paypal_payment_withdraw_data'), `order #${orderId} carries no parked withdraw payload, so there is nothing for the payout event to disburse.`).toBeTruthy();
        expect((await balanceRowsForOrder(orderId, 'dokan_withdraw')).length, 'a parked disbursement must not have credited the vendor yet.').toBe(0);

        const result = await injectPayPalWebhook(PAYPAL_EVENTS.payoutItemCompleted, {
            invoice_id: String(orderId),
            payout_item_id: `PAYOUT-E2E-WHK10-${Date.now()}`,
            transaction_status: 'SUCCESS',
            amount: { currency: 'USD', value: '9.46' },
        });

        expect(result.handler, 'PAYMENT.REFERENCED-PAYOUT-ITEM.COMPLETED must resolve to PaymentReferencedPayoutItemCompleted.').toBe('PaymentReferencedPayoutItemCompleted');
        expect(result.fatal, `the payout handler raised a PHP \\Error: ${result.error}`).toBe(false);

        expect(
            await getOrderMetaValue(orderId, '_dokan_paypal_payment_withdraw_balance_added'),
            `PayPal confirmed the payout for order #${orderId} but the order is still flagged as not disbursed. The vendor has the money at PayPal and no balance in Dokan, and the next payout event will try to disburse it all over again.`,
        ).toBe('yes');

        const balanceRows = await balanceRowsForOrder(orderId, 'dokan_withdraw');
        expect(balanceRows.length, `no dokan_vendor_balance row of type dokan_withdraw was written for order #${orderId} — the completed payout never reached the vendor's ledger.`).toBe(1);

        const notes = await getOrderNotes(orderId);
        expect(
            notes.some(n => n.includes('Successfully disbursed fund to the vendor')),
            `order #${orderId} has no disbursement note. Notes seen: ${JSON.stringify(notes).slice(0, 300)}`,
        ).toBe(true);

        log.success('PP-WHK-10: a completed payout item releases the parked disbursement.');
    });

    /* ================================================================== */
    /* PP-WHK-11 — MERCHANT.ONBOARDING.COMPLETED                           */
    /* ================================================================== */

    test('PP-WHK-11: MERCHANT.ONBOARDING.COMPLETED marks the vendor connection successful', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();

        const keys = status?.vendor_meta_keys ?? {};
        const settingsKey = keys['marketplace_settings'];
        const merchantKey = keys['merchant_id'];
        expect(settingsKey, 'the /status route must report the mode-swapped vendor meta keys; without them this case cannot address the right metas.').toBeTruthy();
        expect(merchantKey, 'the /status route must report the mode-swapped merchant-id key.').toBeTruthy();

        const merchantId = PAYPAL_MERCHANTS.vendor2;

        // "Unconnected" in the sense the handler cares about: findable by merchant id (otherwise
        // Helper::get_user_id_by_merchant_id() returns 0 and the handler logs and returns) but
        // NOT yet flagged as a successful connection. connection_status is written explicitly
        // rather than left absent, because MerchantOnboardingCompleted.php:54 reads that array
        // key with no isset guard and an absent key emits a PHP warning into the REST response.
        await seedPayPalConnectedVendor(VENDOR2_ID, merchantId, { email: 'dokangit@vendor2.com' });
        await dbUtils.setUserMeta(String(VENDOR2_ID), settingsKey!, { merchant_id: merchantId, email: 'dokangit@vendor2.com', connection_status: 'pending' }, true);

        const before = (await dbUtils.getUserMeta(String(VENDOR2_ID), settingsKey!)) as Record<string, unknown>;
        expect(before['connection_status'], 'positive baseline: the vendor must start in a NOT-successful connection state, or "connection_status is success" afterwards proves nothing.').toBe('pending');

        // Same baseline discipline for the payout email. Nothing in this suite ever clears
        // dokan_profile_settings, and handle_connect_success_response() republishes the SAME
        // seeded address every run — so on any re-run (or after any onboarding spec that connects
        // vendor2) the entry is already populated and a bare truthiness check afterwards would
        // pass even if the handler stopped writing it entirely. Merged, not assigned: the vendor's
        // store settings live in this same meta and must survive.
        await dbUtils.updateUserMeta(String(VENDOR2_ID), 'dokan_profile_settings', { payment: { [PAYPAL_GATEWAY_ID]: { email: '' } } });
        const profileBefore = (await dbUtils.getUserMeta(String(VENDOR2_ID), 'dokan_profile_settings')) as Record<string, Record<string, Record<string, unknown>>>;
        expect(
            profileBefore?.['payment']?.[PAYPAL_GATEWAY_ID]?.['email'],
            'positive baseline: the vendor\'s stored PayPal payout email must start EMPTY, or "an email is present" afterwards is satisfied by a previous run rather than by this webhook.',
        ).toBe('');

        const result = await injectPayPalWebhook(PAYPAL_EVENTS.merchantOnboardingCompleted, {
            merchant_id: merchantId,
            tracking_id: `_dokan_paypal_e2e_${VENDOR2_ID}`,
            merchant_details: { email: 'dokangit@vendor2.com' },
        });

        expect(result.handler, 'MERCHANT.ONBOARDING.COMPLETED must resolve to MerchantOnboardingCompleted.').toBe('MerchantOnboardingCompleted');
        expect(result.fatal, `MerchantOnboardingCompleted raised a PHP \\Error: ${result.error}`).toBe(false);

        const after = (await dbUtils.getUserMeta(String(VENDOR2_ID), settingsKey!)) as Record<string, unknown>;
        expect(
            after['connection_status'],
            `vendor ${VENDOR2_ID} finished PayPal onboarding but Dokan never recorded the connection as successful. The vendor's payment settings screen keeps offering "Sign Up" for an account that is already onboarded, and no amount of retrying on PayPal's side will change it — the webhook is the only path that closes this loop for a vendor who abandoned the browser redirect.`,
        ).toBe('success');

        // handle_connect_success_response() also republishes the payout email into the vendor's
        // Dokan profile; that is the copy the vendor dashboard renders.
        const profile = (await dbUtils.getUserMeta(String(VENDOR2_ID), 'dokan_profile_settings')) as Record<string, Record<string, Record<string, unknown>>>;
        expect(
            profile?.['payment']?.[PAYPAL_GATEWAY_ID]?.['email'],
            `the vendor's dokan_profile_settings payment entry for ${PAYPAL_GATEWAY_ID} was not re-written from the onboarding event (it was blanked before the injection), so the vendor dashboard still shows no PayPal payout email after a completed onboarding.`,
        ).toBe('dokangit@vendor2.com');

        log.success('PP-WHK-11: onboarding-completed flips the stored connection status to success.');
    });

    /* ================================================================== */
    /* PP-WHK-12 — MERCHANT.PARTNER-CONSENT.REVOKED                        */
    /* ================================================================== */

    test('PP-WHK-12: MERCHANT.PARTNER-CONSENT.REVOKED disconnects the vendor completely', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();

        const keys = status?.vendor_meta_keys ?? {};
        const metaKeys = Object.values(keys);
        expect(metaKeys.length, 'the /status route must report all six mode-swapped vendor meta keys for this case to check them.').toBe(6);

        const merchantId = PAYPAL_MERCHANTS.vendor2;

        try {
            // Positive baseline: prove the vendor is genuinely payable BEFORE asserting the
            // revocation removed it. `receivable` is Helper::is_seller_enable_for_receive_payment(),
            // which is the same predicate PayPal::is_available() uses at checkout.
            const seed = await seedPayPalConnectedVendor(VENDOR2_ID, merchantId, { email: 'dokangit@vendor2.com' });
            expect(
                seed.receivable,
                `vendor ${VENDOR2_ID} could not be seeded into a payable state, so "the metas are gone after revocation" would be true before the webhook even ran.`,
            ).toBe(true);

            const result = await injectPayPalWebhook(PAYPAL_EVENTS.merchantConsentRevoked, { merchant_id: merchantId });
            expect(result.handler, 'MERCHANT.PARTNER-CONSENT.REVOKED must resolve to MerchantPartnerConsentRevoked.').toBe('MerchantPartnerConsentRevoked');
            expect(result.fatal, `MerchantPartnerConsentRevoked raised a PHP \\Error: ${result.error}`).toBe(false);

            for (const metaKey of metaKeys) {
                expect(
                    await dbUtils.getUserMetaValue(VENDOR2_ID, metaKey),
                    `vendor ${VENDOR2_ID} revoked this marketplace's PayPal consent but "${metaKey}" survived. Any surviving key leaves the vendor looking connected: the gateway keeps offering itself at checkout for that vendor's products and every capture then fails at PayPal with an opaque payee error the shopper cannot act on.`,
                ).toBeNull();
            }
        } finally {
            // Re-seed. The canonical suite state is "both vendors connected", and leaving vendor2
            // revoked would break every availability spec that runs after this one.
            await seedPayPalConnectedVendor(VENDOR2_ID, merchantId, { email: 'dokangit@vendor2.com' });
        }

        log.success('PP-WHK-12: consent revocation removes all six vendor metas.');
    });

    /* ================================================================== */
    /* PP-WHK-13 … 18 — BILLING.SUBSCRIPTION.*                             */
    /*                                                                     */
    /* The order CUSTOMER is the site customer, not a vendor, and that is  */
    /* deliberate. These handlers treat the order's customer purely as a   */
    /* user id, but `SubscriptionHelper::delete_subscription_pack()`       */
    /* (reached by PP-WHK-14/15) queues `Helper::make_product_draft()` for */
    /* any subscriber that owns products — a BACKGROUND job that drafts    */
    /* EVERY product that user owns. Pointing that at vendor1 or vendor2   */
    /* would silently unpublish the shared product fixtures the rest of    */
    /* the suite depends on.                                               */
    /* ================================================================== */

    test('PP-WHK-13: BILLING.SUBSCRIPTION.ACTIVATED activates the subscription pack', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();
        requireSubscriptionModule();

        const subscriptionId = `I-E2EWHK13${Date.now()}`;

        // BillingSubscriptionActivated takes the RE-activation branch first when the subscriber
        // carries `dokan_has_active_cancelled_subscrption`; clear it so this case exercises the
        // activation path it is named for.
        await dbUtils.deleteUserMeta(CUSTOMER_ID, ['dokan_has_active_cancelled_subscrption', '_dokan_paypal_marketplace_vendor_subscription_id', 'can_post_product', 'product_order_id', 'product_package_id']);

        const orderId = await createPayPalOrder({
            status: 'processing',
            setPaid: true,
            customerId: CUSTOMER_ID,
            productId: packProductId,
            meta: [
                { key: '_dokan_vendor_subscription_order', value: 'yes' },
                { key: '_dokan_paypal_marketplace_vendor_subscription_id', value: subscriptionId },
            ],
        });

        // start_time / billing_info are deliberately omitted: the handler feeds them straight into
        // `dokan_current_datetime()->modify()` and formats the result without checking it.
        const result = await injectPayPalWebhook(PAYPAL_EVENTS.subscriptionActivated, {
            id: subscriptionId,
            status: 'ACTIVE',
            custom_id: String(orderId),
            plan_id: 'P-E2E-WHK13',
        });

        expect(result.handler, 'BILLING.SUBSCRIPTION.ACTIVATED must resolve to BillingSubscriptionActivated.').toBe('BillingSubscriptionActivated');
        expect(result.fatal, `BillingSubscriptionActivated raised a PHP \\Error: ${result.error}`).toBe(false);

        expect(
            await dbUtils.getUserMetaValue(CUSTOMER_ID, '_dokan_paypal_marketplace_vendor_subscription_id'),
            `the PayPal subscription id was never stored against the subscriber. Every later BILLING.SUBSCRIPTION.* event resolves the subscriber through Helper::get_vendor_id_by_subscription(), which reads exactly this meta — without it the cancel, suspend and re-activate webhooks all become no-ops for this subscription.`,
        ).toBe(subscriptionId);

        expect(
            await dbUtils.getUserMetaValue(CUSTOMER_ID, 'can_post_product'),
            `the subscription pack was not activated: the subscriber cannot post products even though PayPal reports the subscription ACTIVE and has started billing for it.`,
        ).toBe('1');

        expect(
            await dbUtils.getUserMetaValue(CUSTOMER_ID, 'product_order_id'),
            'the pack was not linked back to its order, so cancelling later cannot find the subscription to delete.',
        ).toBe(String(orderId));

        const notes = await getOrderNotes(orderId);
        expect(
            notes.some(n => n.includes('Subscription activated')),
            `order #${orderId} has no activation note. Notes seen: ${JSON.stringify(notes).slice(0, 300)}`,
        ).toBe(true);

        log.success('PP-WHK-13: activation webhook activates the pack and links it to the order.');
    });

    /**
     * PP-WHK-14 and PP-WHK-15 are the same handler reached through two event strings —
     * `BILLING.SUBSCRIPTION.CANCELLED` and `BILLING.SUBSCRIPTION.EXPIRED` both map to
     * `BillingSubscriptionCancelled`. The alias is deliberate in the code and behaviourally
     * significant: an expired subscription and a cancelled one are indistinguishable afterwards.
     */
    for (const [caseId, eventType, title] of [
        ['PP-WHK-14', PAYPAL_EVENTS.subscriptionCancelled, 'BILLING.SUBSCRIPTION.CANCELLED deletes the subscription pack'],
        ['PP-WHK-15', PAYPAL_EVENTS.subscriptionExpired, 'BILLING.SUBSCRIPTION.EXPIRED is an exact alias of cancellation'],
    ] as const) {
        test(`${caseId}: ${title}`, { tag: ['@pro', '@guest'] }, async () => {
            requireModule();
            requireSubscriptionModule();

            const subscriptionId = `I-E2E${caseId.replace(/-/g, '')}${Date.now()}`;

            const orderId = await createPayPalOrder({
                status: 'processing',
                setPaid: true,
                customerId: CUSTOMER_ID,
                productId: packProductId,
                meta: [
                    { key: '_dokan_vendor_subscription_order', value: 'yes' },
                    { key: '_dokan_paypal_marketplace_vendor_subscription_id', value: subscriptionId },
                ],
            });

            // An ACTIVE pack, established exactly as SubscriptionPack::activate_subscription()
            // leaves it. `product_order_id` must match the order or
            // SubscriptionHelper::delete_subscription_pack() returns before deleting anything.
            await dbUtils.setUserMeta(String(CUSTOMER_ID), '_dokan_paypal_marketplace_vendor_subscription_id', subscriptionId, false);
            await dbUtils.setUserMeta(String(CUSTOMER_ID), 'product_order_id', String(orderId), false);
            await dbUtils.setUserMeta(String(CUSTOMER_ID), 'product_package_id', String(packProductId), false);
            await dbUtils.setUserMeta(String(CUSTOMER_ID), 'can_post_product', '1', false);

            expect(
                await dbUtils.getUserMetaValue(CUSTOMER_ID, 'can_post_product'),
                'positive baseline: the subscription must be ACTIVE before cancellation, or "the pack is gone" is true before the webhook runs.',
            ).toBe('1');

            const result = await injectPayPalWebhook(eventType, {
                id: subscriptionId,
                status: caseId === 'PP-WHK-15' ? 'EXPIRED' : 'CANCELLED',
                custom_id: String(orderId),
                plan_id: `P-E2E-${caseId}`,
            });

            expect(
                result.handler,
                `${eventType} must resolve to BillingSubscriptionCancelled. Both CANCELLED and EXPIRED are mapped to that one class in Helper::get_supported_webhook_events(), which is what makes expiry and cancellation behaviourally identical in this module.`,
            ).toBe('BillingSubscriptionCancelled');
            expect(result.fatal, `the cancellation handler raised a PHP \\Error: ${result.error}`).toBe(false);

            for (const metaKey of ['product_order_id', 'product_package_id', 'can_post_product', '_dokan_paypal_marketplace_vendor_subscription_id']) {
                expect(
                    await dbUtils.getUserMetaValue(CUSTOMER_ID, metaKey),
                    `the subscription ended at PayPal but "${metaKey}" survived on the subscriber. A vendor whose subscription lapsed keeps posting products and keeps their subscription-tier commission rate, and PayPal has stopped billing them for it.`,
                ).toBeNull();
            }

            const notes = await getOrderNotes(orderId);
            expect(
                notes.some(n => n.includes('Subscription Cancelled')),
                `order #${orderId} carries no cancellation note, so nothing in the shop records why the pack disappeared. Notes seen: ${JSON.stringify(notes).slice(0, 300)}`,
            ).toBe(true);

            log.success(`${caseId}: ${eventType} routed to BillingSubscriptionCancelled and removed the pack.`);
        });
    }

    test('PP-WHK-16: BILLING.SUBSCRIPTION.SUSPENDED suspends the pack', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();
        test.skip(
            !HAS_PAYPAL_SUBSCRIPTION_FIXTURE,
            'BillingSubscriptionSuspended cannot mutate anything without a subscription that really exists on PayPal: it calls Subscriptions\\Processor::get_subscription( $subscription_id ) over the network and returns on WP_Error before reaching SubscriptionPack::suspend_subscription(). Creating a PayPal billing subscription needs an approved buyer session on paypal.com, which no API in this suite can produce, so a synthetic id can only ever exercise the early return. Writing this as a passing test against that early return would assert that suspension does nothing — the exact fake-green shape this file exists to avoid. Blocked on: a real sandbox billing-subscription fixture (see PP-SUB).',
        );

        // Left unreachable on purpose. When a real subscription fixture exists, drive the event
        // for it and assert BOTH the order note 'Subscription Suspended From PayPal Dashboard.'
        // and that SubscriptionPack::suspend_subscription() moved product_pack_enddate to the
        // subscription's next_billing_time.
        expect(HAS_PAYPAL_SUBSCRIPTION_FIXTURE, 'unreachable while the suspension fixture is missing').toBe(true);
    });

    test('PP-WHK-17: BILLING.SUBSCRIPTION.RE-ACTIVATED restores a cancelled-but-active pack', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();
        requireSubscriptionModule();

        const subscriptionId = `I-E2EWHK17${Date.now()}`;

        const orderId = await createPayPalOrder({
            status: 'processing',
            setPaid: true,
            customerId: CUSTOMER_ID,
            productId: packProductId,
            meta: [{ key: '_dokan_vendor_subscription_order', value: 'yes' }],
        });

        // The handler resolves the subscriber through Helper::get_vendor_id_by_subscription()
        // (user meta), then the order through `product_order_id` — NOT through the event's
        // custom_id. Both metas are therefore preconditions, not conveniences.
        await dbUtils.setUserMeta(String(CUSTOMER_ID), '_dokan_paypal_marketplace_vendor_subscription_id', subscriptionId, false);
        await dbUtils.setUserMeta(String(CUSTOMER_ID), 'product_order_id', String(orderId), false);
        await dbUtils.setUserMeta(String(CUSTOMER_ID), 'product_package_id', String(packProductId), false);
        // "Cancelled but still inside the paid period" — the only state reactivate_subscription()
        // will act on.
        await dbUtils.setUserMeta(String(CUSTOMER_ID), 'dokan_has_active_cancelled_subscrption', '1', false);
        await dbUtils.deleteUserMeta(CUSTOMER_ID, ['can_post_product']);

        const result = await injectPayPalWebhook(PAYPAL_EVENTS.subscriptionReActivated, {
            id: subscriptionId,
            status: 'ACTIVE',
            custom_id: String(orderId),
            plan_id: 'P-E2E-WHK17',
        });

        expect(result.handler, 'BILLING.SUBSCRIPTION.RE-ACTIVATED must resolve to BillingSubscriptionReActivated.').toBe('BillingSubscriptionReActivated');
        expect(result.fatal, `BillingSubscriptionReActivated raised a PHP \\Error: ${result.error}`).toBe(false);

        expect(
            await dbUtils.getUserMetaValue(CUSTOMER_ID, 'can_post_product'),
            `the subscriber re-activated on PayPal and is being billed again, but posting rights were never restored. The vendor pays for a pack they cannot use, and nothing in the shop tells them why.`,
        ).toBe('1');

        const cancelledFlag = await dbUtils.getUserMetaValue(CUSTOMER_ID, 'dokan_has_active_cancelled_subscrption');
        expect(
            cancelledFlag === null || cancelledFlag === '' || cancelledFlag === '0',
            `the "cancelled but active" flag is still set (value: ${JSON.stringify(cancelledFlag)}) after re-activation, so the subscription will be treated as pending cancellation and torn down at the end of the period the vendor has just paid to extend.`,
        ).toBe(true);

        const notes = await getOrderNotes(orderId);
        expect(
            notes.some(n => n.includes('Subscription Reactivated')),
            `order #${orderId} has no re-activation note. Notes seen: ${JSON.stringify(notes).slice(0, 300)}`,
        ).toBe(true);

        log.success('PP-WHK-17: re-activation restores posting rights and clears the cancelled flag.');
    });

    /**
     * PP-WHK-18 — written as `test.fail` against a CONFIRMED product defect (DOK-024), not a flaky
     * test.
     *
     * `BillingSubscriptionPaymentFailed::handle()` reads the subscriber's order id from the user
     * meta key `product_order_idproduct_order_id` (WebhookEvents/BillingSubscriptionPaymentFailed.php:57).
     * The real key is `product_order_id` — the doubled one is written nowhere in either plugin, so
     * `wc_get_order( '' )` always fails, the handler logs "Invalid Order id: " and returns, and its
     * only intended mutation (revoking `can_post_product`) never happens.
     *
     * Bug: DOK-024 — `bugs/paypal-billing-subscription-payment-failed-doubled-meta-key.md`.
     *
     * `test.fail`, NOT `fixme`: a fixme skips the body, so the run reports green and the day the
     * doubled key is fixed nothing tells us. `test.fail` RUNS the body, expects the assertion below
     * to fail while DOK-024 is open, and fails the suite loudly the moment the product starts
     * behaving correctly — at which point this modifier is removed and the case becomes an ordinary
     * passing test. The assertions are the CORRECT behaviour; they are deliberately not rewritten
     * to assert the broken behaviour, which would ossify the defect as intended.
     */
    test.fail('PP-WHK-18: BILLING.SUBSCRIPTION.PAYMENT.FAILED revokes the vendor posting capability', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();
        requireSubscriptionModule();

        const subscriptionId = `I-E2EWHK18${Date.now()}`;

        const orderId = await createPayPalOrder({
            status: 'processing',
            setPaid: true,
            customerId: CUSTOMER_ID,
            productId: packProductId,
            meta: [
                { key: '_dokan_vendor_subscription_order', value: 'yes' },
                { key: '_dokan_paypal_marketplace_vendor_subscription_id', value: subscriptionId },
            ],
        });

        await dbUtils.setUserMeta(String(CUSTOMER_ID), '_dokan_paypal_marketplace_vendor_subscription_id', subscriptionId, false);
        await dbUtils.setUserMeta(String(CUSTOMER_ID), 'product_order_id', String(orderId), false);
        await dbUtils.setUserMeta(String(CUSTOMER_ID), 'can_post_product', '1', false);

        expect(await dbUtils.getUserMetaValue(CUSTOMER_ID, 'can_post_product'), 'positive baseline: the subscriber must be able to post before the failed payment.').toBe('1');

        const result = await injectPayPalWebhook(PAYPAL_EVENTS.subscriptionPaymentFailed, {
            id: subscriptionId,
            status: 'ACTIVE',
            custom_id: String(orderId),
            plan_id: 'P-E2E-WHK18',
        });
        expect(result.handler, 'BILLING.SUBSCRIPTION.PAYMENT.FAILED must resolve to BillingSubscriptionPaymentFailed.').toBe('BillingSubscriptionPaymentFailed');
        expect(result.fatal, `BillingSubscriptionPaymentFailed raised a PHP \\Error: ${result.error}`).toBe(false);

        expect(
            await dbUtils.getUserMetaValue(CUSTOMER_ID, 'can_post_product'),
            'the subscription payment failed at PayPal but the vendor keeps full posting rights. The handler reads user meta "product_order_idproduct_order_id" (BillingSubscriptionPaymentFailed.php:57) — a doubled key nothing ever writes — so the order lookup always fails and the handler returns before revoking anything. Nothing else in the module revokes the capability on a payment failure (the fallback status update on line 84 is commented out), so a vendor whose card keeps declining trades indefinitely for free. See DOK-024 — bugs/paypal-billing-subscription-payment-failed-doubled-meta-key.md. If THIS assertion now passes, DOK-024 is fixed: drop the test.fail modifier on this case.',
        ).toBe('0');
    });

    /* ================================================================== */
    /* PP-WHK-19 — idempotency                                             */
    /* ================================================================== */

    test('PP-WHK-19: replaying the same refund event does not book the refund twice', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();

        const orderId = await createPayPalOrder({ status: 'processing', setPaid: true });
        const refundId = `REF-E2E-WHK19-${Date.now()}`;
        const resource = refundResource(orderId, refundId);

        const first = await injectPayPalWebhook(PAYPAL_EVENTS.captureRefunded, resource);
        expect(first.fatal, `the first refund delivery raised a PHP \\Error: ${first.error}`).toBe(false);

        // Positive control for the replay assertion: the first delivery must genuinely have
        // booked a refund, otherwise "still one row" would be satisfied by zero rows.
        const afterFirst = await refundRowsForOrder(orderId);
        expect(afterFirst.length, `the first refund delivery created ${afterFirst.length} rows for order #${orderId} instead of 1 — the replay assertion below would be meaningless.`).toBe(1);

        const second = await injectPayPalWebhook(PAYPAL_EVENTS.captureRefunded, resource);
        expect(second.fatal, `the replayed refund delivery raised a PHP \\Error: ${second.error}`).toBe(false);

        const afterSecond = await refundRowsForOrder(orderId);
        expect(
            afterSecond.length,
            `replaying one PayPal refund event booked ${afterSecond.length} refunds against order #${orderId}. PayPal retries any delivery it does not get a 200 for, so this is the ordinary case, not an exotic one: each replay reverses the vendor's earnings again and the marketplace ends up refunding money it never took. The guard is the _dokan_paypal_refund_id order meta checked by OrderManager::get_refund_ids_by_order().`,
        ).toBe(1);

        expect(
            (await balanceRowsForOrder(orderId, 'dokan_refund')).length,
            `the replayed refund wrote more than one dokan_vendor_balance reversal for order #${orderId} — the vendor is debited twice for a single refund.`,
        ).toBeLessThanOrEqual(1);

        log.success('PP-WHK-19: refund replay is idempotent.');
    });

    /* ================================================================== */
    /* PP-WHK-20 — unknown event type                                      */
    /* ================================================================== */

    test('PP-WHK-20: an event type that maps to no handler is ignored without error', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();

        const orderId = await createPayPalOrder({ status: 'pending', setPaid: false });

        // Positive control first — see PP-WHK-05/06 for why.
        await injectPayPalWebhook(PAYPAL_EVENTS.checkoutOrderCompleted, completedOrderResource(orderId, 'PP-E2E-WHK20', 'CAP-E2E-WHK20'));
        expect(
            await getOrderMetaValue(orderId, '_dokan_paypal_payment_charge_captured'),
            `positive control failed — a mapped event did not mutate order #${orderId}, so "the unknown event changed nothing" would pass for the wrong reason.`,
        ).toBe('yes');

        const statusBefore = await getOrderStatus(orderId);
        const notesBefore = (await getOrderNotes(orderId)).length;

        const result = await injectPayPalWebhook(UNKNOWN_EVENT, refundResource(orderId, 'REF-E2E-WHK20'));

        expect(result.is_handled, `${UNKNOWN_EVENT} must not appear in Helper::get_supported_webhook_events().`).toBe(false);
        expect(result.handler, 'an unmapped event type must resolve to no handler class.').toBeNull();
        expect(
            result.threw,
            `dispatching an unmapped event threw (${result.error}). EventFactory::get() returns early for an unknown key, so a throw here means PayPal receives a 500 for events it is entitled to send — and PayPal disables a webhook endpoint that keeps failing.`,
        ).toBe(false);
        expect(result.fatal, `dispatching an unmapped event raised a PHP \\Error: ${result.error}`).toBe(false);

        expect(await getOrderStatus(orderId), `order #${orderId} changed status from an unmapped event type.`).toBe(statusBefore);
        expect((await getOrderNotes(orderId)).length, `order #${orderId} gained an order note from an unmapped event type.`).toBe(notesBefore);
        expect((await refundRowsForOrder(orderId)).length, `an unmapped event type created a dokan_refund row against order #${orderId}.`).toBe(0);

        log.success('PP-WHK-20: unmapped event types are dropped silently and safely.');
    });

    /* ================================================================== */
    /* PP-WHK-21 — malformed body at the live endpoint                     */
    /* ================================================================== */

    /**
     * `postUnsignedWebhook()` always serialises a well-formed JSON object, so it cannot express a
     * malformed body. This is the only place in the file that builds its own request, and it sets
     * `Authorization: ''` EXPLICITLY: `request.newContext()` inherits the shared config's admin
     * Basic auth when the header is omitted, which would quietly turn an anonymous probe into an
     * authenticated one.
     */
    async function postRawToWebhookEndpoint(body: string): Promise<{ status: number; text: string }> {
        const ctx = await request.newContext({ extraHTTPHeaders: { Authorization: '', 'Content-Type': 'application/json' } });
        try {
            const res = await ctx.post(PAYPAL_WEBHOOK_URL, { data: body });
            return { status: res.status(), text: (await res.text()).slice(0, 2000) };
        } finally {
            await ctx.dispose();
        }
    }

    test('PP-WHK-21: a malformed webhook body is rejected without a PHP fatal', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();
        test.skip(
            !hasCredentials,
            'The WebhookHandler is instantiated in module.php:97 BEFORE the is_enabled() early return, so the wc-api route stays hooked even for a dead gateway — and handle_events() answers 200 and exit()s at WebhookHandler.php:53 when Helper::is_ready() is false, BEFORE file_get_contents(\'php://input\'). Without the three PayPal credentials every malformed body would therefore get a clean 200 from a handler that never read, parsed or dispatched anything, and all five assertions below would pass against a gateway that cannot parse a webhook at all.',
        );

        const ready = await getPayPalStatus();
        expect(
            ready.is_ready,
            'positive baseline: a not-ready gateway 200-exits at WebhookHandler.php:53 before the body is ever read, so "the malformed body caused no fatal and mutated nothing" would be true for entirely the wrong reason.',
        ).toBe(true);

        // A canary the malformed deliveries reference, so "no state changed" is checked against a
        // real order rather than asserted in the abstract.
        const orderId = await createPayPalOrder({ status: 'pending', setPaid: false });
        const statusBefore = await getOrderStatus(orderId);
        const notesBefore = (await getOrderNotes(orderId)).length;

        const bodies: Array<[string, string]> = [
            ['not JSON at all', `this is definitely not json — order ${orderId}`],
            ['truncated JSON', `{"id":"WH-e2e-malformed","event_type":"CHECKOUT.ORDER.COMPLETED","resource":{"purchase_units":[{"invoice_id":"${orderId}"`],
            ['JSON literal null', 'null'],
        ];

        for (const [label, body] of bodies) {
            const res = await postRawToWebhookEndpoint(body);

            expect(
                res.status,
                `a ${label} body produced HTTP ${res.status} from ${PAYPAL_WEBHOOK_URL}. A 5xx here is a PHP fatal escaping to PayPal, and PayPal disables an endpoint that keeps 500-ing — which silently kills every legitimate webhook for this shop. Body: ${res.text.slice(0, 300)}`,
            ).toBeLessThan(500);

            expect(
                /fatal error|uncaught|stack trace/i.test(res.text),
                `a ${label} body leaked a PHP error into the response of ${PAYPAL_WEBHOOK_URL}: ${res.text.slice(0, 400)}`,
            ).toBe(false);
        }

        expect(await getOrderStatus(orderId), `order #${orderId} changed status from a malformed webhook body.`).toBe(statusBefore);
        expect((await getOrderNotes(orderId)).length, `order #${orderId} gained an order note from a malformed webhook body.`).toBe(notesBefore);
        expect(
            await getOrderMetaValue(orderId, '_dokan_paypal_payment_charge_captured'),
            `order #${orderId} was marked captured by a malformed, unsigned webhook body — a body the endpoint could not even parse must never reach a handler.`,
        ).toBeUndefined();

        log.success('PP-WHK-21: malformed bodies are handled without a fatal and without side effects.');
    });

    /* ================================================================== */
    /* PP-WHK-22 — event for an order that does not exist                  */
    /* ================================================================== */

    test('PP-WHK-22: a refund event for an unknown order is handled without side effects', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();

        // Scoped to the order under test, not a global COUNT(*): PP-WHK-07/08/19 in this file and
        // any concurrently running refund spec write into dokan_refund, so a global count would
        // blame this handler for another worker's row (or let a real row hide behind a delete).
        const refundsBefore = (await refundRowsForOrder(NONEXISTENT_ORDER_ID)).length;

        let injectError: string | null = null;
        let result: WebhookInjectResult | null = null;
        try {
            result = await injectPayPalWebhook(PAYPAL_EVENTS.captureRefunded, refundResource(NONEXISTENT_ORDER_ID, `REF-E2E-WHK22-${Date.now()}`));
        } catch (error) {
            // Not swallowed — this feeds the assertion below.
            injectError = String(error);
        }

        expect(
            (await refundRowsForOrder(NONEXISTENT_ORDER_ID)).length,
            `a refund event naming order #${NONEXISTENT_ORDER_ID}, which does not exist, created a dokan_refund row against it anyway — a webhook for a deleted or foreign order must never write into this shop's ledger.`,
        ).toBe(refundsBefore);

        if (result) {
            expect(result.fatal, `the unknown-order refund event raised a PHP \\Error: ${result.error}`).toBe(false);
            expect(result.threw, `the unknown-order refund event threw: ${result.error}`).toBe(false);
        }

        // Everything above this line is a control and must go RED on its own: the ledger must stay
        // untouched, and the handler must not raise a PHP \Error. Only the clean-return assertion
        // below is expected to fail while DOK-028 is open.
        test.fail();

        expect(
            injectError,
            `dispatching a refund event for a missing order tore the whole request down instead of returning cleanly (${injectError}). CONFIRMED defect DOK-028, verified against dokan-pro 5.0.9 source: PaymentCaptureRefunded.php:62-64 answers status_header( 400 ) and calls exit() from inside a webhook HANDLER, not from the endpoint. In production that ends the request mid-flight, so any later handler in the same delivery never runs and PayPal is told to retry an event that can never succeed; the sibling handlers all just dokan_log() and return for the same condition. When this assertion starts passing, DOK-028 is fixed and the test.fail() above must be removed.`,
        ).toBeNull();

        log.success('PP-WHK-22: a refund event for an unknown order writes nothing.');
    });

    /* ================================================================== */
    /* PP-WHK-23 / 24 — the live endpoint refuses unverifiable deliveries  */
    /* ================================================================== */

    test('PP-WHK-23: an unsigned delivery to the live endpoint mutates nothing even when the gateway is ready', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();
        test.skip(
            !hasCredentials,
            'This case must prove the gateway is READY first — a not-ready gateway exits at WebhookHandler.php:53 before ever reaching signature verification, so "the unsigned delivery changed nothing" would be true for entirely the wrong reason. Readiness needs the three PayPal credentials.',
        );

        const ready = await getPayPalStatus();
        expect(ready.is_ready, 'positive baseline: the gateway must be READY, or this case never reaches the verification branch it is about.').toBe(true);

        const orderId = await createPayPalOrder({ status: 'pending', setPaid: false });
        const statusBefore = await getOrderStatus(orderId);

        const httpStatus = await postUnsignedWebhook(PAYPAL_EVENTS.checkoutOrderCompleted, completedOrderResource(orderId, 'PP-E2E-WHK23', 'CAP-E2E-WHK23'));
        log.info(`PP-WHK-23: unsigned delivery answered HTTP ${httpStatus} — recorded, never asserted on alone.`);

        // The status code proves nothing here (200 = not-ready early exit, 400 = verification
        // refused, and both look identical from outside), so the assertion is entirely on state.
        expect(
            await getOrderMetaValue(orderId, '_dokan_paypal_payment_charge_captured'),
            `an UNSIGNED request marked order #${orderId} as captured. Anyone who can reach ${PAYPAL_WEBHOOK_URL} could then mark any pending order paid, trigger payment_complete() and have the vendor credited for money that was never taken.`,
        ).toBeUndefined();
        expect(await getOrderStatus(orderId), `an unsigned request changed the status of order #${orderId}.`).toBe(statusBefore);
        expect((await refundRowsForOrder(orderId)).length, `an unsigned request created a refund row against order #${orderId}.`).toBe(0);

        log.success('PP-WHK-23: unsigned deliveries cannot mutate state.');
    });

    test('PP-WHK-24: a delivery verified against the wrong stored webhook id mutates nothing', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();
        test.skip(
            !hasCredentials,
            'Verification is only reached once Helper::is_ready() is true; without the three PayPal credentials the endpoint exits at WebhookHandler.php:53 and the wrong-webhook-id branch is never entered.',
        );

        const ready = await getPayPalStatus();
        expect(ready.is_ready, 'positive baseline: the gateway must be READY for the stored webhook id to matter at all.').toBe(true);

        // Helper::get_webhook_key() is mode-swapped, so which option to poison depends on test_mode.
        const webhookOption = ready.is_test_mode ? 'dokan_paypal_marketplace_test_webhook' : 'dokan_paypal_marketplace_webhook';
        const original = await rawOptionValue(webhookOption);

        const POISONED_WEBHOOK_ID = 'WH-E2E-DELIBERATELY-WRONG-ID';
        // A SECOND distinct id rather than `original`, deliberately: this describe's afterAll
        // deletes both webhook-id options, so on most runs `original` is null and get_option()
        // would hand verification a boolean `false` — an id the assertion could not tell apart
        // from "the product stopped reading the option at all". Two explicit, different sentinels
        // make the control unambiguous in every environment.
        const CONTROL_WEBHOOK_ID = 'WH-E2E-CONTROL-SECOND-ID';

        const orderId = await createPayPalOrder({ status: 'pending', setPaid: false });
        const statusBefore = await getOrderStatus(orderId);

        // NOTE ON SCOPE, recorded rather than hidden: genuine PayPal signature headers cannot be
        // forged here — only PayPal can produce a transmission signature — so the delivery below
        // is unsigned and verification could never answer SUCCESS. What makes this case DIFFERENT
        // from PP-WHK-23 is therefore not the outcome but the OBSERVED INPUT: the mu-plugin
        // interceptor records the exact body the module hands to
        // Processor::verify_webhook_request() (Utilities/Processor.php:433-441), and that body is
        // WebhookHandler.php:66-79's `$validate_args` — including
        // `'webhook_id' => get_option( Helper::get_webhook_key() )`. Asserting on the recorded
        // webhook_id is what pins the stored, mode-swapped option as a real verification input;
        // the state assertions alone would pass with that lookup deleted outright.
        try {
            await armInterceptor();
            expect(
                await readCapturedVerifyRequest(),
                'armInterceptor() must leave the recorder EMPTY before the first delivery, otherwise the webhook_id asserted below could be a leftover from an earlier test (the recorder is one site-wide option) and this case would be reading its own history instead of this delivery.',
            ).toBeNull();

            await dbUtils.setOptionValue(webhookOption, POISONED_WEBHOOK_ID, false);

            const httpStatus = await postUnsignedWebhook(PAYPAL_EVENTS.checkoutOrderCompleted, completedOrderResource(orderId, 'PP-E2E-WHK24', 'CAP-E2E-WHK24'));
            log.info(`PP-WHK-24: delivery against a wrong stored webhook id answered HTTP ${httpStatus} — recorded, never asserted on alone.`);

            const poisoned = await readCapturedVerifyRequest<{ webhook_id?: unknown; webhook_event?: { resource?: { purchase_units?: Array<{ invoice_id?: string }> } } }>();
            expect(
                poisoned,
                `the module never called Processor::verify_webhook_request() for a delivery to ${PAYPAL_WEBHOOK_URL} while the gateway was READY. Either the verification call at WebhookHandler.php:80 was removed — in which case any unsigned body reaches EventFactory::handle() and anyone can mark orders paid — or the delivery exited earlier (the is_ready() 200-exit at WebhookHandler.php:53, or the json_decode 400-exit at :60) and this case never reached the branch it is about.`,
            ).not.toBeNull();

            expect(
                poisoned?.webhook_id,
                `the webhook id the module submitted for verification is not the stored one. WebhookHandler.php:75 must send 'webhook_id' => get_option( Helper::get_webhook_key() ) (Helper.php:847, which returns the TEST key while test_mode is on), and this run poisoned exactly that option with "${POISONED_WEBHOOK_ID}". A different value means verification is being run against an id the shop does not actually have registered with PayPal — every genuine delivery would then fail validation and the shop would silently stop processing PayPal events. Recorded verify body: ${JSON.stringify(poisoned).slice(0, 300)}`,
            ).toBe(POISONED_WEBHOOK_ID);

            // Pins that the recorded body belongs to THIS delivery rather than a stale record that
            // happened to survive; without it the webhook_id assertion could be satisfied by any
            // earlier write to the same option.
            expect(
                poisoned?.webhook_event?.resource?.purchase_units?.[0]?.invoice_id,
                `the recorded verify body carries a different order than the one just delivered (#${orderId}), so it is not this delivery's record and the webhook_id assertion above was reading someone else's request. Recorded verify body: ${JSON.stringify(poisoned).slice(0, 300)}`,
            ).toBe(String(orderId));

            // POSITIVE CONTROL. Re-arming clears the recorder and the cached access token, so the
            // second record can only have been produced by the second delivery — which proves the
            // option is read LIVE per delivery and not baked in at boot or cached, i.e. that the
            // first assertion measured the poisoning rather than a coincidence.
            await armInterceptor();
            expect(await readCapturedVerifyRequest(), 're-arming must clear the recorder, or the "second" record below is just the first one read twice.').toBeNull();

            await dbUtils.setOptionValue(webhookOption, CONTROL_WEBHOOK_ID, false);
            await postUnsignedWebhook(PAYPAL_EVENTS.checkoutOrderCompleted, completedOrderResource(orderId, 'PP-E2E-WHK24-CONTROL', 'CAP-E2E-WHK24-CONTROL'));

            const control = await readCapturedVerifyRequest<{ webhook_id?: unknown }>();
            expect(control, 'positive control: the second delivery produced no verification request at all, so the first record cannot be attributed to the stored webhook id either.').not.toBeNull();
            expect(
                control?.webhook_id,
                `the stored webhook id is NOT read per delivery: after the option was changed to "${CONTROL_WEBHOOK_ID}" the module still submitted "${String(control?.webhook_id)}" for verification. A cached or boot-time-captured id means an administrator who re-registers the webhook keeps verifying against the dead id until the process restarts, and every delivery in between is rejected. Recorded verify body: ${JSON.stringify(control).slice(0, 300)}`,
            ).toBe(CONTROL_WEBHOOK_ID);

            expect(
                await getOrderMetaValue(orderId, '_dokan_paypal_payment_charge_captured'),
                `a delivery that could not be verified against the stored webhook id still marked order #${orderId} captured — verification is not gating the handlers.`,
            ).toBeUndefined();
            expect(await getOrderStatus(orderId), `an unverifiable delivery changed the status of order #${orderId}.`).toBe(statusBefore);
            expect((await refundRowsForOrder(orderId)).length, `an unverifiable delivery created a dokan_refund row against order #${orderId}.`).toBe(0);
        } finally {
            await disarmInterceptor();
            if (original === null) {
                await dbUtils.deleteOptionRow([webhookOption]);
            } else {
                await dbUtils.setOptionValue(webhookOption, original, false);
            }
        }

        log.success('PP-WHK-24: the stored webhook id is what verification is run against, and an unverifiable delivery mutates nothing.');
    });

    /* ================================================================== */
    /* PP-WHK-25 — sandbox and live webhook id options are independent     */
    /* ================================================================== */

    /**
     * BLOCKED, and skipped rather than left green — the body below asserts a property no product
     * code participates in on this transport, so it could never fail.
     *
     * The two webhook-id options have exactly two writers in the module:
     *   - `PayPal::process_admin_options()` (PaymentMethods/PayPal.php:555-579), reached ONLY via
     *     the `woocommerce_update_options_payment_gateways_dokan_paypal_marketplace` action, and
     *   - the module activation hook (module.php:123-124), which `Module::load_active_modules()`
     *     skips at line 110 because `container['paypal_marketplace']` is already set on an
     *     already-active module.
     * `ensurePayPalConfigured()` posts to the test mu-plugin route, which writes the gateway
     * settings with a bare `update_option()` (mu-plugins/dokan-paypal-marketplace-test-helpers.php:202)
     * and fires neither. Nothing reads, writes or deletes either key during this test, so the
     * LIVE_SENTINEL assertion passes because the option was simply never touched — it would pass
     * identically if `Helper::get_webhook_key()` (Helper.php:847) returned the LIVE key while in
     * test mode, which is the exact defect this case claims to pin.
     *
     * To unskip, two things are needed together:
     *   1. a real gateway settings save so `process_admin_options()` → `register_webhook()` runs
     *      (a mu-plugin route that calls the gateway's `process_admin_options()`, or a genuine WC
     *      checkout-settings form POST), and
     *   2. a POSITIVE CONTROL asserting that save consumed the SANDBOX sentinel, before the LIVE
     *      one is asserted untouched. Without (2) the case is vacuous again for a new reason.
     */
    test('PP-WHK-25: a sandbox-mode settings save never touches the live webhook id option', { tag: ['@pro', '@guest'] }, async () => {
        requireModule();
        test.skip(
            true,
            'BLOCKED — no settings save is reachable from this test transport. register_webhook() / deregister_webhook() only run from PayPal::process_admin_options(), which fires solely on the woocommerce_update_options_payment_gateways_dokan_paypal_marketplace action; ensurePayPalConfigured() writes the settings option directly (mu-plugin route) and never fires it, and the module activation hook is skipped for an already-active module. So neither webhook-id option is read or written during this case and the assertion below cannot fail. Unskip only together with a mu-plugin route that drives a real gateway settings save AND a positive control proving that save consumed the SANDBOX sentinel.',
        );
        test.skip(
            !hasCredentials,
            'ensurePayPalConfigured() is a no-op without the three PayPal credentials, so there would be no settings save whose effect on the two webhook-id options could be observed.',
        );

        const SANDBOX_OPTION = 'dokan_paypal_marketplace_test_webhook';
        const LIVE_OPTION = 'dokan_paypal_marketplace_webhook';
        const LIVE_SENTINEL = 'WH-E2E-LIVE-SENTINEL';
        const SANDBOX_SENTINEL = 'WH-E2E-SANDBOX-SENTINEL';

        try {
            await dbUtils.setOptionValue(SANDBOX_OPTION, SANDBOX_SENTINEL, false);
            await dbUtils.setOptionValue(LIVE_OPTION, LIVE_SENTINEL, false);

            await ensurePayPalConfigured();
            const after = await getPayPalStatus();

            expect(after.is_test_mode, 'the suite configures the gateway in sandbox mode (`test_mode`, not `sandbox` and not `testmode`); if that is no longer true this case is inspecting the wrong option.').toBe(true);

            expect(
                await rawOptionValue(LIVE_OPTION),
                `a SANDBOX-mode configuration wrote or cleared the LIVE webhook id option "${LIVE_OPTION}". The two ids are separate registrations at PayPal: overwriting the live one from sandbox means the production shop believes it is registered with a webhook id that belongs to the sandbox app, and every real delivery then fails verification.`,
            ).toBe(LIVE_SENTINEL);

            // Recorded, not asserted: a real registration cannot happen here.
            // WebhookHandler::register_webhook() posts home_url( 'wc-api/dokan-paypal', 'https' )
            // to PayPal, and PayPal refuses to register a callback on a non-public host such as
            // localhost:9999. So the "sandbox option holds a real PayPal webhook id" half of this
            // case is not automatable on this environment; only independence is.
            log.info(
                `PP-WHK-25: sandbox option after configure = ${JSON.stringify(await rawOptionValue(SANDBOX_OPTION))}. A real webhook id cannot appear here — PayPal will not register a callback on localhost, so registration always fails and only the independence half of this case is observable.`,
            );
        } finally {
            // Teardown must clear BOTH. The live twin is easy to forget and a stale value there
            // makes a later live-mode run believe a webhook is already registered with PayPal.
            await dbUtils.deleteOptionRow([SANDBOX_OPTION, LIVE_OPTION]);
        }

        expect(await rawOptionValue(LIVE_OPTION), 'teardown must leave no stale live webhook id behind.').toBeNull();
        expect(await rawOptionValue(SANDBOX_OPTION), 'teardown must leave no stale sandbox webhook id behind.').toBeNull();

        log.success('PP-WHK-25: sandbox and live webhook id options are independent, and both are cleared.');
    });
});
