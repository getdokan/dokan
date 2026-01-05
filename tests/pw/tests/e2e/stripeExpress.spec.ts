import { test } from '@playwright/test';
import { stripeExpressPage } from '@pages/stripeExpressPage';

// Clean up after ALL tests are completed
test.afterAll(async ({ browser }) => {
    const adminContext = await browser.newContext({ 
        storageState: 'playwright/.auth/adminStorageState.json' 
    });
    const page = await adminContext.newPage();
    const stripePage = new stripeExpressPage(page);

    try {
        await stripePage.cleanup();
    } catch (error) {
        console.log('Cleanup error (non-critical):', error instanceof Error ? error.message : String(error));
    } finally {
        await page.close();
        await adminContext.close();
    }
});

test.describe('Stripe Express Tests', () => {

    test.describe('Admin Stripe Express Management', () => {
        test.use({
            storageState: 'playwright/.auth/adminStorageState.json'
        });

        test('Admin Can Activate Stripe Express Module @pro', async ({ page }) => {
            const stripePageInstance = new stripeExpressPage(page);
            await stripePageInstance.searchAndActivateStripeExpressModule();
        });

        test('Admin Can Deactivate Stripe Connect Module @pro', async ({ page }) => {
            const stripePageInstance = new stripeExpressPage(page);
            await stripePageInstance.searchAndDeactivateStripeConnectModule();
        });
    });

    test.describe('Vendor 1 Stripe Express', () => {
        test.use({
            storageState: 'playwright/.auth/vendorStorageState.json'
        });

        test('Vendor 1 Is Connected With Stripe Express @pro', async ({ page }) => {
            const stripePageInstance = new stripeExpressPage(page);
            await stripePageInstance.verifyVendorStripeExpressConnection();
        });
    });

    test.describe('Vendor 2 Stripe Express', () => {
        test.use({
            storageState: 'playwright/.auth/vendor2StorageState.json'
        });

        // Add vendor 2 tests here
        // Example:
        // test('Vendor 2 Can Connect Stripe Express Account @pro', async ({ page }) => {
        //     const stripePageInstance = new stripeExpressPage(page);
        //     // Add test steps
        // });
    });

    test.describe('Customer Payment with Stripe Express', () => {
        test.use({
            storageState: 'playwright/.auth/customerStorageState.json'
        });

        // Add customer tests here
        // Example:
        // test('Customer Can Make Payment via Stripe Express @pro', async ({ page }) => {
        //     const stripePageInstance = new stripeExpressPage(page);
        //     // Add test steps
        // });
    });
});

