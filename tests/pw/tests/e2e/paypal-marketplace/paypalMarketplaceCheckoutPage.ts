import { CHECKOUT_AJAX, HAS_BUYER_LOGIN, PERSISTENT_CART_META } from './paypalMarketplaceShared';
import { test, expect, request } from '@utils/test';
import type { APIRequestContext, Browser, Page } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { PayPalMarketplacePage, PAYPAL_IDS, CREATE_PAYMENT_ROUTE, withCustomer, waitForCheckoutSettled, stockCartWithProof, submitClassicCheckout, createBlockPayment, PAYPAL_HOSTED_UI, driveHostedApproval, paypalDiagnostics, firstVisible, selectClassicPayPal as selectClassicPayPalShared } from './paypalMarketplacePage';
import type { ClassicCheckoutResult as SharedClassicCheckoutResult, ApprovalOutcome } from './paypalMarketplacePage';
import { customerAuth, VENDOR_ID, VENDOR2_ID, CUSTOMER_ID, PAYPAL_MERCHANTS, hasCredentials, HAS_REAL_MERCHANTS, ensurePayPalConfigured, getPayPalStatus, seedPayPalConnectedVendor, clearPayPalVendor, getBothMerchantConsents, getMerchantConsent, isPayableMerchant, ensureCustomerAddress, ensureVendorStoreAddress, ensureClassicCheckoutPage, getOrderNotes, readGatewaySettings, mergeGatewaySettings, readPayPalOrder } from './helpers';

/* Selectors live on the page object (SKILL non-negotiable #1: selectors belong in
 * `<slug>Page.ts`). These aliases keep the existing in-file names readable. */
export const CLASSIC = PayPalMarketplacePage.classic;

/**
 * PayPal Marketplace — checkout and CAPTURE (PP-CHK-01 … PP-CHK-15).
 *
 * This is the money path. Everything else in this suite stops at the point where PayPal would be
 * asked for money; the cases here go through it, so the rules they are written under are different
 * from the rest of the suite:
 *
 *  1. **Nothing is ever faked.** No route in `mu-plugins/dokan-paypal-marketplace-test-helpers.php`
 *     writes capture meta, and no assertion below reads back a value this file wrote. Every capture
 *     id, fee and vendor credit asserted on was produced by the product in response to a real PayPal
 *     sandbox capture. Where a capture cannot be reached, the case SKIPS with the missing thing named,
 *     or FAILS — it never passes.
 *  2. **Buyer approval happens on paypal.com, for real.** `approveOnPayPal()` drives the
 *     PayPal-hosted approval window with `PAYPAL_MARKETPLACE_BUYER_EMAIL` /
 *     `PAYPAL_MARKETPLACE_BUYER_PASSWORD`. The PayPal-hosted partner-consent flow was driven
 *     successfully with Playwright against this same site on 2026-07-31 (no captcha, ordinary DOM),
 *     which is why this is attempted rather than assumed impossible. If PayPal answers with a captcha
 *     or a one-time-code challenge, the case skips naming that specific obstacle; anything else fails
 *     loudly with the URL, the title and the visible text, because a selector that stopped matching is
 *     a test defect and must not be laundered into a skip.
 *  3. **Money is asserted, not status.** An order reaching `processing` says nothing about who was
 *     paid. The oracle is
 *
 *         sub order total  ==  vendor credit + PayPal processing fee + admin platform fee
 *         parent total     ==  SUM(sub order totals)
 *         purchase unit N's payee.merchant_id  ==  vendor N's own merchant id
 *
 *     The left-hand sides come from WooCommerce; the right-hand sides come from PayPal (the module
 *     copies `seller_receivable_breakdown` onto the order at capture time, and the balance credit is
 *     `net_amount`). So the identity is a cross-check between two systems rather than an arithmetic
 *     restatement of one of them. The purchase units are never persisted WordPress-side, so PayPal's
 *     own copy of the order — `GET /v2/checkout/orders/{id}` — is the only record of what was really
 *     requested and captured, and it is read back for every case that creates one.
 *
 * **The capture path being exercised.** `button_type` is set to `standard` for every capturing case,
 * which is the module's redirect flow and the only one a browser can drive end to end without the
 * PayPal SDK's cross-origin button iframe:
 *
 *     classic checkout → #place_order → WC_Checkout::process_checkout()
 *       → PayPal::process_payment() (PaymentMethods/PayPal.php:201-352, intent hardcoded CAPTURE at :287)
 *       → browser redirected to the approve link (links[1].href, :332)
 *       → buyer approves on paypal.com
 *       → PayPal redirects to application_context.return_url (:290-296), the order-received page
 *         carrying button_type / wc_payment_method / PayerID
 *       → OrderController::maybe_process_order_redirect() (Order/OrderController.php:489-531)
 *       → handle_capture_payment_validation() → Processor::capture_payment()
 *       → OrderManager::handle_order_complete_status() (Order/OrderManager.php:465-497)
 *
 * That is the product's own capture entry point, with no step replaced. `smart` is the shipped
 * default and is covered as a rendering claim by PP-CHK-03; the SDK's own popup is not driven, and
 * PP-CHK-03 says so rather than implying the smart path is captured here.
 *
 * **One declared gap, so it is not silent.**
 *
 *  - **The block checkout's CAPTURE is not covered here.** Both create-payment transports are
 *    exercised (PP-CHK-05 drives the classic form POST and the block `wp.apiFetch` route, and asserts
 *    each records its PayPal order id and names the right payee), but the block path completes its
 *    payment from `capturePayment()` inside `PayPalPayment.tsx:96-105`, which runs only after PayPal
 *    approves inside the SDK's cross-origin button iframe. There is no redirect equivalent on that
 *    path, so a real block capture cannot be driven without automating that iframe. Everything the
 *    capture then writes is shared code — `handle_capture_payment_validation()` and
 *    `OrderManager::handle_order_complete_status()` are one implementation serving both paths — so
 *    what is unproven is specifically the block path's own approval-to-capture hand-off, not the
 *    money handling behind it.
 *
 * **Real captures cost real sandbox transactions.** Five are performed by a full run of this file
 * (PP-CHK-06/-09/-11/-14/-15); PP-CHK-07/-10/-12 reuse the first one through a memoised fixture, so
 * ordering between them is irrelevant and each still works when run alone. `retries` is pinned to 0
 * for the whole file on purpose: a retried capturing test would take the buyer's money a second time.
 *
 * Never `test.describe.serial` and never tagged `@serial` — `playwright.config.ts:13` grepInverts
 * `@serial` in BOTH lanes, and `.serial` aborts a whole group on first failure, which silently erased
 * 46 of 68 cases on 2026-07-31 while the run still summarised as green.
 */

/* ------------------------------------------------------------------ */
/* Selectors, URLs and stored state                                    */
/* ------------------------------------------------------------------ */

/** Classic `[woocommerce_checkout]` shortcode page — `ensureClassicCheckoutPage()` creates it. */

/** WooCommerce order-received (thank-you) page markers, block and shortcode alike. */
export const THANK_YOU_ERRORS = '.woocommerce-error, .wc-block-components-notice-banner.is-error';


export const DB_PREFIX = process.env.DB_PREFIX ?? 'wp';

export const VENDOR_BALANCE_TABLE = `${DB_PREFIX}_dokan_vendor_balance`;

export const VENDOR_WITHDRAW_TABLE = `${DB_PREFIX}_dokan_withdraw`;

export const DOKAN_ORDERS_TABLE = `${DB_PREFIX}_dokan_orders`;

/** The site under test, used to tell our own return navigation apart from PayPal's own hops. */
export const SITE_HOST = new URL(process.env.BASE_URL || 'http://localhost:9999').host;

/* ------------------------------------------------------------------ */
/* Credential gates                                                    */
/* ------------------------------------------------------------------ */


export const CREDENTIALS_SKIP =
    'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / ' +
    'TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE), so Helper::is_ready() is false and the gateway is never offered at checkout. ' +
    'Every availability answer here would then be "absent" for a reason that has nothing to do with the checkout path, and ' +
    'no PayPal order could be created at all. PP-PRE-01 reports the absence.';

export const MERCHANT_SKIP =
    'no usable connected merchant ids are configured (PAYPAL_MARKETPLACE_VENDOR1_MERCHANT_ID / ' +
    'PAYPAL_MARKETPLACE_VENDOR2_MERCHANT_ID), so OrderManager::make_purchase_unit_data() cannot name a payee and PayPal ' +
    'rejects the create-order call. PP-PRE-02 reports this as a documented gap.';

export const BUYER_SKIP =
    'no PayPal sandbox BUYER login is configured (PAYPAL_MARKETPLACE_BUYER_EMAIL / PAYPAL_MARKETPLACE_BUYER_PASSWORD in ' +
    'tests/pw/.env). Approval happens on PayPal\'s own domain and no PayPal API can grant it on a buyer\'s behalf, so ' +
    'without those two values NO capture can be performed and this case would only be able to prove the pre-capture state — ' +
    'which PP-BLK-03 and PP-CHK-05 already prove. Supply a sandbox Personal account from ' +
    'developer.paypal.com -> Testing Tools -> Sandbox Accounts.';

/* ------------------------------------------------------------------ */
/* Admin-authenticated REST                                            */
/* ------------------------------------------------------------------ */

/**
 * ponytail: one wrapper instead of a newContext/try/finally block per call. Auth is HTTP Basic via
 * `payloads.adminAuth`, set EXPLICITLY — `request.newContext()` with no `extraHTTPHeaders` inherits
 * the shared config's admin Basic auth, which is fine here and catastrophic for the PayPal calls
 * below, where it would ship WordPress admin credentials to paypal.com.
 */
export async function adminRequest<T>(body: (ctx: APIRequestContext) => Promise<T>): Promise<T> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        return await body(ctx);
    } finally {
        await ctx.dispose();
    }
}

export interface WooOrder {
    id?: number;
    status?: string;
    total?: string;
    currency?: string;
    parent_id?: number;
    payment_method?: string;
    date_paid?: string | null;
    transaction_id?: string;
    meta_data?: Array<{ key?: string; value?: unknown }>;
}

/** WooCommerce's own inventory answer for a product, as PP-CHK-14 reads it back after a capture. */
export interface ProductStock {
    stock_quantity?: number | null;
    stock_status?: string;
}

/**
 * One round trip for everything a money assertion needs off a WooCommerce order.
 *
 * An unreadable order THROWS with the HTTP status rather than answering `{}`. Every caller here reads an
 * order the case has just created, and an empty object is indistinguishable from a real product result:
 * `metaString()` returns null for a missing meta AND for an order that could not be fetched, so a
 * swallowed 404 would let assertions like PP-CHK-13's `_dokan_paypal_order_id` must-be-null pass on an
 * order nobody ever read.
 */
export async function readWooOrder(orderId: string | number): Promise<WooOrder> {
    return adminRequest(async ctx => {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}`);
        const text = await res.text();
        if (!res.ok()) {
            throw new Error(
                `WooCommerce order #${orderId} could not be read back over the REST API (HTTP ${res.status()}), so nothing can be asserted about it — an order that cannot be fetched is not the same as an order without PayPal meta. First 300 chars of the response: ${text.slice(0, 300) || '(empty body)'}`,
            );
        }
        try {
            return JSON.parse(text) as WooOrder;
        } catch {
            throw new Error(`WooCommerce answered HTTP ${res.status()} for order #${orderId} with a non-JSON body, so the order state is unknown. First 300 chars: ${text.slice(0, 300) || '(empty body)'}`);
        }
    });
}

/** Meta as a plain map, so array/object values (`_dokan_paypal_capture_data_by_vendor`) survive. */
export function metaMap(order: WooOrder): Record<string, unknown> {
    const map: Record<string, unknown> = {};
    for (const entry of order.meta_data ?? []) {
        if (typeof entry?.key === 'string') {
            map[entry.key] = entry.value;
        }
    }
    return map;
}

export function metaString(order: WooOrder, key: string): string | null {
    const value = metaMap(order)[key];
    return value === undefined || value === null || value === '' ? null : String(value);
}

/** WooCommerce order ids belonging to the suite customer, used by the duplicate-order claims. */
export async function customerOrderIds(): Promise<string[]> {
    return adminRequest(async ctx => {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?customer=${CUSTOMER_ID}&per_page=100&status=any&_fields=id`);
        const body = (await res.json().catch(() => [])) as Array<{ id?: number }>;
        return Array.isArray(body) ? body.map(order => String(order?.id ?? '')).filter(Boolean) : [];
    });
}

/* ------------------------------------------------------------------ */
/* Gateway settings                                                    */
/* ------------------------------------------------------------------ */

/**
 * Put the gateway on the redirect ("standard") button and PROVE the write landed.
 *
 * Every capturing case depends on this: with `smart`, `CartHandler::payment_scripts()` enqueues the
 * SDK and `paypal-checkout.js:37-44` animates `#place_order` to `display:none`, so the click that
 * starts the whole flow has nothing to click. A silently failed write here would therefore surface as
 * "place order button never became visible", pointing at the wrong file.
 */
export async function useStandardButton(): Promise<void> {
    await mergeGatewaySettings({ button_type: 'standard' });
    const status = await getPayPalStatus();
    expect(
        status.button_type,
        'precondition: button_type must read "standard" before a capturing case runs. With "smart" the module hides #place_order (paypal-checkout.js:37-44) and the payment can only be started from inside the PayPal SDK\'s cross-origin button iframe, which this file deliberately does not drive',
    ).toBe('standard');
}

/** The suite baseline the rest of the files expect. */
export async function useSmartButton(): Promise<void> {
    await mergeGatewaySettings({ button_type: 'smart' });
    const status = await getPayPalStatus();
    expect(status.button_type, 'precondition: button_type must read "smart" — it is the shipped default and the value every other spec in this suite assumes').toBe('smart');
}

/** The admin-editable gateway title, needed by the thank-you page claim; the XSS cases rewrite it. */
export async function gatewayTitle(): Promise<string> {
    const settings = await readGatewaySettings();
    const title = settings['title'];
    return title && title.trim() ? title : 'PayPal Marketplace';
}

/* ------------------------------------------------------------------ */
/* PayPal's own copy of the order                                      */
/* ------------------------------------------------------------------ */

export interface PayPalAmount {
    currency_code?: string;
    value?: string;
}

export interface PayPalCapture {
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

export interface PayPalPurchaseUnit {
    reference_id?: string;
    invoice_id?: string;
    custom_id?: string;
    amount?: PayPalAmount & { breakdown?: Record<string, PayPalAmount | undefined> };
    payee?: { merchant_id?: string; email_address?: string };
    payment_instruction?: { disbursement_mode?: string; platform_fees?: Array<{ amount?: PayPalAmount }> };
    payments?: { captures?: PayPalCapture[] };
}

export interface PayPalOrder {
    id?: string;
    status?: string;
    intent?: string;
    purchase_units?: PayPalPurchaseUnit[];
}

/**
 * This file's own reader, annotated with its own `PayPalOrder` shape and carrying its own two
 * failure messages. `Authorization` is set EXPLICITLY inside the shared reader for both round trips:
 * `request.newContext()` with no `extraHTTPHeaders` INHERITS the shared config's WordPress admin
 * Basic auth, which would ship admin credentials to paypal.com.
 */
export async function getPayPalOrder(paypalOrderId: string): Promise<PayPalOrder> {
    return readPayPalOrder<PayPalOrder>(paypalOrderId, {
        tokenFailure: (status: number) =>
            `PayPal refused a client-credentials token (HTTP ${status}). Without one, nothing in this file can read back what was really requested or captured, so no money claim can be verified. Check TEST_CLIENT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE.`,
        orderFailure: ({ paypalOrderId: id, status, message }) =>
            `PayPal would not return order ${id} (HTTP ${status}): ${message}. The purchase units are never persisted WordPress-side, so without PayPal's copy there is no record of what the shopper was actually asked to pay or of who was named as payee.`,
    });
}

/** Every capture PayPal holds against an order, flattened with the unit it belongs to. */
export function capturesOf(order: PayPalOrder): Array<{ unitIndex: number; customId: string; merchantId: string; capture: PayPalCapture }> {
    const rows: Array<{ unitIndex: number; customId: string; merchantId: string; capture: PayPalCapture }> = [];
    (order.purchase_units ?? []).forEach((unit, unitIndex) => {
        for (const capture of unit.payments?.captures ?? []) {
            rows.push({
                unitIndex,
                customId: String(unit.custom_id ?? ''),
                merchantId: String(unit.payee?.merchant_id ?? ''),
                capture,
            });
        }
    });
    return rows;
}

/* ------------------------------------------------------------------ */
/* Money arithmetic                                                    */
/* ------------------------------------------------------------------ */

export function money(value: unknown): number {
    const parsed = Number(value ?? NaN);
    return Number.isFinite(parsed) ? parsed : NaN;
}

/**
 * One cent of slack, and no more.
 *
 * PayPal and WooCommerce both round to the currency's decimals independently, so an exact string
 * comparison would fail on a correct product for a half-cent split. Anything larger than a cent is a
 * real discrepancy: it is money that reached neither the vendor, the marketplace nor PayPal.
 */
export function balances(left: number, right: number): boolean {
    return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) <= 0.01;
}

/* ------------------------------------------------------------------ */
/* Dokan ledger rows                                                   */
/* ------------------------------------------------------------------ */

export interface BalanceRow {
    id: number;
    vendor_id: number;
    trn_id: number;
    trn_type: string;
    credit: string;
    debit: string;
}

/**
 * The vendor-balance credits written by `OrderManager::insert_vendor_withdraw_balance()`
 * (Order/OrderManager.php:751-850) for the given orders. `credit` is PayPal's own
 * `seller_receivable_breakdown.net_amount`, which is what makes the identity below a cross-check
 * rather than an arithmetic restatement of WooCommerce's own totals.
 */
export async function vendorBalanceRows(orderIds: string[]): Promise<BalanceRow[]> {
    if (orderIds.length === 0) {
        return [];
    }
    const placeholders = orderIds.map(() => '?').join(', ');
    return (await dbUtils.dbQuery(
        `SELECT id, vendor_id, trn_id, trn_type, credit, debit FROM \`${VENDOR_BALANCE_TABLE}\` WHERE trn_id IN (${placeholders}) AND trn_type = 'dokan_withdraw';`,
        orderIds,
    )) as BalanceRow[];
}

export interface DokanOrderRow {
    order_id: number;
    seller_id: number;
    order_total: string;
    net_amount: string;
    order_status: string;
}

export async function dokanOrderRows(orderIds: string[]): Promise<DokanOrderRow[]> {
    if (orderIds.length === 0) {
        return [];
    }
    const placeholders = orderIds.map(() => '?').join(', ');
    return (await dbUtils.dbQuery(
        `SELECT order_id, seller_id, order_total, net_amount, order_status FROM \`${DOKAN_ORDERS_TABLE}\` WHERE order_id IN (${placeholders});`,
        orderIds,
    )) as DokanOrderRow[];
}

/* ------------------------------------------------------------------ */
/* Customer-side driving                                               */
/* ------------------------------------------------------------------ */

/**
 * Put exactly `productIds` in the customer's cart, and PROVE it landed there.
 *
 * The proof is taken from the database rather than the page: WooCommerce writes
 * `_woocommerce_persistent_cart_1` from the `woocommerce_add_to_cart` action, which fires only on a
 * SUCCESSFUL add. Without that check, an add-to-cart that quietly failed would leave an empty cart —
 * and an empty cart offers no payment methods at all, so every "gateway not offered" assertion in
 * this file would pass for the wrong reason and every positive one would fail pointing at the gateway.
 */
export async function stockCart(paypal: PayPalMarketplacePage, productIds: string[]): Promise<void> {
    await stockCartWithProof(
        paypal,
        productIds,
        productId =>
            `the customer cart must hold product ${productId} before any checkout page is read — an empty cart offers no payment methods at all, which would make every availability answer in this test a statement about the cart rather than about the gateway`,
    );
}

/** Load the classic checkout and prove the order form rendered before anything is read from it. */
export async function gotoClassicCheckout(page: Page): Promise<void> {
    await page.goto(CLASSIC.url, { waitUntil: 'domcontentloaded' });
    // #place_order renders even when NO gateway is available, so waiting on it is what makes an absent
    // radio mean "not offered" rather than "not rendered yet". It stays in the DOM even while the
    // module animates it out of view for smart buttons, so `toBeAttached` is the correct anchor here.
    await expect(
        page.locator(CLASSIC.placeOrder),
        `the classic checkout at ${CLASSIC.url} must render WooCommerce's order form. Its absence usually means an EMPTY cart (the [woocommerce_checkout] shortcode renders nothing for one), in which case no statement about payment-method availability can be made from this page at all`,
    ).toBeAttached({ timeout: 60_000 });
    await waitForCheckoutSettled(page);
}

/**
 * Select PayPal Marketplace on the classic checkout and PROVE the selection took.
 *
 * `locator(radio).check({ force: true })` cannot do this job on this page — the run on 2026-08-01
 * failed on exactly that with "Clicking the checkbox did not change its state". Two product
 * behaviours defeat it: WooCommerce hides the radio input outright when the gateway is the only
 * available method (`checkout.js:228-231`), so there is no box to click; and every `update_checkout`
 * cycle blocks the payment region with a blockUI overlay, which `force: true` happily clicks instead.
 *
 * So: wait the cycle out, click the LABEL (the control a shopper uses), and assert `toBeChecked()`.
 * That assertion is load-bearing rather than defensive — an unselected radio means
 * `WC_Checkout::process_checkout()` answers "Invalid payment method" and the case fails far away from
 * its real cause.
 */
export async function selectClassicPayPal(page: Page): Promise<void> {
    await selectClassicPayPalShared(page, {
        availability: `the classic checkout must offer ${PAYPAL_IDS.gateway} before it can be selected. PP-CHK-01 owns the availability claim; reaching this line without the radio means the gateway is not available for this cart, so no payment could be started by any route`,
        selected: `${PAYPAL_IDS.gateway} must end up SELECTED on the classic checkout. A shopper who cannot select the method cannot pay with it, and WC_Checkout::process_checkout() rejects a submission carrying no payment_method as "Invalid payment method"`,
    });
}

/** This file's own name for the shared classic-checkout response shape. */
export type ClassicCheckoutResult = SharedClassicCheckoutResult;

/* ------------------------------------------------------------------ */
/* The real place-order click, and the redirect to PayPal              */
/* ------------------------------------------------------------------ */

export interface PlacedOrder {
    orderId: string;
    paypalOrderId: string;
    /** PayPal's approve link — `links[1].href` of the create-order response (PaymentMethods/PayPal.php:332). */
    approveUrl: string;
    /** Whatever WooCommerce answered the checkout POST with, for the failure messages. */
    raw: ClassicCheckoutResult;
}

/**
 * Own the `wc-ajax=checkout` response body before the browser ever acts on it.
 *
 * `page.waitForResponse()` cannot be used here: on success WooCommerce's checkout script sets
 * `window.location` to PayPal's approve link, the page leaves the origin, and `response.json()`
 * then throws because the body is no longer retrievable — which is how nine cases came to report
 * "Received: undefined … Full response: {}" with no HTTP status at all. Intercepting instead means
 * the handler reads the body itself, off a response the navigation cannot reclaim.
 */
export interface CheckoutCapture {
    status: () => number;
    body: () => string;
    /** Set only when the request could not be completed at all — never used to hide a failed HTTP status. */
    error: () => string | null;
    /** Block until the response has been seen, so the caller never parses an empty capture. */
    settle: (timeout: number) => Promise<void>;
    release: () => Promise<void>;
}


export async function captureCheckoutResponse(page: Page): Promise<CheckoutCapture> {
    let status = 0;
    let body = '';
    let error: string | null = null;
    let seen = false;

    await page.route(CHECKOUT_AJAX, async route => {
        try {
            const response = await route.fetch();
            status = response.status();
            body = await response.text();
            const headers = { ...response.headers() };
            // `route.fetch()` hands back an already-decoded body, so replaying the origin's
            // content-encoding/content-length would make the browser try to gunzip plain text and fail.
            // The page must still receive a usable response: WooCommerce's own script has to perform the
            // redirect to PayPal for the rest of the case to be about the product at all.
            delete headers['content-encoding'];
            delete headers['content-length'];
            await route.fulfill({ status, headers, body });
        } catch (fetchError) {
            error = String(fetchError).slice(0, 400);
            await route.abort();
        } finally {
            seen = true;
        }
    });

    return {
        status: () => status,
        body: () => body,
        error: () => error,
        settle: async (timeout: number) => {
            const deadline = Date.now() + timeout;
            while (!seen && Date.now() < deadline) {
                await page.waitForTimeout(500);
            }
            expect(
                seen,
                `WooCommerce never answered the wc-ajax=checkout POST within ${timeout}ms, so the order was never created and nothing downstream of it can be tested. Clicking #place_order produced no checkout request at all — check that WooCommerce's checkout.js is loaded and that no client-side validation blocked the submit`,
            ).toBe(true);
        },
        release: async () => {
            await page.unroute(CHECKOUT_AJAX);
        },
    };
}

/** Parse the captured body, surfacing the HTTP status and the raw text rather than swallowing them. */
export function parseCheckoutBody(capture: CheckoutCapture): ClassicCheckoutResult {
    const status = capture.status();
    const body = capture.body();

    expect(
        capture.error(),
        `the wc-ajax=checkout request could not be completed, so it is unknown whether an order was created: ${String(capture.error())}`,
    ).toBeNull();

    let parsed: ClassicCheckoutResult | null = null;
    try {
        parsed = JSON.parse(body) as ClassicCheckoutResult;
    } catch {
        parsed = null;
    }

    expect(
        parsed,
        `WooCommerce must answer the checkout POST with JSON — WC_AJAX::checkout() ends in wp_send_json(), so anything else is a PHP fatal, a redirect or output printed before the JSON. HTTP ${status}, first 400 chars of the raw body: ${body.slice(0, 400) || '(empty body)'}`,
    ).not.toBeNull();

    return parsed as ClassicCheckoutResult;
}

/**
 * Click `#place_order` for real and follow WooCommerce to PayPal.
 *
 * This is the shopper's actual first step on the redirect ("standard") button, and everything about
 * it is the product's: WooCommerce serialises and posts the form itself, `PayPal::process_payment()`
 * answers with `redirect` pointing at PayPal's approve link, and WooCommerce's own checkout script
 * sets `window.location` to it. The `wc-ajax=checkout` response is read on the way past because it is
 * the only place the WooCommerce order id and the PayPal order id appear together.
 */
export async function placeClassicOrder(page: Page): Promise<PlacedOrder> {
    await selectClassicPayPal(page);

    const placeOrder = page.locator(CLASSIC.placeOrder);
    await expect(
        placeOrder,
        'the place-order button must be VISIBLE on the redirect button type. If it is hidden here, button_type is still "smart" — paypal-checkout.js:37-44 animates it away — and the payment can only be started from the PayPal SDK button iframe, which this case does not drive',
    ).toBeVisible({ timeout: 30_000 });

    const capture = await captureCheckoutResponse(page);
    let raw: ClassicCheckoutResult;
    try {
        await placeOrder.click();
        await capture.settle(120_000);
        raw = parseCheckoutBody(capture);
    } finally {
        // Always stop intercepting: the interception must not outlive the click and change how the rest
        // of the case behaves. The `.catch` is not a swallowed diagnostic: `page.unroute()` can itself
        // throw while the page is mid cross-origin navigation to PayPal, and a `finally` that throws
        // REPLACES the real failure — the checkout body diagnostic this whole helper exists to
        // preserve would be lost to an unroute error that says nothing about the product.
        await capture.release().catch(() => undefined);
    }

    expect(
        raw.result,
        `WooCommerce must answer the checkout POST with result=success before any redirect to PayPal can happen. A failure here means the order was never created and no money path exists to test. WooCommerce reports the reason in "messages": ${String(raw.messages ?? '(none)').slice(0, 500)}. Full response: ${JSON.stringify(raw ?? null).slice(0, 500)}`,
    ).toBe('success');

    const orderId = String(raw.id ?? '');
    const paypalOrderId = String(raw.paypal_order_id ?? '');
    const approveUrl = String(raw.paypal_redirect_url ?? raw.redirect ?? '');

    expect(orderId, `the checkout response must carry the WooCommerce order id (PaymentMethods/PayPal.php:345). Response: ${JSON.stringify(raw ?? null).slice(0, 500)}`).not.toBe('');
    expect(
        paypalOrderId,
        `the checkout response must carry paypal_order_id — PayPal::process_payment() returns it at PaymentMethods/PayPal.php:347, and without it nothing can be captured or read back from PayPal. Response: ${JSON.stringify(raw ?? null).slice(0, 500)}`,
    ).not.toBe('');
    expect(
        approveUrl,
        `the checkout response must carry the PayPal approve link (links[1].href, PaymentMethods/PayPal.php:332,338). Without it the shopper is never sent to PayPal and no approval — and therefore no capture — can happen. Response: ${JSON.stringify(raw ?? null).slice(0, 500)}`,
    ).toContain('paypal.com');

    // WooCommerce's own checkout script performs this navigation; waiting for it rather than driving
    // it keeps the redirect itself part of what is under test.
    await page.waitForURL(url => url.hostname.endsWith('paypal.com'), { timeout: 120_000 });

    return { orderId, paypalOrderId, approveUrl, raw };
}

/* ------------------------------------------------------------------ */
/* Buyer approval, on PayPal's own domain                              */
/* ------------------------------------------------------------------ */

/**
 * The hosted buyer approval lives in the page object now — ONE driver for the whole suite.
 *
 * This file's copy was the only one that handled PayPal's real behaviour (challenge detection, a
 * remembered buyer landing straight on the review page, a rejected credential reported as a declared
 * gap), while the split, refund and disbursement specs each carried a weaker one. It was promoted
 * verbatim rather than rewritten, so nothing about this file's behaviour changes; the aliases below
 * keep the call sites reading as they did.
 */
export const PAYPAL_UI = PAYPAL_HOSTED_UI;

export const approveOnPayPal = (page: Page): Promise<ApprovalOutcome> => driveHostedApproval(page);

/**
 * Hold PayPal's redirect back to the store, so a case can inspect the APPROVED-but-uncaptured state.
 *
 * Aborting the return navigation is the only way to reach that state honestly: the capture is
 * performed by `OrderController::maybe_process_order_redirect()` the moment the order-received page
 * is rendered, so anything that lets the browser arrive has already captured.
 */
export interface ReturnInterceptor {
    /** The URL PayPal tried to send the browser to, once it has tried. */
    seen: () => string | null;
    release: () => Promise<void>;
}

export async function interceptReturn(page: Page): Promise<ReturnInterceptor> {
    let seen: string | null = null;
    const matcher = (url: URL): boolean =>
        url.host === SITE_HOST && (url.pathname.includes('order-received') || url.searchParams.has('PayerID'));

    await page.route(matcher, async route => {
        if (seen === null) {
            seen = route.request().url();
        }
        await route.abort();
    });

    return {
        seen: () => seen,
        release: async () => {
            await page.unroute(matcher);
        },
    };
}

/** Wait until PayPal has actually attempted the redirect back to the store. */
export async function waitForReturnAttempt(page: Page, interceptor: ReturnInterceptor): Promise<string> {
    const deadline = Date.now() + 120_000;
    do {
        const url = interceptor.seen();
        if (url) {
            return url;
        }
        await page.waitForTimeout(500);
    } while (Date.now() < deadline);

    throw new Error(
        `PayPal never redirected back to ${SITE_HOST} after the buyer approved. The buyer's money may have been authorised with the store never told about it, which is the worst outcome this module has. ${await paypalDiagnostics(page)}`,
    );
}

/** Vendor 1's product — the connected-vendor baseline for every positive case. */
export let vendor1ProductId = '';

/** Vendor 2's product — the second payee for the multi-vendor capture, and the "unconnected" cart for PP-CHK-02. */
export let vendor2ProductId = '';

/** Virtual, so a 100%-off coupon leaves a total of exactly zero with no shipping or shipping tax. */
export let virtualProductId = '';

/** Every WooCommerce order these cases create, so none is left behind on the shared site. */
export const createdOrderIds: string[] = [];

/** Every coupon these cases create. */
export const createdCouponIds: string[] = [];

/* -------------------------------------------------------------- */
/* Shared gates                                                    */
/* -------------------------------------------------------------- */

/**
 * A merchant id that LOOKS right but has granted this partner app no consent makes every money
 * assertion fail opaquely at PayPal, so consent is probed over the network in the test itself
 * rather than inferred from the id's shape. `HAS_REAL_MERCHANTS` can only see the shape.
 */
export async function payableGate(which: 'vendor1' | 'both'): Promise<string | null> {
    if (which === 'vendor1') {
        const consent = await getMerchantConsent(PAYPAL_MERCHANTS.vendor1);
        return isPayableMerchant(consent)
            ? null
            : `PayPal will not accept vendor1 (${consent.merchantId}) as a payee: ${consent.reason ?? 'connected but not payments-receivable'}. create_order() cannot name a payee it refuses, so no PayPal order and no capture is possible. PP-PRE-04 reports this.`;
    }

    const consents = await getBothMerchantConsents();
    const unpayable = Object.entries(consents).filter(([, consent]) => !isPayableMerchant(consent));
    return unpayable.length === 0
        ? null
        : `PayPal will not accept ${unpayable
              .map(([label, consent]) => `${label} (${consent.merchantId}): ${consent.reason ?? 'connected but not payments-receivable'}`)
              .join('; ')} as a payee, so the multi-vendor order this case needs cannot be created. PP-PRE-04 reports this.`;
}

/* -------------------------------------------------------------- */
/* Captured-order fixtures — one real capture, several claims      */
/* -------------------------------------------------------------- */

export interface CapturedOrder {
    orderId: string;
    paypalOrderId: string;
    /** The order-received URL PayPal actually redirected to, PayerID and all. */
    returnUrl: string;
    /** Everything the post-approval page rendered, read in the real redirected session. */
    thankYou: { url: string; text: string; errorCount: number };
    /** Customer order ids immediately before the checkout POST and after the back-and-resubmit attempt. */
    orderIdsBefore: string[];
    orderIdsAfterBack: string[];
    /** What a resubmit attempt from the back-navigated checkout actually did. */
    backResubmit: ClassicCheckoutResult;
    backLandedOn: string;
    /**
     * `_woocommerce_persistent_cart_1` as it stands once the shopper is back on the checkout after
     * paying. WooCommerce — not this file — writes and clears that row, so it is the product's own
     * answer to "can this shopper re-place the order they already paid for?".
     */
    postPaymentCart: string;
    /** Whether the shortcode still rendered an order form for the returning shopper. */
    checkoutFormCount: number;
    approvalSteps: string[];
}

/**
 * Memoised because a capture is real money and a real sandbox transaction. Whichever case needs it
 * first pays for it; the others reuse it, so no case depends on another having run and each still
 * works when run alone with `--grep`.
 *
 * `blocker` is carried out rather than thrown so the calling case can skip in ITS own words,
 * naming the PayPal-side obstacle it hit.
 */
export let singleVendorFixture: CapturedOrder | null = null;

export let singleVendorBlocker: string | null = null;

export async function captureSingleVendorOrder(browser: Browser): Promise<{ order: CapturedOrder | null; blocker: string | null }> {
    if (singleVendorFixture || singleVendorBlocker) {
        return { order: singleVendorFixture, blocker: singleVendorBlocker };
    }

    await useStandardButton();

    const result = await withCustomer(browser, async (page, paypal) => {
        const orderIdsBefore = await customerOrderIds();
        await stockCart(paypal, [vendor1ProductId]);
        await gotoClassicCheckout(page);

        const placed = await placeClassicOrder(page);
        createdOrderIds.push(placed.orderId);

        const approval = await approveOnPayPal(page);
        if (!approval.approved) {
            return { blocker: approval.blocker, order: null };
        }

        // The store's own return, performed by PayPal. `maybe_process_order_redirect()` captures
        // while this page renders, so arriving here IS the capture.
        await page.waitForURL(url => url.host === SITE_HOST, { timeout: 180_000 });
        await page.waitForLoadState('networkidle').catch(() => undefined);
        const returnUrl = page.url();
        const thankYouText = await page.locator('body').innerText().catch(() => '');
        const errorCount = await page.locator(THANK_YOU_ERRORS).count();

        // PP-CHK-12's evidence, gathered in the SAME browsing session that made the payment, which
        // is the only place a genuine post-approval return to the checkout exists.
        //
        // An explicit navigation rather than `page.goBack()`, and the difference decides whether the
        // case has a subject at all: the post-capture history is [classic checkout, paypal.com
        // approval page(s), order-received], so one step back lands on PAYPAL.COM, where
        // `window.wc_checkout_params` does not exist and `submitClassicCheckout()` can only answer
        // "jQuery or wc_checkout_params.checkout_url is missing" — no checkout POST would ever reach
        // WC_Checkout::process_checkout() and the duplicate-order claim below would be vacuous.
        // Going to the checkout URL in this same session IS the catalogue's "navigate back to
        // checkout", and it lands on SITE_HOST where a resubmit is actually possible.
        await page.goto(CLASSIC.url, { waitUntil: 'domcontentloaded' });
        await waitForCheckoutSettled(page);
        const backLandedOn = page.url();
        // Read BEFORE the resubmit, so it measures what the CAPTURE left behind rather than what the
        // resubmit did to it.
        const postPaymentCart = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
        const checkoutFormCount = await page.locator(PayPalMarketplacePage.classic.form).count();
        // The catch records the transport failure into the result the case asserts on; it never
        // turns one into a pass, because PP-CHK-12's load-bearing claim is the persistent cart, and
        // an `__error` here leaves `result` undefined, which the `not.toBe('success')` still reads.
        // It is kept only because a throw would leave the memoised fixture null and make the NEXT
        // case pay for a second real sandbox capture.
        const backResubmit = await submitClassicCheckout(page).catch(error => ({ __error: String(error) }) as ClassicCheckoutResult);
        const orderIdsAfterBack = await customerOrderIds();

        return {
            blocker: null,
            order: {
                orderId: placed.orderId,
                paypalOrderId: placed.paypalOrderId,
                returnUrl,
                thankYou: { url: returnUrl, text: thankYouText, errorCount },
                orderIdsBefore,
                orderIdsAfterBack,
                backResubmit,
                backLandedOn,
                postPaymentCart,
                checkoutFormCount,
                approvalSteps: approval.steps,
            } satisfies CapturedOrder,
        };
    });

    singleVendorFixture = result.order;
    singleVendorBlocker = result.blocker;

    if (result.order) {
        // Anything created by the resubmit attempt is cleaned up too, whatever the case decides
        // about it — a leaked paid order is exactly what corrupts the next balance assertion.
        const strayId = String(result.order.backResubmit.id ?? '');
        if (strayId && !createdOrderIds.includes(strayId)) {
            createdOrderIds.push(strayId);
        }
    }

    return result;
}

export let multiVendorFixture: { orderId: string; paypalOrderId: string; childIds: string[] } | null = null;

export let multiVendorBlocker: string | null = null;

export async function captureMultiVendorOrder(browser: Browser): Promise<{ order: typeof multiVendorFixture; blocker: string | null }> {
    if (multiVendorFixture || multiVendorBlocker) {
        return { order: multiVendorFixture, blocker: multiVendorBlocker };
    }

    await useStandardButton();

    const result = await withCustomer(browser, async (page, paypal) => {
        await stockCart(paypal, [vendor1ProductId, vendor2ProductId]);
        await gotoClassicCheckout(page);

        const placed = await placeClassicOrder(page);
        createdOrderIds.push(placed.orderId);

        const approval = await approveOnPayPal(page);
        if (!approval.approved) {
            return { blocker: approval.blocker, order: null };
        }

        await page.waitForURL(url => url.host === SITE_HOST, { timeout: 180_000 });
        await page.waitForLoadState('networkidle').catch(() => undefined);

        return { blocker: null, order: { orderId: placed.orderId, paypalOrderId: placed.paypalOrderId, childIds: [] as string[] } };
    });

    if (result.order) {
        result.order.childIds = await dbUtils.getChildOrderIds(result.order.orderId);
    }

    multiVendorFixture = result.order;
    multiVendorBlocker = result.blocker;
    return result;
}

/* -------------------------------------------------------------- */
/* The money oracle                                                */
/* -------------------------------------------------------------- */

/**
 * Assert the one identity that decides whether the marketplace works:
 *
 *     sub order total == vendor credit + PayPal processing fee + admin platform fee
 *
 * The left side is WooCommerce's; every term on the right was written by the module from PayPal's
 * `seller_receivable_breakdown` at capture time (Order/OrderManager.php:509-608), so a green here
 * means the two systems agree about where the shopper's money went. An order reaching `processing`
 * proves none of this.
 */
export async function assertVendorSplit(caseId: string, parentOrderId: string, expectedMerchants: Record<string, string>): Promise<void> {
    const parent = await readWooOrder(parentOrderId);
    const childIds = await dbUtils.getChildOrderIds(parentOrderId);
    // A single-vendor cart is never split: `process_payment` falls back to `[ $order ]`
    // (PaymentMethods/PayPal.php:266-268) and the parent itself carries the capture.
    const payableIds = childIds.length > 0 ? childIds : [parentOrderId];

    const payables = await Promise.all(payableIds.map(async id => ({ id, order: await readWooOrder(id) })));
    const balances_ = await vendorBalanceRows(payableIds);
    const dokanRows = await dokanOrderRows(payableIds);

    const ledger = payables.map(({ id, order }) => ({
        orderId: id,
        vendorId: metaString(order, '_dokan_vendor_id'),
        total: order.total ?? null,
        captureId: metaString(order, '_dokan_paypal_payment_capture_id'),
        processingFee: metaString(order, '_dokan_paypal_payment_processing_fee'),
        platformFee: metaString(order, '_dokan_paypal_payment_platform_fee'),
        credit: balances_.find(row => String(row.trn_id) === String(id))?.credit ?? null,
    }));
    const ledgerText = JSON.stringify(ledger ?? null);

    let vendorTotalSum = 0;

    for (const row of ledger) {
        expect(
            row.captureId,
            `${caseId}: order #${row.orderId} must carry _dokan_paypal_payment_capture_id after the capture. Without it the payment cannot be refunded, disbursed or reconciled at all — the money left the buyer with nothing on this side pointing at it. Ledger: ${ledgerText}`,
        ).not.toBeNull();

        expect(
            row.vendorId,
            `${caseId}: order #${row.orderId} must name the vendor it was captured for (_dokan_vendor_id). Without it no earning can be attributed and dokan_get_seller_id_by_order() cannot resolve who to pay. Ledger: ${ledgerText}`,
        ).not.toBeNull();

        const expectedMerchant = row.vendorId ? expectedMerchants[row.vendorId] : undefined;
        expect(
            expectedMerchant,
            `${caseId}: order #${row.orderId} was captured for vendor ${String(row.vendorId)}, who is not one of the vendors this case set up (${JSON.stringify(Object.keys(expectedMerchants))}). Either the split attributed the goods to the wrong vendor or the fixture is stale. Ledger: ${ledgerText}`,
        ).toBeDefined();

        const balanceRow = balances_.find(candidate => String(candidate.trn_id) === String(row.orderId));
        expect(
            balanceRow,
            `${caseId}: the vendor must be credited for order #${row.orderId}. OrderManager::insert_vendor_withdraw_balance() writes one dokan_vendor_balance row per captured sub order with trn_type='dokan_withdraw' (Order/OrderManager.php:791-815) whenever the disbursement mode is INSTANT. No row means the shopper paid and the vendor's ledger never learned about it. Rows found for these orders: ${JSON.stringify(balances_ ?? null)}`,
        ).toBeDefined();

        const total = money(row.total);
        const credit = money(balanceRow?.credit);
        const processingFee = money(row.processingFee);
        const platformFee = money(row.platformFee);
        vendorTotalSum += total;

        expect(
            balances(total, credit + processingFee + platformFee),
            `${caseId}: the money does not add up for order #${row.orderId}. WooCommerce charged ${String(row.total)} but PayPal's own breakdown accounts for ${(credit + processingFee + platformFee).toFixed(2)} = vendor credit ${String(balanceRow?.credit)} + PayPal processing fee ${String(row.processingFee)} + admin platform fee ${String(row.platformFee)}. Every term on the right was copied off PayPal's seller_receivable_breakdown at capture time (Order/OrderManager.php:516-521), so a mismatch means money the buyer paid reached nobody this system can name. Ledger: ${ledgerText}`,
        ).toBe(true);

        const dokanRow = dokanRows.find(candidate => String(candidate.order_id) === String(row.orderId));
        expect(
            dokanRow,
            `${caseId}: order #${row.orderId} must have a wp_dokan_orders row — it is the vendor split row every Dokan earnings report, withdraw balance and admin commission figure is read from. Rows found: ${JSON.stringify(dokanRows ?? null)}`,
        ).toBeDefined();
    }

    expect(
        balances(money(parent.total), vendorTotalSum),
        `${caseId}: the sub orders of #${parentOrderId} total ${vendorTotalSum.toFixed(2)} but the parent order charges ${String(parent.total)}. The purchase units PayPal captured were built one per sub order (PaymentMethods/PayPal.php:272-276), so the difference is money the buyer was charged that no vendor was ever asked to be paid — or the reverse. Ledger: ${ledgerText}`,
    ).toBe(true);

    log.success(`${caseId}: money reconciles across ${ledger.length} vendor order(s) — ${ledgerText}`);
}

/**
 * PayPal's own copy: the payees, the capture ids and the completed state.
 *
 * Read back rather than trusted from the WordPress side because the purchase units are never
 * persisted here — PayPal is the only record of who was actually named as the recipient of each
 * vendor's share, which is the single fact a marketplace cannot get wrong.
 */
export async function assertPayPalSideCapture(caseId: string, paypalOrderId: string, expectedMerchantsBySubOrder: Record<string, string>): Promise<PayPalOrder> {
    const paypalOrder = await getPayPalOrder(paypalOrderId);

    expect(
        paypalOrder.intent,
        `${caseId}: PayPal order ${paypalOrderId} must have intent CAPTURE. The module hardcodes it (PaymentMethods/PayPal.php:287) and there is no payment_action setting to change it, so anything else means an AUTHORIZE-only order that no handler in this module ever captures — the buyer sees a hold and the vendor is never paid. Order: ${JSON.stringify({ id: paypalOrder.id ?? null, status: paypalOrder.status ?? null, intent: paypalOrder.intent ?? null })}`,
    ).toBe('CAPTURE');

    expect(
        paypalOrder.status,
        `${caseId}: PayPal order ${paypalOrderId} must be COMPLETED after the buyer approved and the store returned. APPROVED means the buyer authorised the payment and the capture never happened, so the store believes it was paid while PayPal holds no money for anyone. Order: ${JSON.stringify({ id: paypalOrder.id ?? null, status: paypalOrder.status ?? null })}`,
    ).toBe('COMPLETED');

    const captures = capturesOf(paypalOrder);
    expect(
        captures.length,
        `${caseId}: PayPal must hold one capture per purchase unit for order ${paypalOrderId}, one per vendor. Captures seen: ${JSON.stringify(captures.map(row => ({ customId: row.customId, merchantId: row.merchantId, id: row.capture.id ?? null, status: row.capture.status ?? null })) ?? null)}`,
    ).toBe(Object.keys(expectedMerchantsBySubOrder).length);

    for (const row of captures) {
        expect(
            row.capture.status,
            `${caseId}: capture ${String(row.capture.id)} on PayPal order ${paypalOrderId} must be COMPLETED. A PENDING or DECLINED capture leaves the store treating an unpaid order as paid. Capture: ${JSON.stringify(row.capture ?? null)}`,
        ).toBe('COMPLETED');

        const expectedMerchant = expectedMerchantsBySubOrder[row.customId];
        expect(
            expectedMerchant,
            `${caseId}: PayPal captured against custom_id "${row.customId}", which is not one of the sub orders this case created (${JSON.stringify(Object.keys(expectedMerchantsBySubOrder))}). custom_id is the sub order id (Order/OrderManager.php:220), so a stranger here means the capture was booked against somebody else's order. Captures: ${JSON.stringify(captures.map(candidate => candidate.customId) ?? null)}`,
        ).toBeDefined();

        expect(
            row.merchantId,
            `${caseId}: the purchase unit for sub order ${row.customId} must name that vendor's OWN merchant id as payee. This is the field that decides who receives the money; a wrong value pays a different seller for this vendor's goods and nothing on the WordPress side would show it, because the purchase units are not persisted here. Unit payee: ${row.merchantId}, expected: ${String(expectedMerchant)}`,
        ).toBe(expectedMerchant);

        // PayPal only returns `seller_receivable_breakdown` to a caller entitled to see it, so its
        // absence is REPORTED rather than failed — the WordPress-side identity in assertVendorSplit()
        // already carries the same numbers, copied off this very structure at capture time.
        const breakdown = row.capture.seller_receivable_breakdown;
        if (breakdown?.gross_amount?.value) {
            const gross = money(breakdown.gross_amount.value);
            const net = money(breakdown.net_amount?.value);
            const fee = money(breakdown.paypal_fee?.value);
            const platform = money(breakdown.platform_fees?.[0]?.amount?.value ?? '0.00');
            expect(
                balances(gross, net + fee + platform),
                `${caseId}: PayPal's own breakdown for capture ${String(row.capture.id)} does not reconcile — gross ${gross} != net ${net} + paypal_fee ${fee} + platform_fee ${platform}. Breakdown: ${JSON.stringify(breakdown ?? null)}`,
            ).toBe(true);
        } else {
            log.info(`${caseId}: PayPal returned no seller_receivable_breakdown on capture ${String(row.capture.id)} for this partner token; the WordPress-side reconciliation still covers the same figures.`);
        }
    }

    return paypalOrder;
}

/** sub order id -> that vendor's merchant id, which is what both oracles above are keyed on. */
export async function merchantsBySubOrder(parentOrderId: string): Promise<Record<string, string>> {
    const childIds = await dbUtils.getChildOrderIds(parentOrderId);
    const payableIds = childIds.length > 0 ? childIds : [parentOrderId];
    const byVendor: Record<string, string> = { [VENDOR_ID]: PAYPAL_MERCHANTS.vendor1, [VENDOR2_ID]: PAYPAL_MERCHANTS.vendor2 };

    const map: Record<string, string> = {};
    for (const id of payableIds) {
        const vendorId = metaString(await readWooOrder(id), '_dokan_vendor_id');
        const merchant = vendorId ? byVendor[vendorId] : undefined;
        if (merchant) {
            map[id] = merchant;
        }
    }
    return map;
}

export class PayPalMarketplaceCheckoutPage {
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
        const [, product1] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Checkout Vendor1 Product' }, payloads.vendorAuth);
        const [, product2] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Checkout Vendor2 Product' }, payloads.vendor2Auth);
        const [, product3] = await api.createProduct(
            { ...payloads.createProduct(), name: 'PayPal Checkout Vendor1 Virtual Product', virtual: true, regular_price: '100' },
            payloads.vendorAuth,
        );
        vendor1ProductId = product1;
        vendor2ProductId = product2;
        virtualProductId = product3;
        await api.dispose();
    }

    async teardownAll(): Promise<void> {
        if (!hasCredentials) {
            return;
        }

        // The suite baseline. Left on "standard", every other spec in this suite that expects the smart
        // buttons — PP-3DS in particular, whose whole subject is gated on button_type === 'smart' —
        // would assert against a gateway this file reconfigured.
        await mergeGatewaySettings({ button_type: 'smart' });

        // PP-CHK-02 disconnects vendor 2. Re-seeding is not cosmetic: a case that died mid-test would
        // otherwise hand every later PayPal spec on this worker a vendor that cannot be paid.
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: 'dokangit@vendor1.com' });
        await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' });
        await dbUtils.clearCustomerCart(CUSTOMER_ID);

        // Sub orders first, then parents — and the LEDGER rows before the orders that own them, because
        // a captured order leaves rows in three tables that no order deletion touches. Left behind, a
        // vendor-balance credit poisons every later balance assertion in this suite, which is exactly
        // the corruption PP-WDR's own probe already has to work around.
        const allOrderIds: string[] = [];
        for (const parentId of createdOrderIds) {
            const childIds = await dbUtils.getChildOrderIds(parentId).catch(() => [] as string[]);
            allOrderIds.push(...childIds, parentId);
        }

        if (allOrderIds.length > 0) {
            const placeholders = allOrderIds.map(() => '?').join(', ');
            await dbUtils
                .dbQuery(`DELETE FROM \`${VENDOR_BALANCE_TABLE}\` WHERE trn_id IN (${placeholders});`, allOrderIds)
                .catch(() => undefined);
            await dbUtils.dbQuery(`DELETE FROM \`${DOKAN_ORDERS_TABLE}\` WHERE order_id IN (${placeholders});`, allOrderIds).catch(() => undefined);
            // `dokan_withdraw` carries no order-id column at all (dokan-lite Installer.php:346-357); the
            // order id survives only inside the note OrderManager.php:830 writes.
            for (const orderId of allOrderIds) {
                await dbUtils
                    .dbQuery(`DELETE FROM \`${VENDOR_WITHDRAW_TABLE}\` WHERE note LIKE ?;`, [`Order ${orderId} payment Auto paid via%`])
                    .catch(() => undefined);
            }
        }

        await adminRequest(async ctx => {
            for (const orderId of allOrderIds) {
                await ctx.delete(`${SERVER_URL}/wc/v3/orders/${orderId}?force=true`).catch(() => undefined);
            }
            for (const couponId of createdCouponIds) {
                await ctx.delete(`${SERVER_URL}/wc/v3/coupons/${couponId}?force=true`).catch(() => undefined);
            }
            for (const productId of [vendor1ProductId, vendor2ProductId, virtualProductId]) {
                if (productId) {
                    await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`).catch(() => undefined);
                }
            }
        });

        log.info(
            `PP-CHK cleanup: removed ${allOrderIds.length} order(s) and their dokan_orders / dokan_vendor_balance / dokan_withdraw rows. NOTE: deleting a WooCommerce order does not reverse the money at PayPal — the sandbox captures performed by this file remain on the sandbox merchant accounts by design, and PP-REF owns the refund path.`,
        );
    }

    async ppChk01({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            `Helper::is_ready() must be true before this page can say anything about availability — it is enabled AND partner_id AND client id AND client secret (Helper.php:101-117). A false here means the gateway can never appear for anybody and the assertion below would be about the configuration rather than the checkout. Observed: enabled=${status.is_enabled}, partner_id present=${status.has_partner_id}, module active=${status.module_active}`,
        ).toBe(true);

        await useSmartButton();

        await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
            await gotoClassicCheckout(page);

            await expect(
                page.locator(CLASSIC.radio),
                `the classic checkout must offer ${PAYPAL_IDS.gateway} for a connected vendor's product. PayPal::is_available() is parent::is_available() && Helper::is_ready() && Helper::validate_cart_items() (PaymentMethods/PayPal.php:599), and validate_cart_items() needs the vendor's receive-payment gate — the sixth seeded meta. Absence here means no customer can pay this vendor through PayPal at all`,
            ).toBeAttached({ timeout: 30_000 });
        });

        log.success('PP-CHK-01: the gateway renders on the classic checkout for a connected vendor.');
    }

    async ppChk02({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        // Absence is the assertion most able to pass for the wrong reason: on an unconfigured site the
        // gateway is absent from EVERY cart. So readiness is proven, and the gateway is proven PRESENT
        // for a connected vendor, in this same run — before anything is disconnected.
        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            `Helper::is_ready() must be true, or "gateway absent" below merely restates an unconfigured gateway and passes on a site where checkout is completely broken. Observed: enabled=${status.is_enabled}, partner_id present=${status.has_partner_id}, module active=${status.module_active}`,
        ).toBe(true);

        await useSmartButton();

        await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
            await gotoClassicCheckout(page);
            await expect(
                page.locator(CLASSIC.radio),
                'positive baseline: the gateway must be offered for the CONNECTED vendor first. Without this in the same run, the absence asserted below is indistinguishable from a gateway that is never offered to anybody',
            ).toBeAttached({ timeout: 30_000 });
        });

        const cleared = await clearPayPalVendor(VENDOR2_ID);
        try {
            expect(
                cleared.receivable,
                `vendor ${VENDOR2_ID} must actually read as NOT payable after clearPayPalVendor(). The helper removes BOTH mode variants of all six metas; if the receive-payment gate survived, the "hidden" result below would prove nothing. Deleted keys: ${JSON.stringify(cleared.deleted ?? null)}`,
            ).toBe(false);

            await withCustomer(browser, async (page, paypal) => {
                await stockCart(paypal, [vendor2ProductId]);
                await gotoClassicCheckout(page);

                await expect(
                    page.locator(CLASSIC.radio),
                    `the classic checkout must NOT offer ${PAYPAL_IDS.gateway} when the cart holds only a vendor who cannot receive PayPal payments. Helper::validate_cart_items() fails on the first such vendor and WooCommerce drops the gateway from get_available_payment_gateways(). Offering it anyway takes the shopper's money for goods whose vendor has no way to be paid — and the failure only surfaces at PayPal, with an opaque payee error, after the order already exists`,
                ).toHaveCount(0);
            });
        } finally {
            // Restored inside the test, not only in afterAll: a failure between here and the end of the
            // file would otherwise leave vendor 2 unpayable for every later case in this run.
            await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' });
        }

        log.success('PP-CHK-02: the gateway is hidden for an unconnected vendor and offered for a connected one, both proven in this run.');
    }

    async ppChk03({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);

        await useSmartButton();

        await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
            await gotoClassicCheckout(page);
            await selectClassicPayPal(page);

            await expect(
                page.locator(CLASSIC.sdkScript),
                `the PayPal JS SDK must be enqueued on the smart button type — CartHandler::payment_scripts() enqueues 'dokan_paypal_sdk' only when Helper::get_button_type() === 'smart' (Cart/CartHandler.php:95). No SDK tag means no button can ever mount and the shopper has nothing to click, because the module has already hidden #place_order`,
            ).toHaveCount(1);

            // Two attempts, and the reason is the product's own behaviour rather than flakiness:
            // `#paypal-button-container` lives inside `#order_review`, which WooCommerce REPLACES
            // wholesale on every `update_checkout` (checkout.js), while `init_paypal()` renders once and
            // guards on its own `loaded` flag (paypal-checkout.js:448-451). Selecting the method fires an
            // update_checkout, so on a slow round trip the freshly rendered iframe can be discarded.
            // Reloading with PayPal already the session's chosen method removes the extra cycle — which
            // is exactly what a shopper who refreshes gets.
            let frames = 0;
            for (let attempt = 1; attempt <= 2 && frames === 0; attempt++) {
                if (attempt === 2) {
                    await page.reload({ waitUntil: 'domcontentloaded' });
                    await waitForCheckoutSettled(page);
                }
                await page
                    .locator(CLASSIC.paypalButtonFrame)
                    .first()
                    // The SDK is initialised 5s after document-ready and then waits for paypal.Buttons,
                    // so a short budget here reports "no button" on a working store.
                    .waitFor({ state: 'attached', timeout: 90_000 })
                    .catch(() => undefined);
                frames = await page.locator(CLASSIC.paypalButtonFrame).count();
            }

            expect(
                frames,
                `the PayPal SDK must mount its button iframe into ${CLASSIC.paypalButtonContainer} within 90s of the method being selected, on two attempts. The module hides #place_order whenever this gateway is chosen with the smart button type (Cart/CartHandler.php:258-269, paypal-checkout.js:37-44), so a container with no button leaves the shopper with NO way to submit the order at all — the checkout is dead rather than degraded. Note this case asserts SDK load and button mount only; the approval flow inside that iframe is PayPal-hosted and cross-origin, and PP-CHK-06 captures through the redirect button type instead`,
            ).toBeGreaterThan(0);

            await expect(
                page.locator(CLASSIC.paypalButtonContainer),
                'the button container must be VISIBLE once PayPal is the selected method — toggle_buttons() animates it in and #place_order out (paypal-checkout.js:24-45). A mounted-but-hidden button is the same dead end as no button',
            ).toBeVisible({ timeout: 30_000 });
        });

        log.success('PP-CHK-03: the PayPal SDK mounted its smart button on the classic checkout.');
    }

    async ppChk04({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        await useStandardButton();

        await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
            await gotoClassicCheckout(page);
            await selectClassicPayPal(page);

            await expect(
                page.locator(CLASSIC.placeOrder),
                'the standard button type must leave WooCommerce\'s own #place_order visible and usable — it IS the control on this path. CartHandler::display_paypal_button() returns before printing the hide-script for any non-smart type (Cart/CartHandler.php:253-256), so a hidden button here means the shopper has no way to pay',
            ).toBeVisible({ timeout: 30_000 });
            await expect(page.locator(CLASSIC.placeOrder), 'the place-order button must be enabled').toBeEnabled();

            await expect(
                page.locator(CLASSIC.sdkScript),
                'the PayPal JS SDK must NOT be loaded on the standard button type — CartHandler::payment_scripts() returns before wp_enqueue_script() for any non-smart type (Cart/CartHandler.php:95-97). Loading it anyway ships a third-party script (and its merchant ids) to every checkout that has no use for it',
            ).toHaveCount(0);

            await expect(
                page.locator(CLASSIC.paypalButtonContainer),
                'the smart button container must NOT be rendered on the standard button type; nothing would ever mount into it and it would sit on the page as an empty gap',
            ).toHaveCount(0);

            const localized = await page.evaluate(() => {
                const w = window as unknown as { dokan_paypal?: unknown };
                return w.dokan_paypal === undefined ? null : 'present';
            });
            expect(
                localized,
                'the module must not localize dokan_paypal on the standard path — wp_localize_script() runs inside the same smart-only branch, so its presence means the early return no longer holds and the checkout nonce is being printed on pages with no script to use it',
            ).toBeNull();
        });

        log.success('PP-CHK-04: the standard redirect control renders and the smart-button machinery stays off.');
    }

    async ppChk05({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);

        const blocker = await payableGate('vendor1');
        test.skip(blocker !== null, blocker ?? '');

        await useSmartButton();

        const result = await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
            await gotoClassicCheckout(page);
            await selectClassicPayPal(page);
            return submitClassicCheckout(page);
        });

        expect(
            result.__error ?? null,
            `the checkout POST must reach WC_Checkout::process_checkout(). This is the transport paypal-checkout.js uses from inside the SDK's createOrder callback (assets/src/js/paypal-checkout.js:130-141), so a transport failure here means no shopper on the smart button type can start a payment at all`,
        ).toBeNull();
        expect(
            result.result,
            `the checkout must return result=success. WooCommerce reports the reason in "messages": ${String(result.messages ?? '(none)').slice(0, 500)}`,
        ).toBe('success');

        const orderId = String(result.id ?? '');
        const paypalOrderId = String(result.paypal_order_id ?? '');
        if (orderId) {
            createdOrderIds.push(orderId);
        }

        expect(
            paypalOrderId,
            `create-payment must return a PayPal order id. Without one the SDK throws "PayPal did not return an order to pay for" and the shopper never reaches PayPal. Response: ${JSON.stringify(result ?? null).slice(0, 500)}`,
        ).not.toBe('');

        const storedPayPalOrderId = metaString(await readWooOrder(orderId), '_dokan_paypal_order_id');
        expect(
            storedPayPalOrderId,
            `the WooCommerce order must record the PayPal order id in _dokan_paypal_order_id (PaymentMethods/PayPal.php:331). It is the only link between the two systems: the capture handler, the webhook handlers and the refund controller all resolve the PayPal order through it, so an order without it can never be captured or refunded even though the buyer can still pay for it. Returned: ${paypalOrderId}, stored: ${String(storedPayPalOrderId)}`,
        ).toBe(paypalOrderId);

        // PayPal's own copy — the purchase units are not persisted here, so this is the only record of
        // what the shopper is about to be asked to pay and who is named to receive it.
        const paypalOrder = await getPayPalOrder(paypalOrderId);
        expect(paypalOrder.intent, 'the created PayPal order must have intent CAPTURE; the module hardcodes it (PaymentMethods/PayPal.php:287) and an AUTHORIZE order is never captured by any handler here').toBe('CAPTURE');
        expect(
            paypalOrder.status,
            `a freshly created PayPal order must be in CREATED (or PAYER_ACTION_REQUIRED) state before anyone approves it. Order: ${JSON.stringify({ id: paypalOrder.id ?? null, status: paypalOrder.status ?? null })}`,
        ).toMatch(/^(CREATED|PAYER_ACTION_REQUIRED|SAVED)$/);

        const units = paypalOrder.purchase_units ?? [];
        expect(units.length, `a single-vendor cart must produce exactly one purchase unit. Units: ${JSON.stringify(units ?? null)}`).toBe(1);
        expect(
            units[0]?.payee?.merchant_id ?? null,
            `the purchase unit must name vendor ${VENDOR_ID}'s own merchant id as payee (OrderManager::make_purchase_unit_data() sets it from Helper::get_seller_merchant_id(), Order/OrderManager.php:154,203-205). A wrong payee routes this vendor's money to somebody else, and nothing WordPress-side would show it. Unit: ${JSON.stringify(units[0] ?? null)}`,
        ).toBe(PAYPAL_MERCHANTS.vendor1);

        // The BLOCK transport of the same route. It is a genuinely different code path — the draft
        // order is built by the Store API's OrderController::create_order_from_cart() rather than by
        // WC_Checkout::create_order() (REST/V1/PayPalController.php:145-171) — and the block checkout
        // is this site's DEFAULT, so a classic-only proof would leave the path most shoppers use
        // unexercised. PP-BLK-03 compares the two purchase-unit sets; what is asserted here is the
        // half PP-BLK-03 does not touch: that each path records its PayPal order id on its own order.
        const blockResult = await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
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
            `the block create-payment route must return a paypal_order_id too — the React component throws "PayPal did not return an order to pay for" without one. Response: ${JSON.stringify(blockResult ?? null).slice(0, 500)}`,
        ).not.toBe('');

        expect(
            metaString(await readWooOrder(blockOrderId), '_dokan_paypal_order_id'),
            `the block path's WooCommerce order #${blockOrderId} must record its PayPal order id as well. Both paths run through PayPal::process_payment(), which writes the meta at PaymentMethods/PayPal.php:331, but they arrive with orders built by different builders — and an order without this meta can never be captured or refunded, whichever path created it. Returned: ${blockPayPalOrderId}`,
        ).toBe(blockPayPalOrderId);

        const blockPayPalOrder = await getPayPalOrder(blockPayPalOrderId);
        expect(blockPayPalOrder.intent, 'the block path must create a CAPTURE-intent PayPal order too — the constant is shared, and it is asserted directly rather than compared to the classic path so a regression losing it on BOTH paths cannot hide behind an equality').toBe('CAPTURE');
        expect(
            (blockPayPalOrder.purchase_units ?? [])[0]?.payee?.merchant_id ?? null,
            `the block path's purchase unit must name the same payee. A payee that differs between the two checkout paths means the same shopper buying the same product pays a different merchant depending on which checkout they used. Units: ${JSON.stringify(blockPayPalOrder.purchase_units ?? null)}`,
        ).toBe(PAYPAL_MERCHANTS.vendor1);

        log.success(
            `PP-CHK-05: create-payment returned PayPal order ${paypalOrderId} on the classic path (order #${orderId}) and ${blockPayPalOrderId} on the block path (order #${blockOrderId}); both recorded the id and both name payee ${PAYPAL_MERCHANTS.vendor1}.`,
        );
    }

    async ppChk06({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_BUYER_LOGIN, BUYER_SKIP);

        const gate = await payableGate('vendor1');
        test.skip(gate !== null, gate ?? '');

        const { order, blocker } = await captureSingleVendorOrder(browser);
        test.skip(
            blocker !== null,
            `the PayPal-hosted approval could not be completed, so no capture exists to verify. This is a PayPal-side obstacle, not a product result — the order was created and the shopper WAS sent to PayPal. ${String(blocker)}`,
        );
        expect(order, 'the capture fixture must have produced an order once approval succeeded').not.toBeNull();
        if (!order) {
            return;
        }

        const wooOrder = await readWooOrder(order.orderId);
        expect(
            wooOrder.status,
            `order #${order.orderId} must be paid after PayPal captured. payment_complete() is called by OrderController::maybe_process_order_redirect() immediately after the capture (Order/OrderController.php:525-526), so anything still 'pending' or 'failed' means the buyer's money left their account while WooCommerce still treats the order as unpaid — the vendor never ships and nobody reconciles it. Status: ${String(wooOrder.status)}, PayPal order: ${order.paypalOrderId}`,
        ).toMatch(/^(processing|completed|on-hold)$/);

        expect(
            metaString(wooOrder, '_dokan_paypal_order_id'),
            `order #${order.orderId} must still carry the PayPal order id it was captured against. Every later refund and webhook resolves the payment through it`,
        ).toBe(order.paypalOrderId);

        expect(
            metaString(wooOrder, '_dokan_paypal_payment_charge_captured'),
            `the parent order must be stamped _dokan_paypal_payment_charge_captured=yes. OrderManager::handle_order_complete_status() writes it BEFORE storing the capture data (Order/OrderManager.php:481) and every duplicate-capture guard in the module reads it, so a missing value means a redelivered webhook would capture and credit the vendor a second time`,
        ).toBe('yes');

        const merchants = await merchantsBySubOrder(order.orderId);
        await assertPayPalSideCapture('PP-CHK-06', order.paypalOrderId, merchants);
        await assertVendorSplit('PP-CHK-06', order.orderId, { [VENDOR_ID]: PAYPAL_MERCHANTS.vendor1 });

        const notes = await getOrderNotes(order.orderId);
        expect(
            notes.some(note => note.includes(order.paypalOrderId)),
            `an order note must record the PayPal capture on #${order.orderId}. OrderManager::handle_order_complete_status() adds "Order %s payment is completed via %s (PayPal Sandbox Order ID: %s)" (Order/OrderManager.php:487-496); without it a support agent looking at this order has nothing tying it to the money. Notes: ${JSON.stringify(notes ?? null)}`,
        ).toBe(true);

        log.success(`PP-CHK-06: WooCommerce order #${order.orderId} was really paid through PayPal order ${order.paypalOrderId} (approval steps: ${order.approvalSteps.join(' -> ')}).`);
    }

    async ppChk07({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_BUYER_LOGIN, BUYER_SKIP);

        const gate = await payableGate('vendor1');
        test.skip(gate !== null, gate ?? '');

        const { order, blocker } = await captureSingleVendorOrder(browser);
        test.skip(blocker !== null, `no approved order exists to follow the post-approval redirect for. ${String(blocker)}`);
        if (!order) {
            return;
        }

        // Read from the page PayPal actually redirected to, in the session that made the payment —
        // "follow the post-approval redirect" is the case, so re-navigating to it afterwards would be
        // testing a different journey.
        expect(
            order.thankYou.url,
            `PayPal must land the shopper on WooCommerce's order-received page. The return_url is built at PaymentMethods/PayPal.php:290-296 and carries button_type / wc_payment_method, which OrderController::maybe_process_order_redirect() requires before it will capture (Order/OrderController.php:490-496) — a shopper who lands anywhere else has approved a payment that the store will never capture. Landed on: ${order.thankYou.url}`,
        ).toContain('order-received');

        const wooOrder = await readWooOrder(order.orderId);
        const title = await gatewayTitle();
        const pageText = order.thankYou.text.replace(/\s+/g, ' ');

        expect(
            pageText,
            `the order-received page must show the order number ${order.orderId}. Rendered text (first 600 chars): ${pageText.slice(0, 600)}`,
        ).toContain(String(order.orderId));

        expect(
            pageText,
            `the order-received page must show the order total ${String(wooOrder.total)} — this is the figure the shopper checks against their PayPal receipt, and a page that omits or contradicts it is how a "was I charged twice?" ticket starts. Rendered text (first 600 chars): ${pageText.slice(0, 600)}`,
        ).toContain(String(wooOrder.total));

        expect(
            pageText,
            `the order-received page must name the payment method "${title}" (the gateway's stored title). Rendered text (first 600 chars): ${pageText.slice(0, 600)}`,
        ).toContain(title);

        expect(
            order.thankYou.errorCount,
            'the order-received page must render no error notice after a successful capture. An error banner on the page that confirms a completed payment tells the shopper their money may not have gone through, which is the one moment a store cannot afford to be ambiguous',
        ).toBe(0);

        expect(
            wooOrder.status,
            `the order behind the thank-you page must be paid, not merely displayed. Status: ${String(wooOrder.status)}`,
        ).toMatch(/^(processing|completed|on-hold)$/);

        log.success(`PP-CHK-07: the post-approval redirect landed on ${order.thankYou.url} showing order #${order.orderId}, total ${String(wooOrder.total)}, method "${title}".`);
    }

    async ppChk08({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);

        const gate = await payableGate('vendor1');
        test.skip(gate !== null, gate ?? '');

        await useStandardButton();

        const outcome = await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
            await gotoClassicCheckout(page);

            const placed = await placeClassicOrder(page);
            createdOrderIds.push(placed.orderId);

            // The cancel link belongs to PayPal's page. Navigating straight to the module's own
            // cancel_url instead would test WooCommerce's cancel handler and say nothing about what a
            // shopper who backs out on paypal.com experiences.
            const cancelSelector = await firstVisible(page, [PAYPAL_UI.cancel, PAYPAL_UI.captcha, PAYPAL_UI.otp], 120_000);
            if (cancelSelector === null || cancelSelector !== PAYPAL_UI.cancel) {
                return {
                    placed,
                    blocker:
                        cancelSelector === null
                            ? `PayPal's approval page offered no "Cancel and return" control within 120s, so a shopper's cancellation cannot be driven from PayPal's own page. ${await paypalDiagnostics(page)}`
                            : `PayPal answered with a challenge before any cancel control could be used. ${await paypalDiagnostics(page)}`,
                    landedOn: page.url(),
                    cartItems: '',
                };
            }

            await page.locator(PAYPAL_UI.cancel).first().click();
            await page.waitForURL(url => url.host === SITE_HOST, { timeout: 120_000 }).catch(() => undefined);
            await page.waitForLoadState('networkidle').catch(() => undefined);

            return {
                placed,
                blocker: null,
                landedOn: page.url(),
                cartItems: (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '',
            };
        });

        test.skip(
            outcome.blocker !== null,
            `the buyer-cancellation half of this case needs PayPal's own cancel control, which was not reachable. The order WAS created and the shopper WAS sent to PayPal, so nothing about the product is implied. ${String(outcome.blocker)}`,
        );

        expect(
            outcome.landedOn,
            `cancelling on PayPal must return the shopper to ${SITE_HOST}, using the cancel_url the module supplied (PaymentMethods/PayPal.php:297). A shopper stranded on paypal.com after backing out has no way back to their cart. Landed on: ${outcome.landedOn}`,
        ).toContain(SITE_HOST);

        expect(
            outcome.cartItems,
            `the cart must still hold product ${vendor1ProductId} after a cancellation — the shopper changed their mind about paying, not about buying. An emptied cart forces them to rebuild the order from scratch, and WooCommerce only clears it once an order is actually paid (wc_clear_cart_after_payment()). Persistent cart: ${String(outcome.cartItems).slice(0, 300)}`,
        ).toMatch(new RegExp(`"product_id";(i:${vendor1ProductId};|s:\\d+:"${vendor1ProductId}")`));

        const wooOrder = await readWooOrder(outcome.placed.orderId);
        expect(
            wooOrder.status,
            `order #${outcome.placed.orderId} must NOT be paid after a cancellation. Status: ${String(wooOrder.status)}`,
        ).toMatch(/^(cancelled|pending|failed|checkout-draft)$/);

        expect(
            metaString(wooOrder, '_dokan_paypal_payment_capture_id'),
            `no capture id may exist on order #${outcome.placed.orderId} — the buyer cancelled, so nothing was captured and any capture id here would mean the store recorded a payment that PayPal never took`,
        ).toBeNull();

        const paypalOrder = await getPayPalOrder(outcome.placed.paypalOrderId);
        expect(
            paypalOrder.status,
            `PayPal's own copy of order ${outcome.placed.paypalOrderId} must not be COMPLETED after a cancellation. A COMPLETED order here means the shopper's money was taken on a journey they explicitly abandoned. Status: ${String(paypalOrder.status)}`,
        ).not.toBe('COMPLETED');
        expect(
            capturesOf(paypalOrder).length,
            `PayPal must hold no capture for a cancelled approval. Captures: ${JSON.stringify(capturesOf(paypalOrder).map(row => row.capture.id ?? null) ?? null)}`,
        ).toBe(0);

        log.success(`PP-CHK-08: cancelling on PayPal returned to ${outcome.landedOn} with the cart intact and nothing captured.`);
    }

    async ppChk09({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_BUYER_LOGIN, BUYER_SKIP);

        const gate = await payableGate('both');
        test.skip(gate !== null, gate ?? '');

        const { order, blocker } = await captureMultiVendorOrder(browser);
        test.skip(blocker !== null, `the PayPal-hosted approval could not be completed, so no captured multi-vendor order exists to inspect. ${String(blocker)}`);
        if (!order) {
            return;
        }

        expect(
            order.childIds.length,
            `a two-vendor cart must be split into one sub order per vendor before the purchase units are built (PaymentMethods/PayPal.php:262-276). Without the split, both vendors' goods are paid to whichever merchant the single unit names. Parent #${order.orderId}, children: ${JSON.stringify(order.childIds ?? null)}`,
        ).toBe(2);

        const parent = await readWooOrder(order.orderId);
        const subOrders = await Promise.all(order.childIds.map(async id => ({ id, order: await readWooOrder(id) })));

        const captureIds: string[] = [];
        for (const sub of subOrders) {
            const captureId = metaString(sub.order, '_dokan_paypal_payment_capture_id');
            expect(
                captureId,
                `sub order #${sub.id} must carry its OWN _dokan_paypal_payment_capture_id. This is the DOK-018 regression surface: the block checkout splits the parent a second time when the order is placed, deleting the sub orders the capture was written onto, and OrderManager::restore_capture_payment_data() (Order/OrderManager.php:642-714) exists to put the data back. Without the capture id on the sub order, this vendor's share can never be refunded — Refund has nothing to reverse — and the gateway fee cannot be reversed either`,
            ).not.toBeNull();
            if (captureId) {
                captureIds.push(captureId);
            }
        }

        expect(
            new Set(captureIds).size,
            `each vendor's sub order must carry a DIFFERENT capture id — PayPal captures each purchase unit separately, so a shared id means one vendor's capture was copied onto another's order and a refund against either would reverse the wrong vendor's money. Capture ids: ${JSON.stringify(captureIds ?? null)}`,
        ).toBe(captureIds.length);

        const byVendor = metaMap(parent)['_dokan_paypal_capture_data_by_vendor'];
        expect(
            byVendor,
            `the parent order #${order.orderId} must carry the vendor-keyed copy _dokan_paypal_capture_data_by_vendor. It is keyed by VENDOR rather than by sub order precisely because a sub order id does not survive a re-split but a vendor id does (Order/OrderManager.php:509-512, 604-607); without it, restore_capture_payment_data() has nothing to restore from and the capture ids are lost for good. Parent meta value: ${JSON.stringify(byVendor ?? null)}`,
        ).toBeTruthy();

        const byVendorMap = (byVendor ?? {}) as Record<string, { capture_id?: string }>;
        for (const vendorId of [VENDOR_ID, VENDOR2_ID]) {
            const recorded = byVendorMap[vendorId]?.capture_id;
            expect(
                recorded,
                `the parent's vendor-keyed capture data must cover vendor ${vendorId}. Recorded: ${JSON.stringify(byVendor ?? null)}`,
            ).toBeTruthy();
            expect(
                captureIds,
                `the capture id the parent records for vendor ${vendorId} must be one of the ids actually written to the sub orders — a parent copy that disagrees with the sub orders is worse than no copy, because restore_capture_payment_data() would write the disagreement onto a rebuilt sub order. Parent copy: ${JSON.stringify(byVendor ?? null)}, sub order ids: ${JSON.stringify(captureIds ?? null)}`,
            ).toContain(String(recorded));
        }

        const merchants = await merchantsBySubOrder(order.orderId);
        await assertPayPalSideCapture('PP-CHK-09', order.paypalOrderId, merchants);
        await assertVendorSplit('PP-CHK-09', order.orderId, { [VENDOR_ID]: PAYPAL_MERCHANTS.vendor1, [VENDOR2_ID]: PAYPAL_MERCHANTS.vendor2 });

        log.success(`PP-CHK-09: both sub orders of #${order.orderId} carry their own capture id (${captureIds.join(', ')}) and the parent carries the vendor-keyed copy.`);
    }

    async ppChk10({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_BUYER_LOGIN, BUYER_SKIP);

        const gate = await payableGate('vendor1');
        test.skip(gate !== null, gate ?? '');

        const { order, blocker } = await captureSingleVendorOrder(browser);
        test.skip(blocker !== null, `no captured order exists whose notes could be read. ${String(blocker)}`);
        if (!order) {
            return;
        }

        const wooOrder = await readWooOrder(order.orderId);
        const captureId = metaString(wooOrder, '_dokan_paypal_payment_capture_id');
        const notes = await getOrderNotes(order.orderId);
        const notesText = JSON.stringify(notes ?? null);

        expect(
            notes.some(note => note.includes(order.paypalOrderId)),
            `a note must name the PayPal order id ${order.paypalOrderId} (Order/OrderManager.php:487-496). The order notes are the only audit trail a support agent or an accountant has linking a WooCommerce order to the money at PayPal. Notes: ${notesText}`,
        ).toBe(true);

        expect(
            captureId,
            `the captured order must carry a capture id before its note can be checked. Order #${order.orderId} meta: ${JSON.stringify(metaMap(wooOrder) ?? null).slice(0, 400)}`,
        ).not.toBeNull();

        expect(
            notes.some(note => captureId !== null && note.includes(captureId)),
            `a note must name the PayPal transaction (capture) id ${String(captureId)} — OrderManager::store_capture_payment_data() adds "PayPal Sandbox Transaction ID: %s" per captured order (Order/OrderManager.php:566-573). This is the id a store owner pastes into PayPal to find the transaction; without it, reconciling a disputed payment means guessing. Notes: ${notesText}`,
        ).toBe(true);

        expect(
            notes.some(note => /processing fee/i.test(note)),
            `a note must record the PayPal processing fee (Order/OrderManager.php:534-537). It is the money the vendor did NOT receive out of what the shopper paid, so a vendor querying their earnings has no explanation for the difference without it. Notes: ${notesText}`,
        ).toBe(true);

        log.success(`PP-CHK-10: order #${order.orderId} carries the PayPal order-id, transaction-id and processing-fee notes.`);
    }

    async ppChk11({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_BUYER_LOGIN, BUYER_SKIP);

        const gate = await payableGate('vendor1');
        test.skip(gate !== null, gate ?? '');

        await useStandardButton();

        const outcome = await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
            await gotoClassicCheckout(page);

            const placed = await placeClassicOrder(page);
            createdOrderIds.push(placed.orderId);

            // Hold the return so the APPROVED-but-uncaptured state can be observed. Everything that
            // lets the browser arrive at the order-received page has already captured.
            const interceptor = await interceptReturn(page);
            const approval = await approveOnPayPal(page);
            if (!approval.approved) {
                await interceptor.release();
                return { placed, blocker: approval.blocker, approvedStatus: null as string | null, firstVisit: '', secondVisit: '' };
            }

            const returnUrl = await waitForReturnAttempt(page, interceptor);
            const approvedStatus = String((await getPayPalOrder(placed.paypalOrderId)).status ?? '');
            await interceptor.release();

            // Two independent trips through the module's capture entry point, exactly as a shopper
            // double-clicking their browser's reload on the return URL produces.
            await page.goto(returnUrl, { waitUntil: 'domcontentloaded' });
            await page.waitForLoadState('networkidle').catch(() => undefined);
            const firstVisit = page.url();

            await page.goto(returnUrl, { waitUntil: 'domcontentloaded' });
            await page.waitForLoadState('networkidle').catch(() => undefined);
            const secondVisit = page.url();

            return { placed, blocker: null, approvedStatus, firstVisit, secondVisit };
        });

        test.skip(outcome.blocker !== null, `the PayPal-hosted approval could not be completed, so there is no approved order to capture twice. ${String(outcome.blocker)}`);

        expect(
            outcome.approvedStatus,
            `PayPal's copy of order ${outcome.placed.paypalOrderId} must read APPROVED once the buyer has approved and before the store has captured. Any other value means the precondition of this case — "an approved but not-yet-captured PayPal order" — was never reached, so "exactly one capture" below would be measuring something else. Status: ${String(outcome.approvedStatus)}`,
        ).toBe('APPROVED');

        const paypalOrder = await getPayPalOrder(outcome.placed.paypalOrderId);
        const captures = capturesOf(paypalOrder);
        expect(
            captures.length,
            `PayPal must hold EXACTLY ONE capture for order ${outcome.placed.paypalOrderId} after the return URL was visited twice. A second capture is a second charge against the buyer. Captures: ${JSON.stringify(captures.map(row => ({ id: row.capture.id ?? null, status: row.capture.status ?? null, amount: row.capture.amount?.value ?? null })) ?? null)}. Visits landed on ${outcome.firstVisit} and ${outcome.secondVisit}`,
        ).toBe(1);

        const childIds = await dbUtils.getChildOrderIds(outcome.placed.orderId);
        const payableIds = childIds.length > 0 ? childIds : [outcome.placed.orderId];
        const balanceRows = await vendorBalanceRows(payableIds);

        expect(
            balanceRows.length,
            `exactly one dokan_vendor_balance credit may exist for order #${outcome.placed.orderId}. A second row credits the vendor twice for one payment, and the marketplace pays out money it never received. The guard is OrderManager::insert_vendor_withdraw_balance()'s "already inserted" check plus is_charge_captured() (Order/OrderManager.php:476-482, 772-788). Rows: ${JSON.stringify(balanceRows ?? null)}`,
        ).toBe(payableIds.length);

        const totalCredited = balanceRows.reduce((sum, row) => sum + money(row.credit), 0);
        const parent = await readWooOrder(outcome.placed.orderId);
        expect(
            totalCredited <= money(parent.total) + 0.01,
            `the vendor was credited ${totalCredited.toFixed(2)} for an order totalling ${String(parent.total)}. Crediting more than the shopper paid is the exact failure a double capture produces, and it is money the marketplace has to find from somewhere. Rows: ${JSON.stringify(balanceRows ?? null)}`,
        ).toBe(true);

        await assertVendorSplit('PP-CHK-11', outcome.placed.orderId, { [VENDOR_ID]: PAYPAL_MERCHANTS.vendor1 });

        log.success(`PP-CHK-11: two visits to the return URL of order #${outcome.placed.orderId} produced exactly one PayPal capture and one vendor credit.`);
    }

    async ppChk12({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_BUYER_LOGIN, BUYER_SKIP);

        const gate = await payableGate('vendor1');
        test.skip(gate !== null, gate ?? '');

        const { order, blocker } = await captureSingleVendorOrder(browser);
        test.skip(blocker !== null, `no completed order exists to navigate back from. ${String(blocker)}`);
        if (!order) {
            return;
        }

        // The return to the checkout and the resubmit attempt were performed in the SAME browsing
        // session that made the payment — a reconstructed history would not be the shopper's own
        // journey back.
        const newOrders = order.orderIdsAfterBack.filter(id => !order.orderIdsBefore.includes(id) && id !== order.orderId);
        const resubmitText = JSON.stringify(order.backResubmit ?? null).slice(0, 500);

        // (1) Where the resubmit was aimed. A POST evaluated on paypal.com cannot create a WooCommerce
        // order by any route, so without this the "no duplicate order" claim below would be a statement
        // about PayPal's page rather than about the store's duplicate-submission handling.
        expect(
            order.backLandedOn,
            `PP-CHK-12: the resubmit must be attempted against the STORE checkout, not against paypal.com. The shopper's post-approval history is [checkout, paypal.com, order-received], so anything that leaves the session on PayPal's own domain makes every duplicate-order assertion below vacuous — window.wc_checkout_params does not exist there and no checkout POST is possible at all. Landed on: ${order.backLandedOn}`,
        ).toContain(SITE_HOST);

        // (2) The product behaviour that actually prevents the duplicate: WooCommerce empties the cart
        // the moment the order is paid (wc_clear_cart_after_payment()), so the returning shopper has
        // nothing left to check out with. This is read from WooCommerce's OWN persistent-cart row, not
        // from anything this file wrote after the payment.
        expect(
            order.postPaymentCart,
            `PP-CHK-12: WooCommerce must empty the persistent cart once the order is paid (wc_clear_cart_after_payment()). A cart still holding product ${vendor1ProductId} after a completed PayPal capture is exactly what lets the shopper go back to the checkout and re-place — and re-pay for — goods they have already bought. Persistent cart after the capture: ${String(order.postPaymentCart).slice(0, 300)}. The checkout the shopper returned to (${order.backLandedOn}) rendered ${order.checkoutFormCount} order form(s)`,
        ).not.toMatch(new RegExp(`"product_id";(i:${vendor1ProductId};|s:\\d+:"${vendor1ProductId}")`));

        // (3) What the store answered the resubmitted checkout with. On a working product the form is
        // gone with the cart and this reads as an absent result; the moment (2) regresses, this becomes
        // a live measurement of WC_Checkout::process_checkout()'s own refusal.
        expect(
            order.backResubmit.result ?? null,
            `PP-CHK-12: WooCommerce must NOT answer the resubmitted checkout with result=success after the order has already been paid through PayPal — that response is what makes the browser start a second payment for goods already bought. The resubmit was posted from ${order.backLandedOn}, where ${order.checkoutFormCount} order form(s) were rendered. Response: ${resubmitText}`,
        ).not.toBe('success');

        expect(
            newOrders,
            `going back to the checkout after a completed PayPal payment and resubmitting must not create another order. The shopper has already paid; a second order is a second charge waiting to happen and a second set of vendor earnings. Orders before: ${JSON.stringify(order.orderIdsBefore ?? null)}, after: ${JSON.stringify(order.orderIdsAfterBack ?? null)}, the paid order: ${order.orderId}. The back navigation landed on ${order.backLandedOn} and the resubmit answered: ${JSON.stringify(order.backResubmit ?? null).slice(0, 500)}`,
        ).toEqual([]);

        const paypalOrder = await getPayPalOrder(order.paypalOrderId);
        expect(
            capturesOf(paypalOrder).length,
            `PayPal must still hold exactly one capture for order ${order.paypalOrderId} after the back-and-resubmit attempt. Captures: ${JSON.stringify(capturesOf(paypalOrder).map(row => row.capture.id ?? null) ?? null)}`,
        ).toBe(1);

        const childIds = await dbUtils.getChildOrderIds(order.orderId);
        const balanceRows = await vendorBalanceRows(childIds.length > 0 ? childIds : [order.orderId]);
        expect(
            balanceRows.length,
            `the vendor's ledger must be untouched by the resubmit attempt — one credit for one payment. Rows: ${JSON.stringify(balanceRows ?? null)}`,
        ).toBe(childIds.length > 0 ? childIds.length : 1);

        log.success(`PP-CHK-12: the back-and-resubmit attempt after paying order #${order.orderId} created no second order (landed on ${order.backLandedOn}).`);
    }

    async ppChk13({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        await useSmartButton();

        const couponCode = `pp-chk-13-${Date.now()}`;
        const couponId = await adminRequest(async ctx => {
            const res = await ctx.post(`${SERVER_URL}/wc/v3/coupons`, {
                data: {
                    code: couponCode,
                    discount_type: 'percent',
                    amount: '100',
                    individual_use: true,
                    product_ids: [Number(virtualProductId)],
                },
            });
            const body = (await res.json().catch(() => ({}))) as { id?: number; message?: string };
            expect(
                body.id,
                `the 100%-off coupon must be created before this case can produce a zero total. WooCommerce answered HTTP ${res.status()}: ${String(body.message ?? '')}`,
            ).toBeTruthy();
            return String(body.id ?? '');
        });
        createdCouponIds.push(couponId);

        const outcome = await withCustomer(browser, async (page, paypal) => {
            // Virtual, so there is no shipping line and no shipping tax: this store applies 5% tax to
            // shipping, so a physical product would leave a non-zero total even at 100% off and the case
            // would silently stop being about a zero total at all.
            await stockCart(paypal, [virtualProductId]);
            await gotoClassicCheckout(page);

            await expect(
                page.locator(CLASSIC.radio),
                'positive baseline: the gateway must be offered BEFORE the coupon is applied. Without it, "PayPal is absent at a zero total" is indistinguishable from "PayPal is absent, full stop"',
            ).toBeAttached({ timeout: 30_000 });

            await page.locator(CLASSIC.couponToggle).first().click();
            await page.locator(CLASSIC.couponInput).fill(couponCode);
            await page.locator(CLASSIC.couponApply).click();
            await waitForCheckoutSettled(page);

            const totalText = await page.locator(CLASSIC.orderTotal).last().innerText().catch(() => '');
            const gatewayCount = await page.locator(CLASSIC.radio).count();
            const paymentListCount = await page.locator(CLASSIC.paymentMethods).count();

            const submitted = await submitClassicCheckout(page);
            return { totalText, gatewayCount, paymentListCount, submitted };
        });

        expect(
            outcome.totalText.replace(/[^0-9.,]/g, ''),
            `the coupon must actually reduce the cart to zero, or this case is not about a zero-total order at all. Order total rendered on the checkout: "${outcome.totalText}"`,
        ).toMatch(/^0([.,]0{1,2})?$/);

        expect(
            outcome.gatewayCount,
            `${PAYPAL_IDS.gateway} must not be offered for a zero-total cart. WooCommerce stops rendering payment methods once WC_Cart::needs_payment() is false, and a PayPal order for 0.00 would be rejected by PayPal anyway — offering it strands the shopper on a checkout that cannot complete. Payment-method lists rendered: ${outcome.paymentListCount}`,
        ).toBe(0);

        expect(
            outcome.submitted.result,
            `a zero-total order must still be placeable. WooCommerce skips payment entirely when nothing is owed, so a failure here means a fully discounted order cannot be completed by any means. Response: ${JSON.stringify(outcome.submitted ?? null).slice(0, 500)}`,
        ).toBe('success');

        // No gateway ran, so PaymentMethods/PayPal.php:345 never executed and there is no "id" key:
        // WooCommerce answers with its own plain shape, e.g.
        // {"result":"success","redirect":"http://localhost:9999/checkout/order-received/75/?key=wc_order_…"}.
        // The order id is only in that redirect, so read it from there when the key is absent.
        const zeroTotalRedirect = String(outcome.submitted.redirect ?? '');
        const orderId = String(outcome.submitted.id ?? '') || (zeroTotalRedirect.match(/order-received\/(\d+)/)?.[1] ?? '');
        expect(
            orderId,
            `the zero-total checkout must report the order it created, either as "id" or as the order-received redirect a shopper is sent to. Neither carried one, so the order cannot be read back and the "never reached PayPal" claim cannot be proven. Response: ${JSON.stringify(outcome.submitted ?? null).slice(0, 500)}`,
        ).not.toBe('');
        createdOrderIds.push(orderId);

        expect(
            outcome.submitted.paypal_order_id ?? null,
            `a zero-total checkout must carry NO paypal_order_id. PayPal::process_payment() only returns one (PaymentMethods/PayPal.php:347) when the gateway actually ran, so its presence means the module created a PayPal order for a cart that owes nothing. Response: ${JSON.stringify(outcome.submitted ?? null).slice(0, 500)}`,
        ).toBeNull();
        expect(
            `${String(outcome.submitted.paypal_redirect_url ?? '')} ${zeroTotalRedirect}`,
            `a zero-total checkout must send the shopper straight to order-received, never to a PayPal approve link — PayPal rejects a 0.00 purchase unit, so a shopper handed that link is stranded on an order that owes nothing. Response: ${JSON.stringify(outcome.submitted ?? null).slice(0, 500)}`,
        ).not.toContain('paypal.com');

        const wooOrder = await readWooOrder(orderId);
        expect(money(wooOrder.total), `the placed order must total zero. Order total: ${String(wooOrder.total)}`).toBe(0);
        expect(
            metaString(wooOrder, '_dokan_paypal_order_id'),
            `order #${orderId} must carry NO _dokan_paypal_order_id. A zero-total order that reached PayPal means the module created a payment for nothing — PayPal rejects a 0.00 purchase unit, so the shopper would see a failed checkout for an order that owes nothing`,
        ).toBeNull();
        expect(
            metaString(wooOrder, '_dokan_paypal_payment_capture_id'),
            `order #${orderId} must carry no capture id — there was nothing to capture`,
        ).toBeNull();

        log.success(`PP-CHK-13: the zero-total order #${orderId} was placed with no payment method offered and no PayPal order created.`);
    }

    async ppChk14({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_BUYER_LOGIN, BUYER_SKIP);

        const gate = await payableGate('vendor1');
        test.skip(gate !== null, gate ?? '');

        await useStandardButton();

        const outcome = await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
            await gotoClassicCheckout(page);

            const placed = await placeClassicOrder(page);
            createdOrderIds.push(placed.orderId);

            const interceptor = await interceptReturn(page);
            const approval = await approveOnPayPal(page);
            if (!approval.approved) {
                await interceptor.release();
                return { placed, blocker: approval.blocker, landedOn: '', pageText: '', stockAfter: null as ProductStock | null, zeroed: null as ProductStock | null };
            }

            const returnUrl = await waitForReturnAttempt(page, interceptor);
            await interceptor.release();

            // The stock change happens strictly between approval and capture, which is the window this
            // case is about: WooCommerce validated stock when the order was placed and does not look
            // again when the payment lands.
            // WooCommerce's own answer to the PUT is carried out and asserted AFTER the restore below:
            // an assertion thrown from inside `withCustomer` would skip the restore and leave the
            // shared product out of stock for every later case in this file.
            const zeroed = await adminRequest(async ctx => {
                const res = await ctx.put(`${SERVER_URL}/wc/v3/products/${vendor1ProductId}`, {
                    data: { manage_stock: true, stock_quantity: 0, stock_status: 'outofstock', backorders: 'no' },
                });
                return (await res.json().catch(() => null)) as ProductStock | null;
            });

            await page.goto(returnUrl, { waitUntil: 'domcontentloaded' });
            await page.waitForLoadState('networkidle').catch(() => undefined);

            // Read the inventory the CAPTURE left behind, before the restore below puts it back. This
            // is WooCommerce's own count as wc_maybe_reduce_stock_levels() left it, which is the only
            // place the oversell — if there is one — is visible.
            const stockAfter = await adminRequest(async ctx => {
                const res = await ctx.get(`${SERVER_URL}/wc/v3/products/${vendor1ProductId}?_fields=stock_quantity,stock_status`);
                return (await res.json().catch(() => null)) as ProductStock | null;
            });

            return {
                placed,
                blocker: null,
                landedOn: page.url(),
                pageText: (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' '),
                stockAfter,
                zeroed,
            };
        });

        // Stock is restored whatever the outcome — leaving the shared product out of stock would make
        // every later add-to-cart in this suite fail for a reason that has nothing to do with PayPal.
        // It happens AFTER the read above, or the post-capture inventory would never be observable.
        await adminRequest(async ctx => {
            await ctx.put(`${SERVER_URL}/wc/v3/products/${vendor1ProductId}`, {
                data: { manage_stock: false, stock_status: 'instock', backorders: 'no' },
            });
        });

        test.skip(outcome.blocker !== null, `the PayPal-hosted approval could not be completed, so the approval-to-capture window this case needs was never opened. ${String(outcome.blocker)}`);

        // The premise, taken from WooCommerce's own answer to the PUT rather than assumed from the fact
        // that a request was sent: the product really WAS out of stock when the return was replayed. A
        // PUT that did not take leaves the capture happening against an in-stock product, which would
        // make every claim below a statement about a healthy sale rather than about the oversell window.
        expect(
            outcome.zeroed?.stock_status ?? null,
            `PP-CHK-14: product ${vendor1ProductId} must be out of stock BEFORE the shopper's return is replayed, or this case is not exercising the approval-to-capture window at all. WooCommerce answered the stock-zeroing PUT with: ${JSON.stringify(outcome.zeroed ?? null)}`,
        ).toBe('outofstock');

        const paypalOrder = await getPayPalOrder(outcome.placed.paypalOrderId);
        const captures = capturesOf(paypalOrder);
        const wooOrder = await readWooOrder(outcome.placed.orderId);
        const captureId = metaString(wooOrder, '_dokan_paypal_payment_capture_id');
        const evidence = `PayPal order ${outcome.placed.paypalOrderId} status=${String(paypalOrder.status)}, captures=${JSON.stringify(captures.map(row => ({ id: row.capture.id ?? null, status: row.capture.status ?? null })) ?? null)}; WooCommerce order #${outcome.placed.orderId} status=${String(wooOrder.status)}, capture id=${String(captureId)}; landed on ${outcome.landedOn}`;

        // First, the invariant that must hold whichever way the product behaves: a payment PayPal took
        // must be recorded here, and an order marked paid must have a payment behind it. The
        // catalogue's own expectation — that the failure is surfaced to the shopper rather than
        // silently producing a paid order for unavailable stock — is asserted separately below, so a
        // store that captures, says nothing and oversells goes RED in the run report rather than into a
        // log line nobody reads.
        if (captures.length > 0) {
            expect(
                captureId,
                `PayPal captured money for order #${outcome.placed.orderId} but WooCommerce recorded no capture id. That is a payment taken from the buyer with nothing on this side pointing at it: it cannot be refunded, disbursed or reconciled, and the vendor is never credited. ${evidence}`,
            ).not.toBeNull();
            expect(
                wooOrder.status,
                `PayPal captured money for order #${outcome.placed.orderId}, so the order must be paid. An unpaid order with a completed capture behind it is money the store has taken and does not know about. ${evidence}`,
            ).toMatch(/^(processing|completed|on-hold)$/);
        } else {
            expect(
                wooOrder.status,
                `PayPal holds no capture for order ${outcome.placed.paypalOrderId}, so the WooCommerce order must NOT be marked paid — a paid order with no payment behind it ships goods for free. ${evidence}`,
            ).not.toMatch(/^(processing|completed)$/);
        }

        // The catalogue's own expectation, asserted rather than logged: either the shopper is TOLD the
        // goods are unavailable, or the store does not treat the order as paid. One of the two must
        // hold. Both halves are the product's output — `pageText` is the order-received page the module
        // rendered in the real redirected session, `wooOrder.status` is WooCommerce's.
        const surfaced = /out of stock|no longer available|insufficient stock|sorry/i.test(outcome.pageText);
        const paid = /^(processing|completed|on-hold)$/.test(String(wooOrder.status));
        expect(
            surfaced || !paid,
            `PP-CHK-14: the product went out of stock between the buyer's approval and the capture, and the store neither told the shopper nor withheld the payment. The order-received page says nothing about stock (searched for /out of stock|no longer available|insufficient stock|sorry/i) while order #${outcome.placed.orderId} was marked ${String(wooOrder.status)} against a completed PayPal capture. Neither WC_Checkout nor OrderController::maybe_process_order_redirect() (Order/OrderController.php:489-531) re-validates stock at capture time, so the shopper is charged for goods the store cannot ship and the vendor is credited for them. Page text (first 600 chars): ${outcome.pageText.slice(0, 600)}. ${evidence}`,
        ).toBe(true);

        // Independent of the shopper-facing claim, and not satisfiable by a notice: whatever the store
        // decides to say, it must not drive its own inventory below zero for a product it was already
        // holding at zero.
        const stockCount = outcome.stockAfter?.stock_quantity ?? null;
        expect(
            stockCount,
            `PP-CHK-14: WooCommerce's own stock count for product ${vendor1ProductId} must be readable after the capture — it is the figure the oversell claim below is made from, and an unreadable one means that claim was never measured rather than that it held. GET /wc/v3/products/${vendor1ProductId}?_fields=stock_quantity,stock_status answered: ${JSON.stringify(outcome.stockAfter ?? null)}. ${evidence}`,
        ).not.toBeNull();

        expect(
            Number(stockCount),
            `PP-CHK-14: capturing an order for a product held at stock_quantity 0 must not drive inventory negative — a negative count is the store silently overselling, and it is the figure every later add-to-cart, report and vendor stock alert is read from. Stock after the capture: ${JSON.stringify(outcome.stockAfter ?? null)}. ${evidence}`,
        ).toBeGreaterThanOrEqual(0);

        log.success(`PP-CHK-14: out-of-stock at capture time left a consistent record and a non-negative inventory. ${evidence}`);
    }

    async ppChk15({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_BUYER_LOGIN, BUYER_SKIP);

        const gate = await payableGate('vendor1');
        test.skip(gate !== null, gate ?? '');

        await useStandardButton();

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        let outcome: { placed: PlacedOrder; blocker: string | null; landedOn: string } | null = null;
        try {
            const paypal = new PayPalMarketplacePage(page);
            await stockCart(paypal, [vendor1ProductId]);
            await gotoClassicCheckout(page);

            const placed = await placeClassicOrder(page);
            createdOrderIds.push(placed.orderId);

            const interceptor = await interceptReturn(page);
            const approval = await approveOnPayPal(page);
            if (!approval.approved) {
                await interceptor.release();
                outcome = { placed, blocker: approval.blocker, landedOn: '' };
            } else {
                const returnUrl = await waitForReturnAttempt(page, interceptor);
                await interceptor.release();

                // The session is destroyed exactly where a real timeout would destroy it: after PayPal
                // has the buyer's approval and before the store hears about it. Clearing cookies takes
                // the WooCommerce session cookie and the login cookie with it, so the return arrives as
                // an anonymous visitor with no cart and no session.
                await ctx.clearCookies();

                await page.goto(returnUrl, { waitUntil: 'domcontentloaded' });
                await page.waitForLoadState('networkidle').catch(() => undefined);
                outcome = { placed, blocker: null, landedOn: page.url() };
            }
        } finally {
            await page.close();
            await ctx.close();
        }

        test.skip(outcome?.blocker != null, `the PayPal-hosted approval could not be completed, so the session could not be lost between approval and return. ${String(outcome?.blocker)}`);
        expect(outcome, 'the session-loss scenario must have produced an order to inspect').not.toBeNull();
        if (!outcome) {
            return;
        }

        const paypalOrder = await getPayPalOrder(outcome.placed.paypalOrderId);
        const captures = capturesOf(paypalOrder);
        const wooOrder = await readWooOrder(outcome.placed.orderId);
        const captureId = metaString(wooOrder, '_dokan_paypal_payment_capture_id');
        const evidence = `PayPal order ${outcome.placed.paypalOrderId} status=${String(paypalOrder.status)}, captures=${JSON.stringify(captures.map(row => ({ id: row.capture.id ?? null, status: row.capture.status ?? null })) ?? null)}; WooCommerce order #${outcome.placed.orderId} status=${String(wooOrder.status)}, capture id=${String(captureId)}; the return landed on ${outcome.landedOn}`;

        if (captures.length > 0) {
            // maybe_process_order_redirect() resolves the order from the `key` query arg and holds no
            // session state (Order/OrderController.php:500-526), so a lost session must not stop the
            // capture from being recorded. If it does, the buyer has paid into a void.
            expect(
                captureId,
                `PayPal captured money for order #${outcome.placed.orderId} but WooCommerce recorded no capture id after the shopper's session was lost. That is a captured-but-unrecorded payment — the exact outcome this case exists to rule out. It cannot be refunded, the vendor is never credited, and nothing in the admin shows the money arrived. ${evidence}`,
            ).not.toBeNull();
            expect(
                wooOrder.status,
                `the order must be paid once PayPal has captured, session or no session. ${evidence}`,
            ).toMatch(/^(processing|completed|on-hold)$/);
            await assertVendorSplit('PP-CHK-15', outcome.placed.orderId, { [VENDOR_ID]: PAYPAL_MERCHANTS.vendor1 });
            log.success(`PP-CHK-15: the capture completed and was fully recorded despite the lost session. ${evidence}`);
        } else {
            // The clean-failure branch: nothing captured, so nothing may be marked paid.
            expect(
                wooOrder.status,
                `PayPal holds no capture, so order #${outcome.placed.orderId} must not be marked paid — an order treated as paid with no payment behind it ships goods nobody paid for. ${evidence}`,
            ).not.toMatch(/^(processing|completed)$/);
            expect(
                captureId,
                `no capture happened, so no capture id may be recorded. ${evidence}`,
            ).toBeNull();
            log.warn(`PP-CHK-15: the lost session prevented the capture entirely; the order failed cleanly with nothing captured and nothing recorded. ${evidence}`);
        }
    }
}
