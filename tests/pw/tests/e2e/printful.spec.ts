import { test, request, Page } from '@playwright/test';
import { PrintfulPage } from '@pages/printfulPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';

test.describe.skip('Printful test', () => {
    let vendor: PrintfulPage;
    let vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await customerContext.newPage();
        vendor = new PrintfulPage(vPage);
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await vPage.close();
        await apiUtils.dispose();
    });

    test('vendor can view printful menu page', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorPrintfulSettingsRenderProperly();
    });

    test('vendor can connect printful account', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.connectPrintful();
    });

    test('vendor can disconnect printful account', { tag: ['@pro', '@vendor'] }, async () => {
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
});
