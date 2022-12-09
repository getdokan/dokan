import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

let apiUtils: any;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    // let orderId = await apiUtils.createOrderWithStatus(payloads.createOrder, 'wc-completed')
    // await apiUtils.createRefund(orderId, payloads.createRefund)
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe.skip('refunds api test', () => {

    //TODO: need to send vendor credentials for vendor info
    //TODO: orders
    //TODO: has more endpoints to cover
    //TODO: need to refund from dokan not via wc


    test('get all refunds', async ({ request }) => {
        let orderId = await apiUtils.createOrderWithStatus(payloads.createOrder, 'wc-completed')
        await apiUtils.createRefund(orderId, payloads.createRefund)

        let response = await request.get(endPoints.getAllRefunds)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get all refunds by status', async ({ request }) => {
        // let response = await request.get(endPoints.getAllRefundsByStatus('pending')) // pending, cancelled, completed
        let response = await request.get(endPoints.getAllRefundsByStatus('completed')) // pending, cancelled, completed
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('approve a refund', async ({ request }) => {
        // let refundId = await apiUtils.getRefundId()
        let orderId = await apiUtils.createOrderWithStatus(payloads.createOrder, 'wc-completed')
        let [, refundId] = await apiUtils.createRefund(orderId, payloads.createRefund)
        console.log(orderId, refundId)
        let response = await request.put(endPoints.approveRefund(refundId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('cancel a refund', async ({ request }) => {
        let orderId = await apiUtils.createOrderWithStatus(payloads.createOrder, 'wc-completed')
        let [, refundId] = await apiUtils.createRefund(orderId, payloads.createRefund)
        // let refundId = await apiUtils.getRefundId()

        let response = await request.put(endPoints.cancelRefund(refundId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('delete a refund', async ({ request }) => {
        let refundId = await apiUtils.getRefundId()

        let response = await request.delete(endPoints.deleteRefund(refundId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});



