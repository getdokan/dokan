//COVERAGE_TAG: GET /dokan/v1/abuse-reports/abuse-reasons
//COVERAGE_TAG: GET /dokan/v1/abuse-reports
//COVERAGE_TAG: DELETE /dokan/v1/abuse-reports/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/abuse-reports/batch

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { schemas } from '@utils/schemas';

const { VENDOR_ID, CUSTOMER_ID } = process.env;

test.describe.only('abuse report api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        console.log('VENDOR_ID', VENDOR_ID);
        console.log('CUSTOMER_ID', CUSTOMER_ID);
        
        const [, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        console.log('productId', productId);
        
        await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, productId, VENDOR_ID, CUSTOMER_ID);
        await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, productId, VENDOR_ID, CUSTOMER_ID);
    });

    test('get all abuse report reasons @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllAbuseReportReasons);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.abuseReportsSchema.abuseReportReasonsSchema);
    });

    test('get all abuse reports @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllAbuseReports);
        console.log(responseBody);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.abuseReportsSchema.abuseReportsSchema);
    });

    test('delete a abuse report @pro', async () => {
        const abuseReportId = await apiUtils.getAbuseReportId();
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteAbuseReport(abuseReportId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.abuseReportsSchema.abuseReportSchema);
    });

    test('delete batch abuse reports @pro', async () => {
        const allAbuseReportIds = (await apiUtils.getAllAbuseReports())?.map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteBatchAbuseReports, { data: { items: allAbuseReportIds } });
        console.log(responseBody);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.abuseReportsSchema.abuseReportsSchema);
    });
});
