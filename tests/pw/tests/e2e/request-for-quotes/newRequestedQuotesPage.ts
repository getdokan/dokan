import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import {
    DATA_ROW_ANY,
    DATA_ROW_SETTLED,
    PHP_FATAL,
    REACT_ROOT,
    ROW_ACTIONS_BTN,
    SEARCH_INPUT,
    SKELETON_ANY,
    actionMenuItem as dvActionMenuItem,
    actionMenuItemByName,
    clearDataViewsSearch,
    dataViewsConfirm,
    fillDataViewsSearch,
    hasNoPhpFatal as dvHasNoPhpFatal,
    parseTabCount,
    statusTab as dvStatusTab,
    waitForRootReady as dvWaitForRootReady,
} from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React "Requested Quotes" surface (Dokan Pro, module
// request_for_quotation). Surface: /dashboard/new/#/requested-quotes.
//   dokan-pro/modules/request-for-quotation/src/js/vendor-dashboard/components/QuoteList.tsx
// A DataViews list (LIST ONLY is React — the quote detail is a legacy PHP
// template reached via the View row action / the Quote # link). Status tabs use a
// KEY≠LABEL split (value 'approve' shows label 'Approved') — statusTab() matches
// the visible LABEL. Columns: Quote # (isPrimary, "Quote <id>", role=button →
// legacy detail), Status (read-only StatusPill), Customer, Date. Row actions:
// View (→ legacy), Move to Trash (destructive, alertdialog confirm), Restore
// (labelled "Pending", fires immediately). Behavioral oracles REST-gate the
// mutation and re-read the list. Self-contained per NEW_UI_HOUSE_STYLE.md §1.
// ============================================
export const newRequestedQuotesSelectors = {
    reactRoot: REACT_ROOT,
    dataRow: DATA_ROW_ANY,
    settledRow: DATA_ROW_SETTLED,
    skeleton: SKELETON_ANY,
    columnHeader: 'table thead th, [role="columnheader"]',
    tab: dvStatusTab,
    tabAll: dvStatusTab('All'),
    tabPending: dvStatusTab('Pending'),
    tabTrash: dvStatusTab('Trash'),
    searchInput: SEARCH_INPUT,
    rowActionsBtn: ROW_ACTIONS_BTN,
    actionMenuItem: dvActionMenuItem,
    // The Quote # cell renders a clickable "Quote <id>" button → legacy detail.
    quoteNumberButton: 'button.dokan-link, [role="button"]',
    emptyState: 'text=/no data found/i',
    phpFatal: PHP_FATAL,

    // REST endpoints (version-agnostic).
    listRest: /dokan\/v[0-9]+\/vendor\/request-for-quote(\?|$|&)/i,
    itemMutateRest: /dokan\/v[0-9]+\/vendor\/request-for-quote\/\d+(\?|$)/i,
    batchRest: /dokan\/v[0-9]+\/vendor\/request-for-quote\/batch\b/i,
} as const;

export type QuoteTab = 'all' | 'pending' | 'trash';

// ============================================
// PAGE OBJECT — new React vendor "Requested Quotes" (Dokan Pro).
// ============================================
export class NewRequestedQuotesPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/requested-quotes');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get allTab(): Locator {
        return this.page.locator(newRequestedQuotesSelectors.tabAll).first();
    }
    get pendingTab(): Locator {
        return this.page.locator(newRequestedQuotesSelectors.tabPending).first();
    }
    get trashTab(): Locator {
        return this.page.locator(newRequestedQuotesSelectors.tabTrash).first();
    }
    get columnHeaders(): Locator {
        return this.page.locator(newRequestedQuotesSelectors.columnHeader);
    }
    get settledRows(): Locator {
        return this.page.locator(newRequestedQuotesSelectors.settledRow);
    }
    get skeletons(): Locator {
        return this.page.locator(newRequestedQuotesSelectors.skeleton);
    }

    rowsWithText(text: string): Locator {
        return this.page.locator(newRequestedQuotesSelectors.dataRow).filter({ hasText: text });
    }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.waitForSettle();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    /** Settle: skeleton gone AND (>=1 settled row OR empty state OR the tab strip). */
    async waitForSettle(timeoutMs = 15000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.skeletons.count()) === 0) {
                if ((await this.settledRows.count()) > 0) return;
                if (
                    await this.page
                        .locator(newRequestedQuotesSelectors.emptyState)
                        .first()
                        .isVisible()
                        .catch(() => false)
                )
                    return;
                if (await this.allTab.isVisible().catch(() => false)) return;
            }
            await this.page.waitForTimeout(250);
        }
    }

    // ---- Reads ----
    async tabsVisible(): Promise<boolean> {
        for (const tab of [this.allTab, this.pendingTab]) {
            const ok = await tab
                .waitFor({ state: 'visible', timeout: 8000 })
                .then(() => true)
                .catch(() => false);
            if (!ok) return false;
        }
        return true;
    }

    async getTabCount(tab: QuoteTab): Promise<number> {
        const locator = tab === 'all' ? this.allTab : tab === 'pending' ? this.pendingTab : this.trashTab;
        return parseTabCount(await locator.textContent().catch(() => ''));
    }

    async columnHeaderTexts(): Promise<string[]> {
        return (await this.columnHeaders.allInnerTexts()).map(t => t.trim());
    }

    async rowVisible(text: string): Promise<boolean> {
        return await this.rowsWithText(text)
            .first()
            .isVisible({ timeout: 10000 })
            .catch(() => false);
    }

    // ---- Tab select (gate on list refetch) ----
    async selectTab(tab: QuoteTab): Promise<void> {
        const locator = tab === 'all' ? this.allTab : tab === 'pending' ? this.pendingTab : this.trashTab;
        await locator.waitFor({ state: 'visible', timeout: 15000 });
        const refetch = this.page.waitForResponse(r => newRequestedQuotesSelectors.listRest.test(r.url()) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await locator.click();
        await refetch;
        await this.waitForSettle();
    }

    // ---- Search (server-side) ----
    async search(query: string): Promise<void> {
        const refetch = this.page.waitForResponse(r => newRequestedQuotesSelectors.listRest.test(r.url()) && decodeURIComponent(r.url()).includes(`search=${query}`) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await fillDataViewsSearch(this.page, query, { selector: newRequestedQuotesSelectors.searchInput, debounceMs: 800 });
        await refetch;
        await this.waitForSettle();
    }

    async clearSearch(): Promise<void> {
        await clearDataViewsSearch(this.page, { selector: newRequestedQuotesSelectors.searchInput, debounceMs: 600 });
        await this.waitForSettle();
    }

    // ---- Row actions ----
    /** Which row-action menu items are visible for the matching row. */
    async rowActionItems(text: string): Promise<{ view: boolean; trash: boolean; restore: boolean }> {
        const row = this.rowsWithText(text).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await row.locator("button[aria-label='Actions']").first().click();
        const check = async (label: string | RegExp): Promise<boolean> =>
            this.page
                .locator(typeof label === 'string' ? newRequestedQuotesSelectors.actionMenuItem(label) : ROW_ACTIONS_BTN)
                .first()
                .isVisible({ timeout: 2000 })
                .catch(() => false);
        const result = {
            view: await this.page
                .locator(newRequestedQuotesSelectors.actionMenuItem('View'))
                .first()
                .isVisible({ timeout: 2000 })
                .catch(() => false),
            trash: await actionMenuItemByName(this.page, /Move to Trash/i)
                .first()
                .isVisible({ timeout: 2000 })
                .catch(() => false),
            restore: await actionMenuItemByName(this.page, /Pending|Restore/i)
                .first()
                .isVisible({ timeout: 2000 })
                .catch(() => false),
        };
        void check;
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return result;
    }

    /** Move a quote to Trash via its row action + the destructive alertdialog confirm. */
    async moveToTrash(text: string): Promise<void> {
        const row = this.rowsWithText(text).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await row.locator("button[aria-label='Actions']").first().click();
        const item = actionMenuItemByName(this.page, /Move to Trash/i).first();
        await item.waitFor({ state: 'visible', timeout: 8000 });
        await item.click();
        // Destructive → plugin-ui alertdialog confirm.
        const dialog = dataViewsConfirm(this.page);
        await dialog.waitFor({ state: 'visible', timeout: 8000 });
        const confirm = dialog
            .getByRole('button')
            .filter({ hasNotText: /^Cancel$/ })
            .last();
        await Promise.all([this.page.waitForResponse(r => (newRequestedQuotesSelectors.itemMutateRest.test(r.url()) || newRequestedQuotesSelectors.batchRest.test(r.url())) && r.request().method() !== 'GET', { timeout: 15000 }).catch(() => undefined), confirm.click()]);
        await this.page.waitForTimeout(800);
        await this.waitForSettle();
    }

    /** Restore a trashed quote via its "Pending" row action (fires immediately, no confirm). */
    async restore(text: string): Promise<void> {
        const row = this.rowsWithText(text).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await row.locator("button[aria-label='Actions']").first().click();
        const item = actionMenuItemByName(this.page, /Pending|Restore/i).first();
        await item.waitFor({ state: 'visible', timeout: 8000 });
        await Promise.all([this.page.waitForResponse(r => (newRequestedQuotesSelectors.itemMutateRest.test(r.url()) || newRequestedQuotesSelectors.batchRest.test(r.url())) && r.request().method() !== 'GET', { timeout: 15000 }).catch(() => undefined), item.click()]);
        await this.page.waitForTimeout(800);
        await this.waitForSettle();
    }

    /** Click the Quote # link and assert the browser leaves the SPA toward the legacy detail. */
    async viewLeadsToLegacy(text: string): Promise<boolean> {
        const row = this.rowsWithText(text).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const link = row.locator(newRequestedQuotesSelectors.quoteNumberButton).first();
        const navPromise = this.page
            .waitForURL(/requested-quotes\/\d+|request-a-quote|rfq/i, { timeout: 8000 })
            .then(() => true)
            .catch(() => false);
        await link.click().catch(() => undefined);
        return await navPromise;
    }
}
