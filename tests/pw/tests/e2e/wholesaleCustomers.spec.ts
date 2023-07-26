import { test, Page } from '@playwright/test';
import { WholesaleCustomersPage } from 'pages/wholesaleCustomersPage';
import { CustomerPage } from 'pages/customerPage';
import { ApiUtils } from 'utils/apiUtils';
import { dbUtils } from 'utils/dbUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';
import { dbData } from 'utils/dbData';


let admin: WholesaleCustomersPage;
let customer: WholesaleCustomersPage;
let customerPage: CustomerPage;
let aPage: Page, cPage: Page;
let apiUtils: ApiUtils;


test.beforeAll(async ({ browser, request }) => {
	const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
	aPage = await adminContext.newPage();
	admin = new WholesaleCustomersPage(aPage);

	// const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
	const customerContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
	cPage = await customerContext.newPage();
	customerPage = new CustomerPage(cPage);
	customer = new WholesaleCustomersPage(cPage);

	apiUtils = new ApiUtils(request);
	await apiUtils.createWholesaleCustomer(payloads.createCustomer(), payloads.adminAuth);
	await apiUtils.createWholesaleCustomer(payloads.createCustomer1, payloads.adminAuth);
});

test.afterAll(async ( ) => {
	await aPage.close();  //TODO: close all pages at once
	await cPage.close();
});

test.describe('Wholesale customers test', () => {


	test('dokan wholesale customers menu page is rendering properly @pro @explo', async ( ) => {
		await admin.adminWholesaleCustomersRenderProperly();
	});

	test('admin can search wholesale customer @pro', async ( ) => {
		await admin.searchWholesaleCustomer(data.predefined.customerInfo.username1);
	});

	test('admin can disable customer\'s wholesale capability @pro', async ( ) => {
		await admin.updateWholesaleCustomer(data.predefined.customerInfo.username1, 'disable');
	});

	test('admin can enable customer\'s wholesale capability @pro', async ( ) => {
		await admin.updateWholesaleCustomer(data.predefined.customerInfo.username1, 'enable');
	});

	test('admin can edit wholesale customer @pro', async ( ) => {
		await admin.editWholesaleCustomer(data.customer);
	});

	test('admin can view wholesale customer orders @pro', async ( ) => {
		await admin.viewWholesaleCustomerOrders(data.predefined.customerInfo.username1);
	});

	test('admin can delete wholesale customer @pro', async ( ) => {
		await admin.updateWholesaleCustomer(data.predefined.customerInfo.username1, 'delete');
	});

	test('admin can perform wholesale customer bulk action @pro', async ( ) => {
		await admin.wholesaleCustomerBulkAction('activate');
	});

	test('customer can become a wholesale customer', async () => {
		await customerPage.customerRegister(data.customer.customerInfo);
		await customer.customerBecomeWholesaleCustomer();
	});

	test('customer can request for become a wholesale customer', async () => {
		await dbUtils.setDokanSettings(dbData.dokan.optionName.wholesale, { ...dbData.dokan.wholesaleSettings, need_approval_for_wholesale_customer: 'on' });
		await customerPage.customerRegister(data.customer.customerInfo);
		await customer.customerRequestForBecomeWholesaleCustomer();
	});

	// wholesale setting options tests
	//TODO: customer need or don't need approval : re-modify above two tests
	//TODO: only customer can see wholesale price
	//TODO: all users can see wholesale price
	//TODO: customer can purchase product at wholesale price
	//TODO: vendor can see Wholesale Price on Shop Archive
	//TODO: vendor can create wholesale product  via api


});
