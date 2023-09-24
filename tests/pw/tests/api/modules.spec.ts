//COVERAGE_TAG: GET /dokan/v1/admin/modules
//COVERAGE_TAG: PUT /dokan/v1/admin/modules/deactivate
//COVERAGE_TAG: PUT /dokan/v1/admin/modules/activate

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { helpers } from '@utils/helpers';

test.describe('modules api test', () => {
    let apiUtils: ApiUtils;
    let randomModule: string;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        randomModule = helpers.randomItem(await apiUtils.getAllModuleIds());
    });

    test('get all modules @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllModules);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('deactivate a module @pro', async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.deactivateModule, { data: { module: [randomModule] } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();

        // reactivate module
        // await apiUtils.activateModules(randomModule)
    });

    test('activate a module @pro', async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.activateModule, { data: { module: [randomModule] } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
