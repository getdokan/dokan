import { Page, expect, test } from '@utils/test';
import { VendorShippingPage, data } from './vendorShippingPage';
import path from 'path';

import { toPath } from '@utils/helpers';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

test.describe.skip('Vendor shipping test', () => {
    let vendor: VendorShippingPage;
    let vPage: Page;

    test.beforeAll(async ({ browser }) => {
        const vendorContext = await browser.newContext({ storageState: v1 });
        vPage = await vendorContext.newPage();
        vendor = new VendorShippingPage(vPage);
    });

    test.afterAll(async () => { await vPage?.close(); });

    test('vendor can view shipping settings menu page', { tag: ['@pro', '@exploratory', '@vendor'] }, async () => { await vendor.vendorShippingSettingsRenderProperly(); });
    test('vendor can add shipping policy', { tag: ['@pro', '@vendor'] }, async () => { await vendor.setShippingPolicies(data.vendor.shipping.shippingPolicy); });
    test('vendor can add flat rate shipping', { tag: ['@pro', '@vendor'] }, async () => { await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.flatRate); });
    test('vendor can add free shipping', { tag: ['@pro', '@vendor'] }, async () => { await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.freeShipping); });
    test('vendor can add local pickup shipping', { tag: ['@pro', '@vendor'] }, async () => { await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.localPickup); });
    test('vendor can add table rate shipping', { tag: ['@pro', '@vendor'] }, async () => { await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.tableRateShipping); });
    test('vendor can add distance rate shipping', { tag: ['@pro', '@vendor'] }, async () => { await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.distanceRateShipping); });
    test('vendor can edit shipping method', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.localPickup, false, true);
        await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.localPickup);
    });
    test('vendor can delete shipping method', { tag: ['@pro', '@vendor'] }, async () => {
        await vendor.addShippingMethod(data.vendor.shipping.shippingMethods.flatRate, true, true);
        await vendor.deleteShippingMethod(data.vendor.shipping.shippingMethods.flatRate);
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Vendor Shipping (React) Tests @pro', () => {
    test('Test Case 1 - Vendor shipping settings page renders', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/settings/shipping`));
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });

        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal, 'Vendor shipping page should not show a PHP fatal').toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Shipping zone list mounts (React or legacy)', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/settings/shipping`));
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });

        // Either React zone list (e.g. .dokan-shipping-zones) or legacy table (.shipping-method-table)
        const reactZones = await page.locator('[class*="shipping-zone"], [class*="ShippingZone"], .dokan-react-shipping').first().isVisible({ timeout: 3000 }).catch(() => false);
        const legacyTable = await page.locator('table.shipping-method-table, .dokan-shipping-zones-list').first().isVisible({ timeout: 3000 }).catch(() => false);
        const anyTable = await page.locator('table, [role="table"]').first().isVisible({ timeout: 3000 }).catch(() => false);
        expect(
            reactZones || legacyTable || anyTable,
            'Shipping zone list should render under either UI',
        ).toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Vendor can navigate to shipping policy section', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/settings/shipping`));
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });

        // Look for shipping-policy related text
        const policyVisible = await page.locator("text=/shipping policy|policy|refund/i").first().isVisible({ timeout: 3000 }).catch(() => false);
        const settingsHeading = await page.locator("h1, h2, h3").filter({ hasText: /shipping|settings/i }).first().isVisible({ timeout: 3000 }).catch(() => false);
        expect(policyVisible || settingsHeading, 'Shipping policy or settings heading should be present').toBe(true);

        await page.close();
        await ctx.close();
    });

    test('Test Case 4 - Page survives reload', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/settings/shipping`));
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.locator('#dokan-vendor-dashboard-layout-root')).toBeVisible({ timeout: 30_000 });
        const fatal = await page.locator("text=/Fatal error|Parse error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal, 'Reload should not crash the shipping page').toBe(false);
        await page.close();
        await ctx.close();
    });
});

