import { test, Page } from '@playwright/test';
import { SingleStorePage } from 'pages/singleStorePage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Single store functionality test', () => {


	let customer: SingleStorePage;
	let page: Page;
	// let apiUtils: ApiUtils;

	test.beforeAll(async ({ browser }) => {
		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		page = await customerContext.newPage();
		customer = new SingleStorePage(page);
		// apiUtils = new ApiUtils(request);
	});

	test.afterAll(async () => {
		await page.close();
	});

	// single store page

	test.skip('dokan single store page is rendering properly @lite @pro @explo', async ( ) => {
		//TODO: need toc on store and admin settings
		await customer.singleStoreRenderProperly(data.predefined.vendorStores.vendor1);  //TODO: compatible with all four layout
	});

	test.skip('customer can view store open-close time on single store @lite @pro', async ( ) => {
		//TODO: need store open close
		await customer.storeOpenCloseTime(data.predefined.vendorStores.vendor1);
	});

	test('customer can search product on single store @lite @pro', async ( ) => {
		await customer.singleStoreSearchProduct(data.predefined.vendorStores.vendor1, data.predefined.simpleProduct.product1.name);
	});

	test('customer can sort products on single store @lite @pro', async ( ) => {
		await customer.singleStoreSortProducts(data.predefined.vendorStores.vendor1, 'price');
	});

	test.skip('customer can view store terms and conditions @lite @pro', async ( ) => {
		//TODO: need toc on store and admin settings
		await customer.storeTermsAndCondition(data.predefined.vendorStores.vendor1, data.vendor.toc);
	});

	test.skip('customer can share store @pro', async ( ) => {
		await customer.storeShare(data.predefined.vendorStores.vendor1, data.storeShare.facebook);  //todo: fix parameter
	});


});
