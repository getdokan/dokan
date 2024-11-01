import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { product, date } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const auctionProductsAdmin = selector.admin.products;
const auctionProductsVendor = selector.vendor.vAuction;
const productsVendor = selector.vendor.product;

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

    // go to auction product edit
    async goToAuctionProductEdit(productName: string): Promise<void> {
        await this.searchAuctionProduct(productName);
        await this.removeAttribute(auctionProductsVendor.rowActions(productName), 'class'); // forcing the row actions to be visible, to avoid flakiness
        await this.hover(auctionProductsVendor.productCell(productName));
        await this.clickAndWaitForLoadState(auctionProductsVendor.edit(productName));
        await this.toHaveValue(auctionProductsVendor.auction.productName, productName);
    }

    async goToAuctionProductEditById(productId: string): Promise<void> {
        await this.gotoUntilNetworkidle(data.subUrls.frontend.vDashboard.auctionProductEdit(productId));
    }

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
        await this.goToAuctionProductEdit(product.name);
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
        // todo: startingOrCurrentBid is not visible in the single product page, product created via api has issue with stating bid
        const { bidQuantity, bidButton, buyNow, getSupport, startingOrCurrentBid, ...viewAuction } = auctionProductsVendor.viewAuction;
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

    // auction product options

    async saveProduct() {
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.auction, auctionProductsVendor.auction.addAuctionProduct, 302);
        await this.toContainText(selector.vendor.product.updatedSuccessMessage, 'Success! The product has been updated successfully.');
    }

    // add product title
    async addProductTitle(productName: string, title: string): Promise<void> {
        await this.goToAuctionProductEditById(productName);
        await this.clearAndType(auctionProductsVendor.auction.productName, title);
        await this.saveProduct();
        await this.toHaveValue(auctionProductsVendor.auction.productName, title);
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
        await this.goToAuctionProductEditById(productName);
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
        await this.goToAuctionProductEditById(productName);
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
        await this.goToAuctionProductEditById(productName);
        await this.vendorAddProductCategory(category, false, true);
    }

    // add product tags
    async addProductTags(productName: string, tags: string[]): Promise<void> {
        await this.goToAuctionProductEditById(productName);
        for (const tag of tags) {
            await this.clearAndType(auctionProductsVendor.auction.tags.tagInput, tag);
            await this.click(productsVendor.tags.searchedTag(tag));
            await this.toBeVisible(auctionProductsVendor.auction.tags.selectedTags(tag));
        }
        await this.saveProduct();
        for (const tag of tags) {
            await this.toBeVisible(auctionProductsVendor.auction.tags.selectedTags(tag));
        }
    }

    // remove product tags
    async removeProductTags(productName: string, tags: string[]): Promise<void> {
        await this.goToAuctionProductEditById(productName);
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
        await this.goToAuctionProductEditById(productName);
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
        await this.goToAuctionProductEditById(productName);
        await this.hover(productsVendor.image.coverImageDiv);
        await this.click(productsVendor.image.removeFeatureImage);
        await this.saveProduct();
        await this.toHaveAttribute(productsVendor.image.uploadedFeatureImage, 'src', /^$/);
        await this.toBeVisible(productsVendor.image.uploadImageText);
    }

    // add product gallery images
    async addProductGalleryImages(productName: string, galleryImages: string[], removePrevious: boolean = false): Promise<void> {
        await this.goToAuctionProductEditById(productName);
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
        await this.goToAuctionProductEditById(productName);
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
        await this.goToAuctionProductEditById(productName);
        await this.clearAndType(auctionProductsVendor.auction.shortDescription, shortDescription);
        await this.saveProduct();
        await this.toHaveValue(auctionProductsVendor.auction.shortDescription, shortDescription);
    }

    // add product description
    async addProductDescription(productName: string, description: string): Promise<void> {
        await this.goToAuctionProductEditById(productName);
        await this.typeFrameSelector(auctionProductsVendor.auction.descriptionIframe, auctionProductsVendor.auction.descriptionHtmlBody, description);
        await this.saveProduct();
        await this.toContainTextFrameLocator(auctionProductsVendor.auction.descriptionIframe, auctionProductsVendor.auction.descriptionHtmlBody, description);
    }

    // add product downloadable options
    async addProductDownloadableOptions(productName: string, downloadableOption: product['productInfo']['downloadableOptions']): Promise<void> {
        await this.goToAuctionProductEditById(productName);
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
        await this.goToAuctionProductEditById(productName);
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

    // add product virtual option
    async addProductVirtualOption(productName: string, enable: boolean): Promise<void> {
        await this.goToAuctionProductEditById(productName);
        if (enable) {
            await this.check(productsVendor.virtual);
        } else {
            await this.focus(productsVendor.virtual);
            await this.uncheck(productsVendor.virtual);
        }
        await this.saveProduct();
        if (enable) {
            await this.toBeChecked(productsVendor.virtual);
            if (DOKAN_PRO) {
                await this.notToBeVisible(productsVendor.shipping.shippingContainer);
            }
        } else {
            await this.notToBeChecked(productsVendor.virtual);
        }
    }

    // add product inventory
    async addProductInventory(productName: string, inventory: product['productInfo']['inventory']): Promise<void> {
        await this.goToAuctionProductEditById(productName);
        await this.clearAndType(productsVendor.inventory.sku, inventory.sku);
        await this.saveProduct();
        await this.toHaveValue(productsVendor.inventory.sku, inventory.sku);
    }

    // remove product inventory [stock management]
    async removeProductInventory(productName: string): Promise<void> {
        await this.goToAuctionProductEditById(productName);
        await this.uncheck(productsVendor.inventory.enableStockManagement);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.inventory.enableStockManagement);
    }

    // add product other options (product status, visibility, purchase note, reviews)
    async addProductOtherOptions(productName: string, otherOption: product['productInfo']['otherOptions'], choice: string): Promise<void> {
        await this.goToAuctionProductEditById(productName);

        switch (choice) {
            case 'status':
                await this.selectByValue(productsVendor.otherOptions.productStatus, otherOption.status);
                break;
            case 'visibility':
                await this.selectByValue(productsVendor.otherOptions.visibility, otherOption.visibility);
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
            default:
                break;
        }
    }

    // add product shipping
    async addProductShipping(productName: string, shipping: product['productInfo']['shipping']): Promise<void> {
        await this.goToAuctionProductEditById(productName);
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

    // remove product shipping
    async removeProductShipping(productName: string): Promise<void> {
        await this.goToAuctionProductEditById(productName);
        await this.uncheck(productsVendor.shipping.requiresShipping);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.shipping.requiresShipping);
    }

    // add product tax
    async addProductTax(productName: string, tax: product['productInfo']['tax'], hasClass: boolean = false): Promise<void> {
        await this.goToAuctionProductEditById(productName);
        await this.selectByValue(productsVendor.tax.status, tax.status);
        if (hasClass) await this.selectByValue(productsVendor.tax.class, tax.class);
        await this.saveProduct();
        await this.toHaveSelectedValue(productsVendor.tax.status, tax.status);
        if (hasClass) await this.toHaveSelectedValue(productsVendor.tax.class, tax.class);
    }

    // add product attribute
    async addProductAttribute(productName: string, attribute: product['productInfo']['attribute'], addTerm: boolean = false): Promise<void> {
        await this.goToAuctionProductEditById(productName);
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
        await this.goToAuctionProductEditById(productName);
        await this.click(productsVendor.attribute.removeAttribute(attribute));
        await this.click(productsVendor.attribute.confirmRemoveAttribute);
        await this.notToBeVisible(productsVendor.attribute.savedAttribute(attribute));
        await this.saveProduct();
        await this.notToBeVisible(productsVendor.attribute.savedAttribute(attribute));
    }

    // remove product attribute term
    async removeProductAttributeTerm(productName: string, attribute: string, attributeTerm: string): Promise<void> {
        await this.goToAuctionProductEditById(productName);
        await this.click(productsVendor.attribute.savedAttribute(attribute));
        await this.click(productsVendor.attribute.removeSelectedAttributeTerm(attributeTerm));
        await this.press('Escape'); // shift focus from element
        await this.notToBeVisible(productsVendor.attribute.selectedAttributeTerm(attributeTerm));
        await this.clickAndWaitForResponse(data.subUrls.ajax, productsVendor.attribute.saveAttribute);
        await this.saveProduct();
        await this.click(productsVendor.attribute.savedAttribute(attribute));
        await this.notToBeVisible(productsVendor.attribute.selectedAttributeTerm(attributeTerm));
    }

    // add product geolocation
    async addProductGeolocation(productName: string, location: string): Promise<void> {
        await this.goToAuctionProductEditById(productName);
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
        await this.goToAuctionProductEditById(productName);
        await this.check(productsVendor.geolocation.sameAsStore);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.geolocation.sameAsStore);
    }

    // add product addons
    async addProductAddon(productName: string, addon: product['productInfo']['addon']): Promise<void> {
        await this.goToAuctionProductEditById(productName);
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
        await this.goToAuctionProductEditById(productName);
        await this.click(productsVendor.addon.import);
        await this.clearAndType(productsVendor.addon.importInput, addon);
        await this.saveProduct();
        await this.toBeVisible(productsVendor.addon.addonRow(addonTitle));
    }

    // export addon
    async exportAddon(productName: string, addon: string): Promise<void> {
        await this.goToAuctionProductEditById(productName);
        await this.click(productsVendor.addon.export);
        await this.toContainText(productsVendor.addon.exportInput, addon);
    }

    // delete addon
    async removeAddon(productName: string, addonName: string): Promise<void> {
        await this.goToAuctionProductEditById(productName);
        await this.click(productsVendor.addon.removeAddon(addonName));
        await this.click(productsVendor.addon.confirmRemove);
        await this.notToBeVisible(productsVendor.addon.addonRow(addonName));
        await this.saveProduct();
        await this.notToBeVisible(productsVendor.addon.addonRow(addonName));
    }
}
