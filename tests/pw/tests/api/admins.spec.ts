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

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { schemas } from '@utils/schemas';

test.describe('admin api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(({ request }) => {
        apiUtils = new ApiUtils(request);
    });

    test('get admin report overview @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminReportOverview);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get admin report summary @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminReportSummary);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        console.log(responseBody);x
        expect(responseBody).toMatchSchema(schemas.reportSummarySchema);
    });

    test('get admin dashboard feed @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminDashboardFeed);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get admin help @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminHelp);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get changelog lite @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminChangelogLite);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get changelog pro @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminChangelogPro);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get admin notices @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminNotices);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get admin promo notices @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminPromoNotices);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get admin logs @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminLogs);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get admin export logs @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAdminExportLogs);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
