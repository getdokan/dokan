import { test, expect } from '@playwright/test'
import { ApiUtils } from '../utils/apiUtils'
import { endPoints } from '../utils/apiEndPoints'
import { payloads } from '../utils/payloads'

let apiUtils: any
let attributeId: string
let attributeTermId: string

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, aId, atId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())
    attributeId = aId
    attributeTermId = atId
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('attribute term api test', () => {

    test('get all attribute terms', async ({ request }) => {
        // let [, attributeId,] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

        let response = await request.get(endPoints.getAllAttributeTerms(attributeId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single attribute term', async ({ request }) => {
        // let [, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

        let response = await request.get(endPoints.getSingleAttributeTerm(attributeId, attributeTermId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('create an attribute term', async ({ request }) => {
        // let [, attributeId] = await apiUtils.createAttribute(payloads.createAttribute())

        let response = await request.post(endPoints.createAttributeTerm(attributeId), { data: payloads.createAttributeTerm() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update an attribute term ', async ({ request }) => {
        // let [, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

        let response = await request.put(endPoints.updateAttributeTerm(attributeId, attributeTermId), { data: payloads.updateAttributeTerm() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('delete an attribute term', async ({ request }) => {
        // let [, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

        let response = await request.delete(endPoints.deleteAttributeTerm(attributeId, attributeTermId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update batch attribute terms', async ({ request }) => {
        let allAttributeTermIds = (await apiUtils.getAllAttributeTerms(attributeId)).map((a: { id: any; }) => a.id)
        // console.log(allAttributeTermIds)
        
        let batchAttributeTerms = []
        for (let attributeTermId of allAttributeTermIds.slice(0, 2)) {
            batchAttributeTerms.push({ ...payloads.updateBatchAttributesTemplate(), id: attributeTermId })
        }
        // console.log(batchAttributeTerms)

        let response = await request.put(endPoints.updateBatchAttributeTerms(attributeId), { data: { update: batchAttributeTerms } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

    });

});