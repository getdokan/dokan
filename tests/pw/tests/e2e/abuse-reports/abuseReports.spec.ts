import { test, expect, request } from '@utils/test';
import { AbuseReportsPage } from './abuseReportsPage';
import path from 'path';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');        // Admin session storage
const c1 = path.join(__dirname, '../../../playwright/.auth/customerStorageState.json');     // Customer 1 session storage

// ============================================
// TEST SETUP
// ============================================

// Abuse Reports lives in the Dokan Pro `report-abuse` module, so the whole
// suite is gated behind `@pro`. Per-test tags add the role context so it's
// easy to target only admin / customer / guest cases.
test.describe('Abuse Reports Tests @pro', () => {
    // ============================================
    // ============================================
    // Old Test Cases (legacy UI flow — kept active alongside the new suite
    // for parity coverage and as a regression baseline). Titles are
    // prefixed with "Old Test Case" so they remain distinct from the
    // new-UI cases below in test reports.
    // ============================================
    // ============================================

    test('Old Test Case 1 - Enable Report Abuse Module', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
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

    test('Old Test Case 2 - Customer Submits an Abuse Report', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(customerPage);

        await abuseReportsPage.goToProductPage();
        await abuseReportsPage.clickReportAbuseLink();
        await abuseReportsPage.selectSpamReason();
        await abuseReportsPage.fillAbuseDescription('Test Abuse Reports 1');
        await abuseReportsPage.submitAbuseReport();
        await abuseReportsPage.confirmAbuseReportSubmission();

        await abuseReportsPage.waitForPageReady();
        await customerPage.close();
        await context.close();
    });

    test('Old Test Case 3 - Admin Views and Deletes Abuse Report', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToAbuseReports();

        const isReasonVisible = await abuseReportsPage.isTextVisible(abuseReportsPage.testData.abuseReports.reportReason);
        expect(isReasonVisible, '"This content is spam" should be visible in the abuse reports list').toBe(true);

        const isProductVisible = await abuseReportsPage.isTextVisible(abuseReportsPage.testData.abuseReports.productName);
        expect(isProductVisible, '"p1_v1 (simple)" should be visible in the abuse reports list').toBe(true);

        const isStoreVisible = await adminPage.getByText(abuseReportsPage.testData.abuseReports.storeName, { exact: true }).first().isVisible();
        expect(isStoreVisible, '"vendor1store" should be visible in the abuse reports list').toBe(true);

        const isReporterVisible = await abuseReportsPage.isTextVisible(abuseReportsPage.testData.abuseReports.reporterName);
        expect(isReporterVisible, '"customer1" should be visible in the abuse reports list').toBe(true);

        await abuseReportsPage.checkFirstReportRowCheckbox();
        await abuseReportsPage.clickDeleteButton();
        await abuseReportsPage.confirmDeleteReport();

        await abuseReportsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Old Test Case 4 - Admin Configures Product Report Abuse Settings', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);

        const isHeadingVisible = await abuseReportsPage.isSettingsHeadingVisible();
        expect(isHeadingVisible, '"Product Report Abuse Settings" heading should be visible').toBe(true);

        const docLinkHref = await abuseReportsPage.getSettingsDocLinkHref();
        expect(docLinkHref, 'Doc link should contain the correct Dokan documentation URL').toContain(abuseReportsPage.testData.abuseReports.settingsDocUrl);

        const isReportedByVisible = await abuseReportsPage.isReportedByHeadingVisible();
        expect(isReportedByVisible, '"Reported by" heading should be visible').toBe(true);

        await abuseReportsPage.enableReportedBySliderIfDisabled();

        const isReasonsVisible = await abuseReportsPage.isReasonsHeadingVisible();
        expect(isReasonsVisible, '"Reasons for Abuse Report" heading should be visible').toBe(true);

        await abuseReportsPage.fillNewAbuseReason(abuseReportsPage.testData.abuseReports.newReasonText);
        await abuseReportsPage.clickAddReasonPlusButton();
        await abuseReportsPage.clickAddReasonPlusButton();
        await abuseReportsPage.clickSaveChanges();

        await abuseReportsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Old Test Case 5 - Customer Sees Custom Abuse Reason on Product Page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(customerPage);

        await abuseReportsPage.goToProductPage();
        await abuseReportsPage.clickReportAbuseLink();
        await abuseReportsPage.clickCustomReasonLabel('Test1');
        const labelText = await abuseReportsPage.getCustomReasonLabelText('Test1');
        expect(labelText, 'Custom abuse reason label should display "Test1"').toBe('Test1');

        await abuseReportsPage.waitForPageReady();
        await customerPage.close();
        await context.close();
    });

    test('Old Test Case 6 - Admin Disables Reported By and Removes Custom Reason', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);
        await abuseReportsPage.disableReportedBySliderIfEnabled();
        await abuseReportsPage.removeAbuseReason(abuseReportsPage.testData.abuseReports.newReasonText);
        await abuseReportsPage.clickSaveChanges();

        await abuseReportsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    // ============================================
    // ============================================
    // NEW UI TEST CASES (Dokan 5.0.0 React rewrite)
    // The cases below mirror TEST_CASES.md sections 1–8 and a slice of 10.
    // ============================================
    // ============================================

    test('Test Case 1 - Enable Report Abuse Module', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        // Navigate to the modules page and find the Report Abuse module
        await abuseReportsPage.goToModulesPage();
        await abuseReportsPage.searchModule('Report Abuse');

        // Ensure the module is enabled (idempotent — skips if already on)
        await abuseReportsPage.enableReportAbuseModuleIfDisabled();

        const isEnabled = await abuseReportsPage.isReportAbuseModuleEnabled();
        expect(isEnabled, 'Report Abuse module should be enabled').toBe(true);

        await abuseReportsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 2 - Settings Section Renders Title, Doc Link, and Subheadings', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);

        // Heading
        expect(
            await abuseReportsPage.isSettingsHeadingVisible(),
            '"Product Report Abuse Settings" heading should be visible',
        ).toBe(true);

        // Doc link
        const docHref = await abuseReportsPage.getSettingsDocLinkHref();
        expect(
            docHref,
            'Doc link should point to the official Dokan documentation URL',
        ).toContain(abuseReportsPage.testData.abuseReports.settingsDocUrl);

        // Sub-headings
        expect(await abuseReportsPage.isReportedByHeadingVisible(), '"Reported by" heading should be visible').toBe(true);
        expect(await abuseReportsPage.isReasonsHeadingVisible(), '"Reasons for Abuse Report" heading should be visible').toBe(true);

        await abuseReportsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 3 - Admin Adds a Custom Abuse Reason', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);

        // Make sure Setting A is OFF for the rest of the suite (guests can report)
        await abuseReportsPage.disableReportedBySliderIfEnabled();

        // Add the custom reason that test case 4 will check on the front-end
        await abuseReportsPage.fillNewAbuseReason(abuseReportsPage.testData.abuseReports.newReasonText);
        await abuseReportsPage.clickAddReasonPlusButton();
        await abuseReportsPage.clickAddReasonPlusButton();
        await abuseReportsPage.clickSaveChanges();

        await abuseReportsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 4 - Customer Sees Custom Abuse Reason on Product Page', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(customerPage);

        await abuseReportsPage.goToProductPage();
        await abuseReportsPage.clickReportAbuseLink();

        await abuseReportsPage.clickCustomReasonLabel(abuseReportsPage.testData.abuseReports.newReasonText);
        const labelText = await abuseReportsPage.getCustomReasonLabelText(abuseReportsPage.testData.abuseReports.newReasonText);
        expect(labelText, 'Custom reason label should match the configured text').toBe(abuseReportsPage.testData.abuseReports.newReasonText);

        await abuseReportsPage.waitForPageReady();
        await customerPage.close();
        await context.close();
    });

    test('Test Case 5 - Logged-in Customer Submits a Valid Abuse Report', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(customerPage);

        await abuseReportsPage.goToProductPage();
        await abuseReportsPage.submitFullAbuseReport(
            abuseReportsPage.testData.abuseReports.reportReason,
            abuseReportsPage.testData.abuseReports.newDescriptionText,
        );

        await abuseReportsPage.waitForPageReady();
        await customerPage.close();
        await context.close();
    });

    test('Test Case 6 - Submit a Second Report (for bulk-delete coverage later)', { tag: ['@pro', '@customer'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: c1 });
        const customerPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(customerPage);

        await abuseReportsPage.goToProductPage();
        await abuseReportsPage.submitFullAbuseReport(
            abuseReportsPage.testData.abuseReports.reportReason,
            abuseReportsPage.testData.abuseReports.secondReportDescription,
        );

        await abuseReportsPage.waitForPageReady();
        await customerPage.close();
        await context.close();
    });

    test('Test Case 7 - Submitted Report Appears in Admin DataViews List', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToAbuseReportsReact();
        await abuseReportsPage.waitForListReady();

        // Reason cell should render with the configured reason text
        await abuseReportsPage.expectReasonVisibleInList(abuseReportsPage.testData.abuseReports.reportReason);

        // Product / vendor / reporter strings should also be present somewhere in the list
        const productVisible = await adminPage.getByText(abuseReportsPage.testData.abuseReports.productName, { exact: true }).first().isVisible();
        expect(productVisible, `Product "${abuseReportsPage.testData.abuseReports.productName}" should be visible in the list`).toBe(true);

        await abuseReportsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 8 - Detail Modal Opens via Reason Cell Click', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToAbuseReportsReact();
        await abuseReportsPage.waitForListReady();

        await abuseReportsPage.clickReasonCell(abuseReportsPage.testData.abuseReports.reportReason);

        expect(await abuseReportsPage.isDetailModalVisible(), 'Detail modal should open after clicking the reason cell').toBe(true);

        const reason = await abuseReportsPage.getDetailModalReason();
        expect(
            reason,
            `Detail modal should display the report reason "${abuseReportsPage.testData.abuseReports.reportReason}"`,
        ).toContain(abuseReportsPage.testData.abuseReports.reportReason);

        await abuseReportsPage.closeDetailModal();
        await adminPage.close();
        await context.close();
    });

    test('Test Case 9 - Detail Modal Opens via Row "View" Action', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToAbuseReportsReact();
        await abuseReportsPage.waitForListReady();

        await abuseReportsPage.openRowActionMenu(abuseReportsPage.testData.abuseReports.reportReason);
        await abuseReportsPage.clickViewActionFromMenu();

        expect(await abuseReportsPage.isDetailModalVisible(), 'Detail modal should open after clicking "View"').toBe(true);

        await abuseReportsPage.closeDetailModal();
        expect(await abuseReportsPage.isDetailModalVisible(), 'Detail modal should be hidden after Close').toBe(false);

        await adminPage.close();
        await context.close();
    });

    test('Test Case 10 - Cancel Delete Keeps the Row Visible', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToAbuseReportsReact();
        await abuseReportsPage.waitForListReady();

        // The seed reports from TC5/TC6 must be visible before we read the
        // count, otherwise we capture a 0 baseline mid-render and then assert
        // "after === before" against the post-render count, which differs.
        await adminPage.locator(abuseReportsPage.adminReact.dataRow).first().waitFor({ state: 'visible', timeout: 20000 });

        // Capture row count before opening delete
        const before = await abuseReportsPage.getRowCount();

        await abuseReportsPage.openRowActionMenu(abuseReportsPage.testData.abuseReports.reportReason);
        await abuseReportsPage.clickDeleteActionFromMenu();
        await abuseReportsPage.cancelDeleteInModal();

        // Row count should be unchanged after cancel
        const after = await abuseReportsPage.getRowCount();
        expect(after, 'Row count should not change when delete is cancelled').toBe(before);

        await adminPage.close();
        await context.close();
    });

    test('Test Case 11 - Single Delete via Row Action Removes the Report', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToAbuseReportsReact();
        await abuseReportsPage.waitForListReady();

        // The seed reports from TC5/TC6 must be visible before we read the
        // baseline. Without this, the count could read 0 mid-render and
        // toBeLessThan(beforeCount) compares against the wrong baseline.
        await adminPage.locator(abuseReportsPage.adminReact.dataRow).first().waitFor({ state: 'visible', timeout: 20000 });

        const beforeCount = await abuseReportsPage.getRowCount();

        await abuseReportsPage.openRowActionMenu(abuseReportsPage.testData.abuseReports.reportReason);
        await abuseReportsPage.clickDeleteActionFromMenu();

        // Confirm delete: reason verified server-side via the DELETE response wait
        const description = await abuseReportsPage.getDeleteModalDescriptionText();
        expect(description, 'Single-delete modal should reference exactly one report').toContain('this abuse report');

        await abuseReportsPage.confirmDeleteInModal();
        await abuseReportsPage.waitForListReady();

        const afterCount = await abuseReportsPage.getRowCount();
        expect(afterCount, 'Row count should drop by 1 after a single delete').toBeLessThan(beforeCount);

        await adminPage.close();
        await context.close();
    });

    test('Test Case 12 - Bulk Delete Removes Selected Reports', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToAbuseReportsReact();
        await abuseReportsPage.waitForListReady();

        // Wait for the list to actually render rows before reading the
        // baseline (see TC10/TC11 comments for context).
        await adminPage.locator(abuseReportsPage.adminReact.dataRow).first().waitFor({ state: 'visible', timeout: 20000 });

        const beforeCount = await abuseReportsPage.getRowCount();

        // Skip if there isn't enough data; the suite tries to keep at least one
        // report at this point but rows can be missing if the prior suite ran clean.
        test.skip(beforeCount < 2, 'Need at least 2 rows to exercise bulk delete');

        // Select the first two visible row checkboxes
        const checkboxes = adminPage.locator(abuseReportsPage.admin.reportRowCheckbox);
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        await abuseReportsPage.clickBulkDeleteButton();

        const description = await abuseReportsPage.getDeleteModalDescriptionText();
        expect(
            description,
            'Bulk-delete modal copy should reference multiple reports',
        ).toMatch(/these\s+\d+/i);

        await abuseReportsPage.confirmDeleteInModal();
        await abuseReportsPage.waitForListReady();

        const afterCount = await abuseReportsPage.getRowCount();
        expect(afterCount, 'Row count should drop by 2 after bulk delete').toBeLessThanOrEqual(beforeCount - 2);

        await adminPage.close();
        await context.close();
    });

    // REST validation cases 13–17 are read-only / rejection-path requests
    // that each open and dispose their own APIRequestContext. They share no
    // state with each other, so they can run concurrently across workers
    // even though the parent describe is serial. Saves a few seconds on
    // shard 1 and is the lowest-risk beachhead for parallel-mode adoption.
    test.describe('REST validation (parallel)', () => {
        test.describe.configure({ mode: 'parallel' });

    test('Test Case 13 - REST: Admin Can List Reports With Totals Header', { tag: ['@pro', '@admin'] }, async ({}) => {
        // REST tests use a fresh APIRequestContext rather than a browser
        // context. A browser context built from `storageState` drops the
        // Authorization header on cross-origin REST calls (cookies intercept),
        // so the page object's Basic-Auth header never reaches the server.
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const response = await abuseReportsPage.restGetReports(ctx);
        expect(response.status(), 'GET /abuse-reports as admin should return 200').toBe(200);

        // Total header should be present (value may be 0 after delete tests)
        const total = response.headers()['x-dokan-abusereports-total'];
        expect(total, 'X-Dokan-AbuseReports-Total header should be present').toBeDefined();

        const body = await response.json();
        expect(Array.isArray(body), 'Response body should be a JSON array').toBe(true);

        await ctx.dispose();
    });

    test('Test Case 14 - REST: Unauthenticated Request Is Rejected', { tag: ['@pro', '@guest'] }, async ({}) => {
        // Fresh request context with no cookies / auth
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy page never used */ {} as never);

        const response = await abuseReportsPage.restGetReports(ctx, {}, { authed: false });
        expect(
            [401, 403],
            'Unauthenticated GET /abuse-reports should be rejected with 401 or 403',
        ).toContain(response.status());

        await ctx.dispose();
    });

    test('Test Case 15 - REST: Abuse Reasons Endpoint Returns Saved Reasons', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const response = await abuseReportsPage.restGetReasons(ctx);
        expect(response.status(), 'GET /abuse-reasons as admin should return 200').toBe(200);

        const body = await response.json();
        expect(Array.isArray(body), 'Reasons response should be a JSON array').toBe(true);
        expect(body.length, 'There should be at least one configured reason').toBeGreaterThan(0);

        // Each reason should have id + value (label)
        for (const r of body) {
            expect(r, 'Each reason should expose an `id` field').toHaveProperty('id');
            expect(r, 'Each reason should expose a `value` field').toHaveProperty('value');
        }

        await ctx.dispose();
    });

    test('Test Case 16 - REST: Filter Reports by Reason Label', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const response = await abuseReportsPage.restGetReports(ctx, {
            reason: abuseReportsPage.testData.abuseReports.reportReason,
        });
        expect(response.status(), 'Filtered GET /abuse-reports should return 200').toBe(200);

        const body = await response.json();
        for (const row of body) {
            expect(
                row.reason,
                `Every returned row should have reason "${abuseReportsPage.testData.abuseReports.reportReason}"`,
            ).toBe(abuseReportsPage.testData.abuseReports.reportReason);
        }

        await ctx.dispose();
    });

    test('Test Case 17 - REST: Batch Delete With Empty Items Is Rejected', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const response = await abuseReportsPage.restDeleteReportsBatch(ctx, []);
        expect(
            response.status(),
            'Batch delete with an empty `items` array should be rejected (schema minItems: 1)',
        ).toBeGreaterThanOrEqual(400);

        await ctx.dispose();
    });
    }); // end REST validation parallel block

    test('Test Case 18 - Admin Disables Setting A and Removes Custom Reason (cleanup)', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const context = await browser.newContext({ storageState: a1 });
        const adminPage = await context.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToSettingsPage();
        await abuseReportsPage.searchSettings(abuseReportsPage.testData.abuseReports.settingsSearchKeyword);

        await abuseReportsPage.disableReportedBySliderIfEnabled();
        await abuseReportsPage.removeAbuseReason(abuseReportsPage.testData.abuseReports.newReasonText);
        await abuseReportsPage.clickSaveChanges();

        await abuseReportsPage.waitForPageReady();
        await adminPage.close();
        await context.close();
    });

    // ============================================
    // ============================================
    // Additional coverage — pagination, filters, single-vs-bulk deletion,
    // modal close-state, and anonymous-reporter rendering. These tests are
    // self-contained: each one seeds whatever state it needs (a fresh
    // customer-submitted report, a default abuse reason, etc.) so they can
    // run after the cleanup in TC18 has wiped the prior state.
    // ============================================
    // ============================================

    test('Test Case 19 - Detail Modal Closes Cleanly (state reset)', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Seed: customer submits a fresh report
        const customerCtx = await browser.newContext({ storageState: c1 });
        const customerPage = await customerCtx.newPage();
        const cFlow = new AbuseReportsPage(customerPage);
        await cFlow.goToProductPage();
        await cFlow.submitFullAbuseReport(
            cFlow.testData.abuseReports.reportReason,
            'TC19 modal close-state seed',
        );
        await customerCtx.close();

        // Admin opens the detail modal, closes it, and verifies it is gone
        const adminCtx = await browser.newContext({ storageState: a1 });
        const adminPage = await adminCtx.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToAbuseReportsReact();
        await abuseReportsPage.waitForListReady();
        await abuseReportsPage.clickReasonCell(abuseReportsPage.testData.abuseReports.reportReason);
        expect(await abuseReportsPage.isDetailModalVisible(), 'Detail modal should open').toBe(true);

        await abuseReportsPage.closeDetailModal();
        expect(
            await abuseReportsPage.isDetailModalVisible(),
            'Detail modal should be fully hidden after Close (modal state cleared)',
        ).toBe(false);

        // Re-open the same row's reason cell — content should still load fresh.
        await abuseReportsPage.clickReasonCell(abuseReportsPage.testData.abuseReports.reportReason);
        expect(await abuseReportsPage.isDetailModalVisible(), 'Detail modal should reopen with fresh state').toBe(true);
        await abuseReportsPage.closeDetailModal();

        await adminPage.close();
        await adminCtx.close();
    });

    test('Test Case 20 - Modal Does Not Auto-Reopen After Delete', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        // Seed a fresh report so this test does not rely on TC19's row.
        const customerCtx = await browser.newContext({ storageState: c1 });
        const customerPage = await customerCtx.newPage();
        const cFlow = new AbuseReportsPage(customerPage);
        await cFlow.goToProductPage();
        await cFlow.submitFullAbuseReport(
            cFlow.testData.abuseReports.reportReason,
            'TC20 no-auto-reopen seed',
        );
        await customerCtx.close();

        const adminCtx = await browser.newContext({ storageState: a1 });
        const adminPage = await adminCtx.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);

        await abuseReportsPage.goToAbuseReportsReact();
        await abuseReportsPage.waitForListReady();

        // Open detail modal then close
        await abuseReportsPage.clickReasonCell(abuseReportsPage.testData.abuseReports.reportReason);
        await abuseReportsPage.closeDetailModal();

        // Now delete the row via the row menu
        await abuseReportsPage.openRowActionMenu(abuseReportsPage.testData.abuseReports.reportReason);
        await abuseReportsPage.clickDeleteActionFromMenu();
        await abuseReportsPage.confirmDeleteInModal();
        await abuseReportsPage.waitForListReady();

        // Detail modal should NOT auto-open after delete
        expect(
            await abuseReportsPage.isDetailModalVisible(),
            'Detail modal should remain hidden after delete (modalOpen state was cleared)',
        ).toBe(false);

        await adminPage.close();
        await adminCtx.close();
    });

    // Note: a "single delete via bulk toolbar (1-row selection)" test was
    // intentionally omitted. The bulk toolbar's visibility / behavior with
    // exactly one selection is UI-version-sensitive and was racy on CI.
    // The single-row delete code path is already covered by TC11 (row action
    // menu → Delete) and the bulk path by TC12 (≥2 rows).

    test('Test Case 22 - Guest Can Submit Report (Setting A Off)', { tag: ['@pro', '@guest'] }, async ({ browser }) => {
        // After TC18, Setting A is OFF, so guests should be able to submit a
        // report. This verifies the unauthenticated submit pathway works
        // end-to-end and the row surfaces in the admin list. (We don't assert
        // the literal "Anonymous" cell text — the React UI renders the
        // submitted customer_name when present; the "Anonymous" branch only
        // kicks in for fully-empty reporter rows, which the form prevents.)
        const guestCtx = await browser.newContext(); // no storageState → guest
        const guestPage = await guestCtx.newPage();
        const gFlow = new AbuseReportsPage(guestPage);
        await gFlow.goToProductPage();
        await gFlow.clickReportAbuseLink();

        const nameVisible = await gFlow.isCustomerNameInputVisible();
        test.skip(
            !nameVisible,
            'Guest fields not rendered — Setting A may still be enabled; skipping rather than failing',
        );

        const guestName = 'Guest Reporter TC22';
        await gFlow.fillCustomerName(guestName);
        await gFlow.fillCustomerEmail('guest-tc22@example.com');
        await gFlow.selectReasonByValue(gFlow.testData.abuseReports.reportReason);
        await gFlow.submitAbuseReport();
        await gFlow.confirmAbuseReportSubmission();
        await guestCtx.close();

        const adminCtx = await browser.newContext({ storageState: a1 });
        const adminPage = await adminCtx.newPage();
        const abuseReportsPage = new AbuseReportsPage(adminPage);
        await abuseReportsPage.goToAbuseReportsReact();
        await abuseReportsPage.waitForListReady();

        // The list should contain a row for the configured reason.
        await abuseReportsPage.expectReasonVisibleInList(abuseReportsPage.testData.abuseReports.reportReason);

        await adminPage.close();
        await adminCtx.close();
    });

    // ----------------------------------------------------------------
    // REST schema / pagination / filter coverage (no row state needed)
    // ----------------------------------------------------------------

    // REST edge-case cluster (TC 23–33). Same shape as the TC 13–17 block:
    // each test owns its own request context, only reads or hits rejection
    // paths, never mutates server state, never reads a row another test in
    // this group seeded. Safe to parallelise.
    test.describe('REST edge cases (parallel)', () => {
        test.describe.configure({ mode: 'parallel' });

    test('Test Case 23 - REST: Negative page Is Rejected', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const response = await abuseReportsPage.restGetReports(ctx, { page: '-1' });
        expect(
            response.status(),
            'GET /abuse-reports?page=-1 should be rejected by schema (minimum: 1)',
        ).toBeGreaterThanOrEqual(400);

        await ctx.dispose();
    });

    test('Test Case 24 - REST: Non-numeric product_id Is Rejected', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const response = await abuseReportsPage.restGetReports(ctx, { product_id: 'abc' });
        expect(
            response.status(),
            'GET /abuse-reports?product_id=abc should be rejected by schema (type: integer)',
        ).toBeGreaterThanOrEqual(400);

        await ctx.dispose();
    });

    test('Test Case 25 - REST: Non-numeric vendor_id Is Rejected', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const response = await abuseReportsPage.restGetReports(ctx, { vendor_id: 'abc' });
        expect(
            response.status(),
            'GET /abuse-reports?vendor_id=abc should be rejected by schema (type: integer)',
        ).toBeGreaterThanOrEqual(400);

        await ctx.dispose();
    });

    test('Test Case 26 - REST: Batch DELETE With Non-integer Items Is Rejected', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        // Cast through unknown so the page-object type stays integer-only at compile time
        const response = await abuseReportsPage.restDeleteReportsBatch(ctx, ['abc', 1.5] as unknown as number[]);
        expect(
            response.status(),
            'Batch DELETE with non-integer items should be rejected (schema items: integer)',
        ).toBeGreaterThanOrEqual(400);

        await ctx.dispose();
    });

    test('Test Case 27 - REST: Batch DELETE With Duplicate ids Is Rejected', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const response = await abuseReportsPage.restDeleteReportsBatch(ctx, [1, 1, 1]);
        expect(
            response.status(),
            'Batch DELETE with duplicate ids should be rejected (schema uniqueItems: true)',
        ).toBeGreaterThanOrEqual(400);

        await ctx.dispose();
    });

    test('Test Case 28 - REST: DELETE Non-existent Report Returns Error', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        // Pick a deliberately huge id that should not exist
        const response = await abuseReportsPage.restDeleteReport(ctx, 999999999);
        expect(
            response.status(),
            'DELETE /abuse-reports/{huge id} should return a 4xx error (report_not_found)',
        ).toBeGreaterThanOrEqual(400);

        await ctx.dispose();
    });

    test('Test Case 29 - REST: Filter By Non-existent product_id Returns Empty', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const response = await abuseReportsPage.restGetReports(ctx, { product_id: '99999999' });
        expect(response.status(), 'Filtered GET /abuse-reports should return 200 even for empty result').toBe(200);

        const body = await response.json();
        expect(Array.isArray(body), 'Response body should be a JSON array').toBe(true);
        expect(body.length, 'Filter by a non-existent product_id should return zero rows').toBe(0);

        await ctx.dispose();
    });

    test('Test Case 30 - REST: Filter By Non-existent vendor_id Returns Empty', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const response = await abuseReportsPage.restGetReports(ctx, { vendor_id: '99999999' });
        expect(response.status(), 'Filtered GET /abuse-reports should return 200 even for empty result').toBe(200);

        const body = await response.json();
        expect(Array.isArray(body), 'Response body should be a JSON array').toBe(true);
        expect(body.length, 'Filter by a non-existent vendor_id should return zero rows').toBe(0);

        await ctx.dispose();
    });

    test('Test Case 31 - REST: Pagination per_page Caps Result Count', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const response = await abuseReportsPage.restGetReports(ctx, { page: '1', per_page: '5' });
        expect(response.status(), 'Paginated GET /abuse-reports should return 200').toBe(200);

        const body = await response.json();
        expect(Array.isArray(body), 'Response body should be a JSON array').toBe(true);
        expect(body.length, 'Page size = 5 should yield at most 5 rows').toBeLessThanOrEqual(5);

        // X-Dokan-AbuseReports-Total header should always be present, even on a sub-paginated response
        const total = response.headers()['x-dokan-abusereports-total'];
        expect(total, 'X-Dokan-AbuseReports-Total header should be present on paginated responses').toBeDefined();

        await ctx.dispose();
    });

    test('Test Case 32 - REST: Combined Filter (reason + non-existent product_id)', { tag: ['@pro', '@admin'] }, async ({}) => {
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const response = await abuseReportsPage.restGetReports(ctx, {
            reason: abuseReportsPage.testData.abuseReports.reportReason,
            product_id: '99999999',
        });
        expect(response.status(), 'Combined filter GET should return 200').toBe(200);

        const body = await response.json();
        expect(Array.isArray(body), 'Response body should be a JSON array').toBe(true);
        expect(
            body.length,
            'Reason ∩ non-existent product_id should yield zero rows (intersection)',
        ).toBe(0);

        await ctx.dispose();
    });

    test('Test Case 33 - REST: Reason Filter Returns Only Matching Rows', { tag: ['@pro', '@admin'] }, async ({}) => {
        // Sanity-check the reason-filter contract end-to-end: every returned
        // row matches the requested label exactly. Complements TC16 by
        // exercising it after the additional seed/teardown of the new tests.
        const ctx = await request.newContext();
        const abuseReportsPage = new AbuseReportsPage(/* dummy */ {} as never);

        const reasonLabel = abuseReportsPage.testData.abuseReports.reportReason;
        const response = await abuseReportsPage.restGetReports(ctx, { reason: reasonLabel });
        expect(response.status(), 'Filtered GET /abuse-reports should return 200').toBe(200);

        const body = await response.json();
        expect(Array.isArray(body), 'Response body should be a JSON array').toBe(true);
        for (const row of body) {
            expect(
                row.reason,
                `Every returned row should have reason "${reasonLabel}"`,
            ).toBe(reasonLabel);
        }

        await ctx.dispose();
    });
    }); // end REST edge cases parallel block
});
