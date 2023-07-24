import { test, Page } from '@playwright/test';
import { ProPromoPage } from 'pages/proPromoPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let proPromoPage: ProPromoPage;
let aPage: Page;
let apiUtils: ApiUtils;

test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	proPromoPage = new ProPromoPage(aPage);
	apiUtils = new ApiUtils(request);
});

test.afterAll(async ( ) => {
	await aPage.close();
});

test.describe('Dokan pro feature promo test', () => {

	// test.use({ storageState: data.auth.adminAuthFile });

	test('dokan pro features promo @lite @pro', async ( ) => {
		await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status:'inactive' }, payloads.adminAuth);
		await proPromoPage.dokanProPromo();
		await apiUtils.updatePlugin('dokan-pro/dokan-pro', { status:'active' }, payloads.adminAuth);
	});

});
