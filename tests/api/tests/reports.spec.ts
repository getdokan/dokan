import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
});

test.describe('report api test', () => {

	test('get sales overview report @pro', async ({ request }) => {
		const response = await request.get(endPoints.getSalesOverviewReport);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get summary report @pro', async ({ request }) => {
		const response = await request.get(endPoints.getSummaryReport);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get top earners report @pro', async ({ request }) => {
		const response = await request.get(endPoints.getTopEarnersReport);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get top selling products report  @pro', async ({ request }) => {
		const response = await request.get(endPoints.getTopSellingProductsReport);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
