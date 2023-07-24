import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';

const { DOKAN_PRO } = process.env;


export class VendorDashboardPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// vendor dashboard


	// vendor dashboard render properly
	async vendorDashboardRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.dashboard);

		// at a glance elements are visible
		await this.multipleElementVisible(selector.vendor.vDashboard.atAGlance);

		// graph elements are visible
		await this.multipleElementVisible(selector.vendor.vDashboard.graph);

		// orders elements are visible
		await this.multipleElementVisible(selector.vendor.vDashboard.orders);

		// products elements are visible
		await this.multipleElementVisible(selector.vendor.vDashboard.products);

		if(DOKAN_PRO){

			// profile progress elements are visible
			await this.multipleElementVisible(selector.vendor.vDashboard.profileProgress);

			// reviews elements are visible
			await this.multipleElementVisible(selector.vendor.vDashboard.reviews);

			// announcement elements are visible
			await this.multipleElementVisible(selector.vendor.vDashboard.announcement);

		}

	}

}
