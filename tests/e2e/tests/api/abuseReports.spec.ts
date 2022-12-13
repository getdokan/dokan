import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


let apiUtils: any
test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    // let [, productId] = await apiUtils.createProduct(payloads.createProduct())
});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('abuse report api test', () => {

    test('get all abuse report reasons', async ({ request }) => {
        let response = await request.get(endPoints.getAllAbuseReportReasons)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
        // expect(responseBody).toContainJSON(defaultPost) //TODO: implement this
    });

    test.skip('get all abuse reports', async ({ request }) => {
        let response = await request.get(endPoints.getAllAbuseReports)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test.skip('delete a abuse report', async ({ request }) => {
        let allAbuseReports = await apiUtils.getAllAbuseReports()
        let abuseReportId = allAbuseReports[0].id
        // console.log(abuseReportId)

        let response = await request.delete(endPoints.deleteAbuseReport(abuseReportId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test.skip('delete batch abuse reports', async ({ request }) => {
        let allAbuseReportIds = (await apiUtils.getAllAbuseReports()).map(a => a.id)
        // console.log(allAbuseReportIds)

        let response = await request.delete(endPoints.deleteBatchAbuseReports, { data: { items: allAbuseReportIds } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});


