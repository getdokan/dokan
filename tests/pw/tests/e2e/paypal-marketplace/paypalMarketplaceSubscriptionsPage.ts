import { PERSISTENT_CART_META, TEST_NS } from './paypalMarketplaceShared';
import { Browser } from '@playwright/test';
import { test, expect, request } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { payloads } from '@utils/payloads';
import { ApiUtils } from '@utils/apiUtils';
import { SERVER_URL, toPath } from '@utils/helpers';
import { data } from '@utils/testData';
import { SettingsPage } from '../settings/settingsPage';
import { seedSubscriptionPack, setVendorSubscriptionFeature } from '../stripe-express/helpers';
import { PayPalMarketplacePage } from './paypalMarketplacePage';
import {
    adminAuth,
    vendor2Auth,
    VENDOR2_ID,
    CUSTOMER_ID,
    PAYPAL_GATEWAY_ID,
    PAYPAL_KEYS,
    PAYPAL_MERCHANTS,
    PAYPAL_EVENTS,
    MODULE_PRODUCT_SUBSCRIPTION,
    hasCredentials,
    ensurePayPalConfigured,
    getPayPalStatus,
    injectPayPalWebhook,
    getOrderNotes,
    getOrderMetaValue,
} from './helpers';
import type { PayPalStatus } from './helpers';

/* Selectors live on the page object (SKILL non-negotiable #1: selectors belong in
 * `<slug>Page.ts`). These aliases keep the existing in-file names readable. */
export const SETTINGS_UI = PayPalMarketplacePage.subscriptionSettings;

// The suite tsconfig is strict and does not pull @types/node.
declare const process: { env: Record<string, string | undefined> };

/**
 * PayPal Marketplace — vendor subscriptions (PP-SUB-01 … PP-SUB-10).
 *
 * ---------------------------------------------------------------------------
 * What this area actually is
 * ---------------------------------------------------------------------------
 *
 * A vendor subscription is the one flow in this module where the money runs BACKWARDS: the vendor
 * is the buyer and the marketplace admin is the payee. The module implements that inversion in
 * four separate places, and each one is a case below:
 *
 *   - `OrderManager::make_subscription_purchase_unit_data()` hardcodes the purchase unit's payee to
 *     `Helper::get_partner_id()` (Order/OrderManager.php:296-298) — PP-SUB-03.
 *   - `VendorSubscription::get_merchant_id_for_subscription_product()` filters
 *     `dokan_paypal_marketplace_merchant_id` to the partner id for any subscription product
 *     (Subscriptions/VendorSubscription.php:117-124) — PP-SUB-03.
 *   - `Hooks::tax_fee_recipient()` / `Hooks::shipping_fee_recipient()` answer 'admin' for a
 *     subscription order and 'seller' for every other PayPal order (Hooks.php:30-77) — PP-SUB-04.
 *   - `SubscriptionOrderMetaBuilder` books gateway fee, shipping and tax to 'admin' on the
 *     subscription and renewal orders (VendorSubscription.php:274-276, PaymentSaleCompleted.php:158-160).
 *
 * ---------------------------------------------------------------------------
 * What is reachable, and what is not
 * ---------------------------------------------------------------------------
 *
 * The PURCHASE itself is not drivable. `handle_recurring_subscription_purchase()` calls
 * `POST /v1/billing/subscriptions` and then hands the buyer a PayPal-hosted approval URL; the
 * subscription only becomes ACTIVE after a human approves it on paypal.com. No API in this suite
 * can produce that approval. Everything downstream of it IS reachable, through three transports:
 *
 *   1. `injectPayPalWebhook()` — the lifecycle handlers (activated / cancelled / expired /
 *      sale-completed) are pure local state machines once the event arrives, so injecting the event
 *      exercises the real handler. Used by PP-SUB-05 / 08 / 09 / 10.
 *   2. The mu-plugin routes in `dokan-paypal-marketplace-subscription-test-helpers.php`:
 *      `/subscription-purchase-unit` runs the module's own purchase-unit builder and its two
 *      recipient filters (PP-SUB-03 / 04), and `/subscription-paypal-plan` runs the module's own
 *      PayPal catalog-product and billing-plan creation (PP-SUB-06). Both are calls the product
 *      makes itself; only the surrounding trigger lives in the route.
 *   3. A real browser for the two cases that are ABOUT the shop UI — checkout availability
 *      (PP-SUB-02), the one-active-subscription cart guard (PP-SUB-07) — and the admin settings
 *      round-trip (PP-SUB-01).
 *
 * ---------------------------------------------------------------------------
 * Bugs this area already knows about
 * ---------------------------------------------------------------------------
 *
 *   - DOK-024 — `BILLING.SUBSCRIPTION.PAYMENT.FAILED` never revokes `can_post_product`, because
 *     `BillingSubscriptionPaymentFailed.php:57` reads the doubled user-meta key
 *     `product_order_idproduct_order_id`. Covered by PP-WHK-18; not re-covered here.
 *   - DOK-025 — `PaymentSaleCompleted.php:110` dedups renewals on `_dokan_stripe_payment_capture_id`,
 *     a STRIPE key, while this module writes `_dokan_paypal_payment_capture_id`. PP-SUB-09 asserts
 *     the CORRECT invariant and therefore calls `test.fail()` imperatively, immediately before that
 *     one assertion — never on the declaration, which would swallow its positive control too.
 *
 * `test.fail` and never `test.fixme`: a fixme skips the body, so the run reports green and nothing
 * tells us the day the product is fixed. `test.fail` runs the body, expects it to fail while the bug
 * is open, and fails the suite loudly the moment the behaviour becomes correct.
 *
 * ---------------------------------------------------------------------------
 * State discipline
 * ---------------------------------------------------------------------------
 *
 * The webhook handlers write onto the ORDER CUSTOMER. Every lifecycle case below therefore creates
 * its OWN throwaway subscriber rather than reusing CUSTOMER_ID (which `paypalMarketplaceWebhooks.spec.ts`
 * already mutates) or a suite vendor. Two reasons, both load-bearing:
 *
 *   - `SubscriptionHelper::delete_subscription_pack()` queues `Helper::make_product_draft()` for any
 *     subscriber that owns products — a background job that DRAFTS EVERY product that user owns.
 *     Pointed at vendor1 or vendor2 it would silently unpublish the shared product fixtures the rest
 *     of the suite depends on. A fresh subscriber owns nothing.
 *   - Two spec files mutating the same user's subscription metas cannot be told apart afterwards.
 *
 * Never `test.describe.serial`, never tagged `@serial` — `playwright.config.ts:13` grepInverts
 * `@serial` in BOTH lanes (the file would vanish from CI), and `.serial` aborts the rest of the group
 * on the first failure, which on 2026-07-31 silently deleted 46 of 68 cases from a run that still
 * summarised as green.
 */

/* ------------------------------------------------------------------ */
/* Options, metas and selectors this file addresses                    */
/* ------------------------------------------------------------------ */

/** The Dokan settings option the Vendor Subscription tab writes. */
export const SUBSCRIPTION_OPTION = 'dokan_product_subscription';


/**
 * The post metas that make a pack RECURRING. `Helper::get_billing_cycles()` returns an empty array
 * for a non-recurring pack (`SubscriptionPack::is_recurring()` reads `_enable_recurring_payment`),
 * and PayPal then rejects the plan with `MISSING_REQUIRED_PARAMETER /billing_cycles` — measured live
 * on 2026-07-31 while building this file. So these are preconditions of PP-SUB-06, not decoration.
 */
export const RECURRING_PACK_META: Array<[string, string]> = [
    ['_enable_recurring_payment', 'yes'],
    ['_dokan_subscription_period', 'month'],
    ['_dokan_subscription_period_interval', '1'],
    ['_dokan_subscription_length', '3'],
    ['_pack_validity', '30'],
    ['_no_of_product', '-1'],
];

/**
 * The user metas that together ARE an active pack — written by
 * `SubscriptionPack::activate_subscription()` and deleted by
 * `SubscriptionHelper::delete_subscription_pack()`.
 */
export const PACK_STATE_METAS = [
    'product_order_id',
    'product_package_id',
    'product_pack_startdate',
    'product_pack_enddate',
    'product_no_with_pack',
    'can_post_product',
    '_customer_recurring_subscription',
    'dokan_has_active_cancelled_subscrption',
    '_dokan_paypal_marketplace_vendor_subscription_id',
] as const;

/** Metas whose VALUE is a wall-clock timestamp — compared by presence only, see `comparableState()`. */
export const TIMESTAMP_METAS = new Set<string>(['product_pack_startdate', 'product_pack_enddate']);

/**
 * Three selectors from the Dokan settings screen, redeclared here because `settingsSelectors` in
 * `tests/e2e/settings/settingsPage.ts` is a module-private `const` and its navigation helpers are
 * `private`. Only the PUBLIC `setDokanVendorSubscriptionSettings()` is reusable, and that method
 * ends on a save — PP-SUB-01 additionally has to RE-READ the form after a reload, which needs these.
 */

/* ------------------------------------------------------------------ */
/* Mu-plugin transport for the two PP-SUB routes                       */
/* ------------------------------------------------------------------ */

/**
 * ponytail: declared here rather than added to `helpers.ts`. Several agents extend this suite
 * concurrently and `helpers.ts` is the one file all of them touch, so an append there risks a lost
 * write. The ROUTES live in their own mu-plugin file for the same reason
 * (`mu-plugins/dokan-paypal-marketplace-subscription-test-helpers.php`); the namespace is shared,
 * the files are not. Lift this into `helpers.ts` once the parallel work has landed.
 *
 * `Authorization` is HTTP Basic via `payloads.adminAuth`, set EXPLICITLY: `request.newContext()`
 * with no `extraHTTPHeaders` inherits whatever the shared config carries, which is a trap this
 * suite has already been bitten by.
 */


export async function subscriptionRoute<T>(route: string, body: Record<string, unknown>): Promise<T> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.post(`${TEST_NS}${route}`, { data: body });
        if (!res.ok()) {
            throw new Error(`${route} failed (${res.status()}): ${(await res.text()).slice(0, 300)}`);
        }
        return (await res.json()) as T;
    } finally {
        await ctx.dispose();
    }
}

export interface PurchaseUnitProbe {
    ok: boolean;
    order_id: number;
    partner_id: string;
    purchase_unit: Record<string, unknown>;
    payee_merchant_id: string | null;
    merchant_id_seed: string;
    merchant_id_filtered: Record<string, string>;
    tax_fee_recipient: string;
    shipping_fee_recipient: string;
    gateway_fee_paid_by: string;
    is_subscription_order: string;
    payment_method: string;
}

export interface PayPalPlanProbe {
    ok: boolean;
    product_id: number;
    order_id: number;
    product_type: string;
    product_title: string;
    /** `Helper::get_error_message()` can return a string OR an array, so this stays unknown. */
    catalog_error: unknown;
    plan_error: unknown;
    paypal_product: { id: string | null; name: string | null; description: string | null; type: string | null } | null;
    catalog_product_id: string | null;
    plan_id: string | null;
    stored_catalog_meta: string;
    stored_plan_meta: string;
}

export const dbPrefix = process.env.DB_PREFIX ?? 'wp';

export let status: PayPalStatus | null = null;

export let moduleActive = false;

export let subscriptionModuleActive = false;

/** Whatever `dokan_product_subscription` held before this file ran; restored in afterAll. */
export let originalSubscriptionOption: Record<string, unknown> | null = null;

/** Two recurring packs: the second one exists so PP-SUB-07 can add a genuinely DIFFERENT pack. */
export let packId = '';

export let secondPackId = '';

/** An ordinary vendor product — the control half of PP-SUB-03 / PP-SUB-04. */
export let plainProductId = '';

export const createdUserIds: string[] = [];

export const createdOrderIds: number[] = [];

/* -------------------------------------------------------------- */
/* Gates — per test, never in beforeAll                            */
/* -------------------------------------------------------------- */

export function requireModule(): void {
    test.skip(
        !moduleActive,
        'The paypal_marketplace module is inactive, so neither EventFactory nor the subscription hooks are loaded — every assertion here would error out or pass against a module that was never given the chance to run. Activate it first (ensurePayPalConfigured() does, when the three PayPal credentials are present).',
    );
}

export function requireSubscriptionModule(): void {
    test.skip(
        !subscriptionModuleActive,
        `The ${MODULE_PRODUCT_SUBSCRIPTION} module is inactive. Every subscription hook and every BILLING.SUBSCRIPTION.* handler returns at Helper::has_vendor_subscription_module() before touching a row, and no product_pack product type exists at all — so this case would be asserting against code that was never allowed to start.`,
    );
}

export function requireCredentials(): void {
    test.skip(
        !hasCredentials,
        'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE). Without them Helper::is_ready() is false, no partner id exists to be the subscription payee, and no PayPal API call can be made — the case could only report an outcome produced by an unconfigured gateway.',
    );
}

export function requirePack(): void {
    test.skip(
        !packId,
        'The subscription pack fixture was never created (beforeAll skips it when the product_subscription module is inactive), so there is no product_pack product to subscribe to.',
    );
}

/* -------------------------------------------------------------- */
/* Fixtures                                                        */
/* -------------------------------------------------------------- */

/**
 * A WooCommerce order attributed to the PayPal Marketplace gateway.
 *
 * Every subscription handler and both recipient filters start with
 * `$order->get_payment_method() !== Helper::get_gateway_id() → return`, so the payment method is
 * the single most load-bearing field here.
 */
export async function createPayPalOrder(opts: {
    productId: string;
    customerId: string | number;
    status?: string;
    setPaid?: boolean;
    meta?: Array<{ key: string; value: unknown }>;
}): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.post(`${SERVER_URL}/wc/v3/orders`, {
            data: {
                payment_method: PAYPAL_GATEWAY_ID,
                payment_method_title: 'Dokan PayPal Marketplace',
                status: opts.status ?? 'pending',
                set_paid: opts.setPaid ?? false,
                customer_id: Number(opts.customerId),
                billing: payloads.createOrder.billing,
                line_items: [{ product_id: Number(opts.productId), quantity: 1 }],
                ...(opts.meta ? { meta_data: opts.meta } : {}),
            },
        });
        const body = (await res.json().catch(() => ({}))) as { id?: number };
        if (!res.ok() || !body.id) {
            throw new Error(`createPayPalOrder failed (${res.status()}): ${JSON.stringify(body).slice(0, 300)}`);
        }
        createdOrderIds.push(body.id);
        return body.id;
    } finally {
        await ctx.dispose();
    }
}

/** A throwaway subscriber that owns no products — see the file header for why that matters. */
export async function createSubscriber(label: string): Promise<string> {
    const api = new ApiUtils(await request.newContext());
    try {
        const [, userId] = await api.createCustomer(
            { ...payloads.createCustomer(), username: `pp_sub_${label}_${Date.now()}` },
            payloads.adminAuth,
        );
        createdUserIds.push(userId);
        return userId;
    } finally {
        await api.dispose();
    }
}

/**
 * Activate a pack for a subscriber THROUGH THE PRODUCT, by injecting the activation webhook the
 * way PayPal delivers it.
 *
 * Deliberately not hand-seeded metas: the cases that consume this then assert against state the
 * module actually produced, and a change in what activation writes shows up here instead of
 * being papered over by a fixture that keeps writing the old shape.
 */
export async function activatePackViaWebhook(subscriberId: string, subscriptionId: string, caseId: string): Promise<number> {
    const orderId = await createPayPalOrder({
        productId: packId,
        customerId: subscriberId,
        status: 'processing',
        setPaid: true,
        meta: [
            { key: '_dokan_vendor_subscription_order', value: 'yes' },
            { key: '_dokan_paypal_marketplace_vendor_subscription_id', value: subscriptionId },
        ],
    });

    const result = await injectPayPalWebhook(PAYPAL_EVENTS.subscriptionActivated, {
        id: subscriptionId,
        status: 'ACTIVE',
        custom_id: String(orderId),
        plan_id: `P-E2E-${caseId}`,
    });

    expect(result.handler, `${PAYPAL_EVENTS.subscriptionActivated} must resolve to BillingSubscriptionActivated.`).toBe('BillingSubscriptionActivated');
    expect(result.fatal, `BillingSubscriptionActivated raised a PHP \\Error, which EventFactory does not catch: ${result.error}`).toBe(false);

    return orderId;
}

/** The pack metas as they stand for one subscriber. */
export async function packState(userId: string): Promise<Record<string, string | null>> {
    const state: Record<string, string | null> = {};
    for (const key of PACK_STATE_METAS) {
        state[key] = await dbUtils.getUserMetaValue(userId, key);
    }
    return state;
}

/**
 * A comparable projection of `packState()`.
 *
 * The two date metas are reduced to present/absent on purpose: two subscribers activated a second
 * apart legitimately carry different `product_pack_startdate` strings, and comparing those raw
 * would report "expiry behaves differently from cancellation" for a clock reason rather than a
 * behavioural one — a false bug, which is worse than a missed one.
 */
export function comparableState(state: Record<string, string | null>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(state)) {
        out[key] = TIMESTAMP_METAS.has(key) ? (value === null ? 'absent' : 'present') : String(value);
    }
    return out;
}

export class PayPalMarketplaceSubscriptionsPage {
    async setupAll(): Promise<void> {
        await ensurePayPalConfigured();

        status = await getPayPalStatus();
        moduleActive = status?.module_active === true;

        const activeModules = (await dbUtils.dbQuery(`SELECT option_value FROM ${dbPrefix}_options WHERE option_name = 'dokan_pro_active_modules';`)) as Array<{
            option_value: string;
        }>;
        subscriptionModuleActive = activeModules.length ? activeModules[0]!.option_value.includes(MODULE_PRODUCT_SUBSCRIPTION) : false;

        const storedOption = await dbUtils.getOptionValueOrNull(SUBSCRIPTION_OPTION);
        originalSubscriptionOption = storedOption && typeof storedOption === 'object' ? (storedOption as Record<string, unknown>) : null;

        if (subscriptionModuleActive) {
            // `enable_pricing` is 'off' on a stock site. The vendor dashboard's subscription endpoint
            // (the redirect target of the PP-SUB-07 cart guard) only registers when it is on, and
            // flushing rewrites afterwards is what makes that endpoint resolvable in the same run.
            await setVendorSubscriptionFeature(true);

            [packId] = await seedSubscriptionPack({ ...payloads.createProduct(), name: 'PayPal Vendor Subscription Pack A' }, RECURRING_PACK_META);
            [secondPackId] = await seedSubscriptionPack({ ...payloads.createProduct(), name: 'PayPal Vendor Subscription Pack B' }, RECURRING_PACK_META);
        }

        const api = new ApiUtils(await request.newContext());
        [, plainProductId] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Subscription Control Product' }, payloads.vendorAuth);
        await api.dispose();

        log.info(
            `PP-SUB setup: module_active=${moduleActive}, ${MODULE_PRODUCT_SUBSCRIPTION}=${subscriptionModuleActive}, is_ready=${status?.is_ready}, credentials=${hasCredentials}, packs=${packId}/${secondPackId}.`,
        );
    }

    async teardownAll(): Promise<void> {
        // vendor2 is the only shared identity this file touches (PP-SUB-02 / 07). Leaving a pack on
        // it would change how every later spec sees that vendor — product limits, commission tier and
        // the cart guard itself.
        await dbUtils.removeVendorSubscription(VENDOR2_ID);
        await dbUtils.deleteUserMeta(VENDOR2_ID, ['_dokan_paypal_marketplace_vendor_subscription_id', '_dokan_subscription_is_on_trial', '_dokan_subscription_trial_until', 'cancelled_product_pack_enddate']);
        await dbUtils.clearCustomerCart(VENDOR2_ID);

        // The feature flag is global. Restore whatever the site had, rather than leaving vendor
        // subscriptions switched on for every spec that follows.
        if (originalSubscriptionOption) {
            await dbUtils.setOptionValue(SUBSCRIPTION_OPTION, originalSubscriptionOption);
        }

        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            for (const orderId of createdOrderIds) {
                await ctx.delete(`${SERVER_URL}/wc/v3/orders/${orderId}?force=true`).catch(() => undefined);
            }
            for (const productId of [packId, secondPackId, plainProductId].filter(Boolean)) {
                await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`).catch(() => undefined);
            }
        } finally {
            await ctx.dispose();
        }

        const api = new ApiUtils(await request.newContext());
        try {
            for (const userId of createdUserIds) {
                await api.deleteUser(userId, payloads.adminAuth).catch(() => undefined);
            }
        } finally {
            await api.dispose();
        }
    }

    async ppSub01({ browser }: { browser: Browser }): Promise<void> {
        requireSubscriptionModule();

        // The two round-tripped values are deliberately NOT the settings-field defaults. `Fields.vue`
        // renders `fieldValue[name] ?? fieldData.default`, and the registered defaults are
        // `no_of_days_before_mail => '2'` / `product_status_after_end => 'draft'`
        // (dokan-pro/modules/subscription/includes/admin/admin.php:895-913) — which is exactly what
        // `data.dokanSettings.vendorSubscription` carries. Saving those, the reloaded form would show
        // them even with an EMPTY option row, so the reload assertions below could not fail for the
        // defect they name. '7' and 'pending' can only appear on screen if the form read the store.
        const target = { ...data.dokanSettings.vendorSubscription, noOfDays: '7', productStatus: 'pending' };

        // A baseline that makes the assertion non-trivial. `enable_pricing` defaults to 'off' but
        // `no_of_days_before_mail` already holds a value on a stock site, so all three keys are
        // written to something no fixture uses first — otherwise "the setting reads 'on' afterwards"
        // could be satisfied by a previous run rather than by the save under test.
        //
        // Written as a whole map off the captured original rather than through
        // `dbUtils.updateOptionValue()`, which read-modify-writes via `getOptionValue()` and THROWS on
        // an absent option row — a legitimate state on a site where this settings page has never been
        // saved, and one that would turn this case into an error instead of a result.
        await dbUtils.setOptionValue(SUBSCRIPTION_OPTION, {
            ...(originalSubscriptionOption ?? {}),
            enable_pricing: 'off',
            no_of_days_before_mail: '9',
            product_status_after_end: 'publish',
        });
        const before = (await dbUtils.getOptionValueOrNull(SUBSCRIPTION_OPTION)) as Record<string, string> | null;
        expect(
            before?.['enable_pricing'],
            'positive baseline: vendor subscriptions must start DISABLED, or a later "enable_pricing is on" proves only that someone enabled it at some point in the past.',
        ).toBe('off');
        expect(
            { noOfDays: before?.['no_of_days_before_mail'], productStatus: before?.['product_status_after_end'] },
            'positive baseline: the reminder window and the post-expiry product status must start on values the save under test does NOT write, or "the saved value is present afterwards" is satisfied by whatever the site already held.',
        ).toEqual({ noOfDays: '9', productStatus: 'publish' });

        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        try {
            // The real admin form, through the existing settings page object — the save it performs
            // is the product's own `dokan_save_settings` ajax round trip, not an option write.
            await new SettingsPage(page).setDokanVendorSubscriptionSettings(target);

            const saved = (await dbUtils.getOptionValueOrNull(SUBSCRIPTION_OPTION)) as Record<string, string> | null;
            expect(
                saved?.['enable_pricing'],
                'the admin enabled vendor subscriptions and saved, but the setting did not persist. Nothing in the marketplace changes: packs stay unsellable, the vendor dashboard never grows its Subscription menu, and the admin has no feedback that the save was lost.',
            ).toBe('on');
            expect(
                saved?.['no_of_days_before_mail'],
                'the expiry-reminder window did not persist, so vendors are warned on the wrong schedule (or not at all) before their pack lapses.',
            ).toBe(target.noOfDays);
            expect(
                saved?.['product_status_after_end'],
                'the post-expiry product status did not persist, so what happens to a lapsed vendor\'s live products is decided by a stale value rather than by the admin\'s choice.',
            ).toBe(target.productStatus);

            // Persistence is only proven once the form RENDERS the stored values back: an option row
            // that no screen reads is not a setting.
            await page.goto(toPath(data.subUrls.backend.dokan.settings), { waitUntil: 'domcontentloaded' });
            await page.reload();
            await page.locator(SETTINGS_UI.vendorSubscriptionMenu).click();

            await expect(
                page.locator(SETTINGS_UI.noOfDays),
                'the Vendor Subscription tab does not render the saved reminder window after a reload — the value is in the database but the form shows something else, so the next admin who opens this screen and saves silently reverts it.',
            ).toHaveValue(target.noOfDays);
            await expect(
                page.locator(SETTINGS_UI.productStatus),
                'the Vendor Subscription tab does not render the saved post-expiry product status after a reload.',
            ).toHaveValue(target.productStatus);
        } finally {
            await page.close();
            await ctx.close();
        }

        // Deliberately left ENABLED: every case below needs the feature on, and afterAll restores the
        // site's original value at the end of the file.
        log.success('PP-SUB-01: vendor-subscription settings round-trip through a real save and reload.');
    }

    async ppSub02({ browser }: { browser: Browser }): Promise<void> {
        requireModule();
        requireSubscriptionModule();
        requireCredentials();
        requirePack();

        await setVendorSubscriptionFeature(true);

        const ready = await getPayPalStatus();
        expect(
            ready.is_ready,
            `Helper::is_ready() must be true before this case can say anything: PayPal::is_available() is parent::is_available() AND is_ready() AND validate_cart_items(), so on an unconfigured gateway "not offered" would be true for a reason that has nothing to do with subscriptions. Observed: enabled=${ready.is_enabled}, partner id present=${ready.has_partner_id}.`,
        ).toBe(true);

        // The vendor must NOT already hold a pack: `VendorSubscription::maybe_empty_cart()` would then
        // empty the cart and redirect before checkout ever renders, and the gateway's absence would be
        // the guard's doing rather than the gateway's — PP-SUB-07 is the case that tests that guard.
        await dbUtils.removeVendorSubscription(VENDOR2_ID);
        await dbUtils.clearCustomerCart(VENDOR2_ID);

        const ctx = await browser.newContext({ storageState: vendor2Auth });
        const page = await ctx.newPage();
        try {
            const paypal = new PayPalMarketplacePage(page);
            await paypal.addProductToCart(packId);

            // Proven off the database, not off the page: WooCommerce writes this meta from the
            // `woocommerce_add_to_cart` action, which fires only on a SUCCESSFUL add. An empty cart
            // offers no payment methods at all, so without this the answer below would be a statement
            // about the cart rather than about the gateway.
            const cart = (await dbUtils.getUserMetaValue(VENDOR2_ID, PERSISTENT_CART_META)) ?? '';
            expect(
                cart,
                `pack ${packId} never reached vendor ${VENDOR2_ID}'s cart, so the checkout below could not have offered any payment method regardless of the gateway. Cart meta seen: ${cart.slice(0, 200)}`,
            ).toMatch(new RegExp(`"product_id";(i:${packId};|s:\\d+:"${packId}")`));

            // Hydration is anchored on the place-order button being ATTACHED, not VISIBLE — the same
            // anchor PP-BLK-02 uses on the classic checkout, and for the same reason. The button is
            // rendered only by the checkout block's React app (it appears nowhere in the server HTML
            // for /checkout/), so its presence already proves the block mounted; its VISIBILITY does
            // not, because WooCommerce Blocks hides the native place-order button with
            // `visibility: hidden` as soon as the selected method supplies its own button, which
            // PayPal Marketplace does — it mounts the PayPal SDK smart buttons when it is the
            // selected method, and it is selected here by being first in the gateway order.
            // Measured on the 2026-07-31 run: this case timed out for 45s on a `visible` wait while
            // the trace showed the paypal radio present and CHECKED and the button carrying
            // `style="visibility: hidden"`, i.e. the page it was waiting for had already rendered
            // the answer. `PayPalMarketplacePage.isGatewayOfferedAtBlockCheckout()` still waits for
            // VISIBLE, so this case navigates itself rather than calling it.
            await page.goto(PayPalMarketplacePage.block.url, { waitUntil: 'domcontentloaded' });
            await page.waitForLoadState('networkidle').catch(() => undefined);
            await expect(
                page.locator(PayPalMarketplacePage.block.placeOrder),
                `the checkout block never mounted at ${PayPalMarketplacePage.block.url}, so no statement about payment-method availability can be made from this page — an absent gateway radio would only mean the React app had not rendered yet. The cart was proven non-empty from the database immediately above, so this is a rendering failure and not the usual empty-cart redirect.`,
            ).toBeAttached({ timeout: 60_000 });

            const offered = (await page.locator(PayPalMarketplacePage.block.gatewayRadio).count()) > 0;
            expect(
                offered,
                `the gateway is not offered for a subscription pack, so no vendor can buy a subscription with PayPal at all — the whole PP-SUB flow is unreachable in the shop. Helper::validate_cart_items() short-circuits to VALID for a subscription product (Helper.php:1321-1324) precisely because the vendor is the buyer here and no seller merchant id is involved, so an absence points at is_available() or at the block registration rather than at vendor connection state.`,
            ).toBe(true);
        } finally {
            await page.close();
            await ctx.close();
        }

        log.success('PP-SUB-02: the gateway is offered at checkout for a vendor-subscription pack.');
    }

    async ppSub03(): Promise<void> {
        requireModule();
        requireSubscriptionModule();
        requireCredentials();
        requirePack();

        const subscriberId = await createSubscriber('sub03');
        const orderId = await createPayPalOrder({
            productId: packId,
            customerId: subscriberId,
            meta: [{ key: '_dokan_vendor_subscription_order', value: 'yes' }],
        });

        const probe = await subscriptionRoute<PurchaseUnitProbe>('/subscription-purchase-unit', {
            order_id: orderId,
            // Both packs and an ordinary product, so the merchant-id filter is observed making a
            // DISTINCTION rather than answering the same thing to everything.
            product_ids: [packId, plainProductId].filter(Boolean),
            merchant_id_seed: PAYPAL_MERCHANTS.vendor1,
        });

        expect(
            probe.partner_id,
            'the gateway holds no partner id, so there is nothing for a subscription purchase unit to be paid to and this case cannot distinguish the admin payee from an empty one.',
        ).toBe(PAYPAL_KEYS.partnerId);

        expect(
            probe.payee_merchant_id,
            `the subscription purchase unit for order #${orderId} is payable to "${probe.payee_merchant_id}" instead of the admin partner id "${probe.partner_id}". A vendor merchant id here pays the VENDOR for their own subscription — the marketplace charges a vendor and then routes that charge straight back to them, so the admin is never paid and the vendor is billed for nothing.`,
        ).toBe(probe.partner_id);

        // Neither suite vendor may appear as the payee. Stated separately from the equality above
        // because a future refactor could make `get_partner_id()` return a vendor id and the equality
        // alone would still hold.
        for (const [label, merchantId] of Object.entries(PAYPAL_MERCHANTS)) {
            expect(
                probe.payee_merchant_id,
                `the subscription payee resolved to ${label}'s merchant id (${merchantId}) — the vendor would be paid for buying their own subscription.`,
            ).not.toBe(merchantId);
        }

        // The second inversion site: the merchant-id filter. The seed is a REAL vendor merchant id,
        // so an unfiltered answer is indistinguishable from a working marketplace product order —
        // which is exactly what the control below has to keep looking like.
        expect(
            probe.merchant_id_filtered[String(packId)],
            `dokan_paypal_marketplace_merchant_id was not redirected to the partner id for pack ${packId} (got "${probe.merchant_id_filtered[String(packId)]}"). VendorSubscription::get_merchant_id_for_subscription_product() is what keeps a subscription charge away from the vendor's own merchant account on every other code path that asks for a merchant id.`,
        ).toBe(probe.partner_id);

        if (plainProductId) {
            expect(
                probe.merchant_id_filtered[String(plainProductId)],
                `the merchant-id filter also rewrote an ORDINARY product (${plainProductId}) to the partner id. Every normal marketplace sale would then be paid to the admin instead of the seller — the inverse of the bug this case guards, and far more damaging.`,
            ).toBe(PAYPAL_MERCHANTS.vendor1);
        }

        log.success('PP-SUB-03: the subscription payee is the admin partner, and ordinary products are untouched.');
    }

    async ppSub04(): Promise<void> {
        requireModule();
        requireSubscriptionModule();
        requireCredentials();
        requirePack();

        // The precondition this case actually needs, asserted instead of proxied. `Hooks` — the sole
        // registrar of both filters under test (Hooks.php:16-17) — is constructed inside
        // `Module::set_controllers()` only AFTER `if ( ! Helper::is_enabled() ) { return; }`
        // (module.php:99-113). With the gateway disabled neither filter exists, both probes answer the
        // mu-plugin's 'UNFILTERED' sentinel, and the assertions below would go red blaming the module
        // for what is a configuration state. `dokan_pro_active_modules` still lists the module then, so
        // `requireModule()` alone does not catch it.
        const ready = await getPayPalStatus();
        expect(
            ready.is_enabled,
            `the PayPal Marketplace gateway is disabled, so Hooks was never constructed and dokan_tax_fee_recipient / dokan_shipping_fee_recipient are unregistered — nothing below could report on the module's behaviour. Observed: is_ready=${ready.is_ready}, partner id present=${ready.has_partner_id}.`,
        ).toBe(true);

        const subscriberId = await createSubscriber('sub04');

        const subscriptionOrderId = await createPayPalOrder({
            productId: packId,
            customerId: subscriberId,
            meta: [{ key: '_dokan_vendor_subscription_order', value: 'yes' }],
        });
        // The control: same gateway, ordinary product, no subscription flag. Without it "the
        // recipient is admin" could not be told apart from "the filter answers admin to everything",
        // which would silently divert the tax and shipping of every marketplace sale.
        const controlOrderId = await createPayPalOrder({ productId: plainProductId, customerId: CUSTOMER_ID });

        const subscription = await subscriptionRoute<PurchaseUnitProbe>('/subscription-purchase-unit', { order_id: subscriptionOrderId, product_ids: [] });
        const control = await subscriptionRoute<PurchaseUnitProbe>('/subscription-purchase-unit', { order_id: controlOrderId, product_ids: [] });

        expect(
            subscription.is_subscription_order,
            `order #${subscriptionOrderId} does not carry _dokan_vendor_subscription_order = yes, which is the only thing Hooks::tax_fee_recipient() keys on — without it this case is reading the ordinary-order branch and would report "seller" as a defect.`,
        ).toBe('yes');

        for (const [field, value] of [
            ['tax_fee_recipient', subscription.tax_fee_recipient],
            ['shipping_fee_recipient', subscription.shipping_fee_recipient],
        ] as const) {
            expect(
                value,
                `${field} resolved to "${value}" for vendor-subscription order #${subscriptionOrderId} instead of "admin". The vendor is the BUYER of this order, so booking its tax or shipping to the seller credits the vendor for money the marketplace collected from them — the vendor's balance grows every time they pay for their own subscription. Hooks.php:30-77 is the branch under test.`,
            ).toBe('admin');
        }

        for (const [field, value] of [
            ['tax_fee_recipient', control.tax_fee_recipient],
            ['shipping_fee_recipient', control.shipping_fee_recipient],
        ] as const) {
            expect(
                value,
                `${field} resolved to "${value}" for the ORDINARY PayPal order #${controlOrderId}. It must be "seller" there: an 'admin' answer means the module now diverts the tax and shipping of every normal marketplace sale away from the vendor who fulfilled it, and an 'UNFILTERED' answer means Hooks was never registered at all, which would make the subscription assertion above meaningless.`,
            ).toBe('seller');
        }

        /* ---------------------------------------------------------- */
        /* The THIRD recipient — the gateway processing fee            */
        /* ---------------------------------------------------------- */

        // The two assertions above cover the two FILTERS. The third recipient this case is named for
        // is not a filter at all: `dokan_gateway_fee_paid_by` is order meta, written by
        // `SubscriptionOrderMetaBuilder::set_gateway_fee_paid_by( 'admin' )`. It can therefore only be
        // observed on a path that actually runs the builder. The initial purchase writes it at
        // Subscriptions/VendorSubscription.php:274, behind the PayPal-hosted approval no API in this
        // suite can produce; the RENEWAL writes the same three values at
        // WebhookEvents/PaymentSaleCompleted.php:158-160 and IS reachable with the webhook transport
        // this file already uses (PP-SUB-09 drives the same branch for its dedup invariant).
        //
        // Note the meta keys: the builder stores `dokan_gateway_fee_paid_by` but `shipping_fee_recipient`
        // and `tax_fee_recipient` UNPREFIXED (SubscriptionOrderMetaBuilder.php:192/206/220) — the same
        // two names the filters above answer under a `dokan_` prefix. Asserting the prefixed names here
        // would read absent meta and go red for a naming reason rather than a behavioural one.
        expect(
            subscription.gateway_fee_paid_by,
            `positive baseline: the freshly created vendor-subscription order #${subscriptionOrderId} must carry an EMPTY dokan_gateway_fee_paid_by, or "the renewal booked the processing fee to admin" below could be satisfied by state that was already on the order before SubscriptionOrderMetaBuilder ever ran. Observed: "${subscription.gateway_fee_paid_by}".`,
        ).toBe('');

        // Its own subscriber and its own subscription id, for the reason in the file header: the sale
        // handler writes onto the ORDER CUSTOMER, and a renewal booked against a subscriber shared with
        // another case could not be told apart afterwards.
        const renewalSubscriberId = await createSubscriber('sub04r');
        const renewalSubscriptionId = `I-E2ESUB04${Date.now()}`;
        const renewalParentOrderId = await createPayPalOrder({
            productId: packId,
            customerId: renewalSubscriberId,
            status: 'processing',
            setPaid: true,
            meta: [
                { key: '_dokan_vendor_subscription_order', value: 'yes' },
                { key: '_dokan_paypal_marketplace_vendor_subscription_id', value: renewalSubscriptionId },
                // `$is_renewal` is `! empty( _dokan_paypal_payment_capture_id )` (PaymentSaleCompleted.php:95),
                // and the meta builder runs on the renewal branch only — so this INITIAL capture id is a
                // precondition of the three assertions below, not decoration.
                { key: '_dokan_paypal_payment_capture_id', value: 'CAP-E2E-SUB04-INITIAL' },
            ],
        });

        // Baselined rather than assumed empty: renewal orders are CHILDREN of the subscription order and
        // Dokan's own order splitter also produces children.
        const childrenBefore = await dbUtils.getChildOrderIds(String(renewalParentOrderId));

        const sale = await injectPayPalWebhook(PAYPAL_EVENTS.saleCompleted, {
            id: `SALE-E2E-SUB04-${Date.now()}`,
            state: 'completed',
            billing_agreement_id: renewalSubscriptionId,
            custom: String(renewalParentOrderId),
            amount: { total: '25.00', currency: 'USD' },
            transaction_fee: { currency: 'USD', value: '1.05' },
        });
        expect(sale.handler, 'PAYMENT.SALE.COMPLETED must resolve to PaymentSaleCompleted.').toBe('PaymentSaleCompleted');
        expect(sale.fatal, `PaymentSaleCompleted raised a PHP \\Error, which EventFactory does not catch: ${sale.error}`).toBe(false);

        const renewalChildren = (await dbUtils.getChildOrderIds(String(renewalParentOrderId))).filter(id => !childrenBefore.includes(id));
        expect(
            renewalChildren.length,
            `positive control: one PAYMENT.SALE.COMPLETED produced ${renewalChildren.length} renewal orders for subscription order #${renewalParentOrderId} instead of exactly 1, so there is no renewal order to read the fee recipients off and the three assertions below could not report on the module's behaviour. An early return in PaymentSaleCompleted::handle() (wrong gateway, missing _dokan_vendor_subscription_order, or a subscription id that does not match the order's) looks exactly like this.`,
        ).toBe(1);

        const renewalOrderId = String(renewalChildren[0]);
        createdOrderIds.push(Number(renewalOrderId));

        expect(
            await getOrderMetaValue(renewalOrderId, 'dokan_gateway_fee_paid_by'),
            `renewal order #${renewalOrderId} books dokan_gateway_fee_paid_by to something other than "admin". The PayPal processing fee on a vendor-subscription renewal is then charged to the VENDOR, so the vendor pays the marketplace's own gateway cost on money the marketplace charged them — deducted from their balance every renewal cycle, silently and forever. SubscriptionOrderMetaBuilder via PaymentSaleCompleted.php:158-160 is the writer under test.`,
        ).toBe('admin');

        expect(
            await getOrderMetaValue(renewalOrderId, 'shipping_fee_recipient'),
            `renewal order #${renewalOrderId} books shipping_fee_recipient to something other than "admin", so any shipping amount on a subscription renewal is credited to the vendor who was just billed for it (PaymentSaleCompleted.php:159).`,
        ).toBe('admin');

        expect(
            await getOrderMetaValue(renewalOrderId, 'tax_fee_recipient'),
            `renewal order #${renewalOrderId} books tax_fee_recipient to something other than "admin", so the tax the marketplace collected on its own subscription charge is credited to the vendor's balance instead of the admin's (PaymentSaleCompleted.php:160).`,
        ).toBe('admin');

        log.success('PP-SUB-04: subscription orders book fee, shipping and tax to admin while ordinary PayPal orders still book to the seller.');
    }

    async ppSub05(): Promise<void> {
        requireModule();
        requireSubscriptionModule();
        requirePack();

        const subscriberId = await createSubscriber('sub05');
        const subscriptionId = `I-E2ESUB05${Date.now()}`;

        expect(
            await dbUtils.getUserMetaValue(subscriberId, '_dokan_paypal_marketplace_vendor_subscription_id'),
            'positive baseline: a freshly created subscriber must hold no PayPal subscription id, or the assertion below would be satisfied by leftover state.',
        ).toBeNull();

        const orderId = await activatePackViaWebhook(subscriberId, subscriptionId, 'SUB05');

        expect(
            await dbUtils.getUserMetaValue(subscriberId, '_dokan_paypal_marketplace_vendor_subscription_id'),
            `the PayPal subscription id was never stored against subscriber ${subscriberId}. Helper::get_vendor_id_by_subscription() resolves the subscriber from exactly this user meta (Helper.php:947-960), and the suspend, re-activate and payment-failed handlers all start there — so without it every later lifecycle event for this subscription is a silent no-op while PayPal keeps billing the vendor.`,
        ).toBe(subscriptionId);

        expect(
            await dbUtils.getUserMetaValue(subscriberId, 'product_order_id'),
            `the pack was not linked back to order #${orderId}, so SubscriptionHelper::delete_subscription_pack() can never match this subscription and a later cancellation cannot tear it down.`,
        ).toBe(String(orderId));

        expect(
            await dbUtils.getUserMetaValue(subscriberId, 'can_post_product'),
            'the subscription is ACTIVE at PayPal and the vendor is being billed, but the pack never granted posting rights.',
        ).toBe('1');

        const notes = await getOrderNotes(orderId);
        expect(
            notes.some(n => n.includes(subscriptionId)),
            `order #${orderId} carries no note naming subscription ${subscriptionId}, so nothing in the shop links the WooCommerce order to the PayPal billing agreement it is being charged against. Notes seen: ${JSON.stringify(notes ?? null).slice(0, 300)}`,
        ).toBe(true);

        log.success('PP-SUB-05: activation stores the PayPal subscription id and links the pack to its order.');
    }

    async ppSub06(): Promise<void> {
        requireModule();
        requireSubscriptionModule();
        requireCredentials();
        requirePack();

        const ready = await getPayPalStatus();
        expect(
            ready.is_ready,
            'both calls under test authenticate with the partner app credentials, so an unready gateway would fail at the token request and this case would report PayPal problems that are really configuration problems.',
        ).toBe(true);

        const subscriberId = await createSubscriber('sub06');
        const orderId = await createPayPalOrder({
            productId: packId,
            customerId: subscriberId,
            meta: [{ key: '_dokan_vendor_subscription_order', value: 'yes' }],
        });

        const probe = await subscriptionRoute<PayPalPlanProbe>('/subscription-paypal-plan', { product_id: packId, order_id: orderId });

        expect(
            probe.product_type,
            `the fixture is a "${probe.product_type}" product, not a product_pack — SubscriptionHelper::get_vendor_subscription_product_by_order() would not recognise it and this case would be measuring the wrong thing.`,
        ).toBe('product_pack');

        expect(
            probe.catalog_error === null,
            `PayPal refused to create the catalog product for pack ${packId}, so the pack maps to nothing at PayPal and no plan (and therefore no subscription) can ever be created for it. PayPal said: ${JSON.stringify(probe.catalog_error ?? null).slice(0, 400)}`,
        ).toBe(true);

        expect(
            probe.catalog_product_id,
            `no PayPal catalog product id came back for pack ${packId}. Helper::create_product_in_paypal() stores this id on the pack and every plan created later references it (Helper.php:1024), so without it a vendor can add the pack to their cart and the purchase then dies at plan creation.`,
        ).toBeTruthy();

        expect(
            probe.stored_catalog_meta,
            `the catalog product id was created but not stored on pack ${packId} as _dokan_paypal_marketplace_subscription_product_id. The pack would then create a NEW PayPal catalog product on every save and every purchase, orphaning the previous ones.`,
        ).toBe(probe.catalog_product_id);

        // "Corresponds to the pack configuration": the stored id is read back FROM PayPal and must
        // describe this pack — a stale id left by an earlier run would otherwise satisfy the checks
        // above while pointing at somebody else's product.
        expect(
            probe.paypal_product?.name,
            `the stored catalog id ${probe.catalog_product_id} resolves at PayPal to "${probe.paypal_product?.name ?? 'nothing'}" rather than to this pack ("${probe.product_title}"), so the pack is mapped to the wrong PayPal product and subscriptions bought for it would be described to the buyer as something else.`,
        ).toBe(probe.product_title);
        expect(
            probe.paypal_product?.type,
            'the PayPal catalog product is not a SERVICE, which is what Helper::create_product_in_paypal() sends for a vendor subscription (Helper.php:983).',
        ).toBe('SERVICE');

        expect(
            probe.plan_error === null,
            `PayPal refused the billing plan for pack ${packId}, so no vendor can subscribe to it. This is the call that carries the pack's own billing cycle — interval, period and price all come from the pack metas via Helper::get_billing_cycles(), so PayPal's wording names the field that is wrong. PayPal said: ${JSON.stringify(probe.plan_error ?? null).slice(0, 400)}`,
        ).toBe(true);

        expect(
            probe.plan_id,
            `no billing plan id came back for pack ${packId}; handle_recurring_subscription_purchase() cannot create the PayPal subscription without one and the vendor's purchase would end on an error notice.`,
        ).toBeTruthy();

        expect(
            probe.stored_plan_meta,
            `the plan id was created but not stored on order #${orderId} as _dokan_paypal_marketplace_subscription_plan_id. The module reads that meta to DEACTIVATE the previous plan when a vendor changes pack (VendorSubscription.php:310-315), so an unstored id leaks an active plan at PayPal on every change.`,
        ).toBe(probe.plan_id);

        log.success(`PP-SUB-06: pack ${packId} maps to catalog product ${probe.catalog_product_id} and plan ${probe.plan_id}.`);
    }

    async ppSub07({ browser }: { browser: Browser }): Promise<void> {
        requireModule();
        requireSubscriptionModule();
        requirePack();
        test.skip(
            !secondPackId,
            'The second subscription pack fixture is missing, and adding the SAME pack twice would not distinguish the one-active-subscription guard from ordinary duplicate-item handling.',
        );

        await setVendorSubscriptionFeature(true);
        await dbUtils.removeVendorSubscription(VENDOR2_ID);
        await dbUtils.clearCustomerCart(VENDOR2_ID);

        const ctx = await browser.newContext({ storageState: vendor2Auth });
        const page = await ctx.newPage();
        try {
            const paypal = new PayPalMarketplacePage(page);

            // Positive control FIRST. Without it, "the pack did not reach the cart" after the guard is
            // seeded would be equally consistent with a broken add-to-cart, an unpublished pack or a
            // vendor who cannot buy at all — the negative would pass for the wrong reason.
            await paypal.addProductToCart(secondPackId);
            const unguardedCart = (await dbUtils.getUserMetaValue(VENDOR2_ID, PERSISTENT_CART_META)) ?? '';
            expect(
                unguardedCart,
                `pack ${secondPackId} could not be added to vendor ${VENDOR2_ID}'s cart even with NO active subscription, so the rejection asserted below would prove nothing about the guard. Cart meta seen: ${unguardedCart.slice(0, 200)}`,
            ).toMatch(new RegExp(`"product_id";(i:${secondPackId};|s:\\d+:"${secondPackId}")`));

            await dbUtils.clearCustomerCart(VENDOR2_ID);

            // Now give the vendor a genuinely active subscription. All three preconditions of
            // `maybe_empty_cart()` have to hold: `product_package_id` (has_subscription), an order
            // reachable through `product_order_id`, and that order's payment method being THIS gateway
            // — the guard deliberately ignores subscriptions bought through any other gateway.
            const subscriptionOrderId = await createPayPalOrder({
                productId: packId,
                customerId: VENDOR2_ID,
                status: 'processing',
                setPaid: true,
                meta: [{ key: '_dokan_vendor_subscription_order', value: 'yes' }],
            });
            await dbUtils.setUserMeta(String(VENDOR2_ID), 'product_package_id', String(packId), false);
            await dbUtils.setUserMeta(String(VENDOR2_ID), 'product_order_id', String(subscriptionOrderId), false);
            await dbUtils.setUserMeta(String(VENDOR2_ID), 'can_post_product', '1', false);

            await paypal.addProductToCart(secondPackId);

            // `maybe_empty_cart()` empties the cart, adds a notice and `wp_safe_redirect()`s to the
            // vendor dashboard's subscription page with this flag. The redirect target is asserted
            // rather than the notice text because the dashboard page renders on a different template
            // that need not print WooCommerce notices — the flag is the module's own signal.
            expect(
                page.url(),
                `vendor ${VENDOR2_ID} already holds an active PayPal subscription, but adding pack ${secondPackId} was not intercepted (landed on ${page.url()}). Two subscriptions would then run in parallel at PayPal and the vendor would be billed twice for one marketplace, with only one of the two ever reachable from their dashboard.`,
            ).toContain('already-has-subscription=true');

            const guardedCart = (await dbUtils.getUserMetaValue(VENDOR2_ID, PERSISTENT_CART_META)) ?? '';
            expect(
                guardedCart,
                `the guard redirected but pack ${secondPackId} is still sitting in vendor ${VENDOR2_ID}'s cart, so the vendor can walk straight to checkout and buy the second subscription anyway. Cart meta seen: ${guardedCart.slice(0, 200)}`,
            ).not.toMatch(new RegExp(`"product_id";(i:${secondPackId};|s:\\d+:"${secondPackId}")`));
        } finally {
            await dbUtils.removeVendorSubscription(VENDOR2_ID);
            await dbUtils.clearCustomerCart(VENDOR2_ID);
            await page.close();
            await ctx.close();
        }

        log.success('PP-SUB-07: the one-active-subscription guard rejects a second pack and empties the cart.');
    }

    async ppSub08(): Promise<void> {
        requireModule();
        requireSubscriptionModule();
        requirePack();

        const subscriberId = await createSubscriber('sub08');
        const subscriptionId = `I-E2ESUB08${Date.now()}`;
        const orderId = await activatePackViaWebhook(subscriberId, subscriptionId, 'SUB08');

        // Baseline taken from state the PRODUCT wrote, not from seeded metas.
        expect(
            await dbUtils.getUserMetaValue(subscriberId, 'can_post_product'),
            'positive baseline: the pack must be active before cancellation, or "the pack is gone" is already true when the cancellation event arrives.',
        ).toBe('1');

        const result = await injectPayPalWebhook(PAYPAL_EVENTS.subscriptionCancelled, {
            id: subscriptionId,
            status: 'CANCELLED',
            custom_id: String(orderId),
            plan_id: 'P-E2E-SUB08',
        });

        expect(result.handler, 'BILLING.SUBSCRIPTION.CANCELLED must resolve to BillingSubscriptionCancelled.').toBe('BillingSubscriptionCancelled');
        expect(result.fatal, `BillingSubscriptionCancelled raised a PHP \\Error: ${result.error}`).toBe(false);

        expect(
            await dbUtils.getUserMetaValue(subscriberId, 'can_post_product'),
            `subscriber ${subscriberId} cancelled at PayPal and is no longer billed, but still holds posting rights. A cancelled vendor keeps trading on a subscription-gated marketplace for free, and the only thing that would ever revoke it is a renewal failure — which DOK-024 shows never fires either.`,
        ).toBeNull();

        expect(
            await dbUtils.getUserMetaValue(subscriberId, 'product_package_id'),
            `the pack itself survived cancellation for subscriber ${subscriberId}, so the vendor keeps the pack's product allowance and its commission tier after PayPal stopped charging for them.`,
        ).toBeNull();

        expect(
            await dbUtils.getUserMetaValue(subscriberId, '_dokan_paypal_marketplace_vendor_subscription_id'),
            'the PayPal subscription id survived cancellation, so a later event for a subscription that no longer exists still resolves to this vendor.',
        ).toBeNull();

        const notes = await getOrderNotes(orderId);
        expect(
            notes.some(n => n.includes('Subscription Cancelled')),
            `order #${orderId} records no cancellation, so nothing in the shop explains why the vendor's pack disappeared. Notes seen: ${JSON.stringify(notes ?? null).slice(0, 300)}`,
        ).toBe(true);

        log.success('PP-SUB-08: cancellation tears the pack down and revokes posting rights.');
    }

    async ppSub09(): Promise<void> {
        requireModule();
        requireSubscriptionModule();
        requirePack();

        const subscriberId = await createSubscriber('sub09');
        const subscriptionId = `I-E2ESUB09${Date.now()}`;
        const transactionId = `SALE-E2E-SUB09-${Date.now()}`;

        // `$is_renewal` is `! empty( _dokan_paypal_payment_capture_id )`, so the INITIAL capture id is
        // what puts a sale event on the renewal branch at all.
        const orderId = await createPayPalOrder({
            productId: packId,
            customerId: subscriberId,
            status: 'processing',
            setPaid: true,
            meta: [
                { key: '_dokan_vendor_subscription_order', value: 'yes' },
                { key: '_dokan_paypal_marketplace_vendor_subscription_id', value: subscriptionId },
                { key: '_dokan_paypal_payment_capture_id', value: 'CAP-E2E-SUB09-INITIAL' },
            ],
        });

        const saleResource = {
            id: transactionId,
            state: 'completed',
            billing_agreement_id: subscriptionId,
            custom: String(orderId),
            amount: { total: '25.00', currency: 'USD' },
            transaction_fee: { currency: 'USD', value: '1.05' },
        };

        // Baselined rather than assumed to be zero: renewal orders are CHILDREN of the subscription
        // order, and Dokan's own order splitter also produces children.
        const childrenBefore = (await dbUtils.getChildOrderIds(String(orderId))).length;

        const first = await injectPayPalWebhook(PAYPAL_EVENTS.saleCompleted, saleResource);
        expect(first.handler, 'PAYMENT.SALE.COMPLETED must resolve to PaymentSaleCompleted.').toBe('PaymentSaleCompleted');
        expect(first.fatal, `PaymentSaleCompleted raised a PHP \\Error: ${first.error}`).toBe(false);

        const afterFirst = (await dbUtils.getChildOrderIds(String(orderId))).length - childrenBefore;
        expect(
            afterFirst,
            `one PAYMENT.SALE.COMPLETED produced ${afterFirst} renewal orders for subscription order #${orderId} instead of exactly 1. PayPal charged the vendor once, so any other number means the shop's record of what the vendor paid no longer matches what PayPal took.`,
        ).toBe(1);

        const second = await injectPayPalWebhook(PAYPAL_EVENTS.saleCompleted, saleResource);
        expect(second.fatal, `the redelivered sale event raised a PHP \\Error: ${second.error}`).toBe(false);

        const afterSecond = (await dbUtils.getChildOrderIds(String(orderId))).length - childrenBefore;

        // Everything above this line is a control and must go RED on its own. From here on the case is
        // asserting behaviour DOK-025 currently gets wrong, so only this last assertion is expected to
        // fail — and the moment it stops failing, Playwright reports "expected to fail, but passed" and
        // this marker is what gets deleted.
        test.fail();

        expect(
            afterSecond,
            `a REDELIVERED PAYMENT.SALE.COMPLETED for transaction ${transactionId} created another renewal order (${afterSecond} now exist for order #${orderId}) — the vendor is charged once by PayPal and billed repeatedly by the shop, and each duplicate extends the pack validity again. Known defect DOK-025: the dedup query at PaymentSaleCompleted.php:110 searches for the STRIPE meta key _dokan_stripe_payment_capture_id while this module writes _dokan_paypal_payment_capture_id, so it can never match. This assertion states the CORRECT behaviour; when it starts passing, DOK-025 is fixed and the test.fail modifier on this case must be removed.`,
        ).toBe(1);
    }

    async ppSub10(): Promise<void> {
        requireModule();
        requireSubscriptionModule();
        requirePack();

        const cancelledSubscriber = await createSubscriber('sub10c');
        const expiredSubscriber = await createSubscriber('sub10e');
        const cancelledSubscriptionId = `I-E2ESUB10C${Date.now()}`;
        const expiredSubscriptionId = `I-E2ESUB10E${Date.now()}`;

        const cancelledOrderId = await activatePackViaWebhook(cancelledSubscriber, cancelledSubscriptionId, 'SUB10C');
        const expiredOrderId = await activatePackViaWebhook(expiredSubscriber, expiredSubscriptionId, 'SUB10E');

        // Both subscribers must genuinely be subscribed first, or "identical afterwards" is satisfied
        // by two users who never had a subscription at all — the emptiest possible pass.
        for (const [label, subscriberId] of [
            ['cancelled', cancelledSubscriber],
            ['expired', expiredSubscriber],
        ] as const) {
            expect(
                await dbUtils.getUserMetaValue(subscriberId, 'can_post_product'),
                `positive baseline: the ${label} subscriber must hold an ACTIVE pack before its event is delivered, or the comparison below is between two empty states.`,
            ).toBe('1');
        }

        const cancelledResult = await injectPayPalWebhook(PAYPAL_EVENTS.subscriptionCancelled, {
            id: cancelledSubscriptionId,
            status: 'CANCELLED',
            custom_id: String(cancelledOrderId),
            plan_id: 'P-E2E-SUB10C',
        });
        const expiredResult = await injectPayPalWebhook(PAYPAL_EVENTS.subscriptionExpired, {
            id: expiredSubscriptionId,
            status: 'EXPIRED',
            custom_id: String(expiredOrderId),
            plan_id: 'P-E2E-SUB10E',
        });

        expect(
            expiredResult.handler,
            `${PAYPAL_EVENTS.subscriptionExpired} must resolve to BillingSubscriptionCancelled — the two event strings share one handler in Helper::get_supported_webhook_events(), which is the aliasing this case exists to pin. A separate handler here means expiry has grown its own behaviour and everything below has to be re-derived.`,
        ).toBe(cancelledResult.handler);
        expect(expiredResult.fatal, `the expiry event raised a PHP \\Error: ${expiredResult.error}`).toBe(false);
        expect(cancelledResult.fatal, `the cancellation event raised a PHP \\Error: ${cancelledResult.error}`).toBe(false);

        const cancelledRaw = await packState(cancelledSubscriber);
        const expiredRaw = await packState(expiredSubscriber);
        const cancelledState = comparableState(cancelledRaw);
        const expiredState = comparableState(expiredRaw);

        expect(
            expiredState,
            `an EXPIRED subscription left the vendor in a different state from a CANCELLED one. The two events map to the same handler, so a divergence means one of them stopped reaching it — and whichever one did leaves a vendor either trading without a paid subscription or locked out of one they still hold. Cancelled: ${JSON.stringify(cancelledState ?? null)}. Expired: ${JSON.stringify(expiredState ?? null)}.`,
        ).toEqual(cancelledState);

        // …and that shared state must actually be "no subscription". Two identical LIVE states would
        // satisfy the equality above while proving nothing was torn down at all.
        expect(
            expiredRaw['can_post_product'],
            `expiry and cancellation agree, but neither of them revoked posting rights: subscriber ${expiredSubscriber} keeps trading after their subscription ended at PayPal.`,
        ).toBeNull();
        expect(
            expiredRaw['product_package_id'],
            'expiry and cancellation agree, but neither removed the pack — the vendor keeps the pack allowance and commission tier they no longer pay for.',
        ).toBeNull();

        log.success('PP-SUB-10: expiry and cancellation are behaviourally indistinguishable, and both tear the pack down.');
    }
}
