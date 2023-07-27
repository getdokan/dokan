import { test, Page } from '@playwright/test';
import { StoresPage } from 'pages/storesPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Stores test', () => {

	let admin: StoresPage;
	let aPage: Page;
	let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new StoresPage(aPage);
		// apiUtils = new ApiUtils(request);
		// TODO: create store via api and use that vendor for all tests instead of vendor1

	});


	test.afterAll(async () => {
		await aPage.close();
	});


	// stores

	test('admin vendors menu page is rendering properly @lite @pro @explo', async ( ) => {
		await admin.adminVendorsRenderProperly();
	});

	test('admin can add vendor @lite @pro', async ( ) => {
		await admin.addVendor(data.vendor.vendorInfo);
	});

	test('admin can search vendors @lite @pro', async ( ) => {
		await admin.searchVendor(data.predefined.vendorStores.vendor1);
	});

	test('admin can disable vendor\'s selling capability @lite @pro', async ( ) => {
		await admin.updateVendor(data.predefined.vendorStores.vendor1, 'disable');
	});

	test('admin can enable vendor\'s selling capability @lite @pro', async ( ) => {
		await admin.updateVendor(data.predefined.vendorStores.vendor1, 'enable');
	});

	test('admin can edit vendor info @lite @pro', async ( ) => {
		await admin.editVendor(data.vendor);
	});

	test('admin can view vendor products @lite @pro', async ( ) => {
		await admin.viewVendor(data.predefined.vendorStores.vendor1, 'products');
	});

	test('admin can view vendor orders @lite @pro', async ( ) => {
		await admin.viewVendor(data.predefined.vendorStores.vendor1, 'orders');
	});

	test('admin can perform vendor bulk actions @lite @pro', async ( ) => {
		await admin.vendorBulkAction('approved');
	});

});
