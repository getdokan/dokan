import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';


let apiUtils: ApiUtils;

// eslint-disable-next-line require-await
test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe('withdraw api test', () => {
	test('get withdraw settings @v2 @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getWithdrawSettings);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get withdraw summary @v2 @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getWithdrawSummary);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get withdraw disbursement settings @v2 @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getWithdrawDisbursementSettings);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update withdraw disbursement settings @v2 @pro', async () => {
		const [response, responseBody] = await apiUtils.post(endPoints.updateWithdrawDisbursementSettings, { data: payloads.updateWithdrawDisbursementSettings });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

});
