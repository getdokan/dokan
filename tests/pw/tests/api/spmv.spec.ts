//COVERAGE_TAG: GET /dokan/v1/spmv-product/settings
//COVERAGE_TAG: GET /dokan/v1/spmv-product/search
//COVERAGE_TAG: POST /dokan/v1/spmv-product/add-to-store

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('spmv API test', () => {
    let apiUtils: ApiUtils;
    let productId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendor2Auth);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get spmv settings', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSpmvSettings);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get spmv products', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSpmvProducts, { data: payloads.spmvSearch });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('add spmv product to store', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.addToStore, { data: { product_id: productId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
