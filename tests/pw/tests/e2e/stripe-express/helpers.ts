import { expect, request, Browser } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeExpressPage, STRIPE_EXPRESS_KEYS, STRIPE_CARDS, STRIPE_EXPRESS_CONNECTED_ACCOUNTS, HAS_REAL_CONNECTED_ACCOUNTS } from './stripeExpressPage';
import path from 'path';

declare const process: { env: Record<string, string | undefined> };

export const adminAuth = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
export const vendorAuth = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
export const vendor2Auth = path.join(__dirname, '../../../playwright/.auth/vendor2StorageState.json');
export const vendor3Auth = path.join(__dirname, '../../../playwright/.auth/vendor3StorageState.json');
export const customerAuth = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

export const VENDOR_ID = process.env.VENDOR_ID ?? '3';
export const VENDOR2_ID = process.env.VENDOR2_ID ?? '5';
/** vendor3 is NEVER seeded with an Express account — the permanent non-connected vendor. */
export const VENDOR3_ID = process.env.VENDOR3_ID ?? '6';
export const CUSTOMER_ID = process.env.CUSTOMER_ID ?? '2';

// Test-support mu-plugin namespace (dokan-stripe-express-test-helpers.php).
const TEST_NS = `${SERVER_URL}/dokan-test-express/v1`;

export const MODULE_STRIPE = 'stripe';
export const MODULE_STRIPE_EXPRESS = 'stripe_express';
export const MODULE_PRODUCT_SUBSCRIPTION = 'product_subscription';

// Credentials gate. Building the suite never needs keys; running the gateway/checkout
// steps does. Express has NO OAuth client id, so `hasCredentials` (pub+secret) is the
// only gate for the gateway becoming "ready". Money/transfer assertions additionally
// need real connected accounts the platform key can reach (HAS_REAL_CONNECTED_ACCOUNTS).
export const hasCredentials = Boolean(STRIPE_EXPRESS_KEYS.publishable && STRIPE_EXPRESS_KEYS.secret);
export { HAS_REAL_CONNECTED_ACCOUNTS, STRIPE_EXPRESS_CONNECTED_ACCOUNTS };

// The Express webhook endpoint slug uses HYPHENS (gateway id uses underscores).
export const WEBHOOK_URL = `${(process.env.BASE_URL ?? 'http://localhost:9999').replace(/\/$/, '')}/?wc-api=dokan-stripe-express`;

/** Order-meta key holding the Stripe PaymentIntent id (HPOS-safe via REST meta_data). */
const INTENT_META_KEYS = ['_dokan_stripe_express_payment_intent_id'];

/* ------------------------------------------------------------------ */
/* Gateway / module configuration                                      */
/* ------------------------------------------------------------------ */

/**
 * Idempotently configure Stripe Express on the current site via the test mu-plugin:
 * activate the stripe_express (+ product_subscription) modules, deactivate the legacy
 * stripe (Connect) module (they conflict), write the gateway settings from the env test
 * keys, and enable the withdraw method. No-op without keys (the @pro specs self-skip).
 */
export async function ensureStripeExpressConfigured(): Promise<void> {
    if (!hasCredentials) {
        return;
    }
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.post(`${TEST_NS}/configure-stripe-express`, {
            // Canonical baseline: ON_ORDER_COMPLETED so a vendor Transfer fires synchronously when an
            // order completes (every transfer assertion depends on this). A fresh CI env has no sticky
            // gateway state, so the disburse mode must be set here, not assumed from a prior run.
            data: {
                publishable: STRIPE_EXPRESS_KEYS.publishable,
                secret: STRIPE_EXPRESS_KEYS.secret,
                // `allow_non_connected_sellers` is pinned to 'no' rather than left to the
                // gateway default: SE-PAY-03/-11, SE-REF-06 and SE-EDGE-05 assert that Express
                // REFUSES a non-connected vendor's cart, which is only true while the toggle is
                // off. Without the pin, a prior spec that turned it on would silently invert them.
                settings: { disburse_mode: 'ON_ORDER_COMPLETED', allow_non_connected_sellers: 'no' },
            },
        });
        if (!res.ok()) {
            throw new Error(`configure-stripe-express failed (${res.status()}): ${(await res.text()).slice(0, 300)}`);
        }
    } finally {
        await ctx.dispose();
    }
}

/**
 * Merge arbitrary gateway-settings overrides via the mu-plugin (e.g. sellers_pay_processing_fee,
 * capture, disburse_mode, saved_cards, enabled). Tests change settings THIS way rather than via the
 * WC React settings UI, whose Save button stays `disabled` until the form is dirtied (flaky to drive).
 */
export async function setExpressGatewaySettings(settings: Record<string, string>): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.post(`${TEST_NS}/configure-stripe-express`, { data: { settings } });
        if (!res.ok()) {
            throw new Error(`set express settings failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
    } finally {
        await ctx.dispose();
    }
}

/** Set the Stripe Express gateway DESCRIPTION via the mu-plugin (used by the stored-XSS test). */
export async function setGatewayDescription(description: string): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.post(`${TEST_NS}/configure-stripe-express`, { data: { description } });
        if (!res.ok()) {
            throw new Error(`set gateway description failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Connected-vendor seeding (account_info ARRAY meta, PHP-native)      */
/* ------------------------------------------------------------------ */

/**
 * Seed a vendor as a CONNECTED Express account WITHOUT driving the Stripe-hosted
 * onboarding. Pass a REAL `acct_…` (reachable by the platform key) for transfer/refund
 * money assertions; a placeholder only renders the connected UI + allows the platform
 * charge. Writes the mode-correct account_info array meta.
 */
export async function seedStripeExpressConnectedVendor(vendorId: string | number, accountId: string): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.post(`${TEST_NS}/seed-express-vendor`, { data: { vendor_id: Number(vendorId), account_id: accountId } });
        if (!res.ok()) {
            throw new Error(`seed-express-vendor failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
    } finally {
        await ctx.dispose();
    }
}

/** Undo seedStripeExpressConnectedVendor — restores the vendor to "not connected". */
export async function removeStripeExpressConnectedVendor(vendorId: string | number): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.post(`${TEST_NS}/clear-express-vendor`, { data: { vendor_id: Number(vendorId) } });
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Customer address / checkout pages                                   */
/* ------------------------------------------------------------------ */

/** Give a user a saved billing+shipping address so the block checkout pre-fills. */
export async function ensureBillingAddress(userId: string | number): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.put(`${SERVER_URL}/wc/v3/customers/${userId}`, {
            data: { billing: payloads.createOrder.billing, shipping: payloads.createOrder.shipping },
        });
    } finally {
        await ctx.dispose();
    }
}

export async function ensureCustomerAddress(): Promise<void> {
    await ensureBillingAddress(CUSTOMER_ID);
}

/**
 * Ensure a vendor's Dokan STORE address has a (supported) country. The Express onboarding
 * template only renders the Connect button when the store address country is set + supported;
 * otherwise it shows an "Update your store address" guard. Required before any not-connected
 * onboarding assertion (SE-ONB-01/02/06). Deep-merges into dokan_profile_settings.
 */
export async function ensureVendorStoreAddress(vendorId: string | number, country = 'US'): Promise<void> {
    await dbUtils.updateUserMeta(
        String(vendorId),
        'dokan_profile_settings',
        { address: { street_1: '123 Test St', city: 'New York', zip: '10001', state: 'NY', country } },
        true,
    );
}

/** Ensure a [woocommerce_checkout] shortcode page exists at /classic-checkout/ (idempotent). */
export async function ensureClassicCheckoutPage(): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wp/v2/pages?slug=classic-checkout&status=publish`);
        const pages = (await res.json().catch(() => [])) as unknown[];
        if (!Array.isArray(pages) || pages.length === 0) {
            await ctx.post(`${SERVER_URL}/wp/v2/pages`, {
                data: { title: 'Classic Checkout', slug: 'classic-checkout', status: 'publish', content: '[woocommerce_checkout]' },
            });
        }
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Order / Stripe inspection (HPOS-safe via REST meta_data)            */
/* ------------------------------------------------------------------ */

/** Resolve the Stripe PaymentIntent id for a WC order (from its meta). */
export async function getStripeIntentIdForOrder(orderId: string | number): Promise<string> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=meta_data`);
        const body = (await res.json()) as { meta_data: Array<{ key: string; value: string }> };
        const intentId = body.meta_data.find(m => INTENT_META_KEYS.includes(m.key))?.value;
        if (!intentId) {
            throw new Error(`order ${orderId} has no Stripe PaymentIntent meta`);
        }
        return String(intentId);
    } finally {
        await ctx.dispose();
    }
}

/** Resolve the Stripe charge id for a WC order (via its PaymentIntent's latest_charge). */
export async function getStripeChargeIdForOrder(orderId: string | number): Promise<string> {
    const intentId = await getStripeIntentIdForOrder(orderId);
    return stripeApi.getLatestChargeId(intentId);
}

/** Read a single order-meta value (admin auth). Returns undefined when the key is absent. */
export async function getOrderMetaValue(orderId: string | number, key: string): Promise<string | undefined> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=meta_data`);
        const body = (await res.json().catch(() => ({}))) as { meta_data?: Array<{ key: string; value: string }> };
        return (body.meta_data ?? []).find(m => m.key === key)?.value;
    } finally {
        await ctx.dispose();
    }
}

/** Read a WC order's current status (admin auth). Returns 'none' when the order is absent. */
export async function getOrderStatus(orderId: string | number): Promise<string> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=status`);
        const body = (await res.json().catch(() => ({}))) as { status?: string };
        return body.status ?? 'none';
    } finally {
        await ctx.dispose();
    }
}

/** Read a WC order's note strings (admin auth), newest first. */
export async function getOrderNotes(orderId: string | number): Promise<string[]> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}/notes?_fields=note&per_page=50`);
        const notes = (await res.json().catch(() => [])) as Array<{ note: string }>;
        return Array.isArray(notes) ? notes.map(n => n.note) : [];
    } finally {
        await ctx.dispose();
    }
}

/** Set/overwrite order meta (admin auth). Pass value '' to clear a key. */
export async function setOrderMeta(orderId: string | number, meta: Array<{ key: string; value: string }>): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.put(`${SERVER_URL}/wc/v3/orders/${orderId}`, { data: { meta_data: meta } });
        if (!res.ok()) {
            throw new Error(`setOrderMeta failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
    } finally {
        await ctx.dispose();
    }
}

/** Update a WC order's status via REST (admin auth) — e.g. to 'completed' to trigger ON_ORDER_COMPLETED disbursement. */
export async function setOrderStatus(orderId: string | number, status: string): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        // Completing an order can fire a SYNCHRONOUS Stripe Transfer (ON_ORDER_COMPLETED disbursement)
        // inside this request, so allow well beyond the 15s default request timeout.
        const res = await ctx.put(`${SERVER_URL}/wc/v3/orders/${orderId}`, { data: { status }, timeout: 90_000 });
        if (!res.ok()) {
            throw new Error(`setOrderStatus failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
    } finally {
        await ctx.dispose();
    }
}

/** Newest dokan_stripe_express order id (0 if none) — a baseline to pin against. */
export async function getLatestStripeOrderId(): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=10&orderby=date&order=desc&_fields=id,payment_method`);
        const orders = (await res.json().catch(() => [])) as Array<{ id: number; payment_method: string }>;
        const o = Array.isArray(orders) ? orders.find(x => x.payment_method === 'dokan_stripe_express') : undefined;
        return o ? Number(o.id) : 0;
    } finally {
        await ctx.dispose();
    }
}

/**
 * Assert that a NEW Stripe Express order (id > baseline) settled to a paid status. Used by
 * the 3DS tests, where the browser redirect to order-received is unreliable in automation —
 * we verify the order STATUS, not the URL.
 */
export async function assertStripeOrderSettledSince(baselineOrderId: number): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await expect
            .poll(
                async () => {
                    const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=10&orderby=date&order=desc&_fields=id,status,payment_method`);
                    const orders = (await res.json().catch(() => [])) as Array<{ id: number; status: string; payment_method: string }>;
                    const o = Array.isArray(orders) ? orders.find(x => x.payment_method === 'dokan_stripe_express' && Number(x.id) > baselineOrderId) : undefined;
                    return o ? o.status : 'none';
                },
                { message: 'a NEW Stripe Express order should settle to a paid status after SCA', timeout: 120_000 },
            )
            .toMatch(/processing|completed/);
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Refunds / webhooks                                                  */
/* ------------------------------------------------------------------ */

/** Trigger a Dokan API refund (method=1) via the mu-plugin → the Express refund handler (Stripe refund + transfer reversal). */
export async function expressApiRefund(orderId: string | number, amount?: number): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const data: Record<string, unknown> = { order_id: Number(orderId) };
        if (amount !== undefined) {
            data.amount = amount;
        }
        const res = await ctx.post(`${TEST_NS}/refund`, { data });
        const body = await res.json().catch(() => ({}));
        if (!res.ok()) {
            throw new Error(`Express API refund failed (${res.status()}): ${JSON.stringify(body)}`);
        }
    } finally {
        await ctx.dispose();
    }
}

/**
 * POST a Stripe event to the gateway webhook endpoint, UNSIGNED. With a webhook secret
 * configured the handler rejects it (signature mismatch); with no secret it falls back to
 * a user-agent check. Returns the HTTP status. Logged-out (Authorization:'' to avoid the
 * api.config admin-auth leak).
 */
export async function postWebhookEvent(event: { id: string; type: string; account?: string | null }, userAgent?: string): Promise<number> {
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

export interface WebhookInjectResult {
    ok: boolean;
    type: string;
    threw: boolean;
    fatal: boolean;
    error: string | null;
}

/**
 * Inject a Stripe webhook event DIRECTLY into the module's WebhookEvents factory + handler
 * via the mu-plugin (bypassing the live endpoint's signature check + Event re-fetch), so the
 * event need not exist in Stripe. Drives dispute / subscription-lifecycle / payout / out-of-order
 * events the suite can't get Stripe to deliver to localhost.
 */
export async function injectStripeWebhook(payload: { type: string; data_object: Record<string, unknown>; account?: string }): Promise<WebhookInjectResult> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.post(`${TEST_NS}/express-webhook`, { data: payload });
        const body = (await res.json().catch(() => ({}))) as WebhookInjectResult;
        if (!res.ok()) {
            throw new Error(`express-webhook injection failed (${res.status()}): ${JSON.stringify(body)}`);
        }
        return body;
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Product Advertisement (SE-PADV)                                     */
/* ------------------------------------------------------------------ */

export async function enableProductAdvertisement(cost = 15): Promise<{ base_product_id: number }> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.post(`${TEST_NS}/enable-product-advertisement`, { data: { cost } });
        const body = (await res.json().catch(() => ({}))) as { base_product_id: number };
        if (!res.ok()) {
            throw new Error(`enable-product-advertisement failed (${res.status()}): ${JSON.stringify(body)}`);
        }
        return body;
    } finally {
        await ctx.dispose();
    }
}

export async function isProductAdvertised(productId: string | number): Promise<boolean> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${TEST_NS}/is-product-advertised?product_id=${productId}`);
        const body = (await res.json().catch(() => ({}))) as { advertised?: boolean };
        return Boolean(body.advertised);
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Vendor subscription (SE-SUB)                                        */
/* ------------------------------------------------------------------ */

/** Toggle the Vendor Subscription feature (enable_pricing) + flush rewrites so the dashboard endpoint registers. */
export async function setVendorSubscriptionFeature(enabled: boolean): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const route = enabled ? 'enable-vendor-subscription' : 'disable-vendor-subscription';
        const res = await ctx.post(`${TEST_NS}/${route}`);
        if (!res.ok()) {
            throw new Error(`${route} failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
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
 * Seed a vendor-subscription pack: enable the feature, create it as a simple product via REST,
 * flip its type to product_pack in the DB (REST rejects the product_pack type), set a default
 * admin commission, apply any extra post-meta. Returns [packId, packName].
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

/** Buy a pack as the vendor through the block checkout (clean start). Returns the order id from order-received. */
export async function buyPackExpectReceived(browser: Browser, packId: string, card: string = STRIPE_CARDS.success): Promise<string | undefined> {
    const ctx = await browser.newContext({ storageState: vendorAuth });
    const page = await ctx.newPage();
    try {
        const stripe = new StripeExpressPage(page);
        await dbUtils.clearCustomerCart(VENDOR_ID);
        await dbUtils.removeVendorSubscription(VENDOR_ID);
        await stripe.addProductToCart(packId);
        await stripe.gotoBlockCheckout();
        await stripe.selectBlockGateway();
        await stripe.fillCardDetails(card);
        return await stripe.placeBlockOrderExpectReceived();
    } finally {
        await page.close();
        await ctx.close();
    }
}

/** Cancel any created Stripe subscriptions, reset the vendor's subscription state, restore the feature flag, trash the pack. */
export async function cleanupSubscription(packId: string | undefined, subIds: string[] = []): Promise<void> {
    if (stripeApi.hasSecretKey()) {
        const metaSub = await dbUtils.getUserMetaValue(VENDOR_ID, '_dokan_stripe_express_stripe_subscription_id');
        const toCancel = [...new Set([...subIds, metaSub].filter((s): s is string => !!s && /^sub_/.test(s)))];
        for (const s of toCancel) {
            await stripeApi.cancelSubscription(s);
        }
    }
    await dbUtils.removeVendorSubscription(VENDOR_ID);
    await dbUtils.clearCustomerCart(VENDOR_ID);
    await setVendorSubscriptionFeature(false);
    if (packId) {
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${packId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    }
}

/* ------------------------------------------------------------------ */
/* Vendor balance / earnings reads (non-connected-seller assertions)   */
/* ------------------------------------------------------------------ */

/** dbUtils keeps its table prefix module-private, so the direct reads below resolve it the same way. */
const DB = process.env.DB_PREFIX ?? 'wp';

/** A vendor's spendable balance, from the same endpoint the dashboard widget uses. */
export async function getVendorBalance(auth: Record<string, string>): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: auth });
    try {
        const res = await ctx.get(`${SERVER_URL}/dokan/v1/withdraw/balance`);
        const body = (await res.json().catch(() => ({}))) as { current_balance?: number };
        return Number(body.current_balance ?? 0);
    } finally {
        await ctx.dispose();
    }
}

/** The vendor earning Dokan credited for an order — what the admin owes when settling by hand. */
export async function getVendorEarningForOrder(orderId: string | number): Promise<number> {
    const rows = (await dbUtils.dbQuery(`SELECT net_amount FROM ${DB}_dokan_orders WHERE order_id = ?;`, [Number(orderId)])) as Array<{ net_amount: string }>;
    return Number(rows?.[0]?.net_amount ?? 0);
}

/**
 * The vendor-balance ledger row for an order, with `balance_date` normalised to epoch millis.
 * The mysql driver returns a Date for DATETIME columns but a string under `dateStrings`, so both
 * are handled — a held earning is matured to "now" instead of the withdraw threshold.
 */
export async function getBalanceRowForOrder(vendorId: string | number, orderId: string | number): Promise<{ debit: number; maturesAt: number } | undefined> {
    const rows = (await dbUtils.dbQuery(`SELECT debit, balance_date FROM ${DB}_dokan_vendor_balance WHERE vendor_id = ? AND trn_id = ? AND trn_type = 'dokan_orders';`, [Number(vendorId), Number(orderId)])) as Array<{ debit: string; balance_date: string | Date }>;
    const row = rows?.[0];
    if (!row) {
        return undefined;
    }
    const raw = row.balance_date;
    return { debit: Number(row.debit), maturesAt: raw instanceof Date ? raw.getTime() : new Date(String(raw).replace(' ', 'T')).getTime() };
}

/**
 * Sub-order id → vendor id for a multi-vendor parent. MUST be called AFTER the parent is
 * completed: completion regenerates the sub-orders, so ids captured before it are stale.
 */
export async function getSubOrdersByVendor(parentId: string | number): Promise<Map<number, number>> {
    const rows = (await dbUtils.dbQuery(
        `SELECT o.order_id, o.seller_id FROM ${DB}_dokan_orders o WHERE o.order_id IN (SELECT id FROM ${DB}_wc_orders WHERE parent_order_id = ?);`,
        [Number(parentId)],
    )) as Array<{ order_id: number; seller_id: number }>;
    return new Map((rows ?? []).map(r => [Number(r.order_id), Number(r.seller_id)]));
}
