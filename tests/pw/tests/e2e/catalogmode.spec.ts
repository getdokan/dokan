import { test, request, Page } from '@playwright/test';
import { CatalogModePage } from '@pages/catalogModePage';
import { VendorSettingsPage } from '@pages/vendorSettingsPage';
import { ProductsPage } from '@pages/productsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { ShopPage } from '@pages/shopPage';
import { SingleStorePage } from '@pages/singleStorePage';

test.describe('Catalog mode test', () => {
    let admin: CatalogModePage;
    let vendor: CatalogModePage;
    let customer: CatalogModePage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let sellerId: string;
    let vendorName: string;
    let productName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new CatalogModePage(aPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new CatalogModePage(cPage);

        apiUtils = new ApiUtils(await request.newContext());

        [, sellerId, , vendorName] = await apiUtils.createStore(payloads.createStore(), payloads.adminAuth);

        const vendorContext = await browser.newContext(data.header.userAuth(vendorName));
        vPage = await vendorContext.newPage();
        vendor = new CatalogModePage(vPage);

        [, , productName] = await apiUtils.createProduct(helpers.deepMergeObjects(payloads.createProduct(), payloads.catalogMode), payloads.userAuth(vendorName));
    });

    test.afterAll(async () => {
        await aPage.close();
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    // admin

    test('admin can set catalog mode', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addCatalogMode();
    });

    test('admin can disable hide product price in catalog mode', { tag: ['@lite', '@admin'] }, async () => {
        const [previousSettings] = await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { catalog_mode_hide_product_price: 'off' });
        await vendor.accessCatalogModeSettings();

        // reset
        await dbUtils.setOptionValue(dbData.dokan.optionName.selling, previousSettings);
    });

    //vendor

    test('vendor can set catalog mode (storewide)', { tag: ['@lite', '@vendor'] }, async () => {
        const vendor = new VendorSettingsPage(vPage);
        await vendor.setStoreSettings(data.vendor.vendorInfo, 'catalog');
    });

    test('vendor can set catalog mode (single product)', { tag: ['@lite', '@vendor'] }, async () => {
        const [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.userAuth(vendorName));
        const vendor = new ProductsPage(vPage);
        await vendor.addProductCatalogMode(productName, true);
    });

    test('vendor can disable hide product price in catalog mode', { tag: ['@lite', '@admin'] }, async () => {
        test.skip(true, "dokan issue: vendor disable hide product price doesn't work");
        const [previousMeta] = await dbUtils.updateUserMeta(vendorName, 'dokan_profile_settings', { catalog_mode: { ...payloads.catalogModeSetting, hide_product_price: 'off' } });
        await customer.viewPriceInCatalogModeProduct(productName, vendorName, ShopPage, SingleStorePage);

        // reset
        await dbUtils.updateUserMeta(sellerId, 'dokan_profile_settings', previousMeta);
    });

    test('vendor can enable RFQ in catalog mode', { tag: ['@pro', '@admin'] }, async () => {
        const [previousMeta] = await dbUtils.updateUserMeta(sellerId, 'dokan_profile_settings', { catalog_mode: { ...payloads.catalogModeSetting, request_a_quote_enabled: 'on' } });
        const [, productId, productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.userAuth(vendorName));
        const [, quoteRuleId] = await apiUtils.createQuoteRule({ ...payloads.createQuoteRule(), product_ids: [productId] }, payloads.adminAuth);
        await dbUtils.updateQuoteRuleContent(quoteRuleId, { switches: { product_switch: 'true' } }); // todo: remove after api fix
        await customer.viewRfqInCatalogMode(productName, vendorName, ShopPage, SingleStorePage);

        // reset
        await dbUtils.updateUserMeta(sellerId, 'dokan_profile_settings', previousMeta);
    });

    //customer

    test('customer can view product in catalog mode', { tag: ['@lite', '@customer'] }, async () => {
        await customer.viewCatalogModeProduct(productName, vendorName, ShopPage, SingleStorePage);
    });
});
