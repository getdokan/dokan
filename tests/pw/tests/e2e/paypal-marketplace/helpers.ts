import { request } from '@utils/test';
import type { APIRequestContext } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import {
    ADMIN_STORAGE_STATE,
    VENDOR_STORAGE_STATE,
    VENDOR2_STORAGE_STATE,
    CUSTOMER_STORAGE_STATE,
} from '@utils/authStates';

// The suite tsconfig is strict and does not pull @types/node.
declare const process: { env: Record<string, string | undefined> };
declare const Buffer: { from(input: string): { toString(encoding: string): string } };

/* ------------------------------------------------------------------ */
/* Actors                                                              */
/* ------------------------------------------------------------------ */

export const adminAuth = ADMIN_STORAGE_STATE;
export const vendorAuth = VENDOR_STORAGE_STATE;
export const vendor2Auth = VENDOR2_STORAGE_STATE;
export const customerAuth = CUSTOMER_STORAGE_STATE;

export const VENDOR_ID = process.env.VENDOR_ID ?? '3';
export const VENDOR2_ID = process.env.VENDOR2_ID ?? '5';
export const CUSTOMER_ID = process.env.CUSTOMER_ID ?? '2';

/* ------------------------------------------------------------------ */
/* Module / gateway identity                                           */
/* ------------------------------------------------------------------ */

export const MODULE_PAYPAL_MARKETPLACE = 'paypal_marketplace';
export const MODULE_PRODUCT_SUBSCRIPTION = 'product_subscription';

/** Gateway id — underscores. */
export const PAYPAL_GATEWAY_ID = 'dokan_paypal_marketplace';

/**
 * Withdraw method id — HYPHENS, and deliberately different from the gateway id.
 * Stripe Express's two are identical, so mirroring that suite gets this wrong by
 * default. Asserting the gateway id against `dokan_withdraw['withdraw_methods']`
 * fails even on a perfectly working system.
 */
export const PAYPAL_WITHDRAW_METHOD_ID = 'dokan-paypal-marketplace';

/** Test-support mu-plugin namespace (dokan-paypal-marketplace-test-helpers.php). */
const TEST_NS = `${SERVER_URL}/dokan-test-paypal/v1`;

/* ------------------------------------------------------------------ */
/* Credential gates                                                    */
/* ------------------------------------------------------------------ */

/**
 * PayPal needs THREE values where Stripe Express needed two: `Helper::is_ready()` is
 * `enabled && partner_id && client_id && client_secret`, so a missing partner id alone
 * keeps the gateway unavailable.
 *
 * `TEST_MERCHANT_ID_PAYPAL_MARKETPLACE` is the canonical partner-id name — already declared
 * in types/environment.d.ts and read by utils/testData.ts, and the name carried by the CI
 * secret. The build brief's `PAYPAL_MARKETPLACE_PARTNER_ID` alias was retired on 2026-07-30
 * once the canonical secret existed; no fallback is kept, so a misnamed env var fails loudly
 * at the preflight instead of silently resolving.
 */
export const PAYPAL_KEYS = {
    partnerId: process.env.TEST_MERCHANT_ID_PAYPAL_MARKETPLACE || '',
    clientId: process.env.TEST_CLIENT_ID_PAYPAL_MARKETPLACE || '',
    clientSecret: process.env.TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE || '',
} as const;

export const hasCredentials = Boolean(
    PAYPAL_KEYS.partnerId && PAYPAL_KEYS.clientId && PAYPAL_KEYS.clientSecret
);

/** Placeholder merchant ids. Enough for Dokan to treat a vendor as connected; PayPal rejects them at capture. */
export const SEEDED_MERCHANT_SENTINEL = 'seeded_demo';

export const PAYPAL_MERCHANTS = {
    vendor1: process.env.PAYPAL_MARKETPLACE_VENDOR1_MERCHANT_ID || `${SEEDED_MERCHANT_SENTINEL}_vendor1`,
    vendor2: process.env.PAYPAL_MARKETPLACE_VENDOR2_MERCHANT_ID || `${SEEDED_MERCHANT_SENTINEL}_vendor2`,
} as const;

/**
 * PayPal merchant ids carry no `acct_`-style prefix (real sandbox values from the QA corpus
 * look like `JPWZMNJEE68Y8` / `PJFHSRM7TEL46`), so there is no strict format to validate
 * against and none is invented here.
 *
 * Two things are rejected, both because they are *known-wrong shapes* rather than merely
 * unfamiliar ones:
 *
 *   - the seeded placeholder, and
 *   - anything containing `@`, i.e. an email address.
 *
 * The email guard exists because it actually happened on 2026-07-30: the sandbox account
 * *logins* (`dokangit@vendor1.com`) were supplied where the merchant ids belong. An email
 * contains no placeholder sentinel, so without this check it would flip HAS_REAL_MERCHANTS
 * to true, un-gate every money spec, and send them all to fail against PayPal with an
 * opaque payee error. A gate that opens on the wrong value is worse than one that stays shut.
 */
function isUsableMerchantId(value: string): boolean {
    return value.length > 0 && !value.includes(SEEDED_MERCHANT_SENTINEL) && !value.includes('@');
}

/**
 * FORMAT gate only. It proves the value is not a placeholder and not an email; it cannot
 * prove PayPal will accept the merchant as a payee. Consent lives on PayPal's side and is
 * verified over the network by `getMerchantConsent()` — see PP-PRE-04.
 */
export const HAS_REAL_MERCHANTS =
    isUsableMerchantId(PAYPAL_MERCHANTS.vendor1) && isUsableMerchantId(PAYPAL_MERCHANTS.vendor2);

/**
 * Sandbox Business-account logins for the two suite vendors, used to drive the PayPal-hosted
 * partner-consent flow (PP-ONB). Onboarding is the one step with no API equivalent: no PayPal
 * endpoint grants a seller's consent, so a real browser pass is required — once per vendor, ever,
 * because a merchant id is the account's permanent identity.
 */
export const PAYPAL_VENDOR_LOGINS = {
    vendor1: {
        email: process.env.PAYPAL_MARKETPLACE_VENDOR1_EMAIL || '',
        password: process.env.PAYPAL_MARKETPLACE_VENDOR1_PASSWORD || '',
    },
    vendor2: {
        email: process.env.PAYPAL_MARKETPLACE_VENDOR2_EMAIL || '',
        password: process.env.PAYPAL_MARKETPLACE_VENDOR2_PASSWORD || '',
    },
} as const;

export const HAS_VENDOR_LOGINS = Object.values(PAYPAL_VENDOR_LOGINS).every(v => v.email && v.password);

/** Names the specific reason the gate is shut, so the preflight warning is actionable. */
export function merchantGateReason(): string | null {
    for (const [label, value] of Object.entries(PAYPAL_MERCHANTS)) {
        if (value.includes('@')) {
            return `${label}="${value}" looks like a PayPal account login, not a merchant id. A merchant id is ~13 alphanumeric characters with no "@" (e.g. JPWZMNJEE68Y8). Find it at developer.paypal.com → Testing Tools → Sandbox Accounts → the business account → View/edit account → Account ID.`;
        }
        if (value.includes(SEEDED_MERCHANT_SENTINEL)) {
            return `${label} is still the seeded placeholder "${value}" — no real merchant id was supplied.`;
        }
    }
    return null;
}

/* ------------------------------------------------------------------ */
/* PayPal-side consent verification — the gate `HAS_REAL_MERCHANTS` cannot see */
/* ------------------------------------------------------------------ */

/**
 * Why this exists.
 *
 * `HAS_REAL_MERCHANTS` inspects the SHAPE of a merchant id. A merchant id is simply the
 * permanent identity of a PayPal account; whether that account has granted THIS partner app
 * permission to be paid on its behalf is separate state held entirely on PayPal's side. The
 * two are independent, and only the second one decides whether a capture succeeds.
 *
 * On 2026-07-31 both suite vendors held correctly-shaped, real merchant ids that had granted
 * no consent to the partner app. The format gate opened, PP-PRE-02 announced "money-movement
 * tests will run", and every capture would have failed against PayPal with an opaque payee
 * error. That is the same fake-green class as the email bug the `@` guard catches, one layer
 * deeper: the previous guard rejected a value that was obviously wrong, this one rejects a
 * value that is right but unusable.
 *
 * A gate that opens on an unusable value is worse than one that stays shut, so PP-PRE-04
 * turns this into a hard failure rather than a warning.
 */
export const PAYPAL_SANDBOX_API = 'https://api-m.sandbox.paypal.com';

/** Cached for the worker: the preflight asks for two vendors and one token covers both. */
let cachedAccessToken: string | null = null;

/**
 * Client-credentials token for the partner app.
 *
 * `Authorization` is set EXPLICITLY. `request.newContext()` inherits the shared config's admin
 * Basic auth when the header is omitted, which would ship WordPress admin credentials to
 * paypal.com — the same inheritance trap already documented on the mu-plugin transport, but
 * with an external recipient.
 */
/**
 * The two failure strings this file has always thrown, kept apart by the same condition as before:
 * a 2xx that carried no `access_token` is a different fault from a refusal, and each names its own.
 */
const DEFAULT_TOKEN_FAILURE = (status: number, bodyText: string): string =>
    status >= 200 && status < 300
        ? 'PayPal token response carried no access_token.'
        : `PayPal token request failed (${status}): ${bodyText.slice(0, 300)}`;

/**
 * ONE cache for the whole suite. Every caller derives the token from the same
 * `PAYPAL_KEYS.clientId`/`clientSecret` pair against the same sandbox host, so a token minted for one
 * spec file is the same bearer token the next would have minted — the only observable difference is
 * fewer `/v1/oauth2/token` round trips. A FAILURE never populates it, so a failing call always
 * formats with its OWN `tokenFailure` and one file's wording can never leak into another's failure.
 */
export async function paypalAccessToken(options?: { tokenFailure?: (status: number, bodyText: string) => string }): Promise<string> {
    if (cachedAccessToken) return cachedAccessToken;

    const basic = 'Basic ' + Buffer.from(`${PAYPAL_KEYS.clientId}:${PAYPAL_KEYS.clientSecret}`).toString('base64');
    const ctx = await request.newContext({ extraHTTPHeaders: { Authorization: basic } });
    try {
        const res = await ctx.post(`${PAYPAL_SANDBOX_API}/v1/oauth2/token`, {
            form: { grant_type: 'client_credentials' },
        });
        // Read the body ONCE, as text: `res.json()` cannot be called after `res.text()` on the same
        // response, and every failure message wants the raw text rather than a parsed field.
        const bodyText = await res.text();
        let token: string | undefined;
        try {
            token = (JSON.parse(bodyText) as { access_token?: string; scope?: string }).access_token;
        } catch {
            /* left undefined — an unparseable body carries no access_token either way */
        }
        if (!res.ok() || !token) {
            throw new Error((options?.tokenFailure ?? DEFAULT_TOKEN_FAILURE)(res.status(), bodyText));
        }
        cachedAccessToken = token;
        return cachedAccessToken;
    } finally {
        await ctx.dispose();
    }
}

/**
 * Read a PayPal order back from PayPal itself — `GET /v2/checkout/orders/{id}`.
 *
 * This is the only way to prove what the module actually SENT: the order Dokan built lives on
 * PayPal's side, and nothing in the module persists `purchase_units[*].payee`, the platform fee,
 * or the disbursement mode anywhere readable on the site. Assertions about who is being paid must
 * therefore come from here, not from the order meta Dokan wrote for itself.
 *
 * `Authorization` is set EXPLICITLY, for the same reason as `paypalAccessToken()`:
 * `request.newContext()` inherits the shared config's WordPress admin Basic auth when the header
 * is omitted, which would ship admin credentials to paypal.com.
 *
 * Throws on a non-ok response rather than returning a partial body, so a caller can never assert
 * on `purchase_units` that PayPal never sent — the resulting `undefined` would make a payee
 * assertion pass by absence.
 */
const DEFAULT_ORDER_FAILURE = ({ paypalOrderId, status, bodyText }: { paypalOrderId: string; status: number; message: string; bodyText: string }): string =>
    `PayPal order ${paypalOrderId} could not be read back (HTTP ${status}): ${bodyText.slice(0, 300)}`;

/** Upstream-degraded answers, not answers about the order — safe to re-ask, and only these. */
const PAYPAL_TRANSIENT_STATUS = new Set([429, 500, 502, 503, 504]);
const PAYPAL_READ_RETRIES = 3;

/**
 * The generic reader every spec's own `getPayPalOrder` delegates to.
 *
 * `T` exists because the callers do not agree on a shape and must not be forced to: three files read
 * the order as `Record<string, unknown>` (an interface without an index signature is NOT assignable
 * to that), and four declare their own `PayPalOrder` interface (property access on a
 * `Record<string, unknown>` yields `unknown`). A spec therefore keeps its local interface and passes
 * it as the type argument; nothing widens and nothing narrows.
 *
 * `orderFailure` carries each file's own non-ok wording. `message` is `String(body.message ?? '')`,
 * which is exactly what those messages interpolate today — `''` when the body cannot be parsed.
 */
export async function readPayPalOrder<T extends object = Record<string, unknown>>(
    paypalOrderId: string,
    options?: {
        tokenFailure?: (status: number, bodyText: string) => string;
        orderFailure?: (info: { paypalOrderId: string; status: number; message: string; bodyText: string }) => string;
    }
): Promise<T> {
    const token = await paypalAccessToken(options?.tokenFailure ? { tokenFailure: options.tokenFailure } : undefined);
    const ctx = await request.newContext({ extraHTTPHeaders: { Authorization: `Bearer ${token}` } });
    try {
        let res = await ctx.get(`${PAYPAL_SANDBOX_API}/v2/checkout/orders/${paypalOrderId}`);

        /*
         * PayPal's sandbox answers 503/500/429 intermittently, and this read is a plain GET of an
         * order PayPal already created — it is idempotent, so re-asking is safe and is what the
         * upstream status codes mean. Retried ONLY for those: a 4xx is PayPal's real answer about
         * the order (wrong id, wrong credentials, wrong environment) and must surface immediately
         * rather than be re-asked three times and reported a minute late.
         *
         * Observed live 2026-08-04: PP-SPL-05 failed on `HTTP 503` and passed on retry, which is the
         * whole Playwright case re-running — capture and all — for one transient upstream blip.
         */
        for (let attempt = 1; attempt <= PAYPAL_READ_RETRIES && PAYPAL_TRANSIENT_STATUS.has(res.status()); attempt++) {
            await sleep(attempt * 2_000);
            res = await ctx.get(`${PAYPAL_SANDBOX_API}/v2/checkout/orders/${paypalOrderId}`);
        }

        const text = await res.text();
        let parsed: T | undefined;
        try {
            parsed = JSON.parse(text) as T;
        } catch {
            /* left undefined — reported below by whichever branch applies */
        }
        if (!res.ok()) {
            throw new Error(
                (options?.orderFailure ?? DEFAULT_ORDER_FAILURE)({
                    paypalOrderId,
                    status: res.status(),
                    message: String((parsed as { message?: string } | undefined)?.message ?? ''),
                    bodyText: PAYPAL_TRANSIENT_STATUS.has(res.status())
                        ? `${text} [still ${res.status()} after ${PAYPAL_READ_RETRIES} retries — PayPal's sandbox is degraded, not the module]`
                        : text,
                })
            );
        }
        if (parsed === undefined) {
            throw new Error(`PayPal order ${paypalOrderId} answered HTTP 200 with a non-JSON body: ${text.slice(0, 300)}`);
        }
        return parsed;
    } finally {
        await ctx.dispose();
    }
}

export async function getPayPalOrder(paypalOrderId: string): Promise<Record<string, unknown>> {
    return readPayPalOrder(paypalOrderId);
}

/** Alias — both names appear in the case briefs; they are the same function. */
export const fetchPayPalOrder = getPayPalOrder;

export interface MerchantConsent {
    merchantId: string;
    /** True only when PayPal returns an integration record for this merchant under our partner. */
    connected: boolean;
    paymentsReceivable: boolean;
    primaryEmailConfirmed: boolean;
    /** Dokan mints this as `_dokan_paypal_<rand>_<wp_user_id>`, so its suffix proves whose referral produced the consent. */
    trackingId: string | null;
    /** PayPal's own words when the merchant is not usable. Its two failure strings are diagnostic — see below. */
    reason: string | null;
}

/**
 * Ask PayPal whether one merchant has actually onboarded to our partner app.
 *
 * The endpoint's error strings distinguish two failures that are indistinguishable from
 * inside Dokan, where both merely render as "Connect to PayPal error":
 *
 *   - `NOT_AUTHORIZED` / "insufficient permissions"  → the partner APP is wrong. A sandbox app
 *     created as type Merchant carries no partner scopes at all, and app type is fixed at
 *     creation. Nothing about the vendor is at fault.
 *   - "received with partner scope but merchant permission doesn't exist for this integration"
 *     → the app is correct and this VENDOR never granted consent.
 *
 * Both are returned verbatim in `reason` so the preflight message names the actual problem
 * instead of restating the condition.
 */
export async function getMerchantConsent(merchantId: string): Promise<MerchantConsent> {
    const token = await paypalAccessToken();
    const ctx = await request.newContext({ extraHTTPHeaders: { Authorization: `Bearer ${token}` } });
    try {
        const res = await ctx.get(
            `${PAYPAL_SANDBOX_API}/v1/customer/partners/${PAYPAL_KEYS.partnerId}/merchant-integrations/${merchantId}`
        );
        // Read as text first. A throttled or blocked partner call comes back with an EMPTY body, and
        // res.json() then throws a SyntaxError that escapes this function entirely — the caller loses
        // the very gated-skip reason this helper exists to produce, and the case dies claiming a JSON
        // parse error instead of naming PayPal. Anything unparseable falls through to the branch below.
        const raw = await res.text();
        let body: Record<string, unknown> = {};
        try {
            body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
        } catch {
            body = {};
        }

        if (!res.ok() || typeof body.merchant_id !== 'string') {
            return {
                merchantId,
                connected: false,
                paymentsReceivable: false,
                primaryEmailConfirmed: false,
                trackingId: null,
                reason: `HTTP ${res.status()} — ${String(body.message ?? (raw ? raw.slice(0, 200) : 'empty response body (PayPal returned no content — throttling or a blocked partner call)'))}`,
            };
        }

        return {
            merchantId,
            connected: true,
            paymentsReceivable: body.payments_receivable === true,
            primaryEmailConfirmed: body.primary_email_confirmed === true,
            trackingId: typeof body.tracking_id === 'string' ? body.tracking_id : null,
            reason: null,
        };
    } finally {
        await ctx.dispose();
    }
}

/** Both suite vendors, in one call, for the preflight. */
export async function getBothMerchantConsents(): Promise<Record<'vendor1' | 'vendor2', MerchantConsent>> {
    const [vendor1, vendor2] = await Promise.all([
        getMerchantConsent(PAYPAL_MERCHANTS.vendor1),
        getMerchantConsent(PAYPAL_MERCHANTS.vendor2),
    ]);
    return { vendor1, vendor2 };
}

/** A merchant is payable only when PayPal knows it AND will let it receive money. */
export function isPayableMerchant(consent: MerchantConsent): boolean {
    return consent.connected && consent.paymentsReceivable;
}

/* ------------------------------------------------------------------ */
/* Webhook event vocabulary — the 16 strings the module actually maps   */
/* ------------------------------------------------------------------ */

export const PAYPAL_EVENTS = {
    merchantOnboardingCompleted: 'MERCHANT.ONBOARDING.COMPLETED',
    merchantCapabilityUpdated: 'CUSTOMER.MERCHANT-INTEGRATION.CAPABILITY-UPDATED',
    merchantEmailConfirmed: 'CUSTOMER.MERCHANT-INTEGRATION.SELLER-EMAIL-CONFIRMED',
    merchantConsentRevoked: 'MERCHANT.PARTNER-CONSENT.REVOKED',
    checkoutOrderApproved: 'CHECKOUT.ORDER.APPROVED',
    checkoutOrderCompleted: 'CHECKOUT.ORDER.COMPLETED',
    payoutItemCompleted: 'PAYMENT.REFERENCED-PAYOUT-ITEM.COMPLETED',
    captureRefunded: 'PAYMENT.CAPTURE.REFUNDED',
    /** Alias — routes to the SAME handler as captureRefunded, so a reversal books as a refund. */
    captureReversed: 'PAYMENT.CAPTURE.REVERSED',
    saleCompleted: 'PAYMENT.SALE.COMPLETED',
    subscriptionActivated: 'BILLING.SUBSCRIPTION.ACTIVATED',
    subscriptionReActivated: 'BILLING.SUBSCRIPTION.RE-ACTIVATED',
    subscriptionSuspended: 'BILLING.SUBSCRIPTION.SUSPENDED',
    subscriptionCancelled: 'BILLING.SUBSCRIPTION.CANCELLED',
    /** Alias — routes to the SAME handler as subscriptionCancelled. */
    subscriptionExpired: 'BILLING.SUBSCRIPTION.EXPIRED',
    subscriptionPaymentFailed: 'BILLING.SUBSCRIPTION.PAYMENT.FAILED',
} as const;

/** Event strings the brief assumed exist but the module does NOT map. Kept so specs can assert the absence. */
export const PAYPAL_UNHANDLED_EVENTS = {
    captureCompleted: 'PAYMENT.CAPTURE.COMPLETED',
    captureDenied: 'PAYMENT.CAPTURE.DENIED',
} as const;

/** The live webhook endpoint. Slug uses HYPHENS; the gateway id uses underscores. */
export const PAYPAL_WEBHOOK_URL = `${(process.env.BASE_URL ?? 'http://localhost:9999').replace(/\/$/, '')}/?wc-api=dokan-paypal`;

/* ------------------------------------------------------------------ */
/* Mu-plugin transport                                                 */
/* ------------------------------------------------------------------ */

/**
 * ponytail: one shared request wrapper instead of the Stripe suite's ~20 inlined
 * newContext/try/finally blocks. Deliberate divergence — same semantics, far less
 * repetition. Inline it again if a route ever needs different headers.
 *
 * Auth is HTTP Basic via `payloads.adminAuth`, never a nonce or cookie.
 */
async function testRequest<T = Record<string, unknown>>(
    method: 'get' | 'post',
    route: string,
    data?: Record<string, unknown>
): Promise<T> {
    const ctx = await request.newContext({
        extraHTTPHeaders: payloads.adminAuth as Record<string, string>,
    });
    try {
        const res = method === 'get' ? await ctx.get(`${TEST_NS}${route}`) : await ctx.post(`${TEST_NS}${route}`, { data });
        if (!res.ok()) {
            throw new Error(`${route} failed (${res.status()}): ${(await res.text()).slice(0, 300)}`);
        }
        return (await res.json()) as T;
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Status / configuration                                              */
/* ------------------------------------------------------------------ */

export interface PayPalStatus {
    ok: boolean;
    skipped?: string;
    is_enabled: boolean;
    is_test_mode: boolean;
    is_ready: boolean;
    gateway_id: string;
    has_partner_id: boolean;
    module_active: boolean;
    stripe_express_active: boolean;
    withdraw_method_on: boolean;
    disbursement_mode: string | null;
    button_type: string | null;
    ucc_mode: string | null;
    store_currency: string;
    /**
     * RESOLVED getter values, not raw settings rows. A spec that reads the raw setting only proves
     * the value it seeded round-trips; these report what `Helper::` actually hands the product,
     * including its default when the setting is empty (delay period 0, interval 7, the bundled
     * Dokan logo). Each is `null` only when the module is absent or no longer exposes the getter.
     */
    disbursement_delay_period_resolved: number | null;
    notice_interval_resolved: number | null;
    marketplace_logo_resolved: string | null;
    vendor_meta_keys: Record<string, string>;
}

/**
 * Readiness introspection. Availability specs must call this and assert `is_ready`
 * BEFORE asserting that the gateway is hidden for some reason — otherwise the negative
 * passes trivially on an unconfigured site.
 */
export async function getPayPalStatus(): Promise<PayPalStatus> {
    return testRequest<PayPalStatus>('get', '/status');
}

/**
 * Idempotent gateway + module + withdraw-method setup. No-ops without credentials, so
 * calling it in a keyless run is safe.
 *
 * Every write MERGES. Nothing is ever removed — in particular `stripe_express` must
 * survive, or the Stripe suite silently skips on the same CI worker.
 */
export async function ensurePayPalConfigured(
    settings?: Record<string, unknown>,
    disbursementMode: 'INSTANT' | 'ON_ORDER_COMPLETE' | 'DELAYED' = 'INSTANT'
): Promise<Record<string, unknown>> {
    if (!hasCredentials) return { ok: true, skipped: 'no_credentials' };

    return testRequest('post', '/configure-paypal-marketplace', {
        partner_id: PAYPAL_KEYS.partnerId,
        client_id: PAYPAL_KEYS.clientId,
        client_secret: PAYPAL_KEYS.clientSecret,
        disbursement_mode: disbursementMode,
        ...(settings ? { settings } : {}),
    });
}

/* ------------------------------------------------------------------ */
/* Vendor connection                                                   */
/* ------------------------------------------------------------------ */

export interface SeedVendorResult {
    ok: boolean;
    vendor_id: number;
    merchant_id: string;
    keys: Record<string, string>;
    receivable: boolean;
}

/**
 * Seed a vendor as PayPal-connected without the hosted partner-referral flow, which is
 * captcha-gated and PayPal-side.
 *
 * Writes SIX mode-swapped metas, not one. The decisive one is
 * `..._enable_for_receive_payment`: `PayPal::is_available()` calls
 * `Helper::validate_cart_items()`, which requires it alongside the merchant id. Seeding
 * only the merchant id produces a vendor that reads as connected — the PayPal SDK even
 * loads with the right merchant-id — while the payment method never appears at checkout,
 * which makes every availability assertion pass for the wrong reason.
 *
 * `ucc` defaults false: UCC additionally needs PayPal-side PPCP_CUSTOM vetting and is
 * not genuinely seedable.
 */
export async function seedPayPalConnectedVendor(
    vendorId: string | number,
    merchantId: string,
    opts: { email?: string; ucc?: boolean } = {}
): Promise<SeedVendorResult> {
    return testRequest<SeedVendorResult>('post', '/seed-paypal-vendor', {
        vendor_id: Number(vendorId),
        merchant_id: merchantId,
        email: opts.email ?? 'seeded-vendor@example.test',
        ucc: opts.ucc ?? false,
    });
}

/** Remove BOTH mode variants of all six metas, so sandbox state cannot leak into a live-mode assertion. */
export async function clearPayPalVendor(vendorId: string | number): Promise<{ ok: boolean; deleted: string[]; receivable: boolean }> {
    return testRequest('post', '/clear-paypal-vendor', { vendor_id: Number(vendorId) });
}

/** Seed both suite vendors from the env-resolved merchant ids. */
export async function seedBothPayPalVendors(): Promise<SeedVendorResult[]> {
    return Promise.all([
        seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: 'dokangit@vendor1.com' }),
        seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' }),
    ]);
}

/* ------------------------------------------------------------------ */
/* Webhooks                                                            */
/* ------------------------------------------------------------------ */

export interface WebhookInjectResult {
    ok: boolean;
    event_type: string;
    event_id: string;
    is_handled: boolean;
    handler: string | null;
    threw: boolean;
    fatal: boolean;
    error: string | null;
}

/**
 * Dispatch an event straight into `EventFactory::handle()`, bypassing the signature
 * check — that check is a live outbound POST to PayPal's verify-webhook-signature API
 * with no filter, constant or test-mode bypass, so a signed event cannot be forged.
 *
 * ⚠️ `threw === false` does NOT mean the handler worked. `EventFactory::__callStatic`
 * catches \Exception itself and only logs it, so this flag reports \Error-class fatals
 * and little else. Every webhook spec must additionally assert a state mutation —
 * order meta, an order note, or a balance row. Asserting on the flag alone, or on an
 * HTTP status alone, passes against a completely dead gateway.
 */
export async function injectPayPalWebhook(
    eventType: string,
    resource: Record<string, unknown>,
    resourceType = ''
): Promise<WebhookInjectResult> {
    return testRequest<WebhookInjectResult>('post', '/paypal-webhook', {
        event_type: eventType,
        resource,
        resource_type: resourceType,
    });
}

/**
 * POST an event to the LIVE `?wc-api=dokan-paypal` endpoint with no signature headers.
 *
 * Returns the status code, but do not assert on it alone: `WebhookHandler` returns 200
 * and exits before reading the body when the gateway is not ready, so a 200 here is
 * consistent with a completely dead gateway. Assert absence of state change instead.
 */
export async function postUnsignedWebhook(eventType: string, resource: Record<string, unknown>): Promise<number> {
    const ctx = await request.newContext();
    try {
        const res = await ctx.post(PAYPAL_WEBHOOK_URL, {
            data: { id: `WH-unsigned-${Date.now()}`, event_type: eventType, resource },
        });
        return res.status();
    } finally {
        await ctx.dispose();
    }
}

/* ------------------------------------------------------------------ */
/* Refunds                                                             */
/* ------------------------------------------------------------------ */

/**
 * Trigger a Dokan API refund (method=1) so the module's refund controller runs the
 * PayPal refund.
 *
 * Do NOT assert on the returned `refund_amount` for a partial refund — it echoes the
 * order total, an inaccuracy inherited from the Stripe helper and preserved only so the
 * two responses stay shape-compatible.
 */
export async function refundOrderViaDokan(
    orderId: string | number,
    amount?: string | number,
    reason = 'e2e refund'
): Promise<{ ok: boolean; threw: boolean; error: string | null; is_wp_error: boolean }> {
    return testRequest('post', '/refund', {
        order_id: Number(orderId),
        ...(amount === undefined ? {} : { amount: String(amount) }),
        reason,
    });
}

/* ------------------------------------------------------------------ */
/* Unbranded card / Advanced Card (UCC) gate                            */
/* ------------------------------------------------------------------ */

/** One seller's gate-5 state: the meta the product itself reads, with the key resolved by the product. */
export interface UccVendorState {
    vendor_id: number;
    /** `Helper::get_seller_enable_for_ucc_key()` for the current mode — never a literal from this file. */
    meta_key: string | null;
    /** The stored value as a string (`''` when the row is absent). */
    raw: string;
    /** Bare truthiness of `raw`, i.e. the exact test at Cart/CartManager.php:60. */
    enabled: boolean;
}

/** The module is not loaded, so no gate can be resolved and every other field is absent. */
export interface UccStateModuleAbsent {
    module_active: false;
    skipped: string;
}

export interface UccStateResolved {
    module_active: true;
    skipped?: undefined;
    /** Raw settings rows — what an exact restore has to put back. `null` means the KEY IS ABSENT. */
    button_type_raw: string | null;
    ucc_mode_raw: string | null;
    /** Resolved product answers — what the gateway actually acts on. */
    button_type_resolved: string | null;
    is_ucc_mode_allowed: boolean | null;
    /** `Helper::is_ucc_enabled()` — the five-condition gate, cart-independent. Assert on THIS. */
    is_ucc_enabled: boolean | null;
    /**
     * `CartManager::is_ucc_enabled_for_all_seller_in_cart()`.
     *
     * ⚠️ Only meaningful when `cart_available` is true AND `cart_item_count > 0`. WooCommerce does
     * not build `WC()->cart` for a plain REST request, so over this transport the value is normally
     * computed against a null cart and comes back `false` — a property of the transport, not of the
     * gateway. And an EMPTY cart makes the product's per-seller loop never run, so it returns
     * whatever `is_ucc_enabled()` returned, i.e. `true` with no seller checked at all. Asserting on
     * it unconditionally therefore produces both a false red and a fake green depending only on
     * cart state. Use `is_ucc_enabled` plus `vendors` instead; both are cart-independent.
     */
    is_ucc_enabled_for_all_seller_in_cart: boolean | null;
    cart_available: boolean;
    cart_item_count: number | null;
    base_country: string | null;
    store_currency: string;
    /** Gate 3 — the product's own country map, keys only. */
    ucc_supported_countries: string[];
    /** Gate 4 — the product's own currency list for `base_country`. */
    ucc_supported_currencies: string[];
    ucc_meta_key: string | null;
    /** Keyed by vendor id as a string; only the ids passed in `vendorIds` appear. */
    vendors: Record<string, UccVendorState>;
}

export type UccState = UccStateResolved | UccStateModuleAbsent;

/** The two gateway settings rows the card path owns. `null` means DELETE the key (restore-to-absent). */
export interface UccGatePatch {
    ucc_mode?: string | null;
    button_type?: string | null;
}

export interface UccGateResult {
    ok: boolean;
    /** What was there BEFORE the write. `null` = the key was absent. Feed this straight back to restore. */
    previous: { ucc_mode: string | null; button_type: string | null };
    /** Only the keys this call actually wrote. */
    applied: UccGatePatch;
    state: UccState;
}

export interface VendorUccResult {
    ok: boolean;
    meta_key: string;
    enabled: boolean;
    vendor_ids: number[];
    /** Previous raw meta value per vendor id (string key), `''` when the row was absent. */
    previous: Record<string, string>;
    state: UccState;
}

const uccQuery = (vendorIds?: Array<string | number>): string =>
    vendorIds && vendorIds.length ? `?vendor_ids=${vendorIds.map(Number).join(',')}` : '';

/**
 * Read the UCC gate as the PRODUCT resolves it — `Helper::is_ucc_enabled()` and
 * `CartManager::is_ucc_enabled_for_all_seller_in_cart()`, not this suite's reconstruction of the
 * five conditions. A test that recomputes the gate from raw settings only proves its own copy of
 * the rule agrees with itself, and keeps passing when the product's rule changes.
 *
 * Pass the vendor ids whose gate-5 meta matters; they come back in `vendors`. A multi-vendor cart
 * needs BOTH, because gate 5 is all-or-nothing across the cart.
 */
export async function getUccState(vendorIds?: Array<string | number>): Promise<UccState> {
    return testRequest<UccState>('get', `/ucc-state${uccQuery(vendorIds)}`);
}

/**
 * Set `ucc_mode` / `button_type` and get back what was there before, so a case can restore EXACTLY
 * what it found instead of re-declaring a guessed baseline. Restoring is the same call:
 * `await setUccGate(result.previous)` — a `null` in the patch deletes the key again, which is a
 * different site state from writing `''`.
 *
 * MERGES: every other settings key (partner_id, test_app_*, title, disbursement_mode) survives.
 *
 * `button_type` is the one that breaks siblings. UCC needs `'smart'`; `placeClassicOrder()` in
 * paypalMarketplaceCheckout.spec.ts needs `'standard'` because it asserts `#place_order` is
 * visible. Restore in a `finally`, and in `afterEach` as well as `afterAll` — a card case that
 * leaves `'standard'` behind breaks every sibling spec that reads `window.dokan_paypal`, which is
 * only localized under `'smart'` (Cart/CartHandler.php:95-97).
 */
export async function setUccGate(patch: UccGatePatch, vendorIds?: Array<string | number>): Promise<UccGateResult> {
    return testRequest<UccGateResult>('post', '/ucc-gate', {
        ...patch,
        ...(vendorIds && vendorIds.length ? { vendor_ids: vendorIds.map(Number) } : {}),
    });
}

/**
 * Set or clear gate 5 — the per-seller UCC meta — with the key resolved through
 * `Helper::get_seller_enable_for_ucc_key()` rather than written as a literal.
 *
 * Pass EVERY seller that will be in the cart: `CartManager::is_ucc_enabled_for_all_seller_in_cart()`
 * (Cart/CartManager.php:48-62) is all-or-nothing, so one un-flagged seller removes the card form
 * entirely and the case silently falls back to a wallet-only page.
 *
 * `enabled: false` DELETES the meta, matching the suite baseline (an absent row). `previous`
 * reports the real prior value per vendor, so a caller that found something else can put it back.
 *
 * This is the LOCAL half of the gate only. PayPal-side PPCP_CUSTOM eligibility and the
 * `data-client-token` on `script#dokan_paypal_sdk-js` are not seedable from here; assert those
 * separately, with their own message, before typing into any card field.
 */
export async function setVendorUcc(
    vendorIds: string | number | Array<string | number>,
    enabled: boolean,
    opts: { testMode?: boolean } = {}
): Promise<VendorUccResult> {
    const ids = (Array.isArray(vendorIds) ? vendorIds : [vendorIds]).map(Number);

    return testRequest<VendorUccResult>('post', '/vendor-ucc', {
        vendor_ids: ids,
        enabled,
        ...(opts.testMode === undefined ? {} : { test_mode: opts.testMode }),
    });
}

/* ------------------------------------------------------------------ */
/* Outbound-PayPal interceptor (dokan-paypal-marketplace-edge-probes.php) */
/* ------------------------------------------------------------------ */

/** Options the mu-plugin probe reads and writes. Names must match the PHP constants exactly. */
const OPT_INTERCEPT_UNTIL = 'dokan_e2e_paypal_intercept_until';
const OPT_LAST_OUTBOUND = 'dokan_e2e_paypal_last_outbound';
const OPT_LAST_VERIFY = 'dokan_e2e_paypal_last_verify';

/**
 * The module's cached PayPal token. Deleted on both sides of an intercepted window so the fake
 * token the probe mints can never be reused by a later test that talks to PayPal for real.
 */
const ACCESS_TOKEN_ROWS = ['_transient__dokan_paypal_marketplace_access_token', '_transient_timeout__dokan_paypal_marketplace_access_token'];

/* ------------------------------------------------------------------ */
/* Interceptor lease — one holder at a time, across spec FILES         */
/* ------------------------------------------------------------------ */

/**
 * The interceptor is ONE site-wide switch: `dokan_e2e_paypal_intercept_until` plus the two recorder
 * options, and the mu-plugin hard-codes all three names
 * (mu-plugins/dokan-paypal-marketplace-edge-probes.php:43-49) — there is no per-owner suffix to
 * separate two callers by naming. `playwright.config.ts:49` runs four workers locally and different
 * FILES run concurrently, so without coordination the webhook spec's `armInterceptor()` deletes the
 * edge spec's create-order recorder, and the edge spec's `disarmInterceptor()` closes the webhook
 * spec's window mid-delivery. Either way a case goes RED for an environmental reason, which makes
 * the run report lie about the product exactly as badly as a fake green does.
 *
 * So the window is leased: a caller must hold `dokan_e2e_paypal_intercept_lease` before it may arm,
 * and only the holder may disarm. This row is JS-side coordination only — no PHP reads it.
 *
 * `@serial` is deliberately NOT the fix here: `playwright.config.ts:13` grep-inverts that tag in
 * both CI lanes, so tagging either file would delete it from CI rather than order it.
 */
const OPT_INTERCEPT_LEASE = 'dokan_e2e_paypal_intercept_lease';
const OPTIONS_TABLE = `${process.env.DB_PREFIX ?? 'wp'}_options`;

/** One token per worker process. The lease row carries it, so only its owner can release it. */
const LEASE_TOKEN = `pw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * The lease deliberately outlives the interceptor window it guards. "My lease expired while my
 * window is still armed" therefore cannot happen to a live test, and a test that is KILLED still
 * leaves both rows expiring on their own — the same self-healing property the wall-clock deadline
 * gives the PHP side.
 */
const LEASE_GRACE_SECONDS = 120;

/** Whether THIS worker currently holds the lease; a non-holder must never disarm. */
let leaseHeld = false;

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Take (or extend) the lease, returning whether it is now ours.
 *
 * A SINGLE statement, on purpose: MySQL row-locks the option row for its duration, so two workers
 * racing here cannot both come away believing they hold it. A read-then-write pair in JS can, and
 * the loser would then stomp the holder's armed window — the very collision this exists to stop.
 * The row is only overwritten when it is already ours (re-arm) or its deadline has passed.
 */
async function takeInterceptorLease(expiresAt: number): Promise<boolean> {
    const value = `${LEASE_TOKEN}|${expiresAt}`;
    await dbUtils.dbQuery(
        `INSERT INTO ${OPTIONS_TABLE} (option_name, option_value, autoload)
         VALUES (?, ?, 'no')
         ON DUPLICATE KEY UPDATE option_value = IF(
             SUBSTRING_INDEX(option_value, '|', 1) = ?
             OR CAST(SUBSTRING_INDEX(option_value, '|', -1) AS UNSIGNED) < UNIX_TIMESTAMP(),
             ?,
             option_value
         );`,
        [OPT_INTERCEPT_LEASE, value, LEASE_TOKEN, value],
    );
    return (await dbUtils.getOptionValueOrNull(OPT_INTERCEPT_LEASE)) === value;
}

async function releaseInterceptorLease(): Promise<void> {
    leaseHeld = false;
    // Scoped by token: if ours had already expired and another file took it, this deletes nothing.
    await dbUtils.dbQuery(`DELETE FROM ${OPTIONS_TABLE} WHERE option_name = ? AND SUBSTRING_INDEX(option_value, '|', 1) = ?;`, [OPT_INTERCEPT_LEASE, LEASE_TOKEN]);
}

/**
 * Arm the outbound interceptor for a bounded window and clear whatever a previous run recorded.
 *
 * A WALL-CLOCK DEADLINE, not a flag: a test killed between arming and disarming would otherwise
 * leave every later PayPal call on this site stubbed, and the specs that DO talk to PayPal would
 * then fail with an error naming neither this helper nor the test that armed it.
 *
 * Blocks until the lease is free, so the recorders it clears here can only ever be its own.
 * Re-arming inside an already-held window (the PP-WHK-24 positive control does exactly that) is
 * re-entrant and simply extends the lease.
 */
export async function armInterceptor(seconds = 180, waitMs = 300_000): Promise<void> {
    const waitUntil = Date.now() + waitMs;
    while (!(await takeInterceptorLease(Math.floor(Date.now() / 1000) + seconds + LEASE_GRACE_SECONDS))) {
        if (Date.now() >= waitUntil) {
            throw new Error(
                `could not take the PayPal interceptor lease (${OPT_INTERCEPT_LEASE}) within ${Math.round(waitMs / 1000)}s. Another spec file has held the site-wide interceptor armed for that whole time — arming anyway would clear its recorder and shorten its window, turning ITS case red for an environmental reason. Check for a spec that arms without a finally-disarm, or a stale lease row left by a killed run (it expires on its own ${LEASE_GRACE_SECONDS}s after the window it guarded).`,
            );
        }
        await sleep(1_000);
    }
    leaseHeld = true;
    await dbUtils.deleteOptionRow([OPT_LAST_OUTBOUND, OPT_LAST_VERIFY, ...ACCESS_TOKEN_ROWS]);
    await dbUtils.setOptionValue(OPT_INTERCEPT_UNTIL, String(Math.floor(Date.now() / 1000) + seconds), false);
}

/**
 * Close the window this worker opened. A no-op when this worker does not hold the lease, so a
 * blanket `afterEach` disarm in one file cannot strand a window another file is mid-delivery in.
 */
export async function disarmInterceptor(): Promise<void> {
    if (!leaseHeld) {
        return;
    }
    await dbUtils.deleteOptionRow([OPT_INTERCEPT_UNTIL, OPT_LAST_OUTBOUND, OPT_LAST_VERIFY, ...ACCESS_TOKEN_ROWS]);
    await releaseInterceptorLease();
}

/**
 * The JSON body the module handed to `Processor::create_order()`, or null when nothing was sent.
 *
 * Lives here rather than in the edge spec so the recorder has exactly ONE owner: the option it
 * reads is cleared by `armInterceptor()` above, and a second private copy of that pair is what let
 * the two files clear each other's evidence.
 */
export async function readCapturedCreateOrder<T = Record<string, unknown>>(): Promise<T | null> {
    const raw = await dbUtils.getOptionValueOrNull(OPT_LAST_OUTBOUND);
    if (typeof raw !== 'string' || raw === '') {
        return null;
    }
    try {
        const record = JSON.parse(raw) as { body?: unknown };
        return typeof record.body === 'string' ? (JSON.parse(record.body) as T) : null;
    } catch {
        return null;
    }
}

/**
 * The JSON body the module handed to `Processor::verify_webhook_request()`
 * (Utilities/Processor.php:432-441), or null when the module never attempted a signature
 * verification. The module logs neither the request nor its body, so this recorder is the only
 * evidence that the verification call was made at all — asserting on the webhook's HTTP status
 * instead passes against a gateway that never verifies anything.
 */
export async function readCapturedVerifyRequest<T = Record<string, unknown>>(): Promise<T | null> {
    const raw = await dbUtils.getOptionValueOrNull(OPT_LAST_VERIFY);
    if (typeof raw !== 'string' || raw === '') {
        return null;
    }
    try {
        const record = JSON.parse(raw) as { body?: unknown };
        return typeof record.body === 'string' ? (JSON.parse(record.body) as T) : null;
    } catch {
        return null;
    }
}

/* ------------------------------------------------------------------ */
/* Gateway-agnostic WooCommerce helpers                                */
/* ------------------------------------------------------------------ */

/**
 * WooCommerce-core operations with nothing gateway-specific in them — `ensureVendorStoreAddress`
 * works unchanged because PayPal reads the same `dokan_profile_settings['address']['country']`.
 * Re-exported so this suite's specs keep importing them from './helpers'.
 */
export {
    ensureBillingAddress,
    ensureCustomerAddress,
    ensureVendorStoreAddress,
    ensureClassicCheckoutPage,
    getOrderMetaValue,
    getOrderStatus,
    getOrderNotes,
    setOrderMeta,
    setOrderStatus,
} from '@utils/orderFixtures';

/* ------------------------------------------------------------------ */
/* Shared REST/DB readers — lifted out of the specs verbatim           */
/* ------------------------------------------------------------------ */

const DB_PREFIX = process.env.DB_PREFIX ?? 'wp';

/** Blank by default so nothing inherits an identity it was not given. */
type Headers = Record<string, string>;
const ANON: Headers = { Authorization: '' };
const ADMIN: Headers = payloads.adminAuth as Headers;

export interface Probe {
    status: number;
    text: string;
    json: Record<string, unknown> | undefined;
}

/** REST/HTTP probe. `Authorization` is blank unless a caller supplies one — see the file header. */
export async function probe(
    url: string,
    opts: {
        method?: 'get' | 'post' | 'put' | 'delete';
        headers?: Headers;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data?: any;
        form?: Record<string, string | number>;
        maxRedirects?: number;
    } = {},
): Promise<Probe> {
    const headers: Headers = { ...ANON, ...(opts.headers ?? {}) };
    const ctx = await request.newContext({ extraHTTPHeaders: headers });
    try {
        const options: { data?: unknown; form?: Record<string, string | number>; maxRedirects?: number } = {};
        if (opts.data !== undefined) options.data = opts.data;
        if (opts.form !== undefined) options.form = opts.form;
        if (opts.maxRedirects !== undefined) options.maxRedirects = opts.maxRedirects;

        const method = opts.method ?? 'get';
        const res =
            method === 'get'
                ? await ctx.get(url, options)
                : method === 'put'
                  ? await ctx.put(url, options)
                  : method === 'delete'
                    ? await ctx.delete(url, options)
                    : await ctx.post(url, options);

        const text = await res.text();
        let json: Record<string, unknown> | undefined;
        try {
            json = JSON.parse(text) as Record<string, unknown>;
        } catch {
            json = undefined;
        }
        return { status: res.status(), text, json };
    } finally {
        await ctx.dispose();
    }
}

/** Real HTTP DELETE — a POST to the same URL hits WooCommerce's EDITABLE route and silently updates instead. */
export async function deleteOrder(orderId: string | number): Promise<void> {
    await probe(`${SERVER_URL}/wc/v3/orders/${orderId}?force=true`, { method: 'delete', headers: ADMIN }).catch(() => undefined);
}

/**
 * Whether a vendor still reads as PayPal-connected, without touching the DB.
 *
 * `RegisterWithdrawMethods::add_paypal_marketplace_to_vendor_profile_data()` puts
 * `payment['dokan-paypal-marketplace'] = is_seller_enable_for_receive_payment( $vendor )` on the
 * store payload, and only for an admin or the vendor themselves — which is exactly the case
 * where Lite's `filter_payment_response` does NOT redact. So an ADMIN read of the store is a
 * faithful connected/disconnected oracle.
 */
export async function isVendorConnected(vendorId: string | number): Promise<boolean> {
    const res = await probe(`${SERVER_URL}/dokan/v1/stores/${vendorId}`, { headers: ADMIN });
    const payment = (res.json?.payment ?? {}) as Record<string, unknown>;
    return payment[PAYPAL_WITHDRAW_METHOD_ID] === true;
}

export async function adminContext(): Promise<APIRequestContext> {
    return request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
}

/**
 * Superset of the two local `WcOrder` shapes (Split's is the wider; Ucc's fields are all present
 * here with the same types), so both files' consumers resolve against exactly what they do today.
 */
export interface WcOrder {
    id: number;
    parent_id: number;
    status: string;
    currency: string;
    order_key: string;
    total: string;
    total_tax: string;
    shipping_total: string;
    shipping_tax: string;
    discount_total: string;
    line_items: Array<{ id: number; name: string; product_id: number; quantity: number; subtotal: string; total: string }>;
    fee_lines: Array<{ id: number; name: string; total: string }>;
    meta_data: Array<{ key: string; value: unknown }>;
}

export async function getWcOrder(orderId: string | number): Promise<WcOrder> {
    const ctx = await adminContext();
    try {
        const res = await ctx.get(`${SERVER_URL}/wc/v3/orders/${orderId}`);
        if (!res.ok()) {
            throw new Error(`GET /wc/v3/orders/${orderId} failed (HTTP ${res.status()}): ${(await res.text()).slice(0, 300)}`);
        }
        return (await res.json()) as WcOrder;
    } finally {
        await ctx.dispose();
    }
}

export interface DokanOrderRow {
    order_id: number;
    seller_id: number;
    order_total: number;
    net_amount: number;
}

/**
 * `wp_dokan_orders` — written by `dokan_sync_insert_order()` from inside `create_sub_order()` during
 * the SPLIT, i.e. before any payment. `order_total - net_amount` is exactly what
 * `dokan()->commission->get_earning_by_order( $order, 'admin' )` returns when the row exists
 * (`Commission.php:391-393`), and that call is what the platform fee was built from.
 */
export async function getDokanOrderRows(orderIds: Array<string | number>): Promise<DokanOrderRow[]> {
    if (orderIds.length === 0) {
        return [];
    }
    const placeholders = orderIds.map(() => '?').join(', ');
    const rows = (await dbUtils.dbQuery(
        `SELECT order_id, seller_id, order_total, net_amount FROM \`${DB_PREFIX}_dokan_orders\` WHERE order_id IN (${placeholders});`,
        orderIds.map(id => String(id)),
    )) as Array<{ order_id: number; seller_id: number; order_total: string | number; net_amount: string | number }>;

    return rows.map(row => ({
        order_id: Number(row.order_id),
        seller_id: Number(row.seller_id),
        order_total: Number(row.order_total ?? 0),
        net_amount: Number(row.net_amount ?? 0),
    }));
}

/* ------------------------------------------------------------------ */
/* Gateway settings — the stored option every settings-touching spec reads */
/* ------------------------------------------------------------------ */

export type GatewaySettings = Record<string, string>;

/**
 * Built by concatenation at `Helper.php:46`; the literal never appears in dokan-pro source.
 *
 * Built from `PAYPAL_GATEWAY_ID` rather than from `PAYPAL_IDS.gateway`: `paypalMarketplacePage.ts`
 * already imports FROM this file, so importing `PAYPAL_IDS` back would close a cycle. The string is
 * identical either way.
 */
export const GATEWAY_OPTION = `woocommerce_${PAYPAL_GATEWAY_ID}_settings`;

/**
 * Read the stored gateway settings map.
 *
 * `dbUtils.getOptionValue` throws on a missing row (it indexes `res[0]` unguarded), and an absent
 * option is a legitimate state here, so the ABSENT case — and only that case — resolves to an empty
 * map via `getOptionValueOrNull`. A `try/catch` around the read would have swallowed every other
 * database failure too (pool exhaustion, deadlock, timeout), and both mutators below write back
 * whatever this returns: one transient read error would then REPLACE the whole gateway option with
 * a one-to-three-key map, destroying enabled/partner_id/test_app_* with no mention of the database
 * in any failure message. Real driver errors must therefore propagate.
 */
export async function readGatewaySettings(): Promise<GatewaySettings> {
    const value = await dbUtils.getOptionValueOrNull(GATEWAY_OPTION);
    return value && typeof value === 'object' ? (value as GatewaySettings) : {};
}

/** Precondition writer. Merges into the stored map; works with or without credentials. */
export async function mergeGatewaySettings(patch: GatewaySettings): Promise<void> {
    const settings = await readGatewaySettings();
    await dbUtils.setOptionValue(GATEWAY_OPTION, { ...settings, ...patch });
}

/* ------------------------------------------------------------------ */
/* Money / probe formatting                                            */
/* ------------------------------------------------------------------ */

export interface PayPalAmount {
    currency_code?: string;
    value?: string;
}

/** A breakdown key PayPal omits when it is zero must compare equal to an explicit "0.00". */
export function amountOf(value: PayPalAmount | undefined): string {
    return value?.value ?? '0.00';
}

/** PayPal returns decimal STRINGS, so money is compared with a cent of tolerance, never for identity. */
export function near(a: number, b: number, tolerance = 0.01): boolean {
    return Math.abs(a - b) <= tolerance + Number.EPSILON;
}

/**
 * Assertion messages are built EAGERLY by Playwright, before the condition is evaluated, so a
 * message that can throw turns a PASSING case into a failure. `JSON.stringify(undefined)` returns
 * the VALUE `undefined`, not a string, which is why the `?? '…'` guard is not decorative.
 */
export function describeProbe(probe: unknown): string {
    return JSON.stringify(probe) ?? 'probe unavailable';
}

/** The six card-form marker counts every card probe in this suite carries. */
export interface CardFormProbe {
    container: number;
    cardNumber: number;
    cardExpiry: number;
    cvv: number;
    nameOnCard: number;
    contingencyLightbox: number;
}

/** Total count of card-form markers. Zero means the 3DS/UCC template was not rendered at all. */
export function cardFormMarkers(probe: CardFormProbe): number {
    return probe.container + probe.cardNumber + probe.cardExpiry + probe.cvv + probe.nameOnCard + probe.contingencyLightbox;
}
