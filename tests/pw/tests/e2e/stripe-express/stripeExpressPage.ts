import { Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9999';

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
        stripeExpressSettingsUrl: `${BASE_URL}/wp-admin/admin.php?page=wc-settings&tab=checkout&section=dokan_stripe_express&from=WCADMIN_PAYMENT_SETTINGS`,
        stripeExpressEnabledCheckbox: '#woocommerce_dokan_stripe_express_enabled',
        modulesUrl: `${BASE_URL}/wp-admin/admin.php?page=dokan#/modules`,
        searchBox: "div[class='search-box'] input",
        clearSearchButton: "div[class='search-box'] svg",
        moduleSlider: '.slider.round',
        moduleCard: '.module-card',
        moduleTitle: '.module-card h3',
        moduleToggle: '.switch input[type="checkbox"]'
    };

    // Vendor Selectors
    vendor = {
        vendor1: {
            stripeExpressOnboardingUrl: `${BASE_URL}/dashboard/settings/payment-manage-dokan_stripe_express/?action=stripe_express_onboarding&seller_id=3&_wpnonce=b3f06f28bd`,
        },
        vendor2: {
            stripeExpressOnboardingUrl: `${BASE_URL}/dashboard/settings/payment-manage-dokan_stripe_express/?action=stripe_express_onboarding&seller_id=5&_wpnonce=e96cdf408f`,
        },
        visitExpressDashboardButton: '#dokan-stripe-express-dashboard-login'
    };

    // Customer Selectors
    customer = {
        shopUrl: `${BASE_URL}/shop/`,
        checkoutUrl: `${BASE_URL}/checkout/`,
        addToCartProduct1: "//a[@aria-label='Add to cart: \"p1_v1 (simple)\"']",
        addToCartProduct2: "a[aria-label='Add to cart: \"p1_v2 (simple)\"']",
        addToCartButtons: "a.add_to_cart_button, button.add_to_cart_button",
        stripeExpressPaymentMethod: "span[id='radio-control-wc-payment-method-options-dokan_stripe_express__label'] span[class='wc-block-components-payment-method-label']",
        placeOrderButton: "//div[@class='wc-block-components-checkout-place-order-button__text']",
        stripeIframeName: '__privateStripeFrame5856',
        orderReceivedTitle: '.woocommerce-order-received__title, .woocommerce-notice--success'
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
    async adminLogin(_username: string, _password: string) {
        // Add admin login logic here
    }

    async goToStripeExpressSettings() {
        await this.page.goto(this.admin.stripeExpressSettingsUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
    }

    async isStripeExpressEnabled(): Promise<boolean> {
        const checkbox = await this.page.locator(this.admin.stripeExpressEnabledCheckbox);
        return await checkbox.isChecked();
    }

    async goToModulesPage() {
        await this.page.goto(this.admin.modulesUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(3000); // Wait for modules to load
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
    async vendorLogin(_username: string, _password: string) {
        // Add vendor login logic here
    }

    async goToStripeExpressOnboarding(vendorNumber: 1 | 2 = 1) {
        const url = vendorNumber === 1 
            ? this.vendor.vendor1.stripeExpressOnboardingUrl 
            : this.vendor.vendor2.stripeExpressOnboardingUrl;
        await this.page.goto(url);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
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
    async customerLogin(_username: string, _password: string) {
        // Add customer login logic here
    }

    async goToShop() {
        await this.page.goto(this.customer.shopUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(2000); // Wait for products to load
    }

    async goToCheckout() {
        await this.page.goto(this.customer.checkoutUrl);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(3000); // Extra time for checkout page to load
    }

    async addProduct1ToCart() {
        try {
            // Try specific product first
            const product1 = this.page.locator(this.customer.addToCartProduct1);
            await product1.waitFor({ state: 'visible', timeout: 5000 });
            await product1.click();
        } catch {
            // If specific product not found, click the first available add to cart button
            const firstProduct = this.page.locator(this.customer.addToCartButtons).first();
            await firstProduct.waitFor({ state: 'visible', timeout: 10000 });
            await firstProduct.click();
        }
        await this.page.waitForTimeout(2000); // Wait for cart to update
    }

    async addProduct2ToCart() {
        try {
            // Try specific product first
            const product2 = this.page.locator(this.customer.addToCartProduct2);
            await product2.waitFor({ state: 'visible', timeout: 5000 });
            await product2.click();
        } catch {
            // If specific product not found, click the second available add to cart button
            const secondProduct = this.page.locator(this.customer.addToCartButtons).nth(1);
            await secondProduct.waitFor({ state: 'visible', timeout: 10000 });
            await secondProduct.click();
        }
        await this.page.waitForTimeout(2000); // Wait for cart to update
    }

    async selectStripeExpressPayment() {
        // Click on "Stripe Express" text to select the payment method
        await this.page.getByText('Stripe Express').click();
        // Wait for Stripe iframe to load
        await this.page.waitForTimeout(3000);
        
        // Try clicking on any "Card" button or payment method selector on the main page
        try {
            // Look for a Card button or payment method option on the checkout page (outside iframe)
            const cardButtons = [
                this.page.getByRole('button', { name: 'Card' }),
                this.page.getByText('Credit or debit card'),
                this.page.getByText('Card', { exact: true }),
                this.page.locator('button:has-text("Card")'),
                this.page.locator('[data-testid*="card"], [class*="card-button"]')
            ];
            
            for (const button of cardButtons) {
                try {
                    if (await button.isVisible({ timeout: 1000 })) {
                        await button.click();
                        console.log('Clicked Card button on main page');
                        await this.page.waitForTimeout(2000);
                        break;
                    }
                } catch {}
            }
        } catch (e) {
            console.log('No Card button found on main page');
        }
        
        // After selecting Stripe Express, we need to click on "Card" to show the card input form
        // The payment element shows multiple options: Card, WeChat Pay, Crypto, etc.
        try {
            // Find the iframe with the payment element
            const frames = this.page.frames();
            for (const frame of frames) {
                const frameName = frame.name();
                if (frameName.includes('__privateStripeFrame')) {
                    const frameLocator = this.page.locator(`iframe[name="${frameName}"]`).contentFrame();
                    const content = await frameLocator.locator('body').innerHTML().catch(() => '');
                    
                    if (content.includes('p-PaymentElement')) {
                        console.log('Found payment element frame:', frameName);
                        
                        // Click on "Card" option to expand the card payment form
                        try {
                            // Wait for "Card" option to be visible and click it
                            const cardOption = frameLocator.getByText('Card', { exact: true });
                            await cardOption.waitFor({ state: 'visible', timeout: 5000 });
                            await cardOption.click();
                            console.log('✓ Clicked "Card" option to expand card form');
                            await this.page.waitForTimeout(3000);
                            break;
                        } catch (e) {
                            console.log('Could not click Card option:', (e as Error).message);
                            // Try alternative selectors for Card
                            try {
                                await frameLocator.locator('button:has-text("Card"), div:has-text("Card")').first().click({ timeout: 3000 });
                                console.log('✓ Clicked Card using alternative selector');
                                await this.page.waitForTimeout(3000);
                                break;
                            } catch {}
                        }
                    }
                }
            }
        } catch (e) {
            console.log('Error finding/clicking Card option:', (e as Error).message);
        }
        
        // Wait for card form to fully load after clicking Card
        await this.page.waitForTimeout(3000);
    }

    async fillStripeCardDetails() {
        // Wait longer for Stripe to fully initialize
        await this.page.waitForTimeout(8000);
        
        const frames = this.page.frames();
        let stripeFrame = null;
        const allStripeFrames: string[] = [];
        
        console.log('Total frames found:', frames.length);
        
        // Collect all Stripe frames
        for (const frame of frames) {
            const frameName = frame.name();
            if (frameName.includes('__privateStripeFrame')) {
                allStripeFrames.push(frameName);
            }
        }
        
        console.log('Stripe frames:', allStripeFrames);
        
        // Try each Stripe frame to find the one with card inputs
        for (const frameName of allStripeFrames) {
            const frameLocator = this.page.locator(`iframe[name="${frameName}"]`).contentFrame();
            
            // Check if this frame contains card input fields
            const hasCardInput = await frameLocator.locator('input[name="number"], input[id*="numberInput"], #payment-numberInput').count().catch(() => 0);
            console.log(`Frame ${frameName} has ${hasCardInput} card inputs`);
            
            if (hasCardInput > 0) {
                stripeFrame = frameLocator;
                console.log('✓ Found Stripe card form iframe:', frameName);
                break;
            }
        }

        // If we still haven't found it, try the last Stripe frame (card form is often the last one loaded)
        if (!stripeFrame && allStripeFrames.length > 0) {
            console.log('Card inputs not detected, trying last Stripe iframe as fallback');
            const lastFrameName = allStripeFrames[allStripeFrames.length - 1]!;
            stripeFrame = this.page.locator(`iframe[name="${lastFrameName}"]`).contentFrame();
            console.log('Using last Stripe frame:', lastFrameName);
        }
        
        if (!stripeFrame) {
            console.log('Could not find any Stripe iframes');
            throw new Error('Stripe iframe not found');
        }
        
        // Try to click on Card payment method button (may not always be visible/needed)
        try {
            await stripeFrame.getByRole('button', { name: 'Card' }).click({ timeout: 3000 });
            await this.page.waitForTimeout(2000);
        } catch {
            // Card button may not be present or already selected, continue
        }
        
        // Wait for form to be fully ready and loaded
        await this.page.waitForTimeout(2000);
        
        // Use direct CSS selectors (jQuery-style) based on the actual HTML structure
        // Card Number: id="payment-numberInput", name="number"
        try {
            const cardNumberField = stripeFrame.locator('#payment-numberInput').first();
            await cardNumberField.waitFor({ state: 'visible', timeout: 10000 });
            await cardNumberField.click();
            await cardNumberField.fill('4242 4242 4242 4242');
            console.log('Card number filled successfully');
        } catch (e) {
            console.log('Failed with #payment-numberInput, trying name selector:', (e as Error).message);
            try {
                const cardNumberField = stripeFrame.locator('input[name="number"]').first();
                await cardNumberField.waitFor({ state: 'visible', timeout: 5000 });
                await cardNumberField.click();
                await cardNumberField.fill('4242 4242 4242 4242');
                console.log('Card number filled using name selector');
            } catch (e2) {
                console.log('Failed with name selector, trying autocomplete:', (e2 as Error).message);
                const cardNumberField = stripeFrame.locator('input[autocomplete="cc-number"]').first();
                await cardNumberField.waitFor({ state: 'visible', timeout: 5000 });
                await cardNumberField.click();
                await cardNumberField.fill('4242 4242 4242 4242');
                console.log('Card number filled using autocomplete selector');
            }
        }
        await this.page.waitForTimeout(500);
        
        // Expiration Date: id="payment-expiryInput", name="expiry"
        try {
            await stripeFrame.locator('#payment-expiryInput').fill('11 / 29');
            console.log('Expiry filled successfully');
        } catch {
            await stripeFrame.locator('input[name="expiry"]').first().fill('11 / 29');
            console.log('Expiry filled using name selector');
        }
        await this.page.waitForTimeout(500);
        
        // Security Code: id="payment-cvcInput", name="cvc"
        try {
            await stripeFrame.locator('#payment-cvcInput').fill('111');
            console.log('CVC filled successfully');
        } catch {
            await stripeFrame.locator('input[name="cvc"]').first().fill('111');
            console.log('CVC filled using name selector');
        }
        await this.page.waitForTimeout(1000);
    }

    async placeOrder() {
        // Click the Place Order button using the correct locator
        const placeOrderButton = this.page.locator(this.customer.placeOrderButton);
        await placeOrderButton.waitFor({ state: 'visible', timeout: 10000 });
        await placeOrderButton.click();
        console.log('✓ Place Order button clicked');
        
        // Wait for order processing and redirect to order received page
        // Wait for URL to change to order-received or checkout-confirmation
        try {
            console.log('Waiting for URL to change to order-received...');
            await this.page.waitForURL('**/order-received/**', { timeout: 60000 });
            console.log('✓ Navigated to order-received page');
        } catch (e) {
            console.log('URL did not change to order-received, checking current URL...');
            console.log('Current URL:', this.page.url());
            // Fallback: wait for any navigation
            try {
                await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
            } catch {}
        }
        
        await this.page.waitForTimeout(2000);
    }

    async isOrderPlacedSuccessfully(): Promise<boolean> {
        try {
            // Check if we're on the order received page
            const url = this.page.url();
            console.log('Current URL after order:', url);
            
            if (url.includes('order-received')) {
                console.log('✓ Order received page detected by URL');
                return true;
            }
            
            // Check for success elements
            const successSelectors = [
                '.woocommerce-order-received__title',
                '.woocommerce-notice--success',
                '.woocommerce-thankyou-order-received',
                'h1:has-text("Order received")',
                'text=Thank you. Your order has been received'
            ];
            
            for (const selector of successSelectors) {
                try {
                    const element = this.page.locator(selector).first();
                    if (await element.isVisible({ timeout: 5000 })) {
                        console.log(`✓ Success element found: ${selector}`);
                        return true;
                    }
                } catch {
                    continue;
                }
            }
            
            console.log('✗ No success indicators found');
            return false;
        } catch (e) {
            console.log('Error checking order success:', (e as Error).message);
            return false;
        }
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
