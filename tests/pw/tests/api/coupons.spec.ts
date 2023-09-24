//COVERAGE_TAG: GET /dokan/v1/coupons
//COVERAGE_TAG: GET /dokan/v1/coupons/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/coupons
//COVERAGE_TAG: PUT /dokan/v1/coupons/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/coupons/(?P<id>[\d]+)

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('coupon api test', () => {
    let apiUtils: ApiUtils;
    let couponId: string;
    let productId: string;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        [, productId] = await apiUtils.createProduct(payloads.createProduct());
        [, couponId] = await apiUtils.createCoupon([productId], payloads.createCoupon());
    });

    test('get all coupons @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllCoupons);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get single coupon @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleCoupon(couponId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create a coupon @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createCoupon, { data: { ...payloads.createCoupon(), product_ids: productId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update a coupon @pro', async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateCoupon(couponId), { data: payloads.updateCoupon() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete a coupon @pro', async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteCoupon(couponId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
