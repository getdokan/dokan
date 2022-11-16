import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('product variation api test', () => {


    //TODO: need to send vendor credentials for vendor info
    // TODO: prerequisite variable product with variations
    test('get all product variations', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let productId = await apiUtils.getProductId('p2_v1')

        let response = await request.get(endPoints.getAllProductVariations(productId))

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('get single product variation', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [productId, variationId] = await apiUtils.getVariationTd('p2_v1')


        let response = await request.get(endPoints.getSingleProductVariation(productId, variationId))
        let responseBody = await response.json()
        console.log(responseBody)

        // expect(response.ok()).toBeTruthy()
        // expect(response.status()).toBe(200)
    });


    test('create a product variation', async ({ request }) => { //TODO: not generate attribute
        let apiUtils = new ApiUtils(request)
        let productId = await apiUtils.getProductId('p2_v1')

        let response = await request.post(endPoints.createProductVariation(productId), { data: payloads.createProductVariation })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('update a product variation', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [productId, variationId] = await apiUtils.getVariationTd('p2_v1')

        let response = await request.put(endPoints.updateProductVariation(productId, variationId), { data: payloads.updateProductVariation })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('delete a product variation', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [productId, variationId] = await apiUtils.getVariationTd('p2_v1')

        let response = await request.delete(endPoints.deleteProductVariation(productId, variationId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });



});