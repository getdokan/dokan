//COVERAGE_TAG: GET /dokan/v2/products/filter-by-data

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { schemas } from '@utils/schemas';

test.describe('product filter api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        await apiUtils.createProduct(payloads.createProduct());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // BUG-2: GET /dokan/v2/products/filter-by-data is wired to get_items (returns the
    // product list) instead of get_product_filter_by_data (returns { allDates: [...] }).
    // The schema below is CORRECT (matches the route's own get_filter_data_schema); do
    // not change it to match the buggy product-array response. See SKIPPED-TESTS-BUG-REPORT.md.
    test.fixme('get products filter by data', { tag: ['@lite', '@v2'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getProductsFilterByData);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.productFilterSchema);
    });
});
