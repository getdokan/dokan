//COVERAGE_TAG: GET /dokan/v1/abuse-reports/abuse-reasons
//COVERAGE_TAG: GET /dokan/v1/abuse-reports
//COVERAGE_TAG: DELETE /dokan/v1/abuse-reports/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/abuse-reports/batch

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { schemas } from '@utils/schemas';

const { VENDOR_ID, CUSTOMER_ID } = process.env;

test.describe('abuse report api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        const [, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, productId, VENDOR_ID, CUSTOMER_ID);
        await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, productId, VENDOR_ID, CUSTOMER_ID);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all abuse report reasons', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllAbuseReportReasons);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.abuseReportsSchema.abuseReportReasonsSchema);
    });

    test('get all abuse reports', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllAbuseReports);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.abuseReportsSchema.abuseReportsSchema);
    });

    test('delete a abuse report', { tag: ['@pro'] }, async () => {
        const abuseReportId = await apiUtils.getAbuseReportId();
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteAbuseReport(abuseReportId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.abuseReportsSchema.abuseReportSchema);
    });

    test('delete batch abuse reports', { tag: ['@pro'] }, async () => {
        const allAbuseReportIds = (await apiUtils.getAllAbuseReports())?.map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteBatchAbuseReports, { data: { items: allAbuseReportIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.abuseReportsSchema.abuseReportsSchema);
    });
});
