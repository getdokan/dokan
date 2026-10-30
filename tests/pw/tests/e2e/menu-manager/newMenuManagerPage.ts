import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { dbUtils } from '@utils/dbUtils';
import { dbData } from '@utils/dbData';
import { REACT_ROOT, PHP_FATAL, waitForRootReady as dvWaitForRootReady, hasNoPhpFatal as dvHasNoPhpFatal } from '@utils/dataViews';

// ============================================
// SELECTORS — the React vendor dashboard SIDEBAR (Dokan Pro core feature Menu
// Manager). The sidebar is layout chrome present on every /dashboard/new/#/<route>.
//   dokan-lite/src/vendor-dashboard/layout/components/Sidebar.tsx
// Menu Manager settings (option dokan_menu_manager → dashboard_menu_manager.
// left_menus) drive the React sidebar exactly like the legacy one: a hidden item
// (is_switched_on:'off') returns null → the <a> is ABSENT (count 0), NOT display:none;
// a renamed item (menu_manager_title) changes only the label text (href unchanged);
// reorder sorts by menu_manager_position. sidebarNav is server-localized at page
// load (no client refetch) → a full page.goto is required after each seed. Keys are
// byte-exact from the live window.vendorDashboardLayoutConfig.sidebarNav (withdraw,
// coupons, products, orders, …); anchors carry a stable hash fragment
// (#withdraw / #coupons) that survives rename. Self-contained per NEW_UI_HOUSE_STYLE.md §1.
// ============================================
export const newMenuManagerSelectors = {
    reactRoot: REACT_ROOT,
    sidebar: 'aside.dokan-frontend-sidebar',
    navAnchors: 'aside.dokan-frontend-sidebar nav a',
    phpFatal: PHP_FATAL,
    // The collapsed-sidebar flyout (SubmenuPopover) has no accessible role or name.
    submenuFlyout: '.dokan-submenu-popover',
    storeSocialLinks: 'ul.store-social a',
} as const;

// The vendor1 social links seeded by _env.setup — re-applied so the store-header assertions never depend on another spec.
export const seededSocialLinks = {
    fb: 'https://www.facebook.com/',
    twitter: 'https://www.twitter.com/',
    pinterest: 'https://www.pinterest.com/',
    linkedin: 'https://www.linkedin.com/',
    youtube: 'https://www.youtube.com/',
    instagram: 'https://www.instagram.com/',
    flickr: 'https://www.flickr.com/',
    threads: 'https://www.threads.net/',
} as const;

// NOTE (verified live): is_switched_on is run through wc_string_to_bool, which
// recognizes only 'yes'/'true'/'1' as true — 'on' evaluates to FALSE (hides the
// item). Use 'yes' to show, 'no' to hide.
export interface MenuManagerLeftMenu {
    is_switched_on: 'yes' | 'no';
    menu_manager_position: number;
    menu_manager_title?: string;
}

// ============================================
// PAGE OBJECT — new React vendor Menu Manager (sidebar) (Dokan Pro).
// ============================================
export class NewMenuManagerPage {
    readonly page: Page;
    // Any React route works — the sidebar is layout chrome. Use a stable Lite route.
    readonly url = toPath('dashboard/new/#/products');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Seeding (DB-first; cross-role admin write asserted on the vendor sidebar) ----
    /** Read the current dokan_menu_manager option (for restore). */
    static async snapshotOption(): Promise<unknown> {
        return await dbUtils.getOptionValue('dokan_menu_manager').catch(() => undefined);
    }

    /** Restore the dokan_menu_manager option to a prior value (or {} for defaults). */
    static async restoreOption(prev: unknown): Promise<void> {
        await dbUtils.setOptionValue('dokan_menu_manager', (prev as object) ?? {}, true);
    }

    /**
     * Write dokan_menu_manager.dashboard_menu_manager.left_menus (always injects a
     * menu_manager_position per key — Hooks.php reads it unconditionally). Keys NOT
     * present default to shown, so configure only the keys under test.
     */
    static async seedLeftMenus(leftMenus: Record<string, MenuManagerLeftMenu>): Promise<void> {
        await dbUtils.setOptionValue('dokan_menu_manager', { dashboard_menu_manager: { left_menus: leftMenus } }, true);
    }

    /** Same for the Settings sub menu rows (store, payment, shipping, social, seo). */
    static async seedSettingsSubMenus(subMenus: Record<string, MenuManagerLeftMenu>): Promise<void> {
        await dbUtils.setOptionValue('dokan_menu_manager', { dashboard_menu_manager: { left_menus: {}, settings_sub_menu: subMenus } }, true);
    }

    static async setAppearance(values: { vendor_layout_style?: 'latest' | 'legacy'; store_header_template?: string }): Promise<void> {
        await dbUtils.updateOptionValue(dbData.dokan.optionName.appearance, values);
    }

    // ---- Navigation ----
    /** Fresh navigation — sidebarNav is localized at page load, so reload picks up the seed. */
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.page
            .locator(newMenuManagerSelectors.sidebar)
            .first()
            .waitFor({ state: 'visible', timeout: 20000 })
            .catch(() => undefined);
        await this.page.waitForTimeout(600);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    /** Deep-link a React route by hash (e.g. 'settings/social') — a switched-off one must render Permission Denied. */
    async gotoRoute(route: string): Promise<void> {
        await this.page.goto(toPath(`dashboard/new/#${route}`));
        // A hash-only change is a same-document navigation: reload so dokanFrontend.restrictedRoutes is re-localized after a DB seed.
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.page.waitForTimeout(600);
    }

    async isForbidden(): Promise<boolean> {
        return await this.page.getByText('Permission Denied').first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
    }

    forbiddenView(): Locator {
        return this.page.getByText('Permission Denied', { exact: true });
    }

    backToDashboard(): Locator {
        return this.page.getByRole('link', { name: 'Back to Dashboard' });
    }

    async restrictedRoutes(): Promise<string[]> {
        return await this.page.evaluate(() => (window as any).dokanFrontend?.restrictedRoutes ?? []);
    }

    /** Collapse the sidebar and hover a parent icon to open its flyout (collapsed icons carry no accessible name, so match by href). */
    async openCollapsedFlyout(parentHrefFragment: string): Promise<Locator> {
        await this.page.getByRole('button', { name: 'Toggle sidebar menu' }).click();
        await this.navLink(parentHrefFragment).first().hover();
        const flyout = this.page.locator(newMenuManagerSelectors.submenuFlyout);
        await flyout.waitFor({ state: 'visible' });
        return flyout;
    }

    /** A legacy PHP dashboard page (e.g. 'settings/social/'), gated server-side by Pro's AccessRestriction. */
    async gotoLegacy(path: string): Promise<void> {
        await this.page.goto(toPath(`dashboard/${path}`));
        await this.page.waitForLoadState('domcontentloaded');
    }

    legacyNoPermission(): Locator {
        return this.page.getByText('You have no permission to view this page');
    }

    storeSocialLinks(): Locator {
        return this.page.locator(newMenuManagerSelectors.storeSocialLinks);
    }

    /** The route's own form rendered (the positive counterpart of isForbidden). */
    async routeRendered(selector: string): Promise<boolean> {
        return await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
    }

    // ---- Reads ----
    /** A sidebar anchor whose href contains the given fragment (e.g. '#withdraw', '#coupons'). */
    navLink(hrefFragment: string): Locator {
        return this.page.locator(`${newMenuManagerSelectors.sidebar} nav a[href*="${hrefFragment}"]`);
    }

    async navLinkCount(hrefFragment: string): Promise<number> {
        return await this.navLink(hrefFragment).count();
    }

    async navLinkText(hrefFragment: string): Promise<string> {
        const a = this.navLink(hrefFragment).first();
        return ((await a.innerText().catch(() => '')) ?? '').trim();
    }

    /** Ordered list of nav anchors as {href, text} (for reorder assertions). */
    async navItemsInOrder(): Promise<Array<{ href: string; text: string }>> {
        return await this.page.locator(newMenuManagerSelectors.navAnchors).evaluateAll(els => els.map(e => ({ href: (e as HTMLAnchorElement).getAttribute('href') ?? '', text: (e.textContent ?? '').trim() })));
    }

    /** Index of the first nav anchor whose href contains the fragment (−1 if absent). */
    async navIndex(hrefFragment: string): Promise<number> {
        const items = await this.navItemsInOrder();
        return items.findIndex(i => i.href.includes(hrefFragment));
    }
}
