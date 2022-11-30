import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('admin api test', () => {

    //TODO: need to send admin credentials 

    test('get admin report overview', async ({ request }) => {
        console.log(endPoints.getAdminReportOverview)
        let response = await request.get(endPoints.getAdminReportOverview)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get admin report summary', async ({ request }) => {
        let response = await request.get(endPoints.getAdminReportSummary)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get getAdminDashboardFeed', async ({ request }) => {
        let response = await request.get(endPoints.getAdminDashboardFeed)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get admin help', async ({ request }) => {
        let response = await request.get(endPoints.getAdminHelp)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get changelog lite', async ({ request }) => {
        let response = await request.get(endPoints.getAdminChangelogLite)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get changelog pro', async ({ request }) => {
        let response = await request.get(endPoints.getAdminChangelogPro)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get getAdminNotices', async ({ request }) => {
        let response = await request.get(endPoints.getAdminNotices)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get admin promo notices ', async ({ request }) => {
        let response = await request.get(endPoints.getAdminPromoNotices)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get admin logs ', async ({ request }) => {
        let response = await request.get(endPoints.getAdminLogs)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get admin export logs ', async ({ request }) => {
        let response = await request.get(endPoints.getAdminExportLogs)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

});
