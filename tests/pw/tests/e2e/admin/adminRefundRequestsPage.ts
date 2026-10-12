import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';
import { confirmDataViewsAction, dismissDataViewsAction, waitForDataViewsSettle } from './adminDataViews';
import { actionMenuItemByName } from '@utils/dataViews';

// ============================================
// TEST DATA
// ============================================
// The admin Refunds DataView is driven by vendor/customer-initiated refund
// REQUEST rows in {prefix}_dokan_refund. There is NO REST create route for a
// refund request, so this folder seeds rows via dbUtils.createRefundRequest
// (DB INSERT, status=0 pending, method=0 manual) on top of an API-created,
// active-status order. See admin-dashboard-seeding-strategy.md (§ Refund
// requests). Names that hit the marketplace are namespaced with the "AREF"
// prefix; refund rows themselves carry no name, so they are isolated by their
// (unique, freshly created) order id.
export const adminRefundRequestsData = {
    // A search term guaranteed to match no refund row, for the empty-state edge.
    searchMiss: 'AREF_zzz_no_such_refund_zzz',
} as const;

// ============================================
// SELECTORS — verified against dokan-pro/src/admin/refund/index.tsx.
// The admin Refunds page is the unified @dokan/components AdminDataViews list
// mounted on #dokan-admin-dashboard at admin.php?page=dokan-dashboard#/refund
// (route pushed onto the 'dokan-admin-dashboard-routes' filter, id 'refunds').
// Same DataViews surface as the admin Vendors list, so the row / search /
// row-action selectors mirror adminVendorsPage.ts.
// ============================================
export const adminRefundRequestsSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    table: 'table',
    dataRow: 'table tbody tr',
    // DataViews header search — SearchInput placeholder="Search Refunds".
    searchInput: 'input[placeholder="Search Refunds"]',
    // Per-row 3-dot actions trigger (scoped to a row — the toolbar shares the label).
    rowActionsBtn: "button[aria-label='Actions']",
    // Empty state DataViews renders when no row matches.
    emptyState: 'text=/no data found|no items|no results|nothing to show|no refund/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    loginForm: '#loginform, #user_login',
} as const;

// ============================================
// PAGE OBJECT — admin Refund Requests list (Dokan Pro 5.0.0+ React dashboard)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/refund
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// Cancel/Delete confirmation modal).
// ============================================
export class AdminRefundRequestsPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/refund');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminRefundRequestsSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminRefundRequestsSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminRefundRequestsSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminRefundRequestsSelectors.emptyState).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Refunds' }).first();
    }

    /** A status tab — Pending / Approved / Cancelled. The count badge text is
     * appended to the accessible name, so callers pass a RegExp. */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** A column header by visible label. */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** A list row, matched by its order-id cell. The Order ID field renders as
     * a "#<orderId>" link, which (unlike the truncated vendor cell) is exact
     * and unique per seeded order — the reliable way to isolate one refund. */
    rowByOrderId(orderId: string): Locator {
        return this.rows.filter({ has: this.page.getByRole('link', { name: `#${orderId}`, exact: true }) }).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
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
        await waitForDataViewsSettle(this.page);
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminRefundRequestsSelectors.phpFatal)
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

    /** True when a refund row for the given order id is present in the current view. */
    async isRowVisible(orderId: string): Promise<boolean> {
        return await this.rowByOrderId(orderId)
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    // ---- Tabs / search ----
    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await waitForDataViewsSettle(this.page);
    }

    async search(query: string): Promise<void> {
        const input = this.searchBox;
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(query);
        await waitForDataViewsSettle(this.page);
    }

    async clearSearch(): Promise<void> {
        const input = this.searchBox;
        if (await input.isVisible().catch(() => false)) {
            await input.fill('');
            await this.page.waitForTimeout(700);
        }
    }

    // ---- Row actions ----
    /** Open the 3-dot actions menu for the row matching an order id. */
    async openRowActionMenuFor(orderId: string): Promise<void> {
        const row = this.rowByOrderId(orderId);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminRefundRequestsSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    /** A row-action menu item locator by visible label (e.g. 'Refund Manually',
     * 'Refund via Payment Gateway', 'Cancel', 'Delete'). */
    actionMenuItem(label: string): Locator {
        return actionMenuItemByName(this.page, new RegExp(escapeRegExp(label), 'i')).first();
    }

    /** Click an item in the open actions menu. */
    async clickActionMenuItem(label: string): Promise<void> {
        const item = this.actionMenuItem(label);
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
    }

    /** Whether a given row-action is offered for an order's row. Opens the
     * kebab, reads the menu, then closes it with Escape (leaving state intact).
     * Used to assert that "Refund via Payment Gateway" is hidden for a manual /
     * COD refund (item.api === false). */
    async isRowActionAvailable(orderId: string, label: string): Promise<boolean> {
        await this.openRowActionMenuFor(orderId);
        const present = await this.actionMenuItem(label)
            .isVisible({ timeout: 3000 })
            .catch(() => false);
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return present;
    }

    /** Confirm the inline DataViews action (clicks the primary, non-Cancel button). */
    async confirmModal(confirmLabel: string): Promise<void> {
        void confirmLabel;
        await confirmDataViewsAction(this.page);
    }

    /** Open a row's menu, choose "Refund Manually", which fires the batch PUT
     * {completed} immediately (no confirm modal). */
    async refundManually(orderId: string): Promise<void> {
        await this.openRowActionMenuFor(orderId);
        await this.clickActionMenuItem('Refund Manually');
        await this.page.waitForTimeout(1500); // PUT batch + list refetch.
    }

    /** Open a row's menu, choose "Cancel", confirm the Cancel Refund modal. */
    async cancelRefund(orderId: string): Promise<void> {
        await this.openRowActionMenuFor(orderId);
        await this.clickActionMenuItem('Cancel');
        await this.confirmModal('Yes, Cancel');
    }

    /** Open a row's menu, choose "Cancel", but dismiss the modal WITHOUT
     * confirming (stale-state safety check — status must not change). */
    async openCancelModalAndDismiss(orderId: string): Promise<void> {
        await this.openRowActionMenuFor(orderId);
        await this.clickActionMenuItem('Cancel');
        await dismissDataViewsAction(this.page);
        await this.page.waitForTimeout(600);
    }

    /** Open a cancelled row's menu, choose "Delete", confirm the Delete modal. */
    async deleteRefund(orderId: string): Promise<void> {
        await this.openRowActionMenuFor(orderId);
        await this.clickActionMenuItem('Delete');
        await this.confirmModal('Delete Refund');
    }

    // ---- Bulk ----
    async selectRowsByOrderId(orderIds: string[]): Promise<void> {
        for (const id of orderIds) {
            const cb = this.rowByOrderId(id).locator('input[type="checkbox"]').first();
            await cb.waitFor({ state: 'visible', timeout: 10000 });
            await cb.check();
        }
    }

    /** Run a bulk action. Ticking rows reveals a selection toolbar with DIRECT
     * action buttons (e.g. "Refund Manually"); clicking fires the batch PUT.
     * For Cancel/Delete a confirm modal follows — pass its label, else omit. */
    async bulkAction(actionLabel: string, confirmLabel?: string): Promise<void> {
        const action = this.page.getByRole('button', { name: new RegExp(escapeRegExp(actionLabel), 'i') }).first();
        await action.waitFor({ state: 'visible', timeout: 10000 });
        await action.click();
        if (confirmLabel) {
            await this.confirmModal(confirmLabel);
        } else {
            await this.page.waitForTimeout(1500); // PUT batch + list refetch.
        }
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Refunds UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
