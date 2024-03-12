import { test as setup, expect, request, Page } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { ProductAdvertisingPage } from '@pages/productAdvertisingPage';
import { ReverseWithdrawsPage } from '@pages/reverseWithdrawsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO, HPOS } = process.env;

setup.describe('setup site & woocommerce & user settings', () => {
    setup.use({ extraHTTPHeaders: { Authorization: payloads.adminAuth.Authorization } });

    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('check active plugins @lite', async () => {
        setup.skip(!process.env.CI, 'skip plugin check on local');
        const activePlugins = (await apiUtils.getAllPlugins({ status: 'active' })).map((a: { plugin: string }) => a.plugin.split('/')[1]);
        DOKAN_PRO ? expect(activePlugins).toEqual(expect.arrayContaining(data.plugin.plugins)) : expect(activePlugins).toEqual(expect.arrayContaining(data.plugin.pluginsLite));
    });

    setup('set wordPress site settings @lite', async () => {
        const siteSettings = await apiUtils.setSiteSettings(payloads.siteSettings);
        expect(siteSettings).toEqual(expect.objectContaining(payloads.siteSettings));
    });

    setup('set woocommerce settings @lite', async () => {
        await apiUtils.updateBatchWcSettingsOptions('general', payloads.general);
        await apiUtils.updateBatchWcSettingsOptions('account', payloads.account);
        HPOS && (await apiUtils.updateBatchWcSettingsOptions('advanced', payloads.advanced));
    });

    setup('set dokan license @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.dokanProLicense, dbData.dokan.dokanProLicense);
    });

    setup('activate all dokan modules @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await apiUtils.activateModules(dbData.dokan.modules);
    });

    setup('check active dokan modules @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        const activeModules = await apiUtils.getAllModuleIds({ status: 'active' });
        expect(activeModules).toEqual(expect.arrayContaining(data.modules.modules));
    });

    // Vendor Details
    setup('add vendor1 product @lite', async () => {
        // delete previous store products with predefined name if any
        await apiUtils.deleteAllProducts(data.predefined.simpleProduct.product1.name, payloads.vendorAuth);
        // create store product
        const [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.simpleProduct.product1.name }, payloads.vendorAuth);
        helpers.createEnvVar('PRODUCT_ID', productId);
    });

    setup('add vendor2 product @lite', async () => {
        // delete previous store products with predefined name if any
        await apiUtils.deleteAllProducts(data.predefined.vendor2.simpleProduct.product1.name, payloads.vendor2Auth);
        // create store product
        const [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.vendor2.simpleProduct.product1.name }, payloads.vendor2Auth);
        helpers.createEnvVar('PRODUCT_ID_V2', productId);
    });
});

setup.describe('setup dokan settings', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('set dokan general settings @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, dbData.dokan.generalSettings);
    });

    setup('admin set dokan selling settings @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
    });

    setup('admin set dokan withdraw settings @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.withdraw, dbData.dokan.withdrawSettings);
    });

    setup('admin set dokan reverse withdraw settings @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, dbData.dokan.reverseWithdrawSettings);
    });

    setup('admin set dokan page settings @lite', async () => {
        const [, pageId] = await apiUtils.createPage(payloads.tocPage, payloads.adminAuth);
        const pageSettings = await dbUtils.getDokanSettings(dbData.dokan.optionName.page);
        pageSettings['reg_tc_page'] = String(pageId);
        await dbUtils.setDokanSettings(dbData.dokan.optionName.page, pageSettings);
    });

    setup('admin set dokan appearance settings @lite', async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.appearance, dbData.dokan.appearanceSettings);
    });

    setup('admin set dokan privacy policy settings @lite', async () => {
        const [, pageId] = await apiUtils.createPage(payloads.privacyPolicyPage, payloads.adminAuth);
        dbData.dokan.privacyPolicySettings.privacy_page = String(pageId);
        await dbUtils.setDokanSettings(dbData.dokan.optionName.privacyPolicy, dbData.dokan.privacyPolicySettings);
    });

    setup('admin set dokan color settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.colors, dbData.dokan.colorsSettings);
    });

    setup('admin set dokan store support settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.storeSupport, dbData.dokan.storeSupportSettings);
    });

    setup('admin set dokan shipping status settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.shippingStatus, dbData.dokan.shippingStatusSettings);
    });

    setup('admin set dokan quote settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.quote, dbData.dokan.quoteSettings);
    });

    setup('admin set dokan rma settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.rma, dbData.dokan.rmaSettings);
    });

    setup('admin set dokan wholesale settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.wholesale, dbData.dokan.wholesaleSettings);
    });

    setup('admin set dokan eu compliance settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.euCompliance, dbData.dokan.euComplianceSettings);
    });

    setup('admin set dokan delivery time settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.deliveryTime, dbData.dokan.deliveryTimeSettings);
    });

    setup('admin set dokan product advertising settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.productAdvertising, dbData.dokan.productAdvertisingSettings);
    });

    setup('admin set dokan geolocation settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.geolocation, dbData.dokan.geolocationSettings);
    });

    setup('admin set dokan product report abuse settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.productReportAbuse, dbData.dokan.productReportAbuseSettings);
    });

    setup('admin set dokan spmv settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.spmv, dbData.dokan.spmvSettings);
    });

    setup('admin set dokan vendor subscription settings @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.vendorSubscription, dbData.dokan.vendorSubscriptionSettings);
    });
});

setup.describe.skip('setup dokan settings e2e', () => {
    let productAdvertisingPage: ProductAdvertisingPage;
    let reverseWithdrawsPage: ReverseWithdrawsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;

    setup.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        productAdvertisingPage = new ProductAdvertisingPage(aPage);
        reverseWithdrawsPage = new ReverseWithdrawsPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    setup('authenticate admin @lite', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin, data.auth.adminAuthFile);
    });

    setup('recreate reverse withdrawal payment product via settings save @lite', async () => {
        await reverseWithdrawsPage.reCreateReverseWithdrawalPaymentViaSettingsSave();
    });

    setup('reverse Withdraw payment product exists @lite', async () => {
        const product = await apiUtils.checkProductExistence('Reverse Withdrawal Payment', payloads.adminAuth);
        expect(product).toBeTruthy();
    });

    setup('recreate product advertisement payment product via settings save @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await productAdvertisingPage.recreateProductAdvertisementPaymentViaSettingsSave();
    });

    setup('product advertisement payment product exists @pro', async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        const product = await apiUtils.checkProductExistence('Product Advertisement Payment', payloads.adminAuth);
        expect(product).toBeTruthy();
    });
});
