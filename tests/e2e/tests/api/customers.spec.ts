import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createCustomer(payloads.createCustomer())

});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('customers api test', () => {

    //TODO: need to send admin/vendor credentials 

    test('get all customers', async ({ request }) => {
        let response = await request.get(endPoints.getAllCustomers)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get single customer', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, customerId] = await apiUtils.createCustomer(payloads.createCustomer())

        let response = await request.get(endPoints.getSingleCustomer(customerId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('create a customer', async ({ request }) => {
        let response = await request.post(endPoints.createCustomer, { data: payloads.createCustomer() })
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(201)
    });


    test('update a customer', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, customerId] = await apiUtils.createCustomer(payloads.createCustomer())

        let response = await request.put(endPoints.updateCustomer(customerId), { data: payloads.updateCustomer() })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


    test('delete a customer', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, customerId] = await apiUtils.createCustomer(payloads.createCustomer())

        let response = await request.delete(endPoints.deleteCustomer(customerId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    // test.only('update batch customers', async ({ request }) => { //TODO
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
        // expect(response.ok()).toBeTruthy()
        // expect(response.status()).toBe(200)

        // let responseBody = await response.json()
        // console.log(responseBody)

    // });

});