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
        let response = await request.get(endPoints.getAdminReportOverview)
        console.log(response.status())
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)

    });

    test('get admin report summary', async ({ request }) => {
        let response = await request.get(endPoints.getAdminReportSummary)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)

    });

    test('get getAdminDashboardFeed', async ({ request }) => {
        let response = await request.get(endPoints.getAdminDashboardFeed)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)

    });

    test('get admin help', async ({ request }) => {
        let response = await request.get(endPoints.getAdminHelp)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get changelog lite', async ({ request }) => {
        let response = await request.get(endPoints.getAdminChangelogLite)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get changelog pro', async ({ request }) => {
        let response = await request.get(endPoints.getAdminChangelogPro)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get getAdminNotices', async ({ request }) => {
        let response = await request.get(endPoints.getAdminNotices)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get admin promo notices ', async ({ request }) => {
        let response = await request.get(endPoints.getAdminPromoNotices)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get admin logs ', async ({ request }) => {
        let response = await request.get(endPoints.getAdminLogs)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get admin export logs ', async ({ request }) => {
        let response = await request.get(endPoints.getAdminExportLogs)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

});
