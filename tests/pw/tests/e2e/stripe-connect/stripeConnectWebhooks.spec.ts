import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { payloads, MOBILE_TEST_PHONE } from '@utils/payloads';
import { stripeConnectApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECT_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { VENDOR_ID, VENDOR2_ID, hasCredentials, ensureStripeConnectConfigured, restoreStripeExpress, seedBothConnectedVendors, removeStripeConnectVendor, getOrderNotes, getOrderStatus, getConnectIntentIdForOrder, injectConnectWebhook } from './helpers';

/**
 * Stripe Connect — webhook fan-out and replay safety (SCWH-01, SCWH-02).
 *
 * Stripe retries deliveries and the redirect finaliser can settle an order before the webhook lands,
 * so "handled twice" is the normal case rather than the exotic one. Both cases assert the money
 * cardinality against the Stripe API, because a duplicate transfer is a real payout, not a log line.
 */
test.describe.serial('Stripe Connect — webhooks @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    const guestBilling = {
        email: 'guest.webhook.stripeconnect@example.com',
        firstName: 'Guest',
        lastName: 'Buyer',
        address: '123 Test Street',
        city: 'New York',
        state: 'NY',
        postcode: '10001',
        country: 'US',
        phone: MOBILE_TEST_PHONE,
    };

    let v1ProductId: string;
    let v2ProductId: string;

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        await seedBothConnectedVendors(VENDOR_ID, VENDOR2_ID);
        const api = new ApiUtils(await request.newContext());
        const [, id1] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Webhook V1' }, payloads.vendorAuth);
        const [, id2] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Webhook V2' }, payloads.vendor2Auth);
        v1ProductId = id1;
        v2ProductId = id2;
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await removeStripeConnectVendor(VENDOR_ID);
        await removeStripeConnectVendor(VENDOR2_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            for (const id of [v1ProductId, v2ProductId]) {
                if (id) {
                    await ctx.delete(`${SERVER_URL}/wc/v3/products/${id}?force=true`);
                }
            }
        } finally {
            await ctx.dispose();
        }
        await restoreStripeExpress();
    });

    async function buyAsGuest(browser: any, productIds: string[], email: string): Promise<string> {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            for (const id of productIds) {
                await stripe.addProductToCart(id);
            }
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails({ ...guestBilling, email });
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            return await stripe.placeBlockOrderExpectReceived();
        } finally {
            await page.close();
            await ctx.close();
        }
    }

    async function transferCountsByDestination(chargeId: string): Promise<Map<string, number>> {
        const transfers = await stripeConnectApi.transfersForCharge(chargeId);
        const counts = new Map<string, number>();
        for (const t of transfers) {
            counts.set(String(t.destination), (counts.get(String(t.destination)) ?? 0) + 1);
        }
        return counts;
    }

    // ---- SCWH-01 — one transfer per vendor for a two-vendor order ----

    test('SCWH-01: payment_intent.succeeded creates exactly one transfer per vendor', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'no REAL connected accounts configured — a transfer assertion would be meaningless');

        const parentId = await buyAsGuest(browser, [v1ProductId, v2ProductId], 'guest.webhook.fanout@example.com');
        const intentId = await getConnectIntentIdForOrder(parentId);
        const chargeId = await stripeConnectApi.getLatestChargeId(intentId);

        await test.step('exactly two transfers, one per connected account', async () => {
            const counts = await transferCountsByDestination(chargeId);
            expect(counts.get(STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1), 'vendor1 should be paid exactly once').toBe(1);
            expect(counts.get(STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor2), 'vendor2 should be paid exactly once').toBe(1);
            expect(counts.size, 'the charge should fund exactly two accounts').toBe(2);
        });

        await test.step('no duplicated completion or gateway-fee note', async () => {
            const notes = await getOrderNotes(parentId);
            const completions = notes.filter(n => /payment is completed via/i.test(n));
            const feeNotes = notes.filter(n => /gateway processing fee/i.test(n));
            expect(completions.length, `expected at most one completion note, got: ${JSON.stringify(completions)}`).toBeLessThanOrEqual(1);
            expect(feeNotes.length, `expected at most one gateway-fee note, got: ${JSON.stringify(feeNotes)}`).toBeLessThanOrEqual(1);
        });
        log.success(`SCWH-01 parent ${parentId} funded exactly two vendor transfers`);
    });

    // ---- SCWH-02 — replay after the redirect already settled the order ----

    test('SCWH-02: replaying payment_intent.succeeded after settlement changes nothing', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'no REAL connected accounts configured — a transfer assertion would be meaningless');

        const orderId = await buyAsGuest(browser, [v1ProductId], 'guest.webhook.replay@example.com');
        const intentId = await getConnectIntentIdForOrder(orderId);
        const chargeId = await stripeConnectApi.getLatestChargeId(intentId);

        const before = await test.step('capture the settled state', async () => ({
            transfers: await transferCountsByDestination(chargeId),
            notes: (await getOrderNotes(orderId)).length,
            status: await getOrderStatus(orderId),
        }));
        expect(before.transfers.get(STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1), 'the vendor should be paid once before the replay').toBe(1);

        await test.step('replay payment_intent.succeeded for the same intent', async () => {
            // The REAL intent object. Stripe genuinely re-delivers events, so this is the production
            // case: the redirect finaliser already settled the order and the webhook arrives after.
            const intent = await stripeConnectApi.getPaymentIntent(intentId);
            const result = await injectConnectWebhook({ type: 'payment_intent.succeeded', data_object: intent });
            expect(result.threw, `payment_intent.succeeded handler threw on replay: ${result.error}`).toBe(false);
        });

        await test.step('still one transfer, no new notes, still paid once', async () => {
            const after = await transferCountsByDestination(chargeId);
            expect(after.get(STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1), 'a replayed event must NOT pay the vendor a second time').toBe(1);
            expect((await getOrderNotes(orderId)).length, 'a replayed event must not add order notes').toBe(before.notes);
            expect(await getOrderStatus(orderId), 'the order status must be unchanged by a replay').toBe(before.status);
        });
        log.success(`SCWH-02 replay left order ${orderId} untouched`);
    });
});
