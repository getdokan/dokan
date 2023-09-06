import { test, Page } from '@playwright/test';
import { ProPromoPage } from 'pages/proPromoPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe.only('Dokan pro feature promo test', () => {

	let admin: ProPromoPage;
	let aPage: Page;
	let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new ProPromoPage(aPage);

		apiUtils = new ApiUtils(request);
	});


	test.afterAll(async () => {
		await aPage.close();
	});


	test('dokan pro features promo @liteOnly', async ( ) => {
		console.log('server url', process.env.SERVER_URL)
		console.log('customer id',process.env.CUSTOMER_ID)
		console.log('vendor id',process.env.VENDOR_ID)
		console.log('vendor2 id',process.env.VENDOR2_ID)
		console.log('product id',process.env.PRODUCT_ID)
		console.log('v2 product id',process.env.V2_PRODUCT_ID)
		await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status:'inactive' }, payloads.adminAuth);
		await admin.dokanProPromo();
		await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status:'active' }, payloads.adminAuth);
		console.log('server url', process.env.SERVER_URL)
		console.log('customer id',process.env.CUSTOMER_ID)
		console.log('vendor id',process.env.VENDOR_ID)
		console.log('vendor2 id',process.env.VENDOR2_ID)
		console.log('product id',process.env.PRODUCT_ID)
		console.log('v2 product id',process.env.V2_PRODUCT_ID)
	});

});
