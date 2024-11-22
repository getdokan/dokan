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

test.describe('ShipStation api test', () => {
    test.skip(true, 'remove after pr is merged');
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('create ShipStation credential', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createShipStationCredential, { data: { vendor_id: VENDOR_ID } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shipStationSchema.shipStationCredentialSchema);
    });

    test('get ShipStation credential', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getShipStationCredential(VENDOR_ID));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shipStationSchema.shipStationCredentialSchema);
    });

    test('delete ShipStation credential', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteShipStationCredential(VENDOR_ID));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shipStationSchema.shipStationCredentialSchema);
    });

    test('create ShipStation order status settings', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createShipStationOrderStatusSettings, { data: { ...payloads.shipStationOrderStatusSettings, vendor_id: VENDOR_ID } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shipStationSchema.shipStationOrderStatusSettingSchema);
    });

    test('get ShipStation order status settings', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getShipStationOrderStatusSettings(VENDOR_ID));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shipStationSchema.shipStationOrderStatusSettingSchema);
    });

    test('delete ShipStation order status settings', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteShipStationOrderStatusSettings(VENDOR_ID));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shipStationSchema.shipStationOrderStatusSettingSchema);
    });
});
