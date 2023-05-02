import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe(' api test', () => {

	test('setup store settings @lite @pro', async ({ request }) => {
		const response = await request.put(endPoints.updateSettings, { data: payloads.setupStore });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create customer @lite @pro', async ({ request }) => { 
		const apiUtils = new ApiUtils(request);
		await apiUtils.createCustomer (payloads.createCustomer1 , payloads.adminAuth);
	});

	test('create vendor @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		await apiUtils.createStore (payloads.createStore1 , payloads.adminAuth);
	});
});
