import { Page, expect } from '@playwright/test';
import type { Response } from '@playwright/test';
import { closeAnnouncementModal, toPath, helpers, parseBoolean } from '@utils/helpers';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { dbUtils } from '@utils/dbUtils';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dokanSettings } from '@utils/interfaces';

// Re-export the real utils so the spec's
// `import { SettingsPage, dbData, dbUtils, data } from './settingsPage'`
// resolves to the live dbUtils / dbData / testData (NOT local no-op stubs).
export { data, dbData, dbUtils, ApiUtils, payloads };

// DOKAN_PRO gates the Pro-only settings sections. Never branch on the raw env
// string — a non-empty "false" is truthy — so normalise through parseBoolean().
const DOKAN_PRO = parseBoolean(process.env.DOKAN_PRO);

// Co-located selectors — ported verbatim from the pre-refactor
// `selector.admin.dokan.settings` group (git e2ec507de:tests/pw/pages/selectors.ts).
const settingsSelectors = {
    // settings pro advertisement
    proAdvertisementBanner: {
        settingsBanner: '#dokan-settings-banner',
        upgradeToPro: '//a[normalize-space()="Upgrade to Pro"]',
        checkOutAllVendorFunctionalities: '//a[normalize-space()="Check Out All Vendor Functionalities"]',
    },

    settingsText: '.dokan-settings h1',

    sections: {
        settingsMenuSection: '.nab-section',
        settingsMenuDetailsSection: '.nab-section',
    },

    header: {
        settingsHeader: '.settings-header',
        settingsTitle: '.settings-title',
        settingsContent: '.settings-content',
        settingsDocumentation: '.settings-document-button',
    },

    fields: '.dokan-settings-fields',

    saveChanges: '//input[@id="submit" and @value="Save Changes"]',
    saveSuccessMessage: 'Setting has been saved successfully.',

    search: {
        searchBox: '.search-box',
        input: '#dokan-admin-search',
        close: '.search-box span.dashicons',
    },

    backToTop: '.back-to-top.tips',

    // Setting Menus
    menus: {
        general: '//div[@class="nav-title" and contains(text(),"General")]',
        sellingOptions: '//div[@class="nav-title" and contains(text(),"Selling Options")]',
        withdrawOptions: '//div[@class="nav-title" and contains(text(),"Withdraw Options")]',
        reverseWithdrawal: '//div[@class="nav-title" and contains(text(),"Reverse Withdrawal")]',
        pageSettings: '//div[@class="nav-title" and contains(text(),"Page Settings")]',
        appearance: '//div[@class="nav-title" and contains(text(),"Appearance")]',
        menuManager: '//div[@class="nav-title" and contains(text(),"Menu Manager")]',
        privacyPolicy: '//div[@class="nav-title" and contains(text(),"Privacy Policy")]',
        colors: '//div[@class="nav-title" and contains(text(),"Colors")]',
        liveSearch: '//div[@class="nav-title" and contains(text(),"Live Search")]',
        storeSupport: '//div[@class="nav-title" and contains(text(),"Store Support")]',
        vendorVerification: '//div[@class="nav-title" and contains(text(),"Vendor Verification")]',
        verificationSmsGateways: '//div[@class="nav-title" and contains(text(),"Verification SMS Gateways")]',
        emailVerification: '//div[@class="nav-title" and contains(text(),"Email Verification")]',
        socialApi: '//div[@class="nav-title" and contains(text(),"Social API")]',
        shippingStatus: '//div[@class="nav-title" and contains(text(),"Shipping Status")]',
        quote: '//div[@class="nav-title" and contains(text(),"Quote Settings")]',
        liveChat: '//div[@class="nav-title" and contains(text(),"Live Chat")]',
        rma: '//div[@class="nav-title" and contains(text(),"RMA")]',
        wholesale: '//div[@class="nav-title" and contains(text(),"Wholesale")]',
        euComplianceFields: '//div[@class="nav-title" and contains(text(),"EU Compliance Fields")]',
        deliveryTime: '//div[@class="nav-title" and contains(text(),"Delivery Time")]',
        productAdvertising: '//div[@class="nav-title" and contains(text(),"Product Advertising")]',
        geolocation: '//div[@class="nav-title" and contains(text(),"Geolocation")]',
        productReportAbuse: '//div[@class="nav-title" and contains(text(),"Product Report Abuse")]',
        printful: '//div[@class="nav-title" and contains(text(),"Printful")]',
        productFormManager: '//div[@class="nav-title" and contains(text(),"Product Form Manager")]',
        singleProductMultiVendor: '//div[@class="nav-title" and contains(text(),"Single Product MultiVendor")]',
        vendorSubscription: '//div[@class="nav-title" and contains(text(),"Vendor Subscription")]',
        vendorAnalytics: '//div[@class="nav-title" and contains(text(),"Vendor Analytics")]',
    },

    settingTitle: 'div.settings-content h2.settings-title',

    // General
    general: {
        // Site settings
        adminAreaAccess: '.admin_access .switch',

        vendorStoreUrl: '#dokan_general\\[custom_store_url\\]',
        vendorSetupWizardLogo: '#dokan_general\\[setup_wizard_logo_url\\]',
        disableWelcomeWizard: '#dokan_general\\[disable_welcome_wizard\\]',
        setupWizardMessageIframe: 'iframe',
        setupWizardMessageHtmlBody: '#tinymce',
        sellingProductTypes: (type: string) => `//label[contains(@for,'sell_${type}-global_digital_mode')]`,
        logShipStationApiRequest: '#dokan_general\\[enable_shipstation_logging\\]',
        dataClear: '#dokan_general\\[data_clear_on_uninstall\\]',
        confirmDataClear: '.swal2-confirm',
        cancelDataClear: '.swal2-cancel',

        // Vendor Store settings
        storeTermsAndConditions: '.seller_enable_terms_and_conditions .switch',
        storeProductPerPage: '#dokan_general\\[store_products_per_page\\]',
        enableTermsAndCondition: '.enable_tc_on_reg .switch',
        enableSingSellerMode: '#dokan_general\\[enable_single_seller_mode\\]',
        storCategory: (category: string) => `//label[contains(@for,'${category}-store_category_type')]`,

        // product page settings
        showVendorInfo: '.show_vendor_info .switch',
        enableMoreProductsTab: '.enabled_more_products_tab .switch',
    },

    // Selling
    selling: {
        // Commission
        commissionType: 'select#dokan_selling\\[commission_type\\]', // fixed, category_based
        percentage: 'input#percentage-val-id',
        fixed: 'input#fixed-val-id',
        expandCategories: '(//i[contains(@class,"far fa-plus-square")]/..)[1]',
        expandedCategories: '(//i[contains(@class,"far fa-minus-square")]/..)[1]',
        categoryPercentage: (category: string) => `//p[contains(text(),'${category}')]/../..//input[@id='percentage_commission']`,
        categoryFixed: (category: string) => `//p[contains(text(),'${category}')]/../..//input[@id='fixed_commission']`,
        categoryPercentageById: (category: string) => `//span[contains(text(), '#${category}')]/../../..//input[@id='percentage_commission']`,
        categoryFixedById: (category: string) => `//span[contains(text(), '#${category}')]/../../..//input[@id='fixed_commission']`,
        shippingFeeRecipient: (feeReceiver: string) => `//label[contains(@for,'${feeReceiver}-shipping_fee_recipient')]`,
        productTaxFeeRecipient: (feeReceiver: string) => `//label[contains(@for,'${feeReceiver}-tax_fee_recipient')]`,
        shippingTaxFeeRecipient: (feeReceiver: string) => `//label[contains(@for,'${feeReceiver}-shipping_tax_fee_recipient')]`,
        processRefundViaAPI: '#dokan_selling\\[automatic_process_api_refund\\]',

        // Vendor Capability
        enableSelling: '.new_seller_enable_selling .switch',
        onePageProductCreate: '.one_step_product_create .switch',
        disableProductPopup: '.disable_product_popup .switch',
        orderStatusChange: '.order_status_change .switch',
        selectAnyCategory: '.dokan_any_category_selection .switch',
        newProductStatus: (status: string) => `//label[contains(@for,'${status}-product_status')]`,
        duplicateProduct: '.vendor_duplicate_product .switch',
        editedProductStatus: '.edited_product_status .switch',
        productMailNotification: '.product_add_mail .switch',
        productCategorySelection: (category: string) => `//label[contains(@for,'${category}-product_category_style')]`,
        vendorsCanCreateTags: '.product_vendors_can_create_tags .switch',
        orderDiscount: '//div[contains(text(),"Order Discount")]//label[@class="switch tips"]',
        productDiscount: '//div[contains(text(),"Product Quantity Discount")]//label[@class="switch tips"]',

        hideCustomerInfo: '.hide_customer_info .switch',
        vendorProductReviewStatusChange: '.seller_review_manage .switch',
        guestProductEnquiry: '.enable_guest_user_enquiry .switch',
        newVendorEnableAuction: '.new_seller_enable_auction .switch',

        removeAddToCartButton: '.catalog_mode_hide_add_to_cart_button .switch',
        hideProductPrice: '.catalog_mode_hide_product_price .switch',

        disableShipping: '.disable_shipping_tab .switch',
    },

    // Withdraw
    withdraw: {
        // Withdraw Options
        withdrawMethodsPaypal: '//div[normalize-space(text())="PayPal"]',
        withdrawMethodsBankTransfer: '//div[contains(text()," Bank Transfer")]//label',
        withdrawMethodsWireCard: '//div[contains(text(),"Wirecard")]//label',
        withdrawMethodsPaypalMarketplace: '#dokan_withdraw\\[withdraw_methods\\]\\[dokan-paypal-marketplace\\]',
        withdrawMethodsDokanCustom: '//div[contains(text(),"Custom")]//label',
        withdrawMethodsRazorpay: '#dokan_withdraw\\[withdraw_methods\\]\\[dokan_razorpay\\]',
        withdrawMethodsMangoPay: '#dokan_withdraw\\[withdraw_methods\\]\\[dokan_mangopay\\]',
        withdrawMethodsStripe: '//div[contains(text(),"Stripe")]//label',
        withdrawMethodsStripeExpress: '#dokan_withdraw\\[withdraw_methods\\]\\[dokan_stripe_express\\]',
        withdrawMethodsSkrill: '//div[contains(text(),"Skrill")]//label',
        customMethodName: '#dokan_withdraw\\[withdraw_method_name\\]',
        customMethodType: '#dokan_withdraw\\[withdraw_method_type\\]',
        // withdraw charge
        payPalChargePercentage: '//h4[@class="field_heading" and text()="PayPal"]/../..//input[@id="percentage-val-id"]',
        payPalChargeFixed: '//h4[@class="field_heading" and text()="PayPal"]/../..//input[@id="fixed-val-id"]',
        bankTransferChargePercentage: '//h4[@class="field_heading" and text()="Bank Transfer"]/../..//input[@id="percentage-val-id"]',
        bankTransferChargeFixed: '//h4[@class="field_heading" and text()="Bank Transfer"]/../..//input[@id="fixed-val-id"]',
        skrillChargePercentage: '//h4[@class="field_heading" and text()="Skrill"]/../..//input[@id="percentage-val-id"]',
        skrillChargeFixed: '//h4[@class="field_heading" and text()="Skrill"]/../..//input[@id="fixed-val-id"]',
        customChargePercentage: '//h4[@class="field_heading" and text()="Custom"]/../..//input[@id="percentage-val-id"]',
        customPayPalChargeFixed: '//h4[@class="field_heading" and text()="Custom"]/../..//input[@id="fixed-val-id"]',
        minimumWithdrawAmount: '#dokan_withdraw\\[withdraw_limit\\]',
        orderStatusForWithdrawCompleted: '//div[contains(text(),"Completed")]//label',
        orderStatusForWithdrawProcessing: '//div[contains(text(),"Processing")]//label',
        orderStatusForWithdrawOnHold: '//div[contains(text(),"On-hold")]//label',
        excludeCodPayments: '.exclude_cod_payment .switch',
        withdrawThreshold: '#dokan_withdraw\\[withdraw_date_limit\\]',
        hideWithdrawOption: '.hide_withdraw_option .switch',
        // Disbursement Schedule Settings
        withdrawDisbursementManual: '//div[contains(text(),"Manual Withdraw")]//label',
        withdrawDisbursementAuto: '//div[contains(text(),"Schedule Disbursement")]//label',
        disburseMentQuarterlySchedule: '//div[contains(text(),"Quarterly")]//label',
        disburseMentMonthlySchedule: '//div[contains(text(),"Monthly")]//label',
        disburseMentBiweeklySchedule: '//div[contains(text(),"Biweekly (Twice Per Month)")]//label',
        disburseMentWeeklySchedule: '//div[contains(text(),"Weekly")]//label',
        quarterlyScheduleMonth: 'select[name="dokan_withdraw[quarterly_schedule][month]"]',
        quarterlyScheduleWeek: 'select[name="dokan_withdraw[quarterly_schedule][week]"]',
        quarterlyScheduleDay: 'select[name="dokan_withdraw[quarterly_schedule][days]"]',
        monthlyScheduleWeek: 'select[name="dokan_withdraw[monthly_schedule][week]"]',
        monthlyScheduleDay: 'select[name="dokan_withdraw[monthly_schedule][days]"]',
        biweeklyScheduleWeek: 'select[name="dokan_withdraw[biweekly_schedule][week]"]',
        biweeklyScheduleDay: 'select[name="dokan_withdraw[biweekly_schedule][days]"]',
        weeklyScheduleDay: 'select[name="dokan_withdraw[weekly_schedule]"]',
    },

    // Reverse Withdraw Settings
    reverseWithdraw: {
        // Reverse Withdraw Settings
        enableReverseWithdrawal: '.enabled.dokan-settings-field-type-switcher .switch',
        enableReverseWithdrawalForThisGateway: '.payment_gateways.dokan-settings-field-type-multicheck .switch',
        billingType: '#dokan_reverse_withdrawal\\[billing_type\\]',
        monthlyBillingDate: '#dokan_reverse_withdrawal\\[monthly_billing_day\\]',
        reverseBalanceThreshold: '#dokan_reverse_withdrawal\\[reverse_balance_threshold\\]',
        gracePeriod: '#dokan_reverse_withdrawal\\[due_period\\]',
        disableAddToCartButton: '//div[contains(text(),"Disable Add to Cart Button")]//label',
        hideWithdrawMenu: '//div[contains(text(),"Hide Withdraw Menu")]//label',
        MakeVendorStatusInactive: '//div[contains(text(),"Make Vendor Status Inactive")]//label',
        displayNoticeDuringGracePeriod: '.display_notice.dokan-settings-field-type-switcher .switch',
        sendAnnouncement: '.send_announcement.dokan-settings-field-type-switcher .switch',
    },

    // Pages
    page: {
        // Page Settings
        dashboard: 'select#dokan_pages\\[dashboard\\]',
        myOrders: 'select#dokan_pages\\[my_orders\\]',
        storeListing: 'select#dokan_pages\\[store_listing\\]',
        termsAndConditions: 'select#dokan_pages\\[reg_tc_page\\]',
    },

    // Appearance
    appearance: {
        // Appearance
        showMapOnStorePage: '.store_map .switch',
        mapApiSource: (source: string) => `//label[contains(@for,'${source}-map_api_source')]`,
        googleMapApiKey: '#dokan_appearance\\[gmap_api_key\\]',
        mapBoxAccessToken: '#dokan_appearance\\[mapbox_access_token\\]',
        googleReCAPTCHA: '.recaptcha_validation_label .dashicons',
        googleReCAPTCHAValidationSiteKey: '//h3[contains(text()," Site Key")]//..//..//input',
        googleReCAPTCHAValidationSecretKey: '//h3[contains(text(),"Secret Key")]//..//..//input]',
        showContactFormOnStorePage: '.contact_seller .switch',
        storeHeaderTemplate1: '.radio-image:nth-child(1) .button',
        storeHeaderTemplate2: '.radio-image:nth-child(2) .button',
        storeHeaderTemplate3: '.radio-image:nth-child(3) .button',
        storeHeaderTemplate4: '.radio-image:nth-child(4) .button',
        storeBannerWidth: '#dokan_appearance\\[store_banner_width\\]',
        storeBannerHeight: '#dokan_appearance\\[store_banner_height\\]',
        storeOpeningClosingTimeWidget: '.store_open_close .switch',
        enableStoreSidebarFromTheme: '.enable_theme_store_sidebar .switch',

        hideVendorInfoEmailAddress: '//div[contains(text(),"Email Address")]//label[@class="switch tips"]',
        hideVendorInfoPhoneNumber: '//div[contains(text(),"Phone Number")]//label[@class="switch tips"]',
        hideVendorInfoStoreAddress: '//div[contains(text(),"Store Address")]//label[@class="switch tips"]',
    },

    // Menu Manager
    menuManager: {
        leftMenu: '//a[contains(text(),"Left Menu")]',
        settingsSubMenu: '//a[contains(text(),"Settings Sub Menu")]',
        resetAll: 'div.menu-manager-reset-all',
        confirmReset: '.swal2-confirm',
        cancelReset: '.swal2-cancel',
        menuParent: '(//div[@class="tabs-details"]//div)[2]',
        allMenus: 'div.menu_manager_menu_tab div.menu-item',
        menuGrabber: (menuName: string) => `//span[text()='${menuName}']/../..`,
        menuEdit: (menuName: string) => `//span[text()='${menuName}']/../..//div[@class='action-icon-wrapper edit-icon-wrapper']`,
        menuNameInput: '//div[@class="first-part"]//input',
        menuNameConfirm: '//div[@class="menu-item"]//div[@class="action-icon-wrapper check-icon-wrapper"]',
        menuNameCancel: '//div[@class="menu-item"]//div[@class="action-icon-wrapper cancel-icon-wrapper"]',
        menuSwitcher: (menuName: string) => `(//div[@class="tabs-details"]//div[not(@style="display: none;")])[1]//span[text()='${menuName}']/../..//label[@class="switch tips"]`,
        noPermissionNotice: '//strong[text()="You have no permission to view this page"]',
    },

    // Privacy Policy
    privacyPolicy: {
        // Privacy Policy
        enablePrivacyPolicy: '.enable_privacy .switch',
        privacyPage: '#dokan_privacy\\[privacy_page\\]',
        privacyPolicyIframe: 'iframe',
        privacyPolicyHtmlBody: '#tinymce',
    },

    // Colors
    colors: {
        predefineColorPalette: '//h3[normalize-space()="Pre-defined Color Palette"]/../..',
        customColorPalette: '//h3[normalize-space()="Custom Color Palette"]/../..',
        predefinedPalette: (paletteName: string) => `//label[text()='${paletteName}']/..//input[@name='store_color_pallete']`,
        // Button Text
        openColorPicker: (option: string) => `//h4[text()='${option}']//..//div[@class='color-picker-container']`,
        colorInput: 'input.hex-input',
        saveColor: 'button.dashicons-saved',

        customPalette: {
            resetAll: 'btnReset',
            buttonTextColor: '.btn_text span',
            buttonBackgroundColor: '.btn_primary span',
            buttonBorderColor: '.btn_primary_border span',
            buttonHoverTextColor: '.btn_hover_text span',
            buttonHoverColor: '.btn_hover span',
            buttonHoverBorderColor: '.btn_hover_border span',
            dashboardNavigationText: '.dash_nav_text span',
            dashboardNavigationActiveMenu: '.dash_active_link span',
            dashboardNavigationBackground: '.dash_nav_bg span',
            dashboardMenuBorder: '.dash_nav_border span',
        },
    },

    // live search
    liveSearch: {
        liveSearchOptions: '#dokan_live_search_setting\\[live_search_option\\]',
    },

    // store support
    storeSupport: {
        displayOnOrderDetails: '.enabled_for_customer_order .switch',
        displayOnSingleProductPage: '#dokan_store_support_setting\\[store_support_product_page\\]',
        supportButtonLabel: '#dokan_store_support_setting\\[support_button_label\\]',
    },

    // vendor verification
    vendorVerification: {
        verifiedIcon: (iconName: string) => `//label[@for='dokan_verification[verified_icon][${iconName}]']`,
        verifiedIconByIcon: (iconName: string) => `//i[@class='${iconName}']//../..`,
        verificationMethodRow: (methodName: string) => `//p[text()[normalize-space()='${methodName}']]/../../..`,
        enableVerificationMethod: (methodName: string) => `//p[text()[normalize-space()='${methodName}']]/../../..//label[@class="switch tips"]`,
        editVerificationMethod: (methodName: string) => `button[aria-label="Edit ${methodName} verification method"]`,
        deleteVerificationMethod: (methodName: string) => `button[aria-label="Delete ${methodName} verification method"]`,

        confirmDelete: '.swal2-confirm',
        cancelDelete: '.swal2-cancel',
        methodCreateSuccessMessage: '//div[text()="Created Successfully."]',
        methodUpdateSuccessMessage: '//div[text()="Updated Successfully."]',
        methodDeleteSuccessMessage: '//div[text()="Deleted Successfully."]',

        addNewVerification: {
            addNewVerification: '//button[text()[normalize-space()="Add New"]]',
            closeModal: '//button[text()[normalize-space()="×"]]',
            label: 'input#label-text',
            helpText: 'input#label-help',
            required: 'input#field-required',
            cancel: '//button[text()[normalize-space()="Cancel"]]',
            create: '//span[text()[normalize-space()="Create"]]/..',
            update: '//span[text()[normalize-space()="Update"]]',
        },

        // Social Connect
        socialConnect: {
            enableMethod: (methodName: string) => `//div[@class='${methodName} dokan-settings-field-type-social']//label[@class='switch tips']`,
            settings: (methodName: string) => `//div[@class='${methodName} dokan-settings-field-type-social']//span[contains(@class,"active-social-expend-btn")]`,

            // todo: need to update all social connect locators
            facebook: {
                facebookAppId: '#dokan_verification\\[fb_app_id\\]',
                facebookAppSecret: '#dokan_verification\\[fb_app_secret\\]',
            },
            twitter: {
                consumerKey: '#dokan_verification\\[twitter_app_id\\]',
                consumerSecret: '#dokan_verification\\[twitter_app_secret\\]',
            },
            google: {
                googleClientId: '#dokan_verification\\[google_app_id\\]',
                googleClientSecret: '#dokan_verification\\[google_app_secret\\]',
            },
            linked: {
                linkedinClientId: '#dokan_verification\\[linkedin_app_id\\]',
                linkedinClientSecret: '#dokan_verification\\[linkedin_app_secret\\]',
            },
        },
    },

    // Verification Sms Gateways
    verificationSmsGateway: {
        // Verification Sms Gateways
        senderName: 'input#dokan_verification_sms_gateways\\[sender_name\\]',
        smsText: 'textarea#dokan_verification_sms_gateways\\[sms_text\\]',
        smsSentSuccess: 'textarea#dokan_verification_sms_gateways\\[sms_sent_msg\\]',
        smsSentError: 'textarea#dokan_verification_sms_gateways\\[sms_sent_error\\]',
        activeGateway: (gateway: string) => `//label[contains(@for,'${gateway}-active_gateway')]`,
        enableGateway: (gateway: string) => `//div[@class="${gateway}_details dokan-settings-field-type-social"] //label[@class="switch tips"]`,
        expandButton: 'div.expand_btn span.dashicons',

        // Vonage
        vonage: {
            apiKey: '//h3[normalize-space(text())="API Key"]/../..//input',
            apiSecret: '//h3[normalize-space(text())="API Secret"]/../..//input',
        },
        // Twilio
        twilio: {
            fromNumber: '//h3[normalize-space(text())="From Number"]/../..//input',
            accountSid: '//h3[normalize-space(text())="Account SID"]/../..//input',
            authToken: '//h3[normalize-space(text())="Auth Token"]/../..//input',
            SMSCodeTypeNumeric: '//input[@value="numeric"]',
            SMSCodeTypeAlphanumeric: '//input[@value="alphanumeric"]',
        },
    },

    // Email Verification
    emailVerification: {
        // Email Verification
        enableEmailVerification: '//label[@for="dokan_email_verification[enabled]"]//label[@class="switch tips"]',
        registrationNotice: 'textarea#dokan_email_verification\\[registration_notice\\]',
        loginNotice: 'textarea#dokan_email_verification\\[login_notice\\]',
    },

    // Social API
    socialApi: {
        enableSocialLogin: '//label[@for="dokan_social_api[enabled]"]//label[@class="switch tips"]',
        enableSocialApi: (platform: string) => `//div[@class="${platform}_details dokan-settings-field-type-social"]//label[@class="switch tips"]`,
        expandButton: (platform: string) => `//div[@class="${platform}_details dokan-settings-field-type-social"]//div[@class="expand_btn"]//span`,

        facebook: {
            appId: '//h3[normalize-space(text())="App ID"]/../..//input',
            appSecret: '//h3[normalize-space(text())="App Secret"]/../..//input',
        },

        twitter: {
            consumerKey: '//h3[normalize-space(text())="Consumer Key"]/../..//input',
            consumerSecret: '//h3[normalize-space(text())="Consumer Secret"]/../..//input',
        },

        google: {
            clientId: '//h3[normalize-space(text())="Client ID"]/../..//input',
            clientSecret: '//h3[normalize-space(text())="Client Secret"]/../..//input',
        },

        linked: {
            clientId: '//h3[normalize-space(text())="Client ID"]/../..//input',
            clientSecret: '//h3[normalize-space(text())="Client Secret"]/../..//input',
        },

        apple: {
            appleServiceId: '//h3[normalize-space(text())="Apple Service ID"]/../..//input',
            appleTeamId: '//h3[normalize-space(text())="Apple Team ID"]/../..//input',
            appleKeyId: '//h3[normalize-space(text())="Apple Key ID"]/../..//input',
            appleKeyContent: '//h3[normalize-space(text())="Apple Key Content (including BEGIN and END lines)"]/../..//textarea',
        },
    },

    // Shipping Status
    shippingStatus: {
        allowShipmentTracking: 'label[for="dokan_shipping_status_setting[enabled]"] label',

        // Shipping Providers
        shippingProviders: {
            australiaPost: '//input[@value="sp-australia-post"]/..',
            canadaPost: '//input[@value="sp-canada-post"]/..',
            cityLink: '//input[@value="sp-city-link"]/..',
        },

        customShippingStatusInput: 'input.regular-text',
        customShippingStatusAdd: 'a.dokan-repetable-add-item-btn',
    },

    // Quote
    quote: {
        // Configuration
        enableQuoteForOutOfStockProducts: 'label[for="dokan_quote_settings[enable_out_of_stock]"] label.switch',
        enableAjaxAddToQuote: 'label[for="dokan_quote_settings[enable_ajax_add_to_quote]"] label.switch',
        redirectToQuotePage: 'label[for="dokan_quote_settings[redirect_to_quote_page]"] label.switch',

        // Quote Attributes Settings
        decreaseOfferedPrice: 'input#dokan_quote_settings\\[decrease_offered_price\\]',
        enableConvertToOrder: 'label[for="dokan_quote_settings[enable_convert_to_order]"] label.switch',
        enableQuoteConverterDisplay: 'label[for="dokan_quote_settings[enable_quote_converter_display]"] label.switch',
    },

    // Live Chat
    liveChat: {
        enableLiveChat: '//label[@for="dokan_live_chat[enable]"]',
        chatProvider: (provider: string) => `//label[contains(@for,'${provider}-provider')]`,

        // Fb
        messengerColor: 'div.color-picker-container span.dashicons',

        // Talkjs
        talkJsAppId: 'input#dokan_live_chat\\[app_id\\]',
        talkJsAppSecret: 'input#dokan_live_chat\\[app_secret\\]',

        // Whatsapp
        openingPattern: 'select#dokan_live_chat\\[wa_opening_method\\]',
        preFilledMessage: 'textarea#dokan_live_chat\\[wa_pre_filled_message\\]',

        // Chat Button
        chatButtonOnVendorPage: '//label[@for="dokan_live_chat[chat_button_seller_page]"]',
        chatButtonOnProductPage: '#dokan_live_chat\\[chat_button_product_page\\]',
    },

    // Rma
    rma: {
        orderStatus: '#dokan_rma\\[rma_order_status\\]',
        enableRefundRequests: '.rma_enable_refund_request .switch',
        enableCouponRequests: '.rma_enable_coupon_request .switch',
        reasonsForRmaSingle: (reason: string) => `//li[contains(text(),'${reason}')]//span[@class="dashicons dashicons-no-alt remove-item"]`,
        reasonsForRma: '.remove-item',
        reasonsForRmaInput: '.regular-text',
        reasonsForRmaAdd: '.dokan-repetable-add-item-btn',
        refundPolicyIframe: 'iframe',
        refundPolicyHtmlBody: '#tinymce',
    },

    // Wholesale
    wholesale: {
        whoCanSeeWholesalePrice: (type: string) => `//label[contains(@for,'${type}_user-wholesale_price_display')]`,
        showWholesalePriceOnShopArchive: '.display_price_in_shop_archieve .switch',
        needApprovalForCustomer: '.need_approval_for_wholesale_customer .switch',
    },

    // Eu Compliance Fields
    euCompliance: {
        vendorExtraFieldsCompanyName: '//input[@value="dokan_company_name"]//..',
        vendorExtraFieldsCompanyIdOrEuidNumber: '//input[@value="dokan_company_id_number"]//..',
        vendorExtraFieldsVatOrTaxNumber: '//input[@value="dokan_vat_number"]//..',
        vendorExtraFieldsNameOfBank: '//input[@value="dokan_bank_name"]//..',
        vendorExtraFieldsBankIban: '//input[@value="dokan_bank_iban"]//..',
        displayInVendorRegistrationForm: '.vendor_registration .switch',
        customerExtraFieldsCompanyIdOrEuidNumber: '//input[@value="billing_dokan_company_id_number"]//..',
        customerExtraFieldsVatOrTaxNumber: '//input[@value="billing_dokan_vat_number"]//..',
        customerExtraFieldsNameOfBank: '//input[@value="billing_dokan_bank_name"]//..',
        customerExtraFieldsBankIban: '//input[@value="billing_dokan_bank_iban"]//..',
        enableGermanizedSupportForVendors: '.enabled_germanized .switch',
        vendorsWillBeAbleToOverrideInvoiceNumber: '.override_invoice_number .switch',
    },

    // Delivery Time
    deliveryTime: {
        allowVendorSettings: '.allow_vendor_override_settings .switch',
        homeDelivery: '//div[contains(text(), "Home Delivery")]//label[@class="switch tips"]',
        storePickup: '//div[contains(text(), "Store Pickup")]//label[@class="switch tips"]',
        deliveryDateLabel: '#dokan_delivery_time\\[delivery_date_label\\]',
        deliveryBlockedBuffer: '#dokan_delivery_time\\[preorder_date\\]',
        timeSlot: '#dokan_delivery_time\\[time_slot_minutes\\]',
        orderPerSlot: '#dokan_delivery_time\\[order_per_slot\\]',
        deliveryBoxInfo: '#dokan_delivery_time\\[delivery_box_info\\]',
        requireDeliveryDateAndTime: '.selection_required .switch',
        deliveryDay: (day: string) => `//h3[contains(text(), '${day}')]/../..//label[@class='switch tips']`,
        openingTime: (day: string) => `//input[@id="dokan_delivery_time[delivery_day_${day.toLowerCase()}][opening_time]"]/..`,
        openingTimeDatePicker: (time: string) => `(//li[contains(text(),'${time}')])[2]`,
        closingTime: (day: string) => `//input[@id="dokan_delivery_time[delivery_day_${day.toLowerCase()}][closing_time]"]/..`,
        closingTimeDatePicker: (time: string) => `(//li[contains(text(),'${time}')])[1]`,
        fullDay: 'li.fullDayClock',
    },

    // Product Advertising
    productAdvertising: {
        noOfAvailableSlot: '#dokan_product_advertisement\\[total_available_slot\\]',
        expireAfterDays: '#dokan_product_advertisement\\[expire_after_days\\]',
        vendorCanPurchaseAdvertisement: '.per_product_enabled .switch',
        advertisementCost: '#dokan_product_advertisement\\[cost\\]',
        enableAdvertisementInSubscription: '.vendor_subscription_enabled .switch',
        markAdvertisedProductAsFeatured: '.featured .switch',
        displayAdvertisedProductOnTop: '.catalog_priority .switch',
        outOfStockVisibility: '.hide_out_of_stock_items .switch',
    },

    // Geolocation
    geolocation: {
        locationMapPosition: (position: string) => `//label[contains(@for,'${position}-show_locations_map')]`,
        showMap: (type: string) => `//label[contains(@for,'${type}-show_location_map_pages')]`,
        showFiltersBeforeLocationMap: '.show_filters_before_locations_map .switch',
        productLocationTab: '.show_product_location_in_wc_tab .switch',
        radiusSearchUnit: (unit: string) => `//label[contains(@for,'${unit}-distance_unit')]`,
        radiusSearchMinimumDistance: '#dokan_geolocation\\[distance_min\\]',
        radiusSearchMaximumDistance: '#dokan_geolocation\\[distance_max\\]',
        mapZoomLevel: '#dokan_geolocation\\[map_zoom\\]',
        defaultLocation: '.search-address',
        mapResultFirst: '(//div[contains(@class,"pac-container")]//div[@class="pac-item"])[1]',
    },

    // Product Report Abuse
    productReportAbuse: {
        reportedBy: '#dokan_report_abuse\\[reported_by_logged_in_users_only\\]',
        reasonsForAbuseReportList: '.dokan-settings-repeatable-list li',
        reasonsForAbuseReportSingle: (reason: string) => `//li[contains(text(),'${reason}')]//span[@class="dashicons dashicons-no-alt remove-item"]`,
        reasonsForAbuseReportInput: '.regular-text',
        reasonsForAbuseReportAdd: '.dokan-repetable-add-item-btn',
    },

    // Product Form Manager
    productFormManager: {
        resetAll: '//a[normalize-space(text())="Reset All"]',

        blockSection: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..`,
        enableBlock: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//div[contains(@class,'block-header-toggle')]//label[@class="switch tips"]`,
        editBlock: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//span[normalize-space(text())="Edit Block"]/..`,
        deleteBlock: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//button[contains(@class,'delete-button')]`,

        blockContents: {
            label: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//input[@id="input-label"]`,
            description: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//input[@id="input-desc"]`,

            specificProductTypeDropdown: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//label[normalize-space()="Specific Product Type"]/..//div[@class="multiselect__select"]`,
            productType: (productType: string) => `//div[@role="combobox" and contains(@class,'multiselect multiselect--active') ]//ul[@role="listbox"]//span[normalize-space(text())="${productType}"]`,
            selectedProductType: (blockName: string, productType: string) =>
                `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//label[normalize-space()="Specific Product Type"]/..//span[@class="multiselect__single" and normalize-space(text())="${productType}"]`,

            specificProductCategoryDropdown: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//label[normalize-space()="Specific Product Category"]/..//div[@class="multiselect__select"]`,
            inputProductCategory: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//input[@placeholder="All Product Categories"]`,
            searchedResult: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//label[normalize-space()="Specific Product Category"]/..//span[@class="multiselect__option multiselect__option--highlight"]/..`,
            selectedProductCategory: (blockName: string, productType: string) =>
                `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//label[normalize-space()="Specific Product Category"]/..//span[@class="multiselect__single" and normalize-space(text())="${productType}"]`,

            cancel: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../..//button[@id="input-Cancel"]`,
            done: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../..//button[@id="input-submit"]`,
        },

        addField: (blockName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//span[normalize-space(text())='Add Field']/..`,

        fieldSection: (blockName: string, fieldName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//h3[normalize-space(text())='${fieldName}']/../..`,
        enableField: (blockName: string, fieldName: string) =>
            `(//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//h3[normalize-space(text())='${fieldName}']/../..//span[normalize-space(text())='Enabled']/..//label[@class="switch tips"])[last()]`, //todo: resolve the issue
        requireField: (blockName: string, fieldName: string) =>
            `(//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//h3[normalize-space(text())='${fieldName}']/../..//span[normalize-space(text())='Required']/..//label[@class="switch tips"])[last()]`,
        editField: (blockName: string, fieldName: string) => `(//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//h3[normalize-space(text())='${fieldName}']/../..//button[contains(@class,'field-edit-button')])[last()]`,

        fieldContents: {
            label: (blockName: string, fieldName: string) =>
                `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//h3[normalize-space(text())='${fieldName}']/../../..//div[@class="field-form-control-wrapper"]//input[@id="field-input-label"]`,
            type: (blockName: string, fieldName: string) =>
                `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//h3[normalize-space(text())='${fieldName}']/../../..//div[@class="field-form-control-wrapper"]//select[@id="field-input-type"]`,
            placeholder: (blockName: string, fieldName: string) =>
                `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//h3[normalize-space(text())='${fieldName}']/../../..//div[@class="field-form-control-wrapper"]//input[@id='input-placeholder']`,
            helpContent: (blockName: string, fieldName: string) =>
                `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//h3[normalize-space(text())='${fieldName}']/../../..//div[@class="field-form-control-wrapper"]//input[@id='input-help-content']`,
            cancel: (blockName: string, fieldName: string) =>
                `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//h3[normalize-space(text())='${fieldName}']/../../..//div[@class="field-form-control-wrapper"]//button[@id="input-Cancel"]`,
            done: (blockName: string, fieldName: string) => `//h3[contains(@class,'block-header-title') and normalize-space(text())="${blockName}"]/../../../../..//h3[normalize-space(text())='${fieldName}']/../../..//div[@class="field-form-control-wrapper"]//button[@id="input-submit"]`,
        },

        // edit custom field
        editCustomField: '//div[@role="menu"]//span[normalize-space()="Edit"]',
        deleteCustomField: '//div[@role="menu"]//span[normalize-space()="Delete"]',
        confirmRemove: 'button.swal2-confirm',
        cancelRemove: 'button.swal2-cancel',

        createCustomBlock: '//button[contains(.,"Create Custom Block")]',
    },

    // Single Product Multi Vendor
    spmv: {
        enableSingleProductMultipleVendor: '.enable_pricing .switch',
        sellItemButtonText: '#dokan_spmv\\[sell_item_btn\\]',
        availableVendorDisplayAreaTitle: '#dokan_spmv\\[available_vendor_list_title\\]',
        availableVendorSectionDisplayPosition: '#dokan_spmv\\[available_vendor_list_position\\]',
        showSpmvProducts: '#dokan_spmv\\[show_order\\]',
    },

    // printful
    printful: {
        expandButton: 'div#dokan_printful div.app span.dashicons-arrow-down-alt2',
        clientId: '//h3[normalize-space(text())="Client ID"]/../..//input',
        secretKey: '//h3[normalize-space(text())="Secret key"]/../..//input',

        sizeGuidePopupTitle: 'input#dokan_printful\\[popup_title\\]',
        sizeGuideButtonText: 'input#dokan_printful\\[size_guide_button_text\\]',
        primaryMeasurementUnit: 'select#dokan_printful\\[primary_measurement_unit\\]', // inches, centimetre

        // Size Guide Popup Text Color, Size Guide Popup Background Color, Size Guide Tab Background Color, Size Guide Active Tab Background Color, Size Guide Button Text Color
        openColorPicker: (optionName: string) => `//h3[normalize-space(text())='${optionName}']//..//..//button[@class='button color-picker-button']`,
        colorInput: 'input.hex-input',
        saveColor: 'button.dashicons-saved',
    },

    // Vendor Subscription
    vendorSubscriptions: {
        subscription: '#dokan_product_subscription\\[subscription_pack\\]',
        enableProductSubscription: '.enable_pricing .switch',
        enableSubscriptionInRegistrationForm: '.enable_subscription_pack_in_reg .switch',
        enableEmailNotification: '.notify_by_email .switch',
        noOfDays: '#dokan_product_subscription\\[no_of_days_before_mail\\]',
        productStatus: '#dokan_product_subscription\\[product_status_after_end\\]',
        cancellingEmailSubject: '#dokan_product_subscription\\[cancelling_email_subject\\]',
        cancellingEmailBody: '#dokan_product_subscription\\[cancelling_email_body\\]',
        alertEmailSubject: '#dokan_product_subscription\\[alert_email_subject\\]',
        alertEmailBody: '#dokan_product_subscription\\[alert_email_body\\]',
    },

    // Vendor Analytics
    vendorAnalytics: {
        vendorAnalyticsSaveChanges: '#submit',
    },

    // Update Settings
    dokanUpdateSuccessMessage: '#setting-message_updated > p > strong',
};

export class SettingsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Navigation ----------------------------------------------------------

    // goto Dokan settings only if we are not already there (mirrors goIfNotThere:
    // avoids a redundant reload that would reset the currently-open settings tab).
    private async goToDokanSettings(): Promise<void> {
        const target = toPath(data.subUrls.backend.dokan.settings);
        if (this.page.url().replace(/\/$/, '') === target.replace(/\/$/, '')) return;
        await expect(async () => {
            await this.page.goto(target, { waitUntil: 'domcontentloaded' });
            expect(this.page.url()).toContain(data.subUrls.backend.dokan.settings);
        }).toPass();
    }

    // navigate to settings, force a reload (the '#'-fragment URL doesn't reload on
    // its own), open a menu tab and confirm its title — retried until it lands.
    private async goToSingleDokanSettings(settingMenu: string, settingTitle: string): Promise<void> {
        await expect(async () => {
            await this.page.goto(toPath(data.subUrls.backend.dokan.settings), { waitUntil: 'domcontentloaded' });
            await this.page.reload();
            await this.page.locator(settingMenu).click();
            await expect(this.page.locator(settingsSelectors.settingTitle)).toContainText(settingTitle, { timeout: 3000 });
        }).toPass();
    }

    // ---- Raw-Playwright helpers (ported from the base-class semantics) --------

    private async getBackgroundColor(selector: string): Promise<string> {
        return await this.page.locator(selector).evaluate(el => window.getComputedStyle(el).getPropertyValue('background-color'));
    }

    // switcher toggles live in a nested <span>; xpath needs '//span', css needs ' span'.
    private switcherSpan(selector: string): string {
        return /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
    }

    // enable a Dokan settings switcher only if it is currently OFF (blue = ON).
    private async enableSwitcher(selector: string): Promise<void> {
        const span = this.switcherSpan(selector);
        const value = await this.getBackgroundColor(span);
        if (!value.includes('rgb(0, 144, 255)')) {
            await this.page.locator(span).click();
        }
    }

    // disable a switcher only if it is currently ON.
    private async disableSwitcher(selector: string): Promise<void> {
        const span = this.switcherSpan(selector);
        const value = await this.getBackgroundColor(span);
        if (value.includes('rgb(0, 144, 255)')) {
            await this.page.locator(span).click();
        }
    }

    // enable a switcher that triggers a REST call, returning that response (or ''
    // when it was already ON and nothing was clicked).
    private async enableSwitcherAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response | string> {
        const span = this.switcherSpan(selector);
        const value = await this.getBackgroundColor(span);
        if (!value.includes('rgb(0, 144, 255)')) {
            const [response] = await Promise.all([
                this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
                this.page.locator(span).click(),
            ]);
            return response;
        }
        return '';
    }

    // Click "Save Changes" and wait for the real `dokan_save_settings` admin-ajax POST.
    //
    // The legacy Dokan settings form binds its ajax submit handler asynchronously. If
    // "Save Changes" is clicked before that handler is ready, the browser performs a
    // NATIVE form submit that reloads the whole page back onto the default (#/settings)
    // tab — dropping the current tab's fields — after which an unrelated admin-ajax
    // call (heartbeat / settings fetch) can falsely satisfy a loose "any admin-ajax
    // 200" wait, masking the reload. That is exactly the CI failure mode: the assert
    // that follows a save then can't find its tab-scoped field ("navigated to
    // #/settings"). So settle the page first (handler binds by networkidle), then
    // retry the click until the SPECIFIC dokan_save_settings request fires and 200s.
    private async saveSettings(reopen?: { menu: string; title: string }): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await expect(async () => {
            const [response] = await Promise.all([
                this.page.waitForResponse(
                    resp =>
                        resp.url().includes(data.subUrls.ajax) &&
                        resp.request().method() === 'POST' &&
                        (resp.request().postData() ?? '').includes('action=dokan_save_settings') &&
                        resp.status() === 200,
                    { timeout: 15000 },
                ),
                this.page.locator(settingsSelectors.saveChanges).click(),
            ]);
            expect(response.status()).toBe(200);
        }).toPass({ intervals: [1000, 2000, 3000], timeout: 90000 });

        // Sections that contain a `refresh_after_save` field (Withdraw's withdraw_charges,
        // Live Chat, Appearance's map_api_source, Reverse Withdrawal, Menu Manager,
        // Shipping) make Settings.vue call window.location.reload() on a successful save.
        // That reload drops the form back to the settings-menu landing and races any
        // value assertion the caller runs next (the CI failure: "navigated to #/settings",
        // tab-scoped field "element(s) not found"). When the caller flags such a section,
        // re-open it on the reloaded page so persisted values render on a fresh form.
        if (reopen) {
            await this.goToSingleDokanSettings(reopen.menu, reopen.title);
        }
    }

    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).fill(text),
        ]);
    }

    // assert every leaf selector in a (possibly nested) selector object is visible;
    // function-valued (parameterised) selectors are skipped.
    private async multipleElementVisible(selectors: { [key: string]: unknown }): Promise<void> {
        for (const key in selectors) {
            const value = selectors[key];
            if (helpers.isPlainObject(value)) {
                await this.multipleElementVisible(value as { [key: string]: unknown });
            } else if (typeof value === 'function') {
                continue;
            } else {
                await expect(this.page.locator(value as string)).toBeVisible();
            }
        }
    }

    private async toHaveBackgroundColor(selector: string, color: string): Promise<void> {
        await expect(async () => {
            expect(await this.getBackgroundColor(selector)).toBe(color);
        }).toPass();
    }

    private async toHaveSelectedValue(selector: string, value: string): Promise<void> {
        await expect(async () => {
            const selected = await this.page.locator(selector).evaluate(el => (el as HTMLSelectElement).value);
            expect(selected).toBe(value);
        }).toPass();
    }

    // poll for visibility up to `timeoutSec` (mirrors the base-class isVisible).
    private async isVisible(selector: string, timeoutSec = 2): Promise<boolean> {
        const start = Date.now();
        while (Date.now() - start < timeoutSec * 1000) {
            if (await this.page.locator(selector).isVisible().catch(() => false)) return true;
            await this.page.waitForTimeout(100);
        }
        return false;
    }

    private async clickIfVisible(selector: string): Promise<void> {
        if (await this.isVisible(selector, 1)) {
            await this.page.locator(selector).click();
        }
    }

    private async scrollToTop(): Promise<void> {
        await this.page.keyboard.down(data.key.home);
    }

    private async scrollToBottom(): Promise<void> {
        await this.page.keyboard.down(data.key.end);
    }

    // ---- Settings render / search / scroll -----------------------------------

    // dokan settings render properly
    async dokanSettingsRenderProperly(): Promise<void> {
        await this.goToDokanSettings();

        // settings text is visible
        await expect(this.page.locator(settingsSelectors.settingsText)).toBeVisible();

        // settings section elements are visible
        await this.multipleElementVisible(settingsSelectors.sections);

        // settings header elements are visible
        await this.multipleElementVisible(settingsSelectors.header);

        // settings field is visible
        await expect(this.page.locator(settingsSelectors.fields)).toBeVisible();

        // settings save changes is visible
        await expect(this.page.locator(settingsSelectors.saveChanges)).toBeVisible();
    }

    // search settings
    async searchSettings(settings: string): Promise<void> {
        await this.goToDokanSettings();

        await this.page.locator(settingsSelectors.search.input).fill(settings);
        await expect(this.page.locator(settingsSelectors.fields)).toBeVisible();
        await this.page.locator(settingsSelectors.search.close).click();
    }

    // scroll to top settings
    async scrollToTopSettings(): Promise<void> {
        await this.page.goto(toPath(data.subUrls.backend.dokan.settings), { waitUntil: 'domcontentloaded' });
        // toPass is used to avoid flakiness
        await expect(async () => {
            await this.scrollToBottom();
            const isBackToTopVisible = await this.isVisible(settingsSelectors.backToTop, 1);
            if (!isBackToTopVisible) {
                await this.scrollToTop();
            }
            expect(isBackToTopVisible).toBeTruthy();
        }).toPass();

        await this.page.locator(settingsSelectors.backToTop).click();
        await expect(this.page.locator(settingsSelectors.search.searchBox)).toBeVisible();
    }

    // ---- Dokan settings setters ----------------------------------------------

    // admin set dokan general settings
    async setDokanGeneralSettings(general: dokanSettings['general']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.general).click();

        // site options
        await this.enableSwitcher(settingsSelectors.general.adminAreaAccess);
        await this.page.locator(settingsSelectors.general.vendorStoreUrl).fill(general.vendorStoreUrl);
        await this.page.frameLocator(settingsSelectors.general.setupWizardMessageIframe).locator(settingsSelectors.general.setupWizardMessageHtmlBody).fill(general.setupWizardMessage);
        if (DOKAN_PRO) {
            await this.page.locator(settingsSelectors.general.sellingProductTypes(general.sellingProductTypes)).click();
        }

        // vendor store options
        await this.enableSwitcher(settingsSelectors.general.storeTermsAndConditions);
        await this.page.locator(settingsSelectors.general.storeProductPerPage).fill(general.storeProductPerPage);
        if (DOKAN_PRO) {
            await this.enableSwitcher(settingsSelectors.general.enableTermsAndCondition);
            await this.page.locator(settingsSelectors.general.storCategory(general.storCategory)).click();
        }

        // product page settings
        await this.enableSwitcher(settingsSelectors.general.showVendorInfo);
        await this.enableSwitcher(settingsSelectors.general.enableMoreProductsTab);

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(general.saveSuccessMessage);
    }

    // admin set dokan selling settings
    async setDokanSellingSettings(selling: dokanSettings['selling']): Promise<void> {
        await this.goToSingleDokanSettings(settingsSelectors.menus.sellingOptions, selling.settingTitle);

        // commission settings
        await this.page.locator(settingsSelectors.selling.commissionType).selectOption({ value: selling.commission.commissionType });
        await this.page.locator(settingsSelectors.selling.percentage).fill(selling.commission.commissionPercentage);
        await this.page.locator(settingsSelectors.selling.fixed).fill(selling.commission.commissionFixed);
        await this.page.locator(settingsSelectors.selling.shippingFeeRecipient(selling.shippingFeeRecipient)).click();
        await this.page.locator(settingsSelectors.selling.productTaxFeeRecipient(selling.productTaxFeeRecipient)).click();
        await this.page.locator(settingsSelectors.selling.shippingTaxFeeRecipient(selling.shippingTaxFeeRecipient)).click();

        // vendor capabilities
        await this.enableSwitcher(settingsSelectors.selling.enableSelling);
        await this.enableSwitcher(settingsSelectors.selling.onePageProductCreate);
        await this.enableSwitcher(settingsSelectors.selling.orderStatusChange);
        await this.enableSwitcher(settingsSelectors.selling.selectAnyCategory);
        if (DOKAN_PRO) {
            await this.page.locator(settingsSelectors.selling.newProductStatus(selling.newProductStatus)).click();
            await this.enableSwitcher(settingsSelectors.selling.duplicateProduct);
            await this.page.locator(settingsSelectors.selling.productCategorySelection(selling.productCategorySelection)).click();
            await this.enableSwitcher(settingsSelectors.selling.vendorsCanCreateTags);
            await this.enableSwitcher(settingsSelectors.selling.orderDiscount);
            await this.enableSwitcher(settingsSelectors.selling.productDiscount);
            await this.enableSwitcher(settingsSelectors.selling.vendorProductReviewStatusChange);
            await this.enableSwitcher(settingsSelectors.selling.guestProductEnquiry);
            await this.enableSwitcher(settingsSelectors.selling.newVendorEnableAuction); // todo: add condition for simple auction plugin enabled
        }

        // catalog mode
        await this.enableSwitcher(settingsSelectors.selling.removeAddToCartButton);
        await this.enableSwitcher(settingsSelectors.selling.hideProductPrice);

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.selling.percentage)).toHaveValue(selling.commission.commissionPercentage);
        await expect(this.page.locator(settingsSelectors.selling.fixed)).toHaveValue(selling.commission.commissionFixed);
    }

    // admin set dokan withdraw settings
    async setDokanWithdrawSettings(withdraw: dokanSettings['withdraw']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.withdrawOptions).click();

        // Withdraw Options
        await this.enableSwitcher(settingsSelectors.withdraw.withdrawMethodsPaypal);
        await this.enableSwitcher(settingsSelectors.withdraw.withdrawMethodsBankTransfer);
        if (DOKAN_PRO) {
            await this.enableSwitcher(settingsSelectors.withdraw.withdrawMethodsDokanCustom);
            await this.enableSwitcher(settingsSelectors.withdraw.withdrawMethodsSkrill);
            await this.page.locator(settingsSelectors.withdraw.customMethodName).fill(withdraw.customMethodName);
            await this.page.locator(settingsSelectors.withdraw.customMethodType).fill(withdraw.customMethodType);
        }

        // Withdraw Charge
        await this.page.locator(settingsSelectors.withdraw.payPalChargePercentage).fill(withdraw.charge.paypal);
        await this.page.locator(settingsSelectors.withdraw.bankTransferChargeFixed).fill(withdraw.charge.bank);
        if (DOKAN_PRO) {
            await this.page.locator(settingsSelectors.withdraw.skrillChargePercentage).fill(withdraw.charge.skrill);
            await this.page.locator(settingsSelectors.withdraw.customChargePercentage).fill(withdraw.charge.custom);
        }

        await this.page.locator(settingsSelectors.withdraw.minimumWithdrawAmount).fill(withdraw.minimumWithdrawAmount);
        await this.enableSwitcher(settingsSelectors.withdraw.orderStatusForWithdrawCompleted);
        await this.enableSwitcher(settingsSelectors.withdraw.orderStatusForWithdrawProcessing);

        if (DOKAN_PRO) {
            await this.page.locator(settingsSelectors.withdraw.withdrawThreshold).fill(withdraw.withdrawThreshold);

            // Disbursement Schedule Settings
            await this.enableSwitcher(settingsSelectors.withdraw.withdrawDisbursementManual);
            await this.enableSwitcher(settingsSelectors.withdraw.withdrawDisbursementAuto);

            // Disbursement Schedule
            await this.enableSwitcher(settingsSelectors.withdraw.disburseMentQuarterlySchedule);
            await this.enableSwitcher(settingsSelectors.withdraw.disburseMentMonthlySchedule);
            await this.enableSwitcher(settingsSelectors.withdraw.disburseMentBiweeklySchedule);
            await this.enableSwitcher(settingsSelectors.withdraw.disburseMentWeeklySchedule);

            // Quarterly Schedule
            await this.page.locator(settingsSelectors.withdraw.quarterlyScheduleMonth).selectOption({ value: withdraw.quarterlyScheduleMonth });
            await this.page.locator(settingsSelectors.withdraw.quarterlyScheduleWeek).selectOption({ value: withdraw.quarterlyScheduleWeek });
            await this.page.locator(settingsSelectors.withdraw.quarterlyScheduleDay).selectOption({ value: withdraw.quarterlyScheduleDay });
            // Monthly Schedule
            await this.page.locator(settingsSelectors.withdraw.monthlyScheduleWeek).selectOption({ value: withdraw.monthlyScheduleWeek });
            await this.page.locator(settingsSelectors.withdraw.monthlyScheduleDay).selectOption({ value: withdraw.monthlyScheduleDay });
            // Biweekly Schedule
            await this.page.locator(settingsSelectors.withdraw.biweeklyScheduleWeek).selectOption({ value: withdraw.biweeklyScheduleWeek });
            await this.page.locator(settingsSelectors.withdraw.biweeklyScheduleDay).selectOption({ value: withdraw.biweeklyScheduleDay });
            // Weekly Schedule
            await this.page.locator(settingsSelectors.withdraw.weeklyScheduleDay).selectOption({ value: withdraw.weeklyScheduleDay });
        }

        // save settings (Withdraw's withdraw_charges field forces a post-save reload)
        await this.saveSettings({ menu: settingsSelectors.menus.withdrawOptions, title: data.dokanSettings.withdraw.settingTitle });
        await expect(this.page.locator(settingsSelectors.withdraw.minimumWithdrawAmount)).toHaveValue(withdraw.minimumWithdrawAmount);
    }

    // admin set dokan reverse withdraw settings
    async setDokanReverseWithdrawSettings(reverseWithdraw: dokanSettings['reverseWithdraw']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.reverseWithdrawal).click();

        // reverse withdraw options
        await this.enableSwitcher(settingsSelectors.reverseWithdraw.enableReverseWithdrawal);
        await this.enableSwitcher(settingsSelectors.reverseWithdraw.enableReverseWithdrawalForThisGateway);

        await this.page.locator(settingsSelectors.reverseWithdraw.billingType).selectOption({ value: reverseWithdraw.billingType });
        await this.page.locator(settingsSelectors.reverseWithdraw.reverseBalanceThreshold).fill(reverseWithdraw.reverseBalanceThreshold);
        await this.page.locator(settingsSelectors.reverseWithdraw.gracePeriod).fill(reverseWithdraw.gracePeriod);

        await this.enableSwitcher(settingsSelectors.reverseWithdraw.disableAddToCartButton);
        await this.enableSwitcher(settingsSelectors.reverseWithdraw.hideWithdrawMenu);
        await this.enableSwitcher(settingsSelectors.reverseWithdraw.MakeVendorStatusInactive);

        await this.enableSwitcher(settingsSelectors.reverseWithdraw.displayNoticeDuringGracePeriod);
        if (DOKAN_PRO) {
            await this.enableSwitcher(settingsSelectors.reverseWithdraw.sendAnnouncement);
        }

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.reverseWithdraw.reverseBalanceThreshold)).toHaveValue(reverseWithdraw.reverseBalanceThreshold);
    }

    // admin set dokan page settings
    async setPageSettings(page: dokanSettings['page']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.pageSettings).click();

        await this.page.locator(settingsSelectors.page.dashboard).selectOption({ label: page.dashboard });
        await this.page.locator(settingsSelectors.page.myOrders).selectOption({ label: page.myOrders });
        await this.page.locator(settingsSelectors.page.storeListing).selectOption({ label: page.storeListing });
        await this.page.locator(settingsSelectors.page.termsAndConditions).selectOption({ label: page.termsAndConditions });

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(page.saveSuccessMessage);
    }

    // admin set dokan appearance settings
    async setDokanAppearanceSettings(appearance: dokanSettings['appearance']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.appearance).click();

        // Appearance Settings
        await this.enableSwitcher(settingsSelectors.appearance.showMapOnStorePage);
        await this.page.locator(settingsSelectors.appearance.mapApiSource(appearance.mapApiSource)).click();
        await this.page.locator(settingsSelectors.appearance.googleMapApiKey).fill(appearance.googleMapApiKey);
        await this.enableSwitcher(settingsSelectors.appearance.showContactFormOnStorePage);
        await this.page.locator(settingsSelectors.appearance.storeHeaderTemplate2).click();
        await this.page.locator(settingsSelectors.appearance.storeHeaderTemplate1).click();
        if (DOKAN_PRO) {
            await this.page.locator(settingsSelectors.appearance.storeBannerWidth).fill(appearance.storeBannerWidth);
            await this.page.locator(settingsSelectors.appearance.storeBannerHeight).fill(appearance.storeBannerHeight);
            await this.enableSwitcher(settingsSelectors.appearance.storeOpeningClosingTimeWidget);
        }

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.appearance.googleMapApiKey)).toHaveValue(appearance.googleMapApiKey);
    }

    // admin set dokan menu manager settings
    async setDokanMenuManagerSettings(menus: string[]): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.menuManager).click();

        // menuManager Settings
        for (const menu of menus) {
            await this.enableSwitcher(settingsSelectors.menuManager.menuSwitcher(menu));
        }

        // save settings
        await this.saveSettings();

        for (const menu of menus) {
            await this.toHaveBackgroundColor(settingsSelectors.menuManager.menuSwitcher(menu) + '//span', 'rgb(0, 144, 255)');
        }
    }

    // admin set dokan privacy policy settings
    async setDokanPrivacyPolicySettings(privacyPolicy: dokanSettings['privacyPolicy']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.privacyPolicy).click();

        // Privacy Policy Settings
        await this.enableSwitcher(settingsSelectors.privacyPolicy.enablePrivacyPolicy);
        await this.page.locator(settingsSelectors.privacyPolicy.privacyPage).selectOption({ value: privacyPolicy.privacyPage });
        await this.page.frameLocator(settingsSelectors.privacyPolicy.privacyPolicyIframe).locator(settingsSelectors.privacyPolicy.privacyPolicyHtmlBody).fill(privacyPolicy.privacyPolicyContent);

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(privacyPolicy.saveSuccessMessage);
    }

    // admin set dokan color settings
    async setDokanColorSettings(paletteName: string): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.colors).click();

        // Colors Settings
        await this.page.locator(settingsSelectors.colors.predefineColorPalette).click();
        await this.page.locator(settingsSelectors.colors.predefinedPalette(paletteName)).click();

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(data.dokanSettings.colors.saveSuccessMessage);
    }

    // admin set dokan live search settings
    async setDokanLiveSearchSettings(liveSearch: dokanSettings['liveSearch']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.liveSearch).click();

        // Live Search Settings
        await this.page.locator(settingsSelectors.liveSearch.liveSearchOptions).selectOption({ value: liveSearch.liveSearchOption });

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(liveSearch.saveSuccessMessage);
    }

    // admin set dokan store support settings
    async setDokanStoreSupportSettings(storeSupport: dokanSettings['storeSupport']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.storeSupport).click();

        // Store Support Settings
        await this.enableSwitcher(settingsSelectors.storeSupport.displayOnOrderDetails);
        await this.page.locator(settingsSelectors.storeSupport.displayOnSingleProductPage).selectOption({ value: storeSupport.displayOnSingleProductPage });
        await this.page.locator(settingsSelectors.storeSupport.supportButtonLabel).fill(storeSupport.supportButtonLabel);

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(storeSupport.saveSuccessMessage);
    }

    // admin set dokan vendor verification settings
    async setDokanVendorVerificationSettings(vendorVerification: Pick<dokanSettings['vendorVerification'], 'verifiedIcons' | 'verificationMethods' | 'saveSuccessMessage'>): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.vendorVerification).click();

        await this.page.locator(settingsSelectors.vendorVerification.verifiedIcon(vendorVerification.verifiedIcons.userCheckSolid)).click();
        const response = await this.enableSwitcherAndWaitForResponse(data.subUrls.api.dokan.verificationMethods, settingsSelectors.vendorVerification.enableVerificationMethod(vendorVerification.verificationMethods.nationalId));
        if (response) {
            await expect(this.page.locator(settingsSelectors.vendorVerification.methodUpdateSuccessMessage)).toBeVisible();
        }

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(vendorVerification.saveSuccessMessage);
    }

    // admin set dokan sms verification gateways settings
    async setDokanSMSVerificationGatewaysSettings(verificationSmsGateways: dokanSettings['verificationSmsGateway']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.verificationSmsGateways).click();

        await this.page.locator(settingsSelectors.verificationSmsGateway.senderName).fill(verificationSmsGateways.senderName);
        await this.page.locator(settingsSelectors.verificationSmsGateway.smsText).fill(verificationSmsGateways.smsText);
        await this.page.locator(settingsSelectors.verificationSmsGateway.smsSentSuccess).fill(verificationSmsGateways.smsSentSuccess);
        await this.page.locator(settingsSelectors.verificationSmsGateway.smsSentError).fill(verificationSmsGateways.smsSentError);
        await this.page.locator(settingsSelectors.verificationSmsGateway.activeGateway(verificationSmsGateways.activeGateway)).click();
        await this.enableSwitcher(settingsSelectors.verificationSmsGateway.enableGateway(verificationSmsGateways.activeGateway));
        await this.page.locator(settingsSelectors.verificationSmsGateway.expandButton).click();

        // vonage
        await expect(this.page.locator(settingsSelectors.verificationSmsGateway.vonage.apiKey)).toBeVisible();
        await this.page.locator(settingsSelectors.verificationSmsGateway.vonage.apiKey).fill(verificationSmsGateways.vonage.apiKey);
        await this.page.locator(settingsSelectors.verificationSmsGateway.vonage.apiSecret).fill(verificationSmsGateways.vonage.apiSecret);

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(verificationSmsGateways.saveSuccessMessage);

        await expect(this.page.locator(settingsSelectors.verificationSmsGateway.senderName)).toHaveValue(verificationSmsGateways.senderName);
        await expect(this.page.locator(settingsSelectors.verificationSmsGateway.smsText)).toHaveValue(verificationSmsGateways.smsText);
        await expect(this.page.locator(settingsSelectors.verificationSmsGateway.smsSentSuccess)).toHaveValue(verificationSmsGateways.smsSentSuccess);
        await expect(this.page.locator(settingsSelectors.verificationSmsGateway.smsSentError)).toHaveValue(verificationSmsGateways.smsSentError);
        await expect(this.page.locator(settingsSelectors.verificationSmsGateway.activeGateway(verificationSmsGateways.activeGateway))).toHaveClass('checked');
        await this.toHaveBackgroundColor(settingsSelectors.verificationSmsGateway.enableGateway(verificationSmsGateways.activeGateway) + '//span', 'rgb(0, 144, 255)');
        await expect(this.page.locator(settingsSelectors.verificationSmsGateway.vonage.apiKey)).toHaveValue(verificationSmsGateways.vonage.apiKey);
        await expect(this.page.locator(settingsSelectors.verificationSmsGateway.vonage.apiSecret)).toHaveValue(verificationSmsGateways.vonage.apiSecret);
    }

    // admin set dokan email verification settings
    async setDokanEmailVerificationSettings(emailVerification: dokanSettings['emailVerification']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.emailVerification).click();

        // Email Verification Settings
        await this.enableSwitcher(settingsSelectors.emailVerification.enableEmailVerification);
        await this.page.locator(settingsSelectors.emailVerification.registrationNotice).fill(emailVerification.registrationNotice);
        await this.page.locator(settingsSelectors.emailVerification.loginNotice).fill(emailVerification.loginNotice);

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(emailVerification.saveSuccessMessage);
    }

    // admin set dokan social api settings
    async setDokanSocialApiSettings(socialApi: dokanSettings['socialApi']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.socialApi).click();

        // Social Api Settings
        await this.enableSwitcher(settingsSelectors.socialApi.enableSocialLogin);

        // Facebook
        await this.enableSwitcher(settingsSelectors.socialApi.enableSocialApi(socialApi.platform));
        await this.page.locator(settingsSelectors.socialApi.expandButton(socialApi.platform)).click();
        await this.page.locator(settingsSelectors.socialApi.facebook.appId).fill(socialApi.facebook.appId);
        await this.page.locator(settingsSelectors.socialApi.facebook.appSecret).fill(socialApi.facebook.appSecret);

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(socialApi.saveSuccessMessage);
    }

    // admin set dokan shipping status settings
    async setDokanShippingStatusSettings(shippingStatus: dokanSettings['shippingStatus']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.shippingStatus).click();

        // Shipping Status Settings
        await this.enableSwitcher(settingsSelectors.shippingStatus.allowShipmentTracking);

        // shipping status
        await this.enableSwitcher(settingsSelectors.shippingStatus.shippingProviders.australiaPost);
        await this.enableSwitcher(settingsSelectors.shippingStatus.shippingProviders.canadaPost);
        await this.enableSwitcher(settingsSelectors.shippingStatus.shippingProviders.cityLink);

        await this.page.locator(settingsSelectors.shippingStatus.customShippingStatusInput).fill(shippingStatus.customShippingStatus);
        await this.page.locator(settingsSelectors.shippingStatus.customShippingStatusAdd).click();

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(shippingStatus.saveSuccessMessage);
    }

    // admin set dokan quote settings
    async setDokanQuoteSettings(quote: dokanSettings['quote']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.quote).click();

        // quote Settings
        await this.enableSwitcher(settingsSelectors.quote.enableQuoteForOutOfStockProducts);
        await this.enableSwitcher(settingsSelectors.quote.enableAjaxAddToQuote);
        await this.enableSwitcher(settingsSelectors.quote.redirectToQuotePage);

        await this.page.locator(settingsSelectors.quote.decreaseOfferedPrice).fill(quote.decreaseOfferedPrice);

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(quote.saveSuccessMessage);
    }

    // admin set dokan live chat settings
    async setDokanLiveChatSettings(liveChat: dokanSettings['liveChat']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.liveChat).click();

        // liveChat Settings
        await this.enableSwitcher(settingsSelectors.liveChat.enableLiveChat);
        await this.page.locator(settingsSelectors.liveChat.chatProvider(liveChat.chatProvider)).click();
        await this.page.locator(settingsSelectors.liveChat.talkJsAppId).fill(liveChat.talkJsAppId);
        await this.page.locator(settingsSelectors.liveChat.talkJsAppSecret).fill(liveChat.talkJsAppSecret);
        await this.enableSwitcher(settingsSelectors.liveChat.chatButtonOnVendorPage);
        await this.page.locator(settingsSelectors.liveChat.chatButtonOnProductPage).selectOption({ value: liveChat.chatButtonPosition });

        // save settings (the live-chat module registers a refresh_after_save field, so
        // the save forces a page reload; re-open the section before verifying values)
        await this.saveSettings({ menu: settingsSelectors.menus.liveChat, title: data.dokanSettings.liveChat.settingTitle });

        await this.toHaveBackgroundColor(settingsSelectors.liveChat.enableLiveChat + '//span', 'rgb(0, 144, 255)');
        await expect(this.page.locator(settingsSelectors.liveChat.chatProvider(liveChat.chatProvider))).toHaveClass('checked');
        await expect(this.page.locator(settingsSelectors.liveChat.talkJsAppId)).toHaveValue(liveChat.talkJsAppId);
        await expect(this.page.locator(settingsSelectors.liveChat.talkJsAppSecret)).toHaveValue(liveChat.talkJsAppSecret);
        await this.toHaveBackgroundColor(settingsSelectors.liveChat.chatButtonOnVendorPage + '//span', 'rgb(0, 144, 255)');
        await this.toHaveSelectedValue(settingsSelectors.liveChat.chatButtonOnProductPage, liveChat.chatButtonPosition);
    }

    // admin set dokan rma settings
    async setDokanRmaSettings(rma: dokanSettings['rma']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.rma).click();

        // Rma Settings
        await this.page.locator(settingsSelectors.rma.orderStatus).selectOption({ value: rma.orderStatus });
        await this.enableSwitcher(settingsSelectors.rma.enableRefundRequests);
        await this.enableSwitcher(settingsSelectors.rma.enableCouponRequests);

        for (const rmaReason of rma.rmaReasons) {
            await this.clickIfVisible(settingsSelectors.rma.reasonsForRmaSingle(rmaReason));
            await this.page.locator(settingsSelectors.rma.reasonsForRmaInput).fill(rmaReason);
            await this.page.locator(settingsSelectors.rma.reasonsForRmaAdd).click();
        }

        await this.page.frameLocator(settingsSelectors.rma.refundPolicyIframe).locator(settingsSelectors.rma.refundPolicyHtmlBody).fill(rma.refundPolicyHtmlBody);

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(rma.saveSuccessMessage);
    }

    // admin set dokan wholesale settings
    async setDokanWholesaleSettings(wholesale: dokanSettings['wholesale']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.wholesale).click();

        // Wholesale Settings
        await this.page.locator(settingsSelectors.wholesale.whoCanSeeWholesalePrice(wholesale.whoCanSeeWholesalePrice)).click();
        await this.enableSwitcher(settingsSelectors.wholesale.showWholesalePriceOnShopArchive);
        await this.disableSwitcher(settingsSelectors.wholesale.needApprovalForCustomer);

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(wholesale.saveSuccessMessage);
    }

    // admin set dokan eu compliance settings
    async setDokanEuComplianceSettings(euCompliance: dokanSettings['euCompliance']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.euComplianceFields).click();

        // Eu Compliance Settings
        await this.enableSwitcher(settingsSelectors.euCompliance.vendorExtraFieldsCompanyName);
        await this.enableSwitcher(settingsSelectors.euCompliance.vendorExtraFieldsCompanyIdOrEuidNumber);
        await this.enableSwitcher(settingsSelectors.euCompliance.vendorExtraFieldsVatOrTaxNumber);
        await this.enableSwitcher(settingsSelectors.euCompliance.vendorExtraFieldsNameOfBank);
        await this.enableSwitcher(settingsSelectors.euCompliance.vendorExtraFieldsBankIban);
        await this.enableSwitcher(settingsSelectors.euCompliance.displayInVendorRegistrationForm);
        await this.enableSwitcher(settingsSelectors.euCompliance.customerExtraFieldsCompanyIdOrEuidNumber);
        await this.enableSwitcher(settingsSelectors.euCompliance.customerExtraFieldsVatOrTaxNumber);
        await this.enableSwitcher(settingsSelectors.euCompliance.customerExtraFieldsNameOfBank);
        await this.enableSwitcher(settingsSelectors.euCompliance.customerExtraFieldsBankIban);
        await this.enableSwitcher(settingsSelectors.euCompliance.enableGermanizedSupportForVendors);
        await this.enableSwitcher(settingsSelectors.euCompliance.vendorsWillBeAbleToOverrideInvoiceNumber);

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(euCompliance.saveSuccessMessage);
    }

    // admin set dokan delivery time settings
    async setDokanDeliveryTimeSettings(deliveryTime: dokanSettings['deliveryTime']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.deliveryTime).click();

        // Delivery Time Settings
        await this.enableSwitcher(settingsSelectors.deliveryTime.allowVendorSettings);
        await this.enableSwitcher(settingsSelectors.deliveryTime.homeDelivery);
        await this.enableSwitcher(settingsSelectors.deliveryTime.storePickup);
        await this.page.locator(settingsSelectors.deliveryTime.deliveryDateLabel).fill(deliveryTime.deliveryDateLabel);
        await this.page.locator(settingsSelectors.deliveryTime.deliveryBlockedBuffer).fill(deliveryTime.deliveryBlockedBuffer);
        await this.page.locator(settingsSelectors.deliveryTime.timeSlot).fill(deliveryTime.timeSlot);
        await this.page.locator(settingsSelectors.deliveryTime.orderPerSlot).fill(deliveryTime.orderPerSlot);
        await this.page.locator(settingsSelectors.deliveryTime.deliveryBoxInfo).fill(deliveryTime.deliveryBoxInfo);
        await this.disableSwitcher(settingsSelectors.deliveryTime.requireDeliveryDateAndTime);
        for (const day of deliveryTime.days) {
            await this.enableSwitcher(settingsSelectors.deliveryTime.deliveryDay(day));
            if (deliveryTime.choice === 'full-day') {
                await this.page.locator(settingsSelectors.deliveryTime.openingTime(day)).click();
                await this.page.getByRole('listitem').filter({ hasText: 'Full day' }).click();
            } else {
                await this.page.getByRole('listitem').filter({ hasText: deliveryTime.openingTime }).click();
                await this.page.locator(settingsSelectors.deliveryTime.closingTime(day)).click();
                await this.page.getByRole('listitem').filter({ hasText: deliveryTime.closingTime }).click();
            }
        }

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(deliveryTime.saveSuccessMessage);
    }

    // admin set dokan product advertising settings
    async setDokanProductAdvertisingSettings(productAdvertising: dokanSettings['productAdvertising']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.productAdvertising).click();

        // Product Advertising Settings
        await this.page.locator(settingsSelectors.productAdvertising.noOfAvailableSlot).fill(productAdvertising.noOfAvailableSlot);
        await this.page.locator(settingsSelectors.productAdvertising.expireAfterDays).fill(productAdvertising.expireAfterDays);
        await this.enableSwitcher(settingsSelectors.productAdvertising.vendorCanPurchaseAdvertisement);
        await this.page.locator(settingsSelectors.productAdvertising.advertisementCost).fill(productAdvertising.advertisementCost);
        await this.enableSwitcher(settingsSelectors.productAdvertising.enableAdvertisementInSubscription);
        await this.enableSwitcher(settingsSelectors.productAdvertising.markAdvertisedProductAsFeatured);
        await this.enableSwitcher(settingsSelectors.productAdvertising.displayAdvertisedProductOnTop);
        await this.enableSwitcher(settingsSelectors.productAdvertising.outOfStockVisibility);

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(productAdvertising.saveSuccessMessage);
    }

    // admin set dokan geolocation settings
    async setDokanGeolocationSettings(geolocation: dokanSettings['geolocation']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.geolocation).click();

        // Geolocation Settings
        await this.page.locator(settingsSelectors.geolocation.locationMapPosition(geolocation.locationMapPosition)).click();
        await this.page.locator(settingsSelectors.geolocation.showMap(geolocation.showMap)).click();
        await this.enableSwitcher(settingsSelectors.geolocation.showFiltersBeforeLocationMap);
        await this.enableSwitcher(settingsSelectors.geolocation.productLocationTab);
        await this.page.locator(settingsSelectors.geolocation.radiusSearchUnit(geolocation.radiusSearchUnit)).click();
        await this.page.locator(settingsSelectors.geolocation.radiusSearchMinimumDistance).fill(geolocation.radiusSearchMinimumDistance);
        await this.page.locator(settingsSelectors.geolocation.radiusSearchMaximumDistance).fill(geolocation.radiusSearchMaximumDistance);
        await this.page.locator(settingsSelectors.geolocation.mapZoomLevel).fill(geolocation.mapZoomLevel);
        await this.page.locator(settingsSelectors.geolocation.defaultLocation).focus();
        await this.typeAndWaitForResponse(data.subUrls.gmap, settingsSelectors.geolocation.defaultLocation, geolocation.defaultLocation);
        await this.page.locator(settingsSelectors.geolocation.mapResultFirst).click();

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(geolocation.saveSuccessMessage);
    }

    // admin set dokan product report abuse settings
    async setDokanProductReportAbuseSettings(productReportAbuse: dokanSettings['productReportAbuse']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.productReportAbuse).click();

        // Product Report Abuse Settings
        await this.clickIfVisible(settingsSelectors.productReportAbuse.reasonsForAbuseReportSingle(productReportAbuse.reasonsForAbuseReport));
        await this.page.locator(settingsSelectors.productReportAbuse.reasonsForAbuseReportInput).fill(productReportAbuse.reasonsForAbuseReport);
        await this.page.locator(settingsSelectors.productReportAbuse.reasonsForAbuseReportAdd).click();

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(productReportAbuse.saveSuccessMessage);
    }

    // admin set dokan spmv settings
    async setDokanSpmvSettings(spmv: dokanSettings['spmv']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.singleProductMultiVendor).click();

        await this.enableSwitcher(settingsSelectors.spmv.enableSingleProductMultipleVendor);
        await this.page.locator(settingsSelectors.spmv.sellItemButtonText).fill(spmv.sellItemButtonText);
        await this.page.locator(settingsSelectors.spmv.availableVendorDisplayAreaTitle).fill(spmv.availableVendorDisplayAreaTitle);
        await this.page.locator(settingsSelectors.spmv.availableVendorSectionDisplayPosition).selectOption({ value: spmv.availableVendorSectionDisplayPosition });
        await this.page.locator(settingsSelectors.spmv.showSpmvProducts).selectOption({ value: spmv.showSpmvProducts });

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(spmv.saveSuccessMessage);
    }

    // admin set dokan printful settings
    async setDokanPrintfulSettings(printful: dokanSettings['printful']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.printful).click();

        // connect to printful
        await this.page.locator(settingsSelectors.printful.expandButton).click();
        await this.page.locator(settingsSelectors.printful.clientId).fill(printful.clientId);
        await this.page.locator(settingsSelectors.printful.secretKey).fill(printful.secretKey);

        // size guide settings
        await this.page.locator(settingsSelectors.printful.sizeGuidePopupTitle).fill(printful.popupTitle);
        await this.page.locator(settingsSelectors.printful.sizeGuideButtonText).fill(printful.sizeGuideButtonText);
        await this.page.locator(settingsSelectors.printful.primaryMeasurementUnit).selectOption({ value: printful.primaryMeasurementUnit });

        // set color values
        for (let i = 0; i < printful.optionNames.length; i++) {
            await this.page.locator(settingsSelectors.printful.openColorPicker(printful.optionNames[i] as string)).click();
            await this.page.locator(settingsSelectors.printful.colorInput).fill(printful.optionValues[i] as string);
            await this.page.locator(settingsSelectors.printful.saveColor).click();
        }

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(printful.saveSuccessMessage);
    }

    // admin set dokan vendor subscription settings
    async setDokanVendorSubscriptionSettings(subscription: dokanSettings['vendorSubscription']): Promise<void> {
        await this.goToDokanSettings();
        await this.page.locator(settingsSelectors.menus.vendorSubscription).click();

        // Vendor Subscription Settings
        // The `dokan_product_subscription` option now registers only these fields
        // (subscription module admin.php): subscription_pack, enable_pricing,
        // enable_subscription_pack_in_reg, no_of_days_before_mail,
        // product_status_after_end. The former notify_by_email / cancelling & alert
        // email inputs no longer exist on this page, so they are not set here.
        await this.page.locator(settingsSelectors.vendorSubscriptions.subscription).selectOption({ label: subscription.displayPage });
        await this.enableSwitcher(settingsSelectors.vendorSubscriptions.enableProductSubscription);
        await this.enableSwitcher(settingsSelectors.vendorSubscriptions.enableSubscriptionInRegistrationForm);
        await this.page.locator(settingsSelectors.vendorSubscriptions.noOfDays).fill(subscription.noOfDays);
        await this.page.locator(settingsSelectors.vendorSubscriptions.productStatus).selectOption({ value: subscription.productStatus });

        // save settings
        await this.saveSettings();
        await expect(this.page.locator(settingsSelectors.dokanUpdateSuccessMessage)).toContainText(subscription.saveSuccessMessage);
    }
}
