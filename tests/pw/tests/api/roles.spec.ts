//COVERAGE_TAG: GET /dokan/v1/request-for-quote/roles

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';

test.describe('roles api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(({ request }) => {
        apiUtils = new ApiUtils(request);
    });

    test('get all user roles @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllUserRoles);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
