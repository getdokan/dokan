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

const versions = ['v1', 'v2'];
for (const version of versions) {
	test.describe(`product api test ${version}`, () => {

		test('get products summary @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.get(endPoints.getProductsSummary.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});

		test('get top rated products @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.get(endPoints.getTopRatedProducts.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});

		test('get best selling products @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.get(endPoints.getBestSellingProducts.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});

		test('get featured products @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.get(endPoints.getFeaturedProducts.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});

		test('get latest products @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.get(endPoints.getLatestProducts.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});

		test('get all multiStep categories @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.get(endPoints.getAllMultiStepCategories.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});

		test('get all products @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.get(endPoints.getAllProducts.replace('v1', version));
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});

		test('get single product @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.get((endPoints.getSingleProduct(productId)).replace('v1', version));
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});

		test('get all related products @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.get((endPoints.getAllRelatedProducts(productId)).replace('v1', version));
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});

		test('create a product @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.post(endPoints.createProduct.replace('v1', version), { data: payloads.createProduct() });
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});

		test('update a product @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.put((endPoints.updateProduct(productId)).replace('v1', version), { data: payloads.updateProduct() });
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});

		test('delete a product @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.delete((endPoints.deleteProduct(productId)).replace('v1', version));
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});

		test('get filtered products @v2 @lite @pro', async () => {
			const [response, responseBody] = await apiUtils.get(endPoints.getAllProducts.replace('v1', version), { params: payloads.filterParams });
			expect(response.ok()).toBeTruthy();
			expect(responseBody).toBeTruthy();
		});
	});
}
