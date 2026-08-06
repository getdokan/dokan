import { test, expect, request } from '@utils/test';
import type { Browser, BrowserContext, Page } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { PayPalMarketplacePage, PAYPAL_IDS } from './paypalMarketplacePage';
import {
    adminAuth,
    customerAuth,
    VENDOR_ID,
    VENDOR2_ID,
    CUSTOMER_ID,
    PAYPAL_MERCHANTS,
    SEEDED_MERCHANT_SENTINEL,
    hasCredentials,
    ensurePayPalConfigured,
    getPayPalStatus,
    seedPayPalConnectedVendor,
    ensureCustomerAddress,
    ensureClassicCheckoutPage,
    adminContext,
    readGatewaySettings,
} from './helpers';

/* Selectors live on the page object (SKILL non-negotiable #1: selectors belong in
 * `<slug>Page.ts`). These aliases keep the existing in-file names readable. */
const CHECKOUT = PayPalMarketplacePage.classic;

// The suite tsconfig is strict and does not pull @types/node — declare what this file reads.
declare const process: { env: Record<string, string | undefined> };

/**
 * PayPal Marketplace — currency support (PP-CUR-01 … PP-CUR-10).
 *
 * The module ships a hard 24-currency allow list (`Helper::get_supported_currencies()`,
 * Helper.php:389-418) and switches the gateway off for anything outside it. Almost every case
 * here is therefore config-level, which is why the area is reachable without ever moving money.
 *
 * ── The trap this area exists to avoid ────────────────────────────────────────────────────────
 * `get_supported_currencies()` returns a MAP KEYED BY CURRENCY CODE — `'USD' => 'United States
 * dollar'`. The product tests membership with `array_key_exists()` (PayPal.php:171). A spec that
 * reaches for `in_array()` / `toContain()` on the returned array is searching the VALUES, i.e. the
 * currency NAMES, and reports "USD is not supported" on a perfectly healthy site. Every membership
 * assertion below goes through `supported_codes` (the server-side `array_keys()`) or an explicit
 * `Object.keys()`, never a value search.
 *
 * ── Why this file talks to a test-only mu-plugin ──────────────────────────────────────────────
 * Three cases (PP-CUR-05/06/07) ask what the module SENDS to PayPal. The only other way to see
 * that string is a live `POST /v2/checkout/orders`, which needs the money path this suite has
 * never proven and would answer a currency question with a network result. `mu-plugins/
 * dokan-paypal-marketplace-currency-test-helpers.php` exposes two routes in the existing
 * `dokan-test-paypal/v1` namespace:
 *
 *   - `GET  /currency-support` — the module's own allow lists plus the gateway's RUNTIME `enabled`
 *     flag and `is_valid_for_use()`.
 *   - `POST /purchase-units`   — `OrderManager::make_purchase_unit_data()` for every sub order,
 *     which is the product's amount builder with the transport removed.
 *
 * ── Site-wide mutation ────────────────────────────────────────────────────────────────────────
 * The store currency is a GLOBAL option. It is captured raw in `beforeAll`, reset in `afterEach`
 * (not only `afterAll`) and restored to the captured value at the end. A case that dies
 * mid-mutation would otherwise hand every later PayPal spec on this worker a store trading in
 * rupees or yen, and those specs would then fail for a reason that has nothing to do with them.
 * `dokan_e2e_paypal_extra_currency` — the opt-in flag behind PP-CUR-09's filter — is cleared on
 * the same schedule and for the same reason.
 *
 * `woocommerce_price_num_decimals` is deliberately LEFT AT 2 even for the zero-decimal cases.
 * Dropping it to 0 would hand the module whole numbers and the rounding path under test would
 * never execute; a real JPY store still accumulates fractional tax, and that is exactly the input
 * `format_amount_for_currency()` (OrderManager.php:54-68) exists to handle.
 *
 * Never `test.describe.serial`, never tagged `@serial`: `.serial` aborts the whole group on the
 * first failure (46 of 68 cases vanished that way on 2026-07-31 while the run still summarised as
 * green), and `@serial` is grepInverted out of BOTH CI lanes at playwright.config.ts:13.
 */

/* ------------------------------------------------------------------ */
/* Options + currencies under test                                     */
/* ------------------------------------------------------------------ */

const CURRENCY_OPTION = 'woocommerce_currency';

/** Opt-in flag read by the test mu-plugin's `dokan_paypal_supported_currencies` callback. */
const INJECTED_CURRENCY_OPTION = 'dokan_e2e_paypal_extra_currency';

/** The suite/store baseline, and a member of the allow list. */
const SUPPORTED_CURRENCY = 'USD';

/**
 * A second SUPPORTED currency, used where a case has to prove that the payload currency follows
 * the store rather than the payee. EUR is in the allow list (Helper.php:395).
 */
const SUPPORTED_ALT_CURRENCY = 'EUR';

/**
 * Outside the 24-currency allow list. INR is chosen over an invented code because it is a real
 * currency WooCommerce offers, so the store stays in a state an admin could actually reach —
 * `payments.spec.ts` already switches the same store to INR.
 */
const UNSUPPORTED_CURRENCY = 'INR';

/**
 * Zero-decimal, and supported. JPY appears in BOTH lists that matter: the 24-currency allow list
 * (Helper.php:404) and the module's own no-decimal set (OrderManager.php:30-43, alongside HUF and
 * TWD). A currency in only one of the two would test half the path.
 */
const ZERO_DECIMAL_CURRENCY = 'JPY';

/** Classic `[woocommerce_checkout]` shortcode page — `ensureClassicCheckoutPage()` creates it. */

/** Single-site persistent-cart user meta — the exact row `dbUtils.clearCustomerCart()` deletes. */
const PERSISTENT_CART_META = '_woocommerce_persistent_cart_1';

/** Same fallback the other PayPal specs use, so a missing env var does not silently query `_usermeta`. */
const DB_PREFIX = process.env.DB_PREFIX ?? 'wp';

/* ------------------------------------------------------------------ */
/* Mu-plugin transport                                                 */
/* ------------------------------------------------------------------ */

const TEST_NS = `${SERVER_URL}/dokan-test-paypal/v1`;

/**
 * ponytail: a local twin of the private `testRequest()` in helpers.ts rather than an export added
 * to that file. Several agents are extending this suite at the same time and helpers.ts is the
 * one file all of them touch, so an append there risks a lost write; these two wrappers are also
 * PP-CUR-only today. Upgrade path: lift `currencySupport()` and `purchaseUnitsFor()` into
 * helpers.ts once the split (PP-SPL) and checkout (PP-CHK) areas want the same purchase-unit view.
 *
 * `extraHTTPHeaders` is set EXPLICITLY. Omitting it makes `request.newContext()` inherit the
 * shared config's admin Basic auth, which is right here by luck and wrong the moment a probe is
 * meant to be logged out.
 */
async function testRequest<T>(method: 'get' | 'post', route: string, data?: Record<string, unknown>): Promise<T> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = method === 'get' ? await ctx.get(`${TEST_NS}${route}`) : await ctx.post(`${TEST_NS}${route}`, { data });
        if (!res.ok()) {
            throw new Error(`${route} failed (${res.status()}): ${(await res.text()).slice(0, 300)}`);
        }
        return (await res.json()) as T;
    } finally {
        await ctx.dispose();
    }
}

interface CurrencySupport {
    ok: boolean;
    skipped?: string;
    store_currency: string;
    /** The MAP the product builds — keyed by code, valued by NAME. */
    supported_currencies: Record<string, string>;
    /** `array_keys()` of the map, computed server-side so no spec has to guess the shape. */
    supported_codes: string[];
    /** Flat LIST of codes — the SAME filter name, a different shape. See PP-CUR-09. */
    ucc_non_us_currencies: unknown;
    ucc_us_currencies: unknown;
    /** `$gateway->enabled` AFTER the constructor ran — PayPal.php:110-111. */
    gateway_enabled_runtime: string | null;
    /** `enabled` as STORED in the settings option. Can legitimately disagree with the line above. */
    option_enabled: string | null;
    is_valid_for_use: boolean | null;
    injected_currency: string;
}

interface Money {
    currency_code: string;
    value: string;
}

interface PurchaseUnit {
    reference_id: string;
    amount: { currency_code: string; value: string; breakdown: Record<string, Money> };
    payee: { merchant_id: string };
    items?: Array<{ name: string; unit_amount: Money; quantity: number }>;
    payment_instruction: { disbursement_mode: string; platform_fees: Array<{ amount: Money }> };
    invoice_id: number;
    custom_id: number;
}

interface PurchaseUnitsResult {
    ok: boolean;
    order_id: number;
    /** Snapshotted on the order at creation. */
    order_currency: string;
    order_total: string;
    /** What `make_purchase_unit_data()` actually reads (OrderManager.php:161). */
    store_currency: string;
    sub_order_ids: number[];
    units: Array<{ sub_order_id: number; seller_id: number; order_total: string; purchase_unit: PurchaseUnit }>;
}

const currencySupport = () => testRequest<CurrencySupport>('get', '/currency-support');

const purchaseUnitsFor = (orderId: number) => testRequest<PurchaseUnitsResult>('post', '/purchase-units', { order_id: orderId });

/* ------------------------------------------------------------------ */
/* Store state                                                         */
/* ------------------------------------------------------------------ */

/**
 * Read the store currency as the RAW string it is.
 *
 * `dbUtils.getOptionValue()` calls php-serialize's `unserialize()` unconditionally and THROWS on a
 * plain three-letter code, so it can never read this option at all. `getOptionValueOrNull()`
 * applies WordPress's own maybe_unserialize rule and returns the string.
 */
async function readStoreCurrency(): Promise<string> {
    const value = await dbUtils.getOptionValueOrNull(CURRENCY_OPTION);
    return typeof value === 'string' && value ? value : SUPPORTED_CURRENCY;
}

/** Plain-string write — `serializeData: false`, or WooCommerce reads back a serialized blob. */
async function setStoreCurrency(code: string): Promise<void> {
    await dbUtils.setOptionValue(CURRENCY_OPTION, code, false);
}

/** Turn the PP-CUR-09 filter on/off. Written as a plain string, cleared by deleting the row. */
async function setInjectedCurrency(code: string | null): Promise<void> {
    if (code === null) {
        await dbUtils.deleteOptionRow([INJECTED_CURRENCY_OPTION]);
        return;
    }
    await dbUtils.setOptionValue(INJECTED_CURRENCY_OPTION, code, false);
}

/* ------------------------------------------------------------------ */
/* Fixtures over WooCommerce REST                                      */
/* ------------------------------------------------------------------ */

/** Create a WooCommerce order attributed to the PayPal gateway from the given product ids. */
async function createOrder(productIds: string[]): Promise<number> {
    const ctx = await adminContext();
    try {
        const res = await ctx.post(`${SERVER_URL}/wc/v3/orders`, {
            data: {
                payment_method: PAYPAL_IDS.gateway,
                payment_method_title: 'Dokan PayPal Marketplace',
                status: 'pending',
                set_paid: false,
                customer_id: Number(CUSTOMER_ID),
                billing: payloads.createOrder.billing,
                line_items: productIds.map(id => ({ product_id: Number(id), quantity: 1 })),
            },
        });
        const body = (await res.json().catch(() => ({}))) as { id?: number };
        if (!res.ok() || !body.id) {
            throw new Error(`createOrder failed (${res.status()}): ${JSON.stringify(body ?? null).slice(0, 300)}`);
        }
        return body.id;
    } finally {
        await ctx.dispose();
    }
}

/** Best-effort teardown — a leftover order or product would skew nothing but noise. */
async function deleteOrders(orderIds: number[]): Promise<void> {
    if (!orderIds.length) {
        return;
    }
    const ctx = await adminContext();
    try {
        for (const id of orderIds) {
            await ctx.delete(`${SERVER_URL}/wc/v3/orders/${id}?force=true`).catch(() => undefined);
        }
    } finally {
        await ctx.dispose();
    }
}

async function deleteProducts(productIds: string[]): Promise<void> {
    if (!productIds.length) {
        return;
    }
    const ctx = await adminContext();
    try {
        for (const id of productIds) {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${id}?force=true`).catch(() => undefined);
        }
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Money helpers                                                       */
/* ------------------------------------------------------------------ */

const money = (value: string | undefined): number => Number(value ?? '0');

/**
 * PayPal requires `amount.value` to equal
 * `item_total + tax_total + shipping + handling + insurance - shipping_discount - discount`
 * whenever a breakdown is supplied; a purchase unit that violates it is rejected outright rather
 * than charged. This recomputes that sum from whatever the module emitted.
 */
function breakdownSum(breakdown: Record<string, Money>): number {
    const at = (key: string) => money(breakdown[key]?.value);
    return (
        at('item_total') + at('tax_total') + at('shipping') + at('handling') + at('insurance') - at('shipping_discount') - at('discount')
    );
}

/** Every money string a purchase unit carries, flattened, so a whole payload can be scanned at once. */
function allMoneyStrings(unit: PurchaseUnit): string[] {
    const values = [unit.amount.value, ...Object.values(unit.amount.breakdown).map(entry => entry.value)];
    for (const item of unit.items ?? []) {
        values.push(item.unit_amount.value);
    }
    for (const fee of unit.payment_instruction?.platform_fees ?? []) {
        values.push(fee.amount.value);
    }
    return values;
}

/** Every currency code a purchase unit carries. A single stray code is a rejected order. */
function allCurrencyCodes(unit: PurchaseUnit): string[] {
    const codes = [unit.amount.currency_code, ...Object.values(unit.amount.breakdown).map(entry => entry.currency_code)];
    for (const item of unit.items ?? []) {
        codes.push(item.unit_amount.currency_code);
    }
    for (const fee of unit.payment_instruction?.platform_fees ?? []) {
        codes.push(fee.amount.currency_code);
    }
    return codes;
}

/* ------------------------------------------------------------------ */
/* Checkout                                                            */
/* ------------------------------------------------------------------ */

/**
 * Open classic checkout as the CUSTOMER with `productId` in the cart, and hand the caller the live
 * page so a case can change the store currency underneath it and reload (PP-CUR-08).
 *
 * The cart is verified off the DATABASE before navigating, because the `[woocommerce_checkout]`
 * shortcode renders NOTHING for an empty cart (`WC_Shortcode_Checkout::checkout()` returns early)
 * — an empty cart and a removed gateway are indistinguishable on the rendered page, and every
 * "gateway not offered" assertion in this file would otherwise pass for the wrong reason.
 */
async function openCustomerCheckout(browser: Browser, productId: string): Promise<{ ctx: BrowserContext; page: Page }> {
    const ctx = await browser.newContext({ storageState: customerAuth });
    const page = await ctx.newPage();
    const paypal = new PayPalMarketplacePage(page);

    await dbUtils.clearCustomerCart(CUSTOMER_ID);
    await paypal.addProductToCart(productId);

    const persistentCart = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
    expect(
        persistentCart,
        `the customer cart must hold product ${productId} before checkout opens — an empty cart offers no payment methods at all, so every "gateway withdrawn" assertion in this file would pass without the currency doing any work`,
    ).toMatch(new RegExp(`"product_id";(i:${productId};|s:\\d+:"${productId}")`));

    await loadCheckout(page);
    return { ctx, page };
}

/**
 * Load (or reload) classic checkout and wait for the order form.
 *
 * `#place_order` renders even when NO gateway is available, so waiting on it is what makes a
 * missing radio mean "withdrawn" rather than "not painted yet".
 */
async function loadCheckout(page: Page): Promise<void> {
    await page.goto(CHECKOUT.url, { waitUntil: 'domcontentloaded' });
    await expect(page.locator(CHECKOUT.placeOrder), 'the classic checkout order form must render before availability is read off it').toBeVisible({
        timeout: 60_000,
    });
}

const gatewayOffered = async (page: Page): Promise<boolean> => (await page.locator(CHECKOUT.radio).count()) > 0;

/** One-shot convenience for the cases that do not need to keep the session open. */
async function paypalOfferedAtCheckout(browser: Browser, productId: string): Promise<boolean> {
    const { ctx, page } = await openCustomerCheckout(browser, productId);
    try {
        return await gatewayOffered(page);
    } finally {
        await page.close();
        await ctx.close();
    }
}

/** Run a body against a fresh ADMIN page. */
async function withAdminPage<T>(browser: Browser, body: (page: Page) => Promise<T>): Promise<T> {
    const ctx = await browser.newContext({ storageState: adminAuth });
    const page = await ctx.newPage();
    try {
        return await body(page);
    } finally {
        await page.close();
        await ctx.close();
    }
}

/* ------------------------------------------------------------------ */
/* Skip reasons — each names exactly what is missing                   */
/* ------------------------------------------------------------------ */

const CREDENTIALS_SKIP =
    'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / ' +
    'TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE), so the gateway can never reach is_ready() and a "currency withdrew the gateway" ' +
    'result would be indistinguishable from "the gateway was never configured". PP-PRE-01 reports the absence.';

const MODULE_SKIP =
    `the paypal_marketplace module is inactive, so WooCommerce never registers the ${PAYPAL_IDS.gateway} gateway whose ` +
    'currency handling this case measures — activate the module (site setup does it) before reading anything into this result.';

const ROUTE_SKIP =
    'the currency test route reported the paypal_marketplace module absent, so Helper::get_supported_currencies() could not ' +
    'be read at all — nothing about currency support can be concluded from this environment.';

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */

test.describe('PayPal Marketplace — currency support', () => {
    // Several cases render classic checkout two or three times over a cold PHP cache, and PP-CUR-07
    // creates a third vendor with a product.
    test.describe.configure({ timeout: 240_000 });

    /** Captured raw so the store is handed back exactly as it was found, not as USD by assumption. */
    let originalCurrency = SUPPORTED_CURRENCY;

    let vendor1ProductId = '';
    let vendor2ProductId = '';
    let vendor3ProductId = '';
    let vendor3Id = '';
    /** Why PP-CUR-07 could not run, when it could not — surfaced as the skip reason, never swallowed. */
    let vendor3Failure = '';

    const createdOrders: number[] = [];

    test.beforeAll(async () => {
        // No test.skip() here on purpose: inside a beforeAll it voids the entire describe silently.
        originalCurrency = await readStoreCurrency();

        if (!hasCredentials) {
            return;
        }

        await ensurePayPalConfigured();
        await ensureCustomerAddress();
        await ensureClassicCheckoutPage();
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: 'dokangit@vendor1.com' });
        await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' });

        const api = new ApiUtils(await request.newContext());
        try {
            // A price with a fractional part on purpose. A whole-number price would make the
            // zero-decimal rounding path a no-op and PP-CUR-05 would prove nothing.
            const [, p1] = await api.createProduct(
                { ...payloads.createProduct(), name: 'PayPal Currency Vendor1 Product', regular_price: '10.60' },
                payloads.vendorAuth,
            );
            vendor1ProductId = p1;

            const [, p2] = await api.createProduct(
                { ...payloads.createProduct(), name: 'PayPal Currency Vendor2 Product', regular_price: '10.60' },
                payloads.vendor2Auth,
            );
            vendor2ProductId = p2;

            /*
             * The third vendor for PP-CUR-07. Created under a FIXED login/store name rather than a
             * faker one, so a re-run reuses the same account instead of minting a new user every
             * time: `createStore()` falls back to a lookup-and-update when the store already exists.
             */
            const [, sellerId] = await api.createStore(
                {
                    ...payloads.createStore(),
                    user_login: 'paypalcurvendor3',
                    email: 'paypalcurvendor3@example.test',
                    store_name: 'PayPal Currency Vendor Three',
                },
                payloads.adminAuth,
            );
            vendor3Id = sellerId;

            if (vendor3Id) {
                // A placeholder merchant id is enough here and is honest about what it is: no PayPal
                // call happens in this file, and `payee.merchant_id` is echoed into the payload
                // verbatim. Nothing in PP-CUR-07 depends on this vendor being payable.
                await seedPayPalConnectedVendor(vendor3Id, `${SEEDED_MERCHANT_SENTINEL}_vendor3`, { email: 'paypalcurvendor3@example.test' });
                const [, p3] = await api.createProduct(
                    { ...payloads.createProduct(), name: 'PayPal Currency Vendor3 Product', regular_price: '3.33' },
                    payloads.userAuth('paypalcurvendor3'),
                );
                vendor3ProductId = p3;
            }
        } catch (error) {
            vendor3Failure = error instanceof Error ? error.message : String(error);
        } finally {
            await api.dispose();
        }
    });

    /*
     * Reset the two GLOBAL knobs after EVERY case, not just at the end of the file. A case that
     * dies between "set JPY" and its restore would otherwise leave the whole site trading in yen,
     * and the next spec on this worker would fail somewhere with no mention of currency anywhere in
     * its output.
     */
    test.afterEach(async () => {
        await setStoreCurrency(originalCurrency);
        await setInjectedCurrency(null);
    });

    test.afterAll(async () => {
        await setStoreCurrency(originalCurrency);
        await setInjectedCurrency(null);
        await deleteOrders(createdOrders);
        await deleteProducts([vendor1ProductId, vendor2ProductId, vendor3ProductId].filter(Boolean));
    });

    /* -------------------------------------------------------------- */
    /* Availability                                                    */
    /* -------------------------------------------------------------- */

    test('PP-CUR-01: a supported store currency leaves the gateway available at checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        await setStoreCurrency(SUPPORTED_CURRENCY);

        const support = await currencySupport();
        test.skip(support.skipped !== undefined, ROUTE_SKIP);

        // KEY lookup, never a value search: the map is `code => name`, so `toContain('USD')` on the
        // array would be searching the currency NAMES and would report USD unsupported on a healthy
        // site. This suite made exactly that mistake once.
        expect(
            support.supported_codes,
            `${SUPPORTED_CURRENCY} must be a KEY of Helper::get_supported_currencies() — the product decides availability with array_key_exists() (PayPal.php:171), so a store trading in the suite's baseline currency must be able to offer PayPal at all`,
        ).toContain(SUPPORTED_CURRENCY);

        // Not a restatement of the line above: this reads the VALUE stored at the code key. If the
        // map ever inverted to `name => code` the lookup returns undefined and this fails, whereas a
        // second membership check on `supported_codes`/`Object.keys()` could only fail after the
        // assertion above already had. `'United States dollar'` is the same string PP-CUR-04 asserts
        // the admin notice renders (Helper.php:413).
        expect(
            support.supported_currencies[SUPPORTED_CURRENCY],
            `the map returned by the product must be keyed by CODE and valued by NAME — ${SUPPORTED_CURRENCY} must resolve to "United States dollar"; if the map were keyed by name every availability decision in the module (array_key_exists at PayPal.php:171) would invert`,
        ).toBe('United States dollar');

        expect(support.is_valid_for_use, `is_valid_for_use() must be true under ${SUPPORTED_CURRENCY} or no customer can select PayPal at all`).toBe(true);
        expect(
            support.gateway_enabled_runtime,
            'the gateway must stay runtime-enabled under a supported currency — PayPal.php:110-111 forces enabled="no" only for unsupported ones',
        ).toBe('yes');

        expect(
            status.is_ready,
            'the gateway must be ready before availability means anything; on an unconfigured site "offered"/"not offered" says nothing about currency',
        ).toBe(true);

        expect(
            await paypalOfferedAtCheckout(browser, vendor1ProductId),
            `PayPal must be offered at checkout while the store trades in ${SUPPORTED_CURRENCY} — if it is not, the gateway is unreachable for every customer on a fully supported currency`,
        ).toBe(true);

        log.success(`PP-CUR-01: ${SUPPORTED_CURRENCY} is a key of the 24-currency allow list and the gateway is offered at checkout.`);
    });

    test('PP-CUR-02: an unsupported store currency removes the gateway from checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        expect(
            status.is_ready,
            'the gateway must be READY before absence is asserted — on an unconfigured site "not offered" is trivially true and this case would pass while proving nothing about currency',
        ).toBe(true);

        // Positive control first. Without it, the negative below is satisfied by any unrelated
        // breakage — a missing product, a dead checkout page, an unseeded vendor.
        await setStoreCurrency(SUPPORTED_CURRENCY);
        expect(
            await paypalOfferedAtCheckout(browser, vendor1ProductId),
            `control: PayPal must be offered under ${SUPPORTED_CURRENCY} first, otherwise its absence under ${UNSUPPORTED_CURRENCY} proves nothing`,
        ).toBe(true);

        await setStoreCurrency(UNSUPPORTED_CURRENCY);

        const support = await currencySupport();
        test.skip(support.skipped !== undefined, ROUTE_SKIP);

        expect(
            support.supported_codes,
            `${UNSUPPORTED_CURRENCY} must NOT be a key of the allow list — this case is meaningless if the currency it uses turns out to be supported`,
        ).not.toContain(UNSUPPORTED_CURRENCY);

        expect(
            support.is_valid_for_use,
            `is_valid_for_use() must be false under ${UNSUPPORTED_CURRENCY}; if it stayed true a customer could start a PayPal payment in a currency PayPal will not settle`,
        ).toBe(false);

        expect(
            await paypalOfferedAtCheckout(browser, vendor1ProductId),
            `PayPal must be withdrawn from checkout under ${UNSUPPORTED_CURRENCY} — offering it would send an order to PayPal in a currency the platform rejects, stranding the customer mid-payment`,
        ).toBe(false);

        log.success(`PP-CUR-02: ${UNSUPPORTED_CURRENCY} is outside the allow list and the gateway is withdrawn from checkout.`);
    });

    test('PP-CUR-03: an unsupported currency disables the gateway in memory only', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        const readyStatus = await getPayPalStatus();
        test.skip(!readyStatus.module_active, MODULE_SKIP);
        expect(readyStatus.is_ready, 'the gateway must be ready first, or "enabled in the option" would be true for reasons unrelated to currency').toBe(true);

        await setStoreCurrency(UNSUPPORTED_CURRENCY);

        const support = await currencySupport();
        test.skip(support.skipped !== undefined, ROUTE_SKIP);

        // The whole point of the case: PayPal.php:110-111 assigns `$this->enabled = 'no'` on the
        // INSTANCE and never writes the option. The two therefore disagree, and a spec that decided
        // availability by reading the option would conclude the gateway was live.
        expect(
            support.gateway_enabled_runtime,
            'the gateway instance must report enabled="no" under an unsupported currency — that runtime assignment is the only thing stopping the payment method appearing',
        ).toBe('no');

        expect(
            support.option_enabled,
            'the STORED enabled flag must still say "yes": the disable is runtime-only, so any spec (or support engineer) that reads this option to decide whether PayPal is available draws the opposite conclusion from reality',
        ).toBe('yes');

        const stored = await readGatewaySettings();
        expect(
            stored.enabled,
            'read straight from the database the option is unchanged too — nothing persisted the disable, so restoring a supported currency restores the gateway with no admin action',
        ).toBe('yes');

        const status = await getPayPalStatus();
        expect(
            status.is_enabled,
            'Helper::is_enabled() reads the option, so it still reports true under an unsupported currency — the readiness helpers are currency-blind and cannot be used to answer "is PayPal available"',
        ).toBe(true);
        expect(status.is_ready, 'Helper::is_ready() likewise stays true; readiness and availability are different questions in this module').toBe(true);

        log.success('PP-CUR-03: runtime enabled="no" while the stored option and is_ready() both still say the gateway is on.');
    });

    test('PP-CUR-04: the admin settings screen warns instead of rendering the form on an unsupported currency', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        await setStoreCurrency(UNSUPPORTED_CURRENCY);

        await withAdminPage(browser, async page => {
            // Navigated directly rather than through `paypal.gotoGatewaySettings()`, which asserts
            // the enable checkbox is visible — the very element this case expects to be gone.
            await page.goto(PayPalMarketplacePage.ADMIN_SETTINGS_URL, { waitUntil: 'domcontentloaded' });

            // `.first()` is not cosmetic: WooCommerce settings screens carry other `.inline.error`
            // notices, and a locator that resolves to two elements raises a strict-mode violation —
            // which is how an ambiguous `#message.updated` failed two settings cases that had in
            // fact passed on 2026-07-31. The `hasText` filter narrows it, `.first()` guarantees it.
            const notice = page.locator(PayPalMarketplacePage.misc.settingsInlineError).filter({ hasText: 'Gateway disabled' }).first();
            await expect(
                notice,
                'the settings screen must explain that the store currency is unsupported — without it an admin sees an ordinary-looking form, saves it, and never learns why no customer can pay',
            ).toBeVisible({ timeout: 30_000 });

            await expect(
                notice,
                'the notice must name the store currency as the cause, otherwise the admin has no lead to follow',
            ).toContainText('does not support your store currency');

            await expect(
                notice,
                'the notice must list the supported currencies; `implode()` over the map yields the NAMES, so a supported currency name is the correct evidence that the list rendered',
            ).toContainText('United States dollar');

            expect(
                await page.locator(PayPalMarketplacePage.admin.enableDisablePayPalMarketplace).count(),
                'the settings form must be REPLACED, not merely annotated — leaving the enable checkbox on screen invites an admin to toggle a gateway that cannot run',
            ).toBe(0);
        });

        log.success('PP-CUR-04: the gateway-disabled explanation replaces the settings form under an unsupported currency.');
    });

    /* -------------------------------------------------------------- */
    /* Amounts                                                         */
    /* -------------------------------------------------------------- */

    test('PP-CUR-05: zero-decimal currency amounts carry no fractional part', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        test.skip(!vendor1ProductId, 'the vendor1 fixture product was not created, so there is no order to build a purchase unit from');

        // Currency first, order second: WooCommerce snapshots the currency onto the order at
        // creation, so an order created before the switch would carry the old one.
        await setStoreCurrency(ZERO_DECIMAL_CURRENCY);

        const support = await currencySupport();
        test.skip(support.skipped !== undefined, ROUTE_SKIP);
        expect(
            support.supported_codes,
            `${ZERO_DECIMAL_CURRENCY} must be a key of the allow list, or this case is measuring the amount format of a currency the gateway would refuse anyway`,
        ).toContain(ZERO_DECIMAL_CURRENCY);

        const orderId = await createOrder([vendor1ProductId]);
        createdOrders.push(orderId);

        const result = await purchaseUnitsFor(orderId);
        expect(result.order_currency, 'the order must have been created in the zero-decimal currency for its amounts to mean anything').toBe(ZERO_DECIMAL_CURRENCY);
        expect(result.units.length, 'the module must produce at least one purchase unit, or nothing would ever be sent to PayPal').toBeGreaterThan(0);

        for (const entry of result.units) {
            const unit = entry.purchase_unit;

            for (const value of allMoneyStrings(unit)) {
                expect(
                    value,
                    `every amount sent for ${ZERO_DECIMAL_CURRENCY} must be a whole number — PayPal rejects a purchase unit whose value carries decimals in a zero-decimal currency, so "${value}" would fail the order outright rather than charge the wrong amount`,
                ).toMatch(/^-?\d+$/);
            }

            for (const code of allCurrencyCodes(unit)) {
                expect(
                    code,
                    `every currency_code in the payload must be ${ZERO_DECIMAL_CURRENCY}; a single stray code makes PayPal reject the whole order`,
                ).toBe(ZERO_DECIMAL_CURRENCY);
            }

            expect(
                Math.abs(money(unit.amount.value) - money(entry.order_total)),
                `the whole-number amount must still be the sub order's own total rounded, not a rescaled one — a x100 slip here would charge ${money(unit.amount.value)} instead of ${money(entry.order_total)}`,
            ).toBeLessThanOrEqual(1);
        }

        log.success(
            `PP-CUR-05: every ${ZERO_DECIMAL_CURRENCY} amount emitted for order ${orderId} is integral.`,
            result.units.map(u => `sub ${u.sub_order_id}: total ${u.order_total} → ${u.purchase_unit.amount.value}`).join('\n'),
        );
    });

    test('PP-CUR-06: a zero-decimal multi-vendor split still reconciles', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        test.skip(!vendor1ProductId || !vendor2ProductId, 'both vendor fixture products are required to produce a multi-vendor cart');

        await setStoreCurrency(ZERO_DECIMAL_CURRENCY);

        const orderId = await createOrder([vendor1ProductId, vendor2ProductId]);
        createdOrders.push(orderId);

        const result = await purchaseUnitsFor(orderId);
        expect(
            result.units.length,
            'the cart holds products from two different vendors, so Dokan must split it into two sub orders — one purchase unit would mean a whole vendor was never going to be paid',
        ).toBe(2);

        const sellerIds = new Set(result.units.map(u => u.seller_id));
        expect(sellerIds.size, 'the two purchase units must belong to two DIFFERENT vendors, or the split collapsed and one vendor is billed twice').toBe(2);

        // The catalogue's literal expectation, asserted first so it is verified even if the
        // reconciliation assertion below fails.
        const unitTotal = result.units.reduce((sum, entry) => sum + money(entry.purchase_unit.amount.value), 0);
        expect(
            Math.abs(unitTotal - money(result.order_total)),
            `the purchase units must add back up to the order total: ${unitTotal} against ${result.order_total}. Each sub order is rounded to a whole ${ZERO_DECIMAL_CURRENCY} independently, so at most one sub-unit of slack is legitimate — more than that and the customer is charged money no vendor is owed, or a vendor is short-paid`,
        ).toBeLessThanOrEqual(1);

        for (const entry of result.units) {
            for (const value of allMoneyStrings(entry.purchase_unit)) {
                expect(value, `the split must not reintroduce decimals into a ${ZERO_DECIMAL_CURRENCY} payload; "${value}" would be rejected by PayPal`).toMatch(/^-?\d+$/);
            }
        }

        /*
         * Everything above this line is a control and must go RED on its own: two units, two
         * vendors, units summing back to the order total, and no decimals anywhere in the payload.
         *
         * Below is the money-truth assertion, and the only one DOK-030 currently gets wrong. PayPal
         * validates
         * `amount.value == item_total + tax_total + shipping + handling + insurance
         *  - shipping_discount - discount`
         * and REJECTS the order when it does not hold — nothing is charged, so the customer sees
         * a failed checkout rather than a wrong price.
         *
         * `format_amount_for_currency()` (OrderManager.php:54-68) rounds every component
         * INDEPENDENTLY for a zero-decimal currency, and `adjust_purchase_units_subtotal()`
         * (OrderManager.php:108-135) only reconciles the ITEMS back to `item_total` — nothing
         * reconciles the breakdown back to the total. Measured live on 2026-07-31 against
         * dokan-pro 5.0.9: a 10.60 product with the store's 5% tax produced
         * `amount.value = 11` against a breakdown summing to 12 (item_total 11 + tax 1).
         *
         * It states the invariant PayPal enforces, not the behaviour observed; do not relax it to
         * make the run green. When it starts passing, DOK-030 is fixed and this marker goes.
         */
        test.fail();

        for (const entry of result.units) {
            const unit = entry.purchase_unit;
            expect(
                breakdownSum(unit.amount.breakdown),
                `the amount breakdown must add up to amount.value (${unit.amount.value}) for sub order ${entry.sub_order_id} — PayPal rejects a mismatched breakdown outright, so a customer paying in ${ZERO_DECIMAL_CURRENCY} cannot complete checkout at all`,
            ).toBeCloseTo(money(unit.amount.value), 2);
        }

        log.success(
            `PP-CUR-06: ${result.units.length} ${ZERO_DECIMAL_CURRENCY} purchase units reconcile to order total ${result.order_total}.`,
            result.units.map(u => `sub ${u.sub_order_id} seller ${u.seller_id}: ${u.purchase_unit.amount.value}`).join('\n'),
        );
    });

    test('PP-CUR-07: rounding on a three-way split neither loses nor invents money', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        test.skip(
            !vendor1ProductId || !vendor2ProductId || !vendor3ProductId,
            `a third connected vendor could not be prepared, so a three-way split cannot be built${vendor3Failure ? ` — ${vendor3Failure}` : ''}`,
        );

        await setStoreCurrency(SUPPORTED_CURRENCY);

        // Three unequal, fractional prices (10.60 / 10.60 / 3.33) plus the store's tax give a total
        // that does not divide evenly across the vendors, which is the whole point of the case.
        const orderId = await createOrder([vendor1ProductId, vendor2ProductId, vendor3ProductId]);
        createdOrders.push(orderId);

        const result = await purchaseUnitsFor(orderId);
        expect(result.units.length, 'three vendors must yield three purchase units — a missing one is a vendor who is never paid').toBe(3);
        expect(new Set(result.units.map(u => u.seller_id)).size, 'the three purchase units must belong to three different vendors').toBe(3);

        let unitTotal = 0;
        let subOrderTotal = 0;
        let feeTotal = 0;

        for (const entry of result.units) {
            const unit = entry.purchase_unit;
            const amount = money(unit.amount.value);
            const fee = money(unit.payment_instruction?.platform_fees?.[0]?.amount.value);

            unitTotal += amount;
            subOrderTotal += money(entry.order_total);
            feeTotal += fee;

            expect(
                amount,
                `purchase unit ${entry.sub_order_id} must carry its sub order's total exactly (${entry.order_total}); any drift here is money charged to the customer that no vendor is credited with`,
            ).toBeCloseTo(money(entry.order_total), 2);

            expect(fee, `the platform fee for sub order ${entry.sub_order_id} must not be negative — PayPal would reject it and the marketplace would owe the vendor money`).toBeGreaterThanOrEqual(0);
            expect(
                fee,
                `the platform fee (${fee}) must never exceed the amount charged for sub order ${entry.sub_order_id} (${amount}), or the vendor is paid a negative sum`,
            ).toBeLessThanOrEqual(amount);

            expect(
                breakdownSum(unit.amount.breakdown),
                `the breakdown for sub order ${entry.sub_order_id} must add up to amount.value (${unit.amount.value}); PayPal rejects the order otherwise and no payment happens at all`,
            ).toBeCloseTo(amount, 2);
        }

        expect(
            unitTotal,
            `the purchase units must add up to the sum of the sub orders they were built from (${subOrderTotal}) — PayPal formatting must not invent or drop a cent`,
        ).toBeCloseTo(subOrderTotal, 2);

        /*
         * Against the PARENT total the tolerance is one cent PER SUB ORDER, not one cent overall.
         * WooCommerce rounds each sub order's tax to the currency's two decimals before this module
         * is ever called, so up to a cent of the slack is Dokan's split rather than PayPal's
         * formatting. Anything beyond that is a real leak — a whole vendor's unit missing would be
         * orders of magnitude outside it.
         */
        expect(
            Math.abs(unitTotal - money(result.order_total)),
            `the three purchase units must reconcile to the parent order total ${result.order_total} (got ${unitTotal}); a gap wider than per-sub-order rounding means the customer is charged an amount the vendors are not collectively credited with`,
        ).toBeLessThanOrEqual(0.01 * result.units.length);

        expect(feeTotal, 'the platform fees must not exceed the money actually charged, or the marketplace takes more than the order is worth').toBeLessThanOrEqual(unitTotal);

        log.success(
            `PP-CUR-07: three-way split reconciles — Σ units ${unitTotal} vs order ${result.order_total}, Σ platform fees ${feeTotal}.`,
            result.units.map(u => `sub ${u.sub_order_id} seller ${u.seller_id}: ${u.purchase_unit.amount.value}`).join('\n'),
        );
    });

    /* -------------------------------------------------------------- */
    /* Change, filter, mismatch                                        */
    /* -------------------------------------------------------------- */

    test('PP-CUR-08: a mid-session currency change is reflected at checkout without a stale gateway', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        expect(status.is_ready, 'the gateway must be ready before a disappearance can be attributed to the currency change').toBe(true);

        await setStoreCurrency(SUPPORTED_CURRENCY);

        // ONE customer session held across both currency changes. Opening a fresh context each time
        // would sidestep exactly the staleness this case is about.
        const { ctx, page } = await openCustomerCheckout(browser, vendor1ProductId);
        try {
            expect(await gatewayOffered(page), `control: the shopper must be offered PayPal under ${SUPPORTED_CURRENCY} before the currency moves`).toBe(true);

            await setStoreCurrency(UNSUPPORTED_CURRENCY);
            await loadCheckout(page);

            expect(
                await gatewayOffered(page),
                `after the store moves to ${UNSUPPORTED_CURRENCY} the SAME shopper must stop being offered PayPal on reload — a cached gateway here lets an in-flight cart pay in a currency PayPal will not settle`,
            ).toBe(false);

            const cartAfterChange = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
            expect(
                cartAfterChange,
                'the cart must still hold the product after the currency change, or "no payment method" is just an empty cart and this case proves nothing',
            ).toMatch(new RegExp(`"product_id";(i:${vendor1ProductId};|s:\\d+:"${vendor1ProductId}")`));

            await setStoreCurrency(SUPPORTED_CURRENCY);
            await loadCheckout(page);

            expect(
                await gatewayOffered(page),
                `moving back to ${SUPPORTED_CURRENCY} must restore the gateway on the next reload — if it does not, one bad currency setting locks PayPal out of every existing session until the shopper starts over`,
            ).toBe(true);
        } finally {
            await page.close();
            await ctx.close();
        }

        log.success('PP-CUR-08: gateway availability tracked the store currency in both directions inside one shopper session.');
    });

    test('PP-CUR-09: the supported-currency filter is honoured', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        expect(status.is_ready, 'the gateway must be ready before a filter can be credited with restoring it').toBe(true);

        await setStoreCurrency(UNSUPPORTED_CURRENCY);

        const before = await currencySupport();
        test.skip(before.skipped !== undefined, ROUTE_SKIP);
        expect(
            before.is_valid_for_use,
            `control: ${UNSUPPORTED_CURRENCY} must be rejected BEFORE the filter runs, or "the filter added it" is indistinguishable from "it was always there"`,
        ).toBe(false);

        try {
            // The mu-plugin's callback is inert until this option is set, so nothing outside this
            // block sees a patched allow list.
            await setInjectedCurrency(UNSUPPORTED_CURRENCY);

            const after = await currencySupport();
            expect(after.injected_currency, 'the test filter must actually be active, or the assertions below measure the unfiltered module').toBe(UNSUPPORTED_CURRENCY);

            expect(
                after.supported_codes,
                `${UNSUPPORTED_CURRENCY} must appear as a KEY once the filter adds it — a marketplace in an unlisted currency has no other way to enable this gateway, and dokan_paypal_supported_currencies is the documented extension point`,
            ).toContain(UNSUPPORTED_CURRENCY);

            expect(
                after.is_valid_for_use,
                'is_valid_for_use() must honour the filtered list; if it ignored the filter the extension point would be decorative',
            ).toBe(true);

            expect(
                await paypalOfferedAtCheckout(browser, vendor1ProductId),
                'the filtered currency must reach real customers at checkout, not just the helper — an allow list that only the API agrees with helps nobody',
            ).toBe(true);

            /*
             * The divergence the catalogue asks to record, measured rather than assumed.
             *
             * `dokan_paypal_supported_currencies` is applied to TWO differently-shaped arrays:
             * a flat LIST of codes for the advanced-card currencies (Helper.php:337-356) and the
             * code-keyed MAP for gateway availability (Helper.php:417). One callback cannot serve
             * both — adding by key (what availability needs) leaves the UCC list holding an entry
             * whose VALUE is a display label, so `in_array( $currency, $supported, true )` at
             * Helper.php:189 still says no. Confirmed live on 2026-07-31.
             *
             * RECORDED, not asserted, and deliberately so. The catalogue asks for the divergence to
             * be noted; any expect() written here would be measuring THIS FILE'S callback rather
             * than the product, and would keep passing after a real fix — a green assertion that
             * cannot fail is worse than a logged fact. The finding is filed as a product concern.
             */
            const uccList = after.ucc_non_us_currencies;
            const uccIsArray = Array.isArray(uccList);
            const uccValues = uccIsArray ? (uccList as unknown[]).map(String) : Object.values(uccList as Record<string, unknown>).map(String);
            const uccKeys = uccIsArray ? [] : Object.keys(uccList as Record<string, unknown>);
            const uccTail = JSON.stringify(uccKeys.length ? uccKeys.slice(-2) : uccValues.slice(-2));

            log.warn(
                'PP-CUR-09: one filter name, two shapes — dokan_paypal_supported_currencies is applied to a code-keyed MAP (Helper.php:417) and to a flat LIST (Helper.php:338).',
                `A callback shaped for gateway availability leaves the advanced-card list unable to match the same currency (in_array at Helper.php:189 searches values). UCC list tail after the filter: ${uccTail}. ` +
                    `Advanced-card eligibility for "${UNSUPPORTED_CURRENCY}" is therefore lost even though the gateway accepted it.`,
            );
        } finally {
            await setInjectedCurrency(null);
        }

        log.success(`PP-CUR-09: the filter added ${UNSUPPORTED_CURRENCY} to the allow list and the gateway became available at checkout.`);
    });

    test('PP-CUR-10: a vendor whose PayPal account currency differs from the store is not detected by the module', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        test.skip(
            !vendor1ProductId || !vendor2ProductId,
            'both vendor fixture products are required — the payee-independence half of this case compares two DIFFERENT payees under one store currency',
        );

        /*
         * What this case CAN answer, and what it cannot.
         *
         * A vendor's PayPal account currency lives entirely on PayPal's side. Dokan never reads it:
         * the metas that make a vendor connected carry a merchant id, receivability, email
         * confirmation, UCC and the marketplace settings blob — and nothing about currency. So the
         * module cannot detect a mismatch, and the question "reject or convert?" is decided after
         * the payload leaves. That half needs a real capture (PP-CHK) and is NOT claimed here.
         *
         * What IS provable, and is: the payload currency follows the STORE and is completely
         * independent of the payee.
         *
         * The "no currency meta" claim is measured against the seeded vendor's OWN usermeta rows,
         * not against a key list the test suite wrote. `status.vendor_meta_keys` is a hand-written
         * label map in the test mu-plugin, so scanning it can only ever find what this suite chose
         * to enumerate; this query finds every PayPal meta the vendor actually carries and fails the
         * day the module starts persisting a vendor account currency, which is what the case claims
         * to detect.
         */
        const paypalMetaRows = (await dbUtils.dbQuery(`SELECT meta_key FROM ${DB_PREFIX}_usermeta WHERE user_id = ? AND meta_key LIKE '%paypal%';`, [
            Number(VENDOR2_ID),
        ])) as Array<{ meta_key: string }>;
        const vendorMetaKeys = paypalMetaRows.map(row => String(row.meta_key));

        expect(
            vendorMetaKeys.length,
            `vendor ${VENDOR2_ID} must actually carry PayPal connection meta before "none of it records a currency" means anything — on an unconnected vendor the assertion below is satisfied by an empty result set`,
        ).toBeGreaterThan(0);
        expect(
            vendorMetaKeys.filter(key => /currency/i.test(key)),
            `none of vendor ${VENDOR2_ID}'s PayPal metas (${vendorMetaKeys.join(', ')}) records a PayPal account currency, so Dokan has nothing to compare the store currency against — a mismatch cannot be caught before the money moves, only after PayPal answers`,
        ).toEqual([]);

        await setStoreCurrency(SUPPORTED_CURRENCY);
        const orderId = await createOrder([vendor2ProductId]);
        createdOrders.push(orderId);

        const asBaseline = await purchaseUnitsFor(orderId);
        const baselineUnit = asBaseline.units[0];
        expect(baselineUnit, 'a purchase unit must exist for the vendor2 order before its currency can be inspected').toBeDefined();
        const baselinePayee = baselineUnit?.purchase_unit.payee.merchant_id ?? '';

        expect(
            baselineUnit?.purchase_unit.amount.currency_code,
            `the purchase unit must be denominated in the store currency ${SUPPORTED_CURRENCY}, whatever the payee's own account trades in`,
        ).toBe(SUPPORTED_CURRENCY);
        expect(baselinePayee, 'the purchase unit must name a payee merchant id, or PayPal has no vendor to pay').not.toBe('');

        /*
         * Payee-independence, demonstrated on a build where the order currency and the store
         * currency AGREE.
         *
         * A SECOND order, created after the switch to EUR and holding a product from each of the
         * two connected vendors: two purchase units, two DIFFERENT payees, one currency. The payee
         * varies, the currency does not — that is what "store-driven rather than vendor-driven"
         * actually means, and it is provable only across differing payees.
         *
         * The previous version of this case asserted EUR on a re-read of the USD order above and
         * compared that order's payee against itself. The first passed only because of the
         * re-labelling defect pinned at the end of this test (so a fix would have turned it red for
         * the wrong reason); the second was one deterministic read compared with itself and could
         * not fail at all.
         */
        await setStoreCurrency(SUPPORTED_ALT_CURRENCY);
        const altOrderId = await createOrder([vendor1ProductId, vendor2ProductId]);
        createdOrders.push(altOrderId);

        const altOrder = await purchaseUnitsFor(altOrderId);
        expect(
            altOrder.order_currency,
            `the second order must have been created in ${SUPPORTED_ALT_CURRENCY} — WooCommerce snapshots the currency at creation, and an order still stored in ${SUPPORTED_CURRENCY} would say nothing about the payload following the store`,
        ).toBe(SUPPORTED_ALT_CURRENCY);
        expect(altOrder.units.length, 'the two-vendor cart must split into two purchase units, or there is only one payee here and nothing to compare across').toBe(2);

        const altPayees = altOrder.units.map(entry => entry.purchase_unit.payee.merchant_id);
        expect(
            new Set(altPayees).size,
            `the two purchase units must name two DIFFERENT payees (got ${JSON.stringify(altPayees)}) — comparing one merchant id against itself proves nothing about the payee's influence on the currency`,
        ).toBe(2);

        for (const entry of altOrder.units) {
            expect(
                entry.purchase_unit.amount.currency_code,
                `the unit for seller ${entry.seller_id} (payee ${entry.purchase_unit.payee.merchant_id}) must be denominated in the order's currency ${altOrder.order_currency}; both payees get the same code from one order, so the module offers no way to denominate a unit in the vendor's own account currency — a mismatched vendor is handed to PayPal to accept, convert or refuse`,
            ).toBe(altOrder.order_currency);
        }

        /*
         * The original order (created while the store traded in the baseline currency), re-read
         * while the store trades in the alternate one.
         *
         * `make_purchase_unit_data()` reads `get_woocommerce_currency()` (Order/OrderManager.php:161)
         * rather than `$order->get_currency()`, so the unit is LABELLED with the store's currency
         * while every figure is still the order's own total — `format_amount_for_currency()` is fed
         * `$order->get_total()` and converts nothing. A customer paying a pending order after the
         * admin changed the store currency is charged the old number under the new code.
         *
         * The assertion below states the invariant (a purchase unit is denominated in the currency
         * of the order it was built from) rather than the observed behaviour, so it is expected to
         * FAIL on dokan-pro 5.0.9 — the same deliberate red PP-CUR-06 uses for the breakdown defect.
         * It is asserted LAST on purpose: the payee-independence evidence above must run whether or
         * not this holds. Do not relax it to make the run green; the log.warn carries the observed
         * values for the report.
         */
        const asAlt = await purchaseUnitsFor(orderId);
        const altUnit = asAlt.units[0];
        expect(altUnit, 'the same order must still produce a purchase unit after the store currency changes').toBeDefined();

        if (asAlt.order_currency !== asAlt.store_currency) {
            log.warn(
                `PP-CUR-10: order ${orderId} is stored in ${asAlt.order_currency} but its purchase unit was labelled ${altUnit?.purchase_unit.amount.currency_code} with unchanged figures.`,
                'make_purchase_unit_data() reads get_woocommerce_currency() (Order/OrderManager.php:161), not $order->get_currency(). The PayPal-side outcome for a vendor whose account currency differs (reject vs convert) still needs a real capture.',
            );
        }

        // Everything above this line is a control and must go RED on its own — above all the
        // payee-independence evidence, which is what proves the module holds no vendor account
        // currency to compare against. Only the assertion below is expected to fail while DOK-031
        // is open; when it starts passing, that is fixed and this marker goes.
        test.fail();

        expect(
            altUnit?.purchase_unit.amount.currency_code,
            `the purchase unit for order ${orderId} must stay denominated in that order's own currency ${asAlt.order_currency} — its amounts were built from that order's totals and nothing converted them, so labelling them ${asAlt.store_currency} because the STORE moved charges the customer an ${asAlt.order_currency} figure in ${asAlt.store_currency}. CONFIRMED defect DOK-031, verified against dokan-pro 5.0.9 source: make_purchase_unit_data() reads get_woocommerce_currency() (Order/OrderManager.php:164) rather than $order->get_currency().`,
        ).toBe(asAlt.order_currency);

        log.success('PP-CUR-10: purchase-unit currency is store-driven and payee-independent; the module holds no vendor account currency to compare against.');
    });
});
