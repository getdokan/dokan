import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';

let aPage: Page, vPage: Page, cPage: Page, uPage: Page;
let apiUtils: ApiUtils;

// eslint-disable-next-line require-await
test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe('roles api test', () => {

	test('get all user roles @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllUserRoles);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});
