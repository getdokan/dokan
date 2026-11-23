import { Locator, Page } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import {
    REACT_ROOT,
    ROW_ACTIONS_BTN,
    SEARCH_INPUT,
    PHP_FATAL,
    DATA_ROW_ANY,
    DATA_ROW_SETTLED,
    SKELETON_ANY,
    actionMenuItem as dvActionMenuItem,
    statusTab as dvStatusTab,
    waitForRootReady as dvWaitForRootReady,
    hasNoPhpFatal as dvHasNoPhpFatal,
    parseTabCount,
    dataViewsConfirm,
    fillDataViewsSearch,
    clearDataViewsSearch,
} from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React "Admin Support" surface (Dokan Pro, module
// vendor_support). Surfaces:
//   /dashboard/new/#/vendor-support      → DataViews ticket list + status tabs
//                                          (dokan-pro/modules/vendor-support/src/
//                                           components/List.tsx, vendor context)
//   /dashboard/new/#/vendor-support/:id  → ticket thread + reply + status change
//                                          (.../components/Details.tsx)
// The SPA route title renders as an <h3> in the header ("Admin Support" on the
// list, "Admin Support Details" on the detail). Add-New-Ticket opens a DokanModal
// (NewTicket.tsx) whose body is a Quill editor. Status cells: a vendor-created
// open ticket shows "Pending" (last_reply_by === 'vendor'); "Active" once admin
// replies; "Closed" when closed. The Vendor column + Delete row-action are
// admin-only and MUST be absent in the vendor context. Reply/status use Quill +
// optimistic refetch, so behavioral oracles REST-gate the mutation / re-read REST.
// Self-contained per NEW_UI_HOUSE_STYLE.md §1 (shared DataViews primitives from @utils/dataViews).
// ============================================
export const newVendorSupportSelectors = {
    reactRoot: REACT_ROOT,

    // ---- List ----
    headerHeading: 'h3:has-text("Admin Support")',
    dataRow: DATA_ROW_ANY,
    settledRow: DATA_ROW_SETTLED,
    skeleton: SKELETON_ANY,
    columnHeader: 'table thead th, [role="columnheader"]',
    tab: dvStatusTab,
    tabAll: dvStatusTab('All'),
    tabActive: dvStatusTab('Active'),
    tabClosed: dvStatusTab('Closed'),
    searchInput: SEARCH_INPUT,
    // The Ticket Id cell renders `#<id>` as a clickable dokan-link button.
    ticketIdLink: 'button.dokan-link, a.dokan-link',
    rowActionsBtn: ROW_ACTIONS_BTN,
    actionMenuItem: dvActionMenuItem,
    emptyState: 'text=/no data found/i',
    successToast: 'div[role="status"]',
    addNewTicketButton: 'button:has-text("Add New Ticket")',

    // ---- New Ticket modal (NewTicket.tsx) ----
    modalTitle: 'text=/^Add New Ticket$/',
    subjectInput: '#dokan-add-new-support-ticket, input[name="dokan_add_new_support_ticket"]',
    quillEditor: '.ql-editor',
    submitButton: 'button:has-text("Submit")',
    cancelButton: 'button:has-text("Cancel")',

    // ---- Detail (Details.tsx) ----
    detailHeading: 'h2, h3', // "#<id> - <subject>" card heading (verified by prefix at runtime)
    replyButton: 'button:has-text("Reply")',
    changeStatusSelect: 'text=/Change Status/i',
    updateStatusButton: 'button:has-text("Update")',
    chatItem: '[class*="chat"], .dokan-support-chat-item, li',
    closeLogItem: 'text=/closed/i',
    openLogItem: 'text=/re-?opened|opened/i',
    backToListButton: 'button:has-text("Back to List"), a:has-text("Back to List")',

    phpFatal: PHP_FATAL,

    // REST endpoints (version-agnostic) used to gate on refetches / mutations.
    listRest: /dokan\/v[0-9]+\/vendor-support\/tickets(\?|$|&)/i,
    ticketMutateRest: /dokan\/v[0-9]+\/vendor-support\/tickets\/\d+(\?|$)/i,
    conversationsRest: /dokan\/v[0-9]+\/vendor-support\/tickets\/\d+\/conversations/i,
} as const;

export type SupportTab = 'all' | 'active' | 'closed';

// ============================================
// PAGE OBJECT — new React vendor "Admin Support" (Dokan Pro).
// ============================================
export class NewVendorSupportPage {
    readonly page: Page;
    readonly listUrl = toPath('dashboard/new/#/vendor-support');
    ticketUrl(id: string | number): string {
        return toPath(`dashboard/new/#/vendor-support/${id}`);
    }

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get headerHeading(): Locator {
        return this.page.locator(newVendorSupportSelectors.headerHeading).first();
    }
    get allTab(): Locator {
        return this.page.locator(newVendorSupportSelectors.tabAll).first();
    }
    get activeTab(): Locator {
        return this.page.locator(newVendorSupportSelectors.tabActive).first();
    }
    get closedTab(): Locator {
        return this.page.locator(newVendorSupportSelectors.tabClosed).first();
    }
    get columnHeaders(): Locator {
        return this.page.locator(newVendorSupportSelectors.columnHeader);
    }
    get settledRows(): Locator {
        return this.page.locator(newVendorSupportSelectors.settledRow);
    }
    get skeletons(): Locator {
        return this.page.locator(newVendorSupportSelectors.skeleton);
    }
    get addNewTicketButton(): Locator {
        return this.page.locator(newVendorSupportSelectors.addNewTicketButton).first();
    }
    get subjectInput(): Locator {
        return this.page.locator(newVendorSupportSelectors.subjectInput).first();
    }
    get quillEditor(): Locator {
        return this.page.locator(newVendorSupportSelectors.quillEditor).first();
    }
    get submitButton(): Locator {
        return this.page.locator(newVendorSupportSelectors.submitButton).first();
    }
    get replyButton(): Locator {
        return this.page.locator(newVendorSupportSelectors.replyButton).first();
    }
    get updateStatusButton(): Locator {
        return this.page.locator(newVendorSupportSelectors.updateStatusButton).first();
    }

    // ---- Navigation ----
    async gotoList(): Promise<void> {
        await this.page.goto(this.listUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await this.waitForSettle();
    }

    async gotoDetails(id: string | number): Promise<void> {
        await this.page.goto(this.ticketUrl(id));
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    /** Settle: skeleton gone AND (>=1 settled row OR empty state OR the tab strip). */
    async waitForSettle(timeoutMs = 15000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if ((await this.skeletons.count()) === 0) {
                if ((await this.settledRows.count()) > 0) return;
                if (
                    await this.page
                        .locator(newVendorSupportSelectors.emptyState)
                        .first()
                        .isVisible()
                        .catch(() => false)
                )
                    return;
                if (await this.allTab.isVisible().catch(() => false)) return;
            }
            await this.page.waitForTimeout(250);
        }
    }

    // ---- List reads ----
    async tabsVisible(): Promise<boolean> {
        for (const tab of [this.allTab, this.activeTab, this.closedTab]) {
            const ok = await tab
                .waitFor({ state: 'visible', timeout: 8000 })
                .then(() => true)
                .catch(() => false);
            if (!ok) return false;
        }
        return true;
    }

    async getTabCount(tab: SupportTab): Promise<number> {
        const locator = tab === 'all' ? this.allTab : tab === 'active' ? this.activeTab : this.closedTab;
        return parseTabCount(await locator.textContent().catch(() => ''));
    }

    async columnHeaderTexts(): Promise<string[]> {
        return (await this.columnHeaders.allInnerTexts()).map(t => t.trim());
    }

    rowsWithText(text: string): Locator {
        return this.page.locator(newVendorSupportSelectors.dataRow).filter({ hasText: text });
    }

    /** Click a status tab, gate on the list refetch, then settle. */
    async selectTab(tab: SupportTab): Promise<void> {
        const locator = tab === 'all' ? this.allTab : tab === 'active' ? this.activeTab : this.closedTab;
        await locator.waitFor({ state: 'visible', timeout: 15000 });
        const refetch = this.page.waitForResponse(r => newVendorSupportSelectors.listRest.test(r.url()) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await locator.click();
        await refetch;
        await this.waitForSettle();
    }

    async search(query: string): Promise<void> {
        const refetch = this.page.waitForResponse(r => newVendorSupportSelectors.listRest.test(r.url()) && decodeURIComponent(r.url()).includes(`search=${query}`) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await fillDataViewsSearch(this.page, query, { selector: newVendorSupportSelectors.searchInput, debounceMs: 800 });
        await refetch;
        await this.waitForSettle();
    }

    async clearSearch(): Promise<void> {
        await clearDataViewsSearch(this.page, { selector: newVendorSupportSelectors.searchInput, debounceMs: 600 });
    }

    /** Open a ticket's detail by clicking its #id link in the matching row. */
    async openTicketByText(text: string): Promise<void> {
        const row = this.rowsWithText(text).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const link = row.locator(newVendorSupportSelectors.ticketIdLink).first();
        await Promise.all([this.page.waitForURL(/#\/vendor-support\/\d+/, { timeout: 15000 }).catch(() => undefined), link.click()]);
        await this.page.waitForLoadState('domcontentloaded');
    }

    /** Which row-action menu items are visible for the first/only matching row. */
    async rowActionItems(text: string): Promise<{ view: boolean; close: boolean; del: boolean; markRead: boolean }> {
        const row = this.rowsWithText(text).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await row.locator("button[aria-label='Actions']").first().click();
        const check = async (label: string): Promise<boolean> =>
            this.page
                .locator(newVendorSupportSelectors.actionMenuItem(label))
                .first()
                .isVisible({ timeout: 2000 })
                .catch(() => false);
        const result = {
            view: await check('View'),
            close: await check('Close'),
            del: await check('Delete'),
            markRead: await check('Mark as read'),
        };
        await this.page.keyboard.press('Escape').catch(() => undefined);
        return result;
    }

    /** Close a ticket from its row action, confirming the destructive alertdialog. */
    async closeTicketFromRow(text: string): Promise<void> {
        const row = this.rowsWithText(text).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await row.locator("button[aria-label='Actions']").first().click();
        const closeItem = this.page.locator(newVendorSupportSelectors.actionMenuItem('Close')).first();
        await closeItem.waitFor({ state: 'visible', timeout: 8000 });
        await closeItem.click();
        // Destructive → alertdialog confirm ("Close" / "Cancel").
        const dialog = dataViewsConfirm(this.page);
        await dialog.waitFor({ state: 'visible', timeout: 8000 });
        const confirm = dialog
            .getByRole('button')
            .filter({ hasNotText: /^Cancel$/ })
            .last();
        await Promise.all([this.page.waitForResponse(r => newVendorSupportSelectors.ticketMutateRest.test(r.url()) && r.request().method() !== 'GET', { timeout: 15000 }).catch(() => undefined), confirm.click()]);
        await this.page.waitForTimeout(800);
        await this.waitForSettle();
    }

    // ---- New Ticket modal ----
    async openNewTicketModal(): Promise<void> {
        await this.addNewTicketButton.waitFor({ state: 'visible', timeout: 15000 });
        await this.addNewTicketButton.click();
        await this.subjectInput.waitFor({ state: 'visible', timeout: 10000 });
    }

    async createTicket(subject: string, message: string): Promise<void> {
        await this.openNewTicketModal();
        await this.subjectInput.fill(subject);
        await this.quillEditor.waitFor({ state: 'visible', timeout: 10000 });
        await this.quillEditor.click();
        await this.quillEditor.fill(message);
        await Promise.all([this.page.waitForResponse(r => newVendorSupportSelectors.listRest.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => undefined), this.submitButton.click()]);
        await this.page.waitForTimeout(800);
        await this.waitForSettle();
    }

    // ---- Detail actions ----
    /** Wait for the detail card to finish loading (the "#<id> - <subject>" heading). */
    async waitForDetailReady(timeoutMs = 20000): Promise<void> {
        await this.page
            .getByText(/^#\d+\s*-/)
            .first()
            .waitFor({ state: 'visible', timeout: timeoutMs });
    }

    async getDetailHeadingText(): Promise<string> {
        const heading = this.page.getByText(/^#\d+\s*-/).first();
        await heading.waitFor({ state: 'visible', timeout: 20000 });
        return (await heading.innerText()).trim();
    }

    /**
     * True when the given text is present in the ticket timeline. Waits for the
     * detail card to load first (the async ticket GET paints the timeline only
     * after it resolves — slow on the polluted DB), then polls the SPA root text.
     */
    async detailHasText(text: string): Promise<boolean> {
        await this.waitForDetailReady().catch(() => undefined);
        const root = this.page.locator(newVendorSupportSelectors.reactRoot).first();
        const start = Date.now();
        while (Date.now() - start < 12000) {
            const body = await root.innerText().catch(() => '');
            if (body.includes(text)) return true;
            await this.page.waitForTimeout(300);
        }
        return false;
    }

    async reply(message: string): Promise<void> {
        await this.quillEditor.waitFor({ state: 'visible', timeout: 15000 });
        await this.quillEditor.click();
        await this.quillEditor.fill(message);
        await Promise.all([this.page.waitForResponse(r => newVendorSupportSelectors.conversationsRest.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => undefined), this.replyButton.click()]);
        await this.page.waitForTimeout(800);
    }

    /** Change status via the detail SearchableSelect + Update. label: 'Active' | 'Close'. */
    async changeStatus(label: 'Active' | 'Close'): Promise<void> {
        const select = this.page.locator(newVendorSupportSelectors.changeStatusSelect).first();
        await select.click();
        const option = this.page
            .locator('.react-select__option, [role="option"]')
            .filter({ hasText: new RegExp(`^${label}$`, 'i') })
            .first();
        await option.waitFor({ state: 'visible', timeout: 8000 });
        await option.click();
        await Promise.all([this.page.waitForResponse(r => newVendorSupportSelectors.ticketMutateRest.test(r.url()) && (r.request().method() === 'POST' || r.request().method() === 'PUT'), { timeout: 20000 }).catch(() => undefined), this.updateStatusButton.click()]);
        await this.page.waitForTimeout(800);
    }
}
