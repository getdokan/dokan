//COVERAGE_TAG: GET /dokan/v1/products/attributes/(?P<attribute_id>[\d]+)/terms
//COVERAGE_TAG: GET /dokan/v1/products/attributes/(?P<attribute_id>[\d]+)/terms/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/products/attributes/(?P<attribute_id>[\d]+)/terms
//COVERAGE_TAG: PUT /dokan/v1/products/attributes/(?P<attribute_id>[\d]+)/terms/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/products/attributes/(?P<attribute_id>[\d]+)/terms/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/products/attributes/(?P<attribute_id>[\d]+)/terms/batch

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

test.describe('attribute term api test', () => {
    let apiUtils: ApiUtils;
    let attributeId: string;
    let attributeTermId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all attribute terms', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllAttributeTerms(attributeId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributeTermsSchema.attributeTermsSchema);
    });

    test('get single attribute term', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleAttributeTerm(attributeId, attributeTermId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributeTermsSchema.attributeTermSchema);
    });

    test('create an attribute term', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createAttributeTerm(attributeId), { data: payloads.createAttributeTerm() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributeTermsSchema.attributeTermDropdownSchema);
    });

    test('update an attribute term', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateAttributeTerm(attributeId, attributeTermId), { data: payloads.updateAttributeTerm() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributeTermsSchema.attributeTermSchema);
    });

    test('delete an attribute term', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteAttributeTerm(attributeId, attributeTermId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributeTermsSchema.attributeTermSchema);
    });

    test('update batch attribute terms', { tag: ['@lite'] }, async () => {
        // Self-contained: seed a dedicated attribute with two terms so the batch always has
        // valid entries. Previously this read getAllAttributeTerms(attributeId).slice(0, 2),
        // which raced with the sibling create/delete tests and intermittently produced an empty
        // `update` — WC then returns a bare array instead of the { update: [...] } envelope.
        const [, batchAttributeId, batchTermId1] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm());
        const [, , batchTermId2] = await apiUtils.createAttributeTerm(batchAttributeId, payloads.createAttributeTerm());

        const batchAttributeTerms = [batchTermId1, batchTermId2].map(id => ({ ...payloads.updateBatchAttributesTemplate(), id }));

        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchAttributeTerms(batchAttributeId), { data: { update: batchAttributeTerms } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.attributeTermsSchema.batchUpdateAttributesSchema);
    });
});
