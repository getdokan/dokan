import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: ApiUtils;

// eslint-disable-next-line require-await
test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

// test.afterAll(async ({ request }) => {
// 	// TODO: remove after update setting cause disable selling fix
// 	const response = await request.put(endPoints.updateSettings, { data: payloads.setupStore });
// 	const responseBody = await apiUtils.getResponseBody(response);
// 	expect(response.ok()).toBeTruthy();
// });

test.describe('new settings api test', () => {

	test('get store settings @v2 @lite', async ({ request }) => {
		const response = await request.get(endPoints.getStoreSettings);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get single setting group @v2 @lite', async ({ request }) => {
		const response = await request.get(endPoints.getSingleSettingGroup('store'));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update single setting group @v2 @lite', async ({ request }) => {
		const response = await request.post(endPoints.updateSingleSettingGroup('store'), { data: payloads.updateSettingsGroup });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get sub settings from single settings group @v2 @lite', async ({ request }) => {
		const response = await request.get(endPoints.getSubSettingFromSingleSettingGroup('store', 'store_name'));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update sub settings from single settings group @v2 @lite', async ({ request }) => {
		const response = await request.post(endPoints.updateSubSettingFromSingleSettingGroup('store', 'store_name'), { data: payloads.updateSubSettingFromSingleSettingGroup });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get sub sub settings from single settings group @v2 @lite', async ({ request }) => {
		const response = await request.get(endPoints.getSubSubSettingFromSingleSettingGroup('store', 'address', 'street_1'));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update sub sub settings from single settings group @v2 @lite', async ({ request }) => {
		const response = await request.post(endPoints.updateSubSubSettingFromSingleSettingGroup('store', 'address', 'street_1'), { data: payloads.updateSubSubSettingFromSingleSettingGroup });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
