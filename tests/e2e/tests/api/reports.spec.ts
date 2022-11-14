import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


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
    const response = await request.get(endPoints.getReportsTopEarners)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get top selling products report ', async ({ request }) => {
    const response = await request.get(endPoints.getReportsTopSellingProducts)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});
