import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';
import { helpers } from '../utils/helpers';

let apiUtils: any;
let badgeId: string;
let currentUserId: string;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request);
    [, currentUserId] = await apiUtils.getCurrentUser();
    [, badgeId] = await apiUtils.createSellerBadge(payloads.createSellerBadge);
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('seller badge api test', () => {

    test('get verified-seller verification types @pro', async ({ request }) => {
        const response = await request.get(endPoints.getVerifiedSellerVerificationTypes);
        const responseBody = await apiUtils.getResponseBody(response);
        expect(response.ok()).toBeTruthy();
    });

    test('get all seller badge events @pro', async ({ request }) => {
        const response = await request.get(endPoints.getAllSellerBadgeEvents);
        const responseBody = await apiUtils.getResponseBody(response);
        expect(response.ok()).toBeTruthy();
    });

    test('get all seller badges @pro', async ({ request }) => {
        const response = await request.get(endPoints.getAllSellerBadges);
        const responseBody = await apiUtils.getResponseBody(response);
        expect(response.ok()).toBeTruthy();
    });

    test('get single seller badge @pro', async ({ request }) => {
        const response = await request.get(endPoints.getSingleSellerBadge(badgeId));
        const responseBody = await apiUtils.getResponseBody(response);
        expect(response.ok()).toBeTruthy();
    });

    test('get vendor unseen seller badges @pro', async ({ request }) => {
        const response = await request.get(endPoints.getVendorUnseenSellerBadges(currentUserId));
        const responseBody = await apiUtils.getResponseBody(response);
        expect(response.ok()).toBeTruthy();
    });

    test('set vendor seller badges as seen @pro', async ({ request }) => {
        const response = await request.put(endPoints.setSellerBadgeAsSeen, { data: { vendor_id: currentUserId, badge_id: badgeId } });
        const responseBody = await apiUtils.getResponseBody(response);
        expect(response.ok()).toBeTruthy();
    });

    test('create a seller badge @pro', async ({ request }) => {
        const response = await request.post(endPoints.createSellerBadge, { data: payloads.createSellerBadge1 });
        const responseBody = await apiUtils.getResponseBody(response, false);
        responseBody.code === 'invalid-event-type' ? expect(response.status()).toBe(500) : expect(response.ok()).toBeTruthy();
    });

    test('update a seller badge @pro', async ({ request }) => {
        const response = await request.put(endPoints.updateSellerBadge(badgeId), { data: payloads.updateSellerBadge });
        const responseBody = await apiUtils.getResponseBody(response);
        expect(response.ok()).toBeTruthy();
    });

    test('update row actions @pro', async ({ request }) => {
        const response = await request.put(endPoints.setSellerBadgeRowActions, { data: { ids: badgeId, action: 'draft' } });
        const responseBody = await apiUtils.getResponseBody(response);
        expect(response.ok()).toBeTruthy();
    });

    test('delete a seller badge @pro', async ({ request }) => {


        const response = await request.delete(endPoints.deleteSellerBadge(badgeId));
        const responseBody = await apiUtils.getResponseBody(response);
        expect(response.ok()).toBeTruthy();
    });

    test('update batch seller badges @pro', async ({ request }) => {


        const allBadgeIds = (await apiUtils.getAllSellerBadges()).map((a: { id: any }) => a.id);
        // console.log(allBadgeIds)

        const response = await request.put(endPoints.updateBatchCustomers, { data: { ids: allBadgeIds, action: 'draft' } });
        const responseBody = await apiUtils.getResponseBody(response);
        expect(response.ok()).toBeTruthy();
    });

});
