import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


//TODO: need to send vendor credentials for vendor info
test('get all reviews', async ({ request }) => {
    const response = await request.get(endPoints.getGetAllReviews)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});

test('get reviews summary', async ({ request }) => {
    const response = await request.get(endPoints.getGetReviewSummary)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});