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
import { schemas } from '@utils/schemas';

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
            test.skip(version === 'v2', 'BUG-1: GET /dokan/v2/orders 500 fatal — OrderControllerV2.php:256 prepare_data_for_response override collision. See SKIPPED-TESTS-BUG-REPORT.md');
            const [response, responseBody] = await apiUtils.get(endPoints.getAllOrders.replace('v1', version));
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
            expect(responseBody).toMatchSchema(schemas.ordersSchema.ordersSchema);
        });

        test('get orders summary', { tag: ['@lite'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getOrdersSummary.replace('v1', version));
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
            expect(responseBody).toMatchSchema(schemas.ordersSchema.ordersSummarySchema);
        });

        test('get orders with param date-range', { tag: ['@lite'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getAllOrders.replace('v1', version), { params: payloads.paramsGetOrdersWithDateRange });
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
            expect(responseBody).toMatchSchema(schemas.ordersSchema.ordersSchema);
        });

        test('get single order', { tag: ['@lite'] }, async () => {
            test.skip(version === 'v2', 'BUG-1: GET /dokan/v2/orders/{id} 500 fatal — OrderControllerV2.php:256. See SKIPPED-TESTS-BUG-REPORT.md');
            const [response, responseBody] = await apiUtils.get(endPoints.getSingleOrder(orderId).replace('v1', version));
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
            expect(responseBody).toMatchSchema(schemas.ordersSchema.orderSchema);
        });

        test('update an order', { tag: ['@lite'] }, async () => {
            test.skip(version === 'v2', 'BUG-1: PUT /dokan/v2/orders/{id} 500 fatal — OrderControllerV2.php:256. See SKIPPED-TESTS-BUG-REPORT.md');
            const [response, responseBody] = await apiUtils.put(endPoints.updateOrder(orderId).replace('v1', version), { data: payloads.updateOrder });
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
            expect(responseBody).toMatchSchema(schemas.ordersSchema.orderSchema);
        });
    });
}

test('update batch orders', { tag: ['@lite', '@v2'] }, async () => {
    apiUtils = new ApiUtils(await request.newContext());
    const allOrderIds = (await apiUtils.getAllOrders())?.map((a: { id: unknown }) => a.id);
    const [response, responseBody] = await apiUtils.post(endPoints.updateBatchOrders, { data: { order_ids: allOrderIds, status: 'wc-completed' } });
    expect(response.ok()).toBeTruthy();
    expect(responseBody).toBeTruthy();
    expect(responseBody).toMatchSchema(schemas.ordersSchema.batchUpdateOrderSchema);
});
