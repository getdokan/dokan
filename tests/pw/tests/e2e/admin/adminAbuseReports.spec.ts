import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminAbuseReportsPage, adminAbuseReportsData } from './adminAbuseReportsPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { dbUtils } from '@utils/dbUtils';
import { SERVER_URL } from '@utils/helpers';
import path from 'path';

// The repo's strict tsconfig doesn't pull in `@types/node`, so `process` is
// flagged as undefined elsewhere in the suite. Declare it locally (matching the
// pattern used by the existing abuse-reports specs) so this file type-checks.
declare const process: { env: Record<string, string | undefined> };

// ============================================
// ADMIN ABUSE REPORTS — new React admin dashboard (Dokan Pro 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/abuse-reports (AdminDataViews).
//
// Lives in the Dokan Pro `report-abuse` module, so the whole suite is gated
// behind @pro. ADMIN-ONLY spec. There is NO REST create route for abuse
// reports, so the dependency chain (vendor -> product -> customer) is seeded via
// REST and each report row is DB-inserted with dbUtils.createAbuseReport().
// This spec never drives the vendor/customer report-submit UI.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Abuse reports).
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

const ABUSE_TABLE = `${process.env.DB_PREFIX ?? 'wp'}_dokan_report_abuse_reports`;

let apiUtils: ApiUtils;
const seed: { vendorId?: string; productId?: string; customerId?: string } = {};

// Seed a vendor store (idempotent + re-runnable). Look up the store first so we
// never take createStore's "already exists -> updateStore" path, which 400s on
// the non-boolean `show_email: 'yes'` field in payloads.createStore() (the v1
// stores PUT validates show_email as boolean; the POST is lenient).
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

// Seed a reporting customer (idempotent). createCustomer returns its id, but
// falls back to a lookup when the account already exists.
async function seedCustomer(c: { username: string; email: string }): Promise<string> {
    let customerId = await apiUtils.getCustomerId(c.username, payloads.adminAuth);
    if (!customerId) {
        const [, id] = await apiUtils.createCustomer({ ...payloads.createCustomer(), username: c.username, email: c.email }, payloads.adminAuth);
        customerId = id;
    }
    return customerId;
}

// Insert N abuse-report rows (all using the same configured reason). dbUtils
// mirrors dokan_report_abuse_create_report() column-for-column.
async function seedReports(reason: string, description: string, count = 1): Promise<void> {
    for (let i = 0; i < count; i++) {
        await dbUtils.createAbuseReport({ reason, description: `${description} ${i + 1}` }, seed.productId!, seed.vendorId!, seed.customerId!);
    }
}

test.describe('Admin Abuse Reports list functionality @pro', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        seed.vendorId = await seedVendor(adminAbuseReportsData.vendor);
        seed.customerId = await seedCustomer(adminAbuseReportsData.customer);
        const [, productId] = await apiUtils.createProduct({ ...payloads.createProduct(), name: 'AABR Reported Product', post_author: seed.vendorId }, payloads.adminAuth);
        seed.productId = productId;
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let reports: AdminAbuseReportsPage;

        test.beforeAll(async () => {
            // Read-only fixtures shared by the happy-path reads. Three rows is
            // enough for list / view / filter without coupling to other tests.
            await dbUtils.createAbuseReport({ reason: adminAbuseReportsData.reasons.spam, description: 'AABR happy spam seed' }, seed.productId!, seed.vendorId!, seed.customerId!);
            await dbUtils.createAbuseReport({ reason: adminAbuseReportsData.reasons.other, description: 'AABR happy other seed' }, seed.productId!, seed.vendorId!, seed.customerId!);
        });

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            reports = new AdminAbuseReportsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Abuse Reports list with DataViews table and columns', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            await expect(reports.reactRoot).toBeVisible();
            await expect(reports.heading).toBeVisible();
            await expect(reports.columnHeader('Product')).toBeVisible();
            await expect(reports.columnHeader('Vendor')).toBeVisible();
            await expect(reports.columnHeader('Reported By')).toBeVisible();
            await expect(reports.columnHeader('Reported At')).toBeVisible();
            expect(await reports.getRowCount(), 'seeded report rows render').toBeGreaterThan(0);
            expect(await reports.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('a seeded report row is visible by its (untruncated) reason', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            await expect(reports.rowByReason(adminAbuseReportsData.reasons.spam)).toBeVisible();
            // The reported product title should also render somewhere in the list.
            await expect(page.getByText('AABR Reported Product', { exact: false }).first()).toBeVisible();
        });

        test('clicking the Reason cell opens the Product Abuse Report detail modal', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            await reports.clickReasonCell(adminAbuseReportsData.reasons.spam);
            expect(await reports.isDetailModalVisible(), 'detail modal should open').toBe(true);
            const reason = await reports.getDetailModalReason();
            expect(reason, 'detail modal shows the report reason').toContain(adminAbuseReportsData.reasons.spam);
            await reports.closeDetailModal();
            expect(await reports.isDetailModalVisible(), 'detail modal should close cleanly').toBe(false);
        });

        test('the row "View" action opens the detail modal', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            await reports.viewReport(adminAbuseReportsData.reasons.spam);
            expect(await reports.isDetailModalVisible(), 'detail modal should open from the View action').toBe(true);
            await reports.closeDetailModal();
            expect(await reports.isDetailModalVisible(), 'detail modal should be hidden after Close').toBe(false);
        });

        test('the Reason filter field is offered in the filter popover', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            await reports.openFilterMenu();
            expect(await reports.isFilterFieldOffered('Reason'), 'Reason filter field is offered').toBe(true);
            expect(await reports.isFilterFieldOffered('Product'), 'Product filter field is offered').toBe(true);
            expect(await reports.isFilterFieldOffered('Vendor'), 'Vendor filter field is offered').toBe(true);
        });
    });

    // ----------------------------------------
    // Mutating cases isolate the table to a known row set, then assert against
    // the REST total header (the source of truth the DataView renders from).
    test.describe('delete flows', () => {
        let ctx: BrowserContext;
        let page: Page;
        let reports: AdminAbuseReportsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            reports = new AdminAbuseReportsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('cancelling a single delete keeps the row visible', { tag: ['@pro', '@admin'] }, async () => {
            await dbUtils.dbQuery(`DELETE FROM ${ABUSE_TABLE};`);
            await seedReports(adminAbuseReportsData.reasons.spam, 'AABR cancel-delete seed', 2);

            await reports.goto();
            await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 20000 });
            const before = await reports.getRowCount();

            await reports.openRowActionMenuFor(adminAbuseReportsData.reasons.spam);
            await reports.clickActionMenuItem('Delete');
            await reports.deleteModalHeading.waitFor({ state: 'visible', timeout: 10000 });
            await reports.cancelDelete();

            const after = await reports.getRowCount();
            expect(after, 'row count is unchanged when delete is cancelled').toBe(before);
        });

        test('single delete via the row action removes the report', { tag: ['@pro', '@admin'] }, async () => {
            await dbUtils.dbQuery(`DELETE FROM ${ABUSE_TABLE};`);
            await seedReports(adminAbuseReportsData.reasons.spam, 'AABR single-delete seed', 2);

            await reports.goto();
            await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 20000 });
            const before = await reports.getRowCount();

            await reports.openRowActionMenuFor(adminAbuseReportsData.reasons.spam);
            await reports.clickActionMenuItem('Delete');
            await reports.deleteModalHeading.waitFor({ state: 'visible', timeout: 10000 });

            const description = await reports.getDeleteModalDescription();
            expect(description, 'single-delete modal copy references one report').toContain('this abuse report');

            await reports.confirmDelete();

            const after = await reports.getRowCount();
            expect(after, 'row count drops by 1 after a single delete').toBeLessThan(before);
        });

        test('bulk delete removes every selected report', { tag: ['@pro', '@admin'] }, async () => {
            await dbUtils.dbQuery(`DELETE FROM ${ABUSE_TABLE};`);
            await seedReports(adminAbuseReportsData.reasons.spam, 'AABR bulk-delete seed', 2);

            const apiCtx = await request.newContext();
            expect(await reports.restGetTotal(apiCtx), 'two reports seeded before bulk delete').toBeGreaterThanOrEqual(2);

            await reports.goto();
            await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 20000 });

            await reports.selectAllRows();
            await reports.bulkDeleteSelected();

            await expect.poll(async () => reports.restGetTotal(apiCtx), { timeout: 10000 }).toBe(0);
            await apiCtx.dispose();
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let reports: AdminAbuseReportsPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            reports = new AdminAbuseReportsPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        // QUARANTINED @exploratory: the admin Abuse Reports DataViews page renders NO
        // free-text search input — verified live: even with >=1 row seeded, no
        // input[placeholder="Search"] mounts (only the Vendors page adds a SearchInput).
        // So a search-driven empty state is unreachable via the UI. Documented product
        // gap — re-enable when admin search lands.
        test('searching for an unmatched reason shows the empty state', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            await dbUtils.dbQuery(`DELETE FROM ${ABUSE_TABLE};`);
            await seedReports(adminAbuseReportsData.reasons.spam, 'AABR empty-state seed', 1);

            await reports.goto();
            await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 20000 });
            await reports.search(adminAbuseReportsData.filterMiss);
            const empty = (await reports.isEmptyStateVisible()) || (await reports.getRowCount()) === 0;
            expect(empty, 'no rows / empty-state for an unmatched search').toBe(true);
        });

        test('reloading on #/abuse-reports preserves the route and re-mounts the list', { tag: ['@pro', '@admin'] }, async () => {
            await reports.goto();
            await reports.reload();
            await expect(page).toHaveURL(/#\/abuse-reports/);
            await expect(reports.reactRoot).toBeVisible();
            await expect(reports.heading).toBeVisible();
        });

        test('REST: the reason filter returns only matching rows', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            // Re-seed a known reason so the filter has at least one row to match.
            await seedReports(adminAbuseReportsData.reasons.spam, 'AABR reason-filter seed', 1);
            const apiCtx = await request.newContext();
            const response = await reports.restGetReports(apiCtx, { reason: adminAbuseReportsData.reasons.spam });
            expect(response.status(), 'filtered GET /abuse-reports returns 200').toBe(200);
            const body = await response.json();
            expect(Array.isArray(body), 'response body is a JSON array').toBe(true);
            for (const row of body) {
                expect(row.reason, `every row matches reason "${adminAbuseReportsData.reasons.spam}"`).toBe(adminAbuseReportsData.reasons.spam);
            }
            await apiCtx.dispose();
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Abuse Reports page', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const reports = new AdminAbuseReportsPage(page);
            await page.goto(reports.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await reports.isAccessDenied(), 'a vendor must not see the admin Abuse Reports UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Abuse Reports page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const reports = new AdminAbuseReportsPage(page);
            await page.goto(reports.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await reports.isAccessDenied(), 'a customer must not see the admin Abuse Reports UI').toBe(true);
            await ctx.close();
        });

        test('REST: an unauthenticated request to /abuse-reports is rejected', { tag: ['@pro', '@customer'] }, async () => {
            const apiCtx = await request.newContext();
            const url = new URL(`${SERVER_URL}/dokan/v1/abuse-reports`);
            const response = await apiCtx.get(url.toString());
            expect([401, 403], 'unauthenticated GET /abuse-reports should be rejected').toContain(response.status());
            await apiCtx.dispose();
        });
    });
});
