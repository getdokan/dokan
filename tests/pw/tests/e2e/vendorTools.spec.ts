import { test, request, Page } from '@playwright/test';
import { VendorToolsPage } from '@pages/vendorToolsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Vendor tools test', () => {
    let admin: VendorToolsPage;
    let vendor: VendorToolsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new VendorToolsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorToolsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.deleteAllProducts('p0_v1', payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    // admin

    test.only('admin can enable product importer and exporter module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableProductImporterExporterModule();
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

    // admin
    test.only('admin can disable product importer and exporter module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.vendorImportExport, payloads.adminAuth);
        await admin.disableProductImporterExporterModule();
    });
});
