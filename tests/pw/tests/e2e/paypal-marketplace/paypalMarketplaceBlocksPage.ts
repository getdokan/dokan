import { Browser } from '@playwright/test';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { test, expect, request } from '@utils/test';
import type { Page } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import {
    PayPalMarketplacePage,
    PAYPAL_IDS,
    withCustomer,
    stockCartWithProof,
    selectClassicPayPal as selectPayPalOnClassicCheckout,
    submitClassicCheckout,
    createBlockPayment,
    CREATE_PAYMENT_ROUTE,
} from './paypalMarketplacePage';
import {
    VENDOR_ID,
    VENDOR2_ID,
    CUSTOMER_ID,
    PAYPAL_MERCHANTS,
    hasCredentials,
    HAS_REAL_MERCHANTS,
    ensurePayPalConfigured,
    getPayPalStatus,
    seedPayPalConnectedVendor,
    clearPayPalVendor,
    getBothMerchantConsents,
    isPayableMerchant,
    ensureCustomerAddress,
    ensureVendorStoreAddress,
    ensureClassicCheckoutPage,
    getOrderMetaValue,
    getPayPalOrder,
    amountOf,
} from './helpers';
import type { PayPalAmount } from './helpers';

/* Selectors live on the page object (SKILL non-negotiable #1: selectors belong in
 * `<slug>Page.ts`). These aliases keep the existing in-file names readable. */
export const CLASSIC = PayPalMarketplacePage.classic;

export const CART = PayPalMarketplacePage.cart;

/**
 * PayPal Marketplace — block (Store API) checkout and cart (PP-BLK-01 … PP-BLK-07).
 *
 * The block path is NOT a skin over the classic one, which is the whole reason this area exists as
 * its own file. Three server-side divergences are load-bearing here and every case below is written
 * against them rather than against an assumed symmetry:
 *
 *  1. **Availability is decided twice.** `CartCheckoutBlockSupport::is_active()` returns only
 *     `Helper::is_ready()` (Blocks/CartCheckoutBlockSupport.php:70), i.e. the SITE-level gate with no
 *     per-vendor check at all. The per-vendor gate arrives separately: the Store API's `cart.payment_methods`
 *     is `get_available_payment_gateways()` (WooCommerce `StoreApi/Schemas/V1/CartSchema.php:368`), which
 *     runs `PayPal::is_available()` → `Helper::validate_cart_items()` (PaymentMethods/PayPal.php:599).
 *     So "gateway hidden for an unconnected vendor" on this path depends on the intersection of two
 *     independent checks, and a test that proves only one of them proves nothing.
 *  2. **The order is created by a different builder.** The block flow calls
 *     `POST /dokan/v1/paypal-marketplace/create-payment` (REST/V1/PayPalController.php:48), which builds the
 *     draft order with `StoreApi\Utilities\OrderController::create_order_from_cart()` and only then hands
 *     it to the same `PayPal::process_payment()` the classic path uses. Classic builds its order with
 *     `WC_Checkout::create_order()`. Two different builders feeding one purchase-unit builder is exactly
 *     where an amount / payee / fee divergence can hide — PP-BLK-03.
 *  3. **Neither path can be driven by clicking "Place order" while `button_type` is `smart`.** The block
 *     hides its own place-order button and submits only from `capturePayment()` after PayPal approves
 *     (assets/src/blocks/payment-support/Components/PayPalPayment.tsx:96-105); the classic script animates
 *     `#place_order` to `display:none` and posts the serialized form itself from inside the SDK's
 *     `createOrder` callback (assets/src/js/paypal-checkout.js:36-44, :128-137). So the two order-creating
 *     cases below invoke the module's OWN transports — `wp.apiFetch` to the block REST route, and a POST of
 *     the serialized classic form to `wc_checkout_params.checkout_url` — from inside the customer's real,
 *     logged-in page. That is the product's code path with the PayPal-hosted approval window (which no API
 *     can grant) left out, not a bypass of it.
 *
 * The gateway IS offered at block checkout for a properly seeded vendor. An earlier apparent
 * block-only absence was the six-key seeding gap described in the catalogue's seeding contract, was
 * investigated to root cause, and is NOT a product bug — it must not be re-filed.
 *
 * Gating, per test, never in `beforeAll` (a `test.skip` there silently voids the whole describe):
 *   - every case needs `hasCredentials`, because `is_ready()` is false without all three keys and a
 *     gateway that can never be ready makes every availability answer meaningless;
 *   - the two cases that create a real PayPal order additionally need merchants PayPal will accept as
 *     payees, probed over the network in the test itself.
 *
 * Never `test.describe.serial` and never tagged `@serial`: `playwright.config.ts:13` grepInverts
 * `@serial` in BOTH lanes (the file would vanish from CI with zero reported failures), and `.serial`
 * aborts the whole group on first failure — on 2026-07-31 that silently erased 46 of 68 cases while the
 * run still summarised as green. A file already runs sequentially in one worker, so it buys nothing.
 */

/* ------------------------------------------------------------------ */
/* Selectors and URLs                                                  */
/* ------------------------------------------------------------------ */

export const BLOCK = PayPalMarketplacePage.block;

/** Classic `[woocommerce_checkout]` shortcode page — `ensureClassicCheckoutPage()` creates it. */

/** WooCommerce cart BLOCK. `.wp-block-woocommerce-cart` is the server-rendered wrapper. */

/* ------------------------------------------------------------------ */
/* Skip reasons — each names exactly what is missing                    */
/* ------------------------------------------------------------------ */

export const CREDENTIALS_SKIP =
    'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / ' +
    'TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE), so Helper::is_ready() is false and the block support class reports the ' +
    'gateway inactive. Every availability answer on this page would then be "absent" for a reason that has nothing to do ' +
    'with the block path — a pass for the wrong reason on the negative cases and a meaningless failure on the positive ' +
    'ones. PP-PRE-01 reports the absence.';

export const MERCHANT_SKIP =
    'no usable connected merchant ids are configured (PAYPAL_MARKETPLACE_VENDOR1_MERCHANT_ID / ' +
    'PAYPAL_MARKETPLACE_VENDOR2_MERCHANT_ID), so `Processor::create_order()` cannot name a payee and no PayPal order can ' +
    'be created to compare. PP-PRE-02 reports this as a documented gap.';

/* ------------------------------------------------------------------ */
/* Log inspection — BOTH locations, deliberately                        */
/* ------------------------------------------------------------------ */

/**
 * `tests/pw`, resolved from this file rather than from `process.cwd()`, which differs between a run
 * started in `tests/pw` and one started at the repo root.
 */
export const PW_ROOT = resolve(__dirname, '../../..');

/**
 * PHP warnings and WooCommerce/Dokan messages land in DIFFERENT files, and checking only one hides
 * defects — that is how PP-SET-23's real cause was nearly missed on 2026-07-31.
 *
 *   - `wp-data/debug.log` — WP_DEBUG_LOG, set to `/var/www/html/wp-data/debug.log` by the wp-env
 *     config (utils/testData.ts:2902) and mapped to the host here. PHP notices/warnings/fatals.
 *   - `wp-content/uploads/wc-logs/` — `dokan_log()` and `WC_Logger` output, which is where the
 *     module writes its own create-order failures.
 *
 * The two contribute DIFFERENT things and are filtered differently. `PHP_DIAGNOSTIC` only matches PHP's
 * own tokens, and the module's WooCommerce-logger lines carry none of them —
 * `dokan_log( '[Dokan PayPal Marketplace] Create Order Data: …' )` and
 * `Helper::log_paypal_error( …, 'dpm_create_order' )` (PaymentMethods/PayPal.php:315-317) would be
 * filtered out before anything looked at them. So the wc-logs location contributes uncaught fatals to the
 * diagnostic filter, and its module-source lines are matched separately by `MODULE_LOG_SOURCE` and
 * REPORTED — a create-order failure logged there is real information even when it raises no PHP notice.
 */
export const DEBUG_LOG = join(PW_ROOT, 'wp-data', 'debug.log');

export const WC_LOG_DIR = resolve(PW_ROOT, '../../../../uploads/wc-logs');

export type LogSnapshot = Record<string, number>;

export function logFiles(): string[] {
    const files: string[] = [];
    if (existsSync(DEBUG_LOG)) {
        files.push(DEBUG_LOG);
    }
    if (existsSync(WC_LOG_DIR)) {
        for (const name of readdirSync(WC_LOG_DIR)) {
            const full = join(WC_LOG_DIR, name);
            if (statSync(full).isFile()) {
                files.push(full);
            }
        }
    }
    return files;
}

/** Byte offsets, so only what the test itself provoked is read back. */
export function snapshotLogs(): LogSnapshot {
    const snapshot: LogSnapshot = {};
    for (const file of logFiles()) {
        snapshot[file] = statSync(file).size;
    }
    return snapshot;
}

/**
 * Everything appended since the snapshot, including whole files that did not exist before (a new
 * `wc-logs` file is created per day and per source, so a first-of-day entry would otherwise be invisible).
 *
 * Sliced on a Buffer rather than a string: the offsets are BYTES, and a multi-byte character anywhere
 * earlier in the file would shift a character-based slice and silently re-report old lines as new.
 */
export function logLinesSince(before: LogSnapshot): string[] {
    const lines: string[] = [];
    for (const file of logFiles()) {
        const from = before[file] ?? 0;
        const buffer = readFileSync(file);
        if (buffer.length <= from) {
            continue;
        }
        for (const line of buffer.subarray(from).toString('utf8').split('\n')) {
            if (line.trim()) {
                lines.push(`${file.split('/').slice(-1)[0]}: ${line.trim()}`);
            }
        }
    }
    return lines;
}

export const PHP_DIAGNOSTIC = /PHP (Notice|Warning|Fatal error|Deprecated|Parse error)|Uncaught (Error|TypeError|ValueError)/i;

/**
 * Attribution: a diagnostic is this module's finding when its own text names PayPal, OR when the
 * SOURCE it came from is the module's code — its block bundle under
 * `dokan-pro/modules/paypal-marketplace/assets/…`, or the PayPal SDK the module loads.
 *
 * The source half is what makes this usable on browser-side evidence. An uncaught
 * `TypeError: Cannot read properties of undefined (reading 'map')` thrown inside the module's block
 * bundle — the exact failure PP-BLK-05 exists to catch, and the one that stops the rest of the block
 * tree rendering — spells nothing in its `message`. It is attributable only through
 * `error.stack` / `console.location().url`, which is why both collectors in PP-BLK-05 now record
 * those alongside the text. `paypal-marketplace` already contains `paypal`, so the alternation adds
 * no new match on its own; it is spelled out because the intent (attribute by SOURCE, not by
 * wording) is not readable from `/paypal/i` alone and a later narrowing of the word branch must not
 * silently take the source branch with it.
 */
export const MODULE_ATTRIBUTED = /paypal|dokan-pro\/modules\/paypal-marketplace/i;

/**
 * The module's own WooCommerce-logger output, which carries no PHP-diagnostic token and is therefore
 * invisible to `PHP_DIAGNOSTIC`. Matched separately so the wc-logs location actually answers something.
 */
export const MODULE_LOG_SOURCE = /\[Dokan PayPal Marketplace\]|dpm_create_order/i;

/* ------------------------------------------------------------------ */
/* PayPal order inspection                                             */
/* ------------------------------------------------------------------ */

/**
 * The reader itself now lives in `helpers.ts` (`getPayPalOrder()`, imported above) beside the token
 * fetch it shares with `getMerchantConsent()`; only the TYPES stay here, because they are what
 * `comparableUnits()` below reads and nothing else in the suite needs them. `helpers.ts` returns
 * `Record<string, unknown>`, which the sandbox-host constant, the explicit `Authorization` header
 * (an omitted one would inherit the config's WordPress admin Basic auth and ship it to paypal.com)
 * and the throw-on-non-ok all come with — so a caller can never assert on `purchase_units` PayPal
 * never sent.
 */
export interface PayPalPurchaseUnit {
    reference_id?: string;
    invoice_id?: string;
    custom_id?: string;
    amount?: PayPalAmount & { breakdown?: Record<string, PayPalAmount | undefined> };
    payee?: { merchant_id?: string; email_address?: string };
    payment_instruction?: { disbursement_mode?: string; platform_fees?: Array<{ amount?: PayPalAmount }> };
}

export interface PayPalOrder {
    id?: string;
    status?: string;
    intent?: string;
    purchase_units?: PayPalPurchaseUnit[];
}

export interface ComparablePurchaseUnit {
    merchantId: string;
    currency: string;
    total: string;
    itemTotal: string;
    taxTotal: string;
    shipping: string;
    discount: string;
    platformFee: string;
    disbursementMode: string;
}

/**
 * The comparable shape of one purchase unit: amounts, payee and fees — the three things PP-BLK-03
 * names — and nothing else.
 *
 * `reference_id` (the order KEY), `invoice_id` (the parent order id) and `custom_id` (the sub-order
 * id) are deliberately excluded: they are per-order identifiers built at
 * `Order/OrderManager.php:167,220-221`, so they differ between the two paths BY DESIGN and comparing
 * them would fail a correct product.
 */
export function comparableUnits(order: PayPalOrder): ComparablePurchaseUnit[] {
    return (order.purchase_units ?? [])
        .map(unit => {
            const breakdown = unit.amount?.breakdown ?? {};
            return {
                merchantId: unit.payee?.merchant_id ?? 'none',
                currency: unit.amount?.currency_code ?? 'none',
                total: amountOf(unit.amount),
                itemTotal: amountOf(breakdown['item_total']),
                taxTotal: amountOf(breakdown['tax_total']),
                shipping: amountOf(breakdown['shipping']),
                discount: amountOf(breakdown['discount']),
                platformFee: amountOf(unit.payment_instruction?.platform_fees?.[0]?.amount),
                disbursementMode: unit.payment_instruction?.disbursement_mode ?? 'none',
            };
        })
        // Sub-order order is not guaranteed to match between two independently built orders, and the
        // case asks about equivalence, not sequence.
        .sort((a, b) => `${a.merchantId}${a.total}`.localeCompare(`${b.merchantId}${b.total}`));
}

/* ------------------------------------------------------------------ */
/* Customer-side driving                                               */
/* ------------------------------------------------------------------ */

/**
 * Put exactly `productIds` in the customer's cart, and PROVE it landed there before anything reads
 * the checkout.
 *
 * The mechanics live in `stockCartWithProof()`; the PROOF MESSAGE stays here, because it names what a
 * missed add would make THIS file's answers a statement about. WooCommerce writes
 * `_woocommerce_persistent_cart_1` from the `woocommerce_add_to_cart` action, which fires only on a
 * SUCCESSFUL add, so its contents are evidence the product is really in this customer's cart. Without
 * that check an add-to-cart that quietly failed would leave an empty cart, and an empty cart offers no
 * payment methods at all — every "gateway not offered" assertion in this file would then pass for the
 * wrong reason, and every positive one would fail pointing at the block path.
 */
export async function stockCart(paypal: PayPalMarketplacePage, productIds: string[]): Promise<void> {
    await stockCartWithProof(
        paypal,
        productIds,
        productId =>
            `the customer cart must hold product ${productId} before any checkout page is read — an empty cart offers no payment methods at all, which would make every availability answer in this test a statement about the cart rather than about the gateway`,
    );
}

/**
 * Select PayPal Marketplace on the CLASSIC checkout, and PROVE the selection took.
 *
 * The mechanics (wait the `update_checkout` cycle out, click the LABEL rather than the hidden radio,
 * then assert `toBeChecked()`) live in `paypalMarketplacePage.ts`. Both messages stay here: the
 * availability one names PP-BLK-02 as the owner of the availability claim, and the selected one names
 * why the assertion is load-bearing on this file's submission path — `submitClassicCheckout()` posts
 * the SERIALIZED form, and an unchecked radio serializes no `payment_method` at all.
 */
export async function selectClassicPayPal(page: Page): Promise<void> {
    await selectPayPalOnClassicCheckout(page, {
        availability: `the classic checkout must offer ${PAYPAL_IDS.gateway} before it can be selected — PP-BLK-02 owns the availability claim, this is the setup step for the order-creating half of PP-BLK-03`,
        selected: `${PAYPAL_IDS.gateway} must end up SELECTED on the classic checkout. The form is submitted by serializing it, so an unchecked radio posts no payment_method and WC_Checkout::process_checkout() rejects the order as "Invalid payment method" — a customer who cannot select the method cannot pay with it either`,
    });
}

/** Vendor 1's product — the connected-vendor baseline used by every positive case. */
export let vendor1ProductId = '';

/** Vendor 2's product — the second payee for the multi-vendor cases, and the "unconnected" cart for PP-BLK-06. */
export let vendor2ProductId = '';

/** Every WooCommerce order these tests create, so none is left behind on the shared site. */
export const createdOrderIds: string[] = [];

export class PayPalMarketplaceBlocksPage {
    async setupAll(): Promise<void> {
        // No test.skip() here on purpose: in a beforeAll it silently voids the entire describe.
        if (!hasCredentials) {
            return;
        }
        await ensurePayPalConfigured();
        await ensureCustomerAddress();
        await ensureClassicCheckoutPage();
        await ensureVendorStoreAddress(VENDOR_ID);
        await ensureVendorStoreAddress(VENDOR2_ID);
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: 'dokangit@vendor1.com' });
        await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' });

        const api = new ApiUtils(await request.newContext());
        const [, product1] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Block Vendor1 Product' }, payloads.vendorAuth);
        const [, product2] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Block Vendor2 Product' }, payloads.vendor2Auth);
        vendor1ProductId = product1;
        vendor2ProductId = product2;
        await api.dispose();
    }

    async teardownAll(): Promise<void> {
        if (!hasCredentials) {
            return;
        }
        // PP-BLK-06 disconnects vendor 2. Re-seeding here is not cosmetic: a case that died mid-test
        // would otherwise hand every later PayPal spec on this worker a vendor that cannot be paid,
        // and those specs would fail or skip for entirely the wrong reason.
        await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' });
        await dbUtils.clearCustomerCart(CUSTOMER_ID);

        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            for (const orderId of createdOrderIds) {
                await ctx.delete(`${SERVER_URL}/wc/v3/orders/${orderId}?force=true`).catch(() => undefined);
            }
            for (const productId of [vendor1ProductId, vendor2ProductId]) {
                if (productId) {
                    await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`).catch(() => undefined);
                }
            }
        } finally {
            await ctx.dispose();
        }
    }

    async ppBlk01({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            `Helper::is_ready() must be true before this page can say anything about the block path — it is enabled AND partner_id AND client id AND client secret (Helper.php:101-117), and CartCheckoutBlockSupport::is_active() returns exactly this value, so a false here means the gateway was never registered with the block registry at all. Observed: enabled=${status.is_enabled}, partner_id present=${status.has_partner_id}, module active=${status.module_active}`,
        ).toBe(true);

        const offered = await withCustomer(browser, async (_page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
            return paypal.isGatewayOfferedAtBlockCheckout();
        });

        expect(
            offered,
            `the block checkout must offer ${PAYPAL_IDS.gateway} for a connected vendor's product — its absence means no customer can pay through PayPal on the site's DEFAULT checkout, which is the block one. Two independent gates decide this and both must hold: CartCheckoutBlockSupport::is_active() (site readiness, already asserted true above) and PayPal::is_available() → Helper::validate_cart_items(), which needs the vendor's six mode-swapped metas — the receive-payment gate among them. Matched on the radio input id "${BLOCK.gatewayRadio}", not on the label, because the label is the admin-editable title setting`,
        ).toBe(true);

        log.success('PP-BLK-01: the gateway renders at block checkout for a connected vendor.');
    }

    async ppBlk02({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        expect(status.is_ready, 'Helper::is_ready() must be true before the classic checkout can be read for availability, or "not offered" would only restate an unconfigured gateway').toBe(true);

        await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
            await page.goto(CLASSIC.url, { waitUntil: 'domcontentloaded' });

            // #place_order renders even when NO gateway is available, so waiting on it is what makes an
            // absent radio mean "not offered" rather than "not rendered yet". It is present in the DOM
            // even while the module animates it out of view for smart buttons, so `toBeAttached` — not
            // `toBeVisible` — is the correct anchor on this gateway's checkout.
            await expect(page.locator(CLASSIC.placeOrder), 'the classic checkout page must render the order form').toBeAttached({ timeout: 60_000 });

            await expect(
                page.locator(CLASSIC.radio),
                `the classic checkout must offer ${PAYPAL_IDS.gateway} too. Both paths have to be proven separately because they diverge in the code: the classic path reads WC_Payment_Gateways::get_available_payment_gateways() directly, while the block path additionally requires the gateway to be registered with the block payment-method registry by CartCheckoutBlockSupport. A regression can therefore remove one and leave the other working`,
            ).toBeAttached({ timeout: 30_000 });
        });

        log.success('PP-BLK-02: the gateway renders on the classic shortcode checkout.');
    }

    async ppBlk03({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);

        const consents = await getBothMerchantConsents();
        const unpayable = Object.entries(consents).filter(([, consent]) => !isPayableMerchant(consent));
        test.skip(
            unpayable.length > 0,
            `PayPal will not accept ${unpayable.map(([label, consent]) => `${label} (${consent.merchantId}): ${consent.reason ?? 'not payments-receivable'}`).join('; ')} as a payee, so create_order() cannot succeed on either path and there would be no purchase units to compare. PP-PRE-04 reports this.`,
        );

        const cart = [vendor1ProductId, vendor2ProductId];

        // BLOCK path — the module's own cart route, from the hydrated block checkout page.
        const blockResult = await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, cart);
            await paypal.gotoBlockCheckout();
            return createBlockPayment(page);
        });

        expect(
            blockResult.__error ?? null,
            `POST ${CREATE_PAYMENT_ROUTE} is the only way the checkout block can start a PayPal payment (PayPalPayment.tsx:145-148). If it fails, the PayPal buttons abort and NO customer can complete a block checkout, which is the site's default checkout`,
        ).toBeNull();

        const blockOrderId = String(blockResult.order_id ?? '');
        const blockPayPalOrderId = String(blockResult.paypal_order_id ?? '');
        if (blockOrderId) {
            createdOrderIds.push(blockOrderId);
        }
        expect(
            blockPayPalOrderId,
            `the block route must return a paypal_order_id — the React component throws "PayPal did not return an order to pay for" without one and the customer never reaches PayPal. Response: ${JSON.stringify(blockResult ?? null).slice(0, 400)}`,
        ).not.toBe('');

        // CLASSIC path — the identical cart through WC_Checkout::process_checkout().
        const classicResult = await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, cart);
            await page.goto(CLASSIC.url, { waitUntil: 'domcontentloaded' });
            await expect(page.locator(CLASSIC.placeOrder), 'the classic checkout page must render the order form before it can be submitted').toBeAttached({ timeout: 60_000 });
            await selectClassicPayPal(page);
            return submitClassicCheckout(page);
        });

        expect(classicResult.__error ?? null, 'the classic checkout POST must reach WC_Checkout::process_checkout(); without it there is no second path to compare against').toBeNull();
        expect(
            classicResult.result,
            `the classic checkout must return result=success. WooCommerce reports the reason in "messages": ${String(classicResult.messages ?? '(none)').slice(0, 400)}`,
        ).toBe('success');

        const classicOrderId = String(classicResult.id ?? '');
        const classicPayPalOrderId = String(classicResult.paypal_order_id ?? '');
        if (classicOrderId) {
            createdOrderIds.push(classicOrderId);
        }
        expect(
            classicPayPalOrderId,
            `the classic checkout response must carry paypal_order_id — PayPal::process_payment() returns it at PaymentMethods/PayPal.php:344. Response: ${JSON.stringify(classicResult ?? null).slice(0, 400)}`,
        ).not.toBe('');

        const [blockOrder, classicOrder] = await Promise.all([getPayPalOrder(blockPayPalOrderId), getPayPalOrder(classicPayPalOrderId)]);
        const blockUnits = comparableUnits(blockOrder);
        const classicUnits = comparableUnits(classicOrder);

        // Reading the two orders back from PayPal is the point: the purchase units are never persisted
        // on the WordPress side, so PayPal's copy is the only record of what each path actually asked
        // for — and it is what a capture would be settled against.
        //
        // ABSOLUTE anchors before the differential ones. Block and classic share more than they differ:
        // `create_cart_payment()` hands its draft order to the same `PayPal::process_payment()`, and the
        // split (`maybe_split_orders`), the per-sub-order loop and `OrderManager::make_purchase_unit_data()`
        // are one implementation serving both. A regression in that shared half is IDENTICAL on both
        // sides, so a purely block-vs-classic comparison passes it: one merged unit compares equal to one
        // merged unit, and two empty purchase-unit lists compare equal to each other. Each anchor below
        // therefore states a knowable literal — the cart holds two vendors, the module hardcodes CAPTURE,
        // the payees are the two seeded merchants — and fails on both paths at once when the shared code
        // breaks.
        for (const [label, units] of [
            ['block', blockUnits],
            ['classic', classicUnits],
        ] as const) {
            expect(
                units.length,
                `the ${label} path must build ONE purchase unit per vendor for this two-vendor cart. A single merged unit pays one merchant for both vendors' goods, and zero units means create_order() sent PayPal nothing to pay for. Units: ${JSON.stringify(units ?? null)}`,
            ).toBe(2);

            expect(
                units.map(unit => unit.merchantId).sort(),
                `the ${label} path must name BOTH seeded merchants as payees — one unit per vendor, each payable to that vendor's own merchant id (OrderManager::make_purchase_unit_data() sets payee.merchant_id from Helper::get_seller_merchant_id()). A wrong or missing payee here routes a vendor's money to somebody else. Units: ${JSON.stringify(units ?? null)}`,
            ).toEqual([PAYPAL_MERCHANTS.vendor1, PAYPAL_MERCHANTS.vendor2].sort());

            for (const unit of units) {
                // `comparableUnits()` defaults an absent `payment_instruction` to 'none' / '0.00'. Without
                // this the fee-and-disbursement third of the comparison below would be two identical
                // defaults on both paths — vacuous rather than green.
                expect(
                    unit.disbursementMode,
                    `every ${label} purchase unit must carry payment_instruction.disbursement_mode. The module always sets it to INSTANT or DELAYED (OrderManager.php:208); 'none' here means PayPal returned no payment_instruction at all, which also takes the platform fee with it — the marketplace would then keep no commission and the whole fee comparison below would be comparing one default to another. Unit: ${JSON.stringify(unit)}`,
                ).toMatch(/^(INSTANT|DELAYED)$/);

                expect(
                    unit.total,
                    `every ${label} purchase unit must ask PayPal for a non-zero amount — the seeded products cost 100-200, so a '0.00' unit means the amount never reached PayPal and a capture would settle nothing for that vendor. Unit: ${JSON.stringify(unit)}`,
                ).not.toBe('0.00');
            }
        }

        expect(
            blockUnits.length,
            `the block path must produce one purchase unit per vendor for a two-vendor cart, the way the classic path does (${classicUnits.length}). A single merged unit would pay one merchant for both vendors' goods. Block units: ${JSON.stringify(blockUnits ?? null)}`,
        ).toBe(classicUnits.length);

        expect(
            blockUnits,
            `the two checkout paths must ask PayPal for the SAME money. They share PayPal::process_payment() but NOT the order builder — the block path builds its order with StoreApi OrderController::create_order_from_cart() (REST/V1/PayPalController.php:164) and the classic path with WC_Checkout::create_order() — so a divergence in totals, payees or platform fees means one path over- or under-pays a vendor, or pays the wrong merchant, for an identical cart. Compared: amounts, breakdown, payee merchant id, platform fee and disbursement mode; the per-order identifiers (reference_id / invoice_id / custom_id) are excluded because they differ by design.\nblock:   ${JSON.stringify(blockUnits ?? null)}\nclassic: ${JSON.stringify(classicUnits ?? null)}`,
        ).toEqual(classicUnits);

        // Intent is hardcoded CAPTURE (PaymentMethods/PayPal.php:285); `payment_action` does not exist in
        // this module, so the literal is knowable and each path is held to it directly. Comparing the two
        // intents to each other instead would pass on `undefined === undefined` — i.e. on both paths
        // losing the constant together, which is precisely what a regression in the shared
        // `process_payment()` would do.
        expect(blockOrder.intent, 'the block path must create a CAPTURE-intent PayPal order; the module hardcodes CAPTURE and an AUTHORIZE (or intent-less) order would never be captured by any handler here').toBe('CAPTURE');
        expect(classicOrder.intent, 'the classic path must create a CAPTURE-intent PayPal order too — same hardcoded constant, asserted separately so a shared regression cannot hide behind an equality between the two paths').toBe('CAPTURE');

        log.success(`PP-BLK-03: block and classic purchase units match across ${blockUnits.length} vendor unit(s).`);
    }

    async ppBlk04({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);

        const consents = await getBothMerchantConsents();
        test.skip(
            Object.values(consents).some(consent => !isPayableMerchant(consent)),
            'PayPal refuses at least one suite merchant as a payee, so the block route cannot create the multi-vendor order this case inspects. PP-PRE-04 reports it.',
        );

        const blockResult = await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, [vendor1ProductId, vendor2ProductId]);
            await paypal.gotoBlockCheckout();
            return createBlockPayment(page);
        });

        expect(blockResult.__error ?? null, 'the block create-payment route must succeed, or there is no multi-vendor block order to inspect').toBeNull();

        const parentOrderId = String(blockResult.order_id ?? '');
        expect(parentOrderId, `the block route must report the WooCommerce order it created. Response: ${JSON.stringify(blockResult ?? null).slice(0, 400)}`).not.toBe('');
        createdOrderIds.push(parentOrderId);

        const childIds = await dbUtils.getChildOrderIds(parentOrderId);
        expect(
            childIds.length,
            `a two-vendor block cart must be split into one sub order per vendor. PayPal::process_payment() calls maybe_split_orders() and then builds one purchase unit per sub order (PaymentMethods/PayPal.php:262-276); without the split, both vendors' goods are paid to whichever merchant the single unit names, and no vendor earning can ever be attributed. Parent order ${parentOrderId}, children found: ${JSON.stringify(childIds ?? null)}`,
        ).toBe(2);

        // Each sub order the purchase units were built from must still be a LIVE row. `process_payment`
        // stamps the disbursement mode on the sub order immediately before making its purchase unit
        // (PaymentMethods/PayPal.php:273-275), so that meta is the evidence a unit was really built from
        // this row rather than the row merely existing.
        //
        // Selected BY ID, not by `parent_order_id = ?`. Re-querying on the parent is how the ids were
        // found in the first place, so a detached child would drop out of both sides of the comparison
        // and the "still points at parent" half of the claim could never fail. Fetching the known ids and
        // reading `parent_order_id` off each row makes both halves — still present, still attached, not
        // trashed — real assertions.
        const liveChildren = (await dbUtils.dbQuery(
            `SELECT id, status, parent_order_id FROM \`${process.env.DB_PREFIX}_wc_orders\` WHERE id IN (?, ?);`,
            childIds,
        )) as Array<{ id: number; status: string; parent_order_id: number }>;

        expect(
            liveChildren.length,
            `every sub order built for this PayPal order must still EXIST as a row. A sub order deleted after its purchase unit was built is exactly the orphan shape DOK-017 describes, and after a capture it takes the vendor's capture id with it — leaving a refund with nothing to reverse. Expected ids ${JSON.stringify(childIds)}, rows found: ${JSON.stringify(liveChildren ?? null)}`,
        ).toBe(childIds.length);

        for (const child of liveChildren) {
            expect(
                String(child.parent_order_id),
                `sub order ${child.id} must still point at parent ${parentOrderId}. A detached child is invisible to every parent-scoped lookup Dokan makes — earnings, refunds and the capture handler all resolve sub orders through the parent — so the vendor's share of a captured payment becomes unreachable. Row: ${JSON.stringify(child)}`,
            ).toBe(String(parentOrderId));

            expect(
                child.status,
                `sub order ${child.id} must not be trashed after its purchase unit was built; PayPal still holds a unit naming that vendor as payee, and a capture would settle money against a row WooCommerce treats as deleted. Row: ${JSON.stringify(child)}`,
            ).not.toBe('trash');
        }

        const disbursementModes = await Promise.all(
            childIds.map(async childId => ({
                childId,
                mode: (await getOrderMetaValue(childId, '_dokan_paypal_payment_disbursement_mode')) ?? null,
            })),
        );
        for (const child of disbursementModes) {
            expect(
                child.mode,
                `sub order ${child.childId} must carry _dokan_paypal_payment_disbursement_mode. process_payment() writes it on each sub order in the same loop that builds that sub order's purchase unit, so a missing value means this row was never turned into a payable unit and the vendor behind it is not in the PayPal order at all`,
            ).not.toBeNull();
        }

        // The orphan-detection query itself, run site-wide: dokan_orders rows whose WooCommerce order no
        // longer exists. Per PP-DIS-14 these are REPORTED, never failed — DOK-017 is an open Low/P3
        // data-hygiene issue with no money impact, and turning it red would poison a single-worker lane
        // that shares one failure budget.
        const orphans = (await dbUtils.dbQuery(
            `SELECT d.order_id, d.seller_id, d.order_status FROM \`${process.env.DB_PREFIX}_dokan_orders\` d
             LEFT JOIN \`${process.env.DB_PREFIX}_wc_orders\` o ON o.id = d.order_id
             WHERE o.id IS NULL;`,
        )) as Array<{ order_id: number; seller_id: number; order_status: string }>;

        // Proving the query can SEE our rows is what stops a green result from meaning "the query
        // matched nothing because it was looking in the wrong place".
        const ourRows = (await dbUtils.dbQuery(
            `SELECT order_id, seller_id FROM \`${process.env.DB_PREFIX}_dokan_orders\` WHERE order_id IN (?, ?);`,
            childIds,
        )) as Array<{ order_id: number; seller_id: number }>;

        if (ourRows.length === childIds.length) {
            log.success(`PP-BLK-04: the orphan query sees both of this order's dokan_orders rows (${JSON.stringify(ourRows)}), so an empty orphan list is a real result.`);
        } else {
            log.warn(
                `PP-BLK-04: only ${ourRows.length} of ${childIds.length} sub orders have a wp_dokan_orders row yet (${JSON.stringify(ourRows)}). Dokan syncs that table when the order reaches a paid/processing status, and this order is still awaiting PayPal approval, so the orphan list below is reported without a positive baseline behind it.`,
            );
        }

        if (orphans.length > 0) {
            log.warn(`PP-BLK-04: ${orphans.length} orphaned wp_dokan_orders row(s) reference a WooCommerce order that no longer exists — reported, not failed, per PP-DIS-14: ${JSON.stringify(orphans.slice(0, 10))}`);
        } else {
            log.success('PP-BLK-04: no orphaned wp_dokan_orders rows on the site.');
        }

        // Declared gap, not a silent one. "Live sub orders retain their capture ids" needs a CAPTURED
        // order, and a capture requires a buyer approving in the PayPal-hosted window — the one step in
        // this module with no API equivalent. Every assertion above is about the pre-capture structure
        // the capture ids would later be written onto.
        const captureIds = await Promise.all(childIds.map(childId => getOrderMetaValue(childId, '_dokan_paypal_payment_charge_captured')));
        if (captureIds.every(value => value === undefined)) {
            log.warn(
                'PP-BLK-04: the capture-id half of this case is NOT covered. No sub order here carries _dokan_paypal_payment_charge_captured because nothing has been captured — that needs a buyer approving in the PayPal-hosted window, which no API can do. This case therefore proves the sub-order structure a capture id would be written onto, and PP-CHK owns the captured-order proof.',
            );
        }

        log.success('PP-BLK-04: the multi-vendor block order split into live, payable sub orders.');
    }

    async ppBlk05({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        // "No error attributable to the module" is an ABSENCE, and an absence is trivially true on a site
        // where the module never ran: `hasCredentials` reads env vars only and asserts nothing about the
        // site, and everything else this case looks at (.wp-block-woocommerce-cart, the line-item row) is
        // WooCommerce core. So the site-level gate is proven first, exactly as PP-BLK-01/-02/-06 do.
        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            `Helper::is_ready() must be true before an empty error list can mean anything — CartCheckoutBlockSupport::is_active() returns exactly this value, and a false here means the payment method was never registered with the block registry, so no module code could have run on the cart page to raise an error in the first place. Observed: enabled=${status.is_enabled}, partner_id present=${status.has_partner_id}, module active=${status.module_active}`,
        ).toBe(true);

        const consoleErrors: string[] = [];
        const pageErrors: string[] = [];

        await withCustomer(browser, async (page, paypal) => {
            // `message.text()` alone is not enough to attribute anything. A browser error message carries
            // no source, so an error raised BY this module's bundle whose wording happens not to spell
            // "PayPal" is indistinguishable from an unrelated theme error — and would be filtered out of
            // the assertion below. `message.location().url` is the only part of a console record that
            // names the file, so it is recorded with the text and the filter sees both.
            page.on('console', message => {
                if (message.type() === 'error') {
                    consoleErrors.push(`${message.text()} @ ${message.location()?.url ?? 'unknown source'}`);
                }
            });
            // An uncaught exception never reaches `console`; only `pageerror` carries it, and an uncaught
            // exception is the failure that actually breaks the block. Playwright hands this callback the
            // real Error object, so `.stack` carries the bundle URL the throw came from — the ONLY
            // evidence that attributes e.g. "TypeError: Cannot read properties of undefined (reading
            // 'map')" to this module rather than to any other script on the page. Recording name+message
            // alone silently discarded it and made that failure unobservable here.
            page.on('pageerror', error => pageErrors.push(`${error.name}: ${error.message}\n${error.stack ?? '(no stack)'}`));

            await stockCart(paypal, [vendor1ProductId]);
            await page.goto(CART.url, { waitUntil: 'domcontentloaded' });
            await page.waitForLoadState('networkidle').catch(() => undefined);

            // The cart block is a React app too: without proof that it rendered a real line item, a
            // zero-error result would only prove that nothing ran.
            await expect(page.locator(CART.wrapper), 'the cart page must be the WooCommerce cart BLOCK; if it renders the shortcode instead, this case is testing a different page than the one it claims').toBeAttached({ timeout: 60_000 });
            // The line item is asserted BEFORE the empty-cart block, and that order is deliberate: the
            // cart block ships both its filled and its empty variant in the server-rendered markup and
            // drops one only after hydrating. Checking for the empty variant first could therefore be
            // answered by a page that had not run any JavaScript yet.
            await expect(page.locator(CART.items).first(), 'the cart block must render the seeded line item, which is what proves the block hydrated before the console was read').toBeVisible({ timeout: 60_000 });
            await expect(page.locator(CART.empty), 'the cart must not render its empty state — a cart with no items exercises none of the module code this case is watching for errors').toHaveCount(0);

            // Site readiness (asserted above) is not the same as "this module put anything on THIS page".
            // `wcSettings.paymentMethodData[<gateway>]` is `CartCheckoutBlockSupport::get_payment_method_data()`,
            // printed by WooCommerce for every ACTIVE registered payment method on the
            // `woocommerce_blocks_cart_enqueue_data` hook (WooCommerce src/Blocks/Payments/Api.php:49) and
            // read back by the module's own bundle as `getSetting('dokan_paypal_marketplace_data', {})`
            // (assets/src/blocks/payment-support/index.tsx:10). Its presence is the proof the module's code
            // is on the cart page at all — without it, "no module-attributable error" and "the module was
            // never here" are the same green.
            const blockPaymentData = await page.evaluate((gatewayId: string) => {
                const registered = (window as unknown as { wcSettings?: { paymentMethodData?: Record<string, unknown> } }).wcSettings?.paymentMethodData ?? {};
                return { own: registered[gatewayId] ?? null, allKeys: Object.keys(registered) };
            }, PAYPAL_IDS.gateway);

            expect(
                blockPaymentData.own,
                `the cart page must carry this module's own block payment-method data under wcSettings.paymentMethodData["${PAYPAL_IDS.gateway}"]. Its absence means CartCheckoutBlockSupport was never registered as an active payment method for this page, so no module JavaScript ran and the empty error list below would be measuring nothing. Payment methods that DID register their data here: ${JSON.stringify(blockPaymentData.allKeys)}`,
            ).not.toBeNull();
        });

        const attributable = [...consoleErrors, ...pageErrors].filter(text => MODULE_ATTRIBUTED.test(text));

        expect(
            attributable,
            `the cart block must raise no error attributable to the PayPal Marketplace module — neither one whose message names it (its React code logs through "[Dokan PayPal Marketplace]") nor one whose SOURCE is its own bundle, which is how an uncaught "TypeError: Cannot read properties of undefined" thrown inside assets/js/blocks*.js is caught here: the console record contributes message.location().url and the pageerror record contributes error.stack, and MODULE_ATTRIBUTED matches either. An uncaught error inside a block prevents the rest of the block tree from rendering, which strands the customer on a broken cart. Errors seen (module-attributable only; ${consoleErrors.length + pageErrors.length} console/page errors total on the page): ${JSON.stringify(attributable ?? null)}`,
        ).toEqual([]);

        if (consoleErrors.length + pageErrors.length > 0) {
            log.info(`PP-BLK-05: ${consoleErrors.length + pageErrors.length} console/page error(s) on the cart page, none attributable to this module: ${JSON.stringify([...consoleErrors, ...pageErrors].slice(0, 5))}`);
        }
        log.success('PP-BLK-05: the cart block rendered with no module-attributable console error.');
    }

    async ppBlk06({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        // Absence is the assertion most able to pass for the wrong reason: on an unconfigured site the
        // gateway is absent from EVERY cart. So the site-level gate is proven ready, and the gateway is
        // proven present for a connected vendor, in this same test — before anything is disconnected.
        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            `Helper::is_ready() must be true, or "gateway absent" below would just be restating an unconfigured gateway and would pass on a site where the block path is completely broken. Observed: enabled=${status.is_enabled}, partner_id present=${status.has_partner_id}, module active=${status.module_active}`,
        ).toBe(true);

        const offeredForConnectedVendor = await withCustomer(browser, async (_page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
            return paypal.isGatewayOfferedAtBlockCheckout();
        });
        expect(
            offeredForConnectedVendor,
            'positive baseline: the gateway must be offered for the CONNECTED vendor first. Without this in the same run, the absence asserted below is indistinguishable from a gateway that is never offered to anybody',
        ).toBe(true);

        const cleared = await clearPayPalVendor(VENDOR2_ID);
        try {
            expect(
                cleared.receivable,
                `vendor ${VENDOR2_ID} must actually read as NOT payable after clearPayPalVendor(); the helper removes BOTH mode variants of all six metas, and if the receive-payment gate survived, the "hidden" result below would be proving nothing. Deleted keys: ${JSON.stringify(cleared.deleted ?? null)}`,
            ).toBe(false);

            const offeredForUnconnectedVendor = await withCustomer(browser, async (_page, paypal) => {
                await stockCart(paypal, [vendor2ProductId]);
                return paypal.isGatewayOfferedAtBlockCheckout();
            });

            expect(
                offeredForUnconnectedVendor,
                `the block checkout must NOT offer ${PAYPAL_IDS.gateway} when the cart holds only a vendor who cannot receive PayPal payments. Helper::validate_cart_items() fails on the first such vendor (Helper.php:1337) and WooCommerce then drops the gateway from get_available_payment_gateways(), which is what the Store API serves the block. Offering it anyway takes the customer's money for goods whose vendor has no way to be paid, and the capture fails at PayPal with an opaque payee error after the order exists`,
            ).toBe(false);
        } finally {
            // Restored inside the test, not only in afterAll: a failure between here and the end of the
            // file would otherwise leave vendor 2 unpayable for every later case in this run.
            await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' });
        }

        log.success('PP-BLK-06: the gateway is hidden for an unconnected vendor and offered for a connected one, both proven in this run.');
    }

    async ppBlk07({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const logsBefore = snapshotLogs();
        // An unreadable log directory would make the PHP-notice half of this case pass with nothing
        // examined, which is the exact fake-green shape the case exists to catch. Say so out loud.
        expect(
            Object.keys(logsBefore).length,
            `neither ${DEBUG_LOG} nor ${WC_LOG_DIR} is readable from the test host, so the PHP-notice half of this case would examine nothing and report green. On wp-env the debug log is written to /var/www/html/wp-data/debug.log (utils/testData.ts:2902) and mapped to tests/pw/wp-data/debug.log; if the container writes elsewhere, this case cannot answer the question it claims to`,
        ).toBeGreaterThan(0);

        const storeApiCalls: Array<{ url: string; status: number }> = [];
        let cartPaymentMethods: string[] | null = null;
        /**
         * Store API traffic the BLOCK itself issued over the network, counted before this test makes
         * its own probe request. Reported rather than asserted on — see `blockCartState` for why a
         * count of zero is correct behaviour on this build rather than a failure.
         */
        let hydrationCalls = -1;
        /**
         * What the checkout block's OWN data layer ended up holding.
         *
         * This, not a request count, is what proves the block reached the Store API here. WooCommerce
         * PRELOADS the cart for this page: `Checkout::enqueue_data()` calls
         * `hydrate_api_request( '/wc/store/v1/cart' )` (`src/Blocks/BlockTypes/Checkout.php:569`), and
         * `AssetDataRegistry::enqueue_asset_data()` prints the response straight into the page as a
         * `wp.apiFetch.createPreloadingMiddleware(...)` call (`Assets/AssetDataRegistry.php:391-398`).
         * The block's `getCartData` resolver is then answered out of that middleware and NO network
         * request is made at all — the 2026-08-01 run's trace confirms it: zero `/wc/store/` responses
         * on the checkout page, the only one in the whole trace being this test's own probe. So the old
         * "at least one Store API request while hydrating" guard asserted something this product does
         * not do, and could only ever pass by counting the test's own traffic.
         *
         * The `wc/store/cart` @wordpress/data store is the honest replacement. It starts as a hardcoded
         * empty default (`items: []`, `itemsCount: 0`, `paymentMethods: []` in `wc-blocks-data.js`) and
         * only the block's own hydration replaces it, so holding the seeded cart means the block really
         * reached its data layer. The read is SYNCHRONOUS `select()`, which is what keeps the guard
         * honest: `fetch()` from the test writes nothing into `wp.data`, and even if the read itself
         * kicked off a resolver, the value returned is whatever the block had already put there.
         */
        let blockCartState: { itemsCount: number; itemIds: number[]; paymentMethods: string[] } = { itemsCount: 0, itemIds: [], paymentMethods: [] };

        await withCustomer(browser, async (page, paypal) => {
            page.on('response', response => {
                const url = response.url();
                if (url.includes('/wc/store/')) {
                    storeApiCalls.push({ url, status: response.status() });
                }
            });

            await stockCart(paypal, [vendor1ProductId]);
            await paypal.gotoBlockCheckout();

            // Frozen here — after the block has hydrated (gotoBlockCheckout() waits for networkidle AND a
            // visible place-order button) and before the probe fetch below adds a request of our own.
            hydrationCalls = storeApiCalls.length;

            // Read in the same window, for the same reason: the block's store, before this test has
            // issued any Store API traffic of its own.
            await page
                .waitForFunction(
                    () => {
                        const data = (window as unknown as { wp?: { data?: { select?: (store: string) => { getCartData?: () => { itemsCount?: number } } | undefined } } }).wp?.data;
                        return Number(data?.select?.('wc/store/cart')?.getCartData?.()?.itemsCount ?? 0) > 0;
                    },
                    undefined,
                    { timeout: 30_000 },
                )
                .catch(() => undefined);

            blockCartState = await page.evaluate(() => {
                const data = (window as unknown as {
                    wp?: { data?: { select?: (store: string) => { getCartData?: () => { itemsCount?: number; items?: Array<{ id?: number }>; paymentMethods?: string[] } } | undefined } };
                }).wp?.data;
                const cart = data?.select?.('wc/store/cart')?.getCartData?.();
                return {
                    itemsCount: Number(cart?.itemsCount ?? 0),
                    itemIds: (cart?.items ?? []).map(item => Number(item?.id ?? 0)),
                    paymentMethods: cart?.paymentMethods ?? [],
                };
            });

            // The Store API's own view of availability, read from the server rather than from the DOM.
            // `cart.payment_methods` is get_available_payment_gateways() (CartSchema.php:368), so this is
            // the value the block renders its radio list from.
            const cart = (await page.evaluate(async () => {
                try {
                    const res = await fetch('/wp-json/wc/store/v1/cart', { credentials: 'same-origin' });
                    return { status: res.status, body: (await res.json()) as { payment_methods?: string[] } };
                } catch (error) {
                    return { status: 0, body: {} as { payment_methods?: string[] }, error: String(error) };
                }
            })) as { status: number; body: { payment_methods?: string[] }; error?: string };

            expect(cart.status, `GET /wp-json/wc/store/v1/cart must answer; the checkout block cannot render at all without it${cart.error ? ` (${cart.error})` : ''}`).toBe(200);
            cartPaymentMethods = cart.body.payment_methods ?? [];
        });

        expect(
            blockCartState.itemIds,
            `the CHECKOUT BLOCK itself must have reached its Store API data layer: its own "wc/store/cart" store must hold the seeded product ${vendor1ProductId}. That store starts as a hardcoded empty cart and is filled only by the block's own hydration — served here out of the server-side preload WooCommerce prints for this page (Checkout.php:569 -> AssetDataRegistry.php:391-398), which is why the block issues no Store API request at all and counting requests could never answer this. An empty store means the page rendered but never got its data, and every other assertion in this case would then be about a page that did nothing. Read synchronously before this test's own /wc/store/v1/cart probe, which writes nothing into wp.data and so cannot satisfy this. Store: ${JSON.stringify(blockCartState)}; Store API requests seen over the network in total (block + probe): ${storeApiCalls.length}, of which the block issued ${hydrationCalls}`,
        ).toContain(Number(vendor1ProductId));

        expect(
            blockCartState.paymentMethods,
            `the block's own cart store must list ${PAYPAL_IDS.gateway} among its payment methods. This is the value the checkout block renders its radio list from, so it is the gateway's availability as the BLOCK sees it — asserted separately from the server-side probe below because a preload that goes stale, or a block that keeps its default empty state, would leave the customer with no PayPal option on a site whose server says the gateway is available. Store: ${JSON.stringify(blockCartState)}`,
        ).toContain(PAYPAL_IDS.gateway);

        const failed = storeApiCalls.filter(call => call.status >= 500);
        expect(
            failed,
            `no Store API request may return a 5xx while the PayPal gateway is active. A 500 on /wc/store/v1/cart or /wc/store/v1/checkout leaves the block checkout permanently unusable — it has no non-JS fallback. Failures: ${JSON.stringify(failed ?? null)}`,
        ).toEqual([]);

        expect(
            cartPaymentMethods,
            `the Store API cart must list ${PAYPAL_IDS.gateway} among its payment methods for a connected vendor's cart. That field is get_available_payment_gateways() intersected with nothing else, so its absence here — with the radio present in PP-BLK-01 — would mean the block renders a method the server does not consider available, and the order would be rejected at place-order time`,
        ).toContain(PAYPAL_IDS.gateway);

        const newLines = logLinesSince(logsBefore);
        const diagnostics = newLines.filter(line => PHP_DIAGNOSTIC.test(line));
        const moduleDiagnostics = diagnostics.filter(line => MODULE_ATTRIBUTED.test(line));

        // Both log locations are read, but they answer different questions. `PHP_DIAGNOSTIC` matches PHP's
        // own tokens, so debug.log supplies the notices/warnings/fatals below and wc-logs supplies only
        // uncaught fatals; the module's own `dokan_log()` / `log_paypal_error()` lines carry no such token
        // and are matched by `MODULE_LOG_SOURCE` instead, reported just below the assertion.
        expect(
            moduleDiagnostics,
            `a block checkout page load must emit no PHP notice, warning or fatal from this module. Each one is a finding in its own right: a notice means an unguarded dereference on a path every block customer takes, and on a site with display_errors on it corrupts the JSON the Store API returns, breaking the checkout outright. Read from ${DEBUG_LOG} and ${WC_LOG_DIR}. Module-attributable lines: ${JSON.stringify(moduleDiagnostics ?? null)}`,
        ).toEqual([]);

        if (diagnostics.length > moduleDiagnostics.length) {
            log.info(`PP-BLK-07: ${diagnostics.length - moduleDiagnostics.length} PHP diagnostic line(s) appeared during this case but name no PayPal source, so they are reported rather than failed: ${JSON.stringify(diagnostics.filter(line => !MODULE_ATTRIBUTED.test(line)).slice(0, 5))}`);
        }

        // The module's own WooCommerce-logger output — the half of the wc-logs location the PHP-diagnostic
        // filter can never see. Reported rather than failed: a plain checkout page load writes nothing here
        // on a healthy site, so any line is a signal worth reading, but it is not by itself a defect.
        const moduleLogLines = newLines.filter(line => MODULE_LOG_SOURCE.test(line) && !PHP_DIAGNOSTIC.test(line));
        if (moduleLogLines.length > 0) {
            log.warn(`PP-BLK-07: ${moduleLogLines.length} WooCommerce-log line(s) written by this module during the page load (no PHP diagnostic token, so reported not failed): ${JSON.stringify(moduleLogLines.slice(0, 5))}`);
        }

        log.success(
            `PP-BLK-07: the block's cart store holds ${blockCartState.itemsCount} item(s) ${JSON.stringify(blockCartState.itemIds)} and offers ${JSON.stringify(blockCartState.paymentMethods)}; ` +
                `${hydrationCalls} Store API request(s) over the network from the block itself (${storeApiCalls.length} including this test's probe — zero from the block is expected, its cart is preloaded), no 5xx, no module PHP notice.`,
        );
    }
}
