import { test, Page } from '@playwright/test';
import { VendorReturnRequestPage } from 'pages/vendorReturnRequestPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Vendor rma test', () => {


	let vendor: VendorReturnRequestPage;
	let vPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new VendorReturnRequestPage(vPage);


		// apiUtils = new ApiUtils(request);

	});


	test.afterAll(async () => {
		await vPage.close();
	});


	test('vendor return request menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorReturnRequestRenderProperly();
	});

	test('vendor rma settings menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorRmaSettingsRenderProperly();  //todo: move to settings or not
	});

	test('vendor can set rma settings @pro', async ( ) => {
		await vendor.setRmaSettings(data.vendor.rma);  //todo: move to settings or not
	});


});