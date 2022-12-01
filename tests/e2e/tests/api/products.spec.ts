import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createProduct(payloads.createProduct())

});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('product api test', () => {

    //TODO: need to send vendor credentials for vendor info

    test('get products summary', async ({ request }) => {
        let response = await request.get(endPoints.getProductsSummary)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get top rated products', async ({ request }) => {
        let response = await request.get(endPoints.getTopRatedProducts)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get best selling products', async ({ request }) => {
        let response = await request.get(endPoints.getBestSellingProducts)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get featured products', async ({ request }) => {
        let response = await request.get(endPoints.getFeaturedProducts)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get latest products', async ({ request }) => {
        let response = await request.get(endPoints.getLatestProducts)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get all multistep categories', async ({ request }) => {
        let response = await request.get(endPoints.getAllMultistepCategories)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get all products', async ({ request }) => {
        let response = await request.get(endPoints.getAllProducts)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get single product', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, productId] = await apiUtils.createProduct(payloads.createProduct())

        let response = await request.get(endPoints.getSingleProduct(productId))
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get all related products', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, productId] = await apiUtils.createProduct(payloads.createProduct())

        let response = await request.get(endPoints.getAllRelatedProducts(productId))
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('create a product', async ({ request }) => {
        let response = await request.post(endPoints.createProduct, { data: payloads.createProduct() })
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('update a product', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, productId] = await apiUtils.createProduct(payloads.createProduct())

        let response = await request.put(endPoints.updateProduct(productId), { data: payloads.updateProduct() })
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('delete a product', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, productId] = await apiUtils.createProduct(payloads.createProduct())

        let response = await request.delete(endPoints.deleteProduct(productId))
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

});


