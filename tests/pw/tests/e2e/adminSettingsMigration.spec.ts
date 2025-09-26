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

    // test('should migrate data from new settings to old settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
    //     // Test scenario: Update value in new settings -> verify in old settings
    //     const testData = data.adminSettingsMigration.testData;
    //
    //     // Step 1: Set initial value in new settings
    //     await adminSettingsPage.updateVendorStoreUrlInNewSettings(testData.initialStoreUrl);
    //
    //     // Step 2: Verify initial value appears in old settings
    //     const initialOldValue = await adminSettingsPage.getVendorStoreUrlFromOldSettings();
    //     expect(initialOldValue).toBe(testData.initialStoreUrl);
    //
    //     // Step 3: Update value in new settings
    //     await adminSettingsPage.updateVendorStoreUrlInNewSettings(testData.updatedStoreUrlFromNew);
    //
    //     // Step 4: Verify updated value appears in old settings
    //     const updatedOldValue = await adminSettingsPage.getVendorStoreUrlFromOldSettings();
    //     expect(updatedOldValue).toBe(testData.updatedStoreUrlFromNew);
    // });
    //
    // test('should migrate data from old settings to new settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
    //     // Test scenario: Update value in old settings -> verify in new settings
    //     const testData = data.adminSettingsMigration.testData;
    //
    //     // Step 1: Set initial value in old settings
    //     await adminSettingsPage.updateVendorStoreUrlInOldSettings(testData.initialStoreUrl);
    //
    //     // Step 2: Verify initial value appears in new settings
    //     const initialNewValue = await adminSettingsPage.getVendorStoreUrlFromNewSettings();
    //     expect(initialNewValue).toBe(testData.initialStoreUrl);
    //
    //     // Step 3: Update value in old settings
    //     await adminSettingsPage.updateVendorStoreUrlInOldSettings(testData.updatedStoreUrlFromOld);
    //
    //     // Step 4: Verify updated value appears in new settings
    //     const updatedNewValue = await adminSettingsPage.getVendorStoreUrlFromNewSettings();
    //     expect(updatedNewValue).toBe(testData.updatedStoreUrlFromOld);
    // });

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
});