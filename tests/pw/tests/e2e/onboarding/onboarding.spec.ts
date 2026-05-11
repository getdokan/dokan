import { test, expect } from '@utils/test';
import path from 'path';

const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const BASE = process.env.BASE_URL || 'http://localhost:9999';

// Admin Onboarding Wizard (React) — admin React surface in Dokan 5.0.0+. Mount URL: /wp-admin/admin.php?page=dokan-onboard

test.describe('Admin Onboarding Wizard (React) Tests @pro', () => {
    test('Test Case 1 - Page renders without fatal', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan-onboard`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Page renders content', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(`${BASE}/wp-admin/admin.php?page=dokan-onboard`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});
