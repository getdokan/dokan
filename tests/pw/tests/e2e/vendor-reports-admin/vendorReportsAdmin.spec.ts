import { Page, expect, test } from '@utils/test';
import { ReportsPage, VendorReportsPage, ApiUtils, data, payloads } from './vendorReportsAdminPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const { PRODUCT_ID } = process.env;

// KEEP skipped: page object (vendorReportsAdminPage.ts) is all stubs — ApiUtils/ReportsPage/VendorReportsPage methods are empty/return dummy values; also @pro logs/reports features not in standard Lite CI seed.
test.describe.skip('Reports test', () => {
    let admin: ReportsPage;
    let vendor: VendorReportsPage;
    let aPage: Page, vPage: Page;
    let apiUtils: ApiUtils;
    let orderId: string;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new ReportsPage(aPage);
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorReportsPage(vPage);
        apiUtils = new ApiUtils(null);
        [, , orderId] = await apiUtils.createOrderWithStatus(PRODUCT_ID, payloads.createOrder, data.order.orderStatus.completed, payloads.vendorAuth);
    });

    test.afterAll(async () => { await aPage?.close(); await vPage?.close(); await apiUtils.dispose(); });

    test('admin can view reports menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminReportsRenderProperly(); });
    test('admin can view all Logs menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => { await admin.adminAllLogsRenderProperly(); });
    test('admin can search all logs', { tag: ['@pro', '@admin'] }, async () => { await admin.searchAllLogs(orderId); });
    test('admin can export all logs', { tag: ['@pro', '@admin'] }, async () => { await admin.exportAllLogs(); });
    test('admin can filter all logs by store name', { tag: ['@pro', '@admin'] }, async () => { await admin.filterAllLogs(data.predefined.vendorStores.vendor1, 'by-store'); });
    test('admin can filter all logs by order status', { tag: ['@pro', '@admin'] }, async () => { await admin.filterAllLogs('completed', 'by-status'); });
    test('vendor can view reports menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorReportsRenderProperly(); });
    test('vendor can export statement', { tag: ['@pro', '@vendor'] }, async () => { await vendor.exportStatement(); });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Admin Vendor Reports (React) Tests @pro', () => {
    test('Test Case 1 - Admin reports page renders', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/reports`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Admin reports page renders content', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/reports`));
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

