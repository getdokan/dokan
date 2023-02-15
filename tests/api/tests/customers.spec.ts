import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let customerId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, customerId] = await apiUtils.createCustomer(payloads.createCustomer());
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('customers api test', () => {
	test('get all customers', async ({ request }) => {
		const response = await request.get(endPoints.getAllCustomers);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get single customer', async ({ request }) => {
		// let [, customerId] = await apiUtils.createCustomer(payloads.createCustomer())

		const response = await request.get(endPoints.getSingleCustomer(customerId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create a customer', async ({ request }) => {
		const response = await request.post(endPoints.createCustomer, { data: payloads.createCustomer() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
		expect(response.status()).toBe(201);
	});

	test('update a customer', async ({ request }) => {
		// let [, customerId] = await apiUtils.createCustomer(payloads.createCustomer())

		const response = await request.put(endPoints.updateCustomer(customerId), { data: payloads.updateCustomer() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('delete a customer', async ({ request }) => {
		// let [, customerId] = await apiUtils.createCustomer(payloads.createCustomer())

		const response = await request.delete(endPoints.deleteCustomer(customerId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update batch customers', async ({ request }) => {
		const allCustomerIds = (await apiUtils.getAllCustomers()).map((a: { id: any }) => a.id);
		// console.log(allCustomerIds)
		const batchCustomers: object[] = [];
		for (const customerId of allCustomerIds.slice(0, 2)) {
			batchCustomers.push({ ...payloads.updateBatchCustomersTemplate(), id: customerId });
		}
		// console.log(batchCustomers)

		const response = await request.put(endPoints.updateBatchCustomers, { data: { update: batchCustomers } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});

