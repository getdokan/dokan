import { test, expect, Browser } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import {
    VENDOR_ID,
    hasCredentials,
    ensureBillingAddress,
    seedSubscriptionPack,
    buyPackExpectReceived,
    cleanupSubscription,
    injectStripeWebhook,
    getOrderNotes,
    getStripeChargeIdForOrder,
} from './helpers';

/**
 * Suite VS6 — vendor-subscription LIFECYCLE webhooks (renewal / failure / deletion).
 *
 * These were the audit's "deferred — needs Stripe CLI" group: localhost can't receive the
 * recurring-billing webhooks Stripe fires over time. The webhook-injection harness
 * (helpers.injectStripeWebhook → the EventFactory handler) drives them directly against a
 * REAL subscription created by an actual recurring-pack purchase, so the handlers' Stripe
 * reads (Subscription::retrieve, vendor-by-subscription lookup) resolve.
 *
 * Each test buys a fresh recurring pack (the vendor self-provisions), captures the live
 * Stripe sub id from vendor meta, injects the lifecycle event, and asserts the de-/re-
 * provisioning effect. All created subscriptions are cancelled in teardown (test-mode hygiene).
 */
test.describe.serial('Stripe Connect — Suite VS6 (subscription lifecycle webhooks)', () => {
    test.describe.configure({ timeout: 300_000 });

    let packId: string;
    const createdSubs: string[] = [];

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureBillingAddress(VENDOR_ID);
        [packId] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
    });

    test.afterAll(async () => {
        // Cancel every live Stripe subscription these tests created, reset the vendor, restore the
        // subscription feature flag (cleanupSubscription handles all of that), and trash the pack.
        await cleanupSubscription(packId, createdSubs);
    });

    /** Buy the recurring pack as the vendor and return the live Stripe subscription id (sub_…). */
    async function subscribeAndGetSubId(browser: Browser): Promise<string> {
        const orderId = await buyPackExpectReceived(browser, packId);
        expect(orderId, 'pack purchase reached order-received').toBeTruthy();
        await expect
            .poll(() => dbUtils.getUserMetaValue(VENDOR_ID, 'can_post_product'), {
                message: 'vendor should be activated after the pack purchase',
                timeout: 40_000,
            })
            .toBe('1');
        const subId = await dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_subscription_id');
        expect(subId, 'vendor carries a live Stripe subscription id (sub_…)').toMatch(/^sub_/);
        createdSubs.push(subId as string);
        return subId as string;
    }

    test('VS6.3: customer.subscription.deleted revokes the vendor pack and clears the subscription id', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        const subId = await subscribeAndGetSubId(browser);

        const res = await injectStripeWebhook({
            type: 'customer.subscription.deleted',
            data_object: { id: subId, object: 'subscription', status: 'canceled' },
        });
        expect(res.threw, `customer.subscription.deleted must be handled without error (got: ${res.error ?? 'none'})`).toBe(false);

        // delete_subscription_pack + delete _stripe_subscription_id → the vendor is de-provisioned.
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_subscription_id'), 'the Stripe subscription id meta should be cleared after deletion').toBeFalsy();
        log.success('VS6.3: subscription.deleted revoked the pack (Stripe subscription id cleared)');
    });

    test('VS6.2: a final invoice.payment_failed terminates the vendor (can_post_product → not active)', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        const subId = await subscribeAndGetSubId(browser);
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'can_post_product'), 'vendor is active before the failure').toBe('1');

        // next_payment_attempt:null = the FINAL dunning attempt → terminate + delete the pack.
        const res = await injectStripeWebhook({
            type: 'invoice.payment_failed',
            data_object: { object: 'invoice', subscription: subId, next_payment_attempt: null },
        });
        expect(res.threw, `invoice.payment_failed must be handled without error (got: ${res.error ?? 'none'})`).toBe(false);

        // The handler sets can_post_product=0 (and, on the final attempt, deletes the pack) → the vendor
        // can no longer publish. Assert "no longer active" (tolerant of the meta being '0' or removed).
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'can_post_product'), 'vendor must be terminated (no longer able to post) after a final payment failure').not.toBe('1');
        log.success('VS6.2: final payment failure terminated the vendor');
    });

    test('VS6.1: invoice.payment_succeeded (renewal cycle) records a renewal order', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        const subId = await subscribeAndGetSubId(browser);
        const orderId = await dbUtils.getUserMetaValue(VENDOR_ID, 'product_order_id');
        expect(orderId, 'vendor carries the subscription order id').toBeTruthy();
        // The handler reads the processing fee off the invoice's charge (Charge::retrieve), so pass a REAL
        // charge — the original purchase's charge — rather than an empty id (which throws "invalid ID").
        const chargeId = await getStripeChargeIdForOrder(orderId as string);

        // billing_reason=subscription_cycle is the renewal path → SubscriptionHelper::create_renewal_order,
        // which adds an "Order #… created to record renewal" note to the original subscription order.
        const res = await injectStripeWebhook({
            type: 'invoice.payment_succeeded',
            data_object: {
                object: 'invoice',
                id: 'in_e2e_renewal_' + subId.slice(-10),
                subscription: subId,
                paid: true,
                billing_reason: 'subscription_cycle',
                currency: 'usd',
                charge: chargeId,
                amount_paid: 1000,
            },
        });
        expect(res.threw, `invoice.payment_succeeded must be handled without error (got: ${res.error ?? 'none'})`).toBe(false);

        const notes = await getOrderNotes(orderId as string);
        expect(
            notes.some(n => /created to record renewal/i.test(n)),
            `the subscription order should carry a renewal note after a subscription_cycle invoice (notes: ${JSON.stringify(notes)})`,
        ).toBe(true);
        log.success('VS6.1: renewal-cycle invoice recorded a renewal order');
    });
});
