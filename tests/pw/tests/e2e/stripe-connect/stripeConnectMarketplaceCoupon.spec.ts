import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import { customerAuth, VENDOR_ID, VENDOR2_ID, CUSTOMER_ID, SERVER_URL, hasCredentials, ensureCustomerAddress } from './helpers';

/**
 * BUG-35 — a large MARKETPLACE/admin coupon on a MULTI-VENDOR cart breaks the vendor split.
 *
 * When an admin coupon discounts a multi-vendor cart by MORE than the platform commission, the
 * captured charge is reduced below the sum of the vendor earnings (which are computed on the full
 * price — the admin absorbs the coupon). The separate-charges-and-transfers split then issues a
 * Transfer for each vendor off the (reduced) charge; the second transfer exceeds the remaining
 * source amount and Stripe rejects it ("Transfers ... must not exceed the source amount") — so one
 * vendor is paid and the OTHER gets nothing, while the order shows "completed". This asserts the
 * CORRECT invariant (both connected vendors receive a transfer); test.fail() pins the bug.
 *
 * Needs REAL connected accounts (the transfer is what fails). The C5 coupon test covers the
 * single-vendor / within-commission case; this covers the multi-vendor over-commission case.
 */
const CREDS_SKIP = 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env';
const REAL_ACCT_SKIP = 'needs REAL Stripe test connected accounts (STRIPE_VENDOR1_ACCT/STRIPE_VENDOR2_ACCT)';

/** Seed an admin/marketplace percentage coupon (cart-wide; the admin absorbs the discount). */
async function seedMarketplaceCoupon(amount: string): Promise<[number, string]> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const code = `SC_MKT_${Date.now().toString(36)}`;
        const res = await ctx.post(`${SERVER_URL}/wc/v3/coupons`, {
            data: { code, discount_type: 'percent', amount, individual_use: false, meta_data: [{ key: 'admin_coupons_enabled_for_vendor', value: 'yes' }] },
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

test.describe.serial('Stripe Connect — BUG-35 (marketplace coupon > commission breaks the multi-vendor split)', () => {
    test.describe.configure({ timeout: 150_000 });

    let product1: string;
    let product2: string;
    let couponId: number | undefined;
    let couponCode = '';

    test.beforeAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await ensureCustomerAddress();
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        await dbUtils.seedStripeConnectedVendor(VENDOR2_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor2 });
        const api = new ApiUtils(await request.newContext());
        [, product1] = await api.createProduct({ ...payloads.createProduct(), regular_price: '100' }, payloads.vendorAuth);
        [, product2] = await api.createProduct({ ...payloads.createProduct(), regular_price: '100' }, payloads.vendor2Auth);
        // 50% admin coupon — exceeds a typical (≤30%) marketplace commission, so the discount is larger
        // than what the admin keeps → the sum of vendor transfers exceeds the reduced charge.
        [couponId, couponCode] = await seedMarketplaceCoupon('50');
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        await dbUtils.removeStripeConnectedVendor(VENDOR2_ID);
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            if (couponId) {
                await ctx.delete(`${SERVER_URL}/wc/v3/coupons/${couponId}?force=true`).catch(() => undefined);
            }
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${product1}?force=true`).catch(() => undefined);
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${product2}?force=true`).catch(() => undefined);
        } finally {
            await ctx.dispose();
        }
    });

    // MONEY-INVARIANT REGRESSION GUARD for BUG-35: under a marketplace coupon on a multi-vendor cart, BOTH
    // connected vendors must receive a transfer. The audited failure (one vendor's transfer rejected because the
    // sum of vendor transfers exceeds the coupon-reduced charge) only manifests when the admin BEARS the discount
    // (coupon carries a non-'default' coupon_commissions_type → vendor earnings stay on the full price). On the
    // default config the coupon is vendor-borne (sub-order totals drop, transfers fit) so both vendors are paid
    // and this passes — it then trips the moment a config makes the split over-transfer.
    test('BUG-35 guard: a marketplace coupon on a multi-vendor cart must pay BOTH vendors (no failed transfer)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDS_SKIP);
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, REAL_ACCT_SKIP);

        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(product1);
            await stripe.addProductToCart(product2);
            await stripe.gotoBlockCheckout();
            await stripe.applyCouponBlock(couponCode); // 50% off the whole multi-vendor cart
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the parent order id from order-received').toBeTruthy();

        const api = new ApiUtils(await request.newContext());
        const [, order] = await api.getSingleOrder(orderId as string, payloads.adminAuth);
        const intentId = (order.meta_data ?? []).find((m: { key: string }) => m.key === '_stripe_intent_id' || m.key === 'dokan_stripe_intent_id')?.value;
        expect(intentId, 'order carries the Stripe PaymentIntent id').toBeTruthy();
        const chargeId = await stripeApi.getLatestChargeId(String(intentId));

        // CORRECT invariant: BOTH connected vendors receive exactly one transfer off this charge.
        // The bug fails the second-processed vendor's transfer (source amount exceeded), leaving them 0.
        await expect
            .poll(async () => (await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor1)).length, {
                message: 'vendor1 must receive a transfer even under a marketplace coupon', timeout: 25_000,
            })
            .toBe(1);
        await expect
            .poll(async () => (await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor2)).length, {
                message: 'vendor2 must receive a transfer even under a marketplace coupon', timeout: 25_000,
            })
            .toBe(1);
        log.success('BUG-35: both vendors received a transfer under a marketplace coupon (split handled the over-commission discount)');
    });
});
