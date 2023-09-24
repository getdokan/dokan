//COVERAGE_TAG: GET /dokan/v2/products/filter-by-data

import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('product filter api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ request }) => {
        apiUtils = new ApiUtils(request);
        await apiUtils.createProduct(payloads.createProduct());
    });

    test('get products filter by data @v2 @lite', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getProductsFilterByData);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
