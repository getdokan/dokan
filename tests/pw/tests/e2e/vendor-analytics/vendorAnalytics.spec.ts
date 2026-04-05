import { test, Page } from '@playwright/test';
import { VendorAnalyticsPage, ApiUtils, payloads } from './vendorAnalyticsPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe.skip('Vendor analytics test', () => {
    let admin: VendorAnalyticsPage;
    let vendor: VendorAnalyticsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new VendorAnalyticsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorAnalyticsPage(vPage);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.vendorAnalytics, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await apiUtils.dispose();
    });

    test('admin can enable vendor analytics module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableVendorAnalyticsModule(); });
    test('vendor can view analytics menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorAnalyticsRenderProperly(); });

    test('admin can disable vendor analytics module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.vendorAnalytics, payloads.adminAuth);
        await admin.disableVendorAnalyticsModule();
    });
});
