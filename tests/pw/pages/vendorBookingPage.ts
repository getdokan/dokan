import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { product, bookings, bookingResource } from '@utils/interfaces';

const { DOKAN_PRO } = process.env;

// selectors
const bookingProductsAdmin = selector.admin.products;
const bookingProductsVendor = selector.vendor.vBooking;
const productsVendor = selector.vendor.product;

export class BookingPage extends VendorPage {
    constructor(page: Page) {
        super(page);
    }

    customerPage = new CustomerPage(this.page);

    // booking

    // Admin Add Booking Product
    async adminAddBookingProduct(product: product['booking']) {
        await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

        // Name
        await this.clearAndType(bookingProductsAdmin.product.productName, product.productName());
        await this.selectByValue(bookingProductsAdmin.product.productType, product.productType);
        await this.click(bookingProductsAdmin.product.general);
        await this.selectByValue(bookingProductsAdmin.product.bookingDurationType, product.duration.bookingDurationType);
        await this.clearAndType(bookingProductsAdmin.product.bookingDurationMax, product.duration.bookingDurationMax);
        await this.selectByValue(bookingProductsAdmin.product.calendarDisplayMode, product.calendarDisplayMode);

        // Costs
        await this.click(bookingProductsAdmin.product.bookingCosts);
        await this.clearAndType(bookingProductsAdmin.product.baseCost, product.costs.baseCost);
        await this.clearAndType(bookingProductsAdmin.product.blockCost, product.costs.blockCost);

        // Category
        await this.click(bookingProductsAdmin.product.category(product.category));

        // Vendor Store Name
        await this.select2ByText(bookingProductsAdmin.product.storeName, bookingProductsAdmin.product.storeNameInput, product.storeName);
        await this.scrollToTop();

        // Publish
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, bookingProductsAdmin.product.publish, 302);
        await this.toContainText(bookingProductsAdmin.product.updatedSuccessMessage, data.product.publishSuccessMessage);
    }

    // vendor

    // go to booking product edit
    async goToBookingProductEdit(productName: string): Promise<void> {
        await this.searchBookingProduct(productName);
        await this.hover(bookingProductsVendor.productCell(productName));
        await this.clickAndWaitForLoadState(bookingProductsVendor.edit(productName));
        await this.toHaveValue(bookingProductsVendor.booking.productName, productName);
    }

    async goToBookingProductEditById(productId: string): Promise<void> {
        await this.gotoUntilNetworkidle(data.subUrls.frontend.vDashboard.bookingProductEdit(productId));
    }

    // vendor booking render properly
    async vendorBookingRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);

        // add booking product text is visible
        await this.toBeVisible(bookingProductsVendor.allBookingProductText);

        // booking menu elements are visible
        await this.multipleElementVisible(bookingProductsVendor.menus);

        // add new booking product button is visible
        await this.toBeVisible(bookingProductsVendor.addNewBookingProduct);

        // add booking  button is visible
        await this.toBeVisible(bookingProductsVendor.addBookingBtn);

        // filter elements are visible
        await this.multipleElementVisible(bookingProductsVendor.filters);

        // search elements are visible
        await this.multipleElementVisible(bookingProductsVendor.search);

        // booking product table elements are visible
        await this.multipleElementVisible(bookingProductsVendor.table);
    }

    // vendor manage booking render properly
    async vendorManageBookingRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.manageBooking);

        // manage booking text is visible
        await this.toBeVisible(bookingProductsVendor.manageBookings.manageBookingsText);

        // manage booking menu elements are visible
        await this.toBeVisible(bookingProductsVendor.manageBookings.menus.all);

        const noBookingsFound = await this.isVisible(bookingProductsVendor.manageBookings.noBookingsFound);
        if (noBookingsFound) {
            return;
        }
        // todo: add more fields
    }

    // vendor manage booking render properly
    async vendorBookingCalendarRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.bookingCalendar);

        // manage booking text is visible
        await this.toBeVisible(bookingProductsVendor.calendar.calendarText);

        // calendar is visible
        await this.toBeVisible(bookingProductsVendor.calendar.calendar);

        // calendar filterBookings is visible
        await this.toBeVisible(bookingProductsVendor.calendar.filterBookings);

        // calendar month view elements are visible
        await this.multipleElementVisible(bookingProductsVendor.calendar.month);

        await this.clickAndWaitForLoadState(bookingProductsVendor.calendar.month.dayView);

        // calendar day view elements are visible
        await this.multipleElementVisible(bookingProductsVendor.calendar.day);
    }

    // vendor manage booking render properly
    async vendorManageResourcesRenderProperly() {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.manageResources);

        // manage resource text is visible
        await this.toBeVisible(bookingProductsVendor.manageResources.manageResourcesText);

        // add new resource is visible
        await this.toBeVisible(bookingProductsVendor.manageResources.addNewResource);

        // booking product table elements are visible
        await this.multipleElementVisible(bookingProductsVendor.manageResources.table);

        const noBookingsFound = await this.isVisible(bookingProductsVendor.manageResources.noResourceFound);
        if (noBookingsFound) {
            return;
        }
        // todo: add more fields
    }

    // update booking product fields
    async updateBookingProductFields(product: product['booking']) {
        await this.clearAndType(bookingProductsVendor.booking.productName, product.name);
        // await this.addProductCategory(product.category);
        // booking duration options
        await this.selectByValue(bookingProductsVendor.booking.bookingDurationType, product.duration.bookingDurationType);
        await this.clearAndType(bookingProductsVendor.booking.bookingDurationMin, product.duration.bookingDurationMin);
        await this.clearAndType(bookingProductsVendor.booking.bookingDurationMax, product.duration.bookingDurationMax);
        await this.selectByValue(bookingProductsVendor.booking.bookingDurationUnit, product.duration.bookingDurationUnit);
        // calendar display mode
        await this.selectByValue(bookingProductsVendor.booking.calendarDisplayMode, product.calendarDisplayMode);
        await this.check(bookingProductsVendor.booking.enableCalendarRangePicker);
        // availability
        await this.clearAndType(bookingProductsVendor.booking.maxBookingsPerBlock, product.availability.maxBookingsPerBlock);
        await this.clearAndType(bookingProductsVendor.booking.minimumBookingWindowIntoTheFutureDate, product.availability.minimumBookingWindowIntoTheFutureDate);
        await this.selectByValue(bookingProductsVendor.booking.minimumBookingWindowIntoTheFutureDateUnit, product.availability.minimumBookingWindowIntoTheFutureDateUnit);
        await this.clearAndType(bookingProductsVendor.booking.maximumBookingWindowIntoTheFutureDate, product.availability.maximumBookingWindowIntoTheFutureDate);
        await this.selectByValue(bookingProductsVendor.booking.maximumBookingWindowIntoTheFutureDateUnit, product.availability.maximumBookingWindowIntoTheFutureDateUnit);
        // costs
        await this.clearAndType(bookingProductsVendor.booking.baseCost, product.costs.baseCost);
        await this.clearAndType(bookingProductsVendor.booking.blockCost, product.costs.blockCost);
        // todo: add more fields
    }

    // vendor add booking product
    async addBookingProduct(product: product['booking']): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);
        await this.clickAndWaitForLoadState(bookingProductsVendor.addNewBookingProduct);
        await this.updateBookingProductFields(product);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.addBookingProduct, bookingProductsVendor.booking.saveProduct, 302);
        await this.toContainText(selector.vendor.product.updatedSuccessMessage, product.saveSuccessMessage);
    }

    // edit booking product
    async editBookingProduct(product: product['booking']) {
        await this.goToBookingProductEdit(product.name);
        await this.updateBookingProductFields(product);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, bookingProductsVendor.booking.saveProduct, 302);
        await this.toContainText(selector.vendor.product.updatedSuccessMessage, product.saveSuccessMessage);
    }

    // view booking product
    async viewBookingProduct(productName: string) {
        await this.searchBookingProduct(productName);
        await this.hover(bookingProductsVendor.productCell(productName));
        await this.clickAndWaitForLoadState(bookingProductsVendor.view(productName));

        // booking product elements are visible
        const { bookingCalendar, bookNow, getSupport, price, ...viewBooking } = bookingProductsVendor.viewBooking;
        await this.multipleElementVisible(viewBooking);
    }

    // vendor can't buy own booking product
    async cantBuyOwnBookingProduct(productName: string) {
        await this.goToProductDetails(productName);
        await this.notToBeVisible(bookingProductsVendor.viewBooking.bookingCalendar);
        await this.notToBeVisible(bookingProductsVendor.viewBooking.bookNow);
    }

    // filter products
    async filterBookingProducts(filterBy: string, value: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);

        switch (filterBy) {
            case 'by-date':
                await this.selectByNumber(bookingProductsVendor.filters.filterByDate, value);
                break;

            case 'by-category':
                await this.selectByLabel(bookingProductsVendor.filters.filterByCategory, value);
                break;

            case 'by-other':
                await this.selectByValue(bookingProductsVendor.filters.filterByOther, value);
                break;

            default:
                break;
        }

        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, bookingProductsVendor.filters.filter);
        await this.notToHaveCount(bookingProductsVendor.numberOfRowsFound, 0);
    }

    // search booking product
    async searchBookingProduct(productName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);
        await this.clearAndType(bookingProductsVendor.search.searchInput, productName);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, bookingProductsVendor.search.search);
        await this.toBeVisible(bookingProductsVendor.productCell(productName));
    }

    // delete booking product
    async duplicateBookingProduct(productName: string) {
        await this.searchBookingProduct(productName);
        await this.hover(bookingProductsVendor.productCell(productName));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, bookingProductsVendor.duplicate(productName));
        await this.toContainText(bookingProductsVendor.dokanSuccessMessage, 'Product successfully duplicated');
    }

    // delete booking product
    async deleteBookingProduct(productName: string) {
        await this.searchBookingProduct(productName);
        await this.hover(bookingProductsVendor.productCell(productName));
        await this.click(bookingProductsVendor.permanentlyDelete(productName));
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, bookingProductsVendor.confirmDelete);
        await this.toContainText(bookingProductsVendor.dokanSuccessMessage, 'Product successfully deleted');
    }

    // add booking resource
    async addBookingResource(resourceName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.manageResources);

        await this.clickAndWaitForLoadState(bookingProductsVendor.manageResources.addNewResource);
        await this.clearAndType(bookingProductsVendor.manageResources.resource.resourceName, resourceName);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, bookingProductsVendor.manageResources.resource.confirmAddNewResource);
        await this.toBeVisible(bookingProductsVendor.manageResources.resource.resourceCell(resourceName));
    }

    // add booking resource
    async editBookingResource(resource: bookingResource) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.manageResources);
        await this.clickAndWaitForLoadState(bookingProductsVendor.manageResources.resource.editResource(resource.name));

        await this.clearAndType(bookingProductsVendor.manageResources.resource.resourceTitle, resource.name);
        await this.clearAndType(bookingProductsVendor.manageResources.resource.availableQuantity, resource.quantity);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.manageResources, bookingProductsVendor.manageResources.resource.saveResource);
        await this.toContainText(selector.vendor.product.updatedSuccessMessage, 'Success! The Resource has been updated successfully.');
    }

    // delete booking resource
    async deleteBookingResource(resourceName: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.manageResources);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, bookingProductsVendor.manageResources.resource.deleteResource(resourceName));
        await this.notToBeVisible(bookingProductsVendor.manageResources.resource.resourceCell(resourceName));
    }

    // add booking
    async addBooking(productName: string, bookings: bookings, customerName?: string) {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.addBooking);

        if (customerName) {
            await this.click(bookingProductsVendor.addBooking.selectCustomerDropdown);
            await this.typeAndWaitForResponse(data.subUrls.ajax, bookingProductsVendor.addBooking.selectCustomerInput, customerName);
            await this.toContainText(bookingProductsVendor.addBooking.searchedResult, customerName);
            await this.click(bookingProductsVendor.addBooking.searchedResultByName(customerName));
        }

        await this.click(bookingProductsVendor.addBooking.selectABookableProductDropdown);
        await this.click(bookingProductsVendor.addBooking.selectABookableProduct(productName));

        await this.click(bookingProductsVendor.addBooking.createANewCorrespondingOrderForThisNewBooking);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.bookedDayBlocks, bookingProductsVendor.addBooking.next);
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cBookings.selectCalendarDay(bookings.startDate.getMonth(), bookings.startDate.getDate()));
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cBookings.selectCalendarDay(bookings.endDate.getMonth(), bookings.endDate.getDate()));
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.addBooking, bookingProductsVendor.addBooking.addBooking);
        await this.toContainText(bookingProductsVendor.addBooking.successMessage, 'The booking has been added successfully.');
    }

    // customer

    async buyBookableProduct(productName: string, bookings: bookings) {
        await this.gotoUntilNetworkidle(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
        await this.notToBeVisible(selector.customer.cBookings.calendarLoader);
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cBookings.selectCalendarDay(bookings.startDate.getMonth(), bookings.startDate.getDate()));
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cBookings.selectCalendarDay(bookings.endDate.getMonth(), bookings.endDate.getDate()));
        await this.clickAndWaitForResponse(data.subUrls.frontend.productDetails(helpers.slugify(productName)), selector.customer.cBookings.bookNow);
        await this.customerPage.placeOrder();
    }

    // save product
    async saveProduct() {
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, bookingProductsVendor.booking.saveProduct, 302);
        await this.toContainText(selector.vendor.product.updatedSuccessMessage, 'Success! The product has been saved successfully.');
    }

    // add product title
    async addProductTitle(productName: string, title: string): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.clearAndType(bookingProductsVendor.booking.productName, title);
        await this.saveProduct();
        await this.toHaveValue(bookingProductsVendor.booking.productName, title);
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
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
        await this.vendorAddProductCategory(category, false, true);
    }

    // add product tags
    async addProductTags(productName: string, tags: string[]): Promise<void> {
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
        await this.hover(productsVendor.image.coverImageDiv);
        await this.click(productsVendor.image.removeFeatureImage);
        await this.saveProduct();
        await this.toHaveAttribute(productsVendor.image.uploadedFeatureImage, 'src', /^$/);
        await this.toBeVisible(productsVendor.image.uploadImageText);
    }

    // add product gallery images
    async addProductGalleryImages(productName: string, galleryImages: string[], removePrevious: boolean = false): Promise<void> {
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
        await this.typeFrameSelector(productsVendor.shortDescription.shortDescriptionIframe, productsVendor.shortDescription.shortDescriptionHtmlBody, shortDescription);
        await this.saveProduct();
        await this.toContainTextFrameLocator(productsVendor.shortDescription.shortDescriptionIframe, productsVendor.shortDescription.shortDescriptionHtmlBody, shortDescription);
    }

    // add product description
    async addProductDescription(productName: string, description: string): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.typeFrameSelector(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, description);
        await this.saveProduct();
        await this.toContainTextFrameLocator(productsVendor.description.descriptionIframe, productsVendor.description.descriptionHtmlBody, description);
    }

    // add product virtual option
    async addProductVirtualOption(productName: string, enable: boolean): Promise<void> {
        await this.goToBookingProductEditById(productName);
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
    async addProductInventory(productName: string, inventory: product['productInfo']['inventory'], choice: string): Promise<void> {
        await this.goToBookingProductEditById(productName);

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
        await this.goToBookingProductEditById(productName);
        await this.uncheck(productsVendor.inventory.enableStockManagement);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.inventory.enableStockManagement);
    }

    // add product other options (product status, visibility, purchase note, reviews)
    async addProductOtherOptions(productName: string, otherOption: product['productInfo']['otherOptions'], choice: string): Promise<void> {
        await this.goToBookingProductEditById(productName);

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
        await this.goToBookingProductEditById(productName);
        await this.check(productsVendor.catalogMode.removeAddToCart);
        if (hidePrice) await this.check(productsVendor.catalogMode.hideProductPrice);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.catalogMode.removeAddToCart);
        if (hidePrice) await this.toBeChecked(productsVendor.catalogMode.hideProductPrice);
    }

    // remove product catalog mode
    async removeProductCatalogMode(productName: string, onlyPrice: boolean = false): Promise<void> {
        await this.goToBookingProductEditById(productName);

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
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
        await this.uncheck(productsVendor.shipping.requiresShipping);
        await this.saveProduct();
        await this.notToBeChecked(productsVendor.shipping.requiresShipping);
    }

    // add product tax
    async addProductTax(productName: string, tax: product['productInfo']['tax'], hasClass: boolean = false): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.selectByValue(productsVendor.tax.status, tax.status);
        if (hasClass) await this.selectByValue(productsVendor.tax.class, tax.class);
        await this.saveProduct();
        await this.toHaveSelectedValue(productsVendor.tax.status, tax.status);
        if (hasClass) await this.toHaveSelectedValue(productsVendor.tax.class, tax.class);
    }

    // add product duration
    async addProductDuration(productName: string, duration: product['booking']['duration']): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.selectByValue(bookingProductsVendor.booking.bookingDurationType, duration.bookingDurationType);
        await this.clearAndType(bookingProductsVendor.booking.bookingDuration, duration.bookingDuration);
        await this.selectByValue(bookingProductsVendor.booking.bookingDurationUnit, duration.bookingDurationUnit);
        await this.clearAndType(bookingProductsVendor.booking.bookingDurationMin, duration.bookingDurationMin);
        await this.clearAndType(bookingProductsVendor.booking.bookingDurationMax, duration.bookingDurationMax);

        await this.saveProduct();

        await this.toHaveSelectedValue(bookingProductsVendor.booking.bookingDurationType, duration.bookingDurationType);
        await this.toHaveValue(bookingProductsVendor.booking.bookingDuration, duration.bookingDuration);
        await this.toHaveSelectedValue(bookingProductsVendor.booking.bookingDurationUnit, duration.bookingDurationUnit);
        await this.toHaveValue(bookingProductsVendor.booking.bookingDurationMin, duration.bookingDurationMin);
        await this.toHaveValue(bookingProductsVendor.booking.bookingDurationMax, duration.bookingDurationMax);
    }

    // add product basic options
    async addProductBasicOptions(productName: string, product: product['booking']): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.selectByValue(bookingProductsVendor.booking.calendarDisplayMode, product.calendarDisplayMode);
        await this.check(bookingProductsVendor.booking.enableCalendarRangePicker);
        await this.check(bookingProductsVendor.booking.requiresConfirmation);
        await this.check(bookingProductsVendor.booking.canBeCancelled);

        await this.saveProduct();

        await this.toHaveSelectedValue(bookingProductsVendor.booking.calendarDisplayMode, product.calendarDisplayMode);
        await this.toBeChecked(bookingProductsVendor.booking.enableCalendarRangePicker);
        await this.toBeChecked(bookingProductsVendor.booking.requiresConfirmation);
        await this.toBeChecked(bookingProductsVendor.booking.canBeCancelled);
    }

    // add product availability options
    async addProductAvailability(productName: string, availability: product['booking']['availability']): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.clearAndType(bookingProductsVendor.booking.maxBookingsPerBlock, availability.maxBookingsPerBlock);
        await this.clearAndType(bookingProductsVendor.booking.minimumBookingWindowIntoTheFutureDate, availability.minimumBookingWindowIntoTheFutureDate);
        await this.selectByValue(bookingProductsVendor.booking.minimumBookingWindowIntoTheFutureDateUnit, availability.minimumBookingWindowIntoTheFutureDateUnit);
        await this.clearAndType(bookingProductsVendor.booking.maximumBookingWindowIntoTheFutureDate, availability.maximumBookingWindowIntoTheFutureDate);
        await this.selectByValue(bookingProductsVendor.booking.maximumBookingWindowIntoTheFutureDateUnit, availability.maximumBookingWindowIntoTheFutureDateUnit);
        await this.clearAndType(bookingProductsVendor.booking.requireABufferPeriodOfMonthsBetweenBookings, availability.requireABufferPeriodOfMonthsBetweenBookings);
        await this.check(bookingProductsVendor.booking.adjacentBuffering);
        await this.selectByValue(bookingProductsVendor.booking.allDatesAvailability, availability.allDatesAvailability);
        await this.selectByValue(bookingProductsVendor.booking.checkRulesAgainst, availability.checkRulesAgainst);

        await this.saveProduct();

        await this.toHaveValue(bookingProductsVendor.booking.maxBookingsPerBlock, availability.maxBookingsPerBlock);
        await this.toHaveValue(bookingProductsVendor.booking.minimumBookingWindowIntoTheFutureDate, availability.minimumBookingWindowIntoTheFutureDate);
        await this.toHaveSelectedValue(bookingProductsVendor.booking.minimumBookingWindowIntoTheFutureDateUnit, availability.minimumBookingWindowIntoTheFutureDateUnit);
        await this.toHaveValue(bookingProductsVendor.booking.maximumBookingWindowIntoTheFutureDate, availability.maximumBookingWindowIntoTheFutureDate);
        await this.toHaveSelectedValue(bookingProductsVendor.booking.maximumBookingWindowIntoTheFutureDateUnit, availability.maximumBookingWindowIntoTheFutureDateUnit);
        await this.toHaveValue(bookingProductsVendor.booking.requireABufferPeriodOfMonthsBetweenBookings, availability.requireABufferPeriodOfMonthsBetweenBookings);
        await this.toBeChecked(bookingProductsVendor.booking.adjacentBuffering);
        await this.toHaveSelectedValue(bookingProductsVendor.booking.allDatesAvailability, availability.allDatesAvailability);
        await this.toHaveSelectedValue(bookingProductsVendor.booking.checkRulesAgainst, availability.checkRulesAgainst);
    }

    // add product costs
    async addProductCosts(productName: string, costs: product['booking']['costs']): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.clearAndType(bookingProductsVendor.booking.baseCost, costs.baseCost);
        await this.clearAndType(bookingProductsVendor.booking.blockCost, costs.blockCost);
        await this.clearAndType(bookingProductsVendor.booking.displayCost, costs.displayCost);
        await this.saveProduct();
        await this.toHaveValue(bookingProductsVendor.booking.baseCost, costs.baseCost);
        await this.toHaveValue(bookingProductsVendor.booking.blockCost, costs.blockCost);
        await this.toHaveValue(bookingProductsVendor.booking.displayCost, costs.displayCost);
    }

    // add product extra options

    // persons
    async addProductPersons(productName: string, extraOptions: product['booking']['extraOptions']): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.focus(bookingProductsVendor.booking.hasPersons);
        await this.check(bookingProductsVendor.booking.hasPersons);
        await this.clearAndType(bookingProductsVendor.booking.minPersons, extraOptions.minPersons);
        await this.clearAndType(bookingProductsVendor.booking.maxPersons, extraOptions.maxPersons);
        await this.check(bookingProductsVendor.booking.multiplyAllCostsByPersonCount);
        await this.check(bookingProductsVendor.booking.countPersonsAsBookings);
        await this.saveProduct();
        await this.toBeChecked(bookingProductsVendor.booking.hasPersons);
        await this.toHaveValue(bookingProductsVendor.booking.minPersons, extraOptions.minPersons);
        await this.toHaveValue(bookingProductsVendor.booking.maxPersons, extraOptions.maxPersons);
        await this.toBeChecked(bookingProductsVendor.booking.multiplyAllCostsByPersonCount);
        await this.toBeChecked(bookingProductsVendor.booking.countPersonsAsBookings);
    }

    // add person type
    async addProductPersonType(productName: string, extraOptions: product['booking']['extraOptions']): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.focus(bookingProductsVendor.booking.hasPersons);
        await this.check(bookingProductsVendor.booking.hasPersons);
        await this.check(bookingProductsVendor.booking.enablePersonTypes);
        await this.clickAndWaitForResponse(data.subUrls.ajax, bookingProductsVendor.booking.addPersonType);
        await this.clearAndType(bookingProductsVendor.booking.person.typeName, extraOptions.person.typeName);
        await this.clearAndType(bookingProductsVendor.booking.person.baseCost, extraOptions.person.baseCost);
        await this.clearAndType(bookingProductsVendor.booking.person.blockCost, extraOptions.person.blockCost);
        await this.clearAndType(bookingProductsVendor.booking.person.description, extraOptions.person.description);
        await this.clearAndType(bookingProductsVendor.booking.person.min, extraOptions.person.min);
        await this.clearAndType(bookingProductsVendor.booking.person.max, extraOptions.person.max);

        await this.saveProduct();

        await this.toBeChecked(bookingProductsVendor.booking.hasPersons);
        await this.toBeChecked(bookingProductsVendor.booking.enablePersonTypes);
        await this.toHaveValue(bookingProductsVendor.booking.person.typeName, extraOptions.person.typeName);
        await this.toHaveValue(bookingProductsVendor.booking.person.baseCost, extraOptions.person.baseCost);
        await this.toHaveValue(bookingProductsVendor.booking.person.blockCost, extraOptions.person.blockCost);
        await this.toHaveValue(bookingProductsVendor.booking.person.description, extraOptions.person.description);
        await this.toHaveValue(bookingProductsVendor.booking.person.min, extraOptions.person.min);
        await this.toHaveValue(bookingProductsVendor.booking.person.max, extraOptions.person.max);
    }

    // remove product person
    async removeProductPersonType(productName: string): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.focus(bookingProductsVendor.booking.remove);
        await this.click(bookingProductsVendor.booking.remove);
        await this.clickAndWaitForResponse(data.subUrls.ajax, bookingProductsVendor.booking.confirmRemove);
        await this.notToBeVisible(bookingProductsVendor.booking.remove); //todo: replace with person id
    }

    // resources

    // add product resource
    async addProductResources(productName: string, extraOptions: product['booking']['extraOptions']): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.focus(bookingProductsVendor.booking.hasResources);
        await this.check(bookingProductsVendor.booking.hasResources);
        await this.clearAndType(bookingProductsVendor.booking.label, extraOptions.label);
        await this.selectByValue(bookingProductsVendor.booking.resourcesAllocation, extraOptions.resourcesAllocation);
        await this.selectByValue(bookingProductsVendor.booking.addResourceId, extraOptions.addResourceId);
        await this.clickAndWaitForResponse(data.subUrls.ajax, bookingProductsVendor.booking.addResource);
        await this.clearAndType(bookingProductsVendor.booking.resourceBaseCost, extraOptions.resource.baseCost);
        await this.clearAndType(bookingProductsVendor.booking.resourceBlockCost, extraOptions.resource.blockCost);

        await this.saveProduct();

        await this.toBeChecked(bookingProductsVendor.booking.hasResources);
        await this.toHaveValue(bookingProductsVendor.booking.label, extraOptions.label);
        await this.toHaveSelectedValue(bookingProductsVendor.booking.resourcesAllocation, extraOptions.resourcesAllocation);
        await this.toHaveValue(bookingProductsVendor.booking.resourceBaseCost, extraOptions.resource.baseCost);
        await this.toHaveValue(bookingProductsVendor.booking.resourceBlockCost, extraOptions.resource.blockCost);
    }

    // remove product resource
    async removeProductResource(productName: string): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.focus(bookingProductsVendor.booking.removeResource);
        await this.clickAndAcceptAndWaitForResponse(data.subUrls.ajax, bookingProductsVendor.booking.removeResource);
        await this.notToBeVisible(bookingProductsVendor.booking.removeResource); //todo: replace with resource id
    }

    // add product linked products
    async addProductLinkedProducts(productName: string, linkedProducts: product['productInfo']['linkedProducts'], choice: string): Promise<void> {
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
        await this.click(productsVendor.attribute.removeAttribute(attribute));
        await this.click(productsVendor.attribute.confirmRemoveAttribute);
        await this.notToBeVisible(productsVendor.attribute.savedAttribute(attribute));
        await this.saveProduct();
        await this.notToBeVisible(productsVendor.attribute.savedAttribute(attribute));
    }

    // remove product attribute term
    async removeProductAttributeTerm(productName: string, attribute: string, attributeTerm: string): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.click(productsVendor.attribute.savedAttribute(attribute));
        await this.click(productsVendor.attribute.removeSelectedAttributeTerm(attributeTerm));
        await this.press('Escape'); // shift focus from element
        await this.notToBeVisible(productsVendor.attribute.selectedAttributeTerm(attributeTerm));
        await this.clickAndWaitForResponse(data.subUrls.ajax, productsVendor.attribute.saveAttribute);
        await this.saveProduct();
        await this.click(productsVendor.attribute.savedAttribute(attribute));
        await this.notToBeVisible(productsVendor.attribute.selectedAttributeTerm(attributeTerm));
    }

    // dokan pro modules

    // add product geolocation
    async addProductGeolocation(productName: string, location: string): Promise<void> {
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
        await this.check(productsVendor.geolocation.sameAsStore);
        await this.saveProduct();
        await this.toBeChecked(productsVendor.geolocation.sameAsStore);
    }

    // add product addons
    async addProductAddon(productName: string, addon: product['productInfo']['addon']): Promise<void> {
        await this.goToBookingProductEditById(productName);
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
        await this.goToBookingProductEditById(productName);
        await this.click(productsVendor.addon.import);
        await this.clearAndType(productsVendor.addon.importInput, addon);
        await this.saveProduct();
        await this.toBeVisible(productsVendor.addon.addonRow(addonTitle));
    }

    // export addon
    async exportAddon(productName: string, addon: string): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.click(productsVendor.addon.export);
        await this.toContainText(productsVendor.addon.exportInput, addon);
    }

    // delete addon
    async removeAddon(productName: string, addonName: string): Promise<void> {
        await this.goToBookingProductEditById(productName);
        await this.click(productsVendor.addon.removeAddon(addonName));
        await this.click(productsVendor.addon.confirmRemove);
        await this.notToBeVisible(productsVendor.addon.addonRow(addonName));
        await this.saveProduct();
        await this.notToBeVisible(productsVendor.addon.addonRow(addonName));
    }
}
