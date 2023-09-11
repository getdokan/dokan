import { Page, expect } from '@playwright/test';
import { AdminPage } from 'pages/adminPage';
// import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { helpers } from 'utils/helpers';
import { product, vendor } from 'utils/interfaces';


const { DOKAN_PRO } = process.env;


export class ProductsPage extends AdminPage {

	constructor(page: Page) {
		super(page);
	}


	// admin add product category
	async addCategory(categoryName: string) {
		await this.goIfNotThere(data.subUrls.backend.wc.addNewCategories);
		await this.fill(selector.admin.products.category.name, categoryName);
		await this.fill(selector.admin.products.category.slug, categoryName);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.products.category.addNewCategory);
		await this.toBeVisible(selector.admin.products.category.categoryCell(categoryName));
	}


	// admin add product attribute
	async addAttribute(attribute: product['attribute']) {
		await this.goIfNotThere(data.subUrls.backend.wc.addNewAttributes);
		await this.fill(selector.admin.products.attribute.name, attribute.attributeName);
		await this.fill(selector.admin.products.attribute.slug, attribute.attributeName);
		await this.clickAndWaitForResponse(data.subUrls.backend.wc.addNewAttributes, selector.admin.products.attribute.addAttribute);
		await this.toBeVisible(selector.admin.products.attribute.attributeCell(attribute.attributeName));
		await this.clickAndWaitForResponse(data.subUrls.backend.wc.taxonomy, selector.admin.products.attribute.configureTerms(attribute.attributeName));

		// add new term
		for (const attributeTerm of attribute.attributeTerms) {
			await this.fill(selector.admin.products.attribute.attributeTerm, attributeTerm);
			await this.fill(selector.admin.products.attribute.attributeTermSlug, attributeTerm);
			await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.products.attribute.addAttributeTerm);
			await this.toBeVisible(selector.admin.products.attribute.attributeTermCell(attributeTerm));
		}
	}


	// admin add simple product
	async addSimpleProduct(product: product['simple']) {
		await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

		// product basic info
		await this.type(selector.admin.products.product.productName, product.productName());
		await this.selectByValue(selector.admin.products.product.productType, product.productType);
		await this.click(selector.admin.products.product.general);
		await this.type(selector.admin.products.product.regularPrice, product.regularPrice());
		await this.click(selector.admin.products.product.category(product.category));

		// stock status
		if (product.stockStatus){
			await this.click(selector.admin.products.product.inventory);
			await this.selectByValue(selector.admin.products.product.stockStatus, data.product.stockStatus.outOfStock);
		}

		// vendor Store Name
		await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName);
		await this.scrollToTop();

		switch (product.status) {

		case 'publish' :
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.products.product.publish);
			await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.publishSuccessMessage);
			break;

		case 'draft' :
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, selector.admin.products.product.saveDraft, 302);
			await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.draftUpdateSuccessMessage);
			break;

		case 'pending' :
			await this.click(selector.admin.products.product.editStatus);
			await this.selectByValue(selector.admin.products.product.status, data.product.status.pending);
			await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, selector.admin.products.product.saveDraft, 302);
			await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.pendingProductUpdateSuccessMessage);
			break;

		default :
			break;
		}
	}


	// admin add variable product
	async addVariableProduct(product: product['variable']) {
		await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

		// name
		await this.type(selector.admin.products.product.productName, product.productName());
		await this.selectByValue(selector.admin.products.product.productType, product.productType);

		// add attributes
		await this.click(selector.admin.products.product.attributes);

		if (await this.isVisibleLocator(selector.admin.products.product.customProductAttribute)) {
			await this.selectByValue(selector.admin.products.product.customProductAttribute, `pa_${product.attribute}`);
			await this.click(selector.admin.products.product.addAttribute);
		} else {
			await this.clickAndWaitForResponse(data.subUrls.backend.wc.searchAttribute, selector.admin.products.product.addExistingAttribute);
			await this.typeAndWaitForResponse(data.subUrls.backend.wc.term, selector.admin.products.product.addExistingAttributeInput, product.attribute);
			await this.pressAndWaitForResponse(data.subUrls.ajax, data.key.enter);
		}

		await this.clickAndWaitForResponse(data.subUrls.backend.wc.taxonomyTerms, selector.admin.products.product.selectAll);
		await this.check(selector.admin.products.product.usedForVariations);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.products.product.saveAttributes);

		// add variations
		await this.click(selector.admin.products.product.variations);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.admin.products.product.generateVariations);
		this.fillAlert('100');
		await this.selectByValue(selector.admin.products.product.addVariations, product.variations.variableRegularPrice);

		// category
		await this.click(selector.admin.products.product.category(product.category));

		// Vendor Store Name
		await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName);
		await this.scrollToTop();

		// Publish
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, selector.admin.products.product.publish, 302);
		await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.publishSuccessMessage);
	}


	// Admin Add Simple Subscription Product
	async addSimpleSubscription(product: product['simpleSubscription']) {
		await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

		// Name
		await this.type(selector.admin.products.product.productName, product.productName());
		await this.selectByValue(selector.admin.products.product.productType, product.productType);
		await this.click(selector.admin.products.product.general);
		await this.type(selector.admin.products.product.subscriptionPrice, product.subscriptionPrice());
		await this.selectByValue(selector.admin.products.product.subscriptionPeriodInterval, product.subscriptionPeriodInterval);
		await this.selectByValue(selector.admin.products.product.subscriptionPeriod, product.subscriptionPeriod);
		await this.selectByValue(selector.admin.products.product.expireAfter, product.expireAfter);
		await this.type(selector.admin.products.product.subscriptionTrialLength, product.subscriptionTrialLength);
		await this.selectByValue(selector.admin.products.product.subscriptionTrialPeriod, product.subscriptionTrialPeriod);

		// Category
		await this.click(selector.admin.products.product.category(product.category));

		// Vendor Store Name
		await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName);
		await this.scrollToTop();

		// Publish
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, selector.admin.products.product.publish, 302);

		await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.publishSuccessMessage);
	}


	// admin add variable product
	async addVariableSubscription(product: product['variableSubscription']) {
		await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

		// name
		await this.type(selector.admin.products.product.productName, product.productName());
		await this.selectByValue(selector.admin.products.product.productType, product.productType);

		// add attributes
		await this.click(selector.admin.products.product.attributes);

		if (await this.isVisibleLocator(selector.admin.products.product.customProductAttribute)) {
			await this.selectByValue(selector.admin.products.product.customProductAttribute, `pa_${product.attribute}`);
			await this.click(selector.admin.products.product.addAttribute);
		} else {
			await this.clickAndWaitForResponse(data.subUrls.backend.wc.searchAttribute, selector.admin.products.product.addExistingAttribute);
			await this.typeAndWaitForResponse(data.subUrls.backend.wc.term, selector.admin.products.product.addExistingAttributeInput, product.attribute);
			await this.pressAndWaitForResponse(data.subUrls.ajax, data.key.enter);
		}

		await this.clickAndWaitForResponse(data.subUrls.backend.wc.taxonomyTerms, selector.admin.products.product.selectAll);
		await this.check(selector.admin.products.product.usedForVariations);
		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.admin.products.product.saveAttributes);
		// await this.wait(2);

		// add variations
		await this.click(selector.admin.products.product.variations);
		await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, selector.admin.products.product.generateVariations);
		this.fillAlert('100');
		await this.selectByValue(selector.admin.products.product.addVariations, product.variations.variableRegularPrice);

		// category
		await this.click(selector.admin.products.product.category(product.category));

		// Vendor Store Name
		await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName);
		await this.scrollToTop();

		// Publish
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, selector.admin.products.product.publish, 302);
		await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.publishSuccessMessage);
	}


	// Admin Add External Product
	async addExternalProduct(product: product['external']) {
		await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

		// Name
		await this.type(selector.admin.products.product.productName, product.productName());
		await this.selectByValue(selector.admin.products.product.productType, product.productType);
		await this.click(selector.admin.products.product.general);
		await this.type(selector.admin.products.product.productUrl, this.getBaseUrl() + product.productUrl);
		await this.type(selector.admin.products.product.buttonText, product.buttonText);
		await this.type(selector.admin.products.product.regularPrice, product.regularPrice());

		// Category
		await this.click(selector.admin.products.product.category(product.category));

		// Vendor Store Name
		await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName);
		await this.scrollToTop();

		// Publish
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, selector.admin.products.product.publish, 302);
		await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.publishSuccessMessage);
	}


	// Admin Add Dokan Subscription Product
	async addDokanSubscription(product: product['vendorSubscription']) {
		await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

		// Name
		await this.type(selector.admin.products.product.productName, product.productName());
		await this.selectByValue(selector.admin.products.product.productType, product.productType);
		await this.click(selector.admin.products.product.general);
		await this.type(selector.admin.products.product.regularPrice, product.regularPrice());

		// Category
		await this.click(selector.admin.products.product.category(product.category));

		// Subscription Details
		await this.type(selector.admin.products.product.numberOfProducts, product.numberOfProducts);
		await this.type(selector.admin.products.product.packValidity, product.packValidity);
		await this.type(selector.admin.products.product.advertisementSlot, product.advertisementSlot);
		await this.type(selector.admin.products.product.expireAfterDays, product.expireAfterDays);
		await this.click(selector.admin.products.product.recurringPayment);

		// // Vendor Store Name
		// await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName);
		// await this.scrollToTop();

		// Publish
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, selector.admin.products.product.publish, 302);
		await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.publishSuccessMessage);
	}


	// vendor


	// products render properly
	async vendorProductsRenderProperly(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

		// product nav menus are visible
		const { draft, pendingReview, ...menus } = selector.vendor.product.menus;
		await this.multipleElementVisible(menus);

		// add new product is visible
		await this.toBeVisible(selector.vendor.product.create.addNewProduct);

		// import export is visible
		DOKAN_PRO && await this.multipleElementVisible(selector.vendor.product.importExport);

		// product filters elements are visible
		// await this.multipleElementVisible(selector.vendor.product.filters); //todo:  issue not fixed yet

		// product search elements are visible
		await this.multipleElementVisible(selector.vendor.product.search);

		// bulk action elements are visible
		await this.multipleElementVisible(selector.vendor.product.bulkActions);

		// table elements are visible
		const { productAdvertisementColumn, ...table } = selector.vendor.product.table;
		await this.multipleElementVisible(table);
	}

	// products


	// vendor add simple product
	async vendorAddSimpleProduct(product: product['simple'] | product['variable'] | product['simpleSubscription'] | product['external']): Promise<void> {
		const productName = product.productName();
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
		await this.click(selector.vendor.product.create.addNewProduct);
		await this.waitForVisibleLocator(selector.vendor.product.create.productName);
		await this.clearAndType(selector.vendor.product.create.productName, productName);
		await this.clearAndType(selector.vendor.product.create.productPrice, product.regularPrice());
		// await this.addProductCategory(product.category);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.product.create.createProduct);
		const createdProduct = await this.getElementValue(selector.vendor.product.edit.title);
		expect(createdProduct.toLowerCase()).toBe(productName.toLowerCase());
	}


	// vendor add variable product
	async vendorAddVariableProduct(product: product['variable'] ): Promise<void> {
		await this.vendorAddSimpleProduct(product);

		// edit product
		await this.selectByValue(selector.vendor.product.edit.productType, product.productType);
		// add variation
		await this.selectByValue(selector.vendor.product.attribute.customProductAttribute, `pa_${product.attribute}`);
		await this.click(selector.vendor.product.attribute.addAttribute);
		await this.click(selector.vendor.product.attribute.selectAll);
		await this.click(selector.vendor.product.attribute.usedForVariations);
		await this.click(selector.vendor.product.attribute.saveAttributes);
		await this.selectByValue(selector.vendor.product.attribute.addVariations, product.variations.linkAllVariation);
		await this.click(selector.vendor.product.attribute.go);
		await this.click(selector.vendor.product.attribute.confirmGo);
		await this.click(selector.vendor.product.attribute.okSuccessAlertGo);
		await this.selectByValue(selector.vendor.product.attribute.addVariations, product.variations.variableRegularPrice);
		await this.click(selector.vendor.product.attribute.go);
		await this.type(selector.vendor.product.attribute.variationPrice, product.regularPrice());
		await this.click(selector.vendor.product.attribute.okVariationPrice);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		await this.toContainText(selector.vendor.product.updatedSuccessMessage, product.saveSuccessMessage);
	}


	// vendor add simple subscription product
	async vendorAddSimpleSubscription(product: product['simpleSubscription']): Promise<void> {
		await this.vendorAddSimpleProduct(product);
		// edit product
		await this.selectByValue(selector.vendor.product.edit.productType, product.productType);
		await this.type(selector.vendor.product.edit.subscriptionPrice, product.subscriptionPrice());
		await this.selectByValue(selector.vendor.product.edit.subscriptionPeriodInterval, product.subscriptionPeriodInterval);
		await this.selectByValue(selector.vendor.product.edit.subscriptionPeriod, product.subscriptionPeriod);
		await this.selectByValue(selector.vendor.product.edit.expireAfter, product.expireAfter);
		await this.type(selector.vendor.product.edit.subscriptionTrialLength, product.subscriptionTrialLength);
		await this.selectByValue(selector.vendor.product.edit.subscriptionTrialPeriod, product.subscriptionTrialPeriod);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		await this.toContainText(selector.vendor.product.updatedSuccessMessage, product.saveSuccessMessage);
	}


	// vendor add variable subscription product
	async vendorAddVariableSubscription(product: product['variableSubscription']): Promise<void> {
		await this.vendorAddSimpleProduct(product);
		// edit product
		await this.selectByValue(selector.vendor.product.edit.productType, product.productType);
		// add variation
		await this.selectByValue(selector.vendor.product.attribute.customProductAttribute, `pa_${product.attribute}`);
		await this.click(selector.vendor.product.attribute.addAttribute);
		await this.click(selector.vendor.product.attribute.selectAll);
		await this.click(selector.vendor.product.attribute.usedForVariations);
		await this.click(selector.vendor.product.attribute.saveAttributes);
		await this.selectByValue(selector.vendor.product.attribute.addVariations, product.variations.linkAllVariation);
		await this.click(selector.vendor.product.attribute.go);
		await this.click(selector.vendor.product.attribute.confirmGo);
		await this.click(selector.vendor.product.attribute.okSuccessAlertGo);
		await this.selectByValue(selector.vendor.product.attribute.addVariations, product.variations.variableRegularPrice);
		await this.click(selector.vendor.product.attribute.go);
		await this.type(selector.vendor.product.attribute.variationPrice, product.regularPrice());
		await this.click(selector.vendor.product.attribute.okVariationPrice);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		await this.toContainText(selector.vendor.product.updatedSuccessMessage, product.saveSuccessMessage);
	}


	// vendor add external product
	async vendorAddExternalProduct(product: product['external']): Promise<void> {
		await this.vendorAddSimpleProduct(product);
		// edit product
		await this.selectByValue(selector.vendor.product.edit.productType, product.productType);
		await this.type(selector.vendor.product.edit.productUrl, this.getBaseUrl() + product.productUrl);
		await this.type(selector.vendor.product.edit.buttonText, product.buttonText);
		await this.clearAndType(selector.vendor.product.edit.price, product.regularPrice());
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		await this.toContainText(selector.vendor.product.updatedSuccessMessage, product.saveSuccessMessage);
	}


	// go to product edit
	async goToProductEdit(productName: string): Promise<void> {
		await this.searchProduct(productName);
		await this.hover(selector.vendor.product.productCell(productName));
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.product.editProduct(productName));
		await this.toHaveValue(selector.vendor.product.edit.title, productName);
	}


	// vendor add product category
	async addProductCategory(category: string): Promise<void> {
		const productPopup = await this.isVisible(selector.vendor.product.create.productPopup);
		productPopup ? await this.click(selector.vendor.product.category.productCategoryModalOnProductPopup) : await this.click(selector.vendor.product.category.productCategoryModal);
		await this.waitForVisibleLocator(selector.vendor.product.category.productCategorySearchInput);
		await this.type(selector.vendor.product.category.productCategorySearchInput, category);
		await this.toContainText(selector.vendor.product.category.searchedResultText, category);
		await this.click(selector.vendor.product.category.productCategorySearchResult);
		await this.click(selector.vendor.product.category.productCategoryDone);

		const categoryAlreadySelectedPopup = await this.isVisible(selector.vendor.product.category.productCategoryAlreadySelectedPopup);
		if (categoryAlreadySelectedPopup) {
			await this.click(selector.vendor.product.category.productCategoryAlreadySelectedPopup);
			await this.click(selector.vendor.product.category.productCategoryModalClose);
		}
		// todo: add multiple category selection
	}


	// vendor add product category on product edit
	async vendorAddProductCategory(productName: string, category: string): Promise<void>{
		await this.goToProductEdit(productName);
		await this.addProductCategory(category);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		await this.toContainText(selector.vendor.product.updatedSuccessMessage, 'Success! The product has been saved successfully.');
	}


	// export product
	async exportProducts(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
		await this.clickAndWaitForLoadState( selector.vendor.product.importExport.export );
		await this.clickAndWaitForDownload( selector.vendor.vTools.export.csv.generateCsv );
	}


	// search product vendor dashboard
	async searchProduct(productName: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

		await this.clearAndType(selector.vendor.product.search.searchInput, productName);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.search.searchBtn);
		await this.toBeVisible(selector.vendor.product.productLink(productName));
	}


	// filter products
	async filterProducts(filterBy: string, value: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

		switch (filterBy){

		case 'by-date' :
			await this.selectByNumber(selector.vendor.product.filters.filterByDate, value);
			break;

		case 'by-category' :
			await this.selectByLabel(selector.vendor.product.filters.filterByCategory, value);
			break;

		case 'by-type' :
			await this.selectByValue(selector.vendor.product.filters.filterByType, value);
			break;

		case 'by-other' :
			await this.selectByValue(selector.vendor.product.filters.filterByOther, value);
			break;

		default :
			break;
		}

		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.product.filters.filter);
		await this.notToHaveCount(selector.vendor.product.numberOfRowsFound, 0);

	}


	// view product
	async viewProduct(productName: string): Promise<void> {
		await this.searchProduct(productName);
		await this.hover(selector.vendor.product.productCell(productName));
		await this.clickAndWaitForLoadState(selector.vendor.product.view(productName));
		await expect(this.page).toHaveURL(data.subUrls.frontend.productDetails(helpers.slugify(productName)) + '/');
		const { quantity, addToCart, viewCart, ...productDetails } = selector.customer.cSingleProduct.productDetails;
		await this.multipleElementVisible(productDetails);
	}


	// vendor can't buy own  product
	async cantBuyOwnProduct(productName: string){
		await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
		await this.notToBeVisible(selector.customer.cSingleProduct.productDetails.quantity);
		await this.notToBeVisible(selector.customer.cSingleProduct.productDetails.addToCart);
	}


	// edit product
	async editProduct(product: product['simple']): Promise<void> {
		await this.goToProductEdit(product.editProduct);

		await this.clearAndType(selector.vendor.product.edit.title, product.editProduct); // don't update name below test needs same product
		await this.clearAndType(selector.vendor.product.edit.price, product.regularPrice());
		// todo:  add more fields

		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		await this.toContainText(selector.vendor.product.dokanMessage, 'The product has been saved successfully. ');
	}


	// product edit


	// add product quantity discount
	async addProductQuantityDiscount(productName: string, quantityDiscount: vendor['vendorInfo']['quantityDiscount']): Promise<void> {
		await this.goToProductEdit(productName);
		await this.check(selector.vendor.product.discount.enableBulkDiscount); // todo: need to fix
		await this.clearAndType(selector.vendor.product.discount.lotMinimumQuantity, quantityDiscount.minimumQuantity);
		await this.clearAndType(selector.vendor.product.discount.lotDiscountInPercentage, quantityDiscount.discountPercentage);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		await this.toContainText(selector.vendor.product.updatedSuccessMessage, data.product.createUpdateSaveSuccessMessage);
	}


	// vendor add product rma settings
	async addProductRmaSettings(productName: string, rma: vendor['rma']): Promise<void> {
		await this.goToProductEdit(productName);
		await this.check(selector.vendor.product.rma.overrideYourDefaultRmaSettingsForThisProduct);
		await this.clearAndType(selector.vendor.product.rma.label, rma.label);
		await this.selectByValue(selector.vendor.product.rma.type, rma.type);
		await this.selectByValue(selector.vendor.product.rma.length, rma.rmaLength);
		// todo: add rma as addon
		if (rma.rmaLength === 'limited'){
			await this.clearAndType(selector.vendor.product.rma.lengthValue, rma.lengthValue);
			await this.selectByValue(selector.vendor.product.rma.lengthDuration, rma.lengthDuration);
		}
		const refundReasonIsVisible = await this.isVisible(selector.vendor.product.rma.refundReasonsFirst);
		if (refundReasonIsVisible) {
			await this.checkMultiple(selector.vendor.product.rma.refundReasons);
		}
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.product.saveProduct, 302);
		await this.toContainText(selector.vendor.product.updatedSuccessMessage, data.product.createUpdateSaveSuccessMessage);
	}


	// quick edit product
	async quickEditProduct(product: product['simple']): Promise<void> {
		await this.searchProduct(product.editProduct);
		await this.hover(selector.vendor.product.productCell(product.editProduct));
		await this.click(selector.vendor.product.quickEdit(product.editProduct));

		await this.clearAndType(selector.vendor.product.quickEditProduct.title, product.editProduct);
		// todo:  add more fields

		await this.clickAndWaitForResponse(data.subUrls.ajax, selector.vendor.product.quickEditProduct.update);

	}


	// duplicate product
	async duplicateProduct(productName: string): Promise<void> {
		await this.searchProduct(productName);
		await this.hover(selector.vendor.product.productCell(productName));
		await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.product.duplicate(productName));
		await this.toContainText(selector.vendor.product.dokanSuccessMessage, 'Product succesfully duplicated');
	}


	// permanently delete product
	async permanentlyDeleteProduct(productName: string): Promise<void> {
		await this.searchProduct(productName);
		await this.hover(selector.vendor.product.productCell(productName));
		await this.click(selector.vendor.product.permanentlyDelete(productName));
		await this.clickAndWaitForLoadState(selector.vendor.product.confirmAction);
		await this.toContainText(selector.vendor.product.dokanSuccessMessage, 'Product successfully deleted');

	}


	// product bulk action
	async productBulkAction(action: string, productName?: string): Promise<void> {
		productName ? await this.searchProduct(productName) : await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);

		await this.click(selector.vendor.product.bulkActions.selectAll);
		switch (action){

		case 'edit' :
			await this.selectByValue(selector.vendor.product.bulkActions.selectAction, 'edit');
			// todo:
			break;

		case 'permanently-delete' :
			await this.selectByValue(selector.vendor.product.bulkActions.selectAction, 'permanently-delete');
			break;

		case 'publish' :
			await this.selectByValue(selector.vendor.product.bulkActions.selectAction, 'publish');
			break;

		default :
			break;
		}

		await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.product.bulkActions.applyAction);
	}


}
