//COVERAGE_TAG: GET /dokan/v1/shipstation/credentials/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/shipstation/credentials/create
//COVERAGE_TAG: DELETE /dokan/v1/shipstation/credentials/(?P<id>[\d]+)
//COVERAGE_TAG: GET /dokan/v1/shipstation/order-statuses
//COVERAGE_TAG: POST /dokan/v1/shipstation/order-statuses/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/shipstation/order-statuses/(?P<id>[\d]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

const { VENDOR_ID } = process.env;

test.describe('shipstation api test', () => {
    test.skip(true, 'remove after pr is merged');
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('create Shipstation credential', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createShipstationCredential, { data: { vendor_id: VENDOR_ID } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shipstationSchema.shipstationCredentialSchema);
    });

    test('get Shipstation credential', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getShipstationCredential(VENDOR_ID));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shipstationSchema.shipstationCredentialSchema);
    });

    test('delete Shipstation credential', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteShipstationCredential(VENDOR_ID));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shipstationSchema.shipstationCredentialSchema);
    });

    test('create Shipstation order status settings', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createShipstationOrderStatusSettings, { data: { ...payloads.shipstationOrderStatusSettings, vendor_id: VENDOR_ID } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shipstationSchema.shipstationOrderStatusSettingSchema);
    });

    test('get Shipstation order status settings', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getShipstationOrderStatusSettings(VENDOR_ID));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shipstationSchema.shipstationOrderStatusSettingSchema);
    });

    test('delete Shipstation order status settings', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteShipstationOrderStatusSettings(VENDOR_ID));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shipstationSchema.shipstationOrderStatusSettingSchema);
    });
});
