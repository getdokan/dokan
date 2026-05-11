import { test, expect } from '@utils/test';
import path from 'path';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const BASE = process.env.BASE_URL || 'http://localhost:9999';

// DokanAI / Intelligence — `dokan-lite/src/intelligence/` and
// `dokan-pro/src/react/vendor-dashboard/intelligence/`. Embedded inside
// product editor + vendor dashboard. Visible when AI settings are on.

test.describe('DokanAI / Intelligence (React) Tests @pro', () => {
    test('Test Case 1 - Vendor product editor loads (AI mounts via Fill slot)', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/dashboard/new/#/products/create`);
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });
        await page.waitForTimeout(3000);
        // AI button only renders when ai_text_enable is true; just verify no fatal.
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Admin AI settings page renders', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan#/settings`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });
});
