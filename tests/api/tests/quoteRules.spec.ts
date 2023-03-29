import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let quoteRuleId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, quoteRuleId] = await apiUtils.createQuoteRule(payloads.createQuoteRule());
});

test.describe('quote rules api test', () => {

	test('get all quote rules @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllQuoteRules);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get single quote rule @pro', async ({ request }) => {
		const response = await request.get(endPoints.getSingleQuoteRule(quoteRuleId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create a quote rule @pro', async ({ request }) => {
		const response = await request.post(endPoints.createQuoteRule, { data: payloads.createQuoteRule() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update a quote rule @pro', async ({ request }) => {
		const response = await request.put(endPoints.updateQuoteRule(quoteRuleId), { data: payloads.updateQuoteRule });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('delete a quote rule @pro', async ({ request }) => {
		const response = await request.delete(endPoints.deleteQuoteRule(quoteRuleId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('restore a deleted quote rule @pro', async ({ request }) => {		
		const response = await request.put(endPoints.restoreQuoteRule(quoteRuleId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update batch quote rules @pro', async ({ request }) => {
		const allQuoteRuleIds = (await apiUtils.getAllQuoteRules()).map((a: { id: any }) => a.id);
		const response = await request.put(endPoints.updateBatchQuoteRules, { data: { trash: allQuoteRuleIds } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
