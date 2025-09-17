import { test, expect } from '@playwright/test';
import { VendorBookingPage } from '@pages/vendorBookingPage';

const { BASE_URL } = process.env;

// Variable to store the original plugin state
let wasPluginActivatedOriginally = false;

// Global setup and teardown for all booking tests
test.beforeAll(async ({ browser }) => {
    const adminContext = await browser.newContext({
        storageState: 'playwright/.auth/adminStorageState.json'
    });
    const page = await adminContext.newPage();
    
    // Check if WooCommerce Bookings plugin is available and get its current state
    await page.goto(`${BASE_URL}/wp-admin/plugins.php`);
    await page.getByRole('searchbox', { name: 'Search installed plugins' }).click();
    await page.getByRole('searchbox', { name: 'Search installed plugins' }).fill('bookings');
    await page.getByText('WooCommerce Bookings', { exact: true }).click();
    
    // Check current plugin state
    const activateLink = page.getByRole('link', { name: 'Activate WooCommerce Bookings' });
    const deactivateLink = page.getByRole('link', { name: 'Deactivate WooCommerce Bookings' });
    
    if (await deactivateLink.isVisible()) {
        // Plugin is already activated
        wasPluginActivatedOriginally = true;
        console.log('WooCommerce Bookings plugin was already activated');
    } else if (await activateLink.isVisible()) {
        // Plugin is not activated, remember this state and activate it for tests
        wasPluginActivatedOriginally = false;
        await activateLink.click();
        console.log('WooCommerce Bookings plugin activated for tests');
    }
    
    await page.close();
    await adminContext.close();
});

test.afterAll(async ({ browser }) => {
    const adminContext = await browser.newContext({
        storageState: 'playwright/.auth/adminStorageState.json'
    });
    const page = await adminContext.newPage();
    
    // Restore the original plugin state
    await page.goto(`${BASE_URL}/wp-admin/plugins.php`);
    await page.getByRole('searchbox', { name: 'Search installed plugins' }).click();
    await page.getByRole('searchbox', { name: 'Search installed plugins' }).fill('bookings');
    await page.getByRole('searchbox', { name: 'Search installed plugins' }).press('Enter');
    
    // Check current plugin state
    const activateLink = page.getByRole('link', { name: 'Activate WooCommerce Bookings' });
    const deactivateLink = page.getByRole('link', { name: 'Deactivate WooCommerce Bookings' });
    
    const isCurrentlyActivated = await deactivateLink.isVisible();
    
    if (wasPluginActivatedOriginally && !isCurrentlyActivated) {
        // Plugin was originally activated but is now deactivated, so activate it back
        await activateLink.click();
        console.log('WooCommerce Bookings plugin activated - restored to original state');
    } else if (!wasPluginActivatedOriginally && isCurrentlyActivated) {
        // Plugin was originally deactivated but is now activated, so deactivate it back
        await deactivateLink.click();
        console.log('WooCommerce Bookings plugin deactivated - restored to original state');
    } else {
        // Plugin is already in its original state
        console.log('WooCommerce Bookings plugin already in original state - no action needed');
    }
    
    await page.close();
    await adminContext.close();
});

test.describe('Vendor Booking Product Tests', () => {
    test.use({ storageState: 'playwright/.auth/vendorStorageState.json' });

    test('Vendor can add a virtual booking product', { tag: ['@pro', '@vendor', '@booking-product', '@bookingProduct-001'] }, async ({ page }) => {
        const vendorBookingPage = new VendorBookingPage(page);

        await test.step('Create virtual booking product with complete configuration', async () => {
            const productData = {
                title: 'Test Virtual Booking Product 1 Vendor 1',
                duration: '10',
                cancellationDays: '3',
                maxBookings: '5',
                minWindow: '1',
                maxWindow: '10',
                baseCost: '100',
                blockCost: '20',
                minPersons: '2',
                maxPersons: '10',
                adultPersonType: {
                    name: 'Adult',
                    baseCost: '10',
                    blockCost: '20',
                    min: '1',
                    max: '2'
                },
                childPersonType: {
                    name: 'Child',
                    baseCost: '2',
                    blockCost: '2',
                    min: '1',
                    max: '5'
                }
            };

            await vendorBookingPage.createVirtualBookingProduct(productData);
        });
    });

    test('Delete the Booking Virtual Product from Vendor', { tag: ['@pro', '@vendor', '@booking-product', '@bookingProduct-002'] }, async ({ page }) => {
        const vendorBookingPage = new VendorBookingPage(page);

        await test.step('Delete the booking product', async () => {
            await vendorBookingPage.deleteBookingProduct('Test Virtual Booking Product 1 Vendor 1');
        });
    });
});