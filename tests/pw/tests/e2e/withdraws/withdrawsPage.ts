import { Page, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, helpers, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';

// ============================================================================
// Legacy Withdraws — de-stubbed port of the pre-refactor page object
// (git e2ec507de:tests/pw/pages/withdrawsPage.ts) into the CURRENT
// self-contained architecture.
//
// The legacy `withdraws.spec.ts` describe block is `.skip`-ped (its classic
// PHP/Vue admin + vendor withdraw surfaces were rewritten as React SPAs in
// 5.0.0; live parity lives in tests/e2e/withdraws/newWithdraw*.spec.ts). This
// file exists to satisfy the spec's import contract with REAL wiring and to
// preserve the exact legacy flow/assertions, converted from the old @pages
// base-class helpers to raw Playwright.
//
// data / payloads / ApiUtils are re-exported REAL from @utils so the block's
// beforeAll seeds genuine balances/orders/withdraws.
// ============================================================================

const { DOKAN_PRO } = process.env;

// Re-export the REAL test data + payloads used across the spec.
export { data };
export { payloads } from '@utils/payloads';

/**
 * Null-tolerant ApiUtils wrapper.
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context
 * and swap it in before the first real call — letting the beforeAll block seed
 * real data with the genuine ApiUtils methods, without editing the
 * `new ApiUtils(null)` call site.
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

    override async getMinimumWithdrawLimit(...args: Parameters<RealApiUtils['getMinimumWithdrawLimit']>): ReturnType<RealApiUtils['getMinimumWithdrawLimit']> {
        await this.ready();
        return super.getMinimumWithdrawLimit(...args);
    }

    override async createOrderWithStatus(...args: Parameters<RealApiUtils['createOrderWithStatus']>): ReturnType<RealApiUtils['createOrderWithStatus']> {
        await this.ready();
        return super.createOrderWithStatus(...args);
    }

    override async createWithdraw(...args: Parameters<RealApiUtils['createWithdraw']>): ReturnType<RealApiUtils['createWithdraw']> {
        await this.ready();
        return super.createWithdraw(...args);
    }

    override async cancelWithdraw(...args: Parameters<RealApiUtils['cancelWithdraw']>): ReturnType<RealApiUtils['cancelWithdraw']> {
        await this.ready();
        return super.cancelWithdraw(...args);
    }

    override async dispose(): Promise<void> {
        await this.ready();
        await super.dispose();
    }
}

// ============================================================================
// ADMIN WITHDRAW SELECTORS (recovered from pre-refactor selectors.ts →
// selector.admin.dokan.withdraw)
// ============================================================================
const withdrawsAdmin = {
    withdrawText: '.withdraw-requests h1',

    // Nav Tabs
    navTabs: {
        pending: '//ul[@class="subsubsub"]//li//a[contains(text(),"Pending")]',
        approved: '//ul[@class="subsubsub"]//li//a[contains(text(),"Approved")]',
        cancelled: '//ul[@class="subsubsub"]//li//a[contains(text(),"Cancelled")]',
        tabByStatus: (status: string) => `//ul[@class="subsubsub"]//li//a[contains(text(),"${status}")]`,
    },

    // Bulk Actions
    bulkActions: {
        selectAll: 'thead .manage-column input',
        selectAction: '.tablenav.top #bulk-action-selector-top', // approved, cancelled, delete, paypal
        applyAction: '.tablenav.top .button.action',
    },

    // Filters
    filters: {
        filterByVendor: '//span[@id="select2-filter-vendors-container"]/..//span[@class="select2-selection__arrow"]',
        filterByPaymentMethods: '//span[@id="select2-filter-payment-methods-container"]/..//span[@class="select2-selection__arrow"]',
        filterInput: '.select2-search.select2-search--dropdown .select2-search__field',
        clearFilter: 'a#clear-all-filtering',
        result: 'li.select2-results__option.select2-results__option--highlighted',
        filteredResult: (storeName: string) => `//li[contains(text(), "${storeName}") and @class="select2-results__option select2-results__option--highlighted"]`,
    },

    // Logs
    exportWithdraws: 'a#export-all-logs',

    // Table
    table: {
        withdrawTable: '.wp-list-table',
        vendorColumn: 'thead th.seller',
        amountColumn: 'thead th.amount',
        statusColumn: 'thead th.status',
        methodColumn: 'thead th.method_title',
        detailsColumn: 'thead th.method_details',
        noteColumn: 'thead th.note',
        dateColumn: 'thead th.created',
        actionsColumn: 'thead th.actions',
    },

    statusColumnValue: (status: string) => `td.column.status .${status}`, // pending, approved, rejected, cancelled

    numberOfRowsFound: '.tablenav.top .displaying-num',
    numberOfRows: 'div.withdraw-requests table tbody tr',
    noRowsFound: '//td[normalize-space()="No requests found."]',
    withdrawCell: (storeName: string) => `//td//a[contains(text(), '${storeName}')]/../..`,
    withdrawDelete: (storeName: string) => `//td//a[contains(text(), '${storeName}')]/../..//span[@class="trash"]//a`,
    withdrawCancel: (storeName: string) => `//td//a[contains(text(), '${storeName}')]/../..//span[@class="cancel"]//a`,
    withdrawApprove: (storeName: string) => `//td//a[contains(text(), '${storeName}')]/../../..//button[@title='Approve Request']`,
    withdrawAddNote: (storeName: string) => `//td//a[contains(text(), '${storeName}')]/../../..//button[@title='Add Note']`,
    withdrawNoteModalClose: '.dokan-modal-content .modal-header button',
    addNote: '.dokan-modal-content .modal-body textarea',
    updateNote: '.dokan-modal-content .modal-footer button',
};

// ============================================================================
// VENDOR WITHDRAW SELECTORS (recovered from pre-refactor selectors.ts →
// selector.vendor.vWithdraw)
// ============================================================================
const withdrawsVendor = {
    withdrawText: '.dokan-dashboard-content.dokan-withdraw-content h1',

    // balance
    balance: {
        balanceDiv: '//strong[normalize-space()="Balance"]/../..',
        balancePro: '//p[contains(text(),"Your Balance:")]//a//span[@class="woocommerce-Price-amount amount"]',
        balanceLite: '//p[contains(text(),"Your Balance:")]//strong[1]',
        minimumWithdrawAmount: '//p[contains(text(),"Your Balance:")]//strong[2]',
    },

    // payment details
    paymentDetails: {
        manual: {
            paymentDetailsDiv: '//strong[normalize-space()="Payment Details"]/../..',
            lastPaymentSection: '//strong[normalize-space()="Last Payment"]/..',
        },
        schedule: {
            ScheduleSection: '//input[@id="dokan-schedule-enabler-switch"]/../../..',
        },
    },

    // withdraw payment methods
    withdrawPaymentMethods: {
        paymentMethodsDiv: '#dokan-withdraw-payment-method-list',
        paymentMethods: '#dokan-withdraw-payment-method-list .dokan-panel-inner-container',
        makeMethodDefault: (methodName: string) => `//div[@id='dokan-withdraw-payment-method-list']//strong[contains( text(), '${methodName}')]/../..//button[contains(@class, 'dokan-btn')]`,
        setupMethod: (methodName: string) => `//strong[contains( text(), '${methodName}')]/../..//a[@class='dokan-btn']`,
        defaultMethod: (methodName: string) => `//div[@id='dokan-withdraw-payment-method-list']//strong[contains( text(), '${methodName}')]/../..//button[contains(@class, 'dokan-btn-default')]`,
        defaultPaymentMethodUpdateSuccessMessage: 'Default method update successful.',
    },

    // view payments
    viewPayments: {
        viewPayments: '#dokan-withdraw-display-requests-button',

        menus: {
            pendingRequests: '//ul[contains(@class,"subsubsub")]//a[contains(text(), "Pending Requests")]',
            approvedRequests: '//ul[contains(@class,"subsubsub")]//a[contains(text(), "Approved Requests")]',
            cancelledRequests: '//ul[contains(@class,"subsubsub")]//a[contains(text(), "Cancelled Requests")]',
        },

        requestWithdraw: '#dokan-request-withdraw-button',
        withdrawDashboard: '.dokan-add-product-link a',

        table: {
            withdrawTable: '.dokan-table.dokan-table-striped',
            amountColumn: '//th[normalize-space()="Amount"]',
            methodColumn: '//th[normalize-space()="Method"]',
            dateColumn: '//th[normalize-space()="Date"]',
            cancelColumn: '//th[normalize-space()="Cancel"]',
            statusColumn: '//th[normalize-space()="Status"]',
        },

        noRowsFound: '//td[normalize-space()="No pending withdraw request"]',
    },

    // Manual Withdraw Request
    manualWithdrawRequest: {
        requestWithdraw: '#dokan-request-withdraw-button',
        closeModal: '.iziModal-button-close',
        withdrawAmount: '#withdraw-amount',
        withdrawMethod: '#withdraw-method',
        submitRequest: '#dokan-withdraw-request-submit',
        withdrawRequestSaveSuccessMessage: '//div[@id="swal2-html-container" and normalize-space()="Withdraw request successful."]',
        pendingRequestDiv: '//strong[normalize-space(text())="Pending Requests"]/..',
        cancelWithdrawRequestSuccess: '.dokan-alert.dokan-alert-success',
        cancelWithdrawRequestSaveSuccessMessage: 'Your request has been cancelled successfully!',
        cancelRequest: '//strong[normalize-space()="Pending Requests"]/..//a[normalize-space()="Cancel"]',
        pendingRequest: '//strong[normalize-space()="Pending Requests"]',
        pendingRequestAlert: '.dokan-alert.dokan-alert-danger',
        pendingRequestAlertMessage: 'You already have pending withdraw request(s). Please submit your request after approval or cancellation of your previous request.',
    },

    // Auto withdraw Disbursement Schedule
    autoWithdrawDisbursement: {
        enableSchedule: '//input[@id="dokan-schedule-enabler-switch"]/..',
        editSchedule: '#dokan-withdraw-display-schedule-popup',
        closeModal: '.mfp-close',
        preferredPaymentMethod: '#preferred-payment-method',
        preferredSchedule: (schedule: string) => `#withdraw-schedule-${schedule}\\>`,
        onlyWhenBalanceIs: '#minimum-withdraw-amount',
        maintainAReserveBalance: '#withdraw-remaining-amount',
        changeSchedule: '#dokan-withdraw-schedule-request-submit',
        scheduleMessage: '//div[@class="dokan-switch-container"]/..//p',
        dokanBottomPopup: '#swal2-html-container',
        withdrawScheduleSaveSuccessMessage: 'Withdraw schedule changed successfully.',
    },
};

export class WithdrawsPage {
    constructor(readonly page: Page) {
        void closeAnnouncementModal(page);
    }

    // ------------------------------------------------------------------
    // Inlined base helpers (converted from the old @pages base classes to
    // raw Playwright — semantics preserved from basePage.ts @ e2ec507de).
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

    private async reload(): Promise<void> {
        await this.page.reload();
    }

    private async click(selector: string): Promise<void> {
        await this.page.locator(selector).click();
    }

    private async hover(selector: string): Promise<void> {
        await this.page.locator(selector).hover();
    }

    private async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    private async selectByValue(selector: string, value: string): Promise<void> {
        await this.page.selectOption(selector, { value });
    }

    private async isVisible(selector: string, timeoutMs = 2000): Promise<boolean> {
        try {
            await this.page.locator(selector).waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    private async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    private async notToContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector)).not.toContainText(text);
    }

    private async notToHaveText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveText(text);
    }

    private async notToHaveCount(selector: string, count: number): Promise<void> {
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    private async multipleElementVisible(selectors: { [key: string]: unknown }): Promise<void> {
        for (const key in selectors) {
            const value = selectors[key];
            if (helpers.isPlainObject(value)) {
                await this.multipleElementVisible(value as { [key: string]: unknown });
            } else if (typeof value === 'function') {
                continue;
            } else {
                await this.toBeVisible(value as string);
            }
        }
    }

    private async toPass(fn: () => Promise<void>): Promise<void> {
        await expect(async () => {
            await fn();
        }).toPass();
    }

    private async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await Promise.all([this.page.waitForLoadState(state), this.page.locator(selector).click()]);
    }

    private async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
    }

    private async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<void> {
        const [, response] = await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        expect(response.status()).toBe(code);
    }

    private async clickAndAcceptAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<void> {
        // page.once so future dialogs aren't auto-accepted
        this.page.once('dialog', dialog => {
            void dialog.accept();
        });
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
    }

    private async clickAndWaitForDownload(selector: string): Promise<void> {
        await Promise.all([this.page.waitForEvent('download'), this.page.locator(selector).click()]);
    }

    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).fill(text),
        ]);
    }

    private async pressAndWaitForResponse(subUrl: string, key: string, code = 200): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.keyboard.press(key),
        ]);
    }

    // Enable a Dokan vendor-dashboard toggle switch (blue == on) if it's currently off.
    private async enableSwitcherVendorDashboard(selector: string): Promise<void> {
        const spanSelector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.page.locator(spanSelector).evaluate(el => window.getComputedStyle(el).getPropertyValue('background-color'));
        if (!value.includes('rgb(33, 150, 243)')) {
            await this.click(spanSelector);
        }
    }

    // ==================================================================
    // ADMIN methods (classic wp-admin withdraw list-table)
    // ==================================================================

    // admin withdraws render properly
    async adminWithdrawsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.withdraw);

        // withdraw text is visible
        await this.toBeVisible(withdrawsAdmin.withdrawText);

        // navTab elements are visible
        const { tabByStatus, ...navTabs } = withdrawsAdmin.navTabs;
        await this.multipleElementVisible(navTabs);

        // bulk action elements are visible
        await this.multipleElementVisible(withdrawsAdmin.bulkActions);

        // filter elements are visible
        const { filterInput, clearFilter, result, filteredResult, ...filters } = withdrawsAdmin.filters;
        await this.multipleElementVisible(filters);

        // withdraw table elements are visible
        await this.multipleElementVisible(withdrawsAdmin.table);
    }

    // filter withdraws
    async filterWithdraws(input: string, action: string): Promise<void> {
        await this.goto(data.subUrls.backend.dokan.withdraw);

        switch (action) {
            case 'by-status': {
                await this.clickAndWaitForLoadState(withdrawsAdmin.navTabs.tabByStatus(input));
                return;
            }

            case 'by-vendor':
                await this.click(withdrawsAdmin.filters.filterByVendor);
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, withdrawsAdmin.filters.filterInput, input);
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, withdrawsAdmin.filters.filteredResult(input));
                break;

            case 'by-payment-method':
                // add toPass to remove flakiness
                await this.toPass(async () => {
                    await this.reload(); // todo: need to resolve this
                    await this.click(withdrawsAdmin.filters.filterByPaymentMethods);
                    await this.clearAndType(withdrawsAdmin.filters.filterInput, input);
                    await this.toContainText(withdrawsAdmin.filters.result, input);
                });
                await this.pressAndWaitForResponse(data.subUrls.api.dokan.withdraws, data.key.enter);
                break;

            default:
                break;
        }
        await this.notToHaveText(withdrawsAdmin.numberOfRowsFound, '0 items');
        await this.notToBeVisible(withdrawsAdmin.noRowsFound);

        // clear filter
        await this.click(withdrawsAdmin.filters.clearFilter);
    }

    // export withdraws
    async exportWithdraws(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.withdraw);
        await this.clickAndWaitForDownload(withdrawsAdmin.exportWithdraws);
    }

    // add note to withdraw request
    async addNoteWithdrawRequest(vendorName: string, note: string): Promise<void> {
        await this.filterWithdraws(vendorName, 'by-vendor');

        await this.click(withdrawsAdmin.withdrawAddNote(vendorName));
        await this.clearAndType(withdrawsAdmin.addNote, note);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, withdrawsAdmin.updateNote);
    }

    // update withdraw request
    async updateWithdrawRequest(vendorName: string, action: string): Promise<void> {
        await this.filterWithdraws(vendorName, 'by-vendor');

        switch (action) {
            case 'approve':
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, withdrawsAdmin.withdrawApprove(vendorName));
                break;

            case 'cancel':
                await this.hover(withdrawsAdmin.withdrawCell(vendorName));
                await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, withdrawsAdmin.withdrawCancel(vendorName));
                break;

            case 'delete':
                await this.hover(withdrawsAdmin.withdrawCell(vendorName));
                await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.withdraws, withdrawsAdmin.withdrawDelete(vendorName));
                break;

            default:
                break;
        }
        await this.notToBeVisible(withdrawsAdmin.withdrawCell(vendorName));
    }

    // withdraw bulk action
    async withdrawBulkAction(action: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.withdraw);

        // ensure row exists
        await this.notToBeVisible(withdrawsAdmin.noRowsFound);

        await this.click(withdrawsAdmin.bulkActions.selectAll);
        await this.selectByValue(withdrawsAdmin.bulkActions.selectAction, action);
        await this.clickAndWaitForResponse(data.subUrls.api.dokan.withdraws, withdrawsAdmin.bulkActions.applyAction);
    }

    // ==================================================================
    // VENDOR methods (classic /dashboard/withdraw)
    // ==================================================================

    // vendor withdraw render properly
    async vendorWithdrawRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);

        // withdraw text is visible
        await this.toBeVisible(withdrawsVendor.withdrawText);

        // balance elements are visible
        const { balanceLite, balancePro, ...balance } = withdrawsVendor.balance;
        await this.multipleElementVisible(balance);
        if (DOKAN_PRO) {
            await this.toBeVisible(balancePro);
        } else {
            await this.toBeVisible(balanceLite);
        }

        // request withdraw is visible
        await this.toBeVisible(withdrawsVendor.manualWithdrawRequest.requestWithdraw);

        // payment details manual elements are visible
        await this.multipleElementVisible(withdrawsVendor.paymentDetails.manual);

        // view payments is visible
        await this.toBeVisible(withdrawsVendor.viewPayments.viewPayments);

        if (DOKAN_PRO) {
            // payment details schedule elements are visible
            await this.multipleElementVisible(withdrawsVendor.paymentDetails.schedule);

            // enable & edit schedule is visible
            await this.toBeVisible(withdrawsVendor.autoWithdrawDisbursement.enableSchedule);
            await this.toBeVisible(withdrawsVendor.autoWithdrawDisbursement.editSchedule);
        }

        // withdraw payment methods div elements are visible
        await this.toBeVisible(withdrawsVendor.withdrawPaymentMethods.paymentMethodsDiv);

        await this.notToHaveCount(withdrawsVendor.withdrawPaymentMethods.paymentMethods, 0);
    }

    // vendor withdraw requests render properly
    async vendorWithdrawRequestsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdrawRequests);

        // withdraw requests menus are visible
        await this.multipleElementVisible(withdrawsVendor.viewPayments.menus);

        // request withdraw button is visible
        await this.toBeVisible(withdrawsVendor.viewPayments.requestWithdraw);

        // withdraw dashboard button is visible
        await this.toBeVisible(withdrawsVendor.viewPayments.withdrawDashboard);

        // withdraw requests table elements are visible
        await this.multipleElementVisible(withdrawsVendor.viewPayments.table);
    }

    // vendor request withdraw
    async requestWithdraw(withdraw: any): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
        if (helpers.price(withdraw.currentBalance) > helpers.price(withdraw.minimumWithdrawAmount)) {
            await this.click(withdrawsVendor.manualWithdrawRequest.requestWithdraw);
            await this.clearAndType(withdrawsVendor.manualWithdrawRequest.withdrawAmount, String(withdraw.minimumWithdrawAmount));
            await this.selectByValue(withdrawsVendor.manualWithdrawRequest.withdrawMethod, withdraw.withdrawMethod.default);
            await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, withdrawsVendor.manualWithdrawRequest.submitRequest);
            await this.toBeVisible(withdrawsVendor.manualWithdrawRequest.withdrawRequestSaveSuccessMessage);
            await this.toBeVisible(withdrawsVendor.manualWithdrawRequest.pendingRequestDiv);
        } else {
            throw new Error('Current balance is less than minimum withdraw amount');
        }
    }

    // vendor can't request withdraw when pending request exists
    async cantRequestWithdraw(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
        await this.click(withdrawsVendor.manualWithdrawRequest.requestWithdraw);
        await this.toContainText(withdrawsVendor.manualWithdrawRequest.pendingRequestAlert, withdrawsVendor.manualWithdrawRequest.pendingRequestAlertMessage);
        await this.click(withdrawsVendor.manualWithdrawRequest.closeModal);
    }

    // vendor cancel withdraw request
    async cancelWithdrawRequest(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.frontend.vDashboard.withdrawRequests, withdrawsVendor.manualWithdrawRequest.cancelRequest, 302);
        await this.toContainText(withdrawsVendor.manualWithdrawRequest.cancelWithdrawRequestSuccess, withdrawsVendor.manualWithdrawRequest.cancelWithdrawRequestSaveSuccessMessage);
    }

    // vendor add auto withdraw disbursement schedule
    async addAutoWithdrawDisbursementSchedule(withdraw: any): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
        await this.enableSwitcherVendorDashboard(withdrawsVendor.autoWithdrawDisbursement.enableSchedule);
        await this.click(withdrawsVendor.autoWithdrawDisbursement.editSchedule);
        await this.selectByValue(withdrawsVendor.autoWithdrawDisbursement.preferredPaymentMethod, withdraw.preferredPaymentMethod);
        await this.click(withdrawsVendor.autoWithdrawDisbursement.preferredSchedule(withdraw.preferredSchedule));
        await this.selectByValue(withdrawsVendor.autoWithdrawDisbursement.onlyWhenBalanceIs, withdraw.minimumWithdrawAmount);
        await this.selectByValue(withdrawsVendor.autoWithdrawDisbursement.maintainAReserveBalance, withdraw.reservedBalance);
        await this.clickAndWaitForResponseAndLoadState(data.subUrls.ajax, withdrawsVendor.autoWithdrawDisbursement.changeSchedule);
        await this.notToContainText(withdrawsVendor.autoWithdrawDisbursement.scheduleMessage, data.vendor.withdraw.scheduleMessageInitial);
    }

    // vendor add default withdraw payment methods
    async addDefaultWithdrawPaymentMethods(preferredSchedule: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.withdraw);
        const methodIsDefault = await this.isVisible(withdrawsVendor.withdrawPaymentMethods.defaultMethod(preferredSchedule));
        if (!methodIsDefault) {
            await this.clickAndWaitForLoadState(withdrawsVendor.withdrawPaymentMethods.makeMethodDefault(preferredSchedule));
            await this.toBeVisible(withdrawsVendor.withdrawPaymentMethods.defaultMethod(preferredSchedule));
        }
    }
}
