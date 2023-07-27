import { test } from '@playwright/test';
import { VendorDashboardPage } from 'pages/vendorDashboardPage';
import { data } from 'utils/testData';


test.describe('Vendor dashboard test', () => {


	let vendor: VendorDashboardPage;


	test.beforeAll(async ({ browser }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		const vPage = await vendorContext.newPage();
		vendor = new VendorDashboardPage(vPage);
	});


	test.afterAll(async ({ browser }) => {
		await browser.close();
	});


	test('vendor dashboard is rendering properly @lite @pro @explo', async ( ) => {
		await vendor.vendorDashboardRenderProperly();
	});


});