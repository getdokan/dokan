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
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get single store review', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let reviewId = await apiUtils.getStoreReviewId()

        let response = await request.get(endPoints.getSingleStoreReview(reviewId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('update a store review', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let reviewId = await apiUtils.getStoreReviewId()

        let response = await request.put(endPoints.updateStoreReview(reviewId), { data: payloads.updateStoreReview })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)

    });

    test('delete a store review ', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let reviewId = await apiUtils.getStoreReviewId()

        let response = await request.delete(endPoints.deleteStoreReview(reviewId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('restore a deleted store review ', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let reviewId = await apiUtils.getStoreReviewId()
        await request.delete(endPoints.deleteStoreReview(reviewId))

        let response = await request.put(endPoints.restoreDeletedStoreReview(reviewId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('update batch store review', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let allStoreReviewIds = (await apiUtils.getAllStoreReviews()).map(a => a.id)
        console.log(allStoreReviewIds)

        let response = await request.put(endPoints.updateBatchStoreReviews, { data: { trash: allStoreReviewIds } })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)

        // restore all store reviews
        await apiUtils.updateBatchStoreReviews('restore', allStoreReviewIds)
    });

});