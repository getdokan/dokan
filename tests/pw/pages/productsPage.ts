import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { product } from '@utils/interfaces';

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
        await this.click(productsAdmin.product.general);
        await this.type(productsAdmin.product.regularPrice, product.regularPrice());
        await this.click(productsAdmin.product.category(product.category));

        // stock status
        if (product.stockStatus) {
            await this.click(productsAdmin.product.inventory);
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
        await this.click(productsAdmin.product.attributes);

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
        await this.click(productsAdmin.product.variations);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, productsAdmin.product.generateVariations);
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
        await this.click(productsAdmin.product.general);
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
        await this.click(productsAdmin.product.attributes);

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
        await this.click(productsAdmin.product.variations);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, productsAdmin.product.generateVariations);
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
        await this.click(productsAdmin.product.general);
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
        await this.click(productsAdmin.product.general);
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

    // view product
    async viewProduct(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.hover(productsVendor.productCell(productName));
        await this.clickAndWaitForLoadState(productsVendor.view(productName));
        await expect(this.page).toHaveURL(data.subUrls.frontend.productDetails(helpers.slugify(productName)) + '/');
        const { quantity, addToCart, viewCart, euComplianceData, productAddedSuccessMessage, productWithQuantityAddedSuccessMessage, ...productDetails } = selector.customer.cSingleProduct.productDetails;
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
        await this.hover(productsVendor.productCell(product.editProduct));
        await this.click(productsVendor.quickEdit(product.editProduct));

        await this.clearAndType(productsVendor.quickEditProduct.title, product.editProduct);
        // todo:  add more fields

        await this.clickAndWaitForResponse(data.subUrls.ajax, productsVendor.quickEditProduct.update);
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
}
