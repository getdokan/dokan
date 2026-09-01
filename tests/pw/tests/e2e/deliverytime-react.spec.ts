import { test, Page, expect } from "@playwright/test";
import { data } from '@utils/testData';
import { VendorPage } from '@pages/vendorPage';

test.describe('Delivery time test', () => {
    let vendor: VendorPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext(data.auth.vendorAuth);

        aPage = await vendorContext.newPage();
        vendor = new VendorPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('vendor can go to dashboard page and successfully found the heading', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.goToVendorDashboard();
        await aPage.getByRole('link', { name: ' Delivery Time' }).first().click();

        // Wait for 5 seconds
        await aPage.waitForTimeout( 3000 );

        // Look for h3 inside dokan-header-title with text 'Delivery Time & Store Pickup'
        const headerTitle = aPage.locator('.dokan-header-title h3:has-text("Delivery Time & Store Pickup")');
        await expect(headerTitle).toBeVisible();

        await aPage.locator('.css-1nxca15-UA').click();
        await aPage.getByRole('option', { name: 'Delivery' }).click();
        await aPage.getByRole('button', { name: 'Filter' }).click();
        await aPage.locator('.css-1nxca15-UA').click();
        await aPage.getByRole('option', { name: 'Store Pickup' }).click();
        await aPage.getByRole('button', { name: 'Filter' }).click();
        await aPage.locator('.css-1nxca15-UA').click();
        await aPage.getByRole('option', { name: 'All Events' }).click();
        await aPage.getByRole('button', { name: 'Filter' }).click();
        await aPage.getByRole('button', { name: 'week' }).click();
        await aPage.getByRole('button', { name: 'day', exact: true }).click();
        await aPage.getByRole('button', { name: 'list' }).click();
        await aPage.getByRole('button', { name: 'month' }).click();
        await aPage.getByRole('button', { name: 'Next month' }).click();
        await aPage.getByRole('button', { name: 'Next month' }).click();
        await aPage.getByRole('button', { name: 'Previous month' }).click();
        await aPage.getByRole('button', { name: 'Previous month' }).click();
        await aPage.getByRole('button', { name: 'Previous month' }).click();
        await aPage.getByRole('button', { name: 'today' }).click();
    });

    test('vendor can go to delivery time settings and verify labels', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.goIfNotThere(data.subUrls.frontend.vDashboard.settingsDeliveryTimeReact);

        // Wait for the page to load
        await aPage.waitForTimeout(3000);

        // Look for h3 inside dokan-header-title with text 'Delivery Time & Store Pickup'
        const headerTitle = aPage.locator('.dokan-header-title h3:has-text("Delivery Time & Store Pickup")');
        await expect(headerTitle).toBeVisible();

        // Check for the presence of the specified labels
        const deliverySupportLabel = aPage.locator('label:has-text("Delivery Support:")');
        await expect(deliverySupportLabel).toBeVisible();

        const deliveryBlockedBufferLabel = aPage.locator('label:has-text("Delivery blocked buffer :")');
        await expect(deliveryBlockedBufferLabel).toBeVisible();

        const timeSlotLabel = aPage.locator('label:has-text("Time slot :")');
        await expect(timeSlotLabel).toBeVisible();

        const orderPerSlotLabel = aPage.locator('label:has-text("Order per slot :")');
        await expect(orderPerSlotLabel).toBeVisible();


        await aPage.getByRole('checkbox', { name: 'Home Delivery' }).check();
        await aPage.getByRole('checkbox', { name: 'Home Delivery' }).uncheck();
        await aPage.getByRole('checkbox', { name: 'Store Pickup' }).check();
        await aPage.getByRole('checkbox', { name: 'Store Pickup' }).uncheck();
        await aPage.getByRole('spinbutton', { name: 'Delivery blocked buffer :' }).click();
        await aPage.getByRole('spinbutton', { name: 'Delivery blocked buffer :' }).fill('10');
        await aPage.getByRole('spinbutton', { name: 'Time slot :' }).click();
        await aPage.getByRole('spinbutton', { name: 'Time slot :' }).press('ControlOrMeta+a');
        await aPage.getByRole('spinbutton', { name: 'Time slot :' }).fill('60');
        await aPage.getByRole('spinbutton', { name: 'Order per slot :' }).click();
        await aPage.getByRole('spinbutton', { name: 'Order per slot :' }).press('ControlOrMeta+a');
        await aPage.getByRole('spinbutton', { name: 'Order per slot :' }).fill('1');

        await aPage.getByRole('button', { name: 'Save Changes' }).click();

        await aPage.waitForTimeout(100);
        const successMessage = aPage.locator('p:has-text("Delivery settings has been saved successfully!")');
        await expect(successMessage).toBeVisible();
    });

});
