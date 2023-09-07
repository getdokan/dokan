import { test, Page } from '@playwright/test';
import { VendorReturnRequestPage } from 'pages/vendorReturnRequestPage';
import { CustomerPage } from 'pages/customerPage';
import { OrdersPage } from 'pages/ordersPage';
// import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
// import { payloads } from 'utils/payloads';


// const { CUSTOMER_ID, PRODUCT_ID } = process.env;


test.describe('Vendor RMA test', () => {


	let vendor: VendorReturnRequestPage;
	let vendor1: OrdersPage;
	let customer: VendorReturnRequestPage;
	let customer1: CustomerPage;
	let vPage: Page, cPage: Page;
	// let apiUtils: ApiUtils;
	let orderId: string;


	test.beforeAll(async ({ browser, }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new VendorReturnRequestPage(vPage);
		vendor1 = new OrdersPage(vPage);

		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		cPage = await customerContext.newPage();
		customer = new VendorReturnRequestPage(cPage);
		customer1 = new CustomerPage(cPage);


		//todo: implement via api
		await customer1.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
		await customer1.goToCheckout();
		orderId = await customer1.paymentOrder();
		await vendor1.updateOrderStatusOnTable(orderId, 'processing');
		await customer.customerRequestWarranty(orderId, data.predefined.simpleProduct.product1.name, data.rma.requestWarranty);

		// apiUtils = new ApiUtils(request);

		// [,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.processing, payloads.vendorAuth);
		// [,, orderId, ] = await apiUtils.createOrderWithStatus(payloads.createProduct(), { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.processing, payloads.vendorAuth);

	});


	test.afterAll(async () => {
		await vPage.close();
		await cPage.close();
	});


	test('vendor return request menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorReturnRequestRenderProperly();
	});

	test('vendor can view return request details @pro @explo', async ( ) => {
		await vendor.vendorViewRmaDetails(orderId);
	});

	test('customer can send rma message @pro', async ( ) => {
		await customer.customerSendRmaMessage(orderId, 'test customer rma message');
	});

	test('vendor can send rma message @pro', async ( ) => {
		//todo: depends on customer can request warranty, remove dependency
		await vendor.vendorSendRmaMessage(orderId, 'test vendor rma message');
	});

	test('vendor can update rma status @pro', async ( ) => {
		await vendor.vendorUpdateRmaStatus(orderId, 'processing');
	});

	test('vendor can rma refund @pro', async ( ) => {
		await vendor.vendorRmaRefund(orderId, data.predefined.simpleProduct.product1.name, 'processing');
	});

	test('vendor can delete rma request @pro', async ( ) => {
		//todo:need separate rma request
		await vendor.vendorDeleteRmaRequest(orderId);
	});


	// customer

	test('customer return request menu page is rendering properly @pro @explo', async ( ) => {
		await customer.customerReturnRequestRenderProperly();
	});

	test('customer can request warranty @pro', async ( ) => {
		await customer1.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
		await customer1.goToCheckout();
		const orderId = await customer1.paymentOrder();
		await vendor1.updateOrderStatusOnTable(orderId, 'processing');
		await customer.customerRequestWarranty(orderId, data.predefined.simpleProduct.product1.name, data.rma.requestWarranty);
	});

});