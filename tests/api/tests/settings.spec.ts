import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

// test.afterAll(async ({ request }) => {
// 	// TODO: remove after update setting cause disable selling fix
// 	const response = await request.put(endPoints.updateSettings, { data: payloads.setupStore });
// 	const responseBody = await apiUtils.getResponseBody(response);
// 	expect(response.ok()).toBeTruthy();
// });

test.describe('settings api test', () => {
	
	test('get settings @lite', async ({ request }) => {
		const response = await request.get(endPoints.getSettings);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update settings @lite', async ({ request }) => {
		const response = await request.put(endPoints.updateSettings, { data: payloads.updateSettings });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});

