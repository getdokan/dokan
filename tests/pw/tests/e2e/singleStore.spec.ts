import { test, Page } from '@playwright/test';
import { SingleStorePage } from 'pages/singleStorePage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Single store functionality test', () => {


	let customer: SingleStorePage;
	let cPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser }) => {
		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		cPage = await customerContext.newPage();
		customer = new SingleStorePage(cPage);
		// apiUtils = new ApiUtils(request);
	});


	test.afterAll(async () => {
		await cPage.close();
	});


	// single store page

	test('dokan single store page is rendering properly @lite @explo', async ( ) => {
		await customer.singleStoreRenderProperly(data.predefined.vendorStores.vendor1);

	});

	// test.skip('customer can view store open-close time on single store @lite', async ( ) => {
	// 	//todo: pre: need store open close
	// 	await customer.storeOpenCloseTime(data.predefined.vendorStores.vendor1);
	// });

	test('customer can search product on single store @lite', async ( ) => {
		await customer.singleStoreSearchProduct(data.predefined.vendorStores.vendor1, data.predefined.simpleProduct.product1.name);
	});

	test('customer can sort products on single store @lite', async ( ) => {
		await customer.singleStoreSortProducts(data.predefined.vendorStores.vendor1, 'price');
	});

	// test.skip('customer can view store terms and conditions @lite', async ( ) => {
	// 	//todo: pre need toc on store and admin settings
	// 	await customer.storeTermsAndCondition(data.predefined.vendorStores.vendor1, data.vendor.toc);
	// });

	test('customer can share store @pro', async ( ) => {
		await customer.storeShare(data.predefined.vendorStores.vendor1, data.storeShare.facebook);
	});


});
