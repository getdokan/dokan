import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



// test.beforeAll(async ({ request }) => {
// let apiUtils = new ApiUtils(request) 
// let [,sellerId] = await apiUtils.createStore(payloads.createStore) // TODO: request sender must be other than vendor
// await apiUtils.createStoreReview(sellerId,payloads.createStoreReview)
// });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe.skip('store reviews api test', () => {

    //TODO: need to send admin credentials 
    //TODO: store, store reviews

    test('get all store reviews', async ({ request }) => {
        let response = await request.get(endPoints.getAllStoreReviews)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get single store review', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let reviewId = await apiUtils.getStoreReviewId()

        let response = await request.get(endPoints.getSingleStoreReview(reviewId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('update a store review', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let reviewId = await apiUtils.getStoreReviewId()

        let response = await request.put(endPoints.updateStoreReview(reviewId), { data: payloads.updateStoreReview })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

    });

    test('delete a store review ', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let reviewId = await apiUtils.getStoreReviewId()

        let response = await request.delete(endPoints.deleteStoreReview(reviewId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('restore a deleted store review ', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let reviewId = await apiUtils.getStoreReviewId()
        await request.delete(endPoints.deleteStoreReview(reviewId))

        let response = await request.put(endPoints.restoreDeletedStoreReview(reviewId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('update batch store review', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let allStoreReviewIds = (await apiUtils.getAllStoreReviews()).map(a => a.id)
        console.log(allStoreReviewIds)

        let response = await request.put(endPoints.updateBatchStoreReviews, { data: { trash: allStoreReviewIds } })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        // restore all store reviews
        await apiUtils.updateBatchStoreReviews('restore', allStoreReviewIds)
    });

});