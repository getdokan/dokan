//COVERAGE_TAG: GET /dokan/v1/reverse-withdrawal/transaction-types
//COVERAGE_TAG: GET /dokan/v1/reverse-withdrawal/stores
//COVERAGE_TAG: GET /dokan/v1/reverse-withdrawal/stores-balance
//COVERAGE_TAG: GET /dokan/v1/reverse-withdrawal/transactions
//COVERAGE_TAG: POST /dokan/v1/reverse-withdrawal/transactions
//COVERAGE_TAG: GET /dokan/v1/reverse-withdrawal/vendor-due-status
//COVERAGE_TAG: POST /dokan/v1/reverse-withdrawal/add-to-cart

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { schemas } from '@utils/schemas';

test.describe('reverse withdrawal api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await dbUtils.setOptionValue(dbData.dokan.optionName.reverseWithdraw, dbData.dokan.reverseWithdrawSettings);

        const [, , orderId] = await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrderCod, data.order.orderStatus.processing, payloads.vendorAuth);
        await apiUtils.updateOrderStatus(orderId, data.order.orderStatus.completed, payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.reverseWithdraw, { ...dbData.dokan.reverseWithdrawSettings, enabled: 'off' });
        await apiUtils.dispose();
    });

    test('get reverse withdrawal transaction types', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getReverseWithdrawalTransactionTypes);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.reverseWithdrawalSchema.transactionTypesSchema);
    });

    test('get all reverse withdrawal stores', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllReverseWithdrawalStores);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.reverseWithdrawalSchema.reverseWithdrawalStoresSchema);
    });

    test('get all reverse withdrawal store balance', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllReverseWithdrawalStoreBalance);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.reverseWithdrawalSchema.reverseWithdrawalStoreBalanceSchema);
    });

    test('get all reverse withdrawal transactions', { tag: ['@lite'] }, async () => {
        const storeId = await apiUtils.getReverseWithdrawalStoreId();
        const [response, responseBody] = await apiUtils.get(endPoints.getAllReverseWithdrawalTransactions, { params: { ...payloads.paramsReverseWithdrawalTransactions, vendor_id: storeId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.reverseWithdrawalSchema.reverseWithdrawalTransactionsSchema);
    });

    test('create a reverse withdrawal transaction', { tag: ['@lite'] }, async () => {
        const storeId = await apiUtils.getReverseWithdrawalStoreId();
        const [response, responseBody] = await apiUtils.post(endPoints.createReverseWithdrawalTransactions, { data: { ...payloads.createReverseWithdrawal, vendor_id: storeId }, headers: payloads.adminAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.reverseWithdrawalSchema.createReverseWithdrawalTransaction);
    });

    test('get reverse withdrawal vendor due status', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getReverseWithdrawalVendorDueStatus);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.reverseWithdrawalSchema.reverseWithdrawalVendorDueStatusSchema);
    });

    test('add reverse withdrawal payment product to cart', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.getReverseWithdrawalAddProductToCart, { data: payloads.amountToPay, headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.reverseWithdrawalSchema.reverseWithdrawalAddProductToCartSchema);
    });
});
