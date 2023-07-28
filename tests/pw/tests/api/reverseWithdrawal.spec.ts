import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';


let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrderCod, 'wc-completed', payloads.vendorAuth);
});

test.describe('reverse withdrawal api test', () => {

	test('get reverse withdrawal transaction types @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getReverseWithdrawalTransactionTypes);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get all reverse withdrawal stores @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllReverseWithdrawalStores);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get all reverse withdrawal store balance @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllReverseWithdrawalStoreBalance);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get all reverse withdrawal transactions @lite @pro', async () => {
		const storeId = await apiUtils.getReverseWithdrawalStoreId();
		const [response, responseBody] = await apiUtils.get(endPoints.getAllReverseWithdrawalTransactions, { params: { ...payloads.paramsReverseWithdrawalTransactions, vendor_id: storeId } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get reverse withdrawal vendor due status @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getReverseWithdrawalVendorDueStatus);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('add reverse withdrawal payment product to cart @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.post(endPoints.getReverseWithdrawalAddProductToCart, { data: payloads.amountToPay, headers: payloads.vendorAuth });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});