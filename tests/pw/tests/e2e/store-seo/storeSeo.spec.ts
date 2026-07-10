import { test, expect } from '@utils/test';
import path from 'path';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
import { toPath } from '@utils/helpers';

// RETIRED (Wave 0, D6): fully superseded by tests/e2e/store-seo/ which
// drives the real React surface /dashboard/new/#/settings/seo with behavioral
// assertions (save, persistence after reload, single-field update, clear,
// storefront <head> oracle). Despite the "(React)" title, these two smokes
// navigated the LEGACY /dashboard/settings/seo/ URL and asserted only
// no-fatal / body-text length — no coverage exists here that new-store-seo
// does not exceed.

test.describe.skip('Store SEO (React) Tests @pro', () => {
    test('Test Case 1 - Page renders without fatal', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`dashboard/settings/seo/`));
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
        await page.goto(toPath(`dashboard/settings/seo/`));
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
