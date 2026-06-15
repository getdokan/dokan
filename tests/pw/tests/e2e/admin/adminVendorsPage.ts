import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';
import { confirmDataViewsAction, waitForDataViewsSettle } from './adminDataViews';

// ============================================
// TEST DATA
// ============================================
// Vendors this folder seeds via REST (apiUtils.createStore) so the admin
// Vendors list is deterministic. This is an ADMIN-only spec: the vendor state
// it asserts against is created programmatically, never by driving the vendor
// UI. See tests/pw/test-cases/admin-dashboard-seeding-strategy.md.
export const adminVendorsData = {
    // Read-only fixtures (never mutated by a UI test, so read assertions are
    // parallel-safe): `approved` stays enabled, `pending` stays disabled.
    approved: { storeName: 'AV Approved Store', userLogin: 'av_approved_vendor', email: 'av_approved_vendor@example.test' },
    pending: { storeName: 'AV Pending Store', userLogin: 'av_pending_vendor', email: 'av_pending_vendor@example.test' },
    // Dedicated mutation targets — each approve/disable test owns one vendor and
    // resets its status via API before acting, so tests never race each other.
    approveTarget: { storeName: 'AV Approve Target Store', userLogin: 'av_approve_target', email: 'av_approve_target@example.test' },
    disableTarget: { storeName: 'AV Disable Target Store', userLogin: 'av_disable_target', email: 'av_disable_target@example.test' },
    bulk: [
        { storeName: 'AV Bulk One Store', userLogin: 'av_bulk_one', email: 'av_bulk_one@example.test' },
        { storeName: 'AV Bulk Two Store', userLogin: 'av_bulk_two', email: 'av_bulk_two@example.test' },
    ],
    // A search term guaranteed to match no store, for the empty-state edge.
    searchMiss: 'zzz_no_such_vendor_zzz',
} as const;

// ============================================
// SELECTORS — verified against src/admin/dashboard/pages/vendors.tsx.
// The admin Vendors page is the unified @dokan/components AdminDataViews list
// mounted on #dokan-admin-dashboard at admin.php?page=dokan-dashboard#/vendors.
// Same DataViews surface as the vendor dashboard lists, so the row / search /
// row-action selectors mirror tests/e2e/new-products/newProductsPage.ts.
// ============================================
export const adminVendorsSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    table: 'table',
    dataRow: 'table tbody tr',
    // DataViews header search — placeholder="Search" (SearchInput component).
    searchInput: 'input[placeholder="Search"]',
    // Per-row 3-dot actions trigger (scoped to tbody — the toolbar shares the label).
    rowActionsBtn: "button[aria-label='Actions']",
    // Empty state DataViews renders when no row matches.
    emptyState: 'text=/no data found|no items|no results|nothing to show|no vendor/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // Non-admin permission wall (wp_die) when a vendor/customer hits the page.
    permissionDenied: 'text=/you are not allowed|do not have permission|cheatin/i',
    loginForm: '#loginform, #user_login',
} as const;

// ============================================
// PAGE OBJECT — admin Vendors list (Dokan 5.0.0+ React admin dashboard)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/vendors
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// Approve/Disable confirmation modal).
// ============================================
export class AdminVendorsPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/vendors');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminVendorsSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminVendorsSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminVendorsSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminVendorsSelectors.emptyState).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Vendors' }).first();
    }
    get addVendorButton(): Locator {
        return this.page.getByRole('button', { name: /Add Vendor/i }).first();
    }

    /** A status tab — All / Approved / Pending. The count badge is not part of the accessible name. */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** A column header by visible label. */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** A list row, matched by the vendor avatar's alt text (the FULL store name).
     * Robust against the visible cell text being truncated (e.g. the cell shows
     * "AV Approve Target Stor…" while the avatar img alt is the full name). */
    rowByStoreName(name: string): Locator {
        return this.rows.filter({ has: this.page.locator(`img[alt="${name}"]`) }).first();
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
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminVendorsSelectors.phpFatal)
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

    /** 'Enabled' | 'Disabled' | '' for the row matching a store name. */
    async statusOfRow(storeName: string): Promise<string> {
        const row = this.rowByStoreName(storeName);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const text = await row.innerText();
        if (/Enabled/.test(text)) return 'Enabled';
        if (/Disabled/.test(text)) return 'Disabled';
        return '';
    }

    // ---- Tabs / search ----
    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await this.page.waitForTimeout(800); // DataViews refetch + repaint.
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
    /** Click "Add Vendor"; resolves on the create route. */
    async clickAddVendor(): Promise<void> {
        await this.addVendorButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.addVendorButton.click();
        await this.page.waitForURL(/#\/vendors\/create/, { timeout: 15000 }).catch(() => undefined);
    }

    /** Click the vendor's UserCard (avatar) to open the detail route. */
    async openVendorDetail(storeName: string): Promise<void> {
        await this.rowByStoreName(storeName).locator(`img[alt="${storeName}"]`).click();
        await this.page.waitForURL(/#\/vendors\/\d+/, { timeout: 15000 }).catch(() => undefined);
    }

    // ---- Row actions ----
    /** Open the 3-dot actions menu for the row matching a store name. */
    async openRowActionMenuFor(storeName: string): Promise<void> {
        const row = this.rowByStoreName(storeName);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminVendorsSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    /** Click an item in the open actions menu, e.g. 'Edit', 'Approve Vendors', 'Disable Selling'. */
    async clickActionMenuItem(label: string): Promise<void> {
        const item = this.page.getByRole('menuitem', { name: new RegExp(escapeRegExp(label), 'i') }).first();
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
    }

    /** Confirm the Plugin UI DataViews inline action confirm (Approve / Disable).
     * The legacy `confirmLabel` (e.g. 'Yes, Approve' / 'Yes, Disable') is no longer
     * needed — we delegate to the shared helper that clicks the primary button. */
    async confirmModal(confirmLabel: string): Promise<void> {
        void confirmLabel;
        await confirmDataViewsAction(this.page);
    }

    /** Open the row menu for a pending vendor, choose Approve Vendors, confirm. */
    async approveVendor(storeName: string): Promise<void> {
        await this.openRowActionMenuFor(storeName);
        await this.clickActionMenuItem('Approve Vendors');
        await this.confirmModal('Yes, Approve');
    }

    /** Open the row menu for an enabled vendor, choose Disable Selling, confirm. */
    async disableVendor(storeName: string): Promise<void> {
        await this.openRowActionMenuFor(storeName);
        await this.clickActionMenuItem('Disable Selling');
        await this.confirmModal('Yes, Disable');
    }

    /** Navigate to the Edit route for a vendor via its row action. */
    async editVendor(storeName: string): Promise<void> {
        await this.openRowActionMenuFor(storeName);
        await this.clickActionMenuItem('Edit');
        await this.page.waitForURL(/#\/vendors\/edit\/\d+/, { timeout: 15000 }).catch(() => undefined);
    }

    // ---- Bulk ----
    async selectRowsByStoreName(storeNames: string[]): Promise<void> {
        for (const name of storeNames) {
            const cb = this.rowByStoreName(name).locator('input[type="checkbox"]').first();
            await cb.waitFor({ state: 'visible', timeout: 10000 });
            await cb.check();
        }
    }

    /** Run a bulk action. Selecting rows reveals a selection toolbar with a
     * DIRECT action button (e.g. "Approve Vendors" / "Disable Selling"), not a
     * row kebab; clicking it opens the same confirm modal. */
    async bulkAction(actionLabel: string, confirmLabel: string): Promise<void> {
        const action = this.page.getByRole('button', { name: new RegExp(escapeRegExp(actionLabel), 'i') }).first();
        await action.waitFor({ state: 'visible', timeout: 10000 });
        await action.click();
        await this.confirmModal(confirmLabel);
    }

    // ---- Sort (asserts the REST query rather than fragile DOM order) ----
    /** Open the Registered column's sort menu and choose "Sort ascending" (the
     * default is descending), which fires the /stores refetch. The DataViews
     * column-header button opens a popover menu of `menuitemradio` sort options
     * rather than toggling the sort directly. */
    async sortByRegisteredAndCaptureQuery(): Promise<string> {
        await this.page.getByRole('button', { name: 'Registered' }).first().click();
        const sortAsc = this.page.getByRole('menuitemradio', { name: 'Sort ascending' });
        await sortAsc.waitFor({ state: 'visible', timeout: 10000 });
        const [req] = await Promise.all([this.page.waitForRequest(/\/dokan\/v1\/stores/, { timeout: 15000 }), sortAsc.click()]);
        return req.url();
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Vendors UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
