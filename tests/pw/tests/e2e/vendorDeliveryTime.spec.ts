import { test, Page } from '@playwright/test';
import { VendorDeliveryTimePage } from 'pages/vendorDeliveryTimePage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Vendor delivery time test', () => {


	let vendor: VendorDeliveryTimePage;
	let vPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new VendorDeliveryTimePage(vPage);

		// apiUtils = new ApiUtils(request);

	});


	test.afterAll(async () => {
		await vPage.close();
	});

	test('vendor delivery time menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorDeliveryTimeRenderProperly();
	});

	test('vendor delivery time settings menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorDeliveryTimeSettingsRenderProperly();
	});

	//todo: add vendor delivery time setup

});