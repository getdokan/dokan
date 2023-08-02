import { test, Page } from '@playwright/test';
import { BookingPage } from 'pages/vendorBookingPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';
// import { faker } from '@faker-js/faker';


test.describe('Auction Product test', () => {


	let admin: BookingPage;
	let vendor: BookingPage;
	let aPage: Page, vPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser }) => {

		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new BookingPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new BookingPage(vPage);


		// apiUtils = new ApiUtils(request);

	});


	test.afterAll(async () => {
		await aPage.close();
		await vPage.close();
	});


	test('admin can add booking product @pro', async ( ) => {
		await admin.adminAddBookingProduct(data.product.booking);
	});

	test.skip('vendor booking menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorBookingRenderProperly();
	});

	test('vendor can add booking product @pro', async ( ) => {
		await vendor.addBookingProduct(data.product.booking);
	});

});