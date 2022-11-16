import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

test.beforeAll(async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    await apiUtils.createAttribute()

});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('attribute api test', () => {

    //TODO: need to send vendor credentials for vendor info
    //TODO: prerequisite: attriburtes
    test('get all attributes', async ({ request }) => {
        let response = await request.get(endPoints.getAllAttributes)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get single attribute', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, attributeId] = await apiUtils.createAttribute()

        let response = await request.get(endPoints.getSingleAttribute(attributeId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('create an attribute', async ({ request }) => {
        let response = await request.post(endPoints.createAttribute, { data: payloads.createAttribute() })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(201)
    });


    test('update an attribute', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, attributeId] = await apiUtils.createAttribute()

        let response = await request.put(endPoints.updateAttribute(attributeId), { data: payloads.updateAttribute() })
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    test('delete an attribute', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let [, attributeId] = await apiUtils.createAttribute()

        let response = await request.delete(endPoints.deleteAttribute(attributeId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


});