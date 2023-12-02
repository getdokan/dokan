//COVERAGE_TAG: GET /dokan/v1/follow-store
//COVERAGE_TAG: POST /dokan/v1/follow-store
//COVERAGE_TAG: GET /dokan/v1/follow-store/followers

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { schemas } from '@utils/schemas';
// import { payloads } from '@utils/payloads';

test.describe('follow store api test', () => {
    let apiUtils: ApiUtils;
    let sellerId: string;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        // [, sellerId,] = await apiUtils.createStore(payloads.createStore());
        [, sellerId] = await apiUtils.getCurrentUser();
        // await apiUtils.followUnfollowStore(sellerId);
    });

    test('get store follow status @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getStoreFollowStatus, { params: { vendor_id: sellerId } });
        const headers = response.headers();
        expect(headers['content-type']).toBe('application/json; charset=UTF-8');
        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['access-control-expose-headers']).toBe('X-WP-Total, X-WP-TotalPages, Link');
        expect(headers['access-control-allow-headers']).toBe('Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type');
        expect(headers['allow']).toBe('GET, POST');
        expect(response.statusText()).toBe('OK')
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.followStoresSchema.followstatusSchema);
    });

    test('follow-unfollow a store @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.followUnfollowStore, { data: { vendor_id: Number(sellerId) } });
        const headers = response.headers();
        expect(headers['content-type']).toBe('application/json; charset=UTF-8');
        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['access-control-expose-headers']).toBe('X-WP-Total, X-WP-TotalPages, Link');
        expect(headers['access-control-allow-headers']).toBe('Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type');
        expect(headers['allow']).toBe('GET, POST');
        expect(response.statusText()).toBe('OK')
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.followStoresSchema.followUnfollowSchema);
    });

    test('get followers @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getFollowers);
        const headers = response.headers();
        expect(headers['content-type']).toBe('application/json; charset=UTF-8');
        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['access-control-expose-headers']).toBe('X-WP-Total, X-WP-TotalPages, Link');
        expect(headers['access-control-allow-headers']).toBe('Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type');
        expect(headers['allow']).toBe('GET');
        expect(response.statusText()).toBe('OK')
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.followStoresSchema.followersSchema);
    });
});
