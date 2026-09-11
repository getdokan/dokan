import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { log } from '@utils/logger';
import { StripeExpressPage } from './stripeExpressPage';
import {
    REAL_ACCOUNTS_SKIP as REAL_SKIP,
    TRANSFER_META,
    completeOrderFully,
    firstVendorTransfer,
    capturedAmount,
    countExpressWithdraws,
    getVendorEarningForOrder,
    getSubOrdersByVendor,
    customerAuth,
    VENDOR_ID,
    VENDOR2_ID,
    CUSTOMER_ID,
    HAS_REAL_CONNECTED_ACCOUNTS,
    STRIPE_EXPRESS_CONNECTED_ACCOUNTS,
    ensureStripeExpressConfigured,
    ensureCustomerAddress,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
    setExpressGatewaySettings,
    getStripeChargeIdForOrder,
    getOrderMetaValue,
} from './helpers';

/**
 * Stripe Express — SE-PAY · payout / money movement (separate charge + transfer).
 *
 * Dokan Stripe Express uses Stripe's SEPARATE charges-and-transfers model: the PaymentIntent
 * is created on the PLATFORM (no destination / no application_fee), and each connected vendor
 * is paid via a standalone Stripe Transfer carrying `source_transaction = the platform charge id`.
 * So the source of truth for "did this vendor get paid" is the TRANSFER ledger (stripeApi),
 * NOT the WP UI and NOT the charge object. The order meta `_dokan_stripe_express_transfer_id`
 * records the transfer id Dokan created.
 *
 * disburse_mode is ON_ORDER_COMPLETED (set by the canonical config), so every transfer assertion
 * first drives the order (and its per-vendor sub-orders) to `completed` before reading the ledger.
 *
 * Serial because it mutates global gateway settings (disburse_mode / capture / sellers-pay-fee)
 * and seeds the shared vendors. afterEach restores the canonical gateway config. Real money-movement
 * cases self-skip without REAL connected accounts (HAS_REAL_CONNECTED_ACCOUNTS); SE-PAY-03/11 only
 * need credentials (they prove the ABSENCE of a payout + the audit note, which holds with placeholders).
 */

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */

test.describe.serial('Stripe Express — SE-PAY payouts (separate charge + transfer) @pro', () => {
    test.describe.configure({ timeout: 200_000 });

    let product1: string; // vendor1
    let product2: string; // vendor2
    let product3: string;

    test.beforeAll(async () => {
        await ensureStripeExpressConfigured();
        // Deterministic disbursement: transfers fire on order COMPLETION (not the ambiguous default),
        // so completeOrderFully() reliably triggers the vendor transfer the assertions poll for.
        await setExpressGatewaySettings({ disburse_mode: 'ON_ORDER_COMPLETED', capture: 'no', sellers_pay_processing_fee: 'no' });
        await ensureCustomerAddress();
        // vendor1 stays connected for the whole file; vendor2 is seeded/removed per multi-vendor test;
        // vendor3 is never connected at all and is the non-connected fixture.
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const api = new ApiUtils(await request.newContext());
        try {
            [, product1] = await api.createProduct({ ...payloads.createProduct(), name: 'SE-PAY vendor1 product', regular_price: '50' }, payloads.vendorAuth);
            [, product2] = await api.createProduct({ ...payloads.createProduct(), name: 'SE-PAY vendor2 product', regular_price: '40' }, payloads.vendor2Auth);
            // vendor3 is NEVER connected, so SE-PAY-03/-11 need no connect/disconnect churn.
            [, product3] = await api.createProduct({ ...payloads.createProduct(), name: 'SE-PAY vendor3 product', regular_price: '40' }, payloads.vendor3Auth);
        } finally {
            await api.dispose();
        }
    });

    test.afterEach(async () => {
        // Reset the settings a test may have mutated (disburse_mode/capture/fee) back to the canonical
        // values so a settings-mutating test (e.g. PAY-05 DELAYED, PAY-07 manual capture) cannot bleed
        // into the next. ensureStripeExpressConfigured() alone does NOT touch these keys, so set them.
        await setExpressGatewaySettings({ disburse_mode: 'ON_ORDER_COMPLETED', capture: 'no', sellers_pay_processing_fee: 'no' });
    });

    test.afterAll(async () => {
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        await removeStripeExpressConnectedVendor(VENDOR2_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${product1}?force=true`).catch(() => undefined);
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${product3}?force=true`).catch(() => undefined);
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${product2}?force=true`).catch(() => undefined);
        } finally {
            await ctx.dispose();
        }
    });

    // ---- SE-PAY-01 — single connected vendor → exactly one transfer == vendor earning ----

    test('SE-PAY-01: single connected-vendor order → exactly ONE transfer to the vendor; admin commission stays on platform', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, REAL_SKIP);

        const orderId = await StripeExpressPage.placeOrderAsCustomer(browser, customerAuth, CUSTOMER_ID, [product1]);
        await completeOrderFully(orderId);

        const chargeId = await getStripeChargeIdForOrder(orderId);
        const transfer = await firstVendorTransfer(chargeId, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const captured = await capturedAmount(orderId);

        // Money truth: the vendor earning is paid via a single Transfer funded by THIS charge, on the
        // vendor's account, and is strictly less than the captured charge (the admin commission is
        // retained on the platform — it is never transferred).
        expect(transfer.amount, 'vendor earning transfer must be > 0').toBeGreaterThan(0);
        expect(transfer.amount, 'admin commission stays on platform (transfer < captured charge)').toBeLessThan(captured);
        expect(transfer.source_transaction, 'transfer must be funded by this order charge').toBe(chargeId);
        expect(transfer.destination, "transfer must land on vendor1's connected account").toBe(STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);

        // Dokan records the transfer id on the order.
        expect(await getOrderMetaValue(orderId, TRANSFER_META), 'order records the Stripe transfer id').toBe(transfer.id);
        log.success(`SE-PAY-01: one transfer ${transfer.id} = ${transfer.amount} (charge ${captured}) to vendor1`);
    });

    // ---- SE-PAY-02 — multi-vendor → two transfers, one per vendor ----

    test('SE-PAY-02: multi-vendor order (2 connected vendors) → TWO transfers, one per vendor account', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, REAL_SKIP);

        await seedStripeExpressConnectedVendor(VENDOR2_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor2);
        try {
            const orderId = await StripeExpressPage.placeOrderAsCustomer(browser, customerAuth, CUSTOMER_ID, [product1, product2]);
            await completeOrderFully(orderId);

            const chargeId = await getStripeChargeIdForOrder(orderId);
            const v1 = await firstVendorTransfer(chargeId, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
            const v2 = await firstVendorTransfer(chargeId, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor2);

            expect(v1.amount, 'vendor1 transfer > 0').toBeGreaterThan(0);
            expect(v2.amount, 'vendor2 transfer > 0').toBeGreaterThan(0);
            expect(v1.source_transaction, 'vendor1 transfer funded by this charge').toBe(chargeId);
            expect(v2.source_transaction, 'vendor2 transfer funded by this charge').toBe(chargeId);

            const captured = await capturedAmount(orderId);
            expect(v1.amount + v2.amount, 'sum of vendor transfers must not exceed the captured charge').toBeLessThanOrEqual(captured);
            log.success(`SE-PAY-02: split verified v1=${v1.amount} v2=${v2.amount} charge=${captured}`);
        } finally {
            await removeStripeExpressConnectedVendor(VENDOR2_ID);
        }
    });

    // ---- SE-PAY-03 — the no-payout guarantee: Express refuses a non-connected-vendor cart ----


    // ---- SE-PAY-04 — sellers_pay_processing_fee reduces the vendor transfer ----


    // ---- SE-PAY-05 — disburse_mode=DELAYED → no transfer at order time ----


    // ---- SE-PAY-06 — a Dokan withdraw entry is recorded after a successful transfer ----

    test('SE-PAY-06: a successful disbursement records a Dokan withdraw entry for the vendor', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, REAL_SKIP);

        const api = new ApiUtils(await request.newContext());
        try {
            const baseline = countExpressWithdraws(await api.getAllWithdraws(payloads.adminAuth));
            const orderId = await StripeExpressPage.placeOrderAsCustomer(browser, customerAuth, CUSTOMER_ID, [product1]);
            await completeOrderFully(orderId);

            // Prove the transfer happened first (money truth), then the withdraw entry is recorded.
            await firstVendorTransfer(await getStripeChargeIdForOrder(orderId), STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
            await expect
                .poll(async () => countExpressWithdraws(await api.getAllWithdraws(payloads.adminAuth)), {
                    message: 'a Stripe Express withdraw entry should be recorded after the transfer',
                    timeout: 45_000,
                })
                .toBeGreaterThan(baseline);
            log.success('SE-PAY-06: a Dokan withdraw entry was recorded after the disbursement');
        } finally {
            await api.dispose();
        }
    });

    // ---- SE-PAY-07 — manual capture: authorize → capture → transfer on capture ----


    // ---- SE-PAY-08 — transfer rejected by Stripe (restricted/unsupported) ----


    // ---- SE-PAY-09 — marketplace coupon on a multi-vendor cart still pays both vendors ----

    // KNOWN PRODUCT FINDING (fixme, not fake-green): under an admin-absorbed
    // marketplace coupon on a multi-vendor cart, a vendor deterministically receives
    // TWO Stripe transfers for the SAME charge (Expected 1, Received 2 — polled 60s,
    // all retries). The counter is strict (source_transaction === chargeId, to that
    // vendor's account), and process_single_transfer creates exactly one idempotent
    // transfer per sub-order with no coupon-compensation path — so this is an
    // unexplained double transfer to a vendor (a potential double-payment). SE-PAY-01
    // (single vendor) and SE-PAY-02 (multi-vendor, no coupon) both pass, so the admin
    // coupon is the trigger. Do NOT relax the assertion to accept 2 — that would mask
    // a possible double-payment. Needs the Stripe-Express team to root-cause (real bug
    // vs an intended compensation transfer) and either fix disbursement or adjust the
    // assertion. See bugs/se-pay-09-double-transfer-admin-coupon.md.

    // ---- SE-PAY-10 — vendor disconnected before a DELAYED disbursement → never paid ----


    // ---- SE-PAY-11 — ONE non-connected vendor in a MIXED cart gates Express for the whole cart ----


    /* ------------------------------------------------------------------ *
     * SE-PAY-12 / SE-PAY-13 — the split is EXACT, not merely bounded.
     *
     * SE-PAY-01/02 assert inequalities: transfer > 0, transfer < captured, and for two vendors
     * that the sum does not exceed the charge. A wildly wrong split (a $1 transfer on a $200
     * order) satisfies all of that. These two reconcile against Dokan's OWN recorded figures, so
     * they fail when the marketplace maths drifts, not only when a transfer disappears.
     *
     *   vendor earning   = wp_dokan_orders.net_amount for that (sub-)order
     *   admin commission = captured charge - sum of vendor transfers
     *
     * Deliberately TWO tests, one purchase each: a single test doing both drove two full
     * checkouts and blew the 200s describe timeout (measured: single 2.5m + multi 2.9m).
     * ------------------------------------------------------------------ */

    test('SE-PAY-12: single vendor — the transfer equals the recorded earning, the rest is admin commission', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, REAL_SKIP);

        const orderId = await StripeExpressPage.placeOrderAsCustomer(browser, customerAuth, CUSTOMER_ID, [product1]);
        await completeOrderFully(orderId);

        const chargeId = await getStripeChargeIdForOrder(orderId);
        const transfer = await firstVendorTransfer(chargeId, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const captured = await capturedAmount(orderId);
        const earning = Math.round((await getVendorEarningForOrder(orderId)) * 100);

        expect(transfer.amount, 'the transfer must equal the vendor earning Dokan recorded, to the cent').toBe(earning);
        const commission = captured - transfer.amount;
        expect(commission, 'the admin commission is what stays on the platform, and it must be positive').toBeGreaterThan(0);
        log.success(`SE-PAY-12: charge ${captured} = vendor ${transfer.amount} + admin ${commission}`);
    });

    test('SE-PAY-13: multi-vendor — each sub-order is transferred exactly its recorded earning', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, REAL_SKIP);

        await seedStripeExpressConnectedVendor(VENDOR2_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor2);
        try {
            const parentId = await StripeExpressPage.placeOrderAsCustomer(browser, customerAuth, CUSTOMER_ID, [product1, product2]);
            await completeOrderFully(parentId);

            const parentCharge = await getStripeChargeIdForOrder(parentId);
            const captured = await capturedAmount(parentId);

            // Read sub-orders AFTER completion: completing the parent regenerates them.
            const subs = await getSubOrdersByVendor(parentId);
            expect(subs.size, 'a two-vendor cart must split into two sub-orders').toBe(2);

            let transferred = 0;
            for (const [subId, sellerId] of subs) {
                const acct = sellerId === Number(VENDOR_ID) ? STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1 : STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor2;
                const t = await firstVendorTransfer(parentCharge, acct);
                const earning = Math.round((await getVendorEarningForOrder(subId)) * 100);
                expect(t.amount, `sub-order ${subId} (vendor ${sellerId}) must be transferred exactly its recorded earning`).toBe(earning);
                transferred += t.amount;
            }

            const commission = captured - transferred;
            expect(transferred, 'vendor transfers can never exceed the captured charge').toBeLessThanOrEqual(captured);
            expect(commission, 'the admin keeps a positive commission across both vendors').toBeGreaterThan(0);
            log.success(`SE-PAY-13: charge ${captured} = vendors ${transferred} + admin ${commission}`);
        } finally {
            await removeStripeExpressConnectedVendor(VENDOR2_ID);
        }
    });
});
