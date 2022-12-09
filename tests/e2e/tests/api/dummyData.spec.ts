import { test, expect, type APIRequestContext } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'



let apiUtils: any;
test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('dummy Data api test', () => {

    test('get dummy data status', async ({ request }) => {
        let response = await request.get(endPoints.getDummyDataStatus)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });


    // test('import dummy data', async ({ request }) => {
    //     let response = await request.post(endPoints.importDummyData, { data: payloads.dummydata }) //TODO: payload
    //     let responseBody = await apiUtils.getResponseBody(response)
    //     expect(response.ok()).toBeTruthy()
    // });

    test('clear dummuy data', async ({ request }) => {
        let response = await request.delete(endPoints.clearDummyData)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});