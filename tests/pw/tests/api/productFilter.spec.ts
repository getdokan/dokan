import { test, expect } from '@playwright/test';
import { ApiUtils } from 'utils/apiUtils';
import { endPoints } from 'utils/apiEndPoints';
import { payloads } from 'utils/payloads';

let aPage: Page, vPage: Page, cPage: Page, uPage: Page;
let apiUtils: ApiUtils;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	await apiUtils.createProduct(payloads.createProduct());
});

test.describe('product filter api test', () => {

	test('get products filter by data @v2 @lite @pro', async () => {
		const [response, responseBody] = await apiUtils.get(endPoints.getProductsFilterByData);
		expect(response.ok()).toBeTruthy();
		expect(responseBody).toBeTruthy();
	});

});
