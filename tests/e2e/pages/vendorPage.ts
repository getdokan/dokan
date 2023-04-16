import { expect, type Page } from '@playwright/test';
import { BasePage } from './basePage';
import { LoginPage } from './loginPage';
import { AdminPage } from './adminPage';
import { CustomerPage } from './customerPage';
import { selector } from './selectors';
import { data } from '../utils/testData';
import { helpers } from '../utils/helpers';
import { log } from 'console';

export class VendorPage extends BasePage {
	constructor(page: Page) {
		super(page);
	}

	loginPage = new LoginPage(this.page);
	customerPage = new CustomerPage(this.page);
	adminPage = new AdminPage(this.page);

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
			// await this.loginPage.logout();
		}
		const username = vendorInfo.firstName();
		await this.clearAndType(selector.vendor.vRegistration.regEmail, username + data.vendor.vendorInfo.emailDomain);
		await this.clearAndType(selector.vendor.vRegistration.regPassword, vendorInfo.password);
		await this.click(selector.vendor.vRegistration.regVendor);
		await this.waitForVisibleLocator(selector.vendor.vRegistration.firstName);
		await this.clearAndType(selector.vendor.vRegistration.firstName, username);
		await this.clearAndType(selector.vendor.vRegistration.lastName, vendorInfo.lastName());
		await this.clearAndType(selector.vendor.vRegistration.shopName, vendorInfo.shopName);
		// await this.clearAndType(selector.vendor.shopUrl, shopUrl)
		await this.click(selector.vendor.vRegistration.shopUrl);

		// fill address if enabled
		const addressInputIsVisible = await this.isVisible(selector.vendor.vRegistration.street1)
		if (addressInputIsVisible) {
			await this.clearAndType(selector.vendor.vRegistration.street1, vendorInfo.street1);
			await this.clearAndType(selector.vendor.vRegistration.street2, vendorInfo.street2);
			await this.clearAndType(selector.vendor.vRegistration.city, vendorInfo.city);
			await this.clearAndType(selector.vendor.vRegistration.zipCode, vendorInfo.zipCode);
			await this.selectByValue(selector.vendor.vRegistration.country, vendorInfo.countrySelectValue);
			await this.selectByValue(selector.vendor.vRegistration.state, vendorInfo.stateSelectValue);
		}
		await this.clearAndType(selector.vendor.vRegistration.companyName, vendorInfo.companyName);
		await this.clearAndType(selector.vendor.vRegistration.companyId, vendorInfo.companyId);
		await this.clearAndType(selector.vendor.vRegistration.vatNumber, vendorInfo.vatNumber);
		await this.clearAndType(selector.vendor.vRegistration.bankName, vendorInfo.bankName);
		await this.clearAndType(selector.vendor.vRegistration.bankIban, vendorInfo.bankIban);
		await this.clearAndType(selector.vendor.vRegistration.phone, vendorInfo.phoneNumber);
		// const termsAndConditionsIsVisible = await this.isVisible(selector.customer.cDashboard.termsAndConditions);
		// if (termsAndConditionsIsVisible) {
		// 	await this.check(selector.customer.cDashboard.termsAndConditions); 
		// }
		await this.checkIfVisible(selector.customer.cDashboard.termsAndConditions)
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
			// await this.customerPage.placeOrder('bank', false, false, true);
		}
		await this.vendorSetupWizard(setupWizardData);
	}

	// vendor setup wizard
	async vendorSetupWizard(setupWizardData: { choice: any; storeProductsPerPage: any; street1: any; street2: any; country: any; city: any; zipCode: any; state: any; paypal: any; bankAccountName: any; bankAccountType: any; bankAccountNumber: any; bankName: any; bankAddress: any; bankRoutingNumber: any; bankIban: any; bankSwiftCode: any; customPayment: any; skrill: any; }): Promise<void> {
		setupWizardData.choice = true

		await this.goIfNotThere(data.subUrls.frontend.vendorSetupWizard);
		if (setupWizardData.choice) {
			await this.click(selector.vendor.vSetup.letsGo);
			await this.clearAndType(selector.vendor.vSetup.storeProductsPerPage, setupWizardData.storeProductsPerPage);
			await this.clearAndType(selector.vendor.vSetup.street1, setupWizardData.street1);
			await this.clearAndType(selector.vendor.vSetup.street2, setupWizardData.street2);
			await this.clearAndType(selector.vendor.vSetup.city, setupWizardData.city);
			await this.clearAndType(selector.vendor.vSetup.zipCode, setupWizardData.zipCode);
			await this.click(selector.vendor.vSetup.country);
			await this.type(selector.vendor.vSetup.countryInput, setupWizardData.country);
			await this.press(data.key.enter);
			await this.type(selector.vendor.vSetup.state, setupWizardData.state);
			await this.press(data.key.enter);
			await this.check(selector.vendor.vSetup.email); //ToDo: update every checkbox with check instead of click, check method , if checked remains checked
			await this.click(selector.vendor.vSetup.continueStoreSetup);
			// paypal
			await this.clearAndType(selector.vendor.vSetup.paypal, setupWizardData.paypal());
			// bank transfer
			await this.clearAndType(selector.vendor.vSetup.bankAccountName, setupWizardData.bankAccountName);
			await this.selectByValue(selector.vendor.vSetup.bankAccountType, setupWizardData.bankAccountType);
			await this.clearAndType(selector.vendor.vSetup.bankAccountNumber, setupWizardData.bankAccountNumber);
			await this.clearAndType(selector.vendor.vSetup.bankRoutingNumber, setupWizardData.bankRoutingNumber);
			await this.clearAndType(selector.vendor.vSetup.bankName, setupWizardData.bankName);
			await this.clearAndType(selector.vendor.vSetup.bankAddress, setupWizardData.bankAddress);
			await this.clearAndType(selector.vendor.vSetup.bankIban, setupWizardData.bankIban);
			await this.clearAndType(selector.vendor.vSetup.bankSwiftCode, setupWizardData.bankSwiftCode);
			await this.check(selector.vendor.vSetup.declaration);
			// custom method
			await this.typeIfVisible(selector.vendor.vSetup.customPayment, setupWizardData.customPayment);
			// skrill
			await this.typeIfVisible(selector.vendor.vSetup.skrill, setupWizardData.skrill);

			await this.click(selector.vendor.vSetup.continuePaymentSetup);
			await this.clickAndWaitForResponse(data.subUrls.frontend.dashboard, selector.vendor.vSetup.goToStoreDashboard);
			await expect(this.page.locator(selector.vendor.vDashboard.dashboard)).toBeVisible();
		} else {
			await this.clickAndWaitForResponse(data.subUrls.frontend.dashboard, selector.vendor.vSetup.notRightNow);
			await expect(this.page.locator(selector.vendor.vDashboard.dashboard)).toBeVisible();
		}
	}

	// vendor add product category
	async addCategory(category: string): Promise<void> {
		await this.click(selector.vendor.product.productCategoryModal);
		await this.waitForVisibleLocator(selector.vendor.product.productCategorySearchInput);
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
	async addSimpleProduct(product: { productType?: any; productName: any; category: any; regularPrice: any; storeName?: string; status?: string; stockStatus?: boolean; attribute?: any; attributeTerms?: string[]; variations?: any; saveSuccessMessage?: any; subscriptionPrice?: any; subscriptionPeriodInterval?: any; subscriptionPeriod?: any; expireAfter?: any; subscriptionTrialLength?: any; subscriptionTrialPeriod?: any; productUrl?: any; buttonText?: any; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.product);
		const productName = product.productName();
		// add new simple product
		await this.click(selector.vendor.product.addNewProduct);
		await this.waitForVisibleLocator(selector.vendor.product.productName);
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
		await this.waitForVisibleLocator(selector.vendor.product.selectAll);
		await this.click(selector.vendor.product.selectAll);
		await this.click(selector.vendor.product.usedForVariations);
		await this.waitForVisibleLocator(selector.vendor.product.saveAttributes);
		await this.click(selector.vendor.product.saveAttributes);
		await this.waitForVisibleLocator(selector.vendor.product.addVariations);
		await this.selectByValue(selector.vendor.product.addVariations, product.variations.linkAllVariation);
		await this.click(selector.vendor.product.go);
		await this.waitForVisibleLocator(selector.vendor.product.confirmGo);
		await this.click(selector.vendor.product.confirmGo);
		await this.click(selector.vendor.product.okSuccessAlertGo);
		await this.selectByValue(selector.vendor.product.addVariations, product.variations.variableRegularPrice);
		await this.click(selector.vendor.product.go);
		// await this.waitForVisibleLocator(selector.vendor.product.variationPrice)
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
		await this.waitForVisibleLocator(selector.vendor.product.selectAll);
		await this.click(selector.vendor.product.selectAll);
		await this.click(selector.vendor.product.usedForVariations);
		await this.waitForVisibleLocator(selector.vendor.product.saveAttributes);
		await this.click(selector.vendor.product.saveAttributes);
		await this.waitForVisibleLocator(selector.vendor.product.addVariations);
		await this.selectByValue(selector.vendor.product.addVariations, product.variations.linkAllVariation);
		await this.click(selector.vendor.product.go);
		await this.waitForVisibleLocator(selector.vendor.product.confirmGo);
		await this.click(selector.vendor.product.confirmGo);
		await this.click(selector.vendor.product.okSuccessAlertGo);
		await this.selectByValue(selector.vendor.product.addVariations, product.variations.variableRegularPrice);
		await this.click(selector.vendor.product.go);
		await this.waitForVisibleLocator(selector.vendor.product.variationPrice);
		await this.type(selector.vendor.product.variationPrice, product.regularPrice());
		await this.click(selector.vendor.product.okVariationPrice); // todo : add waitForResponse with click
		await this.clickAndWaitForResponse(data.subUrls.frontend.product, selector.vendor.product.saveProduct, 302);

		await this.waitForVisibleLocator(selector.vendor.product.updatedSuccessMessage);
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
		await this.clearAndType(selector.vendor.product.price, product.regularPrice());

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
		await this.clearAndType(selector.vendor.vBooking.bookingDurationMax, product.bookingDurationMax);
		await this.selectByValue(selector.vendor.vBooking.bookingDurationUnit, product.bookingDurationUnit);
		// calendar display mode
		await this.selectByValue(selector.vendor.vBooking.calenderDisplayMode, product.calendarDisplayMode);
		await this.check(selector.vendor.vBooking.enableCalendarRangePicker);
		// availability
		await this.clearAndType(selector.vendor.vBooking.maxBookingsPerBlock, product.maxBookingsPerBlock);
		await this.clearAndType(selector.vendor.vBooking.minimumBookingWindowIntoTheFutureDate, product.minimumBookingWindowIntoTheFutureDate);
		await this.selectByValue(selector.vendor.vBooking.minimumBookingWindowIntoTheFutureDateUnit, product.minimumBookingWindowIntoTheFutureDateUnit);
		await this.clearAndType(selector.vendor.vBooking.maximumBookingWindowIntoTheFutureDate, product.maximumBookingWindowIntoTheFutureDate);
		await this.selectByValue(selector.vendor.vBooking.maximumBookingWindowIntoTheFutureDateUnit, product.maximumBookingWindowIntoTheFutureDateUnit);
		// costs
		await this.type(selector.vendor.vBooking.baseCost, product.baseCost);
		await this.type(selector.vendor.vBooking.blockCost, product.blockCost);
		await this.clickAndWaitForResponse(data.subUrls.frontend.productBooking, selector.vendor.vBooking.saveProduct, 302);
		await this.waitForVisibleLocator(selector.vendor.vBooking.productName);
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
			await this.clearAndType(selector.vendor.vWithdraw.withdrawAmount, String(minimumWithdrawAmount));
			await this.selectByValue(selector.vendor.vWithdraw.withdrawMethod, withdraw.withdrawMethod.default);
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vWithdraw.submitRequest);
			await expect(this.page.getByText(selector.vendor.vWithdraw.withdrawRequestSaveSuccessMessage)).toBeVisible();
		} else {
			// throw new Error("Vendor balance is less than minimum withdraw amount")
			console.log('Vendor balance is less than minimum withdraw amount');
			// TODO: Convert to expect error instead of console  log
			// expect(addNewProduct)).to.eventually.throw(AppError).with.property('code', "InvalidInput");
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
		await this.goIfNotThere(data.subUrls.frontend.editAccountVendor);
		await this.clearAndType(selector.vendor.vAccountDetails.firstName, vendorInfo.firstName());
		await this.clearAndType(selector.vendor.vAccountDetails.lastName, vendorInfo.lastName());
		// await this.clearAndType(selector.vendor.vAccountDetails.email, vendorInfo.email());
		// await this.type(selector.vendor.vAccountDetails.currentPassword, vendorInfo.password);
		// await this.type(selector.vendor.vAccountDetails.NewPassword, vendorInfo.password1);
		// await this.type(selector.vendor.vAccountDetails.confirmNewPassword, vendorInfo.password1);
		await this.clickAndWaitForResponse(data.subUrls.frontend.editAccountVendor, selector.vendor.vAccountDetails.saveChanges, 302);
		await expect(this.page.getByText(selector.vendor.vAccountDetails.editAccountSaveChangesSuccessMessage)).toBeVisible();
	}

	// vendor settings

	// vendor set store settings
	async setStoreSettings(vendorInfo: { email?: () => string; emailDomain?: string; password?: string; password1?: string; firstName?: () => string; lastName?: () => string; userName?: string; shopName?: string; shopUrl?: string; companyName?: string; companyId?: string; vatNumber?: string; bankName?: string; bankIban?: string; phoneNumber?: string; street1?: string; street2?: string; country?: string; countrySelectValue?: string; stateSelectValue?: string; city?: string; zipCode?: string; state?: string; accountName?: string; accountNumber?: string; bankAddress?: string; routingNumber?: string; swiftCode?: string; iban?: string; banner?: string; profilePicture?: string; storeName?: string; productsPerPage?: string; mapLocation: any; termsAndConditions: any; biography: any; supportButtonText: any; openingClosingTime: any; vacation: any; discount: any; minMax: any; storeSettingsSaveSuccessMessage: any; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsStore);

		// await this.bannerAndProfilePictureSettings();
		await this.basicInfoSettings(vendorInfo);
		await this.mapSettings(vendorInfo.mapLocation);
		await this.termsAndConditionsSettings(vendorInfo.termsAndConditions);
		await this.openingClosingTimeSettings(vendorInfo.openingClosingTime);
		await this.vacationSettings(vendorInfo.vacation.datewise);
		await this.catalogModeSettings();
		await this.discountSettings(vendorInfo.discount);
		await this.biographySettings(vendorInfo.biography);
		await this.storeSupportSettings(vendorInfo.supportButtonText);
		await this.minMaxSettings(vendorInfo.minMax);
		// update settings
		await this.click(selector.vendor.vStoreSettings.updateSettings);
		await expect(this.page.locator(selector.vendor.vSocialProfileSettings.updateSettingsSuccessMessage)).toContainText(vendorInfo.storeSettingsSaveSuccessMessage)

	}

	// vendor set banner and profile picture settings
	// async bannerAndProfilePictureSettings(banner: string, profilePicture: string): Promise<void> { //TODO: fix
	// 	// upload banner and profile picture
	// 	await this.removePreviouslyUploadedImage(selector.vendor.vStoreSettings.bannerImage, selector.vendor.vStoreSettings.removeBannerImage);
	// 	await this.click(selector.vendor.vStoreSettings.banner);
	// 	await this.wpUploadFile(banner);

	// 	await this.removePreviouslyUploadedImage(selector.vendor.vStoreSettings.profilePictureImage, selector.vendor.vStoreSettings.removeProfilePictureImage);
	// 	await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vStoreSettings.profilePicture);
	// 	await this.wpUploadFile(profilePicture);
	// }



	// vendor set basic info settings
	async basicInfoSettings(vendorInfo: { email?: () => string; emailDomain?: string; password?: string; password1?: string; firstName?: () => string; lastName?: () => string; userName?: string; shopName?: string; shopUrl?: string; companyName?: string; companyId?: string; vatNumber?: string; bankName?: string; bankIban?: string; phoneNumber?: string; street1?: string; street2?: string; country?: string; countrySelectValue?: string; stateSelectValue?: string; city?: string; zipCode?: string; state?: string; accountName?: string; accountNumber?: string; bankAddress?: string; routingNumber?: string; swiftCode?: string; iban?: string; banner?: string; profilePicture?: string; storeName?: string; productsPerPage?: string; mapLocation: any; termsAndConditions: any; biography: any; supportButtonText: any; openingClosingTime: any; vacation: any; discount: any; minMax: any; storeSettingsSaveSuccessMessage: any }): Promise<void> {
		// store basic info
		await this.clearAndType(selector.vendor.vStoreSettings.storeName, vendorInfo.storeName);
		await this.clearAndType(selector.vendor.vStoreSettings.storeProductsPerPage, vendorInfo.productsPerPage);
		await this.clearAndType(selector.vendor.vStoreSettings.phoneNo, vendorInfo.phoneNumber);
		// address
		await this.clearAndType(selector.vendor.vStoreSettings.street, vendorInfo.street1);
		await this.clearAndType(selector.vendor.vStoreSettings.street2, vendorInfo.street2);
		await this.clearAndType(selector.vendor.vStoreSettings.city, vendorInfo.city);
		await this.clearAndType(selector.vendor.vStoreSettings.postOrZipCode, vendorInfo.zipCode);
		await this.selectByValue(selector.vendor.vStoreSettings.country, vendorInfo.countrySelectValue);
		await this.selectByValue(selector.vendor.vStoreSettings.state, vendorInfo.stateSelectValue);
		// company info 
		await this.clearAndType(selector.vendor.vStoreSettings.companyName, vendorInfo.companyName);
		await this.clearAndType(selector.vendor.vStoreSettings.companyId, vendorInfo.companyId);
		await this.clearAndType(selector.vendor.vStoreSettings.vatOrTaxNumber, vendorInfo.vatNumber);
		await this.clearAndType(selector.vendor.vStoreSettings.nameOfBank, vendorInfo.bankName);
		await this.clearAndType(selector.vendor.vStoreSettings.bankIban, vendorInfo.bankIban);
		// email
		await this.check(selector.vendor.vStoreSettings.email);
		// show more products
		await this.check(selector.vendor.vStoreSettings.moreProducts);
	}

	// vendor set map settings
	async mapSettings(mapLocation: string): Promise<void> {
		// map
		await this.typeAndWaitForResponse(data.subUrls.gmap, selector.vendor.vStoreSettings.map, mapLocation);
		await this.press(data.key.arrowDown);
		await this.press(data.key.enter);
	}

	// vendor set terms and conditions settings
	async termsAndConditionsSettings(termsAndConditions: string): Promise<void> {
		// terms and conditions
		await this.check(selector.vendor.vStoreSettings.termsAndConditions);
		await this.typeFrameSelector(selector.vendor.vStoreSettings.termsAndConditionsIframe, selector.vendor.vStoreSettings.termsAndConditionsHtmlBody, termsAndConditions);
	}

	// vendor set opening closing time settings
	async openingClosingTimeSettings(openingClosingTime: { days: any; openingTime: string; closingTime: string; storeOpenNotice: string; storeCloseNotice: string; }): Promise<void> {
		// store opening closing time
		await this.check(selector.vendor.vStoreSettings.storeOpeningClosingTime);
		for (const day of openingClosingTime.days) {
			await this.enableSwitcherDeliveryTime(selector.vendor.vStoreSettings.openingClosingTimeSwitch(day));
			await this.setAttributeValue(selector.vendor.vStoreSettings.openingTime(day), 'value', openingClosingTime.openingTime);
			await this.setAttributeValue(selector.vendor.vStoreSettings.openingTimeHiddenInput(day), 'value', openingClosingTime.openingTime);
			await this.setAttributeValue(selector.vendor.vStoreSettings.closingTime(day), 'value', openingClosingTime.closingTime);
			await this.setAttributeValue(selector.vendor.vStoreSettings.closingTimeHiddenInput(day), 'value', openingClosingTime.closingTime);
		}
		await this.clearAndType(selector.vendor.vStoreSettings.storeOpenNotice, openingClosingTime.storeOpenNotice);
		await this.clearAndType(selector.vendor.vStoreSettings.storeCloseNotice, openingClosingTime.storeCloseNotice);
	}

	// vendor set vacation settings
	async vacationSettings(vacation: { closingStyle: string; vacationDayFrom: any; vacationDayTo: any; vacationMessage: string; }): Promise<void> {

		// // delete pervious datewise vacation settings if any  //TODO: skip this not needed ,might use in delete test
		// const noVacationIsSetIsVisible = await this.isVisible(selector.vendor.vStoreSettings.noVacationIsSet);
		// if (!noVacationIsSetIsVisible) {
		// 	await this.hover(selector.vendor.vStoreSettings.vacationRow); 
		// 	await this.click(selector.vendor.vStoreSettings.deleteSavedVacationSchedule);
		// 	await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vStoreSettings.confirmDeleteSavedVacationSchedule);
		// }
		await this.check(selector.vendor.vStoreSettings.goToVacation);
		await this.selectByValue(selector.vendor.vStoreSettings.closingStyle, vacation.closingStyle);
		switch (vacation.closingStyle) {
			// instantly close
			case 'instantly':
				await this.clearAndType(selector.vendor.vStoreSettings.setVacationMessageInstantly, vacation.vacationMessage);
				break;

			// datewise close
			case 'datewise':
				const vacationDayFrom = (vacation.vacationDayFrom()).split(',')[0];
				const vacationDayTo = (vacation.vacationDayTo(vacationDayFrom)).split(',')[0];
				console.log(vacationDayFrom, vacationDayTo);
				await this.setAttributeValue(selector.vendor.vStoreSettings.vacationDateRangeFrom, 'value', vacationDayFrom);
				await this.setAttributeValue(selector.vendor.vStoreSettings.vacationDateRangeTo, 'value', vacationDayTo);
				await this.clearAndType(selector.vendor.vStoreSettings.setVacationMessageDatewise, vacation.vacationMessage);
				await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vStoreSettings.saveVacationEdit);
				break;

			default:
				break;
		}
	}

	// vendor set discount settings
	async discountSettings(discount: { minimumOrderAmount: string; minimumOrderAmountPercentage: string; }): Promise<void> {
		// discount
		await this.check(selector.vendor.vStoreSettings.enableStoreWideDiscount);
		await this.clearAndType(selector.vendor.vStoreSettings.minimumOrderAmount, discount.minimumOrderAmount);
		await this.clearAndType(selector.vendor.vStoreSettings.percentage, discount.minimumOrderAmountPercentage);
	}

	// vendor set catalog mode settings
	async catalogModeSettings(): Promise<void> {
		// catalog mode
		await this.check(selector.vendor.vStoreSettings.removeAddToCartButton);
		await this.checkIfVisible(selector.vendor.vStoreSettings.enableRequestQuoteSupport);
	}

	// vendor set biography settings
	async biographySettings(biography: string): Promise<void> {
		// biography
		await this.typeFrameSelector(selector.vendor.vStoreSettings.biographyIframe, selector.vendor.vStoreSettings.biographyHtmlBody, biography);
	}

	// vendor set store support settings
	async storeSupportSettings(supportButtonText: string): Promise<void> {
		// store support
		await this.check(selector.vendor.vStoreSettings.showSupportButtonInStore);
		await this.check(selector.vendor.vStoreSettings.showSupportButtonInSingleProduct);
		await this.clearAndType(selector.vendor.vStoreSettings.supportButtonText, supportButtonText);
	}

	// vendor set minmax settings
	async minMaxSettings(minMax: { minimumProductQuantity: string; maximumProductQuantity: string; minimumAmount: string; maximumAmount: string; category: string; }): Promise<void> {
		// min-max
		await this.check(selector.vendor.vStoreSettings.enableMinMaxQuantities);
		await this.clearAndType(selector.vendor.vStoreSettings.minimumProductQuantityToPlaceAnOrder, minMax.minimumProductQuantity);
		await this.clearAndType(selector.vendor.vStoreSettings.maximumProductQuantityToPlaceAnOrder, minMax.maximumProductQuantity);
		await this.check(selector.vendor.vStoreSettings.enableMinMaxAmount);
		await this.clearAndType(selector.vendor.vStoreSettings.minimumAmountToPlaceAnOrder, minMax.minimumAmount);
		await this.clearAndType(selector.vendor.vStoreSettings.maximumAmountToPlaceAnOrder, minMax.maximumAmount);
		await this.click(selector.vendor.vStoreSettings.clear);
		await this.click(selector.vendor.vStoreSettings.selectAll);
		await this.select2ByTextMultiSelector(selector.vendor.vStoreSettings.selectCategorySearch, selector.vendor.vStoreSettings.selectCategorySearchedResult, minMax.category);
	}

	// vendor set store address
	async setStoreAddress(vendorInfo: { street1: string; street2: string; city: string; zipCode: string; countrySelectValue: string; stateSelectValue: string; storeSettingsSaveSuccessMessage: string | RegExp; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsStore);
		// store address
		await this.clearAndType(selector.vendor.vStoreSettings.street, vendorInfo.street1);
		await this.clearAndType(selector.vendor.vStoreSettings.street2, vendorInfo.street2);
		await this.clearAndType(selector.vendor.vStoreSettings.city, vendorInfo.city);
		await this.clearAndType(selector.vendor.vStoreSettings.postOrZipCode, vendorInfo.zipCode);
		await this.selectByValue(selector.vendor.vStoreSettings.country, vendorInfo.countrySelectValue);
		await this.selectByValue(selector.vendor.vStoreSettings.state, vendorInfo.stateSelectValue);
		// update settings
		await this.click(selector.vendor.vStoreSettings.updateSettings);
		await expect(this.page.locator(selector.vendor.vSocialProfileSettings.updateSettingsSuccessMessage)).toContainText(vendorInfo.storeSettingsSaveSuccessMessage)
	}

	// vendor add addons
	async addAddon(addon: { name: any; priority: any; category: any; type: any; displayAs: any; titleRequired: any; formatTitle: any; addDescription: any; enterAnOption: any; optionPriceType: any; optionPriceInput: any; saveSuccessMessage: any; }): Promise<string> {
		await this.goIfNotThere(data.subUrls.frontend.settingsAddon);

		// add addon
		const addonName = addon.name();
		await this.click(selector.vendor.vAddonSettings.createNewAddon);
		await this.clearAndType(selector.vendor.vAddonSettings.name, addonName);
		await this.clearAndType(selector.vendor.vAddonSettings.priority, addon.priority);
		await this.click(selector.vendor.vAddonSettings.productCategories,);
		await this.type(selector.vendor.vAddonSettings.productCategories, addon.category);
		await this.press(data.key.enter);
		// add-on fields
		await this.click(selector.vendor.vAddonSettings.addField);
		await this.selectByValue(selector.vendor.vAddonSettings.type, addon.type);
		await this.selectByValue(selector.vendor.vAddonSettings.displayAs, addon.displayAs);
		await this.clearAndType(selector.vendor.vAddonSettings.titleRequired, addon.titleRequired);
		await this.selectByValue(selector.vendor.vAddonSettings.formatTitle, addon.formatTitle);
		await this.click(selector.vendor.vAddonSettings.enableDescription);
		await this.clearAndType(selector.vendor.vAddonSettings.addDescription, addon.addDescription);
		await this.click(selector.vendor.vAddonSettings.requiredField);
		await this.clearAndType(selector.vendor.vAddonSettings.enterAnOption, addon.enterAnOption);
		await this.selectByValue(selector.vendor.vAddonSettings.optionPriceType, addon.optionPriceType);
		await this.clearAndType(selector.vendor.vAddonSettings.optionPriceInput, addon.optionPriceInput);
		await this.click(selector.vendor.vAddonSettings.publish);

		await expect(this.page.locator(selector.vendor.vAddonSettings.addonUpdateSuccessMessage)).toContainText(addon.saveSuccessMessage);
		return addonName;
	}

	// vendor edit addons
	async editAddon(addon: { name: any; priority: any; category: any; type: any; displayAs: any; titleRequired: any; formatTitle: any; addDescription: any; enterAnOption: any; optionPriceType: any; optionPriceInput: any; saveSuccessMessage: any; }, addonName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsAddon);
		// add addon
		await this.click(selector.vendor.vAddonSettings.editAddon(addonName));
		// await this.click(selector.vendor.vAddonSettings.firstAddon)
		await this.clearAndType(selector.vendor.vAddonSettings.name, addon.name());
		await this.clearAndType(selector.vendor.vAddonSettings.priority, addon.priority);
		await this.click(selector.vendor.vAddonSettings.productCategories,);
		await this.type(selector.vendor.vAddonSettings.productCategories, addon.category);
		await this.press(data.key.enter);
		// add-on fields
		await this.click(selector.vendor.vAddonSettings.addedFirstField);
		await this.selectByValue(selector.vendor.vAddonSettings.type, addon.type);
		await this.selectByValue(selector.vendor.vAddonSettings.displayAs, addon.displayAs);
		await this.clearAndType(selector.vendor.vAddonSettings.titleRequired, addon.titleRequired);
		await this.selectByValue(selector.vendor.vAddonSettings.formatTitle, addon.formatTitle);
		await this.clearAndType(selector.vendor.vAddonSettings.addDescription, addon.addDescription);
		await this.click(selector.vendor.vAddonSettings.requiredField);
		await this.clearAndType(selector.vendor.vAddonSettings.enterAnOption, addon.enterAnOption);
		await this.selectByValue(selector.vendor.vAddonSettings.optionPriceType, addon.optionPriceType);
		await this.clearAndType(selector.vendor.vAddonSettings.optionPriceInput, addon.optionPriceInput);
		await this.click(selector.vendor.vAddonSettings.update);
		await expect(this.page.locator(selector.vendor.vAddonSettings.addonUpdateSuccessMessage)).toContainText(addon.saveSuccessMessage);
	}

	// vendor set payment settings
	async setPaymentSettings(payment: any): Promise<void> {
		await this.setPaypal(payment)
		await this.setBankTransfer(payment)
		await this.setCustom(payment)
		await this.setSkrill(payment)
		// await this.setStripe()
		// await this.setPaypalMarketPlace()
		// await this.setRazorpay()

	}

	// paypal payment settings
	async setPaypal(paymentMethod: { email: () => string; saveSuccessMessage: string | RegExp; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.paypal);
		//paypal
		await this.clearAndType(selector.vendor.vPaymentSettings.paypal, paymentMethod.email());
		// update settings
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.updateSettings);
		await expect(this.page.locator(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage)).toContainText(paymentMethod.saveSuccessMessage);
	}

	// bank transfer payment settings
	async setBankTransfer(paymentMethod: {
		bankAccountType: string; bankAccountName: string; bankAccountNumber: string; bankName: string; bankAddress: string; bankRoutingNumber: string; bankIban: string; bankSwiftCode: string; saveSuccessMessage: string | RegExp; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.bankTransfer);
		// bank transfer
		await this.clickIfVisible(selector.vendor.vPaymentSettings.disconnectAccount)
		await this.clearAndType(selector.vendor.vPaymentSettings.bankAccountName, paymentMethod.bankAccountName);
		await this.selectByValue(selector.vendor.vPaymentSettings.bankAccountType, paymentMethod.bankAccountType);
		await this.clearAndType(selector.vendor.vPaymentSettings.bankAccountNumber, paymentMethod.bankAccountNumber);
		await this.clearAndType(selector.vendor.vPaymentSettings.bankRoutingNumber, paymentMethod.bankRoutingNumber);
		await this.clearAndType(selector.vendor.vPaymentSettings.bankName, paymentMethod.bankName);
		await this.clearAndType(selector.vendor.vPaymentSettings.bankAddress, paymentMethod.bankAddress);
		await this.clearAndType(selector.vendor.vPaymentSettings.bankIban, paymentMethod.bankIban);
		await this.clearAndType(selector.vendor.vPaymentSettings.bankSwiftCode, paymentMethod.bankSwiftCode);
		await this.check(selector.vendor.vSetup.declaration);

		// update settings
		// await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.updateSettings);
		await this.clickAndWaitForResponse(data.subUrls.ajax,selector.vendor.vPaymentSettings.addAccount)
		await expect(this.page.locator(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage)).toContainText(paymentMethod.saveSuccessMessage);
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
	//     await this.clearAndType(selector.vendor.vPaymentSettings.paypalMarketplace, paypalMarketplace)
	//     await this.click(selector.vendor.vPaymentSettings.paypalMarketplaceSignUp)
	// }

	// // razorpay payment settings
	// async setRazorpay(razorpay): Promise<void> {
	//     // razorpay
	//     await this.click(selector.vendor.vPaymentSettings.rzSignup)
	//     // existing account info
	//     await this.click(selector.vendor.vPaymentSettings.rzIHaveAlreadyAnAccount)
	//     await this.clearAndType(selector.vendor.vPaymentSettings.rzAccountId, rzAccountId)
	//     await this.click(selector.vendor.vPaymentSettings.rzConnectExistingAccount)
	//     //new account info
	//     await this.clearAndType(selector.vendor.vPaymentSettings.rzAccountName, rzAccountName)
	//     await this.clearAndType(selector.vendor.vPaymentSettings.rzAccountEmail, rzAccountEmail)
	//     await this.clearAndType(selector.vendor.vPaymentSettings.rzYourCompanyName, rzYourCompanyName)
	//     await this.clearAndType(selector.vendor.vPaymentSettings.rzYourCompanyType, rzYourCompanyType)
	//     await this.clearAndType(selector.vendor.vPaymentSettings.rzBankAccountName, rzBankAccountName)
	//     await this.clearAndType(selector.vendor.vPaymentSettings.rzBankAccountNumber, rzBankAccountNumber)
	//     await this.clearAndType(selector.vendor.vPaymentSettings.rzBankIfscCode, rzBankIfscCode)
	//     await this.clearAndType(selector.vendor.vPaymentSettings.rzBankAccountType, rzBankAccountType)
	//     await this.click(selector.vendor.vPaymentSettings.rzConnectAccount)
	// }

	// custom payment settings
	async setCustom(paymentMethod: { email: () => string; saveSuccessMessage: string | RegExp; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.customPayment);
		// custom payment method
		await this.clearAndType(selector.vendor.vPaymentSettings.customPayment, paymentMethod.email());
		// update settings
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.updateSettings);
		await expect(this.page.locator(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage)).toContainText(paymentMethod.saveSuccessMessage);
	}

	// skrill Payment Settings
	async setSkrill(paymentMethod: { email: () => string; saveSuccessMessage: string | RegExp; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.skrill);
		// skrill
		await this.clearAndType(selector.vendor.vPaymentSettings.skrill, paymentMethod.email());
		// update settings
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.updateSettings);
		await expect(this.page.locator(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage)).toContainText(paymentMethod.saveSuccessMessage);
	}

	// vendor send id verification request
	async sendIdVerificationRequest(verification: { idRequestSubmitCancel: string | RegExp; file: any; file2?: string; street1?: string; street2?: string; city?: string; zipCode?: string; country?: string; state?: string; idRequestSubmitSuccessMessage: any; addressRequestSubmitSuccessMessage?: string; companyRequestSubmitSuccessMessage?: string; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsVerification);

		// cancel previous verification request if any
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.cancelIdVerificationRequest);
		if (cancelRequestIsVisible) {
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.cancelIdVerificationRequest);
			await expect(this.page.getByText(verification.idRequestSubmitCancel)).toBeVisible();
		}
		// id verification
		await this.click(selector.vendor.vVerificationSettings.startIdVerification);
		// remove previously uploaded image
		const uploadPhotoBtnIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.uploadPhoto);
		if (!uploadPhotoBtnIsVisible) {
			// await this.hover(selector.vendor.vVerificationSettings.previousUploadedPhoto); // TODO: not working, real user behavior
			// await this.click(selector.vendor.vVerificationSettings.removePreviousUploadedPhoto);
			await this.setAttributeValue('.gravatar-wrap', 'class', 'gravatar-wrap dokan-hide'); //TODO: remove this alternative soln.
			await this.setAttributeValue('.gravatar-button-area.dokan-hide', 'class', 'gravatar-button-area');
		}
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.uploadPhoto);
		await this.uploadMedia(verification.file);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.submitId);
		await expect(this.page.locator(selector.vendor.vVerificationSettings.idUpdateSuccessMessage)).toContainText(verification.idRequestSubmitSuccessMessage)
	}

	// vendor send address verification request
	async sendAddressVerificationRequest(verification: { addressRequestSubmitCancel: string | RegExp; file: any; file2?: string; street1: any; street2: any; city: any; zipCode: any; country: any; state: any; idRequestSubmitSuccessMessage?: string; addressRequestSubmitSuccessMessage: any; companyRequestSubmitSuccessMessage?: string; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsVerification);
		// cancel previous verification request if any
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.cancelAddressVerificationRequest);
		if (cancelRequestIsVisible) {
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.cancelAddressVerificationRequest);
			await expect(this.page.getByText(verification.addressRequestSubmitCancel)).toBeVisible();
		}
		// address verification
		await this.click(selector.vendor.vVerificationSettings.startAddressVerification);
		await this.clearAndType(selector.vendor.vVerificationSettings.street, verification.street1);
		await this.clearAndType(selector.vendor.vVerificationSettings.street2, verification.street2);
		await this.clearAndType(selector.vendor.vVerificationSettings.city, verification.city);
		await this.clearAndType(selector.vendor.vVerificationSettings.postOrZipCode, verification.zipCode);
		await this.selectByValue(selector.vendor.vVerificationSettings.country, verification.country);
		await this.selectByValue(selector.vendor.vVerificationSettings.state, verification.state);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.uploadResidenceProof);
		await this.uploadMedia(verification.file);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.submitAddress);
		await expect(this.page.locator(selector.vendor.vVerificationSettings.addressUpdateSuccessMessage)).toContainText(verification.addressRequestSubmitSuccessMessage);
	}

	// vendor send company verification request
	async sendCompanyVerificationRequest(verification: { companyRequestSubmitCancel: string | RegExp; file: any; file2?: string; street1?: string; street2?: string; city?: string; zipCode?: string; country?: string; state?: string; idRequestSubmitSuccessMessage?: string; addressRequestSubmitSuccessMessage?: string; companyRequestSubmitSuccessMessage: any; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsVerification);
		// cancel previous verification request if any
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.cancelCompanyVerificationRequest);
		if (cancelRequestIsVisible) {
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.cancelCompanyVerificationRequest);
			await expect(this.page.getByText(verification.companyRequestSubmitCancel)).toBeVisible();
		}
		// company verification
		await this.click(selector.vendor.vVerificationSettings.startCompanyVerification);
		// remove previously uploaded company file
		const UploadedCompanyFileIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.UploadedCompanyFileClose);
		if (UploadedCompanyFileIsVisible) {
			await this.click(selector.vendor.vVerificationSettings.UploadedCompanyFileClose);
		}
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.uploadFiles);
		await this.uploadMedia(verification.file);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.submitCompanyInfo);
		await expect(this.page.locator(selector.vendor.vVerificationSettings.companyInfoUpdateSuccessMessage)).toContainText(verification.companyRequestSubmitSuccessMessage);
	}

	// upload media
	async uploadMedia(file: any) { //TODO: move uploadMedia to base page, try to make only one function for media upload for whole project
		const uploadedMediaIsVisible = await this.isVisible(selector.wpMedia.uploadedMedia);
		if (uploadedMediaIsVisible) {
			await this.click(selector.wpMedia.uploadedMedia);
		} else {
			await this.uploadFile(selector.wpMedia.selectFilesInput, file); //TODO: image upload don't work , try on other site
			await this.click(selector.wpMedia.selectUploadedMedia); //TODO: after fix this line not needed
			await this.click(selector.wpMedia.select);
		}
	}

	// vendor set verification settings
	async setVerificationSettings(verification: { idRequestSubmitCancel?: string | RegExp; file: any; file2: string; street1: any; street2: any; city: any; zipCode: any; country: any; state: any; idRequestSubmitSuccessMessage: any; addressRequestSubmitSuccessMessage: any; companyRequestSubmitSuccessMessage: any; addressRequestSubmitCancel?: string | RegExp; companyRequestSubmitCancel?: string | RegExp; }): Promise<void> {
		await this.sendIdVerificationRequest(verification);
		await this.sendAddressVerificationRequest(verification);
		await this.sendCompanyVerificationRequest(verification);
	}

	// vendor set delivery settings
	async setDeliveryTimeSettings(deliveryTime: { deliveryBlockedBuffer: any; days: any; openingTime: any; closingTime: any; timeSlot: any; orderPerSlot: any; saveSuccessMessage: any; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsDeliveryTime);
		// delivery support
		await this.check(selector.vendor.vDeliveryTimeSettings.homeDelivery);
		await this.check(selector.vendor.vDeliveryTimeSettings.storePickup);
		await this.clearAndType(selector.vendor.vDeliveryTimeSettings.deliveryBlockedBuffer, deliveryTime.deliveryBlockedBuffer);
		await this.clearAndType(selector.vendor.vDeliveryTimeSettings.deliveryBlockedBuffer, deliveryTime.orderPerSlot);
		await this.clearAndType(selector.vendor.vDeliveryTimeSettings.timeSlot, deliveryTime.timeSlot);
		await this.clearAndType(selector.vendor.vDeliveryTimeSettings.orderPerSlot, deliveryTime.orderPerSlot);
		for (const day of deliveryTime.days) {
			await this.enableSwitcherDeliveryTime(selector.vendor.vDeliveryTimeSettings.deliveryDaySwitch(day));
			await this.setAttributeValue(selector.vendor.vDeliveryTimeSettings.openingTime(day), 'value', deliveryTime.openingTime);
			await this.setAttributeValue(selector.vendor.vDeliveryTimeSettings.openingTimeHiddenInput(day), 'value', deliveryTime.openingTime);
			await this.setAttributeValue(selector.vendor.vDeliveryTimeSettings.closingTime(day), 'value', deliveryTime.closingTime);
			await this.setAttributeValue(selector.vendor.vDeliveryTimeSettings.closingTimeHiddenInput(day), 'value', deliveryTime.closingTime);
		}
		await this.click(selector.vendor.vDeliveryTimeSettings.deliveryTimeUpdateSettings);
		await expect(this.page.locator(selector.vendor.vDeliveryTimeSettings.deliveryTimeUpdateSettingsSuccessMessage)).toContainText(deliveryTime.saveSuccessMessage);
	}

	// vendor shipping settings

	// vendor set all shipping settings
	async setAllShippingSettings(): Promise<void> {
		await this.setShippingSettings(data.vendor.shipping.shippingMethods.flatRate);
		await this.setShippingSettings(data.vendor.shipping.shippingMethods.freeShipping);
		await this.setShippingSettings(data.vendor.shipping.shippingMethods.localPickup);
		await this.setShippingSettings(data.vendor.shipping.shippingMethods.tableRateShipping);
		await this.setShippingSettings(data.vendor.shipping.shippingMethods.distanceRateShipping);
	}

	// set shipping policies
	async setShippingPolicies(shippingPolicy: { processingTime: any; shippingPolicy: any; refundPolicy: any; saveSuccessMessage: any; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsShipping);
		await this.click(selector.vendor.vShippingSettings.shippingPolicies.clickHereToAddShippingPolicies);
		await this.selectByValue(selector.vendor.vShippingSettings.shippingPolicies.processingTime, shippingPolicy.processingTime);
		await this.clearAndType(selector.vendor.vShippingSettings.shippingPolicies.shippingPolicy, shippingPolicy.shippingPolicy);
		await this.type(selector.vendor.vShippingSettings.shippingPolicies.refundPolicy, shippingPolicy.refundPolicy);
		await this.click(selector.vendor.vShippingSettings.shippingPolicies.shippingPoliciesSaveSettings);
		await expect(this.page.locator(selector.vendor.vShippingSettings.updateSettingsSuccessMessage)).toContainText(shippingPolicy.saveSuccessMessage);
	}

	// vendor set shipping settings
	async setShippingSettings(shipping: {
		shippingZone: any; shippingCountry?: string; selectShippingMethod: any; shippingMethod: any; taxStatus?: any; shippingCost?: any; description?: any; calculationType?:
		any; saveSuccessMessage: any; freeShippingRequires?: string; freeShippingMinimumOrderAmount?: any; taxIncludedInShippingCosts?: any; handlingFee?: any; maximumShippingCost?: any; handlingFeePerOrder?:
		any; minimumCostPerOrder?: any; maximumCostPerOrder?: any; transportationMode?: any; avoid?: any; distanceUnit?: any; street1?: any; street2?: any; city?: any; zipCode?: any; state?: any; country?:
		any; shippingMethodSaveSuccessMessage?: any; zoneSaveSuccessMessage?: any; tableRateSaveSuccessMessage?: any; distanceRateSaveSuccessMessage?: any;
	}): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsShipping);
		// edit shipping zone
		await this.hover(selector.vendor.vShippingSettings.shippingZoneCell(shipping.shippingZone));
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vShippingSettings.editShippingZone(shipping.shippingZone));

		// add shipping method if not available
		const methodIsVisible = await this.isVisible(selector.vendor.vShippingSettings.shippingMethodCell(shipping.shippingMethod));
		if (!methodIsVisible) {
			await this.click(selector.vendor.vShippingSettings.addShippingMethod);
			await this.selectByValue(selector.vendor.vShippingSettings.shippingMethod, shipping.selectShippingMethod);
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vShippingSettings.shippingMethodPopupAddShippingMethod);
			await expect(this.page.getByText(shipping.shippingMethodSaveSuccessMessage)).toBeVisible();
			await expect(this.page.getByText(shipping.zoneSaveSuccessMessage)).toBeVisible();
		}
		// edit shipping method
		await this.hover(selector.vendor.vShippingSettings.shippingMethodCell(shipping.shippingMethod));
		await this.click(selector.vendor.vShippingSettings.editShippingMethod(shipping.shippingMethod));

		switch (shipping.selectShippingMethod) {
			// flat rate
			case 'flat_rate':
				await this.clearAndType(selector.vendor.vShippingSettings.flatRateMethodTitle, shipping.shippingMethod);
				await this.clearAndType(selector.vendor.vShippingSettings.flatRateCost, shipping.shippingCost);
				await this.selectByValue(selector.vendor.vShippingSettings.flatRateTaxStatus, shipping.taxStatus);
				await this.clearAndType(selector.vendor.vShippingSettings.flatRateDescription, shipping.description);
				await this.selectByValue(selector.vendor.vShippingSettings.flatRateCalculationType, shipping.calculationType);
				break;

			// free shipping
			case 'free_shipping':
				await this.clearAndType(selector.vendor.vShippingSettings.freeShippingTitle, shipping.shippingMethod);
				await this.clearAndType(selector.vendor.vShippingSettings.freeShippingMinimumOrderAmount, shipping.freeShippingMinimumOrderAmount);
				break;

			// local pickup
			case 'local_pickup':
				await this.clearAndType(selector.vendor.vShippingSettings.localPickupTitle, shipping.shippingMethod);
				await this.clearAndType(selector.vendor.vShippingSettings.localPickupCost, shipping.shippingCost);
				await this.selectByValue(selector.vendor.vShippingSettings.localPickupTaxStatus, shipping.taxStatus);
				await this.clearAndType(selector.vendor.vShippingSettings.flatRateDescription, shipping.description);
				break;

			// dokan table rate shipping
			case 'dokan_table_rate_shipping':
				await this.clearAndType(selector.vendor.vShippingSettings.tableRateShippingMethodTitle, shipping.shippingMethod);
				await this.selectByValue(selector.vendor.vShippingSettings.tableRateShippingTaxStatus, shipping.taxStatus);
				await this.selectByValue(selector.vendor.vShippingSettings.tableRateShippingTaxIncludedInShippingCosts, shipping.taxIncludedInShippingCosts);
				await this.clearAndType(selector.vendor.vShippingSettings.tableRateShippingHandlingFee, shipping.handlingFee);
				await this.clearAndType(selector.vendor.vShippingSettings.tableRateShippingMaximumShippingCost, shipping.maximumShippingCost);
				// rates
				// await this.selectByValue(selector.vendor.vShippingSettings.tableRateShippingCalculationType,  shipping.calculationType)
				await this.clearAndType(selector.vendor.vShippingSettings.tableRateShippingHandlingFeePerOrder, shipping.handlingFeePerOrder);
				await this.clearAndType(selector.vendor.vShippingSettings.tableRateShippingMinimumCostPerOrder, shipping.minimumCostPerOrder);
				await this.clearAndType(selector.vendor.vShippingSettings.tableRateShippingMaximumCostPerOrder, shipping.maximumCostPerOrder);
				await this.click(selector.vendor.vShippingSettings.tableRateShippingUpdateSettings);
				await expect(this.page.locator(selector.vendor.vShippingSettings.tableRateShippingUpdateSettingsSuccessMessage)).toContainText(shipping.tableRateSaveSuccessMessage);
				return;

			// dokan distance rate shipping
			case 'dokan_distance_rate_shipping':
				await this.clearAndType(selector.vendor.vShippingSettings.distanceRateShippingMethodTitle, shipping.shippingMethod);
				await this.selectByValue(selector.vendor.vShippingSettings.distanceRateShippingTaxStatus, shipping.taxStatus);
				await this.selectByValue(selector.vendor.vShippingSettings.distanceRateShippingTransportationMode, shipping.transportationMode);
				await this.selectByValue(selector.vendor.vShippingSettings.distanceRateShippingAvoid, shipping.avoid);
				await this.selectByValue(selector.vendor.vShippingSettings.distanceRateShippingDistanceUnit, shipping.distanceUnit);
				await this.check(selector.vendor.vShippingSettings.distanceRateShippingShowDistance);
				await this.check(selector.vendor.vShippingSettings.distanceRateShippingShowDuration);
				// shipping address
				await this.clearAndType(selector.vendor.vShippingSettings.distanceRateShippingAddress1, shipping.street1);
				await this.clearAndType(selector.vendor.vShippingSettings.distanceRateShippingAddress2, shipping.street2);
				await this.clearAndType(selector.vendor.vShippingSettings.distanceRateShippingCity, shipping.city);
				await this.clearAndType(selector.vendor.vShippingSettings.distanceRateShippingZipOrPostalCode, shipping.zipCode);
				await this.clearAndType(selector.vendor.vShippingSettings.distanceRateShippingStateOrProvince, shipping.state);
				await this.selectByValue(selector.vendor.vShippingSettings.distanceRateShippingCountry, shipping.country);
				await this.click(selector.vendor.vShippingSettings.distanceRateShippingUpdateSettings);
				await expect(this.page.locator(selector.vendor.vShippingSettings.distanceRateShippingUpdateSettingsSuccessMessage)).toContainText(shipping.distanceRateSaveSuccessMessage);
				return;

			default:
				break;
		}
		await this.click(selector.vendor.vShippingSettings.shippingSettingsSaveSettings);
		await this.click(selector.vendor.vShippingSettings.saveChanges);
		await expect(this.page.locator(selector.vendor.vShippingSettings.updateSettingsSuccessMessage)).toContainText(shipping.saveSuccessMessage);
	}

	// vendor set social profile settings
	async setSocialProfile(urls: { facebook: any; twitter: any; pinterest: any; linkedin: any; youtube: any; instagram: any; flickr: any; saveSuccessMessage?: string; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsSocialProfile);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.facebook, urls.facebook);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.twitter, urls.twitter);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.pinterest, urls.pinterest);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.linkedin, urls.linkedin);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.youtube, urls.youtube);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.instagram, urls.instagram);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.flicker, urls.flickr);
		// await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vSocialProfileSettings.updateSettings); //TODO: don't work, alternate soln. below line
		await this.pressOnSelector(selector.vendor.vSocialProfileSettings.updateSettings, data.key.enter)
		await expect(this.page.locator(selector.vendor.vSocialProfileSettings.updateSettingsSuccessMessage)).toContainText(urls.saveSuccessMessage);
	}

	// vendor set rma settings
	async setRmaSettings(rma: { label: any; type: any; rmaLength: any; lengthValue: any; lengthDuration: any; refundPolicyHtmlBody: any; saveSuccessMessage: any; }): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.settingsRma);
		await this.clearAndType(selector.vendor.vRmaSettings.label, rma.label);
		await this.selectByValue(selector.vendor.vRmaSettings.type, rma.type);
		await this.selectByValue(selector.vendor.vRmaSettings.length, rma.rmaLength);
		await this.clearAndType(selector.vendor.vRmaSettings.lengthValue, rma.lengthValue);
		await this.selectByValue(selector.vendor.vRmaSettings.lengthDuration, rma.lengthDuration);
		// check if refund reason exists
		const refundReasonIsVisible = await this.isVisible(selector.vendor.vRmaSettings.refundReasonsFirst); 
		if (refundReasonIsVisible) {
			await this.checkMultiple(selector.vendor.vRmaSettings.refundReasons);
		}
		await this.typeFrameSelector(selector.vendor.vRmaSettings.refundPolicyIframe, selector.vendor.vRmaSettings.refundPolicyHtmlBody, rma.refundPolicyHtmlBody);
		await this.clickAndWaitForResponse(data.subUrls.frontend.settingsRma, selector.vendor.vRmaSettings.rmaSaveChanges, 302);
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

	// add quantity discount
	async addQuantityDiscount(productName: any, minimumQuantity: string, discountPercentage: string): Promise<void> {
		await this.searchProduct(productName);
		await this.click(selector.vendor.product.productLink(productName));
		// add quantity discount
		await this.check(selector.vendor.product.enableBulkDiscount);
		await this.clearAndType(selector.vendor.product.lotMinimumQuantity, minimumQuantity);
		await this.clearAndType(selector.vendor.product.lotDiscountInPercentage, discountPercentage);
		await this.clickAndWaitForResponse(data.subUrls.frontend.product, selector.vendor.product.saveProduct, 302);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage.replace(/\s+/g, ' ').trim()).toMatch(data.product.createUpdateSaveSuccessMessage)
	}

	// vendor search product
	async searchProduct(productName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.product);
		//search product
		await this.clearAndType(selector.vendor.product.searchProduct, productName);
		await this.click(selector.vendor.product.search);
		await expect(this.page.locator(selector.vendor.product.productLink(productName))).toBeVisible();
	}

	// vendor override rma settings
	async overrideProductRmaSettings(productName: any, label: string, type: string, length: string, lengthValue: string, lengthDuration: string): Promise<void> {
		await this.searchProduct(productName);
		await this.click(selector.vendor.product.productLink(productName));
		// override rma settings
		await this.check(selector.vendor.product.overrideYourDefaultRmaSettingsForThisProduct);
		await this.clearAndType(selector.vendor.product.rmaLabel, label);
		await this.selectByValue(selector.vendor.product.rmaType, type);
		await this.selectByValue(selector.vendor.product.rmaLength, length);
		await this.clearAndType(selector.vendor.product.rmaLengthValue, lengthValue);
		await this.selectByValue(selector.vendor.product.rmaLengthDuration, lengthDuration);

		const refundReasonIsVisible = await this.isVisible(selector.vendor.product.refundReasons);
		if (refundReasonIsVisible) {
			// await this.clickAndWaitMultiple(selector.vendor.product.refundReasons)//TODO: update this
		}
		await this.clickAndWaitForResponse(data.subUrls.frontend.product, selector.vendor.product.saveProduct, 302);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage.replace(/\s+/g, ' ').trim()).toMatch(data.product.createUpdateSaveSuccessMessage)
	}

	// vendor change order status
	async changeOrderStatus(orderNumber: string, orderStatus: string): Promise<void> {
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
	async refundOrder(orderNumber: string, productName: string, partialRefund: boolean = false): Promise<void> {
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
			await this.clearAndType(selector.vendor.vOrders.refundProductCostAmount(productName), String(helpers.roundToTwo(productCost / 2)));
			await this.clearAndType(selector.vendor.vOrders.refundProductTaxAmount(productName), String(helpers.roundToTwo(productTax / 2)));
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
