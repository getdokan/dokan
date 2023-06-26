import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';
import { dbUtils } from '../../utils/dbUtils';
import { dbData } from '../../utils/dbData';
const { VENDOR_ID, CUSTOMER_ID } = process.env;

let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	const[, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads. vendorAuth);
	//TODO: get vendorId and customerId in beforeAll
	await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, productId, VENDOR_ID, CUSTOMER_ID);
	await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, productId, VENDOR_ID, CUSTOMER_ID);
});

test.describe('abuse report api test', () => {

	test('get all abuse report reasons @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllAbuseReportReasons);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get all abuse reports @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllAbuseReports);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('delete a abuse report @pro', async () => {
		const abuseReportId = await apiUtils.getAbuseReportId();
		const [response, responseBody] = await apiUtils.delete(endPoints.deleteAbuseReport(abuseReportId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('delete batch abuse reports @pro', async () => {
		const allAbuseReportIds = (await apiUtils.getAllAbuseReports()).map((a: { id : unknown }) => a.id);
		const [response, responseBody] = await apiUtils.delete(endPoints.deleteBatchAbuseReports, { data: { items: allAbuseReportIds } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});