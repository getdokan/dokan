import { test, expect, type Page } from '@playwright/test';
import { data } from '../utils/testData';
import { LoginPage } from '../pages/loginPage';
import { AdminPage } from '../pages/adminPage';
import { CustomerPage } from '../pages/customerPage';
import { VendorPage } from '../pages/vendorPage';

// test.afterAll(async ({ }) => { })
// test.beforeEach(async ({ }) => { })
// test.afterEach(async ({ }) => { })

// test('vendor can register', async ({ page }) => {
//     const loginPage = new LoginPage(page)
//     // const vendorPage = new VendorPage(page)
//     await vendorPage.vendorRegister(data.vendor.vendorInfo, data.vendorSetupWizard)
//     await loginPage.logout()
// })

// test('vendor can login', async ({ page }) => {
//     const loginPage = new LoginPage(page)
//     // const vendorPage = new VendorPage(page)
//     // await loginPage.login(data.vendor)
// })

// test('vendor can logout', async ({ page }) => {
//     const loginPage = new LoginPage(page)
//     // const vendorPage = new VendorPage(page)
//     // await loginPage.login(data.vendor)
//     await loginPage.logout()
// })

test.describe( 'Vendor functionality test', () => {
	// test.use({ storageState: 'vendorStorageState.json' })

	let loginPage: any;
	let vendorPage: any;
	let page: any;

	test.beforeAll( async ( { browser } ) => {
		page = await browser.newPage();
		loginPage = new LoginPage( page );
		vendorPage = new VendorPage( page );
	} );

	test( 'vendor can add simple product @product', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// // await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.addSimpleProduct( data.product.simple );
	} );

	test.fixme( 'vendor can add variable product', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.addVariableProduct( data.product.variable );
	} );

	test( 'vendor can add simple subscription product', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.addSimpleSubscription( data.product.simpleSubscription );
	} );

	test.skip( 'vendor can add variable subscription product', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.addVariableSubscription( data.product.variableSubscription );
	} );

	test( 'vendor can add external product', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.addExternalProduct( data.product.external );
	} );

	test.fixme( 'vendor can add auction product', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.addAuctionProduct( data.product.auction );
	} );

	test( 'vendor can add booking product', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.addBookingProduct( data.product.booking );
	} );

	test( 'vendor can add coupon', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.addCoupon( data.coupon );
	} );

	test.skip( 'vendor can request withdraw', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.requestWithdraw( data.vendor.withdraw );
	} );

	test.skip( 'vendor can cancel request withdraw', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.requestWithdraw( data.vendor.withdraw );
		await vendorPage.cancelRequestWithdraw();
	} );

	test( 'vendor can add auto withdraw disbursement schedule', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.addAutoWithdrawDisbursementSchedule( data.vendor.withdraw );
	} );

	test.skip( 'vendor can add default withdraw payment methods ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.addDefaultWithdrawPaymentMethods( data.vendor.withdraw.defaultWithdrawMethod.skrill );
		// Cleanup
		await vendorPage.addDefaultWithdrawPaymentMethods( data.vendor.withdraw.defaultWithdrawMethod.paypal );
	} );

	// vendor settings

	test.skip( 'vendor can set store settings ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.setStoreSettings( data.vendor.vendorInfo );
	} );

	test( 'vendor can add addons', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		await vendorPage.addAddon( data.vendor.addon );
	} );

	test.skip( 'vendor can edit addon', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// await loginPage.login(data.vendor)
		// await loginPage.login(data.vendor)
		const addonName = await vendorPage.addAddon( data.vendor.addon );
		await vendorPage.editAddon( data.vendor.addon, addonName );
	} );

	test.skip( 'vendor can send id verification request ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const vendorPage = new VendorPage(page)
		// await loginPage.login(data.vendor)
		await vendorPage.sendIdVerificationRequest( data.vendor.verification );
	} );

	test.skip( 'vendor can send address verification request ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const vendorPage = new VendorPage(page)
		// await loginPage.login(data.vendor)
		await vendorPage.sendAddressVerificationRequest( data.vendor.verification );
	} );

	test.skip( 'vendor can send company verification request ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const vendorPage = new VendorPage(page)
		// await loginPage.login(data.vendor)
		await vendorPage.sendCompanyVerificationRequest( data.vendor.verification );
	} );

	test.fixme( 'vendor can set delivery time settings ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const vendorPage = new VendorPage(page)
		// await loginPage.login(data.vendor)
		await vendorPage.setDeliveryTimeSettings( data.vendor.deliveryTime );
	} );

	test.skip( 'vendor can set shipping policy', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const vendorPage = new VendorPage(page)
		// await loginPage.login(data.vendor)
		await vendorPage.setShippingPolicies( data.vendor.shipping.shippingPolicy );
	} );

	test.skip( 'vendor can set flat rate shipping ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const vendorPage = new VendorPage(page)
		// await loginPage.login(data.vendor)
		await vendorPage.setShippingSettings( data.vendor.shipping.shippingMethods.flatRate );
	} );

	test.skip( 'vendor can set free shipping ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const vendorPage = new VendorPage(page)
		// await loginPage.login(data.vendor)
		await vendorPage.setShippingSettings( data.vendor.shipping.shippingMethods.freeShipping );
	} );

	test.skip( 'vendor can set local pickup shipping ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const vendorPage = new VendorPage(page)
		// await loginPage.login(data.vendor)
		await vendorPage.setShippingSettings( data.vendor.shipping.shippingMethods.localPickup );
	} );

	test.skip( 'vendor can set table rate shipping shipping ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const vendorPage = new VendorPage(page)
		// await loginPage.login(data.vendor)
		await vendorPage.setShippingSettings( data.vendor.shipping.shippingMethods.tableRateShipping );
	} );

	test.skip( 'vendor can set dokan distance rate shipping ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const vendorPage = new VendorPage(page)
		// await loginPage.login(data.vendor)
		await vendorPage.setShippingSettings( data.vendor.shipping.shippingMethods.distanceRateShipping );
	} );

	test.skip( 'vendor can set social profile settings ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const vendorPage = new VendorPage(page)
		// await loginPage.login(data.vendor)
		await vendorPage.setSocialProfile( data.urls );
	} );

	test.skip( 'vendor can set rma settings ', async ( { } ) => {
		// const loginPage = new LoginPage(page)
		// const vendorPage = new VendorPage(page)
		// await loginPage.login(data.vendor)
		await vendorPage.setRmaSettings( data.vendor.rma );
	} );
} );
