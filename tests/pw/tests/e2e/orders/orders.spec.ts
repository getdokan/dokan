import { test, request } from '@playwright/test';
import { OrdersPage } from './ordersPage';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json'); // Vendor session storage

// ============================================
// TEST SETUP
// ============================================

const { DOKAN_PRO } = process.env;

test.describe('Order functionality test @lite', () => {
    let orderId: string;

    test.beforeAll(async () => {
        orderId = await OrdersPage.createTestOrder(await request.newContext());
    });

    // ============================================
    // TEST CASES
    // ============================================

    test('vendor can view order menu page', { tag: ['@lite', '@exploratory', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.vendorOrdersRenderProperly();
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can export all orders', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.exportOrders('all');
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can export filtered orders', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.filterOrders('by-customer', ordersPage.testData.customer.username);
        await ordersPage.exportOrders('filtered');
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can search order', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.searchOrder(orderId);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can filter orders by customer', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.filterOrders('by-customer', ordersPage.testData.customer.username);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can filter orders by date range', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.filterOrders('by-date', ordersPage.testData.date.dateRange);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test.skip('vendor can view order details', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.viewOrderDetails(orderId);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can update order status on order table', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.updateOrderStatusOnTable(orderId, ordersPage.testData.order.orderStatus.processing);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test.skip('vendor can update order status on order details', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const freshOrderId = await OrdersPage.createTestOrder(await request.newContext());
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.updateOrderStatus(freshOrderId, ordersPage.testData.order.orderStatus.completed);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can add order note', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.addOrderNote(orderId, ordersPage.testData.orderNote.customer);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can add private order note', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.addOrderNote(orderId, ordersPage.testData.orderNote.private);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can add tracking details to order', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        if (DOKAN_PRO) {
            await OrdersPage.disableShippingStatus();
            await ordersPage.addTrackingDetails(orderId, ordersPage.testData.orderTrackingDetails);
            await OrdersPage.enableShippingStatus();
        } else {
            await ordersPage.addTrackingDetails(orderId, ordersPage.testData.orderTrackingDetails);
        }
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can add shipment to order', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.addShipment(orderId, ordersPage.testData.orderShipmentDetails);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test.skip('vendor can add downloadable product permission to order', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const downloadableProductName = await OrdersPage.createDownloadableProduct(await request.newContext());
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.addDownloadableProduct(orderId, downloadableProductName);
        await ordersPage.removeDownloadableProduct(orderId, downloadableProductName);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('vendor can perform bulk action on orders', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: v1 });
        const page = await context.newPage();
        const ordersPage = new OrdersPage(page);
        await ordersPage.orderBulkAction('completed', orderId);
        await ordersPage.waitForPageReady();
        await page.close();
        await context.close();
    });
});
