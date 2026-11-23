import { APIRequestContext, Locator, Page } from '@playwright/test';
import { toPath, SERVER_URL } from '@utils/helpers';
import { payloads } from '@utils/payloads';
import { confirmDataViewsAction, dismissDataViewsAction, waitForDataViewsSettle } from './adminDataViews';
import { actionMenuItemByName } from '@utils/dataViews';

// ============================================
// TEST DATA
// ============================================
// Customer-submitted PRODUCT abuse reports the admin #/abuse-reports DataView
// lists / filters / deletes. There is NO REST create route (RestController
// exposes only READABLE + DELETABLE), so the spec seeds the dependency chain
// (vendor -> product -> customer) via REST and DB-inserts each report row with
// dbUtils.createAbuseReport(). All seeded names use the "AABR" prefix.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Abuse reports).
export const adminAbuseReportsData = {
    // One reporting customer + one vendor store owning one reported product.
    vendor: { storeName: 'AABR Reported Store', userLogin: 'aabr_vendor', email: 'aabr_vendor@example.test' },
    customer: { username: 'aabr_customer', email: 'aabr_customer@example.test' },
    // Reasons must match a configured abuse reason (dokan_report_abuse option).
    // 'This content is spam' and 'Other' are defaults shipped by the module, so
    // no abuse-reasons option seeding is required for these.
    reasons: {
        spam: 'This content is spam',
        other: 'Other',
    },
    // A reason string guaranteed to match no configured reason, for the
    // empty-state edge.
    filterMiss: 'zzz_no_such_reason_zzz',
} as const;

// ============================================
// SELECTORS — verified against
// dokan-pro/modules/report-abuse/src/admin/dashboard/ReportAbusePage.tsx.
// The admin Abuse Reports page is the unified @dokan/components AdminDataViews
// list mounted on #dokan-admin-dashboard at
// admin.php?page=dokan-dashboard#/abuse-reports. Columns: Reason / Product /
// Vendor / Reported By / Reported At. Row actions: View + Delete. Bulk: Delete.
// ============================================
export const adminAbuseReportsSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    table: 'table',
    dataRow: 'table tbody tr',
    // DataViews header search — placeholder="Search" (SearchInput component).
    searchInput: 'input[placeholder="Search"]',
    // Per-row 3-dot actions trigger (scoped to a row by the caller).
    rowActionsBtn: "button[aria-label='Actions']",
    // The DataViews title-field selection checkbox carries the FULL untruncated
    // reason in its aria-label (the visible Reason cell is truncated to 22 chars
    // via truncate(item.reason, 22)). Anchor row lookups on this checkbox.
    rowCheckboxByReason: (reason: string) => `input[type="checkbox"][aria-label="${reason}"]`,
    // Header select-all checkbox (the reliable bulk-selection affordance).
    selectAllCheckbox: 'thead input[type="checkbox"]',
    // Empty state DataViews renders when no row matches.
    emptyState: 'text=/no data found|no items|no results|nothing to show|no report/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // The funnel toggle that opens the filter-field popover (AdminFilter).
    filterToggleButton: "button[title='Filter']",
    // REST endpoints.
    listEndpoint: `${SERVER_URL}/dokan/v1/abuse-reports`,
} as const;

// ============================================
// PAGE OBJECT — admin Abuse Reports list (Dokan Pro report-abuse module,
// 5.0.0+ React admin dashboard).
// Surface: wp-admin/admin.php?page=dokan-dashboard#/abuse-reports
// NOTE: admin-facing — the vendor announcement modal does NOT appear in
// wp-admin, so this page object deliberately does NOT register the
// closeAnnouncementModal handler (a generic role=dialog handler would race the
// Delete confirmation modal).
// ============================================
export class AdminAbuseReportsPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/abuse-reports');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminAbuseReportsSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminAbuseReportsSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminAbuseReportsSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminAbuseReportsSelectors.emptyState).first();
    }
    get heading(): Locator {
        return this.page.getByRole('heading', { name: 'Abuse Reports' }).first();
    }
    get filterToggle(): Locator {
        return this.page.locator(adminAbuseReportsSelectors.filterToggleButton).first();
    }

    /** A status tab — only "All" exists in this module. The count badge is not part of the accessible name. */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** A column header by visible label. */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** A list row, matched by the FULL (untruncated) reason carried on the
     * row's title-field selection checkbox aria-label. Robust against the
     * visible Reason cell being truncated to 22 chars. */
    rowByReason(reason: string): Locator {
        return this.rows.filter({ has: this.page.locator(adminAbuseReportsSelectors.rowCheckboxByReason(reason)) }).first();
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
            .locator(adminAbuseReportsSelectors.phpFatal)
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

    // ---- Search ----
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

    // ---- Row detail (View) ----
    /** Click the Reason cell of a row to open the detail (Product Abuse Report) modal. */
    async clickReasonCell(reason: string): Promise<void> {
        const cell = this.rowByReason(reason).locator('div.cursor-pointer').first();
        await cell.waitFor({ state: 'visible', timeout: 10000 });
        await cell.scrollIntoViewIfNeeded().catch(() => undefined);
        await cell.click();
    }

    get detailModalHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Product Abuse Report' }).first();
    }

    async isDetailModalVisible(): Promise<boolean> {
        return await this.detailModalHeading.isVisible({ timeout: 5000 }).catch(() => false);
    }

    /** The reason text rendered inside the detail modal's "Reason" block. */
    async getDetailModalReason(): Promise<string> {
        const dialog = this.page.getByRole('dialog').first();
        const block = dialog.locator("//h4[normalize-space()='Reason']/following-sibling::*").first();
        await block.waitFor({ state: 'visible', timeout: 10000 });
        return ((await block.textContent()) || '').trim();
    }

    /** Close the detail modal via its "Close" button. */
    async closeDetailModal(): Promise<void> {
        const btn = this.page.getByRole('button', { name: 'Close' }).first();
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        await btn.click();
        await this.detailModalHeading.waitFor({ state: 'hidden', timeout: 10000 });
    }

    // ---- Row actions (kebab menu) ----
    /** Open the 3-dot actions menu for the row matching a reason. */
    async openRowActionMenuFor(reason: string): Promise<void> {
        const row = this.rowByReason(reason);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminAbuseReportsSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    /** Click an item in the open actions menu, e.g. 'View' or 'Delete'. */
    async clickActionMenuItem(label: string): Promise<void> {
        const item = actionMenuItemByName(this.page, new RegExp(`^${escapeRegExp(label)}$`, 'i')).first();
        await item.waitFor({ state: 'visible', timeout: 10000 });
        await item.click();
    }

    /** Open the row menu and choose "View" to open the detail modal. */
    async viewReport(reason: string): Promise<void> {
        await this.openRowActionMenuFor(reason);
        await this.clickActionMenuItem('View');
        await this.detailModalHeading.waitFor({ state: 'visible', timeout: 10000 });
    }

    // ---- Delete (confirm modal) ----
    get deleteModalHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Delete Abuse Report' }).first();
    }

    /** The delete-confirmation modal's description copy (singular vs plural). */
    async getDeleteModalDescription(): Promise<string> {
        const dialog = this.page.getByRole('alertdialog').first();
        const desc = dialog.locator("//p[contains(., 'Are you sure you want to delete')]").first();
        await desc.waitFor({ state: 'visible', timeout: 10000 });
        return ((await desc.textContent()) || '').trim();
    }

    /** Confirm the delete modal (button text is "Delete"); waits for the
     * DELETE + list refetch to settle. */
    async confirmDelete(): Promise<void> {
        await confirmDataViewsAction(this.page);
        await this.deleteModalHeading.waitFor({ state: 'hidden', timeout: 15000 });
        await this.page.waitForTimeout(800); // list refetch + repaint.
    }

    /** Cancel the delete modal without deleting. */
    async cancelDelete(): Promise<void> {
        await dismissDataViewsAction(this.page);
        await this.deleteModalHeading.waitFor({ state: 'hidden', timeout: 10000 });
    }

    /** Open the row menu for a report, choose Delete, then confirm. */
    async deleteReport(reason: string): Promise<void> {
        await this.openRowActionMenuFor(reason);
        await this.clickActionMenuItem('Delete');
        await this.deleteModalHeading.waitFor({ state: 'visible', timeout: 10000 });
        await this.confirmDelete();
    }

    // ---- Bulk delete ----
    /** Select every current-page row via the header select-all checkbox (the
     * reliable selection affordance for this DataViews build). */
    async selectAllRows(): Promise<void> {
        const selectAll = this.page.locator(adminAbuseReportsSelectors.selectAllCheckbox).first();
        await selectAll.waitFor({ state: 'visible', timeout: 10000 });
        await selectAll.check();
    }

    /** After selecting rows, click the DIRECT bulk Delete button (compact
     * toolbar button, NOT a row kebab), then confirm the modal. */
    async bulkDeleteSelected(): Promise<void> {
        const bulkDelete = this.page.locator("button.components-button.is-compact:has-text('Delete')").first();
        await bulkDelete.waitFor({ state: 'visible', timeout: 10000 });
        await bulkDelete.click();
        await this.deleteModalHeading.waitFor({ state: 'visible', timeout: 10000 });
        await this.confirmDelete();
    }

    // ---- Filter (Reason) ----
    /** Open the funnel filter popover. Resolves once the "Reason" field option
     * has rendered, so callers can assert the offered filter fields. */
    async openFilterMenu(): Promise<void> {
        await this.filterToggle.click();
        await this.page.locator("//*[contains(@class,'components-popover')]//button[normalize-space()='Reason']").first().waitFor({ state: 'visible', timeout: 10000 });
    }

    /** True when a filter field option (by label) is offered in the funnel popover. */
    async isFilterFieldOffered(label: string): Promise<boolean> {
        return await this.page
            .locator(`//*[contains(@class,'components-popover')]//button[normalize-space()='${label}']`)
            .first()
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    // ---- REST (asserts the contract the UI relies on) ----
    /** GET /dokan/v1/abuse-reports as admin (Basic auth). Returns the raw
     * APIResponse so callers can read the X-Dokan-AbuseReports-Total header. */
    async restGetReports(request: APIRequestContext, params: Record<string, string> = {}) {
        const url = new URL(adminAbuseReportsSelectors.listEndpoint);
        for (const [k, v] of Object.entries(params)) {
            url.searchParams.set(k, v);
        }
        return await request.get(url.toString(), { headers: payloads.adminAuth });
    }

    /** Total report count from the X-Dokan-AbuseReports-Total response header. */
    async restGetTotal(request: APIRequestContext, params: Record<string, string> = {}): Promise<number> {
        const response = await this.restGetReports(request, params);
        return Number(response.headers()['x-dokan-abusereports-total'] ?? '0');
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Abuse Reports UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.heading.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
