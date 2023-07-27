import { test, Page } from '@playwright/test';
import { LoginPage } from 'pages/loginPage';
import { CustomerPage } from 'pages/customerPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';

test.describe('Customer user functionality test', () => {

	test.use({ storageState: { cookies: [], origins: [] } });

	let loginPage: LoginPage;
	let customerPage: CustomerPage;
	let page: Page;


	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext();
		page = await context.newPage();
		loginPage = new LoginPage(page);
		customerPage = new CustomerPage(page);
	});


	test.afterAll(async () => {
		await page.close();
	});


	test('customer can register @lite @pro', async () => {
		await customerPage.customerRegister(data.customer.customerInfo);
	});

	test('customer can login @lite @pro', async () => {
		await loginPage.login(data.customer);
	});

	test('customer can logout @lite @pro', async () => {
		await loginPage.login(data.customer);
		await loginPage.logout();
	});

	test('customer can become a vendor @lite @pro', async () => {
		await customerPage.customerRegister(data.customer.customerInfo);
		await customerPage.customerBecomeVendor(data.customer.customerInfo);
	});

});


test.describe('Customer functionality test', () => {


	let customerPage: CustomerPage;
	let cPage: Page;
	// let apiUtils: ApiUtils;

	test.beforeAll(async ({ browser,  }) => {
		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		const page = await customerContext.newPage();
		customerPage = new CustomerPage(page);
		// apiUtils = new ApiUtils(request);
	});

	test.afterAll(async () => {
		await cPage.close();
	});

	test('customer can add billing details @lite @pro', async ( ) => {
		await customerPage.addBillingAddress(data.customer.customerInfo);
	});

	test('customer can add shipping details @lite @pro', async ( ) => {
		await customerPage.addShippingAddress(data.customer.customerInfo);
	});

	test('customer can add customer details @lite @pro', async ( ) => {
		await customerPage.addCustomerDetails(data.customer.customerInfo);
	});

	test('customer can buy product @lite @pro', async ( ) => {
		await customerPage.clearCart();
		await customerPage.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
		await customerPage.placeOrder();
	});

	test('customer can add product to cart @lite @pro', async ( ) => {
		await customerPage.clearCart();
		await customerPage.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
		await customerPage.goToCartFromSingleProductPage();
	});

	test('customer can apply coupon @pro', async ( ) => {
		await customerPage.clearCart();
		await customerPage.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
		await customerPage.goToCartFromSingleProductPage();
		await customerPage.applyCoupon(data.predefined.coupon.couponCode);
	});


	// TODO:

	// test('customer can download downloadables @lite @pro', async ( ) => {
	// 	// pre: complete download product
	// });


});
