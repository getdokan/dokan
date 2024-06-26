import { test, request, Page } from '@playwright/test';
import { StoreSupportsPage } from '@pages/storeSupportsPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { responseBody } from '@utils/interfaces';

const { VENDOR_ID, CUSTOMER_ID, PRODUCT_ID } = process.env;

test.describe('Store Support test (admin)', () => {
    let admin: StoreSupportsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let supportTicketId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new StoreSupportsPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    //admin

    test('admin can view store support menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminStoreSupportRenderProperly();
    });

    test('unread count decrease after admin viewing a support ticket', { tag: ['@pro', '@admin'] }, async () => {
        await admin.decreaseUnreadSupportTicketCount(supportTicketId);
    });

    test('admin can view support ticket details', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminViewSupportTicketDetails(supportTicketId);
    });

    test('admin can search support ticket by ticket id', { tag: ['@pro', '@admin'] }, async () => {
        await admin.searchSupportTicket(supportTicketId);
    });

    test('admin can search support ticket by ticket title', { tag: ['@pro', '@admin'] }, async () => {
        await admin.searchSupportTicket(data.storeSupport.title);
    });

    test('admin can filter support tickets by vendor', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterSupportTickets(data.storeSupport.filter.byVendor, 'by-vendor');
    });

    test('admin can filter support tickets by customer', { tag: ['@pro', '@admin'] }, async () => {
        await admin.filterSupportTickets(data.storeSupport.filter.byCustomer, 'by-customer');
    });

    test('admin can reply to support ticket as admin', { tag: ['@pro', '@admin'] }, async () => {
        await admin.replySupportTicket(supportTicketId, data.storeSupport.chatReply.asAdmin);
    });

    test('admin can reply to support ticket as vendor', { tag: ['@pro', '@admin'] }, async () => {
        await admin.replySupportTicket(supportTicketId, data.storeSupport.chatReply.asVendor);
    });

    test('admin can disable support ticket email notification', { tag: ['@pro', '@admin'] }, async () => {
        await admin.updateSupportTicketEmailNotification(supportTicketId, 'disable');
    });

    test('admin can enable support ticket email notification', { tag: ['@pro', '@admin'] }, async () => {
        const [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await apiUtils.updateSupportTicketEmailNotification(supportTicketId, { notification: false }, payloads.adminAuth);
        await admin.updateSupportTicketEmailNotification(supportTicketId, 'enable');
    });

    test('admin can close support ticket', { tag: ['@pro', '@admin'] }, async () => {
        await admin.closeSupportTicket(supportTicketId);
    });

    test('admin can reopen closed support ticket', { tag: ['@pro', '@admin'] }, async () => {
        const [, closedSupportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await admin.reopenSupportTicket(closedSupportTicketId);
    });

    test('admin can perform bulk action on store support tickets', { tag: ['@pro', '@admin'] }, async () => {
        const [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await admin.storeSupportBulkAction('close', supportTicketId);
    });
});

test.describe('Store Support test (customer)', () => {
    let customer: StoreSupportsPage;
    let guest: StoreSupportsPage;
    let cPage: Page;
    let apiUtils: ApiUtils;
    let orderId: string;
    let responseBody: responseBody;
    let supportTicketId: string;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new StoreSupportsPage(cPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, responseBody, orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
        [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID, order_id: orderId } });
    });

    test.afterAll(async () => {
        await cPage.close();
        await apiUtils.dispose();
    });

    test('customer can view store support menu page', { tag: ['@pro', '@exploratory', '@customer'] }, async () => {
        await customer.customerStoreSupportRenderProperly();
    });

    test('customer can view support ticket details', { tag: ['@pro', '@exploratory', '@customer'] }, async () => {
        await customer.customerViewSupportTicketDetails(supportTicketId);
    });

    test('customer can ask for store support on single product', { tag: ['@pro', '@customer'] }, async () => {
        await customer.storeSupport(data.predefined.simpleProduct.product1.name, data.customer.getSupport, 'product');
    });

    test('customer can ask for store support on single store', { tag: ['@pro', '@customer'] }, async () => {
        await customer.storeSupport(data.predefined.vendorStores.vendor1, data.customer.getSupport, 'store');
    });

    test('customer can ask for store support on order details', { tag: ['@pro', '@customer'] }, async () => {
        await customer.storeSupport(orderId, data.customer.getSupport, 'order');
    });

    test('customer can ask for store support on order received', { tag: ['@pro', '@customer'] }, async () => {
        const orderKey = responseBody.order_key;
        await customer.storeSupport(orderId + ',' + orderKey, data.customer.getSupport, 'order-received');
    });

    test('customer can ask for store support for order', { tag: ['@pro', '@customer'] }, async () => {
        await customer.storeSupport(data.predefined.vendorStores.vendor1, { ...data.customer.getSupport, orderId: orderId }, 'store');
    });

    test('customer can view reference order number on support ticket', { tag: ['@pro', '@customer'] }, async () => {
        await customer.viewOrderReferenceNumberOnSupportTicket(supportTicketId, orderId);
    });

    test('customer can send message to support ticket', { tag: ['@pro', '@customer'] }, async () => {
        await customer.sendMessageToSupportTicket(supportTicketId, data.customer.supportTicket);
    });

    test("customer can't send message to closed support ticket", { tag: ['@pro', '@customer'] }, async () => {
        const [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID, order_id: orderId } });
        await customer.cantSendMessageToSupportTicket(supportTicketId);
    });

    test('guest customer need to login before asking for store support', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        guest = new StoreSupportsPage(page);
        await guest.storeSupport(data.predefined.vendorStores.vendor1, data.customer.getSupport, 'store');
    });
});

test.describe('Store Support test (vendor)', () => {
    let vendor: StoreSupportsPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    let supportTicketId: string;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new StoreSupportsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
    });

    test.afterAll(async () => {
        await vPage.close();
        await apiUtils.dispose();
    });

    // vendor

    test('vendor can view store support menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorStoreSupportRenderProperly();
    });

    test('vendor can view support ticket details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorViewSupportTicketDetails(supportTicketId);
    });

    test('vendor can filter support tickets by customer', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorFilterSupportTickets('by-customer', data.storeSupport.filter.byCustomer);
    });

    test('vendor can filter support tickets by date range', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorFilterSupportTickets('by-date', data.date.dateRange);
    });

    test('vendor can search support ticket by ticket id', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorSearchSupportTicket('id', supportTicketId);
    });

    test('vendor can search support ticket by ticket title', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorSearchSupportTicket('title', data.storeSupport.title);
    });

    test('vendor can reply to support ticket', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorReplySupportTicket(supportTicketId, data.storeSupport.chatReply.reply);
    });

    test('vendor can close support ticket', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorCloseSupportTicket(supportTicketId);
    });

    test('vendor can reopen closed support ticket', { tag: ['@pro', '@vendor'] }, async () => {
        const [, closedSupportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await vendor.vendorReopenSupportTicket(closedSupportTicketId);
    });

    test('vendor can close support ticket with a chat reply', { tag: ['@pro', '@vendor'] }, async () => {
        const [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await vendor.vendorCloseSupportTicketWithReply(supportTicketId, 'closing this ticket');
    });

    test('vendor can reopen closed support ticket with a chat reply', { tag: ['@pro', '@vendor'] }, async () => {
        const [, closedSupportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await vendor.vendorReopenSupportTicketWithReply(closedSupportTicketId, 'reopening this ticket');
    });
});
