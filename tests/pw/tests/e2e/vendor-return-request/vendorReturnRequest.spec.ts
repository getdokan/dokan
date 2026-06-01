import { Page, expect, test } from '@utils/test';
import { VendorReturnRequestPage, CustomerPage, OrdersPage, ApiUtils, data, payloads } from './vendorReturnRequestPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

// KEEP SKIPPED: RMA (Pro-only) module flow; page-object methods are all empty stubs (no real implementation).
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

    // KEEP SKIPPED: RMA disable flow backed by stub ApiUtils/page-object methods (no real implementation).
    test.skip('admin can disable RMA module', { tag: ['@pro', '@admin'] }, async () => {
        await apiUtils.deactivateModules(payloads.moduleIds.rma, payloads.adminAuth);
        await admin.disableRmaModule();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Return Request (React) Tests @pro', () => {
    test('Test Case 1 - Return request page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/return-request/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Return request page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/return-request/`));
        await page.waitForLoadState('domcontentloaded');
        await expect
            .poll(async () => (await page.locator('body').innerText()).trim().length, {
                timeout: 30_000,
                intervals: [500, 1000, 2000, 3000],
            })
            .toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

