import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



// test.beforeAll(async ({ request }) => {});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('dummy Data api test', () => {

    //TODO: need to send admin credentials 
    test('get dummy data status', async ({ request }) => {
        let response = await request.get(endPoints.getDummyDataStatus)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });

    // test('import dummy data', async ({ request }) => {
    //     let response = await request.post(endPoints.importDummyData, { data: payloads.dummydata }) //TODO: payload
    // expect(response.ok()).toBeTruthy()
    // expect(response.status()).toBe(200)

    // let responseBody = await response.json()
    // console.log(responseBody)
    // });

    test('clear dummuy data', async ({ request }) => {
        let response = await request.delete(endPoints.clearDummyData)
        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        let responseBody = await response.json()
        // console.log(responseBody)
    });



});