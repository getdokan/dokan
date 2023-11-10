import { test as setup, expect, Page } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
// import { WpPage } from '@pages/wpPage';
import { ProductAdvertisingPage } from '@pages/productAdvertisingPage';
import { ReverseWithdrawsPage } from '@pages/reverseWithdrawsPage';
// import { VendorSettingsPage } from '@pages/vendorSettingsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';

setup.describe('authenticate users & set permalink', () => {
    setup('authenticate admin @lite', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin, data.auth.adminAuthFile);
    });

    // setup('admin set WpSettings @lite', async ({ page }) => {
    //     const loginPage = new LoginPage(page);
    //     const wpPage = new WpPage(page);
    //     await loginPage.adminLogin(data.admin);
    //     await wpPage.setPermalinkSettings(data.wpSettings.permalink);
    //     process.env.SERVER_URL = process.env.BASE_URL + '/wp-json';
    //     // helpers.appendEnv('SERVER_URL=' + process.env.BASE_URL + '/wp-json');
    // });

    setup('add customer1 @lite', async ({ request }) => {
        const apiUtils = new ApiUtils(request);
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer1, payloads.adminAuth);
        process.env.CUSTOMER_ID = customerId;
        // helpers.appendEnv('CUSTOMER_ID=' + customerId);
    });

    setup('add vendor1 @lite', async ({ request }) => {
        const apiUtils = new ApiUtils(request);
        const [, sellerId] = await apiUtils.createStore(payloads.createStore1, payloads.adminAuth);
        await apiUtils.updateCustomer(sellerId, payloads.updateAddress, payloads.adminAuth);
        process.env.VENDOR_ID = sellerId;
        // helpers.appendEnv('VENDOR_ID=' + sellerId);
    });

    setup('add vendor2 @lite', async ({ request }) => {
        const apiUtils = new ApiUtils(request);
        const [, sellerId] = await apiUtils.createStore(payloads.createStore2, payloads.adminAuth);
        await apiUtils.updateCustomer(sellerId, payloads.updateAddress, payloads.adminAuth);
        process.env.VENDOR2_ID = sellerId;
        // helpers.appendEnv('VENDOR2_ID=' + sellerId);
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
        process.env.DOKAN_PRO = String(res);
        // helpers.appendEnv('DOKAN_PRO=' + String(res));
    });

    setup('dokan pro activation status @pro', async ({ request }) => {
        const apiUtils = new ApiUtils(request);
        const res = await apiUtils.pluginsActiveOrNot(data.plugin.dokanPro, payloads.adminAuth);
        process.env.DOKAN_PRO = String(res);
        // helpers.appendEnv('DOKAN_PRO=' + String(res));
        expect(res).toBeTruthy();
    });
});

setup.describe('setup dokan settings e2e', () => {
    let productAdvertisingPage: ProductAdvertisingPage;
    let reverseWithdrawsPage: ReverseWithdrawsPage;
    // let vendorPage: VendorSettingsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    setup.beforeAll(async ({ browser, request }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        productAdvertisingPage = new ProductAdvertisingPage(aPage);
        reverseWithdrawsPage = new ReverseWithdrawsPage(aPage);

        // const vendorContext = await browser.newContext(data.auth.vendorAuth);
        // vPage = await vendorContext.newPage();
        // vendorPage = new VendorSettingsPage(vPage);

        apiUtils = new ApiUtils(request);
    });

    setup.afterAll(async () => {
        await aPage.close();
        await vPage.close();
    });

    setup('recreate reverse withdrawal payment product via settings save @lite', async () => {
        await reverseWithdrawsPage.reCreateReverseWithdrawalPaymentViaSettingsSave();
    });

    setup('reverse Withdraw payment product exists @lite', async () => {
        const product = await apiUtils.checkProductExistence('Reverse Withdrawal Payment', payloads.adminAuth);
        expect(product).toBeTruthy();
    });

    setup('recreate product advertisement payment product via settings save @pro', async () => {
        await productAdvertisingPage.recreateProductAdvertisementPaymentViaSettingsSave();
    });

    setup('product advertisement payment product exists @pro', async () => {
        const product = await apiUtils.checkProductExistence('Product Advertisement Payment', payloads.adminAuth);
        expect(product).toBeTruthy();
    });

    // setup('save store settings to update store on map @lite', async () => {
    //     await vendorPage.updateStoreMapViaSettingsSave();
    // });
});
