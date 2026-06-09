import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';

// ============================================
// TEST DATA
// ============================================
// The admin Store Support DataView (#/admin-store-support) is a moderation
// surface for tickets CUSTOMERS raise to VENDORS. There is NO admin
// create-ticket REST route, so every ticket the admin list/detail/actions
// exercise is pre-seeded as a customer precondition via
// apiUtils.createSupportTicket + updateSupportTicketStatus (admin auth). This is
// an ADMIN-only spec: the moderation state it asserts is created
// programmatically, never by driving the vendor/customer UI.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Store support).
//
// Titles are kept <= 22 chars: the list column renders truncate(post_title, 22),
// so a short, unique title is not ellipsis-truncated and can be matched whole.
export const adminStoreSupportData = {
    // Read-only fixtures (never mutated by a UI test, so reads are parallel-safe).
    open: { title: 'ASS Open Ticket' },
    closed: { title: 'ASS Closed Ticket' },
    // Dedicated mutation targets — each close/open test owns one ticket and
    // resets its status via API before acting, so tests never race each other.
    closeTarget: { title: 'ASS Close Target' },
    openTarget: { title: 'ASS Open Target' },
    bulk: [{ title: 'ASS Bulk One' }, { title: 'ASS Bulk Two' }],
    // A search term guaranteed to match no ticket, for the empty-state edge.
    searchMiss: 'zzz_no_such_ticket_zzz',
} as const;

// ============================================
// SELECTORS — verified against
// dokan-pro/modules/store-support/src/js/admin/StoreSupportList.tsx +
// StoreSupportSingle.tsx. The admin Store Support page is the unified
// @dokan/components AdminDataViews list mounted on #dokan-admin-dashboard at
// admin.php?page=dokan-dashboard#/admin-store-support. Same DataViews surface
// as the admin Vendors list, so row / search / tab / row-action selectors
// mirror tests/e2e/admin/adminVendorsPage.ts.
// ============================================
export const adminStoreSupportSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    table: 'table',
    dataRow: 'table tbody tr',
    // DataViews tabs additionalComponents SearchInput — placeholder="Search ticket".
    searchInput: 'input[placeholder="Search ticket"]',
    // Per-row 3-dot actions trigger (scoped to a row — the toolbar shares the label).
    rowActionsBtn: "button[aria-label='Actions']",
    // Empty state DataViews renders when no row matches.
    emptyState: 'text=/no data found|no items|no results|nothing to show|no ticket/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    loginForm: '#loginform, #user_login',
} as const;

// ============================================
// PAGE OBJECT — admin Store Support list + single (Dokan Pro 5.0.0+ React admin)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/admin-store-support
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// Delete-reply confirmation modal).
// ============================================
export class AdminStoreSupportPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/admin-store-support');

    constructor(page: Page) {
        this.page = page;
    }

    /** Detail (single ticket) route for a given ticket + vendor pair. */
    singleUrl(ticketId: string | number, vendorId: string | number): string {
        return toPath(`wp-admin/admin.php?page=dokan-dashboard#/admin-store-support/${ticketId}/${vendorId}`);
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminStoreSupportSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminStoreSupportSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminStoreSupportSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminStoreSupportSelectors.emptyState).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Store Support' }).first();
    }

    /** A status tab — All / Open / Closed. The count badge is part of the visible
     * text, so match by a loose RegExp on the label, not an exact name. */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** A column header by visible label. */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** A list row, matched by the (short, untruncated) ticket title text. Titles
     * are seeded <= 22 chars so truncate(title, 22) leaves them whole. */
    rowByTitle(title: string): Locator {
        return this.rows.filter({ hasText: title }).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    async gotoSingle(ticketId: string | number, vendorId: string | number): Promise<void> {
        await this.page.goto(this.singleUrl(ticketId, vendorId));
        await this.page.waitForLoadState('domcontentloaded');
        await this.reactRoot.waitFor({ state: 'visible', timeout: 30000 });
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
            .locator(adminStoreSupportSelectors.phpFatal)
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

    /** 'Open' | 'Closed' | '' for the row matching a ticket title (Status pill). */
    async statusOfRow(title: string): Promise<string> {
        const row = this.rowByTitle(title);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const text = await row.innerText();
        if (/Closed/.test(text)) return 'Closed';
        if (/Open/.test(text)) return 'Open';
        return '';
    }

    // ---- Tabs / search ----
    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await this.page.waitForTimeout(900); // DataViews refetch + repaint.
    }

    /** The currently selected tab's accessible name (aria-selected="true"). */
    async selectedTabName(): Promise<string> {
        const selected = this.page.getByRole('tab', { selected: true }).first();
        if (await selected.isVisible().catch(() => false)) {
            return (await selected.innerText()).trim();
        }
        return '';
    }

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
    /** Click the ticket ID cell to open the detail route #/admin-store-support/:id/:vendorId. */
    async openTicketDetail(title: string): Promise<void> {
        const row = this.rowByTitle(title);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        // The Ticket ID cell is the clickable navigator (#<ID>).
        await row
            .getByText(/^#\d+$/)
            .first()
            .click();
        await this.page.waitForURL(/#\/admin-store-support\/\d+\/\d+/, { timeout: 15000 }).catch(() => undefined);
    }

    // ---- Row actions ----
    /** Open the 3-dot actions menu for the row matching a ticket title. */
    async openRowActionMenuFor(title: string): Promise<void> {
        const row = this.rowByTitle(title);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminStoreSupportSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    /** Click an item in the open actions menu, e.g. 'Open', 'Close', 'Mark as Read'. */
    async clickActionMenuItem(label: string): Promise<void> {
        const item = this.page.getByRole('menuitem', { name: new RegExp(escapeRegExp(label), 'i') }).first();
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
        await this.page.waitForTimeout(1200); // POST + list refetch.
    }

    /** Open the row menu for an open ticket, choose Close (no confirm modal for status). */
    async closeTicket(title: string): Promise<void> {
        await this.openRowActionMenuFor(title);
        await this.clickActionMenuItem('Close');
    }

    /** Open the row menu for a closed ticket, choose Open. */
    async openTicket(title: string): Promise<void> {
        await this.openRowActionMenuFor(title);
        await this.clickActionMenuItem('Open');
    }

    // ---- Bulk ----
    async selectRowsByTitle(titles: string[]): Promise<void> {
        for (const title of titles) {
            const cb = this.rowByTitle(title).locator('input[type="checkbox"]').first();
            await cb.waitFor({ state: 'visible', timeout: 10000 });
            await cb.check();
        }
    }

    /** Run a bulk action. Selecting rows reveals a selection toolbar with a
     * DIRECT action button (e.g. "Close" / "Open" / "Mark as Read"); the status
     * actions fire immediately with no confirm modal. */
    async bulkAction(actionLabel: string): Promise<void> {
        const action = this.page.getByRole('button', { name: new RegExp(escapeRegExp(actionLabel), 'i') }).first();
        await action.waitFor({ state: 'visible', timeout: 10000 });
        await action.click();
        await this.page.waitForTimeout(1500); // POST batch + list refetch.
    }

    // ---- Detail (single ticket) ----
    get detailHeading(): Locator {
        return this.page.getByRole('heading', { level: 3 }).first();
    }
    get detailBackLink(): Locator {
        return this.page.getByRole('button', { name: /Ticket list/i }).first();
    }
    get detailNotFound(): Locator {
        // The shared <NotFound> fallback (dokan-lite/src/layout/404.tsx) renders
        // title "Sorry, the page can't be found", message "...appears to have
        // been moved, deleted or does not exist", and a "Back to Dashboard"
        // button. Match those exact, stable phrases (the old regex never
        // appeared in the rendered copy, so NotFound was never detected).
        return this.page
            .locator(
                'text=/can.?t be found|appears to have been moved|moved, deleted or does not exist|Back to Dashboard/i'
            )
            .first();
    }
    /** True when the single-ticket page rendered the NotFound fallback (bad id/IDOR). */
    async isDetailNotFound(): Promise<boolean> {
        // The detail page fetches the ticket via REST and renders EITHER the valid
        // ticket ("Ticket Summary" sidebar) OR the shared <NotFound> fallback AFTER
        // gotoSingle resolves. isVisible() does NOT wait (it snapshots the current
        // state), so the old code raced the fetch and saw neither -> false. Wait for
        // the NotFound copy to actually appear; a valid ticket never renders it.
        try {
            await this.detailNotFound.waitFor({ state: 'visible', timeout: 12000 });
            return true;
        } catch {
            return false;
        }
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Store Support UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
