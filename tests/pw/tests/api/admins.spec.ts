import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';

let apiUtils: ApiUtils;

// eslint-disable-next-line require-await
test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe('admin api test', () => {

	test('get admin report overview @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAdminReportOverview);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get admin report summary @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAdminReportSummary);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get admin dashboard feed @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAdminDashboardFeed);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get admin help @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAdminHelp);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get changelog lite @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAdminChangelogLite);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get changelog pro @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAdminChangelogPro);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get admin notices @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAdminNotices);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get admin promo notices  @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAdminPromoNotices);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get admin logs @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAdminLogs);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get admin export logs @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAdminExportLogs);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});
