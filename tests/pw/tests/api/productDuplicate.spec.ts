import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';

let apiUtils: ApiUtils;
let productId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, productId,] = await apiUtils.createProduct(payloads.createProduct());
});

test.describe('product duplicate api test', () => {

	test('create duplicate product @v2 @pro', async () => {
		const [response, responseBody] = await apiUtils.post(endPoints.createDuplicateProduct(productId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});
