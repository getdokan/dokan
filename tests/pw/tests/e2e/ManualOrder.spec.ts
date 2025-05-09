import { test, expect } from '@playwright/test';

test.describe.only('Configuration', () => {
    test.use({ storageState: 'playwright/.auth/adminStorageState.json' });

    test('Global Settings: Allow Vendors to Create Orders', async ({ page }) => {
        await page.goto('https://dokan-development.test/wp-admin/admin.php?page=dokan#/settings');
        await page.locator('div').filter({ hasText: /^Store Settings, Commissions$/ }).click();
        await page.getByRole('group').filter({ hasText: 'Allow Vendors to Create Orders Enable vendors to create orders manually from' }).locator('span').nth(1).click();

        // Expected result.
        await page.reload();
        await expect(page.getByRole('group').filter({ hasText: 'Allow Vendors to Create Orders Enable vendors to create orders manually from' }).locator('span').nth(1)).toBeChecked();
    });

    test('Vendor Profile: Enable Order Creation', async ({ page }) => {
        await page.goto('https://dokan-development.test/wp-admin/admin.php?page=dokan#/vendors');
        await page.locator('.wp-list-table tr:has(.enabled [type="checkbox"]:checked) td.store_name').nth(1).click();
        await page.locator('.wp-list-table tr:has(.enabled [type="checkbox"]:checked) td.store_name').nth(1).getByRole('link').nth(1).click();
        await page.locator('.payment-info.edit-mode .checkbox-left:has(input[type="checkbox"][value="enableManualOrder"])').click();
        await page.locator('.checkbox-left:has(input[type="checkbox"][value="enableManualOrder"]) .switch > .slider').click();
        await page.locator('.profile-banner.edit-mode .action-links.edit-mode .button.button-primary').click();
        await page.getByRole('dialog', { name: 'Vendor Updated' }).click();
        await page.getByRole('button', { name: 'OK' }).click();

        // Expected result.
        await page.locator('.profile-banner .action-links .button.router-link-active').click();
        await expect(page.locator('.payment-info.edit-mode .checkbox-left:has(input[type="checkbox"][value="enableManualOrder"])')).toBeVisible();
        console.log(page.locator('.payment-info.edit-mode .checkbox-left input[type="checkbox"][value="enableManualOrder"]'))
        await expect(page.locator('.payment-info.edit-mode .checkbox-left input[type="checkbox"][value="enableManualOrder"]')).toBeChecked();
    });
})
