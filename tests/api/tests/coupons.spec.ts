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
	[, couponId] = await apiUtils.createCoupon([productId], payloads.createCoupon());
});

test.describe('coupon api test', () => {
	
	test('get all coupons @pro', async ({ request }) => {
		const response = await request.get(endPoints.getAllCoupons);
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('get single coupon @pro', async ({ request }) => {
		const response = await request.get(endPoints.getSingleCoupon(couponId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('create a coupon @pro', async ({ request }) => {
		const response = await request.post(endPoints.createCoupon, { data: { ...payloads.createCoupon(), product_ids: productId } });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('update a coupon @pro', async ({ request }) => {
		const response = await request.put(endPoints.updateCoupon(couponId), { data: payloads.updateCoupon() });
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});

	test('delete a coupon @pro', async ({ request }) => {
		const response = await request.delete(endPoints.deleteCoupon(couponId));
		expect(response.ok()).toBeTruthy();
		const responseBody = await apiUtils.getResponseBody(response);
		expect(responseBody).toBeTruthy();
	});
});
