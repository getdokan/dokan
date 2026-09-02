import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeConnectApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS } from './stripeConnectPage';
import {
    VENDOR_ID,
    hasCredentials,
    ensureStripeConnectConfigured,
    ensureClassicCheckoutPage,
    restoreStripeExpress,
    removeStripeConnectVendor,
    setConnectGatewaySettings,
    getConnectIntentIdForOrder,
    getOrderStatus,
} from './helpers';

/**
 * Stripe Connect — non-connected sellers (SC-45).
 *
 * A vendor who has never connected Stripe is a gating decision about money, and the admin controls
 * it with one setting. Both sides of that setting are asserted here, because either one failing is
 * a real marketplace problem: with it off a customer must not be able to buy from a vendor who
 * cannot be paid, and with it on the sale must go through with the platform keeping the money.
 *
 * The gate lives in `Validation::check_vendor_configure_stripe`, hooked on
 * `woocommerce_after_checkout_validation`, and keys on an empty `_stripe_connect_access_key` — NOT
 * on `dokan_connected_vendor_id`. A vendor seeded with only the account id would still be refused
 * here, which is why the helper clears both metas.
 *
 * Classic checkout only, deliberately. That hook is the classic checkout's validation pass; whether
 * the block surface enforces the same rule is a separate question and is NOT covered by these two
 * cases rather than being assumed.
 */
test.describe.serial('Stripe Connect — non-connected sellers @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    let productId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        // Both cases drive the classic checkout, and the shortcode page does not exist in a fresh
        // environment — every shard provisions its own. Without this the run dies on a 404 rather
        // than on anything to do with connected sellers, which is exactly what happened on CI run
        // 33590556960 while it passed locally on a site where an earlier spec had already made it.
        await ensureClassicCheckoutPage();
        // The subject of the whole file: a vendor with neither connection meta.
        await removeStripeConnectVendor(VENDOR_ID);
        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Non-Connected Seller Product' }, payloads.vendorAuth);
        productId = id;
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        // Back to the product default. This setting is global, so leaving it on would silently
        // disable the gate for every other spec sharing this database.
        await setConnectGatewaySettings({ allow_non_connected_sellers: 'no' });
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
        await restoreStripeExpress();
    });

    test('SC-45a: with non-connected sellers disallowed, their product cannot be bought', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        await setConnectGatewaySettings({ allow_non_connected_sellers: 'no' });

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            const paidBaseline = await stripe.latestPaidConnectOrderId();

            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.selectClassicGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);

            await test.step('the checkout refuses the order and says why', async () => {
                // WooCommerce's own validation notice, not the Stripe JS error container the
                // declined-card helper watches — this rejection comes from
                // `woocommerce_after_checkout_validation`, so it renders as a WC error notice.
                await stripe.waitForCheckoutSettled();
                await page.locator(stripe.checkout.placeOrderClassic).click();
                const notice = page.locator('.woocommerce-error, .woocommerce-NoticeGroup-checkout .woocommerce-error li').first();
                await expect(notice, 'buying from a vendor who cannot be paid must be refused with a visible reason').toBeVisible({ timeout: 60_000 });
                await expect(notice, 'the refusal must name the Stripe requirement so the shopper knows what is wrong').toContainText(/enabled Stripe as a payment gateway/i);
            });

            await test.step('no order was paid', async () => {
                // The money invariant. A refusal that still took the payment would be worse than
                // no gate at all.
                await expect(page, 'a refused checkout must not reach order-received').not.toHaveURL(/order-received/);
                expect(await stripe.latestPaidConnectOrderId(), 'a refused checkout must not leave a PAID order behind').toBe(paidBaseline);
            });
            log.success('SC-45a non-connected vendor was refused at checkout and no order was paid');
        } finally {
            await ctx.close();
        }
    });

    test('SC-45b: with non-connected sellers allowed, the sale completes and the platform keeps the money', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        await setConnectGatewaySettings({ allow_non_connected_sellers: 'yes' });

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);

            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            await stripe.fillBillingClassic();
            await stripe.selectClassicGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            const orderId = await stripe.placeClassicOrderExpectReceived();

            await test.step('the order settled', async () => {
                expect(await getOrderStatus(orderId), 'allowing non-connected sellers must let the payment settle normally').toMatch(/processing|completed/);
            });

            await test.step('no vendor transfer was made — the platform holds the funds', async () => {
                /*
                 * The setting's own description is the specification: "The payment will send to
                 * admin Stripe account." A vendor with no connected account has no transfer
                 * destination, so a transfer against this charge would mean the money went
                 * somewhere it should not have.
                 *
                 * Scoped to THIS order's charge rather than to any account listing, because all CI
                 * shards share one Stripe platform and a sibling shard's transfers would otherwise
                 * be counted here.
                 */
                const intentId = await getConnectIntentIdForOrder(orderId);
                expect(intentId, 'a settled Connect order must carry its PaymentIntent').toMatch(/^pi_/);
                const chargeId = await stripeConnectApi.getLatestChargeId(intentId);
                expect(chargeId, 'a settled PaymentIntent must carry a charge').toMatch(/^ch_|^py_/);

                const transfers = await stripeConnectApi.transfersForCharge(chargeId);
                expect(
                    transfers.map(t => String(t.id)),
                    `a non-connected vendor has no destination, so this charge must not have been transferred — found: ${JSON.stringify(transfers.map(t => String(t.id)))}`,
                ).toHaveLength(0);
            });
            log.success(`SC-45b non-connected vendor order ${orderId} settled with no vendor transfer`);
        } finally {
            await ctx.close();
        }
    });
});
