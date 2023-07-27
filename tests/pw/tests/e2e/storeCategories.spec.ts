import { test } from '@playwright/test';
import { StoreCategoriesPage } from 'pages/storeCategoriesPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let admin: StoreCategoriesPage;
let apiUtils: ApiUtils;


test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	const aPage = await adminContext.newPage();
	admin = new StoreCategoriesPage(aPage);
	apiUtils = new ApiUtils(request);
});


test.afterAll(async ({ browser }) => {
	await browser.close();
});


test.describe('Vendors test', () => {


	// store categories

	test('admin store category page is rendering properly @pro @explo', async ( ) => {
		await admin.adminStoreCategoryRenderProperly();
	});

	test('admin can add store category @pro', async ( ) => {
		await admin.addStoreCategory(data.storeCategory.create);
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

	//todo: add vendor tests

});
