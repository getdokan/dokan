import { Page } from '@playwright/test';
import { BasePage } from 'pages/basePage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { payment, dokanSetupWizard, woocommerce } from 'utils/interfaces';

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

	// Admin Setup Woocommerce Settings
	// async setWoocommerceSettings(data: any) {
	// await this.enablePasswordInputField(data);
	// await this.addStandardTaxRate(data.tax);
	// await this.setCurrencyOptions(data.currency);
	// await this.addShippingMethod(data.shipping.shippingMethods.flatRate);
	// await this.addShippingMethod(data.shipping.shippingMethods.flatRate);
	// await this.addShippingMethod(data.shipping.shippingMethods.freeShipping);
	// await this.addShippingMethod(data.shipping.shippingMethods.tableRateShipping);
	// await this.addShippingMethod(data.shipping.shippingMethods.distanceRateShipping);
	// await this.addShippingMethod(data.shipping.shippingMethods.vendorShipping);
	// await this.deleteShippingMethod(data.shipping.shippingMethods.flatRate);
	// await this.deleteShippingZone(data.shipping.shippingZone);
	// }


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
			await this.type(selector.admin.wooCommerce.settings.currency, currency);
			await this.press(data.key.enter);
			await this.click(selector.admin.wooCommerce.settings.generalSaveChanges);
			await this.toContainText(selector.admin.wooCommerce.settings.updatedSuccessMessage, data.payment.currency.saveSuccessMessage );
		}
	}


	// async getOrderDetails(orderNumber: any) {
	// 	const subMenuOpened = await this.getClassValue(selector.admin.aDashboard.dokanMenu);
	// 	if (subMenuOpened.includes('opensub')) {
	// 		await this.hover(selector.admin.aDashboard.dokan);
	// 		await this.click(selector.admin.dokan.menus.reports);
	// 	} else {
	// 		await this.click(selector.admin.dokan.menus.reports);

	// 	}
	// 	await this.click(selector.admin.dokan.reports.allLogs);

	// 	await this.type(selector.admin.dokan.reports.searchByOrder, orderNumber);


	// 	const aOrderDetails = {
	// 		orderNumber: (await this.getElementText(selector.admin.dokan.reports.orderId)).split('#')[1],
	// 		store: await this.getElementText(selector.admin.dokan.reports.store),
	// 		orderTotal: helpers.price(await this.getElementText(selector.admin.dokan.reports.orderTotal)),
	// 		vendorEarning: helpers.price(await this.getElementText(selector.admin.dokan.reports.vendorEarning)),
	// 		commission: helpers.price(await this.getElementText(selector.admin.dokan.reports.commission)),
	// 		gatewayFee: helpers.price(await this.getElementText(selector.admin.dokan.reports.gatewayFee)),
	// 		shippingCost: helpers.price(await this.getElementText(selector.admin.dokan.reports.shippingCost)),
	// 		tax: helpers.price(await this.getElementText(selector.admin.dokan.reports.tax)),
	// 		orderStatus: await this.getElementText(selector.admin.dokan.reports.orderStatus),
	// 		orderDate: await this.getElementText(selector.admin.dokan.reports.orderDate),
	// 	};
	// 	return aOrderDetails;
	// }

	// // Get Total Admin Commission from Admin Dashboard
	// async getTotalAdminCommission() {
	// 	await this.hover(selector.admin.aDashboard.dokan);
	// 	await this.click(selector.admin.dokan.menus.dashboard);

	// 	const totalAdminCommission = helpers.price(await this.getElementText(selector.admin.dokan.dashboard.commissionEarned));
	// 	return totalAdminCommission;
	// }


	// Dokan Setup Wizard

	// Admin Set Dokan Setup Wizard
	async setDokanSetupWizard(dokanSetupWizard: dokanSetupWizard) {
		// await this.hover(selector.admin.aDashboard.dokan)
		// await this.click(selector.admin.dokan.toolsMenu)

		// Open Dokan Setup Wizard
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
		await this.selectByValue(selector.admin.dokan.dokanSetupWizard.sellingProductTypes, dokanSetupWizard.sellingProductTypes);
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
		await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.custom);
		await this.enableSwitcherSetupWizard(selector.admin.dokan.dokanSetupWizard.skrill);
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
	async dokanPromotion(){
		await this.goto(data.subUrls.backend.dokan.dokan);
		// dokan promotion elements are visible
		const isPromotionVisible = await this.isVisible(selector.admin.dokan.promotion.promotion);
		if(isPromotionVisible){
			await this.multipleElementVisible(selector.admin.dokan.promotion);
		} else {
			console.log('No promotion is ongoing');
		}
	}


	// dokan notice
	async dokanNotice(){
		await this.goto(data.subUrls.backend.dokan.dokan);

		await this.notToHaveCount(selector.admin.dokan.notice.noticeDiv, 0); // because of promo notice

		// dokan notice elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		// const { noticeDiv, ...notice } = selector.admin.dokan.notice; // TODO: conflicting locator if promo notice exists
		// await this.multipleElementVisible(notice);
	}

}
