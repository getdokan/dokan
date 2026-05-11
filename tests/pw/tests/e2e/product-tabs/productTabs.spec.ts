import { test, expect } from '@utils/test';

import { toPath } from '@utils/helpers';

// Product Tabs (React) — front-end React surface in Dokan 5.0.0+. Mount URL: /product/p1_v1-simple/

test.describe('Product Tabs (React) Tests @pro', () => {
    test('Test Case 1 - Page renders without fatal', { tag: ['@pro', '@guest'] }, async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(toPath(`product/p1_v1-simple/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - Page renders content', { tag: ['@pro', '@guest'] }, async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(toPath(`product/p1_v1-simple/`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(4000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});
