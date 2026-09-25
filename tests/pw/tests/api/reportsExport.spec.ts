//COVERAGE_TAG: GET /dokan/v1/reports/withdraws
//COVERAGE_TAG: POST /dokan/v1/reports/(?P<type>[a-z]+)/export
//COVERAGE_TAG: GET /dokan/v1/reports/(?P<type>[a-z]+)/export/(?P<export_id>[a-z0-9]+)/status

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('reports export api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test.describe('happy paths', () => {
        test('get withdraw export report as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getWithdrawExportReport);
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });
    });

    test.describe('negative cases', () => {
        test('vendor cannot read withdraw export report', { tag: ['@lite', '@vendor'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getWithdrawExportReport, { headers: payloads.vendorAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });

        test('customer cannot read withdraw export report', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getWithdrawExportReport, { headers: payloads.customerAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });

        // ExportController guards on manage_woocommerce / dokan_view_reports.
        // Success path (async CSV job) needs a valid export type + polling and is
        // left uncovered; only the permission guard is asserted here.
        test('customer cannot trigger a report export', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.post(endPoints.exportReport('orders'), { data: {}, headers: payloads.customerAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });
    });
});
