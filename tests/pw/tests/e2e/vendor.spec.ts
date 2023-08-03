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


	let vendor: VendorPage;
	let vPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser,  }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new VendorPage(vPage);
		// apiUtils = new ApiUtils(request);
	});


	test.afterAll(async () => {
		await vPage.close();
	});


	test('vendor can setup setup-wizard @lite @pro', async ( ) => {
		await vendor.vendorSetupWizard(data.vendorSetupWizard);
	});

	test('vendor can add simple product @lite @pro', async ( ) => {
		await vendor.addSimpleProduct(data.product.simple);
	});

	// test.skip('vendor can add variable product @pro', async ( ) => {
	// 	await vendor.addVariableProduct(data.product.variable);
	// });

	test('vendor can add simple subscription product @pro', async ( ) => {
		await vendor.addSimpleSubscription(data.product.simpleSubscription);
	});

	// test.skip('vendor can add variable subscription product @pro', async ( ) => {
	// 	await vendor.addVariableSubscription(data.product.variableSubscription);
	// });

	test('vendor can add external product @pro', async ( ) => {
		await vendor.addExternalProduct(data.product.external);
	});

	test('vendor update account details @lite @pro', async ( ) => {
		await vendor.setVendorDetails(data.vendor.vendorInfo);
	});

	// store settings
	test('vendor can set store settings @lite @pro', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo);
	});

	// test.skip('vendor can send id verification request @pro', async ( )=> {
	// 	await vendor.sendIdVerificationRequest(data.vendor.verification);
	// });

	// test.skip('vendor can send address verification request @pro', async ( )=> {
	// 	await vendor.sendAddressVerificationRequest(data.vendor.verification);
	// });

	// test.skip('vendor can send company verification request @pro', async ( )=> {
	// 	await vendor.sendCompanyVerificationRequest(data.vendor.verification);
	// });

	// test.skip('vendor can set delivery time settings @pro', async ( )=> {
	// 	await vendor.setDeliveryTimeSettings(data.vendor.deliveryTime);
	// });

	test('vendor can set shipping policy @pro', async ( ) => {
		await vendor.setShippingPolicies(data.vendor.shipping.shippingPolicy);
	});

	test('vendor can set flat rate shipping @pro', async ( ) => {
		await vendor.setShippingSettings(data.vendor.shipping.shippingMethods.flatRate);
	});

	test('vendor can set free shipping @pro', async ( ) => {
		await vendor.setShippingSettings(data.vendor.shipping.shippingMethods.freeShipping);
	});

	test('vendor can set local pickup shipping @pro', async ( ) => {
		await vendor.setShippingSettings(data.vendor.shipping.shippingMethods.localPickup);
	});

	test('vendor can set table rate shipping shipping @pro', async ( ) => {
		await vendor.setShippingSettings(data.vendor.shipping.shippingMethods.tableRateShipping);
	});

	test('vendor can set dokan distance rate shipping @pro', async ( ) => {
		await vendor.setShippingSettings(data.vendor.shipping.shippingMethods.distanceRateShipping);
	});

	test('vendor can set social profile settings @pro', async ( ) => {
		await vendor.setSocialProfile(data.vendor.socialProfileUrls);
	});

	test('vendor can set rma settings @pro', async ( ) => {
		await vendor.setRmaSettings(data.vendor.rma);
	});

	test('vendor can visit own Store @lite @pro', async ( ) => {
		await vendor.visitStore(data.predefined.vendorStores.vendor1);
	});

	// todo: add tag for below tests

	test('vendor user subscriptions menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorUserSubscriptionsRenderProperly();
	});

	test('vendor product reviews menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorProductReviewsRenderProperly();
	});

	test('vendor return request menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorReturnRequestRenderProperly();
	});

	test('vendor delivery time menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorDeliveryTimeRenderProperly();
	});

	test('vendor analytics menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorAnalyticsRenderProperly();
	});

	test('vendor settings menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorSettingsRenderProperly();
	});

	test('vendor verifications menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorVerificationsRenderProperly();
	});

	test('vendor delivery time settings menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorDeliveryTimeSettingsRenderProperly();
	});

	test('vendor shipping menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorShippingRenderProperly();
	});

	test('vendor shipstation menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorShipstationRenderProperly();
	});

	test('vendor social profile menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorSocialProfileRenderProperly();
	});

	test('vendor rma menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorRmaRenderProperly();
	});

	test('vendor store seo menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorStoreSeoRenderProperly();
	});

	test('vendor account details menu page is rendering properly @lite @pro @explo', async ( ) => {
		await vendor.vendorAccountDetailsRenderProperly();
	});

});
