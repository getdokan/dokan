import { HAS_APPROVAL_ACTOR } from './paypalMarketplaceShared';
import { test, expect, request } from '@utils/test';
import type { Browser, Page } from '@utils/test';
import { BASE_URL, SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { PayPalMarketplacePage, PAYPAL_IDS, PAYPAL_BUYER, withCustomer, stockCartWithProof, waitForCheckoutSettled, selectClassicPayPal as selectClassicPayPalWithMessages, submitClassicCheckout, buyerCredentialFault } from './paypalMarketplacePage';
import { USE_CARD_CAPTURE, announceCaptureRoute, openCardGates, restoreCardGates, payWithCardOnClassicCheckout } from './paypalMarketplaceCardCheckout';
import { adminAuth, VENDOR_ID, VENDOR2_ID, CUSTOMER_ID, PAYPAL_MERCHANTS, hasCredentials, HAS_REAL_MERCHANTS, ensurePayPalConfigured, getPayPalStatus, seedPayPalConnectedVendor, getBothMerchantConsents, isPayableMerchant, ensureCustomerAddress, ensureVendorStoreAddress, ensureClassicCheckoutPage, getOrderNotes, setOrderMeta, setOrderStatus, readPayPalOrder } from './helpers';
import type { PayPalAmount } from './helpers';

/* Selectors live on the page object (SKILL non-negotiable #1: selectors belong in
 * `<slug>Page.ts`). These aliases keep the existing in-file names readable. */
export const CLASSIC = PayPalMarketplacePage.classic;

/**
 * PayPal Marketplace — DISBURSEMENT (PP-DIS-01 … PP-DIS-14).
 *
 * ⚠️ THIS FILE MOVES REAL SANDBOX MONEY. Twelve of its fourteen cases place a WooCommerce order,
 * drive a real buyer approval on PayPal's own domain, and let the module capture the payment against
 * live sandbox merchant accounts. It must NOT be run without the separate money-batch approval the
 * handoff describes (§8). Nothing here simulates a capture, and nothing here writes the meta or the
 * ledger row it then asserts on — if a capture cannot be reached the case FAILS or SKIPS with the
 * reason named, it never passes.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 * What "disbursement" actually is in this module — read from the source, not assumed
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *  - The setting is `disbursement_mode` with THREE values (templates/admin-gateway-settings.php:141-153):
 *    `INSTANT`, `ON_ORDER_COMPLETE`, `DELAYED`. `Helper::get_disbursement_mode()` (Helper.php:763-768)
 *    falls back to `INSTANT` when unset.
 *
 *  - PayPal only ever sees TWO of them. `OrderManager::make_purchase_unit_data()` sends
 *    `payment_instruction.disbursement_mode = get_disbursement_mode() !== 'INSTANT' ? 'DELAYED' : 'INSTANT'`
 *    (OrderManager.php:209). `ON_ORDER_COMPLETE` is entirely a Dokan-side distinction — PP-DIS-10.
 *
 *  - The per-order record is `_dokan_paypal_payment_disbursement_mode`, written by
 *    `PayPal::process_payment()` on each sub order in the SAME loop that builds that sub order's
 *    purchase unit (PaymentMethods/PayPal.php:273-275). Its presence on a row is therefore evidence
 *    that the row was really turned into a payable unit, which is why every case below reads it
 *    rather than reading the site-wide setting back.
 *
 *  - Release is decided at capture time by `OrderManager::insert_vendor_withdraw_balance()`
 *    (OrderManager.php:762-771): mode `INSTANT` inserts the vendor's balance row immediately; anything
 *    else PARKS it — the payload is stored as `_dokan_paypal_payment_withdraw_data` and
 *    `_dokan_paypal_payment_withdraw_balance_added` is set to `no`, with NO ledger row.
 *
 *  - Parked funds are released by exactly two paths, and they are mutually exclusive by design:
 *      • `ON_ORDER_COMPLETE` → `OrderController::order_status_changed()` (OrderController.php:342-373),
 *        on the transition to `completed`, guarded by `'yes' === _dokan_paypal_payment_withdraw_balance_added`.
 *      • `DELAYED` → the daily `dokan_paypal_mp_daily_schedule` cron → `disburse_delayed_payment()`
 *        (OrderController.php:382-417) → a `WC_Order_Query` whose meta filter matches the LITERAL
 *        string `DELAYED` (OrderController.php:430-443) → the `DelayDisburseFund` background process
 *        (BackgroundProcess/DelayDisburseFund.php:84-115).
 *    Both funnel into `OrderManager::_disburse_payment()` (OrderManager.php:887-923), which calls
 *    PayPal's REFERENCED PAYOUT API and only inserts the ledger row when PayPal accepts.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 * The oracle these cases assert against
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * An order reaching `processing` proves nothing about who was paid. Every money case here asserts:
 *
 *   1. order total  ==  vendor net + admin commission (platform fee) + PayPal gateway fee
 *      — read from the values the PRODUCT wrote out of PayPal's capture response
 *      (`_dokan_paypal_payment_processing_fee`, `_dokan_paypal_payment_platform_fee`, and the parked
 *      or inserted withdraw amount, which is PayPal's `seller_receivable_breakdown.net_amount`).
 *   2. each purchase unit's `payee.merchant_id` is that vendor's OWN merchant id, read back from
 *      PayPal over `GET /v2/checkout/orders/{id}` — the purchase units are never persisted
 *      WordPress-side, so PayPal's copy is the only record of what was really requested.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 * Traps already paid for elsewhere in this suite, honoured here
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 *  - Never `test.describe.serial`, never the `@serial` tag (playwright.config.ts:13 grepInverts it in
 *    BOTH lanes); a file already runs sequentially in one worker.
 *  - Never `test.skip()` inside `beforeAll` — it silently voids the whole describe.
 *  - Assertion messages are built EAGERLY: every `JSON.stringify` is guarded with `?? null`.
 *  - `request.newContext()` with no `extraHTTPHeaders` INHERITS the shared config's WordPress admin
 *    Basic auth. It is set EXPLICITLY for paypal.com and blanked for wp-cron.php.
 *  - This site has taxes ON (5%, `tax_based_on = shipping`, applied to shipping, prices exclusive),
 *    so no total is ever hardcoded — every figure is read back from the server.
 *  - WooCommerce hides the payment radio when only ONE gateway is available and covers `#order_review`
 *    with a blockUI overlay during `update_checkout`; the label is clicked after the overlay detaches.
 *  - The module hides `#place_order` when its gateway is selected and `button_type` is `smart`, so the
 *    classic order is placed by POSTing the serialized `form.checkout`, exactly as
 *    `assets/src/js/paypal-checkout.js:36-44` does.
 */

/* ------------------------------------------------------------------ */
/* Identity — settings keys, metas and tables                          */
/* ------------------------------------------------------------------ */

export const SETTINGS_OPTION = 'woocommerce_dokan_paypal_marketplace_settings';

export const META = {
    /** Written per sub order in the purchase-unit loop (PaymentMethods/PayPal.php:273-275). */
    disbursementMode: '_dokan_paypal_payment_disbursement_mode',
    /** 'yes' once the vendor ledger row exists, 'no' while the funds are parked. */
    balanceAdded: '_dokan_paypal_payment_withdraw_balance_added',
    /** The parked payload: vendor_id / order_id / amount (OrderManager.php:765-767). */
    withdrawData: '_dokan_paypal_payment_withdraw_data',
    captured: '_dokan_paypal_payment_charge_captured',
    paymentSuccess: '_paypal_payment_success',
    paypalOrderId: '_dokan_paypal_order_id',
    captureId: '_dokan_paypal_payment_capture_id',
    /** PayPal's own fee for the capture — `seller_receivable_breakdown.paypal_fee`. */
    processingFee: '_dokan_paypal_payment_processing_fee',
    /** Admin commission — `seller_receivable_breakdown.platform_fees[0]`. */
    platformFee: '_dokan_paypal_payment_platform_fee',
} as const;

export const dbPrefix = process.env.DB_PREFIX;

export const TABLE = {
    orders: `${dbPrefix}_wc_orders`,
    orderMeta: `${dbPrefix}_wc_orders_meta`,
    vendorBalance: `${dbPrefix}_dokan_vendor_balance`,
    withdraw: `${dbPrefix}_dokan_withdraw`,
    reverseWithdrawal: `${dbPrefix}_dokan_reverse_withdrawal`,
    dokanOrders: `${dbPrefix}_dokan_orders`,
} as const;

/**
 * The delay-period field. Deliberately declared here rather than added to
 * `tests/e2e/payments/paymentsPage.ts`: that selector block is shared with the payments suite and
 * carries no disbursement-delay entry today, and this file is the only consumer. Lift it there if a
 * second suite ever needs it.
 *
 * The row is HIDDEN by the module's own admin JS whenever the mode is `INSTANT`
 * (PaymentMethods/PayPal.php:512-519), so PP-DIS-08 puts the gateway in `DELAYED` before it looks.
 */
export const DELAY_PERIOD_FIELD = '#woocommerce_dokan_paypal_marketplace_disbursement_delay_period';

/** Classic `[woocommerce_checkout]` shortcode page — `ensureClassicCheckoutPage()` creates it. */

/* ------------------------------------------------------------------ */
/* Buyer credentials — the one actor with no API equivalent            */
/* ------------------------------------------------------------------ */

/** `PAYPAL_BUYER` is the shared sandbox PERSONAL account — see `paypalMarketplacePage.ts`. */


/* ------------------------------------------------------------------ */
/* Skip reasons — each names exactly what is missing                    */
/* ------------------------------------------------------------------ */

export const CREDENTIALS_SKIP =
    'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / ' +
    'TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE), so Helper::is_ready() is false, the gateway is never offered at checkout and ' +
    'no order can be created — let alone captured or disbursed. PP-PRE-01 reports the absence.';

export const MERCHANT_SKIP =
    'no usable connected merchant ids are configured (PAYPAL_MARKETPLACE_VENDOR1_MERCHANT_ID / ' +
    'PAYPAL_MARKETPLACE_VENDOR2_MERCHANT_ID), so OrderManager::make_purchase_unit_data() cannot name a payee and PayPal ' +
    'refuses the order before any disbursement decision is reached. PP-PRE-02 reports this as a documented gap.';

export const BUYER_SKIP =
    'PAYPAL_MARKETPLACE_BUYER_EMAIL / PAYPAL_MARKETPLACE_BUYER_PASSWORD are not set in tests/pw/.env, so the ' +
    'PayPal-hosted approval window cannot be driven and no capture can happen. Every disbursement claim in this file is ' +
    'about what happens AFTER a capture, so without a buyer these cases would assert on an order that never moved any ' +
    'money. Supply a sandbox PERSONAL account (developer.paypal.com -> Testing Tools -> Sandbox Accounts) and re-run.';

/* ------------------------------------------------------------------ */
/* PayPal order read-back                                              */
/* ------------------------------------------------------------------ */

export interface PayPalPurchaseUnit {
    custom_id?: string;
    invoice_id?: string;
    amount?: PayPalAmount;
    payee?: { merchant_id?: string };
    payment_instruction?: { disbursement_mode?: string; platform_fees?: Array<{ amount?: PayPalAmount }> };
}

export interface PayPalOrderBody {
    id?: string;
    status?: string;
    intent?: string;
    purchase_units?: PayPalPurchaseUnit[];
}

/**
 * The shared reader, annotated with THIS file's own order shape and carrying THIS file's own failure
 * wording. Both messages stay here rather than in `helpers.ts`: each names what a missing read costs
 * *this* file's payee assertions, and a shared default would hand one file's diagnosis to another.
 */
export async function getPayPalOrder(paypalOrderId: string): Promise<PayPalOrderBody> {
    return readPayPalOrder<PayPalOrderBody>(paypalOrderId, {
        tokenFailure: (status: number) =>
            `PayPal refused a client-credentials token (HTTP ${status}). Without one the purchase units cannot be read back from PayPal, and PayPal's copy is the only record of who was named as payee — every payee assertion in this file depends on it.`,
        orderFailure: ({ paypalOrderId, status, message }) => `PayPal would not return order ${paypalOrderId} (HTTP ${status}): ${message}`,
    });
}

export interface UnitView {
    customId: string;
    merchantId: string;
    currency: string;
    total: number;
    platformFee: number;
    disbursementMode: string;
}

/** Purchase units keyed by `custom_id`, which the module sets to the sub-order id (OrderManager.php:220). */
export function unitsByOrderId(order: PayPalOrderBody): Record<string, UnitView> {
    const map: Record<string, UnitView> = {};
    for (const unit of order.purchase_units ?? []) {
        const view: UnitView = {
            customId: String(unit.custom_id ?? ''),
            merchantId: String(unit.payee?.merchant_id ?? 'none'),
            currency: String(unit.amount?.currency_code ?? 'none'),
            total: Number(unit.amount?.value ?? 0),
            platformFee: Number(unit.payment_instruction?.platform_fees?.[0]?.amount?.value ?? 0),
            disbursementMode: String(unit.payment_instruction?.disbursement_mode ?? 'none'),
        };
        map[view.customId] = view;
    }
    return map;
}

/* ------------------------------------------------------------------ */
/* WooCommerce order read-back                                         */
/* ------------------------------------------------------------------ */

export interface OrderView {
    id: string;
    parentId: number;
    status: string;
    total: number;
    currency: string;
    meta: Record<string, unknown>;
}

/**
 * One admin-authenticated read per order: status, totals and every meta.
 *
 * Reading the metas as `unknown` rather than through the suite's `getOrderMetaValue()` is deliberate —
 * `_dokan_paypal_payment_withdraw_data` is an ARRAY meta and comes back as an object, which that
 * helper's `string | undefined` signature would misdescribe.
 */
export async function readOrder(orderId: string | number): Promise<OrderView> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=id,parent_id,status,total,currency,meta_data`);
        if (!res.ok()) {
            throw new Error(`WooCommerce would not return order ${orderId} (HTTP ${res.status()}): ${(await res.text()).slice(0, 300)}`);
        }
        const body = (await res.json()) as {
            id?: number;
            parent_id?: number;
            status?: string;
            total?: string;
            currency?: string;
            meta_data?: Array<{ key?: string; value?: unknown }>;
        };
        const meta: Record<string, unknown> = {};
        for (const entry of body.meta_data ?? []) {
            if (entry.key) {
                meta[entry.key] = entry.value;
            }
        }
        return {
            id: String(body.id ?? orderId),
            parentId: Number(body.parent_id ?? 0),
            status: String(body.status ?? 'none'),
            total: Number(body.total ?? 0),
            currency: String(body.currency ?? ''),
            meta,
        };
    } finally {
        await ctx.dispose();
    }
}

export function metaString(order: OrderView, key: string): string | undefined {
    const value = order.meta[key];
    return value === undefined || value === null || value === '' ? undefined : String(value);
}

export function metaNumber(order: OrderView, key: string): number {
    return Number(order.meta[key] ?? 0);
}

/** The parked payload written by `insert_vendor_withdraw_balance()` when the mode is not INSTANT. */
export function parkedWithdraw(order: OrderView): { vendorId: number; orderId: number; amount: number } | null {
    const raw = order.meta[META.withdrawData];
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const data = raw as Record<string, unknown>;
    return {
        vendorId: Number(data['vendor_id'] ?? 0),
        orderId: Number(data['order_id'] ?? 0),
        amount: Number(data['amount'] ?? 0),
    };
}

/* ------------------------------------------------------------------ */
/* Ledger read-back                                                    */
/* ------------------------------------------------------------------ */

export interface BalanceRow {
    id: number;
    vendor_id: number;
    trn_id: number;
    trn_type: string;
    debit: string;
    credit: string;
    status: string;
}

export async function balanceRows(orderIds: string[]): Promise<BalanceRow[]> {
    if (!orderIds.length) {
        return [];
    }
    const placeholders = orderIds.map(() => '?').join(', ');
    return (await dbUtils.dbQuery(
        `SELECT id, vendor_id, trn_id, trn_type, debit, credit, status FROM \`${TABLE.vendorBalance}\` WHERE trn_id IN (${placeholders});`,
        orderIds,
    )) as BalanceRow[];
}

/** The auto-approved withdraw request `insert_vendor_withdraw_balance()` books on release (OrderManager.php:833). */
export async function withdrawRows(orderId: string): Promise<Array<{ id: number; user_id: number; amount: string; status: number; method: string; note: string }>> {
    return (await dbUtils.dbQuery(`SELECT id, user_id, amount, status, method, note FROM \`${TABLE.withdraw}\` WHERE note LIKE ?;`, [
        `Order ${orderId} payment%`,
    ])) as Array<{ id: number; user_id: number; amount: string; status: number; method: string; note: string }>;
}

export async function reverseWithdrawalRows(orderId: string): Promise<Array<{ id: number; trn_id: number; trn_type: string; vendor_id: number; debit: string; credit: string }>> {
    return (await dbUtils.dbQuery(`SELECT id, trn_id, trn_type, vendor_id, debit, credit FROM \`${TABLE.reverseWithdrawal}\` WHERE trn_id = ?;`, [
        orderId,
    ])) as Array<{ id: number; trn_id: number; trn_type: string; vendor_id: number; debit: string; credit: string }>;
}

/** The vendor accessor the dashboard uses — `dokan_get_seller_balance()` behind `GET /dokan/v1/withdraw/balance`. */
export async function vendorBalance(auth: Record<string, string>): Promise<{ currentBalance: number; withdrawThreshold: number }> {
    const ctx = await request.newContext({ extraHTTPHeaders: auth });
    try {
        const res = await ctx.get(`${SERVER_URL}/dokan/v1/withdraw/balance`);
        if (!res.ok()) {
            throw new Error(`GET /dokan/v1/withdraw/balance failed (HTTP ${res.status()}): ${(await res.text()).slice(0, 300)}`);
        }
        const body = (await res.json()) as { current_balance?: number | string; withdraw_threshold?: number | string };
        return { currentBalance: Number(body.current_balance ?? 0), withdrawThreshold: Number(body.withdraw_threshold ?? 0) };
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* The scheduled delayed-disbursement query, as SQL                    */
/* ------------------------------------------------------------------ */

/**
 * The selection `OrderController::disburse_delayed_payment()` makes, expressed against the HPOS tables.
 *
 * This mirrors `handle_custom_query_var()` (OrderController.php:430-443) plus the query args at
 * OrderController.php:394-404. It is a REPLICA of product logic and is therefore never the value a case
 * asserts on: a case that asserted on it would be asserting on SQL the test itself wrote, and would stay
 * green if `handle_custom_query_var()` were deleted outright. Its two legitimate uses are:
 *   - a PRE-FLIGHT before driving the real schedule (PP-DIS-06), where a miss means the run below would
 *     have had nothing to do and its no-op must not be read as a product failure;
 *   - DIAGNOSTIC text inside assertion messages (PP-DIS-04), so a failure says which rows the window
 *     would have contained.
 * Every claim about whether an order is actually picked up is made by running the product's own daily
 * job through `runDelayedDisbursementSchedule()` and reading the release state it produces.
 *
 * Two details are load-bearing and both come from WordPress meta_query semantics rather than from the
 * PHP being re-read casually:
 *   - `!= 'yes'` is an INNER JOIN on `_dokan_paypal_payment_withdraw_balance_added`, so an order that
 *     never reached a capture (and therefore has no such meta at all) is NOT selected;
 *   - the status filter is `wc-processing` / `wc-completed`, which in HPOS is the `status` column.
 */
export async function delayedDisbursementCandidates(mode: string, cutoffGmt: string): Promise<Array<{ id: number }>> {
    return (await dbUtils.dbQuery(
        `SELECT o.id FROM \`${TABLE.orders}\` o
         INNER JOIN \`${TABLE.orderMeta}\` m_mode ON m_mode.order_id = o.id AND m_mode.meta_key = ? AND m_mode.meta_value = ?
         INNER JOIN \`${TABLE.orderMeta}\` m_added ON m_added.order_id = o.id AND m_added.meta_key = ? AND m_added.meta_value <> 'yes'
         WHERE o.type = 'shop_order' AND o.status IN ('wc-processing', 'wc-completed') AND o.date_created_gmt <= ?;`,
        [META.disbursementMode, mode, META.balanceAdded, cutoffGmt],
    )) as Array<{ id: number }>;
}

/** `dokan_current_datetime()->setTime(23,59,59)` minus the clamped delay — OrderController.php:383-391. */
export function disbursementCutoffGmt(delayDays: number): string {
    const cutoff = new Date();
    cutoff.setUTCHours(23, 59, 59, 0);
    const clamped = delayDays > 29 ? 29 : Math.max(0, delayDays);
    cutoff.setUTCDate(cutoff.getUTCDate() - clamped);
    return cutoff.toISOString().slice(0, 19).replace('T', ' ');
}

export function daysAgoGmt(days: number): string {
    const when = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return when.toISOString().slice(0, 19).replace('T', ' ');
}

/* ------------------------------------------------------------------ */
/* Driving the daily schedule                                          */
/* ------------------------------------------------------------------ */

export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Force every scheduled WordPress event due, so the next `wp-cron.php` request runs it.
 *
 * `dokan_paypal_mp_daily_schedule` is registered once at module activation with the `daily` recurrence
 * (module.php:127), so its next run is up to 24h away and nothing short of moving it can make it fire.
 * Rewriting the timestamp is scheduling, not fabrication — it changes WHEN the product's own handler
 * runs, never what it computes, and the assertions read the release state the handler produces.
 *
 * The whole `cron` option is snapshotted in `beforeAll` and restored in `afterAll`: it is site-global,
 * and leaving every event permanently due would make the next suite on this worker run cron on every
 * page load.
 */
export async function forceCronEventsDue(): Promise<number> {
    const current = await dbUtils.getOptionValueOrNull('cron');
    if (!current || typeof current !== 'object') {
        return 0;
    }
    const source = current as Record<string, unknown>;
    const merged: Record<string, unknown> = {};
    let hooks = 0;

    for (const [timestampKey, hooksAtTimestamp] of Object.entries(source)) {
        if (timestampKey === 'version' || !hooksAtTimestamp || typeof hooksAtTimestamp !== 'object') {
            continue;
        }
        for (const [hook, jobs] of Object.entries(hooksAtTimestamp as Record<string, unknown>)) {
            const bucket = (merged[hook] ?? {}) as Record<string, unknown>;
            Object.assign(bucket, jobs as Record<string, unknown>);
            merged[hook] = bucket;
            hooks++;
        }
    }

    // Five minutes in the past: comfortably older than WP_CRON_LOCK_TIMEOUT, so nothing treats it as
    // "already being handled".
    const pastKey = String(Math.floor(Date.now() / 1000) - 300);
    await dbUtils.setOptionValue('cron', { [pastKey]: merged, version: 2 }, true);
    return hooks;
}

/**
 * Clear the two locks that make a cron/background run a silent no-op.
 *
 * `wp-cron.php` returns immediately while the `doing_cron` transient is fresh, and
 * `WP_Background_Process::handle_cron_healthcheck()` returns immediately while its own process lock is
 * held (`is_process_running()`). A previous run that died mid-batch leaves either behind, and the
 * result would be a disbursement case reporting "not released" for a reason that has nothing to do
 * with disbursement.
 */
export async function clearCronLocks(): Promise<void> {
    await dbUtils.dbQuery(
        `DELETE FROM \`${dbPrefix}_options\` WHERE option_name LIKE '%doing_cron%' OR option_name LIKE '%dokan_paypal_marketplace_sync_delay_disbursement%process_lock%';`,
    );
}

/** GET wp-cron.php with the inherited admin Basic auth explicitly blanked — cron needs no credentials. */
export async function runWpCron(): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: { Authorization: '' } });
    try {
        const res = await ctx.get(`${BASE_URL.replace(/\/$/, '')}/wp-cron.php`, { timeout: 180_000 });
        return res.status();
    } finally {
        await ctx.dispose();
    }
}

export async function waitUntil(predicate: () => Promise<boolean>, timeoutMs: number, intervalMs = 3_000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
        if (await predicate()) {
            return true;
        }
        if (Date.now() >= deadline) {
            return false;
        }
        await sleep(intervalMs);
    }
}

/**
 * Run the daily delayed-disbursement schedule end to end and wait for its effect.
 *
 * Two cron passes, because the product's pipeline has two stages:
 *   1. `dokan_paypal_mp_daily_schedule` → `disburse_delayed_payment()` queues the matured orders and
 *      calls `DelayDisburseFund::dispatch()`, a NON-BLOCKING loopback POST. The queue may therefore be
 *      drained by that loopback before this function looks, which is why the predicate is polled first.
 *   2. If it was not, the module's own `schedule_event()` override has by then scheduled the background
 *      healthcheck at `time() + 10` (DelayDisburseFund.php:69-73). A second forced cron pass runs
 *      `handle_cron_healthcheck()`, which drains the queue SYNCHRONOUSLY inside that request.
 *
 * Returns whether the predicate came true, plus a trace — callers assert on the predicate and quote the
 * trace, so "nothing happened" is never mistaken for "nothing needed to happen".
 */
export async function runDelayedDisbursementSchedule(settled: () => Promise<boolean>, budgetMs = 150_000): Promise<{ ok: boolean; trace: string }> {
    const trace: string[] = [];

    await clearCronLocks();
    const firstHooks = await forceCronEventsDue();
    const firstStatus = await runWpCron();
    trace.push(`pass 1: forced ${firstHooks} scheduled hook(s) due, wp-cron.php -> HTTP ${firstStatus}`);

    if (await waitUntil(settled, 25_000)) {
        return { ok: true, trace: trace.join('; ') };
    }

    // Give the module's `time() + 10` healthcheck a chance to exist before forcing it due.
    await sleep(12_000);
    await clearCronLocks();
    const secondHooks = await forceCronEventsDue();
    const secondStatus = await runWpCron();
    trace.push(`pass 2 (background healthcheck): forced ${secondHooks} hook(s) due, wp-cron.php -> HTTP ${secondStatus}`);

    const ok = await waitUntil(settled, budgetMs);
    trace.push(ok ? 'settled' : `did NOT settle within ${Math.round(budgetMs / 1000)}s after pass 2`);
    return { ok, trace: trace.join('; ') };
}

/* ------------------------------------------------------------------ */
/* Customer-side driving                                               */
/* ------------------------------------------------------------------ */

/**
 * Put exactly `productIds` in the customer's cart and PROVE it landed there.
 *
 * The proof comes from `_woocommerce_persistent_cart_1`, which WooCommerce writes from the
 * `woocommerce_add_to_cart` action — it fires only on a SUCCESSFUL add. An empty cart offers no
 * payment methods at all, so without this check a silently failed add would turn every later
 * assertion into a statement about the cart.
 */
export async function stockCart(paypal: PayPalMarketplacePage, productIds: string[]): Promise<void> {
    await stockCartWithProof(
        paypal,
        productIds,
        productId =>
            `the customer cart must hold product ${productId} before checkout — an empty cart offers no payment methods, which would make this case a statement about the cart rather than about disbursement`,
    );
}

/**
 * Select PayPal Marketplace on the classic checkout and PROVE the selection took.
 *
 * `check({ force: true })` cannot do this job here: WooCommerce HIDES the radio outright when the
 * gateway is the only available method (checkout.js:228-231), and `force` skips the hit-target check so
 * a click during an `update_checkout` cycle lands on the blockUI overlay instead. The final
 * `toBeChecked()` is load-bearing rather than defensive — the form is submitted by SERIALIZING it, and
 * an unchecked radio serializes no `payment_method`, which WooCommerce rejects as "Invalid payment
 * method" far away from the real cause.
 *
 * Both messages stay in THIS file: they name what their absence means for a disbursement case.
 */
export async function selectClassicPayPal(page: Page): Promise<void> {
    await selectClassicPayPalWithMessages(page, {
        availability: `the classic checkout must offer ${PAYPAL_IDS.gateway} before an order can be placed with it. Its absence means Helper::validate_cart_items() rejected the cart's vendor (PaymentMethods/PayPal.php:599) — most often the six-key vendor seeding, of which _enable_for_receive_payment is the decisive one`,
        selected: `${PAYPAL_IDS.gateway} must end up SELECTED on the classic checkout, or the serialized form carries no payment_method and WC_Checkout::process_checkout() answers "Invalid payment method"`,
    });
}

/* ------------------------------------------------------------------ */
/* Buyer approval on PayPal's own domain                               */
/* ------------------------------------------------------------------ */

/**
 * PayPal-hosted checkout selectors, in the order the flow presents them.
 *
 * The hosted flow WAS driven successfully with Playwright against this site on 2026-07-31 (the
 * partner-consent screens), so it is treated as reachable rather than assumed undrivable. What is NOT
 * assumed is that it always is: a captcha or a step-up challenge is detected explicitly and reported as
 * a named skip, never worked around and never quietly passed.
 */
export const PAYPAL_HOSTED = PayPalMarketplacePage.paypalHosted;

export interface ApprovalResult {
    approved: boolean;
    /** Empty when approved; otherwise the exact reason the case must report. */
    reason: string;
}

export async function isVisible(page: Page, selector: string, timeoutMs = 2_000): Promise<boolean> {
    return page
        .locator(selector)
        .first()
        .waitFor({ state: 'visible', timeout: timeoutMs })
        .then(() => true)
        .catch(() => false);
}

/**
 * Drive the real buyer approval and return to the site, where the module captures.
 *
 * The capture is NOT performed by this test. PayPal redirects back to the module's own `return_url`
 * (PaymentMethods/PayPal.php:290-297) and `OrderController::maybe_process_order_redirect()`
 * (OrderController.php:490-528) runs `handle_capture_payment_validation()` + `payment_complete()` inside
 * that page load. So everything this function does is what a shopper does; the money movement is the
 * product's.
 *
 * A challenge screen returns `approved: false` with a reason (the caller turns that into a declared
 * skip), and PayPal rejecting or locking the buyer's credentials skips on the spot
 * (`buyerCredentialFault()`). Anything else that goes wrong THROWS with the current URL and page text,
 * because a silent false there would be indistinguishable from a product failure.
 */
export async function approveOnPayPal(page: Page, approveUrl: string): Promise<ApprovalResult> {
    await page.goto(approveUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });

    if (await isVisible(page, PAYPAL_HOSTED.challenge, 4_000)) {
        return {
            approved: false,
            reason: `PayPal presented a captcha / step-up challenge at ${page.url()} before the buyer could log in. This is the one step in the module with no API equivalent, so the case cannot proceed and is reported as blocked rather than passed. Re-run from an IP PayPal does not challenge, or approve once manually in a headed run to warm the sandbox buyer account.`,
        };
    }

    // Login. The hosted flow is sometimes one page and sometimes two, and the buyer may already be
    // authenticated from an earlier navigation in this browser context.
    if (await isVisible(page, PAYPAL_HOSTED.email, 20_000)) {
        await page.fill(PAYPAL_HOSTED.email, PAYPAL_BUYER.email);
        if (await isVisible(page, PAYPAL_HOSTED.next, 3_000)) {
            await page.locator(PAYPAL_HOSTED.next).first().click();
        }
        if (await isVisible(page, PAYPAL_HOSTED.password, 30_000)) {
            await page.fill(PAYPAL_HOSTED.password, PAYPAL_BUYER.password);
            await page.locator(PAYPAL_HOSTED.login).first().click();

            // Checked BEFORE the 60s pay-button wait and the 180s return wait: with a rejected login
            // neither ever happens, so without this probe the case burns four minutes and then blames the
            // product for a missing capture. Skipping here also stops the retries that lock the account.
            const credentialFault = await buyerCredentialFault(page, {
                passwordSelector: PAYPAL_HOSTED.password,
                lockedScope: 'No money case in this file',
                lockedTail: `Reported as a declared environment gap, never as a pass and never as a red: no capture was attempted, so nothing about disbursement was exercised — and retrying is what caused the lockout in the first place.`,
                rejectedTail: `Reported as a declared environment gap rather than a failure: the buyer never got past PayPal's login, so no capture and no disbursement happened — and every retry re-submits the same bad password, which is what locks the account.`,
            });
            if (credentialFault) {
                test.skip(true, credentialFault);
            }
        }
    }

    if (await isVisible(page, PAYPAL_HOSTED.challenge, 5_000)) {
        return {
            approved: false,
            reason: `PayPal presented a captcha / step-up challenge after the buyer login at ${page.url()}. Reported as blocked, never passed — no capture happened, so nothing about disbursement can be claimed.`,
        };
    }

    if (await isVisible(page, PAYPAL_HOSTED.notNow, 4_000)) {
        await page.locator(PAYPAL_HOSTED.notNow).first().click().catch(() => undefined);
    }

    // The review screen. `user_action` is PAY_NOW (PaymentMethods/PayPal.php:296), so this button
    // completes the approval and PayPal redirects straight back.
    if (await isVisible(page, PAYPAL_HOSTED.payNow, 60_000)) {
        await page.locator(PAYPAL_HOSTED.payNow).first().click();
    }

    try {
        // Back on the site: `maybe_process_order_redirect()` performs a LIVE capture inside this page
        // load, so the budget covers a PayPal round trip on top of the redirect chain.
        await page.waitForURL(url => url.href.includes('order-received'), { timeout: 180_000 });
    } catch {
        const bodyText = await page
            .locator('body')
            .innerText()
            .catch(() => '');
        throw new Error(
            `the buyer never returned to the site's order-received page after approving on PayPal, so no capture was attempted and every disbursement assertion below would be about an unpaid order. Current URL: ${page.url()}. Page title: ${await page.title().catch(() => '(unavailable)')}. First 400 chars of the page: ${bodyText.slice(0, 400)}`,
        );
    }

    return { approved: true, reason: '' };
}

/* ------------------------------------------------------------------ */
/* Capture route — PayPal wallet (default) or Advanced Card (UCC)      */
/* ------------------------------------------------------------------ */

export const CARD_SKIP =
    'PAYPAL_MARKETPLACE_CAPTURE_ROUTE=card was requested but PAYPAL_UCC_TEST_CARD is not set, so there is no card to type ' +
    'into PayPal\'s hosted fields and no capture can happen on this route. Set it to a sandbox PAN confirmed to complete a ' +
    'purchase on THIS sandbox account without a 3D Secure step-up — the published candidate is Visa 4868719196829038 ' +
    '(Mastercard 5329879707824603, PayPal 3DS "Test Case 1", frictionless success), and explicitly NOT 4868719166101368 / ' +
    '5329879735316929, which require a challenge. It is NOT defaulted: no number can be confirmed from source alone, and a ' +
    'baked-in PAN would let this run spend sandbox captures on an unvetted card. The same variable drives ' +
    'paypalMarketplaceUcc.spec.ts, so one harvested number serves both. Or drop PAYPAL_MARKETPLACE_CAPTURE_ROUTE=card to ' +
    'use the wallet route.';


export const APPROVAL_ACTOR_SKIP = USE_CARD_CAPTURE ? CARD_SKIP : BUYER_SKIP;

/* ------------------------------------------------------------------ */
/* The money path                                                      */
/* ------------------------------------------------------------------ */

export interface MoneyOrder {
    parentOrderId: string;
    /** Sub orders, empty for a single-vendor cart (Dokan does not split those). */
    childIds: string[];
    /** The rows that carry the disbursement metas: the children when split, otherwise the parent. */
    payableOrderIds: string[];
    paypalOrderId: string;
    approval: ApprovalResult;
}

/** Every order id this file created, so nothing is left behind on the shared site. */
export const createdOrderIds: string[] = [];

/**
 * Place a real order through the classic checkout, have the buyer approve it on PayPal, and let the
 * module capture it.
 *
 * Nothing here writes a capture meta, a balance row or a withdraw row — those are all produced by
 * `OrderManager::handle_order_complete_status()` -> `store_capture_payment_data()` inside the
 * order-received request. If the capture does not happen, this function reports it and the caller
 * fails; there is no substitute path.
 *
 * WHICH ROUTE approves is decided by `PAYPAL_MARKETPLACE_CAPTURE_ROUTE` and by nothing else — see
 * `announceCaptureRoute()`. On the card route the checkout POST is made by the module's own
 * `createOrder` callback instead of by `submitClassicCheckout()`, and the capture happens over
 * `admin-ajax.php` instead of on the return redirect; the response both routes assert on, and every
 * assertion made about it, is identical.
 */
export async function placeAndCapture(browser: Browser, productIds: string[]): Promise<MoneyOrder> {
    let parentOrderId = '';
    let paypalOrderId = '';

    const approval = await withCustomer(browser, async (page, paypal) => {
        await stockCart(paypal, productIds);
        await page.goto(CLASSIC.url, { waitUntil: 'domcontentloaded' });
        await expect(page.locator(CLASSIC.placeOrder), 'the classic checkout page must render the order form before it can be submitted').toBeAttached({ timeout: 60_000 });
        await selectClassicPayPal(page);
        if (USE_CARD_CAPTURE) {
            await waitForCheckoutSettled(page);
        }

        const result = USE_CARD_CAPTURE ? await payWithCardOnClassicCheckout(page, [VENDOR_ID, VENDOR2_ID]) : await submitClassicCheckout(page);
        expect(result.__error ?? null, 'the classic checkout POST must reach WC_Checkout::process_checkout(); without it no order exists to disburse').toBeNull();
        expect(
            result.result,
            `the classic checkout must return result=success before any disbursement claim can be made. WooCommerce reports the reason in "messages": ${String(result.messages ?? result.message ?? '(none)').slice(0, 400)}`,
        ).toBe('success');

        parentOrderId = String(result.id ?? '');
        expect(parentOrderId, `WooCommerce must report the order it created. Response: ${JSON.stringify(result ?? null).slice(0, 400)}`).not.toBe('');
        createdOrderIds.push(parentOrderId);

        paypalOrderId = String(result.paypal_order_id ?? '');
        expect(
            paypalOrderId,
            `PayPal::process_payment() must return paypal_order_id (PaymentMethods/PayPal.php:344) — without it the buyer has nothing to approve. Response: ${JSON.stringify(result ?? null).slice(0, 400)}`,
        ).not.toBe('');

        const approveUrl = String(result.paypal_redirect_url ?? result.redirect ?? '');
        expect(
            approveUrl,
            `PayPal::process_payment() must return the hosted approval URL it stored as _dokan_paypal_redirect_url (PaymentMethods/PayPal.php:333). Response: ${JSON.stringify(result ?? null).slice(0, 400)}`,
        ).not.toBe('');

        // On the card route the buyer already approved and the module already captured, inside the
        // click above — there is no hosted window to drive. `approved` is stated rather than assumed:
        // `payWithCardOnClassicCheckout()` only returns after the order-received page was reached, and
        // `assertCaptured()` is still the thing that decides whether money actually moved.
        return USE_CARD_CAPTURE ? { approved: true, reason: '' } : approveOnPayPal(page, approveUrl);
    });

    const childIds = await dbUtils.getChildOrderIds(parentOrderId);
    createdOrderIds.push(...childIds);

    return {
        parentOrderId,
        childIds,
        // Dokan does not split a single-vendor order, so the parent itself carries the disbursement
        // metas in that case (PaymentMethods/PayPal.php:268-270 falls back to `[ $order ]`).
        payableOrderIds: childIds.length ? childIds : [parentOrderId],
        paypalOrderId,
        approval,
    };
}

/**
 * Assert the capture really happened, with a message that names the consequence and the cause.
 *
 * This is the gate every disbursement assertion in the file stands on: a parked/released distinction is
 * meaningless on an order PayPal never charged.
 */
export async function assertCaptured(money: MoneyOrder): Promise<void> {
    const captured = await waitUntil(async () => {
        const parent = await readOrder(money.parentOrderId);
        return metaString(parent, META.captured) === 'yes';
    }, 60_000);

    const parent = await readOrder(money.parentOrderId);
    const notes = await getOrderNotes(money.parentOrderId);

    expect(
        captured && metaString(parent, META.captured),
        `order ${money.parentOrderId} must be CAPTURED before any disbursement claim can be made about it. ` +
            `${META.captured} is written by OrderManager::handle_order_complete_status() (Order/OrderManager.php:481-482) as the very first thing after PayPal accepts the capture, so its absence means the capture never completed and no money moved at all. ` +
            `The capture runs inside the order-received page load via OrderController::maybe_process_order_redirect() (Order/OrderController.php:490-528), which SWALLOWS its exception into dokan_log at :524 — so the reason is in the order notes rather than on screen. ` +
            `Order status: ${parent.status}. PayPal order: ${money.paypalOrderId}. Notes: ${JSON.stringify(notes.slice(0, 8) ?? null)}`,
    ).toBe('yes');
}

/**
 * The money oracle, per payable order row.
 *
 * `order total == vendor net + admin commission + PayPal fee` is PayPal's own
 * `seller_receivable_breakdown` identity (`gross = net + paypal_fee + platform_fees`), asserted against
 * the three values the PRODUCT extracted from the capture response and stored
 * (`store_capture_payment_data()`, Order/OrderManager.php:516-560). Getting it wrong in either
 * direction is money going to the wrong party.
 */
export async function assertMoneyReconciles(orderId: string, netAmount: number, caseId: string): Promise<void> {
    const order = await readOrder(orderId);
    const processingFee = metaNumber(order, META.processingFee);
    const platformFee = metaNumber(order, META.platformFee);

    expect(
        netAmount,
        `${caseId}: the vendor's net amount for order ${orderId} must be a positive figure. It is PayPal's seller_receivable_breakdown.net_amount, carried into the ledger by handle_vendor_balance() (Order/OrderManager.php:725-748); a zero here means the vendor is credited nothing for a payment the customer really made`,
    ).toBeGreaterThan(0);

    expect(
        netAmount + platformFee + processingFee,
        `${caseId}: order ${orderId} must reconcile — total must equal vendor net + admin commission + gateway fee. ` +
            `Anything else means a party is over- or under-paid for a capture that already settled at PayPal. ` +
            `total=${order.total} ${order.currency}, vendor net=${netAmount}, admin commission (${META.platformFee})=${platformFee}, PayPal fee (${META.processingFee})=${processingFee}. ` +
            `Sources: Order/OrderManager.php:516-560 for the three stored figures, Order/OrderManager.php:147-220 for the purchase unit the capture settled against`,
    ).toBeCloseTo(order.total, 2);
}

/** Vendor net as the product recorded it: the parked payload while parked, the ledger credit once released. */
export async function vendorNetFor(orderId: string): Promise<{ net: number; source: string }> {
    const order = await readOrder(orderId);
    const parked = parkedWithdraw(order);
    if (parked && parked.amount > 0) {
        return { net: parked.amount, source: `${META.withdrawData} (parked)` };
    }
    const rows = (await balanceRows([orderId])).filter(row => row.trn_type === 'dokan_withdraw');
    const credit = rows.reduce((sum, row) => sum + Number(row.credit ?? 0), 0);
    return { net: credit, source: `${TABLE.vendorBalance}.credit where trn_type='dokan_withdraw' (released)` };
}

/* ------------------------------------------------------------------ */
/* Gates                                                               */
/* ------------------------------------------------------------------ */

/**
 * PayPal-side consent, probed over the network.
 *
 * `HAS_REAL_MERCHANTS` only inspects the SHAPE of a merchant id. A correctly-shaped id belonging to an
 * account that never granted this partner app permission produces an opaque payee failure at capture,
 * which would read here as "disbursement is broken". The gate must therefore see consent, not format.
 */
export async function unpayableReason(labels: Array<'vendor1' | 'vendor2'>): Promise<string | null> {
    const consents = await getBothMerchantConsents();
    const bad = labels.filter(label => !isPayableMerchant(consents[label]));
    if (!bad.length) {
        return null;
    }
    return (
        `PayPal will not accept ${bad.map(label => `${label} (${consents[label].merchantId}): ${consents[label].reason ?? 'not payments-receivable'}`).join('; ')} as a payee. ` +
        'create_order() cannot name that payee, so no capture and therefore no disbursement can happen. PP-PRE-04 reports this.'
    );
}

export let vendor1ProductId = '';

export let vendor2ProductId = '';

/** Snapshot of the gateway settings, restored in afterAll — every case changes the mode. */
export let originalSettings: unknown = null;

/** Snapshot of the site-wide `cron` option, restored in afterAll — the schedule driver rewrites it. */
export let originalCron: unknown = null;

export class PayPalMarketplaceDisbursementPage {
    async setupAll(): Promise<void> {
        // Announced before the credentials guard so the report always names the route, even on a run
        // where every case skips.
        announceCaptureRoute('PP-DIS');

        // No test.skip() here on purpose: in a beforeAll it silently voids the entire describe.
        if (!hasCredentials) {
            return;
        }

        originalSettings = await dbUtils.getOptionValueOrNull(SETTINGS_OPTION);
        originalCron = await dbUtils.getOptionValueOrNull('cron');

        await ensurePayPalConfigured();
        await ensureCustomerAddress();
        await ensureClassicCheckoutPage();
        await ensureVendorStoreAddress(VENDOR_ID);
        await ensureVendorStoreAddress(VENDOR2_ID);
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: 'dokangit@vendor1.com' });
        await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' });

        // AFTER the vendor seeding: seedPayPalConnectedVendor() rewrites all six PayPal metas on every
        // call, including the UCC one, so opening gate 5 first would be undone here.
        if (USE_CARD_CAPTURE) {
            await openCardGates([VENDOR_ID, VENDOR2_ID]);
        }

        // `virtual`/`downloadable` are pinned FALSE on purpose. A virtual product makes
        // `payment_complete()` move the order straight to `completed`, which fires
        // OrderController::order_status_changed() inside the capture itself — the ON_ORDER_COMPLETE
        // funds would then already be released before PP-DIS-02 ever looks, and its "parked" assertion
        // would fail against a perfectly correct product.
        const physical = { virtual: false, downloadable: false };
        const api = new ApiUtils(await request.newContext());
        const [, product1] = await api.createProduct({ ...payloads.createProduct(), ...physical, name: 'PayPal Disbursement Vendor1 Product' }, payloads.vendorAuth);
        const [, product2] = await api.createProduct({ ...payloads.createProduct(), ...physical, name: 'PayPal Disbursement Vendor2 Product' }, payloads.vendor2Auth);
        vendor1ProductId = product1;
        vendor2ProductId = product2;
        await api.dispose();
    }

    async teardownAll(): Promise<void> {
        if (!hasCredentials) {
            return;
        }

        // First, before anything can throw: an unrestored ucc_mode leaks a card form into every later
        // checkout spec on this worker and fails PP-SET-19 in a file that did nothing wrong.
        await restoreCardGates();

        // Money cleanup, in dependency order. A disbursement test that leaves ledger rows behind
        // corrupts every later balance assertion on this site, and a permanently-due cron option would
        // make the next suite on this worker run every scheduled event on every page load.
        const uniqueOrderIds = [...new Set(createdOrderIds)].filter(Boolean);

        if (uniqueOrderIds.length) {
            const placeholders = uniqueOrderIds.map(() => '?').join(', ');
            await dbUtils.dbQuery(`DELETE FROM \`${TABLE.vendorBalance}\` WHERE trn_id IN (${placeholders});`, uniqueOrderIds).catch(() => undefined);
            await dbUtils.dbQuery(`DELETE FROM \`${TABLE.dokanOrders}\` WHERE order_id IN (${placeholders});`, uniqueOrderIds).catch(() => undefined);
            await dbUtils.dbQuery(`DELETE FROM \`${TABLE.reverseWithdrawal}\` WHERE trn_id IN (${placeholders});`, uniqueOrderIds).catch(() => undefined);
            for (const orderId of uniqueOrderIds) {
                await dbUtils.dbQuery(`DELETE FROM \`${TABLE.withdraw}\` WHERE note LIKE ?;`, [`Order ${orderId} payment%`]).catch(() => undefined);
            }
        }

        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        await clearCronLocks().catch(() => undefined);

        if (originalCron && typeof originalCron === 'object') {
            await dbUtils.setOptionValue('cron', originalCron as object, true).catch(() => undefined);
        }
        if (originalSettings && typeof originalSettings === 'object') {
            await dbUtils.setOptionValue(SETTINGS_OPTION, originalSettings as object, true).catch(() => undefined);
        } else {
            // Nothing to restore — leave the gateway on the suite's documented baseline rather than
            // whatever the last case set.
            await ensurePayPalConfigured({ disbursement_delay_period: '7' }, 'INSTANT').catch(() => undefined);
        }

        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            // Children first: deleting a parent leaves detached sub orders otherwise.
            for (const orderId of uniqueOrderIds.slice().reverse()) {
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

    async ppDis01({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        const blocked = await unpayableReason(['vendor1']);
        test.skip(blocked !== null, blocked ?? '');

        await ensurePayPalConfigured({}, 'INSTANT');
        const status = await getPayPalStatus();
        expect(
            status.disbursement_mode,
            `the gateway must actually be in INSTANT mode before this case can claim anything about instant disbursement. Helper::get_disbursement_mode() (Helper.php:763-768) is what process_payment() stamps on the order and what make_purchase_unit_data() turns into the PayPal payment instruction, so a different value here makes every assertion below a statement about a different mode`,
        ).toBe('INSTANT');

        const money = await placeAndCapture(browser, [vendor1ProductId]);
        test.skip(!money.approval.approved, money.approval.reason);
        await assertCaptured(money);

        const payableId = money.payableOrderIds[0] ?? money.parentOrderId;
        const payable = await readOrder(payableId);

        expect(
            metaString(payable, META.disbursementMode),
            `order ${payableId} must carry ${META.disbursementMode}=INSTANT. process_payment() writes it on each row in the SAME loop that builds that row's purchase unit (PaymentMethods/PayPal.php:273-275), so this value is evidence the row was really turned into a payable unit — not merely that the setting says INSTANT`,
        ).toBe('INSTANT');

        expect(
            metaString(payable, META.balanceAdded),
            `INSTANT must credit the vendor ledger AT CAPTURE. insert_vendor_withdraw_balance() only takes the parking branch when the mode is not INSTANT (Order/OrderManager.php:763), so a value other than 'yes' here means the vendor was charged-through at PayPal but Dokan recorded no earning for them — the vendor is paid in reality and unpaid in the dashboard`,
        ).toBe('yes');

        expect(
            parkedWithdraw(payable),
            `INSTANT must leave NO parked withdraw record. ${META.withdrawData} is written only by the non-INSTANT branch (Order/OrderManager.php:765-767); its presence alongside an INSTANT mode means the order is sitting in both states at once and the daily schedule may release it a second time. Meta: ${JSON.stringify(payable.meta[META.withdrawData] ?? null)}`,
        ).toBeNull();

        const rows = (await balanceRows([payableId])).filter(row => row.trn_type === 'dokan_withdraw');
        expect(
            rows.length,
            `exactly one ${TABLE.vendorBalance} row of trn_type 'dokan_withdraw' must exist for order ${payableId}. Zero means the vendor's payout was never booked; more than one double-counts it against their withdrawable balance. Rows: ${JSON.stringify(rows ?? null)}`,
        ).toBe(1);

        const { net, source } = await vendorNetFor(payableId);
        log.info(`PP-DIS-01: vendor net read from ${source}.`);
        await assertMoneyReconciles(payableId, net, 'PP-DIS-01');

        // PayPal's own copy of the order: the purchase units are never persisted WordPress-side, so this
        // is the only record of what the capture actually settled and who it named as payee.
        const paypalOrder = await getPayPalOrder(money.paypalOrderId);
        const units = unitsByOrderId(paypalOrder);
        const unit = units[payableId];
        expect(
            unit ?? null,
            `PayPal must hold a purchase unit whose custom_id is ${payableId} (OrderManager.php:220 sets custom_id to the sub-order id). Without it the capture settled against something other than this order. Units seen: ${JSON.stringify(Object.keys(units) ?? null)}`,
        ).not.toBeNull();

        expect(
            unit?.merchantId,
            `the purchase unit for order ${payableId} must name vendor 1's OWN merchant id as payee. A wrong payee routes this vendor's money to somebody else, and no Dokan-side ledger row can undo that. Unit: ${JSON.stringify(unit ?? null)}`,
        ).toBe(PAYPAL_MERCHANTS.vendor1);

        expect(
            unit?.disbursementMode,
            `the payment instruction PayPal holds must say INSTANT — that is the flag deciding whether PayPal releases the funds to the vendor at capture or holds them (OrderManager.php:209). Unit: ${JSON.stringify(unit ?? null)}`,
        ).toBe('INSTANT');

        log.success(`PP-DIS-01: INSTANT disbursed at capture — order ${payableId} reconciles and PayPal released to ${unit?.merchantId}.`);
    }

    async ppDis02({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        const blocked = await unpayableReason(['vendor1']);
        test.skip(blocked !== null, blocked ?? '');

        await ensurePayPalConfigured({}, 'ON_ORDER_COMPLETE');
        const status = await getPayPalStatus();
        expect(status.disbursement_mode, 'the gateway must be in ON_ORDER_COMPLETE mode, or "funds are parked" below would be describing a different mode').toBe('ON_ORDER_COMPLETE');

        const money = await placeAndCapture(browser, [vendor1ProductId]);
        test.skip(!money.approval.approved, money.approval.reason);
        await assertCaptured(money);

        const payableId = money.payableOrderIds[0] ?? money.parentOrderId;
        const payable = await readOrder(payableId);

        expect(
            payable.status,
            `the order must still be un-completed for "parked until it completes" to mean anything. payment_complete() moves a paid order to processing; a 'completed' status here would already have fired OrderController::order_status_changed() and released the funds, so the case would be measuring the wrong moment`,
        ).not.toBe('completed');

        expect(metaString(payable, META.disbursementMode), `order ${payableId} must carry ${META.disbursementMode}=ON_ORDER_COMPLETE, written per row in the purchase-unit loop (PaymentMethods/PayPal.php:273-275)`).toBe('ON_ORDER_COMPLETE');

        expect(
            metaString(payable, META.balanceAdded),
            `funds must be PARKED, not credited: insert_vendor_withdraw_balance() takes the parking branch for any non-INSTANT mode (Order/OrderManager.php:763-770) and writes 'no'. A 'yes' here means the vendor was credited the moment the customer paid, which defeats the whole point of holding funds for vetting`,
        ).toBe('no');

        const parked = parkedWithdraw(payable);
        expect(
            parked,
            `the parked payload ${META.withdrawData} must exist on order ${payableId}. It is the ONLY record of what to pay the vendor when the order later completes — _disburse_payment() reads it back at Order/OrderManager.php:906 — so without it the release path has nothing to insert and the vendor is silently never credited. Meta: ${JSON.stringify(payable.meta[META.withdrawData] ?? null)}`,
        ).not.toBeNull();
        expect(parked?.amount ?? 0, `the parked payload must carry a positive amount. Payload: ${JSON.stringify(parked ?? null)}`).toBeGreaterThan(0);

        const rows = (await balanceRows([payableId])).filter(row => row.trn_type === 'dokan_withdraw');
        expect(
            rows,
            `no ${TABLE.vendorBalance} 'dokan_withdraw' row may exist while the funds are parked — that row is what makes the payout real on the Dokan side. Rows: ${JSON.stringify(rows ?? null)}`,
        ).toEqual([]);

        const withdraws = await withdrawRows(payableId);
        expect(withdraws, `no auto-approved withdraw request may exist while the funds are parked. Rows: ${JSON.stringify(withdraws ?? null)}`).toEqual([]);

        await assertMoneyReconciles(payableId, parked?.amount ?? 0, 'PP-DIS-02');

        log.success(`PP-DIS-02: ON_ORDER_COMPLETE parked ${parked?.amount} for order ${payableId} with no ledger row.`);
    }

    async ppDis03({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        const blocked = await unpayableReason(['vendor1']);
        test.skip(blocked !== null, blocked ?? '');

        await ensurePayPalConfigured({}, 'ON_ORDER_COMPLETE');

        const money = await placeAndCapture(browser, [vendor1ProductId]);
        test.skip(!money.approval.approved, money.approval.reason);
        await assertCaptured(money);

        const payableId = money.payableOrderIds[0] ?? money.parentOrderId;
        const before = await readOrder(payableId);
        const parked = parkedWithdraw(before);
        expect(
            metaString(before, META.balanceAdded),
            `baseline: the funds must be parked BEFORE the transition, or "released by the transition" cannot be attributed to the transition. Order ${payableId} meta: ${JSON.stringify(before.meta[META.balanceAdded] ?? null)}`,
        ).toBe('no');

        await setOrderStatus(payableId, 'completed');

        const released = await waitUntil(async () => {
            const order = await readOrder(payableId);
            return metaString(order, META.balanceAdded) === 'yes';
        }, 90_000);

        const after = await readOrder(payableId);
        const notes = await getOrderNotes(payableId);

        expect(
            released && metaString(after, META.balanceAdded),
            `completing order ${payableId} must RELEASE the parked funds. OrderController::order_status_changed() (Order/OrderController.php:342-373) calls OrderManager::_disburse_payment(), which asks PayPal for a REFERENCED PAYOUT and only then inserts the ledger row (Order/OrderManager.php:887-923). ` +
                `A stuck 'no' means the vendor completed the sale and was never credited. The failure reason is in the order notes, because _disburse_payment() records the gateway error as a note rather than raising: look for "Could not disbursed fund to vendor" — if that is what you see, the sandbox partner app may not have the referenced-payouts capability, which is an environment finding rather than a code defect. Notes: ${JSON.stringify(notes.slice(0, 8) ?? null)}`,
        ).toBe('yes');

        const rows = (await balanceRows([payableId])).filter(row => row.trn_type === 'dokan_withdraw');
        expect(
            rows.length,
            `the release must book EXACTLY ONE ${TABLE.vendorBalance} 'dokan_withdraw' row for order ${payableId} — "released exactly once" is the whole claim. Rows: ${JSON.stringify(rows ?? null)}`,
        ).toBe(1);

        const credited = Number(rows[0]?.credit ?? 0);
        expect(
            credited,
            `the released amount must equal the parked amount. The parked payload is the only record of what the vendor is owed (Order/OrderManager.php:906 reads it straight back), so a mismatch means the release invented a different figure than the capture recorded. Parked: ${JSON.stringify(parked ?? null)}, released row: ${JSON.stringify(rows[0] ?? null)}`,
        ).toBeCloseTo(parked?.amount ?? -1, 2);

        const withdraws = await withdrawRows(payableId);
        expect(
            withdraws.length,
            `the release must also book exactly one auto-approved withdraw request (dokan()->withdraw->insert_withdraw() at Order/OrderManager.php:833). It is what nets the vendor's withdrawable balance against money PayPal already sent them; without it the vendor can withdraw the same funds a second time. Rows: ${JSON.stringify(withdraws ?? null)}`,
        ).toBe(1);

        await assertMoneyReconciles(payableId, credited, 'PP-DIS-03');

        log.success(`PP-DIS-03: completing order ${payableId} released ${credited} exactly once.`);
    }

    async ppDis04({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        const blocked = await unpayableReason(['vendor1']);
        test.skip(blocked !== null, blocked ?? '');

        // A zero delay makes the maturity cutoff "end of today", so an order created today is already
        // mature and its own age can never be the reason the daily job leaves it alone — the mode
        // literal is left as the only variable between the two halves below.
        await ensurePayPalConfigured({ disbursement_delay_period: '' }, 'ON_ORDER_COMPLETE');

        const money = await placeAndCapture(browser, [vendor1ProductId]);
        test.skip(!money.approval.approved, money.approval.reason);
        await assertCaptured(money);

        const payableId = money.payableOrderIds[0] ?? money.parentOrderId;
        const payable = await readOrder(payableId);
        expect(metaString(payable, META.disbursementMode), `order ${payableId} must carry ON_ORDER_COMPLETE for this case to be about ON_ORDER_COMPLETE orders`).toBe('ON_ORDER_COMPLETE');
        expect(metaString(payable, META.balanceAdded), `order ${payableId} must be parked ('no'), which is the state the daily query's second meta condition looks for`).toBe('no');
        expect(
            payable.status,
            `the order must be in a status the daily query accepts ('processing' or 'completed', Order/OrderController.php:399) — otherwise its absence from the result set would be explained by the status rather than by the mode, and this case would prove nothing`,
        ).toMatch(/^(processing|completed)$/);

        const parkedBefore = parkedWithdraw(payable);
        expect(
            parkedBefore,
            `the parked payload ${META.withdrawData} must exist before the schedule runs. It is what a wrongly-queued order would consume, so without it there is nothing for the negative below to protect. Meta: ${JSON.stringify(payable.meta[META.withdrawData] ?? null)}`,
        ).not.toBeNull();

        // DIAGNOSTICS ONLY. `delayedDisbursementCandidates()` is a hand-written mirror of the product's
        // meta_query, so it is quoted in the assertion messages below and never asserted on — asserting
        // on it would be asserting on SQL this file wrote, and would stay green with
        // handle_custom_query_var() deleted. The assertions run the product's OWN daily job instead.
        const cutoff = disbursementCutoffGmt(0);
        const mirrorDelayed = await delayedDisbursementCandidates('DELAYED', cutoff);
        const mirrorOwnMode = await delayedDisbursementCandidates('ON_ORDER_COMPLETE', cutoff);

        // NEGATIVE HALF — drive the real `dokan_paypal_mp_daily_schedule` end to end against this
        // ON_ORDER_COMPLETE order. Short budget on purpose: this half is EXPECTED to time out, exactly
        // as PP-DIS-07's unmatured half is, and a long budget would only slow the run down.
        const queuedRun = await runDelayedDisbursementSchedule(async () => {
            const order = await readOrder(payableId);
            return metaString(order, META.balanceAdded) === 'yes';
        }, 30_000);

        const afterSchedule = await readOrder(payableId);
        const scheduleNotes = await getOrderNotes(payableId);

        expect(
            metaString(afterSchedule, META.balanceAdded),
            `the daily delayed-disbursement job must NEVER release an ON_ORDER_COMPLETE order. handle_custom_query_var() matches the LITERAL string 'DELAYED' (Order/OrderController.php:430-437), so the exclusion is structural — and it has to stay structural, because ON_ORDER_COMPLETE orders are released by the status hook instead (Order/OrderController.php:342-373). An order reachable by BOTH paths is disbursed twice: two referenced payouts to the vendor for one customer payment, and the second cannot be pulled back once PayPal has moved it. ` +
                `Schedule trace: ${queuedRun.trace}. Diagnostic mirror of the selection at cutoff ${cutoff} — rows for 'DELAYED': ${JSON.stringify(mirrorDelayed ?? null)}, rows for 'ON_ORDER_COMPLETE': ${JSON.stringify(mirrorOwnMode ?? null)}. Notes: ${JSON.stringify(scheduleNotes.slice(0, 8) ?? null)}`,
        ).toBe('no');

        const rowsAfterSchedule = (await balanceRows([payableId])).filter(row => row.trn_type === 'dokan_withdraw');
        expect(
            rowsAfterSchedule,
            `the daily job must book no ${TABLE.vendorBalance} 'dokan_withdraw' row for order ${payableId}. That row is what makes the payout real on the Dokan side, and the status hook still has to book its own one later — a row here means the vendor is credited twice for a single customer payment. Rows: ${JSON.stringify(rowsAfterSchedule ?? null)}`,
        ).toEqual([]);

        expect(
            parkedWithdraw(afterSchedule),
            `the parked payload must survive the schedule run UNCHANGED: a job that correctly skipped this order cannot have consumed the payload the status hook still needs (_disburse_payment() reads it back verbatim at Order/OrderManager.php:906). Before: ${JSON.stringify(parkedBefore ?? null)}, after: ${JSON.stringify(afterSchedule.meta[META.withdrawData] ?? null)}`,
        ).toEqual(parkedBefore);

        // POSITIVE CONTROL — the same order, the same driver, NO second capture. Only the discriminating
        // input changes: the mode literal the product's own query matches on. Without this half, "not
        // released" would be a statement about a cron that never reached disburse_delayed_payment() at
        // all rather than about the mode.
        await setOrderMeta(payableId, [{ key: META.disbursementMode, value: 'DELAYED' }]);

        const controlRun = await runDelayedDisbursementSchedule(async () => {
            const order = await readOrder(payableId);
            return metaString(order, META.balanceAdded) === 'yes';
        });

        const afterControl = await readOrder(payableId);
        const controlNotes = await getOrderNotes(payableId);

        expect(
            controlRun.ok && metaString(afterControl, META.balanceAdded),
            `control: the SAME schedule driver, on the SAME order, must RELEASE it once its ${META.disbursementMode} meta reads the literal 'DELAYED'. If it does not, the negative above proves nothing — it would be measuring a cron that never ran rather than a mode the query deliberately excludes. Two causes look identical from here and the order notes tell them apart: "Could not disbursed fund to vendor" is PayPal refusing the referenced payout (check the partner app's referenced-payouts capability), no note at all means the background queue never ran. Trace: ${controlRun.trace}. Notes: ${JSON.stringify(controlNotes.slice(0, 8) ?? null)}`,
        ).toBe('yes');

        const controlRows = (await balanceRows([payableId])).filter(row => row.trn_type === 'dokan_withdraw');
        expect(
            controlRows.length,
            `the control release must book EXACTLY ONE ${TABLE.vendorBalance} 'dokan_withdraw' row for order ${payableId} — that single row is what the negative half above proved the ON_ORDER_COMPLETE run did not produce, so its count is the whole difference between the two halves. Rows: ${JSON.stringify(controlRows ?? null)}`,
        ).toBe(1);

        log.success(
            `PP-DIS-04: the real daily schedule left order ${payableId} parked while its mode read ON_ORDER_COMPLETE (${queuedRun.trace}) and released it once the mode literal read DELAYED (${controlRun.trace}), so the two release paths cannot both claim one order.`,
        );
    }

    async ppDis05({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        const blocked = await unpayableReason(['vendor1']);
        test.skip(blocked !== null, blocked ?? '');

        const configuredDelay = '3';
        await ensurePayPalConfigured({ disbursement_delay_period: configuredDelay }, 'DELAYED');

        const money = await placeAndCapture(browser, [vendor1ProductId]);
        test.skip(!money.approval.approved, money.approval.reason);
        await assertCaptured(money);

        const payableId = money.payableOrderIds[0] ?? money.parentOrderId;
        const payable = await readOrder(payableId);

        expect(metaString(payable, META.disbursementMode), `order ${payableId} must carry ${META.disbursementMode}=DELAYED — the exact literal the daily query matches on`).toBe('DELAYED');
        expect(
            metaString(payable, META.balanceAdded),
            `DELAYED must park rather than credit. A 'yes' here means the vendor was paid out immediately despite the marketplace configuring a holding period`,
        ).toBe('no');

        const parked = parkedWithdraw(payable);
        expect(parked, `the parked payload ${META.withdrawData} must exist — the daily job reads it back verbatim (Order/OrderManager.php:906). Meta: ${JSON.stringify(payable.meta[META.withdrawData] ?? null)}`).not.toBeNull();
        expect(parked?.amount ?? 0, `the parked payload must carry a positive amount. Payload: ${JSON.stringify(parked ?? null)}`).toBeGreaterThan(0);

        await assertMoneyReconciles(payableId, parked?.amount ?? 0, 'PP-DIS-05');

        // Where the delay actually lives. The catalogue expects the parked RECORD to carry it; the
        // product does not put it there — `insert_vendor_withdraw_balance()` stores only
        // vendor_id / order_id / amount (Order/OrderManager.php:765-767), and the delay is applied at
        // QUERY time from the live setting (Order/OrderController.php:385-391). The delay is therefore
        // asserted where it is actually kept, and the divergence is stated rather than glossed over.
        const settings = (await dbUtils.getOptionValueOrNull(SETTINGS_OPTION)) as Record<string, unknown> | null;
        expect(
            String(settings?.['disbursement_delay_period'] ?? ''),
            `the configured delay must be readable from the gateway settings, because that is the ONLY place it is kept: Helper::get_disbursement_delay_period() reads it live on every run of the daily job (Helper.php:777-782). Settings read back: ${JSON.stringify(settings?.['disbursement_delay_period'] ?? null)}`,
        ).toBe(configuredDelay);

        expect(
            Object.keys((payable.meta[META.withdrawData] ?? {}) as Record<string, unknown>).sort(),
            `the parked record's shape is load-bearing for the release path, which reads it back unchanged. It carries vendor_id / order_id / amount and NOT the delay — an extra or missing key here means _disburse_payment() would insert a different payload than the capture recorded. Record: ${JSON.stringify(payable.meta[META.withdrawData] ?? null)}`,
        ).toEqual(['amount', 'order_id', 'vendor_id']);

        log.warn(
            'PP-DIS-05: the parked record does NOT carry the configured delay — by design. The delay lives only in the gateway settings and is applied when the daily job builds its date window (Order/OrderController.php:385-391), which means changing the setting retroactively re-times every already-parked order. Reported as an observation, not filed: no money is misdirected by it.',
        );
        log.success(`PP-DIS-05: order ${payableId} parked ${parked?.amount} under a ${configuredDelay}-day delay.`);
    }

    async ppDis06({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        const blocked = await unpayableReason(['vendor1']);
        test.skip(blocked !== null, blocked ?? '');

        await ensurePayPalConfigured({ disbursement_delay_period: '3' }, 'DELAYED');

        const money = await placeAndCapture(browser, [vendor1ProductId]);
        test.skip(!money.approval.approved, money.approval.reason);
        await assertCaptured(money);

        const payableId = money.payableOrderIds[0] ?? money.parentOrderId;
        const before = await readOrder(payableId);
        const parked = parkedWithdraw(before);
        expect(metaString(before, META.balanceAdded), 'baseline: the funds must be parked before the schedule runs, or a release afterwards cannot be attributed to it').toBe('no');

        // Mature the order by ageing it past the configured window. This changes WHEN the product's own
        // query considers the order due; it writes nothing this case asserts on, and the release state
        // read back below is produced entirely by the product.
        const matured = daysAgoGmt(10);
        await dbUtils.setOrderDate(payableId, matured);
        if (money.childIds.length) {
            await dbUtils.setOrderDate(money.parentOrderId, matured);
        }

        const candidates = await delayedDisbursementCandidates('DELAYED', disbursementCutoffGmt(3));
        expect(
            candidates.map(row => String(row.id)),
            `pre-flight: order ${payableId} must be selectable by the daily query once matured, or the schedule below would have nothing to release and its no-op would look like a product failure. Matches: ${JSON.stringify(candidates ?? null)}`,
        ).toContain(payableId);

        const run = await runDelayedDisbursementSchedule(async () => {
            const order = await readOrder(payableId);
            return metaString(order, META.balanceAdded) === 'yes';
        });

        const after = await readOrder(payableId);
        const notes = await getOrderNotes(payableId);

        expect(
            run.ok && metaString(after, META.balanceAdded),
            `the daily schedule must release matured delayed funds for order ${payableId}. The chain is dokan_paypal_mp_daily_schedule -> disburse_delayed_payment() (Order/OrderController.php:382-417) -> DelayDisburseFund::task() (BackgroundProcess/DelayDisburseFund.php:84-115) -> OrderManager::_disburse_payment() (Order/OrderManager.php:887-923), and the last link asks PayPal for a REFERENCED PAYOUT. ` +
                `A stuck 'no' means matured vendor funds are never paid out at all — the marketplace holds them indefinitely. Two causes look identical from here and the order notes tell them apart: "Could not disbursed fund to vendor" is PayPal refusing the payout (check the partner app has the referenced-payouts capability), no note at all means the background queue never ran. Schedule trace: ${run.trace}. Notes: ${JSON.stringify(notes.slice(0, 8) ?? null)}`,
        ).toBe('yes');

        const rows = (await balanceRows([payableId])).filter(row => row.trn_type === 'dokan_withdraw');
        expect(rows.length, `the release must book exactly one 'dokan_withdraw' ledger row for order ${payableId}. Rows: ${JSON.stringify(rows ?? null)}`).toBe(1);

        const credited = Number(rows[0]?.credit ?? 0);
        expect(
            credited,
            `the released amount must equal the parked amount — the job passes the stored payload straight to insert_vendor_withdraw_balance() with insert_now=true (Order/OrderManager.php:906-907). Parked: ${JSON.stringify(parked ?? null)}, row: ${JSON.stringify(rows[0] ?? null)}`,
        ).toBeCloseTo(parked?.amount ?? -1, 2);

        await assertMoneyReconciles(payableId, credited, 'PP-DIS-06');

        log.success(`PP-DIS-06: the daily schedule released ${credited} for matured order ${payableId} (${run.trace}).`);
    }

    async ppDis07({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        const blocked = await unpayableReason(['vendor1']);
        test.skip(blocked !== null, blocked ?? '');

        // The documented maximum, so an order created today is nowhere near mature.
        await ensurePayPalConfigured({ disbursement_delay_period: '29' }, 'DELAYED');

        const money = await placeAndCapture(browser, [vendor1ProductId]);
        test.skip(!money.approval.approved, money.approval.reason);
        await assertCaptured(money);

        const payableId = money.payableOrderIds[0] ?? money.parentOrderId;
        const before = await readOrder(payableId);
        const parkedBefore = parkedWithdraw(before);
        expect(metaString(before, META.balanceAdded), 'baseline: the funds must be parked before the schedule runs').toBe('no');

        const unmaturedRun = await runDelayedDisbursementSchedule(
            async () => {
                const order = await readOrder(payableId);
                return metaString(order, META.balanceAdded) === 'yes';
            },
            30_000, // Short: we WANT this to time out. A long budget would only slow the run down.
        );

        const afterUnmatured = await readOrder(payableId);
        expect(
            metaString(afterUnmatured, META.balanceAdded),
            `order ${payableId} was created today under a 29-day hold and must NOT be released. The date window is built in disburse_delayed_payment() (Order/OrderController.php:383-391); releasing early hands the vendor money the marketplace deliberately held for vetting, and it cannot be pulled back — _disburse_payment() has already asked PayPal for the payout. Schedule trace: ${unmaturedRun.trace}`,
        ).toBe('no');

        const parkedAfter = parkedWithdraw(afterUnmatured);
        expect(
            parkedAfter,
            `the parked record must survive the schedule run UNCHANGED — the job that skipped it must not have consumed it. Before: ${JSON.stringify(parkedBefore ?? null)}, after: ${JSON.stringify(parkedAfter ?? null)}`,
        ).toEqual(parkedBefore);

        const rowsWhileUnmatured = (await balanceRows([payableId])).filter(row => row.trn_type === 'dokan_withdraw');
        expect(rowsWhileUnmatured, `no ledger row may exist for an unmatured order. Rows: ${JSON.stringify(rowsWhileUnmatured ?? null)}`).toEqual([]);

        // The control. "No release" is trivially true if the schedule never ran at all, so the SAME
        // order is now aged past the window and the SAME driver is run again: it must release. Without
        // this half, a broken cron driver would make this case green forever.
        await dbUtils.setOrderDate(payableId, daysAgoGmt(40));
        if (money.childIds.length) {
            await dbUtils.setOrderDate(money.parentOrderId, daysAgoGmt(40));
        }

        const maturedRun = await runDelayedDisbursementSchedule(async () => {
            const order = await readOrder(payableId);
            return metaString(order, META.balanceAdded) === 'yes';
        });

        const notes = await getOrderNotes(payableId);
        expect(
            maturedRun.ok,
            `control: the same schedule driver must RELEASE the same order once it is aged past the window. If it does not, the "not released early" result above proves nothing — it would be measuring a schedule that never ran. Trace: ${maturedRun.trace}. Notes: ${JSON.stringify(notes.slice(0, 8) ?? null)}`,
        ).toBe(true);

        log.success(`PP-DIS-07: order ${payableId} survived the schedule unmatured (${unmaturedRun.trace}) and released once aged (${maturedRun.trace}).`);
    }

    async ppDis08({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        // DELAYED first: the module's own admin JS hides the delay-period row whenever the mode is
        // INSTANT (PaymentMethods/PayPal.php:512-519), so on an INSTANT gateway this case would be
        // typing into a hidden field.
        await ensurePayPalConfigured({ disbursement_delay_period: '7' }, 'DELAYED');

        // An explicit ADMIN context rather than the shared `page` fixture, matching the settings spec:
        // this is the one case in the file that acts as the admin, and the rest act as the customer.
        const adminCtx = await browser.newContext({ storageState: adminAuth });
        const page = await adminCtx.newPage();
        try {
            const paypal = new PayPalMarketplacePage(page);
            await paypal.gotoGatewaySettings();

            const field = page.locator(DELAY_PERIOD_FIELD);
            await expect(
                field,
                `the Disbursement Delay Period field must be visible while the mode is DELAYED. It is declared at templates/admin-gateway-settings.php:154-166 and revealed by the module's own disbursementPeriodToggle() (PaymentMethods/PayPal.php:512-519); if it is hidden here the admin has no way to set a holding period at all`,
            ).toBeVisible({ timeout: 30_000 });

            expect(
                await field.getAttribute('max'),
                `the field must advertise the documented maximum of 29 days. It comes from custom_attributes at templates/admin-gateway-settings.php:163-166 and is the only browser-native guard on the value; PayPal itself refuses to hold funds beyond 29 days, so a larger figure would silently never be honoured`,
            ).toBe('29');

            // `fill()` dispatches the native input+change pair, which is what the module's own validator
            // is bound to (PaymentMethods/PayPal.php:486). Reading back with `toHaveValue()` is correct
            // here — the question is what the live control HOLDS after the product's JS ran, not how it
            // is serialised into HTML (which is the escaping question, and the reason PP-XSS reads
            // outerHTML instead).
            await field.fill('45');
            await field.dispatchEvent('change');

            await expect(
                field,
                `entering a delay above the maximum must be clamped to 29 by the module's own validator (disbursementPeriodValidation(), PaymentMethods/PayPal.php:521-527). Without the clamp the admin can save a holding period PayPal will not honour, and every order under it is held on a promise the gateway cannot keep`,
            ).toHaveValue('29', { timeout: 15_000 });

            await paypal.save();

            const settings = (await dbUtils.getOptionValueOrNull(SETTINGS_OPTION)) as Record<string, unknown> | null;
            expect(
                String(settings?.['disbursement_delay_period'] ?? ''),
                `the SAVED delay period must be the clamped 29, not the 45 that was typed. This is what Helper::get_disbursement_delay_period() (Helper.php:777-782) hands the daily job on every run. Settings: ${JSON.stringify(settings?.['disbursement_delay_period'] ?? null)}`,
            ).toBe('29');
        } finally {
            await page.close();
            await adminCtx.close();
        }

        log.warn(
            'PP-DIS-08: the clamp asserted above is CLIENT-side only. Helper::get_disbursement_delay_period() (Helper.php:777-782) returns whatever integer is stored, unclamped; the server-side clamp lives further along, in disburse_delayed_payment() (Order/OrderController.php:388), where the interval is capped at 29 before the date window is built. So a value written past the UI — REST, WP-CLI, an importer — is stored verbatim but still cannot delay a payout beyond 29 days. No money is misdirected by it; reported as an observation.',
        );
        log.success('PP-DIS-08: the delay period clamps to the documented maximum of 29 through the real admin form.');
    }

    async ppDis09({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        const blocked = await unpayableReason(['vendor1']);
        test.skip(blocked !== null, blocked ?? '');

        // Cleared, not seven. `Helper::get_disbursement_delay_period()` is `! empty( $settings[$key] ) ?
        // (int) ... : 0` (Helper.php:777-782), so an empty value yields 0 — while the FORM advertises a
        // default of 7 (templates/admin-gateway-settings.php:159). PP-SET-16 owns the form half.
        await ensurePayPalConfigured({ disbursement_delay_period: '' }, 'DELAYED');

        const settings = (await dbUtils.getOptionValueOrNull(SETTINGS_OPTION)) as Record<string, unknown> | null;
        expect(
            String(settings?.['disbursement_delay_period'] ?? ''),
            `the delay period must actually be cleared for this case to be about a cleared delay. Settings: ${JSON.stringify(settings?.['disbursement_delay_period'] ?? null)}`,
        ).toBe('');

        const money = await placeAndCapture(browser, [vendor1ProductId]);
        test.skip(!money.approval.approved, money.approval.reason);
        await assertCaptured(money);

        const payableId = money.payableOrderIds[0] ?? money.parentOrderId;
        const before = await readOrder(payableId);
        expect(metaString(before, META.balanceAdded), 'baseline: a DELAYED order still parks at capture regardless of the delay length').toBe('no');

        // The order is created TODAY and nothing ages it. With an effective delay of 0 the cutoff is the
        // end of today, so it is mature at once; with the form's default of 7 it would not mature for a
        // week. The two answers are therefore distinguishable by this single run.
        const run = await runDelayedDisbursementSchedule(async () => {
            const order = await readOrder(payableId);
            return metaString(order, META.balanceAdded) === 'yes';
        });

        const after = await readOrder(payableId);
        const notes = await getOrderNotes(payableId);

        expect(
            run.ok && metaString(after, META.balanceAdded),
            `with the delay period CLEARED, a same-day delayed order must be released on the very next run of the schedule. The effective delay is Helper::get_disbursement_delay_period() -> 0 (Helper.php:777-782), so disburse_delayed_payment() never subtracts an interval and the window ends at today 23:59:59 (Order/OrderController.php:383-391). ` +
                `If this order is still parked, the effective delay is NOT zero — most likely the form's default of seven days (templates/admin-gateway-settings.php:159) leaked into the server-side read, which would mean every marketplace that clears the field silently holds vendor funds for a week without being told. Schedule trace: ${run.trace}. Notes: ${JSON.stringify(notes.slice(0, 8) ?? null)}`,
        ).toBe('yes');

        const rows = (await balanceRows([payableId])).filter(row => row.trn_type === 'dokan_withdraw');
        expect(rows.length, `the same-day release must book exactly one ledger row. Rows: ${JSON.stringify(rows ?? null)}`).toBe(1);

        log.success(`PP-DIS-09: a cleared delay period released order ${payableId} the same day (${run.trace}), matching the PHP fallback of 0 rather than the form default of 7.`);
    }

    async ppDis10({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        const blocked = await unpayableReason(['vendor1']);
        test.skip(blocked !== null, blocked ?? '');

        await ensurePayPalConfigured({}, 'ON_ORDER_COMPLETE');
        const status = await getPayPalStatus();
        expect(status.disbursement_mode, 'the gateway must be in ON_ORDER_COMPLETE mode — the whole point of this case is that PayPal is told something else').toBe('ON_ORDER_COMPLETE');

        // No capture here, deliberately: the payment instruction is decided when the purchase unit is
        // built (OrderManager.php:209), which happens at order creation. This case therefore costs no
        // money and still reads the real outgoing instruction from PayPal's own copy of the order.
        let orderId = '';
        let paypalOrderId = '';

        await withCustomer(browser, async (page, paypal) => {
            await stockCart(paypal, [vendor1ProductId]);
            await page.goto(CLASSIC.url, { waitUntil: 'domcontentloaded' });
            await expect(page.locator(CLASSIC.placeOrder), 'the classic checkout page must render the order form').toBeAttached({ timeout: 60_000 });
            await selectClassicPayPal(page);

            const result = await submitClassicCheckout(page);
            expect(result.__error ?? null, 'the classic checkout POST must reach WC_Checkout::process_checkout()').toBeNull();
            expect(result.result, `the checkout must succeed so a PayPal order exists to inspect. Messages: ${String(result.messages ?? result.message ?? '(none)').slice(0, 400)}`).toBe('success');

            orderId = String(result.id ?? '');
            paypalOrderId = String(result.paypal_order_id ?? '');
            if (orderId) {
                createdOrderIds.push(orderId);
            }
            expect(paypalOrderId, `PayPal::process_payment() must return a paypal_order_id. Response: ${JSON.stringify(result ?? null).slice(0, 400)}`).not.toBe('');
        });

        const childIds = await dbUtils.getChildOrderIds(orderId);
        createdOrderIds.push(...childIds);
        const payableId = childIds[0] ?? orderId;
        const payable = await readOrder(payableId);

        expect(
            metaString(payable, META.disbursementMode),
            `Dokan must record the ORIGINAL mode on order ${payableId}. It is what OrderController::order_status_changed() matches on to decide whether completing the order releases the funds (Order/OrderController.php:362); flattening it to DELAYED here would strand the order between the two release paths, released by neither`,
        ).toBe('ON_ORDER_COMPLETE');

        const paypalOrder = await getPayPalOrder(paypalOrderId);
        const units = unitsByOrderId(paypalOrder);
        const unit = units[payableId];

        expect(unit ?? null, `PayPal must hold a purchase unit for order ${payableId}. Units seen: ${JSON.stringify(Object.keys(units) ?? null)}`).not.toBeNull();
        expect(
            unit?.disbursementMode,
            `PayPal must be told DELAYED, not ON_ORDER_COMPLETE. PayPal's API has no such value — make_purchase_unit_data() maps every non-INSTANT mode onto the literal 'DELAYED' (Order/OrderManager.php:209), and sending an unknown enum would have PayPal reject the whole order, so no customer could check out at all. Unit: ${JSON.stringify(unit ?? null)}`,
        ).toBe('DELAYED');

        expect(
            unit?.merchantId,
            `the purchase unit must still name vendor 1's own merchant id as payee — holding the funds changes WHEN the vendor is paid, never WHO. Unit: ${JSON.stringify(unit ?? null)}`,
        ).toBe(PAYPAL_MERCHANTS.vendor1);

        log.success(`PP-DIS-10: Dokan holds ON_ORDER_COMPLETE for order ${payableId} while PayPal was told DELAYED — the distinction is Dokan-side only, as designed.`);
    }

    async ppDis11({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        const blocked = await unpayableReason(['vendor1']);
        test.skip(blocked !== null, blocked ?? '');

        await ensurePayPalConfigured({ disbursement_delay_period: '' }, 'DELAYED');

        const money = await placeAndCapture(browser, [vendor1ProductId]);
        test.skip(!money.approval.approved, money.approval.reason);
        await assertCaptured(money);

        const payableId = money.payableOrderIds[0] ?? money.parentOrderId;
        const parked = parkedWithdraw(await readOrder(payableId));

        const run = await runDelayedDisbursementSchedule(async () => {
            const order = await readOrder(payableId);
            return metaString(order, META.balanceAdded) === 'yes';
        });
        const notes = await getOrderNotes(payableId);
        expect(
            run.ok,
            `the delayed funds must be released before this case can inspect what the release booked. Schedule trace: ${run.trace}. Notes: ${JSON.stringify(notes.slice(0, 8) ?? null)}`,
        ).toBe(true);

        // What the release actually books, and why "reverse" is the right word for it: the vendor was
        // paid by PayPal DIRECTLY at capture, so Dokan books an auto-approved withdrawal that nets the
        // same amount OUT of their withdrawable balance. Vendor::get_balance() is SUM(debit) − SUM(credit)
        // (dokan-lite includes/Vendor/Vendor.php:880-905), so this credit row is the reversal.
        const withdrawLedger = (await balanceRows([payableId])).filter(row => row.trn_type === 'dokan_withdraw');
        expect(
            withdrawLedger.length,
            `the release must book exactly one reversing entry in ${TABLE.vendorBalance} for order ${payableId}. Vendor::get_balance() subtracts credit rows, so this row is what stops the vendor withdrawing money PayPal already sent them a second time. Rows: ${JSON.stringify(withdrawLedger ?? null)}`,
        ).toBe(1);
        expect(
            Number(withdrawLedger[0]?.credit ?? 0),
            `the reversing entry must be for the parked amount. Parked: ${JSON.stringify(parked ?? null)}, row: ${JSON.stringify(withdrawLedger[0] ?? null)}`,
        ).toBeCloseTo(parked?.amount ?? -1, 2);
        expect(
            Number(withdrawLedger[0]?.vendor_id ?? 0),
            `the reversing entry must be booked against vendor ${VENDOR_ID}, the vendor PayPal actually paid. Row: ${JSON.stringify(withdrawLedger[0] ?? null)}`,
        ).toBe(Number(VENDOR_ID));

        const withdraws = await withdrawRows(payableId);
        expect(
            withdraws.length,
            `the release must also book exactly one auto-approved withdraw request (Order/OrderManager.php:822-834) so the payout is visible on the vendor's Withdraw screen rather than only in the balance arithmetic. Rows: ${JSON.stringify(withdraws ?? null)}`,
        ).toBe(1);
        expect(
            withdraws[0]?.method,
            `the withdraw request must be attributed to this gateway, or the vendor cannot tell which payout it was. Row: ${JSON.stringify(withdraws[0] ?? null)}`,
        ).toBe(PAYPAL_IDS.gateway);

        // The literal `wp_dokan_reverse_withdrawal` ledger. Whether a row belongs there is a SITE
        // SETTING, not something this module does: Dokan Lite inserts one only when the order's gateway
        // is listed in dokan_reverse_withdrawal[payment_gateways]
        // (includes/ReverseWithdrawal/Hooks.php:204-236), and that list is `['cod']` plus whatever the
        // `dokan_reverse_withdrawal_payment_gateways` filter adds (SettingsHelper.php:150-163). This
        // module registers no such filter — its own ReverseWithdrawal class only swaps merchant ids for
        // reverse-withdrawal CARTS. So the config is read first and the assertion follows it, rather
        // than asserting a row that the product was never asked to create.
        const reverseSettings = (await dbUtils.getOptionValueOrNull('dokan_reverse_withdrawal')) as Record<string, unknown> | null;
        const enabledGateways = Object.values((reverseSettings?.['payment_gateways'] ?? {}) as Record<string, unknown>).map(value => String(value)).filter(Boolean);
        const gatewayEnabled = enabledGateways.includes(PAYPAL_IDS.gateway);
        const reverseRows = await reverseWithdrawalRows(payableId);

        if (gatewayEnabled) {
            expect(
                reverseRows.length,
                `dokan_reverse_withdrawal[payment_gateways] lists ${PAYPAL_IDS.gateway} (${JSON.stringify(enabledGateways)}), so completing an order paid through it must book an order_commission entry in ${TABLE.reverseWithdrawal} — the admin's commission is owed back by the vendor because PayPal paid the vendor directly. Rows: ${JSON.stringify(reverseRows ?? null)}`,
            ).toBe(1);
        } else {
            expect(
                reverseRows,
                `dokan_reverse_withdrawal[payment_gateways] does NOT list ${PAYPAL_IDS.gateway} (enabled: ${JSON.stringify(enabledGateways)}), so no ${TABLE.reverseWithdrawal} entry may appear for order ${payableId}. One appearing anyway would mean the vendor is billed for a commission PayPal already deducted as the platform fee — charged twice for the same sale. Rows: ${JSON.stringify(reverseRows ?? null)}`,
            ).toEqual([]);
            log.warn(
                `PP-DIS-11: no wp_dokan_reverse_withdrawal row is expected on this site. Reverse withdrawal is gateway-scoped and ${PAYPAL_IDS.gateway} is not in dokan_reverse_withdrawal[payment_gateways] (default: cod only, dokan-lite includes/ReverseWithdrawal/SettingsHelper.php:150-163), and this module registers no dokan_reverse_withdrawal_payment_gateways filter. The reversal that DOES happen on release is the auto-approved withdraw + balance credit asserted above. Reported so the catalogue wording can be reconciled; not filed as a defect.`,
            );
        }

        log.success(`PP-DIS-11: the delayed release reversed ${withdrawLedger[0]?.credit} out of vendor ${VENDOR_ID}'s withdrawable balance and booked one withdraw request.`);
    }

    async ppDis12({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        const blocked = await unpayableReason(['vendor1']);
        test.skip(blocked !== null, blocked ?? '');

        await ensurePayPalConfigured({}, 'ON_ORDER_COMPLETE');

        const money = await placeAndCapture(browser, [vendor1ProductId]);
        test.skip(!money.approval.approved, money.approval.reason);
        await assertCaptured(money);

        const payableId = money.payableOrderIds[0] ?? money.parentOrderId;
        expect(metaString(await readOrder(payableId), META.balanceAdded), 'baseline: the funds must be parked before the first completion').toBe('no');

        await setOrderStatus(payableId, 'completed');
        const firstRelease = await waitUntil(async () => {
            const order = await readOrder(payableId);
            return metaString(order, META.balanceAdded) === 'yes';
        }, 90_000);

        const notes = await getOrderNotes(payableId);
        expect(
            firstRelease,
            `the FIRST completion must release the funds, or "not released twice" would be trivially true and this case would pass on a gateway that never pays anybody. _disburse_payment() (Order/OrderManager.php:887-923) records its gateway error as an order note rather than raising — look for "Could not disbursed fund to vendor". Notes: ${JSON.stringify(notes.slice(0, 8) ?? null)}`,
        ).toBe(true);

        const afterFirst = (await balanceRows([payableId])).filter(row => row.trn_type === 'dokan_withdraw');
        expect(afterFirst.length, `exactly one ledger row after the first release. Rows: ${JSON.stringify(afterFirst ?? null)}`).toBe(1);

        // Back and forward again — the transition a shop manager makes when they complete an order by
        // mistake, or when a fulfilment plugin flips the status.
        await setOrderStatus(payableId, 'processing');
        await setOrderStatus(payableId, 'completed');
        // The second release, if it happened, would be asynchronous only in the PayPal call; the ledger
        // write is synchronous inside the status change. Give it a settling window anyway so a slow
        // second payout cannot be missed.
        await sleep(15_000);

        const afterSecond = (await balanceRows([payableId])).filter(row => row.trn_type === 'dokan_withdraw');
        expect(
            afterSecond.length,
            `completing order ${payableId} a second time must NOT release again. Two guards stand between: order_status_changed() returns early when ${META.balanceAdded} is already 'yes' (Order/OrderController.php:367-369), and insert_vendor_withdraw_balance() re-checks the same meta and the existing ledger row (Order/OrderManager.php:773-789). ` +
                `A second row means a second REFERENCED PAYOUT was requested from PayPal for one customer payment — the marketplace pays the vendor twice out of its own funds, and nothing here can claw it back. Rows: ${JSON.stringify(afterSecond ?? null)}`,
        ).toBe(1);
        expect(
            afterSecond[0]?.id,
            `the surviving ledger row must be the ORIGINAL one, not a replacement. A different id means the first row was deleted and re-inserted, which would hide a double payout behind an unchanged count. First: ${JSON.stringify(afterFirst[0] ?? null)}, now: ${JSON.stringify(afterSecond[0] ?? null)}`,
        ).toBe(afterFirst[0]?.id);

        const withdraws = await withdrawRows(payableId);
        expect(
            withdraws.length,
            `exactly one auto-approved withdraw request must exist after the round trip. Two would double-count the payout on the vendor's Withdraw screen as well as in the balance. Rows: ${JSON.stringify(withdraws ?? null)}`,
        ).toBe(1);

        log.success(`PP-DIS-12: order ${payableId} released exactly once across completed -> processing -> completed.`);
    }

    async ppDis13({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        const blocked = await unpayableReason(['vendor1']);
        test.skip(blocked !== null, blocked ?? '');

        const vendorAuthHeaders = payloads.vendorAuth as Record<string, string>;
        const opening = await vendorBalance(vendorAuthHeaders);

        // Order A — released. ON_ORDER_COMPLETE, then completed, so the release runs through the status
        // hook rather than the cron; the case is about the resulting BALANCE either way.
        await ensurePayPalConfigured({}, 'ON_ORDER_COMPLETE');
        const releasedMoney = await placeAndCapture(browser, [vendor1ProductId]);
        test.skip(!releasedMoney.approval.approved, releasedMoney.approval.reason);
        await assertCaptured(releasedMoney);
        const releasedId = releasedMoney.payableOrderIds[0] ?? releasedMoney.parentOrderId;

        await setOrderStatus(releasedId, 'completed');
        const releaseOk = await waitUntil(async () => {
            const order = await readOrder(releasedId);
            return metaString(order, META.balanceAdded) === 'yes';
        }, 90_000);
        const releasedNotes = await getOrderNotes(releasedId);
        expect(
            releaseOk,
            `order ${releasedId} must actually be released, or this case has no released order to distinguish from the parked one. Notes: ${JSON.stringify(releasedNotes.slice(0, 8) ?? null)}`,
        ).toBe(true);

        // Order B — parked. DELAYED with the maximum window, so nothing can release it during this case.
        await ensurePayPalConfigured({ disbursement_delay_period: '29' }, 'DELAYED');
        const parkedMoney = await placeAndCapture(browser, [vendor1ProductId]);
        test.skip(!parkedMoney.approval.approved, parkedMoney.approval.reason);
        await assertCaptured(parkedMoney);
        const parkedId = parkedMoney.payableOrderIds[0] ?? parkedMoney.parentOrderId;

        expect(metaString(await readOrder(parkedId), META.balanceAdded), `order ${parkedId} must still be parked, or the two orders are in the same state and the case cannot tell them apart`).toBe('no');

        const releasedRows = (await balanceRows([releasedId])).filter(row => row.trn_type === 'dokan_withdraw');
        const parkedRows = (await balanceRows([parkedId])).filter(row => row.trn_type === 'dokan_withdraw');

        expect(
            releasedRows.length,
            `the RELEASED order must carry a withdraw ledger row — that row is what marks the money as already sent to the vendor. Rows: ${JSON.stringify(releasedRows ?? null)}`,
        ).toBe(1);
        expect(
            parkedRows,
            `the PARKED order must carry NO withdraw ledger row. If it did, the vendor's withdrawable balance would already be netted against a payout PayPal has not made — they would appear to have been paid for a sale still under hold. Rows: ${JSON.stringify(parkedRows ?? null)}`,
        ).toEqual([]);

        const closing = await vendorBalance(vendorAuthHeaders);
        const ourRows = await balanceRows([releasedId, parkedId]);
        const ledgerDelta = ourRows.reduce((sum, row) => sum + Number(row.debit ?? 0) - Number(row.credit ?? 0), 0);

        if (closing.withdrawThreshold > 0) {
            // The accessor windows rows by `balance_date <= now - threshold days`
            // (dokan-lite includes/Vendor/Vendor.php:884-887), so today's rows are deliberately excluded
            // on a site with a holding period. Comparing them would fail a correct product.
            log.warn(
                `PP-DIS-13: this site has a withdraw threshold of ${closing.withdrawThreshold} day(s), so rows created today are outside the window Vendor::get_balance() reads. The accessor-versus-ledger comparison is reported rather than asserted: opening=${opening.currentBalance}, closing=${closing.currentBalance}, ledger delta from these two orders=${ledgerDelta}. The released-versus-parked assertions above are unaffected and did run.`,
            );
        } else {
            expect(
                closing.currentBalance - opening.currentBalance,
                `the vendor's withdrawable balance must move by exactly what these two orders booked. Vendor::get_balance() is SUM(debit) − SUM(credit) over ${TABLE.vendorBalance} (dokan-lite includes/Vendor/Vendor.php:880-905), so the released order contributes its earning AND its reversing credit while the parked one contributes only its earning. ` +
                    `A larger movement means parked funds are already withdrawable — the vendor can take money the marketplace is still holding; a smaller one means released funds went missing from the accessor. opening=${opening.currentBalance}, closing=${closing.currentBalance}, rows for orders ${releasedId} and ${parkedId}: ${JSON.stringify(ourRows ?? null)}`,
            ).toBeCloseTo(ledgerDelta, 2);
        }

        log.success(`PP-DIS-13: only the released order (${releasedId}) is netted out of vendor ${VENDOR_ID}'s balance; the parked one (${parkedId}) is not.`);
    }

    async ppDis14({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);
        test.skip(!HAS_APPROVAL_ACTOR, APPROVAL_ACTOR_SKIP);
        const blocked = await unpayableReason(['vendor1', 'vendor2']);
        test.skip(blocked !== null, blocked ?? '');

        await ensurePayPalConfigured({}, 'INSTANT');

        // Two vendors, so the parent is split and the block-checkout re-split path is exercised — the
        // shape DOK-017's orphan rows come from.
        const money = await placeAndCapture(browser, [vendor1ProductId, vendor2ProductId]);
        test.skip(!money.approval.approved, money.approval.reason);
        await assertCaptured(money);

        expect(
            money.childIds.length,
            `a two-vendor cart must split into one sub order per vendor before any per-vendor money claim can be made. PayPal::process_payment() calls maybe_split_orders() and then builds one purchase unit per sub order (PaymentMethods/PayPal.php:262-276); without the split both vendors' goods are paid to whichever merchant the single unit names. Parent ${money.parentOrderId}, children: ${JSON.stringify(money.childIds ?? null)}`,
        ).toBe(2);

        const parent = await readOrder(money.parentOrderId);
        const paypalOrder = await getPayPalOrder(money.paypalOrderId);
        const units = unitsByOrderId(paypalOrder);

        let netSum = 0;
        let commissionSum = 0;
        let feeSum = 0;
        const expectedMerchants = new Set([PAYPAL_MERCHANTS.vendor1, PAYPAL_MERCHANTS.vendor2]);
        const seenMerchants: string[] = [];

        for (const childId of money.childIds) {
            const child = await readOrder(childId);
            expect(
                metaString(child, META.disbursementMode),
                `sub order ${childId} must carry ${META.disbursementMode}. It is written in the same loop that builds that sub order's purchase unit (PaymentMethods/PayPal.php:273-275), so a missing value means this row was never turned into a payable unit and its vendor is absent from the PayPal order entirely`,
            ).toBe('INSTANT');

            const { net } = await vendorNetFor(childId);
            await assertMoneyReconciles(childId, net, 'PP-DIS-14');

            netSum += net;
            commissionSum += metaNumber(child, META.platformFee);
            feeSum += metaNumber(child, META.processingFee);

            const unit = units[childId];
            expect(
                unit ?? null,
                `PayPal must hold a purchase unit for sub order ${childId}. Units seen: ${JSON.stringify(Object.keys(units) ?? null)}`,
            ).not.toBeNull();
            seenMerchants.push(String(unit?.merchantId ?? 'none'));
        }

        expect(
            [...new Set(seenMerchants)].sort(),
            `each sub order's purchase unit must name ITS OWN vendor's merchant id, and the two must be different merchants. One id appearing twice means both vendors' money went to one account. Seen: ${JSON.stringify(seenMerchants ?? null)}`,
        ).toEqual([...expectedMerchants].sort());

        expect(
            netSum + commissionSum + feeSum,
            `the multi-vendor order must net out: the parent total must equal the sum of every vendor's net, plus the admin commission, plus the PayPal fee, across both sub orders. A gap here is money that belongs to nobody in the ledger while PayPal has already moved it. parent total=${parent.total} ${parent.currency}, vendor nets=${netSum}, admin commission=${commissionSum}, PayPal fees=${feeSum}, children ${JSON.stringify(money.childIds ?? null)}`,
        ).toBeCloseTo(parent.total, 2);

        // The dokan_orders rows this order produced, proven visible to the orphan query before the
        // orphan result is interpreted — an empty orphan list means nothing if the query cannot see our
        // rows in the first place.
        const placeholders = money.childIds.map(() => '?').join(', ');
        const ourSyncRows = (await dbUtils.dbQuery(`SELECT order_id, seller_id FROM \`${TABLE.dokanOrders}\` WHERE order_id IN (${placeholders});`, money.childIds)) as Array<{
            order_id: number;
            seller_id: number;
        }>;

        const orphans = (await dbUtils.dbQuery(
            `SELECT d.order_id, d.seller_id, d.order_status FROM \`${TABLE.dokanOrders}\` d
             LEFT JOIN \`${TABLE.orders}\` o ON o.id = d.order_id
             WHERE o.id IS NULL;`,
        )) as Array<{ order_id: number; seller_id: number; order_status: string }>;

        if (ourSyncRows.length === money.childIds.length) {
            log.success(`PP-DIS-14: the orphan query sees both of this order's ${TABLE.dokanOrders} rows (${JSON.stringify(ourSyncRows)}), so its result below is a real one.`);
        } else {
            log.warn(
                `PP-DIS-14: only ${ourSyncRows.length} of ${money.childIds.length} sub orders have a ${TABLE.dokanOrders} row (${JSON.stringify(ourSyncRows)}). Dokan syncs that table when the order reaches a paid status, so a lag here is expected rather than wrong; the orphan list below is reported without a positive baseline behind it.`,
            );
        }

        // REPORTED, never failed. DOK-017 is an open Low/P3 data-hygiene issue whose money impact is nil
        // — the per-vendor reconciliation above is what proves the money is right — and turning it red
        // would poison a single-worker lane that shares one failure budget across the whole suite. Do
        // not re-file it.
        if (orphans.length > 0) {
            log.warn(
                `PP-DIS-14: ${orphans.length} orphaned ${TABLE.dokanOrders} row(s) reference a WooCommerce order that no longer exists — reported, not failed (DOK-017, open Low/P3): ${JSON.stringify(orphans.slice(0, 10))}`,
            );
        } else {
            log.success(`PP-DIS-14: no orphaned ${TABLE.dokanOrders} rows on the site.`);
        }

        log.success(`PP-DIS-14: the two-vendor order ${money.parentOrderId} reconciles to its parent total and each vendor was paid to their own merchant id.`);
    }
}
