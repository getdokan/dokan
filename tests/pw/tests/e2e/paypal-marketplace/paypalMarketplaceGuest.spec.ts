import { test, expect, request } from '@utils/test';
import type { Browser, BrowserContext, Page } from '@utils/test';
import { SERVER_URL, BASE_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads, MOBILE_TEST_PHONE } from '@utils/payloads';
import { PAYPAL_IDS, PayPalMarketplacePage } from './paypalMarketplacePage';
import {
    VENDOR_ID,
    PAYPAL_MERCHANTS,
    PAYPAL_VENDOR_LOGINS,
    hasCredentials,
    ensurePayPalConfigured,
    ensureClassicCheckoutPage,
    getPayPalStatus,
    getOrderMetaValue,
    seedPayPalConnectedVendor,
    probe,
    deleteOrder,
} from './helpers';
import type { Probe } from './helpers';

/* Selectors live on the page object (SKILL non-negotiable #1: selectors belong in
 * `<slug>Page.ts`). These aliases keep the existing in-file names readable. */
const CHECKOUT = PayPalMarketplacePage.classic;
const TRACKING = PayPalMarketplacePage.tracking;

/**
 * PayPal Marketplace — guest (logged-out) checkout · PP-GST-01 … PP-GST-05.
 *
 * THE trap for this area, and the reason every probe in this file is shaped the way it is:
 * `request.newContext()` inherits the shared config's `extraHTTPHeaders`, which on the API config
 * carries admin HTTP Basic auth (`api.config.ts:67`). A "guest" probe that omits the header
 * therefore runs as ADMINISTRATOR and proves nothing at all — it would report that an anonymous
 * caller can reach a payment route when what it actually measured was the site owner reaching it.
 * Every request context created here sets `Authorization: ''` EXPLICITLY, and — because a blanked
 * header still says nothing about cookies — every guest session additionally PROVES it is logged
 * out before any claim is made about it, by asking the site who it thinks the caller is:
 * `GET wp/v2/users/me` must answer `rest_not_logged_in`. That control is not decoration. It is the
 * only thing standing between "a guest can do X" and "somebody with credentials can do X".
 *
 * Surfaces under test, all grounded in dokan-pro 5.0.9 source:
 *
 *   - Classic checkout (`[woocommerce_checkout]` shortcode page created by
 *     `ensureClassicCheckoutPage()`), because the guest happy path has to place a REAL order and
 *     the classic form is the transport this suite already drives.
 *   - `POST dokan/v1/paypal-marketplace/create-payment` (the cart route) →
 *     `PayPalController::check_cart_permission()` (`REST/V1/PayPalController.php:81`).
 *   - WooCommerce's own `[woocommerce_order_tracking]` shortcode, for PP-GST-04.
 *
 * How a guest order is actually placed here, and why it is not a shortcut. With
 * `button_type = smart` — the value this site ships and the module's default rendering path —
 * `CartHandler::display_paypal_button()` (`Cart/CartHandler.php:250-260`) HIDES `#place_order` and
 * hands submission to the PayPal Smart Buttons. Their `createOrder` callback runs `set_order()`
 * (`assets/js/paypal-checkout.js`), which POSTs the serialized `form.checkout` to
 * `wc_checkout_params.checkout_url` — WooCommerce's own `?wc-ajax=checkout` endpoint. That POST is
 * what creates the WooCommerce order; the PayPal approval that follows it is a separate, later
 * step. So this file performs exactly that POST from inside the guest's own page. It is the
 * product's real checkout path, not a bypass of it: `WC_Checkout::process_checkout()` runs in
 * full, including gateway availability, field validation, order creation and
 * `PayPal::process_payment()`. What it deliberately stops short of is the PayPal-hosted buyer
 * approval, which is the only step that moves money and the only one no API can grant.
 *
 * Gating, per test, never in `beforeAll` (a `test.skip` there silently voids the whole describe):
 * cases that need the gateway to be OFFERED skip on `!hasCredentials`, because `is_ready()` is
 * `enabled && partner_id && client_id && client_secret` and an unconfigured site hides the method
 * for a reason that has nothing to do with being a guest. PP-GST-05 needs no credentials: the
 * permission callback it measures runs before the handler that needs them.
 *
 * Never tagged `@serial`, and never `test.describe.serial`: `playwright.config.ts:13` grepInverts
 * `@serial` out of BOTH lanes, and `.serial` aborts the whole group on the first failure — on
 * 2026-07-31 that silently deleted 46 of 68 cases from a run that still summarised as green. A
 * file already runs sequentially in one worker, so the cascade buys nothing and costs coverage.
 * Consequently no test here depends on another having run: each one that needs a guest order
 * places its own.
 */

/* ------------------------------------------------------------------ */
/* Identity / transport                                                */
/* ------------------------------------------------------------------ */

type Headers = Record<string, string>;

/** Blank by default so nothing inherits an identity it was not given. */
const ANON: Headers = { Authorization: '' };
const ADMIN: Headers = payloads.adminAuth as Headers;

/** WP_Error code carried by a REST error envelope, or '' when the response is not one. */
const errorCode = (p: Probe): string => (typeof p.json?.code === 'string' ? p.json.code : '');

/**
 * Short, ALWAYS-SAFE rendering of anything, for assertion messages.
 *
 * Playwright builds assertion messages EAGERLY — before the condition is evaluated — so a message
 * that throws turns a PASSING case into a failure. `JSON.stringify(undefined)` returns the value
 * `undefined`, and `.slice()` on that throws; that exact mistake failed a green case in this suite
 * on 2026-07-31. The `?? null` is the whole point of this function.
 */
const brief = (value: unknown, max = 300): string => String(JSON.stringify(value ?? null) ?? 'null').slice(0, max);

/**
 * Absolute site URL. `browser.newContext()` does NOT inherit `use.baseURL` — only the
 * `context`/`page` fixtures do — so a relative `page.goto('/cart/')` inside a manually created
 * context fails outright.
 */
const siteUrl = (path: string): string => `${BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

/** Every cookie the browser context holds, as a request `Cookie` header. */
async function cookieHeader(ctx: BrowserContext): Promise<string> {
    const cookies = await ctx.cookies(BASE_URL);
    return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

/**
 * Prove the session really is anonymous BEFORE anything is claimed about it.
 *
 * A blanked `Authorization` header only removes HTTP Basic auth; a WordPress auth COOKIE would
 * still authenticate the caller. Asking `wp/v2/users/me` who the caller is covers both at once:
 * `rest_not_logged_in` is WordPress's own statement that nobody is signed in.
 */
async function assertSessionIsAnonymous(label: string, headers: Headers = {}): Promise<void> {
    const me = await probe(`${SERVER_URL}/wp/v2/users/me`, { headers });
    expect(
        errorCode(me),
        `${label}: the session this case calls a "guest" is in fact signed in (wp/v2/users/me answered ${me.status} ${brief(me.json, 160)}). Every guest finding below would then be a statement about an authenticated user, which is the exact false-positive this control exists to prevent.`,
    ).toBe('rest_not_logged_in');
}

/* ------------------------------------------------------------------ */
/* Page / DOM                                                          */
/* ------------------------------------------------------------------ */



const GUEST_BILLING = {
    firstName: 'Guest',
    lastName: 'Buyer',
    phone: MOBILE_TEST_PHONE,
    address1: '123 Test Street',
    city: 'New York',
    postcode: '10001',
    country: 'US',
    state: 'NY',
} as const;

/** WooCommerce account options this area's preconditions name. Read, set, restored in afterAll. */
const GUEST_CHECKOUT_OPTION = 'woocommerce_enable_guest_checkout';
const SIGNUP_AT_CHECKOUT_OPTION = 'woocommerce_enable_signup_and_login_from_checkout';

/** WooCommerce blocks the classic form with `.blockOverlay` during its update_checkout AJAX. */
async function waitForCheckoutSettled(page: Page): Promise<void> {
    await page.waitForFunction(() => !document.querySelector('.blockOverlay'), undefined, { timeout: 20_000 }).catch(() => undefined);
}

/* ------------------------------------------------------------------ */
/* Order lookup                                                        */
/* ------------------------------------------------------------------ */

interface OrderRecord {
    id: number;
    parent_id: number;
    customer_id: number;
    status: string;
    total: string;
    order_key: string;
    payment_method: string;
    billing?: { email?: string };
}

const ORDER_FIELDS = 'id,parent_id,customer_id,status,total,order_key,payment_method,billing';

/**
 * Find the PARENT order carrying a billing email.
 *
 * Deliberately a list-and-filter rather than `?search=` or a direct DB read: the WooCommerce REST
 * `search` parameter's behaviour differs between the posts and the HPOS order stores, and a DB
 * query would have to know which of the two this site uses. Newest-first over the last 50 orders
 * cannot miss an order this file created seconds earlier, and it is storage-agnostic.
 *
 * `parent_id === 0` is load-bearing. Dokan's splitter copies the billing address onto every vendor
 * sub order, and sub orders are created AFTER the parent, so they sort first under `order desc` —
 * a naive "newest with this email" would hand back a sub order whose customer id, total and order
 * key all belong to a different object than the one the shopper checked out with.
 */
async function findOrderByBillingEmail(email: string): Promise<OrderRecord | null> {
    const res = await probe(`${SERVER_URL}/wc/v3/orders?per_page=50&orderby=id&order=desc&status=any&_fields=${ORDER_FIELDS}`, { headers: ADMIN });
    const rows = Array.isArray(res.json) ? (res.json as unknown as OrderRecord[]) : [];
    return rows.find(o => Number(o.parent_id ?? 0) === 0 && String(o.billing?.email ?? '').toLowerCase() === email.toLowerCase()) ?? null;
}

/**
 * The highest order id that exists RIGHT NOW.
 *
 * Used as a "nothing older than this" watermark: an order id handed back by a later call that is
 * greater than this one cannot be an order that already existed, so it cannot be another customer's.
 * Safe under parallel workers — another spec creating orders in between only raises the real ids,
 * never lowers the watermark.
 */
async function latestOrderId(): Promise<number> {
    const res = await probe(`${SERVER_URL}/wc/v3/orders?per_page=1&orderby=id&order=desc&status=any&_fields=id`, { headers: ADMIN });
    const rows = Array.isArray(res.json) ? (res.json as unknown as Array<{ id: number }>) : [];
    return Number(rows[0]?.id ?? 0);
}

async function getOrder(orderId: string | number): Promise<OrderRecord | null> {
    const res = await probe(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=${ORDER_FIELDS}`, { headers: ADMIN });
    return typeof res.json?.id === 'number' ? (res.json as unknown as OrderRecord) : null;
}

/* ------------------------------------------------------------------ */
/* Guest checkout                                                      */
/* ------------------------------------------------------------------ */

interface GuestCheckoutOutcome {
    /** Raw `?wc-ajax=checkout` response, truncated. Carried into assertion messages so a failure names the cause. */
    response: string;
    /** The order WooCommerce created, or null when checkout never got that far. */
    order: OrderRecord | null;
}

/**
 * Place a real order as a true logged-out visitor and return what WooCommerce recorded.
 *
 * The context carries NO storageState, so the session starts empty; `assertSessionIsAnonymous()`
 * then proves that from the server's side rather than assuming it. The PayPal radio is asserted
 * VISIBLE before it is selected — without that, a site where the gateway is unavailable produces
 * an opaque click timeout that reads as a test bug instead of the real finding, and every later
 * assertion would be measuring an order paid by some other gateway.
 */
async function placeGuestOrder(browser: Browser, productId: string, email: string, opts: { createAccount?: boolean } = {}): Promise<GuestCheckoutOutcome> {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    let response = '';
    try {
        await page.goto(siteUrl(`/?p=${productId}&add-to-cart=${productId}`), { waitUntil: 'domcontentloaded' });
        await assertSessionIsAnonymous('guest checkout', { Cookie: await cookieHeader(ctx) });

        await page.goto(CHECKOUT.url, { waitUntil: 'domcontentloaded' });
        await waitForCheckoutSettled(page);

        const b = CHECKOUT.billing;
        await page.selectOption(b.country, GUEST_BILLING.country).catch(() => undefined);
        await page.fill(b.firstName, GUEST_BILLING.firstName);
        await page.fill(b.lastName, GUEST_BILLING.lastName);
        await page.fill(b.address1, GUEST_BILLING.address1);
        await page.fill(b.city, GUEST_BILLING.city);
        await page.fill(b.postcode, GUEST_BILLING.postcode);
        await page.selectOption(b.state, GUEST_BILLING.state).catch(async () => {
            await page.fill(b.state, GUEST_BILLING.state).catch(() => undefined);
        });
        await page.fill(b.email, email);
        await page.fill(b.phone, GUEST_BILLING.phone).catch(() => undefined);

        if (opts.createAccount) {
            const createAccount = page.locator(CHECKOUT.createAccount);
            await expect(
                createAccount,
                'the "Create an account?" checkbox did not render on the guest checkout, so this case cannot exercise guest-to-account creation at all — it would silently degrade into an ordinary guest order and report success',
            ).toBeVisible({ timeout: 20_000 });
            await createAccount.check();
            await waitForCheckoutSettled(page);
            const password = page.locator(CHECKOUT.accountPassword);
            if (await password.isVisible().catch(() => false)) {
                await password.fill(`Pw!${Date.now()}`);
            }
        }

        await waitForCheckoutSettled(page);
        // PRESENCE, not visibility: WooCommerce's own checkout script HIDES the radio input when it
        // is the only payment method on the page (`init_payment_methods()`,
        // assets/js/frontend/checkout.js:223-231 — `if ( 1 === $payment_methods.length )`). On a
        // site where PayPal Marketplace ends up the single available gateway, `toBeVisible()` would
        // report a perfectly working system as "the gateway is not offered". The label is what the
        // shopper clicks and it stays visible either way.
        await expect(
            page.locator(CHECKOUT.radio),
            `PayPal Marketplace is not offered to a logged-out visitor holding a connected vendor's product, so no guest order can be placed through it. is_available() is parent::is_available() && Helper::is_ready() && Helper::validate_cart_items() (PaymentMethods/PayPal.php:599) — one of those three is false.`,
        ).toHaveCount(1, { timeout: 30_000 });
        await page.locator(CHECKOUT.label).click();
        await waitForCheckoutSettled(page);

        const terms = page.locator(CHECKOUT.terms);
        if (await terms.isVisible().catch(() => false)) {
            await terms.check().catch(() => undefined);
        }

        // The module's own `set_order()` (assets/js/paypal-checkout.js): POST the serialized
        // checkout form to WooCommerce's `?wc-ajax=checkout`. `WC_Checkout::process_checkout()`
        // runs in full behind it — validation, order creation, PayPal::process_payment().
        response = await page.evaluate(async () => {
            const w = window as unknown as {
                jQuery?: (selector: string) => { serialize(): string };
                wc_checkout_params?: { checkout_url?: string };
            };
            const jq = w.jQuery;
            const url = w.wc_checkout_params?.checkout_url ?? '';
            if (!jq || !url) {
                return 'the classic checkout page exposed neither jQuery nor wc_checkout_params.checkout_url';
            }
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: jq('form.checkout').serialize(),
                credentials: 'same-origin',
            });
            return `HTTP ${res.status} ${(await res.text()).slice(0, 400)}`;
        });
    } finally {
        await page.close();
        await ctx.close();
    }

    const order = await findOrderByBillingEmail(email);

    /*
     * "An order carrying this email exists" is NOT evidence that the PayPal integration worked.
     * `WC_Checkout::process_checkout()` creates the order — with the submitted billing email,
     * `customer_id 0` and `payment_method = dokan_paypal_marketplace` already set — and only THEN
     * calls the gateway (class-wc-checkout.php:1360-1380). When `PayPal::process_payment()` returns
     * `['result' => 'failure', …]` (PaymentMethods/PayPal.php:311-326, the branch taken whenever
     * `Processor::create_order()` is a WP_Error) the order is left in the database and checkout
     * merely answers a failure. Stale sandbox credentials satisfy `Helper::is_ready()`
     * (Helper.php:101-105 only checks the three strings are non-empty), a merchant id that granted
     * the partner app no consent is rejected as the payee, and a PayPal outage does the same — in
     * every one of those states the identity assertions below would pass against an order no
     * shopper could ever have paid for.
     *
     * `_dokan_paypal_order_id` is the exact proof: it is written only after
     * `Processor::create_order()` succeeds (PayPal.php:328-330).
     */
    if (order) {
        expect(
            (await getOrderMetaValue(order.id, '_dokan_paypal_order_id')) ?? '',
            `guest order ${order.id} carries no PayPal order id, so PayPal::process_payment() failed and this "guest order" was never payable — the assertions made about it describe an order the shopper could not have completed. Checkout answered: ${response.slice(0, 400)}`,
        ).not.toBe('');
    }

    return { response, order };
}

/* ------------------------------------------------------------------ */
/* Fixture pages                                                       */
/* ------------------------------------------------------------------ */

/**
 * A `[woocommerce_order_tracking]` page (idempotent).
 *
 * WooCommerce does NOT create one on install — verified on this site, whose page list holds Cart,
 * Checkout, My account and Refund policy but no tracking page — so PP-GST-04 has to provide the
 * surface it tests. Same shape as `ensureClassicCheckoutPage()`.
 */
async function ensureOrderTrackingPage(): Promise<void> {
    const existing = await probe(`${SERVER_URL}/wp/v2/pages?slug=${TRACKING.slug}&status=publish`, { headers: ADMIN });
    const pages = Array.isArray(existing.json) ? (existing.json as unknown as unknown[]) : [];
    if (pages.length > 0) {
        return;
    }
    await probe(`${SERVER_URL}/wp/v2/pages`, {
        method: 'post',
        headers: ADMIN,
        data: { title: 'Order Tracking', slug: TRACKING.slug, status: 'publish', content: '[woocommerce_order_tracking]' },
    });
}

/**
 * Read a plain-string WooCommerce option.
 *
 * `dbUtils.getOptionValue()` calls php-serialize's `unserialize()` UNCONDITIONALLY and throws on a
 * plain string, and `woocommerce_enable_guest_checkout` holds the literal `yes`/`no`.
 * `getOptionValueOrNull()` is the safe reader, and the matching write must pass
 * `serializeData = false` or `yes` is stored as `s:3:"yes";` and WooCommerce stops recognising it.
 */
async function readFlagOption(option: string): Promise<string | null> {
    const value = await dbUtils.getOptionValueOrNull(option);
    return value === null ? null : String(value);
}

test.describe('PayPal Marketplace — guest checkout · PP-GST', () => {
    // Every happy path here places a real order, and `PayPal::process_payment()` makes a live
    // outbound call to PayPal to create the order before the response comes back.
    test.describe.configure({ timeout: 240_000 });

    let productId = '';
    const createdOrderIds: Array<string | number> = [];
    const createdUserIds: number[] = [];
    let previousGuestCheckout: string | null = null;
    let previousSignupAtCheckout: string | null = null;

    test.beforeAll(async () => {
        // No test.skip() here: it would void the whole describe silently. Every gated case carries
        // its own per-test skip naming exactly what is missing.
        await ensurePayPalConfigured();
        await ensureClassicCheckoutPage();
        await ensureOrderTrackingPage();

        // The preconditions this area names, made true rather than assumed — and recorded so the
        // site is handed back exactly as it was found.
        previousGuestCheckout = await readFlagOption(GUEST_CHECKOUT_OPTION);
        previousSignupAtCheckout = await readFlagOption(SIGNUP_AT_CHECKOUT_OPTION);
        await dbUtils.setOptionValue(GUEST_CHECKOUT_OPTION, 'yes', false);
        await dbUtils.setOptionValue(SIGNUP_AT_CHECKOUT_OPTION, 'yes', false);

        // SIX mode-swapped metas. Seeding fewer produces a vendor that READS as connected — the
        // PayPal SDK even loads with the right merchant-id — while the payment method never
        // appears at checkout, which would make every assertion in this file pass or fail for
        // entirely the wrong reason.
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, {
            email: PAYPAL_VENDOR_LOGINS.vendor1.email || 'dokangit@vendor1.com',
        });

        const api = new ApiUtils(await request.newContext());
        try {
            const [, id] = await api.createProduct({ ...payloads.createProduct(), name: 'PP Guest Product', regular_price: '25' }, payloads.vendorAuth);
            productId = id;
        } finally {
            await api.dispose();
        }
    });

    test.afterAll(async () => {
        for (const id of createdOrderIds) {
            await deleteOrder(id);
        }
        for (const id of createdUserIds) {
            await probe(`${SERVER_URL}/wp/v2/users/${id}?force=true&reassign=1`, { method: 'delete', headers: ADMIN }).catch(() => undefined);
        }
        if (productId) {
            await probe(`${SERVER_URL}/wc/v3/products/${productId}?force=true`, { method: 'delete', headers: ADMIN }).catch(() => undefined);
        }
        // Restore, including the "the row did not exist" case — leaving a row behind that this
        // file created would hand the next spec a setting the site never had.
        for (const [option, previous] of [
            [GUEST_CHECKOUT_OPTION, previousGuestCheckout],
            [SIGNUP_AT_CHECKOUT_OPTION, previousSignupAtCheckout],
        ] as const) {
            if (previous === null) {
                await dbUtils.deleteOptionRow([option]);
            } else {
                await dbUtils.setOptionValue(option, previous, false);
            }
        }
        // The vendor is deliberately left seeded: connected is the suite's normal state and the
        // sibling specs seed idempotently on top of it.
    });

    // ---------------------------------------------------------------------
    // PP-GST-01 — a logged-out visitor is offered the gateway at checkout.
    // ---------------------------------------------------------------------
    test('PP-GST-01: a logged-out visitor holding a connected vendor product is offered PayPal Marketplace at checkout', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(
            !hasCredentials,
            'TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE are not all set, so Helper::is_ready() is false and the gateway is hidden from EVERY visitor. "A guest is not offered PayPal" would then be true for a reason that has nothing to do with being a guest.',
        );

        // Positive baseline. Without it, the whole case could be measuring an unconfigured site.
        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            `the gateway is not ready (enabled=${status.is_enabled}, partner id=${status.has_partner_id}, module active=${status.module_active}), so nothing this case observes at checkout can be attributed to the visitor being logged out`,
        ).toBe(true);

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            await page.goto(siteUrl(`/?p=${productId}&add-to-cart=${productId}`), { waitUntil: 'domcontentloaded' });
            await assertSessionIsAnonymous('PP-GST-01', { Cookie: await cookieHeader(ctx) });

            await page.goto(CHECKOUT.url, { waitUntil: 'domcontentloaded' });
            await waitForCheckoutSettled(page);

            // WooCommerce renders the order form even when NO gateway is available, so this only
            // proves the page rendered — it is a precondition for the real assertion, not the
            // assertion itself.
            await expect(page.locator(CHECKOUT.form), 'the classic checkout page must render the order form, or the gateway assertion below is being made against a page that never loaded').toBeVisible({
                timeout: 60_000,
            });

            // PRESENCE, not visibility: WooCommerce hides the radio INPUT when it is the only
            // payment method on the page (`init_payment_methods()`,
            // assets/js/frontend/checkout.js:223-231). Asserting visibility would report a working
            // single-gateway site as "guests are not offered PayPal".
            await expect(
                page.locator(CHECKOUT.radio),
                'a logged-out shopper carrying a connected vendor\'s product is NOT offered PayPal Marketplace, so guests cannot buy from this marketplace at all — every anonymous visitor is turned away at the payment step',
            ).toHaveCount(1, { timeout: 30_000 });

            // The radio id is the gateway id; the LABEL is the admin-editable `title` setting, so
            // the label text is deliberately not asserted here (the XSS cases change it).
            //
            // Selecting it is asserted rather than its `disabled` attribute: WooCommerce's
            // payment-method template never emits `disabled`, so `toBeEnabled()` could not fail,
            // whereas a broken `update_checkout` fragment refresh really does de-select the method
            // and leave the guest unable to choose it.
            await page.locator(CHECKOUT.label).click();
            await waitForCheckoutSettled(page);
            await expect(
                page.locator(CHECKOUT.radio),
                'a guest cannot actually SELECT PayPal Marketplace — the method is rendered but clicking it leaves it unchecked, so the shopper can see the gateway and still not pay with it',
            ).toBeChecked();
        } finally {
            await page.close();
            await ctx.close();
        }
        log.success('PP-GST-01: PayPal Marketplace is offered to a proven logged-out visitor on classic checkout.');
    });

    // ---------------------------------------------------------------------
    // PP-GST-02 — the guest order records the correct billing identity.
    // ---------------------------------------------------------------------
    test('PP-GST-02: a guest order is recorded against customer id 0 and keeps the billing email the visitor submitted', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(
            !hasCredentials,
            'the PayPal credentials are absent, so the gateway is unavailable and WC_Checkout::process_checkout() rejects the order before it is ever created — there would be no guest order to read a billing identity from.',
        );

        const email = `pp-gst-02-${Date.now()}@example.test`;
        const outcome = await placeGuestOrder(browser, productId, email);
        if (outcome.order) {
            createdOrderIds.push(outcome.order.id);
        }

        expect(
            outcome.order,
            `no WooCommerce order carrying the guest billing email ${email} exists after the checkout POST, so this case has nothing to assert an identity against — a guest who completed checkout would have paid for an order that was never recorded. Checkout answered: ${outcome.response.slice(0, 400)}`,
        ).not.toBeNull();

        const order = outcome.order as OrderRecord;
        expect(
            order.payment_method,
            `the guest order was recorded against "${order.payment_method}", not the PayPal Marketplace gateway, so the identity assertions below would describe some other gateway's order`,
        ).toBe(PAYPAL_IDS.gateway);
        expect(
            order.customer_id,
            `guest order ${order.id} was attached to WordPress user ${order.customer_id} instead of being recorded as a guest purchase (customer id 0) — an anonymous buyer's order is showing up inside somebody's account`,
        ).toBe(0);
        expect(
            String(order.billing?.email ?? ''),
            `guest order ${order.id} did not keep the billing email the visitor typed, so the buyer can never be contacted about it and cannot look the order up again (order tracking matches on this field)`,
        ).toBe(email);

        log.success(`PP-GST-02: guest order ${order.id} recorded customer_id 0 and retained ${email}.`);
    });

    // ---------------------------------------------------------------------
    // PP-GST-03 — guest-to-account creation preserves the order.
    // ---------------------------------------------------------------------
    test('PP-GST-03: a guest who ticks "create an account" keeps the order, attached to the new account', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(
            !hasCredentials,
            'the PayPal credentials are absent, so the gateway is unavailable and no order — guest or otherwise — is created to be attached to a new account.',
        );

        const email = `pp-gst-03-${Date.now()}@example.test`;
        const outcome = await placeGuestOrder(browser, productId, email, { createAccount: true });
        if (outcome.order) {
            createdOrderIds.push(outcome.order.id);
        }

        expect(
            outcome.order,
            `no order carrying ${email} exists after a checkout with account creation ticked, so a shopper who signed up during checkout has lost their purchase entirely. Checkout answered: ${outcome.response.slice(0, 400)}`,
        ).not.toBeNull();

        const customers = await probe(`${SERVER_URL}/wc/v3/customers?email=${encodeURIComponent(email)}&_fields=id,email`, { headers: ADMIN });
        const rows = Array.isArray(customers.json) ? (customers.json as unknown as Array<{ id: number; email: string }>) : [];
        const created = rows.find(c => String(c.email ?? '').toLowerCase() === email.toLowerCase()) ?? null;
        if (created) {
            createdUserIds.push(created.id);
        }

        expect(
            created,
            `checkout accepted the "create an account" tick but no WordPress account exists for ${email} (customers endpoint answered ${customers.status} ${brief(customers.json, 200)}) — the shopper was told an account was made and has none`,
        ).not.toBeNull();

        const order = outcome.order as OrderRecord;
        const account = created as { id: number; email: string };
        expect(account.id, 'the account created at checkout must have a real user id, otherwise the ownership assertion below is meaningless').toBeGreaterThan(0);
        expect(
            order.customer_id,
            `order ${order.id} was left as a guest order (customer_id ${order.customer_id}) even though account ${account.id} was created for ${email} during the same checkout — the buyer's brand-new account shows no order history and they cannot track, re-order or request a refund from it`,
        ).toBe(account.id);

        log.success(`PP-GST-03: order ${order.id} was attached to the account (${account.id}) created during guest checkout.`);
    });

    // ---------------------------------------------------------------------
    // PP-GST-04 — guest order tracking is reachable.
    // ---------------------------------------------------------------------
    test('PP-GST-04: a guest can look their order up again through the order-tracking form', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(
            !hasCredentials,
            'the PayPal credentials are absent, so no guest order can be placed through the gateway and there is nothing to track. Tracking WooCommerce core with an unrelated order would prove nothing about this module.',
        );

        const email = `pp-gst-04-${Date.now()}@example.test`;
        const outcome = await placeGuestOrder(browser, productId, email);
        if (outcome.order) {
            createdOrderIds.push(outcome.order.id);
        }
        expect(
            outcome.order,
            `no guest order carrying ${email} exists, so there is nothing for the tracking form to find and a "tracking works" result would be vacuous. Checkout answered: ${outcome.response.slice(0, 400)}`,
        ).not.toBeNull();
        const order = outcome.order as OrderRecord;

        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            await page.goto(TRACKING.url, { waitUntil: 'domcontentloaded' });
            await assertSessionIsAnonymous('PP-GST-04', { Cookie: await cookieHeader(ctx) });

            await expect(
                page.locator(TRACKING.orderId),
                'the [woocommerce_order_tracking] form did not render, so this case cannot tell a working lookup from a missing page',
            ).toBeVisible({ timeout: 30_000 });

            // NEGATIVE CONTROL FIRST. Without it, "the form showed something" is indistinguishable
            // from "the form shows the order to anyone who types its id": the tracking lookup's
            // only credential is the billing email (WC_Shortcode_Order_Tracking::output(),
            // class-wc-shortcode-order-tracking.php:54).
            await page.fill(TRACKING.orderId, String(order.id));
            await page.fill(TRACKING.email, `wrong-${email}`);
            await page.locator(TRACKING.submit).click();
            await expect(
                page.locator(TRACKING.error).first(),
                `the tracking form disclosed guest order ${order.id} to a visitor who supplied the wrong billing email — anybody able to guess an order id could read another shopper's order`,
            ).toBeVisible({ timeout: 30_000 });
            await expect(page.locator(TRACKING.status), 'no order status may be rendered for a failed tracking lookup').toHaveCount(0);

            // The real lookup.
            await page.fill(TRACKING.orderId, String(order.id));
            await page.fill(TRACKING.email, email);
            await page.locator(TRACKING.submit).click();

            await expect(
                page.locator(TRACKING.info),
                `the guest who placed order ${order.id} cannot look it up with the id and billing email they were given — a guest has no account page, so this form is their only route back to the order`,
            ).toBeVisible({ timeout: 30_000 });
            // `toContainText`, not `toHaveText`: `WC_Order::get_order_number()` is filterable and a
            // sequential-number plugin would prefix it, which is not this module's concern.
            await expect(page.locator(TRACKING.number), 'the tracking result must name the order that was looked up, not some other order').toContainText(String(order.id));
            await expect(page.locator(TRACKING.status), 'the tracking result must state the order status — an empty status tells the buyer nothing').not.toBeEmpty();
        } finally {
            await page.close();
            await ctx.close();
        }

        // The order KEY the case names is the credential for the other guest-facing surface —
        // order-received / order-pay — so it is verified too rather than assumed equivalent.
        expect(order.order_key, `guest order ${order.id} carries no order key, so its order-received and order-pay URLs cannot be built and the buyer has no link back to it`).toMatch(/^wc_order_/);

        log.success(`PP-GST-04: guest order ${order.id} is reachable through the tracking form, and refused on a wrong billing email.`);
    });

    // ---------------------------------------------------------------------
    // PP-GST-05 — what the cart create-payment route gives an anonymous caller.
    // ---------------------------------------------------------------------
    /*
     * PP-GST-05 — the security properties that are actually true, asserted so they stay true.
     *
     * What this case does NOT claim: that anonymous reachability is a defect. It is the shipped,
     * deliberate design of guest checkout. `woocommerce_enable_guest_checkout` is `yes` on this
     * site, PP-GST-01 (P0) asserts that a logged-out visitor IS offered this gateway, and
     * `check_cart_permission()` (REST/V1/PayPalController.php:81-96) calls `wc_load_cart()` with an
     * explicit comment that WooCommerce loads neither session nor cart on REST requests and both are
     * needed to build the order. A case asserting "the route must answer 401/403" would declare a
     * P0 feature to be a bug AND could never go green — a legitimate anonymous guest would still get
     * a 200 after any nonce or throttle the module might add. A test that can only ever be red
     * proves exactly as little as one that can only ever be green.
     *
     * What it DOES assert, because these are the properties whose loss would be a real incident:
     *   a. the payment an anonymous caller obtains is bound to customer 0 — a guest — and not to any
     *      logged-in user's account;
     *   b. it is bound to that caller's OWN session cart: the order total matches the total
     *      `wc/store/v1/cart` reports for the very same anonymous session, so the route cannot be
     *      reaching into another session's cart;
     *   c. it leaks no other customer's order: the WooCommerce order id it returns is newer than
     *      every order that existed before the call (so it was created BY this call rather than
     *      handed over from someone else), the PayPal order id it returns is the one stored on that
     *      new order, and any approval token in the redirect URL is that same PayPal order id.
     *
     * The three controls above the subject stay, and they are not decoration: without them a
     * refusal, or an empty-cart answer, would be a transport bug reported as a security property.
     *
     * The branch structure is exhaustive and every branch pins product output, so the case keeps a
     * meaning in the world where the module later adds a nonce or a throttle: in that world an
     * anonymous curl caller is refused, the refusal branch demands a recognisable authorization
     * code, and the case still passes — while a route that silently started attaching guest payments
     * to somebody's account, or building them from another basket, still goes red.
     *
     * The residual hardening finding — no nonce and no rate limit, so anonymous draft-order and live
     * PayPal-order creation is unbounded — is filed as
     * `bugs/paypal-cart-create-payment-authorises-on-cart-alone.md`. It is a resource-abuse report,
     * not an expected failure, and this case does not guard it: an abuse limit cannot be measured by
     * a single well-behaved request.
     */
    test('PP-GST-05: the cart create-payment route serves an anonymous caller only its own guest cart — customer 0, own cart total, no other customer\'s order', { tag: ['@pro', '@guest'] }, async () => {
        // NOT gated on credentials: `check_cart_permission()` runs BEFORE `create_cart_payment()`,
        // so the permission behaviour this case measures is observable whether or not the gateway
        // can talk to PayPal afterwards.
        //
        // It IS gated on the gateway being switched on, which is a different precondition:
        // `set_controllers()` returns before constructing `PayPalController` when
        // `Helper::is_enabled()` is false (module.php:98-101, 116), so `register_routes()` is never
        // reached (module.php:66-72) and the route does not exist to be probed. `is_enabled()` is
        // `'yes' === settings['enabled']` (Helper.php:88-92), and `ensurePayPalConfigured()` cannot
        // switch it on without credentials — it returns `{ skipped: 'no_credentials' }`
        // (helpers.ts:379). Without this gate a keyless run fails a P0 case on 404 rest_no_route.
        const paypalStatus = await getPayPalStatus();
        test.skip(
            !paypalStatus.is_enabled,
            'the PayPal Marketplace gateway is switched off, so module.php never constructs PayPalController and dokan/v1/paypal-marketplace/create-payment is not registered at all (404 rest_no_route). The permission callback this case measures does not exist to be measured, and ensurePayPalConfigured() cannot switch the gateway on without credentials.',
        );

        // Watermark taken BEFORE the anonymous call, so "the order it handed back already existed"
        // is distinguishable from "the order it handed back is the one it just created".
        const orderIdBefore = await latestOrderId();

        const guest = await request.newContext({ extraHTTPHeaders: { ...ANON } });
        let createdOrderId: number | null = null;
        try {
            // A REAL anonymous session with a REAL cart. The context keeps its own cookie jar, so
            // the WooCommerce session cookie minted by add-to-cart travels with every later call.
            await guest.get(siteUrl(`/?p=${productId}&add-to-cart=${productId}`));

            // CONTROL 1 — the caller has no identity. Blanking `Authorization` removes HTTP Basic
            // auth only; this is the check that also covers cookies.
            const me = await guest.get(`${SERVER_URL}/wp/v2/users/me`);
            const meBody = (await me.json().catch(() => ({}))) as Record<string, unknown>;
            expect(
                typeof meBody.code === 'string' ? meBody.code : '',
                `the "anonymous" caller is signed in (wp/v2/users/me answered ${me.status()} ${brief(meBody, 160)}), so any conclusion about unauthenticated access below would be false`,
            ).toBe('rest_not_logged_in');

            // CONTROL 2 — the server really can see this anonymous session's cart. Without it, a
            // `dokan_paypal_empty_cart` answer would be indistinguishable from the test failing to
            // carry the session cookie, and "the route refused an anonymous caller" would be a
            // transport bug reported as a security property.
            const cartRes = await guest.get(`${SERVER_URL}/wc/store/v1/cart`);
            const cart = (await cartRes.json().catch(() => ({}))) as { items_count?: number; totals?: { total_price?: string; currency_minor_unit?: number } };
            expect(
                Number(cart.items_count ?? 0),
                `the anonymous session's cart is empty as far as the server is concerned (Store API answered ${cartRes.status()}), so the permission outcome below would say nothing about identity — only that there was nothing to pay for`,
            ).toBeGreaterThan(0);

            const res = await guest.post(`${SERVER_URL}/dokan/v1/paypal-marketplace/create-payment`, { data: {} });
            const text = await res.text();
            let body: Record<string, unknown> = {};
            try {
                body = JSON.parse(text) as Record<string, unknown>;
            } catch {
                body = {};
            }
            const code = typeof body.code === 'string' ? body.code : '';
            const status = res.status();

            expect(
                code,
                'the cart create-payment route is not registered on this site (rest_no_route), so this case is probing a module that was never loaded rather than a permission callback',
            ).not.toBe('rest_no_route');
            expect(
                code,
                `the route answered dokan_paypal_empty_cart even though the Store API reports ${cart.items_count} item(s) in the very same session — the two disagree about the same cart, so the permission callback is not seeing the cart it is supposed to authorise on`,
            ).not.toBe('dokan_paypal_empty_cart');

            // A refusal, in the sense of "the caller was turned away on who it is". Today's product
            // does not take this path for a guest — guest checkout is a supported feature and
            // `check_cart_permission()` (REST/V1/PayPalController.php:81-96) deliberately loads the
            // cart for exactly that reason — but a later nonce or throttle would make an anonymous
            // curl caller land here, and the case has to keep its meaning in that world too.
            const refused = status === 401 || status === 403 || code === 'dokan_paypal_cannot_pay_order';

            createdOrderId = typeof body.order_id === 'number' ? body.order_id : null;
            if (createdOrderId) {
                createdOrderIds.push(createdOrderId);
            }

            /*
             * Runs on the refusal path and on the handler-threw path — every path EXCEPT the one
             * where the route itself reports having created the payment. A refusal (or an error)
             * that nonetheless hands the anonymous caller a PayPal order id or an approval URL is
             * strictly worse than either outcome on its own, and it is exactly what a half-finished
             * hardening change would produce, so it is asserted there.
             *
             * It is deliberately NOT asserted on the created-payment path. `PayPal::process_payment()`
             * returns `paypal_redirect_url` and `paypal_order_id` as literal keys of its success
             * array (PaymentMethods/PayPal.php:343-351), which `create_cart_payment()` passes
             * straight through, so on that path this regex would match the KEY NAMES on every single
             * run and could never do anything but fail a working system. That path is covered
             * instead by the ownership assertions below, which check that the PayPal material
             * returned belongs to the order this very call created and to nothing else.
             */
            if (refused || !createdOrderId) {
                expect(
                    text,
                    `the cart create-payment route answered a caller proven to be logged out (HTTP ${status}, code "${code}") WITHOUT reporting a created payment, yet put a PayPal order id or approval URL in the body — an anonymous request that the route did not even claim to have served was still handed live PayPal approval material for the platform's own merchant account`,
                ).not.toMatch(/paypal_order_id|paypal_redirect_url|paypal\.com\/checkoutnow/i);
            }

            /*
             * Exhaustive, and every branch pins PRODUCT output — there is no path through this
             * block that asserts nothing. The three shapes are the only ones the route can produce:
             * a refusal, a created payment, or the `WP_Error( 'paypal_payment', … )` envelope from
             * the catch in `create_cart_payment()` (REST/V1/PayPalController.php:132-134), which is
             * the only body that can lack an `order_id` without being a refusal — `order_id` is set
             * on every non-throwing path (line 132).
             */
            if (refused) {
                // The refusal has to be a real authorization refusal rather than an incidental
                // error that merely looks like one — otherwise a PHP fatal answered as 403 would be
                // read as "the module gained an identity gate", and this branch would be excusing
                // the case from every ownership assertion below on the strength of a crash.
                expect(
                    code,
                    `the route refused the anonymous caller with HTTP ${status} but no recognisable authorization code (${brief(body, 200)}) — an incidental failure is being read as a permission check (check_cart_permission(), REST/V1/PayPalController.php:81-96), so this case would report a hardened route where it actually observed a broken one`,
                ).not.toBe('');
            } else if (createdOrderId) {
                const order = await getOrder(createdOrderId);
                expect(order, `the route reported creating order ${createdOrderId} but it cannot be read back over wc/v3/orders, so what the anonymous caller was handed cannot be verified`).not.toBeNull();
                const created = order as OrderRecord;

                // (a) BOUND TO A GUEST. Guest checkout is supposed to produce a guest order; an
                // order attached to a real user id means the route built the payment against
                // somebody's account.
                expect(
                    created.customer_id,
                    `an anonymous caller obtained a payment for order ${created.id}, which is attached to WordPress user ${created.customer_id} instead of being a guest order (customer 0) — the cart route built a payment against a logged-in customer's account for a caller proven logged out, which is cross-customer access, not the guest checkout that check_cart_permission() (REST/V1/PayPalController.php:81-96) exists to support`,
                ).toBe(0);

                // (b) BOUND TO THIS CALLER'S OWN CART. The Store API total for the very same
                // anonymous session is the only cart the route may build a payment from.
                const minorUnit = Number(cart.totals?.currency_minor_unit ?? 2);
                const cartTotal = Number(cart.totals?.total_price ?? '0') / Math.pow(10, minorUnit);
                expect(
                    Number(created.total),
                    `the payment the anonymous caller obtained is for ${created.total}, not for the ${cartTotal.toFixed(2)} that wc/store/v1/cart reports for that caller's own session — get_draft_order() → OrderController::create_order_from_cart() (REST/V1/PayPalController.php:118-132) built the payment from a basket the caller never filled, so one shopper can be charged for another shopper's cart`,
                ).toBeCloseTo(cartTotal, 2);

                // (c) NO OTHER CUSTOMER'S ORDER LEAKED. Three separate ways the route could hand
                // back something the caller did not create, all pinned:
                //
                //   - the WooCommerce order id must be NEWER than every order that existed before
                //     the call, so it was created by this call rather than fetched;
                expect(
                    createdOrderId,
                    `the route handed the anonymous caller order ${createdOrderId}, which already existed before the call (the newest order at that moment was ${orderIdBefore}) — get_draft_order() returned somebody else's order instead of creating one for this cart, so an anonymous request is being given a payment for an order it did not place`,
                ).toBeGreaterThan(orderIdBefore);

                //   - the PayPal order id must be the one recorded on that brand-new order;
                const paypalOrderId = typeof body.paypal_order_id === 'string' ? body.paypal_order_id : '';
                if (paypalOrderId) {
                    expect(
                        (await getOrderMetaValue(created.id, '_dokan_paypal_order_id')) ?? '',
                        `the PayPal order id returned to the anonymous caller (${paypalOrderId}) is not the one stored on order ${created.id} as _dokan_paypal_order_id, which PayPal::process_payment() writes for the order it just paid for (PaymentMethods/PayPal.php:328-330) — the caller was handed live approval material belonging to a different order, i.e. another shopper's PayPal order`,
                    ).toBe(paypalOrderId);
                }

                //   - and any approval token in the redirect URL must be that same PayPal order id,
                //     so the link cannot send this caller to another buyer's approval page. Checked
                //     only when the URL actually carries a `token` parameter, so a change in
                //     PayPal's approval-link shape cannot turn a working system red.
                const redirect = typeof body.paypal_redirect_url === 'string' ? body.paypal_redirect_url : '';
                const token = /[?&]token=([^&]+)/i.exec(redirect)?.[1] ?? '';
                if (token && paypalOrderId) {
                    expect(
                        token,
                        `the approval URL returned to the anonymous caller points at PayPal order ${token} while the response says the payment is PayPal order ${paypalOrderId} — following that link would send this caller to somebody else's PayPal approval page. Redirect: ${redirect.slice(0, 200)}`,
                    ).toBe(paypalOrderId);
                }

                log.success(
                    `PP-GST-05: the cart route served a proven-anonymous caller HTTP ${status} and bound it to guest order ${created.id} (customer 0, total ${created.total} = own cart total), created by this call and carrying no other customer's PayPal material.`,
                );
            } else {
                // Neither refused nor paid: the handler ran and threw. Pinned to the product's own
                // envelope so that "nothing came back" can never pass silently — a route that
                // answered an empty body, a 200 with no payload, or somebody else's error code
                // would fail here instead of being read as an inapplicable branch.
                expect(
                    code,
                    `the route neither refused the anonymous caller nor produced a payment, and what came back is not the gateway-error envelope create_cart_payment() emits from its catch (WP_Error 'paypal_payment', REST/V1/PayPalController.php:133) — HTTP ${status}, body ${brief(body, 200)}. The permission callback was passed by a caller with no identity and then something unrecognised happened, so this case cannot say what the anonymous request actually did.`,
                ).toBe('paypal_payment');
            }
        } finally {
            await guest.dispose();
        }
    });
});
