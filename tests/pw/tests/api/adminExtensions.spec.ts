//COVERAGE_TAG: POST /dokan/v1/admin/extensions/install

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

// Only permission + validation guards are asserted. A real install pulls a plugin
// zip from wp.org and activates it — a network- and state-mutating side effect that
// is not safe or deterministic in CI, so the success path is intentionally uncovered.
test.describe('admin extensions api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test.describe('negative cases', () => {
        test('install rejects missing required slug as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response] = await apiUtils.post(endPoints.installAdminExtension, { data: {} }, false);
            expect(response.status()).toBe(400);
        });

        test('vendor cannot install extensions', { tag: ['@lite', '@vendor'] }, async () => {
            const [response] = await apiUtils.post(endPoints.installAdminExtension, { data: { slug: 'akismet' }, headers: payloads.vendorAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });

        test('customer cannot install extensions', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.post(endPoints.installAdminExtension, { data: { slug: 'akismet' }, headers: payloads.customerAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });
    });
});
