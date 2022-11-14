import { test, expect, type Page } from '@playwright/test'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


test('get settings', async ({ request }) => {
    const response = await request.get(endPoints.getGetSettings)
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});



test('update settings', async ({ request }) => {
    const response = await request.put(endPoints.putUpdateSettings, { data: payloads.updateSettings })
    const responseBody = await response.json()
    console.log(responseBody)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
});


