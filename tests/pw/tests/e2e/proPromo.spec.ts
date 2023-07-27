import { test } from '@playwright/test';
import { ProPromoPage } from 'pages/proPromoPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let admin: ProPromoPage;
let apiUtils: ApiUtils;


test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	const aPage = await adminContext.newPage();
	admin = new ProPromoPage(aPage);

	apiUtils = new ApiUtils(request);
});


test.afterAll(async ({ browser }) => {
	await browser.close();
});


test.describe('Dokan pro feature promo test', () => {


	test('dokan pro features promo @lite @pro', async ( ) => {
		await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status:'inactive' }, payloads.adminAuth);
		await admin.dokanProPromo();
		await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status:'active' }, payloads.adminAuth);
	});

});
