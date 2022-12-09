import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

let apiUtils;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    await apiUtils.createOrder(payloads.createOrder)

});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('order api test', () => {

    test('get all orders', async ({ request }) => {
        let response = await request.get(endPoints.getAllOrders)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get orders summary', async ({ request }) => {
        let response = await request.get(endPoints.getOrdersSummary)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

    });


    // test('get orders with before after', async ({ request }) => { //TODO: PR still not merged also add tests with only befor/after
    //     let response = await request.get(endPoints.getOrdersBeforAfter('2022-12-30','2022-01-01'))
        // let responseBody = await response.json()
        // // console.log(responseBody)

        // expect(response.ok()).toBeTruthy()
        // expect(response.status()).toBe(200)
    // });

    test('get single order', async ({ request }) => {
        let [, orderId] = await apiUtils.createOrder(payloads.createOrder)

        let response = await request.get(endPoints.getSingleOrder(orderId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update an order', async ({ request }) => {
        let [, orderId] = await apiUtils.createOrder(payloads.createOrder)
        // console.log(orderId)

        let response = await request.put(endPoints.updateOrder(orderId), { data: payloads.updateOrder })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});



