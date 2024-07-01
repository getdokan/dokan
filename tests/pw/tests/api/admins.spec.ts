//COVERAGE_TAG: GET /dokan/v1/admin/report/overview
//COVERAGE_TAG: GET /dokan/v1/admin/report/summary
//COVERAGE_TAG: GET /dokan/v1/admin/dashboard/feed
//COVERAGE_TAG: GET /dokan/v1/admin/help
//COVERAGE_TAG: GET /dokan/v1/admin/changelog/lite
//COVERAGE_TAG: GET /dokan/v1/admin/changelog/pro
//COVERAGE_TAG: GET /dokan/v1/admin/notices/admin
//COVERAGE_TAG: GET /dokan/v1/admin/notices/promo
//COVERAGE_TAG: GET /dokan/v1/admin/logs
//COVERAGE_TAG: GET /dokan/v1/admin/logs/export

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { schemas } from '@utils/schemas';

test.describe('admin api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get admin report overview', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminReportOverview);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.reportOverviewSchema);
    });

    test('get admin report summary', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminReportSummary);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.reportSummarySchema);
    });

    test('get admin dashboard feed', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminDashboardFeed);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.adminDashboardFeedSchema);
    });

    test('get admin help', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminHelp);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.adminHelpSchema);
    });

    test('get changelog lite', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminChangelogLite);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.changelogLiteSchema);
    });

    test('get changelog pro', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminChangelogPro);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.changelogProSchema);
    });

    test('get admin notices', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminNotices);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.adminNoticesSchema);
    });

    test('get admin promo notices', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminPromoNotices);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.adminPromoNoticeSchema);
    });

    test('get admin logs', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminLogs);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.adminLogsSchema);
    });

    test('get admin export logs', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminExportLogs);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.adminExportLogsSchema);
    });
});
