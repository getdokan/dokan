import { Page, expect } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { vendor, } from 'utils/interfaces';


const { DOKAN_PRO } = process.env;

export class VendorSettingsPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// vendor settings


	// vendor settings render properly
	async vendorStoreSettingsRenderProperly(){
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
	async vendorVerificationsSettingsRenderProperly(){
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


	// vendor shipping render properly
	async vendorShippingSettingsRenderProperly(){
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
	async vendorShipstationSettingsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipstation);

		// shipstation text is visible
		await this.toBeVisible(selector.vendor.vShipStationSettings.shipStationText);

		// visit store link is visible
		await this.toBeVisible(selector.vendor.vShipStationSettings.visitStore);

		// authentication key is visible
		await this.toBeVisible(selector.vendor.vShipStationSettings.authenticationKey);

		// export order statuses is visible
		await this.toBeVisible(selector.vendor.vShipStationSettings.exportOrderStatusesInput);

		// Shipped Order Status is visible
		await this.toBeVisible(selector.vendor.vShipStationSettings.shippedOrderStatusDropdown);

		// save changes is visible
		await this.toBeVisible(selector.vendor.vShipStationSettings.saveChanges);
	}


	// vendor social profile render properly
	async vendorSocialProfileSettingsRenderProperly(){
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
	async vendorRmaSettingsRenderProperly(){
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
	async vendorStoreSeoSettingsRenderProperly(){
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


	// store settings

	// update store map via settings save
	async updateStoreMapViaSettingsSave() {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vStoreSettings.updateSettings);
		await this.toContainText(selector.vendor.vStoreSettings.updateSettingsSuccessMessage, 'Your information has been saved successfully');
	}

	// vendor set store settings
	async setStoreSettings(vendorInfo: vendor['vendorInfo'], topic: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);

		switch (topic) {

		case 'banner-profile' :
			// await this.bannerAndProfilePictureSettings(); //todo:
			break;

		case 'basic' :
			await this.basicInfoSettings(vendorInfo);
			break;

		case 'address' :
			await this.setStoreAddress(vendorInfo);
			break;

		case 'company-info' :
			await this.setCompanyInfo(vendorInfo);
			break;

		case 'map' :
			await this.mapSettings(vendorInfo.mapLocation);
			break;

		case 'toc' :
			await this.termsAndConditionsSettings(vendorInfo.termsAndConditions);
			break;

		case 'open-close' :
			await this.openingClosingTimeSettings(vendorInfo.openingClosingTime);
			break;

		case 'vacation' :
			await this.vacationSettings(vendorInfo.vacation);
			break;

		case 'catalog' :
			await this.catalogModeSettings();
			break;

		case 'discount' :
			await this.discountSettings(vendorInfo.amountDiscount);
			break;

		case 'biography' :
			await this.biographySettings(vendorInfo.biography);
			break;

		case 'store-support' :
			await this.storeSupportSettings(vendorInfo.supportButtonText);
			break;

		case 'min-max' :
			await this.minMaxSettings(vendorInfo.minMax);
			break;

		default :
			break;

		}

		// update settings
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vStoreSettings.updateSettings);
		await this.toContainText(selector.vendor.vStoreSettings.updateSettingsSuccessMessage, data.vendor.vendorInfo.storeSettingsSaveSuccessMessage);

	}


	// vendor set basic info settings
	async basicInfoSettings(vendorInfo: vendor['vendorInfo']): Promise<void> {

		// store basic info
		await this.clearAndType(selector.vendor.vStoreSettings.storeName, vendorInfo.storeName);
		await this.clearAndType(selector.vendor.vStoreSettings.storeProductsPerPage, vendorInfo.productsPerPage);
		await this.clearAndType(selector.vendor.vStoreSettings.phoneNo, vendorInfo.phoneNumber);
		// email
		await this.check(selector.vendor.vStoreSettings.email);
		// show more products
		await this.check(selector.vendor.vStoreSettings.moreProducts);
	}


	// vendor set store address
	async setStoreAddress(vendorInfo: vendor['vendorInfo']): Promise<void> {
		await this.clearAndType(selector.vendor.vStoreSettings.address.street, vendorInfo.street1);
		await this.clearAndType(selector.vendor.vStoreSettings.address.street2, vendorInfo.street2);
		await this.clearAndType(selector.vendor.vStoreSettings.address.city, vendorInfo.city);
		await this.clearAndType(selector.vendor.vStoreSettings.address.postOrZipCode, vendorInfo.zipCode);
		await this.selectByValue(selector.vendor.vStoreSettings.address.country, vendorInfo.countrySelectValue);
		await this.selectByValue(selector.vendor.vStoreSettings.address.state, vendorInfo.stateSelectValue);
	}


	// vendor set company info
	async setCompanyInfo(vendorInfo: vendor['vendorInfo']): Promise<void> {
		await this.clearAndType(selector.vendor.vStoreSettings.companyInfo.companyName, vendorInfo.companyName);
		await this.clearAndType(selector.vendor.vStoreSettings.companyInfo.companyId, vendorInfo.companyId);
		await this.clearAndType(selector.vendor.vStoreSettings.companyInfo.vatOrTaxNumber, vendorInfo.vatNumber);
		await this.clearAndType(selector.vendor.vStoreSettings.companyInfo.nameOfBank, vendorInfo.bankName);
		await this.clearAndType(selector.vendor.vStoreSettings.companyInfo.bankIban, vendorInfo.bankIban);
	}


	// vendor set map settings
	async mapSettings(mapLocation: string): Promise<void> {
		const geoLocationEnabled = await this.isVisible(selector.vendor.vStoreSettings.map);
		if (geoLocationEnabled) {
			await this.typeAndWaitForResponse(data.subUrls.gmap, selector.vendor.vStoreSettings.map, mapLocation);
			await this.press(data.key.arrowDown);
			await this.press(data.key.enter);
		}
	}


	// vendor set terms and conditions settings
	async termsAndConditionsSettings(termsAndConditions: string): Promise<void> {
		const tocEnabled = await this.isVisible(selector.vendor.vStoreSettings.termsAndConditions);
		if (tocEnabled) {
			await this.check(selector.vendor.vStoreSettings.termsAndConditions);
			await this.typeFrameSelector(selector.vendor.vStoreSettings.termsAndConditionsIframe, selector.vendor.vStoreSettings.termsAndConditionsHtmlBody, termsAndConditions);
		}
	}


	// vendor set opening closing time settings
	async openingClosingTimeSettings(openingClosingTime: vendor['vendorInfo']['openingClosingTime']): Promise<void> {
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
	async vacationSettings(vacation: vendor['vendorInfo']['vacation']): Promise<void> {
		const vacationModeEnabled = await this.isVisible(selector.vendor.vStoreSettings.goToVacation);
		if (vacationModeEnabled) {
			await this.check(selector.vendor.vStoreSettings.goToVacation);
			await this.selectByValue(selector.vendor.vStoreSettings.closingStyle, vacation.closingStyle);

			switch (vacation.closingStyle) {
			// instantly close
			case 'instantly' :
				await this.clearAndType(selector.vendor.vStoreSettings.setVacationMessageInstantly, vacation.instantly.vacationMessage);
				break;

				// datewise close
			case 'datewise' :{
				const vacationDayFrom = (vacation.datewise.vacationDayFrom()).split(',')[0] as string;
				const vacationDayTo = (vacation.datewise.vacationDayTo(vacationDayFrom)).split(',')[0] as string;
				await this.setAttributeValue(selector.vendor.vStoreSettings.vacationDateRangeFrom, 'value', vacationDayFrom);
				await this.setAttributeValue(selector.vendor.vStoreSettings.vacationDateRangeTo, 'value', vacationDayTo);
				await this.clearAndType(selector.vendor.vStoreSettings.setVacationMessageDatewise, vacation.datewise.vacationMessage);
				await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vStoreSettings.saveVacationEdit);
				break;
			}

			default :
				break;
			}
		}
	}

	// vendor delete pervious datewise vacation settings if any
	async deletePreviousDatewiseVacation(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsStore);
		const noVacationIsSetIsVisible = await this.isVisible(selector.vendor.vStoreSettings.noVacationIsSet);
		if (!noVacationIsSetIsVisible) {
			await this.hover(selector.vendor.vStoreSettings.vacationRow);
			await this.click(selector.vendor.vStoreSettings.deleteSavedVacationSchedule);
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vStoreSettings.confirmDeleteSavedVacationSchedule);
		}

		// update settings
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vStoreSettings.updateSettings);
		await this.toContainText(selector.vendor.vStoreSettings.updateSettingsSuccessMessage, data.vendor.vendorInfo.storeSettingsSaveSuccessMessage);

	}


	// vendor set catalog mode settings
	async catalogModeSettings(): Promise<void> {
		const catalogModeEnabled = await this.isVisible(selector.vendor.vStoreSettings.removeAddToCartButton);
		if (catalogModeEnabled) {
			await this.check(selector.vendor.vStoreSettings.removeAddToCartButton);
			await this.check(selector.vendor.vStoreSettings.hideProductPrice);
			await this.checkIfVisible(selector.vendor.vStoreSettings.enableRequestQuoteSupport);
		}
	}


	// vendor set discount settings
	async discountSettings(amountDiscount: vendor['vendorInfo']['amountDiscount']): Promise<void> {
		const discountEnabled = await this.isVisible(selector.vendor.vStoreSettings.enableStoreWideDiscount);
		if (discountEnabled) {
			await this.check(selector.vendor.vStoreSettings.enableStoreWideDiscount);
			await this.clearAndType(selector.vendor.vStoreSettings.minimumOrderAmount, amountDiscount.minimumOrderAmount);
			await this.clearAndType(selector.vendor.vStoreSettings.percentage, amountDiscount.discountPercentage);
		}
	}


	// vendor set biography settings
	async biographySettings(biography: string): Promise<void> {
		await this.typeFrameSelector(selector.vendor.vStoreSettings.biographyIframe, selector.vendor.vStoreSettings.biographyHtmlBody, biography);
	}


	// vendor set store support settings
	async storeSupportSettings(supportButtonText: string): Promise<void> {
		const storeSupportEnabled = await this.isVisible(selector.vendor.vStoreSettings.removeAddToCartButton);
		if (storeSupportEnabled) {
			await this.check(selector.vendor.vStoreSettings.showSupportButtonInStore);
			await this.check(selector.vendor.vStoreSettings.showSupportButtonInSingleProduct);
			await this.clearAndType(selector.vendor.vStoreSettings.supportButtonText, supportButtonText);
		}
	}


	// vendor set minmax settings
	async minMaxSettings(minMax: vendor['vendorInfo']['minMax']): Promise<void> {
		const minMaxEnabled = await this.isVisible(selector.vendor.vStoreSettings.enableMinMaxQuantities);
		if (minMaxEnabled) {
			// min max quantities
			await this.check(selector.vendor.vStoreSettings.enableMinMaxQuantities);
			await this.clearAndType(selector.vendor.vStoreSettings.minimumProductQuantityToPlaceAnOrder, minMax.minimumProductQuantity);
			await this.clearAndType(selector.vendor.vStoreSettings.maximumProductQuantityToPlaceAnOrder, minMax.maximumProductQuantity);

			// min max amount
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


	// vendor set delivery settings
	async setDeliveryTimeSettings(deliveryTime: vendor['deliveryTime']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsDeliveryTime);
		// delivery support
		await this.check(selector.vendor.vDeliveryTimeSettings.homeDelivery);
		await this.check(selector.vendor.vDeliveryTimeSettings.storePickup);
		await this.clearAndType(selector.vendor.vDeliveryTimeSettings.deliveryBlockedBuffer, deliveryTime.deliveryBlockedBuffer);
		await this.clearAndType(selector.vendor.vDeliveryTimeSettings.timeSlot, deliveryTime.timeSlot);
		await this.clearAndType(selector.vendor.vDeliveryTimeSettings.orderPerSlot, deliveryTime.orderPerSlot);
		for (const day of deliveryTime.days) {
			await this.enableSwitcherDeliveryTime(selector.vendor.vDeliveryTimeSettings.deliveryDaySwitch(day));
			if (deliveryTime.choice === 'full-day'){
				await this.click(selector.vendor.vDeliveryTimeSettings.openingTime(day));
				await this.page.getByRole('listitem').filter({ hasText: 'Full day' }).click();
			} else {
				await this.setAttributeValue(selector.vendor.vDeliveryTimeSettings.openingTime(day), 'value', deliveryTime.openingTime);
				await this.setAttributeValue(selector.vendor.vDeliveryTimeSettings.openingTimeHiddenInput(day), 'value', deliveryTime.openingTime);
				await this.setAttributeValue(selector.vendor.vDeliveryTimeSettings.closingTime(day), 'value', deliveryTime.closingTime);
				await this.setAttributeValue(selector.vendor.vDeliveryTimeSettings.closingTimeHiddenInput(day), 'value', deliveryTime.closingTime);
			}
		}
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.settingsDeliveryTime, selector.vendor.vDeliveryTimeSettings.updateSettings, 302);
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
		await this.clearAndType(selector.vendor.vShippingSettings.shippingPolicies.refundPolicy, shippingPolicy.refundPolicy);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vShippingSettings.shippingPolicies.saveSettings);
		await this.toContainText(selector.vendor.vShippingSettings.updateSettingsSuccessMessage, shippingPolicy.saveSuccessMessage);
	}


	// vendor set shipping settings
	async setShippingSettings(shipping: any): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipping);
		// edit shipping zone
		await this.hover(selector.vendor.vShippingSettings.shippingZoneCell(shipping.shippingZone));
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vShippingSettings.editShippingZone(shipping.shippingZone));

		// add shipping method if not available
		const methodIsVisible = await this.isVisible(selector.vendor.vShippingSettings.shippingMethodCell(shipping.shippingMethod));
		if (!methodIsVisible) {
			await this.click(selector.vendor.vShippingSettings.addShippingMethod);
			await this.selectByValue(selector.vendor.vShippingSettings.shippingMethod, shipping.selectShippingMethod);
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vShippingSettings.shippingMethodPopupAddShippingMethod);
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
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vShippingSettings.shippingSettingsSaveSettings);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vShippingSettings.saveChanges);
		await this.toContainText(selector.vendor.vShippingSettings.updateSettingsSuccessMessage, shipping.saveSuccessMessage);
	}


	// vendor set shipstation settings
	async setShipStation(shipStation: vendor['shipStation']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipstation);

		const allStatus = await this.getMultipleElementTexts(selector.vendor.vShipStationSettings.selectedStatus);
		const statusIsSelected = allStatus.includes('×'+ shipStation.status);
		if (!statusIsSelected){
			await this.clearAndType(selector.vendor.vShipStationSettings.exportOrderStatusesInput, shipStation.status);
			await this.toContainText(selector.vendor.vShipStationSettings.result, shipStation.status);
			await this.press(data.key.enter);
		}

		// await this.click(selector.vendor.vShipStationSettings.shippedOrderStatusDropdown);
		// await this.clearAndType(selector.vendor.vShipStationSettings.shippedOrderStatusInput, shipStation.status);//todo: need to fix : locator issue
		// await this.toContainText(selector.vendor.vShipStationSettings.result, shipStation.status);
		// await this.press(data.key.enter);

		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.vendor.vShipStationSettings.saveChanges);
		await this.toContainText(selector.vendor.vShipStationSettings.saveSuccessMessage, 'Your changes has been updated!');
		await this.click(selector.vendor.vShipStationSettings.successOk);
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
		//todo: add addon
		if (rma.rmaLength === 'limited'){
			await this.clearAndType(selector.vendor.vRmaSettings.lengthValue, rma.lengthValue);
			await this.selectByValue(selector.vendor.vRmaSettings.lengthDuration, rma.lengthDuration);
		}
		// check if refund reason exists
		const refundReasonIsVisible = await this.isVisible(selector.vendor.vRmaSettings.refundReasonsFirst);
		if (refundReasonIsVisible) {
			await this.checkMultiple(selector.vendor.vRmaSettings.refundReasons);
		}
		await this.typeFrameSelector(selector.vendor.vRmaSettings.refundPolicyIframe, selector.vendor.vRmaSettings.refundPolicyHtmlBody, rma.refundPolicyHtmlBody);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.settingsRma, selector.vendor.vRmaSettings.saveChanges, 302);
		await this.toContainText(selector.vendor.vRmaSettings.updateSettingsSuccessMessage, rma.saveSuccessMessage);
	}

	// vendor set seo settings
	async setStoreSeo(seo: vendor['seo']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsSeo);

		await this.clearAndType(selector.vendor.vStoreSeoSettings.seoTitle, seo.seoTitle);
		await this.clearAndType(selector.vendor.vStoreSeoSettings.metaDescription, seo.metaDescription);
		await this.clearAndType(selector.vendor.vStoreSeoSettings.metaKeywords, seo.metaKeywords);

		await this.clearAndType(selector.vendor.vStoreSeoSettings.facebook.facebookTitle, seo.facebookTitle);
		await this.clearAndType(selector.vendor.vStoreSeoSettings.facebook.facebookDescription, seo.facebookDescription);

		await this.clearAndType(selector.vendor.vStoreSeoSettings.twitter.twitterTitle, seo.twitterTitle);
		await this.clearAndType(selector.vendor.vStoreSeoSettings.twitter.twitterDescription, seo.twitterDescription);

		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vStoreSeoSettings.saveChanges);
		await this.toContainText(selector.vendor.vStoreSeoSettings.updateSettingsSuccessMessage, 'Your changes has been updated!');
	}


}
