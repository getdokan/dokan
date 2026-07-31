import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';
import { confirmDataViewsAction, waitForDataViewsSettle } from './adminDataViews';

// ============================================
// TEST DATA
// ============================================
// Store reviews this folder seeds via REST (apiUtils.createStoreReview) so the
// admin Store Reviews list is deterministic. This is an ADMIN-only spec: every
// review it moderates is created programmatically (a vendor store + a customer +
// a published `dokan_store_reviews` post), never by driving the storefront UI.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Store reviews).
//
// IMPORTANT (verified against modules/store-reviews/src/components/ReviewList.tsx):
// the module has NO approve/spam status. Reviews are inserted as 'publish';
// moderation is Move to Trash -> Restore (back to publish) / Delete Permanently.
// Tabs are All / Trash. So the prompt's "approve/spam/trash" maps onto the real
// surface as the trash / restore / delete moderation flow.
export const adminStoreReviewsData = {
    // The vendor store every seeded review targets (idempotent, re-runnable).
    store: { storeName: 'ASR Review Target Store', userLogin: 'asr_review_target', email: 'asr_review_target@example.test' },
    // Read-only fixture review — never moved, so its presence is parallel-safe.
    visible: { title: 'ASR Visible Review', content: 'ASR visible review content for the admin list', rating: 4 },
    // Dedicated single-action targets; each test owns one review and resets its
    // status via the API before acting, so the moderation tests never race.
    trashTarget: { title: 'ASR Trash Target Review', content: 'ASR review to be moved to trash', rating: 2 },
    restoreTarget: { title: 'ASR Restore Target Review', content: 'ASR review to be restored from trash', rating: 3 },
    deleteTarget: { title: 'ASR Delete Target Review', content: 'ASR review to be deleted permanently', rating: 1 },
    // Bulk-action targets (moved to trash together, then bulk-restored).
    bulk: [
        { title: 'ASR Bulk One Review', content: 'ASR bulk review one content', rating: 5 },
        { title: 'ASR Bulk Two Review', content: 'ASR bulk review two content', rating: 5 },
    ],
    // A search term guaranteed to match no review, for the empty-state edge.
    searchMiss: 'zzz_no_such_review_zzz',
} as const;

// ============================================
// SELECTORS — verified against
// modules/store-reviews/src/components/ReviewList.tsx (the Pro `ReviewList`
// component the admin route mounts at admin.php?page=dokan-dashboard#/store-reviews
// via the dokan-admin-dashboard-routes filter, path 'store-reviews').
// It is the unified @dokan/components AdminDataViews list (namespace
// 'store-reviews-data-view'), so row / search / row-action / bulk / confirm-modal
// selectors mirror the verified vendor/admin DataViews patterns in adminVendorsPage.ts.
// ============================================
export const adminStoreReviewsSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    table: 'table',
    dataRow: 'table tbody tr',
    // DataViews header search — placeholder="Search" (SearchInput component).
    searchInput: 'input[placeholder="Search"]',
    // Per-row 3-dot actions trigger (scoped to tbody — the toolbar shares the label).
    rowActionsBtn: "button[aria-label='Actions']",
    // Empty state DataViews renders when no row matches.
    emptyState: 'text=/no data found|no items|no results|nothing to show|no review/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    loginForm: '#loginform, #user_login',
} as const;

// ============================================
// PAGE OBJECT — admin Store Reviews list (Dokan Pro 5.0.0+ React admin dashboard)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/store-reviews
// NOTE: admin-facing — the vendor announcement modal does NOT appear in wp-admin,
// so this page object deliberately does NOT register the closeAnnouncementModal
// handler (a generic role=dialog handler would race the trash/restore/delete
// confirmation modals).
// ============================================
export class AdminStoreReviewsPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/store-reviews');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminStoreReviewsSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminStoreReviewsSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminStoreReviewsSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminStoreReviewsSelectors.emptyState).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Store Reviews' }).first();
    }

    /** A status tab — All / Trash. The count badge is not part of the accessible name. */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** A column header by visible label (Title / Comment / Reviewer / Store / Rating / Submitted On). */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** A list row matched by the review title text. The title cell is NOT truncated by
     * an avatar (these rows have no img), so a unique seeded title isolates one row. */
    rowByTitle(title: string): Locator {
        return this.rows.filter({ hasText: title }).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
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
            .locator(adminStoreReviewsSelectors.phpFatal)
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

    /** True when a review with the given title is currently in the list. */
    async isReviewVisible(title: string): Promise<boolean> {
        return await this.rowByTitle(title)
            .isVisible({ timeout: 8000 })
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
        // The Store Reviews AdminDataViews does not include a SearchInput widget in its
        // additionalComponents (unlike vendors.tsx). The WordPress DataViews built-in search
        // is also bypassed because AdminDataViewTable provides children to @wordpress/dataviews,
        // skipping DefaultUI. If the box is absent we proceed without filtering — rows with
        // unique ASR-prefixed titles are still findable directly on page 1 (newest-first order).
        const visible = await input.isVisible({ timeout: 3000 }).catch(() => false);
        if (!visible) return;
        await input.fill(query);
        await waitForDataViewsSettle(this.page);
    }

    async clearSearch(): Promise<void> {
        const input = this.searchBox;
        if (await input.isVisible().catch(() => false)) {
            await input.fill('');
            await this.page.waitForTimeout(600);
        }
    }

    // ---- Row actions ----
    /** Open the 3-dot actions menu for the row matching a review title. */
    async openRowActionMenuFor(title: string): Promise<void> {
        const row = this.rowByTitle(title);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminStoreReviewsSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    /** Click an item in the open actions menu, e.g. 'Move to Trash', 'Restore', 'Delete Permanently', 'Edit'. */
    async clickActionMenuItem(label: string): Promise<void> {
        const item = this.page.getByRole('menuitem', { name: new RegExp(escapeRegExp(label), 'i') }).first();
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
    }

    /** Confirm the inline DataViews action (clicks the primary, non-Cancel button). */
    async confirmModal(confirmLabel?: string): Promise<void> {
        void confirmLabel;
        await confirmDataViewsAction(this.page);
    }

    /** Open the row menu for a published review, choose Move to Trash, confirm. */
    async trashReview(title: string): Promise<void> {
        await this.openRowActionMenuFor(title);
        await this.clickActionMenuItem('Move to Trash');
        await this.confirmModal('Move to Trash');
    }

    /** Open the row menu for a trashed review, choose Restore, confirm. */
    async restoreReview(title: string): Promise<void> {
        await this.openRowActionMenuFor(title);
        await this.clickActionMenuItem('Restore');
        await this.confirmModal('Restore');
    }

    /** Open the row menu for a trashed review, choose Delete Permanently, confirm. */
    async deleteReview(title: string): Promise<void> {
        await this.openRowActionMenuFor(title);
        await this.clickActionMenuItem('Delete Permanently');
        await this.confirmModal('Delete');
    }

    // ---- Bulk ----
    async selectRowsByTitle(titles: string[]): Promise<void> {
        for (const title of titles) {
            const cb = this.rowByTitle(title).locator('input[type="checkbox"]').first();
            await cb.waitFor({ state: 'visible', timeout: 10000 });
            await cb.check();
        }
    }

    /** Run a bulk action. Selecting rows reveals a selection toolbar with a DIRECT
     * action button (e.g. "Move to Trash" / "Restore" / "Delete Permanently"), not a
     * row kebab; clicking it opens the same confirm modal. */
    async bulkAction(actionLabel: string, confirmLabel: string): Promise<void> {
        const action = this.page.getByRole('button', { name: new RegExp(escapeRegExp(actionLabel), 'i') }).first();
        await action.waitFor({ state: 'visible', timeout: 10000 });
        await action.click();
        await this.confirmModal(confirmLabel);
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Store Reviews UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
