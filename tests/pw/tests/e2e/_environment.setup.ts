import { test as setup, expect, Page } from '@playwright/test';
import { ProductAdvertisingPage } from 'pages/productAdvertisingPage';
import { ReverseWithdrawsPage } from 'pages/reverseWithdrawsPage';
import { ApiUtils } from 'utils/apiUtils';
import { payloads } from 'utils/payloads';
import { dbUtils } from 'utils/dbUtils';
import { dbData } from 'utils/dbData';
import { data } from 'utils/testData';
import { VendorSettingsPage } from 'pages/vendorSettingsPage';


const { CUSTOMER_ID, DOKAN_PRO, HPOS } = process.env;


setup.describe('setup site & woocommerce & user settings', () => {

	setup.use({ extraHTTPHeaders: { Authorization: payloads.adminAuth.Authorization } });

	let apiUtils: ApiUtils;

	// eslint-disable-next-line require-await
	setup.beforeAll(async ({ request }) => {
		apiUtils = new ApiUtils(request);
	});

	setup('check active plugins @lite', async () => {
		setup.skip(!process.env.CI, 'skip plugin check on local');
		const activePlugins = (await apiUtils.getAllPlugins({ status:'active' })).map((a: { plugin: string }) => (a.plugin).split('/')[1]);
		expect(activePlugins).toEqual(expect.arrayContaining(data.plugin.plugins));
		// expect(activePlugins.every((plugin: string) => data.plugin.plugins.includes(plugin))).toBeTruthy();
	});

	setup('check active dokan modules @pro', async () => {
		const activeModules = await apiUtils.getAllModuleIds({ status:'active' });
		expect(activeModules).toEqual(expect.arrayContaining(data.modules.modules));
	});

	setup('set wp settings @lite', async () => {
		const siteSettings = await apiUtils.setSiteSettings(payloads.siteSettings);
		expect(siteSettings).toEqual(expect.objectContaining(payloads.siteSettings));
	});

	// setup.skip('reset dokan previous settings @lite', async () => {
	// 	setup.skip(!!process.env.CI, 'skip previous settings check');
	// 	await apiUtils.deleteAllSellerBadges();
	// 	await apiUtils.deleteAllQuoteRules();
	// });

	setup('set wc settings @lite', async () => {
		await apiUtils.updateBatchWcSettingsOptions('general', payloads.general);
		await apiUtils.updateBatchWcSettingsOptions('account', payloads.account);
		HPOS && await apiUtils.updateBatchWcSettingsOptions('advanced', payloads.advanced);
	});

	setup('set tax rate @lite', async () => {
		await apiUtils.setUpTaxRate(payloads.enableTaxRate, payloads.createTaxRate);
	});

	setup('set shipping methods @lite', async () => {

		// delete previous shipping zones
		const allShippingZoneIds = (await apiUtils.getAllShippingZones()).map((a: { id: string }) => a.id);
		// allShippingZoneIds = helpers.removeItem(allShippingZoneIds, 0) // avoid remove default zone id
		if (allShippingZoneIds.length) {
			for (const shippingZoneId of allShippingZoneIds) {
				await apiUtils.deleteShippingZone(shippingZoneId);
			}
		}

		// create shipping zone, location and method
		const [, zoneId] = await apiUtils.createShippingZone(payloads.createShippingZone);
		await apiUtils.addShippingZoneLocation(zoneId, payloads.addShippingZoneLocation);
		await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodFlatRate);
		// await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodFreeShipping);
		// await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodLocalPickup);
		if (DOKAN_PRO){
			await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodDokanTableRateShipping);
			await apiUtils.addShippingZoneMethod( zoneId, payloads.addShippingMethodDokanDistanceRateShipping);
			await apiUtils.addShippingZoneMethod(zoneId, payloads.addShippingMethodDokanVendorShipping);
		}

	});

	setup('set basic payments @lite', async () => {
		await apiUtils.updatePaymentGateway('bacs', payloads.bcs);
		await apiUtils.updatePaymentGateway('cheque', payloads.cheque);
		await apiUtils.updatePaymentGateway('cod', payloads.cod);
		// await apiUtils.updatePaymentGateway('dokan-stripe-connect', payloads.stripeConnect);
		// await apiUtils.updatePaymentGateway('dokan_paypal_marketplace', payloads.payPal);
		// await apiUtils.updatePaymentGateway('dokan_mangopay', payloads.mangoPay);
		// await apiUtils.updatePaymentGateway('dokan_razorpay', payloads.razorpay);
		// await apiUtils.updatePaymentGateway('dokan_stripe_express', payloads.stripeExpress);
	});

	setup('add categories and attributes @lite', async () => {

		// delete previous categories
		const allCategoryIds = (await apiUtils.getAllCategories()).map((a: { id: string }) => a.id);
		await apiUtils.updateBatchCategories('delete', allCategoryIds);

		// delete previous attributes
		const allAttributeIds = (await apiUtils.getAllAttributes()).map((a: { id: string }) => a.id);
		await apiUtils.updateBatchAttributes('delete', allAttributeIds);

		// create category
		await apiUtils.createCategory(payloads.createCategory);

		// create attribute, attribute term
		const [, attributeId] = await apiUtils.createAttribute({ name: 'sizes' });
		await apiUtils.createAttributeTerm(attributeId, { name: 's' });
		await apiUtils.createAttributeTerm(attributeId, { name: 'l' });
		await apiUtils.createAttributeTerm(attributeId, { name: 'm' });
	});

	setup('disable simple-auction ajax bid check @pro', async () => {
		const [,, status] = await apiUtils.getSinglePlugin('woocommerce-simple-auctions/woocommerce-simple-auctions', payloads.adminAuth);
		status === 'active' && await dbUtils.updateWpOptionTable('simple_auctions_live_check', 'no');
	});

});


setup.describe('setup  user settings', () => {

	setup.use({ extraHTTPHeaders: { Authorization: payloads.adminAuth.Authorization } });

	let apiUtils: ApiUtils;

	// eslint-disable-next-line require-await
	setup.beforeAll(async ({ request }) => {
		apiUtils = new ApiUtils(request);
	});


	// Vendor Details
	setup('add vendor1 product @lite', async () => {

		// delete previous store products with predefined name if any
		await apiUtils.deleteAllProducts(data.predefined.simpleProduct.product1.name, payloads.vendorAuth);

		// create store product
		const product = { ...payloads.createProduct(), name: data.predefined.simpleProduct.product1.name, };
		const [, productId,] = await apiUtils.createProduct(product, payloads.vendorAuth);
		process.env.PRODUCT_ID = productId;
	});

	setup('add vendor2 product @lite', async () => {

		// delete previous store products with predefined name if any
		await apiUtils.deleteAllProducts(data.predefined.vendor2.simpleProduct.product1.name, payloads.vendor2Auth);

		// create store product
		const product = { ...payloads.createProduct(), name: data.predefined.vendor2.simpleProduct.product1.name, };
		const [, productId,] = await apiUtils.createProduct(product, payloads.vendor2Auth);
		process.env.Vendor2_PRODUCT_ID = productId;
	});

	setup('add vendor coupon @pro', async () => {

		// create store coupon
		const allProductIds = (await apiUtils.getAllProducts(payloads.vendorAuth)).map((o: { id: string }) => o.id);
		const coupon = { ...payloads.createCoupon(), code: data.predefined.coupon.couponCode };
		await apiUtils.createCoupon(allProductIds, coupon, payloads.vendorAuth);

		// const [responseBody, couponId] = await apiUtils.createCoupon(allProductIds, coupon, payloads.vendorAuth);
		// if(responseBody.code === 'woocommerce_rest_coupon_code_already_exists'){
		// 	await apiUtils.updateCoupon(couponId, { product_ids: allProductIds }, payloads.vendorAuth);
		// }
	});

	// setup.skip('admin add vendor products @lite', async () => {

	// 	const product = payloads.createProduct();
	// 	await apiUtils.createProduct({ ...product, status: 'publish', in_stock: false }, payloads.vendorAuth);
	// 	await apiUtils.createProduct({ ...product, status: 'draft', in_stock: true }, payloads.vendorAuth);
	// 	await apiUtils.createProduct({ ...product, status: 'pending', in_stock: true }, payloads.vendorAuth);
	// 	await apiUtils.createProduct({ ...product, status: 'publish', in_stock: true }, payloads.vendorAuth);
	// });

	setup('add test vendor orders @pro', async () => {
		await apiUtils.createOrder(payloads.createProduct(), { ...payloads.createOrder, customer_id: CUSTOMER_ID }, payloads.vendorAuth);
	});

});


setup.describe('setup dokan settings', () => {

	let apiUtils: ApiUtils;

	// eslint-disable-next-line require-await
	setup.beforeAll(async ({ request }) => {
		apiUtils = new ApiUtils(request);
	});

	setup('set dokan general settings @lite', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.general, dbData.dokan.generalSettings);
	});

	setup('admin set dokan selling settings @lite', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.selling, dbData.dokan.sellingSettings);
	});

	setup('admin set dokan withdraw settings @lite', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.withdraw, dbData.dokan.withdrawSettings);
	});

	setup('admin set dokan reverse withdraw settings @lite', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.reverseWithdraw, dbData.dokan.reverseWithdrawSettings);
	});

	setup('admin set dokan page settings @lite', async () => {
		const [, pageId] = await apiUtils.createPage(payloads.tocPage, payloads.adminAuth);
		const pageSettings = await dbUtils.getDokanSettings(dbData.dokan.optionName.page);
		pageSettings['reg_tc_page'] = String(pageId);
		await dbUtils.setDokanSettings(dbData.dokan.optionName.page, pageSettings);
	});

	setup('admin set dokan appearance settings @lite', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.appearance, dbData.dokan.appearanceSettings);
	});

	setup('admin set dokan privacy policy settings @lite', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.privacyPolicy, dbData.dokan.privacyPolicySettings);
	});

	setup('admin set dokan color settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.colors, dbData.dokan.colorsSettings);
	});

	setup('admin set dokan store support settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.storeSupport, dbData.dokan.storeSupportSettings);
	});

	setup('admin set dokan shipping status settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.shippingStatus, dbData.dokan.shippingStatusSettings);
	});

	setup('admin set dokan quote settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.quote, dbData.dokan.quoteSettings);
	});

	setup('admin set dokan rma settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.rma, dbData.dokan.rmaSettings);
	});

	setup('admin set dokan wholesale settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.wholesale, dbData.dokan.wholesaleSettings);
	});

	setup('admin set dokan eu compliance settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.euCompliance, dbData.dokan.euComplianceSettings);
	});

	setup('admin set dokan delivery time settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.deliveryTime, dbData.dokan.deliveryTimeSettings);
	});

	setup('admin set dokan product advertising settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.productAdvertising, dbData.dokan.productAdvertisingSettings);
	});

	setup('admin set dokan geolocation settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.geolocation, dbData.dokan.geolocationSettings);
	});

	setup('admin set dokan product report abuse settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.productReportAbuse, dbData.dokan.productReportAbuseSettings);
	});

	setup('admin set dokan spmv settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.spmv, dbData.dokan.spmvSettings);
	});

	setup('admin set dokan vendor subscription settings @pro', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.vendorSubscription, dbData.dokan.vendorSubscriptionSettings);
	});

});


setup.describe('setup dokan settings e2e', () => {


	let productAdvertisingPage: ProductAdvertisingPage;
	let reverseWithdrawsPage: ReverseWithdrawsPage;
	let vendorPage: VendorSettingsPage;
	let aPage: Page, vPage: Page;
	let apiUtils: ApiUtils;


	setup.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		productAdvertisingPage = new ProductAdvertisingPage(aPage);
		reverseWithdrawsPage = new ReverseWithdrawsPage(aPage);

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendorPage = new VendorSettingsPage(vPage);

		apiUtils = new ApiUtils(request);

	});


	setup.afterAll(async () => {
		await aPage.close();
		await vPage.close();
	});


	setup('recreate product advertisement payment product via settings save @pro', async () => {
		await productAdvertisingPage.recreateProductAdvertisementPaymentViaSettingsSave();
	});

	setup('product advertisement payment product exists @pro', async ( ) => {
		const product = await apiUtils.productExistsOrNot('Product Advertisement Payment',  payloads.adminAuth);
		expect(product).toBeTruthy();
	});

	setup('recreate reverse withdrawal payment product via settings save @pro', async () => {
		await reverseWithdrawsPage.reCreateReverseWithdrawalPaymentViaSettingsSave();
	});

	setup('reverse Withdraw payment product exists @lite', async ( ) => {
		const product = await apiUtils.productExistsOrNot('Reverse Withdrawal Payment',  payloads.adminAuth);
		expect(product).toBeTruthy();
	});

	setup('save store settings to update store on map', async () => {
		await vendorPage.updateStoreMapViaSettingsSave();
	});


	// dokan settings

	// 	setup.skip('admin set WpSettings @lite', async ()=> {
	// 		await adminPage.setPermalinkSettings(data.wpSettings.permalink);
	// 	});

	// 	setup('admin set dokan general settings @lite', async ()=> {
	// 		await adminPage.setDokanGeneralSettings(data.dokanSettings.general);
	// 	});

	// 	setup('admin set dokan selling settings @lite', async ()=> {
	// 		await adminPage.setDokanSellingSettings(data.dokanSettings.selling);
	// 	});

	// 	setup('admin set dokan withdraw settings @lite', async ()=> {
	// 		await adminPage.setDokanWithdrawSettings(data.dokanSettings.withdraw);
	// 	});

	// 	setup('admin set dokan reverse withdraw settings @lite', async ()=> {
	// 		await adminPage.setDokanReverseWithdrawSettings(data.dokanSettings.reverseWithdraw);
	// 	});

	// 	setup('admin set dokan page settings @lite', async ()=> {
	// 		await adminPage.setPageSettings(data.dokanSettings.page);
	// 	});

	// 	setup('admin set dokan appearance settings @lite', async ()=> {
	// 		await adminPage.setDokanAppearanceSettings(data.dokanSettings.appearance);
	// 	});

	// 	setup('admin set dokan privacy policy settings @lite', async ()=> {
	// 		await adminPage.setDokanPrivacyPolicySettings(data.dokanSettings.privacyPolicy);
	// 	});

	// 	setup('admin set dokan store support settings @pro', async ()=> {
	// 		await adminPage.setDokanStoreSupportSettings(data.dokanSettings.storeSupport);
	// 	});

	// 	setup('admin set dokan rma settings @pro', async ()=> {
	// 		await adminPage.setDokanRmaSettings(data.dokanSettings.rma);
	// 	});

	// 	setup('admin set dokan wholesale settings @pro', async ()=> {
	// 		await adminPage.setDokanWholesaleSettings(data.dokanSettings.wholesale);
	// 	});

	// 	setup('admin set dokan eu compliance settings @pro', async ()=> {
	// 		await adminPage.setDokanEuComplianceSettings(data.dokanSettings.euCompliance);
	// 	});

	// setup.skip('admin set dokan delivery time settings @pro', async ()=> {
	// 	await adminPage.setDokanDeliveryTimeSettings(data.dokanSettings.deliveryTime);
	// });

	// 	setup('admin set dokan product advertising settings @pro', async ()=> {
	// 		await adminPage.setDokanProductAdvertisingSettings(data.dokanSettings.productAdvertising);
	// 	});

	// 	setup('admin set dokan geolocation settings @pro', async ()=> {
	// 		await adminPage.setDokanGeolocationSettings(data.dokanSettings.geolocation);
	// 	});

	// 	setup('admin set dokan product report abuse settings @pro', async ()=> {
	// 		await adminPage.setDokanProductReportAbuseSettings(data.dokanSettings.productReportAbuse);
	// 	});

	// 	setup('admin set dokan spmv settings @pro', async ()=> {
	// 		await adminPage.setDokanSpmvSettings(data.dokanSettings.spmv);
	// 	});

	// setup.skip('admin set dokan vendor subscription settings @pro', async ()=> {
	// 	await adminPage.setDokanVendorSubscriptionSettings(data.dokanSettings.vendorSubscription);
	// });

	// setup.skip('admin add dokan subscription @pro', async ()=> {
	// 	await adminPage.addDokanSubscription({ ...data.product.vendorSubscription,
	// 		productName: data.predefined.vendorSubscription.nonRecurring, });
	// });

});
