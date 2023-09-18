import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { payment, vendor } from '@utils/interfaces';

export class PaymentsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // Payment Methods

    // Admin Setup Basic Payment Methods
    async setupBasicPaymentMethods(payment: payment) {
        await this.goToWooCommerceSettings();

        await this.click(selector.admin.wooCommerce.settings.payments);
        // Bank Transfer
        await this.enablePaymentMethod(selector.admin.wooCommerce.settings.enableDirectBankTransfer);
        // Payments
        await this.enablePaymentMethod(selector.admin.wooCommerce.settings.enableCheckPayments);
        // Cash on Delivery
        await this.enablePaymentMethod(selector.admin.wooCommerce.settings.enableCashOnDelivery);

        await this.click(selector.admin.wooCommerce.settings.paymentMethodsSaveChanges);
        await this.toContainText(selector.admin.wooCommerce.settings.updatedSuccessMessage, payment.saveSuccessMessage);
    }

    // Admin Setup Stripe
    async setupStripeConnect(payment: payment) {
        await this.goToWooCommerceSettings();

        await this.setCurrency(payment.currency.dollar);

        await this.click(selector.admin.wooCommerce.settings.payments);
        await this.click(selector.admin.wooCommerce.settings.setupDokanStripeConnect);
        // Setup Strip Connect
        await this.check(selector.admin.wooCommerce.settings.stripe.enableDisableStripe);
        await this.clearAndType(selector.admin.wooCommerce.settings.stripe.title, payment.stripeConnect.title);
        await this.clearAndType(selector.admin.wooCommerce.settings.stripe.description, payment.stripeConnect.description);
        await this.check(selector.admin.wooCommerce.settings.stripe.nonConnectedSellers);
        await this.check(selector.admin.wooCommerce.settings.stripe.displayNoticeToConnectSeller);
        await this.clearAndType(selector.admin.wooCommerce.settings.stripe.displayNoticeInterval, payment.stripeConnect.displayNoticeInterval);
        await this.check(selector.admin.wooCommerce.settings.stripe.threeDSecureAndSca);
        await this.check(selector.admin.wooCommerce.settings.stripe.sellerPaysTheProcessingFeeIn3DsMode);
        await this.check(selector.admin.wooCommerce.settings.stripe.testMode);
        await this.check(selector.admin.wooCommerce.settings.stripe.stripeCheckout);
        await this.click(selector.admin.wooCommerce.settings.stripe.stripeCheckoutLocale);
        await this.type(selector.admin.wooCommerce.settings.stripe.stripeCheckoutLocale, payment.stripeConnect.stripeCheckoutLocale);
        await this.press(data.key.enter);
        await this.check(selector.admin.wooCommerce.settings.stripe.savedCards);
        // Test Credentials
        await this.clearAndType(selector.admin.wooCommerce.settings.stripe.testPublishableKey, payment.stripeConnect.testPublishableKey);
        await this.clearAndType(selector.admin.wooCommerce.settings.stripe.testSecretKey, payment.stripeConnect.testSecretKey);
        await this.clearAndType(selector.admin.wooCommerce.settings.stripe.testClientId, payment.stripeConnect.testClientId);
        await this.click(selector.admin.wooCommerce.settings.stripe.stripeSaveChanges);

        await this.toContainText(selector.admin.wooCommerce.settings.updatedSuccessMessage, payment.saveSuccessMessage);
    }

    // Admin Setup Dokan Paypal Marketplace
    async setupPaypalMarketPlace(payment: payment) {
        await this.goToWooCommerceSettings();

        await this.setCurrency(payment.currency.dollar);

        await this.click(selector.admin.wooCommerce.settings.payments);
        await this.click(selector.admin.wooCommerce.settings.setupDokanPayPalMarketplace);
        // Setup Paypal Marketplace
        await this.check(selector.admin.wooCommerce.settings.paypalMarketPlace.enableDisablePayPalMarketplace);
        await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.title, payment.paypalMarketPlace.title);
        await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.description, payment.paypalMarketPlace.description);
        await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.payPalMerchantId, payment.paypalMarketPlace.payPalMerchantId);
        // API Credentials
        await this.check(selector.admin.wooCommerce.settings.paypalMarketPlace.payPalSandbox);
        await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.sandboxClientId, payment.paypalMarketPlace.sandboxClientId);
        await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.sandBoxClientSecret, payment.paypalMarketPlace.sandBoxClientSecret);
        await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.payPalPartnerAttributionId, payment.paypalMarketPlace.payPalPartnerAttributionId);
        await this.click(selector.admin.wooCommerce.settings.paypalMarketPlace.disbursementMode);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.paypalMarketPlace.disbursementModeValues, payment.paypalMarketPlace.disbursementMode);
        await this.click(selector.admin.wooCommerce.settings.paypalMarketPlace.paymentButtonType);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.paypalMarketPlace.paymentButtonTypeValues, payment.paypalMarketPlace.paymentButtonType);
        await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.marketplaceLogo, (await this.getBaseUrl()) + payment.paypalMarketPlace.marketplaceLogoPath);
        await this.check(selector.admin.wooCommerce.settings.paypalMarketPlace.displayNoticeToConnectSeller);
        await this.check(selector.admin.wooCommerce.settings.paypalMarketPlace.sendAnnouncementToConnectSeller);
        await this.clearAndType(selector.admin.wooCommerce.settings.paypalMarketPlace.sendAnnouncementInterval, payment.paypalMarketPlace.announcementInterval);
        await this.click(selector.admin.wooCommerce.settings.paypalMarketPlace.paypalMarketPlaceSaveChanges);

        await this.toContainText(selector.admin.wooCommerce.settings.updatedSuccessMessage, payment.saveSuccessMessage);
    }

    // Admin Setup Mangopay
    async setupMangoPay(payment: payment) {
        await this.goToWooCommerceSettings();

        await this.setCurrency(payment.currency.euro);

        await this.click(selector.admin.wooCommerce.settings.payments);
        await this.click(selector.admin.wooCommerce.settings.setupDokanMangoPay);
        // Setup Mangopay
        await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.enableDisableMangoPayPayment);
        await this.clearAndType(selector.admin.wooCommerce.settings.dokanMangoPay.title, payment.mangoPay.title);
        await this.clearAndType(selector.admin.wooCommerce.settings.dokanMangoPay.description, payment.mangoPay.description);
        // API Credentials
        await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.mangoPaySandbox);
        await this.clearAndType(selector.admin.wooCommerce.settings.dokanMangoPay.sandboxClientId, payment.mangoPay.sandboxClientId);
        await this.clearAndType(selector.admin.wooCommerce.settings.dokanMangoPay.sandBoxApiKey, payment.mangoPay.sandBoxApiKey);
        // Payment Options
        await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableCreditCards);
        await this.type(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableCreditCards, 'CB/Visa/Mastercard');
        await this.press(data.key.enter);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableCreditCardsValues, payment.mangoPay.availableCreditCards);
        await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableDirectPaymentServices);
        await this.type(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableDirectPaymentServices, 'Sofort*');
        await this.press(data.key.enter);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.chooseAvailableDirectPaymentServicesValues, payment.mangoPay.availableDirectPaymentServices);
        await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.savedCards);
        // Fund Transfers and Payouts
        await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.transferFunds);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.transferFundsValues, payment.mangoPay.transferFunds);
        await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.payoutMode);
        // Types and Requirements of Vendors
        await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.typeOfVendors);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.typeOfVendorsValues, payment.mangoPay.typeOfVendors);
        await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.businessRequirement);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanMangoPay.businessRequirementValues, payment.mangoPay.businessRequirement);
        // Advanced Settings
        await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.displayNoticeToNonConnectedSellers);
        await this.check(selector.admin.wooCommerce.settings.dokanMangoPay.sendAnnouncementToNonConnectedSellers);
        await this.clearAndType(selector.admin.wooCommerce.settings.dokanMangoPay.announcementInterval, payment.mangoPay.announcementInterval);
        await this.click(selector.admin.wooCommerce.settings.dokanMangoPay.dokanMangopaySaveChanges);

        await this.toContainText(selector.admin.wooCommerce.settings.updatedSuccessMessage, payment.saveSuccessMessage);
    }

    // Admin Setup Razorpay
    async setupRazorpay(payment: payment) {
        await this.goToWooCommerceSettings();

        await this.setCurrency(payment.currency.rupee);

        await this.click(selector.admin.wooCommerce.settings.payments);
        await this.click(selector.admin.wooCommerce.settings.setupDokanRazorpay);
        // Setup Razorpay
        await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.enableDisableDokanRazorpay);
        await this.clearAndType(selector.admin.wooCommerce.settings.dokanRazorpay.title, payment.razorPay.title);
        await this.clearAndType(selector.admin.wooCommerce.settings.dokanRazorpay.description, payment.razorPay.description);
        // API Credentials
        await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.razorpaySandbox);
        await this.clearAndType(selector.admin.wooCommerce.settings.dokanRazorpay.testKeyId, payment.razorPay.testKeyId);
        await this.clearAndType(selector.admin.wooCommerce.settings.dokanRazorpay.testKeySecret, payment.razorPay.testKeySecret);
        await this.click(selector.admin.wooCommerce.settings.dokanRazorpay.disbursementMode);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.dokanRazorpay.disbursementModeValues, payment.razorPay.disbursementMode);
        await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.sellerPaysTheProcessingFee);
        await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.displayNoticeToConnectSeller);
        await this.check(selector.admin.wooCommerce.settings.dokanRazorpay.sendAnnouncementToConnectSeller);
        await this.clearAndType(selector.admin.wooCommerce.settings.dokanRazorpay.sendAnnouncementInterval, payment.razorPay.announcementInterval);
        await this.click(selector.admin.wooCommerce.settings.dokanRazorpay.dokanRazorpaySaveChanges);

        await this.toContainText(selector.admin.wooCommerce.settings.updatedSuccessMessage, payment.saveSuccessMessage);
    }

    // Admin Setup Stripe Express
    async setupStripeExpress(payment: payment) {
        await this.goToWooCommerceSettings();

        await this.setCurrency(payment.currency.dollar);

        await this.click(selector.admin.wooCommerce.settings.payments);
        await this.click(selector.admin.wooCommerce.settings.setupDokanStripeExpress);

        // Stripe Express
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.enableOrDisableStripeExpress);
        await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.title, payment.stripeExpress.title);
        await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.description, payment.stripeExpress.description);
        // API Credentials
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.testMode);
        await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.testPublishableKey, payment.stripeExpress.testPublishableKey);
        await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.testSecretKey, payment.stripeExpress.testSecretKey);
        await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.testWebhookSecret, payment.stripeExpress.testWebhookSecret);
        // Payment and Disbursement
        await this.click(selector.admin.wooCommerce.settings.stripeExpress.choosePaymentMethods);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.choosePaymentMethodsValues, payment.stripeExpress.paymentMethods.card);
        await this.click(selector.admin.wooCommerce.settings.stripeExpress.choosePaymentMethods);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.choosePaymentMethodsValues, payment.stripeExpress.paymentMethods.ideal);
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.takeProcessingFeesFromSellers);
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.savedCards);
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.capturePaymentsManually);
        await this.click(selector.admin.wooCommerce.settings.stripeExpress.disburseFunds);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.disbursementModeValues, payment.stripeExpress.disbursementMode);
        await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.customerBankStatement, payment.stripeExpress.customerBankStatement);
        // Payment Request Options (Apple Pay/Google Pay)
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.paymentRequestButtons);
        await this.selectByValue(selector.admin.wooCommerce.settings.stripeExpress.buttonType, payment.stripeExpress.paymentRequestButtonType);
        await this.selectByValue(selector.admin.wooCommerce.settings.stripeExpress.buttonTheme, payment.stripeExpress.paymentRequestButtonTheme);
        await this.click(selector.admin.wooCommerce.settings.stripeExpress.buttonLocations);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.buttonLocationsValues, payment.stripeExpress.paymentRequestButtonLocation.product);
        await this.click(selector.admin.wooCommerce.settings.stripeExpress.buttonLocations);
        await this.setDropdownOptionSpan(selector.admin.wooCommerce.settings.stripeExpress.buttonLocationsValues, payment.stripeExpress.paymentRequestButtonLocation.cart);
        // Advanced Settings
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.displayNoticeToNonConnectedSellers);
        await this.check(selector.admin.wooCommerce.settings.stripeExpress.sendAnnouncementToNonConnectedSellers);
        await this.clearAndType(selector.admin.wooCommerce.settings.stripeExpress.announcementInterval, payment.stripeExpress.announcementInterval);
        await this.click(selector.admin.wooCommerce.settings.stripeExpress.stripeExpressSaveChanges);

        await this.toContainText(selector.admin.wooCommerce.settings.updatedSuccessMessage, payment.saveSuccessMessage);
    }

    // vendor

    // payment settings render properly
    async vendorPaymentSettingsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsPayment);

        // paymentMethod text is visible
        await this.toBeVisible(selector.vendor.vPaymentSettings.paymentMethodText);

        // paymentMethods summary div is visible
        await this.toBeVisible(selector.vendor.vPaymentSettings.paymentMethods.paymentMethodsDiv);
        // paymentMethods dropdown is visible
        await this.toBeVisible(selector.vendor.vPaymentSettings.paymentMethods.addPaymentMethodDropDown);

        await this.notToHaveCount(selector.vendor.vPaymentSettings.paymentMethods.noOfPaymentMethods, 0);
    }

    // vendor set basic payment settings
    async setBasicPaymentSettings(payment: vendor['payment']): Promise<void> {
        await this.setBasicPayment({
            ...data.vendor.payment,
            methodName: 'paypal',
        });
        await this.setBankTransfer(payment);
        await this.setBasicPayment({
            ...data.vendor.payment,
            methodName: 'skrill',
        });
        await this.setBasicPayment({
            ...data.vendor.payment,
            methodName: 'custom',
        });
    }

    // set basic payment method [paypal, skrill, custom ]
    async setBasicPayment(paymentMethod: vendor['payment']): Promise<void> {
        switch (paymentMethod.methodName) {
            case 'paypal':
                await this.goIfNotThere(data.subUrls.frontend.vDashboard.paypal);
                break;

            case 'skrill':
                await this.goIfNotThere(data.subUrls.frontend.vDashboard.skrill);
                break;

            case 'custom':
                await this.goIfNotThere(data.subUrls.frontend.vDashboard.customPayment);
                break;

            default:
                break;
        }

        await this.clearAndType(selector.vendor.vPaymentSettings.paymentEmail, paymentMethod.email());
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.updateSettings);
        await this.toContainText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
    }

    // bank transfer payment settings
    async setBankTransfer(paymentMethod: vendor['payment']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.bankTransfer);

        await this.clickIfVisible(selector.vendor.vPaymentSettings.disconnectAccount);
        await this.clearAndType(selector.vendor.vPaymentSettings.bankAccountName, paymentMethod.bankAccountName);
        await this.selectByValue(selector.vendor.vPaymentSettings.bankAccountType, paymentMethod.bankAccountType);
        await this.clearAndType(selector.vendor.vPaymentSettings.bankAccountNumber, paymentMethod.bankAccountNumber);
        await this.clearAndType(selector.vendor.vPaymentSettings.bankRoutingNumber, paymentMethod.bankRoutingNumber);
        await this.clearAndType(selector.vendor.vPaymentSettings.bankName, paymentMethod.bankName);
        await this.clearAndType(selector.vendor.vPaymentSettings.bankAddress, paymentMethod.bankAddress);
        await this.clearAndType(selector.vendor.vPaymentSettings.bankIban, paymentMethod.bankIban);
        await this.clearAndType(selector.vendor.vPaymentSettings.bankSwiftCode, paymentMethod.bankSwiftCode);
        await this.check(selector.vendor.vSetup.declaration);

        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.addAccount);
        await this.toContainText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
    }

    // disconnect basic payment method [paypal, skrill, custom ]
    async disconnectBasicPayment(paymentMethod: vendor['payment']): Promise<void> {
        switch (paymentMethod.methodName) {
            case 'paypal':
                await this.goIfNotThere(data.subUrls.frontend.vDashboard.paypal);
                break;

            case 'bank':
                await this.goIfNotThere(data.subUrls.frontend.vDashboard.bankTransfer);
                break;

            case 'skrill':
                await this.goIfNotThere(data.subUrls.frontend.vDashboard.skrill);
                break;

            case 'custom':
                await this.goIfNotThere(data.subUrls.frontend.vDashboard.customPayment);
                break;

            default:
                break;
        }

        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.disconnectPayment);
        await this.toContainText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
    }

    // // paypal payment settings
    // async setPaypal(paymentMethod: vendor['payment']): Promise<void> {
    // 	await this.goIfNotThere(data.subUrls.frontend.vDashboard.paypal);
    // 	await this.clearAndType(selector.vendor.vPaymentSettings.paypal, paymentMethod.email());
    // 	await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.updateSettings);
    // 	await this.toContainText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
    // }

    // // skrill Payment Settings
    // async setSkrill(paymentMethod: vendor['payment']): Promise<void> {

    // 	await this.clearAndType(selector.vendor.vPaymentSettings.skrill, paymentMethod.email());
    // 	await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.updateSettings);
    // 	await this.toContainText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
    // }

    // // custom payment settings
    // async setCustom(paymentMethod: vendor['payment']): Promise<void> {

    // 	await this.clearAndType(selector.vendor.vPaymentSettings.customPayment, paymentMethod.email());
    // 	await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.updateSettings);
    // 	await this.toContainText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
    // }

    // // stripe payment settings
    // async setStripe(email): Promise<void> {
    // // Stripe
    // 	await this.click(selector.vendor.vPaymentSettings.ConnectWithStripe);
    // }

    // // paypal marketPlace payment settings
    // async setPaypalMarketPlace(email): Promise<void> {
    // 	 // paypal Marketplace
    // 	 await this.clearAndType(selector.vendor.vPaymentSettings.paypalMarketplace, paypalMarketplace);
    // 	 await this.click(selector.vendor.vPaymentSettings.paypalMarketplaceSignUp);
    // }

    // // razorpay payment settings
    // async setRazorpay(razorpay): Promise<void> {
    // 	// razorpay
    // 	await this.click(selector.vendor.vPaymentSettings.rzSignup);
    // 	// existing account info
    // 	await this.click(selector.vendor.vPaymentSettings.rzIHaveAlreadyAnAccount);
    // 	await this.clearAndType(selector.vendor.vPaymentSettings.rzAccountId, rzAccountId);
    // 	await this.click(selector.vendor.vPaymentSettings.rzConnectExistingAccount);
    // 	//new account info
    // 	await this.clearAndType(selector.vendor.vPaymentSettings.rzAccountName, rzAccountName);
    // 	await this.clearAndType(selector.vendor.vPaymentSettings.rzAccountEmail, rzAccountEmail);
    // 	await this.clearAndType(selector.vendor.vPaymentSettings.rzYourCompanyName, rzYourCompanyName);
    // 	await this.clearAndType(selector.vendor.vPaymentSettings.rzYourCompanyType, rzYourCompanyType);
    // 	await this.clearAndType(selector.vendor.vPaymentSettings.rzBankAccountName, rzBankAccountName);
    // 	await this.clearAndType(selector.vendor.vPaymentSettings.rzBankAccountNumber, rzBankAccountNumber);
    // 	await this.clearAndType(selector.vendor.vPaymentSettings.rzBankIfscCode, rzBankIfscCode);
    // 	await this.clearAndType(selector.vendor.vPaymentSettings.rzBankAccountType, rzBankAccountType);
    // 	await this.click(selector.vendor.vPaymentSettings.rzConnectAccount);
    // }
}
