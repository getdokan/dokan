import { test as setup, expect } from '@playwright/test';
import { LoginPage } from 'pages/loginPage';
import { WpPage } from 'pages/wpPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';

setup.describe('authenticate users & set permalink', () => {

	setup('authenticate admin @lite @pro', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.adminLogin(data.admin, data.auth.adminAuthFile);
	});

	setup('admin set WpSettings @lite @pro', async ({ page }) => {
		const loginPage = new LoginPage(page);
		const wpPage = new WpPage(page);
		await loginPage.adminLogin(data.admin);
		await wpPage.setPermalinkSettings(data.wpSettings.permalink);
	});

	setup('add customer @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const [, customerId] = await apiUtils.createCustomer (payloads.createCustomer1, payloads.adminAuth);
		process.env.CUSTOMER_ID = customerId;
	});

	setup('add vendor @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const [, sellerId] = await apiUtils.createStore (payloads.createStore1, payloads.adminAuth);
		process.env.VENDOR_ID = sellerId;
	});

	setup('authenticate customer @lite @pro', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.login(data.customer, data.auth.customerAuthFile);
	});

	setup('authenticate vendor @lite @pro', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.login(data.vendor, data.auth.vendorAuthFile);
	});

	setup('Dokan Pro enabled or not @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const res = await apiUtils.pluginsActiveOrNot(data.plugin.dokanPro, payloads.adminAuth);
		process.env.DOKAN_PRO = String(res);
		expect(res).toBeTruthy();
	});

});