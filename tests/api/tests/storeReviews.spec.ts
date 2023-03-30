import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let sellerId: string;
let reviewId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	// let [, sId] = await apiUtils.createStore(payloads.createStore())
	[, sellerId] = await apiUtils.getCurrentUser();
	[, reviewId] = await apiUtils.createStoreReview(sellerId, payloads.createStoreReview, payloads.customerAuth);
});


test.describe('store reviews api test', () => {

	test('get store reviews @pro', async ({ request }) => {
		const response = await request.get(endPoints.getStoreReviews(sellerId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create a store review @pro', async ({ request }) => {
		const response = await request.post(endPoints.createStoreReview(sellerId), { data: payloads.createStoreReview });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get all store reviews @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllStoreReviews);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get single store review @pro', async ({ request }) => {
		const response = await request.get(endPoints.getSingleStoreReview(reviewId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update a store review @pro', async ({ request }) => {
		const response = await request.put(endPoints.updateStoreReview(reviewId), { data: payloads.updateStoreReview });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('delete a store review  @pro', async ({ request }) => {
		const response = await request.delete(endPoints.deleteStoreReview(reviewId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('restore a deleted store review  @pro', async ({ request }) => {
		const response = await request.put(endPoints.restoreDeletedStoreReview(reviewId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update batch store review @pro', async ({ request }) => {
		const allStoreReviewIds = (await apiUtils.getAllStoreReviews()).map((a: { id: any }) => a.id);
		const response = await request.put(endPoints.updateBatchStoreReviews, { data: { trash: allStoreReviewIds } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();

		// restore all store reviews
		await apiUtils.updateBatchStoreReviews('restore', allStoreReviewIds);
	});
});
