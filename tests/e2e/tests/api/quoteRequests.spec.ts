import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: ApiUtils;
let requestQuoteId: string;
const productId: string[] = [];

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	const [, pId] = await apiUtils.createProduct(payloads.createProduct());
	productId.push(pId);
	[, requestQuoteId] = await apiUtils.createRequestQuote({ ...payloads.createRequestQuote(), product_ids: productId });
});

test.describe('request quote api test', () => {

	test('get all request quotes @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllRequestQuotes);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get single request quote @pro', async ({ request }) => {
		const response = await request.get(endPoints.getSingleRequestQuote(requestQuoteId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create a request quote @pro', async ({ request }) => {
		const response = await request.post(endPoints.createRequestQuote, { data: { ...payloads.createRequestQuote(), product_ids: productId } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update a request quote @pro', async ({ request }) => {
		const response = await request.put(endPoints.updateRequestQuote(requestQuoteId), { data: { ...payloads.updateRequestQuote, product_ids: productId } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete a request quote @pro', async ({ request }) => {
		const response = await request.delete(endPoints.deleteRequestQuote(requestQuoteId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('restore a deleted request quote @pro', async ({ request }) => {
		const response = await request.put(endPoints.restoreRequestQuote(requestQuoteId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('convert request quote to order @pro', async ({ request }) => {
		const response = await request.post(endPoints.convertRequestQuoteToOrder, { data: { ...payloads.convertToOrder, quote_id: requestQuoteId } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update batch request quote @pro ', async ({ request }) => {
		const allRequestQuoteIds = (await apiUtils.getAllRequestQuotes()).map((a: { id: any }) => a.id);
		const response = await request.put(endPoints.updateBatchRequestQuotes, { data: { trash: allRequestQuoteIds } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
