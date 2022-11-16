import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('order note api test', () => {


    //TODO: need to send vendor credentials for vendor info
    //TODO: prerequisite : orders
    test('get all order notes', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, orderId,] = await apiUtils.createOrderNote()

        let response = await request.get(endPoints.getAllOrderNotes(orderId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get single order note', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, orderId, orderNoteId] = await apiUtils.createOrderNote()

        let response = await request.get(endPoints.getSingleOrderNote(orderId, orderNoteId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('create an order note', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let orderId = await apiUtils.getOrderId()

        let response = await request.post(endPoints.createOrderNote(orderId), { data: payloads.createOrderNote })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(201)
    });


    test('delete an order note', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, orderId, orderNoteId] = await apiUtils.createOrderNote()

        let response = await request.delete(endPoints.deleteOrderNote(orderId, orderNoteId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


});