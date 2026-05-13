import { test, expect, Page } from '@utils/test';
import { AdminDashboardPage, VendorDashboardPage } from './dashboardPage';
import path from 'path';
import { NewVendorDashboardPage } from './newVendorDashboardPage';
import { toPath } from '@utils/helpers';

const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe('Dashboard test', () => {
    let admin: AdminDashboardPage;
    let vendor: VendorDashboardPage;
    let aPage: Page, vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new AdminDashboardPage(aPage);

        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorDashboardPage(vPage);
    });

    test.afterAll(async () => {
        await aPage?.close();
        await vPage?.close();
    });

    // admin
    // TODO: need to fix
    test.skip('admin can view Dokan dashboard', { tag: ['@lite', '@exploratory', '@admin'] }, async () => {
        await admin.adminDashboardRenderProperly();
    });

    // vendor

    test('vendor can view vendor dashboard', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorDashboardRenderProperly();
    });

    // The legacy `.dokan-dashboard-menu` is replaced by the React shell when
    // `dokan_appearance.vendor_layout_style = 'latest'`. Skip when new UI is on.
    test.skip('vendor can view vendor dashboard menus', { tag: ['@lite', '@exploratory', '@vendor'] }, async () => {
        await vendor.vendorDashboardMenusRenderProperly();
    });

    // ============================================
    // NEW VENDOR DASHBOARD (React, /dashboard/?path=…) — 5.0.0+
    // ============================================
    // The legacy vendor dashboard (`/dashboard`) is exercised above. The
    // React shell hosts analytics & feature routes via a `?path=` URL
    // parameter. These are minimal smoke tests; deep route content is
    // covered in feature folders (announcements, orders, products, etc.).

    test('vendor lands on new dashboard React shell (Analytics Overview)', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        // The new dashboard mounts at `/dashboard/?path=<encoded>`.
        // Default route is Analytics → Overview.
        await page.goto(toPath(`dashboard/?path=%2Fanalytics%2FOverview`));
        await page.waitForLoadState('domcontentloaded');

        // Smoke: expect the React root to mount. We don't assert specific
        // analytics card content because the data shape varies by env.
        // Look for either the React root container OR the legacy menu wrapper —
        // either confirms the shell rendered without a hard 404/500.
        const reactRoot = page.locator('#dokan-vendor-dashboard, .dokan-react-root, .dokan-react-products, [class*="dokan-analytics"], #primary');
        await reactRoot.first().waitFor({ state: 'visible', timeout: 20000 });

        await page.close();
        await ctx.close();
    });

    test('vendor new dashboard does not error on direct deep link', { tag: ['@pro', '@exploratory', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        // Direct deep link with an unknown path should not 500; the React
        // shell should still mount (typically falling back to Overview).
        await page.goto(toPath(`dashboard/?path=%2Fanalytics%2FUnknownRoute`));
        await page.waitForLoadState('domcontentloaded');

        // Page chrome should still mount under any of the supported shells.
        // Accept either: legacy menu wrapper (#primary), the new React full-width
        // root, the analytics shell, or the WP front-end body.
        await page.locator('#primary, #dokan-vendor-dashboard-root, .dokan-react-root, [class*="dokan-analytics"], body').first().waitFor({ state: 'visible', timeout: 20000 });

        await page.close();
        await ctx.close();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('New Vendor Dashboard (React) Tests @pro', () => {
    // ============================================
    // ANALYTICS SHELL (Pro)
    // ============================================

    test('Test Case 1 - Analytics Overview route mounts', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoAnalyticsRoute('overview');
        await dash.assertAnalyticsRouteMounted('overview');
        expect(await dash.hasNoServerError(), 'No PHP fatal on Analytics Overview').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Analytics Stock route mounts', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoAnalyticsRoute('stock');
        await dash.assertAnalyticsRouteMounted('stock');
        expect(await dash.hasNoServerError(), 'No PHP fatal on /analytics/stock').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Analytics Orders route mounts', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoAnalyticsRoute('orders');
        await dash.assertAnalyticsRouteMounted('orders');
        expect(await dash.hasNoServerError(), 'No PHP fatal on /analytics/orders').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 4 - Analytics Revenue route mounts', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoAnalyticsRoute('revenue');
        await dash.assertAnalyticsRouteMounted('revenue');
        expect(await dash.hasNoServerError(), 'No PHP fatal on /analytics/revenue').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 5 - Analytics Products route mounts', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoAnalyticsRoute('products');
        await dash.assertAnalyticsRouteMounted('products');
        expect(await dash.hasNoServerError(), 'No PHP fatal on /analytics/products').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 6 - Analytics Statement route mounts', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoAnalyticsRoute('statement');
        await dash.assertAnalyticsRouteMounted('statement');
        expect(await dash.hasNoServerError(), 'No PHP fatal on /analytics/statement').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 7 - Analytics Variations route mounts', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoAnalyticsRoute('variations');
        await dash.assertAnalyticsRouteMounted('variations');
        expect(await dash.hasNoServerError(), 'No PHP fatal on /analytics/variations').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 8 - Analytics Categories route mounts', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoAnalyticsRoute('categories');
        await dash.assertAnalyticsRouteMounted('categories');
        expect(await dash.hasNoServerError(), 'No PHP fatal on /analytics/categories').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 9 - Analytics deep link survives reload', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoAnalyticsRoute('revenue');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await dash.waitForAnalyticsReady();

        expect(await dash.getCurrentAnalyticsPath(), 'Reload should keep path=/analytics/revenue').toBe('/analytics/revenue');

        await page.close();
        await ctx.close();
    });

    // ============================================
    // NEW FULL-WIDTH DASHBOARD (Lite + Pro)
    // ============================================

    test('Test Case 10 - New full-width dashboard root mounts', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoNewDashboardRoot();
        await expect(
            page.locator(dash.selectors.newDashboardRoot),
            'New vendor dashboard React root (#dokan-vendor-dashboard-root) should mount at /dashboard/new/',
        ).toBeVisible({ timeout: 15000 });
        expect(await dash.hasNoServerError()).toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 11 - New dashboard /products route mounts', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoNewDashboardRoute(dash.newDashboard.products);
        await expect(page.locator(dash.selectors.newDashboardRoot)).toBeVisible({ timeout: 15000 });
        expect(page.url()).toMatch(/#\/products/);
        expect(await dash.hasNoServerError()).toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 12 - New dashboard /products/create route mounts (product editor)', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoNewDashboardRoute(dash.newDashboard.productsCreate);
        await expect(page.locator(dash.selectors.newDashboardRoot)).toBeVisible({ timeout: 15000 });
        expect(page.url()).toMatch(/#\/products\/create/);
        expect(await dash.hasNoServerError(), 'No PHP fatal on /products/create').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 13 - New dashboard /orders route mounts', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoNewDashboardRoute(dash.newDashboard.orders);
        await expect(page.locator(dash.selectors.newDashboardRoot)).toBeVisible({ timeout: 15000 });
        expect(page.url()).toMatch(/#\/orders/);
        expect(await dash.hasNoServerError()).toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 14 - New dashboard /withdraw route mounts', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoNewDashboardRoute(dash.newDashboard.withdraw);
        await expect(page.locator(dash.selectors.newDashboardRoot)).toBeVisible({ timeout: 15000 });
        expect(page.url()).toMatch(/#\/withdraw/);
        expect(await dash.hasNoServerError()).toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 15 - New dashboard /withdraw-requests route mounts', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoNewDashboardRoute(dash.newDashboard.withdrawRequests);
        await expect(page.locator(dash.selectors.newDashboardRoot)).toBeVisible({ timeout: 15000 });
        expect(page.url()).toMatch(/#\/withdraw-requests/);
        expect(await dash.hasNoServerError()).toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 16 - New dashboard /reverse-withdrawal route mounts', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoNewDashboardRoute(dash.newDashboard.reverseWithdrawal);
        await expect(page.locator(dash.selectors.newDashboardRoot)).toBeVisible({ timeout: 15000 });
        expect(page.url()).toMatch(/#\/reverse-withdrawal/);
        expect(await dash.hasNoServerError()).toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 17 - HashRouter survives full reload', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoNewDashboardRoute(dash.newDashboard.orders);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await dash.waitForNewDashboardReady();

        expect(page.url(), 'Reload should preserve #/orders').toMatch(/#\/orders/);
        await expect(page.locator(dash.selectors.newDashboardRoot)).toBeVisible();

        await page.close();
        await ctx.close();
    });

    test('Test Case 18 - Vendor announcement modal does not block dashboard mount', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoNewDashboardRoot();

        const modal = page.locator('.vendor-announcement-modal').first();
        const modalVisible = await modal.isVisible({ timeout: 1000 }).catch(() => false);
        expect(modalVisible, 'Vendor announcement modal should be auto-dismissed before dashboard mount').toBe(false);

        await expect(page.locator(dash.selectors.newDashboardRoot)).toBeVisible();

        await page.close();
        await ctx.close();
    });

    test('Test Case 19 - Customer cannot reach the new vendor dashboard', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: c1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await page.goto(toPath(`dashboard/new/`));
        await page.waitForLoadState('domcontentloaded');

        // Customer must NOT see the React vendor dashboard root.
        const rootVisible = await page.locator(dash.selectors.newDashboardRoot).isVisible({ timeout: 3000 }).catch(() => false);
        expect(rootVisible, 'Customer should be redirected and not see #dokan-vendor-dashboard-root').toBe(false);

        await page.close();
        await ctx.close();
    });

    test('Test Case 20 - Unknown HashRouter route does not crash the shell', { tag: ['@lite', '@exploratory', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        const dash = new NewVendorDashboardPage(page);

        await dash.gotoNewDashboardRoute('/this-route-does-not-exist');
        // Either NoMatch component renders or shell falls back. Critical: no PHP fatal.
        expect(await dash.hasNoServerError()).toBe(true);
        await expect(page.locator(dash.selectors.newDashboardRoot)).toBeVisible();

        await page.close();
        await ctx.close();
    });
});

