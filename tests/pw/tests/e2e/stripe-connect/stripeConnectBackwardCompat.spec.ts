import { test, expect, request, Browser } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import {
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    SERVER_URL,
    hasCredentials,
    ensureCustomerAddress,
    getStripeChargeIdForOrder,
    setOrderMeta,
    dokanApiRefund,
} from './helpers';

/**
 * Suite L — backward compatibility with orders created by the LEGACY Stripe gateway.
 *
 * The revamped refund flow keys on the new `dokan_stripe_intent_id` order meta. Orders created by
 * the OLD gateway carry only a legacy charge id (`_dokan_stripe_charge_id`) and have NO intent meta,
 * so the new refund processor early-returns and the customer is never refunded (R-BCa / L1). This
 * MODELS a legacy order (strip the intent meta, set the legacy charge meta), refunds it, and asserts
 * the CORRECT backward-compat behaviour — the customer IS refunded. CONFIRMED broken on this build,
 * so it is wrapped in test.fail(): it pins the gap (PASS while legacy orders are un-refundable, FLIPS
 * to a real failure once legacy orders refund). Needs keys but NOT a real connected account (it
 * asserts the customer-charge refund, not a vendor transfer reversal).
 */
test.describe.serial('Stripe Connect — Suite L (backward compatibility)', () => {
    test.describe.configure({ timeout: 150_000 });

    let productId: string;

    async function placeNormalOrder(browser: Browser): Promise<string | undefined> {
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            return page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
    }

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

    test('L1: a legacy Stripe order (legacy charge meta, no intent meta) must still refund the customer', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.fail(true, 'R-BCa/L1: the new refund flow keys on dokan_stripe_intent_id; a legacy order (only _dokan_stripe_charge_id) is silently NOT refunded (Refund.php early-return). Expected-fail until legacy orders refund. See bugs-found.md.');

        const orderId = await placeNormalOrder(browser);
        expect(orderId, 'captured the order id').toBeTruthy();

        // Capture the real charge BEFORE stripping the intent meta (the lookup reads that meta).
        const chargeId = await getStripeChargeIdForOrder(orderId as string);

        // Model a LEGACY order: clear the new intent meta, plant the old gateway's charge-id meta.
        await setOrderMeta(orderId as string, [
            { key: 'dokan_stripe_intent_id', value: '' },
            { key: '_stripe_intent_id', value: '' },
            { key: '_dokan_stripe_charge_id', value: chargeId },
        ]);

        // Refund through the Dokan flow.
        await dokanApiRefund(orderId as string);

        // CORRECT backward-compat behaviour: the customer is refunded even for a legacy order.
        await expect
            .poll(async () => Number((await stripeApi.getCharge(chargeId)).amount_refunded ?? 0), {
                message: 'a legacy order should still refund the customer (backward-compat)',
                timeout: 20_000,
            })
            .toBeGreaterThan(0);
        log.success('L1: legacy order refunded the customer (backward-compat handled)');
    });
});
