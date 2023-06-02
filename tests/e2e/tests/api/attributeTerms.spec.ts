import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: ApiUtils;
let attributeId: string;
let attributeTermId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm());
});

test.describe('attribute term api test', () => {

	test('get all attribute terms @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAllAttributeTerms(attributeId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get single attribute term @lite', async ({ request }) => {
		const response = await request.get(endPoints.getSingleAttributeTerm(attributeId, attributeTermId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create an attribute term @lite', async ({ request }) => {
		const response = await request.post(endPoints.createAttributeTerm(attributeId), { data: payloads.createAttributeTerm() });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update an attribute term  @lite', async ({ request }) => {
		const response = await request.put(endPoints.updateAttributeTerm(attributeId, attributeTermId), { data: payloads.updateAttributeTerm() });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete an attribute term @lite', async ({ request }) => {
		const response = await request.delete(endPoints.deleteAttributeTerm(attributeId, attributeTermId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update batch attribute terms @lite', async ({ request }) => {
		const allAttributeTermIds = (await apiUtils.getAllAttributeTerms(attributeId)).map((a: { id: any; }) => a.id);

		const batchAttributeTerms: object[] = [];
		for (const attributeTermId of allAttributeTermIds.slice(0, 2)) {
			batchAttributeTerms.push({ ...payloads.updateBatchAttributesTemplate(), id: attributeTermId });
		}

		const response = await request.put(endPoints.updateBatchAttributeTerms(attributeId), { data: { update: batchAttributeTerms } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
