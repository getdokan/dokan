import { test, Page } from '@playwright/test';
import { StoreCategoriesPage, ApiUtils, data, payloads, dbUtils, dbData } from './storeCategoriesPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const { VENDOR_ID, VENDOR2_ID } = process.env;

test.describe('Store categories test', () => {
    let admin: StoreCategoriesPage;
    let vendor: StoreCategoriesPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let categoryName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new StoreCategoriesPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new StoreCategoriesPage(vPage);
        apiUtils = new ApiUtils(null);
        [, , categoryName] = await apiUtils.createStoreCategory(payloads.createStoreCategory(), payloads.adminAuth);
    });

    test.afterAll(async () => { await aPage?.close(); await vPage?.close(); await apiUtils.dispose(); });

    test('admin can view store category page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminStoreCategoryRenderProperly(); });
    test('admin can add store category', { tag: ['@pro', '@admin'] }, async () => { await admin.addStoreCategory(data.storeCategory()); });
    test('admin can search store category', { tag: ['@pro', '@admin'] }, async () => { await admin.searchStoreCategory(categoryName); });
    test('admin can edit store category', { tag: ['@pro', '@admin'] }, async () => { await admin.editStoreCategory({ ...data.storeCategory(), name: categoryName }); });

    test('admin can set default store category', { tag: ['@pro', '@admin'] }, async () => {
        await admin.updateStoreCategory(categoryName, 'set-default');
        await apiUtils.setDefaultStoreCategory('Uncategorized', payloads.adminAuth);
    });

    test('admin can delete store category', { tag: ['@pro', '@admin'] }, async () => {
        const [, , name] = await apiUtils.createStoreCategory(payloads.createStoreCategory(), payloads.adminAuth);
        await admin.updateStoreCategory(name, 'delete');
    });

    test('vendor can update own store category', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorUpdateStoreCategory(categoryName); });

    test('admin can assign store category to vendor (single)', { tag: ['@pro', '@admin'] }, async () => {
        const [, , name] = await apiUtils.createStoreCategory(payloads.createStoreCategory(), payloads.adminAuth);
        await admin.assignStoreCategoryToVendor(VENDOR_ID, [name]);
    });

    test('admin can assign store category to vendor (multiple)', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.general, { store_category_type: 'multiple' });
        const [, , category2Name] = await apiUtils.createStoreCategory(payloads.createStoreCategory(), payloads.adminAuth);
        await admin.assignStoreCategoryToVendor(VENDOR2_ID, [categoryName, category2Name]);
    });
});
