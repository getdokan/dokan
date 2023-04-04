import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe('withdraw api test', () => {
	test('get withdraw settings @v2', async ({ request }) => {
		const response = await request.get(endPoints.getWithdrawSettings);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get withdraw summary @v2', async ({ request }) => {
		const response = await request.get(endPoints.getWithdrawSummary);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get withdraw disbursement settings @v2 @pro', async ({ request }) => {
		test.fail(!!process.env.CI, 'feature not merged yet');

		const response = await request.get(endPoints.getWithdrawDisbursementSettings);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update withdraw disbursement settings @v2 @pro', async ({ request }) => {
		test.fail(!!process.env.CI, 'feature not merged yet');

		const response = await request.post(endPoints.updateWithdrawDisbursementSettings, { data: payloads.updateWithdrawDisbursementSettings });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

});
