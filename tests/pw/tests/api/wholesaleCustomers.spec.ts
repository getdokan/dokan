//COVERAGE_TAG: GET /dokan/v1/wholesale/customers
//COVERAGE_TAG: POST /dokan/v1/wholesale/register
//COVERAGE_TAG: POST /dokan/v1/wholesale/customer/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/wholesale/customers/batch

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('wholesale customers api test', () => {
    let apiUtils: ApiUtils;
    let wholesaleCustomerId: string;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        [, wholesaleCustomerId] = await apiUtils.createWholesaleCustomer(payloads.createCustomer(), payloads.adminAuth);
    });

    test('get all wholesale customers @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllWholesaleCustomers);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create a wholesale customer @pro', async () => {
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer());
        const [response, responseBody] = await apiUtils.post(endPoints.createWholesaleCustomer, { data: { id: String(customerId) } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update a wholesale customer @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateCustomer(wholesaleCustomerId), { data: payloads.updateWholesaleCustomer });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete a wholesale customer @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.updateCustomer(wholesaleCustomerId), { data: payloads.deleteWholesaleCustomer });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update batch wholesale customers @pro', async () => {
        const allWholesaleCustomerIds = (await apiUtils.getAllWholesaleCustomers()).map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchWholesaleCustomer, { data: { activate: allWholesaleCustomerIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
