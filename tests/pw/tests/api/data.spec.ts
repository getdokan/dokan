//COVERAGE_TAG: GET /dokan/v1/data/continents
//COVERAGE_TAG: GET /dokan/v1/data/continents/(?P<location>[\w-]+)
//COVERAGE_TAG: GET /dokan/v1/data/countries
//COVERAGE_TAG: GET /dokan/v1/data/countries/(?P<location>[\w-]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('data (continents & countries) api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test.describe('happy paths', () => {
        test('get all continents as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getAllContinents);
            expect(response.ok()).toBeTruthy();
            expect(Array.isArray(responseBody)).toBeTruthy();
        });

        test('get single continent as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getSingleContinent('EU'));
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });

        test('get all countries as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getAllCountries);
            expect(response.ok()).toBeTruthy();
            expect(Array.isArray(responseBody)).toBeTruthy();
        });

        test('get single country as admin', { tag: ['@lite', '@admin'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getSingleCountry('US'));
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });

        // vendors (dokandar) are also allowed to read location data
        test('get all countries as vendor', { tag: ['@lite', '@vendor'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getAllCountries, { headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            expect(Array.isArray(responseBody)).toBeTruthy();
        });
    });

    test.describe('negative cases', () => {
        test('customer cannot read continents', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getAllContinents, { headers: payloads.customerAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });

        test('customer cannot read countries', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getAllCountries, { headers: payloads.customerAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });
    });
});
