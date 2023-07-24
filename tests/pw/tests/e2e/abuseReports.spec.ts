import { test, Page } from '@playwright/test';
import { AbuseReportsPage } from 'pages/abuseReportsPage';
import { ApiUtils } from 'utils/apiUtils';
import { dbUtils } from 'utils/dbUtils';
import { data } from 'utils/testData';
import { dbData } from 'utils/dbData';
import { payloads } from 'utils/payloads';


const { VENDOR_ID, CUSTOMER_ID } = process.env;

let abuseReportsAdmin: AbuseReportsPage;
let abuseReportsCustomer: AbuseReportsPage;
let guestUser: AbuseReportsPage;
let aPage: Page, cPage: Page, uPage: Page;
let apiUtils: ApiUtils;

test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	abuseReportsAdmin = new AbuseReportsPage(aPage);

	const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
	cPage = await customerContext.newPage();
	abuseReportsCustomer = new AbuseReportsPage(cPage);

	const guestContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
	uPage = await guestContext.newPage();
	guestUser =  new AbuseReportsPage(uPage);

	apiUtils = new ApiUtils(request);
	const productId = await apiUtils.getProductId(data.predefined.simpleProduct.product1.name, payloads.vendorAuth);
	await dbUtils.createAbuseReport(dbData.dokan.createAbuseReport, productId, VENDOR_ID, CUSTOMER_ID);
});

test.afterAll(async ( ) => {
	await aPage.close(); //TODO: close all pages at once instead of one by one
	await cPage.close();
	await uPage.close();
});

test.describe('Abuse report test', () => {

	// test.use({ storageState: data.auth.adminAuthFile });

	test('dokan abuse report menu page is rendering properly @pro @explo', async ( ) => {
		await abuseReportsAdmin.adminAbuseReportRenderProperly();
	});

	test('admin can view abuse report details @pro', async ( ) => {
		await abuseReportsAdmin.abuseReportDetails();
	});

	test('admin can filter abuse reports by abuse reason @pro', async ( ) => {
		await abuseReportsAdmin.filterAbuseReports('This content is spam', 'by-reason');
	});

	test('admin can filter abuse reports by product @pro', async ( ) => {
		await abuseReportsAdmin.filterAbuseReports(data.predefined.simpleProduct.product1.name, 'by-product');
	});

	test('admin can filter abuse reports by vendor @pro', async ( ) => {
		await abuseReportsAdmin.filterAbuseReports(data.predefined.vendorStores.vendor1, 'by-vendor');
	});

	test('admin can perform abuse report bulk action @pro', async ( ) => {
		await abuseReportsAdmin.abuseReportBulkAction('delete');
	});

	test('customer can report product @pro', async ( ) => {
		await abuseReportsCustomer.reportProduct(data.predefined.simpleProduct.product1.name, data.product.report);
	});

	test('guest customer can report product @pro', async ( ) => {
		await guestUser.reportProduct(data.predefined.simpleProduct.product1.name, data.product.report);
	});

	test('only logged-in customer can report product @pro', async ( ) => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.productReportAbuse, { ...dbData.dokan.productReportAbuseSettings, reported_by_logged_in_users_only: 'on' });
		await abuseReportsCustomer.reportProduct(data.predefined.simpleProduct.product1.name, data.product.report);
	});

});
