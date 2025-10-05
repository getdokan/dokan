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

});