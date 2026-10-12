import { CURRENCY_OPTION, CUSTOMER, PERSISTENT_CART_META, errorCode, siteUrl } from './paypalMarketplaceShared';
import type { Headers } from './paypalMarketplaceShared';
import { Browser } from '@playwright/test';
import { test, expect, request } from '@utils/test';
import type { Page } from '@utils/test';
import { SERVER_URL, toPath } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { PayPalMarketplacePage, PAYPAL_IDS, withAdmin, withCustomer } from './paypalMarketplacePage';
import type { GatewaySettings, Probe } from './helpers';
import { VENDOR_ID, CUSTOMER_ID, PAYPAL_MERCHANTS, MODULE_PAYPAL_MARKETPLACE, hasCredentials, ensurePayPalConfigured, ensureCustomerAddress, ensureClassicCheckoutPage, getPayPalStatus, seedPayPalConnectedVendor, clearPayPalVendor, setOrderMeta, armInterceptor, disarmInterceptor, readCapturedCreateOrder, probe, deleteOrder, GATEWAY_OPTION, readGatewaySettings, mergeGatewaySettings } from './helpers';

// The suite tsconfig is strict and does not pull @types/node.
declare const process: { env: Record<string, string | undefined> };

/**
 * PayPal Marketplace — edge cases and error paths · PP-EDG-01 … PP-EDG-12.
 *
 * This is the area where a passing test is worth the least by default: an error path that never
 * fires reports exactly the same green as one that fires and is handled. Every case below is
 * therefore built as a PAIR — the state under test, and a control on the same site in the same
 * run that proves the surface was alive and the probe could have seen the other answer:
 *
 *   - PP-EDG-01/03/05 assert the gateway is HIDDEN only after asserting it was OFFERED for the
 *     same cart moments earlier. `PayPal::is_available()` is `parent::is_available() &&
 *     is_ready() && validate_cart_items()`, so on an unconfigured site "hidden" is free.
 *   - PP-EDG-02/03 drive the REAL checkout POST. `CartHandler::after_checkout_validation()` is
 *     hooked on `woocommerce_after_checkout_validation`, which fires only when an order is
 *     submitted — loading the checkout page never reaches it, so a case that only loads the page
 *     is asserting about code that did not run.
 *   - PP-EDG-04 proves PayPal is the ONLY offered gateway (one `.wc_payment_method` on the real
 *     checkout) before asserting the add-to-cart guard, because the guard returns early the
 *     moment a second gateway is available — the "blocked" branch would simply never be entered.
 *   - PP-EDG-08 probes needs_setup() in BOTH directions: the recorded value, and a control with
 *     the client id cleared that must answer `needs_setup`. Without the control, "needs_setup is
 *     false" is indistinguishable from a broken probe.
 *   - PP-EDG-06/07/09 assert `rest_no_route` explicitly or explicitly rule it out, because a
 *     route that does not exist answers every negative correctly for the wrong reason.
 *
 * Two probes live in `tests/pw/mu-plugins/dokan-paypal-marketplace-edge-probes.php`, both inert
 * until this file arms them (see that file's header for why each exists and how it self-heals):
 * a real registration of the module's `dokan_paypal_marketplace_validate_cart_items` filter
 * (PP-EDG-05), and a `pre_http_request` recorder that captures the exact JSON body sent to
 * PayPal's create-order endpoint and stops it at the wire (PP-EDG-10 / PP-EDG-11). No product
 * code is touched by either; the payload builder runs in full, only the transport is stubbed.
 *
 * Never tagged `@serial` and never `test.describe.serial`: `playwright.config.ts:13` grepInverts
 * `@serial` in BOTH CI lanes, and `.serial` aborts the whole group on the first failure — on
 * 2026-07-31 that silently deleted 46 of 68 cases from a run that still summarised as green.
 */

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

export const DB_PREFIX = process.env.DB_PREFIX ?? 'wp';


/** Options owned by the edge-probe mu-plugin. Absent by default; cleared after every test. */
export const OPT_REJECT_PRODUCT = 'dokan_e2e_paypal_reject_cart_product';

/**
 * The interceptor options (`dokan_e2e_paypal_intercept_until`, the two recorders and the cached
 * access-token transient) are NOT named here any more, and `armInterceptor()` /
 * `disarmInterceptor()` / `readCapturedCreateOrder()` are imported from `helpers.ts` instead of
 * being copied. That switch is site-wide and the mu-plugin hard-codes its option names, so a second
 * private copy of the pair meant this file and paypalMarketplaceWebhooks.spec.ts could clear each
 * other's recorder and close each other's window while running concurrently in different workers.
 * The shared helpers lease the window, so only one file can hold it at a time; see helpers.ts.
 */

/** Single-site persistent-cart user meta — the exact row `dbUtils.clearCustomerCart()` deletes. */


/** Classic `[woocommerce_checkout]` shortcode page — `ensureClassicCheckoutPage()` creates it. */
export const CHECKOUT_URL = toPath('classic-checkout');

export const CHECKOUT_RADIO = `#payment_method_${PAYPAL_IDS.gateway}`;

/** Module REST routes, built once so a namespace typo cannot make a negative pass. */
export const ROUTE_CREATE_CART_PAYMENT = `${SERVER_URL}/dokan/v1/paypal-marketplace/create-payment`;

/**
 * Exact copy fragments from dokan-pro 5.0.9. Each is the stable middle of a sprintf() whose
 * placeholders are the gateway title or a product link, so none of them can drift with settings.
 */
export const CAP_ERROR = 'Does not support more than 10 vendor products in the cart';

export const NOT_ELIGIBLE_CHECKOUT_ERROR = 'is not eligible to be paid with PayPal';

export const NOT_ELIGIBLE_ADD_TO_CART_ERROR = 'Could not add product';

/**
 * `Helper::get_supported_currencies()` (Helper.php:389-418) returns a MAP KEYED BY CODE and
 * carries no BDT entry, so BDT is a real WooCommerce currency that this gateway does not
 * support — which is exactly the precondition PP-EDG-08 needs. `in_array()` against that map
 * gives a false negative on every code; membership must be tested by KEY.
 */
export const UNSUPPORTED_CURRENCY = 'BDT';

/** `OrderManager::no_decimal_currencies()` (OrderManager.php:30-45), lower-cased there. */
export const ZERO_DECIMAL_CURRENCIES = ['JPY', 'HUF', 'TWD'];


export const ADMIN: Headers = payloads.adminAuth as Headers;


/**
 * Absolute site URL. `browser.newContext()` does NOT inherit `use.baseURL` — only the
 * `context`/`page` fixtures do — so a relative `page.goto('/cart/')` inside a manually created
 * context fails outright.
 */


export const MODULE_SKIP =
    `the ${MODULE_PAYPAL_MARKETPLACE} module is inactive, so neither the gateway nor its cart, REST and withdraw controllers are registered at all — ` +
    'every assertion in this case would describe a site with no PayPal Marketplace on it. Activate the module (site setup does it) before reading anything into this result.';

export const CREDENTIALS_SKIP =
    'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / ' +
    'TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE), so `Helper::is_ready()` can never be true and the gateway can never be offered. Every "hidden", ' +
    '"blocked" or "rejected" assertion in this case would then pass against a gateway that was never configured — the exact fake green this ' +
    'area exists to prevent. PP-PRE-01 reports the absence.';

/* ------------------------------------------------------------------ */
/* HTTP probe                                                          */
/* ------------------------------------------------------------------ */

/**
 * `probe()` and its `Probe` shape are imported from `helpers.ts`. It blanks `Authorization`
 * unless a caller supplies one: `request.newContext()` INHERITS the shared config's admin Basic
 * auth when the header is omitted (api.config.ts), which has already produced a false pass in
 * this repo — a "logged out" probe silently ran as administrator.
 */

/** WP_Error code carried by a REST error envelope, or '' when the response is not one. */


/* ------------------------------------------------------------------ */
/* Stored state                                                        */
/* ------------------------------------------------------------------ */

/**
 * `GATEWAY_OPTION`, `readGatewaySettings()` and `mergeGatewaySettings()` come from `helpers.ts`.
 *
 * `dbUtils.getOptionValue()` throws on a missing row AND on a plain-string value (php-serialize's
 * `unserialize()` is unconditional there). `getOptionValueOrNull()` applies WordPress's own
 * maybe_unserialize rule, which is the only read that works for both the serialized settings map
 * and the plain-string options this file uses.
 */
export async function readStoredCurrency(): Promise<string> {
    const value = await dbUtils.getOptionValueOrNull(CURRENCY_OPTION);
    return typeof value === 'string' && value ? value : 'USD';
}

/**
 * The active module slugs, read straight from `dokan_pro_active_modules`.
 *
 * Deliberately NOT `getPayPalStatus().module_active`: that route reports `skipped` and omits
 * every flag when the module Helper class cannot be found, so a deactivation assertion written
 * against it compares `undefined` to `false`. The option is the thing `Module::is_active()`
 * itself consults, and php-serialize hands a PHP list back as an object with numeric keys.
 */
export async function activeModuleSlugs(): Promise<string[]> {
    const value = await dbUtils.getOptionValueOrNull('dokan_pro_active_modules');
    if (Array.isArray(value)) {
        return value.map(String);
    }
    return value && typeof value === 'object' ? Object.values(value as Record<string, unknown>).map(String) : [];
}

/* ------------------------------------------------------------------ */
/* Cart / checkout                                                     */
/* ------------------------------------------------------------------ */

/** The serialized persistent cart stores the id as an int or a string depending on WC version. */
export const cartCarriesProduct = (serializedCart: string, productId: string): boolean =>
    new RegExp(`"product_id";(i:${productId};|s:\\d+:"${productId}")`).test(serializedCart);

/** `withCustomer()` and `withAdmin()` — a body against a fresh page for that actor — live in
 * `paypalMarketplacePage.ts`. */

/**
 * Put an exact set of products in the customer's cart and PROVE they landed there.
 *
 * `page.request` shares the page context's cookie jar, so the adds and the later checkout POST
 * belong to one WooCommerce session. The cart is then verified off the DATABASE rather than off
 * the page: the classic `[woocommerce_checkout]` shortcode renders NOTHING for an empty cart
 * (`WC_Shortcode_Checkout::checkout()` returns early), so an add that silently failed would show
 * up as "the gateway is not offered" — passing every negative in this file for the wrong reason.
 * WooCommerce writes this meta from the `woocommerce_add_to_cart` action, which fires only on a
 * SUCCESSFUL add, so its contents are proof rather than inference.
 */
export async function fillCart(page: Page, productIds: string[]): Promise<void> {
    await dbUtils.clearCustomerCart(CUSTOMER_ID);

    for (const productId of productIds) {
        const res = await page.request.get(siteUrl(`/?add-to-cart=${productId}&quantity=1`));
        expect(res.status(), `adding product ${productId} to the cart must be accepted by the site; a failed add leaves an empty cart, and an empty cart offers no payment methods at all`).toBeLessThan(
            400,
        );
    }

    const stored = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
    for (const productId of productIds) {
        expect(
            cartCarriesProduct(stored, productId),
            `product ${productId} must really be in the customer's cart before checkout is opened — without it this case would be asserting about a cart it never built`,
        ).toBe(true);
    }
}

/** Is the gateway actually OFFERED on the classic checkout page for whatever is in the cart? */
export async function paypalOfferedAtCheckout(page: Page): Promise<boolean> {
    await page.goto(CHECKOUT_URL, { waitUntil: 'domcontentloaded' });
    // The FORM is the anchor, not #place_order. `WC_Shortcode_Checkout::checkout()` renders
    // nothing at all for an empty cart and renders the form (including its no-gateway notice)
    // whenever there is something to pay for, so this still makes an absent radio mean "not
    // offered" rather than "not rendered yet" — but without depending on the submit button, which
    // the module deliberately HIDES whenever PayPal is the chosen method and the button type is
    // 'smart' (CartHandler.php:257-270 hides it on document.ready, and
    // assets/src/js/paypal-checkout.js:37-44 animates it away in `toggle_buttons()`).
    await expect(page.locator(PayPalMarketplacePage.classic.form), 'the classic checkout page must render the order form').toBeVisible({ timeout: 60_000 });
    return (await page.locator(CHECKOUT_RADIO).count()) > 0;
}

export interface CheckoutSubmission {
    result: string;
    messages: string;
}

/**
 * Submit the REAL classic checkout with PayPal selected, and return WooCommerce's answer.
 *
 * This is the only way to reach `CartHandler::after_checkout_validation()`: it is hooked on
 * `woocommerce_after_checkout_validation`, which `WC_Checkout::validate_checkout()` fires
 * unconditionally at the END of validation (class-wc-checkout.php:1056) — after the field checks
 * and after WooCommerce's own "Invalid payment method." check, so every error accumulates into
 * one response.
 *
 * The form is serialised from the rendered DOM rather than hand-built, so the checkout nonce and
 * the customer's saved billing fields come from WooCommerce itself.
 *
 * ⚠️ Only ever call this in a state the MODULE is guaranteed to reject. If validation passed,
 * WooCommerce would create an order and run `process_payment()`, which is a live PayPal call.
 * Every caller here holds either an over-cap cart or a disconnected vendor, and asserts
 * `result === 'failure'` before reading the messages.
 */
export async function submitClassicCheckout(page: Page): Promise<CheckoutSubmission> {
    await page.goto(CHECKOUT_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator(PayPalMarketplacePage.classic.form), 'the classic checkout form must render before it can be submitted').toBeVisible({ timeout: 60_000 });

    return page.evaluate(async (gatewayId: string) => {
        const form = document.querySelector('form.checkout');
        if (!(form instanceof HTMLFormElement)) {
            return { result: 'no-checkout-form', messages: '' };
        }

        const params = new URLSearchParams();
        new FormData(form).forEach((value, key) => {
            if (typeof value === 'string') {
                params.append(key, value);
            }
        });
        params.set('payment_method', gatewayId);
        params.set('woocommerce_checkout_place_order', 'Place order');

        const response = await fetch('/?wc-ajax=checkout', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });

        const text = await response.text();
        try {
            const parsed = JSON.parse(text) as { result?: unknown; messages?: unknown };
            return { result: String(parsed.result ?? ''), messages: String(parsed.messages ?? '') };
        } catch {
            return { result: 'non-json-response', messages: text.slice(0, 2000) };
        }
    }, PAYPAL_IDS.gateway);
}

/* ------------------------------------------------------------------ */
/* Vendor pool — distinct product AUTHORS, which is what the cap counts */
/* ------------------------------------------------------------------ */

export interface PoolEntry {
    vendorId: string;
    productId: string;
}

/**
 * `CartHandler::after_checkout_validation()` groups the cart by `get_post_field( 'post_author' )`
 * and caps the number of GROUPS, so the eleven-vendor cart PP-EDG-02 needs is eleven products
 * with eleven distinct authors. They are created as real WordPress users rather than synthetic
 * ids: a product whose author does not exist would send `dokan()->vendor->get()` down a path the
 * site never takes in production, and a warning from there would be indistinguishable from the
 * defect the case is looking for.
 *
 * Every pool vendor is seeded with the SAME merchant id. Dokan only checks that a merchant id is
 * present and that `..._enable_for_receive_payment` is set; PayPal never sees these vendors
 * because no case in this file captures anything.
 */
export const vendorPool: PoolEntry[] = [];

export let api: ApiUtils | undefined;

export function apiUtils(): ApiUtils {
    if (!api) {
        throw new Error('ApiUtils was not initialised in beforeAll');
    }
    return api;
}

export async function createPoolEntry(index: number): Promise<PoolEntry> {
    const stamp = `${Date.now().toString(36)}${index}`;
    const created = await probe(`${SERVER_URL}/wp/v2/users`, {
        method: 'post',
        headers: ADMIN,
        data: {
            username: `pp_edge_${stamp}`,
            email: `pp_edge_${stamp}@example.test`,
            password: `PpEdge#${stamp}`,
            roles: ['seller'],
        },
    });
    const vendorId = typeof created.json?.id === 'number' ? String(created.json.id) : '';
    if (!vendorId) {
        throw new Error(`could not create pool vendor ${index} (${created.status}): ${created.text.slice(0, 200)}`);
    }

    const [, productId] = await apiUtils().createProduct(
        { ...payloads.createProduct(), name: `PP Edge Pool Product ${index}`, regular_price: '11.00' },
        payloads.adminAuth,
    );

    // The product is created by the admin and then re-authored: neither the Dokan nor the
    // WooCommerce products endpoint accepts an author, and the author IS the vendor here.
    await dbUtils.dbQuery(`UPDATE ${DB_PREFIX}_posts SET post_author = ? WHERE ID = ?;`, [Number(vendorId), Number(productId)]);

    await seedPayPalConnectedVendor(vendorId, PAYPAL_MERCHANTS.vendor1, { email: `pp_edge_${stamp}@example.test` });

    return { vendorId, productId };
}

/**
 * Grow the pool to `size` entries, reusing everything already built, and RE-SEED every entry it
 * hands back.
 *
 * The re-seed is not belt-and-braces: three cases here deliberately disconnect a pool vendor, and
 * a case that dies between the disconnect and its own restore would otherwise leave the next one
 * with a cart it believes is fully connected. That is precisely the shape where a later test
 * fails — or worse, passes — for a reason that has nothing to do with what it is testing, so each
 * caller states its precondition instead of inheriting it.
 */
export async function ensureVendorPool(size: number): Promise<PoolEntry[]> {
    while (vendorPool.length < size) {
        vendorPool.push(await createPoolEntry(vendorPool.length));
    }

    const entries = vendorPool.slice(0, size);
    for (const entry of entries) {
        const seeded = await seedPayPalConnectedVendor(entry.vendorId, PAYPAL_MERCHANTS.vendor1, { email: `pp_edge_${entry.vendorId}@example.test` });
        expect(seeded.receivable, `pool vendor ${entry.vendorId} must read as PayPal-payable before this case starts, or its cart is not the cart it claims to be testing`).toBe(true);
    }
    return entries;
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

/**
 * What WooCommerce priced, read back off the order it created.
 *
 * Nothing here is re-derived in a test. This store charges tax (`woocommerce_calc_taxes=yes`, a
 * 5% rate that applies to SHIPPING too), so `price x quantity` is NOT the order total and a case
 * that embeds that arithmetic asserts about an order the site never created. Reading the server's
 * own figures keeps every expectation correct if the tax rate changes, and still fails loudly if
 * the PayPal purchase unit disagrees with the order.
 */
export interface CreatedOrder {
    id: string;
    /** Grand total, tax INCLUDED — the figure the customer is charged. */
    total: string;
    /** Sum of the line-item totals WooCommerce priced, tax EXCLUDED. */
    itemsSubtotal: string;
    /** Shipping total, tax EXCLUDED. */
    shippingTotal: string;
}

export const createdOrderIds: string[] = [];

export async function createOrder(lineItems: Array<{ product_id: number; quantity: number }>, extra: Record<string, unknown> = {}): Promise<CreatedOrder> {
    const res = await probe(`${SERVER_URL}/wc/v3/orders`, {
        method: 'post',
        headers: ADMIN,
        data: {
            payment_method: PAYPAL_IDS.gateway,
            payment_method_title: 'PayPal Marketplace',
            set_paid: false,
            status: 'pending',
            customer_id: Number(CUSTOMER_ID),
            billing: payloads.createOrder.billing,
            line_items: lineItems,
            ...extra,
        },
    });
    const body = (res.json ?? {}) as { id?: number; total?: string; shipping_total?: string; line_items?: Array<{ total?: string }> };
    if (!body.id) {
        throw new Error(`createOrder failed (${res.status}): ${res.text.slice(0, 300)}`);
    }
    createdOrderIds.push(String(body.id));
    const itemsSubtotal = (body.line_items ?? []).reduce((sum, item) => sum + Number(item.total ?? 0), 0);
    return {
        id: String(body.id),
        total: String(body.total ?? '0'),
        itemsSubtotal: itemsSubtotal.toFixed(2),
        shippingTotal: String(body.shipping_total ?? '0'),
    };
}

/** `deleteOrder()` is imported: a real HTTP DELETE — a POST to the same URL hits WooCommerce's
 * EDITABLE route and silently updates instead. */

export async function deleteProduct(productId: string): Promise<void> {
    await probe(`${SERVER_URL}/wc/v3/products/${productId}?force=true`, { method: 'delete', headers: ADMIN }).catch(() => undefined);
}

/* ------------------------------------------------------------------ */
/* Outbound PayPal payload capture (mu-plugin probe)                   */
/* ------------------------------------------------------------------ */

export interface MoneyValue {
    currency_code?: string;
    value?: string;
}

export interface PurchaseUnit {
    reference_id?: string;
    amount?: MoneyValue & { breakdown?: Record<string, MoneyValue | undefined> };
    payee?: { merchant_id?: string };
    items?: Array<{ name?: string; unit_amount?: MoneyValue; quantity?: number }>;
    payment_instruction?: { disbursement_mode?: string; platform_fees?: Array<{ amount?: MoneyValue }> };
}

export interface CreateOrderPayload {
    intent?: string;
    purchase_units?: PurchaseUnit[];
}

/**
 * Ask the module to build and send a PayPal order for `orderId`, as the customer who owns it.
 *
 * `check_order_permission()` (PayPalController.php:195) allows the order's own logged-in
 * customer, which Basic auth as the customer satisfies. With the interceptor armed, everything up
 * to and including `wp_json_encode( $create_order_data )` runs for real and nothing leaves the
 * host.
 */
export async function createPaymentAsCustomer(orderId: string): Promise<Probe> {
    return probe(`${SERVER_URL}/dokan/v1/paypal-marketplace/create-payment/${orderId}`, { method: 'post', headers: CUSTOMER });
}

/** Money strings PayPal accepts: fixed decimal places for the store currency, no exponent, no drift. */
export function moneyPattern(currency: string): RegExp {
    return ZERO_DECIMAL_CURRENCIES.includes(currency.toUpperCase()) ? /^-?\d+$/ : /^-?\d+\.\d{2}$/;
}

/**
 * Minor units, or NaN for anything that is not a number.
 *
 * The NaN is deliberate. `Number('')` is 0, so a helper that quietly coerced a MISSING amount
 * would make `expect(cents(breakdown.item_total)).toBe(0)` pass against a payload that carried no
 * item_total at all — the assertion would be reporting the absence of the field as the value it
 * was hoping for.
 */
export const cents = (value: string): number => (value.trim() === '' || Number.isNaN(Number(value)) ? Number.NaN : Math.round(Number(value) * 100));

/** Every money string in a purchase unit, labelled, so a failure names the field that drifted. */
export function collectMoneyStrings(unit: PurchaseUnit): Array<{ label: string; value: string }> {
    const out: Array<{ label: string; value: string }> = [];
    const push = (label: string, money: MoneyValue | undefined): void => {
        if (money && typeof money.value === 'string') {
            out.push({ label, value: money.value });
        }
    };

    push('amount', unit.amount);
    for (const [key, money] of Object.entries(unit.amount?.breakdown ?? {})) {
        push(`amount.breakdown.${key}`, money);
    }
    (unit.items ?? []).forEach((item, index) => push(`items[${index}].unit_amount`, item.unit_amount));
    (unit.payment_instruction?.platform_fees ?? []).forEach((fee, index) => push(`payment_instruction.platform_fees[${index}].amount`, fee.amount));

    return out;
}

/**
 * PayPal rejects a purchase unit whose breakdown does not add up to `amount.value`
 * (UNPROCESSABLE_ENTITY / AMOUNT_MISMATCH), so this is the one arithmetic identity the payload
 * must satisfy no matter what the order contains.
 */
export function breakdownTotalInCents(unit: PurchaseUnit): number {
    const breakdown = unit.amount?.breakdown ?? {};
    // An absent breakdown line contributes nothing; only a PRESENT one is converted, so a missing
    // key cannot poison the sum with NaN and a present-but-unparseable one still does.
    const read = (key: string): number => {
        const value = breakdown[key]?.value;
        return typeof value === 'string' && value.trim() !== '' ? cents(value) : 0;
    };
    return read('item_total') + read('tax_total') + read('shipping') + read('handling') + read('insurance') - read('discount') - read('shipping_discount');
}

/** A product owned by VENDOR_ID, who is seeded connected for the whole file. */
export let connectedProductId = '';

export let gatewaySettingsSnapshot: GatewaySettings = {};

export let currencySnapshot = 'USD';

export const createdProductIds: string[] = [];

/** Products of the vendor PP-EDG-12 deletes; the user is gone, the product is reassigned to admin. */
export const doomedVendorProductIds: string[] = [];

export class PayPalMarketplaceEdgePage {
    async setupAll(): Promise<void> {
        // No test.skip() here on purpose: in a beforeAll it voids the entire describe silently.
        // Every gated case carries its own per-test skip naming exactly what is missing.
        api = new ApiUtils(await request.newContext());

        await ensurePayPalConfigured();
        await ensureCustomerAddress();
        await ensureClassicCheckoutPage();
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: 'dokangit@vendor1.com' });

        gatewaySettingsSnapshot = await readGatewaySettings();
        currencySnapshot = await readStoredCurrency();

        const [, productId] = await apiUtils().createProduct(
            { ...payloads.createProduct(), name: 'PP Edge Connected Product', regular_price: '19.00' },
            payloads.vendorAuth,
        );
        connectedProductId = productId;
        createdProductIds.push(productId);
    }

    async teardownEach(): Promise<void> {
        if (Object.keys(gatewaySettingsSnapshot).length > 0) {
            await dbUtils.setOptionValue(GATEWAY_OPTION, gatewaySettingsSnapshot);
        }
        await dbUtils.setOptionValue(CURRENCY_OPTION, currencySnapshot, false);
        await dbUtils.deleteOptionRow([OPT_REJECT_PRODUCT]);
        await disarmInterceptor();
        await dbUtils.clearCustomerCart(CUSTOMER_ID);
    }

    async teardownAll(): Promise<void> {
        // Nothing was created if the beforeAll never got as far as its request context, and
        // throwing from here would replace that failure with a misleading one.
        if (!api) {
            return;
        }

        // The module must never be left deactivated for the specs that run after this file.
        if (!(await activeModuleSlugs()).includes(MODULE_PAYPAL_MARKETPLACE)) {
            await apiUtils().activateModules(MODULE_PAYPAL_MARKETPLACE, payloads.adminAuth);
        }

        for (const orderId of createdOrderIds) {
            await deleteOrder(orderId);
        }
        for (const productId of [...createdProductIds, ...doomedVendorProductIds, ...vendorPool.map(entry => entry.productId)]) {
            await deleteProduct(productId);
        }
        for (const entry of vendorPool) {
            await clearPayPalVendor(entry.vendorId).catch(() => undefined);
            // reassign=1 hands anything still owned by the throwaway vendor to the administrator
            // rather than deleting it, so a stray reference cannot take a real product with it.
            await probe(`${SERVER_URL}/wp/v2/users/${entry.vendorId}?force=true&reassign=1`, { method: 'delete', headers: ADMIN }).catch(() => undefined);
        }

        await apiUtils().dispose();
        api = undefined;
    }

    async ppEdg01({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        expect(
            status.is_ready,
            'baseline: the gateway must be READY before any statement about it being withdrawn means anything — on an unconfigured site it is absent for a reason that has nothing to do with the cart',
        ).toBe(true);

        const [unconnected] = await ensureVendorPool(1);
        if (!unconnected) {
            throw new Error('the vendor pool did not produce an entry');
        }

        await withCustomer(browser, async page => {
            // Positive control first: the connected vendor alone IS offered the gateway.
            await fillCart(page, [connectedProductId]);
            expect(
                await paypalOfferedAtCheckout(page),
                'a cart holding only a CONNECTED vendor must be offered PayPal — without this the "hidden" assertion below would prove nothing about the mixed cart',
            ).toBe(true);

            // Now make one vendor in the cart unconnected and re-check the same surface.
            const cleared = await clearPayPalVendor(unconnected.vendorId);
            expect(cleared.receivable, 'precondition: the second vendor must now read as NOT payable through PayPal').toBe(false);

            await fillCart(page, [connectedProductId, unconnected.productId]);
            expect(
                await paypalOfferedAtCheckout(page),
                'a cart mixing a connected and an unconnected vendor must NOT be offered PayPal: `Helper::validate_cart_items()` breaks out of its loop on the first vendor without `..._enable_for_receive_payment` (Helper.php:1336-1341), so `is_available()` is false. Offering it would let a customer pick a method that cannot pay one of the vendors in their basket',
            ).toBe(false);

            // The second half of the answer the catalogue left open: what a customer who forces
            // the method anyway is told. This is the ONLY code path that produces a message.
            const submission = await submitClassicCheckout(page);
            expect(submission.result, `forcing payment_method=${PAYPAL_IDS.gateway} on a mixed cart must be REJECTED, not accepted`).toBe('failure');
            expect(
                submission.messages,
                'the rejection must name the module\'s own vendor-eligibility error (CartHandler.php:340-353). Anything else means the checkout was stopped by WooCommerce alone and the module never validated the cart at all',
            ).toContain(NOT_ELIGIBLE_CHECKOUT_ERROR);
        });

        log.success('PP-EDG-01: mixed cart — gateway withdrawn at checkout, and a forced submission is rejected with the module\'s vendor-eligibility error.');
    }

    async ppEdg02({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        expect(status.is_ready, 'baseline: a ready gateway, so the rejection below can only come from the cap and not from an unconfigured site').toBe(true);

        const pool = await ensureVendorPool(11);
        // `pool.length` is 11 by construction (`ensureVendorPool()` slices to size), so asserting
        // it proves nothing. What the cap actually counts is DISTINCT `post_author` values, and
        // that is set by the raw UPDATE in `createPoolEntry()` — a statement that matches no rows
        // silently leaves every pool product authored by the administrator, which is ONE vendor
        // group and a cart the cap would rightly never reject.
        const authorRows = await dbUtils.dbQuery(
            `SELECT COUNT(DISTINCT post_author) AS authors FROM ${DB_PREFIX}_posts WHERE ID IN (${pool.map(() => '?').join(',')});`,
            pool.map(entry => Number(entry.productId)),
        );
        expect(
            Number(authorRows?.[0]?.authors ?? 0),
            'the cap counts DISTINCT product authors, so the eleven pool products must really carry eleven different post_author ids — fewer means this cart holds fewer vendor groups than the cap and the rejection below would have to come from somewhere else',
        ).toBe(11);

        await withCustomer(browser, async page => {
            await fillCart(page, pool.map(entry => entry.productId));

            // Every one of the eleven is connected, so the ONLY thing wrong with this cart is its
            // vendor count — which is what makes the assertion below about the cap and nothing else.
            expect(
                await paypalOfferedAtCheckout(page),
                'all eleven vendors are connected, so `validate_cart_items()` passes and the gateway is still OFFERED — the cap is enforced at submission, not at rendering. If PayPal were already hidden here, the rejection below could be caused by an unconnected vendor instead of by the cap',
            ).toBe(true);

            const submission = await submitClassicCheckout(page);
            expect(submission.result, 'an eleven-vendor PayPal checkout must be rejected').toBe('failure');
            expect(
                submission.messages,
                `the rejection must carry the module's own cap message (CartHandler.php:314-328). PayPal itself refuses more than ten payees in one order, so a checkout that gets past this point fails at PayPal with an opaque error after the customer has already committed`,
            ).toContain(CAP_ERROR);
            expect(
                submission.messages,
                'no vendor-eligibility error may appear: all eleven vendors are connected, and its presence would mean the cart was rejected for the wrong reason',
            ).not.toContain(NOT_ELIGIBLE_CHECKOUT_ERROR);
        });

        log.success('PP-EDG-02: eleven-vendor cart rejected with the exact ten-vendor cap message.');
    }

    async ppEdg03({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        expect(status.is_ready, 'baseline: a ready gateway').toBe(true);

        const pool = await ensureVendorPool(10);
        const boundaryVendor = pool[9];
        if (!boundaryVendor) {
            throw new Error('the vendor pool did not produce ten entries');
        }

        await withCustomer(browser, async page => {
            await fillCart(page, pool.map(entry => entry.productId));

            expect(
                await paypalOfferedAtCheckout(page),
                'ten connected vendors is the largest cart PayPal supports, so the gateway must still be OFFERED. `count( $available_vendors ) > 10` (CartHandler.php:314) is strictly greater — an off-by-one here would refuse a cart PayPal accepts',
            ).toBe(true);

            // Proving a NEGATIVE ("the cap message is absent") needs proof the validator ran at
            // all on this ten-vendor cart. Disconnecting one of the ten makes the same hook emit
            // its OTHER message, from the loop that runs immediately after the cap check over the
            // very same `$available_vendors` grouping.
            const cleared = await clearPayPalVendor(boundaryVendor.vendorId);
            expect(cleared.receivable, 'precondition: one of the ten now reads as not payable').toBe(false);

            const submission = await submitClassicCheckout(page);
            expect(submission.result, 'the probe submission is expected to fail — one of the ten vendors was deliberately disconnected').toBe('failure');
            expect(
                submission.messages,
                'positive control: `CartHandler::after_checkout_validation()` must have run over this ten-vendor cart and emitted its per-vendor error. Without it, the absence of the cap message below would be consistent with the hook never running',
            ).toContain(NOT_ELIGIBLE_CHECKOUT_ERROR);
            expect(
                submission.messages,
                'ten vendor groups must NOT trigger the cap. If the cap message appears here the boundary is off by one and every ten-vendor marketplace basket is refused a payment method it is entitled to',
            ).not.toContain(CAP_ERROR);
        });

        log.success('PP-EDG-03: ten-vendor cart offered PayPal, and the cap message stays silent while the validator provably runs.');
    }

    async ppEdg04({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        expect(status.is_ready, 'baseline: `validate_vendor_is_connected()` returns early unless `Helper::is_ready()` (CartHandler.php:380)').toBe(true);

        const [unconnected] = await ensureVendorPool(1);
        if (!unconnected) {
            throw new Error('the vendor pool did not produce an entry');
        }

        // Snapshot every OTHER enabled gateway so the site is put back exactly as it was.
        const gatewaysProbe = await probe(`${SERVER_URL}/wc/v3/payment_gateways`, { headers: ADMIN });
        const allGateways = Array.isArray(gatewaysProbe.json) ? (gatewaysProbe.json as unknown as Array<{ id: string; enabled: boolean }>) : [];
        expect(allGateways.length, 'the WooCommerce payment-gateways endpoint must answer, otherwise this case cannot control which gateways are offered').toBeGreaterThan(0);
        const otherEnabled = allGateways.filter(gateway => gateway.enabled && gateway.id !== PAYPAL_IDS.gateway).map(gateway => gateway.id);

        const setGatewayEnabled = async (gatewayId: string, enabled: boolean): Promise<void> => {
            await probe(`${SERVER_URL}/wc/v3/payment_gateways/${gatewayId}`, { method: 'put', headers: ADMIN, data: { enabled } });
        };

        try {
            for (const gatewayId of otherEnabled) {
                await setGatewayEnabled(gatewayId, false);
            }

            const cleared = await clearPayPalVendor(unconnected.vendorId);
            expect(cleared.receivable, 'precondition: the vendor whose product is being added is NOT payable through PayPal').toBe(false);

            await withCustomer(browser, async page => {
                // Precondition proof, read off the real checkout: exactly one payment method is
                // offered, and it is PayPal. `validate_vendor_is_connected()` returns early when
                // `count( $available_gateways ) > 1` (CartHandler.php:384), so without this the
                // "blocked" branch below could simply never be entered.
                await fillCart(page, [connectedProductId]);
                await page.goto(CHECKOUT_URL, { waitUntil: 'domcontentloaded' });
                // Anchored on the form. This is the ONE state in the file where PayPal is not just
                // offered but CHOSEN — it is the only gateway left — and the module then hides the
                // WooCommerce submit button on purpose, replacing it with its own smart button:
                // `CartHandler::display_paypal_button()` calls `$( '#place_order' ).hide()` on
                // document.ready when the checked method is the gateway (CartHandler.php:257-270),
                // and `toggle_buttons()` animates it to display:none once the SDK loads
                // (assets/src/js/paypal-checkout.js:24-45, 512-514). Waiting for #place_order here
                // waits for a button the product is designed not to show.
                await expect(page.locator(PayPalMarketplacePage.classic.form), 'the classic checkout page must render the order form').toBeVisible({ timeout: 60_000 });
                await expect(
                    page.locator(PayPalMarketplacePage.misc.paymentMethodRow),
                    'exactly one payment method may be offered for this case to mean anything — PayPal must be the ONLY available gateway',
                ).toHaveCount(1);
                // Identity is read off the radio's VALUE rather than its visibility: WooCommerce
                // itself hides the radio when a single gateway is available (frontend/checkout.js
                // `init_payment_methods()`, "If there is one method, we can hide the radio input").
                // The value pins which method that sole entry is, which is what this precondition
                // is actually claiming.
                await expect(
                    page.locator(PayPalMarketplacePage.misc.paymentMethodInput),
                    'and that one method must be PayPal Marketplace',
                ).toHaveValue(PAYPAL_IDS.gateway);

                // The cart must be EMPTY for the add: with an unconnected vendor already in it the
                // gateway would not be available and the guard would never run.
                await dbUtils.clearCustomerCart(CUSTOMER_ID);

                await page.goto(siteUrl(`/?p=${unconnected.productId}&add-to-cart=${unconnected.productId}`), { waitUntil: 'domcontentloaded' });
                const blockedNotice = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
                expect(
                    blockedNotice,
                    'with PayPal the only gateway, adding an unconnected vendor\'s product must be refused with the module\'s own notice (CartHandler.php:393-404) — otherwise the customer fills a basket that no available gateway can pay for',
                ).toContain(NOT_ELIGIBLE_ADD_TO_CART_ERROR);

                const cartAfterBlock = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
                expect(
                    cartCarriesProduct(cartAfterBlock, unconnected.productId),
                    'the notice is not enough: `validate_vendor_is_connected()` returns false, so the product must genuinely NOT be in the cart',
                ).toBe(false);

                // Control: the same add, the same vendor, the same product — with a second gateway
                // available. The guard must now stand down.
                const secondGateway = otherEnabled[0];
                expect(secondGateway, 'the site must have at least one other gateway to re-enable, or the permitted half of this case cannot be tested').toBeTruthy();
                await setGatewayEnabled(String(secondGateway), true);

                await page.goto(siteUrl(`/?p=${unconnected.productId}&add-to-cart=${unconnected.productId}`), { waitUntil: 'domcontentloaded' });
                const cartAfterAllow = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
                expect(
                    cartCarriesProduct(cartAfterAllow, unconnected.productId),
                    `with ${String(secondGateway)} also available the guard must stand down and the product must be added: the block exists only to stop a basket that NOTHING can pay for, and blocking it while another gateway can complete the order would cost the marketplace the sale`,
                ).toBe(true);
            });
        } finally {
            for (const gatewayId of otherEnabled) {
                await setGatewayEnabled(gatewayId, true);
            }
        }

        log.success('PP-EDG-04: add-to-cart blocked with PayPal as the sole gateway, permitted as soon as a second gateway is available.');
    }

    async ppEdg05({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        expect(status.is_ready, 'baseline: a ready gateway, so "not offered" below can only come from the filter').toBe(true);

        // The filter itself is registered by tests/pw/mu-plugins/dokan-paypal-marketplace-edge-probes.php
        // and does nothing until this option names a product.
        await withCustomer(browser, async page => {
            await fillCart(page, [connectedProductId]);

            expect(await paypalOfferedAtCheckout(page), 'baseline: with the filter unarmed the gateway is offered for this cart').toBe(true);

            // Arm it against a DIFFERENT product than the one in the cart. A filter that returned
            // a blanket false would already hide the gateway here, and the real assertion would
            // then prove nothing about item selectivity.
            await dbUtils.setOptionValue(OPT_REJECT_PRODUCT, String(Number(connectedProductId) + 100000), false);
            expect(
                await paypalOfferedAtCheckout(page),
                'a filter rejecting a product that is NOT in the cart must leave the gateway offered — if it does not, the hook is being applied without the cart in scope and the next assertion would pass for the wrong reason',
            ).toBe(true);

            await dbUtils.setOptionValue(OPT_REJECT_PRODUCT, connectedProductId, false);
            expect(
                await paypalOfferedAtCheckout(page),
                '`dokan_paypal_marketplace_validate_cart_items` (Helper.php:1349) is the module\'s documented way for a marketplace to refuse a specific cart item. Returning false there must withdraw the gateway, or the extension point is decorative and any integration relying on it silently lets the item through',
            ).toBe(false);
        });

        // Recorded, because the catalogue expected a message: this filter path produces NONE. It
        // feeds `is_available()` only, so the gateway simply disappears from checkout; the only
        // messages the module emits come from `CartHandler::after_checkout_validation()`, which is
        // a different hook (see PP-EDG-01).
        log.success('PP-EDG-05: the validate_cart_items filter withdraws the gateway for the named item only — silently, with no customer-facing message.');
    }

    async ppEdg06({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const baseline = await getPayPalStatus();
        test.skip(!baseline.module_active, MODULE_SKIP);
        expect(baseline.is_ready, 'baseline: the gateway is ready and offered BEFORE the module is deactivated').toBe(true);

        const settingsField = PayPalMarketplacePage.admin.enableDisablePayPalMarketplace;

        try {
            await withCustomer(browser, async page => {
                await fillCart(page, [connectedProductId]);
                expect(await paypalOfferedAtCheckout(page), 'baseline: the gateway is offered at checkout while the module is active').toBe(true);
            });

            await withAdmin(browser, async page => {
                await page.goto(siteUrl(PayPalMarketplacePage.ADMIN_SETTINGS_URL), { waitUntil: 'domcontentloaded' });
                await expect(page.locator(settingsField), 'baseline: the gateway settings section renders while the module is active').toBeVisible();
            });

            const routeBaseline = await probe(ROUTE_CREATE_CART_PAYMENT, { method: 'post' });
            expect(
                errorCode(routeBaseline),
                'baseline: the module REST route is registered — it answers its own empty-cart error rather than rest_no_route',
            ).toBe('dokan_paypal_empty_cart');

            await apiUtils().deactivateModules(MODULE_PAYPAL_MARKETPLACE, payloads.adminAuth);

            expect(
                await activeModuleSlugs(),
                `deactivating must remove ${MODULE_PAYPAL_MARKETPLACE} from dokan_pro_active_modules; if it does not, everything below is describing a module that is still running`,
            ).not.toContain(MODULE_PAYPAL_MARKETPLACE);

            await withAdmin(browser, async page => {
                await page.goto(siteUrl(PayPalMarketplacePage.ADMIN_SETTINGS_URL), { waitUntil: 'domcontentloaded' });
                // The admin screen must still be a screen: WooCommerce falls back to the payment
                // methods table for an unknown section, and asserting absence on an error page
                // would pass for the wrong reason.
                await expect(page.locator(PayPalMarketplacePage.misc.settingsForm), 'the WooCommerce settings screen must still render after the module is deactivated').toBeVisible();
                await expect(
                    page.locator(settingsField),
                    'with the module deactivated the gateway is never registered, so its settings section must be gone — leaving a configurable gateway that no longer exists is how an admin ends up believing PayPal is live',
                ).toHaveCount(0);
            });

            const routeAfter = await probe(ROUTE_CREATE_CART_PAYMENT, { method: 'post' });
            expect(
                errorCode(routeAfter),
                'the module REST controller must be gone with the module: `Module::register_rest_route()` only registers when the container holds paypal_controller (module.php:67-73)',
            ).toBe('rest_no_route');

            await withCustomer(browser, async page => {
                await fillCart(page, [connectedProductId]);
                expect(
                    await paypalOfferedAtCheckout(page),
                    'a deactivated module must not offer a payment method — a customer who picked it could not be charged, because none of the module\'s payment code is loaded',
                ).toBe(false);
            });
        } finally {
            await apiUtils().activateModules(MODULE_PAYPAL_MARKETPLACE, payloads.adminAuth);
        }

        expect(
            await activeModuleSlugs(),
            'reactivation must restore the module, or every PayPal spec after this one runs against a site with no gateway',
        ).toContain(MODULE_PAYPAL_MARKETPLACE);

        await withAdmin(browser, async page => {
            await page.goto(siteUrl(PayPalMarketplacePage.ADMIN_SETTINGS_URL), { waitUntil: 'domcontentloaded' });
            await expect(page.locator(settingsField), 'the gateway settings section must come back after reactivation').toBeVisible();
        });

        const routeRestored = await probe(ROUTE_CREATE_CART_PAYMENT, { method: 'post' });
        expect(errorCode(routeRestored), 'the module REST route must be registered again after reactivation').toBe('dokan_paypal_empty_cart');

        await withCustomer(browser, async page => {
            await fillCart(page, [connectedProductId]);
            expect(await paypalOfferedAtCheckout(page), 'and the gateway must be offered at checkout again').toBe(true);
        });

        log.success('PP-EDG-06: module deactivation removed the gateway from checkout, settings and REST; reactivation restored all three.');
    }

    async ppEdg07({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        expect(status.is_enabled, 'baseline: the gateway starts ENABLED, so disabling it below is a real state change').toBe(true);

        const settingsField = PayPalMarketplacePage.admin.enableDisablePayPalMarketplace;

        /**
         * `RegisterWithdrawMethods` registers `dokan_vendor_to_array`, which puts the HYPHENATED
         * withdraw-method id on the store payload. Its presence is a faithful oracle for "the
         * withdraw-method controller was constructed".
         *
         * The key matters: the store payload ALSO carries an UNDERSCORED
         * `payment.dokan_paypal_marketplace` object holding the vendor's saved PayPal e-mail.
         * That one is stored vendor data and survives the controller being unloaded, so an
         * assertion on the wrong spelling reports "still loaded" forever.
         */
        const withdrawMethodOnStorePayload = async (): Promise<boolean> => {
            const store = await probe(`${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}`, { headers: ADMIN });
            const payment = (store.json?.payment ?? {}) as Record<string, unknown>;
            return Object.prototype.hasOwnProperty.call(payment, PAYPAL_IDS.withdrawMethod);
        };

        const routeBaseline = await probe(ROUTE_CREATE_CART_PAYMENT, { method: 'post' });
        expect(errorCode(routeBaseline), 'baseline: the module REST controller is loaded while the gateway is enabled').toBe('dokan_paypal_empty_cart');
        expect(await withdrawMethodOnStorePayload(), 'baseline: the withdraw-method controller is loaded while the gateway is enabled').toBe(true);

        await mergeGatewaySettings({ enabled: 'no' });
        expect((await getPayPalStatus()).is_enabled, 'precondition: `Helper::is_enabled()` now reports the gateway disabled').toBe(false);

        const routeDisabled = await probe(ROUTE_CREATE_CART_PAYMENT, { method: 'post' });
        expect(
            errorCode(routeDisabled),
            '`Module::set_controllers()` returns immediately after registering the gateway and the webhook when the gateway is disabled (module.php:100-116), so the REST controller must not be registered. If the route still answers, order and payment code is running for a gateway an admin has switched off',
        ).toBe('rest_no_route');

        expect(
            await withdrawMethodOnStorePayload(),
            'the withdraw-method controller is constructed in the same short-circuited block, so the HYPHENATED withdraw-method key must disappear from the vendor payload while the gateway is disabled',
        ).toBe(false);

        // The other half of the claim: gateway registration and the webhook are OUTSIDE the
        // short-circuit and must survive, or an admin could never switch the gateway back on.
        await withAdmin(browser, async page => {
            await page.goto(siteUrl(PayPalMarketplacePage.ADMIN_SETTINGS_URL), { waitUntil: 'domcontentloaded' });
            await expect(
                page.locator(settingsField),
                '`RegisterGateways` and `WebhookHandler` are constructed BEFORE the is_enabled() short-circuit, so the settings section must still render — a disabled gateway that cannot be re-enabled from its own screen would be unrecoverable',
            ).toBeVisible();
            await expect(page.locator(settingsField), 'and the checkbox must reflect the disabled state that was just written').not.toBeChecked();
        });

        log.success('PP-EDG-07: disabling the gateway unloaded the REST and withdraw-method controllers while gateway registration survived.');
    }

    async ppEdg08({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        /**
         * `WC_AJAX::toggle_gateway_enabled()` is the one place WooCommerce calls `needs_setup()`
         * on a real gateway: for a currently-disabled gateway it answers `needs_setup` and
         * refuses, or enables it and answers success. That makes it a direct, product-side read
         * of the method under test in BOTH directions.
         */
        const probeNeedsSetup = async (page: Page): Promise<{ outcome: 'needs_setup' | 'enabled' | 'error'; raw: string }> => {
            await page.goto(siteUrl('/wp-admin/admin.php?page=wc-settings&tab=checkout'), { waitUntil: 'domcontentloaded' });
            return page.evaluate(async (gatewayId: string) => {
                const admin = (window as unknown as { woocommerce_admin?: { nonces?: { gateway_toggle?: string }; ajax_url?: string } }).woocommerce_admin;
                const nonce = admin?.nonces?.gateway_toggle ?? '';
                if (!nonce) {
                    return { outcome: 'error' as const, raw: 'the woocommerce_admin gateway_toggle nonce was not localised on this screen' };
                }
                const body = new URLSearchParams({ action: 'woocommerce_toggle_gateway_enabled', security: nonce, gateway_id: gatewayId });
                const response = await fetch(admin?.ajax_url ?? '/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: body.toString(),
                });
                const text = await response.text();
                try {
                    const parsed = JSON.parse(text) as { success?: boolean; data?: unknown };
                    if (parsed.success === true) {
                        return { outcome: 'enabled' as const, raw: text.slice(0, 300) };
                    }
                    if (parsed.data === 'needs_setup') {
                        return { outcome: 'needs_setup' as const, raw: text.slice(0, 300) };
                    }
                    return { outcome: 'error' as const, raw: text.slice(0, 300) };
                } catch {
                    return { outcome: 'error' as const, raw: text.slice(0, 300) };
                }
            }, PAYPAL_IDS.gateway);
        };

        // Both conditions the catalogue asks about, at once: switched off AND on a currency the
        // gateway does not support.
        await mergeGatewaySettings({ enabled: 'no' });
        await dbUtils.setOptionValue(CURRENCY_OPTION, UNSUPPORTED_CURRENCY, false);

        const currencyCheck = await getPayPalStatus();
        expect(
            currencyCheck.store_currency,
            `precondition: the store must really be on ${UNSUPPORTED_CURRENCY}, which Helper::get_supported_currencies() has no key for — otherwise "needs_setup ignores currency" is untested`,
        ).toBe(UNSUPPORTED_CURRENCY);
        expect(currencyCheck.is_enabled, 'precondition: the gateway is switched off').toBe(false);

        await withAdmin(browser, async page => {
            const recorded = await probeNeedsSetup(page);
            expect(
                recorded.outcome,
                `recorded behaviour: \`PayPal::needs_setup()\` is \`empty( get_partner_id() ) || ! is_api_ready()\` (PaymentMethods/PayPal.php:620-623) and reads NEITHER the enabled flag NOR the currency, so with credentials stored it reports "no setup needed" even for a gateway that is switched off and cannot transact in ${UNSUPPORTED_CURRENCY}. Anything that treats needs_setup() as a readiness proxy is therefore wrong. Raw answer: ${recorded.raw}`,
            ).toBe('enabled');

            // Control. Without it, "the gateway toggled on" is indistinguishable from a probe that
            // cannot detect needs_setup at all.
            await mergeGatewaySettings({ enabled: 'no', test_app_user: '' });
            const control = await probeNeedsSetup(page);
            expect(
                control.outcome,
                `control: clearing the sandbox client id breaks \`Helper::is_api_ready()\`, which needs_setup() DOES read — the same probe must now answer needs_setup. If it does not, the recorded result above proves nothing. Raw answer: ${control.raw}`,
            ).toBe('needs_setup');
        });

        log.success('PP-EDG-08: needs_setup() recorded as indifferent to both enabled state and currency, with a credential control proving the probe discriminates.');
    }

    async ppEdg09(): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        test.skip(!status.is_enabled, 'the gateway is disabled, so `Module::set_controllers()` never registers the REST controller and this route would answer rest_no_route for a reason that has nothing to do with the cart.');

        // Authorization is blanked EXPLICITLY: request.newContext() inherits the shared config's
        // admin Basic auth otherwise, and this case is about what an anonymous visitor gets.
        const guest = await probe(ROUTE_CREATE_CART_PAYMENT, { method: 'post' });

        expect(
            errorCode(guest),
            'the route must exist for this rejection to mean anything — rest_no_route would satisfy any "guests are rejected" assertion against a module that is not even loaded',
        ).not.toBe('rest_no_route');
        expect(
            errorCode(guest),
            '`check_cart_permission()` (PayPalController.php:81-99) loads the cart and refuses an empty one with dokan_paypal_empty_cart. Any other refusal means the guard fired somewhere else and guests with a real cart may be refused too',
        ).toBe('dokan_paypal_empty_cart');
        expect(guest.status, 'and it must be a 400: the request is well-formed, there is simply nothing to pay for').toBe(400);

        log.success('PP-EDG-09: guest create-payment with an empty cart refused with dokan_paypal_empty_cart (400).');
    }

    async ppEdg10(): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        expect(status.is_ready, 'baseline: the gateway must be ready, or `process_payment()` never builds a payload at all').toBe(true);

        // 123456.78 x 3 is 370370.33999999997 in binary floating point, and the taxed total the
        // store actually charges is another float sum on top of it. Every amount the module emits
        // must still be a plain fixed-point string — PayPal refuses anything with more than the
        // currency's decimal places.
        const [, productId] = await apiUtils().createProduct(
            { ...payloads.createProduct(), name: 'PP Edge High Value Product', regular_price: '123456.78' },
            payloads.vendorAuth,
        );
        createdProductIds.push(productId);

        const order = await createOrder([{ product_id: Number(productId), quantity: 3 }]);
        // The precondition is stated on the LINE SUBTOTAL, which is the part of the order this
        // case controls. The grand total is not `3 x 123456.78`: this store (and CI, from the same
        // setup fixture) charges tax, so asserting the tax-free product of price and quantity
        // describes an order WooCommerce never created. Everything below is derived from
        // `order.total` instead, so the case survives a tax-rate change and still fails if the
        // purchase unit disagrees with the order.
        expect(
            cents(order.itemsSubtotal),
            'precondition: WooCommerce must have priced three units at 123456.78 — the line totals (tax excluded) are what make this the high-value order the case is about',
        ).toBe(37037034);
        expect(
            cents(order.total),
            `precondition: the order total (${order.total}) must be at least that subtotal (${order.itemsSubtotal}); a smaller total means the high-value lines never landed on this order`,
        ).toBeGreaterThanOrEqual(37037034);

        await armInterceptor();
        try {
            const response = await createPaymentAsCustomer(order.id);
            expect(
                response.status,
                `the module must accept the create-payment request for this order — it answered ${response.status}: ${response.text.slice(0, 300)}`,
            ).toBe(200);
            // The status alone cannot say that: `create_payment()` ends in
            // `rest_ensure_response( $process_payment )` (PayPalController.php:284-289) and
            // `PayPal::process_payment()` returns `[ 'result' => 'failure', … ]` inside a 200 when
            // `Processor::create_order()` errors (PayPal.php:310-327). Only the body distinguishes
            // "accepted" from "handed the customer a failed checkout".
            expect(
                String(response.json?.result ?? ''),
                `and it must have SUCCEEDED — a 200 carrying result=failure is a checkout the customer cannot complete: ${response.text.slice(0, 300)}`,
            ).toBe('success');

            const payload = await readCapturedCreateOrder<CreateOrderPayload>();
            expect(
                payload,
                'nothing reached PayPal\'s create-order endpoint, so there is no outgoing payload to inspect. The module either failed before building it or sent it somewhere else',
            ).not.toBeNull();

            const units = payload?.purchase_units ?? [];
            expect(units.length, 'a single-vendor order produces exactly one purchase unit').toBe(1);
            const unit = units[0];
            if (!unit) {
                throw new Error('no purchase unit was captured');
            }

            const currency = status.store_currency;
            const pattern = moneyPattern(currency);
            for (const money of collectMoneyStrings(unit)) {
                expect(
                    money.value,
                    `${money.label} must be a plain fixed-point amount for ${currency}. A float artefact ("370370.33999999997"), an exponent ("3.7037034e+5") or a third decimal is rejected by PayPal outright, and the customer sees a checkout that simply fails`,
                ).toMatch(pattern);
            }

            expect(
                cents(unit.amount?.value ?? ''),
                `the transmitted total must be the order total to the cent (order total ${order.total}, transmitted ${String(unit.amount?.value ?? 'nothing')}). Sending a rounded or drifted amount charges the customer something the marketplace never agreed to`,
            ).toBe(cents(order.total));

            expect(
                breakdownTotalInCents(unit),
                'item_total + tax + shipping + handling + insurance - discount - shipping_discount must equal amount.value. PayPal rejects a purchase unit whose breakdown does not reconcile, so a mismatch here is a checkout that cannot complete at all',
            ).toBe(cents(unit.amount?.value ?? '0'));

            expect(
                unit.payee?.merchant_id ?? '',
                'the purchase unit must carry a payee merchant id, or the money has no destination',
            ).not.toBe('');
        } finally {
            await disarmInterceptor();
        }

        log.success(`PP-EDG-10: order total ${order.total} (subtotal ${order.itemsSubtotal} plus tax) transmitted exactly, every amount string fixed-point, breakdown reconciled.`);
    }

    async ppEdg11(): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);
        expect(status.is_ready, 'baseline: the gateway must be ready, or `process_payment()` never builds a payload at all').toBe(true);

        const [, productId] = await apiUtils().createProduct(
            { ...payloads.createProduct(), name: 'PP Edge Zero Price Product', regular_price: '0' },
            payloads.vendorAuth,
        );
        createdProductIds.push(productId);

        const order = await createOrder([{ product_id: Number(productId), quantity: 1 }], {
            shipping_lines: [{ method_id: 'flat_rate', method_title: 'Flat rate', total: '12.50' }],
        });
        // "Shipping only" is a statement about where the VALUE comes from, not about the grand
        // total: this store taxes shipping, so WooCommerce prices the order above the 12.50 line.
        // Both halves are therefore read off the order itself, and the payload assertions below
        // compare against those figures rather than against 12.50.
        expect(cents(order.itemsSubtotal), 'precondition: the products must contribute nothing — the zero-priced line has to total 0').toBe(0);
        expect(cents(order.shippingTotal), 'precondition: WooCommerce must have recorded the 12.50 flat-rate shipping line, which is the only value in this order').toBe(1250);
        expect(
            cents(order.total),
            `precondition: the order total (${order.total}) is that shipping line plus whatever tax the store applies to it, so it can never fall below the line itself`,
        ).toBeGreaterThanOrEqual(1250);

        await armInterceptor();
        try {
            const response = await createPaymentAsCustomer(order.id);
            expect(response.status, `the module must accept the create-payment request — it answered ${response.status}: ${response.text.slice(0, 300)}`).toBe(200);
            // Same reason as PP-EDG-10: a module-level `result: 'failure'` is still HTTP 200
            // (PayPal.php:310-327), so the status is not a health check on its own.
            expect(
                String(response.json?.result ?? ''),
                `and it must have SUCCEEDED — a 200 carrying result=failure is a checkout the customer cannot complete: ${response.text.slice(0, 300)}`,
            ).toBe('success');

            const payload = await readCapturedCreateOrder<CreateOrderPayload>();
            expect(payload, 'nothing reached PayPal\'s create-order endpoint, so there is no outgoing payload to inspect').not.toBeNull();

            const unit = (payload?.purchase_units ?? [])[0];
            if (!unit) {
                throw new Error('no purchase unit was captured');
            }

            const breakdown = unit.amount?.breakdown ?? {};
            expect(
                cents(unit.amount?.value ?? '0'),
                `the transmitted total must be the total WooCommerce priced (${order.total}), not the bare shipping line — charging anything else charges the customer an amount the marketplace never agreed to`,
            ).toBe(cents(order.total));
            expect(cents(breakdown['item_total']?.value ?? ''), 'item_total must be zero — the only thing being paid for is shipping').toBe(0);
            expect(
                cents(breakdown['shipping']?.value ?? ''),
                `the shipping charge (${order.shippingTotal}) must be carried in the shipping breakdown line, not folded into item_total`,
            ).toBe(cents(order.shippingTotal));

            expect(
                breakdownTotalInCents(unit),
                'the breakdown must still reconcile with a zero item_total. PayPal rejects a mismatched purchase unit, so a shipping-only order would be unpayable',
            ).toBe(cents(order.total));

            // The point of the case: a zero-amount unit must survive the builder rather than being
            // dropped or refused. `adjust_purchase_units_subtotal()` (OrderManager.php:108-133)
            // only adjusts the first NON-zero item, so it must leave this payload untouched.
            const items = unit.items ?? [];
            expect(items.length, 'the zero-priced line item must still be sent — dropping it would leave PayPal with a purchase unit whose items do not describe the order').toBe(1);
            expect(cents(items[0]?.unit_amount?.value ?? ''), 'and it must be sent as an explicit zero amount, not omitted or rewritten').toBe(0);

            const pattern = moneyPattern(status.store_currency);
            for (const money of collectMoneyStrings(unit)) {
                expect(money.value, `${money.label} must still be a plain fixed-point amount when the value is zero`).toMatch(pattern);
            }
        } finally {
            await disarmInterceptor();
        }

        log.success('PP-EDG-11: shipping-only order built a reconciling payload with an explicit zero-amount unit.');
    }

    async ppEdg12({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        // A throwaway vendor, created outside the shared pool: this case DELETES the user, and no
        // suite vendor and no pool entry another case depends on may be lost to it.
        const doomed = await createPoolEntry(9000 + vendorPool.length);
        doomedVendorProductIds.push(doomed.productId);

        const order = await createOrder([{ product_id: Number(doomed.productId), quantity: 1 }]);

        // The capture is SIMULATED through the exact meta the module writes: no real PayPal
        // capture has ever run in this suite, and this case is about display resilience after the
        // fact, not about capture itself. `_dokan_paypal_payment_charge_captured` is what
        // `OrderManager::is_charge_captured()` reads (OrderManager.php:78-97).
        await setOrderMeta(order.id, [
            { key: '_dokan_vendor_id', value: doomed.vendorId },
            { key: '_dokan_paypal_order_id', value: 'E2ECAPTUREDORDER01' },
            { key: '_dokan_paypal_payment_charge_captured', value: 'yes' },
            { key: '_paypal_payment_success', value: 'yes' },
        ]);

        const deletion = await probe(`${SERVER_URL}/wp/v2/users/${doomed.vendorId}?force=true&reassign=1`, { method: 'delete', headers: ADMIN });
        expect(deletion.status, `the throwaway vendor must really be deleted, or this case never reaches the state it exists to test: ${deletion.text.slice(0, 200)}`).toBe(200);

        const gone = await probe(`${SERVER_URL}/wp/v2/users/${doomed.vendorId}`, { headers: ADMIN });
        expect(gone.status, 'precondition: the vendor id on this order now resolves to nothing').toBe(404);

        // Which screen IS the admin order screen depends on High-Performance Order Storage: with
        // HPOS on, `post.php?post=<order>` is not an order screen at all and WordPress answers
        // "Invalid post ID" through wp_die(), which is a 5xx and would fail this case for a reason
        // that has nothing to do with the deleted vendor.
        const hposEnabled = String((await dbUtils.getOptionValueOrNull('woocommerce_custom_orders_table_enabled')) ?? '') === 'yes';
        const orderEditUrl = hposEnabled ? `/wp-admin/admin.php?page=wc-orders&action=edit&id=${order.id}` : `/wp-admin/post.php?post=${order.id}&action=edit`;
        // The list is narrowed to this one order deliberately: its ROW is where Dokan renders the
        // vendor column from the now-missing `_dokan_vendor_id` (Order/Admin/Hooks.php:125), so
        // the row has to be on the page for the case to exercise anything at all — and on an
        // unfiltered list twenty newer orders from a parallel spec would push it to page two.
        // Both storage backends match a numeric search term against the order id unconditionally
        // (OrdersTableSearchQuery::generate_where(), WC_Order_Data_Store_CPT::search_orders()).
        const ordersListUrl = hposEnabled ? `/wp-admin/admin.php?page=wc-orders&s=${order.id}` : `/wp-admin/edit.php?post_type=shop_order&s=${order.id}`;

        await withAdmin(browser, async page => {
            for (const [label, url] of [
                ['order edit screen', orderEditUrl],
                ['orders list', ordersListUrl],
            ] as const) {
                const response = await page.goto(siteUrl(url), { waitUntil: 'domcontentloaded' });
                const statusCode = response ? response.status() : 0;
                const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');

                expect(
                    statusCode,
                    `the ${label} must not answer 5xx after the order's vendor was deleted — a fatal there locks an administrator out of a paid order they still have to refund or fulfil`,
                ).toBeLessThan(500);
                expect(body, `the ${label} must not render WordPress's fatal-error page after the vendor was deleted`).not.toContain('There has been a critical error');
                expect(body, `the ${label} must not leak a raw PHP fatal`).not.toContain('Fatal error');
            }

            // And the order itself must still be USABLE, not merely "not fatal": a screen that
            // renders an empty shell would satisfy every assertion above.
            await page.goto(siteUrl(orderEditUrl), { waitUntil: 'domcontentloaded' });
            await expect(
                page.locator(PayPalMarketplacePage.misc.adminOrderData).first(),
                'the order data panel must still render for an order whose vendor no longer exists (metabox id `woocommerce-order-data`, Internal/Admin/Orders/Edit.php:78)',
            ).toBeVisible({ timeout: 30_000 });

            // The list needs an anchor of exactly the same kind. "under 500 and no fatal string"
            // is satisfied by a redirect to wp-login.php, by a `Sorry, you are not allowed to
            // access this page` wp_die (403 — still under 500) and by an empty admin shell, so
            // without this the whole list half of the case would go green on an expired admin
            // storage state, having rendered no Dokan column code whatsoever.
            await page.goto(siteUrl(ordersListUrl), { waitUntil: 'domcontentloaded' });
            await expect(
                page.locator(PayPalMarketplacePage.misc.adminListTable).first(),
                'the admin orders list must still render its list table after the order\'s vendor was deleted',
            ).toBeVisible({ timeout: 30_000 });
            await expect(
                page.locator(`#order-${order.id}, #post-${order.id}`).first(),
                'and the deleted-vendor order must really be a ROW on that list — HPOS renders `#order-<id>` (Internal/Admin/Orders/ListTable.php:158), the legacy posts table `#post-<id>`. A list that renders without this row never ran the vendor column for the missing `_dokan_vendor_id`',
            ).toBeVisible({ timeout: 30_000 });
        });

        log.success('PP-EDG-12: admin order screens rendered without a fatal for a captured order whose vendor had been deleted.');
    }
}
