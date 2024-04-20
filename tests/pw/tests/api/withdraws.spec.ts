//COVERAGE_TAG: GET /dokan/v1/withdraw/balance
//COVERAGE_TAG: GET /dokan/v1/withdraw
//COVERAGE_TAG: GET /dokan/v1/withdraw/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/withdraw/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/withdraw/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/withdraw/batch
//COVERAGE_TAG: POST /dokan/v1/withdraw

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { helpers } from '@utils/helpers';

test.describe('withdraw api test', () => {
    let apiUtils: ApiUtils;
    let withdrawId: string;
    let minimumWithdrawLimit: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, minimumWithdrawLimit] = await apiUtils.getMinimumWithdrawLimit();
        await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrder, 'wc-completed');
        const [responseBody, id] = await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit });
        withdrawId = responseBody.message === 'You already have a pending withdraw request' ? await apiUtils.getWithdrawId() : id;
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get withdraw payment methods', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getWithdrawPaymentMethods);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get balance details', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getBalanceDetails);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get all withdraws', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllWithdraws);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get all withdraws by status', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllWithdraws, { params: { status: 'pending' } }); // pending, cancelled, approved
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get single withdraw', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleWithdraw(withdrawId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update a withdraw', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateWithdraw(withdrawId), { data: payloads.updateWithdraw });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('cancel a withdraw', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.cancelWithdraw(withdrawId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update batch withdraws', { tag: ['@lite'] }, async () => {
        const allWithdrawIds = (await apiUtils.getAllWithdraws()).map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchWithdraws, { data: { approved: allWithdrawIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create a withdraw', { tag: ['@lite'] }, async () => {
        // cancel any pending withdraw
        const pendingRequest = await apiUtils.getAllWithdrawsByStatus('pending');
        helpers.isObjEmpty(pendingRequest) === false && (await apiUtils.cancelWithdraw(withdrawId));

        const [response, responseBody] = await apiUtils.post(endPoints.createWithdraw, { data: { ...payloads.createWithdraw, amount: minimumWithdrawLimit } });
        expect(response.status()).toBe(201);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get all withdraw method charges', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllWithdrawMethodCharges);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get withdraw charge details', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getWithdrawCharge, { params: payloads.withdrawCharge });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
