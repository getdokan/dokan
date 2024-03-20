import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { product, date } from '@utils/interfaces';

// selectors
const auctionProductsAdmin = selector.admin.products;
const auctionProductsVendor = selector.vendor.vAuction;

export class AuctionsPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    customerPage = new CustomerPage(this.page);

    // auctions

    // Admin Add Auction Product
    async adminAddAuctionProduct(product: product['auction']) {
        await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

        // Name
        await this.clearAndType(auctionProductsAdmin.product.productName, product.productName());
        await this.selectByValue(auctionProductsAdmin.product.productType, product.productType);
        await this.click(auctionProductsAdmin.product.auction);
        await this.selectByValue(auctionProductsAdmin.product.itemCondition, product.itemCondition);
        await this.selectByValue(auctionProductsAdmin.product.auctionType, product.auctionType);
        await this.clearAndType(auctionProductsAdmin.product.startPrice, product.regularPrice());
        await this.clearAndType(auctionProductsAdmin.product.bidIncrement, product.bidIncrement());
        await this.clearAndType(auctionProductsAdmin.product.reservedPrice, product.reservedPrice());
        await this.clearAndType(auctionProductsAdmin.product.buyItNowPrice, product.buyItNowPrice());
        await this.clearAndType(auctionProductsAdmin.product.auctionDatesFrom, product.startDate);
        await this.clearAndType(auctionProductsAdmin.product.auctionDatesTo, product.endDate);

        // Category
        await this.click(auctionProductsAdmin.product.category(product.category));

        // Vendor Store Name
        await this.select2ByText(auctionProductsAdmin.product.storeName, auctionProductsAdmin.product.storeNameInput, product.storeName);
        await this.scrollToTop();

        // Publish
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, auctionProductsAdmin.product.publish, 302);
        await this.toContainText(auctionProductsAdmin.product.updatedSuccessMessage, data.product.publishSuccessMessage);
    }

    // vendor auction render properly
    async vendorAuctionRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.auction);

        // auctions menu elements are visible
        await this.multipleElementVisible(auctionProductsVendor.menus);

        // add new auction product button is visible
        await this.toBeVisible(auctionProductsVendor.addNewActionProduct);

        // auction activity button is visible
        await this.toBeVisible(auctionProductsVendor.actionsActivity);

        // filter elements are visible
        await this.multipleElementVisible(auctionProductsVendor.filters);

        // search element is visible
        await this.toBeVisible(auctionProductsVendor.search);

        // auction product table elements are visible
        await this.multipleElementVisible(auctionProductsVendor.table);
    }

    // vendor

    // update auction product fields
    async updateAuctionProductFields(product: product['auction']) {
        await this.clearAndType(auctionProductsVendor.auction.productName, product.name);
        // await this.addProductCategory(product.category);
        await this.selectByValue(auctionProductsVendor.auction.itemCondition, product.itemCondition);
        await this.selectByValue(auctionProductsVendor.auction.auctionType, product.auctionType);
        await this.clearAndType(auctionProductsVendor.auction.startPrice, product.regularPrice());
        await this.clearAndType(auctionProductsVendor.auction.bidIncrement, product.bidIncrement());
        await this.clearAndType(auctionProductsVendor.auction.reservedPrice, product.reservedPrice());
        await this.clearAndType(auctionProductsVendor.auction.buyItNowPrice, product.buyItNowPrice());
        await this.removeAttribute(auctionProductsVendor.auction.auctionStartDate, 'readonly');
        await this.removeAttribute(auctionProductsVendor.auction.auctionEndDate, 'readonly');
        await this.clearAndType(auctionProductsVendor.auction.auctionStartDate, product.startDate);
        await this.clearAndType(auctionProductsVendor.auction.auctionEndDate, product.endDate);
        // todo: add more fields
    }

    //  add auction product
    async addAuctionProduct(product: product['auction']) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.auction);
        await this.clickAndWaitForLoadState(auctionProductsVendor.addNewActionProduct);
        await this.updateAuctionProductFields(product);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.auction, auctionProductsVendor.auction.addAuctionProduct, 302);
        await this.toContainText(selector.vendor.product.updatedSuccessMessage, product.saveSuccessMessage);
    }

    // edit auction product
    async editAuctionProduct(product: product['auction']) {
        await this.searchAuctionProduct(product.name);
        await this.hover(auctionProductsVendor.productCell(product.name));
        await this.clickAndWaitForLoadState(auctionProductsVendor.edit(product.name));
        await this.updateAuctionProductFields(product);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.auction, auctionProductsVendor.auction.updateAuctionProduct, 302);
        await this.toContainText(selector.vendor.product.updatedSuccessMessage, product.saveSuccessMessage);
    }

    // view auction product
    async viewAuctionProduct(productName: string) {
        await this.searchAuctionProduct(productName);
        await this.hover(auctionProductsVendor.productCell(productName));
        await this.clickAndWaitForLoadState(auctionProductsVendor.view(productName));

        // auction product elements are visible
        const { bidQuantity, bidButton, ...viewAuction } = auctionProductsVendor.viewAuction;
        await this.multipleElementVisible(viewAuction);
    }

    // vendor can't bid own auction product
    async cantBidOwnProduct(productName: string) {
        await this.goToProductDetails(productName);
        await this.toBeVisible(auctionProductsVendor.viewAuction.noBidOption);
    }

    // search auction product
    async searchAuctionProduct(productName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.auction);
        await this.clearAndType(auctionProductsVendor.search, productName);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.auction, auctionProductsVendor.filters.filter);
        await this.toBeVisible(auctionProductsVendor.productCell(productName));
    }

    // delete auction product
    async deleteAuctionProduct(productName: string) {
        await this.searchAuctionProduct(productName);
        await this.hover(auctionProductsVendor.productCell(productName));
        await this.click(auctionProductsVendor.permanentlyDelete(productName));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.auction, auctionProductsVendor.confirmDelete);
        await this.toContainText(auctionProductsVendor.dokanSuccessMessage, 'Product successfully deleted');
    }

    // vendor auction activity render properly
    async vendorAuctionActivityRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.auctionActivity);

        // auction activity text is visible
        await this.toBeVisible(auctionProductsVendor.actionActivity.actionActivityText);

        // back to auctions is visible
        await this.toBeVisible(auctionProductsVendor.actionActivity.backToActions);

        // filter elements are visible
        const { filterByDate, ...filters } = auctionProductsVendor.actionActivity.filters;
        await this.multipleElementVisible(filters);
        await this.toBeVisible(filterByDate.dateRangeInput);

        // search elements are visible
        await this.multipleElementVisible(auctionProductsVendor.actionActivity.search);

        // auction activity table elements are visible
        await this.multipleElementVisible(auctionProductsVendor.actionActivity.table);
    }

    // filter auction activity
    async filterAuctionActivity(inputValue: date['dateRange']) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.auctionActivity);
        await this.setAttributeValue(auctionProductsVendor.actionActivity.filters.filterByDate.dateRangeInput, 'value', helpers.dateFormatFYJ(inputValue.startDate) + ' - ' + helpers.dateFormatFYJ(inputValue.endDate));
        await this.setAttributeValue(auctionProductsVendor.actionActivity.filters.filterByDate.startDateInput, 'value', inputValue.startDate);
        await this.setAttributeValue(auctionProductsVendor.actionActivity.filters.filterByDate.endDateInput, 'value', inputValue.endDate);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.auctionActivity, auctionProductsVendor.actionActivity.filters.filter);
        await this.notToHaveCount(auctionProductsVendor.actionActivity.numOfRowsFound, 0);
    }

    // search auction activity
    async searchAuctionActivity(input: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.auctionActivity);
        await this.clearAndType(auctionProductsVendor.actionActivity.search.searchInput, input);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.auctionActivity, auctionProductsVendor.actionActivity.search.search);
        await this.notToHaveCount(auctionProductsVendor.actionActivity.numOfRowsFound, 0);
    }

    // customer

    async bidAuctionProduct(productName: string) {
        await this.goToProductDetails(productName);
        await this.click(auctionProductsVendor.viewAuction.bidButton);
    }

    async buyAuctionProduct(productName: string) {
        await this.customerPage.addProductToCart(productName, 'single-product');
        await this.customerPage.placeOrder();
    }
}
