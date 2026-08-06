import { test, expect, request, Page, Response } from '@utils/test';
import { SERVER_URL, BASE_URL } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { log } from '@utils/logger';
import { PayPalMarketplacePage, PAYPAL_IDS } from './paypalMarketplacePage';
import {
    VENDOR_ID,
    VENDOR2_ID,
    CUSTOMER_ID,
    adminAuth,
    vendorAuth,
    vendor2Auth,
    customerAuth,
    PAYPAL_GATEWAY_ID,
    PAYPAL_KEYS,
    PAYPAL_MERCHANTS,
    PAYPAL_EVENTS,
    hasCredentials,
    HAS_REAL_MERCHANTS,
    getPayPalOrder,
    getBothMerchantConsents,
    isPayableMerchant,
    ensurePayPalConfigured,
    ensureClassicCheckoutPage,
    ensureCustomerAddress,
    getPayPalStatus,
    seedPayPalConnectedVendor,
    postUnsignedWebhook,
    getOrderStatus,
    getOrderNotes,
    getOrderMetaValue,
    Probe,
    probe,
    deleteOrder,
    isVendorConnected,
} from './helpers';

// The suite tsconfig is strict and does not pull @types/node.
declare const process: { env: Record<string, string | undefined> };

/**
 * PayPal Marketplace — security · PP-SEC 01..14.
 *
 * The highest-value money-free area in the build. Everything here is a NEGATIVE, which makes
 * every assertion one bad precondition away from passing for the wrong reason, so each test
 * carries a positive control that proves the surface under test is alive:
 *
 *   - PP-SEC-01/03 prove the REST permission callback DISCRIMINATES: the same route answers
 *     `dokan_paypal_cannot_pay_order` (401) for a foreign caller and `paypal_capture_payment`
 *     (404, "No PayPal order id found") for the order's real owner. A dead or unregistered
 *     route answers `rest_no_route`, which is asserted against explicitly.
 *   - PP-SEC-02 proves the nopriv AJAX registration is real by contrasting it with
 *     `dokan_paypal_create_order`, which is registered `wp_ajax_` ONLY and therefore answers
 *     admin-ajax's bare `0` to the identical logged-out request.
 *   - PP-SEC-06 proves the `payment` field really exists (admin sees an object) before
 *     asserting vendor2 sees the `******` redaction.
 *   - PP-SEC-11/12/14 gate on `hasCredentials`, because with no stored secret "the secret does
 *     not leak" is vacuously true, and because `WebhookHandler.php:53` returns 200 and exits
 *     before reading the body whenever `Helper::is_ready()` is false — a webhook negative on an
 *     unconfigured site is consistent with a completely dead gateway.
 *
 * EVERY probe sets `Authorization: ''` explicitly. `request.newContext()` inherits the shared
 * config's admin Basic auth when the header is omitted (api.config.ts:67), and that exact
 * inheritance has already produced a false pass in this repo once. `probe()` below defaults the
 * header to blank and callers opt IN to an identity.
 *
 * Surfaces under test, all grounded in dokan-pro 5.0.9 source:
 *
 *   REST (REST/V1/PayPalController.php)
 *     POST dokan/v1/paypal-marketplace/create-payment/(?P<order_id>\d+)   check_order_permission
 *     POST dokan/v1/paypal-marketplace/create-payment                     check_cart_permission
 *     POST dokan/v1/paypal-marketplace/capture-payment/(?P<order_id>\d+)  check_order_permission
 *
 *   admin-ajax (Order/OrderController.php:31-33)
 *     dokan_paypal_create_order      wp_ajax_          only  → nonce dokan_paypal_checkout_nonce
 *     dokan_paypal_capture_payment   wp_ajax_ + nopriv       → nonce dokan_paypal_checkout_nonce
 *
 *   admin-ajax (WithdrawMethods/RegisterWithdrawMethods.php:31)
 *     dokan_paypal_marketplace_connect  wp_ajax_ only → nonce dokan-paypal-marketplace-connect
 *
 *   template_redirect (RegisterWithdrawMethods.php:348)
 *     ?action=dokan-paypal-marketplace-disconnect&_wpnonce=… → nonce + current-user scoped
 *
 *   webhook  ?wc-api=dokan-paypal  (WebhookHandler.php:51)
 *
 * Never tagged @serial: `playwright.config.ts:13` grepInverts it in BOTH lanes, which would
 * silently delete this file from CI. Ordering comes from `test.describe.serial`.
 */

const PRODUCT_PRICE = 31;

/**
 * Deliberately different from PRODUCT_PRICE.
 *
 * PP-SEC-04/05 buy one product from EACH vendor so that `Order\Manager::maybe_split_orders()`
 * actually splits — it returns early without creating a single child order when the cart holds
 * one vendor (dokan-lite/includes/Order/Manager.php:928-942), which is what made both tests'
 * sub-order assertions unreachable. Two distinct prices mean a purchase unit that was collapsed
 * onto the wrong vendor shows up as a wrong total rather than as an identical one.
 */
const VENDOR2_PRODUCT_PRICE = 17;

/** Blank by default so nothing inherits an identity it was not given. */
type Headers = Record<string, string>;
const ANON: Headers = { Authorization: '' };
const ADMIN: Headers = payloads.adminAuth as Headers;
const CUSTOMER: Headers = payloads.customerAuth as Headers;
const VENDOR: Headers = payloads.vendorAuth as Headers;
const VENDOR2: Headers = payloads.vendor2Auth as Headers;

const DB_PREFIX = process.env.DB_PREFIX ?? 'wp';

/**
 * Absolute site URL.
 *
 * `browser.newContext()` does NOT inherit `use.baseURL` — only the `context`/`page` fixtures do —
 * so a relative `page.goto('/cart/')` inside a manually-created context fails outright. Every
 * navigation in this file therefore goes through here, which is also why the page object's
 * relative-URL helpers are not used on manual contexts.
 */
const siteUrl = (path: string): string => `${BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

/** Module REST routes, built once so a namespace typo cannot make a negative pass. */
const ROUTE = {
    createPaymentForOrder: (orderId: string | number): string => `${SERVER_URL}/dokan/v1/paypal-marketplace/create-payment/${orderId}`,
    createCartPayment: `${SERVER_URL}/dokan/v1/paypal-marketplace/create-payment`,
    capturePayment: (orderId: string | number): string => `${SERVER_URL}/dokan/v1/paypal-marketplace/capture-payment/${orderId}`,
} as const;

/** admin-ajax lives at the SITE ROOT, not under the REST base (SERVER_URL ends in /wp-json). */
const ADMIN_AJAX_URL = `${BASE_URL.replace(/\/$/, '')}/wp-admin/admin-ajax.php`;

const AJAX_ACTION = {
    createOrder: 'dokan_paypal_create_order',
    capturePayment: 'dokan_paypal_capture_payment',
    connect: 'dokan_paypal_marketplace_connect',
} as const;

/** WP_Error code carried by a REST error envelope, or '' when the response is not one. */
const errorCode = (p: Probe): string => (typeof p.json?.code === 'string' ? p.json.code : '');

/** `data.type` inside a wp_send_json_error envelope (the module's own AJAX error shape). */
const ajaxErrorType = (p: Probe): string => {
    const data = (p.json?.data ?? {}) as Record<string, unknown>;
    return typeof data.type === 'string' ? data.type : '';
};

/** Raw usermeta read. Deliberately NOT dbUtils.getUserMeta(): that unserializes, and a merchant id is a plain string. */
async function readUserMetaRaw(userId: string | number, metaKey: string): Promise<string | null> {
    const rows = await dbUtils.dbQuery(`SELECT meta_value FROM ${DB_PREFIX}_usermeta WHERE user_id = ? AND meta_key = ? LIMIT 1;`, [
        Number(userId),
        metaKey,
    ]);
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return String(rows[0].meta_value);
}

async function countRefundRows(orderId: string | number): Promise<number> {
    const rows = await dbUtils.dbQuery(`SELECT COUNT(*) AS total FROM ${DB_PREFIX}_dokan_refund WHERE order_id = ?;`, [Number(orderId)]);
    if (!Array.isArray(rows) || rows.length === 0) return 0;
    return Number(rows[0].total);
}

/**
 * The purchase units PayPal itself holds for a created order.
 *
 * PP-SEC-04 and PP-SEC-05 are both about what the module ASKED PayPal for — the amount and the
 * payee inside `purchase_units` (Order/OrderManager.php:167-205). Neither is persisted anywhere on
 * the site: `PaymentMethods/PayPal.php:329-334` writes only the debug id, the PayPal order id, the
 * redirect URL and the two fee-recipient metas. So PayPal's own copy of the order is the ONLY
 * record of the values under test, and any assertion made against WooCommerce state instead is
 * asserting about a write nobody performs.
 */
interface PayPalPurchaseUnit {
    amount?: { currency_code?: string; value?: string };
    payee?: { merchant_id?: string; email_address?: string };
}

function purchaseUnitsOf(ppOrder: Record<string, unknown>): PayPalPurchaseUnit[] {
    return Array.isArray(ppOrder.purchase_units) ? (ppOrder.purchase_units as PayPalPurchaseUnit[]) : [];
}

/**
 * The `_dokan_paypal_order_id` a successful create-payment leaves on the parent order
 * (PaymentMethods/PayPal.php:331 — written only after `Processor::create_order()` returned an id).
 * '' means the PayPal order was never created, so nothing can be read back from PayPal.
 */
async function readPayPalOrderId(orderId: string): Promise<string> {
    return String((await getOrderMetaValue(orderId, '_dokan_paypal_order_id')) ?? '');
}

/**
 * Why the PayPal-side cases are gated twice.
 *
 * `hasCredentials` / `HAS_REAL_MERCHANTS` only prove the env vars are present and correctly
 * shaped. Whether PayPal will accept the two suite vendors as a PAYEE is separate state held on
 * PayPal's side, and `Processor::create_order()` fails outright when it will not — which would
 * leave the create-payment probe with no PayPal order to read back. PP-PRE-04 verifies the same
 * consent; this returns the reason it is missing so the run report names it.
 */
async function unpayableMerchantsReason(): Promise<string | null> {
    const consents = await getBothMerchantConsents();
    const unpayable = Object.entries(consents).filter(([, consent]) => !isPayableMerchant(consent));
    return unpayable.length === 0
        ? null
        : `PayPal will not accept ${unpayable
              .map(([label, consent]) => `${label} (${consent.merchantId}): ${consent.reason ?? 'connected but not payments-receivable'}`)
              .join('; ')} as a payee, so Processor::create_order() cannot mint the PayPal order this case has to read its purchase units back from. PP-PRE-04 reports this.`;
}

/** Named once so both tampering cases declare the SAME gap in the same words when a key is absent. */
const CREATE_ORDER_KEYS_SKIP =
    'this case proves its point by reading the created PayPal order back from PayPal (GET /v2/checkout/orders/<id>), which needs a real create-order call: ' +
    'TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE (the partner app) and ' +
    'PAYPAL_MARKETPLACE_VENDOR1_MERCHANT_ID / PAYPAL_MARKETPLACE_VENDOR2_MERCHANT_ID (the two payees) must all be set in tests/pw/.env. ' +
    'Without them Processor::create_order() never runs, no _dokan_paypal_order_id is written, and the only evidence left would be WooCommerce ' +
    'state that the create-payment path never writes — which is exactly how a client-supplied amount or payee could reach purchase_units unnoticed.';

/** A standalone WC order to act as the victim / the caller's own order. Pass an ARRAY for a multi-vendor cart. */
async function createOrder(opts: { customerId: number; productId: string | string[]; status?: string }): Promise<{ id: string; total: number }> {
    const productIds = Array.isArray(opts.productId) ? opts.productId : [opts.productId];
    const res = await probe(`${SERVER_URL}/wc/v3/orders`, {
        method: 'post',
        headers: ADMIN,
        data: {
            payment_method: PAYPAL_GATEWAY_ID,
            payment_method_title: 'PayPal Marketplace',
            set_paid: false,
            status: opts.status ?? 'pending',
            customer_id: opts.customerId,
            billing: payloads.createOrder.billing,
            line_items: productIds.map(id => ({ product_id: Number(id), quantity: 1 })),
        },
    });
    const body = (res.json ?? {}) as { id?: number; total?: string };
    if (!body.id) {
        throw new Error(`createOrder failed (${res.status}): ${res.text.slice(0, 200)}`);
    }
    return { id: String(body.id), total: Number(body.total ?? '0') };
}

async function getOrderTotal(orderId: string | number): Promise<number> {
    const res = await probe(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=total`, { headers: ADMIN });
    const body = (res.json ?? {}) as { total?: string };
    return Number(body.total ?? '0');
}

/** Sub-orders of a parent, with the Dokan vendor id each one was assigned to. */
async function getSubOrders(parentId: string | number): Promise<Array<{ id: number; total: string; vendorId: string }>> {
    const res = await probe(`${SERVER_URL}/wc/v3/orders?parent=${parentId}&per_page=20&_fields=id,total,meta_data`, { headers: ADMIN });
    const rows = Array.isArray(res.json) ? (res.json as unknown as Array<{ id: number; total: string; meta_data?: Array<{ key: string; value: unknown }> }>) : [];
    return rows.map(r => ({
        id: r.id,
        total: String(r.total),
        vendorId: String(r.meta_data?.find(m => m.key === '_dokan_vendor_id')?.value ?? ''),
    }));
}

/**
 * Read the `dokan_paypal_checkout_nonce` localised on the checkout page as
 * `window.dokan_paypal.nonce` (Cart/CartHandler.php:121). It only exists when the gateway is
 * enabled AND the button type is `smart`, so callers must treat '' as "not available here".
 */
async function readCheckoutNonce(page: Page): Promise<string> {
    return page.evaluate(async () => {
        const read = (): string => {
            const w = window as unknown as { dokan_paypal?: { nonce?: string } };
            return w.dokan_paypal?.nonce ?? '';
        };
        const deadline = Date.now() + 12000;
        let value = read();
        while (!value && Date.now() < deadline) {
            await new Promise(resolve => setTimeout(resolve, 250));
            value = read();
        }
        return value;
    });
}

/** Everything a page rendered: the DOM plus every document/script/xhr payload it fetched. */
async function collectRenderedText(page: Page, url: string): Promise<string> {
    const chunks: string[] = [];
    const pending: Array<Promise<void>> = [];
    const wanted = ['document', 'script', 'xhr', 'fetch', 'stylesheet'];

    const onResponse = (res: Response): void => {
        if (!wanted.includes(res.request().resourceType())) return;
        pending.push(
            res
                .text()
                .then(body => {
                    chunks.push(body);
                })
                .catch(() => undefined),
        );
    };

    page.on('response', onResponse);
    await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
    await page.waitForTimeout(2000);
    page.off('response', onResponse);
    await Promise.all(pending);
    chunks.push(await page.content());

    return chunks.join('\n');
}

// NOT `test.describe.serial`, deliberately. Playwright already runs every test in a single file
// sequentially in one worker, so `.serial` bought no ordering here — its only extra behaviour is
// ABORTING the rest of the group on the first failure. On 2026-07-31 that cost 46 of 68 cases:
// one early failure in each of the three PayPal files silently erased every case declared after it,
// and the run still summarised as mostly green. A skipped case reports as "not a failure", which is
// exactly the fake-green shape this suite exists to prevent — the cascade hides far more than it
// protects. Ordering is preserved; only the cascade is gone.
test.describe('PayPal Marketplace — security · REST / AJAX / IDOR / secret exposure', () => {
    test.describe.configure({ timeout: 180_000 });

    let productId = '';
    let vendor2ProductId = '';
    let customerOrder = { id: '', total: 0 };
    let victimOrder = { id: '', total: 0 };
    let vendor1MerchantId = '';
    let merchantIdKey = '';
    let marketplaceSettingsKey = '';
    let vendorShopUrl = '';
    const createdOrderIds: string[] = [];

    test.beforeAll(async () => {
        // No test.skip() here: it would void the whole describe silently. Every gated case
        // carries its own per-test skip naming exactly what is missing.
        await ensurePayPalConfigured();
        await ensureClassicCheckoutPage();
        await ensureCustomerAddress();

        // SIX mode-swapped metas per vendor. Seeding fewer produces a vendor that READS as
        // connected while the gateway never appears at checkout.
        const seed1 = await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: 'dokangit@vendor1.com' });
        await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' });
        vendor1MerchantId = seed1.merchant_id;
        merchantIdKey = seed1.keys.merchant_id ?? '';
        marketplaceSettingsKey = seed1.keys.marketplace_settings ?? '';

        const api = new ApiUtils(await request.newContext());
        try {
            const [, id] = await api.createProduct({ ...payloads.createProduct(), name: 'PP Security Product', regular_price: String(PRODUCT_PRICE) }, payloads.vendorAuth);
            productId = id;

            // Owned by VENDOR2 so a cart holding both products is genuinely multi-vendor and the
            // order splitter produces real sub orders — the objects the PayPal purchase units,
            // and therefore the amount and the payee, are built from.
            const [, id2] = await api.createProduct(
                { ...payloads.createProduct(), name: 'PP Security Product (vendor2)', regular_price: String(VENDOR2_PRODUCT_PRICE) },
                payloads.vendor2Auth,
            );
            vendor2ProductId = id2;
        } finally {
            await api.dispose();
        }

        customerOrder = await createOrder({ customerId: Number(CUSTOMER_ID), productId });
        victimOrder = await createOrder({ customerId: Number(VENDOR_ID), productId });
        createdOrderIds.push(customerOrder.id, victimOrder.id);

        const store = await probe(`${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}`, { headers: ADMIN });
        vendorShopUrl = typeof store.json?.shop_url === 'string' ? store.json.shop_url : '';
    });

    test.afterAll(async () => {
        for (const id of createdOrderIds) {
            await deleteOrder(id);
        }
        for (const id of [productId, vendor2ProductId]) {
            if (!id) continue;
            await probe(`${SERVER_URL}/wc/v3/products/${id}?force=true`, { method: 'delete', headers: ADMIN }).catch(() => undefined);
        }
        // Both vendors are deliberately left seeded: connected is the suite's normal state and
        // the sibling specs seed idempotently on top of it.
    });

    // ---------------------------------------------------------------------
    // PP-SEC-01 — module REST routes reject unauthenticated callers.
    // ---------------------------------------------------------------------
    test('PP-SEC-01: the module REST routes reject an unauthenticated caller (Authorization blanked explicitly)', { tag: ['@pro', '@guest'] }, async () => {
        // Order-scoped routes. `check_order_permission()` (PayPalController.php:195) resolves the
        // order, then `is_order_payable_by_current_customer()` requires the session draft order,
        // the session's order_awaiting_payment, or ownership by the logged-in customer. A
        // header-less context has none of the three.
        const anonCapture = await probe(ROUTE.capturePayment(customerOrder.id), { method: 'post' });
        const anonCreate = await probe(ROUTE.createPaymentForOrder(customerOrder.id), { method: 'post' });

        // The single most important assertion in this test: a route that does not exist answers
        // `rest_no_route`, and every "rejected" assertion below would then pass against a module
        // that was never even loaded.
        for (const [label, res] of [
            ['capture-payment', anonCapture],
            ['create-payment/<order_id>', anonCreate],
        ] as const) {
            expect(
                errorCode(res),
                `the ${label} route answered rest_no_route — it is not registered on this site, so every "unauthenticated callers are rejected" assertion in this file would be passing against a module that is not loaded rather than against a working permission gate`,
            ).not.toBe('rest_no_route');
        }

        expect(
            anonCapture.status,
            `an unauthenticated POST to capture-payment/${customerOrder.id} must be refused with an authorization status — it was answered ${anonCapture.status}, which means an anonymous caller can reach PayPal capture for somebody else's order`,
        ).toBe(401);
        expect(errorCode(anonCapture), 'the refusal must come from check_order_permission (dokan_paypal_cannot_pay_order), not from an unrelated failure that happens to look like a rejection').toBe(
            'dokan_paypal_cannot_pay_order',
        );

        expect(
            anonCreate.status,
            `an unauthenticated POST to create-payment/${customerOrder.id} must be refused with an authorization status — it was answered ${anonCreate.status}, which means an anonymous caller can mint a PayPal order against another shopper's WooCommerce order`,
        ).toBe(401);
        expect(errorCode(anonCreate), 'the refusal must come from check_order_permission (dokan_paypal_cannot_pay_order)').toBe('dokan_paypal_cannot_pay_order');

        // The cart route carries no order id, so the customer's own cart IS the authorization
        // (documented at PayPalController.php:71-79). An anonymous caller with no cart must
        // therefore be stopped by the empty-cart guard and must never receive a PayPal order.
        const anonCart = await probe(ROUTE.createCartPayment, { method: 'post' });
        expect(errorCode(anonCart), 'the cart create-payment route must be registered, otherwise this negative proves nothing').not.toBe('rest_no_route');
        expect(
            anonCart.status,
            `an unauthenticated, cart-less POST to the cart create-payment route was answered ${anonCart.status} — it must be refused, or a visitor with no cart can drive PayPal order creation`,
        ).toBe(400);
        expect(errorCode(anonCart), 'the refusal must come from check_cart_permission (dokan_paypal_empty_cart)').toBe('dokan_paypal_empty_cart');
        expect(anonCart.text, 'no PayPal approval URL or PayPal order id may be handed to an unauthenticated caller').not.toMatch(/paypal_order_id|paypal_redirect_url|paypal\.com\/checkoutnow/i);

        // POSITIVE CONTROL — the same route, called by the order's real owner, must NOT answer
        // 401. It gets as far as the capture handler and fails on the missing PayPal order id.
        // Without this, all three assertions above are consistent with a permanently-broken route.
        const ownerCapture = await probe(ROUTE.capturePayment(customerOrder.id), { method: 'post', headers: CUSTOMER });
        expect(
            errorCode(ownerCapture),
            `the order's own customer was refused by the ownership check too (HTTP ${ownerCapture.status}) — the route is rejecting everyone, so the anonymous rejections above prove nothing about the permission gate`,
        ).not.toBe('dokan_paypal_cannot_pay_order');
        expect(errorCode(ownerCapture), 'the owner reaches the capture handler and fails on the absent _dokan_paypal_order_id, proving check_order_permission discriminates by caller').toBe(
            'paypal_capture_payment',
        );

        log.success('PP-SEC-01: create-payment / capture-payment / cart create-payment all refuse an anonymous caller, and the owner still reaches the handler (gate discriminates).');
    });

    // ---------------------------------------------------------------------
    // PP-SEC-02 — capture route is registered for logged-out callers.
    // ---------------------------------------------------------------------
    test('PP-SEC-02: the AJAX capture action is registered for logged-out callers behind a checkout-wide nonce only', { tag: ['@pro', '@customer'] }, async () => {
        const before = await getOrderStatus(victimOrder.id);

        // `wp_ajax_nopriv_dokan_paypal_capture_payment` (OrderController.php:33). Its ONLY guard
        // is `do_validation()`: wp_verify_nonce( $_POST['nonce'], 'dokan_paypal_checkout_nonce' )
        // plus a non-empty order_id. No login check, no capability, no order ownership.
        const anonCapture = await probe(ADMIN_AJAX_URL, {
            method: 'post',
            form: { action: AJAX_ACTION.capturePayment, order_id: victimOrder.id },
            maxRedirects: 0,
        });

        // A logged-out request to an action registered WITHOUT nopriv gets admin-ajax's bare `0`.
        // Getting the module's own JSON nonce envelope instead is the proof that the capture
        // action really is exposed to logged-out visitors.
        expect(
            ajaxErrorType(anonCapture),
            `a logged-out POST of ${AJAX_ACTION.capturePayment} answered "${anonCapture.text.slice(0, 80)}" instead of the module's nonce envelope — if this is admin-ajax's bare "0" the action is NOT nopriv-registered and the finding recorded below must be withdrawn`,
        ).toBe('nonce');

        // CONTRAST — the sibling action is `wp_ajax_` only (OrderController.php:31). Same request,
        // same headers: admin-ajax answers `0`. This is what proves the difference above is real
        // registration and not an artifact of how the probe is shaped.
        const anonCreate = await probe(ADMIN_AJAX_URL, {
            method: 'post',
            form: { action: AJAX_ACTION.createOrder, order_id: victimOrder.id },
            maxRedirects: 0,
        });
        expect(
            anonCreate.text.trim(),
            `dokan_paypal_create_order is registered wp_ajax_ ONLY, so a logged-out call must fall through to admin-ajax's "0" — it answered "${anonCreate.text.slice(0, 80)}" instead, which would mean the nopriv contrast this test relies on is not measuring what it claims`,
        ).toBe('0');

        // The invariant that must hold regardless: nothing was captured or paid.
        expect(await getOrderStatus(victimOrder.id), 'a nonce-less logged-out capture attempt must leave the victim order exactly where it was').toBe(before);
        expect(await getOrderMetaValue(victimOrder.id, '_paypal_payment_success'), 'a nonce-less logged-out capture attempt must never mark an order as successfully paid').toBeFalsy();

        log.warn(
            'PP-SEC-02 — capture AJAX is nopriv-registered (reportable finding)',
            `wp_ajax_nopriv_${AJAX_ACTION.capturePayment} (OrderController.php:33) is reachable by any visitor. Its only guard is do_validation() (OrderController.php:455-478): wp_verify_nonce against 'dokan_paypal_checkout_nonce' — a nonce minted for EVERY checkout visitor at Cart/CartHandler.php:121 — plus a non-empty $_POST['order_id'] that is never checked for ownership. The REST twin of this operation gained check_order_permission() in 5.0.8; the AJAX twin did not. File to bugs/.`,
        );
    });

    // ---------------------------------------------------------------------
    // PP-SEC-03 — capture route rejects an order id belonging to another shopper.
    // ---------------------------------------------------------------------
    test('PP-SEC-03: capture rejects an order id belonging to another shopper (no IDOR on payment capture)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        const before = await getOrderStatus(victimOrder.id);

        // Layer A — the REST surface, always runs. `victimOrder` belongs to the vendor account,
        // the caller is the customer: a foreign order by construction.
        const foreignCapture = await probe(ROUTE.capturePayment(victimOrder.id), { method: 'post', headers: CUSTOMER });
        const foreignCreate = await probe(ROUTE.createPaymentForOrder(victimOrder.id), { method: 'post', headers: CUSTOMER });

        expect(errorCode(foreignCapture), 'the capture route must be registered, or this IDOR negative proves nothing').not.toBe('rest_no_route');
        // 403 rather than 401: rest_authorization_required_code() answers 403 once the caller IS
        // logged in, and this caller is an authenticated shopper.
        expect(
            foreignCapture.status,
            `shopper A captured against shopper B's order ${victimOrder.id} and got ${foreignCapture.status} — a success here is a direct IDOR on payment capture, letting any shopper trigger a PayPal capture on somebody else's order`,
        ).toBe(403);
        expect(errorCode(foreignCapture), 'the refusal must be the ownership check (dokan_paypal_cannot_pay_order), not an incidental failure').toBe('dokan_paypal_cannot_pay_order');

        expect(
            foreignCreate.status,
            `shopper A minted a PayPal payment against shopper B's order ${victimOrder.id} and got ${foreignCreate.status} — a success here leaks the foreign order's total and lets an attacker steer another shopper's payment`,
        ).toBe(403);
        expect(errorCode(foreignCreate), 'the refusal must be the ownership check (dokan_paypal_cannot_pay_order)').toBe('dokan_paypal_cannot_pay_order');

        // POSITIVE CONTROL — the same caller, against their OWN order, is not stopped by the
        // ownership check.
        const ownCapture = await probe(ROUTE.capturePayment(customerOrder.id), { method: 'post', headers: CUSTOMER });
        expect(
            errorCode(ownCapture),
            `the caller was refused on their OWN order too (HTTP ${ownCapture.status}) — the route rejects everybody, so the two IDOR rejections above are not evidence of an ownership check`,
        ).not.toBe('dokan_paypal_cannot_pay_order');

        // Layer B — the AJAX surface PP-SEC-02 proved is nopriv-registered. Needs a real
        // dokan_paypal_checkout_nonce, which is only localised when the gateway is enabled.
        if (!hasCredentials) {
            log.skip(
                'PP-SEC-03 Layer B (AJAX capture IDOR) not exercised',
                'the dokan_paypal_checkout_nonce is only localised when the gateway is enabled, and ensurePayPalConfigured() no-ops without TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE. Layer A (REST) ran for real.',
            );
            return;
        }

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            await page.goto(siteUrl(`/?p=${productId}&add-to-cart=${productId}`), { waitUntil: 'domcontentloaded' });
            await page.goto(siteUrl('/classic-checkout/'), { waitUntil: 'domcontentloaded' });
            const nonce = await readCheckoutNonce(page);

            if (!nonce) {
                log.skip(
                    'PP-SEC-03 Layer B (AJAX capture IDOR) not exercised',
                    'window.dokan_paypal.nonce was not localised on /classic-checkout/ — CartHandler only enqueues it when the gateway is enabled and button_type is "smart". Layer A (REST) ran for real.',
                );
                return;
            }

            const cookies = await ctx.cookies(BASE_URL);
            const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

            const idor = await probe(ADMIN_AJAX_URL, {
                method: 'post',
                headers: { Authorization: '', Cookie: cookieHeader },
                form: { action: AJAX_ACTION.capturePayment, order_id: victimOrder.id, nonce },
                maxRedirects: 0,
            });

            // The invariant that MUST hold whatever the gate does: a foreign order is never paid.
            expect(await getOrderStatus(victimOrder.id), "a foreign shopper's capture attempt must never move the victim order's status").toBe(before);
            expect(await getOrderMetaValue(victimOrder.id, '_paypal_payment_success'), "a foreign shopper's capture attempt must never mark the victim order as paid").toBeFalsy();

            if (ajaxErrorType(idor) === 'nonce') {
                log.success('PP-SEC-03 Layer B: the checkout nonce did not authorise a capture against a foreign order.');
            } else {
                log.warn(
                    'PP-SEC-03 Layer B — checkout nonce authorised a foreign order id (reportable finding)',
                    `shopper ${CUSTOMER_ID} passed do_validation() with an ordinary checkout nonce and reached the capture handler for order ${victimOrder.id}, which belongs to another account (handler response type "${ajaxErrorType(idor)}"). It stopped only because that order carries no _dokan_paypal_order_id, not because of any ownership check — OrderController.php:225-268 never compares the order's customer with the caller. File to bugs/.`,
                );
            }
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // ---------------------------------------------------------------------
    // PP-SEC-04 — create-payment rejects a tampered amount.
    // ---------------------------------------------------------------------
    test('PP-SEC-04: create-payment ignores a client-supplied amount and asks PayPal for the server-computed total', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials || !HAS_REAL_MERCHANTS, CREATE_ORDER_KEYS_SKIP);
        const unpayable = await unpayableMerchantsReason();
        test.skip(unpayable !== null, unpayable ?? '');

        // One product from EACH vendor. A single-vendor cart never reaches `create_sub_order()`
        // (Order/Manager.php:928-942 returns after stamping `_dokan_vendor_id` on the parent), so
        // the sub-order backstop below would be skipped on every run and the only surviving
        // assertion would be the parent total.
        const order = await createOrder({ customerId: Number(CUSTOMER_ID), productId: [productId, vendor2ProductId] });
        createdOrderIds.push(order.id);

        const totalBefore = await getOrderTotal(order.id);
        expect(totalBefore, 'the fixture order must carry a non-trivial total, otherwise "the total did not shrink" is meaningless').toBeGreaterThan(1);

        // Every field name PayPal's own create-order payload uses, so a handler that read ANY of
        // them would be caught: PayPalController::create_payment() takes only the URL order id
        // and hands it to PayPal::process_payment(), which derives the amount from the order
        // (PaymentMethods/PayPal.php:201, Order/OrderManager.php:147-171).
        const tampered = await probe(ROUTE.createPaymentForOrder(order.id), {
            method: 'post',
            headers: CUSTOMER,
            data: {
                amount: '0.01',
                total: '0.01',
                order_total: '0.01',
                currency: 'USD',
                purchase_units: [{ amount: { currency_code: 'USD', value: '0.01' } }],
            },
        });

        // Without this the whole test is vacuous: a request refused at the door cannot prove the
        // handler ignored the tampered body.
        expect(
            errorCode(tampered),
            `the tampered create-payment was refused by check_order_permission (HTTP ${tampered.status}) before the handler ran — the amount assertions below would then be passing because nothing was processed, not because the client amount was ignored`,
        ).not.toBe('dokan_paypal_cannot_pay_order');
        expect(errorCode(tampered), 'the route must exist for this tampering probe to mean anything').not.toBe('rest_no_route');

        const totalAfter = await getOrderTotal(order.id);
        expect(
            totalAfter,
            `the order total moved from ${totalBefore} to ${totalAfter} after a create-payment carrying amount=0.01 — a client-supplied amount is writing through to the order, so a shopper can pay one cent for any cart`,
        ).toBe(totalBefore);

        // The sub orders are what the PayPal purchase units are built from, so their totals are
        // the amount PayPal is actually asked for (`make_purchase_unit_data()` reads
        // `$order->get_total()` of each one — Order/OrderManager.php:171).
        const subOrders = await getSubOrders(order.id);
        createdOrderIds.push(...subOrders.map(s => String(s.id)));

        // POSITIVE CONTROL — a two-vendor cart MUST split. No sub orders means process_payment()
        // never reached the purchase-unit build, and the totals assertion below would be skipped
        // rather than satisfied, leaving this test asserting nothing about the amount PayPal is
        // asked to charge.
        expect(
            subOrders.length,
            `the two-vendor order ${order.id} produced ${subOrders.length} sub order(s) instead of 2 — PayPal::process_payment() never reached the purchase-unit build (response "${tampered.text.slice(0, 200)}"), so nothing below measures the amount PayPal would be asked for`,
        ).toBe(2);

        const subTotal = subOrders.reduce((sum, s) => sum + Number(s.total), 0);
        expect(
            Number(subTotal.toFixed(2)),
            `the sub orders the PayPal purchase units are built from total ${subTotal} against a parent order of ${totalBefore} — the amount PayPal is asked to charge no longer matches what the shopper owes`,
        ).toBe(Number(totalBefore.toFixed(2)));

        expect(tampered.text, 'the response must not echo the forged 0.01 amount back as an accepted value').not.toMatch(/"(value|amount|total)"\s*:\s*"?0\.01/);

        // THE ASSERTION THE CASE IS ACTUALLY ABOUT — the amount PayPal was asked to charge.
        // Everything above measures WooCommerce state, and create-payment writes no total onto the
        // order at all, so a handler that forwarded a client-supplied value straight into
        // `purchase_units[*].amount.value` (Order/OrderManager.php:171 currently builds it from
        // `$order->get_total()`) would leave every assertion above satisfied.
        const paypalOrderId = await readPayPalOrderId(order.id);
        expect(
            paypalOrderId,
            `order ${order.id} carries no _dokan_paypal_order_id after create-payment (response "${tampered.text.slice(0, 300)}") — that meta is written at PaymentMethods/PayPal.php:331 only once Processor::create_order() has succeeded, so without it nothing below measures the amount PayPal was asked for`,
        ).not.toBe('');

        const units = purchaseUnitsOf(await getPayPalOrder(paypalOrderId));
        const unitValues = units.map(u => String(u.amount?.value ?? ''));
        expect(
            units.length,
            `PayPal holds ${units.length} purchase unit(s) for order ${order.id} (amounts [${unitValues.join(', ')}]) instead of one per vendor — a collapsed unit can carry any amount without the per-vendor totals disagreeing, so the amount assertions below would no longer be able to see a forged value`,
        ).toBe(2);

        for (const value of unitValues) {
            expect(
                value,
                `PayPal was asked to charge ${value} for one of order ${order.id}'s purchase units after a create-payment body carrying amount=0.01 — a client-supplied amount reached purchase_units (Order/OrderManager.php:171), so a shopper can pay one cent for any cart while WooCommerce still shows the full total`,
            ).not.toBe('0.01');
        }

        const paypalTotal = unitValues.reduce((sum, value) => sum + Number(value), 0);
        expect(
            Number(paypalTotal.toFixed(2)),
            `PayPal was asked for ${paypalTotal} across [${unitValues.join(', ')}] against a cart the shopper owes ${totalBefore} for — the amount charged is no longer the server-computed order total (Order/OrderManager.php:171)`,
        ).toBe(Number(totalBefore.toFixed(2)));

        log.success(
            `PP-SEC-04: create-payment ran with a forged amount=0.01 body; PayPal order ${paypalOrderId} holds ${units.length} purchase units totalling ${paypalTotal}, which equals the server-computed parent total ${totalBefore}, and the WooCommerce order and its sub orders are unchanged.`,
        );
    });

    // ---------------------------------------------------------------------
    // PP-SEC-05 — create-payment rejects a tampered payee merchant id.
    // ---------------------------------------------------------------------
    test('PP-SEC-05: create-payment ignores a client-supplied payee and names each sub order\'s own vendor to PayPal', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials || !HAS_REAL_MERCHANTS, CREATE_ORDER_KEYS_SKIP);
        const unpayable = await unpayableMerchantsReason();
        test.skip(unpayable !== null, unpayable ?? '');

        // The payee assertion below compares the SET of merchant ids PayPal was given against
        // {vendor1, vendor2}. If both env vars carry the same merchant id, that set comparison
        // still succeeds when the module collapses both purchase units onto one vendor — the
        // exact defect this case exists to catch — so the two ids must be distinct for the
        // evidence to mean anything.
        expect(
            PAYPAL_MERCHANTS.vendor1,
            `PAYPAL_MARKETPLACE_VENDOR1_MERCHANT_ID and PAYPAL_MARKETPLACE_VENDOR2_MERCHANT_ID in tests/pw/.env both carry "${PAYPAL_MERCHANTS.vendor1}" — with one merchant id shared by both suite vendors, a build that routed BOTH purchase units to a single vendor would still satisfy the payee-set assertion at the end of this case, so the payee resolution would no longer be under test at all`,
        ).not.toBe(PAYPAL_MERCHANTS.vendor2);

        // One product from EACH vendor, so the order really splits and there are two DIFFERENT
        // payees to get wrong. A single-vendor cart returns early from `maybe_split_orders()`
        // (Order/Manager.php:928-942) and produces no sub order at all, which is what made the
        // payee assertion below unreachable.
        const order = await createOrder({ customerId: Number(CUSTOMER_ID), productId: [productId, vendor2ProductId] });
        createdOrderIds.push(order.id);

        const attackerMerchant = 'ATTACKERPAYEE99';

        // `OrderManager::make_purchase_unit_data()` resolves the payee as
        // Helper::get_seller_merchant_id( dokan_get_seller_id_by_order( $sub_order ) )
        // (Order/OrderManager.php:153-155, 203-205) — the vendor of the sub order, never a
        // request field. Every plausible request field name is supplied here.
        const tampered = await probe(ROUTE.createPaymentForOrder(order.id), {
            method: 'post',
            headers: CUSTOMER,
            data: {
                payee: { merchant_id: attackerMerchant, email_address: 'attacker@example.test' },
                merchant_id: attackerMerchant,
                payee_merchant_id: attackerMerchant,
                seller_id: Number(VENDOR2_ID),
                vendor_id: Number(VENDOR2_ID),
                purchase_units: [{ payee: { merchant_id: attackerMerchant } }],
            },
        });

        expect(
            errorCode(tampered),
            `the tampered create-payment was refused by check_order_permission (HTTP ${tampered.status}) before the handler ran — the payee assertions below would then prove nothing about how the payee is resolved`,
        ).not.toBe('dokan_paypal_cannot_pay_order');
        expect(errorCode(tampered), 'the route must exist for this tampering probe to mean anything').not.toBe('rest_no_route');

        expect(
            tampered.text,
            `the forged payee merchant id "${attackerMerchant}" came back in the create-payment response — a client-supplied payee would let a caller redirect a marketplace payment to an account of their choosing`,
        ).not.toContain(attackerMerchant);

        // The server-side observable that decides the payee: which vendor owns each sub order.
        // `make_purchase_unit_data()` sets payee.merchant_id to
        // `Helper::get_seller_merchant_id( dokan_get_seller_id_by_order( $sub_order ) )`
        // (Order/OrderManager.php:153-155, 203-205), so this mapping IS the payee resolution.
        const subOrders = await getSubOrders(order.id);
        createdOrderIds.push(...subOrders.map(s => String(s.id)));

        // POSITIVE CONTROL — without two sub orders there is no payee resolution to observe and
        // every assertion below would be skipped rather than satisfied.
        expect(
            subOrders.length,
            `the two-vendor order ${order.id} produced ${subOrders.length} sub order(s) instead of 2 — PayPal::process_payment() never reached the purchase-unit build (response "${tampered.text.slice(0, 200)}"), so nothing below measures how the payee is resolved`,
        ).toBe(2);

        // One purchase unit per REAL vendor. A forged seller_id/vendor_id that steered the split
        // would collapse both units onto a single payee, which this catches.
        expect(
            subOrders.map(s => s.vendorId).sort(),
            `the sub orders are assigned to vendors [${subOrders.map(s => s.vendorId).join(', ')}] instead of the two vendors who own the purchased products — the payee merchant id is read from these vendors, so a caller who can steer them redirects the marketplace payment`,
        ).toEqual([String(VENDOR_ID), String(VENDOR2_ID)].sort());

        // And the merchant id each of those vendors resolves to is their own, never the forged one.
        for (const sub of subOrders) {
            const payeeMerchant = await readUserMetaRaw(sub.vendorId, merchantIdKey);
            expect(
                payeeMerchant,
                `sub order ${sub.id} resolves to vendor ${sub.vendorId}, which carries no "${merchantIdKey}" meta — its purchase unit would be built with an empty payee, so "the forged payee did not land" would be true of a unit that has no payee at all`,
            ).toBeTruthy();
            expect(payeeMerchant, `sub order ${sub.id} would be paid to the forged merchant "${attackerMerchant}"`).not.toBe(attackerMerchant);
            if (sub.vendorId === String(VENDOR_ID)) {
                expect(payeeMerchant, `vendor1's sub order ${sub.id} would be paid to "${payeeMerchant}" instead of vendor1's own merchant id "${vendor1MerchantId}"`).toBe(vendor1MerchantId);
            }
        }

        // THE ASSERTION THE CASE IS ACTUALLY ABOUT — who PayPal was told to pay. Everything above
        // reads the vendor metas this file seeded and the sub-order split dokan-lite performed at
        // order creation; none of it can see `purchase_units[*].payee`, which is built at
        // Order/OrderManager.php:154 and persisted nowhere on the site. A build that hardcoded an
        // attacker merchant id into every purchase unit would satisfy every assertion above.
        const paypalOrderId = await readPayPalOrderId(order.id);
        expect(
            paypalOrderId,
            `order ${order.id} carries no _dokan_paypal_order_id after create-payment (response "${tampered.text.slice(0, 300)}") — that meta is written at PaymentMethods/PayPal.php:331 only once Processor::create_order() has succeeded, so without it nothing below measures who PayPal was told to pay`,
        ).not.toBe('');

        const units = purchaseUnitsOf(await getPayPalOrder(paypalOrderId));
        const payees = units.map(u => String(u.payee?.merchant_id ?? ''));
        expect(
            units.length,
            `PayPal holds ${units.length} purchase unit(s) for order ${order.id} (payees [${payees.join(', ')}]) instead of one per vendor — two vendors collapsed onto a single payee means one vendor is being paid for the other's item, and a wrong single payee could no longer be told from a right one`,
        ).toBe(2);

        for (const merchant of payees) {
            expect(
                merchant,
                `PayPal was told to pay the forged merchant "${attackerMerchant}" for one of order ${order.id}'s purchase units — a client-supplied payee reached Order/OrderManager.php:154, so any caller can redirect a marketplace payment to an account of their choosing`,
            ).not.toBe(attackerMerchant);
        }

        expect(
            [...payees].sort(),
            `PayPal was told to pay [${payees.join(', ')}] for order ${order.id} instead of the two vendors who own the purchased products (${PAYPAL_MERCHANTS.vendor1}, ${PAYPAL_MERCHANTS.vendor2}) — the payee is resolved from the sub order's own vendor at Order/OrderManager.php:154, so a different set here means the marketplace payment is being routed to an account the products do not belong to`,
        ).toEqual([PAYPAL_MERCHANTS.vendor1, PAYPAL_MERCHANTS.vendor2].sort());

        log.success(
            `PP-SEC-05: the forged payee "${attackerMerchant}" was not reflected anywhere, the two-vendor order split into one sub order per vendor (${VENDOR_ID}, ${VENDOR2_ID}), and PayPal order ${paypalOrderId} names each vendor's own merchant id as the payee of its own purchase unit.`,
        );
    });

    // ---------------------------------------------------------------------
    // PP-SEC-06 — vendor cannot read another vendor's merchant id via REST.
    // ---------------------------------------------------------------------
    test("PP-SEC-06: vendor2 cannot read vendor1's PayPal merchant id through any reachable REST route", { tag: ['@pro', '@vendor'] }, async () => {
        // POSITIVE CONTROL FIRST — prove the field really exists and really carries PayPal data
        // for someone. Without this, "vendor2 cannot see it" is true of a field nobody can see.
        const asAdmin = await probe(`${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}`, { headers: ADMIN });
        expect(asAdmin.status, `the admin read of store ${VENDOR_ID} failed (${asAdmin.status}) — the redaction assertions below would be measuring a broken route`).toBe(200);
        const adminPayment = asAdmin.json?.payment;
        expect(typeof adminPayment, 'an administrator must receive the payment profile as an object, otherwise there is nothing for the redaction to hide from vendor2').toBe('object');
        expect(
            (adminPayment as Record<string, unknown>)[PAYPAL_IDS.withdrawMethod],
            `the admin payment profile carries no "${PAYPAL_IDS.withdrawMethod}" key, so vendor1 does not read as PayPal-connected and this test would be asserting redaction of data that was never present`,
        ).toBe(true);

        const routes = [
            `${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}`,
            `${SERVER_URL}/dokan/v1/stores?per_page=100`,
            // `vendor_id` is a registered, optional param on the vendor settings route
            // (StoreSettingController.php:44-53) whose permission callback never compares it with
            // the caller — so this is the sharpest cross-vendor read the module surface allows.
            `${SERVER_URL}/dokan/v1/settings?vendor_id=${VENDOR_ID}`,
            `${SERVER_URL}/dokan/v2/settings?vendor_id=${VENDOR_ID}`,
        ];

        for (const url of routes) {
            const res = await probe(url, { headers: VENDOR2 });
            expect(
                res.text,
                `vendor2 read vendor1's PayPal merchant id "${vendor1MerchantId}" from ${url} — a merchant id identifies the payee account for every one of that vendor's marketplace payments and must never cross vendor boundaries`,
            ).not.toContain(vendor1MerchantId);
            expect(res.text, `vendor2 received a PayPal client secret from ${url}`).not.toContain(PAYPAL_KEYS.clientSecret || 'never-matches');
        }

        // And the redaction Lite applies. TWO layers stack, and either outcome is a pass:
        // `filter_payment_response()` masks the block to '******' on `dokan_vendor_to_array`
        // (REST/Manager.php:167-179), and `get_restricted_fields_for_view()` then UNSETS `payment`
        // outright for an unauthorized viewer (StoreController.php:788-810, since 4.2.5) — so on
        // current Lite vendor2's response carries no `payment` key at all. Absence is the STRONGER
        // result and must not read as a failure; an object reaching vendor2 is the failure.
        const asVendor2 = await probe(`${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}`, { headers: VENDOR2 });
        expect(
            asVendor2.status,
            `vendor2's read of store ${VENDOR_ID} answered ${asVendor2.status} — "no payment block came back" would then be an artifact of an error envelope rather than of the redaction`,
        ).toBe(200);
        expect(
            String(asVendor2.json?.id ?? ''),
            `vendor2's read did not return store ${VENDOR_ID} (got id "${String(asVendor2.json?.id ?? '')}") — the redaction assertion below would be measuring the wrong payload`,
        ).toBe(String(VENDOR_ID));
        const vendor2Payment = asVendor2.json?.payment;
        expect(
            vendor2Payment === undefined || vendor2Payment === '******',
            // `JSON.stringify(undefined)` returns the VALUE undefined, not a string, so calling
            // .slice() on it threw — and Playwright builds this message eagerly, before evaluating
            // the condition. That made the PASSING case (payment block absent) crash with
            // "Cannot read properties of undefined (reading 'slice')" and report as a failure on
            // 2026-07-31. The `?? null` keeps the output honest ("null") without swallowing anything;
            // the condition itself is unchanged.
            `vendor2 received vendor1's payment profile unredacted (${JSON.stringify(vendor2Payment ?? null).slice(0, 120)}) — the payment block holds each vendor's payout identities and must be masked or removed for anyone but the owner and an administrator`,
        ).toBe(true);

        log.success(
            `PP-SEC-06: the merchant id is exposed by no reachable route, and vendor1's payment block is ${vendor2Payment === undefined ? 'absent from' : 'masked in'} vendor2's store read while an admin sees it in full.`,
        );
    });

    // ---------------------------------------------------------------------
    // PP-SEC-07 — vendor cannot write another vendor's merchant id.
    // ---------------------------------------------------------------------
    test("PP-SEC-07: vendor2 cannot overwrite vendor1's PayPal merchant meta", { tag: ['@pro', '@vendor'] }, async () => {
        const before = await readUserMetaRaw(VENDOR_ID, merchantIdKey);
        expect(
            before,
            `vendor1 carries no "${merchantIdKey}" meta, so there is nothing an attacker could overwrite and this test would pass without exercising anything — the beforeAll seed did not take`,
        ).toBeTruthy();

        const forged = 'HIJACKEDMERCHANT1';

        // The vendor settings route takes `vendor_id` straight from the request for the write
        // path too (StoreSettingController.php:81-96 → StoreController::update_store).
        const writeAttempts = [
            { label: 'PUT dokan/v1/settings?vendor_id=<vendor1>', url: `${SERVER_URL}/dokan/v1/settings?vendor_id=${VENDOR_ID}` },
            { label: 'PUT dokan/v1/stores/<vendor1>', url: `${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}` },
        ];

        for (const attempt of writeAttempts) {
            const res = await probe(attempt.url, {
                method: 'put',
                headers: VENDOR2,
                data: {
                    payment: {
                        dokan_paypal_marketplace: { email: 'attacker@example.test', merchant_id: forged },
                    },
                },
            });
            expect(
                res.status >= 400,
                `${attempt.label} as vendor2 was accepted with ${res.status} — one vendor writing another vendor's store payment profile lets an attacker redirect a competitor's payouts`,
            ).toBe(true);
        }

        // The AJAX connect handler is the module's own writer of PayPal vendor state. It is
        // wp_ajax_ only and always writes for dokan_get_current_user_id(), never for a posted id.
        const connectAsVendor2 = await probe(ADMIN_AJAX_URL, {
            method: 'post',
            headers: VENDOR2,
            form: { action: AJAX_ACTION.connect, vendor_paypal_email_address: 'attacker@example.test', vendor_id: VENDOR_ID, seller_id: VENDOR_ID, nonce: 'forged-nonce' },
            maxRedirects: 0,
        });
        expect(
            connectAsVendor2.text,
            `the connect action accepted a forged nonce from vendor2 while carrying vendor_id=${VENDOR_ID} — response "${connectAsVendor2.text.slice(0, 120)}"`,
        ).not.toContain('"success":true');

        const after = await readUserMetaRaw(VENDOR_ID, merchantIdKey);
        expect(
            after,
            `vendor1's merchant id changed from "${before}" to "${after}" after vendor2's write attempts — a cross-vendor write of the merchant id redirects every future PayPal payout for that vendor`,
        ).toBe(before);
        expect(after, 'the forged merchant id must not have landed on vendor1').not.toBe(forged);
        expect(await isVendorConnected(VENDOR_ID), 'vendor1 must still read as PayPal-connected after vendor2 attempted to rewrite their payment profile').toBe(true);

        log.success(`PP-SEC-07: every cross-vendor write was refused and vendor1's merchant id is unchanged ("${before}").`);
    });

    // ---------------------------------------------------------------------
    // PP-SEC-08 — customer cannot reach vendor payment settings.
    // ---------------------------------------------------------------------
    test('PP-SEC-08: a customer cannot read or write vendor payment settings', { tag: ['@pro', '@customer'] }, async () => {
        const before = await readUserMetaRaw(VENDOR_ID, merchantIdKey);
        expect(
            before,
            `vendor1 carries no "${merchantIdKey}" meta — the beforeAll seed did not take, so both "a customer read the merchant id" and "the customer changed nothing" would pass against a value that never existed`,
        ).toBeTruthy();

        // WRITE — must be refused on capability (VendorAuthorizable::can_access_vendor_store).
        const write = await probe(`${SERVER_URL}/dokan/v1/settings?vendor_id=${VENDOR_ID}`, {
            method: 'put',
            headers: CUSTOMER,
            data: { payment: { dokan_paypal_marketplace: { email: 'customer@example.test', merchant_id: 'CUSTOMERWRITE1' } } },
        });
        expect(
            write.status >= 400,
            `a customer PUT to the vendor settings route for vendor ${VENDOR_ID} was accepted with ${write.status} — a shopper able to write a vendor's payment profile can redirect that vendor's payouts`,
        ).toBe(true);

        // READ — whatever the status, no PayPal payout identity may reach a shopper.
        const reads = [
            `${SERVER_URL}/dokan/v1/settings`,
            `${SERVER_URL}/dokan/v1/settings?vendor_id=${VENDOR_ID}`,
            `${SERVER_URL}/dokan/v2/settings?vendor_id=${VENDOR_ID}`,
            `${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}`,
        ];
        for (const url of reads) {
            const res = await probe(url, { headers: CUSTOMER });
            expect(res.text, `a customer read vendor1's PayPal merchant id from ${url} — that identifies the vendor's payee account and is not shopper-facing data`).not.toContain(vendor1MerchantId);
            expect(res.text, `a customer received a PayPal client secret from ${url}`).not.toContain(PAYPAL_KEYS.clientSecret || 'never-matches');
            if (res.status === 200 && res.json && 'payment' in res.json) {
                expect(res.json.payment, `${url} returned an unredacted payment profile to a customer — Lite masks this block for everyone but the owner and an administrator`).toBe('******');
            }
        }

        expect(await readUserMetaRaw(VENDOR_ID, merchantIdKey), "a customer's write attempts must leave vendor1's merchant id untouched").toBe(before);

        // Recorded, not asserted: the settings ROUTE itself answers a customer rather than
        // refusing on role. It hands back only the same store profile the public
        // dokan/v1/stores/<id> route already exposes, with `payment` masked, so it is a surface
        // note rather than a privilege escalation.
        const reachability = await probe(`${SERVER_URL}/dokan/v1/settings?vendor_id=${VENDOR_ID}`, { headers: CUSTOMER });
        log.info(
            'PP-SEC-08: vendor-settings route reachability for a customer',
            `GET dokan/v1/settings?vendor_id=${VENDOR_ID} as a customer answered ${reachability.status}. StoreSettingController::get_settings_permission_callback() only requires the CALLER to resolve to a vendor object (StoreSettingController.php:117-129) and never compares the requested vendor_id with the caller; the sensitive fields are saved by Lite's payment redaction rather than by the route's own capability check.`,
        );
    });

    // ---------------------------------------------------------------------
    // PP-SEC-09 — connect action enforces its nonce.
    // ---------------------------------------------------------------------
    test('PP-SEC-09: the PayPal connect action refuses a request without a valid nonce', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const settingsBefore = await readUserMetaRaw(VENDOR_ID, marketplaceSettingsKey);

        // Logged out: `dokan_paypal_marketplace_connect` is registered wp_ajax_ ONLY
        // (RegisterWithdrawMethods.php:31), so admin-ajax answers its bare `0`.
        const anon = await probe(ADMIN_AJAX_URL, {
            method: 'post',
            form: { action: AJAX_ACTION.connect, vendor_paypal_email_address: 'attacker@example.test', nonce: 'forged-nonce' },
            maxRedirects: 0,
        });
        expect(
            anon.text,
            `a logged-out connect POST produced "${anon.text.slice(0, 120)}" — it must not start a PayPal partner referral, or an anonymous caller can bind a PayPal account to a vendor`,
        ).not.toContain('"success":true');
        expect(anon.text, 'no PayPal onboarding action_url may be handed to an anonymous caller').not.toMatch(/paypal\.com\/(bizsignup|merchantsignup|webapps)/i);

        // Authenticated vendor, forged nonce: handle_paypal_marketplace_connect() answers
        // wp_send_json_error "Are you cheating?" before touching the Processor
        // (RegisterWithdrawMethods.php:146-161).
        const ctx = await browser.newContext({ storageState: vendorAuth });
        try {
            const cookies = await ctx.cookies(BASE_URL);
            const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

            const forged = await probe(ADMIN_AJAX_URL, {
                method: 'post',
                headers: { Authorization: '', Cookie: cookieHeader },
                form: { action: AJAX_ACTION.connect, vendor_paypal_email_address: 'attacker@example.test', nonce: 'forged-nonce' },
                maxRedirects: 0,
            });

            // Proves the action ran (a wrong action name would return `0`) AND that it stopped at
            // the nonce gate — without this the rejection could be "action not found".
            expect(
                forged.text,
                `an authenticated vendor with a forged nonce got "${forged.text.slice(0, 160)}" — the connect action must answer its own nonce-verification error, and a bare "0" would mean this probe never reached the handler at all`,
            ).not.toBe('0');
            expect(forged.json?.success, 'a connect request carrying a forged nonce must be refused, or any cross-site page can start a PayPal referral on a logged-in vendor\'s behalf').toBe(false);
            expect(forged.text, 'the refusal must come from the nonce check (RegisterWithdrawMethods.php:146), naming nonce verification').toMatch(/cheating|Nonce Verification Failed/i);
        } finally {
            await ctx.close();
        }

        expect(
            await readUserMetaRaw(VENDOR_ID, marketplaceSettingsKey),
            'a nonce-less connect attempt must not write the vendor\'s marketplace settings — that meta records connect_process_started/tracking_id and is what a later PayPal callback is matched against',
        ).toBe(settingsBefore);

        log.success('PP-SEC-09: the connect action refuses both a logged-out caller and a forged nonce, and wrote no vendor marketplace settings.');
    });

    // ---------------------------------------------------------------------
    // PP-SEC-10 — disconnect action enforces its nonce and capability.
    // ---------------------------------------------------------------------
    test('PP-SEC-10: disconnect refuses a nonce-less call and cannot disconnect a different vendor', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        expect(await isVendorConnected(VENDOR_ID), 'vendor1 must start this test connected, or "still connected afterwards" proves nothing').toBe(true);

        const settingsPath = PayPalMarketplacePage.VENDOR_SETTINGS_URL;

        // Unauthenticated, no nonce — `deauthorize_vendor()` returns before deleting anything
        // (RegisterWithdrawMethods.php:353).
        //
        // NO `maxRedirects: 0` here. The dashboard page is guarded by Lite's
        // `Core::redirect_if_not_logged_seller()` on `template_redirect` priority 11
        // (Core.php:26, 165-177), which answers a logged-out visitor with a 302 to my-account —
        // and Playwright REJECTS on a 3xx when maxRedirects is 0 ("Max redirect count exceeded",
        // playwright-core/lib/server/fetch.js:282-286), which `probe()` does not catch, so the
        // whole test used to die on this line before either half below ran. The redirect is not
        // what is being asserted; the request only has to reach `deauthorize_vendor()`, which is
        // hooked at the DEFAULT priority 10 and therefore runs first.
        await probe(siteUrl(`${settingsPath}?action=dokan-paypal-marketplace-disconnect`));
        expect(await isVendorConnected(VENDOR_ID), 'a disconnect URL with no nonce must leave the vendor connected — otherwise any link a vendor clicks can sever their payouts').toBe(true);

        // Forged nonce, as the vendor themselves.
        const ctx = await browser.newContext({ storageState: vendorAuth });
        const page = await ctx.newPage();
        let vendor1DisconnectUrl = '';
        try {
            await page.goto(siteUrl(`${settingsPath}?action=dokan-paypal-marketplace-disconnect&_wpnonce=forgednonce`), { waitUntil: 'domcontentloaded' });
            expect(await isVendorConnected(VENDOR_ID), 'a disconnect URL carrying a forged nonce must leave the vendor connected').toBe(true);

            // Harvest vendor1's REAL, user-scoped disconnect link so the cross-user replay below
            // is a genuine attempt rather than a guess. The link is an <a> (templates/
            // vendor-settings-payment.php:6-8), NOT the <button> the page object's
            // `vendor.disconnect` selector describes — matched on the action in its href so a
            // class rename cannot silently select the wrong control.
            await page.goto(siteUrl(settingsPath), { waitUntil: 'domcontentloaded' });
            vendor1DisconnectUrl = await page
                .locator('a[href*="dokan-paypal-marketplace-disconnect"]')
                .first()
                .getAttribute('href', { timeout: 10_000 })
                .catch(() => null)
                .then(href => href ?? '');
        } finally {
            await page.close();
            await ctx.close();
        }

        // MANDATORY, not conditional. This used to sit in an `if (!vendor1DisconnectUrl) log.skip()`,
        // which meant a template change, a selector drift or a 10s timeout silently deleted the
        // cross-user replay AND the positive control below while the case still reported PASSED —
        // and every surviving assertion is "vendor1 is still connected", which a
        // `deauthorize_vendor()` (RegisterWithdrawMethods.php:353-375) that was unhooked, renamed or
        // deleted outright satisfies. If a live check ever shows the anchor genuinely no longer
        // renders on this build, this becomes a declared `test.skip(true, …)` naming the template,
        // never a log.skip.
        expect(
            vendor1DisconnectUrl,
            `no nonce-bearing Disconnect link rendered on ${settingsPath} for a vendor that isVendorConnected() reports as connected (templates/vendor-settings-payment.php:6-8 renders the anchor whenever Helper::is_seller_enable_for_receive_payment() is true) — without vendor1's own working disconnect URL this whole case is satisfied by a disconnect surface that does nothing at all`,
        ).toContain('dokan-paypal-marketplace-disconnect');

        // Replay vendor1's own disconnect URL as VENDOR2. A nonce is bound to the user that
        // minted it, and `deauthorize_vendor()` deletes metas for get_current_user_id() only
        // (RegisterWithdrawMethods.php:357-375) — so vendor1 must survive both ways.
        const ctx2 = await browser.newContext({ storageState: vendor2Auth });
        const page2 = await ctx2.newPage();
        try {
            await page2.goto(vendor1DisconnectUrl, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
        } finally {
            await page2.close();
            await ctx2.close();
        }

        expect(
            await isVendorConnected(VENDOR_ID),
            "vendor2 replayed vendor1's disconnect URL and vendor1 is no longer connected — one vendor being able to sever another's PayPal payouts is a cross-account denial of payment",
        ).toBe(true);

        // Vendor2 may legitimately have disconnected THEMSELVES here; restore the seed so the
        // rest of the file and the sibling specs see the normal connected state.
        if (!(await isVendorConnected(VENDOR2_ID))) {
            await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' });
            log.info('PP-SEC-10: vendor2 disconnected itself by replaying the URL under its own session; re-seeded.', 'vendor1 was unaffected, which is the property under test.');
        }

        // POSITIVE CONTROL, deliberately LAST so it cannot disturb the negatives above: drive
        // vendor1's OWN nonce-bearing disconnect URL under vendor1's OWN session. Every
        // assertion in this test is "vendor1 is still connected", and a `deauthorize_vendor()`
        // that was unhooked, renamed or deleted outright satisfies all of them — the opening
        // check only proves the connected/disconnected ORACLE works, not that the action under
        // test exists. Restored immediately afterwards, the same dance vendor2 gets above.
        const ownerCtx = await browser.newContext({ storageState: vendorAuth });
        const ownerPage = await ownerCtx.newPage();
        try {
            await ownerPage.goto(vendor1DisconnectUrl, { waitUntil: 'domcontentloaded' });
        } finally {
            await ownerPage.close();
            await ownerCtx.close();
        }
        expect(
            await isVendorConnected(VENDOR_ID),
            'vendor1 drove their own nonce-bearing disconnect URL under their own session and still reads as connected — deauthorize_vendor() is not deleting the PayPal metas at all, so every "vendor1 is still connected" assertion in this test is satisfied by a disconnect surface that does nothing',
        ).toBe(false);

        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: 'dokangit@vendor1.com' });
        expect(await isVendorConnected(VENDOR_ID), 'vendor1 must be back to connected after the disconnect positive control — the rest of this file and the sibling specs expect the seeded state').toBe(true);

        log.success('PP-SEC-10: disconnect is nonce-gated and scoped to the current user — vendor1 survived a nonce-less call, a forged nonce and vendor2 replaying vendor1\'s own URL, and disconnected only when vendor1 drove that URL themselves.');
    });

    // ---------------------------------------------------------------------
    // PP-SEC-11 — client secret never reaches the frontend.
    // ---------------------------------------------------------------------
    test('PP-SEC-11: the PayPal client secret never reaches any rendered frontend page', { tag: ['@pro', '@customer', '@vendor'] }, async ({ browser }) => {
        test.skip(
            !hasCredentials,
            'No PayPal client secret is stored on this site (TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE is unset, so ensurePayPalConfigured() no-ops) — "the secret does not appear in the page" would be vacuously true and would pass on a site that leaks every secret it holds.',
        );

        const secret = PAYPAL_KEYS.clientSecret;
        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            'the gateway is not ready, so the checkout scripts that would carry a leaked secret are never enqueued — this negative would pass because nothing rendered, not because nothing leaked',
        ).toBe(true);

        // Customer-facing pages, with a cart so checkout renders instead of redirecting.
        const customerCtx = await browser.newContext({ storageState: customerAuth });
        const customerPage = await customerCtx.newPage();
        const scanned: Array<{ label: string; body: string }> = [];
        try {
            await customerPage.goto(siteUrl(`/?p=${productId}&add-to-cart=${productId}`), { waitUntil: 'domcontentloaded' });
            scanned.push({ label: 'cart', body: await collectRenderedText(customerPage, siteUrl('/cart/')) });
            scanned.push({ label: 'classic checkout', body: await collectRenderedText(customerPage, siteUrl('/classic-checkout/')) });
            scanned.push({ label: 'block checkout', body: await collectRenderedText(customerPage, siteUrl('/checkout/')) });
            if (vendorShopUrl) {
                scanned.push({ label: 'vendor store page', body: await collectRenderedText(customerPage, vendorShopUrl) });
            }
        } finally {
            await customerPage.close();
            await customerCtx.close();
        }

        // Vendor dashboard, including the PayPal payment-settings screen itself.
        const vendorCtx = await browser.newContext({ storageState: vendorAuth });
        const vendorPage = await vendorCtx.newPage();
        try {
            scanned.push({ label: 'vendor dashboard', body: await collectRenderedText(vendorPage, siteUrl('/dashboard/')) });
            scanned.push({ label: 'vendor PayPal payment settings', body: await collectRenderedText(vendorPage, siteUrl(PayPalMarketplacePage.VENDOR_SETTINGS_URL)) });
        } finally {
            await vendorPage.close();
            await vendorCtx.close();
        }

        // Prove the scan can actually see page content, so an empty capture cannot pass as clean.
        //
        // PER SURFACE, not in aggregate: `collectRenderedText()` swallows every navigation failure
        // (`page.goto(...).catch(() => undefined)`), and the cart and checkout pages alone clear
        // any sensible total on their own — so an aggregate floor hides a surface that rendered
        // nothing. The one that matters most is the vendor PayPal payment settings screen, the
        // only page that prints vendor PayPal data (templates/vendor-settings-payment.php:11 and
        // its inline connect-nonce script block).
        const totalBytes = scanned.reduce((sum, s) => sum + s.body.length, 0);
        for (const { label, body } of scanned) {
            expect(
                body.length,
                `the ${label} surface rendered ${body.length} bytes — that page did not load, so "the secret is absent from it" is an artifact of an empty capture rather than evidence of anything`,
            ).toBeGreaterThan(1000);
        }

        for (const { label, body } of scanned) {
            expect(
                body,
                `the PayPal client secret is present in the ${label} page or one of the payloads it loaded — a leaked client secret lets anyone mint partner API tokens for this marketplace and is a critical finding`,
            ).not.toContain(secret);
        }

        // The partner id and client id are public by design (they ride the SDK URL). The secret
        // is the only one of the three that must never appear, which is why only it is asserted.
        log.success(`PP-SEC-11: scanned ${scanned.length} rendered surfaces (${totalBytes} bytes of markup and script payloads); the client secret appears in none of them.`);
    });

    // ---------------------------------------------------------------------
    // PP-SEC-12 — client secret is not returned by any REST response.
    // ---------------------------------------------------------------------
    test('PP-SEC-12: no REST response hands the PayPal client secret to a vendor, a customer or an anonymous caller', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(
            !hasCredentials,
            'No PayPal client secret is stored (TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE is unset, so ensurePayPalConfigured() no-ops) — every "the secret is absent" assertion would pass without the secret ever existing.',
        );

        const secret = PAYPAL_KEYS.clientSecret;
        const gatewayRoute = `${SERVER_URL}/wc/v3/payment_gateways/${PAYPAL_GATEWAY_ID}`;

        // POSITIVE CONTROL — the secret really is stored and really is readable somewhere, so the
        // absences below are meaningful. WooCommerce core returns raw setting values, including
        // `password`-typed ones, to a manage_woocommerce caller
        // (class-wc-rest-payment-gateways-controller.php:92).
        const asAdmin = await probe(gatewayRoute, { headers: ADMIN });
        expect(asAdmin.status, `the admin gateway read failed (${asAdmin.status}) — without it there is no proof the secret is stored at all`).toBe(200);
        // Asserted on the SECRET VALUE alone. `test_app_pass` is the gateway's form-FIELD key
        // (templates/admin-gateway-settings.php:123) and WooCommerce's controller returns every
        // declared field regardless of whether anything is stored in it
        // (class-wc-rest-payment-gateways-controller.php::get_settings), so accepting the field
        // name as proof would satisfy this control on a gateway with a blank secret — exactly the
        // state it exists to rule out, and the state in which all ten absences below are trivial.
        const adminSeesSecret = asAdmin.text.includes(secret);
        expect(
            adminSeesSecret,
            'the admin gateway response does not carry the stored client secret — the secret this test looks for is not actually saved on the gateway, so every "the secret is absent" assertion below would pass without the secret ever existing anywhere',
        ).toBe(true);

        const probes: Array<{ label: string; url: string; headers: Headers }> = [
            { label: 'anonymous · wc/v3 payment gateway', url: gatewayRoute, headers: ANON },
            { label: 'customer · wc/v3 payment gateway', url: gatewayRoute, headers: CUSTOMER },
            { label: 'vendor · wc/v3 payment gateway', url: gatewayRoute, headers: VENDOR },
            { label: 'anonymous · store profile', url: `${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}`, headers: ANON },
            { label: 'customer · store profile', url: `${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}`, headers: CUSTOMER },
            { label: 'vendor · store profile', url: `${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}`, headers: VENDOR },
            { label: 'vendor · own settings (v1)', url: `${SERVER_URL}/dokan/v1/settings`, headers: VENDOR },
            { label: 'vendor · own settings (v2)', url: `${SERVER_URL}/dokan/v2/settings`, headers: VENDOR },
            { label: 'vendor2 · vendor1 settings (v1)', url: `${SERVER_URL}/dokan/v1/settings?vendor_id=${VENDOR_ID}`, headers: VENDOR2 },
            { label: 'anonymous · dokan/v1 route index', url: `${SERVER_URL}/dokan/v1`, headers: ANON },
        ];

        for (const p of probes) {
            const res = await probe(p.url, { headers: p.headers });
            expect(
                res.text,
                `${p.label} received the PayPal client secret from ${p.url} — a secret readable below administrator level lets that caller mint partner API tokens for the whole marketplace`,
            ).not.toContain(secret);
        }

        if (adminSeesSecret) {
            // Recorded rather than failed: this is WooCommerce core's own gateway controller
            // returning what the administrator typed in, gated on manage_woocommerce. It is not
            // Dokan behaviour and is not a privilege escalation, but it is worth knowing.
            log.info(
                'PP-SEC-12: administrator-level exposure of the stored secret',
                `GET wc/v3/payment_gateways/${PAYPAL_GATEWAY_ID} returns the raw test_app_pass value to a manage_woocommerce caller. That is WooCommerce core (class-wc-rest-payment-gateways-controller.php:92 returns every setting value, password-typed ones included), identical for every gateway on the site, so it is recorded here rather than filed against Dokan.`,
            );
        }

        log.success(`PP-SEC-12: ${probes.length} vendor/customer/anonymous REST reads, none of them carrying the client secret.`);
    });

    // ---------------------------------------------------------------------
    // PP-SEC-13 — settings screen masks the stored secret.
    // ---------------------------------------------------------------------
    test('PP-SEC-13: the admin gateway settings screen renders the stored secret in a masked field', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        test.skip(
            !hasCredentials,
            'No secret is stored (TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE is unset, so ensurePayPalConfigured() no-ops) — the field would render empty and "masked" would be true of a blank input.',
        );

        const secret = PAYPAL_KEYS.clientSecret;

        // The default `page` fixture carries no storageState (playwright.config.ts sets none), so
        // wp-admin needs an explicitly authenticated context.
        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        let inputType: string | null = null;
        let renderedValue = '';
        let html = '';
        try {
            const field = page.locator(PayPalMarketplacePage.admin.sandBoxClientSecret);
            await page.goto(siteUrl(PayPalMarketplacePage.ADMIN_SETTINGS_URL), { waitUntil: 'domcontentloaded' });
            await expect(field, 'the Sandbox Client Secret field must render on the gateway settings screen, or this test is measuring a screen that never loaded').toBeAttached();

            inputType = await field.getAttribute('type');
            renderedValue = await field.inputValue();
            html = await page.content();
        } finally {
            await page.close();
            await ctx.close();
        }

        expect(
            inputType,
            `the stored client secret is rendered in an input of type "${inputType}" — anything other than "password" shows the marketplace's PayPal secret in plain text to anyone who can see the admin's screen`,
        ).toBe('password');

        // The real check: the secret must not be sitting anywhere on the page OUTSIDE that
        // masked input — not in a description, a data attribute, or an inline script.
        const outsideField = html.split(secret).length - 1 - (renderedValue === secret ? 1 : 0);
        expect(
            outsideField,
            `the client secret appears ${outsideField} extra time(s) on the settings screen outside the masked input — a copy in a description, data attribute or inline script defeats the masking entirely`,
        ).toBe(0);

        // Recorded, per the case: what the DOM value actually holds.
        if (renderedValue === secret) {
            log.info(
                'PP-SEC-13: the masked field carries the real secret in its value attribute',
                `#${PayPalMarketplacePage.admin.sandBoxClientSecret.replace('#', '')} is type="password" so it is visually masked, but its value attribute holds the stored secret verbatim. That is WooCommerce core's generate_password_html() behaviour, shared by every gateway on the site and reachable only with manage_woocommerce, so it is recorded rather than filed against Dokan. It does mean the secret is one "view source" away for anyone with admin screen access.`,
            );
        } else {
            log.success(`PP-SEC-13: the settings field is type="password" and its value is masked (rendered value is not the stored secret).`);
        }
    });

    // ---------------------------------------------------------------------
    // PP-SEC-14 — webhook endpoint is not a state-mutation oracle.
    // ---------------------------------------------------------------------
    test('PP-SEC-14: an unsigned forged refund webhook creates no refund and moves no money', { tag: ['@pro', '@guest'] }, async () => {
        test.skip(
            !hasCredentials,
            'Helper::is_ready() is false without the PayPal credentials, and WebhookHandler.php:53 answers 200 and exits BEFORE reading the request body in that state — the endpoint would refuse the forged event for the wrong reason and this negative would pass against a completely dead gateway.',
        );

        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            'the gateway is not ready, so WebhookHandler::handle_events() exits at its first line without ever reaching the signature check — the "no refund was created" assertion below would be true because nothing was processed',
        ).toBe(true);

        const order = await createOrder({ customerId: Number(CUSTOMER_ID), productId, status: 'processing' });
        createdOrderIds.push(order.id);

        const statusBefore = await getOrderStatus(order.id);
        const notesBefore = await getOrderNotes(order.id);
        const refundRowsBefore = await countRefundRows(order.id);
        const forgedRefundId = `FORGED-REFUND-${Date.now()}`;

        // A structurally valid PAYMENT.CAPTURE.REFUNDED body: everything
        // WebhookEvents/PaymentCaptureRefunded::handle() reads is present, so the ONLY thing
        // standing between this POST and a refund row is the signature verification.
        const httpStatus = await postUnsignedWebhook(PAYPAL_EVENTS.captureRefunded, {
            id: forgedRefundId,
            status: 'COMPLETED',
            custom_id: order.id,
            note_to_payer: 'forged refund from an unauthenticated caller',
            seller_payable_breakdown: {
                gross_amount: { currency_code: 'USD', value: String(PRODUCT_PRICE) },
                net_amount: { currency_code: 'USD', value: String(PRODUCT_PRICE) },
                paypal_fee: { currency_code: 'USD', value: '0.00' },
                platform_fees: [{ amount: { currency_code: 'USD', value: '0.00' } }],
                total_refunded_amount: { currency_code: 'USD', value: String(PRODUCT_PRICE) },
            },
        });

        // Deliberately NOT asserted on its own: WebhookHandler answers 200-and-exit when the
        // gateway is not ready and 400 when verification fails, so the code alone cannot tell a
        // protected endpoint from a dead one. Only the state assertions below can.
        log.info('PP-SEC-14: the live webhook endpoint answered the unsigned forged event', `HTTP ${httpStatus} — recorded for context only; the assertions below are on state.`);

        expect(
            await countRefundRows(order.id),
            `an unsigned forged PAYMENT.CAPTURE.REFUNDED created a refund row for order ${order.id} — an anonymous caller able to book refunds moves real money out of vendor balances`,
        ).toBe(refundRowsBefore);

        const refundMeta = await getOrderMetaValue(order.id, '_dokan_paypal_refund_id');
        expect(refundMeta ?? '', `the forged refund id ${forgedRefundId} was recorded on order ${order.id} — the module accepted an unsigned event as a genuine PayPal refund`).not.toContain(forgedRefundId);

        const notesAfter = await getOrderNotes(order.id);
        expect(
            notesAfter.filter(n => /Refund Processed Via PayPal Dashboard/i.test(n)).length,
            'the forged event produced a "Refund Processed Via PayPal Dashboard" order note, which the handler only writes after inserting the refund row',
        ).toBe(0);
        expect(notesAfter.length, `the forged event added ${notesAfter.length - notesBefore.length} order note(s) — an unauthenticated caller must not be able to write to an order at all`).toBe(notesBefore.length);
        expect(await getOrderStatus(order.id), 'the forged refund event must leave the order status exactly where it was').toBe(statusBefore);

        log.success(`PP-SEC-14: the unsigned forged refund created no refund row, no refund meta, no order note and no status change on order ${order.id}.`);
    });

    /**
     * PP-SEC-15 — the case the suite was MISSING, added 2026-07-31 after DOK-029.
     *
     * PP-SEC-09 and PP-SEC-10 both passed while a real CSRF sat in this module, because both send a
     * WRONG nonce. All three guards in `authorize_paypal_marketplace()` are written
     * `isset( $_GET['_wpnonce'] ) && … && ! wp_verify_nonce( … )`
     * (RegisterWithdrawMethods.php:279, :285, :297), so a wrong nonce reaches `wp_verify_nonce` and
     * is correctly rejected — while an ABSENT nonce makes the whole condition false and skips
     * validation entirely. Control then falls to :304, which reads `merchantIdInPayPal` from the
     * query string and hands it to `WithdrawManager::handle_connect_success_response()`, which
     * `update_user_meta()`s it as the vendor's merchant id — the value that decides who is paid.
     *
     * The general lesson, worth applying beyond this module: a nonce-enforcement case needs THREE
     * inputs — valid, invalid, and ABSENT. Testing only the first two exercises the branch and
     * never the reachability of the branch.
     *
     * This asserts the CORRECT behaviour, so it fails against develop today. That failure IS the
     * live reproduction DOK-029 is waiting for. Do not soften it; it goes green when the product
     * verifies unconditionally.
     */
    test('PP-SEC-15: a connect-success callback with NO nonce must not overwrite the vendor merchant id', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const before = await readUserMetaRaw(VENDOR_ID, merchantIdKey);
        expect(
            before,
            `vendor ${VENDOR_ID} carries no "${merchantIdKey}" meta, so "the merchant id was not overwritten" would be true of a vendor who never had one — the case would pass without testing anything`,
        ).toBeTruthy();

        const HOSTILE = 'ATTACKERMERCH1';
        expect(before, 'the fixture merchant id must differ from the hostile value, or the comparison below is vacuous').not.toBe(HOSTILE);

        const ctx = await browser.newContext({ storageState: vendorAuth });
        try {
            const page = await ctx.newPage();
            // No `_wpnonce` at all — that is the whole point. A forged one is PP-SEC-09/-10's job.
            await page.goto(
                siteUrl(
                    `${PayPalMarketplacePage.VENDOR_SETTINGS_URL}?action=dokan-paypal-marketplace-connect-success&status=success&merchantIdInPayPal=${HOSTILE}`,
                ),
                { waitUntil: 'domcontentloaded' },
            );

            const after = await readUserMetaRaw(VENDOR_ID, merchantIdKey);

            // Both fixture controls above (the vendor HAS a merchant id, and it differs from the
            // hostile value) must go RED on their own. Only the assertion below is expected to fail
            // while DOK-029 is open, and the moment it stops failing Playwright reports "expected to
            // fail, but passed" — which is the signal that the Critical is closed and this marker,
            // plus the release gate in HANDOFF.md, must be removed.
            test.fail();

            expect(
                after,
                `a nonce-less GET overwrote vendor ${VENDOR_ID}'s PayPal merchant id from "${String(before)}" to "${String(after)}". Any link a logged-in vendor can be induced to click redirects their payouts to the attacker's PayPal account. CONFIRMED defect DOK-029 (CRITICAL), verified against dokan-pro 5.0.9 source: the three guards at RegisterWithdrawMethods.php:279,285,297 are written \`isset( $_GET['_wpnonce'] ) && … && ! wp_verify_nonce( … )\`, so omitting the nonce makes the whole condition false and skips the check instead of failing it.`,
            ).toBe(before);
        } finally {
            // Restore unconditionally. If the defect IS real the meta is now hostile, and leaving it
            // that way would break every later case that needs a payable vendor — a failing test
            // must not also corrupt the fixture for its neighbours.
            const now = await readUserMetaRaw(VENDOR_ID, merchantIdKey);
            if (now !== before && before !== null) {
                await dbUtils.dbQuery(`UPDATE ${DB_PREFIX}_usermeta SET meta_value = ? WHERE user_id = ? AND meta_key = ?;`, [
                    before,
                    Number(VENDOR_ID),
                    merchantIdKey,
                ]);
                log.warn(`PP-SEC-15: restored vendor ${VENDOR_ID}'s merchant id after the nonce-less callback overwrote it — DOK-029 reproduced.`);
            }
            await ctx.close();
        }

        log.success('PP-SEC-15: a nonce-less connect-success callback left the vendor merchant id unchanged.');
    });
});
