import { test, expect } from '@playwright/test'
import { ApiUtils } from '../utils/apiUtils'
import { endPoints } from '../utils/apiEndPoints'
import { payloads } from '../utils/payloads'

let apiUtils: any
let withdrawId: string
let minimumWithdrawLimit: string
let productId: string
let variationId: string


test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, pId] = await apiUtils.createProduct(payloads.createProduct())
    productId = pId
    let [, vId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct())
    variationId = vId
    minimumWithdrawLimit = await apiUtils.getMinimumWithdrawLimit()
    await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrder, 'wc-completed')
    let [, id] = await apiUtils.createWithdraw({ ...payloads.createWithdraw, amount: minimumWithdrawLimit })
    withdrawId = id
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('new v1 api test', () => {

    test('get product block details', async ({ request }) => {
        let response = await request.get(endPoints.getProductBlockDetails(productId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get variable product block details', async ({ request }) => {
        let response = await request.get(endPoints.getProductBlockDetails(variationId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('set default attribute', async ({ request }) => {
        let response = await request.post(endPoints.setDefaultAttribute(productId),{data: {}})
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update product attribute', async ({ request }) => {
        let response = await request.get(endPoints.getAllWithdrawsByStatus('pending')) // pending, cancelled, approved
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single withdraw', async ({ request }) => {
        // let [, withdrawId] = await apiUtils.createWithdraw()
        let response = await request.get(endPoints.getSingleWithdraw(withdrawId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('create a withdraw', async ({ request }) => {
        let response = await request.post(endPoints.createWithdraw, { data: { ...payloads.createWithdraw, amount: minimumWithdrawLimit } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(201)
    });

    test('update a withdraw', async ({ request }) => {
        // let [, withdrawId] = await apiUtils.createWithdraw()

        let response = await request.put(endPoints.updateWithdraw(withdrawId), { data: payloads.updateWithdraw })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('cancel a withdraw', async ({ request }) => {
        // let [, withdrawId] = await apiUtils.createWithdraw()

        let response = await request.delete(endPoints.cancelAWithdraw(withdrawId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update batch withdraws', async ({ request }) => {
        let allWithdrawIds = (await apiUtils.getAllWithdraws()).map((a: { id: any }) => a.id)
        // console.log(allWithdrawIds) 

        let response = await request.put(endPoints.updateBatchWithdraws, { data: { approved: allWithdrawIds } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

    });

});
