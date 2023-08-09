import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';

export class VendorSpmvPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// vendor spmv


	// vendor spmv render properly
	async vendorSpmvRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.spmv);

		// search box elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
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


}
