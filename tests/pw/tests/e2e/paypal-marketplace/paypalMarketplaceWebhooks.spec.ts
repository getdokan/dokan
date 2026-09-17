import { PayPalMarketplaceWebhooksPage, UNHANDLED_EVENT_CASES, SUBSCRIPTION_CANCEL_CASES } from './paypalMarketplaceWebhooksPage';
import { test } from '@utils/test';

const webhooks = new PayPalMarketplaceWebhooksPage();

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

    /* ------------------------------------------------------------------ */
    /* Setup                                                               */
    /* ------------------------------------------------------------------ */

    // No `test.skip` in here: inside beforeAll it silently voids the whole describe. Every gate
    // is a per-test skip that names precisely what is missing.
    test.beforeAll(async () => {
        await webhooks.setupAll();
    });

    test.afterAll(async () => {
        await webhooks.teardownAll();
    });

    /* ================================================================== */
    /* PP-WHK-01 — the trust precondition for everything below            */
    /* ================================================================== */
    test('PP-WHK-01: the injection route reaches a real handler and reports no throw or fatal', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk01();
    });

    /* ================================================================== */
    /* PP-WHK-02 — the 200-means-nothing trap, documented explicitly       */
    /* ================================================================== */
    test('PP-WHK-02: a not-ready gateway answers 200 without processing the event', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk02();
    });

    /* ================================================================== */
    /* PP-WHK-03 — CHECKOUT.ORDER.APPROVED                                 */
    /* ================================================================== */
    test('PP-WHK-03: CHECKOUT.ORDER.APPROVED runs the capture for a pending order and skips one already paid', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk03();
    });

    /* ================================================================== */
    /* PP-WHK-04 — CHECKOUT.ORDER.COMPLETED                                */
    /* ================================================================== */
    test('PP-WHK-04: CHECKOUT.ORDER.COMPLETED stores the capture data and completes payment', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk04();
    });

    /* ================================================================== */
    /* PP-WHK-05 / 06 — the two events the brief assumed and the module    */
    /*                  does not implement                                 */
    /* ================================================================== */

    for (const [caseId, eventType, gap] of UNHANDLED_EVENT_CASES) {
        test(`${caseId}: ${eventType} resolves to no handler and mutates nothing`, { tag: ['@pro', '@guest'] }, async () => {
            await webhooks.ppWhkUnhandledEvent(caseId, eventType, gap);
        });
    }

    /* ================================================================== */
    /* PP-WHK-07 — PAYMENT.CAPTURE.REFUNDED                                */
    /* ================================================================== */
    test('PP-WHK-07: PAYMENT.CAPTURE.REFUNDED creates an approved Dokan refund and reverses the vendor balance', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk07();
    });

    /* ================================================================== */
    /* PP-WHK-08 — PAYMENT.CAPTURE.REVERSED aliases to the refund handler  */
    /* ================================================================== */
    test('PP-WHK-08: PAYMENT.CAPTURE.REVERSED is booked as an ordinary refund', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk08();
    });

    /* ================================================================== */
    /* PP-WHK-09 — PAYMENT.SALE.COMPLETED renewal                          */
    /* ================================================================== */
    test('PP-WHK-09: PAYMENT.SALE.COMPLETED creates exactly one renewal order per event', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk09();
    });

    /* ================================================================== */
    /* PP-WHK-10 — PAYMENT.REFERENCED-PAYOUT-ITEM.COMPLETED                */
    /* ================================================================== */
    test('PP-WHK-10: PAYMENT.REFERENCED-PAYOUT-ITEM.COMPLETED releases a parked disbursement', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk10();
    });

    /* ================================================================== */
    /* PP-WHK-11 — MERCHANT.ONBOARDING.COMPLETED                           */
    /* ================================================================== */
    test('PP-WHK-11: MERCHANT.ONBOARDING.COMPLETED marks the vendor connection successful', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk11();
    });

    /* ================================================================== */
    /* PP-WHK-12 — MERCHANT.PARTNER-CONSENT.REVOKED                        */
    /* ================================================================== */
    test('PP-WHK-12: MERCHANT.PARTNER-CONSENT.REVOKED disconnects the vendor completely', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk12();
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
        await webhooks.ppWhk13();
    });

    /**
     * PP-WHK-14 and PP-WHK-15 are the same handler reached through two event strings —
     * `BILLING.SUBSCRIPTION.CANCELLED` and `BILLING.SUBSCRIPTION.EXPIRED` both map to
     * `BillingSubscriptionCancelled`. The alias is deliberate in the code and behaviourally
     * significant: an expired subscription and a cancelled one are indistinguishable afterwards.
     */
    for (const [caseId, eventType, title] of SUBSCRIPTION_CANCEL_CASES) {
        test(`${caseId}: ${title}`, { tag: ['@pro', '@guest'] }, async () => {
            await webhooks.ppWhkSubscriptionCancelled(caseId, eventType);
        });
    }

    test('PP-WHK-16: BILLING.SUBSCRIPTION.SUSPENDED suspends the pack', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk16();
    });

    test('PP-WHK-17: BILLING.SUBSCRIPTION.RE-ACTIVATED restores a cancelled-but-active pack', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk17();
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
        await webhooks.ppWhk18();
    });

    /* ================================================================== */
    /* PP-WHK-19 — idempotency                                             */
    /* ================================================================== */
    test('PP-WHK-19: replaying the same refund event does not book the refund twice', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk19();
    });

    /* ================================================================== */
    /* PP-WHK-20 — unknown event type                                      */
    /* ================================================================== */
    test('PP-WHK-20: an event type that maps to no handler is ignored without error', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk20();
    });

    test('PP-WHK-21: a malformed webhook body is rejected without a PHP fatal', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk21();
    });

    /* ================================================================== */
    /* PP-WHK-22 — event for an order that does not exist                  */
    /* ================================================================== */
    test('PP-WHK-22: a refund event for an unknown order is handled without side effects', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk22();
    });

    /* ================================================================== */
    /* PP-WHK-23 / 24 — the live endpoint refuses unverifiable deliveries  */
    /* ================================================================== */
    test('PP-WHK-23: an unsigned delivery to the live endpoint mutates nothing even when the gateway is ready', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk23();
    });

    test('PP-WHK-24: a delivery verified against the wrong stored webhook id mutates nothing', { tag: ['@pro', '@guest'] }, async () => {
        await webhooks.ppWhk24();
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
        await webhooks.ppWhk25();
    });
});
