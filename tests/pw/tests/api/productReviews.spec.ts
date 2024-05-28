//COVERAGE_TAG: GET /dokan/v1/reviews
//COVERAGE_TAG: GET /dokan/v1/reviews/summary
//COVERAGE_TAG: PUT /dokan/v1/reviews/(?P<id>[\d]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('product review api test', () => {
    let apiUtils: ApiUtils;
    let reviewId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, reviewId] = await apiUtils.createProductReview(payloads.createProduct(), payloads.createProductReview());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all product reviews', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllProductReviews);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get product reviews summary', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getProductReviewSummary);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update a product review', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateStoreReview(reviewId), { data: payloads.updateProductReview });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
