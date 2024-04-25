import { Page, expect } from '@playwright/test';
import { AdminPage } from '@pages/adminPage';
// import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { product, vendor } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const productsAdmin = selector.admin.products;
const productsVendor = selector.vendor.product;

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
        await this.clickAndWaitForResponse(data.subUrls.backend.wc.taxonomy, productsAdmin.attribute.configureTerms(attribute.attributeName));

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
        // await this.wait(2);

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

        // // Vendor Store Name
        // await this.select2ByText(productsAdmin.product.storeName, productsAdmin.product.storeNameInput, product.storeName);
        // await this.scrollToTop();

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
        await this.toBeVisible(productsVendor.create.addNewProduct);

        // import export is visible
        DOKAN_PRO && (await this.multipleElementVisible(productsVendor.importExport));

        // product filters elements are visible
        const { filterByType, filterByOther, ...filters } = productsVendor.filters;
        await this.multipleElementVisible(filters);
        DOKAN_PRO && (await this.toBeVisible(filterByType));
        DOKAN_PRO && (await this.toBeVisible(filterByOther));

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
    async addProduct(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        await this.clickAndWaitForLoadState(productsVendor.create.addNewProduct);
        await this.clearAndType(productsVendor.edit.title, productName);
    }

    // vendor add simple product
    async vendorAddSimpleProduct(product: product['simple'] | product['variable'] | product['simpleSubscription'] | product['external'], productPopup = false): Promise<void> {
        const productName = product.productName();
        const productPrice = product.regularPrice();
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        if (productPopup) {
            await this.click(productsVendor.create.addNewProduct);
            await this.waitForVisibleLocator(productsVendor.create.productName);
            await this.clearAndType(productsVendor.create.productName, productName);
            await this.clearAndType(productsVendor.create.productPrice, productPrice);
            // await this.addProductCategory(product.category);

            await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, productsVendor.create.createProduct);
            const createdProduct = await this.getElementValue(productsVendor.edit.title);
            expect(createdProduct.toLowerCase()).toBe(productName.toLowerCase());
        } else {
            await this.clickAndWaitForLoadState(productsVendor.create.addNewProduct);
            await this.clearAndType(productsVendor.edit.title, productName);
            await this.clearAndType(productsVendor.edit.price, productPrice);
            // await this.addProductCategory(product.category);

            await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
            await this.toContainText(productsVendor.dokanMessage, 'The product has been saved successfully. ');
            await this.toHaveValue(productsVendor.edit.title, productName);
            await this.toHaveValue(productsVendor.create.productPrice, productPrice);
        }
    }

    // vendor add downloadable product
    async vendorAddDownloadableProduct(product: product['downloadable'], productPopup = false): Promise<void> {
        const productName = product.productName();
        const productPrice = product.regularPrice();
        productPopup ? await this.vendorAddSimpleProduct(product, productPopup) : await this.addProduct(productName);
        await this.clearAndType(productsVendor.create.productPrice, productPrice);
        await this.check(productsVendor.edit.downloadable);
        // await this.addProductCategory(product.category);

        await this.click(productsVendor.downloadableOptions.addFile);
        await this.clearAndType(productsVendor.downloadableOptions.fileName, product.downloadableOptions.fileName);
        await this.click(productsVendor.downloadableOptions.chooseFile);
        await this.uploadMedia(product.downloadableOptions.fileUrl);
        await this.clearAndType(productsVendor.downloadableOptions.downloadLimit, product.downloadableOptions.downloadLimit);
        await this.clearAndType(productsVendor.downloadableOptions.downloadExpiry, product.downloadableOptions.downloadExpiry);

        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, product.saveSuccessMessage);
        await this.toHaveValue(productsVendor.edit.title, productName);
        await this.toHaveValue(productsVendor.create.productPrice, productPrice);
        await this.toBeChecked(productsVendor.edit.downloadable);
        await this.toHaveValue(productsVendor.downloadableOptions.fileName, product.downloadableOptions.fileName);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadLimit, product.downloadableOptions.downloadLimit);
        await this.toHaveValue(productsVendor.downloadableOptions.downloadExpiry, product.downloadableOptions.downloadExpiry);
    }

    // vendor add virtual product
    async vendorAddVirtualProduct(product: product['simple'], productPopup = false): Promise<void> {
        const productName = product.productName();
        const productPrice = product.regularPrice();
        productPopup ? await this.vendorAddSimpleProduct(product, productPopup) : await this.addProduct(productName);
        await this.clearAndType(productsVendor.create.productPrice, productPrice);
        await this.check(productsVendor.edit.virtual);
        // await this.addProductCategory(product.category);

        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, product.saveSuccessMessage);
        await this.toHaveValue(productsVendor.edit.title, productName);
        await this.toHaveValue(productsVendor.create.productPrice, productPrice);
        await this.toBeChecked(productsVendor.edit.virtual);
        await this.notToBeVisible(productsVendor.shipping.shippingContainer);
    }

    // vendor add variable product
    async vendorAddVariableProduct(product: product['variable'], productPopup = false): Promise<void> {
        const productName = product.productName();
        productPopup ? await this.vendorAddSimpleProduct(product, productPopup) : await this.addProduct(productName);

        // edit product
        await this.selectByValue(productsVendor.edit.productType, product.productType);
        // add variation
        await this.selectByValue(productsVendor.attribute.customProductAttribute, `pa_${product.attribute}`);
        await this.click(productsVendor.attribute.addAttribute);
        await this.click(productsVendor.attribute.selectAll);
        await this.click(productsVendor.attribute.usedForVariations);
        await this.click(productsVendor.attribute.saveAttributes);
        await this.selectByValue(productsVendor.attribute.addVariations, product.variations.linkAllVariation);
        await this.click(productsVendor.attribute.go);
        await this.click(productsVendor.attribute.confirmGo);
        await this.click(productsVendor.attribute.okSuccessAlertGo);
        await this.selectByValue(productsVendor.attribute.addVariations, product.variations.variableRegularPrice);
        await this.click(productsVendor.attribute.go);
        await this.type(productsVendor.attribute.variationPrice, product.regularPrice());
        await this.click(productsVendor.attribute.okVariationPrice);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, product.saveSuccessMessage);
        await this.toHaveValue(productsVendor.edit.title, productName);
    }

    // vendor add simple subscription product
    async vendorAddSimpleSubscription(product: product['simpleSubscription'], productPopup = false): Promise<void> {
        const productName = product.productName();
        productPopup ? await this.vendorAddSimpleProduct(product, productPopup) : await this.addProduct(productName);
        // edit product
        await this.selectByValue(productsVendor.edit.productType, product.productType);
        await this.type(productsVendor.edit.subscriptionPrice, product.subscriptionPrice());
        await this.selectByValue(productsVendor.edit.subscriptionPeriodInterval, product.subscriptionPeriodInterval);
        await this.selectByValue(productsVendor.edit.subscriptionPeriod, product.subscriptionPeriod);
        await this.selectByValue(productsVendor.edit.expireAfter, product.expireAfter);
        await this.type(productsVendor.edit.subscriptionTrialLength, product.subscriptionTrialLength);
        await this.selectByValue(productsVendor.edit.subscriptionTrialPeriod, product.subscriptionTrialPeriod);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, product.saveSuccessMessage);
        await this.toHaveValue(productsVendor.edit.title, productName);
        //todo: add more assertions
    }

    // vendor add variable subscription product
    async vendorAddVariableSubscription(product: product['variableSubscription'], productPopup = false): Promise<void> {
        const productName = product.productName();
        productPopup ? await this.vendorAddSimpleProduct(product, productPopup) : await this.addProduct(productName);
        // edit product
        await this.selectByValue(productsVendor.edit.productType, product.productType);
        // add variation
        await this.selectByValue(productsVendor.attribute.customProductAttribute, `pa_${product.attribute}`);
        await this.click(productsVendor.attribute.addAttribute);
        await this.click(productsVendor.attribute.selectAll);
        await this.click(productsVendor.attribute.usedForVariations);
        await this.click(productsVendor.attribute.saveAttributes);
        await this.selectByValue(productsVendor.attribute.addVariations, product.variations.linkAllVariation);
        await this.click(productsVendor.attribute.go);
        await this.click(productsVendor.attribute.confirmGo);
        await this.click(productsVendor.attribute.okSuccessAlertGo);
        await this.selectByValue(productsVendor.attribute.addVariations, product.variations.variableRegularPrice);
        await this.click(productsVendor.attribute.go);
        await this.type(productsVendor.attribute.variationPrice, product.regularPrice());
        await this.click(productsVendor.attribute.okVariationPrice);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, product.saveSuccessMessage);
        await this.toHaveValue(productsVendor.edit.title, productName);
        //todo: add more assertions
    }

    // vendor add external product
    async vendorAddExternalProduct(product: product['external'], productPopup = false): Promise<void> {
        const productName = product.productName();
        productPopup ? await this.vendorAddSimpleProduct(product, productPopup) : await this.addProduct(productName);
        // edit product
        await this.selectByValue(productsVendor.edit.productType, product.productType);
        await this.type(productsVendor.edit.productUrl, this.getBaseUrl() + product.productUrl);
        await this.type(productsVendor.edit.buttonText, product.buttonText);
        await this.clearAndType(productsVendor.edit.price, product.regularPrice());
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, product.saveSuccessMessage);
        await this.toHaveValue(productsVendor.edit.title, productName);
        //todo: add more assertions
    }

    // go to product edit
    async goToProductEdit(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.hover(productsVendor.productCell(productName));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.editProduct(productName));
        await this.toHaveValue(productsVendor.edit.title, productName);
    }

    // vendor add product category
    async addProductCategory(category: string): Promise<void> {
        const productPopup = await this.isVisible(productsVendor.create.productPopup);
        productPopup ? await this.click(productsVendor.category.productCategoryModalOnProductPopup) : await this.click(productsVendor.category.productCategoryModal);
        await this.waitForVisibleLocator(productsVendor.category.productCategorySearchInput);
        await this.type(productsVendor.category.productCategorySearchInput, category);
        await this.toContainText(productsVendor.category.searchedResultText, category);
        await this.click(productsVendor.category.productCategorySearchResult);
        await this.click(productsVendor.category.productCategoryDone);

        const categoryAlreadySelectedPopup = await this.isVisible(productsVendor.category.productCategoryAlreadySelectedPopup);
        if (categoryAlreadySelectedPopup) {
            await this.click(productsVendor.category.productCategoryAlreadySelectedPopup);
            await this.click(productsVendor.category.productCategoryModalClose);
        }
        // todo: add multiple category selection
    }

    // vendor add product category on product edit
    async vendorAddProductCategory(productName: string, category: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.addProductCategory(category);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, 'Success! The product has been saved successfully.');
    }

    // export product
    async exportProducts(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
        await this.clickAndWaitForLoadState(productsVendor.importExport.export);
        await this.clickAndWaitForDownload(selector.vendor.vTools.export.csv.generateCsv);
    }

    // search product vendor dashboard
    async searchProduct(productName: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

        await this.clearAndType(productsVendor.search.searchInput, productName);
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, productsVendor.search.searchBtn);
        await this.toBeVisible(productsVendor.productLink(productName));
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

    // view product
    async viewProduct(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.hover(productsVendor.productCell(productName));
        await this.clickAndWaitForLoadState(productsVendor.view(productName));
        await expect(this.page).toHaveURL(data.subUrls.frontend.productDetails(helpers.slugify(productName)) + '/');
        const { quantity, addToCart, viewCart, ...productDetails } = selector.customer.cSingleProduct.productDetails;
        await this.multipleElementVisible(productDetails);
    }

    // vendor can't buy own  product
    async cantBuyOwnProduct(productName: string) {
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
        await this.notToBeVisible(selector.customer.cSingleProduct.productDetails.quantity);
        await this.notToBeVisible(selector.customer.cSingleProduct.productDetails.addToCart);
    }

    // edit product
    async editProduct(product: product['simple']): Promise<void> {
        await this.goToProductEdit(product.editProduct);

        await this.clearAndType(productsVendor.edit.title, product.editProduct); // don't update name below test needs same product
        await this.clearAndType(productsVendor.edit.price, product.regularPrice());
        // todo:  add more fields

        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.dokanMessage, 'The product has been saved successfully. ');
    }

    // product edit

    // add product description
    async addProductDescription(productName: string, description: product['productInfo']['description']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.typeFrameSelector(productsVendor.shortDescription.shortDescriptionIframe, productsVendor.shortDescription.shortDescriptionHtmlBody, description.shortDescription);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, description.description);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, data.product.createUpdateSaveSuccessMessage);
        // todo: add more assertions
    }

    // add product quantity discount
    async addProductQuantityDiscount(productName: string, quantityDiscount: product['productInfo']['quantityDiscount']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.check(productsVendor.discount.enableBulkDiscount); // todo: need to fix
        await this.clearAndType(productsVendor.discount.lotMinimumQuantity, quantityDiscount.minimumQuantity);
        await this.clearAndType(productsVendor.discount.lotDiscountInPercentage, quantityDiscount.discountPercentage);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, data.product.createUpdateSaveSuccessMessage);
        // todo: add more assertions
    }

    // vendor add product rma options
    async addProductRmaOptions(productName: string, rma: vendor['rma']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.check(productsVendor.rma.overrideYourDefaultRmaSettingsForThisProduct);
        await this.clearAndType(productsVendor.rma.label, rma.label);
        await this.selectByValue(productsVendor.rma.type, rma.type);
        await this.selectByValue(productsVendor.rma.length, rma.rmaLength);
        // todo: add rma as addon
        if (rma.rmaLength === 'limited') {
            await this.clearAndType(productsVendor.rma.lengthValue, rma.lengthValue);
            await this.selectByValue(productsVendor.rma.lengthDuration, rma.lengthDuration);
        }
        const refundReasonIsVisible = await this.isVisible(productsVendor.rma.refundReasonsFirst);
        if (refundReasonIsVisible) {
            await this.checkMultiple(productsVendor.rma.refundReasons);
        }
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, data.product.createUpdateSaveSuccessMessage);
        //todo: add more assertions
    }

    // add product Wholesale options
    async addProductWholesaleOptions(productName: string, wholesaleOption: product['productInfo']['wholesaleOption']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.check(productsVendor.wholesale.enableWholeSaleForThisProduct);
        await this.clearAndType(productsVendor.wholesale.wholesalePrice, wholesaleOption.wholesalePrice);
        await this.clearAndType(productsVendor.wholesale.minimumQuantityForWholesale, wholesaleOption.minimumWholesaleQuantity);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, data.product.createUpdateSaveSuccessMessage);
        await this.toHaveValue(productsVendor.wholesale.wholesalePrice, wholesaleOption.wholesalePrice);
        await this.toHaveValue(productsVendor.wholesale.minimumQuantityForWholesale, wholesaleOption.minimumWholesaleQuantity);
    }

    // add product min-max options
    async addProductMinMaxOptions(productName: string, minMaxOption: product['productInfo']['minMax']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.check(productsVendor.minMax.enableMinMaxRulesThisProduct);
        await this.clearAndType(productsVendor.minMax.minimumQuantity, minMaxOption.minimumProductQuantity);
        await this.clearAndType(productsVendor.minMax.maximumQuantity, minMaxOption.maximumProductQuantity);
        await this.clearAndType(productsVendor.minMax.minimumAmount, minMaxOption.minimumAmount);
        await this.clearAndType(productsVendor.minMax.maximumAmount, minMaxOption.maximumAmount);
        await this.check(productsVendor.minMax.orderRulesDoNotCount);
        await this.check(productsVendor.minMax.categoryRulesExclude);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, data.product.createUpdateSaveSuccessMessage);
        await this.toBeChecked(productsVendor.minMax.enableMinMaxRulesThisProduct);
        await this.toHaveValue(productsVendor.minMax.minimumQuantity, minMaxOption.minimumProductQuantity);
        await this.toHaveValue(productsVendor.minMax.maximumQuantity, minMaxOption.maximumProductQuantity);
        await this.toHaveValue(productsVendor.minMax.minimumAmount, minMaxOption.minimumAmount);
        await this.toHaveValue(productsVendor.minMax.maximumAmount, minMaxOption.maximumAmount);
        await this.toBeChecked(productsVendor.minMax.orderRulesDoNotCount);
        await this.toBeChecked(productsVendor.minMax.categoryRulesExclude);
    }

    // add product other (product status, visibility, purchase note, reviews) options
    async addProductOtherOptions(productName: string, otherOption: product['productInfo']['otherOptions']): Promise<void> {
        await this.goToProductEdit(productName);
        await this.selectByValue(productsVendor.otherOptions.productStatus, otherOption.productStatus);
        await this.selectByValue(productsVendor.otherOptions.visibility, otherOption.visibility);
        await this.clearAndType(productsVendor.otherOptions.purchaseNote, otherOption.purchaseNote);
        await this.check(productsVendor.otherOptions.enableProductReviews);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, data.product.createUpdateSaveSuccessMessage);
        //todo: add more assertion
        await this.toHaveValue(productsVendor.otherOptions.purchaseNote, otherOption.purchaseNote);
        await this.toBeChecked(productsVendor.otherOptions.enableProductReviews);
    }

    // add product description
    async addCatalogMode(productName: string): Promise<void> {
        await this.goToProductEdit(productName);
        await this.check(productsVendor.catalogMode.removeAddToCart);
        await this.check(productsVendor.catalogMode.hideProductPrice);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, productsVendor.saveProduct, 302);
        await this.toContainText(productsVendor.updatedSuccessMessage, data.product.createUpdateSaveSuccessMessage);
        await this.toBeChecked(productsVendor.catalogMode.removeAddToCart);
        await this.toBeChecked(productsVendor.catalogMode.hideProductPrice);
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
        productName ? await this.searchProduct(productName) : await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

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
}
