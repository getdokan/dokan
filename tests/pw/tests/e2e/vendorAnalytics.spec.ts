import { test, Page } from '@playwright/test';
import { VendorAnalyticsPage } from 'pages/vendorAnalyticsPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Vendor analytics test', () => {


	let vendor: VendorAnalyticsPage;
	let vPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new VendorAnalyticsPage(vPage);

		// apiUtils = new ApiUtils(request);

	});


	test.afterAll(async () => {
		await vPage.close();
	});

	test('vendor analytics menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorAnalyticsRenderProperly();
	});


});