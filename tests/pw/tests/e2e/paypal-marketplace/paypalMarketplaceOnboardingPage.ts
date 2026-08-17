import { ADMIN_AJAX_URL, PERSISTENT_CART_META, VENDOR2, siteUrl } from './paypalMarketplaceShared';
import type { Headers } from './paypalMarketplaceShared';
import { test, expect, request, Browser, Page } from '@utils/test';
import { SERVER_URL, BASE_URL } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { log } from '@utils/logger';
import { PayPalMarketplacePage, PAYPAL_IDS } from './paypalMarketplacePage';
import {
    VENDOR_ID,
    VENDOR2_ID,
    CUSTOMER_ID,
    vendorAuth,
    vendor2Auth,
    customerAuth,
    adminAuth,
    PAYPAL_MERCHANTS,
    PAYPAL_EVENTS,
    hasCredentials,
    HAS_REAL_MERCHANTS,
    merchantGateReason,
    getBothMerchantConsents,
    isPayableMerchant,
    ensurePayPalConfigured,
    ensureVendorStoreAddress,
    getPayPalStatus,
    seedPayPalConnectedVendor,
    clearPayPalVendor,
    injectPayPalWebhook,
    probe,
    isVendorConnected,
} from './helpers';

/**
 * PayPal Marketplace — vendor onboarding and connection · PP-ONB 01..18.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * WHAT THIS FILE PROVES, AND WHAT IT DELIBERATELY DOES NOT
 * ────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Onboarding is the step that decides WHO GETS PAID. Every purchase unit the module later builds
 * carries `payee.merchant_id`, and that value comes from exactly one place: the vendor meta this
 * flow writes. A bug anywhere in here does not fail a checkout — it silently pays the wrong
 * account, or pays nobody. So every assertion below is anchored on the STORED VENDOR IDENTITY,
 * read back from the database or from an admin-authenticated REST read, never on a UI state that
 * merely looks connected.
 *
 * NO TEST IN THIS FILE CAPTURES MONEY. Onboarding creates no PayPal order and no capture. Four
 * cases (PP-ONB-06, -12, -13, -14) do make LIVE, outbound calls to PayPal's sandbox on the
 * product's behalf — a partner-referral creation and three merchant-status reads — but none of
 * them moves a cent, and none of them can. They are gated on real merchant consent anyway,
 * because a merchant-status read against an unconsented merchant fails opaquely and would turn a
 * product assertion into a credentials assertion.
 *
 * ─── The hosted consent screen is NOT driven to completion, and that is a decision, not a gap ───
 *
 * PP-ONB-06 stops at the handoff: it asserts that the module really did mint a PayPal-hosted
 * referral URL, and it then fetches that URL to prove PayPal itself accepts it. It does NOT log
 * a sandbox business account in and click through the consent screens. Three reasons, in order of
 * weight:
 *
 *   1. Granting partner consent is a PERMANENT, PayPal-side mutation of the two sandbox business
 *      accounts this entire suite depends on. `HANDOFF.md` §2 records that both vendors are
 *      genuinely onboarded with `payments_receivable=true` and a tracking id that proves the
 *      consent came from our referral. There is no API that un-grants consent, so a botched
 *      re-consent is not restorable and would take the whole money path down with it. Money rule
 *      M5 (clean up after money) cannot be satisfied for this action, so the action is not taken.
 *   2. Completing it proves nothing extra about Dokan. Verified manually on 2026-07-31: PayPal
 *      terminates the flow on its OWN `unifiedonboarding/…/done` page and NEVER redirects to the
 *      `return_url` Dokan supplied, so `authorize_paypal_marketplace()` →
 *      `handle_connect_success_response()` (RegisterWithdrawMethods.php:303-319) never runs. The
 *      vendor is left exactly where PP-ONB-06 already asserts they are: `connection_status`
 *      `pending`, with no merchant id written. Everything downstream of that point is reached in
 *      production by the MERCHANT.ONBOARDING.COMPLETED webhook instead — which is PP-ONB-12, and
 *      which this file does drive for real.
 *   3. The catalogue scopes the case that way: "The flow is asserted up to the handoff only".
 *
 * `PAYPAL_MARKETPLACE_VENDOR1_EMAIL` / `_PASSWORD` (surfaced as `PAYPAL_VENDOR_LOGINS` in
 * helpers.ts) therefore stay unused by this file. They exist for a one-off, human-run
 * re-onboarding, not for a suite that runs on every push.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * FACTS THIS FILE IS BUILT ON — each one already produced a wrong answer for somebody
 * ────────────────────────────────────────────────────────────────────────────────────────────
 *
 * 1. THE SCREEN. `/dashboard/settings/payment-manage-dokan-paypal-marketplace`. HYPHENATED
 *    withdraw-method id, and NO `-edit` suffix. `payment-manage-paypal-edit` is Dokan Lite's
 *    legacy PayPal Standard method — a different screen that stores a payout email and performs
 *    no onboarding at all. A spec pointed at it finds a form, fills it, and proves nothing.
 *
 * 2. THE CONTROL. An `<a>` labelled **"Sign Up"** (vendor-settings-payment.php:49-51), not a
 *    `<button>` labelled "Connect". `getByRole('button', { name: 'Connect' })` matches nothing on
 *    a perfectly working site.
 *
 * 3. THE ORDER OF OPERATIONS. Dokan calls `create_partner_referral()` SERVER-SIDE FIRST
 *    (RegisterWithdrawMethods.php:209-210) and only then opens the returned `action_url`. A
 *    partner app without referral scope fails before any window exists, so "no popup appeared" is
 *    a symptom of the APP, not of the button. Sandbox apps must be created as type **Platform**;
 *    a Merchant-type app returns 403 from `POST /v2/customer/partner-referrals` and the app type
 *    is fixed at creation.
 *
 * 4. THE COUNTRY GUARD RETURNS TWO DIFFERENT STRINGS (RegisterWithdrawMethods.php:192-206):
 *      - AJAX JSON `data.message`  = `Vendor's country is not supported by PayPal.`
 *      - redirect `message` query arg = `Selected country is not supported by PayPal. Please
 *        contact to your admin for further instruction.`
 *    The response also sets `reload: true`, and the template's JS then does
 *    `window.location.href = result.data.url` (vendor-settings-payment.php:136-142), so THE
 *    SECOND STRING IS THE ONE THE VENDOR SEES. A UI assertion on the first can never match.
 *    PP-ONB-04 asserts both, on the two surfaces they each belong to.
 *
 * 5. THAT QUERY ARG IS DOUBLE-ENCODED. The handler `rawurlencode()`s the message, and
 *    `add_query_arg()` then runs `urlencode_deep()` over the whole query string
 *    (wp-includes/functions.php:1183). A single `decodeURIComponent()` leaves `%20` behind.
 *    `decodeFully()` below decodes until the value stops changing.
 *
 * 6. DOK-029 LIVES IN THIS HANDLER'S SIBLING. `authorize_paypal_marketplace()` guards its three
 *    GET actions with "<guard shape withheld>"
 *    (source coordinates withheld) — the absent-nonce case is mishandled.
 *    That CRITICAL is owned by **PP-SEC-15** and is deliberately not re-tested here. What PP-ONB-03
 *    pins is the CONTRAST: the AJAX connect handler at :146 is written correctly as
 *    "<correctly-ordered guard>", so absent and forged are both refused.
 *    Two guards, ten lines apart, opposite polarity — that contrast is the regression risk.
 *
 * 7. A VALID NONCE ONLY EXISTS ON THE UNCONNECTED SCREEN. `paypal_connect_button()` passes the
 *    nonce into the template, but the template only prints the script carrying it when
 *    `$load_connect_js` — i.e. `! is_seller_enabled && empty( $merchant_id )`
 *    (source coordinates withheld). Every test needing a real nonce clears the vendor first.
 *
 * 8. RENDERING THE MIDDLE TEMPLATE BRANCH MAKES A LIVE PAYPAL CALL. When a vendor has a merchant
 *    id but is not yet enabled, `paypal_connect_button()` calls
 *    `WithdrawManager::update_merchant_status()` on page render (RegisterWithdrawMethods.php:116-121).
 *    No test here parks a vendor in that state by accident; the two states used are "all six metas"
 *    and "no metas".
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────
 * STATE, AND WHY EVERY TEST REBUILDS IT
 * ────────────────────────────────────────────────────────────────────────────────────────────
 *
 * The suite's canonical resting state is BOTH VENDORS SEEDED CONNECTED. Nine of these eighteen
 * cases need the opposite. There is no `test.describe.serial` here (HANDOFF trap 1: it silently
 * deleted 46 of 68 cases on 2026-07-31), so a failure never cascades — which also means no test
 * may inherit another's state. Every test therefore asserts or rebuilds its own precondition in
 * its first lines, and `afterAll` restores the resting state unconditionally.
 *
 * Shared-state hazard, documented and accepted rather than fixed: these tests mutate vendor1 and
 * vendor2 user meta, so running this file concurrently with another PayPal spec in a second
 * worker would interleave. Local and CI runs both use `--workers=1` for this suite. The real fix
 * is a throwaway vendor per file (HANDOFF §7.5); it is not built here because a throwaway vendor
 * has no PayPal-side consent and would make PP-ONB-12/-13/-14 unrunnable.
 *
 * Never tagged `@serial` — `playwright.config.ts:13` grep-inverts it in BOTH lanes, which would
 * delete this file from CI without a word.
 */

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** admin-ajax lives at the SITE ROOT; `SERVER_URL` ends in `/wp-json`. */


export const CONNECT_AJAX_ACTION = 'dokan_paypal_marketplace_connect';


export const ADMIN: Headers = payloads.adminAuth as Headers;


/**
 * A country PayPal's branded map does not contain.
 *
 * `BD` is chosen after reading BOTH maps in `Helper.php:201-330`. Note the trap that makes the
 * obvious choice wrong: `CN` is REWRITTEN to `C2` at `Helper::get_product_type()` (Helper.php:456-458)
 * and `C2` IS in the branded map, so a test using China as "unsupported" fails against correct code.
 */
export const UNSUPPORTED_COUNTRY = 'BD';

/** In the UCC map and the branded map both, so the guard passes whatever `ucc_mode` is set to. */
export const SUPPORTED_COUNTRY = 'US';

/** Exact copy from RegisterWithdrawMethods.php:196 — the AJAX JSON `data.message`. */
export const COUNTRY_AJAX_MESSAGE = "Vendor's country is not supported by PayPal.";

/** Exact copy from RegisterWithdrawMethods.php:201 — the string carried in the redirect, and the one the vendor reads. */
export const COUNTRY_VISIBLE_MESSAGE = 'Selected country is not supported by PayPal. Please contact to your admin for further instruction.';

/** Exact copy from RegisterWithdrawMethods.php:170. */
export const EMAIL_REQUIRED_MESSAGE = 'Email address field is required.';

/** Exact copy from RegisterWithdrawMethods.php:150. */
export const NONCE_MESSAGE = 'Are you cheating?';

/** The navigation slug every rejection redirects back to. Hyphenated, no `-edit`. */
export const SETTINGS_SLUG = `settings/payment-manage-${PAYPAL_IDS.withdrawMethod}`;


/** Live meta keys, spelled out. PP-ONB-09 must compare against a literal, not against the key the product just handed it. */
export const LIVE_MODE_KEYS = {
    merchantId: '_dokan_paypal_merchant_id',
    enableForReceive: '_dokan_paypal_enable_for_receive_payment',
    marketplaceSettings: '_dokan_paypal_marketplace_settings',
} as const;

export const TEST_MODE_KEYS = {
    merchantId: '_dokan_paypal_test_merchant_id',
    enableForReceive: '_dokan_paypal_test_enable_for_receive_payment',
    marketplaceSettings: '_dokan_paypal_test_marketplace_settings',
} as const;

/* ------------------------------------------------------------------ */
/* Skip reasons — each names exactly what is missing and what it blocks */
/* ------------------------------------------------------------------ */

export const NO_CREDENTIALS =
    'No PayPal partner credentials are configured (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / ' +
    'TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE). Without all three `Helper::is_ready()` is false, `RegisterWithdrawMethods::register_methods()` ' +
    'returns early (RegisterWithdrawMethods.php:76-78), and the PayPal Marketplace payment-settings screen does not exist for any vendor — ' +
    'so every onboarding assertion here would be a statement about an unconfigured site rather than about the module.';

/* ------------------------------------------------------------------ */
/* Vendor state — read and write                                       */
/* ------------------------------------------------------------------ */

/**
 * Raw usermeta read. Deliberately NOT `dbUtils.getUserMeta()`: that unserializes unconditionally
 * and THROWS both on a plain string (a merchant id is one) and on a missing row (which is the
 * expected result of half the assertions in this file).
 */
export const readMeta = (userId: string | number, metaKey: string): Promise<string | null> => dbUtils.getUserMetaValue(userId, metaKey);

/** All six mode-swapped keys for the CURRENT mode, resolved by the product itself via `/status`. */
export async function currentVendorMetaKeys(): Promise<Record<string, string>> {
    const status = await getPayPalStatus();
    return status.vendor_meta_keys ?? {};
}

/** Restore the resting state: both vendors seeded connected with their real merchant ids. */
export async function reseedBothVendors(): Promise<void> {
    await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: 'dokangit@vendor1.com' });
    await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: 'dokangit@vendor2.com' });
}

/**
 * Assert the gateway is actually ready before any onboarding UI is opened.
 *
 * Without this, a mis-configured site fails with `.dokan-paypal-marketplace-container` never
 * becoming visible after 30s — a timeout that reads as "the onboarding screen is broken" when the
 * real cause is that `register_methods()` never registered the method at all.
 */
export async function requireGatewayReady(caseId: string): Promise<void> {
    const status = await getPayPalStatus();
    expect(
        status.is_ready,
        `${caseId}: Helper::is_ready() is false on this site (enabled=${status.is_enabled}, has_partner_id=${status.has_partner_id}, ` +
            `module_active=${status.module_active}). RegisterWithdrawMethods::register_methods() returns early at ` +
            'RegisterWithdrawMethods.php:76-78 when the gateway is not ready, so the PayPal payment-settings screen is not rendered for ' +
            'ANY vendor and nothing about onboarding can be observed. Fix the gateway configuration before reading this result as an onboarding defect.',
    ).toBe(true);
    expect(
        status.is_test_mode,
        `${caseId}: the gateway is in LIVE mode. Every meta key this file reads is mode-swapped (Helper.php:483-548), so a live-mode run ` +
            'would read the live keys while the seed wrote the sandbox ones and every connection assertion would be a mode mismatch rather than a product result.',
    ).toBe(true);
}

/* ------------------------------------------------------------------ */
/* Browser driving                                                     */
/* ------------------------------------------------------------------ */

/**
 * Run a body against a fresh page for one stored identity, and always tear it down.
 *
 * `baseURL` is passed EXPLICITLY. `browser.newContext()` does not inherit the config's `use`
 * options — only the `context`/`page` fixtures do, via `_contextFactory`
 * (playwright/lib/index.js:357-386) — so without it every relative navigation the page object
 * performs (`/dashboard/settings/…`, `/checkout/`, `/?p=…&add-to-cart=…`) throws an invalid-URL
 * error that reads like a broken selector rather than a missing base.
 */
export async function withUser<T>(browser: Browser, storageState: string, body: (page: Page, paypal: PayPalMarketplacePage) => Promise<T>): Promise<T> {
    const ctx = await browser.newContext({ storageState, baseURL: BASE_URL });
    const page = await ctx.newPage();
    try {
        return await body(page, new PayPalMarketplacePage(page));
    } finally {
        await page.close();
        await ctx.close();
    }
}

/**
 * Pull the REAL connect nonce out of the rendered onboarding screen.
 *
 * The template inlines it into the AJAX payload literal (vendor-settings-payment.php:111-115) and
 * prints that script only when `$load_connect_js` is true, i.e. for a vendor with no merchant id
 * and no receive-payment flag. The match is anchored on the action name rather than on the bare
 * word `nonce`, because a Dokan dashboard page carries several unrelated nonces and picking the
 * wrong one would produce a "nonce rejected" result against a correctly-issued nonce.
 */
export async function harvestConnectNonce(page: Page): Promise<string> {
    const html = await page.content();
    const match = html.match(new RegExp(`action:\\s*"${CONNECT_AJAX_ACTION}"[\\s\\S]{0,600}?nonce:\\s*'([A-Za-z0-9]+)'`));
    return match?.[1] ?? '';
}

export interface AjaxEnvelope {
    success?: boolean;
    data?: { type?: string; message?: string; reload?: boolean; url?: string };
}

export interface AjaxResult {
    status: number;
    text: string;
    body: AjaxEnvelope;
}

/**
 * POST the connect action from INSIDE the vendor's own logged-in page.
 *
 * Deliberately an in-page `fetch` rather than a Playwright request context carrying a copied
 * Cookie header. `wp_verify_nonce()` binds a nonce to the user id AND the session token from the
 * logged-in cookie, so the request must travel on exactly the session that minted the nonce.
 * Driving it from the page makes that structurally true instead of dependent on a correct cookie
 * copy, and it sidesteps the `request.newContext()` admin-Basic-auth inheritance trap entirely
 * because no Playwright request context is involved.
 */
export async function postConnect(page: Page, fields: Record<string, string>): Promise<AjaxResult> {
    const raw = await page.evaluate(
        async ({ url, payload }: { url: string; payload: Record<string, string> }) => {
            const form = new URLSearchParams();
            for (const [key, value] of Object.entries(payload)) {
                form.append(key, value);
            }
            const res = await fetch(url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: form.toString(),
            });
            return { status: res.status, text: await res.text() };
        },
        { url: ADMIN_AJAX_URL, payload: fields },
    );

    let body: AjaxEnvelope = {};
    try {
        body = JSON.parse(raw.text) as AjaxEnvelope;
    } catch {
        body = {};
    }
    return { status: raw.status, text: raw.text, body };
}

/**
 * Decode a query-arg value until it stops changing.
 *
 * The module `rawurlencode()`s the message and `add_query_arg()` then `urlencode_deep()`s the
 * whole query string (wp-includes/functions.php:1183), so the value on the wire is DOUBLE encoded
 * and a single `decodeURIComponent()` leaves `%20` in place of every space. Capped at four passes
 * so a pathological value cannot loop.
 */
export function decodeFully(value: string): string {
    let current = value;
    for (let i = 0; i < 4; i++) {
        let next: string;
        try {
            next = decodeURIComponent(current.replace(/\+/g, ' '));
        } catch {
            return current;
        }
        if (next === current) return current;
        current = next;
    }
    return current;
}

/** The `message` query arg of a redirect URL, fully decoded. Returns '' when the arg is absent. */
export function messageParam(url: string | undefined): string {
    if (!url) return '';
    const match = url.match(/[?&]message=([^&]*)/);
    return match?.[1] === undefined ? '' : decodeFully(match[1]);
}

/** Non-null when the PayPal side cannot support the four live-call cases. Names the exact cause. */
export let consentSkipReason: string | null = null;

export let metaKeys: Record<string, string> = {};

export let vendorProductId = '';

export let vendorProductPermalink = '';

export let vendorShopUrl = '';

/** Byte-exact backup of vendor1's profile settings, restored verbatim in afterAll. */
export let vendor1ProfileBackup: string | null = null;

export class PayPalMarketplaceOnboardingPage {
    async setupAll(): Promise<void> {
        // No `test.skip()` here: it would void the whole describe silently and every case would
        // report as "not a failure". Each gated case carries its own skip naming what is missing.
        await ensurePayPalConfigured();
        await ensureVendorStoreAddress(VENDOR_ID, SUPPORTED_COUNTRY);
        await ensureVendorStoreAddress(VENDOR2_ID, SUPPORTED_COUNTRY);
        await reseedBothVendors();

        vendor1ProfileBackup = await readMeta(VENDOR_ID, 'dokan_profile_settings');
        metaKeys = await currentVendorMetaKeys().catch(() => ({}));

        // The PayPal-side gate the FORMAT gate cannot see. `HAS_REAL_MERCHANTS` inspects the shape
        // of a merchant id; consent is separate state held entirely by PayPal, and only consent
        // decides whether a merchant-status read succeeds. A gate that opens on an unusable value
        // is worse than one that stays shut.
        if (!hasCredentials) {
            consentSkipReason = NO_CREDENTIALS;
        } else if (!HAS_REAL_MERCHANTS) {
            consentSkipReason = merchantGateReason() ?? 'the configured vendor merchant ids are placeholders, not real PayPal accounts.';
        } else {
            try {
                const consents = await getBothMerchantConsents();
                // `isPayableMerchant()` is connected && payments_receivable. The onboarding
                // handlers need one thing more: `WithdrawManager::update_merchant_status()` flips
                // the receive-payment gate only when payments_receivable AND
                // primary_email_confirmed are BOTH true (WithdrawManager.php:91). Gating on the
                // looser condition would let PP-ONB-12/-13/-14 run and then fail on a PayPal
                // account state rather than on a Dokan defect.
                const unusable = Object.entries(consents).filter(([, consent]) => !isPayableMerchant(consent) || !consent.primaryEmailConfirmed);
                if (unusable.length > 0) {
                    consentSkipReason =
                        'PayPal does not report these suite vendors as payable under our partner app, so any merchant-status read the module performs ' +
                        'will fail and the resulting assertion would be about credentials rather than about the product: ' +
                        unusable
                            .map(
                                ([label, consent]) =>
                                    `${label} (${consent.merchantId}) → ${
                                        consent.reason ??
                                        `connected=${consent.connected} payments_receivable=${consent.paymentsReceivable} primary_email_confirmed=${consent.primaryEmailConfirmed}`
                                    }`,
                            )
                            .join(' · ') +
                        '. A "NOT_AUTHORIZED / insufficient permissions" reason means the sandbox REST app is type Merchant rather than Platform ' +
                        '(app type is fixed at creation); a "merchant permission doesn\'t exist for this integration" reason means that VENDOR never granted consent.';
                }
            } catch (err) {
                consentSkipReason = `the PayPal merchant-consent probe itself failed, so payability is unknown and the live-call cases cannot be trusted either way: ${String(err)}`;
            }
        }

        if (consentSkipReason) {
            log.warn('PP-ONB: the four live-PayPal onboarding cases are gated off.', consentSkipReason);
        }

        const api = new ApiUtils(await request.newContext());
        try {
            const [productBody, productId] = await api.createProduct(
                { ...payloads.createProduct(), name: 'PP Onboarding Vendor1 Product', regular_price: '23' },
                payloads.vendorAuth,
            );
            vendorProductId = productId;
            vendorProductPermalink = typeof productBody?.permalink === 'string' ? productBody.permalink : '';
        } finally {
            await api.dispose();
        }

        const store = await probe(`${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}`, { headers: ADMIN });
        vendorShopUrl = typeof store.json?.shop_url === 'string' ? store.json.shop_url : '';
    }

    async teardownAll(): Promise<void> {
        // Restore the resting state unconditionally, whatever failed. Every later balance,
        // availability and split assertion in the sibling money specs presumes it.
        await ensurePayPalConfigured().catch(() => undefined);
        if (vendor1ProfileBackup !== null) {
            // Byte-exact restore of the serialized profile — no round trip through a serializer,
            // so a country test cannot leave the vendor's store address subtly rewritten.
            await dbUtils.setUserMeta(String(VENDOR_ID), 'dokan_profile_settings', vendor1ProfileBackup, false).catch(() => undefined);
        }
        await reseedBothVendors().catch(() => undefined);
        await dbUtils.clearCustomerCart(CUSTOMER_ID).catch(() => undefined);

        if (vendorProductId) {
            await probe(`${SERVER_URL}/wc/v3/products/${vendorProductId}?force=true`, { method: 'delete', headers: ADMIN }).catch(() => undefined);
        }
    }

    async ppOnb01({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-01');

        await clearPayPalVendor(VENDOR_ID);
        expect(
            await isVendorConnected(VENDOR_ID),
            'vendor1 still reads as PayPal-connected after clearPayPalVendor() removed both mode variants of all six metas — the precondition never took, so "the connect UI is offered" below would be an assertion about the connected branch of the template.',
        ).toBe(false);

        try {
            await withUser(browser, vendorAuth, async (page, paypal) => {
                await paypal.gotoVendorPaymentSettings();

                const sel = PayPalMarketplacePage.vendor;
                await expect(
                    page.locator(sel.email),
                    'the PayPal email input (#vendor_paypal_email_address, vendor-settings-payment.php:42) is missing for a vendor with no PayPal metas — an unconnected vendor cannot start onboarding at all, which blocks every payout they would ever receive',
                ).toBeVisible();
                await expect(
                    page.locator(sel.connect),
                    'the "Sign Up" connect anchor (vendor-settings-payment.php:49-51) is missing. Note it is an <a>, not a <button>, and its label is "Sign Up" and not "Connect" — if this fails, confirm the label before concluding the control is gone',
                ).toBeVisible();
                await expect(
                    page.locator(PayPalMarketplacePage.misc.vendorConnectButton),
                    'the connect-button container #paypal_connect_button (vendor-settings-payment.php:54) is absent, so the template\'s JS has nowhere to render the PayPal-hosted handoff link and the flow dead-ends after the AJAX call',
                ).toBeAttached();

                expect(
                    await page.locator(sel.disconnect).count(),
                    'a Disconnect control is offered to a vendor who has never connected — the connected branch of the template is rendering for an unconnected vendor, which means the connection oracle the whole module relies on is wrong',
                ).toBe(0);
                expect(
                    await page.locator(sel.connectedAlert).count(),
                    'the "account is connected / Merchant ID" success alert is rendered for a vendor with no merchant id',
                ).toBe(0);

                // Proves the `$load_connect_js` branch (source coordinates withheld) rendered:
                // without it the Sign Up anchor is present but inert, which looks identical on screen.
                expect(
                    await harvestConnectNonce(page),
                    'the connect script carrying the AJAX nonce did not render, so the "Sign Up" anchor has no click handler bound and the button is decorative. $load_connect_js is `! is_seller_enabled && empty( $merchant_id )` at RegisterWithdrawMethods.php:133',
                ).not.toBe('');
            });
        } finally {
            await reseedBothVendors();
        }

        log.success('PP-ONB-01: the unconnected vendor screen renders the email field, the Sign Up anchor, the button container and a live connect nonce, with no connected state.');
    }

    async ppOnb02({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-02');

        await clearPayPalVendor(VENDOR_ID);
        const settingsKey = metaKeys.marketplace_settings ?? TEST_MODE_KEYS.marketplaceSettings;
        const merchantKey = metaKeys.merchant_id ?? TEST_MODE_KEYS.merchantId;

        try {
            await withUser(browser, vendorAuth, async (page, paypal) => {
                await paypal.gotoVendorPaymentSettings();

                const nonce = await harvestConnectNonce(page);
                expect(nonce, 'no connect nonce could be read from the unconnected screen, so this test cannot reach the email check at all — it would stop at the nonce gate and prove nothing about empty-email handling').not.toBe('');

                // The browser also guards this: the input carries `required` and the template runs
                // jQuery validate before POSTing (vendor-settings-payment.php:45, 100-105). That is
                // a convenience layer, not the guard under test — a client-side check is bypassed
                // by anyone who wants to. The SERVER guard is what protects the vendor.
                await expect(
                    page.locator(PayPalMarketplacePage.vendor.email),
                    'the PayPal email input lost its `required` attribute — the client-side layer that stops an accidental empty submit is gone (vendor-settings-payment.php:45)',
                ).toHaveAttribute('required', '');

                const res = await postConnect(page, { action: CONNECT_AJAX_ACTION, vendor_paypal_email_address: '', nonce });

                expect(
                    res.text,
                    `admin-ajax answered the bare "0" to the connect action, which means the request never reached handle_paypal_marketplace_connect() at all (wrong action name, or the hook at RegisterWithdrawMethods.php:31 is gone). Response: "${res.text.slice(0, 160)}"`,
                ).not.toBe('0');
                expect(
                    res.body.success,
                    `a connect request with an EMPTY email was accepted (success=${JSON.stringify(res.body.success ?? null)}). The handler would then mint a partner referral and store a tracking id against a vendor whose payout email is blank, and the vendor's PayPal account could never be matched back to them.`,
                ).toBe(false);
                expect(
                    res.body.data?.message,
                    `the rejection message must be exactly "${EMAIL_REQUIRED_MESSAGE}" (source coordinates withheld). Got ${JSON.stringify(res.body.data?.message ?? null)} — a different string means the request was refused by a DIFFERENT guard (most likely the nonce check at :146) and the email guard was never exercised.`,
                ).toBe(EMAIL_REQUIRED_MESSAGE);
                expect(messageParam(res.body.data?.url), 'the redirect the vendor is sent to must carry the same email-required message (source coordinates withheld)').toBe(EMAIL_REQUIRED_MESSAGE);
            });

            expect(
                await readMeta(VENDOR_ID, settingsKey),
                'a rejected connect attempt wrote the vendor marketplace-settings meta. That meta records connect_process_started and the tracking_id a later PayPal callback is matched against, so writing it on a rejected attempt leaves a half-started onboarding the vendor cannot see or clear.',
            ).toBeNull();
            expect(await readMeta(VENDOR_ID, merchantKey), 'a rejected connect attempt wrote a merchant id — that value decides who receives this vendor\'s payouts').toBeNull();
        } finally {
            await reseedBothVendors();
        }

        log.success(`PP-ONB-02: an empty email is refused with "${EMAIL_REQUIRED_MESSAGE}" on both surfaces and no vendor meta is written.`);
    }

    async ppOnb03({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-03');

        await clearPayPalVendor(VENDOR_ID);
        const settingsKey = metaKeys.marketplace_settings ?? TEST_MODE_KEYS.marketplaceSettings;

        try {
            await withUser(browser, vendorAuth, async (page, paypal) => {
                await paypal.gotoVendorPaymentSettings();
                const nonce = await harvestConnectNonce(page);
                expect(nonce, 'no real nonce could be harvested, so the third input of this test — the one that proves the gate DISCRIMINATES rather than refusing everything — is unavailable').not.toBe('');

                // THREE inputs, because two is what let DOK-029 hide. PP-SEC-09/-10 both passed
                // against a module carrying a CRITICAL nonce bug, because both sent a FORGED nonce
                // — which reaches wp_verify_nonce() and is correctly rejected. The defect lived in
                // how the ABSENT case was guarded. Here the absent case is a first-class input.
                const absent = await postConnect(page, { action: CONNECT_AJAX_ACTION, vendor_paypal_email_address: 'attacker@example.test' });
                const forged = await postConnect(page, { action: CONNECT_AJAX_ACTION, vendor_paypal_email_address: 'attacker@example.test', nonce: 'forged-nonce-value' });

                for (const [label, res] of [
                    ['with NO nonce field at all', absent],
                    ['with a forged nonce', forged],
                ] as const) {
                    expect(
                        res.text,
                        `the connect POST ${label} was answered with the bare "0", meaning it never reached the handler — this test would then be asserting that a non-existent action does nothing. Check the wp_ajax_ hook at RegisterWithdrawMethods.php:31.`,
                    ).not.toBe('0');
                    expect(
                        res.body.success,
                        `a connect request ${label} was ACCEPTED (success=${JSON.stringify(res.body.success ?? null)}). Any cross-site page could then start a PayPal partner referral on a logged-in vendor's behalf and bind an attacker-controlled PayPal account to that vendor's payouts. The guard is RegisterWithdrawMethods.php:146.`,
                    ).toBe(false);
                    expect(
                        res.body.data?.message,
                        `the refusal ${label} must be the handler's own nonce message "${NONCE_MESSAGE}" (source coordinates withheld); got ${JSON.stringify(res.body.data?.message ?? null)}`,
                    ).toBe(NONCE_MESSAGE);
                    expect(res.text, `no PayPal onboarding action_url may be handed back to a request ${label}`).not.toMatch(/paypal\.com\/(bizsignup|merchantsignup|webapps)/i);
                }

                // POSITIVE CONTROL — the SAME endpoint, with the REAL nonce, must get PAST the
                // nonce gate. An empty email is used so it stops at the very next guard instead of
                // minting a live partner referral. Without this the two refusals above are equally
                // consistent with an action that refuses everything, including legitimate vendors.
                const valid = await postConnect(page, { action: CONNECT_AJAX_ACTION, vendor_paypal_email_address: '', nonce });
                expect(
                    valid.body.data?.message,
                    `a REAL nonce was still answered ${JSON.stringify(valid.body.data?.message ?? null)} instead of the next guard's "${EMAIL_REQUIRED_MESSAGE}". The connect action is rejecting valid nonces too, so no vendor on this site can begin onboarding — and the two refusals above prove nothing about CSRF protection.`,
                ).toBe(EMAIL_REQUIRED_MESSAGE);
            });

            expect(await readMeta(VENDOR_ID, settingsKey), 'a nonce-less or forged connect attempt must leave the vendor marketplace-settings meta unwritten').toBeNull();
        } finally {
            await reseedBothVendors();
        }

        // Recorded, not asserted here: the SIBLING guard in the same class is written with the
        // opposite polarity, so its absent-nonce case is mishandled. That is DOK-029 (CRITICAL);
        // it is owned by PP-SEC-15 and is NOT re-filed or re-tested here. Guard shape and source
        // coordinates are in the private security tracker, deliberately not in this public repo.
        log.success('PP-ONB-03: the connect action refuses an absent nonce and a forged nonce with "Are you cheating?", and a real nonce still gets through to the next guard.');
    }

    async ppOnb04({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-04');

        await clearPayPalVendor(VENDOR_ID);
        await ensureVendorStoreAddress(VENDOR_ID, UNSUPPORTED_COUNTRY);
        const settingsKey = metaKeys.marketplace_settings ?? TEST_MODE_KEYS.marketplaceSettings;

        try {
            await withUser(browser, vendorAuth, async (page, paypal) => {
                await paypal.gotoVendorPaymentSettings();
                const nonce = await harvestConnectNonce(page);
                expect(nonce, 'no connect nonce available, so this test would stop at the nonce gate and never reach the country guard').not.toBe('');

                // SURFACE 1 — the AJAX JSON.
                const res = await postConnect(page, { action: CONNECT_AJAX_ACTION, vendor_paypal_email_address: 'dokangit@vendor1.com', nonce });
                expect(
                    res.body.success,
                    `a vendor whose store country is "${UNSUPPORTED_COUNTRY}" was allowed to start a PayPal referral (success=${JSON.stringify(res.body.success ?? null)}). PayPal cannot onboard a seller from an unsupported country, so the vendor would be sent into a hosted flow that can only fail, and the marketplace would carry a vendor believed to be onboarding who never can be.`,
                ).toBe(false);
                expect(
                    res.body.data?.message,
                    `the AJAX rejection message must be exactly "${COUNTRY_AJAX_MESSAGE}" (source coordinates withheld); got ${JSON.stringify(res.body.data?.message ?? null)}`,
                ).toBe(COUNTRY_AJAX_MESSAGE);

                // SURFACE 2 — the redirect the response also carries. `reload: true` makes the
                // template navigate to `data.url` (vendor-settings-payment.php:136-142), so THIS is
                // the string the vendor actually reads. It is a DIFFERENT sentence from the one
                // above, and it is double-encoded on the wire — see decodeFully().
                expect(
                    res.body.data?.reload,
                    'the response did not set reload:true, so the template never navigates and the vendor is left staring at an unchanged form with no explanation at all (vendor-settings-payment.php:136-142)',
                ).toBe(true);
                expect(
                    messageParam(res.body.data?.url),
                    `the redirect's message query arg must carry "${COUNTRY_VISIBLE_MESSAGE}" (source coordinates withheld) — this is the sentence the vendor reads, and it is deliberately NOT the same as the AJAX message. Got: ${JSON.stringify(messageParam(res.body.data?.url) || null)}`,
                ).toBe(COUNTRY_VISIBLE_MESSAGE);
                expect(
                    res.body.data?.url ?? '',
                    `the rejection must send the vendor back to the ${SETTINGS_SLUG} screen (source coordinates withheld); it pointed at ${JSON.stringify(res.body.data?.url ?? null)}`,
                ).toContain(SETTINGS_SLUG);

                // SURFACE 3 — what is actually ON SCREEN after the real click.
                //
                // The renderer is NOT the module's own `handle_vendor_message()`. That is hooked to
                // `dokan_payment_settings_before_form`, which fires only in Lite's payment LIST
                // template (`templates/settings/payment.php:11`) — and the redirect target is the
                // MANAGE screen, whose template has no such hook. The message that reaches the
                // vendor is rendered by Lite instead: `Settings::load_payment_content()` reads
                // `$_GET['status']` / `$_GET['message']` (Settings.php:354-360) and
                // `templates/settings/payment-manage.php:9-13` prints it into
                // `.dokan-alert.dokan-alert-danger`.
                //
                // `:not(.dokan-panel-alert)` is load-bearing: the module ALSO echoes a
                // `dokan-alert dokan-alert-danger dokan-panel-alert` "connect your PayPal account"
                // notice on every dashboard page for a non-connected vendor
                // (source coordinates withheld). Without the exclusion the locator resolves to
                // two elements and raises a strict-mode violation on a working site.
                await paypal.gotoVendorPaymentSettings();
                await page.fill(PayPalMarketplacePage.vendor.email, 'dokangit@vendor1.com');
                await Promise.all([
                    page.waitForURL(url => url.href.includes('status=error'), { timeout: 60_000 }),
                    page.click(PayPalMarketplacePage.vendor.connect),
                ]);

                const alert = page.locator(PayPalMarketplacePage.misc.vendorAlertDanger).first();
                await expect(
                    alert,
                    'after clicking Sign Up with an unsupported store country the vendor was shown no error at all. The redirect carried status=error and a message, so either Settings::load_payment_content() stopped forwarding them (Settings.php:354-360) or payment-manage.php stopped rendering them (payment-manage.php:9-13) — a vendor who clicks Sign Up and is silently returned to an unchanged form has no way to learn why onboarding is impossible for them.',
                ).toBeVisible({ timeout: 30_000 });

                const onScreenRaw = (await alert.textContent())?.trim() ?? '';
                expect(
                    decodeFully(onScreenRaw),
                    `the on-screen error must be the redirect sentence "${COUNTRY_VISIBLE_MESSAGE}" (source coordinates withheld), NOT the AJAX sentence "${COUNTRY_AJAX_MESSAGE}" (:196). Asserting the AJAX string against this element can never match. Rendered: "${onScreenRaw.slice(0, 240)}"`,
                ).toContain(COUNTRY_VISIBLE_MESSAGE);

                // Recorded rather than asserted, because it is a display defect and not the
                // behaviour this case owns: the handler `rawurlencode()`s the message and
                // `add_query_arg()` then `urlencode_deep()`s the query string, so PHP's own single
                // decode leaves one layer behind — and Lite's manage screen prints `$_GET['message']`
                // through `wp_kses_post()` with NO `rawurldecode()` (Settings.php:357). The module's
                // own `handle_vendor_message()` does decode it (source coordinates withheld), but
                // that function never runs on this screen. Net effect: the vendor can be shown
                // percent-escapes instead of spaces.
                if (/%[0-9A-Fa-f]{2}/.test(onScreenRaw)) {
                    log.warn(
                        'PP-ONB-04: the vendor-facing error is displayed percent-encoded.',
                        `Rendered verbatim: "${onScreenRaw.slice(0, 240)}". Cause: double encoding (rawurlencode at RegisterWithdrawMethods.php:201 + urlencode_deep inside add_query_arg, ` +
                            'wp-includes/functions.php:1183) against a single decode at Settings.php:357. Not a blocker and not a filed bug — recorded for the ledger.',
                    );
                }
            });

            expect(
                await readMeta(VENDOR_ID, settingsKey),
                'the country guard rejected the attempt but the marketplace-settings meta was written anyway — the vendor is left with connect_process_started/pending state for a referral that never existed',
            ).toBeNull();
        } finally {
            await ensureVendorStoreAddress(VENDOR_ID, SUPPORTED_COUNTRY);
            await reseedBothVendors();
        }

        // Recorded so a later reader does not file it as a missing feature: there is NO
        // template-level guard. Unlike Stripe Express, the check lives entirely inside the connect
        // handler and only fires after the vendor clicks, so a spec hunting for a pre-emptive
        // on-page warning will correctly find nothing.
        log.success(`PP-ONB-04: a "${UNSUPPORTED_COUNTRY}" store country is refused, the AJAX and on-screen strings differ exactly as the product intends, and no vendor meta is written.`);
    }

    async ppOnb05({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-05');

        await clearPayPalVendor(VENDOR_ID);
        const settingsKey = metaKeys.marketplace_settings ?? TEST_MODE_KEYS.marketplaceSettings;

        // Remove the country KEY, not merely blank it. The two are different code paths that the
        // catalogue expects to converge: an absent key fails the `isset()` at
        // RegisterWithdrawMethods.php:188 and never calls get_product_type(); a present-but-unsupported
        // value (PP-ONB-04) reaches get_product_type() and gets false back. Both leave $product_type
        // empty and fall into the same rejection at :192. Pinning that equivalence is the point of
        // this case — if the two ever diverge, one has grown an unreviewed guard.
        //
        // The profile is restored BYTE-EXACT from `vendor1ProfileBackup` in afterAll, so this
        // deliberately lossy round trip through the serializer cannot leave the vendor damaged.
        const profile = (await dbUtils.getUserMeta(String(VENDOR_ID), 'dokan_profile_settings')) as Record<string, unknown>;
        const address = { ...((profile.address ?? {}) as Record<string, unknown>) };
        delete address.country;
        await dbUtils.setUserMeta(String(VENDOR_ID), 'dokan_profile_settings', { ...profile, address }, true);

        const written = (await dbUtils.getUserMeta(String(VENDOR_ID), 'dokan_profile_settings')) as Record<string, unknown>;
        const writtenAddress = (written.address ?? {}) as Record<string, unknown>;
        expect(
            Object.prototype.hasOwnProperty.call(writtenAddress, 'country'),
            'the precondition write did not remove the country key from dokan_profile_settings.address, so this test would exercise PP-ONB-04\'s path (unsupported value) instead of the missing-key path and the equivalence it exists to pin would go unverified',
        ).toBe(false);

        try {
            await withUser(browser, vendorAuth, async (page, paypal) => {
                await paypal.gotoVendorPaymentSettings();
                const nonce = await harvestConnectNonce(page);
                expect(nonce, 'no connect nonce available, so this test would stop at the nonce gate rather than the country guard').not.toBe('');

                const res = await postConnect(page, { action: CONNECT_AJAX_ACTION, vendor_paypal_email_address: 'dokangit@vendor1.com', nonce });

                expect(
                    res.body.success,
                    `a vendor with NO store country was allowed to start a PayPal referral (success=${JSON.stringify(res.body.success ?? null)}). PayPal requires a seller country to pick a product type, so the referral is built from nothing and the vendor enters a flow that cannot complete.`,
                ).toBe(false);
                expect(
                    res.body.data?.message,
                    `a missing country must produce the SAME rejection as an unsupported one — "${COUNTRY_AJAX_MESSAGE}" (source coordinates withheld). Got ${JSON.stringify(res.body.data?.message ?? null)}. A different string here means the two paths have diverged and one of them has grown a guard nobody reviewed.`,
                ).toBe(COUNTRY_AJAX_MESSAGE);
                expect(messageParam(res.body.data?.url), `the redirect must carry the same vendor-visible sentence as PP-ONB-04: "${COUNTRY_VISIBLE_MESSAGE}"`).toBe(COUNTRY_VISIBLE_MESSAGE);
                expect(res.body.data?.url ?? '', `the rejection must return the vendor to the ${SETTINGS_SLUG} screen`).toContain(SETTINGS_SLUG);
            });

            expect(await readMeta(VENDOR_ID, settingsKey), 'a country-rejected connect attempt must write no marketplace-settings meta').toBeNull();
        } finally {
            if (vendor1ProfileBackup !== null) {
                await dbUtils.setUserMeta(String(VENDOR_ID), 'dokan_profile_settings', vendor1ProfileBackup, false);
            }
            await ensureVendorStoreAddress(VENDOR_ID, SUPPORTED_COUNTRY);
            await reseedBothVendors();
        }

        log.success('PP-ONB-05: a missing store country produces the byte-identical rejection an unsupported country does — the two paths are still equivalent.');
    }

    async ppOnb06({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!!consentSkipReason, consentSkipReason ?? '');
        await requireGatewayReady('PP-ONB-06');

        await clearPayPalVendor(VENDOR_ID);
        await ensureVendorStoreAddress(VENDOR_ID, SUPPORTED_COUNTRY);
        const settingsKey = metaKeys.marketplace_settings ?? TEST_MODE_KEYS.marketplaceSettings;
        const merchantKey = metaKeys.merchant_id ?? TEST_MODE_KEYS.merchantId;

        try {
            const actionUrl = await withUser(browser, vendorAuth, async (page, paypal) => {
                await paypal.gotoVendorPaymentSettings();
                const nonce = await harvestConnectNonce(page);
                expect(nonce, 'no connect nonce available, so the referral cannot be requested').not.toBe('');

                // This is a REAL outbound POST /v2/customer/partner-referrals performed by the
                // product (Processor::create_partner_referral, reached at RegisterWithdrawMethods.php:210).
                // It creates no money movement and no PayPal order — it mints a signup link.
                const res = await postConnect(page, { action: CONNECT_AJAX_ACTION, vendor_paypal_email_address: 'dokangit@vendor1.com', nonce });

                expect(
                    res.body.success,
                    `the partner referral was REFUSED for a supported-country vendor: ${JSON.stringify(res.body.data?.message ?? null)}. ` +
                        'Dokan calls create_partner_referral() SERVER-SIDE before any window opens, so the vendor sees a dead "Sign Up" button and no popup. ' +
                        'The overwhelmingly likeliest cause is the PARTNER APP, not this vendor: a sandbox REST app created as type Merchant carries no partner ' +
                        'scopes at all and returns 403 from /v2/customer/partner-referrals, and app type is fixed at creation — no feature toggle adds them later. ' +
                        'Confirm the app type before reading this as an onboarding regression. Handler: RegisterWithdrawMethods.php:209-230.',
                ).toBe(true);

                const url = res.body.data?.url ?? '';
                expect(url, `the referral succeeded but carried no action URL (data.url=${JSON.stringify(res.body.data?.url ?? null)}), so the vendor has nowhere to go. The URL is read from links[1].rel === 'action_url' at RegisterWithdrawMethods.php:232-234 — a PayPal response whose links array is ordered differently would land here.`).not.toBe('');
                expect(url, 'the handoff URL must be on a PayPal-owned host — anything else means the vendor is being sent to grant account permissions somewhere that is not PayPal').toMatch(/^https:\/\/[a-z0-9.-]*paypal\.com\//i);
                expect(url, 'Dokan appends &displayMode=minibrowser so PayPal renders the popup variant (source coordinates withheld); without it the hosted flow renders full-page inside the popup window').toContain('displayMode=minibrowser');

                return url;
            });

            // The referral URL is fetched for real. A well-formed URL that PayPal itself rejects is
            // exactly the failure this case exists to catch, and it is invisible to any assertion
            // that only inspects the string. Authorization is blanked EXPLICITLY: this request
            // leaves our network, and an inherited WordPress admin Basic-auth header would be sent
            // to paypal.com.
            const hosted = await probe(actionUrl, { headers: { Authorization: '' } });
            expect(
                hosted.status,
                `PayPal answered ${hosted.status} for the referral URL the module just minted, so the link handed to the vendor is dead on arrival. First 200 bytes: ${hosted.text.slice(0, 200)}`,
            ).toBeLessThan(400);

            // What the vendor's state must look like AFTER the handoff and BEFORE any PayPal
            // callback. Verified manually on 2026-07-31: PayPal terminates on its own
            // unifiedonboarding/done page and NEVER redirects to Dokan's return_url, so
            // handle_connect_success_response() does not run and the vendor stays here. That is the
            // real product behaviour; this case models it rather than papering over it. The vendor
            // becomes connected only when MERCHANT.ONBOARDING.COMPLETED arrives — PP-ONB-12.
            const settingsRaw = (await readMeta(VENDOR_ID, settingsKey)) ?? '';
            expect(settingsRaw, 'the connect handler must persist the vendor marketplace settings so a later PayPal webhook can be matched back to this vendor (RegisterWithdrawMethods.php:237-246); nothing was written').not.toBe('');
            expect(settingsRaw, 'the stored settings must record connect_process_started so the module knows an onboarding is in flight').toContain('connect_process_started');
            expect(settingsRaw, 'connection_status must be "pending" immediately after the handoff — anything else means the module considers a vendor connected before PayPal has said a word about them').toMatch(/"connection_status";s:7:"pending"/);

            const trackingId = settingsRaw.match(/"tracking_id";s:\d+:"([^"]+)"/)?.[1] ?? '';
            expect(
                trackingId,
                'no tracking_id was stored. It is minted as `_dokan_paypal_<random>_<user_id>` (source coordinates withheld) and its user-id suffix is the ONLY thing that later proves a PayPal consent came from OUR referral for THIS vendor.',
            ).not.toBe('');
            expect(trackingId, `the tracking id must end in the vendor's WP user id so PayPal's callback can be attributed; got "${trackingId}" for vendor ${VENDOR_ID}`).toMatch(new RegExp(`^_dokan_paypal_.+_${VENDOR_ID}$`));

            expect(
                await readMeta(VENDOR_ID, merchantKey),
                'a merchant id was stored merely because the vendor was handed a referral link. Nobody has consented yet — PayPal has not confirmed anything — and that meta is the value every future purchase unit uses as payee.merchant_id.',
            ).toBeNull();
            expect(await isVendorConnected(VENDOR_ID), 'the vendor reads as CONNECTED after only being handed a signup link — no consent has been granted, so no payout can succeed').toBe(false);

            log.info(
                'PP-ONB-06: the hosted consent screen is deliberately not completed.',
                'Granting consent is a permanent, non-reversible mutation of the sandbox business account the entire money suite depends on, and PayPal ' +
                    'never redirects back to Dokan anyway (verified manually 2026-07-31), so completing it exercises no additional Dokan code. The path from ' +
                    'here to "connected" is the MERCHANT.ONBOARDING.COMPLETED webhook, covered for real by PP-ONB-12.',
            );
        } finally {
            await reseedBothVendors();
        }

        log.success('PP-ONB-06: the module minted a live PayPal referral URL that PayPal accepts, stored a correctly-suffixed tracking id, and left the vendor pending and unconnected.');
    }

    async ppOnb07({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);

        await withUser(browser, adminAuth, async (page, paypal) => {
            await paypal.gotoGatewaySettings();

            // POSITIVE CONTROL FIRST. "No countries control exists" is trivially true on a page
            // that failed to render, and this whole case is one absence assertion.
            expect(
                await page.locator(PayPalMarketplacePage.misc.settingsDisbursementMode).count(),
                'the disbursement-mode field is missing, so the PayPal Marketplace settings form did not render and the "no country control" finding below would be an artefact of an empty page rather than a fact about the gateway',
            ).toBeGreaterThan(0);

            const fieldIds = await page.locator(PayPalMarketplacePage.misc.settingsFields).evaluateAll(nodes => nodes.map(n => n.id));
            expect(fieldIds.length, 'no gateway settings fields were found at all, so this page is not the PayPal Marketplace settings screen').toBeGreaterThan(0);

            const countryFields = fieldIds.filter(id => /countr/i.test(id));
            expect(
                countryFields,
                `the PayPal Marketplace settings form now exposes ${JSON.stringify(countryFields)}. This case exists to record that it does NOT: PayPal uses two ` +
                    'HARDCODED allow maps (7 UCC countries at Helper.php:201-213 and roughly 85 branded ones at Helper.php:222-330) where Stripe Express uses an ' +
                    'admin-editable deny list. If a control has genuinely been added, this case is stale and the catalogue needs updating — it is not a product defect.',
            ).toEqual([]);
        });

        // The stored option is checked too, because a field could exist without an id matching the
        // prefix (a custom `type` renderer, for instance) and would then be invisible above.
        const settings = (await dbUtils.getOptionValueOrNull('woocommerce_dokan_paypal_marketplace_settings')) as Record<string, unknown> | null;
        const optionCountryKeys = Object.keys(settings ?? {}).filter(key => /countr/i.test(key));
        expect(optionCountryKeys, `the gateway settings option now stores ${JSON.stringify(optionCountryKeys)} — a country allow/deny list has become admin-configurable and the hardcoded maps are no longer the whole story`).toEqual([]);

        log.success('PP-ONB-07: no allowed/restricted-countries control exists in the form or in the stored settings — the allow list is hardcoded, as intended.');
    }

    async ppOnb08({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-08');

        await reseedBothVendors();
        expect(await isVendorConnected(VENDOR_ID), 'vendor1 does not read as connected after seeding all six mode-swapped metas, so "the connected state renders" would be asserting the wrong template branch').toBe(true);

        await withUser(browser, vendorAuth, async (page, paypal) => {
            await paypal.gotoVendorPaymentSettings();
            const sel = PayPalMarketplacePage.vendor;

            await expect(
                page.locator(sel.disconnect),
                'a connected vendor is offered no Disconnect control (an <a class="dokan-btn-danger">, vendor-settings-payment.php:6-8) — they cannot sever a PayPal account they no longer control',
            ).toBeVisible();
            await expect(
                page.locator(sel.connectedAlert).first(),
                'the connected-state success alert did not render for a fully seeded vendor, so the template is not taking the `$is_seller_enabled` branch (vendor-settings-payment.php:4)',
            ).toBeVisible();
            await expect(
                page.locator(sel.connectedAlert).first(),
                `the connected screen must show the vendor their own merchant id "${PAYPAL_MERCHANTS.vendor1}" (vendor-settings-payment.php:11) — it is how a vendor verifies which PayPal account will be paid`,
            ).toContainText(PAYPAL_MERCHANTS.vendor1);

            expect(
                await page.locator(sel.connect).count(),
                'the "Sign Up" connect control is still offered to an already-connected vendor. Re-running the referral overwrites the stored tracking id and marketplace settings, which detaches the vendor from the consent PayPal already holds.',
            ).toBe(0);
            expect(await page.locator(sel.email).count(), 'the PayPal email input is still rendered for a connected vendor — that is the unconnected branch of the template').toBe(0);
        });

        log.success(`PP-ONB-08: the connected branch renders with merchant id ${PAYPAL_MERCHANTS.vendor1} and a Disconnect control, and offers no re-connect path.`);
    }

    async ppOnb09(): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-09');

        await reseedBothVendors();

        // The key names are asserted against LITERALS, not against the value the product just
        // handed back. Comparing the product's answer with the product's answer is a tautology.
        const keys = await currentVendorMetaKeys();
        expect(
            keys.merchant_id,
            `with test_mode on, Helper::get_seller_merchant_id_key() must resolve to "${TEST_MODE_KEYS.merchantId}" (Helper.php:483-488); it resolved to ${JSON.stringify(keys.merchant_id ?? null)}. A resolver that returns the live key in sandbox mode makes every sandbox vendor read as unconnected while quietly stamping live identity.`,
        ).toBe(TEST_MODE_KEYS.merchantId);
        expect(keys.enable_for_receive, `the receive-payment gate key must be "${TEST_MODE_KEYS.enableForReceive}" in sandbox mode (Helper.php:495-500)`).toBe(TEST_MODE_KEYS.enableForReceive);
        expect(keys.marketplace_settings, `the marketplace-settings key must be "${TEST_MODE_KEYS.marketplaceSettings}" in sandbox mode (Helper.php:507-512)`).toBe(TEST_MODE_KEYS.marketplaceSettings);

        expect(
            await readMeta(VENDOR_ID, TEST_MODE_KEYS.merchantId),
            `vendor ${VENDOR_ID}'s sandbox merchant meta "${TEST_MODE_KEYS.merchantId}" does not hold the configured merchant id "${PAYPAL_MERCHANTS.vendor1}". Either it was never stored or it holds something else — and that meta is the exact value stamped as payee.merchant_id on every purchase unit for this vendor, so a wrong value pays a different PayPal account.`,
        ).toBe(PAYPAL_MERCHANTS.vendor1);
        expect(
            await readMeta(VENDOR_ID, LIVE_MODE_KEYS.merchantId),
            `a SANDBOX connection wrote the LIVE merchant meta "${LIVE_MODE_KEYS.merchantId}". Sandbox and live payee identity must never bleed: a test-mode onboarding that populates the live key means flipping the gateway to production silently starts paying a sandbox account.`,
        ).toBeNull();
        expect(await readMeta(VENDOR_ID, LIVE_MODE_KEYS.enableForReceive), `a sandbox connection enabled the LIVE receive-payment gate "${LIVE_MODE_KEYS.enableForReceive}"`).toBeNull();
        expect(await readMeta(VENDOR_ID, LIVE_MODE_KEYS.marketplaceSettings), `a sandbox connection wrote the LIVE marketplace-settings meta "${LIVE_MODE_KEYS.marketplaceSettings}"`).toBeNull();

        log.success('PP-ONB-09: sandbox onboarding populates only the `_dokan_paypal_test_*` metas; every live-mode key is untouched.');
    }

    async ppOnb10(): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-10');

        await reseedBothVendors();
        expect(await isVendorConnected(VENDOR_ID), 'vendor1 must start connected in sandbox mode, or the live-mode reading below has no baseline to differ from').toBe(true);

        try {
            // ensurePayPalConfigured() merges `test_mode: yes` and then applies overrides, so this
            // is the supported way to flip the mode without touching any other stored setting.
            await ensurePayPalConfigured({ test_mode: 'no' });

            const liveKeys = await currentVendorMetaKeys();
            expect(
                liveKeys.merchant_id,
                `after flipping test_mode off, Helper::get_seller_merchant_id_key() must resolve to "${LIVE_MODE_KEYS.merchantId}"; it resolved to ${JSON.stringify(liveKeys.merchant_id ?? null)}. If the resolver does NOT swap, sandbox merchant ids are being used as live payees — real customer money would be sent to a sandbox account.`,
            ).toBe(LIVE_MODE_KEYS.merchantId);

            expect(
                await isVendorConnected(VENDOR_ID),
                'a vendor connected only in SANDBOX still reads as connected in LIVE mode. The gateway would then offer itself at checkout for a vendor whose live PayPal account does not exist, and every capture for that vendor fails at PayPal with an unusable payee.',
            ).toBe(false);
        } finally {
            await ensurePayPalConfigured();
        }

        const restored = await currentVendorMetaKeys();
        expect(restored.merchant_id, `the gateway was not restored to sandbox mode — the meta resolver still answers ${JSON.stringify(restored.merchant_id ?? null)}, which would corrupt every later test in this run`).toBe(TEST_MODE_KEYS.merchantId);
        expect(await isVendorConnected(VENDOR_ID), 'vendor1 must read as connected again once sandbox mode is restored; if not, the mode flip mutated more than the mode and this run\'s remaining state is untrustworthy').toBe(true);

        log.success('PP-ONB-10: the meta resolver swaps with test_mode, so a sandbox-only vendor is correctly invisible in live mode — and the sandbox state came back intact.');
    }

    async ppOnb11({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-11');

        await reseedBothVendors();
        expect(await isVendorConnected(VENDOR_ID), 'vendor1 must start connected, or "the metas are gone afterwards" is true before the test does anything').toBe(true);

        const keys = await currentVendorMetaKeys();
        const allKeys = Object.values(keys);
        expect(allKeys.length, 'the /status route returned no vendor meta keys, so this test cannot enumerate what disconnect is supposed to delete').toBeGreaterThan(0);

        try {
            await withUser(browser, vendorAuth, async (page, paypal) => {
                await paypal.gotoVendorPaymentSettings();

                // Matched on the ACTION in the href rather than on the button class, so a styling
                // change cannot silently select a different control. It is an <a>, never a <button>.
                const disconnectLink = page.locator(PayPalMarketplacePage.misc.vendorDisconnectLink).first();
                await expect(
                    disconnectLink,
                    'no nonce-bearing disconnect link rendered for a connected vendor, so a vendor cannot sever a PayPal account they have lost control of without an administrator intervening (vendor-settings-payment.php:6-8)',
                ).toBeVisible();

                await Promise.all([page.waitForURL(url => url.href.includes('status=success'), { timeout: 60_000 }), disconnectLink.click()]);

                // Rendered by Lite's manage template from the redirect's status/message query args
                // (Settings.php:354-360 → payment-manage.php:9-13), NOT by the module's
                // `handle_vendor_message()` — that is hooked to `dokan_payment_settings_before_form`,
                // which fires only in the payment LIST template. `.first()` because the connected
                // branch of the module template also uses `.dokan-alert-success`; at this point the
                // vendor is disconnected so only the status alert is present, and taking the first
                // keeps the locator strict-mode safe if that ever changes.
                await expect(
                    page.locator(PayPalMarketplacePage.misc.vendorAlertSuccess).first(),
                    'the vendor was given no confirmation that the disconnect succeeded. RegisterWithdrawMethods.php:377-383 redirects with status=success and "PayPal account disconnected successfully." — a vendor who severs their payout account and sees nothing cannot tell whether it worked.',
                ).toContainText('PayPal account disconnected successfully', { timeout: 30_000 });

                // Back to the unconnected branch: connect UI returns, connected state gone.
                await paypal.gotoVendorPaymentSettings();
                await expect(page.locator(PayPalMarketplacePage.vendor.email), 'after disconnecting, the vendor must be offered the connect form again — otherwise they can never re-onboard').toBeVisible();
                expect(await page.locator(PayPalMarketplacePage.vendor.disconnect).count(), 'the Disconnect control is still offered after a successful disconnect, so the screen is reporting a connection that no longer exists').toBe(0);
            });

            for (const [label, metaKey] of Object.entries(keys)) {
                expect(
                    await readMeta(VENDOR_ID, metaKey),
                    `disconnect left "${metaKey}" (${label}) behind. deauthorize_vendor() deletes all six at RegisterWithdrawMethods.php:363-375; a survivor means the vendor still reads as partly connected — and if the survivor is the merchant id, the marketplace will keep naming a PayPal account the vendor has already walked away from as the payee.`,
                ).toBeNull();
            }
            expect(await isVendorConnected(VENDOR_ID), 'the vendor still reads as PayPal-connected after a successful disconnect').toBe(false);
        } finally {
            await reseedBothVendors();
        }

        log.success('PP-ONB-11: the dashboard disconnect removed all six PayPal metas, confirmed to the vendor, and returned the screen to the connect state.');
    }

    async ppOnb12(): Promise<void> {
        test.skip(!!consentSkipReason, consentSkipReason ?? '');
        await requireGatewayReady('PP-ONB-12');

        const keys = await currentVendorMetaKeys();
        const merchantKey = keys.merchant_id ?? TEST_MODE_KEYS.merchantId;
        const receiveKey = keys.enable_for_receive ?? TEST_MODE_KEYS.enableForReceive;
        const receivableKey = keys.payments_receivable ?? '_dokan_paypal_test_payments_receivable';
        const emailConfirmedKey = keys.primary_email_confirmed ?? '_dokan_paypal_test_primary_email_confirmed';
        const settingsKey = keys.marketplace_settings ?? TEST_MODE_KEYS.marketplaceSettings;

        try {
            await reseedBothVendors();

            // The handler resolves the vendor BY merchant id
            // (Helper::get_user_id_by_merchant_id, Helper.php:611-623), so the merchant id meta must
            // already exist — the catalogue's "vendor unconnected" precondition cannot mean "no
            // metas at all" or the event is unroutable and the handler logs and returns. The
            // reachable pre-state is the real one: the vendor has an id but is not yet enabled.
            await dbUtils.deleteUserMeta(VENDOR_ID, [receiveKey, receivableKey, emailConfirmedKey]);

            // A realistic post-referral settings meta, so the handler takes its `connection_status
            // !== 'success'` branch (MerchantOnboardingCompleted.php:54-58) and runs the full
            // handle_connect_success_response() path rather than the status-refresh shortcut.
            await dbUtils.setUserMeta(
                String(VENDOR_ID),
                settingsKey,
                { connect_process_started: true, connection_status: 'pending', email: 'dokangit@vendor1.com', tracking_id: `_dokan_paypal_e2eonb_${VENDOR_ID}` },
                true,
            );

            expect(
                await isVendorConnected(VENDOR_ID),
                'vendor1 already reads as connected before the webhook is injected, so "the webhook connected them" cannot be distinguished from "they were already connected"',
            ).toBe(false);

            const result = await injectPayPalWebhook(PAYPAL_EVENTS.merchantOnboardingCompleted, {
                merchant_id: PAYPAL_MERCHANTS.vendor1,
                tracking_id: `_dokan_paypal_e2eonb_${VENDOR_ID}`,
                partner_client_id: 'e2e-partner-client-id',
                consent_status: true,
            });

            expect(
                result.is_handled,
                `the module does not map ${PAYPAL_EVENTS.merchantOnboardingCompleted} at all (Helper::get_supported_webhook_events, Helper.php:646+), so a real onboarding completion from PayPal would be dropped and the vendor would stay unconnected forever`,
            ).toBe(true);
            expect(result.handler, 'the onboarding-completed event must route to MerchantOnboardingCompleted').toBe('MerchantOnboardingCompleted');
            expect(result.fatal, `the handler raised a PHP fatal: ${result.error ?? 'no message'}`).toBe(false);

            // `threw === false` proves almost nothing — EventFactory::__callStatic swallows
            // \Exception and only logs it. The state mutation below is the real assertion, and it
            // can only succeed if the handler's LIVE merchant-status call to PayPal succeeded too.
            // '1' is what `update_user_meta( …, true )` stores; a PayPal `false` would store the
            // empty string, and an absent row means the handler never got that far. The consent
            // probe in beforeAll already established that PayPal reports BOTH flags true for this
            // merchant, so anything other than '1' is the module mis-storing what it was told.
            expect(
                await readMeta(VENDOR_ID, receivableKey),
                `after MERCHANT.ONBOARDING.COMPLETED the vendor's payments-receivable meta ("${receivableKey}") does not read '1', even though the pre-flight consent probe confirmed PayPal reports this merchant as receivable. WithdrawManager::update_merchant_status() writes it at WithdrawManager.php:87 from the live GET /v1/customer/partners/{partner}/merchant-integrations/{merchant} response; null means the call returned a WP_Error and bailed at :81-84 — that error is logged to wp-content/uploads/wc-logs/.`,
            ).toBe('1');
            expect(
                await readMeta(VENDOR_ID, emailConfirmedKey),
                `the vendor's primary-email-confirmed meta ("${emailConfirmedKey}") does not read '1' after the handler ran (WithdrawManager.php:88), although PayPal reports the primary email confirmed for this merchant`,
            ).toBe('1');
            expect(
                await readMeta(VENDOR_ID, merchantKey),
                `the handler must (re)store the merchant id it was told about (WithdrawManager.php:33) — it is the value every future purchase unit uses as payee.merchant_id`,
            ).toBe(PAYPAL_MERCHANTS.vendor1);

            const settingsAfter = (await readMeta(VENDOR_ID, settingsKey)) ?? '';
            expect(
                settingsAfter,
                'the handler must flip connection_status to "success" once PayPal reports the onboarding complete (MerchantOnboardingCompleted.php:57 → WithdrawManager.php:35); it still reads pending, so a redelivery of this same event would restart the whole connect-success path',
            ).toMatch(/"connection_status";s:7:"success"/);

            expect(
                await isVendorConnected(VENDOR_ID),
                `the onboarding-completed webhook ran without error but the vendor STILL does not read as payable. update_merchant_status() sets the receive-payment gate ("${receiveKey}") to true only when PayPal reports payments_receivable AND primary_email_confirmed AND at least one OAUTH_THIRD_PARTY integration (WithdrawManager.php:86-101). A vendor stuck here is invisible to the gateway at checkout, so nothing they sell can ever be paid for through PayPal.`,
            ).toBe(true);
        } finally {
            await reseedBothVendors();
        }

        log.success('PP-ONB-12: MERCHANT.ONBOARDING.COMPLETED reached PayPal for a live merchant status, wrote the vendor metas and flipped the vendor to payable.');
    }

    async ppOnb13(): Promise<void> {
        test.skip(!!consentSkipReason, consentSkipReason ?? '');
        await requireGatewayReady('PP-ONB-13');

        const keys = await currentVendorMetaKeys();
        const emailConfirmedKey = keys.primary_email_confirmed ?? '_dokan_paypal_test_primary_email_confirmed';

        try {
            await reseedBothVendors();
            await dbUtils.deleteUserMeta(VENDOR_ID, [emailConfirmedKey]);
            expect(
                await readMeta(VENDOR_ID, emailConfirmedKey),
                `the precondition delete of "${emailConfirmedKey}" did not take, so the value read after the webhook would be the seeded one and the handler could do nothing at all and still pass`,
            ).toBeNull();

            const result = await injectPayPalWebhook(PAYPAL_EVENTS.merchantEmailConfirmed, {
                merchant_id: PAYPAL_MERCHANTS.vendor1,
                primary_email_confirmed: true,
            });

            expect(result.is_handled, `the module does not map ${PAYPAL_EVENTS.merchantEmailConfirmed}, so a vendor confirming their PayPal email would never become payable without manual intervention`).toBe(true);
            expect(result.handler, 'the seller-email-confirmed event must route to its own handler class, not to a sibling — the two merchant-integration events share an implementation but must not share a mapping').toBe(
                'CustomerMerchantIntegrationSellerEmailConfirmed',
            );
            expect(result.fatal, `the handler raised a PHP fatal: ${result.error ?? 'no message'}`).toBe(false);

            expect(
                await readMeta(VENDOR_ID, emailConfirmedKey),
                `after SELLER-EMAIL-CONFIRMED the vendor's "${emailConfirmedKey}" meta does not read '1'. The handler calls WithdrawManager::update_merchant_status() (CustomerMerchantIntegrationSellerEmailConfirmed.php:53), which writes this meta from PayPal's live merchant-status response at WithdrawManager.php:88, and the pre-flight consent probe already confirmed PayPal reports this merchant's primary email as confirmed. A null value means either the vendor could not be resolved from the merchant id (Helper.php:611-623) or the live PayPal call returned a WP_Error and the handler bailed at WithdrawManager.php:81-84 — that error is logged to wp-content/uploads/wc-logs/.`,
            ).toBe('1');
            expect(
                await isVendorConnected(VENDOR_ID),
                'the vendor is not payable after their email was confirmed — an email confirmation is precisely the event that unblocks payouts for a vendor waiting on it. The gate needs payments_receivable AND primary_email_confirmed AND at least one OAUTH_THIRD_PARTY integration (WithdrawManager.php:91-101); the third is the one this test cannot pre-verify, and a merchant that has revoked the partner integration would land exactly here.',
            ).toBe(true);
        } finally {
            await reseedBothVendors();
        }

        log.success('PP-ONB-13: the seller-email-confirmed event re-read the merchant status from PayPal and restored the vendor\'s confirmed-email state.');
    }

    async ppOnb14(): Promise<void> {
        test.skip(!!consentSkipReason, consentSkipReason ?? '');
        await requireGatewayReady('PP-ONB-14');

        const keys = await currentVendorMetaKeys();
        const receivableKey = keys.payments_receivable ?? '_dokan_paypal_test_payments_receivable';

        try {
            await reseedBothVendors();
            await dbUtils.deleteUserMeta(VENDOR_ID, [receivableKey]);
            expect(await readMeta(VENDOR_ID, receivableKey), `the precondition delete of "${receivableKey}" did not take, so the handler could write nothing and still appear to work`).toBeNull();

            const result = await injectPayPalWebhook(PAYPAL_EVENTS.merchantCapabilityUpdated, {
                merchant_id: PAYPAL_MERCHANTS.vendor1,
                capabilities: [{ name: 'PPCP_STANDARD', status: 'ACTIVE' }],
            });

            expect(result.is_handled, `the module does not map ${PAYPAL_EVENTS.merchantCapabilityUpdated}, so PayPal withdrawing or granting a vendor's payment capability would go unnoticed and the marketplace would keep routing money to an account that can no longer receive it`).toBe(true);
            expect(result.handler, 'the capability-updated event must route to CustomerMerchantIntegrationCapabilityUpdated').toBe('CustomerMerchantIntegrationCapabilityUpdated');
            expect(result.fatal, `the handler raised a PHP fatal: ${result.error ?? 'no message'}`).toBe(false);

            expect(
                await readMeta(VENDOR_ID, receivableKey),
                `after CAPABILITY-UPDATED the vendor's "${receivableKey}" meta does not read '1', although the pre-flight consent probe confirmed PayPal reports this merchant as receivable. The handler calls WithdrawManager::update_merchant_status() (CustomerMerchantIntegrationCapabilityUpdated.php:53) which writes it from PayPal's live response at WithdrawManager.php:87 — a null value means the merchant could not be resolved (Helper.php:611-623) or the live call failed and the handler bailed at :81-84 (logged to wp-content/uploads/wc-logs/).`,
            ).toBe('1');
            expect(
                await isVendorConnected(VENDOR_ID),
                'the vendor is not payable after a capability refresh that PayPal reports as receivable — this event is how a marketplace learns a vendor regained the ability to be paid, so a vendor stuck here stays invisible to the gateway at checkout',
            ).toBe(true);
        } finally {
            await reseedBothVendors();
        }

        log.success('PP-ONB-14: the capability-updated event re-read the merchant status from PayPal and restored the vendor\'s receivable state.');
    }

    async ppOnb15(): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-15');

        const keys = await currentVendorMetaKeys();

        try {
            await reseedBothVendors();
            expect(await isVendorConnected(VENDOR_ID), 'vendor1 must start connected, or "the metas are gone" is already true before the event is injected').toBe(true);
            expect(await isVendorConnected(VENDOR2_ID), 'vendor2 must start connected too — this test also proves the revocation is scoped to ONE merchant').toBe(true);

            const result = await injectPayPalWebhook(PAYPAL_EVENTS.merchantConsentRevoked, { merchant_id: PAYPAL_MERCHANTS.vendor1 });

            expect(
                result.is_handled,
                `the module does not map ${PAYPAL_EVENTS.merchantConsentRevoked}. A vendor revoking partner consent at PayPal would then leave Dokan still holding their merchant id as a payee, and every subsequent order for that vendor would be built with a payee PayPal will refuse.`,
            ).toBe(true);
            expect(result.handler, 'the consent-revoked event must route to MerchantPartnerConsentRevoked').toBe('MerchantPartnerConsentRevoked');
            expect(result.fatal, `the handler raised a PHP fatal: ${result.error ?? 'no message'}`).toBe(false);

            for (const [label, metaKey] of Object.entries(keys)) {
                expect(
                    await readMeta(VENDOR_ID, metaKey),
                    `consent revocation left "${metaKey}" (${label}) behind. MerchantPartnerConsentRevoked::handle() deletes all six at MerchantPartnerConsentRevoked.php:50-62; a survivor means Dokan still believes it may pay an account that has withdrawn permission.`,
                ).toBeNull();
            }
            expect(await isVendorConnected(VENDOR_ID), 'vendor1 still reads as payable after PayPal revoked their partner consent').toBe(false);

            // Scoping: the event names ONE merchant, and the handler resolves the user from it.
            // A revocation that also disconnected the other vendor would be a marketplace-wide outage.
            expect(await isVendorConnected(VENDOR2_ID), 'vendor2 was disconnected by a consent revocation that named vendor1 — one vendor leaving must never sever another vendor\'s payouts').toBe(true);
        } finally {
            await reseedBothVendors();
        }

        log.success('PP-ONB-15: a consent revocation removed all six of vendor1\'s PayPal metas and left vendor2 untouched.');
    }

    async ppOnb16({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-16');
        expect(vendorProductId, 'no vendor1 product was created in beforeAll, so there is no cart to reason about').not.toBe('');

        const keys = await currentVendorMetaKeys();
        const receiveKey = keys.enable_for_receive ?? TEST_MODE_KEYS.enableForReceive;
        const receivableKey = keys.payments_receivable ?? '_dokan_paypal_test_payments_receivable';

        try {
            await reseedBothVendors();

            // POSITIVE CONTROL FIRST. "The gateway is hidden" is trivially true on any site where
            // the gateway never appears, and that is the single most common fake-green in this
            // module. Prove it appears before proving it disappears.
            await withUser(browser, customerAuth, async (_page, paypal) => {
                await dbUtils.clearCustomerCart(CUSTOMER_ID);
                await paypal.addProductToCart(vendorProductId);

                const cart = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
                expect(
                    cart,
                    `the customer's cart does not hold product ${vendorProductId}. An empty cart offers no payment methods at all, so every availability answer in this test would be a statement about the cart rather than about the vendor's PayPal state.`,
                ).toMatch(new RegExp(`"product_id";(i:${vendorProductId};|s:\\d+:"${vendorProductId}")`));

                expect(
                    await paypal.isGatewayOfferedAtBlockCheckout(),
                    `the PayPal gateway is NOT offered at checkout for a fully connected, payable vendor. Helper::validate_cart_items() (Helper.php:1302-1342) walks the cart and requires is_seller_enable_for_receive_payment() for every vendor, and vendor ${VENDOR_ID} satisfies it — so the negative half of this test would pass against a gateway that is simply never available, and prove nothing.`,
                ).toBe(true);
            });

            // OBSERVATION, deliberately recorded rather than assumed. The catalogue asks this case
            // to report what the code actually does. `payments_receivable` is PayPal's OWN
            // capability flag, but the gate `is_seller_enable_for_receive_payment()` reads
            // `merchant_id && enable_for_receive_payment` (Helper.php:128-130) — the receivable
            // flag is NOT consulted at checkout. In production the two stay in step because
            // update_merchant_status() derives one from the other (WithdrawManager.php:86-101);
            // flipping only the flag is a test-side state, not a reachable production state.
            await dbUtils.deleteUserMeta(VENDOR_ID, [receivableKey]);
            const stillOfferedWithoutFlag = await withUser(browser, customerAuth, async (_page, paypal) => paypal.isGatewayOfferedAtBlockCheckout());
            log.info(
                'PP-ONB-16 observed behaviour: the checkout gate is the receive-payment meta, not the receivable flag.',
                `With "${receivableKey}" removed and "${receiveKey}" intact, the gateway is ${stillOfferedWithoutFlag ? 'STILL OFFERED' : 'HIDDEN'}. ` +
                    'Helper::is_seller_enable_for_receive_payment() consults only the merchant id and the receive-payment gate (Helper.php:128-130); ' +
                    'WithdrawManager::update_merchant_status() is what keeps the two consistent (WithdrawManager.php:86-101).',
            );

            // THE ACTUAL GATE.
            await dbUtils.deleteUserMeta(VENDOR_ID, [receiveKey]);
            expect(
                await isVendorConnected(VENDOR_ID),
                `removing "${receiveKey}" must make the vendor read as not payable — if it does not, the precondition failed and the checkout reading below is not about a non-receivable vendor`,
            ).toBe(false);

            await withUser(browser, customerAuth, async (_page, paypal) => {
                expect(
                    await paypal.isGatewayOfferedAtBlockCheckout(),
                    `the PayPal gateway is STILL offered at checkout while the cart holds a product from vendor ${VENDOR_ID}, who cannot receive payment. ` +
                        'A shopper would complete a PayPal payment whose purchase unit names a payee PayPal will reject, so the money either fails at capture ' +
                        'or lands somewhere nobody chose. The guard is PayPal::is_available() → Helper::validate_cart_items() (PaymentMethods/PayPal.php:598-609, Helper.php:1302-1342).',
                ).toBe(false);
            });
        } finally {
            await dbUtils.clearCustomerCart(CUSTOMER_ID);
            await reseedBothVendors();
        }

        log.success('PP-ONB-16: the gateway is offered for a payable vendor and hides once that vendor loses the receive-payment gate.');
    }

    async ppOnb17({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-17');

        const keys = await currentVendorMetaKeys();
        const merchantKey = keys.merchant_id ?? TEST_MODE_KEYS.merchantId;
        const settingsKey = keys.marketplace_settings ?? TEST_MODE_KEYS.marketplaceSettings;

        try {
            await reseedBothVendors();
            const vendor1Before = await readMeta(VENDOR_ID, merchantKey);
            expect(vendor1Before, 'vendor1 carries no merchant id, so there is nothing for vendor2 to read or overwrite and every assertion below would pass vacuously').toBe(PAYPAL_MERCHANTS.vendor1);

            // READ — vendor2's own onboarding screen must show vendor2's identity and never vendor1's.
            await withUser(browser, vendor2Auth, async (page, paypal) => {
                await paypal.gotoVendorPaymentSettings();
                const html = await page.content();
                expect(
                    html.includes(PAYPAL_MERCHANTS.vendor1),
                    `vendor1's merchant id "${PAYPAL_MERCHANTS.vendor1}" appears on vendor2's PayPal payment-settings screen. A merchant id identifies the PayPal account that receives a vendor's money; disclosing it to a competitor on the same marketplace is an information-disclosure finding on its own, and it is the value an attacker needs to attempt a payee swap.`,
                ).toBe(false);
                expect(
                    html.includes(PAYPAL_MERCHANTS.vendor2),
                    `vendor2's OWN merchant id "${PAYPAL_MERCHANTS.vendor2}" is not on vendor2's screen either, so this page is not rendering any merchant id at all and the absence of vendor1's proves nothing (vendor-settings-payment.php:11)`,
                ).toBe(true);
            });

            // READ — the underlying REST surfaces.
            for (const url of [`${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}`, `${SERVER_URL}/dokan/v1/settings?vendor_id=${VENDOR_ID}`, `${SERVER_URL}/dokan/v2/settings?vendor_id=${VENDOR_ID}`]) {
                const res = await probe(url, { headers: VENDOR2 });
                expect(res.text, `vendor2 read vendor1's PayPal merchant id from ${url} — that value names the account vendor1 is paid into`).not.toContain(PAYPAL_MERCHANTS.vendor1);
            }

            // WRITE — the module's OWN writer, driven with a VALID nonce.
            //
            // This is what PP-SEC-07 could not do: it sent a forged nonce, so the handler stopped
            // at the nonce gate and never demonstrated WHO a successful connect writes for. Here
            // vendor2 holds a genuine nonce and explicitly asks the handler to act on vendor1 by
            // posting vendor_id/seller_id. `handle_paypal_marketplace_connect()` resolves the
            // subject with `dokan_get_current_user_id()` (source coordinates withheld) and
            // ignores both, so the write must land on vendor2 and nowhere near vendor1.
            await clearPayPalVendor(VENDOR2_ID);
            await ensureVendorStoreAddress(VENDOR2_ID, SUPPORTED_COUNTRY);

            await withUser(browser, vendor2Auth, async (page, paypal) => {
                await paypal.gotoVendorPaymentSettings();
                const nonce = await harvestConnectNonce(page);
                expect(nonce, "no connect nonce could be harvested for vendor2, so the strongest half of this test — a cross-vendor write attempt carrying a genuine nonce — cannot run").not.toBe('');

                const res = await postConnect(page, {
                    action: CONNECT_AJAX_ACTION,
                    vendor_paypal_email_address: 'dokangit@vendor2.com',
                    vendor_id: String(VENDOR_ID),
                    seller_id: String(VENDOR_ID),
                    user_id: String(VENDOR_ID),
                    nonce,
                });

                // Whether the referral itself succeeded is PP-ONB-06's business. What matters here
                // is only that the handler ran and that nothing it did touched vendor1.
                expect(res.text, 'the connect POST never reached the handler, so this cross-vendor attempt exercised nothing').not.toBe('0');
            });

            expect(
                await readMeta(VENDOR_ID, merchantKey),
                `vendor1's merchant id changed after vendor2 posted a validly-nonced connect request naming vendor_id=${VENDOR_ID}. A vendor able to rewrite another vendor's merchant id redirects every future payout for that vendor to an account of their choosing — this is the payee-swap the whole module has to prevent.`,
            ).toBe(vendor1Before);
            expect(await isVendorConnected(VENDOR_ID), "vendor1 must still read as connected after vendor2's cross-vendor connect attempt").toBe(true);

            const vendor2Settings = (await readMeta(VENDOR2_ID, settingsKey)) ?? '';
            const vendor1Settings = (await readMeta(VENDOR_ID, settingsKey)) ?? '';
            expect(
                vendor1Settings.includes('dokangit@vendor2.com'),
                `vendor2's PayPal email landed in VENDOR1's marketplace-settings meta. The handler writes for dokan_get_current_user_id() (RegisterWithdrawMethods.php:163, 237-246); if a posted vendor_id can steer that write, one vendor can hijack another's onboarding. vendor2 settings: ${vendor2Settings.slice(0, 200)}`,
            ).toBe(false);
        } finally {
            await ensureVendorStoreAddress(VENDOR2_ID, SUPPORTED_COUNTRY);
            await reseedBothVendors();
        }

        log.success("PP-ONB-17: vendor2 cannot see vendor1's merchant id on any surface, and a validly-nonced connect naming vendor1 still wrote only for vendor2.");
    }

    async ppOnb18({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, NO_CREDENTIALS);
        await requireGatewayReady('PP-ONB-18');

        await reseedBothVendors();
        const merchantId = PAYPAL_MERCHANTS.vendor1;
        expect(merchantId, 'no merchant id is configured for vendor1, so searching the storefront for it would find nothing whatever the product does').not.toBe('');

        // POSITIVE CONTROL for the search itself: the string must be findable SOMEWHERE by someone
        // entitled to it. Without this, a typo in the id makes every "absent" assertion pass.
        const adminStore = await probe(`${SERVER_URL}/dokan/v1/stores/${VENDOR_ID}`, { headers: ADMIN });
        expect(
            adminStore.text.includes(merchantId) || (await readMeta(VENDOR_ID, TEST_MODE_KEYS.merchantId)) === merchantId,
            `the merchant id "${merchantId}" cannot be found even in an administrator's own read of vendor1, so it is not the value this site actually stores and every "it is absent from the storefront" assertion below is searching for a string that never existed`,
        ).toBe(true);

        const targets: Array<{ label: string; url: string }> = [];
        if (vendorShopUrl) targets.push({ label: "vendor1's store page", url: vendorShopUrl });
        if (vendorProductPermalink) targets.push({ label: "vendor1's product page", url: vendorProductPermalink });
        targets.push({ label: 'the shop archive', url: siteUrl('/shop/') });
        expect(targets.length, 'no storefront URL could be resolved for vendor1, so nothing was searched').toBeGreaterThan(1);

        // No storageState at all — a genuinely anonymous visitor, which is the only caller this
        // case is about. `baseURL` is still supplied so a relative target could not silently fail.
        const ctx = await browser.newContext({ baseURL: BASE_URL });
        const page = await ctx.newPage();
        try {
            for (const target of targets) {
                await page.goto(target.url, { waitUntil: 'domcontentloaded' });
                const html = await page.content();
                expect(
                    html.includes(merchantId),
                    `${target.label} (${target.url}) leaks vendor1's PayPal merchant id "${merchantId}" to an anonymous visitor. That value names the PayPal account the vendor is paid into and is not shopper-facing data; published in page source it is an information-disclosure finding and hands an attacker the exact identifier a payee-swap attack needs.`,
                ).toBe(false);
            }
        } finally {
            await page.close();
            await ctx.close();
        }

        log.success(`PP-ONB-18: the merchant id is absent from all ${targets.length} anonymous storefront pages checked, while remaining readable by an administrator.`);
    }
}
