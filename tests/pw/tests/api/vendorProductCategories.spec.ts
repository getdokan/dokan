//COVERAGE_TAG: GET /dokan/v1/products/categories
//COVERAGE_TAG: GET /dokan/v1/products/categories/tree
//COVERAGE_TAG: GET /dokan/v1/products/categories/(?P<id>[\d]+)

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

// Access is gated on the `dokandar` capability, so the vendor role is the
// authorized actor for these read endpoints (not the admin default auth).
test.describe('vendor product categories api test', () => {
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test.describe('happy paths', () => {
        test('get vendor product categories as vendor', { tag: ['@lite', '@vendor'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getVendorProductCategories, { headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            expect(Array.isArray(responseBody)).toBeTruthy();
        });

        test('get vendor product categories tree as vendor', { tag: ['@lite', '@vendor'] }, async () => {
            const [response, responseBody] = await apiUtils.get(endPoints.getVendorProductCategoriesTree, { headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            expect(Array.isArray(responseBody)).toBeTruthy();
        });

        test('get single vendor product category as vendor', { tag: ['@lite', '@vendor'] }, async () => {
            const [, list] = await apiUtils.get(endPoints.getVendorProductCategories, { headers: payloads.vendorAuth });
            test.skip(!Array.isArray(list) || list.length === 0, 'no product categories seeded');
            const categoryId = String(list[0].id);
            const [response, responseBody] = await apiUtils.get(endPoints.getSingleVendorProductCategory(categoryId), { headers: payloads.vendorAuth });
            expect(response.ok()).toBeTruthy();
            expect(responseBody).toBeTruthy();
        });
    });

    test.describe('negative cases', () => {
        test('customer cannot read vendor product categories', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.get(endPoints.getVendorProductCategories, { headers: payloads.customerAuth }, false);
            expect(response.ok()).toBeFalsy();
            expect([401, 403]).toContain(response.status());
        });
    });
});
