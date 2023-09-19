import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { payment, dokanSetupWizard, woocommerce } from '@utils/interfaces';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO } = process.env;

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
        await this.click(selector.admin.wooCommerce.settings.accounts);
        await this.uncheck(selector.admin.wooCommerce.settings.automaticPasswordGeneration);
        await this.click(selector.admin.wooCommerce.settings.accountSaveChanges);
        await this.toContainText(selector.admin.wooCommerce.settings.updatedSuccessMessage, woocommerce.saveSuccessMessage);
    }

    // Admin Set Currency Options
    async setCurrencyOptions(currency: payment['currency']) {
        await this.goToWooCommerceSettings();

        // Set Currency Options
        await this.clearAndType(selector.admin.wooCommerce.settings.thousandSeparator, currency.currencyOptions.thousandSeparator);
        await this.clearAndType(selector.admin.wooCommerce.settings.decimalSeparator, currency.currencyOptions.decimalSeparator);
        await this.clearAndType(selector.admin.wooCommerce.settings.numberOfDecimals, currency.currencyOptions.numberOfDecimals);
        await this.click(selector.admin.wooCommerce.settings.generalSaveChanges);
        await this.toContainText(selector.admin.wooCommerce.settings.updatedSuccessMessage, currency.saveSuccessMessage);
    }

    // Admin Set Currency
    async setCurrency(currency: string) {
        await this.goToWooCommerceSettings();
        const currentCurrency = await this.getElementText(selector.admin.wooCommerce.settings.currency);
        if (currentCurrency !== currency) {
            await this.click(selector.admin.wooCommerce.settings.currency);
            await this.clearAndType(selector.admin.wooCommerce.settings.currency, currency);
            await this.press(data.key.enter);
            await this.click(selector.admin.wooCommerce.settings.generalSaveChanges);
            await this.toContainText(selector.admin.wooCommerce.settings.updatedSuccessMessage, data.payment.currency.saveSuccessMessage);
        }
    }

    // get order details from allLog table
    async getOrderDetails(orderNumber: string) {
        await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

        await this.clearAndType(selector.admin.dokan.reports.allLogs.search, orderNumber);

        const aOrderDetails = {
            orderNumber: ((await this.getElementText(selector.admin.dokan.reports.allLogs.orderDetails.orderId)) as string).split('#')[1],
            store: await this.getElementText(selector.admin.dokan.reports.allLogs.orderDetails.store),
            orderTotal: helpers.price((await this.getElementText(selector.admin.dokan.reports.allLogs.orderDetails.orderTotal)) as string),
            vendorEarning: helpers.price((await this.getElementText(selector.admin.dokan.reports.allLogs.orderDetails.vendorEarning)) as string),
            commission: helpers.price((await this.getElementText(selector.admin.dokan.reports.allLogs.orderDetails.commission)) as string),
            gatewayFee: helpers.price((await this.getElementText(selector.admin.dokan.reports.allLogs.orderDetails.gatewayFee)) as string),
            shippingCost: helpers.price((await this.getElementText(selector.admin.dokan.reports.allLogs.orderDetails.shippingCost)) as string),
            tax: helpers.price((await this.getElementText(selector.admin.dokan.reports.allLogs.orderDetails.tax)) as string),
            orderStatus: await this.getElementText(selector.admin.dokan.reports.allLogs.orderDetails.orderStatus),
            orderDate: await this.getElementText(selector.admin.dokan.reports.allLogs.orderDetails.orderDate),
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
        // await this.hover(selector.admin.aDashboard.dokan)
        // await this.click(selector.admin.dokan.toolsMenu)
        // await this.click(selector.admin.dokan.tools.openSetupWizard)

        await this.goIfNotThere(data.subUrls.backend.dokan.setupWizard);
        await this.click(selector.admin.dokan.dokanSetupWizard.letsGo);

        // Store
        await this.clearAndType(selector.admin.dokan.dokanSetupWizard.vendorStoreURL, dokanSetupWizard.vendorStoreURL);
        await this.selectByValue(selector.admin.dokan.dokanSetupWizard.shippingFeeRecipient, dokanSetupWizard.shippingFeeRecipient);
        await this.selectByValue(selector.admin.dokan.dokanSetupWizard.taxFeeRecipient, dokanSetupWizard.taxFeeRecipient);
        await this.selectByValue(selector.admin.dokan.dokanSetupWizard.mapApiSource, dokanSetupWizard.mapApiSource);
        await this.clearAndType(selector.admin.dokan.dokanSetupWizard.googleMapApiKey, dokanSetupWizard.googleMapApiKey);
        await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.shareEssentialsOff);
        DOKAN_PRO && (await this.selectByValue(selector.admin.dokan.dokanSetupWizard.sellingProductTypes, dokanSetupWizard.sellingProductTypes));
        await this.click(selector.admin.dokan.dokanSetupWizard.continue);
        // await this.click(selector.admin.dokan.dokanSetupWizard.skipThisStep)

        // Selling
        await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.newVendorEnableSelling);
        await this.selectByValue(selector.admin.dokan.dokanSetupWizard.commissionType, dokanSetupWizard.commissionType);
        await this.clearAndType(selector.admin.dokan.dokanSetupWizard.adminCommission, dokanSetupWizard.adminCommission);
        await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.orderStatusChange);
        await this.click(selector.admin.dokan.dokanSetupWizard.continue);
        // await this.click(selector.admin.dokan.dokanSetupWizard.skipThisStep)

        // Withdraw
        await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.payPal);
        await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.bankTransfer);
        // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.wirecard)
        // await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.stripe)
        DOKAN_PRO && (await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.custom));
        DOKAN_PRO && (await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.skrill));
        await this.clearAndType(selector.admin.dokan.dokanSetupWizard.minimumWithdrawLimit, dokanSetupWizard.minimumWithdrawLimit);
        await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.orderStatusForWithdrawCompleted);
        await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.orderStatusForWithdrawProcessing);
        await this.click(selector.admin.dokan.dokanSetupWizard.continue);

        // Recommended
        await this.disableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.wooCommerceConversionTracking);
        await this.disableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.weMail);
        await this.disableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.texty);
        await this.click(selector.admin.dokan.dokanSetupWizard.continueRecommended);

        // Ready!
        await this.click(selector.admin.dokan.dokanSetupWizard.visitDokanDashboard);
        await this.toBeVisible(selector.admin.dokan.dashboard.dashboardText);
    }

    // dokan notice & promotion

    // dokan notice
    async dokanPromotion() {
        await this.goto(data.subUrls.backend.dokan.dokan);
        // dokan promotion elements are visible
        const isPromotionVisible = await this.isVisible(selector.admin.dokan.promotion.promotion);
        if (isPromotionVisible) {
            await this.multipleElementVisible(selector.admin.dokan.promotion);
        } else {
            console.log('No promotion is ongoing');
        }
    }

    // dokan notice
    async dokanNotice() {
        await this.goto(data.subUrls.backend.dokan.dokan);

        // dokan notice elements are visible
        const isPromotionVisible = await this.isVisible(selector.admin.dokan.promotion.promotion);
        isPromotionVisible ? await this.notToHaveCount(selector.admin.dokan.notice.noticeDiv1, 0) : await this.notToHaveCount(selector.admin.dokan.notice.noticeDiv, 0);
        await this.notToHaveCount(selector.admin.dokan.notice.slider, 0);
        await this.notToHaveCount(selector.admin.dokan.notice.sliderPrev, 0);
        await this.notToHaveCount(selector.admin.dokan.notice.sliderNext, 0);
    }
}
