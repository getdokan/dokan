//COVERAGE_TAG: GET /dokan/v1/blocks/products/(?P<id>[\d]+)
//COVERAGE_TAG: GET /dokan/v1/blocks/product-variation/(?P<id>[\d]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('product block api test', () => {
    let apiUtils: ApiUtils;
    let productId: string;
    let variationId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get product block details', { tag: ['@lite'] }, async () => {
        [, productId] = await apiUtils.createProduct(payloads.createDownloadableProduct());
        const [response, responseBody] = await apiUtils.get(endPoints.getProductBlockDetails(productId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get variable product block details', { tag: ['@pro'] }, async () => {
        [, variationId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct());
        const [response, responseBody] = await apiUtils.get(endPoints.getProductBlockDetails(variationId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
