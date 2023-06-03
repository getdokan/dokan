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

	test('get all advertised product stores @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllProductAdvertisementStores);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get all advertised product @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllProductAdvertisements);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('create a product advertisement @pro', async () => {
		const [body, productId] = await apiUtils.createProduct(payloads.createProduct());
		const sellerId = body.store.id;
		const [response, responseBody] = await apiUtils.post(endPoints.createProductAdvertisement, { data: { vendor_id: sellerId, product_id: productId } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('expire a product advertisement @pro', async () => {
		const [response, responseBody] = await apiUtils.put(endPoints.expireProductAdvertisement(productAdvertisementId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('delete a product advertisement @pro', async () => {
		const [response, responseBody] = await apiUtils.delete(endPoints.deleteProductAdvertisement(productAdvertisementId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update batch product advertisements @pro', async () => {
		const allProductAdvertisementIds = (await apiUtils.getAllProductAdvertisements()).map((a: { id: unknown }) => a.id);
		const [response, responseBody] = await apiUtils.put(endPoints.updateBatchProductAdvertisements, { data: { ids: allProductAdvertisementIds, action: 'delete' } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});
