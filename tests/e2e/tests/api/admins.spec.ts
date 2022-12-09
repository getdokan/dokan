import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

let apiUtils: any
test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('admin api test', () => {

    test('get admin report overview', async ({ request }) => {
        let response = await request.get(endPoints.getAdminReportOverview)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get admin report summary', async ({ request }) => {
        let response = await request.get(endPoints.getAdminReportSummary)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get getAdminDashboardFeed', async ({ request }) => {
        let response = await request.get(endPoints.getAdminDashboardFeed)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get admin help', async ({ request }) => {
        let response = await request.get(endPoints.getAdminHelp)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get changelog lite', async ({ request }) => {
        let response = await request.get(endPoints.getAdminChangelogLite)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get changelog pro', async ({ request }) => {
        let response = await request.get(endPoints.getAdminChangelogPro)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get getAdminNotices', async ({ request }) => {
        let response = await request.get(endPoints.getAdminNotices)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get admin promo notices ', async ({ request }) => {
        let response = await request.get(endPoints.getAdminPromoNotices)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get admin logs ', async ({ request }) => {
        let response = await request.get(endPoints.getAdminLogs)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get admin export logs ', async ({ request }) => {
        let response = await request.get(endPoints.getAdminExportLogs)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});
