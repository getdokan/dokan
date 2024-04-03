import { Page } from '@playwright/test';
import { VendorPage } from '@pages/vendorPage';
import { CustomerPage } from '@pages/customerPage';
import { selector } from '@pages/selectors';
import { data } from '@utils/testData';
import { helpers } from '@utils/helpers';
import { product, bookings, bookingResource } from '@utils/interfaces';

// selectors
const bookingProductsAdmin = selector.admin.products;
const bookingProductsVendor = selector.vendor.vBooking;

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
        await this.selectByValue(bookingProductsAdmin.product.bookingDurationType, product.bookingDurationType);
        await this.clearAndType(bookingProductsAdmin.product.bookingDurationMax, product.bookingDurationMax);
        await this.selectByValue(bookingProductsAdmin.product.calendarDisplayMode, product.calendarDisplayMode);

        // Costs
        await this.click(bookingProductsAdmin.product.bookingCosts);
        await this.clearAndType(bookingProductsAdmin.product.baseCost, product.baseCost);
        await this.clearAndType(bookingProductsAdmin.product.blockCost, product.blockCost);

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
        // general booking options
        await this.selectByValue(bookingProductsVendor.booking.bookingDurationType, product.bookingDurationType);
        await this.clearAndType(bookingProductsVendor.booking.bookingDurationMin, product.bookingDurationMin);
        await this.clearAndType(bookingProductsVendor.booking.bookingDurationMax, product.bookingDurationMax);
        await this.selectByValue(bookingProductsVendor.booking.bookingDurationUnit, product.bookingDurationUnit);
        // calendar display mode
        await this.selectByValue(bookingProductsVendor.booking.calendarDisplayMode, product.calendarDisplayMode);
        await this.check(bookingProductsVendor.booking.enableCalendarRangePicker);
        // availability
        await this.clearAndType(bookingProductsVendor.booking.maxBookingsPerBlock, product.maxBookingsPerBlock);
        await this.clearAndType(bookingProductsVendor.booking.minimumBookingWindowIntoTheFutureDate, product.minimumBookingWindowIntoTheFutureDate);
        await this.selectByValue(bookingProductsVendor.booking.minimumBookingWindowIntoTheFutureDateUnit, product.minimumBookingWindowIntoTheFutureDateUnit);
        await this.clearAndType(bookingProductsVendor.booking.maximumBookingWindowIntoTheFutureDate, product.maximumBookingWindowIntoTheFutureDate);
        await this.selectByValue(bookingProductsVendor.booking.maximumBookingWindowIntoTheFutureDateUnit, product.maximumBookingWindowIntoTheFutureDateUnit);
        // costs
        await this.clearAndType(bookingProductsVendor.booking.baseCost, product.baseCost);
        await this.clearAndType(bookingProductsVendor.booking.blockCost, product.blockCost);
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
        await this.searchBookingProduct(product.name);
        await this.hover(bookingProductsVendor.productCell(product.name));
        await this.clickAndWaitForLoadState(bookingProductsVendor.edit(product.name));
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
        const { bookingCalendar, bookNow, getSupport, ...viewBooking } = bookingProductsVendor.viewBooking;
        await this.multipleElementVisible(viewBooking);
        // todo: actual value can be asserted
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
            await this.press(data.key.arrowDown);
            await this.press(data.key.enter);
        }

        await this.click(bookingProductsVendor.addBooking.selectABookableProductDropdown);
        await this.click(bookingProductsVendor.addBooking.selectABookableProduct(productName));

        await this.click(bookingProductsVendor.addBooking.createANewCorrespondingOrderForThisNewBooking);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.addBooking, bookingProductsVendor.addBooking.next);
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cBookings.selectCalendarDay(bookings.startDate.getMonth(), bookings.startDate.getDate()));
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cBookings.selectCalendarDay(bookings.endDate.getMonth(), bookings.endDate.getDate()));
        await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.addBooking, bookingProductsVendor.addBooking.addBooking);
        await this.toContainText(bookingProductsVendor.addBooking.successMessage, 'The booking has been added successfully.');
    }

    // customer

    async buyBookableProduct(productName: string, bookings: bookings) {
        await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));

        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cBookings.selectCalendarDay(bookings.startDate.getMonth(), bookings.startDate.getDate()));
        await this.clickAndWaitForResponse(data.subUrls.ajax, selector.customer.cBookings.selectCalendarDay(bookings.endDate.getMonth(), bookings.endDate.getDate()));
        await this.clickAndWaitForResponse(data.subUrls.frontend.productDetails(helpers.slugify(productName)), selector.customer.cBookings.bookNow);
        await this.customerPage.placeOrder();
    }
}
