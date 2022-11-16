import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('withdraw api test', () => {

    //TODO: need to send vendor credentials for vendor info
    //TODO: prerequisite: vendor balance greater than minimum withdraw limit, withdraw request

    test('get all withdraws', async ({ request }) => {
        let response = await request.get(endPoints.getAllWithdraws)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get all withdraws by status', async ({ request }) => {
        let response = await request.get(endPoints.getAllWithdrawsbyStatus('pending')) // pending, cancelled, approved
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get balance details', async ({ request }) => {
        let response = await request.get(endPoints.getBalanceDetails)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('create a withdraw', async ({ request }) => {
        let response = await request.post(endPoints.createWithdraw, { data: payloads.createWithdraw })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(201)
    });

    test('cancel a withdraw', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        // let withdrawId = await apiUtils.getWithdrawId()
        let [, withdrawId] = await apiUtils.createWithdraw()

        let response = await request.put(endPoints.cancelAWithdraw(withdrawId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


});
