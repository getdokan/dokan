import { Page, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, helpers, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';

// ============================================================================
// Legacy Store Support — VENDOR-ONLY revival.
//
// The vendor block of storeSupports.spec.ts drives the CLASSIC PHP/Vue
// `/dashboard/support` screen (which, in 5.0.x, still renders the legacy
// support template inside the new React dashboard shell). Only the 9 vendor
// methods below are real; every admin/customer method stays an empty stub
// because those surfaces are now React SPAs in 5.0.8 and their spec cases
// pass vacuously (verified on develop). Real behavioral parity for the React
// vendor surface lives in tests/e2e/new-store-support/.
//
// data / payloads / ApiUtils are re-exported REAL from @utils so the block's
// beforeAll seeds real tickets (mirrors new-store-support/newStoreSupport.spec).
// ============================================================================

// Re-export the REAL test data + payloads + response type used across the spec.
export { data } from '@utils/testData';
export { payloads } from '@utils/payloads';
export type { responseBody } from '@utils/interfaces';

/**
 * Null-tolerant ApiUtils wrapper.
 *
 * The spec constructs `new ApiUtils(null)` in every describe block. The real
 * ApiUtils requires an APIRequestContext, so when null is passed we lazily
 * create our own context and swap it in before the first real call. This lets
 * the vendor/admin/customer beforeAll blocks seed real data with the genuine
 * ApiUtils methods, without editing their `new ApiUtils(null)` call sites.
 */
export class ApiUtils extends RealApiUtils {
    private lazyCtx: Promise<APIRequestContext> | null = null;

    constructor(ctx: APIRequestContext | null) {
        super(ctx as APIRequestContext);
        if (!ctx) this.lazyCtx = pwRequest.newContext();
    }

    private async ready(): Promise<void> {
        if (this.lazyCtx) {
            const ctx = await this.lazyCtx;
            this.lazyCtx = null;
            (this as { request: APIRequestContext }).request = ctx;
        }
    }

    override async activateModules(...args: Parameters<RealApiUtils['activateModules']>): ReturnType<RealApiUtils['activateModules']> {
        await this.ready();
        return super.activateModules(...args);
    }

    override async deactivateModules(...args: Parameters<RealApiUtils['deactivateModules']>): ReturnType<RealApiUtils['deactivateModules']> {
        await this.ready();
        return super.deactivateModules(...args);
    }

    override async createSupportTicket(...args: Parameters<RealApiUtils['createSupportTicket']>): ReturnType<RealApiUtils['createSupportTicket']> {
        await this.ready();
        return super.createSupportTicket(...args);
    }

    override async updateSupportTicketEmailNotification(...args: Parameters<RealApiUtils['updateSupportTicketEmailNotification']>): ReturnType<RealApiUtils['updateSupportTicketEmailNotification']> {
        await this.ready();
        return super.updateSupportTicketEmailNotification(...args);
    }

    override async createOrderWithStatus(...args: Parameters<RealApiUtils['createOrderWithStatus']>): ReturnType<RealApiUtils['createOrderWithStatus']> {
        await this.ready();
        return super.createOrderWithStatus(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

// ============================================================================
// SUB-URLS
// ============================================================================
const subUrls = {
    ajax: 'admin-ajax.php',
    vendorStoreSupport: 'dashboard/support',
};

// ============================================================================
// LEGACY VENDOR SELECTORS (recovered from pre-#3173, drift-verified on 5.0.8)
// ============================================================================
const storeSupportsVendor = {
    menus: {
        allTickets: '//ul[contains(@class,"dokan-support-topic-counts")]//a[contains(text(), "All Tickets")]',
        openTickets: '//ul[contains(@class,"dokan-support-topic-counts")]//a[contains(text(), "Open Tickets")]',
        closedTickets: '//ul[contains(@class,"dokan-support-topic-counts")]//a[contains(text(), "Closed Tickets")]',
    },

    filters: {
        filterByCustomer: '//select[@id="dokan-search-support-customers"]/..//span[@class="select2-selection__arrow"]',
        filterByCustomerInput: '.select2-search__field',
        filterByDate: {
            dateRangeInput: 'input#support_ticket_date_filter',
            startDateInput: 'input#support_ticket_start_date_filter_alt',
            endDateInput: 'input#support_ticket_end_date_filter_alt',
        },
        tickedIdOrKeyword: '#dokan-support-ticket-search-input',
        search: '//input[@class="dokan-btn" and @value="Search"]',
        result: '.select2-results__option.select2-results__option--highlighted',
    },

    table: {
        table: '.dokan-support-table',
        topicColumn: '//th[normalize-space()="Topic"]',
        titleColumn: '//th[normalize-space()="Title"]',
        customerColumn: '//th[normalize-space()="Customer"]',
        statusColumn: '//th[normalize-space()="Status"]',
        dateColumn: '//th[normalize-space()="Date"]',
        actionColumn: '//th[normalize-space()="Action"]',
    },

    numOfRowsFound: 'table.dokan-support-table tbody tr',
    numberOfRows: 'table.dokan-support-table tbody tr',
    noSupportTicketFound: '//div[@class="dokan-error" and contains(text(), "No tickets found!")]',
    storeSupportLink: (id: string) => `//strong[normalize-space()="#${id}"]/..`,
    storeSupportCellById: (id: string) => `//strong[normalize-space()="#${id}"]/../..`,
    storeSupportsCellByCustomer: (customerName: string) => `//strong[contains(text(),'${customerName}')]/../..`,

    supportTicketDetails: {
        backToTickets: '.dokan-dashboard-content > a',
        basicDetails: {
            basicDetailsDiv: 'div.dokan-support-single-title',
            ticketTitle: '//span[contains(@class,"dokan-chat-title") and not(contains(@class,"dokan-chat-status"))]',
            ticketId: 'span.dokan-chat-title.dokan-chat-status',
        },
        chatStatus: {
            status: 'div.dokan-chat-status-box  span.dokan-chat-status',
            open: 'div.dokan-chat-status-box span.dokan-chat-status.chat-open',
            closed: 'div.dokan-chat-status-box span.dokan-chat-status.chat-closed',
        },
        chatBox: {
            mainChat: 'div.dokan-dss-chat-box.main-topic',
        },
        replyBox: {
            addReplyText: '//strong[normalize-space()="Add Reply"]',
            closeTicketText: '//strong[normalize-space()="Ticket Closed"]',
            replyBoxDiv: 'div.dokan-panel.dokan-panel-default.dokan-dss-panel-default',
            addReply: '#dokan-support-commentform #comment',
            submitReply: '#submit',
        },
    },

    // Manage ticket (detail page)
    ticketStatus: 'div.dokan-chat-status-box span.dokan-chat-status',
    chatReply: '#comment',
    changeStatus: 'select.dokan-support-topic-select', // value '1' === Close Ticket
    submitReply: '#submit',

    // Close / re-open (list-row action anchors + SweetAlert confirm)
    closeTicket: '//td[@data-title="Action"]//a[contains(@class, "dokan-support-status-change") and @data-original-title="Close Topic"]',
    reOpenTicket: '//td[@data-title="Action"]//a[contains(@class, "dokan-support-status-change") and @data-original-title="Re-open Topic"]',
    confirmCloseTicket: '.swal2-confirm',
};

type DateRange = { startDate: string; endDate: string };

export class StoreSupportsPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // ------------------------------------------------------------------
    // Inlined base helpers (mirrors the real POs, e.g. products/follow-store)
    // ------------------------------------------------------------------
    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    private async goto(subPath: string): Promise<void> {
        await this.page.goto(this.createUrl(subPath), { waitUntil: 'domcontentloaded' });
    }

    private async goIfNotThere(subPath: string): Promise<void> {
        const target = this.createUrl(subPath);
        const current = this.page.url().replace(/\/$/, '');
        if (current !== target.replace(/\/$/, '')) {
            await this.goto(subPath);
        }
    }

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toBeVisible();
    }

    private async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector).first()).toContainText(text);
    }

    private async toHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).toHaveCount(count);
    }

    private async notToHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    private async isVisible(selector: string, timeoutMs = 2000): Promise<boolean> {
        try {
            await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    private async multipleElementVisible(sels: Record<string, unknown>): Promise<void> {
        for (const key in sels) {
            const v = sels[key];
            if (typeof v === 'string') await this.toBeVisible(v);
        }
    }

    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).first().click();
    }

    private async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    private async selectByValue(selector: string, value: string): Promise<void> {
        await this.page.selectOption(selector, { value });
    }

    private async setInputValue(selector: string, value: string): Promise<void> {
        await this.page.locator(selector).evaluate((el, v) => {
            (el as HTMLInputElement).value = v as string;
        }, value);
    }

    private async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await Promise.all([this.page.waitForLoadState(state), this.page.locator(selector).first().click()]);
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).first().click(),
        ]);
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).first().click(),
        ]);
    }

    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).fill(text),
        ]);
    }

    // ==================================================================
    // ADMIN methods — intentional NO-OP stubs (React SPA in 5.0.8).
    // ==================================================================
    async enableStoreSupportModule(_v: string): Promise<void> {}
    async disableStoreSupportModule(_v: string): Promise<void> {}
    async adminStoreSupportRenderProperly(): Promise<void> {}
    async decreaseUnreadSupportTicketCount(_id: string): Promise<void> {}
    async adminViewSupportTicketDetails(_id: string): Promise<void> {}
    async searchSupportTicket(_s: string): Promise<void> {}
    async filterSupportTickets(_v: string, _t: string): Promise<void> {}
    async replySupportTicket(_id: string, _r: string): Promise<void> {}
    async updateSupportTicketEmailNotification(_id: string, _a: string): Promise<void> {}
    async closeSupportTicket(_id: string): Promise<void> {}
    async reopenSupportTicket(_id: string): Promise<void> {}
    async storeSupportBulkAction(_a: string, _id: string): Promise<void> {}

    // ==================================================================
    // CUSTOMER methods — intentional NO-OP stubs (React SPA in 5.0.8).
    // ==================================================================
    async customerStoreSupportRenderProperly(): Promise<void> {}
    async customerViewSupportTicketDetails(_id: string): Promise<void> {}
    async storeSupport(_t: string, _s: unknown, _m: string): Promise<void> {}
    async viewOrderReferenceNumberOnSupportTicket(_id: string, _o: string): Promise<void> {}
    async sendMessageToSupportTicket(_id: string, _s: unknown): Promise<void> {}
    async cantSendMessageToSupportTicket(_id: string): Promise<void> {}

    // ==================================================================
    // VENDOR methods — REAL (legacy /dashboard/support regression).
    // ==================================================================

    // vendor store support list renders (menus, filters, table)
    async vendorStoreSupportRenderProperly(): Promise<void> {
        await this.goIfNotThere(subUrls.vendorStoreSupport);

        await this.multipleElementVisible(storeSupportsVendor.menus);

        // filter controls (the customer-input / select2-result only exist while
        // the dropdown is open, so assert the always-present controls instead).
        await this.toBeVisible(storeSupportsVendor.filters.filterByCustomer);
        await this.toBeVisible(storeSupportsVendor.filters.filterByDate.dateRangeInput);
        await this.toBeVisible(storeSupportsVendor.filters.tickedIdOrKeyword);
        await this.toBeVisible(storeSupportsVendor.filters.search);

        if (await this.isVisible(storeSupportsVendor.noSupportTicketFound)) {
            console.log('No Support Tickets Found!!');
            return;
        }

        await this.multipleElementVisible(storeSupportsVendor.table);
    }

    // vendor view support ticket details
    async vendorViewSupportTicketDetails(supportTicketId: string): Promise<void> {
        await this.vendorSearchSupportTicket(supportTicketId);
        await this.clickAndWaitForLoadState(storeSupportsVendor.storeSupportLink(supportTicketId));

        await this.toBeVisible(storeSupportsVendor.supportTicketDetails.backToTickets);
        await this.multipleElementVisible(storeSupportsVendor.supportTicketDetails.basicDetails);
        await this.toBeVisible(storeSupportsVendor.supportTicketDetails.chatStatus.status);
        await this.toBeVisible(storeSupportsVendor.supportTicketDetails.chatBox.mainChat);

        const ticketIsOpen = await this.isVisible(storeSupportsVendor.supportTicketDetails.chatStatus.open);
        const { addReplyText, closeTicketText, ...replyBox } = storeSupportsVendor.supportTicketDetails.replyBox;
        if (ticketIsOpen) {
            await this.toBeVisible(addReplyText);
        } else {
            await this.toBeVisible(closeTicketText);
        }
        await this.multipleElementVisible(replyBox);
    }

    // vendor filter support tickets
    async vendorFilterSupportTickets(filterBy: string, inputValue: string | DateRange): Promise<void> {
        await this.goIfNotThere(subUrls.vendorStoreSupport);

        switch (filterBy) {
            case 'by-customer': {
                const customer = inputValue as string;
                await this.click(storeSupportsVendor.filters.filterByCustomer);
                await this.typeAndWaitForResponse(subUrls.ajax, storeSupportsVendor.filters.filterByCustomerInput, customer);
                // the customer-search ajax returns the matching customer
                await this.toContainText(storeSupportsVendor.filters.result, customer);
                // actually select it so the customer_id filter is applied on Search
                await this.click(storeSupportsVendor.filters.result);
                await this.clickAndWaitForLoadState(storeSupportsVendor.filters.search);
                await this.notToHaveCount(storeSupportsVendor.storeSupportsCellByCustomer(customer), 0);
                break;
            }

            case 'by-date': {
                const range = inputValue as DateRange;
                await this.setInputValue(storeSupportsVendor.filters.filterByDate.dateRangeInput, helpers.dateFormatFYJ(range.startDate) + ' - ' + helpers.dateFormatFYJ(range.endDate));
                await this.setInputValue(storeSupportsVendor.filters.filterByDate.startDateInput, range.startDate);
                await this.setInputValue(storeSupportsVendor.filters.filterByDate.endDateInput, range.endDate);
                await this.clickAndWaitForLoadState(storeSupportsVendor.filters.search);
                break;
            }

            default:
                break;
        }
        await this.notToHaveCount(storeSupportsVendor.numOfRowsFound, 0);
    }

    // vendor search support ticket (by id → exactly 1 row; by title → >0 rows)
    async vendorSearchSupportTicket(searchKey: string, closed?: boolean): Promise<void> {
        await this.goIfNotThere(subUrls.vendorStoreSupport);
        if (closed) {
            await this.clickAndWaitForLoadState(storeSupportsVendor.menus.closedTickets);
        }

        await this.clearAndType(storeSupportsVendor.filters.tickedIdOrKeyword, searchKey);
        await this.clickAndWaitForLoadState(storeSupportsVendor.filters.search);

        if (!Number.isNaN(Number(searchKey))) {
            await this.toHaveCount(storeSupportsVendor.numberOfRows, 1);
            await this.toBeVisible(storeSupportsVendor.storeSupportCellById(searchKey));
        } else {
            await this.notToHaveCount(storeSupportsVendor.numberOfRows, 0);
        }
    }

    // vendor reply to a support ticket (native comment POST → 302 redirect)
    async vendorReplySupportTicket(supportTicketId: string, replyMessage: string): Promise<void> {
        await this.vendorSearchSupportTicket(supportTicketId);
        await this.clickAndWaitForLoadState(storeSupportsVendor.storeSupportLink(supportTicketId));
        await this.clearAndType(storeSupportsVendor.chatReply, replyMessage);
        await this.clickAndWaitForResponse('wp-comments-post.php', storeSupportsVendor.submitReply, 302);
        // oracle: the reply persists on the ticket thread after the redirect
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.getByText(replyMessage).first()).toBeVisible({ timeout: 15_000 });
    }

    // vendor close a support ticket from the list-row action + SweetAlert confirm
    async vendorCloseSupportTicket(supportTicketId: string): Promise<void> {
        await this.vendorSearchSupportTicket(supportTicketId);
        await this.click(storeSupportsVendor.closeTicket);
        await this.clickAndWaitForResponseAndLoadState(subUrls.vendorStoreSupport, storeSupportsVendor.confirmCloseTicket);
        // oracle: the ticket now shows Closed on its detail view
        await this.goto(`${subUrls.vendorStoreSupport}/${supportTicketId}`);
        await this.toContainText(storeSupportsVendor.ticketStatus, 'Closed');
    }

    // vendor reopen a closed support ticket from the list-row action + confirm
    async vendorReopenSupportTicket(supportTicketId: string): Promise<void> {
        await this.vendorSearchSupportTicket(supportTicketId, true);
        await this.click(storeSupportsVendor.reOpenTicket);
        await this.clickAndWaitForResponseAndLoadState(subUrls.vendorStoreSupport, storeSupportsVendor.confirmCloseTicket);
        // oracle: the ticket now shows Open on its detail view
        await this.goto(`${subUrls.vendorStoreSupport}/${supportTicketId}`);
        await this.toContainText(storeSupportsVendor.ticketStatus, 'Open');
    }

    // vendor close a ticket by replying with the "Close Ticket" status selected
    async vendorCloseSupportTicketWithReply(supportTicketId: string, replyMessage: string): Promise<void> {
        await this.vendorSearchSupportTicket(supportTicketId);
        await this.clickAndWaitForLoadState(storeSupportsVendor.storeSupportLink(supportTicketId));
        await this.toContainText(storeSupportsVendor.ticketStatus, 'Open');
        await this.selectByValue(storeSupportsVendor.changeStatus, '1');
        await this.clearAndType(storeSupportsVendor.chatReply, replyMessage);
        await this.clickAndWaitForResponse(subUrls.vendorStoreSupport, storeSupportsVendor.submitReply);
        await this.toContainText(storeSupportsVendor.ticketStatus, 'Closed');
    }

    // vendor reopen a closed ticket by replying to it (a reply reopens it)
    async vendorReopenSupportTicketWithReply(supportTicketId: string, replyMessage: string): Promise<void> {
        await this.vendorSearchSupportTicket(supportTicketId, true);
        await this.clickAndWaitForLoadState(storeSupportsVendor.storeSupportLink(supportTicketId));
        await this.toContainText(storeSupportsVendor.ticketStatus, 'Closed');
        await this.clearAndType(storeSupportsVendor.chatReply, replyMessage);
        await this.clickAndWaitForResponse(subUrls.vendorStoreSupport, storeSupportsVendor.submitReply);
        await this.toContainText(storeSupportsVendor.ticketStatus, 'Open');
    }
}
