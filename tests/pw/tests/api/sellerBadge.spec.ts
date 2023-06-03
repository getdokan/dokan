import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: ApiUtils;
let badgeId: string;
let currentUserId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	// delete previous badges
	await apiUtils.deleteAllSellerBadges(); // TODO: also apply this type of soln where it can be possible
	[, currentUserId] = await apiUtils.getCurrentUser();
	[, badgeId] = await apiUtils.createSellerBadge(payloads.createSellerBadgeExclusiveToPlatform);
});

test.describe('seller badge api test', () => {

	test('get verified-seller verification types @pro', async ({ request }) => {
		const response = await request.get(endPoints.getVerifiedSellerVerificationTypes);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get all seller badge events @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllSellerBadgeEvents);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get all seller badges @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllSellerBadges);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get single seller badge @pro', async ({ request }) => {
		const response = await request.get(endPoints.getSingleSellerBadge(badgeId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get vendor unseen seller badges @pro', async ({ request }) => {
		const response = await request.get(endPoints.getVendorUnseenSellerBadges, { params: { vendor_id: currentUserId } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('set vendor seller badges as seen @pro', async ({ request }) => {
		const response = await request.put(endPoints.setSellerBadgeAsSeen, { data: { vendor_id: currentUserId, badge_id: badgeId } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create a seller badge @pro', async ({ request }) => {
		const response = await request.post(endPoints.createSellerBadge, { data: payloads.createSellerBadgeProductPublished });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response, false);
		expect(responseBody).toBeTruthy();
		responseBody.code === 'invalid-event-type' ? expect(response.status()).toBe(500) : expect(response.ok()).toBeTruthy();
	});

	test('update a seller badge @pro', async ({ request }) => {
		const response = await request.put(endPoints.updateSellerBadge(badgeId), { data: payloads.updateSellerBadge });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update row actions @pro', async ({ request }) => {
		const response = await request.put(endPoints.setSellerBadgeRowActions, { data: { ids: badgeId, action: 'draft' } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete a seller badge @pro', async ({ request }) => {
		const response = await request.delete(endPoints.deleteSellerBadge(badgeId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update batch seller badges @pro', async ({ request }) => {
		const allBadgeIds = (await apiUtils.getAllSellerBadges()).map((a: { id: any }) => a.id);
		const response = await request.put(endPoints.updateBatchSellerBadges, { data: { ids: allBadgeIds, action: 'draft' } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
