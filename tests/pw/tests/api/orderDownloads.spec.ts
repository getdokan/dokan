import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';

let apiUtils: ApiUtils;
let downloadableProductId: string;
let orderId: string;
let downloadId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	const [responseBody,] = await apiUtils.uploadMedia('../../tests/pw/utils/sampleData/avatar.png');
	const downloads = [{
		id: String(responseBody.id),
		name: responseBody.title.raw,
		file: responseBody.source_url,
	}];
	[, downloadableProductId,] = await apiUtils.createProduct({ ...payloads.createDownloadableProduct(), downloads });
	[,, orderId,] = await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder);
	[, downloadId] = await apiUtils.createOrderDownload(orderId, [downloadableProductId],);
});


test.describe('order downloads api test', () => {

	test('get all order downloads @v2 @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllOrderDownloads(orderId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('create order downloads @v2 @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.post(endPoints.createOrderDownload(orderId), { data: { ids: [downloadableProductId] } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('delete order downloads @v2 @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.delete(endPoints.deleteOrderDownload(orderId), { data: { permission_id: downloadId } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});
