//COVERAGE_TAG: GET /dokan/v1/request-for-quote/quote-rule
//COVERAGE_TAG: GET /dokan/v1/request-for-quote/quote-rule/(?P<id>[\d]+)
//COVERAGE_TAG: POST /dokan/v1/request-for-quote/quote-rule
//COVERAGE_TAG: PUT /dokan/v1/request-for-quote/quote-rule/(?P<id>[\d]+)
//COVERAGE_TAG: DELETE /dokan/v1/request-for-quote/quote-rule/(?P<id>[\d]+)
//COVERAGE_TAG: PUT /dokan/v1/request-for-quote/quote-rule/(?P<id>[\d]+)/restore
//COVERAGE_TAG: PUT /dokan/v1/request-for-quote/quote-rule/batch

import { test, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

test.describe('quote rules api test', () => {
    let apiUtils: ApiUtils;
    let quoteRuleId: string;

    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        [, quoteRuleId] = await apiUtils.createQuoteRule(payloads.createQuoteRule());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    test('get all quote rules', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllQuoteRules);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get single quote rule', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleQuoteRule(quoteRuleId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create a quote rule', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createQuoteRule, { data: payloads.createQuoteRule() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update a quote rule', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateQuoteRule(quoteRuleId), { data: payloads.updateQuoteRule });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete a quote rule', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteQuoteRule(quoteRuleId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('restore a deleted quote rule', { tag: ['@pro'] }, async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.restoreQuoteRule(quoteRuleId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update batch quote rules', { tag: ['@pro'] }, async () => {
        const allQuoteRuleIds = (await apiUtils.getAllQuoteRules()).map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchQuoteRules, { data: { trash: allQuoteRuleIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
