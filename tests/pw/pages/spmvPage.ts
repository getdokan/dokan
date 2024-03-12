import { Page, expect } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';

// selectors
const spmvAdmin = selector.admin.dokan.spmv;
const spmvVendor = selector.vendor.vSpmv;
const spmvCustomer = selector.customer.cSpmv;

export class SpmvPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    // admin

    async assignSpmvProduct(productId: string, storeName: string) {
        await this.goIfNotThere(data.subUrls.backend.wc.productDetails(productId));

        await this.focus(spmvAdmin.searchVendor);

        const alreadyAssigned = await this.isVisible(spmvAdmin.unassignVendor(storeName));
        alreadyAssigned && (await this.clickAndAcceptAndWaitForResponseAndLoadState(data.subUrls.ajax, spmvAdmin.unassignVendor(storeName)));

        await this.typeByPageAndWaitForResponse(data.subUrls.ajax, spmvAdmin.searchVendor, storeName);
        await this.toContainText(spmvAdmin.highlightedResult, storeName);
        await this.click(spmvAdmin.searchedResult(storeName));
        await this.click(spmvAdmin.spmvDiv);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, spmvAdmin.assignVendor);

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, selector.admin.products.product.publish, 302);
        await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.updateSuccessMessage);
    }

    // vendor

    // vendor spmv render properly
    async vendorSpmvRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.spmv);

        // search box elements are visible
        const { toggleBtn, ...search } = spmvVendor.search;
        await this.multipleElementVisible(search);

        // table elements are visible
        await this.multipleElementVisible(spmvVendor.table);

        // number of elements found is visible
        await this.toBeVisible(spmvVendor.resultCount);

        // sort is visible
        await this.toBeVisible(spmvVendor.sortProduct);
    }

    // vendor search similar product
    async searchSimilarProduct(productName: string, from: string): Promise<void> {
        switch (from) {
            case 'popup':
                await this.goIfNotThere(data.subUrls.frontend.vDashboard.products);
                await this.click(selector.vendor.product.create.addNewProduct);
                await this.click(spmvVendor.search.toggleBtn);
                break;

            case 'booking':
                await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);
                await this.click(selector.vendor.vBooking.addNewBookingProduct);
                await this.click(spmvVendor.search.toggleBtn);
                break;

            case 'auction':
                await this.goIfNotThere(data.subUrls.frontend.vDashboard.auction);
                await this.clickAndWaitForLoadState(selector.vendor.vAuction.addNewActionProduct);
                await this.click(spmvVendor.search.toggleBtn);
                break;

            case 'spmv':
                await this.goIfNotThere(data.subUrls.frontend.vDashboard.spmv);
                break;

            default:
                break;
        }

        const searchInputIsVisible = await this.isVisible(spmvVendor.search.searchInput);
        if (!searchInputIsVisible) {
            // forcing spmv search section to open via removing class
            const spmvSearchDiv = (await this.getClassValue(spmvVendor.search.searchDiv))!;
            await this.setAttributeValue(spmvVendor.search.searchDiv, 'class', spmvSearchDiv.replace('section-closed', ''));
        }

        await this.clearAndType(spmvVendor.search.searchInput, productName);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.spmv, spmvVendor.search.search);
        await this.toContainText(spmvVendor.resultCount, 'Showing the single result');
    }

    // got to product edit from spmv
    async goToProductEditFromSpmv(productName: string): Promise<void> {
        await this.searchSimilarProduct(productName, 'spmv');
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, spmvVendor.editProduct(productName));
        await this.toHaveValue(selector.vendor.product.edit.title, productName);
    }

    // sort spmv product
    async sortSpmvProduct(sortBy: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.spmv);
        await this.selectByValueAndWaitForResponse(data.subUrls.frontend.vDashboard.spmv, spmvVendor.sortProduct, sortBy);
        await this.notToHaveCount(spmvVendor.numberOfRowsFound, 0);
    }

    // clone product
    async cloneProduct(productName: string): Promise<void> {
        await this.searchSimilarProduct(productName, 'spmv');
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, spmvVendor.addToStore);
        await this.toHaveValue(selector.vendor.product.edit.title, productName);
    }

    // clone product via sell item button
    async cloneProductViaSellItemButton(productName: string): Promise<void> {
        await this.goToProductDetails(productName);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.products, spmvVendor.productDetails.sellThisItem);
        await this.toHaveValue(selector.vendor.product.edit.title, productName);
    }

    // view other available vendors
    async viewOtherAvailableVendors(productName: string): Promise<void> {
        await this.goToProductDetails(productName);

        // if display inside product tab
        await this.clickIfVisible(spmvCustomer.otherVendorAvailableTab);

        await this.toBeVisible(spmvCustomer.otherAvailableVendorDiv);
        await this.toBeVisible(spmvCustomer.availableVendorDisplayAreaTitle);
        await this.toBeVisible(spmvCustomer.availableVendorTable);

        // vendor
        await this.notToHaveCount(spmvCustomer.availableVendorDetails.vendor.vendorCell, 0);
        await this.notToHaveCount(spmvCustomer.availableVendorDetails.vendor.avatar, 0);
        await this.notToHaveCount(spmvCustomer.availableVendorDetails.vendor.vendorLink, 0);

        // price
        await this.notToHaveCount(spmvCustomer.availableVendorDetails.price.priceCell, 0);
        await this.notToHaveCount(spmvCustomer.availableVendorDetails.price.priceAmount, 0);

        // rating
        await this.notToHaveCount(spmvCustomer.availableVendorDetails.rating.ratingCell, 0);
        await this.notToHaveCount(spmvCustomer.availableVendorDetails.rating.rating, 0);

        // actions
        await this.notToHaveCount(spmvCustomer.availableVendorDetails.actions.actionsCell, 0);
        await this.notToHaveCount(spmvCustomer.availableVendorDetails.actions.viewStore, 0);
        await this.notToHaveCount(spmvCustomer.availableVendorDetails.actions.viewProduct, 0);
        await this.notToHaveCount(spmvCustomer.availableVendorDetails.actions.addToCart, 0);
    }

    // view other available vendor
    async viewOtherAvailableVendor(productName: string, storeName: string): Promise<void> {
        await this.goToProductDetails(productName);

        // if display inside product tab
        await this.clickIfVisible(spmvCustomer.otherVendorAvailableTab);

        await this.clickAndWaitForLoadState(spmvCustomer.availableVendorDetails.actions.viewStoreByVendor(storeName));
        await expect(this.page).toHaveURL(data.subUrls.frontend.vendorDetails(helpers.slugify(storeName)) + '/');
    }

    // view other available vendor product
    async viewOtherAvailableVendorProduct(productName: string, storeName: string): Promise<void> {
        await this.goToProductDetails(productName);

        // if display inside product tab
        await this.clickIfVisible(spmvCustomer.otherVendorAvailableTab);

        await this.clickAndWaitForLoadState(spmvCustomer.availableVendorDetails.actions.viewProductByVendor(storeName));
        await this.toContainText(selector.customer.cSingleProduct.productDetails.productTitle, productName);
    }

    // add to cart other available vendor product
    async addToCartOtherAvailableVendorsProduct(productName: string, storeName: string): Promise<void> {
        await this.goToProductDetails(productName);

        // if display inside product tab
        await this.clickIfVisible(spmvCustomer.otherVendorAvailableTab);

        await this.clickAndWaitForLoadState(spmvCustomer.availableVendorDetails.actions.addToCartByVendor(storeName));
        await this.toContainText(selector.customer.cWooSelector.wooCommerceSuccessMessage, `“${productName}” has been added to your cart.`);
    }
}
