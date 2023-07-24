import { test, Page } from '@playwright/test';
import { OrdersPage } from 'pages/ordersPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';

// const { CUSTOMER_ID, PRODUCT_ID } = process.env;
const CUSTOMER_ID = '2';
const PRODUCT_ID = '22';


test.describe('Order functionality test', () => {


	let ordersPage: OrdersPage;
	let vPage: Page;
	let apiUtils: ApiUtils;
	let orderId: string;

	test.beforeAll(async ({ browser, request }) => {
		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		ordersPage = new OrdersPage(vPage);

		apiUtils = new ApiUtils(request);
		[,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.onhold, payloads.vendorAuth);
	});

	test.afterAll(async () => {
		await vPage.close();
	});


	// orders

	test('vendor order menu page is rendering properly @lite @pro @explo', async ( ) => {
		await ordersPage.vendorOrdersRenderProperly();
	});

	test('vendor can export all orders @lite @pro', async ( ) => {
		await ordersPage.exportOrders('all');
	});

	test('vendor can export filtered orders @lite @pro', async ( ) => {
		await ordersPage.filterOrders('by-customer', data.customer.username);
		await ordersPage.exportOrders('filtered');
	});

	test('vendor can search order @lite @pro', async ( ) => {
		await ordersPage.searchOrder(orderId);
	});

	test('vendor can filter orders by customers @lite @pro', async ( ) => {
		await ordersPage.filterOrders('by-customer', data.customer.username);
	});

	test('vendor can view order details @lite @pro', async ( ) => {
		await ordersPage.viewOrderDetails(orderId);
	});

	test('vendor can update order status on table @lite @pro', async ( ) => {
		await ordersPage.updateOrderStatusOnTable(orderId, 'processing');
	});

	test('vendor can update order status on order details @lite @pro', async ( ) => {
		await ordersPage.updateOrderStatus(orderId, 'wc-completed');
	});

	test('vendor can add order note @lite @pro', async ( ) => {
		await ordersPage.addOrderNote(orderId, data.orderNote.customer);
	});

	test('vendor can add private order note @lite @pro', async ( ) => {
		await ordersPage.addOrderNote(orderId, data.orderNote.private);
	});

	test('vendor can add tracking details to order @lite @pro', async ( ) => {
		await ordersPage.addTrackingDetails(orderId, data.orderTrackingDetails);
	});

	test('vendor can add shipment to order @pro', async ( ) => {
		await ordersPage.addShipment(orderId, data.orderShipmentDetails);
	});

	test.skip('vendor can add downloadable product permission to order @lite @pro', async ( ) => {
		const [,, downloadableProductName] = await apiUtils.createProduct(payloads.createDownloadableProduct(), payloads.vendorAuth);
		await ordersPage.addDownloadableProduct(orderId, downloadableProductName);
		await ordersPage.removeDownloadableProduct(orderId, downloadableProductName);
	});

	test('vendor can perform order bulk action @lite @pro', async ( ) => {
		await ordersPage.orderBulkAction('completed', orderId);
	});

});
