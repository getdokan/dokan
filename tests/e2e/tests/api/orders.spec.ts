import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'
import { helpers } from '../../utils/helpers'

let apiUtils: any
let orderId: string

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, id] = await apiUtils.createOrder(payloads.createOrder)
    orderId = id

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

    test('get orders with before after', async ({ request }) => {
        let response = await request.get(endPoints.getOrdersBeforAfter(`${helpers.currentYear}-12-30`, `${helpers.currentYear}-01-01`))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single order', async ({ request }) => {
        // let [, orderId] = await apiUtils.createOrder(payloads.createOrder)

        let response = await request.get(endPoints.getSingleOrder(orderId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update an order', async ({ request }) => {
        // let [, orderId] = await apiUtils.createOrder(payloads.createOrder)

        let response = await request.put(endPoints.updateOrder(orderId), { data: payloads.updateOrder })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});



