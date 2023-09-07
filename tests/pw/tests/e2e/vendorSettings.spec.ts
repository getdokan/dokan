import { test, Page } from '@playwright/test';
import { VendorSettingsPage } from 'pages/vendorSettingsPage';
import { dbData } from 'utils/dbData';
// import { ApiUtils } from 'utils/apiUtils';
import { dbUtils } from 'utils/dbUtils';
import { helpers } from 'utils/helpers';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


test.describe('Vendor settings test', () => {


	let vendor: VendorSettingsPage;
	let vPage: Page;
	// let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser }) => {
		const vendorContext = await browser.newContext(data.auth.vendorAuth);
		vPage = await vendorContext.newPage();
		// vPage = await helpers.createPage(browser, data.auth.vendorAuth);
		vendor = new VendorSettingsPage(vPage);

		// apiUtils = new ApiUtils(request);

	});


	test.afterAll(async () => {
		await vPage.close();
	});


	test.only('vendor store settings menu page is rendering properly @lite @explo', async ( ) => {
		await vendor.vendorStoreSettingsRenderProperly();
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

	//todo: ensure which settings need to reset, and test data should be what

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
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'toc');
	});

	test('vendor can set open-close settings @lite', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'open-close');
	});

	test('vendor can set vacation settings @pro', async ( ) => {
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'vacation');
	});

	test('vendor can set catalog settings @lite', async ( ) => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
		await vendor.setStoreSettings(data.vendor.vendorInfo, 'catalog');
		// await vendor.resetCatalog();

		// disable catalog
		await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, catalog_mode_hide_add_to_cart_button: 'off', catalog_mode_hide_product_price: 'off' });
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
		// disable min-max
		await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, { ...dbData.dokan.sellingSettings, enable_min_max_quantity: 'off', enable_min_max_amount: 'off' });
	});

	test('vendor can set shipStation settings @pro', async ( ) => {
		await vendor.setShipStation(data.vendor.shipStation);
	});

	test('vendor can set social profile settings @pro', async ( ) => {
		await vendor.setSocialProfile(data.vendor.socialProfileUrls);
	});

	test('vendor can set rma settings @pro', async ( ) => {
		await vendor.setRmaSettings(data.vendor.rma);
	});

	test('vendor can set store seo settings @pro', async ( ) => {
		await vendor.setStoreSeo(data.vendor.seo);
	});


});