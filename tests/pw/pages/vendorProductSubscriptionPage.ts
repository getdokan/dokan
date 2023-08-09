import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
// import { vendor } from 'utils/interfaces';

export class VendorProductSubscriptionPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// product subscription


	// vendor return request render properly
	async vendorUserSubscriptionsRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.userSubscriptions);

		// filter
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { filterByCustomerInput, result,  ...filters } = selector.vendor.vUserSubscriptions.filters;
		await this.multipleElementVisible(filters);

		const noSubscriptionsFound = await this.isVisible(selector.vendor.vUserSubscriptions.noSubscriptionsFound);
		if (noSubscriptionsFound){
			return;
		}

	}


	// filter product subscriptions
	async filterProductSubscriptions(filterType: string, value: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.userSubscriptions);

		switch(filterType){

		case 'by-customer' :
			await this.click(selector.vendor.vUserSubscriptions.filters.filterByCustomer);
			await this.typeAndWaitForResponse(data.subUrls.ajax, selector.vendor.vUserSubscriptions.filters.filterByCustomerInput, value);
			await this.toContainText(selector.vendor.vUserSubscriptions.filters.result, value);
			await this.press(data.key.enter);
			break;

		case 'by-date' :
			//todo:
			break;

		default :
			break;
		}

		await this. clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.userSubscriptions, selector.vendor.vUserSubscriptions.filters.filter );
		await this.notToHaveCount(selector.vendor.vUserSubscriptions.numberOfRowsFound, 0);
	}


	// vendor view product subscription
	async viewProductSubscription(value: string){
		await this.filterProductSubscriptions('by-customer', value);

	}


}
