import { test, Page, request } from '@playwright/test';
import { VendorAnalyticsPage } from '@pages/vendorAnalyticsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Vendor analytics test', () => {
    let admin: VendorAnalyticsPage;
    let vendor: VendorAnalyticsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new VendorAnalyticsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorAnalyticsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.vendorAnalytics, payloads.adminAuth);
        await vPage.close();
    });

    // admin

    test('admin can enable vendor analytics module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableVendorAnalyticsModule();
    });

    // vendor

    test('vendor can view analytics menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorAnalyticsRenderProperly();
    });

    // admin

    test('admin can disable vendor analytics module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.vendorAnalytics, payloads.adminAuth);
        await admin.disableVendorAnalyticsModule();
    });
});
