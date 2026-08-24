import { request } from '@playwright/test';

// The suite's strict tsconfig doesn't include @types/node — declare process locally.
declare const process: { env: Record<string, string | undefined> };

const STRIPE_API = 'https://api.stripe.com';
// Each Stripe gateway under test is a SEPARATE Stripe platform account with its own
// secret key, so the client is built per gateway rather than reading one fixed env var.

/**
 * Thin client for asserting money truth against the Stripe test API (platform
 * secret key). Used by the Stripe Express multi-vendor split / refund / webhook
 * specs to verify transfers + refunds actually happened — the Stripe API is the
 * source of truth, not the WP UI. The Express gateway uses the SEPARATE
 * charges-and-transfers model (platform charge + standalone Transfer carrying
 * source_transaction = the platform charge id), so the transfer ledger — not the
 * charge object — is the proof a vendor was paid.
 */
function makeStripeApi(secretKey: () => string) {
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

    /** Form-encoded POST against the Stripe test API. Mutating counterpart to stripeGet. */
    async function stripePost(path: string, form: Record<string, string> = {}): Promise<any> {
        const ctx = await request.newContext({
            baseURL: STRIPE_API,
            extraHTTPHeaders: { Authorization: `Bearer ${secretKey()}` },
        });
        try {
            const res = await ctx.post(path, { form });
            const body = await res.json();
            if (!res.ok()) {
                throw new Error(`Stripe API POST ${path} → ${res.status()}: ${JSON.stringify(body?.error ?? body)}`);
            }
            return body;
        } finally {
            await ctx.dispose();
        }
    }

    const api = {
        hasSecretKey: (): boolean => Boolean(secretKey()),

        async getPaymentIntent(intentId: string): Promise<any> {
            return stripeGet(`/v1/payment_intents/${intentId}`);
        },

        /**
         * Confirm a PaymentIntent server-side. Used ONLY as a CI fallback when GitHub runner IPs
         * trigger a blocking hCaptcha on the in-page card confirm — the payment still goes through
         * Stripe for real (this is the actual intent the checkout created), we just complete the
         * confirmation via the API instead of the hCaptcha-gated UI click. No-op if already paid.
         */
        async confirmPaymentIntent(intentId: string, paymentMethod = 'pm_card_visa'): Promise<any> {
            const pi = await this.getPaymentIntent(intentId);
            if (['succeeded', 'processing'].includes(pi.status)) return pi;
            const form: Record<string, string> = { return_url: 'https://example.com/return' };
            if (!pi.payment_method) form.payment_method = paymentMethod;
            return stripePost(`/v1/payment_intents/${intentId}/confirm`, form);
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

        /** Reversals on a transfer (refund-reversal proof — the vendor share is clawed back). */
        async listTransferReversals(transferId: string): Promise<any[]> {
            const body = await stripeGet(`/v1/transfers/${transferId}/reversals?limit=100`);
            return (body.data ?? []) as any[];
        },

        async getCharge(chargeId: string): Promise<any> {
            return stripeGet(`/v1/charges/${chargeId}`);
        },

        /** Refunds on a charge (full/partial refund proof). */
        async listRefundsForCharge(chargeId: string): Promise<any[]> {
            const body = await stripeGet(`/v1/refunds?charge=${chargeId}&limit=100`);
            return (body.data ?? []) as any[];
        },

        /** Find a webhook event of a type for a given object id (for webhook replay / signature tests). */
        async findEventForObject(type: string, objectId: string): Promise<any | undefined> {
            const body = await stripeGet(`/v1/events?type=${encodeURIComponent(type)}&limit=100`);
            return (body.data ?? []).find((e: { data?: { object?: { id?: string } } }) => e?.data?.object?.id === objectId);
        },

        /** Retrieve a Stripe Subscription (read .status = active|trialing|canceled|… and .cancel_at_period_end). */
        async getSubscription(subscriptionId: string): Promise<any> {
            return stripeGet(`/v1/subscriptions/${subscriptionId}`);
        },

        /** All subscriptions for a customer (prove exactly one sub_ was created — no duplicate). */
        async listSubscriptionsForCustomer(customerId: string): Promise<any[]> {
            const body = await stripeGet(`/v1/subscriptions?customer=${customerId}&limit=100`);
            return (body.data ?? []) as any[];
        },

        /** Retrieve a Stripe Customer (read invoice_settings.default_payment_method for the set-default proof). */
        async getCustomer(customerId: string): Promise<any> {
            return stripeGet(`/v1/customers/${customerId}`);
        },

        /** All PaymentMethods of a type attached to a customer (saved-card attach/detach proof). */
        async listCustomerPaymentMethods(customerId: string, type = 'card'): Promise<any[]> {
            const body = await stripeGet(`/v1/customers/${customerId}/payment_methods?type=${type}`);
            return (body.data ?? []) as any[];
        },

        /** Retrieve a PaymentMethod (after detach, .customer is null while the object still exists). */
        async getPaymentMethod(pmId: string): Promise<any> {
            return stripeGet(`/v1/payment_methods/${pmId}`);
        },

        /** Retrieve a connected Account (assert the acct_ still exists / its capabilities). */
        async getAccount(accountId: string): Promise<any> {
            return stripeGet(`/v1/accounts/${accountId}`);
        },

        /**
         * Transfers funded by a specific charge across ALL connected accounts (no destination filter).
         * Dokan Stripe Express uses Stripe's SEPARATE charges-and-transfers model: vendor payouts are
         * standalone Transfer::create calls carrying source_transaction = the platform charge id — the
         * charge object never carries transfer/destination, even for a real multi-vendor split. So the
         * source of truth for "did this charge pay out a vendor" is the transfer ledger, not the charge.
         * A platform-only charge (e.g. a product-advertisement fee, admin revenue) yields ZERO transfers.
         * NOTE: scans the most-recent `limit` transfers (Stripe has no source_transaction query filter).
         */
        async transfersForCharge(chargeId: string, limit = 100): Promise<any[]> {
            const body = await stripeGet(`/v1/transfers?limit=${limit}`);
            return ((body.data ?? []) as any[]).filter(t => t.source_transaction === chargeId);
        },

        /** Immediately cancel a Stripe Subscription (cleanup). Tolerates an already-cancelled/absent sub. */
        async cancelSubscription(subscriptionId: string): Promise<void> {
            await stripeDelete(`/v1/subscriptions/${subscriptionId}`).catch(() => undefined);
        },
    };

    return api;
}

/** Stripe Express platform client (TEST_SECRET_KEY_STRIPE_EXPRESS). */
export const stripeApi = makeStripeApi(() => process.env.TEST_SECRET_KEY_STRIPE_EXPRESS || '');

/** Stripe Connect platform client — a DIFFERENT Stripe platform account, so a different key. */
export const stripeConnectApi = makeStripeApi(() => process.env.TEST_SECRET_KEY_STRIPE_CONNECT || '');
