import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


let apiUtils: any
let wholesaleCustomerId: string

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, id] = await apiUtils.createWholesaleCustomer()
    wholesaleCustomerId = id

});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('wholesale customers api test', () => {

    test('get all wholesale customers', async ({ request }) => {
        let response = await request.get(endPoints.getAllWholesaleCustomers)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('create a wholesale customer', async ({ request }) => {
        let [, customerId] = await apiUtils.createCustomer(payloads.createCustomer())

        let response = await request.post(endPoints.createWholesaleCustomer, { data: { id: customerId } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('update a wholesale customer', async ({ request }) => {
        // let [, wholesaleCustomerId] = await apiUtils.createWholesaleCustomer()

        let response = await request.post(endPoints.updateCustomer(wholesaleCustomerId), { data: payloads.updateWholesaleCustomer })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('delete a wholesale customer', async ({ request }) => {
        // let [, wholesaleCustomerId] = await apiUtils.createWholesaleCustomer()

        let response = await request.post(endPoints.updateCustomer(wholesaleCustomerId), { data: payloads.deleteWholesaleCustomer })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    // test.only('update batch wholesale customers', async ({ request }) => { //TODO
    //     let allwholesaleCustomerIds = (await apiUtils.getAllSupportTickets()).map(a => a.Id)
    //     console.log(allwholesaleCustomerIds)
    //     var batchCustomers: object[]
    //     for (let wholesaleCustomerId of allwholesaleCustomerIds) {
    //         let template = payloads.updateBatchCustomersTemplate()
    //         // batchCustomers.push({...template, id: wholesaleCustomerId})
    //         batchCustomers.push({...template, id: wholesaleCustomerId})
    //     }

    // let response = await request.put(endPoints.updateBatchCustomers, { data: batchCustomers })
    // let responseBody = await response.json()
    // // console.log(responseBody)

    // expect(response.ok()).toBeTruthy()
    // expect(response.status()).toBe(200)

    // });

});