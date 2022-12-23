import { test, expect } from '@playwright/test'
import { ApiUtils } from '../utils/apiUtils'
import { endPoints } from '../utils/apiEndPoints'
import { payloads } from '../utils/payloads'

let apiUtils: any
let quoteRuleId: string

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request)
    let [, id] = await apiUtils.createQuoteRule(payloads.createQuoteRule())
    quoteRuleId = id
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe('quote rules api test', () => {

    test('get all quote rules @pro', async ({ request }) => {
        let response = await request.get(endPoints.getAllQuoteRules)
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('get single quote rule @pro', async ({ request }) => {
        !!process.env.CI && test.fail(!!process.env.ADMIN, 'fail because of plain permalink') 
        // let [, quoteRuleId] = await apiUtils.createQuoteRule(payloads.createQuoteRule())

        let response = await request.get(endPoints.getSingleQuoteRule(quoteRuleId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('create a quote rule @pro', async ({ request }) => {
        !!process.env.CI && test.fail(!!process.env.ADMIN, 'fail because of plain permalink') 
        
        let response = await request.post(endPoints.createQuoteRule, { data: payloads.createQuoteRule() })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update a quote rule @pro', async ({ request }) => {
        !!process.env.CI && test.fail(!!process.env.ADMIN, 'fail because of plain permalink') 

        // let [, quoteRuleId] = await apiUtils.createQuoteRule(payloads.createQuoteRule())

        let response = await request.put(endPoints.updateQuoteRule(quoteRuleId), { data: payloads.updateQuoteRule })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()

    });

    test('delete a quote rule @pro', async ({ request }) => {
        !!process.env.CI && test.fail(!!process.env.ADMIN, 'fail because of plain permalink') 

        // let [, quoteRuleId] = await apiUtils.createQuoteRule(payloads.createQuoteRule())

        let response = await request.delete(endPoints.deleteQuoteRule(quoteRuleId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('restore a deleted quote rule @pro', async ({ request }) => {
        !!process.env.CI && test.fail(!!process.env.ADMIN, 'fail because of plain permalink') 
        
        // let [, quoteRuleId] = await apiUtils.createQuoteRule(payloads.createQuoteRule())
        // await apiUtils.deleteQuoteRule(quoteRuleId)

        let response = await request.put(endPoints.restoreQuoteRule(quoteRuleId))
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

    test('update batch quote rules @pro', async ({ request }) => {
        let allQuoteRuleIds = (await apiUtils.getAllQuoteRules()).map((a: { id: any }) => a.id)
        // console.log(allQuoteRuleIds)

        let response = await request.put(endPoints.updateBatchQuoteRules, { data: { trash: allQuoteRuleIds } })
        let responseBody = await apiUtils.getResponseBody(response)
        expect(response.ok()).toBeTruthy()
    });

});
