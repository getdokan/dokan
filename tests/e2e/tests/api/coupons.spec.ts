import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



test.beforeAll(async ({ request }) => {
    const apiUtils = new ApiUtils(request)
    await apiUtils.createCoupon()

});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('coupon api test', () => {

    //TODO: need to send vendor credentials for vendor info
    test('get all coupons', async ({ request }) => {
        const response = await request.get(endPoints.getGetAllCoupons)
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get single coupon', async ({ request }) => {
        const apiUtils = new ApiUtils(request)
        let [, couponId] = await apiUtils.createCoupon()

        const response = await request.get(endPoints.getGetSingleCoupon(couponId))
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('create a coupon', async ({ request }) => {
        const response = await request.post(endPoints.postCreateCoupon, { data: payloads.createCoupon() })
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('update a coupon', async ({ request }) => {
        const apiUtils = new ApiUtils(request)
        let [, couponId] = await apiUtils.createCoupon()

        const response = await request.put(endPoints.putUpdateCoupon(couponId), { data: payloads.updateCoupon() })
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('delete a coupon', async ({ request }) => {
        const apiUtils = new ApiUtils(request)
        let [, couponId] = await apiUtils.createCoupon()

        const response = await request.delete(endPoints.delDeleteCoupon(couponId))
        const responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


});