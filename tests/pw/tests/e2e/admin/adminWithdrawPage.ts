import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';
import { confirmDataViewsAction, waitForDataViewsSettle } from './adminDataViews';

// ============================================
// TEST DATA
// ============================================
// Vendors + withdrawal requests this folder seeds (REST createStore for the
// vendor account, DB insert into {prefix}_dokan_withdraw for the request rows)
// so the admin Withdraw list is deterministic. This is an ADMIN-only spec: the
// withdrawal state it asserts against is created programmatically, never by
// driving the vendor UI. See tests/pw/test-cases/admin-dashboard-seeding-strategy.md
// (§ Withdraw). All data names are prefixed "AW" to stay collision-free with the
// other admin specs running in parallel.
export const adminWithdrawData = {
    // Read-only fixtures — a standing pending and a standing cancelled request
    // that the list/tab read assertions filter to, never mutated.
    // NOTE: the withdraw list has NO search box and rows have NO avatar, so rows
    // are isolated by hasText on the store name. Names are kept SHORT (no cell
    // truncation) and NON-OVERLAPPING (no name is a substring of another — e.g.
    // 'AW Cancel' must not collide with the cancelled fixture, hence 'AW Voided').
    pending: { storeName: 'AWX Pending', userLogin: 'awx_pending', email: 'awx_pending@example.test', amount: '25' },
    cancelled: { storeName: 'AWX Voided', userLogin: 'awx_voided', email: 'awx_voided@example.test', amount: '30' },
    // Dedicated mutation targets — each approve / cancel / delete test owns one
    // vendor + request and resets the row to pending via DB before acting, so the
    // tests never race each other.
    approveTarget: { storeName: 'AWX Approve', userLogin: 'awx_approve', email: 'awx_approve@example.test', amount: '20' },
    cancelTarget: { storeName: 'AWX Cancel', userLogin: 'awx_cancel', email: 'awx_cancel@example.test', amount: '20' },
    // A vendor whose balance is below the requested amount — approving must hit
    // the insufficient-balance guard, not the approve confirmation modal.
    poor: { storeName: 'AWX Poor', userLogin: 'awx_poor', email: 'awx_poor@example.test', amount: '500' },
} as const;

// ============================================
// SELECTORS — verified against src/admin/dashboard/pages/withdraw/index.tsx.
// The admin Withdraw page is the unified @dokan/components AdminDataViews list
// mounted on #dokan-admin-dashboard at admin.php?page=dokan-dashboard#/withdraw.
// Status tabs are pending/approved/cancelled/all (the 'approved' tab maps to the
// backend 'completed' status). Row + bulk actions live behind a 3-dot menu:
// View, Approve (pending-only), Cancel (pending-only), Add Note, Delete.
// ============================================
export const adminWithdrawSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    dataRow: 'table tbody tr',
    // NOTE: the withdraw list has NO inline search box (only tabs + Filter +
    // Export), so rows are isolated by hasText on the store name, not search.
    // Per-row 3-dot actions trigger (scoped to a row; the bulk toolbar shares the label).
    rowActionsBtn: "button[aria-label='Actions']",
    // DataViews empty state when no row matches.
    emptyState: 'text=/no data found|no items|no results|nothing to show|no withdraw/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
} as const;

// ============================================
// PAGE OBJECT — admin Withdraw list (Dokan 5.0.0+ React admin dashboard)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/withdraw
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// Approve / Cancel / Delete confirmation modal).
// ============================================
export class AdminWithdrawPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/withdraw');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminWithdrawSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminWithdrawSelectors.dataRow);
    }
    get emptyState(): Locator {
        return this.page.locator(adminWithdrawSelectors.emptyState).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Withdraw' }).first();
    }

    /** A status tab — Pending / Approved / Cancelled / All. The count badge is not part of the accessible name. */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** A column header by visible label. */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** A list row that contains the given store name. */
    rowByStoreName(name: string): Locator {
        return this.rows.filter({ hasText: new RegExp(escapeRegExp(name), 'i') }).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
    }

    /** Navigate to an arbitrary hash route under the admin dashboard (e.g. deep-link). */
    async gotoRoute(hashRoute: string): Promise<void> {
        await this.page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#${hashRoute}`));
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
    }

    /** Ready when the React root is visible AND either ≥1 row OR the empty-state has painted. */
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
        await waitForDataViewsSettle(this.page);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminWithdrawSelectors.phpFatal)
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

    /** True when the page object's heading is currently visible. */
    async isHeadingVisible(): Promise<boolean> {
        return await this.heading.isVisible({ timeout: 5000 }).catch(() => false);
    }

    /** 'Pending' | 'Approved' | 'Cancelled' | '' for the row matching a store name. */
    async statusOfRow(storeName: string): Promise<string> {
        const row = this.rowByStoreName(storeName);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const text = await row.innerText();
        if (/Pending/i.test(text)) return 'Pending';
        if (/Approved/i.test(text)) return 'Approved';
        if (/Cancelled/i.test(text)) return 'Cancelled';
        return '';
    }

    /** True when a row for the given store name is present in the list. */
    async hasRow(storeName: string): Promise<boolean> {
        return (await this.rowByStoreName(storeName).count()) > 0;
    }

    /** True when the active tab's accessible name reflects the given label (aria-selected). */
    async isTabSelected(name: RegExp): Promise<boolean> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        const selected = await tab.getAttribute('aria-selected');
        return selected === 'true';
    }

    // ---- Tabs ----
    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await waitForDataViewsSettle(this.page); // wait for the tab refetch to settle (avoids stale rows).
    }

    // ---- Row actions ----
    /** Open the 3-dot actions menu for the row matching a store name. */
    async openRowActionMenuFor(storeName: string): Promise<void> {
        const row = this.rowByStoreName(storeName);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminWithdrawSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    /** Click an item in the open actions menu, e.g. 'View', 'Approve', 'Cancel', 'Add Note', 'Delete'. */
    async clickActionMenuItem(label: string): Promise<void> {
        const item = this.page.getByRole('menuitem', { name: new RegExp(escapeRegExp(label), 'i') }).first();
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
    }

    /** True when an action menu item is offered for a row (used to assert hidden Approve/Cancel on non-pending rows). */
    async rowActionAvailable(storeName: string, label: string): Promise<boolean> {
        await this.openRowActionMenuFor(storeName);
        const item = this.page.getByRole('menuitem', { name: new RegExp(escapeRegExp(label), 'i') }).first();
        const visible = await item.isVisible({ timeout: 3000 }).catch(() => false);
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return visible;
    }

    /**
     * Confirm the Plugin UI DataViews inline action confirm. The legacy
     * `confirmLabel` (e.g. 'Approve', 'Cancel Withdrawal', 'Delete') is no longer
     * needed — the confirm button now reads "Yes, <Verb>" — so we delegate to the
     * shared helper that clicks the primary (non-Cancel) button.
     */
    async confirmModal(confirmLabel: string): Promise<void> {
        void confirmLabel;
        await confirmDataViewsAction(this.page);
    }

    /** True when a DokanModal whose body contains the given text is open. */
    async modalContains(text: RegExp): Promise<boolean> {
        const dialog = this.page.getByRole('dialog').filter({ hasText: text }).first();
        return await dialog.isVisible({ timeout: 8000 }).catch(() => false);
    }

    /** Dismiss the currently open modal via Escape (best-effort). */
    async dismissModal(): Promise<void> {
        await this.page.keyboard.press('Escape').catch(() => undefined);
        await this.page.waitForTimeout(400);
    }

    /** Close a role="dialog" info modal (e.g. the Insufficient Balance modal, which
     * is a DokanModal, NOT the DataViews inline alertdialog) via its named button. */
    async closeDialog(buttonLabel = 'Close'): Promise<void> {
        const dialog = this.page.getByRole('dialog').last();
        await dialog
            .getByRole('button', { name: new RegExp(`^${buttonLabel}$`, 'i') })
            .first()
            .click();
        await dialog.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => undefined);
    }

    /** Open the row menu for a pending request, choose Approve, confirm. */
    async approveRequest(storeName: string): Promise<void> {
        await this.openRowActionMenuFor(storeName);
        await this.clickActionMenuItem('Approve');
        // Approve confirmation modal — singular copy. Confirm button label = 'Approve'.
        await this.confirmModal('Approve');
    }

    /** Open the row menu for a pending request, choose Approve, then confirm the
     * inline "Approve Withdrawal" dialog. The insufficient-balance guard now runs
     * INSIDE the approve action callback (it used to pre-check before the confirm),
     * so the Insufficient Balance modal only surfaces after this confirmation. */
    async startApprove(storeName: string): Promise<void> {
        await this.openRowActionMenuFor(storeName);
        await this.clickActionMenuItem('Approve');
        await confirmDataViewsAction(this.page);
    }

    /** Open the row menu for a pending request, choose Cancel, confirm. */
    async cancelRequest(storeName: string): Promise<void> {
        await this.openRowActionMenuFor(storeName);
        await this.clickActionMenuItem('Cancel');
        await this.confirmModal('Cancel Withdrawal');
    }

    /** Open the row menu for a request, choose Delete, confirm. */
    async deleteRequest(storeName: string): Promise<void> {
        await this.openRowActionMenuFor(storeName);
        await this.clickActionMenuItem('Delete');
        await this.confirmModal('Delete');
    }

    /** Open the View modal for a request and return the dialog locator. */
    async openViewModal(storeName: string): Promise<Locator> {
        await this.openRowActionMenuFor(storeName);
        await this.clickActionMenuItem('View');
        const dialog = this.page.getByRole('dialog').last();
        await dialog.waitFor({ state: 'visible', timeout: 10000 });
        return dialog;
    }

    /** Add (or replace) a note on a request via the Add Note modal. */
    async addNote(storeName: string, note: string): Promise<void> {
        await this.openRowActionMenuFor(storeName);
        await this.clickActionMenuItem('Add Note');
        // The note field is a textarea labelled by its placeholder "Write here".
        const textarea = this.page.getByRole('textbox', { name: 'Write here' }).first();
        await textarea.waitFor({ state: 'visible', timeout: 10000 });
        await textarea.fill(note);
        await textarea.blur();
        await this.confirmModal('Add Note');
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Withdraw UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
