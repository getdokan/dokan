import { test } from '@playwright/test';
import { VendorBookingPage } from './productsDetailsBookingsPage';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

const { BASE_URL } = process.env;

let wasPluginActivatedOriginally = false;

test.beforeAll(async ({ browser }) => {
    const adminContext = await browser.newContext({ storageState: a1 });
    const page = await adminContext.newPage();

    await page.goto(`${BASE_URL}/wp-admin/plugins.php`);
    await page.getByRole('searchbox', { name: 'Search installed plugins' }).click();
    await page.getByRole('searchbox', { name: 'Search installed plugins' }).fill('bookings');
    await page.getByText('WooCommerce Bookings', { exact: true }).click();

    const activateLink = page.getByRole('link', { name: 'Activate WooCommerce Bookings' });
    const deactivateLink = page.getByRole('link', { name: 'Deactivate WooCommerce Bookings' });

    if (await deactivateLink.isVisible()) {
        wasPluginActivatedOriginally = true;
    } else if (await activateLink.isVisible()) {
        wasPluginActivatedOriginally = false;
        await activateLink.click();
    }

    await page.close();
    await adminContext.close();
});

test.afterAll(async ({ browser }) => {
    const adminContext = await browser.newContext({ storageState: a1 });
    const page = await adminContext.newPage();

    await page.goto(`${BASE_URL}/wp-admin/plugins.php`);
    await page.getByRole('searchbox', { name: 'Search installed plugins' }).click();
    await page.getByRole('searchbox', { name: 'Search installed plugins' }).fill('bookings');
    await page.getByRole('searchbox', { name: 'Search installed plugins' }).press('Enter');

    const activateLink = page.getByRole('link', { name: 'Activate WooCommerce Bookings' });
    const deactivateLink = page.getByRole('link', { name: 'Deactivate WooCommerce Bookings' });

    const isCurrentlyActivated = await deactivateLink.isVisible();

    if (wasPluginActivatedOriginally && !isCurrentlyActivated) {
        await activateLink.click();
    } else if (!wasPluginActivatedOriginally && isCurrentlyActivated) {
        await deactivateLink.click();
    }

    await page.close();
    await adminContext.close();
});

test.describe('Vendor Booking Product Tests', () => {
    test.use({ storageState: v1 });

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
                adultPersonType: { name: 'Adult', baseCost: '10', blockCost: '20', min: '1', max: '2' },
                childPersonType: { name: 'Child', baseCost: '2', blockCost: '2', min: '1', max: '5' },
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
