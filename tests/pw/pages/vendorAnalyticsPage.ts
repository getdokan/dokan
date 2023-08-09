import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';

export class VendorAnalyticsPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// vendor analytics


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

}
