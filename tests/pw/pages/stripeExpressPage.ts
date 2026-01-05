import { Page, Locator, expect } from '@playwright/test';

export class stripeExpressPage {
    readonly page: Page;
    
    // Test Data
    readonly testData = {
        // Add test data here as needed
        // Example:
        // stripeAccount: {
        //     email: 'test@example.com',
        // }
    };

    // Admin Locators
    readonly modulesSearchInput: Locator;
    readonly stripeExpressSlider: Locator;

    // Vendor Dashboard Locators
    readonly stripeExpressDashboardLoginButton: Locator;

    // Customer Locators
    // Add locators here

    constructor(page: Page) {
        this.page = page;

        // Admin Locators
        this.modulesSearchInput = page.locator("//div[@class='search-box']//input[@placeholder='Search...']");
        this.stripeExpressSlider = page.locator("//span[@class='slider round']");

        // Vendor Dashboard Locators
        this.stripeExpressDashboardLoginButton = page.locator("//button[@id='dokan-stripe-express-dashboard-login']");
    }

    // Navigation Methods
    async goToModulesPage() {
        const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
        await this.page.goto(`${baseUrl}/wp-admin/admin.php?page=dokan#/modules/`);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async goToStripeExpressSettings() {
        // Admin navigation to Stripe Express settings
        await this.page.goto('/wp-admin/admin.php?page=dokan#/settings');
        await this.page.waitForLoadState('domcontentloaded');
    }

    async goToVendorPaymentSettings() {
        // Vendor navigation to payment settings
        const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
        await this.page.goto(`${baseUrl}/dashboard/settings/payment`);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async goToVendorStripeExpressSettings() {
        // Vendor navigation to Stripe Express payment settings
        const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
        await this.page.goto(`${baseUrl}/dashboard/settings/payment-manage-dokan_stripe_express-edit/`);
        await this.page.waitForLoadState('domcontentloaded');
    }

    // Admin Methods
    async searchAndActivateStripeExpressModule() {
        await this.goToModulesPage();
        
        // Wait for search input to be visible and clickable
        await this.modulesSearchInput.waitFor({ state: 'visible' });
        await this.modulesSearchInput.click();
        
        // Type "Stripe Express" in the search input
        await this.modulesSearchInput.fill('Stripe Express');
        
        // Wait for the page to load/filter results dynamically
        // Wait for the slider to be visible (this indicates the module card has loaded)
        await this.stripeExpressSlider.waitFor({ state: 'visible' });
        
        // Find the associated checkbox - it could be a sibling or parent
        // Try to find checkbox near the slider element
        const sliderContainer = this.stripeExpressSlider.locator('..');
        const checkbox = sliderContainer.locator('input[type="checkbox"]').first();
        
        // Wait for checkbox to be attached
        await checkbox.waitFor({ state: 'attached' });
        
        // Check if slider/checkbox is active
        const isChecked = await checkbox.isChecked();
        
        if (!isChecked) {
            // If not active, click the slider to activate it
            await this.stripeExpressSlider.click();
            // Wait for the activation to complete dynamically
            await expect(checkbox).toBeChecked();
        }
        
        // Verify the module is now active
        await expect(checkbox).toBeChecked();
    }

    async searchAndDeactivateStripeConnectModule() {
        await this.goToModulesPage();
        
        // Wait for search input to be visible and clickable
        await this.modulesSearchInput.waitFor({ state: 'visible' });
        await this.modulesSearchInput.click();
        
        // Type "stripe connect" in the search input
        await this.modulesSearchInput.fill('stripe connect');
        
        // Wait for the page to load/filter results dynamically
        // Wait for the slider to be visible (this indicates the module card has loaded)
        await this.stripeExpressSlider.waitFor({ state: 'visible' });
        
        // Find the associated checkbox - it could be a sibling or parent
        // Try to find checkbox near the slider element
        const sliderContainer = this.stripeExpressSlider.locator('..');
        const checkbox = sliderContainer.locator('input[type="checkbox"]').first();
        
        // Wait for checkbox to be attached
        await checkbox.waitFor({ state: 'attached' });
        
        // Check if slider/checkbox is active
        const isChecked = await checkbox.isChecked();
        
        if (isChecked) {
            // If active, click the slider to deactivate it
            await this.stripeExpressSlider.click();
            // Wait for the deactivation to complete dynamically
            await expect(checkbox).not.toBeChecked();
        }
        // If already deactivated, skip and pass the test
    }

    // Vendor Methods
    async verifyVendorStripeExpressConnection() {
        await this.goToVendorStripeExpressSettings();
        
        // Wait dynamically for the page to load and the button to be visible or not visible
        // First wait for the page to be fully loaded
        await this.page.waitForLoadState('domcontentloaded');
        
        // Wait for the button to either be visible or not visible
        // If visible, it means vendor is connected
        // If not visible, vendor is not connected
        const isVisible = await this.stripeExpressDashboardLoginButton.isVisible().catch(() => false);
        
        if (!isVisible) {
            throw new Error('This Vendor is not conncted with Stripe Express');
        }
        
        // Verify the button is visible (vendor is connected)
        await expect(this.stripeExpressDashboardLoginButton).toBeVisible();
    }

    // Customer Methods
    // Add customer-specific methods here

    // Cleanup Methods
    async cleanup() {
        // Add cleanup logic here if needed
    }
}

