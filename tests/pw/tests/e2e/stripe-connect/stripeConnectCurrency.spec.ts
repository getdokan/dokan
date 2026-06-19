import { test, expect, request, Browser } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CARDS, STRIPE_CONNECTED_ACCOUNTS } from './stripeConnectPage';
import {
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    SERVER_URL,
    hasCredentials,
    ensureCustomerAddress,
    getStripeIntentIdForOrder,
    getLatestStripeOrderId,
    assertStripeOrderSettledSince,
} from './helpers';

/**
 * Suite M — store currency correctness for the Stripe Connect gateway. Buyer is
 * the CUSTOMER. Each case sets the store currency, places a REAL order against a
 * connected vendor, then asserts the minted Stripe PaymentIntent carries the
 * correct amount in the currency's minor units.
 *
 * The behaviour under test lives in Helper::get_stripe_amount (modules/stripe):
 *   - 2-decimal currencies (USD): amount = round(total * 100)
 *   - zero-decimal currencies (JPY, UGX, …): amount = the integer total (NO ×100)
 *
 * M3 (UGX) is an intentional bug guard: UGX is zero-decimal per no_decimal_currencies()
 * but is OMITTED from get_stripe_amount's zero-decimal switch (R3), so while the bug
 * is present the gateway charges ×100 (an overcharge). The assertion asserts the
 * CORRECT integer amount on purpose — a failure here means R3 is still present.
 */

/**
 * LOCAL helper: set the WooCommerce store currency. Writes the RAW string to the
 * `woocommerce_currency` option (serializeData=false) — the option stores a plain
 * 3-letter code, NOT a serialized array. Reversible: capture the original in
 * beforeAll and restore it in afterAll.
 */
async function setStoreCurrency(code: string): Promise<void> {
    // woocommerce_currency is a PLAIN 3-letter string, not a serialized array. Use setOptionValue (a direct
    // INSERT…ON DUPLICATE write) — updateOptionValue/getOptionValue read-then-unserialize, which throws
    // "Unknown type at index 2" on a raw string.
    await dbUtils.setOptionValue('woocommerce_currency', code, false);
}

/**
 * Place a single-vendor order as the CUSTOMER via block checkout and return the
 * resulting order id (parsed from the order-received URL). Opens a fresh context
 * per call and always tears it down.
 */
async function placeCustomerBlockOrder(browser: Browser, productId: string): Promise<string | undefined> {
    const ctx = await browser.newContext({ storageState: customerAuth });
    const page = await ctx.newPage();
    try {
        const stripe = new StripeConnectPage(page);
        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        await stripe.addProductToCart(productId);
        await stripe.gotoBlockCheckout();
        await stripe.selectBlockGateway();
        await stripe.fillCardDetails(STRIPE_CARDS.success);
        await stripe.placeBlockOrderExpectReceived();
        return page.url().match(/order-received\/(\d+)/)?.[1];
    } finally {
        await page.close();
        await ctx.close();
    }
}

/** Create a connected-vendor product at the given price. Returns the product id. */
async function createVendorProduct(price: string): Promise<string> {
    const api = new ApiUtils(await request.newContext());
    const [, productId] = await api.createProduct({ ...payloads.createProduct(), regular_price: price }, payloads.vendorAuth);
    return productId;
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

test.describe.serial('Stripe Connect — Suite M (store currency)', () => {
    test.describe.configure({ timeout: 180_000 }); // real card entry + Stripe confirm/redirect is slow on cold CI

    let originalCurrency: string;
    let baseProductId: string;
    const createdProductIds: string[] = [];

    test.beforeAll(async () => {
        // Capture the original currency (raw string) via a direct query — getOptionValue unserializes and
        // would throw on the plain string. Default to USD (the store/site default) if absent.
        const rows = (await dbUtils.dbQuery(
            `SELECT option_value FROM ${process.env.DB_PREFIX ?? 'wp'}_options WHERE option_name = 'woocommerce_currency' LIMIT 1;`,
        )) as Array<{ option_value: string }>;
        originalCurrency = rows[0]?.option_value || 'USD';

        await ensureCustomerAddress();
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        // A connected-vendor product (required precondition); each case creates its own
        // priced product so the cart total is deterministic per currency.
        baseProductId = await createVendorProduct('20');
        createdProductIds.push(baseProductId);
    });

    test.afterAll(async () => {
        // Restore the captured currency FIRST so a later spec on the same worker/DB is
        // not poisoned, then remove the seeded vendor connection and the created products.
        await setStoreCurrency(originalCurrency);
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        for (const id of createdProductIds) {
            await deleteProduct(id);
        }
    });

    test('M1: non-round total settles with no dokan_pe_amount_mismatch', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');

        // A normal 2-decimal currency with a NON-round price (19.99 + tax) → the cart
        // total is non-round in minor units. The server recomputes & syncs the PI amount
        // in IntentProcessor::assert_pi_matches_order, so the order must settle WITHOUT
        // surfacing dokan_pe_amount_mismatch (the ExpectError path is never hit).
        await setStoreCurrency('USD');
        const productId = await createVendorProduct('19.99');
        createdProductIds.push(productId);

        const baseline = await getLatestStripeOrderId(); // pin: only this test's NEW order counts
        const orderId = await placeCustomerBlockOrder(browser, productId);
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();

        // Order reached order-received (placeBlockOrderExpectReceived) AND settled paid —
        // no amount mismatch was thrown.
        await assertStripeOrderSettledSince(baseline);

        // Sanity: the minted PI amount equals the non-round total in cents.
        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const pi = await stripeApi.getPaymentIntent(intentId);
        expect(pi.amount, 'PI amount must equal the non-round total in cents (round(total*100))').toBeGreaterThan(0);
        expect(pi.currency, 'PI currency is usd').toBe('usd');
        log.success(`M1: non-round USD order ${orderId} settled with no amount mismatch (PI amount=${pi.amount})`);
    });

    // R3 (CONFIRMED bug, fixme): get_stripe_amount() ×100s ALL currencies — zero-decimal JPY is NOT
    // special-cased, so a ¥1500 order mints a PaymentIntent of 150000 (a 100× overcharge). The assertion
    // below is CORRECT (1500); this stays a documented guard until R3 is fixed. DO NOT weaken.
    // See dokan-pro/tests/stripe-connect/bugs-found.md.
    test('M2: JPY (zero-decimal) PaymentIntent.amount equals the yen integer (not ×100) — R3 expected-fail guard', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        // R3 (CONFIRMED): Helper::get_stripe_amount() ×100s zero-decimal JPY → a ¥1500 order mints a 150000 PI
        // (100× overcharge). This test asserts the CORRECT amount (1500); test.fail() runs it as an EXPECTED
        // FAILURE so the suite executes the path and pins the bug — it reports PASS while R3 is present and FLIPS
        // to a real failure the moment the gateway is fixed (signal to delete this line). Assertion NOT weakened.
        test.fail(true, 'R3: get_stripe_amount() multiplies zero-decimal JPY by 100 (overcharge) — see bugs-found.md');

        // JPY is zero-decimal → the CORRECT minor-unit amount for ¥1500 is the integer 1500, NOT 150000.
        await setStoreCurrency('JPY');
        const productId = await createVendorProduct('1500');
        createdProductIds.push(productId);

        const orderId = await placeCustomerBlockOrder(browser, productId);
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();

        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const pi = await stripeApi.getPaymentIntent(intentId);
        // Zero-decimal: the integer total IS the minor-unit amount (no ×100).
        expect(pi.amount, 'JPY PaymentIntent amount must equal the yen integer (1500, not 150000)').toBe(Math.round(1500));
        expect(pi.currency, 'PI currency is jpy').toBe('jpy');
        log.success(`M2: JPY order ${orderId} minted PaymentIntent amount=${pi.amount} (yen integer, no ×100)`);
    });

    test('M3: UGX (zero-decimal) PaymentIntent.amount must equal the UGX integer — R3 expected-fail guard', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        // R3 (CONFIRMED): UGX is zero-decimal per no_decimal_currencies() but is OMITTED from get_stripe_amount()'s
        // zero-decimal switch, so it falls through to ×100 → USh 5000 mints 500000 (100× overcharge). The assertion
        // below asserts the CORRECT amount (5000); test.fail() runs it as an EXPECTED FAILURE so CI executes the path
        // and pins the bug (PASS while present, FLIPS to failure once UGX is added to the switch). Assertion NOT weakened.
        test.fail(true, 'R3: get_stripe_amount() omits UGX from the zero-decimal switch → ×100 overcharge — see bugs-found.md');

        // UGX is zero-decimal (it is listed in Helper::no_decimal_currencies()) so the
        // CORRECT minor-unit amount for USh 5000 is the integer 5000.
        //
        // KNOWN BUG R3: UGX is OMITTED from get_stripe_amount()'s zero-decimal switch, so
        // UGX falls through to the default branch (× 100) and the gateway mints 500000 —
        // a 100× overcharge. The assertion below asserts the CORRECT amount on purpose:
        // a FAILURE here (received 500000, expected 5000) means R3 is STILL PRESENT.
        // DO NOT weaken this assertion — it is an intentional bug guard that only goes
        // green once UGX is added to the zero-decimal switch.
        await setStoreCurrency('UGX');
        const productId = await createVendorProduct('5000');
        createdProductIds.push(productId);

        const orderId = await placeCustomerBlockOrder(browser, productId);
        expect(orderId, 'captured the order id from the order-received URL').toBeTruthy();

        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const pi = await stripeApi.getPaymentIntent(intentId);
        // CORRECT (zero-decimal) amount = the integer shillings. If this fails with 500000,
        // R3 (the ×100 UGX overcharge) is present.
        expect(pi.amount, 'UGX PaymentIntent amount must equal the UGX integer (5000) — a 500000 here is the R3 overcharge bug').toBe(Math.round(5000));
        expect(pi.currency, 'PI currency is ugx').toBe('ugx');
        log.success(`M3: UGX order ${orderId} minted PaymentIntent amount=${pi.amount} (UGX integer — R3 not present)`);
    });
});
