import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';

let apiUtils: ApiUtils;

// eslint-disable-next-line require-await
test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe('vendor dashboard api test', () => {

	test('get vendor dashboard statistics @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getVendorDashboardStatistics);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get vendor profile information @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getVendorProfileInformation);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get vendor sales report @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getVendorSalesReport);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get vendor product reports summary @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getVendorProductReportsSummary);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get vendor order reports summary @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getVendorOrderReportsSummary);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get vendor store preferences @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getVendorStorePreferences);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get vendor profile progress bar data @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getVendorProfileProgressBarData);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});
