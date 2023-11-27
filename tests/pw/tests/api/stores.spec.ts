//COVERAGE_TAG: GET /dokan/v1/stores
//COVERAGE_TAG: GET /dokan/v1/stores/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/stores
//COVERAGE_TAG: PUT /dokan/v1/stores/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/stores/(?P<id>[\d]+)
//COVERAGE_TAG: GET /dokan/v1/stores/current-visitor
//COVERAGE_TAG: GET /dokan/v1/stores/(?P<id>[\d]+)/stats
//COVERAGE_TAG: GET /dokan/v1/stores/check
//COVERAGE_TAG: GET /dokan/v1/stores/(?P<id>[\d]+)/categories
//COVERAGE_TAG: GET /dokan/v1/stores/(?P<id>[\d]+)/products
//COVERAGE_TAG: PUT /dokan/v1/stores/(?P<id>[\d]+)/status
//COVERAGE_TAG: POST /dokan/v1/stores/(?P<id>[\d]+)/contact
//COVERAGE_TAG: POST /dokan/v1/stores/(?P<id>[\d]+)/email
//COVERAGE_TAG: PUT /dokan/v1/stores/batch

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('stores api test', () => {
    let apiUtils: ApiUtils;
    let sellerId: string;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        [, sellerId] = await apiUtils.createStore(payloads.createStore());
        // let [, id] = await apiUtils.getCurrentUser()
    });

    test('get all stores @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllStores);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get single store @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleStore(sellerId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create a store @lite', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createStore, { data: payloads.createStore() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update a store @lite', async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateStore(sellerId), { data: payloads.updateStore() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete a store @lite', async () => {
        const [, sId] = await apiUtils.createStore(payloads.createStore());
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteStore(sId), { params: payloads.paramsDeleteStore });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get store current visitor @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getStoreCurrentVisitor);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get store stats @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getStoreStats(sellerId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get store slug availability @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getStoresSlugAvaility);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get store categories @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getStoreCategories(sellerId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get store products @lite', async () => {
        const [, sId] = await apiUtils.getCurrentUser();
        await apiUtils.createProduct(payloads.createProduct());
        const [response, responseBody] = await apiUtils.get(endPoints.getStoreProducts(sId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update a store status @lite', async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateStoreStatus(sellerId), { data: payloads.updateStoreStatus });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('client contact store @lite', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.clientContactStore(sellerId), { data: payloads.clientContactStore });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('admin email store @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.adminEmailStore(sellerId), { data: payloads.adminEmailStore });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update batch stores @lite', async () => {
        const allStoreIds = (await apiUtils.getAllStores()).map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchStores, { data: { approved: allStoreIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
