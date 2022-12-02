import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



// test.beforeAll(async ({ request }) => {
//     let apiUtils = new ApiUtils(request)
//     let [,sellerId] = await apiUtils.createStore(payloads.createStore())
//     await apiUtils.followUnfollowStore(sellerId)
// });

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('follow store api test', () => {

    //TODO: need to send customer credentials 

    test('get store follow status', async ({ request }) => {
        let apiUtils = new ApiUtils(request) 
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())

        let response = await request.get(endPoints.getStoreFollowStatus(sellerId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('follow-unfollow a store', async ({ request }) => {
        let apiUtils = new ApiUtils(request) 
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())

        let response = await request.post(endPoints.followUnfollowStore, { data: { vendor_id: Number(sellerId) } })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

});