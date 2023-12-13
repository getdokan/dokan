//COVERAGE_TAG: POST /dokan/v2/(?P<id>[\d]+)/store-current-editable-post

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe.skip('rank math api test', () => {
    let apiUtils: ApiUtils;
    let productId: string;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        [, productId] = await apiUtils.createProduct(payloads.createProduct());
    });

    test.skip('rank math @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.rankMath(productId), { data: {} });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
