import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { SERVER_URL, toPath } from '@utils/helpers';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeExpressPage, STRIPE_CARDS, STRIPE_EXPRESS_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    vendorAuth,
    VENDOR_ID,
    hasCredentials,
    ensureStripeExpressConfigured,
    enableProductAdvertisement,
    isProductAdvertised,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
    ensureBillingAddress,
    getStripeIntentIdForOrder,
    getStripeChargeIdForOrder,
    getOrderStatus,
    setOrderStatus,
} from './helpers';

/**
 * Stripe Express — Product Advertisement (SE-PADV 01..02).
 *
 * Serial because it mutates the global advertisement setting + seeds the shared vendor. A vendor
 * buys a Product-Advertisement slot for their own product, paying with the Express gateway through
 * the block checkout. The ad fee is PLATFORM revenue: the ad order carries only the admin-owned ad
 * base product (no vendor sub-order), so even after the order completes there is ZERO vendor Transfer
 * off the charge (the Stripe API is truth for that money invariant). SE-PADV-02 proves the advertise
 * add-to-cart AJAX is CSRF-protected (a tampered nonce is rejected).
 */
const CREDS_SKIP = 'Stripe Express keys missing — set TEST_*_STRIPE_EXPRESS in tests/pw/.env';

/**
 * LOCAL (not on the page object / helpers): drive the vendor PADV add-to-cart from within the browser
 * session so the WC session cart carries the ad base product, exactly as the real "Advertise" UI does.
 * The localized `dokan_purchase_advertisement` object (advertise_product_nonce + checkout_url) is
 * enqueued ONLY on the LEGACY, server-rendered vendor products page (`/dashboard/products/`) — the React
 * `/dashboard/new/` SPA route never enqueues it. So navigate to the legacy page, read the object, and POST
 * the SAME AJAX the page fires (`wp.ajax.post('dokan_add_advertise_product_to_cart', { product_id,
 * advertise_product_nonce })`), which adds get_advertisement_base_product() to the cart at the ad cost.
 * Asserts free_purchase=false (a PAID ad adds the base product to the cart) and returns the localized
 * `checkout_url` the page navigates to for a paid purchase.
 */
async function addAdvertisementToVendorCart(stripe: StripeExpressPage, productId: string): Promise<string> {
    const page = stripe.page;
    await page.goto(toPath('dashboard/products'));
    await page.waitForLoadState('domcontentloaded');
    await page
        .waitForFunction(
            () => {
                const cfg = (window as unknown as { dokan_purchase_advertisement?: { advertise_product_nonce?: string; checkout_url?: string } }).dokan_purchase_advertisement;
                return Boolean(cfg && cfg.advertise_product_nonce && cfg.checkout_url);
            },
            undefined,
            { timeout: 30_000 },
        )
        .catch(() => undefined);

    const result = await page.evaluate(async (pid: string) => {
        const w = window as unknown as {
            dokan_purchase_advertisement?: { advertise_product_nonce?: string; checkout_url?: string };
            wp?: { ajax?: { post: (action: string, data: Record<string, unknown>) => PromiseLike<unknown> } };
        };
        const cfg = w.dokan_purchase_advertisement;
        if (!cfg || !cfg.advertise_product_nonce || !cfg.checkout_url) {
            return { error: 'dokan_purchase_advertisement localized data not found on the legacy vendor products page' };
        }
        if (!w.wp || !w.wp.ajax) {
            return { error: 'wp.ajax helper not available on the vendor products page' };
        }
        try {
            // wp.ajax.post sets action=dokan_add_advertise_product_to_cart, resolves with the unwrapped data
            // payload on success, and rejects on success=false — exactly like purchase_advertisement.js.
            const data = (await w.wp.ajax.post('dokan_add_advertise_product_to_cart', {
                product_id: pid,
                advertise_product_nonce: cfg.advertise_product_nonce,
            })) as { free_purchase?: boolean; message?: string };
            return { data, checkoutUrl: cfg.checkout_url };
        } catch (e) {
            const err = e as { message?: string; data?: { message?: string } };
            return { error: `PADV add-to-cart AJAX failed: ${err?.data?.message ?? err?.message ?? JSON.stringify(e)}` };
        }
    }, productId);

    if ((result as { error?: string }).error) {
        throw new Error((result as { error: string }).error);
    }
    const r = result as { data: { free_purchase?: boolean; message?: string }; checkoutUrl: string };
    expect(r.data?.free_purchase, 'paid ad: AJAX should return free_purchase=false (it adds the base product to the cart)').toBe(false);
    return r.checkoutUrl;
}

test.describe.serial('Stripe Express — Product Advertisement (SE-PADV) @pro', () => {
    test.describe.configure({ timeout: 180_000 });

    let baseProductId = 0;
    let vendorProductId: string | undefined;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeExpressConfigured();
        // Admin enables the advertising module + per-product ad cost ($15) via the test mu-plugin.
        ({ base_product_id: baseProductId } = await enableProductAdvertisement(15));
        // The vendor needs a billing address to check out, a (real) connected account so the money
        // invariant is meaningful (a CONNECTED vendor still receives no transfer for the ad fee), and a
        // PUBLISHED product to advertise.
        await ensureBillingAddress(VENDOR_ID);
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const api = new ApiUtils(await request.newContext());
        [, vendorProductId] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Express Ad Product' }, payloads.vendorAuth);
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        // Restore globals so same-worker/DB suites are not poisoned.
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        await dbUtils.clearCustomerCart(VENDOR_ID);
        await dbUtils.updateOptionValue('dokan_product_advertisement', { per_product_enabled: 'off' });
        if (vendorProductId) {
            const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
            try {
                await ctx.delete(`${SERVER_URL}/wc/v3/products/${vendorProductId}?force=true`);
            } finally {
                await ctx.dispose();
            }
        }
    });

    // ---- SE-PADV-01: vendor buys an ad slot via Express → advertised + zero vendor transfer ----
    test('SE-PADV-01: vendor buys a product-advertisement slot via Express → order received + product advertised, zero vendor transfer', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);

        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(VENDOR_ID);
            // Add the ad base product to the session cart via the page's own AJAX, then go to the localized
            // checkout_url (what purchase_advertisement.js navigates to on a paid purchase) and pay via Express.
            const checkoutUrl = await addAdvertisementToVendorCart(stripe, vendorProductId as string);
            await page.goto(checkoutUrl);
            await page.waitForLoadState('domcontentloaded');
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the ad-purchase order id').toBeTruthy();

        // Order paid via Express → carries a Stripe PaymentIntent (only Express stamps this meta key).
        const intentId = await getStripeIntentIdForOrder(orderId as string);
        expect(intentId, 'ad order carries a Stripe PaymentIntent (pi_…)').toMatch(/^pi_/);
        expect(await getOrderStatus(orderId as string), 'ad order should be processing/completed').toMatch(/processing|completed/);

        // Advertisement recorded: the product is now advertised (server-side Helper::is_product_advertised).
        await expect
            .poll(async () => isProductAdvertised(vendorProductId as string), {
                message: 'the product should be advertised after the ad-purchase order settles',
                timeout: 40_000,
            })
            .toBe(true);

        // MONEY invariant: the ad fee is platform revenue — the ad order has only the admin-owned base
        // product (no vendor sub-order). Express disburses ON_ORDER_COMPLETED, so complete the order (the
        // moment a real vendor transfer WOULD fire) and prove there is still ZERO vendor transfer off this charge.
        if (stripeApi.hasSecretKey()) {
            await setOrderStatus(orderId as string, 'completed');
            const chargeId = await getStripeChargeIdForOrder(orderId as string);
            expect((await stripeApi.transfersForCharge(chargeId)).length, 'ad fee stays on the platform — no vendor transfer').toBe(0);
        }

        log.success(`SE-PADV-01: vendor advertised product ${vendorProductId} via Express order ${orderId} (intent ${intentId}); ad fee retained by platform (base ${baseProductId})`);
    });

    // ---- SE-PADV-02: the advertise add-to-cart AJAX must reject a tampered nonce ----
    test('SE-PADV-02: the advertise add-to-cart AJAX rejects a tampered nonce (CSRF guard)', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);

        let outcome: { accepted: boolean; error?: string } = { accepted: false };
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        try {
            // The legacy vendor products page is where wp.ajax + the localized advertise nonce live.
            await page.goto(toPath('dashboard/products'));
            await page.waitForLoadState('domcontentloaded');
            await page
                .waitForFunction(() => Boolean((window as unknown as { wp?: { ajax?: unknown } }).wp?.ajax), undefined, { timeout: 30_000 })
                .catch(() => undefined);

            // Fire the add-to-cart action with a TAMPERED nonce — a CSRF-protected handler must reject it.
            outcome = await page.evaluate(async (productId: string) => {
                const w = window as unknown as { wp?: { ajax?: { post: (a: string, d: Record<string, unknown>) => PromiseLike<unknown> } } };
                if (!w.wp?.ajax) {
                    return { accepted: false, error: 'wp.ajax unavailable' };
                }
                try {
                    await w.wp.ajax.post('dokan_add_advertise_product_to_cart', {
                        product_id: productId,
                        advertise_product_nonce: 'tampered-nonce-deadbeef',
                    });
                    return { accepted: true }; // accepted WITH a bad nonce = a CSRF hole
                } catch (e) {
                    const err = e as { message?: string; data?: { message?: string } };
                    return { accepted: false, error: err?.data?.message ?? err?.message ?? 'rejected' };
                }
            }, vendorProductId as string);
        } finally {
            await page.close();
            await ctx.close();
        }

        expect(outcome.accepted, 'a tampered advertise_product_nonce must be REJECTED (the advertise add-to-cart AJAX is CSRF-protected)').toBe(false);
        log.success(`SE-PADV-02: advertise add-to-cart rejected a tampered nonce (CSRF guard enforced) — ${outcome.error ?? ''}`);
    });
});
