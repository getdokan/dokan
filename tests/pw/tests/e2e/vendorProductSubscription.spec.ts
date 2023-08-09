import { test, Page } from '@playwright/test';
import { VendorProductSubscriptionPage } from 'pages/vendorProductSubscriptionPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Product subscriptions test', () => {


	let vendor: VendorProductSubscriptionPage;
	let vPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new VendorProductSubscriptionPage(vPage);

		// apiUtils = new ApiUtils(request);

	});


	test.afterAll(async () => {
		await vPage.close();
	});

	test('vendor user subscriptions menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorUserSubscriptionsRenderProperly();
	});

	test.skip('vendor can filter user subscriptions @pro @explo', async ( ) => {
		await vendor.filterProductSubscriptions('by-customer', data.customer.username);
	});

	test.skip('vendor can view user subscription @pro @explo', async ( ) => {
		await vendor.viewProductSubscription(data.customer.username);
	});

	//todo: add customer can cancel subscription, change address, change payment, renew now

});