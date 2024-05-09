import { test, Page } from '@playwright/test';
import { VendorAnalyticsPage } from '@pages/vendorAnalyticsPage';
import { data } from '@utils/testData';

test.describe('Vendor analytics test', () => {
    let vendor: VendorAnalyticsPage;
    let vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorAnalyticsPage(vPage);
    });

    test.afterAll(async () => {
        await vPage.close();
    });

    // vendor

    test('vendor can view analytics menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorAnalyticsRenderProperly();
    });
});
