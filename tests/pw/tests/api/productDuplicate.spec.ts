//COVERAGE_TAG: POST /dokan/v2/products/(?P<id>[\d]+)/duplicate

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('product duplicate api test', () => {
    let apiUtils: ApiUtils;
    let productId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, productId] = await apiUtils.createProduct(payloads.createProduct());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('create duplicate product', { tag: ['@pro', '@v2'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createDuplicateProduct(productId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
