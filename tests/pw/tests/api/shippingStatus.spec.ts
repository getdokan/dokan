//COVERAGE_TAG: GET /dokan/v1/shipping-status
//COVERAGE_TAG: GET /dokan/v1/shipping-status/orders/(?P<order_id>[\\d]+)
//COVERAGE_TAG: POST /dokan/v1/shipping-status/orders/(?P<order_id>[\\d]+)
//COVERAGE_TAG: GET /dokan/v1/shipping-status/orders/(?P<order_id>[\\d]+)/shipment/(?P<id>[\\d]+)
//COVERAGE_TAG: PUT /dokan/v1/shipping-status/orders/(?P<order_id>[\\d]+)/shipment/(?P<id>[\\d]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

const { PRODUCT_ID } = process.env;

test.describe('shipping status test', () => {
    let apiUtils: ApiUtils;
    let orderId: string;
    let lineItemId: string;
    let shipmentId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        const [, responseBody, oId] = await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, line_items: [{ product_id: PRODUCT_ID, quantity: 10 }] });
        lineItemId = responseBody.line_items[0].id;
        [, orderId, shipmentId] = await apiUtils.createShipment(oId, { ...payloads.createShipment, item_id: [lineItemId], item_qty: { [lineItemId]: 1 } });
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get shipping status', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getShippingStatus);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shippingStatusSchema.shippingStatusSchema);
    });

    test('get shipments', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllShipments(orderId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shippingStatusSchema.shipmentsSchema);
    });

    test('create shipment', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createShipment(orderId), { data: { ...payloads.createShipment, item_id: [lineItemId], item_qty: { [lineItemId]: 1 } } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shippingStatusSchema.shipmentSchema);
    });

    test('get single shipment', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleShipment(orderId, shipmentId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shippingStatusSchema.shipmentSchema);
    });

    test('update shipment', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateShipment(orderId, shipmentId), { data: payloads.updateShipment });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shippingStatusSchema.shipmentSchema);
    });
});
