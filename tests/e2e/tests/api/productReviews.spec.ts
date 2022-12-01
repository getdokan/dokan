import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createProductReview(payloads.createProduct(), payloads.createProductReview())
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('product review api test', () => {

    //TODO: need to send vendor credentials for vendor info

    test('get all product reviews', async ({ request }) => {
        let response = await request.get(endPoints.getAllProductReviews)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get product reviews summary', async ({ request }) => {
        let response = await request.get(endPoints.getProductReviewSummary)
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('update a product review', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, reviewId] = await apiUtils.createProductReview(payloads.createProduct(), payloads.createProductReview())

        let response = await request.put(endPoints.updateStoreReview(reviewId), { data: payloads.updateProductReview })
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });



});
