import { test, expect } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';

let apiUtils: ApiUtils;
let quoteRuleId: string;

test.beforeAll(async ({ request }) => {
    apiUtils = new ApiUtils(request);
    [, quoteRuleId] = await apiUtils.createQuoteRule(payloads.createQuoteRule());
});

test.describe('quote rules api test', () => {
    test('get all quote rules @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getAllQuoteRules);
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('get single quote rule @pro', async () => {
        const [response, responseBody] = await apiUtils.get(endPoints.getSingleQuoteRule(quoteRuleId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('create a quote rule @pro', async () => {
        const [response, responseBody] = await apiUtils.post(endPoints.createQuoteRule, { data: payloads.createQuoteRule() });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update a quote rule @pro', async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.updateQuoteRule(quoteRuleId), { data: payloads.updateQuoteRule });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('delete a quote rule @pro', async () => {
        const [response, responseBody] = await apiUtils.delete(endPoints.deleteQuoteRule(quoteRuleId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('restore a deleted quote rule @pro', async () => {
        const [response, responseBody] = await apiUtils.put(endPoints.restoreQuoteRule(quoteRuleId));
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });

    test('update batch quote rules @pro', async () => {
        const allQuoteRuleIds = (await apiUtils.getAllQuoteRules()).map((a: { id: unknown }) => a.id);
        const [response, responseBody] = await apiUtils.put(endPoints.updateBatchQuoteRules, { data: { trash: allQuoteRuleIds } });
        expect(response.ok()).toBeTruthy();
        expect(responseBody).toBeTruthy();
    });
});
