import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request);
});

test.describe('dummy Data api test', () => {
    test('get dummy data status @lite', async () => {
        const [response, responseBody] = await apiUtils.get(
            endPoints.getDummyDataStatus,
        );
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('import dummy data @lite', async () => {
        const [response, responseBody] = await apiUtils.post(
            endPoints.importDummyData,
            { data: payloads.dummyData },
        );
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('clear dummy data @lite', async () => {
        const [response, responseBody] = await apiUtils.delete(
            endPoints.clearDummyData,
        );
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
