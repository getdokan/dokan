import { test, request, Page } from '@playwright/test';
import { OrdersPage } from '@pages/ordersPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';

const { DOKAN_PRO, CUSTOMER_ID, PRODUCT_ID } = process.env;

test.describe('Order functionality test', () => {
    let vendor: OrdersPage;
    let vPage: Page;
    let apiUtils: ApiUtils;
    let orderId: string;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new OrdersPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.onhold, payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await vPage.close();
        await apiUtils.dispose();
    });

    // orders

    test('vendor can view order menu page', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorOrdersRenderProperly();
    });

    test('vendor can export all orders', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.exportOrders('all');
    });

    test('vendor can export filtered orders', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.filterOrders('by-customer', data.customer.username);
        await vendor.exportOrders('filtered');
    });

    test('vendor can search order', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.searchOrder(orderId);
    });

    test('vendor can filter orders by customer', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.filterOrders('by-customer', data.customer.username);
    });

    test('vendor can filter orders by date range', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.filterOrders('by-date', data.date.dateRange);
    });

    test('vendor can view order details', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.viewOrderDetails(orderId);
    });

    test('vendor can update order status on order table', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.updateOrderStatusOnTable(orderId, data.order.orderStatus.processing);
    });

    test('vendor can update order status on order details', { tag: ['@lite', '@vendor'] }, async () => {
        [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.onhold, payloads.vendorAuth);
        await vendor.updateOrderStatus(orderId, data.order.orderStatus.completed);
    });

    test('vendor can add order note', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addOrderNote(orderId, data.orderNote.customer);
    });

    test('vendor can add private order note', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.addOrderNote(orderId, data.orderNote.private);
    });

    test('vendor can add tracking details to order', { tag: ['@lite', '@vendor'] }, async () => {
        DOKAN_PRO && (await dbUtils.setDokanSettings(dbData.dokan.optionName.shippingStatus, { ...dbData.dokan.shippingStatusSettings, enabled: 'off' }));
        await vendor.addTrackingDetails(orderId, data.orderTrackingDetails);
        DOKAN_PRO && (await dbUtils.setDokanSettings(dbData.dokan.optionName.shippingStatus, { ...dbData.dokan.shippingStatusSettings, enabled: 'on' }));
    });

    test('vendor can add shipment to order', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addShipment(orderId, data.orderShipmentDetails);
    });

    test.skip('vendor can add downloadable product permission to order', { tag: ['@lite', '@vendor'] }, async () => {
        const [, , downloadableProductName] = await apiUtils.createProduct(payloads.createDownloadableProduct(), payloads.vendorAuth);
        await vendor.addDownloadableProduct(orderId, downloadableProductName);
        await vendor.removeDownloadableProduct(orderId, downloadableProductName);
    });

    test('vendor can perform bulk action on orders', { tag: ['@lite', '@vendor'] }, async () => {
        await vendor.orderBulkAction('completed', orderId);
    });
});
