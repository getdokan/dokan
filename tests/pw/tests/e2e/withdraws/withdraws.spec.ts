import { expect, test } from '@utils/test';
import path from 'path';
import { toPath } from '@utils/helpers';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

// Old-UI tests retired — covered by tests/e2e/new-withdraw/

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('New Vendor Withdraw (React) Tests @lite', () => {
    test('Test Case 1 - /withdraw route mounts', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/withdraw`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        expect(page.url()).toMatch(/#\/withdraw/);

        const fatal = await page.locator("text=/Fatal error|Parse error|There has been a critical error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal, 'No PHP fatal').toBe(false);

        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - /withdraw-requests route mounts', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/withdraw-requests`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        expect(page.url()).toMatch(/#\/withdraw-requests/);
        const fatal = await page.locator("text=/Fatal error|Parse error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);

        await page.close();
        await ctx.close();
    });

    test('Test Case 3 - Withdraw page shows balance widget', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/withdraw`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Balance.tsx renders a numeric balance — look for currency markers
        // or the typical "balance" / "available" labels.
        const balanceMarkers = page.locator("text=/balance|available|earnings|withdraw/i");
        await expect(balanceMarkers.first()).toBeVisible({ timeout: 10000 });

        await page.close();
        await ctx.close();
    });

    test('Test Case 4 - HashRouter survives reload on /withdraw', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/withdraw`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        expect(page.url()).toMatch(/#\/withdraw/);

        await page.close();
        await ctx.close();
    });

    test('Test Case 5 - Reverse-withdrawal route mounts', { tag: ['@pro', '@vendor'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: v1 });
        const page = await ctx.newPage();

        await page.goto(toPath(`dashboard/new/#/reverse-withdrawal`));
        await page.waitForLoadState('domcontentloaded');
        await page.locator('#dokan-vendor-dashboard-root').waitFor({ state: 'visible', timeout: 30000 });

        expect(page.url()).toMatch(/#\/reverse-withdrawal/);
        const fatal = await page.locator("text=/Fatal error|Parse error/i").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);

        await page.close();
        await ctx.close();
    });
});

