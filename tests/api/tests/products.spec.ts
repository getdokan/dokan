import { test, expect } from '@playwright/test'
import { ApiUtils } from '../utils/apiUtils'
import { endPoints } from '../utils/apiEndPoints'
import { payloads } from '../utils/payloads'

let apiUtils: any
let productId: string

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, id] = await apiUtils.createProduct(payloads.createProduct())
    productId = id
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('product api test', () => {

    test('get products summary', async ({ request }) => {
        let response = await request.get(endPoints.getProductsSummary)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get top rated products', async ({ request }) => {
        let response = await request.get(endPoints.getTopRatedProducts)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get best selling products', async ({ request }) => {
        let response = await request.get(endPoints.getBestSellingProducts)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get featured products', async ({ request }) => {
        let response = await request.get(endPoints.getFeaturedProducts)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get latest products', async ({ request }) => {
        let response = await request.get(endPoints.getLatestProducts)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get all multiStep categories', async ({ request }) => {
        let response = await request.get(endPoints.getAllMultiStepCategories)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get all products', async ({ request }) => {
        let response = await request.get(endPoints.getAllProducts)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single product', async ({ request }) => {
        // let [, productId] = await apiUtils.createProduct(payloads.createProduct())

        let response = await request.get(endPoints.getSingleProduct(productId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get all related products', async ({ request }) => {
        // let [, productId] = await apiUtils.createProduct(payloads.createProduct())

        let response = await request.get(endPoints.getAllRelatedProducts(productId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('create a product', async ({ request }) => {
        let response = await request.post(endPoints.createProduct, { data: payloads.createProduct() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update a product', async ({ request }) => {
        // let [, productId] = await apiUtils.createProduct(payloads.createProduct())

        let response = await request.put(endPoints.updateProduct(productId), { data: payloads.updateProduct() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('delete a product', async ({ request }) => {
        // let [, productId] = await apiUtils.createProduct(payloads.createProduct())

        let response = await request.delete(endPoints.deleteProduct(productId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});


