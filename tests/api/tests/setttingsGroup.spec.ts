import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.afterAll(async ({ request }) => {
	// TODO: remove after update setting cause disable selling fix
	const response = await request.put(endPoints.updateSettings, { data: payloads.setupStore });
	const responseBody = await apiUtils.getResponseBody(response);
	expect(response.ok()).toBeTruthy();
});

// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('new settings api test', () => {
	test('get store settings @v2', async ({ request }) => {
		const response = await request.get(endPoints.getStoreSettings);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get single setting group @v2', async ({ request }) => {
		const response = await request.get(endPoints.getSingleSettingGroup('store'));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update single setting group @v2', async ({ request }) => {
		const response = await request.post(endPoints.updateSingleSettingGroup('store'), { data: payloads.updateSettingsGroup });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get sub settings from single settings group @v2', async ({ request }) => {
		const response = await request.get(endPoints.getSubSettingFromSingleSettingGroup('store', 'store_name'));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update sub settings from single settings group @v2', async ({ request }) => {
		const response = await request.post(endPoints.updateSubSettingFromSingleSettingGroup('store', 'store_name'), { data: payloads.updateSubSettingFromSingleSettingGroup });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get sub sub settings from single settings group @v2', async ({ request }) => {
		const response = await request.get(endPoints.getSubSubSettingFromSingleSettingGroup('store', 'address', 'street_1'));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update sub sub settings from single settings group @v2', async ({ request }) => {
		const response = await request.post(endPoints.updateSubSubSettingFromSingleSettingGroup('store', 'address', 'street_1'), { data: payloads.updateSubSubSettingFromSingleSettingGroup });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
