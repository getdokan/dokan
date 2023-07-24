import { test, Page } from '@playwright/test';
import { RefundsPage } from 'pages/refundsPage';
import { ApiUtils } from 'utils/apiUtils';
import { dbUtils } from 'utils/dbUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let refundsPage: RefundsPage;
let aPage: Page;
let apiUtils: ApiUtils;
let orderResponseBody: any;
let orderId: string;

test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	refundsPage = new RefundsPage(aPage);
	apiUtils = new ApiUtils(request);
	[, orderResponseBody, orderId, ] = await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrder, data.order.orderStatus.processing, payloads.vendorAuth);
	await dbUtils.createRefund(orderResponseBody);
});

test.afterAll(async ( ) => {
	await aPage.close();
});

test.describe('refunds test', () => {


	test('admin refunds menu page is rendering properly @pro @explo', async ( ) => {
		await refundsPage.adminRefundRequestsRenderProperly();
	});

	test('admin can search refund requests @pro', async ( ) => {  //TODO: add search by storename: add separate test/separate entry in same test/or always both
		await refundsPage.searchRefundRequests(orderId);
	});

	test('admin can approve refund request @pro', async ( ) => {
		await refundsPage.updateRefundRequests(orderId, 'approve');
	});

	test('admin can cancel refund requests @pro', async ( ) => {
		const[, orderResponseBody, orderId, ] = await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrder, data.order.orderStatus.processing, payloads.vendorAuth);
		await dbUtils.createRefund(orderResponseBody);
		await refundsPage.updateRefundRequests(orderId, 'cancel');
	});

	test('admin can perform refund requests bulk actions @pro', async ( ) => {
		const[, orderResponseBody,, ] = await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrder, data.order.orderStatus.processing, payloads.vendorAuth);
		await dbUtils.createRefund(orderResponseBody);
		await refundsPage.refundRequestsBulkAction('completed');
	});

	//TODO: add vendor tests

});
