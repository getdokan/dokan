import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let productId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, productId] = await apiUtils.createProduct(payloads.createProduct());
});

const versions = ['v1', 'v2'];
for (const version of versions) {
	test.describe(`product api test ${version}`, () => {

		test('get products summary @lite', async ({ request }) => {
			const response = await request.get(endPoints.getProductsSummary.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('get top rated products @lite', async ({ request }) => {
			const response = await request.get(endPoints.getTopRatedProducts.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('get best selling products @lite', async ({ request }) => {
			const response = await request.get(endPoints.getBestSellingProducts.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('get featured products @lite', async ({ request }) => {
			const response = await request.get(endPoints.getFeaturedProducts.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('get latest products @lite', async ({ request }) => {
			const response = await request.get(endPoints.getLatestProducts.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('get all multiStep categories @lite', async ({ request }) => {
			const response = await request.get(endPoints.getAllMultiStepCategories.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('get all products @lite', async ({ request }) => {
			const response = await request.get(endPoints.getAllProducts.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('get single product @lite', async ({ request }) => {
			const response = await request.get((endPoints.getSingleProduct(productId)).replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('get all related products @lite', async ({ request }) => {
			const response = await request.get((endPoints.getAllRelatedProducts(productId)).replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('create a product @lite', async ({ request }) => {
			const response = await request.post(endPoints.createProduct.replace('v1', version), { data: payloads.createProduct() });
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('update a product @lite', async ({ request }) => {
			const response = await request.put((endPoints.updateProduct(productId)).replace('v1', version), { data: payloads.updateProduct() });
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('delete a product @lite', async ({ request }) => {
			const response = await request.delete((endPoints.deleteProduct(productId)).replace('v1', version));
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});

		test('get filtered products @v2 @lite', async ({ request }) => {
			const response = await request.get(endPoints.getAllProducts.replace('v1', version), { params: payloads.filterParams });
			expect(response.ok()).toBeTruthy();
			const responseBody = await apiUtils.getResponseBody(response);
			expect(responseBody).toBeTruthy();
		});
	});
};

