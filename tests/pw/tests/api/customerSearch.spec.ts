//COVERAGE_TAG: GET /dokan/v1/customers/search

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('customer search api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test.describe('happy paths', () => {
        test('search customers as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.searchCustomers, { params: { search: 'a' } });
            expect(response.ok()).toBeTruthy();
            expect(Array.isArray(responseBody)).toBeTruthy();
        });

        test('search customers as vendor', { tag: ['@lite', '@vendor'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.searchCustomers, { params: { search: 'a' }, headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            expect(Array.isArray(responseBody)).toBeTruthy();
        });
    });

    test.describe('negative cases', () => {
        test('search rejects missing required search param', { tag: ['@lite', '@admin'] }, async () => {
            const [response] = await apiUtils.get(endPoints.searchCustomers, {}, false);
            expect(response.status()).toBe(400);
        });

        test('customer cannot search customers', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.get(endPoints.searchCustomers, { params: { search: 'a' }, headers: payloads.customerAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });
    });
});
