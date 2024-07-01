//COVERAGE_TAG: GET /dokan/v2/products/filter-by-data

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('product filter api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.createProduct(payloads.createProduct());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get products filter by data', { tag: ['@lite', '@v2'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getProductsFilterByData);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
