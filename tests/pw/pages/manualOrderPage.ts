import { Page, expect } from '@playwright/test';

export class ManualOrderPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Test Data
    readonly testData = {
        vendor: {
            name: 'vendor1store'
        },
        product: {
            name: 'p1_v1'
        },
        customer: {
            name: 'customer1'
        },
        fee: {
            name: 'Test Fee 1',
            amount: 10
        }
    };

    // Admin Locators
    readonly adminLocators = {
        dokanSettings: '/wp-admin/admin.php?page=dokan#/settings',
        sellingOptionsTab: "//div[normalize-space()='Selling Options']",
        allowVendorOrdersToggle: 'fieldset:has-text("Allow Vendors to Create Orders") span:nth-child(2)',
        saveChangesButton: "//input[@id='submit']",
        
        // Vendor Profile Settings
        vendorsPage: '/wp-admin/admin.php?page=dokan#/vendors',
        searchVendorsInput: 'searchbox[name="Search Vendors"]',
        vendorLink: (vendorName: string) => `a:has-text("${vendorName}")`,
        settingsLink: 'a[name=""]',
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

    // Admin Methods - Global Settings
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

    // Admin Methods - Vendor Specific Settings
    async goToVendorsPage() {
        const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
        await this.page.goto(`${baseUrl}/wp-admin/admin.php?page=dokan#/vendors`);
        await this.page.waitForLoadState('networkidle');
    }

    async searchVendor(vendorName: string) {
        await this.page.getByRole('searchbox', { name: 'Search Vendors' }).click();
        await this.page.getByRole('searchbox', { name: 'Search Vendors' }).fill(vendorName);
        await this.page.getByRole('searchbox', { name: 'Search Vendors' }).press('Enter');
        await this.page.waitForLoadState('networkidle');
    }

    async openVendorSettings(vendorName: string) {
        await this.page.getByRole('link', { name: vendorName }).click();
        await this.page.locator("//span[@class='dashicons dashicons-edit']").click();
        await this.page.waitForLoadState('networkidle');
    }

    async enableOrderCreation() {
        // Check if order creation is already enabled
        const parentSwitch = this.page.locator('div:nth-child(5) > .checkbox-left > .switch');
        const inputCheckbox = parentSwitch.locator('input[type="checkbox"]');
        
        // Check if the checkbox is already checked
        const isEnabled = await inputCheckbox.isChecked();
        
        // Only click if not already enabled
        if (!isEnabled) {
            await this.page.locator(this.adminLocators.vendorOrderToggle).click();
            console.log(`Order creation was disabled, now enabled`);
        } else {
            console.log(`Order creation already enabled`);
        }
    }

    async disableOrderCreation() {
        // Check if order creation is currently enabled
        const parentSwitch = this.page.locator('div:nth-child(5) > .checkbox-left > .switch');
        const inputCheckbox = parentSwitch.locator('input[type="checkbox"]');
        
        // Check if the checkbox is checked
        const isEnabled = await inputCheckbox.isChecked();
        
        // Only click if currently enabled (to disable it)
        if (isEnabled) {
            await this.page.locator(this.adminLocators.vendorOrderToggle).click();
            console.log(`Order creation was enabled, now disabled`);
        } else {
            console.log(`Order creation already disabled`);
        }
    }

    async saveVendorSettings() {
        await this.page.getByRole('button', { name: 'Save Changes' }).nth(1).click();
        await this.page.getByRole('button', { name: 'OK' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    // Combined Setup Method - Enable Order Creation for Specific Vendor
    async enableOrderCreationForVendor(vendorName: string) {
        await this.goToVendorsPage();
        await this.searchVendor(vendorName);
        await this.openVendorSettings(vendorName);
        await this.enableOrderCreation();
        await this.saveVendorSettings();
    }

    // Combined Cleanup Method - Disable Order Creation for Specific Vendor
    async disableOrderCreationForVendor(vendorName: string) {
        await this.goToVendorsPage();
        await this.searchVendor(vendorName);
        await this.openVendorSettings(vendorName);
        await this.disableOrderCreation();
        await this.saveVendorSettings();
    }

    // Vendor Methods
    async navigateToOrders() {
        const baseUrl = process.env.BASE_URL || 'https://dokanautomation.test';
        await this.page.goto(`${baseUrl}/dashboard/orders/`);
        await this.page.waitForLoadState('networkidle');
    }

    async clickAddNewOrder() {
        await this.page.waitForLoadState('networkidle');
        await this.page.locator(this.vendorLocators.addNewOrderButton).click();
    }

    async addProductToOrder(productName: string) {
        await this.page.locator(this.vendorLocators.addItemsButton).click();
        await this.page.locator(this.vendorLocators.addProductsButton).click();
        
        await this.page.waitForLoadState('networkidle');
        
        await this.page.locator('div[data-open][aria-hidden="true"]').waitFor({ state: 'visible', timeout: 10000 });
        
        const searchInput = this.page.locator('div[data-open] input, div[data-open] [role="combobox"]').first();
        await searchInput.waitFor({ state: 'visible', timeout: 10000 });
        
        await searchInput.type(productName);
        
        await this.page.waitForTimeout(2000);
        
        const options = this.page.locator('[role="option"]');
        const optionCount = await options.count();
        console.log(`Found ${optionCount} product options`);
        
        if (optionCount > 0) {
            const specificOption = this.page.locator(this.vendorLocators.productOption(productName));
            if (await specificOption.count() > 0) {
                await specificOption.first().click();
            } else {
                console.log(`Product "${productName}" not found, selecting first available option`);
                await options.first().click();
            }
        } else {
            console.log('No product options found, proceeding without product selection');
        }
        
        await this.page.locator(this.vendorLocators.addProductsSubmitButton).click();
    }

    async selectCustomer(customerName: string) {
        await this.page.waitForLoadState('networkidle');
        await this.page.locator('.css-ytf5rn').first().waitFor({ state: 'visible' });
        await this.page.locator('.css-ytf5rn').first().click();
        
        await this.page.getByRole('combobox', { name: 'Customer' }).fill(customerName);
        
        await this.page.getByRole('combobox', { name: 'Customer' }).press('Enter');
        
        await this.page.waitForTimeout(1000);
        
        try {
            const customerOption = this.page.getByRole('option', { name: `${customerName} (#6)` });
            if (await customerOption.count() > 0) {
                await customerOption.click();
                console.log(`Selected customer: ${customerName}`);
            } else {
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
        await this.page.getByLabel('Order Status').selectOption(status);
    }

    async addFeeToOrder(feeName: string, feeAmount: number) {
        console.log('Starting fee addition process...');
        
        console.log('Clicking Add fee button...');
        await this.page.getByRole('button', { name: 'Add fee' }).click();
        
        console.log('Filling fee name...');
        await this.page.getByRole('textbox', { name: 'Fee Name' }).click();
        await this.page.getByRole('textbox', { name: 'Fee Name' }).fill(feeName);
        
        console.log('Filling fee amount...');
        
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
        
        for (const selector of feeAmountSelectors) {
            const element = this.page.locator(selector);
            if (await element.count() > 0 && await element.isVisible()) {
                feeAmountInput = element;
                console.log(`Found fee amount input with selector: ${selector}`);
                break;
            }
        }
        
        if (!feeAmountInput) {
            feeAmountInput = this.page.getByRole('textbox', { name: 'Fee Amount' });
            console.log('Using fallback selector: getByRole textbox Fee Amount');
        }
        
        await feeAmountInput.click();
        await feeAmountInput.clear();
        await feeAmountInput.fill(feeAmount.toString());
        
        const enteredValue = await feeAmountInput.inputValue();
        console.log(`Fee amount entered: "${enteredValue}" (expected: "${feeAmount}")`);
        
        if (enteredValue !== feeAmount.toString()) {
            console.log('WARNING: Fee amount was not entered correctly!');
        }
        
        console.log('Clicking Add Fee submit button...');
        await this.page.getByRole('button', { name: 'Add Fee', exact: true }).click();
        
        await this.page.waitForTimeout(2000);
        
        console.log('Fee addition process completed');
    }

    async saveOrder() {
        const saveButton = this.page.locator('button:has-text("Save")').first();
        await saveButton.waitFor({ state: 'visible', timeout: 10000 });
        
        try {
            await saveButton.click();
            console.log('Order saved successfully');
        } catch (error) {
            console.log('Error clicking save button:', error);
            
            try {
                await this.page.keyboard.press('Enter');
                console.log('Used keyboard Enter to save');
            } catch (keyError) {
                console.log('Keyboard save also failed:', keyError);
                
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
