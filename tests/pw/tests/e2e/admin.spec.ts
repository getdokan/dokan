import { test, Page } from '@playwright/test';
import { LoginPage } from 'pages/loginPage';
import { AdminPage } from 'pages/adminPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Admin user functionality test', () => {
	test.use({ storageState: { cookies: [], origins: [] } });

	let loginPage: LoginPage;
	let page: Page;

	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext();
		page = await context.newPage();
		loginPage = new LoginPage(page);
	});


	test.afterAll(async () => {
		await page.close();
	});


	test('admin can login @lite @pro', async ( ) => {
		await loginPage.adminLogin(data.admin);
	});

	// test('admin can logout @lite @pro', async ( ) => {
	// 	await loginPage.adminLogin(data.admin);
	// 	await loginPage.logoutBackend();
	// });

});


test.describe('Admin functionality test', () => {

	test.use({ storageState: data.auth.adminAuthFile });

	let adminPage: AdminPage;
	// let loginPage: LoginPage;
	let page: Page;


	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext({});
		page = await context.newPage();
		adminPage = new AdminPage(page);
		// loginPage = new LoginPage(page);
	});


	test.afterAll(async () => {
		await page.close();
	});


	// test('admin can add categories @lite @pro', async ( ) => {
	// 	await adminPage.addCategory(data.product.category.randomCategory());
	// });

	// test('admin can add attributes @lite @pro', async ( ) => {
	// 	await adminPage.addAttributes(data.product.attribute.randomAttribute());
	// });

	// settings

	// tax settings
	// test('admin can set standard tax rate', async ( ) => {
	//     await adminPage.addStandardTaxRate(data.tax)
	// })

	// shipping settings
	// test('admin can set flat rate shipping', async ( ) => {
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.flatRate);
	// });

	// test('admin can set free shipping', async ( ) => {
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.freeShipping)
	// })

	// test('admin can set local pickup shipping', async ( ) => {
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.localPickup)
	// })

	// test('admin can set table rate shipping', async ( ) => {
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.tableRateShipping)
	// })

	// test('admin can set distance rate shipping', async ( ) => {
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.distanceRateShipping)
	// })

	// test('admin can set vendor shipping', async ( ) => {
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.vendorShipping)
	// })

	// payment

	// test('admin can add basic payment methods', async ( ) => {
	//     await adminPage.setupBasicPaymentMethods(data.payment)
	// })

	// test('admin can add strip payment method', async ( ) => {
	//     await adminPage.setupStripeConnect(data.payment)
	// })

	// test('admin can add paypal marketplace payment method', async ( ) => {
	//     await adminPage.setupPaypalMarketPlace(data.payment)
	// })

	// test('admin can add mangopay payment method', async ( ) => {
	//     await adminPage.setupMangoPay(data.payment)
	// })

	// test('admin can add razorpay payment method', async ( ) => {
	//     await adminPage.setupRazorpay(data.payment)
	// })

	// test('admin can add strip express payment method', async ( ) => {
	//     await adminPage.setupStripeExpress(data.payment)
	// })

	test('dokan notice @lite @pro', async ( ) => {
		await adminPage.dokanNotice();
	});

	test('dokan promotion @lite @pro', async ( ) => {
		await adminPage.dokanPromotion();
	});

});
