import { test, request, Page } from '@playwright/test';
import { MyOrdersPage } from '@pages/myOrdersPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

const { CUSTOMER_ID, PRODUCT_ID } = process.env;

test.describe('My orders functionality test', () => {
    let customer: MyOrdersPage;
    let cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new MyOrdersPage(cPage);
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await cPage.close();
        await apiUtils.dispose();
    });

    test('customer my orders page is rendering properly @lite @c', async () => {
        await customer.myOrdersRenderProperly();
    });

    test('customer can view order details @lite @c', async () => {
        const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
        await customer.viewOrderDetails(orderId);
    });

    test('customer can view order note @lite @c', async () => {
        const orderNote = data.orderNote.note();
        const [, orderId] = await apiUtils.createOrderNote(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, { ...payloads.createOrderNoteForCustomer, note: orderNote }, payloads.vendorAuth);
        await customer.viewOrderNote(orderId, orderNote);
    });

    test('customer can pay pending payment order @lite @c', async () => {
        const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.pending, payloads.vendorAuth);
        await customer.payPendingOrder(orderId, 'bank');
    });

    test('customer can cancel order @lite @c', async () => {
        const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.pending, payloads.vendorAuth);
        await customer.cancelPendingOrder(orderId);
    });

    test.skip('customer can order again @lite @c', async () => {
        const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
        await customer.orderAgain(orderId);
    });
});
