//COVERAGE_TAG: GET /dokan/v1/orders
//COVERAGE_TAG: GET /dokan/v1/orders/summary
//COVERAGE_TAG: GET /dokan/v1/orders/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/orders/(?P<id>[\d]+)
//COVERAGE_TAG: GET /dokan/v2/orders
//COVERAGE_TAG: GET /dokan/v2/orders/summary
//COVERAGE_TAG: GET /dokan/v2/orders/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v2/orders/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v2/orders/bulk-actions

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

let apiUtils: ApiUtils;

const versions = ['v1', 'v2'];
for (const version of versions) {
    test.describe(`order api test ${version}`, () => {
        let orderId: string;

        test.beforeAll(async ({ request }) => {
            apiUtils = new ApiUtils(request);
            [, , orderId] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
        });

        test('get all orders @lite', async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getAllOrders.replace('v1', version));
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });

        test('get orders summary @lite', async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getOrdersSummary.replace('v1', version));
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });

        test('get orders with param date-range @lite', async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getAllOrders.replace('v1', version), { params: payloads.paramsGetOrdersWithDateRange });
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });

        test('get single order @lite', async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getSingleOrder(orderId).replace('v1', version), { headers: payloads.adminAuth });
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });

        test('update an order @lite', async () => {
            const [response, responseBody] = await apiUtils.put(endPoints.updateOrder(orderId).replace('v1', version), { data: payloads.updateOrder });
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });
    });
}

// test('update batch orders @v2 @lite', async () => {
//     const allOrderIds = (await apiUtils.getAllOrders())?.map((a: { id: unknown }) => a.id);
//     const [response, responseBody] = await apiUtils.post(endPoints.updateBatchOrders, { data: { order_ids: allOrderIds, status: 'wc-completed' } });
//     expect(response.ok()).toBeTruthy();
//     expect(responseBody).toBeTruthy();
// });
