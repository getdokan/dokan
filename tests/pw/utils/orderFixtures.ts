import { request } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';

// The suite tsconfig is strict and does not pull @types/node.
declare const process: { env: Record<string, string | undefined> };

const CUSTOMER_ID = process.env.CUSTOMER_ID ?? '2';

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
 * Ensure a vendor's Dokan STORE address has a (supported) country. Gateway onboarding
 * templates only render their Connect button when the store address country is set and
 * supported; otherwise they show an "Update your store address" guard, so any
 * not-connected onboarding assertion needs this first. Deep-merges into dokan_profile_settings.
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
/* Order inspection / mutation (HPOS-safe via REST meta_data)          */
/* ------------------------------------------------------------------ */

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

/** Update a WC order's status via REST (admin auth) — e.g. to 'completed' to trigger disbursement. */
export async function setOrderStatus(orderId: string | number, status: string): Promise<void> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        // Completing an order can fire a SYNCHRONOUS gateway payout inside this request
        // (ON_ORDER_COMPLETED disbursement), so allow well beyond the 15s default.
        const res = await ctx.put(`${SERVER_URL}/wc/v3/orders/${orderId}`, { data: { status }, timeout: 90_000 });
        if (!res.ok()) {
            throw new Error(`setOrderStatus failed (${res.status()}): ${(await res.text()).slice(0, 200)}`);
        }
    } finally {
        await ctx.dispose();
    }
}
