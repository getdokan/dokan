import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createOrderWithStatus(payloads.createOrderCod, 'wc-completed')
 });

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('reverse withdrawal api test', () => {

    //TODO: need to send vendor credentials  
    //TODO: enable reverse withdraw settings

    test('get reverse withdrawal transaction types', async ({ request }) => {
        let response = await request.get(endPoints.getReverseWithdrawalTransactionTypes)
        let responseBody = await response.json()
        //  console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get all reverse withdrawal stores', async ({ request }) => {
        let response = await request.get(endPoints.getAllReverseWithdrawalStores)
        let responseBody = await response.json()
        //  console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get all reverse withdrawal store balance', async ({ request }) => {
        let response = await request.get(endPoints.getAllReverseWithdrawalStoreBalance)
        let responseBody = await response.json()
        //  console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('getAllReverseWithdrawalTransactions', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let storeId =await apiUtils.getReverseWithdrawalStoreId()
        // console.log(storeId)

        let response = await request.get(endPoints.getAllReverseWithdrawalTransactions(storeId,'2022-01-01','2022-12-31'))
        let responseBody = await response.json()
        //  console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


});
