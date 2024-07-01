//COVERAGE_TAG: GET /dokan/v1/orders
//COVERAGE_TAG: GET /dokan/v1/orders/summary
//COVERAGE_TAG: GET /dokan/v1/orders/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/orders/(?P<id>[\d]+)
//COVERAGE_TAG: GET /dokan/v2/orders
//COVERAGE_TAG: GET /dokan/v2/orders/summary
//COVERAGE_TAG: GET /dokan/v2/orders/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v2/orders/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v2/orders/bulk-actions

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

let apiUtils: ApiUtils;

const versions = ['v1', 'v2'];
for (const version of versions) {
    test.describe(`order api test ${version}`, () => {
        let orderId: string;

        test.beforeAll(async () => {
            apiUtils = new ApiUtils(await request.newContext());
            [, , orderId] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
        });

        test.afterAll(async () => {
            await apiUtils.dispose();
        });

        test('get all orders', { tag: ['@lite'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getAllOrders.replace('v1', version));
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });

        test('get orders summary', { tag: ['@lite'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getOrdersSummary.replace('v1', version));
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });

        test('get orders with param date-range', { tag: ['@lite'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getAllOrders.replace('v1', version), { params: payloads.paramsGetOrdersWithDateRange });
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });

        test('get single order', { tag: ['@lite'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getSingleOrder(orderId).replace('v1', version));
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });

        test('update an order', { tag: ['@lite'] }, async () => {
            const [response, responseBody] = await apiUtils.put(endPoints.updateOrder(orderId).replace('v1', version), { data: payloads.updateOrder });
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });
    });
}

test('update batch orders', { tag: ['@lite', '@v2'] }, async () => {
    apiUtils = new ApiUtils(await request.newContext());
    const allOrderIds = (await apiUtils.getAllOrders())?.map((a: { id: unknown }) => a.id);
    const [response, responseBody] = await apiUtils.post(endPoints.updateBatchOrders, { data: { order_ids: allOrderIds, status: 'wc-completed' } });
    expect(response.ok()).toBeTruthy();
    expect(responseBody).toBeTruthy();
});
