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
    let closedSupportTicketId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new StoreSupportsPage(aPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        [, closedSupportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    test('dokan store support menu page is rendering properly @pro @explo', async () => {
        await admin.adminStoreSupportRenderProperly();
    });

    test('unread count decrease after admin viewing a support ticket @pro', async () => {
        await admin.decreaseUnreadSupportTicketCount(supportTicketId);
    });

    test('admin can view support ticket details @pro @explo', async () => {
        await admin.adminViewSupportTicketDetails(supportTicketId);
    });

    test('admin can search support ticket @pro', async () => {
        await admin.searchSupportTicket(supportTicketId);
        // await admin.searchSupportTicket(data.storeSupport.title); // todo:
    });

    test('admin can filter support tickets by vendor @pro', async () => {
        await admin.filterSupportTickets(data.storeSupport.filter.byVendor, 'by-vendor');
    });

    test('admin can filter support tickets by customer @pro', async () => {
        await admin.filterSupportTickets(data.storeSupport.filter.byCustomer, 'by-customer');
    });

    test('admin can reply to support ticket as admin @pro', async () => {
        await admin.replySupportTicket(supportTicketId, data.storeSupport.chatReply.asAdmin);
    });

    test('admin can reply to support ticket as vendor @pro', async () => {
        await admin.replySupportTicket(supportTicketId, data.storeSupport.chatReply.asVendor);
    });

    test('admin can disable support ticket email notification @pro', async () => {
        // await apiUtils.updateSupportTicketEmailNotification(supportTicketId, { notification: true, }, payloads.adminAuth);
        await admin.updateSupportTicketEmailNotification(supportTicketId, 'disable');
    });

    test('admin can enable support ticket email notification @pro', async () => {
        await apiUtils.updateSupportTicketEmailNotification(supportTicketId, { notification: false }, payloads.adminAuth);
        await admin.updateSupportTicketEmailNotification(supportTicketId, 'enable');
    });

    test('admin can close support ticket @pro', async () => {
        await admin.closeSupportTicket(supportTicketId);
    });

    test('admin can reopen closed support ticket @pro', async () => {
        await admin.reopenSupportTicket(closedSupportTicketId);
    });

    test('admin can perform store support bulk action @pro', async () => {
        const [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await admin.storeSupportBulkAction('close', supportTicketId);
    });
});

test.describe('Store Support test (customer)', () => {
    let customer: StoreSupportsPage;
    let guest: StoreSupportsPage;
    let cPage: Page, gPage: Page;
    let apiUtils: ApiUtils;
    let orderId: string;
    let responseBody: responseBody;
    let supportTicketId: string;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new StoreSupportsPage(cPage);

        const guestContext = await browser.newContext(data.auth.noAuth);
        gPage = await guestContext.newPage();
        guest = new StoreSupportsPage(gPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, responseBody, orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
        [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID, order_id: orderId } });
    });

    test.afterAll(async () => {
        await cPage.close();
        await gPage.close();
        await apiUtils.dispose();
    });

    test('customer store support menu page is rendering properly @pro @explo', async () => {
        await customer.customerStoreSupportRenderProperly();
    });

    test('customer can view support ticket details @pro @explo', async () => {
        await customer.customerViewSupportTicketDetails(supportTicketId);
    });

    test('customer can ask for store support on single product @pro', async () => {
        await customer.storeSupport(data.predefined.simpleProduct.product1.name, data.customer.getSupport, 'product');
    });

    test('customer can ask for store support on single store @pro', async () => {
        await customer.storeSupport(data.predefined.vendorStores.vendor1, data.customer.getSupport, 'store');
    });

    test('customer can ask for store support on order details @pro', async () => {
        await customer.storeSupport(orderId, data.customer.getSupport, 'order');
    });

    test('customer can ask for store support on order received @pro', async () => {
        const orderKey = responseBody.order_key;
        await customer.storeSupport(orderId + ',' + orderKey, data.customer.getSupport, 'order-received');
    });

    test('customer can ask for store support for order @pro', async () => {
        await customer.storeSupport(data.predefined.vendorStores.vendor1, { ...data.customer.getSupport, orderId: orderId }, 'store');
    });

    test('customer can view reference order number on support ticket @pro', async () => {
        await customer.viewOrderReferenceNumberOnSupportTicket(supportTicketId, orderId);
    });

    test('customer can send message to support ticket @pro', async () => {
        await customer.sendMessageToSupportTicket(supportTicketId, data.customer.supportTicket);
    });

    test("customer can't send message to closed support ticket @pro", async () => {
        const [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID, order_id: orderId } });
        await customer.cantSendMessageToSupportTicket(supportTicketId);
    });

    test('guest customer need to login before asking for store support @pro', async () => {
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

    test('vendor store support menu page is rendering properly @pro @explo', async () => {
        await vendor.vendorStoreSupportRenderProperly();
    });

    test('vendor can view support ticket details @pro @explo', async () => {
        await vendor.vendorViewSupportTicketDetails(supportTicketId);
    });

    test('vendor can filter support tickets by customer @pro', async () => {
        await vendor.vendorFilterSupportTickets('by-customer', data.storeSupport.filter.byCustomer);
    });

    test('vendor can filter support tickets by date range @pro', async () => {
        await vendor.vendorFilterSupportTickets('by-date', data.date.dateRange);
    });

    test('vendor can search support ticket @pro', async () => {
        await vendor.vendorSearchSupportTicket('id', supportTicketId);
        // await vendor.vendorSearchSupportTicket('title', data.storeSupport.title); // todo: separate or in same test
    });

    test('vendor can reply to support ticket @pro', async () => {
        await vendor.vendorReplySupportTicket(supportTicketId, data.storeSupport.chatReply.reply);
    });

    test('vendor can close support ticket @pro', async () => {
        await vendor.vendorCloseSupportTicket(supportTicketId);
    });

    test('vendor can reopen closed support ticket @pro', async () => {
        const [, closedSupportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await vendor.vendorReopenSupportTicket(closedSupportTicketId);
    });

    test('vendor can close support ticket with a chat reply @pro', async () => {
        const [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await vendor.vendorCloseSupportTicketWithReply(supportTicketId, 'closing this ticket');
    });

    test('vendor can reopen closed support ticket with a chat reply @pro', async () => {
        const [, closedSupportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await vendor.vendorReopenSupportTicketWithReply(closedSupportTicketId, 'reopening this ticket');
    });
});
