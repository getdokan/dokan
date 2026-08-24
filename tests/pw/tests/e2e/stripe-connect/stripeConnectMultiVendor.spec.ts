import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { payloads, MOBILE_TEST_PHONE } from '@utils/payloads';
import { stripeConnectApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECT_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { VENDOR_ID, VENDOR2_ID, hasCredentials, ensureStripeConnectConfigured, setConnectGatewaySettings, restoreStripeExpress, seedBothConnectedVendors, removeStripeConnectVendor, getSubOrderIds, getConnectIntentIdForOrder, getOrderMetaValue, injectConnectWebhook } from './helpers';

/**
 * Stripe Connect — multi-vendor split and who pays the processing fee (SC-41, SC-42).
 *
 * The money oracle here is the Stripe API and the Dokan REST API, never the database: Stripe says
 * what was actually transferred, `dokan/v1/orders/{id}` says what the marketplace recorded as the
 * vendor's earning, and the case is about those two agreeing.
 *
 * Both cases need REAL connected accounts the platform key can reach, so they skip (loudly, in the
 * pre-flight) rather than pass when only placeholders are configured.
 */
test.describe.serial('Stripe Connect — multi-vendor split and processing fee @pro', () => {
    test.describe.configure({ timeout: 240_000 });

    const guestBilling = {
        email: 'guest.split.stripeconnect@example.com',
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
        const [, id1] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Split V1' }, payloads.vendorAuth);
        const [, id2] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Split V2' }, payloads.vendor2Auth);
        v1ProductId = id1;
        v2ProductId = id2;
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        // Put the fee back on the admin, the gateway default, so a later spec does not inherit
        // SC-42's seller-pays setting and silently test a different configuration.
        await setConnectGatewaySettings({ seller_pays_the_processing_fee: 'no' });
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

    /** The marketplace's own record of what a vendor earned on a (sub-)order. */
    async function dokanEarning(orderId: string | number): Promise<number> {
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const res = await ctx.get(`${SERVER_URL}/dokan/v1/orders/${orderId}`);
            const body = (await res.json()) as { earning?: number | string };
            expect(body.earning, `dokan/v1/orders/${orderId} should report an earning`).not.toBeUndefined();
            return Number(body.earning);
        } finally {
            await ctx.dispose();
        }
    }

    async function orderTotal(orderId: string | number): Promise<number> {
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=total`);
            const body = (await res.json()) as { total: string };
            return Number(body.total);
        } finally {
            await ctx.dispose();
        }
    }

    /** Stripe transfers made off a single platform charge, keyed by destination account. */
    async function transfersByDestination(chargeId: string): Promise<Map<string, any[]>> {
        const transfers = await stripeConnectApi.transfersForCharge(chargeId);
        const byDest = new Map<string, any[]>();
        for (const t of transfers) {
            const dest = String(t.destination);
            byDest.set(dest, [...(byDest.get(dest) ?? []), t]);
        }
        return byDest;
    }

    // ---- SC-41 — two vendors, one payment ----

    test('SC-41: a two-vendor cart splits into sub-orders and each vendor is paid exactly once', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'no REAL connected accounts configured — a transfer assertion would be meaningless');

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(v1ProductId);
            await stripe.addProductToCart(v2ProductId);
            await stripe.gotoBlockCheckout();
            await stripe.fillBlockGuestDetails(guestBilling);
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);

            const parentId = await test.step('pay for both vendors in one go', async () => stripe.placeBlockOrderExpectReceived());

            const subOrders = await test.step('the order split into one sub-order per vendor', async () => {
                const subs = await getSubOrderIds(parentId);
                expect(subs, 'a two-vendor cart should produce exactly two sub-orders').toHaveLength(2);
                return subs;
            });

            await test.step('the sub-order totals add up to the parent total', async () => {
                const parentTotal = await orderTotal(parentId);
                const subTotals = await Promise.all(subOrders.map(id => orderTotal(id)));
                const summed = subTotals.reduce((a, b) => a + b, 0);
                expect(Number(summed.toFixed(2)), 'the sub-order totals must sum to the parent order total').toBe(Number(parentTotal.toFixed(2)));
            });

            await test.step('Stripe made exactly one transfer per vendor, none reversed', async () => {
                const intentId = await getConnectIntentIdForOrder(parentId);
                const chargeId = await stripeConnectApi.getLatestChargeId(intentId);
                const byDest = await transfersByDestination(chargeId);

                for (const acct of [STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor2]) {
                    const forVendor = byDest.get(acct) ?? [];
                    expect(forVendor, `vendor account ${acct} should receive exactly ONE transfer from charge ${chargeId}`).toHaveLength(1);
                    const reversals = await stripeConnectApi.listTransferReversals(String(forVendor[0].id));
                    expect(reversals, `transfer ${forVendor[0].id} must not be reversed`).toHaveLength(0);
                }
                expect(byDest.size, 'the charge should fund exactly the two vendor accounts and nobody else').toBe(2);
            });

            await test.step('each vendor is credited only for their own sub-order', async () => {
                for (const subId of subOrders) {
                    const earning = await dokanEarning(subId);
                    const total = await orderTotal(subId);
                    expect(earning, `sub-order ${subId} should credit its vendor a positive earning`).toBeGreaterThan(0);
                    expect(earning, `sub-order ${subId} earning must not exceed its own total`).toBeLessThanOrEqual(total);
                }
            });
            log.success(`SC-41 parent ${parentId} split into ${subOrders.join(', ')} with one transfer each`);
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---- SC-42 — seller pays the processing fee ----

    /*
     * Run on BOTH checkout surfaces.
     *
     * getdokan/plugin-internal-tasks#2294 reports the vendor being transferred the GROSS earning
     * instead of the net, six times out of six, and every one of those six was on the CLASSIC
     * checkout. An earlier version of this spec exercised only the block checkout and passed, which
     * would have reported the defect as absent purely because it never touched the surface that
     * shows it. Covering one surface and generalising from it is the failure mode this loop exists
     * to prevent.
     */
    /** Place one seller-pays-the-fee order on the given surface and report the money it moved. */
    async function placeFeeBearingOrder(browser: any, surface: 'block' | 'classic', tag: string) {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(v1ProductId);

            let orderId: string;
            if (surface === 'block') {
                await stripe.gotoBlockCheckout();
                await stripe.fillBlockGuestDetails({ ...guestBilling, email: `guest.sellerfee.${tag}@example.com` });
                await stripe.selectBlockGateway();
                await stripe.fillCardDetails(STRIPE_CARDS.success);
                orderId = await stripe.placeBlockOrderExpectReceived();
            } else {
                await stripe.gotoClassicCheckout();
                await stripe.fillBillingClassic();
                await stripe.selectClassicGateway();
                await stripe.fillCardDetails(STRIPE_CARDS.success);
                orderId = await stripe.placeClassicOrderExpectReceived();
            }

            /*
             * Which disbursement path ran. Recorded, NOT asserted: `IntentController.php:102-108`
             * only defers when the fee has not been processed yet, so taking the immediate path when
             * the fee is already known is correct. An earlier version asserted this flag must be
             * `yes` and a headed run rightly failed it on the block surface.
             */
            const awaiting = await getOrderMetaValue(orderId, '_dokan_stripe_awaiting_disbursement');

            const intentId = await getConnectIntentIdForOrder(orderId);
            const chargeId = await stripeConnectApi.getLatestChargeId(intentId);

            // Stripe attaches the balance transaction asynchronously, which is the whole reason the
            // module defers at all. Poll until it exists, otherwise ChargeUpdated::handle() returns
            // early and any deferred disbursement is never released.
            await expect
                .poll(async () => Boolean((await stripeConnectApi.getCharge(chargeId)).balance_transaction), {
                    message: 'Stripe should attach a balance transaction so the settled fee can be read',
                    timeout: 60_000,
                })
                .toBe(true);
            const charge = await stripeConnectApi.getCharge(chargeId);
            const result = await injectConnectWebhook({ type: 'charge.updated', data_object: charge });
            expect(result.threw, `charge.updated handler threw: ${result.error}`).toBe(false);

            await expect
                .poll(async () => getOrderMetaValue(orderId, '_dokan_stripe_vendor_payment_processed'), {
                    message: 'the vendor payment should have run by the time the fee has settled',
                    timeout: 60_000,
                })
                .toBe('yes');

            const fee = Number(await getOrderMetaValue(orderId, 'dokan_gateway_fee'));
            const paidBy = await getOrderMetaValue(orderId, 'dokan_gateway_fee_paid_by');
            const feeProcessed = await getOrderMetaValue(orderId, '_dokan_stripe_gateway_fee_processed');

            const byDest = await transfersByDestination(chargeId);
            const forVendor = byDest.get(STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1) ?? [];
            expect(forVendor, `the vendor should receive exactly one transfer for order ${orderId}`).toHaveLength(1);

            const transferred = Number(Number(forVendor[0].amount / 100).toFixed(2));
            const earning = Number((await dokanEarning(orderId)).toFixed(2));

            log.info(`SC-42 (${surface}) order ${orderId}: awaiting=${String(awaiting)} transferred=${transferred} earning=${earning} fee=${fee} paidBy=${paidBy}`);
            return { orderId, transferred, earning, fee, paidBy, feeProcessed };
        } finally {
            await page.close();
            await ctx.close();
        }
    }

    test('SC-42 (block): seller-pays-the-fee transfers the vendor exactly what they are recorded as earning', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'no REAL connected accounts configured — a transfer assertion would be meaningless');

        await setConnectGatewaySettings({ seller_pays_the_processing_fee: 'yes' });
        const r = await placeFeeBearingOrder(browser, 'block', 'block');

        expect(r.paidBy, 'with seller_pays_the_processing_fee=yes the fee must be booked to the seller').toBe('seller');
        expect(r.fee, 'a settled gateway fee should be a positive amount').toBeGreaterThan(0);
        expect(r.feeProcessed, 'the fee-processed guard should be set, so a repeat delivery cannot charge it twice').toBe('yes');
        expect(r.transferred, `the vendor must be transferred exactly the recorded earning (fee ${r.fee}, paid by ${r.paidBy})`).toBe(r.earning);
    });

    test('SC-42 (classic): seller-pays-the-fee transfers the vendor exactly what they are recorded as earning', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect keys missing — cannot drive the Payment Element');
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'no REAL connected accounts configured — a transfer assertion would be meaningless');

        await setConnectGatewaySettings({ seller_pays_the_processing_fee: 'yes' });

        /*
         * THREE orders, not one, and this is the whole point of the case.
         *
         * getdokan/plugin-internal-tasks#2294 is a RACE on the classic checkout, not a constant.
         * Measured over five single orders the vendor was over-transferred by exactly the gateway fee
         * three times (175.19 vs 169.40, 153.20 vs 148.09, 166.50 vs 160.98) and matched twice
         * (100.00, 178.85). With no deferral the transfer races Stripe attaching the balance
         * transaction: win the race and the fee is known so the net goes out, lose it and the gross
         * does.
         *
         * A `test.fail()` over a SINGLE order is therefore wrong about 40% of the time, and two
         * full-folder runs proved that by reporting "Expected to fail, but passed". At roughly 60%
         * per order, requiring all three to match detects the defect about 94% of the time. The
         * residual flake is a property of the defect, not of the harness, and is recorded in the
         * ledger rather than hidden.
         */
        const results = [];
        for (let i = 1; i <= 3; i++) {
            results.push(await placeFeeBearingOrder(browser, 'classic', `classic${i}`));
        }

        const mismatches = results.filter(r => r.transferred !== r.earning);
        log.info(`SC-42 (classic): ${mismatches.length} of ${results.length} orders over-transferred — ` + results.map(r => `${r.orderId}: ${r.transferred} vs ${r.earning}`).join(', '));

        for (const r of results) {
            expect(r.paidBy, 'with seller_pays_the_processing_fee=yes the fee must be booked to the seller').toBe('seller');
        }

        test.fail();
        expect(
            mismatches.map(r => `order ${r.orderId}: transferred ${r.transferred} vs recorded earning ${r.earning}, over by ${(r.transferred - r.earning).toFixed(2)} (fee ${r.fee})`),
            'every vendor transfer must equal the recorded earning; any difference is the platform paying out a fee it already deducted on paper',
        ).toEqual([]);
    });
});
