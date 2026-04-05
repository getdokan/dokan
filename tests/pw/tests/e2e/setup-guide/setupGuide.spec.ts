import { expect, test } from '@playwright/test';
import { AdminDashboardPage, LoginPage, data } from './setupGuidePage';

test.skip('should redirect all the header items from the help menu', { tag: ['@lite', '@admin'] }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminDashboardPage = new AdminDashboardPage(page);
    await loginPage.adminLogin(data.admin);
    await adminDashboardPage.adminDashboardRenderProperly();

    const setupGuideBtn = page.locator('[data-test-id="admin-setup-guide-button"] button');
    if (await setupGuideBtn.isVisible()) await setupGuideBtn.click();

    const menuItems = [
        { name: "What's New" },
        { name: 'Get Support' },
        { name: 'Community' },
        { name: 'Documentation' },
        { name: 'FAQ' },
        { name: 'Basic & Fundamental' },
        { name: 'Request a Feature' },
        { name: 'Import dummy data' },
    ];

    await page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"] button').hover();
    for (const item of menuItems) {
        const helpMenuItem = page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"]').getByRole('link', { name: item.name });
        await expect(helpMenuItem).toBeVisible();
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

    test.skip('should redirect all the header items from the help menu', { tag: ['@lite', '@admin'] }, async ({ page }) => {
        const menuItems = [{ name: "What's New" }];
        await page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"] button').hover();
        for (const item of menuItems) {
            const helpMenuItem = page.locator('[data-test-id="dokan-dashboard-header-help-menu-container"]').getByRole('link', { name: item.name });
            await expect(helpMenuItem).toBeVisible();
        }
    });
});
