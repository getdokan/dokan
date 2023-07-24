import { test, Page } from '@playwright/test';
import { LoginPage } from 'pages/loginPage';
import { VendorPage } from 'pages/vendorPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';

const { CUSTOMER_ID, PRODUCT_ID } = process.env;

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

	test.afterAll(async ( ) => {
		await page.close();
	});

	test('vendor can register @lite @pro', async ( ) => {
		await vendorPage.vendorRegister(data.vendor.vendorInfo, { ...data.vendorSetupWizard, choice:false });
		// await loginPage.logout();
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

	// test.use({ storageState: data.auth.vendorAuthFile });

	let vendorPage: VendorPage;
	let vPage: Page;
	let apiUtils: ApiUtils;

	test.beforeAll(async ({ browser, request }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendorPage = new VendorPage(vPage);
		apiUtils = new ApiUtils(request);
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

	test.fixme('vendor can add variable product @pro', async ( ) => {
		await vendorPage.addVariableProduct(data.product.variable);
	});

	test('vendor can add simple subscription product @pro', async ( ) => {
		await vendorPage.addSimpleSubscription(data.product.simpleSubscription);
	});

	test.fixme('vendor can add variable subscription product @pro', async ( ) => {
		await vendorPage.addVariableSubscription(data.product.variableSubscription);
	});

	test('vendor can add external product @pro', async ( ) => {
		await vendorPage.addExternalProduct(data.product.external);
	});

	test('vendor can add auction product @pro', async ( ) => {
		await vendorPage.addAuctionProduct(data.product.auction);
	});

	test('vendor can add booking product @pro', async ( ) => {
		await vendorPage.addBookingProduct(data.product.booking);
	});


	test('vendor can add payment method @lite @pro', async ( ) => {
		await vendorPage.setPaymentSettings(data.vendor.payment);
	});

	test('vendor can request withdraw @lite @pro', async ( ) => {
		await vendorPage.requestWithdraw(data.vendor.withdraw);
	});

	test('vendor can cancel request withdraw @lite @pro', async ( ) => {
		await vendorPage.cancelRequestWithdraw( data.vendor.withdraw );
	});

	test.skip('vendor can add auto withdraw disbursement schedule @pro', async ( ) => {
		await vendorPage.addAutoWithdrawDisbursementSchedule(data.vendor.withdraw);
	});

	test('vendor can add default withdraw payment methods @lite @pro', async ( ) => {
		await vendorPage.addDefaultWithdrawPaymentMethods(data.vendor.withdraw.defaultWithdrawMethod.bankTransfer);
		// Cleanup
		await vendorPage.addDefaultWithdrawPaymentMethods(data.vendor.withdraw.defaultWithdrawMethod.paypal);
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

	test.fixme('vendor can edit addon @pro', async ( ) => {
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


test.describe('Vendor functionality test 2', () => {

	// test.use({ storageState: data.auth.vendorAuthFile });

	let vendorPage: VendorPage;
	let vPage: Page;
	let apiUtils: ApiUtils;
	let productName: string;
	let orderId: string;

	test.beforeAll(async ({ browser, request }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendorPage = new VendorPage(vPage);
		apiUtils = new ApiUtils(request);
		[,, productName] = await apiUtils.createProduct(payloads.createProduct(), payloads. vendorAuth);
		[,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.onhold, payloads.vendorAuth);
		// const [,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
	});

	test.afterAll(async () => {
		await vPage.close();
	});


	test('vendor product menu page is rendering properly @lite @pro @explo', async ( ) => {
		await vendorPage.vendorProductsRenderProperly();
	});

	test('vendor can export products @pro', async ( ) => {
		await vendorPage.exportProducts();
	});

	test('vendor can search product @lite @pro', async ( ) => {
		await vendorPage.searchProduct(data.predefined.simpleProduct.product1.name);
	});

	test('vendor can filter products by date @lite @pro', async ( ) => {
		await vendorPage.filterProducts('by-date', '1');
	});

	test('vendor can filter products by category @lite @pro', async ( ) => {
		await vendorPage.filterProducts('by-category', 'Uncategorized');
	});

	// test('vendor can filter products by type @lite @pro', async ( ) => { //TODO: dokan issue not fixed yet
	// 	await vendorPage.filterProducts('by-other', 'simple');
	// });

	test('vendor can filter products by other @pro', async ( ) => {
		await vendorPage.filterProducts('by-other', 'featured');
	});

	test('vendor can view product @lite @pro', async ( ) => {
		await vendorPage.viewProduct(data.predefined.simpleProduct.product1.name);
	});

	test('vendor can edit product @lite @pro', async ( ) => {
		await vendorPage.editProduct({ ...data.product.simple, editProduct: productName });
	});

	test.only('vendor can quick edit product @pro', async ( ) => {
		await vendorPage.quickEditProduct({ ...data.product.simple, editProduct: productName });
	});

	test('vendor can duplicate product @pro', async ( ) => {
		await vendorPage.duplicateProduct(productName);
	});

	test('vendor can permanently delete product @lite @pro', async ( ) => {
		const [,, productName] = await apiUtils.createProduct(payloads.createProduct(), payloads. vendorAuth);
		await vendorPage.permanentlyDeleteProduct(productName);
	});

	// orders

	test('vendor order menu page is rendering properly @lite @pro @explo', async ( ) => {
		await vendorPage.vendorOrdersRenderProperly();
	});

	test('vendor can export all orders @lite @pro', async ( ) => {
		await vendorPage.exportOrders('all');
	});

	test('vendor can export filtered orders @lite @pro', async ( ) => {
		await vendorPage.filterOrders('by-customer', data.customer.username);
		await vendorPage.exportOrders('filtered');
	});

	test('vendor can search order @lite @pro', async ( ) => {
		await vendorPage.searchOrder(orderId);
	});

	test('vendor can filter orders by customers @lite @pro', async ( ) => {
		await vendorPage.filterOrders('by-customer', data.customer.username);
	});

	test('vendor can view order @lite @pro', async ( ) => {
		await vendorPage.viewOrder(orderId);
	});

	test('vendor can update order status on table @lite @pro', async ( ) => {
		await vendorPage.updateOrderStatusOnTable(orderId, 'processing');
	});

	test('vendor can update order status on order details @lite @pro', async ( ) => {
		await vendorPage.updateOrderStatus(orderId, 'wc-completed');
	});

	// test('vendor can add order note @lite @pro', async ( ) => {
	// 	await vendorPage.addOrderNote(orderId, 'test note');
	// });

	// test('vendor can add private order note @lite @pro', async ( ) => {
	// 	await vendorPage.addOrderNote(orderId, 'test private note');
	// });

	// test('vendor can add tracking details to order @lite @pro', async ( ) => {
	// 	await vendorPage.addTrackingDetails(orderId, 'test note');
	// });

	// test('vendor can add shipment to order @pro', async ( ) => {
	// 	await vendorPage.addShipment(orderId, 'test note');
	// });

	// test('vendor can add downloadable product permission to order @lite @pro', async ( ) => {
	// 	await vendorPage.addShipment(orderId, 'test note');
	// });

	test('vendor can perform order bulk action @lite @pro', async ( ) => {
		await vendorPage.orderBulkAction('completed', orderId);
	});


});
