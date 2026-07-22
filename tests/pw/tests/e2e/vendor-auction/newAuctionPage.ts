import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import {
    REACT_ROOT,
    SEARCH_INPUT,
    PHP_FATAL,
    DATA_ROW_ANY,
    DATA_ROW_SETTLED,
    SKELETON_ANY,
    actionMenuItem as dvActionMenuItem,
    statusTab as dvStatusTab,
    waitForRootReady as dvWaitForRootReady,
    hasNoPhpFatal as dvHasNoPhpFatal,
    parseTabCount,
    dataViewsConfirm,
    fillDataViewsSearch,
    clearDataViewsSearch,
} from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React "Auction" surface (Dokan Pro, module simple-auction /
// id 'auction'). Two routes:
//   /dashboard/new/#/auction           → Products DataViews list (ProductsTab-like)
//                                        (simple-auction/src/AuctionList.tsx)
//   /dashboard/new/#/auction-activity  → Activity DataViews list (read-only)
//                                        (simple-auction/src/AuctionActivity.tsx)
// Products list: status tabs All/Published/Draft/Pending Review/Rejected, search,
// Date-range filter, row actions Edit (→ LEGACY editor), View, Duplicate
// (conditional on dokanFrontend.auction_listing.can_duplicate_product), Delete
// Permanently (destructive → plugin-ui alertdialog confirm) → DELETE
// /dokan/v1/auction/products/{id}. Activity list: columns Auction/User Name/Bid/
// Date/Proxy, search, Date-range filter, "Auctions" back button; NO row actions
// and needs a real bid to populate (no REST bid seeder — activity coverage is
// render/columns/search-shape only). The add/edit forms are LEGACY (scope out).
// Self-contained per NEW_UI_HOUSE_STYLE.md §1.
// ============================================
export const newAuctionSelectors = {
    reactRoot: REACT_ROOT,
    dataRow: DATA_ROW_ANY,
    settledRow: DATA_ROW_SETTLED,
    skeleton: SKELETON_ANY,
    columnHeader: 'table thead th, [role="columnheader"]',
    tab: dvStatusTab,
    tabAll: dvStatusTab('All'),
    tabPublished: dvStatusTab('Published'),
    tabDraft: dvStatusTab('Draft'),
    searchInput: SEARCH_INPUT,
    actionMenuItem: dvActionMenuItem,
    emptyState: 'text=/no data found/i',
    backToAuctionsButton: 'a[href="#/auction"], button:has-text("Auctions")',
    phpFatal: PHP_FATAL,

    // REST endpoints (version-agnostic).
    productsRest: /dokan\/v[0-9]+\/auction\/products(\?|$|&)/i,
    productDeleteRest: /dokan\/v[0-9]+\/auction\/products\/\d+\b/i,
    activityRest: /dokan\/v[0-9]+\/auction\/activity\b/i,
} as const;

export type AuctionTab = 'all' | 'publish' | 'draft';

// ============================================
// PAGE OBJECT — new React vendor "Auction" (Dokan Pro).
// ============================================
export class NewAuctionPage {
    readonly page: Page;
    readonly listUrl = toPath('dashboard/new/#/auction');
    readonly activityUrl = toPath('dashboard/new/#/auction-activity');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get allTab(): Locator {
        return this.page.locator(newAuctionSelectors.tabAll).first();
    }
    get publishedTab(): Locator {
        return this.page.locator(newAuctionSelectors.tabPublished).first();
    }
    get draftTab(): Locator {
        return this.page.locator(newAuctionSelectors.tabDraft).first();
    }
    get columnHeaders(): Locator {
        return this.page.locator(newAuctionSelectors.columnHeader);
    }
    get settledRows(): Locator {
        return this.page.locator(newAuctionSelectors.settledRow);
    }
    get skeletons(): Locator {
        return this.page.locator(newAuctionSelectors.skeleton);
    }

    rowsWithText(text: string): Locator {
        return this.page.locator(newAuctionSelectors.dataRow).filter({ hasText: text });
    }

    // ---- Navigation ----
    async gotoList(): Promise<void> {
        await this.page.goto(this.listUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.waitForSettle();
    }

    async gotoActivity(): Promise<void> {
        await this.page.goto(this.activityUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.waitForSettle();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    /** Settle: skeleton gone AND (>=1 settled row OR empty state OR column headers). */
    async waitForSettle(timeoutMs = 15000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.skeletons.count()) === 0) {
                if ((await this.settledRows.count()) > 0) return;
                if (
                    await this.page
                        .locator(newAuctionSelectors.emptyState)
                        .first()
                        .isVisible()
                        .catch(() => false)
                )
                    return;
                if ((await this.columnHeaders.count()) > 0) return;
            }
            await this.page.waitForTimeout(250);
        }
    }

    // ---- Reads ----
    async tabsVisible(): Promise<boolean> {
        for (const tab of [this.allTab, this.publishedTab]) {
            const ok = await tab
                .waitFor({ state: 'visible', timeout: 8000 })
                .then(() => true)
                .catch(() => false);
            if (!ok) return false;
        }
        return true;
    }

    async getTabCount(tab: AuctionTab): Promise<number> {
        const locator = tab === 'all' ? this.allTab : tab === 'publish' ? this.publishedTab : this.draftTab;
        return parseTabCount(await locator.textContent().catch(() => ''));
    }

    async columnHeaderTexts(): Promise<string[]> {
        return (await this.columnHeaders.allInnerTexts()).map(t => t.trim());
    }

    async hasColumn(name: RegExp): Promise<boolean> {
        return (await this.columnHeaderTexts()).some(t => name.test(t));
    }

    async rowVisible(text: string): Promise<boolean> {
        return await this.rowsWithText(text)
            .first()
            .isVisible({ timeout: 10000 })
            .catch(() => false);
    }

    // ---- Tab + search ----
    async selectTab(tab: AuctionTab): Promise<void> {
        const locator = tab === 'all' ? this.allTab : tab === 'publish' ? this.publishedTab : this.draftTab;
        await locator.waitFor({ state: 'visible', timeout: 15000 });
        const refetch = this.page.waitForResponse(r => newAuctionSelectors.productsRest.test(r.url()) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await locator.click();
        await refetch;
        await this.waitForSettle();
    }

    async search(query: string): Promise<void> {
        const refetch = this.page.waitForResponse(r => newAuctionSelectors.productsRest.test(r.url()) && decodeURIComponent(r.url()).includes(`search=${query}`) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await fillDataViewsSearch(this.page, query, { selector: newAuctionSelectors.searchInput, debounceMs: 800 });
        await refetch;
        await this.waitForSettle();
    }

    async clearSearch(): Promise<void> {
        await clearDataViewsSearch(this.page, { selector: newAuctionSelectors.searchInput, debounceMs: 600 });
        await this.waitForSettle();
    }

    // ---- Row action menu ----
    async openRowMenu(text: string): Promise<void> {
        const row = this.rowsWithText(text).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await row.locator("button[aria-label='Actions']").first().click();
        await this.page.waitForTimeout(400);
    }

    async rowMenuItemLabels(text: string): Promise<string[]> {
        await this.openRowMenu(text);
        const items = this.page.locator("[role='menuitem']");
        const n = await items.count();
        const labels: string[] = [];
        for (let i = 0; i < n; i++)
            labels.push(
                (
                    await items
                        .nth(i)
                        .innerText()
                        .catch(() => '')
                ).trim(),
            );
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return labels;
    }

    /** Delete a product via row action + destructive alertdialog confirm. */
    async deleteProduct(text: string): Promise<void> {
        await this.openRowMenu(text);
        const item = this.page.getByRole('menuitem', { name: /Delete Permanently|Delete/i }).first();
        await item.waitFor({ state: 'visible', timeout: 8000 });
        await item.click();
        const dialog = dataViewsConfirm(this.page);
        await dialog.waitFor({ state: 'visible', timeout: 8000 });
        const confirm = dialog
            .getByRole('button')
            .filter({ hasNotText: /^Cancel$/ })
            .last();
        await Promise.all([this.page.waitForResponse(r => newAuctionSelectors.productDeleteRest.test(r.url()) && r.request().method() === 'DELETE', { timeout: 15000 }).catch(() => undefined), confirm.click()]);
        await this.page.waitForTimeout(1000);
        await this.waitForSettle();
    }

    /** Click the Edit row action and report the URL it navigates to (the React product editor). */
    async editActionTarget(text: string): Promise<string> {
        await this.openRowMenu(text);
        const edit = this.page.getByRole('menuitem', { name: /^Edit$/i }).first();
        const before = this.page.url();
        await edit.click().catch(() => undefined);
        await this.page.waitForTimeout(1500);
        const after = this.page.url();
        void before;
        return after;
    }
}
