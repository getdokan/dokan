import { test, Page } from '@playwright/test';
import { StoreSupportsPage } from 'pages/storeSupportsPage';
import { ApiUtils } from 'utils/apiUtils';
import { data } from 'utils/testData';
import { payloads } from 'utils/payloads';


const { PRODUCT_ID, VENDOR_ID, CUSTOMER_ID } = process.env;


test.describe('Store Support test', () => {

	let admin: StoreSupportsPage;
	// let vendor: StoreSupportsPage;
	let customer: StoreSupportsPage;
	let guest: StoreSupportsPage;
	let aPage: Page, cPage: Page, uPage: Page;
	let apiUtils: ApiUtils;


	test.beforeAll(async ({ browser, request }) => {
		const adminContext = await browser.newContext({ storageState: data.auth.adminAuthFile });
		aPage = await adminContext.newPage();
		admin = new StoreSupportsPage(aPage);

		// const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		// vPage = await vendorContext.newPage();
		// vendor = new StoreSupportsPage(vPage);

		const customerContext = await browser.newContext({ storageState: data.auth.customerAuthFile });
		cPage = await customerContext.newPage();
		customer = new StoreSupportsPage(cPage);

		const guestContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
		uPage = await guestContext.newPage();
		guest =  new StoreSupportsPage(uPage);

		apiUtils = new ApiUtils(request);
		await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id : VENDOR_ID } } );
		await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id : VENDOR_ID } } );

	});


	test.afterAll(async () => {
		await aPage.close();
		await cPage.close();
		await uPage.close();
	});


	test('dokan store support menu page is rendering properly @pro @explo', async ( ) => {
		await admin.adminStoreSupportRenderProperly();
	});

	test('admin can search support ticket @pro', async ( ) => {
		await admin.searchSupportTicket(data.storeSupport.title);
	});

	test('admin can filter support tickets by vendor @pro', async ( ) => {
		await admin.filterSupportTickets(data.storeSupport.filter.byVendor, 'by-vendor');
	});

	test('admin can filter support tickets by customer @pro', async ( ) => {
		test.skip(!!process.env.CI, 'Search by customer on api not working dokan api!');
		await admin.filterSupportTickets(data.storeSupport.filter.byCustomer, 'by-customer');
	});

	test('admin can reply to support ticket as admin @pro', async ( ) => {
		await admin.replySupportTicket(data.storeSupport.chatReply.asAdmin);
	});

	test('admin can reply to support ticket as vendor @pro', async ( ) => {
		await admin.replySupportTicket(data.storeSupport.chatReply.asVendor);
	});

	test('admin can disable support ticket email notification @pro', async ( ) => {
		await admin.updateSupportTicketEmailNotification('disable');
	});

	test('admin can enable support ticket email notification @pro', async ( ) => {
		await admin.updateSupportTicketEmailNotification('enable');
	});

	test('admin can close support ticket @pro', async ( ) => {
		await admin.closeSupportTicket();
	});

	test('admin can reopen closed support ticket @pro', async ( ) => {
		await admin.reopenSupportTicket();
	});

	test('admin can perform store support bulk action @pro', async ( ) => {
		const [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id : VENDOR_ID } } );
		await admin.storeSupportBulkAction('close', supportTicketId);
	});


	// customer


	test('customer can ask for store support on single product @pro', async ( ) => {
		await customer.storeSupport(data.predefined.simpleProduct.product1.name, data.customer.customerInfo.getSupport, 'product');
	});

	test('customer can ask for store support on order details @pro', async ( ) => {
		const [,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
		await customer.storeSupport(orderId, data.customer.customerInfo.getSupport, 'order');
	});

	test('customer can ask for store support on single store @pro', async ( ) => {
		await customer.storeSupport(data.predefined.vendorStores.vendor1, data.customer.customerInfo.getSupport, 'store');
	});

	test('customer can send message to support ticket @pro', async ( ) => {
		await customer.storeSupport(data.predefined.vendorStores.vendor1, data.customer.customerInfo.getSupport, 'store');
		await customer.sendMessageCustomerSupportTicket(data.customer.supportTicket);
	});

	test('guest customer need to login before asking for store support @pro', async ( ) => {
		await guest.storeSupport(data.predefined.vendorStores.vendor1, data.customer.customerInfo.getSupport, 'store');
	});


});


test.describe('Store Support test vendor', () => {

	let vendor: StoreSupportsPage;
	let vPage: Page;
	let apiUtils: ApiUtils;
	let supportTicketId: string;


	test.beforeAll(async ({ browser, request }) => {

		const vendorContext = await browser.newContext({ storageState: data.auth.vendorAuthFile });
		vPage = await vendorContext.newPage();
		vendor = new StoreSupportsPage(vPage);

		apiUtils = new ApiUtils(request);
		[, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id : VENDOR_ID } } );
		await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id : VENDOR_ID } } );

	});


	test.afterAll(async () => {
		await vPage.close();
	});


	// vendor

	test('vendor store support menu page is rendering properly @pro @explo', async ( ) => {
		await vendor.vendorStoreSupportRenderProperly();
	});

	test('vendor can filter support tickets @pro', async ( ) => {
		await vendor.vendorFilterSupportTickets(data.storeSupport.filter.byCustomer, 'by-customer');
	});

	test('vendor can search support ticket @pro', async ( ) => {
		await vendor.vendorSearchSupportTicket('id', supportTicketId);
		// await vendor.vendorSearchSupportTicket('title', data.storeSupport.title); //todo: separate or same
	});

	test('vendor can reply to support ticket @pro', async ( ) => {
		await vendor.vendorReplySupportTicket(supportTicketId, data.storeSupport.chatReply.reply);
	});

	test('vendor can close support ticket @pro', async ( ) => {
		await vendor.vendorCloseSupportTicket( supportTicketId);
	});

	test('vendor can reopen closed support ticket @pro', async ( ) => {
		const [, closedSupportTicketId] =await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id : VENDOR_ID } } );
		await vendor.vendorReopenSupportTicket(closedSupportTicketId);
	});

	test('vendor can close support ticket with a chat reply @pro', async ( ) => {
		const [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id : VENDOR_ID } } );
		await vendor.vendorCloseSupportTicketWithReply(supportTicketId, 'closing this ticket');
	});

	test('vendor can reopen closed support ticket with a chat reply @pro', async ( ) => {
		const [, closedSupportTicketId] =await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id : VENDOR_ID } } );
		await vendor.vendorReopenSupportTicketWithReply(closedSupportTicketId, 'reopening this ticket');
	});

});
