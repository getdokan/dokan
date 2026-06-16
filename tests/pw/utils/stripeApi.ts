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
};
