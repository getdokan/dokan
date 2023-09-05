import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';


let apiUtils: ApiUtils;
let staffId: string;



test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, staffId] = await apiUtils.createVendorStaff(payloads.createStaff(), payloads.vendorAuth);
	// [, staffId] = await apiUtils.createVendorStaff(payloads.staff, payloads.vendorAuth);
});


test.describe('vendor staff api test', () => {
	test.skip(true, 'feature not merged yet');

	test.use({ extraHTTPHeaders: { Authorization: payloads.vendorAuth.Authorization } });

	test('get all vendor staffs @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllVendorStaffs);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get single vendor staff @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getSingleVendorStaff(staffId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('create a vendor staff @pro', async () => {
		const [response, responseBody] = await apiUtils.post(endPoints.createVendorStaff, { data: payloads.createStaff() });
		expect(response.status()).toBe(201);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update a vendor staff @pro', async () => {
		test.skip(true, 'fatal error exists dokan issue');
		const [response, responseBody] = await apiUtils.put(endPoints.updateVendorStaff('100'), { data: payloads.updateStaff() });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get vendor staff capabilities @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getVendorStaffCapabilities(staffId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update vendor staff capabilities @pro', async () => {
		test.skip(true, 'need payload');
		const [response, responseBody] = await apiUtils.put(endPoints.updateVendorStaffCapabilities(staffId), { data: payloads.updateCapabilities });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test.skip('delete a vendor staff @pro', async () => {
		const [response, responseBody] = await apiUtils.delete(endPoints.deleteVendorStaff(staffId));
		// const [response, responseBody] = await apiUtils.delete(endPoints.deleteVendorStaff(staffId), { params: payloads.paramsForceDelete });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});


});
