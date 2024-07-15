//COVERAGE_TAG: GET /dokan/v1/blocks/products/(?P<id>[\d]+)
//COVERAGE_TAG: GET /dokan/v1/blocks/product-variation/(?P<id>[\d]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

test.describe('product block api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get product block details', { tag: ['@lite'] }, async () => {
        const [, productId] = await apiUtils.createProduct(payloads.createProduct());
        const [response, responseBody] = await apiUtils.get(endPoints.getProductBlockDetails(productId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productBlocksSchema.productBlockSchema);
    });

    test('get variable product block details', { tag: ['@pro'] }, async () => {
        const [productId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct(), payloads.createProductVariation());
        const [response, responseBody] = await apiUtils.get(endPoints.getProductBlockDetails(productId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productBlocksSchema.productBlockSchema);
    });
});
