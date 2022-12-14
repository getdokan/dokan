import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


let apiUtils: any
let customerId: string

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, id] = await apiUtils.createCustomer(payloads.createCustomer())
    customerId = id
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe.only('customers api test', () => {

    test('get all customers', async ({ request }) => {
        let response = await request.get(endPoints.getAllCustomers)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single customer', async ({ request }) => {
        // let [, customerId] = await apiUtils.createCustomer(payloads.createCustomer())

        let response = await request.get(endPoints.getSingleCustomer(customerId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('create a customer', async ({ request }) => {
        let response = await request.post(endPoints.createCustomer, { data: payloads.createCustomer() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(201)
    });

    test('update a customer', async ({ request }) => {
        // let [, customerId] = await apiUtils.createCustomer(payloads.createCustomer())

        let response = await request.put(endPoints.updateCustomer(customerId), { data: payloads.updateCustomer() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('delete a customer', async ({ request }) => {
        // let [, customerId] = await apiUtils.createCustomer(payloads.createCustomer())

        let response = await request.delete(endPoints.deleteCustomer(customerId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update batch customers', async ({ request }) => { 
        let allCustomerIds = (await apiUtils.getAllCustomers()).map(a => a.id)
        // console.log(allCustomerIds)
        let batchCustomers = []
        for (let customerId of allCustomerIds.slice(0, 2)) {
            batchCustomers.push({ ...payloads.updateBatchCustomersTemplate(), id: customerId })
        }
        // console.log(batchCustomers)

        let response = await request.put(endPoints.updateBatchCustomers, { data: { update: batchCustomers } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

    });

});

