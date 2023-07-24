import { test, Page } from '@playwright/test';
import { VendorDashboardPage } from 'pages/vendorDashboardPage';
import { data } from 'utils/testData';


test.describe('Vendor dashboard test', () => {


	let vendorDashboardPage: VendorDashboardPage;
	let vPage: Page;

	test.beforeAll(async ({ browser }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await adminContext.newPage();
		vendorDashboardPage = new VendorDashboardPage(vPage);
	});

	test.afterAll(async ( ) => {
		await vPage.close();
	});


	test('vendor dashboard is rendering properly @lite @pro @explo', async ( ) => {
		await vendorDashboardPage.vendorDashboardRenderProperly();
	});


});