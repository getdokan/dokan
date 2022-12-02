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
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get all advertised product', async ({ request }) => {
        let response = await request.get(endPoints.getAllProductAdvertisements)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('create a product advertisement', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [body, productId] = await apiUtils.createProduct(payloads.createProduct())
        let sellerId = body.store.id

        let response = await request.post(endPoints.createProductAdvertisement, { data: { vendor_id: sellerId, product_id: productId } })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


    test('expire a product advertisement', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, productAdvertisementId] = await apiUtils.createProductAdvertisement()

        let response = await request.put(endPoints.expireProductAdvertisement(productAdvertisementId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('delete a product advertisement', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, productAdvertisementId] = await apiUtils.createProductAdvertisement()

        let response = await request.delete(endPoints.deleteProductAdvertisement(productAdvertisementId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


    test('update batch product advertisements', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let allproductAdvertisementIds = (await apiUtils.getAllProductAdvertisements()).map(a => a.id)

        let response = await request.put(endPoints.updateBatchProductAdvertisements, { data: { ids: allproductAdvertisementIds, action: "delete" } })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

});


