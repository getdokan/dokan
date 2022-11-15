import { test, expect, type Page } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


test.beforeAll(async ({ request }) => {
    const apiUtils = new ApiUtils(request)
    await apiUtils.createProduct()

});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('product api test', () => {

    //TODO: need to send vendor credentials for vendor info
    test('get all products', async ({ request }) => {
        const response = await request.get(endPoints.getAllProducts)
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get products summary', async ({ request }) => {
        const response = await request.get(endPoints.getProductsSummary)
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get products with pagination', async ({ request }) => {
        const response = await request.get(endPoints.getProductsWithPagination('10', '1'))
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get top rated products', async ({ request }) => {
        const response = await request.get(endPoints.getTopRatedProducts)
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get best selling products', async ({ request }) => {
        const response = await request.get(endPoints.getBestSellingProducts)
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get latest products', async ({ request }) => {
        const response = await request.get(endPoints.getLatestProducts)
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get featured products', async ({ request }) => {
        const response = await request.get(endPoints.getFeaturedProducts)
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get single product', async ({ request }) => {
        const apiUtils = new ApiUtils(request)
        let [, productId] = await apiUtils.createProduct()

        const response = await request.get(endPoints.getSingleProduct(productId))
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('create a product', async ({ request }) => {
        const response = await request.post(endPoints.postCreateProduct, { data: payloads.createProduct() })
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('update a product', async ({ request }) => {
        const apiUtils = new ApiUtils(request)
        let [, productId] = await apiUtils.createProduct()

        const response = await request.put(endPoints.putUpdateProduct(productId), { data: payloads.updateProduct()})
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('delete a product', async ({ request }) => {
        const apiUtils = new ApiUtils(request)
        let [, productId] = await apiUtils.createProduct()

        const response = await request.delete(endPoints.delDeleteProduct(productId))
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

});


