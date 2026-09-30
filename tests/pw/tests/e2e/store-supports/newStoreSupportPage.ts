import { Locator, Page, expect } from '@playwright/test';
import { closeAnnouncementModal, toPath } from '@utils/helpers';
import {
    REACT_ROOT,
    ROW_ACTIONS_BTN,
    SEARCH_INPUT,
    PHP_FATAL,
    DATA_ROW_ANY,
    actionMenuItem as dvActionMenuItem,
    statusTab as dvStatusTab,
    waitForRootReady as dvWaitForRootReady,
    waitForListReady as dvWaitForListReady,
    hasNoPhpFatal as dvHasNoPhpFatal,
    rawRowCount,
    fillDataViewsSearch,
    clearDataViewsSearch,
    openFilterPanel as dvOpenFilterPanel,
    parseTabCount,
} from '@utils/dataViews';

// ============================================
// SELECTORS — the vendor React Store Support surface (Dokan Pro 5.0.0+).
// Surfaces:
//   /dashboard/new/#/support           → DataViews ticket list + status tabs
//                                         (dokan-pro/modules/store-support/src/js/
//                                          vendor-dashboard/components/TicketsList.tsx)
//   /dashboard/new/#/support/:ticketId → ticket thread + reply form
//                                         (.../components/Ticket/TicketDetails.tsx)
// The DataViews wrapper renders id="dokan-support-tickets-data-view" (kebab of the
// namespace prop) — a stable scoping id. Status tabs (All/Open/Closed) carry counts
// from GET /dokan/v1/vendor/support-tickets/stats. Reply is OPTIMISTIC: the UI appends
// the reply and flips status before the POST resolves, so behavioral oracles REST-gate
// the POST and/or reload before asserting persistence.
// Self-contained per NEW_UI_HOUSE_STYLE.md §1 (shared DataViews primitives from @utils/dataViews).
// ============================================
export const newStoreSupportSelectors = {
    reactRoot: REACT_ROOT,

    // ---- List (/support) ----
    // The DataViews container id (kebabCase of namespace="dokan-support-tickets-data-view").
    listContainer: '#dokan-support-tickets-data-view',
    dataRow: DATA_ROW_ANY,
    // Status tabs are role=tab buttons carrying a count, e.g. "Open (2)".
    tab: dvStatusTab,
    tabAll: dvStatusTab('All'),
    tabOpen: dvStatusTab('Open'),
    tabClosed: dvStatusTab('Closed'),
    searchInput: SEARCH_INPUT,
    // Topic cell renders `#<id>` as a clickable region; Title cell truncates at 22 chars.
    topicCell: '.topic-id-column',
    titleCell: '.title-column',
    customerCell: '.customer-column',
    statusCell: '.status-column',
    rowActionsBtn: ROW_ACTIONS_BTN,
    actionMenuItem: dvActionMenuItem,
    // Customer filter (AsyncSearchableSelect, min 3 chars, 500ms debounce).
    customerFilterInput: '#dokan-filter-by-customer input, input[placeholder="Search customer"]',
    emptyState: 'text=/no data found|no tickets|nothing to show/i',
    // Toast shown after a row-action status change.
    successToast: 'div[role="status"]',

    // ---- Details (/support/:id) ----
    detailTitle: 'h2.dokan-chat-title',
    detailIdChip: 'span.dokan-chat-status',
    detailBadge: '.dokan-support-single-title .dokan-badge, .dokan-chat-status ~ * .dokan-badge',
    orderReference: '.order-reference',
    mainTopic: '.dokan-dss-chat-box.main-topic',
    replyList: 'ul.dokan-support-commentlist',
    replyItem: 'li.dokan-support-comment-item',
    replyTextarea: '#dokan-support-reply-textarea',
    replyStatusSelect: 'select.dokan-support-topic-select',
    submitReplyButton: 'button:has-text("Submit Reply")',
    notFoundHeading: 'text=/Support Ticket Not Available/i',
    returnToTicketsButton: 'button:has-text("Return to Tickets"), a:has-text("Return to Tickets")',

    phpFatal: PHP_FATAL,

    // REST endpoints the surface fetches (used to gate on refetches).
    listRest: '/dokan/v1/vendor/support-tickets',
    statsRest: '/dokan/v1/vendor/support-tickets/stats',
    replyRest: /dokan\/v[0-9]+\/vendor\/support-tickets\/\d+\/replies/i,
    statusRest: /dokan\/v[0-9]+\/vendor\/support-tickets\/\d+\/status/i,
} as const;

export type SupportTab = 'all' | 'open' | 'closed';

// ============================================
// PAGE OBJECT — new React Store Support (Dokan 5.0.0+, Pro).
// Covers the ticket list DataViews route and the ticket details route.
// ============================================
export class NewStoreSupportPage {
    readonly page: Page;
    readonly listUrl = toPath('dashboard/new/#/support');
    detailUrl(id: string | number): string {
        return toPath(`dashboard/new/#/support/${id}`);
    }

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- Locators ----
    get allTab(): Locator {
        return this.page.locator(newStoreSupportSelectors.tabAll).first();
    }
    get openTab(): Locator {
        return this.page.locator(newStoreSupportSelectors.tabOpen).first();
    }
    get closedTab(): Locator {
        return this.page.locator(newStoreSupportSelectors.tabClosed).first();
    }
    get searchInput(): Locator {
        return this.page.locator(newStoreSupportSelectors.searchInput).first();
    }
    get emptyState(): Locator {
        return this.page.locator(newStoreSupportSelectors.emptyState).first();
    }
    get detailTitle(): Locator {
        return this.page.locator(newStoreSupportSelectors.detailTitle).first();
    }
    get replyList(): Locator {
        return this.page.locator(newStoreSupportSelectors.replyList).first();
    }
    get replyTextarea(): Locator {
        return this.page.locator(newStoreSupportSelectors.replyTextarea).first();
    }
    get submitReplyButton(): Locator {
        return this.page.locator(newStoreSupportSelectors.submitReplyButton).first();
    }
    get notFoundHeading(): Locator {
        return this.page.locator(newStoreSupportSelectors.notFoundHeading).first();
    }

    // ---- Navigation ----
    async gotoList(): Promise<void> {
        await this.page.goto(this.listUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
        await dvWaitForListReady(this.page, {
            rowSelector: newStoreSupportSelectors.dataRow,
            emptyState: newStoreSupportSelectors.emptyState,
            extraReady: () => this.openTab.isVisible(),
        });
    }

    async gotoDetails(id: string | number): Promise<void> {
        await this.page.goto(this.detailUrl(id));
        await this.page.waitForLoadState('domcontentloaded');
        await dvWaitForRootReady(this.page);
    }

    async hasNoPhpFatal(): Promise<boolean> {
        return await dvHasNoPhpFatal(this.page);
    }

    // ---- List reads ----
    async getRowCount(): Promise<number> {
        return await rawRowCount(this.page, newStoreSupportSelectors.dataRow);
    }

    async tabsVisible(): Promise<boolean> {
        for (const tab of [this.allTab, this.openTab, this.closedTab]) {
            const ok = await tab
                .waitFor({ state: 'visible', timeout: 8000 })
                .then(() => true)
                .catch(() => false);
            if (!ok) return false;
        }
        return true;
    }

    async getTabCount(tab: SupportTab): Promise<number> {
        const locator = tab === 'all' ? this.allTab : tab === 'open' ? this.openTab : this.closedTab;
        return parseTabCount(await locator.textContent().catch(() => ''));
    }

    /** Click a status tab and wait for the list GET carrying the matching status to settle. */
    async selectTab(tab: SupportTab): Promise<void> {
        const locator = tab === 'all' ? this.allTab : tab === 'open' ? this.openTab : this.closedTab;
        await locator.waitFor({ state: 'visible', timeout: 15000 });
        const refetch = this.page.waitForResponse(r => r.url().includes(newStoreSupportSelectors.listRest) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await locator.click();
        await refetch;
        await dvWaitForListReady(this.page, {
            rowSelector: newStoreSupportSelectors.dataRow,
            emptyState: newStoreSupportSelectors.emptyState,
            extraReady: () => this.openTab.isVisible(),
        });
    }

    /** Type a query and wait for the list GET carrying that search to return. */
    async search(query: string): Promise<void> {
        const refetch = this.page.waitForResponse(r => r.url().includes(newStoreSupportSelectors.listRest) && decodeURIComponent(r.url()).includes(`search=${query}`) && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        await fillDataViewsSearch(this.page, query, { selector: newStoreSupportSelectors.searchInput, debounceMs: 800 });
        await refetch;
    }

    async clearSearch(): Promise<void> {
        await clearDataViewsSearch(this.page, { selector: newStoreSupportSelectors.searchInput, debounceMs: 600 });
    }

    /** Rows whose visible text contains a marker (title / customer / #id). */
    rowsWithText(text: string): Locator {
        return this.page.locator(newStoreSupportSelectors.dataRow).filter({ hasText: text });
    }

    /** Open the filter panel and drive the Customer filter to a name (>=3 chars). */
    async filterByCustomer(name: string): Promise<void> {
        await dvOpenFilterPanel(this.page);
        // The Customer field may need selecting from an "Add Filter" popover; then a
        // react-select-style async input accepts >=3 chars and lists matches.
        const customerFieldBtn = this.page.getByRole('button', { name: /customer/i }).first();
        if (await customerFieldBtn.isVisible().catch(() => false)) {
            await customerFieldBtn.click().catch(() => undefined);
        }
        const refetch = this.page.waitForResponse(r => r.url().includes(newStoreSupportSelectors.listRest) && r.url().includes('customer_id=') && r.request().method() === 'GET', { timeout: 15000 }).catch(() => undefined);
        const input = this.page.locator(newStoreSupportSelectors.customerFilterInput).first();
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.fill(name.slice(0, Math.max(3, name.length)));
        const option = this.page.locator('.react-select__option, [role="option"]').filter({ hasText: name }).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        await option.click();
        await refetch;
        await dvWaitForListReady(this.page, {
            rowSelector: newStoreSupportSelectors.dataRow,
            emptyState: newStoreSupportSelectors.emptyState,
            extraReady: () => this.openTab.isVisible(),
        });
    }

    // ---- Row actions ----
    /** Change a ticket's status from its row action ("Close" | "Re-open"). Gates on POST /status. */
    async changeStatusFromRow(marker: string, action: 'Close' | 'Re-open'): Promise<void> {
        const row = this.rowsWithText(marker).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const actionsBtn = row.locator("button[aria-label='Actions']").first();
        await actionsBtn.click();
        const item = this.page.locator(newStoreSupportSelectors.actionMenuItem(action)).first();
        await item.waitFor({ state: 'visible', timeout: 8000 });
        await Promise.all([this.page.waitForResponse(r => newStoreSupportSelectors.statusRest.test(r.url()) && r.request().method() === 'POST', { timeout: 15000 }).catch(() => undefined), item.click()]);
        await this.page.waitForTimeout(800);
    }

    // ---- Details ----
    async getDetailTitleText(): Promise<string> {
        await this.detailTitle.waitFor({ state: 'visible', timeout: 15000 });
        return (await this.detailTitle.innerText()).trim();
    }

    async detailBadgeText(): Promise<string> {
        const badge = this.page.locator(newStoreSupportSelectors.detailBadge).first();
        return (await badge.textContent({ timeout: 8000 }).catch(() => '')) ?? '';
    }

    /** Submit a reply; optionally select "Close Ticket" first. Gates on the POST /replies. */
    async submitReply(message: string, closeTicket = false): Promise<void> {
        await this.replyTextarea.waitFor({ state: 'visible', timeout: 15000 });
        if (closeTicket) {
            const select = this.page.locator(newStoreSupportSelectors.replyStatusSelect).first();
            if (await select.isVisible().catch(() => false)) {
                await select.selectOption({ label: 'Close Ticket' }).catch(async () => {
                    await select.selectOption('1').catch(() => undefined);
                });
            }
        }
        await this.replyTextarea.fill(message);
        await Promise.all([this.page.waitForResponse(r => newStoreSupportSelectors.replyRest.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => undefined), this.submitReplyButton.click()]);
        await this.page.waitForTimeout(800);
    }

    /** Does the reply list contain the given text (after a reload, defeating optimistic UI)? */
    async replyListHasText(text: string): Promise<boolean> {
        return await this.replyList
            .locator(newStoreSupportSelectors.replyItem)
            .filter({ hasText: text })
            .first()
            .isVisible({ timeout: 8000 })
            .catch(() => false);
    }

    async assertOrderReference(orderId: string | number): Promise<void> {
        await expect(this.page.locator(newStoreSupportSelectors.orderReference), `order reference #${orderId} shown on ticket details`).toContainText(String(orderId), { timeout: 15000 });
    }
}
