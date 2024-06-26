import { test, request, Page } from '@playwright/test';
import { AdminDashboardPage } from '@pages/adminDashboardPage';
import { VendorDashboardPage } from '@pages/vendorDashboardPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Dashboard test', () => {
    let admin: AdminDashboardPage;
    let vendor: VendorDashboardPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new AdminDashboardPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorDashboardPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin can view Dokan dashboard', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminDashboardRenderProperly();
    });

    test('admin can evaluate dashboard at a glance values', { tag: ['@lite', '@admin'] }, async () => {
        const summary = await apiUtils.getAdminReportSummary(payloads.adminAuth);
        await admin.dokanAtAGlanceValueAccuracy(summary);
    });

    test('admin can add Dokan news subscriber', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addDokanNewsSubscriber(data.user.userDetails);
    });

    //vendor

    test('vendor can view vendor dashboard', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorDashboardRenderProperly();
    });
});
