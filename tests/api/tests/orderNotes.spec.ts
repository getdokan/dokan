import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: ApiUtils;
let orderId: string;
let orderNoteId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, orderId, orderNoteId] = await apiUtils.createOrderNote(payloads.createProduct(), payloads.createOrder, payloads.createOrderNote);
});


test.describe('order note api test', () => {
	
	test('get all order notes @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAllOrderNotes(orderId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get single order note @lite', async ({ request }) => {
		const response = await request.get(endPoints.getSingleOrderNote(orderId, orderNoteId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create an order note @lite', async ({ request }) => {
		const response = await request.post(endPoints.createOrderNote(orderId), { data: payloads.createOrderNote });
		expect(response.status()).toBe(201);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete an order note @lite', async ({ request }) => {
		const response = await request.delete(endPoints.deleteOrderNote(orderId, orderNoteId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
