//COVERAGE_TAG: GET /dokan/v1/admin/onboarding
//COVERAGE_TAG: POST /dokan/v1/admin/onboarding

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('admin onboarding api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test.describe('happy paths', () => {
        test('get admin onboarding data as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getAdminOnboarding);
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });
    });

    test.describe('negative cases', () => {
        test('save onboarding rejects missing required fields as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response] = await apiUtils.post(endPoints.saveAdminOnboarding, { data: {} }, false);
            expect(response.status()).toBe(400);
        });

        test('vendor cannot read admin onboarding', { tag: ['@lite', '@vendor'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getAdminOnboarding, { headers: payloads.vendorAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });

        test('customer cannot read admin onboarding', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getAdminOnboarding, { headers: payloads.customerAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });
    });
});
