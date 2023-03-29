import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe('vendor dashboard api test', () => {
	
	test('get vendor dashboard statistics @lite', async ({ request }) => {
		const response = await request.get(endPoints.getVendorDashboardStatistics);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get vendor profile information @lite', async ({ request }) => {
		const response = await request.get(endPoints.getVendorProfileInformation);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get vendor sales report @lite', async ({ request }) => {
		const response = await request.get(endPoints.getVendorSalesReport);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get vendor product reports summary @lite', async ({ request }) => {
		const response = await request.get(endPoints.getVendorProductReportsSummary);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get vendor order reports summary @lite', async ({ request }) => {
		const response = await request.get(endPoints.getVendorOrderReportsSummary);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get vendor store preferences @lite', async ({ request }) => {
		const response = await request.get(endPoints.getVendorStorePreferences);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get vendor profile progress bar data @pro', async ({ request }) => {
		const response = await request.get(endPoints.getVendorProfileProgressBarData);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
