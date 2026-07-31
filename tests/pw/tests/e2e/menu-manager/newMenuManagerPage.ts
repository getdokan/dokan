import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import { dbUtils } from '@utils/dbUtils';
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
