import { test, expect, type APIRequestContext } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe('dummy Data api test', () => {
	
	test('get dummy data status @lite', async ({ request }) => {
		const response = await request.get(endPoints.getDummyDataStatus);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('import dummy data @lite', async ({ request }) => {
		const response = await request.post(endPoints.importDummyData, { data: payloads.dummyData });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('clear dummy data @lite', async ({ request }) => {
		const response = await request.delete(endPoints.clearDummyData);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});