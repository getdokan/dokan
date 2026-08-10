import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, PERSISTENT_CART_META, VENDOR1_EMAIL, VENDOR2_EMAIL } from './paypalMarketplaceShared';
import { test, expect, request } from '@utils/test';
import type { Browser, Page } from '@utils/test';
import { SERVER_URL, toPath, closeAnnouncementModal } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { PayPalMarketplacePage, PAYPAL_IDS, withAdminSettings, selectClassicPayPal as selectClassicPayPalShared, submitClassicCheckout } from './paypalMarketplacePage';
import { adminAuth, customerAuth, vendor2Auth, VENDOR_ID, VENDOR2_ID, CUSTOMER_ID, PAYPAL_MERCHANTS, hasCredentials, HAS_REAL_MERCHANTS, ensurePayPalConfigured, getPayPalStatus, seedPayPalConnectedVendor, clearPayPalVendor, ensureCustomerAddress, ensureClassicCheckoutPage, getOrderMetaValue, getPayPalOrder, GATEWAY_OPTION, GatewaySettings, readGatewaySettings, mergeGatewaySettings } from './helpers';

/* Selectors live on the page object (SKILL non-negotiable #1: selectors belong in
 * `<slug>Page.ts`). These aliases keep the existing in-file names readable. */
export const CLASSIC_CHECKOUT = PayPalMarketplacePage.classic;

export const BLOCK_CHECKOUT = PayPalMarketplacePage.block;

/**
 * PayPal Marketplace — stored / reflected cross-site scripting (PP-XSS-01 … PP-XSS-07).
 *
 * What "pass" means here, and why the shape of these tests matters more than usual.
 *
 * A payload that reaches a page and renders as literal text is a PASS. A payload that PARSES as
 * executable markup is a product defect to report, never a reason to soften an assertion. Every
 * case below therefore makes two claims, and both have to hold:
 *
 *   1. POSITIVE — the surface under test is genuinely LIVE in this run. The gateway is proven ready
 *      via `getPayPalStatus()`, the gateway is proven to be OFFERED at checkout, and the payload's
 *      inert marker is proven to have reached the rendered page. Without this half, "no script
 *      executed" is satisfied by a blank page, a hidden gateway or an unconfigured site — the exact
 *      trivially-true negative this suite exists to prevent.
 *   2. NEGATIVE — nothing executable survived: no `<script>` carrying the payload's flag, no inline
 *      event-handler attribute carrying it, no `javascript:` URL carrying it, and — decisively — the
 *      global the payload tries to set is still undefined after the page has loaded and run.
 *
 * The payload writes a `window` global rather than calling `alert()`. An `alert()` would block the
 * page on a native dialog that Playwright auto-dismisses, and the dismissal is silent, so an
 * executed payload could read as an ordinary passing load. A global is observable after the fact
 * and cannot be missed.
 *
 * ### Which write path each case uses, and why
 *
 * The settings that back PP-XSS-01/02/03/07 are written through the REAL admin form. That is not
 * cosmetic: `WC_Settings_API::validate_text_field()` and `validate_textarea_field()`
 * (woocommerce/includes/abstracts/abstract-wc-settings-api.php:881 and :952) both run
 * `wp_kses_post()`, and that sanitisation is the product's actual defence. Writing the option
 * directly would skip `process_admin_options()` entirely and would therefore test a code path no
 * admin can reach, while quietly stepping around the control the case is supposed to exercise.
 *
 * The threat model is real rather than self-XSS: `manage_woocommerce` is held by the shop_manager
 * role as well as by administrators, so a shop_manager who could plant script in the gateway title
 * or description would be executing code in every customer's and every administrator's browser —
 * a privilege escalation, not a footgun.
 *
 * PP-XSS-06 is the one case that writes its two settings directly, and for a reason stated in the
 * test: `display_notice_interval` renders as `<input type="number">` and `marketplace_logo` as
 * `<input type="url">`, and a browser will not let either field carry a markup payload at all
 * (the number input discards non-numeric input outright, and an invalid url blocks form submit).
 * Both settings are defended at READ time instead — `absint()` at Helper.php:838 and
 * `esc_url_raw()` at Helper.php:794 — and a direct write is exactly what proves that read-time
 * defence holds regardless of how the value got into the option.
 *
 * ### Grounded corrections to the catalogue, recorded rather than silently worked around
 *
 *   - PP-XSS-04 says the vendor STORE NAME travels in the outgoing payload. In dokan-pro 5.0.9 it
 *     does not. `OrderManager::make_purchase_unit_data()` (Order/OrderManager.php:167-219) builds
 *     `reference_id / amount / payee / items / shipping / payment_instruction / invoice_id /
 *     custom_id` and carries no store-name field; the only vendor-controlled strings in it are the
 *     line-item NAME and SKU, which `OrderManager::get_product_items()` (Order/OrderManager.php:363-397)
 *     copies straight out of the order line item. `Processor::create_partner_referral()`
 *     (Utilities/Processor.php:83-128) carries no store name either. The catalogued property — "the
 *     payload never reaches PayPal unescaped" — is therefore measured where it is actually
 *     measurable: the case orders a product whose NAME carries the payload, drives the module's real
 *     `process_payment()` path, and reads the purchase unit back FROM PAYPAL with
 *     `GET /v2/checkout/orders/{id}`. The hostile store name is still written, and the two
 *     page-reachable outgoing-data surfaces — the `dokan_paypal_sdk` script tag rebuilt by
 *     `CartHandler::add_bn_code_to_script()` (Cart/CartHandler.php:164-238) and the `dokan_paypal`
 *     object localised at CartHandler.php:148 — are still asserted, as containment checks beside the
 *     outgoing-payload assertion rather than in place of it. No capture is performed: creating and
 *     reading a PayPal order moves no money.
 *   - PP-XSS-06 says the notice interval or logo renders on the vendor dashboard. Neither does.
 *     `display_notice_interval` is consumed only as a transient TTL
 *     (source coordinates withheld) and `marketplace_logo` only as the PayPal-side
 *     `partner_logo_url` (Utilities/Processor.php:89). The dashboard notice itself
 *     (source coordinates withheld) echoes `connect_messsage()`, a `wp_kses()`-filtered static
 *     string with no settings input in it. The case therefore asserts the product's READ-TIME
 *     defences on what `Helper::` actually resolves — `notice_interval_resolved` and
 *     `marketplace_logo_resolved` on the mu-plugin `/status` route — and keeps the dashboard half as
 *     the containment check it is: the notice surface is proven live, then proven clean.
 *   - PP-XSS-03's "WooCommerce payments list" does not render the `title` setting. WooCommerce
 *     10.7.0 builds that list from `get_method_title()` and additionally runs `wp_strip_all_tags()`
 *     over it (src/Internal/Admin/Settings/PaymentsProviders/PaymentGateway.php:146-158), and this
 *     module's `method_title` is the hardcoded "Dokan PayPal Marketplace"
 *     (PaymentMethods/PayPal.php:124). The list half of that case is therefore a containment check
 *     with the gateway's presence on the list asserted so that it is not vacuous.
 *
 * DOK-026 is already filed for the vendor MERCHANT ID being echoed unescaped at
 * templates/vendor-settings-payment.php:11. PP-XSS-05 covers the vendor PayPal EMAIL, a different
 * field on the same screen and a different branch of that template, so nothing here re-files it.
 *
 * Never tagged `@serial` and never `test.describe.serial`: `playwright.config.ts:13` grepInverts
 * `@serial` out of BOTH CI lanes, which would delete this file from CI with no reported failure,
 * and `.serial` aborts the whole group on the first failure — on 2026-07-31 that silently erased 46
 * of 68 cases from a run that still summarised as green. A file already runs sequentially in one
 * worker, so ordering costs nothing here.
 */

/* ------------------------------------------------------------------ */
/* Selectors and option identity                                       */
/* ------------------------------------------------------------------ */

export const ADMIN = PayPalMarketplacePage.admin;

/** Classic `[woocommerce_checkout]` shortcode page — `ensureClassicCheckoutPage()` creates it. */

/** WooCommerce Blocks checkout. The radio id is derived from the UNDERSCORE gateway id. */

/** The PayPal JS SDK tag, rebuilt wholesale by `CartHandler::add_bn_code_to_script()`. */
export const SDK_SCRIPT = '#dokan_paypal_sdk-js';

/** Vendor payment-settings template field, `templates/vendor-settings-payment.php:42`. */
export const VENDOR_EMAIL_INPUT = '#vendor_paypal_email_address';

/** The connected-vendor branch of that same template — DOK-026's surface, asserted ABSENT in PP-XSS-05. */
export const VENDOR_DISCONNECT_BUTTON = 'a.dokan-btn-danger';

/** WooCommerce's payments list, the screen PP-XSS-03's second half loads. */
export const PAYMENTS_LIST_URL = '/wp-admin/admin.php?page=wc-settings&tab=checkout';


/** Dokan's per-vendor settings blob; the vendor PayPal email lives under `payment.<gateway id>`. */
export const VENDOR_PROFILE_META = 'dokan_profile_settings';


/* ------------------------------------------------------------------ */
/* Payload construction                                                */
/* ------------------------------------------------------------------ */

export interface XssPayload {
    /** The `window` property the payload tries to set. Undefined after load === nothing executed. */
    flag: string;
    /** A plain, tag-free substring. Its presence on the page proves the sink is live. */
    marker: string;
    /** The string actually written into the setting under test. */
    value: string;
}

/**
 * One payload per case, each with its own flag, so a stale global left behind by an earlier case
 * can never be mistaken for this case's payload firing.
 *
 * Five distinct injection shapes are packed into one string because they fail through five
 * different escaping mistakes: a raw `<script>` block (no filtering at all), an `onerror` attribute
 * on a tag `wp_kses_post()` otherwise permits (attribute-level filtering missing), an `<svg onload>`
 * (tag allow-list too wide), a `javascript:` URL (protocol filtering missing), and an attribute
 * breakout via `">` (output not `esc_attr()`-escaped). A payload testing only the first shape passes
 * against code that is wide open to the other four.
 */
export function xssPayload(caseId: string): XssPayload {
    const flag = `__ppXss${caseId}`;
    const marker = `PPXSS${caseId}MARKER`;
    const value =
        `${marker}<script>window.${flag}=1</script>` +
        `<img src=x onerror="window.${flag}=1">` +
        `<svg onload="window.${flag}=1"></svg>` +
        `<a href="javascript:window.${flag}=1">x</a>` +
        `"><b onmouseover="window.${flag}=1">y</b>`;
    return { flag, marker, value };
}

/* ------------------------------------------------------------------ */
/* The probe                                                           */
/* ------------------------------------------------------------------ */

export interface XssProbe {
    /** Stringified value of the payload's global, or null when it was never set. */
    fired: string | null;
    /**
     * ANONYMOUS inline `<script>` elements whose source text carries the flag.
     *
     * WordPress-registered inline scripts are excluded by their handle-derived id, for the same
     * reason `markerAsText` skips `<script>` text: they carry data SHIPPED to the page, not code the
     * page runs, and the block checkout always ships one that contains the flag (see the filter).
     */
    scriptTags: number;
    /** Elements carrying an `on…` attribute whose value carries the flag. */
    handlerAttributes: number;
    /** `href` / `src` / `action` values that resolve to a `javascript:` URL carrying the flag. */
    javascriptUrls: number;
    /**
     * Whether the payload's tag-free marker reached the document as RENDERED TEXT.
     *
     * Text nodes only, and never text belonging to a `<script>`, `<style>` or `<template>`: those
     * carry preloaded JSON that WooCommerce inlines into admin screens, and counting them would
     * report a value merely shipped to the page as one the page displays. Note this is deliberately
     * blind to values that live only in an ATTRIBUTE (a form field's `value`), which is why the two
     * cases whose sink is an input assert on `inputValue()` instead.
     */
    markerAsText: boolean;
}

/**
 * Read the whole document for evidence that the payload became executable.
 *
 * Text nodes rather than `innerText` for the marker: WooCommerce keeps every unselected
 * `.payment_box` in the DOM at `display:none`, where `innerText` is empty and a live sink would
 * read as a dead one.
 *
 * Benign markup is deliberately NOT counted. `wp_kses_post()` legitimately keeps an `<img src="x">`
 * after stripping its `onerror`, and WooCommerce renders gateway titles and descriptions as HTML by
 * design, so counting every surviving tag would red this file on core behaviour instead of on a
 * defect. What is counted is only what can run code.
 */
export async function probeForExecution(page: Page, payload: XssPayload): Promise<XssProbe> {
    return page.evaluate(
        ({ flagName, markerText }: { flagName: string; markerText: string }) => {
            const win = window as unknown as Record<string, unknown>;
            const fired = win[flagName];

            // Only ANONYMOUS scripts count. A `<script>` that really survived a stored payload is
            // emitted inline in the page body and carries no id; every script WordPress registers
            // carries a handle-derived one (`{handle}-js`, `-js-before`, `-js-after`, `-js-extra`),
            // and the block checkout ALWAYS ships one containing the flag verbatim:
            // `CartCheckoutBlockSupport::get_payment_method_data()` (Blocks/CartCheckoutBlockSupport.php:110-113)
            // publishes the gateway `title` and `description`, and WooCommerce inlines them into
            // `#wc-settings-js-after` as `var wcSettings = JSON.parse( decodeURIComponent( '…' ) )`
            // (src/Blocks/Assets/AssetDataRegistry.php:390-391) — and `rawurlencode()` leaves
            // alphanumerics and `_` untouched, so the flag survives inside that JSON string. It gets
            // there because `wp_kses_post()` strips the payload's `<script>` TAGS while keeping their
            // inner text, so the neutralised title literally contains `window.<flag>=1`. Counting
            // that would red every block-checkout case on correct behaviour. The residual risk — a
            // breakout INSIDE a registered data script — needs a `<script` to have been stored in the
            // first place, which `expectStoredValueNeutralised()` asserts against directly.
            const scriptTags = Array.from(document.querySelectorAll('script')).filter(
                script => !/-js(-before|-after|-extra)?$/.test(script.id) && (script.textContent ?? '').includes(flagName),
            ).length;

            const handlerAttributes = Array.from(document.querySelectorAll('*')).filter(element =>
                Array.from(element.attributes).some(attribute => /^on[a-z]+$/i.test(attribute.name) && attribute.value.includes(flagName)),
            ).length;

            const javascriptUrls = Array.from(document.querySelectorAll('[href],[src],[action]')).filter(element => {
                const url = element.getAttribute('href') ?? element.getAttribute('src') ?? element.getAttribute('action') ?? '';
                return /^\s*javascript:/i.test(url) && url.includes(flagName);
            }).length;

            const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
            let markerAsText = false;
            while (walker.nextNode()) {
                const parent = walker.currentNode.parentElement;
                if (parent && /^(script|style|template)$/i.test(parent.tagName)) {
                    continue;
                }
                if ((walker.currentNode.nodeValue ?? '').includes(markerText)) {
                    markerAsText = true;
                    break;
                }
            }

            return {
                fired: fired === undefined || fired === null ? null : String(fired),
                scriptTags,
                handlerAttributes,
                javascriptUrls,
                markerAsText,
            };
        },
        { flagName: payload.flag, markerText: payload.marker },
    );
}

/**
 * Assert that nothing executable survived on the page just probed.
 *
 * Every message is a plain string. Playwright builds assertion messages EAGERLY, before the
 * condition is evaluated, so interpolating something that might be undefined (a `JSON.stringify()`
 * of an absent value returns the VALUE `undefined`, and `.slice()` on it throws) turns a PASSING
 * case into a failure. Nothing here is computed inside a message.
 */
export function expectNothingExecuted(probe: XssProbe, surface: string): void {
    expect(
        probe.fired,
        `a script payload stored in the PayPal Marketplace settings EXECUTED on ${surface}. Anyone who can save those settings — which includes the shop_manager role, not just administrators — can therefore run arbitrary JavaScript in the browser of every visitor to that surface, which for a checkout page means every paying customer and for an admin screen means an administrator session`,
    ).toBeNull();

    expect(
        probe.scriptTags,
        `the stored payload survived into an executable <script> element on ${surface}. It did not run this time only by accident of ordering; the same markup runs on any reload`,
    ).toBe(0);

    expect(
        probe.handlerAttributes,
        `the stored payload survived as an inline event-handler attribute on ${surface}. Nothing needs to load or fail for that to run — a hover or an image error fires it`,
    ).toBe(0);

    expect(
        probe.javascriptUrls,
        `the stored payload survived as a javascript: URL on ${surface}. One click by the visitor executes it in their session`,
    ).toBe(0);
}

/**
 * Assert that whatever WooCommerce stored for this setting carries nothing executable.
 *
 * This is the product's real control — `wp_kses_post()` inside the field validators — and it is
 * asserted on its own rather than being inferred from a clean render, because output escaping and
 * input sanitisation fail independently.
 */
export function expectStoredValueNeutralised(stored: string | undefined, settingKey: string): void {
    expect(stored ?? null, `the "${settingKey}" setting is missing from the stored option, so the save under test never happened and nothing below is being measured`).not.toBeNull();

    const value = stored ?? '';
    expect(
        /<\s*script/i.test(value),
        `a <script> tag was stored verbatim in the "${settingKey}" setting. WooCommerce's field validator runs wp_kses_post() precisely to prevent that, so its absence means anyone with manage_woocommerce can persist executable markup into a customer-facing surface`,
    ).toBe(false);

    expect(
        /\son[a-z]+\s*=/i.test(value),
        `an inline event-handler attribute was stored verbatim in the "${settingKey}" setting, which is executable markup persisted into the database`,
    ).toBe(false);

    expect(
        /javascript\s*:/i.test(value),
        `a javascript: URL was stored verbatim in the "${settingKey}" setting; one visitor click on the rendered link runs it in their session`,
    ).toBe(false);
}

/* ------------------------------------------------------------------ */
/* Role helpers                                                        */
/* ------------------------------------------------------------------ */

/**
 * Store a payload in one gateway setting through the REAL admin form and return what WooCommerce
 * actually persisted.
 *
 * `paypal.save()` waits on `#message.updated.inline`. The `.inline` half is load-bearing: a
 * WooCommerce Bookings promo notice renders as `<div id="message" class="updated woocommerce-message">`
 * on the same screen, so the shorter `#message.updated` matches two elements and raises a
 * strict-mode violation on saves that in fact worked.
 */
export async function saveSettingThroughAdminForm(browser: Browser, fieldSelector: string, value: string): Promise<GatewaySettings> {
    await withAdminSettings(browser, async (page, paypal) => {
        await page.fill(fieldSelector, value);
        await paypal.save();
    });
    return readGatewaySettings();
}

export interface CheckoutSurface {
    page: Page;
    /** Whether the PayPal Marketplace radio is present, i.e. the gateway is genuinely offered. */
    offered: boolean;
}

/**
 * Open a checkout page as the customer with one product in the cart, and hand the page to the body.
 *
 * The cart is verified BEFORE navigating and off the database rather than off the page, because the
 * classic `[woocommerce_checkout]` shortcode renders NOTHING AT ALL for an empty cart
 * (`WC_Shortcode_Checkout::checkout()` returns early), so an empty cart cannot be detected on the
 * checkout page — it would burn the full wait on `#place_order` and then read as "gateway not
 * offered". WooCommerce writes this meta from the `woocommerce_add_to_cart` action, which fires only
 * on a SUCCESSFUL add, so its contents are proof the product really landed in this customer's cart.
 */
export async function withCustomerCheckout<T>(
    browser: Browser,
    productId: string,
    surface: 'classic' | 'block',
    body: (checkout: CheckoutSurface) => Promise<T>,
): Promise<T> {
    const ctx = await browser.newContext({ storageState: customerAuth });
    const page = await ctx.newPage();
    try {
        const paypal = new PayPalMarketplacePage(page);
        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        await paypal.addProductToCart(productId);

        const persistentCart = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
        expect(
            persistentCart,
            `the customer cart must hold product ${productId} before checkout is opened — an empty cart offers no payment methods at all, which would make every "nothing executed at checkout" assertion in this file pass for the wrong reason`,
        ).toMatch(new RegExp(`"product_id";(i:${productId};|s:\\d+:"${productId}")`));

        if (surface === 'classic') {
            await page.goto(CLASSIC_CHECKOUT.url, { waitUntil: 'domcontentloaded' });
            // WooCommerce renders #place_order even when no gateway is available, so it anchors
            // both the positive and the negative reading of the radio below.
            await expect(page.locator(CLASSIC_CHECKOUT.placeOrder), 'the classic checkout page must render the order form before any payload assertion means anything').toBeVisible({
                timeout: 60_000,
            });
            const offered = (await page.locator(CLASSIC_CHECKOUT.radio).count()) > 0;
            return await body({ page, offered });
        }

        await page.goto(BLOCK_CHECKOUT.url, { waitUntil: 'domcontentloaded' });
        await expect(
            page.locator(PayPalMarketplacePage.misc.blockPaymentStep),
            'the block checkout must render its payment-method step before any payload assertion means anything',
        ).toBeVisible({ timeout: 60_000 });
        const offered = (await page.locator(BLOCK_CHECKOUT.radio).count()) > 0;
        return await body({ page, offered });
    } finally {
        await page.close();
        await ctx.close();
    }
}

/* ------------------------------------------------------------------ */
/* Placing a real order through the module (PP-XSS-04 only)            */
/* ------------------------------------------------------------------ */

/**
 * Select PayPal Marketplace on the classic checkout and PROVE the selection took.
 *
 * The LABEL is clicked rather than the input: WooCommerce hides the radio outright when the gateway
 * is the only available method (`assets/js/frontend/checkout.js:223-231`), and every
 * `update_checkout` cycle covers the payment region with a blockUI overlay that a forced click would
 * land on instead. The `toBeChecked()` assertion is load-bearing — a submission carrying no
 * `payment_method` is rejected by `WC_Checkout::process_checkout()` as "Invalid payment method",
 * which would fail this case far away from its real cause.
 *
 * The shared helper's optional availability assertion is deliberately NOT requested: this file
 * proves the radio is present through `withCustomerCheckout()`'s `offered` flag, which every calling
 * case asserts on with its own wording.
 */
export async function selectClassicPayPal(page: Page): Promise<void> {
    await selectClassicPayPalShared(page, {
        selected: `${PAYPAL_IDS.gateway} must end up SELECTED on the classic checkout. A shopper who cannot select the method cannot pay with it, and WC_Checkout::process_checkout() rejects a submission carrying no payment_method as "Invalid payment method"`,
    });
}

/** Run a body against a fresh VENDOR2 page. Vendor 2 is used wherever a case needs a DISCONNECTED vendor. */
export async function withVendor2<T>(browser: Browser, body: (page: Page) => Promise<T>): Promise<T> {
    const ctx = await browser.newContext({ storageState: vendor2Auth });
    const page = await ctx.newPage();
    try {
        return await body(page);
    } finally {
        await page.close();
        await ctx.close();
    }
}

/* ------------------------------------------------------------------ */
/* Skip reasons — each names exactly what is missing                    */
/* ------------------------------------------------------------------ */

export const CREDENTIALS_SKIP =
    'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_ID_PAYPAL_MARKETPLACE / ' +
    'TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE), so Helper::is_ready() can never be true, the gateway is never offered at checkout, ' +
    'and this case would assert "no payload executed" against a surface that renders nothing at all — a pass for the wrong reason. ' +
    'PP-PRE-01 reports the absence.';

export const MERCHANT_SKIP =
    'no usable connected merchant ids are configured (PAYPAL_MARKETPLACE_VENDOR1_MERCHANT_ID / ' +
    'PAYPAL_MARKETPLACE_VENDOR2_MERCHANT_ID), so OrderManager::make_purchase_unit_data() cannot name a payee, PayPal rejects ' +
    'the create-order call, and no purchase unit ever reaches PayPal to be read back and inspected. PP-PRE-02 reports this as ' +
    'a documented gap.';

export const MODULE_SKIP =
    `the ${PAYPAL_IDS.module} module is inactive, so WooCommerce never registers the ${PAYPAL_IDS.gateway} settings section ` +
    'this case has to save through — nothing can be read into a result taken on that state.';

/** The known-good gateway option captured after configuration; every restore writes this back whole. */
export let baselineSettings: GatewaySettings = {};

export let xssProductId = '';

/** PP-XSS-04's product, whose NAME carries the payload. Created inside the case, deleted in afterAll. */
export let payloadNameProductId = '';

export class PayPalMarketplaceXssPage {
    async setupAll(): Promise<void> {
        // No test.skip() here on purpose: inside a beforeAll it silently voids the entire describe.
        if (!hasCredentials) {
            return;
        }

        // `button_type: 'smart'` is a precondition for PP-XSS-04 specifically —
        // `CartHandler::payment_scripts()` returns early for the standard button type, and the
        // outgoing-data surface that case inspects would then simply not exist on the page.
        await ensurePayPalConfigured({
            button_type: 'smart',
            title: DEFAULT_TITLE,
            description: DEFAULT_DESCRIPTION,
            marketplace_logo: '',
            display_notice_on_vendor_dashboard: 'no',
            display_notice_to_non_connected_sellers: 'no',
            display_notice_interval: '7',
        });
        await ensureCustomerAddress();
        await ensureClassicCheckoutPage();
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
        await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: VENDOR2_EMAIL });

        // Snapshot AFTER configuring, so the restore target is a gateway that is known to work
        // rather than whatever a previous spec happened to leave behind.
        baselineSettings = await readGatewaySettings();

        const api = new ApiUtils(await request.newContext());
        const [, productId] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Marketplace XSS Product' }, payloads.vendorAuth);
        xssProductId = productId;
        await api.dispose();
    }

    async teardownEach(): Promise<void> {
        if (Object.keys(baselineSettings).length > 0) {
            await dbUtils.setOptionValue(GATEWAY_OPTION, baselineSettings);
        } else {
            // Keyless run: `beforeAll` returned before it could capture a baseline, but PP-XSS-03
            // still executes there and still stores a payload in the title. Leaving it behind would
            // put script-shaped text on the WooCommerce payments screen and in every later spec's
            // checkout label for the rest of the worker's life, so the two fields this file writes
            // are reset explicitly rather than skipped along with the rest of the restore.
            await mergeGatewaySettings({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION });
        }

        if (!hasCredentials) {
            return;
        }
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
        await seedPayPalConnectedVendor(VENDOR2_ID, PAYPAL_MERCHANTS.vendor2, { email: VENDOR2_EMAIL });
    }

    async teardownAll(): Promise<void> {
        const productIds = [xssProductId, payloadNameProductId].filter(id => id !== '');
        if (productIds.length === 0) {
            return;
        }
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            for (const id of productIds) {
                await ctx.delete(`${SERVER_URL}/wc/v3/products/${id}?force=true`);
            }
        } finally {
            await ctx.dispose();
        }
    }

    async ppXss01({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const payload = xssPayload('01');

        // Baseline first. Every "nothing executed" claim below is only meaningful once the gateway
        // is proven ready on THIS site in THIS run — an unconfigured gateway renders no description
        // at all and would satisfy the negative trivially.
        expect(
            (await getPayPalStatus()).is_ready,
            'Helper::is_ready() must be TRUE before the description payload is stored. The description is printed by PayPal::payment_fields() (PaymentMethods/PayPal.php:183), which WooCommerce only calls for an available gateway, so on an unready gateway this whole case would assert the absence of a render that was never attempted',
        ).toBe(true);

        const stored = await saveSettingThroughAdminForm(browser, ADMIN.description, payload.value);
        expectStoredValueNeutralised(stored['description'], 'description');
        expect(
            stored['description'] ?? '',
            'the payload\'s inert marker must survive the save. If sanitisation discarded the whole value there is nothing left to render, and the checkout assertions below would be measuring an empty description rather than a neutralised payload',
        ).toContain(payload.marker);

        // Classic checkout — the direct sink. `PayPal::payment_fields()` echoes the raw stored
        // description with no escaping of its own, so whatever survived the save renders here.
        await withCustomerCheckout(browser, xssProductId, 'classic', async ({ page, offered }) => {
            expect(
                offered,
                'the PayPal Marketplace radio must be present at classic checkout. Without it WooCommerce never calls payment_fields(), the description is never printed, and "no payload executed" would be true of a page that never rendered the payload',
            ).toBe(true);

            const boxText = ((await page.locator(CLASSIC_CHECKOUT.box).first().textContent()) ?? '').trim();
            expect(
                boxText,
                'the stored description must reach the customer-facing payment box. textContent rather than innerText because WooCommerce keeps unselected payment boxes at display:none, where innerText is empty and a live sink reads as a dead one',
            ).toContain(payload.marker);

            const probe = await probeForExecution(page, payload);
            expect(probe.markerAsText, 'the payload must be present on the page as text, otherwise the executable-construct counts below are counting an empty page').toBe(true);
            expectNothingExecuted(probe, 'the classic checkout page, where every paying customer sees it');
        });

        // Block checkout — a genuinely different renderer, not a duplicate. The module's own block
        // component passes the description through `decodeEntities()`
        // (assets/src/blocks/payment-support/index.tsx:67), which turns `&lt;script&gt;` back into
        // `<script>`; only React's text-node rendering keeps that inert, so this path can fail while
        // the classic one passes.
        await withCustomerCheckout(browser, xssProductId, 'block', async ({ page, offered }) => {
            expect(offered, 'the PayPal Marketplace payment option must be offered at block checkout before its description can be asserted on').toBe(true);

            // The block description renders only for the SELECTED method. check() is a no-op when
            // the radio is already selected, so this is safe either way.
            await page.locator(BLOCK_CHECKOUT.radio).check();
            await expect(page.locator(BLOCK_CHECKOUT.description), 'selecting the PayPal Marketplace option must render its description block').toBeVisible({ timeout: 30_000 });
            await expect(page.locator(BLOCK_CHECKOUT.description), 'the stored description must reach the block checkout too').toContainText(payload.marker);

            const probe = await probeForExecution(page, payload);
            expect(probe.markerAsText, 'the payload must be present on the block checkout as text before its inertness can be asserted').toBe(true);
            expectNothingExecuted(probe, 'the block checkout page, which is the default checkout for a WooCommerce 10 store');
        });

        log.success('PP-XSS-01: the description payload was neutralised at save and rendered inert on both checkout renderers.');
    }

    async ppXss02({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const payload = xssPayload('02');

        expect(
            (await getPayPalStatus()).is_ready,
            'Helper::is_ready() must be TRUE before the title payload is stored — a hidden gateway renders no label, and the negative below would then be true of a page that never showed the payload',
        ).toBe(true);

        const stored = await saveSettingThroughAdminForm(browser, ADMIN.title, payload.value);
        expectStoredValueNeutralised(stored['title'], 'title');
        expect(stored['title'] ?? '', 'the payload\'s inert marker must survive the save, or the checkout assertions below measure an empty title').toContain(payload.marker);

        await withCustomerCheckout(browser, xssProductId, 'classic', async ({ page, offered }) => {
            expect(
                offered,
                'the PayPal Marketplace radio must be present at classic checkout. The radio is matched on the gateway id rather than the label text precisely because this case rewrites that label, so its presence is what proves the method is still offered',
            ).toBe(true);

            const labelText = ((await page.locator(CLASSIC_CHECKOUT.label).first().textContent()) ?? '').trim();
            expect(labelText, 'the stored title is what a customer reads on the payment method, so the payload must have reached that label for this case to be measuring anything').toContain(payload.marker);

            const probe = await probeForExecution(page, payload);
            expect(probe.markerAsText, 'the payload must be present at classic checkout as text before its inertness can be asserted').toBe(true);
            expectNothingExecuted(probe, 'the classic checkout payment-method label');
        });

        await withCustomerCheckout(browser, xssProductId, 'block', async ({ page, offered }) => {
            expect(offered, 'the PayPal Marketplace option must be offered at block checkout, where the module builds its label from the same stored title').toBe(true);

            await expect(
                page.locator(BLOCK_CHECKOUT.label),
                'the block checkout label is built as decodeEntities(settings.title) (assets/src/blocks/payment-support/index.tsx:14), so the payload must reach it for this half of the case to test anything',
            ).toContainText(payload.marker, { timeout: 30_000 });

            const probe = await probeForExecution(page, payload);
            expect(probe.markerAsText, 'the payload must be present at block checkout as text before its inertness can be asserted').toBe(true);
            expectNothingExecuted(probe, 'the block checkout payment-method label');
        });

        log.success('PP-XSS-02: the title payload was neutralised at save and rendered inert on both checkout renderers.');
    }

    async ppXss03({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        const payload = xssPayload('03');

        const stored = await saveSettingThroughAdminForm(browser, ADMIN.title, payload.value);
        expectStoredValueNeutralised(stored['title'], 'title');
        expect(stored['title'] ?? '', 'the payload\'s inert marker must survive the save, or both admin screens below render nothing and the case measures an empty title').toContain(payload.marker);

        // 1) The gateway settings screen. Here the stored value is unambiguously LIVE: it is
        //    rendered straight back into the text input's value attribute, which is exactly the
        //    context an unescaped `">` breakout targets.
        await withAdminSettings(browser, async (page) => {
            const rendered = await page.inputValue(ADMIN.title);
            expect(
                rendered,
                'the stored title must render back into the settings field. If it does not, an administrator cannot see what is configured — and the injection assertions that follow would be inspecting a blank input',
            ).toContain(payload.marker);

            // The live-sink proof here is `inputValue()` above, not `markerAsText`: on this screen
            // the stored title lives ONLY in the input's value attribute, never as a text node, so
            // asserting it as rendered text would fail on a perfectly healthy page.
            const probe = await probeForExecution(page, payload);
            expectNothingExecuted(
                probe,
                'the gateway settings screen, where the visitor is by definition an administrator and a firing payload would run with full site privileges',
            );
        });

        // 2) The WooCommerce payments list. This half is a CONTAINMENT check, not a live-sink check:
        //    WooCommerce 10.7.0 builds that list from get_method_title() and runs wp_strip_all_tags()
        //    over it (PaymentsProviders/PaymentGateway.php:146-158), and this module's method_title is
        //    the hardcoded "Dokan PayPal Marketplace" (PaymentMethods/PayPal.php:124), so the `title`
        //    setting is not expected to appear there at all. The gateway's own presence on the list is
        //    asserted so that "nothing executed" is not merely true of a page that failed to load.
        const ctx = await browser.newContext({ storageState: adminAuth });
        const page = await ctx.newPage();
        try {
            await page.goto(PAYMENTS_LIST_URL, { waitUntil: 'domcontentloaded' });
            await expect(
                page.locator('body'),
                'the WooCommerce payments list must actually list this gateway. Without that, every absence asserted below would be an absence from a page that never rendered the gateway at all',
            ).toContainText('Dokan PayPal Marketplace', { timeout: 60_000 });

            const probe = await probeForExecution(page, payload);
            expectNothingExecuted(probe, 'the WooCommerce payments list, an administrator-only screen');
            expect(
                probe.markerAsText,
                'the payments list is not expected to render the `title` setting — it renders the hardcoded method_title and strips tags from it. Finding the payload marker there means the list started sourcing an admin-editable string, which changes the escaping obligations of that screen and needs re-reviewing rather than silently passing',
            ).toBe(false);
        } finally {
            await page.close();
            await ctx.close();
        }

        log.success('PP-XSS-03: the title payload rendered inert on the settings screen and never reached the payments list.');
    }

    async ppXss04({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);
        test.skip(!HAS_REAL_MERCHANTS, MERCHANT_SKIP);

        const payload = xssPayload('04');

        const status = await getPayPalStatus();
        expect(status.is_ready, 'Helper::is_ready() must be TRUE — CartHandler::payment_scripts() enqueues nothing for an unready gateway, so the outgoing-data surface this case inspects would simply not exist').toBe(true);
        expect(
            status.button_type,
            'the smart button type is a precondition: CartHandler::payment_scripts() returns early for the standard button (Cart/CartHandler.php:95-97), and the SDK script tag inspected below is only ever emitted on the smart path',
        ).toBe('smart');

        const originalProfile = await dbUtils.getUserMeta(VENDOR_ID, VENDOR_PROFILE_META);
        try {
            await dbUtils.updateUserMeta(VENDOR_ID, VENDOR_PROFILE_META, { store_name: payload.value });
            const seeded = await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
            expect(
                seeded.receivable,
                'the vendor must be PayPal-payable before this case runs. A vendor is payable only with all SIX mode-swapped metas — seeding the merchant id alone produces a vendor that reads as connected while the gateway never appears at checkout',
            ).toBe(true);

            // The vendor-controlled string that DOES travel inside the outgoing purchase unit.
            // `OrderManager::get_product_items()` (Order/OrderManager.php:371-380) copies the order
            // line item's name and sku into `purchase_units[*].items[*]` verbatim, and the line-item
            // name is the product title the vendor typed. The store name has no such path — see the
            // scope note logged at the end of this case — so this is where the catalogued property
            // ("the payload never reaches PayPal unescaped") is actually measurable.
            const api = new ApiUtils(await request.newContext());
            let storedProductName = '';
            try {
                const [, createdId, createdName] = await api.createProduct({ ...payloads.createProduct(), name: payload.value }, payloads.vendorAuth);
                payloadNameProductId = createdId;
                storedProductName = createdName;
            } finally {
                await api.dispose();
            }

            expect(
                storedProductName,
                'the payload\'s inert marker must survive into the product name WordPress stored. If it did not, the line item carries no vendor-controlled text at all and every assertion below about what reached PayPal would be inspecting a string this vendor never influenced',
            ).toContain(payload.marker);

            const placed = await withCustomerCheckout(browser, payloadNameProductId, 'classic', async ({ page, offered }) => {
                expect(offered, 'the gateway must be offered for this vendor, otherwise the module emits no outgoing data for it and there is nothing to inspect').toBe(true);

                // The module's outgoing-data surface, proven live before anything is asserted absent
                // from it. `CartHandler::add_bn_code_to_script()` rebuilds this tag wholesale and is
                // where per-vendor data is attached for PayPal.
                await expect(
                    page.locator(SDK_SCRIPT),
                    'the PayPal SDK script tag must be present. It is the page-reachable end of the module\'s outgoing data path, and its absence would make every "the payload is not in the outgoing data" assertion below vacuously true',
                ).toHaveCount(1);

                const merchantAttribute = (await page.getAttribute(SDK_SCRIPT, 'data-merchant-id')) ?? '';
                const sourceAttribute = (await page.getAttribute(SDK_SCRIPT, 'src')) ?? '';

                expect(
                    merchantAttribute,
                    'the SDK tag must carry this vendor\'s merchant id. That attribute is what proves add_bn_code_to_script() actually ran and attached per-vendor data on this page rather than falling through one of its early returns',
                ).toBe(PAYPAL_MERCHANTS.vendor1);
                // EVERY attribute of the rebuilt tag, not just the two read above. Checking
                // `data-merchant-id` for the marker separately would be an assertion that cannot
                // fail — the strict equality immediately above already pins that attribute to a
                // merchant id, so once it passes the marker is necessarily absent from it.
                // `add_bn_code_to_script()` re-emits the tag wholesale (Cart/CartHandler.php:227-231)
                // with `src`, `id`, `data-client-token`, `data-merchant-id` and
                // `data-partner-attribution-id`, and not one of those is built from the store name,
                // so the marker or a raw `<` anywhere on the tag is vendor-controlled text that
                // reached the script element the browser hands to PayPal.
                const sdkAttributes = await page
                    .locator(SDK_SCRIPT)
                    .evaluate(element => Array.from(element.attributes).map(attribute => `${attribute.name}=${attribute.value}`).join('\n'));
                expect(
                    sdkAttributes.includes('<') || sdkAttributes.includes(payload.marker),
                    'the store-name payload leaked into an attribute of the PayPal SDK script tag, which both corrupts the per-vendor data sent to PayPal and puts attacker-controlled text into a script-tag attribute',
                ).toBe(false);
                expect(
                    sourceAttribute.includes('<') || sourceAttribute.includes(payload.marker),
                    'the store-name payload leaked into the PayPal SDK script URL, meaning vendor-controlled text is being sent to paypal.com inside a script src',
                ).toBe(false);

                // The localised configuration object, the module's other outgoing-data channel on
                // this page (`wp_localize_script( 'dokan_paypal_sdk', 'dokan_paypal', $data )`,
                // Cart/CartHandler.php:148).
                const localised = await page.evaluate(() => {
                    const win = window as unknown as Record<string, unknown>;
                    const data = win['dokan_paypal'];
                    return data === undefined || data === null ? null : JSON.stringify(data);
                });
                expect(localised, 'the module\'s localised checkout configuration must exist on the page — it is the second outgoing-data channel this case asserts the payload stays out of').not.toBeNull();
                expect(
                    (localised ?? '').includes(payload.marker),
                    'the store-name payload reached the module\'s localised checkout configuration, from where it is serialised into requests to PayPal',
                ).toBe(false);

                const probe = await probeForExecution(page, payload);
                expectNothingExecuted(probe, 'the checkout page rendered for a vendor whose store name carries a script payload');

                // Now the outgoing payload itself. Submitting the checkout runs
                // `PayPal::process_payment()` (PaymentMethods/PayPal.php:201), which is the only
                // caller of `OrderManager::make_purchase_unit_data()`, so this POST is what puts the
                // vendor-controlled line-item name in front of PayPal. Nothing is captured — the
                // create-order call registers the order and returns an approve link that no one
                // follows from here.
                await selectClassicPayPal(page);
                return await submitClassicCheckout(page);
            });

            expect(
                placed.__error ?? null,
                `the checkout submission never reached WooCommerce, so PayPal::process_payment() never ran and no purchase unit was built: ${String(placed.__error ?? '').slice(0, 400)}`,
            ).toBeNull();
            expect(
                placed.result,
                `WooCommerce refused the checkout submission, so the module built no purchase unit and this case cannot say anything about what reaches PayPal. Checkout answered: ${String(placed.messages ?? '').slice(0, 400)}`,
            ).toBe('success');

            const orderId = String(placed.id ?? '');
            expect(orderId, 'the checkout response must name the WooCommerce order it created — without an order id the PayPal order id cannot be read back off its meta').not.toBe('');

            // `_dokan_paypal_order_id` is written ONLY after `Processor::create_order()` succeeded
            // (PaymentMethods/PayPal.php:328-330). Asserting it is what stops a REJECTED create-order
            // — which is exactly what PayPal answers to a payload it will not accept — from being
            // read as "the payload was cleanly escaped".
            const paypalOrderId = (await getOrderMetaValue(orderId, '_dokan_paypal_order_id')) ?? '';
            expect(
                paypalOrderId,
                `order ${orderId} carries no _dokan_paypal_order_id, so Processor::create_order() failed and NO purchase unit reached PayPal. Either the payload broke the outgoing payload badly enough for PayPal to reject it — which is the defect this case exists to catch — or the sandbox rejected the payee; the failure text is in the order's dokan log`,
            ).not.toBe('');

            // Read the purchase unit back FROM PAYPAL. Nothing on the WordPress side persists what
            // was sent, so this is the only place the catalogued claim can be checked against real
            // outgoing data rather than against a payload rebuilt by the test.
            const ppOrder = await getPayPalOrder(paypalOrderId);
            const units = ppOrder.purchase_units as Array<{ items?: Array<{ name?: string }> }> | undefined;
            expect(
                Array.isArray(units) && units.length > 0,
                `PayPal order ${paypalOrderId} came back with no purchase_units, so there is no outgoing payload to inspect and every "the payload did not reach PayPal" assertion below would hold by absence`,
            ).toBe(true);

            const itemNames = (units ?? []).flatMap(unit => (unit.items ?? []).map(item => item.name ?? '')).join(' | ');
            expect(
                itemNames,
                'the line-item name PayPal received must carry the payload marker. That is the live-surface half of this case: it proves a vendor-controlled string really does travel inside purchase_units[*].items[*].name, so the escaping assertions that follow are measuring a hostile value rather than a payload the product silently dropped on the floor',
            ).toContain(payload.marker);

            const outgoing = JSON.stringify(units ?? []);
            expect(
                /<\s*script/i.test(outgoing),
                `a <script> tag reached PayPal inside the purchase unit of order ${orderId}. Any vendor can put that string in a product title, and it is then serialised into the order Dokan creates on PayPal's side and rendered back wherever PayPal displays line items`,
            ).toBe(false);
            expect(
                /\son[a-z]+\s*=/i.test(outgoing),
                `an inline event-handler attribute reached PayPal inside the purchase unit of order ${orderId} — executable markup shipped off-site under the marketplace's own partner credentials`,
            ).toBe(false);
            expect(
                /javascript\s*:/i.test(outgoing),
                `a javascript: URL reached PayPal inside the purchase unit of order ${orderId}, so a vendor-supplied protocol handler is travelling in the payment payload`,
            ).toBe(false);

            log.info(
                'PP-XSS-04 scope: the catalogued premise — a store name inside the outgoing purchase unit — does not exist in dokan-pro 5.0.9. ' +
                    'OrderManager::make_purchase_unit_data() (Order/OrderManager.php:167-219) carries reference_id, amount, payee, items, shipping, payment_instruction, invoice_id and custom_id and has no store-name field; ' +
                    'its only vendor-controlled strings are the line-item name and sku. Processor::create_partner_referral() (Utilities/Processor.php:83-128) carries no store name either. ' +
                    'That purchase unit is built only inside process_payment(), so the case drives that real path and reads the result back from PayPal: the store name is asserted absent from the two page-reachable outgoing surfaces, ' +
                    'and the catalogued property is asserted on the line-item name, which is a vendor-controlled string that genuinely does travel to PayPal.',
            );
            log.success('PP-XSS-04: a vendor-controlled payload reached PayPal only as inert text, and reached neither the SDK script tag nor the localised checkout data.');
        } finally {
            await dbUtils.setUserMeta(VENDOR_ID, VENDOR_PROFILE_META, originalProfile, true);
        }
    }

    async ppXss05({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const payload = xssPayload('05');

        expect(
            (await getPayPalStatus()).is_ready,
            'Helper::is_ready() must be TRUE. The vendor payment-settings screen is only registered while the withdraw method is enabled for a ready gateway, so an unready gateway would render no form and the negative would hold trivially',
        ).toBe(true);

        // The email input lives on the NOT-CONNECTED branch of the template
        // (templates/vendor-settings-payment.php:35-53). A connected vendor gets the merchant-id
        // branch instead, which is DOK-026's surface and a different field entirely.
        const cleared = await clearPayPalVendor(VENDOR2_ID);
        expect(cleared.receivable, 'vendor 2 must be disconnected for the email field to render at all — a connected vendor is shown the disconnect branch, which has no email input').toBe(false);

        const originalProfile = await dbUtils.getUserMeta(VENDOR2_ID, VENDOR_PROFILE_META);
        try {
            await dbUtils.updateUserMeta(VENDOR2_ID, VENDOR_PROFILE_META, {
                payment: { [PAYPAL_IDS.gateway]: { email: payload.value } },
            });

            await withVendor2(browser, async (page) => {
                const paypal = new PayPalMarketplacePage(page);
                await paypal.gotoVendorPaymentSettings();
                await closeAnnouncementModal(page);

                await expect(
                    page.locator(VENDOR_DISCONNECT_BUTTON),
                    'the vendor must be on the NOT-connected branch of the template. The connected branch renders the merchant id instead (DOK-026, vendor-settings-payment.php:11), which is a different field — asserting against it here would silently re-test an already-filed defect and never touch the email at all',
                ).toHaveCount(0);

                await expect(
                    page.locator(VENDOR_EMAIL_INPUT),
                    'the vendor PayPal email input must render. Without it the stored email is never output anywhere on this screen and "no payload executed" would be true of a page that never printed the value',
                ).toBeVisible({ timeout: 30_000 });

                const rendered = await page.inputValue(VENDOR_EMAIL_INPUT);
                expect(
                    rendered,
                    'the stored email must reach the input\'s value. The value is what the vendor re-submits, so if it were dropped the escaping asserted below would be escaping nothing',
                ).toContain(payload.marker);
                // The escaping check MUST read the serialized HTML, not `inputValue()`.
                //
                // `page.inputValue()` returns the DOM *property*, which the browser has already
                // decoded: correctly-escaped output of `value="&lt;script&gt;…"` (the template does
                // use `esc_attr()`, vendor-settings-payment.php:40) comes back as `<script>…`. On
                // 2026-07-31 this exact assertion failed against CORRECT product code and would have
                // produced a bug report about escaping that is in fact present — a false RED, which
                // costs more credibility than a false green because it sends an engineer hunting a
                // defect that does not exist.
                //
                // `outerHTML` gives the attribute as actually serialised, so `&lt;script` does not
                // match `/<\s*script/` while a genuine attribute breakout still does.
                const serialised = await page.locator(VENDOR_EMAIL_INPUT).evaluate(element => element.outerHTML);
                expect(
                    /<\s*script/i.test(serialised),
                    `the payload broke out of the value attribute in the rendered HTML (${serialised.slice(0, 200)}) — unescaped markup there runs in the vendor's own dashboard session`,
                ).toBe(false);

                // As on the admin settings screen, the live-sink proof is `inputValue()` above: the
                // stored email is written into a value attribute (vendor-settings-payment.php:40)
                // and never appears as a text node, so `markerAsText` is legitimately false here.
                const probe = await probeForExecution(page, payload);
                expectNothingExecuted(probe, "the vendor's own payment-settings screen, where a firing payload runs with that vendor's session");
            });

            log.info(
                'PP-XSS-05 note: the vendor email passes through esc_attr() TWICE — once in RegisterWithdrawMethods::paypal_connect_button() (line 100) and again in the template (line 40). ' +
                    'The value is safe, so this case passes; the doubled escaping is a separate display-level inaccuracy recorded in the session notes rather than asserted here.',
            );
            log.success('PP-XSS-05: the vendor PayPal email payload rendered as an inert attribute value.');
        } finally {
            await dbUtils.setUserMeta(VENDOR2_ID, VENDOR_PROFILE_META, originalProfile, true);
        }
    }

    async ppXss06({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const payload = xssPayload('06');

        expect(
            (await getPayPalStatus()).is_ready,
            'Helper::is_ready() must be TRUE. RegisterWithdrawMethods::display_notice_on_vendor_dashboard() returns early on an unready gateway (line 506), so the dashboard notice would not render and the case would assert absence against a page with no PayPal surface on it at all',
        ).toBe(true);

        // Written directly, deliberately, and this is the honest write path rather than a shortcut:
        // `display_notice_interval` renders as <input type="number"> and `marketplace_logo` as
        // <input type="url">, and a browser will not carry a markup payload through either — the
        // number input discards non-numeric input outright and an invalid url blocks form submit.
        // Both settings are defended at READ time instead (absint() at Helper.php:838 and
        // esc_url_raw() at Helper.php:794), and a direct write is precisely what proves that
        // read-time defence holds no matter how the value entered the option — including through an
        // import, a migration, WP-CLI or another plugin, none of which pass through WooCommerce's
        // field validators.
        //
        // The interval payload carries a NEGATIVE numeric prefix, and that is load-bearing rather
        // than decorative. `absint()` and the `(int)` cast the /status route uses to transport the
        // value agree on every non-negative input — a payload starting with letters resolves to 0
        // either way, so `toBe(0)` could not tell "absint() ran" from "the raw option was cast" and
        // would be an assertion incapable of failing. `-9…` is the one shape where they differ:
        // absint() answers 9, the raw string casts to -9. A negative interval is also the hostile
        // value absint() exists to stop — it is multiplied by DAY_IN_SECONDS and handed to
        // set_transient() (source coordinates withheld), and a negative expiry stores an
        // already-expired row, so the connect announcement would be recreated on every single
        // dashboard load instead of once every N days.
        const hostileInterval = `-9${payload.value}`;
        await mergeGatewaySettings({
            display_notice_interval: hostileInterval,
            marketplace_logo: payload.value,
            display_notice_on_vendor_dashboard: 'yes',
        });

        const storedSettings = await readGatewaySettings();
        expect(storedSettings['display_notice_interval'] ?? '', 'precondition: the payload really is stored in display_notice_interval, so what follows is measuring a hostile value rather than a clean one').toContain(payload.marker);
        expect(storedSettings['marketplace_logo'] ?? '', 'precondition: the payload really is stored in marketplace_logo').toContain(payload.marker);

        // The product's READ-TIME defences, measured on what `Helper::` actually hands the module
        // rather than on what this test wrote. Both getters are resolved server-side by the /status
        // route (tests/pw/mu-plugins/dokan-paypal-marketplace-test-helpers.php), so these assertions
        // go red the moment absint() or esc_url_raw() leaves Helper.php — which is the whole point:
        // neither resolved value is ever echoed on the vendor dashboard, so the dashboard half below
        // cannot see those defences at all.
        const resolved = await getPayPalStatus();

        expect(
            resolved.notice_interval_resolved,
            'Helper::non_connected_sellers_display_notice_intervals() (Helper.php:833-838) no longer collapses a hostile display_notice_interval to a non-negative integer. The value it returns is multiplied by DAY_IN_SECONDS and used as the set_transient() expiry for the PayPal connect announcement (source coordinates withheld); a negative expiry writes an already-expired transient, so every non-connected vendor is sent a fresh announcement on every dashboard load',
        ).toBe(9);

        expect(
            resolved.marketplace_logo_resolved,
            'Helper::get_marketplace_logo() (Helper.php:791-796) answered null, meaning the module no longer exposes the getter. The logo assertions below would then be inspecting an absent value instead of a resolved one',
        ).not.toBeNull();

        const resolvedLogo = resolved.marketplace_logo_resolved ?? '';
        expect(
            /<\s*script/i.test(resolvedLogo),
            `a <script> tag survived Helper::get_marketplace_logo() and is what the module now resolves as the marketplace logo (${resolvedLogo.slice(0, 200)}). That value is serialised into create_partner_referral()'s partner_logo_url (Utilities/Processor.php:89) and sent to PayPal under the marketplace's partner credentials, and it is rendered as a logo URL wherever the onboarding flow displays it`,
        ).toBe(false);
        expect(
            /\son[a-z]+\s*=/i.test(resolvedLogo),
            `an inline event-handler attribute survived Helper::get_marketplace_logo() (${resolvedLogo.slice(0, 200)}), so executable markup is being resolved as the logo URL the module ships to PayPal`,
        ).toBe(false);
        expect(
            /javascript\s*:/i.test(resolvedLogo),
            `a javascript: URL survived Helper::get_marketplace_logo() (${resolvedLogo.slice(0, 200)}). esc_url_raw() rejects a disallowed protocol outright, so its absence means the marketplace logo can be pointed at a script URL by anyone who can write that setting`,
        ).toBe(false);

        // The notice renders only for a NOT-connected vendor. An empty cart keeps
        // Helper::validate_cart_items() true (Helper.php:1312 short-circuits on an empty cart), which
        // keeps the gateway "available" and the notice reachable on the dashboard.
        const cleared = await clearPayPalVendor(VENDOR2_ID);
        expect(cleared.receivable, 'vendor 2 must be disconnected — the connect notice is suppressed for a connected seller (source coordinates withheld)').toBe(false);
        await dbUtils.clearCustomerCart(VENDOR2_ID);

        await withVendor2(browser, async (page) => {
            await page.goto(toPath('dashboard'), { waitUntil: 'domcontentloaded' });
            await closeAnnouncementModal(page);

            await expect(
                page.locator(PayPalMarketplacePage.misc.vendorPanelAlert).filter({ hasText: /not connected with PayPal Marketplace/i }).first(),
                'the PayPal connect notice must be visible on the vendor dashboard. It is the module\'s only dashboard render surface, and without it every "the payload did not reach the dashboard" assertion below would be true of a dashboard the module never touched',
            ).toBeVisible({ timeout: 30_000 });

            const probe = await probeForExecution(page, payload);
            expectNothingExecuted(probe, 'the vendor dashboard, where a firing payload runs with that vendor\'s session');
            expect(
                probe.markerAsText,
                'neither setting is a vendor-dashboard render sink in 5.0.9 — display_notice_interval is consumed only as a transient TTL (source coordinates withheld) and marketplace_logo only as the PayPal-side partner_logo_url (Utilities/Processor.php:89), while the notice text itself is a wp_kses()-filtered static string. Finding the marker on this page means one of them started being echoed, which is a new output sink that needs escaping and a fresh review',
            ).toBe(false);
        });

        log.info(
            'PP-XSS-06 scope: the catalogued premise — the interval or logo rendering on the vendor dashboard — does not hold in dokan-pro 5.0.9. ' +
                'Helper::non_connected_sellers_display_notice_intervals() returns absint( $settings[\'display_notice_interval\'] ) (Helper.php:833-838) and the value is used only as a transient expiry; ' +
                'Helper::get_marketplace_logo() returns esc_url_raw( $settings[\'marketplace_logo\'] ) (Helper.php:791-795) and the value leaves only inside the PayPal partner-referral payload. ' +
                'The case therefore asserts those two read-time defences on the RESOLVED getter values reported by the /status route, and keeps the dashboard as the containment surface: proven live, then proven clean.',
        );
        log.success('PP-XSS-06: absint() and esc_url_raw() neutralised both hostile settings at read time, and neither reached the vendor dashboard.');
    }

    async ppXss07({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const payload = xssPayload('07');

        const before = await readGatewaySettings();
        expect(
            Object.keys(before).length,
            'precondition: the gateway option must already hold a populated configuration. Comparing an empty map against a post-save map would let every "sibling key survived" assertion pass without checking anything',
        ).toBeGreaterThan(0);
        expect(before['partner_id'] ?? '', 'precondition: the stored partner id is one of the sibling keys whose survival is the point of this case').not.toBe('');

        await withAdminSettings(browser, async (page, paypal) => {
            await page.fill(ADMIN.title, payload.value);
            await page.fill(ADMIN.description, payload.value);
            await paypal.save();
        });

        // Read the option RAW first. `readGatewaySettings()` maps anything non-object to `{}`, so
        // asking it whether the value is an object could never fail; the raw read is what actually
        // catches a truncated or corrupted serialisation, which would leave Helper::get_settings()
        // seeing an empty array and silently disable the gateway for every customer.
        const afterRaw = await dbUtils.getOptionValueOrNull(GATEWAY_OPTION);
        expect(
            afterRaw !== null && typeof afterRaw === 'object' && !Array.isArray(afterRaw),
            'the gateway option no longer deserialises to a settings map after the payload save — the payload corrupted the serialised option, and every setting in it is gone',
        ).toBe(true);

        const after = await readGatewaySettings();
        expect(Object.keys(after).length, 'the gateway option must not be emptied by the payload save').toBeGreaterThan(0);

        for (const key of Object.keys(before)) {
            expect(Object.keys(after), `the "${key}" setting disappeared from the stored option after a payload was saved into an unrelated field, which silently reconfigures the gateway`).toContain(key);
            if (key === 'title' || key === 'description') {
                continue;
            }
            expect(
                after[key],
                `the "${key}" setting changed value after a payload was saved into title/description. Credentials, disbursement mode and the notice settings all live in the same option, so a save that rewrites a sibling can disable payouts or leak a mode change with nothing in the UI to show for it`,
            ).toBe(before[key]);
        }

        // New keys are NOT asserted against: process_admin_options() writes every field in
        // form_fields, so a key the baseline never held (the marketplace logo default, for one)
        // legitimately appears after the first real UI save. Only loss and mutation matter here.

        const firstTitle = after['title'] ?? '';
        const firstDescription = after['description'] ?? '';
        expectStoredValueNeutralised(firstTitle, 'title');
        expectStoredValueNeutralised(firstDescription, 'description');
        // Without this, the whole description half of the case is vacuously satisfiable: an empty
        // stored description passes expectStoredValueNeutralised() (`''` is not null and none of its
        // three regexes match an empty string), is skipped by the sibling-key loop above, and turns
        // the fixed-point assertion below into `'' === ''`. A regression that silently emptied the
        // checkout description on save would leave this case green.
        expect(
            firstDescription,
            'the payload\'s inert marker must survive the description save. If sanitisation discarded the whole value there is nothing left to round-trip, and every description assertion in this case would be satisfied by an empty string',
        ).toContain(payload.marker);

        // Second round-trip: re-post exactly what the form now renders. This is where progressive
        // re-encoding shows up — each save runs stripslashes() and wp_kses() again over a value that
        // was already escaped for the value attribute, so a value that is not a fixed point drifts a
        // little further on every visit to the settings screen until the admin's own title is
        // unreadable.
        await withAdminSettings(browser, async (page, paypal) => {
            const renderedTitle = await page.inputValue(ADMIN.title);
            const renderedDescription = await page.inputValue(ADMIN.description);
            expect(renderedTitle, 'the stored title must render back into the form for the round-trip below to re-post the real value').toContain(payload.marker);
            expect(
                renderedDescription,
                'the stored description must render back into the form for the round-trip below to re-post the real value. Re-posting an empty textarea would compare an empty string against an empty string and call the round trip stable',
            ).toContain(payload.marker);
            await page.fill(ADMIN.title, renderedTitle);
            await page.fill(ADMIN.description, renderedDescription);
            await paypal.save();
        });

        const second = await readGatewaySettings();
        expect(
            second['title'] ?? '',
            'the stored title changed on a second save that re-posted exactly what the form rendered. That is a fixed-point failure: every subsequent visit to the settings screen mutates the value again, so the checkout label an admin configured degrades on its own',
        ).toBe(firstTitle);
        expect(second['description'] ?? '', 'the stored description changed on a second save that re-posted exactly what the form rendered — the same self-mutating round trip, on the string customers read at checkout').toBe(firstDescription);
        expect(
            (await getPayPalStatus()).is_ready,
            'the gateway must still be ready after two payload round-trips. If it is not, the save path damaged a credential key while writing an unrelated field, and no customer can pay through PayPal',
        ).toBe(true);

        log.success('PP-XSS-07: two payload round-trips left every sibling key untouched and the stored value stable.');
    }
}
