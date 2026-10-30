import { test, expect, Page, BrowserContext } from '@utils/test';
import { request } from '@playwright/test';
import { NewMenuManagerPage, MenuManagerLeftMenu, seededSocialLinks } from './newMenuManagerPage';
import { ApiUtils } from '@utils/apiUtils';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { payloads } from '@utils/payloads';
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

        test('menu-manager hide refuses the settings route by URL (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            // [cross-role DB] switch the Social Profile settings page off — the sidebar hides it, the deep link must not open it.
            await NewMenuManagerPage.seedSettingsSubMenus({ social: { is_switched_on: 'no', menu_manager_position: 90 } });
            await menu.gotoRoute('settings/social');
            expect(await menu.isForbidden(), 'the switched-off Social Profile route renders Permission Denied').toBe(true);
            // React Router matches the hash case-insensitively and decoded, so these reach the same route and must be refused too.
            await menu.gotoRoute('settings/Social');
            expect(await menu.isForbidden(), 'a mixed-case hash is refused').toBe(true);
            await menu.gotoRoute('settings/%73ocial');
            expect(await menu.isForbidden(), 'a percent-encoded hash is refused').toBe(true);

            await NewMenuManagerPage.seedSettingsSubMenus({ social: { is_switched_on: 'yes', menu_manager_position: 90 } });
            await menu.gotoRoute('settings/social');
            expect(await menu.routeRendered('#social-fb'), 'the Social Profiles form renders again once the page is switched on').toBe(true);
        });
    });

    // ---------------------------------------------------------------
    test.describe('vendor: switched-off routes, flyout and legacy pages', () => {
        test.describe.configure({ mode: 'serial' });

        const off = (menu_manager_position: number): MenuManagerLeftMenu => ({ is_switched_on: 'no', menu_manager_position });
        let originalLayout: string;
        let ctx: BrowserContext;
        let page: Page;
        let menu: NewMenuManagerPage;

        test.beforeAll(async () => {
            originalLayout = (await dbUtils.getOptionValue(dbData.dokan.optionName.appearance))?.vendor_layout_style ?? 'latest';
        });

        test.afterAll(async () => {
            await NewMenuManagerPage.setAppearance({ vendor_layout_style: originalLayout as 'latest' | 'legacy' });
        });

        test.beforeEach(async ({ browser }) => {
            await NewMenuManagerPage.seedSettingsSubMenus({ social: off(90), seo: off(95) });
            ctx = await browser.newContext({ storageState: v1 });
            page = await ctx.newPage();
            menu = new NewMenuManagerPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        test('restrictedRoutes lists exactly the switched-off SPA routes (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await menu.gotoRoute('settings/store');
            expect((await menu.restrictedRoutes()).sort()).toEqual(['settings/seo', 'settings/social']);
        });

        test('a switched-off Store SEO route renders Permission Denied (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await menu.gotoRoute('settings/seo');
            await expect(menu.forbiddenView()).toBeVisible();
        });

        for (const route of ['/settings/social/', 'settings/social?tab=x', 'settings/social/anything']) {
            test(`a route variant under a switched-off page is refused: ${route} (React)`, { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
                await menu.gotoRoute(route);
                await expect(menu.forbiddenView()).toBeVisible();
            });
        }

        test('routes that stay switched on still render (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await menu.gotoRoute('settings/shipping');
            await expect(page.getByRole('heading', { name: 'Shipping', exact: true })).toBeVisible();
            await expect(menu.forbiddenView()).toHaveCount(0);

            await menu.gotoRoute('settings/store');
            await expect(page.getByRole('heading', { name: 'Store Settings' })).toBeVisible();
            await expect(menu.forbiddenView()).toHaveCount(0);
        });

        test('Back to Dashboard leaves the Permission Denied view (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await menu.gotoRoute('settings/social');
            await menu.backToDashboard().click();
            await expect(page).not.toHaveURL(/settings\/social/);
            await expect(menu.forbiddenView()).toHaveCount(0);
        });

        test('a switched-off top-level menu refuses its route and child routes (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await NewMenuManagerPage.seedLeftMenus({ coupons: { is_switched_on: 'no', menu_manager_position: 55, menu_manager_title: '' } });
            await menu.gotoRoute('coupons');
            await expect(menu.forbiddenView()).toBeVisible();
            await menu.gotoRoute('coupons/new');
            await expect(menu.forbiddenView()).toBeVisible();
        });

        // React Router matches case-insensitively on the decoded path; the gate compares the raw path (dokan#3481 QA comment).
        for (const route of ['settings/Social', 'settings/SOCIAL', 'settings/%73ocial', 'Settings/Seo']) {
            test(`a mixed-case or encoded switched-off route is refused: ${route} (React)`, { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
                test.fail(true, 'Known bypass: isRestrictedRoute() is case- and encoding-sensitive — remove once fixed');
                await menu.gotoRoute(route);
                await expect(menu.forbiddenView()).toBeVisible({ timeout: 10000 });
            });
        }

        test('the legacy vendor layout refuses a switched-off route too (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await NewMenuManagerPage.setAppearance({ vendor_layout_style: 'legacy' });
            await menu.gotoRoute('settings/social');
            expect(await menu.restrictedRoutes()).toContain('settings/social');
            await expect(menu.forbiddenView()).toBeVisible();
            await NewMenuManagerPage.setAppearance({ vendor_layout_style: originalLayout as 'latest' | 'legacy' });
        });

        test('the collapsed-sidebar flyout hides switched-off submenus (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await menu.gotoRoute('settings/store');
            const flyout = await menu.openCollapsedFlyout('#settings/store');
            await expect(flyout.getByRole('link', { name: 'Shipping', exact: true })).toBeVisible();
            await expect(flyout.getByRole('link', { name: 'Social Profile' })).toHaveCount(0);
            await expect(flyout.getByRole('link', { name: 'Store SEO' })).toHaveCount(0);
        });

        test('the collapsed-sidebar flyout shows a switched-on submenu again (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await NewMenuManagerPage.seedSettingsSubMenus({ seo: off(95) });
            await menu.gotoRoute('settings/store');
            const flyout = await menu.openCollapsedFlyout('#settings/store');
            await expect(flyout.getByRole('link', { name: 'Social Profile' })).toBeVisible();
            await expect(flyout.getByRole('link', { name: 'Store SEO' })).toHaveCount(0);
        });

        test('the collapsed-sidebar flyout marks the active submenu in white (React)', { tag: ['@pro', '@vendor', '@new-ui'] }, async () => {
            await menu.gotoRoute('settings/shipping');
            const flyout = await menu.openCollapsedFlyout('#settings/store');
            const active = flyout.getByRole('link', { name: 'Shipping', exact: true });
            await expect(active).toHaveClass(/(^|\s)active(\s|$)/);
            await expect(active).toHaveCSS('color', 'rgb(255, 255, 255)');
            await expect(flyout.getByRole('link', { name: 'ShipStation' })).not.toHaveClass(/(^|\s)active(\s|$)/);
        });

        for (const slug of ['social', 'seo']) {
            test(`a switched-off legacy settings page is refused server-side: ${slug} (Pro AccessRestriction)`, { tag: ['@pro', '@vendor'] }, async () => {
                await menu.gotoLegacy(`settings/${slug}/`);
                await expect(menu.legacyNoPermission()).toBeVisible();
            });
        }

        test('a switched-on legacy settings page still renders (Pro AccessRestriction)', { tag: ['@pro', '@vendor'] }, async () => {
            await menu.gotoLegacy('settings/payment/');
            await expect(menu.legacyNoPermission()).toHaveCount(0);
        });
    });

    // ---------------------------------------------------------------
    test.describe('guest: store page social links', () => {
        test.describe.configure({ mode: 'serial' });

        let originalHeader: string;
        let storeUrl: string;
        let ctx: BrowserContext;
        let page: Page;
        let menu: NewMenuManagerPage;

        test.beforeAll(async () => {
            originalHeader = (await dbUtils.getOptionValue(dbData.dokan.optionName.appearance))?.store_header_template ?? 'default';
            const sellerId = await apiUtils.getSellerId(`${process.env.VENDOR}store`, payloads.adminAuth);
            await apiUtils.updateStore(sellerId, { social: seededSocialLinks }, payloads.adminAuth);
            storeUrl = (await apiUtils.getSingleStore(sellerId, payloads.adminAuth)).shop_url;
        });

        test.afterAll(async () => {
            await NewMenuManagerPage.setAppearance({ store_header_template: originalHeader });
        });

        test.beforeEach(async ({ browser }) => {
            ctx = await browser.newContext();
            page = await ctx.newPage();
            menu = new NewMenuManagerPage(page);
        });

        test.afterEach(async () => {
            await page?.close();
            await ctx?.close();
        });

        for (const template of ['default', 'layout1', 'layout2', 'layout3']) {
            test(`store header hides the vendor social links while Social Profile is off: ${template}`, { tag: ['@pro', '@guest'] }, async () => {
                await NewMenuManagerPage.setAppearance({ store_header_template: template });

                await NewMenuManagerPage.seedSettingsSubMenus({ social: { is_switched_on: 'no', menu_manager_position: 90 } });
                await page.goto(storeUrl);
                await expect(menu.storeSocialLinks()).toHaveCount(0);

                await NewMenuManagerPage.seedSettingsSubMenus({ social: { is_switched_on: 'yes', menu_manager_position: 90 } });
                await page.goto(storeUrl);
                await expect(menu.storeSocialLinks()).not.toHaveCount(0);
            });
        }
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
