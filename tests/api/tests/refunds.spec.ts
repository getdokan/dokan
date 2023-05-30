import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: ApiUtils;
let orderId: string;
let refundId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	orderId = await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrder, 'wc-processing');
	[, refundId] = await apiUtils.createRefund(orderId, payloads.createRefund);
});


test.describe.skip('refunds api test', () => {
	//TODO: need to refund from dokan not via wc
	test('get all refunds @pro', async ({ request }) => {
		// let orderId = await apiUtils.createOrderWithStatus(payloads.createOrder, 'wc-completed')
		// await apiUtils.createRefund(orderId, payloads.createRefund)

		let response = await request.get(endPoints.getAllRefunds)
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get all refunds by status @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllRefunds, { params :{status:'completed'}}); // pending, cancelled, completed
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('approve a refund @pro', async ({ request }) => {
		// let refundId = await apiUtils.getRefundId()
		// let orderId = await apiUtils.createOrderWithStatus(payloads.createOrder, 'wc-completed')
		// let [, refundId] = await apiUtils.createRefund(orderId, payloads.createRefund)

		const response = await request.put(endPoints.approveRefund(refundId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('cancel a refund @pro', async ({ request }) => {
		// let refundId = await apiUtils.getRefundId()
		// let orderId = await apiUtils.createOrderWithStatus(payloads.createOrder, 'wc-completed')
		// let [, refundId] = await apiUtils.createRefund(orderId, payloads.createRefund)

		const response = await request.put(endPoints.cancelRefund(refundId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete a refund @pro', async ({ request }) => {
		// let refundId = await apiUtils.getRefundId()

		const response = await request.delete(endPoints.deleteRefund(refundId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update batch refunds @pro', async ({ request }) => {
		const allRefundIds = (await apiUtils.getAllRefunds()).map((a: { id: any }) => a.id);
		const response = await request.put(endPoints.updateBatchRefunds, { data: { cancelled: allRefundIds } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});

