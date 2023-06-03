import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: ApiUtils;
let productId: string;
let variationId: string;

// eslint-disable-next-line require-await
test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe('product block api test', () => {

	test('get product block details @lite', async () => {
		[, productId] = await apiUtils.createProduct(payloads.createDownloadableProduct());
		const [response, responseBody] = await apiUtils.get(endPoints.getProductBlockDetails(productId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get variable product block details @pro', async () => {
		[, variationId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct());
		const [response, responseBody] = await apiUtils.get(endPoints.getProductBlockDetails(variationId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});
