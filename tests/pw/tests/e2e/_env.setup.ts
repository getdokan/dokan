import { test as setup, expect, request, Page } from '@playwright/test';
import { LicensePage } from '@pages/licensePage';
import { ProductAdvertisingPage } from '@pages/productAdvertisingPage';
import { ReverseWithdrawsPage } from '@pages/reverseWithdrawsPage';
import { VendorSettingsPage } from '@pages/vendorSettingsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO, HPOS } = process.env;

setup.describe('setup site & woocommerce & dokan settings', () => {
    setup.use({ extraHTTPHeaders: { Authorization: payloads.adminAuth.Authorization } });

    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('check active plugins', { tag: ['@lite'] }, async () => {
        setup.skip(!process.env.CI, 'skip plugin check on local');
        const activePlugins = (await apiUtils.getAllPlugins({ status: 'active' })).map((a: { plugin: string }) => a.plugin.split('/')[1]);
        DOKAN_PRO ? expect(activePlugins).toEqual(expect.arrayContaining(data.plugin.plugins)) : expect(activePlugins).toEqual(expect.arrayContaining(data.plugin.pluginsLite));
    });

    setup('set wordPress site settings', { tag: ['@lite'] }, async () => {
        const siteSettings = await apiUtils.setSiteSettings(payloads.siteSettings);
        expect(siteSettings).toEqual(expect.objectContaining(payloads.siteSettings));
    });

    setup('set woocommerce settings', { tag: ['@lite'] }, async () => {
        await apiUtils.updateBatchWcSettingsOptions('general', payloads.general);
        await apiUtils.updateBatchWcSettingsOptions('account', payloads.account);
        HPOS && (await apiUtils.updateBatchWcSettingsOptions('advanced', payloads.advanced));
    });

    setup('set dokan license', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.dokanProLicense, dbData.dokan.dokanProLicense);
    });

    setup('activate all dokan modules', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await apiUtils.activateModules(dbData.dokan.modules);
    });

    setup('check active dokan modules', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        const activeModules = await apiUtils.getAllModuleIds({ status: 'active' });
        expect(activeModules).toEqual(expect.arrayContaining(data.modules.modules));
    });

    setup('set tax rate', { tag: ['@lite'] }, async () => {
        await apiUtils.setUpTaxRate(payloads.enableTaxRate, payloads.createTaxRate);
    });

    setup('set shipping methods', { tag: ['@lite'] }, async () => {
        // delete previous shipping zones
        const allShippingZoneIds = (await apiUtils.getAllShippingZones()).map((a: { id: string }) => a.id);
        // allShippingZoneIds = helpers.removeItem(allShippingZoneIds, 0) // avoid remove default zone id
        if (allShippingZoneIds?.length) {
            for (const shippingZoneId of allShippingZoneIds) {
                await apiUtils.deleteShippingZone(shippingZoneId);
            }
        }

        // create shipping zone, location and method
        const [, zoneId] = await apiUtils.createShippingZone(payloads.createShippingZone);
        await apiUtils.addShippingZoneLocation(zoneId, payloads.addShippingZoneLocation);
        await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodFlatRate);
        // await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodFreeShipping);
        // await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodLocalPickup);
        if (DOKAN_PRO) {
            await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodDokanTableRateShipping);
            await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodDokanDistanceRateShipping);
            await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodDokanVendorShipping);
        }
    });

    setup('set basic payments', { tag: ['@lite'] }, async () => {
        await apiUtils.updatePaymentGateway('bacs', payloads.bcs);
        await apiUtils.updatePaymentGateway('cheque', payloads.cheque);
        await apiUtils.updatePaymentGateway('cod', payloads.cod);
        // await apiUtils.updatePaymentGateway('dokan-stripe-connect', payloads.stripeConnect);
        // await apiUtils.updatePaymentGateway('dokan_paypal_marketplace', payloads.payPal);
        // await apiUtils.updatePaymentGateway('dokan_mangopay', payloads.mangoPay);
        // await apiUtils.updatePaymentGateway('dokan_razorpay', payloads.razorpay);
        // await apiUtils.updatePaymentGateway('dokan_stripe_express', payloads.stripeExpress);
    });

    setup('add categories and attributes', { tag: ['@lite'] }, async () => {
        // delete previous categories
        const allCategoryIds = (await apiUtils.getAllCategories()).map((a: { id: string }) => a.id);
        await apiUtils.updateBatchCategories('delete', allCategoryIds);

        // delete previous attributes
        const allAttributeIds = (await apiUtils.getAllAttributes()).map((a: { id: string }) => a.id);
        await apiUtils.updateBatchAttributes('delete', allAttributeIds);

        // create category
        await apiUtils.createCategory(payloads.createCategory);

        // create attribute, attribute term
        const [, attributeId] = await apiUtils.createAttribute({ name: 'sizes' });
        await apiUtils.createAttributeTerm(attributeId, { name: 's' });
        await apiUtils.createAttributeTerm(attributeId, { name: 'l' });
        await apiUtils.createAttributeTerm(attributeId, { name: 'm' });
    });

    setup('disable simple-auction ajax bid check', { tag: ['@pro'] }, async () => {
        setup.skip(!process.env.CI || !DOKAN_PRO, 'skip on local');
        const [, , status] = await apiUtils.getSinglePlugin('woocommerce-simple-auctions/woocommerce-simple-auctions', payloads.adminAuth);
        status === 'active' && (await dbUtils.updateWpOptionTable('simple_auctions_live_check', 'no'));
    });
});

setup.describe('setup user settings', () => {
    setup.use({ extraHTTPHeaders: { Authorization: payloads.adminAuth.Authorization } });

    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    // Vendor Details
    setup('add vendor1 product', { tag: ['@lite'] }, async () => {
        // delete previous store products with predefined name if any
        await apiUtils.deleteAllProducts(data.predefined.simpleProduct.product1.name, payloads.vendorAuth);
        // create store product
        const [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.simpleProduct.product1.name }, payloads.vendorAuth);
        helpers.createEnvVar('PRODUCT_ID', productId);
    });

    setup('add vendor2 product', { tag: ['@lite'] }, async () => {
        // delete previous store products with predefined name if any
        await apiUtils.deleteAllProducts(data.predefined.vendor2.simpleProduct.product1.name, payloads.vendor2Auth);
        // create store product
        const [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), name: data.predefined.vendor2.simpleProduct.product1.name }, payloads.vendor2Auth);
        helpers.createEnvVar('PRODUCT_ID_V2', productId);
    });

    setup('add vendor coupon', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        // create store coupon
        const allProductIds = (await apiUtils.getAllProducts(payloads.vendorAuth)).map((o: { id: string }) => o.id);
        await apiUtils.createCoupon(allProductIds, payloads.createCoupon1, payloads.vendorAuth);
    });

    setup.skip('admin add vendor products', { tag: ['@lite'] }, async () => {
        const product = payloads.createProduct();
        await apiUtils.createProduct({ ...product, status: 'publish', in_stock: false }, payloads.vendorAuth);
        await apiUtils.createProduct({ ...product, status: 'draft', in_stock: true }, payloads.vendorAuth);
        await apiUtils.createProduct({ ...product, status: 'pending', in_stock: true }, payloads.vendorAuth);
        await apiUtils.createProduct({ ...product, status: 'publish', in_stock: true }, payloads.vendorAuth);
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

    setup('set dokan general settings', { tag: ['@lite'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, dbData.dokan.generalSettings);
    });

    setup('admin set dokan selling settings', { tag: ['@lite'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
    });

    setup('admin set dokan withdraw settings', { tag: ['@lite'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.withdraw, dbData.dokan.withdrawSettings);
    });

    setup('admin set dokan reverse withdraw settings', { tag: ['@lite'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, dbData.dokan.reverseWithdrawSettings);
    });

    setup('admin set dokan page settings', { tag: ['@lite'] }, async () => {
        const [, pageId] = await apiUtils.createPage(payloads.tocPage, payloads.adminAuth);
        const pageSettings = await dbUtils.getDokanSettings(dbData.dokan.optionName.page);
        pageSettings['reg_tc_page'] = String(pageId);
        await dbUtils.setDokanSettings(dbData.dokan.optionName.page, pageSettings);
    });

    setup('admin set dokan appearance settings', { tag: ['@lite'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.appearance, dbData.dokan.appearanceSettings);
    });

    setup('admin set dokan privacy policy settings', { tag: ['@lite'] }, async () => {
        const [, pageId] = await apiUtils.createPage(payloads.privacyPolicyPage, payloads.adminAuth);
        dbData.dokan.privacyPolicySettings.privacy_page = String(pageId);
        await dbUtils.setDokanSettings(dbData.dokan.optionName.privacyPolicy, dbData.dokan.privacyPolicySettings);
    });

    setup.skip('admin set dokan color settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.colors, dbData.dokan.colorsSettings);
    });

    setup('admin set dokan store support settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.storeSupport, dbData.dokan.storeSupportSettings);
    });

    setup('admin set dokan shipping status settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.shippingStatus, dbData.dokan.shippingStatusSettings);
    });

    setup('admin set dokan quote settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.quote, dbData.dokan.quoteSettings);
    });

    setup.skip('admin set dokan rma settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.rma, dbData.dokan.rmaSettings);
    });

    setup('admin set dokan wholesale settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.wholesale, dbData.dokan.wholesaleSettings);
    });

    setup.skip('admin set dokan eu compliance settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.euCompliance, dbData.dokan.euComplianceSettings);
    });

    setup.skip('admin set dokan delivery time settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.deliveryTime, dbData.dokan.deliveryTimeSettings);
    });

    setup('admin set dokan product advertising settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.productAdvertising, dbData.dokan.productAdvertisingSettings);
    });

    setup.skip('admin set dokan geolocation settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.geolocation, dbData.dokan.geolocationSettings);
    });

    setup('admin set dokan product report abuse settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.productReportAbuse, dbData.dokan.productReportAbuseSettings);
    });

    setup.skip('admin set dokan spmv settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.spmv, dbData.dokan.spmvSettings);
    });

    setup.skip('admin set dokan vendor subscription settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setDokanSettings(dbData.dokan.optionName.vendorSubscription, dbData.dokan.vendorSubscriptionSettings);
    });
});

setup.describe('setup dokan settings e2e', () => {
    let licensePage: LicensePage;
    let productAdvertisingPage: ProductAdvertisingPage;
    let reverseWithdrawsPage: ReverseWithdrawsPage;
    let vendorPage: VendorSettingsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;

    setup.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        licensePage = new LicensePage(aPage);
        productAdvertisingPage = new ProductAdvertisingPage(aPage);
        reverseWithdrawsPage = new ReverseWithdrawsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendorPage = new VendorSettingsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await apiUtils.dispose();
    });

    setup('admin can refresh license', { tag: ['@pro', '@admin'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await licensePage.refreshLicense();
    });

    setup('recreate reverse withdrawal payment product via settings save', { tag: ['@lite'] }, async () => {
        const product = await apiUtils.checkProductExistence('Reverse Withdrawal Payment', payloads.adminAuth);
        if (!product) {
            console.log("Reverse Withdrawal Payment product doesn't exists!!");
            await reverseWithdrawsPage.reCreateReverseWithdrawalPaymentViaSettingsSave();
        }
    });

    setup('reverse Withdraw payment product exists', { tag: ['@lite'] }, async () => {
        const product = await apiUtils.checkProductExistence('Reverse Withdrawal Payment', payloads.adminAuth);
        expect(product).toBeTruthy();
    });

    setup('recreate product advertisement payment product via settings save', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        const product = await apiUtils.checkProductExistence('Product Advertisement Payment', payloads.adminAuth);
        if (!product) {
            console.log("Product advertisement payment product doesn't exists!!");
            await productAdvertisingPage.recreateProductAdvertisementPaymentViaSettingsSave();
        }
    });

    setup('product advertisement payment product exists', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        const product = await apiUtils.checkProductExistence('Product Advertisement Payment', payloads.adminAuth);
        expect(product).toBeTruthy();
    });

    setup('save store settings to update store on map', { tag: ['@lite'] }, async () => {
        await vendorPage.updateStoreMapViaSettingsSave();
    });
});
