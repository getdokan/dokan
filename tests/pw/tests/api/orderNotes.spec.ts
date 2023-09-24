//COVERAGE_TAG: GET /dokan/v1/orders/(?P<id>[\d]+)/notes
//COVERAGE_TAG: GET /dokan/v1/orders/(?P<id>[\d]+)/notes/(?P<note_id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/orders/(?P<id>[\d]+)/notes
//COVERAGE_TAG: DELETE /dokan/v1/orders/(?P<id>[\d]+)/notes/(?P<note_id>[\d]+)
//COVERAGE_TAG: GET /dokan/v2/orders/(?P<id>[\d]+)/notes
//COVERAGE_TAG: GET /dokan/v2/orders/(?P<id>[\d]+)/notes/(?P<note_id>[\d]+)
//COVERAGE_TAG: POST /dokan/v2/orders/(?P<id>[\d]+)/notes
//COVERAGE_TAG: DELETE /dokan/v2/orders/(?P<id>[\d]+)/notes/(?P<note_id>[\d]+)

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('order note api test', () => {
    let apiUtils: ApiUtils;
    let orderId: string;
    let orderNoteId: string;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        [, orderId, orderNoteId] = await apiUtils.createOrderNote(payloads.createProduct(), payloads.createOrder, payloads.createOrderNote);
    });

    test('get all order notes @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllOrderNotes(orderId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get single order note @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleOrderNote(orderId, orderNoteId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create an order note @lite', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createOrderNote(orderId), { data: payloads.createOrderNote });
        expect(response.status()).toBe(201);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete an order note @lite', async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteOrderNote(orderId, orderNoteId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
