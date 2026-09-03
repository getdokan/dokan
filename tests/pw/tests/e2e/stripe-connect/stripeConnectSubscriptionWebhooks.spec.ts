import { test, expect, Browser } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { stripeConnectApi } from '@utils/stripeApi';
import {
    VENDOR_ID,
    hasCredentials,
    ensureStripeConnectConfigured,
    restoreStripeExpress,
    ensureBillingAddress,
    getOrderNotes,
    getConnectIntentIdForOrder,
    injectConnectWebhook,
    setDokanModule,
    setVendorSubscriptionFeature,
    seedSubscriptionPack,
    buyPackExpectReceived,
    cleanupSubscription,
} from './helpers';

/**
 * Stripe Connect — vendor subscription lifecycle webhooks (SCSUB-16 to SCSUB-18).
 *
 * Renewal, dunning failure and cancellation all arrive days or months after the purchase, so a
 * local site never receives them on its own. Each case buys a real pack first, captures the live
 * Stripe subscription id, and then injects the lifecycle event through the test mu-plugin into the
 * module's own EventFactory. The subscription behind the event is real, so every Stripe read the
 * handler performs resolves.
 *
 * Every subscription these tests create is cancelled in teardown. A leaked one keeps billing in
 * test mode and quietly changes what the next run measures.
 */
test.describe.serial('Stripe Connect — vendor subscription lifecycle webhooks @pro', () => {
    test.describe.configure({ timeout: 360_000 });

    let packId: string;
    const createdSubs: string[] = [];

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        await ensureBillingAddress(VENDOR_ID);
        await setDokanModule('product_subscription', true);
        [packId] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await cleanupSubscription(packId, createdSubs);
        await restoreStripeExpress();
    });

    /** Buy the pack as the vendor and return the live Stripe subscription id. */
    async function subscribeAndGetSubId(browser: Browser): Promise<string> {
        const orderId = await buyPackExpectReceived(browser, packId);
        expect(orderId, 'the pack purchase reached order-received').toBeTruthy();
        await expect
            .poll(() => dbUtils.getUserMetaValue(VENDOR_ID, 'can_post_product'), {
                message: 'the vendor should be activated before the lifecycle event is injected',
                timeout: 60_000,
            })
            .toBe('1');
        const subId = await dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_subscription_id');
        expect(subId, 'the vendor carries a live Stripe subscription id').toMatch(/^sub_/);
        createdSubs.push(subId as string);
        return subId as string;
    }

    test('SCSUB-16: a renewal-cycle invoice records a renewal order', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot create a real subscription');

        const subId = await subscribeAndGetSubId(browser);
        const orderId = await dbUtils.getUserMetaValue(VENDOR_ID, 'product_order_id');
        expect(orderId, 'the vendor carries the subscription order id').toBeTruthy();

        // The handler reads the processing fee off the invoice's charge, so this passes the real
        // charge from the original purchase. An empty or invented id throws "invalid ID" and the
        // case would then be measuring the test harness rather than the product.
        const intentId = await getConnectIntentIdForOrder(orderId as string);
        const chargeId = await stripeConnectApi.getLatestChargeId(intentId);

        const res = await injectConnectWebhook({
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
            `the subscription order should carry a renewal note (notes: ${JSON.stringify(notes)})`,
        ).toBe(true);
        log.success('Renewal-cycle invoice recorded a renewal order');
    });

    test('SCSUB-17: a final payment failure terminates the vendor', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot create a real subscription');

        const subId = await subscribeAndGetSubId(browser);
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'can_post_product'), 'the vendor is active before the failure').toBe('1');

        // `next_payment_attempt: null` is what marks this as the last dunning attempt.
        const res = await injectConnectWebhook({
            type: 'invoice.payment_failed',
            data_object: { object: 'invoice', subscription: subId, next_payment_attempt: null },
        });
        expect(res.threw, `invoice.payment_failed must be handled without error (got: ${res.error ?? 'none'})`).toBe(false);

        expect(
            await dbUtils.getUserMetaValue(VENDOR_ID, 'can_post_product'),
            'the vendor must lose the right to publish after the final payment failure',
        ).not.toBe('1');
        log.success('Final payment failure terminated the vendor');
    });

    test('SCSUB-18: a deleted subscription revokes the pack', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot create a real subscription');

        const subId = await subscribeAndGetSubId(browser);

        const res = await injectConnectWebhook({
            type: 'customer.subscription.deleted',
            data_object: { id: subId, object: 'subscription', status: 'canceled' },
        });
        expect(res.threw, `customer.subscription.deleted must be handled without error (got: ${res.error ?? 'none'})`).toBe(false);

        expect(
            await dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_subscription_id'),
            'the Stripe subscription id should be cleared once the subscription is gone',
        ).toBeFalsy();
        log.success('Deleted subscription revoked the vendor pack');
    });
});

/*
 * File-level teardown. The vendor-subscription feature gates site-wide product-publish and cart
 * hooks, so leaving it on makes every later spec bounce off an emptied cart, and the failure looks
 * nothing like its cause. It is switched off once here, at the end of the file, rather than after
 * every describe: flipping it repeatedly mid-file leaves windows where the module is half
 * initialised and empties a pack straight back out of the cart.
 */
test.afterAll(async () => {
    await setVendorSubscriptionFeature(false);
});
