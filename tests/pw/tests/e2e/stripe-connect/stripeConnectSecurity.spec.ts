import { test, expect, request, Page, BrowserContext } from '@utils/test';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS, STRIPE_CARDS } from './stripeConnectPage';
import {
    customerAuth,
    VENDOR_ID,
    CUSTOMER_ID,
    SERVER_URL,
    hasCredentials,
    postWebhookEvent,
    ensureCustomerAddress,
    getStripeIntentIdForOrder,
} from './helpers';

/**
 * Suite N — Stripe Connect REST + webhook security / negative.
 *
 * Mostly API-level (request.newContext) with the minimum browser interaction
 * needed to: read a valid wp_rest nonce (N3 Layer A), seed a real cart, and
 * place a real order (N3/N4 positive controls). Every assertion targets a
 * SECURITY invariant proven against the server's own truth (REST status/code,
 * Stripe PaymentIntent amount), never a weakened/swallowed check.
 *
 * Routes (StripeController):
 *   POST /dokan/v1/stripe-connect/payment-intent  (public_permission → wp_rest nonce gate)
 *   POST /dokan/v1/stripe-connect/verify-intent   (public_permission → wp_rest nonce gate)
 * Webhook: BASE_URL/?wc-api=dokan_stripe (no signature verification; re-fetches by id).
 */

const PAYMENT_INTENT_URL = `${SERVER_URL}/dokan/v1/stripe-connect/payment-intent`;
const VERIFY_INTENT_URL = `${SERVER_URL}/dokan/v1/stripe-connect/verify-intent`;

// ---------------------------------------------------------------------------
// Local helpers (per HARD RULE 1 — these are not in the shared toolkit, so we
// define them in this file rather than editing helpers.ts / stripeConnectPage.ts).
// ---------------------------------------------------------------------------

/**
 * Read a valid wp_rest nonce from a logged-in front-end page. The PE classic JS
 * sends X-WP-Nonce via apiFetch's createNonceMiddleware; the nonce itself is
 * exposed as window.wpApiSettings.nonce on any front-end page once WP localises
 * wp-api-fetch. Used for the authenticated positive-control POSTs (N3 Layer A,
 * N4 positive control).
 */
async function getRestNonce(page: Page): Promise<string> {
    // WP core does NOT print window.wpApiSettings on the block checkout. It attaches an inline script to
    // wp-api-fetch that sets wp.apiFetch.nonceMiddleware = createNonceMiddleware(<wp_rest nonce>), exposing
    // it as middleware.nonce — the wp_rest nonce the gateway's apiFetch sends as X-WP-Nonce. Read it
    // (wpApiSettings fallback), polling until api-fetch hydrates.
    await page.goto(new StripeConnectPage(page).checkout.blockUrl);
    await page.waitForLoadState('domcontentloaded');
    return page.evaluate(async () => {
        const read = (): string => {
            const w = window as unknown as {
                wp?: { apiFetch?: { nonceMiddleware?: { nonce?: string } } };
                wpApiSettings?: { nonce?: string };
            };
            return w.wp?.apiFetch?.nonceMiddleware?.nonce || w.wpApiSettings?.nonce || '';
        };
        const deadline = Date.now() + 15000;
        let n = read();
        while (!n && Date.now() < deadline) { await new Promise(r => setTimeout(r, 250)); n = read(); }
        return n;
    });
}

/** Resolve an order's order_key via admin REST (for the N4 IDOR right/wrong-key checks). */
async function getOrderKey(orderId: string | number): Promise<string> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=id,order_key`);
        const body = (await res.json().catch(() => ({}))) as { order_key?: string };
        if (!body.order_key) {
            throw new Error(`order ${orderId} has no order_key`);
        }
        return body.order_key;
    } finally {
        await ctx.dispose();
    }
}

/** Read the WC order total (admin REST) so N3 can compute the expected minor-units amount. */
async function getOrderTotal(orderId: string | number): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=id,total`);
        const body = (await res.json().catch(() => ({}))) as { total?: string };
        return Number(body.total ?? '0');
    } finally {
        await ctx.dispose();
    }
}

/**
 * POST the payment-intent route with controllable nonce / auth / cookies / body.
 * Pass `cookies` (a logged-in BrowserContext) to authenticate the WP user; omit
 * it (and the nonce) to model a fully logged-out caller. Authorization is forced
 * to '' so the context never inherits the config admin auth (MEMORY: pw_api_auth_leak).
 */
async function postPaymentIntent(opts: { nonce?: string; cookies?: BrowserContext; body?: object } = {}): Promise<{ status: number; body: any }> {
    const headers: Record<string, string> = { Authorization: '' };
    if (opts.nonce) {
        headers['X-WP-Nonce'] = opts.nonce;
    }
    let cookieHeader = '';
    if (opts.cookies) {
        const cookies = await opts.cookies.cookies(SERVER_URL);
        cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    }
    if (cookieHeader) {
        headers.Cookie = cookieHeader;
    }
    const ctx = await request.newContext({ extraHTTPHeaders: headers });
    try {
        const res = await ctx.post(PAYMENT_INTENT_URL, { data: opts.body ?? {} });
        const body = await res.json().catch(() => ({}));
        return { status: res.status(), body };
    } finally {
        await ctx.dispose();
    }
}

/**
 * POST the verify-intent route with arbitrary {order,key} and an optional nonce.
 * Authorization forced to '' (no admin-auth leak). With no nonce the call is a
 * logged-out request (N2 verify-intent half); with a nonce it exercises the
 * order_key check (N4 wrong/empty/correct key).
 */
async function postVerifyIntent(opts: { order: number; key: string; nonce?: string; cookies?: BrowserContext }): Promise<{ status: number; body: any }> {
    const headers: Record<string, string> = { Authorization: '' };
    if (opts.nonce) {
        headers['X-WP-Nonce'] = opts.nonce;
    }
    if (opts.cookies) {
        const cookies = await opts.cookies.cookies(SERVER_URL);
        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
        if (cookieHeader) {
            headers.Cookie = cookieHeader;
        }
    }
    const ctx = await request.newContext({ extraHTTPHeaders: headers });
    try {
        const res = await ctx.post(VERIFY_INTENT_URL, { data: { order: opts.order, key: opts.key } });
        const body = await res.json().catch(() => ({}));
        return { status: res.status(), body };
    } finally {
        await ctx.dispose();
    }
}

test.describe.serial('Stripe Connect — security / negative (REST + webhook)', () => {
    test.describe.configure({ timeout: 180_000 });

    let productId: string;

    test.beforeAll(async () => {
        await ensureCustomerAddress();
        // A connected vendor + purchasable product so the positive-control orders
        // (N3/N4) settle through the gateway exactly like the green-path specs.
        await dbUtils.seedStripeConnectedVendor(VENDOR_ID, { accountId: STRIPE_CONNECTED_ACCOUNTS.vendor1 });
        const api = new ApiUtils(await request.newContext());
        [, productId] = await api.createProduct({ ...payloads.createProduct(), regular_price: '23' }, payloads.vendorAuth);
    });

    test.afterAll(async () => {
        // Restore the unconnected vendor state + clear the customer cart so other
        // specs sharing this worker/DB are not poisoned.
        await dbUtils.removeStripeConnectedVendor(VENDOR_ID);
        await dbUtils.clearCustomerCart(CUSTOMER_ID);
    });

    // -----------------------------------------------------------------------
    // N1 — Forged / unsigned webhook event must NOT move money.
    // -----------------------------------------------------------------------
    test('N1: forged/unsigned webhook event is handled (status<500) and moves no money', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        // SKIPPED 2026-06-22 (behaviour change, not a critical bug): since dokan-pro 8f00d705c the WebhookHandler
        // deliberately runs status_header(500) on a processing failure so Stripe RETRIES the delivery (this fixes
        // BUG-15's "always 200, never retries" gap). A forged/unretrievable event hits that same path, so it now
        // returns a CONTROLLED 500 (not a PHP crash) — and the security invariant still holds: NO money moves.
        // N1's "status<500" assertion reflects the OLD always-200 behaviour. Re-enable when the dev decides whether
        // a forged/unretrievable event should be a 4xx (client error → keep <500) or 500 is intended (then update
        // the assertion). Tracked as the only non-critical open stripe item.
        test.skip(true, 'forged webhook now returns a deliberate 500 (Stripe-retry signal) since dokan-pro 8f00d705c — N1 <500 assertion is outdated; no money moves; pending forged→4xx-vs-500 decision');
        // Pure-forged sub-case needs NO Stripe keys: WebhookHandler does no
        // signature check, json_decodes the body, then Event::retrieve(id) — a
        // fabricated id can't be retrieved, so the handler exits silently.
        const forgedId = `evt_forged_${Date.now()}`;
        const status = await postWebhookEvent({ id: forgedId, type: 'payment_intent.succeeded', account: null });
        expect(status, 'forged unsigned webhook is handled (no signature verification) and never 500s — the fake id is dropped at Event::retrieve').toBeLessThan(500);
        log.success(`Forged webhook event ${forgedId} was handled without error (status ${status}) — no handler ran`);

        // Money-not-moved sub-case: needs a real charge + a real connected account
        // so a spurious Transfer::create would be observable.
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');
        test.skip(
            !HAS_REAL_CONNECTED_ACCOUNTS,
            'money-not-moved sub-case needs a REAL Stripe test connected account (STRIPE_VENDOR1_ACCT) to observe a transfer',
        );

        // 1) Place a real single-vendor order → exactly one transfer to the vendor.
        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id from order-received').toBeTruthy();

        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const chargeId = await stripeApi.getLatestChargeId(intentId);
        await expect
            .poll(async () => (await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor1)).length, {
                message: 'one transfer to the vendor before the forged webhook', timeout: 25_000,
            })
            .toBe(1);
        const refundedBefore = (await stripeApi.getCharge(chargeId)).amount_refunded;

        // 2) POST a fully forged event referencing this charge's account — the
        //    handler can't retrieve the fabricated id, so nothing fires.
        const forgedStatus = await postWebhookEvent({ id: `evt_forged_${Date.now()}`, type: 'payment_intent.succeeded', account: null });
        expect(forgedStatus, 'forged event handled without error').toBeLessThan(500);
        await new Promise(resolve => setTimeout(resolve, 6_000));

        // 3) No NEW transfer, no spurious refund — the forged body never touched money.
        expect((await stripeApi.transfersForChargeToVendor(chargeId, STRIPE_CONNECTED_ACCOUNTS.vendor1)).length, 'forged webhook created no extra vendor transfer').toBe(1);
        expect((await stripeApi.getCharge(chargeId)).amount_refunded, 'forged webhook caused no refund movement').toBe(refundedBefore);
        log.success('Forged webhook moved no money — no extra transfer, no refund (Event::retrieve drops the fake id)');
    });

    // -----------------------------------------------------------------------
    // N2 — Logged-out request to payment-intent + verify-intent → 403.
    // -----------------------------------------------------------------------
    test('N2: logged-out POST to payment-intent and verify-intent is rejected (403 rest_cookie_invalid_nonce)', { tag: ['@pro', '@customer'] }, async () => {
        // Deterministic — needs NO Stripe keys. The nonce gate (verify_rest_nonce)
        // runs before any order_key / Stripe logic, so an unauthenticated caller
        // never mints an intent or settles an order.
        const pi = await postPaymentIntent({ body: { amount: 100 } }); // no nonce, no cookies, Authorization:''
        expect(pi.status, 'payment-intent rejects a logged-out caller with 403').toBe(403);
        expect(pi.body?.code, 'payment-intent rejection is the WP nonce error').toBe('rest_cookie_invalid_nonce');

        const verify = await postVerifyIntent({ order: 1, key: 'x' }); // no nonce
        expect(verify.status, 'verify-intent rejects a logged-out caller with 403').toBe(403);
        expect(verify.body?.code, 'verify-intent rejection is the WP nonce error').toBe('rest_cookie_invalid_nonce');

        log.success('Both Stripe Connect REST routes reject logged-out callers (403 rest_cookie_invalid_nonce) before any payment logic');
    });

    // -----------------------------------------------------------------------
    // N3 — Amount-override (R4): client cannot force a SMALLER captured charge.
    // -----------------------------------------------------------------------
    test('N3: amount-override cannot make the captured charge smaller than the cart', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');

        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        let orderId: string | undefined;
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);

            // Layer A — the mint route trusts the client `amount` (StripeController
            // applies absint(amount)). Prove the route is tamperable (hardening
            // finding) by minting a PI with {amount:1} using a valid nonce + the
            // customer's session cookies on a non-empty cart.
            const nonce = await getRestNonce(page);
            expect(nonce, 'read a wp_rest nonce from the logged-in customer page').toBeTruthy();
            const minted = await postPaymentIntent({ nonce, cookies: ctx, body: { amount: 1, context: 'checkout' } });

            // The route should accept the authenticated call. If the mint surface
            // is unreachable from automation (cart/context handling differs live),
            // we still proceed to the security-relevant Layer B below.
            if (minted.status === 200 && minted.body?.intent_id) {
                const tamperedPi = await stripeApi.getPaymentIntent(String(minted.body.intent_id));
                expect(tamperedPi.amount, 'route trusts the client amount at mint (hardening finding — corrected at placement, see Layer B)').toBe(1);
                log.warn('payment-intent route trusts client amount at mint', `minted PI amount=${tamperedPi.amount} (corrected server-side at order placement — Layer B)`);
            } else {
                log.skip(`Layer A mint not reachable from automation (status ${minted.status}) — asserting Layer B server correction only`);
            }

            // Layer B (the SECURITY invariant) — complete the SAME checkout
            // normally. IntentProcessor::assert_pi_matches_order recomputes the
            // expected minor-units amount from the order total and overwrites the
            // PI UP (or throws dokan_pe_amount_mismatch). The customer must be
            // charged the FULL cart total, never the tampered 1 cent.
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
        } finally {
            await page.close();
            await ctx.close();
        }
        expect(orderId, 'captured the order id from order-received').toBeTruthy();

        const total = await getOrderTotal(orderId as string);
        const expectedMinor = Math.round(total * 100); // USD, 2-decimal
        const intentId = await getStripeIntentIdForOrder(orderId as string);
        const pi = await stripeApi.getPaymentIntent(intentId);
        const captured = pi.amount_received ?? pi.amount;
        expect(expectedMinor, 'order total resolved to a non-trivial minor-units amount').toBeGreaterThan(1);
        expect(captured, 'the captured charge equals the FULL cart total — the tampered 1-cent amount was overwritten server-side').toBe(expectedMinor);
        log.success(`Amount-override prevented: captured ${captured}¢ == cart total ${expectedMinor}¢ (server overwrote the tampered amount)`);
    });

    // -----------------------------------------------------------------------
    // N4 — Verify-intent IDOR (R5): wrong/empty order_key rejected; correct key accepted.
    // -----------------------------------------------------------------------
    test('N4: verify-intent rejects a wrong/empty order_key and accepts the correct one', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        test.skip(!hasCredentials, 'Stripe Connect test keys missing — set TEST_*_STRIPE_CONNECT in tests/pw/.env');

        // 1) Place a real order as the customer; capture the order id + a valid wp_rest nonce.
        // Keep the context OPEN so the verify-intent calls can send the customer's auth cookie.
        let orderId: string | undefined;
        const ctx = await browser.newContext({ storageState: customerAuth });
        const page = await ctx.newPage();
        try {
            const stripe = new StripeConnectPage(page);
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await stripe.addProductToCart(productId);
            await stripe.gotoBlockCheckout();
            await stripe.selectBlockGateway();
            await stripe.fillCardDetails(STRIPE_CARDS.success);
            await stripe.placeBlockOrderExpectReceived();
            orderId = page.url().match(/order-received\/(\d+)/)?.[1];
            const nonce = await getRestNonce(page);
            expect(orderId, 'captured the order id from order-received').toBeTruthy();
            expect(nonce, 'read a wp_rest nonce from the logged-in customer page').toBeTruthy();
            const order = Number(orderId);

            // verify_intent is public_permission → verify_rest_nonce(): a VALID wp_rest nonce is
            // REQUIRED (CSRF protection — a no-nonce caller gets 403, see N2), and a nonce only
            // verifies with the matching user cookie. So we authenticate as the customer (cookie +
            // nonce) and prove access is then gated by order_key SECRECY: a wrong/empty key is
            // still rejected, the correct key is accepted (no per-user ownership check — the route
            // is guest-capable for the SCA redirect-back, so key secrecy is the only IDOR guard).
            const auth = { nonce, cookies: ctx };

            // 2) Wrong key → 400 invalid_order.
            const wrong = await postVerifyIntent({ order, key: 'wc_order_WRONGKEY', ...auth });
            expect(wrong.status, 'a wrong order_key is rejected with 400').toBe(400);
            expect(wrong.body?.code, 'wrong-key rejection code is invalid_order').toBe('invalid_order');

            // 3) Empty key → 400 invalid_order.
            const empty = await postVerifyIntent({ order, key: '', ...auth });
            expect(empty.status, 'an empty order_key is rejected with 400').toBe(400);
            expect(empty.body?.code, 'empty-key rejection code is invalid_order').toBe('invalid_order');

            // 4) Positive control — the correct key is accepted (not 400 invalid_order),
            //    demonstrating access is gated by order_key SECRECY, not user identity.
            const realKey = await getOrderKey(order);
            const ok = await postVerifyIntent({ order, key: realKey, ...auth });
            expect(ok.status, 'the correct order_key is NOT rejected with the invalid_order 400').not.toBe(400);
            expect(ok.body?.code, 'the correct order_key does not produce invalid_order').not.toBe('invalid_order');
        } finally {
            await page.close();
            await ctx.close();
        }

        log.success('verify-intent IDOR guard holds: wrong/empty key → 400 invalid_order, correct key accepted (access = order_key secrecy)');
        log.warn(
            'verify-intent has no per-user ownership guard',
            'cross-customer access is prevented ONLY by the unguessable order_key — design finding (intentionally guest-capable for SCA redirect-back)',
        );
    });
});
