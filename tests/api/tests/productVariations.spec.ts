import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let productId: string;
let variationId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[productId, variationId] = await apiUtils.createVariableProductWithVariation(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.createVariableProduct());
});


test.describe('product variation api test', () => {

	test('get all product variations @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllProductVariations(productId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get single product variation @pro', async ({ request }) => {
		const response = await request.get(endPoints.getSingleProductVariation(productId, variationId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create a product variation @pro', async ({ request }) => {
		const response = await request.post(endPoints.createProductVariation(productId), { data: payloads.createProductVariation });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update a product variation @pro', async ({ request }) => {
		const response = await request.put(endPoints.updateProductVariation(productId, variationId), { data: payloads.updateProductVariation() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('delete a product variation @pro', async ({ request }) => {
		const response = await request.delete(endPoints.deleteProductVariation(productId, variationId));
		let responseBody = await apiUtils.getResponseBody(response)
		expect(response.ok()).toBeTruthy();
	});
});
