import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe('admin api test', () => {

	test('get admin report overview @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminReportOverview);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get admin report summary @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminReportSummary);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get admin dashboard feed @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminDashboardFeed);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get admin help @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminHelp);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get changelog lite @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminChangelogLite);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get changelog pro @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAdminChangelogPro);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get admin notices @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminNotices);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get admin promo notices  @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAdminPromoNotices);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get admin logs @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAdminLogs);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get admin export logs @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAdminExportLogs);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
