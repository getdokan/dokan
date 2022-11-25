import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('order api test', () => {

    //TODO: need to send vendor credentials for vendor info
    //TODO: orders

test('get all orders', async ({ request }) => {
    let response = await request.get(endPoints.getAllOrders)
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get orders summary', async ({ request }) => {
    let response = await request.get(endPoints.getOrdersSummary)
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

});


// test('get orders with before after', async ({ request }) => { //TODO: PR still not merged also add tests with only befor/after
//     let response = await request.get(endPoints.getOrdersBeforAfter('2022-11-01','2022-11-16'))
//     let responseBody = await response.json()
//     console.log(responseBody)

//     expect(response.ok()).toBeTruthy()
//     expect(response.status()).toBe(200)
// });

test('get single order', async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    let orderId = await apiUtils.getOrderId()

    let response = await request.get(endPoints.getSingleOrder(orderId))
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('update an order', async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    let orderId = await apiUtils.getOrderId()

    let response = await request.put(endPoints.updateOrder(orderId),{data: payloads.updateOrder}) 
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});



});



