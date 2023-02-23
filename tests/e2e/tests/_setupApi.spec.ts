import { test, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { endPoints } from '../utils/apiEndPoints';
import { payloads } from '../utils/payloads';
import { data } from '../utils/testData';

import { LoginPage } from '../pages/loginPage';
import { AdminPage } from '../pages/adminPage';
import { CustomerPage } from '../pages/customerPage';
import { VendorPage } from '../pages/vendorPage';
import { selector } from '../pages/selectors';
import { helpers } from '../utils/helpers';
const fs = require('fs');

// test.beforeAll(async ({ }) => { });
// test.afterAll(async ({ }) => { });
// test.beforeEach(async ({ }) => { });
// test.afterEach(async ({ }) => { });

//TODO: add more assertion, and move api assertion to function level

test.describe('setup test api', () => {
	test('check active plugins ', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const activePlugins = (await apiUtils.getAllPluginByStatus('active')).map((a: { plugin: any }) => a.plugin);
		// expect(activePlugins).toContain(data.plugin.plugins); //Todo: update assertion
		expect(data.plugin.plugins).toContain(activePlugins);
		// console.log(activePlugins)
	});

	test('set wp settings', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const siteSettings = await apiUtils.setSiteSettings(payloads.siteSettings);
		expect(siteSettings).toEqual(expect.objectContaining(payloads.siteSettings));
	});

	test('set wc settings', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const [generalSettingsResponse] = await apiUtils.updateBatchWcSettingsOptions('general', payloads.general);
		expect(generalSettingsResponse.ok()).toBeTruthy();
		const [accountSettingsResponse] = await apiUtils.updateBatchWcSettingsOptions('account', payloads.account);
		expect(accountSettingsResponse.ok()).toBeTruthy();
	});

	test('set tax rate', async ({ request }) => {
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

	test('set shipping methods', async ({ request }) => {
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
	});

	test('set basic payments', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const [bacsResponse] = await apiUtils.updatePaymentGateway('bacs', payloads.bcs);
		expect(bacsResponse.ok()).toBeTruthy();
		const [chequeResponse] = await apiUtils.updatePaymentGateway('cheque', payloads.cheque);
		expect(chequeResponse.ok()).toBeTruthy();
		const [codResponse] = await apiUtils.updatePaymentGateway('cod', payloads.cod);
		expect(codResponse.ok()).toBeTruthy();
	});

	test('add categories and attributes', async ({ request }) => {
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

	// Vendor Details

	test('add test vendor', async ({ request }) => {
		const apiUtils = new ApiUtils(request);

		// create store
		const [storeResponseBody, storeResponseStatus] = await apiUtils.createStore(payloads.createStore1);
		storeResponseBody.code === 'existing_user_login' ? expect(storeResponseStatus).toBe(500) : expect(storeResponseStatus).toBe(200);

		// create store product
		const product = { ...payloads.createProduct(), name: 'p1_v1' };
		const [, productId] = await apiUtils.createProduct(product, payloads.vendorAuth);

		// create store coupon
		const coupon = { ...payloads.createCoupon(), code: 'c1_v1' };
		const [couponResponseBody, couponResponseStatus] = await apiUtils.createCoupon(productId, coupon, payloads.vendorAuth);
		couponResponseBody.code === 'woocommerce_rest_coupon_code_already_exists' ? expect(couponResponseStatus).toBe(400) : expect(couponResponseStatus).toBe(200);
	});

	test.fixme('add test vendor1 rma settings', async ({ page }) => {
		const loginPage = new LoginPage(page);
		const vendorPage = new VendorPage(page);
		await loginPage.login(data.vendor);
		await vendorPage.setRmaSettings(data.vendor.rma);
	});

	test('admin add test vendor products ', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const product = payloads.createProduct();
		await apiUtils.createProduct({ ...product, status: 'publish', in_stock: false });
		await apiUtils.createProduct({ ...product, status: 'draft', in_stock: true });
		await apiUtils.createProduct({ ...product, status: 'pending', in_stock: true });
		await apiUtils.createProduct({ ...product, status: 'publish', in_stock: true });
	});

	// Customer Details

	test('add test customer', async ({ request }) => {
		const apiUtils = new ApiUtils(request);
		const [responseBody, status] = await apiUtils.createCustomer(payloads.createCustomer1);
		responseBody.code === 'registration-error-email-exists' ? expect(status).toBe(400) : expect(status).toBe(200);
	});

	// test('storageState', async ({ page }) => {
	//     // get user signed in state
	//     const browser = await chromium.launch({ headless: true })

	//     // get storageState: admin
	//     let adminPage = await browser.newPage()
	//     // log in
	//     await adminPage.goto(process.env.BASE_URL + '/wp-admin', { waitUntil: 'networkidle' })
	//     await adminPage.screenshot({ path: './playwright-report/screenshot_admin.png', fullPage: true });
	//     await adminPage.fill(selector.backend.email, 'admin')
	//     await adminPage.fill(selector.backend.password, '01dokan01')
	//     await adminPage.click(selector.backend.login)
	//     await adminPage.waitForLoadState('networkidle')
	//     await adminPage.context().storageState({ path: 'adminStorageState.json' })
	//     console.log('Stored adminStorageState')

	//     // get storageState: customer
	//     let customerPage = await browser.newPage();
	//     // log in
	//     await customerPage.goto(process.env.BASE_URL + '/my-account', { waitUntil: 'networkidle' })
	//     await customerPage.screenshot({ path: './playwright-report/screenshot_customer.png', fullPage: true });
	//     await customerPage.fill(selector.frontend.username, 'customer1')
	//     await customerPage.fill(selector.frontend.userPassword, '01dokan01')
	//     await customerPage.click(selector.frontend.logIn)
	//     await customerPage.context().storageState({ path: 'customerStorageState.json' })
	//     console.log('Stored customerStorageState')

	//     // get storageState: vendor
	//     let vendorPage = await browser.newPage()
	//     // log in
	//     await vendorPage.goto(process.env.BASE_URL + '/my-account', { waitUntil: 'networkidle' })
	//     await vendorPage.screenshot({ path: './playwright-report/screenshot_vendor.png', fullPage: true });
	//     await vendorPage.fill(selector.frontend.username, 'vendor1')
	//     await vendorPage.fill(selector.frontend.userPassword, '01dokan01')
	//     await vendorPage.click(selector.frontend.logIn)
	//     await vendorPage.context().storageState({ path: 'vendorStorageState.json' })
	//     console.log('Stored vendorStorageState')

	//     await browser.close()
	// })

	// test('admin can login', async ({ page }) => {
	//     const loginPage = new LoginPage(page)
	//     await loginPage.adminLogin(data.admin)
	//     await page.context().storageState({ path: 'adminStorageState.json' })
	// })

	// test('vendor can login', async ({ page }) => {
	//     const loginPage = new LoginPage(page)
	//     await loginPage.login(data.vendor)
	//     await page.context().storageState({ path: 'vendorStorageState.json' })
	// })

	// test('customer login', async ({ page }) => {
	//     const loginPage = new LoginPage(page)
	//     await loginPage.login(data.customer)
	//     await page.context().storageState({ path: 'customerStorageState.json' })
	// })
});

test.describe.only('setup test e2e', () => {

	test.use({ storageState: 'adminStorageState.json' });

	let adminPage: any;
	// let page: any;

	test.beforeAll(async ({ browser }) => {
		let page = await browser.newPage();
		adminPage = new AdminPage(page);
	});

	test.skip('admin set WpSettings', async ({ }) => {
		await adminPage.setPermalinkSettings(data.wpSettings.permalink);
	});

	test('admin set dokan general settings', async ({ }) => {
		await adminPage.setDokanGeneralSettings(data.dokanSettings.general);
	});

	test('admin set dokan selling settings', async ({ }) => {
		await adminPage.setDokanSellingSettings(data.dokanSettings.selling);
	});

	test('admin set dokan withdraw settings', async ({ }) => {
		await adminPage.setDokanWithdrawSettings(data.dokanSettings.withdraw);
	});

	test('admin set dokan page settings', async ({ }) => {
		await adminPage.setPageSettings(data.dokanSettings.page);
	});

	test('admin set dokan appearance settings', async ({ }) => {
		await adminPage.setDokanAppearanceSettings(data.dokanSettings.appearance);
	});

	test('admin set dokan privacy policy settings', async ({ }) => {
		await adminPage.setDokanPrivacyPolicySettings(data.dokanSettings.privacyPolicy);
	});

	test('admin set dokan store support settings', async ({ }) => {
		await adminPage.setDokanStoreSupportSettings(data.dokanSettings.storeSupport);
	});

	test('admin set dokan rma settings', async ({ }) => {
		await adminPage.setDokanRmaSettings(data.dokanSettings.rma);
	});

	test('admin set dokan wholesale settings', async ({ }) => {
		await adminPage.setDokanWholesaleSettings(data.dokanSettings.wholesale);
	});

	test('admin set dokan eu compliance settings', async ({ }) => {
		await adminPage.setDokanEuComplianceSettings(data.dokanSettings.euCompliance);
	});

	test.skip('admin set dokan delivery time settings', async ({ }) => {
		await adminPage.setDokanDeliveryTimeSettings(data.dokanSettings.deliveryTime);
	});

	test('admin set dokan product advertising settings', async ({ }) => {
		await adminPage.setDokanProductAdvertisingSettings(data.dokanSettings.productAdvertising);
	});

	test.only('admin set dokan geolocation settings', async ({ }) => {
		await adminPage.setDokanGeolocationSettings(data.dokanSettings.geolocation);
	});

	test('admin set dokan product report abuse settings', async ({ }) => {
		await adminPage.setDokanProductReportAbuseSettings(data.dokanSettings.productReportAbuse);
	});

	test('admin set dokan spmv settings', async ({ }) => {
		await adminPage.setDokanSpmvSettings(data.dokanSettings.spmv);
	});

	test.fixme('admin set dokan vendor subscription settings', async ({ }) => {
		await adminPage.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription);
	});

	test.skip('admin add dokan subscription', async ({ }) => {
		await adminPage.addDokanSubscription({ ...data.product.vendorSubscription, productName: data.predefined.vendorSubscription.nonRecurring });
	});
});
