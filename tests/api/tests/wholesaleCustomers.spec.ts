import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let wholesaleCustomerId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, wholesaleCustomerId] = await apiUtils.createWholesaleCustomer(payloads.createCustomer());
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('wholesale customers api test', () => {
	test('get all wholesale customers @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllWholesaleCustomers);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create a wholesale customer @pro', async ({ request }) => {
		const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer());

		const response = await request.post(endPoints.createWholesaleCustomer, { data: { id: customerId } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update a wholesale customer @pro', async ({ request }) => {
		// let [, wholesaleCustomerId] = await apiUtils.createWholesaleCustomer(payloads.createCustomer())

		const response = await request.post(endPoints.updateCustomer(wholesaleCustomerId), { data: payloads.updateWholesaleCustomer });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('delete a wholesale customer @pro', async ({ request }) => {
		// let [, wholesaleCustomerId] = await apiUtils.createWholesaleCustomer(payloads.createCustomer())

		const response = await request.post(endPoints.updateCustomer(wholesaleCustomerId), { data: payloads.deleteWholesaleCustomer });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update batch wholesale customers @pro', async ({ request }) => {
		const allWholesaleCustomerIds = (await apiUtils.getAllWholesaleCustomers()).map((a: { id: any }) => a.id);
		// console.log(allWholesaleCustomerIds)

		const response = await request.put(endPoints.updateBatchWholesaleCustomer, { data: { activate: allWholesaleCustomerIds } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
