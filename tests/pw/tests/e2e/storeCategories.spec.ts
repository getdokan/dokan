import { test, Page } from '@playwright/test';
import { StoreCategoriesPage } from 'pages/storeCategoriesPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('Store categories test', () => {


	let admin: StoreCategoriesPage;
	let vendor: StoreCategoriesPage;
	let aPage: Page, vPage: Page;
	let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new StoreCategoriesPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new StoreCategoriesPage(vPage);

		apiUtils = new ApiUtils(request);
	});


	test.afterAll(async () => {
		await aPage.close();
		await vPage.close();
	});


	// store categories

	test('admin store category page is rendering properly @pro @explo', async ( ) => {
		await admin.adminStoreCategoryRenderProperly();
	});

	test('admin can add store category @pro', async ( ) => {
		await admin.addStoreCategory(data.storeCategory.create); //todo:update test data, make it unique, will fail if run multiple times, for all test, rfq,also in test data where, create, and update is used
	});

	test('admin can search store category @pro', async ( ) => {
		await admin.searchStoreCategory(data.storeCategory.create.name);
	});

	test('admin can edit store category @pro', async ( ) => {
		await admin.editStoreCategory(data.storeCategory.update);
	});

	test('admin can set default store category @pro', async ( ) => {
		await admin.updateStoreCategory(data.storeCategory.create.name, 'set-default');
		// reset default category
		await apiUtils.setDefaultStoreCategory('Uncategorized', payloads.adminAuth);
	});

	test('admin can delete store category @pro', async ( ) => {
		await admin.updateStoreCategory(data.storeCategory.create.name, 'delete');
	});

	test('vendor can update own store category @pro', async ( ) => {
		const[,, categoryName] = await apiUtils.createStoreCategory(payloads.createStoreCategory(), payloads.adminAuth);
		await vendor.vendorUpdateStoreCategory(categoryName);
	});

});
