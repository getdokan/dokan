import { test, Page, request } from '@playwright/test';
import { VendorReturnRequestPage } from '@pages/vendorReturnRequestPage';
import { CustomerPage } from '@pages/customerPage';
import { OrdersPage } from '@pages/ordersPage';
import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
import { payloads } from '@utils/payloads';

// const { CUSTOMER_ID, PRODUCT_ID } = process.env;

test.describe.skip('Vendor RMA test', () => {
    let admin: VendorReturnRequestPage;
    let vendor: VendorReturnRequestPage;
    let vendor1: OrdersPage;
    let customer: VendorReturnRequestPage;
    let customer1: CustomerPage;
    let aPage: Page, vPage: Page, cPage: Page;
    let apiUtils: ApiUtils;
    let orderId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new VendorReturnRequestPage(aPage);

        const vendorContext = await browser.newContext(data.auth.vendorAuth);
        vPage = await vendorContext.newPage();
        vendor = new VendorReturnRequestPage(vPage);
        vendor1 = new OrdersPage(vPage);

        const customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new VendorReturnRequestPage(cPage);
        customer1 = new CustomerPage(cPage);

        // todo: implement via api
        await customer1.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
        await customer1.goToCheckout();
        orderId = await customer1.paymentOrder();
        await vendor1.updateOrderStatusOnTable(orderId, 'processing');
        await customer.customerRequestWarranty(orderId, data.predefined.simpleProduct.product1.name, data.rma.requestWarranty);

        apiUtils = new ApiUtils(await request.newContext());

        // [,, orderId, ] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.processing, payloads.vendorAuth);
        // [,, orderId, ] = await apiUtils.createOrderWithStatus(payloads.createProduct(), { ...payloads.createOrder, customer_id: CUSTOMER_ID }, data.order.orderStatus.processing, payloads.vendorAuth);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.rma, payloads.adminAuth);
        await aPage.close();
        await vPage.close();
        await cPage.close();
        await apiUtils.dispose();
    });

    test.only('admin can RMA module', { tag: ['@pro', '@admin'] }, async () => {
        await admin.enableRmaModule();
    });

    //vendor

    test('vendor can view return request menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorReturnRequestRenderProperly();
    });

    test('vendor can view return request details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorViewRmaDetails(orderId);
    });

    test('customer can send rma message', { tag: ['@pro', '@customer'] }, async () => {
        await customer.customerSendRmaMessage(orderId, 'test customer rma message');
    });

    test('vendor can send rma message', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: depends on customer can request warranty, remove dependency
        await vendor.vendorSendRmaMessage(orderId, 'test vendor rma message');
    });

    test('vendor can update rma status', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorUpdateRmaStatus(orderId, 'processing');
    });

    test('vendor can rma refund', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.vendorRmaRefund(orderId, data.predefined.simpleProduct.product1.name, 'processing');
    });

    test('vendor can delete rma request', { tag: ['@pro', '@vendor'] }, async () => {
        // todo: need separate rma request
        await vendor.vendorDeleteRmaRequest(orderId);
    });

    // customer

    test('customer can view return request menu page', { tag: ['@pro', '@exploratory', '@customer'] }, async () => {
        await customer.customerReturnRequestRenderProperly();
    });

    test('customer can request warranty', { tag: ['@pro', '@customer'] }, async () => {
        await customer1.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
        await customer1.goToCheckout();
        const orderId = await customer1.paymentOrder();
        await vendor1.updateOrderStatusOnTable(orderId, 'processing');
        await customer.customerRequestWarranty(orderId, data.predefined.simpleProduct.product1.name, data.rma.requestWarranty);
    });

    // admin

    test.only('admin can disable RMA module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.printful, payloads.adminAuth);
        await admin.disableRmaModule();
    });
});
