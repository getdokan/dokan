import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


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

test('get single order', async ({ request }) => {
    // const response1 = await request.get(endPoints.getAllOrders)
    // const responseBody1 = await response1.json()
    // let orderId = (responseBody1.find(o => o.name === 'p1_v1')).id
    // // console.log(responseBody1)

    const response = await request.get(endPoints.getSingleOrder('18'))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test.only('update an order', async ({ request }) => {
    // const response1 = await request.get(endPoints.getAllOrders)
    // const responseBody1 = await response1.json()
    // let orderId = (responseBody1.find(o => o.name === 'p1_v1')).id


    const response = await request.put(endPoints.putUpdateProduct('18'),{data: payloads.updateOrder}) // TODO : dont work
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

