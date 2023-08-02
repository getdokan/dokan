import { Page } from '@playwright/test';
import { VendorPage } from 'pages/vendorPage';
import { selector } from 'pages/selectors';
import { data } from 'utils/testData';
import { product } from 'utils/interfaces';

export class BookingPage extends VendorPage {

	constructor(page: Page) {
		super(page);
	}


	// booking


	// Admin Add Booking Product
	async adminAddBookingProduct(product: product['booking']) {
		await this.goIfNotThere(data.subUrls.backend.wc.addNewProducts);

		// Name
		await this.type(selector.admin.products.product.productName, product.productName());
		await this.selectByValue(selector.admin.products.product.productType, product.productType);
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
		await this.clickAndWaitForResponse(data.subUrls.post, selector.admin.products.product.publish, 302);
		await this.toContainText(selector.admin.products.product.updatedSuccessMessage, data.product.publishSuccessMessage);
	}


	// vendor booking render properly
	async vendorBookingRenderProperly(){
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);

	}


	// vendor add booking product
	async addBookingProduct(product: product['booking']): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.vDashboard.booking);
		const productName = product.productName();
		await this.click(selector.vendor.vBooking.addNewBookingProduct);
		// add new booking product
		await this.type(selector.vendor.vBooking.productName, productName);
		// await this.addCategory(product.category)
		// general booking options
		await this.selectByValue(selector.vendor.vBooking.bookingDurationType, product.bookingDurationType);
		await this.clearAndType(selector.vendor.vBooking.bookingDurationMax, product.bookingDurationMax);
		await this.selectByValue(selector.vendor.vBooking.bookingDurationUnit, product.bookingDurationUnit);
		// calendar display mode
		await this.selectByValue(selector.vendor.vBooking.calendarDisplayMode, product.calendarDisplayMode);
		await this.check(selector.vendor.vBooking.enableCalendarRangePicker);
		// availability
		await this.clearAndType(selector.vendor.vBooking.maxBookingsPerBlock, product.maxBookingsPerBlock);
		await this.clearAndType(selector.vendor.vBooking.minimumBookingWindowIntoTheFutureDate, product.minimumBookingWindowIntoTheFutureDate);
		await this.selectByValue(selector.vendor.vBooking.minimumBookingWindowIntoTheFutureDateUnit, product.minimumBookingWindowIntoTheFutureDateUnit);
		await this.clearAndType(selector.vendor.vBooking.maximumBookingWindowIntoTheFutureDate, product.maximumBookingWindowIntoTheFutureDate);
		await this.selectByValue(selector.vendor.vBooking.maximumBookingWindowIntoTheFutureDateUnit, product.maximumBookingWindowIntoTheFutureDateUnit);
		// costs
		await this.type(selector.vendor.vBooking.baseCost, product.baseCost);
		await this.type(selector.vendor.vBooking.blockCost, product.blockCost);
		await this.clickAndWaitForResponse(data.subUrls.frontend.vDashboard.productBooking, selector.vendor.vBooking.saveProduct, 302);
		await this.waitForVisibleLocator(selector.vendor.vBooking.productName);
		// const createdProduct = await this.getElementValue(selector.vendor.vBooking.productName);
		// expect(createdProduct.toLowerCase()).toBe(productName.toLowerCase());
	}

}
