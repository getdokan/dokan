import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { WpPage } from '@pages/wpPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO } = data.env;

setup.describe('authenticate users & set permalink', () => {
    setup('authenticate admin @lite', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin, data.auth.adminAuthFile);
    });

    setup('admin set WpSettings @lite', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const wpPage = new WpPage(page);
        await loginPage.adminLogin(data.admin);
        await wpPage.setPermalinkSettings(data.wpSettings.permalink);
        process.env.SERVER_URL = process.env.BASE_URL + '/wp-json';
        helpers.appendEnv('SERVER_URL=' + process.env.BASE_URL + '/wp-json');
    });

    setup('add customer1 @lite', async ({ request }) => {
        const apiUtils = new ApiUtils(request);
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer1, payloads.adminAuth);
        process.env.CUSTOMER_ID = customerId;
        helpers.appendEnv('CUSTOMER_ID=' + customerId);
    });

    setup('add vendor1 @lite', async ({ request }) => {
        const apiUtils = new ApiUtils(request);
        const [, sellerId] = await apiUtils.createStore(payloads.createStore1, payloads.adminAuth);
        await apiUtils.updateCustomer(sellerId, payloads.updateAddress, payloads.adminAuth);
        process.env.VENDOR_ID = sellerId;
        helpers.appendEnv('VENDOR_ID=' + sellerId);
    });

    setup('add vendor2 @lite', async ({ request }) => {
        const apiUtils = new ApiUtils(request);
        const [, sellerId] = await apiUtils.createStore(payloads.createStore2, payloads.adminAuth);
        await apiUtils.updateCustomer(sellerId, payloads.updateAddress, payloads.adminAuth);
        process.env.VENDOR2_ID = sellerId;
        helpers.appendEnv('VENDOR2_ID=' + sellerId);
    });

    setup('authenticate customer @lite', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.customer, data.auth.customerAuthFile);
    });

    setup('authenticate vendor @lite', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.vendor, data.auth.vendorAuthFile);
    });

    setup('dokan pro enabled or not @lite', async ({ request }) => {
        const apiUtils = new ApiUtils(request);
        let res = await apiUtils.checkPluginsExistence(data.plugin.dokanPro, payloads.adminAuth);
        if (res) {
            res = await apiUtils.pluginsActiveOrNot(data.plugin.dokanPro, payloads.adminAuth);
        }
        DOKAN_PRO ? expect(res).toBeTruthy() : expect(res).toBeFalsy();
    });
});
