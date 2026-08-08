import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { AdminModulesPage, adminModulesData } from './adminModulesPage';
import { ApiUtils } from '@utils/apiUtils';
import { payloads } from '@utils/payloads';
import path from 'path';

// ============================================
// ADMIN MODULES / PRO-MODULES — new React admin dashboard (Dokan 5.0.0+)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/pro-modules (ModulePage).
//
// IMPORTANT: this React route is a SELF-CONTAINED Lite "advertise" grid. It
// reads a static list baked into the PHP page settings (Modules.php) and renders
// one marketing Card per module. It NEVER activates a module — toggling ANY card
// switch opens the Upgrade-to-Pro modal. So there is NO vendor/customer state to
// seed (see admin-dashboard-seeding-strategy.md § "Self-contained admin areas":
// "Modules ... need ZERO vendor/customer precondition").
//
// To keep the FOCUS's activate/deactivate state-management honoured we add ONE
// @pro backend test that drives the REAL module system via the REST API
// (apiUtils.getAllModuleIds / activateModules / deactivateModules, admin auth)
// and RESETS the toggled module afterwards. That endpoint is a different surface
// from this read-only advertise grid, so it does not assert against the UI.
// ============================================

// SESSION STORAGE STATES
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');

let apiUtils: ApiUtils;

test.describe('Admin Modules (pro-modules) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await apiUtils.dispose();
    });

    // ----------------------------------------
    test.describe('happy paths', () => {
        let ctx: BrowserContext;
        let page: Page;
        let modules: AdminModulesPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            modules = new AdminModulesPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('admin can view the Modules grid with the header and module cards', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            await expect(modules.reactRoot).toBeVisible();
            await expect(modules.heading).toBeVisible();
            await expect(modules.proModulesLabel).toBeVisible();
            expect(await modules.getCardCount(), 'module cards render').toBeGreaterThan(0);
            expect(await modules.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('the Pro Modules header count equals the number of rendered cards', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            const headerCount = await modules.getHeaderModuleCount();
            const cardCount = await modules.getCardCount();
            expect(headerCount, 'header label exposes a non-zero count').toBeGreaterThan(0);
            expect(cardCount, 'rendered card count matches the header count').toBe(headerCount);
        });

        test('modules are sorted alphabetically A-Z (first card is Auction Integration)', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            expect(await modules.getFirstCardTitle()).toBe(adminModulesData.firstModuleAlphabetical);
        });

        test('searching by title substring filters the grid case-insensitively', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            await modules.search(adminModulesData.stripeSearch.term);
            expect(await modules.getCardCount(), 'a "stripe" search shows exactly the two Stripe cards').toBe(adminModulesData.stripeSearch.expectedCount);
            await expect(modules.cardByTitle('Stripe Connect')).toBeVisible();
            await expect(modules.cardByTitle('Stripe Express')).toBeVisible();
        });

        test('clearing the search box restores the full module grid', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            const full = await modules.getCardCount();
            await modules.search(adminModulesData.auctionSearch.term);
            expect(await modules.getCardCount()).toBeLessThan(full);
            await modules.clearSearch();
            expect(await modules.getCardCount(), 'grid restored to the full set after clearing search').toBe(full);
        });

        test('selecting a category filters the grid to modules with that tag', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            const full = await modules.getCardCount();
            await modules.filterByCategory(adminModulesData.paymentTag);
            const filtered = await modules.getCardCount();
            expect(filtered, 'a category filter narrows the grid').toBeGreaterThan(0);
            expect(filtered, 'a category filter shows fewer cards than the full grid').toBeLessThan(full);
            await expect(modules.cardByTitle(adminModulesData.paymentModule)).toBeVisible();
        });

        test('an active filter renders a removable chip and a Clear filter button', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            await modules.filterByCategory(adminModulesData.paymentTag);
            await expect(modules.filterChip(adminModulesData.paymentTag)).toBeVisible();
            await expect(modules.clearFilterButton).toBeVisible();
            await modules.clearFilter();
            await expect(modules.clearFilterButton).toBeHidden();
        });

        test('clicking a card tag pill adds that tag to the active filter', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            await modules.clickCardTag(adminModulesData.firstModuleAlphabetical, adminModulesData.productManagementTag);
            await expect(modules.filterChip(adminModulesData.productManagementTag)).toBeVisible();
            await expect(modules.clearFilterButton).toBeVisible();
        });

        test('toggling a module switch opens the Upgrade-to-Pro modal instead of activating it', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            await modules.toggleModule(adminModulesData.firstModuleAlphabetical);
            expect(await modules.isUpgradeModalOpen(), 'the upgrade modal opens on toggle').toBe(true);
            await expect(modules.upgradeCta).toBeVisible();
            await expect(page.getByText(/Flat 20%/i).first()).toBeVisible();
            await expect(page.getByText('LiteUpgrade20').first()).toBeVisible();
        });

        test('closing the Upgrade modal returns to the grid', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            await modules.toggleModule(adminModulesData.firstModuleAlphabetical);
            expect(await modules.isUpgradeModalOpen()).toBe(true);
            await modules.closeUpgradeModal();
            await expect(modules.upgradeDialog).toBeHidden();
            expect(await modules.getCardCount(), 'grid is still rendered after closing the modal').toBeGreaterThan(0);
        });
    });

    // ----------------------------------------
    test.describe('edge cases', () => {
        let ctx: BrowserContext;
        let page: Page;
        let modules: AdminModulesPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: a1 });
            page = await ctx.newPage();
            modules = new AdminModulesPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('search with no match renders an empty grid and no error', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            await modules.search(adminModulesData.searchMiss);
            expect(await modules.getCardCount(), 'no card matches an impossible search').toBe(0);
            expect(await modules.hasNoPhpFatal(), 'empty grid is not an error state').toBe(true);
        });

        test('search with regex metacharacters matches literally and does not crash', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            await modules.search(adminModulesData.regexSearch);
            // Treated literally: no module title contains "a+b*(c", so the grid empties.
            expect(await modules.getCardCount(), 'metacharacters are matched literally, not as a pattern').toBe(0);
            expect(await modules.hasNoPhpFatal(), 'a metacharacter search must not fatal').toBe(true);
            // The page is still interactive: clearing restores the grid.
            await modules.clearSearch();
            expect(await modules.getCardCount()).toBeGreaterThan(0);
        });

        test('a script string in the search box is treated as plain text and never executes', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            await modules.search(adminModulesData.xssSearch);
            const executed = await page.evaluate(() => (window as unknown as { __amodXss?: number }).__amodXss === 1);
            expect(executed, 'the injected script must NOT run').toBe(false);
            expect(await modules.getCardCount(), 'the markup is matched as a literal title substring (no match)').toBe(0);
            expect(await modules.hasNoPhpFatal()).toBe(true);
        });

        test('hard reload of the pro-modules route re-renders the grid after HashRouter rehydration', { tag: ['@lite', '@admin'] }, async () => {
            await modules.goto();
            await modules.reload();
            await expect(page).toHaveURL(/#\/pro-modules/);
            await expect(modules.reactRoot).toBeVisible();
            await expect(modules.heading).toBeVisible();
            expect(await modules.getCardCount(), 'cards re-render after reload').toBeGreaterThan(0);
        });
    });

    // ----------------------------------------
    test.describe('backend module state (real module system)', () => {
        // The advertise grid above never activates modules. This @pro test
        // exercises the REAL module system the FOCUS calls out — activate /
        // deactivate / getAllModuleIds via the admin REST API — and RESETS the
        // module it toggles so the suite stays idempotent. It does NOT depend on
        // the read-only Lite advertise UI.
        test('admin can activate then deactivate a module via the REST module API (and reset)', { tag: ['@pro', '@admin', '@exploratory'] }, async () => {
            const moduleId = payloads.moduleIds.storeReviews;

            // Discover the catalogue; skip cleanly if this module is not present
            // in the current build (e.g. a Lite-only environment).
            const catalogue = await apiUtils.getAllModules({}, payloads.adminAuth);
            const original = catalogue.find((m: { id: string; active?: boolean }) => m.id === moduleId);
            test.skip(!original, `module "${moduleId}" not present in this build`);

            // Capture the ORIGINAL ACTIVE STATE, not mere presence. The catalogue lists every
            // module regardless of state, so `getAllModuleIds().includes()` is always true and
            // would make the reset below unconditionally deactivate — leaving Store Reviews off
            // for every later spec on this shard (it broke adminDataViewsMigration's tab assertions).
            const wasActive = original?.active === true;

            // Activate -> verify it reports active in the catalogue.
            const [activateRes] = await apiUtils.activateModules(moduleId, payloads.adminAuth);
            expect(activateRes.ok(), 'activate request succeeds').toBe(true);
            let after = await apiUtils.getAllModules({}, payloads.adminAuth);
            let target = after.find((m: { id: string; active?: boolean }) => m.id === moduleId);
            expect(target?.active, 'module reports active after activation').toBe(true);

            // Deactivate -> verify it reports inactive.
            const [deactivateRes] = await apiUtils.deactivateModules(moduleId, payloads.adminAuth);
            expect(deactivateRes.ok(), 'deactivate request succeeds').toBe(true);
            after = await apiUtils.getAllModules({}, payloads.adminAuth);
            target = after.find((m: { id: string; active?: boolean }) => m.id === moduleId);
            expect(target?.active, 'module reports inactive after deactivation').toBe(false);

            // RESET to the observed original state — the test ends deactivated, so only an
            // originally-active module needs re-activating.
            if (wasActive) {
                await apiUtils.activateModules(moduleId, payloads.adminAuth);
            }
        });
    });

    // ----------------------------------------
    test.describe('negative cases', () => {
        test('a logged-in vendor cannot access the admin Modules page', { tag: ['@lite', '@vendor'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: v1 });
            const page = await ctx.newPage();
            const modules = new AdminModulesPage(page);
            await page.goto(modules.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await modules.isAccessDenied(), 'a vendor must not see the admin Modules UI').toBe(true);
            await ctx.close();
        });

        test('a logged-in customer cannot access the admin Modules page', { tag: ['@lite', '@customer'] }, async ({ browser }) => {
            const ctx = await browser.newContext({ storageState: c1 });
            const page = await ctx.newPage();
            const modules = new AdminModulesPage(page);
            await page.goto(modules.url);
            await page.waitForLoadState('domcontentloaded');
            expect(await modules.isAccessDenied(), 'a customer must not see the admin Modules UI').toBe(true);
            await ctx.close();
        });
    });
});
