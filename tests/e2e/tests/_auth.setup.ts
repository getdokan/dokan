import { test as setup, expect } from '@playwright/test';
import { data } from '../utils/testData';
import { LoginPage } from '../pages/loginPage';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';

const adminAuthFile = 'playwright/.auth/adminStorageState.json';
const customerAuthFile = 'playwright/.auth/customerStorageState.json';
const vendorAuthFile = 'playwright/.auth/vendorStorageState.json';

setup.describe('authenticate users', () => {
setup('authenticate admin', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.adminLogin(data.admin, adminAuthFile);
});

setup('add test customer', async ({ request }) => {
    const apiUtils = new ApiUtils(request);
    const response = await request.post(endPoints.wc.createCustomer, { data: payloads.createCustomer1 });
    const responseBody = await apiUtils.getResponseBody(response, false);
    responseBody.code ? expect(response.status()).toBe(400) : expect(response.ok()).toBeTruthy();
});

setup('add test vendor', async ({ request }) => {
    const apiUtils = new ApiUtils(request);
    const response = await request.post(endPoints.createStore, { data: payloads.createStore1 });
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
})

});