import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { helpers } from 'utils/helpers';
import { product, bookingResource } from 'utils/interfaces';


export class BookingPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// booking


	// Admin Add Booking Product
	async adminAddBookingProduct(product: product['booking']) {
		await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

		// Name
		await this.clearAndType(selector.admin.products.product.productName, product.productName());
		await this.selectByValue(selector.admin.products.product.productType, product.productType);
		await this.click(selector.admin.products.product.general);
		await this.selectByValue(selector.admin.products.product.bookingDurationType, product.bookingDurationType);
		await this.clearAndType(selector.admin.products.product.bookingDurationMax, product.bookingDurationMax);
		await this.selectByValue(selector.admin.products.product.calendarDisplayMode, product.calendarDisplayMode);

		// Costs
		await this.click(selector.admin.products.product.bookingCosts);
		await this.clearAndType(selector.admin.products.product.baseCost, product.baseCost);
		await this.clearAndType(selector.admin.products.product.blockCost, product.blockCost);

		// Category
		await this.click(selector.admin.products.product.category(product.category));

		// Vendor Store Name
		await this.select2ByText(selector.admin.products.product.storeName, selector.admin.products.product.storeNameInput, product.storeName);
		await this.scrollToTop();

		// Publish
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.post, selector.admin.products.product.publish, 302);
		await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.publishSuccessMessage);
	}


	// vendor


	// vendor booking render properly
	async vendorBookingRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);

		// add booking product text is visible
		await this.toBeVisible(selector.vendor.vBooking.allBookingProductText);

		// booking menu elements are visible
		await this.multipleElementVisible(selector.vendor.vBooking.menus);

		// add new booking product button is visible
		await this.toBeVisible(selector.vendor.vBooking.addNewBookingProduct);

		// add booking  button is visible
		await this.toBeVisible(selector.vendor.vBooking.addBookingBtn);

		// filter elements are visible
		await this.multipleElementVisible(selector.vendor.vBooking.filters);

		// search elements are visible
		await this.multipleElementVisible(selector.vendor.vBooking.search);

		// booking product table elements are visible
		await this.multipleElementVisible(selector.vendor.vBooking.table);

	}


	// vendor manage booking render properly
	async vendorManageBookingRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.manageBooking);

		// manage booking text is visible
		await this.toBeVisible(selector.vendor.vBooking.manageBookings.manageBookingsText);

		// manage booking menu elements are visible
		await this.toBeVisible(selector.vendor.vBooking.manageBookings.menus.all);

		const noBookingsFound = await this.isVisible(selector.vendor.vBooking.manageBookings.noBookingsFound);
		if (noBookingsFound){
			return;
		}
		//todo: add more fields

	}


	// vendor manage booking render properly
	async vendorBookingCalendarRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.bookingCalendar);

		// manage booking text is visible
		await this.toBeVisible(selector.vendor.vBooking.calendar.calendarText);

		// calendar is visible
		await this.toBeVisible(selector.vendor.vBooking.calendar.calendar);

		// calendar filterBookings is visible
		await this.toBeVisible(selector.vendor.vBooking.calendar.filterBookings);

		// calendar month view elements are visible
		await this.multipleElementVisible(selector.vendor.vBooking.calendar.month);

		await this.clickAndWaitForLoadState(selector.vendor.vBooking.calendar.month.dayView);

		// calendar day view elements are visible
		await this.multipleElementVisible(selector.vendor.vBooking.calendar.day);

	}


	// vendor manage booking render properly
	async vendorManageResourcesRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.manageResources);

		// manage resource text is visible
		await this.toBeVisible(selector.vendor.vBooking.manageResources.manageResourcesText);

		// add new resource is visible
		await this.toBeVisible(selector.vendor.vBooking.manageResources.addNewResource);

		// booking product table elements are visible
		await this.multipleElementVisible(selector.vendor.vBooking.manageResources.table);

		const noBookingsFound = await this.isVisible(selector.vendor.vBooking.manageResources.noResourceFound);
		if (noBookingsFound){
			return;
		}
		//todo: add more fields

	}


	// update booking product fields
	async updateBookingProductFields(product: product['booking']){
		await this.clearAndType(selector.vendor.vBooking.booking.productName, product.name);
		// await this.addCategory(product.category);
		// general booking options
		await this.selectByValue(selector.vendor.vBooking.booking.bookingDurationType, product.bookingDurationType);
		await this.clearAndType(selector.vendor.vBooking.booking.bookingDurationMax, product.bookingDurationMax);
		await this.selectByValue(selector.vendor.vBooking.booking.bookingDurationUnit, product.bookingDurationUnit);
		// calendar display mode
		await this.selectByValue(selector.vendor.vBooking.booking.calendarDisplayMode, product.calendarDisplayMode);
		await this.check(selector.vendor.vBooking.booking.enableCalendarRangePicker);
		// availability
		await this.clearAndType(selector.vendor.vBooking.booking.maxBookingsPerBlock, product.maxBookingsPerBlock);
		await this.clearAndType(selector.vendor.vBooking.booking.minimumBookingWindowIntoTheFutureDate, product.minimumBookingWindowIntoTheFutureDate);
		await this.selectByValue(selector.vendor.vBooking.booking.minimumBookingWindowIntoTheFutureDateUnit, product.minimumBookingWindowIntoTheFutureDateUnit);
		await this.clearAndType(selector.vendor.vBooking.booking.maximumBookingWindowIntoTheFutureDate, product.maximumBookingWindowIntoTheFutureDate);
		await this.selectByValue(selector.vendor.vBooking.booking.maximumBookingWindowIntoTheFutureDateUnit, product.maximumBookingWindowIntoTheFutureDateUnit);
		// costs
		await this.clearAndType(selector.vendor.vBooking.booking.baseCost, product.baseCost);
		await this.clearAndType(selector.vendor.vBooking.booking.blockCost, product.blockCost);
		//todo: add more fields
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, selector.vendor.vBooking.booking.saveProduct, 302);
		await this.toContainText(selector.vendor.product.updatedSuccessMessage, product.saveSuccessMessage);

	}


	// vendor add booking product
	async addBookingProduct(product: product['booking']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);
		await this.click(selector.vendor.vBooking.addNewBookingProduct);
		await this.updateBookingProductFields(product);
	}


	// edit booking product
	async editBookingProduct(product: product['booking']){
		await this.searchBookingProduct(product.name);
		await this.hover(selector.vendor.vBooking.productCell(product.name));
		await this.clickAndWaitForLoadState(selector.vendor.vBooking.edit);
		await this.updateBookingProductFields(product);
	}


	// view booking product
	async viewBookingProduct(productName: string){
		await this.searchBookingProduct(productName);
		await this.hover(selector.vendor.vBooking.productCell(productName));
		await this.clickAndWaitForLoadState(selector.vendor.vBooking.view);

		// booking product elements are visible
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { bookingCalendar, bookNow, getSupport, ...viewBooking } = selector.vendor.vBooking.viewBooking;
		await this.multipleElementVisible(viewBooking);
		//todo: actual value can be asserted
	}


	// vendor can't buy own booking product
	async cantBuyOwnBookingProduct(productName: string){
		await this.goIfNotThere(data.subUrls.frontend.productDetails(helpers.slugify(productName)));
		await this.notToBeVisible(selector.vendor.vBooking.viewBooking.bookingCalendar);
		await this.notToBeVisible(selector.vendor.vBooking.viewBooking.bookNow);
	}


	// filter products
	async filterBookingProducts(filterType: string, value: string): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);

		switch(filterType){

		case 'by-date' :
			await this.selectByNumber(selector.vendor.vBooking.filters.filterByDate, value);
			break;

		case 'by-category' :
			await this.selectByLabel(selector.vendor.vBooking.filters.filterByCategory, value);
			break;


		case 'by-other' :
			await this.selectByValue(selector.vendor.vBooking.filters.filterByOther, value);
			break;

		default :
			break;
		}

		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking,  selector.vendor.vBooking.filters.filter);
		await this.notToHaveCount(selector.vendor.vBooking.numberOfRows, 0);

	}


	// search booking product
	async searchBookingProduct(productName: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);
		await this.clearAndType(selector.vendor.vBooking.search.searchInput, productName);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, selector.vendor.vBooking.search.search );
		await this.toBeVisible(selector.vendor.vBooking.productCell(productName));
	}


	// delete booking product
	async duplicateBookingProduct(productName: string){
		await this.searchBookingProduct(productName);
		await this.hover(selector.vendor.vBooking.productCell(productName));
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, selector.vendor.vBooking.duplicate);
		await this.toContainText(selector.vendor.vBooking.dokanSuccessMessage, 'Product succesfully duplicated');
	}


	// delete booking product
	async deleteBookingProduct(productName: string){
		await this.searchBookingProduct(productName);
		await this.hover(selector.vendor.vBooking.productCell(productName));
		await this.click(selector.vendor.vBooking.permanentlyDelete);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.booking, selector.vendor.vBooking.confirmDelete);
		await this.toContainText(selector.vendor.vBooking.dokanSuccessMessage, 'Product successfully deleted');
	}


	// add booking resource
	async addBookingResource(resourceName: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.manageResources);

		await this.clickAndWaitForLoadState(selector.vendor.vBooking.manageResources.addNewResource);
		await this.clearAndType(selector.vendor.vBooking.manageResources.resource.resourceName, resourceName);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vBooking.manageResources.resource.confirmAddNewResource);
		await this.toBeVisible(selector.vendor.vBooking.manageResources.resource.resourceCell(resourceName));
	}


	// add booking resource
	async editBookingResource(resource: bookingResource){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.manageResources);
		await this.clickAndWaitForLoadState(selector.vendor.vBooking.manageResources.resource.editResource(resource.name));

		await this.clearAndType(selector.vendor.vBooking.manageResources.resource.resourceTitle, resource.name);
		await this.clearAndType(selector.vendor.vBooking.manageResources.resource.availableQuantity, resource.quantity);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.manageResources, selector.vendor.vBooking.manageResources.resource.saveResource);
		await this.toContainText(selector.vendor.product.updatedSuccessMessage, 'Success! The Resource has been updated successfully.');
	}


	// delete booking resource
	async deleteBookingResource(resourceName: string){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.manageResources);
		await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, selector.vendor.vBooking.manageResources.resource.deleteResource(resourceName));
		await this.notToBeVisible(selector.vendor.vBooking.manageResources.resource.resourceCell(resourceName));

	}


}
