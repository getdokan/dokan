//COVERAGE_TAG: GET /dokan/v1/request-for-quote/customers
//COVERAGE_TAG: GET /dokan/v1/request-for-quote/customers/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/request-for-quote/customers
//COVERAGE_TAG: PUT /dokan/v1/request-for-quote/customers/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/request-for-quote/customers/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/request-for-quote/customers/batch

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

test.describe('customers api test', () => {
    let apiUtils: ApiUtils;
    let customerId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, customerId] = await apiUtils.createCustomer(payloads.createCustomer());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all customers', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllCustomers);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.customersSchema.customersSchema);
    });

    test('get single customer', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleCustomer(customerId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.customersSchema.customerSchema);
    });

    test('create a customer', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createCustomer, { data: payloads.createCustomer() });
        expect(response.status()).toBe(201);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.customersSchema.customerSchema);
    });

    test('update a customer', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateCustomer(customerId), { data: payloads.updateCustomer() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.customersSchema.customerSchema);
    });

    test('delete a customer', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteCustomer(customerId), { params: payloads.paramsForceDelete });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.customersSchema.customerSchema);
    });

    test('update batch customers', { tag: ['@pro'] }, async () => {
        const allCustomerIds = (await apiUtils.getAllCustomers()).map((a: { id: unknown }) => a.id);

        const batchCustomers: object[] = [];
        for (const customerId of allCustomerIds.slice(0, 2)) {
            batchCustomers.push({ ...payloads.updateBatchCustomersTemplate(), id: customerId });
        }

        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchCustomers, { data: { update: batchCustomers } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.customersSchema.batchUpdateCustomersSchema);
    });
});
