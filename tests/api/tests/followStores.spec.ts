import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let sellerId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	// [, sellerId] = await apiUtils.createStore(payloads.createStore());
	[, sellerId] = await apiUtils.getCurrentUser();
	await apiUtils.followUnfollowStore(sellerId);
});


test.describe('follow store api test', () => {
	
	test('get store follow status @pro', async ({ request }) => {
		const response = await request.get(endPoints.getStoreFollowStatus(sellerId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('follow-unfollow a store @pro', async ({ request }) => {
		const response = await request.post(endPoints.followUnfollowStore, { data: { vendor_id: Number(sellerId) } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get followers @pro', async ({ request }) => {
		const response = await request.get(endPoints.getFollowers);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
