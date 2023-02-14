import { test, expect } from '@playwright/test';
import { ApiUtils } from '../../utils/apiUtils';
import { endPoints } from '../../utils/apiEndPoints';
import { payloads } from '../../utils/payloads';

let apiUtils: any;
let productId: string

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	 [, productId] = await apiUtils.createProduct(payloads.createProduct());
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('product duplicate api test', () => {
	test.only('create duplicate product @v2', async ({ request }) => {
		const response = await request.post(endPoints.createDuplicateProduct(productId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});


});
