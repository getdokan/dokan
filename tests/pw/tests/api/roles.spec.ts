import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';

let apiUtils: ApiUtils;

test.beforeAll(({ request }) => {
    apiUtils = new ApiUtils(request);
});

test.describe('roles api test', () => {
    test('get all user roles @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllUserRoles);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
