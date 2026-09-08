import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { payloads, MOBILE_TEST_PHONE } from '@utils/payloads';
import { stripeConnectApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECT_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { VENDOR_ID, hasCredentials, ensureStripeConnectConfigured, restoreStripeExpress, seedStripeConnectVendor, removeStripeConnectVendor, getOrderStatus, getOrderNotes, getConnectIntentIdForOrder } from './helpers';

/**
 * Stripe Connect — 3D Secure (SCPE-04, SCPE-05).
 *
 * The browser does not reliably redirect back after a challenge, so these assert the ORDER's state
 * through the API rather than the landing URL. SCPE-04's real subject is the completion lock: the
 * redirect finaliser and the webhook must not each post a completion note.
 */
test.describe.serial('Stripe Connect — 3D Secure @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    const guestBilling = {
        email: 'guest.3ds.stripeconnect@example.com',
        firstName: 'Guest',
        lastName: 'Buyer',
        address: '123 Test Street',
        city: 'New York',
        state: 'NY',
        postcode: '10001',
        country: 'US',
        phone: MOBILE_TEST_PHONE,
    };

    let productId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        await seedStripeConnectVendor(VENDOR_ID, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1);
        const api = new ApiUtils(await request.newContext());
        const [, id] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect 3DS Product' }, payloads.vendorAuth);
        productId = id;
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await removeStripeConnectVendor(VENDOR_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
        } finally {
            await ctx.dispose();
        }
        await restoreStripeExpress();
    });

    // ---- SCPE-04 — challenge completed ----

    test('SCPE-04: completing the 3DS challenge settles the order with exactly one completion note', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            const baseline = await stripe.connectOrderBaseline();
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails(guestBilling);
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.threeDS);

            const orderId = await test.step('place the order and complete the challenge Stripe presents', async () => {
                // The challenge frame appears after the press, so the press is not awaited to
                // completion — placeBlockOrderExpectReceived resolves via the settle poll once the
                // challenge is done, which is why the challenge is completed concurrently.
                const placing = stripe.placeBlockOrderExpectReceived(baseline);
                await stripe.completeThreeDsChallenge();
                return placing;
            });

            await test.step('the order settled', async () => {
                expect(await getOrderStatus(orderId), 'an authenticated 3DS payment should settle the order').toMatch(/processing|completed/);
                expect(await getConnectIntentIdForOrder(orderId), 'the order must carry a Stripe PaymentIntent id').toMatch(/^pi_/);
            });

            await test.step('exactly one completion note, not two', async () => {
                /*
                 * The subject of this case. Both the redirect finaliser and the webhook can settle the
                 * same order, and `Helper::lock_order_completion` exists to stop them each posting a
                 * completion note. Two notes would mean the lock did not hold, which is also the shape
                 * of a double-disbursement.
                 */
                const notes = await getOrderNotes(orderId);
                const completions = notes.filter(n => /payment is completed via/i.test(n));
                expect(completions.length, `expected exactly one completion note, got ${completions.length}: ${JSON.stringify(completions)}`).toBe(1);
            });
            log.success(`SCPE-04 order ${orderId} settled through a 3DS challenge`);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SCPE-05 — challenge abandoned ----

    test('SCPE-05: abandoning the 3DS challenge leaves the order unpaid and the cart usable', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            const paidBaseline = await stripe.latestPaidConnectOrderId();
            // Newest Connect order at ANY status, so the attempt's own order can be identified
            // afterwards. WooCommerce writes the row before the payment is attempted, so an
            // abandoned challenge legitimately leaves an unpaid row behind.
            const orderBaseline = await stripe.connectOrderBaseline();
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails({ ...guestBilling, email: 'guest.3ds.failed@example.com' });
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.threeDS);

            await test.step('place the order, then FAIL the challenge', async () => {
                await stripe.placeBlockOrderExpectError().catch(() => undefined);
                await stripe.failThreeDsChallenge().catch(() => undefined);
                await page.waitForTimeout(5_000);
            });

            await test.step('no NEW paid order exists', async () => {
                // The money invariant. An abandoned challenge that still produced a paid order would
                // mean the site settled a payment the shopper never authenticated.
                expect(await stripe.latestPaidConnectOrderId(), 'an abandoned 3DS challenge must not leave a PAID order behind').toBe(paidBaseline);
            });

            await test.step('no NEW transfer was made to the vendor for this attempt', async () => {
                /*
                 * Scoped to THIS attempt's charge, never to the vendor account as a whole.
                 *
                 * The previous version pinned every existing transfer to vendor1 by id and treated
                 * anything new as belonging to this attempt. All twelve CI shards share one Stripe
                 * platform and the same STRIPE_VENDOR1_ACCT, so a sibling shard paying that vendor
                 * mid-test read as "the abandoned challenge paid the vendor". It failed in-shard on
                 * runs 33367338869 and 33482179826 and passed alone both times, which is the
                 * shard-pollution signature rather than a defect. Same class as the C5 fix: never
                 * assert over an account-global Stripe list on a shared test account.
                 *
                 * A transfer for this attempt could only carry this attempt's charge as its
                 * source_transaction, and no other shard can produce that. Each early return below
                 * is a proof rather than a dodge — no order means no charge, and no charge means
                 * Stripe had nothing to build a transfer from — so each one says which it was.
                 */
                const attemptOrderId = await stripe.connectOrderBaseline();
                if (!attemptOrderId || attemptOrderId === orderBaseline) {
                    log.info('SCPE-05: the abandoned attempt created no Connect order, so there was nothing to transfer');
                    return;
                }
                const intentId = await getConnectIntentIdForOrder(attemptOrderId).catch(() => '');
                if (!intentId) {
                    log.info(`SCPE-05: order ${attemptOrderId} carries no PaymentIntent, so no charge and no transfer exist`);
                    return;
                }
                const chargeId = await stripeConnectApi.getLatestChargeId(intentId).catch(() => '');
                if (!chargeId) {
                    log.info(`SCPE-05: intent ${intentId} never produced a charge, so the shopper was not billed and no transfer is possible`);
                    return;
                }
                const transfers = await stripeConnectApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1);
                expect(transfers.map(t => String(t.id)), `an abandoned 3DS challenge must not pay the vendor — transfers against charge ${chargeId}: ${JSON.stringify(transfers.map(t => String(t.id)))}`).toHaveLength(0);
            });

            await test.step('the cart still holds the item so the shopper can retry', async () => {
                await page.goto(stripe.checkout.blockUrl.replace('checkout', 'cart'));
                await expect(page.locator('body'), 'an abandoned challenge must leave the cart intact').not.toContainText(/your cart is currently empty/i);
            });
            log.success('SCPE-05 abandoned challenge left no paid order and no transfer');
        } finally {
            await page.close();
            await ctx.close();
        }
    });
});
