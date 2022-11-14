import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


//TODO: need to send vendor credentials for vendor info
test('get all attributes', async ({ request }) => {
    const response = await request.get(endPoints.getGetAllAttributes)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get single attribute', async ({ request }) => {
    const response1 = await request.get(endPoints.getGetAllAttributes)
    const responseBody1 = await response1.json()
    let attributeId = responseBody1[0].id
    // console.log(responseBody1)

    const response = await request.get(endPoints.getGetSingleAttribute(attributeId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('create an attributes', async ({ request }) => {
    const response = await request.post(endPoints.postCreateAttribute,{data: payloads.createAttribute})
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(201)
});


test('update an attributes', async ({ request }) => {
    const response1 = await request.get(endPoints.getGetAllAttributes)
    const responseBody1 = await response1.json()
    let attributeId = responseBody1[0].id
    // console.log(responseBody1)
    // console.log(responseBody1[0].id)

    const response = await request.put(endPoints.putUpdateAttribute(attributeId),{data: payloads.updateAttribute})
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('delete an attributes', async ({ request }) => {
    const response1 = await request.get(endPoints.getGetAllAttributes)
    const responseBody1 = await response1.json()
    let attributeId = responseBody1[0].id
    // console.log(responseBody1)
    console.log(responseBody1[0].id)

    const response = await request.delete(endPoints.delDeleteAttribute(attributeId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});
