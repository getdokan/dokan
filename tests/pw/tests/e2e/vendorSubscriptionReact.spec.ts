import { test, expect } from '@playwright/test';

test('vendor can visit new dashboard subscriptions page', async ({ page }) => {
    await page.goto('https://dokan-dev.test/my-account/');
    // await page.locator('#username').click();
    await page.locator('#username').fill('vendor1');
    // await page.locator('#password').click();
    await page.locator('#password').fill('vendor1');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('link', { name: ' Subscription' }).click();
    await expect(page).toHaveURL('https://dokan-dev.test/dashboard/new/#/subscription?tab=packs');
});

test('vendor can see new dashboard subscriptions page contents', async ({ page }) => {
    await page.goto('https://dokan-dev.test/my-account/');
    await page.locator('#username').fill('vendor1');
    await page.locator('#password').fill('vendor1');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('link', { name: ' Subscription' }).click();
    await expect(page.getByRole('heading', { name: 'Subscription', exact: true })).toBeVisible();
});

test('vendor can see new dashboard subscriptions page current subscription tab', async ({ page }) => {
    await page.goto('https://dokan-dev.test/my-account/');
    await page.locator('#username').fill('vendor1');
    await page.locator('#password').fill('vendor1');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('link', { name: ' Subscription' }).click();
    await expect(page.locator('#tab-panel-0-packs')).toContainText('Subscription Packs');
});

test('vendor can see new dashboard subscriptions page current subscription section', async ({ page }) => {
    await page.goto('https://dokan-dev.test/my-account/');
    await page.locator('#username').fill('vendor1');
    await page.locator('#password').fill('vendor1');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('link', { name: ' Subscription' }).click();
    await expect(page.getByLabel('Subscription Packs')).toContainText('Current Subscription');
});

test('vendor can see new dashboard subscriptions page subscription packages section', async ({ page }) => {
    await page.goto('https://dokan-dev.test/my-account/');
    await page.locator('#username').fill('vendor1');
    await page.locator('#password').fill('vendor1');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('link', { name: ' Subscription' }).click();
    await expect(page.getByLabel('Subscription Packs')).toContainText('Subscription Packages');
});

test('vendor can see new dashboard subscriptions page subscription orders tab', async ({ page }) => {
    await page.goto('https://dokan-dev.test/my-account/');
    await page.locator('#username').fill('vendor1');
    await page.locator('#password').fill('vendor1');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('link', { name: ' Subscription' }).click();
    await expect(page.locator('#tab-panel-0-orders')).toContainText('Subscription Orders');
});

test('vendor can see new dashboard subscriptions page subscription orders table', async ({ page }) => {
    await page.goto('https://dokan-dev.test/my-account/');
    await page.locator('#username').fill('vendor1');
    await page.locator('#password').fill('vendor1');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('link', { name: ' Subscription' }).click();
    await page.getByRole('tab', { name: 'Subscription Orders' }).click();
    await expect(page.locator('thead')).toContainText('Order');
});
