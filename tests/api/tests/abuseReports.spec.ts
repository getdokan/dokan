import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe('abuse report api test', () => {
	
	test.only('get all abuse report reasons @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllAbuseReportReasons);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test.skip('get all abuse reports @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllAbuseReports);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test.skip('delete a abuse report @pro', async ({ request }) => {
		const abuseReportId = await apiUtils.getAbuseReportId();
		const response = await request.delete(endPoints.deleteAbuseReport(abuseReportId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test.skip('delete batch abuse reports @pro', async ({ request }) => {
		const allAbuseReportIds = (await apiUtils.getAllAbuseReports()).map((a: { id: any }) => a.id);
		const response = await request.delete(endPoints.deleteBatchAbuseReports, { data: { items: allAbuseReportIds } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});

