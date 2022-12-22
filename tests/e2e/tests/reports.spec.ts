import { test, expect } from '@playwright/test'
import { ApiUtils } from '../utils/apiUtils'
import { endPoints } from '../utils/apiEndPoints'
import { payloads } from '../utils/payloads'

let apiUtils: any

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder)

});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('report api test', () => {

    test('get sales overview report', async ({ request }) => {
        let response = await request.get(endPoints.getSalesOverviewReport)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get summary report', async ({ request }) => {
        let response = await request.get(endPoints.getSummaryReport)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get top earners report', async ({ request }) => {
        let response = await request.get(endPoints.getTopEarnersReport)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get top selling products report ', async ({ request }) => {
        let response = await request.get(endPoints.getTopSellingProductsReport)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});
