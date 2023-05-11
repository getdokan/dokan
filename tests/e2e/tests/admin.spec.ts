import { test, Page } from '@playwright/test';
import { data } from '../utils/testData';
import { LoginPage } from '../pages/loginPage';
import { AdminPage } from '../pages/adminPage';

test.describe('Admin user functionality test', ()=> {
	test.use({ storageState: { cookies: [], origins: [] } });

	let loginPage: LoginPage;
	let page: Page;

	test.beforeAll(async ({ browser })=> {
		const context = await browser.newContext();
		page = await context.newPage();
		loginPage = new LoginPage(page);
	});

	test.afterAll(async ()=> {
		await page.close();
	});

	//
	test('admin can login @lite @pro', async ( )=> {
		await loginPage.adminLogin(data.admin);
	});

	test('admin can logout @lite @pro', async ( )=> {
		await loginPage.adminLogin(data.admin);
		await loginPage.logoutBackend();
	});

});

test.describe('Admin functionality test', ()=> {

	test.use({ storageState: data.auth.adminAuthFile });

	let adminPage: AdminPage;
	let page: Page;

	test.beforeAll(async ({ browser })=> {
		const context = await browser.newContext({});
		page = await context.newPage();
		adminPage = new AdminPage(page);
	});

	test.afterAll(async ( )=> {
		await page.close();
	});

	test('admin can set dokan setup wizard @lite @pro', async ( )=> {
		await adminPage.setDokanSetupWizard(data.dokanSetupWizard);
	});

	test('admin can add vendor @lite @pro', async ( )=> {
		await adminPage.addVendor(data.vendor.vendorInfo);
	});

	test('admin can add simple product @lite @pro', async ( )=> {
		await adminPage.addSimpleProduct(data.product.simple);
	});

	// test.skip('admin can add variable product @pro', async ( )=> {
	// 	await adminPage.addVariableProduct(data.product.variable);
	// });

	test('admin can add simple subscription  @pro', async ( )=> {
		await adminPage.addSimpleSubscription(data.product.simpleSubscription);
	});

	// test.skip('admin can add variable subscription @pro', async ( )=> {
	// 	await adminPage.addVariableSubscription(data.product.variableSubscription);
	// });

	test('admin can add external product @lite @pro', async ( )=> {
		await adminPage.addExternalProduct(data.product.external);
	});

	test('admin can add vendor subscription @pro', async ( )=> {
		await adminPage.addDokanSubscription(data.product.vendorSubscription);
	});

	test('admin can add auction product  @pro', async ( )=> {
		await adminPage.addAuctionProduct(data.product.auction);
	});

	test('admin can add booking product  @pro', async ( )=> {
		await adminPage.addBookingProduct(data.product.booking);
	});

	test('admin can add categories @lite @pro', async ( )=> {
		await adminPage.addCategory(data.product.category.randomCategory());
	});

	test('admin can add attributes @lite @pro', async ( )=> {
		await adminPage.addAttributes(data.product.attribute.randomAttribute());
	});

	// settings

	// tax settings
	// test.skip('admin can set standard tax rate', async ( ) => {
	//     await adminPage.addStandardTaxRate(data.tax)
	// })

	// shipping settings
	// test('admin can set flat rate shipping', async ( ) => {
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.flatRate)
	// })

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

	// test.only('admin can add basic payment methods', async ( ) => {
	//     await adminPage.setupBasicPaymentMethods(data.payment)
	// })

	// test.only('admin can add strip payment method', async ( ) => {
	//     await adminPage.setupStripeConnect(data.payment)
	// })

	// test.only('admin can add paypal marketplace payment method', async ( ) => {
	//     await adminPage.setupPaypalMarketPlace(data.payment)
	// })

	// test.only('admin can add mangopay payment method', async ( ) => {
	//     await adminPage.setupMangoPay(data.payment)
	// })

	// test.only('admin can add razorpay payment method', async ( ) => {
	//     await adminPage.setupRazorpay(data.payment)
	// })

	// test.only('admin can add strip express payment method', async ( ) => {
	//     await adminPage.setupStripeExpress(data.payment)
	// })

	// dokan settings

	test('admin can set dokan general settings @lite @pro', async ( )=> {
		await adminPage.setDokanGeneralSettings(data.dokanSettings.general);
	});

	test('admin can set dokan selling settings @lite @pro', async ( )=> {
		await adminPage.setDokanSellingSettings(data.dokanSettings.selling);
	});

	test('admin can set dokan withdraw settings @lite @pro', async ( )=> {
		await adminPage.setDokanWithdrawSettings(data.dokanSettings.withdraw);
	});

	test('admin can set dokan reverse withdraw settings @lite @pro', async ( )=> {
		await adminPage.setDokanReverseWithdrawSettings(data.dokanSettings.reverseWithdraw);
	});

	test('admin can set dokan page settings @lite @pro', async ( )=> {
		await adminPage.setPageSettings(data.dokanSettings.page);
	});

	test('admin can set dokan appearance settings @lite @pro', async ( )=> {
		await adminPage.setDokanAppearanceSettings(data.dokanSettings.appearance);
	});

	test('admin can set dokan privacy policy settings @lite @pro', async ( )=> {
		await adminPage.setDokanPrivacyPolicySettings(data.dokanSettings.privacyPolicy);
	});

	test('admin can set dokan store support settings @pro', async ( )=> {
		await adminPage.setDokanStoreSupportSettings(data.dokanSettings.storeSupport);
	});

	test('admin can set dokan rma settings @pro', async ( )=> {
		await adminPage.setDokanRmaSettings(data.dokanSettings.rma);
	});

	test('admin can set dokan wholesale settings @pro', async ( )=> {
		await adminPage.setDokanWholesaleSettings(data.dokanSettings.wholesale);
	});

	test('admin can set dokan eu compliance settings @pro', async ( )=> {
		await adminPage.setDokanEuComplianceSettings(data.dokanSettings.euCompliance);
	});

	test.skip('admin can set dokan delivery time settings @pro', async ( )=> {
		await adminPage.setDokanDeliveryTimeSettings(data.dokanSettings.deliveryTime);
	});

	test('admin can set dokan product advertising settings @pro', async ( )=> {
		await adminPage.setDokanProductAdvertisingSettings(data.dokanSettings.productAdvertising);
	});

	test('admin can set dokan geolocation settings @pro', async ( )=> {
		await adminPage.setDokanGeolocationSettings(data.dokanSettings.geolocation);
	});

	test('admin can set dokan product report abuse settings @pro', async ( )=> {
		await adminPage.setDokanProductReportAbuseSettings(data.dokanSettings.productReportAbuse);
	});

	test('admin can set dokan spmv settings @pro', async ( )=> {
		await adminPage.setDokanSpmvSettings(data.dokanSettings.spmv);
	});

	test.skip('admin can set dokan vendor subscription settings @pro', async ( )=> {
		await adminPage.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription);
	});

});
