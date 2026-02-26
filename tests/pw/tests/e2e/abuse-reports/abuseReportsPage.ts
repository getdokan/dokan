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
        moduleSearchInput: "//div[@class='search-box']//input[@placeholder='Search...']",
        moduleSlider: "//span[@class='slider round']",
        moduleToggleCheckbox: "//span[@class='slider round']/preceding-sibling::input[@type='checkbox']",
        // Abuse Reports List Selectors
        reportRowCheckbox: "input.components-checkbox-control__input:visible",
        deleteButton: "//button[normalize-space()='Delete']",
        confirmDeleteButton: "button[class='inline-flex items-center gap-2 justify-center border rounded shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300 text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-600 px-5 py-2 text-sm dokan-btn']",
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
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
    }

    async goToModulesPage() {
        await this.page.goto(this.admin.modulesUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(3000); // Wait for modules to load
    }

    async searchModule(moduleName: string) {
        await this.page.locator(this.admin.moduleSearchInput).fill(moduleName);
        await this.page.waitForTimeout(1000); // Wait for search results
    }

    async isReportAbuseModuleEnabled(): Promise<boolean> {
        const checkbox = this.page.locator(this.admin.moduleToggleCheckbox).first();
        return await checkbox.isChecked();
    }

    async enableReportAbuseModuleIfDisabled() {
        const isEnabled = await this.isReportAbuseModuleEnabled();
        if (!isEnabled) {
            await this.page.locator(this.admin.moduleSlider).first().click();
            await this.page.waitForTimeout(1500); // Wait for toggle animation and save
        }
    }

    async isTextVisible(text: string): Promise<boolean> {
        return await this.page.locator(`:text-is("${text}")`).first().isVisible();
    }

    async checkFirstReportRowCheckbox() {
        await this.page.locator(this.admin.reportRowCheckbox).first().click();
        await this.page.waitForTimeout(500);
    }

    async clickDeleteButton() {
        await this.page.locator(this.admin.deleteButton).click();
        await this.page.waitForTimeout(1000); // Wait for confirmation modal
    }

    async confirmDeleteReport() {
        await this.page.locator(this.admin.confirmDeleteButton).click();
        await this.page.waitForTimeout(1000);
    }

    // Vendor Methods

    // Customer Methods
    async goToProductPage() {
        await this.page.goto(this.customer.productUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
    }

    // Abuse Reports Methods
    async clickReportAbuseLink() {
        await this.page.locator(this.abuseReports.reportAbuseLink).click();
        await this.page.waitForTimeout(1000); // Wait for modal to open
    }

    async selectSpamReason() {
        await this.page.locator(this.abuseReports.spamRadioButton).click();
        await this.page.waitForTimeout(500);
    }

    async fillAbuseDescription(description: string) {
        await this.page.locator(this.abuseReports.descriptionInput).fill(description);
        await this.page.waitForTimeout(500);
    }

    async submitAbuseReport() {
        await this.page.locator(this.abuseReports.submitButton).click();
        await this.page.waitForTimeout(1000); // Wait for confirmation modal
    }

    async confirmAbuseReportSubmission() {
        await this.page.locator(this.abuseReports.confirmOkButton).click();
        await this.page.waitForTimeout(500);
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
