import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request);
});

test.describe('settings api test', () => {
    test('get settings @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSettings);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update settings @lite', async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateSettings, {
            data: payloads.updateSettings,
        });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
