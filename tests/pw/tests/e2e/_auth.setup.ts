import { test as setup, expect, request } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { WpPage } from '@pages/wpPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

const { CI, LOCAL, DOKAN_PRO, BASE_URL } = process.env;

setup.describe('authenticate users & set permalink', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('authenticate admin', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin, data.auth.adminAuthFile);
    });

    setup.skip('admin set WpSettings', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        const wpPage = new WpPage(page);
        await loginPage.adminLogin(data.admin);
        await wpPage.setPermalinkSettings(data.wpSettings.permalink);
    });

    setup('enable admin selling status', { tag: ['@lite'] }, async () => {
        const responseBody = await apiUtils.setStoreSettings(payloads.setupStore, payloads.adminAuth);
        expect(responseBody).toBeTruthy();
    });

    setup('add customer1', { tag: ['@lite'] }, async () => {
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer1, payloads.adminAuth);
        helpers.createEnvVar('CUSTOMER_ID', customerId);
    });

    setup('add vendor1', { tag: ['@lite'] }, async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore1, payloads.adminAuth, true);
        helpers.createEnvVar('VENDOR_ID', sellerId);
    });

    setup('add customer2', { tag: ['@lite'] }, async () => {
        const [, customerId] = await apiUtils.createCustomer(payloads.createCustomer2, payloads.adminAuth);
        helpers.createEnvVar('CUSTOMER2_ID', customerId);
    });

    setup('add vendor2', { tag: ['@lite'] }, async () => {
        const [, sellerId] = await apiUtils.createStore(payloads.createStore2, payloads.adminAuth, true);
        helpers.createEnvVar('VENDOR2_ID', sellerId);
    });

    setup('authenticate customer', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.customer, data.auth.customerAuthFile);
    });

    setup('authenticate vendor', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.vendor, data.auth.vendorAuthFile);
    });

    setup('authenticate customer2', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.customer.customer2, data.auth.customer2AuthFile);
    });

    setup('authenticate vendor2', { tag: ['@lite'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.vendor.vendor2, data.auth.vendor2AuthFile);
    });

    setup('dokan pro enabled or not', { tag: ['@lite'] }, async () => {
        setup.skip(LOCAL, 'Skip on Local testing');
        let res = await apiUtils.checkPluginsExistence(data.plugin.dokanPro, payloads.adminAuth);
        if (res) {
            res = await apiUtils.pluginsActiveOrNot(data.plugin.dokanPro, payloads.adminAuth);
        }
        DOKAN_PRO ? expect(res).toBeTruthy() : expect(res).toBeFalsy();
    });

    setup('get test environment info', { tag: ['@lite'] }, async () => {
        const [, systemInfo] = await apiUtils.getSystemStatus(payloads.adminAuth);
        helpers.writeFile(data.systemInfo, JSON.stringify(systemInfo));
    });
});
