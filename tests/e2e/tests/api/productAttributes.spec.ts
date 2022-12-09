import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


let apiUtils: any
let attributeId: string

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, id] = await apiUtils.createAttribute(payloads.createAttribute())
    attributeId = id
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('attribute api test', () => {

    test('get all attributes', async ({ request }) => {
        let response = await request.get(endPoints.getAllAttributes)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single attribute', async ({ request }) => {
        // let [, attributeId] = await apiUtils.createAttribute(payloads.createAttribute())

        let response = await request.get(endPoints.getSingleAttribute(attributeId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('create an attribute', async ({ request }) => {
        let response = await request.post(endPoints.createAttribute, { data: payloads.createAttribute() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(201)
    });


    test('update an attribute', async ({ request }) => {
        // let [, attributeId] = await apiUtils.createAttribute(payloads.createAttribute())
        

        let response = await request.put(endPoints.updateAttribute(attributeId), { data: payloads.updateAttribute() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('delete an attribute', async ({ request }) => {
        // let [, attributeId] = await apiUtils.createAttribute(payloads.createAttribute())

        let response = await request.delete(endPoints.deleteAttribute(attributeId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


});