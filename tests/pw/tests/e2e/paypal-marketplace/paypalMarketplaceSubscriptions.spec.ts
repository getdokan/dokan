import { PayPalMarketplaceSubscriptionsPage } from './paypalMarketplaceSubscriptionsPage';
import { test } from '@utils/test';

const subscriptions = new PayPalMarketplaceSubscriptionsPage();

/* ================================================================== */
test.describe('PayPal Marketplace — vendor subscriptions (PP-SUB)', () => {
    // PP-SUB-01 drives the Dokan settings SPA (its own save waits up to 90s) and PP-SUB-06 makes two
    // live round trips to PayPal.
    test.describe.configure({ timeout: 300_000 });

    /* -------------------------------------------------------------- */
    /* Setup / teardown                                                */
    /* -------------------------------------------------------------- */

    // No `test.skip` in here: inside beforeAll it silently voids the whole describe. Every gate is a
    // per-test skip naming exactly what is missing.
    test.beforeAll(async () => {
        await subscriptions.setupAll();
    });

    test.afterAll(async () => {
        await subscriptions.teardownAll();
    });

    /* ============================================================== */
    /* PP-SUB-01 — settings persistence                                */
    /* ============================================================== */
    test('PP-SUB-01: vendor-subscription settings survive a real save and a page reload', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        await subscriptions.ppSub01({ browser });
    });

    /* ============================================================== */
    /* PP-SUB-02 — the pack is purchasable through the gateway         */
    /* ============================================================== */
    test('PP-SUB-02: PayPal Marketplace is offered to a vendor buying a subscription pack', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await subscriptions.ppSub02({ browser });
    });

    /* ============================================================== */
    /* PP-SUB-03 — the purchase unit pays the ADMIN partner            */
    /* ============================================================== */
    test('PP-SUB-03: a subscription purchase unit is payable to the admin partner, never to a vendor', { tag: ['@pro', '@vendor'] }, async () => {
        await subscriptions.ppSub03();
    });

    /* ============================================================== */
    /* PP-SUB-04 — fee, shipping and tax recipients                    */
    /* ============================================================== */
    test('PP-SUB-04: a subscription order books fee, shipping and tax to admin, inverting the seller rule', { tag: ['@pro', '@vendor'] }, async () => {
        await subscriptions.ppSub04();
    });

    /* ============================================================== */
    /* PP-SUB-05 — the subscription id lands in vendor meta            */
    /* ============================================================== */
    test('PP-SUB-05: the PayPal subscription id is stored against the vendor on activation', { tag: ['@pro', '@vendor'] }, async () => {
        await subscriptions.ppSub05();
    });

    /* ============================================================== */
    /* PP-SUB-06 — pack maps to a PayPal product and plan              */
    /* ============================================================== */
    test('PP-SUB-06: a pack maps to a real PayPal catalog product and billing plan', { tag: ['@pro', '@vendor'] }, async () => {
        await subscriptions.ppSub06();
    });

    /* ============================================================== */
    /* PP-SUB-07 — the one-active-subscription cart guard              */
    /* ============================================================== */
    test('PP-SUB-07: a vendor holding an active subscription cannot add a second pack to the cart', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        await subscriptions.ppSub07({ browser });
    });

    /* ============================================================== */
    /* PP-SUB-08 — cancellation                                        */
    /* ============================================================== */
    test('PP-SUB-08: cancelling at PayPal ends the subscription and revokes the vendor capability', { tag: ['@pro', '@vendor'] }, async () => {
        await subscriptions.ppSub08();
    });

    /* ============================================================== */
    /* PP-SUB-09 — renewal, guarding DOK-025                           */
    /* ============================================================== */

    /**
     * PP-SUB-09 — `test.fail` against a CONFIRMED product defect, not a flaky test.
     *
     * `PaymentSaleCompleted::handle()` dedups an already-recorded renewal by searching orders for meta
     * key `_dokan_stripe_payment_capture_id` (WebhookEvents/PaymentSaleCompleted.php:110) — a STRIPE
     * key. This module writes `_dokan_paypal_payment_capture_id` through
     * `SubscriptionOrderMetaBuilder( $subscription, 'paypal' )`, so the dedup query can never match and
     * every PayPal redelivery books another renewal order. PayPal retries any delivery it did not get a
     * 200 for, so a redelivery is ordinary rather than exotic.
     *
     * Bug: DOK-025 (already filed — do not re-file). The assertions below are the CORRECT behaviour and
     * are deliberately not rewritten to match the broken one; when DOK-025 is fixed this test starts
     * passing, the `test.fail()` marker fails the run, and the marker is what gets deleted.
     *
     * `test.fail()` is called IMPERATIVELY, one line before the redelivery assertion, rather than as a
     * modifier on the declaration. A declaration-level `test.fail` makes the ENTIRE body an expected
     * failure, so the positive control ("one delivery creates exactly one renewal order") would report
     * the case GREEN on the day it silently breaks — a handler early-return, a WP_Error out of
     * `create_renewal_order()`, or a child-order query that reads nothing would all end the case before
     * the redelivery half ever ran, and the run would still be green. Everything above the marker must
     * therefore pass on its own; only the known-broken assertion sits after it.
     */
    test('PP-SUB-09: a renewal creates exactly one order per sale event, including on redelivery', { tag: ['@pro', '@vendor'] }, async () => {
        await subscriptions.ppSub09();
    });

    /* ============================================================== */
    /* PP-SUB-10 — expiry is an alias of cancellation                  */
    /* ============================================================== */
    test('PP-SUB-10: an expired subscription ends in exactly the same state as a cancelled one', { tag: ['@pro', '@vendor'] }, async () => {
        await subscriptions.ppSub10();
    });
});
