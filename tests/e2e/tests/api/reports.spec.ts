import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('report api test', () => {

    //TODO: need to send vendor credentials for vendor info
    //TODO: prerequisite: order, vendor, product, customer ...

    test('get sales overview report', async ({ request }) => {
        let response = await request.get(endPoints.getSalesOverviewReport)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get summary report', async ({ request }) => {
        let response = await request.get(endPoints.getSummaryReport)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get top earners report', async ({ request }) => {
        let response = await request.get(endPoints.getTopEarnersReport)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get top selling products report ', async ({ request }) => {
        let response = await request.get(endPoints.getTopSellingProductsReport)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });



});
