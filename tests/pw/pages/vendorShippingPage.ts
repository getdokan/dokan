import { Page, expect } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { vendor, shipping } from 'utils/interfaces';


export class VendorShippingPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// vendor shipping settings


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


	// vendor set all shipping settings
	async setAllShippingSettings(): Promise<void> {
		await this.addShippingMethod(data.vendor.shipping.shippingMethods.flatRate);
		await this.addShippingMethod(data.vendor.shipping.shippingMethods.freeShipping);
		await this.addShippingMethod(data.vendor.shipping.shippingMethods.localPickup);
		await this.addShippingMethod(data.vendor.shipping.shippingMethods.tableRateShipping);
		await this.addShippingMethod(data.vendor.shipping.shippingMethods.distanceRateShipping);
	}


	// vendor add shipping method
	async addShippingMethod(shipping: any, forceAdd = false, skip?: boolean): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipping);
		// edit shipping zone
		await this.hover(selector.vendor.vShippingSettings.shippingZoneCell(shipping.shippingZone));
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vShippingSettings.editShippingZone(shipping.shippingZone));

		// add shipping method if not available
		let methodExists = await this.isVisible(selector.vendor.vShippingSettings.shippingMethodCell(shipping.shippingMethod));
		if (!methodExists || forceAdd) {
			await this.click(selector.vendor.vShippingSettings.addShippingMethod);
			await this.selectByValue(selector.vendor.vShippingSettings.shippingMethod, shipping.selectShippingMethod);
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vShippingSettings.shippingMethodPopupAddShippingMethod);
			await expect(this.page.getByText(shipping.shippingMethodSaveSuccessMessage)).toBeVisible();
			await expect(this.page.getByText(shipping.zoneSaveSuccessMessage)).toBeVisible();
			methodExists = true;
		}

		// option to skip if shipping method is already available
		if (methodExists && skip){
			return;
		}

		// edit shipping method
		await this.hover(selector.vendor.vShippingSettings.shippingMethodCell(shipping.shippingMethod));
		await this.click(selector.vendor.vShippingSettings.editShippingMethod(shipping.shippingMethod));

		switch (shipping.selectShippingMethod) {

		// flat rate
		case 'flat_rate' :
			await this.clearAndType(selector.vendor.vShippingSettings.flatRateMethodTitle, shipping.shippingMethodTitle);
			await this.clearAndType(selector.vendor.vShippingSettings.flatRateCost, shipping.shippingCost);
			await this.selectByValue(selector.vendor.vShippingSettings.flatRateTaxStatus, shipping.taxStatus);
			await this.clearAndType(selector.vendor.vShippingSettings.flatRateDescription, shipping.description);
			await this.selectByValue(selector.vendor.vShippingSettings.flatRateCalculationType, shipping.calculationType);
			break;

			// free shipping
		case 'free_shipping' :
			await this.clearAndType(selector.vendor.vShippingSettings.freeShippingTitle, shipping.shippingMethodTitle);
			await this.clearAndType(selector.vendor.vShippingSettings.freeShippingMinimumOrderAmount, shipping.freeShippingMinimumOrderAmount);
			break;

			// local pickup
		case 'local_pickup' :
			await this.clearAndType(selector.vendor.vShippingSettings.localPickupTitle, shipping.shippingMethodTitle);
			await this.clearAndType(selector.vendor.vShippingSettings.localPickupCost, shipping.shippingCost);
			await this.selectByValue(selector.vendor.vShippingSettings.localPickupTaxStatus, shipping.taxStatus);
			await this.clearAndType(selector.vendor.vShippingSettings.flatRateDescription, shipping.description);
			break;

			// dokan table rate shipping
		case 'dokan_table_rate_shipping' :
			await this.clearAndType(selector.vendor.vShippingSettings.tableRateShippingMethodTitle, shipping.shippingMethodTitle);
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
			await this.clearAndType(selector.vendor.vShippingSettings.distanceRateShippingMethodTitle, shipping.shippingMethodTitle);
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


	// vendor add shipping method
	async deleteShippingMethod(shipping: shipping['shippingMethods']['flatRate']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.settingsShipping);

		// edit shipping zone
		await this.hover(selector.vendor.vShippingSettings.shippingZoneCell(shipping.shippingZone));
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vShippingSettings.editShippingZone(shipping.shippingZone));

		const noOfMethods = await this.countLocator(selector.vendor.vShippingSettings.shippingMethodCell(shipping.shippingMethod));

		if(noOfMethods > 1){

			(this.lastLocator(selector.vendor.vShippingSettings.shippingMethodCell(shipping.shippingMethod))).hover();
			const deleteMethod = this.lastLocator(selector.vendor.vShippingSettings.deleteShippingMethod(shipping.shippingMethod));
			await this.clickLocatorAndWaitForResponse(data.subUrls.ajax, deleteMethod);
			await this.toHaveCount(selector.vendor.vShippingSettings.shippingMethodCell(shipping.shippingMethod), noOfMethods - 1);

		} else {

			await this.hover(selector.vendor.vShippingSettings.shippingMethodCell(shipping.shippingMethod));
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.vShippingSettings.deleteShippingMethod(shipping.shippingMethod));
			await this.notToBeVisible(selector.vendor.vShippingSettings.shippingZoneCell(shipping.shippingZone));
		}
	}


}
