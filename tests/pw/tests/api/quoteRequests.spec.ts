//COVERAGE_TAG: GET /dokan/v1/request-for-quote
//COVERAGE_TAG: GET /dokan/v1/request-for-quote/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/request-for-quote
//COVERAGE_TAG: PUT /dokan/v1/request-for-quote/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/request-for-quote/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/request-for-quote/(?P<id>[\d]+)/restore
//COVERAGE_TAG: POST /dokan/v1/request-for-quote/convert-to-order
//COVERAGE_TAG: PUT /dokan/v1/request-for-quote/batch

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('request quote api test', () => {
    let apiUtils: ApiUtils;
    let requestQuoteId: string;
    const productId: string[] = [];

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        const [, pId] = await apiUtils.createProduct(payloads.createProduct());
        productId.push(pId);
        [, requestQuoteId] = await apiUtils.createQuoteRequest({ ...payloads.createQuoteRequest(), product_ids: productId });
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all request quotes', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllQuoteRequests);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get single request quote', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleRequestQuote(requestQuoteId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create a request quote', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createQuoteRequest, { data: { ...payloads.createQuoteRequest(), product_ids: productId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update a request quote', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateRequestQuote(requestQuoteId), { data: { ...payloads.updateRequestQuote, product_ids: productId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete a request quote', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteQuoteRequest(requestQuoteId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('restore a deleted request quote', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.restoreRequestQuote(requestQuoteId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('convert request quote to order', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.convertRequestQuoteToOrder, { data: { ...payloads.convertToOrder, quote_id: requestQuoteId } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update batch request quote', { tag: ['@pro'] }, async () => {
        const allRequestQuoteIds = (await apiUtils.getAllQuoteRequests()).map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchRequestQuotes, { data: { trash: allRequestQuoteIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
