import { test as setup, expect } from '@playwright/test';
import { data } from '../utils/testData';
import { LoginPage } from '../pages/loginPage';
import { AdminPage } from '../pages/adminPage';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

const adminAuthFile = 'playwright/.auth/adminStorageState.json';
const customerAuthFile = 'playwright/.auth/customerStorageState.json';
const vendorAuthFile = 'playwright/.auth/vendorStorageState.json';
const aAuth = payloads.adminAuth;

setup.describe('authenticate users & set permalink',() => {

setup('authenticate admin', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.adminLogin(data.admin, adminAuthFile);
});

setup('admin set WpSettings', async ({ page}) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);
    await loginPage.adminLogin(data.admin);
    await adminPage.setPermalinkSettings(data.wpSettings.permalink);
});

setup('add customer', async ({ request }) => {
    const apiUtils = new ApiUtils(request);
    const response = await request.post(endPoints.wc.createCustomer, { data: payloads.createCustomer1 , headers:aAuth });
    const responseBody = await apiUtils.getResponseBody(response, false);
    responseBody.code ? expect(response.status()).toBe(400) : expect(response.ok()).toBeTruthy();
});

setup('add vendor', async ({ request }) => {
    const apiUtils = new ApiUtils(request);
    const response = await request.post(endPoints.createStore, { data: payloads.createStore1, headers:aAuth});
    const responseBody = await apiUtils.getResponseBody(response, false);
    responseBody.code ? expect(response.status()).toBe(500) : expect(response.ok()).toBeTruthy();
});

setup('authenticate customer', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(data.customer, customerAuthFile);
});

setup('authenticate vendor', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(data.vendor, vendorAuthFile);
});

});