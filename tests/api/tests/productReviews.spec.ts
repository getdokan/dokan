import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let reviewId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, reviewId] = await apiUtils.createProductReview(payloads.createProduct(), payloads.createProductReview());
});

test.describe('product review api test', () => {
	
	test('get all product reviews @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllProductReviews);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get product reviews summary @pro', async ({ request }) => {
		const response = await request.get(endPoints.getProductReviewSummary);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update a product review @pro', async ({ request }) => {
		const response = await request.put(endPoints.updateStoreReview(reviewId), { data: payloads.updateProductReview });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
