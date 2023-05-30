import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	await apiUtils.createStoreCategory(payloads.createStoreCategory());
});

test.describe.skip('store categories api test', () => {
	
	test('get default store category @pro', async ({ request }) => {
		const response = await request.get(endPoints.getDefaultStoreCategory);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get all store categories @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllStoreCategories);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get single store category @pro', async ({ request }) => {
		const [, categoryId] = await apiUtils.createStoreCategory(payloads.createStoreCategory());
		const response = await request.get(endPoints.getSingleStoreCategory(categoryId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create a store category @pro', async ({ request }) => {
		const response = await request.post(endPoints.createStoreCategory, { data: payloads.createStoreCategory() });
		expect(response.ok()).toBeTruthy();
		expect(response.status()).toBe(201);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update a store category @pro', async ({ request }) => {
		const [, categoryId] = await apiUtils.createStoreCategory(payloads.createStoreCategory());
		const response = await request.put(endPoints.updateStoreCategory(categoryId), { data: payloads.updateStoreCategory() });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete a store category @pro', async ({ request }) => {
		const [, categoryId] = await apiUtils.createStoreCategory(payloads.createStoreCategory());
		const response = await request.delete(endPoints.deleteStoreCategory(categoryId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('set default store category @pro', async ({ request }) => {
		const [, defaultCategoryId] = await apiUtils.getDefaultStoreCategory();
		const [, categoryId] = await apiUtils.createStoreCategory(payloads.createStoreCategory());
		const response = await request.put(endPoints.setDefaultStoreCategory, { data: { id: categoryId } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();

		// restore default stor category
		await apiUtils.setDefaultStoreCategory(defaultCategoryId);
	});
});
