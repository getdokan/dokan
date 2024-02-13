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
        await aPage.close();
        await vPage.close();
        await apiUtils.dispose();
    });

    test('admin can add product category @lite @a', async () => {
        await admin.addCategory(data.product.category.randomCategory());
    });

    test('admin can add product attribute @lite @a', async () => {
        await admin.addAttribute(data.product.attribute.randomAttribute());
    });

    test('admin can add simple product @lite @a', async () => {
        await admin.addSimpleProduct(data.product.simple);
    });

    // test('admin can add variable product @pro @a', async ( ) => {
    // 	await admin.addVariableProduct(data.product.variable);
    // });

    test('admin can add simple subscription @pro @a', async () => {
        await admin.addSimpleSubscription(data.product.simpleSubscription);
    });

    // test('admin can add variable subscription @pro @a', async ( ) => {
    // 	await admin.addVariableSubscription(data.product.variableSubscription);
    // });

    test('admin can add external product @lite @a', async () => {
        await admin.addExternalProduct(data.product.external);
    });

    test('admin can add vendor subscription @pro @a', async () => {
        await admin.addDokanSubscription(data.product.vendorSubscription);
    });

    // vendors

    // todo: move create product in separate files, or product functionality to another page

    test('vendor can add simple product @lite @v', async () => {
        await vendor.vendorAddSimpleProduct(data.product.simple, false);
    });

    test('vendor can add variable product @pro @v', async () => {
        await vendor.vendorAddVariableProduct(data.product.variable, false);
    });

    test('vendor can add simple subscription product @pro @v', async () => {
        await vendor.vendorAddSimpleSubscription(data.product.simpleSubscription, false);
    });

    test('vendor can add variable subscription product @pro @v', async () => {
        await vendor.vendorAddVariableSubscription(data.product.variableSubscription, false);
    });

    test('vendor can add external product @pro @v', async () => {
        await vendor.vendorAddExternalProduct(data.product.external, false);
    });

    test('vendor can add downloadable product @lite @v', async () => {
        await vendor.vendorAddDownloadableProduct(data.product.downloadable, false);
    });

    test('vendor can add virtual product @lite @v', async () => {
        await vendor.vendorAddVirtualProduct(data.product.virtual, false);
    });

    test('vendor can add product category @lite @v', async () => {
        await vendor.vendorAddProductCategory(data.predefined.simpleProduct.product1.name, data.product.category.unCategorized);
    });

    // todo: move to other files: product categories
    // todo: add multistep product categories test
    // todo: add product categories settings test

    test('vendor product menu page is rendering properly @lite @exp @v', async () => {
        await vendor.vendorProductsRenderProperly();
    });

    test('vendor can export products @pro @v', async () => {
        await vendor.exportProducts();
    });

    test('vendor can search product @lite @v', async () => {
        await vendor.searchProduct(data.predefined.simpleProduct.product1.name);
    });

    test('vendor can filter products by date @lite @v', async () => {
        await vendor.filterProducts('by-date', '1');
    });

    test('vendor can filter products by category @lite @v', async () => {
        await vendor.filterProducts('by-category', 'Uncategorized');
    });

    test('vendor can filter products by type @pro @v', async () => {
        await vendor.filterProducts('by-type', 'simple');
    });

    test('vendor can filter products by other @pro @v', async () => {
        await vendor.filterProducts('by-other', 'featured');
    });

    test('vendor can view product @lite @v', async () => {
        await vendor.viewProduct(data.predefined.simpleProduct.product1.name);
    });

    test("vendor can't buy own product @pro @v", async () => {
        await vendor.cantBuyOwnProduct(productName);
    });

    test('vendor can edit product @lite @v', async () => {
        await vendor.editProduct({ ...data.product.simple, editProduct: productName });
    });

    test('vendor can quick edit product @pro @v', async () => {
        await vendor.quickEditProduct({ ...data.product.simple, editProduct: productName });
    });

    test('vendor can add product description @lite @v', async () => {
        await vendor.addProductDescription(productName, data.product.productInfo.description);
    });

    // test('vendor can add product quantity discount @pro @v', async ( ) => {
    // 	await vendor.addProductQuantityDiscount(data.predefined.simpleProduct.product1.name, data.product.productInfo.quantityDiscount);
    // });

    test('vendor can add product rma options @pro @v', async () => {
        await vendor.addProductRmaOptions(productName, data.vendor.rma);
    });

    test('vendor can add product wholesale options @pro @v', async () => {
        await vendor.addProductWholesaleOptions(productName, data.product.productInfo.wholesaleOption);
    });

    test.skip('vendor can add product min-max options @pro @v', async () => {
        await vendor.addProductMinMaxOptions(productName, data.product.productInfo.minMax);
    });

    test('vendor can add product other options @lite @v', async () => {
        await vendor.addProductOtherOptions(productName, data.product.productInfo.otherOptions);
    });

    test.skip('vendor can add catalog mode @lite @v', async () => {
        await vendor.addCatalogMode(productName);
    });

    // todo: add more product edit tests -> discount, wholesale, advertising

    test('vendor can duplicate product @pro @v', async () => {
        await vendor.duplicateProduct(productName);
    });

    test('vendor can permanently delete product @lite @v', async () => {
        const [, , productName] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await vendor.permanentlyDeleteProduct(productName);
    });
});
