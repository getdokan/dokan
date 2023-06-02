import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';
import { helpers } from '../../utils/helpers';

let apiUtils: ApiUtils;
let withdrawId: string;
let minimumWithdrawLimit: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	minimumWithdrawLimit = await apiUtils.getMinimumWithdrawLimit();
	await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrder, 'wc-completed');
	const [responseBody, id] = await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit });
	withdrawId = responseBody.message === 'You already have a pending withdraw request' ? await apiUtils.getWithdrawId() : id;
});

test.describe('withdraw api test', () => {

	test('get balance details @lite', async ({ request }) => {
		const response = await request.get(endPoints.getBalanceDetails);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get all withdraws @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAllWithdraws);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get all withdraws by status @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAllWithdraws, { params: { status: 'pending'} } ); // pending, cancelled, approved
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get single withdraw @lite', async ({ request }) => {
		const response = await request.get(endPoints.getSingleWithdraw(withdrawId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update a withdraw @lite', async ({ request }) => {
		const response = await request.put(endPoints.updateWithdraw(withdrawId), { data: payloads.updateWithdraw });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('cancel a withdraw @lite', async ({ request }) => {
		const response = await request.delete(endPoints.cancelWithdraw(withdrawId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update batch withdraws @lite', async ({ request }) => {
		const allWithdrawIds = (await apiUtils.getAllWithdraws()).map((a: { id: any }) => a.id);

		const response = await request.put(endPoints.updateBatchWithdraws, { data: { approved: allWithdrawIds } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create a withdraw @lite', async ({ request }) => {
		// cancel any pending withdraw
		const pendingRequest = await apiUtils.getAllWithdrawsByStatus('pending');
		helpers.isObjEmpty(pendingRequest) === false && await apiUtils.cancelWithdraw(withdrawId);

		const response = await request.post(endPoints.createWithdraw, { data: { ...payloads.createWithdraw, amount: minimumWithdrawLimit } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
		expect(response.status()).toBe(201);
	});
});
