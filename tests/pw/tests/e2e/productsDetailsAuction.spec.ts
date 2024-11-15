import { test, request, Page } from '@playwright/test';
import { AuctionsPage } from '@pages/vendorAuctionsPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { payloads } from '@utils/payloads';
import { serialize } from 'php-serialize';

const { CATEGORY_ID } = process.env;

test.describe('Auction Product details functionality test', () => {
    let vendor: AuctionsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    let productIdFull: string; // has all fields
    let productIdBasic: string; // has only required fields

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new AuctionsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());

        // product with only required fields
        [, productIdBasic] = await apiUtils.createProduct(payloads.createAuctionProductRequiredFields(), payloads.vendorAuth);

        // product with all fields
        [, productIdFull] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendorAuth); //todo: need to add all fields
    });

    test.afterAll(async () => {
        // await apiUtils.deleteAllProducts(payloads.vendorAuth);
        await vPage.close();
        await apiUtils.dispose();
    });

    // vendor

    // product title

    test('vendor can update auction product title', { tag: ['@pro', '@vendor'] }, async () => {
        const [, productIdFull] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendorAuth);
        await vendor.addProductTitle(productIdFull, data.product.productInfo.title);
    });

    // product category

    test('vendor can update auction product category (single)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductCategory(productIdFull, [data.product.category.clothings]);
    });

    test('vendor can add auction product category (multiple)', { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { product_category_style: 'multiple' });
        await vendor.addProductCategory(productIdBasic, data.product.category.categories, true);
    });

    test('vendor can remove auction product category (multiple)', { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { product_category_style: 'multiple' });
        const uncategorizedId = await apiUtils.getCategoryId('Uncategorized', payloads.adminAuth);
        const [, productIdFull] = await apiUtils.createProduct({ ...payloads.createAuctionProduct(), categories: [{ id: uncategorizedId }, { id: CATEGORY_ID }] }, payloads.vendorAuth); // need multiple categories
        await vendor.removeProductCategory(productIdFull, [data.product.category.clothings]);
    });

    test('vendor can add multi-step auction product category (last category)', { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { product_category_style: 'single' });
        await vendor.addProductCategory(productIdBasic, [data.product.category.multistepCategories.at(-1)!]);
    });

    test('vendor can add multi-step auction product category (any category)', { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { dokan_any_category_selection: 'on' });
        await vendor.addProductCategory(productIdFull, [data.product.category.multistepCategories.at(-2)!]);
    });

    test("vendor can't add multi-step product category (any category)", { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { dokan_any_category_selection: 'off' });
        await vendor.cantAddCategory(productIdFull, data.product.category.multistepCategories.at(-2)!);
    });

    // product tags

    test('vendor can add auction product tags', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductTags(productIdBasic, data.product.productInfo.tags.tags);
    });

    test('vendor can remove auction product tags', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductTags(productIdFull, data.product.productInfo.tags.tags);
    });

    test('vendor can create auction product tags', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductTags(productIdFull, data.product.productInfo.tags.randomTags, true);
    });

    // product cover image

    test('vendor can add auction product cover image', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductCoverImage(productIdBasic, data.product.productInfo.images.cover);
    });

    test('vendor can update auction product cover image', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: need a product with cover image
        await vendor.addProductCoverImage(productIdFull, data.product.productInfo.images.cover);
        await vendor.addProductCoverImage(productIdFull, data.product.productInfo.images.cover, true);
    });

    test('vendor can remove auction product cover image', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: need a product with cover image
        await vendor.addProductCoverImage(productIdFull, data.product.productInfo.images.cover, true);
        await vendor.removeProductCoverImage(productIdFull);
    });

    // product gallery image

    test('vendor can add auction product gallery image', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductGalleryImages(productIdBasic, data.product.productInfo.images.gallery);
    });

    test('vendor can update auction product gallery image', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: need a product with gallery images
        await vendor.addProductGalleryImages(productIdFull, data.product.productInfo.images.gallery);
        await vendor.addProductGalleryImages(productIdFull, data.product.productInfo.images.gallery, true);
    });

    test('vendor can remove auction product gallery image', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: need a product with gallery images
        await vendor.addProductGalleryImages(productIdFull, data.product.productInfo.images.gallery, true);
        await vendor.removeProductGalleryImages(productIdFull);
    });

    // product short description

    test('vendor can add auction product short description', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductShortDescription(productIdBasic, data.product.productInfo.description.shortDescription);
    });

    test('vendor can update auction product short description', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductShortDescription(productIdFull, data.product.productInfo.description.shortDescription);
    });

    test('vendor can remove auction product short description', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductShortDescription(productIdFull, '');
    });

    // product description

    test('vendor can update auction product description', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductDescription(productIdFull, data.product.productInfo.description.description);
    });

    // product downloadable options

    test.skip('vendor can add auction product downloadable options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductDownloadableOptions(productIdBasic, data.product.productInfo.downloadableOptions);
    });

    test.skip('vendor can update auction product downloadable options', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: need a product with downloadable file
        await vendor.addProductDownloadableOptions(productIdFull, data.product.productInfo.downloadableOptions);
    });

    test.skip('vendor can remove auction product downloadable file', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: need a product with downloadable file
        test.skip(true, 'Has Dokan Issue download limit & expiry doesnt reset');
        await vendor.addProductDownloadableOptions(productIdFull, data.product.productInfo.downloadableOptions);
        await vendor.removeDownloadableFile(productIdFull, { ...data.product.productInfo.downloadableOptions, downloadLimit: '', downloadExpiry: '' });
    });

    // product virtual options

    test('vendor can add product virtual option', { tag: ['@pro', '@vendor'] }, async () => {
        const [, productIdFull] = await apiUtils.createProduct(payloads.createAuctionProductRequiredFields(), payloads.vendorAuth);
        await vendor.addProductVirtualOption(productIdFull, true);
    });

    test('vendor can remove product virtual option', { tag: ['@pro', '@vendor'] }, async () => {
        const [, productIdFull] = await apiUtils.createProduct({ ...payloads.createAuctionProductRequiredFields(), virtual: true }, payloads.vendorAuth);
        await vendor.addProductVirtualOption(productIdFull, false);
    });

    test('vendor can update product general options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductGeneralOption(productIdBasic, { ...data.product.auction, itemCondition: 'used', auctionType: 'reverse' });
    });

    // product inventory options

    test('vendor can add auction product inventory options (SKU)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdBasic, data.product.productInfo.inventory());
    });

    test('vendor can update auction product inventory options (SKU)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdFull, data.product.productInfo.inventory());
    });

    test('vendor can remove auction product inventory options (SKU)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdFull, { ...data.product.productInfo.inventory(), sku: '' });
    });

    // product other options

    test('vendor can add auction product other options (product status)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductOtherOptions(productIdBasic, data.product.productInfo.otherOptions, 'status');
    });

    test('vendor can add auction product other options (visibility)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductOtherOptions(productIdBasic, data.product.productInfo.otherOptions, 'visibility');
    });

    // shipping and tax

    test('vendor can add auction product shipping', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(true, 'has dokan issue, php notice');
        await vendor.addProductShipping(productIdBasic, data.product.productInfo.shipping);
    });

    test('vendor can update auction product shipping', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(true, 'has dokan issue, php notice');
        await vendor.addProductShipping(productIdFull, data.product.productInfo.shipping);
    });

    test('vendor can remove auction product shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductShipping(productIdFull);
    });

    test('vendor can add auction product tax', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductTax(productIdBasic, data.product.productInfo.tax);
    });

    test('vendor can add auction product tax (with tax class)', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(true, 'Has Dokan Issue');
        await vendor.addProductTax(productIdBasic, data.product.productInfo.tax, true);
    });

    // attribute

    test('vendor can add auction product attribute', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductAttribute(productIdBasic, data.product.productInfo.attribute);
    });

    test("vendor can't add already added auction product attribute", { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.cantAddAlreadyAddedAttribute(productIdFull, data.product.productInfo.attribute.attributeName);
    });

    // todo: refactor below tests
    
    test('vendor can create auction product attribute term', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , , attributeName] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.adminAuth);
        const [, productIdFull] = await apiUtils.createProduct(payloads.createAuctionProductRequiredFields(), payloads.vendorAuth);
        await vendor.addProductAttribute(productIdFull, { ...data.product.productInfo.attribute, attributeName: attributeName }, true);
    });

    test('vendor can remove auction product attribute', { tag: ['@pro', '@vendor'] }, async () => {
        const [, attributeId, , attributeName, attributeTerm] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.adminAuth);
        const attributes = { id: attributeId, name: attributeName, options: [attributeTerm] };
        const [, productIdFull] = await apiUtils.createProduct({ ...payloads.createAuctionProduct(), attributes: [attributes] }, payloads.vendorAuth);
        await vendor.removeProductAttribute(productIdFull, attributeName);
    });

    test('vendor can remove auction product attribute term', { tag: ['@pro', '@vendor'] }, async () => {
        const [, attributeId, , attributeName, attributeTerm] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.adminAuth);
        const [, , , , attributeTerm2] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.adminAuth);
        const attributes = { id: attributeId, name: attributeName, options: [attributeTerm, attributeTerm2] };
        const [, productIdFull] = await apiUtils.createProduct({ ...payloads.createAuctionProduct(), attributes: [attributes] }, payloads.vendorAuth);
        await vendor.removeProductAttributeTerm(productIdFull, attributeName, attributeTerm2);
    });

    // geolocation

    test('vendor can add auction product geolocation (individual)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductGeolocation(productIdBasic, data.product.productInfo.geolocation);
    });

    test('vendor can update auction product geolocation (individual)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductGeolocation(productIdFull, data.product.productInfo.geolocation);
    });

    test('vendor can remove auction product geolocation (individual)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductGeolocation(productIdFull);
    });

    // addon

    test('vendor can add product addon', { tag: ['@pro', '@vendor'] }, async () => {
        test.slow();
        await vendor.addProductAddon(productIdBasic, data.product.productInfo.addon);
    });

    // todo: add update product addon test in all product edit test files

    test('vendor can import auction product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const addon = payloads.createProductAddon();
        await vendor.importAddon(productIdBasic, serialize([addon]), addon.name);
    });

    test('vendor can export auction product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const [responseBody, productIdFull] = await apiUtils.createProductWithAddon(payloads.createAuctionProduct(), [payloads.createProductAddon()], payloads.vendorAuth);
        await vendor.exportAddon(productIdFull, serialize(apiUtils.getMetaDataValue(responseBody.meta_data, '_product_addons')));
    });

    test('vendor can remove auction product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const [, productIdFull, , addonNames] = await apiUtils.createProductWithAddon(payloads.createAuctionProduct(), [payloads.createProductAddon()], payloads.vendorAuth);
        await vendor.removeAddon(productIdFull, addonNames[0] as string);
    });
});
