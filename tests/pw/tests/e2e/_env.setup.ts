import { test as setup, expect, request } from '@playwright/test';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

const { DOKAN_PRO } = process.env;

setup.describe('setup woocommerce settings', () => {
    setup.use({ extraHTTPHeaders: payloads.adminAuth });

    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('set woocommerce settings', { tag: ['@lite'] }, async () => {
        await apiUtils.updateBatchWcSettingsOptions('general', payloads.general);
        await apiUtils.updateBatchWcSettingsOptions('account', payloads.account);
    });

    setup('add tax rate', { tag: ['@lite'] }, async () => {
        await apiUtils.setUpTaxRate(payloads.enableTax, payloads.createTaxRate);
    });

    setup('add shipping methods', { tag: ['@lite'] }, async () => {
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
        await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodFreeShipping);

        if (DOKAN_PRO) {
            await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodDokanTableRateShipping);
            await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodDokanDistanceRateShipping);
            await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodDokanVendorShipping);
        }
    });

    setup('add payments', { tag: ['@lite'] }, async () => {
        await apiUtils.updatePaymentGateway('bacs', payloads.bcs);
        await apiUtils.updatePaymentGateway('cheque', payloads.cheque);
        await apiUtils.updatePaymentGateway('cod', payloads.cod);

        // if (DOKAN_PRO) {
        // await apiUtils.updatePaymentGateway('dokan-stripe-connect', payloads.stripeConnect);
        // await apiUtils.updatePaymentGateway('dokan_paypal_marketplace', payloads.payPal);
        // await apiUtils.updatePaymentGateway('dokan_mangopay', payloads.mangoPay);
        // await apiUtils.updatePaymentGateway('dokan_razorpay', payloads.razorpay);
        // await apiUtils.updatePaymentGateway('dokan_stripe_express', payloads.stripeExpress);
        // }
    });

    setup('add categories and attributes', { tag: ['@lite'] }, async () => {
        // delete previous categories and attributes
        await apiUtils.updateBatchCategories('delete', []);
        await apiUtils.updateBatchAttributes('delete', []);

        // create category
        const [, categoryId] = await apiUtils.createCategory(payloads.createCategory);
        helpers.createEnvVar('CATEGORY_ID', categoryId);

        // create attribute, attribute term
        const [, attributeId] = await apiUtils.createAttribute({ name: 'sizes' });
        await apiUtils.createAttributeTerm(attributeId, { name: 's' });
        await apiUtils.createAttributeTerm(attributeId, { name: 'l' });
        await apiUtils.createAttributeTerm(attributeId, { name: 'm' });
    });

    setup('disable storefront sticky add to cart', { tag: ['@lite'] }, async () => {
        await dbUtils.updateOptionValue('theme_mods_storefront', { storefront_sticky_add_to_cart: false });
    });

    setup('disable simple-auction ajax bid check', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        const [, , status] = await apiUtils.getSinglePlugin('woocommerce-simple-auctions/woocommerce-simple-auctions', payloads.adminAuth);
        if (status === 'active') await dbUtils.setOptionValue('simple_auctions_live_check', 'no', false);
    });

    setup.skip('disable germanized settings', { tag: ['@pro', '@admin'] }, async () => {
        // disable all legal checkboxes
        await dbUtils.setOptionValue('woocommerce_gzd_legal_checkboxes_settings', dbData.germanized.legalCheckboxes);
        // disable theme supported notice
        await dbUtils.setOptionValue('_wc_gzd_hide_theme_supported_notice', 'yes', false);
        // disable all fields from product loop
        await dbUtils.setOptionValue('woocommerce_gzd_display_product_loop_unit_price', 'no', false);
        await dbUtils.setOptionValue('woocommerce_gzd_display_product_loop_tax', 'no', false);
        await dbUtils.setOptionValue('woocommerce_gzd_display_product_loop_shipping_costs', 'no', false);
        await dbUtils.setOptionValue('woocommerce_gzd_display_product_loop_delivery_time', 'no', false);
        await dbUtils.setOptionValue('woocommerce_gzd_display_product_loop_units', 'no', false);
        await dbUtils.setOptionValue('woocommerce_gzd_display_product_loop_deposit', 'no', false);
        await dbUtils.setOptionValue('woocommerce_gzd_display_product_loop_nutri_score', 'no', false);
        // disable all emails
        await apiUtils.updateBatchWcSettingsOptions('germanized', payloads.germanized);
    });
});

setup.describe('setup user settings', () => {
    setup.use({ extraHTTPHeaders: payloads.adminAuth });

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

    setup('add vendor1 coupon', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        // create store coupon
        const allProductIds = (await apiUtils.getAllProducts(payloads.vendorAuth)).map((o: { id: string }) => o.id);
        await apiUtils.createCoupon(allProductIds, payloads.createCoupon1, payloads.vendorAuth);
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
        await dbUtils.setOptionValue(dbData.dokan.optionName.general, dbData.dokan.generalSettings);
    });

    setup('admin set dokan selling settings', { tag: ['@lite'] }, async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
    });

    setup('admin set dokan withdraw settings', { tag: ['@lite'] }, async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.withdraw, dbData.dokan.withdrawSettings);
    });

    setup('admin set dokan reverse withdraw settings', { tag: ['@lite'] }, async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.reverseWithdraw, dbData.dokan.reverseWithdrawSettings);
    });

    setup('admin set dokan page settings', { tag: ['@lite'] }, async () => {
        const [, pageId] = await apiUtils.createPage(payloads.tocPage, payloads.adminAuth);
        await dbUtils.updateOptionValue(dbData.dokan.optionName.page, { reg_tc_page: pageId });
    });

    setup('admin set dokan appearance settings', { tag: ['@lite'] }, async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.appearance, dbData.dokan.appearanceSettings);
    });

    setup('admin set dokan privacy policy settings', { tag: ['@lite'] }, async () => {
        const [, pageId] = await apiUtils.createPage(payloads.privacyPolicyPage, payloads.adminAuth);
        await dbUtils.setOptionValue(dbData.dokan.optionName.privacyPolicy, { ...dbData.dokan.privacyPolicySettings, privacy_page: pageId });
    });

    setup('admin set dokan color settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.colors, dbData.dokan.colorsSettings);
    });

    setup('admin set dokan store support settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.storeSupport, dbData.dokan.storeSupportSettings);
    });

    setup('admin set dokan shipping status settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.shippingStatus, dbData.dokan.shippingStatusSettings);
    });

    setup('admin set dokan quote settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.quote, dbData.dokan.quoteSettings);
    });

    setup('admin set dokan rma settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.rma, dbData.dokan.rmaSettings);
    });

    setup('admin set dokan wholesale settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.wholesale, dbData.dokan.wholesaleSettings);
    });

    setup('admin set dokan eu compliance settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.euCompliance, dbData.dokan.euComplianceSettings);
    });

    setup.skip('admin set dokan delivery time settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.deliveryTime, dbData.dokan.deliveryTimeSettings);
    });

    setup('admin set dokan product advertising settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.productAdvertising, dbData.dokan.productAdvertisingSettings);
    });

    setup('admin set dokan geolocation settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.geolocation, dbData.dokan.geolocationSettings);
    });

    setup('admin set dokan product report abuse settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.productReportAbuse, dbData.dokan.productReportAbuseSettings);
    });

    setup('admin set dokan spmv settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.spmv, dbData.dokan.spmvSettings);
    });

    setup.skip('admin set dokan vendor subscription settings', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        await dbUtils.setOptionValue(dbData.dokan.optionName.vendorSubscription, dbData.dokan.vendorSubscriptionSettings);
    });
});

setup.describe('setup dokan payment products', () => {
    let apiUtils: ApiUtils;

    setup.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    setup.afterAll(async () => {
        await apiUtils.dispose();
    });

    setup('recreate reverse withdrawal payment product', { tag: ['@lite'] }, async () => {
        let product = await apiUtils.checkProductExistence('Reverse Withdrawal Payment', payloads.adminAuth);
        if (!product) {
            console.log("Reverse withdrawal payment product doesn't exists!!");
            const [, reverseWithdrawalPaymentProduct] = await apiUtils.createProduct(payloads.reverseWithdrawalPaymentProduct, payloads.adminAuth);
            await dbUtils.setOptionValue(dbData.dokan.paymentProducts.reverseWithdraw, reverseWithdrawalPaymentProduct, false);
            product = await apiUtils.checkProductExistence('Reverse Withdrawal Payment', payloads.adminAuth);
            expect(product).toBeTruthy();
            console.log('Recreated reverse withdrawal payment product');
        }
        expect(product).toBeTruthy();
    });

    setup('recreate product advertisement payment product', { tag: ['@pro'] }, async () => {
        setup.skip(!DOKAN_PRO, 'skip on lite');
        let product = await apiUtils.checkProductExistence('Product Advertisement Payment', payloads.adminAuth);
        if (!product) {
            console.log("Product advertisement payment product doesn't exists!!");
            const [, productAdvertisementPaymentProduct] = await apiUtils.createProduct(payloads.productAdvertisementPaymentProduct, payloads.adminAuth);
            await dbUtils.setOptionValue(dbData.dokan.paymentProducts.ProductAdvertisement, productAdvertisementPaymentProduct, false);
            product = await apiUtils.checkProductExistence('Product Advertisement Payment', payloads.adminAuth);
            expect(product).toBeTruthy();
            console.log('Recreated advertisement payment product');
        }
        expect(product).toBeTruthy();
    });
});
