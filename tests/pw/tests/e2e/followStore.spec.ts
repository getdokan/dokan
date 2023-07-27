import { test } from '@playwright/test';
import { FollowStorePage } from 'pages/followStorePage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Follow stores functionality test', () => {


	let vendor: FollowStorePage;
	let customer: FollowStorePage;
	let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, request }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		const vPage = await vendorContext.newPage();
		vendor = new FollowStorePage(vPage);

		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		const cPage = await customerContext.newPage();
		customer = new FollowStorePage(cPage);

		apiUtils = new ApiUtils(request);

	});


	test.afterAll(async ({ browser }) => {
		await browser.close();
	});


	// follow store


	test('customer can follow store on store listing @pro', async ( ) => {
		await customer.followStore(data.predefined.vendorStores.vendor1, data.predefined.vendorStores.followFromStoreListing); //TODO: update parameter
	});

	test('customer can follow store on single store @pro', async ( ) => {
		await customer.followStore(data.predefined.vendorStores.vendor1, data.predefined.vendorStores.followFromSingleStore);
	});

	test('vendor followers menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorFollowersRenderProperly();
	});

	// TODO: vendor can see followers, need followers via api


});
