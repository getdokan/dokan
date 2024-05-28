import { test, request, Page } from '@playwright/test';
import { AdminDashboardPage } from '@pages/adminDashboardPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Admin dashboard test', () => {
    let admin: AdminDashboardPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new AdminDashboardPage(aPage);
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

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
});
