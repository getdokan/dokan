import { test as setup } from '@playwright/test';
import { data } from '../utils/testData';
import { LoginPage } from '../pages/loginPage';
import { AdminPage } from '../pages/adminPage';
import { ApiUtils } from '../utils/apiUtils';
import { payloads } from '../utils/payloads';

setup.describe('authenticate users & set permalink',() => {

	setup('authenticate admin', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.adminLogin(data.admin, data.auth.adminAuthFile);
	});

	setup('admin set WpSettings', async ({ page}) => {
		const loginPage = new LoginPage(page);
		const adminPage = new AdminPage(page);
		await loginPage.adminLogin(data.admin);
		await adminPage.setPermalinkSettings(data.wpSettings.permalink);
	});

	setup('add customer', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		await apiUtils.createCustomer (payloads.createCustomer1 , payloads.adminAuth);
	});

	setup('add vendor', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		await apiUtils.createStore (payloads.createStore1 , payloads.adminAuth);
	});

	setup('authenticate customer', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.login(data.customer, data.auth.customerAuthFile);
	});

	setup('authenticate vendor', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.login(data.vendor, data.auth.vendorAuthFile);
	});

});