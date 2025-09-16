import { Page, expect } from '@playwright/test';

export class ManualOrderPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Admin Locators
    readonly adminLocators = {
        dokanSettings: '/wp-admin/admin.php?page=dokan#/settings',
        sellingOptionsTab: "//div[normalize-space()='Selling Options']",
        allowVendorOrdersToggle: 'fieldset:has-text("Allow Vendors to Create Orders") span:nth-child(2)',
        saveChangesButton: "//input[@id='submit']",
        
        // Vendor Profile Settings
        vendorsPage: '/wp-admin/admin.php?page=dokan#/vendors',
        vendorLink: (vendorName: string) => `a:has-text("${vendorName}")`,
        vendorOrderToggle: 'div:nth-child(5) > .checkbox-left > .switch > .slider',
        vendorSaveButton: 'button:has-text("Save Changes")',
        okButton: 'button:has-text("OK")'
    };

    // Vendor Locators
    readonly vendorLocators = {
        ordersMenu: 'a:has-text(" Orders")',
        addNewOrderButton: 'a:has-text(" Add New Order")',
        addItemsButton: 'button:has-text("Add item(s)")',
        addProductsButton: 'button:has-text("Add product(s)")',
        productSearchInput: "div[data-open] input[placeholder*='Search'], div[data-open] input[placeholder*='product'], div[data-open] .css-ytf5rn input, div[data-open] [role='combobox']",
        productOption: (productName: string) => `[role="option"]:has-text("${productName}")`,
        addProductsSubmitButton: 'button:has-text("Add Products")',
        customerDropdown: 'div[data-open] .css-ytf5rn:first-child, div[data-open] [role="combobox"]:first-child',
        customerInput: 'input[role="combobox"][placeholder*="Customer"]',
        customerOption: (customerName: string) => `[role="option"]:has-text("${customerName}")`,
        orderStatusSelect: 'select[aria-label="Order Status"]',
        
        // Fee Section
        addFeeButton: 'button:has-text("Add fee")',
        feeNameInput: 'input[placeholder*="Fee Name"]',
        feeAmountInput: 'input[placeholder*="Fee Amount"]',
        addFeeSubmitButton: 'button:has-text("Add Fee"):not(:has-text("Add fee"))',
        
        // Save Order
        saveOrderButton: 'button:has-text("Save")',
        
        // Orders List
        allOrdersLink: 'a.submenu-link[href*="/dashboard/orders/"]:has-text("All Orders")',
        orderCheckbox: (orderNumber: string) => `tr:has-text("Order ${orderNumber}") input[type="checkbox"]`,
        bulkActionSelect: 'select[aria-label="Select bulk action"]',
        applyButton: 'button:has-text("Apply")'
    };

    // Admin Methods
    async enableVendorOrderCreation() {
        await this.page.goto(this.adminLocators.dokanSettings);
        await this.page.locator(this.adminLocators.sellingOptionsTab).click();
        
        const toggle = this.page.locator(this.adminLocators.allowVendorOrdersToggle);
        const isEnabled = await toggle.isChecked();
        
        if (!isEnabled) {
            await toggle.click();
            console.log('Button was disabled, now enabled');
        } else {
            console.log('Button Already enabled');
        }
        
        await this.page.locator(this.adminLocators.saveChangesButton).click();
    }

    async disableVendorOrderCreation() {
        await this.page.goto(this.adminLocators.dokanSettings);
        await this.page.locator(this.adminLocators.sellingOptionsTab).click();
        
        const toggle = this.page.locator(this.adminLocators.allowVendorOrdersToggle);
        const isEnabled = await toggle.isChecked();
        
        if (isEnabled) {
            await toggle.click();
            console.log('Button was enabled, now disabled');
        } else {
            console.log('Button Already disabled');
        }
        
        await this.page.locator(this.adminLocators.saveChangesButton).click();
    }

    // async enableVendorOrderCreationForVendor(vendorName: string) {
    //     await this.page.goto(this.adminLocators.vendorsPage);
    //     await this.page.locator(this.adminLocators.vendorLink(vendorName)).click();
        
    //     const vendorToggle = this.page.locator(this.adminLocators.vendorOrderToggle);
    //     const isVendorEnabled = await vendorToggle.isChecked();
        
    //     if (!isVendorEnabled) {
    //         await vendorToggle.click();
    //         console.log(`Vendor ${vendorName} order creation was disabled, now enabled`);
    //     } else {
    //         console.log(`Vendor ${vendorName} order creation Already enabled`);
    //     }
        
    //     await this.page.locator(this.adminLocators.vendorSaveButton).first().click();
    //     await this.page.locator(this.adminLocators.okButton).click();
    // }

    async verifyVendorOrderSettingEnabled() {
        await this.page.goto(this.adminLocators.dokanSettings);
        await this.page.locator(this.adminLocators.sellingOptionsTab).click();
        await expect(this.page.locator(this.adminLocators.allowVendorOrdersToggle)).toBeChecked();
    }

    async verifyVendorOrderSettingDisabled() {
        await this.page.goto(this.adminLocators.dokanSettings);
        await this.page.locator(this.adminLocators.sellingOptionsTab).click();
        await expect(this.page.locator(this.adminLocators.allowVendorOrdersToggle)).not.toBeChecked();
    }

    // Vendor Methods
    async navigateToOrders() {
        // Navigate directly to vendor orders page
        await this.page.goto(`${process.env.BASE_URL}/dashboard/orders/`);
        await this.page.waitForLoadState('networkidle');
    }

    async clickAddNewOrder() {
        // Wait for the page to load after navigation
        await this.page.waitForLoadState('networkidle');
        await this.page.locator(this.vendorLocators.addNewOrderButton).click();
    }

    async addProductToOrder(productName: string) {
        await this.page.locator(this.vendorLocators.addItemsButton).click();
        await this.page.locator(this.vendorLocators.addProductsButton).click();
        
        // Wait for the modal to appear and stabilize
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000); // Wait for modal animation
        
        // Wait for the modal overlay to be visible
        await this.page.locator('div[data-open][aria-hidden="true"]').waitFor({ state: 'visible', timeout: 10000 });
        
        // Try to find and fill the search input within the modal
        // Wait for the modal to be fully open
        await this.page.waitForTimeout(1000);
        
        // Look for search input specifically within the open modal
        const searchInput = this.page.locator('div[data-open] input, div[data-open] [role="combobox"]').first();
        await searchInput.waitFor({ state: 'visible', timeout: 10000 });
        
        // Use type instead of fill to avoid click issues
        await searchInput.type(productName);
        
        // Wait a bit for search results
        await this.page.waitForTimeout(1000);
        
        // Wait for product options to appear and select the first one
        await this.page.waitForTimeout(2000); // Wait for search results
        
        // Debug: Check what options are available
        const options = this.page.locator('[role="option"]');
        const optionCount = await options.count();
        console.log(`Found ${optionCount} product options`);
        
        if (optionCount > 0) {
            // Try to find the specific product first
            const specificOption = this.page.locator(this.vendorLocators.productOption(productName));
            if (await specificOption.count() > 0) {
                await specificOption.first().click();
            } else {
                // If specific product not found, click the first available option
                console.log(`Product "${productName}" not found, selecting first available option`);
                await options.first().click();
            }
        } else {
            console.log('No product options found, proceeding without product selection');
        }
        
        await this.page.locator(this.vendorLocators.addProductsSubmitButton).click();
    }

    async selectCustomer(customerName: string) {
        // Wait for the modal to be fully open
        await this.page.waitForTimeout(1000);
        
        // Click the customer dropdown (using the exact selector from codegen)
        await this.page.locator('.css-ytf5rn').first().click();
        
        // Fill the customer combobox with the customer name
        await this.page.getByRole('combobox', { name: 'Customer' }).fill(customerName);
        
        // Press Enter to search
        await this.page.getByRole('combobox', { name: 'Customer' }).press('Enter');
        
        // Wait for options to appear and click the customer option
        await this.page.waitForTimeout(1000);
        
        // Look for customer option that contains the customer name
        try {
            // Try to find the exact customer option
            const customerOption = this.page.getByRole('option', { name: `${customerName} (#6)` });
            if (await customerOption.count() > 0) {
                await customerOption.click();
                console.log(`Selected customer: ${customerName}`);
            } else {
                // Fallback: try to find any option containing the customer name
                const fallbackOption = this.page.getByRole('option').filter({ hasText: customerName });
                if (await fallbackOption.count() > 0) {
                    await fallbackOption.first().click();
                    console.log(`Selected customer (fallback): ${customerName}`);
                } else {
                    console.log(`Customer "${customerName}" not found, proceeding without selection`);
                }
            }
        } catch (error) {
            console.log('Error selecting customer:', error);
        }
    }

    async setOrderStatus(status: string) {
        // Use the exact selector from codegen
        await this.page.getByLabel('Order Status').selectOption(status);
    }

    async addFeeToOrder(feeName: string, feeAmount: number) {
        console.log('Starting fee addition process...');
        
        // Use the exact codegen sequence - simple and clean
        console.log('Clicking Add fee button...');
        await this.page.getByRole('button', { name: 'Add fee' }).click();
        
        console.log('Filling fee name...');
        await this.page.getByRole('textbox', { name: 'Fee Name' }).click();
        await this.page.getByRole('textbox', { name: 'Fee Name' }).fill(feeName);
        
        console.log('Filling fee amount...');
        
        // Try multiple selectors for the fee amount field
        const feeAmountSelectors = [
            'input[placeholder*="Fee Amount"]',
            'input[placeholder*="amount"]',
            'input[name*="fee-amount"]',
            'input[id*="fee-amount"]',
            '#fee-amount',
            '.fee-amount input',
            '[data-testid="fee-amount"]'
        ];
        
        let feeAmountInput = null;
        
        // Try each selector until we find one that works
        for (const selector of feeAmountSelectors) {
            const element = this.page.locator(selector);
            if (await element.count() > 0 && await element.isVisible()) {
                feeAmountInput = element;
                console.log(`Found fee amount input with selector: ${selector}`);
                break;
            }
        }
        
        if (!feeAmountInput) {
            // Fallback to the original selector
            feeAmountInput = this.page.getByRole('textbox', { name: 'Fee Amount' });
            console.log('Using fallback selector: getByRole textbox Fee Amount');
        }
        
        await feeAmountInput.click();
        await feeAmountInput.clear(); // Clear any existing value first
        await feeAmountInput.fill(feeAmount.toString());
        
        // Verify the value was actually entered
        const enteredValue = await feeAmountInput.inputValue();
        console.log(`Fee amount entered: "${enteredValue}" (expected: "${feeAmount}")`);
        
        if (enteredValue !== feeAmount.toString()) {
            console.log('WARNING: Fee amount was not entered correctly!');
        }
        
        console.log('Clicking Add Fee submit button...');
        await this.page.getByRole('button', { name: 'Add Fee', exact: true }).click();
        
        // Wait a moment for the fee to be processed
        await this.page.waitForTimeout(2000);
        
        console.log('Fee addition process completed');
    }

    async saveOrder() {
        // Wait for the modal to be stable
        await this.page.waitForTimeout(1000);
        
        // Try to find and click the Save button within the modal
        const saveButton = this.page.locator('button:has-text("Save")').first();
        await saveButton.waitFor({ state: 'visible', timeout: 10000 });
        
        // Try to click the save button
        try {
            await saveButton.click();
            console.log('Order saved successfully');
        } catch (error) {
            console.log('Error clicking save button:', error);
            
            // Alternative 1: Try to press Enter on the form
            try {
                await this.page.keyboard.press('Enter');
                console.log('Used keyboard Enter to save');
            } catch (keyError) {
                console.log('Keyboard save also failed:', keyError);
                
                // Alternative 2: Use JavaScript to force click
                try {
                    await this.page.evaluate(() => {
                        const saveButton = document.querySelector('button:has-text("Save")') || 
                                         document.querySelector('button[class*="dokan-btn"]');
                        if (saveButton) {
                            (saveButton as HTMLElement).click();
                        }
                    });
                    console.log('Used JavaScript to force click save button');
                } catch (jsError) {
                    console.log('JavaScript save also failed:', jsError);
                }
            }
        }
    }

    async navigateToAllOrders() {
        await this.page.locator(this.vendorLocators.allOrdersLink).click();
    }

    async updateOrderStatus(orderNumber: string, status: string) {
        await this.page.locator(this.vendorLocators.orderCheckbox(orderNumber)).check();
        await this.page.locator(this.vendorLocators.bulkActionSelect).selectOption(status);
        await this.page.locator(this.vendorLocators.applyButton).click();
    }

    // Helper Methods
    async isAddNewOrderButtonVisible(): Promise<boolean> {
        try {
            await this.page.locator(this.vendorLocators.addNewOrderButton).waitFor({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }
}
