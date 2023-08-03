import { Page, expect } from '@playwright/test';
import { BasePage } from 'pages/basePage';
import { LoginPage } from 'pages/loginPage';
import { AdminPage } from 'pages/adminPage';
import { CustomerPage } from 'pages/customerPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { helpers } from 'utils/helpers';
import { product, vendor, vendorSetupWizard } from 'utils/interfaces';


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
				return; //todo:  Throw error message instead of return
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
			// map
			const geoLocationEnabled = await this.isVisible(selector.vendor.vSetup.map);
			if (geoLocationEnabled) {
				await this.typeAndWaitForResponse(data.subUrls.gmap, selector.vendor.vSetup.map, setupWizardData.mapLocation);
				await this.press(data.key.arrowDown);
				await this.press(data.key.enter);
			}

			await this.check(selector.vendor.vSetup.email);
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
		//todo:  handle multiple category selection with assertion
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
		await this.addCategory(product.category); //todo:  split in separate test
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
		await this.type(selector.vendor.product.productUrl, this.getBaseUrl() + product.productUrl);
		await this.type(selector.vendor.product.buttonText, product.buttonText);
		await this.clearAndType(selector.vendor.product.price, product.regularPrice());

		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage?.replace(/\s+/g, ' ').trim()).toMatch(product.saveSuccessMessage);
	}


	// vendor search similar product
	async searchSimilarProduct(productName: string): Promise<void> {
		await this.click(selector.vendor.vSearchSimilarProduct.search);
		await this.type(selector.vendor.vSearchSimilarProduct.search, productName);
		await this.click(selector.vendor.vSearchSimilarProduct.search);
		await this.click(selector.vendor.vSearchSimilarProduct.search);
		//todo:  add assertion
	}


	// vendor add vendor details
	async setVendorDetails(vendorInfo: any): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.editAccountVendor);
		await this.clearAndType(selector.vendor.vAccountDetails.firstName, vendorInfo.firstName());
		await this.clearAndType(selector.vendor.vAccountDetails.lastName, vendorInfo.lastName());
		// await this.clearAndType(selector.vendor.vAccountDetails.email, vendorInfo.email());
		// await this.updatePassword(vendorInfo.password, vendorInfo.password1);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.editAccountVendor, selector.vendor.vAccountDetails.saveChanges, 302);
		await expect(this.page.getByText(selector.vendor.vAccountDetails.saveSuccessMessage)).toBeVisible();

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
			await expect(this.page.getByText(selector.vendor.vAccountDetails.saveSuccessMessage)).toBeVisible();
		}
	}


	// vendor settings

	async updateStoreMapViaSettingsSave() {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vStoreSettings.updateSettings);
		await this.toContainText(selector.vendor.vStoreSettings.updateSettingsSuccessMessage, 'Your information has been saved successfully');
	}


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
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vStoreSettings.updateSettings);
		await this.toContainText(selector.vendor.vStoreSettings.updateSettingsSuccessMessage, vendorInfo.storeSettingsSaveSuccessMessage);

	}


	// vendor set banner and profile picture settings
	// async bannerAndProfilePictureSettings(banner: string, profilePicture: string): Promise<void> { //todo:  fix
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
		await this.clearAndType(selector.vendor.vStoreSettings.address.street, vendorInfo.street1);
		await this.clearAndType(selector.vendor.vStoreSettings.address.street2, vendorInfo.street2);
		await this.clearAndType(selector.vendor.vStoreSettings.address.city, vendorInfo.city);
		await this.clearAndType(selector.vendor.vStoreSettings.address.postOrZipCode, vendorInfo.zipCode);
		await this.selectByValue(selector.vendor.vStoreSettings.address.country, vendorInfo.countrySelectValue);
		await this.selectByValue(selector.vendor.vStoreSettings.address.state, vendorInfo.stateSelectValue);
		// company info
		await this.clearAndType(selector.vendor.vStoreSettings.companyInfo.companyName, vendorInfo.companyName);
		await this.clearAndType(selector.vendor.vStoreSettings.companyInfo.companyId, vendorInfo.companyId);
		await this.clearAndType(selector.vendor.vStoreSettings.companyInfo.vatOrTaxNumber, vendorInfo.vatNumber);
		await this.clearAndType(selector.vendor.vStoreSettings.companyInfo.nameOfBank, vendorInfo.bankName);
		await this.clearAndType(selector.vendor.vStoreSettings.companyInfo.bankIban, vendorInfo.bankIban);
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
			await this.click(selector.vendor.vStoreSettings.termsAndConditions);
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

		// delete pervious datewise vacation settings if any  //todo:  skip this not needed ,might use in delete test
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
		await this.clearAndType(selector.vendor.vStoreSettings.address.street, vendorInfo.street1);
		await this.clearAndType(selector.vendor.vStoreSettings.address.street2, vendorInfo.street2);
		await this.clearAndType(selector.vendor.vStoreSettings.address.city, vendorInfo.city);
		await this.clearAndType(selector.vendor.vStoreSettings.address.postOrZipCode, vendorInfo.zipCode);
		await this.selectByValue(selector.vendor.vStoreSettings.address.country, vendorInfo.countrySelectValue);
		await this.selectByValue(selector.vendor.vStoreSettings.address.state, vendorInfo.stateSelectValue);
		// update settings
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vStoreSettings.updateSettings);
		await this.toContainText(selector.vendor.vStoreSettings.updateSettingsSuccessMessage, vendorInfo.storeSettingsSaveSuccessMessage);
	}


	// vendor send id verification request
	async sendIdVerificationRequest(verification: vendor['verification']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

		// cancel previous verification request if any
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.id.cancelIdVerificationRequest);
		if (cancelRequestIsVisible) {
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.id.cancelIdVerificationRequest);
			await expect(this.page.getByText(verification.idRequestSubmitCancel)).toBeVisible();
		}
		// id verification
		await this.click(selector.vendor.vVerificationSettings.id.startIdVerification);
		// remove previously uploaded image
		const uploadPhotoBtnIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.id.uploadPhoto);
		if (!uploadPhotoBtnIsVisible) {
			// await this.hover(selector.vendor.vVerificationSettings.id.previousUploadedPhoto); //todo:  not working, real user behavior
			// await this.click(selector.vendor.vVerificationSettings.id.removePreviousUploadedPhoto);
			await this.setAttributeValue('.gravatar-wrap', 'class', 'gravatar-wrap dokan-hide'); //todo:  remove this alternative soln.
			await this.setAttributeValue('.gravatar-button-area.dokan-hide', 'class', 'gravatar-button-area');
		}
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.id.uploadPhoto);
		await this.uploadMedia(verification.file);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.id.submitId);
		await this.toContainText(selector.vendor.vVerificationSettings.id.idUpdateSuccessMessage, verification.idRequestSubmitSuccessMessage);
	}


	// vendor send address verification request
	async sendAddressVerificationRequest(verification: vendor['verification']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);
		// cancel previous verification request if any
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.address.cancelAddressVerificationRequest);
		if (cancelRequestIsVisible) {
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.address.cancelAddressVerificationRequest);
			await expect(this.page.getByText(verification.addressRequestSubmitCancel)).toBeVisible();
		}
		// address verification
		await this.click(selector.vendor.vVerificationSettings.address.startAddressVerification);
		await this.clearAndType(selector.vendor.vVerificationSettings.address.street, verification.street1);
		await this.clearAndType(selector.vendor.vVerificationSettings.address.street2, verification.street2);
		await this.clearAndType(selector.vendor.vVerificationSettings.address.city, verification.city);
		await this.clearAndType(selector.vendor.vVerificationSettings.address.postOrZipCode, verification.zipCode);
		await this.selectByValue(selector.vendor.vVerificationSettings.address.country, verification.country);
		await this.selectByValue(selector.vendor.vVerificationSettings.address.state, verification.state);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.address.uploadResidenceProof);
		await this.uploadMedia(verification.file);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.address.submitAddress);
		await this.toContainText(selector.vendor.vVerificationSettings.address.addressUpdateSuccessMessage, verification.addressRequestSubmitSuccessMessage);
	}


	// vendor send company verification request
	async sendCompanyVerificationRequest(verification: vendor['verification']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);
		// cancel previous verification request if any
		const cancelRequestIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.company.cancelCompanyVerificationRequest);
		if (cancelRequestIsVisible) {
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.company.cancelCompanyVerificationRequest);
			await expect(this.page.getByText(verification.companyRequestSubmitCancel)).toBeVisible();
		}
		// company verification
		await this.click(selector.vendor.vVerificationSettings.company.startCompanyVerification);
		// remove previously uploaded company file
		const UploadedCompanyFileIsVisible = await this.isVisible(selector.vendor.vVerificationSettings.company.uploadedCompanyFileClose);
		if (UploadedCompanyFileIsVisible) {
			await this.click(selector.vendor.vVerificationSettings.company.uploadedCompanyFileClose);
		}
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.company.uploadFiles);
		await this.uploadMedia(verification.file);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vVerificationSettings.company.submitCompanyInfo);
		await this.toContainText(selector.vendor.vVerificationSettings.company.companyInfoUpdateSuccessMessage, verification.companyRequestSubmitSuccessMessage);
	}


	// upload media
	async uploadMedia(file: string) { //todo:  move uploadMedia to base page, try to make only one function for media upload for whole project
		const uploadedMediaIsVisible = await this.isVisible(selector.wpMedia.uploadedMedia);
		if (uploadedMediaIsVisible) {
			await this.click(selector.wpMedia.uploadedMedia);
		} else {
			await this.uploadFile(selector.wpMedia.selectFilesInput, file); //todo:  image upload don't work , try on other site
			await this.click(selector.wpMedia.selectUploadedMedia); //todo:  after fix this line not needed
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
		await this.click(selector.vendor.vDeliveryTimeSettings.updateSettings);
		await this.toContainText(selector.vendor.vDeliveryTimeSettings.settingsSuccessMessage, deliveryTime.saveSuccessMessage);
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
		await this.click(selector.vendor.vShippingSettings.shippingPolicies.saveSettings);
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
		await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.facebook, urls.facebook);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.twitter, urls.twitter);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.pinterest, urls.pinterest);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.linkedin, urls.linkedin);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.youtube, urls.youtube);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.instagram, urls.instagram);
		await this.clearAndType(selector.vendor.vSocialProfileSettings.platforms.flickr, urls.flickr);
		await this.keyPressOnLocator(selector.vendor.vSocialProfileSettings.updateSettings, data.key.enter);
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
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.settingsRma, selector.vendor.vRmaSettings.saveChanges, 302);
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
			// await this.clickAndWaitMultiple(selector.vendor.product.refundReasons)//todo:  update this
		}
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		const productCreateSuccessMessage = await this.getElementText(selector.vendor.product.updatedSuccessMessage);
		expect(productCreateSuccessMessage?.replace(/\s+/g, ' ').trim()).toMatch(data.product.createUpdateSaveSuccessMessage);
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


	// search product
	async searchProduct(productName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

		await this.clearAndType(selector.vendor.product.search.searchInput, productName);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.search.searchBtn);
		await this.toBeVisible(selector.vendor.product.productLink(productName));
	}


	//todo: new tests

	// vendor return request render properly
	async vendorUserSubscriptionsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.userSubscriptions);

		// filter
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { filterByCustomerInput,  ...filters } = selector.vendor.vUserSubscriptions.filters;
		await this.multipleElementVisible(filters);

		await this.toBeVisible(selector.vendor.vUserSubscriptions.noSubscriptionsFound);
		//todo: add table data

	}

	// vendor product review render properly
	async vendorProductReviewsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.reviews);

		// settings text is visible
		await this.toBeVisible(selector.vendor.vReviews.reviewsText);

		// product review menu elements are visible
		await this.multipleElementVisible(selector.vendor.vReviews.menus);

		// product review bulk action elements are visible
		await this.multipleElementVisible(selector.vendor.vReviews.bulkActions);

		// product review table elements are visible
		await this.multipleElementVisible(selector.vendor.vReviews.table);

		const noReviewsFound = await this.isVisible(selector.vendor.vReviews.noReviewsFound);
		if (noReviewsFound){
			return;
		}
		//todo: add more fields

	}

	// product review bulk action
	async productReviewBulkAuction(action: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.reviews);

		// ensure row exists
		await this.notToBeVisible(selector.vendor.vReviews.noReviewsFound);

		await this.click(selector.vendor.vReviews.bulkActions.selectAll);
		await this.selectByValue(selector.vendor.vReviews.bulkActions.selectAction, action);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.reviews, selector.vendor.vReviews.bulkActions.applyAction);
	}

	// view product review
	async viewProductReview(reviewMessage: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.reviews);

		await this.clickAndWaitForLoadState(selector.vendor.vReviews.reviewLink(reviewMessage));
		await this.toContainText('.comment-text .description p', reviewMessage);
	}

	// update product review status
	async updateProductReview(action: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.reviews);

		switch(action){
		case 'approve' :

			break;
		case 'unApprove' :

			break;
		case 'spam' :

			break;

		case 'trash' :

			break;

		default :
			break;

		}

	}


	// vendor return request render properly
	async vendorReturnRequestRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.returnRequest);

		// return request menu elements are visible
		await this.toBeVisible(selector.vendor.vReturnRequest.menus.all); //todo: add all menus

		// return request table elements are visible
		await this.multipleElementVisible(selector.vendor.vReturnRequest.table);

		await this.toBeVisible(selector.vendor.vReturnRequest.noRowsFound);
		//todo: add more fields

	}


	// vendor delivery time render properly
	async vendorDeliveryTimeRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.deliveryTime);

		// delivery time and store pickup text is visible
		await this.toBeVisible(selector.vendor.vDeliveryTime.deliveryTimeAndStorePickup);

		// delivery time calendar is visible
		await this.toBeVisible(selector.vendor.vDeliveryTime.deliveryTimeCalender);

		// delivery time filter elements are visible
		await this.multipleElementVisible(selector.vendor.vDeliveryTime.filter);

		// delivery time navigation elements are visible
		await this.multipleElementVisible(selector.vendor.vDeliveryTime.navigation);

	}

	// vendor analytics render properly
	async vendorAnalyticsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.analytics);

		// analytics menu elements are visible
		await this.multipleElementVisible(selector.vendor.vAnalytics.menus);

		// date-picker elements are visible
		await this.multipleElementVisible(selector.vendor.vAnalytics.datePicker);

		await this.clickAndWaitForLoadState(selector.vendor.vAnalytics.menus.topPages);
		await this.toBeVisible(selector.vendor.vAnalytics.noAnalytics);

		await this.clickAndWaitForLoadState(selector.vendor.vAnalytics.menus.location);
		await this.toBeVisible(selector.vendor.vAnalytics.noAnalytics);

		await this.clickAndWaitForLoadState(selector.vendor.vAnalytics.menus.system);
		await this.toBeVisible(selector.vendor.vAnalytics.noAnalytics);

		await this.clickAndWaitForLoadState(selector.vendor.vAnalytics.menus.promotions);
		await this.toBeVisible(selector.vendor.vAnalytics.noAnalytics);

		await this.clickAndWaitForLoadState(selector.vendor.vAnalytics.menus.keyword);
		await this.toBeVisible(selector.vendor.vAnalytics.noAnalytics);

	}


	// vendor settings render properly
	async vendorSettingsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);

		// settings text is visible
		await this.toBeVisible(selector.vendor.vStoreSettings.settingsText);

		//todo: update for lite

		// visit store link is visible
		await this.toBeVisible(selector.vendor.vStoreSettings.banner);
		await this.toBeVisible(selector.vendor.vStoreSettings.profilePicture);
		await this.toBeVisible(selector.vendor.vStoreSettings.storeName);
		await this.toBeVisible(selector.vendor.vStoreSettings.storeProductsPerPage);
		await this.toBeVisible(selector.vendor.vStoreSettings.phoneNo);
		DOKAN_PRO && await this.toBeVisible(selector.vendor.vStoreSettings.multipleLocation);

		// store address location elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { cancelSaveLocation, deleteSaveLocation,  ...address } = selector.vendor.vStoreSettings.address;
		await this.multipleElementVisible(address);

		// company info elements are visible
		DOKAN_PRO && await this.multipleElementVisible(selector.vendor.vStoreSettings.companyInfo);

		await this.toBeVisible(selector.vendor.vStoreSettings.email);
		await this.toBeVisible(selector.vendor.vStoreSettings.moreProducts);

		// map is visible
		await this.toBeVisible(selector.vendor.vStoreSettings.map);

		//todo: catalog, discount, vacation, open close, store category

		// biography is visible
		DOKAN_PRO && await this.toBeVisible(selector.vendor.vStoreSettings.biographyIframe);

		//todo: min-max, store-support

		// update settings are visible
		await this.toBeVisible(selector.vendor.vStoreSettings.updateSettingsTop);
		await this.toBeVisible(selector.vendor.vStoreSettings.updateSettings);
	}


	// vendor verifications render properly
	async vendorVerificationsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsVerification);

		// verification text is visible
		await this.toBeVisible(selector.vendor.vVerificationSettings.verificationText);

		// visit store link is visible
		await this.toBeVisible(selector.vendor.vVerificationSettings.visitStore);

		await this.toBeVisible(selector.vendor.vVerificationSettings.id.startIdVerification);
		await this.toBeVisible(selector.vendor.vVerificationSettings.address.startAddressVerification);
		await this.toBeVisible(selector.vendor.vVerificationSettings.company.startCompanyVerification);

		await this.click(selector.vendor.vVerificationSettings.id.startIdVerification);
		await this.click(selector.vendor.vVerificationSettings.address.startAddressVerification);
		await this.click(selector.vendor.vVerificationSettings.company.startCompanyVerification);

		// product addon fields elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { startIdVerification, cancelIdVerificationRequest,  previousUploadedPhoto, removePreviousUploadedPhoto, idUpdateSuccessMessage,   ...idVerifications } = selector.vendor.vVerificationSettings.id;
		await this.multipleElementVisible(idVerifications);

		// product addon fields elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { startAddressVerification, cancelAddressVerificationRequest, previousUploadedResidenceProof, removePreviousUploadedResidenceProof, addressUpdateSuccessMessage,  ...addressVerifications } = selector.vendor.vVerificationSettings.address;
		await this.multipleElementVisible(addressVerifications);

		// product addon fields elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { startCompanyVerification, cancelCompanyVerificationRequest, uploadedCompanyFileClose, cancelSelectedInfo, companyInfoUpdateSuccessMessage,  ...companyVerifications } = selector.vendor.vVerificationSettings.company;
		await this.multipleElementVisible(companyVerifications);

	}


	// vendor delivery time render properly
	async vendorDeliveryTimeSettingsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsDeliveryTime);

		// settings text is visible
		await this.toBeVisible(selector.vendor.vDeliveryTimeSettings.settingsText);

		// visit store link is visible
		await this.toBeVisible(selector.vendor.vDeliveryTimeSettings.visitStore);

		// delivery support elements are visible
		await this.toBeVisible(selector.vendor.vDeliveryTimeSettings.homeDelivery);
		await this.toBeVisible(selector.vendor.vDeliveryTimeSettings.storePickup);
		await this.toBeVisible(selector.vendor.vDeliveryTimeSettings.deliveryBlockedBuffer);
		await this.toBeVisible(selector.vendor.vDeliveryTimeSettings.timeSlot);
		await this.toBeVisible(selector.vendor.vDeliveryTimeSettings.orderPerSlot);
		await this.notToHaveCount(selector.vendor.vDeliveryTimeSettings.deliveryDaySwitches, 0);

		// update settings is visible
		await this.toBeVisible(selector.vendor.vDeliveryTimeSettings.updateSettings);
	}


	// vendor shipping render properly
	async vendorShippingRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipping);

		// shipstation text is visible
		await this.toBeVisible(selector.vendor.vShippingSettings.shippingSettingsText);

		// visit store link is visible
		await this.toBeVisible(selector.vendor.vShippingSettings.visitStore);

		// add shipping policies is visible
		await this.toBeVisible(selector.vendor.vShippingSettings.shippingPolicies.clickHereToAddShippingPolicies);

		// previous shipping settings link is visible
		await this.toBeVisible(selector.vendor.vShippingSettings.shippingPolicies.clickHereToAddShippingPolicies);

		// shipping zone table elements are visible
		await this.multipleElementVisible(selector.vendor.vShippingSettings.table);

		await this.clickAndWaitForLoadState(selector.vendor.vShippingSettings.shippingPolicies.clickHereToAddShippingPolicies);

		// shipping policy elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { clickHereToAddShippingPolicies, ...companyVerifications } = selector.vendor.vShippingSettings.shippingPolicies;
		await this.multipleElementVisible(companyVerifications);

		await this.clickAndWaitForLoadState(selector.vendor.vShippingSettings.shippingPolicies.backToZoneList);

		await this.clickAndWaitForLoadState(selector.vendor.vShippingSettings.previousShippingSettings.previousShippingSettings);

		// previous shipping settings elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { previousShippingSettings, ...previousShipping } = selector.vendor.vShippingSettings.previousShippingSettings;
		await this.multipleElementVisible(previousShipping);

		// await this.goBack();

	}


	// vendor shipstation render properly
	async vendorShipstationRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipstation);

		// shipstation text is visible
		await this.toBeVisible(selector.vendor.vShipStationSettings.shipStationText);

		// visit store link is visible
		await this.toBeVisible(selector.vendor.vShipStationSettings.visitStore);

		// authentication key is visible
		await this.toBeVisible(selector.vendor.vShipStationSettings.authenticationKey);

		// export order statuses is visible
		await this.toBeVisible(selector.vendor.vShipStationSettings.exportOrderStatuses);

		// Shipped Order Status is visible
		await this.toBeVisible(selector.vendor.vShipStationSettings.shippedOrderStatusDropdown);

		// save changes is visible
		await this.toBeVisible(selector.vendor.vShipStationSettings.saveChanges);
	}


	// vendor social profile render properly
	async vendorSocialProfileRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSocialProfile);

		// social profile text is visible
		await this.toBeVisible(selector.vendor.vSocialProfileSettings.socialProfileText);

		// visit store link is visible
		await this.toBeVisible(selector.vendor.vSocialProfileSettings.visitStore);

		// social platform elements are visible
		await this.multipleElementVisible(selector.vendor.vSocialProfileSettings.platforms);

		// update settings is visible
		await this.toBeVisible(selector.vendor.vSocialProfileSettings.updateSettings);
	}


	// vendor rma render properly
	async vendorRmaRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsRma);

		// return and warranty text is visible
		await this.toBeVisible(selector.vendor.vRmaSettings.returnAndWarrantyText);

		// visit store link is visible
		await this.toBeVisible(selector.vendor.vRmaSettings.visitStore);

		// rma label input is visible
		await this.toBeVisible(selector.vendor.vRmaSettings.label);

		// rma type input is visible
		await this.toBeVisible(selector.vendor.vRmaSettings.type);

		// rma policy input is visible
		await this.toBeVisible(selector.vendor.vRmaSettings.refundPolicyIframe);

		// save changes is visible
		await this.toBeVisible(selector.vendor.vRmaSettings.saveChanges);
	}


	// vendor store seo render properly
	async vendorStoreSeoRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSeo);

		// store seo text is visible
		await this.toBeVisible(selector.vendor.vStoreSeoSettings.storeSeoText);

		// visit store link is visible
		await this.toBeVisible(selector.vendor.vStoreSeoSettings.visitStore);

		// seo title is visible
		await this.toBeVisible(selector.vendor.vStoreSeoSettings.seoTitle);

		// meta description is visible
		await this.toBeVisible(selector.vendor.vStoreSeoSettings.metaDescription);

		// meta keywords is visible
		await this.toBeVisible(selector.vendor.vStoreSeoSettings.metaKeywords);

		// store seo facebook elements are visible
		await this.multipleElementVisible(selector.vendor.vStoreSeoSettings.facebook);

		// store seo twitter elements are visible
		await this.multipleElementVisible(selector.vendor.vStoreSeoSettings.twitter);

		// save changes is visible
		await this.toBeVisible(selector.vendor.vStoreSeoSettings.saveChanges);
	}


	// vendor store seo render properly
	async vendorAccountDetailsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.editAccountVendor);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { saveSuccessMessage, ...accountDetails } = selector.vendor.vAccountDetails;
		await this.multipleElementVisible(accountDetails);

	}

}
