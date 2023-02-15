import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	await apiUtils.createStoreCategory(payloads.createStoreCategory());
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe.skip('store categories api test', () => {
	test('get default store category @pro', async ({ request }) => {
		const response = await request.get(endPoints.getDefaultStoreCategory);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get all store categories @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllStoreCategories);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get single store category @pro', async ({ request }) => {
		const [, categoryId] = await apiUtils.createStoreCategory(payloads.createStoreCategory());

		const response = await request.get(endPoints.getSingleStoreCategory(categoryId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create a store category @pro', async ({ request }) => {
		const response = await request.post(endPoints.createStoreCategory, { data: payloads.createStoreCategory() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
		expect(response.status()).toBe(201);
	});

	test('update a store category @pro', async ({ request }) => {
		const [, categoryId] = await apiUtils.createStoreCategory(payloads.createStoreCategory());

		const response = await request.put(endPoints.updateStoreCategory(categoryId), { data: payloads.updateStoreCategory() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('delete a store category @pro', async ({ request }) => {
		const [, categoryId] = await apiUtils.createStoreCategory(payloads.createStoreCategory());

		const response = await request.delete(endPoints.deleteStoreCategory(categoryId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('set default store category @pro', async ({ request }) => {
		const [, defaultCategoryId] = await apiUtils.getDefaultStoreCategory();
		const [, categoryId] = await apiUtils.createStoreCategory(payloads.createStoreCategory());

		const response = await request.put(endPoints.setDefaultStoreCategory, { data: { id: categoryId } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();

		// restore default stor category
		await apiUtils.setDefaultStoreCategory(defaultCategoryId);
	});
});
