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

    test('dokan admin dashboard is rendering properly', { tag: ['@lite', '@exp', '@a'] }, async () => {
        await admin.adminDashboardRenderProperly();
    });

    test('admin dashboard at a glance values are accurate', { tag: ['@lite', '@a'] }, async () => {
        const summary = await apiUtils.getAdminReportSummary(payloads.adminAuth);
        await admin.dokanAtAGlanceValueAccuracy(summary);
    });

    test('admin can add dokan news subscriber', { tag: ['@lite', '@a'] }, async () => {
        await admin.addDokanNewsSubscriber(data.user.userDetails);
    });
});
