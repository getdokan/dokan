import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import {
    REACT_ROOT,
    PHP_FATAL,
    waitForRootReady as dvWaitForRootReady,
    waitForListReady as dvWaitForListReady,
    hasNoPhpFatal as dvHasNoPhpFatal,
    rawRowCount,
    parseTabCount,
    fillDataViewsSearch,
    clearDataViewsSearch,
    isEmptyStateVisible,
} from '@utils/dataViews';

// ============================================
// SELECTORS — verified against the live /dashboard/new/#/seller-badge render
// (DataViews-style list, Pro). The three status tabs are `role="tab"` buttons
// whose accessible name carries a count, e.g. "All (0)", "My Badges (0)",
// "Available Badges (0)". Search is `input[placeholder="Search"]`.
// See tmp-explore/seller-badge.json + seller-badge.html.
// ============================================
export const newSellerBadgeSelectors = {
    reactRoot: REACT_ROOT,
    heading: 'h3:has-text("Badge"), h2:has-text("Badge")',
    intro: 'text=/Vendors with a good selling history/i',
    // Status tabs (role=tab; count rendered in a nested span).
    tabAll: 'role=tab[name=/^All/i]',
    tabMyBadges: 'role=tab[name=/My Badges/i]',
    tabAvailableBadges: 'role=tab[name=/Available Badges/i]',
    anyTab: 'role=tab',
    // Search input (DataViews header).
    searchInput: 'input[placeholder="Search"]',
    // List surface — DataViews can render either a table (rows) or a card grid.
    dataRow: 'table tbody tr, [role="row"]',
    // Badge cards (card-grid rendering of the list).
    badgeCard: '[class*="badge"], [data-slot="card"], .dokan-badge-card',
    // Empty state.
    emptyState: 'text=/no data found|no badges|no items|nothing to show|no result/i',
    phpFatal: PHP_FATAL,
} as const;

// ============================================
// PAGE OBJECT — new React Seller Badge list (Dokan 5.0.0+)
// Surface: /dashboard/new/#/seller-badge (DataViews list). Pro feature.
// Self-contained per house-style §1 (folders never import each other;
// shared DataViews primitives come from @utils/dataViews).
// ============================================
export class NewSellerBadgePage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/seller-badge');

    constructor(page: Page) {
        this.page = page;
        // Mandatory for every vendor-facing page object: auto-dismiss the
        // Dokan Pro vendor-announcement modal on every navigation.
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get heading(): Locator { return this.page.locator(newSellerBadgeSelectors.heading).first(); }
    get intro(): Locator { return this.page.locator(newSellerBadgeSelectors.intro).first(); }
    get allTab(): Locator { return this.page.locator(newSellerBadgeSelectors.tabAll).first(); }
    get myBadgesTab(): Locator { return this.page.locator(newSellerBadgeSelectors.tabMyBadges).first(); }
    get availableBadgesTab(): Locator { return this.page.locator(newSellerBadgeSelectors.tabAvailableBadges).first(); }
    get searchInput(): Locator { return this.page.locator(newSellerBadgeSelectors.searchInput).first(); }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** React root visible AND (the heading OR the tab strip) present (§5). */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await dvWaitForRootReady(this.page, timeoutMs);
        // Readiness signal here is the tab strip (or heading), NOT rows — the
        // badge list legitimately renders zero rows on a fresh seed.
        await dvWaitForListReady(this.page, {
            rowSelector: newSellerBadgeSelectors.anyTab,
            extraReady: () => this.heading.isVisible(),
        });
    }

    async reloadPage(): Promise<void> {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    // ---- Tabs ----
    /**
     * All three status tabs visible (the core "no PHP fatal / renders" check).
     * A DataViews search triggers a client-side re-render that briefly detaches
     * the tab strip; an instant isVisible() read taken in that gap flakes under
     * parallel load. Wait (bounded) for each tab to settle back visible before
     * reading — still genuinely requires all three, no weakening.
     */
    async tabsVisible(): Promise<boolean> {
        for (const tab of [this.allTab, this.myBadgesTab, this.availableBadgesTab]) {
            const ok = await tab
                .waitFor({ state: 'visible', timeout: 5000 })
                .then(() => true)
                .catch(() => false);
            if (!ok) return false;
        }
        return true;
    }

    async tabCount(): Promise<number> {
        return await this.page.locator(newSellerBadgeSelectors.anyTab).count();
    }

    async switchTab(tab: 'all' | 'my' | 'available'): Promise<void> {
        const locator = tab === 'all' ? this.allTab : tab === 'my' ? this.myBadgesTab : this.availableBadgesTab;
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.click();
        // tab refilter is client-side; allow the list to re-render.
        await this.page.waitForTimeout(600);
    }

    async isTabSelected(tab: 'all' | 'my' | 'available'): Promise<boolean> {
        const locator = tab === 'all' ? this.allTab : tab === 'my' ? this.myBadgesTab : this.availableBadgesTab;
        return (await locator.getAttribute('aria-selected')) === 'true';
    }

    /** Numeric count parsed from a tab's accessible name, e.g. "Available Badges (3)" -> 3. */
    async getTabCountValue(tab: 'all' | 'my' | 'available'): Promise<number> {
        const locator = tab === 'all' ? this.allTab : tab === 'my' ? this.myBadgesTab : this.availableBadgesTab;
        const text = (await locator.textContent({ timeout: 10000 }).catch(() => '')) ?? '';
        return parseTabCount(text);
    }

    // ---- Search ----
    async searchPresent(): Promise<boolean> {
        return await this.searchInput.isVisible({ timeout: 10000 }).catch(() => false);
    }

    async fillSearch(query: string): Promise<void> {
        // DataViews search is debounced.
        await fillDataViewsSearch(this.page, query, { selector: newSellerBadgeSelectors.searchInput, debounceMs: 800 });
    }

    async clearSearch(): Promise<void> {
        await clearDataViewsSearch(this.page, { selector: newSellerBadgeSelectors.searchInput, debounceMs: 600 });
    }

    // ---- List ----
    async getRowCount(): Promise<number> {
        return await rawRowCount(this.page, newSellerBadgeSelectors.dataRow);
    }

    async getBadgeCardCount(): Promise<number> {
        return await this.page.locator(newSellerBadgeSelectors.badgeCard).count();
    }

    /** True when at least one badge is visible in the list (table row OR card). */
    async hasAnyBadge(): Promise<boolean> {
        const rows = await this.getRowCount();
        if (rows > 0) return true;
        // Some renderings show badge cards; require a count-bearing tab > 0 as a
        // second signal to avoid matching unrelated card-ish elements.
        const allCount = await this.getTabCountValue('all').catch(() => 0);
        const availableCount = await this.getTabCountValue('available').catch(() => 0);
        return allCount > 0 || availableCount > 0;
    }

    async hasEmptyState(): Promise<boolean> {
        return await isEmptyStateVisible(this.page, newSellerBadgeSelectors.emptyState);
    }
}
