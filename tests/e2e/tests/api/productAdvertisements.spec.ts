import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createProductAdvertisement()
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('product advertisement api test', () => {

    //TODO: need to send admin credentials 
    test('get all advertised product stores', async ({ request }) => {
        let response = await request.get(endPoints.getAllProductAdvertisementStores)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get all advertised product', async ({ request }) => {
        let response = await request.get(endPoints.getAllProductAdvertisements)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('create a product advertisement', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [body, productId] = await apiUtils.createProduct(payloads.createProduct())
        let sellerId = body.store.id

        let response = await request.post(endPoints.createProductAdvertisement, { data: { vendor_id: sellerId, product_id: productId } })
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('expire a product advertisement', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, productAdvertisementId] = await apiUtils.createProductAdvertisement()

        let response = await request.put(endPoints.expireProductAdvertisement(productAdvertisementId))
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('delete a product advertisement', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, productAdvertisementId] = await apiUtils.createProductAdvertisement()

        let response = await request.delete(endPoints.deleteProductAdvertisement(productAdvertisementId))
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('update batch product advertisements', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let allproductAdvertisementIds = (await apiUtils.getAllProductAdvertisements()).map(a => a.id)

        let response = await request.put(endPoints.updateBatchProductAdvertisements, { data: { ids: allproductAdvertisementIds, action: "delete" } })
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

});


