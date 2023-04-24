import { test as setup, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';
import { data } from '../utils/testData';

import { LoginPage } from '../pages/loginPage';
import { AdminPage } from '../pages/adminPage';
import { CustomerPage } from '../pages/customerPage';
import { VendorPage } from '../pages/vendorPage';
import { selector } from '../pages/selectors';
import { helpers } from '../utils/helpers'
import fs from 'fs';


//TODO: add more assertion, and move api assertion to function level

let productId: string;

setup.describe('setup site & woocommerce & user settings', () => {

	setup.use({ extraHTTPHeaders: { Accept: '*/*', Authorization: payloads.aAuth, }, });

	setup('check active plugins @lite @pro', async ({ request }) => {
		setup.skip(!process.env.CI, 'skip plugin check');
		const apiUtils = new ApiUtils(request);
		const activePlugins = (await apiUtils.getAllPluginByStatus('active')).map((a: { plugin: any }) => a.plugin);
		expect(activePlugins).toEqual(expect.arrayContaining(data.plugin.plugins));
		// expect(activePlugins.every((plugin: string) => data.plugin.plugins.includes(plugin))).toBeTruthy();
	});

	setup('set wp settings @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const siteSettings = await apiUtils.setSiteSettings(payloads.siteSettings);
		expect(siteSettings).toEqual(expect.objectContaining(payloads.siteSettings)); 
	});

	setup('set wc settings @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const [generalSettingsResponse] = await apiUtils.updateBatchWcSettingsOptions('general', payloads.general);
		expect(generalSettingsResponse.ok()).toBeTruthy();
		const [accountSettingsResponse] = await apiUtils.updateBatchWcSettingsOptions('account', payloads.account);
		expect(accountSettingsResponse.ok()).toBeTruthy();
	});

	setup('set tax rate @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);

		// enable tax rate
		await apiUtils.updateBatchWcSettingsOptions('general', payloads.enableTaxRate);

		// delete previous tax rates
		const allTaxRateIds = (await apiUtils.getAllTaxRates()).map((a: { id: any }) => a.id);
		if (allTaxRateIds.length) {
			await apiUtils.updateBatchTaxRates('delete', allTaxRateIds);
		}

		// create tax rate
		const taxRateResponse = await apiUtils.createTaxRate(payloads.createTaxRate);
		expect(parseInt(taxRateResponse.rate)).toBe(parseInt(payloads.createTaxRate.rate));
	});

	setup('set shipping methods @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);

		// delete previous shipping zones
		const allShippingZoneIds = (await apiUtils.getAllShippingZones()).map((a: { id: any }) => a.id);
		// allShippingZoneIds = helpers.removeItem(allShippingZoneIds, 0) // remove default zone id
		if (allShippingZoneIds.length) {
			for (const shippingZoneId of allShippingZoneIds) {
				await apiUtils.deleteShippingZone(shippingZoneId);
			}
		}

		// create shipping zone, location and method
		const [, zoneId] = await apiUtils.createShippingZone(payloads.createShippingZone);
		await apiUtils.addShippingZoneLocation(zoneId, payloads.addShippingZoneLocation);
		const flatRateResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodFlatRate);
		expect(flatRateResponseBody.enabled).toBe(true);
		// const freeShippingResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodFreeShipping);
		// expect(freeShippingResponseBody.enabled).toBe(true);
		// const localPickupResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodLocalPickup);
		// expect(localPickupResponseBody.enabled).toBe(true);
		// const tableRateShippingResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanTableRateShipping);
		// expect(tableRateShippingResponseBody.enabled).toBe(true);
		// const distanceRateShippingResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanDistanceRateShipping);
		// expect(distanceRateShippingResponseBody.enabled).toBe(true);
		// const dokanVendorShippingResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanVendorShipping);
		// expect(dokanVendorShippingResponseBody.enabled).toBe(true);
		//TODO: separate lite pro shipping methods
	});

	setup('set basic payments @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const [bacsResponse] = await apiUtils.updatePaymentGateway('bacs', payloads.bcs);
		expect(bacsResponse.ok()).toBeTruthy();
		const [chequeResponse] = await apiUtils.updatePaymentGateway('cheque', payloads.cheque);
		expect(chequeResponse.ok()).toBeTruthy();
		const [codResponse] = await apiUtils.updatePaymentGateway('cod', payloads.cod);
		expect(codResponse.ok()).toBeTruthy();
	});

	setup('add categories and attributes @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);

		// delete previous categories
		const allCategoryIds = (await apiUtils.getAllCategories()).map((a: { id: any }) => a.id);
		await apiUtils.updateBatchCategories('delete', allCategoryIds);

		// delete previous attributes
		const allAttributeIds = (await apiUtils.getAllAttributes()).map((a: { id: any }) => a.id);
		await apiUtils.updateBatchAttributes('delete', allAttributeIds);

		// create category
		await apiUtils.createCategory(payloads.createCategory);

		// create attribute, attribute term
		const [, attributeId] = await apiUtils.createAttribute({ name: 'sizes' });
		const [responseS] = await apiUtils.createAttributeTerm(attributeId, { name: 's' });
		expect(responseS.ok()).toBeTruthy();
		const [responseL] = await apiUtils.createAttributeTerm(attributeId, { name: 'l' });
		expect(responseL.ok()).toBeTruthy();
		const [responseM] = await apiUtils.createAttributeTerm(attributeId, { name: 'm' });
		expect(responseM.ok()).toBeTruthy();
	});

	// Customer Details

	setup('add customer @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const response = await request.post(endPoints.wc.createCustomer, { data: payloads.createCustomer1, headers: payloads.adminAuth });
		const responseBody = await apiUtils.getResponseBody(response, false);
		responseBody.code ? expect(response.status()).toBe(400) : expect(response.ok()).toBeTruthy();
	});


	// Vendor Details
	setup('add vendor @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);

		// create store
		const response = await request.post(endPoints.createStore, { data: payloads.createStore1, headers: payloads.adminAuth });
		const responseBody = await apiUtils.getResponseBody(response, false);
		responseBody.code ? expect(response.status()).toBe(500) : expect(response.ok()).toBeTruthy();

		// create store product
		const product = { ...payloads.createProduct(), name: 'p1_v1' };
		[, productId] = await apiUtils.createProduct(product, payloads.vendorAuth);
	});

	setup('admin add test vendor products @lite @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const product = payloads.createProduct();
		await apiUtils.createProduct({ ...product, status: 'publish', in_stock: false });
		await apiUtils.createProduct({ ...product, status: 'draft', in_stock: true });
		await apiUtils.createProduct({ ...product, status: 'pending', in_stock: true });
		await apiUtils.createProduct({ ...product, status: 'publish', in_stock: true });
	});

	setup('add test vendor coupon @pro', async ({ request }) => {
		const apiUtils = new ApiUtils(request);

		// create store coupon
		const coupon = { ...payloads.createCoupon(), code: 'c1_v1' };
		const response = await apiUtils.request.post(endPoints.createCoupon, { data: { ...coupon, product_ids: productId }, headers: payloads.vendorAuth });
		const responseBody = await apiUtils.getResponseBody(response, false);
		responseBody.code ? expect(response.status()).toBe(400) : expect(response.ok()).toBeTruthy();
	});

});

setup.describe('setup dokan settings', () => {

	setup.use({ storageState: 'adminStorageState.json' });

	let adminPage: any;
	// let page: any;

	setup.beforeAll(async ({ browser }) => {
		let page = await browser.newPage();
		adminPage = new AdminPage(page);
	});

	setup.skip('admin set WpSettings @lite @pro', async ({ }) => {
		await adminPage.setPermalinkSettings(data.wpSettings.permalink);
	});

	setup('admin set dokan general settings @lite @pro', async ({ }) => {
		await adminPage.setDokanGeneralSettings(data.dokanSettings.general);
	});

	setup('admin set dokan selling settings @lite @pro', async ({ }) => {
		await adminPage.setDokanSellingSettings(data.dokanSettings.selling);
	});

	setup('admin set dokan withdraw settings @lite @pro', async ({ }) => {
		await adminPage.setDokanWithdrawSettings(data.dokanSettings.withdraw);
	});

	setup('admin set dokan reverse withdraw settings @lite @pro', async ({ }) => {
		await adminPage.setDokanReverseWithdrawSettings(data.dokanSettings.reverseWithdraw);
	});

	setup('admin set dokan page settings @lite @pro', async ({ }) => {
		await adminPage.setPageSettings(data.dokanSettings.page);
	});

	setup('admin set dokan appearance settings @lite @pro', async ({ }) => {
		await adminPage.setDokanAppearanceSettings(data.dokanSettings.appearance);
	});

	setup('admin set dokan privacy policy settings @lite @pro', async ({ }) => {
		await adminPage.setDokanPrivacyPolicySettings(data.dokanSettings.privacyPolicy);
	});

	setup('admin set dokan store support settings @pro', async ({ }) => {
		await adminPage.setDokanStoreSupportSettings(data.dokanSettings.storeSupport);
	});

	setup('admin set dokan rma settings @pro', async ({ }) => {
		await adminPage.setDokanRmaSettings(data.dokanSettings.rma);
	});

	setup('admin set dokan wholesale settings @pro', async ({ }) => {
		await adminPage.setDokanWholesaleSettings(data.dokanSettings.wholesale);
	});

	setup('admin set dokan eu compliance settings @pro', async ({ }) => {
		await adminPage.setDokanEuComplianceSettings(data.dokanSettings.euCompliance);
	});

	setup.skip('admin set dokan delivery time settings @pro', async ({ }) => {
		await adminPage.setDokanDeliveryTimeSettings(data.dokanSettings.deliveryTime);
	});

	setup('admin set dokan product advertising settings @pro', async ({ }) => {
		await adminPage.setDokanProductAdvertisingSettings(data.dokanSettings.productAdvertising);
	});

	setup('admin set dokan geolocation settings @pro', async ({ }) => {
		await adminPage.setDokanGeolocationSettings(data.dokanSettings.geolocation);
	});

	setup('admin set dokan product report abuse settings @pro', async ({ }) => {
		await adminPage.setDokanProductReportAbuseSettings(data.dokanSettings.productReportAbuse);
	});

	setup('admin set dokan spmv settings @pro', async ({ }) => {
		await adminPage.setDokanSpmvSettings(data.dokanSettings.spmv);
	});

	setup.fixme('admin set dokan vendor subscription settings @pro', async ({ }) => {
		await adminPage.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription);
	});

	setup.skip('admin add dokan subscription @pro', async ({ }) => {
		await adminPage.addDokanSubscription({ ...data.product.vendorSubscription, productName: data.predefined.vendorSubscription.nonRecurring });
	});
});
