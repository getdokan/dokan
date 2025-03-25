import { test, expect } from '@playwright/test';

test.only('test', async ({ page }) => {
    await page.goto('https://dokan-dev.test/my-account/');
    await page.getByLabel('Username or email address *').click();
    await page.getByLabel('Username or email address *').fill('vendor1');
    await page.getByLabel('Username or email address *').press('Tab');
    await page.locator('#password').fill('vendor1');
    await page.locator('#password').press('Enter');
    await page.getByRole('link', { name: ' Subscription' }).click();
});
