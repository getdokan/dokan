import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

let apiUtils;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    await apiUtils.createCoupon(payloads.createProduct())
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('coupon api test', () => {

    test('get all coupons', async ({ request }) => {
        let response = await request.get(endPoints.getAllCoupons)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single coupon', async ({ request }) => {
        let [, couponId] = await apiUtils.createCoupon(payloads.createProduct())

        let response = await request.get(endPoints.getSingleCoupon(couponId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('create a coupon', async ({ request }) => {
        let [, productId] = await apiUtils.createProduct(payloads.createProduct())
        let payloadCoupon = payloads.createCoupon()
        payloadCoupon.product_ids = [productId]

        let response = await request.post(endPoints.createCoupon, { data: payloads.createCoupon() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('update a coupon', async ({ request }) => {
        let [, couponId] = await apiUtils.createCoupon(payloads.createProduct())

        let response = await request.put(endPoints.updateCoupon(couponId), { data: payloads.updateCoupon() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('delete a coupon', async ({ request }) => {
        let [, couponId] = await apiUtils.createCoupon(payloads.createProduct())

        let response = await request.delete(endPoints.deleteCoupon(couponId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


});