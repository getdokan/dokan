import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


let apiUtils;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, sellerId] = await apiUtils.createStore(payloads.createStore())
    let [, reviewId] = await apiUtils.createStoreReview(sellerId, payloads.createStoreReview)
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('store reviews api test', () => {

    //TODO: need to send admin credentials 
    //TODO: store, store reviews

    test('get all store reviews', async ({ request }) => {
        let response = await request.get(endPoints.getAllStoreReviews)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single store review', async ({ request }) => {
        // let reviewId = await apiUtils.getStoreReviewId()
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())
        let [, reviewId] = await apiUtils.createStoreReview(sellerId, payloads.createStoreReview)

        let response = await request.get(endPoints.getSingleStoreReview(reviewId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update a store review', async ({ request }) => {
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())
        let [, reviewId] = await apiUtils.createStoreReview(sellerId, payloads.createStoreReview)

        let response = await request.put(endPoints.updateStoreReview(reviewId), { data: payloads.updateStoreReview })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

    });

    test('delete a store review ', async ({ request }) => {
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())
        let [, reviewId] = await apiUtils.createStoreReview(sellerId, payloads.createStoreReview)

        let response = await request.delete(endPoints.deleteStoreReview(reviewId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('restore a deleted store review ', async ({ request }) => {
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())
        let [, reviewId] = await apiUtils.createStoreReview(sellerId, payloads.createStoreReview)
        await request.delete(endPoints.deleteStoreReview(reviewId))

        let response = await request.put(endPoints.restoreDeletedStoreReview(reviewId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update batch store review', async ({ request }) => {
        let allStoreReviewIds = (await apiUtils.getAllStoreReviews()).map(a => a.id)
        // console.log(allStoreReviewIds)

        let response = await request.put(endPoints.updateBatchStoreReviews, { data: { trash: allStoreReviewIds } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

        // restore all store reviews
        await apiUtils.updateBatchStoreReviews('restore', allStoreReviewIds)
    });

});