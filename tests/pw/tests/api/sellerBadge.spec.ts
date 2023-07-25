import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';

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

	test('get verified-seller verification types @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getVerifiedSellerVerificationTypes);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get all seller badge events @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllSellerBadgeEvents);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get all seller badges @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllSellerBadges);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get single seller badge @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getSingleSellerBadge(badgeId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get vendor unseen seller badges @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getVendorUnseenSellerBadges, { params: { vendor_id: currentUserId } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('set vendor seller badges as seen @pro', async () => {
		const [response, responseBody] = await apiUtils.put(endPoints.setSellerBadgeAsSeen, { data: { vendor_id: currentUserId, badge_id: badgeId } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('create a seller badge @pro', async () => {
		const [response, responseBody] = await apiUtils.post(endPoints.createSellerBadge, { data: payloads.createSellerBadgeProductsPublished });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update a seller badge @pro', async () => {
		const [response, responseBody] = await apiUtils.put(endPoints.updateSellerBadge(badgeId), { data: payloads.updateSellerBadge });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update row actions @pro', async () => {
		const [response, responseBody] = await apiUtils.put(endPoints.setSellerBadgeRowActions, { data: { ids: badgeId, action: 'draft' } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('delete a seller badge @pro', async () => {
		const [response, responseBody] = await apiUtils.delete(endPoints.deleteSellerBadge(badgeId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update batch seller badges @pro', async () => {
		const allBadgeIds = (await apiUtils.getAllSellerBadges()).map((a: { id: unknown }) => a.id);
		const [response, responseBody] = await apiUtils.put(endPoints.updateBatchSellerBadges, { data: { ids: allBadgeIds, action: 'draft' } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});