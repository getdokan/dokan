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
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get single store @lite', async ({ request }) => {
		const response = await request.get(endPoints.getSingleStore(sellerId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create a store @lite', async ({ request }) => {
		const response = await request.post(endPoints.createStore, { data: payloads.createStore() });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update a store @lite', async ({ request }) => {
		const response = await request.put(endPoints.updateStore(sellerId), { data: payloads.updateStore() });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete a store @lite', async ({ request }) => {
		const [, sId] = await apiUtils.createStore(payloads.createStore());
		const response = await request.delete(endPoints.deleteStore(sId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get store current visitor @pro', async ({ request }) => {
		const response = await request.get(endPoints.getStoreCurrentVisitor);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get store stats @pro', async ({ request }) => {
		const response = await request.get(endPoints.getStoreStats(sellerId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get store slug availability @lite', async ({ request }) => {
		const response = await request.get(endPoints.getStoresSlugAvaility);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get store categories @lite', async ({ request }) => {
		const response = await request.get(endPoints.getStoreCategories(sellerId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get store products @lite', async ({ request }) => {
		const [, sId] = await apiUtils.getCurrentUser();
		await apiUtils.createProduct(payloads.createProduct());
		const response = await request.get(endPoints.getStoreProducts(sId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update a store status @lite', async ({ request }) => {
		const response = await request.put(endPoints.updateStoreStatus(sellerId), { data: payloads.updateStoreStatus });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('client contact store @lite', async ({ request }) => {
		const response = await request.post(endPoints.ClientContactStore(sellerId), { data: payloads.clientContactStore });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('admin email store @pro', async ({ request }) => {
		const response = await request.post(endPoints.adminEmailStore(sellerId), { data: payloads.adminEmailStore });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update batch stores @lite', async ({ request }) => {
		const allStoreIds = (await apiUtils.getAllStores()).map((a: { id: any }) => a.id);
		const response = await request.put(endPoints.updateBatchStores, { data: { approved: allStoreIds } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
