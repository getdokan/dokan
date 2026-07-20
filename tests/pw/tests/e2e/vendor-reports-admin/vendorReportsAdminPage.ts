import { Page, Response, expect } from '@playwright/test';
import { request as pwRequest, APIRequestContext } from '@playwright/test';
import { toPath, closeAnnouncementModal } from '@utils/helpers';
import { ApiUtils as RealApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';

// ============================================================================
// Vendor Reports (admin + vendor) — ported from the pre-refactor page objects
// (git e2ec507de:tests/pw/pages/reportsPage.ts and vendorReportsPage.ts) into
// the current self-contained architecture.
//
//   Admin  -> ReportsPage: `admin.php?page=dokan#/reports` (Reports metaboxes)
//             + `#/reports?tab=logs` (All Logs table: search / export / filter).
//   Vendor -> VendorReportsPage: `/dashboard/reports` tabs (Overview, Sales by
//             day, Top selling, Top earning, Statement) + statement export.
//
// Base-class helpers from the reference are inlined as raw Playwright:
//   toBeVisible(x)                     -> expect(page.locator(x)).toBeVisible()
//   multipleElementVisible(group)      -> loop-assert Object.values(group) visible
//   clickAndWaitForLoadState(s)        -> Promise.all([waitForLoadState, click])
//   typeByPageAndWaitForResponse(...)  -> clear + Promise.all([waitForResponse, pressSequentially])
//   typeAndWaitForResponse(...)        -> Promise.all([waitForResponse, fill])
//   pressAndWaitForResponse(...)       -> Promise.all([waitForResponse, keyboard.press])
//   clickAndAcceptAndWaitForResponse   -> once('dialog', accept) + Promise.all([waitForResponse, click])
//   clickAndWaitForDownload(s)         -> Promise.all([waitForEvent('download'), click])
//   clearInputField(s)                 -> page.locator(s).fill('')
//   hasAttribute(s, a)                 -> locator.evaluate(el => el.hasAttribute(a))
//   goIfNotThere(u)                    -> goto(u) only when not already there
//
// data / payloads / ApiUtils are re-exported REAL from @utils so the spec's
// import contract ({ ReportsPage, VendorReportsPage, ApiUtils, data, payloads })
// is wired to the real utilities (not local no-op stubs). The legacy describe
// block is skipped in-spec; the React parity cases drive the surface directly.
// ============================================================================

// Re-export the REAL shared test data + payloads used across the spec.
export { data };
export { payloads } from '@utils/payloads';

/**
 * Null-tolerant ApiUtils wrapper.
 *
 * The spec constructs `new ApiUtils(null)`. The real ApiUtils requires an
 * APIRequestContext, so when null is passed we lazily create our own context
 * and swap it in before the first real call.
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
// SELECTORS (co-located, verbatim from the pre-refactor selectors.ts)
// ============================================================================

// Admin reports surface: selector.admin.dokan.reports
export const reportsAdminSelectors = {
    // nav-tab menus
    menus: {
        reports: '//a[contains(@class, "nav-tab") and contains(text(),"Reports")]',
        allLogs: '//a[contains(@class, "nav-tab") and contains(text(),"All Logs")]',
    },

    // Reports tab
    reports: {
        atAGlance: {
            atAGlance: '.postbox.dokan-postbox.dokan-status',
            collapsibleButton: '.dokan-status .handle-actions button',
            netSalesThisMonth: '.sale strong',
            commissionEarned: '.commission strong div',
            signupThisMonth: '.vendor strong',
            vendorAwaitingApproval: '.approval strong',
            productCreatedThisMonth: '.product strong',
            withdrawAwaitingApproval: '.withdraw strong',
        },
        overview: {
            overview: '.postbox.dokan-postbox.overview-chart',
            collapsibleButton: '.overview-chart .handle-actions button',
            chart: '#line-chart',
        },
        filterMenus: {
            byDay: '//ul[contains(@class, "dokan-report-sub")]//a[contains(text(),"By Day")]',
            byYear: '//ul[contains(@class, "dokan-report-sub")]//a[contains(text(),"By Year")]',
            byVendor: '//ul[contains(@class, "dokan-report-sub")]//a[contains(text(),"By Vendor")]',
        },
        calendar: 'div.report-date-range',
        show: '//button[normalize-space()="Show"]',
    },

    // All Logs tab
    allLogs: {
        filters: {
            filterByStore: '//span[@id="select2-filter-vendors-container"]/..//span[@class="select2-selection__arrow"]',
            filterByStoreInput: '//input[@class="select2-search__field" and @aria-owns="select2-filter-vendors-results"]',
            filterByStatus: '//span[@class="select2-selection select2-selection--multiple"]',
            filterByStatusInput: '//input[@class="select2-search__field" and @placeholder="Filter by status"]',
            searchedResult: '.select2-results__option.select2-results__option--highlighted',
            filterByDate: '.form-control',
            clear: '//a[contains(text(),"Clear")]',
        },
        search: '#post-search-input',
        exportLogs: '#export-all-logs',
        table: {
            allLogsTable: '.reports-page table',
            orderIdColumn: 'thead th.order_id',
            storeColumn: 'thead th.vendor_id',
            orderTotalColumn: 'thead th.order_total',
            vendorEarningColumn: 'thead th.vendor_earning',
            commissionColumn: 'thead th.commission',
            gatewayFeeColumn: 'thead th.dokan_gateway_fee',
            shippingColumn: 'thead th.shipping_total',
            shippingTaxColumn: 'thead th.shipping_total_tax',
            productTaxColumn: 'thead th.tax_total',
            statusColumn: 'thead th.status',
            DateColumn: 'thead th.date',
        },
        numberOfRowsFound: '.tablenav.top .displaying-num',
        numberOfRows: 'div.logs-area table tbody tr',
        noRowsFound: '//td[normalize-space()="No logs found."]',
        orderIdCell: (orderNumber: string): string => `//a[normalize-space()='#${orderNumber}']/..`,
    },
} as const;

// Vendor reports surface: selector.vendor.vReports (+ datePicker mirrors vAnalytics.datePicker)
export const vendorReportsSelectors = {
    reportsText: '//h1[normalize-space()="Reports"]',

    menus: {
        overview: '//ul[@class="dokan_tabs"]//a[contains(text(), "Overview")]',
        salesByDay: '//ul[@class="dokan_tabs"]//a[contains(text(), "Sales by day")]',
        topSelling: '//ul[@class="dokan_tabs"]//a[contains(text(), "Top selling")]',
        topEarning: '//ul[@class="dokan_tabs"]//a[contains(text(), "Top earning")]',
        statement: '//ul[@class="dokan_tabs"]//a[contains(text(), "Statement")]',
    },

    chart: {
        legendDetails: '.dokan-reports-sidebar ul.chart-legend',
        chartDiv: 'div.chart-container',
        chartLegend: 'div.chart.chart-legend-container',
        chart: 'div.chart-placeholder.main',
    },

    // mirrors selector.vendor.vAnalytics.datePicker (the two fields the flow asserts)
    datePicker: {
        dateRangePickerInput: 'input.dokan-daterangepicker',
        show: 'input[value="Show"]',
    },

    topSelling: {
        table: {
            topSellingTable: '.table.table-striped',
            productColumn: '//th[normalize-space()="Product"]',
            salesColumn: '//th[normalize-space()="Sales"]',
        },
    },

    topEarning: {
        table: {
            topEarningTable: '.table.table-striped',
            productColumn: '//th[normalize-space()="Product"]',
            salesColumn: '//th[normalize-space()="Sales"]',
            earningColumn: '//th[normalize-space()="Earning"]',
        },
    },

    statement: {
        exportStatements: '.dokan-right',
        table: {
            statementsTable: '.table.table-striped',
            balanceDateColumn: '//th[normalize-space()="Balance Date"]',
            trnDateColumn: '//th[normalize-space()="Trn Date"]',
            idColumn: '//th[normalize-space()="ID"]',
            typeColumn: '//th[normalize-space()="Type"]',
            debitColumn: '//th[normalize-space()="Debit"]',
            creditColumn: '//th[normalize-space()="Credit"]',
            balanceColumn: '//th[normalize-space()="Balance"]',
        },
    },
} as const;

// ============================================================================
// ADMIN — ReportsPage
// ============================================================================
export class ReportsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- raw helpers (ported base-class semantics) ----

    // goIfNotThere: navigate only when not already on the target sub-path.
    private async goIfNotThere(subPath: string): Promise<void> {
        if (!this.page.url().includes(subPath)) {
            await this.page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' });
        }
    }

    // toBeVisible for every string value of a selector group.
    private async multipleElementVisible(selectors: Record<string, string>): Promise<void> {
        for (const selector of Object.values(selectors)) {
            await expect(this.page.locator(selector)).toBeVisible();
        }
    }

    // clear + type, resolving on the matching XHR response.
    private async typeByPageAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<Response> {
        await this.page.locator(selector).fill('');
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).pressSequentially(text, { delay: 200 }),
        ]);
        return response;
    }

    // fill (clearAndFill), resolving on the matching XHR response.
    private async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).fill(text),
        ]);
        return response;
    }

    // keyboard press, resolving on the matching XHR response.
    private async pressAndWaitForResponse(subUrl: string, key: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.keyboard.press(key),
        ]);
        return response;
    }

    // auto-accept the confirm dialog, click, resolve on the matching XHR response.
    private async clickAndAcceptAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response> {
        // page.once so only THIS dialog is accepted.
        this.page.once('dialog', dialog => {
            void dialog.accept();
        });
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        return response;
    }

    // click, resolving on the download event.
    private async clickAndWaitForDownload(selector: string): Promise<void> {
        await Promise.all([
            this.page.waitForEvent('download'),
            this.page.locator(selector).click(),
        ]);
    }

    // ---- reports ----

    // reports render properly
    async adminReportsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.reports);

        // report menus are visible
        await this.multipleElementVisible(reportsAdminSelectors.menus);

        // filter menus are visible
        await this.multipleElementVisible(reportsAdminSelectors.reports.filterMenus);

        // calendar input is visible
        await expect(this.page.locator(reportsAdminSelectors.reports.calendar)).toBeVisible();

        // show button is visible
        await expect(this.page.locator(reportsAdminSelectors.reports.show)).toBeVisible();

        // at a glance elements are visible
        await this.multipleElementVisible(reportsAdminSelectors.reports.atAGlance);

        // overview elements are visible
        await this.multipleElementVisible(reportsAdminSelectors.reports.overview);
    }

    // ---- all logs ----

    // all logs render properly
    async adminAllLogsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

        // report menus are visible
        await this.multipleElementVisible(reportsAdminSelectors.menus);

        // filter elements are visible (excluding the search-field inputs + highlighted result)
        const { filterByStoreInput, filterByStatusInput, searchedResult, ...filters } = reportsAdminSelectors.allLogs.filters;
        void filterByStoreInput;
        void filterByStatusInput;
        void searchedResult;
        await this.multipleElementVisible(filters);

        // search is visible
        await expect(this.page.locator(reportsAdminSelectors.allLogs.search)).toBeVisible();

        // export log is visible
        await expect(this.page.locator(reportsAdminSelectors.allLogs.exportLogs)).toBeVisible();

        // all logs table elements are visible
        await this.multipleElementVisible(reportsAdminSelectors.allLogs.table);
    }

    // search all logs
    async searchAllLogs(orderId: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

        await this.page.locator(reportsAdminSelectors.allLogs.search).fill('');
        await this.typeByPageAndWaitForResponse(data.subUrls.api.dokan.logs, reportsAdminSelectors.allLogs.search, orderId);
        await expect(this.page.locator(reportsAdminSelectors.allLogs.numberOfRows)).toHaveCount(1);
        await expect(this.page.locator(reportsAdminSelectors.allLogs.orderIdCell(orderId))).toBeVisible();
    }

    // export all logs
    async exportAllLogs(orderId?: string): Promise<void> {
        if (orderId) {
            await this.searchAllLogs(orderId);
        }
        await this.clickAndWaitForDownload(reportsAdminSelectors.allLogs.exportLogs);
    }

    // filter all logs
    async filterAllLogs(input: string, action: string): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.dokan.allLogs);

        switch (action) {
            case 'by-store':
                await this.page.locator(reportsAdminSelectors.allLogs.filters.filterByStore).click();
                await this.typeAndWaitForResponse(data.subUrls.api.dokan.stores, reportsAdminSelectors.allLogs.filters.filterByStoreInput, input);
                await this.page.keyboard.press(data.key.arrowDown);
                await this.pressAndWaitForResponse(data.subUrls.api.dokan.logs, data.key.enter);
                break;

            case 'by-status':
                await this.page.locator(reportsAdminSelectors.allLogs.filters.filterByStatus).click(); // todo: add multiselect option
                await this.page.locator(reportsAdminSelectors.allLogs.filters.filterByStatusInput).pressSequentially(input, { delay: 100 });
                await this.clickAndAcceptAndWaitForResponse(data.subUrls.api.dokan.logs, reportsAdminSelectors.allLogs.filters.searchedResult);
                break;

            default:
                break;
        }
        await expect(this.page.locator(reportsAdminSelectors.allLogs.numberOfRowsFound)).not.toHaveText('0 items');
        await expect(this.page.locator(reportsAdminSelectors.allLogs.noRowsFound)).toBeHidden();
    }
}

// ============================================================================
// VENDOR — VendorReportsPage
// ============================================================================
export class VendorReportsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        void closeAnnouncementModal(page);
    }

    // ---- raw helpers (ported base-class semantics) ----

    private async goIfNotThere(subPath: string): Promise<void> {
        if (!this.page.url().includes(subPath)) {
            await this.page.goto(toPath(subPath), { waitUntil: 'domcontentloaded' });
        }
    }

    private async multipleElementVisible(selectors: Record<string, string>): Promise<void> {
        for (const selector of Object.values(selectors)) {
            await expect(this.page.locator(selector)).toBeVisible();
        }
    }

    // clickAndWaitForLoadState: click, resolving on the next load state.
    private async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'): Promise<void> {
        await Promise.all([this.page.waitForLoadState(state), this.page.locator(selector).click()]);
    }

    // hasAttribute: true when the element carries the given attribute.
    private async hasAttribute(selector: string, attribute: string): Promise<boolean> {
        return await this.page.locator(selector).evaluate((el, attr) => el.hasAttribute(attr), attribute);
    }

    private async clickAndWaitForDownload(selector: string): Promise<void> {
        await Promise.all([
            this.page.waitForEvent('download'),
            this.page.locator(selector).click(),
        ]);
    }

    // ---- vendor reports ----

    // vendor reports render properly
    async vendorReportsRenderProperly(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.reports);

        // reports text is visible
        await expect(this.page.locator(vendorReportsSelectors.reportsText)).toBeVisible();

        // reports menu elements are visible
        await this.multipleElementVisible(vendorReportsSelectors.menus);

        // chart elements are visible
        await this.multipleElementVisible(vendorReportsSelectors.chart);

        await this.clickAndWaitForLoadState(vendorReportsSelectors.menus.salesByDay);

        // chart elements are visible
        await this.multipleElementVisible(vendorReportsSelectors.chart);

        await this.clickAndWaitForLoadState(vendorReportsSelectors.menus.topSelling);

        // date picker elements are visible
        await this.multipleElementVisible(vendorReportsSelectors.datePicker);

        // top selling table elements are visible
        await this.multipleElementVisible(vendorReportsSelectors.topSelling.table);

        await this.clickAndWaitForLoadState(vendorReportsSelectors.menus.topEarning);

        // date picker elements are visible
        await this.multipleElementVisible(vendorReportsSelectors.datePicker);

        // top earning table elements are visible
        await this.multipleElementVisible(vendorReportsSelectors.topEarning.table);

        await this.clickAndWaitForLoadState(vendorReportsSelectors.menus.statement);

        // date picker elements are visible
        await this.multipleElementVisible(vendorReportsSelectors.datePicker);

        // statement table elements are visible
        await this.multipleElementVisible(vendorReportsSelectors.statement.table);

        // export statements button is visible
        await expect(this.page.locator(vendorReportsSelectors.statement.exportStatements)).toBeVisible();
    }

    // vendor export statement
    async exportStatement(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.vDashboard.statement);
        const isDisabled = await this.hasAttribute(vendorReportsSelectors.statement.exportStatements, 'disabled');
        if (!isDisabled) {
            await this.clickAndWaitForDownload(vendorReportsSelectors.statement.exportStatements);
        }
    }
}
