import { Locator, Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';

// ============================================
// SELECTORS — verified against the live
// /dashboard/new/#/reverse-withdrawal render (Dokan Pro 5.0.0).
// Implementation: a DataViews transactions table + a balance/threshold widget.
// Self-contained per NEW_UI_HOUSE_STYLE.md §1 (folders never import each other).
// ============================================
export const newReverseWithdrawSelectors = {
    reactRoot: '#dokan-vendor-dashboard-root',
    heading: 'h3:has-text("Reverse Withdrawal")',
    // Balance widget card.
    balanceCard: 'text=/Reverse Withdrawal Balance/i',
    reversePayBalance: 'text=/Reverse Pay Balance:/i',
    threshold: 'text=/Threshold:/i',
    // DataViews surface.
    dataViewsWrapper: '#dokan-reverse-withdrawal-transactions',
    dataViewsTable: 'table.dataviews-view-table',
    // DataViews renders each column label as a header <button> inside the
    // <th scope="col">, not as plain <th> text — read the button labels.
    tableHeader: 'table.dataviews-view-table thead th button.dataviews-view-table-header-button',
    dataRow: 'table.dataviews-view-table tbody tr',
    // Filter controls. DataViews keeps the Add Filter / Reset row hidden
    // (`hidden!` => display:none) until a filter field is actually added. The
    // funnel (button[title="Filter"]) with NO active filter opens a field
    // *selector* popover whose options are <button>s (e.g. "Date Range"); only
    // picking one un-hides the Reset row (see @wedevs/plugin-ui dataviews.tsx
    // onFirstFilterAdded -> setShowFilters(true)).
    addFilterButton: 'button:has-text("Add Filter")',
    resetButton: 'button:has-text("Reset")',
    filterIconButton: 'button[title="Filter"]',
    // The first filter field offered by the selector popover on this surface.
    filterFieldOption: 'button:has-text("Date Range")',
    // Footer running balance.
    footerBalance: 'text=/^Balance:/i',
    // Empty state (when no transactions exist).
    emptyState: 'text=/no data found|no items|no transactions|nothing to show/i',
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

// Column header labels, in render order (from cheat-sheet tableHeaders).
export const reverseWithdrawColumns = [
    'Transaction ID',
    'Date',
    'Transaction Type',
    'Note',
    'Debit',
    'Credit',
    'Balance',
] as const;

// ============================================
// PAGE OBJECT — new React Reverse Withdrawal (Dokan 5.0.0+)
// Surface: /dashboard/new/#/reverse-withdrawal (DataViews list). Pro feature.
// ============================================
export class NewReverseWithdrawPage {
    readonly page: Page;
    readonly url = toPath('dashboard/new/#/reverse-withdrawal');

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get heading(): Locator { return this.page.locator(newReverseWithdrawSelectors.heading).first(); }
    get balanceCard(): Locator { return this.page.locator(newReverseWithdrawSelectors.balanceCard).first(); }
    get reversePayBalance(): Locator { return this.page.locator(newReverseWithdrawSelectors.reversePayBalance).first(); }
    get threshold(): Locator { return this.page.locator(newReverseWithdrawSelectors.threshold).first(); }
    get dataViewsWrapper(): Locator { return this.page.locator(newReverseWithdrawSelectors.dataViewsWrapper).first(); }
    get dataViewsTable(): Locator { return this.page.locator(newReverseWithdrawSelectors.dataViewsTable).first(); }
    get addFilterButton(): Locator { return this.page.locator(newReverseWithdrawSelectors.addFilterButton).first(); }
    get resetButton(): Locator { return this.page.locator(newReverseWithdrawSelectors.resetButton).first(); }
    get filterIconButton(): Locator { return this.page.locator(newReverseWithdrawSelectors.filterIconButton).first(); }
    get filterFieldOption(): Locator { return this.page.locator(newReverseWithdrawSelectors.filterFieldOption).first(); }

    // ---- Navigation ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** React root visible AND (>=1 row OR an empty-state) — poll up to ~15s. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.page.locator(newReverseWithdrawSelectors.reactRoot).first().waitFor({ state: 'visible', timeout: timeoutMs });
        const start = Date.now();
        while (Date.now() - start < 15000) {
            const rows = await this.page.locator(newReverseWithdrawSelectors.dataRow).count();
            if (rows > 0) return;
            const empty = await this.page.locator(newReverseWithdrawSelectors.emptyState).count();
            if (empty > 0) return;
            // The balance card always renders even with no transactions.
            const card = await this.balanceCard.isVisible().catch(() => false);
            if (card) return;
            await this.page.waitForTimeout(250);
        }
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page.locator(newReverseWithdrawSelectors.phpFatal).first().isVisible({ timeout: 1000 }).catch(() => false);
        return !fatal;
    }

    // ---- Reads ----
    async getRowCount(): Promise<number> {
        return await this.page.locator(newReverseWithdrawSelectors.dataRow).count();
    }

    async getColumnHeaders(): Promise<string[]> {
        // Ensure the DataViews table itself has rendered before reading headers.
        await this.dataViewsTable.waitFor({ state: 'visible', timeout: 10000 });
        const headers = this.page.locator(newReverseWithdrawSelectors.tableHeader);
        await headers.first().waitFor({ state: 'visible', timeout: 10000 });
        return (await headers.allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
    }

    /**
     * "Reverse Pay Balance: $x" text content (whole row), for assertions.
     * The live widget renders the label and the value as two separate <span>
     * siblings inside a flex row:
     *   <div class="flex gap-1"><span>Reverse Pay Balance:</span>
     *     <span class="font-semibold"><span>$0,00</span></span></div>
     * innerText on the flex row injects a newline between the children, so we
     * collapse all whitespace to single spaces — yielding e.g.
     * "Reverse Pay Balance: $0,00" (note the comma decimal, $0,00).
     */
    async getReversePayBalanceText(): Promise<string> {
        await this.reversePayBalance.waitFor({ state: 'visible', timeout: 10000 });
        // Take the parent row so we capture the value span alongside the label.
        const raw = await this.reversePayBalance.locator('xpath=..').innerText();
        return raw.replace(/\s+/g, ' ').trim();
    }

    async getThresholdText(): Promise<string> {
        await this.threshold.waitFor({ state: 'visible', timeout: 10000 });
        const raw = await this.threshold.locator('xpath=..').innerText();
        return raw.replace(/\s+/g, ' ').trim();
    }

    /** Whether the table renders >=1 row or an explicit empty-state is shown. */
    async hasRowsOrEmptyState(): Promise<boolean> {
        const rows = await this.getRowCount();
        if (rows > 0) return true;
        const empty = await this.page.locator(newReverseWithdrawSelectors.emptyState).first().isVisible().catch(() => false);
        return empty;
    }

    // ---- Filter UI ----
    /**
     * Open the funnel's field-selector popover. With no active filter the funnel
     * (button[title="Filter"]) does NOT toggle the Add Filter / Reset row — that
     * row stays `hidden!` (display:none). Instead the funnel fires an
     * openSelector signal that pops a list of filter-field <button> options
     * (e.g. "Date Range"). Returns true once that popover's first option is
     * visible.
     */
    async openFilterSelector(): Promise<boolean> {
        const funnel = this.filterIconButton;
        if (!(await funnel.isVisible().catch(() => false))) return false;
        await funnel.click();
        return await this.filterFieldOption
            .waitFor({ state: 'visible', timeout: 5000 })
            .then(() => true)
            .catch(() => false);
    }

    /**
     * Apply a filter so the Add Filter / Reset row becomes visible. Picking a
     * field from the selector popover calls onFirstFilterAdded ->
     * setShowFilters(true), which un-hides the Reset control. Idempotent: if
     * Reset is already visible we do nothing.
     */
    async applyFilterToRevealReset(): Promise<void> {
        if (await this.resetButton.isVisible().catch(() => false)) return;
        const opened = await this.openFilterSelector();
        if (!opened) return;
        await this.filterFieldOption.click();
        await this.resetButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
    }

    /**
     * The filter affordance is present. The funnel is always rendered when the
     * surface has filterable fields; once a field is picked the Add Filter /
     * Reset controls appear. We assert the funnel exists and that it opens the
     * field selector (the real, deterministic affordance on this surface).
     */
    async hasFilterControls(): Promise<boolean> {
        const funnel = await this.filterIconButton.isVisible().catch(() => false);
        if (!funnel) return false;
        return await this.openFilterSelector();
    }

    async clickReset(): Promise<void> {
        // Reset only renders once a filter is applied; apply one first.
        await this.applyFilterToRevealReset();
        await this.resetButton.waitFor({ state: 'visible', timeout: 8000 });
        await this.resetButton.click();
        await this.page.waitForTimeout(400);
    }

    // ---- Assertions used by the spec ----
    async expectAllColumnsPresent(): Promise<void> {
        // The DataViews header buttons carry the title-case label in the DOM
        // ("Transaction ID") but the cell is styled `text-transform: uppercase`,
        // so innerText/allInnerTexts returns the rendered uppercase form
        // ("TRANSACTION ID"). Compare case-insensitively so the assertion checks
        // the real column set without depending on CSS casing.
        const headers = (await this.getColumnHeaders()).map(h => h.toLowerCase());
        for (const col of reverseWithdrawColumns) {
            expect(headers, `column "${col}" present`).toContain(col.toLowerCase());
        }
    }
}
