import { test, Page } from '@playwright/test';
import { FollowStorePage } from 'pages/followStorePage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Follow stores functionality test', () => {

	// test.use({ storageState: data.auth.customerAuthFile });

	let followStoreVendor: FollowStorePage;
	let followStoreCustomer: FollowStorePage;
	let vPage: Page, cPage: Page;
	let apiUtils: ApiUtils;

	test.beforeAll(async ({ browser, request }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		followStoreVendor = new FollowStorePage(vPage);

		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		cPage = await customerContext.newPage();
		followStoreCustomer = new FollowStorePage(cPage);
		apiUtils = new ApiUtils(request);

	});

	test.afterAll(async () => {
		await vPage.close();
		await cPage.close();
	});


	// follow store


	test('customer can follow store on store listing @pro', async ( ) => {
		await followStoreCustomer.followStore(data.predefined.vendorStores.vendor1, data.predefined.vendorStores.followFromStoreListing); //TODO: update parameter
	});

	test('customer can follow store on single store @pro', async ( ) => {
		await followStoreCustomer.followStore(data.predefined.vendorStores.vendor1, data.predefined.vendorStores.followFromSingleStore);
	});

	test('vendor followers menu page is rendering properly @pro @explo', async ( ) => {
		await followStoreVendor.vendorFollowersRenderProperly();
	});

	// TODO: vendor can see followers, need followers via api


});
