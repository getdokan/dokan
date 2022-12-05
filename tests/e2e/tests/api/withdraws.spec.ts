import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createOrderWithStatus(payloads.createOrder, 'wc-completed')
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('withdraw api test', () => {

    //TODO: need to send vendor credentials 

    test('get balance details', async ({ request }) => {
        let response = await request.get(endPoints.getBalanceDetails)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    // test('get all withdraws by status', async ({ request }) => {
    //     let response = await request.get(endPoints.getAllWithdrawsbyStatus('pending')) // pending, cancelled, approved
    //     expect(response.ok()).toBeTruthy()
    //     expect(response.status()).toBe(200)


    //     let responseBody = await response.json()
    //      console.log(responseBody)
    // });

    test('get all withdraws', async ({ request }) => {
        let response = await request.get(endPoints.getAllWithdraws)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get single withdraw', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, withdrawId] = await apiUtils.createWithdraw()

        let response = await request.get(endPoints.getSingleWithdraw(withdrawId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('create a withdraw', async ({ request }) => {
        let response = await request.post(endPoints.createWithdraw, { data: payloads.createWithdraw })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(201)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('update a withdraw', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, withdrawId] = await apiUtils.createWithdraw()

        let response = await request.put(endPoints.updateWithdraw(withdrawId), { data: payloads.updateWithdraw })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('cancel a withdraw', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, withdrawId] = await apiUtils.createWithdraw()

        let response = await request.delete(endPoints.cancelAWithdraw(withdrawId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


});
