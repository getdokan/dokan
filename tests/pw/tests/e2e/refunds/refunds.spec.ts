import { test, Page } from '@playwright/test';
import { RefundsPage, ApiUtils, data, dbUtils, payloads } from './refundsPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

const { CUSTOMER_ID, PRODUCT_ID } = process.env;

test.describe('Refunds test', () => {
    let admin: RefundsPage;
    let vendor: RefundsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let orderResponseBody: any;
    let orderId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new RefundsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new RefundsPage(vPage);
        apiUtils = new ApiUtils(null);
        [, orderResponseBody, orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, payloads.createOrder, data.order.orderStatus.processing, payloads.vendorAuth);
        await dbUtils.createRefundRequest(orderResponseBody);
    });

    test.afterAll(async () => {
        await aPage?.close();
        await vPage?.close();
        await apiUtils.dispose();
    });

    test('admin can view refunds menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminRefundRequestsRenderProperly(); });
    test('admin can search refund requests by order-id', { tag: ['@pro', '@admin'] }, async () => { await admin.searchRefundRequests(orderId); });
    test('admin can search refund requests by vendor', { tag: ['@pro', '@admin'] }, async () => { await admin.searchRefundRequests(data.predefined.vendorStores.vendor1); });
    test('admin can approve refund request', { tag: ['@pro', '@admin'] }, async () => { await admin.updateRefundRequests(orderId, 'approve'); });

    test('admin can cancel refund requests', { tag: ['@pro', '@admin'] }, async () => {
        const [, orb, oid] = await apiUtils.createOrderWithStatus(PRODUCT_ID, payloads.createOrder, data.order.orderStatus.processing, payloads.vendorAuth);
        await dbUtils.createRefundRequest(orb);
        await admin.updateRefundRequests(oid, 'cancel');
    });

    test('admin can perform bulk action on refund requests', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        const [, orb] = await apiUtils.createOrderWithStatus(PRODUCT_ID, payloads.createOrder, data.order.orderStatus.processing, payloads.vendorAuth);
        await dbUtils.createRefundRequest(orb);
        await admin.refundRequestsBulkAction('completed');
    });

    test('vendor can full refund', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , oid] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
        await vendor.refundOrder(oid, data.predefined.simpleProduct.product1.name);
    });

    test('vendor can partial refund', { tag: ['@pro', '@vendor'] }, async () => {
        const [, , oid] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
        await vendor.refundOrder(oid, data.predefined.simpleProduct.product1.name, true);
    });
});
