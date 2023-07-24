import { test, Page } from '@playwright/test';
import { ReverseWithdrawsPage } from 'pages/reverseWithdrawsPage';
import { ApiUtils } from 'utils/apiUtils';
import { dbUtils } from 'utils/dbUtils';
import { dbData } from 'utils/dbData';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let reverseWithdrawsPage: ReverseWithdrawsPage;
let aPage: Page;
let apiUtils: ApiUtils;

test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	reverseWithdrawsPage = new ReverseWithdrawsPage(aPage);
	apiUtils = new ApiUtils(request);
	// await reverseWithdrawsPage.reCreateReverseWithdrawalPaymentViaSettingsSave(); //TODO: user db manipulation api also needs this
	await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrderCod, 'wc-completed', payloads.vendorAuth);

});

test.afterAll(async ( ) => {
	await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, { ...dbData.dokan.reverseWithdrawSettings, enabled: 'off' });
	await aPage.close();
});

test.describe('Reverse withdraw test', () => {


	test('dokan admin reverse withdraw menu page is rendering properly @lite @pro @explo', async ( ) => {
		await reverseWithdrawsPage.adminReverseWithdrawRenderProperly();
	});

	// test('reverse Withdraw payment product exists @lite @pro', async ( ) => {
	// 	const product = await apiUtils.productExistsOrNot('Reverse Withdrawal Payment',  payloads.adminAuth);
	// 	expect(product).toBeTruthy();
	// });

	test('filter reverse withdraws by store @lite @pro', async ( ) => {
		await reverseWithdrawsPage.filterReverseWithdraws(data.predefined.vendorStores.vendor1);
	});

	//todo: admin can add reverse withdraw
	//todo: filter reverse withdraws by calendar
	//TODO: add vendor tests

});
