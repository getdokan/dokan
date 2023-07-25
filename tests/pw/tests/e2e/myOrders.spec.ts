import { test, Page } from '@playwright/test';
import { MyOrdersPage } from 'pages/myOrdersPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';

const { CUSTOMER_ID, PRODUCT_ID } = process.env;


test.describe('My Orders functionality test', () => {


	let myOrdersPage: MyOrdersPage;
	let page: Page;
	let apiUtils: ApiUtils;

	test.beforeAll(async ({ browser, request }) => {
		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		page = await customerContext.newPage();
		myOrdersPage = new MyOrdersPage(page);
		apiUtils = new ApiUtils(request);
	});

	test.afterAll(async () => {
		await page.close();
	});


	test('dokan my orders page is rendering properly @lite @pro', async ( ) => {
		await myOrdersPage.myOrdersRenderProperly();
	});

	test('customer can view order details @lite @pro', async ( ) => {
		const [,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
		await myOrdersPage.viewOrderDetails(orderId);
	});

	test('customer can pay pending payment order @lite @pro', async ( ) => {
		const [,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.pending, payloads.vendorAuth);
		await myOrdersPage.payPendingOrder(orderId, 'bank');
	});

	test('customer can cancel order @lite @pro', async ( ) => {
		const [,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.pending, payloads.vendorAuth);
		await myOrdersPage.cancelPendingOrder(orderId);
	});

	test('customer can order again @lite @pro', async ( ) => {
		const [,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
		await myOrdersPage.orderAgain(orderId);
	});

});
