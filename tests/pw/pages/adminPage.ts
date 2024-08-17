import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { payment, dokanSetupWizard, woocommerce } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const setupWizardAdmin = selector.admin.dokan.setupWizard;
const reportsAdmin = selector.admin.dokan.reports;
const woocommerceSettings = selector.admin.wooCommerce.settings;
const generalSettings = selector.admin.wooCommerce.settings.general;
const accountSettings = selector.admin.wooCommerce.settings.accounts;

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
        await this.goIfNotThere(data.subUrls.backend.wc.accountSettings);

        await this.uncheck(accountSettings.automaticPasswordGeneration);
        await this.click(accountSettings.accountSaveChanges);
        await this.toContainText(woocommerceSettings.updatedSuccessMessage, woocommerce.saveSuccessMessage);
    }

    // Admin Set Currency Options
    async setCurrencyOptions(currency: payment['currency']) {
        await this.goToWooCommerceSettings();

        // Set Currency Options
        await this.clearAndType(generalSettings.thousandSeparator, currency.currencyOptions.thousandSeparator);
        await this.clearAndType(generalSettings.decimalSeparator, currency.currencyOptions.decimalSeparator);
        await this.clearAndType(generalSettings.numberOfDecimals, currency.currencyOptions.numberOfDecimals);
        await this.click(generalSettings.generalSaveChanges);
        await this.toContainText(woocommerceSettings.updatedSuccessMessage, currency.saveSuccessMessage);
    }

    // Admin Set Currency
    async setCurrency(currency: string) {
        await this.goToWooCommerceSettings();
        const currentCurrency = await this.getElementText(generalSettings.currency);
        if (currentCurrency !== currency) {
            await this.click(generalSettings.currency);
            await this.clearAndType(generalSettings.currencyInput, currency);
            await this.press(data.key.enter);
            await this.click(generalSettings.generalSaveChanges);
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
        if (DOKAN_PRO) {
            await this.selectByValue(setupWizardAdmin.sellingProductTypes, dokanSetupWizard.sellingProductTypes);
        }
        await this.click(setupWizardAdmin.continue);
        // await this.click(setupWizardAdmin.skipThisStep)

        // Selling
        await this.enableSwitcherSetupWizard(setupWizardAdmin.newVendorEnableSelling);
        await this.enableSwitcherSetupWizard(setupWizardAdmin.orderStatusChange);
        await this.click(setupWizardAdmin.continue);
        // await this.click(setupWizardAdmin.skipThisStep)

        // Commission
        await this.selectByValue(setupWizardAdmin.commissionType, dokanSetupWizard.commission.commissionType);
        await this.clearAndType(setupWizardAdmin.percentage, dokanSetupWizard.commission.commissionPercentage);
        await this.clearAndType(setupWizardAdmin.fixed, dokanSetupWizard.commission.commissionFixed);
        await this.click(setupWizardAdmin.continue);

        // Withdraw
        await this.enableSwitcherSetupWizard(setupWizardAdmin.payPal);
        await this.enableSwitcherSetupWizard(setupWizardAdmin.bankTransfer);
        if (DOKAN_PRO) {
            // await this.enableSwitcherSetupWizard(setupWizardAdmin.wirecard)
            // await this.enableSwitcherSetupWizard(setupWizardAdmin.stripe)
            await this.enableSwitcherSetupWizard(setupWizardAdmin.custom);
            await this.enableSwitcherSetupWizard(setupWizardAdmin.skrill);
        }
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
