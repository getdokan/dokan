import { test, Page } from '@playwright/test';
import { StoreListingPage } from 'pages/storeListingPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Store listing functionality test', () => {


	let storeListingPage: StoreListingPage;
	let page: Page;
	// let apiUtils: ApiUtils;

	test.beforeAll(async ({ browser }) => {
		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		page = await customerContext.newPage();
		storeListingPage = new StoreListingPage(page);
		// apiUtils = new ApiUtils(request);
	});

	test.afterAll(async () => {
		await page.close();
	});


	// store listing


	test('dokan store list page is rendering properly @lite @pro @explo', async ( ) => {
		await storeListingPage.storeListRenderProperly();
	});

	test('customer can sort stores @lite @pro', async ( ) => {
		await storeListingPage.sortStores(data.storeList.sort);
	});

	test('customer can change store view layout @lite @pro', async ( ) => {
		await storeListingPage.storeViewLayout(data.storeList.layout.list);
	});

	test('customer can search store @lite @pro', async ( ) => {
		await storeListingPage.searchStore(data.predefined.vendorStores.vendor1);
	});

	test('customer can view stores on map @pro', async ( ) => {
		await storeListingPage.storeOnMap(); //TODO: need to update based on vendor icon and popup is different
		// await storeListingPage.storeOnMap(data.predefined.vendorStores.vendor1);
	});

	test('customer can go to single store from store list @lite @pro', async ( ) => {
		await storeListingPage.goToSingleStoreFromStoreListing(data.predefined.vendorStores.vendor1);
	});


});
