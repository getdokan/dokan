import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';
import { dbUtils } from '../utils/dbUtils';
import { dbData } from '../utils/dbData';
const { vendorId, customerId } = process.env;

let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	let[, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads. vendorAuth);
	//TODO: handle vendorid and customerid
	await dbUtils.createAbuseReport(dbData.createAbuseReport, productId, vendorId, customerId);
	await dbUtils.createAbuseReport(dbData.createAbuseReport, productId, vendorId, customerId);
});   

test.describe.only('abuse report api test', () => {
	
	test('get all abuse report reasons @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllAbuseReportReasons);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get all abuse reports @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllAbuseReports);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete a abuse report @pro', async ({ request }) => {
		const abuseReportId = await apiUtils.getAbuseReportId();
		const response = await request.delete(endPoints.deleteAbuseReport(abuseReportId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete batch abuse reports @pro', async ({ request }) => {
		const allAbuseReportIds = (await apiUtils.getAllAbuseReports()).map((a: { id: any }) => a.id);
		const response = await request.delete(endPoints.deleteBatchAbuseReports, { data: { items: allAbuseReportIds } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});

