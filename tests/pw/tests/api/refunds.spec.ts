import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: ApiUtils;
let orderId: string;
let refundId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	orderId = await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrder, 'wc-processing', payloads.vendorAuth);
	[, refundId] = await apiUtils.createRefund(orderId, payloads.createRefund);
});


test.describe.skip('refunds api test', () => {
	//TODO: need to refund from dokan not via wc
	test('get all refunds @pro', async () => {
		const orderId = await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrder, 'wc-processing', payloads.vendorAuth);
		await apiUtils.createRefund(orderId, payloads.createRefund);
		const [response, responseBody] = await apiUtils.get(endPoints.getAllRefunds);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get all refunds by status @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllRefunds, { params :{ status:'completed' } }); // pending, cancelled, completed
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('approve a refund @pro', async () => {
		// let refundId = await apiUtils.getRefundId();
		// const orderId = await apiUtils.createOrderWithStatus(payloads.createOrder, 'wc-completed');
		// let [, refundId] = await apiUtils.createRefund(orderId, payloads.createRefund);

		const [response, responseBody] = await apiUtils.put(endPoints.approveRefund(refundId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('cancel a refund @pro', async () => {
		// let refundId = await apiUtils.getRefundId()
		// let orderId = await apiUtils.createOrderWithStatus(payloads.createOrder, 'wc-completed')
		// let [, refundId] = await apiUtils.createRefund(orderId, payloads.createRefund)

		const [response, responseBody] = await apiUtils.put(endPoints.cancelRefund(refundId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('delete a refund @pro', async () => {
		// let refundId = await apiUtils.getRefundId()

		const [response, responseBody] = await apiUtils.delete(endPoints.deleteRefund(refundId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update batch refunds @pro', async () => {
		const allRefundIds = (await apiUtils.getAllRefunds()).map((a: { id: unknown }) => a.id);
		const [response, responseBody] = await apiUtils.put(endPoints.updateBatchRefunds, { data: { cancelled: allRefundIds } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});
