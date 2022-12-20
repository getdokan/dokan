import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'


let apiUtils: any
let requestQuoteId: string
let productId: string[] = []

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, pId] = await apiUtils.createProduct(payloads.createProduct())
    productId.push(pId)
    let [, qId] = await apiUtils.createRequestQuote({ ...payloads.createRequestQuote(), product_ids: productId })
    requestQuoteId = qId
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('request quote api test', () => {

    test('get all request quotes', async ({ request }) => {
        let response = await request.get(endPoints.getAllRequestQuotes)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single request quote', async ({ request }) => {
        // let [, requestQuoteId] = await apiUtils.createRequestQuote({ ...payloads.createRequestQuote(), product_ids: productId })

        let response = await request.get(endPoints.getSingleRequestQuote(requestQuoteId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('create a request quote', async ({ request }) => {
        let response = await request.post(endPoints.createRequestQuote, { data: { ...payloads.createRequestQuote(), product_ids: productId } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test.skip('update a request quote', async ({ request }) => {
        // let [, requestQuoteId] = await apiUtils.createRequestQuote({ ...payloads.createRequestQuote(), product_ids: productId })

        let response = await request.put(endPoints.updateRequestQuote(requestQuoteId), { data: { ...payloads.updateRequestQuote, product_ids: productId } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

    });

    test('delete a request quote', async ({ request }) => {
        // let [, requestQuoteId] = await apiUtils.createRequestQuote({ ...payloads.createRequestQuote(), product_ids: productId })

        let response = await request.delete(endPoints.deleteRequestQuote(requestQuoteId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('restore a deleted request quote', async ({ request }) => {
        // let [, requestQuoteId] = await apiUtils.createRequestQuote({ ...payloads.createRequestQuote(), product_ids: productId })
        // await apiUtils.deleteRequestQuote(requestQuoteId)

        let response = await request.put(endPoints.restoreRequestQuote(requestQuoteId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('convert request quote to order', async ({ request }) => {
        // let [, requestQuoteId] = await apiUtils.createRequestQuote({ ...payloads.createRequestQuote(), product_ids: productId })

        let response = await request.post(endPoints.convertRequestQuoteToOrder, { data: { ...payloads.convetToOrder, quote_id: requestQuoteId } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update batch request quote', async ({ request }) => {
        let allrequestQuoteIds = (await apiUtils.getAllRequestQuotes()).map(a => a.id)
        // console.log(allrequestQuoteIds)

        let response = await request.put(endPoints.updateBatchRequestQuotes, { data: { trash: allrequestQuoteIds } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });



});
