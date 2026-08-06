import { test, expect, request } from '@utils/test';
import type { Browser, Page, Response } from '@utils/test';
import { BASE_URL, SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { PayPalMarketplacePage, PAYPAL_IDS, waitForCheckoutSettled } from './paypalMarketplacePage';
import {
    customerAuth,
    VENDOR_ID,
    VENDOR2_ID,
    CUSTOMER_ID,
    PAYPAL_MERCHANTS,
    PAYPAL_VENDOR_LOGINS,
    hasCredentials,
    ensurePayPalConfigured,
    getPayPalStatus,
    seedPayPalConnectedVendor,
    ensureCustomerAddress,
    ensureVendorStoreAddress,
    ensureClassicCheckoutPage,
    getBothMerchantConsents,
    isPayableMerchant,
    getUccState,
    setUccGate,
    setVendorUcc,
    adminContext,
    getWcOrder,
    getDokanOrderRows,
    near,
    describeProbe,
    cardFormMarkers,
} from './helpers';
import type { MerchantConsent, UccState, UccStateResolved, WcOrder, DokanOrderRow } from './helpers';

/* Selectors live on the page object (SKILL non-negotiable #1: selectors belong in
 * `<slug>Page.ts`). These aliases keep the existing in-file names readable. */
const CLASSIC = PayPalMarketplacePage.classic;
const UCC = PayPalMarketplacePage.ucc;
const HOSTED_FIELD = PayPalMarketplacePage.hostedField;

// The suite tsconfig is strict and does not pull @types/node.
declare const process: { env: Record<string, string | undefined> };

/**
 * PayPal Marketplace — UNBRANDED ADVANCED CARD / UCC (PP-UCC-01 … PP-UCC-07).
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * WHY THIS FILE EXISTS
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Every money case in this suite so far drives a PayPal-HOSTED buyer login. On 2026-08-03 a real
 * run made roughly fifty of those logins, the sandbox buyer was locked out ("It looks like you have
 * tried too many times"), each attempt cost up to 4.5 minutes, the 1h `globalTimeout` was exhausted
 * and 163 tests never ran. PayPal publishes no API that approves a WALLET order on the buyer's
 * behalf, so that path cannot avoid the login.
 *
 * The Advanced Card (unbranded credit card, "UCC") path can: the buyer types a card into hosted
 * fields served INTO OUR OWN checkout page and PayPal never renders a login screen. Both suite
 * vendors report `PPCP_CUSTOM` as subscribed, so the capability exists on this sandbox.
 *
 * This file AUGMENTS the wallet coverage, it does not replace it. Post-capture mechanics — the
 * commission split, the disbursement mode, refund eligibility — are produced by code that never
 * learns how the buyer approved (`OrderController::handle_capture_payment_validation()` →
 * `OrderManager::handle_order_complete_status()` → `store_capture_payment_data()`, reached
 * identically from the wallet's `maybe_process_order_redirect()` and from the card's
 * `dokan_paypal_capture_payment` AJAX). So a card-obtained captured order is a legitimate fixture
 * for those facts.
 *
 * It is NOT a substitute for PP-CHK-06/07/08/12/15, whose SUBJECT is the wallet approval itself —
 * the redirect to PayPal, cancel-and-return, the post-approval return, the lost session. Those stay
 * blocked on a PayPal-hosted buyer login and must never be relabelled as covered because a case in
 * this file passed.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * WHAT IS HERE THAT IS NOWHERE ELSE
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   PP-UCC-01  the card form is offered when — and its hosted fields really mount because —
 *              `Helper::is_ucc_enabled()` resolves true. `paypalMarketplace3ds.spec.ts` proves the
 *              SERVER-rendered template appears; nothing until now proved the browser half:
 *              a non-empty `data-client-token` and three cross-origin braintree iframes.
 *   PP-UCC-02  the whole card surface is withdrawn when ONE seller in a two-vendor cart lacks the
 *              gate-5 meta, while `Helper::is_ucc_enabled()` itself stays true — the only case in
 *              the suite that isolates `CartManager::is_ucc_enabled_for_all_seller_in_cart()`.
 *   PP-UCC-03  a card payment CAPTURES, with no PayPal-hosted page ever visited.
 *   PP-UCC-04  the captured card order carries the same split/commission facts a wallet capture
 *              would, read from what PayPal actually settled rather than from what was requested.
 *   PP-UCC-05  a multi-vendor card capture writes a capture id to EVERY sub order, plus the
 *              vendor-keyed copy on the parent.
 *   PP-UCC-06  the unbranded Pay button is gated on hosted-field validity, so an incomplete card
 *              cannot start a payment at all.
 *   PP-UCC-07  the SDK tag carries the client token and EVERY seller's merchant id for a split
 *              cart — without both, hosted fields cannot be eligible for a two-vendor order.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * THE TWO HONEST UNKNOWNS, AND HOW EACH IS REPORTED
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * 1. PayPal-side eligibility. `setVendorUcc()` opens only the LOCAL half of gate 5. Whether
 *    `Processor::get_generated_client_token()` returns a token and whether
 *    `paypal.HostedFields.isEligible()` returns true for this platform client id plus these
 *    merchant ids is PayPal's decision. A missing token is asserted as a FAILURE (the module drops
 *    the attribute silently, logging only to the Dokan log — that is a product-visible defect), but
 *    `isEligible() === false` is an ENVIRONMENT block and becomes a declared `test.skip`, because a
 *    red there would make the run report lie about the product.
 *
 * 2. Forced 3D Secure. `hf.submit({ contingencies: ['3D_SECURE'] })` is hardcoded product code
 *    (`assets/src/js/paypal-checkout.js:409-414`) and PayPal documents `3D_SECURE` as the deprecated
 *    synonym of `SCA_ALWAYS`, i.e. authentication on EVERY transaction. PayPal also states 3DS is
 *    supported only in PSD2-mandate countries and this store's base country is US, so the
 *    contingency may be a no-op here — plausible, unverified, and NOT assumed. If a challenge is
 *    drawn into `#payments-sdk__contingency-lightbox` the case declares a skip naming it, rather
 *    than timing out against a bank page.
 *
 * Not `test.describe.serial`, and never tagged `@serial`: `.serial` aborts the rest of the group on
 * the first failure (on 2026-07-31 that silently erased 46 of 68 cases from a run that still
 * summarised as green), and `@serial` is grep-inverted out of BOTH CI lanes at
 * `playwright.config.ts:13`, which would delete this file from CI with no reported failure.
 */

/* ------------------------------------------------------------------ */
/* Actors and fixtures                                                 */
/* ------------------------------------------------------------------ */

/**
 * Gate 5 is ALL-OR-NOTHING across the cart (`Cart/CartManager.php:48-62`), so every seller that can
 * appear in any cart in this file is opened and restored together. Passing only one of them would
 * make the card surface vanish for the two-vendor cases and they would silently degrade into
 * wallet-only pages that still "pass" their absence assertions.
 */
const UCC_VENDORS: string[] = [VENDOR_ID, VENDOR2_ID];

/** Env-driven like every other identity here; hardcoding it seeds the wrong sandbox account. */
const VENDOR1_EMAIL = PAYPAL_VENDOR_LOGINS.vendor1.email || 'dokangit@vendor1.com';
const VENDOR2_EMAIL = PAYPAL_VENDOR_LOGINS.vendor2.email || 'dokangit@vendor2.com';

/** `?? 'wp'` like every sibling spec: an undefined prefix builds `undefined_dokan_orders`, and the
 *  SQL error that follows would fail PP-UCC-04/-05 for an environment reason wearing a product mask. */
const DB_PREFIX = process.env.DB_PREFIX ?? 'wp';

/** Classic `[woocommerce_checkout]` shortcode page — `ensureClassicCheckoutPage()` creates it. */

/**
 * The UCC surface. Server-rendered markers first, then the two browser-side ones nothing else in
 * this suite has ever asserted.
 *
 *   - `templates/3DS-payment-option.php` (loaded by `PayPal::payment_fields()`,
 *     `PaymentMethods/PayPal.php:182-190`) renders `.card_container` with the three EMPTY field
 *     containers, the real `#dpm_name_on_card` input and the 3DS lightbox target.
 *   - `CartHandler::display_paypal_button()` (`Cart/CartHandler.php:271-278`) renders
 *     `.unbranded_checkout > #pay_unbranded_order` inside `#paypal-button-container`, which ships
 *     with an inline `display:none` that only `toggle_buttons()` removes.
 *   - `CartHandler::add_bn_code_to_script()` (`Cart/CartHandler.php:163-240`) rewrites the SDK tag
 *     and — only under the UCC gate — adds `data-client-token`. Without that attribute
 *     `paypal.HostedFields.isEligible()` is false and no field ever mounts.
 */

/**
 * The hosted-field inputs live in CROSS-ORIGIN iframes, one per container, injected by braintree-web
 * (which `paypal/paypal-card-components` vendors, and which is what the SDK's `hosted-fields`
 * component is built from).
 *
 * Two selectors are ORed for the input on purpose. `data-braintree-name` and the id both come from
 * the same source (`src/hosted-fields/internal/components/base-input.js:13-26` plus the name map at
 * `src/hosted-fields/shared/constants.js:95-121`), so they resolve to the SAME element and the OR is
 * a hedge against one of the two drifting in a future SDK build — NOT an ambiguity: if they ever
 * matched two different elements Playwright's strict mode fails loudly instead of typing into the
 * wrong box.
 *
 * A bare `input` locator is deliberately avoided: the same frame also carries a hidden autofill
 * decoy (`<name>-autofill-field`, `aria-hidden="true"`, `tabindex="-1"` —
 * `src/hosted-fields/internal/index.js:96-133`) which a bare locator can resolve onto.
 */

/** WooCommerce's own checkout transport, which the hosted-fields `createOrder` callback drives. */
const CHECKOUT_AJAX = /wc-ajax=checkout/;

/** Single-site persistent-cart user meta — the row `dbUtils.clearCustomerCart()` deletes. */
const PERSISTENT_CART_META = '_woocommerce_persistent_cart_1';

/* ------------------------------------------------------------------ */
/* The test card                                                       */
/* ------------------------------------------------------------------ */

/**
 * The PAN is read from the environment and NEVER hardcoded.
 *
 * PayPal's sandbox card numbers are published and static, so the number itself is not a secret. The
 * reason it is env-driven is different and stricter: the research behind this file could not CONFIRM
 * that any specific number completes a purchase without a 3DS step-up on this account, and baking an
 * unconfirmed value in would produce a run that hangs on a bank page and reports the product as
 * broken. `PAYPAL_UCC_TEST_CARD` is therefore a declared fixture: set it to a number harvested as
 * working on this sandbox, and the card cases run; leave it unset and they skip with the reason
 * printed in the run report.
 *
 * The strongest published candidate is Visa `4868719196829038` (Mastercard `5329879707824603`) —
 * PayPal's 3DS "Test Case 1, successful frictionless authentication": `liability_shift POSSIBLE`,
 * `enrollment_status Y`, `authentication_status Y`, no challenge. It is the right shape precisely
 * because the module forces `contingencies: ['3D_SECURE']`. Do NOT use `4868719166101368` /
 * `5329879735316929` ("Test Case 7, successful step-up") — that one REQUIRES a challenge and would
 * hang an unattended run inside `#payments-sdk__contingency-lightbox`.
 */
const CARD = {
    number: (process.env.PAYPAL_UCC_TEST_CARD ?? '').replace(/[\s-]/g, ''),
    cvv: process.env.PAYPAL_UCC_TEST_CARD_CVV || '123',
    /**
     * PayPal requires only "a future expiration date", so the default is COMPUTED rather than
     * written down: a literal would silently expire and turn every card case red for a reason that
     * has nothing to do with the product. braintree's `expirationDate` field accepts `MM/YYYY`
     * (maxlength 7) as well as the `mm/yy` the module places as its placeholder.
     */
    expiry: process.env.PAYPAL_UCC_TEST_CARD_EXPIRY || `12/${new Date().getFullYear() + 3}`,
    /**
     * The cardholder name is ALSO PayPal's decline lever: a `CCREJECT-*` value here forces a
     * specific processor decline. This must therefore stay an ordinary name — a stray trigger word
     * would turn every capture case into a decline and the failures would point at the gateway.
     * Decline coverage is deliberately out of scope for this file.
     */
    holder: process.env.PAYPAL_UCC_TEST_CARD_HOLDER || 'Dokan QA',
} as const;

/** A PAN is 12-19 digits; anything shorter is a typo or a placeholder, not a card. */
const HAS_TEST_CARD = /^\d{12,19}$/.test(CARD.number);

/* ------------------------------------------------------------------ */
/* Skip reasons — each names what is missing AND what unblocks it       */
/* ------------------------------------------------------------------ */

const MODULE_SKIP =
    'the paypal_marketplace module is inactive, so there is no gateway, no checkout script and no UCC template — every assertion here would be about a feature that was never loaded. Activate the module (site setup does it) before reading anything into this result.';

const CREDENTIALS_SKIP =
    'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE), so Helper::is_ready() can never be true, the gateway is never offered at checkout and no client token can be minted. PP-PRE-01 reports the absence.';

const CARD_SKIP =
    'PAYPAL_UCC_TEST_CARD is not set, so no card can be typed into the hosted fields and no unattended capture is possible. Set it to a sandbox PAN confirmed to complete a purchase on THIS sandbox account without a 3D Secure step-up — the published candidate is Visa 4868719196829038 (Mastercard 5329879707824603, PayPal 3DS "Test Case 1", frictionless success), and explicitly NOT 4868719166101368 / 5329879735316929, which require a challenge. Optional companions: PAYPAL_UCC_TEST_CARD_CVV (default 123), PAYPAL_UCC_TEST_CARD_EXPIRY (default computed three years out), PAYPAL_UCC_TEST_CARD_HOLDER (default "Dokan QA" — never a CCREJECT-* value). The number is NOT a secret; it is env-driven because no value could be confirmed working from source alone.';

const FORCED_3DS_SKIP =
    'PayPal raised a 3D Secure CHALLENGE inside #payments-sdk__contingency-lightbox, so the payment is now waiting on an issuer ACS page that no API in this suite can complete. The module hardcodes hf.submit({ contingencies: ["3D_SECURE"] }) at assets/src/js/paypal-checkout.js:409-414 — PayPal documents 3D_SECURE as the deprecated synonym of SCA_ALWAYS, i.e. authentication on EVERY transaction — and QA may not change product code to avoid it. Unblocked by supplying a PAYPAL_UCC_TEST_CARD that authenticates FRICTIONLESSLY on this sandbox (PayPal 3DS "Test Case 1" is the documented one), or by a sandbox account/region where PayPal no-ops the contingency. Reported as a declared skip rather than a timeout because a challenge is an environment block, not a product defect.';

function eligibilitySkipReason(diagnostic: Record<string, unknown>): string {
    return (
        'paypal.HostedFields.isEligible() returned false in the browser, so the SDK refused to mount any card field and there is nothing to type into. ' +
        'This is PayPal-side vetting (the PPCP_CUSTOM capability for the platform client id together with the merchant id(s) on the SDK url) plus a usable data-client-token — none of it is seedable from this suite, which is why this is a declared skip and not a failure. ' +
        'Unblocked by PayPal approving Advanced Card processing for every seller in the cart on this sandbox. The server-rendered half of the surface is still asserted by PP-UCC-01/-02/-07 and by PP-3DS-01…03. ' +
        `Browser diagnostic: ${JSON.stringify(diagnostic) ?? '(unavailable)'}`
    );
}

function environmentSkipReason(state: UccStateResolved): string {
    return (
        `this store cannot host the UCC surface at all: Helper::is_ucc_enabled() (Helper.php:178-190) requires the WooCommerce base country to be one of ${JSON.stringify(state.ucc_supported_countries)} and the store currency to be one of that country's UCC currencies ${JSON.stringify(state.ucc_supported_currencies)}, and this store is ${state.base_country || '(no base country set)'} / ${state.store_currency || '(no currency)'}. ` +
        'Both lists come from the PRODUCT over the /ucc-state route, not from a mirror in this file. The card form cannot render here, so every assertion below would be measuring the store rather than the gateway. ' +
        'Set a UCC-eligible base country and currency in WooCommerce before reading anything into this result — this file deliberately never rewrites them.'
    );
}

/* ------------------------------------------------------------------ */
/* Small readers                                                       */
/* ------------------------------------------------------------------ */

/** Raw meta value, un-coerced: `_dokan_paypal_capture_data_by_vendor` comes back as an OBJECT. */
function metaOf(order: WcOrder, key: string): unknown {
    return (order.meta_data ?? []).find(entry => entry.key === key)?.value;
}

/** Scalar meta as a string; `''` when the row is absent, which is what every "must be written" check compares against. */
function metaString(order: WcOrder, key: string): string {
    const value = metaOf(order, key);
    return value === undefined || value === null ? '' : String(value);
}

/** Compact printable form of an order's PayPal metas — put in every failure message so the state is on screen. */
function describeOrderMeta(order: WcOrder): string {
    const interesting = (order.meta_data ?? []).filter(entry => entry.key.includes('paypal') || entry.key === 'dokan_gateway_fee_paid_by');
    return JSON.stringify({ id: order.id, status: order.status, total: order.total, meta: interesting }) ?? '(unprintable)';
}

/**
 * Settle a promise into a tagged result instead of letting it reject.
 *
 * This is NOT a swallowed diagnostic: every caller reports `error` verbatim in its own failure
 * message. It exists because two `waitForResponse()` promises are armed BEFORE the Pay button is
 * clicked, and whichever one is not awaited first would otherwise reject unhandled and be lost.
 */
type Settled<T> = { ok: true; value: T } | { ok: false; error: unknown };

function settled<T>(promise: Promise<T>): Promise<Settled<T>> {
    return promise.then(
        value => ({ ok: true as const, value }),
        error => ({ ok: false as const, error }),
    );
}

/** Whatever WooCommerce or the module has shown the shopper — quoted in every card-path failure. */
async function readNotices(page: Page): Promise<string> {
    const text = await page
        .locator(CLASSIC.notices)
        .allInnerTexts()
        .catch(() => [] as string[]);
    return text.join(' | ').slice(0, 600) || '(no notice rendered)';
}

/* ------------------------------------------------------------------ */
/* Gate control — open exactly what the product reads, restore exactly  */
/* what was found                                                      */
/* ------------------------------------------------------------------ */

/**
 * The gateway-settings baseline as `/ucc-gate` reported it, captured by an EMPTY patch (the route
 * writes nothing when no key is sent but still reports `previous`). `null` inside it means the KEY
 * WAS ABSENT and passing it back deletes the key again — writing `''` there instead would leave
 * `Helper::get_button_type()` returning `''` rather than falling through to its own default, which
 * is a different site state from the one this file found.
 *
 * `undefined` means beforeAll never got as far as capturing it, and nothing is restored off an
 * unknown baseline.
 */
let gateBaseline: { ucc_mode: string | null; button_type: string | null } | undefined;

/** The gate-5 meta as it was found, per vendor id. `''` means the row was absent. */
let vendorUccBaseline: Record<string, string> | undefined;

/** Open all five local gates for the given sellers. Country and currency are asserted, never written. */
async function openUccGates(vendorIds: string[]): Promise<void> {
    await setUccGate({ button_type: 'smart', ucc_mode: 'yes' }, vendorIds);
    await setVendorUcc(vendorIds, true);
}

/**
 * Put the site back exactly as it was found.
 *
 * `button_type` is the sibling-breaker: UCC needs `'smart'` while `placeClassicOrder()` in
 * paypalMarketplaceCheckout.spec.ts needs `'standard'` because it asserts `#place_order` is visible,
 * and `window.dokan_paypal` (nonce, ajaxurl) is only localised under `'smart'`
 * (`Cart/CartHandler.php:95-97`) — which Split.spec.ts:623 and Security.spec.ts:612 use as their
 * transport. PP-SET-19 re-asserts the smart + `ucc_mode: 'no'` baseline, so a leak from here fails
 * there, noisily and in the wrong file. Hence: restored in afterEach as well as afterAll, and the
 * value restored is the one the harness handed back, never a literal.
 */
async function restoreUccBaseline(): Promise<void> {
    if (gateBaseline) {
        await setUccGate(gateBaseline);
    }
    if (!vendorUccBaseline) {
        return;
    }
    const enable = Object.entries(vendorUccBaseline)
        .filter(([, raw]) => Boolean(raw))
        .map(([id]) => id);
    const disable = Object.entries(vendorUccBaseline)
        .filter(([, raw]) => !raw)
        .map(([id]) => id);
    if (enable.length) {
        await setVendorUcc(enable, true);
    }
    if (disable.length) {
        // `enabled: false` DELETES the meta, which is the suite baseline (an absent row) rather than
        // a stored falsy value. Both read false to the product, but only one matches what was found.
        await setVendorUcc(disable, false);
    }
}

/** `test.skip()` cannot narrow a union for TypeScript, so the narrowing is done explicitly. */
function resolvedOrSkip(state: UccState): UccStateResolved {
    if (!state.module_active) {
        test.skip(true, `${MODULE_SKIP} The /ucc-state route reported: ${state.skipped}`);
        throw new Error('unreachable — test.skip(true, …) always throws');
    }
    return state;
}

/** Gates 3 and 4, evaluated against the lists the PRODUCT reports rather than a mirror in this file. */
function countryCurrencyOpen(state: UccStateResolved): boolean {
    return state.ucc_supported_countries.includes(state.base_country ?? '') && state.ucc_supported_currencies.includes(state.store_currency);
}

/**
 * The shared preamble: skip for anything environmental, then OPEN the gates and prove the product
 * itself agrees they are open before a single DOM assertion is made.
 *
 * Asserting `Helper::is_ucc_enabled()` as the product resolves it — not this file's reconstruction
 * of the five conditions — is the whole point: a test that recomputes the rule only proves its own
 * copy agrees with itself, and keeps passing after the product's rule changes.
 *
 * `is_ucc_enabled_for_all_seller_in_cart` is deliberately NOT asserted here. WooCommerce does not
 * build `WC()->cart` for a plain REST request, so over that transport it is computed against a null
 * cart (false — a property of the transport) or, with an empty cart, returns whatever
 * `is_ucc_enabled()` returned with zero sellers checked (a fake green). The DOM is the honest
 * observation of that function, and that is where every case below reads it.
 */
async function openGatesAndRequireUcc(vendorIds: string[]): Promise<UccStateResolved> {
    const status = await getPayPalStatus();
    test.skip(!status.module_active, MODULE_SKIP);
    test.skip(!hasCredentials, CREDENTIALS_SKIP);

    expect(
        status.is_ready,
        `Helper::is_ready() must be true before anything about the card form is asserted: on an unready gateway PayPal is never offered at checkout, so both "the card form renders" and "the card form is gone" would be decided by the credentials rather than by the UCC gate. Gateway state: enabled=${status.is_enabled}, partner id present=${status.has_partner_id}, test mode=${status.is_test_mode}.`,
    ).toBe(true);

    const before = resolvedOrSkip(await getUccState(vendorIds));
    test.skip(!countryCurrencyOpen(before), environmentSkipReason(before));

    await openUccGates(vendorIds);

    const state = resolvedOrSkip(await getUccState(vendorIds));

    expect(
        state.button_type_resolved,
        `gate 1: Helper::get_button_type() must resolve to "smart" (Helper.php:185). CartHandler::payment_scripts() returns before wp_enqueue_script() for any other value (Cart/CartHandler.php:95-97), so neither the SDK nor paypal-checkout.js reaches the page and no card field can exist. State: ${JSON.stringify(state) ?? '(unprintable)'}`,
    ).toBe('smart');

    expect(
        state.is_ucc_mode_allowed,
        `gate 2: Helper::is_ucc_mode_allowed() must be true — it compares the ucc_mode setting against the literal "yes" (Helper.php:165-169), and the harness just wrote "yes". A false here means the write did not land, so everything below would be measuring a closed gate. Raw stored value: ${JSON.stringify(state.ucc_mode_raw)}`,
    ).toBe(true);

    for (const vendorId of vendorIds) {
        const vendor = state.vendors[String(vendorId)];
        expect(
            vendor?.enabled,
            `gate 5: vendor ${vendorId} must carry a truthy "${state.ucc_meta_key ?? '(unresolved meta key)'}" meta. CartManager::is_ucc_enabled_for_all_seller_in_cart() (Cart/CartManager.php:48-62) is all-or-nothing across the cart, so one seller without it removes the card form for the WHOLE order and every case here would silently fall back to a wallet-only page. Vendor state as the product reports it: ${JSON.stringify(vendor ?? null)}`,
        ).toBe(true);
    }

    expect(
        state.is_ucc_enabled,
        `Helper::is_ucc_enabled() (Helper.php:178-190) must resolve TRUE with all four store-level gates open, because it is the product's own answer to "may this marketplace collect card details at all". Asserting the resolved getter rather than the four settings separately is what keeps this case honest when the product's rule changes. Full state: ${JSON.stringify(state) ?? '(unprintable)'}`,
    ).toBe(true);

    return state;
}

/** Merchant consent — the gate a merchant-id FORMAT check cannot see, and the one captures die on. */
let cachedConsents: Record<'vendor1' | 'vendor2', MerchantConsent> | null = null;

async function gateOnPayableMerchants(): Promise<void> {
    if (!cachedConsents) {
        cachedConsents = await getBothMerchantConsents();
    }
    const unpayable = Object.entries(cachedConsents)
        .filter(([, consent]) => !isPayableMerchant(consent))
        .map(([label, consent]) => `${label} (${consent.merchantId}): ${consent.reason ?? 'not payments-receivable'}`);

    test.skip(
        unpayable.length > 0,
        `PayPal will not accept ${unpayable.join('; ')} as a payee, so PayPal::process_payment() cannot create an order and no card can be charged against it. A merchant id that LOOKS right but is not payable makes every money assertion fail opaquely, which is why consent is probed over the network rather than inferred from the id's shape. PP-PRE-04 reports it.`,
    );
}

/* ------------------------------------------------------------------ */
/* Customer-side driving                                               */
/* ------------------------------------------------------------------ */

interface CartLine {
    productId: string;
}

/**
 * Put exactly `lines` in the customer's cart and PROVE each landed, off the database rather than off
 * the page: WooCommerce writes `_woocommerce_persistent_cart_1` from the `woocommerce_add_to_cart`
 * action, which fires only on a SUCCESSFUL add. Without this proof an add that quietly failed leaves
 * a one-vendor cart, and PP-UCC-02's "the card form disappeared" would be true because the second
 * vendor was never in the cart at all.
 */
async function stockCart(page: Page, lines: CartLine[]): Promise<void> {
    await dbUtils.clearCustomerCart(CUSTOMER_ID);
    const paypal = new PayPalMarketplacePage(page);
    for (const line of lines) {
        await paypal.addProductToCart(line.productId);
    }

    const persistentCart = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
    for (const line of lines) {
        expect(
            persistentCart,
            `the customer cart must hold product ${line.productId} before checkout is opened. The classic [woocommerce_checkout] shortcode renders NOTHING for an empty cart, so a failed add is indistinguishable from "no card form offered" on the page itself and every absence assertion in this file would pass for that wrong reason. Persistent cart meta read back: ${JSON.stringify(persistentCart ?? null).slice(0, 400)}`,
        ).toMatch(new RegExp(`"product_id";(i:${line.productId};|s:\\d+:"${line.productId}")`));
    }
}

/**
 * Run a body against a fresh CUSTOMER page sitting on the loaded classic checkout with `lines` in
 * the cart.
 *
 * `baseURL` is passed explicitly: `PayPalMarketplacePage.addProductToCart()` navigates with a
 * RELATIVE url, and a relative goto in a context carrying no base url fails outright.
 */
async function withCustomerCheckout<T>(browser: Browser, lines: CartLine[], body: (page: Page) => Promise<T>): Promise<T> {
    const ctx = await browser.newContext({ storageState: customerAuth, baseURL: BASE_URL });
    const page = await ctx.newPage();
    try {
        await stockCart(page, lines);
        await page.goto(CLASSIC.url, { waitUntil: 'domcontentloaded' });
        // WooCommerce renders #place_order even when no gateway is available, so it is a safe anchor
        // for the positive and the negative cases alike: it proves the order form rendered without
        // implying anything about which gateways it offers.
        await expect(page.locator(CLASSIC.placeOrder), 'the classic checkout page must render the order form before any UCC marker can be read from it').toBeAttached({
            timeout: 60_000,
        });
        return await body(page);
    } finally {
        await page.close();
        await ctx.close();
    }
}

/* ------------------------------------------------------------------ */
/* Page probe                                                          */
/* ------------------------------------------------------------------ */

interface CardProbe {
    gatewayOffered: boolean;
    container: number;
    cardNumber: number;
    cardExpiry: number;
    cvv: number;
    nameOnCard: number;
    contingencyLightbox: number;
    unbranded: number;
    unbrandedButton: number;
    sdkScript: number;
    sdkSrc: string | null;
    clientToken: string | null;
    merchantIdAttr: string | null;
    partnerAttributionId: string | null;
    /**
     * `dokan_paypal.is_ucc_enabled` as the browser sees it. `wp_localize_script()` casts every scalar
     * to a string, so PHP `true` arrives as `'1'` and PHP `false` as `''` — the checkout script keys
     * the whole hosted-fields initialisation on that truthiness (`paypal-checkout.js:275-279`).
     * `null` means the localised object is absent entirely, which is what a non-smart button
     * type produces.
     */
    localizedUccEnabled: string | null;
}

async function readProbe(page: Page): Promise<CardProbe> {
    const sdk = page.locator(UCC.sdkScript).first();
    const sdkScript = await page.locator(UCC.sdkScript).count();

    return {
        gatewayOffered: (await page.locator(CLASSIC.radio).count()) > 0,
        container: await page.locator(UCC.container).count(),
        cardNumber: await page.locator(UCC.cardNumber).count(),
        cardExpiry: await page.locator(UCC.cardExpiry).count(),
        cvv: await page.locator(UCC.cvv).count(),
        nameOnCard: await page.locator(UCC.nameOnCard).count(),
        contingencyLightbox: await page.locator(UCC.contingencyLightbox).count(),
        unbranded: await page.locator(UCC.unbranded).count(),
        unbrandedButton: await page.locator(UCC.unbrandedButton).count(),
        sdkScript,
        sdkSrc: sdkScript > 0 ? await sdk.getAttribute('src') : null,
        clientToken: sdkScript > 0 ? await sdk.getAttribute('data-client-token') : null,
        merchantIdAttr: sdkScript > 0 ? await sdk.getAttribute('data-merchant-id') : null,
        partnerAttributionId: sdkScript > 0 ? await sdk.getAttribute('data-partner-attribution-id') : null,
        localizedUccEnabled: await page.evaluate(() => {
            const w = window as unknown as { dokan_paypal?: Record<string, unknown> };
            if (!w.dokan_paypal) {
                return null;
            }
            const value = w.dokan_paypal['is_ucc_enabled'];
            return value === undefined || value === null ? '' : String(value);
        }),
    };
}

function assertServerRenderedCardForm(probe: CardProbe): void {
    expect(
        probe.gatewayOffered,
        `the PayPal Marketplace radio must be offered at classic checkout with every UCC gate open — without it no card form could render for any reason and nothing below would be about the UCC path. Probe: ${describeProbe(probe)}`,
    ).toBe(true);

    expect(
        probe.cardNumber + probe.cardExpiry + probe.cvv + probe.nameOnCard,
        `templates/3DS-payment-option.php must render all four card inputs (#dpm_card_number, #dpm_card_expiry, #dpm_cvv, #dpm_name_on_card) when Helper::is_ucc_enabled() is true and every seller in the cart carries the UCC meta. Without them a marketplace that has correctly enabled unbranded card payments shows its customers no card form at all, and the only remaining way to pay is the branded PayPal redirect this file exists to avoid. Probe: ${describeProbe(probe)}`,
    ).toBe(4);

    expect(
        probe.unbrandedButton,
        `the unbranded Pay button #pay_unbranded_order must render — CartHandler::display_paypal_button() (Cart/CartHandler.php:271-278) makes it the ONLY submit control on the card path, because the module hides #place_order once PayPal is selected. Without it a customer who filled in a card has no way to submit it. Probe: ${describeProbe(probe)}`,
    ).toBe(1);

    expect(
        probe.sdkSrc ?? '',
        `the PayPal SDK must be requested WITH the hosted-fields component: CartManager::get_paypal_sdk_url() (Cart/CartManager.php:26-37) prepends "components=hosted-fields,buttons" only under the UCC gate, and without it window.paypal.HostedFields is undefined in the browser and no card field can ever mount. Probe: ${describeProbe(probe)}`,
    ).toContain('components=hosted-fields');

    expect(
        probe.localizedUccEnabled,
        `dokan_paypal.is_ucc_enabled must be truthy in the localised data — paypal-checkout.js:275-279 refuses to call HostedFields.render() without it, so a falsy value means the rendered card form is dead markup. wp_localize_script() casts PHP true to the string "1". Probe: ${describeProbe(probe)}`,
    ).toBe('1');

    expect(
        probe.clientToken ?? '',
        `script#dokan_paypal_sdk-js must carry a non-empty data-client-token. CartHandler::add_bn_code_to_script() (Cart/CartHandler.php:216-227) asks Processor::get_generated_client_token() for it under the same UCC gate and, when that call returns a WP_Error, writes the reason ONLY to the Dokan log and drops the attribute — producing a checkout that renders a complete card form no hosted field will ever mount into, which is indistinguishable from a gating bug for the customer looking at it. Check wc-logs for "dokan paypal marketplace generated access token error". Probe: ${describeProbe(probe)}`,
    ).not.toBe('');
}

function assertCardSurfaceAbsent(probe: CardProbe, closedGate: string, consequence: string): void {
    expect(
        probe.gatewayOffered,
        `the PayPal Marketplace radio must STILL be offered at classic checkout with only ${closedGate} — if the gateway itself disappeared, the missing card fields say nothing about the UCC gate and this case would pass for the wrong reason. Probe: ${describeProbe(probe)}`,
    ).toBe(true);

    expect(
        cardFormMarkers(probe),
        `${consequence} Every marker from templates/3DS-payment-option.php must be gone with ${closedGate}; a rendered card form here means a customer is shown card inputs no hosted field will mount into, while PayPal::process_payment() still takes them down the branded redirect. Probe: ${describeProbe(probe)}`,
    ).toBe(0);

    expect(
        probe.unbranded + probe.unbrandedButton,
        `the unbranded Pay button must be gone with ${closedGate} — it stays permanently disabled without hosted fields to validate, so leaving it on the page strands the customer with a dead submit control after #place_order has been hidden. Probe: ${describeProbe(probe)}`,
    ).toBe(0);

    expect(
        probe.clientToken,
        `no data-client-token may be minted with ${closedGate}: Processor::get_generated_client_token() is a live POST to PayPal's v1/identity/generate-token, and issuing one for a checkout that renders no card form spends a PayPal round trip on every page load for nothing. Probe: ${describeProbe(probe)}`,
    ).toBeNull();

    expect(
        probe.sdkSrc ?? '',
        `the PayPal SDK must not be asked for the hosted-fields component with ${closedGate} — it loads unbranded-card machinery this cart is not allowed to use. SDK src: ${probe.sdkSrc ?? '(no SDK tag on the page)'}`,
    ).not.toContain('components=hosted-fields');
}

/* ------------------------------------------------------------------ */
/* The card path itself                                                */
/* ------------------------------------------------------------------ */

/**
 * Select PayPal and reveal the unbranded Pay button.
 *
 * The label is clicked UNCONDITIONALLY, even when the radio is already checked, and that is
 * load-bearing rather than sloppy: `#paypal-button-container` ships with an inline `display:none`
 * and is revealed only by `toggle_buttons()`, which runs from the module's own
 * `input[name="payment_method"]` click handler (`paypal-checkout.js:306-325`). When PayPal is the
 * only gateway WooCommerce pre-checks it and hides the radio input, so a "skip the click if already
 * checked" shortcut leaves the Pay button permanently invisible and the whole card path unreachable.
 */
async function selectPayPalAndRevealCard(page: Page): Promise<void> {
    await expect(
        page.locator(CLASSIC.radio),
        `the classic checkout must offer ${PAYPAL_IDS.gateway} before a card can be typed into it. Its absence means Helper::validate_cart_items() rejected a vendor in the cart, i.e. a suite vendor is no longer seeded as able to receive PayPal payments`,
    ).toBeAttached({ timeout: 60_000 });

    await waitForCheckoutSettled(page);
    await page.locator(CLASSIC.label).first().click();
    await waitForCheckoutSettled(page);

    await expect(
        page.locator(CLASSIC.radio),
        `${PAYPAL_IDS.gateway} must end up SELECTED: the module's createOrder callback checks is_paypal_selected() (paypal-checkout.js:282) and returns false for anything else, so an unchecked radio means the Pay button silently creates no order at all`,
    ).toBeChecked({ timeout: 30_000 });

    await expect(
        page.locator(UCC.unbrandedButton),
        `#pay_unbranded_order must become VISIBLE after PayPal is selected. CartHandler::display_paypal_button() renders it inside #paypal-button-container, which carries an inline display:none that only toggle_buttons() removes — an invisible button means the module never reacted to the payment-method selection and a shopper who filled in a card could not submit it`,
    ).toBeVisible({ timeout: 30_000 });
}

/**
 * Wait for the three cross-origin hosted-field iframes to mount, and decide honestly what a failure
 * to mount means.
 *
 * `init_hosted_fields()` (`paypal-checkout.js:275-441`) runs only when BOTH
 * `dokan_paypal.is_ucc_enabled` is truthy AND `paypal.HostedFields.isEligible()` returns true. The
 * first is server state this file controls and asserts; the second is PayPal's own decision about
 * the platform client id plus the merchant id(s) on the SDK url, and it is not seedable from here.
 * So: an ineligible SDK is a DECLARED SKIP, while an eligible SDK that still mounts nothing is a
 * failure — the two are separated instead of collapsing into one timeout.
 */
async function mountHostedFields(page: Page): Promise<void> {
    const numberFrame = page.locator(`${UCC.cardNumber} iframe`);

    try {
        await numberFrame.waitFor({ state: 'attached', timeout: 60_000 });
    } catch (error) {
        const diagnostic = await page.evaluate(() => {
            const w = window as unknown as {
                paypal?: { HostedFields?: { isEligible?: () => boolean } };
                dokan_paypal?: Record<string, unknown>;
            };
            let eligible: boolean | null = null;
            let eligibilityError: string | null = null;
            try {
                eligible = w.paypal?.HostedFields?.isEligible ? Boolean(w.paypal.HostedFields.isEligible()) : null;
            } catch (evaluationError) {
                eligible = null;
                // Carried, never dropped: a THROW out of isEligible() is a broken SDK, while a plain
                // `false` is PayPal declining the merchant. Both land on the same declared skip below,
                // so this string is the only thing that tells the next reader which one happened.
                eligibilityError = String(evaluationError);
            }
            return {
                sdkLoaded: Boolean(w.paypal),
                hostedFieldsComponent: Boolean(w.paypal?.HostedFields),
                isEligible: eligible,
                eligibilityError,
                localizedUccEnabled: w.dokan_paypal ? String(w.dokan_paypal['is_ucc_enabled'] ?? '') : null,
            };
        });

        test.skip(
            !diagnostic.sdkLoaded,
            `the PayPal JS SDK never became available on window.paypal, so no hosted field could mount and nothing about the card path is observable. The script tag is on the page (asserted above), which makes this a network/environment block reaching https://www.paypal.com/sdk/js rather than a gateway defect. Unblocked by outbound access to paypal.com from the browser this run drives. Underlying wait failure: ${String(error).slice(0, 300)}`,
        );

        expect(
            diagnostic.hostedFieldsComponent,
            `the loaded PayPal SDK must expose window.paypal.HostedFields. The SDK url was asserted to carry "components=hosted-fields" (CartManager::get_paypal_sdk_url()), so a missing component here means PayPal served a bundle that does not match the requested components and the card form on this page can never work. Diagnostic: ${JSON.stringify(diagnostic) ?? '(unavailable)'}. Underlying wait failure: ${String(error).slice(0, 300)}`,
        ).toBe(true);

        test.skip(diagnostic.isEligible !== true, eligibilitySkipReason({ ...diagnostic, waitFailure: String(error).slice(0, 300) }));

        // Eligible, and still nothing mounted: that is the product's own render call failing.
        throw new Error(
            `paypal.HostedFields.isEligible() returned true but no iframe was ever injected into ${UCC.cardNumber} within 60s, so HostedFields.render() (paypal-checkout.js:280-320) never resolved. A customer on this checkout sees three empty boxes they cannot type into and no way to pay by card. Diagnostic: ${JSON.stringify(diagnostic) ?? '(unavailable)'}. Underlying wait failure: ${String(error)}`,
        );
    }

    for (const [name, field] of Object.entries(HOSTED_FIELD)) {
        await expect(
            page.locator(`${field.container} iframe`),
            `the ${name} hosted field must mount its own iframe inside ${field.container}. braintree-web injects exactly one per container (src/hosted-fields/external/hosted-fields.js:566); a missing one means that field cannot be typed into, so the card can never be completed and #pay_unbranded_order will never enable`,
        ).toBeAttached({ timeout: 30_000 });
    }
}

/** The typed-into input inside one hosted-field iframe, qualified so the hidden autofill decoy cannot be hit. */
function hostedFieldInput(page: Page, field: { container: string; input: string }) {
    return page.frameLocator(`${field.container} iframe`).locator(field.input);
}

/**
 * Type the card.
 *
 * `pressSequentially()` rather than `fill()`: braintree formats the value as you type from keypress
 * listeners, and a programmatic value set can leave the field reporting invalid — which would jam
 * #pay_unbranded_order disabled and look exactly like a product defect.
 */
async function typeCard(page: Page, values: { number: string; expiry: string; cvv: string; holder: string }): Promise<void> {
    const number = hostedFieldInput(page, HOSTED_FIELD.number);
    await number.click();
    await number.pressSequentially(values.number, { delay: 30 });

    const expiry = hostedFieldInput(page, HOSTED_FIELD.expiry);
    await expiry.click();
    await expiry.pressSequentially(values.expiry, { delay: 30 });

    const cvv = hostedFieldInput(page, HOSTED_FIELD.cvv);
    await cvv.click();
    await cvv.pressSequentially(values.cvv, { delay: 30 });

    // NOT an iframe: #dpm_name_on_card is a real WooCommerce-styled input in the checkout document.
    await page.locator(UCC.nameOnCard).fill(values.holder);
}

interface CardPaymentResult {
    parentOrderId: string;
    paypalOrderId: string;
    /** Every main-frame url the browser visited during the payment — the proof no PayPal login happened. */
    visited: string[];
}

/**
 * Click Pay and follow the card path to a capture.
 *
 * Both round trips are read, neither is inferred:
 *
 *   1. `?wc-ajax=checkout` — the hosted-fields `createOrder` callback calls `do_submit()` →
 *      `set_order()`, i.e. WooCommerce's own checkout, which creates the WC order, the Dokan sub
 *      orders and the PayPal order. Byte-for-byte the same request the wallet path makes.
 *   2. `admin-ajax.php?action=dokan_paypal_capture_payment` — `OrderController::capture_payment()`
 *      (`Order/OrderController.php:223-267`), which runs the shared
 *      `handle_capture_payment_validation()` and `$order->payment_complete()`. Its JSON is read and
 *      asserted rather than swallowed: on failure the module answers `wp_send_json_error` with the
 *      PayPal message, and that message is the only explanation of why the money did not move.
 */
async function payWithCard(page: Page): Promise<CardPaymentResult> {
    const visited: string[] = [];
    page.on('framenavigated', frame => {
        if (frame === page.mainFrame()) {
            visited.push(frame.url());
        }
    });

    await mountHostedFields(page);
    await typeCard(page, CARD);

    const payButton = page.locator(UCC.unbrandedButton);
    await expect(
        payButton,
        `#pay_unbranded_order must be ENABLED once every hosted field reports valid. paypal-checkout.js:322-358 disables it on each invalid validityChange and only clears that on a fully valid form, so a button still disabled here means the card this run supplied (PAYPAL_UCC_TEST_CARD, expiry ${CARD.expiry}, ${CARD.cvv.length}-digit CVV) was rejected by braintree's own validation before PayPal ever saw it`,
    ).toBeEnabled({ timeout: 30_000 });

    const checkoutPromise = settled(page.waitForResponse(response => CHECKOUT_AJAX.test(response.url()), { timeout: 180_000 }));
    const capturePromise = settled(
        page.waitForResponse(
            response => response.url().includes('admin-ajax.php') && (response.request().postData() ?? '').includes('dokan_paypal_capture_payment'),
            { timeout: 300_000 },
        ),
    );

    await payButton.click();

    const checkout = await checkoutPromise;
    if (!checkout.ok) {
        throw new Error(
            `clicking #pay_unbranded_order never produced a WooCommerce checkout POST, so no order was created and no card was ever charged. The hosted-fields createOrder callback (paypal-checkout.js:281-291) calls do_submit() → set_order(); silence here means it was not reached — the commonest causes are an unchecked PayPal radio (is_paypal_selected() returns false) and a form that failed client-side validation. Page url: ${page.url()}. Checkout notices: ${await readNotices(page)}. Underlying failure: ${String(checkout.error)}`,
        );
    }

    const checkoutBody = await (checkout.value as Response).text();
    let parsed: { result?: string; id?: string | number; paypal_order_id?: string; messages?: string } = {};
    try {
        parsed = JSON.parse(checkoutBody) as typeof parsed;
    } catch {
        throw new Error(
            `the wc-ajax=checkout response was not JSON (HTTP ${(checkout.value as Response).status()}), so it is unknown whether an order was created. WooCommerce answers this endpoint with JSON on both success and failure, so a non-JSON body is usually a PHP fatal rendered into the response. Body: ${checkoutBody.slice(0, 600)}`,
        );
    }

    expect(
        parsed.result,
        `WooCommerce must answer the card path's checkout POST with result=success — this is the request that creates the WC order, splits it and creates the PayPal order, and without it there is nothing for the card to pay. WooCommerce reports the reason in "messages", and PayPal::process_payment() puts its own create-order error there too (PaymentMethods/PayPal.php:322-330): ${String(parsed.messages ?? '(none)').slice(0, 600)}`,
    ).toBe('success');

    const parentOrderId = String(parsed.id ?? '');
    const paypalOrderId = String(parsed.paypal_order_id ?? '');
    expect(parentOrderId, `the checkout response must carry the WooCommerce order id it created. Response: ${checkoutBody.slice(0, 400)}`).not.toBe('');
    expect(
        paypalOrderId,
        `the checkout response must carry paypal_order_id (PaymentMethods/PayPal.php:347) — the hosted-fields createOrder callback returns exactly this value to the SDK, so without it the card is tokenised against no order at all. Response: ${checkoutBody.slice(0, 400)}`,
    ).not.toBe('');

    const capture = await capturePromise;
    if (!capture.ok) {
        // A 3DS challenge is the one environmental block this path has, and it must be named rather
        // than left to look like a hung capture.
        const challenged = (await page.locator(UCC.contingencyFrame).count()) > 0;
        test.skip(
            challenged,
            `${FORCED_3DS_SKIP} WooCommerce order ${parentOrderId} and PayPal order ${paypalOrderId} were created before the challenge appeared and are left unpaid; the afterAll cleanup removes them.`,
        );

        throw new Error(
            `the card was submitted but admin-ajax.php?action=dokan_paypal_capture_payment never fired, so PayPal order ${paypalOrderId} was authorised-or-not with no capture attempted and WooCommerce order ${parentOrderId} is stranded unpaid. hf.submit() must have rejected: paypal-checkout.js:415-424 turns that rejection into a checkout notice instead of a capture. Page url: ${page.url()}. Checkout notices: ${await readNotices(page)}. Underlying failure: ${String(capture.error)}`,
        );
    }

    const captureBody = await (capture.value as Response).text();
    let captureJson: { success?: boolean; data?: unknown } = {};
    try {
        captureJson = JSON.parse(captureBody) as typeof captureJson;
    } catch {
        throw new Error(
            `the dokan_paypal_capture_payment response was not JSON (HTTP ${(capture.value as Response).status()}), so it is unknown whether the money moved for order ${parentOrderId}. Body: ${captureBody.slice(0, 600)}`,
        );
    }

    expect(
        captureJson.success,
        `OrderController::capture_payment() must answer wp_send_json_success for order ${parentOrderId}. A wp_send_json_error here carries PayPal's own reason and is the ONLY explanation of why the customer was not charged — it is quoted rather than swallowed: ${JSON.stringify(captureJson.data ?? null).slice(0, 600)}`,
    ).toBe(true);

    // capture_payment() sets window.location.href to success_redirect on success
    // (paypal-checkout.js:186-188), so landing on the thank-you page is the product's own behaviour.
    await page.waitForURL(/order-received/i, { timeout: 120_000 });

    return { parentOrderId, paypalOrderId, visited: [...visited, page.url()] };
}

/* ------------------------------------------------------------------ */
/* Suite                                                               */
/* ------------------------------------------------------------------ */

test.describe('PayPal Marketplace — unbranded Advanced Card (UCC)', () => {
    // Each card case loads the classic checkout, waits for the PayPal SDK, mounts three cross-origin
    // iframes, types a card and waits on two live PayPal round trips.
    test.describe.configure({ timeout: 420_000 });

    let vendor1ProductId = '';
    let vendor2ProductId = '';

    /** Every order this file created, parent and sub, so nothing is left on the shared site. */
    const createdOrderIds: string[] = [];
    const allTouchedOrderIds = new Set<string>();

    test.beforeAll(async () => {
        // No test.skip() here on purpose: inside a beforeAll it silently voids the entire describe and
        // all seven cases would vanish from the run with no reason printed for any of them.
        if (!hasCredentials) {
            return;
        }

        await ensurePayPalConfigured();
        await ensureCustomerAddress();
        await ensureClassicCheckoutPage();
        await ensureVendorStoreAddress(VENDOR_ID);
        await ensureVendorStoreAddress(VENDOR2_ID);
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
        await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: VENDOR2_EMAIL });

        // The baseline is captured from the harness, never declared as a literal. An EMPTY patch
        // writes nothing and still reports `previous`, and a null in it means the key was ABSENT —
        // which is a different site state from an empty string and is restored as an absence.
        gateBaseline = (await setUccGate({}, UCC_VENDORS)).previous;

        const state = await getUccState(UCC_VENDORS);
        vendorUccBaseline = state.module_active
            ? Object.fromEntries(UCC_VENDORS.map(id => [String(id), state.vendors[String(id)]?.raw ?? '']))
            : Object.fromEntries(UCC_VENDORS.map(id => [String(id), '']));

        const api = new ApiUtils(await request.newContext());
        const [, product1] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal UCC Vendor1 Product' }, payloads.vendorAuth);
        const [, product2] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal UCC Vendor2 Product' }, payloads.vendor2Auth);
        vendor1ProductId = product1;
        vendor2ProductId = product2;
        await api.dispose();
    });

    // After EVERY case, not only at the end: a case that dies mid-mutation would otherwise leave
    // ucc_mode on and the vendors UCC-flagged for every later PayPal spec on this worker, which would
    // hand them a card form none of them expect and fail PP-SET-19 in a different file.
    test.afterEach(async () => {
        await restoreUccBaseline();
    });

    test.afterAll(async () => {
        await restoreUccBaseline();

        if (!hasCredentials) {
            return;
        }

        const ctx = await adminContext();
        try {
            for (const orderId of createdOrderIds) {
                await ctx.delete(`${SERVER_URL}/wc/v3/orders/${orderId}?force=true`).catch(() => undefined);
            }
            for (const productId of [vendor1ProductId, vendor2ProductId]) {
                if (productId) {
                    await ctx.delete(`${SERVER_URL}/wc/v3/products/${productId}?force=true`).catch(() => undefined);
                }
            }
        } finally {
            await ctx.dispose();
        }

        // Dokan's own tables survive the WooCommerce order deletion, and a captured card order writes
        // a vendor balance row. Left behind they corrupt every later balance assertion on this site.
        if (allTouchedOrderIds.size > 0) {
            const ids = [...allTouchedOrderIds];
            const placeholders = ids.map(() => '?').join(', ');
            await dbUtils.dbQuery(`DELETE FROM \`${DB_PREFIX}_dokan_vendor_balance\` WHERE trn_id IN (${placeholders});`, ids).catch(() => undefined);
            await dbUtils.dbQuery(`DELETE FROM \`${DB_PREFIX}_dokan_orders\` WHERE order_id IN (${placeholders});`, ids).catch(() => undefined);
        }

        await dbUtils.clearCustomerCart(CUSTOMER_ID).catch(() => undefined);
    });

    /* -------------------------------------------------------------- */
    /* Shared captured-order fixture                                   */
    /* -------------------------------------------------------------- */

    interface CapturedCardOrder extends CardPaymentResult {
        parent: WcOrder;
        subOrders: WcOrder[];
        dokanRows: DokanOrderRow[];
    }

    let sharedCardOrder: CapturedCardOrder | null = null;
    /**
     * Stored and re-thrown VERBATIM, never wrapped: a `test.skip()` raised inside the build (an
     * ineligible SDK, a 3DS challenge) carries Playwright's own skip marker, and re-throwing it as a
     * new Error would convert three declared skips into three red failures that name the wrong cause.
     */
    let sharedCardError: unknown = null;

    /**
     * ONE multi-vendor card capture, shared by PP-UCC-03/-04/-05.
     *
     * Built once because each build charges a real sandbox card and leaves a real order; three
     * identical captures would buy no extra coverage. Built lazily inside the first case that needs
     * it, not in beforeAll, so a build failure surfaces as a named test failure with its full message
     * instead of a hook error that takes the whole describe with it.
     */
    async function getCapturedCardOrder(browser: Browser): Promise<CapturedCardOrder> {
        if (sharedCardOrder) {
            return sharedCardOrder;
        }
        if (sharedCardError) {
            throw sharedCardError;
        }
        try {
            const payment = await withCustomerCheckout(browser, [{ productId: vendor1ProductId }, { productId: vendor2ProductId }], async page => {
                await selectPayPalAndRevealCard(page);
                const probe = await readProbe(page);
                assertServerRenderedCardForm(probe);
                return payWithCard(page);
            });

            createdOrderIds.push(payment.parentOrderId);
            allTouchedOrderIds.add(payment.parentOrderId);

            const childIds = (await dbUtils.getChildOrderIds(payment.parentOrderId)).map(String);
            for (const childId of childIds) {
                allTouchedOrderIds.add(childId);
            }

            // With one vendor Lite creates no sub orders and PayPal::process_payment() falls back to
            // `$sub_orders = [ $order ]` (PaymentMethods/PayPal.php:267-269) — the parent IS the
            // payable order. This cart has two vendors, so children are expected, but the reader
            // follows the product's own rule rather than assuming.
            const payableIds = childIds.length > 0 ? childIds : [payment.parentOrderId];

            const [parent, subOrders, dokanRows] = await Promise.all([
                getWcOrder(payment.parentOrderId),
                Promise.all(payableIds.map(id => getWcOrder(id))),
                getDokanOrderRows(payableIds),
            ]);

            sharedCardOrder = { ...payment, parent, subOrders, dokanRows };
            return sharedCardOrder;
        } catch (error) {
            sharedCardError = error;
            throw error;
        }
    }

    /** The gate every capture case shares, on top of the UCC gates: a real card and payable merchants. */
    async function gateOnCardFixture(): Promise<void> {
        test.skip(!HAS_TEST_CARD, CARD_SKIP);
        await gateOnPayableMerchants();
    }

    /* ================================================================== */
    /* PP-UCC-01 — the gate the product resolves, then the form it produces */
    /* ================================================================== */

    test('PP-UCC-01: the card form is offered and its hosted fields mount when Helper::is_ucc_enabled() resolves true', { tag: ['@pro', '@customer'] }, async ({
        browser,
    }) => {
        await openGatesAndRequireUcc([VENDOR_ID]);

        await withCustomerCheckout(browser, [{ productId: vendor1ProductId }], async page => {
            await selectPayPalAndRevealCard(page);

            const probe = await readProbe(page);
            assertServerRenderedCardForm(probe);

            expect(
                probe.contingencyLightbox,
                `#payments-sdk__contingency-lightbox must render: it is the container PayPal draws a 3D Secure challenge into and it exists nowhere else in the module. The card path forces contingencies:['3D_SECURE'] (paypal-checkout.js:409-414), so without this element a challenge has nowhere to appear and the payment would stall with no visible cause. Probe: ${describeProbe(probe)}`,
            ).toBe(1);

            // The browser half — the part no other spec in this suite has ever asserted. A skip here
            // is PayPal-side vetting, not a defect; the distinction is made inside mountHostedFields().
            await mountHostedFields(page);

            for (const [name, field] of Object.entries(HOSTED_FIELD)) {
                await expect(
                    hostedFieldInput(page, field),
                    `the ${name} hosted field must expose exactly one typeable input inside its iframe. braintree also injects a hidden autofill decoy in the same document (internal/index.js:96-133), so a strict-mode violation here means the selector now matches the decoy as well and any card typed through it would go into a field PayPal never reads`,
                ).toBeVisible({ timeout: 30_000 });
            }

            log.success(
                `PP-UCC-01: Helper::is_ucc_enabled() resolved true, templates/3DS-payment-option.php rendered, the SDK carried a client token and all three braintree hosted fields mounted — the card path is live on this store.`,
            );
        });
    });

    /* ================================================================== */
    /* PP-UCC-02 — gate 5 is all-or-nothing across the cart                */
    /* ================================================================== */

    test('PP-UCC-02: the card form is withdrawn when one seller in the cart lacks the UCC meta', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await openGatesAndRequireUcc(UCC_VENDORS);

        // ---- Positive control: both sellers flagged, the card surface really is there. ----
        const both = await withCustomerCheckout(browser, [{ productId: vendor1ProductId }, { productId: vendor2ProductId }], async page => {
            await selectPayPalAndRevealCard(page);
            return readProbe(page);
        });
        assertServerRenderedCardForm(both);

        try {
            // ---- Negative: close gate 5 for VENDOR 2 ONLY, and change nothing else. ----
            await setVendorUcc(VENDOR2_ID, false);

            const state = resolvedOrSkip(await getUccState(UCC_VENDORS));

            expect(
                state.vendors[String(VENDOR2_ID)]?.enabled,
                `precondition: vendor ${VENDOR2_ID}'s "${state.ucc_meta_key ?? '(unresolved meta key)'}" meta must now read false, or the negative is measuring the same state as the positive control. Vendor state: ${JSON.stringify(state.vendors ?? null)}`,
            ).toBe(false);

            expect(
                state.vendors[String(VENDOR_ID)]?.enabled,
                `only vendor ${VENDOR2_ID}'s meta may differ between the two probes: vendor ${VENDOR_ID} must still be flagged, otherwise the disappearance below is explained by both sellers rather than by the all-or-nothing rule under test. Vendor state: ${JSON.stringify(state.vendors ?? null)}`,
            ).toBe(true);

            // The decisive discriminator. Helper::is_ucc_enabled() knows nothing about sellers, so it
            // must STILL be true — which is what attributes the vanished card form to
            // CartManager::is_ucc_enabled_for_all_seller_in_cart() and to nothing else.
            expect(
                state.is_ucc_enabled,
                `Helper::is_ucc_enabled() (Helper.php:178-190) must remain TRUE with a seller's meta cleared — it evaluates the button type, ucc_mode, base country and currency only, and never looks at the cart. If it flipped to false, the store-level gate closed too and this case could not say the per-seller check did anything. Full state: ${JSON.stringify(state) ?? '(unprintable)'}`,
            ).toBe(true);

            const probe = await withCustomerCheckout(browser, [{ productId: vendor1ProductId }, { productId: vendor2ProductId }], async page => {
                // selectPayPalAndRevealCard() cannot be used for the negative: it asserts
                // #pay_unbranded_order becomes VISIBLE, and that button is exactly what must be gone
                // here. The gateway is still selected the way a shopper would, and its continued
                // presence is asserted with its own message by assertCardSurfaceAbsent() below.
                await expect(
                    page.locator(CLASSIC.radio),
                    `the PayPal Marketplace radio must still be offered at classic checkout with only vendor ${VENDOR2_ID}'s UCC meta cleared — gate 5 governs the card form, not gateway availability, so a vanished gateway would mean this case is measuring PayPal::is_available() instead`,
                ).toBeAttached({ timeout: 60_000 });
                await waitForCheckoutSettled(page);
                await page.locator(CLASSIC.label).first().click();
                await waitForCheckoutSettled(page);
                return readProbe(page);
            });

            assertCardSurfaceAbsent(
                probe,
                `vendor ${VENDOR2_ID}'s UCC meta cleared while vendor ${VENDOR_ID} kept its own`,
                'PayPal settles an unbranded card payment to every payee in the order, so one seller without Advanced Card processing makes the WHOLE cart uncollectable by card — offering the form anyway takes card details that can never be charged.',
            );

            expect(
                probe.localizedUccEnabled,
                `dokan_paypal.is_ucc_enabled must be falsy when any seller in the cart lacks the meta: CartHandler::payment_scripts() localises it from CartManager::is_ucc_enabled_for_all_seller_in_cart() (Cart/CartHandler.php:120), and paypal-checkout.js:275-279 would otherwise try to mount hosted fields the server rendered no containers for. wp_localize_script() casts PHP false to the empty string. Probe: ${describeProbe(probe)}`,
            ).toBe('');

            log.success(
                `PP-UCC-02: with both sellers flagged the card surface rendered; clearing vendor ${VENDOR2_ID}'s meta alone removed it entirely while Helper::is_ucc_enabled() stayed true — the closure is CartManager::is_ucc_enabled_for_all_seller_in_cart() and nothing else.`,
            );
        } finally {
            // Restored here as well as in afterEach: an assertion failure above must not leave vendor 2
            // half-configured for the capture cases that follow in this same file.
            await setVendorUcc(VENDOR2_ID, true);
        }
    });

    /* ================================================================== */
    /* PP-UCC-03 — a card payment captures, with no PayPal login          */
    /* ================================================================== */

    test('PP-UCC-03: a card payment captures without any PayPal-hosted page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await openGatesAndRequireUcc(UCC_VENDORS);
        await gateOnCardFixture();

        const order = await getCapturedCardOrder(browser);

        const paypalPages = order.visited.filter(url => {
            try {
                return new URL(url).hostname.endsWith('paypal.com');
            } catch {
                return false;
            }
        });

        expect(
            paypalPages,
            `the whole point of the card path is that the buyer never leaves the store: the hosted fields are served INTO our checkout and hf.submit() tokenises the card over XHR, so no main-frame navigation to paypal.com may happen. A PayPal-hosted page here means this run drove a buyer LOGIN after all — the exact cost that locked the sandbox buyer out on 2026-08-03 — and the case is no longer an unattended path. Urls visited: ${JSON.stringify(order.visited) ?? '(unprintable)'}`,
        ).toEqual([]);

        expect(
            ['processing', 'completed'],
            `the parent order ${order.parentOrderId} must reach a PAID status after the capture: OrderController::capture_payment() calls $order->payment_complete() (Order/OrderController.php:223-267), and an order left on pending/failed means the customer was charged with nothing recorded against it. Order: ${describeOrderMeta(order.parent)}`,
        ).toContain(order.parent.status);

        expect(
            metaString(order.parent, '_dokan_paypal_order_id'),
            `the parent order must carry _dokan_paypal_order_id — PayPal::process_payment() writes it at checkout and it is the ONLY handle back to PayPal's own copy of the order, so a refund or a webhook can never be reconciled without it. Expected the id the checkout response returned (${order.paypalOrderId}). Order: ${describeOrderMeta(order.parent)}`,
        ).toBe(order.paypalOrderId);

        expect(
            metaString(order.parent, '_paypal_payment_success'),
            `_paypal_payment_success must read "yes" on the parent. OrderController::handle_capture_payment_validation() writes it ONLY when PayPal answers intent=CAPTURE and status=COMPLETED, which makes it the single most decisive "the money actually moved" fact in the module — and it is written by code shared with the wallet path, so a card capture must produce it identically. Order: ${describeOrderMeta(order.parent)}`,
        ).toBe('yes');

        expect(
            metaString(order.parent, '_dokan_paypal_payment_charge_captured'),
            `_dokan_paypal_payment_charge_captured must read "yes" on the parent (OrderManager.php:481). It is the idempotency latch that stops the PAYMENT.CAPTURE.COMPLETED webhook re-processing the same money; without it a later webhook re-runs the split and credits the vendors twice. Order: ${describeOrderMeta(order.parent)}`,
        ).toBe('yes');

        expect(
            metaString(order.parent, '_dokan_paypal_capture_payment_debug_id'),
            `_dokan_paypal_capture_payment_debug_id must be non-empty (Order/OrderController.php:309): it is PayPal's own debug id for the capture call, and it is the only evidence that a capture request was really made rather than the order being marked paid locally. Order: ${describeOrderMeta(order.parent)}`,
        ).not.toBe('');

        log.success(
            `PP-UCC-03: WooCommerce order ${order.parentOrderId} was paid by CARD through PayPal order ${order.paypalOrderId} with no PayPal-hosted page visited — an unattended capture, which the wallet path cannot produce.`,
        );
    });

    /* ================================================================== */
    /* PP-UCC-04 — the split facts a wallet capture would have written     */
    /* ================================================================== */

    test('PP-UCC-04: a captured card order carries the same commission and fee facts as a wallet capture', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await openGatesAndRequireUcc(UCC_VENDORS);
        await gateOnCardFixture();

        const order = await getCapturedCardOrder(browser);
        const status = await getPayPalStatus();

        expect(
            order.subOrders.length,
            `the two-vendor card order ${order.parentOrderId} must have been split into one sub order per vendor before any of the money facts below can be attributed. Sub orders found: ${JSON.stringify(order.subOrders.map(sub => sub.id) ?? null)}`,
        ).toBe(2);

        for (const sub of order.subOrders) {
            const row = order.dokanRows.find(entry => entry.order_id === Number(sub.id));
            expect(
                row,
                `sub order ${sub.id} must have a wp_dokan_orders row — dokan_sync_insert_order() writes it during the split, and without it there is no recorded earning to compare the platform fee against. Rows found: ${JSON.stringify(order.dokanRows ?? null)}`,
            ).toBeDefined();
            if (!row) {
                continue;
            }

            const platformFeeRaw = metaString(sub, '_dokan_paypal_payment_platform_fee');
            const platformFee = Number(platformFeeRaw);
            const expectedCommission = row.order_total - row.net_amount;

            // PRESENCE is asserted separately and FIRST. `Number('')` is 0, so on any store whose admin
            // commission for this sub order happens to be 0 the comparison below would be satisfied by a
            // meta row that was never written at all — a missing platform fee reported as a match.
            expect(
                platformFeeRaw,
                `sub order ${sub.id} (vendor ${row.seller_id}) must carry a _dokan_paypal_payment_platform_fee row at all. OrderManager::store_capture_payment_data() writes it from seller_receivable.platform_fees[0].amount.value (OrderManager.php:552); an absent row means PayPal reported no platform fee for this payee, i.e. the marketplace's commission was never withheld from the vendor's settlement and the admin is owed money nothing will ever collect. Sub order: ${describeOrderMeta(sub)}`,
            ).not.toBe('');

            expect(
                near(platformFee, expectedCommission),
                `the platform fee PayPal actually withheld on sub order ${sub.id} (vendor ${row.seller_id}) must equal the admin commission Dokan recorded for it. OrderManager::store_capture_payment_data() writes _dokan_paypal_payment_platform_fee from seller_receivable.platform_fees[0].amount.value (OrderManager.php:552), i.e. from PayPal's SETTLEMENT rather than from the request — PP-SPL-04 checks what was asked for, this checks what was taken. Dokan's own row says order_total ${row.order_total.toFixed(2)} - net_amount ${row.net_amount.toFixed(2)} = ${expectedCommission.toFixed(2)}, the meta says ${metaString(sub, '_dokan_paypal_payment_platform_fee') || '(absent)'}. Too high and the vendor is underpaid on every card sale, too low and the marketplace never collects its commission. Sub order: ${describeOrderMeta(sub)}`,
            ).toBe(true);

            // Same trap, and here it was fatal on its own: `Number('')` is 0, which is finite and >= 0,
            // so an ABSENT processing fee satisfied the numeric check outright. Deleting the write at
            // OrderManager.php:550 would have left this case green. Presence is now its own assertion.
            const processingFeeRaw = metaString(sub, '_dokan_paypal_payment_processing_fee');
            expect(
                processingFeeRaw,
                `sub order ${sub.id} must carry a _dokan_paypal_payment_processing_fee row (OrderManager.php:550) — PayPal's own fee for this payee's share of the transaction. It is what dokan_process_payment_gateway_fee charges to the vendor, so an absent row means the vendor's payout is computed against a fee nobody recorded and the marketplace cannot reconcile what PayPal kept. Sub order: ${describeOrderMeta(sub)}`,
            ).not.toBe('');

            const processingFee = Number(processingFeeRaw);
            expect(
                Number.isFinite(processingFee) && processingFee >= 0,
                `sub order ${sub.id} must carry a numeric _dokan_paypal_payment_processing_fee (OrderManager.php:550) — it is PayPal's own fee for the transaction and it is what dokan_process_payment_gateway_fee charges to the vendor. A missing or non-numeric value means the vendor's payout is computed against an unknown fee. Stored value: "${processingFeeRaw}". Sub order: ${describeOrderMeta(sub)}`,
            ).toBe(true);

            expect(
                metaString(sub, '_dokan_paypal_payment_processing_currency'),
                `sub order ${sub.id} must record the currency of that processing fee (OrderManager.php:551). A fee stored without its currency is silently treated as store currency by every later report, which is exactly the class of defect PP-CUR owns. Order currency is ${sub.currency}. Sub order: ${describeOrderMeta(sub)}`,
            ).not.toBe('');

            expect(
                metaString(sub, 'dokan_gateway_fee_paid_by'),
                `sub order ${sub.id} must record dokan_gateway_fee_paid_by="seller" (OrderManager.php:553) — it is what makes Dokan deduct the PayPal fee from the vendor rather than the admin, and a wrong value here moves the fee onto the marketplace on every card sale. Sub order: ${describeOrderMeta(sub)}`,
            ).toBe('seller');

            expect(
                metaString(sub, '_dokan_paypal_payment_disbursement_mode'),
                `sub order ${sub.id} must carry the disbursement mode the gateway is configured with. PayPal::process_payment() stamps it per sub order at ORDER CREATION (PaymentMethods/PayPal.php:273) — before the buyer touches the card — and OrderController::order_status_changed() and DelayDisburseFund.php:105 read it later to decide when the vendor is actually paid. The gateway currently reports "${String(status.disbursement_mode)}". Sub order: ${describeOrderMeta(sub)}`,
            ).toBe(String(status.disbursement_mode));
        }

        expect(
            metaString(order.parent, '_dokan_paypal_payment_withdraw_data'),
            `the parent order must carry _dokan_paypal_payment_withdraw_data (OrderManager.php:765) — handle_vendor_balance() builds it from seller_receivable.net_amount and it is what later credits the vendor balance. Empty means the capture produced no vendor payout record at all, so the vendors shipped goods against money the marketplace never queued for them. Order: ${describeOrderMeta(order.parent)}`,
        ).not.toBe('');

        log.success(`PP-UCC-04: card-captured order ${order.parentOrderId} carries the same platform fee, processing fee, fee payer and disbursement mode a wallet capture writes.`);
    });

    /* ================================================================== */
    /* PP-UCC-05 — capture id on EVERY sub order, plus the parent copy     */
    /* ================================================================== */

    test('PP-UCC-05: a multi-vendor card capture writes a capture id to every sub order', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await openGatesAndRequireUcc(UCC_VENDORS);
        await gateOnCardFixture();

        const order = await getCapturedCardOrder(browser);

        const captureIds = order.subOrders.map(sub => ({ subOrder: sub.id, captureId: metaString(sub, '_dokan_paypal_payment_capture_id') }));

        for (const entry of captureIds) {
            expect(
                entry.captureId,
                `sub order ${entry.subOrder} must carry its own _dokan_paypal_payment_capture_id (OrderManager.php:549). This is the DOK-018 regression surface and it is not cosmetic: an automatic refund is issued against the CAPTURE id, so a sub order without one can never be refunded through the product at all — the vendor's customer would have to be refunded by hand inside PayPal. Sub orders: ${JSON.stringify(captureIds) ?? '(unprintable)'}`,
            ).not.toBe('');
        }

        expect(
            new Set(captureIds.map(entry => entry.captureId)).size,
            `each sub order must carry its OWN capture id, not a shared one: PayPal issues one capture per purchase unit, and two sub orders holding the same id means one vendor's refund would be taken out of the other vendor's money. Sub orders: ${JSON.stringify(captureIds) ?? '(unprintable)'}`,
        ).toBe(captureIds.length);

        const byVendor = metaOf(order.parent, '_dokan_paypal_capture_data_by_vendor');
        expect(
            byVendor,
            `the parent order must carry _dokan_paypal_capture_data_by_vendor (OrderManager.php:605) — the vendor-keyed mirror of every sub order's capture data. restore_capture_payment_data() re-applies it to whatever sub orders exist later, which is the ONLY thing that keeps a block-checkout re-split from losing the capture ids entirely. Order: ${describeOrderMeta(order.parent)}`,
        ).toBeTruthy();

        // The SHAPE has to be pinned before the keys are read. `Object.keys()` on a STRING returns
        // '0','1','2',… — so if the value ever came back still serialised, the per-vendor toContain()
        // below would match character INDICES and pass for vendor ids 3 and 5 on any string six
        // characters long. That is a fake green that survives the capture data never being stored.
        expect(
            byVendor !== null && typeof byVendor === 'object',
            `_dokan_paypal_capture_data_by_vendor on parent order ${order.parentOrderId} must read back as the vendor-keyed ARRAY the module stores (OrderManager.php:605), not as a scalar. A string here means the value never unserialised, so restore_capture_payment_data() (OrderManager.php:~640-700) cannot pull a vendor out of it and a block-checkout re-split loses every capture id. Type seen: ${typeof byVendor}. Raw value: ${JSON.stringify(byVendor ?? null).slice(0, 600)}. Order: ${describeOrderMeta(order.parent)}`,
        ).toBe(true);

        const vendorKeys = Object.keys((byVendor ?? {}) as Record<string, unknown>);
        for (const vendorId of UCC_VENDORS) {
            expect(
                vendorKeys,
                `_dokan_paypal_capture_data_by_vendor must hold an entry for vendor ${vendorId}: it is keyed by seller id, and a missing key means that vendor's capture id, processing fee and platform fee were never mirrored onto the parent, so a re-split would strand them. Keys found: ${JSON.stringify(vendorKeys)}. Raw value: ${JSON.stringify(byVendor ?? null).slice(0, 600)}`,
            ).toContain(String(vendorId));
        }

        log.success(`PP-UCC-05: card-captured order ${order.parentOrderId} wrote a distinct capture id to each of its ${captureIds.length} sub orders and mirrored them onto the parent keyed by vendor.`);
    });

    /* ================================================================== */
    /* PP-UCC-06 — an incomplete card cannot start a payment              */
    /* ================================================================== */

    test('PP-UCC-06: the unbranded Pay button is gated on hosted-field validity', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await openGatesAndRequireUcc([VENDOR_ID]);
        test.skip(!HAS_TEST_CARD, CARD_SKIP);

        await withCustomerCheckout(browser, [{ productId: vendor1ProductId }], async page => {
            await selectPayPalAndRevealCard(page);
            assertServerRenderedCardForm(await readProbe(page));
            await mountHostedFields(page);

            // Nothing here may create an order. Counted rather than assumed: the checkout POST is the
            // request that creates the WC order, splits it and calls PayPal, so its absence is the
            // real "no payment was started" proof.
            let checkoutRequests = 0;
            page.on('request', request => {
                if (CHECKOUT_AJAX.test(request.url())) {
                    checkoutRequests += 1;
                }
            });

            const payButton = page.locator(UCC.unbrandedButton);

            // ---- Half one: an INCOMPLETE card disables the submit control. ----
            const partial = CARD.number.slice(0, 8);
            const number = hostedFieldInput(page, HOSTED_FIELD.number);
            await number.click();
            await number.pressSequentially(partial, { delay: 30 });
            const expiry = hostedFieldInput(page, HOSTED_FIELD.expiry);
            await expiry.click();
            await expiry.pressSequentially(CARD.expiry, { delay: 30 });
            const cvv = hostedFieldInput(page, HOSTED_FIELD.cvv);
            await cvv.click();
            await cvv.pressSequentially(CARD.cvv, { delay: 30 });
            await page.locator(UCC.nameOnCard).fill(CARD.holder);

            await expect(
                payButton,
                `#pay_unbranded_order must be DISABLED while the card number is incomplete ("${partial}…"). paypal-checkout.js:322-358 disables it on every invalid validityChange, and that is the only thing standing between a half-typed card and hf.submit() — a clickable button here sends an unvalidated card to PayPal and, because the UCC path calls capture_payment() WITHOUT the SDK's actions object, a resulting INSTRUMENT_DECLINED would hit .restart() on boolean false and strand the shopper with no error at all`,
            ).toBeDisabled({ timeout: 30_000 });

            expect(
                checkoutRequests,
                `no WooCommerce checkout POST may be made while the card is incomplete — an order created here would be an unpayable order attached to a card PayPal never accepted, left behind on every abandoned checkout. Requests seen: ${checkoutRequests}`,
            ).toBe(0);

            // ---- Half two: completing the card re-enables it, so the gate is validity and not a
            // permanently dead button (which would pass half one for entirely the wrong reason). ----
            await number.click();
            // ControlOrMeta, not Control: on macOS Control+a is "move to start of line" and the full
            // PAN would be typed in FRONT of the partial one, leaving the field invalid and turning
            // the assertion below into a false red that has nothing to do with the product.
            await number.press('ControlOrMeta+a');
            await number.pressSequentially(CARD.number, { delay: 30 });

            await expect(
                payButton,
                `#pay_unbranded_order must be ENABLED again once every hosted field reports valid — otherwise the disabled state above proves nothing about validity and a customer with a perfectly good card could never submit it. Card supplied through PAYPAL_UCC_TEST_CARD, expiry ${CARD.expiry}, ${CARD.cvv.length}-digit CVV`,
            ).toBeEnabled({ timeout: 30_000 });

            expect(
                checkoutRequests,
                `typing a complete card must still not create an order by itself: the checkout POST belongs to the Pay click, which this case never makes. Requests seen: ${checkoutRequests}`,
            ).toBe(0);

            log.success('PP-UCC-06: the unbranded Pay button tracked hosted-field validity — disabled on a partial card, enabled once complete, and no order was created by typing.');
        });
    });

    /* ================================================================== */
    /* PP-UCC-07 — the SDK tag a split card cart needs                     */
    /* ================================================================== */

    test('PP-UCC-07: the SDK tag carries the client token and every seller merchant id for a split cart', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        await openGatesAndRequireUcc(UCC_VENDORS);

        const probe = await withCustomerCheckout(browser, [{ productId: vendor1ProductId }, { productId: vendor2ProductId }], async page => {
            await selectPayPalAndRevealCard(page);
            return readProbe(page);
        });

        assertServerRenderedCardForm(probe);

        expect(
            probe.sdkScript,
            `exactly one PayPal SDK tag must be enqueued. Two would mount hosted fields twice into the same containers and the second render would fail on containers that are no longer empty; none means CartHandler::payment_scripts() returned early. Probe: ${describeProbe(probe)}`,
        ).toBe(1);

        expect(
            probe.sdkSrc ?? '',
            `with more than one connected seller in the cart the SDK url must carry merchant-id=* (Cart/CartHandler.php:203-208). That wildcard is what tells PayPal the page transacts for multiple merchants; a single merchant id there would make the card tokenise for one vendor only and the other vendor's unit unpayable. SDK src: ${probe.sdkSrc ?? '(no SDK tag)'}`,
        ).toContain('merchant-id=*');

        for (const [label, merchantId] of Object.entries(PAYPAL_MERCHANTS)) {
            expect(
                probe.merchantIdAttr ?? '',
                `data-merchant-id on script#dokan_paypal_sdk-js must list ${label}'s merchant id (${merchantId}). CartHandler::add_bn_code_to_script() builds it by walking the cart (Cart/CartHandler.php:189-215) and the SDK reads it to decide which merchants the hosted fields may be used for — a seller missing from this list cannot be paid by card even though their product is in the basket. Attribute: ${probe.merchantIdAttr ?? '(absent)'}`,
            ).toContain(merchantId);
        }

        expect(
            probe.partnerAttributionId ?? '',
            `data-partner-attribution-id must be present: it is Dokan's BN code (Helper::get_bn_code(), written at Cart/CartHandler.php:236) and PayPal uses it to attribute the integration. An empty value costs the partner attribution on every card transaction. Probe: ${describeProbe(probe)}`,
        ).not.toBe('');

        log.success('PP-UCC-07: the split-cart SDK tag carried a client token, merchant-id=*, both sellers in data-merchant-id and the Dokan BN code.');
    });
});
