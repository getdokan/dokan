import { test, request, Page } from '@playwright/test';
import { VendorToolsPage } from '@pages/vendorToolsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Vendor tools test', () => {
    let vendor: VendorToolsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorToolsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.deleteAllProducts('p0_v1', payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    //vendor

    test('vendor can view tools menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorToolsRenderProperly();
    });

    test('vendor can export product as xml', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.exportProduct('xml');
    });

    test('vendor can export product as csv', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.exportProduct('csv');
    });

    test('vendor can import product as xml', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.importProduct('xml', 'utils/sampleData/products.xml');
    });

    test('vendor can import product as csv', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.importProduct('csv', 'utils/sampleData/products.csv');
    });
});
