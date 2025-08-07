import { test, expect } from '@playwright/test';

test.describe.only('Configuration', () => {
    test.use({ storageState: 'playwright/.auth/adminStorageState.json' });

    test('Global Settings: Allow Vendors to Create Orders', async ({ page }) => {
        await page.goto('/wp-admin/admin.php?page=dokan#/settings');
        await page.locator('div').filter({ hasText: /^Selling Options$/ }).click();
        await page.locator('fieldset').filter({ hasText: 'Allow Vendors to Create Orders Enable vendors to create orders manually from' }).locator('span').nth(1).click();
        await page.getByRole('button', { name: 'Save Changes' }).click();

        // Expected result.
        await expect(page.locator('fieldset').filter({ hasText: 'Allow Vendors to Create Orders Enable vendors to create orders manually from' }).locator('span').nth(1)).toBeChecked();
    });

    test('Vendor Profile: Enable Order Creation', async ({ page }) => {
        await page.goto('/wp-admin/admin.php?page=dokan#/vendors');
        await page.getByRole('link', { name: 'example', exact: true }).click();
        // start from here
        await page.locator('div:nth-child(5) > .checkbox-left > .switch > .slider').click();
        await page.getByRole('button', { name: 'Save Changes' }).first().click();
        await page.getByRole('button', { name: 'OK' }).click();
    });
})
