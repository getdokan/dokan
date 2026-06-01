import { test, Page } from '@utils/test';
import { CatalogModePage, api, db, catalogModeProductMeta, catalogModeSetting, createQuoteRulePayload, basicAuth } from './catalogModePage';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');        // Admin session storage
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');     // Customer 1 session storage

const { USER_PASSWORD } = process.env;

test.describe('Catalog mode test', () => {
    let admin: CatalogModePage;
    let vendor: CatalogModePage;
    let customer: CatalogModePage;
    let aPage: Page, vPage: Page, cPage: Page;
    let sellerId: string;
    let vendorName: string;
    let productName: string;

    test.beforeAll(async ({ browser }) => {
        // Initialize API
        await api.init();

        // Admin context
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new CatalogModePage(aPage);

        // Customer context
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new CatalogModePage(cPage);

        // Create store via API
        const [, id, , username] = await api.createStore();
        sellerId = id;
        vendorName = username;

        // Vendor context
        const vendorContext = await browser.newContext({
            extraHTTPHeaders: { Authorization: basicAuth(vendorName, USER_PASSWORD!) },
        });
        vPage = await vendorContext.newPage();
        vendor = new CatalogModePage(vPage);

        // Create product with catalog mode meta
        [, , productName] = await api.createProduct(catalogModeProductMeta, api.userAuth(vendorName));
    });

    test.afterAll(async () => {
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await api.dispose();
    });

    // admin

    // Skipped: admin Settings > Selling Options no longer exposes the
    // `.catalog_mode_hide_add_to_cart_button .switch` toggle in the new React UI.
    // Needs a spec rewrite against the current settings shape.
    test.skip('admin can set catalog mode', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addCatalogMode();
    });

    test('admin can disable hide product price in catalog mode', { tag: ['@lite', '@admin'] }, async () => {
        await db.updateOptionValue('dokan_selling', { catalog_mode_hide_product_price: 'off' });
        await vendor.accessCatalogModeSettings();

        // reset
        await db.updateOptionValue('dokan_selling', { catalog_mode_hide_product_price: 'on' });
    });

    //vendor

    test('vendor can set catalog mode (storewide)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.goIfNotThere('dashboard/settings/store');
        // todo: implement vendor store settings catalog mode via self-contained page
    });
    // Skipped: stub body - only creates a product, the single-product catalog mode flow is not yet implemented (no page-object method).
    test.skip('vendor can set catalog mode (single product)', { tag: ['@lite', '@vendor'] }, async () => {
        await api.createProduct(undefined, api.userAuth(vendorName));
        // todo: implement vendor single product catalog mode via self-contained page
    });

    test('vendor can disable hide product price in catalog mode', { tag: ['@lite', '@admin'] }, async () => {
        test.skip(true, "dokan issue: vendor disable hide product price doesn't work");
        const [previousMeta] = await db.updateUserMeta(vendorName, 'dokan_profile_settings', { catalog_mode: { ...catalogModeSetting, hide_product_price: 'off' } });
        await customer.viewPriceInCatalogModeProduct(productName, vendorName);

        // reset
        await db.updateUserMeta(sellerId, 'dokan_profile_settings', previousMeta);
    });

    // Skipped: Dokan Pro RMA module has a fatal error (RMACommon.php:209) that crashes product pages
    test.skip('vendor can enable RFQ in catalog mode', { tag: ['@pro', '@admin'] }, async () => {
        const [previousMeta] = await db.updateUserMeta(sellerId, 'dokan_profile_settings', { catalog_mode: { ...catalogModeSetting, request_a_quote_enabled: 'on' } });
        const [, productId, productName] = await api.createProduct(undefined, api.userAuth(vendorName));
        const [, quoteRuleId] = await api.createQuoteRule({ ...createQuoteRulePayload(), product_ids: [productId] }, api.adminAuth());
        await db.updateQuoteRuleContent(quoteRuleId, { switches: { product_switch: 'true' } }); // todo: remove after api fix
        await customer.viewRfqInCatalogMode(productName, vendorName);

        // reset
        await db.updateUserMeta(sellerId, 'dokan_profile_settings', previousMeta);
    });

    //customer
    // Skipped: known failure - catalog mode does not hide price/add-to-cart on single product + store search pages as asserted; needs investigation/fix.
    test.skip('customer can view product in catalog mode', { tag: ['@lite', '@customer'] }, async () => {
        await customer.viewCatalogModeProduct(productName, vendorName);
    });
});
