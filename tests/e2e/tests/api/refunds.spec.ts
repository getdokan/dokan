import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('refunds api test', () => {

    //TODO: need to send vendor credentials for vendor info
    //TODO: orders
    //TODO: has more endpoints to cover


    test('get all refunds', async ({ request }) => {
        let response = await request.get(endPoints.getAllRefunds)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    // test('get all refunds by status', async ({ request }) => {
    //     let response = await request.get(endPoints.getAllRefundsByStatus('pending')) // pending, cancelled, approved
    //     let responseBody = await response.json()
    //     console.log(responseBody)

    //     expect(response.ok()).toBeTruthy()
    //     expect(response.status()).toBe(200)
    // });

    test('approve a refund', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let refundId = await apiUtils.getRefundId()

        let response = await request.put(endPoints.approveRefund(refundId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('cancel a refund', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let refundId = await apiUtils.getRefundId()

        let response = await request.put(endPoints.cancelRefund(refundId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('delete a refund', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let refundId = await apiUtils.getRefundId()

        let response = await request.delete(endPoints.deleteRefund(refundId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });




});



