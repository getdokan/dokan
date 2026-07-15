import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewMenuManagerPage } from './newMenuManagerPage';
import { ApiUtils } from '@utils/apiUtils';
import { VENDOR_STORAGE_STATE as v1, CUSTOMER_STORAGE_STATE as c1 } from '@utils/authStates';

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// Net-new coverage for the F7 gap: Menu Manager's effect on the React vendor
// SIDEBAR. Every existing new-UI spec deep-links via hash and therefore BYPASSES
// nav rendering, so menu-manager coverage silently evaporated in the conversion.
// The React sidebar (Sidebar.tsx) genuinely honors dokan_menu_manager: hide (item
// returns null → <a> absent), rename (menu_manager_title → label text only), reorder
// (menu_manager_position). Menu Manager is core Pro (no module toggle). The legacy
// menu-manager/ spec's page object is a NO-OP STUB (every "admin can rename/hide/
// reorder" test asserts nothing) — this is net-new vendor coverage, not a port. The
// admin settings-page validations (45-char cap, can't-rename-disabled, reset,
// dashboard/store-can't-hide) STAY legacy (admin-UI-only guarantees, D3).
//
// Seeding is an admin/DB write (dbUtils.setOptionValue) asserted on the vendor
// React sidebar → each is a cross-role DB→vendor step. sidebarNav is localized at
// page load, so a fresh goto per test is mandatory. Nav keys/positions are the live
// values (withdraw pos 70, coupons pos 55, products pos 30). The option is restored
// in afterAll (shared global — never leak). Assert on presence/absence + relative
// order, never exact global counts (§7).
// ============================================

let apiUtils: ApiUtils;
let originalOption: unknown;

test.describe('Menu Manager (React) functionality', () => {
    test.beforeAll(async () => {
        apiUtils = new ApiUtils(await request.newContext());
        originalOption = await NewMenuManagerPage.snapshotOption();
    });

    test.afterAll(async () => {
        // Restore the sidebar to its pre-test configuration (defaults if none).
        await NewMenuManagerPage.restoreOption(originalOption);
        await apiUtils?.dispose();
    });

    // ---------------------------------------------------------------
    test.describe('vendor', () => {
        test.describe.configure({ mode: 'serial' }); // shared global option

        let ctx: BrowserContext;
        let page: Page;
        let menu: NewMenuManagerPage;

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            menu = new NewMenuManagerPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('menu-manager rename shows the renamed label on the React sidebar (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // [cross-role DB] rename the Withdraw menu.
            await NewMenuManagerPage.seedLeftMenus({ withdraw: { is_switched_on: 'yes', menu_manager_position: 70, menu_manager_title: 'Withdrawals' } });
            await menu.goto();
            expect(await menu.navLinkCount('#withdraw'), 'the withdraw nav item is still present').toBeGreaterThan(0);
            expect(await menu.navLinkText('#withdraw'), 'the withdraw label reflects the menu-manager rename').toMatch(/Withdrawals/i);
            expect(await menu.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('menu-manager hide removes the item from the React sidebar (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // [cross-role DB] hide the Coupons menu.
            await NewMenuManagerPage.seedLeftMenus({ coupons: { is_switched_on: 'no', menu_manager_position: 55, menu_manager_title: '' } });
            await menu.goto();
            expect(await menu.navLinkCount('#coupons'), 'the hidden Coupons item is absent from the sidebar').toBe(0);
            // Control: a non-hidden item still renders (proves the seed didn't blank the nav).
            expect(await menu.navLinkCount('#products'), 'a non-hidden item (Products) still renders').toBeGreaterThan(0);
            expect(await menu.hasNoPhpFatal(), 'no PHP fatal').toBe(true);
        });

        test('menu-manager reorder changes the sidebar order (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // Default: products (pos 30) comes before withdraw (pos 70). Move withdraw
            // to the very top (pos 5) so it renders BEFORE products.
            await NewMenuManagerPage.seedLeftMenus({ withdraw: { is_switched_on: 'yes', menu_manager_position: 5, menu_manager_title: 'Withdraw' } });
            await menu.goto();
            const withdrawIdx = await menu.navIndex('#withdraw');
            const productsIdx = await menu.navIndex('#products');
            expect(withdrawIdx, 'withdraw nav item found').toBeGreaterThanOrEqual(0);
            expect(productsIdx, 'products nav item found').toBeGreaterThanOrEqual(0);
            expect(withdrawIdx, 'withdraw now sorts before products after the reorder').toBeLessThan(productsIdx);
        });
    });

    // ---------------------------------------------------------------
    test.describe('cross-role', () => {
        let ctx: BrowserContext;
        let page: Page;

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('a logged-in customer cannot mount the vendor dashboard sidebar (React)', { tag: ['@pro', '@customer', '@new-ui'] }, async ({ browser }) => {
            ctx = await browser.newContext({ storageState: c1 });
            page = await ctx.newPage();
            const menu = new NewMenuManagerPage(page);
            await page.goto(menu.url);
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            expect(await page.locator('#dokan-vendor-dashboard-root').count(), 'the vendor SPA root does not mount for a customer').toBe(0);
        });
    });
});
