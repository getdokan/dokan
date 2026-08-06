import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';
import { PayPalMarketplacePage, PAYPAL_IDS, withAdmin, withVendor } from './paypalMarketplacePage';
import {
    VENDOR_ID,
    PAYPAL_MERCHANTS,
    PAYPAL_VENDOR_LOGINS,
    hasCredentials,
    ensurePayPalConfigured,
    getPayPalStatus,
    seedPayPalConnectedVendor,
    clearPayPalVendor,
} from './helpers';

/**
 * PayPal Marketplace — vendor withdraw method (PP-WDR-01 … PP-WDR-08).
 *
 * ── The one fact this whole file exists to protect ──────────────────────────────────────────────
 *
 * The withdraw method id is `dokan-paypal-marketplace` with HYPHENS
 * (`RegisterWithdrawMethods.php:80`), while the payment gateway id is `dokan_paypal_marketplace`
 * with UNDERSCORES (`Helper::get_gateway_id()`), and the module slug is a third string again.
 * Stripe Express's gateway id and withdraw-method id ARE identical, so a suite written by mirroring
 * that one asserts the underscored id against `dokan_withdraw['withdraw_methods']` and fails on a
 * perfectly working system — with a failure that reads like a product bug. Every id in this file
 * comes from `PAYPAL_IDS`; none is retyped.
 *
 * ── What the product actually does, established from source before any test was written ─────────
 *
 * Three different lists decide what a vendor sees, and conflating them is the second way this area
 * produces a wrong result:
 *
 *   1. REGISTERED — `dokan_withdraw_get_methods()` (dokan-lite `Withdraw/functions.php:34`), fed by
 *      the `dokan_withdraw_methods` filter. The module joins that list ONLY when `Helper::is_ready()`
 *      is true (`RegisterWithdrawMethods.php:76`). Without credentials the method does not exist at
 *      all, and every "PayPal is not offered" assertion in this file would pass for that reason
 *      alone — which is why each one proves `is_ready === true` first.
 *   2. ENABLED — `dokan_withdraw_get_active_methods()` (`functions.php:52`), i.e. the non-empty keys
 *      of `dokan_withdraw['withdraw_methods']`. This is what the admin toggles.
 *   3. CONNECTED per vendor — `Settings::is_seller_connected()` (dokan-lite
 *      `Dashboard/Templates/Settings.php:826`), which the module answers through the
 *      `dokan_is_seller_connected_to_payment_method` filter using
 *      `Helper::is_seller_enable_for_receive_payment()` (`RegisterWithdrawMethods.php:591`).
 *
 * `GET /dokan/v1/stores/{id}` with admin credentials returns all three in one response —
 * `withdraw_options` (registered), `active_payment_methods` (enabled), and
 * `connected_methods` / `disconnected_methods` (per-vendor classification), built by
 * `StoreController::prepare_item_for_response()` (dokan-lite `REST/StoreController.php:726-745`)
 * from the very functions the vendor dashboard renders from. That single read is used as the
 * server-side witness beside each UI assertion, so a UI change cannot silently turn a real
 * regression into a passing test, and a REST change cannot hide a broken screen.
 *
 * ── PP-WDR-06 … 08: the catalogue expectation the product does not implement ────────────────────
 *
 * The catalogue expects a vendor to request a PayPal withdrawal and an admin to approve or cancel
 * it. The product does not allow that, by design rather than by defect:
 *
 *   - `Withdraw\Manager::is_valid_approval_request()` (dokan-lite `Withdraw/Manager.php:57`) refuses
 *     any method that is not in `dokan_get_seller_active_withdraw_methods()`, and that function
 *     (`Withdraw/functions.php:67-84`) derives its list solely from the vendor's stored
 *     paypal / bank / skrill profile fields. The module never filters it.
 *   - `dokan_withdraw_get_withdrawable_active_methods()` (`functions.php:488`) — the list the vendor
 *     withdraw form and `WithdrawControllerV2`'s method enum are built from — intersects with
 *     `['paypal', 'bank']` plus whatever `dokan_withdraw_withdrawable_payment_methods` adds. Only
 *     `CustomWithdrawMethod` and Pro's `Withdraw\Manager` add to it; neither PayPal Marketplace nor
 *     Stripe Express does.
 *
 * Both connected-gateway payout methods behave the same way: money moves automatically at order
 * time or through the module's own disbursement process (`Order/OrderManager.php:586-592` inserts
 * the `dokan_withdraw` balance rows directly), never through a manual withdraw request. PP-WDR-06 is
 * therefore written to assert the real contract rather than the catalogued one, and PP-WDR-07 /
 * PP-WDR-08 PROBE that contract at run time and declare a reasoned skip when it still holds — so
 * that the day the product does start accepting these requests, those two cases run their real
 * balance assertions instead of skipping forever behind a hardcoded flag.
 *
 * ── Restoration ────────────────────────────────────────────────────────────────────────────────
 *
 * `dokan_withdraw` is a SHARED option. `save_settings_value()` (dokan-lite `Admin/Settings.php:148`)
 * replaces it wholesale with what the form posted, and this file also writes it directly to set up
 * preconditions. Every test therefore restores the exact option snapshot taken in `beforeAll`, and
 * re-seeds vendor 1 as connected. Assigning a fresh map over `withdraw_methods` instead of merging
 * would delete the four stock methods (paypal, bank, dokan_custom, skrill) that `_env.setup.ts:248`
 * installs, and every other withdraw suite on this worker would then fail for a reason with nothing
 * to do with PayPal.
 *
 * Two further mutations live OUTSIDE the option, both made by the withdraw probe:
 *
 *   - The balance top-up inserts a `wp_dokan_vendor_balance` row with a fabricated `trn_id` (max+1,
 *     referencing no order). `afterEach` cannot undo a table row, so `afterAll` deletes it by the
 *     `BALANCE_TOPUP_PARTICULARS` marker written at insert time — otherwise vendor 1 carries invented
 *     earnings into every later suite that reads a computed balance.
 *   - The probe CANCELS vendor 1's pending withdraw request, because `create_item()`
 *     (`REST/WithdrawController.php:469`) short-circuits on `has_pending_request()` before the method
 *     is ever examined and the product allows exactly one pending request per vendor. That is
 *     unavoidable for a case that has to reach the method rule, and it is the same convention
 *     `tests/e2e/withdraws/newWithdraw.spec.ts:14-23` and `tests/e2e/withdraws/withdraws.spec.ts`
 *     already follow against this same vendor. It is NOT free: `playwright.config.ts:49` runs
 *     `workers: 4` locally with files in parallel, so those specs and this one can cancel each
 *     other's seeded request; CI runs `workers: 1`, where the hazard cannot occur. Neither obvious
 *     escape works — moving the probe to vendor 2 collides with `paypalMarketplaceBlocks.spec.ts:863`
 *     and `paypalMarketplaceXss.spec.ts:865,952`, which clear vendor 2's PayPal connection mid-test,
 *     and tagging this file `@serial` would delete all eight cases from both lanes (see below).
 *
 * Never `test.describe.serial` and never tagged `@serial`: `playwright.config.ts:13` grepInverts
 * `@serial` out of BOTH CI lanes, and `.serial` aborts the whole group on the first failure — which
 * on 2026-07-31 silently deleted 46 of 68 cases from a run that still summarised as green.
 */

/* ------------------------------------------------------------------ */
/* Options                                                             */
/* ------------------------------------------------------------------ */

/** Dokan's withdraw settings section id — also the option name (`Admin/Settings.php:353`). */
const WITHDRAW_OPTION = 'dokan_withdraw';

/**
 * The stock methods `_env.setup.ts:248` installs, listed in full from `utils/dbData.ts:139-144`
 * (`dokan.withdrawSettings.withdraw_methods`). Asserted as survivors after every write, because the
 * single most damaging mistake available here is assigning over `withdraw_methods` instead of
 * merging into it: that silently disables withdrawals site-wide for every other suite sharing the
 * worker, and no PayPal assertion would notice.
 *
 * All FOUR are pinned, not just the two Lite registers (`Withdraw/functions.php:12-27`): `skrill`
 * comes from Pro's `Withdraw\Manager::load_withdraw_method()` (dokan-pro `Withdraw/Manager.php:77`)
 * and `dokan_custom` from `CustomWithdrawMethod` (dokan-pro `CustomWithdrawMethod.php:25`), both of
 * which are core Pro rather than modules — and every case in this file is tagged `@pro`, so the lane
 * that runs it always has all four. A guard that named only two would let a write that dropped
 * `dokan_custom` and `skrill` pass while claiming to protect the stock list.
 */
const STOCK_METHODS = ['paypal', 'bank', 'dokan_custom', 'skrill'] as const;

/**
 * Marks the `wp_dokan_vendor_balance` rows the withdraw probe inserts, so `afterAll` can delete
 * exactly those rows and nothing else. The insert fabricates a `trn_id` that references no order
 * (`dbUtils.setVendorBalance` uses max+1), so leaving it behind would permanently inflate vendor 1's
 * earnings for every other suite on this site.
 */
const BALANCE_TOPUP_PARTICULARS = 'PP-WDR balance top-up';

/** `wp_dokan_vendor_balance`, resolved the same way every other spec resolves a raw table name. */
const VENDOR_BALANCE_TABLE = `${process.env.DB_PREFIX ?? 'wp'}_dokan_vendor_balance`;

const VENDOR1_EMAIL = PAYPAL_VENDOR_LOGINS.vendor1.email || 'dokangit@vendor1.com';

const CREDENTIALS_SKIP =
    'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / ' +
    'TEST_CLIENT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE), so Helper::is_ready() is false and ' +
    'RegisterWithdrawMethods::register_methods() (source coordinates withheld) never registers the withdraw method at ' +
    'all. Every assertion in this file — positive and negative alike — would then be describing a method that does not ' +
    'exist. PP-PRE-01 reports the absence.';

/* ------------------------------------------------------------------ */
/* Option access                                                       */
/* ------------------------------------------------------------------ */

type OptionMap = Record<string, unknown>;

/**
 * Read `dokan_withdraw`.
 *
 * `getOptionValueOrNull`, never `getOptionValue`: the latter indexes `res[0]` unguarded (throws on a
 * missing row) and runs php-serialize's `unserialize()` unconditionally (throws on a plain-string
 * value). An absent option is a legitimate state on a fresh site, and reporting it as `{}` here is
 * honest, whereas a `try/catch` around the read would also swallow every real driver error — and
 * both writers below write back whatever this returns, so one swallowed timeout would replace the
 * whole shared option with an empty map.
 */
async function readWithdrawOption(): Promise<OptionMap> {
    const value = await dbUtils.getOptionValueOrNull(WITHDRAW_OPTION);
    return value && typeof value === 'object' ? (value as OptionMap) : {};
}

/**
 * The ENABLED withdraw-method keys, using the product's own definition of enabled.
 *
 * `dokan_withdraw_get_active_methods()` (`Withdraw/functions.php:52`) runs `array_filter` over the
 * map, and `dokan_is_withdraw_method_enabled()` (`functions.php:510`) additionally requires a
 * non-empty value. That distinction is load-bearing here: switching a method OFF through the admin
 * UI stores `key => ''` rather than removing the key (`Fields.vue:823-829` passes `''` when a
 * multicheck toggle is unchecked). A test that asked only whether the key EXISTS would report a
 * disabled method as still enabled.
 */
async function enabledWithdrawMethods(): Promise<string[]> {
    const option = await readWithdrawOption();
    const methods = option['withdraw_methods'];
    if (!methods || typeof methods !== 'object') {
        return [];
    }
    return Object.entries(methods as Record<string, unknown>)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key);
}

/**
 * Precondition writer for the enabled list. MERGES into the stored option — it replaces only the
 * `withdraw_methods` sub-key and preserves withdraw_limit, withdraw_charges, disbursement and every
 * other key the option carries.
 *
 * Used ONLY to arrange a starting state. The admin UI is the thing under test in PP-WDR-02 and
 * PP-WDR-03, so neither of those cases uses this to perform the action it is asserting.
 */
async function setEnabledWithdrawMethods(keys: string[]): Promise<void> {
    const option = await readWithdrawOption();
    const map: Record<string, string> = {};
    for (const key of keys) {
        map[key] = key;
    }
    option['withdraw_methods'] = map;
    await dbUtils.setOptionValue(WITHDRAW_OPTION, option);
}

/* ------------------------------------------------------------------ */
/* Server-side witness — one REST read, three product lists            */
/* ------------------------------------------------------------------ */

interface StorePaymentView {
    /** `dokan_withdraw_get_methods()` — every REGISTERED method, keyed by id, valued by title. */
    registered: Record<string, unknown>;
    /** `dokan_withdraw_get_active_methods()` — the ENABLED map. */
    active: Record<string, unknown>;
    /** Per-vendor split from `Settings::is_seller_connected()`. */
    connected: Record<string, unknown>;
    disconnected: Record<string, unknown>;
    /** `dokan_vendor_to_array` — the module writes `payment['dokan-paypal-marketplace']` here (source coordinates withheld). */
    payment: Record<string, unknown>;
}

function asMap(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

/**
 * Read the three method lists and the vendor's payment flags in one admin request.
 *
 * Admin credentials are REQUIRED, not incidental: `prepare_item_for_response()` only attaches
 * `withdraw_options` / `active_payment_methods` / `connected_methods` / `disconnected_methods` when
 * `can_access_vendor_store()` passes (`StoreController.php:729`), which for a non-owner means
 * `manage_woocommerce`. Called anonymously the response is a valid store object with those four keys
 * simply missing, and an assertion on a missing key reads as "PayPal is not offered" — a false
 * negative that looks exactly like the defect this file hunts.
 */
async function readStorePaymentView(vendorId: string): Promise<StorePaymentView> {
    const api = new ApiUtils(await request.newContext());
    try {
        const store = await api.getSingleStore(vendorId, payloads.adminAuth);
        return {
            registered: asMap(store?.withdraw_options),
            active: asMap(store?.active_payment_methods),
            connected: asMap(store?.connected_methods),
            disconnected: asMap(store?.disconnected_methods),
            payment: asMap(store?.payment),
        };
    } finally {
        await api.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Withdraw-request probe (PP-WDR-06 … 08)                             */
/* ------------------------------------------------------------------ */

interface WithdrawProbe {
    /** HTTP status the create returned. 201 means the product accepted a PayPal-method request. */
    status: number;
    /** The created id, when it was accepted. */
    withdrawId: string;
    /** The error message, when it was refused. */
    message: string;
    /** Vendor balance immediately before the request, in store currency. */
    balanceBefore: number;
    /** The amount that was requested. */
    amount: number;
    /** `dokan_get_seller_active_withdraw_methods()` as the product reported it — the list Manager.php:57 checks against. */
    sellerActiveMethods: string[];
    /**
     * Whether the balance endpoint actually CARRIED that list. `get_balance()` always sets
     * `withdraw_methods` (`REST/WithdrawController.php:433`), so a false here means the read did not
     * answer at all — and `readBalance()` turns the absent field into an empty array, over which
     * "the id is not in the list" passes without the product ever having been asked.
     */
    sellerActiveMethodsReported: boolean;
}

/**
 * Try to create a withdraw request for vendor 1 using the PayPal Marketplace method, having first
 * removed every OTHER reason the product could refuse it.
 *
 * `is_valid_approval_request()` (dokan-lite `Withdraw/Manager.php:29-89`) rejects in this order:
 * empty amount, amount above balance, amount below the configured limit, method not active, vendor
 * not enabled for selling. `create_item()` (`REST/WithdrawController.php:470`) additionally rejects
 * when a pending request already exists. Every one of those returns HTTP 400 with a different
 * message, so a test that only asserted "400" would pass while the product refused for a completely
 * different reason — and would keep passing if the method check were deleted tomorrow.
 *
 * This probe therefore clears any pending request, tops the balance up when it is short, and reports
 * the numbers back so the caller can assert that the ONLY remaining reason is the method.
 */
async function probePayPalWithdrawRequest(): Promise<WithdrawProbe> {
    const api = new ApiUtils(await request.newContext());
    try {
        // A pre-existing pending request short-circuits create_item() before the method is ever
        // examined, and would produce "You already have a pending withdraw request".
        const pending = await api.getAllWithdrawsByStatus('pending', payloads.vendorAuth);
        if (Array.isArray(pending) && pending.length > 0 && pending[0]?.id) {
            await api.cancelWithdraw(String(pending[0].id), payloads.vendorAuth);
        }

        const readBalance = async (): Promise<{ balance: number; limit: number; methods: string[]; methodsReported: boolean }> => {
            const [, body] = await api.get(endPoints.getBalanceDetails, { headers: payloads.vendorAuth });
            const methods = body?.withdraw_methods;
            return {
                balance: Number(body?.current_balance ?? 0),
                limit: Number(body?.withdraw_limit ?? 0),
                methods: Array.isArray(methods) ? methods.map(String) : Object.keys(asMap(methods)),
                // Reported separately from the coerced list: an absent field and an empty list are
                // very different facts, and only one of them means the product answered.
                methodsReported: methods !== undefined && methods !== null,
            };
        };

        let { balance, limit, methods, methodsReported } = await readBalance();

        // The amount has to clear the configured minimum AND sit inside the balance. `limit` can be 0
        // on a default site, hence the floor.
        const amount = Math.max(limit, 10);
        if (balance < amount) {
            // A DEBIT with an active order status is what `Vendor::get_balance()` counts as earnings
            // (see dbUtils.setVendorBalance). Additive: it never reduces an existing balance.
            await dbUtils.setVendorBalance(VENDOR_ID, { debit: amount * 2 + 100, perticulars: BALANCE_TOPUP_PARTICULARS });
            ({ balance, limit, methods, methodsReported } = await readBalance());
        }

        const [response, body] = await api.post(
            endPoints.createWithdraw,
            {
                data: {
                    user_id: Number(VENDOR_ID),
                    amount: String(amount),
                    method: PAYPAL_IDS.withdrawMethod,
                    note: 'PP-WDR automated probe',
                },
                headers: payloads.adminAuth,
            },
            false
        );

        return {
            status: response.status(),
            withdrawId: body?.id ? String(body.id) : '',
            // `?? ''` before any string work: Playwright builds assertion messages EAGERLY, and
            // `JSON.stringify(undefined)` returns the VALUE undefined, so calling a string method on
            // an absent message throws and turns a passing case into a failure.
            message: String(body?.message ?? ''),
            balanceBefore: balance,
            amount,
            sellerActiveMethods: methods,
            sellerActiveMethodsReported: methodsReported,
        };
    } finally {
        await api.dispose();
    }
}

/** Vendor 1's current balance, straight from `dokan_get_seller_balance()` via the product's own endpoint. */
async function readVendorBalance(): Promise<number> {
    const api = new ApiUtils(await request.newContext());
    try {
        const [, body] = await api.get(endPoints.getBalanceDetails, { headers: payloads.vendorAuth });
        return Number(body?.current_balance ?? 0);
    } finally {
        await api.dispose();
    }
}

/**
 * The reason PP-WDR-07 and PP-WDR-08 declare when the product still refuses a PayPal withdraw
 * request. Built from the probe so the message carries the product's own words rather than this
 * file's opinion of them.
 */
function manualWithdrawUnsupportedSkip(probe: WithdrawProbe): string {
    return (
        `the product does not accept a manual withdraw request for "${PAYPAL_IDS.withdrawMethod}", so a pending PayPal ` +
        `withdrawal — the precondition this case needs — cannot be created through any product code path. The create ` +
        `returned HTTP ${probe.status}: "${probe.message}". Withdraw\\Manager::is_valid_approval_request() ` +
        `(dokan-lite Withdraw/Manager.php:57) requires the method to appear in ` +
        `dokan_get_seller_active_withdraw_methods(), which reported [${probe.sellerActiveMethods.join(', ') || 'none'}] and ` +
        `is built only from the vendor's paypal / bank / skrill profile fields (Withdraw/functions.php:67-84). PayPal ` +
        `Marketplace disburses automatically instead (Order/OrderManager.php:586-592), exactly as Stripe Express does. ` +
        `PP-WDR-06 asserts that contract. Inserting a withdraw row straight into the database would bypass every line of ` +
        `product code this case is meant to exercise and would report a green result for an untested path, so it is not ` +
        `done here. This skip is re-evaluated on every run: if the product ever accepts the request, this case runs its ` +
        `balance assertions instead of skipping.`
    );
}

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */

test.describe('PayPal Marketplace — vendor withdraw method', () => {
    // Two cases drive the legacy Vue admin settings app and two drive the vendor dashboard, both of
    // which are full page loads behind a WordPress bootstrap.
    test.describe.configure({ timeout: 240_000 });

    /** The exact `dokan_withdraw` option every test restores to. Captured after the suite baseline is applied. */
    let withdrawOptionBaseline: OptionMap = {};

    test.beforeAll(async () => {
        // Deliberately no test.skip() here: inside beforeAll it voids the entire describe silently,
        // turning eight catalogued cases into zero reported results. Each test gates itself instead.
        if (!hasCredentials) {
            return;
        }
        await ensurePayPalConfigured();
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
        withdrawOptionBaseline = await readWithdrawOption();
    });

    // After EVERY test, not just at the end: CI runs one worker with retries, so a case that died
    // mid-mutation would otherwise hand the next test — and the next spec file — a site with the
    // PayPal method disabled or vendor 1 disconnected, and those would then fail or pass for reasons
    // that have nothing to do with what they assert.
    test.afterEach(async () => {
        if (!hasCredentials) {
            return;
        }
        if (Object.keys(withdrawOptionBaseline).length > 0) {
            await dbUtils.setOptionValue(WITHDRAW_OPTION, withdrawOptionBaseline);
        }
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
    });

    // The probe's balance top-up is the one mutation `afterEach` cannot undo: it is a row in
    // `wp_dokan_vendor_balance`, not an option, and it carries a fabricated `trn_id` (max+1) that
    // references no order. Left behind it permanently inflates vendor 1's earnings for every other
    // suite on this site — `dokan_get_seller_balance()` sums the table — so a withdraw spec that
    // asserts a computed balance would then be reading money this file invented. Deleted by the
    // marker written at insert time, so nothing any other spec inserted can match.
    test.afterAll(async () => {
        if (!hasCredentials) {
            return;
        }
        await dbUtils.dbQuery(`DELETE FROM ${VENDOR_BALANCE_TABLE} WHERE perticulars = ?;`, [BALANCE_TOPUP_PARTICULARS]);
    });

    /* -------------------------------------------------------------- */
    /* Registration + admin enable/disable                             */
    /* -------------------------------------------------------------- */

    test('PP-WDR-01: the PayPal withdraw method is registered and enabled under the HYPHENATED key', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            'Helper::is_ready() must be true before anything is read here — RegisterWithdrawMethods::register_methods() ' +
                '(source coordinates withheld) returns the method list untouched when it is false, so on an unconfigured ' +
                'site the withdraw method simply does not exist and every assertion below would be describing nothing',
        ).toBe(true);

        const view = await readStorePaymentView(VENDOR_ID);

        expect(
            Object.keys(view.registered),
            `the module must register its withdraw method under "${PAYPAL_IDS.withdrawMethod}" (source coordinates withheld). ` +
                'Without it the vendor dashboard offers no PayPal payout screen at all and no vendor can ever connect a PayPal account',
        ).toContain(PAYPAL_IDS.withdrawMethod);

        expect(
            Object.keys(view.registered),
            `no withdraw method is registered under the GATEWAY id "${PAYPAL_IDS.gateway}". The gateway id uses underscores and ` +
                'the withdraw method uses hyphens; they are two different strings for two different registries, and a spec that ' +
                'asserts the gateway id here fails on a perfectly working system while looking like a product defect',
        ).not.toContain(PAYPAL_IDS.gateway);

        expect(
            view.registered[PAYPAL_IDS.withdrawMethod],
            'the registered title must stay "Dokan PayPal Marketplace" (source coordinates withheld) — the vendor payment ' +
                'screen strips the leading "Dokan " for display (Settings.php:900-903), so a renamed title silently changes what ' +
                'vendors are asked to connect to',
        ).toBe('Dokan PayPal Marketplace');

        const enabled = await enabledWithdrawMethods();
        expect(
            enabled,
            `the admin-enabled list dokan_withdraw['withdraw_methods'] must carry "${PAYPAL_IDS.withdrawMethod}" — until it does, ` +
                'the method is registered but never rendered on the vendor payment screen (Settings.php:192)',
        ).toContain(PAYPAL_IDS.withdrawMethod);

        expect(
            enabled,
            `the enabled list must NOT carry the underscored gateway id "${PAYPAL_IDS.gateway}"; nothing reads that key, so its ` +
                'presence would mean some caller wrote the wrong identifier and a vendor-facing method silently did nothing',
        ).not.toContain(PAYPAL_IDS.gateway);

        expect(
            Object.keys(view.active),
            'the product\'s own dokan_withdraw_get_active_methods() must agree with the stored option — a disagreement means the ' +
                'option holds an empty value for the key, which reads as enabled to a naive key check but is disabled to the product',
        ).toContain(PAYPAL_IDS.withdrawMethod);

        for (const stock of STOCK_METHODS) {
            expect(
                enabled,
                `the stock withdraw method "${stock}" must still be enabled. Enabling PayPal has to MERGE into this list; assigning ` +
                    'over it would disable withdrawals for every vendor and every other suite sharing this site, with nothing in a ' +
                    'PayPal report to explain why',
            ).toContain(stock);
        }

        log.success(`PP-WDR-01: withdraw method registered and enabled as "${PAYPAL_IDS.withdrawMethod}"; gateway id "${PAYPAL_IDS.gateway}" absent from both registries.`);
    });

    test('PP-WDR-02: admin can enable the PayPal withdraw method from Withdraw Options', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            'Helper::is_ready() must be true — an unregistered method renders no toggle on the Withdraw Options screen, and the ' +
                'failure would read as "the admin screen is broken" rather than "the gateway is not configured"',
        ).toBe(true);

        // Start from DISABLED, so ticking the toggle is a real state change. Toggling a box that is
        // already ticked would flip it the wrong way and "prove" a state this test never wrote.
        const before = await enabledWithdrawMethods();
        await setEnabledWithdrawMethods(before.filter(key => key !== PAYPAL_IDS.withdrawMethod));
        expect(
            await enabledWithdrawMethods(),
            'precondition: the method starts disabled so that the admin action under test performs a real change',
        ).not.toContain(PAYPAL_IDS.withdrawMethod);

        await withAdmin(browser, async (page, paypal) => {
            await paypal.gotoWithdrawOptions();
            const toggle = page.locator(PayPalMarketplacePage.adminWithdraw.methodToggleInput(PAYPAL_IDS.withdrawMethod));
            await expect(
                toggle,
                `the Withdraw Options screen must render a toggle whose value is the HYPHENATED "${PAYPAL_IDS.withdrawMethod}" ` +
                    '(Fields.vue:189 → Switches.vue:3). A toggle carrying the underscored gateway id would write a key nothing reads',
            ).not.toBeChecked();

            const changed = await paypal.setWithdrawMethodEnabled(true);
            expect(changed, 'the toggle must have actually been clicked; a no-op save would prove nothing about enabling').toBe(true);
        });

        const after = await enabledWithdrawMethods();
        expect(
            after,
            'the admin save must persist the method into dokan_withdraw[\'withdraw_methods\'] — if it does not, an admin who ' +
                'enables PayPal payouts sees the toggle silently revert and no vendor is ever offered the method',
        ).toContain(PAYPAL_IDS.withdrawMethod);

        expect(after, `the save must not write the underscored gateway id "${PAYPAL_IDS.gateway}", which no withdraw code reads`).not.toContain(PAYPAL_IDS.gateway);

        expect(
            (await getPayPalStatus()).withdraw_method_on,
            'the module-side status probe must agree that the hyphenated key is present after the admin save',
        ).toBe(true);

        for (const stock of before.filter(key => key !== PAYPAL_IDS.withdrawMethod)) {
            expect(
                after,
                `"${stock}" must survive the save. Admin\\Settings::save_settings_value() (Admin/Settings.php:148) replaces the whole ` +
                    'dokan_withdraw option with what the form posted, so a form that dropped a method would silently disable it for ' +
                    'every vendor on the site',
            ).toContain(stock);
        }

        const view = await readStorePaymentView(VENDOR_ID);
        expect(
            Object.keys(view.active),
            'the enabled method must reach the vendor-facing list the payment screen is built from (Settings.php:192) — persisting ' +
                'in the option but not appearing here would mean the admin enabled something no vendor can see',
        ).toContain(PAYPAL_IDS.withdrawMethod);

        log.success('PP-WDR-02: admin UI enable persisted and is offered to vendors; stock methods intact.');
    });

    test('PP-WDR-03: admin can disable the PayPal withdraw method and vendors stop being offered it', { tag: ['@pro', '@admin', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        expect(status.is_ready, 'Helper::is_ready() must be true, or no toggle exists to switch off').toBe(true);

        const before = await enabledWithdrawMethods();
        expect(
            before,
            'precondition: the method starts ENABLED, so that its later absence is the result of the admin action and not of a ' +
                'site that never offered it — a negative asserted from an already-disabled start passes trivially',
        ).toContain(PAYPAL_IDS.withdrawMethod);

        // Prove it really is offered to the vendor BEFORE disabling it. Without this the "no longer
        // offered" assertion below would pass on a site where it was never offered at all.
        await withVendor(browser, async (page, paypal) => {
            await paypal.gotoVendorPaymentMethods();
            await expect(
                page.locator(PayPalMarketplacePage.vendorPaymentList.anyLink),
                'precondition: while enabled, the vendor payment screen must link to the PayPal Marketplace method somewhere',
            ).not.toHaveCount(0);
        });

        await withAdmin(browser, async (page, paypal) => {
            await paypal.gotoWithdrawOptions();
            await expect(page.locator(PayPalMarketplacePage.adminWithdraw.methodToggleInput(PAYPAL_IDS.withdrawMethod)), 'precondition: the toggle starts on').toBeChecked();

            const changed = await paypal.setWithdrawMethodEnabled(false);
            expect(changed, 'the toggle must have actually been switched off').toBe(true);
        });

        const after = await enabledWithdrawMethods();
        expect(
            after,
            'after the admin save the method must no longer count as enabled. Note the shape: switching a multicheck off stores ' +
                'key => \'\' rather than deleting the key (Fields.vue:823-829), so this asserts on the product\'s own non-empty rule ' +
                '(Withdraw/functions.php:510) — a bare key-exists check would report the method as still enabled',
        ).not.toContain(PAYPAL_IDS.withdrawMethod);

        for (const stock of before.filter(key => key !== PAYPAL_IDS.withdrawMethod)) {
            expect(after, `"${stock}" must survive a PayPal-only change; disabling one method must never disable the others`).toContain(stock);
        }

        const view = await readStorePaymentView(VENDOR_ID);

        // The witness must be proven POPULATED before anything is asserted about what it lacks. This
        // is the only case in the file whose REST assertions are all negatives, and
        // prepare_item_for_response() attaches active_payment_methods / connected_methods /
        // disconnected_methods / withdraw_options ONLY when can_access_vendor_store() passes
        // (StoreController.php:729-745). Read without admin rights the response is a valid 200 store
        // object with all four keys simply absent, asMap() turns each into {}, Object.keys({}) is [],
        // and both negatives below pass over an empty object while the site is untouched.
        // withdraw_options is dokan_withdraw_get_methods() — REGISTRATION, which the admin
        // enable/disable toggle never touches — so it is present exactly when the read was authorised.
        expect(
            Object.keys(view.registered),
            'the admin REST read must actually carry the admin-only method lists. withdraw_options comes from ' +
                'dokan_withdraw_get_methods() and survives the disable under test, so its absence means the read was unauthorised ' +
                '(StoreController.php:729) and every negative below would pass vacuously over a missing key',
        ).toContain(PAYPAL_IDS.withdrawMethod);

        expect(
            Object.keys(view.active),
            'dokan_withdraw_get_active_methods() must drop the method — this is the exact list Settings::get_seller_payment_methods() ' +
                'renders the vendor payment screen from (Settings.php:192)',
        ).not.toContain(PAYPAL_IDS.withdrawMethod);
        expect(
            Object.keys(view.connected),
            'a disabled method must not remain in the vendor\'s connected list, even though vendor 1 is still connected on the ' +
                'PayPal side — an admin-disabled method that keeps rendering as connected tells the vendor payouts are live when ' +
                'the admin has switched them off',
        ).not.toContain(PAYPAL_IDS.withdrawMethod);

        await withVendor(browser, async (page, paypal) => {
            await paypal.gotoVendorPaymentMethods();
            await expect(
                page.locator(PayPalMarketplacePage.vendorPaymentList.anyLink),
                'the vendor payment screen must stop offering PayPal Marketplace entirely — neither as a connected method nor in ' +
                    'the "Add Payment Method" dropdown. Anything still linking there lets a vendor open a payout method the admin ' +
                    'has disabled',
            ).toHaveCount(0);
        });

        log.success('PP-WDR-03: admin UI disable removed the method from the vendor payment screen; stock methods intact.');
    });

    /* -------------------------------------------------------------- */
    /* Vendor selectability                                            */
    /* -------------------------------------------------------------- */

    test('PP-WDR-04: a connected vendor is offered PayPal Marketplace as a payout method', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        expect(status.is_ready, 'Helper::is_ready() must be true, or the method is not registered and cannot be offered to anyone').toBe(true);
        expect(status.withdraw_method_on, 'the admin-enabled list must carry the hyphenated key, or the method is hidden from every vendor').toBe(true);

        const seed = await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
        expect(
            seed.receivable,
            'the vendor must genuinely read as payment-receivable. Six mode-swapped metas are required, and the decisive one is ' +
                '_enable_for_receive_payment — seeding only the merchant id produces a vendor that looks connected while PayPal is ' +
                'never actually offered, which makes this whole case pass for the wrong reason',
        ).toBe(true);

        const view = await readStorePaymentView(VENDOR_ID);
        expect(
            Object.keys(view.connected),
            'Settings::is_seller_connected() must classify the vendor as CONNECTED to the PayPal method — the module answers that ' +
                'through the dokan_is_seller_connected_to_payment_method filter (source coordinates withheld). A connected vendor ' +
                'left in the disconnected bucket is asked to sign up again and cannot be paid',
        ).toContain(PAYPAL_IDS.withdrawMethod);
        expect(Object.keys(view.disconnected), 'a connected vendor must not appear in the disconnected bucket as well').not.toContain(PAYPAL_IDS.withdrawMethod);
        expect(
            view.payment[PAYPAL_IDS.withdrawMethod],
            'the vendor profile payload must expose payment["dokan-paypal-marketplace"] === true (source coordinates withheld); ' +
                'store apps and the vendor dashboard read that flag to decide whether to prompt for onboarding',
        ).toBe(true);

        await withVendor(browser, async (page, paypal) => {
            await paypal.gotoVendorPaymentMethods();

            await expect(
                page.locator(PayPalMarketplacePage.vendorPaymentList.manageLink),
                'the connected vendor must see PayPal Marketplace in the payment-method list with a Manage link. Its absence means ' +
                    'a vendor who has completed PayPal onboarding has no way back into their payout settings',
            ).toBeVisible();

            await expect(
                page.locator(PayPalMarketplacePage.vendorPaymentList.addMethodLink),
                'a connected method must NOT also sit in the "Add Payment Method" dropdown; that dropdown lists only unused methods ' +
                    '(payment.php:22-40), so an entry there would invite the vendor to re-onboard an account already connected',
            ).toHaveCount(0);

            await paypal.gotoVendorPaymentSettings();
            await expect(
                page.locator(PayPalMarketplacePage.vendor.disconnect),
                'the manage screen must render the Disconnect control, which the template shows only on the connected branch ' +
                    '(vendor-settings-payment.php:4-8). Without it the vendor is stuck with an account they cannot detach',
            ).toBeVisible();
            await expect(
                page.locator(PayPalMarketplacePage.vendor.connectedAlert).first(),
                'the connected branch must display the merchant id it stored for this vendor; a blank or wrong id there means ' +
                    'payouts would be addressed to the wrong PayPal account',
            ).toContainText(PAYPAL_MERCHANTS.vendor1);
            await expect(
                page.locator(PayPalMarketplacePage.vendor.email),
                'the sign-up email field belongs to the UNCONNECTED branch only; rendering it for a connected vendor would mean the ' +
                    'template picked the wrong branch and the vendor is being asked to onboard again',
            ).toHaveCount(0);
        });

        log.success('PP-WDR-04: connected vendor sees PayPal Marketplace as a manageable payout method.');
    });

    test('PP-WDR-05: an unconnected vendor cannot select PayPal Marketplace as a payout method', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        // Both halves of the gate first. Without them "PayPal is unavailable" is trivially true on any
        // site where the gateway was never configured or the admin never enabled the method — the exact
        // fake-green shape this file is written to avoid.
        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            'Helper::is_ready() must be true. If it is not, the withdraw method is not registered at all and this case would ' +
                '"prove" that an unconnected vendor cannot select a method that no vendor could select',
        ).toBe(true);
        expect(
            status.withdraw_method_on,
            'the method must be admin-enabled. A disabled method is hidden from connected and unconnected vendors alike, so the ' +
                'negative below would pass without saying anything about connection state',
        ).toBe(true);

        // Prove the positive on this same vendor, so the negative is attributable to the disconnect and
        // to nothing else.
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
        expect(
            Object.keys((await readStorePaymentView(VENDOR_ID)).connected),
            'control: while connected, this vendor is classified as connected — establishing that the classification responds to ' +
                'vendor state at all before the disconnected result is read',
        ).toContain(PAYPAL_IDS.withdrawMethod);

        const cleared = await clearPayPalVendor(VENDOR_ID);
        expect(
            cleared.receivable,
            'the vendor must genuinely stop being payment-receivable. Both test-mode and live-mode variants of all six metas are ' +
                'removed, so a stale sandbox meta cannot leave the vendor half-connected and make this case ambiguous',
        ).toBe(false);

        const view = await readStorePaymentView(VENDOR_ID);
        expect(
            Object.keys(view.active),
            'the method must still be admin-enabled at the moment the negative is read. The status probe above answers a KEY-EXISTS ' +
                'question, and a method switched off through the admin UI is stored as key => \'\' rather than removed ' +
                '(Fields.vue:823-829) — so this asserts the product\'s own array_filter-ed list instead, and pins that the vendor, ' +
                'not the site configuration, is the reason PayPal is unavailable below',
        ).toContain(PAYPAL_IDS.withdrawMethod);
        expect(
            Object.keys(view.disconnected),
            'an unconnected vendor must be classified as DISCONNECTED for the PayPal method, which is what puts it behind the ' +
                '"Add Payment Method" sign-up flow instead of presenting it as a live payout target',
        ).toContain(PAYPAL_IDS.withdrawMethod);
        expect(
            Object.keys(view.connected),
            'an unconnected vendor must NOT be listed as connected — a vendor shown as connected without PayPal consent would be ' +
                'told their payouts are set up while every disbursement to them fails at PayPal',
        ).not.toContain(PAYPAL_IDS.withdrawMethod);
        expect(
            view.payment[PAYPAL_IDS.withdrawMethod],
            'payment["dokan-paypal-marketplace"] must report false for a vendor with no merchant metas (source coordinates withheld)',
        ).toBe(false);

        await withVendor(browser, async (page, paypal) => {
            await paypal.gotoVendorPaymentMethods();

            await expect(
                page.locator(PayPalMarketplacePage.vendorPaymentList.manageLink),
                'an unconnected vendor must not be offered PayPal Marketplace as an already-usable payout method; only connected ' +
                    'methods get a Manage entry in the list (payment.php:53-80)',
            ).toHaveCount(0);

            await expect(
                page.locator(PayPalMarketplacePage.vendorPaymentList.addMethodLink),
                'the method must instead appear under "Add Payment Method", so the vendor is routed into onboarding rather than ' +
                    'being able to treat an unconnected account as a payout destination',
            ).toHaveCount(1);

            await paypal.gotoVendorPaymentSettings();
            await expect(
                page.locator(PayPalMarketplacePage.vendor.email),
                'the manage screen must fall to the sign-up branch and ask for a PayPal email (vendor-settings-payment.php:35-53) — ' +
                    'that form IS the block: there is nothing on this screen an unconnected vendor can use as a payout target',
            ).toBeVisible();
            await expect(
                page.locator(PayPalMarketplacePage.vendor.connect),
                'the sign-up branch must render its connect control, or the vendor is shown a dead end with no way to onboard',
            ).toBeVisible();
            await expect(
                page.locator(PayPalMarketplacePage.vendor.disconnect),
                'no Disconnect control may render for a vendor with no connected account; its presence would mean the template took ' +
                    'the connected branch and the vendor is being told they are set up to receive money when they are not',
            ).toHaveCount(0);
        });

        log.success('PP-WDR-05: unconnected vendor is routed to onboarding and offered no usable PayPal payout target.');
    });

    /* -------------------------------------------------------------- */
    /* Withdraw requests                                               */
    /* -------------------------------------------------------------- */

    test('PP-WDR-06: a manual withdraw request naming the PayPal Marketplace method is refused as an inactive method', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        expect(status.is_ready, 'Helper::is_ready() must be true, or the method is not even a valid value for the request').toBe(true);
        expect(status.withdraw_method_on, 'the method must be admin-enabled, so that "not active" cannot mean "the admin never enabled it"').toBe(true);

        const seed = await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
        expect(seed.receivable, 'the vendor must be fully connected, so the refusal cannot be attributed to a missing PayPal connection').toBe(true);

        const probe = await probePayPalWithdrawRequest();

        // Every OTHER reason the product could refuse, excluded by measurement rather than by
        // assumption. Without these the assertion below would pass while the product rejected the
        // request for an empty balance — and would keep passing if the method check were deleted.
        expect(
            probe.balanceBefore,
            `the vendor balance (${probe.balanceBefore}) must cover the requested ${probe.amount}, or Manager.php:48 refuses for ` +
                'insufficient funds and this case would be measuring the balance rule instead of the method rule',
        ).toBeGreaterThanOrEqual(probe.amount);

        expect(
            probe.status,
            `the request must be refused. The catalogue expected a pending request here, but the product treats ` +
                `"${PAYPAL_IDS.withdrawMethod}" as an automatically-disbursed payout method rather than a manual withdraw method, ` +
                `exactly as it treats Stripe Express. Response was HTTP ${probe.status}: "${probe.message}"`,
        ).toBe(400);

        expect(
            probe.message,
            'the refusal must be the METHOD refusal from Withdraw\\Manager::is_valid_approval_request() (Withdraw/Manager.php:57-59). ' +
                'Asserting only on the 400 would pass for an empty amount, an over-balance amount, a below-limit amount, a ' +
                'disabled vendor or an existing pending request — five other branches that all return 400 with different messages',
        ).toContain('Withdraw method is not active');

        // (The balance branch and the pending-request branch are already excluded by the assertion
        // above: is_valid_approval_request() returns ONE WP_Error and create_item() throws ONE
        // DokanException, so a message reading "Withdraw method is not active." cannot simultaneously
        // read "You don't have enough balance for this request" or "You already have a pending
        // withdraw request". Re-testing the same string for those substrings could not fail once the
        // assertion above passed; the branches are genuinely excluded by the measured balance at the
        // top of this test and by the probe's cancel, not by a second look at the message.)

        expect(
            probe.sellerActiveMethodsReported,
            'the balance endpoint must actually have ANSWERED before its silence is read as evidence. get_balance() always sets ' +
                'withdraw_methods (WithdrawController.php:433), so an absent field means the request failed or the route moved — and ' +
                'readBalance() coerces an absent field to an empty list, over which the negative below would pass without the product ' +
                'ever having been asked',
        ).toBe(true);

        expect(
            probe.sellerActiveMethods,
            `the product's own withdraw/balance endpoint must report why: dokan_get_seller_active_withdraw_methods() ` +
                `(Withdraw/functions.php:67-84) is built solely from the vendor's stored paypal / bank / skrill profile fields, and ` +
                `neither PayPal Marketplace nor any other connected-gateway method filters itself into it. It reported ` +
                `[${probe.sellerActiveMethods.join(', ') || 'none'}]`,
        ).not.toContain(PAYPAL_IDS.withdrawMethod);

        const api = new ApiUtils(await request.newContext());
        try {
            const pending = await api.getAllWithdrawsByStatus('pending', payloads.vendorAuth);
            const paypalRows = (Array.isArray(pending) ? pending : []).filter((row: { method?: string }) => row?.method === PAYPAL_IDS.withdrawMethod);
            expect(
                paypalRows,
                'a refused request must leave no row behind. A pending row for a method the product will never approve would sit in ' +
                    'the admin withdraw queue forever and block the vendor from requesting anything else (WithdrawController.php:470)',
            ).toHaveLength(0);
        } finally {
            await api.dispose();
        }

        log.success(`PP-WDR-06: manual withdraw request refused with the product's method rule — "${probe.message}".`);
    });

    test('PP-WDR-07: approving a PayPal withdrawal reduces the vendor balance by the approved amount', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            'Helper::is_ready() must be true. Without it the method is not registered at all, the create below is refused for a ' +
                'reason that has nothing to do with the withdraw rules, and the skip this case declares would name the wrong cause',
        ).toBe(true);

        const seed = await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
        expect(seed.receivable, 'the vendor must be connected before a PayPal withdrawal is attempted').toBe(true);

        // The precondition is PROBED, never assumed. If the product ever accepts a PayPal-method
        // request, this case runs its real assertions instead of skipping behind a hardcoded flag.
        const probe = await probePayPalWithdrawRequest();
        if (probe.status !== 201) {
            // The refusal must be the one this case is designed around before it is allowed to skip.
            // Every other refusal returns a DIFFERENT message on the same non-201 status — HTTP 401
            // "User does not have permission to withdraw" (WithdrawController.php:456, when the vendor
            // loses dokan_manage_withdraw), 400 "You don't have enough balance for this request"
            // (Manager.php:49, i.e. the top-up did not land), 400 "Vendor is not enabled for selling"
            // (Manager.php:62), or a 500 — and skipping on the bare status would report a genuine
            // withdraw-creation regression as a designed-away catalogue divergence while the run
            // stayed green.
            expect(
                probe.message,
                'the probe must have been refused by the METHOD rule (Withdraw/Manager.php:57), which is the ONLY refusal this case ' +
                    `is entitled to skip for. Any other refusal means a real failure is being explained away. Response was HTTP ` +
                    `${probe.status}: "${probe.message}"`,
            ).toContain('Withdraw method is not active');
            test.skip(true, manualWithdrawUnsupportedSkip(probe));
        }

        const api = new ApiUtils(await request.newContext());
        try {
            const balanceBefore = await readVendorBalance();
            await api.updateWithdraw(probe.withdrawId, { status: 'approved' }, payloads.adminAuth);
            const balanceAfter = await readVendorBalance();

            expect(
                balanceAfter,
                `approving a ${probe.amount} withdrawal must reduce the vendor balance from ${balanceBefore} by exactly that amount. ` +
                    'A balance that does not move means the vendor can request the same money again and be paid twice',
            ).toBeCloseTo(balanceBefore - probe.amount, 2);
        } finally {
            await api.dispose();
        }

        log.success('PP-WDR-07: approval reduced the vendor balance by the approved amount.');
    });

    test('PP-WDR-08: cancelling a PayPal withdrawal leaves the vendor balance unchanged', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            'Helper::is_ready() must be true. Without it the method is not registered at all, the create below is refused for a ' +
                'reason that has nothing to do with the withdraw rules, and the skip this case declares would name the wrong cause',
        ).toBe(true);

        const seed = await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
        expect(seed.receivable, 'the vendor must be connected before a PayPal withdrawal is attempted').toBe(true);

        const probe = await probePayPalWithdrawRequest();
        if (probe.status !== 201) {
            // Same discrimination as PP-WDR-07: only the METHOD refusal earns the skip. A 401 from a
            // lost dokan_manage_withdraw capability (WithdrawController.php:456), a 400 for an
            // insufficient balance (Manager.php:49) or a disabled vendor (Manager.php:62), or a 500
            // all produce the same non-201 and would otherwise be narrated as a designed-away
            // catalogue divergence by manualWithdrawUnsupportedSkip().
            expect(
                probe.message,
                'the probe must have been refused by the METHOD rule (Withdraw/Manager.php:57), which is the ONLY refusal this case ' +
                    `is entitled to skip for. Any other refusal means a real failure is being explained away. Response was HTTP ` +
                    `${probe.status}: "${probe.message}"`,
            ).toContain('Withdraw method is not active');
            test.skip(true, manualWithdrawUnsupportedSkip(probe));
        }

        const api = new ApiUtils(await request.newContext());
        try {
            const balanceBefore = await readVendorBalance();
            await api.updateWithdraw(probe.withdrawId, { status: 'cancelled' }, payloads.adminAuth);
            const balanceAfter = await readVendorBalance();

            expect(
                balanceAfter,
                `cancelling a ${probe.amount} withdrawal must leave the balance at ${balanceBefore}. A balance that dropped anyway ` +
                    'means the vendor lost money to a payout that was never made',
            ).toBeCloseTo(balanceBefore, 2);

            const cancelled = await api.getAllWithdrawsByStatus('cancelled', payloads.vendorAuth);
            const ids = (Array.isArray(cancelled) ? cancelled : []).map((row: { id?: number | string }) => String(row?.id ?? ''));
            expect(ids, 'the request must actually be recorded as cancelled, or the balance was merely never touched by anything').toContain(probe.withdrawId);
        } finally {
            await api.dispose();
        }

        log.success('PP-WDR-08: cancellation left the vendor balance untouched.');
    });
});
