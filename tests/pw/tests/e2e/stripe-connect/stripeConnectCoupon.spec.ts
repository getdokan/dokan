import { test, expect, request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { stripeConnectApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECT_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import {
    VENDOR_ID,
    VENDOR2_ID,
    CUSTOMER_ID,
    customerAuth,
    hasCredentials,
    HAS_REAL_CONNECTED_ACCOUNTS,
    ensureStripeConnectConfigured,
    restoreStripeExpress,
    ensureCustomerAddress,
    seedStripeConnectVendor,
    removeStripeConnectVendor,
    getOrderStatus,
    getSubOrderIds,
    getConnectIntentIdForOrder,
} from './helpers';

const CREDS_SKIP = 'Stripe Connect keys missing — cannot drive the Payment Element';
const REAL_ACCT_SKIP = 'no REAL connected accounts configured — a transfer assertion would be meaningless';

/** Seed a marketplace-wide percentage coupon the admin absorbs. */
async function seedMarketplaceCoupon(amount: string): Promise<[number, string]> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const code = `SC_MKT_${Math.random().toString(36).slice(2, 10)}`;
        const res = await ctx.post(`${SERVER_URL}/wc/v3/coupons`, {
            data: {
                code,
                discount_type: 'percent',
                amount,
                individual_use: false,
                meta_data: [{ key: 'admin_coupons_enabled_for_vendor', value: 'yes' }],
            },
        });
        const body = (await res.json().catch(() => ({}))) as { id?: number; code?: string };
        if (!res.ok() || !body.id) {
            throw new Error(`seedMarketplaceCoupon failed (${res.status()}): ${JSON.stringify(body)}`);
        }
        return [body.id, body.code ?? code];
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

/**
 * Stripe Connect — coupons (CPN-01, CPN-02).
 *
 * A discount has to reach three places at once: what Stripe captures, what each sub-order records,
 * and what each vendor is transferred. A test that only checks the order total would pass while the
 * platform captured the discounted amount and still paid vendors on the full price, which is money
 * leaving the platform that never arrived.
 */
test.describe.serial('Stripe Connect — coupons @pro', () => {
    test.describe.configure({ timeout: 420_000 });

    let product1: string;
    let product2: string;
    let couponId: number | undefined;
    let couponCode = '';

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureStripeConnectConfigured();
        await ensureCustomerAddress();
        await seedStripeConnectVendor(VENDOR_ID, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1);
        await seedStripeConnectVendor(VENDOR2_ID, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor2);

        const api = new ApiUtils(await request.newContext());
        [, product1] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Coupon Vendor One', regular_price: '100' }, payloads.vendorAuth);
        [, product2] = await api.createProduct({ ...payloads.createProduct(), name: 'Stripe Connect Coupon Vendor Two', regular_price: '100' }, payloads.vendor2Auth);
        await api.dispose();

        // 50% is deliberate: it exceeds a normal marketplace commission, so if vendor earnings were
        // still computed on the full price the transfers would exceed the reduced charge and one of
        // them would be rejected. A small discount hides that entirely.
        [couponId, couponCode] = await seedMarketplaceCoupon('50');
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await removeStripeConnectVendor(VENDOR_ID);
        await removeStripeConnectVendor(VENDOR2_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            if (couponId) {
                await ctx.delete(`${SERVER_URL}/wc/v3/coupons/${couponId}?force=true`).catch(() => undefined);
            }
            for (const id of [product1, product2]) {
                if (id) {
                    await ctx.delete(`${SERVER_URL}/wc/v3/products/${id}?force=true`).catch(() => undefined);
                }
            }
        } finally {
            await ctx.dispose();
        }
        await restoreStripeExpress();
    });

    test('CPN-01: a coupon reduces the Stripe charge and the order together', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);

        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        let orderId = '';
        let discountedTotal = 0;
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(product1);
            await stripe.gotoBlockCheckout();
            await stripe.applyCouponBlock(couponCode);

            await expect(
                page.locator(stripe.blockCoupon.appliedChip).first(),
                'the coupon should be visibly applied before the order is placed',
            ).toBeVisible({ timeout: 20_000 });

            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            orderId = await stripe.placeBlockOrderExpectReceived();
        } finally {
            await page.close();
            await ctx.close();
        }

        expect(await getOrderStatus(orderId), 'the discounted order should settle').toMatch(/processing|completed/);
        discountedTotal = await orderTotal(orderId);

        // A 50% coupon on a $100 product must leave a total below the undiscounted price. Without
        // this the case would pass on a coupon that silently failed to apply.
        expect(discountedTotal, 'the coupon must actually reduce the order total').toBeLessThan(100);

        // What Stripe captured has to match what the shopper was charged, to the cent. This is the
        // assertion that catches a discount applied to the order but not to the payment.
        const intentId = await getConnectIntentIdForOrder(orderId);
        const chargeId = await stripeConnectApi.getLatestChargeId(intentId);
        const charge = await stripeConnectApi.getCharge(chargeId);
        expect(
            Number(charge.amount),
            `Stripe captured ${charge.amount} minor units for an order totalling ${discountedTotal}`,
        ).toBe(Math.round(discountedTotal * 100));

        // And the vendor's transfer must fit inside the reduced charge, not the pre-discount price.
        const transfers = await stripeConnectApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1);
        if (HAS_REAL_CONNECTED_ACCOUNTS) {
            expect(transfers, 'the vendor should be paid exactly once for the discounted order').toHaveLength(1);
            expect(
                Number(transfers[0].amount),
                'the vendor transfer must not exceed what Stripe actually captured',
            ).toBeLessThanOrEqual(Number(charge.amount));
        }
        log.success(`Coupon order ${orderId}: total ${discountedTotal}, Stripe captured ${charge.amount} minor units`);
    });

    test('CPN-02: a marketplace coupon on a two-vendor cart still pays both vendors', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, REAL_ACCT_SKIP);

        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        let orderId = '';
        try {
            const stripe = new StripeConnectPage(page);
            await stripe.addProductToCart(product1);
            await stripe.addProductToCart(product2);
            await stripe.gotoBlockCheckout();
            await stripe.applyCouponBlock(couponCode);
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            orderId = await stripe.placeBlockOrderExpectReceived();
        } finally {
            await page.close();
            await ctx.close();
        }

        expect(await getOrderStatus(orderId), 'the discounted multi-vendor order should settle').toMatch(/processing|completed/);

        const subOrders = await getSubOrderIds(orderId);
        expect(subOrders, 'a two-vendor cart should still split into two sub-orders under a coupon').toHaveLength(2);

        const intentId = await getConnectIntentIdForOrder(orderId);
        const chargeId = await stripeConnectApi.getLatestChargeId(intentId);

        // The failure mode is one vendor's transfer being rejected because the transfers together
        // exceed the coupon-reduced charge, so the second vendor silently receives nothing.
        for (const [label, acct] of [
            ['vendor1', STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1],
            ['vendor2', STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor2],
        ] as const) {
            await expect
                .poll(async () => (await stripeConnectApi.transfersForChargeToVendor(chargeId, acct)).length, {
                    message: `${label} must be paid even under a marketplace coupon`,
                    timeout: 30_000,
                })
                .toBe(1);
        }

        // The money identity: nothing more left the platform than the platform took in.
        const charge = await stripeConnectApi.getCharge(chargeId);
        const allTransfers = await stripeConnectApi.transfersForCharge(chargeId);
        const transferred = allTransfers.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        expect(
            transferred,
            `vendor transfers (${transferred}) must not exceed the captured charge (${charge.amount})`,
        ).toBeLessThanOrEqual(Number(charge.amount));

        log.success(`Marketplace coupon order ${orderId}: both vendors paid, ${transferred} of ${charge.amount} minor units transferred`);
    });
});
