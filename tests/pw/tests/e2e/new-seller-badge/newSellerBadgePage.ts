import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

// ============================================
// SELECTORS — verified against the live /dashboard/new/#/seller-badge render
// (DataViews-style list, Pro). The three status tabs are `role="tab"` buttons
// whose accessible name carries a count, e.g. "All (0)", "My Badges (0)",
// "Available Badges (0)". Search is `input[placeholder="Search"]`.
// See tmp-explore/seller-badge.json + seller-badge.html.
// ============================================
export const newSellerBadgeSelectors = {
    reactRoot: '#dokan-vendor-dashboard-root',
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
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

// ============================================
// PAGE OBJECT — new React Seller Badge list (Dokan 5.0.0+)
// Surface: /dashboard/new/#/seller-badge (DataViews list). Pro feature.
// Self-contained per house-style §1 (DataViews patterns copied inline from
// tests/e2e/orders/newOrderListPage.ts — folders never import each other).
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

    /** React root visible AND (the heading OR the tab strip) present. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.page.locator(newSellerBadgeSelectors.reactRoot).first().waitFor({ state: 'visible', timeout: timeoutMs });
        const start = Date.now();
        while (Date.now() - start < 15000) {
            const tabs = await this.page.locator(newSellerBadgeSelectors.anyTab).count();
            if (tabs > 0) return;
            const heading = await this.heading.isVisible().catch(() => false);
            if (heading) return;
            await this.page.waitForTimeout(250);
        }
    }

    async reloadPage(): Promise<void> {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page.locator(newSellerBadgeSelectors.phpFatal).first().isVisible({ timeout: 1000 }).catch(() => false);
        return !fatal;
    }

    // ---- Tabs ----
    /** All three status tabs visible (the core "no PHP fatal / renders" check). */
    async tabsVisible(): Promise<boolean> {
        const all = await this.allTab.isVisible().catch(() => false);
        const mine = await this.myBadgesTab.isVisible().catch(() => false);
        const available = await this.availableBadgesTab.isVisible().catch(() => false);
        return all && mine && available;
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
        const match = text.match(/\((\d+)\)/);
        return match ? Number(match[1]) : 0;
    }

    // ---- Search ----
    async searchPresent(): Promise<boolean> {
        return await this.searchInput.isVisible({ timeout: 10000 }).catch(() => false);
    }

    async fillSearch(query: string): Promise<void> {
        const input = this.searchInput;
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(query);
        // DataViews search is debounced.
        await this.page.waitForTimeout(800);
    }

    async clearSearch(): Promise<void> {
        const input = this.searchInput;
        if (await input.isVisible().catch(() => false)) {
            await input.fill('');
            await this.page.waitForTimeout(600);
        }
    }

    // ---- List ----
    async getRowCount(): Promise<number> {
        return await this.page.locator(newSellerBadgeSelectors.dataRow).count();
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
        return await this.page.locator(newSellerBadgeSelectors.emptyState).first().isVisible({ timeout: 2000 }).catch(() => false);
    }
}
