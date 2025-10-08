import { Locator, Page, expect } from '@playwright/test';
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
    // Add after the existing New Settings UI methods

async navigateToNewPageSetupSettings() {
    await this.navigateToNewGeneralSettings();

    // Click the Page Setup link
    const pageSetupLink = this.page.locator(data.adminSettingsMigration.selectors.newUI.pageSetupLink).first();
    await pageSetupLink.click({ force: true });
    await this.waitForLoadState();
}

async updateDashboardPageInNewSettings(pageId: string) {
    await this.navigateToNewPageSetupSettings();
    // Find the dashboard page dropdown
    const dashboardDropdown = this.page.locator(data.adminSettingsMigration.selectors.newUI.dashboardPageDropdown).first();
    await dashboardDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator('#dashboard').click();
    await this.page.getByRole('option', { name: 'Cart' }).click();
    await this.page.locator('#dashboard').click();
    await this.page.getByRole('option', { name: 'Dashboard' }).click();
    //await dashboardDropdown.selectOption(pageId);
 
    // Click save button
    const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
    await saveButton.waitFor({ state: 'visible', timeout: 5000 });
    await saveButton.click();
     
    // Wait for save completion
    await this.page.waitForTimeout(2000);
    await this.waitForLoadState();
    // ✅ Reload page to verify saved option
    await this.page.reload();
    await this.waitForLoadState();
    // Get currently selected option
    const selectedText = await this.page.locator('#dashboard').textContent();
    return selectedText ? selectedText.trim() : '';
}

async getDashboardPageFromNewSettings(): Promise<string> {
    await this.navigateToNewPageSetupSettings();
    await this.waitForLoadState();
    const dashboardDropdown = this.page.locator(data.adminSettingsMigration.selectors.newUI.dashboardPageDropdown).first();
    await dashboardDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator('#dashboard').click();
    await dashboardDropdown.waitFor({ state: 'visible', timeout: 10000 });
        // ✅ Get the text of the currently selected option
    const selectedText = await this.page.locator('#dashboard').textContent();
    return selectedText ? selectedText.trim() : '';
}

async updateDashboardPageInOldSettings(pageId: string) {
    await this.navigateToOldGeneralSettings();

    // Find the dashboard page dropdown in old UI
    const dashboardDropdown = this.page.locator(data.adminSettingsMigration.selectors.oldUI.dashboardPageDropdown);
    await this.page.locator('div').filter({ hasText: /^Page Settings$/ }).click();
    await dashboardDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await this.page.locator('[id="dokan_pages\\[dashboard\\]"]').selectOption({label: 'Cart'});

    // Click save changes button
   await this.page.getByRole('button', { name: 'Save Changes' }).click();
    // Wait for save completion
    await this.page.waitForTimeout(2000);
    await this.waitForLoadState();
}

async getDashboardPageFromOldSettings(): Promise<string> {
    await this.navigateToOldGeneralSettings();
    await this.page.locator('div').filter({ hasText: /^Page Settings$/ }).click();

    const dashboardDropdown = await this.page.locator(data.adminSettingsMigration.selectors.oldUI.dashboardPageDropdown);
    // const value =  await dashboardDropdown.toHaveText('Dashboard');
    const selectedText = await dashboardDropdown.locator('option:checked').innerText();
    return selectedText;
    
}
// ------------------ New Settings UI ------------------

async updateMyOrdersPageInNewSettings(pageId: string) {
    await this.navigateToNewPageSetupSettings();

    // Find the My Orders page dropdown
    const myOrdersDropdown = this.page.locator(data.adminSettingsMigration.selectors.newUI.dashboardPageDropdown).first();
    await myOrdersDropdown.waitFor({ state: 'visible', timeout: 10000 });

    // Select the option (replace 'Cart' / 'My Orders' with dynamic selection if needed)
    await this.page.locator('#my_orders').click();
    await this.page.getByRole('option', { name: 'Cart' }).click();
    await this.page.locator('#my_orders').click();
    await this.page.getByRole('option', { name: 'My Orders' }).click();

    // Click save button
    const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
    await saveButton.waitFor({ state: 'visible', timeout: 5000 });
    await saveButton.click();

    await this.page.waitForTimeout(2000);
    await this.waitForLoadState();
    // ✅ Reload page to verify saved option
    await this.page.reload();
    await this.waitForLoadState();
    // Get currently selected option
    const selectedText = await this.page.locator('#my_orders').textContent();
    return selectedText ? selectedText.trim() : '';
}

async getMyOrdersPageFromNewSettings(): Promise<string> {
    await this.navigateToNewPageSetupSettings();

    const myOrdersDropdown = this.page.locator(data.adminSettingsMigration.selectors.newUI.dashboardPageDropdown).first();
    await myOrdersDropdown.waitFor({ state: 'visible', timeout: 10000 });

   // await this.page.locator('#myOrders').click();
    //await myOrdersDropdown.waitFor({ state: 'visible', timeout: 10000 });

    const selectedText = await this.page.locator('#my_orders').textContent();
    return selectedText ? selectedText.trim() : '';
}

// ------------------ Old Settings UI ------------------

async updateMyOrdersPageInOldSettings(pageId: string) {
    await this.navigateToOldGeneralSettings();

    const myOrdersDropdown = this.page.locator(data.adminSettingsMigration.selectors.oldUI.myOrdersPageDropdown);
    await this.page.locator('div').filter({ hasText: /^Page Settings$/ }).click();
    await myOrdersDropdown.waitFor({ state: 'visible', timeout: 5000 });

    await this.page.locator('[id="dokan_pages\\[my_orders\\]"]').selectOption({ label: 'Cart' });

    await this.page.getByRole('button', { name: 'Save Changes' }).click();
    await this.page.waitForTimeout(2000);
    await this.waitForLoadState();
}

async getMyOrdersPageFromOldSettings(): Promise<string> {
    await this.navigateToOldGeneralSettings();
    await this.page.locator('div').filter({ hasText: /^Page Settings$/ }).click();

    const myOrdersDropdown = await this.page.locator(data.adminSettingsMigration.selectors.oldUI.myOrdersPageDropdown);
    const selectedText = await myOrdersDropdown.locator('option:checked').innerText();
    return selectedText;
}
// ------------------ New Settings UI ------------------

async updateStoreListingPageInNewSettings(pageId: string) {
    await this.navigateToNewPageSetupSettings();

    // Find the Store Listing section
    const storeDropdown = this.page.locator(data.adminSettingsMigration.selectors.newUI.dashboardPageDropdown).first();
    await storeDropdown.waitFor({ state: 'visible', timeout: 10000 });

    // Select the option (replace 'All Stores' / 'Store Listing' with dynamic selection)
    await this.page.locator('#store_listing').click();
    await this.page.getByRole('option', { name: 'Cart' }).click();
    await this.page.locator('#store_listing').click();
    await this.page.getByRole('option', { name: 'Store List' }).click();

    // Click save button
    const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
    await saveButton.waitFor({ state: 'visible', timeout: 5000 });
    await saveButton.click();
    
    await this.page.waitForTimeout(2000);
    await this.waitForLoadState();
    // ✅ Reload page to verify saved option
    await this.page.reload();
    await this.waitForLoadState();
    // Get currently selected option
    const selectedText = await this.page.locator('#store_listing').textContent();
    return selectedText ? selectedText.trim() : '';
}

async getStoreListingPageFromNewSettings(): Promise<string> {
    await this.navigateToNewPageSetupSettings();

    const storeDropdown = this.page.locator(data.adminSettingsMigration.selectors.newUI.dashboardPageDropdown).first();
    await storeDropdown.waitFor({ state: 'visible', timeout: 10000 });

    const selectedText = await this.page.locator('#store_listing').textContent();
    return selectedText ? selectedText.trim() : '';
}

// ------------------ Old Settings UI ------------------

async updateStoreListingPageInOldSettings(pageId: string) {
    await this.navigateToOldGeneralSettings();

    const storeDropdown = this.page.locator(data.adminSettingsMigration.selectors.oldUI.storeListingPageDropdown);
    await this.page.locator('div').filter({ hasText: /^Page Settings$/ }).click();
    await storeDropdown.waitFor({ state: 'visible', timeout: 5000 });

    await this.page.locator('[id="dokan_pages\\[store_listing\\]"]').selectOption({ label: 'Cart' });

    await this.page.getByRole('button', { name: 'Save Changes' }).click();
    await this.page.waitForTimeout(2000);
    await this.waitForLoadState();
}

async getStoreListingPageFromOldSettings(): Promise<string> {
    await this.navigateToOldGeneralSettings();
    await this.page.locator('div').filter({ hasText: /^Page Settings$/ }).click();

    const storeDropdown = await this.page.locator(data.adminSettingsMigration.selectors.oldUI.storeListingPageDropdown);
    const selectedText = await storeDropdown.locator('option:checked').innerText();
    return selectedText;
}
// ------------------ New Settings UI ------------------
async updateTermsAndConditionsPageInNewSettings(pageId: string) {
    await this.navigateToNewPageSetupSettings();

    const tcDropdown = this.page.locator(data.adminSettingsMigration.selectors.newUI.dashboardPageDropdown).first();
    await tcDropdown.waitFor({ state: 'visible', timeout: 10000 });

    // Select the option
    await this.page.locator('#reg_tc_page').click();
    await this.page.getByRole('option', { name: 'Privacy Policy' }).click();
    await this.page.locator('#reg_tc_page').click();
    await this.page.getByRole('option', { name: pageId }).click();

    // Click save
    const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
    await saveButton.waitFor({ state: 'visible', timeout: 5000 });
    await saveButton.click();

    await this.page.waitForTimeout(2000);
    await this.waitForLoadState();

    // Reload page to verify saved option
    await this.page.reload();
    await this.waitForLoadState();

    const selectedText = await this.page.locator('#reg_tc_page').textContent();
    return selectedText ? selectedText.trim() : '';
}

async getTermsAndConditionsPageFromNewSettings(): Promise<string> {
    await this.navigateToNewPageSetupSettings();

    const tcDropdown = this.page.locator(data.adminSettingsMigration.selectors.newUI.dashboardPageDropdown).first();
    await tcDropdown.waitFor({ state: 'visible', timeout: 10000 });

    const selectedText = await this.page.locator('#reg_tc_page').textContent();
    return selectedText ? selectedText.trim() : '';
}

// ------------------ Old Settings UI ------------------
async updateTermsAndConditionsPageInOldSettings(pageId: string) {
    await this.navigateToOldGeneralSettings();

    const tcDropdown = this.page.locator(data.adminSettingsMigration.selectors.oldUI.termsAndConditionsPageDropdown);
    await this.page.locator('div').filter({ hasText: /^Page Settings$/ }).click();
    await tcDropdown.waitFor({ state: 'visible', timeout: 5000 });

    await this.page.locator('[id="dokan_pages\\[reg_tc_page\\]"]').selectOption({ label: 'Privacy Policy' });

    await this.page.getByRole('button', { name: 'Save Changes' }).click();
    await this.page.waitForTimeout(2000);
    await this.waitForLoadState();
}

async getTermsAndConditionsPageFromOldSettings(): Promise<string> {
    await this.navigateToOldGeneralSettings();
    await this.page.locator('div').filter({ hasText: /^Page Settings$/ }).click();

    const tcDropdown = await this.page.locator(data.adminSettingsMigration.selectors.oldUI.termsAndConditionsPageDropdown);
    const selectedText = await tcDropdown.locator('option:checked').innerText();
    return selectedText;
}
// Navigate to New Settings -> Location
async navigateToNewLocationSettings() {
    await this.navigateToNewGeneralSettings();

    // Click the Location Setup link
    const locationLink = this.page.locator(data.adminSettingsMigration.selectors.newUI.locationSetupLink).first();
    await locationLink.click({ force: true });
    await this.waitForLoadState();
}

// Update Location API in New UI
// --------------------------
// Map API Source
// ---------------------
async updateMapApiSourceInNewSettings(apiSource: 'Mapbox' | 'Google Maps') {
    await this.navigateToNewLocationSettings();

    const container = this.page.locator(data.adminSettingsMigration.selectors.newUI.mapApiSourceDropdown);
    await container.waitFor({ state: 'visible', timeout: 10000 });

    // Click the correct radio button
    await container.locator(`button[role="radio"][aria-label="${apiSource}"]`).click();
}

async getMapApiSourceFromNewSettings(): Promise<'Mapbox' | 'Google Maps'> {
    await this.navigateToNewLocationSettings();

    const container = this.page.locator(data.adminSettingsMigration.selectors.newUI.mapApiSourceDropdown);
    const selected = await container.locator('button[role="radio"][aria-checked="true"]').textContent();
    return selected?.trim() as 'Mapbox' | 'Google Maps';
}

// Update Map API Source in Old UI
async updateMapApiSourceInOldSettings(apiSource: 'Mapbox' | 'Google Maps') {
    await this.navigateToOldGeneralSettings();

    await this.page.locator('#vue-backend-app div').filter({ hasText: /^Appearance$/ }).click();
    await this.page.waitForTimeout(500);

    const label = this.page.locator(`label:has-text("${apiSource}")`);
    await label.click();

    const saveButton = this.page.getByRole('button', { name: 'Save Changes' });
    await saveButton.click();
    await this.page.waitForTimeout(2000);
    await this.waitForLoadState();
}

async getMapApiSourceFromOldSettings(): Promise<'Mapbox' | 'Google Maps'> {
    await this.navigateToOldGeneralSettings();

    await this.page.locator('#vue-backend-app div').filter({ hasText: /^Appearance$/ }).click();
    await this.page.waitForTimeout(500);

    const checkedLabel = this.page.locator('label.checked');
    const text = await checkedLabel.textContent();
    return text?.trim() as 'Mapbox' | 'Google Maps';
}

// --------------------------
// Google Maps API Key
// --------------------------

// Update Google Maps API Key in New UI
async updateGoogleMapsApiKeyInNewSettings(key: string) {
    await this.navigateToNewLocationSettings();

    const input = this.page.locator('div.flex.h-10 input[type="password"]');
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(key);

    const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
    await saveButton.click();
    await this.page.waitForTimeout(2000);
    await this.waitForLoadState();

    // Reload to confirm save
    await this.page.reload();
    await this.waitForLoadState();

    return (await input.inputValue()).trim();
}

async getGoogleMapsApiKeyFromNewSettings(): Promise<string> {
    await this.navigateToNewLocationSettings();
    const input = this.page.locator('div.flex.h-10 input[type="password"]');
    return (await input.inputValue()).trim();
}

// Update Google Maps API Key in Old UI
async updateGoogleMapsApiKeyInOldSettings(key: string) {
    await this.navigateToOldGeneralSettings();
    await this.page.locator('#vue-backend-app div').filter({ hasText: /^Appearance$/ }).click();
    await this.page.waitForTimeout(500);
    const input = this.page.locator('input[name="dokan_appearance[gmap_api_key]"]');// adjust selector if needed
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(key);

    const saveButton = this.page.getByRole('button', { name: 'Save Changes' });
    await saveButton.click();
    await this.page.waitForTimeout(2000);
    await this.waitForLoadState();
    await this.page.reload();
    await this.waitForLoadState();
}

async getGoogleMapsApiKeyFromOldSettings(): Promise<string> {
    await this.navigateToOldGeneralSettings();
    await this.page.locator('#vue-backend-app div').filter({ hasText: /^Appearance$/ }).click();
    await this.page.waitForTimeout(500);
    // Reveal the hidden API key field if necessary
    const placeholder = this.page.locator('.secret-input-placeholder');
    if (await placeholder.isVisible()) {
        await placeholder.click(); // click to unblur / reveal the actual input
    }
    const input = this.page.locator('input#dokan_appearance\\[mapbox_access_token\\]'); // adjust selector if needed
    return (await input.inputValue()).trim();
}
async updateMapPositionInNewSettings(position: string): Promise<string> {
    await this.navigateToNewLocationSettings();
    await this.waitForLoadState();

    // Click the radio button by aria-label
    const radioButton = this.page.getByRole('radio', { name: position });
    await radioButton.waitFor({ state: 'visible', timeout: 5000 });
    await radioButton.click();

    // Save the setting
    const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
    await saveButton.click();
    await this.waitForLoadState();

    // Return the selected value
    const section = this.page.locator('#dokan_settings_general_location_map_display_settings_location_map_position');
    const selected = section.locator('[role="radio"][aria-checked="true"]');
    await selected.waitFor({ state: 'attached', timeout: 5000 });
    const selectedValue = await selected.getAttribute('aria-label');
    return selectedValue!;
}
async getMapPositionFromNewSettings(): Promise<string> {
    await this.navigateToNewLocationSettings();
    await this.waitForLoadState();

   // Return the selected value
    const section = this.page.locator('#dokan_settings_general_location_map_display_settings_location_map_position');
    const selected = section.locator('[role="radio"][aria-checked="true"]');
    await selected.waitFor({ state: 'attached', timeout: 5000 });
    const selectedValue = await selected.getAttribute('aria-label');
    return selectedValue!;
}
async getMapPositionFromOldSettings(): Promise<string> {
    await this.navigateToOldGeolocationSettings(); // go to Old Geolocation Settings

    // Take the first .radio_fields container
    const section = this.page.locator('.radio_fields').first();

    // Find the checked label
    const checkedLabel = section.locator('label.checked');
    await checkedLabel.waitFor({ state: 'visible', timeout: 5000 });

    // Return the value of the input inside the label
    const value = await checkedLabel.locator('input[type="radio"]').getAttribute('value');
    return value!;
}
async updateMapPositionInOldSettings(position: string): Promise<void> {
    await this.navigateToOldGeolocationSettings(); // go to Old Geolocation Settings

    const section = this.page.locator('.radio_fields').first();

    // Find the label for the target value
    const targetLabel = section.locator(`label:has(input[value="${position.toLowerCase()}"])`);
    await targetLabel.waitFor({ state: 'visible', timeout: 5000 });

    // Click label to select the radio
    await targetLabel.click();

    // Click Save
    const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
    await saveButton.click();
    await this.waitForLoadState();
}
     

    // --------------------------
    // Show Filters Before Map (Switch)
    // --------------------------
    // Navigate to Geolocation Settings in Old UI
    async navigateToOldGeolocationSettings() {
        await this.navigateToOldGeneralSettings(); // first go to Old General Settings
        const geoSection = this.page.locator('div').filter({ hasText: /^Geolocation$/ });
        await geoSection.waitFor({ state: 'visible', timeout: 5000 });
        await geoSection.click();
        await this.waitForLoadState();
    }
    async setLocationMapSettingsAndSave(settings: {
    showFiltersBeforeMap: 'on' | 'off',
    radiusUnit: 'Kilometers' | 'Miles',
    minDistance: string,
    maxDistance: string,
    mapZoomLevel: string
}) {
    // Step 1: Set all fields first
    await this.setShowFiltersBeforeMap(settings.showFiltersBeforeMap);
    await this.setRadiusSearchUnit(settings.radiusUnit);
    await this.setMinDistance(settings.minDistance);
    await this.setMaxDistance(settings.maxDistance);
    await this.setMapZoomLevel(settings.mapZoomLevel);

    // Step 2: Click the Save button once
    const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
    await saveButton.waitFor({ state: 'visible', timeout: 5000 });
    await saveButton.click();
    await this.page.waitForTimeout(2000); // wait for UI to update
    await this.waitForLoadState();
}
    async setShowFiltersBeforeMap(value: 'on' | 'off') {
        await this.navigateToNewLocationSettings();
        const container = this.page.locator('#dokan_settings_general_location_map_display_settings_show_filters_before_map');
        await container.waitFor({ state: 'visible', timeout: 5000 });
        const toggle = container.locator('button[role="switch"]');
        const isChecked = await toggle.getAttribute('aria-checked');
        if ((value === 'on' && isChecked === 'false') || (value === 'off' && isChecked === 'true')) {
            await toggle.click();
            await this.page.waitForTimeout(300);
        }
        const newState = await toggle.getAttribute('aria-checked');
        return newState === 'true' ? 'on' : 'off';
    }

    async getShowFiltersBeforeMap(): Promise<'on' | 'off'> {
         await this.navigateToNewLocationSettings();
        const container = this.page.locator('#dokan_settings_general_location_map_display_settings_show_filters_before_map');
        const toggle = container.locator('button[role="switch"]');
        const isChecked = await toggle.getAttribute('aria-checked');
        return isChecked === 'true' ? 'on' : 'off';
    }

    async setShowFiltersBeforeMapInOldSettings(value: 'on' | 'off') {
        await this.navigateToOldGeolocationSettings();
    // Use the correct wrapper for this specific toggle
    const container = this.page.locator('div.show_filters_before_locations_map');

    // Locate the actual checkbox input (even if hidden)
    const checkbox = container.locator('input.toogle-checkbox[type="checkbox"]');

    // Wait until the checkbox exists in DOM
    await checkbox.waitFor({ state: 'attached', timeout: 5000 });

    // Check its current state
    const isChecked = await checkbox.isChecked();

    // Toggle only if current state doesn’t match desired one
    if ((value === 'on' && !isChecked) || (value === 'off' && isChecked)) {
        await checkbox.click({ force: true });
        await this.page.waitForTimeout(300);
    }
    }

    async getShowFiltersBeforeMapFromOldSettings(): Promise<'on' | 'off'> {
        await this.navigateToOldGeolocationSettings();
    // Use the unique wrapper class for this specific setting
    const container = this.page.locator('div.show_filters_before_locations_map');

    // Find the hidden checkbox input inside it
    const checkbox = container.locator('input.toogle-checkbox[type="checkbox"]');

    // Wait for the checkbox to exist in DOM (even if hidden)
    await checkbox.waitFor({ state: 'attached', timeout: 5000 });

    // Get current checked state
    const isChecked = await checkbox.isChecked();

    return isChecked ? 'on' : 'off';
    }

    // --------------------------
    // Radius Search Unit
    // --------------------------
    async setRadiusSearchUnit(unit: 'Kilometers' | 'Miles') {
        const container = this.page.locator('#dokan_settings_general_location_map_display_settings_radius_search_unit');
        await container.waitFor({ state: 'visible', timeout: 5000 });
        await container.locator(`button[role="radio"][aria-label="${unit}"]`).click();
        await this.page.waitForTimeout(300);
        const selected = await container.locator('button[role="radio"][aria-checked="true"]').textContent();
        return selected?.trim() || '';
    }

    async getRadiusSearchUnit(): Promise<'Kilometers' | 'Miles'> {
        const container = this.page.locator('#dokan_settings_general_location_map_display_settings_radius_search_unit');
        const selected = await container.locator('button[role="radio"][aria-checked="true"]').textContent();
        return selected?.trim() as 'Kilometers' | 'Miles';
    }

    async setRadiusSearchUnitInOldSettings(unit: 'Kilometers' | 'Miles') {
      await this.navigateToOldGeolocationSettings();

    // Locate the container by the field heading

    // Locate the container by the field heading
    const container = this.page.locator('div.field_contents:has(h3:has-text("Radius Search - Unit"))');

    // Find the label for the radio
    const value = unit === 'Kilometers' ? 'km' : 'miles';
    const radioLabel = container.locator(`label:has(input[type="radio"][value="${value}"])`);

    // Wait for the label to be present in the DOM
    await radioLabel.waitFor({ state: 'attached', timeout: 5000 });

    // Click the label (forces the radio selection)
    await radioLabel.click({ force: true });

    await this.page.waitForTimeout(300);
    }

    async getRadiusSearchUnitFromOldSettings(): Promise<'Kilometers' | 'Miles'> {
        await this.navigateToOldGeolocationSettings();
   const container = this.page.locator('div.field_contents:has(h3:has-text("Radius Search - Unit"))');

    // Find the label that is currently checked
    const checkedLabel = container.locator('div.radio_fields label.checked');

    // Wait until the checked label exists (doesn’t need to be visible)
    await checkedLabel.waitFor({ state: 'attached', timeout: 5000 });

    // Extract the visible text (e.g., "Kilometers" or "Miles")
    const selectedText = await checkedLabel.evaluate((el) => el.textContent?.trim() || '');

    // Return standardized text
    return selectedText.includes('Mile') ? 'Miles' : 'Kilometers';
    }

    // --------------------------
    // Radius Search - Minimum Distance
    // --------------------------
    async setMinDistance(value: string) {
        const input = this.page.locator('#dokan_settings_general_location_map_display_settings_radius_search_min_distance input[type="number"]');
        await input.fill(value);
        await this.page.waitForTimeout(200);
    }

    async getMinDistance(): Promise<string> {
        const input = this.page.locator('#dokan_settings_general_location_map_display_settings_radius_search_min_distance input[type="number"]');
        return (await input.inputValue()).trim();
    }

    async setMinDistanceInOldSettings(value: string) {
        await this.navigateToOldGeolocationSettings();
    const input = this.page.locator('[id="dokan_geolocation\\[distance_min\\]"]');
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(value);
    await this.page.waitForTimeout(200);
    }

    async getMinDistanceFromOldSettings(): Promise<string> {
        await this.navigateToOldGeolocationSettings();
    const input = this.page.locator('[id="dokan_geolocation\\[distance_min\\]"]');
    await input.waitFor({ state: 'visible', timeout: 5000 });

    const value = await input.inputValue();
    return value.trim();
    }

    // --------------------------
    // Radius Search - Maximum Distance
    // --------------------------
    async setMaxDistance(value: string) {
        const input = this.page.locator('#dokan_settings_general_location_map_display_settings_radius_search_max_distance input[type="number"]');
        await input.fill(value);
        await this.page.waitForTimeout(200);
    }

    async getMaxDistance(): Promise<string> {
        const input = this.page.locator('#dokan_settings_general_location_map_display_settings_radius_search_max_distance input[type="number"]');
        return (await input.inputValue()).trim();
    }

    async setMaxDistanceInOldSettings(value: string) {
        await this.navigateToOldGeolocationSettings();
        const input = this.page.locator('[id="dokan_geolocation\\[distance_max\\]"]');
        await input.fill(value);
        await this.page.waitForTimeout(200);
    }

    async getMaxDistanceFromOldSettings(): Promise<string> {
        await this.navigateToOldGeolocationSettings();
    const input = this.page.locator('[id="dokan_geolocation\\[distance_max\\]"]');
    await input.waitFor({ state: 'visible', timeout: 5000 });

    const value = await input.inputValue();
    return value.trim();
    }

    // --------------------------
    // Map Zoom Level
    // --------------------------
    async setMapZoomLevel(value: string) {
        const input = this.page.locator('#dokan_settings_general_location_map_display_settings_map_zoom_level input[type="number"]');
        await input.fill(value);
        await this.page.waitForTimeout(200);
    }

    async getMapZoomLevel(): Promise<string> {
        const input = this.page.locator('#dokan_settings_general_location_map_display_settings_map_zoom_level input[type="number"]');
        return (await input.inputValue()).trim();
    }

    async setMapZoomLevelInOldSettings(value: string) {
        await this.navigateToOldGeolocationSettings();
        const input = this.page.locator('[id="dokan_geolocation\\[map_zoom\\]"]');
        await input.fill(value);
        await this.page.waitForTimeout(200);
        await this.page.getByRole('button', { name: 'Save Changes' }).click();
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getMapZoomLevelFromOldSettings(): Promise<string> {
        await this.navigateToOldGeolocationSettings();

    const input = this.page.locator('[id="dokan_geolocation\\[map_zoom\\]"]');
    await input.waitFor({ state: 'visible', timeout: 5000 });

    const value = await input.inputValue();
    return value.trim();
    }
    async updateMapPlacementLocationsInNewSettings(options: string[]) {
  await this.navigateToNewLocationSettings();

  const checkboxes = [
    '#simple-checkbox-group-store_listing',
    '#simple-checkbox-group-shop_page',
    '#simple-checkbox-group-single_product_location_tab'
  ];

  // Ensure all checkboxes are visible
  for (const selector of checkboxes) {
    const checkbox = this.page.locator(selector);
    await checkbox.waitFor({ state: 'visible', timeout: 5000 });

    const isChecked = await checkbox.isChecked();

    // Check or uncheck based on target state
    const checkboxValue = await checkbox.getAttribute('value');
    if (checkboxValue && options.includes(checkboxValue)) {
      if (!isChecked) await checkbox.check();
    } else {
      if (isChecked) await checkbox.uncheck();
    }
  }

  // Click Save
  const saveButton = this.page.locator(data.adminSettingsMigration.selectors.newUI.saveButton);
  await saveButton.click();
  await this.page.waitForTimeout(2000);
  await this.waitForLoadState();

  // Reload and verify
  await this.page.reload();
  await this.waitForLoadState();

  return await this.getMapPlacementLocationsFromNewSettings();
}

async getMapPlacementLocationsFromNewSettings(): Promise<string[]> {
  await this.navigateToNewLocationSettings();

  const checkedBoxes = this.page.locator('input[type="checkbox"]:checked');
  const count = await checkedBoxes.count();

  const values: string[] = [];
  for (let i = 0; i < count; i++) {
    const value = await checkedBoxes.nth(i).getAttribute('value');
    if (value !== null) {
      values.push(value);
    }
  }

  return values;
}
}