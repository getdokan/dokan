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
        await test.step('Activate store support module for admin', async () => {
            await apiUtils.activateModules(payloads.moduleIds.storeSupport, payloads.adminAuth);
        });

        await test.step('Create support ticket for testing', async () => {
            [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        });
    });

    test.afterAll(async () => {
        await test.step('Deactivate store support module and cleanup', async () => {
            await apiUtils.activateModules(payloads.moduleIds.storeSupport, payloads.adminAuth);
            await aPage.close();
            await apiUtils.dispose();
        });
    });

    test('admin can store support module', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Enable store support module for vendor', async () => {
            await admin.enableStoreSupportModule(data.predefined.vendorStores.vendor1);
        });
    });

    test('admin can view store support menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await test.step('Check store support menu renders properly', async () => {
            await admin.adminStoreSupportRenderProperly();
        });
    });

    test('unread count decrease after admin viewing a support ticket', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Verify unread count decreases when viewing ticket', async () => {
            await admin.decreaseUnreadSupportTicketCount(supportTicketId);
        });
    });

    test('admin can view support ticket details', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await test.step('View support ticket details', async () => {
            await admin.adminViewSupportTicketDetails(supportTicketId);
        });
    });

    test('admin can search support ticket by ticket id', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Search support ticket using ticket id', async () => {
            await admin.searchSupportTicket(supportTicketId);
        });
    });

    test('admin can search support ticket by ticket title', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Search support ticket using ticket title', async () => {
            await admin.searchSupportTicket(data.storeSupport.title);
        });
    });

    test('admin can filter support tickets by vendor', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Filter support tickets by vendor', async () => {
            await admin.filterSupportTickets(data.storeSupport.filter.byVendor, 'by-vendor');
        });
    });

    test('admin can filter support tickets by customer', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Filter support tickets by customer', async () => {
            await admin.filterSupportTickets(data.storeSupport.filter.byCustomer, 'by-customer');
        });
    });

    test('admin can reply to support ticket as admin', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Reply to support ticket as admin', async () => {
            await admin.replySupportTicket(supportTicketId, data.storeSupport.chatReply.asAdmin);
        });
    });

    test('admin can reply to support ticket as vendor', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Reply to support ticket as vendor', async () => {
            await admin.replySupportTicket(supportTicketId, data.storeSupport.chatReply.asVendor);
        });
    });

    test('admin can disable support ticket email notification', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Disable email notification for support ticket', async () => {
            await admin.updateSupportTicketEmailNotification(supportTicketId, 'disable');
        });
    });

    test('admin can enable support ticket email notification', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Create new support ticket to test email enable', async () => {
            [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
            await apiUtils.updateSupportTicketEmailNotification(supportTicketId, { notification: false }, payloads.adminAuth);
        });

        await test.step('Enable email notification for support ticket', async () => {
            await admin.updateSupportTicketEmailNotification(supportTicketId, 'enable');
        });
    });

    test('admin can close support ticket', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Close the support ticket', async () => {
            await admin.closeSupportTicket(supportTicketId);
        });
    });

    test('admin can reopen closed support ticket', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Create closed support ticket and reopen', async () => {
            const [, closedSupportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
            await admin.reopenSupportTicket(closedSupportTicketId);
        });
    });

    test('admin can perform bulk action on store support tickets', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Create support ticket and perform bulk close action', async () => {
            const [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
            await admin.storeSupportBulkAction('close', supportTicketId);
        });
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
        await test.step('Create completed order for customer', async () => {
            [, responseBody, orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
        });

        await test.step('Create support ticket for the order', async () => {
            [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID, order_id: orderId } });
        });
    });

    test.afterAll(async () => {
        await test.step('Close customer page and cleanup', async () => {
            await cPage.close();
            await apiUtils.dispose();
        });
    });

    test('customer can view store support menu page', { tag: ['@pro', '@exploratory', '@customer'] }, async () => {
        await test.step('Render store support menu properly', async () => {
            await customer.customerStoreSupportRenderProperly();
        });
    });

    test('customer can view support ticket details', { tag: ['@pro', '@exploratory', '@customer'] }, async () => {
        await test.step('View support ticket details', async () => {
            await customer.customerViewSupportTicketDetails(supportTicketId);
        });
    });

    test('customer can ask for store support on single product', { tag: ['@pro', '@customer'] }, async () => {
        await test.step('Request support for a single product', async () => {
            await customer.storeSupport(data.predefined.simpleProduct.product1.name, data.customer.getSupport, 'product');
        });
    });

    test('customer can ask for store support on single store', { tag: ['@pro', '@customer'] }, async () => {
        await test.step('Request support for a single store', async () => {
            await customer.storeSupport(data.predefined.vendorStores.vendor1, data.customer.getSupport, 'store');
        });
    });

    test('customer can ask for store support on order details', { tag: ['@pro', '@customer'] }, async () => {
        await test.step('Request support for an order', async () => {
            await customer.storeSupport(orderId, data.customer.getSupport, 'order');
        });
    });

    test('customer can ask for store support on order received', { tag: ['@pro', '@customer'] }, async () => {
        await test.step('Request support after order received', async () => {
            const orderKey = responseBody.order_key;
            await customer.storeSupport(orderId + ',' + orderKey, data.customer.getSupport, 'order-received');
        });
    });

    test('customer can ask for store support for order', { tag: ['@pro', '@customer'] }, async () => {
        await test.step('Request store support linked to an order', async () => {
            await customer.storeSupport(data.predefined.vendorStores.vendor1, { ...data.customer.getSupport, orderId: orderId }, 'store');
        });
    });

    test('customer can view reference order number on support ticket', { tag: ['@pro', '@customer'] }, async () => {
        await test.step('View reference order number on support ticket', async () => {
            await customer.viewOrderReferenceNumberOnSupportTicket(supportTicketId, orderId);
        });
    });

    test('customer can send message to support ticket', { tag: ['@pro', '@customer'] }, async () => {
        await test.step('Send message to support ticket', async () => {
            await customer.sendMessageToSupportTicket(supportTicketId, data.customer.supportTicket);
        });
    });

    test("customer can't send message to closed support ticket", { tag: ['@pro', '@customer'] }, async () => {
        await test.step('Create closed support ticket and verify message cannot be sent', async () => {
            const [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID, order_id: orderId } });
            await customer.cantSendMessageToSupportTicket(supportTicketId);
        });
    });

    test('guest customer need to login before asking for store support', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        guest = new StoreSupportsPage(page);
        await test.step('Guest tries to request store support and is prompted to login', async () => {
            await guest.storeSupport(data.predefined.vendorStores.vendor1, data.customer.getSupport, 'store');
        });
    });
});

test.describe('Store Support test (vendor)', () => {
    let admin: StoreSupportsPage;
    let vendor: StoreSupportsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let supportTicketId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new StoreSupportsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new StoreSupportsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());

        await test.step('Create support tickets for vendor testing', async () => {
            [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
            await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        });
    });

    test.afterAll(async () => {
        await test.step('Deactivate store support module and cleanup', async () => {
            await apiUtils.activateModules(payloads.moduleIds.storeSupport, payloads.adminAuth);
            await vPage.close();
            await apiUtils.dispose();
        });
    });

    test('vendor can view store support menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await test.step('Render vendor store support menu properly', async () => {
            await vendor.vendorStoreSupportRenderProperly();
        });
    });

    test('vendor can view support ticket details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await test.step('View vendor support ticket details', async () => {
            await vendor.vendorViewSupportTicketDetails(supportTicketId);
        });
    });

    test('vendor can filter support tickets by customer', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Filter support tickets by customer', async () => {
            await vendor.vendorFilterSupportTickets('by-customer', data.storeSupport.filter.byCustomer);
        });
    });

    test('vendor can filter support tickets by date range', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Filter support tickets by date range', async () => {
            await vendor.vendorFilterSupportTickets('by-date', data.date.dateRange);
        });
    });

    test('vendor can search support ticket by ticket id', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Search support ticket using ticket id', async () => {
            await vendor.vendorSearchSupportTicket(supportTicketId);
        });
    });

    test('vendor can search support ticket by ticket title', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Search support ticket using ticket title', async () => {
            await vendor.vendorSearchSupportTicket(data.storeSupport.title);
        });
    });

    test('vendor can reply to support ticket', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Reply to support ticket', async () => {
            await vendor.vendorReplySupportTicket(supportTicketId, data.storeSupport.chatReply.reply);
        });
    });

    test('vendor can close support ticket', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Close support ticket', async () => {
            await vendor.vendorCloseSupportTicket(supportTicketId);
        });
    });

    test('vendor can reopen closed support ticket', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Reopen closed support ticket', async () => {
            const [, closedSupportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
            await vendor.vendorReopenSupportTicket(closedSupportTicketId);
        });
    });

    test('vendor can close support ticket with a chat reply', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Close support ticket with reply', async () => {
            const [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
            await vendor.vendorCloseSupportTicketWithReply(supportTicketId, 'closing this ticket');
        });
    });

    test('vendor can reopen closed support ticket with a chat reply', { tag: ['@pro', '@vendor'] }, async () => {
        await test.step('Reopen closed support ticket with reply', async () => {
            const [, closedSupportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
            await vendor.vendorReopenSupportTicketWithReply(closedSupportTicketId, 'reopening this ticket');
        });
    });

    test('admin can disable store support module', { tag: ['@pro', '@admin'] }, async () => {
        await test.step('Deactivate store support module for vendor', async () => {
            await apiUtils.deactivateModules(payloads.moduleIds.storeSupport, payloads.adminAuth);
            await admin.disableStoreSupportModule(data.predefined.vendorStores.vendor1);
        });
    });
});
