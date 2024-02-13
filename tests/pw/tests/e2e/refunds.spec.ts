import { test, request, Page, APIResponse } from '@playwright/test';
import { RefundsPage } from '@pages/refundsPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { CUSTOMER_ID, PRODUCT_ID } = process.env;

test.describe('Refunds test', () => {
    let admin: RefundsPage;
    let vendor: RefundsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let orderResponseBody: APIResponse;
    let orderId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new RefundsPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new RefundsPage(vPage);

        apiUtils = new ApiUtils(await request.newContext());
        [, orderResponseBody, orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, payloads.createOrder, data.order.orderStatus.processing, payloads.vendorAuth);
        await dbUtils.createRefund(orderResponseBody);
    });

    test.afterAll(async () => {
        await aPage.close();
        await apiUtils.dispose();
    });

    test('admin refunds menu page is rendering properly @pro @exp @a', async () => {
        await admin.adminRefundRequestsRenderProperly();
    });

    test('admin can search refund requests @pro @a', async () => {
        await admin.searchRefundRequests(orderId);
        // await admin.searchRefundRequests(data.predefined.vendorStores.vendor1);
    });

    test('admin can approve refund request @pro @a', async () => {
        await admin.updateRefundRequests(orderId, 'approve');
    });

    test('admin can cancel refund requests @pro @a', async () => {
        const [, orderResponseBody, orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, payloads.createOrder, data.order.orderStatus.processing, payloads.vendorAuth);
        await dbUtils.createRefund(orderResponseBody);
        await admin.updateRefundRequests(orderId, 'cancel');
    });

    test('admin can perform refund requests bulk actions @pro @a', async () => {
        const [, orderResponseBody, ,] = await apiUtils.createOrderWithStatus(PRODUCT_ID, payloads.createOrder, data.order.orderStatus.processing, payloads.vendorAuth);
        await dbUtils.createRefund(orderResponseBody);
        await admin.refundRequestsBulkAction('completed');
    });

    test('vendor can full refund @pro @v', async () => {
        const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
        await vendor.refundOrder(orderId, data.predefined.simpleProduct.product1.name);
    });

    test('vendor can partial refund @pro @v', async () => {
        const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
        await vendor.refundOrder(orderId, data.predefined.simpleProduct.product1.name, true);
    });
});
