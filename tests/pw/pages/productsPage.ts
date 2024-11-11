import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { product, vendor } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const productsAdmin = selector.admin.products;
const productsVendor = selector.vendor.product;
const vendorTools = selector.vendor.vTools;

export class ProductsPage extends AdminPage {
    constructor(page: Page) {
        super(page);
    }

    // admin add product category
    async addCategory(categoryName: string) {
        await this.goIfNotThere(data.subUrls.backend.wc.addNewCategories);
        await this.fill(productsAdmin.category.name, categoryName);
        await this.fill(productsAdmin.category.slug, categoryName);
        await this.clickAndWaitForResponse(data.subUrls.ajax, productsAdmin.category.addNewCategory);
        await this.toBeVisible(productsAdmin.category.categoryCell(categoryName));
    }

    // admin add product attribute
    async addAttribute(attribute: product['attribute']) {
        await this.goIfNotThere(data.subUrls.backend.wc.addNewAttributes);
        await this.fill(productsAdmin.attribute.name, attribute.attributeName);
        await this.fill(productsAdmin.attribute.slug, attribute.attributeName);
        await this.clickAndWaitForResponse(data.subUrls.backend.wc.addNewAttributes, productsAdmin.attribute.addAttribute);
        await this.toBeVisible(productsAdmin.attribute.attributeCell(attribute.attributeName));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.backend.wc.taxonomy, productsAdmin.attribute.configureTerms(attribute.attributeName));

        // add new term
        for (const attributeTerm of attribute.attributeTerms) {
            await this.fill(productsAdmin.attribute.attributeTerm, attributeTerm);
            await this.fill(productsAdmin.attribute.attributeTermSlug, attributeTerm);
            await this.clickAndWaitForResponse(data.subUrls.ajax, productsAdmin.attribute.addAttributeTerm);
            await this.toBeVisible(productsAdmin.attribute.attributeTermCell(attributeTerm));
        }
    }

    // admin add simple product
    async addSimpleProduct(product: product['simple']) {
        await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

        // product basic info
        await this.type(productsAdmin.product.productName, product.productName());
        await this.selectByValue(productsAdmin.product.productType, product.productType);
        await this.click(productsAdmin.product.subMenus.general);
        await this.type(productsAdmin.product.regularPrice, product.regularPrice());
        await this.click(productsAdmin.product.category(product.category));

        // stock status
        if (product.stockStatus) {
            await this.click(productsAdmin.product.subMenus.inventory);
            await this.selectByValue(productsAdmin.product.stockStatus, data.product.stockStatus.outOfStock);
        }

        // vendor Store Name
        await this.select2ByText(productsAdmin.product.storeName, productsAdmin.product.storeNameInput, product.storeName);
        await this.scrollToTop();

        switch (product.status) {
            case 'publish':
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, productsAdmin.product.publish);
                await this.toContainText(productsAdmin.product.updatedSuccessMessage, data.product.publishSuccessMessage);
                break;

            case 'draft':
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, productsAdmin.product.saveDraft, 302);
                await this.toContainText(productsAdmin.product.updatedSuccessMessage, data.product.draftUpdateSuccessMessage);
                break;

            case 'pending':
                await this.click(productsAdmin.product.editStatus);
                await this.selectByValue(productsAdmin.product.status, data.product.status.pending);
                await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, productsAdmin.product.saveDraft, 302);
                await this.toContainText(productsAdmin.product.updatedSuccessMessage, data.product.pendingProductUpdateSuccessMessage);
                break;

            default:
                break;
        }
    }

    // admin add variable product
    async addVariableProduct(product: product['variable']) {
        await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

        // name
        await this.type(productsAdmin.product.productName, product.productName());
        await this.selectByValue(productsAdmin.product.productType, product.productType);

        // add attributes
        await this.click(productsAdmin.product.subMenus.attributes);

        if (await this.isVisibleLocator(productsAdmin.product.customProductAttribute)) {
            await this.selectByValue(productsAdmin.product.customProductAttribute, `pa_${product.attribute}`);
            await this.click(productsAdmin.product.addAttribute);
        } else {
            await this.clickAndWaitForResponse(data.subUrls.backend.wc.searchAttribute, productsAdmin.product.addExistingAttribute);
            await this.typeAndWaitForResponse(data.subUrls.backend.wc.term, productsAdmin.product.addExistingAttributeInput, product.attribute);
            await this.pressAndWaitForResponse(data.subUrls.ajax, data.key.enter);
        }

        await this.clickAndWaitForResponse(data.subUrls.backend.wc.taxonomyTerms, productsAdmin.product.selectAll);
        await this.check(productsAdmin.product.usedForVariations);
        await this.clickAndWaitForResponse(data.subUrls.ajax, productsAdmin.product.saveAttributes);

        // add variations
        await this.click(productsAdmin.product.subMenus.variations);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, productsAdmin.product.subMenus.generateVariations);
        this.fillAlert('100');
        await this.selectByValue(productsAdmin.product.addVariations, product.variations.variableRegularPrice);

        // category
        await this.click(productsAdmin.product.category(product.category));

        // Vendor Store Name
        await this.select2ByText(productsAdmin.product.storeName, productsAdmin.product.storeNameInput, product.storeName);
        await this.scrollToTop();

        // Publish
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, productsAdmin.product.publish, 302);
        await this.toContainText(productsAdmin.product.updatedSuccessMessage, data.product.publishSuccessMessage);
    }

    // Admin Add Simple Subscription Product
    async addSimpleSubscription(product: product['simpleSubscription']) {
        await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

        // Name
        await this.type(productsAdmin.product.productName, product.productName());
        await this.selectByValue(productsAdmin.product.productType, product.productType);
        await this.click(productsAdmin.product.subMenus.general);
        await this.type(productsAdmin.product.subscriptionPrice, product.subscriptionPrice());
        await this.selectByValue(productsAdmin.product.subscriptionPeriodInterval, product.subscriptionPeriodInterval);
        await this.selectByValue(productsAdmin.product.subscriptionPeriod, product.subscriptionPeriod);
        await this.selectByValue(productsAdmin.product.expireAfter, product.expireAfter);
        await this.type(productsAdmin.product.subscriptionTrialLength, product.subscriptionTrialLength);
        await this.selectByValue(productsAdmin.product.subscriptionTrialPeriod, product.subscriptionTrialPeriod);

        // Category
        await this.click(productsAdmin.product.category(product.category));

        // Vendor Store Name
        await this.select2ByText(productsAdmin.product.storeName, productsAdmin.product.storeNameInput, product.storeName);
        await this.scrollToTop();

        // Publish
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, productsAdmin.product.publish, 302);

        await this.toContainText(productsAdmin.product.updatedSuccessMessage, data.product.publishSuccessMessage);
    }

    // admin add variable product
    async addVariableSubscription(product: product['variableSubscription']) {
        await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

        // name
        await this.type(productsAdmin.product.productName, product.productName());
        await this.selectByValue(productsAdmin.product.productType, product.productType);

        // add attributes
        await this.click(productsAdmin.product.subMenus.attributes);

        if (await this.isVisibleLocator(productsAdmin.product.customProductAttribute)) {
            await this.selectByValue(productsAdmin.product.customProductAttribute, `pa_${product.attribute}`);
            await this.click(productsAdmin.product.addAttribute);
        } else {
            await this.clickAndWaitForResponse(data.subUrls.backend.wc.searchAttribute, productsAdmin.product.addExistingAttribute);
            await this.typeAndWaitForResponse(data.subUrls.backend.wc.term, productsAdmin.product.addExistingAttributeInput, product.attribute);
            await this.pressAndWaitForResponse(data.subUrls.ajax, data.key.enter);
        }

        await this.clickAndWaitForResponse(data.subUrls.backend.wc.taxonomyTerms, productsAdmin.product.selectAll);
        await this.check(productsAdmin.product.usedForVariations);
        await this.clickAndWaitForResponse(data.subUrls.ajax, productsAdmin.product.saveAttributes);

        // add variations
        await this.click(productsAdmin.product.subMenus.variations);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, productsAdmin.product.subMenus.generateVariations);
        this.fillAlert('100');
        await this.selectByValue(productsAdmin.product.addVariations, product.variations.variableRegularPrice);

        // category
        await this.click(productsAdmin.product.category(product.category));

        // Vendor Store Name
        await this.select2ByText(productsAdmin.product.storeName, productsAdmin.product.storeNameInput, product.storeName);
        await this.scrollToTop();

        // Publish
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, productsAdmin.product.publish, 302);
        await this.toContainText(productsAdmin.product.updatedSuccessMessage, data.product.publishSuccessMessage);
    }

    // Admin Add External Product
    async addExternalProduct(product: product['external']) {
        await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

        // Name
        await this.type(productsAdmin.product.productName, product.productName());
        await this.selectByValue(productsAdmin.product.productType, product.productType);
        await this.click(productsAdmin.product.subMenus.general);
        await this.type(productsAdmin.product.productUrl, this.getBaseUrl() + product.productUrl);
        await this.type(productsAdmin.product.buttonText, product.buttonText);
        await this.type(productsAdmin.product.regularPrice, product.regularPrice());

        // Category
        await this.click(productsAdmin.product.category(product.category));

        // Vendor Store Name
        await this.select2ByText(productsAdmin.product.storeName, productsAdmin.product.storeNameInput, product.storeName);
        await this.scrollToTop();

        // Publish
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, productsAdmin.product.publish, 302);
        await this.toContainText(productsAdmin.product.updatedSuccessMessage, data.product.publishSuccessMessage);
    }

    // Admin Add Dokan Subscription Product
    async addDokanSubscription(product: product['vendorSubscription']) {
        await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

        // Name
        await this.type(productsAdmin.product.productName, product.productName());
        await this.selectByValue(productsAdmin.product.productType, product.productType);
        await this.click(productsAdmin.product.subMenus.general);
        await this.type(productsAdmin.product.regularPrice, product.regularPrice());

        // Category
        await this.click(productsAdmin.product.category(product.category));

        // Subscription Details
        await this.type(productsAdmin.product.numberOfProducts, product.numberOfProducts);
        await this.type(productsAdmin.product.packValidity, product.packValidity);
        await this.type(productsAdmin.product.advertisementSlot, product.advertisementSlot);
        await this.type(productsAdmin.product.expireAfterDays, product.expireAfterDays);
        await this.click(productsAdmin.product.recurringPayment);

        // Publish
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, productsAdmin.product.publish, 302);
        await this.toContainText(productsAdmin.product.updatedSuccessMessage, data.product.publishSuccessMessage);
    }

    // vendor

    // products render properly
    async vendorProductsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

        // product nav menus are visible
        const { draft, pendingReview, ...menus } = productsVendor.menus;
        await this.multipleElementVisible(menus);

        // add new product is visible
        await this.toBeVisible(productsVendor.addNewProduct);

        // import export is visible
        if (DOKAN_PRO) await this.multipleElementVisible(productsVendor.importExport);

        // product filters elements are visible
        const { filterByType, filterByOther, ...filters } = productsVendor.filters;
        await this.multipleElementVisible(filters);
        if (DOKAN_PRO) {
            await this.toBeVisible(filterByType);
            await this.toBeVisible(filterByOther);
        }

        // product search elements are visible
        await this.multipleElementVisible(productsVendor.search);

        // bulk action elements are visible
        await this.multipleElementVisible(productsVendor.bulkActions);

        // table elements are visible
        const { productAdvertisementColumn, ...table } = productsVendor.table;
        await this.multipleElementVisible(table);
    }

    // add new product render properly
    async vendorAddNewProductRenderProperly(): Promise<void> {
        await this.goToAddNewProduct();

        // title
        await this.toBeVisible(productsVendor.title);

        // product type
        if (DOKAN_PRO) await this.toBeVisible(productsVendor.productType);

        // downloadable
        await this.toBeVisible(productsVendor.downloadable);

        // virtual
        await this.toBeVisible(productsVendor.virtual);

        // price
        await this.toBeVisible(productsVendor.price);

        // discount price & Schedule
        await this.click(productsVendor.discount.schedule);
        const { schedule, greaterDiscountError, ...discount } = productsVendor.discount;
        await this.multipleElementVisible(discount);

        // category
        await this.toBeVisible(productsVendor.category.openCategoryModal);

        // tags
        await this.toBeVisible(productsVendor.tags.tagInput);

        // cover image
        await this.toBeVisible(productsVendor.image.cover);

        // gallery image
        await this.toBeVisible(productsVendor.image.gallery);

        // short description
        await this.toBeVisible(productsVendor.shortDescription.shortDescriptionIframe);

        // description
        await this.toBeVisible(productsVendor.description.descriptionIframe);

        // inventory
        await this.toBeVisible(productsVendor.inventory.stockStatus);
        await this.check(productsVendor.inventory.enableStockManagement);
        const { stockStatus, ...inventory } = productsVendor.inventory;
        await this.multipleElementVisible(inventory);

        // other options
        await this.multipleElementVisible(productsVendor.otherOptions);

        // catalog mode
        await this.check(productsVendor.catalogMode.removeAddToCart);
        await this.multipleElementVisible(productsVendor.catalogMode);

        if (DOKAN_PRO) {
            // shipping
            await this.multipleElementVisible(productsVendor.shipping);

            // tax
            await this.multipleElementVisible(productsVendor.tax);

            // geolocation
            await this.uncheck(productsVendor.geolocation.sameAsStore);
            await this.multipleElementVisible(productsVendor.geolocation);

            // linked products
            await this.toBeVisible(productsVendor.linkedProducts.upSells);
            await this.toBeVisible(productsVendor.linkedProducts.crossSells);

            // attribute
            await this.toBeVisible(productsVendor.attribute.customAttribute);
            await this.toBeVisible(productsVendor.attribute.addAttribute);
            await this.toBeVisible(productsVendor.attribute.saveAttribute);

            // discount options
            await this.check(productsVendor.bulkDiscount.enableBulkDiscount);
            await this.multipleElementVisible(productsVendor.bulkDiscount);

            // addon
            await this.toBeVisible(productsVendor.addon.addField);
            await this.toBeVisible(productsVendor.addon.import);
            await this.toBeVisible(productsVendor.addon.export);
            await this.toBeVisible(productsVendor.addon.excludeAddons);

            // rma
            await this.check(productsVendor.rma.overrideDefaultRmaSettings);
            const { length, lengthValue, lengthDuration, addonCost, addonDurationLength, addonDurationType, rmaPolicyHtmlBody, refundReasons, ...rma } = productsVendor.rma;
            await this.multipleElementVisible(rma);

            // wholesale
            await this.check(productsVendor.wholesale.enableWholesale);
            await this.multipleElementVisible(productsVendor.wholesale);

            // min-max
            await this.multipleElementVisible(productsVendor.minMax);

            // advertisement
            await this.toBeVisible(productsVendor.advertisement.needsPublishNotice);

            // eu compliance
            // todo: need a check for germanized plugin
            // const { deliveryTime, optionalMiniDescription, ...euComplianceFields } = productsVendor.euComplianceFields;
            // await this.multipleElementVisible(euComplianceFields);
        }
    }

    // products

    // vendor add product
    async goToAddNewProduct(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        await this.clickAndWaitForLoadState(productsVendor.addNewProduct);
    }

    // vendor add simple product
    async vendorAddSimpleProduct(product: product['simple']): Promise<void> {
        const productName = product.productName();
        const productPrice = product.regularPrice();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.clearAndType(productsVendor.price, productPrice);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveValue(productsVendor.price, productPrice);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
    }

    // vendor add variable product
    async vendorAddVariableProduct(product: product['variable']): Promise<void> {
        const productName = product.productName();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.selectByValue(productsVendor.productType, product.productType);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        // add variation
        await this.selectByValue(productsVendor.attribute.customAttribute, `pa_${product.attribute}`);
        await this.click(productsVendor.attribute.addAttribute);
        await this.click(productsVendor.attribute.selectAll);
        await this.click(productsVendor.attribute.usedForVariations);
        await this.click(productsVendor.attribute.saveAttribute);
        await this.selectByValue(productsVendor.attribute.addVariations, product.variations.linkAllVariation);
        await this.click(productsVendor.attribute.go);
        await this.click(productsVendor.attribute.confirmGo);
        await this.click(productsVendor.attribute.okSuccessAlertGo);
        await this.selectByValue(productsVendor.attribute.addVariations, product.variations.variableRegularPrice);
        await this.click(productsVendor.attribute.go);
        await this.type(productsVendor.attribute.variationPrice, product.regularPrice());
        await this.click(productsVendor.attribute.okVariationPrice);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveSelectedValue(productsVendor.productType, product.productType);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        // todo: add more assertions
    }

    // vendor add simple subscription product
    async vendorAddSimpleSubscription(product: product['simpleSubscription']): Promise<void> {
        const productName = product.productName();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.selectByValue(productsVendor.productType, product.productType);
        await this.type(productsVendor.subscriptionPrice, product.subscriptionPrice());
        await this.selectByValue(productsVendor.subscriptionPeriodInterval, product.subscriptionPeriodInterval);
        await this.selectByValue(productsVendor.subscriptionPeriod, product.subscriptionPeriod);
        await this.selectByValue(productsVendor.expireAfter, product.expireAfter);
        await this.type(productsVendor.subscriptionTrialLength, product.subscriptionTrialLength);
        await this.selectByValue(productsVendor.subscriptionTrialPeriod, product.subscriptionTrialPeriod);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveSelectedValue(productsVendor.productType, product.productType);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        // todo: add more assertions
    }

    // vendor add variable subscription product
    async vendorAddVariableSubscription(product: product['variableSubscription']): Promise<void> {
        const productName = product.productName();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.selectByValue(productsVendor.productType, product.productType);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        // add variation
        await this.selectByValue(productsVendor.attribute.customAttribute, `pa_${product.attribute}`);
        await this.click(productsVendor.attribute.addAttribute);
        await this.click(productsVendor.attribute.selectAll);
        await this.click(productsVendor.attribute.usedForVariations);
        await this.click(productsVendor.attribute.saveAttribute);
        await this.selectByValue(productsVendor.attribute.addVariations, product.variations.linkAllVariation);
        await this.click(productsVendor.attribute.go);
        await this.click(productsVendor.attribute.confirmGo);
        await this.click(productsVendor.attribute.okSuccessAlertGo);
        await this.selectByValue(productsVendor.attribute.addVariations, product.variations.variableRegularPrice);
        await this.click(productsVendor.attribute.go);
        await this.type(productsVendor.attribute.variationPrice, product.regularPrice());
        await this.click(productsVendor.attribute.okVariationPrice);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveSelectedValue(productsVendor.productType, product.productType);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        // todo: add more assertions
    }

    // vendor add external product
    async vendorAddExternalProduct(product: product['external']): Promise<void> {
        const productName = product.productName();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.selectByValue(productsVendor.productType, product.productType);
        await this.type(productsVendor.productUrl, this.getBaseUrl() + product.productUrl);
        await this.type(productsVendor.buttonText, product.buttonText);
        await this.clearAndType(productsVendor.price, product.regularPrice());
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveSelectedValue(productsVendor.productType, product.productType);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        // todo: add more assertions
    }

    // vendor add group product
    async vendorAddGroupProduct(product: product['grouped']): Promise<void> {
        const productName = product.productName();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.selectByValue(productsVendor.productType, product.productType);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        for (const groupedProduct of product.groupedProducts) {
            await this.typeAndWaitForResponse(data.subUrls.ajax, productsVendor.linkedProducts.groupProducts, groupedProduct);
            await this.click(productsVendor.linkedProducts.searchedResult(groupedProduct));
            await this.toBeVisible(productsVendor.linkedProducts.selectedGroupedProduct(groupedProduct));
        }
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveSelectedValue(productsVendor.productType, product.productType);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        for (const groupedProduct of product.groupedProducts) {
            await this.toBeVisible(productsVendor.linkedProducts.selectedGroupedProduct(groupedProduct));
        }
    }

    // vendor add downloadable product
    async vendorAddDownloadableProduct(product: product['downloadable']): Promise<void> {
        const productName = product.productName();
        const productPrice = product.regularPrice();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.clearAndType(productsVendor.price, productPrice);
        await this.check(productsVendor.downloadable);
        await this.click(productsVendor.downloadableOptions.addFile);
        await this.clearAndType(productsVendor.downloadableOptions.fileName, product.downloadableOptions.fileName);
        await this.click(productsVendor.downloadableOptions.chooseFile);
        await this.uploadMedia(product.downloadableOptions.fileUrl);
        await this.clearAndType(productsVendor.downloadableOptions.downloadLimit, product.downloadableOptions.downloadLimit);
        await this.clearAndType(productsVendor.downloadableOptions.downloadExpiry, product.downloadableOptions.downloadExpiry);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveValue(productsVendor.price, productPrice);
        await this.toBeChecked(productsVendor.downloadable);
        await this.toHaveValue(productsVendor.downloadableOptions.fileName, product.downloadableOptions.fileName);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadLimit, product.downloadableOptions.downloadLimit);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadExpiry, product.downloadableOptions.downloadExpiry);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
    }

    // vendor add virtual product
    async vendorAddVirtualProduct(product: product['simple']): Promise<void> {
        const productName = product.productName();
        const productPrice = product.regularPrice();
        await this.goToAddNewProduct();
        await this.clearAndType(productsVendor.title, productName);
        await this.clearAndType(productsVendor.price, productPrice);
        await this.check(productsVendor.virtual);
        if (DOKAN_PRO) {
            await this.notToBeVisible(productsVendor.shipping.shippingContainer);
        }
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveValue(productsVendor.price, productPrice);
        await this.toBeChecked(productsVendor.virtual);
        await this.notToBeVisible(productsVendor.shipping.shippingContainer);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
    }

    // search product vendor dashboard
    async searchProduct(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        await this.clearAndType(productsVendor.search.searchInput, productName);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, productsVendor.search.searchBtn);
        await this.toBeVisible(productsVendor.productLink(productName));
    }

    // go to product edit
    async goToProductEdit(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.removeAttribute(productsVendor.rowActions(productName), 'class'); // forcing the row actions to be visible, to avoid flakiness
        await this.hover(productsVendor.productCell(productName));
        await this.clickAndWaitForResponseAndLoadStateUntilNetworkIdle(data.subUrls.frontend.vDashboard.products, productsVendor.editProduct(productName));
        await this.toHaveValue(productsVendor.title, productName);
    }

    // save product
    async saveProduct(): Promise<void> {
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct);
        await this.toContainText(productsVendor.updatedSuccessMessage, data.product.createUpdateSaveSuccessMessage);
    }

    // filter products
    async filterProducts(filterBy: string, value: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

        switch (filterBy) {
            case 'by-date':
                await this.selectByNumber(productsVendor.filters.filterByDate, value);
                break;

            case 'by-category':
                await this.selectByLabel(productsVendor.filters.filterByCategory, value);
                break;

            case 'by-type':
                await this.selectByValue(productsVendor.filters.filterByType, value);
                break;

            case 'by-other':
                await this.selectByValue(productsVendor.filters.filterByOther, value);
                break;

            default:
                break;
        }

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.filters.filter);
        await this.notToHaveCount(productsVendor.numberOfRowsFound, 0);
    }

    // reset filter
    async resetFilter(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        await this.clearAndType(productsVendor.search.searchInput, '.....');
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, productsVendor.search.searchBtn);
        await this.toBeVisible(productsVendor.noProductsFound);

        // reset
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.filters.reset);
        await this.notToHaveCount(productsVendor.numberOfRowsFound, 0);
    }

    // import product
    async importProducts(filePath: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        await this.clickAndWaitForLoadState(productsVendor.importExport.import);
        await this.uploadFile(vendorTools.import.csv.chooseCsv, filePath);
        // await this.click(vendorTools.import.csv.updateExistingProducts);
        await this.clickAndWaitForLoadState(vendorTools.import.csv.continue);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.csvImport, vendorTools.import.csv.runTheImporter);
        await this.toContainText(vendorTools.import.csv.completionMessage, 'Import complete!');

        // assert imported products
        await this.searchProduct('p0_v1');
    }

    // export product
    async exportProducts(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        await this.clickAndWaitForLoadState(productsVendor.importExport.export);
        await this.clickAndWaitForDownload(selector.vendor.vTools.export.csv.generateCsv);
    }

    async addProductWithoutRequiredFields(product: product['simple']): Promise<void> {
        const productName = product.productName();
        const productPrice = product.regularPrice();
        await this.goToAddNewProduct();
        await this.click(productsVendor.saveProduct);
        await this.toContainText(productsVendor.NoTitleError, 'This field is required');
        await this.clearAndType(productsVendor.title, productName);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct);
        await this.toContainText(productsVendor.dokanErrorMessage, 'Error! Description is a required field..');
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
        await this.clearAndType(productsVendor.price, productPrice);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, productName);
        await this.toHaveValue(productsVendor.price, productPrice);
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, product.description);
    }

    // view product
    async viewProduct(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.hover(productsVendor.productCell(productName));
        await this.clickAndWaitForLoadState(productsVendor.view(productName));
        await expect(this.page).toHaveURL(data.subUrls.frontend.productDetails(helpers.slugify(productName)) + '/');
        const { quantity, addToCart, viewCart, chatNow, euComplianceData, productAddedSuccessMessage, productWithQuantityAddedSuccessMessage, ...productDetails } = selector.customer.cSingleProduct.productDetails;
        await this.multipleElementVisible(productDetails);
    }

    // vendor can't buy own product
    async cantBuyOwnProduct(productName: string) {
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
        await this.notToBeVisible(selector.customer.cSingleProduct.productDetails.quantity);
        await this.notToBeVisible(selector.customer.cSingleProduct.productDetails.addToCart);
    }

    // duplicate product
    async duplicateProduct(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.hover(productsVendor.productCell(productName));
        await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.duplicate(productName));
        await this.toContainText(productsVendor.dokanSuccessMessage, 'Product successfully duplicated');
    }

    // permanently delete product
    async permanentlyDeleteProduct(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.hover(productsVendor.productCell(productName));
        await this.click(productsVendor.permanentlyDelete(productName));
        await this.clickAndWaitForLoadState(productsVendor.confirmAction);
        await this.toContainText(productsVendor.dokanSuccessMessage, 'Product successfully deleted');
    }

    // product bulk action
    async productBulkAction(action: string, productName?: string): Promise<void> {
        if (productName) {
            await this.searchProduct(productName);
        } else {
            await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        }

        await this.click(productsVendor.bulkActions.selectAll);
        switch (action) {
            case 'edit':
                await this.selectByValue(productsVendor.bulkActions.selectAction, 'edit');
                // todo:
                break;

            case 'permanently-delete':
                await this.selectByValue(productsVendor.bulkActions.selectAction, 'permanently-delete');
                break;

            case 'publish':
                await this.selectByValue(productsVendor.bulkActions.selectAction, 'publish');
                break;

            default:
                break;
        }

        await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.bulkActions.applyAction);
    }

    // product edit

    async editProduct(product: product['simple']): Promise<void> {
        await this.goToProductEdit(product.editProduct);
        await this.clearAndType(productsVendor.price, product.regularPrice());
        await this.saveProduct();
    }

    // quick edit product
    async quickEditProduct(product: product['simple']): Promise<void> {
        await this.searchProduct(product.editProduct);
        await this.removeAttribute(productsVendor.rowActions(product.editProduct), 'class'); // forcing the row actions to be visible, to avoid flakiness
        await this.hover(productsVendor.productCell(product.editProduct));
        await this.click(productsVendor.quickEdit(product.editProduct));

        await this.clearAndType(productsVendor.quickEditProduct.title, product.editProduct);
        // todo:  add more fields

        await this.clickAndWaitForResponse(data.subUrls.ajax, productsVendor.quickEditProduct.update);
    }

    // product options

    // add product title
    async addProductTitle(productName: string, title: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.clearAndType(productsVendor.title, title);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.title, title);
    }

    // add product permalink
    async addProductPermalink(productName: string, permalink: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.click(productsVendor.permalink.permalinkEdit);
        await this.clearAndType(productsVendor.permalink.permalinkInput, permalink);
        await this.clickAndWaitForResponse(data.subUrls.ajax, productsVendor.permalink.confirmPermalinkEdit);
        await this.saveProduct();
        await this.toContainText(productsVendor.permalink.permalink, helpers.slugify(permalink));
        // todo: add more assertions to all product edit test, customer pov
    }

    // add product price
    async addPrice(productName: string, price: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.clearAndType(productsVendor.price, price);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.price, price);
    }

    // remove product price
    async removePrice(productName: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.clearAndType(productsVendor.price, '');
        await this.saveProduct();
        await this.toHaveValue(productsVendor.price, '');
    }

    // can't add product discount greater than regular price
    async cantAddGreaterDiscount(productName: string, discount: product['discount']): Promise<void> {
        const regularPrice = discount.regularPrice.replace('.', ',');
        const discountPrice = String(Number(discount.regularPrice) + Number(discount.discountPrice)).replace('.', ',');
        await this.goToProductEdit(productName);
        await this.clearAndType(productsVendor.price, regularPrice);
        await this.type(productsVendor.discount.discountedPrice, discountPrice);
        await this.toBeVisible(productsVendor.discount.greaterDiscountError);
    }

    // add product discount
    async addDiscount(productName: string, discount: product['discount'], schedule = false, hasSchedule = false): Promise<void> {
        const regularPrice = discount.regularPrice.replace('.', ',');
        const discountPrice = String(Number(discount.regularPrice) - Number(discount.discountPrice)).replace('.', ',');
        await this.goToProductEdit(productName);
        await this.clearAndType(productsVendor.price, regularPrice);
        await this.clearAndType(productsVendor.discount.discountedPrice, discountPrice);
        if (schedule) {
            if (!hasSchedule) await this.click(productsVendor.discount.schedule);
            await this.clearAndType(productsVendor.discount.scheduleFrom, discount.startDate!);
            await this.clearAndType(productsVendor.discount.scheduleTo, discount.endDate!);
        }
        await this.saveProduct();
        await this.toHaveValue(productsVendor.discount.discountedPrice, discountPrice);
        if (schedule) {
            await this.toBeVisible(productsVendor.discount.scheduleCancel);
            await this.toHaveValue(productsVendor.discount.scheduleFrom, discount.startDate!);
            await this.toHaveValue(productsVendor.discount.scheduleTo, discount.endDate!);
        }
    }

    // add remove discount
    async removeDiscount(productName: string, schedule: boolean = false): Promise<void> {
        await this.goToProductEdit(productName);
        await this.clearAndType(productsVendor.discount.discountedPrice, '');
        if (schedule) {
            await this.click(productsVendor.discount.scheduleCancel);
        }
        await this.saveProduct();
        await this.toHaveValue(productsVendor.discount.discountedPrice, '');
        if (schedule) {
            await this.toBeVisible(productsVendor.discount.schedule);
            await this.notToBeVisible(productsVendor.discount.scheduleFrom);
            await this.notToBeVisible(productsVendor.discount.scheduleTo);
        }
    }

    // vendor add product category
    async vendorAddProductCategory(category: string, multiple: boolean, neg?: boolean): Promise<void> {
        if (!multiple) {
            await this.click(productsVendor.category.openCategoryModal);
        } else {
            await this.click(productsVendor.category.addNewCategory);
            await this.click(productsVendor.category.selectACategory);
        }
        await this.toBeVisible(productsVendor.category.categoryModal);
        await this.type(productsVendor.category.searchInput, category);
        await this.toContainText(productsVendor.category.searchedResultText, category);
        await this.click(productsVendor.category.searchedResult);
        await this.click(productsVendor.category.categoryOnList(category));
        if (neg) {
            await this.toBeDisabled(productsVendor.category.done);
            return;
        }
        await this.click(productsVendor.category.done);

        const categoryAlreadySelectedPopup = await this.isVisible(productsVendor.category.categoryAlreadySelectedPopup);
        if (categoryAlreadySelectedPopup) {
            await this.click(productsVendor.category.categoryAlreadySelectedPopup);
            await this.click(productsVendor.category.categoryModalClose);
        }
        await this.toBeVisible(productsVendor.category.selectedCategory(category));
    }

    // add product category
    async addProductCategory(productName: string, categories: string[], multiple: boolean = false): Promise<void> {
        await this.goToProductEdit(productName);
        for (const category of categories) {
            await this.vendorAddProductCategory(category, multiple);
        }
        await this.saveProduct();
        for (const category of categories) {
            await this.toBeVisible(productsVendor.category.selectedCategory(category));
        }
    }

    // remove product category
    async removeProductCategory(productName: string, categories: string[]): Promise<void> {
        await this.goToProductEdit(productName);
        for (const category of categories) {
            await this.click(productsVendor.category.removeSelectedCategory(category));
            await this.notToBeVisible(productsVendor.category.selectedCategory(category));
        }
        await this.saveProduct();
        for (const category of categories) {
            await this.notToBeVisible(productsVendor.category.selectedCategory(category));
        }
    }

    // can't add product category
    async cantAddCategory(productName: string, category: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.vendorAddProductCategory(category, false, true);
    }

    // add product tags
    async addProductTags(productName: string, tags: string[]): Promise<void> {
        await this.goToProductEdit(productName);
        for (const tag of tags) {
            await this.typeAndWaitForResponse(data.subUrls.ajax, productsVendor.tags.tagInput, tag);
            await this.click(productsVendor.tags.searchedTag(tag));
            await this.toBeVisible(productsVendor.tags.selectedTags(tag));
        }
        await this.saveProduct();
        for (const tag of tags) {
            await this.toBeVisible(productsVendor.tags.selectedTags(tag));
        }
    }

    // remove product tags
    async removeProductTags(productName: string, tags: string[]): Promise<void> {
        await this.goToProductEdit(productName);
        for (const tag of tags) {
            await this.click(productsVendor.tags.removeSelectedTags(tag));
            await this.press('Escape'); // shift focus from element
        }
        await this.saveProduct();

        for (const tag of tags) {
            await this.notToBeVisible(productsVendor.tags.selectedTags(tag));
        }
    }

    // add product cover image
    async addProductCoverImage(productName: string, coverImage: string, removePrevious: boolean = false): Promise<void> {
        await this.goToProductEdit(productName);
        // remove previous cover image
        if (removePrevious) {
            await this.hover(productsVendor.image.coverImageDiv);
            await this.click(productsVendor.image.removeFeatureImage);
            await this.toBeVisible(productsVendor.image.uploadImageText);
        }
        await this.click(productsVendor.image.cover);
        await this.uploadMedia(coverImage);
        await this.saveProduct();
        await this.toHaveAttribute(productsVendor.image.uploadedFeatureImage, 'src', /.+/); // Ensures 'src' has any non-falsy value
        await this.notToBeVisible(productsVendor.image.uploadImageText);
    }

    // remove product cover image
    async removeProductCoverImage(productName: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.hover(productsVendor.image.coverImageDiv);
        await this.click(productsVendor.image.removeFeatureImage);
        await this.saveProduct();
        await this.toHaveAttribute(productsVendor.image.uploadedFeatureImage, 'src', /^$/);
        await this.toBeVisible(productsVendor.image.uploadImageText);
    }

    // add product gallery images
    async addProductGalleryImages(productName: string, galleryImages: string[], removePrevious: boolean = false): Promise<void> {
        await this.goToProductEdit(productName);
        // remove previous gallery images
        if (removePrevious) {
            const imageCount = await this.getElementCount(productsVendor.image.uploadedGalleryImage);
            for (let i = 0; i < imageCount; i++) {
                await this.hover(productsVendor.image.galleryImageDiv);
                await this.click(productsVendor.image.removeGalleryImage);
            }
            await this.toHaveCount(productsVendor.image.uploadedGalleryImage, 0);
        }

        for (const galleryImage of galleryImages) {
            await this.click(productsVendor.image.gallery);
            await this.uploadMedia(galleryImage);
        }
        await this.saveProduct();
        await this.toHaveCount(productsVendor.image.uploadedGalleryImage, galleryImages.length);
    }

    // remove product gallery images
    async removeProductGalleryImages(productName: string): Promise<void> {
        await this.goToProductEdit(productName);
        const imageCount = await this.getElementCount(productsVendor.image.uploadedGalleryImage);
        for (let i = 0; i < imageCount; i++) {
            await this.hover(productsVendor.image.galleryImageDiv);
            await this.click(productsVendor.image.removeGalleryImage);
        }
        await this.saveProduct();
        await this.toHaveCount(productsVendor.image.uploadedGalleryImage, 0);
    }

    // add product short description
    async addProductShortDescription(productName: string, shortDescription: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.typeFrameSelector(productsVendor.shortDescription.shortDescriptionIframe, productsVendor.shortDescription.shortDescriptionHtmlBody, shortDescription);
        await this.saveProduct();
        await this.toContainTextFrameLocator(productsVendor.shortDescription.shortDescriptionIframe, productsVendor.shortDescription.shortDescriptionHtmlBody, shortDescription);
    }

    // add product description
    async addProductDescription(productName: string, description: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, description);
        await this.saveProduct();
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, description);
    }

    // add product downloadable options
    async addProductDownloadableOptions(productName: string, downloadableOption: product['productInfo']['downloadableOptions']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.check(productsVendor.downloadable);
        await this.click(productsVendor.downloadableOptions.addFile);
        await this.clearAndType(productsVendor.downloadableOptions.fileName, downloadableOption.fileName);
        await this.click(productsVendor.downloadableOptions.chooseFile);
        await this.uploadMedia(downloadableOption.fileUrl);
        await this.clearAndType(productsVendor.downloadableOptions.downloadLimit, downloadableOption.downloadLimit);
        await this.clearAndType(productsVendor.downloadableOptions.downloadExpiry, downloadableOption.downloadExpiry);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.downloadable);
        await this.toHaveValue(productsVendor.downloadableOptions.fileName, downloadableOption.fileName);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadLimit, downloadableOption.downloadLimit);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadExpiry, downloadableOption.downloadExpiry);
    }

    // remove product downloadable files
    async removeDownloadableFile(productName: string, downloadableOption: product['productInfo']['downloadableOptions']): Promise<void> {
        await this.goToProductEdit(productName);
        const fileCount = await this.getElementCount(productsVendor.downloadableOptions.deleteFile);
        for (let i = 0; i < fileCount; i++) {
            await this.clickFirstLocator(productsVendor.downloadableOptions.deleteFile);
        }
        await this.clearAndType(productsVendor.downloadableOptions.downloadLimit, downloadableOption.downloadLimit);
        await this.clearAndType(productsVendor.downloadableOptions.downloadExpiry, downloadableOption.downloadExpiry);
        await this.saveProduct();
        await this.notToBeVisible(productsVendor.downloadableOptions.deleteFile);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadLimit, downloadableOption.downloadLimit);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadExpiry, downloadableOption.downloadExpiry);
    }

    // add product inventory
    async addProductInventory(productName: string, inventory: product['productInfo']['inventory'], choice: string): Promise<void> {
        await this.goToProductEdit(productName);

        switch (choice) {
            case 'sku':
                await this.clearAndType(productsVendor.inventory.sku, inventory.sku);
                break;
            case 'stock-status':
                await this.selectByValue(productsVendor.inventory.stockStatus, inventory.stockStatus);
                break;
            case 'stock-management':
                await this.check(productsVendor.inventory.enableStockManagement);
                await this.clearAndType(productsVendor.inventory.stockQuantity, inventory.stockQuantity);
                await this.clearAndType(productsVendor.inventory.lowStockThreshold, inventory.lowStockThreshold);
                await this.selectByValue(productsVendor.inventory.allowBackorders, inventory.backorders);
                break;
            case 'one-quantity':
                if (inventory.oneQuantity) {
                    await this.check(productsVendor.inventory.allowOnlyOneQuantity);
                } else {
                    await this.uncheck(productsVendor.inventory.allowOnlyOneQuantity);
                }
                break;
            default:
                break;
        }

        await this.saveProduct();

        // todo: replace switch with all method action and assertion as object member and loop through to call them

        switch (choice) {
            case 'sku':
                await this.toHaveValue(productsVendor.inventory.sku, inventory.sku);
                break;
            case 'stock-status':
                await this.toHaveSelectedValue(productsVendor.inventory.stockStatus, inventory.stockStatus);
                break;
            case 'stock-management':
                await this.toBeChecked(productsVendor.inventory.enableStockManagement);
                await this.toHaveValue(productsVendor.inventory.stockQuantity, inventory.stockQuantity);
                await this.toHaveValue(productsVendor.inventory.lowStockThreshold, inventory.lowStockThreshold);
                await this.toHaveSelectedValue(productsVendor.inventory.allowBackorders, inventory.backorders);
                await this.notToBeVisible(productsVendor.inventory.stockStatus);
                break;
            case 'one-quantity':
                if (inventory.oneQuantity) {
                    await this.toBeChecked(productsVendor.inventory.allowOnlyOneQuantity);
                } else {
                    await this.notToBeChecked(productsVendor.inventory.allowOnlyOneQuantity);
                }
                break;
            default:
                break;
        }
    }
    // remove product inventory [stock management]
    async removeProductInventory(productName: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.uncheck(productsVendor.inventory.enableStockManagement);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.inventory.enableStockManagement);
    }

    // add product other options (product status, visibility, purchase note, reviews)
    async addProductOtherOptions(productName: string, otherOption: product['productInfo']['otherOptions'], choice: string): Promise<void> {
        await this.goToProductEdit(productName);

        switch (choice) {
            case 'status':
                await this.selectByValue(productsVendor.otherOptions.productStatus, otherOption.status);
                break;
            case 'visibility':
                await this.selectByValue(productsVendor.otherOptions.visibility, otherOption.visibility);
                break;
            case 'purchaseNote':
                await this.clearAndType(productsVendor.otherOptions.purchaseNote, otherOption.purchaseNote);
                break;
            case 'reviews':
                if (otherOption.enableReview) {
                    await this.check(productsVendor.otherOptions.enableProductReviews);
                } else {
                    await this.uncheck(productsVendor.otherOptions.enableProductReviews);
                }
                break;
            default:
                break;
        }

        await this.saveProduct();

        switch (choice) {
            case 'status':
                await this.toHaveSelectedValue(productsVendor.otherOptions.productStatus, otherOption.status);
                break;
            case 'visibility':
                await this.toHaveSelectedValue(productsVendor.otherOptions.visibility, otherOption.visibility);
                break;
            case 'purchaseNote':
                await this.toHaveValue(productsVendor.otherOptions.purchaseNote, otherOption.purchaseNote);
                break;
            case 'reviews':
                if (otherOption.enableReview) {
                    await this.toBeChecked(productsVendor.otherOptions.enableProductReviews);
                } else {
                    await this.notToBeChecked(productsVendor.otherOptions.enableProductReviews);
                }
                break;
            default:
                break;
        }
    }

    // add product catalog mode
    async addProductCatalogMode(productName: string, hidePrice: boolean = false): Promise<void> {
        await this.goToProductEdit(productName);
        await this.check(productsVendor.catalogMode.removeAddToCart);
        if (hidePrice) await this.check(productsVendor.catalogMode.hideProductPrice);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.catalogMode.removeAddToCart);
        if (hidePrice) await this.toBeChecked(productsVendor.catalogMode.hideProductPrice);
    }

    // remove product catalog mode
    async removeProductCatalogMode(productName: string, onlyPrice: boolean = false): Promise<void> {
        await this.goToProductEdit(productName);

        if (onlyPrice) {
            await this.uncheck(productsVendor.catalogMode.hideProductPrice);
        } else {
            await this.uncheck(productsVendor.catalogMode.removeAddToCart);
        }

        await this.saveProduct();

        if (onlyPrice) {
            await this.notToBeChecked(productsVendor.catalogMode.hideProductPrice);
        } else {
            await this.notToBeChecked(productsVendor.catalogMode.removeAddToCart);
        }
    }

    // dokan pro features

    // add product shipping
    async addProductShipping(productName: string, shipping: product['productInfo']['shipping']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.check(productsVendor.shipping.requiresShipping);
        await this.clearAndType(productsVendor.shipping.weight, shipping.weight);
        await this.clearAndType(productsVendor.shipping.length, shipping.length);
        await this.clearAndType(productsVendor.shipping.width, shipping.width);
        await this.clearAndType(productsVendor.shipping.height, shipping.height);
        await this.selectByLabel(productsVendor.shipping.shippingClass, shipping.shippingClass);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.shipping.requiresShipping);
        await this.toHaveValue(productsVendor.shipping.weight, shipping.weight);
        await this.toHaveValue(productsVendor.shipping.length, shipping.length);
        await this.toHaveValue(productsVendor.shipping.width, shipping.width);
        await this.toHaveValue(productsVendor.shipping.height, shipping.height);
        await this.toHaveSelectedLabel(productsVendor.shipping.shippingClass, shipping.shippingClass);
    }
    // add product shipping
    async removeProductShipping(productName: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.uncheck(productsVendor.shipping.requiresShipping);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.shipping.requiresShipping);
    }

    // add product tax
    async addProductTax(productName: string, tax: product['productInfo']['tax'], hasClass: boolean = false): Promise<void> {
        await this.goToProductEdit(productName);
        await this.selectByValue(productsVendor.tax.status, tax.status);
        if (hasClass) await this.selectByValue(productsVendor.tax.class, tax.class);
        await this.saveProduct();
        await this.toHaveSelectedValue(productsVendor.tax.status, tax.status);
        if (hasClass) await this.toHaveSelectedValue(productsVendor.tax.class, tax.class);
    }

    // add product linked products
    async addProductLinkedProducts(productName: string, linkedProducts: product['productInfo']['linkedProducts'], choice: string): Promise<void> {
        await this.goToProductEdit(productName);
        switch (choice) {
            case 'up-sells':
                for (const linkedProduct of linkedProducts.upSells) {
                    await this.typeAndWaitForResponse(data.subUrls.ajax, productsVendor.linkedProducts.upSells, linkedProduct);
                    await this.click(productsVendor.linkedProducts.searchedResult(linkedProduct));
                    await this.toBeVisible(productsVendor.linkedProducts.selectedUpSellProduct(linkedProduct));
                }
                break;
            case 'cross-sells':
                for (const linkedProduct of linkedProducts.crossSells) {
                    await this.typeAndWaitForResponse(data.subUrls.ajax, productsVendor.linkedProducts.crossSells, linkedProduct);
                    await this.click(productsVendor.linkedProducts.searchedResult(linkedProduct));
                    await this.toBeVisible(productsVendor.linkedProducts.selectedCrossSellProduct(linkedProduct));
                }
                break;
            default:
                break;
        }

        await this.saveProduct();

        switch (choice) {
            case 'up-sells':
                for (const linkedProduct of linkedProducts.upSells) {
                    await this.toBeVisible(productsVendor.linkedProducts.selectedUpSellProduct(linkedProduct));
                }
                break;
            case 'cross-sells':
                for (const linkedProduct of linkedProducts.crossSells) {
                    await this.toBeVisible(productsVendor.linkedProducts.selectedCrossSellProduct(linkedProduct));
                }
                break;
            default:
                break;
        }
    }

    // add product linked products
    async removeProductLinkedProducts(productName: string, linkedProducts: product['productInfo']['linkedProducts'], choice: string): Promise<void> {
        await this.goToProductEdit(productName);
        switch (choice) {
            case 'up-sells':
                for (const linkedProduct of linkedProducts.upSells) {
                    await this.click(productsVendor.linkedProducts.removeSelectedUpSellProduct(linkedProduct));
                    await this.press('Escape'); // shift focus from element
                }
                break;
            case 'cross-sells':
                for (const linkedProduct of linkedProducts.crossSells) {
                    await this.click(productsVendor.linkedProducts.removeSelectedCrossSellProduct(linkedProduct));
                    await this.press('Escape'); // shift focus from element
                }
                break;
            default:
                break;
        }

        await this.saveProduct();

        switch (choice) {
            case 'up-sells':
                for (const linkedProduct of linkedProducts.upSells) {
                    await this.notToBeVisible(productsVendor.linkedProducts.selectedUpSellProduct(linkedProduct));
                }
                break;
            case 'cross-sells':
                for (const linkedProduct of linkedProducts.crossSells) {
                    await this.notToBeVisible(productsVendor.linkedProducts.selectedCrossSellProduct(linkedProduct));
                }
                break;
            default:
                break;
        }
    }

    // add product attribute
    async addProductAttribute(productName: string, attribute: product['productInfo']['attribute'], addTerm: boolean = false): Promise<void> {
        await this.goToProductEdit(productName);
        await this.selectByLabel(productsVendor.attribute.customAttribute, attribute.attributeName);
        await this.clickAndWaitForResponse(data.subUrls.ajax, productsVendor.attribute.addAttribute);
        await this.check(productsVendor.attribute.visibleOnTheProductPage);
        await this.click(productsVendor.attribute.selectAll);
        await this.notToHaveCount(productsVendor.attribute.attributeTerms, 0);
        if (addTerm) {
            await this.click(productsVendor.attribute.addNew);
            await this.clearAndType(productsVendor.attribute.attributeTermInput, attribute.attributeTerm);
            await this.clickAndWaitForResponse(data.subUrls.ajax, productsVendor.attribute.confirmAddAttributeTerm);
            await this.toBeVisible(productsVendor.attribute.selectedAttributeTerm(attribute.attributeTerm));
        }
        await this.clickAndWaitForResponse(data.subUrls.ajax, productsVendor.attribute.saveAttribute);
        await this.saveProduct();
        await this.toBeVisible(productsVendor.attribute.savedAttribute(attribute.attributeName));
    }

    // remove product attribute
    async removeProductAttribute(productName: string, attribute: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.click(productsVendor.attribute.removeAttribute(attribute));
        await this.click(productsVendor.attribute.confirmRemoveAttribute);
        await this.notToBeVisible(productsVendor.attribute.savedAttribute(attribute));
        await this.saveProduct();
        await this.notToBeVisible(productsVendor.attribute.savedAttribute(attribute));
    }

    // remove product attribute term
    async removeProductAttributeTerm(productName: string, attribute: string, attributeTerm: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.click(productsVendor.attribute.savedAttribute(attribute));
        await this.click(productsVendor.attribute.removeSelectedAttributeTerm(attributeTerm));
        await this.press('Escape'); // shift focus from element
        await this.notToBeVisible(productsVendor.attribute.selectedAttributeTerm(attributeTerm));
        await this.clickAndWaitForResponse(data.subUrls.ajax, productsVendor.attribute.saveAttribute);
        await this.saveProduct();
        await this.click(productsVendor.attribute.savedAttribute(attribute));
        await this.notToBeVisible(productsVendor.attribute.selectedAttributeTerm(attributeTerm));
    }

    // add product discount options
    async addProductBulkDiscountOptions(productName: string, quantityDiscount: product['productInfo']['quantityDiscount']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.check(productsVendor.bulkDiscount.enableBulkDiscount);
        await this.clearAndType(productsVendor.bulkDiscount.lotMinimumQuantity, quantityDiscount.minimumQuantity);
        await this.clearAndType(productsVendor.bulkDiscount.lotDiscountInPercentage, quantityDiscount.discountPercentage);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.bulkDiscount.enableBulkDiscount);
        await this.toHaveValue(productsVendor.bulkDiscount.lotMinimumQuantity, quantityDiscount.minimumQuantity);
        await this.toHaveValue(productsVendor.bulkDiscount.lotDiscountInPercentage, quantityDiscount.discountPercentage);
    }

    // add product discount options
    async removeProductBulkDiscountOptions(productName: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.uncheck(productsVendor.bulkDiscount.enableBulkDiscount);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.bulkDiscount.enableBulkDiscount);
    }

    // dokan pro modules

    // add product geolocation
    async addProductGeolocation(productName: string, location: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.uncheck(productsVendor.geolocation.sameAsStore);
        await this.typeAndWaitForResponse(data.subUrls.gmap, productsVendor.geolocation.productLocation, location);
        await this.press(data.key.arrowDown);
        await this.press(data.key.enter);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.geolocation.sameAsStore);
        await this.toHaveValue(productsVendor.geolocation.productLocation, location);
    }

    // remove product geolocation
    async removeProductGeolocation(productName: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.check(productsVendor.geolocation.sameAsStore);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.geolocation.sameAsStore);
    }

    // add product EU compliance
    async addProductEuCompliance(productName: string, euCompliance: product['productInfo']['euCompliance']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.selectByValue(productsVendor.euComplianceFields.saleLabel, euCompliance.saleLabel);
        await this.selectByValue(productsVendor.euComplianceFields.saleRegularLabel, euCompliance.saleRegularLabel);
        await this.selectByValue(productsVendor.euComplianceFields.unit, euCompliance.unit);
        await this.selectByValue(productsVendor.euComplianceFields.minimumAge, euCompliance.minimumAge);
        await this.clearAndType(productsVendor.euComplianceFields.productUnits, euCompliance.productUnits);
        await this.clearAndType(productsVendor.euComplianceFields.basePriceUnits, euCompliance.basePriceUnits);
        if (euCompliance.freeShipping) {
            await this.check(productsVendor.euComplianceFields.freeShipping);
        } else {
            await this.uncheck(productsVendor.euComplianceFields.freeShipping);
        }
        await this.clearAndType(productsVendor.euComplianceFields.regularUnitPrice, euCompliance.regularUnitPrice);
        await this.clearAndType(productsVendor.euComplianceFields.saleUnitPrice, euCompliance.saleUnitPrice);
        await this.typeFrameSelector(productsVendor.euComplianceFields.optionalMiniDescription.descriptionIframe, productsVendor.euComplianceFields.optionalMiniDescription.descriptionHtmlBody, euCompliance.optionalMiniDescription);

        await this.saveProduct();

        await this.toHaveValue(productsVendor.euComplianceFields.saleLabel, euCompliance.saleLabel);
        await this.toHaveValue(productsVendor.euComplianceFields.saleRegularLabel, euCompliance.saleRegularLabel);
        await this.toHaveValue(productsVendor.euComplianceFields.unit, euCompliance.unit);
        await this.toHaveValue(productsVendor.euComplianceFields.minimumAge, euCompliance.minimumAge);
        await this.toHaveValue(productsVendor.euComplianceFields.productUnits, euCompliance.productUnits);
        await this.toHaveValue(productsVendor.euComplianceFields.basePriceUnits, euCompliance.basePriceUnits);
        if (euCompliance.freeShipping) {
            await this.toBeChecked(productsVendor.euComplianceFields.freeShipping);
        } else {
            await this.notToBeChecked(productsVendor.euComplianceFields.freeShipping);
        }
        await this.toHaveValue(productsVendor.euComplianceFields.regularUnitPrice, euCompliance.regularUnitPrice);
        await this.toHaveValue(productsVendor.euComplianceFields.saleUnitPrice, euCompliance.saleUnitPrice);
        await this.toContainTextFrameLocator(productsVendor.euComplianceFields.optionalMiniDescription.descriptionIframe, productsVendor.euComplianceFields.optionalMiniDescription.descriptionHtmlBody, euCompliance.optionalMiniDescription);
    }

    // add product addons
    async addProductAddon(productName: string, addon: product['productInfo']['addon']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.toPass(async () => {
            await this.clickAndWaitForResponse(data.subUrls.ajax, productsVendor.addon.addField);
            await this.toBeVisible(productsVendor.addon.addonForm);
        });

        await this.selectByValue(productsVendor.addon.type, addon.type);
        await this.selectByValue(productsVendor.addon.displayAs, addon.displayAs);
        await this.clearAndType(productsVendor.addon.titleRequired, addon.title);
        await this.selectByValue(productsVendor.addon.formatTitle, addon.formatTitle);
        await this.check(productsVendor.addon.addDescription);
        await this.clearAndType(productsVendor.addon.descriptionInput, addon.addDescription);
        await this.check(productsVendor.addon.requiredField);
        // option
        await this.clearAndType(productsVendor.addon.option.enterAnOption, addon.enterAnOption);
        await this.selectByValue(productsVendor.addon.option.optionPriceType, addon.optionPriceType);
        await this.clearAndType(productsVendor.addon.option.optionPriceInput, addon.optionPriceInput);
        await this.check(productsVendor.addon.excludeAddons);

        await this.saveProduct();

        await this.toBeVisible(productsVendor.addon.addonRow(addon.title));
        await this.click(productsVendor.addon.addonRow(addon.title));

        await this.toHaveSelectedValue(productsVendor.addon.type, addon.type);
        await this.toHaveSelectedValue(productsVendor.addon.displayAs, addon.displayAs);
        await this.toHaveValue(productsVendor.addon.titleRequired, addon.title);
        await this.toHaveSelectedValue(productsVendor.addon.formatTitle, addon.formatTitle);
        await this.toBeChecked(productsVendor.addon.addDescription);
        await this.toHaveValue(productsVendor.addon.descriptionInput, addon.addDescription);
        await this.toBeChecked(productsVendor.addon.requiredField);
        // option
        await this.toHaveValue(productsVendor.addon.option.enterAnOption, addon.enterAnOption);
        await this.toHaveSelectedValue(productsVendor.addon.option.optionPriceType, addon.optionPriceType);
        await this.toHaveValue(productsVendor.addon.option.optionPriceInput, addon.optionPriceInput);
        await this.toBeChecked(productsVendor.addon.excludeAddons);
    }

    // import addon
    async importAddon(productName: string, addon: string, addonTitle: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.click(productsVendor.addon.import);
        await this.clearAndType(productsVendor.addon.importInput, addon);
        await this.saveProduct();
        await this.toBeVisible(productsVendor.addon.addonRow(addonTitle));
    }

    // export addon
    async exportAddon(productName: string, addon: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.click(productsVendor.addon.export);
        await this.toContainText(productsVendor.addon.exportInput, addon);
    }

    // delete addon
    async removeAddon(productName: string, addonName: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.click(productsVendor.addon.removeAddon(addonName));
        await this.click(productsVendor.addon.confirmRemove);
        await this.notToBeVisible(productsVendor.addon.addonRow(addonName));
        await this.saveProduct();
        await this.notToBeVisible(productsVendor.addon.addonRow(addonName));
    }

    // add product rma options
    async addProductRmaOptions(productName: string, rma: vendor['rma']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.check(productsVendor.rma.overrideDefaultRmaSettings);
        await this.clearAndType(productsVendor.rma.label, rma.label);
        await this.selectByValue(productsVendor.rma.type, rma.type);

        if (rma.type === 'included_warranty') {
            await this.selectByValue(productsVendor.rma.length, rma.length);
            if (rma.length === 'limited') {
                await this.clearAndType(productsVendor.rma.lengthValue, rma.lengthValue);
                await this.selectByValue(productsVendor.rma.lengthDuration, rma.lengthDuration);
            }
        } else if (rma.type === 'addon_warranty') {
            await this.clearAndType(productsVendor.rma.addonCost, rma.addon.cost);
            await this.clearAndType(productsVendor.rma.addonDurationLength, rma.addon.durationLength);
            await this.selectByValue(productsVendor.rma.addonDurationType, rma.addon.durationType);
        }
        const refundReasonIsVisible = await this.isVisible(productsVendor.rma.refundReasonsFirst);
        if (refundReasonIsVisible) {
            await this.checkMultiple(productsVendor.rma.refundReasons);
        }
        await this.typeFrameSelector(productsVendor.rma.rmaPolicyIframe, productsVendor.rma.rmaPolicyHtmlBody, rma.refundPolicy);

        await this.saveProduct();

        await this.toBeChecked(productsVendor.rma.overrideDefaultRmaSettings);
        await this.toHaveValue(productsVendor.rma.label, rma.label);
        await this.toHaveSelectedValue(productsVendor.rma.type, rma.type);
        if (rma.type === 'included_warranty') {
            await this.toHaveSelectedValue(productsVendor.rma.length, rma.length);
            if (rma.length === 'limited') {
                await this.toHaveValue(productsVendor.rma.lengthValue, rma.lengthValue);
                await this.toHaveSelectedValue(productsVendor.rma.lengthDuration, rma.lengthDuration);
            }
        } else if (rma.type === 'addon_warranty') {
            await this.toHaveValue(productsVendor.rma.addonCost, rma.addon.cost);
            await this.toHaveValue(productsVendor.rma.addonDurationLength, rma.addon.durationLength);
            await this.toHaveSelectedValue(productsVendor.rma.addonDurationType, rma.addon.durationType);
        }

        if (refundReasonIsVisible) {
            await this.toBeCheckedMultiple(productsVendor.rma.refundReasons);
        }
        await this.toContainTextFrameLocator(productsVendor.rma.rmaPolicyIframe, productsVendor.rma.rmaPolicyHtmlBody, rma.refundPolicy);
    }

    // remove product rma options
    async removeProductRmaOptions(productName: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.uncheck(productsVendor.rma.overrideDefaultRmaSettings);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.rma.overrideDefaultRmaSettings);
    }

    // add product wholesale options
    async addProductWholesaleOptions(productName: string, wholesaleOption: product['productInfo']['wholesaleOption']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.check(productsVendor.wholesale.enableWholesale);
        await this.clearAndType(productsVendor.wholesale.wholesalePrice, wholesaleOption.wholesalePrice);
        await this.clearAndType(productsVendor.wholesale.minimumQuantity, wholesaleOption.minimumQuantity);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.wholesale.enableWholesale);
        await this.toHaveValue(productsVendor.wholesale.wholesalePrice, wholesaleOption.wholesalePrice);
        await this.toHaveValue(productsVendor.wholesale.minimumQuantity, wholesaleOption.minimumQuantity);
    }

    // remove product wholesale options
    async removeProductWholesaleOptions(productName: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.uncheck(productsVendor.wholesale.enableWholesale);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.wholesale.enableWholesale);
    }

    // add product min-max options
    async addProductMinMaxOptions(productName: string, minMaxOption: product['productInfo']['minMax']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.clearAndType(productsVendor.minMax.minimumQuantity, minMaxOption.minimumProductQuantity);
        await this.clearAndType(productsVendor.minMax.maximumQuantity, minMaxOption.maximumProductQuantity);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.minMax.minimumQuantity, minMaxOption.minimumProductQuantity);
        await this.toHaveValue(productsVendor.minMax.maximumQuantity, minMaxOption.maximumProductQuantity);
    }

    // can't add product min greater than max
    async cantAddGreaterMin(productName: string, minMaxOption: product['productInfo']['minMax']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.clearAndType(productsVendor.minMax.minimumQuantity, minMaxOption.minimumProductQuantity);
        await this.clearAndType(productsVendor.minMax.maximumQuantity, minMaxOption.maximumProductQuantity);
        await this.press('Tab'); // to trigger validation
        await this.toHaveValue(productsVendor.minMax.maximumQuantity, minMaxOption.minimumProductQuantity);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.minMax.minimumQuantity, minMaxOption.minimumProductQuantity);
        await this.toHaveValue(productsVendor.minMax.maximumQuantity, minMaxOption.minimumProductQuantity);
    }

    // remove product min-max options
    async removeProductMinMaxOptions(productName: string, minMaxOption: product['productInfo']['minMax']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.clearAndType(productsVendor.minMax.minimumQuantity, minMaxOption.minimumProductQuantity);
        await this.clearAndType(productsVendor.minMax.maximumQuantity, minMaxOption.maximumProductQuantity);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.minMax.minimumQuantity, '0');
        await this.toHaveValue(productsVendor.minMax.maximumQuantity, '0');
    }
}
