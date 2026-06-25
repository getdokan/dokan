import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';
import { confirmDataViewsAction, waitForDataViewsSettle } from './adminDataViews';

// ============================================
// TEST DATA
// ============================================
// The admin Verifications DataView is read/moderate-only: it has NO create
// path, so every list row is seeded over REST (createVerificationMethod +
// uploadMedia + createVerificationRequest, adminAuth) by the spec. This is an
// ADMIN-only page object — the vendor state it asserts against is created
// programmatically, never by driving the vendor UI.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Vendor verifications).
//
// Seeded names are namespaced with the "AVER" prefix so the list is
// deterministic and re-runnable.
export const adminVerificationsData = {
    // Store seeded as the vendor that owns every seeded verification request.
    vendor: {
        storeName: 'AVER Verification Store',
        userLogin: 'aver_verification_vendor',
        email: 'aver_verification_vendor@example.test',
    },
    // A note used by the add-note flow.
    note: 'AVER moderation note',
    // A search term guaranteed to match no request, for the empty-state edge.
    searchMiss: 'zzz_no_such_verification_zzz',
} as const;

// ============================================
// SELECTORS — verified against
// dokan-pro/modules/vendor-verification/src/components/admin/VerificationList.tsx.
// The admin Verifications page is the unified @dokan/components AdminDataViews
// list mounted on #dokan-admin-dashboard at
// admin.php?page=dokan-dashboard#/verifications. Same DataViews surface as the
// admin Vendors list, so the row / search / row-action / bulk selectors mirror
// tests/e2e/admin/adminVendorsPage.ts.
// ============================================
export const adminVerificationsSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    table: 'table',
    dataRow: 'table tbody tr',
    // DataViews header search — placeholder="Search" (SearchInput component).
    searchInput: 'input[placeholder="Search"]',
    // Per-row 3-dot actions trigger (scoped to tbody — the toolbar shares the label).
    rowActionsBtn: "button[aria-label='Actions']",
    // Empty state DataViews renders when no row matches.
    emptyState: 'text=/no data found|no items|no results|nothing to show|no verification/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

// ============================================
// PAGE OBJECT — admin Verifications list (Dokan Pro vendor-verification module)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/verifications
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// Approve/Reject confirmation modal).
// ============================================
export class AdminVerificationsPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/verifications');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminVerificationsSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminVerificationsSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminVerificationsSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminVerificationsSelectors.emptyState).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Verification' }).first();
    }

    /** A status tab — Pending / Approved / Rejected / Cancelled. The count badge
     * is part of the visible title ("Pending (3)"), so always match by RegExp. */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** A column header by visible label (Request ID / Method / Documents / Status / Vendor / Note / Date). */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** A list row, matched by its Request ID cell ("#<id>"). The vendor / method
     * cell text is truncated at 22 chars, but the Request ID is rendered in full
     * and is unique, so it is the robust row key for this DataView. */
    rowByRequestId(requestId: string | number): Locator {
        return this.rows.filter({ hasText: new RegExp(`#${requestId}\\b`) }).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
    }

    /** Ready when the React root is visible AND either the data has fully loaded
     * (at least one row shows real "#<id>" text, not a loading skeleton) OR the
     * empty-state has painted. The VerificationList component renders skeleton
     * `<tr>` rows while isLoading=true (so rows.count()>0 is not sufficient); we
     * must wait for a row that actually contains "#\d" in its ID cell. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        const idCellLoaded = this.page.locator('table tbody tr').filter({ hasText: /#\d/ }).first();
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await idCellLoaded.count()) > 0) return;
            if ((await this.emptyState.count()) > 0) return;
            await this.page.waitForTimeout(250);
        }
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminVerificationsSelectors.phpFatal)
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

    /** The lower-cased status word ('pending' | 'approved' | 'rejected' | 'cancelled' | '')
     * for the row matching a request id. The status pill renders the status_title. */
    async statusOfRequest(requestId: string | number): Promise<string> {
        const row = this.rowByRequestId(requestId);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await row.innerText()).toLowerCase();
        if (/approved/.test(text)) return 'approved';
        if (/rejected/.test(text)) return 'rejected';
        if (/cancelled/.test(text)) return 'cancelled';
        if (/pending/.test(text)) return 'pending';
        return '';
    }

    /** True when the row for a request id is present in the current view. */
    async hasRequest(requestId: string | number): Promise<boolean> {
        return (await this.rowByRequestId(requestId).count()) > 0;
    }

    /** The visible document link titles inside a request's Documents cell. */
    async documentLinkCount(requestId: string | number): Promise<number> {
        const row = this.rowByRequestId(requestId);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        return await row.locator('a[target="_blank"]').count();
    }

    // ---- Tabs / search ----
    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        // After tab change the component refetches; wait for real data (not
        // skeleton) OR the empty-state, whichever comes first.
        await this.waitForTabData(10000);
    }

    /** Wait for the current tab to finish loading — either a real "#<id>" row
     * or the empty-state is visible. Used after tab clicks to avoid acting on
     * skeleton rows. */
    private async waitForTabData(timeoutMs = 10000): Promise<void> {
        const idCellLoaded = this.page.locator('table tbody tr').filter({ hasText: /#\d/ }).first();
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await idCellLoaded.count()) > 0) return;
            if ((await this.emptyState.count()) > 0) return;
            await this.page.waitForTimeout(200);
        }
    }

    /** True when the given tab is the selected one (aria-selected="true"). */
    async isTabSelected(name: RegExp): Promise<boolean> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        return (await tab.getAttribute('aria-selected')) === 'true';
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

    // ---- Row actions ----
    /** Open the 3-dot actions menu for the row matching a request id. */
    async openRowActionMenuFor(requestId: string | number): Promise<void> {
        const row = this.rowByRequestId(requestId);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminVerificationsSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    /** Click an item in the open actions menu, e.g. 'Approve', 'Reject', 'Add Note'. */
    async clickActionMenuItem(label: string): Promise<void> {
        const item = this.page.getByRole('menuitem', { name: new RegExp(escapeRegExp(label), 'i') }).first();
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
    }

    /** Confirm the inline DataViews action (clicks the primary, non-Cancel button). */
    async confirmModal(confirmLabel: string): Promise<void> {
        void confirmLabel;
        await confirmDataViewsAction(this.page);
    }

    /** Open the row menu for a pending request, choose Approve, confirm. */
    async approveRequest(requestId: string | number): Promise<void> {
        await this.openRowActionMenuFor(requestId);
        await this.clickActionMenuItem('Approve');
        await this.confirmModal('Approve');
    }

    /** Open the row menu for a request, choose Reject, confirm. */
    async rejectRequest(requestId: string | number): Promise<void> {
        await this.openRowActionMenuFor(requestId);
        await this.clickActionMenuItem('Reject');
        await this.confirmModal('Reject');
    }

    /** Open the row menu for a non-pending request, choose Pending, confirm. */
    async markRequestPending(requestId: string | number): Promise<void> {
        await this.openRowActionMenuFor(requestId);
        await this.clickActionMenuItem('Pending');
        await this.confirmModal('Mark as Pending');
    }

    /** Add (or edit) a note on a request via the add-note modal's textarea. */
    async addNote(requestId: string | number, note: string): Promise<void> {
        await this.openRowActionMenuFor(requestId);
        await this.clickActionMenuItem('Note'); // 'Add Note' or 'Edit Note'.
        const textarea = this.page.locator('#dokan-verification-note-modal');
        await textarea.waitFor({ state: 'visible', timeout: 10000 });
        await textarea.fill(note);
        await textarea.blur();
        // Confirm button is 'Add Note' (no existing note) or 'Update Note'.
        const dialog = this.page.getByRole('dialog').first();
        const confirm = dialog.getByRole('button', { name: /^(Add Note|Update Note)$/i }).first();
        await confirm.click();
        await this.page.waitForTimeout(1200);
    }

    // ---- Bulk ----
    async selectRowsByRequestId(requestIds: Array<string | number>): Promise<void> {
        for (const id of requestIds) {
            const cb = this.rowByRequestId(id).locator('input[type="checkbox"]').first();
            await cb.waitFor({ state: 'visible', timeout: 10000 });
            await cb.check();
        }
    }

    /** Run a bulk action. Selecting rows reveals a selection toolbar with a
     * DIRECT action button (e.g. "Approve" / "Reject"), not a row kebab;
     * clicking it opens the same confirm modal. */
    async bulkAction(actionLabel: string, confirmLabel: string): Promise<void> {
        const action = this.page.getByRole('button', { name: new RegExp(`^${escapeRegExp(actionLabel)}$`, 'i') }).first();
        await action.waitFor({ state: 'visible', timeout: 10000 });
        await action.click();
        await this.confirmModal(confirmLabel);
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Verifications UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
