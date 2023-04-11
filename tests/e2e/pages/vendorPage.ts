import { expect, type Page } from '@playwright/test';
import { BasePage } from './basePage';
import { LoginPage } from './loginPage';
import { AdminPage } from './adminPage';
import { CustomerPage } from './customerPage';
import { selector } from './selectors';
import { data } from '../utils/testData';
import { helpers } from '../utils/helpers';

export class VendorPage extends BasePage {
	constructor(page: Page) {
		super(page);
	}

	loginPage = new LoginPage(this.page);
	customerPage = new CustomerPage(this.page);
	// adminPage = new AdminPage(this.page);

	// navigation

	async goToMyAccount(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.myAccount);
	}

	async goToVendorDashboard(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.dashboard);
	}

	// setup wizard

	// vendor registration
	async vendorRegister(vendorInfo: {
		email?: () => string; emailDomain?: string; password: any; password1?: string; firstName: any; lastName: any; userName?: string; shopName: any; shopUrl?: string; companyName: any; companyId: any; vatNumber: any; bankName: any; bankIban: any; phoneNumber: any; street1?: string; street2?: string; country?: string; countrySelectValue?: string; stateSelectValue?: string; city?: string; zipCode?: string; state?: string; accountName?: string; accountNumber?: string; bankAddress?: string; routingNumber?: string; swiftCode?: string; iban?: string; banner?: string; profilePicture?: string; storeName?: string; productsPerPage?: string; mapLocation?: string; termsAndConditions?: string; biography?: string; supportButtonText?: string; openingClosingTime?: { days: string[]; openingTime: string; closingTime: string; }; vacation?: { vacationDayFrom: () => string; vacationDayTo: () => string; closingStyle: string; vacationMessage: string; }; discount?: { minimumOrderAmount: string; minimumOrderAmountPercentage: string; }; minMax?: { minimumProductQuantity: string; maximumProductQuantity: string; minimumAmount: string; maximumAmount: string; category: string; }; storeSettingsSaveSuccessMessage?: string;
	}, setupWizardData: { choice: boolean; storeProductsPerPage: string; street1: string; street2: string; country: string; city: string; zipCode: string; state: string; paypal: () => string; bankAccountName: string; bankAccountType: string; bankAccountNumber: string; bankName: string; bankAddress: string; bankRoutingNumber: string; bankIban: string; bankSwiftCode: string; customPayment: string; skrill: string; }): Promise<void> {
		await this.goToMyAccount();
		const loginIsVisible = await this.isVisible(selector.customer.cRegistration.regEmail);
		if (!loginIsVisible) {
			await this.loginPage.logout();
		}
		const username = vendorInfo.firstName();
		await this.clearAndFill(selector.vendor.vRegistration.regEmail, username + data.vendor.vendorInfo.emailDomain);
		await this.clearAndFill(selector.vendor.vRegistration.regPassword, vendorInfo.password);
		await this.click(selector.vendor.vRegistration.regVendor);
		await this.waitForSelector(selector.vendor.vRegistration.firstName);
		await this.type(selector.vendor.vRegistration.firstName, username);
		await this.type(selector.vendor.vRegistration.lastName, vendorInfo.lastName());
		await this.type(selector.vendor.vRegistration.shopName, vendorInfo.shopName);
		// await this.clearAndFill(selector.vendor.shopUrl, shopUrl)
		await this.click(selector.vendor.vRegistration.shopUrl);
		await this.type(selector.vendor.vRegistration.companyName, vendorInfo.companyName);
		await this.type(selector.vendor.vRegistration.companyId, vendorInfo.companyId);
		await this.type(selector.vendor.vRegistration.vatNumber, vendorInfo.vatNumber);
		await this.type(selector.vendor.vRegistration.bankName, vendorInfo.bankName);
		await this.type(selector.vendor.vRegistration.bankIban, vendorInfo.bankIban);
		await this.type(selector.vendor.vRegistration.phone, vendorInfo.phoneNumber);
		const termsAndConditionsIsVisible = await this.isVisible(selector.customer.cDashboard.termsAndConditions);
		if (termsAndConditionsIsVisible) {
			await this.check(selector.customer.cDashboard.termsAndConditions);
		}
		const subscriptionPackIsVisible = await this.isVisible(selector.vendor.vRegistration.subscriptionPack);
		if (subscriptionPackIsVisible) {
			// await this.selectOptionByText(selector.vendor.vRegistration.subscriptionPack, selector.vendor.vRegistration.subscriptionPackOptions, data.predefined.vendorSubscription.nonRecurring.productName())    //TODO:
			await this.selectByValue(selector.vendor.vRegistration.subscriptionPack, data.predefined.vendorSubscription.nonRecurring);
		}
		await this.click(selector.vendor.vRegistration.register);
		const registrationErrorIsVisible = await this.isVisible(selector.customer.cWooSelector.wooCommerceError);
		if (registrationErrorIsVisible) {
			const errorMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceError);
			if (errorMessage.includes(data.customer.registrationErrorMessage)) {
				return;
			}
		}
		if (subscriptionPackIsVisible) {
			await this.customerPage.placeOrder('bank', false, false, true);
		}
		await this.vendorSetupWizard(setupWizardData);
	}

	// vendor setup wizard
	async vendorSetupWizard(setupWizardData: { choice: any; storeProductsPerPage: any; street1: any; street2: any; country: any; city: any; zipCode: any; state: any; paypal: any; bankAccountName: any; bankAccountType: any; bankAccountNumber: any; bankName: any; bankAddress: any; bankRoutingNumber: any; bankIban: any; bankSwiftCode: any; customPayment: any; skrill: any; }): Promise<void> {
		if (setupWizardData.choice) {
			await this.click(selector.vendor.vSetup.letsGo);
			await this.clearAndFill(selector.vendor.vSetup.storeProductsPerPage, setupWizardData.storeProductsPerPage);
			await this.type(selector.vendor.vSetup.street1, setupWizardData.street1);
			await this.type(selector.vendor.vSetup.street2, setupWizardData.street2);
			await this.type(selector.vendor.vSetup.city, setupWizardData.city);
			await this.type(selector.vendor.vSetup.zipCode, setupWizardData.zipCode);
			await this.click(selector.vendor.vSetup.country);
			await this.type(selector.vendor.vSetup.countryInput, setupWizardData.country);
			await this.press(data.key.enter);
			await this.type(selector.vendor.vSetup.state, setupWizardData.state);
			await this.press(data.key.enter);
			await this.click(selector.vendor.vSetup.email);
			await this.click(selector.vendor.vSetup.continueStoreSetup);
			// paypal
			await this.clearAndFill(selector.vendor.vSetup.paypal, setupWizardData.paypal());
			// bank transfer
			await this.type(selector.vendor.vSetup.bankAccountName, setupWizardData.bankAccountName);
			await this.selectByValue(selector.vendor.vSetup.bankAccountType, setupWizardData.bankAccountType);
			await this.type(selector.vendor.vSetup.bankRoutingNumber, setupWizardData.bankRoutingNumber);
			await this.type(selector.vendor.vSetup.bankAccountNumber, setupWizardData.bankAccountNumber);
			await this.type(selector.vendor.vSetup.bankName, setupWizardData.bankName);
			await this.type(selector.vendor.vSetup.bankAddress, setupWizardData.bankAddress);
			await this.type(selector.vendor.vSetup.bankIban, setupWizardData.bankIban);
			await this.type(selector.vendor.vSetup.bankSwiftCode, setupWizardData.bankSwiftCode);
			await this.check(selector.vendor.vSetup.declaration);
			await this.type(selector.vendor.vSetup.customPayment, setupWizardData.customPayment);
			await this.clearAndFill(selector.vendor.vSetup.skrill, setupWizardData.skrill);
			await this.click(selector.vendor.vSetup.continuePaymentSetup);
			await this.click(selector.vendor.vSetup.goToStoreDashboard);
			// const dashboardIsVisible = await this.isVisible(selector.vendor.vDashboard.dashboard);
			// expect(dashboardIsVisible).toBe(true);
			await expect(this.page.locator(selector.vendor.vDashboard.dashboard)).toBeVisible();
		} else {
			await this.click(selector.vendor.vSetup.notRightNow);
			// const dashboardIsVisible = await this.isVisible(selector.vendor.vDashboard.dashboard);
			// expect(dashboardIsVisible).toBe(true);
			await expect(this.page.locator(selector.vendor.vDashboard.dashboard)).toBeVisible();
		}
	}

	// vendor add product category
	async addCategory(category: string): Promise<void> {
		await this.click(selector.vendor.product.productCategoryModal);
		await this.page.locator(selector.vendor.product.productCategorySearchInput).waitFor({ state: "visible" }) //TODO : move to base page
		await this.type(selector.vendor.product.productCategorySearchInput, category);
		await this.click(selector.vendor.product.productCategorySearchResult);
		await this.click(selector.vendor.product.productCategoryDone);

		const categoryAlreadySelectedPopup = await this.isVisible(selector.vendor.product.productCategoryAlreadySelectedPopup);
		if (categoryAlreadySelectedPopup) {
			await this.click(selector.vendor.product.productCategoryAlreadySelectedPopup);
			await this.click(selector.vendor.product.productCategoryModalClose);
		}
		//TODO: handle multiple category selection with assertion
	}

	// products

	// vendor add simple product
	async addSimpleProduct(product): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.product);

		const productName = product.productName();
		// add new simple product
		await this.click(selector.vendor.product.addNewProduct);
		await this.page.locator(selector.vendor.product.productName).waitFor({ state: "visible" }) //TODO : move to base page
		await this.type(selector.vendor.product.productName, productName);
		await this.type(selector.vendor.product.productPrice, product.regularPrice());
		await this.addCategory(product.category) // TODO: split in separate test
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.product.createProduct);

		const createdProduct = await this.getElementValue(selector.vendor.product.title);
		expect(createdProduct.toLowerCase()).toBe(productName.toLowerCase());
	}

	// vendor add variable product
	async addVariableProduct(product: { productType: any; productName?: () => string; category?: string; regularPrice: any; storeName?: string; status?: string; stockStatus?: boolean; attribute: any; attributeTerms?: string[]; variations: any; saveSuccessMessage: any; }): Promise<void> {
		await this.addSimpleProduct(product);

		// edit product
		await this.selectByValue(selector.vendor.product.productType, product.productType);
		// add variation
		await this.selectByValue(selector.vendor.product.customProductAttribute, `pa_${product.attribute}`);
		await this.click(selector.vendor.product.addAttribute);
		await this.waitForSelector(selector.vendor.product.selectAll);
		await this.click(selector.vendor.product.selectAll);
		await this.click(selector.vendor.product.usedForVariations);
		await this.waitForSelector(selector.vendor.product.saveAttributes);
		await this.click(selector.vendor.product.saveAttributes);
		await this.waitForSelector(selector.vendor.product.addVariations);
		await this.selectByValue(selector.vendor.product.addVariations, product.variations.linkAllVariation);
		await this.click(selector.vendor.product.go);
		await this.waitForSelector(selector.vendor.product.confirmGo);
		await this.click(selector.vendor.product.confirmGo);
		await this.click(selector.vendor.product.okSuccessAlertGo);
		await this.selectByValue(selector.vendor.product.addVariations, product.variations.variableRegularPrice);
		await this.click(selector.vendor.product.go);
		// await this.waitForSelector(selector.vendor.product.variationPrice)
		await this.type(selector.vendor.product.variationPrice, product.regularPrice());
		await this.click(selector.vendor.product.okVariationPrice);
		await this.clickAndWaitForResponse(data.subUrls.frontend.product, selector.vendor.product.saveProduct, 302);

		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage.replace(/\s+/g, ' ').trim()).toMatch(product.saveSuccessMessage);
	}

	// vendor add simple subscription product
	async addSimpleSubscription(product: { productType: any; productName?: () => string; category?: string; regularPrice?: () => string; subscriptionPrice: any; subscriptionPeriodInterval: any; subscriptionPeriod: any; expireAfter: any; subscriptionTrialLength: any; subscriptionTrialPeriod: any; storeName?: string; status?: string; saveSuccessMessage: any; }): Promise<void> {
		await this.addSimpleProduct(product);
		// edit product
		await this.selectByValue(selector.vendor.product.productType, product.productType);
		await this.type(selector.vendor.product.subscriptionPrice, product.subscriptionPrice());
		await this.selectByValue(selector.vendor.product.subscriptionPeriodInterval, product.subscriptionPeriodInterval);
		await this.selectByValue(selector.vendor.product.subscriptionPeriod, product.subscriptionPeriod);
		await this.selectByValue(selector.vendor.product.expireAfter, product.expireAfter);
		await this.type(selector.vendor.product.subscriptionTrialLength, product.subscriptionTrialLength);
		await this.selectByValue(selector.vendor.product.subscriptionTrialPeriod, product.subscriptionTrialPeriod);

		await this.clickAndWaitForResponse(data.subUrls.frontend.product, selector.vendor.product.saveProduct, 302);

		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage.replace(/\s+/g, ' ').trim()).toMatch(product.saveSuccessMessage);
	}

	// vendor add variable subscription product
	async addVariableSubscription(product: { productType: any; productName?: () => string; category?: string; subscriptionPrice?: () => string; subscriptionPeriodInterval?: string; subscriptionPeriod?: string; expireAfter?: string; subscriptionTrialLength?: string; subscriptionTrialPeriod?: string; storeName?: string; status?: string; attribute: any; attributeTerms?: string[]; variations: any; saveSuccessMessage: any; regularPrice?: any; }): Promise<void> {
		await this.addSimpleProduct(product);
		// edit product
		await this.selectByValue(selector.vendor.product.productType, product.productType);
		// add variation
		await this.selectByValue(selector.vendor.product.customProductAttribute, `pa_${product.attribute}`);
		await this.click(selector.vendor.product.addAttribute);
		await this.waitForSelector(selector.vendor.product.selectAll);
		await this.click(selector.vendor.product.selectAll);
		await this.click(selector.vendor.product.usedForVariations);
		await this.waitForSelector(selector.vendor.product.saveAttributes);
		await this.click(selector.vendor.product.saveAttributes);
		await this.waitForSelector(selector.vendor.product.addVariations);
		await this.selectByValue(selector.vendor.product.addVariations, product.variations.linkAllVariation);
		await this.click(selector.vendor.product.go);
		await this.waitForSelector(selector.vendor.product.confirmGo);
		await this.click(selector.vendor.product.confirmGo);
		await this.click(selector.vendor.product.okSuccessAlertGo);
		await this.selectByValue(selector.vendor.product.addVariations, product.variations.variableRegularPrice);
		await this.click(selector.vendor.product.go);
		await this.waitForSelector(selector.vendor.product.variationPrice);
		await this.type(selector.vendor.product.variationPrice, product.regularPrice());
		await this.click(selector.vendor.product.okVariationPrice); // todo : add waitForResponse with click

		await this.clickAndWaitForResponse(data.subUrls.frontend.product, selector.vendor.product.saveProduct, 302);

		await this.waitForSelector(selector.vendor.product.updatedSuccessMessage);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage.replace(/\s+/g, ' ').trim()).toMatch(product.saveSuccessMessage);
	}

	// vendor add external product
	async addExternalProduct(product: { productType: any; productName?: () => string; productUrl: any; buttonText: any; category?: string; regularPrice: any; storeName?: string; status?: string; saveSuccessMessage: any; }): Promise<void> {
		await this.addSimpleProduct(product);
		// edit product
		await this.selectByValue(selector.vendor.product.productType, product.productType);
		await this.type(selector.vendor.product.productUrl, await this.getBaseUrl() + product.productUrl);
		await this.type(selector.vendor.product.buttonText, product.buttonText);
		await this.clearAndFill(selector.vendor.product.price, product.regularPrice());

		await this.clickAndWaitForResponse(data.subUrls.frontend.product, selector.vendor.product.saveProduct, 302);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage.replace(/\s+/g, ' ').trim()).toMatch(product.saveSuccessMessage);
	}

	// vendor add auction product
	async addAuctionProduct(product: { productName: any; productType?: string; category?: string; itemCondition: any; auctionType: any; regularPrice: any; bidIncrement: any; reservedPrice: any; buyItNowPrice: any; startDate: any; endDate: any; saveSuccessMessage: any; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.auction);

		// add new auction product
		await this.click(selector.vendor.vAuction.addNewActionProduct);
		await this.type(selector.vendor.vAuction.productName, product.productName());
		// await this.addCategory(product.category)
		await this.selectByValue(selector.vendor.vAuction.itemCondition, product.itemCondition);
		await this.selectByValue(selector.vendor.vAuction.auctionType, product.auctionType);
		await this.type(selector.vendor.vAuction.startPrice, product.regularPrice());
		await this.type(selector.vendor.vAuction.bidIncrement, product.bidIncrement());
		await this.type(selector.vendor.vAuction.reservedPrice, product.reservedPrice());
		await this.type(selector.vendor.vAuction.buyItNowPrice, product.buyItNowPrice());
		await this.removeAttribute(selector.vendor.vAuction.auctionStartDate, 'readonly');
		await this.removeAttribute(selector.vendor.vAuction.auctionEndDate, 'readonly');
		await this.type(selector.vendor.vAuction.auctionStartDate, product.startDate);
		await this.type(selector.vendor.vAuction.auctionEndDate, product.endDate);
		await this.clickAndWaitForResponse(data.subUrls.frontend.productAuction, selector.vendor.vAuction.addAuctionProduct, 302);

		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage.replace(/\s+/g, ' ').trim()).toMatch(product.saveSuccessMessage);
	}

	// vendor add booking product
	async addBookingProduct(product: { productName: any; productType?: string; category?: string; bookingDurationType: any; bookingDuration?: string; bookingDurationMax: any; bookingDurationUnit: any; calendarDisplayMode: any; maxBookingsPerBlock: any; minimumBookingWindowIntoTheFutureDate: any; minimumBookingWindowIntoTheFutureDateUnit: any; maximumBookingWindowIntoTheFutureDate: any; maximumBookingWindowIntoTheFutureDateUnit: any; baseCost: any; blockCost: any; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.booking);

		const productName = product.productName();

		await this.click(selector.vendor.vBooking.addNewBookingProduct);
		// add new booking product
		await this.type(selector.vendor.vBooking.productName, productName);
		// await this.addCategory(product.category)
		// general booking options
		await this.selectByValue(selector.vendor.vBooking.bookingDurationType, product.bookingDurationType);
		await this.clearAndFill(selector.vendor.vBooking.bookingDurationMax, product.bookingDurationMax);
		await this.selectByValue(selector.vendor.vBooking.bookingDurationUnit, product.bookingDurationUnit);
		// calendar display mode
		await this.selectByValue(selector.vendor.vBooking.calenderDisplayMode, product.calendarDisplayMode);
		await this.check(selector.vendor.vBooking.enableCalendarRangePicker);
		// availability
		await this.clearAndFill(selector.vendor.vBooking.maxBookingsPerBlock, product.maxBookingsPerBlock);
		await this.clearAndFill(selector.vendor.vBooking.minimumBookingWindowIntoTheFutureDate, product.minimumBookingWindowIntoTheFutureDate);
		await this.selectByValue(selector.vendor.vBooking.minimumBookingWindowIntoTheFutureDateUnit, product.minimumBookingWindowIntoTheFutureDateUnit);
		await this.clearAndFill(selector.vendor.vBooking.maximumBookingWindowIntoTheFutureDate, product.maximumBookingWindowIntoTheFutureDate);
		await this.selectByValue(selector.vendor.vBooking.maximumBookingWindowIntoTheFutureDateUnit, product.maximumBookingWindowIntoTheFutureDateUnit);
		// costs
		await this.type(selector.vendor.vBooking.baseCost, product.baseCost);
		await this.type(selector.vendor.vBooking.blockCost, product.blockCost);

		await this.clickAndWaitForResponse(data.subUrls.frontend.productBooking, selector.vendor.vBooking.saveProduct, 302);

		await this.waitForSelector(selector.vendor.vBooking.productName);
		const createdProduct = await this.getElementValue(selector.vendor.vBooking.productName);
		expect(createdProduct.toLowerCase()).toBe(productName.toLowerCase());
	}

	// vendor search similar product
	async searchSimilarProduct(productName: string): Promise<void> {
		await this.click(selector.vendor.vSearchSimilarProduct.search);
		await this.type(selector.vendor.vSearchSimilarProduct.search, productName);
		await this.click(selector.vendor.vSearchSimilarProduct.search);
		await this.click(selector.vendor.vSearchSimilarProduct.search);
		//TODO: add assertion
	}

	// coupons

	// vendor add coupon
	async addCoupon(coupon: any): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.coupon);
		await this.click(selector.vendor.vCoupon.addNewCoupon);
		await this.type(selector.vendor.vCoupon.couponTitle, coupon.title());
		await this.type(selector.vendor.vCoupon.amount, coupon.amount());
		await this.click(selector.vendor.vCoupon.selectAll);
		await this.click(selector.vendor.vCoupon.applyForNewProducts);
		await this.click(selector.vendor.vCoupon.showOnStore);
		await this.clickAndWaitForResponse(data.subUrls.frontend.coupon, selector.vendor.vCoupon.createCoupon, 302);
		await expect(this.page.getByText(selector.vendor.vCoupon.couponSaveSuccessMessage)).toBeVisible();
	}

	// withdraw

	// vendor request withdraw
	async requestWithdraw(withdraw: { withdrawMethod: any; defaultWithdrawMethod?: { paypal: string; skrill: string; }; preferredPaymentMethod?: string; preferredSchedule?: string; minimumWithdrawAmount?: string; reservedBalance?: string; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.withdraw);

		const canRequestIsVisible = await this.isVisible(selector.vendor.vWithdraw.cancelRequest);
		if (canRequestIsVisible) {
			this.cancelRequestWithdraw()
			await this.clickAndWaitForNavigation(selector.vendor.vWithdraw.withdrawDashboard);
		}

		const minimumWithdrawAmount: number = helpers.price(await this.getElementText(selector.vendor.vWithdraw.minimumWithdrawAmount));
		const balance: number = helpers.price(await this.getElementText(selector.vendor.vWithdraw.balance));

		if (balance > minimumWithdrawAmount) {
			await this.click(selector.vendor.vWithdraw.requestWithdraw);
			await this.clearAndFill(selector.vendor.vWithdraw.withdrawAmount, String(minimumWithdrawAmount));
			await this.selectByValue(selector.vendor.vWithdraw.withdrawMethod, withdraw.withdrawMethod.default);
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vWithdraw.submitRequest);
			await expect(this.page.getByText(selector.vendor.vWithdraw.withdrawRequestSaveSuccessMessage)).toBeVisible();
		} else {
			// throw new Error("Vendor balance is less than minimum withdraw amount")
			console.log('Vendor balance is less than minimum withdraw amount');
		}
	}

	// vendor cancel withdraw request
	async cancelRequestWithdraw(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.withdraw);
		await this.clickAndWaitForResponse(data.subUrls.frontend.withdrawRequests, selector.vendor.vWithdraw.cancelRequest, 302);
		await expect(this.page.getByText(selector.vendor.vWithdraw.cancelWithdrawRequestSaveSuccessMessage)).toBeVisible();
	}

	// vendor add auto withdraw disbursement schedule
	async addAutoWithdrawDisbursementSchedule(withdraw: { withdrawMethod?: { default: string; paypal: string; skrill: string; }; defaultWithdrawMethod?: { paypal: string; skrill: string; }; preferredPaymentMethod: any; preferredSchedule: any; minimumWithdrawAmount: any; reservedBalance: any; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.withdraw);
		await this.enableSwitcher(selector.vendor.vWithdraw.enableSchedule);
		await this.click(selector.vendor.vWithdraw.editSchedule);
		await this.selectByValue(selector.vendor.vWithdraw.preferredPaymentMethod, withdraw.preferredPaymentMethod);
		await this.click(selector.vendor.vWithdraw[withdraw.preferredSchedule]);
		await this.selectByValue(selector.vendor.vWithdraw.onlyWhenBalanceIs, withdraw.minimumWithdrawAmount);
		await this.selectByValue(selector.vendor.vWithdraw.maintainAReserveBalance, withdraw.reservedBalance);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vWithdraw.changeSchedule);
		await expect(this.page.getByText(selector.vendor.vWithdraw.withdrawScheduleSaveSuccessMessage)).toBeVisible();
	}

	// vendor add default withdraw payment methods
	async addDefaultWithdrawPaymentMethods(preferredSchedule: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.withdraw);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vWithdraw.customMethodMakeDefault(preferredSchedule));
		await expect(this.page.getByText(selector.vendor.vWithdraw.defaultPaymentMethodUpdateSuccessMessage)).toBeVisible();
	}

	// vendor add vendor details
	async setVendorDetails(vendorInfo: { firstName: () => string; lastName: () => string; email: () => string; password: string; password1: string; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.editAccount);
		await this.clearAndFill(selector.vendor.vAccountDetails.firstName, vendorInfo.firstName());
		await this.clearAndFill(selector.vendor.vAccountDetails.lastName, vendorInfo.lastName());
		await this.clearAndFill(selector.vendor.vAccountDetails.email, vendorInfo.email());
		// await this.type(selector.vendor.vAccountDetails.currentPassword, vendorInfo.password);
		// await this.type(selector.vendor.vAccountDetails.NewPassword, vendorInfo.password1);
		// await this.type(selector.vendor.vAccountDetails.confirmNewPassword, vendorInfo.password1);
		await this.clickAndWaitForResponse(data.subUrls.frontend.editAccount, selector.vendor.vAccountDetails.saveChanges, 302);
		await expect(this.page.getByText(selector.vendor.vAccountDetails.editAccountSaveChangesSuccessMessage)).toBeVisible();
	}

	// vendor settings

	// vendor set store settings
	async setStoreSettings(vendorInfo: { email?: () => string; emailDomain?: string; password?: string; password1?: string; firstName?: () => string; lastName?: () => string; userName?: string; shopName?: string; shopUrl?: string; companyName?: string; companyId?: string; vatNumber?: string; bankName?: string; bankIban?: string; phoneNumber?: string; street1?: string; street2?: string; country?: string; countrySelectValue?: string; stateSelectValue?: string; city?: string; zipCode?: string; state?: string; accountName?: string; accountNumber?: string; bankAddress?: string; routingNumber?: string; swiftCode?: string; iban?: string; banner?: string; profilePicture?: string; storeName?: string; productsPerPage?: string; mapLocation: any; termsAndConditions: any; biography: any; supportButtonText: any; openingClosingTime: any; vacation: any; discount: any; minMax: any; storeSettingsSaveSuccessMessage: any; }): Promise<void> {
		// await this.goToVendorDashboard()
		// await this.click(selector.vendor.vDashboard.settings)

		await this.goIfNotThere(data.subUrls.frontend.settingsStore);

		await this.basicInfoSettings(vendorInfo);
		// await this.mapSettings(vendorInfo.mapLocation)
		await this.termsAndConditionsSettings(vendorInfo.termsAndConditions);
		// await this.openingClosingTimeSettings(vendorInfo.openingClosingTime) //TODO: update according to new ui
		await this.vacationSettings(vendorInfo.vacation);
		await this.discountSettings(vendorInfo.discount);
		await this.biographySettings(vendorInfo.biography);
		await this.storeSupportSettings(vendorInfo.supportButtonText);
		await this.minMaxSettings(vendorInfo.minMax);
		// update settings
		await this.click(selector.vendor.vStoreSettings.updateSettings);

		// const successMessage = await this.getElementText( selector.vendor.vSocialProfileSettings.updateSettingsSuccessMessage );
		// expect( successMessage ).toMatch( vendorInfo.storeSettingsSaveSuccessMessage );
		await expect(this.page.locator(selector.vendor.vSocialProfileSettings.updateSettingsSuccessMessage)).toContainText(vendorInfo.storeSettingsSaveSuccessMessage)

	}

	// vendor set store address
	async setStoreAddress(vendorInfo: { street1: string; street2: string; city: string; zipCode: string; countrySelectValue: string; stateSelectValue: string; storeSettingsSaveSuccessMessage: string | RegExp; }): Promise<void> {
		// await this.goToVendorDashboard()
		// await this.click(selector.vendor.vDashboard.settings)

		await this.goIfNotThere(data.subUrls.frontend.settingsStore);

		// store address
		await this.clearAndFill(selector.vendor.vStoreSettings.street, vendorInfo.street1);
		await this.clearAndFill(selector.vendor.vStoreSettings.street2, vendorInfo.street2);
		await this.clearAndFill(selector.vendor.vStoreSettings.city, vendorInfo.city);
		await this.clearAndFill(selector.vendor.vStoreSettings.postOrZipCode, vendorInfo.zipCode);
		await this.selectByValue(selector.vendor.vStoreSettings.country, vendorInfo.countrySelectValue);
		await this.selectByValue(selector.vendor.vStoreSettings.state, vendorInfo.stateSelectValue);
		// update settings
		await this.click(selector.vendor.vStoreSettings.updateSettings);

		// const successMessage = await this.getElementText(selector.vendor.vSocialProfileSettings.updateSettingsSuccessMessage);
		// expect(successMessage).toMatch(vendorInfo.storeSettingsSaveSuccessMessage);
		await expect(this.page.locator(selector.vendor.vSocialProfileSettings.updateSettingsSuccessMessage)).toContainText(vendorInfo.storeSettingsSaveSuccessMessage)
	}

	//
	// // vendor set banner and profile picture settings
	// async bannerAndProfilePictureSettings(banner, profilePicture): Promise<void> {
	//     // upload banner and profile picture
	//     await this.removePreviousUploadedImage(selector.vendor.vStoreSettings.bannerImage, selector.vendor.vStoreSettings.removeBannerImage)
	//     await this.click(selector.vendor.vStoreSettings.banner)
	//     await this.wpUploadFile(banner)
	//     await this.removePreviousUploadedImage(selector.vendor.vStoreSettings.profilePictureImage, selector.vendor.vStoreSettings.removeProfilePictureImage)
	//     await this.click(selector.vendor.vStoreSettings.profilePicture)
	//     await this.wpUploadFile(profilePicture)
	// }

	// vendor set basic info settings
	async basicInfoSettings(vendorInfo: { email?: () => string; emailDomain?: string; password?: string; password1?: string; firstName?: () => string; lastName?: () => string; userName?: string; shopName?: string; shopUrl?: string; companyName?: string; companyId?: string; vatNumber?: string; bankName?: string; bankIban?: string; phoneNumber?: string; street1?: string; street2?: string; country?: string; countrySelectValue?: string; stateSelectValue?: string; city?: string; zipCode?: string; state?: string; accountName?: string; accountNumber?: string; bankAddress?: string; routingNumber?: string; swiftCode?: string; iban?: string; banner?: string; profilePicture?: string; storeName?: string; productsPerPage?: string; mapLocation: any; termsAndConditions: any; biography: any; supportButtonText: any; openingClosingTime: any; vacation: any; discount: any; minMax: any; storeSettingsSaveSuccessMessage: any }): Promise<void> {
		// store basic info
		await this.clearAndFill(selector.vendor.vStoreSettings.storeName, vendorInfo.storeName);
		await this.clearAndFill(selector.vendor.vStoreSettings.storeProductsPerPage, vendorInfo.productsPerPage);
		await this.clearAndFill(selector.vendor.vStoreSettings.phoneNo, vendorInfo.phoneNumber);
		// address
		await this.clearAndFill(selector.vendor.vStoreSettings.street, vendorInfo.street1);
		await this.clearAndFill(selector.vendor.vStoreSettings.street2, vendorInfo.street2);
		await this.clearAndFill(selector.vendor.vStoreSettings.city, vendorInfo.city);
		await this.clearAndFill(selector.vendor.vStoreSettings.postOrZipCode, vendorInfo.zipCode);
		await this.selectByValue(selector.vendor.vStoreSettings.country, vendorInfo.countrySelectValue);
		await this.selectByValue(selector.vendor.vStoreSettings.state, vendorInfo.stateSelectValue);
		// company info //TODO: uncomment after ui fix
		await this.clearAndFill(selector.vendor.vStoreSettings.companyName, vendorInfo.companyName);
		await this.clearAndFill(selector.vendor.vStoreSettings.companyId, vendorInfo.companyId);
		await this.clearAndFill(selector.vendor.vStoreSettings.vatOrTaxNumber, vendorInfo.vatNumber);
		await this.clearAndFill(selector.vendor.vStoreSettings.nameOfBank, vendorInfo.bankName);
		await this.clearAndFill(selector.vendor.vStoreSettings.bankIban, vendorInfo.bankIban);
		// email
		await this.check(selector.vendor.vStoreSettings.email);
		// show more products
		await this.check(selector.vendor.vStoreSettings.moreProducts);
	}

	// vendor set map settings
	async mapSettings(mapLocation: string): Promise<void> {
		// map
		await this.clearAndFill(selector.vendor.vStoreSettings.map, mapLocation);
		await this.press(data.key.arrowDown);
		await this.press(data.key.enter);
	}

	// vendor set terms and conditions settings
	async termsAndConditionsSettings(termsAndConditions: string): Promise<void> {
		// terms and conditions
		await this.check(selector.vendor.vStoreSettings.termsAndConditions);
		// let termsAndConditionsIframe = await this.switchToIframe(selector.vendor.vStoreSettings.termsAndConditionsIframe)
		// await this.iframeclearAndFill(termsAndConditionsIframe, selector.vendor.vStoreSettings.termsAndConditionsHtmlBody, termsAndConditions)
		await this.typeFrameSelector(selector.vendor.vStoreSettings.termsAndConditionsIframe, selector.vendor.vStoreSettings.termsAndConditionsHtmlBody, termsAndConditions);
	}

	// vendor set opening closing time settings
	async openingClosingTimeSettings(openingClosingTime: { days: any; openingTime: string; closingTime: string; }): Promise<void> {
		// store opening closing time
		await this.check(selector.vendor.vStoreSettings.storeOpeningClosingTime);
		for (const day of openingClosingTime.days) { //TODO: replace for loop
			await this.click(selector.vendor.vStoreSettings.chooseBusinessDays);
			await this.type(selector.vendor.vStoreSettings.chooseBusinessDays, day);
			await this.press(data.key.enter);
			await this.click(selector.vendor.vStoreSettings.businessDaysTab(day));
			// individual day settings
			await this.waitForSelector(selector.vendor.vStoreSettings.openingTime(day));
			await this.clearAndFill(selector.vendor.vStoreSettings.openingTime(day), openingClosingTime.openingTime);
			await this.clearAndFill(selector.vendor.vStoreSettings.closingTime(day), openingClosingTime.closingTime);
		}
	}

	// vendor set vacation settings
	async vacationSettings(vacation: { closingStyle: string; vacationDayFrom: string; vacationDayTo: string; vacationMessage: string; }): Promise<void> {
		// vacation
		const noVacationIsSetIsVisible = await this.isVisible(selector.vendor.vStoreSettings.noVacationIsSet);
		if (!noVacationIsSetIsVisible) {
			await this.hover(selector.vendor.vStoreSettings.vacationRow);
			await this.click(selector.vendor.vStoreSettings.deleteSavedVacationSchedule);
			await this.click(selector.vendor.vStoreSettings.confirmDeleteSavedVacationSchedule);
		}
		await this.check(selector.vendor.vStoreSettings.goToVacation);
		await this.selectByValue(selector.vendor.vStoreSettings.closingStyle, vacation.closingStyle);
		await this.type(selector.vendor.vStoreSettings.vacationDateRangeFrom, vacation.vacationDayFrom);
		await this.type(selector.vendor.vStoreSettings.vacationDateRangeTo, vacation.vacationDayTo);
		await this.type(selector.vendor.vStoreSettings.setVacationMessage, vacation.vacationMessage);
		await this.click(selector.vendor.vStoreSettings.saveVacationEdit);
	}

	// vendor set discount settings
	async discountSettings(discount: { minimumOrderAmount: string; minimumOrderAmountPercentage: string; }): Promise<void> {
		// discount
		await this.check(selector.vendor.vStoreSettings.enableStoreWideDiscount);
		await this.clearAndFill(selector.vendor.vStoreSettings.minimumOrderAmount, discount.minimumOrderAmount);
		await this.clearAndFill(selector.vendor.vStoreSettings.percentage, discount.minimumOrderAmountPercentage);
	}

	// vendor set biography settings
	async biographySettings(biography: string): Promise<void> {
		// biography
		// let biographyIframe = await this.switchToIframe(selector.vendor.vStoreSettings.biographyIframe)
		// await this.iframeclearAndFill(biographyIframe, selector.vendor.vStoreSettings.biographyHtmlBody, biography)
		await this.typeFrameSelector(selector.vendor.vStoreSettings.biographyIframe, selector.vendor.vStoreSettings.biographyHtmlBody, biography);
	}

	// vendor set store support settings
	async storeSupportSettings(supportButtonText: string): Promise<void> {
		// store support
		await this.check(selector.vendor.vStoreSettings.showSupportButtonInStore);
		await this.check(selector.vendor.vStoreSettings.showSupportButtonInSingleProduct);
		await this.clearAndFill(selector.vendor.vStoreSettings.supportButtonText, supportButtonText);
	}

	// vendor set minmax settings
	async minMaxSettings(minMax: { minimumProductQuantity: string; maximumProductQuantity: string; minimumAmount: string; maximumAmount: string; category: string; }): Promise<void> {
		// min-max
		await this.check(selector.vendor.vStoreSettings.enableMinMaxQuantities);
		await this.clearAndFill(selector.vendor.vStoreSettings.minimumProductQuantityToPlaceAnOrder, minMax.minimumProductQuantity);
		await this.clearAndFill(selector.vendor.vStoreSettings.maximumProductQuantityToPlaceAnOrder, minMax.maximumProductQuantity);
		await this.check(selector.vendor.vStoreSettings.enableMinMaxAmount);
		await this.clearAndFill(selector.vendor.vStoreSettings.minimumAmountToPlaceAnOrder, minMax.minimumAmount);
		await this.clearAndFill(selector.vendor.vStoreSettings.maximumAmountToPlaceAnOrder, minMax.maximumAmount);
		await this.click(selector.vendor.vStoreSettings.clear);
		await this.click(selector.vendor.vStoreSettings.selectAll);
		// await this.selectOptionByText(selector.vendor.vStoreSettings.selectCategory, minMax.category)
		await this.selectByValue(selector.vendor.vStoreSettings.selectCategory, minMax.category);
	}

	// vendor add addons
	async addAddon(addon: { name: any; priority: any; category: any; type: any; displayAs: any; titleRequired: any; formatTitle: any; addDescription: any; enterAnOption: any; optionPriceType: any; optionPriceInput: any; saveSuccessMessage: any; }): Promise<string> {
		await this.goIfNotThere(data.subUrls.frontend.settingsAddon);

		// add addon
		const addonName = addon.name();
		await this.click(selector.vendor.vAddonSettings.createNewAddon);
		await this.clearAndFill(selector.vendor.vAddonSettings.name, addonName);
		await this.clearAndFill(selector.vendor.vAddonSettings.priority, addon.priority);
		await this.click(selector.vendor.vAddonSettings.productCategories,);
		await this.type(selector.vendor.vAddonSettings.productCategories, addon.category);
		await this.press(data.key.enter);
		// add-on fields
		await this.click(selector.vendor.vAddonSettings.addField);
		await this.selectByValue(selector.vendor.vAddonSettings.type, addon.type);
		await this.selectByValue(selector.vendor.vAddonSettings.displayAs, addon.displayAs);
		await this.clearAndFill(selector.vendor.vAddonSettings.titleRequired, addon.titleRequired);
		await this.selectByValue(selector.vendor.vAddonSettings.formatTitle, addon.formatTitle);
		await this.click(selector.vendor.vAddonSettings.enableDescription);
		await this.clearAndFill(selector.vendor.vAddonSettings.addDescription, addon.addDescription);
		await this.click(selector.vendor.vAddonSettings.requiredField);
		await this.clearAndFill(selector.vendor.vAddonSettings.enterAnOption, addon.enterAnOption);
		await this.selectByValue(selector.vendor.vAddonSettings.optionPriceType, addon.optionPriceType);
		await this.clearAndFill(selector.vendor.vAddonSettings.optionPriceInput, addon.optionPriceInput);
		await this.click(selector.vendor.vAddonSettings.publish);

		await expect(this.page.locator(selector.vendor.vAddonSettings.addonUpdateSuccessMessage)).toContainText(addon.saveSuccessMessage)
		return addonName;
	}

	// vendor edit addons
	async editAddon(addon: { name: any; priority: any; category: any; type: any; displayAs: any; titleRequired: any; formatTitle: any; addDescription: any; enterAnOption: any; optionPriceType: any; optionPriceInput: any; saveSuccessMessage: any; }, addonName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsAddon);

		// add addon
		await this.click(selector.vendor.vAddonSettings.editAddon(addonName));
		// await this.click(selector.vendor.vAddonSettings.firstAddon)
		await this.clearAndFill(selector.vendor.vAddonSettings.name, addon.name());
		await this.clearAndFill(selector.vendor.vAddonSettings.priority, addon.priority);
		await this.click(selector.vendor.vAddonSettings.productCategories,);
		await this.type(selector.vendor.vAddonSettings.productCategories, addon.category);
		await this.press(data.key.enter);
		// add-on fields
		await this.click(selector.vendor.vAddonSettings.addedFirstField);
		await this.selectByValue(selector.vendor.vAddonSettings.type, addon.type);
		await this.selectByValue(selector.vendor.vAddonSettings.displayAs, addon.displayAs);
		await this.clearAndFill(selector.vendor.vAddonSettings.titleRequired, addon.titleRequired);
		await this.selectByValue(selector.vendor.vAddonSettings.formatTitle, addon.formatTitle);
		await this.clearAndFill(selector.vendor.vAddonSettings.addDescription, addon.addDescription);
		await this.click(selector.vendor.vAddonSettings.requiredField);
		await this.clearAndFill(selector.vendor.vAddonSettings.enterAnOption, addon.enterAnOption);
		await this.selectByValue(selector.vendor.vAddonSettings.optionPriceType, addon.optionPriceType);
		await this.clearAndFill(selector.vendor.vAddonSettings.optionPriceInput, addon.optionPriceInput);
		await this.click(selector.vendor.vAddonSettings.update);

		await expect(this.page.locator(selector.vendor.vAddonSettings.addonUpdateSuccessMessage)).toContainText(addon.saveSuccessMessage)
	}

	// paypal payment settings
	async setPaypal(paymentMethod: { email: () => string; saveSuccessMessage: string | RegExp; }): Promise<void> {
		// paypal
		await this.clearAndFill(selector.vendor.vPaymentSettings.paypal, paymentMethod.email());
		// update settings
		await this.click(selector.vendor.vPaymentSettings.updateSettings);

		// const successMessage = await this.getElementText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage);
		// expect(successMessage).toMatch(paymentMethod.saveSuccessMessage);
		await expect(this.page.locator(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage)).toContainText(paymentMethod.saveSuccessMessage)
	}

	// bank transfer payment settings
	async setBankTransfer(paymentMethod: { bankAccountName: string; bankAccountNumber: string; bankName: string; bankAddress: string; bankRoutingNumber: string; bankIban: string; bankSwiftCode: string; saveSuccessMessage: string | RegExp; }): Promise<void> {
		// bank transfer
		await this.clearAndFill(selector.vendor.vPaymentSettings.bankAccountName, paymentMethod.bankAccountName);
		await this.clearAndFill(selector.vendor.vPaymentSettings.bankAccountNumber, paymentMethod.bankAccountNumber);
		await this.clearAndFill(selector.vendor.vPaymentSettings.bankName, paymentMethod.bankName);
		await this.clearAndFill(selector.vendor.vPaymentSettings.bankAddress, paymentMethod.bankAddress);
		await this.clearAndFill(selector.vendor.vPaymentSettings.bankRoutingNumber, paymentMethod.bankRoutingNumber);
		await this.clearAndFill(selector.vendor.vPaymentSettings.bankIban, paymentMethod.bankIban);
		await this.clearAndFill(selector.vendor.vPaymentSettings.bankSwiftCode, paymentMethod.bankSwiftCode);
		// update settings
		await this.click(selector.vendor.vPaymentSettings.updateSettings);

		// const successMessage = await this.getElementText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage);
		// expect(successMessage).toMatch(paymentMethod.saveSuccessMessage);
		await expect(this.page.locator(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage)).toContainText(paymentMethod.saveSuccessMessage)
	}

	// // stripe payment settings
	// async setStripe(email): Promise<void> {
	//     // Stripe
	//     await this.click(selector.vendor.vPaymentSettings.ConnectWithStripe)
	// }
	//
	// // paypal marketPlace payment settings
	// async setPaypalMarketPlace(email): Promise<void> {
	//     // paypal Marketplace
	//     await this.clearAndFill(selector.vendor.vPaymentSettings.paypalMarketplace, paypalMarketplace)
	//     await this.click(selector.vendor.vPaymentSettings.paypalMarketplaceSignUp)
	// }

	// // razorpay payment settings
	// async setRazorpay(razorpay): Promise<void> {
	//     // razorpay
	//     await this.click(selector.vendor.vPaymentSettings.rzSignup)
	//     // existing account info
	//     await this.click(selector.vendor.vPaymentSettings.rzIHaveAlreadyAnAccount)
	//     await this.clearAndFill(selector.vendor.vPaymentSettings.rzAccountId, rzAccountId)
	//     await this.click(selector.vendor.vPaymentSettings.rzConnectExistingAccount)
	//     //new account info
	//     await this.clearAndFill(selector.vendor.vPaymentSettings.rzAccountName, rzAccountName)
	//     await this.clearAndFill(selector.vendor.vPaymentSettings.rzAccountEmail, rzAccountEmail)
	//     await this.clearAndFill(selector.vendor.vPaymentSettings.rzYourCompanyName, rzYourCompanyName)
	//     await this.clearAndFill(selector.vendor.vPaymentSettings.rzYourCompanyType, rzYourCompanyType)
	//     await this.clearAndFill(selector.vendor.vPaymentSettings.rzBankAccountName, rzBankAccountName)
	//     await this.clearAndFill(selector.vendor.vPaymentSettings.rzBankAccountNumber, rzBankAccountNumber)
	//     await this.clearAndFill(selector.vendor.vPaymentSettings.rzBankIfscCode, rzBankIfscCode)
	//     await this.clearAndFill(selector.vendor.vPaymentSettings.rzBankAccountType, rzBankAccountType)
	//     await this.click(selector.vendor.vPaymentSettings.rzConnectAccount)
	// }

	// custom payment settings
	async setCustom(paymentMethod: { email: () => string; saveSuccessMessage: string | RegExp; }): Promise<void> {
		// custom payment method
		await this.clearAndFill(selector.vendor.vPaymentSettings.customPayment, paymentMethod.email());
		// update settings
		await this.click(selector.vendor.vPaymentSettings.updateSettings);

		// const successMessage = await this.getElementText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage);
		// expect(successMessage).toMatch(paymentMethod.saveSuccessMessage);
		await expect(this.page.locator(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage)).toContainText(paymentMethod.saveSuccessMessage)
	}

	// skrill Payment Settings
	async setSkrill(paymentMethod: { email: () => string; saveSuccessMessage: string | RegExp; }): Promise<void> {
		// skrill
		await this.clearAndFill(selector.vendor.vPaymentSettings.skrill, paymentMethod.email());
		// update settings
		await this.click(selector.vendor.vPaymentSettings.updateSettings);

		// const successMessage = await this.getElementText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage);
		// expect(successMessage).toMatch(paymentMethod.saveSuccessMessage);
		await expect(this.page.locator(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage)).toContainText(paymentMethod.saveSuccessMessage)
	}
	//
	// // vendor set payment settings
	// async setPaymentSettings(): Promise<void> {
	//     await this.click(selector.vendor.vDashboard.settings)
	//     await this.click(selector.vendor.vSettings.payment)
	//
	//     await this.setPaypal()
	//     await this.setBankTransfer()
	//     await this.setStripe()
	//     await this.setPaypalMarketPlace()
	//     await this.setRazorpay()
	//     await this.setCustom()
	//     await this.setSkrill()
	// }

	// vendor send id verification request
	async sendIdVerificationRequest(verification: { file: any; file2?: string; street1?: string; street2?: string; city?: string; zipCode?: string; country?: string; state?: string; idRequestSubmitSuccessMessage: any; addressRequestSubmitSuccessMessage?: string; companyRequestSubmitSuccessMessage?: string; }): Promise<void> {
		await this.goToVendorDashboard();

		await this.click(selector.vendor.vDashboard.settings);
		await this.click(selector.vendor.vSettings.verification);

		// id verification
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.cancelIdVerificationRequest);
		if (cancelRequestIsVisible) {
			await this.click(selector.vendor.vVerificationSettings.cancelIdVerificationRequest);
		}
		await this.click(selector.vendor.vVerificationSettings.startIdVerification);

		// remove previously uploaded image
		const previousUploadedImageIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.previousUploadedPhoto);
		if (previousUploadedImageIsVisible) {
			await this.hover(selector.vendor.vVerificationSettings.previousUploadedPhoto);
			await this.click(selector.vendor.vVerificationSettings.removePreviousUploadedPhoto);
		}
		// await this.waitForSelector(selector.vendor.vVerificationSettings.uploadPhoto)
		await this.click(selector.vendor.vVerificationSettings.uploadPhoto);
		await this.uploadMedia(verification.file);
		await this.click(selector.vendor.vVerificationSettings.select);
		await this.click(selector.vendor.vVerificationSettings.submitId);

		// const successMessage = await this.getElementText(selector.vendor.vVerificationSettings.idUpdateSuccessMessage);
		// expect(successMessage).toMatch(verification.idRequestSubmitSuccessMessage);
		await expect(this.page.locator(selector.vendor.vVerificationSettings.idUpdateSuccessMessage)).toContainText(verification.idRequestSubmitSuccessMessage)
	}

	// vendor send address verification request
	async sendAddressVerificationRequest(verification: { file: any; file2?: string; street1: any; street2: any; city: any; zipCode: any; country: any; state: any; idRequestSubmitSuccessMessage?: string; addressRequestSubmitSuccessMessage: any; companyRequestSubmitSuccessMessage?: string; }): Promise<void> {
		await this.goToVendorDashboard();

		await this.click(selector.vendor.vDashboard.settings);
		await this.click(selector.vendor.vSettings.verification);

		// address verification
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.cancelAddressVerificationRequest);
		if (cancelRequestIsVisible) {
			await this.click(selector.vendor.vVerificationSettings.cancelAddressVerificationRequest);
		}
		await this.click(selector.vendor.vVerificationSettings.startAddressVerification);

		await this.clearAndFill(selector.vendor.vVerificationSettings.street, verification.street1);
		await this.clearAndFill(selector.vendor.vVerificationSettings.street2, verification.street2);
		await this.clearAndFill(selector.vendor.vVerificationSettings.city, verification.city);
		await this.clearAndFill(selector.vendor.vVerificationSettings.postOrZipCode, verification.zipCode);
		await this.selectByValue(selector.vendor.vVerificationSettings.country, verification.country);
		await this.selectByValue(selector.vendor.vVerificationSettings.state, verification.state);
		await this.click(selector.vendor.vVerificationSettings.uploadResidenceProof);
		await this.uploadMedia(verification.file);
		await this.click(selector.vendor.vVerificationSettings.select);
		await this.click(selector.vendor.vVerificationSettings.submitAddress);

		// const successMessage = await this.getElementText(selector.vendor.vVerificationSettings.addressUpdateSuccessMessage);
		// expect(successMessage).toMatch(verification.addressRequestSubmitSuccessMessage);
		await expect(this.page.locator(selector.vendor.vVerificationSettings.addressUpdateSuccessMessage)).toContainText(verification.addressRequestSubmitSuccessMessage);
	}

	// vendor send company verification request
	async sendCompanyVerificationRequest(verification: { file: any; file2?: string; street1?: string; street2?: string; city?: string; zipCode?: string; country?: string; state?: string; idRequestSubmitSuccessMessage?: string; addressRequestSubmitSuccessMessage?: string; companyRequestSubmitSuccessMessage: any; }): Promise<void> {
		await this.goToVendorDashboard();

		await this.click(selector.vendor.vDashboard.settings);
		await this.click(selector.vendor.vSettings.verification);
		// company verification
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.cancelCompanyVerificationRequest);
		if (cancelRequestIsVisible) {
			await this.click(selector.vendor.vVerificationSettings.cancelCompanyVerificationRequest);
		}
		await this.click(selector.vendor.vVerificationSettings.startCompanyVerification);
		// remove previously uploaded company file
		const UploadedCompanyFileIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.UploadedCompanyFileClose);
		if (UploadedCompanyFileIsVisible) {
			await this.click(selector.vendor.vVerificationSettings.UploadedCompanyFileClose);
		}
		await this.click(selector.vendor.vVerificationSettings.uploadFiles);
		await this.uploadMedia(verification.file);
		await this.click(selector.vendor.vVerificationSettings.select);
		await this.click(selector.vendor.vVerificationSettings.submitCompanyInfo);

		// const successMessage = await this.getElementText(selector.vendor.vVerificationSettings.companyInfoUpdateSuccessMessage);
		// expect(successMessage).toMatch(verification.companyRequestSubmitSuccessMessage);
		await expect(this.page.locator(selector.vendor.vVerificationSettings.companyInfoUpdateSuccessMessage)).toContainText(verification.companyRequestSubmitSuccessMessage);
	}

	// upload media
	async uploadMedia(file: any) {
		const uploadedMediaIsVisible = await this.isVisible(selector.wpMedia.uploadedMedia);
		if (uploadedMediaIsVisible) {
			await this.click(selector.wpMedia.uploadedMedia);
		} else {
			await this.uploadFile(selector.wpMedia.selectFiles, file);
		}
	}

	// vendor set verification settings
	async setVerificationSettings(verification: { file: any; file2: string; street1: any; street2: any; city: any; zipCode: any; country: any; state: any; idRequestSubmitSuccessMessage: any; addressRequestSubmitSuccessMessage: any; companyRequestSubmitSuccessMessage: any; }): Promise<void> {
		await this.sendIdVerificationRequest(verification);
		await this.sendAddressVerificationRequest(verification);
		await this.sendCompanyVerificationRequest(verification);
	}

	// vendor set delivery settings
	async setDeliveryTimeSettings(deliveryTime: { deliveryBlockedBuffer: any; days: any; openingTime: any; closingTime: any; timeSlot: any; orderPerSlot: any; saveSuccessMessage: any; }): Promise<void> {
		await this.goToVendorDashboard();

		await this.click(selector.vendor.vDashboard.settings);
		await this.click(selector.vendor.vSettings.deliveryTime);
		// delivery support
		await this.check(selector.vendor.vDeliveryTimeSettings.homeDelivery);
		await this.check(selector.vendor.vDeliveryTimeSettings.storePickup);
		await this.clearAndFill(selector.vendor.vDeliveryTimeSettings.deliveryBlockedBuffer, deliveryTime.deliveryBlockedBuffer);
		for (const day of deliveryTime.days) {
			// checkbox
			await this.check(selector.vendor.vDeliveryTimeSettings.deliveryDayCheckbox(day));
			// tab
			await this.click(selector.vendor.vDeliveryTimeSettings.deliveryDayTab(day));
			// individual day settings
			await this.selectByValue(selector.vendor.vDeliveryTimeSettings.openingTime(day), deliveryTime.openingTime);
			await this.selectByValue(selector.vendor.vDeliveryTimeSettings.closingTime(day), deliveryTime.closingTime);

			await this.clearAndFill(selector.vendor.vDeliveryTimeSettings.timeSlot(day), deliveryTime.timeSlot);
			await this.clearAndFill(selector.vendor.vDeliveryTimeSettings.orderPerSlot(day), deliveryTime.orderPerSlot);
		}
		await this.click(selector.vendor.vDeliveryTimeSettings.deliveryTimeUpdateSettings);

		// const successMessage = await this.getElementText(selector.vendor.vDeliveryTimeSettings.deliveryTimeUpdateSettingsSuccessMessage);
		// expect(successMessage).toMatch(deliveryTime.saveSuccessMessage);
		await expect(this.page.locator(selector.vendor.vDeliveryTimeSettings.deliveryTimeUpdateSettingsSuccessMessage)).toContainText(deliveryTime.saveSuccessMessage);

	}

	// vendor shipping settings

	// vendor set all shipping settings
	async setALLShippingSettings(): Promise<void> {
		await this.goToVendorDashboard();
		await this.setShippingSettings(data.vendor.shipping.shippingMethods.flatRate);
		await this.setShippingSettings(data.vendor.shipping.shippingMethods.freeShipping);
		await this.setShippingSettings(data.vendor.shipping.shippingMethods.localPickup);
		await this.setShippingSettings(data.vendor.shipping.shippingMethods.tableRateShipping);
		await this.setShippingSettings(data.vendor.shipping.shippingMethods.distanceRateShipping);
	}

	// set shipping policies
	async setShippingPolicies(shippingPolicy: { processingTime: any; shippingPolicy: any; refundPolicy: any; saveSuccessMessage: any; }): Promise<void> {
		await this.goToVendorDashboard();

		await this.click(selector.vendor.vDashboard.settings);
		await this.click(selector.vendor.vSettings.shipping);
		await this.click(selector.vendor.vShippingSettings.shippingPolicies.clickHereToAddShippingPolicies);
		await this.selectByValue(selector.vendor.vShippingSettings.shippingPolicies.processingTime, shippingPolicy.processingTime);
		await this.clearAndFill(selector.vendor.vShippingSettings.shippingPolicies.shippingPolicy, shippingPolicy.shippingPolicy);
		await this.type(selector.vendor.vShippingSettings.shippingPolicies.refundPolicy, shippingPolicy.refundPolicy);
		await this.click(selector.vendor.vShippingSettings.shippingPolicies.shippingPoliciesSaveSettings);

		// const successMessage = await this.getElementText(selector.vendor.vShippingSettings.updateSettingsSuccessMessage);
		// expect(successMessage).toMatch(shippingPolicy.saveSuccessMessage);
		await expect(this.page.locator(selector.vendor.vShippingSettings.updateSettingsSuccessMessage)).toContainText(shippingPolicy.saveSuccessMessage);
	}

	// vendor set shipping settings
	async setShippingSettings(shipping: { shippingZone: any; shippingCountry?: string; selectShippingMethod: any; shippingMethod: any; taxStatus?: any; shippingCost?: any; description?: any; calculationType?: any; saveSuccessMessage: any; freeShippingRequires?: string; freeShippingMinimumOrderAmount?: any; taxIncludedInShippingCosts?: any; handlingFee?: any; maximumShippingCost?: any; handlingFeePerOrder?: any; minimumCostPerOrder?: any; maximumCostPerOrder?: any; transportationMode?: any; avoid?: any; distanceUnit?: any; street1?: any; street2?: any; city?: any; zipCode?: any; state?: any; country?: any; }): Promise<void> {
		await this.goToVendorDashboard();

		await this.click(selector.vendor.vDashboard.settings);
		await this.click(selector.vendor.vSettings.shipping);
		// edit shipping zone
		await this.hover(selector.vendor.vShippingSettings.shippingZoneCell(shipping.shippingZone));
		await this.click(selector.vendor.vShippingSettings.editShippingZone(shipping.shippingZone));

		const methodIsVisible = await this.isVisible(selector.vendor.vShippingSettings.shippingMethodCell(shipping.shippingMethod));
		if (!methodIsVisible) {
			await this.click(selector.vendor.vShippingSettings.addShippingMethod);

			await this.selectByValue(selector.vendor.vShippingSettings.shippingMethod, shipping.selectShippingMethod);
			await this.click(selector.vendor.vShippingSettings.shippingMethodPopupAddShippingMethod);
		}
		// edit shipping method
		await this.hover(selector.vendor.vShippingSettings.shippingMethodCell(shipping.shippingMethod));
		await this.click(selector.vendor.vShippingSettings.editShippingMethod(shipping.shippingMethod));

		switch (shipping.selectShippingMethod) {
			case 'flat_rate':
				// flat rate
				await this.clearAndFill(selector.vendor.vShippingSettings.flatRateMethodTitle, shipping.shippingMethod);
				await this.clearAndFill(selector.vendor.vShippingSettings.flatRateCost, shipping.shippingCost);
				await this.selectByValue(selector.vendor.vShippingSettings.flatRateTaxStatus, shipping.taxStatus);
				await this.clearAndFill(selector.vendor.vShippingSettings.flatRateDescription, shipping.description);
				await this.selectByValue(selector.vendor.vShippingSettings.flatRateCalculationType, shipping.calculationType);
				break;

			case 'free_shipping':
				// free shipping
				await this.clearAndFill(selector.vendor.vShippingSettings.freeShippingTitle, shipping.shippingMethod);
				await this.clearAndFill(selector.vendor.vShippingSettings.freeShippingMinimumOrderAmount, shipping.freeShippingMinimumOrderAmount);
				break;

			case 'local_pickup':
				// local pickup
				await this.clearAndFill(selector.vendor.vShippingSettings.localPickupTitle, shipping.shippingMethod);
				await this.clearAndFill(selector.vendor.vShippingSettings.localPickupCost, shipping.shippingCost);
				await this.selectByValue(selector.vendor.vShippingSettings.localPickupTaxStatus, shipping.taxStatus);
				await this.clearAndFill(selector.vendor.vShippingSettings.flatRateDescription, shipping.description);
				break;

			case 'dokan_table_rate_shipping':
				// dokan table rate shipping
				await this.clearAndFill(selector.vendor.vShippingSettings.tableRateShippingMethodTitle, shipping.shippingMethod);
				await this.selectByValue(selector.vendor.vShippingSettings.tableRateShippingTaxStatus, shipping.taxStatus);
				await this.selectByValue(selector.vendor.vShippingSettings.tableRateShippingTaxIncludedInShippingCosts, shipping.taxIncludedInShippingCosts);
				await this.clearAndFill(selector.vendor.vShippingSettings.tableRateShippingHandlingFee, shipping.handlingFee);
				await this.clearAndFill(selector.vendor.vShippingSettings.tableRateShippingMaximumShippingCost, shipping.maximumShippingCost);
				// rates
				// await this.selectByValue(selector.vendor.vShippingSettings.tableRateShippingCalculationType,  shipping.calculationType)
				await this.clearAndFill(selector.vendor.vShippingSettings.tableRateShippingHandlingFeePerOrder, shipping.handlingFeePerOrder);
				await this.clearAndFill(selector.vendor.vShippingSettings.tableRateShippingMinimumCostPerOrder, shipping.minimumCostPerOrder);
				await this.clearAndFill(selector.vendor.vShippingSettings.tableRateShippingMaximumCostPerOrder, shipping.maximumCostPerOrder);

				await this.click(selector.vendor.vShippingSettings.tableRateShippingUpdateSettings);
				// const tableRateSuccessMessage = await this.getElementText(selector.vendor.vShippingSettings.tableRateShippingUpdateSettingsSuccessMessage);
				// expect(tableRateSuccessMessage).toMatch(shipping.saveSuccessMessage);
				await expect(this.page.locator(selector.vendor.vShippingSettings.tableRateShippingUpdateSettingsSuccessMessage)).toContainText(shipping.saveSuccessMessage);
				return;

			case 'dokan_distance_rate_shipping':
				// dokan distance rate shipping
				await this.clearAndFill(selector.vendor.vShippingSettings.distanceRateShippingMethodTitle, shipping.shippingMethod);
				await this.selectByValue(selector.vendor.vShippingSettings.distanceRateShippingTaxStatus, shipping.taxStatus);
				await this.selectByValue(selector.vendor.vShippingSettings.distanceRateShippingTransportationMode, shipping.transportationMode);
				await this.selectByValue(selector.vendor.vShippingSettings.distanceRateShippingAvoid, shipping.avoid);
				await this.selectByValue(selector.vendor.vShippingSettings.distanceRateShippingDistanceUnit, shipping.distanceUnit);
				await this.check(selector.vendor.vShippingSettings.distanceRateShippingShowDistance);
				await this.check(selector.vendor.vShippingSettings.distanceRateShippingShowDuration);
				// shipping address
				await this.clearAndFill(selector.vendor.vShippingSettings.distanceRateShippingAddress1, shipping.street1);
				await this.clearAndFill(selector.vendor.vShippingSettings.distanceRateShippingAddress2, shipping.street2);
				await this.clearAndFill(selector.vendor.vShippingSettings.distanceRateShippingCity, shipping.city);
				await this.clearAndFill(selector.vendor.vShippingSettings.distanceRateShippingZipOrPostalCode, shipping.zipCode);
				await this.clearAndFill(selector.vendor.vShippingSettings.distanceRateShippingStateOrProvince, shipping.state);
				await this.selectByValue(selector.vendor.vShippingSettings.distanceRateShippingCountry, shipping.country);

				await this.click(selector.vendor.vShippingSettings.distanceRateShippingUpdateSettings);
				// const distanceRateSuccessMessage = await this.getElementText(selector.vendor.vShippingSettings.distanceRateShippingUpdateSettingsSuccessMessage);
				// expect(distanceRateSuccessMessage).toMatch(shipping.saveSuccessMessage);
				await expect(this.page.locator(selector.vendor.vShippingSettings.distanceRateShippingUpdateSettingsSuccessMessage)).toContainText(shipping.saveSuccessMessage);
				return;

			default:
				break;
		}
		await this.click(selector.vendor.vShippingSettings.shippingSettingsSaveSettings);
		await this.click(selector.vendor.vShippingSettings.saveChanges);

		// const successMessage = await this.getElementText(selector.vendor.vShippingSettings.updateSettingsSuccessMessage);
		// expect(successMessage).toMatch(shipping.saveSuccessMessage);
		await expect(this.page.locator(selector.vendor.vShippingSettings.updateSettingsSuccessMessage)).toContainText(shipping.saveSuccessMessage);
	}

	// vendor set social profile settings
	async setSocialProfile(urls: { facebook: any; twitter: any; pinterest: any; linkedin: any; youtube: any; instagram: any; flickr: any; saveSuccessMessage?: string; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsSocialProfile);

		await this.clearAndFill(selector.vendor.vSocialProfileSettings.facebook, urls.facebook);
		await this.clearAndFill(selector.vendor.vSocialProfileSettings.twitter, urls.twitter);
		await this.clearAndFill(selector.vendor.vSocialProfileSettings.pinterest, urls.pinterest);
		await this.clearAndFill(selector.vendor.vSocialProfileSettings.linkedin, urls.linkedin);
		await this.clearAndFill(selector.vendor.vSocialProfileSettings.youtube, urls.youtube);
		await this.clearAndFill(selector.vendor.vSocialProfileSettings.instagram, urls.instagram);
		await this.clearAndFill(selector.vendor.vSocialProfileSettings.flicker, urls.flickr);
		// await this.clickJs(selector.vendor.vSocialProfileSettings.updateSettings)
		await this.click(selector.vendor.vSocialProfileSettings.updateSettings); //ToDO: don't work
		// await this.press(data.key.enter)

		// const successMessage = await this.getElementText(selector.vendor.vSocialProfileSettings.updateSettingsSuccessMessage);
		// expect(successMessage).toMatch(data.urls.saveSuccessMessage);
		await expect(this.page.locator(selector.vendor.vSocialProfileSettings.updateSettingsSuccessMessage)).toContainText(data.urls.saveSuccessMessage);
	}

	// vendor set rma settings
	async setRmaSettings(rma: { label: any; type: any; rmaLength: any; lengthValue: any; lengthDuration: any; refundPolicyHtmlBody: any; saveSuccessMessage: any; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsRma);

		await this.clearAndFill(selector.vendor.vRmaSettings.label, rma.label);
		await this.selectByValue(selector.vendor.vRmaSettings.type, rma.type);
		await this.selectByValue(selector.vendor.vRmaSettings.length, rma.rmaLength);
		await this.clearAndFill(selector.vendor.vRmaSettings.lengthValue, rma.lengthValue);
		await this.selectByValue(selector.vendor.vRmaSettings.lengthDuration, rma.lengthDuration);
		await this.checkMultiple(selector.vendor.vRmaSettings.refundReasons); //todo:fix

		await this.typeFrameSelector(selector.vendor.vRmaSettings.refundPolicyIframe, selector.vendor.vRmaSettings.refundPolicyHtmlBody, rma.refundPolicyHtmlBody);
		await this.clickAndWaitForResponse(data.subUrls.frontend.settingsRma, selector.vendor.vRmaSettings.rmaSaveChanges, 382);
		await expect(this.page.getByText(rma.saveSuccessMessage)).toBeVisible();
	}

	// vendor functions

	// vendor approve product review
	async approveProductReview(reviewMessage: any): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.reviews);
		// let approvedReviewIsVisible = await this.isVisible(selector.vendor.vReviews.reviewRow(reviewMessage))
		// if (approvedReviewIsVisible) {
		//     expect(approvedReviewIsVisible).toBe(true)
		// }
		await this.click(selector.vendor.vReviews.pending);
		await this.hover(selector.vendor.vReviews.reviewRow(reviewMessage));
		await this.click(selector.vendor.vReviews.approveReview(reviewMessage));
		await this.click(selector.vendor.vReviews.approved);

		// const reviewIsVisible = await this.isVisible(selector.vendor.vReviews.reviewRow(reviewMessage));
		// expect(reviewIsVisible).toBe(true);
		await expect(this.page.locator(selector.vendor.vReviews.reviewRow(reviewMessage))).toBeVisible();
	}

	// vendor approve return request
	async approveReturnRequest(orderId: any, productName: any): Promise<void> {
		await this.goToVendorDashboard();
		await this.click(selector.vendor.vDashboard.returnRequest);
		await this.click(selector.vendor.vReturnRequest.view(orderId));
		// change order status to refund
		await this.selectByValue(selector.vendor.vReturnRequest.changeOrderStatus, 'processing');
		// await this.alert('accept')
		await this.acceptAlert();
		await this.click(selector.vendor.vReturnRequest.updateOrderStatus);
		// refund request
		await this.click(selector.vendor.vReturnRequest.sendRefund);
		const tax = String(helpers.price(await this.getElementText(selector.vendor.vReturnRequest.taxAmount(productName))));
		const subTotal = String(helpers.price(await this.getElementText(selector.vendor.vReturnRequest.subTotal(productName))));
		await this.type(selector.vendor.vReturnRequest.taxRefund, tax);
		await this.type(selector.vendor.vReturnRequest.subTotalRefund, subTotal);
		await this.click(selector.vendor.vReturnRequest.sendRequest);

		// const successMessage = await this.getElementText(selector.vendor.vReturnRequest.sendRequestSuccessMessage);
		// expect(successMessage).toMatch('Already send refund request. Wait for admin approval');

		await expect(this.page.locator(selector.vendor.vReturnRequest.sendRequestSuccessMessage)).toContainText('Already send refund request. Wait for admin approval');
	}

	// delete return request
	async deleteReturnRequest(orderId: any): Promise<void> {
		await this.goToVendorDashboard();
		await this.click(selector.vendor.vDashboard.returnRequest);
		await this.hover(selector.vendor.vReturnRequest.returnRequestCell(orderId));
		await this.click(selector.vendor.vReturnRequest.delete(orderId));

		const successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage);
		expect(successMessage).toMatch('Return Request has been deleted successfully');
	}

	// vendor override rma settings
	async overrideRmaSettings(productName: any, label: string, type: string, length: string, lengthValue: string, lengthDuration: string): Promise<void> {
		await this.searchProduct(productName);
		await this.click(selector.vendor.product.productLink(productName));
		// override rma settings
		await this.check(selector.vendor.product.overrideYourDefaultRmaSettingsForThisProduct);
		await this.clearAndFill(selector.vendor.product.rmaLabel, label);
		await this.selectByValue(selector.vendor.product.rmaType, type);
		await this.selectByValue(selector.vendor.product.rmaLength, length);
		await this.clearAndFill(selector.vendor.product.rmaLengthValue, lengthValue);
		await this.selectByValue(selector.vendor.product.rmaLengthDuration, lengthDuration);

		const refundReasonIsVisible = await this.isVisible(selector.vendor.product.refundReasons);
		if (refundReasonIsVisible) {
			// await this.clickAndWaitMultiple(selector.vendor.product.refundReasons)   ,                        /TODO: update this
		}
		await this.clickAndWaitForResponse(data.subUrls.frontend.product, selector.vendor.product.saveProduct, 302);

		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		// expect(productCreateSuccessMessage.replace(/\s+/g, ' ').trim()).toMatch(product.saveSuccessMessage)
	}

	// add quantity discount
	async addQuantityDiscount(productName: any, minimumQuantity: string, discountPercentage: string): Promise<void> {
		await this.searchProduct(productName);
		await this.click(selector.vendor.product.productLink(productName));

		// add quantity discount
		await this.check(selector.vendor.product.enableBulkDiscount);
		await this.clearAndFill(selector.vendor.product.lotMinimumQuantity, minimumQuantity);
		await this.clearAndFill(selector.vendor.product.lotDiscountInPercentage, discountPercentage);

		await this.clickAndWaitForResponse(data.subUrls.frontend.product, selector.vendor.product.saveProduct, 302);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		// expect(productCreateSuccessMessage.replace(/\s+/g, ' ').trim()).toMatch(data.product.saveSuccessMessage)
	}

	// vendor search product
	async searchProduct(productName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.product);
		//search product
		await this.type(selector.vendor.product.searchProduct, productName);
		await this.click(selector.vendor.product.search);

		// const searchedProductIsVisible = await this.isVisible(selector.vendor.product.productLink(productName));
		// expect(searchedProductIsVisible).toBe(true);
		await expect(this.page.locator(selector.vendor.product.productLink(productName))).toBeVisible();
	}

	// vendor change order status
	async changeOrderStatus(orderNumber, orderStatus): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.order);
		//change order status
		await this.click(selector.vendor.vOrders.orderLink(orderNumber));
		await this.click(selector.vendor.vOrders.edit);
		await this.selectByValue(selector.vendor.vOrders.orderStatus, orderStatus);
		await this.click(selector.vendor.vOrders.updateOrderStatus);

		const currentOrderStatus = await this.getElementText(selector.vendor.vOrders.currentOrderStatus);
		expect(currentOrderStatus.toLowerCase()).toMatch((orderStatus.replace(/(^wc)|(\W)/g, '')).toLowerCase());
	}

	// vendor refund order
	async refundOrder(orderNumber, productName, partialRefund: boolean = false): Promise<void> {
		await this.goToVendorDashboard();
		await this.click(selector.vendor.vDashboard.orders);
		await this.click(selector.vendor.vOrders.orderLink(orderNumber));

		//request refund
		await this.click(selector.vendor.vOrders.requestRefund);
		const productQuantity = await this.getElementText(selector.vendor.vOrders.productQuantity(productName));
		const productCost = helpers.price(await this.getElementText(selector.vendor.vOrders.productCost(productName)));
		const productTax = helpers.price(await this.getElementText(selector.vendor.vOrders.productTax(productName)));
		await this.type(selector.vendor.vOrders.refundProductQuantity(productName), productQuantity);
		if (partialRefund) {
			await this.click(selector.vendor.vOrders.refundDiv);
			await this.clearAndFill(selector.vendor.vOrders.refundProductCostAmount(productName), String(helpers.roundToTwo(productCost / 2)));
			await this.clearAndFill(selector.vendor.vOrders.refundProductTaxAmount(productName), String(helpers.roundToTwo(productTax / 2)));
		}
		await this.type(selector.vendor.vOrders.refundReason, 'Defective product');
		await this.click(selector.vendor.vOrders.refundManually);
		await this.click(selector.vendor.vOrders.confirmRefund);

		// const successMessage = await this.getElementText(selector.vendor.vOrders.refundRequestSuccessMessage);
		// expect(successMessage).toMatch('Refund request submitted.');
		await expect(this.page.locator(selector.vendor.vOrders.refundRequestSuccessMessage)).toContainText('Refund request submitted.');
		await this.click(selector.vendor.vOrders.refundRequestSuccessMessageOk);
	}

	// get order details vendor
	// async getOrderDetails(orderNumber): Promise<object> {
	//     await this.goToVendorDashboard()
	//     await this.click(selector.vendor.vDashboard.orders)
	//     let vOrderDetails = {}
	//     vOrderDetails.vendorEarning = helpers.price(await this.getElementText(selector.vendor.vOrders.vendorEarningTable(orderNumber)))

	//     await this.click(selector.vendor.vOrders.orderLink(orderNumber))
	//     vOrderDetails.orderNumber = (await this.getElementText(selector.vendor.vOrders.orderNumber)).split('#')[1]
	//     let refundedOrderTotalIsVisible = await this.isVisible(selector.vendor.vOrders.orderTotalAfterRefund)
	//     if (refundedOrderTotalIsVisible) {
	//         vOrderDetails.orderTotalBeforeRefund = helpers.price(await this.getElementText(selector.vendor.vOrders.orderTotalBeforeRefund))
	//         vOrderDetails.orderTotal = helpers.price(await this.getElementText(selector.vendor.vOrders.orderTotalAfterRefund))
	//     } else {
	//         vOrderDetails.orderTotal = helpers.price(await this.getElementText(selector.vendor.vOrders.orderTotal))
	//     }
	//     vOrderDetails.orderStatus = (await this.getElementText(selector.vendor.vOrders.currentOrderStatus)).replace('-', ' ')
	//     let orderDate = (await this.getElementText(selector.vendor.vOrders.orderDate)).split(':')[1].trim()
	//     vOrderDetails.orderDate = orderDate.substring(0, orderDate.indexOf(',', orderDate.indexOf(',') + 1))
	//     vOrderDetails.discount = helpers.price(await this.getElementText(selector.vendor.vOrders.discount))
	//     let shippingMethodIsVisible = await this.isVisible(selector.vendor.vOrders.shippingMethod)
	//     if (shippingMethodIsVisible) vOrderDetails.shippingMethod = await this.getElementText(selector.vendor.vOrders.shippingMethod)
	//     vOrderDetails.shippingCost = helpers.price(await this.getElementText(selector.vendor.vOrders.shippingCost))
	//     let taxIsVisible = await this.isVisible(selector.vendor.vOrders.tax)
	//     if (taxIsVisible) vOrderDetails.tax = helpers.price(await this.getElementText(selector.vendor.vOrders.tax))
	//     vOrderDetails.refunded = helpers.price(await this.getElementText(selector.vendor.vOrders.refunded))

	//     return vOrderDetails
	// }

	// get total vendor earnings
	async getTotalVendorEarning(): Promise<number> {
		await this.goToVendorDashboard();
		return helpers.price(await this.getElementText(selector.vendor.vDashboard.earning));
	}
}
