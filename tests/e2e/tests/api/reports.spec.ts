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

test('get report overview', async ({ request }) => {
    let response = await request.get(endPoints.getReportsOverview)
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get report summary', async ({ request }) => {
    let response = await request.get(endPoints.getReportSummary)
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get top earners report', async ({ request }) => {
    let response = await request.get(endPoints.getReportsTopEarners('2022-01-01'))
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get top selling products report ', async ({ request }) => {
    let response = await request.get(endPoints.getReportsTopSellingProducts('2022-01-01'))
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});



});
