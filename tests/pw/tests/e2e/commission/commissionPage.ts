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
        // Category Based commission inputs (long CSS paths from DOM)
        categoryBasedPercentageInput: "body > div:nth-child(3) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(5) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(9) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > form:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(4) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > input:nth-child(1)",
        categoryBasedFixedInput: "body > div:nth-child(3) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(5) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(9) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > form:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(4) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > input:nth-child(2)",
        // New product (post-new.php?post_type=product)
        newProductUrl: `${BASE_URL}/wp-admin/post-new.php?post_type=product`,
        productTitleInput: "//input[@id='title']",
        generalProductDataLink: "//a[@href='#general_product_data']",
        regularPriceInput: "#_regular_price",
        salePriceInput: "#_sale_price",
        advancedProductDataLink: "//a[@href='#advanced_product_data']",
        adminCommissionInput: "//input[@id='admin_commission']",
        perProductAdminFeeInput: "//input[@name='_per_product_admin_additional_fee']",
        publishButton: "//input[@id='publish']",
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
            categoryBasedType: 'Category Based',
            categoryBasedValue: '5',
        },
        product: {
            title: 'Test Commission Specific Admin 1',
            regularPrice: '150',
            salePrice: '120',
            adminCommission: '15',
            perProductAdminFee: '15',
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
        await this.page.waitForLoadState('load');
    }

    async goToSettingsPage() {
        await this.page.goto(this.admin.settingsUrl);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickSettingsNavTab() {
        const tab = this.page.locator(this.admin.sellingOptionsTab);
        await tab.waitFor({ state: 'visible' });
        // Settings page has a sticky header that can intercept clicks on the side nav
        // item during layout shifts. Force past the actionability check.
        await tab.click({ force: true });
    }

    async openSellingOptionsTab() {
        // The settings page renders a zero-sized `.loading` overlay that Playwright
        // keeps flagging as an interceptor. It is purely visual — bypass the hit-test
        // by force-clicking.
        const tab = this.page.locator(this.admin.sellingOptionsTab);
        await tab.waitFor({ state: 'visible' });
        await tab.click({ force: true });
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
    }

    // Category Based: click, clear, type in first (percentage) input.
    async setCategoryBasedPercentageValue(value: string) {
        const input = this.page.locator(this.admin.categoryBasedPercentageInput).first();
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.clear();
        await input.fill(value);
    }

    // Category Based: click, clear, type in second (fixed) input.
    async setCategoryBasedFixedValue(value: string) {
        const input = this.page.locator(this.admin.categoryBasedFixedInput).first();
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.clear();
        await input.fill(value);
    }

    async clickSubmitButton() {
        await this.page.waitForTimeout(500);
        await this.page.locator(this.admin.submitButton).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    // New product (commission-specific) methods
    async goToNewProductPage() {
        await this.page.goto(this.admin.newProductUrl);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async setProductTitle(title: string) {
        const input = this.page.locator(this.admin.productTitleInput);
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.fill(title);
    }

    async clickGeneralProductData() {
        await this.page.locator(this.admin.generalProductDataLink).waitFor({ state: 'visible' });
        await this.page.locator(this.admin.generalProductDataLink).click();
    }

    async setRegularPrice(value: string) {
        const input = this.page.locator(this.admin.regularPriceInput).first();
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.clear();
        // pressSequentially fires keydown/keypress/input/keyup per character so WooCommerce price JS picks it up
        await input.pressSequentially(value, { delay: 100 });
        await input.blur();
        await this.page.waitForTimeout(500);
    }

    async setSalePrice(value: string) {
        const input = this.page.locator(this.admin.salePriceInput).first();
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.clear();
        await input.pressSequentially(value, { delay: 100 });
        await input.blur();
        await this.page.waitForTimeout(500);
    }

    async clickAdvancedProductData() {
        await this.page.locator(this.admin.advancedProductDataLink).waitFor({ state: 'visible' });
        await this.page.locator(this.admin.advancedProductDataLink).click();
    }

    async setAdminCommission(value: string) {
        const input = this.page.locator(this.admin.adminCommissionInput);
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.fill(value);
    }

    async setPerProductAdminFee(value: string) {
        const input = this.page.locator(this.admin.perProductAdminFeeInput);
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.fill(value);
    }

    async clickPublishButton() {
        await this.page.locator(this.admin.publishButton).waitFor({ state: 'visible' });
        await this.page.locator(this.admin.publishButton).click();
        await this.page.waitForLoadState('domcontentloaded');
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
        return await this.page.textContent(selector) || '';
    }

    async isTextVisible(text: string): Promise<boolean> {
        return await this.page.locator(`:text-is("${text}")`).first().isVisible();
    }
}
