import { test, expect } from '@utils/test';
import path from 'path';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
import { toPath } from '@utils/helpers';

// Product Bulk Edit (React) — vendor-side React surface in Dokan 5.0.0+. Mount URL: /dashboard/products/

test.describe('Product Bulk Edit (React) Tests @pro', () => {
    test('Test Case 1 - Page renders without fatal', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/products/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Page renders content', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/products/`));
        await page.waitForLoadState('domcontentloaded');
        await expect
            .poll(async () => (await page.locator('body').innerText()).trim().length, {
                timeout: 30_000,
                intervals: [500, 1000, 2000, 3000],
            })
            .toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});
