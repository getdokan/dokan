import { test, Page } from '@playwright/test';
import { BookingPage } from 'pages/vendorBookingPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Booking Product test', () => {


	let admin: BookingPage;
	let vendor: BookingPage;
	// let customer: BookingPage;
	let aPage: Page, vPage: Page;
	// let apiUtils: ApiUtils;
	const bookingProductName = data.product.booking.productName();
	const bookingResourceName = data.product.booking.resource.resourceName();


	test.beforeAll(async ({ browser }) => {

		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new BookingPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new BookingPage(vPage);

		// const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		// cPage = await customerContext.newPage();
		// customer = new BookingPage(cPage);

		await vendor.addBookingProduct({ ...data.product.booking, name: bookingProductName }); //todo: convert with api or db
		await vendor.addBookingResource(bookingResourceName);
		// apiUtils = new ApiUtils(request);

	});


	test.afterAll(async () => {
		await aPage.close();
		await vPage.close();
		// await cPage.close();
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
		await vendor.editBookingProduct({ ...data.product.booking, name: bookingProductName });
	});

	test('vendor can filter booking products by date @lite', async ( ) => {
		await vendor.filterBookingProducts('by-date', '1');
	});

	test('vendor can filter booking products by category @lite', async ( ) => {
		await vendor.filterBookingProducts('by-category', 'Uncategorized');
	});

	test('vendor can filter booking products by other @pro', async ( ) => {
		await vendor.filterBookingProducts('by-other', 'featured');
	});

	test('vendor can view booking product @pro', async ( ) => {
		await vendor.viewBookingProduct(bookingProductName);
	});

	test('vendor can\'t buy own booking product @pro', async ( ) => {
		await vendor.cantBuyOwnBookingProduct(bookingProductName);
	});

	test('vendor can search booking product @pro', async ( ) => {
		await vendor.searchBookingProduct(bookingProductName);
	});

	test('vendor can duplicate booking product @pro', async ( ) => {
		await vendor.duplicateBookingProduct(bookingProductName);
	});

	test('vendor can permanently delete booking product @pro', async ( ) => {
		const bookingProductName = data.product.booking.productName();
		await vendor.addBookingProduct({ ...data.product.booking, name: bookingProductName });
		await vendor.deleteBookingProduct(bookingProductName);
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

	//todo: add customer tests

});