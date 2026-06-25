import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';
import { waitForDataViewsSettle } from './adminDataViews';

// ============================================
// TEST DATA
// ============================================
// Vendors this folder seeds via REST (apiUtils.createStore) plus a reverse-
// withdrawal balance minted directly through the create endpoint
// (POST dokan/v1/reverse-withdrawal/transactions, manage_options/admin-only).
// This is an ADMIN-only spec: every owing/credit balance is created
// programmatically, never by driving the vendor UI. All names are prefixed
// "ARW". See tests/pw/test-cases/admin-dashboard-seeding-strategy.md
// (§ Reverse withdrawal (admin)).
export const adminReverseWithdrawalData = {
    // Read-only fixture: owes a positive balance, asserted by the list / stat
    // tests; never mutated, so reads stay parallel-safe.
    owing: { storeName: 'ARW Owing Store', userLogin: 'arw_owing_vendor', email: 'arw_owing_vendor@example.test' },
    // Dedicated drill-down fixture: a vendor with a known debit transaction so
    // the per-store transactions page has rows.
    drilldown: { storeName: 'ARW Drilldown Store', userLogin: 'arw_drilldown_vendor', email: 'arw_drilldown_vendor@example.test' },
    // Vendor whose total credit exceeds total debit -> NEGATIVE balance, for the
    // parentheses-formatting edge in the drill-down.
    negative: { storeName: 'ARW Negative Store', userLogin: 'arw_negative_vendor', email: 'arw_negative_vendor@example.test' },
    // Vendor used by the Vendor filter test (must be distinct from `owing`).
    filterTarget: { storeName: 'ARW Filter Target Store', userLogin: 'arw_filter_target', email: 'arw_filter_target@example.test' },
    // Seed amounts (strings — the create endpoint expects string debit/credit).
    debitAmount: '150',
    creditAmount: '300',
    note: 'ARW seeded reverse withdrawal',
} as const;

// ============================================
// SELECTORS — verified against
// src/admin/dashboard/pages/reverse-withdrawal/index.tsx,
// ReverseWithdrawalTransaction.tsx and AddReverseWithdrawModal.tsx.
// Mounted as the unified @dokan/components AdminDataViews list on
// #dokan-admin-dashboard at admin.php?page=dokan-dashboard#/reverse-withdrawal.
// ============================================
export const adminReverseWithdrawalSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    table: 'table',
    dataRow: 'table tbody tr',
    // DataViews header search — placeholder="Search" (SearchInput component).
    searchInput: 'input[placeholder="Search"]',
    // The store cell is a clickable link/button (onClick -> navigate to drill-down).
    // No avatar <img>; the cell renders an initial-circle + the store_name span.
    // Empty state copy is the literal emptyTitle on both list and drill-down.
    emptyState: 'text=/No transaction found|no data found|no items|no results/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // Drill-down container id (ReverseWithdrawalTransaction.tsx root div).
    drilldownRoot: '#reverse-withdrawal-transactions',
} as const;

// ============================================
// PAGE OBJECT — admin Reverse Withdrawal (Dokan 5.0.0+ React admin dashboard)
// Routes (HashRouter): #/reverse-withdrawal (list) and
// #/reverse-withdrawal/store/:id (per-store transactions drill-down).
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// Add New confirmation modal).
// ============================================
export class AdminReverseWithdrawalPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/reverse-withdrawal');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminReverseWithdrawalSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminReverseWithdrawalSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminReverseWithdrawalSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminReverseWithdrawalSelectors.emptyState).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Reverse Withdrawal' }).first();
    }
    get addNewButton(): Locator {
        return this.page.getByRole('button', { name: /Add New/i }).first();
    }
    get backButton(): Locator {
        return this.page.getByRole('button', { name: /Back/i }).first();
    }
    get drilldownRoot(): Locator {
        return this.page.locator(adminReverseWithdrawalSelectors.drilldownRoot).first();
    }

    /** A stat card located by its label text (Total Collected / Remaining Balance / Total Transactions / Total Vendors / Store). */
    statCard(label: string): Locator {
        return this.page.getByText(label, { exact: true }).first();
    }

    /** A column header by visible label. */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** The store link cell in the list, matched by the FULL store name text.
     * The list renders store_name in a clickable span; cell text is not
     * truncated by an avatar img, so a text match on the full name is safe. */
    storeLink(name: string): Locator {
        return this.page.getByText(name, { exact: true }).first();
    }

    /** A list row that contains the given store name. */
    rowByStoreName(name: string): Locator {
        return this.rows.filter({ hasText: name }).first();
    }

    // ---- Navigation / readiness ----
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForReady();
        await waitForDataViewsSettle(this.page);
    }

    /** Deep-link / reload straight onto a per-store drill-down route. */
    async gotoStore(vendorId: string): Promise<void> {
        await this.page.goto(toPath(`wp-admin/admin.php?page=dokan-dashboard#/reverse-withdrawal/store/${vendorId}`));
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
        await waitForDataViewsSettle(this.page);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        const fatal = await this.page
            .locator(adminReverseWithdrawalSelectors.phpFatal)
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

    /** Full text of the row matching a store name (for amount / date assertions). */
    async rowTextFor(storeName: string): Promise<string> {
        const row = this.rowByStoreName(storeName);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        return await row.innerText();
    }

    // ---- Search ----
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

    // ---- Drill-down ----
    /** Click a store name in the list; resolves on the per-store drill-down route. */
    async openStoreDrilldown(storeName: string): Promise<void> {
        const link = this.storeLink(storeName);
        await link.waitFor({ state: 'visible', timeout: 10000 });
        await link.scrollIntoViewIfNeeded().catch(() => undefined);
        await link.click();
        await this.page.waitForURL(/#\/reverse-withdrawal\/store\/\d+/, { timeout: 15000 }).catch(() => undefined);
    }

    /** Click Back on the drill-down; resolves on the list route. */
    async clickBack(): Promise<void> {
        await this.backButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.backButton.click();
        await this.page.waitForURL(/#\/reverse-withdrawal$/, { timeout: 15000 }).catch(() => undefined);
    }

    // ---- Add New modal (DokanModal 'Add New Reverse Withdrawal') ----
    get modal(): Locator {
        return this.page.getByRole('dialog').filter({ hasText: 'Add New Reverse Withdrawal' }).first();
    }

    get modalTitle(): Locator {
        return this.page.getByText('Add New Reverse Withdrawal', { exact: false }).first();
    }

    /** The modal confirm button (DokanModal confirmButtonText='Add New'); scoped to the dialog. */
    get modalConfirmButton(): Locator {
        return this.modal.getByRole('button', { name: 'Add New', exact: true }).first();
    }

    get modalCancelButton(): Locator {
        return this.modal.getByRole('button', { name: /Cancel/i }).first();
    }

    /** Notes textarea inside the modal (matched by placeholder). */
    get modalNotesField(): Locator {
        return this.page.getByPlaceholder('Write reverse withdrawal note').first();
    }

    /** A transaction-type tab button (Product / Order / Other). */
    modalTypeTab(label: 'Product' | 'Order' | 'Other'): Locator {
        return this.modal.getByRole('button', { name: label, exact: true }).first();
    }

    async openAddModal(): Promise<void> {
        await this.addNewButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.addNewButton.click();
        await this.modalTitle.waitFor({ state: 'visible', timeout: 10000 });
    }

    async closeAddModalViaCancel(): Promise<void> {
        await this.modalCancelButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.modalCancelButton.click();
        await this.modalTitle.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => undefined);
    }

    /** True when the modal confirm button is disabled (validation gate). */
    async isModalConfirmDisabled(): Promise<boolean> {
        await this.modalConfirmButton.waitFor({ state: 'visible', timeout: 10000 });
        return await this.modalConfirmButton.isDisabled();
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Reverse Withdrawal UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}
