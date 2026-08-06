import { test, expect, request } from '@utils/test';
import type { Browser, Page } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import {
    PayPalMarketplacePage,
    PAYPAL_IDS,
    PAYPAL_BUYER,
    withCustomer,
    withVendor,
    waitForCheckoutSettled,
    selectClassicPayPal as selectClassicPayPalShared,
    submitClassicCheckout,
    stockCartWithProof,
    createBlockPayment,
    driveHostedApproval as driveHostedApprovalShared,
} from './paypalMarketplacePage';
import { CARD, USE_CARD_CAPTURE, announceCaptureRoute, openCardGates, restoreCardGates, payWithCardOnClassicCheckout } from './paypalMarketplaceCardCheckout';
import {
    vendorAuth,
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
    getOrderNotes,
    getOrderStatus,
    setOrderStatus,
    refundOrderViaDokan,
    readPayPalOrder,
} from './helpers';

/* Selectors live on the page object (SKILL non-negotiable #1: selectors belong in
 * `<slug>Page.ts`). These aliases keep the existing in-file names readable. */
const CLASSIC = PayPalMarketplacePage.classic;

/**
 * PayPal Marketplace — REFUNDS (PP-REF-01 … PP-REF-14).
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * THIS FILE MOVES REAL MONEY. Read this header before running it.
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Every case here needs a **captured** PayPal order, and a capture needs a buyer to approve the
 * payment on PayPal's own hosted page. There is no API that grants a buyer's approval, so each case
 * drives a real sandbox checkout end to end:
 *
 *   1. the customer's real, logged-in browser posts the module's own transport — the serialized
 *      `form.checkout` to `wc_checkout_params.checkout_url` for the classic path, `wp.apiFetch` to
 *      `POST /dokan/v1/paypal-marketplace/create-payment` for the block path (the identical approach
 *      `paypalMarketplaceBlocks.spec.ts` already proves works);
 *   2. the same page is then sent to the `approve` link PayPal returned, where the sandbox BUYER
 *      account logs in and pays;
 *   3. PayPal redirects back to `application_context.return_url`, which the module builds as the
 *      order-received page plus `button_type` and `wc_payment_method`
 *      (`PaymentMethods/PayPal.php:288-297`). `OrderController::maybe_process_order_redirect()`
 *      (`Order/OrderController.php:489-531`) sees that page, captures, and calls `payment_complete()`.
 *
 * That third step is the PRODUCT capturing the payment. Nothing in this file writes a capture id, a
 * refund id, a balance row or an order status that it then asserts on — an assertion satisfied by the
 * test's own write proves nothing at all, and on a money path it would report a working payout where
 * none exists. Where a capture cannot be reached the case FAILS with the reason; where a precondition
 * is structurally unreachable the case SKIPS and names exactly what is missing. Neither ever passes.
 *
 * **The oracle is money, never status.** An order reaching `processing` says nothing about who was
 * paid. Each case reads PayPal's OWN copy of the order back over `GET /v2/checkout/orders/{id}` —
 * purchase units are never persisted WordPress-side, so PayPal is the only record of what was really
 * requested and settled — and reconciles:
 *
 *      per purchase unit:  gross_amount == net_amount + paypal_fee + platform_fees
 *      across the order:   SUM(purchase unit amounts) == the WooCommerce order total
 *      per vendor:         payee.merchant_id == that vendor's OWN merchant id
 *
 * and after a refund, that PayPal recorded a refund of the requested amount against that vendor's
 * capture, and that Dokan's ledger debited the vendor by the `net_amount` PayPal actually took.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * Product facts these cases are written against — read from source, never assumed
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *  - **The PayPal refund happens at refund-request CREATION, not at admin approval.**
 *    `Refund::process_refund()` is hooked to `dokan_refund_request_created` (`includes/Refund.php:43`)
 *    and, for an API-method request, calls PayPal and then approves the request itself
 *    (`includes/Refund.php:152-215`). A manual-method request is approved on the spot too
 *    (`includes/Refund.php:123-130`). This is why PP-REF-08/-09/-10, which the catalogue frames
 *    around an admin approval queue, are written the way they are — see each case.
 *  - **The gateway is EXCLUDED from Dokan's auto-API-refund list**
 *    (`includes/Refund.php:342-345` feeding `dokan_excluded_gateways_from_auto_process_api_refund`),
 *    so `RefundController::approve_item()` forces `method = 0` (manual) for it
 *    (`dokan-pro/includes/REST/RefundController.php:299-311`) and an admin approval never calls PayPal.
 *  - **A refund request is only creatable when the order status is withdraw-active.**
 *    `Manager::create()` rejects otherwise (`dokan-pro/includes/Refund/Manager.php:131-133` →
 *    `:292-306`), and the default active list is `['wc-refunded', 'wc-completed']`
 *    (`dokan-lite/includes/Withdraw/functions.php:355-366`) — a freshly captured order is
 *    `processing`, so every case here makes its order approvable first and says so.
 *  - **A parent order with sub orders cannot be refunded**; refunds target the sub order
 *    (`dokan-pro/includes/Refund/Manager.php:112-114`).
 *  - **`invoice_id` on a refund is `<order id>-<refund id>`** (`includes/Refund.php:141`), which is the
 *    DOK-019 fix; the amount validator lives at `dokan-pro/includes/Refund/Validator.php:62-78`.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * Filed bugs in this territory — referenced, never re-filed
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *  - **DOK-018** — a block-checkout multi-vendor refund could not find its capture id ("Automatic
 *    refund is not possible for this order. Reason: No PayPal capture id is found."). Fixed in the
 *    installed 5.0.9 by `OrderController::protect_paid_sub_orders()` (`Order/OrderController.php:83`)
 *    and the vendor-keyed fallback in `OrderManager::store_capture_payment_data()`. PP-REF-05 is its
 *    passing regression guard and keeps the pre-fix string as a negative anchor.
 *  - **DOK-019** — a SECOND refund on one capture failed with `DUPLICATE_INVOICE_ID` because
 *    `invoice_id` was the bare order id. Fixed at `includes/Refund.php:135-141`. PP-REF-03 is its
 *    passing regression guard.
 *  - **DOK-027 / DOK-028** live in `WebhookEvents/PaymentCaptureRefunded.php` (the PayPal-dashboard
 *    refund path, plus the `PAYMENT.CAPTURE.REVERSED` alias that books a reversal as a refund) and are
 *    already covered by PP-WHK. Nothing here re-tests them; the cases below drive the marketplace's own
 *    refund path (`includes/Refund.php`), which is a different file with a different failure mode.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * Structure
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Never `test.describe.serial`, never tagged `@serial` (`playwright.config.ts:13` grepInverts `@serial`
 * in BOTH lanes, and `.serial` erased 46 of 68 cases on 2026-07-31 while still summarising green).
 * Every case therefore builds its OWN captured order: refunds mutate the order they run against, so a
 * shared fixture would make each case's result depend on the order the previous one left behind.
 * That costs one hosted approval per case — deliberate, and the reason the timeout below is generous.
 *
 * Gating is per test, never in `beforeAll` (a `test.skip` there silently voids the whole describe).
 * Four gates, in order, because each later one is meaningless without the earlier: credentials →
 * merchant-id shape → buyer login → PayPal-side consent probed over the network.
 */

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const DB_PREFIX = process.env.DB_PREFIX ?? 'wp';

/**
 * Sandbox BUYER (personal) account — `PAYPAL_BUYER`, imported from `paypalMarketplacePage.ts`.
 *
 * On 2026-07-31 the PayPal-hosted partner-consent flow was driven successfully with Playwright
 * against this very site: no captcha, ordinary DOM on both the login and the consent screens. The
 * hosted BUYER approval is the same kind of page, so it is attempted for real here rather than
 * assumed undrivable. If it ever stops being drivable, `approveOnPayPal()` throws with the page URL
 * and title so the failure names the screen it got stuck on — it never degrades into a substitute.
 */
const HAS_BUYER_LOGIN = Boolean(PAYPAL_BUYER.email && PAYPAL_BUYER.password);

/** Classic `[woocommerce_checkout]` shortcode page — `ensureClassicCheckoutPage()` creates it. */

/** The module's own block transport (`REST/V1/PayPalController.php:45-51`). */
const CREATE_PAYMENT_ROUTE = '/dokan/v1/paypal-marketplace/create-payment';

/**
 * The route the checkout block captures with, once the PayPal SDK reports the buyer approved
 * (`PayPalPayment.tsx` `capturePayment()` → `REST/V1/PayPalController.php:55-67, 299-324`).
 *
 * The block path captures HERE and not on a redirect, which is exactly why the order is still a
 * placeable `checkout-draft` afterwards — and placing it is the moment DOK-018 destroyed the sub
 * orders. PP-REF-05 is the only case that uses it.
 */
const CAPTURE_PAYMENT_ROUTE = '/dokan/v1/paypal-marketplace/capture-payment';

/** WooCommerce's own Store API — the transport the checkout block places an order with. */
const STORE_API_CART = '/wc/store/v1/cart';
const STORE_API_CHECKOUT = '/wc/store/v1/checkout';

/**
 * PayPal's `return_url` lands on the order-received page, where `maybe_process_order_redirect()`
 * captures and calls `payment_complete()`. The Store-API path must never reach it — see
 * `approveOnPayPalWithoutReturning()`.
 */
const RETURN_TO_SITE = /order-received/i;

/**
 * A Store API refusal that is about THIS SITE's shipping configuration rather than about the gateway
 * or the module. Matched narrowly on purpose: everything else the Store API can refuse with is either
 * the product under test or this file's own transport, and both must fail loudly.
 */
const STORE_API_SHIPPING_REFUSAL = /no shipping options were found|invalid shipping option|shipping option is invalid/i;

/** `wp_dokan_refund.status` codes (`dokan-pro/includes/Refund/Refunds.php:11-13`). */
const REFUND_STATUS = { pending: 0, completed: 1, cancelled: 2 } as const;

/**
 * The two strings a refund failure must NEVER carry again. Both are order-note text the product
 * writes, so they are readable from `wc/v3/orders/{id}/notes` on a real run.
 */
const DOK_018_SYMPTOM = /No PayPal capture id is found/i;
const DOK_019_SYMPTOM = /DUPLICATE_INVOICE_ID/i;

/** Any PayPal-side refusal of a refund (`includes/Refund.php:154-161`). */
const REFUND_API_ERROR = /API Refund Error/i;

/* ------------------------------------------------------------------ */
/* Skip reasons — each names exactly what is missing                    */
/* ------------------------------------------------------------------ */

const CREDENTIALS_SKIP =
    'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / ' +
    'TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE), so Helper::is_ready() is false, the gateway is not offered at any checkout, ' +
    'and no PayPal order — let alone a capture to refund — can be created. PP-PRE-01 reports the absence.';

const MERCHANT_SKIP =
    'no usable connected merchant ids are configured (PAYPAL_MARKETPLACE_VENDOR1_MERCHANT_ID / ' +
    'PAYPAL_MARKETPLACE_VENDOR2_MERCHANT_ID), so Processor::create_order() cannot name a payee, no capture can happen, ' +
    'and there is nothing to refund. PP-PRE-02 reports this as a documented gap.';

const BUYER_SKIP =
    'no sandbox BUYER credentials are configured (PAYPAL_MARKETPLACE_BUYER_EMAIL / PAYPAL_MARKETPLACE_BUYER_PASSWORD). ' +
    'A refund needs a captured payment, a capture needs a buyer to approve on PayPal\'s hosted page, and no PayPal API ' +
    'grants that approval — so without a buyer login this whole area is unreachable. Add both keys to tests/pw/.env ' +
    '(the sandbox Personal account from developer.paypal.com → Testing Tools → Sandbox Accounts) and re-run.';

/* ------------------------------------------------------------------ */
/* PayPal API layer                                                     */
/* ------------------------------------------------------------------ */

/**
 * This file's OWN wording for a refused client-credentials token, handed to the shared
 * `readPayPalOrder()` so a token failure reached from here still names what it costs THIS file.
 */
const TOKEN_FAILURE = (status: number): string =>
    `PayPal refused a client-credentials token (HTTP ${status}). Without it neither the capture nor the refund can be read back from PayPal, and every money assertion in this file would be a statement about WordPress meta only. Check TEST_CLIENT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE.`;

interface PayPalMoney {
    currency_code?: string;
    value?: string;
}

interface PayPalCapture {
    id?: string;
    status?: string;
    invoice_id?: string;
    custom_id?: string;
    amount?: PayPalMoney;
    seller_receivable_breakdown?: {
        gross_amount?: PayPalMoney;
        paypal_fee?: PayPalMoney;
        net_amount?: PayPalMoney;
        platform_fees?: Array<{ amount?: PayPalMoney }>;
    };
}

interface PayPalRefund {
    id?: string;
    status?: string;
    invoice_id?: string;
    custom_id?: string;
    amount?: PayPalMoney;
    seller_payable_breakdown?: {
        gross_amount?: PayPalMoney;
        paypal_fee?: PayPalMoney;
        net_amount?: PayPalMoney;
        total_refunded_amount?: PayPalMoney;
        platform_fees?: Array<{ amount?: PayPalMoney }>;
    };
}

interface PayPalPurchaseUnit {
    reference_id?: string;
    invoice_id?: string;
    custom_id?: string;
    amount?: PayPalMoney;
    payee?: { merchant_id?: string; email_address?: string };
    payment_instruction?: { disbursement_mode?: string; platform_fees?: Array<{ amount?: PayPalMoney }> };
    payments?: { captures?: PayPalCapture[]; refunds?: PayPalRefund[] };
}

interface PayPalOrder {
    id?: string;
    status?: string;
    intent?: string;
    purchase_units?: PayPalPurchaseUnit[];
}

async function getPayPalOrder(paypalOrderId: string): Promise<PayPalOrder> {
    return readPayPalOrder<PayPalOrder>(paypalOrderId, {
        tokenFailure: TOKEN_FAILURE,
        orderFailure: ({ status, message }) =>
            `PayPal would not return order ${paypalOrderId} (HTTP ${status}): ${message}. PayPal's copy of the order is the ONLY record of which merchant was asked for how much and what was captured or refunded — the purchase units are never persisted WordPress-side — so without this read no money claim in this case can be checked.`,
    });
}

/** A breakdown key PayPal omits when it is zero must compare equal to an explicit 0. */
function money(value: PayPalMoney | undefined): number {
    return Number(value?.value ?? 0);
}

/** The purchase unit built from one (sub) order — `custom_id` is that order's id (`Order/OrderManager.php:219`). */
function unitForOrder(paypalOrder: PayPalOrder, orderId: string): PayPalPurchaseUnit | null {
    return (paypalOrder.purchase_units ?? []).find(unit => String(unit.custom_id ?? '') === String(orderId)) ?? null;
}

function capturesOf(unit: PayPalPurchaseUnit | null): PayPalCapture[] {
    return unit?.payments?.captures ?? [];
}

function refundsOf(unit: PayPalPurchaseUnit | null): PayPalRefund[] {
    return unit?.payments?.refunds ?? [];
}

/* ------------------------------------------------------------------ */
/* WooCommerce / Dokan read layer                                       */
/* ------------------------------------------------------------------ */

interface WcOrder {
    id?: number;
    status?: string;
    currency?: string;
    total?: string;
    total_tax?: string;
    shipping_total?: string;
    shipping_tax?: string;
    cart_tax?: string;
    parent_id?: number;
    refunds?: Array<{ id?: number; reason?: string; total?: string }>;
}

/** One admin-auth read of the order fields every money assertion here needs. */
async function wcOrder(orderId: string | number): Promise<WcOrder> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}`);
        if (!res.ok()) {
            throw new Error(`could not read WooCommerce order ${orderId} (HTTP ${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
        return (await res.json()) as WcOrder;
    } finally {
        await ctx.dispose();
    }
}

/** Total already refunded on an order, summed from WooCommerce's own refund objects (they are negative). */
function refundedTotal(order: WcOrder): number {
    return (order.refunds ?? []).reduce((sum, refund) => sum + Math.abs(Number(refund.total ?? 0)), 0);
}

interface DokanRefundRow {
    id: number;
    order_id: number;
    seller_id: number;
    refund_amount: string;
    status: number;
    method: string;
}

async function refundRows(orderId: string | number): Promise<DokanRefundRow[]> {
    return (await dbUtils.dbQuery(
        `SELECT id, order_id, seller_id, refund_amount, status, method FROM \`${DB_PREFIX}_dokan_refund\` WHERE order_id = ? ORDER BY id ASC;`,
        [String(orderId)],
    )) as DokanRefundRow[];
}

interface LedgerRow {
    id: number;
    vendor_id: number;
    trn_id: number;
    trn_type: string;
    debit: string;
    credit: string;
    status: string;
}

/**
 * Every `wp_dokan_vendor_balance` row for one vendor.
 *
 * Used whole rather than as a single "balance" number on purpose: this gateway writes a DOUBLE entry
 * for a refund — the module debits the vendor by PayPal's net refund (`includes/Refund.php:287-311`)
 * while Lite credits the vendor's earning share (`dokan-lite/includes/Order/RefundHandler.php:224-238`)
 * — so a net figure can be unchanged while the ledger has changed a great deal. The "no money moved"
 * negatives compare the row set; the positives assert the specific row.
 */
async function ledgerRows(vendorId: string | number): Promise<LedgerRow[]> {
    return (await dbUtils.dbQuery(
        `SELECT id, vendor_id, trn_id, trn_type, debit, credit, status FROM \`${DB_PREFIX}_dokan_vendor_balance\` WHERE vendor_id = ? ORDER BY id ASC;`,
        [String(vendorId)],
    )) as LedgerRow[];
}

/** A comparable fingerprint of a vendor's ledger — row ids plus the two money columns. */
function ledgerFingerprint(rows: LedgerRow[]): string {
    return JSON.stringify(rows.map(row => [row.id, row.trn_id, row.trn_type, Number(row.debit), Number(row.credit)]));
}

/** The reverse-withdrawal ledger, for PP-REF-14's report half. */
async function reverseWithdrawalRows(orderId: string | number): Promise<Array<Record<string, unknown>>> {
    return (await dbUtils.dbQuery(
        `SELECT id, trn_id, trn_type, vendor_id, debit, credit FROM \`${DB_PREFIX}_dokan_reverse_withdrawal\` WHERE trn_id = ?;`,
        [String(orderId)],
    ).catch(() => [])) as Array<Record<string, unknown>>;
}

/**
 * Order statuses Dokan treats as withdraw-active — the gate `Manager::is_approvable()` applies before
 * ANY refund request can be created (`dokan-pro/includes/Refund/Manager.php:292-306`).
 *
 * Read from the site's own option rather than assumed: the default is `['wc-refunded','wc-completed']`
 * (`dokan-lite/includes/Withdraw/functions.php:355-366`), so a freshly captured `processing` order is
 * NOT refundable on a default site and every case here would otherwise fail with the product's
 * "mismatch on withdrawal options" error, pointing nowhere near the real subject.
 */
async function activeWithdrawStatuses(): Promise<string[]> {
    const withdraw = (await dbUtils.getOptionValueOrNull('dokan_withdraw')) as Record<string, unknown> | null;
    const configured = withdraw?.['withdraw_order_status'];
    const list = configured && typeof configured === 'object' ? Object.values(configured as Record<string, unknown>).map(String) : ['wc-completed'];
    return ['wc-refunded', ...list.filter(status => status && status !== '')];
}

/**
 * Move an order into a status a refund request can legally be created against, and PROVE it landed
 * there. Returns the status the order is left in.
 */
async function ensureRefundApprovable(orderId: string): Promise<string> {
    const active = await activeWithdrawStatuses();
    const current = await getOrderStatus(orderId);

    if (active.includes(`wc-${current}`)) {
        return current;
    }

    const target = (active.find(status => status !== 'wc-refunded') ?? 'wc-completed').replace(/^wc-/, '');
    await setOrderStatus(orderId, target);
    const after = await getOrderStatus(orderId);

    expect(
        active.includes(`wc-${after}`),
        `order ${orderId} must be in a withdraw-active status before a refund can be requested. Dokan gates refund CREATION on it — Manager::create() returns "Refund requests can not be made due to a mismatch on withdrawal options selected on admin settings" (dokan-pro/includes/Refund/Manager.php:131-133 → :292-306) — so without this the case would fail on a precondition instead of on refund behaviour. Active statuses on this site: ${JSON.stringify(active)}; order ${orderId} is "${after}" after asking for "${target}".`,
    ).toBe(true);

    return after;
}

/** Poll an order meta key the PRODUCT writes. Never writes it, never defaults it. */
async function waitForOrderMeta(orderId: string, key: string, timeoutMs = 90_000): Promise<string | undefined> {
    const deadline = Date.now() + timeoutMs;
    let value = await getOrderMetaValue(orderId, key);
    while (value === undefined && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 2_000));
        value = await getOrderMetaValue(orderId, key);
    }
    return value;
}

/* ------------------------------------------------------------------ */
/* Browser helpers                                                      */
/* ------------------------------------------------------------------ */

/**
 * Put exactly `productIds` in the customer's cart and PROVE it landed there.
 *
 * The proof comes from the database, not the page: WooCommerce writes `_woocommerce_persistent_cart_1`
 * from the `woocommerce_add_to_cart` action, which fires only on a SUCCESSFUL add. An empty cart offers
 * no payment methods at all, so without this check a silently failed add would surface much later as
 * "the gateway is not offered" — a statement about the cart dressed up as one about the gateway.
 *
 * The mechanics live in `stockCartWithProof()`; the proof MESSAGE stays here, because it names what a
 * missed add would make THIS file's cases a statement about.
 */
async function stockCart(paypal: PayPalMarketplacePage, productIds: string[]): Promise<void> {
    await stockCartWithProof(
        paypal,
        productIds,
        productId =>
            `the customer cart must hold product ${productId} before checkout — an empty cart offers no payment methods at all, and this case would then fail against the gateway for a reason that has nothing to do with it`,
    );
}

/**
 * Select PayPal Marketplace on the CLASSIC checkout and PROVE the selection took.
 *
 * The LABEL is clicked, not the radio: WooCommerce hides the radio input outright when the gateway is
 * the only available method (`checkout.js:228-231`), so a forced click on a zero-size input lands at the
 * page origin. The `toBeChecked()` assertion is load-bearing rather than defensive — the form is
 * submitted by SERIALIZING it, and an unchecked radio posts no `payment_method` at all, so
 * `WC_Checkout::process_checkout()` would answer "Invalid payment method" far from the real cause.
 *
 * Both messages stay in this file: each names what the absence costs a REFUND case specifically.
 */
async function selectClassicPayPal(page: Page): Promise<void> {
    await selectClassicPayPalShared(page, {
        availability: `the classic checkout must offer ${PAYPAL_IDS.gateway} before a payment can be started — without it there is no capture and therefore nothing for this refund case to act on. PP-BLK-02 owns the availability claim itself`,
        selected: `${PAYPAL_IDS.gateway} must end up SELECTED on the classic checkout; the serialized form carries no payment_method otherwise and WC_Checkout::process_checkout() rejects the order as "Invalid payment method"`,
    });
}

interface CheckoutResult {
    result?: string;
    id?: number | string;
    order_id?: number | string;
    paypal_order_id?: string;
    paypal_redirect_url?: string;
    redirect?: string;
    messages?: string;
    message?: string;
    __error?: string;
}

/**
 * POST one of the module's own REST routes exactly as `PayPalPayment.tsx` does: `wp.apiFetch` from the
 * customer's own hydrated checkout page, so the session cookie, the REST nonce and the cart are all
 * real. Both block-path routes go through here — `create-payment` and `capture-payment/{order}`.
 */
async function blockApiPost(page: Page, route: string): Promise<CheckoutResult> {
    const raw = await page.evaluate(async (path: string) => {
        const w = window as unknown as { wp?: { apiFetch?: (options: { path: string; method: string }) => Promise<unknown> } };
        if (typeof w.wp?.apiFetch !== 'function') {
            return { __error: 'wp.apiFetch is not on the block checkout page, so the module block bundle (which declares it as a dependency) never loaded' };
        }
        try {
            return (await w.wp.apiFetch({ path, method: 'POST' })) as Record<string, unknown>;
        } catch (error) {
            const err = error as { message?: string; code?: string };
            return { __error: `${String(err?.code ?? 'error')}: ${String(err?.message ?? error)}` };
        }
    }, route);

    return raw as CheckoutResult;
}

/** What `POST /wc/store/v1/checkout` answers — the product's own place-order result. */
interface StoreApiCheckoutResult {
    order_id?: number | string;
    status?: string;
    payment_result?: {
        payment_status?: string;
        payment_details?: Array<{ key?: string; value?: string }>;
        redirect_url?: string;
    };
    __error?: string;
}

/**
 * Place the order through WooCommerce's Store API, which is what the checkout block itself does once
 * `PayPalPayment.tsx` calls `onSubmit()`.
 *
 * This is the request DOK-018 lived in: `Checkout::get_route_post_response()` reuses the draft order
 * (`StoreApi/Routes/V1/Checkout.php:642-704`), then fires `woocommerce_store_api_checkout_order_processed`
 * (`:549`) — the hook Lite's splitter is registered on (`dokan-lite/includes/Order/Hooks.php:42`) and
 * that `OrderController::protect_paid_sub_orders()` runs ahead of at priority 9.
 *
 * `billing_address` is REQUIRED by the checkout schema (`Schemas/V1/CheckoutSchema.php:125-135`), so it
 * is read back off the customer's OWN cart rather than invented here — a fabricated address would test
 * this file's idea of the customer instead of the site's. `payment_data` carries the approved PayPal
 * order id under the key the module validates on
 * (`Blocks/BlockHooks.php:45-70` → must equal the order's `_dokan_paypal_order_id`).
 */
async function storeApiPlaceOrder(page: Page, paypalOrderId: string): Promise<StoreApiCheckoutResult> {
    const raw = await page.evaluate(
        async (args: { cartRoute: string; checkoutRoute: string; gateway: string; paypalOrderId: string }) => {
            const w = window as unknown as {
                wp?: { apiFetch?: (options: { path: string; method?: string; data?: unknown }) => Promise<unknown> };
            };
            if (typeof w.wp?.apiFetch !== 'function') {
                return {
                    __error:
                        'wp.apiFetch is not on the block checkout page, so the Store API place-order the checkout block performs cannot be driven at all (and neither can its nonce middleware, wc-blocks-middleware.js, which attaches the Store API Nonce header)',
                };
            }
            try {
                const cart = (await w.wp.apiFetch({ path: args.cartRoute })) as {
                    billing_address?: Record<string, string>;
                    shipping_address?: Record<string, string>;
                };
                return (await w.wp.apiFetch({
                    path: args.checkoutRoute,
                    method: 'POST',
                    data: {
                        billing_address: cart.billing_address ?? {},
                        shipping_address: cart.shipping_address ?? cart.billing_address ?? {},
                        payment_method: args.gateway,
                        payment_data: [{ key: 'dokan_paypal_order_id', value: args.paypalOrderId }],
                    },
                })) as Record<string, unknown>;
            } catch (error) {
                const err = error as { message?: string; code?: string };
                return { __error: `${String(err?.code ?? 'error')}: ${String(err?.message ?? error)}` };
            }
        },
        { cartRoute: STORE_API_CART, checkoutRoute: STORE_API_CHECKOUT, gateway: PAYPAL_IDS.gateway, paypalOrderId },
    );

    return raw as StoreApiCheckoutResult;
}

/* ------------------------------------------------------------------ */
/* The hosted buyer approval — the one step with no API equivalent      */
/* ------------------------------------------------------------------ */

/**
 * Log the sandbox buyer in on PayPal's hosted page and click Pay.
 *
 * The driving itself is `driveHostedApproval()` in the page object — ONE driver for the whole suite.
 * This file used to carry its own thinner copy, and on 2026-08-04 that copy failed PP-REF-01 by
 * hard-waiting the email field and then clicking `#btnLogin` unconditionally: PayPal had carried the
 * buyer's session and put the browser straight on the REVIEW page
 * (`sandbox.paypal.com/pay?…&ul=1`, title "Pay with PayPal"), where there is no login button, so the
 * click waited out its 30s timeout against a page that was already asking to be approved. The shared
 * driver races the pay button into its landing set, so an already-authenticated buyer simply approves.
 *
 * A PayPal-side obstacle — captcha, one-time code, or a rejected/locked buyer credential — is a
 * declared skip, because the module is never reached and a red would be a false accusation against
 * the product (and every retry re-submits the same password, which is what locks the account).
 * Anything else throws with the live URL and page text: from the WordPress side a selector fault and
 * a real capture failure look identical — "PayPal never captured" — and only the hosted page can
 * tell them apart. A simulated approval is never substituted, because a refund asserted against a
 * capture this test invented would report a working payout where none exists.
 */
async function driveHostedApprovalForRefund(page: Page, approvalUrl: string): Promise<void> {
    const outcome = await driveHostedApprovalShared(page, approvalUrl);

    if (outcome.blocker) {
        test.skip(
            true,
            `No refund case can run on this attempt: ${outcome.blocker} Steps reached: ${outcome.steps.join(' → ') || '(none)'}. ` +
                `Reported as a declared environment gap, never as a pass and never as a red — the module was never reached.`,
        );
    }
}

/**
 * Approve, then follow PayPal's redirect back to the site.
 *
 * The redirect is the point for the classic and block paths. `application_context.return_url` is the
 * order-received page plus `button_type` and `wc_payment_method` (`PaymentMethods/PayPal.php:288-297`),
 * PayPal appends `token` and `PayerID`, and `OrderController::maybe_process_order_redirect()`
 * (`Order/OrderController.php:489-531`) captures on exactly that request. So the capture in those cases
 * is performed by the product on a real page load, not by this test.
 */
async function approveOnPayPal(page: Page, approvalUrl: string): Promise<void> {
    await driveHostedApprovalForRefund(page, approvalUrl);

    await page.waitForURL(/order-received/i, { timeout: 180_000 }).catch(() => undefined);

    const landed = page.url();
    expect(
        landed,
        `after approving, PayPal must return the buyer to the site's order-received page — that page load IS the capture (OrderController::maybe_process_order_redirect(), Order/OrderController.php:489-531). The browser is at ${landed} instead, so the money was authorised at PayPal and never captured by the shop: the customer sees a completed PayPal payment and the order stays unpaid.`,
    ).toMatch(/order-received/i);

    expect(
        landed,
        `the return URL must carry a PayerID. maybe_process_order_redirect() bails when it is absent (Order/OrderController.php:493-495) and the capture never runs. Landed on: ${landed}`,
    ).toContain('PayerID');

    expect(
        landed,
        `the return URL must carry a NON-EMPTY button_type. The module builds it from Helper::get_settings('button_type') (PaymentMethods/PayPal.php:292), which reads the RAW option and does not fall back to the form-field default, so an unsaved setting produces "button_type=" — and maybe_process_order_redirect() then bails (Order/OrderController.php:496-497) leaving every captured-order case in this file with an unpaid order. Landed on: ${landed}`,
    ).toMatch(/[?&]button_type=[^&]+/);
}

/**
 * Approve on PayPal's hosted page WITHOUT letting the browser follow PayPal's return redirect.
 *
 * The checkout block approves inside the PayPal SDK's popup: the merchant page is never navigated to
 * `application_context.return_url`, so `maybe_process_order_redirect()` never runs and the money is
 * taken by the module's own capture-payment route instead (`PayPalPayment.tsx` `capturePayment()`).
 * That difference is the entire subject of PP-REF-05. The redirect handler calls `payment_complete()`
 * (`Order/OrderController.php:522-523`), which takes the order out of `checkout-draft`; the Store API
 * would then refuse to reuse it (`StoreApi/Utilities/DraftOrderTrait::is_valid_draft_order()`) and
 * place a SECOND, different order — and the re-split window DOK-018 lived in would never open.
 *
 * Only the BROWSER navigation is blocked, and it stays blocked for the rest of this page's life so a
 * late redirect cannot slip through after the approval returned. Nothing server-side is stubbed: the
 * approval is a real one, and it is read back from PayPal's own copy of the order rather than inferred
 * from a page this test kept away from the site.
 */
async function approveOnPayPalWithoutReturning(page: Page, approvalUrl: string, paypalOrderId: string): Promise<void> {
    await page.route(RETURN_TO_SITE, route => route.abort());
    await driveHostedApprovalForRefund(page, approvalUrl);

    const deadline = Date.now() + 120_000;
    let status = String((await getPayPalOrder(paypalOrderId)).status ?? '');
    while (status !== 'APPROVED' && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 3_000));
        status = String((await getPayPalOrder(paypalOrderId)).status ?? '');
    }

    expect(
        status,
        `PayPal must report order ${paypalOrderId} as APPROVED after the buyer paid on its hosted page — that approval is what the capture-payment route then captures, and without it there is no money to refund. ` +
            `COMPLETED here would mean the return redirect reached the site after all and OrderController::maybe_process_order_redirect() (Order/OrderController.php:489-531) captured and completed the payment: the draft order leaves checkout-draft, the Store API places a different order, and this case would no longer exercise the place-order re-split it exists to guard. PayPal says: "${status || '(none)'}".`,
    ).toBe('APPROVED');
}

/* ------------------------------------------------------------------ */
/* The capture fixture                                                  */
/* ------------------------------------------------------------------ */

interface RefundTarget {
    /** The order a Dokan refund request must name — a sub order when the parent was split. */
    orderId: string;
    vendorId: string;
    /** The merchant id this vendor's money must have gone to, resolved from .env, never from the response. */
    merchantId: string;
}

/**
 * Everything the Store-API place-order produced, captured either side of the request that used to
 * destroy the sub orders. Only the `store` path fills this in.
 */
interface StoreApiPlacement {
    /** Sub order ids as they stood AFTER the capture and BEFORE the place-order. */
    subOrderIdsBeforePlaceOrder: string[];
    /** `_dokan_vendor_id` per pre-place sub order. */
    vendorBySubOrder: Record<string, string>;
    /** `_dokan_paypal_payment_capture_id` per pre-place sub order, as the capture wrote it. */
    captureIdBySubOrder: Record<string, string>;
    /** What `POST /wc/store/v1/checkout` answered. */
    result: StoreApiCheckoutResult;
}

interface CapturedOrder {
    parentOrderId: string;
    paypalOrderId: string;
    /** Empty for a single-vendor order, which Dokan does not split. */
    subOrderIds: string[];
    targets: RefundTarget[];
    /** Set by `path: 'store'` only — the re-split window PP-REF-05 asserts across. */
    storeApi?: StoreApiPlacement;
}

/** Which merchant id a vendor's money is supposed to reach. */
function merchantForVendor(vendorId: string): string {
    if (String(vendorId) === String(VENDOR_ID)) {
        return PAYPAL_MERCHANTS.vendor1;
    }
    if (String(vendorId) === String(VENDOR2_ID)) {
        return PAYPAL_MERCHANTS.vendor2;
    }
    return '';
}

/** Every order id this file created, so `afterAll` can remove the money it moved. */
const createdOrderIds: string[] = [];

/**
 * Finish the checkout block's real sequence after the buyer approved: capture through the module's own
 * route, snapshot the sub orders the capture just wrote to, and then PLACE the order through the Store
 * API — the request DOK-018 lived in.
 *
 * The snapshot is taken between the capture and the place-order deliberately: the re-split does not
 * merely empty the sub orders, it `delete( true )`s them and creates different ones
 * (`dokan-lite/includes/Order/Manager.php:912-918`), so the only assertion that can tell survival from
 * replacement is the sub order ID SET, compared across this exact boundary.
 */
async function placeThroughStoreApi(page: Page, paypal: PayPalMarketplacePage, ids: { parentOrderId: string; paypalOrderId: string }): Promise<StoreApiPlacement> {
    // Back on the customer's own checkout page, capture the way `PayPalPayment.tsx` does when the SDK
    // reports an approval. Nothing here writes payment state; the module takes the money.
    await paypal.gotoBlockCheckout();
    const capture = await blockApiPost(page, `${CAPTURE_PAYMENT_ROUTE}/${ids.parentOrderId}`);
    expect(
        capture.__error ?? null,
        `POST ${CAPTURE_PAYMENT_ROUTE}/${ids.parentOrderId} is how the checkout block takes the money once the buyer approved (PayPalPayment.tsx capturePayment() → REST/V1/PayPalController.php:299-324, which calls OrderController::handle_capture_payment_validation()). Without it the buyer has paid at PayPal, the shop has captured nothing, and this case has neither a capture to protect nor one to refund.`,
    ).toBeNull();

    const captured = await waitForOrderMeta(ids.parentOrderId, '_dokan_paypal_payment_charge_captured', 60_000);
    expect(
        captured ?? null,
        `order ${ids.parentOrderId} must carry _dokan_paypal_payment_charge_captured after the capture-payment route ran — OrderManager::handle_order_complete_status() (Order/OrderManager.php:474-481) writes it at the moment it captures, and protect_paid_sub_orders() reads exactly this meta to decide the sub orders are worth protecting (Order/OrderController.php:105-112). Without it the place-order below would legitimately re-split and this case would be asserting nothing.`,
    ).not.toBeNull();

    const before = (await dbUtils.getChildOrderIds(ids.parentOrderId)).map(String);
    for (const subOrderId of before) {
        // Registered now, not after the place-order: sub orders lost to a re-split still hold money rows.
        createdOrderIds.push(subOrderId);
    }

    expect(
        before.length,
        `the captured draft order ${ids.parentOrderId} must already hold its sub orders BEFORE it is placed — create-payment splits it to build the per vendor purchase units (PaymentMethods/PayPal.php:261-276), and they are what the capture wrote the capture ids onto. With none, there is nothing for the place-order to destroy and no DOK-018 claim to make. Sub orders found: ${JSON.stringify(before)}`,
    ).toBeGreaterThan(0);

    const vendorBySubOrder: Record<string, string> = {};
    const captureIdBySubOrder: Record<string, string> = {};
    for (const subOrderId of before) {
        vendorBySubOrder[subOrderId] = String((await getOrderMetaValue(subOrderId, '_dokan_vendor_id')) ?? '');
        captureIdBySubOrder[subOrderId] = String((await getOrderMetaValue(subOrderId, '_dokan_paypal_payment_capture_id')) ?? '');
        expect(
            captureIdBySubOrder[subOrderId],
            `sub order ${subOrderId} must carry _dokan_paypal_payment_capture_id BEFORE the order is placed. The capture writes it in OrderManager::store_capture_payment_data() (Order/OrderManager.php:549), and it is the thing DOK-018 lost. Without it here the loss would already have happened at capture time, which is a different bug from the one this case guards.`,
        ).not.toBe('');
    }

    const result = await storeApiPlaceOrder(page, ids.paypalOrderId);

    /*
     * A shipping refusal is this SITE's configuration, not the gateway's behaviour, and there is no
     * honest way to assert the re-split without a place-order that actually runs. Declared as a skip so
     * the gap is visible in the report — every other Store API refusal falls through to the expect below
     * and fails, because those are either the product or this file's own transport.
     */
    test.skip(
        typeof result.__error === 'string' && STORE_API_SHIPPING_REFUSAL.test(result.__error),
        `the Store API refused to place the block order for a reason outside the gateway: "${String(result.__error)}". PP-REF-05 needs a real POST /wc/store/v1/checkout, because woocommerce_store_api_checkout_order_processed — the hook Lite's splitter and the module's protect_paid_sub_orders() both hang off — fires nowhere else. Configure a shipping zone with a rate that covers the customer's address on this site and the case runs.`,
    );

    expect(
        result.__error ?? null,
        `POST ${STORE_API_CHECKOUT} must place the order the checkout block was checking out with. This request IS the DOK-018 window: it reuses the captured draft order and fires woocommerce_store_api_checkout_order_processed (StoreApi/Routes/V1/Checkout.php:549), which Lite's splitter is registered on. Its refusal leaves the buyer charged at PayPal with no placed order, and leaves this regression guard unable to test anything.`,
    ).toBeNull();

    return { subOrderIdsBeforePlaceOrder: before, vendorBySubOrder, captureIdBySubOrder, result };
}

/**
 * Buy something for real and let PayPal capture it.
 *
 * Returns only ids and the vendors behind them; every amount is read back from PayPal or from
 * WooCommerce at the point it is asserted, never carried along from here.
 *
 * `path` picks the transport:
 *   - `classic` — the serialized `form.checkout` POST, captured on PayPal's return redirect;
 *   - `block`   — the module's cart create-payment route, captured on the same return redirect;
 *   - `store`   — the checkout block's FULL sequence: create-payment, hosted approval with the return
 *                 redirect blocked, capture through the module's capture-payment route, then a real
 *                 `POST /wc/store/v1/checkout` place-order. Only this one opens the re-split window.
 */
async function captureOrder(browser: Browser, opts: { productIds: string[]; path?: 'classic' | 'block' | 'store' }): Promise<CapturedOrder> {
    const path = opts.path ?? 'classic';
    /**
     * The card route is available on the CLASSIC checkout only, and only when it was asked for.
     *
     * `block` and `store` are excluded by construction, not by preference: the unbranded button and
     * the card fields are printed by `woocommerce_review_order_after_submit` /
     * `PayPal::payment_fields()`, neither of which the checkout BLOCK renders — the block starts its
     * payment through `POST /dokan/v1/paypal-marketplace/create-payment` and approves inside the SDK
     * popup. Those two paths therefore stay on the wallet, buyer login and all.
     */
    const captureByCard = USE_CARD_CAPTURE && path === 'classic';
    let storeApi: StoreApiPlacement | undefined;
    let parentOrderId = '';
    let paypalOrderId = '';
    let approvalUrl = '';

    await withCustomer(browser, async (page, paypal) => {
        await stockCart(paypal, opts.productIds);

        let result: CheckoutResult;
        if (path === 'block' || path === 'store') {
            await paypal.gotoBlockCheckout();
            result = await createBlockPayment(page);
            expect(
                result.__error ?? null,
                `POST ${CREATE_PAYMENT_ROUTE} is the only way the checkout block can start a PayPal payment (PayPalPayment.tsx:145-148); without it there is no order to capture and no capture to refund`,
            ).toBeNull();
            parentOrderId = String(result.order_id ?? '');
        } else {
            await page.goto(CLASSIC.url, { waitUntil: 'domcontentloaded' });
            await expect(page.locator(CLASSIC.placeOrder), 'the classic checkout page must render the order form before it can be submitted').toBeAttached({ timeout: 60_000 });
            await selectClassicPayPal(page);
            if (captureByCard) {
                // The card route creates the order from inside the module's own `createOrder` callback
                // and captures it in the same click, so `submitClassicCheckout()` must NOT also run — a
                // second checkout POST would create a second order. What comes back is the same
                // `wc-ajax=checkout` payload, read off the wire, so the assertions below are unchanged.
                await waitForCheckoutSettled(page);
                result = await payWithCardOnClassicCheckout(page, [VENDOR_ID, VENDOR2_ID]);
            } else {
                result = await submitClassicCheckout(page);
            }
            expect(result.__error ?? null, 'the classic checkout POST must reach WC_Checkout::process_checkout(), or no order exists to pay for').toBeNull();
            expect(
                result.result,
                `the classic checkout must return result=success before anything can be captured. WooCommerce reports the reason in "messages": ${String(result.messages ?? result.message ?? '(none)').slice(0, 400)}`,
            ).toBe('success');
            parentOrderId = String(result.id ?? result.order_id ?? '');
        }

        paypalOrderId = String(result.paypal_order_id ?? '');
        approvalUrl = String(result.paypal_redirect_url ?? result.redirect ?? '');

        // Registered BEFORE the approval so an order that dies mid-flow is still cleaned up.
        if (parentOrderId) {
            createdOrderIds.push(parentOrderId);
        }

        expect(parentOrderId, `the ${path} checkout must report the WooCommerce order it created. Response: ${JSON.stringify(result ?? null).slice(0, 400)}`).not.toBe('');
        expect(
            paypalOrderId,
            `the ${path} checkout must return a paypal_order_id — PayPal::process_payment() returns it at PaymentMethods/PayPal.php:344-352 and it is the only handle on PayPal's copy of this payment. Response: ${JSON.stringify(result ?? null).slice(0, 400)}`,
        ).not.toBe('');
        expect(
            approvalUrl,
            `the ${path} checkout must return the PayPal approval link (links[1] of the created order, stored as _dokan_paypal_redirect_url at PaymentMethods/PayPal.php:335). Without it the buyer can never approve and nothing can be captured. Response: ${JSON.stringify(result ?? null).slice(0, 400)}`,
        ).toContain('paypal.com');

        if (path === 'store') {
            // The block never returns to the site to pay: it approves in the SDK popup and then captures
            // and places the order itself. Both steps are driven here, in that order.
            await approveOnPayPalWithoutReturning(page, approvalUrl, paypalOrderId);
            storeApi = await placeThroughStoreApi(page, paypal, { parentOrderId, paypalOrderId });
        } else if (!captureByCard) {
            // Same page, same context: the return redirect lands back on the site with the customer's own
            // session, which is what a real buyer's browser does.
            await approveOnPayPal(page, approvalUrl);
        }
    });

    // The parent carries the "charge captured" marker; the capture ids land per sub order
    // (`Order/OrderManager.php:474-484` and `:505-560`).
    const captured = await waitForOrderMeta(parentOrderId, '_dokan_paypal_payment_charge_captured');
    expect(
        captured ?? null,
        `order ${parentOrderId} must carry _dokan_paypal_payment_charge_captured after the buyer approved and PayPal redirected back. The product writes it in OrderManager::handle_order_complete_status() (Order/OrderManager.php:474-481) at the moment it captures. Its absence means the money was authorised at PayPal but never captured by the shop — the customer has paid and the vendor has not been paid — and there is no capture for this refund case to reverse. Look for "Error in capturing payment on order received page" in wp-content/uploads/wc-logs/.`,
    ).not.toBeNull();

    const subOrderIds = await dbUtils.getChildOrderIds(parentOrderId);
    const targetIds = subOrderIds.length > 0 ? subOrderIds : [parentOrderId];
    const targets: RefundTarget[] = [];

    for (const orderId of targetIds) {
        const captureId = await waitForOrderMeta(orderId, '_dokan_paypal_payment_capture_id', 60_000);
        expect(
            captureId ?? null,
            `order ${orderId} must carry _dokan_paypal_payment_capture_id. Refund::process_refund() reads exactly this meta and, when it is missing, writes the order note "Automatic refund is not possible for this order. Reason: No PayPal capture id is found." and returns without refunding anything (includes/Refund.php:89-99) — the customer's money then stays with the vendor and the refund silently never happens. That symptom is DOK-018, fixed in 5.0.9.`,
        ).not.toBeNull();

        const vendorId = String((await getOrderMetaValue(orderId, '_dokan_vendor_id')) ?? '');
        expect(
            vendorId,
            `order ${orderId} must name its vendor in _dokan_vendor_id. Without it neither Dokan nor this test can say whose money a refund reverses, and Refund::process_refund() would find no merchant id to refund against (includes/Refund.php:102-114).`,
        ).not.toBe('');

        const merchantId = merchantForVendor(vendorId);
        expect(
            merchantId,
            `order ${orderId} belongs to vendor ${vendorId}, which is neither of the suite vendors (${VENDOR_ID}, ${VENDOR2_ID}) — the expected payee merchant id cannot be resolved, so no per-vendor money assertion in this case would mean anything`,
        ).not.toBe('');

        targets.push({ orderId, vendorId, merchantId });
    }

    for (const orderId of subOrderIds) {
        createdOrderIds.push(orderId);
    }

    log.success(
        `captured PayPal order ${paypalOrderId} for WooCommerce order ${parentOrderId} (${path} checkout, approved by ${captureByCard ? 'CARD (Advanced Card / UCC, no buyer login)' : 'the PayPal-hosted WALLET'}); refundable target(s): ${JSON.stringify(targets.map(target => target.orderId))}`,
    );

    return { parentOrderId, paypalOrderId, subOrderIds, targets, storeApi };
}

/**
 * The money oracle for the capture itself, checked against PayPal's own record before any refund runs.
 *
 * Two independent claims, both about money rather than status:
 *   - per vendor, `payee.merchant_id` is that vendor's own merchant id — a wrong payee routes a
 *     vendor's takings to somebody else, and no order status would ever reveal it;
 *   - per unit, PayPal's captured `gross_amount` equals `net_amount + paypal_fee + platform_fees`,
 *     i.e. order total == vendor earning + gateway fee + admin commission, and the units together add
 *     up to the WooCommerce order total.
 */
async function assertCaptureReconciles(captured: CapturedOrder): Promise<PayPalOrder> {
    const paypalOrder = await getPayPalOrder(captured.paypalOrderId);
    const parent = await wcOrder(captured.parentOrderId);
    let unitTotal = 0;

    expect(
        paypalOrder.status ?? null,
        `PayPal must report order ${captured.paypalOrderId} as COMPLETED after the capture; anything else means the money was never taken and every refund assertion below would be reversing a payment that does not exist. PayPal says: ${JSON.stringify(paypalOrder.status ?? null)}`,
    ).toBe('COMPLETED');

    for (const target of captured.targets) {
        const unit = unitForOrder(paypalOrder, target.orderId);
        expect(
            unit,
            `PayPal must hold a purchase unit whose custom_id is sub order ${target.orderId} (OrderManager::make_purchase_unit_data() sets custom_id to the order id, Order/OrderManager.php:219). Without it this vendor was never in the PayPal order and nothing was captured for them. Units present: ${JSON.stringify((paypalOrder.purchase_units ?? []).map(u => u.custom_id ?? null))}`,
        ).not.toBeNull();

        expect(
            unit?.payee?.merchant_id ?? null,
            `the purchase unit for order ${target.orderId} must name vendor ${target.vendorId}'s OWN merchant id as payee (OrderManager::make_purchase_unit_data() takes it from Helper::get_seller_merchant_id(), Order/OrderManager.php:154). A different id here means this vendor's takings were captured into somebody else's PayPal account, which no order status and no WordPress meta would ever show.`,
        ).toBe(target.merchantId);

        const capture = capturesOf(unit)[0] ?? null;
        expect(
            capture,
            `PayPal must hold a capture for order ${target.orderId}. Its absence means the buyer approved and the money was never taken from them, so there is nothing to refund. Unit: ${JSON.stringify(unit ?? null)}`,
        ).not.toBeNull();

        expect(
            capture?.status ?? null,
            `the capture for order ${target.orderId} must be COMPLETED before a refund can reverse it. Capture: ${JSON.stringify(capture ?? null)}`,
        ).toBe('COMPLETED');

        const breakdown = capture?.seller_receivable_breakdown;
        const gross = money(breakdown?.gross_amount);
        const fee = money(breakdown?.paypal_fee);
        const net = money(breakdown?.net_amount);
        const platform = (breakdown?.platform_fees ?? []).reduce((sum, entry) => sum + money(entry.amount), 0);

        expect(
            gross,
            `the capture for order ${target.orderId} must be for a non-zero amount; a zero capture settles nothing for the vendor. Breakdown: ${JSON.stringify(breakdown ?? null)}`,
        ).toBeGreaterThan(0);

        expect(
            net + fee + platform,
            `PayPal's own capture breakdown for order ${target.orderId} must reconcile: gross (${gross}) == vendor net (${net}) + PayPal fee (${fee}) + platform fee / admin commission (${platform}). This is the money identity the whole marketplace rests on — if it does not hold, somebody is being paid an amount nobody accounted for. Breakdown: ${JSON.stringify(breakdown ?? null)}`,
        ).toBeCloseTo(gross, 2);

        unitTotal += money(unit?.amount);
    }

    // Tolerance rather than toBeCloseTo(…, 2): each unit is rounded to the currency's precision on its
    // own (`OrderManager::format_amount_for_currency()`), so a multi-vendor order can legitimately be a
    // cent away from the parent total. 0.02 accepts that and still catches a real divergence.
    expect(
        Math.abs(unitTotal - Number(parent.total ?? 0)),
        `the purchase units PayPal captured must add up to the WooCommerce order total for order ${captured.parentOrderId}, within a cent per vendor unit. WooCommerce says ${String(parent.total ?? 'unknown')}, PayPal's ${captured.targets.length} unit(s) add up to ${unitTotal.toFixed(2)}. A real gap means the shop charged the customer one amount and PayPal settled another, and the difference belongs to nobody.`,
    ).toBeLessThanOrEqual(0.02 * Math.max(1, captured.targets.length));

    return paypalOrder;
}

/* ------------------------------------------------------------------ */
/* Refund driving layer                                                 */
/* ------------------------------------------------------------------ */

interface IssuedRefund {
    /** The `wp_dokan_refund` row the request created, read back from the database. */
    row: DokanRefundRow | null;
    /** Order notes as they stood after the request, newest first. */
    notes: string[];
}

/**
 * Ask Dokan for an automatic (API-method) refund on one order, the way the admin order screen does,
 * and hand back the evidence rather than a verdict.
 *
 * `refundOrderViaDokan()` goes through `dokan_pro()->refund->create()`, which fires
 * `dokan_refund_request_created` — the hook the module's `Refund::process_refund()` listens on
 * (`includes/Refund.php:43`). So the PayPal refund runs INSIDE this call.
 *
 * Two things this deliberately does NOT do: it does not assert on the mu-plugin's own `refund_amount`
 * echo (it reports the order total even for a partial refund, an inaccuracy inherited from the Stripe
 * helper), and it does not treat an HTTP 200 as success — the module swallows a PayPal failure into an
 * order note and cancels the request (`includes/Refund.php:154-166`), so the note text and the refund
 * row are the only honest signals.
 */
async function issueAutomaticRefund(orderId: string, amount?: number): Promise<IssuedRefund> {
    const before = await refundRows(orderId);
    const beforeIds = new Set(before.map(row => row.id));

    const response = await refundOrderViaDokan(orderId, amount === undefined ? undefined : amount.toFixed(2), 'e2e paypal marketplace refund');

    expect(
        response.error ?? null,
        `Dokan refused to create the refund request for order ${orderId}. That is its own message, verbatim, and it means no PayPal refund was even attempted — the customer's money stays where it is. The usual causes are the order status not being withdraw-active (dokan-pro/includes/Refund/Manager.php:292-306), a pending request already existing (:126-129), or the order having sub orders and needing to be refunded per sub order (:112-114).`,
    ).toBeNull();

    expect(response.threw, `the refund request for order ${orderId} threw inside Dokan; the PayPal refund path (includes/Refund.php:132-216) did not complete`).toBe(false);

    const after = await refundRows(orderId);
    const created = after.find(row => !beforeIds.has(row.id)) ?? null;
    const notes = await getOrderNotes(orderId);

    return { row: created, notes };
}

/**
 * Assert nothing in the refund path failed at PayPal, and keep both filed regressions as named anchors.
 *
 * The module writes PayPal's own error into an order note and cancels the request; it never returns the
 * failure to its caller. So a refund can appear to have "worked" at every layer except the one that
 * matters, and this is the assertion that catches it.
 */
function assertNoRefundFailureNote(notes: string[], orderId: string): void {
    const apiError = notes.find(note => REFUND_API_ERROR.test(note)) ?? null;
    expect(
        apiError,
        `PayPal refused the refund on order ${orderId} and the module recorded it as an order note (includes/Refund.php:154-161) — the refund request was then CANCELLED (:165) and the customer's money never moved. Note: ${JSON.stringify(apiError)}`,
    ).toBeNull();

    const duplicate = notes.find(note => DOK_019_SYMPTOM.test(note)) ?? null;
    expect(
        duplicate,
        `a refund failed with DUPLICATE_INVOICE_ID, which is DOK-019 returning: PayPal requires a unique invoice_id per refund on a capture, and the fix in the installed build suffixes the Dokan refund id (includes/Refund.php:135-141). If this note is back, the second and every later refund on an order is impossible — a partial refund can never be followed by another. Note: ${JSON.stringify(duplicate)}`,
    ).toBeNull();

    const noCapture = notes.find(note => DOK_018_SYMPTOM.test(note)) ?? null;
    expect(
        noCapture,
        `a refund could not find its PayPal capture id, which is DOK-018 returning (fixed in 5.0.9 by OrderController::protect_paid_sub_orders(), Order/OrderController.php:83-140, plus the vendor-keyed fallback in OrderManager::store_capture_payment_data()). The vendor keeps money the customer was promised back, and no automatic refund on this order will ever succeed. Note: ${JSON.stringify(noCapture)}`,
    ).toBeNull();
}

/** The PayPal refund the product just made, located in PayPal's own copy of the order. */
async function readRefundFromPayPal(paypalOrderId: string, targetOrderId: string): Promise<{ order: PayPalOrder; unit: PayPalPurchaseUnit | null; refunds: PayPalRefund[] }> {
    const order = await getPayPalOrder(paypalOrderId);
    const unit = unitForOrder(order, targetOrderId);
    return { order, unit, refunds: refundsOf(unit) };
}

interface VendorAjaxResult {
    status: number;
    success: boolean | null;
    message: string;
    raw: string;
}

/**
 * Submit a refund request as the VENDOR, through the product's own transport.
 *
 * The vendor dashboard posts `action=dokan_refund_request` to admin-ajax with the `order-item` nonce
 * (`dokan-pro/includes/Refund/Ajax.php:82-83`), which WordPress localizes as
 * `window.dokan_refund.order_item_nonce` on every dashboard page (`dokan-pro.php:563-565` →
 * `includes/Refund/functions.php:33`). Driving that from the vendor's real, logged-in page is the
 * product's own path — and unlike the mu-plugin route it runs `Request::validate()`, which is where the
 * over-refund and already-refunded guards live (`dokan-pro/includes/Refund/Validator.php:62-78`).
 */
async function vendorRefundRequest(
    browser: Browser,
    opts: { storageState: string; orderId: string; amount: number; apiRefund?: boolean; reason?: string },
): Promise<VendorAjaxResult> {
    return withVendor(browser, async page => {
        await page.goto('/dashboard/', { waitUntil: 'domcontentloaded' });

        const nonce = await page
            .waitForFunction(() => (window as unknown as { dokan_refund?: { order_item_nonce?: string } }).dokan_refund?.order_item_nonce ?? null, undefined, { timeout: 60_000 })
            .then(handle => handle.jsonValue() as Promise<string | null>)
            .catch(() => null);

        expect(
            nonce,
            `the vendor dashboard must expose window.dokan_refund.order_item_nonce; Dokan Pro localizes it onto dokan-script for every dashboard page (dokan-pro.php:563-565). Without it no vendor can submit a refund request at all — check that the vendor session is still valid and that /dashboard/ rendered.`,
        ).not.toBeNull();

        const result = await page.evaluate(
            async (args: { nonce: string; orderId: string; amount: string; apiRefund: string; reason: string }) => {
                const body = new URLSearchParams({
                    action: 'dokan_refund_request',
                    security: args.nonce,
                    order_id: args.orderId,
                    refund_amount: args.amount,
                    refund_reason: args.reason,
                    api_refund: args.apiRefund,
                    restock_refunded_items: 'false',
                });
                const res = await fetch('/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: body.toString(),
                });
                return { status: res.status, raw: (await res.text()).slice(0, 1500) };
            },
            {
                nonce: String(nonce),
                orderId: opts.orderId,
                amount: opts.amount.toFixed(2),
                apiRefund: opts.apiRefund === false ? 'false' : 'true',
                reason: opts.reason ?? 'e2e vendor refund request',
            },
        );

        /*
         * The failure body is NOT one shape. `send_response_error()` sends a bare STRING for a
         * DokanException carrying a message and a serialized WP_Error (`{errors:{code:[msg]}}`) for one
         * carrying a WP_Error (dokan-lite/includes/Traits/AjaxResponseError.php:21-33), while success
         * sends `{refund, message}`. So `message` is extracted best-effort and every regex assertion in
         * this file matches against `raw` — a parser that quietly returned '' would turn a correct
         * rejection into a failing test.
         */
        let success: boolean | null = null;
        let message = '';
        try {
            const parsed = JSON.parse(result.raw) as { success?: boolean; data?: unknown };
            success = parsed.success ?? null;
            const data = parsed.data;
            if (typeof data === 'string') {
                message = data;
            } else if (data && typeof data === 'object') {
                const shape = data as { message?: unknown; error?: unknown; errors?: unknown };
                message = String(shape.message ?? shape.error ?? JSON.stringify(shape.errors ?? shape));
            }
        } catch {
            message = result.raw;
        }

        return { status: result.status, success, message, raw: result.raw };
    }, opts.storageState);
}

interface AdminRefundItem {
    id?: number;
    order_id?: number;
    amount?: number | string;
    status?: string;
    type?: string;
    api?: boolean;
    vendor?: { id?: number };
}

/** The admin's own view of the refund queue — `GET /dokan/v1/refunds` (RefundController.php:48-83). */
async function adminRefundQueue(orderId: string, status?: 'pending' | 'completed' | 'cancelled'): Promise<AdminRefundItem[]> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const url = `${SERVER_URL}/dokan/v1/refunds?search=${orderId}&per_page=100${status ? `&status=${status}` : ''}`;
        const res = await ctx.get(url);
        if (!res.ok()) {
            throw new Error(`the admin refund queue could not be read (HTTP ${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
        const body = (await res.json().catch(() => [])) as AdminRefundItem[];
        return (Array.isArray(body) ? body : []).filter(item => String(item.order_id ?? '') === String(orderId));
    } finally {
        await ctx.dispose();
    }
}

/** Approve or cancel a pending refund as the admin (RefundController.php:85-118). */
async function adminRefundAction(refundId: number, action: 'approve' | 'cancel'): Promise<{ status: number; body: string }> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.post(`${SERVER_URL}/dokan/v1/refunds/${refundId}/${action}?api=true`, { timeout: 120_000 });
        return { status: res.status(), body: (await res.text()).slice(0, 600) };
    } finally {
        await ctx.dispose();
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
 *
 * The switch itself (`CAPTURE_ROUTE`, `USE_CARD_CAPTURE`, `CARD`, `announceCaptureRoute()`) and the
 * card capture flow live in `paypalMarketplaceCardCheckout.ts`. What stays below is this file's own
 * skip wording, which names what a missing card costs a REFUND case specifically.
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
/* Gates                                                                */
/* ------------------------------------------------------------------ */

let gatePromise: Promise<string | null> | null = null;

async function computeMoneyGate(): Promise<string | null> {
    if (!hasCredentials) {
        return CREDENTIALS_SKIP;
    }
    if (!HAS_REAL_MERCHANTS) {
        return MERCHANT_SKIP;
    }
    if (!HAS_APPROVAL_ACTOR) {
        return APPROVAL_ACTOR_SKIP;
    }

    const consents = await getBothMerchantConsents();
    const unpayable = Object.entries(consents).filter(([, consent]) => !isPayableMerchant(consent));
    if (unpayable.length > 0) {
        return (
            `PayPal will not accept ${unpayable.map(([label, consent]) => `${label} (${consent.merchantId}): ${consent.reason ?? 'not payments-receivable'}`).join('; ')} as a payee. ` +
            'A merchant id that looks right but is not payable makes every capture fail with an opaque payee error, so no refund case here could reach its subject. PP-PRE-04 reports this.'
        );
    }

    return null;
}

/** Memoised: the consent probe is two live PayPal calls and the answer cannot change mid-run. */
function moneyGate(): Promise<string | null> {
    gatePromise = gatePromise ?? computeMoneyGate();
    return gatePromise;
}

/* ------------------------------------------------------------------ */
/* Suite                                                                */
/* ------------------------------------------------------------------ */

test.describe('PayPal Marketplace — refunds', () => {
    /**
     * Every case buys something, waits for a human-speed hosted approval on paypal.com, captures, and
     * then refunds — several live round trips per case, on a third-party site.
     */
    test.describe.configure({ timeout: 900_000 });

    let vendor1ProductId = '';
    let vendor2ProductId = '';
    /** Gateway settings this file changed, restored in `afterAll` — see `M5`, money leaves state behind. */
    let originalButtonType: string | null = null;
    let originalDisbursementMode: string | null = null;

    test.beforeAll(async () => {
        // Announced before the credentials guard so the report always names the route, even on a run
        // where every case skips.
        announceCaptureRoute('PP-REF');

        // No test.skip() here on purpose: in a beforeAll it silently voids the entire describe.
        if (!hasCredentials) {
            return;
        }

        // Read the gateway's CURRENT configuration BEFORE anything writes to it: ensurePayPalConfigured()
        // pins disbursement_mode to INSTANT as its baseline, so reading afterwards would record this
        // file's own write as "the original" and afterAll would restore the wrong site.
        const before = await getPayPalStatus();
        originalButtonType = before.button_type;
        originalDisbursementMode = before.disbursement_mode;

        await ensurePayPalConfigured();
        await ensureCustomerAddress();
        await ensureClassicCheckoutPage();
        await ensureVendorStoreAddress(VENDOR_ID);
        await ensureVendorStoreAddress(VENDOR2_ID);
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: 'dokangit@vendor1.com' });
        await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' });

        // AFTER the vendor seeding: seedPayPalConnectedVendor() rewrites all six PayPal metas on every
        // call, including the UCC one, so opening gate 5 first would be undone here. Both vendors are
        // passed because gate 5 is all-or-nothing across whatever ends up in the cart.
        if (USE_CARD_CAPTURE) {
            await openCardGates([VENDOR_ID, VENDOR2_ID]);
        }

        const status = await getPayPalStatus();

        /*
         * `button_type` decides whether the capture happens at all. The module puts it in the PayPal
         * return_url and `maybe_process_order_redirect()` bails when it arrives empty
         * (Order/OrderController.php:496-497) — and `Helper::get_settings()` reads the raw option, so a
         * site that never saved the gateway form has no value even though the field's default is
         * `smart`. Set only when absent, and restored in afterAll.
         */
        if (!status.button_type) {
            await ensurePayPalConfigured({ button_type: 'smart' });
            log.warn('PP-REF: the gateway had no saved button_type, so the capture-on-return hook would never have fired. Set to "smart" for this file and restored afterwards.');
        }

        const api = new ApiUtils(await request.newContext());
        const [, product1] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Refund Vendor1 Product', regular_price: '100.00' }, payloads.vendorAuth);
        const [, product2] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Refund Vendor2 Product', regular_price: '100.00' }, payloads.vendor2Auth);
        vendor1ProductId = product1;
        vendor2ProductId = product2;
        await api.dispose();
    });

    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }

        // First, before anything can throw: an unrestored ucc_mode leaks a card form into every later
        // checkout spec on this worker and fails PP-SET-19 in a file that did nothing wrong.
        await restoreCardGates();

        // Restore the gateway to exactly the configuration this file found. A disbursement mode left on
        // DELAYED (PP-REF-11) would silently change what every later PayPal spec on this worker measures.
        await ensurePayPalConfigured(
            { button_type: originalButtonType ?? '' },
            (originalDisbursementMode as 'INSTANT' | 'ON_ORDER_COMPLETE' | 'DELAYED' | null) ?? 'INSTANT',
        );

        // Money rows first, orders second: deleting the order first would strip the join these use.
        const orderIds = [...new Set(createdOrderIds)].filter(Boolean);
        if (orderIds.length > 0) {
            const placeholders = orderIds.map(() => '?').join(', ');
            await dbUtils.dbQuery(`DELETE FROM \`${DB_PREFIX}_dokan_refund\` WHERE order_id IN (${placeholders});`, orderIds).catch(() => undefined);
            await dbUtils
                .dbQuery(
                    `DELETE FROM \`${DB_PREFIX}_dokan_vendor_balance\` WHERE trn_id IN (${placeholders}) AND vendor_id IN (?, ?) AND trn_type IN ('dokan_orders', 'dokan_withdraw', 'dokan_refund');`,
                    [...orderIds, VENDOR_ID, VENDOR2_ID],
                )
                .catch(() => undefined);
            await dbUtils.dbQuery(`DELETE FROM \`${DB_PREFIX}_dokan_orders\` WHERE order_id IN (${placeholders});`, orderIds).catch(() => undefined);
            await dbUtils.dbQuery(`DELETE FROM \`${DB_PREFIX}_dokan_reverse_withdrawal\` WHERE trn_id IN (${placeholders});`, orderIds).catch(() => undefined);
        }

        await dbUtils.clearCustomerCart(CUSTOMER_ID);

        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            // Children before parents: WooCommerce keeps the child rows when only the parent is deleted.
            const ordered = [...orderIds].sort((a, b) => Number(b) - Number(a));
            for (const orderId of ordered) {
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

        log.info(`PP-REF: cleaned up ${orderIds.length} order(s) and their refund, balance and dokan_orders rows.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-01 — full refund, single vendor                          */
    /* -------------------------------------------------------------- */

    test('PP-REF-01: a full refund on a single-vendor order succeeds and reverses the vendor earning', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId] });
        await assertCaptureReconciles(captured);

        const target = captured.targets[0] ?? null;
        expect(
            target,
            `a single-vendor cart must produce exactly one refundable order — Dokan does not split a one-vendor order, so the capture id lands on the order itself. Targets: ${JSON.stringify(captured.targets ?? null)}`,
        ).not.toBeNull();
        const orderId = target?.orderId ?? '';
        const vendorId = target?.vendorId ?? '';

        await ensureRefundApprovable(orderId);
        const ledgerBefore = await ledgerRows(vendorId);
        const orderBefore = await wcOrder(orderId);
        const fullTotal = Number(orderBefore.total ?? 0);

        const issued = await issueAutomaticRefund(orderId);
        assertNoRefundFailureNote(issued.notes, orderId);

        expect(
            issued.row ?? null,
            `a wp_dokan_refund row must exist for order ${orderId} after the request. Without it Dokan has no record of the refund at all, and the vendor's earning is never reversed even if PayPal moved the money.`,
        ).not.toBeNull();
        expect(
            issued.row?.status ?? null,
            `the refund request for order ${orderId} must end COMPLETED (status ${REFUND_STATUS.completed}). Status ${REFUND_STATUS.cancelled} means the module cancelled it after PayPal refused (includes/Refund.php:154-166) and no money moved; status ${REFUND_STATUS.pending} means the PayPal call never ran. Row: ${JSON.stringify(issued.row ?? null)}`,
        ).toBe(REFUND_STATUS.completed);

        // PayPal's own record — the only place the refund really exists.
        const { unit, refunds } = await readRefundFromPayPal(captured.paypalOrderId, orderId);
        expect(
            refunds.length,
            `PayPal must hold exactly one refund against vendor ${vendorId}'s capture for order ${orderId}. Zero means Dokan recorded a refund the customer will never receive; more than one means the order was refunded twice. Unit: ${JSON.stringify(unit ?? null)}`,
        ).toBe(1);

        const refund = refunds[0];
        expect(refund?.status ?? null, `the PayPal refund for order ${orderId} must be COMPLETED. Refund: ${JSON.stringify(refund ?? null)}`).toBe('COMPLETED');
        expect(
            money(refund?.amount),
            `PayPal must have refunded the FULL order total for order ${orderId}. WooCommerce total ${fullTotal}, PayPal refunded ${money(refund?.amount)} — a short refund leaves the customer out of pocket and an over-refund takes money the vendor never received. Refund: ${JSON.stringify(refund ?? null)}`,
        ).toBeCloseTo(fullTotal, 2);

        // The refund id the product recorded must be the one PayPal actually issued.
        const refundIdMeta = (await getOrderMetaValue(orderId, '_dokan_paypal_refund_id')) ?? '';
        expect(
            String(refundIdMeta),
            `order ${orderId} must record PayPal's refund id in _dokan_paypal_refund_id (includes/Refund.php:189-194). It is what the CAPTURE.REFUNDED webhook dedups against, so a missing id lets the same refund be booked twice when PayPal calls back. Recorded: ${JSON.stringify(refundIdMeta ?? null)}, PayPal issued: ${JSON.stringify(refund?.id ?? null)}`,
        ).toContain(String(refund?.id ?? 'missing'));

        // The vendor's earning is reversed by exactly what PayPal took back from them.
        const netTaken = money(refund?.seller_payable_breakdown?.net_amount);
        const ledgerAfter = await ledgerRows(vendorId);
        const refundLedger = ledgerAfter.filter(row => String(row.trn_id) === String(orderId) && row.trn_type === 'dokan_refund' && !ledgerBefore.some(before => before.id === row.id));

        expect(
            refundLedger.length,
            `vendor ${vendorId}'s ledger must gain a dokan_refund entry for order ${orderId} (includes/Refund.php:287-311). Without it the vendor keeps the earning for goods that were paid back to the customer. Rows now referencing this order: ${JSON.stringify(ledgerAfter.filter(row => String(row.trn_id) === String(orderId)))}`,
        ).toBeGreaterThan(0);

        const reversal = refundLedger.find(row => Number(row.debit) > 0) ?? null;
        expect(
            reversal,
            `the module's own reversal row must debit vendor ${vendorId} (includes/Refund.php:287-311 writes debit = the net amount PayPal took back). Rows created: ${JSON.stringify(refundLedger)}`,
        ).not.toBeNull();
        expect(
            Number(reversal?.debit ?? 0),
            `the reversal must be for the amount PayPal actually took back from vendor ${vendorId} — PayPal's seller_payable_breakdown.net_amount is ${netTaken}, the ledger says ${Number(reversal?.debit ?? 0)}. A mismatch means Dokan's books and PayPal's books disagree about what this vendor is owed. Refund breakdown: ${JSON.stringify(refund?.seller_payable_breakdown ?? null)}`,
        ).toBeCloseTo(netTaken, 2);

        const orderAfter = await wcOrder(orderId);
        expect(
            refundedTotal(orderAfter),
            `WooCommerce must record the full amount as refunded on order ${orderId}; it is what the shop, the customer's account page and every later refund attempt read. Refunds on the order: ${JSON.stringify(orderAfter.refunds ?? null)}`,
        ).toBeCloseTo(fullTotal, 2);
        expect(
            orderAfter.status ?? null,
            `order ${orderId} must move to "refunded" once every penny is refunded (WooCommerce sets it on woocommerce_order_fully_refunded). It is "${String(orderAfter.status)}" — a fully refunded order left in a paid status still counts towards the vendor's earnings and the shop's reports.`,
        ).toBe('refunded');

        log.success(`PP-REF-01: full refund ${String(refund?.id)} of ${money(refund?.amount)} on order ${orderId}; vendor ${vendorId} debited ${Number(reversal?.debit ?? 0)}.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-02 — partial refund                                      */
    /* -------------------------------------------------------------- */

    test('PP-REF-02: a partial refund records the requested amount and reduces the refundable balance', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId] });
        await assertCaptureReconciles(captured);

        const orderId = captured.targets[0]?.orderId ?? '';
        await ensureRefundApprovable(orderId);

        const before = await wcOrder(orderId);
        const total = Number(before.total ?? 0);
        const partial = Number((total * 0.4).toFixed(2));
        expect(partial, `the seeded order total (${total}) must be large enough for a meaningful partial refund`).toBeGreaterThan(0);

        const issued = await issueAutomaticRefund(orderId, partial);
        assertNoRefundFailureNote(issued.notes, orderId);
        expect(issued.row?.status ?? null, `the partial refund request on order ${orderId} must complete. Row: ${JSON.stringify(issued.row ?? null)}`).toBe(REFUND_STATUS.completed);

        // Deliberately NOT asserted: the mu-plugin route echoes the ORDER TOTAL in `refund_amount` even
        // for a partial refund. What was really refunded is what PayPal says was refunded.
        const { refunds } = await readRefundFromPayPal(captured.paypalOrderId, orderId);
        expect(refunds.length, `PayPal must hold exactly one refund for order ${orderId}. Refunds: ${JSON.stringify(refunds ?? null)}`).toBe(1);
        expect(
            money(refunds[0]?.amount),
            `PayPal must have refunded exactly the ${partial} that was requested on order ${orderId}, not the order total (${total}). Refunding the whole order when a fraction was asked for takes money out of the vendor's account that nobody authorised. Refund: ${JSON.stringify(refunds[0] ?? null)}`,
        ).toBeCloseTo(partial, 2);

        const after = await wcOrder(orderId);
        expect(
            refundedTotal(after),
            `WooCommerce must show ${partial} refunded on order ${orderId} after a partial refund. Refunds: ${JSON.stringify(after.refunds ?? null)}`,
        ).toBeCloseTo(partial, 2);
        expect(
            total - refundedTotal(after),
            `the remaining refundable balance on order ${orderId} must drop to ${(total - partial).toFixed(2)}. It is the ceiling Dokan validates every later refund against (dokan-pro/includes/Refund/Validator.php:70-77); if it does not move, the same money can be refunded again and again.`,
        ).toBeCloseTo(total - partial, 2);
        expect(
            after.status ?? null,
            `order ${orderId} must NOT be marked fully refunded after a partial refund — it is "${String(after.status)}". A partially refunded order that reads as refunded stops counting as a sale and hides the outstanding balance.`,
        ).not.toBe('refunded');

        log.success(`PP-REF-02: partial refund of ${partial} of ${total} on order ${orderId}; ${(total - partial).toFixed(2)} still refundable.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-03 — second refund on the same capture (DOK-019 guard)   */
    /* -------------------------------------------------------------- */

    /**
     * PP-REF-03 is a PASSING regression guard, not a `fixme`. DOK-019 (a second refund on one capture
     * failing with `DUPLICATE_INVOICE_ID`) was fixed in the installed 5.0.9 by suffixing the Dokan
     * refund id onto the invoice id (`includes/Refund.php:135-141`), so the correct behaviour is
     * assertable today and the pre-fix error string is kept as a negative anchor.
     */
    test('PP-REF-03: a second refund on the same capture succeeds with a distinct refund id (DOK-019 guard)', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId] });
        await assertCaptureReconciles(captured);

        const orderId = captured.targets[0]?.orderId ?? '';
        await ensureRefundApprovable(orderId);

        const total = Number((await wcOrder(orderId)).total ?? 0);
        const slice = Number((total * 0.25).toFixed(2));

        const first = await issueAutomaticRefund(orderId, slice);
        assertNoRefundFailureNote(first.notes, orderId);
        expect(first.row?.status ?? null, `the FIRST partial refund on order ${orderId} must complete before a second one means anything. Row: ${JSON.stringify(first.row ?? null)}`).toBe(REFUND_STATUS.completed);

        const second = await issueAutomaticRefund(orderId, slice);
        assertNoRefundFailureNote(second.notes, orderId);
        expect(
            second.row?.status ?? null,
            `the SECOND refund on the same capture must also complete. This is DOK-019's exact shape: while invoice_id was the bare order id, PayPal rejected every refund after the first with DUPLICATE_INVOICE_ID and a partially refunded order could never be refunded again. Row: ${JSON.stringify(second.row ?? null)}`,
        ).toBe(REFUND_STATUS.completed);

        const { refunds } = await readRefundFromPayPal(captured.paypalOrderId, orderId);
        expect(
            refunds.length,
            `PayPal must hold TWO distinct refunds against the capture for order ${orderId}. Refunds: ${JSON.stringify(refunds ?? null)}`,
        ).toBe(2);

        const ids = refunds.map(entry => String(entry.id ?? ''));
        expect(new Set(ids).size, `the two refunds on order ${orderId} must have distinct PayPal ids: ${JSON.stringify(ids)}`).toBe(2);
        for (const entry of refunds) {
            expect(entry.status ?? null, `every refund on order ${orderId} must be COMPLETED. Refund: ${JSON.stringify(entry ?? null)}`).toBe('COMPLETED');
        }
        expect(
            refunds.reduce((sum, entry) => sum + money(entry.amount), 0),
            `the two partial refunds on order ${orderId} must add up to ${(slice * 2).toFixed(2)}. Refunds: ${JSON.stringify(refunds ?? null)}`,
        ).toBeCloseTo(slice * 2, 2);

        // The fix itself, asserted on PayPal's own copy of the refund where PayPal echoes it back.
        const rows = await refundRows(orderId);
        const invoiceIds = refunds.map(entry => entry.invoice_id).filter((value): value is string => typeof value === 'string' && value !== '');
        if (invoiceIds.length > 0) {
            const expected = rows.map(row => `${orderId}-${row.id}`);
            for (const invoiceId of invoiceIds) {
                expect(
                    expected,
                    `each refund's invoice_id must be "<order id>-<dokan refund id>", never the bare order id — that is the DOK-019 fix at includes/Refund.php:135-141 and the reason PayPal accepts a second refund at all. PayPal echoed "${invoiceId}"; the Dokan refund rows for this order are ${JSON.stringify(rows.map(row => row.id))}.`,
                ).toContain(invoiceId);
            }
        } else {
            log.warn(
                `PP-REF-03: PayPal did not echo invoice_id back on either refund for order ${orderId}, so the invoice-id FORMAT half of this case is uncovered. The behavioural half — a second refund on the same capture succeeding, with no DUPLICATE_INVOICE_ID note — is fully asserted above and is what DOK-019 actually broke.`,
            );
        }

        log.success(`PP-REF-03: two refunds of ${slice} each on order ${orderId}, distinct ids ${JSON.stringify(ids)}, no DUPLICATE_INVOICE_ID.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-04 — multi-vendor isolation                              */
    /* -------------------------------------------------------------- */

    test('PP-REF-04: a multi-vendor partial refund touches only the targeted vendor', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId, vendor2ProductId] });
        await assertCaptureReconciles(captured);

        expect(
            captured.targets.length,
            `a two-vendor cart must be split into one sub order per vendor before it can be refunded per vendor — Dokan refuses to refund a parent that has sub orders (dokan-pro/includes/Refund/Manager.php:112-114). Targets: ${JSON.stringify(captured.targets ?? null)}`,
        ).toBe(2);

        const targeted = captured.targets.find(target => String(target.vendorId) === String(VENDOR_ID)) ?? null;
        const untouched = captured.targets.find(target => String(target.vendorId) === String(VENDOR2_ID)) ?? null;
        expect(targeted, `vendor ${VENDOR_ID} must own one of the sub orders. Targets: ${JSON.stringify(captured.targets ?? null)}`).not.toBeNull();
        expect(untouched, `vendor ${VENDOR2_ID} must own the other sub order. Targets: ${JSON.stringify(captured.targets ?? null)}`).not.toBeNull();

        const targetedId = targeted?.orderId ?? '';
        const untouchedId = untouched?.orderId ?? '';

        await ensureRefundApprovable(targetedId);
        const untouchedLedgerBefore = ledgerFingerprint(await ledgerRows(VENDOR2_ID));
        const targetedTotal = Number((await wcOrder(targetedId)).total ?? 0);
        const partial = Number((targetedTotal * 0.5).toFixed(2));

        const issued = await issueAutomaticRefund(targetedId, partial);
        assertNoRefundFailureNote(issued.notes, targetedId);
        expect(issued.row?.status ?? null, `the refund on sub order ${targetedId} must complete. Row: ${JSON.stringify(issued.row ?? null)}`).toBe(REFUND_STATUS.completed);

        const paypalOrder = await getPayPalOrder(captured.paypalOrderId);
        const targetedRefunds = refundsOf(unitForOrder(paypalOrder, targetedId));
        const untouchedRefunds = refundsOf(unitForOrder(paypalOrder, untouchedId));

        expect(
            money(targetedRefunds[0]?.amount),
            `PayPal must have refunded ${partial} against vendor ${VENDOR_ID}'s own capture for sub order ${targetedId}. Refunds on that unit: ${JSON.stringify(targetedRefunds ?? null)}`,
        ).toBeCloseTo(partial, 2);

        expect(
            untouchedRefunds,
            `vendor ${VENDOR2_ID}'s capture (sub order ${untouchedId}) must be untouched. Each vendor is a separate payee with a separate capture, so a refund reaching the wrong unit takes money from a vendor who was never part of the request — and the customer is refunded twice for goods they still have. Refunds found on the other vendor's unit: ${JSON.stringify(untouchedRefunds ?? null)}`,
        ).toEqual([]);

        expect(
            (await getOrderMetaValue(untouchedId, '_dokan_paypal_refund_id')) ?? null,
            `sub order ${untouchedId} must carry no _dokan_paypal_refund_id — nothing was refunded for that vendor`,
        ).toBeNull();

        expect(
            ledgerFingerprint(await ledgerRows(VENDOR2_ID)),
            `vendor ${VENDOR2_ID}'s ledger must be byte-for-byte unchanged by a refund issued against vendor ${VENDOR_ID}'s sub order. Any new or altered row here means one vendor's refund was charged to another's balance.`,
        ).toBe(untouchedLedgerBefore);

        const untouchedOrder = await wcOrder(untouchedId);
        expect(
            refundedTotal(untouchedOrder),
            `sub order ${untouchedId} must show nothing refunded. Refunds: ${JSON.stringify(untouchedOrder.refunds ?? null)}`,
        ).toBeCloseTo(0, 2);

        log.success(`PP-REF-04: refunded ${partial} on vendor ${VENDOR_ID}'s sub order ${targetedId}; vendor ${VENDOR2_ID}'s sub order ${untouchedId} untouched.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-05 — block checkout, multi-vendor (DOK-018 guard)        */
    /* -------------------------------------------------------------- */

    /**
     * PP-REF-05 is a PASSING regression guard for DOK-018 — a block-checkout multi-vendor refund that
     * could not find its capture id. The fix shipped in 5.0.9: `protect_paid_sub_orders()`
     * (`Order/OrderController.php:83-140`), registered at priority 9 on
     * `woocommerce_store_api_checkout_order_processed` so it removes Lite's splitter before it runs, plus
     * the vendor-keyed fallback written by `OrderManager::store_capture_payment_data()`
     * (`Order/OrderManager.php:595-608`) and applied by `restore_capture_payment_data()` (`:642-...`).
     *
     * The case drives the checkout block's REAL sequence, because both halves of the fix only exist
     * inside it: create-payment splits the Store API draft order, the buyer approves on PayPal, the
     * module's capture-payment route captures onto those sub orders, and only THEN is the order placed
     * through `POST /wc/store/v1/checkout` — the request in which Lite's splitter used to `delete( true )`
     * every sub order and build different ones carrying none of the capture data. The buyer's return
     * redirect is blocked in the browser (see `approveOnPayPalWithoutReturning()`), because letting it
     * through hands the capture to `maybe_process_order_redirect()`, takes the order out of
     * `checkout-draft`, and makes the Store API place a second order — closing the window entirely.
     */
    test('PP-REF-05: a block-checkout multi-vendor refund finds its capture id (DOK-018 guard)', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');
        // The ONE case in this file the card route cannot serve: the checkout BLOCK renders neither
        // the card fields nor the unbranded button, so this case approves in the PayPal SDK popup and
        // needs the sandbox buyer login even when PAYPAL_MARKETPLACE_CAPTURE_ROUTE=card. Without this
        // guard a card-route run would fail here for a missing buyer rather than skip for one.
        test.skip(!HAS_BUYER_LOGIN, BUYER_SKIP);

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId, vendor2ProductId], path: 'store' });

        const placed = captured.storeApi ?? null;
        expect(
            placed,
            `the store path must report the Store API place-order it drove; without it this case never reached the request DOK-018 lived in and everything below would be about an ordinary capture. Captured: ${JSON.stringify({ parent: captured.parentOrderId, subOrders: captured.subOrderIds })}`,
        ).not.toBeNull();

        const before = [...(placed?.subOrderIdsBeforePlaceOrder ?? [])].sort();
        expect(
            before.length,
            `the two-vendor draft order ${captured.parentOrderId} must have held one sub order per vendor at the moment it was captured — the per vendor purchase units are built from them (PaymentMethods/PayPal.php:265-276). Snapshot taken between the capture and the place-order: ${JSON.stringify(before)}`,
        ).toBe(2);

        expect(
            String(placed?.result.order_id ?? ''),
            `POST ${STORE_API_CHECKOUT} must have placed the SAME order the capture belongs to (${captured.parentOrderId}). A different id means WooCommerce refused to reuse the captured draft order (StoreApi/Utilities/DraftOrderTrait::is_valid_draft_order()) and built a fresh one, so the splitter never ran against the captured order and this guard proves nothing. Store API answered: ${JSON.stringify(placed?.result ?? null).slice(0, 400)}`,
        ).toBe(captured.parentOrderId);

        expect(
            placed?.result.payment_result?.payment_status ?? null,
            `the Store API place-order must report payment_status "success" for ${PAYPAL_IDS.gateway}. The module reaches it through PayPal::process_payment(), which sees _paypal_payment_success from the earlier capture and calls payment_complete() (PaymentMethods/PayPal.php:220-221); anything else means the buyer's money is at PayPal and the shop's order was never paid. Store API answered: ${JSON.stringify(placed?.result ?? null).slice(0, 400)}`,
        ).toBe('success');

        /*
         * The DOK-018 mechanism itself. The splitter does not empty the sub orders, it deletes them and
         * creates different ones (dokan-lite/includes/Order/Manager.php:912-918), so only the ID SET can
         * tell survival from replacement — a length check passes just as happily on two brand new sub
         * orders holding no capture id at all.
         */
        const after = (await dbUtils.getChildOrderIds(captured.parentOrderId)).map(String).sort();
        expect(
            after,
            `the sub orders of order ${captured.parentOrderId} must survive the Store API place-order UNCHANGED. protect_paid_sub_orders() (Order/OrderController.php:83-140) runs at priority 9 on woocommerce_store_api_checkout_order_processed and removes Lite's splitter (dokan-lite/includes/Order/Hooks.php:42) for the rest of the request; without it maybe_split_orders() deletes every existing sub order and creates replacements with new ids, which is DOK-018 exactly. Before the place-order: ${JSON.stringify(before)}; after: ${JSON.stringify(after)}.`,
        ).toEqual(before);

        for (const subOrderId of before) {
            expect(
                String((await getOrderMetaValue(subOrderId, '_dokan_paypal_payment_capture_id')) ?? ''),
                `sub order ${subOrderId} must STILL carry the _dokan_paypal_payment_capture_id the capture wrote onto it (it was "${placed?.captureIdBySubOrder[subOrderId] ?? ''}" before the place-order). Refund::process_refund() reads exactly this meta and, when it is gone, writes "Automatic refund is not possible for this order. Reason: No PayPal capture id is found." and refunds nothing (includes/Refund.php:89-99) — the vendor keeps money the customer was promised back.`,
            ).not.toBe('');
        }

        /*
         * The fallback half. It is what makes a sub order that DID get replaced recoverable, so it must
         * exist even on the happy path where nothing needed recovering.
         */
        const vendorIds = [...new Set(Object.values(placed?.vendorBySubOrder ?? {}))].filter(Boolean).sort();
        expect(
            vendorIds.length,
            `each pre-place sub order must name its vendor in _dokan_vendor_id, or the vendor-keyed fallback below cannot be checked against anything. Vendors read from ${JSON.stringify(before)}: ${JSON.stringify(placed?.vendorBySubOrder ?? null)}`,
        ).toBe(2);

        const byVendor = ((await getOrderMetaValue(captured.parentOrderId, '_dokan_paypal_capture_data_by_vendor')) ?? null) as unknown as Record<string, { capture_id?: string }> | null;
        expect(
            Object.keys(byVendor ?? {}).sort(),
            `the parent order ${captured.parentOrderId} must carry _dokan_paypal_capture_data_by_vendor with one entry per vendor. store_capture_payment_data() writes this copy precisely because a sub order id does not survive a re-split but a vendor id does (Order/OrderManager.php:595-608), and restore_capture_payment_data() is the only way a replaced sub order ever gets its capture id back (Order/OrderController.php:51 → OrderManager.php:642). Without it DOK-018 has no safety net at all. Vendors on the sub orders: ${JSON.stringify(vendorIds)}; keys on the parent: ${JSON.stringify(Object.keys(byVendor ?? {}))}.`,
        ).toEqual(vendorIds);

        for (const vendorId of vendorIds) {
            expect(
                String(byVendor?.[vendorId]?.capture_id ?? ''),
                `the vendor-keyed fallback on parent ${captured.parentOrderId} must hold a capture id for vendor ${vendorId}; an entry without one restores nothing onto a replaced sub order. Entry: ${JSON.stringify(byVendor?.[vendorId] ?? null)}`,
            ).not.toBe('');
        }

        await assertCaptureReconciles(captured);

        expect(
            captured.subOrderIds.length,
            `the block-created two-vendor order ${captured.parentOrderId} must still have both sub orders after the capture. Their loss is DOK-018 itself: the sub orders carry the capture id, the fees and the vendor earnings, and without them no automatic refund can ever run. Sub orders found: ${JSON.stringify(captured.subOrderIds ?? null)}`,
        ).toBe(2);

        const target = captured.targets[0];
        const targetId = target?.orderId ?? '';
        await ensureRefundApprovable(targetId);

        const total = Number((await wcOrder(targetId)).total ?? 0);
        const partial = Number((total * 0.5).toFixed(2));

        const issued = await issueAutomaticRefund(targetId, partial);
        assertNoRefundFailureNote(issued.notes, targetId);

        expect(
            issued.row?.status ?? null,
            `the refund on block sub order ${targetId} must complete. A cancelled row here with the DOK-018 note is the regression returning: the vendor keeps money the customer was promised back and no retry can ever succeed. Row: ${JSON.stringify(issued.row ?? null)}`,
        ).toBe(REFUND_STATUS.completed);

        const { refunds } = await readRefundFromPayPal(captured.paypalOrderId, targetId);
        expect(
            money(refunds[0]?.amount),
            `PayPal must have refunded ${partial} against the block order's sub order ${targetId}. Refunds: ${JSON.stringify(refunds ?? null)}`,
        ).toBeCloseTo(partial, 2);
        expect(refunds[0]?.status ?? null, `the block-path refund on ${targetId} must be COMPLETED. Refund: ${JSON.stringify(refunds[0] ?? null)}`).toBe('COMPLETED');

        log.success(
            `PP-REF-05: sub orders ${JSON.stringify(before)} survived the Store API place-order on parent ${captured.parentOrderId} with their capture ids intact, the parent carries the vendor-keyed fallback for ${JSON.stringify(vendorIds)}, and the block multi-vendor refund of ${partial} on sub order ${targetId} succeeded.`,
        );
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-06 — over-refund rejected                                */
    /* -------------------------------------------------------------- */

    /**
     * Driven through the VENDOR's own AJAX transport rather than the mu-plugin route, because that is
     * where the guard being tested lives: `Request::validate()` → `Validator::validate_refund_amount()`
     * (`dokan-pro/includes/Refund/Validator.php:62-78`). The mu-plugin route calls
     * `dokan_pro()->refund->create()` directly and bypasses the validator entirely, so testing there
     * would prove nothing about what a real user can do.
     */
    test('PP-REF-06: a refund larger than the captured amount is rejected before any PayPal call', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId] });
        await assertCaptureReconciles(captured);

        const orderId = captured.targets[0]?.orderId ?? '';
        await ensureRefundApprovable(orderId);

        const total = Number((await wcOrder(orderId)).total ?? 0);
        const ledgerBefore = ledgerFingerprint(await ledgerRows(VENDOR_ID));
        const rowsBefore = await refundRows(orderId);

        const attempt = await vendorRefundRequest(browser, { storageState: vendorAuth, orderId, amount: Number((total + 10).toFixed(2)) });

        expect(
            attempt.success,
            `Dokan must REFUSE a refund of ${(total + 10).toFixed(2)} on an order whose total is ${total}. Validator::validate_refund_amount() caps it at order total minus what is already refunded (dokan-pro/includes/Refund/Validator.php:70-77). Accepting it would hand PayPal a refund larger than the capture — the platform would be paying the difference out of its own account, or PayPal would reject it and leave a dangling cancelled request. Response (HTTP ${attempt.status}): ${attempt.raw.slice(0, 300)}`,
        ).not.toBe(true);

        // Matched on the RAW body, not the parsed message: the error shape varies (a bare string for a
        // message-carrying DokanException, a serialized WP_Error otherwise), and a parser that returned
        // '' would fail a correct rejection.
        expect(
            attempt.raw,
            `the rejection must tell the vendor what the maximum allowed amount is (dokan-pro/includes/Refund/Validator.php:73-76), or they cannot correct the request. Response (HTTP ${attempt.status}): ${attempt.raw.slice(0, 400)}`,
        ).toMatch(/maximum allowed amount/i);

        const rowsAfter = await refundRows(orderId);
        expect(
            rowsAfter.length,
            `no wp_dokan_refund row may be created for a rejected over-refund on order ${orderId}. A row here — even a cancelled one — would block the next legitimate refund request, because Manager::create() refuses while a pending request exists. Before: ${JSON.stringify(rowsBefore)}, after: ${JSON.stringify(rowsAfter)}`,
        ).toBe(rowsBefore.length);

        const { refunds } = await readRefundFromPayPal(captured.paypalOrderId, orderId);
        expect(
            refunds,
            `PayPal must hold NO refund for order ${orderId} after a rejected over-refund. Any refund here means the guard ran after the money had already moved. Refunds: ${JSON.stringify(refunds ?? null)}`,
        ).toEqual([]);

        expect(
            ledgerFingerprint(await ledgerRows(VENDOR_ID)),
            `vendor ${VENDOR_ID}'s ledger must be unchanged by a rejected refund request — no debit, no credit, no row.`,
        ).toBe(ledgerBefore);

        expect(
            refundedTotal(await wcOrder(orderId)),
            `order ${orderId} must still show nothing refunded after the rejection`,
        ).toBeCloseTo(0, 2);

        log.success(`PP-REF-06: an over-refund of ${(total + 10).toFixed(2)} on a ${total} order was rejected with no refund row, no PayPal call and no ledger movement.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-07 — refund of a fully refunded order                    */
    /* -------------------------------------------------------------- */

    test('PP-REF-07: a further refund on an already fully-refunded order is rejected cleanly', { tag: ['@pro', '@vendor', '@admin'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId] });
        await assertCaptureReconciles(captured);

        const orderId = captured.targets[0]?.orderId ?? '';
        await ensureRefundApprovable(orderId);
        const total = Number((await wcOrder(orderId)).total ?? 0);

        const full = await issueAutomaticRefund(orderId);
        assertNoRefundFailureNote(full.notes, orderId);
        expect(
            full.row?.status ?? null,
            `the FULL refund must complete before "already refunded" can be tested at all — otherwise the rejection below would be rejecting for the wrong reason. Row: ${JSON.stringify(full.row ?? null)}`,
        ).toBe(REFUND_STATUS.completed);
        expect(refundedTotal(await wcOrder(orderId)), `order ${orderId} must be fully refunded before the second attempt`).toBeCloseTo(total, 2);

        const rowsBefore = await refundRows(orderId);
        const ledgerBefore = ledgerFingerprint(await ledgerRows(VENDOR_ID));

        const attempt = await vendorRefundRequest(browser, { storageState: vendorAuth, orderId, amount: 1 });

        expect(
            attempt.success,
            `Dokan must refuse any further refund on the fully refunded order ${orderId}. The remaining refundable balance is zero (dokan-pro/includes/Refund/Validator.php:70-77), so accepting one would refund money the customer already has back — taken a second time from the vendor's PayPal account. Response (HTTP ${attempt.status}): ${attempt.raw.slice(0, 300)}`,
        ).not.toBe(true);

        const rowsAfter = await refundRows(orderId);
        expect(
            rowsAfter.length,
            `no additional wp_dokan_refund row may be created for order ${orderId}. Before: ${JSON.stringify(rowsBefore)}, after: ${JSON.stringify(rowsAfter)}`,
        ).toBe(rowsBefore.length);

        const { refunds } = await readRefundFromPayPal(captured.paypalOrderId, orderId);
        expect(
            refunds.length,
            `PayPal must still hold exactly the ONE refund from the full reversal on order ${orderId}. A second one means the customer was paid twice. Refunds: ${JSON.stringify(refunds ?? null)}`,
        ).toBe(1);

        expect(ledgerFingerprint(await ledgerRows(VENDOR_ID)), `vendor ${VENDOR_ID}'s ledger must not move on a rejected second refund`).toBe(ledgerBefore);

        log.success(`PP-REF-07: a second refund on the fully refunded order ${orderId} was rejected; PayPal still holds one refund and the ledger did not move.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-08 — vendor request reaches the admin queue              */
    /* -------------------------------------------------------------- */

    /**
     * ⚠️ Read the failure message before filing anything. This case asserts the CATALOGUED expectation —
     * a vendor-initiated request waits, pending, for admin action — against a module that processes and
     * approves it inside the creation hook (`includes/Refund.php:132-216`, and `:123-130` for a manual
     * request). If the assertion below fails, the deviation is real and consequential (a vendor refunds
     * a customer with no admin gate, and the admin refund queue never shows a PayPal-marketplace request
     * at all) but it may equally be a DELIBERATE design for a gateway where the vendor holds the funds —
     * in which case the catalogue, not the product, is what needs correcting. That determination is the
     * reader's; what this case guarantees is that the behaviour cannot pass unnoticed.
     */
    test('PP-REF-08: a vendor-initiated refund request reaches the admin refund queue for approval', { tag: ['@pro', '@vendor', '@admin'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId] });
        await assertCaptureReconciles(captured);

        const orderId = captured.targets[0]?.orderId ?? '';
        await ensureRefundApprovable(orderId);
        const total = Number((await wcOrder(orderId)).total ?? 0);
        const amount = Number((total * 0.25).toFixed(2));

        const attempt = await vendorRefundRequest(browser, { storageState: vendorAuth, orderId, amount });
        expect(
            attempt.success,
            `vendor ${VENDOR_ID} must be able to submit a refund request for their own order ${orderId} through the dashboard's own transport (wp_ajax_dokan_refund_request, dokan-pro/includes/Refund/Ajax.php:82-105). A vendor who cannot request a refund cannot serve their customer at all. Response (HTTP ${attempt.status}): ${attempt.raw.slice(0, 400)}`,
        ).toBe(true);

        const queue = await adminRefundQueue(orderId);
        expect(
            queue.length,
            `the admin must be able to SEE the vendor's refund request for order ${orderId} in GET /dokan/v1/refunds. A request invisible to the admin cannot be reviewed, approved or rejected by anybody. Queue response for this order: ${JSON.stringify(queue ?? null)}`,
        ).toBeGreaterThan(0);

        const item = queue[0] ?? null;
        expect(Number(item?.vendor?.id ?? 0), `the queued request for order ${orderId} must be attributed to vendor ${VENDOR_ID}. Item: ${JSON.stringify(item ?? null)}`).toBe(Number(VENDOR_ID));
        expect(
            Number(item?.amount ?? 0),
            `the queued request must carry the amount the vendor asked for (${amount}). Item: ${JSON.stringify(item ?? null)}`,
        ).toBeCloseTo(amount, 2);

        expect(
            item?.status ?? null,
            `the vendor's refund request on order ${orderId} must be waiting as PENDING for admin action — that is what "reaches admin approval" means, and it is the only point at which a marketplace operator can stop a refund. It is "${String(item?.status)}" instead. ` +
                `Suspected cause: the module refunds and approves inside the creation hook — Refund::process_refund() is hooked to dokan_refund_request_created (includes/Refund.php:43), calls PayPal and then calls $refund->approve() itself (includes/Refund.php:152-215); a manual-method request is approved outright at includes/Refund.php:123-130. On top of that the gateway is excluded from Dokan's auto-API-refund list (includes/Refund.php:342-345), so RefundController::approve_item() would force it to a manual refund anyway (dokan-pro/includes/REST/RefundController.php:299-311). ` +
                `Consequence if this is unintended: any vendor can refund any of their customers with no admin review, and the admin refund queue never shows a PayPal-marketplace request. If it IS intended for a gateway where the vendor holds the funds, this case's expectation is what needs amending — check before filing. Queue item: ${JSON.stringify(item ?? null)}`,
        ).toBe('pending');

        log.success(`PP-REF-08: the vendor's refund request for order ${orderId} is in the admin queue as ${String(item?.status)}.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-09 — admin approval executes the PayPal refund           */
    /* -------------------------------------------------------------- */

    /**
     * The precondition ("a pending vendor refund request") is checked, not assumed. If the product has
     * already processed the request by the time it exists — see PP-REF-08 — there is no pending request
     * for an admin to approve, and this case SKIPS with the observed status rather than inventing one:
     * writing a `pending` row by hand and approving it would test a state the product never produces.
     * The moment a pending request becomes reachable, this case runs for real without being touched.
     */
    test('PP-REF-09: admin approval of a pending vendor refund executes the PayPal refund', { tag: ['@pro', '@admin', '@vendor'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId] });
        await assertCaptureReconciles(captured);

        const orderId = captured.targets[0]?.orderId ?? '';
        await ensureRefundApprovable(orderId);
        const total = Number((await wcOrder(orderId)).total ?? 0);
        const amount = Number((total * 0.3).toFixed(2));

        const attempt = await vendorRefundRequest(browser, { storageState: vendorAuth, orderId, amount });
        expect(attempt.success, `vendor ${VENDOR_ID} must be able to submit the refund request that this case approves. Response (HTTP ${attempt.status}): ${attempt.raw.slice(0, 400)}`).toBe(true);

        const queued = (await adminRefundQueue(orderId))[0] ?? null;
        expect(queued, `the vendor's request for order ${orderId} must be visible to the admin before it can be approved. Queue: ${JSON.stringify(queued ?? null)}`).not.toBeNull();

        const isPending = String(queued?.status ?? '') === 'pending';
        test.skip(
            !isPending,
            `no PENDING vendor refund request can exist for this gateway, so "admin approval executes the PayPal refund" has no code path to exercise. The request for order ${orderId} came back as "${String(queued?.status)}" the moment it was created: Refund::process_refund() runs on dokan_refund_request_created, calls PayPal and approves the request itself (includes/Refund.php:132-216), and RefundController::approve_item() only accepts a pending request (dokan-pro/includes/REST/RefundController.php:283-293) — which it would then downgrade to a MANUAL refund, because the gateway is on Dokan's auto-API-refund exclusion list (includes/Refund.php:342-345 → RefundController.php:299-311). PP-REF-08 owns this finding; this case skips rather than restate it, and will run for real the day a pending request is reachable.`,
        );

        const refundId = Number(queued?.id ?? 0);
        const action = await adminRefundAction(refundId, 'approve');
        expect(action.status, `the admin approval of refund ${refundId} must succeed. Response: ${action.body}`).toBeLessThan(400);

        const { refunds } = await readRefundFromPayPal(captured.paypalOrderId, orderId);
        expect(
            money(refunds[0]?.amount),
            `approving the vendor's request must actually move money: PayPal must hold a refund of ${amount} against the capture for order ${orderId}. An approval that records a refund in Dokan without one at PayPal leaves the customer unpaid while the shop's books say otherwise. Refunds: ${JSON.stringify(refunds ?? null)}`,
        ).toBeCloseTo(amount, 2);
        expect(refunds[0]?.status ?? null, `the PayPal refund for order ${orderId} must be COMPLETED. Refund: ${JSON.stringify(refunds[0] ?? null)}`).toBe('COMPLETED');

        const netTaken = money(refunds[0]?.seller_payable_breakdown?.net_amount);
        const reversal = (await ledgerRows(VENDOR_ID)).find(row => String(row.trn_id) === String(orderId) && row.trn_type === 'dokan_refund' && Number(row.debit) > 0) ?? null;
        expect(
            Number(reversal?.debit ?? 0),
            `vendor ${VENDOR_ID}'s earning must be reversed by the ${netTaken} PayPal took back. Ledger row: ${JSON.stringify(reversal ?? null)}`,
        ).toBeCloseTo(netTaken, 2);

        log.success(`PP-REF-09: admin approval of refund ${refundId} produced PayPal refund ${String(refunds[0]?.id)} of ${money(refunds[0]?.amount)}.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-10 — admin rejection moves no money                      */
    /* -------------------------------------------------------------- */

    test('PP-REF-10: admin rejection of a pending vendor refund moves no money', { tag: ['@pro', '@admin', '@vendor'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId] });
        await assertCaptureReconciles(captured);

        const orderId = captured.targets[0]?.orderId ?? '';
        await ensureRefundApprovable(orderId);
        const total = Number((await wcOrder(orderId)).total ?? 0);
        const amount = Number((total * 0.2).toFixed(2));

        const attempt = await vendorRefundRequest(browser, { storageState: vendorAuth, orderId, amount });
        expect(attempt.success, `vendor ${VENDOR_ID} must be able to submit the refund request that this case rejects. Response (HTTP ${attempt.status}): ${attempt.raw.slice(0, 400)}`).toBe(true);

        const queued = (await adminRefundQueue(orderId))[0] ?? null;
        expect(queued, `the vendor's request for order ${orderId} must be visible to the admin before it can be rejected. Queue: ${JSON.stringify(queued ?? null)}`).not.toBeNull();

        const isPending = String(queued?.status ?? '') === 'pending';
        test.skip(
            !isPending,
            `no PENDING vendor refund request can exist for this gateway, so an admin REJECTION has nothing to act on — RefundController::cancel_item() accepts a pending request only (dokan-pro/includes/REST/RefundController.php:334-341). The request for order ${orderId} came back as "${String(queued?.status)}" the moment it was created, because Refund::process_refund() refunds and approves inside dokan_refund_request_created (includes/Refund.php:132-216). By then the money has already moved, which is precisely why "rejection moves no money" cannot be demonstrated. PP-REF-08 owns the finding; this case skips rather than restate it.`,
        );

        const ledgerBefore = ledgerFingerprint(await ledgerRows(VENDOR_ID));
        const refundId = Number(queued?.id ?? 0);
        const action = await adminRefundAction(refundId, 'cancel');
        expect(action.status, `the admin rejection of refund ${refundId} must succeed. Response: ${action.body}`).toBeLessThan(400);

        const rows = await refundRows(orderId);
        const rejected = rows.find(row => row.id === refundId) ?? null;
        expect(
            rejected?.status ?? null,
            `the rejected request ${refundId} must be recorded as cancelled (status ${REFUND_STATUS.cancelled}); a rejection that leaves the row pending lets the same request be approved later by accident. Row: ${JSON.stringify(rejected ?? null)}`,
        ).toBe(REFUND_STATUS.cancelled);

        const { refunds } = await readRefundFromPayPal(captured.paypalOrderId, orderId);
        expect(
            refunds,
            `PayPal must hold NO refund for order ${orderId} after the admin rejected the request. Money moved on a rejected refund cannot be recalled — the vendor is out of pocket for a refund the marketplace explicitly refused. Refunds: ${JSON.stringify(refunds ?? null)}`,
        ).toEqual([]);

        expect(ledgerFingerprint(await ledgerRows(VENDOR_ID)), `vendor ${VENDOR_ID}'s ledger must be unchanged by a rejected refund`).toBe(ledgerBefore);
        expect(refundedTotal(await wcOrder(orderId)), `order ${orderId} must show nothing refunded after the rejection`).toBeCloseTo(0, 2);

        log.success(`PP-REF-10: refund request ${refundId} rejected; no PayPal refund, no ledger movement.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-11 — refund on a delayed-disbursement order              */
    /* -------------------------------------------------------------- */

    test('PP-REF-11: a refund on a delayed-disbursement order reverses the payment and releases nothing', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        // DELAYED is a site-wide gateway setting, so it is restored no matter how this case ends —
        // leaving it on would change what every later PayPal spec on this worker measures.
        await ensurePayPalConfigured(undefined, 'DELAYED');
        try {
            const status = await getPayPalStatus();
            expect(
                status.disbursement_mode,
                'the gateway must actually be in DELAYED disbursement before this case means anything; in INSTANT mode the vendor is paid at capture and there is no parked disbursement to reason about',
            ).toBe('DELAYED');

            const captured = await captureOrder(browser, { productIds: [vendor1ProductId] });
            const paypalOrder = await assertCaptureReconciles(captured);

            const orderId = captured.targets[0]?.orderId ?? '';
            const unit = unitForOrder(paypalOrder, orderId);
            expect(
                unit?.payment_instruction?.disbursement_mode ?? null,
                `PayPal's own purchase unit for order ${orderId} must carry disbursement_mode DELAYED (OrderManager::make_purchase_unit_data(), Order/OrderManager.php:207-209). If PayPal was told INSTANT, the vendor already has the money and nothing about this case is a delayed-disbursement test. Unit: ${JSON.stringify(unit?.payment_instruction ?? null)}`,
            ).toBe('DELAYED');

            // The parked state, as the PRODUCT records it.
            const balanceAdded = await getOrderMetaValue(orderId, '_dokan_paypal_payment_withdraw_balance_added');
            const withdrawData = await getOrderMetaValue(orderId, '_dokan_paypal_payment_withdraw_data');
            expect(
                balanceAdded ?? null,
                `order ${orderId} must be marked as NOT yet disbursed. OrderManager::insert_vendor_withdraw_balance() writes _dokan_paypal_payment_withdraw_balance_added = 'no' and parks the payout data when the mode is not INSTANT (Order/OrderManager.php:762-769). Anything else means the funds were released at capture despite DELAYED. Value: ${JSON.stringify(balanceAdded ?? null)}`,
            ).toBe('no');
            expect(
                withdrawData ?? null,
                `order ${orderId} must carry the parked payout data in _dokan_paypal_payment_withdraw_data (Order/OrderManager.php:765) — it is what the delayed sweep would later pay out`,
            ).not.toBeNull();

            await ensureRefundApprovable(orderId);
            const total = Number((await wcOrder(orderId)).total ?? 0);

            const issued = await issueAutomaticRefund(orderId);
            assertNoRefundFailureNote(issued.notes, orderId);
            expect(
                issued.row?.status ?? null,
                `a full refund must succeed on a delayed-disbursement order ${orderId}; the funds are still held at PayPal, so a refund here is the cheapest possible reversal and failing it strands the customer's money. Row: ${JSON.stringify(issued.row ?? null)}`,
            ).toBe(REFUND_STATUS.completed);

            const { refunds } = await readRefundFromPayPal(captured.paypalOrderId, orderId);
            expect(money(refunds[0]?.amount), `PayPal must have refunded the full ${total} on the delayed order ${orderId}. Refunds: ${JSON.stringify(refunds ?? null)}`).toBeCloseTo(total, 2);
            expect(refunds[0]?.status ?? null, `the refund on the delayed order ${orderId} must be COMPLETED. Refund: ${JSON.stringify(refunds[0] ?? null)}`).toBe('COMPLETED');

            // The money must NOT have been released to the vendor on the way past.
            const payoutRows = (await ledgerRows(VENDOR_ID)).filter(row => String(row.trn_id) === String(orderId) && row.trn_type === 'dokan_withdraw');
            expect(
                payoutRows,
                `no dokan_withdraw payout row may exist for the refunded delayed order ${orderId}. Such a row means the parked funds were released to the vendor for an order whose money has gone back to the customer — the marketplace pays that difference. Rows: ${JSON.stringify(payoutRows ?? null)}`,
            ).toEqual([]);

            /*
             * "The parked disbursement is reduced or cancelled rather than later releasing money for a
             * refunded order" is checked against the product's OWN selection criteria for the sweep,
             * because the sweep runs on a daily cron this test cannot fire: `disburse_delayed_payment()`
             * queries orders in `wc-processing` / `wc-completed` carrying the delayed marker
             * (Order/OrderController.php:393-404) and `DelayDisburseFund::task()` re-checks the gateway,
             * the `_dokan_paypal_payment_withdraw_balance_added` meta and the status before paying
             * (BackgroundProcess/DelayDisburseFund.php:83-113). If a fully refunded order still satisfies
             * all of that, the next sweep releases the parked funds for an order whose money has already
             * gone back to the customer — and `_disburse_payment()` (Order/OrderManager.php:887-924)
             * makes a referenced payout for the WHOLE capture with no refund check of its own.
             */
            const statusAfter = await getOrderStatus(orderId);
            const stillParked = await getOrderMetaValue(orderId, '_dokan_paypal_payment_withdraw_balance_added');
            const stillSweepable = ['processing', 'completed'].includes(statusAfter) && stillParked !== 'yes';

            expect(
                stillSweepable,
                `after a FULL refund, order ${orderId} must no longer be selectable by the delayed-disbursement sweep. It is: status "${statusAfter}" and _dokan_paypal_payment_withdraw_balance_added "${String(stillParked)}" together satisfy every condition the sweep checks (Order/OrderController.php:393-404 and BackgroundProcess/DelayDisburseFund.php:83-113), so the next daily run would ask PayPal to release the parked funds to the vendor for an order the customer has already been refunded — money the marketplace cannot recover. Nothing in OrderManager::_disburse_payment() (Order/OrderManager.php:887-924) checks for a refund either.`,
            ).toBe(false);

            log.warn(
                `PP-REF-11: DECLARED GAP — only the FULL-refund branch is covered. A PARTIAL refund leaves a delayed order in a paid status with the parked marker still "no", and the sweep pays out a referenced payout for the WHOLE capture regardless of how much was refunded (OrderManager::_disburse_payment(), Order/OrderManager.php:887-897, sends no amount). Exercising that needs the daily cron, which is PP-DIS territory, not this file's.`,
            );
            log.success(`PP-REF-11: delayed-disbursement order ${orderId} fully refunded (${total}); no payout row, and the order is out of the sweep (status "${statusAfter}").`);
        } finally {
            await ensurePayPalConfigured(undefined, (originalDisbursementMode as 'INSTANT' | 'ON_ORDER_COMPLETE' | 'DELAYED' | null) ?? 'INSTANT');
        }
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-12 — shipping and tax refundable from the vendor's share */
    /* -------------------------------------------------------------- */

    test('PP-REF-12: shipping and tax are refundable, with the seller as their recipient', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId] });
        await assertCaptureReconciles(captured);

        const orderId = captured.targets[0]?.orderId ?? '';
        const target = captured.targets[0];

        // The gateway forces both recipients to the seller precisely so these components can be refunded
        // from the vendor's own share (PaymentMethods/PayPal.php:337-338).
        const shippingRecipient = await getOrderMetaValue(captured.parentOrderId, 'shipping_fee_recipient');
        const taxRecipient = await getOrderMetaValue(captured.parentOrderId, 'tax_fee_recipient');
        expect(
            shippingRecipient ?? null,
            `order ${captured.parentOrderId} must record the seller as the shipping-fee recipient — PayPal::process_payment() writes it at PaymentMethods/PayPal.php:337. If shipping went to the admin instead, refunding it from the vendor's capture takes money the vendor never received. Value: ${JSON.stringify(shippingRecipient ?? null)}`,
        ).toBe('seller');
        expect(
            taxRecipient ?? null,
            `order ${captured.parentOrderId} must record the seller as the tax recipient (PaymentMethods/PayPal.php:338). Value: ${JSON.stringify(taxRecipient ?? null)}`,
        ).toBe('seller');

        const order = await wcOrder(orderId);
        const shipping = Number(order.shipping_total ?? 0);
        const shippingTax = Number(order.shipping_tax ?? 0);
        const cartTax = Number(order.cart_tax ?? 0);
        const component = Number((shipping + shippingTax + cartTax).toFixed(2));

        test.skip(
            component <= 0,
            `this order carries neither shipping nor tax (shipping ${shipping}, shipping tax ${shippingTax}, cart tax ${cartTax}), so there is no shipping-and-tax component to refund and a "both are refundable" result would be vacuous. The suite site is configured with 5% tax based on the shipping address and tax applied to shipping, so a zero here means the customer address, the tax rate or the shipping zone changed — fix the fixture rather than this assertion.`,
        );

        await ensureRefundApprovable(orderId);
        const issued = await issueAutomaticRefund(orderId, component);
        assertNoRefundFailureNote(issued.notes, orderId);
        expect(
            issued.row?.status ?? null,
            `refunding the shipping and tax component (${component}) of order ${orderId} must succeed. Row: ${JSON.stringify(issued.row ?? null)}`,
        ).toBe(REFUND_STATUS.completed);

        const { unit, refunds } = await readRefundFromPayPal(captured.paypalOrderId, orderId);
        expect(
            money(refunds[0]?.amount),
            `PayPal must have refunded exactly the shipping + tax component (${component}) of order ${orderId}. Refunds: ${JSON.stringify(refunds ?? null)}`,
        ).toBeCloseTo(component, 2);
        expect(
            unit?.payee?.merchant_id ?? null,
            `the refunded shipping and tax must come out of vendor ${String(target?.vendorId)}'s OWN capture — that is the whole reason the gateway forces the seller as recipient for both. Payee on the refunded unit: ${JSON.stringify(unit?.payee ?? null)}`,
        ).toBe(target?.merchantId);

        const remaining = Number((await wcOrder(orderId)).total ?? 0) - refundedTotal(await wcOrder(orderId));
        log.success(`PP-REF-12: refunded shipping ${shipping} + shipping tax ${shippingTax} + cart tax ${cartTax} = ${component} from vendor ${String(target?.vendorId)}'s capture on order ${orderId}; ${remaining.toFixed(2)} still refundable.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-13 — gateway fee is read, never assumed                  */
    /* -------------------------------------------------------------- */

    test('PP-REF-13: the gateway processing fee on a refund is read from meta and still reconciles', { tag: ['@pro', '@admin', '@customer'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId] });
        const paypalOrder = await assertCaptureReconciles(captured);

        const orderId = captured.targets[0]?.orderId ?? '';
        const capture = capturesOf(unitForOrder(paypalOrder, orderId))[0] ?? null;
        const paypalFeeAtCapture = money(capture?.seller_receivable_breakdown?.paypal_fee);

        const storedFee = Number((await getOrderMetaValue(orderId, '_dokan_paypal_payment_processing_fee')) ?? NaN);
        expect(
            storedFee,
            `order ${orderId} must record the gateway processing fee PayPal actually charged. The module stores it from the capture's seller_receivable_breakdown.paypal_fee (Order/OrderManager.php:518-520, :550) and everything downstream — the vendor's payout, the refund reversal, the admin's reports — is computed from that number, never from a constant. PayPal charged ${paypalFeeAtCapture}; the order says ${storedFee}.`,
        ).toBeCloseTo(paypalFeeAtCapture, 2);
        expect(paypalFeeAtCapture, `PayPal must have charged a non-zero processing fee on order ${orderId}, or this case has no fee to reconcile. Capture: ${JSON.stringify(capture?.seller_receivable_breakdown ?? null)}`).toBeGreaterThan(0);

        await ensureRefundApprovable(orderId);
        const total = Number((await wcOrder(orderId)).total ?? 0);
        const partial = Number((total * 0.5).toFixed(2));

        const issued = await issueAutomaticRefund(orderId, partial);
        assertNoRefundFailureNote(issued.notes, orderId);
        expect(issued.row?.status ?? null, `the partial refund on order ${orderId} must complete before its fee handling can be read. Row: ${JSON.stringify(issued.row ?? null)}`).toBe(REFUND_STATUS.completed);

        const { refunds } = await readRefundFromPayPal(captured.paypalOrderId, orderId);
        const reversedFee = money(refunds[0]?.seller_payable_breakdown?.paypal_fee);
        const refundedGross = money(refunds[0]?.seller_payable_breakdown?.gross_amount);
        const refundedNet = money(refunds[0]?.seller_payable_breakdown?.net_amount);
        const reversedPlatform = (refunds[0]?.seller_payable_breakdown?.platform_fees ?? []).reduce((sum, entry) => sum + money(entry.amount), 0);

        expect(
            refundedNet + reversedFee + reversedPlatform,
            `PayPal's own refund breakdown for order ${orderId} must reconcile the same way the capture did: gross refunded (${refundedGross}) == net taken from the vendor (${refundedNet}) + returned PayPal fee (${reversedFee}) + returned platform fee (${reversedPlatform}). If it does not, the refund moved an amount nobody's books account for. Breakdown: ${JSON.stringify(refunds[0]?.seller_payable_breakdown ?? null)}`,
        ).toBeCloseTo(refundedGross, 2);

        const feeAfter = Number((await getOrderMetaValue(orderId, 'dokan_gateway_fee')) ?? NaN);
        expect(
            feeAfter,
            `after the refund, dokan_gateway_fee on order ${orderId} must be the stored processing fee (${storedFee}) minus the fee PayPal actually returned (${reversedFee}) — Refund::update_gateway_fee() computes exactly that from the order's own meta and the refund's own breakdown (includes/Refund.php:242-247), which is why nothing here may hardcode a fee. It reads ${feeAfter}. A stale value overstates or understates what the vendor is charged for this sale.`,
        ).toBeCloseTo(storedFee - reversedFee, 2);

        log.success(`PP-REF-13: processing fee ${storedFee} (PayPal ${paypalFeeAtCapture}) minus reversed ${reversedFee} = dokan_gateway_fee ${feeAfter} on order ${orderId}.`);
    });

    /* -------------------------------------------------------------- */
    /* PP-REF-14 — the vendor-side reversal ledger                     */
    /* -------------------------------------------------------------- */

    test('PP-REF-14: a completed refund is recorded in the vendor ledger with the correct sign and amount', { tag: ['@pro', '@vendor', '@admin'] }, async ({ browser }) => {
        const gate = await moneyGate();
        test.skip(gate !== null, gate ?? '');

        const captured = await captureOrder(browser, { productIds: [vendor1ProductId] });
        await assertCaptureReconciles(captured);

        const orderId = captured.targets[0]?.orderId ?? '';
        const vendorId = captured.targets[0]?.vendorId ?? '';
        await ensureRefundApprovable(orderId);

        const before = await ledgerRows(vendorId);
        const beforeIds = new Set(before.map(row => row.id));

        const issued = await issueAutomaticRefund(orderId);
        assertNoRefundFailureNote(issued.notes, orderId);
        expect(issued.row?.status ?? null, `the refund on order ${orderId} must complete before its ledger entries can be read. Row: ${JSON.stringify(issued.row ?? null)}`).toBe(REFUND_STATUS.completed);

        const { refunds } = await readRefundFromPayPal(captured.paypalOrderId, orderId);
        const netTaken = money(refunds[0]?.seller_payable_breakdown?.net_amount);
        expect(netTaken, `PayPal must report what it took back from vendor ${vendorId} on order ${orderId}. Breakdown: ${JSON.stringify(refunds[0]?.seller_payable_breakdown ?? null)}`).toBeGreaterThan(0);

        const added = (await ledgerRows(vendorId)).filter(row => !beforeIds.has(row.id));
        const forThisOrder = added.filter(row => String(row.trn_id) === String(orderId));

        expect(
            forThisOrder.length,
            `the refund must be written into vendor ${vendorId}'s ledger against order ${orderId}. A refund that moves money at PayPal and leaves no ledger trace makes the vendor's balance permanently wrong. New rows for this vendor: ${JSON.stringify(added ?? null)}`,
        ).toBeGreaterThan(0);

        for (const row of forThisOrder) {
            expect(
                row.trn_type,
                `every ledger row this refund creates must be typed 'dokan_refund'; the type is what the vendor's balance query and every report group on. Row: ${JSON.stringify(row)}`,
            ).toBe('dokan_refund');
        }

        const reversal = forThisOrder.find(row => Number(row.debit) > 0 && Number(row.credit) === 0) ?? null;
        expect(
            reversal,
            `the module's reversal entry must be a DEBIT with no credit — it reverses a payout the vendor already received directly from PayPal (includes/Refund.php:287-311 inserts debit = the net refund, credit = 0). A row with the sign the other way round moves the vendor's balance in exactly the wrong direction. Rows created for this order: ${JSON.stringify(forThisOrder)}`,
        ).not.toBeNull();

        expect(
            Number(reversal?.debit ?? 0),
            `the reversal must be for the ${netTaken} PayPal actually took back from vendor ${vendorId}, not for the gross refund or for a rounded figure. Ledger row: ${JSON.stringify(reversal ?? null)}, PayPal breakdown: ${JSON.stringify(refunds[0]?.seller_payable_breakdown ?? null)}`,
        ).toBeCloseTo(netTaken, 2);

        // The reverse-withdrawal ledger is a different book, and only used when the admin's commission
        // was charged to the vendor rather than taken as a PayPal platform fee. Reported, never failed.
        const reverseRows = await reverseWithdrawalRows(orderId);
        if (reverseRows.length > 0) {
            log.info(`PP-REF-14: order ${orderId} also produced reverse-withdrawal rows (dokan-pro/includes/ReverseWithdrawal.php:155-163): ${JSON.stringify(reverseRows)}`);
        } else {
            log.info(
                `PP-REF-14: no reverse-withdrawal row for order ${orderId}, which is expected — this gateway takes the admin commission as a PayPal platform fee on the capture, so ReverseWithdrawal::after_refund_request_approved() returns early at dokan-pro/includes/ReverseWithdrawal.php:123-125.`,
            );
        }

        log.info(`PP-REF-14: full ledger movement for order ${orderId}: ${JSON.stringify(forThisOrder)}`);
        log.success(`PP-REF-14: vendor ${vendorId} debited ${Number(reversal?.debit ?? 0)} for the refund on order ${orderId}, matching PayPal's net ${netTaken}.`);
    });
});
