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
        
        // Step 1: Update new settings to false
        await adminSettingsPage.updateSingleSellerModeInNewSettings(false);
        
        // Step 2: Navigate old settings and verify the value is false
        const oldValueAfterNewDisable = await adminSettingsPage.getSingleSellerModeFromOldSettings();
        expect(oldValueAfterNewDisable).toBe(false);
        
        // Step 3: Update old settings to true and refresh and check the current page value is true
        await adminSettingsPage.updateSingleSellerModeInOldSettings(true);
        await adminSettingsPage.navigateToOldGeneralSettings();
        await page.waitForTimeout(1000); // Allow page to fully load
        const oldValueAfterRefresh = await adminSettingsPage.getSingleSellerModeFromOldSettings();
        expect(oldValueAfterRefresh).toBe(true);
        
        // Step 4: Navigate to new settings and check the current page value is true
        const newValueAfterOldEnable = await adminSettingsPage.getSingleSellerModeFromNewSettings();
        expect(newValueAfterOldEnable).toBe(true);
        
        // Step 5: Update to false and refresh the page and check the current page value is false
        await adminSettingsPage.updateSingleSellerModeInNewSettings(false);
        await adminSettingsPage.navigateToNewMarketplaceSettings();
        await page.waitForTimeout(1000); // Allow page to fully load
        const newValueAfterRefresh = await adminSettingsPage.getSingleSellerModeFromNewSettings();
        expect(newValueAfterRefresh).toBe(false);
    });

    // Test for `General -> Marketplace -> Store Category` settings synchronization.
    test.skip('should maintain bi-directional data synchronization for store category settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
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


    test.skip('should maintain bi-directional data synchronization for show customer details to vendors settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
        // Test scenario for verifying synchronization of "Show customer details to vendors" setting between new and old UIs
        const testData = data.adminSettingsMigration.testData;

        // Step 1: Update value in new settings to true
        await adminSettingsPage.updateShowCustomerDetailsToVendorsInNewSettings(true);
        
        // Step 2: Verify in old settings (mapping is inverted from hide_customer_info)
        const oldValueAfterNewUpdate = await adminSettingsPage.getShowCustomerDetailsFromOldSettings();
        expect(oldValueAfterNewUpdate).toBe(true); // true in new → hide_customer_info = false in old (inverted)
        
        // Step 3: Update value in old settings to false and verify persistence
        await adminSettingsPage.updateShowCustomerDetailsInOldSettings(false);
        await adminSettingsPage.navigateToOldGeneralSettings();
        await page.waitForTimeout(1000); // wait for page load
        const oldValueAfterRefresh = await adminSettingsPage.getShowCustomerDetailsFromOldSettings();
        expect(oldValueAfterRefresh).toBe(false);
        
        //Step 4: Verify synchronization in new settings (inverted mapping)
        const newValueAfterOldUpdate = await adminSettingsPage.getShowCustomerDetailsToVendorsFromNewSettings();
        expect(newValueAfterOldUpdate).toBe(false); // false in old → true in new (inverted)
        
        //Step 5: Update value in new settings to false and verify persistence
        await adminSettingsPage.updateShowCustomerDetailsToVendorsInNewSettings(false);
        await adminSettingsPage.navigateToNewMarketplaceSettings();
        await page.waitForTimeout(1000); // wait for page load
        const newValueAfterRefresh = await adminSettingsPage.getShowCustomerDetailsToVendorsFromNewSettings();
        expect(newValueAfterRefresh).toBe(false);
    });

});