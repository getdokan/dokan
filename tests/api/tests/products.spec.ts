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

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('product api test', () => {
	test('get products summary', async ({ request }) => {
		const response = await request.get(endPoints.getProductsSummary);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get top rated products', async ({ request }) => {
		const response = await request.get(endPoints.getTopRatedProducts);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get best selling products', async ({ request }) => {
		const response = await request.get(endPoints.getBestSellingProducts);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get featured products', async ({ request }) => {
		const response = await request.get(endPoints.getFeaturedProducts);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get latest products', async ({ request }) => {
		const response = await request.get(endPoints.getLatestProducts);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get all multiStep categories', async ({ request }) => {
		const response = await request.get(endPoints.getAllMultiStepCategories);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get all products', async ({ request }) => {
		const response = await request.get(endPoints.getAllProducts);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get single product', async ({ request }) => {
		// let [, productId] = await apiUtils.createProduct(payloads.createProduct())

		const response = await request.get(endPoints.getSingleProduct(productId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get all related products', async ({ request }) => {
		// let [, productId] = await apiUtils.createProduct(payloads.createProduct())

		const response = await request.get(endPoints.getAllRelatedProducts(productId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create a product', async ({ request }) => {
		const response = await request.post(endPoints.createProduct, { data: payloads.createProduct() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
		console.log(responseBody)
	});

	test('update a product', async ({ request }) => {
		// let [, productId] = await apiUtils.createProduct(payloads.createProduct())

		const response = await request.put(endPoints.updateProduct(productId), { data: payloads.updateProduct() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('delete a product', async ({ request }) => {
		// let [, productId] = await apiUtils.createProduct(payloads.createProduct())

		const response = await request.delete(endPoints.deleteProduct(productId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});

