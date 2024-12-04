import { test, request, Page } from '@playwright/test';
import { ProductsPage } from '@pages/productsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

test.describe('Product functionality test', () => {
    let admin: ProductsPage;
    let vendor: ProductsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let productName: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new ProductsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new ProductsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
    });

    test.afterAll(async () => {
        // await apiUtils.deleteAllProducts(payloads.vendorAuth);
        await aPage.close();
        await vPage.close();
        await apiUtils.dispose();
    });

    //admin

    test('admin can add product category', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addCategory(data.product.category.randomCategory());
    });

    test('admin can add product attribute', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addAttribute(data.product.attribute.randomAttribute());
    });

    test('admin can add simple product', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addSimpleProduct(data.product.simple);
    });

    test.skip('admin can add variable product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addVariableProduct(data.product.variable);
    });

    test('admin can add simple subscription product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addSimpleSubscription(data.product.simpleSubscription);
    });

    test.skip('admin can add variable subscription product', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addVariableSubscription(data.product.variableSubscription);
    });

    test('admin can add external product', { tag: ['@lite', '@admin'] }, async () => {
        await admin.addExternalProduct(data.product.external);
    });

    test.skip('admin can add vendor subscription', { tag: ['@pro', '@admin'] }, async () => {
        await admin.addDokanSubscription(data.product.vendorSubscription);
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
        await vendor.vendorAddSimpleProduct(data.product.simple);
    });

    test('vendor can add variable product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorAddVariableProduct(data.product.variable);
    });

    test('vendor can add simple subscription product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorAddSimpleSubscription(data.product.simpleSubscription);
    });

    test('vendor can add variable subscription product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorAddVariableSubscription(data.product.variableSubscription);
    });

    test('vendor can add external product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorAddExternalProduct(data.product.external);
    });

    test('vendor can add group product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorAddGroupProduct(data.product.grouped);
    });

    test('vendor can add downloadable product', { tag: ['@lite', '@vendor'] }, async () => {
        test.slow();
        await vendor.vendorAddDownloadableProduct(data.product.downloadable);
    });

    test('vendor can add virtual product', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.vendorAddVirtualProduct(data.product.virtual);
    });

    // product page options

    test('vendor can search product', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.searchProduct(data.predefined.simpleProduct.product1.name);
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
        await apiUtils.deleteAllProducts('p0_v1', payloads.vendorAuth);
        await vendor.importProducts('utils/sampleData/products.csv');
    });

    test('vendor can export products', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.exportProducts();
    });

    test('vendor can duplicate product', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await vendor.duplicateProduct(productName);
    });

    test('vendor can permanently delete product', { tag: ['@lite', '@vendor'] }, async () => {
        const [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await vendor.permanentlyDeleteProduct(productName);
    });

    test('vendor can view product', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.viewProduct(productName);
    });

    test.skip("vendor can't add product without required fields", { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductWithoutRequiredFields(data.product.simple);
    });

    test("vendor can't buy own product", { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.cantBuyOwnProduct(productName);
    });

    test('vendor can edit product', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.editProduct({ ...data.product.simple, editProduct: productName });
    });

    test('vendor can quick edit product', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.quickEditProduct({ ...data.product.simple, editProduct: productName });
    });
});
