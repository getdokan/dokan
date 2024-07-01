import { test, request, Page } from '@playwright/test';
import { SettingPage } from '@pages/settingPage';
import { dbData } from '@utils/dbData';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';

const { CI, CUSTOMER_ID, PRODUCT_ID } = process.env;

test.describe.skip('Settings test', () => {
    let admin: SettingPage;
    let vendor: SettingPage;
    let customer: SettingPage;
    let guest: SettingPage;
    let aPage: Page, vPage: Page, cPage: Page, gPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new SettingPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new SettingPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new SettingPage(cPage);

        const guestContext = await browser.newContext(data.auth.noAuth);
        gPage = await guestContext.newPage();
        guest = new SettingPage(gPage);
    });

    test.afterAll(async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, dbData.dokan.generalSettings);
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);

        await aPage.close();
        await vPage.close();
        await cPage.close();
        await gPage.close();
    });

    // general settings

    test.skip('admin can set vendor store url (general settings)', { tag: ['@lite', '@admin'] }, async () => {
        // todo: need to run on serial mode, will fail other tests
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, custom_store_url: 'stores' });
        CI ? await helpers.exeCommand(data.command.permalink) : await helpers.exeCommand(data.command.permalinkLocal);
        await admin.vendorStoreUrlSetting(data.predefined.vendorStores.vendor1, 'stores');

        //reset
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, dbData.dokan.generalSettings);
        CI ? await helpers.exeCommand(data.command.permalink) : await helpers.exeCommand(data.command.permalinkLocal);
    });

    test('admin can set vendor setup wizard logo & message (general settings)', { tag: ['@lite', '@admin'] }, async () => {
        apiUtils = new ApiUtils(await request.newContext());
        const [responseBody] = await apiUtils.uploadFile(data.image.dokan, payloads.adminAuth);
        const logoUrl = responseBody.source_url;
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, {
            ...dbData.dokan.generalSettings,
            setup_wizard_logo_url: logoUrl,
            setup_wizard_message: dbData.testData.dokan.generalSettings.setup_wizard_message,
        });
        await admin.vendorSetupWizardLogoAndMessageSetting(logoUrl, dbData.testData.dokan.generalSettings.setup_wizard_message_without_html);
    });

    test('admin can disable vendor setup wizard (general settings)', { tag: ['@lite', '@guest'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, disable_welcome_wizard: 'on' });
        await guest.disableVendorSetupWizardSetting();
    });

    test('admin can set store terms and conditions (general settings)', { tag: ['@lite', '@vendor'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, seller_enable_terms_and_conditions: 'on' });
        await vendor.setStoreTermsAndConditions('on');

        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, seller_enable_terms_and_conditions: 'off' });
        await vendor.setStoreTermsAndConditions('off');
    });

    test('admin can set store products per page (general settings)', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, store_products_per_page: '1' });
        await customer.setStoreProductsPerPage(data.predefined.vendorStores.vendor1, 1);
    });

    test('admin can enable address fields on registration (general settings)', { tag: ['@lite', '@guest'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, enabled_address_on_reg: 'on' });
        await guest.enableAddressFieldsOnRegistration('on');

        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, enabled_address_on_reg: 'off' });
        await guest.enableAddressFieldsOnRegistration('off');
    });

    test('admin can enable store terms and conditions on registration (general settings)', { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, enable_tc_on_reg: 'on' });
        await vendor.enableStoreTermsAndConditionsOnRegistration('on');

        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, enable_tc_on_reg: 'off' });
        await vendor.enableStoreTermsAndConditionsOnRegistration('off');
    });

    test('admin can set show vendor info (general settings)', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, show_vendor_info: 'on' });
        await customer.setShowVendorInfo(data.predefined.simpleProduct.product1.name, 'on');

        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, show_vendor_info: 'off' });
        await customer.setShowVendorInfo(data.predefined.simpleProduct.product1.name, 'off');
    });

    test('admin can enable more products tab (general settings)', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, enabled_more_products_tab: 'on' });
        await customer.enableMoreProductsTab(data.predefined.simpleProduct.product1.name, 'on');

        await dbUtils.setDokanSettings(dbData.dokan.optionName.general, { ...dbData.dokan.generalSettings, enabled_more_products_tab: 'off' });
        await customer.enableMoreProductsTab(data.predefined.simpleProduct.product1.name, 'off');
    });

    // selling settings

    test('admin can enable vendor selling (selling settings)', { tag: ['@lite', '@guest'] }, async () => {
        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, new_seller_enable_selling: 'on' });
        await guest.enableVendorSelling('on');

        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, new_seller_enable_selling: 'off' });
        await guest.enableVendorSelling('off');
    });

    test('admin can set order status change capability (selling settings)', { tag: ['@lite', '@vendor'] }, async () => {
        apiUtils = new ApiUtils(await request.newContext());
        const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.onhold, payloads.vendorAuth);

        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, order_status_change: 'on' });
        await vendor.setOrderStatusChangeCapability(orderId, 'on');

        await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, order_status_change: 'off' });
        await vendor.setOrderStatusChangeCapability(orderId, 'off');
    });
});
