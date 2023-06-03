import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: ApiUtils;
let customerId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, customerId] = await apiUtils.createCustomer(payloads.createCustomer());
});

test.describe('customers api test', () => {

	test('get all customers @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllCustomers);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get single customer @pro', async ({ request }) => {
		const response = await request.get(endPoints.getSingleCustomer(customerId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create a customer @pro', async ({ request }) => {
		const response = await request.post(endPoints.createCustomer, { data: payloads.createCustomer() });
		expect(response.ok()).toBeTruthy();
		expect(response.status()).toBe(201);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update a customer @pro', async ({ request }) => {
		const response = await request.put(endPoints.updateCustomer(customerId), { data: payloads.updateCustomer() });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete a customer @pro', async ({ request }) => {
		const response = await request.delete(endPoints.deleteCustomer(customerId), { params: payloads.paramsDeleteCustomer });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update batch customers @pro', async ({ request }) => {
		const allCustomerIds = (await apiUtils.getAllCustomers()).map((a: { id: any }) => a.id);

		const batchCustomers: object[] = [];
		for (const customerId of allCustomerIds.slice(0, 2)) {
			batchCustomers.push({ ...payloads.updateBatchCustomersTemplate(), id: customerId });
		}

		const response = await request.put(endPoints.updateBatchCustomers, { data: { update: batchCustomers } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
