import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { data } from '@utils/testData';

export class AdminSettingsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // Navigation methods
    async goToOldSettings() {
        await this.goIfNotThere(data.subUrls.backend.dokan.settings);
    }

    async goToNewSettings() {
        await this.goIfNotThere(data.adminSettingsMigration.urls.newAdminSettings);
    }

    // Old Settings UI methods
    async navigateToOldGeneralSettings() {
        await this.goToOldSettings();
        await this.waitForLoadState();

        // Click on General menu
        const generalMenu = this.page.locator(data.adminSettingsMigration.selectors.oldUI.generalMenu);
        await generalMenu.waitFor({ state: 'visible', timeout: 10000 });
        await generalMenu.click();
        await this.waitForLoadState();
    }

    async navigateToOldSellingOptions() {
        await this.goToOldSettings();
        await this.waitForLoadState();

        // Click on selling options menu
        const sellingOptionsMenu = this.page.locator(data.adminSettingsMigration.selectors.oldUI.sellingOptionsMenu);
        await sellingOptionsMenu.waitFor({ state: 'visible', timeout: 10000 });
        await sellingOptionsMenu.click();
        await this.waitForLoadState();
    }

    async updateVendorStoreUrlInOldSettings(storeUrl: string) {
        await this.navigateToOldGeneralSettings();

        // Update the vendor store URL field
        const storeUrlField = this.page.locator(data.adminSettingsMigration.selectors.oldUI.vendorStoreUrlField);
        await storeUrlField.waitFor({ state: 'visible', timeout: 5000 });
        await storeUrlField.clear();
        await storeUrlField.fill(storeUrl);

        // Click save changes button
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getVendorStoreUrlFromOldSettings(): Promise<string> {
        await this.navigateToOldGeneralSettings();

        const storeUrlField = this.page.locator(data.adminSettingsMigration.selectors.oldUI.vendorStoreUrlField);
        await storeUrlField.waitFor({ state: 'visible', timeout: 5000 });
        return await storeUrlField.inputValue();
    }

    async updateSingleSellerModeInOldSettings(enabled: boolean) {
        await this.navigateToOldGeneralSettings();

        // Find the switch element
        const switchField = this.page.locator(data.adminSettingsMigration.selectors.oldUI.singleSellerModeField);
        await switchField.waitFor({ state: 'visible', timeout: 5000 });
        
        // Check current state via hidden checkbox and toggle if needed
        const hiddenCheckbox = this.page.locator('.enable_single_seller_mode input[type="checkbox"]');
        const isCurrentlyChecked = await hiddenCheckbox.isChecked();
        if (isCurrentlyChecked !== enabled) {
            await switchField.click();
        }

        // Click save changes button
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getSingleSellerModeFromOldSettings(): Promise<boolean> {
        await this.navigateToOldGeneralSettings();

        // Check the hidden checkbox state for current value
        const hiddenCheckbox = this.page.locator('.enable_single_seller_mode input[type="checkbox"]');
        return await hiddenCheckbox.isChecked();
    }

    // New Settings UI methods
    async navigateToNewGeneralSettings() {
        await this.goToNewSettings();
        await this.waitForLoadState();

        // Wait for the General menu button to be visible
        const generalButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.generalButton).first();
        await generalButton.waitFor({ state: 'visible', timeout: 10000 });

        // Check if marketplace link exists in DOM (menu might be expanded by default)
        const marketplaceLink = this.page.locator(data.adminSettingsMigration.selectors.newUI.marketplaceLink);
        const linkExists = await marketplaceLink.count() > 0;

        if ( ! linkExists ) {
            // Click general button to expand menu if link doesn't exist
            await generalButton.click();
            await this.page.waitForTimeout(1000);
        }
    }

    async navigateToNewMarketplaceSettings() {
        await this.navigateToNewGeneralSettings();

        // Click the Marketplace link directly using ID (first occurrence for desktop)
        const marketplaceLink = this.page.locator(data.adminSettingsMigration.selectors.newUI.marketplaceLink).first();
        await marketplaceLink.click({ force: true });
        await this.waitForLoadState();
    }

    async updateVendorStoreUrlInNewSettings(storeUrl: string) {
        await this.navigateToNewMarketplaceSettings();

        // Find any visible input field excluding the search field
        const storeField = this.page.locator(data.adminSettingsMigration.selectors.newUI.vendorStoreUrlField).first();
        await storeField.waitFor({ state: 'visible', timeout: 10000 });
        await storeField.clear();
        await storeField.fill(storeUrl);

        // Click save button and wait for completion
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        // Wait for save completion - look for success indicators or page stability
        await this.page.waitForTimeout(2000); // Allow time for save to complete
        await this.waitForLoadState();
    }

    async getVendorStoreUrlFromNewSettings(): Promise<string> {
        await this.navigateToNewMarketplaceSettings();

        const storeField = this.page.locator(data.adminSettingsMigration.selectors.newUI.vendorStoreUrlField).first();
        await storeField.waitFor({ state: 'visible', timeout: 10000 });
        return await storeField.inputValue();
    }

    async updateSingleSellerModeInNewSettings(enabled: boolean) {
        await this.navigateToNewMarketplaceSettings();

        // Find the switch element - look for the actual switch input or button
        const switchContainer = this.page.locator(data.adminSettingsMigration.selectors.newUI.singleSellerModeField);
        await switchContainer.waitFor({ state: 'visible', timeout: 10000 });

        // Find the actual switch button within the container
        const switchButton = switchContainer.locator('button').first();
        await switchButton.waitFor({ state: 'visible', timeout: 5000 });

        // Always click to ensure switch is toggled to desired state
        await switchButton.click();
        await this.page.waitForTimeout(500); // Wait for UI update

        // Click save button if visible (appears only when changes are made)
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
        try {
            await saveButton.waitFor({ state: 'visible', timeout: 8000 });
            await saveButton.click();
        } catch (error) {
            // Save button may not appear if no changes were made
            console.log('Save button not visible - may not be needed');
        }

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getSingleSellerModeFromNewSettings(): Promise<boolean> {
        await this.navigateToNewMarketplaceSettings();

        const switchContainer = this.page.locator(data.adminSettingsMigration.selectors.newUI.singleSellerModeField);
        await switchContainer.waitFor({ state: 'visible', timeout: 10000 });

        const switchButton = switchContainer.locator('button').first();
        await switchButton.waitFor({ state: 'visible', timeout: 5000 });

        // Check current state via aria-checked or data attribute
        return await switchButton.getAttribute('aria-checked') === 'true' || 
            await switchButton.getAttribute('data-state') === 'checked';
    }

    // New Settings UI methods for Store Category
    async updateStoreCategoryInNewSettings(categoryType: 'none' | 'single' | 'multiple') {
        await this.navigateToNewMarketplaceSettings();

        // Find the category button
        const categoryRadio = this.page
            .locator(data.adminSettingsMigration.selectors.newUI.storeCategoryField)
            .locator(`button[name="${categoryType}"]`);

        await categoryRadio.waitFor({ state: 'visible', timeout: 10000 });

        // Only click if not already selected
        const isSelected = await categoryRadio.getAttribute('aria-checked');
        if (isSelected !== 'true') {
            await categoryRadio.click();

            // Save only if there was a change
            const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
            try {
                await saveButton.waitFor({ state: 'visible', timeout: 8000 });
                await saveButton.click();
            } catch (error) {
                console.log('Save button not visible - may not be needed');
            }

            // Wait for save completion
            await this.page.waitForTimeout(2000);
            await this.waitForLoadState();
        } else {
            console.log(`Category "${categoryType}" is already selected, skipping update.`);
        }
    }

    async getStoreCategoryFromNewSettings(): Promise<'none' | 'single' | 'multiple'> {
        await this.navigateToNewMarketplaceSettings();

        // Locate the radio group container
        const categoryField = this.page.locator(data.adminSettingsMigration.selectors.newUI.storeCategoryField);
        await categoryField.waitFor({ state: 'visible', timeout: 10000 });

        // Find the checked "radio" (button with role="radio" and aria-checked="true")
        const checkedRadio = categoryField.locator('[role="radio"][aria-checked="true"]').first();

        await checkedRadio.waitFor({ state: 'visible', timeout: 5000 });

        // Get the name attribute ("none" | "single" | "multiple")
        const value = await checkedRadio.getAttribute('name');

        return value as 'none' | 'single' | 'multiple';
    }

    // Old Settings UI methods for Store Category
    async updateStoreCategoryInOldSettings(categoryType: 'none' | 'single' | 'multiple') {
        await this.navigateToOldGeneralSettings();

        // Convert the first letter to uppercase for matching label text
        const labelText = categoryType.charAt(0).toUpperCase() + categoryType.slice(1);

        await this.page.getByText(labelText).click();

        // Click save changes button
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }


    async getStoreCategoryFromOldSettings(): Promise<'none' | 'single' | 'multiple'> {
        await this.navigateToOldGeneralSettings();

        // Locate the fieldset by heading text "Store Category"
        const storeCategoryFieldset = this.page.locator('fieldset', { has: this.page.locator('h3', { hasText: 'Store Category' }) });

        // Locate the checked label/input inside that fieldset
        const checkedInput = storeCategoryFieldset.locator('label.checked input[type="radio"]');

        await checkedInput.waitFor({ state: 'attached', timeout: 5000 });

        // Return the value attribute
        return await checkedInput.getAttribute('value') as 'none' | 'single' | 'multiple';
    }

    // New Settings UI methods for Show Customer Details to Vendors
    async updateShowCustomerDetailsToVendorsInNewSettings(enabled: boolean) {
        await this.navigateToNewMarketplaceSettings();

        // Find the switch element for show customer details to vendors
        const switchElement = this.page.locator('#dokan_settings_general_marketplace_marketplace_settings_show_customer_details_to_vendors').getByRole('switch');
        await switchElement.waitFor({ state: 'visible', timeout: 10000 });

        // Toggle if current state doesn't match desired state
        const isChecked = await switchElement.getAttribute('aria-checked') === 'true';
        if (isChecked !== enabled) {
            await switchElement.click();
        }

        // Click save button if visible
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
        try {
            await saveButton.waitFor({ state: 'visible', timeout: 8000 });
            await saveButton.click();
        } catch (error) {
            // Save button may not appear if no changes were made
            console.log('Save button not visible - may not be needed');
        }

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getShowCustomerDetailsToVendorsFromNewSettings(): Promise<boolean> {
        await this.navigateToNewMarketplaceSettings();

        const switchElement = this.page.locator('#dokan_settings_general_marketplace_marketplace_settings_show_customer_details_to_vendors').getByRole('switch');
        await switchElement.waitFor({ state: 'visible', timeout: 10000 });
        return await switchElement.getAttribute('aria-checked') === 'true';
    }

    // Old Settings UI methods for Show Customer Details to Vendors (mapped as Hide Customer Info)
    async updateShowCustomerDetailsInOldSettings(enabled: boolean) {
        await this.navigateToOldSellingOptions();

        // Find the switch element
        const switchField = this.page.locator(data.adminSettingsMigration.selectors.oldUI.hideCustomerInfo);
        await switchField.waitFor({ state: 'visible', timeout: 5000 });

        // Check current state via hidden checkbox and toggle if needed
        const hiddenCheckbox = this.page.locator('.hide_customer_info input[type="checkbox"]');
        const isCurrentlyChecked = await hiddenCheckbox.isChecked();
        if (isCurrentlyChecked !== enabled) {
            await switchField.click();
        }

        // Click save changes button
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getShowCustomerDetailsFromOldSettings(): Promise<boolean> {
        await this.navigateToOldSellingOptions();

        // Check the hidden checkbox state for current value
        //const hiddenCheckbox = this.page.locator('.enable_single_seller_mode input[type="checkbox"]');
        const hiddenCheckbox = this.page.locator(".hide_customer_info input[type='checkbox']");
        return await hiddenCheckbox.isChecked();
    }


    // New Settings UI methods for Guest Product Enquiry
    async updateGuestProductEnquiryInNewSettings(enabled: boolean) {
        await this.navigateToNewMarketplaceSettings();

        // Locate the switch element for Guest Product Enquiry
        const switchElement = this.page
            .locator('#dokan_settings_general_marketplace_marketplace_settings_guest_product_enquiry')
            .getByRole('switch');

        await switchElement.waitFor({ state: 'visible', timeout: 10000 });

        // Toggle switch only if current state differs
        const isChecked = await switchElement.getAttribute('aria-checked') === 'true';
        if (isChecked !== enabled) {
            await switchElement.click();
        }

        // Click save button if visible
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
        try {
            await saveButton.waitFor({ state: 'visible', timeout: 8000 });
            await saveButton.click();
        } catch (error) {
            console.log('Save button not visible - may not be needed');
        }

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getGuestProductEnquiryFromNewSettings(): Promise<boolean> {
        await this.navigateToNewMarketplaceSettings();

        const switchElement = this.page
            .locator('#dokan_settings_general_marketplace_marketplace_settings_guest_product_enquiry')
            .getByRole('switch');

        await switchElement.waitFor({ state: 'visible', timeout: 10000 });

        return await switchElement.getAttribute('aria-checked') === 'true';
    }

    // Old Settings UI methods for Guest Product Enquiry
    async updateGuestProductEnquiryInOldSettings(enabled: boolean) {
        await this.navigateToOldSellingOptions();

        // Locate the switch field
        const switchField = this.page.locator(data.adminSettingsMigration.selectors.oldUI.enableGuestUserEnquiry);
        await switchField.waitFor({ state: 'visible', timeout: 5000 });

        // Locate the hidden checkbox
        const hiddenCheckbox = this.page.locator('.enable_guest_user_enquiry input[type="checkbox"]');
        const isCurrentlyChecked = await hiddenCheckbox.isChecked();

        // Toggle if needed
        if (isCurrentlyChecked !== enabled) {
            await switchField.click();
        }

        // Click save changes button
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getGuestProductEnquiryFromOldSettings(): Promise<boolean> {
        await this.navigateToOldSellingOptions();

        // Check the hidden checkbox state for current value
        const hiddenCheckbox = this.page.locator('.enable_guest_user_enquiry input[type="checkbox"]');
        return await hiddenCheckbox.isChecked();
    }

    // New Settings UI methods for Add to Cart Button Visibility
    async updateAddToCartButtonVisibilityInNewSettings(enabled: boolean) {
        await this.navigateToNewMarketplaceSettings();

        // Locate the switch element for Add to Cart Button Visibility
        const switchElement = this.page
            .locator('#dokan_settings_general_marketplace_marketplace_settings_add_to_cart_button_visibility')
            .getByRole('switch');

        await switchElement.waitFor({ state: 'visible', timeout: 10000 });

        // Toggle if current state differs
        const isChecked = await switchElement.getAttribute('aria-checked') === 'true';
        if (isChecked !== enabled) {
            await switchElement.click();
        }

        // Click save button if visible
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
        try {
            await saveButton.waitFor({ state: 'visible', timeout: 8000 });
            await saveButton.click();
        } catch (error) {
            console.log('Save button not visible - may not be needed');
        }

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getAddToCartButtonVisibilityFromNewSettings(): Promise<boolean> {
        await this.navigateToNewMarketplaceSettings();

        const switchElement = this.page
            .locator('#dokan_settings_general_marketplace_marketplace_settings_add_to_cart_button_visibility')
            .getByRole('switch');

        await switchElement.waitFor({ state: 'visible', timeout: 10000 });

        return await switchElement.getAttribute('aria-checked') === 'true';
    }

    // Old Settings UI methods for Add to Cart Button Visibility (mapped as Remove Add to Cart Button)
    async updateAddToCartButtonVisibilityInOldSettings(enabled: boolean) {
        await this.navigateToOldSellingOptions();

        // Locate the switch field for Remove Add to Cart Button
        const switchField = this.page.locator(data.adminSettingsMigration.selectors.oldUI.catalogModeHideAddToCartButton);
        await switchField.waitFor({ state: 'visible', timeout: 5000 });

        // Locate the hidden checkbox
        const hiddenCheckbox = this.page.locator('.catalog_mode_hide_add_to_cart_button input[type="checkbox"]');
        const isCurrentlyChecked = await hiddenCheckbox.isChecked();

        // Toggle if needed
        if (isCurrentlyChecked !== enabled) {
            await switchField.click();
        }

        // Click save changes button
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getAddToCartButtonVisibilityFromOldSettings(): Promise<boolean> {
        await this.navigateToOldSellingOptions();

        // Check hidden checkbox state for current value
        const hiddenCheckbox = this.page.locator('.catalog_mode_hide_add_to_cart_button input[type="checkbox"]');
        return await hiddenCheckbox.isChecked();
    }

    // New Settings UI methods for Live Search Option
    async updateLiveSearchOptionInNewSettings(option: string) {
        await this.navigateToNewMarketplaceSettings();

        // Correct radio group container based on actual HTML
        const radioGroup = this.page.locator('#dokan_settings_general_marketplace_live_search_search_box_radio');
        await radioGroup.waitFor({ state: 'visible', timeout: 10000 });

        // Select the desired radio option
        const radioOption = radioGroup.locator(`input[type="radio"][value="${option}"]`);
        await radioOption.waitFor({ state: 'attached', timeout: 5000 });
        await radioOption.check({ force: true }); // force click helps when input is hidden (sr-only)

        // Try clicking save button if visible
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
        try {
            if (await saveButton.isVisible()) {
                await saveButton.click();
                await this.page.waitForTimeout(2000);
                await this.waitForLoadState();
            } else {
                console.log('Save button not visible — skipping save step');
            }
        } catch (error) {
            console.log('Save button interaction failed or not needed:', error);
        }
    }

    async getLiveSearchOptionFromNewSettings(): Promise<string> {
        await this.navigateToNewMarketplaceSettings();

        const baseLocator = this.page.locator('#dokan_settings_general_marketplace_live_search_search_box_radio');
        await baseLocator.waitFor({ state: 'visible', timeout: 10000 });

        // Select the element that has aria-checked="true"
        const selectedOption = baseLocator.locator('[role="radio"][aria-checked="true"]');
        await selectedOption.waitFor({ state: 'attached', timeout: 10000 });

        // Find the associated input and get its value
        const inputElement = selectedOption.locator('input[type="radio"]');
        const value = await inputElement.getAttribute('value');

        if (!value) {
            throw new Error('No selected Live Search Option found in new settings');
        }
        return value;
    }

    async navigateToOldLiveSearchOptions() {
        await this.goToOldSettings();
        await this.waitForLoadState();

        // Click on Live Search menu
        const liveSearchMenu = this.page.locator(data.adminSettingsMigration.selectors.oldUI.liveSearchMenu);
        await liveSearchMenu.waitFor({ state: 'visible', timeout: 10000 });
        await liveSearchMenu.click();
        await this.waitForLoadState();
    }

    async updateLiveSearchOptionInOldSettings(option: string) {
        await this.navigateToOldLiveSearchOptions();

        // Locate the select dropdown for Live Search Options
        const selectDropdown = this.page.locator('select[id="dokan_live_search_setting[live_search_option]"]');
        await selectDropdown.waitFor({ state: 'visible', timeout: 10000 });

        // Select the desired option
        await selectDropdown.selectOption(option);

        // Click save changes button
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getLiveSearchOptionFromOldSettings(): Promise<string> {
        await this.navigateToOldLiveSearchOptions();

        // Locate the select dropdown and get current value
        const selectDropdown = this.page.locator('select[id="dokan_live_search_setting[live_search_option]"]');
        await selectDropdown.waitFor({ state: 'visible', timeout: 10000 });

        return await selectDropdown.inputValue();
    }
}