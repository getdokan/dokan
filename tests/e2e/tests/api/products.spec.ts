import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


//TODO: need to send vendor credentials for vendor info
test('get all products', async ({ request }) => {
    const response = await request.get(endPoints.getAllProducts)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get products summary', async ({ request }) => {
    const response = await request.get(endPoints.getProductsSummary)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get single products', async ({ request }) => {
    const response = await request.get(endPoints.getAllProducts)
    const responseBody = await response.json()
    let productId = (responseBody.find(o => o.name === 'p1_v1')).id
    // console.log(responseBody)

    const response1 = await request.get(endPoints.getSingleProduct(productId))
    const responseBody1 = await response1.json()
    console.log(responseBody1)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('create a product', async ({ request }) => {
    const response = await request.post(endPoints.postCreateProduct,{data: payloads.createProduct})
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('update a product', async ({ request }) => {
    const response1 = await request.get(endPoints.getAllProducts)
    const responseBody1 = await response1.json()
    let productId = (responseBody1.find(o => o.name === 'p1_v1')).id


    const response = await request.put(endPoints.putUpdateProduct(productId),{data: payloads.updateProduct})
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test.only('delete a product', async ({ request }) => {
    const response1 = await request.get(endPoints.getAllProducts)
    const responseBody1 = await response1.json()
    let productId = (responseBody1.find(o => o.name === 'p1_v1')).id

    const response = await request.delete(endPoints.delDeleteProduct(productId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});