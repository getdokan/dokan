//COVERAGE_TAG: GET /dokan/v1/reports/sales_overview
//COVERAGE_TAG: GET /dokan/v1/reports/summary
//COVERAGE_TAG: GET /dokan/v1/reports/top_earners
//COVERAGE_TAG: GET /dokan/v1/reports/top_selling

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('report api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get sales overview report', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSalesOverviewReport);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get summary report', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSummaryReport);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get top earners report', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getTopEarnersReport);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get top selling products report', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getTopSellingProductsReport);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
