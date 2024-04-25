//COVERAGE_TAG: GET /dokan/v1/request-for-quote/roles

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';

test.describe('roles api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all user roles', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllUserRoles);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
