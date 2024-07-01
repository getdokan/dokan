//COVERAGE_TAG: GET /dokan/v1/coupons
//COVERAGE_TAG: GET /dokan/v1/coupons/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/coupons
//COVERAGE_TAG: PUT /dokan/v1/coupons/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/coupons/(?P<id>[\d]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

test.describe('coupon api test', () => {
    let apiUtils: ApiUtils;
    let couponId: string;
    let productId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, productId] = await apiUtils.createProduct(payloads.createProduct());
        [, couponId] = await apiUtils.createCoupon([productId], payloads.createCoupon());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all coupons', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllCoupons);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.couponsSchema.couponsSchema);
    });

    test('get single coupon', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleCoupon(couponId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.couponsSchema.couponSchema);
    });

    test('create a coupon', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createCoupon, { data: { ...payloads.createCoupon(), product_ids: productId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.couponsSchema.couponSchema);
    });

    test('update a coupon', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateCoupon(couponId), { data: payloads.updateCoupon() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.couponsSchema.couponSchema);
    });

    test('delete a coupon', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteCoupon(couponId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.couponsSchema.couponSchema);
    });
});
