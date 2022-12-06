import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createCoupon(payloads.createProduct())

});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('coupon api test', () => {

    //TODO: need to send vendor credentials for vendor info
    test('get all coupons', async ({ request }) => {
        let response = await request.get(endPoints.getAllCoupons)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get single coupon', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, couponId] = await apiUtils.createCoupon(payloads.createProduct())

        let response = await request.get(endPoints.getSingleCoupon(couponId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


    test('create a coupon', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, productId] = await apiUtils.createProduct(payloads.createProduct())
        let payloadCoupon = payloads.createCoupon()
        payloadCoupon.product_ids = [productId]

        let response = await request.post(endPoints.createCoupon, { data: payloads.createCoupon() })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


    test('update a coupon', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, couponId] = await apiUtils.createCoupon(payloads.createProduct())

        let response = await request.put(endPoints.updateCoupon(couponId), { data: payloads.updateCoupon() })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


    test('delete a coupon', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, couponId] = await apiUtils.createCoupon(payloads.createProduct())

        let response = await request.delete(endPoints.deleteCoupon(couponId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });


});