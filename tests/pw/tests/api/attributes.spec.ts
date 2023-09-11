import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';


let apiUtils: ApiUtils;
let productId: string;
let attributeId: string;
let attribute: any;
let attributeTerm: any;
let attributeTermId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, productId,] = await apiUtils.createProduct(payloads.createProduct());
	[attributeTerm, attributeId, attributeTermId] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm());
	attribute = await apiUtils.getSingleAttribute(attributeId);
});

test.describe('attribute api test', () => {

	test('get all attributes @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getAllAttributes);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('get single attribute @lite', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getSingleAttribute(attributeId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('create an attribute @lite', async () => {
		const [response, responseBody] = await apiUtils.post(endPoints.createAttribute, { data: payloads.createAttribute() });
		expect(response.status()).toBe(201);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update an attribute @lite', async () => {
		const [response, responseBody] = await apiUtils.put(endPoints.updateAttribute(attributeId), { data: payloads.updateAttribute() });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('delete an attribute @lite', async () => {
		const [response, responseBody] = await apiUtils.delete(endPoints.deleteAttribute(attributeId));
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update batch attributes @lite', async () => {
		const allAttributeIds = (await apiUtils.getAllAttributes()).map((a: { id: unknown }) => a.id);

		const batchAttributes: object[] = [];
		for (const attributeId of allAttributeIds.slice(0, 2)) {
			batchAttributes.push({ ...payloads.updateBatchAttributesTemplate(), id: attributeId });
		}

		const [response, responseBody] = await apiUtils.put(endPoints.batchUpdateAttributes, { data: { update: batchAttributes } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('set default attribute @lite', async () => {
		const payload = {
			id     : attribute.id,
			name   : attribute.name,
			option : attributeTerm.name,
			options: [],
		};
		const [response, responseBody] = await apiUtils.put(endPoints.setDefaultAttribute(productId), { data: { attributes: [payload] } });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

	test('update product attribute @lite', async () => {
		const payload = {
			attributes: [
				{
					all_terms: [
						{
							label   : attributeTerm.name,
							slug    : attributeTerm.slug,
							taxonomy: attribute.slug,
							value   : attributeTerm.id,
						},
					],
					id       : attribute.id,
					name     : attribute.name,
					options  : [attributeTerm.name],
					slug     : attribute.slug,
					taxonomy : true,
					variation: false,
					visible  : true,
				},
			],
		};
		const [response, responseBody] = await apiUtils.post(endPoints.updateProductAttribute(productId), { data: payload });
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});
});
