import { test, Page } from '@playwright/test';
import { MyOrdersPage } from 'pages/myOrdersPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';

const { CUSTOMER_ID, PRODUCT_ID } = process.env;


test.describe('My Orders functionality test', () => {


	let customer: MyOrdersPage;
	let cPage: Page;
	let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, request }) => {
		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		cPage = await customerContext.newPage();
		customer = new MyOrdersPage(cPage);
		apiUtils = new ApiUtils(request);
	});


	test.afterAll(async () => {
		await cPage.close();
	});


	test('dokan my orders page is rendering properly @lite', async ( ) => {
		await customer.myOrdersRenderProperly();
	});

	test('customer can view order details @lite', async ( ) => {
		const [,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
		await customer.viewOrderDetails(orderId);
	});

	test('customer can pay pending payment order @lite', async ( ) => {
		const [,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.pending, payloads.vendorAuth);
		await customer.payPendingOrder(orderId, 'bank');
	});

	test('customer can cancel order @lite', async ( ) => {
		const [,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.pending, payloads.vendorAuth);
		await customer.cancelPendingOrder(orderId);
	});

	test('customer can order again @lite', async ( ) => {
		const [,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
		await customer.orderAgain(orderId);
	});

});
