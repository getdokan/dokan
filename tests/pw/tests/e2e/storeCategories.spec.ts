import { test, request, Page } from '@playwright/test';
import { StoreCategoriesPage } from '@pages/storeCategoriesPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Store categories test', () => {
    let admin: StoreCategoriesPage;
    let vendor: StoreCategoriesPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let categoryName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new StoreCategoriesPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new StoreCategoriesPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , categoryName] = await apiUtils.createStoreCategory(payloads.createStoreCategory(), payloads.adminAuth);
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await apiUtils.dispose();
    });

    // store categories

    test('admin store category page is rendering properly @pro @explo', async () => {
        await admin.adminStoreCategoryRenderProperly();
    });

    test('admin can add store category @pro', async () => {
        await admin.addStoreCategory(data.storeCategory());
    });

    test('admin can search store category @pro', async () => {
        await admin.searchStoreCategory(categoryName);
    });

    test('admin can edit store category @pro', async () => {
        await admin.editStoreCategory({ ...data.storeCategory(), name: categoryName });
    });

    test('admin can set default store category @pro', async () => {
        await admin.updateStoreCategory(categoryName, 'set-default');
        // reset default category
        await apiUtils.setDefaultStoreCategory('Uncategorized', payloads.adminAuth);
    });

    test('admin can delete store category @pro', async () => {
        await admin.updateStoreCategory(categoryName, 'delete');
    });

    test('vendor can update own store category @pro', async () => {
        const [, , categoryName] = await apiUtils.createStoreCategory(payloads.createStoreCategory(), payloads.adminAuth);
        await vendor.vendorUpdateStoreCategory(categoryName);
    });

    // todo: add multi store category tests
});
