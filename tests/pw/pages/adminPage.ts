import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { payment, dokanSetupWizard, woocommerce } from '@utils/interfaces';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO } = process.env;

// selectors
const setupWizardAdmin = selector.admin.dokan.setupWizard;
const reportsAdmin = selector.admin.dokan.reports;
const woocommerceSettings = selector.admin.wooCommerce.settings;

export class AdminPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // navigation

    async goToAdminDashboard() {
        await this.goIfNotThere(data.subUrls.backend.adminDashboard);
    }

    async goToDokanSettings() {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
    }

    async goToWooCommerceSettings() {
        await this.goIfNotThere(data.subUrls.backend.wc.settings);
    }

    // Woocommerce Settings

    // Enable Password Field
    async enablePasswordInputField(woocommerce: woocommerce) {
        await this.goToWooCommerceSettings();
        await this.click(woocommerceSettings.accounts);
        await this.uncheck(woocommerceSettings.automaticPasswordGeneration);
        await this.click(woocommerceSettings.accountSaveChanges);
        await this.toContainText(woocommerceSettings.updatedSuccessMessage, woocommerce.saveSuccessMessage);
    }

    // Admin Set Currency Options
    async setCurrencyOptions(currency: payment['currency']) {
        await this.goToWooCommerceSettings();

        // Set Currency Options
        await this.clearAndType(woocommerceSettings.thousandSeparator, currency.currencyOptions.thousandSeparator);
        await this.clearAndType(woocommerceSettings.decimalSeparator, currency.currencyOptions.decimalSeparator);
        await this.clearAndType(woocommerceSettings.numberOfDecimals, currency.currencyOptions.numberOfDecimals);
        await this.click(woocommerceSettings.generalSaveChanges);
        await this.toContainText(woocommerceSettings.updatedSuccessMessage, currency.saveSuccessMessage);
    }

    // Admin Set Currency
    async setCurrency(currency: string) {
        await this.goToWooCommerceSettings();
        const currentCurrency = await this.getElementText(woocommerceSettings.currency);
        if (currentCurrency !== currency) {
            await this.click(woocommerceSettings.currency);
            await this.clearAndType(woocommerceSettings.currency, currency);
            await this.press(data.key.enter);
            await this.click(woocommerceSettings.generalSaveChanges);
            await this.toContainText(woocommerceSettings.updatedSuccessMessage, data.payment.currency.saveSuccessMessage);
        }
    }

    // get order details from allLog table
    async getOrderDetails(orderNumber: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

        await this.clearAndType(reportsAdmin.allLogs.search, orderNumber);

        const aOrderDetails = {
            orderNumber: ((await this.getElementText(reportsAdmin.allLogs.orderDetails.orderId)) as string).split('#')[1],
            store: await this.getElementText(reportsAdmin.allLogs.orderDetails.store),
            orderTotal: helpers.price((await this.getElementText(reportsAdmin.allLogs.orderDetails.orderTotal)) as string),
            vendorEarning: helpers.price((await this.getElementText(reportsAdmin.allLogs.orderDetails.vendorEarning)) as string),
            commission: helpers.price((await this.getElementText(reportsAdmin.allLogs.orderDetails.commission)) as string),
            gatewayFee: helpers.price((await this.getElementText(reportsAdmin.allLogs.orderDetails.gatewayFee)) as string),
            shippingCost: helpers.price((await this.getElementText(reportsAdmin.allLogs.orderDetails.shippingCost)) as string),
            tax: helpers.price((await this.getElementText(reportsAdmin.allLogs.orderDetails.tax)) as string),
            orderStatus: await this.getElementText(reportsAdmin.allLogs.orderDetails.orderStatus),
            orderDate: await this.getElementText(reportsAdmin.allLogs.orderDetails.orderDate),
        };

        return aOrderDetails;
    }

    // Get Total Admin Commission from Admin Dashboard
    async getTotalAdminCommission() {
        await this.goIfNotThere(data.subUrls.backend.dokan.dokan);
        const totalAdminCommission = helpers.price((await this.getElementText(selector.admin.dokan.dashboard.atAGlance.commissionEarned)) as string);
        return totalAdminCommission;
    }

    // Dokan Setup Wizard

    // Admin Set Dokan Setup Wizard
    async setDokanSetupWizard(dokanSetupWizard: dokanSetupWizard) {
        await this.goIfNotThere(data.subUrls.backend.dokan.setupWizard);
        await this.click(setupWizardAdmin.letsGo);

        // Store
        await this.clearAndType(setupWizardAdmin.vendorStoreURL, dokanSetupWizard.vendorStoreURL);
        await this.selectByValue(setupWizardAdmin.shippingFeeRecipient, dokanSetupWizard.shippingFeeRecipient);
        await this.selectByValue(setupWizardAdmin.taxFeeRecipient, dokanSetupWizard.taxFeeRecipient);
        await this.selectByValue(setupWizardAdmin.mapApiSource, dokanSetupWizard.mapApiSource);
        await this.clearAndType(setupWizardAdmin.googleMapApiKey, dokanSetupWizard.googleMapApiKey);
        await this.enableSwitcherSetupWizard(setupWizardAdmin.shareEssentialsOff);
        DOKAN_PRO && (await this.selectByValue(setupWizardAdmin.sellingProductTypes, dokanSetupWizard.sellingProductTypes));
        await this.click(setupWizardAdmin.continue);
        // await this.click(setupWizardAdmin.skipThisStep)

        // Selling
        await this.enableSwitcherSetupWizard(setupWizardAdmin.newVendorEnableSelling);
        await this.selectByValue(setupWizardAdmin.commissionType, dokanSetupWizard.commissionType);
        await this.clearAndType(setupWizardAdmin.adminCommission, dokanSetupWizard.adminCommission);
        await this.enableSwitcherSetupWizard(setupWizardAdmin.orderStatusChange);
        await this.click(setupWizardAdmin.continue);
        // await this.click(setupWizardAdmin.skipThisStep)

        // Withdraw
        await this.enableSwitcherSetupWizard(setupWizardAdmin.payPal);
        await this.enableSwitcherSetupWizard(setupWizardAdmin.bankTransfer);
        // await this.enableSwitcherSetupWizard(setupWizardAdmin.wirecard)
        // await this.enableSwitcherSetupWizard(setupWizardAdmin.stripe)
        DOKAN_PRO && (await this.enableSwitcherSetupWizard(setupWizardAdmin.custom));
        DOKAN_PRO && (await this.enableSwitcherSetupWizard(setupWizardAdmin.skrill));
        await this.clearAndType(setupWizardAdmin.minimumWithdrawLimit, dokanSetupWizard.minimumWithdrawLimit);
        await this.enableSwitcherSetupWizard(setupWizardAdmin.orderStatusForWithdrawCompleted);
        await this.enableSwitcherSetupWizard(setupWizardAdmin.orderStatusForWithdrawProcessing);
        await this.click(setupWizardAdmin.continue);

        // Recommended
        await this.disableSwitcherSetupWizard(setupWizardAdmin.wooCommerceConversionTracking);
        await this.disableSwitcherSetupWizard(setupWizardAdmin.weMail);
        await this.disableSwitcherSetupWizard(setupWizardAdmin.texty);
        await this.click(setupWizardAdmin.continueRecommended);

        // Ready!
        await this.click(setupWizardAdmin.visitDokanDashboard);
        await this.toBeVisible(selector.admin.dokan.dashboard.dashboardText);
    }
}
