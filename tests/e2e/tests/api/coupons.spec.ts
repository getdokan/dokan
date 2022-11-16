import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createCoupon()

});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('coupon api test', () => {

    //TODO: need to send vendor credentials for vendor info
    //TODO: prerequisite => product id for payload and a coupon
    test('get all coupons', async ({ request }) => {
        let response = await request.get(endPoints.getAllCoupons)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get single coupon', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, couponId] = await apiUtils.createCoupon()

        let response = await request.get(endPoints.getSingleCoupon(couponId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('create a coupon', async ({ request }) => {
        let response = await request.post(endPoints.createCoupon, { data: payloads.createCoupon() })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('update a coupon', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, couponId] = await apiUtils.createCoupon()

        let response = await request.put(endPoints.updateCoupon(couponId), { data: payloads.updateCoupon() })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('delete a coupon', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, couponId] = await apiUtils.createCoupon()

        let response = await request.delete(endPoints.deleteCoupon(couponId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


});