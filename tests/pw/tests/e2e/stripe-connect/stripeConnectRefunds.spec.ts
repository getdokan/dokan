import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { payloads, MOBILE_TEST_PHONE } from '@utils/payloads';
import { stripeConnectApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECT_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { VENDOR_ID, VENDOR2_ID, hasCredentials, ensureStripeConnectConfigured, restoreStripeExpress, seedBothConnectedVendors, removeStripeConnectVendor, getSubOrderIds, getConnectIntentIdForOrder, getOrderNotes, connectApiRefund, injectConnectWebhook } from './helpers';

/**
 * Stripe Connect — refunds and reversal idempotency (SCR-37, SCR-38, SCR-39).
 *
 * The oracle is the Stripe API: a refund that does not reverse the vendor's transfer has taken the
 * money back from the platform while leaving the vendor paid, and only Stripe can say whether the
 * reversal really exists. Order state is read from WC REST, never the database.
 */
test.describe.serial('Stripe Connect — refunds and reversals @pro', () => {
    test.describe.configure({ timeout: 300_000 });

    const guestBilling = {
        email: 'guest.refund.stripeconnect@example.com',
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
        const [, id1] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Refund V1' }, payloads.vendorAuth);
        const [, id2] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Refund V2' }, payloads.vendor2Auth);
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

    /** Buy the given products as a guest on the block checkout, and return the parent order id. */
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

    async function chargeIdFor(orderId: string | number): Promise<string> {
        const intentId = await getConnectIntentIdForOrder(orderId);
        return stripeConnectApi.getLatestChargeId(intentId);
    }

    /** Every transfer off a charge, keyed by destination connected account. */
    async function transfersByDestination(chargeId: string): Promise<Map<string, any[]>> {
        const transfers = await stripeConnectApi.transfersForCharge(chargeId);
        const byDest = new Map<string, any[]>();
        for (const t of transfers) {
            byDest.set(String(t.destination), [...(byDest.get(String(t.destination)) ?? []), t]);
        }
        return byDest;
    }

    async function orderRefundTotal(orderId: string | number): Promise<number> {
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=refunds`);
            const body = (await res.json()) as { refunds?: Array<{ total: string }> };
            return (body.refunds ?? []).reduce((sum, r) => sum + Math.abs(Number(r.total)), 0);
        } finally {
            await ctx.dispose();
        }
    }

    // ---- SCR-37 — full refund reverses the vendor transfer ----

    test('SCR-37: a full refund reverses the vendor transfer', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'no REAL connected accounts configured — a reversal assertion would be meaningless');

        const orderId = await buyAsGuest(browser, [v1ProductId], 'guest.refund.full@example.com');
        const chargeId = await chargeIdFor(orderId);

        const transferId = await test.step('the vendor was paid before the refund', async () => {
            const byDest = await transfersByDestination(chargeId);
            const forVendor = byDest.get(STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1) ?? [];
            expect(forVendor, 'the vendor should have been paid exactly one transfer before any refund').toHaveLength(1);
            const reversals = await stripeConnectApi.listTransferReversals(String(forVendor[0].id));
            expect(reversals, 'nothing should be reversed before the refund is made').toHaveLength(0);
            return String(forVendor[0].id);
        });

        await test.step('refund the order in full', async () => connectApiRefund(orderId));

        await test.step('the order records the refund', async () => {
            await expect.poll(async () => orderRefundTotal(orderId), { message: 'the order should record a refund', timeout: 90_000 }).toBeGreaterThan(0);
        });

        await test.step('Stripe reversed the vendor transfer', async () => {
            await expect
                .poll(async () => (await stripeConnectApi.listTransferReversals(transferId)).length, {
                    message: `transfer ${transferId} should be reversed once the order is refunded — otherwise the platform took the money back while the vendor kept theirs`,
                    timeout: 120_000,
                })
                .toBe(1);
        });
        log.success(`SCR-37 order ${orderId} refunded and transfer ${transferId} reversed`);
    });

    // ---- SCR-38 — partial refund of one sub-order only ----

    test('SCR-38: a partial refund of one sub-order leaves the other vendor untouched', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'no REAL connected accounts configured — a reversal assertion would be meaningless');

        const parentId = await buyAsGuest(browser, [v1ProductId, v2ProductId], 'guest.refund.partial@example.com');
        const chargeId = await chargeIdFor(parentId);

        const { v1Transfer, v2Transfer } = await test.step('both vendors were paid', async () => {
            const byDest = await transfersByDestination(chargeId);
            const a = byDest.get(STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1) ?? [];
            const b = byDest.get(STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor2) ?? [];
            expect(a, 'vendor1 should have exactly one transfer').toHaveLength(1);
            expect(b, 'vendor2 should have exactly one transfer').toHaveLength(1);
            return { v1Transfer: a[0], v2Transfer: b[0] };
        });

        const subOrders = await getSubOrderIds(parentId);
        expect(subOrders, 'a two-vendor cart should produce two sub-orders').toHaveLength(2);

        // Refund a PART of vendor1's sub-order only. The sub-order is resolved by matching the
        // transfer we already proved belongs to vendor1, rather than assuming an ordering.
        const v1SubOrder = await test.step("find vendor1's sub-order", async () => {
            const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
            try {
                for (const id of subOrders) {
                    const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${id}?_fields=meta_data`);
                    const body = (await res.json()) as { meta_data: Array<{ key: string; value: string }> };
                    const vendorId = body.meta_data.find(m => m.key === '_dokan_vendor_id')?.value;
                    if (String(vendorId) === String(VENDOR_ID)) {
                        return id;
                    }
                }
                throw new Error(`no sub-order of ${parentId} belongs to vendor ${VENDOR_ID}`);
            } finally {
                await ctx.dispose();
            }
        });

        await test.step("refund part of vendor1's sub-order", async () => connectApiRefund(v1SubOrder, 10));

        await test.step("vendor1's transfer is partially reversed", async () => {
            await expect
                .poll(async () => (await stripeConnectApi.listTransferReversals(String(v1Transfer.id))).length, {
                    message: `vendor1's transfer ${v1Transfer.id} should carry a reversal after their sub-order is partially refunded`,
                    timeout: 120_000,
                })
                .toBe(1);
            const [reversal] = await stripeConnectApi.listTransferReversals(String(v1Transfer.id));
            expect(Number(reversal.amount), 'a PARTIAL refund must not reverse the whole transfer').toBeLessThan(Number(v1Transfer.amount));
        });

        await test.step('vendor2 is completely untouched', async () => {
            const reversals = await stripeConnectApi.listTransferReversals(String(v2Transfer.id));
            expect(reversals, "refunding vendor1's sub-order must not reverse vendor2's transfer").toHaveLength(0);
        });
        log.success(`SCR-38 partial refund on sub-order ${v1SubOrder} reversed only vendor1`);
    });

    // ---- SCR-39 — replaying the refund event must not reverse twice ----

    test('SCR-39: replaying charge.refunded does not reverse a second time', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'no REAL connected accounts configured — a reversal assertion would be meaningless');

        const orderId = await buyAsGuest(browser, [v1ProductId], 'guest.refund.replay@example.com');
        const chargeId = await chargeIdFor(orderId);
        const byDest = await transfersByDestination(chargeId);
        const forVendor = byDest.get(STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1) ?? [];
        expect(forVendor, 'the vendor should have been paid before the refund').toHaveLength(1);
        const transferId = String(forVendor[0].id);

        await test.step('refund in full and confirm one reversal', async () => {
            await connectApiRefund(orderId);
            await expect
                .poll(async () => (await stripeConnectApi.listTransferReversals(transferId)).length, {
                    message: 'the refund should produce exactly one reversal before the replay',
                    timeout: 120_000,
                })
                .toBe(1);
        });

        const notesBefore = await getOrderNotes(orderId);

        await test.step('replay charge.refunded', async () => {
            // The real, now-refunded charge object. Re-delivering an event Stripe has already sent is
            // ordinary behaviour (Stripe retries), so this is the production case, not a contrived one.
            const charge = await stripeConnectApi.getCharge(chargeId);
            const result = await injectConnectWebhook({ type: 'charge.refunded', data_object: charge });
            expect(result.threw, `charge.refunded handler threw on replay: ${result.error}`).toBe(false);
        });

        await test.step('still exactly one reversal, and no duplicate note', async () => {
            const reversals = await stripeConnectApi.listTransferReversals(transferId);
            expect(reversals, 'a replayed charge.refunded must NOT create a second reversal — that would claw back the vendor twice').toHaveLength(1);

            const notesAfter = await getOrderNotes(orderId);
            expect(notesAfter.length, 'a replayed refund event must not add another refund note').toBe(notesBefore.length);
        });
        log.success(`SCR-39 replay left transfer ${transferId} with exactly one reversal`);
    });
});
