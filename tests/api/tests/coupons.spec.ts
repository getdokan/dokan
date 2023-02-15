import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

let apiUtils: any;
let couponId: string;
let productId: string;

test.beforeAll(async ({ request }) => {
	apiUtils = new ApiUtils(request);
	[, productId] = await apiUtils.createProduct(payloads.createProduct());
	[, couponId] = await apiUtils.createCoupon(productId, payloads.createCoupon());
});

// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });

test.describe('coupon api test', () => {
	test('get all coupons', async ({ request }) => {
		const response = await request.get(endPoints.getAllCoupons);
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('get single coupon', async ({ request }) => {
		// let [, couponId] = await apiUtils.createCoupon(payloads.createProduct(),payloads.createCoupon())

		const response = await request.get(endPoints.getSingleCoupon(couponId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('create a coupon', async ({ request }) => {
		const response = await request.post(endPoints.createCoupon, { data: { ...payloads.createCoupon(), product_ids: productId } });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('update a coupon', async ({ request }) => {
		// let [, couponId] = await apiUtils.createCoupon(payloads.createProduct(),payloads.createCoupon())

		const response = await request.put(endPoints.updateCoupon(couponId), { data: payloads.updateCoupon() });
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});

	test('delete a coupon', async ({ request }) => {
		// let [, couponId] = await apiUtils.createCoupon(payloads.createProduct(),payloads.createCoupon())

		const response = await request.delete(endPoints.deleteCoupon(couponId));
		const responseBody = await apiUtils.getResponseBody(response);
		expect(response.ok()).toBeTruthy();
	});
});
