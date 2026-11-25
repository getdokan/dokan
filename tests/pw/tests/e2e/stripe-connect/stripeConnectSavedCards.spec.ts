import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECT_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { VENDOR_ID, CUSTOMER_ID, customerAuth, hasCredentials, ensureStripeConnectConfigured, restoreStripeExpress, ensureClassicCheckoutPage, ensureCustomerAddress, seedStripeConnectVendor, removeStripeConnectVendor, getOrderStatus, getConnectIntentIdForOrder } from './helpers';

/**
 * Stripe Connect — saving a card and reusing it (SCTOK-01).
 *
 * The case exists to prove `setup_future_usage=off_session` was really applied. Without it the
 * SECOND payment is the one that fails, with "PaymentMethod may not be used again" — so a spec that
 * only checked the card appears under My Account would pass while the feature is broken.
 */
test.describe.serial('Stripe Connect — saved cards @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    let firstProductId: string;
    let secondProductId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured({ saved_cards: 'yes' });
        await ensureClassicCheckoutPage();
        await ensureCustomerAddress();
        await seedStripeConnectVendor(VENDOR_ID, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1);
        const api = new ApiUtils(await request.newContext());
        // Two different products at two different amounts, as the case specifies: reusing the same
        // cart would let an idempotent-reuse path pass without the token ever being exercised.
        const [, id1] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Saved Card One' }, payloads.vendorAuth);
        const [, id2] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Saved Card Two' }, payloads.vendorAuth);
        firstProductId = id1;
        secondProductId = id2;
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await removeStripeConnectVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            for (const id of [firstProductId, secondProductId]) {
                if (id) {
                    await ctx.delete(`${SERVER_URL}/wc/v3/products/${id}?force=true`);
                }
            }
        } finally {
            await ctx.dispose();
        }
        await restoreStripeExpress();
    });

    test('SCTOK-01: a card saved at checkout can pay a second order without re-entering it', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);

            // Start from a known-empty list so "a card appeared" is a real observation rather than a
            // side effect of whatever earlier runs left behind. Without this the case passes on a
            // customer with no cards and fails on the re-run, because saving the SAME card again
            // does not add a second row.
            await stripe.deleteAllSavedCards();
            const savedBefore = await stripe.getSavedCardRowCount();
            expect(savedBefore, 'the customer should start this case with no saved cards').toBe(0);

            const firstOrderId = await test.step('pay the first order and tick save-card', async () => {
                await stripe.addProductToCart(firstProductId);
                await stripe.gotoClassicCheckout();
                await stripe.fillBillingClassic();
                await stripe.selectClassicGateway();
                await stripe.fillCardDetails(STRIPE_CARDS.success);
                await stripe.saveCardAtCheckout();
                return stripe.placeClassicOrderExpectReceived();
            });

            await test.step('the first order settled', async () => {
                expect(await getOrderStatus(firstOrderId), 'the first card payment should settle').toMatch(/processing|completed/);
            });

            await test.step('the card is now listed under My Account → Payment methods', async () => {
                await expect.poll(async () => stripe.getSavedCardRowCount(), { message: 'saving a card should add a row to My Account → Payment methods', timeout: 30_000 }).toBe(savedBefore + 1);
            });

            const secondOrderId = await test.step('pay a SECOND, different order with the saved card only', async () => {
                await dbUtils.clearCustomerCart(CUSTOMER_ID);
                await stripe.addProductToCart(secondProductId);
                await stripe.gotoClassicCheckout();
                await stripe.fillBillingClassic();
                // Deliberately NO fillCardDetails: if the token is not usable off-session this step
                // is where it breaks, which is the whole point of the case.
                await stripe.selectSavedCardClassic();
                return stripe.placeClassicOrderExpectReceived();
            });

            await test.step('the second order settled on the saved card', async () => {
                expect(secondOrderId, 'the second order must be a genuinely different order').not.toBe(firstOrderId);
                expect(await getOrderStatus(secondOrderId), 'the saved card should be reusable off-session').toMatch(/processing|completed/);
                expect(await getConnectIntentIdForOrder(secondOrderId), 'the second order must carry its own PaymentIntent').toMatch(/^pi_/);
            });
            log.success(`SCTOK-01 saved card paid order ${firstOrderId} then reused on ${secondOrderId}`);
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});
