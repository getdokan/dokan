import { APIRequestContext, Locator, Page } from '@playwright/test';
import { toPath, SERVER_URL } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { confirmDataViewsAction, waitForDataViewsSettle } from './adminDataViews';
import { actionMenuItemByName } from '@utils/dataViews';

// ============================================
// TEST DATA
// ============================================
// A single wholesale customer this spec seeds via REST so the admin Wholesale
// Customer list is deterministic. This is an ADMIN-only spec: the precondition
// (a WooCommerce customer registered as a wholesale customer) is created
// programmatically — apiUtils.getCustomerId-first then apiUtils.createCustomer
// with a FIXED username/email (so it is idempotent across runs), then
// apiUtils.createWholesaleCustomer(customerId) (POST /dokan/v1/wholesale/register).
// The spec never drives the storefront / vendor / my-account UI.
//
// The "AWC" prefix is exclusive to this spec's fixtures, so its row is uniquely
// findable on page 1 and the email/username search returns exactly it.
export const adminWholesaleCustomerData = {
    // The reused wholesale customer (fixed identifiers -> idempotent re-runs).
    customer: {
        username: 'awc_wholesale_customer',
        email: 'awc_wholesale_customer@example.test',
        firstName: 'AWC',
        lastName: 'Wholesale',
    },
    // Status values as the REST layer / DataViews status cell render them.
    status: {
        active: 'Active',
        deactive: 'Deactive',
    },
    // A search term guaranteed to match no wholesale customer, for the
    // empty-state edge.
    searchMiss: 'zzz_no_such_wholesale_customer_zzz',
} as const;

// ============================================
// SELECTORS — verified against
// dokan-pro/modules/wholesale/assets/src/js/admin/components/List.tsx (the Pro
// `WholesaleCustomerList` component the admin route mounts at
// admin.php?page=dokan-dashboard#/wholesale-customer via the
// dokan-admin-dashboard-routes filter, id/path 'wholesale-customer').
// It is the unified @dokan/components AdminDataViews list (namespace
// 'wholesale-customer-admin-data-view'). UNLIKE most Pro admin DataViews pages,
// this one DOES inject a real <SearchInput> (tabs.additionalComponents) AND
// passes search={true}, so the placeholder="Search" box renders and filters.
// Columns: Customer Name / Email / Username / Registered / Status.
// Tabs: All / Active / Deactive (with header-driven counts).
// Row actions: Edit / See Orders / Remove / Activate (eligible when deactive) /
// Deactivate (eligible when active). Confirm modals: DokanModal.
// ============================================
export const adminWholesaleCustomerSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    table: 'table',
    dataRow: 'table tbody tr',
    // DataViews header search — placeholder="Search" (SearchInput component).
    searchInput: 'input[placeholder="Search"]',
    // Per-row 3-dot actions trigger (scoped to a row by the caller).
    rowActionsBtn: "button[aria-label='Actions']",
    // Empty state DataViews renders when no row matches.
    emptyState: 'text=/no data found|no items|no results|nothing to show|no customer/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // REST endpoints.
    listEndpoint: `${SERVER_URL}/dokan/v1/wholesale/customers`,
} as const;

// ============================================
// PAGE OBJECT — admin Wholesale Customer list (Dokan Pro 5.0.0+ React admin
// dashboard). Surface: wp-admin/admin.php?page=dokan-dashboard#/wholesale-customer
// NOTE: admin-facing — the vendor announcement modal does NOT appear in wp-admin,
// so this page object deliberately does NOT register the closeAnnouncementModal
// handler (a generic role=dialog handler would race the activate/deactivate
// confirmation modals).
// ============================================
export class AdminWholesaleCustomerPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/wholesale-customer');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminWholesaleCustomerSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminWholesaleCustomerSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminWholesaleCustomerSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminWholesaleCustomerSelectors.emptyState).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Wholesale Customer' }).first();
    }

    /** A status tab — All / Active / Deactive. The count badge is rendered inside
     * the tab, so match on a prefix RegExp (e.g. /^Active/). */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** A column header by visible label (Customer Name / Email / Username / Registered / Status). */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** A list row matched by a substring (email or username are unique per seeded
     * customer, so either isolates exactly one row). */
    rowByText(text: string): Locator {
        return this.rows.filter({ hasText: text }).first();
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
            .locator(adminWholesaleCustomerSelectors.phpFatal)
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

    /** True when a customer row containing the given text (email/username) is in the list. */
    async isCustomerVisible(text: string): Promise<boolean> {
        return await this.rowByText(text)
            .waitFor({ state: 'visible', timeout: 8000 })
            .then(() => true)
            .catch(() => false);
    }

    /** Read the STATUS cell text for a row (matched by email/username). The status
     * pill is the last data cell — read it specifically, never the whole row, so a
     * name/username containing a status word can't false-match. */
    async getRowStatus(text: string): Promise<string> {
        const row = this.rowByText(text);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        // The Status field renders a single <span> pill; it is the only cell whose
        // text is exactly "Active"/"Deactive".
        const pill = row.locator('span', { hasText: /^(Active|Deactive)$/ }).first();
        await pill.waitFor({ state: 'visible', timeout: 10000 });
        return ((await pill.textContent()) || '').trim();
    }

    // ---- Tabs / search ----
    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await waitForDataViewsSettle(this.page);
    }

    /** Type into the (real) search box and wait for the debounced refetch. The
     * Wholesale Customer page DOES render a SearchInput, so this actually filters. */
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

    // ---- Row actions (kebab menu) ----
    /** Open the 3-dot actions menu for the row matching email/username. */
    async openRowActionMenuFor(text: string): Promise<void> {
        const row = this.rowByText(text);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminWholesaleCustomerSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    /** Click an item in the open actions menu, e.g. 'Activate', 'Deactivate', 'Remove', 'Edit'. */
    async clickActionMenuItem(label: string): Promise<void> {
        const item = actionMenuItemByName(this.page, new RegExp(escapeRegExp(label), 'i')).first();
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
    }

    /** True if a given row action is offered for the row (eligibility is status-gated:
     * Activate shows only for a deactive row, Deactivate only for an active row). */
    async isActionOffered(text: string, label: string): Promise<boolean> {
        await this.openRowActionMenuFor(text);
        // Anchor the label: "Activate" is a substring of "Deactivate", so an
        // unanchored regex would falsely report Activate as offered on an active row.
        const item = actionMenuItemByName(this.page, new RegExp('^' + escapeRegExp(label) + '$', 'i')).first();
        const offered = await item
            .waitFor({ state: 'visible', timeout: 5000 })
            .then(() => true)
            .catch(() => false);
        // Close the menu so the next interaction starts clean.
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return offered;
    }

    /** Confirm the inline DataViews action (clicks the primary, non-Cancel button). */
    async confirmModal(confirmLabel?: string): Promise<void> {
        void confirmLabel;
        await confirmDataViewsAction(this.page);
    }

    /** Open the row menu for a deactive customer, choose Activate, confirm. */
    async activateCustomer(text: string): Promise<void> {
        await this.openRowActionMenuFor(text);
        await this.clickActionMenuItem('Activate');
        await this.confirmModal('Activate');
    }

    /** Open the row menu for an active customer, choose Deactivate, confirm. */
    async deactivateCustomer(text: string): Promise<void> {
        await this.openRowActionMenuFor(text);
        await this.clickActionMenuItem('Deactivate');
        await this.confirmModal('Deactivate');
    }

    // ---- REST (asserts the contract the UI relies on) ----
    /** GET /dokan/v1/wholesale/customers as admin (Basic auth). Returns the raw
     * APIResponse so callers can read the X-WP-Total / X-Status-* headers. */
    async restGetCustomers(request: APIRequestContext, params: Record<string, string> = {}) {
        const url = new URL(adminWholesaleCustomerSelectors.listEndpoint);
        for (const [k, v] of Object.entries(params)) {
            url.searchParams.set(k, v);
        }
        return await request.get(url.toString(), { headers: payloads.adminAuth });
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Wholesale Customer UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
