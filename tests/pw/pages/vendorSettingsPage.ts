import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';

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
		await this.toBeVisible(selector.vendor.vShipStationSettings.exportOrderStatuses);

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


}
