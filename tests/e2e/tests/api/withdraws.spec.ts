import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'

// test.beforeAll(async ({ request }) => { });
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('withdraw api test', () => {

//TODO: need to send vendor credentials for vendor info

test('get all withdraws', async ({ request }) => {
    const response = await request.get(endPoints.getAllWithdraws)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get all withdraws by status', async ({ request }) => {
    const response = await request.get(endPoints.getAllWithdrawsbyStatus('pending')) // pending, cancelled, approved
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get balance details', async ({ request }) => {
    const response = await request.get(endPoints.getGetBalanceDetails)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


test('create a withdraw', async ({ request }) => {
    const response = await request.post(endPoints.postCreateWithdraw,{data: payloads.createWithdraw})
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(201)
});

test('cancel a withdraw', async ({ request }) => {
    const response1 = await request.get(endPoints.getAllWithdrawsbyStatus('pending')) // pending, cancelled, approved
    const responseBody1 = await response1.json()
    console.log(responseBody1)
    let withdrawId = responseBody1[0].id
    console.log(responseBody1[0].id)

    const response = await request.put(endPoints.putCancelAWithdraw(withdrawId))
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


});
