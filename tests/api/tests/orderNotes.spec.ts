import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let orderId: string;
let orderNoteId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, orderId, orderNoteId] = await apiUtils.createOrderNote(payloads.createProduct(), payloads.createOrder, payloads.createOrderNote);
});


test.describe('order note api test', () => {
	
	test('get all order notes @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAllOrderNotes(orderId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get single order note @lite', async ({ request }) => {
		const response = await request.get(endPoints.getSingleOrderNote(orderId, orderNoteId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create an order note @lite', async ({ request }) => {
		const response = await request.post(endPoints.createOrderNote(orderId), { data: payloads.createOrderNote });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
		expect(response.status()).toBe(201);
	});

	test('delete an order note @lite', async ({ request }) => {
		const response = await request.delete(endPoints.deleteOrderNote(orderId, orderNoteId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
