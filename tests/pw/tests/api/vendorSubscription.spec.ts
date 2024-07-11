//COVERAGE_TAG: GET /dokan/v1/subscription
//COVERAGE_TAG: GET /dokan/v1/subscription/packages
//COVERAGE_TAG: GET /dokan/v1/subscription/nonrecurring-packages
//COVERAGE_TAG: GET /dokan/v1/subscription/vendor/(?P<id>[\d]+)  // TODO: might need to update method
//COVERAGE_TAG: GET /dokan/v1/subscription/(?P<id>[\d]+)   // TODO: might need to update method
//COVERAGE_TAG: PUT /dokan/v1/subscription/batch

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { schemas } from '@utils/schemas';

test.describe('vendor subscription api test', () => {
    test.skip(true, 'not implemented all tests yet');
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all vendor subscriptions', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllVendorSubscriptions);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.reportOverviewSchema);
    });

    test('get all vendor-subscription packages', { tag: ['@pro'] }, async () => {
        // todo: need a subscription pack
        const [response, responseBody] = await apiUtils.get(endPoints.getAllVendorSubscriptionPackages);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.reportSummarySchema);
    });

    test('get all vendor-subscription non-recurring packages', { tag: ['@pro'] }, async () => {
        // todo: need non-recurring subscription pack
        const [response, responseBody] = await apiUtils.get(endPoints.getAllVendorSubscriptionNonRecurringPackages);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.adminDashboardFeedSchema);
    });

    test('get vendor active subscription pack', { tag: ['@pro'] }, async () => {
        // todo: need vendor with subscription pack
        const vendorId = '1';
        const [response, responseBody] = await apiUtils.get(endPoints.getVendorActiveSubscriptionPack(vendorId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.admin.adminHelpSchema);
    });

    // todo: has two more endpoints
});
