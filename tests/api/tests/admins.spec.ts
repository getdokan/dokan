import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe('admin api test', () => {

	test('get admin report overview @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminReportOverview);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get admin report summary @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminReportSummary);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get admin dashboard feed @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminDashboardFeed);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get admin help @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminHelp);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get changelog lite @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminChangelogLite);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get changelog pro @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAdminChangelogPro);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get admin notices @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminNotices);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get admin promo notices  @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminPromoNotices);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get admin logs @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAdminLogs);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get admin export logs @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAdminExportLogs);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
