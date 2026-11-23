import { APIRequestContext, Locator, Page } from '@playwright/test';
import { toPath, SERVER_URL } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { confirmDataViewsAction, dismissDataViewsAction, waitForDataViewsSettle } from './adminDataViews';
import { actionMenuItemByName } from '@utils/dataViews';

// ============================================
// TEST DATA
// ============================================
// Advertised products this folder seeds via REST so the admin Product
// Advertising list is deterministic. This is an ADMIN-only spec: every
// advertisement it lists / searches / expires is created programmatically
// (apiUtils.createProductAdvertisement creates a vendor product, then advertises
// it via POST /dokan/v1/product_adv/create) — it NEVER drives the vendor UI.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md.
//
// VERIFIED against modules/product-adv/src/admin/components/AdvertisementList.tsx
// (the Pro `AdvertisementList` component the admin route mounts at
// admin.php?page=dokan-dashboard#/product-advertising via the
// dokan-admin-dashboard-routes filter, path 'product-advertising'):
//   - Heading is an <h2> "Product Advertising".
//   - Tabs: All (status 0) / Active (status 1) / Expired (status 2) with counts.
//   - Columns: Product Name / Store Name / Created Via / Order ID / Cost /
//     Expires / Date / Status.
//   - A REAL SearchInput is mounted via tabs.additionalComponents (placeholder
//     "Search") — unlike most Pro DataViews pages, search WORKS here.
//   - Row actions: Expire (only when status === 1) + Delete, both via the kebab.
//   - "Add New" button opens the "Add New Advertisement" DokanModal.
export const adminProductAdvertisingData = {
    // A search term guaranteed to match no advertised product, for the
    // empty-state edge.
    searchMiss: 'zzz_no_such_advertisement_zzz',
} as const;

// ============================================
// SELECTORS — verified against
// modules/product-adv/src/admin/components/AdvertisementList.tsx. The admin
// Product Advertising page is the unified @dokan/components AdminDataViews list
// (namespace 'advertisement-admin-data-view') mounted on #dokan-admin-dashboard.
// ============================================
export const adminProductAdvertisingSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    table: 'table',
    dataRow: 'table tbody tr',
    // DataViews header search — placeholder="Search" (SearchInput component, added
    // to tabs.additionalComponents; this page DOES have a working search box).
    searchInput: 'input[placeholder="Search"]',
    // Per-row 3-dot actions trigger (scoped to a row by the caller).
    rowActionsBtn: "button[aria-label='Actions']",
    // Header select-all checkbox (the reliable bulk-selection affordance).
    selectAllCheckbox: 'thead input[type="checkbox"]',
    // Empty state DataViews renders when no row matches.
    emptyState: 'text=/no data found|no items|no results|nothing to show|no advertisement/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // REST endpoint the DataView fetches from.
    listEndpoint: `${SERVER_URL}/dokan/v1/product_adv`,
} as const;

// ============================================
// PAGE OBJECT — admin Product Advertising list (Dokan Pro product-adv module,
// 5.0.0+ React admin dashboard).
// Surface: wp-admin/admin.php?page=dokan-dashboard#/product-advertising
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// Expire/Delete/Add confirmation modals).
// ============================================
export class AdminProductAdvertisingPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/product-advertising');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminProductAdvertisingSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminProductAdvertisingSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminProductAdvertisingSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminProductAdvertisingSelectors.emptyState).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Product Advertising' }).first();
    }
    get addNewButton(): Locator {
        return this.page.getByRole('button', { name: /Add New/i }).first();
    }

    /** A status tab — All / Active / Expired. The count badge is part of the
     * rendered tab content, not a distinct accessible name, so match by label. */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** A column header by visible label. */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** A list row matched by the advertised product title (the titleField cell).
     * The seeded product titles are unique (faker nanoid suffix), so a row is
     * isolated by its text. */
    rowByProductTitle(title: string): Locator {
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
            .locator(adminProductAdvertisingSelectors.phpFatal)
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

    /** True when an advertisement with the given product title is in the list. */
    async isAdvertisementVisible(title: string): Promise<boolean> {
        return await this.rowByProductTitle(title)
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }

    /** Read the STATUS cell text ('Active' | 'Expired' | '') for a row, never the
     * whole row (product titles can contain status words). The Status field is
     * rendered as a pill <span>; it is the last data field column. */
    async statusOfRow(title: string): Promise<string> {
        const row = this.rowByProductTitle(title);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const pill = row.locator('span:has-text("Active"), span:has-text("Expired")').last();
        const text = ((await pill.textContent().catch(() => '')) || '').trim();
        if (/Active/.test(text)) return 'Active';
        if (/Expired/.test(text)) return 'Expired';
        return '';
    }

    // ---- Tabs / search ----
    async clickTab(name: RegExp): Promise<void> {
        const tab = this.tab(name);
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.scrollIntoViewIfNeeded().catch(() => undefined);
        await tab.click();
        await waitForDataViewsSettle(this.page);
    }

    /** This page has a REAL search box (mounted via additionalComponents), so the
     * search filters server-side. Fill it and wait for the debounced refetch. */
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
            await this.page.waitForTimeout(600);
        }
    }

    // ---- Add New (modal) ----
    get addModalHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Add New Advertisement' }).first();
    }

    /** Open the "Add New Advertisement" modal. */
    async openAddModal(): Promise<void> {
        await this.addNewButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.addNewButton.click();
        await this.addModalHeading.waitFor({ state: 'visible', timeout: 10000 });
    }

    async isAddModalVisible(): Promise<boolean> {
        return await this.addModalHeading.isVisible({ timeout: 5000 }).catch(() => false);
    }

    /** Close the Add modal via its Cancel/Close affordance. */
    async closeAddModal(): Promise<void> {
        const dialog = this.page.getByRole('dialog').first();
        const btn = dialog.getByRole('button', { name: /Cancel|Close/i }).first();
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
        await this.addModalHeading.waitFor({ state: 'hidden', timeout: 10000 });
    }

    // ---- Row actions (kebab menu) ----
    /** Open the 3-dot actions menu for the row matching a product title. */
    async openRowActionMenuFor(title: string): Promise<void> {
        const row = this.rowByProductTitle(title);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminProductAdvertisingSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    /** Click an item in the open actions menu, e.g. 'Expire' or 'Delete'. */
    async clickActionMenuItem(label: string): Promise<void> {
        const item = actionMenuItemByName(this.page, new RegExp(escapeRegExp(label), 'i')).first();
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
    }

    // ---- Expire / Delete (confirm modal) ----
    get expireModalHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Expire Advertisement' }).first();
    }
    get deleteModalHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Delete Advertisement' }).first();
    }

    /** Confirm the inline DataViews action (clicks the primary, non-Cancel button). */
    async confirmModal(confirmLabel: string): Promise<void> {
        void confirmLabel;
        await confirmDataViewsAction(this.page);
    }

    /** Open the row menu for an ACTIVE advertisement, choose Expire, confirm. */
    async expireAdvertisement(title: string): Promise<void> {
        await this.openRowActionMenuFor(title);
        await this.clickActionMenuItem('Expire');
        await this.expireModalHeading.waitFor({ state: 'visible', timeout: 10000 });
        await this.confirmModal('Yes, Expire');
    }

    /** Cancel the Expire confirmation modal without expiring. */
    async cancelExpire(): Promise<void> {
        await dismissDataViewsAction(this.page);
        await this.expireModalHeading.waitFor({ state: 'hidden', timeout: 10000 });
    }

    // ---- REST (asserts the contract the UI relies on) ----
    /** GET /dokan/v1/product_adv as admin (Basic auth). Returns the raw
     * APIResponse so callers can read the X-WP-Total / X-Status-* headers. */
    async restGetAdvertisements(request: APIRequestContext, params: Record<string, string> = {}) {
        const url = new URL(adminProductAdvertisingSelectors.listEndpoint);
        for (const [k, v] of Object.entries(params)) {
            url.searchParams.set(k, v);
        }
        return await request.get(url.toString(), { headers: payloads.adminAuth });
    }

    /** Total advertisement count from the X-WP-Total response header. */
    async restGetTotal(request: APIRequestContext, params: Record<string, string> = {}): Promise<number> {
        const response = await this.restGetAdvertisements(request, params);
        return Number(response.headers()['x-wp-total'] ?? '0');
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Product Advertising UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
