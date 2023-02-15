import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let sellerId: string;
let reviewId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, sellerId] = await apiUtils.createStore(payloads.createStore());
	// let [, id] = await apiUtils.getCurrentUser()
	[, reviewId] = await apiUtils.createStoreReview(sellerId, payloads.createStoreReview, payloads.customerAuth);
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('stores api test', () => {
	test('get store availability status', async ({ request }) => {
		const response = await request.get(endPoints.getAllStoresCheck);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get all stores', async ({ request }) => {
		const response = await request.get(endPoints.getAllStores);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
		// expect(responseBody[0]).toContainEqual(expect.objectContaining(
		//     {
		//         id: expect.any(Number),
		//         store_name: expect.any(String),
		//         first_name: expect.any(String),
		//         last_name: expect.any(String),
		//         email: expect.any(String),
		//         social: expect.any(Array),
		//         phone: expect.any(String),
		//         show_email: expect.any(Boolean),
		//         address: expect.any(Array),
		//         location: expect.any(String),
		//         banner: expect.any(String),
		//         banner_id: expect.any(Number),
		//         gravatar: expect.any(String),
		//         gravatar_id: expect.any(Number),
		//         shop_url: expect.any(String),
		//         products_per_page: expect.any(Number),
		//         show_more_product_tab: expect.any(Boolean),
		//         toc_enabled: expect.any(Boolean),
		//         store_toc: expect.any(String),
		//         featured: expect.any(Boolean),
		//         rating: expect.objectContaining({
		//             rating: expect.any(String),
		//             count: expect.any(Number),
		//         }),
		//         enabled: expect.any(Boolean),
		//         registered: expect.any(String),
		//         payment: expect.any(Object),
		//         trusted: expect.any(Boolean),
		//         store_open_close: {
		//             enabled: expect.any(Boolean),
		//             time: expect.any(Array),
		//             open_notice: expect.any(String),
		//             close_notice: expect.any(String),
		//         },
		//         company_name: expect.any(String),
		//         vat_number: expect.any(String),
		//         company_id_number: expect.any(String),
		//         bank_name: expect.any(String),
		//         bank_iban: expect.any(String),
		//         switch_url: expect.any(String),
		//         admin_commission: expect.any(String),
		//         admin_additional_fee: expect.any(String),
		//         admin_commission_type: expect.any(String),
		//         _links: expect.objectContaining({
		//             self: expect.any(Array),
		//             collection: expect.any(Array),
		//         }),
		//     }))
	});

	test('get single store', async ({ request }) => {
		// let [, sellerId] = await apiUtils.createStore(payloads.createStore())

		const response = await request.get(endPoints.getSingleStore(sellerId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
		// expect(responseBody1).toEqual(expect.objectContaining(
		// {
		// id: expect.any(Number),
		// store_name: expect.any(String),
		// first_name: expect.any(String),
		// last_name: expect.any(String),
		// email: expect.any(String),
		// social: expect.any(Array),
		// phone: expect.any(String),
		// show_email: expect.any(Boolean),
		// address: expect.any(Array),
		// location: expect.any(String),
		// banner: expect.any(String),
		// banner_id: expect.any(Number),
		// gravatar: expect.any(String),
		// gravatar_id: expect.any(Number),
		// shop_url: expect.any(String),
		// products_per_page: expect.any(Number),
		// show_more_product_tab: expect.any(Boolean),
		// toc_enabled: expect.any(Boolean),
		// store_toc: expect.any(String),
		// featured: expect.any(Boolean),
		// rating: expect.objectContaining({
		//     rating: expect.any(String),
		//             count: expect.any(Number),
		//         }),
		//         enabled: expect.any(Boolean),
		//         registered: expect.any(String),
		//         payment: expect.any(Object),
		//         trusted: expect.any(Boolean),
		//         store_open_close: {
		//             enabled: expect.any(Boolean),
		//             time: expect.any(Array),
		//             open_notice: expect.any(String),
		//             close_notice: expect.any(String),
		//         },
		//         company_name: expect.any(String),
		//         vat_number: expect.any(String),
		//         company_id_number: expect.any(String),
		//         bank_name: expect.any(String),
		//         bank_iban: expect.any(String),
		//         switch_url: expect.any(String),
		//         admin_commission: expect.any(String),
		//         admin_additional_fee: expect.any(String),
		//         admin_commission_type: expect.any(String),
		//         _links: expect.any(Object),
		//     }))
	});

	test('create a store', async ({ request }) => {
		const response = await request.post(endPoints.createStore, { data: payloads.createStore() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update a store', async ({ request }) => {
		// let [, sellerId] = await apiUtils.createStore(payloads.createStore())

		const response = await request.put(endPoints.updateStore(sellerId), { data: payloads.updateStore() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('delete a store', async ({ request }) => {
		const [, sId] = await apiUtils.createStore(payloads.createStore());

		const response = await request.delete(endPoints.deleteStore(sId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get store current visitor', async ({ request }) => {
		const response = await request.get(endPoints.getStoreCurrentVisitor);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get store stats', async ({ request }) => {
		// let [, sellerId] = await apiUtils.createStore(payloads.createStore())

		const response = await request.get(endPoints.getStoreStats(sellerId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get store categories', async ({ request }) => {
		// let [, sellerId] = await apiUtils.createStore(payloads.createStore())

		const response = await request.get(endPoints.getStoreCategories(sellerId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get store products', async ({ request }) => {
		// let [, sellerId] = await apiUtils.createStore(payloads.createStore())
		const [, sId] = await apiUtils.getCurrentUser();
		await apiUtils.createProduct(payloads.createProduct());

		const response = await request.get(endPoints.getStoreProducts(sId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create a store review', async ({ request }) => {
		// let [, sellerId] = await apiUtils.createStore(payloads.createStore())

		const response = await request.post(endPoints.createStoreReview(sellerId), { data: payloads.createStoreReview });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get store reviews', async ({ request }) => {
		// let [, sellerId] = await apiUtils.createStore(payloads.createStore())
		// let [, sellerId] = await apiUtils.getCurrentUser()
		await apiUtils.createStoreReview(sellerId, payloads.createStoreReview, payloads.customerAuth);

		const response = await request.get(endPoints.getStoreReviews(sellerId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update a store status', async ({ request }) => {
		// let [, sellerId] = await apiUtils.createStore(payloads.createStore())

		const response = await request.put(endPoints.updateStoreStatus(sellerId), { data: payloads.updateStoreStatus });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('admin contact store', async ({ request }) => {
		// let [, sellerId] = await apiUtils.createStore(payloads.createStore())

		const response = await request.post(endPoints.adminContactStore(sellerId), { data: payloads.adminContactStore });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('admin email store', async ({ request }) => {
		// let [, sellerId] = await apiUtils.createStore(payloads.createStore())

		const response = await request.post(endPoints.adminEmailStore(sellerId), { data: payloads.adminEmailStore });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update batch stores', async ({ request }) => {
		const allStoreIds = (await apiUtils.getAllStores()).map((a: { id: any }) => a.id);
		// console.log(allStoreIds)

		const response = await request.put(endPoints.updateBatchStores, { data: { approved: allStoreIds } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
