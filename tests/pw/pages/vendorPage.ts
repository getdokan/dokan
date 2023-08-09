import { Page, expect } from '@playwright/test';
import { BasePage } from 'pages/basePage';
import { LoginPage } from 'pages/loginPage';
import { CustomerPage } from 'pages/customerPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { helpers } from 'utils/helpers';
import { vendor, vendorSetupWizard } from 'utils/interfaces';

const { DOKAN_PRO } = process.env;


export class VendorPage extends BasePage {

	constructor(page: Page) {
		super(page);
	}


	loginPage = new LoginPage(this.page);
	customer = new CustomerPage(this.page);

	// navigation

	async goToMyAccount(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.myAccount);
	}

	async goToVendorDashboard(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.dashboard);
	}

	async goToProductDetails(productName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
	}


	// go to order details
	async goToOrderDetails(orderNumber: string): Promise<void> {
		await this.searchOrder(orderNumber);
		await this.clickAndWaitForLoadState(selector.vendor.orders.view(orderNumber));
		await this.toContainText(selector.vendor.orders.orderDetails.orderNumber, orderNumber);
	}


	// go to product edit
	async goToProductEdit(productName: string): Promise<void> {
		await this.searchProduct(productName);
		await this.hover(selector.vendor.product.productCell(productName));
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.product.editProduct(productName));
		await this.toHaveValue(selector.vendor.product.edit.title, productName);
	}


	// vendor registration
	async vendorRegister(vendorInfo: vendor['vendorInfo'], setupWizardData: vendorSetupWizard ): Promise<void> {
		const username = vendorInfo.firstName() + vendorInfo.lastName().replace('\'', '');

		await this.goToMyAccount();
		const regIsVisible = await this.isVisible(selector.customer.cRegistration.regEmail);
		!regIsVisible && await this.loginPage.logout();
		await this.clearAndType(selector.vendor.vRegistration.regEmail, username + data.vendor.vendorInfo.emailDomain);
		await this.clearAndType(selector.vendor.vRegistration.regPassword, vendorInfo.password);
		await this.focusAndClick(selector.vendor.vRegistration.regVendor);
		await this.waitForVisibleLocator(selector.vendor.vRegistration.firstName);
		await this.clearAndType(selector.vendor.vRegistration.firstName, username);
		await this.clearAndType(selector.vendor.vRegistration.lastName, vendorInfo.lastName());
		await this.clearAndType(selector.vendor.vRegistration.shopName, vendorInfo.shopName);
		await this.click(selector.vendor.vRegistration.shopUrl);

		// fill address if enabled on registration
		const addressInputIsVisible = await this.isVisible(selector.vendor.vRegistration.street1);
		if (addressInputIsVisible) {
			await this.clearAndType(selector.vendor.vRegistration.street1, vendorInfo.street1);
			await this.clearAndType(selector.vendor.vRegistration.street2, vendorInfo.street2);
			await this.clearAndType(selector.vendor.vRegistration.city, vendorInfo.city);
			await this.clearAndType(selector.vendor.vRegistration.zipCode, vendorInfo.zipCode);
			await this.selectByValue(selector.vendor.vRegistration.country, vendorInfo.countrySelectValue);
			await this.selectByValue(selector.vendor.vRegistration.state, vendorInfo.stateSelectValue);
		}
		if (DOKAN_PRO){
			await this.clearAndType(selector.vendor.vRegistration.companyName, vendorInfo.companyName);
			await this.clearAndType(selector.vendor.vRegistration.companyId, vendorInfo.companyId);
			await this.clearAndType(selector.vendor.vRegistration.vatNumber, vendorInfo.vatNumber);
			await this.clearAndType(selector.vendor.vRegistration.bankName, vendorInfo.bankName);
			await this.clearAndType(selector.vendor.vRegistration.bankIban, vendorInfo.bankIban);
		}
		await this.clearAndType(selector.vendor.vRegistration.phone, vendorInfo.phoneNumber);
		await this.checkIfVisible(selector.customer.cDashboard.termsAndConditions);
		const subscriptionPackIsVisible = await this.isVisible(selector.vendor.vRegistration.subscriptionPack);
		subscriptionPackIsVisible && await this.selectByLabel(selector.vendor.vRegistration.subscriptionPack, data.predefined.vendorSubscription.nonRecurring);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.myAccount, selector.vendor.vRegistration.register,  302);
		const registrationErrorIsVisible = await this.isVisible(selector.customer.cWooSelector.wooCommerceError);
		if (registrationErrorIsVisible) {
			const hasError = await this.hasText(selector.customer.cWooSelector.wooCommerceError, data.customer.registration.registrationErrorMessage);
			if (hasError) {
				console.log('User already exists!!');
				return;
			}
		}
		subscriptionPackIsVisible && await this.customer.placeOrder('bank', false, true, false);
		await this.vendorSetupWizard(setupWizardData);
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
			await this.toContainText(selector.vendor.vSetup.highlightedResult, setupWizardData.country);
			await this.press(data.key.enter);
			await this.click(selector.vendor.vSetup.state);
			await this.type(selector.vendor.vSetup.stateInput, setupWizardData.state);
			await this.toContainText(selector.vendor.vSetup.highlightedResult, setupWizardData.state);
			await this.press(data.key.enter);

			// store categories
			const storeCategoriesEnabled = await this.isVisible(selector.vendor.vSetup.storeCategories);
			if (storeCategoriesEnabled){
				const allStoreCategories = await this.getMultipleElementTexts(selector.vendor.vSetup.selectedStoreCategories);
				const categoryIsSelected = allStoreCategories.includes('×'+ setupWizardData.storeCategory);
				if (!categoryIsSelected){
					await this.click(selector.vendor.vSetup.storeCategories);
					await this.type(selector.vendor.vSetup.storeCategoriesInput, setupWizardData.storeCategory);
					await this.toContainText(selector.vendor.vSetup.highlightedResult, setupWizardData.storeCategory);
					await this.click(selector.vendor.vSetup.highlightedResult);
				}
			}

			// map
			const geoLocationEnabled = await this.isVisible(selector.vendor.vSetup.map);
			if (geoLocationEnabled) {
				await this.typeAndWaitForResponse(data.subUrls.gmap, selector.vendor.vSetup.map, setupWizardData.mapLocation);
				await this.press(data.key.arrowDown);
				await this.press(data.key.enter);
			}

			await this.check(selector.vendor.vSetup.email);
			await this.click(selector.vendor.vSetup.continueStoreSetup);

			// payment

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
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.dashboard, selector.vendor.vSetup.goToStoreDashboard);
		} else {
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.dashboard, selector.vendor.vSetup.notRightNow);
		}
		await this.toBeVisible(selector.vendor.vDashboard.menus.dashboard);
	}


	// vendor account details render properly
	async vendorAccountDetailsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.editAccountVendor);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { saveSuccessMessage, ...accountDetails } = selector.vendor.vAccountDetails;
		await this.multipleElementVisible(accountDetails);

	}


	// vendor add vendor details
	async addVendorDetails(vendor: vendor): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.editAccountVendor);
		await this.clearAndType(selector.vendor.vAccountDetails.firstName, vendor.username);
		await this.clearAndType(selector.vendor.vAccountDetails.lastName, vendor.lastname);
		await this.clearAndType(selector.vendor.vAccountDetails.email,  vendor.username + vendor.vendorInfo.emailDomain);
		// await this.updatePassword(vendor.vendorInfo.password, vendor.vendorInfo.password1);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.editAccountVendor, selector.vendor.vAccountDetails.saveChanges, 302);
		await expect(this.page.getByText(selector.vendor.vAccountDetails.saveSuccessMessage)).toBeVisible();
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, data.vendor.vendorInfo.account.updateSuccessMessage);

		// cleanup: reset password
		// await this.updatePassword(vendor.vendorInfo.password1, vendor.vendorInfo.password, true);
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


	// get total vendor earnings
	async getTotalVendorEarning(): Promise<number> {
		await this.goToVendorDashboard();
		return helpers.price(await this.getElementText(selector.vendor.vDashboard.atAGlance.earningValue) as string);
	}


	// get order details vendor
	async getOrderDetails(orderNumber: string): Promise<object> {
		await this.searchOrder(orderNumber);

		const orderDetails = {
			vendorEarning: 0,
			orderNumber: '',
			orderTotalBeforeRefund: 0,
			orderTotal: 0,
			orderStatus: '',
			orderDate: '',
			discount: 0,
			shippingMethod: '',
			shippingCost: 0,
			tax: 0,
			refunded: 0,

		};

		orderDetails.vendorEarning = helpers.price(await this.getElementText(selector.vendor.orders.vendorEarningTable(orderNumber)) as string);
		await this.clickAndWaitForLoadState(selector.vendor.orders.view(orderNumber));

		orderDetails.orderNumber = (await this.getElementText(selector.vendor.orders.orderDetails.orderNumber)  as string).split('#')[1]  as string;

		const refundedOrderTotalIsVisible = await this.isVisible(selector.vendor.orders.orderDetails.orderTotalAfterRefund);
		if (refundedOrderTotalIsVisible) {
			orderDetails.orderTotalBeforeRefund = helpers.price(await this.getElementText(selector.vendor.orders.orderDetails.orderTotalBeforeRefund) as string);
			orderDetails.orderTotal = helpers.price(await this.getElementText(selector.vendor.orders.orderDetails.orderTotalAfterRefund) as string);
		} else {
			orderDetails.orderTotal = helpers.price(await this.getElementText(selector.vendor.orders.orderDetails.orderTotal) as string);
		}

		orderDetails.orderStatus = (await this.getElementText(selector.vendor.orders.status.currentOrderStatus) as string).replace('-', ' ');

		const orderDate = (await this.getElementText(selector.vendor.orders.orderDetails.orderDate) as string)?.split(':')[1]?.trim();
		orderDetails.orderDate = orderDate?.substring(0, orderDate.indexOf(',', orderDate.indexOf(',') + 1));

		const discountIsVisible = await this.isVisible(selector.vendor.orders.orderDetails.discount);
		if (discountIsVisible){
			orderDetails.discount = helpers.price(await this.getElementText(selector.vendor.orders.orderDetails.discount) as string);
		}

		const shippingMethodIsVisible = await this.isVisible(selector.vendor.orders.orderDetails.shippingMethod);
		if (shippingMethodIsVisible) {
			orderDetails.shippingCost = helpers.price(await this.getElementText(selector.vendor.orders.orderDetails.shippingCost) as string);
		}

		const taxIsVisible = await this.isVisible(selector.vendor.orders.orderDetails.tax);
		if (taxIsVisible){
			orderDetails.tax = helpers.price(await this.getElementText(selector.vendor.orders.orderDetails.tax) as string);
		}

		const refundIsVisible = await this.isVisible(selector.vendor.orders.orderDetails.refunded);
		if (refundIsVisible){
			orderDetails.refunded = helpers.price(await this.getElementText(selector.vendor.orders.orderDetails.refunded) as string);
		}

		console.log(orderDetails);
		return orderDetails;
	}


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


	// search order
	async searchOrder(orderNumber: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.orders);

		await this.clearAndType(selector.vendor.orders.search.searchInput, orderNumber);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.orders, selector.vendor.orders.search.searchBtn);
		await this.toBeVisible(selector.vendor.orders.orderLink(orderNumber));
	}


	//todo: fixed above functions


	//refund

	// vendor refund order
	async refundOrder(orderNumber: string, productName: string, partialRefund = false): Promise<void> {
		await this.goToOrderDetails(orderNumber);

		//request refund
		await this.click(selector.vendor.orders.refund.requestRefund);
		const productQuantity = await this.getElementText(selector.vendor.orders.refund.productQuantity(productName)) as string;
		const productCost = helpers.price(await this.getElementText(selector.vendor.orders.refund.productCost(productName)) as string);
		const productTax = helpers.price(await this.getElementText(selector.vendor.orders.refund.productTax(productName)) as string);
		await this.type(selector.vendor.orders.refund.refundProductQuantity(productName), productQuantity);
		if (partialRefund) {
			await this.click(selector.vendor.orders.refund.refundDiv);
			await this.clearAndType(selector.vendor.orders.refund.refundProductCostAmount(productName), String(helpers.roundToTwo(productCost / 2)));
			await this.clearAndType(selector.vendor.orders.refund.refundProductTaxAmount(productName), String(helpers.roundToTwo(productTax / 2)));
		}
		await this.type(selector.vendor.orders.refund.refundReason, 'Defective product');
		await this.click(selector.vendor.orders.refund.refundManually);
		await this.click(selector.vendor.orders.refund.confirmRefund);

		await this.toContainText(selector.vendor.orders.refund.refundRequestSuccessMessage, 'Refund request submitted.');
		await this.click(selector.vendor.orders.refund.refundRequestSuccessMessageOk);
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


}
