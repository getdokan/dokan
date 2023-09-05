import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';


let apiUtils: ApiUtils;
let customerId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, customerId] = await apiUtils.createCustomer(payloads.createCustomer());
});

test.describe('customers api test', () => {

	test('get all customers @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllCustomers);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get single customer @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getSingleCustomer(customerId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('create a customer @pro', async () => {
		const [response, responseBody] = await apiUtils.post(endPoints.createCustomer, { data: payloads.createCustomer() });
		expect(response.status()).toBe(201);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update a customer @pro', async () => {
		const [response, responseBody] = await apiUtils.put(endPoints.updateCustomer(customerId), { data: payloads.updateCustomer() });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('delete a customer @pro', async () => {
		const [response, responseBody] = await apiUtils.delete(endPoints.deleteCustomer(customerId), { params: payloads.paramsForceDelete });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update batch customers @pro', async () => {
		const allCustomerIds = (await apiUtils.getAllCustomers()).map((a: { id: unknown }) => a.id);

		const batchCustomers: object[] = [];
		for (const customerId of allCustomerIds.slice(0, 2)) {
			batchCustomers.push({ ...payloads.updateBatchCustomersTemplate(), id: customerId });
		}

		const [response, responseBody] = await apiUtils.put(endPoints.updateBatchCustomers, { data: { update: batchCustomers } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});
