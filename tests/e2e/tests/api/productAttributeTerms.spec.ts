import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


let apiUtils;
test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('attribute term api test', () => {

    //TODO: need to send vendor credentials for vendor info
    test('get all attribute terms', async ({ request }) => {
        let [, attributeId,] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

        let response = await request.get(endPoints.getAllAttributeTerms(attributeId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single attribute term', async ({ request }) => {
        let [, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

        let response = await request.get(endPoints.getSingleAttributeTerm(attributeId, attributeTermId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('create an attribute term', async ({ request }) => {
        let [, attributeId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

        let response = await request.post(endPoints.createAttributeTerm(attributeId), { data: payloads.createAttributeTerm() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('update an attribute term ', async ({ request }) => {
        let [, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

        let response = await request.put(endPoints.updateAttributeTerm(attributeId, attributeTermId), { data: payloads.updateAttributeTerm() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    test('delete an attribute term', async ({ request }) => {
        let [, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

        let response = await request.delete(endPoints.deleteAttributeTerm(attributeId, attributeTermId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});