//COVERAGE_TAG: GET /dokan/v1/products/attributes
//COVERAGE_TAG: GET /dokan/v1/products/attributes/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/products/attributes
//COVERAGE_TAG: PUT /dokan/v1/products/attributes/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/products/attributes/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/products/attributes/batch
//COVERAGE_TAG: PUT /dokan/v1/products/attributes/set-default/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/products/attributes/edit-product/(?P<id>[\d]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

test.describe('attribute api test', () => {
    let apiUtils: ApiUtils;
    let productId: string;
    let attributeId: string;
    let attribute: any;
    let attributeTerm: any;
    let attributeTermId: string; //todo: why attributeTermId is needed here

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, productId] = await apiUtils.createProduct(payloads.createProduct());
        [attributeTerm, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm());
        attribute = await apiUtils.getSingleAttribute(attributeId);
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all attributes', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllAttributes);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributesSchema.attributesSchema);
    });

    test('get single attribute', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleAttribute(attributeId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributesSchema.attributeSchema);
    });

    test('create an attribute', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createAttribute, { data: payloads.createAttribute() });
        expect(response.status()).toBe(201);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributesSchema.attributeSchema);
    });

    test('update an attribute', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateAttribute(attributeId), { data: payloads.updateAttribute() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributesSchema.attributeSchema);
    });

    test('delete an attribute', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteAttribute(attributeId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributesSchema.attributeSchema);
    });

    test('update batch attributes', { tag: ['@lite'] }, async () => {
        const allAttributeIds = (await apiUtils.getAllAttributes()).map((a: { id: unknown }) => a.id);

        const batchAttributes: object[] = [];
        for (const attributeId of allAttributeIds.slice(0, 2)) {
            batchAttributes.push({ ...payloads.updateBatchAttributesTemplate(), id: attributeId });
        }

        const [response, responseBody] = await apiUtils.put(endPoints.batchUpdateAttributes, { data: { update: batchAttributes } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributesSchema.batchUpdateAttributesSchema);
    });

    test('set default attribute', { tag: ['@lite'] }, async () => {
        const payload = {
            id: attribute.id,
            name: attribute.name,
            option: attributeTerm.name,
            options: [],
        };
        const [response, responseBody] = await apiUtils.put(endPoints.setDefaultAttribute(productId), { data: { attributes: [payload] } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributesSchema.setDefaultAttributeSchema);
    });

    test('update product attribute', { tag: ['@lite'] }, async () => {
        const payload = {
            attributes: [
                {
                    all_terms: [
                        {
                            label: attributeTerm.name,
                            slug: attributeTerm.slug,
                            taxonomy: attribute.slug,
                            value: attributeTerm.id,
                        },
                    ],
                    id: attribute.id,
                    name: attribute.name,
                    options: [attributeTerm.name],
                    slug: attribute.slug,
                    taxonomy: true,
                    variation: false,
                    visible: true,
                },
            ],
        };
        const [response, responseBody] = await apiUtils.post(endPoints.updateProductAttribute(productId), { data: payload });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributesSchema.updateProductAttributeSchema);
    });
});
