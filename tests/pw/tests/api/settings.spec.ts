import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';

let apiUtils: ApiUtils;

// eslint-disable-next-line require-await
test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

// test.afterAll(async () => {
// TODO: remove after update setting cause disable selling fix
// 	const [response,] = await apiUtils.put(endPoints.updateSettings, { data: payloads.setupStore });
// 	expect(response.ok()).toBeTruthy();
// });

test.describe('settings api test', () => {

	test('get settings @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getSettings);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update settings @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.put(endPoints.updateSettings, { data: payloads.updateSettings });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});
