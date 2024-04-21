import { test, Page } from '@playwright/test';
import { VendorReportsPage } from '@pages/vendorReportsPage';
import { data } from '@utils/testData';

test.describe('Vendor analytics test', () => {
    let vendor: VendorReportsPage;
    let vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorReportsPage(vPage);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    //vendor

    test('vendor reports menu page is rendering properly', { tag: ['@pro', '@exp', '@vendor'] }, async () => {
        await vendor.vendorReportsRenderProperly();
    });

    test('vendor can export statement', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.exportStatement();
    });
});
