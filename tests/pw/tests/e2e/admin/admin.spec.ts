import { test, expect } from '@playwright/test';
import { AdminPage } from './adminPage';
import path from 'path';

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

    test('Test Case 1 - Admin can login', async ({ browser }) => {
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

    test('Test Case 2 - Admin can logout', async ({ browser }) => {
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

    test('Test Case 3 - Admin can view Dokan dashboard', async ({ browser }) => {
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

    test('Test Case 4 - Multiple promo notices are available and count matches', async ({ browser }) => {
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

    test('Test Case 5 - A promo notice is visible and has a title', async ({ browser }) => {
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
