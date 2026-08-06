import { test, expect, request } from '@utils/test';
import type { Browser, Page } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import {
    PAYPAL_IDS,
    PAYPAL_BUYER,
    withCustomer,
    waitForCheckoutSettled,
    selectClassicPayPal as selectClassicPayPalOnCheckout,
    submitClassicCheckout,
    driveHostedApproval,
    paypalDiagnostics,
} from './paypalMarketplacePage';
import type { ClassicCheckoutResult } from './paypalMarketplacePage';
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
    getBothMerchantConsents,
    isPayableMerchant,
    ensureCustomerAddress,
    ensureVendorStoreAddress,
    ensureClassicCheckoutPage,
    getOrderMetaValue,
    readPayPalOrder,
    adminContext,
    getWcOrder,
    getDokanOrderRows,
    amountOf,
    near,
} from './helpers';
import type { PayPalAmount, WcOrder, DokanOrderRow } from './helpers';
import { USE_CARD_CAPTURE, CARD, announceCaptureRoute, openCardGates, restoreCardGates, payWithCardOnClassicCheckout } from './paypalMarketplaceCardCheckout';

import { PayPalMarketplacePage } from './paypalMarketplacePage';
/* Selectors live on the page object (SKILL non-negotiable #1: selectors belong in
 * `<slug>Page.ts`). These aliases keep the existing in-file names readable. */
const CLASSIC = PayPalMarketplacePage.classic;

/**
 * PayPal Marketplace — MULTI-VENDOR SPLIT (PP-SPL-01 … PP-SPL-12).
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * WHAT THIS FILE PROVES, AND WHY IT IS DIFFERENT FROM EVERY OTHER FILE IN THIS SUITE
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Every other PayPal spec here asserts on WordPress-side state. This one asserts on PayPal's own
 * copy of the order, because the purchase units are NEVER PERSISTED on the WordPress side: the
 * module builds them in memory inside `PayPal::process_payment()` (PaymentMethods/PayPal.php:270-276),
 * POSTs them to PayPal and keeps only the resulting order id. `GET /v2/checkout/orders/{id}` is
 * therefore the ONLY record of what was actually requested — and it is what a capture would be
 * settled against. Reading a WooCommerce order status instead would prove nothing about who is
 * being paid.
 *
 * The oracle for this area is per purchase unit, not per order:
 *
 *   1. each unit's `payee.merchant_id` is THAT vendor's own merchant id  (PP-SPL-02)
 *   2. each unit's amount + breakdown reconcile to ITS OWN sub order      (PP-SPL-03/06/07/08)
 *   3. each unit's `platform_fees` equals the admin commission on that sub order (PP-SPL-04)
 *   4. after a real capture, sub-order total == vendor earning + admin commission + gateway fee
 *      (PP-SPL-12)
 *
 * A crossed mapping in (1) pays the wrong vendor and is the single most damaging defect this
 * module can have. Nothing WordPress-side would show it — both orders would still read
 * "processing" — which is exactly why the assertions below are anchored on PayPal's response.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * HOW THE ORDERS ARE CREATED — the product's own transports, never a bypass
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Two of the module's own transports are used, both exactly as its shipped JavaScript uses them:
 *
 *   A. CLASSIC CHECKOUT — POST the serialized `form.checkout` to `wc_checkout_params.checkout_url`,
 *      which is what `paypal-checkout.js` `set_order()` does (assets/src/js/paypal-checkout.js:128-137).
 *      Clicking `#place_order` is not an option: the module animates that button to `display:none`
 *      whenever its gateway is selected and `button_type` is `smart` (paypal-checkout.js:36-44), so
 *      the shipped UI never clicks it either. This runs `WC_Checkout::process_checkout()` in full —
 *      real nonce, real address, real cart, real split, real `process_payment()`.
 *
 *   B. PAY-FOR-AN-EXISTING-ORDER — POST `action=dokan_paypal_create_order` to `admin-ajax.php` with
 *      the `dokan_paypal_checkout_nonce` the module prints on any checkout page, which is what
 *      `paypal-checkout.js` `create_order()` does (:143-160). This is the ONLY way to reach a purchase
 *      unit built from an order shape a shopping cart cannot express — an order-level FEE line, in
 *      particular, which is what PP-SPL-05 and PP-SPL-11 are about. `PayPal::process_payment()` is
 *      entirely order-driven and never touches the cart (PaymentMethods/PayPal.php:201-208), so the
 *      purchase units it builds here are built by the same code as at checkout.
 *
 * The PayPal-hosted buyer approval window is driven for real in PP-SPL-12, with
 * `PAYPAL_MARKETPLACE_BUYER_EMAIL` / `PAYPAL_MARKETPLACE_BUYER_PASSWORD`. It is NOT simulated and
 * NOT substituted: on 2026-07-31 the PayPal-hosted partner-consent flow was driven successfully with
 * Playwright against this very sandbox, with no captcha and an ordinary DOM, so "the hosted window
 * cannot be automated" is not an assumption this file is allowed to make. If it turns out to be
 * undrivable the case fails loudly with PayPal's own page title and URL — it never passes.
 *
 * ⛔ **PP-SPL-12 MOVES REAL SANDBOX MONEY.** It captures a PayPal order, which credits two sandbox
 * merchant accounts and writes vendor balance rows. Nothing here fakes a capture, and nothing here
 * asserts on a value this file wrote: if the capture cannot be reached the case fails or skips with
 * the exact reason. Per the suite's standing constraint the money batch needs its own approval
 * before the first run.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * TRAPS THAT HAVE ALREADY PRODUCED FALSE RESULTS IN THIS SUITE — all respected below
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *  - Playwright builds assertion messages EAGERLY, so every `JSON.stringify()` here is guarded with
 *    `?? null`. An un-guarded one turned a passing case into a failure on 2026-07-31.
 *  - `request.newContext()` with no `extraHTTPHeaders` INHERITS the shared config's WordPress admin
 *    Basic auth. Every call to paypal.com below sets `Authorization` EXPLICITLY so admin credentials
 *    are never shipped to PayPal.
 *  - This site has taxes ON (5%, `tax_based_on = shipping`, applied to shipping, prices exclusive),
 *    so no arithmetic total is ever hardcoded here. Every expected figure is read back from the
 *    server that produced it.
 *  - WooCommerce HIDES the payment radio when only one gateway is available (checkout.js:228-231)
 *    and covers `#order_review` with a blockUI overlay for the whole `update_checkout` cycle
 *    (checkout.js:699-707), so the label is clicked after the overlay detaches, never the input with
 *    `force: true`.
 *  - Never `test.describe.serial`, never tagged `@serial`: `.serial` aborts the whole group on the
 *    first failure (that silently erased 46 of 68 cases on 2026-07-31 while the run summarised as
 *    green) and `playwright.config.ts:13` grepInverts `@serial` in BOTH lanes.
 *  - No `test.skip()` in `beforeAll` — there it silently voids the entire describe. Gates are per
 *    test.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * KNOWN OPEN BUGS THAT LIVE IN THE CODE THIS FILE ASSERTS ON — referenced, never re-filed
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *  - DOK-030: for zero-decimal currencies the breakdown does not sum to `amount.value`
 *    (OrderManager.php:54-69 vs :99-125). The store currency here is USD, so it does not fire; the
 *    reconciliation assertions below would catch the same class of defect in USD.
 *  - DOK-031: the purchase unit is stamped with the STORE currency rather than the order's
 *    (OrderManager.php:165). PP-CUR-10 owns that case. This file asserts the unit currency against
 *    the ORDER's currency — which is the correct behaviour and, on a USD store with USD orders, is
 *    satisfied by both the correct and the buggy implementation. It is asserted anyway so the check
 *    is real the day a multi-currency fixture arrives.
 */

/* ------------------------------------------------------------------ */
/* Fixed identifiers                                                   */
/* ------------------------------------------------------------------ */

/** Classic `[woocommerce_checkout]` shortcode page — `ensureClassicCheckoutPage()` creates it. */

/** Single-site persistent-cart user meta — the row `dbUtils.clearCustomerCart()` deletes. */
const PERSISTENT_CART_META = '_woocommerce_persistent_cart_1';

const DB_PREFIX = process.env.DB_PREFIX;

/** vendor id → the merchant id that vendor was seeded with. The mapping PP-SPL-02 checks against. */
const MERCHANT_BY_VENDOR: Record<string, string> = {
    [String(VENDOR_ID)]: PAYPAL_MERCHANTS.vendor1,
    [String(VENDOR2_ID)]: PAYPAL_MERCHANTS.vendor2,
};

/* ------------------------------------------------------------------ */
/* Credential gates — each names exactly what is missing                */
/* ------------------------------------------------------------------ */

const CREDENTIALS_SKIP =
    'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / ' +
    'TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE), so Helper::is_ready() is false, the gateway is never offered at checkout, ' +
    'and no PayPal order can be created to inspect. Every split assertion in this file reads PayPal\'s own copy of an ' +
    'order, so without credentials there is nothing to read. PP-PRE-01 reports the absence.';

const MERCHANT_SKIP =
    'no usable connected merchant ids are configured (PAYPAL_MARKETPLACE_VENDOR1_MERCHANT_ID / ' +
    'PAYPAL_MARKETPLACE_VENDOR2_MERCHANT_ID), so OrderManager::make_purchase_unit_data() cannot name a payee and the ' +
    'split has no per-vendor identity to assert on. PP-PRE-02 reports this as a documented gap.';

const HAS_BUYER_LOGIN = Boolean(PAYPAL_BUYER.email && PAYPAL_BUYER.password);

const BUYER_SKIP =
    'PAYPAL_MARKETPLACE_BUYER_EMAIL / PAYPAL_MARKETPLACE_BUYER_PASSWORD are not set in tests/pw/.env, so the ' +
    'PayPal-hosted approval window cannot be driven and NO capture can happen. There is deliberately no substitute: ' +
    'faking a capture — writing the capture meta from a test route and then asserting on it — would report a working ' +
    'money path where none was proven, which is the worst possible outcome for this area. Supply a sandbox PERSONAL ' +
    'account (developer.paypal.com -> Testing Tools -> Sandbox Accounts) to un-gate this case.';

/**
 * Consent is probed ONCE per worker. `HAS_REAL_MERCHANTS` only inspects the SHAPE of a merchant id;
 * whether that merchant has granted THIS partner app permission to be paid on its behalf is state
 * held entirely on PayPal's side, and only that decides whether a payee is accepted. On 2026-07-31
 * both suite vendors held correctly-shaped, real, UNCONSENTED merchant ids and every money assertion
 * would have failed against PayPal with an opaque payee error.
 */
type Consents = Awaited<ReturnType<typeof getBothMerchantConsents>>;
let cachedConsents: Consents | null = null;

async function unpayableMerchantReasons(): Promise<string[]> {
    if (!cachedConsents) {
        cachedConsents = await getBothMerchantConsents();
    }
    return Object.entries(cachedConsents)
        .filter(([, consent]) => !isPayableMerchant(consent))
        .map(([label, consent]) => `${label} (${consent.merchantId}): ${consent.reason ?? 'not payments-receivable'}`);
}

/* ------------------------------------------------------------------ */
/* PayPal order inspection                                             */
/* ------------------------------------------------------------------ */

interface PayPalItem {
    name?: string;
    sku?: string;
    quantity?: string;
    unit_amount?: PayPalAmount;
}

interface PayPalCapture {
    id?: string;
    status?: string;
    amount?: PayPalAmount;
    seller_receivable_breakdown?: {
        gross_amount?: PayPalAmount;
        paypal_fee?: PayPalAmount;
        net_amount?: PayPalAmount;
        platform_fees?: Array<{ amount?: PayPalAmount }>;
    };
}

interface PayPalPurchaseUnit {
    reference_id?: string;
    invoice_id?: string;
    custom_id?: string;
    amount?: PayPalAmount & { breakdown?: Record<string, PayPalAmount | undefined> };
    payee?: { merchant_id?: string; email_address?: string };
    items?: PayPalItem[];
    payment_instruction?: { disbursement_mode?: string; platform_fees?: Array<{ amount?: PayPalAmount }> };
    payments?: { captures?: PayPalCapture[] };
}

interface PayPalOrder {
    id?: string;
    status?: string;
    intent?: string;
    purchase_units?: PayPalPurchaseUnit[];
    links?: Array<{ rel?: string; href?: string }>;
}

/**
 * This file's own reader, over the shared `readPayPalOrder()`. Both failure strings are this file's
 * and stay here: they name what a split assertion loses when PayPal cannot be read, which is not what
 * any other caller's message says.
 */
async function getPayPalOrder(paypalOrderId: string): Promise<PayPalOrder> {
    return readPayPalOrder<PayPalOrder>(paypalOrderId, {
        tokenFailure: (status: number) =>
            `PayPal refused a client-credentials token (HTTP ${status}). The purchase units cannot be read back from PayPal without one, so no split assertion in this file can be answered. Check TEST_CLIENT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE and that the sandbox REST app is of type Platform, not Merchant.`,
        orderFailure: ({ status, message }) =>
            `PayPal would not return order ${paypalOrderId} (HTTP ${status}): ${message}. The purchase units are not persisted WordPress-side, so PayPal's copy is the only record of what the split actually asked for — without it this case cannot answer its question at all.`,
    });
}

function num(value: string | number | undefined | null): number {
    return Number(value ?? 0);
}

function unitBreakdown(unit: PayPalPurchaseUnit): Record<string, string> {
    const breakdown = unit.amount?.breakdown ?? {};
    return {
        item_total: amountOf(breakdown['item_total']),
        tax_total: amountOf(breakdown['tax_total']),
        shipping: amountOf(breakdown['shipping']),
        handling: amountOf(breakdown['handling']),
        shipping_discount: amountOf(breakdown['shipping_discount']),
        discount: amountOf(breakdown['discount']),
        insurance: amountOf(breakdown['insurance']),
    };
}

/** Compact, printable form of a unit — used in every failure message so the numbers are on screen. */
function describeUnit(unit: PayPalPurchaseUnit): Record<string, unknown> {
    return {
        invoice_id: unit.invoice_id ?? null,
        custom_id: unit.custom_id ?? null,
        payee: unit.payee?.merchant_id ?? null,
        currency: unit.amount?.currency_code ?? null,
        total: amountOf(unit.amount),
        breakdown: unitBreakdown(unit),
        platform_fee: amountOf(unit.payment_instruction?.platform_fees?.[0]?.amount),
        disbursement_mode: unit.payment_instruction?.disbursement_mode ?? null,
        items: (unit.items ?? []).map(item => ({ name: item.name ?? null, quantity: item.quantity ?? null, unit_amount: amountOf(item.unit_amount) })),
    };
}

function describeUnits(order: PayPalOrder): Array<Record<string, unknown>> {
    return (order.purchase_units ?? []).map(describeUnit);
}

/* ------------------------------------------------------------------ */
/* WooCommerce / Dokan order readers                                   */
/* ------------------------------------------------------------------ */

/** `_dokan_vendor_id` is written on every sub order by Lite's splitter; it is the unit→vendor link. */
function vendorIdOf(order: WcOrder): string {
    const meta = (order.meta_data ?? []).find(entry => entry.key === '_dokan_vendor_id');
    return meta ? String(meta.value) : '';
}

/**
 * `OrderManager::get_tax_amount()` sums `tax_total + shipping_tax_total` over the order's tax rows
 * (OrderManager.php:406-413), which is WooCommerce's `total_tax` — cart tax AND shipping tax.
 * Reproduced here from the REST fields rather than restated as a constant, because this site applies
 * tax to shipping and any hardcoded expectation would be wrong.
 */
function expectedTaxTotal(order: WcOrder): number {
    return num(order.total_tax);
}

/**
 * `$subtotal = $order->get_subtotal() + $order->get_total_fees()` (OrderManager.php:148-149).
 * `get_subtotal()` is the sum of line-item SUBTOTALS (pre-discount, pre-tax).
 */
function expectedItemTotal(order: WcOrder): number {
    const lineSubtotal = (order.line_items ?? []).reduce((sum, item) => sum + num(item.subtotal), 0);
    const fees = (order.fee_lines ?? []).reduce((sum, fee) => sum + num(fee.total), 0);
    return lineSubtotal + fees;
}

/** The admin commission Dokan recorded for one sub order, from its own earnings row. */
function adminCommissionOf(row: DokanOrderRow): number {
    return row.order_total - row.net_amount;
}

/* ------------------------------------------------------------------ */
/* Customer-side driving                                               */
/* ------------------------------------------------------------------ */

interface CartLine {
    productId: string;
    quantity?: number;
}

/**
 * Put exactly `lines` in the customer's cart, and PROVE each one landed there.
 *
 * The proof is taken from the database, not the page: WooCommerce writes
 * `_woocommerce_persistent_cart_1` from the `woocommerce_add_to_cart` action, which fires only on a
 * SUCCESSFUL add. Without it, an add-to-cart that quietly failed leaves a one-vendor cart, the order
 * never splits, and PP-SPL-01's "exactly two units" would fail pointing at the split code when the
 * real fault was the fixture.
 *
 * Kept LOCAL rather than routed through `stockCartWithProof()`: this file's proof message quotes the
 * persistent-cart meta it read back, and the shared helper's `cartProofMessage(productId)` cannot pass
 * that value out — using it would silently drop the evidence from the message.
 */
async function stockCart(page: Page, lines: CartLine[]): Promise<void> {
    await dbUtils.clearCustomerCart(CUSTOMER_ID);
    for (const line of lines) {
        const quantity = line.quantity ?? 1;
        await page.goto(`/?p=${line.productId}&add-to-cart=${line.productId}&quantity=${quantity}`, { waitUntil: 'domcontentloaded' });
    }

    const persistentCart = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
    for (const line of lines) {
        expect(
            persistentCart,
            `the customer cart must hold product ${line.productId} before the checkout is submitted. An add-to-cart that silently failed produces a cart with fewer vendors than this case needs, and every split assertion below would then be a statement about the cart rather than about OrderManager::make_purchase_unit_data(). Persistent cart meta read back: ${JSON.stringify(persistentCart ?? null).slice(0, 400)}`,
        ).toMatch(new RegExp(`"product_id";(i:${line.productId};|s:\\d+:"${line.productId}")`));
    }
}

/**
 * Select PayPal Marketplace on the CLASSIC checkout, and PROVE the selection took.
 *
 * The mechanics live in `paypalMarketplacePage.ts`; both messages stay HERE, because they name what a
 * missing or unselected gateway costs THIS file's split assertions.
 */
async function selectClassicPayPal(page: Page): Promise<void> {
    await selectClassicPayPalOnCheckout(page, {
        availability: `the classic checkout must offer ${PAYPAL_IDS.gateway} before a split order can be created through it. Its absence means Helper::validate_cart_items() rejected at least one vendor in the cart (Helper.php:1337), i.e. a suite vendor is no longer seeded as able to receive PayPal payments — PP-BLK-01/-02 own the availability claim, this is the setup step for the split`,
        selected: `${PAYPAL_IDS.gateway} must end up SELECTED on the classic checkout. The form is submitted by serializing it, so an unchecked radio posts no payment_method and WC_Checkout::process_checkout() rejects the order as "Invalid payment method" — which would look like a split failure and is not one`,
    });
}

/** Everything `PayPal::process_payment()` returns (PaymentMethods/PayPal.php:346-354), plus our own error slot. */
type ProcessPaymentResult = ClassicCheckoutResult;

/**
 * Drive the PAY-FOR-AN-EXISTING-ORDER path exactly as `paypal-checkout.js` `create_order()` does:
 * POST `action=dokan_paypal_create_order` to `admin-ajax.php` with the module's own
 * `dokan_paypal_checkout_nonce` (the checkout bootstrap) and an order id.
 *
 * `OrderController::create_order()` calls `PayPal::process_payment( $order_id )` directly
 * (Order/OrderController.php:193-215), and `process_payment()` is entirely order-driven — it never
 * reads the cart (PaymentMethods/PayPal.php:201). So this builds the purchase units with the same
 * code the checkout uses, from an order shape a cart cannot express (an order-level FEE line, which
 * is what PP-SPL-05 and PP-SPL-11 are about).
 *
 * The response is `wp_send_json_(success|error)( [ 'data' => $process_payment ] )`, hence
 * `res.data.data` on both branches.
 */
async function createPayPalOrderForExistingOrder(page: Page, orderId: string | number): Promise<ProcessPaymentResult> {
    const raw = await page.evaluate(async (id: string) => {
        const w = window as unknown as { jQuery?: any; dokan_paypal?: { nonce?: string; ajaxurl?: string } };
        const cfg = w.dokan_paypal;
        if (typeof w.jQuery !== 'function') {
            return { __error: 'jQuery is not on the page, so the module\'s own admin-ajax transport cannot be used' };
        }
        if (!cfg?.nonce || !cfg?.ajaxurl) {
            return {
                __error:
                    'window.dokan_paypal is missing its nonce/ajaxurl. CartHandler::payment_scripts() only localises it when the gateway is ENABLED and button_type is "smart" (Cart/CartHandler.php:85-131); on any other button type the module never exposes this transport and this fixture cannot be built.',
            };
        }
        try {
            const res = (await w.jQuery.ajax({
                type: 'POST',
                url: cfg.ajaxurl,
                data: { action: 'dokan_paypal_create_order', order_id: id, nonce: cfg.nonce },
                dataType: 'json',
            })) as { success?: boolean; data?: { data?: Record<string, unknown> } };
            return (res?.data?.data ?? res) as Record<string, unknown>;
        } catch (error) {
            const jqxhr = error as { status?: number; responseText?: string };
            return { __error: `dokan_paypal_create_order POST failed (HTTP ${String(jqxhr?.status ?? '?')}): ${String(jqxhr?.responseText ?? error).slice(0, 400)}` };
        }
    }, String(orderId));

    return raw as ProcessPaymentResult;
}

/**
 * Apply a coupon through WooCommerce's OWN checkout transport (`?wc-ajax=apply_coupon`), which is
 * what the "Have a coupon?" form on the classic checkout posts to. Returns WooCommerce's rendered
 * notice so a rejection can be reported verbatim instead of as a silent zero discount.
 */
async function applyCouponAtCheckout(page: Page, code: string): Promise<string> {
    return page.evaluate(async (couponCode: string) => {
        const w = window as unknown as { jQuery?: any; wc_checkout_params?: { wc_ajax_url?: string; apply_coupon_nonce?: string } };
        const params = w.wc_checkout_params;
        if (typeof w.jQuery !== 'function' || !params?.wc_ajax_url || !params?.apply_coupon_nonce) {
            return 'wc_checkout_params.wc_ajax_url / apply_coupon_nonce is missing, so WooCommerce\'s own coupon transport is not on this page';
        }
        try {
            const res = await w.jQuery.post(String(params.wc_ajax_url).replace('%%endpoint%%', 'apply_coupon'), {
                security: params.apply_coupon_nonce,
                coupon_code: couponCode,
            });
            return String(res).slice(0, 600);
        } catch (error) {
            return `apply_coupon POST failed: ${String(error).slice(0, 400)}`;
        }
    }, code);
}

/* ------------------------------------------------------------------ */
/* PayPal-hosted buyer approval — real, on PayPal's own domain          */
/* ------------------------------------------------------------------ */

/**
 * Approve the payment as the sandbox BUYER, on paypal.com, and follow PayPal's redirect back.
 *
 * This is the one step in the whole module with no API equivalent: no PayPal endpoint grants a
 * payer's approval. It is driven for real. On return, `OrderController::maybe_process_order_redirect()`
 * (Order/OrderController.php:489-531) sees `is_order_received_page()` + `wc_payment_method` +
 * `button_type` + `PayerID` on the URL the module itself built as `return_url`
 * (PaymentMethods/PayPal.php:288-296) and performs the CAPTURE server-side, which is what writes the
 * capture ids, the processing fee, the platform fee and the vendor balance rows.
 *
 * The login itself is `driveHostedApproval()` in the page object — ONE driver for the whole suite.
 * This file used to carry its own thinner copy, and on 2026-08-04 that copy cost PP-SPL-12 three
 * full attempts: it submitted the login, waited out 120s for a pay button and reported "undrivable"
 * without ever distinguishing a rejected password, a captcha and a real product failure — while each
 * retry re-submitted the same password, which is exactly what locks the sandbox buyer out. The
 * shared driver diagnoses all three, and only the PayPal-side obstacles become a declared skip.
 *
 * A simulated approval is still never substituted: what this function can do is approve, skip with a
 * named PayPal-side obstacle, or fail.
 */
async function approveAsBuyerOnPayPal(page: Page, approveUrl: string): Promise<void> {
    const outcome = await driveHostedApproval(page, approveUrl);

    if (outcome.blocker) {
        // PayPal-side and unsolvable by any selector — declared, named, and never green.
        test.skip(
            true,
            `PP-SPL-12 cannot exercise the money path on this run: ${outcome.blocker} Steps reached: ${outcome.steps.join(' → ') || '(none)'}.`,
        );
    }

    try {
        // The module's return_url is the order-received page; PayPal appends PayerID to it, which is
        // the trigger maybe_process_order_redirect() keys on.
        await page.waitForURL(/order-received/i, { timeout: 180_000 });
    } catch (error) {
        throw new Error(
            `The buyer approved on PayPal but the browser never reached the order-received page, so the CAPTURE never ran and PP-SPL-12 cannot make any statement about vendor earnings. That page load IS the capture (Order/OrderController.php:489-531), so this is the worst outcome the module has: the money is authorised at PayPal and the shop was never told.\n` +
                `${await paypalDiagnostics(page)}\nSteps reached: ${outcome.steps.join(' → ')}.\nUnderlying failure: ${String(error)}`,
        );
    }
}

/* ------------------------------------------------------------------ */
/* Capture route — PayPal wallet (default) or Advanced Card (UCC)      */
/* ------------------------------------------------------------------ */

/**
 * HOW the buyer approves, chosen EXPLICITLY and never inferred.
 *
 *   unset | `wallet`  the PayPal-hosted approval window. The behaviour this file was written
 *                     against, and the only route that exercises the redirect/return mechanics.
 *   `card`            the Advanced Card / unbranded (UCC) form on OUR OWN checkout page. The buyer
 *                     types a card into PayPal's hosted fields; PayPal never shows a login page.
 *
 * There is deliberately NO silent fallback in either direction. A wallet case that quietly reported
 * green off a card capture — or the reverse — would be a coverage lie, so the route is announced once
 * per file (`announceCaptureRoute()`) and every skip below names which route it is talking about.
 *
 * WHY the switch exists: every wallet case drives a PayPal-hosted buyer LOGIN. On 2026-08-03 roughly
 * fifty of them in one run got the sandbox buyer locked out ("It looks like you have tried too many
 * times"), each attempt costing up to 4.5 minutes, which exhausted the 1h globalTimeout and left 163
 * tests unrun. No PayPal API approves a wallet order on the buyer's behalf, so the wallet route cannot
 * avoid that login. The card route can: the card is typed on our page and PayPal never challenges for
 * a password.
 *
 * WHY it is legitimate for THIS file: everything asserted here happens AFTER the capture. The card
 * route captures through `OrderController::capture_payment()` (Order/OrderController.php:223-267) and
 * the wallet route through `OrderController::maybe_process_order_redirect()` (:481-533), and BOTH call
 * the same `handle_capture_payment_validation()` + `payment_complete()`. The capture id, the
 * processing fee, the platform fee, the disbursement mode, the vendor balance row and the refund
 * eligibility are therefore written by code that never learns how the buyer approved.
 *
 * WHAT IT IS NOT: proof of anything wallet-specific. PP-CHK-06/07/08/12/15 — redirect to PayPal,
 * cancel-and-return, post-approval return, lost session — remain wallet-only and remain blocked on a
 * PayPal-hosted login. A green card run never covers them.
 */
const CARD_SKIP =
    'PAYPAL_MARKETPLACE_CAPTURE_ROUTE=card was requested but PAYPAL_UCC_TEST_CARD is not set, so there is no card to type ' +
    'into PayPal\'s hosted fields and no capture can happen on this route. Set it to a sandbox PAN confirmed to complete a ' +
    'purchase on THIS sandbox account without a 3D Secure step-up — the published candidate is Visa 4868719196829038 ' +
    '(Mastercard 5329879707824603, PayPal 3DS "Test Case 1", frictionless success), and explicitly NOT 4868719166101368 / ' +
    '5329879735316929, which require a challenge. It is NOT defaulted: no number can be confirmed from source alone, and a ' +
    'baked-in PAN would let this run spend sandbox captures on an unvetted card. The same variable drives ' +
    'paypalMarketplaceUcc.spec.ts, so one harvested number serves both. Or drop PAYPAL_MARKETPLACE_CAPTURE_ROUTE=card to ' +
    'use the wallet route.';

/** The actor that can approve on the ACTIVE route: a sandbox buyer for the wallet, a card for UCC. */
const HAS_APPROVAL_ACTOR = USE_CARD_CAPTURE ? CARD.number !== '' : HAS_BUYER_LOGIN;
const APPROVAL_ACTOR_SKIP = USE_CARD_CAPTURE ? CARD_SKIP : BUYER_SKIP;

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */

test.describe('PayPal Marketplace — multi-vendor split', () => {
    // Every case creates at least one live PayPal order; PP-SPL-12 additionally drives PayPal's
    // hosted approval window and a capture.
    test.describe.configure({ timeout: 420_000 });

    /** Vendor 1's product — the first payee. */
    let vendor1ProductId = '';
    /** Vendor 2's product — the second payee, and what makes every cart below a SPLIT cart. */
    let vendor2ProductId = '';
    /** Vendor-owned coupon for PP-SPL-08. */
    let vendorCouponId = '';
    let vendorCouponCode = '';
    /** Admin-funded coupon for PP-SPL-05 — the only supported configuration that subsidises a vendor. */
    let adminCouponId = '';
    let adminCouponCode = '';

    /** Every WooCommerce order these tests create, so none is left behind on the shared site. */
    const createdOrderIds: string[] = [];
    /** Every order id (parent AND sub) this file touched, for the Dokan-table cleanup in afterAll. */
    const allTouchedOrderIds = new Set<string>();

    test.beforeAll(async () => {
        // Announced before the credentials guard so the report always names the route, even on a run
        // where every case skips.
        announceCaptureRoute('PP-SPL');

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

        // AFTER the vendor seeding: seedPayPalConnectedVendor() rewrites all six PayPal metas on every
        // call, including the UCC one, so opening gate 5 first would be undone here. Both vendors are
        // passed because gate 5 is all-or-nothing and every cart in this file is a two-vendor cart.
        if (USE_CARD_CAPTURE) {
            await openCardGates([VENDOR_ID, VENDOR2_ID]);
        }

        const api = new ApiUtils(await request.newContext());
        const [, product1] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Split Vendor1 Product' }, payloads.vendorAuth);
        const [, product2] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Split Vendor2 Product' }, payloads.vendor2Auth);
        vendor1ProductId = product1;
        vendor2ProductId = product2;

        // Vendor-owned percent coupon, restricted to VENDOR 1's product only. PP-SPL-08 needs a
        // discount that lands on exactly one vendor's unit.
        const [, couponId, couponCode] = await api.createCoupon(
            [vendor1ProductId],
            { ...payloads.createCoupon1, code: `pp_spl_v1_${Date.now()}`, discount_type: 'percent', amount: '20' },
            payloads.vendorAuth,
        );
        vendorCouponId = couponId;
        vendorCouponCode = couponCode;
        await api.dispose();

        // ADMIN-funded percent coupon for PP-SPL-05. An admin coupon is the marketplace-supported way
        // to make a vendor's recorded earning EXCEED the order total the customer paid — which is the
        // only shape that drives `get_earning_by_order( $order, 'admin' )` negative, and therefore the
        // only shape that reaches the `max( 0, … )` clamp at OrderManager.php:158.
        const ctx = await adminContext();
        try {
            adminCouponCode = `pp_spl_admin_${Date.now()}`;
            const res = await ctx.post(`${SERVER_URL}/wc/v3/coupons`, {
                data: {
                    code: adminCouponCode,
                    discount_type: 'percent',
                    amount: '90',
                    individual_use: false,
                    product_ids: [Number(vendor1ProductId)],
                },
            });
            const body = (await res.json().catch(() => ({}))) as { id?: number };
            adminCouponId = body.id ? String(body.id) : '';
        } finally {
            await ctx.dispose();
        }
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }

        // First, before anything can throw: an unrestored ucc_mode leaks a card form into every later
        // checkout spec on this worker and fails PP-SET-19 in a file that did nothing wrong.
        await restoreCardGates();

        // M5 — clean up after money. Orders, the Dokan earnings rows they created, the vendor balance
        // rows a capture wrote and the withdraw rows that go with them are all removed. A money test
        // that leaves rows behind corrupts every later balance assertion on this site, and the
        // withdraw rows in particular would make PP-WDR's "pending request" probe read a request this
        // file created.
        const ctx = await adminContext();
        try {
            for (const orderId of createdOrderIds) {
                // Sub orders are deleted with their parent by WooCommerce, but they are enumerated
                // first so their Dokan rows can be removed by id below.
                await ctx.delete(`${SERVER_URL}/wc/v3/orders/${orderId}?force=true`).catch(() => undefined);
            }
            for (const productId of [vendor1ProductId, vendor2ProductId]) {
                if (productId) {
                    await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`).catch(() => undefined);
                }
            }
            for (const couponId of [vendorCouponId, adminCouponId]) {
                if (couponId) {
                    await ctx.delete(`${SERVER_URL}/wc/v3/coupons/${couponId}?force=true`).catch(() => undefined);
                }
            }
        } finally {
            await ctx.dispose();
        }

        // Dokan's own tables are NOT cleaned up by deleting the WooCommerce order, so they are cleared
        // explicitly. Both parents and children are covered: `allOrderIds` collects every id this file
        // touched, and sub-order ids were recorded alongside their parents.
        if (allTouchedOrderIds.size > 0) {
            const ids = [...allTouchedOrderIds];
            const placeholders = ids.map(() => '?').join(', ');
            await dbUtils
                .dbQuery(`DELETE FROM \`${DB_PREFIX}_dokan_vendor_balance\` WHERE trn_id IN (${placeholders});`, ids)
                .catch(() => undefined);
            await dbUtils.dbQuery(`DELETE FROM \`${DB_PREFIX}_dokan_orders\` WHERE order_id IN (${placeholders});`, ids).catch(() => undefined);
            for (const id of ids) {
                // The COLUMN is `note` (Installer.php:353), not `notes` — `notes` is only the argument
                // key `insert_withdraw()` accepts before mapping it across (Withdraw/Manager.php:185).
                // Getting that wrong made every one of these deletes an ER_BAD_FIELD_ERROR swallowed by
                // the .catch, so the rows were never cleared and the failure was invisible.
                await dbUtils
                    .dbQuery(`DELETE FROM \`${DB_PREFIX}_dokan_withdraw\` WHERE method = ? AND note LIKE ?;`, [PAYPAL_IDS.gateway, `%Order ${id} payment%`])
                    .catch(() => undefined);
            }
        }

        await dbUtils.clearCustomerCart(CUSTOMER_ID).catch(() => undefined);

        // Re-seed both vendors. Not cosmetic: a case that died mid-test would otherwise hand every
        // later PayPal spec on this worker a vendor that cannot be paid, and those specs would fail or
        // skip for entirely the wrong reason.
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: 'dokangit@vendor1.com' }).catch(() => undefined);
        await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' }).catch(() => undefined);
    });

    /* -------------------------------------------------------------- */
    /* Fixture builders                                                */
    /* -------------------------------------------------------------- */

    interface SplitOrder {
        parentOrderId: string;
        paypalOrderId: string;
        /** PayPal's hosted approval URL — only PP-SPL-12 follows it. */
        approveUrl: string;
        paypalOrder: PayPalOrder;
        parent: WcOrder;
        subOrders: WcOrder[];
        dokanRows: DokanOrderRow[];
    }

    /**
     * Place a real order through the classic checkout for `lines`, then read back BOTH sides of it:
     * WooCommerce's orders and PayPal's purchase units.
     *
     * Every failure below is stated in terms of its consequence, because the first person to run this
     * file will be looking at real money movement for the first time and "expected 2, got 1" alone
     * does not tell them whether a vendor went unpaid.
     */
    async function buildSplitOrder(browser: Browser, lines: CartLine[], opts: { couponCode?: string; cardCapture?: boolean } = {}): Promise<SplitOrder> {
        const result = await withCustomer(browser, async page => {
            await stockCart(page, lines);
            await page.goto(CLASSIC.url, { waitUntil: 'domcontentloaded' });
            await expect(page.locator(CLASSIC.placeOrder), 'the classic checkout page must render the order form before it can be submitted').toBeAttached({ timeout: 60_000 });

            if (opts.couponCode) {
                /*
                 * Applied, then VERIFIED, then re-applied once if it did not stick.
                 *
                 * The apply is a `?wc-ajax=apply_coupon` POST against the session cart, and on
                 * 2026-08-04 it silently did nothing on the first attempt of PP-SPL-05 and worked on
                 * the retry — the whole case then failed three screens later on `discount_total=0.00`
                 * with WooCommerce's own explanation already thrown away. Checking the discount row
                 * here turns that into an immediate, self-explaining failure, and the second attempt
                 * costs one POST against a transient the retry was already paying for in full.
                 */
                let notice = '';
                let applied = false;

                for (let attempt = 1; attempt <= 2 && !applied; attempt++) {
                    notice = await applyCouponAtCheckout(page, opts.couponCode);
                    // Reload so the review table, and therefore the serialized form, reflects the discount.
                    await page.goto(CLASSIC.url, { waitUntil: 'domcontentloaded' });
                    await expect(
                        page.locator(CLASSIC.placeOrder),
                        `the classic checkout must still render after applying coupon "${opts.couponCode}". WooCommerce answered: ${notice}`,
                    ).toBeAttached({ timeout: 60_000 });

                    // WooCommerce renders one `.cart-discount` row per applied coupon in the review table.
                    applied = await page.locator(PayPalMarketplacePage.misc.cartDiscount).first().isVisible().catch(() => false);
                }

                expect(
                    applied,
                    `coupon "${opts.couponCode}" did not attach to the cart after two attempts, so this order is not subsidised and every assertion built on the discount would be measuring an ordinary order. WooCommerce's own answer to the last apply: ${notice.slice(0, 600)}`,
                ).toBe(true);
            }

            await selectClassicPayPal(page);
            if (!opts.cardCapture) {
                return submitClassicCheckout(page);
            }

            // The card route creates the order from INSIDE the module's own `createOrder` callback and
            // captures it in the same click, so `submitClassicCheckout()` must not run: a second
            // checkout POST would create a second order. The response it returns is the same
            // `wc-ajax=checkout` payload, read off the wire, so every assertion below is unchanged.
            await waitForCheckoutSettled(page);
            return payWithCardOnClassicCheckout(page, [VENDOR_ID, VENDOR2_ID]);
        });

        expect(
            result.__error ?? null,
            `the classic checkout POST must reach WC_Checkout::process_checkout(). Without it no order is placed, nothing is split, and no purchase unit exists to inspect — every assertion in this case would be about a checkout that never ran`,
        ).toBeNull();

        expect(
            result.result,
            `the classic checkout must return result=success for a ${lines.length}-line cart paid with ${PAYPAL_IDS.gateway}. A failure here means the customer could not buy from these vendors at all. WooCommerce reports the reason in "messages", and PayPal::process_payment() puts its own create-order error there too (PaymentMethods/PayPal.php:322-330): ${String(result.messages ?? result.message ?? '(none)').slice(0, 800)}`,
        ).toBe('success');

        const parentOrderId = String(result.id ?? '');
        expect(parentOrderId, `the checkout response must carry the WooCommerce order id it created. Response: ${JSON.stringify(result ?? null).slice(0, 400)}`).not.toBe('');
        createdOrderIds.push(parentOrderId);
        allTouchedOrderIds.add(parentOrderId);

        const paypalOrderId = String(result.paypal_order_id ?? '');
        expect(
            paypalOrderId,
            `the checkout response must carry paypal_order_id — PayPal::process_payment() returns it at PaymentMethods/PayPal.php:350. Without it the buyer is never sent to PayPal and nothing can be captured. Response: ${JSON.stringify(result ?? null).slice(0, 400)}`,
        ).not.toBe('');

        const approveUrl = String(result.paypal_redirect_url ?? result.redirect ?? '');

        const childIds = await dbUtils.getChildOrderIds(parentOrderId);
        for (const childId of childIds) {
            allTouchedOrderIds.add(String(childId));
        }

        // With ONE vendor in the cart Lite does not create sub orders at all; it stamps
        // `_dokan_vendor_id` on the parent, and PayPal::process_payment() then falls back to
        // `$sub_orders = [ $order ]` (PaymentMethods/PayPal.php:267-269). So the parent IS the payable
        // order in that case, and the readers below must follow the same rule rather than assume a split.
        const payableOrderIds = childIds.length > 0 ? childIds.map(String) : [parentOrderId];

        const [paypalOrder, parent, subOrders, dokanRows] = await Promise.all([
            getPayPalOrder(paypalOrderId),
            getWcOrder(parentOrderId),
            Promise.all(payableOrderIds.map(id => getWcOrder(id))),
            getDokanOrderRows(payableOrderIds),
        ]);

        return { parentOrderId, paypalOrder, paypalOrderId, approveUrl, parent, subOrders, dokanRows };
    }

    /**
     * The two-vendor order that PP-SPL-01/-02/-03/-04/-06/-07/-10 all inspect.
     *
     * Built ONCE and memoised rather than rebuilt per case: each build is a live PayPal round trip and
     * seven identical orders would leave seven abandoned orders on PayPal's side for no extra
     * coverage. It is built lazily inside the first case that needs it, not in `beforeAll`, so a build
     * failure surfaces as a named test failure with its full message instead of as a hook error that
     * takes the whole describe with it.
     */
    let sharedSplit: SplitOrder | null = null;
    let sharedSplitError: Error | null = null;

    async function getSharedSplitOrder(browser: Browser): Promise<SplitOrder> {
        if (sharedSplit) {
            return sharedSplit;
        }
        if (sharedSplitError) {
            throw sharedSplitError;
        }
        try {
            sharedSplit = await buildSplitOrder(browser, [{ productId: vendor1ProductId }, { productId: vendor2ProductId }]);
            return sharedSplit;
        } catch (error) {
            sharedSplitError = error instanceof Error ? error : new Error(String(error));
            throw sharedSplitError;
        }
    }

    /** The gate every case in this file shares: credentials, merchant ids, and PayPal-side consent. */
    async function gateOnPayableMerchants(): Promise<void> {
        const unpayable = await unpayableMerchantReasons();
        test.skip(
            unpayable.length > 0,
            `PayPal will not accept ${unpayable.join('; ')} as a payee, so create_order() fails and there are no purchase units to split. A merchant id that LOOKS right but is not payable makes every money assertion fail opaquely, which is why this is probed over the network rather than inferred from the id's shape. PP-PRE-04 reports it.`,
        );
    }

    /**
     * Match one purchase unit to the sub order it was built from.
     *
     * `custom_id` is the sub order id (OrderManager.php:220) and is the ONLY field that carries that
     * link — `reference_id` is the order KEY and `invoice_id` is the parent. Matching on amounts
     * instead would be circular for exactly the assertions this file exists to make.
     */
    function subOrderForUnit(unit: PayPalPurchaseUnit, split: SplitOrder): WcOrder | undefined {
        return split.subOrders.find(order => String(order.id) === String(unit.custom_id ?? ''));
    }

    /* -------------------------------------------------------------- */
    /* PP-SPL-01 … PP-SPL-04 — identity and money, per unit             */
    /* -------------------------------------------------------------- */

    test('PP-SPL-01: a two-vendor cart produces two purchase units', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        await gateOnPayableMerchants();

        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            `Helper::is_ready() must be true before anything on this page means something — it is enabled AND partner_id AND client id AND client secret (Helper.php:101-117). A false here means the gateway was never available, so "no purchase units" would restate an unconfigured site rather than report a split defect. Observed: enabled=${status.is_enabled}, partner_id present=${status.has_partner_id}, module active=${status.module_active}`,
        ).toBe(true);

        const split = await getSharedSplitOrder(browser);

        expect(
            split.subOrders.length,
            `a two-vendor cart must be split into one sub order per vendor before any purchase unit is built. PayPal::process_payment() calls maybe_split_orders() and then loops the sub orders (PaymentMethods/PayPal.php:262-276); without the split both vendors' goods are paid to whichever single merchant the one unit names, and no vendor earning can ever be attributed. Parent order ${split.parentOrderId}, payable orders found: ${JSON.stringify(split.subOrders.map(order => order.id) ?? null)}`,
        ).toBe(2);

        const units = split.paypalOrder.purchase_units ?? [];
        expect(
            units.length,
            `PayPal must hold exactly ONE purchase unit per sub order for this order. Zero units means create_order() sent PayPal nothing to pay for; one merged unit means both vendors' goods would be captured to a single merchant. PayPal order ${split.paypalOrderId}, units as PayPal has them: ${JSON.stringify(describeUnits(split.paypalOrder) ?? null)}`,
        ).toBe(split.subOrders.length);

        expect(
            (units.map(unit => String(unit.custom_id ?? '')) ?? []).sort(),
            `each purchase unit's custom_id must be one of this order's sub order ids, with no duplicates and none missing — that field is the only link between a unit and the sub order it was built from (OrderManager.php:220), and it is what the capture handler resolves the earning against (OrderManager.php:524). Units: ${JSON.stringify(describeUnits(split.paypalOrder) ?? null)}`,
        ).toEqual(split.subOrders.map(order => String(order.id)).sort());

        log.success(`PP-SPL-01: parent order ${split.parentOrderId} split into ${split.subOrders.length} sub orders and PayPal order ${split.paypalOrderId} carries ${units.length} purchase units.`);
    });

    test('PP-SPL-02: each purchase unit is payable to its own vendor merchant id', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        await gateOnPayableMerchants();

        const split = await getSharedSplitOrder(browser);
        const units = split.paypalOrder.purchase_units ?? [];

        expect(units.length, `there must be purchase units to check the payee of. PayPal order ${split.paypalOrderId} returned none.`).toBeGreaterThan(0);

        // The two merchant ids must actually differ, or a crossed mapping would be invisible: if both
        // vendors were seeded with the same merchant id, every payee assertion below would pass no
        // matter which vendor each unit really belonged to.
        expect(
            PAYPAL_MERCHANTS.vendor1,
            'the two suite vendors must hold DIFFERENT merchant ids. With one id shared between them a crossed payee mapping — the most damaging defect this module can have — would be undetectable, and this case would report green on a gateway paying the wrong vendor every time',
        ).not.toBe(PAYPAL_MERCHANTS.vendor2);

        const seen: Array<Record<string, unknown>> = [];

        for (const unit of units) {
            const subOrder = subOrderForUnit(unit, split);
            expect(
                subOrder,
                `purchase unit custom_id="${String(unit.custom_id ?? '')}" must name one of this order's sub orders (${JSON.stringify(split.subOrders.map(order => order.id) ?? null)}). A unit pointing at an order that is not part of this purchase cannot be reconciled at capture time, and OrderManager::store_capture_payment_data() would attribute its money to whatever order that id happens to be. Unit: ${JSON.stringify(describeUnit(unit) ?? null)}`,
            ).toBeDefined();
            if (!subOrder) {
                continue;
            }

            const vendorId = vendorIdOf(subOrder);
            const expectedMerchant = MERCHANT_BY_VENDOR[vendorId] ?? '';
            expect(
                expectedMerchant,
                `sub order ${subOrder.id} must belong to one of the two seeded suite vendors (${VENDOR_ID}, ${VENDOR2_ID}); its _dokan_vendor_id is "${vendorId}". Without that link this case cannot say which merchant id the unit SHOULD have named, and would be reduced to checking that some merchant id is present`,
            ).not.toBe('');

            expect(
                unit.payee?.merchant_id ?? null,
                `the purchase unit for sub order ${subOrder.id} (vendor ${vendorId}) must be payable to THAT vendor's own merchant id. OrderManager::make_purchase_unit_data() sets payee.merchant_id from Helper::get_seller_merchant_id( dokan_get_seller_id_by_order( $order ) ) (OrderManager.php:153-154, :203-205). A crossed mapping here sends this vendor's money to another merchant and is the single most damaging split defect: both WooCommerce orders would still read "processing" and nothing WordPress-side would ever show it. Unit: ${JSON.stringify(describeUnit(unit) ?? null)}`,
            ).toBe(expectedMerchant);

            seen.push({ subOrder: subOrder.id, vendor: vendorId, payee: unit.payee?.merchant_id ?? null, total: amountOf(unit.amount) });
        }

        expect(
            units.map(unit => String(unit.payee?.merchant_id ?? '')).sort(),
            `across the whole order BOTH seeded merchants must appear exactly once. Two units naming the same merchant would pay one vendor for the other's goods while still passing a per-unit "has a payee" check. Observed mapping: ${JSON.stringify(seen ?? null)}`,
        ).toEqual([PAYPAL_MERCHANTS.vendor1, PAYPAL_MERCHANTS.vendor2].sort());

        log.success(`PP-SPL-02: payee mapping verified per sub order — ${JSON.stringify(seen)}`);
    });

    test('PP-SPL-03: unit amounts sum to the order total', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        await gateOnPayableMerchants();

        const split = await getSharedSplitOrder(browser);
        const units = split.paypalOrder.purchase_units ?? [];
        expect(units.length, `there must be purchase units to sum. PayPal order ${split.paypalOrderId} returned none.`).toBeGreaterThan(0);

        const unitSum = units.reduce((sum, unit) => sum + num(unit.amount?.value), 0);
        const parentTotal = num(split.parent.total);

        expect(
            near(unitSum, parentTotal),
            `the purchase units must ask PayPal for EXACTLY what the customer's order totals. Sum of units = ${unitSum.toFixed(2)}, WooCommerce parent order ${split.parentOrderId} total = ${parentTotal.toFixed(2)}, difference = ${(unitSum - parentTotal).toFixed(2)}. Under-asking silently short-changes the marketplace; over-asking charges the customer more than the order they agreed to. Compared with a 0.01 tolerance because PayPal returns decimal STRINGS — the integer-minor-unit comparison the Stripe suite uses does not apply here. Units: ${JSON.stringify(describeUnits(split.paypalOrder) ?? null)}`,
        ).toBe(true);

        // Each unit must ALSO reconcile against its own sub order, not merely add up in aggregate: two
        // units that are individually wrong in opposite directions sum correctly and would pass the
        // check above while paying each vendor the other's money.
        for (const unit of units) {
            const subOrder = subOrderForUnit(unit, split);
            expect(subOrder, `purchase unit custom_id="${String(unit.custom_id ?? '')}" must name one of this order's sub orders`).toBeDefined();
            if (!subOrder) {
                continue;
            }

            expect(
                near(num(unit.amount?.value), num(subOrder.total)),
                `the purchase unit for sub order ${subOrder.id} must ask for that sub order's own total. Unit = ${amountOf(unit.amount)}, sub order total = ${subOrder.total}. Two units that are individually wrong in opposite directions still sum to the parent total, so the aggregate check above cannot catch this — and the vendor whose unit is short is simply paid less than the goods they shipped. Unit: ${JSON.stringify(describeUnit(unit) ?? null)}`,
            ).toBe(true);

            // PayPal REJECTS an order whose breakdown does not sum to `amount.value`, so this is the
            // same class of defect as DOK-030 (zero-decimal currencies) expressed in the store currency.
            const breakdown = unitBreakdown(unit);
            const breakdownSum =
                num(breakdown['item_total']) +
                num(breakdown['tax_total']) +
                num(breakdown['shipping']) +
                num(breakdown['handling']) +
                num(breakdown['insurance']) -
                num(breakdown['shipping_discount']) -
                num(breakdown['discount']);

            expect(
                near(breakdownSum, num(unit.amount?.value)),
                `the breakdown of the unit for sub order ${subOrder.id} must sum to its own amount.value. item_total + tax_total + shipping + handling + insurance - shipping_discount - discount = ${breakdownSum.toFixed(2)}, amount.value = ${amountOf(unit.amount)}. PayPal rejects an order whose breakdown does not reconcile, so a mismatch makes the vendor's goods unpayable outright — this is DOK-030's shape (OrderManager.php:54-69 vs :99-125) expressed in the store currency. Breakdown: ${JSON.stringify(breakdown ?? null)}`,
            ).toBe(true);

            expect(
                near(num(breakdown['item_total']), expectedItemTotal(subOrder), 0.02),
                `the item_total of the unit for sub order ${subOrder.id} must be that order's own line-item SUBTOTAL plus its fees. OrderManager.php:148-149 computes $order->get_subtotal() + $order->get_total_fees(); WooCommerce reports line subtotals ${JSON.stringify((subOrder.line_items ?? []).map(line => line.subtotal) ?? null)} and fee lines ${JSON.stringify((subOrder.fee_lines ?? []).map(fee => fee.total) ?? null)}, i.e. ${expectedItemTotal(subOrder).toFixed(2)}, against a declared item_total of ${breakdown['item_total']}. This is the pre-discount, pre-tax base PayPal validates the item list against, so a wrong value makes the vendor's goods unpayable even when the grand total happens to be right`,
            ).toBe(true);

            expect(
                unit.amount?.currency_code ?? null,
                `the unit for sub order ${subOrder.id} must be denominated in that order's own currency (${subOrder.currency}). OrderManager.php:165 stamps get_woocommerce_currency() — the STORE currency — instead, which is DOK-031; on this USD store with USD orders both the correct and the buggy implementation satisfy this, so the assertion is a guard for the day a multi-currency fixture exists rather than a reproduction. PP-CUR-10 owns DOK-031`,
            ).toBe(subOrder.currency);
        }

        log.success(`PP-SPL-03: ${units.length} units sum to ${unitSum.toFixed(2)} against a parent total of ${parentTotal.toFixed(2)}.`);
    });

    test('PP-SPL-04: platform fee equals the admin commission per sub order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        await gateOnPayableMerchants();

        const split = await getSharedSplitOrder(browser);
        const units = split.paypalOrder.purchase_units ?? [];
        expect(units.length, `there must be purchase units to read a platform fee from. PayPal order ${split.paypalOrderId} returned none.`).toBeGreaterThan(0);

        expect(
            split.dokanRows.length,
            `Dokan must have recorded an earnings row for every sub order of ${split.parentOrderId}. dokan_sync_insert_order() writes wp_dokan_orders from inside create_sub_order() (Order/Manager.php:657), so a missing row means the split itself did not complete — and with no recorded earning there is nothing to compare the platform fee against. Sub orders: ${JSON.stringify(split.subOrders.map(order => order.id) ?? null)}, rows found: ${JSON.stringify(split.dokanRows ?? null)}`,
        ).toBe(split.subOrders.length);

        let feeSum = 0;

        for (const unit of units) {
            const subOrder = subOrderForUnit(unit, split);
            expect(subOrder, `purchase unit custom_id="${String(unit.custom_id ?? '')}" must name one of this order's sub orders`).toBeDefined();
            if (!subOrder) {
                continue;
            }

            const row = split.dokanRows.find(entry => entry.order_id === Number(subOrder.id));
            expect(row, `sub order ${subOrder.id} must have a wp_dokan_orders row; rows found: ${JSON.stringify(split.dokanRows ?? null)}`).toBeDefined();
            if (!row) {
                continue;
            }

            const fees = unit.payment_instruction?.platform_fees ?? [];
            expect(
                fees.length,
                `the unit for sub order ${subOrder.id} must carry exactly one payment_instruction.platform_fees entry (OrderManager.php:210-217). None means the marketplace keeps NO commission on this vendor's sale — PayPal would settle the whole amount to the vendor. More than one means the admin is charged twice. Unit as PayPal holds it: ${JSON.stringify(describeUnit(unit) ?? null)}`,
            ).toBe(1);

            const platformFee = num(fees[0]?.amount?.value);
            const expectedCommission = adminCommissionOf(row);
            feeSum += platformFee;

            expect(
                near(platformFee, Math.max(0, expectedCommission)),
                `the platform fee on the unit for sub order ${subOrder.id} (vendor ${row.seller_id}) must equal the admin commission Dokan recorded for THAT sub order. PayPal was asked for ${platformFee.toFixed(2)}; Dokan's own earnings row says order_total ${row.order_total.toFixed(2)} - net_amount ${row.net_amount.toFixed(2)} = ${expectedCommission.toFixed(2)}. This is the core money oracle for the gateway: too high and the vendor is underpaid on every sale, too low and the marketplace never collects its commission, and attached to the WRONG unit it does both at once. Unit: ${JSON.stringify(describeUnit(unit) ?? null)}, row: ${JSON.stringify(row ?? null)}`,
            ).toBe(true);

            expect(
                fees[0]?.amount?.currency_code ?? null,
                `the platform fee on sub order ${subOrder.id} must be denominated in the same currency as the unit itself (${String(unit.amount?.currency_code ?? 'none')}); a fee in another currency is rejected by PayPal and the whole order becomes unpayable`,
            ).toBe(unit.amount?.currency_code ?? null);

            expect(
                platformFee <= num(unit.amount?.value) + 0.01,
                `the platform fee for sub order ${subOrder.id} (${platformFee.toFixed(2)}) must not exceed the amount being charged for it (${amountOf(unit.amount)}). A fee larger than the sale leaves the vendor with a negative payout, which PayPal refuses outright`,
            ).toBe(true);
        }

        // A positive baseline for the whole comparison. With a marketplace commission of zero every
        // assertion above is satisfied by a gateway that never sends a platform fee at all, so the case
        // says out loud when it could not distinguish the two rather than reporting a green it did not earn.
        if (feeSum === 0) {
            log.warn(
                `PP-SPL-04: every platform fee on this order is 0.00 and Dokan recorded an admin commission of 0.00 for every sub order (${JSON.stringify(split.dokanRows)}). The comparison held, but on this site's current commission settings it cannot tell "the fee was computed correctly" from "no fee was ever sent". Configure a non-zero admin commission to make this case discriminating.`,
            );
        }

        log.success(`PP-SPL-04: platform fees ${feeSum.toFixed(2)} across ${units.length} units reconcile with Dokan's recorded admin commission per sub order.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-05 — the clamp                                           */
    /* -------------------------------------------------------------- */

    test('PP-SPL-05: platform fee is clamped at zero, never negative', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        await gateOnPayableMerchants();
        test.skip(
            adminCouponId === '',
            'the admin-funded coupon this case needs could not be created via POST /wc/v3/coupons, so there is no supported way on this site to drive the admin commission negative. An admin-funded discount is the marketplace configuration that makes a vendor\'s recorded earning exceed the order total the customer actually paid, which is the only shape that reaches the max( 0, … ) clamp at OrderManager.php:158. Without it this case would be asserting a clamp on a value that was never negative.',
        );

        // POSITIVE BASELINE first: the same single-vendor cart with NO subsidy must produce a real,
        // positive platform fee. Without it, "the fee is 0.00" below would be satisfied equally well by
        // a gateway that never sends a platform fee at all — the clamp would be reported as working on
        // a code path that never ran.
        const baseline = await buildSplitOrder(browser, [{ productId: vendor1ProductId }]);
        const baselineUnit = (baseline.paypalOrder.purchase_units ?? [])[0];
        expect(baselineUnit, `the un-subsidised baseline order ${baseline.parentOrderId} must produce a purchase unit; PayPal returned ${JSON.stringify(describeUnits(baseline.paypalOrder) ?? null)}`).toBeDefined();
        const baselineFee = num(baselineUnit?.payment_instruction?.platform_fees?.[0]?.amount?.value);

        expect(
            baselineFee > 0,
            `the un-subsidised baseline must carry a POSITIVE platform fee (observed ${baselineFee.toFixed(2)}). Without one, the "clamped to zero" assertion below cannot tell the clamp from a gateway that never sends a platform fee, and this case would report a working clamp it never exercised. Configure a non-zero admin commission on this site. Baseline unit: ${JSON.stringify(baselineUnit ? describeUnit(baselineUnit) : null)}`,
        ).toBe(true);

        // Now the subsidised order: a 90% admin-funded discount leaves the customer paying a fraction of
        // the price while Dokan still records the vendor's full earning, so order_total - net_amount goes
        // negative and `max( 0, (float) $platform_fee )` is the only thing standing between that and a
        // negative fee — which PayPal rejects outright.
        const subsidised = await buildSplitOrder(browser, [{ productId: vendor1ProductId }], { couponCode: adminCouponCode });

        expect(
            num(subsidised.parent.discount_total) > 0,
            `the admin coupon "${adminCouponCode}" must actually have been applied to order ${subsidised.parentOrderId}; WooCommerce reports discount_total=${subsidised.parent.discount_total}. Without the discount the vendor is not subsidised, the admin commission stays positive, and this case would assert a clamp on a value that was never negative`,
        ).toBe(true);

        const row = subsidised.dokanRows[0];
        expect(row, `Dokan must have recorded an earnings row for the subsidised order; rows found: ${JSON.stringify(subsidised.dokanRows ?? null)}`).toBeDefined();

        const recordedCommission = row ? adminCommissionOf(row) : 0;
        test.skip(
            recordedCommission >= 0,
            `the admin-funded 90% coupon did not drive the recorded admin commission negative on this site (order_total ${row?.order_total ?? 'n/a'} - net_amount ${row?.net_amount ?? 'n/a'} = ${recordedCommission.toFixed(2)}). Dokan only subsidises the vendor when it treats the coupon as admin-funded (dokan_is_admin_coupon_applied), and on this configuration it did not, so the max( 0, … ) clamp at OrderManager.php:158 is not reachable through any supported setting here. Reported as a gated skip rather than a pass, because asserting "the fee is not negative" against a commission that was already positive would prove nothing about the clamp.`,
        );

        const unit = (subsidised.paypalOrder.purchase_units ?? [])[0];
        expect(unit, `the subsidised order ${subsidised.parentOrderId} must produce a purchase unit; PayPal returned ${JSON.stringify(describeUnits(subsidised.paypalOrder) ?? null)}`).toBeDefined();

        const feeValue = unit?.payment_instruction?.platform_fees?.[0]?.amount?.value ?? null;
        expect(
            feeValue,
            `the subsidised unit must still carry a platform_fees entry — the clamp turns a negative fee into zero, it does not remove the instruction. Unit: ${JSON.stringify(unit ? describeUnit(unit) : null)}`,
        ).not.toBeNull();

        expect(
            num(feeValue) >= 0,
            `the platform fee must be clamped at zero and never sent as a negative value. Dokan recorded an admin commission of ${recordedCommission.toFixed(2)} for this subsidised order, and OrderManager.php:158 applies max( 0, (float) $platform_fee ) precisely so PayPal never sees it. PayPal rejects a negative platform fee outright, which would make every admin-subsidised sale on the marketplace impossible to pay for. Observed fee: ${String(feeValue)}. Unit: ${JSON.stringify(unit ? describeUnit(unit) : null)}`,
        ).toBe(true);

        expect(
            String(feeValue ?? '').startsWith('-'),
            `the platform fee string sent to PayPal must not carry a minus sign. Observed "${String(feeValue)}" on the unit for order ${subsidised.parentOrderId}`,
        ).toBe(false);

        log.success(`PP-SPL-05: recorded admin commission ${recordedCommission.toFixed(2)} was clamped to ${String(feeValue)} on the wire (baseline fee for the same cart without the subsidy: ${baselineFee.toFixed(2)}).`);
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-06 / PP-SPL-07 — shipping and tax ride their own unit     */
    /* -------------------------------------------------------------- */

    test('PP-SPL-06: shipping is allocated to the vendor\'s own unit', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        await gateOnPayableMerchants();

        const split = await getSharedSplitOrder(browser);
        const units = split.paypalOrder.purchase_units ?? [];

        const totalShipping = split.subOrders.reduce((sum, order) => sum + num(order.shipping_total), 0);
        test.skip(
            totalShipping === 0,
            `no shipping was charged on this order (every sub order's shipping_total is 0.00), so "each vendor's shipping rides its own unit" has nothing to allocate and a green here would only mean 0.00 === 0.00. This needs a shipping zone and method that covers the customer's address (${JSON.stringify(payloads.createOrder.shipping)}) and both vendors' store countries; the site under test currently charges none. Declared as a gated skip rather than a pass, because a case that cannot fail is not coverage.`,
        );

        for (const unit of units) {
            const subOrder = subOrderForUnit(unit, split);
            expect(subOrder, `purchase unit custom_id="${String(unit.custom_id ?? '')}" must name one of this order's sub orders`).toBeDefined();
            if (!subOrder) {
                continue;
            }

            expect(
                near(num(unitBreakdown(unit)['shipping']), num(subOrder.shipping_total)),
                `the shipping component of the unit for sub order ${subOrder.id} must equal that sub order's OWN shipping total. Unit shipping = ${unitBreakdown(unit)['shipping']}, sub order shipping_total = ${subOrder.shipping_total}. OrderManager.php:151 reads $order->get_shipping_total() off the sub order, and process_payment() stamps shipping_fee_recipient = 'seller' on the parent (PaymentMethods/PayPal.php:340), so the vendor is the one who must be paid for it. Charging one vendor's shipping to the other's unit pays the wrong vendor for a delivery they did not make. Unit: ${JSON.stringify(describeUnit(unit) ?? null)}`,
            ).toBe(true);
        }

        expect(
            (await getOrderMetaValue(split.parentOrderId, 'shipping_fee_recipient')) ?? null,
            `the parent order must be stamped shipping_fee_recipient = "seller". PayPal::process_payment() writes it at PaymentMethods/PayPal.php:340 in the same save that stores the PayPal order id, and Dokan's commission engine reads it to decide whether the shipping charge belongs to the vendor's earning (OrderCommission.php:272-278). If it says "admin" while the shipping still rides the vendor's purchase unit, the vendor is paid the shipping by PayPal and charged it back by Dokan`,
        ).toBe('seller');

        log.success(`PP-SPL-06: ${totalShipping.toFixed(2)} of shipping allocated per vendor unit.`);
    });

    test('PP-SPL-07: tax is allocated to the vendor\'s own unit', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        await gateOnPayableMerchants();

        const split = await getSharedSplitOrder(browser);
        const units = split.paypalOrder.purchase_units ?? [];

        const totalTax = split.subOrders.reduce((sum, order) => sum + expectedTaxTotal(order), 0);
        test.skip(
            totalTax === 0,
            `no tax was charged on this order (every sub order's total_tax is 0.00), so "tax rides the vendor's own unit" has nothing to allocate and a green would only mean 0.00 === 0.00. This suite's environment is documented as having taxes ON at 5% with tax_based_on = shipping and prices exclusive; a zero here means that rate is no longer configured, or does not cover the customer's address. Declared as a gated skip rather than a pass.`,
        );

        for (const unit of units) {
            const subOrder = subOrderForUnit(unit, split);
            expect(subOrder, `purchase unit custom_id="${String(unit.custom_id ?? '')}" must name one of this order's sub orders`).toBeDefined();
            if (!subOrder) {
                continue;
            }

            expect(
                near(num(unitBreakdown(unit)['tax_total']), expectedTaxTotal(subOrder)),
                `the tax component of the unit for sub order ${subOrder.id} must equal that sub order's own tax. Unit tax_total = ${unitBreakdown(unit)['tax_total']}, sub order total_tax = ${subOrder.total_tax} (which on this site INCLUDES the shipping tax of ${subOrder.shipping_tax}, because OrderManager::get_tax_amount() sums tax_total + shipping_tax_total over the order's tax rows — OrderManager.php:406-413). Tax attached to the wrong vendor's unit is remitted by the wrong merchant, and the vendor who actually owes it is never funded for it. Unit: ${JSON.stringify(describeUnit(unit) ?? null)}`,
            ).toBe(true);
        }

        expect(
            (await getOrderMetaValue(split.parentOrderId, 'tax_fee_recipient')) ?? null,
            `the parent order must be stamped tax_fee_recipient = "seller" (PaymentMethods/PayPal.php:341). The purchase unit hands the tax to the vendor's merchant account, so Dokan's commission engine has to agree the vendor owns it (OrderCommission.php:302-308); a disagreement double-counts the tax against one side or the other`,
        ).toBe('seller');

        log.success(`PP-SPL-07: ${totalTax.toFixed(2)} of tax allocated per vendor unit.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-08 — coupon                                              */
    /* -------------------------------------------------------------- */

    test('PP-SPL-08: a vendor coupon collapses into a single breakdown discount on that vendor\'s unit', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        await gateOnPayableMerchants();
        test.skip(vendorCouponCode === '', 'the vendor coupon this case needs was not created in beforeAll, so there is no discount to allocate.');

        const split = await buildSplitOrder(browser, [{ productId: vendor1ProductId }, { productId: vendor2ProductId }], { couponCode: vendorCouponCode });

        expect(
            num(split.parent.discount_total) > 0,
            `the vendor coupon "${vendorCouponCode}" must actually have been applied to order ${split.parentOrderId}; WooCommerce reports discount_total=${split.parent.discount_total}. Dokan restricts a vendor coupon to that vendor's own items (Order/Hooks.php:465-492), so a zero discount means the coupon was rejected and this case would be asserting a discount split that never happened`,
        ).toBe(true);

        const units = split.paypalOrder.purchase_units ?? [];
        expect(units.length, `there must be one unit per vendor to compare discounts across. PayPal returned ${JSON.stringify(describeUnits(split.paypalOrder) ?? null)}`).toBe(2);

        let discountedUnits = 0;

        for (const unit of units) {
            const subOrder = subOrderForUnit(unit, split);
            expect(subOrder, `purchase unit custom_id="${String(unit.custom_id ?? '')}" must name one of this order's sub orders`).toBeDefined();
            if (!subOrder) {
                continue;
            }

            const unitDiscount = num(unitBreakdown(unit)['discount']);
            const orderDiscount = num(subOrder.discount_total);
            if (unitDiscount > 0) {
                discountedUnits += 1;
            }

            expect(
                near(unitDiscount, orderDiscount),
                `the discount component of the unit for sub order ${subOrder.id} (vendor ${vendorIdOf(subOrder)}) must equal that sub order's own discount_total. Unit discount = ${unitDiscount.toFixed(2)}, sub order discount_total = ${orderDiscount}. OrderManager.php:163 collapses WooCommerce's discount plus Dokan's lot and minimum-order discounts into this ONE breakdown field; putting the discount on the wrong vendor's unit charges the undiscounted vendor for a promotion the other one ran. Unit: ${JSON.stringify(describeUnit(unit) ?? null)}`,
            ).toBe(true);
        }

        expect(
            discountedUnits,
            `exactly ONE of the two units must carry the discount — the coupon is restricted to vendor ${VENDOR_ID}'s product. ${discountedUnits} units carried a non-zero discount. Units: ${JSON.stringify(describeUnits(split.paypalOrder) ?? null)}`,
        ).toBe(1);

        const unitSum = units.reduce((sum, unit) => sum + num(unit.amount?.value), 0);
        expect(
            near(unitSum, num(split.parent.total)),
            `the discounted order must still reconcile: units sum to ${unitSum.toFixed(2)} against a parent total of ${split.parent.total}. A discount applied to one unit but not deducted from what PayPal is asked for charges the customer the full price on a discounted order. Units: ${JSON.stringify(describeUnits(split.paypalOrder) ?? null)}`,
        ).toBe(true);

        log.success(`PP-SPL-08: coupon ${vendorCouponCode} discounted exactly one vendor unit and the order still reconciles.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-09 — the deliberate quantity-one item shape               */
    /* -------------------------------------------------------------- */

    test('PP-SPL-09: line items are sent with quantity one and subtotal unit amounts', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        await gateOnPayableMerchants();

        // Quantity 3 on vendor 1's line, so "quantity is always 1" is a real claim about the payload
        // rather than a restatement of the cart.
        const split = await buildSplitOrder(browser, [{ productId: vendor1ProductId, quantity: 3 }, { productId: vendor2ProductId }]);

        const multiLineOrder = split.subOrders.find(order => (order.line_items ?? []).some(item => item.quantity > 1));
        expect(
            multiLineOrder,
            `one sub order must hold a line with quantity greater than one, or this case restates the default rather than pinning the module's behaviour. Sub orders: ${JSON.stringify(split.subOrders.map(order => ({ id: order.id, lines: (order.line_items ?? []).map(item => ({ product: item.product_id, qty: item.quantity, subtotal: item.subtotal })) })) ?? null)}`,
        ).toBeDefined();
        if (!multiLineOrder) {
            return;
        }

        const unit = (split.paypalOrder.purchase_units ?? []).find(candidate => String(candidate.custom_id ?? '') === String(multiLineOrder.id));
        expect(
            unit,
            `PayPal must hold a purchase unit for sub order ${multiLineOrder.id}. Units: ${JSON.stringify(describeUnits(split.paypalOrder) ?? null)}`,
        ).toBeDefined();
        if (!unit) {
            return;
        }

        const items = unit.items ?? [];
        expect(
            items.length,
            `the unit for sub order ${multiLineOrder.id} must carry its line items. OrderManager::get_product_items() builds one entry per line (OrderManager.php:363-397) and PayPal echoes them back on GET; an empty list here means either the items never reached PayPal or they were dropped by the negative-fee branch at OrderManager.php:224-226 on an order that has no negative fee. Unit: ${JSON.stringify(describeUnit(unit) ?? null)}`,
        ).toBeGreaterThan(0);

        for (const item of items) {
            expect(
                String(item.quantity ?? ''),
                `every item in the unit for sub order ${multiLineOrder.id} must be sent with quantity "1". This is DELIBERATE module behaviour, not a defect: get_product_items() hardcodes quantity 1 and puts the whole LINE SUBTOTAL in unit_amount (OrderManager.php:375-380) so that PayPal's own items × quantity check reconciles against a total that already carries per-line discounts. The case exists to pin it, so a future change to quantity handling is noticed rather than silently altering what PayPal validates. Item: ${JSON.stringify(item ?? null)}`,
            ).toBe('1');
        }

        // Each item's unit_amount must be the LINE subtotal, not the per-unit price. On a quantity-3
        // line those two differ by a factor of three, which is the whole point of using quantity 3 here.
        const expectedSubtotals = (multiLineOrder.line_items ?? []).map(line => num(line.subtotal)).sort((a, b) => a - b);
        const observedAmounts = items.map(item => num(item.unit_amount?.value)).sort((a, b) => a - b);

        expect(
            observedAmounts.length,
            `the unit for sub order ${multiLineOrder.id} must carry one item per WooCommerce line. Expected ${expectedSubtotals.length} (${JSON.stringify(expectedSubtotals)}), got ${observedAmounts.length} (${JSON.stringify(observedAmounts)})`,
        ).toBe(expectedSubtotals.length);

        for (let index = 0; index < expectedSubtotals.length; index += 1) {
            const expectedValue = expectedSubtotals[index] ?? 0;
            const observedValue = observedAmounts[index] ?? 0;
            expect(
                near(observedValue, expectedValue, 0.02),
                `item ${index} of the unit for sub order ${multiLineOrder.id} must carry the LINE subtotal (${expectedValue.toFixed(2)}), not the per-unit price; PayPal was sent ${observedValue.toFixed(2)}. With quantity forced to 1, a per-unit price here would under-declare the line by the quantity factor and PayPal would reject the order because the items no longer sum to item_total. The tolerance is 0.02 rather than 0.01 because adjust_purchase_units_subtotal() deliberately pushes any rounding remainder onto the first non-zero item (OrderManager.php:108-136). Items: ${JSON.stringify(items ?? null)}`,
            ).toBe(true);
        }

        const itemSum = items.reduce((sum, item) => sum + num(item.unit_amount?.value), 0);
        expect(
            near(itemSum, num(unitBreakdown(unit)['item_total']), 0.02),
            `the items of the unit for sub order ${multiLineOrder.id} must sum to its declared item_total. Items sum to ${itemSum.toFixed(2)}, item_total = ${unitBreakdown(unit)['item_total']}. PayPal validates exactly this and rejects the order outright when it does not hold, which makes the vendor's goods unpayable. Items: ${JSON.stringify(items ?? null)}`,
        ).toBe(true);

        log.success(`PP-SPL-09: ${items.length} items sent at quantity 1 with line-subtotal amounts for sub order ${multiLineOrder.id}.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-10 — the two identifiers                                 */
    /* -------------------------------------------------------------- */

    test('PP-SPL-10: invoice_id is the parent order id and custom_id the sub order id', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        await gateOnPayableMerchants();

        const split = await getSharedSplitOrder(browser);
        const units = split.paypalOrder.purchase_units ?? [];
        expect(units.length, `there must be purchase units to read identifiers from. PayPal order ${split.paypalOrderId} returned none.`).toBeGreaterThan(0);

        const invoiceIds = [...new Set(units.map(unit => String(unit.invoice_id ?? '')))];
        expect(
            invoiceIds,
            `every unit must carry the SAME invoice_id, and it must be the parent order id ${split.parentOrderId} (OrderManager.php:219). OrderManager::handle_order_complete_status() reads purchase_units[0].invoice_id to find the order to mark captured (OrderManager.php:466-473); a wrong or per-unit value there sends the capture to the wrong order — or to none, in which case the money moves at PayPal and WooCommerce never records it. Units: ${JSON.stringify(describeUnits(split.paypalOrder) ?? null)}`,
        ).toEqual([String(split.parentOrderId)]);

        const customIds = units.map(unit => String(unit.custom_id ?? ''));
        expect(
            new Set(customIds).size,
            `every unit must carry a DISTINCT custom_id — it is the sub order id (OrderManager.php:220) and OrderManager::store_capture_payment_data() resolves each capture's vendor, processing fee and balance row through it (OrderManager.php:524-592). Two units sharing one custom_id would write both vendors' capture data onto a single sub order and lose one vendor's earning entirely. Observed: ${JSON.stringify(customIds ?? null)}`,
        ).toBe(customIds.length);

        expect(
            customIds.slice().sort(),
            `the units' custom_ids must be exactly this order's sub order ids. Observed ${JSON.stringify(customIds ?? null)} against sub orders ${JSON.stringify(split.subOrders.map(order => String(order.id)) ?? null)}`,
        ).toEqual(split.subOrders.map(order => String(order.id)).sort());

        for (const unit of units) {
            expect(
                String(unit.custom_id ?? ''),
                `no unit's custom_id may equal the parent order id ${split.parentOrderId}. That is what the module falls back to when an order has no sub order (OrderManager.php:219-220), so seeing it on a SPLIT order means the unit was built from the parent instead of from a vendor's sub order — and the capture would credit the parent, which belongs to no vendor. Unit: ${JSON.stringify(describeUnit(unit) ?? null)}`,
            ).not.toBe(String(split.parentOrderId));
        }

        log.success(`PP-SPL-10: invoice_id ${invoiceIds[0]} constant across ${units.length} units, custom_ids ${JSON.stringify(customIds)}.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-11 — negative fee items                                  */
    /* -------------------------------------------------------------- */

    test('PP-SPL-11: negative-fee items are dropped from the payload', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        await gateOnPayableMerchants();

        // A negative FEE line cannot be produced by a shopping cart, and it cannot survive a split
        // either: dokan-lite's create_sub_order() copies line items, shipping, taxes and coupons to the
        // sub order but NOT fee lines (Order/Manager.php:578-657), so `is_order_has_negative_fees()`
        // can never be true for a sub order. The branch under test is therefore only reachable on an
        // UNSPLIT, single-vendor order — which is exactly the shape PayPal::process_payment() falls
        // back to at PaymentMethods/PayPal.php:267-269. The order is created through the WooCommerce
        // REST API and then paid through the module's OWN admin-ajax transport, the same one
        // paypal-checkout.js uses on the order-pay page.
        const ctx = await adminContext();
        let orderId = '';
        let orderTotal = 0;
        try {
            const res = await ctx.post(`${SERVER_URL}/wc/v3/orders`, {
                data: {
                    ...payloads.createOrder,
                    set_paid: false,
                    status: 'pending',
                    payment_method: PAYPAL_IDS.gateway,
                    payment_method_title: 'PayPal Marketplace',
                    customer_id: Number(CUSTOMER_ID),
                    line_items: [{ product_id: Number(vendor1ProductId), quantity: 1 }],
                    fee_lines: [{ name: 'PP-SPL-11 negative fee', total: '-5.00' }],
                },
            });
            const body = (await res.json().catch(() => ({}))) as { id?: number; total?: string; fee_lines?: Array<{ total: string }> };
            expect(
                res.ok(),
                `the fixture order for this case must be creatable through POST /wc/v3/orders. Without it there is no order carrying a negative fee and the branch at OrderManager.php:224-226 cannot be reached at all. Response (HTTP ${res.status()}): ${JSON.stringify(body ?? null).slice(0, 400)}`,
            ).toBe(true);
            orderId = String(body.id ?? '');
            orderTotal = num(body.total);
            expect(
                (body.fee_lines ?? []).some(fee => num(fee.total) < 0),
                `the fixture order ${orderId} must actually carry a NEGATIVE fee line; WooCommerce stored ${JSON.stringify(body.fee_lines ?? null)}. is_order_has_negative_fees() is what selects the branch under test (OrderManager.php:424-432), and without a negative fee this case would assert the ordinary items payload`,
            ).toBe(true);
        } finally {
            await ctx.dispose();
        }

        createdOrderIds.push(orderId);
        allTouchedOrderIds.add(orderId);

        const result = await withCustomer(browser, async page => {
            // Any checkout page carries the module's localised nonce; the cart is stocked only so the
            // shortcode renders its full form rather than the empty-cart notice.
            await stockCart(page, [{ productId: vendor1ProductId }]);
            await page.goto(CLASSIC.url, { waitUntil: 'domcontentloaded' });
            await expect(page.locator(CLASSIC.placeOrder), 'the classic checkout page must render before the module\'s admin-ajax transport can be used from it').toBeAttached({ timeout: 60_000 });
            return createPayPalOrderForExistingOrder(page, orderId);
        });

        expect(result.__error ?? null, `the module's own dokan_paypal_create_order transport must be reachable, or this case cannot build the payload it inspects`).toBeNull();

        expect(
            result.result,
            `PayPal::process_payment() must succeed for an order carrying a negative fee — a customer whose order has a marketplace-issued negative fee (a credit, an adjustment) must still be able to pay for it.\n` +
                `SUSPECTED CAUSE if this fails with a PayPal INVALID_PARAMETER / MALFORMED_REQUEST error: OrderManager::make_purchase_unit_data() unsets $purchase_units['items'] for a negative-fee order (dokan-pro/modules/paypal-marketplace/includes/Order/OrderManager.php:224-226) and then immediately passes the array to adjust_purchase_units_subtotal(), which reads $purchase_units['items'] unconditionally and writes it back (OrderManager.php:108-135). The key is therefore re-added as NULL and shipped to PayPal as "items": null, alongside two PHP warnings. Module error: ${String(result.messages ?? result.message ?? '(none)').slice(0, 800)}`,
        ).toBe('success');

        const paypalOrderId = String(result.paypal_order_id ?? '');
        expect(paypalOrderId, `the transport must return a paypal_order_id. Response: ${JSON.stringify(result ?? null).slice(0, 400)}`).not.toBe('');

        const paypalOrder = await getPayPalOrder(paypalOrderId);
        const unit = (paypalOrder.purchase_units ?? [])[0];
        expect(unit, `PayPal must hold a purchase unit for order ${orderId}; it returned ${JSON.stringify(describeUnits(paypalOrder) ?? null)}`).toBeDefined();
        if (!unit) {
            return;
        }

        const negativeItems = (unit.items ?? []).filter(item => num(item.unit_amount?.value) < 0);
        expect(
            negativeItems,
            `no item with a negative unit_amount may be sent to PayPal. PayPal rejects a negative item amount outright, which is why make_purchase_unit_data() drops the item list entirely for a negative-fee order (OrderManager.php:224-226); a negative item arriving here means that guard did not run and the customer cannot pay for the order at all. Items PayPal holds: ${JSON.stringify(unit.items ?? null)}`,
        ).toEqual([]);

        // The unit must still reconcile with the order even with the items removed — the item list is
        // informational to PayPal, the breakdown is not.
        expect(
            near(num(unit.amount?.value), orderTotal),
            `the unit for order ${orderId} must still ask for the order's own total even with the items dropped. Unit = ${amountOf(unit.amount)}, WooCommerce total = ${orderTotal.toFixed(2)}. The negative fee reduces both the order total and the item_total (OrderManager.php:148-149 adds get_total_fees() into the subtotal), so dropping the item LIST must not change what is charged. Unit: ${JSON.stringify(describeUnit(unit) ?? null)}`,
        ).toBe(true);

        const breakdown = unitBreakdown(unit);
        const breakdownSum =
            num(breakdown['item_total']) +
            num(breakdown['tax_total']) +
            num(breakdown['shipping']) +
            num(breakdown['handling']) +
            num(breakdown['insurance']) -
            num(breakdown['shipping_discount']) -
            num(breakdown['discount']);
        expect(
            near(breakdownSum, num(unit.amount?.value)),
            `the breakdown of the negative-fee unit must still sum to its amount.value: ${breakdownSum.toFixed(2)} vs ${amountOf(unit.amount)}. PayPal refuses the order otherwise. Breakdown: ${JSON.stringify(breakdown ?? null)}`,
        ).toBe(true);

        log.success(`PP-SPL-11: negative-fee order ${orderId} produced a payable unit with no negative item (${JSON.stringify(describeUnit(unit))}).`);
    });

    /* -------------------------------------------------------------- */
    /* PP-SPL-12 — the capture, and the only true money oracle          */
    /* -------------------------------------------------------------- */

    test('PP-SPL-12: vendor earnings recorded after capture match the split', { tag: ['@pro', '@customer', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        await gateOnPayableMerchants();

        // A hosted approval plus a live capture plus the settlement round trip. Well beyond the file
        // budget, and deliberately generous: a timeout here would look like a failed capture.
        test.setTimeout(900_000);

        const status = await getPayPalStatus();
        expect(
            status.disbursement_mode,
            `this case reads the vendor balance rows a capture writes, and those are only written immediately when the disbursement mode is INSTANT — OrderManager::insert_vendor_withdraw_balance() stores the withdraw data as order meta and returns early on any other mode (OrderManager.php:762-769). On a DELAYED marketplace the earnings arrive from the daily disbursement job instead, which is PP-DIS's territory. ensurePayPalConfigured() pins INSTANT; observed "${String(status.disbursement_mode)}"`,
        ).toBe('INSTANT');

        // A dedicated order. The shared one is inspected by seven other cases and capturing it would
        // change what they read; and every capture is real sandbox money, so exactly one is made.
        //
        // On the card route the capture happens INSIDE this build (the module's own createOrder +
        // capture_payment round trip), which is why the approval below is skipped there and not here.
        const split = await buildSplitOrder(browser, [{ productId: vendor1ProductId }, { productId: vendor2ProductId }], { cardCapture: USE_CARD_CAPTURE });

        expect(split.subOrders.length, `the captured order must be a genuine two-vendor split, or "earnings match the split" has nothing to match. Sub orders: ${JSON.stringify(split.subOrders.map(order => order.id) ?? null)}`).toBe(2);
        expect(
            split.approveUrl,
            `PayPal::process_payment() must return the hosted approval URL (paypal_redirect_url, PaymentMethods/PayPal.php:349). Without it the buyer can never approve and no capture can happen. Response fields seen: paypal_order_id=${split.paypalOrderId}`,
        ).not.toBe('');

        // Vendor balances BEFORE, read through the vendor-facing accessor rather than a raw table:
        // GET /dokan/v1/withdraw/balance is what the vendor dashboard itself shows.
        const balancesBefore = await Promise.all([readVendorBalance(payloads.vendorAuth), readVendorBalance(payloads.vendor2Auth)]);

        if (!USE_CARD_CAPTURE) {
            await withCustomer(browser, async page => {
                await approveAsBuyerOnPayPal(page, split.approveUrl);
            });
        }

        // ── From here on, real money has moved. Everything below reads it back. ──────────────────────

        const capturedOrder = await getPayPalOrder(split.paypalOrderId);
        expect(
            capturedOrder.status ?? null,
            `PayPal must report order ${split.paypalOrderId} as COMPLETED after the buyer approved and the site captured it. Anything else (APPROVED, PAYER_ACTION_REQUIRED) means the approval landed but OrderController::maybe_process_order_redirect() did not capture — check that the return URL carried PayerID, button_type and wc_payment_method (PaymentMethods/PayPal.php:288-296) and that the order still needed payment (Order/OrderController.php:512-515). Order as PayPal holds it: ${JSON.stringify(describeUnits(capturedOrder) ?? null)}`,
        ).toBe('COMPLETED');

        const capturedUnits = capturedOrder.purchase_units ?? [];
        expect(capturedUnits.length, `the captured order must still carry one unit per vendor; PayPal returned ${capturedUnits.length}`).toBe(2);

        let grossSum = 0;
        const reconciliation: Array<Record<string, unknown>> = [];

        for (const unit of capturedUnits) {
            const capture = unit.payments?.captures?.[0];
            expect(
                capture?.id ?? null,
                `every purchase unit must carry a capture after approval. A unit with no capture means that VENDOR was not paid even though the customer's money left their account for the other vendor — a partially-captured multi-vendor order is the worst failure shape in this module. Unit: ${JSON.stringify(describeUnit(unit) ?? null)}`,
            ).not.toBeNull();
            expect(capture?.status ?? null, `the capture on unit custom_id="${String(unit.custom_id ?? '')}" must be COMPLETED; PayPal says "${String(capture?.status)}"`).toBe('COMPLETED');

            const breakdown = capture?.seller_receivable_breakdown;
            const gross = num(breakdown?.gross_amount?.value);
            const paypalFee = num(breakdown?.paypal_fee?.value);
            const netToVendor = num(breakdown?.net_amount?.value);
            const platformFee = num(breakdown?.platform_fees?.[0]?.amount?.value);
            grossSum += gross;

            // THE MONEY ORACLE, in PayPal's own settlement figures:
            //     what the customer paid for this vendor's goods
            //   = what the vendor receives + the marketplace commission + PayPal's processing fee
            expect(
                near(gross, netToVendor + platformFee + paypalFee, 0.02),
                `PayPal's settlement for sub order ${String(unit.custom_id ?? '')} must reconcile: gross ${gross.toFixed(2)} must equal net to vendor ${netToVendor.toFixed(2)} + platform fee ${platformFee.toFixed(2)} + PayPal processing fee ${paypalFee.toFixed(2)} (currently off by ${(gross - netToVendor - platformFee - paypalFee).toFixed(2)}). If this does not hold, money left the customer that is credited to nobody. seller_receivable_breakdown: ${JSON.stringify(breakdown ?? null)}`,
            ).toBe(true);

            reconciliation.push({ subOrder: unit.custom_id ?? null, gross, netToVendor, platformFee, paypalFee });
        }

        expect(
            near(grossSum, num(split.parent.total), 0.02),
            `the sum of what PayPal captured (${grossSum.toFixed(2)}) must equal the customer's order total (${split.parent.total}). A shortfall means one vendor's goods were paid for and another's were not. Captures: ${JSON.stringify(reconciliation ?? null)}`,
        ).toBe(true);

        // Now the WordPress side: the module must have written the same figures onto the sub orders.
        // `_dokan_paypal_payment_processing_fee` is the gateway fee the catalogue insists is READ, never
        // hardcoded — it is PayPal's own number and varies with the sandbox account's pricing.
        for (const unit of capturedUnits) {
            const subOrderId = String(unit.custom_id ?? '');
            const capture = unit.payments?.captures?.[0];
            const breakdown = capture?.seller_receivable_breakdown;

            const [captureId, processingFee, platformFeeMeta] = await Promise.all([
                getOrderMetaValue(subOrderId, '_dokan_paypal_payment_capture_id'),
                getOrderMetaValue(subOrderId, '_dokan_paypal_payment_processing_fee'),
                getOrderMetaValue(subOrderId, '_dokan_paypal_payment_platform_fee'),
            ]);

            expect(
                captureId ?? null,
                `sub order ${subOrderId} must carry _dokan_paypal_payment_capture_id after the capture (OrderManager.php:549). Without it NO refund can ever be issued for this vendor's part of the order — Refund cannot find a capture to reverse — and the vendor's money is stranded at PayPal from Dokan's point of view`,
            ).toBe(capture?.id ?? null);

            expect(
                near(num(processingFee), num(breakdown?.paypal_fee?.value), 0.02),
                `sub order ${subOrderId} must record PayPal's OWN processing fee (${String(breakdown?.paypal_fee?.value)}) in _dokan_paypal_payment_processing_fee (OrderManager.php:550); it recorded "${String(processingFee)}". This value is never a constant — it is whatever PayPal charged — and Dokan reverses the gateway fee from it via dokan_process_payment_gateway_fee (OrderManager.php:564), so a wrong number moves the fee onto the wrong party`,
            ).toBe(true);

            expect(
                near(num(platformFeeMeta), num(breakdown?.platform_fees?.[0]?.amount?.value), 0.02),
                `sub order ${subOrderId} must record the platform fee PayPal actually took (${String(breakdown?.platform_fees?.[0]?.amount?.value)}) in _dokan_paypal_payment_platform_fee (OrderManager.php:552); it recorded "${String(platformFeeMeta)}". This is the marketplace's realised commission on this vendor's sale`,
            ).toBe(true);
        }

        // The vendor balance credit each capture wrote — `insert_vendor_withdraw_balance()` credits the
        // PayPal NET amount, i.e. what the vendor really received (OrderManager.php:586-590, :791-815).
        const subOrderIds = split.subOrders.map(order => String(order.id));
        const placeholders = subOrderIds.map(() => '?').join(', ');
        const balanceRows = (await dbUtils.dbQuery(
            `SELECT vendor_id, trn_id, trn_type, credit, debit FROM \`${DB_PREFIX}_dokan_vendor_balance\` WHERE trn_id IN (${placeholders}) AND trn_type = 'dokan_withdraw';`,
            subOrderIds,
        )) as Array<{ vendor_id: number; trn_id: number; trn_type: string; credit: string | number; debit: string | number }>;

        expect(
            balanceRows.length,
            `one vendor-balance row must exist per captured sub order. OrderManager::handle_vendor_balance() -> insert_vendor_withdraw_balance() writes it in the same loop that stores the capture id (OrderManager.php:586-592), so a missing row means that vendor's earning was never recorded even though PayPal paid them — the marketplace's books and PayPal's would then disagree permanently. Sub orders ${JSON.stringify(subOrderIds ?? null)}, rows: ${JSON.stringify(balanceRows ?? null)}`,
        ).toBe(subOrderIds.length);

        for (const unit of capturedUnits) {
            const subOrderId = Number(unit.custom_id ?? 0);
            const row = balanceRows.find(entry => Number(entry.trn_id) === subOrderId);
            const netToVendor = num(unit.payments?.captures?.[0]?.seller_receivable_breakdown?.net_amount?.value);
            expect(row, `sub order ${subOrderId} must have a dokan_withdraw balance row; rows: ${JSON.stringify(balanceRows ?? null)}`).toBeDefined();
            if (!row) {
                continue;
            }
            expect(
                near(num(row.credit), netToVendor, 0.02),
                `the balance row for sub order ${subOrderId} must credit exactly what PayPal paid that vendor: ${netToVendor.toFixed(2)}. Dokan recorded ${num(row.credit).toFixed(2)}. A mismatch here is the marketplace's books diverging from the money that actually moved, and it compounds on every subsequent withdrawal. Row: ${JSON.stringify(row ?? null)}`,
            ).toBe(true);
        }

        // And finally through the VENDOR-FACING accessor, as the catalogue asks. This is asserted as
        // "the balance moved", not as an exact delta: `current_balance` nets an order's recorded earning
        // against the instant payout the same capture performs, so the arithmetic above — which uses
        // PayPal's own settlement figures — is the exact oracle and this is the corroborating one.
        const balancesAfter = await Promise.all([readVendorBalance(payloads.vendorAuth), readVendorBalance(payloads.vendor2Auth)]);
        for (const [index, label] of [[0, `vendor ${VENDOR_ID}`], [1, `vendor ${VENDOR2_ID}`]] as const) {
            expect(
                balancesBefore[index] !== balancesAfter[index],
                `${label}'s balance, read through the vendor accessor GET /dokan/v1/withdraw/balance, must have changed after their sale was captured. Before ${String(balancesBefore[index])}, after ${String(balancesAfter[index])}. An unchanged balance means the capture produced no vendor-visible earning at all: the vendor sees nothing in their dashboard for a sale PayPal already settled to them. Per-order reconciliation from PayPal's own figures: ${JSON.stringify(reconciliation ?? null)}`,
            ).toBe(true);
        }

        expect(
            await getOrderMetaValue(split.parentOrderId, '_dokan_paypal_payment_charge_captured'),
            `the parent order ${split.parentOrderId} must be stamped _dokan_paypal_payment_charge_captured = "yes" (OrderManager.php:481). It is the module's own idempotency guard: without it the CHECKOUT.ORDER.COMPLETED webhook would run handle_order_complete_status() a second time and credit every vendor twice`,
        ).toBe('yes');

        log.success(`PP-SPL-12: captured PayPal order ${split.paypalOrderId} reconciles per vendor — ${JSON.stringify(reconciliation)}. Vendor balances moved from ${JSON.stringify(balancesBefore)} to ${JSON.stringify(balancesAfter)}.`);
        log.warn(
            'PP-SPL-12 moved real sandbox money and it is NOT reversed by the cleanup: deleting the WooCommerce order removes Dokan\'s rows but cannot un-capture a PayPal payment. The two sandbox merchant accounts keep the funds. PP-REF owns the refund path.',
        );
    });

    /**
     * The vendor's own balance, through the accessor the vendor dashboard uses rather than a raw
     * table read. Returns null when the endpoint cannot answer, so a failure reads as "the accessor
     * did not respond" instead of silently becoming 0.
     */
    async function readVendorBalance(auth: Record<string, string>): Promise<string | null> {
        const ctx = await request.newContext({ extraHTTPHeaders: auth });
        try {
            const res = await ctx.get(`${SERVER_URL}/dokan/v1/withdraw/balance`);
            if (!res.ok()) {
                return null;
            }
            const body = (await res.json().catch(() => ({}))) as { current_balance?: number | string };
            return body.current_balance === undefined ? null : String(body.current_balance);
        } finally {
            await ctx.dispose();
        }
    }
});
