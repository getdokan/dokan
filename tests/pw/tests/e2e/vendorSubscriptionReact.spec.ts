import { test, expect, Page } from "@playwright/test";

const { VENDOR, USER_PASSWORD } = process.env;

// Login and navigate to the subscription page as a vendor.
async function navigateToSubscriptionPageAsVendor( page: Page ) {
    await page.goto('/my-account/');
    await page.locator('#username').fill( VENDOR );
    await page.locator('#password').fill( USER_PASSWORD );
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('link', { name: ' Subscription' }).click();
}

test('vendor can visit new dashboard subscriptions page', async ({ page }) => {
    await navigateToSubscriptionPageAsVendor( page );
    await expect(page).toHaveURL('https://dokan-dev.test/dashboard/new/#/subscription?tab=packs');
});

test('vendor can see new dashboard subscriptions page contents', async ({ page }) => {
    await navigateToSubscriptionPageAsVendor( page );
    await expect(page.getByRole('heading', { name: 'Subscription', exact: true })).toBeVisible();
});

test('vendor can see new dashboard subscriptions page current subscription tab', async ({ page }) => {
    await navigateToSubscriptionPageAsVendor( page );
    await expect(page.locator('#tab-panel-0-packs')).toContainText('Subscription Packs');
});

test('vendor can see new dashboard subscriptions page current subscription section', async ({ page }) => {
    await navigateToSubscriptionPageAsVendor( page );
    await expect(page.getByLabel('Subscription Packs')).toContainText('Current Subscription');
});

test('vendor can see new dashboard subscriptions page subscription packages section', async ({ page }) => {
    await navigateToSubscriptionPageAsVendor( page );
    await expect(page.getByLabel('Subscription Packs')).toContainText('Subscription Packages');
});

test('vendor can see new dashboard subscriptions page subscription orders tab', async ({ page }) => {
    await navigateToSubscriptionPageAsVendor( page );
    await expect(page.locator('#tab-panel-0-orders')).toContainText('Subscription Orders');
});

test('vendor can see new dashboard subscriptions page subscription orders table', async ({ page }) => {
    await navigateToSubscriptionPageAsVendor( page );
    await page.getByRole('tab', { name: 'Subscription Orders' }).click();
    await expect(page.locator('thead')).toContainText('Order');
});
