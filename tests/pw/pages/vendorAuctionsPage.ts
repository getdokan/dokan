import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { product } from 'utils/interfaces';
import { helpers } from 'utils/helpers';

export class AuctionsPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// auctions


	// Admin Add Auction Product
	async adminAddAuctionProduct(product: product['auction']) {
		await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

		// Name
		await this.clearAndType(selector.admin.products.product.productName, product.productName());
		await this.selectByValue(selector.admin.products.product.productType, product.productType);
		await this.click(selector.admin.products.product.auction);
		await this.selectByValue(selector.admin.products.product.itemCondition, product.itemCondition);
		await this.selectByValue(selector.admin.products.product.auctionType, product.auctionType);
		await this.clearAndType(selector.admin.products.product.startPrice, product.regularPrice());
		await this.clearAndType(selector.admin.products.product.bidIncrement, product.bidIncrement());
		await this.clearAndType(selector.admin.products.product.reservedPrice, product.reservedPrice());
		await this.clearAndType(selector.admin.products.product.buyItNowPrice, product.buyItNowPrice());
		await this.clearAndType(selector.admin.products.product.auctionDatesFrom, product.startDate);
		await this.clearAndType(selector.admin.products.product.auctionDatesTo, product.endDate);

		// Category
		await this.click(selector.admin.products.product.category(product.category));

		// Vendor Store Name
		await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName);
		await this.scrollToTop();

		// Publish
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, selector.admin.products.product.publish, 302);
		await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.publishSuccessMessage);
	}


	// vendor auction render properly
	async vendorAuctionRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.auction);

		// auctions menu elements are visible
		await this.multipleElementVisible(selector.vendor.vAuction.menus);

		// add new auction product button is visible
		await this.toBeVisible(selector.vendor.vAuction.addNewActionProduct);

		// auction activity button is visible
		await this.toBeVisible(selector.vendor.vAuction.actionsActivity);

		// filter elements are visible
		await this.multipleElementVisible(selector.vendor.vAuction.filters);

		// search element is visible
		await this.toBeVisible(selector.vendor.vAuction.search);

		// auction product table elements are visible
		await this.multipleElementVisible(selector.vendor.vAuction.table);

	}


	// vendor

	// update auction product fields
	async updateAuctionProductFields(product: product['auction']){
		await this.clearAndType(selector.vendor.vAuction.auction.productName, product.name);
		// await this.addCategory(product.category);
		await this.selectByValue(selector.vendor.vAuction.auction.itemCondition, product.itemCondition);
		await this.selectByValue(selector.vendor.vAuction.auction.auctionType, product.auctionType);
		await this.clearAndType(selector.vendor.vAuction.auction.startPrice, product.regularPrice());
		await this.clearAndType(selector.vendor.vAuction.auction.bidIncrement, product.bidIncrement());
		await this.clearAndType(selector.vendor.vAuction.auction.reservedPrice, product.reservedPrice());
		await this.clearAndType(selector.vendor.vAuction.auction.buyItNowPrice, product.buyItNowPrice());
		await this.removeAttribute(selector.vendor.vAuction.auction.auctionStartDate, 'readonly');
		await this.removeAttribute(selector.vendor.vAuction.auction.auctionEndDate, 'readonly');
		await this.clearAndType(selector.vendor.vAuction.auction.auctionStartDate, product.startDate);
		await this.clearAndType(selector.vendor.vAuction.auction.auctionEndDate, product.endDate);
		//todo: add more fields

	}


	//  add auction product
	async addAuctionProduct(product: product['auction']){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.auction);
		await this.clickAndWaitForLoadState(selector.vendor.vAuction.addNewActionProduct);
		await this.updateAuctionProductFields(product);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.productAuction, selector.vendor.vAuction.auction.addAuctionProduct, 302);
		await this.toContainText(selector.vendor.product.updatedSuccessMessage, product.saveSuccessMessage);

	}


	// edit auction product
	async editAuctionProduct(product: product['auction']){
		await this.searchAuctionProduct(product.name);
		await this.hover(selector.vendor.vAuction.productCell(product.name));
		await this.clickAndWaitForLoadState(selector.vendor.vAuction.edit);
		await this.updateAuctionProductFields(product);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.auction, selector.vendor.vAuction.auction.updateAuctionProduct, 302);
		await this.toContainText(selector.vendor.product.updatedSuccessMessage, product.saveSuccessMessage);

	}


	// view auction product
	async viewAuctionProduct(productName: string){
		await this.searchAuctionProduct(productName);
		await this.hover(selector.vendor.vAuction.productCell(productName));
		await this.clickAndWaitForLoadState(selector.vendor.vAuction.view);

		// auction product elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { bidQuantity, bidButton, ...viewAuction } = selector.vendor.vAuction.viewAuction;
		await this.multipleElementVisible(viewAuction);
		//todo: actual value can be asserted
	}


	// vendor can't bid own auction product
	async cantBidOwnProduct(productName: string){
		await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
		await this.toBeVisible(selector.vendor.vAuction.viewAuction.noBidOption);
	}


	// search auction product
	async searchAuctionProduct(productName: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.auction);
		await this.clearAndType(selector.vendor.vAuction.search, productName);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.auction, selector.vendor.vAuction.filters.filter );
		await this.toBeVisible(selector.vendor.vAuction.productCell(productName));
	}


	// delete auction product
	async deleteAuctionProduct(productName: string){
		await this.searchAuctionProduct(productName);
		await this.hover(selector.vendor.vAuction.productCell(productName));
		await this.click(selector.vendor.vAuction.permanentlyDelete);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.auction, selector.vendor.vAuction.confirmDelete);
		await this.toContainText(selector.vendor.vAuction.dokanSuccessMessage, 'Product successfully deleted');
	}


	// vendor auction activity render properly
	async vendorAuctionActivityRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.auctionActivity);

		// auction activity text is visible
		await this.toBeVisible(selector.vendor.vAuction.actionActivity.actionActivityText);

		// back to auctions is visible
		await this.toBeVisible(selector.vendor.vAuction.actionActivity.backToActions);

		// filter elements are visible
		await this.multipleElementVisible(selector.vendor.vAuction.actionActivity.filters);

		// search elements are visible
		await this.multipleElementVisible(selector.vendor.vAuction.actionActivity.search);

		// auction activity table elements are visible
		await this.multipleElementVisible(selector.vendor.vAuction.actionActivity.table);

	}


	// search auction activity
	async searchAuctionActivity(input: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.auctionActivity);
		await this.clearAndType(selector.vendor.vAuction.actionActivity.search.searchInput, input);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.auctionActivity, selector.vendor.vAuction.actionActivity.search.search );
		await this.notToHaveCount(selector.vendor.vAuction.actionActivity.rowsFound, 0);
	}


	// customer

	async bidAuctionProduct(productName: string){
		await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
		await this.click(selector.vendor.vAuction.viewAuction.bidButton);

	}

}
