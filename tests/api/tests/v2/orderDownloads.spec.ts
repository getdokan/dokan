import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

let apiUtils: any
let productId: string
let variationId: string
let orderId: string


test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, pId] = await apiUtils.createProduct(payloads.createDownloadableProduct())
    productId = pId
    let [, vId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct())
    variationId = vId
    let [, id] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder)
    orderId = id
    await apiUtils.createOrderDownload(orderId, [productId],)
    // await apiUtils.createOrderDownload(33, ['31'],)
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('order downloads api test', () => {

    test('get all order downloads', async ({ request }) => {
        let response = await request.get(endPoints.getAllOrderDownloads(orderId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test.only('create order downloads', async ({ request }) => {
        let response = await request.post(endPoints.createOrderDownload('33'), { data: { ids: [31] } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('delete order downloads', async ({ request }) => {
        let response = await request.delete(endPoints.deleteOrderDownload(orderId), { data: { permission_id: 1 } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});
