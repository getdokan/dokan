import { test, Page } from '@playwright/test';
import { data } from '../../utils/testData';
import { LoginPage } from '../../pages/loginPage';
import { CustomerPage } from '../../pages/customerPage';

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

	test('customer can register', async () => {
		await customerPage.customerRegister(data.customer.customerInfo);
	});

	test('customer can login', async () => {
		await loginPage.login(data.customer);
	});

	test('customer can logout', async () => {
		await loginPage.login(data.customer);
		await loginPage.logout();
	});

	test('customer can become a vendor', async () => {
		await customerPage.customerRegister(data.customer.customerInfo);
		await customerPage.customerBecomeVendor(data.customer.customerInfo);
	});

	test('customer can become a wholesale customer', async () => {
		await customerPage.customerRegister(data.customer.customerInfo);
		await customerPage.customerBecomeWholesaleCustomer();
	});
});

test.describe('Customer functionality test', () => {

	test.use({ storageState: data.auth.customerAuthFile });

	let customerPage: CustomerPage;
	let page: Page;

	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext({});
		page = await context.newPage();
		customerPage = new CustomerPage(page);
	});

	test.afterAll(async () => {
		await page.close();
	});

	test('customer can add billing details', async ( ) => {
		await customerPage.addBillingAddress(data.customer.customerInfo);
	});

	test('customer can add shipping details', async ( ) => {
		await customerPage.addShippingAddress(data.customer.customerInfo);
	});

	test('customer can add customer details', async ( ) => {
		await customerPage.addCustomerDetails(data.customer.customerInfo);
	});


	test('customer can search product @product', async ( ) => {
		await customerPage.searchProduct(data.predefined.simpleProduct.product1.name);
	});

	test('customer can review product', async ( ) => {
		await customerPage.reviewProduct(data.predefined.simpleProduct.product1.name, data.product.review);
	});

	test('customer can report product', async ( ) => {
		await customerPage.reportProduct(data.predefined.simpleProduct.product1.name, data.product.report);
	});

	test('customer can enquire product', async ( ) => {
		await customerPage.enquireProduct(data.predefined.simpleProduct.product1.name, data.product.enquiry);
	});

	test.skip('customer can buy product', async ( ) => {
		await customerPage.clearCart();
		await customerPage.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
		await customerPage.placeOrder();
	});

	test('customer can add product to cart', async ( ) => {
		await customerPage.clearCart();
		await customerPage.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
		await customerPage.goToCartFromSingleProductPage();
	});

	test('customer can apply coupon', async ( ) => {
		await customerPage.clearCart();
		await customerPage.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
		await customerPage.goToCartFromSingleProductPage();
		await customerPage.applyCoupon(data.predefined.coupon.couponCode);
	});

	test('customer can search store', async ( ) => {
		await customerPage.searchStore(data.predefined.vendorStores.vendor1); //TODO: update parameter
	});

	test('customer can follow store @pro', async ( ) => {
		await customerPage.followStore(data.predefined.vendorStores.vendor1, data.predefined.vendorStores.followFromShopPage); //TODO: update parameter
	});

	test('customer can review store', async ( ) => {
		await customerPage.reviewStore(data.predefined.vendorStores.vendor1, data.store);
	});

	test('customer can ask for get support ', async ( ) => {
		await customerPage.askForGetSupport(data.predefined.vendorStores.vendor1, data.customer.customerInfo.getSupport);
	});

	test('customer can send message to support ticket', async ( ) => {
		await customerPage.askForGetSupport(data.predefined.vendorStores.vendor1, data.customer.customerInfo.getSupport);
		await customerPage.sendMessageCustomerSupportTicket(data.customer.supportTicket);
	});

});
