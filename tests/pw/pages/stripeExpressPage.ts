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
    readonly addProductLink: Locator;
    readonly productTitleInput: Locator;
    readonly regularPriceInput: Locator;
    readonly publishButton: Locator;

    // Customer Locators
    readonly addToCartButton: Locator;
    readonly proceedToCheckoutLink: Locator;
    readonly billingFirstName: Locator;
    readonly billingLastName: Locator;
    readonly billingCountry: Locator;
    readonly billingCity: Locator;
    readonly billingState: Locator;
    readonly billingPostcode: Locator;
    readonly stripeExpressPaymentMethod: Locator;
    readonly placeOrderButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Admin Locators
        this.modulesSearchInput = page.locator("//div[@class='search-box']//input[@placeholder='Search...']");
        this.stripeExpressSlider = page.locator("//span[@class='slider round']");

        // Vendor Dashboard Locators
        this.stripeExpressDashboardLoginButton = page.locator("//button[@id='dokan-stripe-express-dashboard-login']");
        this.addProductLink = page.locator("//span[@class='dokan-add-product-link']//a[1]");
        this.productTitleInput = page.locator("//input[@id='post_title']");
        this.regularPriceInput = page.locator('#_regular_price:visible');
        this.publishButton = page.locator("(//input[@id='publish'])[1]");

        // Customer Locators
        this.addToCartButton = page.locator('button:has-text("Add to cart")');
        this.proceedToCheckoutLink = page.getByRole('link', { name: 'Proceed to Checkout' });
        this.billingFirstName = page.locator('#billing_first_name');
        this.billingLastName = page.locator('#billing_last_name');
        this.billingCountry = page.locator('#billing_country');
        this.billingCity = page.locator('#billing_city');
        this.billingState = page.locator('#billing_state');
        this.billingPostcode = page.locator('#billing_postcode');
        this.stripeExpressPaymentMethod = page.getByLabel('Stripe Express');
        this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
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

    async goToVendorProductsPage() {
        // Vendor navigation to products page
        const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
        await this.page.goto(`${baseUrl}/dashboard/products/`);
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

    async createStripeExpressProduct(productTitle: string, price: string) {
        await this.goToVendorProductsPage();
        
        // Wait for add product link to be visible and clickable
        await this.addProductLink.waitFor({ state: 'visible' });
        await this.addProductLink.click();
        
        // Wait for product title input to be visible
        await this.productTitleInput.waitFor({ state: 'visible' });
        await this.productTitleInput.click();
        await this.productTitleInput.fill(productTitle);
        
        // Wait for regular price input to be visible
        await this.regularPriceInput.waitFor({ state: 'visible' });
        await this.regularPriceInput.click();
        await this.regularPriceInput.fill(price);
        
        // Wait for publish button to be visible and clickable
        await this.publishButton.waitFor({ state: 'visible' });
        await this.publishButton.click();
        
        // Wait for the page to update after publishing
        await this.page.waitForLoadState('domcontentloaded');
    }

    // Customer Methods
    async purchaseProductWithStripeExpress(productSlug: string = 'test-stripe-express-p1_v1') {
        const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
        
        // Navigate to product page
        await this.page.goto(`${baseUrl}/product/${productSlug}/`);
        await this.page.waitForLoadState('domcontentloaded');
        
        // Add to cart
        await this.addToCartButton.waitFor({ state: 'visible' });
        await this.addToCartButton.click();
        
        // Wait for "View cart" link or added message to appear
        await this.page.waitForSelector('a.wc-forward, .woocommerce-message', { timeout: 5000 }).catch(() => null);
        
        // Navigate to cart
        await this.page.goto(`${baseUrl}/cart/`);
        await this.page.waitForLoadState('domcontentloaded');
        
        // Proceed to checkout
        await this.proceedToCheckoutLink.waitFor({ state: 'visible' });
        await this.proceedToCheckoutLink.click();
        
        // Navigate to classic checkout
        await this.page.goto(`${baseUrl}/classic-checkout/`);
        await this.page.waitForLoadState('domcontentloaded');
        
        // Fill billing details
        await this.billingFirstName.waitFor({ state: 'visible' });
        await this.billingFirstName.click();
        await this.billingFirstName.fill('Customer1');
        
        await this.billingLastName.click();
        await this.billingLastName.fill('c1');
        
        // Select country - first click the visible textbox to open dropdown
        await this.page.getByRole('textbox', { name: 'United States (US)' }).click();
        // Then interact with the combobox that appears
        await this.page.getByRole('combobox').filter({ hasText: /^$/ }).click();
        await this.page.getByRole('combobox').filter({ hasText: /^$/ }).fill('united states');
        await this.page.getByRole('option', { name: 'United States (US)', exact: true }).click();
        
        // Fill city
        await this.billingCity.click();
        await this.billingCity.fill('New York');
        
        // Select state - first click the visible textbox to open dropdown
        await this.page.getByRole('textbox', { name: 'New York' }).click();
        // Then interact with the combobox that appears
        await this.page.getByRole('combobox').filter({ hasText: /^$/ }).click();
        await this.page.getByRole('combobox').filter({ hasText: /^$/ }).fill('New York');
        await this.page.getByRole('option', { name: 'New York' }).click();
        
        // Fill postcode
        await this.billingPostcode.click();
        await this.billingPostcode.fill('10003');
        
        // Select Stripe Express payment method
        await this.page.getByText('Stripe Express', { exact: true }).click();
        
        // Wait for the correct Stripe iframe (the payment input frame, not Google Pay)
        // This can take 5-6 seconds to load
        await this.page.waitForSelector('iframe[title="Secure payment input frame"]', { state: 'visible', timeout: 15000 });
        const stripeFrame = this.page.locator('iframe[title="Secure payment input frame"]').contentFrame();
        
        // Fill card number
        await stripeFrame.getByRole('textbox', { name: 'Card number' }).click();
        await stripeFrame.getByRole('textbox', { name: 'Card number' }).fill('4242 4242 4242 4242');
        
        // Fill expiry date
        await stripeFrame.getByRole('textbox', { name: 'Expiration date MM / YY' }).click();
        await stripeFrame.getByRole('textbox', { name: 'Expiration date MM / YY' }).fill('11 / 29');
        
        // Fill CVC
        await stripeFrame.getByRole('textbox', { name: 'Security code' }).click();
        await stripeFrame.getByRole('textbox', { name: 'Security code' }).fill('111');
        
        // Place order - scroll into view and wait for it to be ready
        const placeOrderButton = this.page.getByRole('button', { name: 'Place Order' });
        await placeOrderButton.scrollIntoViewIfNeeded();
        await placeOrderButton.waitFor({ state: 'visible' });
        await placeOrderButton.click();
        
        // Wait for payment processing and order completion (can take longer for Stripe)
        await this.page.waitForURL('**/order-received/**', { timeout: 60000 });
        
        // Verify we're on order received page or success
        expect(this.page.url()).toContain('order-received');
    }

    // Cleanup Methods
    async cleanup() {
        // Add cleanup logic here if needed
    }
}

