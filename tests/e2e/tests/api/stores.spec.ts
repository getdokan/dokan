import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    let [, sellerId] = await apiUtils.createStore(payloads.createStore())
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('stores api test', () => {

    //TODO: need to send vendor credentials for vendor info
    //TODO: prerequisite vendor, feratured vendor , vendor product, vendor review

    test('get all stores check check_store_availability', async ({ request }) => {
        let response = await request.get(endPoints.getAllStoresCheck)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get all stores', async ({ request }) => {
        let response = await request.get(endPoints.getAllStores)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
        // expect(responseBody[0]).toContainEqual(expect.objectContaining(
        //     {
        //         id: expect.any(Number),
        //         store_name: expect.any(String),
        //         first_name: expect.any(String),
        //         last_name: expect.any(String),
        //         email: expect.any(String),
        //         social: expect.any(Array),
        //         phone: expect.any(String),
        //         show_email: expect.any(Boolean),
        //         address: expect.any(Array),
        //         location: expect.any(String),
        //         banner: expect.any(String),
        //         banner_id: expect.any(Number),
        //         gravatar: expect.any(String),
        //         gravatar_id: expect.any(Number),
        //         shop_url: expect.any(String),
        //         products_per_page: expect.any(Number),
        //         show_more_product_tab: expect.any(Boolean),
        //         toc_enabled: expect.any(Boolean),
        //         store_toc: expect.any(String),
        //         featured: expect.any(Boolean),
        //         rating: expect.objectContaining({
        //             rating: expect.any(String),
        //             count: expect.any(Number),
        //         }),
        //         enabled: expect.any(Boolean),
        //         registered: expect.any(String),
        //         payment: expect.any(Object),
        //         trusted: expect.any(Boolean),
        //         store_open_close: {
        //             enabled: expect.any(Boolean),
        //             time: expect.any(Array),
        //             open_notice: expect.any(String),
        //             close_notice: expect.any(String),
        //         },
        //         company_name: expect.any(String),
        //         vat_number: expect.any(String),
        //         company_id_number: expect.any(String),
        //         bank_name: expect.any(String),
        //         bank_iban: expect.any(String),
        //         switch_url: expect.any(String),
        //         admin_commission: expect.any(String),
        //         admin_additional_fee: expect.any(String),
        //         admin_commission_type: expect.any(String),
        //         _links: expect.objectContaining({
        //             self: expect.any(Array),
        //             collection: expect.any(Array),
        //         }),
        //     }))
    });

    test('get single store', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())

        let response = await request.get(endPoints.getSingleStore(sellerId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
        // expect(responseBody1).toEqual(expect.objectContaining(
        //     {
        //         id: expect.any(Number),
        //         store_name: expect.any(String),
        //         first_name: expect.any(String),
        //         last_name: expect.any(String),
        //         email: expect.any(String),
        //         social: expect.any(Array),
        //         phone: expect.any(String),
        //         show_email: expect.any(Boolean),
        //         address: expect.any(Array),
        //         location: expect.any(String),
        //         banner: expect.any(String),
        //         banner_id: expect.any(Number),
        //         gravatar: expect.any(String),
        //         gravatar_id: expect.any(Number),
        //         shop_url: expect.any(String),
        //         products_per_page: expect.any(Number),
        //         show_more_product_tab: expect.any(Boolean),
        //         toc_enabled: expect.any(Boolean),
        //         store_toc: expect.any(String),
        //         featured: expect.any(Boolean),
        //         rating: expect.objectContaining({
        //             rating: expect.any(String),
        //             count: expect.any(Number),
        //         }),
        //         enabled: expect.any(Boolean),
        //         registered: expect.any(String),
        //         payment: expect.any(Object),
        //         trusted: expect.any(Boolean),
        //         store_open_close: {
        //             enabled: expect.any(Boolean),
        //             time: expect.any(Array),
        //             open_notice: expect.any(String),
        //             close_notice: expect.any(String),
        //         },
        //         company_name: expect.any(String),
        //         vat_number: expect.any(String),
        //         company_id_number: expect.any(String),
        //         bank_name: expect.any(String),
        //         bank_iban: expect.any(String),
        //         switch_url: expect.any(String),
        //         admin_commission: expect.any(String),
        //         admin_additional_fee: expect.any(String),
        //         admin_commission_type: expect.any(String),
        //         _links: expect.any(Object),
        //     }))
    });

    test('create a store', async ({ request }) => {
        let response = await request.post(endPoints.createStore, { data: payloads.createStore() })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('update a store', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())

        let response = await request.put(endPoints.updateStore(sellerId), { data: payloads.updateStore() })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('delete a store', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())

        let response = await request.delete(endPoints.deleteStore(sellerId))
        let responseBody = await response.json()
        // console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        // let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get store current visitor', async ({ request }) => {
        let response = await request.get(endPoints.getStoreCurrentVisitor)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        // let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get store stats', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())

        let response = await request.get(endPoints.getStoreStats(sellerId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get store categories', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())

        let response = await request.get(endPoints.getStoreCategories(sellerId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('get store products', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, sellerId] = await apiUtils.createStore(payloads.createStore()) // TODO: add product to store
        // let sellerId = await apiUtils.getSellerId('vendor1') 

        let response = await request.get(endPoints.getStoreProducts(sellerId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test.skip('get store reviews', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())
        await apiUtils.createStoreReview(sellerId, payloads.createStoreReview) //TODO: user must be other than vendor

        let response = await request.get(endPoints.getStoreReviews(sellerId))
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test.skip('create a store review', async ({ request }) => {  //TODO: user must be other than vendor
        let apiUtils = new ApiUtils(request)
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())

        let response = await request.post(endPoints.createStoreReview(sellerId), { data: payloads.createStoreReview })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('update a store status', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())

        let response = await request.put(endPoints.updateStoreStatus(sellerId), { data: payloads.updateStoreStatus })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('admin contact store', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())

        let response = await request.post(endPoints.adminContactStore(sellerId), { data: payloads.adminContactStore })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    test('admitn email store', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, sellerId] = await apiUtils.createStore(payloads.createStore())

        let response = await request.post(endPoints.adminEmailStore(sellerId), { data: payloads.adminEnailStore })
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

});
