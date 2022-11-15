import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('report api test', () => {

    //TODO: need to send vendor credentials for vendor info

test('get report overview', async ({ request }) => {
    const response = await request.get(endPoints.getReportsOverview)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get report summary', async ({ request }) => {
    const response = await request.get(endPoints.getReportSummary)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get top earners report', async ({ request }) => {
    const response = await request.get(endPoints.getReportsTopEarners('2022-01-01'))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get top selling products report ', async ({ request }) => {
    const response = await request.get(endPoints.getReportsTopSellingProducts('2022-01-01'))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});



});
