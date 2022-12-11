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


    test('update batch wholesale customers', async ({ request }) => { 
        let allWholesaleCustomerIds = (await apiUtils.getAllWholesaleCustomers()).map(a => a.id)
        // console.log(allWholesaleCustomerIds)

        let response = await request.put(endPoints.updateBatchWholesaleCustomer, { data: { activate: allWholesaleCustomerIds } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

    });

});
