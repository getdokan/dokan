//COVERAGE_TAG: GET /dokan/v1/shipping-status
//COVERAGE_TAG: GET /dokan/v1/shipping-status/orders/(?P<order_id>[\\d]+)
//COVERAGE_TAG: POST /dokan/v1/shipping-status/orders/(?P<order_id>[\\d]+)
//COVERAGE_TAG: GET /dokan/v1/shipping-status/orders/(?P<order_id>[\\d]+)/shipment/(?P<id>[\\d]+)
//COVERAGE_TAG: POST /dokan/v1/shipping-status/orders/(?P<order_id>[\\d]+)/shipment/(?P<id>[\\d]+)
//COVERAGE_TAG: PUT /dokan/v1/shipping-status/orders/(?P<order_id>[\\d]+)/shipment/(?P<id>[\\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/shipping-status/orders/(?P<order_id>[\\d]+)/shipment/(?P<id>[\\d]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';
import { responseBody } from '@utils/interfaces';

const { PRODUCT_ID } = process.env;

test.describe('spmv API test', () => {
    let apiUtils: ApiUtils;
    let orderResponseBody: responseBody;
    let orderId: string;
    let lineItemId: string;
    let shipmentOrderId: string;
    let shipmentId: string;
    let res: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // [, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendor2Auth);
        // [, res, orderId] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        // console.log(res);
        // [, , shipmentOrderId] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);

        [, orderResponseBody, orderId] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth); //todo: replace all vendorAuth
        lineItemId = orderResponseBody.line_items[0].id;

        // const [, orderResponseBody2, orderId2] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth); //todo: replace all vendorAuth
        // const lineItemId2 = orderResponseBody2.line_items[0].id;
        // [, shipmentId] await apiUtils.createOrderShipment(orderId2, { ...payloads.createOrderShipment, item_id: [lineItemId2], item_qty: { [lineItemId2]: 1 } });
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
        const [response, responseBody] = await apiUtils.get(endPoints.getOrderShipment(orderId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shippingStatusSchema.shipmentSchema);
    });

    test('create shipment', { tag: ['@pro'] }, async () => {
        const [, orderResponseBody, orderId] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        const lineItemId = orderResponseBody.line_items[0].id;

        const [response, responseBody] = await apiUtils.post(endPoints.createOrderShipment(orderId), { data: { ...payloads.createShipment, item_id: [lineItemId], item_qty: { [lineItemId]: 1 } } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shippingStatusSchema.shipmentSchema);
    });

    test('get single shipment', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getOrderShipment(shipmentOrderId, shipmentId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shippingStatusSchema.shipmentSchema);
    });

    test('update shipment', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateOrderShipment(shipmentOrderId, shipmentId), { data: payloads.updateShipment });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shippingStatusSchema.shipmentSchema);
    });

    test('delete shipment', { tag: ['@pro'] }, async () => {
        const [, orderResponseBody, orderId] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
        const lineItemId = orderResponseBody.line_items[0].id;
        const [, shipmentId] = await apiUtils.createOrderShipment(orderId, { ...payloads.createShipment, item_id: [lineItemId], item_qty: { [lineItemId]: 1 } });

        const [response, responseBody] = await apiUtils.delete(endPoints.deleteOrderShipment(shipmentOrderId, shipmentId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.shippingStatusSchema.shipmentSchema);
    });
});
