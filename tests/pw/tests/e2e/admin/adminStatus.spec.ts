import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminStatusPage, adminStatusData } from './adminStatusPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { endPoints } from '@utils/apiEndPoints';
import path from 'path';

// ============================================
// ADMIN STATUS — new React admin dashboard (Dokan 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/status (Status component).
//
// ADMIN-ONLY, READ-ONLY page. The route is registered by Dokan LITE via the
// `dokan-admin-dashboard-routes` wp.hooks filter (src/Status/index.tsx), so this
// stays a @lite area even in a Pro environment.
//
// The page fetches GET dokan/v1/admin/dashboard/status (requires
// manage_woocommerce). On a clean Dokan that returns no status elements, so the
// component renders its up-to-date empty state: an <h2> "Status", the copy
// "Your Dokan is up-to-date.", and a "Latest Version: Lite: <version>" line
// (plus "| <plan>: <version>" when Pro is present). There is NOTHING to seed:
// no tabs, no DataViews table, no search box, no row actions. So this spec is a
// simple read-only smoke + route + access-control suite, mirroring the
// Changelog spec's read-only / access-denied conventions.
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

// The Status REST endpoint (no shared endPoints entry; built from serverUrl).
const statusEndpoint = `${endPoints.serverUrl}${adminStatusData.statusPath}`;

let apiUtils: ApiUtils;

test.describe('Admin Status functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let status: AdminStatusPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            status = new AdminStatusPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Status page mounted on #dokan-admin-dashboard with the "Status" heading and no PHP fatal', { tag: ['@lite', '@admin'] }, async () => {
            await status.goto();
            await expect(status.reactRoot).toBeVisible();
            await expect(status.heading).toBeVisible();
            await status.waitForContent();
            expect(await status.hasNoPhpFatal(), 'no PHP fatal banner on /status').toBe(true);
        });

        test('the Status page renders the "Your Dokan is up-to-date." up-to-date state', { tag: ['@lite', '@admin'] }, async () => {
            await status.goto();
            expect(await status.isUpToDateVisible(), 'up-to-date copy should render on a clean Dokan').toBe(true);
        });

        test('the Status page renders the "Latest Version:" line with the Lite version', { tag: ['@lite', '@admin'] }, async () => {
            await status.goto();
            await status.waitForContent();
            await expect(status.latestVersion).toBeVisible();
            await expect(status.liteVersion).toBeVisible();
        });

        test('the Status page issues the GET dokan/v1/admin/dashboard/status request on mount', { tag: ['@lite', '@admin'] }, async () => {
            const [req] = await Promise.all([page.waitForRequest(r => r.url().includes(adminStatusData.statusPath) && r.method() === 'GET', { timeout: 20000 }), status.goto()]);
            expect(req.url(), 'the status REST endpoint fired on mount').toContain(adminStatusData.statusPath);
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let status: AdminStatusPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            status = new AdminStatusPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('reloading on #/status preserves the route and re-renders the Status page', { tag: ['@lite', '@admin'] }, async () => {
            await status.goto();
            await status.waitForContent();
            await status.reload();
            await expect(page).toHaveURL(/#\/status/);
            await expect(status.heading).toBeVisible();
            expect(await status.isUpToDateVisible(), 'up-to-date copy re-renders after reload').toBe(true);
        });

        test('deep-linking directly to #/status (cold load) lands on the Status page, not the 404', { tag: ['@lite', '@admin'] }, async () => {
            await status.goto();
            await expect(page).toHaveURL(/#\/status/);
            await expect(status.heading).toBeVisible();
            await status.waitForContent();
            expect(await status.hasNoPhpFatal(), 'cold deep-link must not white-screen / fatal').toBe(true);
        });

        test('the Status page shows no DataViews table, tabs or search box (read-only surface)', { tag: ['@lite', '@admin'] }, async () => {
            await status.goto();
            await status.waitForContent();
            // Read-only: none of the DataViews list affordances should be present.
            await expect(status.reactRoot.locator('input[placeholder="Search"]')).toHaveCount(0);
            await expect(status.reactRoot.locator('table')).toHaveCount(0);
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('the status REST endpoint forbids a customer lacking manage_woocommerce', { tag: ['@lite', '@customer'] }, async () => {
            const [response] = await apiUtils.get(statusEndpoint, { headers: payloads.customerAuth }, false);
            expect([401, 403], 'customer must be rejected, not served the status payload').toContain(response.status());
        });

        test('the status REST endpoint forbids a vendor lacking manage_woocommerce', { tag: ['@lite', '@vendor'] }, async () => {
            const [response] = await apiUtils.get(statusEndpoint, { headers: payloads.vendorAuth }, false);
            expect([401, 403], 'vendor must be rejected, not served the status payload').toContain(response.status());
        });

        test('a logged-in vendor cannot reach the admin Status page', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
            const vctx = await browser.newContext({ storageState: v1 });
            const vpage = await vctx.newPage();
            const vstatus = new AdminStatusPage(vpage);
            await vpage.goto(vstatus.url);
            await vpage.waitForLoadState('domcontentloaded');
            expect(await vstatus.isAccessDenied(), 'a vendor must not see the admin Status UI').toBe(true);
            await vctx.close();
        });

        test('a logged-in customer cannot reach the admin Status page', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
            const cctx = await browser.newContext({ storageState: c1 });
            const cpage = await cctx.newPage();
            const cstatus = new AdminStatusPage(cpage);
            await cpage.goto(cstatus.url);
            await cpage.waitForLoadState('domcontentloaded');
            expect(await cstatus.isAccessDenied(), 'a customer must not see the admin Status UI').toBe(true);
            await cctx.close();
        });
    });
});
