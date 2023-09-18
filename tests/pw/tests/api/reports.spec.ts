import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request);
    await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
});

test.describe('report api test', () => {
    test('get sales overview report @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSalesOverviewReport);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get summary report @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSummaryReport);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get top earners report @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getTopEarnersReport);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get top selling products report @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getTopSellingProductsReport);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
