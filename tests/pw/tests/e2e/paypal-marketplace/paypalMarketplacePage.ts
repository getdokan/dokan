import { Browser, Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { dbUtils } from '@utils/dbUtils';
import { selectors as paymentsSelectors } from '../payments/paymentsPage';
import {
    PAYPAL_GATEWAY_ID,
    PAYPAL_WITHDRAW_METHOD_ID,
    MODULE_PAYPAL_MARKETPLACE,
    adminAuth,
    vendorAuth,
    customerAuth,
    CUSTOMER_ID,
} from './helpers';

// The suite tsconfig is strict and does not pull @types/node.
declare const process: { env: Record<string, string | undefined> };

/**
 * Page object for the Dokan PayPal Marketplace module.
 *
 * Scope note (deliberate): credentials, gates and every server-side helper live in
 * `helpers.ts`. This file owns only what needs a browser. Nothing is duplicated between the
 * two — the Stripe Express page object carries its own key/gate constants because it has no
 * helpers.ts equivalent, and copying that shape here would have created two sources of truth
 * for the same env vars.
 */

/**
 * THREE identifiers, THREE different strings. This is the single most copy-paste-prone fact in
 * the module, so they are declared apart with the difference stated rather than being derived
 * from one another. Stripe Express's gateway id and withdraw-method id ARE identical, so a suite
 * written by mirroring it gets this wrong by default and the resulting failure looks like a
 * product bug rather than a test bug.
 */
export const PAYPAL_IDS = {
    /** Gateway id — UNDERSCORES. WooCommerce settings section, block checkout radio id. */
    gateway: PAYPAL_GATEWAY_ID,
    /** Withdraw method id — HYPHENS. Key inside `dokan_withdraw['withdraw_methods']`. */
    withdrawMethod: PAYPAL_WITHDRAW_METHOD_ID,
    /** Module slug — underscores, no `dokan_` prefix. Key inside `dokan_pro_active_modules`. */
    module: MODULE_PAYPAL_MARKETPLACE,
} as const;

export class PayPalMarketplacePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /* -------------------------------------------------------------- */
    /* URLs                                                            */
    /* -------------------------------------------------------------- */

    static readonly ADMIN_SETTINGS_URL = `/wp-admin/admin.php?page=wc-settings&tab=checkout&section=${PAYPAL_GATEWAY_ID}`;

    /**
     * Vendor onboarding screen. The slug carries the HYPHENATED withdraw-method id and has NO
     * `-edit` suffix — `payment-manage-paypal-edit` is Dokan Lite's legacy PayPal Standard
     * method, a different screen that only stores a payout email and performs no onboarding.
     * Built at `RegisterWithdrawMethods.php:110` and six other sites in the module.
     */
    static readonly VENDOR_SETTINGS_URL = `/dashboard/settings/payment-manage-${PAYPAL_WITHDRAW_METHOD_ID}`;

    /**
     * Vendor payment-method LIST screen — the "vendor withdraw settings" of PP-WDR-04 / PP-WDR-05.
     *
     * This is the screen that decides whether PayPal is offered at all: `Settings::load_payment_content()`
     * (dokan-lite Dashboard/Templates/Settings.php:276) renders it from `dokan_withdraw_get_active_methods()`
     * — the ADMIN-enabled list — and then splits those into connected / disconnected per vendor via
     * `Settings::is_seller_connected()` (:826). The manage screen above renders for any REGISTERED method
     * whether or not the admin enabled it, so it alone cannot answer "is PayPal offered to this vendor".
     */
    static readonly VENDOR_PAYMENT_METHODS_URL = '/dashboard/settings/payment';

    /**
     * Dokan → Settings → Withdraw Options, the screen that owns `dokan_withdraw['withdraw_methods']`.
     *
     * Deliberately the LEGACY Vue settings app at `page=dokan`. `page=dokan-dashboard` is the new React
     * admin app and carries no withdraw-method toggles at all, so pointing this at the new slug would
     * render a screen with nothing to click and fail as "toggle not found".
     */
    static readonly ADMIN_WITHDRAW_OPTIONS_URL = '/wp-admin/admin.php?page=dokan#/settings';

    /* -------------------------------------------------------------- */
    /* Selectors                                                       */
    /* -------------------------------------------------------------- */

    /**
     * Admin selectors are REUSED from the payments suite rather than re-derived. That set is
     * complete for this gateway and already exercised by `payments.spec.ts`, so a field rename
     * now breaks both suites at once instead of passing silently in one.
     */
    static readonly admin = paymentsSelectors.admin.payments.paypalMarketPlace;

    /**
     * Vendor-side selectors, harvested live on 2026-07-31 against dokan-pro 5.0.9.
     *
     * The connect control is labelled **"Sign Up"**, not "Connect" — worth pinning, because the
     * module's own error copy and the docs both say "Connect", and a `getByRole('button', {name:
     * 'Connect'})` matches nothing here. It is also an `<a href="javascript:void(0)">`, not a
     * button, so a role-based button query fails twice over.
     */
    static readonly vendor = {
        /**
         * `#vendor_paypal_email_address` (vendor-settings-payment.php:42) rather than the class it
         * also carries: `.dokan-form-control` is Dokan's generic input class and matches every other
         * field the dashboard renders, so a class-based match would silently drift onto a neighbouring
         * input the day the template gains one. The id is the module's own and is unique on the page.
         */
        email: '#vendor_paypal_email_address',
        connect: "a:has-text('Sign Up')",
        /**
         * Disconnect is an ANCHOR (`<a class="dokan-btn dokan-btn-danger dokan-btn-theme">`,
         * vendor-settings-payment.php:6-8), never a `<button>`. The previous
         * `//button[normalize-space()="Disconnect"]` could not match on any site state, so a spec
         * asserting its absence would have passed for a connected vendor too — a negative that can
         * never fail is worse than no assertion. No spec used it before PP-WDR, so nothing else moves.
         */
        disconnect: 'a.dokan-btn-danger:has-text("Disconnect")',
        /** Wraps all three template branches (connected / email-unconfirmed / sign-up), so it is the safe render anchor. */
        container: '.dokan-paypal-marketplace-container',
        /** Carries "Merchant ID: <id>" and the "account is connected" copy — both only in the connected branch. */
        connectedAlert: '.dokan-paypal-marketplace-container .dokan-alert-success',
        updateSettings: 'input.dokan-btn',
        successMessage: '.dokan-alert.dokan-alert-success p',
    } as const;

    /**
     * Vendor payment-method LIST selectors, read off `dokan-lite/templates/settings/payment.php`.
     *
     * The connected list and the "Add Payment Method" dropdown both link to the same method slug, so
     * they are told apart by CONTAINER, not by href alone: a connected method links to the `-edit`
     * sub-route from `.dokan-payment-settings-summary > ul` (payment.php:73), a disconnected one links
     * to the bare slug from inside `#vendor-payment-method-drop-down` (payment.php:26).
     */
    static readonly vendorPaymentList = {
        wrapper: '#dokan-payment-methods-listing-wrapper',
        addMethodTrigger: '#toggle-vendor-payment-method-drop-down',
        /** Connected: the "Manage" link. The `-edit` suffix is what distinguishes it from the dropdown entry. */
        manageLink: `.dokan-payment-settings-summary > ul a[href*="payment-manage-${PAYPAL_WITHDRAW_METHOD_ID}-edit"]`,
        /** Disconnected: the "Direct to …" entry in the Add Payment Method dropdown. */
        addMethodLink: `#vendor-payment-method-drop-down a[href*="payment-manage-${PAYPAL_WITHDRAW_METHOD_ID}"]`,
        /**
         * ANY reference to this method anywhere on the list screen. Used by PP-WDR-03, where "no longer
         * offered" has to mean absent from BOTH lists rather than merely moved between them.
         *
         * Lite's own legacy PayPal Standard method is `payment-manage-paypal`, which does not contain
         * this hyphenated slug, so it cannot produce a false match.
         */
        anyLink: `a[href*="payment-manage-${PAYPAL_WITHDRAW_METHOD_ID}"]`,
    } as const;

    /**
     * Dokan → Settings → Withdraw Options toggles.
     *
     * The multicheck renders one `label.switch` per method wrapping `input.toogle-checkbox` whose
     * `value` is the METHOD KEY (dokan-lite `src/admin/components/Fields.vue:189` →
     * `Switches.vue:3`). Note the misspelling `toogle-checkbox` — it is the product's, not a typo here.
     * The value carried is therefore the HYPHENATED withdraw-method id; the underscored gateway id
     * matches no toggle on this screen.
     */
    static readonly adminWithdraw = {
        navTab: 'div.nav-tab:has(div.nav-title:text-is("Withdraw Options"))',
        save: '#submit',
        methodToggleInput: (methodKey: string) => `.multicheck_fields input.toogle-checkbox[value="${methodKey}"]`,
        methodToggleSwitch: (methodKey: string) => `.multicheck_fields label.switch:has(input[value="${methodKey}"])`,
    } as const;

    /* -------------------------------------------------------------- */
    /* Admin — gateway settings                                        */
    /* -------------------------------------------------------------- */

    async gotoGatewaySettings(): Promise<void> {
        await this.page.goto(PayPalMarketplacePage.ADMIN_SETTINGS_URL, { waitUntil: 'domcontentloaded' });
        await expect(this.page.locator(PayPalMarketplacePage.admin.enableDisablePayPalMarketplace)).toBeVisible();
    }

    /**
     * The settings screen is the CLASSIC WooCommerce form (`#mainform` + `#_wpnonce`), not the
     * React settings app, so ordinary form interaction works.
     *
     * Save is rendered DISABLED until the form is dirtied. That does not force a UI bypass:
     * Playwright's `fill()` / `check()` dispatch the native `input` / `change` events the page
     * listens for, which enables it. Verified live — the settings spec drives the real UI rather
     * than writing the option behind it. `selectOption({ force: true })` dispatches the same pair,
     * which is how the two `wc-enhanced-select` dropdowns are driven despite select2 hiding the
     * real `<select>` behind a rendered span.
     *
     * `timeout` covers the saved-message wait only, and defaults well above Playwright's 15s
     * expect budget on purpose: `PayPal::process_admin_options()` runs `register_webhook()` on
     * every save, which is a LIVE round trip to PayPal (list webhooks, delete stale ones, create
     * one). On a slow network that alone can outlast 15s, and the resulting failure would look
     * like "settings did not save" when the settings had in fact saved.
     */
    async save(timeout = 60_000): Promise<void> {
        const saveButton = this.page.locator(PayPalMarketplacePage.admin.paypalMarketPlaceSaveChanges);
        await expect(saveButton).toBeEnabled();
        await saveButton.click();
        // WooCommerce's OWN save marker is printed by WC_Admin_Settings::show_messages() at
        // class-wc-admin-settings.php:161 as `<div id="message" class="updated inline">` (a failed
        // save prints `#message.error` at :157 instead, so a failure cannot satisfy this wait).
        //
        // The `.inline` half is load-bearing, learned from a live failure rather than reasoned:
        // `#message.updated` ALONE is ambiguous, because a WooCommerce Bookings promo notice renders
        // as `<div id="message" class="updated woocommerce-message">` on the same screen. That made
        // the locator resolve to two elements and raise a strict-mode violation on saves that had in
        // fact worked — it failed PP-SET-02 and PP-SET-23 on 2026-07-31.
        //
        // A generic `.notice-success` is deliberately NOT accepted here either: it matches any
        // unrelated admin notice, including one already on the pre-navigation DOM, which would let
        // save() return before the form POST completed and hand the following option read a stale
        // value.
        await expect(this.page.locator('#message.updated.inline')).toBeVisible({ timeout });
    }

    async setEnabled(enabled: boolean): Promise<void> {
        await this.page.setChecked(PayPalMarketplacePage.admin.enableDisablePayPalMarketplace, enabled);
    }

    /**
     * The sandbox toggle is **`test_mode`** — not `sandbox`, not `testmode` (`Helper.php:142`).
     * Asserting on a `sandbox` key silently never matches, so the selector constant is named for
     * the real key.
     */
    async setSandbox(enabled: boolean): Promise<void> {
        await this.page.setChecked(PayPalMarketplacePage.admin.payPalSandbox, enabled);
    }

    async fillSandboxCredentials(creds: { partnerId: string; clientId: string; clientSecret: string }): Promise<void> {
        await this.page.fill(PayPalMarketplacePage.admin.payPalMerchantId, creds.partnerId);
        await this.page.fill(PayPalMarketplacePage.admin.sandboxClientId, creds.clientId);
        await this.page.fill(PayPalMarketplacePage.admin.sandBoxClientSecret, creds.clientSecret);
    }

    /* -------------------------------------------------------------- */
    /* Vendor — onboarding                                             */
    /* -------------------------------------------------------------- */

    async gotoVendorPaymentSettings(): Promise<void> {
        await this.page.goto(PayPalMarketplacePage.VENDOR_SETTINGS_URL, { waitUntil: 'domcontentloaded' });
        // Dokan Pro 5.0's vendor announcement modal covers the whole dashboard and swallows clicks.
        await closeAnnouncementModal(this.page);
        // The container wraps every branch of the template, so waiting on it proves the module's own
        // markup rendered without presuming which branch (connected / unconfirmed / sign-up) applies.
        await expect(this.page.locator(PayPalMarketplacePage.vendor.container)).toBeVisible({ timeout: 30_000 });
    }

    /**
     * Vendor payment-method LIST screen.
     *
     * Anchored on the listing wrapper rather than on any PayPal-specific node, because both PP-WDR-04
     * (PayPal present) and PP-WDR-03 / PP-WDR-05 (PayPal absent from a given list) need the same proof
     * that the screen finished rendering. Without that anchor an absence assertion could not tell
     * "the admin disabled the method" from "the page had not painted yet".
     */
    async gotoVendorPaymentMethods(): Promise<void> {
        await this.page.goto(PayPalMarketplacePage.VENDOR_PAYMENT_METHODS_URL, { waitUntil: 'domcontentloaded' });
        await closeAnnouncementModal(this.page);
        await expect(this.page.locator(PayPalMarketplacePage.vendorPaymentList.wrapper)).toBeVisible({ timeout: 30_000 });
    }

    /* -------------------------------------------------------------- */
    /* Admin — Dokan settings → Withdraw Options                       */
    /* -------------------------------------------------------------- */

    async gotoWithdrawOptions(): Promise<void> {
        await this.page.goto(PayPalMarketplacePage.ADMIN_WITHDRAW_OPTIONS_URL, { waitUntil: 'domcontentloaded' });
        await expect(this.page.locator('.nav-tab').first()).toBeVisible({ timeout: 30_000 });
        await this.page.locator(PayPalMarketplacePage.adminWithdraw.navTab).click();
        // `attached`, not `visible`: the switch input is visually replaced by its slider span and is
        // hidden by CSS, so a visibility wait would time out on a perfectly rendered toggle.
        await this.page
            .locator(PayPalMarketplacePage.adminWithdraw.methodToggleInput(PAYPAL_IDS.withdrawMethod))
            .waitFor({ state: 'attached', timeout: 30_000 });
    }

    /**
     * Flip the PayPal withdraw-method toggle and save, through the real admin form.
     *
     * Clicks the `label.switch` rather than the input: the input is CSS-hidden behind its slider, and
     * the Vue component binds its handler to the label's click.
     *
     * The save is awaited on the `dokan_save_settings` admin-ajax POST for the `dokan_withdraw` section
     * (`dokan-lite/includes/Admin/Settings.php:148`), not on a toast. That request is the write itself,
     * so returning before it lands would hand the caller's option read a stale value and report a save
     * that never happened.
     *
     * Note what the product does on that write: `save_settings_value()` calls
     * `update_option( 'dokan_withdraw', $posted )` — a WHOLESALE replace of the option with whatever the
     * loaded form carried. It survives the other methods only because the form was populated with them,
     * which is exactly why every caller here asserts the stock methods afterwards instead of assuming.
     *
     * Returns false when the toggle already held the requested state, so a caller can tell a real state
     * change from a no-op instead of "proving" a state it never wrote.
     */
    async setWithdrawMethodEnabled(enabled: boolean): Promise<boolean> {
        await this.gotoWithdrawOptions();

        const toggle = this.page.locator(PayPalMarketplacePage.adminWithdraw.methodToggleInput(PAYPAL_IDS.withdrawMethod));
        if ((await toggle.isChecked()) === enabled) {
            return false;
        }

        await this.page.locator(PayPalMarketplacePage.adminWithdraw.methodToggleSwitch(PAYPAL_IDS.withdrawMethod)).click();

        const saved = this.page.waitForResponse(
            res =>
                res.url().includes('admin-ajax.php') &&
                res.request().method() === 'POST' &&
                (res.request().postData() ?? '').includes('action=dokan_save_settings') &&
                (res.request().postData() ?? '').includes('section=dokan_withdraw'),
            { timeout: 60_000 }
        );
        await this.page.locator(PayPalMarketplacePage.adminWithdraw.save).click();

        // Turning a withdraw method OFF opens a blocking SweetAlert2 consent dialog before the POST is
        // ever sent — "Withdraw Method Changed … send an announcement to vendors?" — with
        // `allowOutsideClick: false` and `allowEscapeKey: false` (Settings.vue:446-455). It fires only
        // when `getDifference()` (Settings.vue:481) finds a key whose value went from set to '', i.e. on
        // a REMOVAL; enabling a method produces an empty diff and no dialog at all. Answering "Save only"
        // (the CANCEL button) saves without messaging every vendor on the site.
        //
        // The catch cannot hide a failure: if the dialog were required and never appeared, the save POST
        // would never be sent and the `saved` wait below fails the test loudly.
        const consent = this.page.locator('button.swal2-cancel');
        try {
            await consent.waitFor({ state: 'visible', timeout: 5_000 });
            await consent.click();
        } catch {
            // No consent dialog — this save removed no method.
        }

        await saved;
        return true;
    }

    /**
     * Start the hosted partner-referral flow and return the PayPal-owned page it opens.
     *
     * Dokan calls `create_partner_referral()` server-side FIRST and only then opens the returned
     * `action_url`, so a partner app lacking the referral scope fails before any window appears —
     * the vendor sees "Connect to PayPal error" and no popup, which reads as a broken button.
     *
     * The consent click itself is left to the caller: no PayPal API grants a seller's consent, so
     * this is the one step in the whole suite with no programmatic equivalent.
     */
    async startConnect(paypalEmail: string): Promise<Page> {
        await this.page.fill(PayPalMarketplacePage.vendor.email, paypalEmail);
        const [popup] = await Promise.all([
            this.page.waitForEvent('popup'),
            this.page.click(PayPalMarketplacePage.vendor.connect),
        ]);
        await popup.waitForLoadState('domcontentloaded');
        return popup;
    }

    /* -------------------------------------------------------------- */
    /* Checkout — availability                                         */
    /* -------------------------------------------------------------- */

    async addProductToCart(productId: string | number): Promise<void> {
        await this.page.goto(`/?p=${productId}&add-to-cart=${productId}`, { waitUntil: 'domcontentloaded' });
    }

    /**
     * WooCommerce Checkout BLOCK selectors.
     *
     * The gateway is matched on the radio input id — `#radio-control-wc-payment-method-options-`
     * plus the gateway id, UNDERSCORES — never on the visible label, because that label is the
     * admin-editable `title` setting which the PP-XSS cases deliberately overwrite.
     */
    static readonly block = {
        url: '/checkout/',
        cartUrl: '/cart/',
        gatewayRadio: `#radio-control-wc-payment-method-options-${PAYPAL_GATEWAY_ID}`,
        /** Alias of `gatewayRadio`, kept because the XSS specs address it as `radio`. */
        radio: `#radio-control-wc-payment-method-options-${PAYPAL_GATEWAY_ID}`,
        label: `label[for="radio-control-wc-payment-method-options-${PAYPAL_GATEWAY_ID}"]`,
        /** Printed by the module's own block component, `assets/src/blocks/payment-support/index.tsx:66`. */
        description: '.dokan-paypal-marketplace-payment-description',
        /** Rendered by the checkout block whether or not any payment method is available. */
        placeOrder: '.wc-block-components-checkout-place-order-button',
        error: '.wc-block-components-notice-banner.is-error',
    } as const;

    /** WooCommerce cart BLOCK. `.wp-block-woocommerce-cart` is the server-rendered wrapper. */
    static readonly cart = {
        url: '/cart/',
        wrapper: '.wp-block-woocommerce-cart',
        items: '.wc-block-cart-items__row',
        empty: '.wp-block-woocommerce-empty-cart-block',
    } as const;

    /**
     * Classic `[woocommerce_checkout]` shortcode page. The union of the per-spec `CLASSIC` /
     * `CHECKOUT` / `CLASSIC_CHECKOUT` maps that previously sat in eleven spec files — every one
     * was a subset of this with identical values, so merging loses nothing and a markup change
     * is now a one-line fix instead of an eleven-file sweep.
     */
    static readonly classic = {
        url: toPath('classic-checkout'),
        form: 'form.checkout',
        placeOrder: '#place_order',
        radio: `#payment_method_${PAYPAL_GATEWAY_ID}`,
        /**
         * The rendered label (`checkout/payment-method.php:25`), which is what a shopper actually
         * clicks. Needed as well as the radio because WooCommerce HIDES the radio input outright
         * when the gateway is the only available method (`assets/js/frontend/checkout.js:228-231`).
         */
        label: `label[for="payment_method_${PAYPAL_GATEWAY_ID}"]`,
        box: `.payment_box.payment_method_${PAYPAL_GATEWAY_ID}`,
        /** jQuery blockUI's overlay, thrown over the payment region for every `update_checkout`. */
        blockOverlay: '.blockOverlay',
        paymentMethods: '#payment ul.wc_payment_methods',
        notices: '.woocommerce-NoticeGroup, .woocommerce-error, .woocommerce-message',
        couponToggle: '.woocommerce-form-coupon-toggle a.showcoupon',
        couponForm: 'form.checkout_coupon',
        couponInput: '#coupon_code',
        couponApply: 'form.checkout_coupon button[name="apply_coupon"]',
        orderTotal: '.order-total .woocommerce-Price-amount',
        createAccount: '#createaccount',
        accountPassword: '#account_password',
        terms: '#terms',
        /** The module's smart-button mount point (`Cart/CartHandler.php:272`). */
        paypalButtonContainer: '#paypal-button-container',
        paypalButtonFrame: '#paypal-button-container iframe',
        sdkScript: 'script[src*="paypal.com/sdk/js"]',
        billing: {
            firstName: '#billing_first_name',
            lastName: '#billing_last_name',
            email: '#billing_email',
            phone: '#billing_phone',
            address1: '#billing_address_1',
            city: '#billing_city',
            postcode: '#billing_postcode',
            country: '#billing_country',
            state: '#billing_state',
        },
    } as const;

    /** Unbranded Advanced Card (UCC) fields. Union of the 3DS and UCC spec maps. */
    static readonly ucc = {
        container: '.card_container',
        cardNumber: '#dpm_card_number',
        cardExpiry: '#dpm_card_expiry',
        cvv: '#dpm_cvv',
        nameOnCard: '#dpm_name_on_card',
        contingencyLightbox: '#payments-sdk__contingency-lightbox',
        contingencyFrame: '#payments-sdk__contingency-lightbox iframe',
        unbranded: '.unbranded_checkout',
        unbrandedButton: '#pay_unbranded_order',
        /**
         * The PayPal JS SDK tag. `CartHandler::add_bn_code_to_script()` rewrites the whole tag and
         * sets `id="dokan_paypal_sdk-js"` explicitly (`Cart/CartHandler.php:230-235`), so this id is
         * the module's own output and not a WordPress default that could drift.
         */
        sdkScript: 'script#dokan_paypal_sdk-js',
    } as const;

    /** Braintree-hosted iframe inputs, addressed through their UCC container. */
    static readonly hostedField = {
        number: { container: '#dpm_card_number', input: 'input[data-braintree-name="number"], input#credit-card-number' },
        expiry: { container: '#dpm_card_expiry', input: 'input[data-braintree-name="expirationDate"], input#expiration' },
        cvv: { container: '#dpm_cvv', input: 'input[data-braintree-name="cvv"], input#cvv' },
    } as const;

    /** Gateway settings inputs, keyed off the underscore gateway id. */
    static readonly settingsField = {
        disbursementMode: `#woocommerce_${PAYPAL_GATEWAY_ID}_disbursement_mode`,
        disbursementDelayPeriod: `#woocommerce_${PAYPAL_GATEWAY_ID}_disbursement_delay_period`,
        buttonType: `#woocommerce_${PAYPAL_GATEWAY_ID}_button_type`,
        uccMode: `#woocommerce_${PAYPAL_GATEWAY_ID}_ucc_mode`,
        liveClientId: `#woocommerce_${PAYPAL_GATEWAY_ID}_app_user`,
        liveClientSecret: `#woocommerce_${PAYPAL_GATEWAY_ID}_app_pass`,
        /** Deliberately expected to match NOTHING — PP-SET-24. */
        maxError: `[id*="${PAYPAL_GATEWAY_ID}_max_error"]`,
        partnerIdAny: `[id*="${PAYPAL_GATEWAY_ID}_partner_id"]`,
        testPartnerIdAny: `[id*="${PAYPAL_GATEWAY_ID}_test_partner_id"]`,
    } as const;

    /** WooCommerce order-tracking form (`[woocommerce_order_tracking]`). */
    static readonly tracking = {
        slug: 'order-tracking',
        url: toPath('order-tracking'),
        orderId: '#orderid',
        email: '#order_email',
        submit: 'button[name="track"]',
        info: 'p.order-info',
        number: 'mark.order-number',
        status: 'mark.order-status',
        error: '.woocommerce-error',
    } as const;

    /**
     * Selectors that were inline string literals at a single `page.locator(...)` call site.
     * Grouped here so a markup change is a one-file edit; each is still used exactly once.
     */
    static readonly misc = {
        /** WooCommerce gateway settings form (admin). */
        settingsForm: '#mainform',
        /** Every gateway-owned input/select/textarea on that form — used to prove a save round-trips. */
        settingsFields:
            '#mainform input[id^="woocommerce_dokan_paypal_marketplace_"], #mainform select[id^="woocommerce_dokan_paypal_marketplace_"], #mainform textarea[id^="woocommerce_dokan_paypal_marketplace_"]',
        settingsDisbursementMode: '#woocommerce_dokan_paypal_marketplace_disbursement_mode',
        settingsInlineError: '.inline.error',
        /** Classic checkout payment-method list rows and their radio inputs. */
        paymentMethodRow: '.wc_payment_method',
        paymentMethodInput: '.wc_payment_method input[name="payment_method"]',
        /** Block checkout payment step wrapper (either the block or its server-rendered parent). */
        blockPaymentStep: '.wc-block-checkout__payment-method, .wp-block-woocommerce-checkout-payment-block',
        cartDiscount: '.cart-discount',
        /** wp-admin order screen data panel. */
        adminOrderData: '#woocommerce-order-data, #order_data',
        adminListTable: '.wp-list-table',
        /** Vendor dashboard onboarding + disconnect controls. */
        vendorConnectButton: '#paypal_connect_button',
        vendorDisconnectLink: 'a[href*="dokan-paypal-marketplace-disconnect"]',
        vendorPanelAlert: '.dokan-panel-alert',
        vendorAlertSuccess: '.dokan-alert.dokan-alert-success',
        vendorAlertDanger: '.dokan-alert.dokan-alert-danger:not(.dokan-panel-alert)',
    } as const;

    /**
     * PayPal's own hosted approval UI, as addressed by the disbursement spec.
     *
     * Deliberately NOT merged into the module-level `PAYPAL_HOSTED_UI` below, even though the two
     * overlap: that set carries richer multi-selector fallbacks and splits `challenge` into
     * `captcha` + `otp`. Adopting it here would be an unverified behaviour change to a money spec
     * that has never executed. Reconcile the two once the disbursement run has a baseline.
     */
    static readonly paypalHosted = {
        email: '#email',
        next: '#btnNext',
        password: '#password',
        login: '#btnLogin',
        /** "Complete Purchase" / "Pay Now" on the review screen. */
        payNow: '#payment-submit-btn',
        /** One-touch / "stay logged in" interstitial. */
        notNow: '#notNowLink, [data-testid="not-now"]',
        challenge: 'iframe[src*="captcha"], iframe[title*="captcha" i], #captcha, #recaptcha, [data-testid="challenge"], #app-otp, #otpCode',
    } as const;

    /** Dokan → Settings → Vendor Subscription (legacy Vue settings app). */
    static readonly subscriptionSettings = {
        /** Was `//div[@class="nav-title" and contains(text(),"Vendor Subscription")]`; XPath is banned
         *  by the skill's locator rules, and `div.nav-title` + `:has-text` is the same element. */
        vendorSubscriptionMenu: 'div.nav-title:has-text("Vendor Subscription")',
        noOfDays: '#dokan_product_subscription\\[no_of_days_before_mail\\]',
        productStatus: '#dokan_product_subscription\\[product_status_after_end\\]',
    } as const;

    /**
     * Navigate to the block checkout and wait until it has actually HYDRATED.
     *
     * The checkout block is a React app: nothing inside it — payment methods included — exists in
     * the DOM at `domcontentloaded`. Counting the gateway radio at that moment reports "absent"
     * on a perfectly working site, which is the fake-green shape every negative case in this
     * module is at risk of. The place-order button is the anchor because the block renders it even
     * when NO payment method is available, so waiting on it distinguishes "not offered" from
     * "not rendered yet" without presupposing the answer.
     *
     * Two attempts, mirroring the proven Stripe Express helper: on a loaded Docker host the block
     * occasionally overruns a single 45s hydration budget, and one reload is cheaper than a flake.
     *
     * An EMPTY cart makes this THROW rather than return, because WooCommerce redirects `/checkout/`
     * to the cart page and the button never appears — a silent `false` there would be an
     * availability answer derived from an empty cart.
     */
    async gotoBlockCheckout(): Promise<void> {
        let lastError: unknown;
        for (let attempt = 1; attempt <= 2; attempt++) {
            await this.page.goto(PayPalMarketplacePage.block.url, { waitUntil: 'domcontentloaded' });
            await this.page.waitForLoadState('networkidle').catch(() => undefined);
            try {
                await this.page.locator(PayPalMarketplacePage.block.placeOrder).waitFor({ state: 'visible', timeout: 45_000 });
                return;
            } catch (err) {
                lastError = err;
            }
        }
        throw new Error(
            `the checkout block never hydrated at ${PayPalMarketplacePage.block.url} after two attempts, so no statement about payment-method availability can be made from this page. ` +
                'The usual cause is an EMPTY cart — WooCommerce then redirects /checkout/ to the cart page and the place-order button never renders. ' +
                `Underlying wait failure: ${String(lastError)}`
        );
    }

    /**
     * Whether the gateway is actually offered at block checkout.
     *
     * Availability is the assertion most at risk of passing for the wrong reason: `is_available()`
     * requires `is_ready()` AND a per-vendor `validate_cart_items()` pass, so a negative
     * ("hidden for an unconnected vendor") is trivially true on an unconfigured site. Any spec
     * asserting absence must first prove presence, or prove `is_ready === true` via the
     * mu-plugin `/status` route in the same test.
     *
     * Matched on the radio input id rather than the label text, because the label is the
     * admin-editable `title` setting and the XSS cases deliberately change it.
     */
    async isGatewayOfferedAtBlockCheckout(): Promise<boolean> {
        await this.gotoBlockCheckout();
        return (await this.page.locator(PayPalMarketplacePage.block.gatewayRadio).count()) > 0;
    }
}

/* ------------------------------------------------------------------ */
/* Role helpers — one browser context per actor                        */
/* ------------------------------------------------------------------ */

export async function withCustomer<T>(browser: Browser, body: (page: Page, paypal: PayPalMarketplacePage) => Promise<T>): Promise<T> {
    const ctx = await browser.newContext({ storageState: customerAuth });
    const page = await ctx.newPage();
    try {
        return await body(page, new PayPalMarketplacePage(page));
    } finally {
        await page.close();
        await ctx.close();
    }
}

export async function withAdmin<T>(browser: Browser, body: (page: Page, paypal: PayPalMarketplacePage) => Promise<T>): Promise<T> {
    const ctx = await browser.newContext({ storageState: adminAuth });
    const page = await ctx.newPage();
    try {
        return await body(page, new PayPalMarketplacePage(page));
    } finally {
        await page.close();
        await ctx.close();
    }
}

/**
 * `storageState` is the LAST parameter and defaults to `vendorAuth`, so the callers that never
 * threaded one keep calling `withVendor(browser, body)` unchanged. The one caller that does thread it
 * (Refund's `vendorRefundRequest`) passes it third.
 */
export async function withVendor<T>(
    browser: Browser,
    body: (page: Page, paypal: PayPalMarketplacePage) => Promise<T>,
    storageState: string = vendorAuth
): Promise<T> {
    const ctx = await browser.newContext({ storageState });
    const page = await ctx.newPage();
    try {
        return await body(page, new PayPalMarketplacePage(page));
    } finally {
        await page.close();
        await ctx.close();
    }
}

/** Run a body against a fresh ADMIN page already parked on the gateway settings screen. */
export async function withAdminSettings<T>(browser: Browser, body: (page: Page, paypal: PayPalMarketplacePage) => Promise<T>): Promise<T> {
    const ctx = await browser.newContext({ storageState: adminAuth });
    const page = await ctx.newPage();
    try {
        const paypal = new PayPalMarketplacePage(page);
        await paypal.gotoGatewaySettings();
        return await body(page, paypal);
    } finally {
        await page.close();
        await ctx.close();
    }
}

/* ------------------------------------------------------------------ */
/* Classic checkout — cart, gateway selection, submission              */
/* ------------------------------------------------------------------ */

/** Single-site persistent-cart user meta — the exact row `dbUtils.clearCustomerCart()` deletes. */
const PERSISTENT_CART_META = '_woocommerce_persistent_cart_1';

/** Classic `[woocommerce_checkout]` selectors shared by every classic-path spec. */
const CLASSIC = {
    radio: `#payment_method_${PAYPAL_GATEWAY_ID}`,
    label: `label[for="payment_method_${PAYPAL_GATEWAY_ID}"]`,
    blockOverlay: '.blockOverlay',
} as const;

/**
 * Wait until the classic checkout is not mid-`update_checkout`.
 *
 * WooCommerce covers `.woocommerce-checkout-payment` and the review table with a jQuery blockUI
 * overlay for the whole duration of that AJAX round trip (`assets/js/frontend/checkout.js:699-707`),
 * and fires one on page load from `init_checkout`. Anything clicked inside that region while the
 * overlay is up is clicked on the OVERLAY — `check({ force: true })` skips the hit-target check and
 * therefore hits it silently.
 *
 * `networkidle` first, because at `domcontentloaded` the overlay has usually not been raised yet, and
 * waiting only for its absence would return instantly, before the cycle it is meant to wait out.
 *
 * Both waits are best-effort anchors, never assertions.
 */
export async function waitForCheckoutSettled(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.locator(CLASSIC.blockOverlay).first().waitFor({ state: 'detached', timeout: 30_000 }).catch(() => undefined);
}

/**
 * Select PayPal Marketplace on the classic checkout and PROVE the selection took.
 *
 * `locator(radio).check({ force: true })` cannot do this job on this page — the run on 2026-08-01
 * failed on exactly that with "Clicking the checkbox did not change its state". Two product
 * behaviours defeat it: WooCommerce hides the radio input outright when the gateway is the only
 * available method (`checkout.js:228-231`), so there is no box to click; and every `update_checkout`
 * cycle blocks the payment region with a blockUI overlay, which `force: true` happily clicks instead.
 *
 * So: wait the cycle out, click the LABEL (the control a shopper uses), and assert `toBeChecked()`.
 * That assertion is load-bearing rather than defensive — an unselected radio means
 * `WC_Checkout::process_checkout()` answers "Invalid payment method" and the case fails far away from
 * its real cause.
 *
 * `messages.availability` is OPTIONAL and has NO default: omitting it skips the leading
 * `toBeAttached` entirely, which is what reproduces the XSS spec's copy exactly. A default message
 * there would hand one file's diagnosis to another, which is the class of copy-error this shared
 * module exists to remove. `messages.selected` is required for the same reason.
 */
export async function selectClassicPayPal(page: Page, messages: { availability?: string; selected: string }): Promise<void> {
    const radio = page.locator(CLASSIC.radio);
    if (messages.availability !== undefined) {
        await expect(radio, messages.availability).toBeAttached({ timeout: 60_000 });
    }

    await waitForCheckoutSettled(page);
    if (!(await radio.isChecked())) {
        await page.locator(CLASSIC.label).first().click();
        await waitForCheckoutSettled(page);
    }

    await expect(radio, messages.selected).toBeChecked({ timeout: 30_000 });
}

/**
 * Everything `PayPal::process_payment()` can answer a classic checkout POST with
 * (PaymentMethods/PayPal.php:346-354), plus this suite's own `__error` slot.
 *
 * EVERY field is optional and the type is the UNION of the six local result interfaces, so each spec
 * can keep its own NAME as a type alias and every existing read, cast and annotation still compiles.
 */
export interface ClassicCheckoutResult {
    result?: string;
    id?: number | string;
    order_id?: number | string;
    paypal_order_id?: string;
    paypal_redirect_url?: string;
    redirect?: string;
    success_redirect?: string;
    messages?: string;
    message?: string;
    __error?: string;
}

/**
 * Place the order exactly as `paypal-checkout.js` `set_order()` does: POST the serialized
 * `form.checkout` to `wc_checkout_params.checkout_url`.
 *
 * Clicking `#place_order` is not an option while `button_type` is `smart` — the module animates that
 * button to `display: none` and submits from inside the PayPal SDK's `createOrder` callback
 * (assets/src/js/paypal-checkout.js:36-44). Serializing the rendered form keeps the real
 * `woocommerce-process-checkout-nonce` and the real address fields, so `WC_Checkout::process_checkout()`
 * runs in full and `PayPal::process_payment()` builds the purchase units for real.
 */
export async function submitClassicCheckout(page: Page): Promise<ClassicCheckoutResult> {
    const raw = await page.evaluate(async () => {
        const w = window as unknown as { jQuery?: any; wc_checkout_params?: { checkout_url?: string } };
        const checkoutUrl = w.wc_checkout_params?.checkout_url;
        if (typeof w.jQuery !== 'function' || !checkoutUrl) {
            return { __error: 'jQuery or wc_checkout_params.checkout_url is missing, so the classic checkout page did not load WooCommerce\'s own checkout script' };
        }
        const form = w.jQuery('form.checkout');
        if (!form.length) {
            return { __error: 'form.checkout is not on the page — the [woocommerce_checkout] shortcode rendered nothing, which it also does for an empty cart' };
        }
        try {
            return (await w.jQuery.ajax({ type: 'POST', url: checkoutUrl, data: form.serialize(), dataType: 'json' })) as Record<string, unknown>;
        } catch (error) {
            const jqxhr = error as { status?: number; responseText?: string };
            return { __error: `checkout POST failed (HTTP ${String(jqxhr?.status ?? '?')}): ${String(jqxhr?.responseText ?? error).slice(0, 400)}` };
        }
    });

    return raw as ClassicCheckoutResult;
}

/**
 * Put exactly `lines` in the customer's cart, and PROVE each one landed there before anything reads
 * the checkout.
 *
 * The proof is taken from the database rather than the page: WooCommerce writes
 * `_woocommerce_persistent_cart_1` from the `woocommerce_add_to_cart` action, which fires only on a
 * SUCCESSFUL add, so its contents are evidence the product is really in this customer's cart. Without
 * that check an add-to-cart that quietly failed would leave an empty cart, and an empty cart offers no
 * payment methods at all — every "gateway not offered" assertion would then pass for the wrong
 * reason, and every positive one would fail pointing at the gateway.
 *
 * `cartProofMessage` is REQUIRED and has no default: each caller's message names what a missed add
 * would make ITS case a statement about, and a generic default would erase exactly that.
 *
 * `alwaysSendQuantity` reproduces the split spec's URL byte for byte — it navigates to
 * `&quantity=<n>` on every line, including the ones that carry no quantity. It exists so that path
 * needs no equivalence argument about `WC_Form_Handler::add_to_cart_action()` defaulting an absent
 * quantity to 1.
 */
export async function stockCartWithProof(
    target: PayPalMarketplacePage | Page,
    lines: ReadonlyArray<string | { productId: string; quantity?: number }>,
    cartProofMessage: (productId: string) => string,
    options?: { alwaysSendQuantity?: boolean }
): Promise<void> {
    const paypal = target instanceof PayPalMarketplacePage ? target : new PayPalMarketplacePage(target);
    const normalised = lines.map(line => (typeof line === 'string' ? { productId: line, quantity: undefined } : line));

    await dbUtils.clearCustomerCart(CUSTOMER_ID);
    for (const line of normalised) {
        if (!options?.alwaysSendQuantity && line.quantity === undefined) {
            await paypal.addProductToCart(line.productId);
        } else {
            await paypal.page.goto(`/?p=${line.productId}&add-to-cart=${line.productId}&quantity=${line.quantity ?? 1}`, { waitUntil: 'domcontentloaded' });
        }
    }

    const persistentCart = (await dbUtils.getUserMetaValue(CUSTOMER_ID, PERSISTENT_CART_META)) ?? '';
    for (const line of normalised) {
        expect(persistentCart, cartProofMessage(line.productId)).toMatch(new RegExp(`"product_id";(i:${line.productId};|s:\\d+:"${line.productId}")`));
    }
}

/* ------------------------------------------------------------------ */
/* Block checkout — the module's own create-payment transport          */
/* ------------------------------------------------------------------ */

/** The module's own block transport (REST/V1/PayPalController.php:48). */
export const CREATE_PAYMENT_ROUTE = '/dokan/v1/paypal-marketplace/create-payment';

export interface CreatePaymentResult {
    order_id?: number | string;
    paypal_order_id?: string;
    result?: string;
    __error?: string;
}

/**
 * Drive the BLOCK path exactly as `PayPalPayment.tsx:145-148` does: `wp.apiFetch` to the module's
 * cart create-payment route, from the customer's own hydrated checkout page so the session cookie,
 * the REST nonce and the cart are all the real ones.
 *
 * The block path builds its draft order with the Store API's `create_order_from_cart()` and only then
 * hands it to the same `PayPal::process_payment()` the classic path uses, so the two can diverge on
 * amounts, payees and fees for one identical cart — which is why PP-CHK-05 asserts both rather than
 * treating the block checkout as a skin over the classic one.
 */
export async function createBlockPayment(page: Page): Promise<CreatePaymentResult> {
    const raw = await page.evaluate(async (route: string) => {
        const w = window as unknown as { wp?: { apiFetch?: (options: { path: string; method: string }) => Promise<unknown> } };
        if (typeof w.wp?.apiFetch !== 'function') {
            return { __error: 'wp.apiFetch is not on the block checkout page, so the module block bundle (which declares it as a dependency) never loaded' };
        }
        try {
            return (await w.wp.apiFetch({ path: route, method: 'POST' })) as Record<string, unknown>;
        } catch (error) {
            const err = error as { message?: string; code?: string };
            return { __error: `${String(err?.code ?? 'error')}: ${String(err?.message ?? error)}` };
        }
    }, CREATE_PAYMENT_ROUTE);

    return raw as CreatePaymentResult;
}

/* ------------------------------------------------------------------ */
/* PayPal-hosted buyer login — credential faults                        */
/* ------------------------------------------------------------------ */

/**
 * The sandbox PERSONAL account that approves the payment.
 *
 * Read the same way `helpers.ts` reads its own env vars (plain `process.env` with an empty-string
 * fallback so the gate is a boolean rather than a crash) and never hardcoded. No PayPal API can grant
 * a buyer's approval, so this is the only way a capture can be reached at all — which is exactly why
 * a missing value must produce a loud skip rather than a quietly green money test.
 */
export const PAYPAL_BUYER = {
    email: process.env.PAYPAL_MARKETPLACE_BUYER_EMAIL || '',
    password: process.env.PAYPAL_MARKETPLACE_BUYER_PASSWORD || '',
} as const;

/**
 * PayPal's own wording for a rejected credential, and for an account it has stopped accepting logins for.
 *
 * Both patterns are deliberately narrow: they may match ONLY PayPal's login-rejection wording, because
 * anything they match becomes a declared skip. A bare "try again later" is NOT matched — PayPal renders
 * that sentence on its generic "things don't appear to be working at the moment" error too, which is
 * exactly what an invalid/expired PayPal order or a vendor whose merchant account cannot receive the
 * payment produces. That is a PRODUCT failure and must stay a loud red; swallowing it as "the buyer is
 * locked out" would be a fake green. The observed lockout screen ("It looks like you've tried too many
 * times. Try again later, or reset your password.") is still matched, on "tried too many times".
 */
export const PAYPAL_LOGIN_REJECTED = /did(n['’]?t| not) match|incorrect (password|email)/i;
export const PAYPAL_LOGIN_LOCKED = /tried too many times|too many failed attempts|temporarily locked/i;

/**
 * Read PayPal's own words straight after the login click and report a credential fault as an
 * ENVIRONMENT gap instead of a product failure.
 *
 * A wrong or stale sandbox buyer password is a fault of exactly the same class as PP-SET-23 (PayPal
 * refusing `localhost` as a webhook URL): the module under test is never reached, so a red here would
 * be a false accusation against the product. It is also actively destructive — every retry re-submits
 * the same bad password, and that is precisely what locked the sandbox buyer out on 2026-08-03 (PayPal
 * answered "Some of your info didn't match…" and then "It looks like you've tried too many times…"
 * after the retries, while each attempt burned minutes of the run's global timeout). A declared skip
 * is honest, visible in the report, and stops the retry storm before it starts.
 *
 * Returns the skip message, or `null` when the login was accepted. The genuine failure paths are
 * deliberately untouched: a buyer who logs in fine and then never returns to the order-received page
 * must still throw loudly.
 *
 * All four options are REQUIRED. `passwordSelector` is the one place the three copies genuinely
 * differed (`#password` alone versus `#password, input[name="login_password"]`), and the three
 * message fragments are each caller's own diagnosis — a default for any of them would hand one file's
 * wording, or one file's narrower selector, to the next call site added.
 */
export async function buyerCredentialFault(
    page: Page,
    options: { passwordSelector: string; lockedScope: string; lockedTail: string; rejectedTail: string }
): Promise<string | null> {
    const quotedLine = (text: string, pattern: RegExp): string => text.split('\n').find(line => pattern.test(line))?.trim() ?? '(the exact wording could not be read back off the page)';

    const deadline = Date.now() + 20_000;
    while (Date.now() < deadline) {
        const text = await page
            .locator('body')
            .innerText()
            .catch(() => '');

        if (PAYPAL_LOGIN_LOCKED.test(text)) {
            return (
                `PayPal has LOCKED OUT the sandbox buyer ${PAYPAL_BUYER.email || '(PAYPAL_MARKETPLACE_BUYER_EMAIL is empty)'} — it says: "${quotedLine(text, PAYPAL_LOGIN_LOCKED)}". ` +
                `${options.lockedScope} can run until that account is usable again: wait out PayPal's cooldown, or reset the buyer's password in the PayPal sandbox dashboard (Testing Tools → Sandbox Accounts) and put the new one in PAYPAL_MARKETPLACE_BUYER_PASSWORD in tests/pw/.env. ` +
                options.lockedTail
            );
        }

        if (PAYPAL_LOGIN_REJECTED.test(text)) {
            return (
                `PayPal REJECTED the sandbox buyer credentials for ${PAYPAL_BUYER.email || '(PAYPAL_MARKETPLACE_BUYER_EMAIL is empty)'} — it says: "${quotedLine(text, PAYPAL_LOGIN_REJECTED)}". ` +
                `PAYPAL_MARKETPLACE_BUYER_PASSWORD in tests/pw/.env is wrong or stale for that buyer; fix it (or reset the buyer's password in the PayPal sandbox dashboard) and re-run. ` +
                options.rejectedTail
            );
        }

        // Login accepted (or PayPal moved us on to a challenge screen): stop probing.
        if (!(await page.locator(options.passwordSelector).first().isVisible().catch(() => false))) {
            return null;
        }

        await page.waitForTimeout(1_000);
    }

    return null;
}

/* ------------------------------------------------------------------ */
/* The PayPal-hosted buyer approval — ONE driver, shared               */
/* ------------------------------------------------------------------ */

/**
 * PayPal's hosted checkout DOM.
 *
 * Several ids per step because PayPal serves more than one template and picks between them per
 * request — verified live on 2026-08-04 by loading `sandbox.paypal.com/signin` twice in a row: the
 * first load gave the two-step form (`#email` → `#btnNext` → `#password` + `#btnLogin`), the second
 * gave the one-page form with `#btnNext` ABSENT and `#password` already visible. Both are normal, so
 * `next` is probed rather than awaited.
 */
export const PAYPAL_HOSTED_UI = {
    email: '#email, input[name="login_email"]',
    next: '#btnNext',
    password: '#password, input[name="login_password"]',
    login: '#btnLogin, button[name="btnLogin"], #submitLogin, #loginBtn',
    pay: '#payment-submit-btn, button[data-testid="submit-button-initial"], #confirmButtonTop',
    /**
     * "Cancel and return to <store>". Matched by id, test id and visible text — never by
     * `a[href*="cancel"]`, because `.first()` resolves in DOM order across the whole comma list and a
     * stray href containing "cancel" anywhere earlier on PayPal's page would be clicked instead.
     */
    cancel: '#cancelLink, a[data-testid="cancel-link"], a:has-text("Cancel and return")',
    captcha: 'iframe[src*="recaptcha"], iframe[src*="hcaptcha"], iframe[title*="captcha" i], #captcha_response, [data-testid="captcha"]',
    otp: '#otpCode, input[name="otpCode"], [data-testid="otp-input"], #confirmPhoneNumber',
    /** One-touch / "stay logged in" upsell that PayPal can wedge between login and the review screen. */
    notNow: '#notNowLink, [data-testid="not-now"]',
} as const;

/**
 * Poll a set of selectors until one of them is visible, and say WHICH.
 *
 * Deliberately a poll rather than a `Promise.race` of `waitFor()`s: a losing `waitFor` keeps running
 * and eventually rejects unhandled, which turns a passing case into a late failure with no useful
 * message. `isVisible()` does NOT wait, which is exactly why it is safe to call in a loop here.
 */
export async function firstVisible(page: Page, selectors: string[], timeout: number): Promise<string | null> {
    const deadline = Date.now() + timeout;
    do {
        for (const selector of selectors) {
            if (await page.locator(selector).first().isVisible().catch(() => false)) {
                return selector;
            }
        }
        await page.waitForTimeout(500);
    } while (Date.now() < deadline);
    return null;
}

/** Everything a human would need to see to know why the hosted flow stalled. */
export async function paypalDiagnostics(page: Page): Promise<string> {
    const url = page.url();
    const title = await page.title().catch(() => '(title unavailable)');
    const text = await page
        .locator('body')
        .innerText()
        .catch(() => '(body text unavailable)');
    return `url=${url} | title=${title} | visible text (first 400 chars): ${text.replace(/\s+/g, ' ').slice(0, 400)}`;
}

export interface ApprovalOutcome {
    approved: boolean;
    /**
     * Set ONLY for a PayPal-side obstacle that no selector fix can get past — a captcha, a
     * one-time-code challenge, or a rejected/locked buyer credential. Anything else throws, because a
     * selector that stopped matching is a TEST defect and laundering it into a skip would hide the
     * loss of the whole money path.
     */
    blocker: string | null;
    steps: string[];
}

/**
 * Log in as the sandbox buyer and approve the payment, on paypal.com.
 *
 * There is no API equivalent: no PayPal endpoint grants a buyer's approval, so this is the one step
 * of the money path that must be driven in a browser.
 *
 * ONE driver, deliberately. Until 2026-08-04 four files carried their own copy — this one (then in
 * paypalMarketplaceCheckout.spec.ts), and weaker ones in the split, refund and disbursement specs —
 * and the weak copies cost two real failures in the 2026-08-04 run:
 *
 *   - **PP-REF-01** timed out clicking `#btnLogin` while the browser sat on
 *     `sandbox.paypal.com/pay?…&ul=1`, i.e. the REVIEW page. PayPal had carried the buyer's session
 *     and skipped login entirely, so there was no login button to click. That copy hard-waited the
 *     email field and then clicked login unconditionally; this one races `pay` into the landing set,
 *     so an already-authenticated buyer goes straight to approving.
 *   - **PP-SPL-12** submitted the login and then waited 120s for a pay button that never came, three
 *     times over, reporting "undrivable" for a condition it never diagnosed. That copy had no
 *     `buyerCredentialFault()` probe and no captcha/OTP branch, so a rejected password, a challenge
 *     and a genuine product failure were indistinguishable — and every retry re-submitted the same
 *     password, which is what locks the sandbox buyer out.
 *
 * The caller decides what a `blocker` means for its case; this function never skips and never
 * asserts, so a case that cannot proceed says so in its own words.
 *
 * `approvalUrl` is optional: pass it to have the driver navigate, or omit it when the caller already
 * put the browser on PayPal (the classic smart-button popup flow does).
 */
export async function driveHostedApproval(page: Page, approvalUrl?: string): Promise<ApprovalOutcome> {
    const steps: string[] = [];

    if (approvalUrl) {
        await page.goto(approvalUrl, { waitUntil: 'domcontentloaded' });
    }

    // `pay` is in the landing set on purpose: PayPal skips the login screen for a buyer whose session
    // it still holds and lands straight on the review page.
    const landing = await firstVisible(page, [PAYPAL_HOSTED_UI.captcha, PAYPAL_HOSTED_UI.otp, PAYPAL_HOSTED_UI.email, PAYPAL_HOSTED_UI.pay], 120_000);
    if (landing === null) {
        throw new Error(
            `PayPal's approval page never presented a login field, a pay button, a captcha or a one-time-code prompt within 120s. The shopper is stranded on PayPal and the order can never be paid for. ${await paypalDiagnostics(page)}`,
        );
    }
    if (landing === PAYPAL_HOSTED_UI.captcha || landing === PAYPAL_HOSTED_UI.otp) {
        return {
            approved: false,
            blocker: `PayPal answered the approval request with ${landing === PAYPAL_HOSTED_UI.captcha ? 'a CAPTCHA' : 'a one-time-code / phone-confirmation challenge'} for buyer ${PAYPAL_BUYER.email}. No test can solve either. ${await paypalDiagnostics(page)}`,
            steps,
        };
    }

    if (landing === PAYPAL_HOSTED_UI.email) {
        steps.push('login form presented');
        await page.locator(PAYPAL_HOSTED_UI.email).first().fill(PAYPAL_BUYER.email);

        // PayPal splits login across two screens when it recognises the address and keeps it on one
        // when it does not, so the "Next" button is optional by design rather than flaky.
        if (await page.locator(PAYPAL_HOSTED_UI.next).first().isVisible().catch(() => false)) {
            await page.locator(PAYPAL_HOSTED_UI.next).first().click();
            steps.push('clicked Next');
        }

        // `pay` is raced here too: clicking Next can complete the login outright for a remembered
        // buyer, in which case no password field is ever rendered.
        const afterEmail = await firstVisible(page, [PAYPAL_HOSTED_UI.captcha, PAYPAL_HOSTED_UI.otp, PAYPAL_HOSTED_UI.password, PAYPAL_HOSTED_UI.pay], 60_000);
        if (afterEmail === null) {
            throw new Error(`PayPal never presented a password field after the buyer email was entered. ${await paypalDiagnostics(page)}`);
        }
        if (afterEmail === PAYPAL_HOSTED_UI.captcha || afterEmail === PAYPAL_HOSTED_UI.otp) {
            return {
                approved: false,
                blocker: `PayPal interrupted the buyer login with ${afterEmail === PAYPAL_HOSTED_UI.captcha ? 'a CAPTCHA' : 'a one-time-code / phone-confirmation challenge'}. ${await paypalDiagnostics(page)}`,
                steps,
            };
        }

        if (afterEmail === PAYPAL_HOSTED_UI.password) {
            await page.locator(PAYPAL_HOSTED_UI.password).first().fill(PAYPAL_BUYER.password);

            // Clicked only if it is really there. PayPal's one-page template can submit on the
            // password field itself, and a hard click then waits out its timeout against a document
            // that has already navigated — which is exactly how PP-REF-01 failed.
            if (await page.locator(PAYPAL_HOSTED_UI.login).first().isVisible().catch(() => false)) {
                await page.locator(PAYPAL_HOSTED_UI.login).first().click();
            } else {
                await page.locator(PAYPAL_HOSTED_UI.password).first().press('Enter');
            }
            steps.push('submitted buyer credentials');

            // Probed BEFORE the 120s review-page wait below: with a rejected login that page never
            // appears, so without this the case burns two minutes and then reports a PayPal
            // credential fault as a product failure.
            const credentialFault = await buyerCredentialFault(page, {
                passwordSelector: PAYPAL_HOSTED_UI.password,
                lockedScope: 'No capturing case',
                lockedTail: 'The order WAS created and the shopper WAS sent to PayPal, so nothing about the module is implied either way.',
                rejectedTail:
                    "The buyer never got past PayPal's login, so no approval and no capture happened — reported as a declared environment gap rather than as a product failure.",
            });
            if (credentialFault) {
                return { approved: false, blocker: credentialFault, steps };
            }
        }
    }

    // PayPal can wedge a "stay logged in / one touch" upsell between the login and the review screen.
    // Dismissed if present and ignored if not — it is an upsell, so failing to find it means nothing.
    if (await page.locator(PAYPAL_HOSTED_UI.notNow).first().isVisible().catch(() => false)) {
        await page.locator(PAYPAL_HOSTED_UI.notNow).first().click().catch(() => undefined);
        steps.push('dismissed the one-touch interstitial');
    }

    const review = await firstVisible(page, [PAYPAL_HOSTED_UI.captcha, PAYPAL_HOSTED_UI.otp, PAYPAL_HOSTED_UI.pay], 120_000);
    if (review === null) {
        throw new Error(
            `PayPal never presented its pay/confirm button after login, so the payment could not be approved. A wrong buyer password lands here too — PayPal re-renders the login form rather than the review page. ${await paypalDiagnostics(page)}`,
        );
    }
    if (review !== PAYPAL_HOSTED_UI.pay) {
        return {
            approved: false,
            blocker: `PayPal interrupted the approval review with ${review === PAYPAL_HOSTED_UI.captcha ? 'a CAPTCHA' : 'a one-time-code / phone-confirmation challenge'}. ${await paypalDiagnostics(page)}`,
            steps,
        };
    }

    await page.locator(PAYPAL_HOSTED_UI.pay).first().click();
    steps.push('clicked the PayPal pay/confirm button');

    return { approved: true, blocker: null, steps };
}
