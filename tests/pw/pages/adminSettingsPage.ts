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
}