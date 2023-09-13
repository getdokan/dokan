import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

let apiUtils: ApiUtils;
let requestQuoteId: string;
const productId: string[] = [];

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request);
    const [, pId] = await apiUtils.createProduct(payloads.createProduct());
    productId.push(pId);
    [, requestQuoteId] = await apiUtils.createQuoteRequest({
        ...payloads.createQuoteRequest(),
        product_ids: productId,
    });
});

test.describe('request quote api test', () => {
    test('get all request quotes @pro', async () => {
        const [response, responseBody] = await apiUtils.get(
            endPoints.getAllQuoteRequests,
        );
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get single request quote @pro', async () => {
        const [response, responseBody] = await apiUtils.get(
            endPoints.getSingleRequestQuote(requestQuoteId),
        );
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create a request quote @pro', async () => {
        const [response, responseBody] = await apiUtils.post(
            endPoints.createQuoteRequest,
            {
                data: {
                    ...payloads.createQuoteRequest(),
                    product_ids: productId,
                },
            },
        );
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update a request quote @pro', async () => {
        const [response, responseBody] = await apiUtils.put(
            endPoints.updateRequestQuote(requestQuoteId),
            {
                data: {
                    ...payloads.updateRequestQuote,
                    product_ids: productId,
                },
            },
        );
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete a request quote @pro', async () => {
        const [response, responseBody] = await apiUtils.delete(
            endPoints.deleteQuoteRequest(requestQuoteId),
        );
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('restore a deleted request quote @pro', async () => {
        const [response, responseBody] = await apiUtils.put(
            endPoints.restoreRequestQuote(requestQuoteId),
        );
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('convert request quote to order @pro', async () => {
        const [response, responseBody] = await apiUtils.post(
            endPoints.convertRequestQuoteToOrder,
            { data: { ...payloads.convertToOrder, quote_id: requestQuoteId } },
        );
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update batch request quote @pro ', async () => {
        const allRequestQuoteIds = (await apiUtils.getAllQuoteRequests()).map(
            (a: { id: unknown }) => a.id,
        );
        const [response, responseBody] = await apiUtils.put(
            endPoints.updateBatchRequestQuotes,
            { data: { trash: allRequestQuoteIds } },
        );
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
