import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('order note api test', () => {


//TODO: need to send vendor credentials for vendor info
test('get all order notes', async ({ request }) => {
    const response1 = await request.get(endPoints.getAllOrders)
    const responseBody1 = await response1.json()
    let orderId = responseBody1[0].id
    // console.log(responseBody1)
    console.log(responseBody1[0].id)

    const response = await request.get(endPoints.getAllOrderNotes(orderId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get single order note', async ({ request }) => {
    const response1 = await request.get(endPoints.getAllOrders)
    const responseBody1 = await response1.json()
    let orderId = responseBody1[0].id
    // console.log(responseBody1)
    // console.log(responseBody1[0].id)

    const response2 = await request.get(endPoints.getAllOrderNotes(orderId))
    const responseBody2 = await response2.json()
    let orderNoteId = responseBody2[0].id
    console.log(responseBody2)

    const response = await request.get(endPoints.getSingleOrderNote(orderId, orderNoteId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('create an order note', async ({ request }) => {
    const response1 = await request.get(endPoints.getAllOrders)
    const responseBody1 = await response1.json()
    let orderId = responseBody1[0].id
    // console.log(responseBody1)
    console.log(responseBody1[0].id)

    const response = await request.post(endPoints.postCreateOrderNote(orderId), { data: payloads.createOrderNote })
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(201)
});


test('delete an order note', async ({ request }) => {
    const response1 = await request.get(endPoints.getAllOrders)
    const responseBody1 = await response1.json()
    let orderId = responseBody1[0].id
    // console.log(responseBody1)

    const response2 = await request.get(endPoints.getAllOrderNotes(orderId))
    const responseBody2 = await response2.json()
    let orderNoteId = responseBody2[0].id
    // console.log(responseBody2)
    // console.log(responseBody2[0].id)

    const response = await request.delete(endPoints.delDeleteOrderNote(orderId, orderNoteId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


});