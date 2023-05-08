import { test as setup, expect } from '@playwright/test';
import { ApiUtils } from '../utils/apiUtils';
import { payloads } from '../utils/payloads';
import { data } from '../utils/testData';
import { AdminPage } from '../pages/adminPage';

//TODO: add more assertion, and move api assertion to function level

let productId: string;

setup.describe('setup site & woocommerce & user settings', ()=> {
	setup.use({ extraHTTPHeaders: { Authorization: payloads.aAuth } });

	setup('check active plugins @lite @pro', async ({ request })=> {
		setup.skip(!process.env.CI, 'skip plugin check');
		const apiUtils = new ApiUtils(request);
		const activePlugins = (await apiUtils.getAllPlugins({status:'active'})).map((a: { plugin: string })=> (a.plugin).split('/')[1]);
		expect(activePlugins).toEqual(expect.arrayContaining(data.plugin.plugins));
		// expect(activePlugins.every((plugin: string) => data.plugin.plugins.includes(plugin))).toBeTruthy();
	});

	setup('check active modules  @pro', async ({ request })=> { //TODO: move to dokan settings also handle auth
		const apiUtils = new ApiUtils(request);
		const activeModules = await apiUtils.getAllModuleIds({ status:'active'});
		expect(activeModules).toEqual(expect.arrayContaining(data.modules.modules));
	});

	setup('set wp settings @lite @pro', async ({ request })=> {
		const apiUtils = new ApiUtils(request);
		const siteSettings = await apiUtils.setSiteSettings(payloads.siteSettings);
		expect(siteSettings).toEqual(expect.objectContaining(payloads.siteSettings));
	});

	setup('reset dokan previous settings @lite @pro', async ({ request })=> {
		setup.skip(!!process.env.CI, 'skip previous settings check');
		//TODO: remove previous quote rule & list things thats need to reset
		// previous seller badges

		// previous quote rules
		const apiUtils = new ApiUtils(request);
		await apiUtils.deleteAllQuoteRules();
	});

	setup('set wc settings @lite @pro', async ({ request })=> {
		const apiUtils = new ApiUtils(request);
		await apiUtils.updateBatchWcSettingsOptions('general', payloads.general);
		await apiUtils.updateBatchWcSettingsOptions('account', payloads.account);
	});

	setup('set tax rate @lite @pro', async ({ request })=> {
		const apiUtils = new ApiUtils(request);
		await apiUtils.setUpTaxRate(payloads.enableTaxRate, payloads.createTaxRate);
	});

	setup('set shipping methods @lite @pro', async ({ request })=> {
		const apiUtils = new ApiUtils(request);

		// delete previous shipping zones
		const allShippingZoneIds = (await apiUtils.getAllShippingZones()).map((a: { id: string })=> a.id);
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
		const tableRateShippingResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanTableRateShipping);
		expect(tableRateShippingResponseBody.enabled).toBe(true);
		const distanceRateShippingResponseBody = await apiUtils.addShippingZoneMethod( zoneId, payloads.addShippingZoneMethodDokanDistanceRateShipping);
		expect(distanceRateShippingResponseBody.enabled).toBe(true);
		const dokanVendorShippingResponseBody = await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingZoneMethodDokanVendorShipping	);
		expect(dokanVendorShippingResponseBody.enabled).toBe(true);
		//TODO: separate lite pro shipping methods
	});

	setup('set basic payments @lite @pro', async ({ request })=> {
		const apiUtils = new ApiUtils(request);
		await apiUtils.updatePaymentGateway('bacs', payloads.bcs);
		await apiUtils.updatePaymentGateway('cheque', payloads.cheque);
		await apiUtils.updatePaymentGateway('cod', payloads.cod);
	});

	setup('add categories and attributes @lite @pro', async ({ request })=> {
		const apiUtils = new ApiUtils(request);

		// delete previous categories
		const allCategoryIds = (await apiUtils.getAllCategories()).map((a: { id: string })=> a.id);
		await apiUtils.updateBatchCategories('delete', allCategoryIds);

		// delete previous attributes
		const allAttributeIds = (await apiUtils.getAllAttributes()).map((a: { id: string })=> a.id);
		await apiUtils.updateBatchAttributes('delete', allAttributeIds);

		// create category
		await apiUtils.createCategory(payloads.createCategory);

		// create attribute, attribute term
		const [, attributeId] = await apiUtils.createAttribute({ name: 'sizes' });
		await apiUtils.createAttributeTerm(attributeId, { name: 's' });
		await apiUtils.createAttributeTerm(attributeId, { name: 'l' });
		await apiUtils.createAttributeTerm(attributeId, { name: 'm' });
	});

});

setup.describe('setup  user settings', ()=> {
	setup.use({ extraHTTPHeaders: { Authorization: payloads.aAuth } });


	// Customer Details
	setup('add customer @lite @pro', async ({ request })=> {
		const apiUtils = new ApiUtils(request);
		await apiUtils.createCustomer (payloads.createCustomer1, payloads.adminAuth);
	});

	// Vendor Details
	setup('add vendor & product @lite @pro', async ({ request })=> {
		const apiUtils = new ApiUtils(request);

		// create store
		await apiUtils.createStore(payloads.createStore1, payloads.adminAuth);

		// delete previous store products with predefined name if any
		await apiUtils.deleteAllProducts(data.predefined.simpleProduct.product1.name, payloads.vendorAuth);

		// create store product
		const product = { ...payloads.createProduct(), name: data.predefined.simpleProduct.product1.name, };
		[, productId] = await apiUtils.createProduct(product, payloads.vendorAuth);


	});

	setup('add vendor coupon @pro', async ({ request })=> {
		const apiUtils = new ApiUtils(request);
		// create store coupon
		const allProductIds = (await apiUtils.getAllProducts(payloads.vendorAuth)).map((a: { id: string })=> a.id);
		const coupon = { ...payloads.createCoupon(), code: data.predefined.coupon.couponCode };
		await apiUtils.createCoupon(allProductIds, coupon, payloads.vendorAuth);
		// TODO: not needed anymore
		// const [responseBody, couponId] = await apiUtils.createCoupon(allProductIds, coupon, payloads.vendorAuth);
		// if(responseBody.code === 'woocommerce_rest_coupon_code_already_exists'){  
		// 	await apiUtils.updateCoupon(couponId, { product_ids: allProductIds }, payloads.vendorAuth);
		// }
	});

	setup.skip('admin add vendor products @lite @pro', async ({ request })=> {
		const apiUtils = new ApiUtils(request);
		const product = payloads.createProduct();
		await apiUtils.createProduct({ ...product, status: 'publish', in_stock: false }, payloads.vendorAuth);
		await apiUtils.createProduct({ ...product, status: 'draft', in_stock: true }, payloads.vendorAuth);
		await apiUtils.createProduct({ ...product, status: 'pending', in_stock: true }, payloads.vendorAuth);
		await apiUtils.createProduct({ ...product, status: 'publish', in_stock: true }, payloads.vendorAuth);
	});

	setup('add test vendor orders @pro', async ({ request })=> {
		const apiUtils = new ApiUtils(request);
		await apiUtils.createOrder(payloads.createProduct(), payloads.createOrder, payloads.vendorAuth);
	});

});

setup.describe('setup dokan settings', ()=> {
	setup.use({ storageState: data.auth.adminAuthFile });

	let adminPage: any;
	// let page: any;

	setup.beforeAll(async ({ browser })=> {
		const page = await browser.newPage();
		adminPage = new AdminPage(page);
	});

	setup.skip('admin set WpSettings @lite @pro', async ()=> {
		await adminPage.setPermalinkSettings(data.wpSettings.permalink);
	});

	setup('admin set dokan general settings @lite @pro', async ()=> {
		await adminPage.setDokanGeneralSettings(data.dokanSettings.general);
	});

	setup('admin set dokan selling settings @lite @pro', async ()=> {
		await adminPage.setDokanSellingSettings(data.dokanSettings.selling);
	});

	setup('admin set dokan withdraw settings @lite @pro', async ()=> {
		await adminPage.setDokanWithdrawSettings(data.dokanSettings.withdraw);
	});

	setup('admin set dokan reverse withdraw settings @lite @pro', async ()=> {
		await adminPage.setDokanReverseWithdrawSettings(data.dokanSettings.reverseWithdraw);
	});

	setup('admin set dokan page settings @lite @pro', async ()=> {
		await adminPage.setPageSettings(data.dokanSettings.page);
	});

	setup('admin set dokan appearance settings @lite @pro', async ()=> {
		await adminPage.setDokanAppearanceSettings(data.dokanSettings.appearance);
	});

	setup('admin set dokan privacy policy settings @lite @pro', async ()=> {
		await adminPage.setDokanPrivacyPolicySettings(data.dokanSettings.privacyPolicy);
	});

	setup('admin set dokan store support settings @pro', async ()=> {
		await adminPage.setDokanStoreSupportSettings(data.dokanSettings.storeSupport);
	});

	setup('admin set dokan rma settings @pro', async ()=> {
		await adminPage.setDokanRmaSettings(data.dokanSettings.rma);
	});

	setup('admin set dokan wholesale settings @pro', async ()=> {
		await adminPage.setDokanWholesaleSettings(data.dokanSettings.wholesale);
	});

	setup('admin set dokan eu compliance settings @pro', async ()=> {
		await adminPage.setDokanEuComplianceSettings(data.dokanSettings.euCompliance);
	});

	setup.skip('admin set dokan delivery time settings @pro', async ()=> {
		await adminPage.setDokanDeliveryTimeSettings(data.dokanSettings.deliveryTime);
	});

	setup('admin set dokan product advertising settings @pro', async ()=> {
		await adminPage.setDokanProductAdvertisingSettings(data.dokanSettings.productAdvertising);
	});

	setup('admin set dokan geolocation settings @pro', async ()=> {
		await adminPage.setDokanGeolocationSettings(data.dokanSettings.geolocation);
	});

	setup('admin set dokan product report abuse settings @pro', async ()=> {
		await adminPage.setDokanProductReportAbuseSettings(data.dokanSettings.productReportAbuse);
	});

	setup('admin set dokan spmv settings @pro', async ()=> {
		await adminPage.setDokanSpmvSettings(data.dokanSettings.spmv);
	});

	setup.fixme('admin set dokan vendor subscription settings @pro', async ()=> {
		await adminPage.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription);
	});

	setup.skip('admin add dokan subscription @pro', async ()=> {
		await adminPage.addDokanSubscription({ ...data.product.vendorSubscription,
			productName: data.predefined.vendorSubscription.nonRecurring, });
	});
});
