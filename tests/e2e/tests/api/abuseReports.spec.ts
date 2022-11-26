import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


// test.beforeAll(async ({ request }) => {

// });

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('abuse report api test', () => {

    //TODO: need to send admin credentials 
    //TODO: product, product abuse report
    test('get all abuse report reasons', async ({ request }) => {
        let response = await request.get(endPoints.getAllAbuseReportReasons)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test('get all abuse reports', async ({ request }) => {
        let response = await request.get(endPoints.getAllAbuseReports)
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });

    test.skip('delete a abuse report', async ({ request }) => {
        let apiUtils = new ApiUtils(request)
        let allAbuseReports = await apiUtils.getAllAbuseReports()
        let abuseReportId = allAbuseReports[0].id
        console.log(abuseReportId)

        let response = await request.delete(endPoints.deleteAbuseReport(abuseReportId))
        let responseBody = await response.json()
        console.log(responseBody)

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)
    });


    // test('delete batch abuse reports', async ({ request }) => { //TODO
    //     let apiUtils = new ApiUtils(request)
    //     let [, productAdvertisementId] = await apiUtils.createProductAdvertisement()

    //     let response = await request.delete(endPoints.deleteProductAdvertisement(productAdvertisementId))
    //     let responseBody = await response.json()
    //     console.log(responseBody)

    //     expect(response.ok()).toBeTruthy()
    //     expect(response.status()).toBe(200)
    // });




});


