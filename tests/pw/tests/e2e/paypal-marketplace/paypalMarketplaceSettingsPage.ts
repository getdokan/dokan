import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, PERSISTENT_CART_META, VENDOR1_EMAIL } from './paypalMarketplaceShared';
import { test, expect, request } from '@utils/test';
import type { Browser } from '@utils/test';
import { SERVER_URL } from '@utils/helpers';
import { log } from '@utils/logger';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { PayPalMarketplacePage, PAYPAL_IDS, withAdminSettings } from './paypalMarketplacePage';
import { customerAuth, VENDOR_ID, CUSTOMER_ID, PAYPAL_KEYS, PAYPAL_MERCHANTS, hasCredentials, ensurePayPalConfigured, getPayPalStatus, seedPayPalConnectedVendor, ensureCustomerAddress, ensureClassicCheckoutPage, GATEWAY_OPTION, readGatewaySettings, mergeGatewaySettings } from './helpers';
import type { GatewaySettings } from './helpers';

/* Selectors live on the page object (SKILL non-negotiable #1: selectors belong in
 * `<slug>Page.ts`). These aliases keep the existing in-file names readable. */
export const FIELD = PayPalMarketplacePage.settingsField;

export const CHECKOUT = PayPalMarketplacePage.classic;

/**
 * PayPal Marketplace — admin gateway settings (PP-SET-01 … PP-SET-25).
 *
 * The screen under test is the CLASSIC WooCommerce gateway form (`#mainform` + `#_wpnonce`),
 * not the React settings app, so every case that describes an admin interaction drives the real
 * UI: `fill()` / `setChecked()` / `selectOption()` dispatch the native `input` / `change` events
 * that WooCommerce's own dirty-tracking listens for (`woocommerce/assets/js/admin/settings.js:110-130`),
 * which is what flips the Save button out of its `disabled` state. Writing the option behind the
 * form would be a downgrade, not a shortcut — it would skip `process_admin_options()` entirely,
 * and with it the field sanitisation (PP-SET-10) and the webhook registration (PP-SET-23) that
 * only a real save performs.
 *
 * Where a case needs a state the UI cannot express, the settings option is written directly:
 *
 *   - The module ships NO `Settings::update()` writer, so there is no product-side API to call.
 *   - The mu-plugin `configure-paypal-marketplace` route MERGES and can therefore never REMOVE a
 *     key, which is exactly what PP-SET-14 / 16 / 17 / 22 need in order to observe a default.
 *   - That route also no-ops without credentials, so a keyless run could not even set up the
 *     preconditions of the credential-free cases.
 *
 * Restoration (PP-SET-25) writes an explicit COMPLETE map rather than a partial merge, after every
 * test and again at the end of the file. CI runs one worker with retries, so a spec that died
 * mid-mutation would otherwise hand every later PayPal test a broken gateway, and those tests
 * would then fail or skip for entirely the wrong reason.
 *
 * Gating, per test, never in `beforeAll` (a `test.skip` there silently voids the whole describe):
 *
 *   - Cases whose assertion needs real keys or gateway readiness skip on `!hasCredentials`.
 *   - The credential-free cases skip only when the `paypal_marketplace` module is inactive, since
 *     WooCommerce then never registers the section this file drives.
 *
 * Never tagged `@serial` — `playwright.config.ts:13` grepInverts that in BOTH lanes, which would
 * delete this file from CI without a single reported failure. Ordering comes from
 * `test.describe.serial`.
 */

/* ------------------------------------------------------------------ */
/* Selectors the shared payments set does not carry                    */
/* ------------------------------------------------------------------ */

export const ADMIN = PayPalMarketplacePage.admin;

/**
 * The payments suite exposes `disbursementMode` / `paymentButtonType` as select2 *container*
 * spans, which is right for clicking through the rendered dropdown but useless for reading or
 * setting a value. These are the underlying `<select>` elements, plus the four field ids that set
 * has no entry for at all.
 */

/** Classic `[woocommerce_checkout]` shortcode page — `ensureClassicCheckoutPage()` creates it. */

/* ------------------------------------------------------------------ */
/* Stored option access                                                */
/* ------------------------------------------------------------------ */

/** `Helper::get_webhook_key()` swaps on `test_mode` (`Helper.php:847-849`). */
export const WEBHOOK_OPTION_SANDBOX = 'dokan_paypal_marketplace_test_webhook';

export const WEBHOOK_OPTION_LIVE = 'dokan_paypal_marketplace_webhook';

/* ------------------------------------------------------------------ */
/* PayPal's own answer, read from the Dokan log (PP-SET-23)            */
/* ------------------------------------------------------------------ */

/**
 * `WebhookHandler::register_webhook()` swallows PayPal's rejection into `dokan_log()` and then
 * `delete_option()`s the key it was supposed to write, so the stored option is empty for two
 * causes that are NOT equivalent — the module never called PayPal (a real defect), or PayPal
 * refused the URL this host can offer (an environment limit). The option alone cannot tell them
 * apart; PayPal's logged reason can, so PP-SET-23 reads it rather than guessing.
 *
 * Read through the test-helper route rather than off the host filesystem. The site under test runs
 * in the wp-env `tests` container and its `wp-content/uploads` is a CONTAINER volume: verified
 * 2026-08-04, the container holds today's `dokan-*.log` while the host's
 * `wp-content/uploads/wc-logs/` holds only `.htaccess` and `index.html`. A host-side read therefore
 * reports "nothing was logged" whatever happened — which would turn this gate into a coin toss.
 */
export const LOG_TAIL_ROUTE = `${SERVER_URL}/dokan-test-paypal/v1/log-tail`;

/** PayPal's verbatim `issue` when it will not accept the URL — the environment cause, (b). */
export const UNREACHABLE_WEBHOOK_URL = /Not a valid webhook URL|WEBHOOK_URL_INVALID|Webhook URL is not valid/i;

export interface LogTail {
    size: number;
    text: string;
}

/** Current size of the module's log, used as the `offset` for the read after the action. */
export async function dokanLogTail(offset = 0): Promise<LogTail> {
    const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
    try {
        const res = await ctx.get(`${LOG_TAIL_ROUTE}?source=dokan&offset=${offset}`);
        if (!res.ok()) {
            return { size: 0, text: '' };
        }
        const body = (await res.json()) as { size?: number; text?: string };
        return { size: Number(body.size ?? 0), text: String(body.text ?? '') };
    } finally {
        await ctx.dispose();
    }
}


export const DEFAULT_BN_CODE = 'weDevs_SP_Dokan';

/**
 * The vendor's PayPal sandbox account login, env-driven like every other identity in this file
 * (VENDOR_ID / CUSTOMER_ID / PAYPAL_MERCHANTS / PAYPAL_KEYS all resolve from the environment).
 * Hardcoding it would seed `_dokan_paypal_marketplace..._email` with the wrong account on any
 * machine or CI secret set whose sandbox business account differs from the QA one, while the
 * merchant id seeded beside it stayed right — a mismatch no assertion here would catch.
 */


/**
 * The complete working configuration. Explicit and total: PP-SET-25 requires a restore that
 * REPLACES rather than merges, so that a key written by a dead test cannot survive into the next.
 */
export const WORKING_SETTINGS: GatewaySettings = {
    enabled: 'yes',
    test_mode: 'yes',
    partner_id: PAYPAL_KEYS.partnerId,
    test_app_user: PAYPAL_KEYS.clientId,
    test_app_pass: PAYPAL_KEYS.clientSecret,
    app_user: '',
    app_pass: '',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    bn_code: DEFAULT_BN_CODE,
    disbursement_mode: 'INSTANT',
    disbursement_delay_period: '7',
    button_type: 'smart',
    ucc_mode: 'no',
    display_notice_on_vendor_dashboard: 'no',
    display_notice_to_non_connected_sellers: 'no',
    display_notice_interval: '7',
};

/**
 * Read any option, reporting an ABSENT row as null instead of throwing — PP-SET-23.
 *
 * The webhook ids are stored as PLAIN strings (`update_option( key, $response['id'] )`), which
 * `getOptionValue` also cannot read: php-serialize's `unserialize` rejects anything that is not
 * serialized. `getOptionValueOrNull` applies WordPress's own maybe_unserialize rule, so a stored
 * webhook id comes back as the string it is rather than as a swallowed exception — without which
 * PP-SET-23's positive assertion could never pass and its `toBeNull()` twin could never fail.
 */
export async function readOptionOrNull(optionName: string): Promise<unknown> {
    return dbUtils.getOptionValueOrNull(optionName);
}

/**
 * REMOVE a key outright. The mu-plugin route cannot express this (it merges), and removal is the
 * only way to observe a field's default — an empty string and an absent key are different states
 * to WooCommerce's form renderer even though `Helper` treats both as unset.
 */
export async function removeGatewaySettingKey(key: string): Promise<void> {
    const settings = await readGatewaySettings();
    delete settings[key];
    await dbUtils.setOptionValue(GATEWAY_OPTION, settings);
}

/**
 * PP-SET-25 — restore the full working configuration and the connected vendor.
 *
 * The complete map goes in first so the restore holds even on a keyless run (where the mu-plugin
 * route returns early and would restore nothing at all). With credentials it additionally re-runs
 * the configure route, which re-asserts module activation and the HYPHENATED withdraw method, and
 * re-seeds the vendor's six mode-swapped metas.
 */
export async function restoreWorkingConfiguration(): Promise<void> {
    await dbUtils.setOptionValue(GATEWAY_OPTION, WORKING_SETTINGS);
    if (hasCredentials) {
        await ensurePayPalConfigured(WORKING_SETTINGS);
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
    }
}

/* ------------------------------------------------------------------ */
/* Role helpers                                                        */
/* ------------------------------------------------------------------ */

export interface CheckoutOffer {
    offered: boolean;
    labelText: string;
    boxText: string;
}

/**
 * Is the gateway actually OFFERED on classic checkout, and with what label / description?
 *
 * Matched on the radio input id rather than the label text, because the label is the
 * admin-editable `title`. `textContent()` rather than `innerText()` for the description: WooCommerce
 * keeps every unselected `.payment_box` in the DOM at `display:none`, where `innerText` is empty.
 */
export async function paypalOfferedAtClassicCheckout(browser: Browser, productId: string): Promise<CheckoutOffer> {
    const ctx = await browser.newContext({ storageState: customerAuth });
    const page = await ctx.newPage();
    try {
        const paypal = new PayPalMarketplacePage(page);
        await dbUtils.clearCustomerCart(CUSTOMER_ID);
        await paypal.addProductToCart(productId);

        // The cart is checked BEFORE navigating, and off the database rather than off the page,
        // because the classic `[woocommerce_checkout]` shortcode renders NOTHING AT ALL for an empty
        // cart — `WC_Shortcode_Checkout::checkout()` returns early at class-wc-shortcode-checkout.php:344,
        // and `.cart-empty` comes only from cart/cart-empty.php on the cart page, which this shortcode
        // never loads. So an empty cart cannot be detected on the checkout page at all: it would burn
        // the full 60s wait on #place_order and report "the page did not render", or worse read as a
        // quiet "gateway not offered". WooCommerce writes this meta from the `woocommerce_add_to_cart`
        // action (class-wc-cart-session.php:80 → :458-473), which fires only on a SUCCESSFUL add, so
        // its contents are proof the product really landed in this customer's cart.
        const persistentCart = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
        expect(
            persistentCart,
            `the customer cart must hold product ${productId} before checkout is opened — an empty cart offers no payment methods at all, which would make every "gateway not offered" assertion in this file pass for the wrong reason`,
        ).toMatch(new RegExp(`"product_id";(i:${productId};|s:\\d+:"${productId}")`));

        await page.goto(CHECKOUT.url, { waitUntil: 'domcontentloaded' });
        // The order form rendering is what makes an absent radio mean "not offered" rather than
        // "not rendered yet": WooCommerce renders #place_order even when no gateway is available,
        // so it is a safe anchor for both the positive and the negative cases.
        await expect(page.locator(CHECKOUT.placeOrder), 'the classic checkout page must render the order form').toBeVisible({ timeout: 60_000 });

        if ((await page.locator(CHECKOUT.radio).count()) === 0) {
            return { offered: false, labelText: '', boxText: '' };
        }
        return {
            offered: true,
            labelText: ((await page.locator(CHECKOUT.label).first().textContent()) ?? '').trim(),
            boxText: ((await page.locator(CHECKOUT.box).first().textContent()) ?? '').trim(),
        };
    } finally {
        await page.close();
        await ctx.close();
    }
}

/** Skip reason used by every case that can run without PayPal keys but not without the module. */
export const MODULE_SKIP =
    'the paypal_marketplace module is inactive, so WooCommerce never registers the ' +
    `${PAYPAL_IDS.gateway} settings section this case drives — activate the module (site setup does it) before reading anything into this result.`;

export const CREDENTIALS_SKIP =
    'PayPal sandbox credentials are absent (TEST_MERCHANT_ID_PAYPAL_MARKETPLACE / ' +
    'TEST_CLIENT_ID_PAYPAL_MARKETPLACE / TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE), so the gateway can never reach ' +
    'is_ready() and this case would assert its outcome against an unconfigured gateway — a pass for the wrong reason. PP-PRE-01 reports the absence.';

export let settingsProductId = '';

export class PayPalMarketplaceSettingsPage {
    async setupAll(): Promise<void> {
        // No test.skip() here on purpose: in a beforeAll it voids the entire describe silently.
        if (!hasCredentials) {
            return;
        }
        await ensurePayPalConfigured(WORKING_SETTINGS);
        await ensureCustomerAddress();
        await ensureClassicCheckoutPage();
        await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });

        const api = new ApiUtils(await request.newContext());
        const [, productId] = await api.createProduct({ ...payloads.createProduct(), name: 'PayPal Marketplace Settings Product' }, payloads.vendorAuth);
        settingsProductId = productId;
        await api.dispose();
    }

    async teardownEach(): Promise<void> {
        await restoreWorkingConfiguration();
    }

    async teardownAll(): Promise<void> {
        await restoreWorkingConfiguration();
        if (!settingsProductId) {
            return;
        }
        const ctx = await request.newContext({ extraHTTPHeaders: payloads.adminAuth as Record<string, string> });
        try {
            await ctx.delete(`${SERVER_URL}/wc/v3/products/${settingsProductId}?force=true`);
        } finally {
            await ctx.dispose();
        }
    }

    async ppSet01({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        await withAdminSettings(browser, async (page) => {
            await expect(
                page.locator(ADMIN.paypalMarketPlaceText),
                'the "Dokan PayPal Marketplace" heading must render on the section — without it an admin has no way to configure the gateway at all, and every later case in this file would be driving a blank form',
            ).toBeVisible();

            await expect(
                page.locator(ADMIN.enableDisablePayPalMarketplace),
                `the enable checkbox #woocommerce_${PAYPAL_IDS.gateway}_enabled must be present; the section URL carries the gateway id with UNDERSCORES (the withdraw method "${PAYPAL_IDS.withdrawMethod}" uses hyphens and is a different string)`,
            ).toBeVisible();

            // Located by its LABEL text and asserted on its id: WooCommerce builds that id from the
            // gateway id it actually registered, so this reads a value the server chose. Asserting
            // on page.url() instead would only echo back the string gotoGatewaySettings() navigated
            // to — it would pass identically on a site with no PayPal module installed.
            await expect(
                page.getByLabel('Enable Dokan PayPal Marketplace', { exact: true }),
                `the gateway must be registered under the UNDERSCORE id "${PAYPAL_IDS.gateway}" — that is what WooCommerce derives both its field ids and its settings-section URL from, and the withdraw method "${PAYPAL_IDS.withdrawMethod}" uses hyphens and is a different string`,
            ).toHaveAttribute('id', `woocommerce_${PAYPAL_IDS.gateway}_enabled`);
        });

        log.success('PP-SET-01: gateway settings section renders at the classic WooCommerce form URL.');
    }

    async ppSet02({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        // The gateway must start DISABLED. setChecked() on an already-ticked box dispatches no
        // change event, never dirties the form, leaves Save disabled — and the test would then
        // "prove" a state it never wrote.
        await mergeGatewaySettings({ enabled: 'no' });

        await withAdminSettings(browser, async (page, paypal) => {
            await expect(page.locator(ADMIN.enableDisablePayPalMarketplace), 'precondition: the gateway starts disabled, so ticking it is a real state change').not.toBeChecked();

            await paypal.setEnabled(true);
            await paypal.save();

            await paypal.gotoGatewaySettings();
            await expect(
                page.locator(ADMIN.enableDisablePayPalMarketplace),
                'the enable checkbox must survive a reload — if it does not, an admin who enables the gateway sees it silently switch itself off and no customer can ever pay through PayPal',
            ).toBeChecked();
        });

        const settings = await readGatewaySettings();
        expect(settings['enabled'], 'the stored option must carry enabled="yes"; Helper::is_enabled() compares against that literal (Helper.php:88-92) and anything else leaves is_ready() false').toBe('yes');
        expect((await getPayPalStatus()).is_enabled, 'Helper::is_enabled() must agree with the form the admin just saved').toBe(true);

        log.success('PP-SET-02: UI enable round-tripped into the stored option.');
    }

    async ppSet03({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        await mergeGatewaySettings({ enabled: 'yes', test_mode: 'no' });

        await withAdminSettings(browser, async (page, paypal) => {
            await expect(page.locator(ADMIN.payPalSandbox), 'precondition: sandbox starts off, so ticking it dirties the form').not.toBeChecked();

            await paypal.setSandbox(true);
            await paypal.save();

            await paypal.gotoGatewaySettings();
            await expect(page.locator(ADMIN.payPalSandbox), 'the sandbox checkbox must survive a reload').toBeChecked();
        });

        const settings = await readGatewaySettings();
        expect(
            settings['test_mode'],
            'the sandbox toggle is stored under test_mode (Helper.php:139-143). A spec asserting on a "sandbox" or "testmode" key would never match and would report a green sandbox toggle that does not exist',
        ).toBe('yes');
        expect(Object.keys(settings), 'no "sandbox" key exists — asserting on one would silently never match').not.toContain('sandbox');
        expect(Object.keys(settings), 'no "testmode" key exists either; that spelling belongs to Stripe Express').not.toContain('testmode');
        expect((await getPayPalStatus()).is_test_mode, 'Helper::is_test_mode() must report sandbox after the UI save, or every credential getter resolves the wrong key set').toBe(true);

        log.success('PP-SET-03: sandbox toggle round-tripped into test_mode.');
    }

    async ppSet04({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        // Start from empty credentials so each fill is a real write, not a no-op re-type.
        await mergeGatewaySettings({ enabled: 'yes', test_mode: 'yes', partner_id: '', test_app_user: '', test_app_pass: '' });

        await withAdminSettings(browser, async (page, paypal) => {
            await paypal.fillSandboxCredentials({
                partnerId: PAYPAL_KEYS.partnerId,
                clientId: PAYPAL_KEYS.clientId,
                clientSecret: PAYPAL_KEYS.clientSecret,
            });
            await paypal.save();

            await paypal.gotoGatewaySettings();
            await expect(page.locator(ADMIN.payPalMerchantId), 'the partner/merchant id must render back after a reload, or an admin cannot tell configured from unconfigured').toHaveValue(PAYPAL_KEYS.partnerId);
            await expect(page.locator(ADMIN.sandboxClientId), 'the sandbox client id must render back after a reload').toHaveValue(PAYPAL_KEYS.clientId);
            await expect(page.locator(ADMIN.sandBoxClientSecret), 'the sandbox client secret must render back after a reload').toHaveValue(PAYPAL_KEYS.clientSecret);
        });

        const settings = await readGatewaySettings();
        expect(settings['partner_id'], 'partner_id is a readiness condition in its own right (Helper.php:101-105)').toBe(PAYPAL_KEYS.partnerId);
        expect(settings['test_app_user'], 'the sandbox client id stores under test_app_user, the key Helper::get_client_id() reads in test mode (Helper.php:693-698)').toBe(PAYPAL_KEYS.clientId);
        expect(settings['test_app_pass'], 'the sandbox secret stores under test_app_pass, the key Helper::get_client_secret() reads in test mode (Helper.php:707-712)').toBe(PAYPAL_KEYS.clientSecret);

        log.success('PP-SET-04: all three sandbox credentials round-tripped through the real form.');
    }

    async ppSet05(): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const status = await getPayPalStatus();

        expect(status.gateway_id, 'the registered gateway id must be the underscore form').toBe(PAYPAL_IDS.gateway);
        expect(status.is_enabled, 'condition 1 of 4: the gateway is enabled').toBe(true);
        expect(status.has_partner_id, 'condition 2 of 4: a partner/merchant id is stored').toBe(true);
        expect(status.is_test_mode, 'sandbox mode is on, so readiness resolves the test_app_* credential pair rather than the empty live pair').toBe(true);
        expect(
            status.is_ready,
            'Helper::is_ready() must be TRUE here. This is the positive baseline the whole area rests on: every "gateway is absent / hidden / not offered" assertion in this file and in PP-CHK is only meaningful once presence has been proven on the same site in the same run. Without it, a negative passes trivially because nothing was ever configured',
        ).toBe(true);

        log.success('PP-SET-05: positive baseline established — is_ready() is true with all four conditions satisfied.');
    }

    async ppSet06({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        expect((await getPayPalStatus()).is_ready, 'baseline first: readiness must hold before any statement about checkout availability means anything').toBe(true);

        const offer = await paypalOfferedAtClassicCheckout(browser, settingsProductId);
        expect(
            offer.offered,
            'a ready gateway with a connected vendor in the cart must be OFFERED at classic checkout. Absence here means PayPal::is_available() failed on either is_ready() or validate_cart_items(), and no customer can pay through PayPal at all',
        ).toBe(true);
        expect(offer.labelText, 'the checkout method label renders the configured gateway title').toContain(WORKING_SETTINGS['title'] as string);

        log.success('PP-SET-06: gateway offered at classic checkout under its configured title.');
    }

    async ppSet07({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        expect((await getPayPalStatus()).is_ready, 'baseline: the gateway is ready BEFORE the client id is cleared, so the negative below cannot pass merely because nothing was configured').toBe(true);

        await withAdminSettings(browser, async (page, paypal) => {
            await page.fill(ADMIN.sandboxClientId, '');
            await paypal.save();
        });

        const settings = await readGatewaySettings();
        expect(settings['test_app_user'], 'clearing the field must actually clear the stored key').toBe('');
        expect(
            (await getPayPalStatus()).is_ready,
            'Helper::is_api_ready() requires a client id (Helper.php:114-118), so an empty one must leave is_ready() false. A gateway that still reports ready without a client id would go on to build PayPal orders with no credentials and fail at the customer',
        ).toBe(false);

        const offer = await paypalOfferedAtClassicCheckout(browser, settingsProductId);
        expect(offer.offered, 'an un-ready gateway must NOT be offered at checkout — offering it would let a customer pick a payment method that cannot complete').toBe(false);

        log.success('PP-SET-07: empty sandbox client id → not ready → not offered.');
    }

    async ppSet08({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        expect((await getPayPalStatus()).is_ready, 'baseline: the gateway is ready BEFORE the secret is cleared').toBe(true);

        await withAdminSettings(browser, async (page, paypal) => {
            await page.fill(ADMIN.sandBoxClientSecret, '');
            await paypal.save();
        });

        const settings = await readGatewaySettings();
        expect(settings['test_app_pass'], 'clearing the field must actually clear the stored key').toBe('');
        expect(
            (await getPayPalStatus()).is_ready,
            'Helper::is_api_ready() requires a client secret as well as a client id (Helper.php:114-118); with the secret gone the gateway must fail closed rather than half-configured',
        ).toBe(false);

        const offer = await paypalOfferedAtClassicCheckout(browser, settingsProductId);
        expect(offer.offered, 'a gateway with no client secret must not be offered at checkout').toBe(false);

        log.success('PP-SET-08: empty sandbox client secret → not ready → not offered.');
    }

    async ppSet09({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        expect((await getPayPalStatus()).is_ready, 'baseline: the gateway is ready BEFORE the partner id is cleared').toBe(true);

        await withAdminSettings(browser, async (page, paypal) => {
            await page.fill(ADMIN.payPalMerchantId, '');
            await paypal.save();
        });

        const status = await getPayPalStatus();
        expect(status.has_partner_id, 'clearing the field must actually clear partner_id').toBe(false);
        expect(
            status.is_ready,
            'partner_id is a SEPARATE readiness condition from the credential pair (Helper::is_ready() = enabled && partner_id && is_api_ready(), Helper.php:101-105). A suite that only ever clears the credentials would never notice partner_id regressing, and every marketplace payee reference is built from it',
        ).toBe(false);

        log.success('PP-SET-09: empty partner id → not ready, even with valid API credentials.');
    }

    async ppSet10({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const credentialFields = [
            { label: 'partner/merchant id', selector: ADMIN.payPalMerchantId, key: 'partner_id' },
            { label: 'sandbox client id', selector: ADMIN.sandboxClientId, key: 'test_app_user' },
            { label: 'sandbox client secret', selector: ADMIN.sandBoxClientSecret, key: 'test_app_pass' },
        ] as const;

        for (const field of credentialFields) {
            await restoreWorkingConfiguration();
            expect((await getPayPalStatus()).is_ready, `baseline before whitespacing the ${field.label}: the gateway is ready`).toBe(true);

            await withAdminSettings(browser, async (page, paypal) => {
                await page.fill(field.selector, ' ');
                await paypal.save();
            });

            const settings = await readGatewaySettings();
            expect(
                settings[field.key],
                `a single space typed into the ${field.label} must be stored as an empty string — WooCommerce trims text/password fields on save (WC_Settings_API::validate_password_field). A stored " " is TRUTHY in PHP, so it would satisfy Helper's ! empty() checks and report a fully ready gateway that PayPal rejects on the first API call`,
            ).toBe('');
            expect((await getPayPalStatus()).is_ready, `a whitespace-only ${field.label} must leave is_ready() false, exactly like an empty one`).toBe(false);
        }

        log.success('PP-SET-10: whitespace-only values in all three credential fields are treated as absent.');
    }

    async ppSet11({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        // Sandbox pair populated, live pair deliberately empty.
        await mergeGatewaySettings({
            enabled: 'yes',
            test_mode: 'yes',
            partner_id: PAYPAL_KEYS.partnerId,
            test_app_user: PAYPAL_KEYS.clientId,
            test_app_pass: PAYPAL_KEYS.clientSecret,
            app_user: '',
            app_pass: '',
        });
        expect((await getPayPalStatus()).is_ready, 'baseline: in sandbox mode the populated test_app_* pair makes the gateway ready').toBe(true);

        await withAdminSettings(browser, async (page, paypal) => {
            await paypal.setSandbox(false);
            await paypal.save();
            await expect(page.locator(FIELD.liveClientId), 'unticking sandbox reveals the LIVE credential rows, which is how an admin sees that a different key set is now in force').toBeVisible();
        });

        const status = await getPayPalStatus();
        expect(status.is_test_mode, 'the mode toggle must persist as test_mode="no"').toBe(false);
        expect(
            status.is_ready,
            'with sandbox off, Helper::get_client_id()/get_client_secret() read app_user/app_pass, which are empty — so the gateway must go NOT ready. If it stayed ready, the mode toggle would not actually be swapping key sets and a live marketplace would be transacting on sandbox credentials',
        ).toBe(false);

        const settings = await readGatewaySettings();
        expect(settings['test_app_user'], 'switching to live mode must not wipe the sandbox credentials — it selects a different pair, it does not migrate them').toBe(PAYPAL_KEYS.clientId);
        expect(settings['test_app_pass'], 'switching to live mode must not wipe the sandbox secret').toBe(PAYPAL_KEYS.clientSecret);

        log.success('PP-SET-11: the mode swap really swaps — live mode reads the empty live pair and fails readiness.');
    }

    async ppSet12({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const liveClientId = 'PPSET12-live-client-id';
        const liveClientSecret = 'PPSET12-live-client-secret';

        // Live pair written through the UI, which is only reachable with sandbox unticked.
        await withAdminSettings(browser, async (page, paypal) => {
            await paypal.setSandbox(false);
            await expect(page.locator(FIELD.liveClientId), 'the live client id row is revealed when sandbox is off').toBeVisible();
            await page.fill(FIELD.liveClientId, liveClientId);
            await page.fill(FIELD.liveClientSecret, liveClientSecret);
            await paypal.save();
        });

        let status = await getPayPalStatus();
        expect(status.is_test_mode, 'the gateway is now in live mode').toBe(false);
        expect(status.is_ready, 'live mode with a populated live pair is ready — readiness resolves whichever pair the mode selects').toBe(true);

        // Back to sandbox; the sandbox pair must still be exactly what PP-SET-04 stored.
        await withAdminSettings(browser, async (page, paypal) => {
            await paypal.setSandbox(true);
            await expect(page.locator(ADMIN.sandboxClientId), 'ticking sandbox reveals the sandbox credential rows again').toBeVisible();
            await paypal.save();
        });

        status = await getPayPalStatus();
        expect(status.is_test_mode, 'the gateway is back in sandbox mode').toBe(true);
        expect(status.is_ready, 'sandbox mode is ready again from the untouched test_app_* pair').toBe(true);

        const settings = await readGatewaySettings();
        expect(settings['app_user'], 'the live client id survives a round trip through sandbox mode').toBe(liveClientId);
        expect(settings['app_pass'], 'the live client secret survives a round trip through sandbox mode').toBe(liveClientSecret);
        expect(settings['test_app_user'], 'the sandbox client id was never clobbered by the live write').toBe(PAYPAL_KEYS.clientId);
        expect(settings['test_app_pass'], 'the sandbox client secret was never clobbered by the live write').toBe(PAYPAL_KEYS.clientSecret);
        expect(
            new Set([settings['app_user'], settings['app_pass'], settings['test_app_user'], settings['test_app_pass']]).size,
            'all four credential keys hold DISTINCT values — if any write leaked across the mode boundary, an admin testing in sandbox would silently overwrite the marketplace\'s live credentials',
        ).toBe(4);

        log.success('PP-SET-12: the live and sandbox credential pairs are stored independently and neither write clobbers the other.');
    }

    async ppSet13({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        for (const testMode of ['yes', 'no'] as const) {
            await mergeGatewaySettings({ test_mode: testMode });
            const status = await getPayPalStatus();
            expect(status.is_test_mode, `precondition: test_mode="${testMode}" took effect`).toBe(testMode === 'yes');
            expect(
                status.has_partner_id,
                `Helper::get_partner_id() reads the single "partner_id" key in BOTH modes (Helper.php:721-726) — it is not mode-swapped, so toggling test_mode must never make the partner id disappear`,
            ).toBe(true);

            await withAdminSettings(browser, async (page) => {
                await expect(page.locator(ADMIN.payPalMerchantId), `the same partner id renders in ${testMode === 'yes' ? 'sandbox' : 'live'} mode`).toHaveValue(PAYPAL_KEYS.partnerId);
                await expect(
                    page.locator(FIELD.partnerIdAny),
                    'exactly ONE partner-id input exists on the form; there is no per-mode twin',
                ).toHaveCount(1);
                await expect(
                    page.locator(FIELD.testPartnerIdAny),
                    'there is no "test_partner_id" field — a spec written by symmetry with the credential pair would assert against a field that does not exist and fail on a perfectly working gateway',
                ).toHaveCount(0);
            });
        }

        const settings = await readGatewaySettings();
        expect(settings['partner_id'], 'the one stored partner_id is unchanged by the mode toggling').toBe(PAYPAL_KEYS.partnerId);
        expect(Object.keys(settings), 'no test_partner_id key is ever written').not.toContain('test_partner_id');

        log.success('PP-SET-13: a single shared partner_id serves both modes.');
    }

    async ppSet14({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        await removeGatewaySettingKey('disbursement_mode');
        expect((await getPayPalStatus()).disbursement_mode, 'precondition: the stored key really is gone, so what the form shows next is a DEFAULT rather than a saved value').toBeNull();

        await withAdminSettings(browser, async (page) => {
            await expect(
                page.locator(FIELD.disbursementMode),
                'with no stored value the form must select INSTANT, matching Helper::get_disbursement_mode()\'s own fallback (Helper.php:763-768). A form default that disagreed with the PHP fallback would mean the screen shows one disbursement policy while the money follows another',
            ).toHaveValue('INSTANT');
        });

        // Ordered so each selection is a real change from what the page is showing.
        for (const mode of ['ON_ORDER_COMPLETE', 'DELAYED', 'INSTANT'] as const) {
            await withAdminSettings(browser, async (page, paypal) => {
                // force: select2 (wc-enhanced-select) hides the real <select>; force skips the
                // visibility check while still dispatching input/change, which is what both
                // select2 and the module's own admin toggle script listen for.
                await page.selectOption(FIELD.disbursementMode, mode, { force: true });
                await paypal.save();

                await paypal.gotoGatewaySettings();
                await expect(page.locator(FIELD.disbursementMode), `disbursement mode ${mode} must survive a reload`).toHaveValue(mode);
            });

            expect(
                (await getPayPalStatus()).disbursement_mode,
                `disbursement mode ${mode} must reach the stored option — this key decides whether vendor funds are released at capture, at order completion, or after a hold, so a value that does not persist silently reverts the marketplace's payout policy`,
            ).toBe(mode);
        }

        log.success('PP-SET-14: INSTANT default plus all three disbursement modes round-trip.');
    }

    async ppSet15({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        await withAdminSettings(browser, async (page) => {
            await page.selectOption(FIELD.disbursementMode, 'DELAYED', { force: true });
            await expect(
                page.locator(FIELD.disbursementDelayPeriod),
                'DELAYED is the only mode that holds funds for a period, so its delay-period input must be revealed — hidden, an admin cannot set the hold at all',
            ).toBeVisible();

            await page.selectOption(FIELD.disbursementMode, 'INSTANT', { force: true });
            await expect(
                page.locator(FIELD.disbursementDelayPeriod),
                'INSTANT disburses at capture, so the delay-period input must be hidden; leaving it on screen invites an admin to configure a hold that will never be applied',
            ).toBeHidden();

            await page.selectOption(FIELD.disbursementMode, 'ON_ORDER_COMPLETE', { force: true });
            await expect(page.locator(FIELD.disbursementDelayPeriod), 'ON_ORDER_COMPLETE keys off order status rather than a delay, so the delay-period input stays hidden').toBeHidden();
        });

        log.success('PP-SET-15: the delay-period row follows the disbursement mode.');
    }

    async ppSet16({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        await mergeGatewaySettings({ disbursement_mode: 'DELAYED' });
        await removeGatewaySettingKey('disbursement_delay_period');

        const settings = await readGatewaySettings();
        expect(
            Object.keys(settings),
            'precondition: the delay-period key is absent from the stored option, which is the state a marketplace is in until an admin edits that field for the first time',
        ).not.toContain('disbursement_delay_period');

        expect(
            (await getPayPalStatus()).disbursement_delay_period_resolved,
            'Helper::get_disbursement_delay_period() must resolve an ABSENT disbursement_delay_period to 0 (its `! empty()` fallback, Helper.php:777-781) while the settings form advertises 7 ' +
                '(admin-gateway-settings.php:159). The disagreement IS the finding: OrderController::disburse_delayed_payment() subtracts no interval at 0, so a DELAYED marketplace whose admin ' +
                'never touched this field disburses immediately while its own settings screen claims a week-long hold. A resolved value that is no longer 0 means the product fallback changed and ' +
                'this documented defect needs re-triaging, not that the case may be relaxed; a null means the module is inactive or the getter was renamed, so the mu-plugin /status probe ' +
                '(dokan-paypal-marketplace-test-helpers.php, `disbursement_delay_period_resolved`) needs re-pointing before this case can speak at all',
        ).toBe(0);

        await withAdminSettings(browser, async (page) => {
            await expect(page.locator(FIELD.disbursementDelayPeriod), 'the field is visible because the mode is DELAYED').toBeVisible();
            await expect(
                page.locator(FIELD.disbursementDelayPeriod),
                'the form advertises a 7-day hold for an unset delay period (admin-gateway-settings.php:159), while Helper::get_disbursement_delay_period() resolves that same unset state to 0 (Helper.php:777-781). The two disagree, and the disagreement is the finding: OrderController::disburse_delayed_payment() subtracts no interval at 0, so a DELAYED marketplace whose admin never touched this field disburses immediately while its own settings screen claims a week-long hold',
            ).toHaveValue('7');
        });

        log.info(
            'PP-SET-16: all three halves are asserted — the absent key (stored option), the resolved 0 read back from Helper::get_disbursement_delay_period() through the /status probe ' +
                '(`disbursement_delay_period_resolved`, dokan-paypal-marketplace-test-helpers.php), and the advertised 7 in the rendered form.',
        );
        log.success('PP-SET-16: unset delay period documented — form says 7, PHP resolves 0.');
    }

    async ppSet17({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        await removeGatewaySettingKey('button_type');
        expect((await getPayPalStatus()).button_type, 'precondition: the stored key is gone, so the form shows a default').toBeNull();

        await withAdminSettings(browser, async (page) => {
            await expect(
                page.locator(FIELD.buttonType),
                'with nothing stored the form must default to the smart payment buttons — the standard button skips the funding-source and UCC paths entirely, so a wrong default silently changes what buyers are offered',
            ).toHaveValue('smart');
        });

        for (const buttonType of ['standard', 'smart'] as const) {
            await withAdminSettings(browser, async (page, paypal) => {
                await page.selectOption(FIELD.buttonType, buttonType, { force: true });
                await paypal.save();

                await paypal.gotoGatewaySettings();
                await expect(page.locator(FIELD.buttonType), `button type ${buttonType} must survive a reload`).toHaveValue(buttonType);
            });

            expect((await getPayPalStatus()).button_type, `button type ${buttonType} must reach the stored option, since Helper::get_button_type() gates the UCC card fields on the "smart" value`).toBe(buttonType);
        }

        log.success('PP-SET-17: smart default plus both button types round-trip.');
    }

    async ppSet18({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        const title = 'QA PayPal Title 7731';
        const description = 'Pay with the QA PayPal Marketplace gateway 7731.';

        await withAdminSettings(browser, async (page, paypal) => {
            await page.fill(ADMIN.title, title);
            await page.fill(ADMIN.description, description);
            await paypal.save();

            await paypal.gotoGatewaySettings();
            await expect(page.locator(ADMIN.title), 'the configured title must survive a reload').toHaveValue(title);
            await expect(page.locator(ADMIN.description), 'the configured description must survive a reload').toHaveValue(description);
        });

        const offer = await paypalOfferedAtClassicCheckout(browser, settingsProductId);
        expect(offer.offered, 'changing the title/description must not make the gateway disappear from checkout').toBe(true);
        expect(offer.labelText, 'the admin-configured title is what a customer sees on the payment method — a stale label means the marketplace cannot brand its own checkout').toContain(title);
        expect(offer.boxText, 'the admin-configured description renders in the payment box beneath the method').toContain(description);

        log.success('PP-SET-18: configured title and description reached the customer-facing checkout.');
    }

    async ppSet19({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        await mergeGatewaySettings({ button_type: 'smart', ucc_mode: 'no' });

        await withAdminSettings(browser, async (page, paypal) => {
            await expect(page.locator(FIELD.uccMode), 'precondition: UCC starts off, so ticking it dirties the form').not.toBeChecked();
            await page.setChecked(FIELD.uccMode, true);
            await paypal.save();

            await paypal.gotoGatewaySettings();
            await expect(page.locator(FIELD.uccMode), 'the UCC toggle must survive a reload').toBeChecked();
        });
        expect((await getPayPalStatus()).ucc_mode, 'ucc_mode="yes" must reach the stored option; Helper::is_ucc_mode_allowed() reads that literal').toBe('yes');

        await withAdminSettings(browser, async (page, paypal) => {
            await page.setChecked(FIELD.uccMode, false);
            await paypal.save();

            await paypal.gotoGatewaySettings();
            await expect(page.locator(FIELD.uccMode), 'turning UCC back off must also persist — a toggle that only ever latches on cannot be switched off after a failed rollout').not.toBeChecked();
        });
        expect((await getPayPalStatus()).ucc_mode, 'ucc_mode="no" must reach the stored option').toBe('no');

        log.info('PP-SET-19: enabling ucc_mode does not by itself render card fields — Helper::is_ucc_enabled() additionally requires button_type=smart, a supported base country and currency, and PayPal-side PPCP_CUSTOM vetting. See PP-3DS.');
        log.success('PP-SET-19: ucc_mode round-trips in both directions.');
    }

    async ppSet20({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        await mergeGatewaySettings({
            display_notice_on_vendor_dashboard: 'no',
            display_notice_to_non_connected_sellers: 'no',
            display_notice_interval: '7',
        });

        await withAdminSettings(browser, async (page, paypal) => {
            await page.setChecked(ADMIN.displayNoticeToConnectSeller, true);
            await page.setChecked(ADMIN.sendAnnouncementToConnectSeller, true);
            // The interval row is revealed by the announcement checkbox above; filling it before
            // ticking that box would target a hidden input.
            await expect(page.locator(ADMIN.sendAnnouncementInterval), 'the interval input is revealed once announcements are enabled').toBeVisible();
            await page.fill(ADMIN.sendAnnouncementInterval, '3');
            await paypal.save();

            await paypal.gotoGatewaySettings();
            await expect(page.locator(ADMIN.displayNoticeToConnectSeller), 'the dashboard-notice toggle must survive a reload').toBeChecked();
            await expect(page.locator(ADMIN.sendAnnouncementToConnectSeller), 'the announcement toggle must survive a reload').toBeChecked();
            await expect(page.locator(ADMIN.sendAnnouncementInterval), 'the announcement interval must survive a reload').toHaveValue('3');
        });

        const settings = await readGatewaySettings();
        expect(settings['display_notice_on_vendor_dashboard'], 'Helper::display_notice_on_vendor_dashboard() compares against the literal "yes"').toBe('yes');
        expect(settings['display_notice_to_non_connected_sellers'], 'Helper::display_announcement_to_non_connected_sellers() compares against the literal "yes"').toBe('yes');
        expect(
            settings['display_notice_interval'],
            'the interval must persist as typed — Helper::non_connected_sellers_display_notice_intervals() silently falls back to 7 for an unset value, so an interval that fails to save looks like a working weekly announcement instead of a lost setting',
        ).toBe('3');

        log.success('PP-SET-20: all three vendor-notice settings round-trip.');
    }

    async ppSet21({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        await mergeGatewaySettings({ display_notice_to_non_connected_sellers: 'no' });

        await withAdminSettings(browser, async (page) => {
            await expect(
                page.locator(ADMIN.sendAnnouncementInterval),
                'with announcements off the interval input must be hidden — it configures nothing in that state',
            ).toBeHidden();

            await page.setChecked(ADMIN.sendAnnouncementToConnectSeller, true);
            await expect(page.locator(ADMIN.sendAnnouncementInterval), 'enabling announcements must reveal the interval input, or the admin can never change the weekly default').toBeVisible();

            await page.setChecked(ADMIN.sendAnnouncementToConnectSeller, false);
            await expect(page.locator(ADMIN.sendAnnouncementInterval), 'disabling announcements hides the interval input again').toBeHidden();
        });

        log.success('PP-SET-21: the interval row follows the announcement toggle.');
    }

    async ppSet22({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        await removeGatewaySettingKey('bn_code');

        const settings = await readGatewaySettings();
        expect(Object.keys(settings), 'precondition: no bn_code is stored, so what follows is the default rather than a saved value').not.toContain('bn_code');

        await withAdminSettings(browser, async (page) => {
            await expect(
                page.locator(ADMIN.payPalPartnerAttributionId),
                `an unset BN code must render as "${DEFAULT_BN_CODE}", the same fallback Helper::get_bn_code() applies (Helper.php:75-79). This string is what identifies Dokan as the integrating partner on every PayPal call, so a wrong or empty default costs the marketplace its partner attribution on every single order without any visible symptom`,
            ).toHaveValue(DEFAULT_BN_CODE);
        });

        log.success('PP-SET-22: BN code defaults to weDevs_SP_Dokan.');
    }

    async ppSet24({ browser }: { browser: Browser }): Promise<void> {
        const status = await getPayPalStatus();
        test.skip(!status.module_active, MODULE_SKIP);

        const savedTitle = 'QA PayPal Title 7724';

        await withAdminSettings(browser, async (page, paypal) => {
            // Positive control: prove the form really rendered, so the absence below cannot be the
            // absence of the whole page.
            await expect(page.locator(FIELD.partnerIdAny), 'positive control: real fields render on this form').toHaveCount(1);
            await expect(
                page.locator(FIELD.maxError),
                'no max-quantity-error input renders on the settings form. Helper::get_max_quantity_error_message() reads the "max_error" key once (Helper.php:749-753) and has no caller anywhere in dokan-lite or dokan-pro, so the value could not affect behaviour even if a field existed. This case documents dead configuration rather than asserting a feature',
            ).toHaveCount(0);

            // A REAL save has to run here, or the stored-option assertion below would only be
            // reading back the WORKING_SETTINGS literal that the previous afterEach restore wrote —
            // i.e. this test's own fixture, which contains no max_error by construction and would
            // keep passing even if a save DID start writing the key. Re-typing the title is what
            // dirties the form; WooCommerce renders Save disabled until an input/change event fires.
            await page.fill(ADMIN.title, savedTitle);
            await paypal.save();
        });

        const settings = await readGatewaySettings();
        expect(settings['title'], 'proof the save actually ran, so the absence below is a statement about what process_admin_options() writes rather than about the restored fixture').toBe(savedTitle);
        expect(Object.keys(settings), 'a save writes no max_error key either, because the form renders no field to collect one').not.toContain('max_error');

        log.info('PP-SET-24: max_error is dead config — no form field, no caller. If a future release adds the field, this case fails and that failure is the signal to write real coverage for it.');
    }

    async ppSet25(): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        // Explicit COMPLETE map, not a partial merge — see restoreWorkingConfiguration().
        await restoreWorkingConfiguration();

        const settings = await readGatewaySettings();
        for (const key of Object.keys(WORKING_SETTINGS)) {
            expect(settings[key], `the restored settings map carries "${key}" exactly as declared, so no later spec inherits a half-configured gateway`).toBe(WORKING_SETTINGS[key]);
        }

        const status = await getPayPalStatus();
        expect(
            status.is_ready,
            'readiness must hold at the END of this file. CI runs a single worker with retries, so a settings spec that died mid-mutation would hand every later PayPal test a broken gateway, and those tests would then fail or skip for a reason that has nothing to do with what they assert',
        ).toBe(true);
        expect(status.module_active, 'the paypal_marketplace module is still active after a file full of settings mutations').toBe(true);
        expect(status.stripe_express_active, 'the stripe_express module is untouched — the PayPal configure route merges and removes nothing, or the whole Stripe suite would silently skip on this worker').toBe(true);
        expect(status.withdraw_method_on, `the HYPHENATED withdraw method "${PAYPAL_IDS.withdrawMethod}" is still registered (the gateway id "${PAYPAL_IDS.gateway}" uses underscores and is a different string)`).toBe(true);

        const seed = await seedPayPalConnectedVendor(VENDOR_ID, PAYPAL_MERCHANTS.vendor1, { email: VENDOR1_EMAIL });
        expect(
            seed.receivable,
            'the connected vendor is re-seeded and payable again: PayPal::is_available() calls validate_cart_items(), which needs BOTH the merchant id and the separate receive-payment meta, so a vendor missing either reads as connected while the gateway never appears at checkout',
        ).toBe(true);

        log.success('PP-SET-25: gateway restored — ready, module active, withdraw method registered, vendor re-seeded.');
    }

    async setupAll2(): Promise<void> {
        await restoreWorkingConfiguration();
    }

    async teardownAll2(): Promise<void> {
        await restoreWorkingConfiguration();
    }

    async ppSet23({ browser }: { browser: Browser }): Promise<void> {
        test.skip(!hasCredentials, CREDENTIALS_SKIP);

        // Clear BOTH stored ids first: a value left behind by an earlier run would let this case
        // pass without a single webhook call being made.
        await dbUtils.deleteOptionRow([WEBHOOK_OPTION_SANDBOX, WEBHOOK_OPTION_LIVE]);
        expect(await readOptionOrNull(WEBHOOK_OPTION_SANDBOX), 'precondition: no sandbox webhook id is stored before the save').toBeNull();

        // Start in live mode so ticking sandbox is a genuine change, and the save therefore runs
        // process_admin_options() with test_mode freshly stored as "yes".
        await mergeGatewaySettings({ test_mode: 'no' });

        // Taken immediately before the save so the only log text examined is what THIS save provoked.
        const logBefore = await dokanLogTail();

        await withAdminSettings(browser, async (page, paypal) => {
            await paypal.setSandbox(true);
            await paypal.save();
            await expect(page.locator(ADMIN.payPalSandbox), 'the save landed in sandbox mode').toBeChecked();
        });

        const sandboxWebhookId = await readOptionOrNull(WEBHOOK_OPTION_SANDBOX);
        const liveWebhookId = await readOptionOrNull(WEBHOOK_OPTION_LIVE);
        log.info(`PP-SET-23: after the save, ${WEBHOOK_OPTION_SANDBOX}=${JSON.stringify(sandboxWebhookId)}, ${WEBHOOK_OPTION_LIVE}=${JSON.stringify(liveWebhookId)}.`);

        expect(
            liveWebhookId,
            `the LIVE webhook option must stay unwritten while the gateway is in sandbox mode. Helper::get_webhook_key() swaps on test_mode (Helper.php:847-849); writing the live key from a sandbox save would point a production marketplace's webhook registration at a sandbox endpoint`,
        ).toBeNull();

        /*
         * An empty option has exactly two causes and they are NOT equivalent:
         *   (a) the module never called PayPal at all — no webhook means no CHECKOUT.ORDER.* or
         *       refund event ever reaches the site and orders stall in pending forever. A defect.
         *   (b) PayPal was called and REFUSED the URL, because `home_url()` here is
         *       http://localhost:9999 and PayPal will not register a webhook it cannot reach.
         *       An environment limit of any non-public host, and nothing about the module.
         *
         * The option cannot tell them apart, so PayPal's own logged reason decides. Only (b) is
         * skipped, and only on PayPal's verbatim wording — anything else, including a silent
         * absence of any log line at all, stays a hard failure.
         */
        const registrationLog = (await dokanLogTail(logBefore.size)).text;
        const refusedTheUrl = UNREACHABLE_WEBHOOK_URL.test(registrationLog);

        if (!sandboxWebhookId && refusedTheUrl) {
            const issue = registrationLog.split('\n').find(line => UNREACHABLE_WEBHOOK_URL.test(line))?.trim() ?? '';
            test.skip(
                true,
                `PP-SET-23 is an ENVIRONMENT gap on this host, not a product failure, and the distinction is PayPal's own: the module did call PayPal — WebhookHandler::register_webhook() ran and logged its answer — and PayPal refused the URL it was offered. Verbatim: "${issue}". home_url() on this site is ${SERVER_URL.replace(/\/wp-json\/?$/, '')}, which PayPal cannot resolve from the public internet, so no webhook id can exist here however correct the module is. Registration is provable only from a publicly reachable host (an ngrok/tunnel URL as home_url, or a staging site). Every webhook HANDLER is covered independently of this by PP-WHK-01…25, which inject events directly.`,
            );
        }

        expect(
            typeof sandboxWebhookId === 'string' && sandboxWebhookId.length > 0,
            `PayPal::process_admin_options() calls WebhookHandler::register_webhook() on every save, which must store the created webhook id under ${WEBHOOK_OPTION_SANDBOX}, and no PayPal rejection of the webhook URL was logged for this save — so cause (b), an unreachable host, is ruled out and this is cause (a): the module did not register a webhook. No webhook means no CHECKOUT.ORDER.* or refund event ever reaches this site and orders stall in pending forever. Log text captured for this save: ${registrationLog.slice(-1500) || '(nothing was appended to wc-logs at all, so register_webhook() was very likely never reached)'}`,
        ).toBe(true);

        log.success('PP-SET-23: a sandbox webhook id was registered and the live twin was left untouched.');
    }
}
