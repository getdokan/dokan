//COVERAGE_TAG: GET /dokan/v1/admin/modules
//COVERAGE_TAG: PUT /dokan/v1/admin/modules/deactivate
//COVERAGE_TAG: PUT /dokan/v1/admin/modules/activate

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { helpers } from '@utils/helpers';
import { schemas } from '@utils/schemas';

test.describe('modules api test', () => {
    let apiUtils: ApiUtils;
    let randomModule: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        randomModule = helpers.randomItem(await apiUtils.getAllModuleIds());
    });

    test.afterAll(async () => {
        await apiUtils.activateModules([randomModule]);
        await apiUtils.dispose();
    });

    test('get all modules', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllModules);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.modulesSchema);
    });

    test('deactivate a module', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.deactivateModule, { data: { module: [randomModule] } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.modulesSchema);
    });

    test('activate a module', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.activateModule, { data: { module: [randomModule] } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.modulesSchema);
    });
});
