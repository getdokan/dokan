import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { customerAuth, VENDOR_ID, CUSTOMER_ID, SERVER_URL, hasCredentials, ensureCustomerAddress } from './helpers';

/**
 * Suite H4 — 3DS card that DECLINES after authentication.
 *
 * The audit found 3DS coverage was success-only (H1/H2). This exercises the negative SCA path:
 * a card that requires authentication and is then declined (insufficient_funds) after the
 * challenge completes. The customer must see an error and the order must NOT reach order-received
 * (no paid order). Block checkout (places the order, then confirms with the SCA challenge).
 */
test.describe.serial('Stripe Connect — Suite H4 (3DS declined-after-auth)', () => {
    test.describe.configure({ timeout: 240_000 }); // SCA challenge + decline is slow on a cold first attempt

    let productId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureCustomerAddress();
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        [, productId] = await api.createProduct(payloads.createProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    });

    test('H4: a 3DS card that declines after authentication surfaces an error and creates no paid order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.threeDSDeclined);
            await page.locator(stripe.blockSelectors.placeOrder).click();
            // The card requires SCA first → complete the challenge if it appears; the charge then declines.
            await stripe.complete3DSChallenge().catch(() => undefined);

            // A decline-after-authentication surfaces a block error and never reaches order-received.
            await expect(
                page.locator(stripe.checkout.error).first(),
                'a 3DS decline-after-auth must surface a block error notice',
            ).toBeVisible({ timeout: 60_000 });
            await expect(page, 'a declined 3DS payment must not reach order-received (no paid order)').not.toHaveURL(/order-received/);
            log.success('H4: 3DS decline-after-auth surfaced an error and created no paid order');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});
