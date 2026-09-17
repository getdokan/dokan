import { request, Browser } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { stripeConnectApi } from '@utils/stripeApi';
import { ensureStripeExpressConfigured } from '../stripe-express/helpers';
import { vendorAuth as vendorAuthState, VENDOR_ID as VENDOR_ID_VALUE } from '../stripe-express/helpers';
import { STRIPE_CONNECT_KEYS, STRIPE_CONNECT_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS, StripeConnectPage, STRIPE_CARDS } from './stripeConnectPage';

declare const process: { env: Record<string, string | undefined> };

/**
 * Order/address/status helpers that are gateway-agnostic already live in the Stripe Express
 * helper. They are re-exported here rather than copied so there is one implementation to fix:
 * nothing in them mentions a gateway, they only read WC REST. If they ever need to move, the
 * move is `utils/`, not a second copy.
 */
export {
    adminAuth,
    vendorAuth,
    vendor2Auth,
    customerAuth,
    VENDOR_ID,
    VENDOR2_ID,
    CUSTOMER_ID,
    ensureBillingAddress,
    ensureCustomerAddress,
    ensureVendorStoreAddress,
    ensureClassicCheckoutPage,
    getOrderMetaValue,
    getOrderStatus,
    getOrderNotes,
    setOrderMeta,
    setOrderStatus,
} from '../stripe-express/helpers';

export { STRIPE_CONNECT_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS };

// Test-support mu-plugin namespace (dokan-stripe-connect-test-helpers.php).
const TEST_NS = `${SERVER_URL}/dokan-test-connect/v1`;

export const MODULE_STRIPE_CONNECT = 'stripe';
export const MODULE_STRIPE_EXPRESS = 'stripe_express';

/** WC order meta holding the Stripe PaymentIntent id (Connect, unlike Express, uses the plain WC key). */
export const CONNECT_INTENT_META_KEY = '_stripe_intent_id';

/**
 * Credentials gate. Building the suite never needs keys; running the gateway/checkout steps
 * does. Connect additionally needs a CLIENT ID: `Helper::is_ready()` returns false without one
 * (`modules/stripe/includes/Helper.php:50`), so the gateway never reaches checkout — a key pair
 * alone is not enough, which is the difference from Express.
 */
export const hasCredentials = Boolean(STRIPE_CONNECT_KEYS.publishable && STRIPE_CONNECT_KEYS.secret && STRIPE_CONNECT_KEYS.clientId);

/** The Connect webhook endpoint slug uses UNDERSCORES (`woocommerce_api_dokan_stripe`). */
export const WEBHOOK_URL = `${(process.env.BASE_URL ?? 'http://localhost:9999').replace(/\/$/, '')}/?wc-api=dokan_stripe`;

/* ------------------------------------------------------------------ */
/* Gateway / module configuration                                      */
/* ------------------------------------------------------------------ */

async function adminContext() {
    return request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
}

export interface ConnectConfigResult {
    ok: boolean;
    skipped?: string;
    stripe_active?: boolean;
    stripe_express_active?: boolean;
    gateway_configured?: boolean;
    withdraw_method_enabled?: boolean;
    api_ready?: boolean;
}

/**
 * Idempotently configure Stripe Connect on the current site via the test mu-plugin: activate the
 * `stripe` module, deactivate the conflicting `stripe_express` module, write the gateway test
 * keys + client id, enable the withdraw method. No-op without keys (the @pro specs self-skip).
 *
 * Only ONE Stripe gateway can own the checkout at a time, so calling this turns Stripe Express
 * OFF. Every Connect spec file pairs it with restoreStripeExpress() in afterAll so an Express
 * spec sharing the shard still finds its own gateway configured.
 */
export async function ensureStripeConnectConfigured(settings?: Record<string, string>): Promise<ConnectConfigResult> {
    if (!hasCredentials) {
        return { ok: false, skipped: 'no_credentials' };
    }
    const ctx = await adminContext();
    try {
        const res = await ctx.post(`${TEST_NS}/configure-stripe-connect`, {
            data: {
                publishable: STRIPE_CONNECT_KEYS.publishable,
                secret: STRIPE_CONNECT_KEYS.secret,
                client_id: STRIPE_CONNECT_KEYS.clientId,
                ...(settings ? { settings } : {}),
            },
        });
        const body = (await res.json().catch(() => ({}))) as ConnectConfigResult;
        if (!res.ok()) {
            throw new Error(`configure-stripe-connect failed (${res.status()}): ${JSON.stringify(body).slice(0, 300)}`);
        }
        return body;
    } finally {
        await ctx.dispose();
    }
}

/**
 * Put Stripe Express back as the active Stripe gateway. Call in afterAll of every Connect spec
 * file. Reuses the Express helper's own configure route, which already performs the mirror-image
 * module flip — there is deliberately no second "restore" endpoint to keep in sync.
 */
export async function restoreStripeExpress(): Promise<void> {
    await ensureStripeExpressConfigured();
}

/** Merge gateway-settings overrides (e.g. seller_pays_the_processing_fee, enable_3d_secure). */
export async function setConnectGatewaySettings(settings: Record<string, string>): Promise<void> {
    const ctx = await adminContext();
    try {
        const res = await ctx.post(`${TEST_NS}/configure-stripe-connect`, { data: { settings } });
        if (!res.ok()) {
            throw new Error(`set connect settings failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Connected-vendor seeding (scalar meta, unlike Express's array)      */
/* ------------------------------------------------------------------ */

/**
 * Seed a vendor as a CONNECTED Stripe account without driving the OAuth flow. Connect stores a
 * plain `acct_…` string in `dokan_connected_vendor_id`, not Express's account_info array. Pass a
 * REAL account reachable by the platform key for transfer assertions; a placeholder only renders
 * the connected UI.
 */
export async function seedStripeConnectVendor(vendorId: string | number, accountId: string, accessKey?: string): Promise<void> {
    const ctx = await adminContext();
    try {
        const res = await ctx.post(`${TEST_NS}/seed-connect-vendor`, {
            data: { vendor_id: Number(vendorId), account_id: accountId, ...(accessKey ? { access_key: accessKey } : {}) },
        });
        if (!res.ok()) {
            throw new Error(`seed-connect-vendor failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
    } finally {
        await ctx.dispose();
    }
}

/** Undo seedStripeConnectVendor — restores the vendor to "not connected". */
export async function removeStripeConnectVendor(vendorId: string | number): Promise<void> {
    const ctx = await adminContext();
    try {
        await ctx.post(`${TEST_NS}/clear-connect-vendor`, { data: { vendor_id: Number(vendorId) } });
    } finally {
        await ctx.dispose();
    }
}

/** Seed vendor1 + vendor2 as connected, using the real accounts when they are configured. */
export async function seedBothConnectedVendors(vendorId: string | number, vendor2Id: string | number): Promise<void> {
    await seedStripeConnectVendor(vendorId, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor1);
    await seedStripeConnectVendor(vendor2Id, STRIPE_CONNECT_CONNECTED_ACCOUNTS.vendor2);
}

/* ------------------------------------------------------------------ */
/* Order / Stripe inspection                                           */
/* ------------------------------------------------------------------ */

/** Resolve the Stripe PaymentIntent id for a WC order (from its `_stripe_intent_id` meta). */
export async function getConnectIntentIdForOrder(orderId: string | number): Promise<string> {
    const ctx = await adminContext();
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=meta_data`);
        const body = (await res.json()) as { meta_data: Array<{ key: string; value: string }> };
        const intentId = body.meta_data.find(m => m.key === CONNECT_INTENT_META_KEY)?.value;
        if (!intentId) {
            throw new Error(`order ${orderId} has no Stripe PaymentIntent meta (${CONNECT_INTENT_META_KEY})`);
        }
        return String(intentId);
    } finally {
        await ctx.dispose();
    }
}

/**
 * Sub-order ids of a Dokan parent order (empty for a single-vendor order).
 *
 * Filtered client-side on `parent_id` rather than with the WC REST `?parent=` query: that query
 * returns an empty array on this build even when the sub-orders demonstrably exist, which would
 * read as "the cart never split" and turn a working split into a false failure.
 */
export async function getSubOrderIds(parentOrderId: string | number): Promise<number[]> {
    const ctx = await adminContext();
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=50&orderby=date&order=desc&_fields=id,parent_id`);
        const orders = (await res.json().catch(() => [])) as Array<{ id: number; parent_id: number }>;
        return Array.isArray(orders) ? orders.filter(o => Number(o.parent_id) === Number(parentOrderId)).map(o => Number(o.id)) : [];
    } finally {
        await ctx.dispose();
    }
}

/** Newest dokan-stripe-connect order id (0 if none) — a baseline to pin new orders against. */
export async function getLatestConnectOrderId(): Promise<number> {
    const ctx = await adminContext();
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=20&orderby=date&order=desc&_fields=id,payment_method`);
        const orders = (await res.json().catch(() => [])) as Array<{ id: number; payment_method: string }>;
        const o = Array.isArray(orders) ? orders.find(x => x.payment_method === 'dokan-stripe-connect') : undefined;
        return o ? Number(o.id) : 0;
    } finally {
        await ctx.dispose();
    }
}

/**
 * The newest PAID Stripe Connect order created after `baseline`, or 0 if there is none.
 *
 * A failed payment still leaves a pending order behind, so "no newer order id" is the wrong test
 * for a decline: it fails on correct behaviour. What must not happen is a newer order reaching a
 * paid status.
 */
export async function latestPaidConnectOrderAfter(baseline: number): Promise<number> {
    const ctx = await adminContext();
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=20&orderby=date&order=desc&_fields=id,status,payment_method`);
        const orders = (await res.json().catch(() => [])) as Array<{ id: number; status: string; payment_method: string }>;
        const hit = Array.isArray(orders)
            ? orders.find(o => o.payment_method === 'dokan-stripe-connect' && Number(o.id) > baseline && /processing|completed/.test(o.status))
            : undefined;
        return hit ? Number(hit.id) : 0;
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Refunds / webhooks                                                  */
/* ------------------------------------------------------------------ */

/** Trigger a Dokan API refund (method=1) → the Connect refund handler (Stripe refund + transfer reversal). */
export async function connectApiRefund(orderId: string | number, amount?: number): Promise<void> {
    const ctx = await adminContext();
    try {
        const data: Record<string, unknown> = { order_id: Number(orderId) };
        if (amount !== undefined) {
            data.amount = amount;
        }
        const res = await ctx.post(`${TEST_NS}/refund`, { data, timeout: 90_000 });
        const body = await res.json().catch(() => ({}));
        if (!res.ok()) {
            throw new Error(`Connect API refund failed (${res.status()}): ${JSON.stringify(body)}`);
        }
    } finally {
        await ctx.dispose();
    }
}

export interface WebhookInjectResult {
    ok: boolean;
    type: string;
    threw: boolean;
    fatal: boolean;
    error: string | null;
}

/**
 * Inject a Stripe webhook event DIRECTLY into the module's EventFactory via the mu-plugin,
 * bypassing the live endpoint's Event::retrieve() re-fetch. Lets the suite drive duplicate and
 * out-of-order deliveries that Stripe will not send to a localhost site.
 */
export async function injectConnectWebhook(payload: { type: string; data_object: Record<string, unknown>; account?: string }): Promise<WebhookInjectResult> {
    const ctx = await adminContext();
    try {
        const res = await ctx.post(`${TEST_NS}/connect-webhook`, { data: payload, timeout: 90_000 });
        const body = (await res.json().catch(() => ({}))) as WebhookInjectResult;
        if (!res.ok()) {
            throw new Error(`connect-webhook injection failed (${res.status()}): ${JSON.stringify(body)}`);
        }
        return body;
    } finally {
        await ctx.dispose();
    }
}

/**
 * POST a Stripe event to the live gateway webhook endpoint, UNSIGNED. Logged out
 * (`Authorization: ''`) so the api.config admin auth does not leak in and turn an
 * unauthenticated-caller test into an authenticated one. Returns the HTTP status.
 */
export async function postConnectWebhookEvent(event: { id: string; type: string; account?: string | null }, userAgent?: string): Promise<number> {
    const headers: Record<string, string> = { Authorization: '' };
    if (userAgent !== undefined) {
        headers['User-Agent'] = userAgent;
    }
    const ctx = await request.newContext({ extraHTTPHeaders: headers });
    try {
        const res = await ctx.post(WEBHOOK_URL, { data: { id: event.id, type: event.type, account: event.account ?? null } });
        return res.status();
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Vendor subscription                                                 */
/* ------------------------------------------------------------------ */

/**
 * Toggle the Vendor Subscription feature (`dokan_product_subscription[enable_pricing]`).
 *
 * The module returns early on init when this is off, which gates BOTH the vendor dashboard
 * subscription route and the site-wide product-publish hooks. Enabling therefore takes two
 * requests: write the option, then flush rewrites in a SEPARATE request whose bootstrap
 * re-reads the flag as on and registers the dashboard endpoint before the flush runs.
 *
 * Teardown must call this with `false`, or every later spec sharing this database finds its
 * vendors unable to publish a product and reads that as a product bug.
 */
export async function setVendorSubscriptionFeature(enabled: boolean): Promise<void> {
    const ctx = await adminContext();
    try {
        const res = await ctx.post(`${TEST_NS}/set-vendor-subscription`, { data: { enable: enabled } });
        if (!res.ok()) {
            throw new Error(`set-vendor-subscription failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
        const body = (await res.json().catch(() => ({}))) as { enable_pricing?: string };
        const want = enabled ? 'on' : 'off';
        if (body.enable_pricing !== want) {
            throw new Error(`enable_pricing did not stick: wanted ${want}, stored ${body.enable_pricing}`);
        }
        if (enabled) {
            const flush = await ctx.post(`${TEST_NS}/flush-rewrites`);
            if (!flush.ok()) {
                throw new Error(`flush-rewrites failed (${flush.status()}): ${(await flush.text()).slice(0, 200)}`);
            }
        }
    } finally {
        await ctx.dispose();
    }
}

/**
 * Activate or deactivate a Dokan Pro module by slug, and return what the option row actually
 * holds afterwards rather than what we asked for.
 */
export async function setDokanModule(slug: string, enable: boolean): Promise<boolean> {
    const ctx = await adminContext();
    try {
        const res = await ctx.post(`${TEST_NS}/set-module`, { data: { slug, enable } });
        if (!res.ok()) {
            throw new Error(`set-module ${slug} failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
        const body = (await res.json().catch(() => ({}))) as { active?: boolean };
        return Boolean(body.active);
    } finally {
        await ctx.dispose();
    }
}

/**
 * Delete a user's saved cards.
 *
 * A token left by an earlier spec is pre-selected at the next checkout, so a case meaning to enter a
 * card reuses a token instead. Measured on 2026-08-28: every pack order that reused one stale token
 * confirmed at Stripe and then sat at `pending`, because that path returns no redirect and localhost
 * receives no webhook to settle it. Every pack order that entered a fresh card settled normally.
 */
export async function deleteSavedCards(userId: string | number): Promise<void> {
    const ctx = await adminContext();
    try {
        const res = await ctx.post(`${TEST_NS}/delete-payment-tokens`, { data: { user_id: Number(userId) } });
        if (!res.ok()) {
            throw new Error(`delete-payment-tokens failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
        const body = (await res.json().catch(() => ({}))) as { remaining?: number };
        if (Number(body.remaining ?? 0) !== 0) {
            throw new Error(`saved cards were not cleared for user ${userId}: ${body.remaining} remain`);
        }
    } finally {
        await ctx.dispose();
    }
}

/**
 * Seed a vendor-subscription pack. REST rejects the `product_pack` type outright, so the pack is
 * created as a simple product and its type term is swapped in the database afterwards.
 * Returns `[packId, packName]`.
 */
export async function seedSubscriptionPack(payload: object, extraMeta: Array<[string, string]> = []): Promise<[string, string]> {
    await setVendorSubscriptionFeature(true);
    await dbUtils.setSubscriptionProductType();
    const api = new ApiUtils(await request.newContext());
    const [, id, name] = await api.createProduct(payload, payloads.adminAuth);
    await dbUtils.updateProductType(id);
    await dbUtils.setPostMeta(id, '_subscription_product_admin_commission_type', 'percentage', false);
    await dbUtils.setPostMeta(id, '_subscription_product_admin_commission', '10', false);
    for (const [k, v] of extraMeta) {
        await dbUtils.setPostMeta(id, k, v, false);
    }
    return [id, name];
}

/**
 * Buy a pack as the vendor through the block checkout, from a clean cart and a cleared
 * subscription state. Returns the order id parsed off the order-received URL.
 */
export async function buyPackExpectReceived(browser: Browser, packId: string, card: string = STRIPE_CARDS.success): Promise<string | undefined> {
    const ctx = await browser.newContext({ storageState: vendorAuthState });
    const page = await ctx.newPage();
    try {
        const stripe = new StripeConnectPage(page);
        await dbUtils.clearCustomerCart(VENDOR_ID_VALUE);
        await dbUtils.removeVendorSubscription(VENDOR_ID_VALUE);
        // Start from no saved cards so the pack is always paid with a freshly entered one, which is
        // what these cases claim to exercise.
        await deleteSavedCards(VENDOR_ID_VALUE);
        await stripe.addProductToCart(packId);

        // The one-active-subscription guard empties the cart rather than reporting anything, so a
        // pack that failed to land produces a checkout bounce and then a timeout on a button that
        // never appears. Check the cart directly and say what happened.
        const inCart = await page.evaluate(async () => {
            const res = await fetch('/wp-json/wc/store/v1/cart', { credentials: 'include' });
            const cart = (await res.json()) as { items?: Array<{ id: number }> };
            return (cart.items ?? []).map(i => Number(i.id));
        });
        if (!inCart.includes(Number(packId))) {
            throw new Error(
                `pack ${packId} did not stay in the vendor's cart (cart holds: ${JSON.stringify(inCart)}). ` +
                    'The usual cause is the vendor still holding an active subscription, which makes the ' +
                    'module empty the cart on add.',
            );
        }

        await stripe.gotoBlockCheckout();
        await stripe.selectBlockGateway();
        await stripe.fillCardDetails(card);
        // Take the id the page object resolved rather than re-parsing the URL. It can settle through
        // a polling fallback that never navigates, in which case the URL still holds the checkout and
        // a URL-derived id comes back undefined even though the order exists and was paid.
        const orderId = await stripe.placeBlockOrderExpectReceived();
        return orderId || page.url().match(/order-received\/(\d+)/)?.[1];
    } finally {
        await page.close();
        await ctx.close();
    }
}

/**
 * Cancel every live Stripe subscription these tests created, reset the vendor, restore the
 * feature flag and trash the pack.
 *
 * The vendor's own `_stripe_subscription_id` meta is read as well as the caller's captured ids:
 * a test that threw before capturing one still leaves a real subscription billing in Stripe, and
 * `removeVendorSubscription` is about to wipe the only record of it.
 */
export async function cleanupSubscription(packId: string | undefined, subIds: string[] = []): Promise<void> {
    if (stripeConnectApi.hasSecretKey()) {
        const metaSub = await dbUtils.getUserMetaValue(VENDOR_ID_VALUE, '_stripe_subscription_id');
        const toCancel = [...new Set([...subIds, metaSub].filter((s): s is string => !!s && /^sub_/.test(s)))];
        for (const s of toCancel) {
            await stripeConnectApi.cancelSubscription(s);
        }
    }
    await dbUtils.removeVendorSubscription(VENDOR_ID_VALUE);
    await dbUtils.clearCustomerCart(VENDOR_ID_VALUE);
    // The feature flag is deliberately NOT flipped off here. Turning it off after every describe and
    // back on in the next one leaves a window where the subscription module is half-initialised, and
    // its own guard then empties the pack out of the cart: the checkout bounces to an empty cart and
    // the next case waits for a place-order button that will never render. `stripeConnectZzTeardown`
    // turns it off once, at the end of the folder, which is the only place it needs to happen.
    if (packId) {
        const ctx = await adminContext();
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${packId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    }
}

/* ------------------------------------------------------------------ */
/* WooCommerce Subscriptions renewals                                  */
/* ------------------------------------------------------------------ */

export interface RenewalResult {
    ok: boolean;
    subscription_id: number;
    renewal_order: number;
    gateway: string;
    status: string | null;
    total: number | null;
}

/**
 * Drive a real renewal for the subscription attached to `orderId` (or for `subscriptionId`
 * directly). This fires the gateway's own scheduled-payment hook, so the stored token is charged,
 * the vendor transfers are created and the balance ledger is written for real.
 */
export async function forceRenewal(opts: { orderId?: string | number; subscriptionId?: string | number }): Promise<RenewalResult> {
    const ctx = await adminContext();
    try {
        const res = await ctx.post(`${TEST_NS}/force-renewal`, {
            data: { order_id: opts.orderId ?? 0, subscription_id: opts.subscriptionId ?? 0 },
            timeout: 120_000,
        });
        const body = (await res.json().catch(() => ({}))) as RenewalResult;
        if (!res.ok()) {
            throw new Error(`force-renewal failed (${res.status()}): ${JSON.stringify(body).slice(0, 300)}`);
        }
        return body;
    } finally {
        await ctx.dispose();
    }
}

/**
 * A vendor's withdrawable balance as the vendor themselves sees it, read through the Dokan REST
 * API rather than the ledger tables. This is the surface the renewal double-withdraw bug exposed.
 */
export async function getVendorBalance(auth: Record<string, string>): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: auth });
    try {
        const res = await ctx.get(`${SERVER_URL}/dokan/v1/withdraw/balance`);
        if (!res.ok()) {
            throw new Error(`withdraw/balance failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
        const body = (await res.json().catch(() => ({}))) as { current_balance?: number | string };
        return Number(body.current_balance ?? 0);
    } finally {
        await ctx.dispose();
    }
}

/**
 * Put the shared customer actor back on the `customer` role.
 *
 * WooCommerce Subscriptions promotes a buyer to `subscriber` when a subscription is created, and
 * that REPLACES `customer` rather than adding to it. Both the role and the actor are global, so a
 * spec that buys a subscription and does not restore it leaves every later spec with a customer who
 * is no longer a customer. Dokan's RMA REST create then refuses with 403 "Only customers can create
 * warranty requests" — which is exactly how vendorReturnRequest failed on CI run 33590556960 while
 * passing locally, and why its isolation re-run failed too: the damage is persistent, not transient.
 */
export async function restoreCustomerRole(customerId: string | number): Promise<void> {
    const ctx = await adminContext();
    try {
        const res = await ctx.post(`${SERVER_URL}/wp/v2/users/${Number(customerId)}`, { data: { roles: ['customer'] } });
        if (!res.ok()) {
            throw new Error(`could not restore the customer role (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
    } finally {
        await ctx.dispose();
    }
}
