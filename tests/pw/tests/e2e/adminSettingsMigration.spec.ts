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
    // Test for `General -> Page Setup -> Dashboard` settings synchronization.
test('should maintain bi-directional data synchronization for dashboard page settings', { tag: ['@lite', '@admin', '@migration'] }, async ({ page }) => {
    const testData = data.adminSettingsMigration.testData;
    
    // Step 1: Navigate to new settings and update the dashboard page
    const savedOption =await adminSettingsPage.updateDashboardPageInNewSettings(testData.dashboardPageId);
    expect(savedOption).toBe(testData.dashboardPageId);
    // Step 2: Navigate to old settings and verify the data synchronization
    const oldValueAfterNewUpdate = await adminSettingsPage.getDashboardPageFromOldSettings();
    expect(oldValueAfterNewUpdate).toBe(testData.dashboardPageId);
    
    // Step 3: Update the value in old settings and refresh the page to verify current page data
    await adminSettingsPage.updateDashboardPageInOldSettings(testData.alternativeDashboardPageId);
    await adminSettingsPage.navigateToOldGeneralSettings();
    await page.waitForTimeout(1000);
    // Step 4: Navigate to new settings and verify the synchronized data
    const newValueAfterOldUpdate = await adminSettingsPage.getDashboardPageFromNewSettings();
    expect(newValueAfterOldUpdate).toBe(testData.alternativeDashboardPageId);
});
test('should maintain bi-directional data synchronization for My Orders page settings', 
  { tag: ['@lite', '@admin', '@migration'] }, 
  async ({ page }) => {
    
    const testData = data.adminSettingsMigration.testData;
    
    // Step 1: Navigate to new settings and update the My Orders page
    const savedOption = await adminSettingsPage.updateMyOrdersPageInNewSettings(testData.myOrdersPageId);
    expect(savedOption).toBe(testData.myOrdersPageId);
    // Step 2: Navigate to old settings and verify the data synchronization
    const oldValueAfterNewUpdate = await adminSettingsPage.getMyOrdersPageFromOldSettings();
    expect(oldValueAfterNewUpdate).toBe(testData.myOrdersPageId);
    
    // Step 3: Update the value in old settings and refresh the page to verify current page data
    await adminSettingsPage.updateMyOrdersPageInOldSettings(testData.alternativeMyOrdersPageId);
    await adminSettingsPage.navigateToOldGeneralSettings();
    await page.waitForTimeout(1000);
    
    // Step 4: Navigate to new settings and verify the synchronized data
    const newValueAfterOldUpdate = await adminSettingsPage.getMyOrdersPageFromNewSettings();
    expect(newValueAfterOldUpdate).toBe(testData.alternativeMyOrdersPageId);
});
test('should maintain bi-directional data synchronization for Store Listing page settings', 
  { tag: ['@lite', '@admin', '@migration'] }, 
  async ({ page }) => {
    
    const testData = data.adminSettingsMigration.testData;
    
    // Step 1: Navigate to new settings and update the Store Listing page
    const savedOption = await adminSettingsPage.updateStoreListingPageInNewSettings(testData.storeListingPageId);
    expect(savedOption).toBe(testData.storeListingPageId);
    // Step 2: Navigate to old settings and verify the data synchronization
    const oldValueAfterNewUpdate = await adminSettingsPage.getStoreListingPageFromOldSettings();
    expect(oldValueAfterNewUpdate).toBe(testData.storeListingPageId);
    
    // Step 3: Update the value in old settings and refresh the page to verify current page data
    await adminSettingsPage.updateStoreListingPageInOldSettings(testData.alternativeStoreListingPageId);
    await adminSettingsPage.navigateToOldGeneralSettings();
    await page.waitForTimeout(1000);
    
    // Step 4: Navigate to new settings and verify the synchronized data
    const newValueAfterOldUpdate = await adminSettingsPage.getStoreListingPageFromNewSettings();
    expect(newValueAfterOldUpdate).toBe(testData.alternativeStoreListingPageId);
});
test('should maintain bi-directional data synchronization for Terms & Conditions page settings', 
  { tag: ['@lite', '@admin', '@migration'] }, 
  async ({ page }) => {
    
    const testData = data.adminSettingsMigration.testData;
    
    // Step 1: Update new settings
    const savedOption = await adminSettingsPage.updateTermsAndConditionsPageInNewSettings(testData.termsAndConditionsPageId);
    expect(savedOption).toBe(testData.termsAndConditionsPageId);

    // Step 2: Verify old settings
    const oldValueAfterNewUpdate = await adminSettingsPage.getTermsAndConditionsPageFromOldSettings();
    expect(oldValueAfterNewUpdate).toBe(testData.termsAndConditionsPageId);
    
    // Step 3: Update old settings
    await adminSettingsPage.updateTermsAndConditionsPageInOldSettings(testData.alternativeTermsAndConditionsPageId);
    await adminSettingsPage.navigateToOldGeneralSettings();
    await page.waitForTimeout(1000);
    
    // Step 4: Verify new settings
    const newValueAfterOldUpdate = await adminSettingsPage.getTermsAndConditionsPageFromNewSettings();
    expect(newValueAfterOldUpdate).toBe(testData.alternativeTermsAndConditionsPageId);
});
// ------------------ New Settings UI: Location ------------------
// ------------------ New Settings UI: Map API & Google Maps API Key ------------------
test('should maintain bi-directional data synchronization for Map API source and Google Maps API key',
  { tag: ['@lite', '@admin', '@migration'] },
  async ({ page }) => {
    const testData = data.adminSettingsMigration.testData;

    // -----------------------------
    // Step 1: Update in New Settings
    // -----------------------------
    await adminSettingsPage.updateMapApiSourceInNewSettings(testData.mapApiSource);
    const savedApi = await adminSettingsPage.getMapApiSourceFromNewSettings();
    const savedKey = await adminSettingsPage.updateGoogleMapsApiKeyInNewSettings(testData.mapboxApiKey);
    expect(savedApi).toBe(testData.mapApiSource);
    expect(savedKey).toBe(testData.mapboxApiKey);

    // -----------------------------
    // Step 2: Verify in Old Settings
    // -----------------------------
    const oldApi = await adminSettingsPage.getMapApiSourceFromOldSettings();
    expect(oldApi).toBe(testData.mapApiSource);

    const oldKey = await adminSettingsPage.getGoogleMapsApiKeyFromOldSettings();
    expect(oldKey).toBe(testData.mapboxApiKey);

    // -----------------------------
    // Step 3: Update in Old Settings
    // -----------------------------
    await adminSettingsPage.updateMapApiSourceInOldSettings(testData.googleMaps);
    await adminSettingsPage.updateGoogleMapsApiKeyInOldSettings(testData.googleMapsApiKey);

    // -----------------------------
    // Step 4: Verify in New Settings
    // -----------------------------
    const newApiAfterOldUpdate = await adminSettingsPage.getMapApiSourceFromNewSettings();
    expect(newApiAfterOldUpdate).toBe(testData.googleMaps);

    const newKeyAfterOldUpdate = await adminSettingsPage.getGoogleMapsApiKeyFromNewSettings();
    expect(newKeyAfterOldUpdate).toBe(testData.googleMapsApiKey);
  });
// Bi-directional Location Map Position sync test
test('should maintain bi-directional data synchronization for Location Map Position', 
  { tag: ['@lite', '@admin', '@migration'] }, 
  async ({ page }) => {

    const testData = data.adminSettingsMigration.testData; // e.g., { mapPosition: 'Top', alternativeMapPosition: 'Left' }

    // Step 1: Update in New Settings
    const savedPosition = await adminSettingsPage.updateMapPositionInNewSettings(testData.mapPosition);
    expect(savedPosition).toBe(testData.mapPosition);

    // Step 2: Verify in Old Settings
    const oldValue = await adminSettingsPage.getMapPositionFromOldSettings();
    expect(oldValue).toBe(testData.mapPosition);

    // Step 3: Update in Old Settings
    await adminSettingsPage.updateMapPositionInOldSettings(testData.alternativeMapPosition);

    // Step 4: Verify in New Settings
    const newValueAfterOldUpdate = await adminSettingsPage.getMapPositionFromNewSettings();
    expect(newValueAfterOldUpdate).toBe(testData.alternativeMapPosition);
});
 test('should maintain bi-directional data synchronization for location settings (excluding map position)', 
  { tag: ['@lite', '@admin', '@migration'] }, 
  async ({ page }) => {

    const testData = data.adminSettingsMigration.testData;
    
await adminSettingsPage.setLocationMapSettingsAndSave({
    showFiltersBeforeMap: testData.showFiltersBeforeMap,
    radiusUnit: testData.radiusUnit,
    minDistance: testData.minDistance,
    maxDistance: testData.maxDistance,
    mapZoomLevel: testData.mapZoomLevel
});
const savedSwitch = await adminSettingsPage.getShowFiltersBeforeMap();
expect(savedSwitch).toBe(testData.showFiltersBeforeMap);

const savedRadius = await adminSettingsPage.getRadiusSearchUnit();
expect(savedRadius).toBe(testData.radiusUnit);

const savedMin = await adminSettingsPage.getMinDistance();
expect(savedMin).toBe(testData.minDistance);

const savedMax = await adminSettingsPage.getMaxDistance();
expect(savedMax).toBe(testData.maxDistance);

const savedZoom = await adminSettingsPage.getMapZoomLevel();
expect(savedZoom).toBe(testData.mapZoomLevel);
    // -----------------------------
    // Step 2: Verify in Old UI
    // -----------------------------

    const oldSwitch = await adminSettingsPage.getShowFiltersBeforeMapFromOldSettings();
    expect(oldSwitch).toBe(testData.showFiltersBeforeMap);

    const oldRadius = await adminSettingsPage.getRadiusSearchUnitFromOldSettings();
    expect(oldRadius).toBe(testData.radiusUnit);

    const oldMin = await adminSettingsPage.getMinDistanceFromOldSettings();
    expect(oldMin).toBe(testData.minDistance);

    const oldMax = await adminSettingsPage.getMaxDistanceFromOldSettings();
    expect(oldMax).toBe(testData.maxDistance);

    const oldZoom = await adminSettingsPage.getMapZoomLevelFromOldSettings();
    expect(oldZoom).toBe(testData.mapZoomLevel);

    // -----------------------------
    // Step 3: Update in Old UI with alternative values
    // -----------------------------
    await adminSettingsPage.setShowFiltersBeforeMapInOldSettings(testData.alternativeShowFiltersBeforeMap);
    await adminSettingsPage.setRadiusSearchUnitInOldSettings(testData.alternativeRadiusUnit);
    await adminSettingsPage.setMinDistanceInOldSettings(testData.alternativeMinDistance);
    await adminSettingsPage.setMaxDistanceInOldSettings(testData.alternativeMaxDistance);
    await adminSettingsPage.setMapZoomLevelInOldSettings(testData.alternativeZoomLevel);

    // -----------------------------
    // Step 4: Verify updated values in New UI
    // -----------------------------
    const newSwitchAfterOld = await adminSettingsPage.getShowFiltersBeforeMap();
    expect(newSwitchAfterOld).toBe(testData.alternativeShowFiltersBeforeMap);

    const newRadiusAfterOld = await adminSettingsPage.getRadiusSearchUnit();
    expect(newRadiusAfterOld).toBe(testData.alternativeRadiusUnit);

    const newMinAfterOld = await adminSettingsPage.getMinDistance();
    expect(newMinAfterOld).toBe(testData.alternativeMinDistance);

    const newMaxAfterOld = await adminSettingsPage.getMaxDistance();
    expect(newMaxAfterOld).toBe(testData.alternativeMaxDistance);

    const newZoomAfterOld = await adminSettingsPage.getMapZoomLevel();
    expect(newZoomAfterOld).toBe(testData.alternativeZoomLevel);
});
test('should properly save and persist Map Placement Locations selection in new settings',
  { tag: ['@lite', '@admin', '@migration'] },
  async ({ page }) => {

    const testData = data.adminSettingsMigration.testData;
    const selectedOptions = ['store_listing', 'shop_page', 'single_product_location_tab'];

    // Step 1: Select all options and save
    const savedSelections = await adminSettingsPage.updateMapPlacementLocationsInNewSettings(selectedOptions);
    expect(savedSelections.sort()).toEqual(selectedOptions.sort());

    // Step 2: Reload and verify all are saved correctly
    const reloadedSelections = await adminSettingsPage.getMapPlacementLocationsFromNewSettings();
    expect(reloadedSelections.sort()).toEqual(selectedOptions.sort());

    // Step 3: Unselect all and save again
    await adminSettingsPage.updateMapPlacementLocationsInNewSettings([]);

    // Step 4: Reload and verify all are unselected
    const unselectedAfterReload = await adminSettingsPage.getMapPlacementLocationsFromNewSettings();
    expect(unselectedAfterReload.length).toBe(0);
});
});