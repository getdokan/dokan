import { Page, expect } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { helpers } from 'utils/helpers';

export class SpmvPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	//admin

	async assignSpmvProduct(productId: string, storeName: string){
		await this.goIfNotThere(data.subUrls.backend.wc.productDetails(productId));

		await this.focus(selector.admin.dokan.spmv.searchVendor);

		const alreadyAssigned = await this.isVisible(selector.admin.dokan.spmv.unassignVendor(storeName));
		alreadyAssigned && await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.spmv.unassignVendor(storeName));


		await this.typeViaPageAndWaitForResponse(data.subUrls.ajax, selector.admin.dokan.spmv.searchVendor, storeName);
		await this.toContainText(selector.admin.dokan.spmv.highlightedResult, storeName);
		await this.click(selector.admin.dokan.spmv.searchedResult(storeName));
		await this.click(selector.admin.dokan.spmv.spmvDiv);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.admin.dokan.spmv.assignVendor);

		await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, selector.admin.products.product.publish, 302);
		await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.updateSuccessMessage);
	}


	// vendor


	// vendor spmv render properly
	async vendorSpmvRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.spmv);

		// search box elements are visible
		const { toggleBtn, ...search } = selector.vendor.vSpmv.search;
		await this.multipleElementVisible(search);

		// table elements are visible
		await this.multipleElementVisible(selector.vendor.vSpmv.table);

		// number of elements found is visible
		await this.toBeVisible(selector.vendor.vSpmv.resultCount);

		// sort is visible
		await this.toBeVisible(selector.vendor.vSpmv.sortProduct);

	}


	// vendor search similar product
	async searchSimilarProduct(productName: string, from: string): Promise<void> {

		switch (from) {

		case 'popup' :
			await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
			await this.click(selector.vendor.product.create.addNewProduct);
			await this.click(selector.vendor.vSpmv.search.toggleBtn);
			break;

		case 'booking' :
			await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);
			await this.click(selector.vendor.vBooking.addNewBookingProduct);
			await this.click(selector.vendor.vSpmv.search.toggleBtn);
			break;

		case 'auction' :
			await this.goIfNotThere(data.subUrls.frontend.vDashboard.auction);
			await this.clickAndWaitForLoadState(selector.vendor.vAuction.addNewActionProduct);
			await this.click(selector.vendor.vSpmv.search.toggleBtn);
			break;

		case 'spmv' :
			await this.goIfNotThere(data.subUrls.frontend.vDashboard.spmv);
			break;

		default :
			break;

		}

		const searchInputIsVisible = await this.isVisible(selector.vendor.vSpmv.search.searchInput);
		if(!searchInputIsVisible){
			// forcing spmv search section to open via removing class
			const spmvSearchDiv = (await this.getClassValue(selector.vendor.vSpmv.search.searchDiv))!;
			await this.setAttributeValue(selector.vendor.vSpmv.search.searchDiv, 'class', spmvSearchDiv.replace('section-closed', ''));
		}

		await this.clearAndType(selector.vendor.vSpmv.search.searchInput, productName);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.spmv, selector.vendor.vSpmv.search.search);
		await this.toContainText(selector.vendor.vSpmv.resultCount, 'Showing the single result');
	}


	// got to product edit from spmv
	async goToProductEditFromSPMV(productName: string): Promise<void> {
		await this.searchSimilarProduct(productName, 'spmv');
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.vSpmv.editProduct(productName));
		await this.toHaveValue(selector.vendor.product.edit.title, productName);
	}


	// sort spmv product
	async sortSpmvProduct(sortBy: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.spmv);
		await this.selectByValueAndWaitForResponse(data.subUrls.frontend.vDashboard.spmv, selector.vendor.vSpmv.sortProduct, sortBy);
		await this.notToHaveCount(selector.vendor.vSpmv.numberOfRowsFound, 0);
	}


	// clone product
	async cloneProduct(productName: string): Promise<void> {
		await this.searchSimilarProduct(productName, 'spmv');
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.vSpmv.addToStore);
		await this.toHaveValue(selector.vendor.product.edit.title, productName);
	}


	// clone product via sell item button
	async cloneProductViaSellItemButton(productName: string): Promise<void> {
		await this.goToProductDetails(productName);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, selector.vendor.vSpmv.productDetails.sellThisItem);
		await this.toHaveValue(selector.vendor.product.edit.title, productName);
	}


	// view other available vendors
	async viewOtherAvailableVendors(productName: string): Promise<void> {
		await this.goToProductDetails(productName);

		// if display inside product tab
		await this.clickIfVisible(selector.customer.cSpmv.otherVendorAvailableTab);

		await this.toBeVisible(selector.customer.cSpmv.otherAvailableVendorDiv);
		await this.toBeVisible(selector.customer.cSpmv.availableVendorDisplayAreaTitle);
		await this.toBeVisible(selector.customer.cSpmv.availableVendorTable);

		// vendor
		await this.notToHaveCount(selector.customer.cSpmv.availableVendorDetails.vendor.vendorCell, 0);
		await this.notToHaveCount(selector.customer.cSpmv.availableVendorDetails.vendor.avatar, 0);
		await this.notToHaveCount(selector.customer.cSpmv.availableVendorDetails.vendor.vendorLink, 0);

		// price
		await this.notToHaveCount(selector.customer.cSpmv.availableVendorDetails.price.priceCell, 0);
		await this.notToHaveCount(selector.customer.cSpmv.availableVendorDetails.price.priceAmount, 0);

		// rating
		await this.notToHaveCount(selector.customer.cSpmv.availableVendorDetails.rating.ratingCell, 0);
		await this.notToHaveCount(selector.customer.cSpmv.availableVendorDetails.rating.rating, 0);

		// actions
		await this.notToHaveCount(selector.customer.cSpmv.availableVendorDetails.actions.actionsCell, 0);
		await this.notToHaveCount(selector.customer.cSpmv.availableVendorDetails.actions.viewStore, 0);
		await this.notToHaveCount(selector.customer.cSpmv.availableVendorDetails.actions.viewProduct, 0);
		await this.notToHaveCount(selector.customer.cSpmv.availableVendorDetails.actions.addToCart, 0);
	}


	// view other available vendor
	async viewOtherAvailableVendor(productName: string, storeName: string): Promise<void> {
		await this.goToProductDetails(productName);

		// if display inside product tab
		await this.clickIfVisible(selector.customer.cSpmv.otherVendorAvailableTab);

		await this.clickAndWaitForLoadState(selector.customer.cSpmv.availableVendorDetails.actions.viewStoreByVendor(storeName));
		await expect(this.page).toHaveURL(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)) + '/');
	}


	// view other available vendor product
	async viewOtherAvailableVendorProduct(productName: string, storeName: string): Promise<void> {
		await this.goToProductDetails(productName);

		// if display inside product tab
		await this.clickIfVisible(selector.customer.cSpmv.otherVendorAvailableTab);

		await this.clickAndWaitForLoadState(selector.customer.cSpmv.availableVendorDetails.actions.viewProductByVendor(storeName));
		await this.toContainText(selector.customer.cSingleProduct.productDetails.productTitle, productName );
	}


	// add to cart other available vendor product
	async addToCartOtherAvailableVendorsProduct(productName: string, storeName: string): Promise<void> {
		await this.goToProductDetails(productName);

		// if display inside product tab
		await this.clickIfVisible(selector.customer.cSpmv.otherVendorAvailableTab);

		await this.clickAndWaitForLoadState(selector.customer.cSpmv.availableVendorDetails.actions.addToCartByVendor(storeName));
		await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, `“${productName}” has been added to your cart.`);
	}


}
