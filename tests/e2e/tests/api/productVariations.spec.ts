import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

let apiUtils;
test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('product variation api test', () => {


    //TODO: need to send vendor credentials 

    test('get all product variations', async ({ request }) => {
        let [productId,] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct())
        let response = await request.get(endPoints.getAllProductVariations(productId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('get single product variation', async ({ request }) => {
        let [productId, variationId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct())

        let response = await request.get(endPoints.getSingleProductVariation(productId, variationId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('create a product variation', async ({ request }) => {
        let [, productId] = await apiUtils.createProduct(payloads.createVariableProduct())

        let response = await request.post(endPoints.createProductVariation(productId), { data: payloads.createProductVariation })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('update a product variation', async ({ request }) => {
        let [productId, variationId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct())

        let response = await request.put(endPoints.updateProductVariation(productId, variationId), { data: payloads.updateProductVariation() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

    });


    test('delete a product variation', async ({ request }) => {
        let [productId, variationId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct())
        let response = await request.delete(endPoints.deleteProductVariation(productId, variationId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

    });


});