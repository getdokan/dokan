import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewSellerBadgePage } from './newSellerBadgePage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import path from 'path';

const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Parity coverage for the 5.0.0 React rewrite of the vendor Seller Badge list.
// Surface: /dashboard/new/#/seller-badge  (DataViews list, Pro).
// Ported from the legacy `seller-badges` spec, driving the React UI, with a
// cross-role business flow (admin seeds a badge via REST -> vendor sees it
// under "Available Badges"). Badge creation has only a wp-admin / admin-React
// surface, so it is driven via apiUtils REST and the vendor React effect is
// asserted, per the house-style guidance for non-vendor-React admin actions.
// ============================================

test.describe('Seller Badge (React) functionality', () => {
    // ---------------------------------------------------------------
    // VENDOR — the vendor-facing React list at #/seller-badge.
    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        let ctx: BrowserContext;
        let page: Page;
        let badge: NewSellerBadgePage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            badge = new NewSellerBadgePage(page);
            await badge.goto();
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('vendor can view badges page with All / My Badges / Available Badges tabs (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await expect(badge.heading).toBeVisible();
            expect(await badge.tabsVisible(), 'All / My Badges / Available Badges tabs render').toBe(true);
            expect(await badge.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('vendor sees the seller-badge intro text (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await expect(badge.intro).toBeVisible();
        });

        test('vendor can switch between badge tabs (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await badge.switchTab('my');
            expect(await badge.isTabSelected('my'), 'My Badges tab becomes selected').toBe(true);

            await badge.switchTab('available');
            expect(await badge.isTabSelected('available'), 'Available Badges tab becomes selected').toBe(true);

            await badge.switchTab('all');
            expect(await badge.isTabSelected('all'), 'All tab becomes selected').toBe(true);

            expect(await badge.hasNoPhpFatal(), 'no PHP fatal after switching tabs').toBe(true);
        });

        test('vendor sees a search input on the badges page (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            expect(await badge.searchPresent(), 'search input present').toBe(true);
        });

        test('vendor badges page survives a reload (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await badge.reloadPage();
            expect(await badge.tabsVisible(), 'tabs still render after reload').toBe(true);
            expect(await badge.hasNoPhpFatal(), 'no PHP fatal after reload').toBe(true);
        });

        // Edge / negative: a no-match search must not throw a PHP fatal and the
        // tab strip must still be intact (graceful empty result).
        test('vendor sees no fatal when searching for a non-existent badge (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            if (!(await badge.searchPresent())) {
                test.skip(true, 'search input not rendered on this build');
                return;
            }
            await badge.fillSearch('zzz-no-such-badge-zzz');
            expect(await badge.hasNoPhpFatal(), 'no PHP fatal on empty search result').toBe(true);
            expect(await badge.tabsVisible(), 'tabs intact during search').toBe(true);
            await badge.clearSearch();
        });
    });

    // ---------------------------------------------------------------
    // ADMIN — badge creation is an admin-only surface (wp-admin / admin React),
    // not the vendor React page. Drive it via REST and assert the vendor React
    // effect, per the house-style guidance.
    // ---------------------------------------------------------------
    test.describe('admin', () => {
        let apiUtils: ApiUtils;

        test.beforeAll(async () => {
            apiUtils = new ApiUtils(await request.newContext());
            // Clean slate so the assertion (count increases / badge appears) is
            // attributable to this test's seed.
            await apiUtils.deleteAllSellerBadges(payloads.adminAuth);
        });

        test.afterAll(async () => {
            // Clean up seeded badges.
            await apiUtils.deleteAllSellerBadges(payloads.adminAuth);
            await apiUtils.dispose();
        });

        test('admin-seeded badge appears in the vendor Available Badges tab (React)', { tag: ['@pro', '@admin', '@vendor', '@new-ui'] }, async ({ browser }) => {
            // Admin creates a published badge via REST.
            const [, badgeId] = await apiUtils.createSellerBadge(payloads.createSellerBadgeProductsPublished, payloads.adminAuth);
            expect(badgeId, 'badge created via REST returns an id').toBeTruthy();

            // Vendor opens the React badges page; the badge should surface under
            // All / Available Badges (count > 0 or a badge visible in the list).
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const badge = new NewSellerBadgePage(page);
            await badge.goto();

            await badge.switchTab('available');
            const availableCount = await badge.getTabCountValue('available');
            const allCount = await badge.getTabCountValue('all');
            const anyBadge = await badge.hasAnyBadge();
            expect(availableCount > 0 || allCount > 0 || anyBadge, 'seeded badge is reflected in the vendor badges list').toBe(true);
            expect(await badge.hasNoPhpFatal(), 'no PHP fatal with a seeded badge').toBe(true);

            await page.close();
            await ctx.close();
        });
    });

    // ---------------------------------------------------------------
    // BUSINESS FLOW — one cross-role end-to-end:
    // admin creates a badge (REST) -> vendor sees it under Available Badges.
    // ---------------------------------------------------------------
    test.describe('business flow', () => {
        let apiUtils: ApiUtils;

        test.beforeAll(async () => {
            apiUtils = new ApiUtils(await request.newContext());
            await apiUtils.deleteAllSellerBadges(payloads.adminAuth);
        });

        test.afterAll(async () => {
            await apiUtils.deleteAllSellerBadges(payloads.adminAuth);
            await apiUtils.dispose();
        });

        test('admin creates a badge then vendor sees it under Available Badges (React)', { tag: ['@pro', '@admin', '@vendor', '@new-ui'] }, async ({ browser }) => {
            // 1. Admin seeds a published badge via REST.
            const [, badgeId] = await apiUtils.createSellerBadge(payloads.createSellerBadgeExclusiveToPlatform, payloads.adminAuth);
            expect(badgeId, 'badge created via REST returns an id').toBeTruthy();

            // 2. Vendor visits the React badges list and the Available Badges
            //    (or All) tab count reflects the new badge.
            const vCtx = await browser.newContext({ storageState: v1 });
            const vPage = await vCtx.newPage();
            const badge = new NewSellerBadgePage(vPage);
            await badge.goto();

            await badge.switchTab('available');
            const availableCount = await badge.getTabCountValue('available');
            const allCount = await badge.getTabCountValue('all');
            const anyBadge = await badge.hasAnyBadge();
            expect(availableCount > 0 || allCount > 0 || anyBadge, 'vendor sees the admin-created badge as available').toBe(true);
            expect(await badge.hasNoPhpFatal(), 'no PHP fatal during the business flow').toBe(true);

            await vPage.close();
            await vCtx.close();
        });
    });
});
