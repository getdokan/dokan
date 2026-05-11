import { test, Page } from '@utils/test';
import { MyOrdersPage, api, payloads, testData } from './myOrdersPage';
import path from 'path';

const c2 = path.join(__dirname, '../../../playwright/.auth/customer2StorageState.json');

const { CUSTOMER2_ID, PRODUCT_ID } = process.env;

test.describe('My orders functionality test', () => {
    let customer: MyOrdersPage;
    let cPage: Page;

    test.beforeAll(async ({ browser }) => {
        const customerContext = await browser.newContext({ storageState: c2 });
        cPage = await customerContext.newPage();
        customer = new MyOrdersPage(cPage);
        await api.init();
    });

    test.afterAll(async () => {
        await cPage?.close();
        await api.dispose();
    });

    test('customer can view my orders page', { tag: ['@lite', '@customer'] }, async () => {
        await customer.myOrdersRenderProperly();
    });

    test('customer can view order details', { tag: ['@lite', '@customer'] }, async () => {
        const [, , orderId] = await api.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER2_ID }, testData.orderStatus.completed, payloads.vendorAuth);
        await customer.viewOrderDetails(orderId);
    });

    test('customer can view order note', { tag: ['@lite', '@customer'] }, async () => {
        const note = testData.orderNote();
        const [, orderId] = await api.createOrderNote(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER2_ID }, { ...payloads.createOrderNoteForCustomer, note }, payloads.vendorAuth);
        await customer.viewOrderNote(orderId, note);
    });

    test('customer can pay pending payment order', { tag: ['@lite', '@customer'] }, async () => {
        const [, , orderId] = await api.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER2_ID }, testData.orderStatus.pending, payloads.vendorAuth);
        await customer.payPendingOrder(orderId, 'bank');
    });

    test('customer can cancel order', { tag: ['@lite', '@customer'] }, async () => {
        const [, , orderId] = await api.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER2_ID }, testData.orderStatus.pending, payloads.vendorAuth);
        await customer.cancelPendingOrder(orderId);
    });

    test('customer can order again', { tag: ['@lite', '@customer'] }, async () => {
        const [, , orderId] = await api.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER2_ID }, testData.orderStatus.completed, payloads.vendorAuth);
        await customer.orderAgain(orderId);
    });
});
