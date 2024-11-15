import { test, request, Page } from '@playwright/test';
import { BookingPage } from '@pages/vendorBookingPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';
import { payloads } from '@utils/payloads';
import { serialize } from 'php-serialize';

const { CATEGORY_ID } = process.env;

test.describe('Booking Product details functionality test', () => {
    let vendor: BookingPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    let productIdFull: string; // has all fields
    let productIdBasic: string; // has only required fields

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new BookingPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());

        // product with only required fields
        [, productIdBasic] = await apiUtils.createBookableProduct(payloads.createBookableProductRequiredFields(), payloads.vendorAuth);

        // product with all fields
        [, productIdFull] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth); //todo: need to add all fields
    });

    test.afterAll(async () => {
        // await apiUtils.deleteAllProducts(payloads.vendorAuth);
        await vPage.close();
        await apiUtils.dispose();
    });

    // vendor

    // product title

    test('vendor can update booking product title', { tag: ['@pro', '@vendor'] }, async () => {
        const [, productIdFull] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
        await vendor.addProductTitle(productIdFull, data.product.productInfo.title);
    });

    // product category

    test('vendor can update booking product category (single)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductCategory(productIdFull, [data.product.category.clothings]);
    });

    test('vendor can add booking product category (multiple)', { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { product_category_style: 'multiple' });
        await vendor.addProductCategory(productIdBasic, data.product.category.categories, true);
    });

    test('vendor can remove booking product category (multiple)', { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { product_category_style: 'multiple' });
        const uncategorizedId = await apiUtils.getCategoryId('Uncategorized', payloads.adminAuth);
        const [, productIdFull] = await apiUtils.createProduct({ ...payloads.createBookableProduct(), categories: [{ id: uncategorizedId }, { id: CATEGORY_ID }] }, payloads.vendorAuth); // need multiple categories
        await vendor.removeProductCategory(productIdFull, [data.product.category.clothings]);
    });

    test('vendor can add multi-step booking product category (last category)', { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { product_category_style: 'single' });
        await vendor.addProductCategory(productIdBasic, [data.product.category.multistepCategories.at(-1)!]);
    });

    test('vendor can add multi-step booking product category (any category)', { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { dokan_any_category_selection: 'on' });
        await vendor.addProductCategory(productIdFull, [data.product.category.multistepCategories.at(-2)!]);
    });

    test("vendor can't add multi-step product category (any category)", { tag: ['@pro', '@vendor'] }, async () => {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.selling, { dokan_any_category_selection: 'off' });
        await vendor.cantAddCategory(productIdFull, data.product.category.multistepCategories.at(-2)!);
    });

    // product tags

    test('vendor can add booking product tags', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(true, 'dokan issue option does not work');
        await vendor.addProductTags(productIdBasic, data.product.productInfo.tags.tags);
    });

    test('vendor can remove booking product tags', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(true, 'dokan issue option does not work');
        await vendor.removeProductTags(productIdFull, data.product.productInfo.tags.tags);
    });

    test('vendor can create booking product tags', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(true, 'dokan issue option does not work');
        await vendor.addProductTags(productIdFull, data.product.productInfo.tags.randomTags);
    });

    // product cover image

    test('vendor can add booking product cover image', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductCoverImage(productIdBasic, data.product.productInfo.images.cover);
    });

    test('vendor can update booking product cover image', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: need a product with cover image
        await vendor.addProductCoverImage(productIdFull, data.product.productInfo.images.cover);
        await vendor.addProductCoverImage(productIdFull, data.product.productInfo.images.cover, true);
    });

    test('vendor can remove booking product cover image', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: need a product with cover image
        await vendor.addProductCoverImage(productIdFull, data.product.productInfo.images.cover, true);
        await vendor.removeProductCoverImage(productIdFull);
    });

    // product gallery image

    test('vendor can add booking product gallery image', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductGalleryImages(productIdBasic, data.product.productInfo.images.gallery);
    });

    test('vendor can update booking product gallery image', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: need a product with gallery images
        await vendor.addProductGalleryImages(productIdFull, data.product.productInfo.images.gallery);
        await vendor.addProductGalleryImages(productIdFull, data.product.productInfo.images.gallery, true);
    });

    test('vendor can remove booking product gallery image', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: need a product with gallery images
        await vendor.addProductGalleryImages(productIdFull, data.product.productInfo.images.gallery, true);
        await vendor.removeProductGalleryImages(productIdFull);
    });

    // product short description
    test('vendor can add booking product short description', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductShortDescription(productIdBasic, data.product.productInfo.description.shortDescription);
    });

    test('vendor can update booking product short description', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductShortDescription(productIdFull, data.product.productInfo.description.shortDescription);
    });

    test('vendor can remove booking product short description', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductShortDescription(productIdFull, '');
    });

    // product description

    test('vendor can update booking product description', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductDescription(productIdFull, data.product.productInfo.description.description);
    });

    // product virtual options

    test('vendor can add product virtual option', { tag: ['@pro', '@vendor'] }, async () => {
        const [, productIdFull] = await apiUtils.createProduct(payloads.createBookableProductRequiredFields(), payloads.vendorAuth);
        await vendor.addProductVirtualOption(productIdFull, true);
    });

    test('vendor can remove product virtual option', { tag: ['@pro', '@vendor'] }, async () => {
        const [, productIdFull] = await apiUtils.createProduct({ ...payloads.createBookableProductRequiredFields(), virtual: true }, payloads.vendorAuth);
        await vendor.addProductVirtualOption(productIdFull, false);
    });

    // product inventory options

    test('vendor can add product inventory options (SKU)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdBasic, data.product.productInfo.inventory(), 'sku');
    });

    test('vendor can update product inventory options (SKU)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdFull, data.product.productInfo.inventory(), 'sku');
    });

    test('vendor can remove product inventory options (SKU)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdFull, { ...data.product.productInfo.inventory(), sku: '' }, 'sku');
    });

    test('vendor can add product inventory options (stock status)', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(true, 'dokan issue option does not work');
        await vendor.addProductInventory(productIdBasic, data.product.productInfo.inventory(), 'stock-status');
    });

    test('vendor can add product inventory options (stock management)', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(true, 'dokan issue option does not work');
        await vendor.addProductInventory(productIdBasic, data.product.productInfo.inventory(), 'stock-management');
    });

    test('vendor can update product inventory options (stock management)', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(true, 'dokan issue option does not work');
        await vendor.addProductInventory(productIdBasic, data.product.productInfo.inventory(), 'stock-management');
    });

    test('vendor can remove product inventory options (stock management)', { tag: ['@pro', '@vendor'] }, async () => {
        test.skip(true, 'dokan issue option does not work');
        await vendor.removeProductInventory(productIdFull);
    });

    test('vendor can add product inventory options (allow single quantity)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdBasic, data.product.productInfo.inventory(), 'one-quantity');
    });

    test('vendor can remove product inventory options (allow single quantity)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductInventory(productIdFull, { ...data.product.productInfo.inventory(), oneQuantity: false }, 'one-quantity');
    });

    // product other options

    test('vendor can add booking product other options (product status)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductOtherOptions(productIdBasic, data.product.productInfo.otherOptions, 'status');
    });

    test('vendor can add booking product other options (visibility)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductOtherOptions(productIdBasic, data.product.productInfo.otherOptions, 'visibility');
    });

    // shipping and tax

    test('vendor can add booking product shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductShipping(productIdBasic, data.product.productInfo.shipping);
    });

    test('vendor can update booking product shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductShipping(productIdFull, data.product.productInfo.shipping);
    });

    test('vendor can remove booking product shipping', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductShipping(productIdFull);
    });

    test('vendor can add booking product tax', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductTax(productIdBasic, data.product.productInfo.tax);
    });

    test('vendor can add booking product tax (with tax class)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductTax(productIdBasic, data.product.productInfo.tax, true);
    });

    // booking duration

    test('vendor can add booking product duration', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductDuration(productIdBasic, data.product.booking.duration);
    });

    test('vendor can update booking product duration', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductDuration(productIdBasic, { bookingDurationType: 'customer', bookingDuration: '3', bookingDurationUnit: 'month', bookingDurationMin: '2', bookingDurationMax: '30' });
    });

    test('vendor can add booking product basic options', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductBasicOptions(productIdBasic, data.product.booking);
    });

    // availability

    test('vendor can add booking product availability', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductAvailability(productIdBasic, data.product.booking.availability);
    });

    test('vendor can update booking product availability', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductAvailability(productIdBasic, {
            maxBookingsPerBlock: '10',
            minimumBookingWindowIntoTheFutureDate: '1',
            minimumBookingWindowIntoTheFutureDateUnit: 'week',
            maximumBookingWindowIntoTheFutureDate: '10',
            maximumBookingWindowIntoTheFutureDateUnit: 'week',
            requireABufferPeriodOfMonthsBetweenBookings: '2',
            allDatesAvailability: 'non-available',
            checkRulesAgainst: 'start',
        });
    });

    // costs

    test('vendor can add booking product costs', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductCosts(productIdBasic, data.product.booking.costs);
    });

    test('vendor can update booking product costs', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductCosts(productIdFull, { baseCost: '10', blockCost: '20', displayCost: '30' });
    });

    test('vendor can remove booking product costs', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductCosts(productIdFull, { baseCost: '0', blockCost: '0', displayCost: '0' });
    });

    // extra options

    test('vendor can add booking product extra options (persons)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductPersons(productIdBasic, data.product.booking.extraOptions);
    });

    test('vendor can add booking product extra options (person type)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductPersonType(productIdFull, data.product.booking.extraOptions);
    });

    test('vendor can update booking product extra options (person type)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductPersonType(productIdFull, data.product.booking.extraOptions);
    });

    test('vendor can remove booking product extra options (person type)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductPersons(productIdFull, data.product.booking.extraOptions);
        await vendor.removeProductPersonType(productIdFull);
    });

    test('vendor can add booking product extra options (resource)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductResources(productIdBasic, data.product.booking.extraOptions);
    });

    test('vendor can update booking product extra options (resource)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductResources(productIdFull, data.product.booking.extraOptions);
    });

    test('vendor can remove booking product extra options (resource)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductResources(productIdFull, data.product.booking.extraOptions);
        await vendor.removeProductResource(productIdFull);
    });

    // attribute

    test('vendor can add booking product attribute', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductAttribute(productIdBasic, data.product.productInfo.attribute);
    });

    test("vendor can't add already added booking product attribute", { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.cantAddAlreadyAddedAttribute(productIdFull, data.product.productInfo.attribute.attributeName);
    });

    // todo: refactor below tests

    test('vendor can create booking product attribute term', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , , attributeName] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.adminAuth);
        const [, productIdFull] = await apiUtils.createProduct(payloads.createAuctionProduct(), payloads.vendorAuth);
        await vendor.addProductAttribute(productIdFull, { ...data.product.productInfo.attribute, attributeName: attributeName }, true);
    });

    test('vendor can remove booking product attribute', { tag: ['@pro', '@vendor'] }, async () => {
        const [, attributeId, , attributeName, attributeTerm] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.adminAuth);
        const attributes = { id: attributeId, name: attributeName, options: [attributeTerm] };
        const [, productIdFull] = await apiUtils.createProduct({ ...payloads.createAuctionProduct(), attributes: [attributes] }, payloads.vendorAuth);
        await vendor.removeProductAttribute(productIdFull, attributeName);
    });

    test('vendor can remove booking product attribute term', { tag: ['@pro', '@vendor'] }, async () => {
        const [, attributeId, , attributeName, attributeTerm] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.adminAuth);
        const [, , , , attributeTerm2] = await apiUtils.createAttributeTerm(payloads.createAttribute(), payloads.createAttributeTerm(), payloads.adminAuth);
        const attributes = { id: attributeId, name: attributeName, options: [attributeTerm, attributeTerm2] };
        const [, productIdFull] = await apiUtils.createProduct({ ...payloads.createAuctionProduct(), attributes: [attributes] }, payloads.vendorAuth);
        await vendor.removeProductAttributeTerm(productIdFull, attributeName, attributeTerm2);
    });

    // todo: vendor cant add already added attribute

    // geolocation

    test('vendor can add booking product geolocation (individual)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductGeolocation(productIdBasic, data.product.productInfo.geolocation);
    });

    test('vendor can update booking product geolocation (individual)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addProductGeolocation(productIdFull, data.product.productInfo.geolocation);
    });

    test('vendor can remove booking product geolocation (individual)', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.removeProductGeolocation(productIdFull);
    });

    // addon

    test('vendor can add product addon', { tag: ['@pro', '@vendor'] }, async () => {
        test.slow();
        await vendor.addProductAddon(productIdBasic, data.product.productInfo.addon);
    });

    test('vendor can import booking product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const addon = payloads.createProductAddon();
        await vendor.importAddon(productIdBasic, serialize([addon]), addon.name);
    });

    test('vendor can export booking product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const [responseBody, productIdFull] = await apiUtils.createProductWithAddon(payloads.createAuctionProduct(), [payloads.createProductAddon()], payloads.vendorAuth);
        await vendor.exportAddon(productIdFull, serialize(apiUtils.getMetaDataValue(responseBody.meta_data, '_product_addons')));
    });

    test('vendor can remove booking product addon', { tag: ['@pro', '@vendor'] }, async () => {
        const [, productIdFull, , addonNames] = await apiUtils.createProductWithAddon(payloads.createAuctionProduct(), [payloads.createProductAddon()], payloads.vendorAuth);
        await vendor.removeAddon(productIdFull, addonNames[0] as string);
    });
});
