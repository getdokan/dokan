import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';

export class VendorDeliveryTimePage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// delivery time

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


}
