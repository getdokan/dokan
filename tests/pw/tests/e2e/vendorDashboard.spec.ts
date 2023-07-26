import { test, Page } from '@playwright/test';
import { VendorDashboardPage } from 'pages/vendorDashboardPage';
import { data } from 'utils/testData';


test.describe('Vendor dashboard test', () => {


	let vendor: VendorDashboardPage;
	let vPage: Page;


	test.beforeAll(async ({ browser }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await adminContext.newPage();
		vendor = new VendorDashboardPage(vPage);
	});


	test.afterAll(async ( ) => {
		await vPage.close();
	});


	test('vendor dashboard is rendering properly @lite @pro @explo', async ( ) => {
		await vendor.vendorDashboardRenderProperly();
	});


});