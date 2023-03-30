import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let sellerId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, sellerId] = await apiUtils.createStore(payloads.createStore());
	// let [, id] = await apiUtils.getCurrentUser()
});

test.describe('stores api test', () => {

	test('get all stores @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAllStores);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get single store @lite', async ({ request }) => {
		const response = await request.get(endPoints.getSingleStore(sellerId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create a store @lite', async ({ request }) => {
		const response = await request.post(endPoints.createStore, { data: payloads.createStore() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update a store @lite', async ({ request }) => {
		const response = await request.put(endPoints.updateStore(sellerId), { data: payloads.updateStore() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('delete a store @lite', async ({ request }) => {
		const [, sId] = await apiUtils.createStore(payloads.createStore());
		const response = await request.delete(endPoints.deleteStore(sId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get store current visitor @pro', async ({ request }) => {
		const response = await request.get(endPoints.getStoreCurrentVisitor);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get store stats @pro', async ({ request }) => {
		const response = await request.get(endPoints.getStoreStats(sellerId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get store slug availability @lite', async ({ request }) => {
		const response = await request.get(endPoints.getStoresSlugAvaility);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get store categories @lite', async ({ request }) => {
		const response = await request.get(endPoints.getStoreCategories(sellerId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get store products @lite', async ({ request }) => {
		const [, sId] = await apiUtils.getCurrentUser();
		await apiUtils.createProduct(payloads.createProduct());
		const response = await request.get(endPoints.getStoreProducts(sId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update a store status @lite', async ({ request }) => {
		const response = await request.put(endPoints.updateStoreStatus(sellerId), { data: payloads.updateStoreStatus });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('client contact store @lite', async ({ request }) => {
		const response = await request.post(endPoints.ClientContactStore(sellerId), { data: payloads.clientContactStore });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('admin email store @pro', async ({ request }) => {
		const response = await request.post(endPoints.adminEmailStore(sellerId), { data: payloads.adminEmailStore });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update batch stores @lite', async ({ request }) => {
		const allStoreIds = (await apiUtils.getAllStores()).map((a: { id: any }) => a.id);
		const response = await request.put(endPoints.updateBatchStores, { data: { approved: allStoreIds } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
