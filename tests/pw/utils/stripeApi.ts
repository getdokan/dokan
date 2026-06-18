import { request } from '@playwright/test';

// The suite's strict tsconfig doesn't include @types/node — declare process locally.
declare const process: { env: Record<string, string | undefined> };

const STRIPE_API = 'https://api.stripe.com';
const secretKey = (): string => process.env.TEST_SECRET_KEY_STRIPE_CONNECT || '';

/**
 * Thin client for asserting money truth against the Stripe test API (platform
 * secret key). Used by the multi-vendor split / refund specs to verify transfers
 * actually happened — the Dashboard/API is the source of truth, not the WP UI.
 */
async function stripeGet(path: string): Promise<any> {
    const ctx = await request.newContext({
        baseURL: STRIPE_API,
        extraHTTPHeaders: { Authorization: `Bearer ${secretKey()}` },
    });
    try {
        const res = await ctx.get(path);
        const body = await res.json();
        if (!res.ok()) {
            throw new Error(`Stripe API ${path} → ${res.status()}: ${JSON.stringify(body?.error ?? body)}`);
        }
        return body;
    } finally {
        await ctx.dispose();
    }
}

/** DELETE against the Stripe test API (e.g. cancel a subscription). Mutating counterpart to stripeGet. */
async function stripeDelete(path: string): Promise<any> {
    const ctx = await request.newContext({
        baseURL: STRIPE_API,
        extraHTTPHeaders: { Authorization: `Bearer ${secretKey()}` },
    });
    try {
        const res = await ctx.delete(path);
        const body = await res.json();
        if (!res.ok()) {
            throw new Error(`Stripe API DELETE ${path} → ${res.status()}: ${JSON.stringify(body?.error ?? body)}`);
        }
        return body;
    } finally {
        await ctx.dispose();
    }
}

export const stripeApi = {
    hasSecretKey: (): boolean => Boolean(secretKey()),

    async getPaymentIntent(intentId: string): Promise<any> {
        return stripeGet(`/v1/payment_intents/${intentId}`);
    },

    /** Resolve the charge id for a PaymentIntent (its latest_charge). */
    async getLatestChargeId(intentId: string): Promise<string> {
        const pi = await this.getPaymentIntent(intentId);
        const charge = typeof pi.latest_charge === 'string' ? pi.latest_charge : pi.latest_charge?.id;
        if (!charge) {
            throw new Error(`PaymentIntent ${intentId} has no latest_charge (status: ${pi.status})`);
        }
        return charge;
    },

    /** All transfers to a connected account (Stripe has no source_transaction filter, so filter client-side). */
    async listTransfersToDestination(destination: string, limit = 100): Promise<any[]> {
        const body = await stripeGet(`/v1/transfers?destination=${destination}&limit=${limit}`);
        return (body.data ?? []) as any[];
    },

    /** Transfers funded by a specific charge that landed on a specific vendor account. */
    async transfersForChargeToVendor(chargeId: string, vendorAccount: string): Promise<any[]> {
        const all = await this.listTransfersToDestination(vendorAccount);
        return all.filter(t => t.source_transaction === chargeId);
    },

    async getTransfer(transferId: string): Promise<any> {
        return stripeGet(`/v1/transfers/${transferId}`);
    },

    async getCharge(chargeId: string): Promise<any> {
        return stripeGet(`/v1/charges/${chargeId}`);
    },

    /** Find the payment_intent.succeeded event for a given PaymentIntent (for webhook replay tests). */
    async findPaymentIntentSucceededEvent(intentId: string): Promise<any | undefined> {
        const body = await stripeGet(`/v1/events?type=payment_intent.succeeded&limit=100`);
        return (body.data ?? []).find((e: { data?: { object?: { id?: string } } }) => e?.data?.object?.id === intentId);
    },

    /** Retrieve a Stripe Subscription (read .status = active|trialing|canceled|… and .cancel_at_period_end). */
    async getSubscription(subscriptionId: string): Promise<any> {
        return stripeGet(`/v1/subscriptions/${subscriptionId}`);
    },

    /** Retrieve a Stripe Customer (read invoice_settings.default_payment_method for the set-default proof, F4). */
    async getCustomer(customerId: string): Promise<any> {
        return stripeGet(`/v1/customers/${customerId}`);
    },

    /** All PaymentMethods of a type attached to a customer (F1/F3 attach proof, F5 absence-after-detach proof). */
    async listCustomerPaymentMethods(customerId: string, type = 'card'): Promise<any[]> {
        const body = await stripeGet(`/v1/customers/${customerId}/payment_methods?type=${type}`);
        return (body.data ?? []) as any[];
    },

    /** Retrieve a PaymentMethod (after detach, .customer is null while the object still exists — F5 primary proof). */
    async getPaymentMethod(pmId: string): Promise<any> {
        return stripeGet(`/v1/payment_methods/${pmId}`);
    },

    /** All subscriptions for a customer (VS8.1 — count to prove the cart-fingerprint fix created exactly one sub_). */
    async listSubscriptionsForCustomer(customerId: string): Promise<any[]> {
        const body = await stripeGet(`/v1/subscriptions?customer=${customerId}&limit=100`);
        return (body.data ?? []) as any[];
    },

    /** Retrieve a connected Account (B3/R23 — assert the acct_ still exists/authorized after a local-only disconnect). */
    async getAccount(accountId: string): Promise<any> {
        return stripeGet(`/v1/accounts/${accountId}`);
    },

    /**
     * Transfers funded by a specific charge across ALL connected accounts (no destination filter).
     * Dokan Stripe Connect uses Stripe's SEPARATE charges-and-transfers model: vendor payouts are standalone
     * Transfer::create calls carrying source_transaction = the platform charge id — the charge object itself
     * never carries transfer/transfer_data/destination, even for a real multi-vendor split. So the source of
     * truth for "did this charge pay out a vendor" is the transfer ledger, not the charge. A platform-only
     * charge (e.g. a vendor-subscription pack fee, which is admin revenue) yields ZERO transfers here.
     * NOTE: scans the most-recent `limit` transfers (Stripe has no source_transaction query filter); adequate
     * for a charge created moments earlier, whose transfer (if any) would be among the most recent.
     */
    async transfersForCharge(chargeId: string, limit = 100): Promise<any[]> {
        const body = await stripeGet(`/v1/transfers?limit=${limit}`);
        return ((body.data ?? []) as any[]).filter(t => t.source_transaction === chargeId);
    },

    /** Immediately cancel a Stripe Subscription (cleanup for vendor-subscription specs). Tolerates an already-cancelled/absent sub. */
    async cancelSubscription(subscriptionId: string): Promise<void> {
        await stripeDelete(`/v1/subscriptions/${subscriptionId}`).catch(() => undefined);
    },
};
