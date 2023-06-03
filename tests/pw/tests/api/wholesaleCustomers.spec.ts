import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: ApiUtils;
let wholesaleCustomerId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, wholesaleCustomerId] = await apiUtils.createWholesaleCustomer(payloads.createCustomer());
});

test.describe('wholesale customers api test', () => {

	test('get all wholesale customers @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllWholesaleCustomers);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create a wholesale customer @pro', async ({ request }) => {
		const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer());
		const response = await request.post(endPoints.createWholesaleCustomer, { data: { id: String(customerId) } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update a wholesale customer @pro', async ({ request }) => {
		const response = await request.post(endPoints.updateCustomer(wholesaleCustomerId), { data: payloads.updateWholesaleCustomer });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete a wholesale customer @pro', async ({ request }) => {
		const response = await request.post(endPoints.updateCustomer(wholesaleCustomerId), { data: payloads.deleteWholesaleCustomer });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update batch wholesale customers @pro', async ({ request }) => {
		const allWholesaleCustomerIds = (await apiUtils.getAllWholesaleCustomers()).map((a: { id: any }) => a.id);

		const response = await request.put(endPoints.updateBatchWholesaleCustomer, { data: { activate: allWholesaleCustomerIds } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
