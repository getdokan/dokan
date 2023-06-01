import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';
import { helpers } from '../utils/helpers';

let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrderCod, 'wc-completed', payloads.vendorAuth);
});

test.describe('reverse withdrawal api test', () => {

	test('get reverse withdrawal transaction types @lite', async ({ request }) => {
		const response = await request.get(endPoints.getReverseWithdrawalTransactionTypes);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get all reverse withdrawal stores @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAllReverseWithdrawalStores);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get all reverse withdrawal store balance @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAllReverseWithdrawalStoreBalance);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get all reverse withdrawal transactions @lite', async ({ request }) => {
		const storeId = await apiUtils.getReverseWithdrawalStoreId();
		const response = await request.get(endPoints.getAllReverseWithdrawalTransactions(storeId, `${helpers.currentYear}-01-01 00:00:00`, `${helpers.currentYear}-12-31 00:00:00`));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get reverse withdrawal vendor due status @lite', async ({ request }) => {
		const response = await request.get(endPoints.getReverseWithdrawalVendorDueStatus);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('add reverse withdrawal payment product to cart @lite', async ({ request }) => {
		const response = await request.post(endPoints.getReverseWithdrawalAddProductToCart,{ data: payloads.amountToPay, headers: payloads.vendorAuth });
		// expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
