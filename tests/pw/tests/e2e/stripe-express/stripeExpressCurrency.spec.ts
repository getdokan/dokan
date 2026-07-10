import { test, expect, request, Browser, Page } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeExpressPage, STRIPE_CARDS, STRIPE_EXPRESS_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    hasCredentials,
    HAS_REAL_CONNECTED_ACCOUNTS,
    ensureStripeExpressConfigured,
    ensureCustomerAddress,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
    getStripeChargeIdForOrder,
    setOrderStatus,
} from './helpers';

// The suite's strict tsconfig doesn't pull in @types/node — declare process locally
// (same pattern the page object + stripeApi use) for the DB_PREFIX read below.
declare const process: { env: Record<string, string | undefined> };

/**
 * SE-CUR — Stripe Express currency & amount invariants (SE-CUR-01..05).
 *
 * Buyer is the CUSTOMER. Each case sets the WooCommerce store currency, places a REAL
 * order against a connected vendor through block checkout, then asserts MONEY TRUTH against
 * the Stripe API (the Express gateway charges on the PLATFORM, so the platform charge object
 * is the proof of the captured amount). The Stripe API — not the WP UI — is the source of truth.
 *
 * Express uses the SEPARATE charges-and-transfers model: the customer is charged on the
 * platform, and the vendor is paid by a standalone Transfer carrying source_transaction =
 * the platform charge id. disburse_mode is ON_ORDER_COMPLETED, so the split cases move the
 * order to "completed" before asserting the Transfer.
 *
 * Amount invariants under test:
 *   - 2-decimal currencies (USD): charge.amount === round(total * 100), no rounding drift.
 *   - true zero-decimal currencies (JPY): charge.amount === the integer total (NO ×100).
 *   - UGX is parked (see SE-CUR-03): it is a Stripe ×100 SPECIAL-CASE, so the "integer"
 *     premise is disproven — it must not run as a false bug report.
 *
 * Serial: every case mutates the GLOBAL woocommerce_currency option. The original code is
 * captured in beforeAll and restored in afterAll so a later spec on the same worker/DB is
 * not poisoned. Charge/checkout cases gate !hasCredentials; the transfer-reconciliation
 * split cases (SE-CUR-04/05) additionally gate !HAS_REAL_CONNECTED_ACCOUNTS.
 */

// Stripe true zero-decimal currencies — a real store configures these with 0 price decimals,
// and Stripe's `amount` is the integer (no ×100). (UGX is a Stripe ×100 special-case and stays
// parked in SE-CUR-03, so it is intentionally NOT here.)
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW', 'VND', 'CLP', 'XAF', 'XOF', 'PYG']);

/**
 * Set the WooCommerce store currency AND its price decimals to match (0 for true zero-decimal
 * currencies, else 2) — exactly how a real store is configured. Without setting the decimals,
 * WC keeps 2-decimal totals for JPY (e.g. 1585.50) while Stripe correctly charges the integer
 * yen, producing a spurious ±1 mismatch. Both options store PLAIN values (serializeData=false);
 * getOptionValue would unserialize-throw on the bare string, hence the raw capture in beforeAll.
 */
async function setStoreCurrency(code: string): Promise<void> {
    await dbUtils.setOptionValue('woocommerce_currency', code, false);
    await dbUtils.setOptionValue('woocommerce_price_num_decimals', ZERO_DECIMAL_CURRENCIES.has(code) ? '0' : '2', false);
}

/** Create a connected-vendor product at the given price. Returns the product id. */
async function createVendorProduct(price: string): Promise<string> {
    const api = new ApiUtils(await request.newContext());
    try {
        const [, productId] = await api.createProduct({ ...payloads.createProduct(), regular_price: price }, payloads.vendorAuth);
        return productId;
    } finally {
        await api.dispose();
    }
}

/** Trash a product (admin auth) — best-effort cleanup. */
async function deleteProduct(productId: string | undefined): Promise<void> {
    if (!productId) {
        return;
    }
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
    } finally {
        await ctx.dispose();
    }
}

/** Read a WC order's grand total as a number (admin auth). */
async function getOrderTotal(orderId: string): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=total`);
        const body = (await res.json()) as { total: string };
        return parseFloat(body.total);
    } finally {
        await ctx.dispose();
    }
}

/**
 * Create a PERCENT coupon SCOPED to the given product. Dokan marketplace rules reject an
 * unscoped admin fixed_cart coupon on a vendor product ("coupon is not applicable to selected
 * products" — verified live), so the coupon must be product-scoped to actually apply. Returns id + code.
 */
async function createCouponRest(percentAmount: string, productId: string): Promise<{ couponId: number; code: string }> {
    const code = `expresscur${Date.now()}`;
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.post(`${SERVER_URL}/wc/v3/coupons`, {
            data: { code, discount_type: 'percent', amount: percentAmount, product_ids: [Number(productId)] },
        });
        if (!res.ok()) {
            throw new Error(`create coupon failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
        const body = (await res.json()) as { id: number };
        return { couponId: body.id, code };
    } finally {
        await ctx.dispose();
    }
}

/** Read a WC order's discount_total as a number (admin auth) — proves a coupon discount applied. */
async function getOrderDiscountTotal(orderId: string): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=discount_total`);
        const body = (await res.json()) as { discount_total: string };
        return parseFloat(body.discount_total || '0');
    } finally {
        await ctx.dispose();
    }
}

/** Delete a coupon (admin auth) — best-effort cleanup. */
async function deleteCouponRest(couponId: number): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.delete(`${SERVER_URL}/wc/v3/coupons/${couponId}?force=true`).catch(() => undefined);
    } finally {
        await ctx.dispose();
    }
}

/**
 * Enable taxes + create a US tax rate and a US-scoped flat-rate shipping zone (admin auth).
 * GLOBAL WooCommerce state — only invoked inside the SE-CUR-05 body (after its !HAS_REAL skip)
 * and always torn down in a finally, so it never mutates the store when the case is skipped.
 */
async function setupShippingAndTax(): Promise<{ zoneId: number; taxId: number }> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.post(`${SERVER_URL}/wc/v3/settings/general/woocommerce_calc_taxes`, { data: { value: 'yes' } });
        const taxRes = await ctx.post(`${SERVER_URL}/wc/v3/taxes`, { data: { country: 'US', rate: '10.0000', name: 'Express CUR Tax', shipping: true } });
        const tax = (await taxRes.json()) as { id: number };
        const zoneRes = await ctx.post(`${SERVER_URL}/wc/v3/shipping/zones`, { data: { name: 'Express CUR Zone' } });
        const zone = (await zoneRes.json()) as { id: number };
        await ctx.put(`${SERVER_URL}/wc/v3/shipping/zones/${zone.id}/locations`, { data: [{ code: 'US', type: 'country' }] });
        const methodRes = await ctx.post(`${SERVER_URL}/wc/v3/shipping/zones/${zone.id}/methods`, { data: { method_id: 'flat_rate' } });
        const method = (await methodRes.json()) as { instance_id: number };
        await ctx.put(`${SERVER_URL}/wc/v3/shipping/zones/${zone.id}/methods/${method.instance_id}`, { data: { settings: { cost: '10.00' } } });
        return { zoneId: zone.id, taxId: tax.id };
    } finally {
        await ctx.dispose();
    }
}

/** Undo setupShippingAndTax: drop the zone + tax rate and disable taxes again (best-effort). */
async function teardownShippingAndTax(ids: { zoneId: number; taxId: number }): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.delete(`${SERVER_URL}/wc/v3/shipping/zones/${ids.zoneId}?force=true`).catch(() => undefined);
        await ctx.delete(`${SERVER_URL}/wc/v3/taxes/${ids.taxId}?force=true`).catch(() => undefined);
        await ctx.post(`${SERVER_URL}/wc/v3/settings/general/woocommerce_calc_taxes`, { data: { value: 'no' } }).catch(() => undefined);
    } finally {
        await ctx.dispose();
    }
}

/** Apply a coupon at the WC block checkout (inline — the page object exposes no coupon UI). */
async function applyBlockCoupon(page: Page, code: string): Promise<void> {
    // The coupon UI is a collapsible panel: a panel toggle ("Add a coupon") that expands the
    // coupon form (input id `#wc-block-components-totals-coupon__input-0`) + an Apply button.
    // Selectors mirror the proven Stripe Connect block-coupon flow on the same WC Checkout block.
    const toggle = page.locator('.wc-block-components-totals-coupon__button, .wc-block-components-panel__button').filter({ hasText: /coupon/i }).first();
    if (await toggle.isVisible().catch(() => false)) {
        await toggle.click().catch(() => undefined);
    }
    const input = page.locator('#wc-block-components-totals-coupon__input-0, .wc-block-components-totals-coupon__input input, input[id*="coupon"]').first();
    await input.waitFor({ state: 'visible', timeout: 15_000 });
    await input.fill(code);
    await page.locator('.wc-block-components-totals-coupon__button:has-text("Apply"), button:has-text("Apply")').first().click();
    // Wait for the Store-API coupon round-trip to recalculate the cart totals before the PE re-mounts.
    await page.waitForResponse(r => /apply-coupon|batch|\/cart/i.test(r.url()) && r.request().method() === 'POST', { timeout: 20_000 }).catch(() => undefined);
    await page.waitForTimeout(2_000);
}

/**
 * Place a single-vendor order as the CUSTOMER via block checkout and return the resulting
 * order id (parsed from the order-received URL). Opens a fresh context per call (so the new
 * store currency is picked up) and always tears it down. `onCheckout` runs after the checkout
 * loads and before the gateway is selected (used to apply a coupon).
 */
async function placeCustomerBlockOrder(browser: Browser, productId: string, onCheckout?: (page: Page) => Promise<void>): Promise<string | undefined> {
    const ctx = await browser.newContext({ storageState: customerAuth });
    const page = await ctx.newPage();
    try {
        const stripe = new StripeExpressPage(page);
        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        await stripe.addProductToCart(productId);
        await stripe.gotoBlockCheckout();
        if (onCheckout) {
            await onCheckout(page);
        }
        await stripe.selectBlockGateway();
        await stripe.fillCardDetails(STRIPE_CARDS.success);
        await stripe.placeBlockOrderExpectReceived();
        return page.url().match(/order-received\/(\d+)/)?.[1];
    } finally {
        await page.close();
        await ctx.close();
    }
}

test.describe.serial('Stripe Express — SE-CUR (currency & amount invariants) @pro', () => {
    test.describe.configure({ timeout: 180_000 }); // real card entry + Stripe confirm/redirect is slow on cold CI

    let originalCurrency: string;
    const createdProductIds: string[] = [];

    test.beforeAll(async () => {
        // Capture the original currency (raw string) via a direct query — getOptionValue would
        // unserialize-throw on the plain 3-letter code. Default to USD (the store/suite default).
        const rows = (await dbUtils.dbQuery(
            `SELECT option_value FROM ${process.env.DB_PREFIX ?? 'wp'}_options WHERE option_name = 'woocommerce_currency' LIMIT 1;`,
        )) as Array<{ option_value: string }>;
        originalCurrency = rows[0]?.option_value || 'USD';

        await ensureStripeExpressConfigured();
        await ensureCustomerAddress();
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
    });

    test.afterAll(async () => {
        // Restore the captured currency FIRST so a later spec on the same worker/DB is not
        // poisoned, then remove the seeded vendor connection and the created products.
        await setStoreCurrency(originalCurrency);
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        for (const id of createdProductIds) {
            await deleteProduct(id);
        }
    });

    test('SE-CUR-01: a non-round USD total → captured charge amount equals the order total in cents (no rounding drift)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive a real charge');

        await setStoreCurrency('USD');
        const productId = await createVendorProduct('12.37');
        createdProductIds.push(productId);

        const orderId = await placeCustomerBlockOrder(browser, productId);
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();
        const id = orderId as string;

        const total = await getOrderTotal(id);
        const charge = await stripeApi.getCharge(await getStripeChargeIdForOrder(id));
        // The MOTIVE: a non-round total charges with NO rounding drift. The order total is the
        // product price ($12.37) PLUS the suite's store-wide tax + flat-rate shipping, so the bare
        // 1237 is not the captured amount — the invariant is charge == the ORDER TOTAL in cents.
        expect(charge.amount, 'captured charge amount must equal the order total in cents (round(total*100), no drift)').toBe(Math.round(total * 100));
        expect(total % 1, 'the total under test is genuinely non-round (has a fractional part)').not.toBe(0);
        expect(charge.currency, 'charge currency is usd').toBe('usd');
        log.success(`SE-CUR-01: non-round USD order ${id} charged ${charge.amount} cents (== order total ${total})`);
    });

    test('SE-CUR-02: a zero-decimal JPY total → charge amount equals the yen integer (NOT ×100)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive a real charge');

        // JPY is a TRUE zero-decimal currency: ¥1500 must charge amount=1500, NOT 150000. The
        // correct invariant is asserted live (no test.fail) so a 150000 result FAILS LOUDLY as a
        // ×100 zero-decimal bug. (Catalog SE-CUR-02: only pin with test.fail once the ×100 bug is
        // confirmed present in Express — do NOT pre-weaken a passing correct assertion.)
        await setStoreCurrency('JPY');
        const productId = await createVendorProduct('1500');
        createdProductIds.push(productId);

        const orderId = await placeCustomerBlockOrder(browser, productId);
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();
        const id = orderId as string;

        const total = await getOrderTotal(id);
        const charge = await stripeApi.getCharge(await getStripeChargeIdForOrder(id));
        // Zero-decimal: Stripe's amount for JPY is the INTEGER yen total (no ×100). The total is the
        // ¥ product price PLUS the suite's tax + shipping (also in yen), so assert against the real
        // order total — a ×100 result (e.g. 166100 for a ¥1661 total) would FAIL LOUDLY as the bug.
        expect(Math.abs(charge.amount - Math.round(total)), 'JPY charge is the integer yen total (zero-decimal; ±1 sub-unit rounding tolerated)').toBeLessThanOrEqual(1);
        expect(charge.amount, 'JPY amount must NOT be the ×100 zero-decimal bug value (e.g. 158500)').not.toBe(Math.round(total * 100));
        expect(charge.currency, 'charge currency is jpy').toBe('jpy');
        log.success(`SE-CUR-02: JPY order ${id} charged amount=${charge.amount} (yen integer ≈ total ${total}, no ×100)`);
    });

    test('SE-CUR-03: a zero-decimal UGX total → charge amount equals the UGX integer (NOT ×100)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive a real charge');

        // UGX is listed zero-decimal in WooCommerce, BUT Stripe treats UGX as a ×100 SPECIAL-CASE:
        // verified live in the analogous Stripe Connect suite (BUG-2/UGX was WITHDRAWN because a real
        // USh charge read 12000 as "120.00 USh" — i.e. ×100 is CORRECT for UGX). The "integer" premise
        // below is therefore the DISPROVEN expectation; parked (fixme) rather than run as a test that
        // would FALSE-report a bug on correct ×100 behaviour. Needs live Express validation to decide:
        // un-park as integer (if Express is true zero-decimal) or invert to ×100 (Stripe special-case).
        test.fixme(true, 'UGX is a Stripe ×100 special-case (integer premise disproven live for Connect); parked pending Express live validation — flag to dev.');

        await setStoreCurrency('UGX');
        const productId = await createVendorProduct('5000');
        createdProductIds.push(productId);

        const orderId = await placeCustomerBlockOrder(browser, productId);
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();
        const id = orderId as string;

        const charge = await stripeApi.getCharge(await getStripeChargeIdForOrder(id));
        expect(charge.amount, 'UGX charge amount must equal the UGX integer (5000, not 500000)').toBe(Math.round(5000));
        expect(charge.currency, 'charge currency is ugx').toBe('ugx');
        log.success(`SE-CUR-03: UGX order ${id} charged amount=${charge.amount}`);
    });

    test('SE-CUR-04: a coupon discount → charge equals the discounted total and the vendor transfer reflects the discounted earning', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'No real connected accounts — set STRIPE_EXPRESS_VENDOR1_ACCT to assert the discounted vendor transfer');

        await setStoreCurrency('USD');
        const price = '20';
        const productId = await createVendorProduct(price);
        createdProductIds.push(productId);
        const { couponId, code } = await createCouponRest('25', productId); // 25% off → $5 discount
        try {
            const orderId = await placeCustomerBlockOrder(browser, productId, page => applyBlockCoupon(page, code));
            expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();
            const id = orderId as string;

            const total = await getOrderTotal(id);
            // The suite's store-wide tax + shipping can push the discounted total above the bare price,
            // so assert the DISCOUNT was actually applied (discount_total > 0), not total < price.
            const discountTotal = await getOrderDiscountTotal(id);
            expect(discountTotal, 'the coupon discount was applied to the order (discount_total > 0)').toBeGreaterThan(0);

            const chargeId = await getStripeChargeIdForOrder(id);
            const charge = await stripeApi.getCharge(chargeId);
            expect(charge.amount, 'charge amount must equal the DISCOUNTED total in cents').toBe(Math.round(total * 100));
            expect(charge.currency, 'charge currency is usd').toBe('usd');

            // disburse_mode is ON_ORDER_COMPLETED — complete the order, then the Transfer fires.
            await setOrderStatus(id, 'completed');
            await expect
                .poll(async () => (await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1)).length, {
                    message: 'a Transfer should reach the connected vendor after the order completes',
                    timeout: 60_000,
                })
                .toBeGreaterThan(0);
            const transfers = await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
            const transferred = transfers.reduce((sum: number, t) => sum + Number(t.amount), 0);
            expect(transferred, 'the vendor earned a positive transfer on the discounted order').toBeGreaterThan(0);
            expect(transferred, 'Σ transfers never exceeds the discounted charge (no over-transfer)').toBeLessThanOrEqual(charge.amount);
            log.success(`SE-CUR-04: discounted order ${id} charged ${charge.amount} cents; vendor transfer=${transferred} cents`);
        } finally {
            await deleteCouponRest(couponId);
        }
    });

    test('SE-CUR-05: tax + shipping → charge reconciles to the tax/shipping-inclusive total and the vendor transfer reconciles', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!HAS_REAL_CONNECTED_ACCOUNTS, 'No real connected accounts — set STRIPE_EXPRESS_VENDOR1_ACCT to assert the reconciled vendor transfer');

        await setStoreCurrency('USD');
        const price = '20';
        const productId = await createVendorProduct(price);
        createdProductIds.push(productId);
        const ids = await setupShippingAndTax();
        try {
            const orderId = await placeCustomerBlockOrder(browser, productId);
            expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();
            const id = orderId as string;

            const total = await getOrderTotal(id);
            expect(total, 'tax + shipping were added on top of the product price').toBeGreaterThan(parseFloat(price));

            const chargeId = await getStripeChargeIdForOrder(id);
            const charge = await stripeApi.getCharge(chargeId);
            expect(charge.amount, 'charge amount must reconcile to the tax/shipping-inclusive total in cents').toBe(Math.round(total * 100));
            expect(charge.currency, 'charge currency is usd').toBe('usd');

            await setOrderStatus(id, 'completed');
            await expect
                .poll(async () => (await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1)).length, {
                    message: 'a Transfer should reach the connected vendor after the order completes',
                    timeout: 60_000,
                })
                .toBeGreaterThan(0);
            const transfers = await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
            const transferred = transfers.reduce((sum: number, t) => sum + Number(t.amount), 0);
            expect(transferred, 'the vendor earned a positive transfer on the tax+shipping order').toBeGreaterThan(0);
            expect(transferred, 'Σ transfers never exceeds the charge — fee recipients reconcile, no over-transfer').toBeLessThanOrEqual(charge.amount);
            log.success(`SE-CUR-05: tax+shipping order ${id} charged ${charge.amount} cents (total ${total}); vendor transfer=${transferred} cents`);
        } finally {
            await teardownShippingAndTax(ids);
        }
    });
});
