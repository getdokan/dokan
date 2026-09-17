import { test, Page, Browser, request } from '@utils/test';
import { SettingPage, ApiUtils, dbData, dbUtils, data, helpers, payloads } from './settingPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const { CUSTOMER_ID, PRODUCT_ID } = process.env;

test.describe('Settings test', () => {
    let admin: SettingPage;
    let vendor: SettingPage;
    let customer: SettingPage;
    let guest: SettingPage;
    let aPage: Page, vPage: Page, cPage: Page, gPage: Page;
    let apiUtils: ApiUtils;
    let browserRef: Browser;

    test.beforeAll(async ({ browser }) => {
        browserRef = browser;
        // Real API request context (the inline `new ApiUtils(null)` in the tests
        // below had a null request and threw on the first REST call).
        apiUtils = new ApiUtils(await request.newContext());

        // Seeding for the "@lite show vendor info" test (:120): its single-product
        // "Vendor Info" tab asserts the vendor's `.store-address` node, which the
        // template (templates/global/product-tab.php) only renders when the product
        // author's `dokan_profile_settings['address']` is a NON-EMPTY array. Global
        // setup seeds vendor1 with an address, but a sibling spec sharing a CI shard
        // can clear it (leaving an empty `address` array) before this suite runs —
        // that drops `.store-address` and fails :120 while the store name / seller
        // name (which key off `store_name`) still render. Re-seed vendor1's store
        // name + address here so the test owns its prerequisite instead of trusting
        // ambient state. (Passes locally because the shared Docker still had the
        // address; a fresh CI shard does not.)
        //
        // Seed via a direct usermeta deep-merge (only the store_name + address keys)
        // rather than the REST updateStore: dokan's Manager::update() resets omitted
        // fields (e.g. it forces `enable_tnc`/`show_email` off when not supplied),
        // which would clobber the vendor's T&C setting and break the store T&C test.
        const vendor1Id = process.env.VENDOR_ID ?? (await apiUtils.getSellerId(payloads.createStore1.store_name, payloads.adminAuth));
        await dbUtils.updateUserMeta(vendor1Id, 'dokan_profile_settings', { store_name: payloads.createStore1.store_name, address: payloads.createStore1.address });

        // Deterministic setup for the "@pro enable T&C on registration" test:
        // the #tc_agree checkbox only renders when a Terms & Conditions page is
        // configured (seller-registration-form.php gates on
        // dokan_get_terms_condition_url()). Point reg_tc_page at the published
        // "Terms And Conditions" page (id 22).
        await dbUtils.updateOptionValue(dbData.dokan.optionName.page, { reg_tc_page: '22' });

        // These tests drive the CLASSIC vendor dashboard (they assert legacy
        // markers like `ul.dokan-dashboard-menu` and the classic seller-warning
        // notice). The default `vendor_layout_style` is the React "New UI"
        // ('latest'), which hides those legacy nodes, so pin the vendor
        // dashboard to the legacy layout for this suite (restored in afterAll).
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { vendor_layout_style: 'legacy' });

        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new SettingPage(aPage);

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new SettingPage(vPage);

        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new SettingPage(cPage);

        const guestContext = await browser.newContext();
        gPage = await guestContext.newPage();
        guest = new SettingPage(gPage);
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.general, dbData.dokan.generalSettings);
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
        // restore the default React "New UI" vendor dashboard
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, { vendor_layout_style: 'latest' });

        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await gPage?.close();
        await apiUtils?.dispose();
    });

    test('admin can set vendor store url (general settings)', { tag: ['@lite', '@admin', '@serial'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { custom_store_url: 'stores' });
        await helpers.exeCommandWpcli(data.commands.wpcli.rewritePermalink);
        await admin.vendorStoreUrlSetting(data.predefined.vendorStores.vendor1, 'stores');
        await dbUtils.setOptionValue(dbData.dokan.optionName.general, dbData.dokan.generalSettings);
        await helpers.exeCommandWpcli(data.commands.wpcli.rewritePermalink);
    });

    test('admin can set vendor setup wizard logo & message (general settings)', { tag: ['@lite', '@admin'] }, async () => {
        const [responseBody] = await apiUtils.uploadFile(data.image.dokan, payloads.adminAuth);
        const logoUrl = responseBody.source_url;
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { setup_wizard_logo_url: logoUrl, setup_wizard_message: dbData.testData.dokan.generalSettings.setup_wizard_message });
        await admin.vendorSetupWizardLogoAndMessageSetting(logoUrl, dbData.testData.dokan.generalSettings.setup_wizard_message_without_html);
    });

    test('admin can disable vendor setup wizard (general settings)', { tag: ['@lite', '@guest'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { disable_welcome_wizard: 'on' });
        await guest.disableVendorSetupWizardSetting();
    });

    test('admin can set store terms and conditions (general settings)', { tag: ['@lite', '@vendor'] }, async () => {
        // This option is GLOBAL and the test deliberately ends on 'off', which is NOT the seeded
        // default ('on'). Left that way it hides the store TOC tab for every later spec on the
        // shard — singleStore.spec.ts carries a defensive re-seed purely because of this. Capture
        // and restore so the on/off assertions stay, without the leak.
        const [originalGeneral] = await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { seller_enable_terms_and_conditions: 'on' });
        await vendor.setStoreTermsAndConditions('on');
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { seller_enable_terms_and_conditions: 'off' });
        await vendor.setStoreTermsAndConditions('off');
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { seller_enable_terms_and_conditions: originalGeneral?.seller_enable_terms_and_conditions ?? 'on' });
    });

    test('admin can set store products per page (general settings)', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { store_products_per_page: '1' });
        await customer.setStoreProductsPerPage(data.predefined.vendorStores.vendor1, 1);
    });

    test('admin can enable address fields on registration (general settings)', { tag: ['@lite', '@guest'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { enabled_address_on_reg: 'on' });
        await guest.enableAddressFieldsOnRegistration('on');
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { enabled_address_on_reg: 'off' });
        await guest.enableAddressFieldsOnRegistration('off');
    });

    test('admin can enable store terms and conditions on registration (general settings)', { tag: ['@pro', '@vendor'] }, async () => {
        // Checking the T&C checkbox on the vendor *registration* form is a guest
        // action: openVendorRegistrationForm() logs the actor out to reveal the
        // form. Driving this on the shared `vendor` context would log that
        // context out and break the later vendor-dashboard tests, so use `guest`.
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { enable_tc_on_reg: 'on' });
        await guest.enableStoreTermsAndConditionsOnRegistration('on');
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { enable_tc_on_reg: 'off' });
        await guest.enableStoreTermsAndConditionsOnRegistration('off');
    });

    test('admin can set show vendor info (general settings)', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { show_vendor_info: 'on' });
        await customer.setShowVendorInfo(data.predefined.simpleProduct.product1.name, 'on');
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { show_vendor_info: 'off' });
        await customer.setShowVendorInfo(data.predefined.simpleProduct.product1.name, 'off');
    });

    test('admin can enable more products tab (general settings)', { tag: ['@lite', '@customer'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { enabled_more_products_tab: 'on' });
        await customer.enableMoreProductsTab(data.predefined.simpleProduct.product1.name, 'on');
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { enabled_more_products_tab: 'off' });
        await customer.enableMoreProductsTab(data.predefined.simpleProduct.product1.name, 'off');
    });

    test('admin can enable vendor selling (selling settings)', { tag: ['@lite', '@guest'] }, async () => {
        // The "disable vendor setup wizard" test above turns `disable_welcome_wizard`
        // on and never resets it. This flow registers with the setup wizard enabled
        // (choice = not-right-now), so the wizard must actually appear — re-enable it
        // deterministically instead of inheriting the earlier test's state.
        await dbUtils.updateOptionValue(dbData.dokan.optionName.general, { disable_welcome_wizard: 'off' });

        // Each 'status' registers a fresh vendor, which logs that browser
        // context in and lands it on the dashboard. Re-using one context for
        // the second registration races the setup-wizard→dashboard redirect and
        // aborts the next my-account navigation (net::ERR_ABORTED), so give each
        // registration a pristine guest context.
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { new_seller_enable_selling: 'on' });
        const guestOn = new SettingPage(await (await browserRef.newContext()).newPage());
        await guestOn.enableVendorSelling('on');
        await guestOn.page.context().close();

        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { new_seller_enable_selling: 'off' });
        const guestOff = new SettingPage(await (await browserRef.newContext()).newPage());
        await guestOff.enableVendorSelling('off');
        await guestOff.page.context().close();
    });

    test('admin can set order status change capability (selling settings)', { tag: ['@lite', '@vendor'] }, async () => {
        const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.onhold, payloads.vendorAuth);
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { order_status_change: 'on' });
        await vendor.setOrderStatusChangeCapability(orderId, 'on');
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { order_status_change: 'off' });
        await vendor.setOrderStatusChangeCapability(orderId, 'off');
    });
});
