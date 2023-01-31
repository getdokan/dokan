// import { test, expect, type Page } from '@playwright/test';
// import { data } from '../utils/testData';
// import { LoginPage } from '../pages/loginPage';
// import { AdminPage } from '../pages/adminPage';
// import { CustomerPage } from '../pages/customerPage';
// import { VendorPage } from '../pages/vendorPage';

// // test.beforeAll(async ({ }) => { });
// // test.afterAll(async ({ }) => { });
// // test.beforeEach(async ({ }) => { });
// // test.afterEach(async ({ }) => { });

// test.describe( 'setup test', () => {
// 	test.skip( 'admin check Active plugins ', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.checkActivePlugins( data.plugin );
// 	} );

// 	test( 'admin set WpSettings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setWpSettings( data.wpSettings );
// 	} );

// 	test( 'admin enable register password field', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.enablePasswordInputField( data.woocommerce );
// 	} );

// 	test( 'admin set tax rate', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.addStandardTaxRate( data.tax );
// 	} );

// 	test( 'admin set currency options', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setCurrencyOptions( data.payment.currency );
// 	} );

// 	test( 'admin set flat rate shipping', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.addShippingMethod( data.shipping.shippingMethods.flatRate );
// 	} );

// 	test( 'admin set table rate shipping', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.addShippingMethod( data.shipping.shippingMethods.tableRateShipping );
// 	} );

// 	test( 'admin set distance rate shipping', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.addShippingMethod( data.shipping.shippingMethods.distanceRateShipping );
// 	} );

// 	test( 'admin set vendor shipping', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.addShippingMethod( data.shipping.shippingMethods.vendorShipping );
// 	} );

// 	test( 'admin set basic payments', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setupBasicPaymentMethods( data.payment );
// 	} );

// 	test( 'admin add categories and attributes', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		// add product categories
// 		await adminPage.addCategory( data.product.category.clothings );
// 		// add product attributes
// 		await adminPage.addAttributes( data.product.attribute.size );
// 	} );

// 	test( 'admin add dokan subscription', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.addDokanSubscription( { ...data.product.vendorSubscription, ...data.predefined.vendorSubscription.nonRecurring } );
// 	} );

// 	test( 'admin set dokan general settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanGeneralSettings( data.dokanSettings.general );
// 	} );

// 	test( 'admin set dokan selling settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanSellingSettings( data.dokanSettings.selling );
// 	} );

// 	test( 'admin set dokan withdraw settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanWithdrawSettings( data.dokanSettings.withdraw );
// 	} );

// 	test( 'admin set dokan page settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setPageSettings( data.dokanSettings.page );
// 	} );

// 	test( 'admin set dokan appearance settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanAppearanceSettings( data.dokanSettings.appreance );
// 	} );

// 	test( 'admin set dokan privacy policy settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanPrivacyPolicySettings( data.dokanSettings.privacyPolicy );
// 	} );

// 	test( 'admin set dokan store support settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanStoreSupportSettings( data.dokanSettings.storeSupport );
// 	} );

// 	test( 'admin set dokan rma settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanRmaSettings( data.dokanSettings.rma );
// 	} );

// 	test( 'admin set dokan wholesale settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanWholesaleSettings( data.dokanSettings.wholesale );
// 	} );

// 	test( 'admin set dokan eu compliance settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanEuComplianceSettings( data.dokanSettings.euCompliance );
// 	} );

// 	test( 'admin set dokan delivery time settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanDeliveryTimeSettings( data.dokanSettings.deliveryTime );
// 	} );

// 	test( 'admin set dokan product advertising settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanProductAdvertisingSettings( data.dokanSettings.productAdvertising );
// 	} );

// 	test( 'admin set dokan geolocation settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanGeolocationSettings( data.dokanSettings.geolocation );
// 	} );

// 	test( 'admin set dokan product report abuse settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanProductReportAbuseSettings( data.dokanSettings.productReportAbuse );
// 	} );

// 	test( 'admin set dokan spmv settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanSpmvSettings( data.dokanSettings.spmv );
// 	} );

// 	test( 'admin set dokan vendor subscription settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.adminLogin( data.admin );
// 		await adminPage.setDokanVendorSubscriptionSettings( data.dokanSettings.vendorSubscription );
// 	} );

// 	// Vendor Details

// 	test( 'add test vendor1', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const vendorPage = new VendorPage( page );
// 		// Add Vendor1
// 		await vendorPage.vendorRegister( { ...data.vendor.vendorInfo, ...data.predefined.vendorInfo }, data.vendorSetupWizard );
// 	} );

// 	test( 'add test vendor1 products', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const vendorPage = new VendorPage( page );
// 		await loginPage.login( data.vendor );
// 		// Add Products
// 		await vendorPage.addSimpleProduct( { ...data.product.simple, ...data.predefined.simpleProduct.product1 } );
// 	} );

// 	test( 'add test vendor1 coupons', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const vendorPage = new VendorPage( page );
// 		await loginPage.login( data.vendor );
// 		// Add Coupons
// 		await vendorPage.addCoupon( { ...data.coupon, ...data.predefined.coupon.coupon1 } );
// 	} );

// 	test( 'add test vendor1 address', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const vendorPage = new VendorPage( page );
// 		await loginPage.login( data.vendor );
// 		await vendorPage.setStoreAddress( data.vendor.vendorInfo );
// 	} );

// 	test( 'add test vendor1 rma settings', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const vendorPage = new VendorPage( page );
// 		await loginPage.login( data.vendor );
// 		await vendorPage.setRmaSettings( data.vendor.rma );
// 	} );

// 	test( 'admin add test vendor products ', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const adminPage = new AdminPage( page );
// 		await loginPage.switchUser( data.admin );
// 		await adminPage.addSimpleProduct( { ...data.product.simple, status: 'publish', stockStatus: false } );
// 		await adminPage.addSimpleProduct( { ...data.product.simple, status: 'draft', stockStatus: false } );
// 		await adminPage.addSimpleProduct( { ...data.product.simple, status: 'pending', stockStatus: false } );
// 		await adminPage.addSimpleProduct( { ...data.product.simple, status: 'publish', stockStatus: true } );
// 	} );

// 	// Customer Details

// 	test( 'add test customer1', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const customerPage = new CustomerPage( page );
// 		await customerPage.customerRegister( { ...data.customer.customerInfo, ...data.predefined.customerInfo } );
// 	} );

// 	test( 'add test customer1 addresses', async ( { page } ) => {
// 		const loginPage = new LoginPage( page );
// 		const customerPage = new CustomerPage( page );
// 		await loginPage.login( data.customer );
// 		await customerPage.addBillingAddress( { ...data.customer.customerInfo, ...data.predefined.customerInfo } );
// 		await customerPage.addShippingAddress( { ...data.customer.customerInfo, ...data.predefined.customerInfo } );
// 		await loginPage.logout();
// 	} );
// } );
