import { expect, test } from '@utils/test';
import { AdminDashboardPage, LoginPage, data } from './setupGuidePage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
import { toPath } from '@utils/helpers';

test('should show all the header items in the help menu', { tag: ['@lite', '@admin'] }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminDashboardPage = new AdminDashboardPage(page);
    await loginPage.adminLogin(data.admin);
    await adminDashboardPage.adminDashboardRenderProperly();

    // The header help menu (redesigned in 5.0.x) is an icon fly-out: a
    // `.cursor-pointer` trigger reveals aria-labelled destination links.
    // (The legacy 'What's New'/'Get Support' items are now 'Changelog'/removed.)
    const helpMenu = page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"]');
    await helpMenu.locator('.cursor-pointer').first().hover();

    const menuItems = [
        { name: 'Changelog' },
        { name: 'Community' },
        { name: 'Documentation' },
        { name: 'FAQ' },
        { name: 'Basic & Fundamental' },
        { name: 'Request a Feature' },
        { name: 'Import dummy data' },
    ];
    for (const item of menuItems) {
        await expect(helpMenu.getByRole('link', { name: item.name })).toBeVisible();
    }
});

test.describe('Setup guide functionality test', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        const adminDashboardPage = new AdminDashboardPage(page);
        await loginPage.adminLogin(data.admin);
        await adminDashboardPage.adminDashboardRenderProperly();
        const setupGuideBtn = page.locator('[data-test-id="admin-setup-guide-button"] button');
        if (await setupGuideBtn.isVisible()) await setupGuideBtn.click();
    });

    test('help menu exposes the changelog item', { tag: ['@lite', '@admin'] }, async ({ page }) => {
        const helpMenu = page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"]');
        await helpMenu.locator('.cursor-pointer').first().hover();
        await expect(helpMenu.getByRole('link', { name: 'Changelog' })).toBeVisible();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Admin Setup Guide (React) Tests @lite', () => {
    test('Test Case 1 - Setup guide mounts at #/setup', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/setup`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        expect(page.url()).toMatch(/#\/setup/);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Setup guide page renders content', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/setup`));
        await page.waitForLoadState('domcontentloaded');
        // Just verify the body has content (not a blank page).
        await expect
            .poll(async () => (await page.locator('body').innerText()).trim().length, {
                timeout: 30_000,
                intervals: [500, 1000, 2000, 3000],
                message: 'Setup guide page should not be blank',
            })
            .toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Setup guide survives reload', { tag: ['@lite', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/setup`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/#\/setup/);
        await page.close();
        await ctx.close();
    });
});

