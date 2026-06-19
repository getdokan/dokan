//COVERAGE_TAG: POST /dokan/v2/rank-math/(?P<id>[\d]+)/store-current-editable-post
//COVERAGE_TAG: GET /dokan/v2/rank-math/(?P<id>[\d]+)/editor-data

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

test.describe('rank math api test', () => {
    let apiUtils: ApiUtils;
    let productId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        // The module (and therefore its REST routes) only loads when active.
        await apiUtils.activateModules(payloads.moduleIds.rankMath, payloads.adminAuth);
        [, productId] = await apiUtils.createProduct(payloads.createProduct());
    });

    test.afterAll(async () => {
        await apiUtils.deleteProduct(productId, payloads.adminAuth);
        await apiUtils.dispose();
    });

    test('store the current editable post id', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.rankMath(productId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBe(true);
        expect(responseBody).toMatchSchema(schemas.rankMathSchema);
    });

    test('read the rank math editor data for a product', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.rankMathEditorData(productId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.rankMathEditorDataSchema);
    });

    test('editor-data rejects a non-product id', { tag: ['@pro'] }, async () => {
        const [response] = await apiUtils.get(endPoints.rankMathEditorData('999999999'), {}, false);
        expect(response.ok()).toBeFalsy();
    });
});
