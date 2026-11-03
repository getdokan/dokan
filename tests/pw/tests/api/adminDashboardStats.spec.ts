//COVERAGE_TAG: GET /dokan/v1/admin/dashboard/todo
//COVERAGE_TAG: GET /dokan/v1/admin/dashboard/analytics
//COVERAGE_TAG: GET /dokan/v1/admin/dashboard/monthly-overview
//COVERAGE_TAG: GET /dokan/v1/admin/dashboard/sales-chart
//COVERAGE_TAG: GET /dokan/v1/admin/dashboard/all-time-stats
//COVERAGE_TAG: GET /dokan/v1/admin/dashboard/top-performing-vendors
//COVERAGE_TAG: GET /dokan/v1/admin/dashboard/most-reviewed-products
//COVERAGE_TAG: GET /dokan/v1/admin/dashboard/vendor-metrics
//COVERAGE_TAG: GET /dokan/v1/admin/dashboard/status

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('admin dashboard stats api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    const readEndpoints = [
        ['todo', endPoints.getAdminDashboardTodo],
        ['analytics', endPoints.getAdminDashboardAnalytics],
        ['all-time-stats', endPoints.getAdminDashboardAllTimeStats],
        ['top-performing-vendors', endPoints.getAdminDashboardTopPerformingVendors],
        ['most-reviewed-products', endPoints.getAdminDashboardMostReviewedProducts],
        ['status', endPoints.getAdminDashboardStatus],
    ] as const;

    // month-scoped endpoints accept an optional YYYY-MM param
    const monthEndpoints = [
        ['monthly-overview', endPoints.getAdminDashboardMonthlyOverview],
        ['sales-chart', endPoints.getAdminDashboardSalesChart],
        ['vendor-metrics', endPoints.getAdminDashboardVendorMetrics],
    ] as const;

    test.describe('happy paths', () => {
        for (const [name, url] of readEndpoints) {
            test(`get admin dashboard ${name} as admin`, { tag: ['@lite', '@admin'] }, async () => {
                const [response, responseBody] = await apiUtils.get(url);
                expect(response.ok()).toBeTruthy();
                expect(responseBody).toBeTruthy();
            });
        }

        for (const [name, url] of monthEndpoints) {
            test(`get admin dashboard ${name} with date param as admin`, { tag: ['@lite', '@admin'] }, async () => {
                const [response, responseBody] = await apiUtils.get(url, { params: { date: '2026-01' } });
                expect(response.ok()).toBeTruthy();
                expect(responseBody).toBeTruthy();
            });
        }
    });

    test.describe('edge cases', () => {
        for (const [name, url] of monthEndpoints) {
            test(`get admin dashboard ${name} rejects malformed date param`, { tag: ['@lite', '@admin'] }, async () => {
                const [response] = await apiUtils.get(url, { params: { date: 'not-a-date' } }, false);
                expect(response.status()).toBe(400);
            });
        }
    });

    test.describe('negative cases', () => {
        test('vendor cannot access admin dashboard stats', { tag: ['@lite', '@vendor'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getAdminDashboardTodo, { headers: payloads.vendorAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });

        test('customer cannot access admin dashboard stats', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getAdminDashboardAnalytics, { headers: payloads.customerAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });
    });
});
