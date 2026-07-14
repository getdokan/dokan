import { test, Page } from '@utils/test';
import { ProductsPage, api, productData, predefined } from './productsPage';
import { dbUtils } from '@utils/dbUtils';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('Product functionality test', () => {
    let admin: ProductsPage;
    let vendor: ProductsPage;
    let aPage: Page, vPage: Page;
    let productName: string;

    test.beforeAll(async ({ browser }) => {
        // Catalog Mode vendor controls only render on the add-product page when the admin has enabled them.
        await dbUtils.updateOptionValue('dokan_selling', { catalog_mode_hide_add_to_cart_button: 'on', catalog_mode_hide_product_price: 'on' });
        // Ensure the vendor's own catalog-mode toggles are off so enabling the admin feature above does not
        // hide price/add-to-cart on the vendor's storefront products (asserted by the view-product test).
        const dbPrefix = process.env.DB_PREFIX;
        const [vendorRow] = await dbUtils.dbQuery(`SELECT ID FROM ${dbPrefix}_users WHERE user_login = ?`, [process.env.VENDOR]);
        await dbUtils.updateUserMeta(String(vendorRow.ID), 'dokan_profile_settings', { catalog_mode: { hide_add_to_cart_button: 'off', hide_product_price: 'off' } });

        await api.init();

        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ProductsPage(aPage);

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new ProductsPage(vPage);

        [, , productName] = await api.createProduct(undefined, api.vendorAuth());
    });

    test.afterAll(async () => {
        await aPage?.close();
        await vPage?.close();
        await api.dispose();
    });

    //admin

    test('admin can add product category', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addCategory(productData.category.randomCategory());
    });

    test('admin can add product attribute', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addAttribute(productData.attribute.randomAttribute());
    });

    test('admin can add simple product', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addSimpleProduct(productData.simple);
    });

    test('admin can add variable product', { tag: ['@pro', '@admin'] }, async () => {
        test.slow();
        await admin.addVariableProduct(productData.variable);
    });

    test('admin can add simple subscription product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addSimpleSubscription(productData.simpleSubscription);
    });

    test('admin can add variable subscription product', { tag: ['@pro', '@admin'] }, async () => {
        test.slow();
        await admin.addVariableSubscription(productData.variableSubscription);
    });

    test('admin can add external product', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addExternalProduct(productData.external);
    });

    test('admin can add vendor subscription', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addDokanSubscription(productData.vendorSubscription);
    });

    // vendors

    test('vendor can view product menu page', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorProductsRenderProperly();
    });

    test('vendor can view add new product page', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.vendorAddNewProductRenderProperly();
    });

    // add products

    test('vendor can add simple product', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.vendorAddSimpleProduct(productData.simple);
    });

    test('vendor can add variable product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorAddVariableProduct(productData.variable);
    });

    test('vendor can add simple subscription product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorAddSimpleSubscription(productData.simpleSubscription);
    });

    test('vendor can add variable subscription product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorAddVariableSubscription(productData.variableSubscription);
    });

    test('vendor can add external product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorAddExternalProduct(productData.external);
    });

    test('vendor can add group product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorAddGroupProduct(productData.grouped);
    });

    test('vendor can add downloadable product', { tag: ['@lite', '@vendor'] }, async () => {
        test.slow();
        await vendor.vendorAddDownloadableProduct(productData.downloadable);
    });

    test('vendor can add virtual product', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.vendorAddVirtualProduct(productData.simple);
    });

    // product page options

    test('vendor can search product', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.searchProduct(predefined.simpleProduct.product1.name);
    });

    test('vendor can filter products by date', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.filterProducts('by-date', '1');
    });

    test('vendor can filter products by category', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.filterProducts('by-category', 'Uncategorized');
    });

    test('vendor can filter products by type', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterProducts('by-type', 'simple');
    });

    test('vendor can filter products by other', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.filterProducts('by-other', 'featured');
    });

    test('vendor can reset filter', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.resetFilter();
    });

    test('vendor can import products', { tag: ['@pro', '@vendor'] }, async () => {
        await api.deleteAllProducts('p0_v1', api.vendorAuth());
        await vendor.importProducts('utils/sampleData/products.csv');
    });

    test('vendor can export products', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.exportProducts();
    });

    test('vendor can duplicate product', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , pName] = await api.createProduct(undefined, api.vendorAuth());
        await vendor.duplicateProduct(pName);
    });

    test('vendor can permanently delete product', { tag: ['@lite', '@vendor'] }, async () => {
        const [, , pName] = await api.createProduct(undefined, api.vendorAuth());
        await vendor.permanentlyDeleteProduct(pName);
    });

    test('vendor can view product', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.viewProduct(productName);
    });

    test.skip("vendor can't add product without required fields", { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductWithoutRequiredFields(productData.simple);
    });

    test("vendor can't buy own product", { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.cantBuyOwnProduct(productName);
    });

    test('vendor can edit product', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.editProduct({ ...productData.simple, editProduct: productName });
    });

    test('vendor can quick edit product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.quickEditProduct({ ...productData.simple, editProduct: productName });
    });
});
