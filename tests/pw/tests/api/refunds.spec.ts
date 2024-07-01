//COVERAGE_TAG: GET /dokan/v1/refunds
//COVERAGE_TAG: PUT /dokan/v1/refunds/(?P<id>[\d]+)/cancel
//COVERAGE_TAG: DELETE /dokan/v1/refunds/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/refunds/(?P<id>[\d]+)/approve
//COVERAGE_TAG: PUT /dokan/v1/refunds/batch

import { test, expect, request, APIResponse } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('refunds api test', () => {
    let apiUtils: ApiUtils;
    // let orderId: string;
    let refundId: string;
    let orderResponseBody: APIResponse;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, orderResponseBody] = await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrder, 'wc-processing', payloads.vendorAuth);
        [, refundId] = await dbUtils.createRefundRequest(orderResponseBody); // todo: replace by woocommerce api
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all refunds', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllRefunds, { headers: payloads.vendorAuth });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get all refunds by status', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllRefunds, { params: { status: 'pending' }, headers: payloads.vendorAuth }); // pending, cancelled, completed
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('cancel a refund', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.cancelRefund(refundId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete a refund', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteRefund(refundId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('approve a refund', { tag: ['@pro'] }, async () => {
        const [, refundId] = await dbUtils.createRefundRequest(orderResponseBody);
        const [response, responseBody] = await apiUtils.put(endPoints.approveRefund(refundId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update batch refunds', { tag: ['@pro'] }, async () => {
        await dbUtils.createRefundRequest(orderResponseBody);
        const allPendingRefundsIds = (await apiUtils.getAllRefunds('pending', payloads.vendorAuth)).map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchRefunds, { data: { cancelled: allPendingRefundsIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
