import { expect, request, Browser } from '@utils/test';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { stripeApi } from '@utils/stripeApi';
import { StripeConnectPage, STRIPE_CONNECT_KEYS, STRIPE_CARDS } from './stripeConnectPage';
import path from 'path';

declare const process: { env: Record<string, string | undefined> };

export const adminAuth = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
export const vendorAuth = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
export const customerAuth = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');
export const VENDOR_ID = process.env.VENDOR_ID ?? '3';
export const VENDOR2_ID = process.env.VENDOR2_ID ?? '5';
export const CUSTOMER_ID = process.env.CUSTOMER_ID ?? '2';
export const SERVER_URL = process.env.SERVER_URL ?? 'http://localhost:9999/wp-json';

/**
 * Trigger a full API Dokan refund for an order via the test-support mu-plugin
 * (`dokan-test/v1/refund`). This fires `dokan_refund_request_created` with
 * method=1, which runs the gateway's process_3ds_refund → Stripe refund + vendor
 * transfer reversal. There is no public REST endpoint to create a Dokan refund.
 */
export async function dokanApiRefund(orderId: string | number, amount?: number): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const data: Record<string, unknown> = { order_id: Number(orderId) };
        if (amount !== undefined) {
            data.amount = amount;
        }
        const res = await ctx.post(`${SERVER_URL}/dokan-test/v1/refund`, { data });
        const body = await res.json().catch(() => ({}));
        if (!res.ok()) {
            throw new Error(`Dokan API refund failed (${res.status()}): ${JSON.stringify(body)}`);
        }
    } finally {
        await ctx.dispose();
    }
}

/**
 * Assert the newest Stripe Connect order settled to a paid status. Used by the
 * 3DS tests: completing the SCA challenge settles the ORDER server-side, but the
 * browser doesn't reliably redirect to order-received in automation — so we
 * verify the order status, not the URL.
 */
/** Newest dokan-stripe-connect order id (0 if none) — a baseline to pin against. */
export async function getLatestStripeOrderId(): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=10&orderby=date&order=desc&_fields=id,payment_method`);
        const orders = (await res.json().catch(() => [])) as Array<{ id: number; payment_method: string }>;
        const o = Array.isArray(orders) ? orders.find(x => x.payment_method === 'dokan-stripe-connect') : undefined;
        return o ? Number(o.id) : 0;
    } finally {
        await ctx.dispose();
    }
}

/**
 * Assert that a NEW Stripe Connect order (id > baseline, i.e. created by this
 * test) settled to a paid status. Pinning to "newer than baseline" prevents a
 * false PASS by re-reading a prior test's already-settled order — important for
 * the 3DS tests, where the browser redirect to order-received is unreliable.
 */
export async function assertStripeOrderSettledSince(baselineOrderId: number): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await expect
            .poll(
                async () => {
                    const res = await ctx.get(`${SERVER_URL}/wc/v3/orders?per_page=10&orderby=date&order=desc&_fields=id,status,payment_method`);
                    const orders = (await res.json().catch(() => [])) as Array<{ id: number; status: string; payment_method: string }>;
                    const o = Array.isArray(orders)
                        ? orders.find(x => x.payment_method === 'dokan-stripe-connect' && Number(x.id) > baselineOrderId)
                        : undefined;
                    return o ? o.status : 'none';
                },
                // Cold-start tolerant: after inline SCA the classic order settles
                // server-side (no localhost webhook), which is slow on the first cold
                // CI attempt (observed: still 'pending' at 60s, settled by ~35s when warm).
                { message: 'a NEW Stripe order (created by this test) should settle to a paid status after SCA', timeout: 120_000 },
            )
            .toMatch(/processing|completed/);
    } finally {
        await ctx.dispose();
    }
}

/** Resolve the Stripe charge id for a WC order (via its PaymentIntent meta). */
export async function getStripeChargeIdForOrder(orderId: string): Promise<string> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=meta_data`);
        const body = (await res.json()) as { meta_data: Array<{ key: string; value: string }> };
        const intentId = body.meta_data.find(m => m.key === '_stripe_intent_id' || m.key === 'dokan_stripe_intent_id')?.value;
        if (!intentId) {
            throw new Error(`order ${orderId} has no Stripe PaymentIntent meta`);
        }
        return await stripeApi.getLatestChargeId(String(intentId));
    } finally {
        await ctx.dispose();
    }
}

/** Resolve the Stripe PaymentIntent id for a WC order (from its meta). */
export async function getStripeIntentIdForOrder(orderId: string): Promise<string> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=meta_data`);
        const body = (await res.json()) as { meta_data: Array<{ key: string; value: string }> };
        const intentId = body.meta_data.find(m => m.key === '_stripe_intent_id' || m.key === 'dokan_stripe_intent_id')?.value;
        if (!intentId) {
            throw new Error(`order ${orderId} has no Stripe PaymentIntent meta`);
        }
        return String(intentId);
    } finally {
        await ctx.dispose();
    }
}

export const WEBHOOK_URL = `${(process.env.BASE_URL ?? 'http://localhost:9999').replace(/\/$/, '')}/?wc-api=dokan_stripe`;

/**
 * POST a Stripe event to the gateway webhook endpoint, UNSIGNED (the handler does
 * no signature verification — R2 — and re-fetches the event by id). Returns the
 * HTTP status. Used to simulate webhook delivery + replay.
 */
export async function postWebhookEvent(event: { id: string; type: string; account?: string | null }): Promise<number> {
    const ctx = await request.newContext({ extraHTTPHeaders: { Authorization: '' } });
    try {
        const res = await ctx.post(WEBHOOK_URL, { data: { id: event.id, type: event.type, account: event.account ?? null } });
        return res.status();
    } finally {
        await ctx.dispose();
    }
}

/** Give the customer a saved billing+shipping address so the block checkout pre-fills. */
export async function ensureCustomerAddress(): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        await ctx.put(`${SERVER_URL}/wc/v3/customers/${CUSTOMER_ID}`, {
            data: { billing: payloads.createOrder.billing, shipping: payloads.createOrder.shipping },
        });
    } finally {
        await ctx.dispose();
    }
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

export const MODULE_STRIPE = 'stripe';
export const MODULE_STRIPE_EXPRESS = 'stripe_express';
export const MODULE_PRODUCT_SUBSCRIPTION = 'product_subscription'; // "Vendor Subscription" module (vendors buy packs to sell)

// Credentials gate. Building the suite never requires keys; running the
// gateway/vendor steps does. `hasCredentials` => can configure the gateway.
// `isReadyCapable` => gateway can become "ready" (needs a client id for the
// SAME Connect account), which is what surfaces the vendor connect button.
export const hasCredentials = Boolean(STRIPE_CONNECT_KEYS.publishable && STRIPE_CONNECT_KEYS.secret);
export const isReadyCapable = hasCredentials && Boolean(STRIPE_CONNECT_KEYS.clientId);

/** Give a user (e.g. the vendor buying a pack) a billing+shipping address so the block checkout can proceed. */
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

/**
 * Toggle the Vendor Subscription feature (dokan_product_subscription[enable_pricing]). The subscription module
 * returns early on init when this is off — it gates the vendor dashboard subscription endpoint AND the site-wide
 * product-gating hooks. Enable = set the option ON + flush rewrites in a SEPARATE request (so that request's
 * bootstrap re-reads it on and registers the dashboard endpoint). Disable (teardown) = set it OFF so later specs
 * on the same worker see vendors un-gated again. Both POSTs are checked so a missing/forbidden route fails loudly.
 */
export async function setVendorSubscriptionFeature(enabled: boolean): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const route = enabled ? 'enable-vendor-subscription' : 'disable-vendor-subscription';
        const res = await ctx.post(`${SERVER_URL}/dokan-test/v1/${route}`);
        if (!res.ok()) {
            throw new Error(`dokan-test/v1/${route} failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
        if (enabled) {
            // The /dashboard/subscription endpoint only registers after a flush that re-reads enable_pricing=on.
            const flush = await ctx.post(`${SERVER_URL}/dokan-test/v1/flush-rewrites`);
            if (!flush.ok()) {
                throw new Error(`dokan-test/v1/flush-rewrites failed (${flush.status()}): ${(await flush.text()).slice(0, 200)}`);
            }
        }
    } finally {
        await ctx.dispose();
    }
}

/**
 * Seed a vendor-subscription pack: ensure the feature is enabled, create it as a simple product via REST, flip its
 * type to product_pack in the DB (REST rejects the product_pack type), set a default admin commission, and apply any
 * extra post-meta. Returns [packId, packName]. Used by the vendor-subscription describes (recurring/non-recurring/trial).
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
        const stripe = new StripeConnectPage(page);
        await dbUtils.clearCustomerCart(VENDOR_ID);
        await dbUtils.removeVendorSubscription(VENDOR_ID);
        await stripe.addProductToCart(packId);
        await stripe.gotoBlockCheckout();
        await stripe.selectBlockGateway();
        await stripe.fillCardDetails(card);
        await stripe.placeBlockOrderExpectReceived();
        return page.url().match(/order-received\/(\d+)/)?.[1];
    } finally {
        await page.close();
        await ctx.close();
    }
}

/** Read a single order-meta value (admin auth). Returns undefined when the key is absent. */
export async function getOrderMetaValue(orderId: string, key: string): Promise<string | undefined> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}?_fields=meta_data`);
        const body = (await res.json().catch(() => ({}))) as { meta_data?: Array<{ key: string; value: string }> };
        return (body.meta_data ?? []).find(m => m.key === key)?.value;
    } finally {
        await ctx.dispose();
    }
}

/** Cancel any created Stripe subscriptions, reset the vendor's subscription state, restore the feature flag, and trash the pack. */
export async function cleanupSubscription(packId: string | undefined, subIds: string[] = []): Promise<void> {
    if (stripeApi.hasSecretKey()) {
        // Resolve the live sub id robustly: the caller's captured id(s) PLUS the vendor's current meta — a test
        // that threw before capturing the id still leaves _stripe_subscription_id on the vendor (set at activation),
        // and we must cancel it BEFORE removeVendorSubscription wipes that row, or the live sub leaks.
        const metaSub = await dbUtils.getUserMetaValue(VENDOR_ID, '_stripe_subscription_id');
        const toCancel = [...new Set([...subIds, metaSub].filter((s): s is string => !!s && /^sub_/.test(s)))];
        for (const s of toCancel) {
            await stripeApi.cancelSubscription(s);
        }
    }
    await dbUtils.removeVendorSubscription(VENDOR_ID);
    await dbUtils.clearCustomerCart(VENDOR_ID);
    // Restore the site default (feature off) so later specs on the same worker see vendors un-gated.
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
