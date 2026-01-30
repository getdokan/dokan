import { Page } from '@playwright/test';

export class StripeExpressPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ============================================
    // SELECTORS
    // ============================================

    // Admin Selectors
    admin = {
        stripeExpressSettingsUrl: 'http://localhost:9999/wp-admin/admin.php?page=wc-settings&tab=checkout&section=dokan_stripe_express&from=WCADMIN_PAYMENT_SETTINGS',
        stripeExpressEnabledCheckbox: '#woocommerce_dokan_stripe_express_enabled',
        modulesUrl: 'http://localhost:9999/wp-admin/admin.php?page=dokan#/modules',
        searchBox: "div[class='search-box'] input",
        clearSearchButton: "div[class='search-box'] svg",
        moduleSlider: '.slider.round',
        moduleCard: '.module-card',
        moduleTitle: '.module-card h3',
        moduleToggle: '.switch input[type="checkbox"]'
    };

    // Vendor Selectors
    vendor = {
        stripeExpressOnboardingUrl: 'http://localhost:9999/dashboard/settings/payment-manage-dokan_stripe_express/?action=stripe_express_onboarding&seller_id=3&_wpnonce=b3f06f28bd',
        visitExpressDashboardButton: '#dokan-stripe-express-dashboard-login'
    };

    // Customer Selectors
    customer = {
        // Add customer selectors here
    };

    // Stripe Express Specific Selectors
    stripeExpress = {
        // Add Stripe Express specific selectors here
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
        stripeExpress: {
            // Add Stripe Express specific test data here
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
    async adminLogin(username: string, password: string) {
        // Add admin login logic here
    }

    async goToStripeExpressSettings() {
        await this.page.goto(this.admin.stripeExpressSettingsUrl);
        await this.page.waitForLoadState('networkidle');
    }

    async isStripeExpressEnabled(): Promise<boolean> {
        const checkbox = await this.page.locator(this.admin.stripeExpressEnabledCheckbox);
        return await checkbox.isChecked();
    }

    async goToModulesPage() {
        await this.page.goto(this.admin.modulesUrl);
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000); // Wait for modules to load
    }

    async searchModule(moduleName: string) {
        await this.page.fill(this.admin.searchBox, moduleName);
        await this.page.waitForTimeout(1000); // Wait for search results
    }

    async clearSearch() {
        await this.page.click(this.admin.clearSearchButton);
        await this.page.waitForTimeout(1000);
    }

    async getModuleToggleState(moduleName: string): Promise<boolean> {
        // Find the module card by title and get its toggle state
        const moduleCards = await this.page.locator(this.admin.moduleCard).all();
        
        for (const card of moduleCards) {
            const titleText = await card.locator('h3').textContent();
            if (titleText?.includes(moduleName)) {
                const toggle = card.locator(this.admin.moduleToggle);
                return await toggle.isChecked();
            }
        }
        
        throw new Error(`Module "${moduleName}" not found`);
    }

    async toggleModule(moduleName: string, enable: boolean) {
        // Find the module card by title and toggle it
        const moduleCards = await this.page.locator(this.admin.moduleCard).all();
        
        for (const card of moduleCards) {
            const titleText = await card.locator('h3').textContent();
            if (titleText?.includes(moduleName)) {
                const toggle = card.locator(this.admin.moduleToggle);
                const isCurrentlyEnabled = await toggle.isChecked();
                
                // Only click if we need to change the state
                if (isCurrentlyEnabled !== enable) {
                    const slider = card.locator(this.admin.moduleSlider);
                    await slider.click();
                    await this.page.waitForTimeout(1500); // Wait for toggle animation and save
                }
                return;
            }
        }
        
        throw new Error(`Module "${moduleName}" not found`);
    }

    async enableModuleIfDisabled(moduleName: string) {
        const isEnabled = await this.getModuleToggleState(moduleName);
        if (!isEnabled) {
            await this.toggleModule(moduleName, true);
        }
    }

    async disableModuleIfEnabled(moduleName: string) {
        const isEnabled = await this.getModuleToggleState(moduleName);
        if (isEnabled) {
            await this.toggleModule(moduleName, false);
        }
    }

    // Vendor Methods
    async vendorLogin(username: string, password: string) {
        // Add vendor login logic here
    }

    async goToStripeExpressOnboarding() {
        await this.page.goto(this.vendor.stripeExpressOnboardingUrl);
        await this.page.waitForLoadState('networkidle');
    }

    async isVisitExpressDashboardButtonVisible(): Promise<boolean> {
        try {
            const button = this.page.locator(this.vendor.visitExpressDashboardButton);
            await button.waitFor({ state: 'visible', timeout: 5000 });
            return await button.isVisible();
        } catch {
            return false;
        }
    }

    async getVisitExpressDashboardButtonText(): Promise<string> {
        const button = this.page.locator(this.vendor.visitExpressDashboardButton);
        const text = await button.textContent();
        return text?.trim() || '';
    }

    // Customer Methods
    async customerLogin(username: string, password: string) {
        // Add customer login logic here
    }

    // Stripe Express Methods
    async connectStripeExpress() {
        // Add Stripe Express connection logic here
    }

    async disconnectStripeExpress() {
        // Add Stripe Express disconnection logic here
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
