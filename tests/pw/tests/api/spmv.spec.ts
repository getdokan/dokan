import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';

let apiUtils: ApiUtils;
let productId: string;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request);
    [, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendor2Auth);
});

test.describe('spmv API test', () => {
    test('get spmv settings @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSpmvSettings);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get spmv products @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSpmvProducts, { data: payloads.spmvSearch });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('add spmv product to store @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.addToStore, { data: { product_id: productId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
