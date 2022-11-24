import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



test.beforeAll(async ({ request }) => {
    // let apiUtils = new ApiUtils(request)
    // await apiUtils.createCoupon(payloads.createStore()) // TODO: create store
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('follow store api test', () => {

    //TODO: need to send customer credentials 
    //TODO: prerequisite => store , store id
    test('get store follow status', async ({ request }) => {
        let apiUtils = new ApiUtils(request) 
        let allStores = await apiUtils.getAllStores() // TODO: replace with create store
        let sellerId = allStores[0].id

        let response = await request.get(endPoints.getStoreFollowStatus(sellerId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });



    test('follow-unfollow a store', async ({ request }) => {
        let apiUtils = new ApiUtils(request) 
        let allStores = await apiUtils.getAllStores() // TODO: replace with create store
        let sellerId = allStores[0].id

        let response = await request.post(endPoints.followUnfollowStore, { data: { vendor_id: sellerId } })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

});