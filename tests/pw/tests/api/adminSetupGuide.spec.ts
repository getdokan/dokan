//COVERAGE_TAG: GET /dokan/v1/admin/setup-guide
//COVERAGE_TAG: GET /dokan/v1/admin/setup-guide/(?P<id>[\w-]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('admin setup guide api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test.describe('happy paths', () => {
        test('get setup guide as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getAdminSetupGuide);
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });
    });

    test.describe('negative cases', () => {
        test('vendor cannot read setup guide', { tag: ['@lite', '@vendor'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getAdminSetupGuide, { headers: payloads.vendorAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });

        test('customer cannot read setup guide', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getAdminSetupGuide, { headers: payloads.customerAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });

        test('vendor cannot update setup guide', { tag: ['@lite', '@vendor'] }, async () => {
            const [response] = await apiUtils.post(endPoints.updateAdminSetupGuide, { data: { active: true }, headers: payloads.vendorAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });
    });
});
