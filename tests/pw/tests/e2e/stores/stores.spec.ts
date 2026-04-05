import { test, Page } from '@playwright/test';
import { StoresPage, ApiUtils, data, payloads } from './storesPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const { VENDOR_ID, PRODUCT_ID } = process.env;

test.describe('Stores test', () => {
    let admin: StoresPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new StoresPage(aPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => { await aPage?.close(); await apiUtils.dispose(); });

    test('admin can view vendors menu page', { tag: ['@lite', '@exploratory', '@admin'] }, async () => { await admin.adminVendorsRenderProperly(); });
    test('admin can view vendor details', { tag: ['@pro', '@admin'] }, async () => { await admin.viewVendorDetails(VENDOR_ID); });
    test('admin can email vendor', { tag: ['@pro', '@admin'] }, async () => { await admin.emailVendor(VENDOR_ID, data.vendor.vendorInfo.sendEmail); });
    test('admin can add vendor', { tag: ['@lite', '@admin'] }, async () => { await admin.addVendor(data.vendor.vendorInfo); });
    test('admin can search vendors', { tag: ['@lite', '@admin'] }, async () => { await admin.searchVendor(data.predefined.vendorStores.vendor1); });

    test('admin can filter vendors by status (pending)', { tag: ['@lite', '@admin'] }, async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth);
        await apiUtils.updateStoreStatus(sellerId, { status: 'inactive' }, payloads.adminAuth);
        await admin.filterVendors('pending');
    });

    test('admin can filter vendors by status (approved)', { tag: ['@lite', '@admin'] }, async () => { await admin.filterVendors('approved'); });

    test("admin can enable vendor's selling capability", { tag: ['@lite', '@admin'] }, async () => {
        const [, sellerId, storeName] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth);
        await apiUtils.updateStoreStatus(sellerId, { status: 'inactive' }, payloads.adminAuth);
        await admin.updateVendor(storeName, 'enable');
    });

    test("admin can disable vendor's selling capability", { tag: ['@lite', '@admin'] }, async () => {
        const [, , storeName] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth);
        await admin.updateVendor(storeName, 'disable');
    });

    test.skip('admin can edit vendor info', { tag: ['@lite', '@admin'] }, async () => { await admin.editVendor(VENDOR_ID, data.vendor); });
    test('admin can view vendor products', { tag: ['@lite', '@admin'] }, async () => { await admin.viewVendor(data.predefined.vendorStores.vendor1, 'products'); });

    test('admin can view vendor orders', { tag: ['@lite', '@admin'] }, async () => {
        await apiUtils.createOrder(PRODUCT_ID, payloads.createOrder, payloads.vendorAuth);
        await admin.viewVendor(data.predefined.vendorStores.vendor1, 'orders');
    });

    test('admin can perform bulk action on vendors', { tag: ['@lite', '@admin'] }, async () => { await admin.vendorBulkAction('approved'); });
});
