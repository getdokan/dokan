import { Page, expect, request, APIRequestContext } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payment, vendor, auth } from '@utils/interfaces';

// Re-export the REAL shared utilities under the names the spec imports so the
// import contract (`{ PaymentsPage, api, db, helpers, payloads, testData }`)
// stays wired to production helpers rather than local no-op stubs.
export { helpers } from '@utils/helpers';
export { payloads } from '@utils/payloads';

// testData is the co-located view the spec consumes:
//  - payment / vendor come from @utils/testData (`data`)
//  - paymentSettings mirrors the pre-refactor `dbData.testData.dokan.paymentSettings`
//    (the vendor `dokan_profile_settings` payment defaults the afterAll restores)
export const testData = {
    payment: data.payment,
    vendor: data.vendor,
    paymentSettings: dbData.testData.dokan.paymentSettings,
};

// ---------------------------------------------------------------------------
// API wrapper — lazily owns a real ApiUtils + APIRequestContext so the spec can
// `api.init()` in beforeAll and `api.dispose()` in afterAll.
// ---------------------------------------------------------------------------
let apiUtils: ApiUtils | undefined;
let apiRequestContext: APIRequestContext | undefined;

export const api = {
    async init(): Promise<void> {
        apiRequestContext = await request.newContext();
        apiUtils = new ApiUtils(apiRequestContext);
    },
    async activateModules(moduleIds: string | string[], auth?: auth): Promise<void> {
        await apiUtils!.activateModules(moduleIds, auth);
    },
    async deactivateModules(moduleIds: string | string[], auth?: auth): Promise<void> {
        await apiUtils!.deactivateModules(moduleIds, auth);
    },
    async updateBatchWcSettingsOptions(groupId: string, payload: object, auth?: auth): Promise<void> {
        await apiUtils!.updateBatchWcSettingsOptions(groupId, payload, auth);
    },
    async dispose(): Promise<void> {
        await apiRequestContext?.dispose();
        apiUtils = undefined;
        apiRequestContext = undefined;
    },
};

// ---------------------------------------------------------------------------
// DB wrapper — thin pass-through to the real dbUtils. `dispose` is a no-op:
// dbUtils holds a module-level connection pool shared across specs, so it must
// NOT be torn down here (the pre-refactor spec never disposed it either).
// ---------------------------------------------------------------------------
export const db = {
    async updateUserMeta(userId: string, metaKey: string, updatedMetaValue: any): Promise<void> {
        await dbUtils.updateUserMeta(userId, metaKey, updatedMetaValue);
    },
    async dispose(): Promise<void> {},
};

// ---------------------------------------------------------------------------
// Co-located selectors (ported verbatim from the pre-refactor selectors.ts
// groups: admin.wooCommerce.settings.{general,payments,updatedSuccessMessage}
// and vendor.vPaymentSettings).
// ---------------------------------------------------------------------------
// Exported so a sibling gateway suite can reuse a group instead of re-deriving it. The PayPal
// Marketplace suite consumes `selectors.admin.payments.paypalMarketPlace`, an already-proven
// admin selector set for that gateway. One copy means a settings-field rename breaks both suites
// at once rather than silently passing in one of them.
export const selectors = {
    admin: {
        // WooCommerce › Settings › General (currency)
        general: {
            currency: '//span[@id="select2-woocommerce_currency-container"]/..//span[@class="select2-selection__arrow"]',
            currencyInput: '.select2-search.select2-search--dropdown .select2-search__field',
            generalSaveChanges: '.woocommerce-save-button',
        },

        // WooCommerce › Settings › Payments
        payments: {
            // offline (cheque/cod/bacs) inspector page
            offlineToggle: '#inspector-checkbox-control-0',
            offlineSaveChanges: "//button[normalize-space()='Save changes']",

            // module setup/manage links on the payments list
            setupDokanPayPalMarketplace: '#dokan_paypal_marketplace',
            setupDokanStripeConnect: '#dokan-stripe-connect',
            setupDokanMangoPay: '#dokan_mangopay',
            setupDokanRazorpay: '#dokan_razorpay',
            setupDokanStripeExpress: '#dokan_stripe_express',

            stripe: {
                stripeConnectText: '//h3[normalize-space()="Stripe Connect"]',
                enableDisableStripe: '#woocommerce_dokan-stripe-connect_enabled',
                title: '#woocommerce_dokan-stripe-connect_title',
                description: '#woocommerce_dokan-stripe-connect_description',
                nonConnectedSellers: '#woocommerce_dokan-stripe-connect_allow_non_connected_sellers',
                displayNoticeToConnectSeller: '#woocommerce_dokan-stripe-connect_display_notice_to_non_connected_sellers',
                displayNoticeInterval: '#woocommerce_dokan-stripe-connect_display_notice_interval',
                threeDSecureAndSca: '#woocommerce_dokan-stripe-connect_enable_3d_secure',
                sellerPaysTheProcessingFeeIn3DsMode: '#woocommerce_dokan-stripe-connect_seller_pays_the_processing_fee',
                testMode: '#woocommerce_dokan-stripe-connect_testmode',
                savedCards: '#woocommerce_dokan-stripe-connect_saved_cards',
                testPublishableKey: '#woocommerce_dokan-stripe-connect_test_publishable_key',
                testSecretKey: '#woocommerce_dokan-stripe-connect_test_secret_key',
                testClientId: '#woocommerce_dokan-stripe-connect_test_client_id',
                stripeSaveChanges: '.woocommerce-save-button',
            },

            paypalMarketPlace: {
                paypalMarketPlaceText: '//h2[contains(.,"Dokan PayPal Marketplace")]',
                enableDisablePayPalMarketplace: '#woocommerce_dokan_paypal_marketplace_enabled',
                title: '#woocommerce_dokan_paypal_marketplace_title',
                description: '#woocommerce_dokan_paypal_marketplace_description',
                payPalMerchantId: '#woocommerce_dokan_paypal_marketplace_partner_id',
                payPalSandbox: '#woocommerce_dokan_paypal_marketplace_test_mode',
                sandboxClientId: '#woocommerce_dokan_paypal_marketplace_test_app_user',
                sandBoxClientSecret: '#woocommerce_dokan_paypal_marketplace_test_app_pass',
                payPalPartnerAttributionId: '#woocommerce_dokan_paypal_marketplace_bn_code',
                disbursementMode: '#select2-woocommerce_dokan_paypal_marketplace_disbursement_mode-container',
                disbursementModeValues: '.select2-results ul li',
                paymentButtonType: '#select2-woocommerce_dokan_paypal_marketplace_button_type-container',
                paymentButtonTypeValues: '.select2-results ul li',
                marketplaceLogo: '#woocommerce_dokan_paypal_marketplace_marketplace_logo',
                displayNoticeToConnectSeller: '#woocommerce_dokan_paypal_marketplace_display_notice_on_vendor_dashboard',
                sendAnnouncementToConnectSeller: '#woocommerce_dokan_paypal_marketplace_display_notice_to_non_connected_sellers',
                sendAnnouncementInterval: '#woocommerce_dokan_paypal_marketplace_display_notice_interval',
                paypalMarketPlaceSaveChanges: '.woocommerce-save-button',
            },

            dokanMangoPay: {
                mangoPayText: '//h2[contains(.,"Dokan MangoPay")]',
                enableDisableMangoPayPayment: '#woocommerce_dokan_mangopay_enabled',
                title: '#woocommerce_dokan_mangopay_title',
                description: '#woocommerce_dokan_mangopay_description',
                mangoPaySandbox: '#woocommerce_dokan_mangopay_sandbox_mode',
                sandboxClientId: '#woocommerce_dokan_mangopay_sandbox_client_id',
                sandBoxApiKey: '#woocommerce_dokan_mangopay_sandbox_api_key',
                currentAvailableCreditCards: (cards: string) => `//select[@id="woocommerce_dokan_mangopay_cards"]/..//li[@title="${cards}"]`,
                chooseAvailableCreditCards: '//label[contains(text(),"Choose Available Credit Cards ")]/../..//input[@class="select2-search__field"]',
                currentPaymentServices: (cards: string) => `//select[@id="woocommerce_dokan_mangopay_direct_pay"]/..//li[@title="${cards}"]`,
                chooseAvailableDirectPaymentServices: '//label[contains(text(),"Choose Available Direct Payment Services")]/../..//input[@class="select2-search__field"]',
                searchedResult: '.select2-results__option.select2-results__option--highlighted',
                savedCards: '#woocommerce_dokan_mangopay_saved_cards',
                transferFunds: '#select2-woocommerce_dokan_mangopay_disburse_mode-container',
                transferFundsValues: '.select2-results ul li',
                payoutMode: '#woocommerce_dokan_mangopay_instant_payout',
                typeOfVendors: '#select2-woocommerce_dokan_mangopay_default_vendor_status-container',
                typeOfVendorsValues: '.select2-results ul li',
                businessRequirement: '#select2-woocommerce_dokan_mangopay_default_business_type-container',
                businessRequirementValues: '.select2-results ul li',
                displayNoticeToNonConnectedSellers: '#woocommerce_dokan_mangopay_notice_on_vendor_dashboard',
                sendAnnouncementToNonConnectedSellers: '#woocommerce_dokan_mangopay_announcement_to_sellers',
                announcementInterval: '#woocommerce_dokan_mangopay_notice_interval',
                // Shared "Save changes" button used by every settings section.
                dokanMangopaySaveChanges: '.woocommerce-save-button',
            },

            dokanRazorpay: {
                // NOTE: preserved as-is from the pre-refactor selectors (upstream copy-paste).
                razorpayText: '//h2[contains(.,"Dokan MangoPay")]',
                enableDisableDokanRazorpay: '#woocommerce_dokan_razorpay_enabled',
                title: '#woocommerce_dokan_razorpay_title',
                description: '#woocommerce_dokan_razorpay_description',
                razorpaySandbox: '#woocommerce_dokan_razorpay_test_mode',
                testKeyId: '#woocommerce_dokan_razorpay_test_key_id',
                testKeySecret: '#woocommerce_dokan_razorpay_test_key_secret',
                disbursementMode: '#select2-woocommerce_dokan_razorpay_disbursement_mode-container',
                disbursementModeValues: '.select2-results ul li',
                sellerPaysTheProcessingFee: '#woocommerce_dokan_razorpay_seller_pays_the_processing_fee',
                displayNoticeToConnectSeller: '#woocommerce_dokan_razorpay_display_notice_on_vendor_dashboard',
                sendAnnouncementToConnectSeller: '#woocommerce_dokan_razorpay_display_notice_to_non_connected_sellers',
                sendAnnouncementInterval: '#woocommerce_dokan_razorpay_display_notice_interval',
                dokanRazorpaySaveChanges: '.woocommerce-save-button',
            },

            stripeExpress: {
                stripeExpressText: '//h2[contains(.,"Stripe Express")]',
                enableOrDisableStripeExpress: '#woocommerce_dokan_stripe_express_enabled',
                title: '#woocommerce_dokan_stripe_express_title',
                description: '#woocommerce_dokan_stripe_express_description',
                testMode: '#woocommerce_dokan_stripe_express_testmode',
                testPublishableKey: '#woocommerce_dokan_stripe_express_test_publishable_key',
                testSecretKey: '#woocommerce_dokan_stripe_express_test_secret_key',
                testWebhookSecret: '#woocommerce_dokan_stripe_express_test_webhook_key',
                // NOTE: enabled_payment_methods select2 multiselect removed from the gateway
                // (payment methods now come from Stripe's payment_method_configuration).
                takeProcessingFeesFromSellers: '#woocommerce_dokan_stripe_express_sellers_pay_processing_fee',
                savedCards: '#woocommerce_dokan_stripe_express_saved_cards',
                capturePaymentsManually: '#woocommerce_dokan_stripe_express_capture',
                disburseFunds: '#select2-woocommerce_dokan_stripe_express_disburse_mode-container',
                disbursementModeValues: '.select2-results ul li',
                customerBankStatement: '#woocommerce_dokan_stripe_express_statement_descriptor',
                paymentRequestButtons: '#woocommerce_dokan_stripe_express_payment_request',
                buttonType: '#woocommerce_dokan_stripe_express_payment_request_button_type',
                buttonTheme: '#woocommerce_dokan_stripe_express_payment_request_button_theme',
                buttonLocations: '//select[@id="woocommerce_dokan_stripe_express_payment_request_button_locations"]/..//span[@class="select2-selection select2-selection--multiple"]',
                buttonLocationsValues: '.select2-results ul li',
                displayNoticeToNonConnectedSellers: '#woocommerce_dokan_stripe_express_notice_on_vendor_dashboard',
                sendAnnouncementToNonConnectedSellers: '#woocommerce_dokan_stripe_express_announcement_to_sellers',
                announcementInterval: 'input#woocommerce_dokan_stripe_express_notice_interval',
                debugLog: '#woocommerce_dokan_stripe_express_debug',
                stripeExpressSaveChanges: '.woocommerce-save-button',
            },
        },

        // Success banner after saving a WooCommerce settings section.
        updatedSuccessMessage: '#message.updated.inline p',
    },

    // Vendor dashboard › Settings › Payment
    vendor: {
        paymentMethodText: '.dokan-dashboard-content.dokan-settings-content h1',
        paymentMethods: {
            paymentMethodsDiv: '.dokan-payment-settings-summary',
            addPaymentMethodDropDown: '#toggle-vendor-payment-method-drop-down',
        },
        // basic (paypal/skrill/custom) email + actions
        paymentEmail: 'input.dokan-form-control',
        disconnectPayment: '//button[normalize-space()="Disconnect"]',
        updateSettings: 'input.dokan-btn',
        updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success p',
        // bank transfer
        bankAccountName: '//input[@name="settings[bank][ac_name]"]',
        bankAccountType: '#ac_type',
        bankAccountNumber: '//input[@name="settings[bank][ac_number]"]',
        bankName: '//input[@name="settings[bank][bank_name]"]',
        bankAddress: '//textarea[@name="settings[bank][bank_addr]"]',
        bankRoutingNumber: '//input[@name="settings[bank][routing_number]"]',
        bankIban: '//input[@name="settings[bank][iban]"]',
        bankSwiftCode: '//input[@name="settings[bank][swift]"]',
        declaration: '#declaration',
        addAccount: 'button.save.dokan-btn',
    },
} as const;

const adminGeneral = selectors.admin.general;
const adminPayments = selectors.admin.payments;
const adminSuccess = selectors.admin.updatedSuccessMessage;
const vPayment = selectors.vendor;

export class PaymentsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- raw Playwright helpers (replace the old base-class methods) ----
    private async goto(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded', reload = false): Promise<void> {
        await this.page.goto(toPath(subPath), { waitUntil });
        if (reload) {
            await this.page.reload();
        }
    }

    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).click();
    }

    private async check(selector: string): Promise<void> {
        await this.page.locator(selector).check();
    }

    /**
     * Tick a setting that the gateway itself may render read-only, and say so when it does.
     *
     * Only for controls a gateway deliberately disables. Everything else keeps using check(), so a
     * field that goes read-only unexpectedly still fails the run instead of being skipped quietly.
     */
    private async checkIfOperable(selector: string, why: string): Promise<void> {
        const box = this.page.locator(selector);
        await expect(box, `${selector} should be rendered`).toBeAttached();
        if (await box.isDisabled()) {
            console.log(`[payments] skipped ${selector}: rendered read-only by the gateway (${why})`);
            return;
        }
        await box.check();
    }

    private async fill(selector: string, value: string): Promise<void> {
        await this.page.locator(selector).fill(value);
    }

    private async type(selector: string, value: string): Promise<void> {
        await this.page.locator(selector).pressSequentially(value, { delay: 100 });
    }

    private async getText(selector: string): Promise<string | null> {
        return await this.page.locator(selector).textContent();
    }

    private async selectByValue(selector: string, value: string): Promise<void> {
        await this.page.locator(selector).selectOption({ value });
    }

    private async removeAttribute(selector: string, attribute: string): Promise<void> {
        await this.page.locator(selector).evaluate((el, attr) => el.removeAttribute(attr), attribute);
    }

    private async isLocatorExists(selector: string): Promise<boolean> {
        return (await this.page.locator(selector).count()) > 0;
    }

    // Click each matching select2 result option whose text equals `value`.
    private async setDropdownOptionSpan(selector: string, value: string): Promise<void> {
        const elements = await this.page.$$(selector);
        for (const element of elements) {
            const text = await element.evaluate(el => el.textContent);
            if (value.toLowerCase() === text?.trim().toLowerCase()) {
                await element.click();
            }
        }
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
    }

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    private async toContainText(selector: string, text: string | RegExp): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    private getBaseUrl(): string {
        return new URL(this.page.url()).origin;
    }

    // ---- admin: currency ----

    // Admin set currency (WooCommerce › Settings › General)
    async setCurrency(currency: string): Promise<void> {
        await this.goto(data.subUrls.backend.wc.settings);
        const currentCurrency = await this.getText(adminGeneral.currency);
        if (currentCurrency !== currency) {
            await this.click(adminGeneral.currency);
            await this.fill(adminGeneral.currencyInput, currency);
            await this.page.keyboard.press(data.key.enter);
            await this.removeAttribute(adminGeneral.generalSaveChanges, 'disabled');
            await this.click(adminGeneral.generalSaveChanges);
            await this.toContainText(adminSuccess, data.payment.currency.saveSuccessMessage);
        }
    }

    // ---- admin: basic (offline) payment methods ----

    // Go to a specific offline payment method settings page
    async goToWcPaymentSettings(path: string): Promise<void> {
        await this.goto(`${data.subUrls.backend.wc.paymentSettings}&path=%2Foffline%2F${path}&from=WCADMIN_PAYMENT_SETTINGS`);
    }

    // Navigate to an offline payment method and put its enable switch in the DESIRED state.
    // Idempotent on purpose: a blind click flips whatever is there, so on an environment where
    // _env.setup already enabled these gateways this used to DISABLE them and leave them off for
    // every later spec on the shard (it broke productAdvertising's bacs checkout).
    async setPaymentMethodEnabled(method: string, enabled: boolean): Promise<void> {
        await this.goToWcPaymentSettings(method);
        // eslint-disable-next-line playwright/no-networkidle
        await this.page.waitForLoadState('networkidle');
        const toggle = this.page.locator(adminPayments.offlineToggle);
        await expect(toggle, `the ${method} enable switch must render before it can be set`).toBeVisible();
        if ((await toggle.isChecked()) === enabled) {
            return;
        }
        await this.click(adminPayments.offlineToggle);
        await this.click(adminPayments.offlineSaveChanges);
        await expect(toggle, `${method} should now be ${enabled ? 'enabled' : 'disabled'}`).toBeChecked({ checked: enabled });
    }

    // Admin setup basic payment methods
    async setupBasicPaymentMethods(_payment: payment): Promise<void> {
        await this.setPaymentMethodEnabled('cheque', true);
        await this.setPaymentMethodEnabled('cod', true);
        await this.setPaymentMethodEnabled('bacs', true);
    }

    // ---- admin: enable pro modules (assert setup link appears) ----

    async enableMangoPayModule(): Promise<void> {
        await this.goto(data.subUrls.backend.wc.paymentSettings);
        await this.toBeVisible(adminPayments.setupDokanMangoPay);
    }

    async enablePayPalMarketplaceModule(): Promise<void> {
        await this.goto(data.subUrls.backend.wc.paymentSettings);
        await this.toBeVisible(adminPayments.setupDokanPayPalMarketplace);
    }

    async enableRazorpayModule(): Promise<void> {
        await this.goto(data.subUrls.backend.wc.paymentSettings);
        await this.toBeVisible(adminPayments.setupDokanRazorpay);
    }

    async enableStripeConnectModule(): Promise<void> {
        await this.goto(data.subUrls.backend.wc.paymentSettings);
        await this.toBeVisible(adminPayments.setupDokanStripeConnect);
    }

    async enableStripeExpressModule(): Promise<void> {
        await this.goto(data.subUrls.backend.wc.paymentSettings);
        await this.toBeVisible(adminPayments.setupDokanStripeExpress);
    }

    // ---- admin: disable pro modules (assert setup link + settings gone) ----

    async disableMangoPayModule(): Promise<void> {
        await this.goto(data.subUrls.backend.wc.paymentSettings, 'domcontentloaded', true);
        await this.notToBeVisible(adminPayments.setupDokanMangoPay);

        await this.goto(data.subUrls.backend.wc.mangoPaySettings);
        await this.notToBeVisible(adminPayments.dokanMangoPay.mangoPayText);
    }

    async disablePayPalMarketplaceModule(): Promise<void> {
        await this.goto(data.subUrls.backend.wc.paymentSettings, 'domcontentloaded', true);
        await this.notToBeVisible(adminPayments.setupDokanPayPalMarketplace);

        await this.goto(data.subUrls.backend.wc.paypalMarketplaceSettings);
        await this.notToBeVisible(adminPayments.paypalMarketPlace.paypalMarketPlaceText);
    }

    async disableRazorpayModule(): Promise<void> {
        await this.goto(data.subUrls.backend.wc.paymentSettings, 'domcontentloaded', true);
        await this.notToBeVisible(adminPayments.setupDokanRazorpay);

        await this.goto(data.subUrls.backend.wc.razorPaySettings);
        await this.notToBeVisible(adminPayments.dokanRazorpay.razorpayText);
    }

    async disableStripeConnectModule(): Promise<void> {
        await this.goto(data.subUrls.backend.wc.paymentSettings, 'domcontentloaded', true);
        await this.notToBeVisible(adminPayments.setupDokanStripeConnect);

        await this.goto(data.subUrls.backend.wc.stripeConnectSettings);
        await this.notToBeVisible(adminPayments.stripe.stripeConnectText);
    }

    async disableStripeExpressModule(): Promise<void> {
        await this.goto(data.subUrls.backend.wc.paymentSettings, 'domcontentloaded', true);
        await this.notToBeVisible(adminPayments.setupDokanStripeExpress);

        await this.goto(data.subUrls.backend.wc.stripeExpressSettings);
        await this.notToBeVisible(adminPayments.stripeExpress.stripeExpressText);
    }

    // ---- admin: setup pro gateways ----

    // Admin setup Stripe Connect
    async setupStripeConnect(payment: payment): Promise<void> {
        await this.goto(data.subUrls.backend.wc.stripeConnectSettings);
        const s = adminPayments.stripe;

        await this.check(s.enableDisableStripe);
        await this.fill(s.title, payment.stripeConnect.title);
        await this.fill(s.description, payment.stripeConnect.description);
        await this.check(s.nonConnectedSellers);
        await this.check(s.displayNoticeToConnectSeller);
        await this.fill(s.displayNoticeInterval, payment.stripeConnect.displayNoticeInterval);
        await this.checkIfOperable(s.threeDSecureAndSca, 'Payment Elements keep SCA on permanently, so the revamped gateway ships this toggle disabled and keeps it only for legacy orders');
        await this.check(s.sellerPaysTheProcessingFeeIn3DsMode);
        await this.check(s.testMode);
        await this.check(s.savedCards);
        // test credentials
        await this.fill(s.testPublishableKey, payment.stripeConnect.testPublishableKey);
        await this.fill(s.testSecretKey, payment.stripeConnect.testSecretKey);
        await this.fill(s.testClientId, payment.stripeConnect.testClientId);
        await this.removeAttribute(adminPayments.dokanMangoPay.dokanMangopaySaveChanges, 'disabled');
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.backend.wc.stripeConnectSettings, s.stripeSaveChanges);

        await this.toContainText(adminSuccess, payment.saveSuccessMessage);
    }

    // Admin setup Dokan PayPal Marketplace
    async setupPaypalMarketPlace(payment: payment): Promise<void> {
        await this.goto(data.subUrls.backend.wc.paypalMarketplaceSettings);
        const p = adminPayments.paypalMarketPlace;

        await this.check(p.enableDisablePayPalMarketplace);
        await this.fill(p.title, payment.paypalMarketPlace.title);
        await this.fill(p.description, payment.paypalMarketPlace.description);
        await this.fill(p.payPalMerchantId, payment.paypalMarketPlace.payPalMerchantId);
        // api credentials
        await this.check(p.payPalSandbox);
        await this.fill(p.sandboxClientId, payment.paypalMarketPlace.sandboxClientId);
        await this.fill(p.sandBoxClientSecret, payment.paypalMarketPlace.sandBoxClientSecret);
        await this.fill(p.payPalPartnerAttributionId, payment.paypalMarketPlace.payPalPartnerAttributionId);
        await this.click(p.disbursementMode);
        await this.setDropdownOptionSpan(p.disbursementModeValues, payment.paypalMarketPlace.disbursementMode);
        await this.click(p.paymentButtonType);
        await this.setDropdownOptionSpan(p.paymentButtonTypeValues, payment.paypalMarketPlace.paymentButtonType);
        await this.fill(p.marketplaceLogo, this.getBaseUrl() + payment.paypalMarketPlace.marketplaceLogoPath);
        await this.check(p.displayNoticeToConnectSeller);
        await this.check(p.sendAnnouncementToConnectSeller);
        await this.fill(p.sendAnnouncementInterval, payment.paypalMarketPlace.announcementInterval);
        await this.removeAttribute(adminPayments.dokanMangoPay.dokanMangopaySaveChanges, 'disabled');
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.backend.wc.paypalMarketplaceSettings, p.paypalMarketPlaceSaveChanges);

        await this.toContainText(adminSuccess, payment.saveSuccessMessage);
    }

    // Admin setup MangoPay
    async setupMangoPay(payment: payment): Promise<void> {
        await this.goto(data.subUrls.backend.wc.mangoPaySettings);
        const m = adminPayments.dokanMangoPay;

        await this.check(m.enableDisableMangoPayPayment);
        await this.fill(m.title, payment.mangoPay.title);
        await this.fill(m.description, payment.mangoPay.description);
        // api credentials
        await this.check(m.mangoPaySandbox);
        await this.fill(m.sandboxClientId, payment.mangoPay.sandboxClientId);
        await this.fill(m.sandBoxApiKey, payment.mangoPay.sandBoxApiKey);
        // payment options
        const isCardExists = await this.isLocatorExists(m.currentAvailableCreditCards(payment.mangoPay.availableCreditCards));
        if (!isCardExists) {
            await this.click(m.chooseAvailableCreditCards);
            await this.type(m.chooseAvailableCreditCards, payment.mangoPay.availableCreditCards);
            await this.click(m.searchedResult);
        }
        const isServiceExists = await this.isLocatorExists(m.currentPaymentServices(payment.mangoPay.availableCreditCards));
        if (!isServiceExists) {
            await this.click(m.chooseAvailableDirectPaymentServices);
            await this.type(m.chooseAvailableDirectPaymentServices, payment.mangoPay.availableDirectPaymentServices);
            await this.click(m.searchedResult);
        }
        await this.check(m.savedCards);
        // fund transfers and payouts
        await this.click(m.transferFunds);
        await this.setDropdownOptionSpan(m.transferFundsValues, payment.mangoPay.transferFunds);
        await this.check(m.payoutMode);
        // types and requirements of vendors
        await this.click(m.typeOfVendors);
        await this.setDropdownOptionSpan(m.typeOfVendorsValues, payment.mangoPay.typeOfVendors);
        await this.click(m.businessRequirement);
        await this.setDropdownOptionSpan(m.businessRequirementValues, payment.mangoPay.businessRequirement);
        // advanced settings
        await this.check(m.displayNoticeToNonConnectedSellers);
        await this.check(m.sendAnnouncementToNonConnectedSellers);
        await this.fill(m.announcementInterval, payment.mangoPay.announcementInterval);

        await this.removeAttribute(m.dokanMangopaySaveChanges, 'disabled');
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.backend.wc.mangoPaySettings, m.dokanMangopaySaveChanges);

        await this.toContainText(adminSuccess, payment.saveSuccessMessage);
    }

    // Admin setup Razorpay
    async setupRazorpay(payment: payment): Promise<void> {
        await this.goto(data.subUrls.backend.wc.razorPaySettings);
        const r = adminPayments.dokanRazorpay;

        await this.check(r.enableDisableDokanRazorpay);
        await this.fill(r.title, payment.razorPay.title);
        await this.fill(r.description, payment.razorPay.description);
        // api credentials
        await this.check(r.razorpaySandbox);
        await this.fill(r.testKeyId, payment.razorPay.testKeyId);
        await this.fill(r.testKeySecret, payment.razorPay.testKeySecret);
        await this.click(r.disbursementMode);
        await this.setDropdownOptionSpan(r.disbursementModeValues, payment.razorPay.disbursementMode);
        await this.check(r.sellerPaysTheProcessingFee);
        await this.check(r.displayNoticeToConnectSeller);
        await this.check(r.sendAnnouncementToConnectSeller);
        await this.fill(r.sendAnnouncementInterval, payment.razorPay.announcementInterval);
        await this.removeAttribute(adminPayments.dokanMangoPay.dokanMangopaySaveChanges, 'disabled');
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.backend.wc.razorPaySettings, r.dokanRazorpaySaveChanges);

        await this.toContainText(adminSuccess, payment.saveSuccessMessage);
    }

    // Admin setup Stripe Express
    async setupStripeExpress(payment: payment): Promise<void> {
        await this.goto(data.subUrls.backend.wc.stripeExpressSettings);
        const e = adminPayments.stripeExpress;

        await this.check(e.enableOrDisableStripeExpress);
        await this.fill(e.title, payment.stripeExpress.title);
        await this.fill(e.description, payment.stripeExpress.description);
        // api credentials
        await this.check(e.testMode);
        await this.fill(e.testPublishableKey, payment.stripeExpress.testPublishableKey);
        await this.fill(e.testSecretKey, payment.stripeExpress.testSecretKey);
        await this.fill(e.testWebhookSecret, payment.stripeExpress.testWebhookSecret);
        // payment and disbursement
        // NOTE: The old "Choose Payment Methods" select2 multiselect
        // (woocommerce_dokan_stripe_express_enabled_payment_methods) was removed from
        // the gateway settings. Enabled payment methods are now driven by a Stripe
        // "Payment method configuration" text field (defaults to Stripe's default set),
        // so there is no in-page control to toggle card/iDEAL here anymore.
        await this.check(e.takeProcessingFeesFromSellers);
        await this.check(e.savedCards);
        await this.check(e.capturePaymentsManually);
        await this.click(e.disburseFunds);
        await this.setDropdownOptionSpan(e.disbursementModeValues, payment.stripeExpress.disbursementMode);
        await this.fill(e.customerBankStatement, payment.stripeExpress.customerBankStatement);
        // payment request options (Apple Pay / Google Pay)
        await this.check(e.paymentRequestButtons);
        await this.selectByValue(e.buttonType, payment.stripeExpress.paymentRequestButtonType);
        await this.selectByValue(e.buttonTheme, payment.stripeExpress.paymentRequestButtonTheme);
        await this.click(e.buttonLocations);
        await this.setDropdownOptionSpan(e.buttonLocationsValues, payment.stripeExpress.paymentRequestButtonLocation.product);
        await this.click(e.buttonLocations);
        await this.setDropdownOptionSpan(e.buttonLocationsValues, payment.stripeExpress.paymentRequestButtonLocation.cart);
        // advanced settings
        await this.check(e.displayNoticeToNonConnectedSellers);
        await this.check(e.sendAnnouncementToNonConnectedSellers);
        await this.type(e.announcementInterval, payment.stripeExpress.announcementInterval);
        await this.check(e.debugLog);
        await this.removeAttribute(adminPayments.dokanMangoPay.dokanMangopaySaveChanges, 'disabled');
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.backend.wc.stripeExpressSettings, e.stripeExpressSaveChanges);

        await this.toContainText(adminSuccess, payment.saveSuccessMessage);
    }

    // ---- vendor ----

    // Vendor payment settings render properly
    async vendorPaymentSettingsRenderProperly(): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.settingsPayment);

        await this.toBeVisible(vPayment.paymentMethodText);
        await this.toBeVisible(vPayment.paymentMethods.paymentMethodsDiv);
        await this.toBeVisible(vPayment.paymentMethods.addPaymentMethodDropDown);
    }

    // Go to a vendor payment method settings page
    async goToPaymentSettings(methodName: string): Promise<void> {
        switch (methodName) {
            case 'paypal':
                await this.goto(data.subUrls.frontend.vDashboard.paypal);
                break;
            case 'bank':
                await this.goto(data.subUrls.frontend.vDashboard.bankTransfer);
                break;
            case 'skrill':
                await this.goto(data.subUrls.frontend.vDashboard.skrill);
                break;
            case 'custom':
                await this.goto(data.subUrls.frontend.vDashboard.customPayment);
                break;
            default:
                break;
        }
    }

    // Set a basic payment method [paypal, skrill, custom]
    async addBasicPayment(paymentMethod: vendor['payment']): Promise<void> {
        await this.goToPaymentSettings(paymentMethod.methodName);
        await this.fill(vPayment.paymentEmail, paymentMethod.email());
        await this.clickAndWaitForResponse(data.subUrls.ajax, vPayment.updateSettings);
        await this.toContainText(vPayment.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
    }

    // Disconnect a basic payment method [paypal, skrill, custom, bank]
    async removeBasicPayment(paymentMethod: vendor['payment']): Promise<void> {
        await this.goToPaymentSettings(paymentMethod.methodName);
        await this.clickAndWaitForResponse(data.subUrls.ajax, vPayment.disconnectPayment);
        await this.toContainText(vPayment.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
    }

    // Bank transfer payment settings
    async addBankTransfer(paymentMethod: vendor['payment']): Promise<void> {
        await this.goto(data.subUrls.frontend.vDashboard.bankTransfer);

        await this.fill(vPayment.bankAccountName, paymentMethod.bankAccountName);
        await this.selectByValue(vPayment.bankAccountType, paymentMethod.bankAccountType);
        await this.fill(vPayment.bankAccountNumber, paymentMethod.bankAccountNumber);
        await this.fill(vPayment.bankRoutingNumber, paymentMethod.bankRoutingNumber);
        await this.fill(vPayment.bankName, paymentMethod.bankName);
        await this.fill(vPayment.bankAddress, paymentMethod.bankAddress);
        await this.fill(vPayment.bankIban, paymentMethod.bankIban);
        await this.fill(vPayment.bankSwiftCode, paymentMethod.bankSwiftCode);
        await this.check(vPayment.declaration);

        await this.clickAndWaitForResponse(data.subUrls.ajax, vPayment.addAccount);
        await this.toContainText(vPayment.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
    }
}
