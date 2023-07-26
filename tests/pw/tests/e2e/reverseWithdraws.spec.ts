import { test, Page } from '@playwright/test';
import { ReverseWithdrawsPage } from 'pages/reverseWithdrawsPage';
import { ApiUtils } from 'utils/apiUtils';
import { dbUtils } from 'utils/dbUtils';
import { dbData } from 'utils/dbData';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let admin: ReverseWithdrawsPage;
let aPage: Page;
let apiUtils: ApiUtils;


test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	admin = new ReverseWithdrawsPage(aPage);

	apiUtils = new ApiUtils(request);
	await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrderCod, 'wc-completed', payloads.vendorAuth);

});


test.afterAll(async ( ) => {
	await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, { ...dbData.dokan.reverseWithdrawSettings, enabled: 'off' });
	await aPage.close();
});


test.describe('Reverse withdraw test', () => {


	test('dokan admin reverse withdraw menu page is rendering properly @lite @pro @explo', async ( ) => {
		await admin.adminReverseWithdrawRenderProperly();
	});

	test('filter reverse withdraws by store @lite @pro', async ( ) => {
		await admin.filterReverseWithdraws(data.predefined.vendorStores.vendor1);
	});

	test.only('admin can crete reverse withdraws @lite @pro', async ( ) => {
		await admin.addReverseWithdrawal(data.reverseWithdraw);
	});


	//todo: filter reverse withdraws by calendar
	//TODO: add vendor tests

});
