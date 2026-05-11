import { test, expect } from '@playwright/test';
import { AdminPage } from './adminPage';
import path from 'path';

import { toPath } from '@utils/helpers';
const fatalLocator = "text=/Fatal error|Parse error|There has been a critical error/i";
const adminReactRoot = '#dokan-vendor-dashboard, #dokan-admin-dashboard, [class*="dokan-admin"], #wpwrap';
async function openAdminRoute(browser: import('@playwright/test').Browser, hash: string) {
    const a1Path = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
    const ctx = await browser.newContext({ storageState: a1Path });
    const page = await ctx.newPage();
    await page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#${hash.startsWith('/') ? hash : '/' + hash}`));
    await page.waitForLoadState('domcontentloaded');
    return { ctx, page };
}

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');    // Admin session storage

// ============================================
// TEST CASES
// ============================================

test.describe('Admin Tests @lite', () => {
    // ============================================
    // LOGIN & LOGOUT TESTS
    // ============================================

    test('Test Case 1 - Admin can login', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        // Using a fresh context (no storage state) to test the actual login flow
        const context = await browser.newContext();
        const page = await context.newPage();
        const adminPage = new AdminPage(page);

        // Navigate to admin login page and fill credentials
        await adminPage.adminLogin(adminPage.testData.admin.username, adminPage.testData.admin.password);

        // Verify login succeeded by checking the WP admin dashboard text is visible
        await adminPage.page.locator(adminPage.admin.dashboardText).waitFor({ state: 'visible' });

        await adminPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    test('Test Case 2 - Admin can logout', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        // Using a fresh context (no storage state) to test the login-then-logout flow
        const context = await browser.newContext();
        const page = await context.newPage();
        const adminPage = new AdminPage(page);

        // Login first
        await adminPage.adminLogin(adminPage.testData.admin.username, adminPage.testData.admin.password);

        // Logout via the backend user menu
        await adminPage.adminLogout();

        // Verify logout succeeded by confirming the login form is visible again
        const isLoginForm = await adminPage.page.locator(adminPage.admin.usernameInput).isVisible();
        expect(isLoginForm, 'Login form should be visible after logout').toBe(true);

        await adminPage.waitForPageReady();
        await page.close();
        await context.close();
    });

    // ============================================
    // DASHBOARD & ADMIN NOTICE TESTS
    // ============================================

    test('Test Case 3 - Admin can view Dokan dashboard', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const admin = new AdminPage(adminPage);

        // Navigate to Dokan dashboard and verify it renders correctly
        await admin.adminDashboardRenderProperly();

        await admin.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 4 - Multiple promo notices are available and count matches', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const admin = new AdminPage(adminPage);

        // Mock the promo notices endpoint before navigation to ensure notices render
        await admin.mockPromoNotices();

        // Navigate to Dokan dashboard
        await admin.adminDashboardRenderProperly();

        // Verify the promo notice heading is visible
        await admin.expectTotalNotices();

        await admin.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 5 - A promo notice is visible and has a title', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const admin = new AdminPage(adminPage);

        // Mock the promo notices endpoint before navigation to ensure notices render
        await admin.mockPromoNotices();

        // Navigate to Dokan dashboard
        await admin.adminDashboardRenderProperly();

        // Verify at least one promo notice is visible and has a non-empty title
        const title = await admin.getVisibleNoticeTitle();
        expect(title, 'A visible promo notice should have a non-empty title').toBeTruthy();

        await admin.waitForPageReady();
        await adminPage.close();
        await context.close();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Admin Dokan Dashboard (React) Tests @lite', () => {
    test('Test Case 1 - / (root) route mounts', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const { ctx, page } = await openAdminRoute(browser, '/');
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/page=dokan-dashboard/);
        expect(await page.locator(fatalLocator).first().isVisible({ timeout: 1000 }).catch(() => false)).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - /vendors mounts', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const { ctx, page } = await openAdminRoute(browser, '/vendors');
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/vendors/);
        expect(await page.locator(fatalLocator).first().isVisible({ timeout: 1000 }).catch(() => false)).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - /vendors/create mounts', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const { ctx, page } = await openAdminRoute(browser, '/vendors/create');
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/vendors\/create/);
        expect(await page.locator(fatalLocator).first().isVisible({ timeout: 1000 }).catch(() => false)).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 4 - /pro-modules mounts', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const { ctx, page } = await openAdminRoute(browser, '/pro-modules');
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/pro-modules/);
        expect(await page.locator(fatalLocator).first().isVisible({ timeout: 1000 }).catch(() => false)).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 5 - /setup (setup guide) mounts', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const { ctx, page } = await openAdminRoute(browser, '/setup');
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/setup/);
        expect(await page.locator(fatalLocator).first().isVisible({ timeout: 1000 }).catch(() => false)).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 6 - /extensions mounts', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const { ctx, page } = await openAdminRoute(browser, '/extensions');
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/extensions/);
        expect(await page.locator(fatalLocator).first().isVisible({ timeout: 1000 }).catch(() => false)).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 7 - /changelog mounts', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const { ctx, page } = await openAdminRoute(browser, '/changelog');
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/changelog/);
        // The changelog renders historical fix messages that include the
        // word "error" or even "fatal error" in body copy. We don't apply
        // the generic fatal-text guard here — instead we just confirm the
        // shell mounts and there's no explicit WP fatal banner.
        const wpFatal = await page.locator('.notice-error, body.error-page').first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(wpFatal, 'No WP fatal-error notice/page should render on /changelog').toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 8 - /dummy-data mounts', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const { ctx, page } = await openAdminRoute(browser, '/dummy-data');
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/dummy-data/);
        expect(await page.locator(fatalLocator).first().isVisible({ timeout: 1000 }).catch(() => false)).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 9 - /reverse-withdrawal mounts', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const { ctx, page } = await openAdminRoute(browser, '/reverse-withdrawal');
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/reverse-withdrawal/);
        expect(await page.locator(fatalLocator).first().isVisible({ timeout: 1000 }).catch(() => false)).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 10 - /withdraw (admin) mounts', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const { ctx, page } = await openAdminRoute(browser, '/withdraw');
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/withdraw/);
        expect(await page.locator(fatalLocator).first().isVisible({ timeout: 1000 }).catch(() => false)).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 11 - Unknown HashRouter route falls through (NoMatch)', { tag: ['@lite', '@exploratory', '@admin'] }, async ({ browser }) => {
        const { ctx, page } = await openAdminRoute(browser, '/this-does-not-exist');
        await page.waitForTimeout(2000);
        expect(await page.locator(fatalLocator).first().isVisible({ timeout: 1000 }).catch(() => false)).toBe(false);
        // The shell still renders (#wpwrap from WP admin layout)
        await expect(page.locator(adminReactRoot).first()).toBeVisible();
        await page.close();
        await ctx.close();
    });

    test('Test Case 12 - Reload preserves /vendors route', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const { ctx, page } = await openAdminRoute(browser, '/vendors');
        await page.waitForTimeout(2000);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/vendors/);
        await page.close();
        await ctx.close();
    });
});

