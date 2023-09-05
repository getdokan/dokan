import { test , expect } from '@playwright/test';
import { LoginPage } from 'pages/loginPage';
import { WpPage } from 'pages/wpPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


test.describe('authenticate users & set permalink', () => {

	test('authenticate admin @lite', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.adminLogin(data.admin, data.auth.adminAuthFile);
	});

	test('admin set WpSettings @lite', async ({ page }) => {
		const loginPage = new LoginPage(page);
		const wpPage = new WpPage(page);
		await loginPage.adminLogin(data.admin);
		await wpPage.setPermalinkSettings(data.wpSettings.permalink);
		process.env.SERVER_URL = process.env.BASE_URL + '/wp-json';
	});

	test('add customer1 @lite', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const [, customerId] = await apiUtils.createCustomer (payloads.createCustomer1, payloads.adminAuth);
		process.env.CUSTOMER_ID = customerId;
	});

	test('add vendor1 @lite', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const [, sellerId,] = await apiUtils.createStore (payloads.createStore1, payloads.adminAuth);
		await apiUtils.updateCustomer(sellerId, payloads.updateAddress, payloads.adminAuth);
		process.env.VENDOR_ID = sellerId;
	});

	test('add vendor2 @lite', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const [, sellerId,] = await apiUtils.createStore (payloads.createStore2, payloads.adminAuth);
		await apiUtils.updateCustomer(sellerId, payloads.updateAddress, payloads.adminAuth);
		process.env.VENDOR2_ID = sellerId;
	});

	test('authenticate customer @lite', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.login(data.customer, data.auth.customerAuthFile);
	});

	test('authenticate vendor @lite', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.login(data.vendor, data.auth.vendorAuthFile);
	});


	test('dokan @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const res = await apiUtils.pluginsActiveOrNot(data.plugin.dokanPro, payloads.adminAuth);
		process.env.DOKAN_PRO = String(res);
		expect(res).toBeTruthy();
	});


});