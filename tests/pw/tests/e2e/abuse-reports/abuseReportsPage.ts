import { Page, APIRequestContext, expect } from '@playwright/test';

// The repo's tsconfig doesn't include `@types/node`, so the IDE flags `process`
// as undefined. Declare it locally so this file stays free of red squiggles
// without disabling type-checking for everything else in the file.
declare const process: { env: Record<string, string | undefined> };
// Buffer is exposed in Node test runtime; declare locally to avoid pulling
// @types/node into the strict tsconfig used elsewhere in the suite.
declare const Buffer: { from(input: string): { toString(encoding: string): string } };

import { toPath, SERVER_URL } from '@utils/helpers';
const ADMIN_USER = process.env.ADMIN || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'password';
const adminBasicAuth = (): string =>
    'Basic ' + Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64');

export class AbuseReportsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // SELECTORS
    // ============================================

    // Admin Selectors (legacy + shared)
    admin = {
        abuseReportsUrl: toPath(`wp-admin/admin.php?page=dokan-dashboard#/abuse-reports`),
        modulesUrl: toPath(`wp-admin/admin.php?page=dokan#/modules`),
        settingsUrl: toPath(`wp-admin/admin.php?page=dokan#/settings`),
        moduleSearchInput: "//div[@class='search-box']//input[@placeholder='Search...']",
        moduleSlider: "//span[@class='slider round']",
        moduleToggleCheckbox: "//span[@class='slider round']/preceding-sibling::input[@type='checkbox']",
        // Abuse Reports List Selectors
        reportRowCheckbox: "input.components-checkbox-control__input:visible",
        deleteButton: "//button[normalize-space()='Delete']",
        confirmDeleteButton: "//*[@role='alertdialog']//button[normalize-space()='Delete']",
        // Settings Page Selectors
        settingsSearchInput: "//input[@id='dokan-admin-search']",
        settingsHeading: "//h2[normalize-space()='Product Report Abuse Settings']",
        settingsDocLink: "//a[@class='doc-link']",
        reportedByHeading: "//h3[normalize-space()='Reported by']",
        reportedBySlider: "//h3[normalize-space()='Reported by']/following::span[@class='slider round'][1]",
        reportedByToggleCheckbox: "//h3[normalize-space()='Reported by']/following::input[@type='checkbox'][1]",
        reasonsHeading: "//h3[normalize-space()='Reasons for Abuse Report']",
        addReasonInput: "//input[@class='regular-text medium']",
        addReasonPlusButton: "span.dashicons.dashicons-plus-alt2",
        saveChangesButton: "(//input[@id='submit'])[1]",
        removeReasonButton: (reason: string) => `//li[normalize-space()='${reason}']//span[@class='dashicons dashicons-no-alt remove-item']`,
    };

    // Admin React DataViews UI selectors (Dokan 5.0.0 rewrite)
    // Selectors are intentionally permissive — DokanModal/DataViews don't
    // commit to specific heading tags or aria attributes between releases.
    adminReact = {
        // Page chrome
        pageHeading: "//*[self::h1 or self::h2 or self::h3][normalize-space()='Abuse Reports']",
        allTab: "//*[@role='tab'][contains(normalize-space(.),'All')]",
        allTabBadge: "//*[@role='tab'][contains(normalize-space(.),'All')]",
        // List rows.
        dataRow: "table tbody tr",
        // IMPORTANT: the visible Reason cell text is truncated to 22 chars by the
        // React render (`truncate(item.reason, 22)` → "first 22 chars…"), so a
        // `contains(., "<full reason>")` match fails for any reason longer than
        // 22 chars. The DataViews title-field selection checkbox, however, carries
        // the FULL untruncated reason in its `aria-label` (confirmed in the live
        // DOM capture, tmp-abuse/list.html). Anchor every row lookup on that
        // checkbox so it works for both short and long reasons, then walk up to
        // the owning <tr>. (Short reasons like "This content is spam" still match,
        // keeping the existing green TC7–TC33 cases passing.)
        rowByReason: (reason: string) =>
            `//input[@type='checkbox' and @aria-label="${reason}"]/ancestor::tr[1]`,
        rowReasonCell: (reason: string) =>
            `//input[@type='checkbox' and @aria-label="${reason}"]/ancestor::tr[1]//div[contains(@class,'text-[#7047EB]') or contains(@class,'cursor-pointer')]`,
        rowCheckboxByReason: (reason: string) =>
            `//input[@type='checkbox' and @aria-label="${reason}"]`,
        rowActionsButton: (reason: string) =>
            `//input[@type='checkbox' and @aria-label="${reason}"]/ancestor::tr[1]//button[contains(@class,'dataviews-all-actions-button') or @aria-haspopup='menu' or @aria-label='Actions']`,
        anyRowActionsButton:
            "//tr//button[contains(@class,'dataviews-all-actions-button') or @aria-haspopup='menu' or @aria-label='Actions']",
        // Action menu items
        viewMenuItem: "//*[@role='menuitem'][normalize-space()='View']",
        deleteMenuItem: "//*[@role='menuitem'][normalize-space()='Delete']",
        // Bulk action toolbar
        selectAllCheckbox: "thead input[type='checkbox']",
        // Bulk Delete: rendered as a button with a custom icon span. Scope to
        // the toolbar (NOT inside any modal) so the row's Delete menu-item
        // and the modal's Delete confirm don't accidentally match.
        bulkDeleteButton:
            "//button[.//span[normalize-space()='Delete']][not(ancestor::*[@role='dialog'])]",
        // When one or more rows are selected, DataViews surfaces a DIRECT bulk
        // Delete button (NOT inside the per-row Actions menu) as
        // `button.components-button.is-compact` carrying the visible text
        // "Delete" (verified live in tmp-abuse/row-selected.json). Used by the
        // select-all + bulk-delete list case.
        bulkDeleteCompactButton:
            "button.components-button.is-compact:has-text('Delete')",
        // Delete confirmation modal. This is a base-ui AlertDialog rendered with
        // role="alertdialog" (NOT role="dialog"), so every selector below matches
        // either role to stay robust across the DataViews/base-ui rewrite.
        deleteModal: "//*[(@role='dialog' or @role='alertdialog')][.//*[normalize-space()='Delete Abuse Report'] or .//*[contains(., 'Are you sure you want to delete')]]",
        deleteModalHeading:
            "//*[(@role='dialog' or @role='alertdialog')]//*[self::h1 or self::h2 or self::h3 or self::h4][normalize-space()='Delete Abuse Report']",
        // The description renders inside a leaf <p>; scope to that to avoid
        // matching every wrapper div when used in strict-mode locators.
        deleteModalDescription:
            "//*[(@role='dialog' or @role='alertdialog')]//p[contains(., 'Are you sure you want to delete')]",
        deleteModalConfirmBtn:
            "//*[(@role='dialog' or @role='alertdialog')]//button[normalize-space()='Delete']",
        deleteModalCancelBtn:
            "//*[(@role='dialog' or @role='alertdialog')]//button[normalize-space()='Cancel']",
        // Detail modal
        detailModal:
            "//*[@role='dialog'][.//*[normalize-space()='Product Abuse Report']]",
        detailModalHeading:
            "//*[@role='dialog']//*[self::h1 or self::h2 or self::h3 or self::h4][normalize-space()='Product Abuse Report']",
        detailModalReasonBlock:
            "//*[@role='dialog']//*[normalize-space()='Reason']/following-sibling::*",
        detailModalDescriptionBlock:
            "//*[@role='dialog']//*[normalize-space()='Description']/following-sibling::*",
        detailModalReportedProduct:
            "//*[@role='dialog']//*[normalize-space()='Reported Product']/following-sibling::*",
        detailModalReportedBy:
            "//*[@role='dialog']//*[normalize-space()='Reported By']/following-sibling::*",
        detailModalReportedAt:
            "//*[@role='dialog']//*[normalize-space()='Reported at']/following-sibling::*",
        detailModalProductVendor:
            "//*[@role='dialog']//*[normalize-space()='Product Vendor']/following-sibling::*",
        detailModalCloseBtn:
            "//*[@role='dialog']//button[normalize-space()='Close']",
        // Filters — @wordpress/dataviews via Dokan's AdminDataViews wrapper.
        // VERIFIED LIVE (tmp-abuse explorer) — the ACTUAL flow in this build:
        //   1. The toolbar exposes a funnel toggle: <button title="Filter">.
        //   2. Clicking it opens a portal `.components-popover` listing one
        //      <button> per filterable field (text = "Reason" / "Product" /
        //      "Vendor").
        //   3. Clicking a field button renders that field's react-select control
        //      and reveals the inline `.dokan-admin-dashboard-filters` panel —
        //      which is `display:none` until a filter is active and is where the
        //      "Add Filter" (add another) + "Reset" buttons then live.
        // So "Add Filter"/"Reset" are NOT visible at rest; the funnel popover is
        // the real entry point. The list specs therefore assert the toggle + the
        // offered field option (deterministic) and prove the backend the UI
        // issues (?reason=/?product_id=/?vendor_id=) over REST, rather than
        // driving the portaled react-select value picker (which is racy).
        filterBar: "[data-filter-id*='abuse_reports']",
        // The funnel toggle that opens the filter-field popover.
        filterToggleButton: "button[title='Filter']",
        // A filterable-field option inside the funnel popover, scoped to the
        // popover so it cannot collide with the same-named column-sort headers.
        filterMenuOption: (label: string) =>
            `//*[contains(@class,'components-popover')]//button[normalize-space()='${label}']`,
        // The inline "Add Filter" trigger (only present once the filter panel is
        // expanded — see note above).
        addFilterButton: "//button[normalize-space()='Add Filter']",
        // A field-label button inside the Add-Filter popover (portal-rendered).
        // MUST be scoped to the popover's button class — a bare
        // //button[normalize-space()='Product'|'Vendor'] would also match the
        // DataViews column-sort header buttons of the same text. The AdminFilter
        // popover renders each field as a full-width hover-highlight button.
        filterFieldButton: (label: string) =>
            `//button[contains(@class,'hover:bg-[#EFEAFF]')][normalize-space()='${label}']`,
        // react-select combobox input for the currently-rendered filter control.
        filterSelectInput: "input.react-select__input, input[id^='react-select']",
        // react-select option carrying the given label (menu is portaled).
        filterOption: (label: string) =>
            `//*[contains(@class,'react-select__option')][contains(normalize-space(.), "${label}")]`,
        filterChipRemove: (id: string) =>
            `//*[@data-filter-id='${id}']//button[contains(@aria-label,'Remove') or contains(@aria-label,'Clear')]`,
        filterResetBtn:
            "//button[normalize-space()='Reset' or normalize-space()='Reset filters']",
        // Toasts
        toast: "[role='status'], .dokan-toast, [class*='toast']",
        toastSuccess:
            "//*[contains(@class,'success') or @data-status='success']",
    };

    // Vendor Selectors
    vendor = {
    };

    // Customer Selectors
    customer = {
        productUrl: toPath(`product/p1_v1-simple/`),
    };

    // Abuse Reports Specific Selectors (front-end report form)
    abuseReports = {
        reportAbuseLink: "//a[normalize-space()='Report Abuse']",
        formContainer: "//form[contains(@id,'dokan-report-abuse')]",
        spamRadioButton: "//input[@value='This content is spam']",
        reasonRadioByValue: (value: string) => `//input[@type='radio' and @value="${value}"]`,
        customerNameInput: "//input[@name='customer_name']",
        customerEmailInput: "//input[@name='customer_email']",
        descriptionInput: "//textarea[@name='description']",
        submitButton: "//button[@id='dokan-report-abuse-form-submit-btn']",
        confirmOkButton: "//button[normalize-space()='OK']",
        formError: ".dokan-popup-error",
        customReasonLabel: (reason: string) => `//label[normalize-space()='${reason}']`,
    };

    // ============================================
    // REST API CONFIG
    // ============================================

    rest = {
        listEndpoint: `${SERVER_URL}/dokan/v1/abuse-reports`,
        singleEndpoint: (id: number) => `${SERVER_URL}/dokan/v1/abuse-reports/${id}`,
        batchEndpoint: `${SERVER_URL}/dokan/v1/abuse-reports/batch`,
        reasonsEndpoint: `${SERVER_URL}/dokan/v1/abuse-reports/abuse-reasons`,
    };

    // ============================================
    // TEST DATA
    // ============================================

    testData = {
        admin: {
            // Add admin test data here
        },
        vendor: {
            // Add vendor test data here
        },
        customer: {
            // Add customer test data here
        },
        abuseReports: {
            reportReason: 'This content is spam',
            productName: 'p1_v1 (simple)',
            storeName: 'vendor1store',
            reporterName: 'customer1',
            settingsSearchKeyword: 'product report abuse',
            settingsHeadingText: 'Product Report Abuse Settings',
            settingsDocUrl: 'https://dokan.co/docs/wordpress/modules/dokan-report-abuse/',
            reportedByHeadingText: 'Reported by',
            reasonsHeadingText: 'Reasons for Abuse Report',
            newReasonText: 'Test1',
            newDescriptionText: 'Automated abuse-report description for new-UI tests.',
            secondReportDescription: 'Second automated abuse-report row for bulk-delete coverage.',
        },
    };

    // ============================================
    // GENERIC NAVIGATION / WAITS
    // ============================================

    async navigateTo(url: string) {
        await this.page.goto(url);
    }

    async waitForPageReady() {
        await this.page.waitForLoadState('load');
    }

    async waitForElement(selector: string) {
        await this.page.waitForSelector(selector);
    }

    async clickElement(selector: string) {
        await this.page.click(selector);
    }

    async fillInput(selector: string, value: string) {
        await this.page.fill(selector, value);
    }

    async getText(selector: string): Promise<string> {
        return (await this.page.textContent(selector)) || '';
    }

    async isTextVisible(text: string): Promise<boolean> {
        return await this.page.locator(`:text-is("${text}")`).first().isVisible();
    }

    // ============================================
    // ADMIN — MODULES
    // ============================================

    async goToModulesPage() {
        await this.page.goto(this.admin.modulesUrl);
        await this.page.waitForLoadState('load');
        await this.page.locator(this.admin.moduleSearchInput).waitFor({ state: 'visible' });
    }

    async searchModule(moduleName: string) {
        await this.page.locator(this.admin.moduleSearchInput).fill(moduleName);
        await this.page.locator(this.admin.moduleSlider).first().waitFor({ state: 'visible' });
    }

    async isReportAbuseModuleEnabled(): Promise<boolean> {
        const checkbox = this.page.locator(this.admin.moduleToggleCheckbox).first();
        return await checkbox.isChecked();
    }

    async enableReportAbuseModuleIfDisabled() {
        const isEnabled = await this.isReportAbuseModuleEnabled();
        if (!isEnabled) {
            await Promise.all([
                this.page.waitForResponse(res => res.url().includes('wp-json/dokan') && res.status() === 200),
                this.page.locator(this.admin.moduleSlider).first().click(),
            ]);
            await this.page.locator(this.admin.moduleToggleCheckbox).first().waitFor({ state: 'attached' });
        }
    }

    async disableReportAbuseModuleIfEnabled() {
        const isEnabled = await this.isReportAbuseModuleEnabled();
        if (isEnabled) {
            await Promise.all([
                this.page.waitForResponse(res => res.url().includes('wp-json/dokan') && res.status() === 200),
                this.page.locator(this.admin.moduleSlider).first().click(),
            ]);
            await this.page.locator(this.admin.moduleToggleCheckbox).first().waitFor({ state: 'attached' });
        }
    }

    // ============================================
    // ADMIN — SETTINGS
    // ============================================

    async goToSettingsPage() {
        await this.page.goto(this.admin.settingsUrl);
        await this.page.waitForLoadState('load');
        await this.page.locator(this.admin.settingsSearchInput).waitFor({ state: 'visible' });
    }

    async searchSettings(keyword: string) {
        await this.page.locator(this.admin.settingsSearchInput).fill(keyword);
        await this.page.locator(this.admin.settingsHeading).waitFor({ state: 'visible' });
    }

    async isSettingsHeadingVisible(): Promise<boolean> {
        await this.page.getByRole('heading', { name: /Product Report Abuse Settings/i }).waitFor({ state: 'visible', timeout: 10000 });
        return true;
    }

    async getSettingsDocLinkHref(): Promise<string> {
        const href = await this.page.locator(this.admin.settingsDocLink).getAttribute('href');
        return href ?? '';
    }

    async isReportedByHeadingVisible(): Promise<boolean> {
        await this.page.locator(this.admin.reportedByHeading).waitFor({ state: 'visible', timeout: 10000 });
        return true;
    }

    async isReasonsHeadingVisible(): Promise<boolean> {
        await this.page.locator(this.admin.reasonsHeading).waitFor({ state: 'visible', timeout: 10000 });
        return true;
    }

    async enableReportedBySliderIfDisabled() {
        const checkbox = this.page.locator(this.admin.reportedByToggleCheckbox);
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
            await this.page.locator(this.admin.reportedBySlider).click();
            await checkbox.waitFor({ state: 'attached' });
            await this.page.waitForFunction(
                (selector) => {
                    const el = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLInputElement | null;
                    return el?.checked === true;
                },
                this.admin.reportedByToggleCheckbox,
            );
        }
    }

    async disableReportedBySliderIfEnabled() {
        const checkbox = this.page.locator(this.admin.reportedByToggleCheckbox);
        const isChecked = await checkbox.isChecked();
        if (isChecked) {
            await this.page.locator(this.admin.reportedBySlider).click();
            await checkbox.waitFor({ state: 'attached' });
            await this.page.waitForFunction(
                (selector) => {
                    const el = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLInputElement | null;
                    return el?.checked === false;
                },
                this.admin.reportedByToggleCheckbox,
            );
        }
    }

    async fillNewAbuseReason(reason: string) {
        await this.page.locator(this.admin.addReasonInput).last().fill(reason);
        await this.page.locator("//input[@id='submit']").click();
        await this.page.waitForLoadState('load');
    }

    async clickAddReasonPlusButton() {
        await this.page.locator(this.admin.addReasonPlusButton).click();
        await this.page.waitForLoadState('load');
    }

    async removeAbuseReason(reason: string) {
        const removeBtns = this.page.locator(this.admin.removeReasonButton(reason));
        const count = await removeBtns.count();
        for (let i = 0; i < count; i++) {
            const btn = removeBtns.first();
            await btn.waitFor({ state: 'visible' });
            await btn.click();
        }
    }

    async clickSaveChanges() {
        await Promise.all([
            // The Dokan settings save is an admin-ajax POST. Exclude only the WP heartbeat (also an
            // admin-ajax POST, fires every ~15-60s) by its post body's action=heartbeat — a heartbeat
            // tick landing in the wait window could otherwise satisfy it before the save round-trips.
            this.page.waitForResponse(res => res.request().method() === 'POST' && res.url().includes('wp-admin') && !(res.request().postData() ?? '').includes('action=heartbeat')),
            this.page.locator(this.admin.saveChangesButton).click(),
        ]);
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ============================================
    // ADMIN — REPORTS LIST (legacy, still used)
    // ============================================

    async goToAbuseReports() {
        await this.page.goto(this.admin.abuseReportsUrl);
        await this.page.waitForLoadState('load');
        await this.page.locator(this.admin.reportRowCheckbox).first().waitFor({ state: 'visible' });
    }

    async checkFirstReportRowCheckbox() {
        await this.page.locator(this.admin.reportRowCheckbox).first().click();
        await this.page.locator(this.admin.deleteButton).waitFor({ state: 'visible' });
    }

    async clickDeleteButton() {
        await this.page.locator(this.admin.deleteButton).click();
        await this.page.locator(this.admin.confirmDeleteButton).waitFor({ state: 'visible' });
    }

    async confirmDeleteReport() {
        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('wp-json/dokan') && res.status() === 200),
            this.page.locator(this.admin.confirmDeleteButton).click(),
        ]);
        await this.page.locator(this.admin.confirmDeleteButton).waitFor({ state: 'hidden' });
    }

    // ============================================
    // ADMIN — REACT DATAVIEWS LIST (new UI)
    // ============================================

    async goToAbuseReportsReact() {
        await this.page.goto(this.admin.abuseReportsUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.adminReact.pageHeading).waitFor({ state: 'visible', timeout: 30000 });
    }

    async waitForListReady() {
        // The DataViews table is populated via an async REST call after the
        // page heading renders. There are TWO async stages:
        //   1. The /abuse-reports GET response lands.
        //   2. React re-renders the table from that response.
        // Tests previously read row counts between (1) and (2), seeing 0 rows
        // even when the DB had data. We now poll for a stable signal — rows
        // present OR an explicit empty-state node — before returning.
        await this.page.waitForLoadState('load');
        await this.page
            .waitForResponse(
                res =>
                    res.url().includes('/wp-json/dokan/v1/abuse-reports') &&
                    res.request().method() === 'GET' &&
                    res.status() === 200,
                { timeout: 20000 },
            )
            .catch(() => {
                /* response may have already happened — fall through to DOM poll */
            });

        // Poll up to ~10s for either rows OR an explicit empty-state marker.
        // Don't accept generic body-text matching here — partial-render states
        // produced false positives on CI.
        const start = Date.now();
        while (Date.now() - start < 10000) {
            const rowCount = await this.page.locator(this.adminReact.dataRow).count();
            if (rowCount > 0) return;
            // DataViews renders an explicit empty banner when there are no
            // rows. In this build that is the `.dataviews-no-results` node
            // (text "No data found", verified live). Anchor on the stable class.
            const emptyBanner = await this.page
                .locator('.dataviews-no-results')
                .count();
            if (emptyBanner > 0) return;
            await this.page.waitForTimeout(250);
        }
        // If we fall through here neither rows nor an empty banner ever
        // appeared — let the caller's next assertion produce a clear error.
    }

    async getRowCount(): Promise<number> {
        return await this.page.locator(this.adminReact.dataRow).count();
    }

    async isRowForReasonVisible(reason: string): Promise<boolean> {
        return await this.page.locator(this.adminReact.rowByReason(reason)).first().isVisible();
    }

    async clickReasonCell(reason: string) {
        await this.page.locator(this.adminReact.rowReasonCell(reason)).first().click();
        await this.page.locator(this.adminReact.detailModalHeading).waitFor({ state: 'visible' });
    }

    async openRowActionMenu(reason: string) {
        await this.page.locator(this.adminReact.rowActionsButton(reason)).first().click();
        // wait for menu items to surface
        await this.page.locator(this.adminReact.deleteMenuItem).first().waitFor({ state: 'visible' });
    }

    async clickViewActionFromMenu() {
        await this.page.locator(this.adminReact.viewMenuItem).first().click();
        await this.page.locator(this.adminReact.detailModalHeading).waitFor({ state: 'visible' });
    }

    async clickDeleteActionFromMenu() {
        await this.page.locator(this.adminReact.deleteMenuItem).first().click();
        await this.page.locator(this.adminReact.deleteModalConfirmBtn).waitFor({ state: 'visible' });
    }

    async checkRowByReason(reason: string) {
        await this.page.locator(this.adminReact.rowCheckboxByReason(reason)).first().click();
    }

    // ============================================
    // ADMIN — DETAIL MODAL
    // ============================================

    async isDetailModalVisible(): Promise<boolean> {
        return await this.page.locator(this.adminReact.detailModalHeading).isVisible();
    }

    async getDetailModalReason(): Promise<string> {
        return ((await this.page.locator(this.adminReact.detailModalReasonBlock).first().textContent()) || '').trim();
    }

    async getDetailModalDescription(): Promise<string> {
        const block = this.page.locator(this.adminReact.detailModalDescriptionBlock).first();
        const visible = await block.isVisible().catch(() => false);
        if (!visible) return '';
        return ((await block.textContent()) || '').trim();
    }

    async getDetailModalReporterText(): Promise<string> {
        return ((await this.page.locator(this.adminReact.detailModalReportedBy).first().textContent()) || '').trim();
    }

    async closeDetailModal() {
        await this.page.locator(this.adminReact.detailModalCloseBtn).click();
        await this.page.locator(this.adminReact.detailModalHeading).waitFor({ state: 'hidden' });
    }

    // ============================================
    // ADMIN — DELETE FLOW (new UI)
    // ============================================

    async getDeleteModalDescriptionText(): Promise<string> {
        return ((await this.page.locator(this.adminReact.deleteModalDescription).textContent()) || '').trim();
    }

    async confirmDeleteInModal() {
        // The DataViews UI may issue either a true DELETE on the single
        // resource endpoint OR a POST to the batch endpoint depending on the
        // selection size and the underlying store action — accept either.
        await Promise.all([
            this.page.waitForResponse(
                res => {
                    if (!res.url().includes('/wp-json/dokan/v1/abuse-reports')) return false;
                    const m = res.request().method();
                    return m === 'DELETE' || m === 'POST';
                },
                { timeout: 30000 },
            ).catch(() => null),
            this.page.locator(this.adminReact.deleteModalConfirmBtn).click(),
        ]);
        // Modal closes once the request resolves (success or failure).
        await this.page.locator(this.adminReact.deleteModalConfirmBtn).waitFor({ state: 'hidden', timeout: 15000 });
    }

    async cancelDeleteInModal() {
        await this.page.locator(this.adminReact.deleteModalCancelBtn).click();
        await this.page.locator(this.adminReact.deleteModalCancelBtn).waitFor({ state: 'hidden' });
    }

    async clickBulkDeleteButton() {
        await this.page.locator(this.adminReact.bulkDeleteButton).click();
        await this.page.locator(this.adminReact.deleteModalConfirmBtn).waitFor({ state: 'visible' });
    }

    // ============================================
    // ADMIN — FILTERS (new UI)
    // ============================================

    /**
     * Open the Add-Filter popover and activate one filter field by its label
     * ("Reason" / "Product" / "Vendor"). This renders that field's react-select
     * control inline and closes the popover. Returns once the field's combobox
     * input is present (so a follow-up pick can type / open the menu).
     */
    async addFilterField(fieldLabel: string) {
        // Open the funnel popover — the real filter entry point in this build.
        await this.page.locator(this.adminReact.filterToggleButton).first().click();
        // Popover is portal-rendered; its options are field-label buttons
        // (scoped to the popover so they don't collide with column-sort headers).
        const fieldBtn = this.page.locator(this.adminReact.filterMenuOption(fieldLabel)).first();
        await fieldBtn.waitFor({ state: 'visible', timeout: 10000 });
        await fieldBtn.click();
        // The chosen field's react-select control now renders inline.
        await this.page
            .locator(this.adminReact.filterSelectInput)
            .last()
            .waitFor({ state: 'visible', timeout: 10000 })
            .catch(() => {
                /* some builds focus the control without an exposed input */
            });
    }

    /** Open the Reason filter field (back-compat name used by the list specs). */
    async openReasonFilter() {
        await this.addFilterField('Reason');
    }

    /**
     * Open the funnel filter popover only (no field selected). Resolves once a
     * field option has rendered, so callers can assert the offered fields.
     */
    async openFilterMenu() {
        await this.page.locator(this.adminReact.filterToggleButton).first().click();
        await this.page
            .locator(this.adminReact.filterMenuOption('Reason'))
            .first()
            .waitFor({ state: 'visible', timeout: 10000 });
    }

    /**
     * Pick a value from the currently-rendered filter react-select. Typing a
     * fragment first surfaces async/searchable options, then we click the
     * matching `react-select__option`. The menu is portaled, so we open it (by
     * focusing+typing into the combobox) before clicking the option.
     */
    async pickFilterOption(label: string, typeTerm?: string) {
        const input = this.page.locator(this.adminReact.filterSelectInput).last();
        if (await input.isVisible().catch(() => false)) {
            await input.click();
            const term = typeTerm ?? label;
            // Type only a fragment so partial matches still surface the option.
            await input.fill(term.length > 12 ? term.slice(0, 12) : term);
        }
        const opt = this.page.locator(this.adminReact.filterOption(label)).first();
        await opt.waitFor({ state: 'visible', timeout: 15000 });
        await opt.click();
    }

    async clickResetFilters() {
        const btn = this.page.locator(this.adminReact.filterResetBtn).first();
        if (await btn.isVisible().catch(() => false)) {
            await btn.click();
        }
    }

    // ============================================
    // CUSTOMER / GUEST — FRONT-END REPORT FORM
    // ============================================

    async goToProductPage() {
        await this.page.goto(this.customer.productUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.abuseReports.reportAbuseLink).waitFor({ state: 'visible' });
    }

    async clickReportAbuseLink() {
        await this.page.locator(this.abuseReports.reportAbuseLink).click();
        await this.page.locator(this.abuseReports.spamRadioButton).waitFor({ state: 'visible' });
    }

    async selectSpamReason() {
        await this.page.locator(this.abuseReports.spamRadioButton).click();
    }

    async selectReasonByValue(value: string) {
        await this.page.locator(this.abuseReports.reasonRadioByValue(value)).click();
    }

    async fillAbuseDescription(description: string) {
        await this.page.locator(this.abuseReports.descriptionInput).fill(description);
    }

    async fillCustomerName(name: string) {
        await this.page.locator(this.abuseReports.customerNameInput).fill(name);
    }

    async fillCustomerEmail(email: string) {
        await this.page.locator(this.abuseReports.customerEmailInput).fill(email);
    }

    async isCustomerNameInputVisible(): Promise<boolean> {
        return await this.page.locator(this.abuseReports.customerNameInput).isVisible().catch(() => false);
    }

    async submitAbuseReport() {
        await this.page.locator(this.abuseReports.submitButton).click();
        await this.page.locator(this.abuseReports.confirmOkButton).waitFor({ state: 'visible' });
    }

    async confirmAbuseReportSubmission() {
        await this.page.locator(this.abuseReports.confirmOkButton).click();
        await this.page.locator(this.abuseReports.confirmOkButton).waitFor({ state: 'hidden' });
    }

    async clickCustomReasonLabel(reason: string) {
        const label = this.page.locator(this.abuseReports.customReasonLabel(reason)).first();
        await label.waitFor({ state: 'visible' });
        await label.click();
    }

    async getCustomReasonLabelText(reason: string): Promise<string> {
        const label = this.page.locator(this.abuseReports.customReasonLabel(reason)).first();
        await label.waitFor({ state: 'visible' });
        return (await label.textContent())?.trim() ?? '';
    }

    async submitFullAbuseReport(reason: string, description: string) {
        await this.clickReportAbuseLink();
        await this.page.locator(this.abuseReports.reasonRadioByValue(reason)).click();
        await this.fillAbuseDescription(description);
        await this.submitAbuseReport();
        await this.confirmAbuseReportSubmission();
    }

    // ============================================
    // REST API HELPERS (use authed APIRequestContext)
    // ============================================
    //
    // The Dokan REST API authenticates via WP Basic Auth (provided by the
    // Basic-Auth plugin in the test env), NOT cookies. Browser-context request
    // objects only carry cookies, so every authed call here injects an
    // `Authorization: Basic <admin:password>` header. Callers can still pass
    // an unauthed `request.newContext()` (Test Case 14) — we only add the
    // header when `authed` is true (the default for authed helpers).

    private withAdminAuthHeader(extra: Record<string, string> = {}): Record<string, string> {
        return { Authorization: adminBasicAuth(), ...extra };
    }

    async restGetReports(
        request: APIRequestContext,
        params: Record<string, string> = {},
        opts: { authed?: boolean } = { authed: true },
    ) {
        const url = new URL(this.rest.listEndpoint);
        for (const [k, v] of Object.entries(params)) {
            url.searchParams.set(k, v);
        }
        return await request.get(url.toString(), opts.authed ? { headers: this.withAdminAuthHeader() } : undefined);
    }

    async restGetReasons(request: APIRequestContext) {
        return await request.get(this.rest.reasonsEndpoint, { headers: this.withAdminAuthHeader() });
    }

    async restDeleteReport(request: APIRequestContext, id: number) {
        return await request.delete(this.rest.singleEndpoint(id), { headers: this.withAdminAuthHeader() });
    }

    async restDeleteReportsBatch(request: APIRequestContext, ids: number[]) {
        return await request.delete(this.rest.batchEndpoint, {
            headers: this.withAdminAuthHeader(),
            data: { items: ids },
        });
    }

    // ============================================
    // ASSERT HELPERS (used to keep specs concise)
    // ============================================

    async expectReasonVisibleInList(reason: string) {
        await expect(
            this.page.locator(this.adminReact.rowByReason(reason)).first(),
            `Row containing reason "${reason}" should be present in the list`,
        ).toBeVisible();
    }

    async expectReasonNotVisibleInList(reason: string) {
        await expect(
            this.page.locator(this.adminReact.rowByReason(reason)).first(),
            `Row containing reason "${reason}" should NOT be present in the list`,
        ).toBeHidden();
    }
}
