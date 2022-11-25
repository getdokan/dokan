import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createStoreCategory(payloads.createStoreCategory())

});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('store categories api test', () => {

    //TODO: need to send admin credentials 
    test('get default store category', async ({ request }) => {
        let response = await request.get(endPoints.getDefaultStoreCategory)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get all store categories', async ({ request }) => {
        let response = await request.get(endPoints.getAllStoreCategories)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get single store category', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, categoryId] = await apiUtils.createStoreCategory(payloads.createStoreCategory())

        let response = await request.get(endPoints.getSingleStoreCategory(categoryId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('create a store category', async ({ request }) => {
        let response = await request.post(endPoints.createStoreCategory, { data: payloads.createStoreCategory() })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(201)
    });


    test('update a store category', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, categoryId] = await apiUtils.createStoreCategory(payloads.createStoreCategory())

        let response = await request.put(endPoints.updateStoreCategory(categoryId), { data: payloads.updateStoreCategory() })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('delete a store category', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, categoryId] = await apiUtils.createStoreCategory(payloads.createStoreCategory())

        let response = await request.delete(endPoints.deleteStoreCategory(categoryId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('set default store category', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, defaultCategoryId] = await apiUtils.getDefaultStoreCategory()
        let [, categoryId] = await apiUtils.createStoreCategory(payloads.createStoreCategory())

        let response = await request.put(endPoints.setDefaultStoreCategory, { data: { id: categoryId } })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        // restore default stor category
        await apiUtils.setDefaultStoreCategory(defaultCategoryId)
    });



});