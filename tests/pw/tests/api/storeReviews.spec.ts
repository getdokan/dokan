//COVERAGE_TAG: GET /dokan/v1/stores/(?P<id>[\d]+)/reviews
//COVERAGE_TAG: POST /dokan/v1/stores/(?P<id>[\d]+)/reviews
//COVERAGE_TAG: GET /dokan/v1/store-reviews
//COVERAGE_TAG: GET /dokan/v1/store-reviews/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/store-reviews/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/store-reviews/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/store-reviews/(?P<id>[\d]+)/restore
//COVERAGE_TAG: PUT /dokan/v1/store-reviews/batch

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('store reviews api test', () => {
    let apiUtils: ApiUtils;
    let sellerId: string;
    let reviewId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // let [, sId,] = await apiUtils.createStore(payloads.createStore())
        [, sellerId] = await apiUtils.getCurrentUser();
        [, reviewId] = await apiUtils.createStoreReview(sellerId, payloads.createStoreReview, payloads.customerAuth);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get store reviews', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getStoreReviews(sellerId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create a store review', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createStoreReview(sellerId), { data: payloads.createStoreReview });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get all store reviews', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllStoreReviews);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get single store review', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleStoreReview(reviewId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update a store review', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateStoreReview(reviewId), { data: payloads.updateStoreReview });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete a store review', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteStoreReview(reviewId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('restore a deleted store review', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.restoreDeletedStoreReview(reviewId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update batch store review', { tag: ['@pro'] }, async () => {
        const allStoreReviewIds = (await apiUtils.getAllStoreReviews()).map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchStoreReviews, { data: { trash: allStoreReviewIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();

        // restore all store reviews
        // await apiUtils.updateBatchStoreReviews('restore', allStoreReviewIds);
        await apiUtils.updateBatchStoreReviews('restore', []);
    });
});
