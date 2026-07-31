import { Page } from '@playwright/test';
import { BasePage } from '@pages/basePage';
import { data } from '@utils/testData';

export class AdminSettingsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // Shorthand for the new (React) settings selector map.
    private get nu() {
        return data.adminSettingsMigration.selectors.newUI;
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

    // ---------------------------------------------------------------- //
    // New Settings UI (React) — shared helpers                         //
    // ---------------------------------------------------------------- //

    private newField(fieldId: string) {
        return this.page.locator(`[data-testid="settings-field-${fieldId}"]`);
    }

    private newSaveButton() {
        return this.page.getByRole('button', { name: this.nu.saveButtonName });
    }

    // Save is only clickable once a change makes it dirty; skip otherwise.
    private async saveNewSettings() {
        const save = this.newSaveButton();
        if (await save.isEnabled().catch(() => false)) {
            await save.click();
            await this.waitForLoadState();
            await this.page.waitForTimeout(1000);
        }
    }

    // Open a settings subpage by its sidebar section + subpage accessible names.
    // Expands the section only when the subpage is not already showing, so an
    // already-expanded section is not accidentally collapsed.
    async openNewSettingsSubpage(sectionName: string, subpageName: string) {
        await this.goToNewSettings();
        await this.waitForLoadState();

        // Wait for the section button so the sidebar has mounted before probing
        // the subpage — otherwise a premature isVisible() reads false and we would
        // collapse an already-expanded section (e.g. General) instead of leaving it open.
        // Generous timeout: the React settings app cold-loads on every navigation and
        // tests that hop between old and new settings can exceed a 10s budget.
        const section = this.page.getByRole('button', { name: sectionName, exact: true }).first();
        await section.waitFor({ state: 'visible', timeout: 30000 });

        const subpage = this.page.getByRole('button', { name: subpageName, exact: true }).first();
        if (!(await subpage.isVisible().catch(() => false))) {
            await section.click();
            await subpage.waitFor({ state: 'visible', timeout: 15000 });
        }
        await subpage.click();
        await this.page.locator(this.nu.sectionContent).first().waitFor({ state: 'visible', timeout: 15000 });
    }

    private async setNewSwitch(fieldSelector: string, enabled: boolean) {
        const toggle = this.page.locator(fieldSelector).getByRole('switch');
        await toggle.waitFor({ state: 'visible', timeout: 10000 });
        const isChecked = (await toggle.getAttribute('aria-checked')) === 'true';
        if (isChecked !== enabled) {
            await toggle.click();
            await this.saveNewSettings();
        }
    }

    private async getNewSwitch(fieldSelector: string): Promise<boolean> {
        const toggle = this.page.locator(fieldSelector).getByRole('switch');
        await toggle.waitFor({ state: 'visible', timeout: 10000 });
        return (await toggle.getAttribute('aria-checked')) === 'true';
    }

    // New Settings UI methods
    async navigateToNewGeneralSettings() {
        await this.openNewSettingsSubpage(this.nu.generalNav, this.nu.marketplaceNav);
    }

    async navigateToNewMarketplaceSettings() {
        await this.openNewSettingsSubpage(this.nu.generalNav, this.nu.marketplaceNav);
    }

    async updateVendorStoreUrlInNewSettings(storeUrl: string) {
        await this.navigateToNewMarketplaceSettings();

        const storeField = this.newField('vendor_store_url_slug').locator('input').first();
        await storeField.waitFor({ state: 'visible', timeout: 10000 });
        await storeField.fill(storeUrl);
        await this.saveNewSettings();
    }

    async getVendorStoreUrlFromNewSettings(): Promise<string> {
        await this.navigateToNewMarketplaceSettings();

        const storeField = this.newField('vendor_store_url_slug').locator('input').first();
        await storeField.waitFor({ state: 'visible', timeout: 10000 });
        return await storeField.inputValue();
    }

    async updateSingleSellerModeInNewSettings(enabled: boolean) {
        await this.navigateToNewMarketplaceSettings();
        await this.setNewSwitch(this.nu.singleSellerModeField, enabled);
    }

    async getSingleSellerModeFromNewSettings(): Promise<boolean> {
        await this.navigateToNewMarketplaceSettings();
        return await this.getNewSwitch(this.nu.singleSellerModeField);
    }

    // New Settings UI methods for Store Category
    async updateStoreCategoryInNewSettings(categoryType: 'none' | 'single' | 'multiple') {
        await this.navigateToNewMarketplaceSettings();

        // Store category renders as a button group; state is on aria-pressed.
        const label = categoryType.charAt(0).toUpperCase() + categoryType.slice(1);
        const categoryButton = this.page.locator(this.nu.storeCategoryField).getByRole('button', { name: label, exact: true });
        await categoryButton.waitFor({ state: 'visible', timeout: 10000 });

        if ((await categoryButton.getAttribute('aria-pressed')) !== 'true') {
            await categoryButton.click();
            await this.saveNewSettings();
        }
    }

    async getStoreCategoryFromNewSettings(): Promise<'none' | 'single' | 'multiple'> {
        await this.navigateToNewMarketplaceSettings();

        const categoryField = this.page.locator(this.nu.storeCategoryField);
        await categoryField.waitFor({ state: 'visible', timeout: 10000 });

        const pressed = categoryField.locator('button[aria-pressed="true"]').first();
        await pressed.waitFor({ state: 'visible', timeout: 10000 });

        const value = (await pressed.textContent() || '').trim().toLowerCase();
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
        await this.setNewSwitch(this.nu.showCustomerDetailsField, enabled);
    }

    async getShowCustomerDetailsToVendorsFromNewSettings(): Promise<boolean> {
        await this.navigateToNewMarketplaceSettings();
        return await this.getNewSwitch(this.nu.showCustomerDetailsField);
    }

    // Old Settings UI methods for Show Customer Details to Vendors.
    // Legacy stores the inverse (`hide_customer_info`), so "show" == !hide.
    async updateShowCustomerDetailsInOldSettings(enabled: boolean) {
        await this.navigateToOldSellingOptions();

        // Find the switch element
        const switchField = this.page.locator(data.adminSettingsMigration.selectors.oldUI.hideCustomerInfo);
        await switchField.waitFor({ state: 'visible', timeout: 5000 });

        // Check current state via hidden checkbox and toggle if needed
        const hiddenCheckbox = this.page.locator('.hide_customer_info input[type="checkbox"]');
        const isCurrentlyChecked = await hiddenCheckbox.isChecked();
        if (isCurrentlyChecked !== ! enabled) {
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

        // Legacy field is `hide_customer_info`; "show" is its inverse.
        const hiddenCheckbox = this.page.locator(".hide_customer_info input[type='checkbox']");
        return ! ( await hiddenCheckbox.isChecked() );
    }


    // New Settings UI methods for Guest Product Enquiry
    async updateGuestProductEnquiryInNewSettings(enabled: boolean) {
        await this.navigateToNewMarketplaceSettings();
        await this.setNewSwitch(this.nu.guestProductEnquiryField, enabled);
    }

    async getGuestProductEnquiryFromNewSettings(): Promise<boolean> {
        await this.navigateToNewMarketplaceSettings();
        return await this.getNewSwitch(this.nu.guestProductEnquiryField);
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
        await this.setNewSwitch(this.nu.addToCartVisibilityField, enabled);
    }

    async getAddToCartButtonVisibilityFromNewSettings(): Promise<boolean> {
        await this.navigateToNewMarketplaceSettings();
        return await this.getNewSwitch(this.nu.addToCartVisibilityField);
    }

    // Old Settings UI methods for Add to Cart Button Visibility.
    // Legacy stores the inverse (`catalog_mode_hide_add_to_cart_button`), so "visibility" == !hide.
    async updateAddToCartButtonVisibilityInOldSettings(enabled: boolean) {
        await this.navigateToOldSellingOptions();

        // Locate the switch field for Remove Add to Cart Button
        const switchField = this.page.locator(data.adminSettingsMigration.selectors.oldUI.catalogModeHideAddToCartButton);
        await switchField.waitFor({ state: 'visible', timeout: 5000 });

        // Locate the hidden checkbox
        const hiddenCheckbox = this.page.locator('.catalog_mode_hide_add_to_cart_button input[type="checkbox"]');
        const isCurrentlyChecked = await hiddenCheckbox.isChecked();

        // Toggle if needed (legacy hide must be the inverse of visibility)
        if (isCurrentlyChecked !== ! enabled) {
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

        // Legacy field is `catalog_mode_hide_add_to_cart_button`; visibility is its inverse.
        const hiddenCheckbox = this.page.locator('.catalog_mode_hide_add_to_cart_button input[type="checkbox"]');
        return ! ( await hiddenCheckbox.isChecked() );
    }

    // New Settings UI methods for Live Search Option
    async updateLiveSearchOptionInNewSettings(option: string) {
        await this.navigateToNewMarketplaceSettings();

        // The radio <input> is visually hidden (aria-hidden, sr-only); click its
        // enclosing <label>, which is the actual interactive target.
        const optionLabel = this.page.locator(this.nu.liveSearchOptionField).locator(`label:has(input[type="radio"][value="${option}"])`);
        await optionLabel.waitFor({ state: 'visible', timeout: 10000 });
        await optionLabel.click();
        await this.saveNewSettings();
    }

    async getLiveSearchOptionFromNewSettings(): Promise<string> {
        await this.navigateToNewMarketplaceSettings();

        const field = this.page.locator(this.nu.liveSearchOptionField);
        await field.waitFor({ state: 'visible', timeout: 10000 });

        const selected = field.locator('input[type="radio"]:checked').first();
        await selected.waitFor({ state: 'attached', timeout: 10000 });

        const value = await selected.getAttribute('value');
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

    async navigateToNewVendorSettings() {
        await this.openNewSettingsSubpage(this.nu.vendorsNav, this.nu.vendorOnboardingNav);
    }

    async navigateToNewVendorOnboardingSettings() {
        await this.openNewSettingsSubpage(this.nu.vendorsNav, this.nu.vendorOnboardingNav);
    }

    async navigateToNewSocialOnboardingSettings() {
        await this.openNewSettingsSubpage(this.nu.vendorsNav, this.nu.socialOnboardingNav);
    }

    async navigateToNewVendorCapabilitiesSettings() {
        await this.openNewSettingsSubpage(this.nu.vendorsNav, this.nu.vendorCapabilitiesNav);
    }

    async navigateToNewVendorSubscriptionSettings() {
        await this.openNewSettingsSubpage(this.nu.vendorsNav, this.nu.vendorSubscriptionNav);
    }

    async navigateToNewStoreStatsSettings() {
        await this.openNewSettingsSubpage(this.nu.vendorsNav, this.nu.storeStatsNav);
    }

    async getEnableSellingOptionFromNewSettings(): Promise<string> {
        await this.navigateToNewVendorOnboardingSettings();

        const field = this.page.locator(this.nu.enableSellingField);
        await field.waitFor({ state: 'visible', timeout: 10000 });

        // Rendered as a button group; the active option carries aria-pressed="true".
        // Buttons expose only their label text ("Automatically"/"Manually"/...),
        // so normalise to lowercase to match the old-settings select values.
        const selected = field.locator('button[aria-pressed="true"]').first();
        await selected.waitFor({ state: 'visible', timeout: 10000 });

        const value = (await selected.textContent() || '').trim().toLowerCase();
        if (!value) {
            throw new Error('No selected Enable Selling option found in new settings');
        }
        return value;
    }

    async updateEnableSellingOptionInNewSettings(option: string) {
        await this.navigateToNewVendorOnboardingSettings();

        const field = this.page.locator(this.nu.enableSellingField);
        await field.waitFor({ state: 'visible', timeout: 10000 });

        // option is lowercase (e.g. "automatically"); match the button label case-insensitively.
        const targetButton = field.getByRole('button', { name: new RegExp(`^${option}$`, 'i') });
        await targetButton.waitFor({ state: 'visible', timeout: 10000 });
        if ((await targetButton.getAttribute('aria-pressed')) !== 'true') {
            await targetButton.click();
            await this.saveNewSettings();
        }
    }

    async navigateToOldEnableSellingSettings() {
        await this.goToOldSettings();
        await this.waitForLoadState();

        const sellingMenu = this.page.locator(data.adminSettingsMigration.selectors.oldUI.sellingMenu);
        await sellingMenu.waitFor({ state: 'visible', timeout: 10000 });
        await sellingMenu.click();
        await this.waitForLoadState();
    }

    async getEnableSellingOptionFromOldSettings(): Promise<string> {
        await this.navigateToOldEnableSellingSettings();

        const selectDropdown = this.page.locator('select[id="dokan_selling[new_seller_enable_selling]"]');
        await selectDropdown.waitFor({ state: 'visible', timeout: 10000 });

        return await selectDropdown.inputValue();
    }

    async updateEnableSellingOptionInOldSettings(option: string) {
        await this.navigateToOldEnableSellingSettings();

        const selectDropdown = this.page.locator('select[id="dokan_selling[new_seller_enable_selling]"]');
        await selectDropdown.waitFor({ state: 'visible', timeout: 10000 });
        await selectDropdown.selectOption(option);

        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }


    async updateAddressFieldsOptionInNewSettings(enabled: boolean) {
        await this.navigateToNewVendorOnboardingSettings();
        await this.setNewSwitch(this.nu.addressFieldsField, enabled);
    }

    async getAddressFieldsOptionFromNewSettings(): Promise<boolean> {
        await this.navigateToNewVendorOnboardingSettings();
        return await this.getNewSwitch(this.nu.addressFieldsField);
    }

    async updateAddressFieldsOptionInOldSettings(enabled: boolean) {
        await this.navigateToOldGeneralSettings();

        // Find the switch element
        const switchField = this.page.locator(data.adminSettingsMigration.selectors.oldUI.addressFieldsOptionField);
        await switchField.waitFor({ state: 'visible', timeout: 5000 });

        // Check current state via hidden checkbox and toggle if needed
        const hiddenCheckbox = this.page.locator('.enabled_address_on_reg input[type="checkbox"]');
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

    async getAddressFieldsOptionFromOldSettings(): Promise<boolean> {
        await this.navigateToOldGeneralSettings();

        // Check the hidden checkbox state for current value
        const hiddenCheckbox = this.page.locator('.enabled_address_on_reg input[type="checkbox"]');
        return await hiddenCheckbox.isChecked();
    }

    // New Settings UI methods for Terms and Conditions
    async updateTermsAndConditionsInNewSettings(enabled: boolean) {
        await this.navigateToNewVendorOnboardingSettings();
        await this.setNewSwitch(this.nu.termsConditionsField, enabled);
    }

    async getTermsAndConditionsFromNewSettings(): Promise<boolean> {
        await this.navigateToNewVendorOnboardingSettings();
        return await this.getNewSwitch(this.nu.termsConditionsField);
    }

    // Old Settings UI methods for Terms and Conditions
    async updateTermsAndConditionsInOldSettings(enabled: boolean) {
        await this.navigateToOldGeneralSettings();

        // Locate the switch field
        const switchField = this.page.locator(data.adminSettingsMigration.selectors.oldUI.enableTermsAndConditions);
        await switchField.waitFor({ state: 'visible', timeout: 5000 });

        // Locate the hidden checkbox
        const hiddenCheckbox = this.page.locator('.enable_tc_on_reg input[type="checkbox"]');
        const isCurrentlyChecked = await hiddenCheckbox.isChecked();

        // Toggle if needed
        if (isCurrentlyChecked !== enabled) {
            await switchField.click();
        }

        // Click Save Changes button
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getTermsAndConditionsFromOldSettings(): Promise<boolean> {
        await this.navigateToOldGeneralSettings();

        // Check hidden checkbox state for current value
        const hiddenCheckbox = this.page.locator('.enable_tc_on_reg input[type="checkbox"]');
        return await hiddenCheckbox.isChecked();
    }

    // New Settings UI methods for Welcome Wizard
    async updateWelcomeWizardInNewSettings(enabled: boolean) {
        await this.navigateToNewVendorOnboardingSettings();
        await this.setNewSwitch(this.nu.welcomeWizardField, enabled);
    }

    async getWelcomeWizardFromNewSettings(): Promise<boolean> {
        await this.navigateToNewVendorOnboardingSettings();
        return await this.getNewSwitch(this.nu.welcomeWizardField);
    }

    // Old Settings UI methods for Welcome Wizard.
    // Legacy stores the inverse (`disable_welcome_wizard`), so "enabled" == !disabled.
    async updateWelcomeWizardInOldSettings(enabled: boolean) {
        await this.navigateToOldGeneralSettings();

        // Locate the switch field
        const switchField = this.page.locator(data.adminSettingsMigration.selectors.oldUI.disableWelcomeWizard);
        await switchField.waitFor({ state: 'visible', timeout: 5000 });

        // Locate the hidden checkbox
        const hiddenCheckbox = this.page.locator('.disable_welcome_wizard input[type="checkbox"]');
        const isCurrentlyChecked = await hiddenCheckbox.isChecked();

        // Toggle if needed (legacy "disable" must be the inverse of "enabled")
        if (isCurrentlyChecked !== ! enabled) {
            await switchField.click();
        }

        // Click Save Changes button
        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        // Wait for save completion
        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getWelcomeWizardFromOldSettings(): Promise<boolean> {
        await this.navigateToOldGeneralSettings();

        // Legacy field is `disable_welcome_wizard`; "enabled" is its inverse.
        const hiddenCheckbox = this.page.locator('.disable_welcome_wizard input[type="checkbox"]');
        return ! ( await hiddenCheckbox.isChecked() );
    }

    // New Settings UI methods for Vendor Setup Wizard Message
    async updateVendorSetupWizardMessageInNewSettings(message: string) {
        await this.navigateToNewVendorOnboardingSettings();

        // The message editor is a contenteditable div, not a Quill/textarea element.
        const editorField = this.page.locator(this.nu.setupWizardMessageField).locator('[contenteditable="true"]').first();
        await editorField.waitFor({ state: 'visible', timeout: 10000 });
        await editorField.click();
        await editorField.fill(message);
        await this.saveNewSettings();
    }

    async getVendorSetupWizardMessageFromNewSettings(): Promise<string> {
        await this.navigateToNewVendorOnboardingSettings();

        const editorField = this.page.locator(this.nu.setupWizardMessageField).locator('[contenteditable="true"]').first();
        await editorField.waitFor({ state: 'visible', timeout: 10000 });
        return (await editorField.innerText()).trim();
    }

    // Old Settings UI methods for Vendor Setup Wizard Message
    async updateVendorSetupWizardMessageInOldSettings(message: string) {
        await this.navigateToOldGeneralSettings();

        // Wait for the editor field container to be visible
        await this.page.locator('.setup_wizard_message .editor_field').waitFor({ state: 'visible', timeout: 5000 });

        // Find the iframe by its class and attributes (more stable than ID)
        const frameHandle = await this.page.frameLocator('iframe[id*="dokan-tinymce"][id$="_ifr"]');
        await frameHandle.locator('body').fill(message);

        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getVendorSetupWizardMessageFromOldSettings(): Promise<string> {
        await this.navigateToOldGeneralSettings();

        // Wait for the editor field container to be visible
        await this.page.locator('.setup_wizard_message .editor_field').waitFor({ state: 'visible', timeout: 5000 });

        // Find the iframe by its class and attributes (more stable than ID)
        const frameHandle = this.page.frameLocator('iframe[id*="dokan-tinymce"][id$="_ifr"]');
        const message = await frameHandle.locator('body').innerText();

        return message.trim();
    }


    // --------- //
    // ******** //
    //----------///


    // Generic methods to update and get old settings based on parameters
    async updateOldSetting(enabled: boolean, navigationFunction: string, fieldKey: string, checkboxClass: string) {
        await (this as any)[navigationFunction]();

        const switchField = this.page.locator(data.adminSettingsMigration.selectors.oldUI[fieldKey as keyof typeof data.adminSettingsMigration.selectors.oldUI]);
        await switchField.waitFor({ state: 'visible', timeout: 5000 });

        const hiddenCheckbox = this.page.locator(`.${checkboxClass} input[type="checkbox"]`);
        const isCurrentlyChecked = await hiddenCheckbox.isChecked();

        if (isCurrentlyChecked !== enabled) {
            await switchField.click();
        }

        const saveButton = this.page.locator(data.adminSettingsMigration.selectors.oldUI.saveChanges);
        await saveButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveButton.click();

        await this.page.waitForTimeout(2000);
        await this.waitForLoadState();
    }

    async getOldSetting(navigationFunction: string, checkboxClass: string): Promise<boolean> {
        await (this as any)[navigationFunction]();

        const hiddenCheckbox = this.page.locator(`.${checkboxClass} input[type="checkbox"]`);
        return await hiddenCheckbox.isChecked();
    }

    // Generic switch update/get for the new settings UI. `fieldId` is the flat
    // schema id, i.e. the settings-field-<id> data-testid suffix.
    async updateNewSettings(navigationFunction: string, fieldId: string, enabled: boolean) {
        await (this as any)[navigationFunction]();
        await this.setNewSwitch(`[data-testid="settings-field-${fieldId}"]`, enabled);
    }

    async getNewSettings(navigationFunction: string, fieldId: string): Promise<boolean> {
        await (this as any)[navigationFunction]();
        return await this.getNewSwitch(`[data-testid="settings-field-${fieldId}"]`);
    }

}
