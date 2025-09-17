import { test, request, Page } from '@playwright/test';
import { PrintfulPage } from '@pages/printfulPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
// skipping the test because the printful account needs individual setup and client Key and Secret Key
test.describe.skip('Printful module functionality test', () => {
    let admin: PrintfulPage;
    let vendor: PrintfulPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new PrintfulPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new PrintfulPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.activateModules(payloads.moduleIds.printful, payloads.adminAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.printful, payloads.adminAuth);
        await vPage.close();
        await apiUtils.dispose();
    });

    // admin
    test('admin can enable printful module', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Admin enables Printful module and verifies it is activated', async () => {
            await admin.enablePrintfulModule();
        });
    });

    // vendor
    test('vendor can view printful menu page', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Vendor navigates to Printful Settings page and verifies elements render properly', async () => {
            await vendor.vendorPrintfulSettingsRenderProperly();
        });
    });

    test.skip('vendor can connect printful account', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Vendor connects Printful account and verifies successful connection', async () => {
            await vendor.connectPrintful();
        });
    });

    test.skip('vendor can disconnect printful account', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Vendor disconnects Printful account and verifies it is unlinked', async () => {
            await vendor.disconnectPrintful();
        });
    });

    test('vendor can enable printful shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Vendor enables Printful shipping and verifies status is updated', async () => {
            await vendor.enableShipping('printful');
        });
    });

    test('vendor can enable marketplace shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Vendor enables Marketplace shipping and verifies status is updated', async () => {
            await vendor.enableShipping('marketplace');
        });
    });

    test('vendor can enable both printful and marketplace shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Vendor enables both Printful and Marketplace shipping and verifies settings', async () => {
            await vendor.enableShipping('both');
        });
    });

    // admin
    test('admin can disable printful module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.printful, payloads.adminAuth);
        await test.step('Admin disables Printful module and verifies it is deactivated', async () => {
            await admin.disablePrintfulModule();
        });
    });
});
