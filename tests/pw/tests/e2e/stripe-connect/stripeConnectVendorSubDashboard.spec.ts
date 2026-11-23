import { test, expect } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { stripeConnectApi } from '@utils/stripeApi';
import { StripeConnectPage } from './stripeConnectPage';
import {
    VENDOR_ID,
    vendorAuth,
    hasCredentials,
    ensureStripeConnectConfigured,
    restoreStripeExpress,
    ensureBillingAddress,
    getOrderMetaValue,
    setDokanModule,
    setVendorSubscriptionFeature,
    seedSubscriptionPack,
    buyPackExpectReceived,
    cleanupSubscription,
} from './helpers';

/**
 * Stripe Connect — the vendor's own subscription controls (SCSUB-13 to SCSUB-15).
 *
 * Cancel schedules `cancel_at_period_end` in Stripe, so the vendor keeps selling until the period
 * runs out, and reactivate clears it. Both are synchronous Stripe calls made by the REST handler,
 * so no webhook is involved and nothing here waits on one.
 *
 * The surface is the React route `/dashboard/new/#/subscription`, not the legacy
 * `/dashboard/subscription/` page, and it re-renders in place rather than navigating.
 */
test.describe.serial('Stripe Connect — vendor subscription dashboard @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    let packId: string;
    let packName = '';
    let stripeSubId = '';

    test.beforeAll(async ({ browser }) => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        await ensureBillingAddress(VENDOR_ID);
        await setDokanModule('product_subscription', true);
        [packId, packName] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());

        // The React card only renders an active subscription when a real order and subscription
        // exist behind it. Seeding `can_post_product` alone renders nothing, so the setup buys.
        const orderId = await buyPackExpectReceived(browser, packId);
        expect(orderId, 'setup: the recurring pack was purchased').toBeTruthy();
        stripeSubId = (await getOrderMetaValue(orderId as string, '_stripe_subscription_id')) ?? '';
        expect(stripeSubId, 'setup: a Stripe subscription was created').toMatch(/^sub_/);
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await cleanupSubscription(packId, [stripeSubId]);
        await restoreStripeExpress();
    });

    test('SCSUB-13: the dashboard shows the active subscription pack', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — no subscription to display');

        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            await new StripeConnectPage(page).assertActivePackBanner(packName);
            log.success(`Dashboard shows the active pack "${packName}" and the cancel control`);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    test('SCSUB-14: cancelling schedules the Stripe cancellation and leaves the vendor selling', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — no subscription to cancel');

        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            await new StripeConnectPage(page).cancelSubscriptionFromDashboard();
        } finally {
            await page.close();
            await ctx.close();
        }

        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'dokan_has_active_cancelled_subscrption'), 'the vendor is flagged as cancelled but still active').toBeTruthy();

        // Stripe is the oracle. A local flag with no scheduled cancellation in Stripe would keep
        // billing the vendor after they cancelled.
        const sub = await stripeConnectApi.getSubscription(stripeSubId);
        expect(sub.cancel_at_period_end, 'Stripe has the cancellation scheduled for the period end').toBe(true);
        expect(sub.status, 'the subscription stays active until the period ends').toBe('active');
        log.success(`Subscription ${stripeSubId} set to cancel at period end, status ${sub.status}`);
    });

    test('SCSUB-15: reactivating clears the scheduled cancellation', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — no subscription to reactivate');

        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            await new StripeConnectPage(page).reactivateSubscriptionFromDashboard();
        } finally {
            await page.close();
            await ctx.close();
        }

        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'dokan_has_active_cancelled_subscrption'), 'the cancelled-but-active flag is cleared').toBeFalsy();
        const sub = await stripeConnectApi.getSubscription(stripeSubId);
        expect(sub.cancel_at_period_end, 'reactivation clears the scheduled cancellation in Stripe').toBe(false);
        expect(sub.status, 'the subscription remains active').toBe('active');
        log.success(`Subscription ${stripeSubId} reactivated`);
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
