//COVERAGE_TAG: GET /dokan/v1/subscription
//COVERAGE_TAG: GET /dokan/v1/subscription/packages
//COVERAGE_TAG: GET /dokan/v1/subscription/nonrecurring-packages
//COVERAGE_TAG: GET /dokan/v1/subscription/vendor/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/subscription/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/subscription/batch
//COVERAGE_TAG: PUT /dokan/v1/subscription/save-commission

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { schemas } from '@utils/schemas';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';

test.describe('vendor subscription api test', () => {
    test.skip(true, 'need subscription product');
    test.slow();
    let apiUtils: ApiUtils;
    let subscriptionPackId: string;
    let sellerId: string;

    async function createDokanSubscriptionProduct(productPayload: any, commissionPayload: any): Promise<[string, string]> {
        const [, productId, productName] = await apiUtils.createProduct(productPayload, payloads.adminAuth);
        await dbUtils.updateProductType(productId);
        await apiUtils.saveCommissionToSubscriptionProduct(productId, commissionPayload, payloads.adminAuth);
        return [productId, productName];
    }

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await dbUtils.setSubscriptionProductType();
        [subscriptionPackId] = await createDokanSubscriptionProduct(payloads.createDokanSubscriptionProduct(), payloads.saveVendorSubscriptionProductCommission);

        await createDokanSubscriptionProduct(payloads.createDokanSubscriptionProductRecurring(), payloads.saveVendorSubscriptionProductCommission);
        [sellerId] = await apiUtils.assignSubscriptionToVendor(subscriptionPackId);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all vendor subscriptions', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllVendorSubscriptions);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorSubscriptionsSchema.vendorSubscriptionsSchema);
    });

    test('get all vendor subscription packages', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllVendorSubscriptionPackages);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorSubscriptionsSchema.vendorSubscriptionPackagesSchema);
    });

    test('get all vendor subscription non-recurring packages', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllVendorSubscriptionNonRecurringPackages);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorSubscriptionsSchema.vendorSubscriptionNonRecurringPackagesSchema);
    });

    test('get vendor active subscription package', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getVendorActiveSubscriptionPackage(sellerId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorSubscriptionsSchema.activeSubscriptionPackSchema);
    });

    test('update vendor subscription', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateVendorSubscription(sellerId), { data: payloads.updateVendorSubscription });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorSubscriptionsSchema.updateSubscriptionSchema);
    });

    test('batch update vendor subscriptions', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchVendorSubscriptions, { data: { ...payloads.batchUpdateVendorSubscription, user_ids: [sellerId] } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorSubscriptionsSchema.batchUpdateSubscriptionSchema);
    });

    test('save vendor subscription product commission', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.saveVendorSubscriptionProductCommission, { data: { ...payloads.saveVendorSubscriptionProductCommission, product_id: subscriptionPackId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.vendorSubscriptionsSchema.saveCommissionSchema);
    });
});
