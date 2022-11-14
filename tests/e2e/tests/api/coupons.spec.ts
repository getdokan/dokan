import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


//TODO: need to send vendor credentials for vendor info
test('get all coupons', async ({ request }) => {
    const response = await request.get(endPoints.getGetAllCoupons)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test.only('get single coupon', async ({ request }) => {
    const response1 = await request.get(endPoints.getGetAllCoupons)
    const responseBody1 = await response1.json()
    let couponId = (responseBody1.find(o => o.code === 'c1_v1')).id
    // console.log(responseBody1)

    const response = await request.get(endPoints.getGetSingleCoupon(couponId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('create a coupon', async ({ request }) => {
    const response = await request.post(endPoints.postCreateCoupon,{data: payloads.createCoupon})
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('update a coupon', async ({ request }) => {
    const response1 = await request.get(endPoints.getGetAllCoupons)
    const responseBody1 = await response1.json()
    let couponId = (responseBody1.find(o => o.code === 'c1_v1')).id
    // console.log(responseBody1)

    const response = await request.put(endPoints.putUpdateCoupon(couponId),{data: payloads.updateCoupon})
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('delete a coupon', async ({ request }) => {
    const response1 = await request.get(endPoints.getGetAllCoupons)
    const responseBody1 = await response1.json()
    let couponId = (responseBody1.find(o => o.code === 'c2_v1')).id
    // console.log(responseBody1)

    const response = await request.delete(endPoints.delDeleteCoupon(couponId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});
