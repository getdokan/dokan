import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

let apiUtils: any
let productAdvertisementId: string
test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, id] = await apiUtils.createProductAdvertisement()
    productAdvertisementId = id
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('product advertisement api test', () => {

    //TODO: need to send admin credentials 

    test('get all advertised product stores', async ({ request }) => {
        let response = await request.get(endPoints.getAllProductAdvertisementStores)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get all advertised product', async ({ request }) => {
        let response = await request.get(endPoints.getAllProductAdvertisements)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('create a product advertisement', async ({ request }) => {
        let [body, productId] = await apiUtils.createProduct(payloads.createProduct())
        let sellerId = body.store.id

        let response = await request.post(endPoints.createProductAdvertisement, { data: { vendor_id: sellerId, product_id: productId } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('expire a product advertisement', async ({ request }) => {
        // let [, productAdvertisementId] = await apiUtils.createProductAdvertisement()

        let response = await request.put(endPoints.expireProductAdvertisement(productAdvertisementId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('delete a product advertisement', async ({ request }) => {
        // let [, productAdvertisementId] = await apiUtils.createProductAdvertisement()

        let response = await request.delete(endPoints.deleteProductAdvertisement(productAdvertisementId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update batch product advertisements', async ({ request }) => {
        let allproductAdvertisementIds = (await apiUtils.getAllProductAdvertisements()).map(a => a.id)
        // console.log(allproductAdvertisementIds)

        let response = await request.put(endPoints.updateBatchProductAdvertisements, { data: { ids: allproductAdvertisementIds, action: "delete" } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});


