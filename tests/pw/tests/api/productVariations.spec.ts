//COVERAGE_TAG: GET /dokan/v1/products/(?P<product_id>[\d]+)/variations
//COVERAGE_TAG: GET /dokan/v1/products/(?P<product_id>[\d]+)/variations/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/products/(?P<product_id>[\d]+)/variations
//COVERAGE_TAG: PUT /dokan/v1/products/(?P<product_id>[\d]+)/variations/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/products/(?P<product_id>[\d]+)/variations/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/products/(?P<product_id>[\d]+)/variations/batch

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

test.describe('product variation api test', () => {
    let apiUtils: ApiUtils;
    let productId: string;
    let variationId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [productId, variationId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct(), payloads.createProductVariation());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all product variations', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllProductVariations(productId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productVariationsSchema.productVariationsSchema);
    });

    test('get single product variation', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleProductVariation(productId, variationId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productVariationsSchema.productVariationSchema);
    });

    test('create a product variation', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createProductVariation(productId), { data: payloads.createProductVariation() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productVariationsSchema.productVariationSchema);
    });

    test('update a product variation', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateProductVariation(productId, variationId), { data: payloads.updateProductVariation() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productVariationsSchema.productVariationSchema);
    });

    test('delete a product variation', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteProductVariation(productId, variationId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productVariationsSchema.productVariationSchema);
    });

    test('update batch product variations', { tag: ['@pro'] }, async () => {
        const [productId, variationId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct(), payloads.createProductVariation());
        const [response, responseBody] = await apiUtils.put(endPoints.batchUpdateProductVariations(productId), { data: { update: [{ ...payloads.batchProductVariation, id: variationId }] } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productVariationsSchema.batchUpdateProductVariationsSchema);
    });
});
