import { test, Page } from '@playwright/test';
import { MyOrdersPage } from '@pages/myOrdersPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';
import { helpers } from '@utils/helpers';
// import { CUSTOMER_ID, PRODUCT_ID } from '@utils/data.json';

// const { CUSTOMER_ID, PRODUCT_ID } = data.env;
const { CUSTOMER_ID, PRODUCT_ID } = process.env;

// CUSTOMER_ID ? CUSTOMER_ID : (CUSTOMER_ID = helpers.readJsonData(data.envData, 'CUSTOMER_ID') );

console.log('CUSTOMER_ID---------------------------------------->', CUSTOMER_ID);
console.log('PRODUCT_ID---------------------------------------->', PRODUCT_ID);

test.describe('My orders functionality test', () => {
    let customer: MyOrdersPage;
    let cPage: Page;
    let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser, request }) => {
        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new MyOrdersPage(cPage);
        apiUtils = new ApiUtils(request);
    });

    test.afterAll(async () => {
        await cPage.close();
    });

    test('customer my orders page is rendering properly @lite', async () => {
        await customer.myOrdersRenderProperly();
    });

    test.only('customer can view order details @lite', async () => {
        console.log('CUSTOMER_ID---------------------------------------->', CUSTOMER_ID);
        console.log('PRODUCT_ID---------------------------------------->', PRODUCT_ID);

        const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
        await customer.viewOrderDetails(orderId);
    });

    test('customer can view order note @lite', async () => {
        const orderNote = data.orderNote.note();
        const [, orderId] = await apiUtils.createOrderNote(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, { ...payloads.createOrderNoteForCustomer, note: orderNote }, payloads.vendorAuth);
        await customer.viewOrderNote(orderId, orderNote);
    });

    test('customer can pay pending payment order @lite', async () => {
        const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.pending, payloads.vendorAuth);
        await customer.payPendingOrder(orderId, 'bank');
    });

    test('customer can cancel order @lite', async () => {
        const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.pending, payloads.vendorAuth);
        await customer.cancelPendingOrder(orderId);
    });

    test('customer can order again @lite', async () => {
        const [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.completed, payloads.vendorAuth);
        await customer.orderAgain(orderId);
    });
});
