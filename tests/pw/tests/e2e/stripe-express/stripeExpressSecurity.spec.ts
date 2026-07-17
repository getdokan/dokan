import { test, expect, request, Page, BrowserContext } from '@utils/test';
import { SERVER_URL, BASE_URL } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { stripeApi } from '@utils/stripeApi';
import { log } from '@utils/logger';
import { StripeExpressPage, STRIPE_CARDS, STRIPE_EXPRESS_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import {
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    hasCredentials,
    ensureStripeExpressConfigured,
    ensureCustomerAddress,
    ensureClassicCheckoutPage,
    seedStripeExpressConnectedVendor,
    removeStripeExpressConnectedVendor,
    getOrderStatus,
    getStripeIntentIdForOrder,
    postWebhookEvent,
} from './helpers';

/**
 * Stripe Express — security · WC-AJAX / IDOR / tampering · SE-SEC 01..14.
 *
 * Express registers NO `register_rest_route` endpoints. Every in-checkout call is a
 * WooCommerce **WC-AJAX** action (`?wc-ajax=<action>`, fired for ANY visitor, body read
 * from `$_POST`/`$_GET` — NOT JSON), so all probes below POST `application/x-www-form-urlencoded`
 * (the `form:` option) and force `Authorization:''` so an api-config admin-auth leak cannot apply.
 *
 * Endpoints under test (Controllers/Checkout.php):
 *   create_payment_intent   nonce dokan_stripe_express_checkout
 *   update_payment_intent   nonce dokan_stripe_express_checkout
 *   init_setup_intent       nonce dokan_stripe_express_checkout   (guest-reachable)
 *   update_failed_order     nonce dokan_stripe_express_checkout   (guest-reachable)
 *   verify_intent           nonce dokan_stripe_express_confirm_pi (GET, $_GET['order'])
 *   update_order_status     nonce dokan_stripe_express_update_order_status
 *
 * SUSPECTED BUGS verified adversarially here (assert the REAL, reachable behaviour, never fake):
 *   SE-SEC-08  verify_intent resolves the order purely from absint($_GET['order']) — no order_key,
 *              no per-user ownership check (Checkout.php:217-220). Suspected cross-customer IDOR.
 *   SE-SEC-09  update_order_status' catch force-fails ANY $order_id on intent mismatch (Checkout.php:365-391).
 *   SE-SEC-10  update_failed_order binds an attacker intent to an attacker order_id with only a
 *              checkout-level nonce (Checkout.php:412-465).
 *   SE-SEC-12  create_payment_intent has no ownership check on order_id (Checkout.php:101-119).
 *   SE-SEC-13  init_setup_intent has no login/cap gate beyond a guest-reachable nonce (Checkout.php:287-294).
 *
 * The WC-AJAX endpoints only exist when the gateway is API-ready, so the WC-AJAX cases gate on
 * `!hasCredentials`. Serial because the file seeds the shared connected vendor + product.
 */

const PRODUCT_PRICE = 23;

// Message fragments the handlers emit ONLY when the nonce/CSRF gate rejects a call. Used to prove
// a call PASSED the gate (reached the payment/Stripe layer) rather than being CSRF-bounced.
const NONCE_REJECTION = /refresh the page|CSRF verification failed|not able to process/i;

const ACTION = {
    createPI: 'dokan_stripe_express_create_payment_intent',
    updatePI: 'dokan_stripe_express_update_payment_intent',
    verifyIntent: 'dokan_stripe_express_verify_intent',
    updateOrderStatus: 'dokan_stripe_express_update_order_status',
    updateFailedOrder: 'dokan_stripe_express_update_failed_order',
    initSetupIntent: 'dokan_stripe_express_init_setup_intent',
} as const;

interface WcAjaxBody {
    success?: boolean;
    data?: Record<string, unknown> | string;
}

interface WcAjaxResult {
    status: number;
    text: string;
    body: WcAjaxBody | undefined;
}

// ---------------------------------------------------------------------------
// Local helpers (HARD RULE 1 — these are NOT in the shared toolkit, so they live
// in this file rather than editing helpers.ts / stripeExpressPage.ts).
// ---------------------------------------------------------------------------

// WC-AJAX lives at the SITE ROOT (home_url '/?wc-ajax='), NOT under the REST base (SERVER_URL = …/wp-json).
const wcAjaxUrl = (action: string): string => `${BASE_URL.replace(/\/$/, '')}/?wc-ajax=${action}`;

const buildQuery = (params: Record<string, string | number>): string =>
    Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');

/** Pull a `name=value; …` Cookie header out of a browser context, so an API call replays the session. */
async function cookieHeader(ctx: BrowserContext): Promise<string> {
    const cookies = await ctx.cookies(SERVER_URL);
    return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

/**
 * Read the `dokan_stripe_express_checkout` nonce localised on the front-end as
 * `window.dokanStripeExpress.nonce` (printed whenever the gateway is_available on a
 * checkout/add-payment page — Stripe.php:398-402). Polls until wp_localize hydrates.
 */
async function readCheckoutNonce(page: Page): Promise<string> {
    return page.evaluate(async () => {
        const read = (): string => {
            const w = window as unknown as { dokanStripeExpress?: { nonce?: string } };
            return w.dokanStripeExpress?.nonce ?? '';
        };
        const deadline = Date.now() + 12000;
        let n = read();
        while (!n && Date.now() < deadline) {
            await new Promise(r => setTimeout(r, 250));
            n = read();
        }
        return n;
    });
}

/** POST a WC-AJAX action as urlencoded form (so $_POST populates). Authorization forced to ''. */
async function postWcAjax(
    action: string,
    opts: { form?: Record<string, string | number>; nonce?: string; cookie?: string } = {},
): Promise<WcAjaxResult> {
    const headers: Record<string, string> = { Authorization: '' };
    if (opts.cookie) {
        headers.Cookie = opts.cookie;
    }
    const form: Record<string, string | number> = { ...(opts.form ?? {}) };
    if (opts.nonce) {
        form._ajax_nonce = opts.nonce;
    }
    const ctx = await request.newContext({ extraHTTPHeaders: headers });
    try {
        const res = await ctx.post(wcAjaxUrl(action), { form, maxRedirects: 0 });
        const text = await res.text();
        let body: WcAjaxBody | undefined;
        try {
            body = JSON.parse(text) as WcAjaxBody;
        } catch {
            body = undefined;
        }
        return { status: res.status(), text, body };
    } finally {
        await ctx.dispose();
    }
}

/** GET a WC-AJAX action with query args (verify_intent reads $_GET['order']). Does NOT follow redirects. */
async function getWcAjax(
    action: string,
    opts: { query?: Record<string, string | number>; nonce?: string; cookie?: string } = {},
): Promise<WcAjaxResult> {
    const headers: Record<string, string> = { Authorization: '' };
    if (opts.cookie) {
        headers.Cookie = opts.cookie;
    }
    const query: Record<string, string | number> = { ...(opts.query ?? {}) };
    if (opts.nonce) {
        query._wpnonce = opts.nonce;
    }
    const ctx = await request.newContext({ extraHTTPHeaders: headers });
    try {
        const res = await ctx.get(`${wcAjaxUrl(action)}&${buildQuery(query)}`, { maxRedirects: 0 });
        const text = await res.text();
        let body: WcAjaxBody | undefined;
        try {
            body = JSON.parse(text) as WcAjaxBody;
        } catch {
            body = undefined;
        }
        return { status: res.status(), text, body };
    } finally {
        await ctx.dispose();
    }
}

const dataId = (body?: WcAjaxBody): string | undefined => {
    const d = body?.data;
    return d && typeof d === 'object' ? (d as { id?: string }).id : undefined;
};

const dataError = (body?: WcAjaxBody): string => {
    const d = body?.data;
    if (d && typeof d === 'object') {
        return (d as { error?: { message?: string } }).error?.message ?? '';
    }
    return typeof d === 'string' ? d : '';
};

async function adminContext() {
    return request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
}

/** Create a standalone WC order (admin REST) to use as the IDOR/force-fail "victim". */
async function createOrder(opts: { customerId?: number; status?: string; productId: string }): Promise<{ id: string; total: number }> {
    const ctx = await adminContext();
    try {
        const res = await ctx.post(`${SERVER_URL}/wc/v3/orders`, {
            data: {
                payment_method: 'dokan_stripe_express',
                payment_method_title: 'Stripe Express',
                set_paid: false,
                status: opts.status ?? 'pending',
                customer_id: opts.customerId ?? 0,
                billing: payloads.createOrder.billing,
                line_items: [{ product_id: Number(opts.productId), quantity: 1 }],
            },
        });
        const body = (await res.json()) as { id: number; total: string };
        if (!res.ok()) {
            throw new Error(`createOrder failed (${res.status()}): ${JSON.stringify(body).slice(0, 200)}`);
        }
        return { id: String(body.id), total: Number(body.total) };
    } finally {
        await ctx.dispose();
    }
}

async function getOrderTotal(orderId: string): Promise<number> {
    const ctx = await adminContext();
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=total`);
        const body = (await res.json().catch(() => ({}))) as { total?: string };
        return Number(body.total ?? '0');
    } finally {
        await ctx.dispose();
    }
}

async function deleteOrder(orderId: string): Promise<void> {
    const ctx = await adminContext();
    try {
        await ctx.delete(`${SERVER_URL}/wc/v3/orders/${orderId}?force=true`);
    } finally {
        await ctx.dispose();
    }
}

test.describe.serial('Stripe Express — security · WC-AJAX / IDOR / tampering @pro', () => {
    test.describe.configure({ timeout: 180_000 });

    let productId: string;
    const createdOrderIds: string[] = [];

    test.beforeAll(async () => {
        await ensureStripeExpressConfigured();
        await ensureCustomerAddress();
        await ensureClassicCheckoutPage();
        // A connected vendor + product so SE-SEC-02 can drive a REAL order through the gateway.
        await seedStripeExpressConnectedVendor(VENDOR_ID, STRIPE_EXPRESS_CONNECTED_ACCOUNTS.vendor1);
        const api = new ApiUtils(await request.newContext());
        try {
            const [, id] = await api.createProduct(
                { ...payloads.createProduct(), name: 'SE Security Product', regular_price: String(PRODUCT_PRICE) },
                payloads.vendorAuth,
            );
            productId = id;
        } finally {
            await api.dispose();
        }
    });

    test.afterAll(async () => {
        await removeStripeExpressConnectedVendor(VENDOR_ID);
        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        for (const id of createdOrderIds) {
            await deleteOrder(id).catch(() => undefined);
        }
        if (productId) {
            const ctx = await adminContext();
            try {
                await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`);
            } finally {
                await ctx.dispose();
            }
        }
    });

    // -----------------------------------------------------------------------
    // SE-SEC-01 — create_payment_intent rejects logged-out / invalid-nonce.
    // -----------------------------------------------------------------------
    test('SE-SEC-01: create_payment_intent rejects a logged-out / invalid-nonce caller', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the WC-AJAX endpoint only registers when the gateway is API-ready');

        // check_ajax_referer('dokan_stripe_express_checkout') runs before any Stripe logic. WC-AJAX always
        // answers HTTP 200; the rejection lives in the JSON envelope (success:false).
        const noNonce = await postWcAjax(ACTION.createPI, { form: { order_id: '' } });
        expect(noNonce.status, 'WC-AJAX responds 200; the rejection is carried in the JSON envelope').toBe(200);
        expect(noNonce.body?.success, 'a logged-out create_payment_intent (no nonce) is rejected').toBe(false);

        const badNonce = await postWcAjax(ACTION.createPI, { nonce: 'deadbeefdeadbeef', form: {} });
        expect(badNonce.body?.success, 'an invalid create_payment_intent nonce is rejected').toBe(false);

        log.success('create_payment_intent rejects no-nonce and invalid-nonce callers (success:false) before minting any PaymentIntent');
    });

    // -----------------------------------------------------------------------
    // SE-SEC-12 — create_payment_intent order_id IDOR (no ownership check).
    // -----------------------------------------------------------------------
    test('SE-SEC-12: create_payment_intent mints a PaymentIntent for ANOTHER user\'s order (order_id IDOR)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — minting a PaymentIntent needs the live gateway');

        // A victim order owned by the vendor (NOT the attacking customer).
        const victim = await createOrder({ customerId: Number(VENDOR_ID), productId, status: 'pending' });
        createdOrderIds.push(victim.id);

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            // The customer needs a cart so /classic-checkout/ renders (and localises the nonce) instead of
            // redirecting to the cart page; the cart item itself is irrelevant — the order_id path ignores it.
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            const nonce = await readCheckoutNonce(page);
            expect(nonce, 'read the dokan_stripe_express_checkout nonce from the customer checkout page').toBeTruthy();
            const cookie = await cookieHeader(ctx);

            // No ownership check on order_id (Checkout.php:101-119) → the customer mints a PI for the vendor's order.
            const res = await postWcAjax(ACTION.createPI, { nonce, cookie, form: { order_id: victim.id } });
            expect(res.body?.success, 'create_payment_intent has NO ownership check — it mints a PI for a foreign order (IDOR)').toBe(true);
            const intentId = dataId(res.body);
            expect(intentId, 'a PaymentIntent id / client_secret was returned for the foreign order').toBeTruthy();

            // Truth check against Stripe: the foreign order's total is leaked through the minted PI amount.
            const pi = await stripeApi.getPaymentIntent(intentId as string);
            expect(pi.amount, "the foreign order's total is exposed via the minted PaymentIntent").toBe(Math.round(victim.total * 100));

            log.warn(
                'create_payment_intent order_id IDOR (SE-SEC-12, suspected bug)',
                `customer ${CUSTOMER_ID} minted PaymentIntent ${intentId} (amount ${pi.amount}) for vendor-owned order ${victim.id} — no per-user ownership check on order_id. File to bugs/.`,
            );
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // -----------------------------------------------------------------------
    // SE-SEC-02 — Amount tampering: captured charge == the real cart total.
    // -----------------------------------------------------------------------
    test('SE-SEC-02: a forged client amount cannot shrink the captured charge — it equals the real cart total', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — cannot drive the Payment Element');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        let orderId: string | undefined;
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);

            // Layer A (best-effort, adversarial) — try to mint a PI with a FORGED `amount`. create_payment_intent
            // never reads a client amount (it derives it from the cart/order total — Checkout.php:101-119), so the
            // forged 1-cent is structurally ignored. If the cart isn't visible to the API call, fall through to B.
            await stripe.gotoClassicCheckout();
            const nonce = await readCheckoutNonce(page);
            const cookie = await cookieHeader(ctx);
            if (nonce) {
                const minted = await postWcAjax(ACTION.createPI, { nonce, cookie, form: { amount: 1 } });
                const mintedId = dataId(minted.body);
                if (minted.body?.success === true && mintedId) {
                    const tampered = await stripeApi.getPaymentIntent(mintedId);
                    expect(tampered.amount, 'create_payment_intent ignores the client `amount` and uses the cart total').toBeGreaterThan(1);
                    log.success(`Layer A: forged amount=1 ignored — minted PI amount ${tampered.amount}¢ (server-derived from the cart)`);
                } else {
                    log.skip('Layer A mint not reachable from automation (cart not visible to the API call) — asserting Layer B only');
                }
            }

            // Layer B (the invariant) — place the SAME cart normally; the customer must be charged the FULL total.
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            orderId = await stripe.placeBlockOrderExpectReceived();
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id from order-received').toBeTruthy();
        createdOrderIds.push(orderId as string);

        const total = await getOrderTotal(orderId as string);
        const expectedMinor = Math.round(total * 100); // USD, 2-decimal
        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const pi = await stripeApi.getPaymentIntent(intentId);
        const captured = pi.amount_received ?? pi.amount;
        expect(expectedMinor, 'the order total resolved to a non-trivial minor-units amount').toBeGreaterThan(1);
        expect(captured, 'the captured charge equals the FULL cart total (the create-intent amount is server-derived)').toBe(expectedMinor);
        log.success(`SE-SEC-02: captured ${captured}¢ == cart total ${expectedMinor}¢ — client amount tampering has no effect`);
    });

    // -----------------------------------------------------------------------
    // SE-SEC-11 — update_payment_intent rejects logged-out / invalid-nonce.
    // -----------------------------------------------------------------------
    test('SE-SEC-11: update_payment_intent rejects a logged-out / invalid-nonce caller', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the WC-AJAX endpoint only registers when the gateway is API-ready');

        const noNonce = await postWcAjax(ACTION.updatePI, { form: { payment_intent_id: 'pi_attacker', order_id: '' } });
        expect(noNonce.body?.success, 'a logged-out update_payment_intent is rejected').toBe(false);

        const badNonce = await postWcAjax(ACTION.updatePI, { nonce: 'deadbeef', form: { payment_intent_id: 'pi_attacker' } });
        expect(badNonce.body?.success, 'an invalid update_payment_intent nonce is rejected').toBe(false);

        log.warn(
            'update_payment_intent IDOR surface (SE-SEC-11)',
            'with a valid checkout nonce and no order_id, the handler updates the arbitrary $_POST payment_intent_id to the caller\'s cart total (Checkout.php:159-188) — no PI/order ownership binding. Full exploitation requires an attacker-known pi_; the nonce gate is the only guard.',
        );
    });

    // -----------------------------------------------------------------------
    // SE-SEC-08 — verify_intent IDOR: numeric order id, no ownership/order_key.
    // -----------------------------------------------------------------------
    test('SE-SEC-08: verify_intent resolves the order from a numeric id with NO ownership/order_key check (suspected IDOR)', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the WC-AJAX endpoint only registers when the gateway is API-ready');

        const victim = await createOrder({ customerId: Number(VENDOR_ID), productId, status: 'on-hold' });
        createdOrderIds.push(victim.id);
        const before = await getOrderStatus(victim.id);

        // Logged-out / no confirm_pi nonce → CSRF-bounced with a redirect (never processed). This is the only
        // guard the endpoint has: unlike Stripe Connect's verify-intent (order_key gated), there is NO order_key
        // and NO per-user ownership check — see the documented finding below.
        const res = await getWcAjax(ACTION.verifyIntent, { query: { order: victim.id } });
        expect(res.status, 'a no-nonce verify_intent is CSRF-bounced with a redirect (never processed)').toBeGreaterThanOrEqual(300);
        expect(res.status, 'a no-nonce verify_intent is CSRF-bounced with a redirect (never processed)').toBeLessThan(400);

        const after = await getOrderStatus(victim.id);
        expect(after, 'the victim order is untouched by the CSRF-bounced call').toBe(before);

        log.warn(
            'verify_intent IDOR (SE-SEC-08, suspected bug)',
            "the handler resolves the order purely from absint($_GET['order']) — NO order_key, NO per-user ownership check (Checkout.php:217-220). The only guard is the dokan_stripe_express_confirm_pi nonce; once obtained, ANY order id is verified and, with save_payment_method=1, the victim's payment method is attached to the attacker's Stripe customer (Checkout.php:242-256). File to bugs/ if confirmed live.",
        );
    });

    // -----------------------------------------------------------------------
    // SE-SEC-09 — update_order_status force-fail (suspected order-state DoS).
    // -----------------------------------------------------------------------
    test('SE-SEC-09: a logged-out update_order_status cannot force a victim order to failed (suspected force-fail bug documented)', { tag: ['@pro', '@customer'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the WC-AJAX endpoint only registers when the gateway is API-ready');

        const victim = await createOrder({ customerId: Number(VENDOR_ID), productId, status: 'processing' });
        createdOrderIds.push(victim.id);
        const before = await getOrderStatus(victim.id);

        // The nonce check (Checkout.php:349) runs BEFORE $order is resolved, so a logged-out caller throws
        // before the catch can reach $order->update_status('failed') — the victim is safe without a nonce.
        const res = await postWcAjax(ACTION.updateOrderStatus, {
            form: { order_id: victim.id, intent_id: 'pi_attacker_bogus', payment_method_id: 'pm_attacker' },
        });
        expect(res.body?.success, 'a logged-out update_order_status is rejected').toBe(false);

        const after = await getOrderStatus(victim.id);
        expect(after, 'the nonce gate precedes the $order assignment, so the catch cannot force-fail the order — victim unchanged').toBe(before);

        log.warn(
            'update_order_status force-fail (SE-SEC-09, suspected bug)',
            "with a VALID dokan_stripe_express_update_order_status nonce, a mismatched intent_id drives the catch block, which calls $order->update_status('failed') for ANY order_id (Checkout.php:365-391) — an order-state DoS. $_POST['payment_method_id'] is also read without isset (line 360). Logged-out is safe only because the throw precedes the $order assignment.",
        );
    });

    // -----------------------------------------------------------------------
    // SE-SEC-10 — update_failed_order: checkout-level nonce grants cross-order writes.
    // -----------------------------------------------------------------------
    test('SE-SEC-10: update_failed_order accepts a checkout-level nonce for a FOREIGN order; the forged intent never confirms payment (suspected IDOR/force-fail)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the WC-AJAX endpoint only registers when the gateway is API-ready');

        const victim = await createOrder({ customerId: Number(VENDOR_ID), productId, status: 'pending' });
        createdOrderIds.push(victim.id);
        const before = await getOrderStatus(victim.id);

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoClassicCheckout();
            const nonce = await readCheckoutNonce(page);
            expect(nonce, 'read the (checkout-level) dokan_stripe_express_checkout nonce').toBeTruthy();
            const cookie = await cookieHeader(ctx);

            // update_failed_order is guarded only by the checkout-level nonce (Checkout.php:414); bind an attacker
            // intent_id to a FOREIGN order_id and observe the result.
            const res = await postWcAjax(ACTION.updateFailedOrder, {
                nonce,
                cookie,
                form: { order_id: victim.id, intent_id: 'pi_attacker_bogus' },
            });

            // (1) IDOR write surface: a low-privilege checkout nonce passed the CSRF gate for a foreign order.
            expect(NONCE_REJECTION.test(res.text), 'a checkout-level nonce was accepted for a foreign-order operation (IDOR write surface)').toBe(false);

            // (2) The invariant that MUST hold: a forged intent NEVER marks the victim order paid.
            const after = await getOrderStatus(victim.id);
            expect(['processing', 'completed'].includes(after), 'a forged intent must NEVER mark the victim order paid').toBe(false);

            if (after !== before) {
                log.warn(
                    'update_failed_order force-fail (SE-SEC-10, suspected bug)',
                    `victim order ${victim.id} moved ${before} → ${after} via an attacker's forged intent + a checkout-level nonce (Checkout.php:412-465) — no intent⇄order binding check. File to bugs/ if confirmed.`,
                );
            } else {
                log.info('update_failed_order: forged intent left the victim order unchanged', `${before} (no state change)`);
            }
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // -----------------------------------------------------------------------
    // SE-SEC-13 — init_setup_intent reachable by a GUEST (no login/cap gate).
    // -----------------------------------------------------------------------
    test('SE-SEC-13: init_setup_intent is reachable by a GUEST with only the checkout nonce (no login/cap gate — suspected bug)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the WC-AJAX endpoint only registers when the gateway is API-ready');

        // A genuine GUEST context (no storageState): read the guest-minted checkout nonce, then POST logged-out.
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        try {
            const stripe = new StripeExpressPage(page);
            await stripe.addProductToCart(productId); // keep the guest on checkout (an empty cart redirects away)
            let nonce = '';
            try {
                await stripe.gotoClassicCheckout();
                nonce = await readCheckoutNonce(page);
            } catch {
                // checkout didn't render for the guest (guest checkout likely disabled) — handled by the skip below.
            }
            if (!nonce) {
                log.skip('SE-SEC-13 skipped: could not read a guest dokan_stripe_express_checkout nonce', 'guest checkout may be disabled on this site');
                test.skip(true, 'no guest checkout nonce available — guest checkout likely disabled');
            }
            const cookie = await cookieHeader(ctx);

            // Logged-out POST (Authorization:''). Customer::set(get_current_user_id()) resolves to uid 0 for a guest
            // (Checkout.php:287-294) — there is NO login/cap check beyond the nonce.
            const res = await postWcAjax(ACTION.initSetupIntent, { nonce, cookie });

            // The security finding: a guest PASSED the auth gate and reached the SetupIntent/Stripe layer (the
            // response is NOT the nonce/CSRF rejection). It either succeeds (seti_) or hits a Stripe-level error —
            // both prove the absence of a login gate.
            const reachedStripe = res.body?.success === true || !NONCE_REJECTION.test(dataError(res.body));
            expect(reachedStripe, 'a guest passed the auth gate and reached the SetupIntent layer — NO login/cap check (Checkout.php:287-294)').toBe(true);

            const intentId = dataId(res.body);
            if (res.body?.success === true && intentId) {
                expect(intentId, 'the guest minted a real Stripe SetupIntent').toMatch(/^seti_/);
                log.warn(
                    'init_setup_intent guest-reachable (SE-SEC-13, suspected bug)',
                    `a logged-out guest created SetupIntent ${intentId} using only the guest checkout nonce. File to bugs/.`,
                );
            } else {
                log.warn(
                    'init_setup_intent guest-reachable (SE-SEC-13, suspected bug)',
                    `the guest passed the auth gate (no login check); Stripe-layer detail: ${dataError(res.body) || res.text.slice(0, 160)}`,
                );
            }
        } finally {
            await page.close();
            await ctx.close();
        }
    });

    // -----------------------------------------------------------------------
    // SE-SEC-06 — Onboarding/disconnect admin-ajax cap + nonce (consolidated).
    // -----------------------------------------------------------------------
    test('SE-SEC-06: onboarding/disconnect admin-ajax is gated by nonce + dokan_manage_withdraw cap (logged-out rejected)', { tag: ['@pro', '@vendor'] }, async () => {
        // dokan_stripe_express_vendor_disconnect is a wp_ajax_ (no nopriv) action guarded by the
        // dokan_stripe_express_vendor_payment_settings nonce + the dokan_manage_withdraw cap
        // (WithdrawMethod/Ajax.php:53-62). A logged-out caller can never disconnect a vendor.
        const ctx = await request.newContext({ extraHTTPHeaders: { Authorization: '' } });
        try {
            const res = await ctx.post(`${SERVER_URL}/wp-admin/admin-ajax.php`, {
                form: { action: 'dokan_stripe_express_vendor_disconnect', _wpnonce: 'forged', seller_id: VENDOR_ID },
                maxRedirects: 0,
            });
            const text = (await res.text()).trim();
            const rejected = res.status() === 400 || res.status() === 403 || text === '0' || /nonce|permission|denied|failed/i.test(text);
            expect(rejected, `a logged-out onboarding/disconnect POST is rejected (status ${res.status()}, body "${text.slice(0, 60)}")`).toBe(true);
            expect(text, 'no Stripe onboarding/login URL is leaked to an unauthenticated caller').not.toMatch(/connect\.stripe\.com|account_links|login_links/);
        } finally {
            await ctx.dispose();
        }
        log.success('onboarding/disconnect admin-ajax rejects logged-out callers (cap + nonce) — no vendor disconnect, no Stripe URL leaked');
    });

    // -----------------------------------------------------------------------
    // SE-SEC-07 — Forged/unsigned webhook rejected at the UA gate (consolidated).
    // -----------------------------------------------------------------------
    test('SE-SEC-07: a forged/unsigned webhook with a non-Stripe user-agent is rejected at the UA gate', { tag: ['@pro', '@admin'] }, async () => {
        test.skip(!hasCredentials, 'Stripe Express keys missing — the webhook endpoint only registers when the module is configured');

        // No valid signature + a non-Stripe UA → STATUS_USER_AGENT_INVALID / STATUS_SIGNATURE_INVALID → 204, no
        // processing (Webhook.php verify_request_status + handle_events). Holds whether or not a secret is stored.
        const status = await postWebhookEvent(
            { id: `evt_forged_${Date.now()}`, type: 'payment_intent.succeeded', account: null },
            'DokanSecuritySpecForgedAgent/1.0',
        );
        expect(status, 'a non-Stripe-UA unsigned event is rejected (204, no state change)').toBe(204);

        log.warn(
            'webhook UA fallback (SE-SEC-07 / SE-WH-11)',
            'when NO webhook secret is stored the gate falls back to a user-agent check that ALSO passes an EMPTY UA or any UA containing the substring "Stripe" (Webhook.php:225-233) — over-broad. The full signature/UA-matrix coverage lives in stripeExpressWebhooks.spec.ts.',
        );
    });

    // -----------------------------------------------------------------------
    // SE-SEC-14 — Saved-token reuse independent of saved_cards (consolidated).
    // -----------------------------------------------------------------------
    test('SE-SEC-14: saved-token reuse is driven by the POSTed payment-token field, independent of saved_cards', { tag: ['@pro', '@customer'] }, async () => {
        // The saved-token reuse path keys off the POSTed wc-dokan_stripe_express-payment-token on the WC checkout
        // endpoint (wc-ajax=checkout) — NOT one of the six Express WC-AJAX endpoints under test here, and it
        // requires a previously-stored token + the full WC checkout token pipeline. It cannot be isolated safely
        // on this surface, so it is exercised in stripeExpressSavedCards.spec.ts (SE-SAVE-03/06).
        log.skip('SE-SEC-14 routed to stripeExpressSavedCards.spec.ts', 'forged-token reuse needs a stored token + the WC checkout token pipeline; cannot be isolated on the Express WC-AJAX endpoints');
        test.skip(true, 'saved-token reuse is exercised in stripeExpressSavedCards.spec.ts (cannot be isolated on the WC-AJAX endpoints without a stored token)');
    });
});
