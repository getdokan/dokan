import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';
import { dbUtils } from 'utils/dbUtils';
import { data } from 'utils/testData';
import { dbData } from 'utils/dbData';


let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, dbData.dokan.reverseWithdrawSettings);

	const [,, orderId,] = await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrderCod, data.order.orderStatus.processing, payloads.vendorAuth);
	await apiUtils.updateOrderStatus(orderId, data.order.orderStatus.completed, payloads.vendorAuth);
});

test.afterAll(async () => {
	await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, { ...dbData.dokan.reverseWithdrawSettings, enabled: 'off' });
});

test.describe('reverse withdrawal api test', () => {

	test('get reverse withdrawal transaction types @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getReverseWithdrawalTransactionTypes);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get all reverse withdrawal stores @lite', async () => {
		
		const [response, responseBody] = await apiUtils.get(endPoints.getAllReverseWithdrawalStores);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get all reverse withdrawal store balance @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllReverseWithdrawalStoreBalance);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get all reverse withdrawal transactions @lite', async () => {
		const storeId = await apiUtils.getReverseWithdrawalStoreId();
		const [response, responseBody] = await apiUtils.get(endPoints.getAllReverseWithdrawalTransactions, { params: { ...payloads.paramsReverseWithdrawalTransactions, vendor_id: storeId } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get reverse withdrawal vendor due status @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getReverseWithdrawalVendorDueStatus);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test.skip('add reverse withdrawal payment product to cart @lite', async () => {
		const [response, responseBody] = await apiUtils.post(endPoints.getReverseWithdrawalAddProductToCart, { data: payloads.amountToPay, headers: payloads.vendorAuth });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});