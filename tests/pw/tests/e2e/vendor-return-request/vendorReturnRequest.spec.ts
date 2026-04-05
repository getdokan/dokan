import { test, Page } from '@playwright/test';
import { VendorReturnRequestPage, CustomerPage, OrdersPage, ApiUtils, data, payloads } from './vendorReturnRequestPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

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
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new VendorReturnRequestPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorReturnRequestPage(vPage);
        vendor1 = new OrdersPage(vPage);
        const customerContext = await browser.newContext({ storageState: c1 });
        cPage = await customerContext.newPage();
        customer = new VendorReturnRequestPage(cPage);
        customer1 = new CustomerPage(cPage);
        await customer1.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
        await customer1.goToCheckout();
        orderId = await customer1.paymentOrder();
        await vendor1.updateOrderStatusOnTable(orderId, 'processing');
        await customer.customerRequestWarranty(orderId, data.predefined.simpleProduct.product1.name, data.rma.requestWarranty);
        apiUtils = new ApiUtils(null);
    });

    test.afterAll(async () => {
        await apiUtils.activateModules(payloads.moduleIds.rma, payloads.adminAuth);
        await aPage?.close();
        await vPage?.close();
        await cPage?.close();
        await apiUtils?.dispose();
    });

    test('admin can RMA module', { tag: ['@pro', '@admin'] }, async () => { await admin.enableRmaModule(); });
    test('vendor can view return request menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorReturnRequestRenderProperly(); });
    test('vendor can view return request settings menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorRmaSettingsRenderProperly(); });
    test('vendor can view return request details', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorViewRmaDetails(orderId); });
    test('customer can send rma message', { tag: ['@pro', '@customer'] }, async () => { await customer.customerSendRmaMessage(orderId, 'test customer rma message'); });
    test('vendor can send rma message', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorSendRmaMessage(orderId, 'test vendor rma message'); });
    test('vendor can update rma status', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorUpdateRmaStatus(orderId, 'processing'); });
    test('vendor can rma refund', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorRmaRefund(orderId, data.predefined.simpleProduct.product1.name, 'processing'); });
    test('vendor can delete rma request', { tag: ['@pro', '@vendor'] }, async () => { await vendor.vendorDeleteRmaRequest(orderId); });
    test('customer can view return request menu page', { tag: ['@pro', '@exploratory', '@customer'] }, async () => { await customer.customerReturnRequestRenderProperly(); });

    test('customer can request warranty', { tag: ['@pro', '@customer'] }, async () => {
        await customer1.addProductToCartFromSingleProductPage(data.predefined.simpleProduct.product1.name);
        await customer1.goToCheckout();
        const orderId = await customer1.paymentOrder();
        await vendor1.updateOrderStatusOnTable(orderId, 'processing');
        await customer.customerRequestWarranty(orderId, data.predefined.simpleProduct.product1.name, data.rma.requestWarranty);
    });

    test.skip('admin can disable RMA module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.rma, payloads.adminAuth);
        await admin.disableRmaModule();
    });
});
