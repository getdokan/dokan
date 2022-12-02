import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('attribute term api test', () => {

//TODO: need to send vendor credentials for vendor info
test('get all attribute terms', async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    let [,attributeId,] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

    let response = await request.get(endPoints.getAllAttributeTerms(attributeId))
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    let responseBody = await response.json()
    // console.log(responseBody)
});

test('get single attribute term', async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    let [,attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

    let response = await request.get(endPoints.getSingleAttributeTerm(attributeId, attributeTermId))
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    let responseBody = await response.json()
    // console.log(responseBody)
});


test('create an attribute term', async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    let [, attributeId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

    let response = await request.post(endPoints.createAttributeTerm(attributeId), { data: payloads.createAttributeTerm() })
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    let responseBody = await response.json()
    // console.log(responseBody)
});


test('update an attribute term ', async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    let [,attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

    let response = await request.put(endPoints.updateAttributeTerm(attributeId, attributeTermId), { data: payloads.updateAttributeTerm() })
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    let responseBody = await response.json()
    // console.log(responseBody)
});


test('delete an attribute term', async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    let [,attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm())

    let response = await request.delete(endPoints.deleteAttributeTerm(attributeId, attributeTermId))
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    let responseBody = await response.json()
    // console.log(responseBody)
});

});