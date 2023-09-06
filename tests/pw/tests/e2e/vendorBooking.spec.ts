import { test, Page } from '@playwright/test';
import { BookingPage } from 'pages/vendorBookingPage';
import { ApiUtils } from 'utils/apiUtils';
import { payloads } from 'utils/payloads';
import { data } from 'utils/testData';


test.describe('Booking Product test', () => {


	let admin: BookingPage;
	let vendor: BookingPage;
	let customer: BookingPage;
	let aPage: Page, vPage: Page, cPage: Page;
	let apiUtils: ApiUtils;
	let bookableProductName: string;
	const bookingResourceName = data.product.booking.resource.resourceName();


	test.beforeAll(async ({ browser, request }) => {

		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new BookingPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new BookingPage(vPage);

		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		cPage = await customerContext.newPage();
		customer = new BookingPage(cPage);

		apiUtils = new ApiUtils(request);
		[,, bookableProductName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);

		await vendor.addBookingResource(bookingResourceName); //todo: convert with api or db

	});


	test.afterAll(async () => {
		await aPage.close();
		await vPage.close();
		await cPage.close();
	});

	test('admin can add booking product @pro', async ( ) => {
		await admin.adminAddBookingProduct(data.product.booking);
	});

	test('vendor booking menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorBookingRenderProperly();
	});

	test('vendor manage booking page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorManageBookingRenderProperly();
	});

	test('vendor booking calendar page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorBookingCalendarRenderProperly();
	});

	test('vendor manage booking resource page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorManageResourcesRenderProperly();
	});

	test('vendor can add booking product @pro', async ( ) => {
		await vendor.addBookingProduct({ ...data.product.booking, name: data.product.booking.productName() });
	});

	test('vendor can edit booking product @pro', async ( ) => {
		await vendor.editBookingProduct({ ...data.product.booking, name: bookableProductName });
	});

	test('vendor can filter booking products by date @pro', async ( ) => {
		await vendor.filterBookingProducts('by-date', '1');
	});

	test('vendor can filter booking products by category @pro', async ( ) => {
		await vendor.filterBookingProducts('by-category', 'Uncategorized');
	});

	test('vendor can filter booking products by other @pro', async ( ) => {
		await vendor.filterBookingProducts('by-other', 'featured');
	});

	test('vendor can view booking product @pro', async ( ) => {
		await vendor.viewBookingProduct(bookableProductName);
	});

	test('vendor can\'t buy own booking product @pro', async ( ) => {
		await vendor.cantBuyOwnBookingProduct(bookableProductName);
	});

	test('vendor can search booking product @pro', async ( ) => {
		await vendor.searchBookingProduct(bookableProductName);
	});

	test('vendor can duplicate booking product @pro', async ( ) => {
		await vendor.duplicateBookingProduct(bookableProductName);
	});

	test('vendor can permanently delete booking product @pro', async ( ) => {
		const [,, bookableProductName] = await apiUtils.createBookableProduct(payloads.createBookableProduct(), payloads.vendorAuth);
		await vendor.deleteBookingProduct(bookableProductName);
	});

	test('vendor can add booking resource @pro', async ( ) => {
		await vendor.addBookingResource(data.product.booking.resource.resourceName());
	});

	test('vendor can edit booking resource @pro', async ( ) => {
		await vendor.editBookingResource({ ...data.product.booking.resource, name: bookingResourceName });
	});

	test('vendor can delete booking resource @pro', async ( ) => {
		const bookingResourceName = data.product.booking.resource.resourceName();
		await vendor.addBookingResource(bookingResourceName);
		await vendor.deleteBookingResource(bookingResourceName);
	});

	test('vendor can add booking for guest customer @pro', async ( ) => {
		await vendor.addBooking(bookableProductName, data.bookings);
	});

	test('vendor can add booking for existing customer @pro', async ( ) => {
		await vendor.addBooking(bookableProductName, data.bookings, data.customer.username);
	});

	test('customer can buy bookable product @pro', async ( ) => {
		await customer.buyBookableProduct(bookableProductName, data.bookings);
	});

	//todo: vendor can add booking resource to booking product
});