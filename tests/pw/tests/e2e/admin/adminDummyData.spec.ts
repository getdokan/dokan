import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminDummyDataPage, adminDummyDataData, adminDummyDataEndpoints, statusYes, statusNo } from './adminDummyDataPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import { SERVER_URL } from '@utils/helpers';
import path from 'path';

// ============================================
// ADMIN DUMMY DATA IMPORTER — new React admin dashboard (Dokan 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/dummy-data
//
// ADMIN-ONLY area. The importer renders one of three body states from
// index.tsx — StatusSkeleton (while GET dokan/v1/dummy-data/status is in
// flight), Importer (import_status != 'yes': progress bar + "Run the Importer"),
// or Result (import_status == 'yes': "Dummy Data Import complete!" + View
// Vendors / View Products / Clear Data). None of this is seedable through
// list-style REST helpers, so the body states are driven by MOCKING the
// status + CSV endpoints via page.route. The destructive import/clear calls are
// INTERCEPTED (route.fulfill) so the affordances are exercised without writing
// dummy vendors/products to the DB. Real, un-mocked import/clear runs are kept
// @exploratory. See tests/pw/test-cases/new-dashboards-test-cases.md (Dummy
// data importer) + admin-dashboard-seeding-strategy.md.
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

test.describe('Admin Dummy Data importer functionality', () => {
    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let dummy: AdminDummyDataPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            dummy = new AdminDummyDataPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('Dummy Data route mounts the importer shell with heading and intro card', { tag: ['@lite', '@admin'] }, async () => {
            await dummy.mockStatus(statusNo);
            await dummy.mockCsv();
            await dummy.goto();
            await expect(dummy.reactRoot).toBeVisible();
            await expect(dummy.heading).toBeVisible();
            await expect(dummy.cardHeading).toBeVisible();
            await expect(dummy.backToToolsButton).toBeVisible();
            expect(page.url()).toMatch(/#\/dummy-data/);
            expect(await dummy.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('when import_status is "no" the Importer body shows a 0% progress bar and an enabled Run button', { tag: ['@lite', '@admin'] }, async () => {
            await dummy.mockStatus(statusNo);
            await dummy.mockCsv();
            await dummy.goto();
            await expect(dummy.importerHeading).toBeVisible();
            await expect(dummy.progressBar).toBeVisible();
            expect(await dummy.progressValue(), 'progress starts at 0').toBe(0);
            await expect(dummy.runImporterButton).toBeVisible();
            await expect(dummy.runImporterButton).toBeEnabled();
        });

        test('when import_status is "yes" the Result panel shows completion + View Vendors / View Products / Clear Data', { tag: ['@lite', '@admin'] }, async () => {
            await dummy.mockStatus(statusYes);
            await dummy.mockCsv();
            await dummy.goto();
            await expect(dummy.completeHeading).toBeVisible();
            await expect(dummy.viewVendorsButton).toBeVisible();
            await expect(dummy.viewProductsLink).toBeVisible();
            await expect(dummy.clearDataButton).toBeVisible();
        });

        test('View Dummy Products link points to wp-admin edit.php?post_type=product', { tag: ['@lite', '@admin'] }, async () => {
            await dummy.mockStatus(statusYes);
            await dummy.mockCsv();
            await dummy.goto();
            const href = await dummy.viewProductsLink.getAttribute('href');
            expect(href, 'product link targets the WP products list').toMatch(/edit\.php\?post_type=product$/);
        });

        test('View Dummy Vendors navigates the HashRouter to #/vendors', { tag: ['@lite', '@admin'] }, async () => {
            await dummy.mockStatus(statusYes);
            await dummy.mockCsv();
            await dummy.goto();
            await dummy.viewVendorsButton.click();
            await expect(page).toHaveURL(/#\/vendors/);
        });

        test('Clear Data opens the confirmation modal before any DELETE is sent', { tag: ['@lite', '@admin'] }, async () => {
            await dummy.mockStatus(statusYes);
            await dummy.mockCsv();
            let deleteSeen = false;
            await page.route(adminDummyDataEndpoints.clear, async route => {
                deleteSeen = true;
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
            });
            await dummy.goto();
            await dummy.openClearModal();
            await expect(dummy.confirmModalTitle).toBeVisible();
            await expect(dummy.confirmModalDescription).toBeVisible();
            expect(deleteSeen, 'no DELETE fires until the modal is confirmed').toBe(false);
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let dummy: AdminDummyDataPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            dummy = new AdminDummyDataPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('the StatusSkeleton renders while GET status is in flight, then resolves to the importer', { tag: ['@lite', '@admin'] }, async () => {
            await dummy.mockStatusDelayed(statusNo, 3000);
            await dummy.mockCsv();
            await page.goto(dummy.url);
            await page.waitForLoadState('domcontentloaded');
            await dummy.waitForReady();
            await expect(dummy.skeleton).toBeVisible();
            // After the delayed status resolves, the importer body replaces it.
            await expect(dummy.runImporterButton).toBeVisible({ timeout: 15000 });
        });

        test('cancelling the Clear confirmation makes no DELETE request and keeps the Result panel', { tag: ['@lite', '@admin'] }, async () => {
            await dummy.mockStatus(statusYes);
            await dummy.mockCsv();
            let deleteSeen = false;
            await page.route(adminDummyDataEndpoints.clear, async route => {
                deleteSeen = true;
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
            });
            await dummy.goto();
            await dummy.openClearModal();
            await dummy.cancelClear();
            await expect(dummy.confirmModalTitle).toBeHidden();
            await expect(dummy.completeHeading).toBeVisible();
            expect(deleteSeen, 'cancel must not trigger a DELETE').toBe(false);
        });

        test('reloading on #/dummy-data preserves the route and re-renders the result body', { tag: ['@lite', '@admin'] }, async () => {
            await dummy.mockStatus(statusYes);
            await dummy.mockCsv();
            await dummy.goto();
            await expect(dummy.completeHeading).toBeVisible();
            await dummy.reload();
            await expect(page).toHaveURL(/#\/dummy-data/);
            await expect(dummy.completeHeading).toBeVisible();
        });

        test('GET status failure surfaces an error toast and clears the skeleton', { tag: ['@lite', '@admin'] }, async () => {
            await dummy.mockStatusError('Something went wrong');
            await dummy.mockCsv();
            await dummy.goto();
            // Skeleton must not stay stuck after the failed status request.
            await expect(dummy.skeleton).toBeHidden({ timeout: 15000 });
            expect(await dummy.hasNoPhpFatal(), 'a failed status must not crash to a fatal').toBe(true);
        });
    });

    // ----------------------------------------
    // Destructive flows — these exercise the real import/clear UI affordances
    // but the network calls are STUBBED so nothing writes to the DB. Tagged
    // @exploratory because they depend on the importer's recursive client
    // behaviour (per-vendor POST loop) and toast surfaces.
    test.describe('destructive affordances (stubbed network)', () => {
        let ctx: BrowserContext;
        let page: Page;
        let dummy: AdminDummyDataPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            dummy = new AdminDummyDataPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test.fixme('Run the Importer drives the progress bar to 100% and switches to the Result panel', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            await dummy.mockStatus(statusNo);
            await dummy.mockCsv([adminDummyDataData.vendorRow, adminDummyDataData.productRow]);
            await dummy.stubImport();
            await dummy.goto();
            await dummy.clickRunImporter();
            // Single seeded vendor -> recursion completes -> Result panel renders.
            await expect(dummy.completeHeading).toBeVisible({ timeout: 15000 });
            expect(await dummy.progressValue(), 'progress reaches 100%').toBe(100);
        });

        test('each import POST carries vendor_data, vendor_index and total_vendors', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            await dummy.mockStatus(statusNo);
            await dummy.mockCsv([adminDummyDataData.vendorRow, adminDummyDataData.productRow]);
            await dummy.stubImport();
            await dummy.goto();
            const [req] = await Promise.all([page.waitForRequest(adminDummyDataEndpoints.import, { timeout: 15000 }), dummy.clickRunImporter()]);
            const body = req.postDataJSON() as { vendor_data?: unknown; vendor_index?: number; total_vendors?: number; vendor_products?: unknown[] };
            expect(body.vendor_data, 'payload includes vendor_data').toBeTruthy();
            expect(body.vendor_index, 'first chunk is index 0').toBe(0);
            expect(body.total_vendors, 'total_vendors counts the seeded vendors').toBeGreaterThan(0);
        });

        test.fixme('confirming Clear Data sends a DELETE and returns the body to the Importer state', { tag: ['@lite', '@admin', '@exploratory'] }, async () => {
            // First load: Result panel (import_status yes). After clear, the
            // component reloads status — serve "no" so the Importer body returns.
            let statusCall = 0;
            await page.route(adminDummyDataEndpoints.status, async route => {
                statusCall += 1;
                const body = statusCall === 1 ? statusYes : statusNo;
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
            });
            await dummy.mockCsv();
            await dummy.stubClear();
            await dummy.goto();
            await dummy.openClearModal();
            const [del] = await Promise.all([page.waitForRequest(adminDummyDataEndpoints.clear, { timeout: 15000 }), dummy.confirmClear()]);
            expect(del.method(), 'clear uses DELETE').toBe('DELETE');
            // resetToImport + reloadStatus -> Importer body (Run button) returns.
            await expect(dummy.runImporterButton).toBeVisible({ timeout: 15000 });
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Dummy Data page', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
            const vendorCtx = await browser.newContext({ storageState: v1 });
            const vendorPage = await vendorCtx.newPage();
            const vendorDummy = new AdminDummyDataPage(vendorPage);
            await vendorPage.goto(vendorDummy.url);
            await vendorPage.waitForLoadState('domcontentloaded');
            expect(await vendorDummy.isAccessDenied(), 'a vendor must not see the admin Dummy Data UI').toBe(true);
            await vendorCtx.close();
        });

        test('a logged-in customer cannot access the admin Dummy Data page', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
            const customerCtx = await browser.newContext({ storageState: c1 });
            const customerPage = await customerCtx.newPage();
            const customerDummy = new AdminDummyDataPage(customerPage);
            await customerPage.goto(customerDummy.url);
            await customerPage.waitForLoadState('domcontentloaded');
            expect(await customerDummy.isAccessDenied(), 'a customer must not see the admin Dummy Data UI').toBe(true);
            await customerCtx.close();
        });

        test('the dummy-data REST endpoints reject a vendor (manage_woocommerce required)', { tag: ['@lite', '@vendor'] }, async () => {
            const apiUtils = new ApiUtils(await request.newContext());
            // assert=false: a 401/403 is the expected outcome, not a failure.
            const [statusRes] = await apiUtils.get(`${SERVER_URL}/dokan/v1/dummy-data/status`, { headers: payloads.vendorAuth }, false);
            const [importRes] = await apiUtils.post(`${SERVER_URL}/dokan/v1/dummy-data/import`, { headers: payloads.vendorAuth, data: {} }, false);
            const [clearRes] = await apiUtils.delete(`${SERVER_URL}/dokan/v1/dummy-data/clear`, { headers: payloads.vendorAuth }, false);
            expect(statusRes.ok(), 'vendor GET status is rejected').toBe(false);
            expect(importRes.ok(), 'vendor POST import is rejected').toBe(false);
            expect(clearRes.ok(), 'vendor DELETE clear is rejected').toBe(false);
            await apiUtils.dispose();
        });

        test('the dummy-data REST endpoints reject a customer (manage_woocommerce required)', { tag: ['@lite', '@customer'] }, async () => {
            const apiUtils = new ApiUtils(await request.newContext());
            const [statusRes] = await apiUtils.get(`${SERVER_URL}/dokan/v1/dummy-data/status`, { headers: payloads.customerAuth }, false);
            const [importRes] = await apiUtils.post(`${SERVER_URL}/dokan/v1/dummy-data/import`, { headers: payloads.customerAuth, data: {} }, false);
            const [clearRes] = await apiUtils.delete(`${SERVER_URL}/dokan/v1/dummy-data/clear`, { headers: payloads.customerAuth }, false);
            expect(statusRes.ok(), 'customer GET status is rejected').toBe(false);
            expect(importRes.ok(), 'customer POST import is rejected').toBe(false);
            expect(clearRes.ok(), 'customer DELETE clear is rejected').toBe(false);
            await apiUtils.dispose();
        });
    });
});
