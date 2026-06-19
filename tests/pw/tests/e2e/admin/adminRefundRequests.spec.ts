import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminRefundRequestsPage, adminRefundRequestsData } from './adminRefundRequestsPage';
import { ApiUtils } from '@utils/apiUtils';
import { endPoints } from '@utils/apiEndPoints';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import path from 'path';

// ============================================
// ADMIN REFUND REQUESTS — new React admin dashboard (Dokan Pro 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/refund (AdminDataViews).
//
// ADMIN-ONLY spec. Every refund-request precondition is seeded WITHOUT driving
// the vendor/customer UI: an order is created via the REST API in an active
// (processing) status, then a PENDING refund-request row is INSERTed straight
// into {prefix}_dokan_refund via dbUtils.createRefundRequest (status=0 pending,
// method=0 manual). There is no REST create route for refund requests, so the
// DB INSERT is the only deterministic path. See
// tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Refund requests).
//
// Because the seeded refund is a MANUAL/COD refund (method=0, payment_method
// 'bacs'), the backend reports api:false, so the "Refund via Payment Gateway"
// row action is deterministically HIDDEN — the one gateway assertion this
// API-seeded suite can make safely (the positive gateway path needs a live
// sandbox gateway and is out of scope here).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const { CUSTOMER_ID, PRODUCT_ID } = process.env;

let apiUtils: ApiUtils;
// Shared, read-only pending refund (never mutated) for list/search/render tests.
const shared: { orderId?: string } = {};

// Seed a fresh order in an active status against the default seeded vendor's
// product, then INSERT a pending manual refund-request row for it. Returns the
// order id, which uniquely identifies the resulting refund row in the UI.
async function seedPendingRefund(): Promise<string> {
    const [, orderResponseBody, orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, { ...payloads.createOrder, customer_id: CUSTOMER_ID }, 'wc-processing', payloads.vendorAuth);
    await dbUtils.createRefundRequest(orderResponseBody);
    return orderId;
}

test.describe('Admin Refund Requests functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        shared.orderId = await seedPendingRefund();
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let refunds: AdminRefundRequestsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            refunds = new AdminRefundRequestsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Refunds DataView with heading, status tabs and columns', { tag: ['@pro', '@admin'] }, async () => {
            await refunds.goto();
            await expect(refunds.reactRoot).toBeVisible();
            await expect(refunds.heading).toBeVisible();
            await expect(refunds.tab(/Pending/)).toBeVisible();
            await expect(refunds.tab(/Approved/)).toBeVisible();
            await expect(refunds.tab(/Cancelled/)).toBeVisible();
            await expect(refunds.columnHeader('Order ID')).toBeVisible();
            await expect(refunds.columnHeader('Vendor')).toBeVisible();
            await expect(refunds.columnHeader('Refund Amount')).toBeVisible();
            expect(await refunds.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('the seeded pending refund row appears under the Pending tab', { tag: ['@pro', '@admin'] }, async () => {
            await refunds.goto();
            await refunds.clickTab(/Pending/);
            await refunds.search(shared.orderId!);
            await expect(refunds.rowByOrderId(shared.orderId!)).toBeVisible();
        });

        test('searching by order id narrows the list to the matching refund', { tag: ['@pro', '@admin'] }, async () => {
            await refunds.goto();
            await refunds.search(shared.orderId!);
            await expect(refunds.rowByOrderId(shared.orderId!)).toBeVisible();
            expect(await refunds.getRowCount(), 'search narrows to a single matching refund').toBe(1);
        });

        test('switching to the Approved tab fetches refunds with status=completed', { tag: ['@pro', '@admin'] }, async () => {
            await refunds.goto();
            const [req] = await Promise.all([page.waitForRequest(/\/dokan\/v1\/refunds\?.*status=completed/, { timeout: 15000 }), refunds.clickTab(/Approved/)]);
            expect(decodeURIComponent(req.url())).toMatch(/status=completed/);
        });

        test('admin can approve a pending refund via Refund Manually (leaves Pending)', { tag: ['@pro', '@admin'] }, async () => {
            const orderId = await seedPendingRefund();
            await refunds.goto();
            await refunds.clickTab(/Pending/);
            await refunds.search(orderId);
            await expect(refunds.rowByOrderId(orderId)).toBeVisible();
            await refunds.refundManually(orderId);
            // After approval the row must leave the Pending tab.
            await refunds.search(orderId);
            await expect.poll(async () => refunds.isRowVisible(orderId), { timeout: 15000 }).toBe(false);
            // ...and surface under the Approved (completed) tab.
            await refunds.clickTab(/Approved/);
            await refunds.search(orderId);
            await expect.poll(async () => refunds.isRowVisible(orderId), { timeout: 15000 }).toBe(true);
        });

        test('admin can cancel a pending refund after confirming the Cancel modal', { tag: ['@pro', '@admin'] }, async () => {
            const orderId = await seedPendingRefund();
            await refunds.goto();
            await refunds.clickTab(/Pending/);
            await refunds.search(orderId);
            await expect(refunds.rowByOrderId(orderId)).toBeVisible();
            await refunds.cancelRefund(orderId);
            // Leaves Pending.
            await refunds.search(orderId);
            await expect.poll(async () => refunds.isRowVisible(orderId), { timeout: 15000 }).toBe(false);
            // Appears under Cancelled.
            await refunds.clickTab(/Cancelled/);
            await refunds.search(orderId);
            await expect.poll(async () => refunds.isRowVisible(orderId), { timeout: 15000 }).toBe(true);
        });

        test('admin can delete a cancelled refund permanently', { tag: ['@pro', '@admin'] }, async () => {
            // Seed pending, then cancel it via REST so it lands in the Cancelled
            // tab (Delete is only eligible for cancelled refunds).
            const orderId = await seedPendingRefund();
            const refundId = await apiUtils.getRefundIdByOrderId(orderId, 'pending', payloads.adminAuth);
            await apiUtils.put(endPoints.cancelRefund(refundId), { headers: payloads.adminAuth });

            await refunds.goto();
            await refunds.clickTab(/Cancelled/);
            await refunds.search(orderId);
            await expect(refunds.rowByOrderId(orderId)).toBeVisible();
            await refunds.deleteRefund(orderId);
            await refunds.search(orderId);
            await expect.poll(async () => refunds.isRowVisible(orderId), { timeout: 15000 }).toBe(false);
        });

        test('admin can bulk-approve pending refunds', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            const orderA = await seedPendingRefund();
            const orderB = await seedPendingRefund();
            await refunds.goto();
            await refunds.clickTab(/Pending/);
            await refunds.selectRowsByOrderId([orderA, orderB]);
            await refunds.bulkAction('Refund Manually');
            await refunds.clickTab(/Approved/);
            for (const id of [orderA, orderB]) {
                await refunds.search(id);
                await expect.poll(async () => refunds.isRowVisible(id), { timeout: 15000 }).toBe(true);
                await refunds.clearSearch();
            }
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let refunds: AdminRefundRequestsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            refunds = new AdminRefundRequestsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('Refund via Payment Gateway action is hidden for a manual/COD refund', { tag: ['@pro', '@admin'] }, async () => {
            // The seeded refund is method=0 (manual), payment_method 'bacs' — not
            // an auto-refundable gateway — so the backend reports api:false and
            // the gateway action must NOT be offered (Refund Manually still is).
            await refunds.goto();
            await refunds.clickTab(/Pending/);
            await refunds.search(shared.orderId!);
            await expect(refunds.rowByOrderId(shared.orderId!)).toBeVisible();
            expect(await refunds.isRowActionAvailable(shared.orderId!, 'Refund Manually'), 'manual refund action offered').toBe(true);
            expect(await refunds.isRowActionAvailable(shared.orderId!, 'Refund via Payment Gateway'), 'gateway action hidden for manual/COD refund').toBe(false);
        });

        test('dismissing the Cancel modal without confirming leaves the refund Pending', { tag: ['@pro', '@admin'] }, async () => {
            const orderId = await seedPendingRefund();
            await refunds.goto();
            await refunds.clickTab(/Pending/);
            await refunds.search(orderId);
            await refunds.openCancelModalAndDismiss(orderId);
            // Stale-state safety: the row must still be under Pending.
            await refunds.search(orderId);
            await expect(refunds.rowByOrderId(orderId)).toBeVisible();
        });

        test('search with no match shows the empty state', { tag: ['@pro', '@admin'] }, async () => {
            await refunds.goto();
            await refunds.search(adminRefundRequestsData.searchMiss);
            const empty = (await refunds.isEmptyStateVisible()) || (await refunds.getRowCount()) === 0;
            expect(empty, 'no rows / empty-state for an unmatched search').toBe(true);
        });

        test('reloading on #/refund preserves the route and re-mounts the DataView', { tag: ['@pro', '@admin'] }, async () => {
            await refunds.goto();
            await refunds.reload();
            await expect(page).toHaveURL(/#\/refund/);
            await expect(refunds.reactRoot).toBeVisible();
            await expect(refunds.heading).toBeVisible();
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Refunds page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const refunds = new AdminRefundRequestsPage(page);
            await page.goto(refunds.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await refunds.isAccessDenied(), 'a vendor must not see the admin Refunds UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Refunds page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const refunds = new AdminRefundRequestsPage(page);
            await page.goto(refunds.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await refunds.isAccessDenied(), 'a customer must not see the admin Refunds UI').toBe(true);
            await ctx.close();
        });
    });
});
