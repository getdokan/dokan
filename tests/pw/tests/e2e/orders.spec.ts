import { test, Page } from '@playwright/test';
import { OrdersPage } from 'pages/ordersPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


const { CUSTOMER_ID, PRODUCT_ID } = process.env;


test.describe('Order functionality test', () => {


	let vendor: OrdersPage;
	let vPage: Page;
	let apiUtils: ApiUtils;
	let orderId: string;


	test.beforeAll(async ({ browser, request }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		const vPage = await vendorContext.newPage();
		vendor = new OrdersPage(vPage);

		apiUtils = new ApiUtils(request);
		[,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.onhold, payloads.vendorAuth);
	});


	test.afterAll(async () => {
		await vPage.close();
	});


	// orders

	test('vendor order menu page is rendering properly @lite @pro @explo', async ( ) => {
		await vendor.vendorOrdersRenderProperly();
	});

	test('vendor can export all orders @lite @pro', async ( ) => {
		await vendor.exportOrders('all');
	});

	test('vendor can export filtered orders @lite @pro', async ( ) => {
		await vendor.filterOrders('by-customer', data.customer.username);
		await vendor.exportOrders('filtered');
	});

	test('vendor can search order @lite @pro', async ( ) => {
		await vendor.searchOrder(orderId);
	});

	test('vendor can filter orders by customers @lite @pro', async ( ) => {
		await vendor.filterOrders('by-customer', data.customer.username);
	});

	test('vendor can view order details @lite @pro', async ( ) => {
		await vendor.viewOrderDetails(orderId);
	});

	test('vendor can update order status on table @lite @pro', async ( ) => {
		await vendor.updateOrderStatusOnTable(orderId, 'processing');
	});

	test('vendor can update order status on order details @lite @pro', async ( ) => {
		await vendor.updateOrderStatus(orderId, 'wc-completed');
	});

	test('vendor can add order note @lite @pro', async ( ) => {
		await vendor.addOrderNote(orderId, data.orderNote.customer);
	});

	test('vendor can add private order note @lite @pro', async ( ) => {
		await vendor.addOrderNote(orderId, data.orderNote.private);
	});

	test('vendor can add tracking details to order @lite @pro', async ( ) => {
		await vendor.addTrackingDetails(orderId, data.orderTrackingDetails);
	});

	test('vendor can add shipment to order @pro', async ( ) => {
		await vendor.addShipment(orderId, data.orderShipmentDetails);
	});

	// todo: update shipment

	test.skip('vendor can add downloadable product permission to order @lite @pro', async ( ) => {
		const [,, downloadableProductName] = await apiUtils.createProduct(payloads.createDownloadableProduct(), payloads.vendorAuth);
		await vendor.addDownloadableProduct(orderId, downloadableProductName);
		await vendor.removeDownloadableProduct(orderId, downloadableProductName);
	});

	test('vendor can perform order bulk action @lite @pro', async ( ) => {
		await vendor.orderBulkAction('completed', orderId);
	});

});
