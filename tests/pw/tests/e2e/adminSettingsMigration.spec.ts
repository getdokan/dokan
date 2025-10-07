import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminSettingsPage } from '@pages/adminSettingsPage';
import { data } from '@utils/testData';

test.describe('Admin Settings Migration', () => {
    let loginPage: LoginPage;
    let adminSettingsPage: AdminSettingsPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        adminSettingsPage = new AdminSettingsPage(page);
        
        // Login as admin
        await loginPage.adminLogin(data.admin);
    });

    // Test for `General -> Marketplace -> Vendor Store URL` settings synchronization.
    test('should maintain bi-directional data synchronization for vendor store url settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Test scenario following the exact steps from issue description
        const testData = data.adminSettingsMigration.testData;
        
        // Step 1: Navigate to new settings and update the vendor store URL value
        await adminSettingsPage.updateVendorStoreUrlInNewSettings(testData.initialStoreUrl);
        
        // Step 2: Navigate to old settings and verify the data synchronization
        const oldValueAfterNewUpdate = await adminSettingsPage.getVendorStoreUrlFromOldSettings();
        expect(oldValueAfterNewUpdate).toBe(testData.initialStoreUrl);
        
        // Step 3: Update the value in old settings and refresh the page to verify current page data
        await adminSettingsPage.updateVendorStoreUrlInOldSettings(testData.updatedStoreUrlFromOld);
        await adminSettingsPage.navigateToOldGeneralSettings();
        await page.waitForTimeout(1000); // Allow page to fully load
        const oldValueAfterRefresh = await adminSettingsPage.getVendorStoreUrlFromOldSettings();
        expect(oldValueAfterRefresh).toBe(testData.updatedStoreUrlFromOld);
        
        // Step 4: Navigate to new settings and verify the synchronized data
        const newValueAfterOldUpdate = await adminSettingsPage.getVendorStoreUrlFromNewSettings();
        expect(newValueAfterOldUpdate).toBe(testData.updatedStoreUrlFromOld);
        
        // Step 5: Update the value in new settings and refresh the page to verify self-updated data
        await adminSettingsPage.updateVendorStoreUrlInNewSettings(testData.finalStoreUrl);
        await adminSettingsPage.navigateToNewMarketplaceSettings();
        await page.waitForTimeout(1000); // Allow page to fully load
        const newValueAfterRefresh = await adminSettingsPage.getVendorStoreUrlFromNewSettings();
        expect(newValueAfterRefresh).toBe(testData.finalStoreUrl);
    });

    // Test for `General -> Marketplace -> Single Seller Mode` settings synchronization.
    test('should maintain bi-directional data synchronization for single seller mode settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Test scenario following the exact steps from issue description
        let status = await adminSettingsPage.getSingleSellerModeFromNewSettings();
        status = !status; // Toggle the initial status for testing
        // Step 1: Update new settings to false 
        await adminSettingsPage.updateSingleSellerModeInNewSettings(status);
        // Step 2: Navigate old settings and verify the value is false
        const oldValueAfterNewDisable = await adminSettingsPage.getSingleSellerModeFromOldSettings();
        expect(oldValueAfterNewDisable).toBe(status);
        
        // Step 3: Update old settings to true and refresh and check the current page value is true
        await adminSettingsPage.updateSingleSellerModeInOldSettings(status);
        await adminSettingsPage.navigateToOldGeneralSettings();
        await page.waitForTimeout(1000); // Allow page to fully load
        const oldValueAfterRefresh = await adminSettingsPage.getSingleSellerModeFromOldSettings();
        expect(oldValueAfterRefresh).toBe(status);
        
        // Step 4: Navigate to new settings and check the current page value is true
        const newValueAfterOldEnable = await adminSettingsPage.getSingleSellerModeFromNewSettings();
        expect(newValueAfterOldEnable).toBe(status);
        status = !status;
        // Step 5: Update to false and refresh the page and check the current page value is false
        await adminSettingsPage.updateSingleSellerModeInNewSettings(status);
        await adminSettingsPage.navigateToNewMarketplaceSettings();
        await page.waitForTimeout(1000); // Allow page to fully load
        const newValueAfterRefresh = await adminSettingsPage.getSingleSellerModeFromNewSettings();
        expect(newValueAfterRefresh).toBe(status);
    });

    // Test for `General -> Marketplace -> Store Category` settings synchronization.
    test('should maintain bi-directional data synchronization for store category settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Test scenario following the exact steps from issue description
        const testData = data.adminSettingsMigration.testData;
        
        // Step 1: Update new settings to 'none'
        await adminSettingsPage.updateStoreCategoryInNewSettings('none');
        
        // Step 2: Navigate old settings and verify the value is 'none'
        const oldValueAfterNewUpdate = await adminSettingsPage.getStoreCategoryFromOldSettings();
        expect(oldValueAfterNewUpdate).toBe('none');
        
        // Step 3: Update old settings to 'multiple' and refresh and check the current page value is 'multiple'
        await adminSettingsPage.updateStoreCategoryInOldSettings('multiple');
        await page.waitForTimeout(1000); // Allow page to fully load
        const oldValueAfterRefresh = await adminSettingsPage.getStoreCategoryFromOldSettings();
        expect(oldValueAfterRefresh).toBe('multiple');
        
        // Step 4: Navigate to new settings and check the current page value is 'multiple'
        const newValueAfterOldUpdate = await adminSettingsPage.getStoreCategoryFromNewSettings();
        expect(newValueAfterOldUpdate).toBe('multiple');
        
        // Step 5: Update to 'none' and refresh the page and check the current page value is 'single'
        await adminSettingsPage.updateStoreCategoryInNewSettings('single');
        await page.waitForTimeout(1000); // Allow page to fully load
        const newValueAfterRefresh = await adminSettingsPage.getStoreCategoryFromNewSettings();
        expect(newValueAfterRefresh).toBe('single');
    });


    test('should maintain bi-directional data synchronization for show customer details to vendors settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Test scenario for verifying synchronization of "Show customer details to vendors" setting between new and old UIs
        
        // Step 1: Get current status from new settings and toggle it
        let status = await adminSettingsPage.getShowCustomerDetailsToVendorsFromNewSettings();
        await adminSettingsPage.updateShowCustomerDetailsToVendorsInNewSettings(!status);

        // Step 2: Verify in old settings (mapping is inverted from hide_customer_info)
        const oldValueAfterNewUpdate1 = await adminSettingsPage.getShowCustomerDetailsFromOldSettings();
        expect(oldValueAfterNewUpdate1).toBe(!status); // New toggle should reflect inverted value in old settings
        
        // Step 3: Update old settings back to original status
        await adminSettingsPage.updateShowCustomerDetailsInOldSettings(status);
        const oldValueAfterNewUpdate2 = await adminSettingsPage.getShowCustomerDetailsFromOldSettings();
        expect(oldValueAfterNewUpdate2).toBe(status); // Old settings should match updated value

        // Step 4: Verify new settings reflect updated value from old settings
        const newValueAfterOldUpdate2 = await adminSettingsPage.getShowCustomerDetailsToVendorsFromNewSettings();
        expect(newValueAfterOldUpdate2).toBe(status);

        // Step 5: Toggle again in new settings and verify the updated value
        await adminSettingsPage.updateShowCustomerDetailsToVendorsInNewSettings(!status);
        const newValueAfterOldUpdate1 = await adminSettingsPage.getShowCustomerDetailsToVendorsFromNewSettings();
        expect(newValueAfterOldUpdate1).toBe(!status); // Final value should be inverted correctly
    });

    test('should maintain bi-directional data synchronization for guest product enquiry settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Test scenario for verifying synchronization of "Guest Product Enquiry" setting between new and old UIs

        // Step 1: Get current status from new settings and toggle it
        let status = await adminSettingsPage.getGuestProductEnquiryFromNewSettings();
        await adminSettingsPage.updateGuestProductEnquiryInNewSettings(!status);

        // Step 2: Verify in old settings (mapping: dokan_selling.enable_guest_user_enquiry)
        const oldValueAfterNewUpdate1 = await adminSettingsPage.getGuestProductEnquiryFromOldSettings();
        expect(oldValueAfterNewUpdate1).toBe(!status); // New toggle should reflect correctly in old settings

        // Step 3: Update old settings back to original status
        await adminSettingsPage.updateGuestProductEnquiryInOldSettings(status);
        const oldValueAfterNewUpdate2 = await adminSettingsPage.getGuestProductEnquiryFromOldSettings();
        expect(oldValueAfterNewUpdate2).toBe(status); // Old settings should match updated value

        // Step 4: Verify new settings reflect updated value from old settings
        const newValueAfterOldUpdate2 = await adminSettingsPage.getGuestProductEnquiryFromNewSettings();
        expect(newValueAfterOldUpdate2).toBe(status);

        // Step 5: Toggle again in new settings and verify the updated value
        await adminSettingsPage.updateGuestProductEnquiryInNewSettings(!status);
        const newValueAfterOldUpdate1 = await adminSettingsPage.getGuestProductEnquiryFromNewSettings();
        expect(newValueAfterOldUpdate1).toBe(!status); // Final value should be inverted correctly
    });

    test('should maintain bi-directional data synchronization for Add to Cart Button Visibility settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Step 1: Get current status from new settings and toggle it
        let status = await adminSettingsPage.getAddToCartButtonVisibilityFromNewSettings();
        await adminSettingsPage.updateAddToCartButtonVisibilityInNewSettings(!status);

        // Step 2: Verify in old settings (mapping: dokan_selling.catalog_mode_hide_add_to_cart_button)
        const oldValueAfterNewUpdate1 = await adminSettingsPage.getAddToCartButtonVisibilityFromOldSettings();
        expect(oldValueAfterNewUpdate1).toBe(!status); // New toggle should reflect correctly in old settings

        // Step 3: Update old settings back to original status
        await adminSettingsPage.updateAddToCartButtonVisibilityInOldSettings(status);
        const oldValueAfterNewUpdate2 = await adminSettingsPage.getAddToCartButtonVisibilityFromOldSettings();
        expect(oldValueAfterNewUpdate2).toBe(status); // Old settings should match updated value

        // Step 4: Verify new settings reflect updated value from old settings
        const newValueAfterOldUpdate2 = await adminSettingsPage.getAddToCartButtonVisibilityFromNewSettings();
        expect(newValueAfterOldUpdate2).toBe(status);

        // Step 5: Toggle again in new settings and verify the updated value
        await adminSettingsPage.updateAddToCartButtonVisibilityInNewSettings(!status);
        const newValueAfterOldUpdate1 = await adminSettingsPage.getAddToCartButtonVisibilityFromNewSettings();
        expect(newValueAfterOldUpdate1).toBe(!status); // Final value should be inverted correctly
    });

    test('should maintain bi-directional data synchronization for Live Search Options settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Test scenario for verifying synchronization of "Live Search Options" setting between new and old UIs

        // Step 1: Get current value from new settings and toggle it
        let currentValue = await adminSettingsPage.getLiveSearchOptionFromNewSettings();
        const newValue = currentValue === 'suggestion_box' ? 'old_live_search' : 'suggestion_box';
        await adminSettingsPage.updateLiveSearchOptionInNewSettings(newValue);

        // Step 2: Verify in old settings (mapping: dokan_live_search_setting.live_search_option)
        const oldValueAfterNewUpdate1 = await adminSettingsPage.getLiveSearchOptionFromOldSettings();
        expect(oldValueAfterNewUpdate1).toBe(newValue); // New UI change should reflect in old settings

        // Step 3: Update old settings back to the original value
        await adminSettingsPage.updateLiveSearchOptionInOldSettings(currentValue);
        const oldValueAfterNewUpdate2 = await adminSettingsPage.getLiveSearchOptionFromOldSettings();
        expect(oldValueAfterNewUpdate2).toBe(currentValue); // Old settings should now match the reverted value

        // Step 4: Verify new settings reflect the updated value from old settings
        const newValueAfterOldUpdate2 = await adminSettingsPage.getLiveSearchOptionFromNewSettings();
        expect(newValueAfterOldUpdate2).toBe(currentValue);

        // Step 5: Toggle again in new settings and verify it updates correctly
        const secondToggleValue = currentValue === 'suggestion_box' ? 'old_live_search' : 'suggestion_box';
        await adminSettingsPage.updateLiveSearchOptionInNewSettings(secondToggleValue);
        const finalNewValue = await adminSettingsPage.getLiveSearchOptionFromNewSettings();
        expect(finalNewValue).toBe(secondToggleValue);
    });

    test('should maintain bi-directional data synchronization for Enable Selling settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Test scenario for verifying synchronization of "Enable Selling" setting between new and old UIs

        // Step 1: Get current value from new settings and toggle it
        let currentValue = await adminSettingsPage.getEnableSellingOptionFromNewSettings();
        const newValue = currentValue === 'automatically' ? 'manually' : 'automatically';
        await adminSettingsPage.updateEnableSellingOptionInNewSettings(newValue);

        // Step 2: Verify in old settings (mapping: dokan_selling.new_seller_enable_selling)
        const oldValueAfterNewUpdate1 = await adminSettingsPage.getEnableSellingOptionFromOldSettings();
        expect(oldValueAfterNewUpdate1).toBe(newValue); // New UI change should reflect in old settings

        // Step 3: Update old settings back to the original value
        await adminSettingsPage.updateEnableSellingOptionInOldSettings(currentValue);
        const oldValueAfterNewUpdate2 = await adminSettingsPage.getEnableSellingOptionFromOldSettings();
        expect(oldValueAfterNewUpdate2).toBe(currentValue); // Old settings should now match the reverted value

        // Step 4: Verify new settings reflect the updated value from old settings
        const newValueAfterOldUpdate2 = await adminSettingsPage.getEnableSellingOptionFromNewSettings();
        expect(newValueAfterOldUpdate2).toBe(currentValue);

        // Step 5: Toggle again in new settings and verify it updates correctly
        const secondToggleValue = currentValue === 'automatically' ? 'manually' : 'automatically';
        await adminSettingsPage.updateEnableSellingOptionInNewSettings(secondToggleValue);
        const finalNewValue = await adminSettingsPage.getEnableSellingOptionFromNewSettings();
        expect(finalNewValue).toBe(secondToggleValue);
    });

    test('should maintain bi-directional data synchronization for Address Fields setting', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Test scenario for verifying synchronization of "Address Fields" setting between new and old UIs

        // Step 1: Get current value from new settings and toggle it
        let currentValue = await adminSettingsPage.getAddressFieldsOptionFromNewSettings();
        const newValue = !currentValue;
        await adminSettingsPage.updateAddressFieldsOptionInNewSettings(newValue);

        // Step 2: Verify in old settings (mapping: dokan_general.enabled_address_on_reg)
        const oldValueAfterNewUpdate1 = await adminSettingsPage.getAddressFieldsOptionFromOldSettings();
        expect(oldValueAfterNewUpdate1).toBe(newValue); // New UI change should reflect in old settings

        // Step 3: Update old settings back to the original value
        await adminSettingsPage.updateAddressFieldsOptionInOldSettings(currentValue);
        const oldValueAfterNewUpdate2 = await adminSettingsPage.getAddressFieldsOptionFromOldSettings();
        expect(oldValueAfterNewUpdate2).toBe(currentValue); // Old settings should now match the reverted value

        // Step 4: Verify new settings reflect the updated value from old settings
        const newValueAfterOldUpdate2 = await adminSettingsPage.getAddressFieldsOptionFromNewSettings();
        expect(newValueAfterOldUpdate2).toBe(currentValue);

        // Step 5: Toggle again in new settings and verify it updates correctly
        const secondToggleValue = !currentValue;
        await adminSettingsPage.updateAddressFieldsOptionInNewSettings(secondToggleValue);
        const finalNewValue = await adminSettingsPage.getAddressFieldsOptionFromNewSettings();
        expect(finalNewValue).toBe(secondToggleValue);
    });

    test('should maintain bi-directional data synchronization for terms and conditions setting', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Test scenario for verifying synchronization of "Terms and Conditions" setting between new and old UIs
        
        // Step 1: Get current status from new settings and toggle it
        let status = await adminSettingsPage.getTermsAndConditionsFromNewSettings();
        await adminSettingsPage.updateTermsAndConditionsInNewSettings(!status);

        // Step 2: Verify the updated value is reflected in old settings (mapping: dokan_general.enable_tc_on_reg)
        const oldValueAfterNewUpdate1 = await adminSettingsPage.getTermsAndConditionsFromOldSettings();
        expect(oldValueAfterNewUpdate1).toBe(!status); // New toggle should reflect correctly in old settings

        // Step 3: Update old settings back to original status
        await adminSettingsPage.updateTermsAndConditionsInOldSettings(status);
        const oldValueAfterNewUpdate2 = await adminSettingsPage.getTermsAndConditionsFromOldSettings();
        expect(oldValueAfterNewUpdate2).toBe(status); // Old settings should match updated value

        // Step 4: Verify new settings reflect updated value from old settings
        const newValueAfterOldUpdate2 = await adminSettingsPage.getTermsAndConditionsFromNewSettings();
        expect(newValueAfterOldUpdate2).toBe(status);

        // Step 5: Toggle again in new settings and verify the updated value
        await adminSettingsPage.updateTermsAndConditionsInNewSettings(!status);
        const newValueAfterOldUpdate1 = await adminSettingsPage.getTermsAndConditionsFromNewSettings();
        expect(newValueAfterOldUpdate1).toBe(!status); // Final value should be inverted correctly
    });

    // Test for `General -> Marketplace -> Welcome Wizard` settings synchronization.
    test('should maintain bi-directional data synchronization for welcome wizard setting', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Test scenario for verifying synchronization of "Welcome Wizard" setting between new and old UIs

        // Step 1: Get current status from new settings and toggle it
        let status = await adminSettingsPage.getWelcomeWizardFromNewSettings();
        await adminSettingsPage.updateWelcomeWizardInNewSettings(!status);

        // Step 2: Verify the updated value is reflected in old settings (mapping: dokan_general.disable_welcome_wizard)
        const oldValueAfterNewUpdate1 = await adminSettingsPage.getWelcomeWizardFromOldSettings();
        expect(oldValueAfterNewUpdate1).toBe(!status); // New toggle should reflect correctly in old settings

        // Step 3: Update old settings back to original status
        await adminSettingsPage.updateWelcomeWizardInOldSettings(status);
        const oldValueAfterNewUpdate2 = await adminSettingsPage.getWelcomeWizardFromOldSettings();
        expect(oldValueAfterNewUpdate2).toBe(status); // Old settings should match updated value

        // Step 4: Verify new settings reflect updated value from old settings
        const newValueAfterOldUpdate2 = await adminSettingsPage.getWelcomeWizardFromNewSettings();
        expect(newValueAfterOldUpdate2).toBe(status);

        // Step 5: Toggle again in new settings and verify the updated value
        await adminSettingsPage.updateWelcomeWizardInNewSettings(!status);
        const newValueAfterOldUpdate1 = await adminSettingsPage.getWelcomeWizardFromNewSettings();
        expect(newValueAfterOldUpdate1).toBe(!status); // Final value should be inverted correctly
    });

    // Test for selecting and saving a Vendor Setup Wizard Logo
    test('should select and save a Vendor Setup Wizard Logo', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Step 1: Navigate to Vendor Onboarding Settings
        await adminSettingsPage.navigateToNewVendorOnboardingSettings();

        // Step 2: Locate the "+ Choose File" button and click it
        const chooseFileButton = page.locator('div.flex.items-center [role="button"] >> button:has-text("+ Choose File")');
        await chooseFileButton.waitFor({ state: 'visible', timeout: 10000 });
        await chooseFileButton.click();

        // Step 3: Select the first available image dynamically
        const firstImageCheckbox = page.locator('.attachments-wrapper li[role="checkbox"]').first();
        await firstImageCheckbox.waitFor({ state: 'visible', timeout: 10000 });
        await firstImageCheckbox.check();

        // Step 4: Click "Use this media" to confirm the selection
        const useMediaButton = page.getByRole('button', { name: 'Use this media' });
        await useMediaButton.waitFor({ state: 'visible', timeout: 5000 });
        await useMediaButton.click();

        // Step 5: Click the "Save" button in Vendor Onboarding settings page
        const saveSettingsButton = page.getByRole('button', { name: 'Save' });
        await saveSettingsButton.waitFor({ state: 'visible', timeout: 5000 });
        await saveSettingsButton.click();

        // Step 6: Verify that the selected image URL appears in the input field
        const logoInput = page.locator('input[name="dokan-file-upload-url"]');
        await logoInput.waitFor({ state: 'visible', timeout: 5000 });
        const selectedLogoUrl = await logoInput.inputValue();

        expect(selectedLogoUrl).not.toBe('');
        console.log('Selected Vendor Setup Wizard Logo URL:', selectedLogoUrl);
    });

    test('should maintain bi-directional data synchronization for vendor setup wizard message settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Test scenario following the exact steps from issue description
        const testData = data.adminSettingsMigration.testData;
        
        // Step 1: Navigate to new settings and update the Vendor Setup Wizard Message value
        await adminSettingsPage.updateVendorSetupWizardMessageInNewSettings(testData.initialWizardMessage);
        
        // Step 2: Navigate to old settings and verify the data synchronization
        const oldValueAfterNewUpdate = await adminSettingsPage.getVendorSetupWizardMessageFromOldSettings();
        expect(oldValueAfterNewUpdate).toBe(testData.initialWizardMessage);
        
        // Step 3: Update the value in old settings and refresh the page to verify current page data
        await adminSettingsPage.updateVendorSetupWizardMessageInOldSettings(testData.updatedWizardMessageFromOld);
        await adminSettingsPage.navigateToOldGeneralSettings();
        await page.waitForTimeout(1000); // Allow page to fully load
        const oldValueAfterRefresh = await adminSettingsPage.getVendorSetupWizardMessageFromOldSettings();
        expect(oldValueAfterRefresh).toBe(testData.updatedWizardMessageFromOld);
        
        // Step 4: Navigate to new settings and verify the synchronized data
        const newValueAfterOldUpdate = await adminSettingsPage.getVendorSetupWizardMessageFromNewSettings();
        expect(newValueAfterOldUpdate).toBe(testData.updatedWizardMessageFromOld);
        
        // Step 5: Update the value in new settings and refresh the page to verify self-updated data
        await adminSettingsPage.updateVendorSetupWizardMessageInNewSettings(testData.finalWizardMessage);
        await adminSettingsPage.navigateToNewMarketplaceSettings();
        await page.waitForTimeout(1000); // Allow page to fully load
        const newValueAfterRefresh = await adminSettingsPage.getVendorSetupWizardMessageFromNewSettings();
        expect(newValueAfterRefresh).toBe(testData.finalWizardMessage);
    });



    // Vendor Capabilities //
    //---------------------//
    // ******************* //

    // Test for `Vendor Capabilities -> Duplicate Product` settings synchronization.
    test('should maintain bi-directional data synchronization for Duplicate Product', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {

        const oldNavigationFunction = 'navigateToOldSellingOptions'; 
        const newNavigationFunction = 'navigateToNewVendorCapabilitiesSettings'; 
        const checkboxClass = 'vendor_duplicate_product'; 
        const fieldSelectorId = 'dokan_settings_vendor_vendor_capabilities_vendor_capabilities_duplicate_product'; 
        const fieldKey = 'dublicateProductField'; 

        // Step 1: Get current status from new settings and toggle it
        let status = await adminSettingsPage.getNewSettings(newNavigationFunction, fieldSelectorId);
        await adminSettingsPage.updateNewSettings(newNavigationFunction, fieldSelectorId, !status);

        // Step 2: Verify in old settings (mapping: dokan_selling.show_vendor_info)
        const oldValueAfterNewUpdate1 = await adminSettingsPage.getOldSetting(oldNavigationFunction, checkboxClass);
        expect(oldValueAfterNewUpdate1).toBe(!status); // New toggle should reflect correctly in old settings

        // Step 3: Update old settings back to original status
        await adminSettingsPage.updateOldSetting(status, oldNavigationFunction, fieldKey, checkboxClass);
        const oldValueAfterNewUpdate2 = await adminSettingsPage.getOldSetting(oldNavigationFunction, checkboxClass);
        expect(oldValueAfterNewUpdate2).toBe(status); // Old settings should match updated value

        // Step 4: Verify new settings reflect updated value from old settings
        const newValueAfterOldUpdate2 = await adminSettingsPage.getNewSettings(newNavigationFunction, fieldSelectorId);
        expect(newValueAfterOldUpdate2).toBe(status);

        // Step 5: Toggle again in new settings and verify the updated value
        await adminSettingsPage.updateNewSettings(newNavigationFunction, fieldSelectorId, !status);
        const newValueAfterOldUpdate1 = await adminSettingsPage.getNewSettings(newNavigationFunction, fieldSelectorId);
        expect(newValueAfterOldUpdate1).toBe(!status); // Final value should be inverted correctly
    });

    // Test for `Vendor Capabilities -> Allow vendors to create orders settings syncronization

});