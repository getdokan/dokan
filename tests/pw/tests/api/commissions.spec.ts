//COVERAGE_TAG: GET /dokan/v1/commission

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { schemas } from '@utils/schemas';

const { PRODUCT_ID } = process.env;

test.describe('commission api test', () => {
    test.skip(true, 'feature not merged yet');
    let apiUtils: ApiUtils;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get admin commission', { tag: ['@lite'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getCommission, { params: { product_id: PRODUCT_ID } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
        expect(responseBody).toMatchSchema(schemas.commission);
    });
});
