import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

// Pre-seeded simple product owned by `vendor1store`. The numeric post id is NOT
// pinned — WooCommerce assigns ids by insertion order, so route assertions match
// `/products/<digits>/edit`, never a literal id.
export const newProductsData = {
    seededProductName: 'p1_v1 (simple)',
    searchHit: 'p1_v1',
    searchMiss: 'zzznomatch',
    store: 'vendor1store',
} as const;

// Lite/Pro: this surface is shared. Pro injects extra tabs (Rejected), columns
// (Advertise) and row actions (Quick Edit, Bulk Edit, Duplicate); selectors below
// target only the Lite-guaranteed surface so the @lite spec passes in both builds.
export const newProductsSelectors = {
    reactRoot: '#dokan-vendor-dashboard-root',
    table: 'table',
    dataRow: 'table tbody tr',
    columnHeader: 'table thead th',
    searchInput: 'input[placeholder="Search"]',
    addFilterBtn: 'button:has-text("Add Filter")',
    resetBtn: 'button:has-text("Reset")',
    selectAll: 'input#inspector-checkbox-control-0, input[aria-label="Select all"]',
    rowCheckbox: 'tbody input[type="checkbox"]',
    rowActionsBtn: "button[aria-label='Actions']",
    // DokanModal renders role="dialog" with the product title as its heading, so
    // anchor on the stable "Product info" body label.
    quickViewModal: "//*[@role='dialog'][.//*[contains(normalize-space(),'Product info')]]",
    quickViewClose: "//*[@role='dialog']//button[normalize-space()='Close']",
    deleteAlert: "[role='alertdialog']",
    deleteConfirmBtn: "//*[@role='alertdialog']//button[normalize-space()='Delete Permanently']",
    deleteCancelBtn: "//*[@role='alertdialog']//button[normalize-space()='Cancel']",
    toast: "[role='status'], [class*='toast'], [class*='Toast']",
    emptyState: 'text=/no data found|no items|no results|nothing to show|no products/i',
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

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
    get columnHeaders(): Locator { return this.page.locator(newProductsSelectors.columnHeader); }
    get searchBox(): Locator { return this.page.locator(newProductsSelectors.searchInput).first(); }
    get addFilterButton(): Locator { return this.page.locator(newProductsSelectors.addFilterBtn).first(); }
    get resetButton(): Locator { return this.page.locator(newProductsSelectors.resetBtn).first(); }
    get addNewProductButton(): Locator { return this.page.getByRole('button', { name: /Add new product/i }).first(); }
    get selectAllCheckbox(): Locator { return this.page.locator(newProductsSelectors.selectAll).first(); }
    get rowCheckboxes(): Locator { return this.page.locator(newProductsSelectors.rowCheckbox); }
    get emptyState(): Locator { return this.page.locator(newProductsSelectors.emptyState).first(); }
    get quickViewModal(): Locator { return this.page.locator(newProductsSelectors.quickViewModal).first(); }
    get deleteAlert(): Locator { return this.page.locator(newProductsSelectors.deleteAlert).first(); }

    // The count badge is not part of the tab's accessible name — match the label only.
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    get seededProductLink(): Locator {
        return this.productLink(newProductsData.seededProductName);
    }

    productLink(name: string): Locator {
        return this.page.getByRole('link', { name: new RegExp(escapeRegExp(name), 'i') }).first();
    }

    rowByName(name: string): Locator {
        return this.rows.filter({ hasText: new RegExp(escapeRegExp(name), 'i') }).first();
    }

    // The per-row checkbox aria-label is the exact product name.
    rowCheckboxByName(name: string): Locator {
        return this.page.locator(`input[aria-label="${name}"]`).first();
    }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    // Ready = react root visible AND either ≥1 row OR the empty-state banner
    // (DataViews paints rows client-side, so poll rather than trust initial HTML).
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

    async getColumnHeaderTexts(): Promise<string[]> {
        return (await this.columnHeaders.allInnerTexts()).map((t) => t.trim().toLowerCase());
    }

    async isEmptyStateVisible(): Promise<boolean> {
        return await this.emptyState.isVisible({ timeout: 5000 }).catch(() => false);
    }

    async rowStatusText(name: string): Promise<string> {
        return (await this.rowByName(name).innerText().catch(() => '')).trim();
    }

    // ---- Status tabs ----
    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await this.waitForListRefetch(() => tab.click());
    }

    // ---- Search ----
    // Resolve on the next products-LIST refetch (GET /dokan/vN/products, not a
    // single /products/<id>). A fixed debounce wait flakes — stale rows linger
    // until the REST round-trip lands and React repaints.
    private async waitForListRefetch(action: () => Promise<void>, timeout = 15000): Promise<void> {
        const respP = this.page
            .waitForResponse(
                (r) => /\/dokan\/v\d+\/products(\?|$)/.test(r.url()) && !/\/products\/\d+/.test(r.url()) && r.request().method() === 'GET',
                { timeout },
            )
            .catch(() => null);
        await action();
        await respP;
        await this.page.waitForTimeout(400);
    }

    async search(query: string): Promise<void> {
        const input = this.searchBox;
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await this.waitForListRefetch(() => input.fill(query));
    }

    async clearSearch(): Promise<void> {
        const input = this.searchBox;
        if (await input.isVisible().catch(() => false)) {
            await this.waitForListRefetch(() => input.fill(''));
        }
    }

    // ---- Navigation actions ----
    async clickAddNewProduct(): Promise<void> {
        await this.addNewProductButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.addNewProductButton.click();
        await this.page.waitForURL(/#\/?products\/create/, { timeout: 15000 }).catch(() => undefined);
    }

    async openSeededProduct(): Promise<void> {
        await this.seededProductLink.waitFor({ state: 'visible', timeout: 10000 });
        await this.seededProductLink.click();
        await this.page.waitForURL(/#\/?products\/\d+\/edit/, { timeout: 15000 }).catch(() => undefined);
    }

    // ---- Bulk select ----
    async toggleSelectAll(): Promise<void> {
        const cb = this.selectAllCheckbox;
        await cb.waitFor({ state: 'visible', timeout: 10000 });
        await cb.click();
    }

    async selectRow(name: string): Promise<void> {
        const cb = this.rowCheckboxByName(name);
        await cb.waitFor({ state: 'visible', timeout: 10000 });
        await cb.check();
        await this.page.waitForTimeout(300);
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

    // ---- Row actions (3-dot menu) ----
    async openRowActionMenu(name: string): Promise<void> {
        const btn = this.rowByName(name).locator(newProductsSelectors.rowActionsBtn).first();
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        // The DataViews dropdown can no-op if the trigger is clicked mid-render (or a
        // list refetch closes a just-opened menu), which makes a follow-up menuitem
        // click time out intermittently. Open it and CONFIRM a menuitem appeared;
        // re-trigger only if it's still closed — checking open-state first so we never
        // re-click an already-open menu (which would toggle it shut).
        const firstItem = this.page.getByRole('menuitem').first();
        for (let attempt = 0; attempt < 3; attempt++) {
            if (await firstItem.isVisible().catch(() => false)) return;
            await btn.click();
            const opened = await firstItem.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
            if (opened) return;
        }
        // Still not open — surface a real error instead of clicking into the void.
        await firstItem.waitFor({ state: 'visible', timeout: 5000 });
    }

    menuItem(label: string): Locator {
        return this.page.getByRole('menuitem', { name: label }).first();
    }

    async clickMenuItem(label: string): Promise<void> {
        const item = this.menuItem(label);
        // Wait for THIS item (not just any menuitem) to be rendered and stable before
        // clicking — the menu can paint its items progressively.
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
    }

    async rowMenuItemLabels(name: string): Promise<string[]> {
        await this.openRowActionMenu(name);
        const labels = await this.page.getByRole('menuitem').allInnerTexts().catch(() => []);
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return labels.map((l) => l.trim());
    }

    // ---- Quick view ----
    async openQuickView(name: string): Promise<void> {
        await this.openRowActionMenu(name);
        await this.clickMenuItem('Quick view');
        await this.quickViewModal.waitFor({ state: 'visible', timeout: 10000 });
    }

    async isQuickViewOpen(): Promise<boolean> {
        return await this.quickViewModal.isVisible({ timeout: 3000 }).catch(() => false);
    }

    async quickViewText(): Promise<string> {
        return (await this.quickViewModal.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    }

    async closeQuickView(): Promise<void> {
        await this.page.locator(newProductsSelectors.quickViewClose).first().click().catch(() => undefined);
        await this.quickViewModal.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => undefined);
    }

    // ---- View in site (opens product permalink in a new tab) ----
    async viewInSite(name: string): Promise<Page | null> {
        await this.openRowActionMenu(name);
        const [popup] = await Promise.all([
            this.page.waitForEvent('popup', { timeout: 15000 }).catch(() => null),
            this.clickMenuItem('View in site'),
        ]);
        if (popup) await popup.waitForLoadState('domcontentloaded').catch(() => undefined);
        return popup;
    }

    // ---- Delete (single, via row menu) ----
    async openDeleteConfirm(name: string): Promise<void> {
        await this.openRowActionMenu(name);
        await this.clickMenuItem('Delete Permanently');
        await this.deleteAlert.waitFor({ state: 'visible', timeout: 10000 });
    }

    async confirmDelete(): Promise<void> {
        const btn = this.page.locator(newProductsSelectors.deleteConfirmBtn).first();
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
        await this.deleteAlert.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => undefined);
        await this.page.waitForTimeout(800);
    }

    async cancelDelete(): Promise<void> {
        await this.page.locator(newProductsSelectors.deleteCancelBtn).first().click();
        await this.deleteAlert.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => undefined);
    }

    async deleteProduct(name: string): Promise<void> {
        await this.openDeleteConfirm(name);
        await this.confirmDelete();
    }

    // ---- Bulk actions (selection toolbar) ----
    async bulkDelete(): Promise<void> {
        // Before the alertdialog opens, the only "Delete Permanently" button is the
        // selection-toolbar trigger; `.first()` (earliest in DOM) is that toolbar.
        const trigger = this.page.getByRole('button', { name: 'Delete Permanently', exact: true }).first();
        await trigger.waitFor({ state: 'visible', timeout: 10000 });
        await trigger.click();
        await this.confirmDelete();
    }

    async bulkPublish(): Promise<void> {
        const trigger = this.page.getByRole('button', { name: /Publish Products?/ }).first();
        await trigger.waitFor({ state: 'visible', timeout: 10000 });
        await trigger.click();
        await this.page.waitForTimeout(1200);
    }

    // ---- HashRouter reload survival ----
    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    // ---- Storefront (guest/customer) ----
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
