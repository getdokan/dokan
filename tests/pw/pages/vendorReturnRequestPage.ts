import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
// import { vendor } from 'utils/interfaces';

export class VendorReturnRequestPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// return request

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


}
