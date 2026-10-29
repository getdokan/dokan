//COVERAGE_TAG: GET /dokan/v1/orders
//COVERAGE_TAG: GET /dokan/v1/orders/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/orders/(?P<id>[\d]+)
//COVERAGE_TAG: GET /dokan/v2/orders
//COVERAGE_TAG: GET /dokan/v2/orders/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v2/orders/(?P<id>[\d]+)

// Revamp P0, Vendor orders failure modes #1, #2 and #13
// (tests/pw/baseline/failure-modes/vendor-orders.md): a vendor must never read,
// list or change another vendor's order, and customers and guests must be refused.

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

const { PRODUCT_ID, PRODUCT_ID_V2 } = process.env;

let apiUtils: ApiUtils;
let ownOrderId: string;
let otherOrderId: string;

test.beforeAll(async () => {
    apiUtils = new ApiUtils(await request.newContext());
    [, , ownOrderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID as string, { ...payloads.createOrder, line_items: [{ product_id: PRODUCT_ID, quantity: 1 }] }, 'wc-processing', payloads.vendorAuth);
    [, , otherOrderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID_V2 as string, { ...payloads.createOrder, line_items: [{ product_id: PRODUCT_ID_V2, quantity: 1 }] }, 'wc-processing', payloads.vendor2Auth);
});

test.afterAll(async () => {
    await apiUtils?.dispose();
});

for (const version of ['v1', 'v2']) {
    const url = (u: string) => u.replace('/dokan/v1/', `/dokan/${version}/`);

    test.describe(`vendor order isolation ${version}`, () => {
        test(`vendor order list excludes another vendor's order (${version})`, { tag: ['@lite', '@vendor', '@p0'] }, async () => {
            const [response, body] = await apiUtils.get(url(endPoints.getAllOrders), { headers: payloads.vendorAuth, params: { search: otherOrderId } }, false);
            expect(response.ok()).toBeTruthy();
            expect((body as { id: number }[]).map(o => String(o.id))).not.toContain(otherOrderId);
        });

        test(`vendor order list still finds its own order (${version})`, { tag: ['@lite', '@vendor', '@p0'] }, async () => {
            // Guards the test above: proves `search` works, so an empty result means filtered, not broken.
            const [response, body] = await apiUtils.get(url(endPoints.getAllOrders), { headers: payloads.vendorAuth, params: { search: ownOrderId } }, false);
            expect(response.ok()).toBeTruthy();
            expect((body as { id: number }[]).map(o => String(o.id))).toContain(ownOrderId);
        });

        test(`vendor cannot read another vendor's order by id (${version})`, { tag: ['@lite', '@vendor', '@p0'] }, async () => {
            const [response, body] = await apiUtils.get(url(endPoints.getSingleOrder(otherOrderId)), { headers: payloads.vendorAuth }, false);
            expect(response.status(), JSON.stringify(body)).toBeGreaterThanOrEqual(400);
            expect(response.status()).toBeLessThan(500);
        });

        test(`vendor cannot update another vendor's order (${version})`, { tag: ['@lite', '@vendor', '@p0'] }, async () => {
            const [response, body] = await apiUtils.put(url(endPoints.updateOrder(otherOrderId)), { headers: payloads.vendorAuth, data: { status: 'completed' } }, false);
            expect(response.status(), JSON.stringify(body)).toBeGreaterThanOrEqual(400);
            expect(response.status()).toBeLessThan(500);

            const [, order] = await apiUtils.getSingleOrder(otherOrderId, payloads.vendor2Auth);
            expect(order.status, 'order is untouched').toBe('processing');
        });

        test(`customer cannot list vendor orders (${version})`, { tag: ['@lite', '@customer', '@p0'] }, async () => {
            const [response] = await apiUtils.get(url(endPoints.getAllOrders), { headers: payloads.customerAuth }, false);
            expect([401, 403]).toContain(response.status());
        });

        test(`guest cannot list vendor orders (${version})`, { tag: ['@lite', '@guest', '@p0'] }, async () => {
            // Plain fetch: the API project's request context carries admin auth by default.
            const response = await fetch(url(endPoints.getAllOrders));
            expect([401, 403]).toContain(response.status);
        });
    });
}
