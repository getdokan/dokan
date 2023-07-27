import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';


let aPage: Page, vPage: Page, cPage: Page, uPage: Page;
let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	// check reverse withdrawal payment product exists //todo: add reverse withdraw check on setup
	// await apiUtils.getReverseWithdrawalProductId(); //TODO: failed on git action. payment product not created
	//TODO: add create product to admin after feature merged with pro
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
		// test.fail(!! process.env.CI, 'Issue not fixed yet'); //TODO: remove if fixed
		const [response, responseBody] = await apiUtils.post(endPoints.getReverseWithdrawalAddProductToCart, { data: payloads.amountToPay, headers: payloads.vendorAuth });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});