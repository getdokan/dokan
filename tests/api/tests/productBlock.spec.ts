import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let productId: string;
let variationId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
});

test.describe('product block api test', () => {

	test('get product block details @lite', async ({ request }) => {
		[, productId] = await apiUtils.createProduct(payloads.createDownloadableProduct());
		const response = await request.get(endPoints.getProductBlockDetails(productId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get variable product block details @pro', async ({ request }) => {
		[, variationId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct());
		const response = await request.get(endPoints.getProductBlockDetails(variationId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
