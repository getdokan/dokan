//COVERAGE_TAG: POST /dokan/v2/(?P<id>[\d]+)/store-current-editable-post

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

test.describe('rank math api test', () => {
    test.skip(true, 'has issue');
    let apiUtils: ApiUtils;
    let productId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, productId] = await apiUtils.createProduct(payloads.createProduct());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('product rank math data editable or not', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.rankMath(productId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.rankMathSchema);
    });
});
