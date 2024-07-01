import { Page } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { payment, vendor } from '@utils/interfaces';

// selectors
const woocommerceSettings = selector.admin.wooCommerce.settings;
const paymentSettingsVendor = selector.vendor.vPaymentSettings;

export class PaymentsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // Payment Methods

    // Admin Setup Basic Payment Methods
    async setupBasicPaymentMethods(payment: payment) {
        await this.goToWooCommerceSettings();

        await this.click(woocommerceSettings.payments);
        // Bank Transfer
        await this.enablePaymentMethod(woocommerceSettings.enableDirectBankTransfer);
        // Payments
        await this.enablePaymentMethod(woocommerceSettings.enableCheckPayments);
        // Cash on Delivery
        await this.enablePaymentMethod(woocommerceSettings.enableCashOnDelivery);

        await this.click(woocommerceSettings.paymentMethodsSaveChanges);
        await this.toContainText(woocommerceSettings.updatedSuccessMessage, payment.saveSuccessMessage);
    }

    // Admin Setup Stripe
    async setupStripeConnect(payment: payment) {
        await this.goToWooCommerceSettings();

        await this.setCurrency(payment.currency.dollar);

        await this.click(woocommerceSettings.payments);
        await this.click(woocommerceSettings.setupDokanStripeConnect);
        // Setup Strip Connect
        await this.check(woocommerceSettings.stripe.enableDisableStripe);
        await this.clearAndType(woocommerceSettings.stripe.title, payment.stripeConnect.title);
        await this.clearAndType(woocommerceSettings.stripe.description, payment.stripeConnect.description);
        await this.check(woocommerceSettings.stripe.nonConnectedSellers);
        await this.check(woocommerceSettings.stripe.displayNoticeToConnectSeller);
        await this.clearAndType(woocommerceSettings.stripe.displayNoticeInterval, payment.stripeConnect.displayNoticeInterval);
        await this.check(woocommerceSettings.stripe.threeDSecureAndSca);
        await this.check(woocommerceSettings.stripe.sellerPaysTheProcessingFeeIn3DsMode);
        await this.check(woocommerceSettings.stripe.testMode);
        await this.check(woocommerceSettings.stripe.stripeCheckout);
        await this.click(woocommerceSettings.stripe.stripeCheckoutLocale);
        await this.type(woocommerceSettings.stripe.stripeCheckoutLocale, payment.stripeConnect.stripeCheckoutLocale);
        await this.press(data.key.enter);
        await this.check(woocommerceSettings.stripe.savedCards);
        // Test Credentials
        await this.clearAndType(woocommerceSettings.stripe.testPublishableKey, payment.stripeConnect.testPublishableKey);
        await this.clearAndType(woocommerceSettings.stripe.testSecretKey, payment.stripeConnect.testSecretKey);
        await this.clearAndType(woocommerceSettings.stripe.testClientId, payment.stripeConnect.testClientId);
        await this.click(woocommerceSettings.stripe.stripeSaveChanges);

        await this.toContainText(woocommerceSettings.updatedSuccessMessage, payment.saveSuccessMessage);
    }

    // Admin Setup Dokan Paypal Marketplace
    async setupPaypalMarketPlace(payment: payment) {
        await this.goToWooCommerceSettings();

        await this.setCurrency(payment.currency.dollar);

        await this.click(woocommerceSettings.payments);
        await this.click(woocommerceSettings.setupDokanPayPalMarketplace);
        // Setup Paypal Marketplace
        await this.check(woocommerceSettings.paypalMarketPlace.enableDisablePayPalMarketplace);
        await this.clearAndType(woocommerceSettings.paypalMarketPlace.title, payment.paypalMarketPlace.title);
        await this.clearAndType(woocommerceSettings.paypalMarketPlace.description, payment.paypalMarketPlace.description);
        await this.clearAndType(woocommerceSettings.paypalMarketPlace.payPalMerchantId, payment.paypalMarketPlace.payPalMerchantId);
        // API Credentials
        await this.check(woocommerceSettings.paypalMarketPlace.payPalSandbox);
        await this.clearAndType(woocommerceSettings.paypalMarketPlace.sandboxClientId, payment.paypalMarketPlace.sandboxClientId);
        await this.clearAndType(woocommerceSettings.paypalMarketPlace.sandBoxClientSecret, payment.paypalMarketPlace.sandBoxClientSecret);
        await this.clearAndType(woocommerceSettings.paypalMarketPlace.payPalPartnerAttributionId, payment.paypalMarketPlace.payPalPartnerAttributionId);
        await this.click(woocommerceSettings.paypalMarketPlace.disbursementMode);
        await this.setDropdownOptionSpan(woocommerceSettings.paypalMarketPlace.disbursementModeValues, payment.paypalMarketPlace.disbursementMode);
        await this.click(woocommerceSettings.paypalMarketPlace.paymentButtonType);
        await this.setDropdownOptionSpan(woocommerceSettings.paypalMarketPlace.paymentButtonTypeValues, payment.paypalMarketPlace.paymentButtonType);
        await this.clearAndType(woocommerceSettings.paypalMarketPlace.marketplaceLogo, (await this.getBaseUrl()) + payment.paypalMarketPlace.marketplaceLogoPath);
        await this.check(woocommerceSettings.paypalMarketPlace.displayNoticeToConnectSeller);
        await this.check(woocommerceSettings.paypalMarketPlace.sendAnnouncementToConnectSeller);
        await this.clearAndType(woocommerceSettings.paypalMarketPlace.sendAnnouncementInterval, payment.paypalMarketPlace.announcementInterval);
        await this.click(woocommerceSettings.paypalMarketPlace.paypalMarketPlaceSaveChanges);

        await this.toContainText(woocommerceSettings.updatedSuccessMessage, payment.saveSuccessMessage);
    }

    // Admin Setup Mangopay
    async setupMangoPay(payment: payment) {
        await this.goToWooCommerceSettings();

        await this.setCurrency(payment.currency.euro);

        await this.click(woocommerceSettings.payments);
        await this.click(woocommerceSettings.setupDokanMangoPay);
        // Setup Mangopay
        await this.check(woocommerceSettings.dokanMangoPay.enableDisableMangoPayPayment);
        await this.clearAndType(woocommerceSettings.dokanMangoPay.title, payment.mangoPay.title);
        await this.clearAndType(woocommerceSettings.dokanMangoPay.description, payment.mangoPay.description);
        // API Credentials
        await this.check(woocommerceSettings.dokanMangoPay.mangoPaySandbox);
        await this.clearAndType(woocommerceSettings.dokanMangoPay.sandboxClientId, payment.mangoPay.sandboxClientId);
        await this.clearAndType(woocommerceSettings.dokanMangoPay.sandBoxApiKey, payment.mangoPay.sandBoxApiKey);
        // Payment Options
        await this.click(woocommerceSettings.dokanMangoPay.chooseAvailableCreditCards);
        await this.type(woocommerceSettings.dokanMangoPay.chooseAvailableCreditCards, 'CB/Visa/Mastercard');
        await this.press(data.key.enter);
        await this.setDropdownOptionSpan(woocommerceSettings.dokanMangoPay.chooseAvailableCreditCardsValues, payment.mangoPay.availableCreditCards);
        await this.click(woocommerceSettings.dokanMangoPay.chooseAvailableDirectPaymentServices);
        await this.type(woocommerceSettings.dokanMangoPay.chooseAvailableDirectPaymentServices, 'Sofort*');
        await this.press(data.key.enter);
        await this.setDropdownOptionSpan(woocommerceSettings.dokanMangoPay.chooseAvailableDirectPaymentServicesValues, payment.mangoPay.availableDirectPaymentServices);
        await this.check(woocommerceSettings.dokanMangoPay.savedCards);
        // Fund Transfers and Payouts
        await this.click(woocommerceSettings.dokanMangoPay.transferFunds);
        await this.setDropdownOptionSpan(woocommerceSettings.dokanMangoPay.transferFundsValues, payment.mangoPay.transferFunds);
        await this.check(woocommerceSettings.dokanMangoPay.payoutMode);
        // Types and Requirements of Vendors
        await this.click(woocommerceSettings.dokanMangoPay.typeOfVendors);
        await this.setDropdownOptionSpan(woocommerceSettings.dokanMangoPay.typeOfVendorsValues, payment.mangoPay.typeOfVendors);
        await this.click(woocommerceSettings.dokanMangoPay.businessRequirement);
        await this.setDropdownOptionSpan(woocommerceSettings.dokanMangoPay.businessRequirementValues, payment.mangoPay.businessRequirement);
        // Advanced Settings
        await this.check(woocommerceSettings.dokanMangoPay.displayNoticeToNonConnectedSellers);
        await this.check(woocommerceSettings.dokanMangoPay.sendAnnouncementToNonConnectedSellers);
        await this.clearAndType(woocommerceSettings.dokanMangoPay.announcementInterval, payment.mangoPay.announcementInterval);
        await this.click(woocommerceSettings.dokanMangoPay.dokanMangopaySaveChanges);

        await this.toContainText(woocommerceSettings.updatedSuccessMessage, payment.saveSuccessMessage);
    }

    // Admin Setup Razorpay
    async setupRazorpay(payment: payment) {
        await this.goToWooCommerceSettings();

        await this.setCurrency(payment.currency.rupee);

        await this.click(woocommerceSettings.payments);
        await this.click(woocommerceSettings.setupDokanRazorpay);
        // Setup Razorpay
        await this.check(woocommerceSettings.dokanRazorpay.enableDisableDokanRazorpay);
        await this.clearAndType(woocommerceSettings.dokanRazorpay.title, payment.razorPay.title);
        await this.clearAndType(woocommerceSettings.dokanRazorpay.description, payment.razorPay.description);
        // API Credentials
        await this.check(woocommerceSettings.dokanRazorpay.razorpaySandbox);
        await this.clearAndType(woocommerceSettings.dokanRazorpay.testKeyId, payment.razorPay.testKeyId);
        await this.clearAndType(woocommerceSettings.dokanRazorpay.testKeySecret, payment.razorPay.testKeySecret);
        await this.click(woocommerceSettings.dokanRazorpay.disbursementMode);
        await this.setDropdownOptionSpan(woocommerceSettings.dokanRazorpay.disbursementModeValues, payment.razorPay.disbursementMode);
        await this.check(woocommerceSettings.dokanRazorpay.sellerPaysTheProcessingFee);
        await this.check(woocommerceSettings.dokanRazorpay.displayNoticeToConnectSeller);
        await this.check(woocommerceSettings.dokanRazorpay.sendAnnouncementToConnectSeller);
        await this.clearAndType(woocommerceSettings.dokanRazorpay.sendAnnouncementInterval, payment.razorPay.announcementInterval);
        await this.click(woocommerceSettings.dokanRazorpay.dokanRazorpaySaveChanges);

        await this.toContainText(woocommerceSettings.updatedSuccessMessage, payment.saveSuccessMessage);
    }

    // Admin Setup Stripe Express
    async setupStripeExpress(payment: payment) {
        await this.goToWooCommerceSettings();

        await this.setCurrency(payment.currency.dollar);

        await this.click(woocommerceSettings.payments);
        await this.click(woocommerceSettings.setupDokanStripeExpress);

        // Stripe Express
        await this.check(woocommerceSettings.stripeExpress.enableOrDisableStripeExpress);
        await this.clearAndType(woocommerceSettings.stripeExpress.title, payment.stripeExpress.title);
        await this.clearAndType(woocommerceSettings.stripeExpress.description, payment.stripeExpress.description);
        // API Credentials
        await this.check(woocommerceSettings.stripeExpress.testMode);
        await this.clearAndType(woocommerceSettings.stripeExpress.testPublishableKey, payment.stripeExpress.testPublishableKey);
        await this.clearAndType(woocommerceSettings.stripeExpress.testSecretKey, payment.stripeExpress.testSecretKey);
        await this.clearAndType(woocommerceSettings.stripeExpress.testWebhookSecret, payment.stripeExpress.testWebhookSecret);
        // Payment and Disbursement
        await this.click(woocommerceSettings.stripeExpress.choosePaymentMethods);
        await this.setDropdownOptionSpan(woocommerceSettings.stripeExpress.choosePaymentMethodsValues, payment.stripeExpress.paymentMethods.card);
        await this.click(woocommerceSettings.stripeExpress.choosePaymentMethods);
        await this.setDropdownOptionSpan(woocommerceSettings.stripeExpress.choosePaymentMethodsValues, payment.stripeExpress.paymentMethods.ideal);
        await this.check(woocommerceSettings.stripeExpress.takeProcessingFeesFromSellers);
        await this.check(woocommerceSettings.stripeExpress.savedCards);
        await this.check(woocommerceSettings.stripeExpress.capturePaymentsManually);
        await this.click(woocommerceSettings.stripeExpress.disburseFunds);
        await this.setDropdownOptionSpan(woocommerceSettings.stripeExpress.disbursementModeValues, payment.stripeExpress.disbursementMode);
        await this.clearAndType(woocommerceSettings.stripeExpress.customerBankStatement, payment.stripeExpress.customerBankStatement);
        // Payment Request Options (Apple Pay/Google Pay)
        await this.check(woocommerceSettings.stripeExpress.paymentRequestButtons);
        await this.selectByValue(woocommerceSettings.stripeExpress.buttonType, payment.stripeExpress.paymentRequestButtonType);
        await this.selectByValue(woocommerceSettings.stripeExpress.buttonTheme, payment.stripeExpress.paymentRequestButtonTheme);
        await this.click(woocommerceSettings.stripeExpress.buttonLocations);
        await this.setDropdownOptionSpan(woocommerceSettings.stripeExpress.buttonLocationsValues, payment.stripeExpress.paymentRequestButtonLocation.product);
        await this.click(woocommerceSettings.stripeExpress.buttonLocations);
        await this.setDropdownOptionSpan(woocommerceSettings.stripeExpress.buttonLocationsValues, payment.stripeExpress.paymentRequestButtonLocation.cart);
        // Advanced Settings
        await this.check(woocommerceSettings.stripeExpress.displayNoticeToNonConnectedSellers);
        await this.check(woocommerceSettings.stripeExpress.sendAnnouncementToNonConnectedSellers);
        await this.clearAndType(woocommerceSettings.stripeExpress.announcementInterval, payment.stripeExpress.announcementInterval);
        await this.click(woocommerceSettings.stripeExpress.stripeExpressSaveChanges);

        await this.toContainText(woocommerceSettings.updatedSuccessMessage, payment.saveSuccessMessage);
    }

    // vendor

    // payment settings render properly
    async vendorPaymentSettingsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsPayment);

        // paymentMethod text is visible
        await this.toBeVisible(paymentSettingsVendor.paymentMethodText);

        // paymentMethods summary div is visible
        await this.toBeVisible(paymentSettingsVendor.paymentMethods.paymentMethodsDiv);
        // paymentMethods dropdown is visible
        await this.toBeVisible(paymentSettingsVendor.paymentMethods.addPaymentMethodDropDown);

        await this.notToHaveCount(paymentSettingsVendor.paymentMethods.noOfPaymentMethods, 0);
    }

    // vendor set basic payment settings
    async setBasicPaymentSettings(payment: vendor['payment']): Promise<void> {
        await this.setBasicPayment({ ...data.vendor.payment, methodName: 'paypal' });
        await this.setBankTransfer(payment);
        await this.setBasicPayment({ ...data.vendor.payment, methodName: 'skrill' });
        await this.setBasicPayment({ ...data.vendor.payment, methodName: 'custom' });
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

        await this.clearAndType(paymentSettingsVendor.paymentEmail, paymentMethod.email());
        await this.clickAndWaitForResponse(data.subUrls.ajax, paymentSettingsVendor.updateSettings);
        await this.toContainText(paymentSettingsVendor.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
    }

    // bank transfer payment settings
    async setBankTransfer(paymentMethod: vendor['payment']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.bankTransfer);

        await this.clickIfVisible(paymentSettingsVendor.disconnectAccount);
        await this.clearAndType(paymentSettingsVendor.bankAccountName, paymentMethod.bankAccountName);
        await this.selectByValue(paymentSettingsVendor.bankAccountType, paymentMethod.bankAccountType);
        await this.clearAndType(paymentSettingsVendor.bankAccountNumber, paymentMethod.bankAccountNumber);
        await this.clearAndType(paymentSettingsVendor.bankRoutingNumber, paymentMethod.bankRoutingNumber);
        await this.clearAndType(paymentSettingsVendor.bankName, paymentMethod.bankName);
        await this.clearAndType(paymentSettingsVendor.bankAddress, paymentMethod.bankAddress);
        await this.clearAndType(paymentSettingsVendor.bankIban, paymentMethod.bankIban);
        await this.clearAndType(paymentSettingsVendor.bankSwiftCode, paymentMethod.bankSwiftCode);
        await this.check(selector.vendor.vSetup.declaration);

        await this.clickAndWaitForResponse(data.subUrls.ajax, paymentSettingsVendor.addAccount);
        await this.toContainText(paymentSettingsVendor.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
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

        await this.clickAndWaitForResponse(data.subUrls.ajax, paymentSettingsVendor.disconnectPayment);
        await this.toContainText(paymentSettingsVendor.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
    }
}
