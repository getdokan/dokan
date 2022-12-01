import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createWholesaleCustomer()

});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('wholesale customers api test', () => {

    //TODO: need to send admin credentials for admin info
    test('get all wholesale customers', async ({ request }) => {
        let response = await request.get(endPoints.getAllWholesaleCustomers)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('create a wholesale customer', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, customerId] = await apiUtils.createCustomer(payloads.createCustomer())

        let response = await request.post(endPoints.createWholesaleCustomer, { data: { id: String(customerId) } })
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('update a wholesale customer', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, customerId] = await apiUtils.createWholesaleCustomer()

        let response = await request.post(endPoints.updateCustomer(customerId), { data: payloads.updateWholesaleCustomer })
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('delete a wholesale customer', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, customerId] = await apiUtils.createWholesaleCustomer()

        let response = await request.post(endPoints.updateCustomer(customerId), { data: payloads.deleteWholesaleCustomer })
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    // test.only('update batch wholesale customers', async ({ request }) => { //TODO
    //     let apiUtils = new ApiUtils(request)
    //     let allCustomerIds = (await apiUtils.getAllSupportTickets()).map(a => a.Id)
    //     console.log(allCustomerIds)
    //     var batchCustomers: object[]
    //     for (let customerId of allCustomerIds) {
    //         let template = payloads.updateBatchCustomersTemplate()
    //         // batchCustomers.push({...template, id: customerId})
    //         batchCustomers.push({...template, id: customerId})
    //     }

    // let response = await request.put(endPoints.updateBatchCustomers, { data: batchCustomers })
    // let responseBody = await response.json()
    // // console.log(responseBody)

    // expect(response.ok()).toBeTruthy()
    // expect(response.status()).toBe(200)

    // });

});