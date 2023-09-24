//COVERAGE_TAG: GET /dokan/v2/withdraw/settings
//COVERAGE_TAG: GET /dokan/v2/withdraw/summary
//COVERAGE_TAG: GET /dokan/v2/withdraw/disbursement
//COVERAGE_TAG: POST /dokan/v2/withdraw/disbursement
//COVERAGE_TAG: POST /dokan/v2/withdraw/disbursement/disable

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('withdraw api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(({ request }) => {
        apiUtils = new ApiUtils(request);
    });

    test('get withdraw settings @v2 @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getWithdrawSettings);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get withdraw summary @v2 @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getWithdrawSummary);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get withdraw disbursement settings @v2 @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getWithdrawDisbursementSettings);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update withdraw disbursement settings @v2 @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateWithdrawDisbursementSettings, { data: payloads.updateWithdrawDisbursementSettings });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('disable withdraw disbursement @v2 @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.disableWithdrawDisbursement);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
