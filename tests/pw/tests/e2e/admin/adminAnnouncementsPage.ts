import { Locator, Page } from '@playwright/test';
import { toPath } from '@utils/helpers';
import { confirmDataViewsAction, waitForDataViewsSettle } from './adminDataViews';

// ============================================
// TEST DATA
// ============================================
// Announcements this folder seeds via REST (apiUtils.createAnnouncement) so the
// admin Announcement list is deterministic. This is an ADMIN-only spec: admins
// author/send announcements to vendors, so every precondition is created
// programmatically (REST), never by driving the vendor UI.
// See tests/pw/test-cases/admin-dashboard-seeding-strategy.md (§ Announcements).
//
// NOTE: prefix every seeded title with "AANN " so the suite stays namespaced and
// search-isolatable; the unique suffix keeps reruns from colliding.
export const adminAnnouncementsData = {
    // A read-only published announcement that list/search tests assert against.
    listed: { title: 'AANN Listed Announcement' },
    // A target the create test authors through the UI (kept distinct so the
    // create flow never collides with the seeded read-only fixture).
    createTarget: { title: 'AANN Create Target Announcement' },
    // A dedicated published target the trash + delete test owns end-to-end.
    deleteTarget: { title: 'AANN Delete Target Announcement' },
    // A vendor store the all_seller seeding needs (every announcement type, even
    // all_seller, requires >=1 vendor to materialise recipients).
    vendor: { storeName: 'AANN Recipient Store', userLogin: 'aann_recipient_vendor', email: 'aann_recipient_vendor@example.test' },
    // A search term guaranteed to match no announcement, for the empty-state edge.
    searchMiss: 'zzz_no_such_announcement_zzz',
} as const;

// ============================================
// SELECTORS — verified against
// dokan-pro/src/admin/announcements/components/AnnouncementList.tsx and
// AnnouncementDetail.tsx. The admin Announcement page is the unified
// @dokan/components AdminDataViews list mounted on #dokan-admin-dashboard at
// admin.php?page=dokan-dashboard#/announcement (HashRouter). Same DataViews
// surface as the admin Vendors list, so the row / search / tab / row-action
// selectors mirror tests/e2e/admin/adminVendorsPage.ts.
// ============================================
export const adminAnnouncementsSelectors = {
    reactRoot: '#dokan-admin-dashboard',
    table: 'table',
    dataRow: 'table tbody tr',
    // DataViews header search — placeholder="Search" (SearchInput component).
    // NOTE: AnnouncementList.tsx does NOT render this input (no search={true} and
    // no SearchInput in tabs.additionalComponents, unlike the Vendors page), so
    // this selector matches nothing on the live admin Announcement surface. The
    // page object's search() guards on isVisible() and falls back to row-by-title
    // matching. Kept here so a future product change that adds search Just Works.
    searchInput: 'input[placeholder="Search"]',
    // Per-row 3-dot actions trigger (scoped to tbody — the toolbar shares the label).
    rowActionsBtn: "button[aria-label='Actions']",
    // Empty state DataViews renders when no row matches.
    emptyState: 'text=/no data found|no items|no results|nothing to show|no announcement/i',
    // PHP fatal markers.
    phpFatal: 'text=/Fatal error|Parse error|There has been a critical error/i',
    // Create form — SimpleInput id="announcement-title".
    titleInput: '#announcement-title',
    // Login wall (wp_die / wp-login) shown to a non-admin hitting the page.
    loginForm: '#loginform, #user_login',
} as const;

// ============================================
// PAGE OBJECT — admin Announcements list (Dokan Pro 5.0.0+ React admin dashboard)
// Surface: wp-admin/admin.php?page=dokan-dashboard#/announcement
// NOTE: admin-facing — the vendor announcement modal does NOT appear in wp-admin,
// so this page object deliberately does NOT register the closeAnnouncementModal
// handler (a generic role=dialog handler would race the Trash/Delete confirm
// DokanModal).
// ============================================
export class AdminAnnouncementsPage {
    readonly page: Page;
    readonly url = toPath('wp-admin/admin.php?page=dokan-dashboard#/announcement');
    readonly createUrl = toPath('wp-admin/admin.php?page=dokan-dashboard#/announcement/create');

    constructor(page: Page) {
        this.page = page;
    }

    // ---- Locators ----
    get reactRoot(): Locator {
        return this.page.locator(adminAnnouncementsSelectors.reactRoot).first();
    }
    get rows(): Locator {
        return this.page.locator(adminAnnouncementsSelectors.dataRow);
    }
    get searchBox(): Locator {
        return this.page.locator(adminAnnouncementsSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(adminAnnouncementsSelectors.emptyState).first();
    }
    /** The list page heading ("Announcement"). Not an accessible heading role in
     * the source (a styled <div>), so match it as text. */
    get heading(): Locator {
        return this.page.getByText('Announcement', { exact: true }).first();
    }
    get addAnnouncementButton(): Locator {
        return this.page.getByRole('button', { name: /Add Announcement/i }).first();
    }
    get titleInput(): Locator {
        return this.page.locator(adminAnnouncementsSelectors.titleInput).first();
    }
    /** The create/update form's primary submit button. */
    get createButton(): Locator {
        return this.page.getByRole('button', { name: /Create Announcement/i }).first();
    }

    /** A status tab — All / Published / Pending / Scheduled / Draft / Trash. The
     * count badge is appended to the label text, so match on a substring RegExp. */
    tab(name: RegExp): Locator {
        return this.page.getByRole('tab', { name }).first();
    }

    /** A column header by visible label. */
    columnHeader(name: RegExp | string): Locator {
        return this.page.getByRole('columnheader', { name }).first();
    }

    /** A list row, matched by its Title cell text. Announcement rows have no
     * avatar; the Title cell renders the FULL title (RawHTML) when <= 72 chars,
     * so the seeded short titles match exactly. */
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

    async gotoCreate(): Promise<void> {
        await this.page.goto(this.createUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.reactRoot.waitFor({ state: 'visible', timeout: 30000 });
        await this.titleInput.waitFor({ state: 'visible', timeout: 30000 });
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
            .locator(adminAnnouncementsSelectors.phpFatal)
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

    /** True when a row whose Title cell contains `title` is present. */
    async hasRowWithTitle(title: string): Promise<boolean> {
        return (await this.rowByTitle(title).count()) > 0;
    }

    /** 'Published' | 'Pending' | 'Draft' | 'Scheduled' | 'Trash' | '' for the row matching a title. */
    async statusOfRow(title: string): Promise<string> {
        const row = this.rowByTitle(title);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const text = await row.innerText();
        for (const status of ['Published', 'Pending', 'Scheduled', 'Draft', 'Trash']) {
            if (new RegExp(status).test(text)) return status;
        }
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

    async search(query: string): Promise<void> {
        // The admin Announcement DataViews list does NOT render a search input.
        // Unlike the admin Vendors page (which injects <SearchInput> via
        // tabs.additionalComponents), AnnouncementList.tsx passes neither
        // search={true} nor a SearchInput, and fetchAnnouncements() never sends a
        // `search` query param — so no input[placeholder="Search"] exists on this
        // surface. When the box is present (future product change) we still use it;
        // otherwise we no-op and let row-by-title matching do the filtering against
        // the already-loaded first page (seeded rows sort newest-first).
        const input = this.searchBox;
        const hasSearch = await input.isVisible({ timeout: 2000 }).catch(() => false);
        if (!hasSearch) {
            void query;
            await this.waitForReady();
            return;
        }
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

    // ---- Create ----
    /** Click "Add Announcement"; resolves on the create route. */
    async clickAddAnnouncement(): Promise<void> {
        await this.addAnnouncementButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.addAnnouncementButton.click();
        await this.page.waitForURL(/#\/announcement\/create/, { timeout: 15000 }).catch(() => undefined);
    }

    /** Fill the create form (status defaults to Publish) and submit. Resolves
     * back on the list route. The default announcement_type is all_seller, so no
     * vendor selection is required. */
    async createAnnouncement(title: string, content = 'AANN body content for the announcement.'): Promise<void> {
        await this.titleInput.waitFor({ state: 'visible', timeout: 15000 });
        await this.titleInput.fill(title);
        // RichText body is optional for save; fill the title only to keep the
        // flow robust against the RTE iframe/contenteditable variability.
        void content;
        await this.createButton.click();
        await this.page.waitForURL(/#\/announcement(\?|$)/, { timeout: 20000 }).catch(() => undefined);
        await this.waitForReady();
    }

    /** Try to submit the create form with an empty title; returns the inline
     * error toast text shown by the form ("Please enter a title."). */
    async submitEmptyTitle(): Promise<Locator> {
        await this.titleInput.waitFor({ state: 'visible', timeout: 15000 });
        await this.titleInput.fill('');
        await this.createButton.click();
        return this.page.getByText(/Please enter a title/i).first();
    }

    // ---- Row actions ----
    /** Open the 3-dot actions menu for the row matching a title. */
    async openRowActionMenuFor(title: string): Promise<void> {
        const row = this.rowByTitle(title);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const btn = row.locator(adminAnnouncementsSelectors.rowActionsBtn).first();
        await btn.scrollIntoViewIfNeeded().catch(() => undefined);
        await btn.click();
    }

    /** Click an item in the open actions menu, e.g. 'Edit', 'Move to Trash',
     * 'Restore', 'Delete Permanently'. */
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

    /** Edit row action -> navigates to the detail/edit route #/announcement/:id. */
    async editAnnouncement(title: string): Promise<void> {
        await this.openRowActionMenuFor(title);
        await this.clickActionMenuItem('Edit');
        await this.page.waitForURL(/#\/announcement\/\d+/, { timeout: 15000 }).catch(() => undefined);
    }

    /** Move a (non-trash) announcement to Trash via its row action + confirm. */
    async trashAnnouncement(title: string): Promise<void> {
        await this.openRowActionMenuFor(title);
        await this.clickActionMenuItem('Move to Trash');
        await this.confirmModal('Confirm');
    }

    /** Permanently delete a trashed announcement via its row action + confirm.
     * Only eligible once the row is in the Trash tab (status === 'trash'). */
    async deletePermanently(title: string): Promise<void> {
        await this.openRowActionMenuFor(title);
        await this.clickActionMenuItem('Delete Permanently');
        await this.confirmModal('Delete');
    }

    /** Open the row item (click the title) to launch the read-only overview modal. */
    async openOverview(title: string): Promise<Locator> {
        await this.rowByTitle(title).getByText(title).first().click();
        return this.page.getByRole('dialog').first();
    }

    // ---- Bulk ----
    async selectRowsByTitle(titles: string[]): Promise<void> {
        for (const title of titles) {
            const cb = this.rowByTitle(title).locator('input[type="checkbox"]').first();
            await cb.waitFor({ state: 'visible', timeout: 10000 });
            await cb.check();
        }
    }

    // ---- Authorization (non-admin) ----
    /** True when the admin Announcement UI is NOT reachable for the current user. */
    async isAccessDenied(): Promise<boolean> {
        const rootVisible = await this.reactRoot.isVisible({ timeout: 5000 }).catch(() => false);
        const headingVisible = await this.addAnnouncementButton.isVisible({ timeout: 2000 }).catch(() => false);
        return !rootVisible && !headingVisible;
    }
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
