import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';
import { helpers } from '../utils/helpers';

let apiUtils: any;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrderCod, 'wc-completed');
});

test.describe.skip('reverse withdrawal api test', () => {
	//TODO: enable reverse withdraw settings
	test('get reverse withdrawal transaction types @lite', async ({ request }) => {
		const response = await request.get(endPoints.getReverseWithdrawalTransactionTypes);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get all reverse withdrawal stores @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAllReverseWithdrawalStores);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get all reverse withdrawal store balance @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAllReverseWithdrawalStoreBalance);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get all reverse withdrawal transactions @lite', async ({ request }) => {
		const storeId = await apiUtils.getReverseWithdrawalStoreId();
		const response = await request.get(endPoints.getAllReverseWithdrawalTransactions(storeId, `${helpers.currentYear}-01-01`, `${helpers.currentYear}-12-31`));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get reverse withdrawal vendor due status @lite', async ({ request }) => {
		const response = await request.get(endPoints.getReverseWithdrawalVendorDueStatus);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('add reverse withdrawal payment product to cart @lite', async ({ request }) => {
		const response = await request.post(endPoints.getReverseWithdrawalAddProductToCart,{ data: payloads.amountToPay});
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
