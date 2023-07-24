import { Page, expect } from '@playwright/test';
import { BasePage } from 'pages/basePage';
import { LoginPage } from 'pages/loginPage';
import { AdminPage } from 'pages/adminPage';
import { CustomerPage } from 'pages/customerPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { helpers } from 'utils/helpers';
import { product, vendor, vendorSetupWizard  } from 'utils/interfaces';


const { DOKAN_PRO } = process.env;


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
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.dashboard);
	}

	// setup wizard

	// vendor registration
	async vendorRegister(vendorInfo: any, setupWizardData: vendorSetupWizard ): Promise<void> {
		await this.goToMyAccount();
		const loginIsVisible = await this.isVisible(selector.customer.cRegistration.regEmail);
		if (!loginIsVisible) {
			await this.loginPage.logout();
		}
		const username = vendorInfo.firstName() + vendorInfo.lastName();
		await this.clearAndType(selector.vendor.vRegistration.regEmail, username + data.vendor.vendorInfo.emailDomain);
		await this.clearAndType(selector.vendor.vRegistration.regPassword, vendorInfo.password);
		await this.focusAndClick(selector.vendor.vRegistration.regVendor);
		await this.waitForVisibleLocator(selector.vendor.vRegistration.firstName);
		await this.clearAndType(selector.vendor.vRegistration.firstName, username);
		await this.clearAndType(selector.vendor.vRegistration.lastName, vendorInfo.lastName());
		await this.clearAndType(selector.vendor.vRegistration.shopName, vendorInfo.shopName);
		// await this.clearAndType(selector.vendor.shopUrl, shopUrl)
		await this.click(selector.vendor.vRegistration.shopUrl);

		// fill address if enabled
		const addressInputIsVisible = await this.isVisible(selector.vendor.vRegistration.street1);
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
		await this.checkIfVisible(selector.customer.cDashboard.termsAndConditions);
		const subscriptionPackIsVisible = await this.isVisible(selector.vendor.vRegistration.subscriptionPack);
		if (subscriptionPackIsVisible) {
			await this.selectByLabel(selector.vendor.vRegistration.subscriptionPack, data.predefined.vendorSubscription.nonRecurring);
		}
		await this.click(selector.vendor.vRegistration.register);
		const registrationErrorIsVisible = await this.isVisible(selector.customer.cWooSelector.wooCommerceError);
		if (registrationErrorIsVisible) {
			const errorMessage = await this.hasText(selector.customer.cWooSelector.wooCommerceError, data.customer.registrationErrorMessage);
			if (errorMessage) {
				return; //TODO: Throw error message instead of return
			}
		}
		if (subscriptionPackIsVisible) {
			await this.customerPage.placeOrder('bank', false, true, false);
		}
		if(setupWizardData.choice){
			await this.vendorSetupWizard(setupWizardData);
		}
	}

	// vendor setup wizard
	async vendorSetupWizard(setupWizardData: vendorSetupWizard): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.setupWizard);
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
			await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.dashboard, selector.vendor.vSetup.goToStoreDashboard);
		} else {
			await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.dashboard, selector.vendor.vSetup.notRightNow);
		}
		await this.toBeVisible(selector.vendor.vDashboard.menus.dashboard);
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
	async addSimpleProduct(product: product['simple'] | product['simpleSubscription'] | product['external']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
		const productName = product.productName();
		// add new simple product
		await this.click(selector.vendor.product.addNewProduct);
		await this.waitForVisibleLocator(selector.vendor.product.productName);
		await this.type(selector.vendor.product.productName, productName);
		await this.type(selector.vendor.product.productPrice, product.regularPrice());
		await this.addCategory(product.category); // TODO: split in separate test
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.product.createProduct);
		const createdProduct = await this.getElementValue(selector.vendor.product.title);
		expect(createdProduct.toLowerCase()).toBe(productName.toLowerCase());
	}

	// vendor add variable product
	async addVariableProduct(product: product['variable'] ): Promise<void> {
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
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage?.replace(/\s+/g, ' ').trim()).toMatch(product.saveSuccessMessage);
	}

	// vendor add simple subscription product
	async addSimpleSubscription(product: product['simpleSubscription']): Promise<void> {
		await this.addSimpleProduct(product);
		// edit product
		await this.selectByValue(selector.vendor.product.productType, product.productType);
		await this.type(selector.vendor.product.subscriptionPrice, product.subscriptionPrice());
		await this.selectByValue(selector.vendor.product.subscriptionPeriodInterval, product.subscriptionPeriodInterval);
		await this.selectByValue(selector.vendor.product.subscriptionPeriod, product.subscriptionPeriod);
		await this.selectByValue(selector.vendor.product.expireAfter, product.expireAfter);
		await this.type(selector.vendor.product.subscriptionTrialLength, product.subscriptionTrialLength);
		await this.selectByValue(selector.vendor.product.subscriptionTrialPeriod, product.subscriptionTrialPeriod);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage?.replace(/\s+/g, ' ').trim()).toMatch(product.saveSuccessMessage);
	}

	// vendor add variable subscription product
	async addVariableSubscription(product: product['variableSubscription']): Promise<void> {
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
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);

		await this.waitForVisibleLocator(selector.vendor.product.updatedSuccessMessage);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage?.replace(/\s+/g, ' ').trim()).toMatch(product.saveSuccessMessage);
	}

	// vendor add external product
	async addExternalProduct(product: product['external']): Promise<void> {
		await this.addSimpleProduct(product);
		// edit product
		await this.selectByValue(selector.vendor.product.productType, product.productType);
		await this.type(selector.vendor.product.productUrl, await this.getBaseUrl() + product.productUrl);
		await this.type(selector.vendor.product.buttonText, product.buttonText);
		await this.clearAndType(selector.vendor.product.price, product.regularPrice());

		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage?.replace(/\s+/g, ' ').trim()).toMatch(product.saveSuccessMessage);
	}

	// vendor add auction product
	async addAuctionProduct(product: product['auction']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.auction);

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
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.productAuction, selector.vendor.vAuction.addAuctionProduct, 302);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage?.replace(/\s+/g, ' ').trim()).toMatch(product.saveSuccessMessage);
	}

	// vendor add booking product
	async addBookingProduct(product: product['booking']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);
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
		await this.selectByValue(selector.vendor.vBooking.calendarDisplayMode, product.calendarDisplayMode);
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
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.productBooking, selector.vendor.vBooking.saveProduct, 302);
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


	// withdraw

	// vendor request withdraw
	async requestWithdraw(withdraw: vendor['withdraw']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vWithdraw.cancelRequest);
		if (cancelRequestIsVisible) {
			this.cancelRequestWithdraw(withdraw);
			await this.clickAndWaitForNavigation(selector.vendor.vWithdraw.withdrawDashboard);
		}

		const minimumWithdrawAmount: number = helpers.price(await this.getElementText(selector.vendor.vWithdraw.minimumWithdrawAmount) as string);
		const balance: number = helpers.price(await this.getElementText(selector.vendor.vWithdraw.balance) as string);

		if (balance > minimumWithdrawAmount) {
			await this.click(selector.vendor.vWithdraw.requestWithdraw);
			await this.clearAndType(selector.vendor.vWithdraw.withdrawAmount, String(minimumWithdrawAmount));
			await this.selectByValue(selector.vendor.vWithdraw.withdrawMethod, withdraw.withdrawMethod.default);
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vWithdraw.submitRequest);
			await expect(this.page.getByText(selector.vendor.vWithdraw.withdrawRequestSaveSuccessMessage)).toBeVisible();
			await this.waitForNavigation(); // TODO: try to merge with above 2 line click and wait for response navigation and expect in between wait for response & navigation
		} else {
			// throw new Error("Vendor balance is less than minimum withdraw amount")
			console.log('Vendor balance is less than minimum withdraw amount');
			// TODO: Convert to expect error instead of console  log
			// expect(addNewProduct)).to.eventually.throw(AppError).with.property('code', "InvalidInput");
		}
	}

	// vendor cancel withdraw request
	async cancelRequestWithdraw(withdraw: vendor['withdraw']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vWithdraw.cancelRequest);
		if (!cancelRequestIsVisible) {
			this.requestWithdraw(withdraw);
		}
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.withdrawRequests, selector.vendor.vWithdraw.cancelRequest, 302);
		await expect(this.page.getByText(selector.vendor.vWithdraw.cancelWithdrawRequestSaveSuccessMessage)).toBeVisible();
	}

	// vendor add auto withdraw disbursement schedule
	async addAutoWithdrawDisbursementSchedule(withdraw: vendor['withdraw']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
		await this.enableSwitcherDisbursement(selector.vendor.vWithdraw.enableSchedule);
		await this.click(selector.vendor.vWithdraw.editSchedule);
		await this.selectByValue(selector.vendor.vWithdraw.preferredPaymentMethod, withdraw.preferredPaymentMethod);
		await this.click(selector.vendor.vWithdraw.preferredSchedule(withdraw.preferredSchedule));
		await this.selectByValue(selector.vendor.vWithdraw.onlyWhenBalanceIs, withdraw.minimumWithdrawAmount);
		await this.selectByValue(selector.vendor.vWithdraw.maintainAReserveBalance, withdraw.reservedBalance);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vWithdraw.changeSchedule);
		await expect(this.page.getByText(selector.vendor.vWithdraw.withdrawScheduleSaveSuccessMessage)).toBeVisible(); //TODO: find when invokes it
		// await expect(this.page.locator(selector.vendor.vWithdraw.scheduleMessage).filter({ hasText: 'text in column 1' })).toBeVisible();
		// let a = await this.page.locator(selector.vendor.vWithdraw.scheduleMessage).textContent();
		// console.log(a);
		// await expect(this.page.getByText(selector.vendor.vWithdraw.scheduleMessage)).not.toContainText(data.vendor.withdraw.scheduleMessageInitial);
	}

	// vendor add default withdraw payment methods
	async addDefaultWithdrawPaymentMethods(preferredSchedule: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
		const methodIsDefault = await this.isVisible(selector.vendor.vWithdraw.defaultMethod(preferredSchedule));
		if (!methodIsDefault) {
			// await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vWithdraw.customMethodMakeDefault(preferredSchedule));
			// await expect(this.page.getByText(selector.vendor.vWithdraw.defaultPaymentMethodUpdateSuccessMessage)).toBeVisible();
			// // await this.waitForNavigation()
			// await this.waitForUrl(data.subUrls.frontend.vDashboard.withdraw);
			await this.clickAndWaitForNavigation(selector.vendor.vWithdraw.customMethodMakeDefault(preferredSchedule)); //TODO: fix above soln
			await this.toBeVisible(selector.vendor.vWithdraw.defaultMethod(preferredSchedule));
		}
	}

	// vendor add vendor details
	async setVendorDetails(vendorInfo: any): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.editAccountVendor);
		await this.clearAndType(selector.vendor.vAccountDetails.firstName, vendorInfo.firstName());
		await this.clearAndType(selector.vendor.vAccountDetails.lastName, vendorInfo.lastName());
		// await this.clearAndType(selector.vendor.vAccountDetails.email, vendorInfo.email());
		// await this.updatePassword(vendorInfo.password, vendorInfo.password1);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.editAccountVendor, selector.vendor.vAccountDetails.saveChanges, 302);
		await expect(this.page.getByText(selector.vendor.vAccountDetails.editAccountSaveChangesSuccessMessage)).toBeVisible();

		// cleanup
		// await this.updatePassword(vendorInfo.password, vendorInfo.password1, true);
	}

	// vendor update password
	async updatePassword(currentPassword: string, newPassword: string, saveChanges = false): Promise<void> {
		await this.type(selector.vendor.vAccountDetails.currentPassword, currentPassword);
		await this.type(selector.vendor.vAccountDetails.NewPassword, newPassword);
		await this.type(selector.vendor.vAccountDetails.confirmNewPassword, newPassword);
		if (saveChanges){
			await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.editAccountVendor, selector.vendor.vAccountDetails.saveChanges, 302);
			await expect(this.page.getByText(selector.vendor.vAccountDetails.editAccountSaveChangesSuccessMessage)).toBeVisible();
		}
	}

	// vendor settings

	// vendor set store settings
	async setStoreSettings(vendorInfo: any): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);

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
		await this.toContainText(selector.vendor.vStoreSettings.updateSettingsSuccessMessage, vendorInfo.storeSettingsSaveSuccessMessage);

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
	async basicInfoSettings(vendorInfo: vendor['vendorInfo']): Promise<void> {
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
		const geoLocationEnabled = await this.isVisible(selector.vendor.vStoreSettings.map);
		if (geoLocationEnabled) {
			await this.typeAndWaitForResponse(data.subUrls.gmap, selector.vendor.vStoreSettings.map, mapLocation);
			await this.press(data.key.arrowDown);
			await this.press(data.key.enter);
		}
	}

	// vendor set terms and conditions settings
	async termsAndConditionsSettings(termsAndConditions: string): Promise<void> {
		// terms and conditions
		const tocEnabled = await this.isVisible(selector.vendor.vStoreSettings.termsAndConditions);
		if (tocEnabled) {
			await this.check(selector.vendor.vStoreSettings.termsAndConditions);
			await this.typeFrameSelector(selector.vendor.vStoreSettings.termsAndConditionsIframe, selector.vendor.vStoreSettings.termsAndConditionsHtmlBody, termsAndConditions);
		}
	}

	// vendor set opening closing time settings
	async openingClosingTimeSettings(openingClosingTime: vendor['vendorInfo']['openingClosingTime']): Promise<void> {
		// store opening closing time
		const openCloseTimeEnabled = await this.isVisible(selector.vendor.vStoreSettings.storeOpeningClosingTime);
		if (openCloseTimeEnabled) {
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
	}

	// vendor set vacation settings
	async vacationSettings(vacation: vendor['vendorInfo']['vacation']['datewise']): Promise<void> {

		// // delete pervious datewise vacation settings if any  //TODO: skip this not needed ,might use in delete test
		// const noVacationIsSetIsVisible = await this.isVisible(selector.vendor.vStoreSettings.noVacationIsSet);
		// if (!noVacationIsSetIsVisible) {
		// 	await this.hover(selector.vendor.vStoreSettings.vacationRow);
		// 	await this.click(selector.vendor.vStoreSettings.deleteSavedVacationSchedule);
		// 	await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vStoreSettings.confirmDeleteSavedVacationSchedule);
		// }
		const vacationModeEnabled = await this.isVisible(selector.vendor.vStoreSettings.goToVacation);
		if (vacationModeEnabled) {
			await this.check(selector.vendor.vStoreSettings.goToVacation);
			await this.selectByValue(selector.vendor.vStoreSettings.closingStyle, vacation.closingStyle);
			switch (vacation.closingStyle) {
			// instantly close
			case 'instantly' :
				await this.clearAndType(selector.vendor.vStoreSettings.setVacationMessageInstantly, vacation.vacationMessage);
				break;

			// datewise close
			case 'datewise' :{
				const vacationDayFrom = (vacation.vacationDayFrom()).split(',')[0] as string;
				const vacationDayTo = (vacation.vacationDayTo(vacationDayFrom)).split(',')[0] as string;
				await this.setAttributeValue(selector.vendor.vStoreSettings.vacationDateRangeFrom, 'value', vacationDayFrom);
				await this.setAttributeValue(selector.vendor.vStoreSettings.vacationDateRangeTo, 'value', vacationDayTo);
				await this.clearAndType(selector.vendor.vStoreSettings.setVacationMessageDatewise, vacation.vacationMessage);
				await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vStoreSettings.saveVacationEdit);
				break;
			}

			default :
				break;
			}
		}
	}

	// vendor set discount settings
	async discountSettings(discount: vendor['vendorInfo']['discount']): Promise<void> {
		// discount
		const discountEnabled = await this.isVisible(selector.vendor.vStoreSettings.enableStoreWideDiscount);
		if (discountEnabled) {
			await this.check(selector.vendor.vStoreSettings.enableStoreWideDiscount);
			await this.clearAndType(selector.vendor.vStoreSettings.minimumOrderAmount, discount.minimumOrderAmount);
			await this.clearAndType(selector.vendor.vStoreSettings.percentage, discount.minimumOrderAmountPercentage);
		}
	}

	// vendor set catalog mode settings
	async catalogModeSettings(): Promise<void> {
		// catalog mode
		const catalogModeEnabled = await this.isVisible(selector.vendor.vStoreSettings.removeAddToCartButton);
		if (catalogModeEnabled) {
			await this.check(selector.vendor.vStoreSettings.removeAddToCartButton);
			await this.checkIfVisible(selector.vendor.vStoreSettings.enableRequestQuoteSupport);
		}
	}

	// vendor set biography settings
	async biographySettings(biography: string): Promise<void> {
		// biography
		await this.typeFrameSelector(selector.vendor.vStoreSettings.biographyIframe, selector.vendor.vStoreSettings.biographyHtmlBody, biography);
	}

	// vendor set store support settings
	async storeSupportSettings(supportButtonText: string): Promise<void> {
		// store support
		const storeSupportEnabled = await this.isVisible(selector.vendor.vStoreSettings.removeAddToCartButton);
		if (storeSupportEnabled) {
			await this.check(selector.vendor.vStoreSettings.showSupportButtonInStore);
			await this.check(selector.vendor.vStoreSettings.showSupportButtonInSingleProduct);
			await this.clearAndType(selector.vendor.vStoreSettings.supportButtonText, supportButtonText);
		}
	}

	// vendor set minmax settings
	async minMaxSettings(minMax: vendor['vendorInfo']['minMax']): Promise<void> {
		// min-max
		const minMaxEnabled = await this.isVisible(selector.vendor.vStoreSettings.enableMinMaxQuantities);
		if (minMaxEnabled) {
			await this.check(selector.vendor.vStoreSettings.enableMinMaxQuantities);
			await this.clearAndType(selector.vendor.vStoreSettings.minimumProductQuantityToPlaceAnOrder, minMax.minimumProductQuantity);
			await this.clearAndType(selector.vendor.vStoreSettings.maximumProductQuantityToPlaceAnOrder, minMax.maximumProductQuantity);
			await this.check(selector.vendor.vStoreSettings.enableMinMaxAmount);
			await this.clearAndType(selector.vendor.vStoreSettings.minimumAmountToPlaceAnOrder, minMax.minimumAmount);
			await this.clearAndType(selector.vendor.vStoreSettings.maximumAmountToPlaceAnOrder, minMax.maximumAmount);
			await this.click(selector.vendor.vStoreSettings.clear);
			await this.click(selector.vendor.vStoreSettings.selectAll);
			const multipleCategory = await this.isVisible(selector.vendor.vStoreSettings.selectCategorySearch);
			if (multipleCategory){
				await this.select2ByTextMultiSelector(selector.vendor.vStoreSettings.selectCategorySearch, selector.vendor.vStoreSettings.selectCategorySearchedResult, minMax.category);
			}else {
				await this.selectByLabel(selector.vendor.vStoreSettings.selectCategory, minMax.category);
			}
		}
	}

	// vendor set store address
	async setStoreAddress(vendorInfo: vendor['vendorInfo']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
		// store address
		await this.clearAndType(selector.vendor.vStoreSettings.street, vendorInfo.street1);
		await this.clearAndType(selector.vendor.vStoreSettings.street2, vendorInfo.street2);
		await this.clearAndType(selector.vendor.vStoreSettings.city, vendorInfo.city);
		await this.clearAndType(selector.vendor.vStoreSettings.postOrZipCode, vendorInfo.zipCode);
		await this.selectByValue(selector.vendor.vStoreSettings.country, vendorInfo.countrySelectValue);
		await this.selectByValue(selector.vendor.vStoreSettings.state, vendorInfo.stateSelectValue);
		// update settings
		await this.click(selector.vendor.vStoreSettings.updateSettings);
		await this.toContainText(selector.vendor.vStoreSettings.updateSettingsSuccessMessage, vendorInfo.storeSettingsSaveSuccessMessage);
	}

	// vendor add addons
	async addAddon(addon: vendor['addon']): Promise<string> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);

		// add addon
		const addonName = addon.name();
		await this.click(selector.vendor.vAddonSettings.createNewAddon);
		await this.clearAndType(selector.vendor.vAddonSettings.name, addonName);
		await this.clearAndType(selector.vendor.vAddonSettings.priority, addon.priority);
		// await this.click(selector.vendor.vAddonSettings.productCategories,); // commented for issue with buy product, or delete any previous addon before create one
		// await this.type(selector.vendor.vAddonSettings.productCategories, addon.category);
		// await this.press(data.key.enter);
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

		await this.toContainText(selector.vendor.vAddonSettings.addonUpdateSuccessMessage, addon.saveSuccessMessage);
		return addonName;
	}

	// vendor edit addons
	async editAddon(addon: vendor['addon'], addonName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsAddon);
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
		await this.toContainText(selector.vendor.vAddonSettings.addonUpdateSuccessMessage, addon.saveSuccessMessage);
	}

	// vendor set payment settings
	async setPaymentSettings(payment: vendor['payment']): Promise<void> {
		await this.setPaypal(payment);
		await this.setBankTransfer(payment);
		await this.setCustom(payment);
		await this.setSkrill(payment);
		// await this.setStripe()
		// await this.setPaypalMarketPlace()
		// await this.setRazorpay()

	}

	// paypal payment settings
	async setPaypal(paymentMethod: vendor['payment']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.paypal);
		//paypal
		await this.clearAndType(selector.vendor.vPaymentSettings.paypal, paymentMethod.email());
		// update settings
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.updateSettings);
		await this.toContainText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
	}

	// bank transfer payment settings
	async setBankTransfer(paymentMethod: vendor['payment']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.bankTransfer);
		// bank transfer
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

		// update settings
		// await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.updateSettings);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.addAccount);
		await this.toContainText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
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
	async setCustom(paymentMethod: vendor['payment']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.customPayment);
		// custom payment method
		await this.clearAndType(selector.vendor.vPaymentSettings.customPayment, paymentMethod.email());
		// update settings
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.updateSettings);
		await this.toContainText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
	}

	// skrill Payment Settings
	async setSkrill(paymentMethod: vendor['payment']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.skrill);
		// skrill
		await this.clearAndType(selector.vendor.vPaymentSettings.skrill, paymentMethod.email());
		// update settings
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vPaymentSettings.updateSettings);
		await this.toContainText(selector.vendor.vPaymentSettings.updateSettingsSuccessMessage, paymentMethod.saveSuccessMessage);
	}

	// vendor send id verification request
	async sendIdVerificationRequest(verification: vendor['verification']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

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
		await this.toContainText(selector.vendor.vVerificationSettings.idUpdateSuccessMessage, verification.idRequestSubmitSuccessMessage);
	}

	// vendor send address verification request
	async sendAddressVerificationRequest(verification: vendor['verification']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);
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
		await this.toContainText(selector.vendor.vVerificationSettings.addressUpdateSuccessMessage, verification.addressRequestSubmitSuccessMessage);
	}

	// vendor send company verification request
	async sendCompanyVerificationRequest(verification: vendor['verification']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);
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
		await this.toContainText(selector.vendor.vVerificationSettings.companyInfoUpdateSuccessMessage, verification.companyRequestSubmitSuccessMessage);
	}

	// upload media
	async uploadMedia(file: string) { //TODO: move uploadMedia to base page, try to make only one function for media upload for whole project
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
	async setVerificationSettings(verification: vendor['verification']): Promise<void> {
		await this.sendIdVerificationRequest(verification);
		await this.sendAddressVerificationRequest(verification);
		await this.sendCompanyVerificationRequest(verification);
	}

	// vendor set delivery settings
	async setDeliveryTimeSettings(deliveryTime: vendor['deliveryTime']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsDeliveryTime);
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
		await this.toContainText(selector.vendor.vDeliveryTimeSettings.deliveryTimeUpdateSettingsSuccessMessage, deliveryTime.saveSuccessMessage);
	}

	// vendor shipping settings

	// vendor set all shipping settings
	// async setAllShippingSettings(): Promise<void> {
	// 	await this.setShippingSettings(data.vendor.shipping.shippingMethods.flatRate);
	// 	await this.setShippingSettings(data.vendor.shipping.shippingMethods.freeShipping);
	// 	await this.setShippingSettings(data.vendor.shipping.shippingMethods.localPickup);
	// 	await this.setShippingSettings(data.vendor.shipping.shippingMethods.tableRateShipping);
	// 	await this.setShippingSettings(data.vendor.shipping.shippingMethods.distanceRateShipping);
	// }

	// set shipping policies
	async setShippingPolicies(shippingPolicy: vendor['shipping']['shippingPolicy']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipping);
		await this.click(selector.vendor.vShippingSettings.shippingPolicies.clickHereToAddShippingPolicies);
		await this.selectByValue(selector.vendor.vShippingSettings.shippingPolicies.processingTime, shippingPolicy.processingTime);
		await this.clearAndType(selector.vendor.vShippingSettings.shippingPolicies.shippingPolicy, shippingPolicy.shippingPolicy);
		await this.type(selector.vendor.vShippingSettings.shippingPolicies.refundPolicy, shippingPolicy.refundPolicy);
		await this.click(selector.vendor.vShippingSettings.shippingPolicies.shippingPoliciesSaveSettings);
		await this.toContainText(selector.vendor.vShippingSettings.updateSettingsSuccessMessage, shippingPolicy.saveSuccessMessage);
	}

	// vendor set shipping settings
	async setShippingSettings(shipping: any): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipping);
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
		case 'flat_rate' :
			await this.clearAndType(selector.vendor.vShippingSettings.flatRateMethodTitle, shipping.shippingMethod);
			await this.clearAndType(selector.vendor.vShippingSettings.flatRateCost, shipping.shippingCost);
			await this.selectByValue(selector.vendor.vShippingSettings.flatRateTaxStatus, shipping.taxStatus);
			await this.clearAndType(selector.vendor.vShippingSettings.flatRateDescription, shipping.description);
			await this.selectByValue(selector.vendor.vShippingSettings.flatRateCalculationType, shipping.calculationType);
			break;

			// free shipping
		case 'free_shipping' :
			await this.clearAndType(selector.vendor.vShippingSettings.freeShippingTitle, shipping.shippingMethod);
			await this.clearAndType(selector.vendor.vShippingSettings.freeShippingMinimumOrderAmount, shipping.freeShippingMinimumOrderAmount);
			break;

			// local pickup
		case 'local_pickup' :
			await this.clearAndType(selector.vendor.vShippingSettings.localPickupTitle, shipping.shippingMethod);
			await this.clearAndType(selector.vendor.vShippingSettings.localPickupCost, shipping.shippingCost);
			await this.selectByValue(selector.vendor.vShippingSettings.localPickupTaxStatus, shipping.taxStatus);
			await this.clearAndType(selector.vendor.vShippingSettings.flatRateDescription, shipping.description);
			break;

			// dokan table rate shipping
		case 'dokan_table_rate_shipping' :
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
			await this.toContainText(selector.vendor.vShippingSettings.tableRateShippingUpdateSettingsSuccessMessage, shipping.tableRateSaveSuccessMessage);
			return;

			// dokan distance rate shipping
		case 'dokan_distance_rate_shipping' :
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
			await this.toContainText(selector.vendor.vShippingSettings.distanceRateShippingUpdateSettingsSuccessMessage, shipping.distanceRateSaveSuccessMessage);
			return;

		default :
			break;
		}
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vShippingSettings.shippingSettingsSaveSettings);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vShippingSettings.saveChanges);
		await this.toContainText(selector.vendor.vShippingSettings.updateSettingsSuccessMessage, shipping.saveSuccessMessage);
	}

	// vendor set social profile settings
	async setSocialProfile(urls: vendor['socialProfileUrls']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSocialProfile);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.facebook, urls.facebook);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.twitter, urls.twitter);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.pinterest, urls.pinterest);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.linkedin, urls.linkedin);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.youtube, urls.youtube);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.instagram, urls.instagram);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.flickr, urls.flickr);
		// await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vSocialProfileSettings.updateSettings); //TODO: don't work, alternate soln. below line
		await this.pressOnSelector(selector.vendor.vSocialProfileSettings.updateSettings, data.key.enter);
		await this.toContainText(selector.vendor.vSocialProfileSettings.updateSettingsSuccessMessage, urls.saveSuccessMessage);
	}

	// vendor set rma settings
	async setRmaSettings(rma: vendor['rma']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsRma);
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
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.settingsRma, selector.vendor.vRmaSettings.rmaSaveChanges, 302);
		await expect(this.page.getByText(rma.saveSuccessMessage)).toBeVisible();
	}

	// vendor functions

	// vendor approve product review
	async approveProductReview(reviewMessage: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.reviews);
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
		await this.toBeVisible(selector.vendor.vReviews.reviewRow(reviewMessage));
	}

	// vendor approve return request
	async approveReturnRequest(orderId: string, productName: string): Promise<void> {
		await this.goToVendorDashboard();
		await this.click(selector.vendor.vDashboard.menus.returnRequest);
		await this.click(selector.vendor.vReturnRequest.view(orderId));
		// change order status to refund
		await this.selectByValue(selector.vendor.vReturnRequest.changeOrderStatus, 'processing');
		// await this.alert('accept')
		await this.acceptAlert();
		await this.click(selector.vendor.vReturnRequest.updateOrderStatus);
		// refund request
		await this.click(selector.vendor.vReturnRequest.sendRefund);
		const tax = String(helpers.price(await this.getElementText(selector.vendor.vReturnRequest.taxAmount(productName)) as string));
		const subTotal = String(helpers.price(await this.getElementText(selector.vendor.vReturnRequest.subTotal(productName)) as string));
		await this.type(selector.vendor.vReturnRequest.taxRefund, tax);
		await this.type(selector.vendor.vReturnRequest.subTotalRefund, subTotal);
		await this.click(selector.vendor.vReturnRequest.sendRequest);

		// const successMessage = await this.getElementText(selector.vendor.vReturnRequest.sendRequestSuccessMessage);
		// expect(successMessage).toMatch('Already send refund request. Wait for admin approval');
		await this.toContainText(selector.vendor.vReturnRequest.sendRequestSuccessMessage, 'Already send refund request. Wait for admin approval' );
	}

	// delete return request
	async deleteReturnRequest(orderId: string): Promise<void> {
		await this.goToVendorDashboard();
		await this.click(selector.vendor.vDashboard.menus.returnRequest);
		await this.hover(selector.vendor.vReturnRequest.returnRequestCell(orderId));
		await this.click(selector.vendor.vReturnRequest.delete(orderId));
		const successMessage = await this.getElementText(selector.customer.cWooSelector.wooCommerceSuccessMessage);
		expect(successMessage).toMatch('Return Request has been deleted successfully');
	}

	// add quantity discount
	async addQuantityDiscount(productName: string, minimumQuantity: string, discountPercentage: string): Promise<void> {
		await this.searchProduct(productName);
		await this.click(selector.vendor.product.productLink(productName));
		// add quantity discount
		await this.check(selector.vendor.product.enableBulkDiscount);
		await this.clearAndType(selector.vendor.product.lotMinimumQuantity, minimumQuantity);
		await this.clearAndType(selector.vendor.product.lotDiscountInPercentage, discountPercentage);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage?.replace(/\s+/g, ' ').trim()).toMatch(data.product.createUpdateSaveSuccessMessage);
	}


	// vendor override rma settings
	async overrideProductRmaSettings(productName: string, label: string, type: string, length: string, lengthValue: string, lengthDuration: string): Promise<void> {
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
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage?.replace(/\s+/g, ' ').trim()).toMatch(data.product.createUpdateSaveSuccessMessage);
	}

	// vendor change order status
	async changeOrderStatus(orderNumber: string, orderStatus: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);
		//change order status
		await this.click(selector.vendor.orders.orderLink(orderNumber));
		await this.click(selector.vendor.orders.edit);
		await this.selectByValue(selector.vendor.orders.orderStatus, orderStatus);
		await this.click(selector.vendor.orders.updateOrderStatus);
		const currentOrderStatus = await this.getElementText(selector.vendor.orders.currentOrderStatus);
		expect(currentOrderStatus?.toLowerCase()).toMatch((orderStatus.replace(/(^wc)|(\W)/g, '')).toLowerCase());
	}

	// // vendor refund order
	// async refundOrder(orderNumber: string, productName: string, partialRefund = false): Promise<void> {
	// 	await this.goToVendorDashboard();
	// 	await this.click(selector.vendor.vDashboard.orders);
	// 	await this.click(selector.vendor.orders.orderLink(orderNumber));

	// 	//request refund
	// 	await this.click(selector.vendor.orders.requestRefund);
	// 	const productQuantity = await this.getElementText(selector.vendor.orders.productQuantity(productName));
	// 	const productCost = helpers.price(await this.getElementText(selector.vendor.orders.productCost(productName)));
	// 	const productTax = helpers.price(await this.getElementText(selector.vendor.orders.productTax(productName)));
	// 	await this.type(selector.vendor.orders.refundProductQuantity(productName), productQuantity);
	// 	if (partialRefund) {
	// 		await this.click(selector.vendor.orders.refundDiv);
	// 		await this.clearAndType(selector.vendor.orders.refundProductCostAmount(productName), String(helpers.roundToTwo(productCost / 2)));
	// 		await this.clearAndType(selector.vendor.orders.refundProductTaxAmount(productName), String(helpers.roundToTwo(productTax / 2)));
	// 	}
	// 	await this.type(selector.vendor.orders.refundReason, 'Defective product');
	// 	await this.click(selector.vendor.orders.refundManually);
	// 	await this.click(selector.vendor.orders.confirmRefund);

	// 	// const successMessage = await this.getElementText(selector.vendor.orders.refundRequestSuccessMessage);
	// 	// expect(successMessage).toMatch('Refund request submitted.');
	// await this.toContainText(selector.vendor.orders.refundRequestSuccessMessage, 'Refund request submitted.');
	// 	await this.click(selector.vendor.orders.refundRequestSuccessMessageOk);
	// }

	// get order details vendor
	// async getOrderDetails(orderNumber): Promise<object> {
	//     await this.goToVendorDashboard()
	//     await this.click(selector.vendor.vDashboard.orders)
	//     let vOrderDetails = {}
	//     vOrderDetails.vendorEarning = helpers.price(await this.getElementText(selector.vendor.orders.vendorEarningTable(orderNumber)))

	//     await this.click(selector.vendor.orders.orderLink(orderNumber))
	//     vOrderDetails.orderNumber = (await this.getElementText(selector.vendor.orders.orderNumber)).split('#')[1]
	//     let refundedOrderTotalIsVisible = await this.isVisible(selector.vendor.orders.orderTotalAfterRefund)
	//     if (refundedOrderTotalIsVisible) {
	//         vOrderDetails.orderTotalBeforeRefund = helpers.price(await this.getElementText(selector.vendor.orders.orderTotalBeforeRefund))
	//         vOrderDetails.orderTotal = helpers.price(await this.getElementText(selector.vendor.orders.orderTotalAfterRefund))
	//     } else {
	//         vOrderDetails.orderTotal = helpers.price(await this.getElementText(selector.vendor.orders.orderTotal))
	//     }
	//     vOrderDetails.orderStatus = (await this.getElementText(selector.vendor.orders.currentOrderStatus)).replace('-', ' ')
	//     let orderDate = (await this.getElementText(selector.vendor.orders.orderDate)).split(':')[1].trim()
	//     vOrderDetails.orderDate = orderDate.substring(0, orderDate.indexOf(',', orderDate.indexOf(',') + 1))
	//     vOrderDetails.discount = helpers.price(await this.getElementText(selector.vendor.orders.discount))
	//     let shippingMethodIsVisible = await this.isVisible(selector.vendor.orders.shippingMethod)
	//     if (shippingMethodIsVisible) vOrderDetails.shippingMethod = await this.getElementText(selector.vendor.orders.shippingMethod)
	//     vOrderDetails.shippingCost = helpers.price(await this.getElementText(selector.vendor.orders.shippingCost))
	//     let taxIsVisible = await this.isVisible(selector.vendor.orders.tax)
	//     if (taxIsVisible) vOrderDetails.tax = helpers.price(await this.getElementText(selector.vendor.orders.tax))
	//     vOrderDetails.refunded = helpers.price(await this.getElementText(selector.vendor.orders.refunded))

	//     return vOrderDetails
	// }

	// get total vendor earnings

	// async getTotalVendorEarning(): Promise<number> {
	// 	await this.goToVendorDashboard();
	// 	return helpers.price(await this.getElementText(selector.vendor.vDashboard.earning));
	// }


	// visit store
	async visitStore(storeName: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.dashboard);
		// ensure page suppose to open on new tab
		await this.toHaveAttribute(selector.vendor.vDashboard.menus.visitStore, 'target', '_blank');
		// force page to open on same tab
		await this.setAttributeValue(selector.vendor.vDashboard.menus.visitStore, 'target', '_self' );
		await this.click(selector.vendor.vDashboard.menus.visitStore);
		await expect(this.page).toHaveURL(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)) + '/');
	}


	//products


	// products render properly
	async vendorProductsRenderProperly(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

		// product nav menus are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { draft, pendingReview, ...menus } = selector.vendor.product.menus;
		await this.multipleElementVisible(menus);

		// add new product is visible
		await this.toBeVisible(selector.vendor.product.addNewProduct);

		// import export is visible
		DOKAN_PRO && await this.multipleElementVisible(selector.vendor.product.importExport);

		// product filters elements are visible
		// await this.multipleElementVisible(selector.vendor.product.filters); //TODO: issue not fixed yet

		// product search elements are visible
		await this.multipleElementVisible(selector.vendor.product.search);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.vendor.product.bulkActions);

		// table elements are visible
		await this.multipleElementVisible(selector.vendor.product.table);

	}

	//TODO: import product


	// export product
	async exportProducts(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.frontend.vDashboard.csvExport, selector.vendor.product.importExport.export );
		//TODO:
	}


	// search product
	async searchProduct(productName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

		await this.clearAndType(selector.vendor.product.search.searchInput, productName);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.search.searchBtn);
		await this.toBeVisible(selector.vendor.product.productLink(productName));
	}


	// filter products
	async filterProducts(filterType: string, value: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

		switch(filterType){

		case 'by-date' :
			await this.selectByNumber(selector.vendor.product.filters.filterByDate, value);
			break;

		case 'by-category' :
			await this.selectByLabel(selector.vendor.product.filters.filterByCategory, value);
			break;

		case 'by-type' :
			await this.selectByValue(selector.vendor.product.filters.filterByType, value);
			break;

		case 'by-other' :
			await this.selectByValue(selector.vendor.product.filters.filterByOther, value);
			break;

		default :
			break;
		}

		// await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.filters.filter);
		await this.clickAndWaitForNavigation( selector.vendor.product.filters.filter);
		await this.notToHaveCount(selector.vendor.product.numberOfRows, 0);

	}


	// view product
	async viewProduct(productName: string): Promise<void> {
		await this.searchProduct(productName);
		await this.hover(selector.vendor.product.productCell(productName));
		await this.clickAndWaitForNavigation(selector.vendor.product.view);
		await expect(this.page).toHaveURL(data.subUrls.frontend.productDetails(helpers.slugify(productName)) + '/');
	}


	// edit product
	async editProduct(product: product['simple']): Promise<void> {
		await this.searchProduct(product.editProduct);
		await this.hover(selector.vendor.product.productCell(product.editProduct));
		await this.clickAndWaitForNavigation(selector.vendor.product.editProduct);

		await this.clearAndType(selector.vendor.product.title, product.productName());
		await this.clearAndType(selector.vendor.product.price, product.regularPrice());
		//TODO: add more fields

		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		await this.toContainText(selector.vendor.product.dokanMessage, 'The product has been saved successfully. ');
	}


	// quick edit product
	async quickEditProduct(product: product['simple']): Promise<void> {
		await this.searchProduct(product.editProduct);
		await this.hover(selector.vendor.product.productCell(product.editProduct));
		await this.click(selector.vendor.product.quickEdit);

		await this.clearAndType(selector.vendor.product.title, product.productName());
		//TODO: add more fields

		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.product.saveProduct);

	}


	// duplicate product
	async duplicateProduct(productName: string): Promise<void> {
		await this.searchProduct(productName);
		await this.hover(selector.vendor.product.productCell(productName));
		await this.clickAndWaitForNavigation(selector.vendor.product.duplicate);
		await this.toContainText(selector.vendor.product.dokanSuccessMessage, 'Product succesfully duplicated');

	}


	// permanently delete product
	async permanentlyDeleteProduct(productName: string): Promise<void> {
		await this.searchProduct(productName);
		await this.hover(selector.vendor.product.productCell(productName));
		await this.click(selector.vendor.product.permanentlyDelete);
		await this.clickAndWaitForNavigation(selector.vendor.product.confirmAction);
		await this.toContainText(selector.vendor.product.dokanSuccessMessage, 'Product successfully deleted');

	}


	// product bulk action
	async productBulkAction(action: string, productName?: string): Promise<void> {
		if(productName){
			await this.searchProduct(productName);  //TODO: use search like this for all
		} else {
			await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
		}

		await this.click(selector.vendor.product.bulkActions.selectAll);
		switch(action){

		case 'edit' :
			await this.selectByValue(selector.vendor.product.bulkActions.selectAction, 'edit');
			//TODO:
			break;

		case 'permanently-delete' :
			await this.selectByValue(selector.vendor.product.bulkActions.selectAction, 'permanently-delete');
			break;

		case 'publish' :
			await this.selectByValue(selector.vendor.product.bulkActions.selectAction, 'publish');
			break;

		default :
			break;
		}

		await this.clickAndAcceptAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.bulkActions.applyAction);
		//TODO:
	}


	// orders


	// orders render properly
	async vendorOrdersRenderProperly(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

		// order nav menus are visible
		await this.multipleElementVisible(selector.vendor.orders.menus);

		// export elements are visible
		await this.multipleElementVisible(selector.vendor.orders.export);

		// order filters elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { filterByCustomer,  ...filters } = selector.vendor.orders.filters;
		await this.multipleElementVisible(filters); //todo: add dropdown selector

		// order search elements are visible
		await this.multipleElementVisible(selector.vendor.orders.search);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.vendor.orders.bulkActions);

		// table elements are visible
		await this.multipleElementVisible(selector.vendor.orders.table);
	}


	// export product
	async exportOrders(type: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

		switch(type){

		case 'all' :
			await this.clickAndAcceptAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, selector.vendor.orders.export.exportAll );
			break;

		case 'filtered' :
			await this.clickAndAcceptAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, selector.vendor.orders.export.exportFiltered );
			break;

		default :
			break;
		}
	}


	// search order
	async searchOrder(orderNumber: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

		await this.clearAndType(selector.vendor.orders.search.searchInput, orderNumber);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, selector.vendor.orders.search.searchBtn);
		await this.toBeVisible(selector.vendor.orders.orderLink(orderNumber));
	}


	// filter orders
	async filterOrders(filterType: string, value: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

		switch(filterType){

		case 'by-customer' :
			await this.click(selector.vendor.orders.filters.filterByCustomer.dropDown);
			await this.typeAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.filters.filterByCustomer.input, value);
			await this.click(selector.vendor.orders.filters.filterByCustomer.searchedResult);
			break;

		case 'by-date' :
			// await this.selectByLabel(selector.vendor.orders.filters.filterByDate, value); //TODO
			break;

		default :
			break;
		}

		// await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.filters.filter);
		await this.clickAndWaitForNavigation( selector.vendor.orders.filters.filter);
		await this.notToHaveCount(selector.vendor.orders.numberOfRows, 0);

	}


	// view order
	async viewOrder(orderNumber: string): Promise<void> {
		await this.searchOrder(orderNumber);
		await this.clickAndWaitForNavigation(selector.vendor.orders.view(orderNumber));
		await this.toContainText(selector.vendor.orders.orderNumber, orderNumber);
	}


	// update order status
	async updateOrderStatusOnTable(orderNumber: string, status: string): Promise<void> {
		await this.searchOrder(orderNumber);
		switch(status){

		case 'processing' :
			await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.processing(orderNumber), 302);
			await this.notToBeVisible(selector.vendor.orders.processing(orderNumber));
			break;

		case 'complete' :
			await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.complete(orderNumber), 302);
			await this.notToBeVisible(selector.vendor.orders.complete(orderNumber));
			break;

		default :
			break;
		}
	}


	// update order status
	async updateOrderStatus(orderNumber: string, status: string): Promise<void> {
		await this.viewOrder(orderNumber);
		await this.click(selector.vendor.orders.edit);
		await this.selectByValue(selector.vendor.orders.orderStatus, status);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.orders.updateOrderStatus);
		const currentStatus = await this.getElementText( selector.vendor.orders.currentOrderStatus);
		expect(currentStatus?.toLowerCase()).toBe(status.split('-').pop());
	}


	// order bulk action
	async orderBulkAction(action: string, orderNumber?: string): Promise<void> {
		if(orderNumber){
			await this.searchOrder(orderNumber);  //TODO: use search like this for all
		} else {
			await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);
		}

		await this.click(selector.vendor.orders.bulkActions.selectAll);
		switch(action){

		case 'onhold' :
			await this.selectByValue(selector.vendor.orders.bulkActions.selectAction, 'wc-on-hold');
			break;

		case 'processing' :
			await this.selectByValue(selector.vendor.orders.bulkActions.selectAction, 'wc-processing');
			break;

		case 'completed' :
			await this.selectByValue(selector.vendor.orders.bulkActions.selectAction, 'wc-completed');
			break;

		default :
			break;
		}

		await this.clickAndAcceptAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, selector.vendor.orders.bulkActions.applyAction);
		//TODO:
	}


}
