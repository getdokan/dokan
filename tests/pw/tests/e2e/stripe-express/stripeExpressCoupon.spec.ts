import { test, expect } from '@utils/test';
import { log } from '@utils/logger';
import { StripeExpressPage, STRIPE_EXPRESS_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    hasCredentials,
    CREDENTIALS_SKIP,
    REAL_ACCOUNTS_SKIP,
    PRODUCT_V1,
    VENDOR_ID,
    CUSTOMER_ID,
    customerAuth,
    ensureStripeExpressConfigured,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
    seedMarketplaceCoupon,
    deleteCoupon,
    getOrderTotals,
    getStripeChargeIdForOrder,
    capturedAmount,
    completeOrderFully,
    firstVendorTransfer,
    getVendorEarningForOrder,
} from './helpers';

/**
 * Stripe Express — coupon (DOK-TC-SE-71 / -72).
 *
 * A discount has to reach BOTH sides of the money path, and they fail independently: the customer
 * must be charged the discounted total (not the list price), and the vendor's transfer must be
 * computed from the discounted earning (not the pre-discount one). Charging correctly while
 * transferring the undiscounted earning would silently overpay the vendor out of the platform's
 * own balance, which is why these are two assertions and not one.
 */
test.describe.serial('Stripe Express — coupon @pro', () => {
    test.describe.configure({ timeout: 240_000 });

    let couponId: number | undefined;
    let couponCode = '';
    let orderId = '';

    test.beforeAll(async () => {
        await ensureStripeExpressConfigured();
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        if (hasCredentials) {
            [couponId, couponCode] = await seedMarketplaceCoupon('20');
        }
    });

    test.afterAll(async () => {
        await deleteCoupon(couponId);
        await removeStripeExpressConnectedVendor(VENDOR_ID);
    });

    test('SE-COUP-01: a coupon discount is charged at the discounted total, not the list total', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        orderId = await StripeExpressPage.placeOrderWithCoupon(browser, customerAuth, CUSTOMER_ID, [PRODUCT_V1], couponCode);

        const totals = await getOrderTotals(orderId);
        expect(totals.discount_total, 'the coupon must actually have applied — a zero discount would make the charge assertion vacuous').toBeGreaterThan(0);

        const captured = await capturedAmount(orderId);
        expect(captured, 'Stripe must capture the DISCOUNTED order total in minor units, never the pre-discount amount').toBe(Math.round(totals.total * 100));
        log.success(`SE-COUP-01: discount ${totals.discount_total}, charged ${captured} = order total ${totals.total}`);
    });

    test('SE-COUP-02: the vendor transfer reflects the discounted earning', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, REAL_ACCOUNTS_SKIP);
        test.skip(!orderId, 'depends on the order from SE-COUP-01');

        await completeOrderFully(orderId);

        const chargeId = await getStripeChargeIdForOrder(orderId);
        const transfer = await firstVendorTransfer(chargeId, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const earning = Math.round((await getVendorEarningForOrder(orderId)) * 100);
        const captured = await capturedAmount(orderId);

        expect(transfer.amount, 'the transfer must equal the vendor earning recorded for the DISCOUNTED order').toBe(earning);
        expect(transfer.amount, 'a transfer larger than the discounted charge would pay the vendor out of the platform balance').toBeLessThanOrEqual(captured);
        expect(captured - transfer.amount, 'the admin still keeps a positive commission after the discount').toBeGreaterThan(0);
        log.success(`SE-COUP-02: discounted charge ${captured} = vendor ${transfer.amount} + admin ${captured - transfer.amount}`);
    });
});
