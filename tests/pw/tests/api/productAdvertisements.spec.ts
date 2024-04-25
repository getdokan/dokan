//COVERAGE_TAG: GET /dokan/v1/product_adv/stores
//COVERAGE_TAG: GET /dokan/v1/product_adv
//COVERAGE_TAG: POST /dokan/v1/product_adv/create
//COVERAGE_TAG: PUT /dokan/v1/product_adv/(?P<id>[\d]+)/expire
//COVERAGE_TAG: DELETE /dokan/v1/product_adv/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/product_adv/batch

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('product advertisement api test', () => {
    let apiUtils: ApiUtils;
    let productAdvertisementId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, productAdvertisementId] = await apiUtils.createProductAdvertisement(payloads.createProduct());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all advertised product stores', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllProductAdvertisementStores);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get all advertised product', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllProductAdvertisements);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create a product advertisement', { tag: ['@pro'] }, async () => {
        const [body, productId] = await apiUtils.createProduct(payloads.createProduct());
        const sellerId = body.store.id;
        const [response, responseBody] = await apiUtils.post(endPoints.createProductAdvertisement, { data: { vendor_id: sellerId, product_id: productId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('expire a product advertisement', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.expireProductAdvertisement(productAdvertisementId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete a product advertisement', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteProductAdvertisement(productAdvertisementId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update batch product advertisements', { tag: ['@pro'] }, async () => {
        const allProductAdvertisementIds = (await apiUtils.getAllProductAdvertisements()).map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchProductAdvertisements, { data: { ids: allProductAdvertisementIds, action: 'delete' } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
