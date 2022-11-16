import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('product variation api test', () => {


//TODO: need to send vendor credentials for vendor info
test('get all product variations', async ({ request }) => {
    let response1 = await request.get(endPoints.getAllProducts)
    let responseBody1 = await response1.json()
    let productId = (responseBody1.find(o => o.name === 'p2_v1')).id
    // console.log(responseBody1)

    let response = await request.get(endPoints.getAllProductVariations(productId))

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('get single product variation', async ({ request }) => {
    let response1 = await request.get(endPoints.getAllProducts)
    let responseBody1 = await response1.json()
    let productId = (responseBody1.find(o => o.name === 'p2_v1')).id
    // console.log(responseBody1)

    let response2 = await request.get(endPoints.getAllProductVariations(productId))
    let responseBody2 = await response2.json()
    // console.log(responseBody2[0].id)
    let variationId = responseBody2[0].id


    let response = await request.get(endPoints.getSingleProductVariation(productId, variationId))
    let responseBody = await response.json()
    console.log(responseBody)

    // expect(response.ok()).toBeTruthy()
    // expect(response.status()).toBe(200)
});


test.skip('create a product variation', async ({ request }) => { //TODO: not generate attribute
    let response1 = await request.get(endPoints.getAllProducts)
    let responseBody1 = await response1.json()
    let productId = (responseBody1.find(o => o.name === 'p2_v1')).id
    // console.log(responseBody1)

    let response = await request.post(endPoints.createProductVariation(productId),{data: payloads.creatrProductvariation})
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('update a product variation', async ({ request }) => {
    let response1 = await request.get(endPoints.getAllProducts)
    let responseBody1 = await response1.json()
    let productId = (responseBody1.find(o => o.name === 'p2_v1')).id
    // console.log(responseBody1)

    let response2 = await request.get(endPoints.getAllProductVariations(productId))
    let responseBody2 = await response2.json()
    // console.log(responseBody2[0].id)
    let variationId = responseBody2[0].id


    let response = await request.put(endPoints.updateProductVariation(productId,variationId),{data: payloads.updateProductVariation})
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('delete a product variation', async ({ request }) => {
    let response1 = await request.get(endPoints.getAllProducts)
    let responseBody1 = await response1.json()
    let productId = (responseBody1.find(o => o.name === 'p2_v1')).id
    console.log(responseBody1)
    console.log(productId)

    let response2 = await request.get(endPoints.getAllProductVariations(productId))
    let responseBody2 = await response2.json()
    // console.log(responseBody2)
    // console.log(responseBody2[0].id)
    let variationId = responseBody2[0].id

    let response = await request.delete(endPoints.deleteProductVariation(productId, variationId))
    let responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});



});