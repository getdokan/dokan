//COVERAGE_TAG: GET /dokan/v2/settings
//COVERAGE_TAG: GET /dokan/v2/settings/(?P<group_id>[\w-]+)
//COVERAGE_TAG: POST /dokan/v2/settings/(?P<group_id>[\w-]+)
//COVERAGE_TAG: GET /dokan/v2/settings/(?P<group_id>[\w-]+)/(?P<id>[\w-]+)
//COVERAGE_TAG: POST /dokan/v2/settings/(?P<group_id>[\w-]+)/(?P<id>[\w-]+)
//COVERAGE_TAG: GET /dokan/v2/settings/(?P<group_id>[\w-]+)/(?P<parent_id>[\w-]+)/(?P<id>[\w-]+)
//COVERAGE_TAG: POST /dokan/v2/settings/(?P<group_id>[\w-]+)/(?P<parent_id>[\w-]+)/(?P<id>[\w-]+)

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('new settings api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(({ request }) => {
        apiUtils = new ApiUtils(request);
    });

    test('get store settings @v2 @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getStoreSettings);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get single setting group @v2 @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleSettingGroup('store'));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update single setting group @v2 @lite', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateSingleSettingGroup('store'), { data: payloads.updateSettingsGroup });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get sub settings from single settings group @v2 @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSubSettingFromSingleSettingGroup('store', 'store_name'));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update sub settings from single settings group @v2 @lite', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateSubSettingFromSingleSettingGroup('store', 'store_name'), { data: payloads.updateSubSettingFromSingleSettingGroup });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get sub sub settings from single settings group @v2 @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSubSubSettingFromSingleSettingGroup('store', 'address', 'street_1'));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update sub sub settings from single settings group @v2 @lite', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateSubSubSettingFromSingleSettingGroup('store', 'address', 'street_1'), {
            data: payloads.updateSubSubSettingFromSingleSettingGroup,
        });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
