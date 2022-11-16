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
    let [,attributeId,] = await apiUtils.createAttributeTerm()

    let response = await request.get(endPoints.getAllAttributeTerms(attributeId))
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get single attribute term', async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    let [,attributeId, attributeTermId] = await apiUtils.createAttributeTerm()

    let response = await request.get(endPoints.getSingleAttributeTerm(attributeId, attributeTermId))
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('create an attribute term', async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    let [, attributeId] = await apiUtils.createAttribute()

    let response = await request.post(endPoints.createAttributeTerm(attributeId), { data: payloads.createAttributeTerm() })
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(201)
});


test('update an attribute term ', async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    let [,attributeId, attributeTermId] = await apiUtils.createAttributeTerm()

    let response = await request.put(endPoints.updateAttributeTerm(attributeId, attributeTermId), { data: payloads.updateAttributeTerm() })
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('delete an attribute term', async ({ request }) => {
    let apiUtils = new ApiUtils(request)
    let [,attributeId, attributeTermId] = await apiUtils.createAttributeTerm()

    let response = await request.delete(endPoints.deleteAttributeTerm(attributeId, attributeTermId))
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

});