//COVERAGE_TAG: GET /dokan/v1/seller-badge/verification-types
//COVERAGE_TAG: GET /dokan/v1/seller-badge/events
//COVERAGE_TAG: GET /dokan/v1/seller-badge
//COVERAGE_TAG: GET /dokan/v1/seller-badge/(?P<id>[\d]+)
//COVERAGE_TAG: GET /dokan/v1/seller-badge/vendor-unseen-badges
//COVERAGE_TAG: PUT /dokan/v1/seller-badge/set-badge-as-seen
//COVERAGE_TAG: POST /dokan/v1/seller-badge
//COVERAGE_TAG: PUT /dokan/v1/seller-badge/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/seller-badge/row-actions
//COVERAGE_TAG: DELETE /dokan/v1/seller-badge/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/seller-badge/bulk-actions

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

test.describe('seller badge api test', () => {
    let apiUtils: ApiUtils;
    let badgeId: string;
    let currentUserId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // delete previous badges
        await apiUtils.deleteAllSellerBadges();
        [, currentUserId] = await apiUtils.getCurrentUser();
        [, badgeId] = await apiUtils.createSellerBadge(payloads.createSellerBadgeExclusiveToPlatform);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get verified-seller verification types', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getVerifiedSellerVerificationTypes);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.sellerBadgeSchema.verificationTypesSchema);
    });

    test('get all seller badge events', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllSellerBadgeEvents);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.sellerBadgeSchema.badgeEventsSchema);
    });

    test('get all seller badges', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllSellerBadges);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.sellerBadgeSchema.badgesSchema);
    });

    test('get single seller badge', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleSellerBadge(badgeId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.sellerBadgeSchema.badgeSchema);
    });

    test('get vendor unseen seller badges', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getVendorUnseenSellerBadges, { params: { vendor_id: currentUserId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.sellerBadgeSchema.badgesSchema);
    });

    test('set vendor seller badges as seen', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.setSellerBadgeAsSeen, { data: { vendor_id: currentUserId, badge_id: badgeId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.sellerBadgeSchema.badgeSeenSchema);
    });

    test('create a seller badge', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createSellerBadge, { data: payloads.createSellerBadgeProductsPublished });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.sellerBadgeSchema.badgeCreateUpdateSchema);
    });

    test('update a seller badge', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateSellerBadge(badgeId), { data: payloads.updateSellerBadge });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.sellerBadgeSchema.badgeCreateUpdateSchema);
    });

    test('update row actions', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.setSellerBadgeRowActions, { data: { ids: badgeId, action: 'draft' } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.sellerBadgeSchema.badgeCreateUpdateSchema);
    });

    test('delete a seller badge', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteSellerBadge(badgeId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.sellerBadgeSchema.deleteBadgeSchema);
    });

    test('update batch seller badges', { tag: ['@pro'] }, async () => {
        const allBadgeIds = (await apiUtils.getAllSellerBadges()).map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchSellerBadges, { data: { ids: allBadgeIds, action: 'draft' } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.sellerBadgeSchema.batchUpdateBadgesSchema);
    });
});
