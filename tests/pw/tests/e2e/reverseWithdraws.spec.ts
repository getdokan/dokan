import { test, Page } from '@playwright/test';
import { ReverseWithdrawsPage } from 'pages/reverseWithdrawsPage';
import { ApiUtils } from 'utils/apiUtils';
import { dbUtils } from 'utils/dbUtils';
import { dbData } from 'utils/dbData';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';

const { PRODUCT_ID } = process.env;


test.describe('Reverse withdraw test', () => {

	let admin: ReverseWithdrawsPage;
	let aPage: Page;
	let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new ReverseWithdrawsPage(aPage);

		apiUtils = new ApiUtils(request);
		await apiUtils.createOrderWithStatus(PRODUCT_ID, payloads.createOrderCod, 'wc-completed', payloads.vendorAuth);

	});


	test.afterAll(async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, { ...dbData.dokan.reverseWithdrawSettings, enabled: 'off' });
		await aPage.close();
	});


	test('dokan admin reverse withdraw menu page is rendering properly @lite @explo', async ( ) => {
		await admin.adminReverseWithdrawRenderProperly();
	});

	test.skip('filter reverse withdraws by store @lite', async ( ) => {
		await admin.filterReverseWithdraws(data.predefined.vendorStores.vendor1); //todo:need to fix
	});

	test('admin can crete reverse withdraws @lite', async ( ) => {
		await admin.addReverseWithdrawal(data.reverseWithdraw);
	});

});
