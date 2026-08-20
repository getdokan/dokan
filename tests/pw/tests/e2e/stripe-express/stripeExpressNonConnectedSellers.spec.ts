import { test, expect, request } from '@playwright/test';
import { StripeExpressPage, STRIPE_EXPRESS_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    adminAuth,
    customerAuth,
    VENDOR_ID,
    VENDOR3_ID,
    CUSTOMER_ID,
    hasCredentials,
    ensureStripeExpressConfigured,
    setExpressGatewaySettings,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
    ensureCustomerAddress,
    ensureClassicCheckoutPage,
    getOrderMetaValue,
    getOrderNotes,
    getStripeChargeIdForOrder,
    setOrderStatus,
    expressApiRefund,
    CREDENTIALS_SKIP as CREDS_SKIP,
    NCS_TIMEOUT,
    PRODUCT_V1,
    PRODUCT_V3,
    getVendorBalance,
    getVendorEarningForOrder,
    getBalanceRowForOrder,
    getSubOrdersByVendor,
} from './helpers';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { BASE_URL } from '@utils/helpers';
import { log } from '@utils/logger';

/**
 * Stripe Express — "Allow ordering products from non-connected sellers"
 * (dokan-pro PR #6017 / commit d5688d067, closes #5949).
 *
 * Before #6017 a vendor who had not finished Stripe onboarding could not sell through
 * Express at all: the gateway hid itself whenever their product was in the cart. With the
 * admin toggle ON the sale completes, the WHOLE charge stays in the marketplace (admin)
 * Stripe account with NO transfer, and Dokan still credits that vendor's balance — matured
 * immediately — so the vendor withdraws it like any other gateway's earning and the admin
 * settles the order by hand.
 *
 * Case ids SE-NCS-01 … SE-NCS-20 are the catalogue this file implements.
 *
 * Every assertion here was observed on a real run before it was written. Notably:
 *   - money is formatted with a COMMA decimal separator ("$175,13"), so note assertions
 *     match on the formatted string, never on a raw float;
 *   - the withdraw threshold must be RAISED for "matured immediately" to be observable at
 *     all — with the suite default of 0 every earning already looks mature (SE-NCS-10);
 *   - completing a multi-vendor PARENT regenerates its sub-orders, so sub ids are fetched
 *     AFTER completion and mapped via the Dokan orders table, never cached from before.
 */



// NOT `.serial` at this level: the inner blocks are serial where order genuinely matters, but a
// failure in one independent case must not abort the others (a P2 failure previously stopped the
// P0 multi-vendor cases from running at all). Workers=1 keeps declaration order regardless.
test.describe('Stripe Express — non-connected sellers @pro', () => {
    test.describe.configure({ timeout: NCS_TIMEOUT });

    test.beforeAll(async () => {
        await ensureStripeExpressConfigured();
        // The whole file exercises the toggle ON. ensureStripeExpressConfigured() pins it to
        // 'no', so it is turned on here and turned back off in afterAll — the OFF behaviour is
        // asserted by SE-PAY-03/-11, SE-REF-06 and SE-EDGE-05, which must not see it left on.
        await setExpressGatewaySettings({ allow_non_connected_sellers: 'yes' });
        await ensureCustomerAddress();
        // vendor3 is never seeded — that is the point. vendor1 is connected for the mixed cart.
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        // createStore's `payment` block does NOT persist a usable value (it stores
        // paypal: ["email"], leaving withdraw_methods empty and createWithdraw rejected with
        // 400). Activating a real method is a precondition of the withdraw cases, not a nicety.
        const api = new ApiUtils(await request.newContext());
        try {
            await api.setStoreSettings({ payment: { paypal: { email: 'vendor3-withdraw@example.com' } } }, payloads.vendor3Auth);
        } finally {
            await api.dispose();
        }
    });

    test.afterAll(async () => {
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        // Restore the canonical OFF baseline for every other spec on this worker.
        await ensureStripeExpressConfigured();
    });

    /* ---------------- Admin setting (SE-NCS-01 / 02) ---------------- */

    test('SE-NCS-01: the gateway exposes the "Non-connected sellers" checkbox, OFF by default', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        // Asserted against the OFF baseline, so this also covers the default. It replaces the
        // removed SE-SET-04, which asserted the field did not exist and went stale on #6017.
        await setExpressGatewaySettings({ allow_non_connected_sellers: 'no' });
        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        try {
            await new StripeExpressPage(page).assertAllowNonConnectedField(false);
            log.success('SE-NCS-01: allow_non_connected_sellers renders and defaults to unchecked');
        } finally {
            await page.close();
            await ctx.close();
            await setExpressGatewaySettings({ allow_non_connected_sellers: 'yes' });
        }
    });

    test('SE-NCS-02: turning the setting ON persists and renders checked', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        await setExpressGatewaySettings({ allow_non_connected_sellers: 'yes' });
        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        try {
            await new StripeExpressPage(page).assertAllowNonConnectedField(true);
            log.success('SE-NCS-02: allow_non_connected_sellers persisted as checked');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    /* ---------------- Toggle OFF regression (SE-NCS-03) ---------------- */

    test('SE-NCS-03: with the toggle OFF the vendor still cannot sell — notice raised, Express absent', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        // The "before" half of the feature: this is exactly what #6017 changed. Asserting it here
        // keeps the toggle honest in BOTH directions inside one file.
        await setExpressGatewaySettings({ allow_non_connected_sellers: 'no' });
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(PRODUCT_V3);
            await stripe.gotoBlockCheckout();
            await expect(page.locator('input[id^="radio-control-wc-payment-method-options-"]').first(), 'block payment methods should render').toBeVisible({ timeout: 30_000 });
            await expect(page.locator(stripe.blockSelectors.gatewayRadio), 'with the toggle OFF Express must NOT be offered for a non-connected vendor cart').toHaveCount(0);
            log.success('SE-NCS-03: toggle OFF still refuses the non-connected vendor cart');
        } finally {
            await page.close();
            await ctx.close();
            await setExpressGatewaySettings({ allow_non_connected_sellers: 'yes' });
        }
    });

    /* ---------------- Classic checkout parity (SE-NCS-05) ---------------- */

    test('SE-NCS-05: classic checkout also offers Express for a non-connected vendor cart', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        // Both checkouts resolve availability through the same Order::validate_cart_items(),
        // so classic must agree with block — asserted rather than assumed.
        await ensureClassicCheckoutPage();
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(PRODUCT_V3);
            await stripe.gotoClassicCheckout();
            await expect(page.locator('label[for="payment_method_dokan_stripe_express"]'), 'classic checkout must offer Express when the toggle is ON').toHaveCount(1);
            log.success('SE-NCS-05: classic checkout offers Express for the non-connected vendor');
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    /* -------- Express-checkout (wallet) button follows the toggle (SE-NCS-20) -------- */

    test('SE-NCS-20: the product-page express-checkout button follows the toggle', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        // PaymentRequest\\Manager::is_available() gates the express button on the same predicate as
        // checkout (Manager.php:340). The signal asserted here is the SERVER-RENDERED wrapper that
        // render_payment_request_button() emits — not the Stripe button inside it, which needs a real
        // wallet a headless browser does not advertise. The wrapper is emitted if and only if the
        // gate passed, so it measures exactly the thing this case is about.
        const wrapperVisibleOnProductPage = async (): Promise<number> => {
            const ctx = await browser.newContext({ storageState: customerAuth });
            const page = await ctx.newPage();
            try {
                await page.route(/hcaptcha/i, route => route.abort());
                await page.goto(`${BASE_URL}/?p=${PRODUCT_V3}`, { waitUntil: 'domcontentloaded' });
                return await page.locator('#dokan-stripe-express-payment-request-wrapper').count();
            } finally {
                await page.close();
                await ctx.close();
            }
        };

        // payment_request defaults to 'yes', but pin it so the case cannot silently degrade into
        // "0 === 0" if a previous spec disabled the buttons.
        await setExpressGatewaySettings({ payment_request: 'yes', allow_non_connected_sellers: 'no' });
        const whenOff = await wrapperVisibleOnProductPage();
        await setExpressGatewaySettings({ allow_non_connected_sellers: 'yes' });
        const whenOn = await wrapperVisibleOnProductPage();

        expect({ whenOff, whenOn }, 'the express-checkout button must be hidden for a non-connected vendor when the toggle is OFF and rendered when it is ON').toEqual({ whenOff: 0, whenOn: 1 });
        log.success('SE-NCS-20: express-checkout button follows the non-connected-sellers toggle');
    });

    /* ------- Single non-connected vendor, toggle ON (SE-NCS-04 … 11) ------- */

    test.describe.serial('a non-connected vendor can sell, and is paid through the vendor balance', () => {
        let orderId: string;
        let chargeId: string;
        let earning: number;
        let balanceBefore: number;
        let thresholdRestored = false;
        let withdrawOptionBackup: Record<string, unknown>;

        test.beforeAll(async () => {
            test.skip(!hasCredentials, CREDS_SKIP);
            // SE-NCS-10 is only meaningful with a NON-ZERO withdraw threshold: with the suite
            // default of 0 every earning is already mature, so "matured immediately" would be
            // unfalsifiable. Raise it, and restore it in afterAll.
            withdrawOptionBackup = await dbUtils.getOptionValue(dbData.dokan.optionName.withdraw);
            await dbUtils.setOptionValue(dbData.dokan.optionName.withdraw, { ...withdrawOptionBackup, withdraw_date_limit: '7' });
            thresholdRestored = false;
            balanceBefore = await getVendorBalance(payloads.vendor3Auth as Record<string, string>);
        });

        test.afterAll(async () => {
            if (!thresholdRestored && withdrawOptionBackup) {
                await dbUtils.setOptionValue(dbData.dokan.optionName.withdraw, withdrawOptionBackup);
            }
        });

        test('SE-NCS-04/06: Express IS offered for a non-connected vendor cart, and the purchase completes', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            test.skip(!hasCredentials, CREDS_SKIP);
            expect(PRODUCT_V3, 'PRODUCT_ID_V3 must be seeded by _env.setup.ts').toBeTruthy();

            const ctx = await browser.newContext({ storageState: customerAuth });
            const page = await ctx.newPage();
            try {
                const stripe = new StripeExpressPage(page);
                await dbUtils.clearCustomerCart(CUSTOMER_ID);
                await stripe.addProductToCart(PRODUCT_V3);
                await stripe.gotoBlockCheckout();
                // The inverse of SE-PAY-03: with the toggle OFF this count is 0.
                await expect(page.locator(stripe.blockSelectors.gatewayRadio), 'Express MUST be offered for a non-connected vendor cart when the toggle is ON').toHaveCount(1);
                await stripe.selectBlockGateway();
                await stripe.fillCardDetails();
                orderId = await stripe.placeBlockOrderExpectReceived();
            } finally {
                await page.close();
                await ctx.close();
            }
            expect(Number(orderId), 'a paid order must exist').toBeGreaterThan(0);
            log.success(`SE-NCS-04/06: non-connected vendor sale completed as order ${orderId}`);
        });

        test('SE-NCS-07: the whole charge stays in the ADMIN Stripe account — no transfer to the vendor', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!hasCredentials, CREDS_SKIP);
            test.skip(!orderId, 'depends on the order from SE-NCS-04/06');

            await setOrderStatus(orderId, 'completed');
            chargeId = await getStripeChargeIdForOrder(orderId);

            const charge = await stripeApi.getCharge(chargeId);
            expect(charge.captured, 'the platform charge must be captured').toBe(true);
            // A destination charge / transfer_data would mean the funds were routed to a
            // connected account at charge time. Held money must sit on the PLATFORM balance.
            expect(charge.destination, 'a held charge must not name a destination account').toBeFalsy();
            expect(charge.transfer_data, 'a held charge must carry no transfer_data').toBeFalsy();

            const transfers = await stripeApi.transfersForCharge(chargeId);
            expect(transfers, 'NO Stripe transfer may be created for a non-connected vendor').toHaveLength(0);
            expect(await getOrderMetaValue(orderId, '_dokan_stripe_express_transfer_id'), 'a held order must never record a transfer id').toBeFalsy();
            log.success(`SE-NCS-07: charge ${chargeId} retained on the platform, 0 transfers`);
        });

        test('SE-NCS-08/09: the order is flagged held and the note names the credited earning', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!hasCredentials, CREDS_SKIP);
            test.skip(!orderId, 'depends on the order from SE-NCS-04/06');

            expect(await getOrderMetaValue(orderId, '_dokan_stripe_express_vendor_earning_held'), 'the order must be flagged as held').toBe('yes');

            earning = await getVendorEarningForOrder(orderId);
            expect(earning, 'the order must have a positive vendor earning').toBeGreaterThan(0);

            const notes = await getOrderNotes(orderId);
            const held = notes.find(n => n.includes('has not completed Stripe onboarding'));
            expect(held, 'a held-earning note must be written').toBeTruthy();
            // Money renders with the site's decimal separator (observed: a COMMA, "$175,13"),
            // so the note is matched on the FORMATTED figure rather than on a raw float.
            const formatted = earning.toFixed(2).replace('.', ',');
            expect(held, `the note must name the credited earning (${formatted})`).toContain(formatted);
            expect(held, 'the note must tell the admin to settle manually').toContain('manually');
            expect(held, 'the currency symbol must be decoded, not an HTML entity').not.toContain('&#36;');
            log.success(`SE-NCS-08/09: order ${orderId} held, note names ${formatted}`);
        });

        test('SE-NCS-10/11: the earning is credited AND matured past the withdraw threshold', { tag: ['@pro', '@vendor'] }, async () => {
            test.skip(!hasCredentials, CREDS_SKIP);
            test.skip(!orderId, 'depends on the order from SE-NCS-04/06');

            const row = await getBalanceRowForOrder(VENDOR3_ID, orderId);
            expect(row, 'a vendor-balance row must exist for the held order').toBeTruthy();
            expect(row!.debit, 'the balance row must credit the vendor earning').toBeCloseTo(earning, 2);

            // The threshold is 7 days for this block. A normal earning would sit 7 days out and
            // be excluded from the spendable balance; a HELD earning is matured to now instead.
            // Read the threshold back first: if it silently failed to apply, balance_date would
            // be "now" for the ordinary reason and the maturation assertion below would pass
            // without proving anything.
            const withdrawOption = (await dbUtils.getOptionValue(dbData.dokan.optionName.withdraw)) as { withdraw_date_limit?: string };
            expect(Number(withdrawOption.withdraw_date_limit), 'the 7-day threshold must be in effect, or this case proves nothing').toBe(7);
            expect(row!.maturesAt, 'a held earning must be matured to now, not parked at the withdraw threshold').toBeLessThanOrEqual(Date.now() + 60_000);

            const balanceAfter = await getVendorBalance(payloads.vendor3Auth as Record<string, string>);
            expect(balanceAfter - balanceBefore, 'the spendable balance must rise by the credited earning').toBeCloseTo(earning, 2);
            log.success(`SE-NCS-10/11: balance ${balanceBefore} → ${balanceAfter} (+${earning}), matured`);
        });

        test('SE-NCS-12/13: the vendor withdraws it like any other gateway earning', { tag: ['@pro', '@vendor'] }, async () => {
            test.skip(!hasCredentials, CREDS_SKIP);
            test.skip(!orderId, 'depends on the order from SE-NCS-04/06');

            // Restore the threshold BEFORE withdrawing: a 7-day limit is a maturation setting,
            // and leaving it raised would colour the withdraw assertions for no reason.
            await dbUtils.setOptionValue(dbData.dokan.optionName.withdraw, withdrawOptionBackup);
            thresholdRestored = true;

            const api = new ApiUtils(await request.newContext());
            try {
                const before = await getVendorBalance(payloads.vendor3Auth as Record<string, string>);
                const amount = Math.min(100, Math.floor(before));
                expect(amount, 'the held earning must exceed the minimum withdraw limit').toBeGreaterThan(10);

                const [, withdrawId] = await api.createWithdraw({ amount, method: 'paypal' }, payloads.vendor3Auth);
                expect(withdrawId, 'the vendor must be able to request a withdraw').toBeTruthy();

                const approved = await api.updateWithdraw(withdrawId, { status: 'approved' }, payloads.adminAuth);
                expect(approved.status, 'the admin must be able to approve the withdraw').toBe('approved');

                const after = await getVendorBalance(payloads.vendor3Auth as Record<string, string>);
                expect(before - after, 'the approved withdraw must debit the vendor balance').toBeCloseTo(amount, 2);
                log.success(`SE-NCS-12/13: withdrew ${amount}, balance ${before} → ${after}`);
            } finally {
                await api.dispose();
            }
        });

        test('SE-NCS-19: connecting later does NOT transfer the already-withdrawable earning', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!hasCredentials, CREDS_SKIP);
            test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'needs a real connected account to prove a transfer was possible but withheld');
            test.skip(!orderId, 'depends on the order from SE-NCS-04/06');

            try {
                // The vendor finishes onboarding after the sale. Dokan cannot know whether the
                // held amount was already paid out, so it must NOT settle automatically.
                await seedStripeExpressConnectedVendor(VENDOR3_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor2);
                // Two further disbursement attempts — the note must still fire only once.
                for (let i = 0; i < 2; i++) {
                    await setOrderStatus(orderId, 'processing');
                    await setOrderStatus(orderId, 'completed');
                }

                expect(await getOrderMetaValue(orderId, '_dokan_stripe_express_vendor_earning_held'), 'the order must be flagged for MANUAL settlement').toBe('manual');
                expect(await stripeApi.transfersForCharge(chargeId), 'a held earning must never be transferred after the fact — that would pay twice').toHaveLength(0);

                const settleNotes = (await getOrderNotes(orderId)).filter(n => n.includes('admin settles this order'));
                expect(settleNotes, 'the manual-settlement note must be written exactly once across repeated attempts').toHaveLength(1);
                log.success('SE-NCS-19: double-pay guard held — no transfer, meta=manual, one note');
            } finally {
                await removeStripeExpressConnectedVendor(VENDOR3_ID);
            }
        });
    });


    /* ---------------- Refund of a held order (SE-NCS-18) ---------------- */

    test('SE-NCS-18: a held order refunds with no transfer to reverse, and clears the held flag', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        let refundOrderId: string;
        try {
            refundOrderId = await new StripeExpressPage(page).buyProductsExpectReceived(CUSTOMER_ID, [PRODUCT_V3]);
        } finally {
            await page.close();
            await ctx.close();
        }
        await setOrderStatus(refundOrderId, 'completed');
        expect(await getOrderMetaValue(refundOrderId, '_dokan_stripe_express_vendor_earning_held'), 'precondition: the order is held').toBe('yes');

        const charge = await getStripeChargeIdForOrder(refundOrderId);
        await expressApiRefund(refundOrderId);

        const refunds = await stripeApi.listRefundsForCharge(charge);
        expect(refunds.length, 'the platform charge must be refunded').toBeGreaterThan(0);
        expect(refunds[0].status, 'the refund must succeed').toBe('succeeded');
        // The funds never left the marketplace account, so there is nothing to reverse.
        expect(await stripeApi.transfersForCharge(charge), 'a held order has no transfer to reverse').toHaveLength(0);
        expect(await getOrderMetaValue(refundOrderId, '_dokan_stripe_express_vendor_earning_held'), 'a fully refunded order stops being held').toBe('no');
        log.success(`SE-NCS-18: order ${refundOrderId} refunded, held flag cleared`);
    });

    /* ------- Multivendor: 1 connected + 1 non-connected (SE-NCS-14 … 17) ------- */

    test.describe.serial('a mixed connected / non-connected cart splits correctly', () => {
        let parentId: string;
        let parentCharge: string;
        let subs: Map<number, number>;

        test('SE-NCS-14: Express IS offered for a mixed cart', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            test.skip(!hasCredentials, CREDS_SKIP);
            expect(PRODUCT_V1, 'PRODUCT_ID must be seeded').toBeTruthy();

            const ctx = await browser.newContext({ storageState: customerAuth });
            const page = await ctx.newPage();
            try {
                const stripe = new StripeExpressPage(page);
                await dbUtils.clearCustomerCart(CUSTOMER_ID);
                await stripe.addProductToCart(PRODUCT_V1);
                await stripe.addProductToCart(PRODUCT_V3);
                await stripe.gotoBlockCheckout();
                // The inverse of SE-PAY-11, which asserts 0 for this same cart with the toggle OFF.
                await expect(page.locator(stripe.blockSelectors.gatewayRadio), 'one non-connected vendor must NOT gate the cart when the toggle is ON').toHaveCount(1);
                await stripe.selectBlockGateway();
                await stripe.fillCardDetails();
                parentId = await stripe.placeBlockOrderExpectReceived();
            } finally {
                await page.close();
                await ctx.close();
            }
            expect(Number(parentId), 'a paid parent order must exist').toBeGreaterThan(0);
            log.success(`SE-NCS-14: mixed cart accepted as parent order ${parentId}`);
        });

        test('SE-NCS-15/17: the non-connected vendor is held and credited, the connected one is not held', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!hasCredentials, CREDS_SKIP);
            test.skip(!parentId, 'depends on SE-NCS-14');

            await setOrderStatus(parentId, 'completed');
            parentCharge = await getStripeChargeIdForOrder(parentId);
            // Completion REGENERATES the sub-orders, so they are read only now.
            subs = await getSubOrdersByVendor(parentId);
            expect(subs.size, 'a mixed cart must split into two sub-orders').toBe(2);

            const v3Sub = [...subs.entries()].find(([, seller]) => seller === Number(VENDOR3_ID))?.[0];
            const v1Sub = [...subs.entries()].find(([, seller]) => seller === Number(VENDOR_ID))?.[0];
            expect(v3Sub, 'a sub-order must belong to the non-connected vendor').toBeTruthy();
            expect(v1Sub, 'a sub-order must belong to the connected vendor').toBeTruthy();

            expect(await getOrderMetaValue(v3Sub!, '_dokan_stripe_express_vendor_earning_held'), "the non-connected vendor's sub-order must be held").toBe('yes');
            expect(await getOrderMetaValue(v3Sub!, '_dokan_stripe_express_transfer_id'), "the non-connected vendor's sub-order must record no transfer").toBeFalsy();
            expect(await getOrderMetaValue(v1Sub!, '_dokan_stripe_express_vendor_earning_held'), "the connected vendor's sub-order must NOT be held").toBeFalsy();

            // Nothing may reach the non-connected vendor's account — it does not even exist.
            const toV3 = (await stripeApi.transfersForCharge(parentCharge)).filter(t => t.destination === STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor2);
            expect(toV3, 'no transfer may target the non-connected vendor').toHaveLength(0);

            const v3Balance = await getBalanceRowForOrder(VENDOR3_ID, v3Sub!);
            expect(v3Balance, 'the non-connected vendor must still be credited for its sub-order').toBeTruthy();
            expect(v3Balance!.debit, "the credit must equal the sub-order's vendor earning").toBeCloseTo(await getVendorEarningForOrder(v3Sub!), 2);
            log.success(`SE-NCS-15/17: sub ${v3Sub} held + credited, sub ${v1Sub} not held`);
        });

        // KNOWN PRODUCT DEFECT — confirmed live, reproduced twice, tracked separately.
        // Completing the parent regenerates its sub-orders more than once, and the
        // _dokan_stripe_express_transfer_id idempotency meta dies with each discarded
        // sub-order, so the connected vendor is transferred once PER regeneration. Observed:
        // two transfers of $155.50 for a $155.50 earning, with a third refused by Stripe's
        // source-amount ceiling. The assertion below states the CORRECT behaviour and is
        // marked test.fail — it is deliberately NOT relaxed to accept 2, which would hide a
        // double payment. Drop the test.fail once disbursement survives regeneration.
        test.fail('SE-NCS-16: the connected vendor is transferred exactly ONCE', { tag: ['@pro', '@admin'] }, async () => {
            test.skip(!hasCredentials, CREDS_SKIP);
            test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'needs a real connected account to observe the transfer');
            test.skip(!parentCharge, 'depends on SE-NCS-15/17');

            const toV1 = (await stripeApi.transfersForCharge(parentCharge)).filter(t => t.destination === STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
            expect(toV1, 'the connected vendor must receive exactly one transfer for this charge').toHaveLength(1);

            const v1Sub = [...subs.entries()].find(([, seller]) => seller === Number(VENDOR_ID))?.[0];
            expect(toV1[0].amount, "the transfer must equal the connected vendor's earning").toBe(Math.round((await getVendorEarningForOrder(v1Sub!)) * 100));
        });
    });
});
