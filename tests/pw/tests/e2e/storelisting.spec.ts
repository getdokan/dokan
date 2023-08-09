import { test, Page } from '@playwright/test';
import { StoreListingPage } from 'pages/storeListingPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Store listing functionality test', () => {


	let customer: StoreListingPage;
	let cPage: Page;
	let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser }) => {
		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		cPage = await customerContext.newPage();
		customer = new StoreListingPage(cPage);
		// apiUtils = new ApiUtils(request);
	});


	test.afterAll(async () => {
		await cPage.close();
	});


	// store listing


	test('dokan store list page is rendering properly @lite @explo', async ( ) => {
		await customer.storeListRenderProperly();
	});

	test('customer can sort stores @lite', async ( ) => {
		await customer.sortStores(data.storeList.sort);
	});

	test('customer can change store view layout @lite', async ( ) => {
		await customer.storeViewLayout(data.storeList.layout.list);
	});

	test('customer can search store @lite', async ( ) => {
		await customer.searchStore(data.predefined.vendorStores.vendor1);
	});

	test('customer can view stores on map @pro', async ( ) => {
		await customer.storeOnMap();
		// await customer.storeOnMap(data.predefined.vendorStores.vendor1);
	});

	test('customer can go to single store from store list @lite', async ( ) => {
		await customer.goToSingleStoreFromStoreListing(data.predefined.vendorStores.vendor1);
	});


});
