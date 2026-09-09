//COVERAGE_TAG: POST /dokan/v1/admin/tools/create-pages
//COVERAGE_TAG: GET /dokan/v1/admin/tools/check-all-dokan-pages-exists
//COVERAGE_TAG: POST /dokan/v1/admin/tools/clear-caches

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('admin tools api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test.describe('happy paths', () => {
        test('check all dokan pages exist as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.checkAllDokanPagesExist);
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });

        // create-pages is idempotent — it only creates dokan pages that are missing
        test('create dokan pages as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response, responseBody] = await apiUtils.post(endPoints.createDokanPages, { data: {} });
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });

        test('clear caches as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response, responseBody] = await apiUtils.post(endPoints.clearDokanCaches, { data: {} });
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });
    });

    test.describe('negative cases', () => {
        test('vendor cannot run admin tools', { tag: ['@lite', '@vendor'] }, async () => {
            const [response] = await apiUtils.get(endPoints.checkAllDokanPagesExist, { headers: payloads.vendorAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });

        test('customer cannot clear caches', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.post(endPoints.clearDokanCaches, { data: {}, headers: payloads.customerAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });
    });
});
