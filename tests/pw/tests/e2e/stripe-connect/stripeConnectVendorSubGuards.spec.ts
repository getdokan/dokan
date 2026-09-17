import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
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
    setDokanModule,
    seedSubscriptionPack,
    buyPackExpectReceived,
    cleanupSubscription,
    setVendorSubscriptionFeature,
} from './helpers';

const SKIP_NO_KEYS = 'Stripe Connect keys missing — cannot drive the Payment Element';

/** Trash a pack that `cleanupSubscription` was not handed. */
async function trashPack(packId: string | undefined): Promise<void> {
    if (!packId) {
        return;
    }
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.delete(`${SERVER_URL}/wc/v3/products/${packId}?force=true`);
    } finally {
        await ctx.dispose();
    }
}

/**
 * SCSUB-19 — re-opening the checkout for the same pack must not leave the buyer with two
 * subscriptions. The Payment Element mounts a pending subscription each time it initialises, so
 * without the cart fingerprint added in `35aeb6e6a` a vendor who hesitates and reloads ends up
 * billed twice. Stripe's own list of the customer's subscriptions is the only oracle that catches
 * it, since local meta only ever records the last one.
 */
test.describe.serial('Stripe Connect — vendor subscription reuse @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    let packId: string | undefined;
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
        await cleanupSubscription(packId, stripeSubId ? [stripeSubId] : []);
        await restoreStripeExpress();
    });

    test('SCSUB-19: re-opening the pack checkout leaves exactly one Stripe subscription', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, SKIP_NO_KEYS);

        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        let orderId: string | undefined;
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(VENDOR_ID);
            await dbUtils.removeVendorSubscription(VENDOR_ID);
            await stripe.addProductToCart(packId as string);

            // Mount once without paying, which is where a pending subscription gets created.
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.assertBlockPaymentElementReady();

            // Re-open the same cart's checkout, mounting a second time.
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.assertBlockPaymentElementReady();

            await stripe.fillCardDetails(STRIPE_CARDS.success);
            // Use the resolved id, not the URL: the page object can settle through a polling
            // fallback that never navigates, and the URL would then yield nothing.
            orderId = (await stripe.placeBlockOrderExpectReceived()) || page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'the pack purchase reached order-received').toBeTruthy();

        stripeSubId = (await getOrderMetaValue(orderId as string, '_stripe_subscription_id')) ?? '';
        expect(stripeSubId, 'the order carries a Stripe Subscription id').toMatch(/^sub_/);
        await expect
            .poll(async () => dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_subscription_id'), {
                message: 'the vendor should carry the activated subscription id',
                timeout: 40_000,
            })
            .toMatch(/^sub_/);
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_subscription_id'), 'the activated subscription is the one on the order').toBe(stripeSubId);

        const sub = await stripeConnectApi.getSubscription(stripeSubId);
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
        const priceId = sub.items?.data?.[0]?.price?.id;
        expect(customerId, 'resolved the buyer Stripe customer id').toBeTruthy();
        expect(priceId, 'resolved the pack price id').toBeTruthy();

        const all = await stripeConnectApi.listSubscriptionsForCustomer(customerId as string);
        const forThisPack = all.filter((s: any) => (s.items?.data ?? []).some((it: any) => it.price?.id === priceId));
        expect(forThisPack.length, 'mounting the checkout twice must reuse the pending subscription, not add a second').toBe(1);
        log.success(`Re-opening the checkout left exactly one subscription (${stripeSubId}) for customer ${customerId}`);
    });
});

/**
 * SCSUB-20 — the module allows one pack per cart. Adding a second replaces the first. Pure cart
 * state, so no card and no credentials gate.
 */
test.describe.serial('Stripe Connect — one pack per cart @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    let packA: string | undefined;
    let packB: string | undefined;

    test.beforeAll(async () => {
        await setDokanModule('product_subscription', true);
        [packA] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
        [packB] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
    });

    test.afterAll(async () => {
        await dbUtils.clearCustomerCart(VENDOR_ID);
        await cleanupSubscription(packB, []);
        await trashPack(packA);
    });

    test('SCSUB-20: adding a second pack leaves exactly one pack in the cart', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(VENDOR_ID);
            await dbUtils.removeVendorSubscription(VENDOR_ID);
            await stripe.addProductToCart(packA as string);
            await stripe.addProductToCart(packB as string);

            await stripe.gotoBlockCheckout();
            const summaryItems = page.locator('.wc-block-components-order-summary-item');
            await summaryItems.first().waitFor({ state: 'visible', timeout: 30_000 });
            await expect(summaryItems, 'a second pack must replace the first rather than stack').toHaveCount(1);
            log.success('Adding a second pack left exactly one pack line in the cart');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});

/**
 * SCSUB-21 — a vendor already holding a pack cannot add another. The guard empties the cart and
 * bounces them back with `already-has-subscription=true`. This is intended behaviour, and the case
 * exists so a regression that silently switches the vendor's pack is caught.
 */
test.describe.serial('Stripe Connect — one active subscription per vendor @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    let packA: string | undefined;
    let packB: string | undefined;
    let subA = '';

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        await ensureBillingAddress(VENDOR_ID);
        await dbUtils.removeVendorSubscription(VENDOR_ID);
        await setDokanModule('product_subscription', true);
        [packA] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
        [packB] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await cleanupSubscription(packB, [subA].filter(Boolean));
        await trashPack(packA);
        await restoreStripeExpress();
    });

    test('SCSUB-21: a subscribed vendor cannot add a second pack', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, SKIP_NO_KEYS);

        const orderA = await buyPackExpectReceived(browser, packA as string);
        expect(orderA, 'the first pack purchase reached order-received').toBeTruthy();
        subA = (await getOrderMetaValue(orderA as string, '_stripe_subscription_id')) ?? '';
        expect(subA, 'the first pack order carries a Stripe subscription id').toMatch(/^sub_/);
        await expect
            .poll(async () => dbUtils.getUserMetaValue(VENDOR_ID, 'product_package_id'), {
                message: 'the vendor should hold the first pack',
                timeout: 40_000,
            })
            .toBe(packA);

        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(VENDOR_ID);
            await stripe.addProductToCart(packB as string);
            await expect(page, 'adding a second pack bounces back to the subscription page').toHaveURL(/already-has-subscription=true/);

            // The guard emptied the cart, so the checkout bounces to /cart. A raw goto is used
            // deliberately: gotoBlockCheckout waits for a place-order button that never renders here.
            await page.goto(stripe.checkout.blockUrl);
            await page.waitForLoadState('domcontentloaded');
            await expect(page, 'an empty cart bounces the block checkout back to the cart').toHaveURL(/\/cart\/?($|\?)/);
        } finally {
            await page.close();
            await ctx.close();
        }

        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'product_package_id'), 'the vendor stays on the first pack with no silent switch').toBe(packA);
        log.success(`The guard kept the vendor on pack ${packA} and blocked pack ${packB}`);
    });
});

/**
 * SCSUB-22 — a logged-out visitor cannot buy a pack. Packs are bought by vendors, so the flow has
 * to send a guest to log in rather than to a checkout.
 */
test.describe.serial('Stripe Connect — vendor subscription logged-out guard @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    let packId: string | undefined;

    test.beforeAll(async () => {
        await setVendorSubscriptionFeature(true);
        await setDokanModule('product_subscription', true);
        [packId] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
    });

    test.afterAll(async () => {
        await cleanupSubscription(packId, []);
    });

    test('SCSUB-22: a guest adding a pack is sent to log in, never to checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(packId as string);
            await expect(page, 'a guest should land on a login surface').toHaveURL(/wp-login\.php|\/my-account|action=login|redirect_to/);
            await expect(page, 'a guest must not reach order-received').not.toHaveURL(/order-received/);
            log.success(`Guest add-to-cart of a pack redirected to ${new URL(page.url()).pathname}`);
        } finally {
            await page.close();
            await ctx.close();
        }
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
