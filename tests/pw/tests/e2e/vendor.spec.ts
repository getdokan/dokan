import { test, Page } from '@playwright/test';
import { LoginPage } from 'pages/loginPage';
import { VendorPage } from 'pages/vendorPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Vendor user functionality test1', () => {

	test.use({ storageState: { cookies: [], origins: [] } });

	let loginPage: LoginPage;
	let vendorPage: VendorPage;
	let page: Page;


	test.beforeAll(async ({ browser }) => {
		const context = await browser.newContext();
		page = await context.newPage();
		loginPage = new LoginPage(page);
		vendorPage = new VendorPage(page);
	});


	test.afterAll(async () => {
		await page.close();
	});


	test('vendor can register @lite @pro', async ( ) => {
		await vendorPage.vendorRegister(data.vendor.vendorInfo, { ...data.vendorSetupWizard, choice:false });
	});

	test('vendor can login @lite @pro', async ( ) => {
		await loginPage.login(data.vendor);
	});

	test('vendor can logout @lite @pro', async ( ) => {
		await loginPage.login(data.vendor);
		await loginPage.logout();
	});

});


test.describe('Vendor functionality test', () => {


	let vendorPage: VendorPage;
	let vPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser,  }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendorPage = new VendorPage(vPage);
		// apiUtils = new ApiUtils(request);
	});


	test.afterAll(async () => {
		await vPage.close();
	});


	test('vendor can setup setup-wizard @lite @pro', async ( ) => {
		await vendorPage.vendorSetupWizard(data.vendorSetupWizard);
	});

	test('vendor can add simple product @lite @pro', async ( ) => {
		await vendorPage.addSimpleProduct(data.product.simple);
	});

	// test.skip('vendor can add variable product @pro', async ( ) => {
	// 	await vendorPage.addVariableProduct(data.product.variable);
	// });

	test('vendor can add simple subscription product @pro', async ( ) => {
		await vendorPage.addSimpleSubscription(data.product.simpleSubscription);
	});

	// test.skip('vendor can add variable subscription product @pro', async ( ) => {
	// 	await vendorPage.addVariableSubscription(data.product.variableSubscription);
	// });

	test('vendor can add external product @pro', async ( ) => {
		await vendorPage.addExternalProduct(data.product.external);
	});

	test('vendor can add auction product @pro', async ( ) => {
		await vendorPage.addAuctionProduct(data.product.auction);
	});

	test('vendor can add booking product @pro', async ( ) => {
		await vendorPage.addBookingProduct(data.product.booking);
	});

	test('vendor update account details @lite @pro', async ( ) => {
		await vendorPage.setVendorDetails(data.vendor.vendorInfo);
	});

	// store settings
	test('vendor can set store settings @lite @pro', async ( ) => {
		await vendorPage.setStoreSettings(data.vendor.vendorInfo);
	});

	test('vendor can add addons @pro', async ( ) => {
		await vendorPage.addAddon(data.vendor.addon);
	});

	test.skip('vendor can edit addon @pro', async ( ) => {
		const addonName = await vendorPage.addAddon(data.vendor.addon);
		await vendorPage.editAddon(data.vendor.addon, addonName);
	});

	// test.skip('vendor can send id verification request @pro', async ( )=> {
	// 	await vendorPage.sendIdVerificationRequest(data.vendor.verification);
	// });

	// test.skip('vendor can send address verification request @pro', async ( )=> {
	// 	await vendorPage.sendAddressVerificationRequest(data.vendor.verification);
	// });

	// test.skip('vendor can send company verification request @pro', async ( )=> {
	// 	await vendorPage.sendCompanyVerificationRequest(data.vendor.verification);
	// });

	// test.skip('vendor can set delivery time settings @pro', async ( )=> {
	// 	await vendorPage.setDeliveryTimeSettings(data.vendor.deliveryTime);
	// });

	test('vendor can set shipping policy @pro', async ( ) => {
		await vendorPage.setShippingPolicies(data.vendor.shipping.shippingPolicy);
	});

	test('vendor can set flat rate shipping @pro', async ( ) => {
		await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.flatRate);
	});

	test('vendor can set free shipping @pro', async ( ) => {
		await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.freeShipping);
	});

	test('vendor can set local pickup shipping @pro', async ( ) => {
		await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.localPickup);
	});

	test('vendor can set table rate shipping shipping @pro', async ( ) => {
		await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.tableRateShipping);
	});

	test('vendor can set dokan distance rate shipping @pro', async ( ) => {
		await vendorPage.setShippingSettings(data.vendor.shipping.shippingMethods.distanceRateShipping);
	});

	test('vendor can set social profile settings @pro', async ( ) => {
		await vendorPage.setSocialProfile(data.vendor.socialProfileUrls);
	});

	test('vendor can set rma settings @pro', async ( ) => {
		await vendorPage.setRmaSettings(data.vendor.rma);
	});

	test('vendor can visit own Store @lite @pro', async ( ) => {
		await vendorPage.visitStore(data.predefined.vendorStores.vendor1);
	});

});
