import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

let apiUtils: ApiUtils;
let productId: string;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request);
    [, productId] = await apiUtils.createProduct(payloads.createProduct());
});

test.describe.skip('rank math api test', () => {
    test('rank math @pro', async () => {
        test.skip(!!process.env.CI, 'feature not merged yet!');
        const [response, responseBody] = await apiUtils.post(
            endPoints.rankMath(productId),
            { data: {} },
        );
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
