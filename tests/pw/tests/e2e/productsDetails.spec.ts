import { test, request, Page } from '@playwright/test';
import { ProductsPage } from '@pages/productsPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { payloads } from '@utils/payloads';
import { responseBody } from '@utils/interfaces';
import { serialize } from 'php-serialize';

const { CATEGORY_ID } = process.env;

test.describe('Product details functionality test', () => {
    let vendor: ProductsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    let productResponseBody: responseBody;
    let productIdFull: string; // has all fields
    let productIdBasic: string; // has only required fields

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new ProductsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());

        // product with only required fields
        [, productIdBasic] = await apiUtils.createProduct(payloads.createProductRequiredFields(), payloads.vendorAuth);

        // product with all fields
        // const [, , mediaUrl] = await apiUtils.uploadMedia(data.image.avatar, payloads.mimeTypes.png, payloads.vendorAuth);
        // [productResponseBody, productIdFull] = await apiUtils.createProductWc({ ...payloads.createProductAllFields(), images: [{ src: mediaUrl }, { src: mediaUrl }] }, payloads.vendorAuth); // todo: mediaUrl is not working on git action
        [productResponseBody, productIdFull] = await apiUtils.createProductWc(payloads.createProductAllFields(), payloads.vendorAuth);
        await apiUtils.updateProduct(
            productIdFull,
            {
                meta_data: [
                    { key: '_product_addons', value: [payloads.createProductAddon()] },
                    { key: '_product_addons_exclude_global', value: '1' },
                ],
            },
            payloads.vendorAuth,
        );
    });

    test.afterAll(async () => {
        // await apiUtils.deleteAllProducts(payloads.vendorAuth);
        await vPage.close();
        await apiUtils.dispose();
    });

    // vendor

    // product title

    test('vendor can update product title', { tag: ['@lite', '@vendor'] }, async () => {
        const [, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await vendor.addProductTitle(productId, data.product.productInfo.title);
    });

    // product permalink

    test('vendor can update product permalink', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductPermalink(productIdFull, data.product.productInfo.permalink);
    });

    // product price

    test('vendor can add product price', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addPrice(productIdBasic, data.product.productInfo.price());
    });

    test('vendor can update product price', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addPrice(productIdFull, data.product.productInfo.price());
    });

    test('vendor can remove product price', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.removePrice(productIdFull);
    });

    // product discount price

    test('vendor can add product discount price', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addDiscount(productIdBasic, data.product.productInfo.discount);
    });

    test('vendor can add product discount price (with schedule)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addDiscount(productIdBasic, data.product.productInfo.discount, true);
    });

    test('vendor can update product discount price', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addDiscount(productIdFull, { ...data.product.productInfo.discount, regularPrice: productResponseBody.price });
    });

    test('vendor can update product discount price (with schedule)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addDiscount(productIdFull, { ...data.product.productInfo.discount, regularPrice: productResponseBody.price }, true, true);
    });

    test("vendor can't add product discount price higher than price", { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.cantAddGreaterDiscount(productIdFull, { ...data.product.productInfo.discount, regularPrice: productResponseBody.price });
    });

    test('vendor can remove product discount price', { tag: ['@lite', '@vendor'] }, async () => {
        const [, productId] = await apiUtils.createProduct({ ...payloads.createDiscountProduct(), date_on_sale_from: '', date_on_sale_to: '' }, payloads.vendorAuth);
        await vendor.removeDiscount(productId);
    });

    test('vendor can remove product discount schedule', { tag: ['@lite', '@vendor'] }, async () => {
        const [, productId] = await apiUtils.createProduct(payloads.createDiscountProduct(), payloads.vendorAuth);
        await vendor.removeDiscount(productId, true);
    });

    // product category

    test('vendor can update product category (single)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductCategory(productIdFull, [data.product.category.clothings]);
    });

    test('vendor can add product category (multiple)', { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { product_category_style: 'multiple' });
        await vendor.addProductCategory(productIdBasic, data.product.category.categories, true);
    });

    test('vendor can remove product category (multiple)', { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { product_category_style: 'multiple' });
        const uncategorizedId = await apiUtils.getCategoryId('Uncategorized', payloads.adminAuth);
        const [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), categories: [{ id: uncategorizedId }, { id: CATEGORY_ID }] }, payloads.vendorAuth); // need multiple categories
        await vendor.removeProductCategory(productId, [data.product.category.clothings]);
    });

    test('vendor can add multi-step product category (last category)', { tag: ['@lite', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { product_category_style: 'single' });
        await vendor.addProductCategory(productIdBasic, [data.product.category.multistepCategories.at(-1)!]);
    });

    test('vendor can add multi-step product category (any category)', { tag: ['@lite', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { dokan_any_category_selection: 'on' });
        await vendor.addProductCategory(productIdFull, [data.product.category.multistepCategories.at(-2)!]);
    });

    test("vendor can't add multi-step product category (any category)", { tag: ['@lite', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { dokan_any_category_selection: 'off' });
        await vendor.cantAddCategory(productIdFull, data.product.category.multistepCategories.at(-2)!);
    });

    // product tags

    test('vendor can add product tags', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductTags(productIdBasic, data.product.productInfo.tags.tags);
    });

    test('vendor can remove product tags', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.removeProductTags(productIdFull, data.product.productInfo.tags.tags);
    });

    test('vendor can create product tags', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductTags(productIdFull, data.product.productInfo.tags.randomTags);
    });

    // product cover image

    test('vendor can add product cover image', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductCoverImage(productIdBasic, data.product.productInfo.images.cover);
    });

    test('vendor can update product cover image', { tag: ['@lite', '@vendor'] }, async () => {
        // todo: need a product with cover image
        await vendor.addProductCoverImage(productIdFull, data.product.productInfo.images.cover);
        await vendor.addProductCoverImage(productIdFull, data.product.productInfo.images.cover, true);
    });

    test('vendor can remove product cover image', { tag: ['@lite', '@vendor'] }, async () => {
        // todo: need a product with cover image
        await vendor.addProductCoverImage(productIdFull, data.product.productInfo.images.cover, true);
        await vendor.removeProductCoverImage(productIdFull);
    });

    // product gallery image

    test('vendor can add product gallery image', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductGalleryImages(productIdBasic, data.product.productInfo.images.gallery);
    });

    test('vendor can update product gallery image', { tag: ['@lite', '@vendor'] }, async () => {
        // todo: need a product with gallery images
        await vendor.addProductGalleryImages(productIdFull, data.product.productInfo.images.gallery);
        await vendor.addProductGalleryImages(productIdFull, data.product.productInfo.images.gallery, true);
    });

    test('vendor can remove product gallery image', { tag: ['@lite', '@vendor'] }, async () => {
        // todo: need a product with gallery images
        await vendor.addProductGalleryImages(productIdFull, data.product.productInfo.images.gallery, true);
        await vendor.removeProductGalleryImages(productIdFull);
    });

    // product short description

    test('vendor can add product short description', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductShortDescription(productIdBasic, data.product.productInfo.description.shortDescription);
    });

    test('vendor can update product short description', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductShortDescription(productIdFull, data.product.productInfo.description.shortDescription);
    });

    test('vendor can remove product short description', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductShortDescription(productIdFull, '');
    });

    // product description

    test('vendor can update product description', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductDescription(productIdFull, data.product.productInfo.description.description);
    });

    // product downloadable options

    test('vendor can add product downloadable options', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductDownloadableOptions(productIdBasic, data.product.productInfo.downloadableOptions);
    });

    test('vendor can update product downloadable options', { tag: ['@lite', '@vendor'] }, async () => {
        // todo: need a product with downloadable file
        await vendor.addProductDownloadableOptions(productIdFull, data.product.productInfo.downloadableOptions);
    });

    test('vendor can remove product downloadable file', { tag: ['@lite', '@vendor'] }, async () => {
        // todo: need a product with downloadable file
        await vendor.addProductDownloadableOptions(productIdFull, data.product.productInfo.downloadableOptions);
        await vendor.removeDownloadableFile(productIdFull, { ...data.product.productInfo.downloadableOptions, downloadLimit: '', downloadExpiry: '' });
    });

    // product virtual options

    test('vendor can add product virtual option', { tag: ['@lite', '@vendor'] }, async () => {
        const [, productId] = await apiUtils.createProduct(payloads.createProductRequiredFields(), payloads.vendorAuth);
        await vendor.addProductVirtualOption(productId, true);
    });

    test('vendor can remove product virtual option', { tag: ['@lite', '@vendor'] }, async () => {
        const [, productId] = await apiUtils.createProduct({ ...payloads.createProductRequiredFields(), virtual: true }, payloads.vendorAuth);
        await vendor.addProductVirtualOption(productId, false);
    });

    // product inventory options

    test('vendor can add product inventory options (SKU)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdBasic, data.product.productInfo.inventory(), 'sku');
    });

    test('vendor can update product inventory options (SKU)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdFull, data.product.productInfo.inventory(), 'sku');
    });

    test('vendor can remove product inventory options (SKU)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdFull, { ...data.product.productInfo.inventory(), sku: '' }, 'sku');
    });

    test('vendor can add product inventory options (stock status)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdBasic, data.product.productInfo.inventory(), 'stock-status');
    });

    test('vendor can add product inventory options (stock management)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdBasic, data.product.productInfo.inventory(), 'stock-management');
    });

    test('vendor can update product inventory options (stock management)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdBasic, data.product.productInfo.inventory(), 'stock-management');
    });

    test('vendor can remove product inventory options (stock management)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.removeProductInventory(productIdFull);
    });

    test('vendor can add product inventory options (allow single quantity)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdBasic, data.product.productInfo.inventory(), 'one-quantity');
    });

    test('vendor can remove product inventory options (allow single quantity)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdFull, { ...data.product.productInfo.inventory(), oneQuantity: false }, 'one-quantity');
    });

    // product other options

    test('vendor can add product other options (product status)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductOtherOptions(productIdBasic, data.product.productInfo.otherOptions, 'status');
    });

    test('vendor can add product other options (visibility)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductOtherOptions(productIdBasic, data.product.productInfo.otherOptions, 'visibility');
    });

    test('vendor can add product other options (purchase note)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductOtherOptions(productIdBasic, data.product.productInfo.otherOptions, 'purchaseNote');
    });

    test('vendor can update product other options (purchase note)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductOtherOptions(productIdFull, data.product.productInfo.otherOptions, 'purchaseNote');
    });

    test('vendor can remove product other options (purchase note)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductOtherOptions(productIdFull, { ...data.product.productInfo.otherOptions, purchaseNote: '' }, 'purchaseNote');
    });

    test('vendor can add product other options (product review)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductOtherOptions(productIdBasic, data.product.productInfo.otherOptions, 'reviews');
    });

    test('vendor can remove product other options (product review)', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addProductOtherOptions(productIdFull, { ...data.product.productInfo.otherOptions, enableReview: false }, 'reviews');
    });

    // catalog mode

    // todo: move to catalog page

    test('vendor can add product catalog mode', { tag: ['@lite', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { catalog_mode_hide_add_to_cart_button: 'on' });
        await vendor.addProductCatalogMode(productIdBasic);
    });

    test('vendor can add product catalog mode (with price hidden)', { tag: ['@lite', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { catalog_mode_hide_add_to_cart_button: 'on', catalog_mode_hide_product_price: 'on' });
        await vendor.addProductCatalogMode(productIdBasic, true);
    });

    test('vendor can remove product catalog mode', { tag: ['@lite', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { catalog_mode_hide_add_to_cart_button: 'on', catalog_mode_hide_product_price: 'on' });
        await vendor.removeProductCatalogMode(productIdFull);
    });

    test('vendor can remove product catalog mode (price hidden option)', { tag: ['@lite', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { catalog_mode_hide_add_to_cart_button: 'on', catalog_mode_hide_product_price: 'on' });
        await vendor.removeProductCatalogMode(productIdFull, true);
    });

    // shipping and tax

    test('vendor can add product shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductShipping(productIdBasic, data.product.productInfo.shipping);
    });

    test('vendor can update product shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductShipping(productIdFull, data.product.productInfo.shipping);
    });

    test('vendor can remove product shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductShipping(productIdFull);
    });

    test('vendor can add product tax', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductTax(productIdBasic, data.product.productInfo.tax);
    });

    test('vendor can add product tax (with tax class)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductTax(productIdBasic, data.product.productInfo.tax, true);
    });

    // linked products

    test('vendor can add product linked products (up-sells)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductLinkedProducts(productIdBasic, data.product.productInfo.linkedProducts, 'up-sells');
    });

    test('vendor can add product linked products (cross-sells)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductLinkedProducts(productIdBasic, data.product.productInfo.linkedProducts, 'cross-sells');
    });

    test('vendor can remove product linked products (up-sells)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductLinkedProducts(productIdFull, data.product.productInfo.linkedProducts, 'up-sells');
    });

    test('vendor can remove product linked products (cross-sells)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductLinkedProducts(productIdFull, data.product.productInfo.linkedProducts, 'cross-sells');
    });

    // attribute

    test('vendor can add product attribute', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductAttribute(productIdBasic, data.product.productInfo.attribute);
    });

    test("vendor can't add already added product attribute", { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.cantAddAlreadyAddedAttribute(productIdFull, data.product.productInfo.attribute.attributeName);
    });

    // todo: refactor below tests

    test('vendor can create product attribute term', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , , attributeName] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.adminAuth);
        const [, productId] = await apiUtils.createProduct(payloads.createProduct(), payloads.vendorAuth);
        await vendor.addProductAttribute(productId, { ...data.product.productInfo.attribute, attributeName: attributeName }, true);
    });

    test('vendor can remove product attribute', { tag: ['@pro', '@vendor'] }, async () => {
        const [, attributeId, , attributeName, attributeTerm] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.adminAuth);
        const attributes = { id: attributeId, name: attributeName, options: [attributeTerm] };
        const [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), attributes: [attributes] }, payloads.vendorAuth);
        await vendor.removeProductAttribute(productId, attributeName);
    });

    test('vendor can remove product attribute term', { tag: ['@pro', '@vendor'] }, async () => {
        const [, attributeId, , attributeName, attributeTerm] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.adminAuth);
        const [, , , , attributeTerm2] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.adminAuth);
        const attributes = { id: attributeId, name: attributeName, options: [attributeTerm, attributeTerm2] };
        const [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), attributes: [attributes] }, payloads.vendorAuth);
        await vendor.removeProductAttributeTerm(productId, attributeName, attributeTerm2);
    });

    // discount options

    test('vendor can add product bulk discount options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductBulkDiscountOptions(productIdBasic, data.product.productInfo.quantityDiscount);
    });

    test('vendor can update product bulk discount options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductBulkDiscountOptions(productIdFull, data.product.productInfo.quantityDiscount);
    });

    test('vendor can remove product bulk discount options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductBulkDiscountOptions(productIdFull);
    });

    // geolocation

    test('vendor can add product geolocation (individual)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductGeolocation(productIdBasic, data.product.productInfo.geolocation);
    });

    test('vendor can update product geolocation (individual)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductGeolocation(productIdFull, data.product.productInfo.geolocation);
    });

    test('vendor can remove product geolocation (individual)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductGeolocation(productIdFull);
    });

    // EU compliance options
    // todo: duplicate test from euCompliance

    test.skip('vendor can add product EU compliance data', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductEuCompliance(productIdBasic, data.product.productInfo.euCompliance);
    });

    test.skip('vendor can update product EU compliance data', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductEuCompliance(productIdFull, data.product.productInfo.euCompliance);
    });

    test.skip('vendor can remove product EU compliance data', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductEuCompliance(productIdFull, { ...data.product.productInfo.euCompliance, productUnits: '', basePriceUnits: '', freeShipping: false, regularUnitPrice: '', saleUnitPrice: '', optionalMiniDescription: '' });
    });

    // addon
    // todo: duplicate test from product addons also has new tests

    test('vendor can add product addon', { tag: ['@pro', '@vendor'] }, async () => {
        test.slow();
        await vendor.addProductAddon(productIdBasic, data.product.productInfo.addon);
    });

    test('vendor can import product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const addon = payloads.createProductAddon();
        await vendor.importAddon(productIdBasic, serialize([addon]), addon.name);
    });

    test('vendor can export product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const [responseBody, productId] = await apiUtils.createProductWithAddon(payloads.createProduct(), [payloads.createProductAddon()], payloads.vendorAuth);
        await vendor.exportAddon(productId, serialize(apiUtils.getMetaDataValue(responseBody.meta_data, '_product_addons')));
    });

    test('vendor can remove product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , productId, addonNames] = await apiUtils.createProductWithAddon(payloads.createProduct(), [payloads.createProductAddon()], payloads.vendorAuth);
        await vendor.removeAddon(productId, addonNames[0] as string);
    });

    // rma options

    test('vendor can add product rma options (no warranty)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductRmaOptions(productIdBasic, { ...data.vendor.rma, type: 'no_warranty' });
    });

    test('vendor can add product rma options (warranty included limited)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductRmaOptions(productIdBasic, data.vendor.rma);
    });

    test('vendor can add product rma options (warranty included lifetime)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductRmaOptions(productIdBasic, { ...data.vendor.rma, length: 'lifetime' });
    });

    test('vendor can add product rma options (warranty as addon)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductRmaOptions(productIdBasic, { ...data.vendor.rma, type: 'addon_warranty' });
    });

    //todo: add update rma options tests

    test('vendor can remove product rma options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductRmaOptions(productIdFull);
    });

    // wholesale options

    test('vendor can add product wholesale options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductWholesaleOptions(productIdBasic, data.product.productInfo.wholesaleOption);
    });

    test('vendor can update product wholesale options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductWholesaleOptions(productIdFull, data.product.productInfo.wholesaleOption);
    });

    test('vendor can remove product wholesale options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductWholesaleOptions(productIdFull);
    });

    // mix-max options

    test('vendor can add product min-max options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductMinMaxOptions(productIdBasic, data.product.productInfo.minMax);
    });

    test('vendor can update product min-max options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductMinMaxOptions(productIdFull, data.product.productInfo.minMax);
    });

    test("vendor can't add product min limit grater than max limit", { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.cantAddGreaterMin(productIdFull, { minimumProductQuantity: '100', maximumProductQuantity: '50' });
    });

    test('vendor can remove product min-max options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductMinMaxOptions(productIdFull, { minimumProductQuantity: '', maximumProductQuantity: '' });
    });

    // todo: advertising
    // todo: rank math seo
    // todo: variation options
});
