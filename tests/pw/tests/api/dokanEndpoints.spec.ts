import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';

let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request);
});

//todo: update test tag pro or lite

test.describe('dokan api endpoints test', () => {
    test('get all dokan v1 endpoints @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllDokanEndpointsV1);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get all dokan v2 endpoints @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllAbuseReports);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get all dokan v1 admin endpoints @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllAbuseReports);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
