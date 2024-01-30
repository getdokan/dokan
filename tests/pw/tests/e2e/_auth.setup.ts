import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
// import { WpPage } from '@pages/wpPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO } = process.env;

setup.describe('authenticate users & set permalink', () => {
    // setup.skip('get server url @lite', async ({ request }) => {
    //     const apiUtils = new ApiUtils(request);
    //     const headers = await apiUtils.getSiteHeaders(BASE_URL);
    //     if (headers.link) {
    //         const serverUrl = headers.link.includes('rest_route') ? BASE_URL + '/?rest_route=' : BASE_URL + '/wp-json';
    //         console.log('ServerUrl:', serverUrl);
    //         process.env.SERVER_URL = serverUrl;
    //     } else {
    //         console.log("Headers link doesn't exists");
    //     }
    // });

    setup('authenticate admin @lite', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin, data.auth.adminAuthFile);
    });

    // setup('admin set WpSettings @lite', async ({ page }) => {
    //     const loginPage = new LoginPage(page);
    //     const wpPage = new WpPage(page);
    //     await loginPage.adminLogin(data.admin);
    //     await wpPage.setPermalinkSettings(data.wpSettings.permalink);
    // });

    setup('add customer1 @lite', async ({ request }) => {
        const apiUtils = new ApiUtils(request);
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer1, payloads.adminAuth);
        console.log('CUSTOMER_ID:', customerId);
        process.env.CUSTOMER_ID = customerId;
        helpers.appendEnv(`CUSTOMER_ID=${customerId}`); // for local testing
    });

    setup('add vendor1 @lite', async ({ request }) => {
        const apiUtils = new ApiUtils(request);
        const [, sellerId] = await apiUtils.createStore(payloads.createStore1, payloads.adminAuth);
        await apiUtils.updateCustomer(sellerId, payloads.updateAddress, payloads.adminAuth);
        console.log('VENDOR_ID:', sellerId);
        process.env.VENDOR_ID = sellerId;
        helpers.appendEnv(`VENDOR_ID=${sellerId}`); // for local testing
    });

    setup('add vendor2 @lite', async ({ request }) => {
        const apiUtils = new ApiUtils(request);
        const [, sellerId] = await apiUtils.createStore(payloads.createStore2, payloads.adminAuth);
        await apiUtils.updateCustomer(sellerId, payloads.updateAddress, payloads.adminAuth);
        console.log('VENDOR2_ID:', sellerId);
        process.env.VENDOR2_ID = sellerId;
        helpers.appendEnv(`VENDOR2_ID=${sellerId}`); // for local testing
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

    setup('get test environment info @lite', async ({ request }) => {
        const apiUtils = new ApiUtils(request);
        const [, systemInfo] = await apiUtils.getSystemStatus(payloads.adminAuth);
        helpers.writeFile(data.systemInfo, JSON.stringify(systemInfo));
    });
});
