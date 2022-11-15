import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('order api test', () => {

    //TODO: need to send vendor credentials for vendor info

test('get all orders', async ({ request }) => {
    const response = await request.get(endPoints.getAllOrders)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get orders summary', async ({ request }) => {
    const response = await request.get(endPoints.getOrdersSummary)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

});

test('get orders with pagination', async ({ request }) => { 
    const response = await request.get(endPoints.getAllOrdersWithPagination('10','1'))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get orders with before after', async ({ request }) => { //TODO: PR still not merged
    const response = await request.get(endPoints.getOrdersBeforAfter('2022-11-01','2022-11-16'))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get single order', async ({ request }) => {
    const response1 = await request.get(endPoints.getAllOrders)
    const responseBody1 = await response1.json()
    let orderId = responseBody1[0].id
    // console.log(responseBody1)


    const response = await request.get(endPoints.getSingleOrder(orderId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('update an order', async ({ request }) => {
    const response1 = await request.get(endPoints.getAllOrders)
    const responseBody1 = await response1.json()
    let orderId = responseBody1[0].id
    // console.log(responseBody1)
    // console.log(responseBody1[0].id)

    const response = await request.put(endPoints.putUpdateOrder(orderId),{data: payloads.updateOrder}) 
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});



});



