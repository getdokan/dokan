import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';
import { helpers } from '../../utils/helpers';

let apiUtils: ApiUtils;
let orderId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, orderId] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
});

const versions = ['v1', 'v2'];
for (const version of versions) {
	test.describe(`order api test ${version}`, () => {

		test('get all orders @lite', async ({ request }) => {
			const response = await request.get(endPoints.getAllOrders.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('get orders summary @lite', async ({ request }) => {
			const response = await request.get(endPoints.getOrdersSummary.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('get orders with before after @lite', async ({ request }) => {
			const response = await request.get((endPoints.getOrdersBeforeAfter(`${helpers.currentYear}-12-30`, `${helpers.currentYear}-01-01`)).replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('get single order @lite', async ({ request }) => {
			const response = await request.get((endPoints.getSingleOrder(orderId)).replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('update an order @lite', async ({ request }) => {
			const response = await request.put((endPoints.updateOrder(orderId)).replace('v1', version), { data: payloads.updateOrder });
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});
	});
}

test('update batch orders @v2 @lite', async ({ request }) => {
	const allOrderIds = (await apiUtils.getAllOrders()).map((a: { id: any }) => a.id);
	const response = await request.post(endPoints.updateBatchOrders, { data: { order_ids: allOrderIds, status: 'wc-completed' } });
	expect(response.ok()).toBeTruthy();
	const responseBody = await apiUtils.getResponseBody(response);
	expect(responseBody).toBeTruthy();
});
