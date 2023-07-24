import { test, Page } from '@playwright/test';
import { VendorDashboardPage } from 'pages/vendorDashboardPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('Vendor dashboard test', () => {


	let vendorDashboardPage: VendorDashboardPage;
	let vPage: Page;
	let apiUtils: ApiUtils;

	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await adminContext.newPage();
		vendorDashboardPage = new VendorDashboardPage(vPage);
		apiUtils = new ApiUtils(request);
	});

	test.afterAll(async ( ) => {
		await vPage.close();
	});

	// test.use({ storageState: data.auth.vendorAuthFile });

	test('vendor dashboard is rendering properly @lite @pro @explo', async ( ) => {
		await vendorDashboardPage.vendorDashboardRenderProperly();
	});


});