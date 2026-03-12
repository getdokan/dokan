import { Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9999';

export class CommissionPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // SELECTORS
    // ============================================

    // Admin Selectors
    admin = {
        commissionsUrl: `${BASE_URL}/wp-admin/admin.php?page=dokan-dashboard#/commissions`,
        settingsUrl: `${BASE_URL}/wp-admin/admin.php?page=dokan#/settings`,
        settingsNavTab: "div[class='nav-tab nav-tab-active'] div[class='nav-description']",
        sellingOptionsTab: "//div[normalize-space()='Selling Options']",
        commissionTypeDropdown: "select[id='dokan_selling[commission_type]']",
        percentageInput: "#percentage-val-id",
        fixedInput: "//input[@id='fixed-val-id']",
        submitButton: "//input[@id='submit']",
    };

    // Vendor Selectors
    vendor = {
        // Add vendor selectors here
    };

    // Customer Selectors
    customer = {
        // Add customer selectors here
    };

    // Commission Specific Selectors
    commission = {
        // Add commission-specific selectors here
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
        commission: {
            commissionType: 'Fixed',
            percentageValue: '10,00',
            fixedValue: '5,00',
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
    async goToCommissionsPage() {
        await this.page.goto(this.admin.commissionsUrl);
        await this.page.waitForLoadState('networkidle');
    }

    async goToSettingsPage() {
        await this.page.goto(this.admin.settingsUrl);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickSettingsNavTab() {
        await this.page.locator(this.admin.sellingOptionsTab).waitFor({ state: 'visible' });
        await this.page.locator(this.admin.sellingOptionsTab).click();
    }

    async openSellingOptionsTab() {
        const tab = this.page.locator(this.admin.sellingOptionsTab);
        await tab.waitFor({ state: 'visible' });
        await tab.click();
        await this.page.locator(this.admin.commissionTypeDropdown).waitFor({ state: 'visible' });
    }

    async selectCommissionType(type: string) {
        await this.page.selectOption(this.admin.commissionTypeDropdown, type);
    }

    // Click, clear, then type in percentage input (#percentage-val-id).
    async setPercentageValue(value: string) {
        const input = this.page.locator(this.admin.percentageInput).first();
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.clear();
        await input.fill(value);
        //await this.page.locator("//div[@class='fee-recipients dokan-settings-field-type-sub_section']//div[@class='dokan-settings-sub-section sub-section-styles']").click();
    }

    // Click, clear, then type in fixed input.
    async setFixedValue(value: string) {
        const input = this.page.locator(this.admin.fixedInput).first();
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.clear();
        await input.fill(value);
        //await this.page.locator("//div[@class='fee-recipients dokan-settings-field-type-sub_section']//div[@class='dokan-settings-sub-section sub-section-styles']").click();
    }

    async clickSubmitButton() {
        // await Promise.all([
        //     // Wait for the WP form POST to complete before proceeding
        //     this.page.waitForResponse(
        //         res => res.url().includes('wp-admin') && res.request().method() === 'POST'
        //     ),
            this.page.locator(this.admin.submitButton).click(),
        // ]);
        // Wait for the redirect after POST to fully paint
        await this.page.waitForLoadState('domcontentloaded');
        // Allow at least 5s for the settings to be fully persisted
        await this.page.waitForTimeout(5000);
    }

    // Vendor Methods
    // Add vendor methods here

    // Customer Methods
    // Add customer methods here

    // Commission Methods
    // Add commission-specific methods here

    // Wait/Utility Methods
    async waitForTimeout(ms: number) {
        await this.page.waitForTimeout(ms);
    }

    async waitForPageReady() {
        await this.page.waitForLoadState('networkidle');
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
        return await this.page.textContent(selector) || '';
    }

    async isTextVisible(text: string): Promise<boolean> {
        return await this.page.locator(`:text-is("${text}")`).first().isVisible();
    }
}
