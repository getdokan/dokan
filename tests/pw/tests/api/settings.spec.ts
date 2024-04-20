//COVERAGE_TAG: GET /dokan/v1/settings
//COVERAGE_TAG: PUT /dokan/v1/settings

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
// import { schemas } from '@utils/schemas';

test.describe('settings api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get settings', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSettings);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        // expect(responseBody).toMatchSchema(schemas.settingsSchema.storeSettingsSchema);
    });

    test('update settings', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateSettings, { data: payloads.updateSettings });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        // expect(responseBody).toMatchSchema(schemas.settingsSchema.setStoreSchema);
    });
});
