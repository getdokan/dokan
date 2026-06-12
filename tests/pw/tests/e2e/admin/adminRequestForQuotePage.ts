import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// Customer quote REQUESTS + admin quote RULES seeded via REST so the admin
// Request-for-Quote DataViews are deterministic. This is an ADMIN-only spec:
// the quote/rule state it asserts against is created programmatically
// (apiUtils.createQuoteRequest / apiUtils.createQuoteRule, adminAuth), never by
// driving the customer/vendor UI. All names are namespaced with the "ARFQ"
// prefix. See tests/pw/test-cases/admin-dashboard-seeding-strategy.md
// (§ Request for quote (admin)).
export const adminRequestForQuoteData = {
    // Vendor that OWNS the quoted product. getSellerId-first idempotent seed.
    vendor: {
        storeName: 'ARFQ Vendor Store',
        userLogin: 'arfq_vendor',
        email: 'arfq_vendor@example.test',
    },
    // Quote-request fixtures. The quote title is what renders in the "Quote"
    // column when a user_id + quote_title are present.
    quote: {
        // Read-only pending fixture (never mutated, parallel-safe reads).
        pendingTitle: 'ARFQ Pending Quote',
        // Dedicated mutation target for the Trash flow.
        trashTitle: 'ARFQ Trash Target Quote',
        // Pre-trashed fixture for the permanent-delete flow.
        deleteTitle: 'ARFQ Delete Target Quote',
        // Bulk-trash targets.
        bulk: ['ARFQ Bulk One Quote', 'ARFQ Bulk Two Quote'],
    },
    // Quote-rule fixtures (rules list).
    rule: {
        publishedName: 'ARFQ Published Rule',
        trashTargetName: 'ARFQ Rule Trash Target',
    },
    // A search term guaranteed to match no rule, for the empty-state edge.
    searchMiss: 'zzz_no_such_quote_rule_zzz',
} as const;

// ============================================
// SELECTORS — verified against the Pro RFQ admin-panel React source:
//   dokan-pro/modules/request-for-quotation/assets/src/js/admin-panel/
//     index.tsx                         (route registration)
//     pages/RequestQuoteList.tsx        (quotes DataView: tabs, actions, modal)
//     pages/QuoteRulesList.tsx          (rules DataView: tabs, search, actions)
//     components/common/HeaderSection.tsx (nav cards + New Quote/New Rule btn)
// The pages mount the unified @dokan/components AdminDataViews on
// #dokan-admin-dashboard via the 'dokan-admin-dashboard-routes' filter, so the
// row / search / row-action / bulk selectors mirror adminVendorsPage.ts.
// ============================================
export const adminRequestForQuoteSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    table: 'table',
    dataRow: 'table tbody tr',
    // QuoteRulesList renders a SimpleInput search; placeholder "Search rules…".
    rulesSearchInput: 'input[placeholder="Search rules…"]',
    // Per-row 3-dot actions trigger (scoped to a row — the toolbar shares the label).
    rowActionsBtn: "button[aria-label='Actions']",
    // Empty state DataViews renders when no row matches.
    emptyState: 'text=/no data found|no items|no results|nothing to show|no quote|no rule/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    loginForm: '#loginform, #user_login',
} as const;

// ============================================
// PAGE OBJECT — admin Request for Quote lists (Dokan Pro 5.0.0+ React admin
// dashboard). Surfaces:
//   wp-admin/admin.php?page=dokan-dashboard#/request-for-quote              (quotes)
//   wp-admin/admin.php?page=dokan-dashboard#/request-for-quote/quote-rules (rules)
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// Trash/Delete confirmation modal).
// ============================================
export class AdminRequestForQuotePage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/request-for-quote');
    readonly rulesUrl = toPath('wp-admin/admin.php?page=dokan-dashboard#/request-for-quote/quote-rules');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminRequestForQuoteSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminRequestForQuoteSelectors.dataRow);
    }
    get rulesSearchBox(): Locator {
        return this.page.locator(adminRequestForQuoteSelectors.rulesSearchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminRequestForQuoteSelectors.emptyState).first();
    }
    /** Quotes-list h2 — "Request for Quotation". */
    get quotesHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Request for Quotation' }).first();
    }
    /** Rules-list h2 — "Quote Rules List". */
    get rulesHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Quote Rules List' }).first();
    }
    /** HeaderSection "New Quote" primary button (links to add-new-quote). */
    get newQuoteButton(): Locator {
        return this.page.getByRole('link', { name: /New Quote$/i }).first();
    }
    /** HeaderSection nav card — switches to the Quote Rules List route. */
    get quoteRulesNavCard(): Locator {
        return this.page.getByRole('link', { name: 'Quote Rules List' }).first();
    }

    /** A status tab by visible label (the count badge is appended to the name). */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** A column header by visible label. */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** A list row matched by visible text (quote title / rule name / customer).
     * The Quote/Rules cell is truncated only beyond 22/50 chars, and the ARFQ
     * fixtures are short, so an exact-ish text match isolates one row safely. */
    rowByText(text: string): Locator {
        return this.rows.filter({ hasText: text }).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async gotoRules(): Promise<void> {
        await this.page.goto(this.rulesUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React root is visible AND either >=1 row OR the empty-state has painted. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        const start = Date.now();
        while (Date.now() - start < 15000) {
            if ((await this.rows.count()) > 0) return;
            if ((await this.emptyState.count()) > 0) return;
            await this.page.waitForTimeout(250);
        }
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminRequestForQuoteSelectors.phpFatal)
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        return !fatal;
    }

    // ---- Reads ----
    async getRowCount(): Promise<number> {
        return await this.rows.count();
    }

    async isEmptyStateVisible(): Promise<boolean> {
        return await this.emptyState.isVisible({ timeout: 5000 }).catch(() => false);
    }

    /** The status pill text for the row matching a quote title / rule name. */
    async statusOfRow(text: string): Promise<string> {
        const row = this.rowByText(text);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        return (await row.innerText()).trim();
    }

    /** True when a row whose visible text contains `text` is currently shown. */
    async hasRow(text: string): Promise<boolean> {
        return (await this.rowByText(text).count()) > 0;
    }

    // ---- Tabs / search ----
    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await this.page.waitForTimeout(900); // DataViews refetch + repaint.
    }

    /** Type into the Quote Rules List search box (debounced refetch). */
    async searchRules(query: string): Promise<void> {
        const input = this.rulesSearchBox;
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(query);
        await this.page.waitForTimeout(1000);
    }

    // ---- Navigation actions ----
    /** Click the "New Quote" header button; resolves on the add-new-quote route. */
    async clickNewQuote(): Promise<void> {
        await this.newQuoteButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.newQuoteButton.click();
        await this.page.waitForURL(/#\/request-for-quote\/add-new-quote/, { timeout: 15000 }).catch(() => undefined);
    }

    /** Click the "Quote Rules List" nav card; resolves on the rules route. */
    async clickQuoteRulesNavCard(): Promise<void> {
        await this.quoteRulesNavCard.waitFor({ state: 'visible', timeout: 10000 });
        await this.quoteRulesNavCard.click();
        await this.page.waitForURL(/#\/request-for-quote\/quote-rules/, { timeout: 15000 }).catch(() => undefined);
        await this.waitForReady();
    }

    // ---- Row actions ----
    /** Open the 3-dot actions menu for the row matching a quote title / rule name. */
    async openRowActionMenuFor(text: string): Promise<void> {
        const row = this.rowByText(text);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminRequestForQuoteSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    /** Click an item in the open actions menu, e.g. 'Trash', 'Delete Permanently', 'Mark Pending'. */
    async clickActionMenuItem(label: string): Promise<void> {
        const item = this.page.getByRole('menuitem', { name: new RegExp(escapeRegExp(label), 'i') }).first();
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
    }

    /** Confirm the DokanModal — both lists use confirmButtonText "Confirm". */
    async confirmModal(confirmLabel = 'Confirm'): Promise<void> {
        const btn = this.page.getByRole('button', { name: new RegExp(escapeRegExp(confirmLabel), 'i') }).first();
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
        await this.page.waitForTimeout(1500); // POST batch + list refetch.
    }

    /** Open the row menu for a row, choose Trash, confirm the modal. */
    async trashRow(text: string): Promise<void> {
        await this.openRowActionMenuFor(text);
        await this.clickActionMenuItem('Trash');
        await this.confirmModal('Confirm');
    }

    /** Open the row menu for a trashed row, choose Delete Permanently, confirm. */
    async deleteRowPermanently(text: string): Promise<void> {
        await this.openRowActionMenuFor(text);
        await this.clickActionMenuItem('Delete Permanently');
        await this.confirmModal('Confirm');
    }

    // ---- Bulk ----
    async selectRowsByText(texts: string[]): Promise<void> {
        for (const text of texts) {
            const cb = this.rowByText(text).locator('input[type="checkbox"]').first();
            await cb.waitFor({ state: 'visible', timeout: 10000 });
            await cb.check();
        }
    }

    /** Run a bulk action. Selecting rows reveals a selection toolbar with a
     * DIRECT action button (e.g. "Trash"); clicking it opens the DokanModal,
     * which is then confirmed. */
    async bulkAction(actionLabel: string, confirmLabel = 'Confirm'): Promise<void> {
        const action = this.page.getByRole('button', { name: new RegExp(escapeRegExp(actionLabel), 'i') }).first();
        await action.waitFor({ state: 'visible', timeout: 10000 });
        await action.click();
        await this.confirmModal(confirmLabel);
    }

    // ---- Sort (asserts the REST query rather than fragile DOM order) ----
    /** Open a sortable column's sort menu and choose "Sort ascending", which
     * fires the list refetch. Returns the captured request URL so the caller
     * can assert the orderby query. The DataViews column-header button opens a
     * popover of `menuitemradio` sort options rather than toggling directly. */
    async sortColumnAndCaptureQuery(columnName: string): Promise<string> {
        await this.page.getByRole('button', { name: columnName }).first().click();
        const sortAsc = this.page.getByRole('menuitemradio', { name: 'Sort ascending' });
        await sortAsc.waitFor({ state: 'visible', timeout: 10000 });
        const [req] = await Promise.all([this.page.waitForRequest(/\/dokan\/v1\/request-for-quote/, { timeout: 15000 }), sortAsc.click()]);
        return req.url();
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin RFQ UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.quotesHeading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
