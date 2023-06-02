import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: ApiUtils;
let productAdvertisementId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, productAdvertisementId] = await apiUtils.createProductAdvertisement(payloads.createProduct());
});


test.describe('product advertisement api test', () => {

	test('get all advertised product stores @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllProductAdvertisementStores);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get all advertised product @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllProductAdvertisements);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create a product advertisement @pro', async ({ request }) => {
		const [body, productId] = await apiUtils.createProduct(payloads.createProduct());
		const sellerId = body.store.id;

		const response = await request.post(endPoints.createProductAdvertisement, { data: { vendor_id: sellerId, product_id: productId } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('expire a product advertisement @pro', async ({ request }) => {
		const response = await request.put(endPoints.expireProductAdvertisement(productAdvertisementId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete a product advertisement @pro', async ({ request }) => {
		const response = await request.delete(endPoints.deleteProductAdvertisement(productAdvertisementId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update batch product advertisements @pro', async ({ request }) => {
		const allProductAdvertisementIds = (await apiUtils.getAllProductAdvertisements()).map((a: { id: any }) => a.id);
		const response = await request.put(endPoints.updateBatchProductAdvertisements, { data: { ids: allProductAdvertisementIds, action: 'delete' } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
