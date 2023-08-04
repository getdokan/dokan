import { test, Page } from '@playwright/test';
import { VendorSettingsPage } from 'pages/vendorSettingsPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Vendor settings test', () => {


	let vendor: VendorSettingsPage;
	let vPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new VendorSettingsPage(vPage);

		// apiUtils = new ApiUtils(request);

	});


	test.afterAll(async () => {
		await vPage.close();
	});


	test('vendor store settings menu page is rendering properly @lite @pro @explo', async ( ) => {
		await vendor.vendorStoreSettingsRenderProperly();
	});

	test('vendor verifications settings menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorVerificationsSettingsRenderProperly();
	});

	test('vendor shipping settings menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorShippingSettingsRenderProperly();
	});

	test('vendor shipstation settings menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorShipstationSettingsRenderProperly();
	});

	test('vendor social profile settings menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorSocialProfileSettingsRenderProperly();
	});

	test('vendor store seo settings menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorStoreSeoSettingsRenderProperly();
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


});