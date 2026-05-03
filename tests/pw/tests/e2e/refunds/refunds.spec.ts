import { Page, expect, test } from '@playwright/test';
import { RefundsPage, ApiUtils, data, dbUtils, payloads } from './refundsPage';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:9999';

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

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Admin Refunds (React) Tests @pro', () => {
    test('Test Case 1 - Refunds page renders', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan#/refund`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Refunds page renders content', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan#/refund`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

