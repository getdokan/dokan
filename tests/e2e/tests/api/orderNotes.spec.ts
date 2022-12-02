import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('order note api test', () => {


    //TODO: need to send vendor credentials 
    test('get all order notes', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, orderId,] = await apiUtils.createOrderNote(payloads.createOrder, payloads.createOrderNote)

        let response = await request.get(endPoints.getAllOrderNotes(orderId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get single order note', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, orderId, orderNoteId] = await apiUtils.createOrderNote(payloads.createOrder, payloads.createOrderNote)

        let response = await request.get(endPoints.getSingleOrderNote(orderId, orderNoteId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


    test('create an order note', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let orderId = await apiUtils.getOrderId()

        let response = await request.post(endPoints.createOrderNote(orderId), { data: payloads.createOrderNote })
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(201)
    });


    test('delete an order note', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, orderId, orderNoteId] = await apiUtils.createOrderNote(payloads.createOrder, payloads.createOrderNote)

        let response = await request.delete(endPoints.deleteOrderNote(orderId, orderNoteId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


});