import { Page, expect, test } from '@utils/test';
import { StoreSupportsPage, ApiUtils, data, payloads, responseBody } from './storeSupportsPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');
const { VENDOR_ID, CUSTOMER_ID, PRODUCT_ID } = process.env;

test.describe('Store Support test (admin)', () => {
    let admin: StoreSupportsPage;
    let aPage: Page;
    let apiUtils: ApiUtils;
    let supportTicketId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new StoreSupportsPage(aPage);
        apiUtils = new ApiUtils(null);
        await apiUtils.activateModules(payloads.moduleIds.storeSupport, payloads.adminAuth);
        [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.storeSupport, payloads.adminAuth);
        await aPage?.close();
        await apiUtils.dispose();
    });

    test('admin can store support module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableStoreSupportModule(data.predefined.vendorStores.vendor1); });
    test('admin can view store support menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminStoreSupportRenderProperly(); });
    test('unread count decrease after admin viewing a support ticket', { tag: ['@pro', '@admin'] }, async () => { await admin.decreaseUnreadSupportTicketCount(supportTicketId); });
    test('admin can view support ticket details', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminViewSupportTicketDetails(supportTicketId); });
    test('admin can search support ticket by ticket id', { tag: ['@pro', '@admin'] }, async () => { await admin.searchSupportTicket(supportTicketId); });
    test('admin can search support ticket by ticket title', { tag: ['@pro', '@admin'] }, async () => { await admin.searchSupportTicket(data.storeSupport.title); });
    test('admin can filter support tickets by vendor', { tag: ['@pro', '@admin'] }, async () => { await admin.filterSupportTickets(data.storeSupport.filter.byVendor, 'by-vendor'); });
    test('admin can filter support tickets by customer', { tag: ['@pro', '@admin'] }, async () => { await admin.filterSupportTickets(data.storeSupport.filter.byCustomer, 'by-customer'); });
    test('admin can reply to support ticket as admin', { tag: ['@pro', '@admin'] }, async () => { await admin.replySupportTicket(supportTicketId, data.storeSupport.chatReply.asAdmin); });
    test('admin can reply to support ticket as vendor', { tag: ['@pro', '@admin'] }, async () => { await admin.replySupportTicket(supportTicketId, data.storeSupport.chatReply.asVendor); });
    test('admin can disable support ticket email notification', { tag: ['@pro', '@admin'] }, async () => { await admin.updateSupportTicketEmailNotification(supportTicketId, 'disable'); });

    test('admin can enable support ticket email notification', { tag: ['@pro', '@admin'] }, async () => {
        const [, newId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await apiUtils.updateSupportTicketEmailNotification(newId, { notification: false }, payloads.adminAuth);
        await admin.updateSupportTicketEmailNotification(newId, 'enable');
    });

    test('admin can close support ticket', { tag: ['@pro', '@admin'] }, async () => { await admin.closeSupportTicket(supportTicketId); });

    test('admin can reopen closed support ticket', { tag: ['@pro', '@admin'] }, async () => {
        const [, closedId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await admin.reopenSupportTicket(closedId);
    });

    test('admin can perform bulk action on store support tickets', { tag: ['@pro', '@admin'] }, async () => {
        const [, newId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await admin.storeSupportBulkAction('close', newId);
    });
});

test.describe('Store Support test (customer)', () => {
    let customer: StoreSupportsPage;
    let guest: StoreSupportsPage;
    let cPage: Page;
    let apiUtils: ApiUtils;
    let orderId: string;
    let rBody: responseBody;
    let supportTicketId: string;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new StoreSupportsPage(cPage);
        apiUtils = new ApiUtils(null);
        [, rBody, orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
        [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID, order_id: orderId } });
    });

    test.afterAll(async () => { await cPage?.close(); await apiUtils.dispose(); });

    test('customer can view store support menu page', { tag: ['@pro', '@exploratory', '@customer'] }, async () => { await customer.customerStoreSupportRenderProperly(); });
    test('customer can view support ticket details', { tag: ['@pro', '@exploratory', '@customer'] }, async () => { await customer.customerViewSupportTicketDetails(supportTicketId); });
    test('customer can ask for store support on single product', { tag: ['@pro', '@customer'] }, async () => { await customer.storeSupport(data.predefined.simpleProduct.product1.name, data.customer.getSupport, 'product'); });
    test('customer can ask for store support on single store', { tag: ['@pro', '@customer'] }, async () => { await customer.storeSupport(data.predefined.vendorStores.vendor1, data.customer.getSupport, 'store'); });
    test('customer can ask for store support on order details', { tag: ['@pro', '@customer'] }, async () => { await customer.storeSupport(orderId, data.customer.getSupport, 'order'); });

    test('customer can ask for store support on order received', { tag: ['@pro', '@customer'] }, async () => {
        const orderKey = rBody.order_key;
        await customer.storeSupport(orderId + ',' + orderKey, data.customer.getSupport, 'order-received');
    });

    test('customer can ask for store support for order', { tag: ['@pro', '@customer'] }, async () => { await customer.storeSupport(data.predefined.vendorStores.vendor1, { ...data.customer.getSupport, orderId: orderId }, 'store'); });
    test('customer can view reference order number on support ticket', { tag: ['@pro', '@customer'] }, async () => { await customer.viewOrderReferenceNumberOnSupportTicket(supportTicketId, orderId); });
    test('customer can send message to support ticket', { tag: ['@pro', '@customer'] }, async () => { await customer.sendMessageToSupportTicket(supportTicketId, data.customer.supportTicket); });

    test("customer can't send message to closed support ticket", { tag: ['@pro', '@customer'] }, async () => {
        const [, closedId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID, order_id: orderId } });
        await customer.cantSendMessageToSupportTicket(closedId);
    });

    test('guest customer need to login before asking for store support', { tag: ['@pro', '@guest'] }, async ({ page }) => {
        guest = new StoreSupportsPage(page);
        await guest.storeSupport(data.predefined.vendorStores.vendor1, data.customer.getSupport, 'store');
    });
});

test.describe('Store Support test (vendor)', () => {
    let admin: StoreSupportsPage;
    let vendor: StoreSupportsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let supportTicketId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new StoreSupportsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new StoreSupportsPage(vPage);
        apiUtils = new ApiUtils(null);
        // The legacy /dashboard/support vendor screen only renders when the module is active.
        await apiUtils.activateModules(payloads.moduleIds.storeSupport, payloads.adminAuth);
        [, supportTicketId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
        await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.storeSupport, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await apiUtils.dispose();
    });

    // Revived: these drive the classic PHP/Vue `/dashboard/support` screen for real (legacy regression); vendor page methods + selectors are implemented, admin/customer stay vacuous stubs.
    test.describe('vendor cases — legacy /dashboard/support regression', () => {
        test('vendor can view store support menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorStoreSupportRenderProperly(); });
        test('vendor can view support ticket details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorViewSupportTicketDetails(supportTicketId); });
        test('vendor can filter support tickets by customer', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorFilterSupportTickets('by-customer', data.storeSupport.filter.byCustomer); });
        test('vendor can filter support tickets by date range', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorFilterSupportTickets('by-date', data.date.dateRange); });
        test('vendor can search support ticket by ticket id', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorSearchSupportTicket(supportTicketId); });
        test('vendor can search support ticket by ticket title', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorSearchSupportTicket(data.storeSupport.title); });
        test('vendor can reply to support ticket', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorReplySupportTicket(supportTicketId, data.storeSupport.chatReply.reply); });
        test('vendor can close support ticket', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorCloseSupportTicket(supportTicketId); });

        test('vendor can reopen closed support ticket', { tag: ['@pro', '@vendor'] }, async () => {
            const [, closedId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
            await vendor.vendorReopenSupportTicket(closedId);
        });

        test('vendor can close support ticket with a chat reply', { tag: ['@pro', '@vendor'] }, async () => {
            const [, newId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
            await vendor.vendorCloseSupportTicketWithReply(newId, 'closing this ticket');
        });

        test('vendor can reopen closed support ticket with a chat reply', { tag: ['@pro', '@vendor'] }, async () => {
            const [, closedId] = await apiUtils.createSupportTicket({ ...payloads.createSupportTicket, status: 'closed', author: CUSTOMER_ID, meta: { store_id: VENDOR_ID } });
            await vendor.vendorReopenSupportTicketWithReply(closedId, 'reopening this ticket');
        });
    });

    test('admin can disable store support module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.storeSupport, payloads.adminAuth);
        await admin.disableStoreSupportModule(data.predefined.vendorStores.vendor1);
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Store Supports (React) Tests @pro', () => {
    // Retired (D4): render-only vendor smoke on the LEGACY /dashboard/support/
    // URL. Real behavioral parity lives in tests/e2e/store-supports/.
    test.skip('Test Case 1 - Vendor support page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/support/`));
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    // Retired (D4): superseded by store-supports/ list coverage.
    test.skip('Test Case 2 - Vendor support shows tickets table or empty state', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/support/`));
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });
        const tableVisible = await page.locator('table, [role="table"]').first().isVisible({ timeout: 3000 }).catch(() => false);
        const emptyVisible = await page.locator("text=/no tickets|no support|nothing/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(tableVisible || emptyVisible).toBe(true);
        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Admin support page renders', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/admin-store-support`));
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#dokan-admin-dashboard .pui-root').first()).toBeVisible({ timeout: 30_000 });
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    // Retired (D4): superseded by the HashRouter-reload test in store-supports/.
    test.skip('Test Case 4 - Vendor support page survives reload', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/support/`));
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });
        const fatal = await page.locator("text=/Fatal error|Parse error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});

