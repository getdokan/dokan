import { Page, Locator } from '@playwright/test';

import { toPath } from '@utils/helpers';

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
        settingsUrl: toPath(`wp-admin/admin.php?page=dokan#/settings`),
        // Sidebar nav tab is a `<div class="nav-tab">` whose `.nav-title` holds the
        // section name. Targeting the inner `.nav-title` (rather than xpath text
        // match) avoids matching the page heading which uses the same string.
        sellingOptionsNavTitle: 'div.nav-tab div.nav-title',
        commissionTypeDropdown: "select[id='dokan_selling[commission_type]']",
        percentageInput: '#percentage-val-id',
        fixedInput: '#fixed-val-id',
        // Category-based inputs share IDs across rows (one row per category +
        // a default row). The first visible pair is the default-commission row.
        categoryBasedPercentageInput: '#percentage_commission',
        categoryBasedFixedInput: '#fixed_commission',
        submitButton: "input[type='submit'][name='submit']",

        // New product (post-new.php?post_type=product)
        newProductUrl: toPath(`wp-admin/post-new.php?post_type=product`),
        productTitleInput: '#title',
        generalProductDataLink: "a[href='#general_product_data']",
        regularPriceInput: '#_regular_price',
        salePriceInput: '#_sale_price',
        advancedProductDataLink: "a[href='#advanced_product_data']",
        adminCommissionInput: '#admin_commission',
        perProductAdminFeeInput: "input[name='_per_product_admin_additional_fee']",
        publishButton: '#publish',
    };

    // ============================================
    // TEST DATA
    // ============================================

    testData = {
        commission: {
            commissionType: 'fixed',           // <option value="fixed">Fixed</option>
            categoryBasedType: 'category_based', // <option value="category_based">Category Based</option>
            percentageValue: '10,00',
            fixedValue: '5,00',
            categoryBasedValue: '5',
        },
        product: {
            title: 'Test Commission Specific Admin 1',
            regularPrice: '150',
            salePrice: '120',
            adminCommission: '15',
            perProductAdminFee: '15',
        },
    };

    // ============================================
    // HELPERS
    // ============================================

    private sellingOptionsTab(): Locator {
        return this.page.locator(this.admin.sellingOptionsNavTitle, { hasText: /^\s*Selling Options\s*$/ });
    }

    async goToSettingsPage() {
        await this.page.goto(this.admin.settingsUrl);
        await this.page.waitForLoadState('domcontentloaded');
        // Vue settings shell needs a moment to mount the nav.
        await this.sellingOptionsTab().waitFor({ state: 'visible', timeout: 20000 });
    }

    async openSellingOptionsTab() {
        const tab = this.sellingOptionsTab();
        await tab.scrollIntoViewIfNeeded();
        // Settings page has a sticky header / overlays that occasionally
        // intercept the click — force past the actionability check.
        await tab.click({ force: true });
        await this.page.locator(this.admin.commissionTypeDropdown).waitFor({ state: 'visible', timeout: 20000 });
    }

    async selectCommissionType(value: string) {
        await this.page.selectOption(this.admin.commissionTypeDropdown, value);
        // Switching commission type swaps the form fields — give the DOM a beat.
        await this.page.waitForTimeout(800);
    }

    async setPercentageValue(value: string) {
        const input = this.page.locator(this.admin.percentageInput).first();
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.fill('');
        await input.fill(value);
    }

    async setFixedValue(value: string) {
        const input = this.page.locator(this.admin.fixedInput).first();
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.fill('');
        await input.fill(value);
    }

    async setCategoryBasedPercentageValue(value: string) {
        const input = this.page.locator(this.admin.categoryBasedPercentageInput).first();
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.fill('');
        await input.fill(value);
    }

    async setCategoryBasedFixedValue(value: string) {
        const input = this.page.locator(this.admin.categoryBasedFixedInput).first();
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.fill('');
        await input.fill(value);
    }

    async clickSubmitButton() {
        await this.page.locator(this.admin.submitButton).first().click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ---- New product (commission-specific) ----
    async goToNewProductPage() {
        await this.page.goto(this.admin.newProductUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.locator(this.admin.productTitleInput).waitFor({ state: 'visible', timeout: 20000 });
    }

    async setProductTitle(title: string) {
        const input = this.page.locator(this.admin.productTitleInput);
        await input.click();
        await input.fill(title);
    }

    async clickGeneralProductData() {
        const link = this.page.locator(this.admin.generalProductDataLink);
        await link.waitFor({ state: 'visible' });
        await link.click();
    }

    async setRegularPrice(value: string) {
        const input = this.page.locator(this.admin.regularPriceInput).first();
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.fill('');
        // pressSequentially fires keydown/keypress/input/keyup per character so WC price JS picks it up
        await input.pressSequentially(value, { delay: 80 });
        await input.blur();
    }

    async setSalePrice(value: string) {
        const input = this.page.locator(this.admin.salePriceInput).first();
        await input.waitFor({ state: 'visible' });
        await input.click();
        await input.fill('');
        await input.pressSequentially(value, { delay: 80 });
        await input.blur();
    }

    async clickAdvancedProductData() {
        const link = this.page.locator(this.admin.advancedProductDataLink);
        await link.waitFor({ state: 'visible' });
        await link.click();
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
        const btn = this.page.locator(this.admin.publishButton);
        await btn.waitFor({ state: 'visible' });
        await btn.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async waitForPageReady() {
        await this.page.waitForLoadState('load');
    }

    async waitForTimeout(ms: number) {
        await this.page.waitForTimeout(ms);
    }
}
