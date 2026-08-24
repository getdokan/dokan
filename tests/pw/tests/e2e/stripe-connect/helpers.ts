import { request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { ensureStripeExpressConfigured } from '../stripe-express/helpers';
import { STRIPE_CONNECT_KEYS, STRIPE_CONNECT_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS } from './stripeConnectPage';

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
