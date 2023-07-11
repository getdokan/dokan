import { expect, test } from '@playwright/test';
import { LoginPage } from 'pages/loginPage';
import { AdminPage } from 'pages/adminPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';

test.describe('authenticate users & set permalink', () => {

	test('authenticate admin', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.adminLogin(data.admin, data.auth.adminAuthFile);
	});

	// test('admin set WpSettings', async ({ page }) => {
	// 	const loginPage = new LoginPage(page);
	// 	const adminPage = new AdminPage(page);
	// 	await loginPage.adminLogin(data.admin);
	// 	await adminPage.setPermalinkSettings(data.wpSettings.permalink);
	// });

	// test('add customer', async ({ request }) => {
	// 	const apiUtils = new ApiUtils(request);
	// 	const [, customerId] = await apiUtils.createCustomer (payloads.createCustomer1, payloads.adminAuth);
	// 	process.env.CUSTOMER_ID = customerId;
	// });

	// test('add vendor', async ({ request }) => {
	// 	const apiUtils = new ApiUtils(request);
	// 	const [, sellerId] = await apiUtils.createStore (payloads.createStore1, payloads.adminAuth);
	// 	process.env.VENDOR_ID = sellerId;
	// });

	test('authenticate customer', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.login(data.customer, data.auth.customerAuthFile);
	});

	test('authenticate vendor', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.login(data.vendor, data.auth.vendorAuthFile);
	});

});