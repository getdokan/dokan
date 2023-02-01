import { test } from '@playwright/test';
import { data } from '../utils/testData';
import { LoginPage } from '../pages/loginPage';
import { AdminPage } from '../pages/adminPage';

// test.afterAll(async ({ }) => { });
// test.beforeEach(async ({ }) => { });
// test.afterEach(async ({ }) => { });

test( 'admin can login', async ( { page } ) => {
	const loginPage = new LoginPage( page );
	await loginPage.adminLogin( data.admin );
} );

test( 'admin can logout', async ( { page } ) => {
	const loginPage = new LoginPage( page );
	await loginPage.adminLogin( data.admin );
	await loginPage.adminLogout();
} );

test.describe( 'Admin functionality test', () => {
	test.use( { storageState: 'adminStorageState.json' } );

	let adminPage: any;

	test.beforeAll( async ( { browser } ) => {
		const admin = await browser.newPage();
		adminPage = new AdminPage( admin );
	} );

	test( 'admin can set dokan setup wizard', async ( { } ) => { //todo:fix it
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanSetupWizard( data.dokanSetupWizard );
	} );

	test( 'admin can add vendor', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.addVendor( data.vendor.vendorInfo );
	} );

	test( 'admin can add simple product', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.addSimpleProduct( data.product.simple );
	} );

	// test.only('admin can add variable product', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.addVariableProduct(data.product.variable)
	// })

	test( 'admin can add simple subscription ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.addSimpleSubscription( data.product.simpleSubscription );
	} );

	test.skip( 'admin can add variable subscription ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.addVariableSubscription( data.product.variableSubscription );
	} );

	test( 'admin can add external product', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.addExternalProduct( data.product.external );
	} );

	test( 'admin can add vendor subscription ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.addDokanSubscription( data.product.vendorSubscription );
	} );

	test( 'admin can add auction product', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.addAuctionProduct( data.product.auction );
	} );

	test( 'admin can add booking product', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.addBookingProduct( data.product.booking );
	} );

	test( 'admin can add categories', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)s
		// await loginPage.adminLogin(data.admin)
		await adminPage.addCategory( data.product.category.randomCategory() );
	} );

	test( 'admin can add attributes', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.addAttributes( data.product.attribute.randomAttribute() );
	} );

	// settings

	// // tax settings
	// test.skip('admin can set standard tax rate', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.addStandardTaxRate(data.tax)
	// })

	// shipping settings
	// test('admin can set flat rate shipping', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.flatRate)
	// })

	// test('admin can set free shipping', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.freeShipping)
	// })

	// test('admin can set local pickup shipping', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.localPickup)
	// })

	// test('admin can set table rate shipping', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.tableRateShipping)
	// })

	// test('admin can set distance rate shipping', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.distanceRateShipping)
	// })

	// test('admin can set vendor shipping', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.addShippingMethod(data.shipping.shippingMethods.vendorShipping)
	// })

	// payment

	// test.only('admin can add basic payment methods', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.setupBasicPaymentMethods(data.payment)
	// })

	// test.only('admin can add strip payment method', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.setupStripeConnect(data.payment)
	// })

	// test.only('admin can add paypal marketplace payment method', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.setupPaypalMarketPlace(data.payment)
	// })

	// test.only('admin can add mangopay payment method', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.setupMangoPay(data.payment)
	// })

	// test.only('admin can add razorpay payment method', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.setupRazorpay(data.payment)
	// })

	// test.only('admin can add strip express payment method', async ({ }) => {
	//     // const loginPage = new LoginPage(page)
	//     // const adminPage = new AdminPage(page)
	//     // await loginPage.adminLogin(data.admin)
	//     await adminPage.setupStripeExpress(data.payment)
	// })

	// dokan settings

	test( 'admin can set dokan general settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanGeneralSettings( data.dokanSettings.general );
	} );

	test( 'admin can set dokan selling settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanSellingSettings( data.dokanSettings.selling );
	} );

	test( 'admin can set dokan withdraw settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanWithdrawSettings( data.dokanSettings.withdraw );
	} );

	test( 'admin can set dokan page settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setPageSettings( data.dokanSettings.page );
	} );

	test( 'admin can set dokan appearance settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanAppearanceSettings( data.dokanSettings.appearance );
	} );

	test( 'admin can set dokan privacy policy settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanPrivacyPolicySettings( data.dokanSettings.privacyPolicy );
	} );

	test( 'admin can set dokan store support settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanStoreSupportSettings( data.dokanSettings.storeSupport );
	} );

	test( 'admin can set dokan rma settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanRmaSettings( data.dokanSettings.rma );
	} );

	test( 'admin can set dokan wholesale settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanWholesaleSettings( data.dokanSettings.wholesale );
	} );

	test( 'admin can set dokan eu compliance settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanEuComplianceSettings( data.dokanSettings.euCompliance );
	} );

	test.skip( 'admin can set dokan delivery time settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanDeliveryTimeSettings( data.dokanSettings.deliveryTime ); //TODO: need to fix
	} );

	test( 'admin can set dokan product advertising settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanProductAdvertisingSettings( data.dokanSettings.productAdvertising );
	} );

	test( 'admin can set dokan geolocation settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanGeolocationSettings( data.dokanSettings.geolocation );
	} );

	test( 'admin can set dokan product report abuse settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanProductReportAbuseSettings( data.dokanSettings.productReportAbuse );
	} );

	test( 'admin can set dokan spmv settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanSpmvSettings( data.dokanSettings.spmv );
	} );

	test( 'admin can set dokan vendor subscription settings', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const adminPage = new AdminPage(page)
		// await loginPage.adminLogin(data.admin)
		await adminPage.setDokanVendorSubscriptionSettings( data.dokanSettings.vendorSubscription );
	} );
} );
