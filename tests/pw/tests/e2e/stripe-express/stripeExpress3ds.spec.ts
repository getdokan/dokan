import { test, expect, request } from '@utils/test';
import { Page } from '@playwright/test';
import { SERVER_URL } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { log } from '@utils/logger';
import { StripeExpressPage, STRIPE_CARDS, STRIPE_EXPRESS_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    hasCredentials,
    ensureStripeExpressConfigured,
    ensureCustomerAddress,
    ensureClassicCheckoutPage,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
    getLatestStripeOrderId,
    assertStripeOrderSettledSince,
} from './helpers';

/**
 * Stripe Express — 3-D Secure / SCA (SE-3DS-01..05).
 *
 * The Express gateway always confirms with `confirmPayment`, so `4000…3155` forces an
 * in-page SCA challenge that the suite completes via `complete3DSChallenge()`. The browser
 * redirect to order-received after the challenge is unreliable in automation, so the paid
 * outcome is asserted from the ORDER STATUS server-side: capture `getLatestStripeOrderId()`
 * as a baseline BEFORE placing, then `assertStripeOrderSettledSince(baseline)` (positive) or
 * an inline "no NEW paid order" check (negative).
 *
 * Serial because it seeds the shared connected vendor + customer address. Charge/checkout
 * tests self-skip without keys. Long timeout: cold first attempt = slow confirm + ACS
 * challenge + up-to-120s settle poll.
 */
test.describe.serial('Stripe Express — 3DS / SCA @pro', () => {
    test.describe.configure({ timeout: 240_000 });

    let productId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeExpressConfigured();
        await ensureCustomerAddress();
        await ensureClassicCheckoutPage();
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const api = new ApiUtils(await request.newContext());
        [, productId] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Express 3DS Product' }, payloads.vendorAuth);
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            if (productId) {
                await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
            }
        } finally {
            await ctx.dispose();
        }
    });

    // ---- SE-3DS-01: block checkout, SCA challenge completes → order settles ----

    test('SE-3DS-01: block checkout 3DS card completes the SCA challenge and settles the order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive the SCA challenge');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            const baseline = await getLatestStripeOrderId(); // pin: only a NEWER order (this test's) counts
            await stripe.fillCardDetails(STRIPE_CARDS.threeDS);
            await page.locator(stripe.blockSelectors.placeOrder).click();
            await stripe.complete3DSChallenge();
            await assertStripeOrderSettledSince(baseline);
            log.success('SE-3DS-01: block 3DS order settled after completing the SCA challenge');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-3DS-02: classic checkout, ACS challenge completes → order settles ----

    test('SE-3DS-02: classic checkout 3DS card completes the SCA challenge and settles the order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive the SCA challenge');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.selectClassicGateway();
            const baseline = await getLatestStripeOrderId(); // pin: only a NEWER order (this test's) counts
            await stripe.fillCardDetails(STRIPE_CARDS.threeDS);

            // The Express page object has no placeClassicOrderExpect3DS — inline a robust place:
            // WC's update_checkout overlay can swallow the first click, so re-click until the ACS
            // challenge frame actually loads, then hand off to complete3DSChallenge().
            let challengeAppeared = false;
            for (let attempt = 0; attempt < 3 && !challengeAppeared; attempt++) {
                await stripe.waitForCheckoutSettled();
                await page.locator(stripe.checkout.placeOrderClassic).click().catch(() => undefined);
                challengeAppeared = await waitForChallenge(page, 20_000);
            }
            expect(challengeAppeared, 'the ACS challenge frame should load on classic checkout').toBe(true);
            await stripe.complete3DSChallenge();
            await assertStripeOrderSettledSince(baseline);
            log.success('SE-3DS-02: classic 3DS order settled after completing the SCA challenge');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-3DS-03: decline-after-auth → error, no paid order ----

    test('SE-3DS-03: a 3DS card that declines after authentication surfaces an error and creates no paid order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive the SCA challenge');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            const baseline = await getLatestStripeOrderId();
            await stripe.fillCardDetails(STRIPE_CARDS.threeDSDeclined);
            await page.locator(stripe.blockSelectors.placeOrder).click();
            // The card requires SCA first → complete the challenge if it appears; the charge then declines.
            await stripe.complete3DSChallenge().catch(() => undefined);

            await expect(
                page.locator(stripe.blockSelectors.error).first(),
                'a 3DS decline-after-auth must surface a block error notice',
            ).toBeVisible({ timeout: 60_000 });
            await expect(page, 'a declined 3DS payment must not reach order-received').not.toHaveURL(/order-received/);
            await assertNoNewPaidExpressOrder(baseline);
            log.success('SE-3DS-03: 3DS decline-after-auth surfaced an error and created no paid order');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-3DS-04: abandon the SCA challenge → order stays unpaid/pending ----

    test('SE-3DS-04: abandoning the SCA challenge leaves no paid order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive the SCA challenge');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            const baseline = await getLatestStripeOrderId();
            await stripe.fillCardDetails(STRIPE_CARDS.threeDS);
            await page.locator(stripe.blockSelectors.placeOrder).click();

            const appeared = await waitForChallenge(page, 45_000);
            expect(appeared, 'the SCA challenge should appear before it is abandoned').toBe(true);
            // Abandon: close the challenge without completing it by reloading the checkout page.
            await page.goto(stripe.checkout.blockUrl).catch(() => undefined);
            await page.waitForLoadState('domcontentloaded').catch(() => undefined);

            await assertNoNewPaidExpressOrder(baseline);
            log.success('SE-3DS-04: an abandoned SCA challenge produced no paid order');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SE-3DS-05: abandoned requires_action order — document the lingering state (Connect BUG-24) ----

    test('SE-3DS-05: an abandoned requires_action order lingers unpaid (stuck state documented)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive the SCA challenge');
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            const baseline = await getLatestStripeOrderId();
            await stripe.fillCardDetails(STRIPE_CARDS.threeDS);
            await page.locator(stripe.blockSelectors.placeOrder).click();

            const appeared = await waitForChallenge(page, 45_000);
            expect(appeared, 'the SCA challenge should appear').toBe(true);
            // Abandon without completing → the order is left in a requires_action / pending state.
            await page.goto(SERVER_URL).catch(() => undefined);
            await page.waitForTimeout(3_000);

            // Document the stuck state (Connect BUG-24): the abandoned requires_action order must NOT be
            // paid; it lingers pending/failed/on-hold (or no order materialised) until it is cancelled.
            const order = await latestExpressOrderSince(baseline);
            if (order) {
                log.info(`SE-3DS-05: abandoned requires_action order ${order.id} left in "${order.status}" (documented stuck state)`);
                expect(order.status, 'an abandoned requires_action order must not be paid').not.toMatch(/processing|completed/);
            } else {
                log.info('SE-3DS-05: no order materialised for the abandoned requires_action flow (clean)');
            }
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});

/* ------------------------------------------------------------------ */
/* Inline helpers — for what the page object / helpers do not expose.  */
/* ------------------------------------------------------------------ */

const CHALLENGE_BUTTON_NAMES = [/complete authentication/i, /^complete$/i, /authorize test payment/i];

/** True when a Stripe ACS test-challenge "Complete" button is present in any (nested/cross-origin) frame. */
async function isChallengePresent(page: Page): Promise<boolean> {
    for (const frame of page.frames()) {
        for (const name of CHALLENGE_BUTTON_NAMES) {
            if ((await frame.getByRole('button', { name }).first().count().catch(() => 0)) > 0) {
                return true;
            }
        }
    }
    return false;
}

/** Poll for the SCA challenge to appear WITHOUT clicking it (the page object's complete3DSChallenge clicks). */
async function waitForChallenge(page: Page, timeoutMs = 30_000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (await isChallengePresent(page)) {
            return true;
        }
        await page.waitForTimeout(500);
    }
    return false;
}

interface ExpressOrder {
    id: number;
    status: string;
}

/** Newest dokan_stripe_express order (any status) created after `baseline`, or undefined. */
async function latestExpressOrderSince(baseline: number): Promise<ExpressOrder | undefined> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=20&orderby=date&order=desc&_fields=id,status,payment_method`);
        const orders = (await res.json().catch(() => [])) as Array<{ id: number; status: string; payment_method: string }>;
        const o = Array.isArray(orders) ? orders.find(x => x.payment_method === 'dokan_stripe_express' && Number(x.id) > baseline) : undefined;
        return o ? { id: Number(o.id), status: o.status } : undefined;
    } finally {
        await ctx.dispose();
    }
}

/** Assert no NEW Stripe Express order (id > baseline) reached a paid status (negative 3DS outcomes). */
async function assertNoNewPaidExpressOrder(baseline: number): Promise<void> {
    const o = await latestExpressOrderSince(baseline);
    if (o) {
        expect(o.status, `order ${o.id} from a declined/abandoned 3DS flow must NOT be paid`).not.toMatch(/processing|completed/);
    }
}
