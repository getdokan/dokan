import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// The site is pre-seeded with the simple product `p1_v1 (simple)` (id 19),
// published, in-stock, owned by `vendor1store`. These tests drive the React
// products LIST around that fixture (the editor itself lives in
// `new-product-form`, so this folder never creates/edits products).
export const newProductsData = {
    seededProductName: 'p1_v1 (simple)',
    seededProductId: '19',
    searchHit: 'p1_v1',
    searchMiss: 'zzznomatch',
    store: 'vendor1store',
} as const;

// ============================================
// SELECTORS — verified against the live /dashboard/new/#/products render
// (tmp-explore/products.json + products.html). This is the unified
// @wedevs/plugin-ui DataViews list. Selectors copied from
// tests/e2e/orders/newOrderListPage.ts and adapted to the products surface;
// this page object is fully self-contained (folders never import each other).
// ============================================
export const newProductsSelectors = {
    reactRoot: '#dokan-vendor-dashboard-root',
    // DataViews table + rows.
    table: 'table',
    dataRow: 'table tbody tr',
    // Search input — DataViews header. Verified placeholder="Search".
    searchInput: 'input[placeholder="Search"]',
    // Status tabs are buttons whose accessible name carries a count.
    tab: (name: RegExp) => name,
    // Toolbar buttons.
    addNewProductBtn: 'button:has-text("Add new product"), a:has-text("Add new product")',
    importBtn: 'button:has-text("Import"), a:has-text("Import")',
    exportBtn: 'button:has-text("Export"), a:has-text("Export")',
    addFilterBtn: 'button:has-text("Add Filter")',
    resetBtn: 'button:has-text("Reset")',
    // Bulk select — verified id/aria.
    selectAll: 'input#inspector-checkbox-control-0, input[aria-label="Select all"]',
    rowCheckbox: 'tbody input[type="checkbox"]',
    // 3-dot per-row actions (scoped to tbody — the toolbar shares the aria-label).
    rowActionsBtn: "//tbody//tr//button[@aria-label='Actions']",
    actionMenuItem: (label: string) => `//*[@role='menuitem'][normalize-space()='${label}']`,
    // Empty state — DataViews renders this when no rows match.
    emptyState: 'text=/no data found|no items|no results|nothing to show|no products/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // Storefront product title (theme-agnostic: match by visible text).
} as const;

// ============================================
// PAGE OBJECT — new React Products list (Dokan 5.0.0+)
// Surface: /dashboard/new/#/products (DataViews, Lite).
// ============================================
export class NewProductsPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/products');
    readonly createUrl = toPath('dashboard/new/#/products/create');
    readonly storeUrl = toPath(`store/${newProductsData.store}/`);

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get reactRoot(): Locator { return this.page.locator(newProductsSelectors.reactRoot).first(); }
    get rows(): Locator { return this.page.locator(newProductsSelectors.dataRow); }
    get searchBox(): Locator { return this.page.locator(newProductsSelectors.searchInput).first(); }
    get addNewProductButton(): Locator { return this.page.locator(newProductsSelectors.addNewProductBtn).first(); }
    get importButton(): Locator { return this.page.locator(newProductsSelectors.importBtn).first(); }
    get exportButton(): Locator { return this.page.locator(newProductsSelectors.exportBtn).first(); }
    get selectAllCheckbox(): Locator { return this.page.locator(newProductsSelectors.selectAll).first(); }
    get rowCheckboxes(): Locator { return this.page.locator(newProductsSelectors.rowCheckbox); }
    get emptyState(): Locator { return this.page.locator(newProductsSelectors.emptyState).first(); }

    /**
     * A status tab, e.g. tab(/^All/) or tab(/^Published/). The DataViews tabs
     * render as `<button role="tab">` and the count badge is NOT part of the
     * accessible name, so match the leading label only (no `(\d+)`).
     */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** The seeded product's name link (opens #products/19/edit). */
    get seededProductLink(): Locator {
        return this.page.getByRole('link', { name: new RegExp(escapeRegExp(newProductsData.seededProductName), 'i') }).first();
    }

    /** A list row matching a product name. */
    rowByName(name: string): Locator {
        return this.rows.filter({ hasText: new RegExp(escapeRegExp(name), 'i') }).first();
    }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /**
     * List is ready when the react root is visible AND either ≥1 row OR the
     * empty-state banner has rendered (DataViews paints rows client-side, so
     * we must poll rather than rely on initial HTML).
     */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        const start = Date.now();
        while (Date.now() - start < 15000) {
            if (await this.rows.count() > 0) return;
            if (await this.emptyState.count() > 0) return;
            await this.page.waitForTimeout(250);
        }
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page.locator(newProductsSelectors.phpFatal).first().isVisible({ timeout: 1000 }).catch(() => false);
        return !fatal;
    }

    // ---- Reads ----
    async getRowCount(): Promise<number> {
        return await this.rows.count();
    }

    async isEmptyStateVisible(): Promise<boolean> {
        return await this.emptyState.isVisible({ timeout: 5000 }).catch(() => false);
    }

    // ---- Status tabs ----
    /**
     * Click a status tab and wait for the list to settle. The tab labels carry
     * a live count, e.g. "All (1)", "Published (1)", "Draft (0)".
     */
    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await this.page.waitForTimeout(800); // DataViews refetch + repaint.
    }

    // ---- Search ----
    async search(query: string): Promise<void> {
        const input = this.searchBox;
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(query);
        await this.page.waitForTimeout(900); // debounced search.
    }

    async clearSearch(): Promise<void> {
        const input = this.searchBox;
        if (await input.isVisible().catch(() => false)) {
            await input.fill('');
            await this.page.waitForTimeout(600);
        }
    }

    // ---- Navigation actions ----
    /** Click "Add new product"; resolves on the create editor route. */
    async clickAddNewProduct(): Promise<void> {
        await this.addNewProductButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.addNewProductButton.click();
        await this.page.waitForURL(/#\/products\/create/, { timeout: 15000 }).catch(() => undefined);
    }

    /** Open the seeded product via its name link; resolves on the edit route. */
    async openSeededProduct(): Promise<void> {
        await this.seededProductLink.waitFor({ state: 'visible', timeout: 10000 });
        await this.seededProductLink.click();
        await this.page.waitForURL(/#\/?products\/19\/edit/, { timeout: 15000 }).catch(() => undefined);
    }

    // ---- Bulk select ----
    async toggleSelectAll(): Promise<void> {
        const cb = this.selectAllCheckbox;
        await cb.waitFor({ state: 'visible', timeout: 10000 });
        await cb.click();
    }

    async checkedRowCount(): Promise<number> {
        const boxes = this.rowCheckboxes;
        const total = await boxes.count();
        let checked = 0;
        for (let i = 0; i < total; i++) {
            if (await boxes.nth(i).isChecked().catch(() => false)) checked++;
        }
        return checked;
    }

    // ---- Row actions ----
    async openRowActionMenu(index = 0): Promise<void> {
        const buttons = this.page.locator(newProductsSelectors.rowActionsBtn);
        await buttons.nth(index).waitFor({ state: 'visible', timeout: 10000 });
        await buttons.nth(index).click();
    }

    actionMenuItem(label: string): Locator {
        return this.page.locator(newProductsSelectors.actionMenuItem(label)).first();
    }

    // ---- HashRouter reload survival ----
    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    // ---- Storefront (guest/customer) ----
    /**
     * Visit the vendor store and assert a product name is visible. Theme-agnostic:
     * matches by visible text rather than a theme-specific class.
     */
    async gotoStore(): Promise<void> {
        await this.page.goto(this.storeUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator('body').first().waitFor({ state: 'visible', timeout: 15000 });
    }

    async storeShowsProduct(name: string): Promise<boolean> {
        const product = this.page.getByText(new RegExp(escapeRegExp(name), 'i')).first();
        return await product.isVisible({ timeout: 10000 }).catch(() => false);
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
