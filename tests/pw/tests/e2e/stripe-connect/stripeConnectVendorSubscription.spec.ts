import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { stripeConnectApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS } from './stripeConnectPage';
import {
    VENDOR_ID,
    vendorAuth,
    hasCredentials,
    ensureStripeConnectConfigured,
    restoreStripeExpress,
    ensureBillingAddress,
    getOrderMetaValue,
    getLatestConnectOrderId,
    latestPaidConnectOrderAfter,
    setDokanModule,
    setVendorSubscriptionFeature,
    seedSubscriptionPack,
    buyPackExpectReceived,
    cleanupSubscription,
} from './helpers';

/**
 * Stripe Connect — vendor subscription packs (SCSUB-03, SCSUB-07 to SCSUB-12).
 *
 * A vendor buys a `product_pack` to earn the right to sell. The pack is an ADMIN product, so the
 * fee is platform revenue and no vendor transfer is created. Recurring packs bill through a real
 * Stripe Subscription; non-recurring ones use a plain one-off PaymentIntent, because
 * `StripeController` only routes to the subscription intent for `cart_contains_dps_recurring_pack`.
 *
 * `28c873a7e` on the revamp branch changed how these settle: a pack's PaymentIntent is minted by a
 * Stripe INVOICE, not by the cart, which broke three assumptions the Payment Elements path makes.
 * Before it, the checkout could fail to mount at all with "Could not initialize Stripe".
 */
test.describe.serial('Stripe Connect — vendor subscription packs @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    let packId: string;
    let purchasedOrderId: string | undefined;
    let purchasedIntentId = '';
    let stripeSubId = '';

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        await ensureBillingAddress(VENDOR_ID);
        await dbUtils.clearCustomerCart(VENDOR_ID);
        await dbUtils.removeVendorSubscription(VENDOR_ID);
        await setDokanModule('product_subscription', true);
        [packId] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await cleanupSubscription(packId, [stripeSubId]);
        await restoreStripeExpress();
    });

    // SCSUB-07 — the mount guard. A pack checkout that renders an empty element with an init error
    // is the exact shape of the bug the revamp fixed, and it would satisfy a naive "mount visible"
    // wait, so this asserts a live card iframe and the absence of the error text.
    test('SCSUB-07: the Payment Element mounts on a recurring pack checkout', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(VENDOR_ID);
            await stripe.addProductToCart(packId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.assertBlockPaymentElementReady();
            log.success('Recurring pack checkout mounted the Payment Element with no init error');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // SCSUB-03 — the whole point of the feature: pay, get activated, and have a real Stripe
    // Subscription behind it. Stripe is the oracle for the last part; user meta alone would pass
    // on a local write that never reached Stripe.
    test('SCSUB-03: buying a recurring pack activates the vendor and creates a live Stripe subscription', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        purchasedOrderId = await buyPackExpectReceived(browser, packId);
        expect(purchasedOrderId, 'the pack purchase reached order-received').toBeTruthy();

        const api = new ApiUtils(await request.newContext());
        await expect
            .poll(
                async () => {
                    const [, o] = await api.getSingleOrder(purchasedOrderId as string, payloads.adminAuth);
                    return o.status as string;
                },
                { message: 'the pack order should settle to a paid status', timeout: 60_000 },
            )
            .toMatch(/processing|completed/);

        const [, order] = await api.getSingleOrder(purchasedOrderId as string, payloads.adminAuth);
        expect(order.payment_method, 'paid with the Stripe Connect gateway').toBe('dokan-stripe-connect');

        const meta = (k: string): string | undefined => (order.meta_data ?? []).find((m: { key: string; value: string }) => m.key === k)?.value;
        stripeSubId = meta('_stripe_subscription_id') ?? '';
        purchasedIntentId = meta('_stripe_intent_id') ?? meta('dokan_stripe_intent_id') ?? '';
        expect(stripeSubId, 'the order carries a Stripe Subscription id').toMatch(/^sub_/);
        expect(purchasedIntentId, 'the order carries a Stripe PaymentIntent id').toMatch(/^pi_/);

        await expect
            .poll(async () => dbUtils.getUserMetaValue(VENDOR_ID, 'can_post_product'), {
                message: 'the vendor should be activated after the pack purchase',
                timeout: 40_000,
            })
            .toBe('1');
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'product_package_id'), 'the pack is assigned to the vendor').toBe(packId);
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, '_customer_recurring_subscription'), 'the recurring subscription is marked active').toBe('active');
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_subscription_id'), 'the vendor carries the Stripe Subscription id').toMatch(/^sub_/);

        const sub = await stripeConnectApi.getSubscription(stripeSubId);
        expect(sub.status, 'Stripe reports the subscription as live').toMatch(/active|trialing/);
        log.success(`Pack purchased — order ${purchasedOrderId}, Stripe sub ${stripeSubId} (${sub.status})`);
    });

    // SCSUB-08 — money. Dokan uses separate charges and transfers, so a vendor payout would appear
    // as a Transfer whose source_transaction is this charge. The charge's own transfer/destination
    // fields are always empty for this gateway and prove nothing either way.
    test('SCSUB-08: the pack fee is platform revenue with no vendor transfer', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — no charge to inspect');
        test.skip(!purchasedIntentId, 'no PaymentIntent captured from the pack purchase');

        const chargeId = await stripeConnectApi.getLatestChargeId(purchasedIntentId);
        const transfers = await stripeConnectApi.transfersForCharge(chargeId);
        expect(transfers.length, 'a pack fee is admin revenue, so no Transfer should be funded by its charge').toBe(0);
        log.success(`Pack charge ${chargeId} funded ${transfers.length} vendor transfers`);
    });

    // SCSUB-09 — a decline must not subscribe anybody. Pinned against a baseline order id so an
    // unrelated order created by another spec cannot be mistaken for this one.
    test('SCSUB-09: a declined card on the pack checkout creates no paid order', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const baseline = await getLatestConnectOrderId();
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(VENDOR_ID);
            await dbUtils.removeVendorSubscription(VENDOR_ID);
            await stripe.addProductToCart(packId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.declined);
            await stripe.placeBlockOrderExpectError();
        } finally {
            await page.close();
            await ctx.close();
        }

        // A decline legitimately leaves a pending order behind, so the invariant is about payment,
        // not about order creation. Comparing raw ids would fail on correct behaviour.
        const newPaid = await latestPaidConnectOrderAfter(baseline);
        expect(newPaid, `a declined card must not create a paid Stripe Connect order (found ${newPaid})`).toBe(0);
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'can_post_product'), 'a decline must not activate the vendor').not.toBe('1');
        log.success('Declined pack payment left no paid order and no activation');
    });
});

/**
 * A non-recurring lifetime pack (SCSUB-10). This does NOT route through the subscription intent
 * path, so it charges a plain one-off PaymentIntent and creates no Stripe Subscription at all. The
 * vendor is still activated, just without the recurring flag.
 */
test.describe.serial('Stripe Connect — vendor subscription, lifetime pack @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    let packId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        await ensureBillingAddress(VENDOR_ID);
        // `_pack_validity = -1` is what produces the 'unlimited' end date.
        await setDokanModule('product_subscription', true);
        [packId] = await seedSubscriptionPack(payloads.createDokanSubscriptionProduct(), [['_pack_validity', '-1']]);
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await cleanupSubscription(packId, []);
        await restoreStripeExpress();
    });

    test('SCSUB-10: a lifetime pack activates through a one-off PaymentIntent and mints no subscription', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const orderId = await buyPackExpectReceived(browser, packId);
        expect(orderId, 'the lifetime pack purchase reached order-received').toBeTruthy();

        const api = new ApiUtils(await request.newContext());
        await expect
            .poll(
                async () => {
                    const [, o] = await api.getSingleOrder(orderId as string, payloads.adminAuth);
                    return o.status as string;
                },
                { message: 'the lifetime pack order should settle to a paid status', timeout: 60_000 },
            )
            .toMatch(/processing|completed/);

        const intentId = (await getOrderMetaValue(orderId as string, '_stripe_intent_id')) ?? (await getOrderMetaValue(orderId as string, 'dokan_stripe_intent_id'));
        expect(intentId, 'the order carries a Stripe PaymentIntent id').toMatch(/^pi_/);
        expect(await getOrderMetaValue(orderId as string, '_stripe_subscription_id'), 'a non-recurring pack must not create a Stripe subscription').toBeFalsy();

        await expect
            .poll(async () => dbUtils.getUserMetaValue(VENDOR_ID, 'can_post_product'), {
                message: 'the vendor should be activated after the lifetime pack purchase',
                timeout: 40_000,
            })
            .toBe('1');
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'product_package_id'), 'the pack is assigned to the vendor').toBe(packId);
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, '_customer_recurring_subscription'), 'a lifetime pack is not a recurring subscription').not.toBe('active');
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_subscription_id'), 'no Stripe subscription id on the vendor').toBeNull();
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'product_pack_enddate'), 'a lifetime pack never expires').toBe('unlimited');

        const chargeId = await stripeConnectApi.getLatestChargeId(intentId as string);
        expect((await stripeConnectApi.transfersForCharge(chargeId)).length, 'the pack fee stays with the platform').toBe(0);
        log.success(`Lifetime pack: order ${orderId} settled via ${intentId} with no subscription`);
    });
});

/**
 * A recurring pack carrying a free trial (SCSUB-11). Stripe still creates a Subscription, but with
 * a future `trial_end` and status `trialing`, and takes no money up front.
 *
 * The vendor must not have used a trial before or Stripe applies no `trial_end` at all and the
 * subscription comes back `active`. That reads exactly like a product bug and is not one, which is
 * why the trial metas are cleared first.
 */
test.describe.serial('Stripe Connect — vendor subscription, free trial @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    const TRIAL_META = ['dokan_used_trial_pack', '_dokan_subscription_is_on_trial', '_dokan_subscription_trial_until'];
    let packId: string;
    let stripeSubId = '';

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        await ensureBillingAddress(VENDOR_ID);
        await dbUtils.deleteUserMeta(VENDOR_ID, TRIAL_META);
        await setDokanModule('product_subscription', true);
        [packId] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring(), [
            ['dokan_subscription_enable_trial', 'yes'],
            ['dokan_subscription_trail_range', '3'], // the source meta key really is misspelled
            ['dokan_subscription_trial_period_types', 'day'],
        ]);
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await cleanupSubscription(packId, [stripeSubId]);
        await dbUtils.deleteUserMeta(VENDOR_ID, TRIAL_META);
        await restoreStripeExpress();
    });

    test('SCSUB-11: a free-trial pack creates a trialing subscription and charges nothing up front', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const orderId = await buyPackExpectReceived(browser, packId);
        expect(orderId, 'the trial pack purchase reached order-received').toBeTruthy();

        stripeSubId = (await getOrderMetaValue(orderId as string, '_stripe_subscription_id')) ?? '';
        expect(stripeSubId, 'a trial pack still creates a Stripe subscription').toMatch(/^sub_/);

        const sub = await stripeConnectApi.getSubscription(stripeSubId);
        expect(sub.status, 'a free-trial subscription is trialing, not active').toBe('trialing');
        expect(Number(sub.trial_end), 'the trial end is in the future').toBeGreaterThan(Math.floor(Date.now() / 1000));

        await expect
            .poll(async () => dbUtils.getUserMetaValue(VENDOR_ID, 'can_post_product'), {
                message: 'the vendor should be activated for the trial window',
                timeout: 40_000,
            })
            .toBe('1');
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'product_package_id'), 'the trial pack is assigned to the vendor').toBe(packId);
        log.success(`Free-trial pack: Stripe sub ${stripeSubId} status=${sub.status} trial_end=${sub.trial_end}`);
    });
});

/**
 * SCA on a pack checkout (SCSUB-12). The first invoice's PaymentIntent requires a challenge with
 * the 3DS test card. Completing it must settle the order and activate the vendor.
 */
test.describe.serial('Stripe Connect — vendor subscription, 3D Secure @pro', () => {
    test.describe.configure({ timeout: 360_000 });

    let packId: string;
    let stripeSubId = '';

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
        await cleanupSubscription(packId, [stripeSubId]);
        await restoreStripeExpress();
    });

    test('SCSUB-12: a 3D Secure card on the pack checkout settles after the challenge', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(VENDOR_ID);
            await dbUtils.removeVendorSubscription(VENDOR_ID);
            await stripe.addProductToCart(packId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            const baseline = await stripe.connectOrderBaseline();
            await stripe.fillCardDetails(STRIPE_CARDS.threeDS);

            // The challenge frame only appears after the press, so the press cannot be awaited to
            // completion first. placeBlockOrderExpectReceived resolves through its settle poll once
            // the challenge is answered, which is why the two run concurrently.
            const placing = stripe.placeBlockOrderExpectReceived(baseline);
            await stripe.completeThreeDsChallenge();
            await placing;
        } finally {
            await page.close();
            await ctx.close();
        }

        await expect
            .poll(async () => dbUtils.getUserMetaValue(VENDOR_ID, 'can_post_product'), {
                message: 'the vendor should be activated after the challenged payment settles',
                timeout: 60_000,
            })
            .toBe('1');
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'product_package_id'), 'the pack is assigned to the vendor').toBe(packId);
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, '_customer_recurring_subscription'), 'the recurring subscription is marked active').toBe('active');

        stripeSubId = (await dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_subscription_id')) ?? '';
        expect(stripeSubId, 'the vendor carries the Stripe Subscription id').toMatch(/^sub_/);
        const sub = await stripeConnectApi.getSubscription(stripeSubId);
        expect(sub.status, 'Stripe reports the subscription as live after SCA').toMatch(/active|trialing/);
        log.success(`3D Secure pack purchase settled — Stripe sub ${stripeSubId} (${sub.status})`);
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
