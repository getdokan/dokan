import { test, request, Page } from '@playwright/test';
import { StoresPage } from '@pages/storesPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { VENDOR_ID } = process.env;

test.describe('Stores test', () => {
    let admin: StoresPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new StoresPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    // stores

    test('admin can view vendors menu page', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminVendorsRenderProperly();
    });

    test('admin can view vendor details', { tag: ['@pro', '@admin'] }, async () => {
        await admin.viewVendorDetails(VENDOR_ID);
    });

    test('admin can email vendor', { tag: ['@pro', '@admin'] }, async () => {
        await admin.emailVendor(VENDOR_ID, data.vendor.vendorInfo.sendEmail);
    });

    test('admin can add vendor', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addVendor(data.vendor.vendorInfo);
    });

    test('admin can search vendors', { tag: ['@lite', '@admin'] }, async () => {
        await admin.searchVendor(data.predefined.vendorStores.vendor1);
    });

    test("admin can disable vendor's selling capability", { tag: ['@lite', '@admin'] }, async () => {
        const [, , storeName] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth);
        await admin.updateVendor(storeName, 'disable');
    });

    test("admin can enable vendor's selling capability", { tag: ['@lite', '@admin'] }, async () => {
        const [, , storeName] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth);
        await admin.updateVendor(storeName, 'enable');
    });

    test('admin can edit vendor info', { tag: ['@lite', '@admin'] }, async () => {
        await admin.editVendor(data.vendor);
    });

    test('admin can view vendor products', { tag: ['@lite', '@admin'] }, async () => {
        await admin.viewVendor(data.predefined.vendorStores.vendor1, 'products');
    });

    test('admin can view vendor orders', { tag: ['@lite', '@admin'] }, async () => {
        await admin.viewVendor(data.predefined.vendorStores.vendor1, 'orders');
    });

    test('admin can perform vendor bulk actions', { tag: ['@lite', '@admin'] }, async () => {
        await admin.vendorBulkAction('approved');
    });
});
