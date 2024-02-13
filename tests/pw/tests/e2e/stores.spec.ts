import { test, request, Page } from '@playwright/test';
import { StoresPage } from '@pages/storesPage';
// import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
// import { payloads } from '@utils/payloads';

const { VENDOR_ID } = process.env;

test.describe('Stores test', () => {
    let admin: StoresPage;
    let aPage: Page;
    // let apiUtils: ApiUtils;
    // let storeName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new StoresPage(aPage);
        // apiUtils = new ApiUtils(await request.newContext());
        // [,, storeName] = await apiUtils.createStore(payloads.createStore());
    });

    test.afterAll(async () => {
        await aPage.close();
        // await apiUtils.dispose();
    });

    // stores

    test('admin vendors menu page is rendering properly @lite @exp @a', async () => {
        await admin.adminVendorsRenderProperly();
    });

    test('admin can view vendor details @pro @a', async () => {
        await admin.viewVendorDetails(VENDOR_ID);
    });

    test('admin can email vendor @pro @a', async () => {
        await admin.emailVendor(VENDOR_ID, data.vendor.vendorInfo.sendEmail);
    });

    test('admin can add vendor @lite @a', async () => {
        await admin.addVendor(data.vendor.vendorInfo);
    });

    test('admin can search vendors @lite @a', async () => {
        await admin.searchVendor(data.predefined.vendorStores.vendor1);
    });

    test("admin can disable vendor's selling capability @lite @a", async () => {
        await admin.updateVendor(data.predefined.vendorStores.vendor1, 'disable'); //todo: nedd different vendor for this
    });

    test("admin can enable vendor's selling capability @lite @a", async () => {
        await admin.updateVendor(data.predefined.vendorStores.vendor1, 'enable');
    });

    test('admin can edit vendor info @lite @a', async () => {
        await admin.editVendor(data.vendor);
    });

    test('admin can view vendor products @lite @a', async () => {
        await admin.viewVendor(data.predefined.vendorStores.vendor1, 'products');
    });

    test('admin can view vendor orders @lite @a', async () => {
        await admin.viewVendor(data.predefined.vendorStores.vendor1, 'orders');
    });

    test('admin can perform vendor bulk actions @lite @a', async () => {
        await admin.vendorBulkAction('approved');
    });
});
