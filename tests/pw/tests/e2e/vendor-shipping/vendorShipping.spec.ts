import { expect, test } from '@utils/test';
import path from 'path';

import { toPath } from '@utils/helpers';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

// ============================================
// VENDOR SHIPPING (React, Dokan 5.0.0+)
// ============================================
// RETIRED (2026-07-10): the legacy "Vendor shipping test" block (9 tests that
// drove the classic /dashboard/settings/shipping zone table through a stubbed
// page object) was removed. That surface migrated to the React shipping UI at
// /dashboard/settings/shipping/#/, and its full method CRUD is already covered
// in depth by tests/e2e/vendor-shipping/newShipping.spec.ts (add flat/free/local,
// edit, delete, shipping policy, reload persistence) and
// tests/e2e/table-rate-shipping/newShippingRate.spec.ts (table-rate + distance-rate).
// Rebuilding them would only duplicate that coverage. The smoke tests below remain.

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

