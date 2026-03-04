import { test, expect } from '@playwright/test';
import { AbuseReportsPage } from './abuseReportsPage';
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


test.describe('Abuse Reports Tests @lite', () => {
    // ============================================
    // TEST CASES...
    // ===========================================
    // Note: To use a specific user session, create context with storageState
    // Example:
    // const context = await browser.newContext({ storageState: a1 });
    // const page = await context.newPage();

    test('Test Case 1 - Enable Report Abuse Module', async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        // Navigate to the modules page
        await abuseReportsPage.goToModulesPage();

        // Search for the Report Abuse module
        await abuseReportsPage.searchModule('Report Abuse');

        // Enable the module if it is currently disabled, otherwise skip
        await abuseReportsPage.enableReportAbuseModuleIfDisabled();

        // Verify the module is now enabled
        const isEnabled = await abuseReportsPage.isReportAbuseModuleEnabled();
        expect(isEnabled, 'Report Abuse module should be enabled').toBe(true);

        await abuseReportsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 2 - Customer Submits an Abuse Report', async ({ browser }) => {
        // Using customer session storage
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(customerPage);

        // Navigate to the product page
        await abuseReportsPage.goToProductPage();

        // Click the "Report Abuse" link to open the modal
        await abuseReportsPage.clickReportAbuseLink();

        // Select the "This content is spam" reason
        await abuseReportsPage.selectSpamReason();

        // Fill in the abuse report description
        await abuseReportsPage.fillAbuseDescription('Test Abuse Reports 1');

        // Submit the abuse report
        await abuseReportsPage.submitAbuseReport();

        // Confirm the submission by clicking OK on the confirmation modal
        await abuseReportsPage.confirmAbuseReportSubmission();

        await abuseReportsPage.waitForPageReady();
        await customerPage.close();
        await context.close();
    });

    test('Test Case 3 - Admin Views and Deletes Abuse Report', async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        // Navigate to the abuse reports admin page
        await abuseReportsPage.goToAbuseReports();

        // Verify the reported reason is visible in the list
        const isReasonVisible = await abuseReportsPage.isTextVisible(abuseReportsPage.testData.abuseReports.reportReason);
        expect(isReasonVisible, '"This content is spam" should be visible in the abuse reports list').toBe(true);

        // Verify the reported product name is visible
        const isProductVisible = await abuseReportsPage.isTextVisible(abuseReportsPage.testData.abuseReports.productName);
        expect(isProductVisible, '"p1_v1 (simple)" should be visible in the abuse reports list').toBe(true);

        // Verify the vendor store name is visible
        const isStoreVisible = await adminPage.getByText(abuseReportsPage.testData.abuseReports.storeName, { exact: true }).isVisible();
        expect(isStoreVisible, '"vendor1store" should be visible in the abuse reports list').toBe(true);

        // Verify the reporter (customer) name is visible
        const isReporterVisible = await abuseReportsPage.isTextVisible(abuseReportsPage.testData.abuseReports.reporterName);
        expect(isReporterVisible, '"customer1" should be visible in the abuse reports list').toBe(true);

        // Select the first report row via its checkbox
        await abuseReportsPage.checkFirstReportRowCheckbox();

        // Click the Delete button to open the confirmation modal
        await abuseReportsPage.clickDeleteButton();

        // Confirm deletion in the modal
        await abuseReportsPage.confirmDeleteReport();

        await abuseReportsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 4 - Admin Configures Product Report Abuse Settings', async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        // Navigate to the Dokan settings page
        await abuseReportsPage.goToSettingsPage();

        // Search for "product report abuse" in the settings search box
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);

        // Verify the "Product Report Abuse Settings" heading is visible
        const isHeadingVisible = await abuseReportsPage.isSettingsHeadingVisible();
        expect(isHeadingVisible, '"Product Report Abuse Settings" heading should be visible').toBe(true);

        // Verify the doc link contains the correct URL
        const docLinkHref = await abuseReportsPage.getSettingsDocLinkHref();
        expect(docLinkHref, 'Doc link should contain the correct Dokan documentation URL').toContain(abuseReportsPage.testData.abuseReports.settingsDocUrl);

        // Verify the "Reported by" section heading is visible
        const isReportedByVisible = await abuseReportsPage.isReportedByHeadingVisible();
        expect(isReportedByVisible, '"Reported by" heading should be visible').toBe(true);

        // Enable the "Reported by" slider if it is currently off
        await abuseReportsPage.enableReportedBySliderIfDisabled();

        // Verify the "Reasons for Abuse Report" section heading is visible
        const isReasonsVisible = await abuseReportsPage.isReasonsHeadingVisible();
        expect(isReasonsVisible, '"Reasons for Abuse Report" heading should be visible').toBe(true);

        // Type a new reason in the last reason input field
        await abuseReportsPage.fillNewAbuseReason(abuseReportsPage.testData.abuseReports.newReasonText);

        // Click the plus button to add the new reason
        await abuseReportsPage.clickAddReasonPlusButton();

        // Click the plus button again to add another empty reason row
        await abuseReportsPage.clickAddReasonPlusButton();

        // Save all settings changes
        await abuseReportsPage.clickSaveChanges();

        await abuseReportsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 5 - Customer Sees Custom Abuse Reason on Product Page', async ({ browser }) => {
        // Using customer session storage
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(customerPage);

        // Navigate to the product page
        await abuseReportsPage.goToProductPage();

        // Click the "Report Abuse" link to open the modal
        await abuseReportsPage.clickReportAbuseLink();

        // Click the custom reason label "Test1"
        await abuseReportsPage.clickCustomReasonLabel('Test1');

        // Verify the label text is "Test1"
        const labelText = await abuseReportsPage.getCustomReasonLabelText('Test1');
        expect(labelText, 'Custom abuse reason label should display "Test1"').toBe('Test1');

        await abuseReportsPage.waitForPageReady();
        await customerPage.close();
        await context.close();
    });

    test('Test Case 6 - Admin Disables Reported By and Removes Custom Reason', async ({ browser }) => {
        // Using admin session storage
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        // Navigate to the Dokan settings page
        await abuseReportsPage.goToSettingsPage();

        // Search for "product report abuse" in the settings search box
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);

        // Turn off the "Reported by" slider if it is currently on, otherwise skip
        await abuseReportsPage.disableReportedBySliderIfEnabled();

        // Remove the custom "Test1" reason
        await abuseReportsPage.removeAbuseReason(abuseReportsPage.testData.abuseReports.newReasonText);

        // Save all settings changes and wait for the save to complete
        await abuseReportsPage.clickSaveChanges();

        await abuseReportsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });
});
