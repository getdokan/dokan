import { Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9999';

export class AbuseReportsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // SELECTORS
    // ============================================

    // Admin Selectors
    admin = {
        abuseReportsUrl: `${BASE_URL}/wp-admin/admin.php?page=dokan-dashboard#/abuse-reports`,
        modulesUrl: `${BASE_URL}/wp-admin/admin.php?page=dokan#/modules`,
        settingsUrl: `${BASE_URL}/wp-admin/admin.php?page=dokan#/settings`,
        moduleSearchInput: "//div[@class='search-box']//input[@placeholder='Search...']",
        moduleSlider: "//span[@class='slider round']",
        moduleToggleCheckbox: "//span[@class='slider round']/preceding-sibling::input[@type='checkbox']",
        // Abuse Reports List Selectors
        reportRowCheckbox: "input.components-checkbox-control__input:visible",
        deleteButton: "//button[normalize-space()='Delete']",
        confirmDeleteButton: "button[class='inline-flex items-center gap-2 justify-center border rounded shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300 text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-600 px-5 py-2 text-sm dokan-btn']",
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
    };

    // Vendor Selectors
    vendor = {
    };

    // Customer Selectors
    customer = {
        productUrl: `${BASE_URL}/product/p1_v1-simple/`,
    };

    // Abuse Reports Specific Selectors
    abuseReports = {
        reportAbuseLink: "//a[normalize-space()='Report Abuse']",
        spamRadioButton: "//input[@value='This content is spam']",
        descriptionInput: "//textarea[@name='description']",
        submitButton: "//button[@id='dokan-report-abuse-form-submit-btn']",
        confirmOkButton: "//button[normalize-space()='OK']",
        customReasonLabel: (reason: string) => `//label[normalize-space()='${reason}']`,
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
        }
    };

    // ============================================
    // HELPER METHODS
    // ============================================

    // Navigation Methods
    async navigateTo(url: string) {
        await this.page.goto(url);
    }

    // Admin Methods
    async goToAbuseReports() {
        await this.page.goto(this.admin.abuseReportsUrl);
        await this.page.waitForLoadState('networkidle');
        // Wait for the report list to be rendered
        await this.page.locator(this.admin.reportRowCheckbox).first().waitFor({ state: 'visible' });
    }

    async goToModulesPage() {
        await this.page.goto(this.admin.modulesUrl);
        await this.page.waitForLoadState('networkidle');
        // Wait for the module search input to confirm the page is ready
        await this.page.locator(this.admin.moduleSearchInput).waitFor({ state: 'visible' });
    }

    async searchModule(moduleName: string) {
        await this.page.locator(this.admin.moduleSearchInput).fill(moduleName);
        // Wait for filtered module slider to appear
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
            // Wait for the checkbox to reflect the enabled state
            await this.page.locator(this.admin.moduleToggleCheckbox).first().waitFor({ state: 'attached' });
        }
    }

    async isTextVisible(text: string): Promise<boolean> {
        return await this.page.locator(`:text-is("${text}")`).first().isVisible();
    }

    async checkFirstReportRowCheckbox() {
        await this.page.locator(this.admin.reportRowCheckbox).first().click();
        // Wait for the Delete button to become visible after row selection
        await this.page.locator(this.admin.deleteButton).waitFor({ state: 'visible' });
    }

    async clickDeleteButton() {
        await this.page.locator(this.admin.deleteButton).click();
        // Wait for the confirmation modal's confirm button to appear
        await this.page.locator(this.admin.confirmDeleteButton).waitFor({ state: 'visible' });
    }

    async confirmDeleteReport() {
        await Promise.all([
            this.page.waitForResponse(res => res.url().includes('wp-json/dokan') && res.status() === 200),
            this.page.locator(this.admin.confirmDeleteButton).click(),
        ]);
        // Wait for the confirmation modal to close
        await this.page.locator(this.admin.confirmDeleteButton).waitFor({ state: 'hidden' });
    }

    async goToSettingsPage() {
        await this.page.goto(this.admin.settingsUrl);
        await this.page.waitForLoadState('networkidle');
        // Wait for the settings search input to confirm the page is ready
        await this.page.locator(this.admin.settingsSearchInput).waitFor({ state: 'visible' });
    }

    async searchSettings(keyword: string) {
        await this.page.locator(this.admin.settingsSearchInput).fill(keyword);
        // Wait for the filtered settings heading to appear
        await this.page.locator(this.admin.settingsHeading).waitFor({ state: 'visible' });
    }

    async isSettingsHeadingVisible(): Promise<boolean> {
        return await this.page.getByRole('heading', { name: /Product Report Abuse Settings/i }).isVisible();
    }

    async getSettingsDocLinkHref(): Promise<string> {
        const href = await this.page.locator(this.admin.settingsDocLink).getAttribute('href');
        return href ?? '';
    }

    async isReportedByHeadingVisible(): Promise<boolean> {
        return await this.page.locator(this.admin.reportedByHeading).isVisible();
    }

    async enableReportedBySliderIfDisabled() {
        const checkbox = this.page.locator(this.admin.reportedByToggleCheckbox);
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
            await this.page.locator(this.admin.reportedBySlider).click();
            // Wait until the checkbox reflects the enabled state
            await checkbox.waitFor({ state: 'attached' });
            await this.page.waitForFunction(
                (selector) => {
                    const el = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLInputElement | null;
                    return el?.checked === true;
                },
                this.admin.reportedByToggleCheckbox
            );
        }
    }

    async isReasonsHeadingVisible(): Promise<boolean> {
        return await this.page.locator(this.admin.reasonsHeading).isVisible();
    }

    async fillNewAbuseReason(reason: string) {
        await this.page.locator(this.admin.addReasonInput).last().fill(reason);
        await this.page.locator("//input[@id='submit']").click();
        // Wait for any triggered network activity (save/add) to complete
        await this.page.waitForLoadState('networkidle');
    }

    async clickAddReasonPlusButton() {
        await this.page.locator(this.admin.addReasonPlusButton).click();
        // Wait for any triggered network activity (save/add) to complete
        await this.page.waitForLoadState('networkidle');
    }

    async clickSaveChanges() {
        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            this.page.locator(this.admin.saveChangesButton).click(),
        ]);
    }

    async waitForPageReady() {
        await this.page.waitForLoadState('networkidle');
    }

    // Vendor Methods

    // Customer Methods
    async goToProductPage() {
        await this.page.goto(this.customer.productUrl);
        await this.page.waitForLoadState('domcontentloaded');
        // Wait for the Report Abuse link to be ready
        await this.page.locator(this.abuseReports.reportAbuseLink).waitFor({ state: 'visible' });
    }

    // Abuse Reports Methods
    async clickReportAbuseLink() {
        await this.page.locator(this.abuseReports.reportAbuseLink).click();
        // Wait for the modal to open by checking the spam radio button is visible
        await this.page.locator(this.abuseReports.spamRadioButton).waitFor({ state: 'visible' });
    }

    async selectSpamReason() {
        await this.page.locator(this.abuseReports.spamRadioButton).click();
    }

    async fillAbuseDescription(description: string) {
        await this.page.locator(this.abuseReports.descriptionInput).fill(description);
    }

    async submitAbuseReport() {
        await this.page.locator(this.abuseReports.submitButton).click();
        // Wait for the OK confirmation button to appear in the success modal
        await this.page.locator(this.abuseReports.confirmOkButton).waitFor({ state: 'visible' });
    }

    async confirmAbuseReportSubmission() {
        await this.page.locator(this.abuseReports.confirmOkButton).click();
        // Wait for the modal to close
        await this.page.locator(this.abuseReports.confirmOkButton).waitFor({ state: 'hidden' });
    }

    async clickCustomReasonLabel(reason: string) {
        const label = this.page.locator(this.abuseReports.customReasonLabel(reason));
        await label.waitFor({ state: 'visible' });
        await label.click();
    }

    async getCustomReasonLabelText(reason: string): Promise<string> {
        const label = this.page.locator(this.abuseReports.customReasonLabel(reason));
        await label.waitFor({ state: 'visible' });
        return (await label.textContent())?.trim() ?? '';
    }

    // Wait/Utility Methods
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
        return await this.page.textContent(selector) || '';
    }
}
