import { test, Page } from '@playwright/test';
import { ReportsPage } from 'pages/reportsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


let reportsPage: ReportsPage;
let aPage: Page;
let apiUtils: ApiUtils;
let orderId: string;

test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	reportsPage = new ReportsPage(aPage);
	apiUtils = new ApiUtils(request);
	[,, orderId, ] = await apiUtils.createOrderWithStatus(payloads.createProduct(), payloads.createOrder, data.order.orderStatus.completed, payloads.vendorAuth);
	// orderId = String(orderId); // TODO: why need to convert to string
});

test.afterAll(async ( ) => {
	await aPage.close();
});


test.describe('Reports test', () => {


	// reports

	test('admin reports menu page is rendering properly @pro @explo', async ( ) => {
		await reportsPage.adminReportsRenderProperly();
	});

	// all logs

	test('admin All Logs menu page is rendering properly @pro @explo', async ( ) => {
		await reportsPage.adminAllLogsRenderProperly();
	});

	test('admin can search all logs @pro', async ( ) => {
		await reportsPage.searchAllLogs(orderId);
	});

	test('admin can export all logs @pro', async ( ) => {
		await reportsPage.exportAllLogs(orderId);
	});

	test('admin can filter all logs by store name @pro', async ( ) => {
		await reportsPage.filterAllLogsByStore(data.predefined.vendorStores.vendor1);
	});

	test('admin can filter all logs by order status @pro', async ( ) => {
		await reportsPage.filterAllLogsByStatus('completed');
	});

	//TODO: filter by calendar

});
