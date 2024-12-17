import { test, request, Page } from '@playwright/test';
import { PrintfulPage } from '@pages/printfulPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Printful test', () => {
    let admin: PrintfulPage;
    let vendor: PrintfulPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new PrintfulPage(aPage);

        const customerContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await customerContext.newPage();
        vendor = new PrintfulPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.activateModules(payloads.moduleIds.printful, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.printful, payloads.adminAuth);
        await vPage.close();
        await apiUtils.dispose();
    });

    test('admin can enable printful module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enablePrintfulModule();
    });

    test('vendor can view printful menu page', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorPrintfulSettingsRenderProperly();
    });

    test.skip('vendor can connect printful account', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.connectPrintful();
    });

    test.skip('vendor can disconnect printful account', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.disconnectPrintful();
    });

    test('vendor can enable printful shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.enableShipping('printful');
    });

    test('vendor can enable marketplace shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.enableShipping('marketplace');
    });

    test('vendor can enable both printful and marketplace shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.enableShipping('both');
    });

    // admin

    test('admin can disable printful module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.printful, payloads.adminAuth);
        await admin.disablePrintfulModule();
    });
});
