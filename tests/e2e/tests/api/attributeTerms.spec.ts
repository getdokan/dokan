import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


//TODO: need to send vendor credentials for vendor info
test('get all attribute terms', async ({ request }) => {
    const response1 = await request.get(endPoints.getGetAllAttributes)
    const responseBody1 = await response1.json()
    let attributeId = responseBody1[0].id
    // console.log(responseBody1)

    const response = await request.get(endPoints.getGetAllAttributeTerms(attributeId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get single attribute term', async ({ request }) => {
    const response1 = await request.get(endPoints.getGetAllAttributes)
    const responseBody1 = await response1.json()
    let attributeId = responseBody1[0].id
    // console.log(responseBody1)

    const response2 = await request.get(endPoints.getGetAllAttributeTerms(attributeId))
    const responseBody2 = await response2.json()
    let attributeTermId = responseBody2[0].id
    console.log(responseBody2)

    const response = await request.get(endPoints.getGetSingleAttributeTerm(attributeId, attributeTermId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('create an attribute term', async ({ request }) => {
    const response1 = await request.get(endPoints.getGetAllAttributes)
    const responseBody1 = await response1.json()
    let attributeId = responseBody1[0].id
    // console.log(responseBody1)

    const response = await request.post(endPoints.postCreateAttributeTerm(attributeId), { data: payloads.createAttributeTerm })
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(201)
});


test('update an attribute term ', async ({ request }) => {
    const response1 = await request.get(endPoints.getGetAllAttributes)
    const responseBody1 = await response1.json()
    let attributeId = responseBody1[0].id
    // console.log(responseBody1)
    // console.log(responseBody1[0].id)

    const response2 = await request.get(endPoints.getGetAllAttributeTerms(attributeId))
    const responseBody2 = await response2.json()
    let attributeTermId = responseBody2[0].id
    console.log(responseBody2)

    const response = await request.put(endPoints.putUpdateAttributeTerm(attributeId, attributeTermId), { data: payloads.updateAttributeTerm })
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('delete an attribute term', async ({ request }) => {
    const response1 = await request.get(endPoints.getGetAllAttributes)
    const responseBody1 = await response1.json()
    let attributeId = responseBody1[0].id
    // console.log(responseBody1)
    // console.log(responseBody1[0].id)

    const response2 = await request.get(endPoints.getGetAllAttributeTerms(attributeId))
    const responseBody2 = await response2.json()
    let attributeTermId = responseBody2[0].id
    console.log(responseBody2)

    const response = await request.delete(endPoints.delDeleteAttributeTerm(attributeId, attributeTermId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});
