import { test, expect } from '@playwright/test';
import { CommissionPage } from './commissionPage';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');        // Admin session storage
const v1 = path.join(__dirname, '../../../playwright/.auth/vendorStorageState.json');       // Vendor 1 session storage
const v2 = path.join(__dirname, '../../../playwright/.auth/vendor2StorageState.json');      // Vendor 2 session storage
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');     // Customer 1 session storage

// ============================================
// TEST SETUP
// ============================================

test.describe('Commission Tests @lite', () => {
    // ============================================
    // TEST CASES
    // ============================================
    // Note: To use a specific user session, create context with storageState
    // Example:
    // const context = await browser.newContext({ storageState: a1 });
    // const page = await context.newPage();

    test('Test Case 1 - Admin Configures Fixed Commission Settings', async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const commissionPage = new CommissionPage(adminPage);

        // Go to Dokan settings
        await commissionPage.goToSettingsPage();

        // Click the settings nav tab to open Selling Options
        await commissionPage.clickSettingsNavTab();

        // Set percentage: click, clear, type 10,00 in #percentage-val-id, then save
        await commissionPage.setPercentageValue(commissionPage.testData.commission.percentageValue);
        await commissionPage.clickSubmitButton();

        // Page reloads after save — re-open Selling Options tab before interacting
        await commissionPage.clickSettingsNavTab();

        // Set fixed: click, clear, type 5,00 in fixed input, then save
        await commissionPage.setFixedValue(commissionPage.testData.commission.fixedValue);
        await commissionPage.clickSubmitButton();

        await commissionPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 2 - Admin Configures Category Based Commission Settings', async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const commissionPage = new CommissionPage(adminPage);

        // Go to Dokan settings
        await commissionPage.goToSettingsPage();

        // Click Selling Options tab
        await commissionPage.openSellingOptionsTab();

        // Select "Category Based" from commission type dropdown
        await commissionPage.selectCommissionType(commissionPage.testData.commission.categoryBasedType);
        await adminPage.waitForLoadState('domcontentloaded');

        // First category input: click, clear, type "5"
        await commissionPage.setCategoryBasedPercentageValue(commissionPage.testData.commission.categoryBasedValue);
        await commissionPage.waitForTimeout(3000);

        // Second category input: click, clear, type "5"
        await commissionPage.setCategoryBasedFixedValue(commissionPage.testData.commission.categoryBasedValue);
        await commissionPage.waitForTimeout(3000);

        // Save and wait for DOM content load
        await commissionPage.clickSubmitButton();

        await commissionPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 3 - Admin Creates Product with Commission Specific Settings', async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const commissionPage = new CommissionPage(adminPage);
        const data = commissionPage.testData.product;

        // Go to new product page
        await commissionPage.goToNewProductPage();

        // Title: click and type
        await commissionPage.setProductTitle(data.title);

        // Open General product data
        await commissionPage.clickGeneralProductData();
        await commissionPage.setRegularPrice(data.regularPrice);
        await commissionPage.setSalePrice(data.salePrice);

        // Open Advanced product data
        await commissionPage.clickAdvancedProductData();
        await commissionPage.setAdminCommission(data.adminCommission);
        await commissionPage.setPerProductAdminFee(data.perProductAdminFee);

        // Publish and wait for DOM content load
        await commissionPage.clickPublishButton();

        await commissionPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    // Add more test cases here
});
