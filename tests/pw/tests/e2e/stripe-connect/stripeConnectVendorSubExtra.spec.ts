import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS } from './stripeConnectPage';
import {
    vendorAuth,
    adminAuth,
    VENDOR_ID,
    SERVER_URL,
    hasCredentials,
    seedSubscriptionPack,
    buyPackExpectReceived,
    cleanupSubscription,
    setVendorSubscriptionFeature,
    getOrderMetaValue,
    ensureBillingAddress,
} from './helpers';

/**
 * Stripe Connect — vendor-subscription remainder + admin list.
 *
 * Buyer is the VENDOR (vendorAuth / VENDOR_ID): a vendor purchases a recurring
 * "product_pack" through the Stripe Connect block checkout to gain selling rights.
 * This file finishes the vendor-subscription matrix that stripeConnect.spec.ts
 * started, covering the recurring-sub Stripe truth (VS1.3), single-sub reuse
 * (VS8.1), one-pack-per-cart (VS8.2), one active subscription per vendor —
 * adding a 2nd pack is blocked (VS8.3), logged-out guard (VS8.4), trusted-vendor
 * publish under an active pack (VS4.2) and the admin Subscriptions DataViews list (VS7).
 *
 * Toolkit is imported, never re-implemented; there are no LOCAL helpers.
 */

const SKIP_NO_KEYS = 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env';

// ============================================================================
// VS1.3 — recurring pack: Stripe Subscription live + first invoice charged
// ============================================================================
test.describe.serial('Stripe Connect — vendor subscription recurring remainder (VS1.3)', () => {
    test.describe.configure({ timeout: 180_000 }); // real card entry + Stripe confirm/redirect is slow (cold CI first attempt)
    let packId: string | undefined;
    let stripeSubId = '';

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return; // whole describe skips; don't seed/mutate the site for tests that won't run
        }
        await ensureBillingAddress(VENDOR_ID);
        [packId] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
    });

    test.afterAll(async () => {
        await cleanupSubscription(packId, stripeSubId ? [stripeSubId] : []);
    });

    test('vendor: a recurring pack creates a live Stripe Subscription with a paid first invoice', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, SKIP_NO_KEYS);

        const orderId = await buyPackExpectReceived(browser, packId as string);
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();

        // Resolve the live Stripe objects from the order meta written at purchase.
        stripeSubId = (await getOrderMetaValue(orderId as string, '_stripe_subscription_id')) ?? '';
        const intentId = (await getOrderMetaValue(orderId as string, '_stripe_intent_id')) ?? (await getOrderMetaValue(orderId as string, 'dokan_stripe_intent_id')) ?? '';
        expect(stripeSubId, 'order carries a Stripe Subscription id (sub_…)').toMatch(/^sub_/);

        // (1) The Subscription object is live on the platform account.
        const sub = await stripeApi.getSubscription(stripeSubId);
        expect(sub.status, 'Stripe subscription should be active or trialing').toMatch(/active|trialing/);

        // (2) The first invoice charged on the platform: prefer the order's PaymentIntent (immediate-charge,
        // non-trial pack); fall back to latest_invoice.payment_intent on the subscription (fix stores it there).
        const piId = intentId || (typeof sub.latest_invoice?.payment_intent === 'string' ? sub.latest_invoice.payment_intent : sub.latest_invoice?.payment_intent?.id) || '';
        expect(piId, 'a first-invoice PaymentIntent id is resolvable (order meta or latest_invoice)').toMatch(/^pi_/);
        const pi = await stripeApi.getPaymentIntent(piId);
        expect(pi.status, 'first-invoice PaymentIntent succeeded on the platform account').toBe('succeeded');
        expect(pi.amount_received ?? pi.amount, 'the first invoice was actually charged (amount > 0)').toBeGreaterThan(0);

        log.success(`VS1.3 — recurring sub ${stripeSubId} is ${sub.status}; first-invoice PI ${piId} succeeded (charged ${pi.amount_received ?? pi.amount})`);
    });
});

// ============================================================================
// VS8.1 — subscription reuse: re-opening checkout for the same pack does NOT
// create a duplicate Stripe Subscription for the buyer's customer.
// ============================================================================
test.describe.serial('Stripe Connect — vendor subscription reuse (VS8.1)', () => {
    test.describe.configure({ timeout: 180_000 });
    let packId: string | undefined;
    let stripeSubId = '';

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureBillingAddress(VENDOR_ID);
        [packId] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
    });

    test.afterAll(async () => {
        await cleanupSubscription(packId, stripeSubId ? [stripeSubId] : []);
    });

    test('vendor: re-opening checkout for the same pack leaves exactly ONE Stripe subscription for the buyer', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, SKIP_NO_KEYS);

        // Mount the PE once WITHOUT placing the order (this is where a pending sub/setup intent is created),
        // then navigate away and re-open /checkout/ to re-mount the PE a second time for the SAME cart — the
        // cart-fingerprint fix must reuse the pending sub rather than create a duplicate. Then complete the buy.
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        let orderId: string | undefined;
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(VENDOR_ID);
            await dbUtils.removeVendorSubscription(VENDOR_ID);
            await stripe.addProductToCart(packId as string);

            // First PE mount.
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.assertBlockPaymentElementReady();

            // Re-open /checkout/ for the same cart → second PE mount (no order placed yet).
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.assertBlockPaymentElementReady();

            // Complete the purchase on the (now re-mounted) checkout.
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();

        // The order carries exactly one sub id, and after activation it is the same sub on the vendor meta.
        stripeSubId = (await getOrderMetaValue(orderId as string, '_stripe_subscription_id')) ?? '';
        expect(stripeSubId, 'order carries a Stripe Subscription id (sub_…)').toMatch(/^sub_/);
        await expect
            .poll(async () => dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_subscription_id'), {
                message: 'vendor should carry the activated Stripe subscription id',
                timeout: 30_000,
            })
            .toMatch(/^sub_/);
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_subscription_id'), 'the activated sub is the SAME one carried on the order (no duplicate)').toBe(stripeSubId);

        // Stripe truth: the buyer's Stripe customer has exactly ONE subscription matching this pack's price.
        const sub = await stripeApi.getSubscription(stripeSubId);
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
        expect(customerId, 'resolved the buyer Stripe customer id from the subscription').toBeTruthy();
        const priceId = sub.items?.data?.[0]?.price?.id;
        expect(priceId, 'resolved the pack price id from the subscription').toBeTruthy();

        const all = await stripeApi.listSubscriptionsForCustomer(customerId as string);
        const forThisPack = all.filter((s: any) => (s.items?.data ?? []).some((it: any) => it.price?.id === priceId));
        expect(
            forThisPack.length,
            'the cart-fingerprint fix means re-mounting the PE for the same cart reuses the pending sub — exactly ONE subscription for this pack price',
        ).toBe(1);

        log.success(`VS8.1 — re-opening checkout left exactly 1 subscription (${stripeSubId}) for customer ${customerId} on price ${priceId}`);
    });
});

// ============================================================================
// VS8.2 — only one pack per cart: adding pack B after pack A empties/replaces A.
// Pure cart-state test → NO Stripe charge, NO credentials gate.
// ============================================================================
test.describe.serial('Stripe Connect — vendor subscription one-pack-per-cart (VS8.2)', () => {
    test.describe.configure({ timeout: 180_000 });
    let packA: string | undefined;
    let packB: string | undefined;

    test.beforeAll(async () => {
        await setVendorSubscriptionFeature(true);
        [packA] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
        [packB] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
    });

    test.afterAll(async () => {
        await dbUtils.clearCustomerCart(VENDOR_ID);
        // cleanupSubscription trashes packB + restores the feature flag to its working default (off).
        await cleanupSubscription(packB, []);
        if (packA) {
            const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
            try {
                await ctx.delete(`${SERVER_URL}/wc/v3/products/${packA}?force=true`);
            } finally {
                await ctx.dispose();
            }
        }
    });

    test('vendor: adding a second pack to the cart leaves exactly one subscription pack', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(VENDOR_ID);
            await dbUtils.removeVendorSubscription(VENDOR_ID);
            await stripe.addProductToCart(packA as string);
            await stripe.addProductToCart(packB as string);

            // The subscription module enforces a single pack per cart (default _multiple_purchase='no'):
            // adding a second pack removes the first. The block checkout's order summary must show ONE line.
            await stripe.gotoBlockCheckout();
            const summaryItems = page.locator('.wc-block-components-order-summary-item');
            await summaryItems.first().waitFor({ state: 'visible', timeout: 30_000 });
            await expect(summaryItems, 'only one subscription pack may remain in the cart (module empties on a second add)').toHaveCount(1);
            log.success('VS8.2 — adding a second pack left exactly one pack line in the cart');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});

// ============================================================================
// VS8.3 — one active subscription per vendor: a vendor subscribed to pack A
// cannot add pack B. ProductSubscription::maybe_empty_cart GUARDS this: the
// cart is emptied and the vendor bounces to the subscription page with
// ?already-has-subscription=true. This is correct product behavior, not a bug.
// ============================================================================
test.describe.serial('Stripe Connect — one active subscription per vendor: adding a 2nd pack is blocked (VS8.3)', () => {
    test.describe.configure({ timeout: 180_000 });
    let packA: string | undefined;
    let packB: string | undefined;
    let subA = '';

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureBillingAddress(VENDOR_ID);
        await dbUtils.removeVendorSubscription(VENDOR_ID);
        [packA] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
        [packB] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
    });

    test.afterAll(async () => {
        // Only subA exists (pack B was never purchased — the guard blocked it). Cancel subA + restore feature
        // flag + trash packB, then trash packA separately (cleanupSubscription only trashes the pack id it is given).
        await cleanupSubscription(packB, [subA].filter(Boolean));
        if (packA) {
            const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
            try {
                await ctx.delete(`${SERVER_URL}/wc/v3/products/${packA}?force=true`);
            } finally {
                await ctx.dispose();
            }
        }
    });

    test('vendor: while subscribed to pack A, adding pack B is blocked (cart emptied, bounced to subscription page)', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, SKIP_NO_KEYS);

        // Step 1: subscribe to pack A (clean start via buyPackExpectReceived → removeVendorSubscription first).
        const orderA = await buyPackExpectReceived(browser, packA as string);
        expect(orderA, 'pack A purchase reached order-received').toBeTruthy();
        subA = (await getOrderMetaValue(orderA as string, '_stripe_subscription_id')) ?? '';
        expect(subA, 'pack A order carries a Stripe subscription id').toMatch(/^sub_/);
        await expect
            .poll(async () => dbUtils.getUserMetaValue(VENDOR_ID, 'product_package_id'), {
                message: 'vendor should be on pack A after the first purchase',
                timeout: 30_000,
            })
            .toBe(packA);

        // Step 2: as the vendor, clear the cart and try to add pack B while subscribed to A. The
        // one-active-subscription guard (ProductSubscription::maybe_empty_cart) empties the cart and bounces
        // the vendor to the subscription page with ?already-has-subscription=true — pack B is NOT added.
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(VENDOR_ID);
            await stripe.addProductToCart(packB as string);
            await expect(page, 'adding a 2nd pack while subscribed bounces to the subscription page (already-has-subscription)').toHaveURL(/already-has-subscription=true/);

            // The guard emptied the cart: hitting the block checkout bounces to the (empty) /cart page.
            // Use a raw goto (NOT gotoBlockCheckout — that waits 30s for a place-order button that never
            // renders on the /cart bounce).
            await page.goto(stripe.checkout.blockUrl);
            await page.waitForLoadState('domcontentloaded');
            await expect(page, 'an empty cart bounces the block checkout back to /cart').toHaveURL(/\/cart\/?($|\?)/);
        } finally {
            await page.close();
            await ctx.close();
        }

        // The vendor's active pack is STILL A — the guard prevented any silent switch.
        expect(await dbUtils.getUserMetaValue(VENDOR_ID, 'product_package_id'), 'the guard kept the vendor on pack A (no silent switch to B)').toBe(packA);

        log.success(`VS8.3 — one active subscription per vendor: adding pack B while on A(${packA}/${subA}) was blocked (cart emptied, bounced to subscription page)`);
    });
});

// ============================================================================
// VS8.4 — logged-out cannot buy a recurring pack → redirected to login.
// No Stripe charge, no credentials gate.
// ============================================================================
test.describe.serial('Stripe Connect — vendor subscription logged-out guard (VS8.4)', () => {
    test.describe.configure({ timeout: 180_000 });
    let packId: string | undefined;

    test.beforeAll(async () => {
        await setVendorSubscriptionFeature(true);
        [packId] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
    });

    test.afterAll(async () => {
        await cleanupSubscription(packId, []);
    });

    test('guest: adding a recurring pack to the cart bounces to login (never reaches checkout)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        // Fresh context with NO storageState → a true guest.
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(packId as string);
            // A guest hitting the vendor-subscription buy flow must be bounced to login and must NOT reach checkout/order-received.
            await expect(page, 'guest should be redirected to login, not checkout/order-received').toHaveURL(/wp-login\.php|\/my-account|action=login|redirect_to/);
            await expect(page, 'guest must not reach order-received').not.toHaveURL(/order-received/);
            log.success(`VS8.4 — guest add-to-cart of a recurring pack redirected to login (${new URL(page.url()).pathname})`);
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});

// ============================================================================
// VS4.2 — a subscribed (trusted) vendor publishes a product via REST.
// NOTE: REST publish-status is governed by TRUSTED-status, not the subscription
// pack — a trusted, actively-subscribed vendor must publish successfully.
// ============================================================================
test.describe.serial('Stripe Connect — subscribed vendor can publish (VS4.2)', () => {
    test.describe.configure({ timeout: 180_000 });
    let packId: string | undefined;
    let stripeSubId = '';
    let createdProductId: string | undefined;

    test.beforeAll(async ({ browser }) => {
        if (!hasCredentials) {
            return;
        }
        await ensureBillingAddress(VENDOR_ID);
        [packId] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
        // Subscribe the vendor so they hold an active pack (can_post_product) before the publish attempt.
        const orderId = await buyPackExpectReceived(browser, packId as string);
        stripeSubId = (await getOrderMetaValue(orderId as string, '_stripe_subscription_id')) ?? '';
    });

    test.afterAll(async () => {
        if (createdProductId) {
            const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
            try {
                await ctx.delete(`${SERVER_URL}/wc/v3/products/${createdProductId}?force=true`);
            } finally {
                await ctx.dispose();
            }
        }
        await cleanupSubscription(packId, stripeSubId ? [stripeSubId] : []);
    });

    test('vendor: with an active pack, a created product is published', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(!hasCredentials, SKIP_NO_KEYS);

        // The vendor holds an active pack (can_post_product=1). A trusted subscribed vendor's REST product create
        // stays 'publish' (publish status is trusted-status-driven; the active pack is the capability gate).
        await expect
            .poll(async () => dbUtils.getUserMetaValue(VENDOR_ID, 'can_post_product'), {
                message: 'vendor should be activated (can_post_product) by the active pack',
                timeout: 30_000,
            })
            .toBe('1');

        const api = new ApiUtils(await request.newContext());
        const [responseBody, productId] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
        createdProductId = productId;
        expect(responseBody?.status, 'a subscribed trusted vendor publishes the product (status publish)').toBe('publish');
        log.success(`VS4.2 — subscribed vendor published product ${productId} (status ${responseBody?.status})`);
    });
});

// ============================================================================
// VS7 — admin Subscriptions DataViews list shows the subscribed vendor/pack.
// ============================================================================
test.describe.serial('Stripe Connect — admin subscriptions list (VS7)', () => {
    test.describe.configure({ timeout: 180_000 });
    let packId: string | undefined;
    let packName = '';
    let stripeSubId = '';

    test.beforeAll(async ({ browser }) => {
        if (!hasCredentials) {
            return;
        }
        await ensureBillingAddress(VENDOR_ID);
        [packId, packName] = await seedSubscriptionPack(payloads.createDokanSubscriptionProductRecurring());
        // Subscribe the vendor so a row exists in the admin Subscriptions list.
        const orderId = await buyPackExpectReceived(browser, packId as string);
        expect(orderId, 'setup: the recurring pack was purchased').toBeTruthy();
        stripeSubId = (await getOrderMetaValue(orderId as string, '_stripe_subscription_id')) ?? '';
    });

    test.afterAll(async () => {
        await cleanupSubscription(packId, stripeSubId ? [stripeSubId] : []);
    });

    test('admin: the subscribed vendor appears in the Subscriptions list', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, SKIP_NO_KEYS);
        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.gotoAdminSubscriptions();
            // No reliable search box on Pro DataViews pages — scan the rendered rows for the pack title.
            await stripe.assertVendorInSubscriptionsList(packName);
            log.success(`VS7 — admin Subscriptions list contains the subscribed pack "${packName}"`);
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});
