import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createOrder(payloads.createOrder)

});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('report api test', () => {

    //TODO: need to send vendor credentials for vendor info
    //TODO: prerequisite: order, vendor, product, customer ...

    test('get sales overview report', async ({ request }) => {
        let response = await request.get(endPoints.getSalesOverviewReport)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get summary report', async ({ request }) => {
        let response = await request.get(endPoints.getSummaryReport)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get top earners report', async ({ request }) => {
        let response = await request.get(endPoints.getTopEarnersReport)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get top selling products report ', async ({ request }) => {
        let response = await request.get(endPoints.getTopSellingProductsReport)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });



});
