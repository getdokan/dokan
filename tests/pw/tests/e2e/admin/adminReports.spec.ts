import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminReportsPage, adminReportsData, adminReportsSelectors } from './adminReportsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import path from 'path';

// ============================================
// ADMIN REPORTS — new React admin dashboard (Dokan Pro 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/reports (HashRouter).
//
// Lives in Dokan Pro, so the whole suite is gated behind @pro. ADMIN-ONLY spec.
// The Reports page is a TABBED, READ-only surface: a "Reports" overview (D3 chart
// + By Month/By Year/By Vendor sub-tabs), an "All Logs" commission-log table and
// an "Admin Earnings" earnings table. To guarantee at least one commission /
// earning / log row, the beforeAll seeds — over REST, never the vendor/customer
// UI — a vendor store + product + customer + ONE completed order
// (apiUtils.createOrderWithStatus, 'wc-completed', admin auth). getSellerId /
// getCustomerId-first keeps re-creation idempotent so a re-run never 400s.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Reports).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;
const seed: { vendorId?: string; customerId?: string; productId?: string; orderId?: string } = {};

// Seed a vendor store (idempotent + re-runnable). Look up the store first so we
// never take createStore's "already exists -> updateStore" path, which 400s on
// the non-boolean show_email field (the v1 stores PUT validates it as boolean).
async function seedVendor(v: { storeName: string; userLogin: string; email: string }): Promise<string> {
    let sellerId = await apiUtils.getSellerId(v.storeName, payloads.adminAuth);
    if (!sellerId) {
        const [, id] = await apiUtils.createStore({ ...payloads.createStore(), store_name: v.storeName, user_login: v.userLogin, email: v.email }, payloads.adminAuth);
        sellerId = id;
    }
    if (sellerId) {
        await apiUtils.updateStoreStatus(sellerId, { status: 'active' }, payloads.adminAuth);
    }
    return sellerId;
}

// Seed a customer (idempotent — getCustomerId-first, createCustomer otherwise).
async function seedCustomer(c: { username: string; email: string }): Promise<string> {
    let customerId = await apiUtils.getCustomerId(c.username, payloads.adminAuth);
    if (!customerId) {
        const [, id] = await apiUtils.createCustomer({ ...payloads.createCustomer(), username: c.username, email: c.email }, payloads.adminAuth);
        customerId = id;
    }
    return customerId;
}

test.describe('Admin Reports functionality @pro', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());

        // 1) Approved active vendor store.
        seed.vendorId = await seedVendor(adminReportsData.vendor);
        // 2) A reporting customer.
        seed.customerId = await seedCustomer(adminReportsData.customer);

        // Steps 3-4 seed the single COMPLETED order that guarantees a commission
        // log / admin earning / chart data point. Best-effort: the mount / tab /
        // empty-state tests don't need it, so a seeding hiccup must NOT cascade.
        try {
            // 3) A published product owned by the vendor (payload carries categories[] — required, see MEMORY).
            const [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), name: adminReportsData.product.name, post_author: seed.vendorId }, payloads.adminAuth);
            seed.productId = productId;

            // 4) One completed order -> drives report-stats summary/overview chart,
            //    report-logs row and report-earnings row.
            const orderPayload = { ...payloads.createOrder, customer_id: Number(seed.customerId), line_items: [{ product_id: productId, quantity: 1 }] };
            const [, , orderId] = await apiUtils.createOrderWithStatus(productId, orderPayload, 'wc-completed', payloads.adminAuth);
            seed.orderId = orderId;
        } catch (e) {
            console.warn('adminReports: optional completed-order seeding skipped:', (e as Error).message);
        }
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let reports: AdminReportsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            reports = new AdminReportsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can open the Reports page mounted at #/reports with the "Reports" heading', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            await expect(reports.reactRoot).toBeVisible();
            await expect(reports.heading).toBeVisible();
            await expect(page).toHaveURL(/#\/reports/);
            expect(await reports.hasNoPhpFatal(), 'no PHP fatal on /reports').toBe(true);
        });

        test('the five report tabs (All Logs, Admin Earnings, By Month, By Year, By Vendor) are present', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            for (const label of adminReportsData.allTabLabels) {
                expect(await reports.isTabVisible(label), `tab "${label}" is present`).toBe(true);
            }
        });

        test('the default "Reports" overview renders the D3 sales chart and fires the report-stats overview request', { tag: ['@pro', '@admin'] }, async () => {
            // Arm the chart-data waiter BEFORE navigation so the on-mount fetch is caught.
            const reqPromise = page.waitForRequest(r => r.url().includes(adminReportsData.rest.statsOverview) && r.method() === 'GET', { timeout: 30000 });
            await reports.goto();
            const req = await reqPromise;
            expect(req.url(), 'overview tab fetched report-stats/overview').toContain(adminReportsData.rest.statsOverview);
            expect(await reports.isChartVisible(), 'the D3 chart svg paints in the overview panel').toBe(true);
            expect(await reports.hasNoPhpFatal(), 'no PHP fatal rendering the overview chart').toBe(true);
        });

        test('switching to "All Logs" fires the report-logs request and renders the commission-log table columns', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            const url = await reports.clickTabAndCaptureRequest(adminReportsData.topTabs.allLogs, adminReportsData.rest.logs);
            expect(url, 'All Logs fetched /report-logs').toContain(adminReportsData.rest.logs);
            await reports.waitForTableSettled();
            await expect(reports.columnHeader('Order ID')).toBeVisible();
            await expect(reports.columnHeader('Store')).toBeVisible();
            expect(await reports.hasNoPhpFatal(), 'no PHP fatal on All Logs').toBe(true);
        });

        test('"All Logs" shows either a populated table or its "No logs found" empty state', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            await reports.clickTab(adminReportsData.topTabs.allLogs);
            await reports.waitForTableSettled();
            const populated = (await reports.getRowCount()) > 0;
            const empty = await reports.isEmptyStateVisible();
            expect(populated || empty, 'All Logs renders a table or its empty state').toBe(true);
        });

        test('switching to "Admin Earnings" fires the report-earnings request and renders the earnings table columns', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            const url = await reports.clickTabAndCaptureRequest(adminReportsData.topTabs.adminEarnings, adminReportsData.rest.earnings);
            expect(url, 'Admin Earnings fetched /report-earnings').toContain(adminReportsData.rest.earnings);
            await reports.waitForTableSettled();
            await expect(reports.columnHeader('Type of Earning')).toBeVisible();
            await expect(reports.columnHeader('Amount')).toBeVisible();
            expect(await reports.hasNoPhpFatal(), 'no PHP fatal on Admin Earnings').toBe(true);
        });

        test('the "By Year" breakdown sub-tab refetches the chart with a by-year filter', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            // The By Year sub-tab lives inside the active "Reports" overview.
            const [req] = await Promise.all([page.waitForRequest(r => r.url().includes(adminReportsData.rest.statsOverview) && r.url().includes('by-year') && r.method() === 'GET', { timeout: 15000 }), reports.tab(adminReportsData.breakdownTabs.byYear).click()]);
            expect(req.url(), 'By Year refetched the overview chart with filter_type=by-year').toContain('by-year');
            expect(await reports.isChartVisible(), 'the chart re-renders on the By Year breakdown').toBe(true);
        });

        test('the "By Vendor" breakdown sub-tab renders its panel without a PHP fatal', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            await reports.clickTab(adminReportsData.breakdownTabs.byVendor);
            expect(await reports.isChartVisible(), 'the chart paints on the By Vendor breakdown').toBe(true);
            expect(await reports.hasNoPhpFatal(), 'no PHP fatal on the By Vendor breakdown').toBe(true);
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let reports: AdminReportsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            reports = new AdminReportsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('reloading on #/reports preserves the route and re-mounts the Reports page', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            await reports.reload();
            await expect(page).toHaveURL(/#\/reports/);
            await expect(reports.reactRoot).toBeVisible();
            await expect(reports.heading).toBeVisible();
        });

        test('a 500 on the report-logs request surfaces the panel error box instead of a white screen', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            // Force the All Logs fetch to fail; the panel renders its red {error} box.
            await page.route(/\/dokan\/v1\/admin\/report-logs/, async route => {
                await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ code: 'server_error', message: 'Boom' }) });
            });
            await reports.goto();
            await reports.clickTab(adminReportsData.topTabs.allLogs);
            await expect(page.locator(adminReportsSelectors.errorBox).first()).toBeVisible({ timeout: 15000 });
            expect(await reports.hasNoPhpFatal(), 'a failed fetch must not white-screen the page').toBe(true);
            await page.unroute(/\/dokan\/v1\/admin\/report-logs/);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('REST: an unauthenticated request to the admin report-stats summary is rejected', { tag: ['@pro', '@customer'] }, async () => {
            const apiCtx = await request.newContext();
            const response = await apiCtx.get(`${SERVER_URL}${adminReportsData.rest.statsSummary}`);
            expect([401, 403], 'unauthenticated GET /admin/report-stats/summary must be rejected').toContain(response.status());
            await apiCtx.dispose();
        });

        test('REST: a vendor lacking manage_woocommerce cannot read the admin report logs', { tag: ['@pro', '@vendor'] }, async () => {
            const [response] = await apiUtils.get(`${SERVER_URL}${adminReportsData.rest.logs}`, { headers: payloads.vendorAuth }, false);
            expect([401, 403], 'vendor must be rejected from the admin report logs').toContain(response.status());
        });

        test('a logged-in vendor cannot access the admin Reports page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const reports = new AdminReportsPage(page);
            await page.goto(reports.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await reports.isAccessDenied(), 'a vendor must not see the admin Reports UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Reports page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const reports = new AdminReportsPage(page);
            await page.goto(reports.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await reports.isAccessDenied(), 'a customer must not see the admin Reports UI').toBe(true);
            await ctx.close();
        });
    });
});
