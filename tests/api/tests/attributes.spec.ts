import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let productId: string;
let attributeId: string;
let attributeTermId: string;
let attribute: any;
let attributeTerm: any;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, productId] = await apiUtils.createProduct(payloads.createProduct());
	[attributeTerm, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm());
	attribute = await apiUtils.getSingleAttribute(attributeId);
	console.log(attribute)
});

test.describe('attribute api test', () => {

	test('get all attributes @lite', async ({ request }) => {
		const response = await request.get(endPoints.getAllAttributes);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get single attribute @lite', async ({ request }) => {
		const response = await request.get(endPoints.getSingleAttribute(attributeId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create an attribute @lite', async ({ request }) => {
		const response = await request.post(endPoints.createAttribute, { data: payloads.createAttribute() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
		expect(response.status()).toBe(201);
	});

	test('update an attribute @lite', async ({ request }) => {
		const response = await request.put(endPoints.updateAttribute(attributeId), { data: payloads.updateAttribute() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('delete an attribute @lite', async ({ request }) => {
		const response = await request.delete(endPoints.deleteAttribute(attributeId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update batch attributes @lite', async ({ request }) => {
		const allAttributeIds = (await apiUtils.getAllAttributes()).map((a: { id: any }) => a.id);

		const batchAttributes: object[] = [];
		for (const attributeId of allAttributeIds.slice(0, 2)) {
			batchAttributes.push({ ...payloads.updateBatchAttributesTemplate(), id: attributeId });
		}

		const response = await request.put(endPoints.batchUpdateAttributes, { data: { update: batchAttributes } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('set default attribute @lite', async ({ request }) => {
		const payload = {
			id: attribute.id,
			name: attribute.name,
			option: attributeTerm.name,
			options: [],
		};
		const response = await request.put(endPoints.setDefaultAttribute(productId), { data: { attributes: [payload] } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update product attribute @lite', async ({ request }) => {
		const payload = {
			attributes: [
				{
					all_terms: [
						{
							label: attributeTerm.name,
							slug: attributeTerm.slug,
							taxonomy: attribute.slug,
							value: attributeTerm.id,
						},
					],
					id: attribute.id,
					name: attribute.name,
					options: [attributeTerm.name],
					slug: attribute.slug,
					taxonomy: true,
					variation: false,
					visible: true,
				},
			],
		};
		const response = await request.post(endPoints.updateProductAttribute(productId), { data: payload });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
