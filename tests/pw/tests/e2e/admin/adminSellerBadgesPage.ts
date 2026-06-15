import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';
import { waitForDataViewsSettle } from './adminDataViews';

// ============================================
// TEST DATA
// ============================================
// Seeded entirely via REST (apiUtils.createSellerBadge), so the admin Seller
// Badge list is deterministic. ADMIN-only spec: every badge precondition is
// created programmatically (POST /dokan/v1/seller-badge), never by driving the
// vendor UI. See tests/pw/test-cases/admin-dashboard-seeding-strategy.md
// (§ Announcements & Seller badges).
//
// NOTE: one badge definition is allowed PER event_type (the REST create returns
// 'invalid-event-type' otherwise — apiUtils.createSellerBadge falls back to
// getSellerBadgeId). So the namespace prefix "ASB" lives in badge_name only;
// the distinct event_type values keep the seeded rows unique.
export const adminSellerBadgesData = {
    // A published badge that read-only tests assert against (never mutated).
    published: { eventType: 'featured_products', badgeName: 'ASB Featured Products' },
    // A draft badge the publish flow owns; reset to draft via API before acting.
    publishTarget: { eventType: 'exclusive_to_platform', badgeName: 'ASB Exclusive To Platform' },
    // A published badge the set-as-draft flow owns; reset to published via API.
    draftTarget: { eventType: 'product_published', badgeName: 'ASB Products Published' },
    // A search term guaranteed to match no badge, for the empty-state edge.
    searchMiss: 'zzz_no_such_badge_zzz',
} as const;

// ============================================
// SELECTORS — verified against the REAL source:
//   dokan-pro/modules/seller-badge/assets/src/admin/pages/SellerBadgeList.vue
//   dokan-pro/modules/seller-badge/assets/src/admin/pages/NewSellerBadge.vue
//   dokan-lite/src/admin/components/Search.vue
//   node_modules/vue-wp-list-table/src/components/ListTable.vue
//
// IMPORTANT — this admin area is the LEGACY Vue admin SPA, NOT the new React
// DataViews surface that adminVendors uses. The route is registered via the
// `dokan-admin-routes` filter into the Vue HashRouter mounted on
// `#dokan-vue-admin` at admin.php?page=dokan (NOT page=dokan-dashboard). So:
//   - rows / columns / checkboxes / bulk are WP `vue-wp-list-table` markup
//     (table.wp-list-table, input[name="item[]"], select[name="action"] + Apply)
//   - status tabs are <ul class="subsubsub"> links (All | Published | Draft)
//   - row actions are inline <a> links (Edit / Preview / Show Vendors /
//     Publish Badge / Set Badge As Draft / Delete)
//   - confirm modals are SweetAlert2 (.swal2-popup, .swal2-confirm), labels
//     "Yes, Publish" / "Yes, Draft" / "Yes, Delete", cancel "No, Cancel"
// ============================================
export const adminSellerBadgesSelectors = {
    // Legacy Vue admin SPA root. Dokan 5.0.3 renamed this mount node from
    // #dokan-vue-admin to #vue-backend-app (class .dokan-admin-page-body); match
    // both so the page object survives across versions.
    reactRoot: '#vue-backend-app, #dokan-vue-admin',
    pageWrapper: '.seller-badge-list',
    table: 'table.wp-list-table, #seller_badge_list_table table',
    dataRow: '#seller_badge_list_table tbody tr',
    // Search.vue renders input#post-search-input with placeholder = title prop.
    searchInput: 'input#post-search-input[name="s"]',
    // Status filter links (subsubsub) — All / Published / Draft.
    statusTabs: 'ul.subsubsub a',
    // The "+ Create Badge" link.
    createBadgeLink: 'a.page-title-action',
    // Per-row checkbox (vue-wp-list-table).
    rowCheckbox: 'input[name="item[]"]',
    // Bulk action <select> + Apply button (vue-wp-list-table).
    bulkSelect: 'select[name="action"]',
    bulkApply: 'button.button.action',
    // SweetAlert2 confirm modal.
    swalPopup: '.swal2-popup',
    swalConfirm: '.swal2-confirm',
    swalCancel: '.swal2-cancel',
    // Empty state ("No badges found.").
    emptyState: 'text=/no badges found|no data|no results/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // Non-admin permission wall.
    permissionDenied: 'text=/you are not allowed|do not have permission|cheatin/i',
    loginForm: '#loginform, #user_login',
    // Create form (NewSellerBadge.vue).
    badgeNameInput: 'input#title[name="post_title"]',
    statusSelect: 'select#status[name="badge_status"]',
} as const;

// ============================================
// PAGE OBJECT — admin Seller Badge list (Dokan Pro seller-badge module).
// Surface: wp-admin/admin.php?page=dokan#/dokan-seller-badge (legacy Vue SPA).
//
// The task brief named the route page=dokan-dashboard#/dokan-seller-badge, but
// the module registers ONLY into the legacy Vue admin router (page=dokan); the
// React HashRouter at page=dokan-dashboard would fall through to AdminNotFound.
// See the note in the spec / returned notes.
//
// ADMIN-facing: deliberately does NOT register the closeAnnouncementModal /
// generic role=dialog auto-dismiss handler — it would race the SweetAlert2
// confirm modal of the publish/draft/delete flows.
// ============================================
export class AdminSellerBadgesPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan#/dokan-seller-badge');
    readonly createUrl = toPath('wp-admin/admin.php?page=dokan#/dokan-seller-badge/new');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminSellerBadgesSelectors.reactRoot).first();
    }
    get pageWrapper(): Locator {
        return this.page.locator(adminSellerBadgesSelectors.pageWrapper).first();
    }
    get rows(): Locator {
        return this.page.locator(adminSellerBadgesSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminSellerBadgesSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminSellerBadgesSelectors.emptyState).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Seller Badge' }).first();
    }
    get createBadgeLink(): Locator {
        return this.page.locator(adminSellerBadgesSelectors.createBadgeLink).first();
    }
    get bulkSelect(): Locator {
        return this.page.locator(adminSellerBadgesSelectors.bulkSelect).first();
    }
    get bulkApply(): Locator {
        return this.page.locator(adminSellerBadgesSelectors.bulkApply).first();
    }

    /** A status filter link — All / Published / Draft. The subsubsub labels carry
     * a live count ("Published 2") that re-renders after a status flip, so a
     * hasText-matched click is flagged "unstable". Target the stable href query
     * (?badge_status=published|draft|all) instead. */
    tab(name: RegExp): Locator {
        const src = name.source.toLowerCase();
        const status = /publish/.test(src) ? 'published' : /draft/.test(src) ? 'draft' : 'all';
        return this.page.locator(`ul.subsubsub a[href*="badge_status=${status}"]`).first();
    }

    /** A column header by visible label. */
    columnHeader(name: RegExp | string): Locator {
        return this.page.locator(adminSellerBadgesSelectors.table).locator('thead th').filter({ hasText: name }).first();
    }

    /** A list row, matched by the badge image alt (the FULL badge name) — robust
     * against truncated/wrapped cell text. The Vue template renders
     * `<img :alt="data.row.badge_name">` in the badge_name cell. */
    rowByBadgeName(name: string): Locator {
        return this.rows.filter({ has: this.page.locator(`img[alt="${name}"]`) }).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
    }

    /** Ready when the Vue root + page wrapper are visible AND either ≥1 row OR
     * the empty-state has painted. */
    async waitForReady(timeoutMs = 30000): Promise<void> {
        await this.reactRoot.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.pageWrapper.waitFor({ state: 'visible', timeout: timeoutMs }).catch(() => undefined);
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
            .locator(adminSellerBadgesSelectors.phpFatal)
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
        // The "No badges found." placeholder renders AFTER the debounced search
        // refetch; isVisible() snapshots the current state (no waiting) and loses
        // the race. waitFor() retries until it appears. NOTE: the placeholder is a
        // <tr>, so getRowCount() returns 1 on an empty list — callers should rely
        // on this method, not getRowCount()===0, to detect the empty state.
        try {
            await this.emptyState.waitFor({ state: 'visible', timeout: 8000 });
            return true;
        } catch {
            return false;
        }
    }

    /** 'Published' | 'Draft' | '' for the row matching a badge name. The status
     * cell renders `formatted_badge_status` ("Published" / "Draft"). */
    async statusOfRow(badgeName: string): Promise<string> {
        const row = this.rowByBadgeName(badgeName);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        // Read ONLY the Status column cell (td.column.badge_status). The badge
        // name and event columns can themselves contain the words "Published"/
        // "Draft" — e.g. the badge "ASB Products Published" — so a whole-row text
        // match would always report "Published" regardless of the real status.
        const statusCell = row.locator('td.column.badge_status, td.badge_status, td.column-badge_status').first();
        const text = ((await statusCell.innerText().catch(() => '')) || '').trim();
        if (/Published/i.test(text)) return 'Published';
        if (/Draft/i.test(text)) return 'Draft';
        return '';
    }

    // ---- Tabs / search ----
    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'attached', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        // The legacy Vue subsubsub re-renders continuously after a status flip
        // (the per-tab counts update), so a normal click never sees a "stable"
        // element and times out. The href link itself is positionally fixed, so
        // force the click (skips the actionability/stability wait).
        await tab.click({ force: true });
        await this.page.waitForTimeout(900); // route query change + refetch.
    }

    async search(query: string): Promise<void> {
        const input = this.searchBox;
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(query);
        await this.page.waitForTimeout(900); // debounced (300-500ms) search.
    }

    async clearSearch(): Promise<void> {
        const input = this.searchBox;
        if (await input.isVisible().catch(() => false)) {
            await input.fill('');
            await this.page.waitForTimeout(700);
        }
    }

    // ---- Navigation actions ----
    /** Click "+ Create Badge"; resolves on the create route. */
    async clickCreateBadge(): Promise<void> {
        await this.createBadgeLink.waitFor({ state: 'visible', timeout: 10000 });
        await this.createBadgeLink.click();
        await this.page.waitForURL(/#\/dokan-seller-badge\/new/, { timeout: 15000 }).catch(() => undefined);
    }

    // ---- Row actions (inline <a> links rendered by the row-actions slot) ----
    /** Click a row-action link for the badge's row, e.g. 'Edit', 'Publish Badge',
     * 'Set Badge As Draft', 'Delete'. The links are only revealed on row hover in
     * the WP list-table, so hover the row first. */
    async clickRowAction(badgeName: string, label: string): Promise<void> {
        const row = this.rowByBadgeName(badgeName);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        await row.scrollIntoViewIfNeeded().catch(() => undefined);
        await row.hover();
        const link = row.getByRole('link', { name: new RegExp(escapeRegExp(label), 'i') }).first();
        await link.waitFor({ state: 'visible', timeout: 10000 });
        await link.click();
    }

    /** Confirm a SweetAlert2 dialog by its confirm-button label, e.g.
     * 'Yes, Publish' / 'Yes, Draft' / 'Yes, Delete'. */
    async confirmSwal(confirmLabel: string): Promise<void> {
        const popup = this.page.locator(adminSellerBadgesSelectors.swalPopup).first();
        await popup.waitFor({ state: 'visible', timeout: 10000 });
        const btn = this.page
            .locator(adminSellerBadgesSelectors.swalConfirm)
            .filter({ hasText: new RegExp(escapeRegExp(confirmLabel), 'i') })
            .first();
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
    }

    /** Dismiss the SweetAlert2 success dialog ("...successfully.") that follows a
     * confirmed action, then wait for the list refetch. */
    async dismissSwalSuccess(): Promise<void> {
        // After confirming a status change, the action SweetAlert closes and a
        // SUCCESS SweetAlert (confirm button "OK") appears ONLY once the status
        // PUT has resolved. We MUST wait for it: the old non-waiting isVisible()
        // returned before the success modal showed, so the caller's goto()
        // navigated away mid-PUT and the status never persisted (e.g. "Set Badge
        // As Draft" silently no-op'd). Waiting for "OK" guarantees the PUT
        // completed before we return.
        const ok = this.page
            .locator(adminSellerBadgesSelectors.swalConfirm)
            .filter({ hasText: /^OK$/i })
            .first();
        try {
            await ok.waitFor({ state: 'visible', timeout: 12000 });
            await ok.click();
            await ok.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
        } catch {
            // Some flows show no success modal — dismiss any lingering confirm.
            const any = this.page.locator(adminSellerBadgesSelectors.swalConfirm).first();
            if (await any.isVisible().catch(() => false)) await any.click().catch(() => undefined);
        }
        await this.page.waitForTimeout(800); // fetchAllBadges refetch.
    }

    /** Cancel the SweetAlert2 dialog ('No, Cancel'). */
    async cancelSwal(): Promise<void> {
        const btn = this.page.locator(adminSellerBadgesSelectors.swalCancel).first();
        if (await btn.isVisible({ timeout: 8000 }).catch(() => false)) {
            await btn.click();
        }
        await this.page.waitForTimeout(400);
    }

    /** Publish a draft badge via the row action + SweetAlert2 confirm + success. */
    async publishBadge(badgeName: string): Promise<void> {
        await this.clickRowAction(badgeName, 'Publish Badge');
        await this.confirmSwal('Yes, Publish');
        await this.dismissSwalSuccess();
    }

    /** Move a published badge to draft via the row action + confirm + success. */
    async setBadgeAsDraft(badgeName: string): Promise<void> {
        await this.clickRowAction(badgeName, 'Set Badge As Draft');
        await this.confirmSwal('Yes, Draft');
        await this.dismissSwalSuccess();
    }

    /** Navigate to the Edit route for a badge via its row action. */
    async editBadge(badgeName: string): Promise<void> {
        await this.clickRowAction(badgeName, 'Edit');
        await this.page.waitForURL(/#\/dokan-seller-badge\/edit\/\d+/, { timeout: 15000 }).catch(() => undefined);
    }

    // ---- Bulk ----
    async selectRowsByBadgeName(badgeNames: string[]): Promise<void> {
        for (const name of badgeNames) {
            const cb = this.rowByBadgeName(name).locator(adminSellerBadgesSelectors.rowCheckbox).first();
            await cb.waitFor({ state: 'visible', timeout: 10000 });
            await cb.check();
        }
    }

    /** Run a bulk action: pick the action in the <select>, click Apply, then
     * confirm the SweetAlert2 dialog and dismiss the success dialog.
     * `actionKey` is the option value (e.g. 'publish' | 'draft' | 'delete'). */
    async bulkAction(actionKey: string, confirmLabel: string): Promise<void> {
        await this.bulkSelect.selectOption(actionKey);
        await this.bulkApply.click();
        await this.confirmSwal(confirmLabel);
        await this.dismissSwalSuccess();
    }

    // ---- Sort (asserts the REST query rather than fragile DOM order) ----
    /** Click the sortable "Badges Name" column header and capture the resulting
     * /seller-badge request URL. The Vue list pushes orderby/order into the route
     * query and refetches via dokan.api.get('/seller-badge/', { orderby, order }). */
    async sortByBadgeNameAndCaptureQuery(): Promise<string> {
        const header = this.columnHeader('Badges Name').locator('a');
        const target = (await header.count()) > 0 ? header.first() : this.columnHeader('Badges Name');
        const [req] = await Promise.all([this.page.waitForRequest(/\/dokan\/v1\/seller-badge/, { timeout: 15000 }), target.click()]);
        return req.url();
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Seller Badge UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const wrapperVisible = await this.pageWrapper.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !wrapperVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
