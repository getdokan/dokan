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


	test('vendor store settings menu page is rendering properly @lite @explo', async ( ) => {
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

	test('vendor rma settings menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorRmaSettingsRenderProperly();
	});

	test('vendor store seo settings menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorStoreSeoSettingsRenderProperly();
	});


	// store settings

	//todo: add test tags

	test('vendor can set store basic settings @lite', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'basic');
	});

	test('vendor can set store address settings @lite', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'address');
	});

	test('vendor can set company info settings @pro', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'company-info');
	});

	test('vendor can set map settings @lite', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'map');
	});

	test('vendor can set terms and conditions settings @lite', async ( ) => {
		//todo: toc
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'toc');
	});

	test('vendor can set open-close settings @lite', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'open-close');
	});

	test('vendor can set vacation settings @pro', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'vacation');
	});

	test.skip('vendor can set catalog settings @lite', async ( ) => {
		//todo: enable catalog
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'catalog');
		//todo: disable catalog
	});

	test('vendor can set discount settings @pro', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'discount');
	});

	test('vendor can set biography settings @pro', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'biography');
	});

	test('vendor can set store support settings @pro', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'store-support');
	});

	test('vendor can set min-max settings @pro', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'min-max');
		// todo: disable min-max
	});

	//todo: ensure which settings need to reset, and test data should be what


	// test.skip('vendor can send id verification request @pro', async ( )=> {
	// 	await vendor.sendIdVerificationRequest(data.vendor.verification);
	// });

	// test.skip('vendor can send address verification request @pro', async ( )=> {
	// 	await vendor.sendAddressVerificationRequest(data.vendor.verification);
	// });

	// test.skip('vendor can send company verification request @pro', async ( )=> {
	// 	await vendor.sendCompanyVerificationRequest(data.vendor.verification);
	// });


	test('vendor can set delivery time settings @pro', async ( ) => {
		await vendor.setDeliveryTimeSettings(data.vendor.deliveryTime);
	});

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

	//todo: vendor can edit, delete shipping method, move to separate file

	test('vendor can set shipStation settings @pro', async ( ) => {
		await vendor.setShipStation(data.vendor.shipStation);
	});

	test('vendor can set social profile settings @pro', async ( ) => {
		await vendor.setSocialProfile(data.vendor.socialProfileUrls);  //todo: add user can share store, provide valid link and test only gotourl is successed
	});

	test('vendor can set rma settings @pro', async ( ) => {
		await vendor.setRmaSettings(data.vendor.rma);
	});

	test('vendor can set store seo settings @pro', async ( ) => {
		await vendor.setStoreSeo(data.vendor.seo);
	});


});