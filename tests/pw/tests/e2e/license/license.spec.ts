import { Page, expect, test } from '@playwright/test';
import { LicensePage, db, testData } from './licensePage';
import path from 'path';

import { toPath } from '@utils/helpers';

// ============================================
// SESSION STORAGE VARIABLES
// ============================================
const a1 = path.join(__dirname, '../../../playwright/.auth/adminStorageState.json');

test.describe('License test', () => {
    let admin: LicensePage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext({ storageState: a1 });
        aPage = await adminContext.newPage();
        admin = new LicensePage(aPage);
    });

    test.afterAll(async () => {
        await db.setOptionValue(testData.optionName, testData.dokanProLicense);
        await aPage?.close();
        await db.dispose();
    });

    // admin

    test('admin can view license menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminLicenseRenderProperly();
    });

    test("admin can't activate license with incorrect key", { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await db.setOptionValue(testData.optionName, '', false);
        await admin.activateLicense(testData.dokanLicense.incorrectKey, 'incorrect');
    });

    test('admin can activate license', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await db.setOptionValue(testData.optionName, '', false);
        await admin.activateLicense(testData.dokanLicense.correctKey);
    });

    test('admin can refresh license', { tag: ['@pro', '@admin'] }, async () => {
        await db.setOptionValue(testData.optionName, testData.dokanProLicense);
        await admin.refreshLicense();
    });

    test('admin can deactivate license', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await db.setOptionValue(testData.optionName, testData.dokanProLicense);
        await admin.deactivateLicense();
    });
});

// ============================================
// NEW REACT UI TEST CASES (Dokan 5.0.0+)
// ============================================
// Added during the 5.0.0 React rewrite. These tests target the new React
// surfaces (DataViews, DokanModal, HashRouter routes). They live alongside
// the legacy tests above for parity coverage during rollout.

test.describe('Admin License Manager (React) Tests @pro', () => {
    test('Test Case 1 - License manager page renders', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan-license`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        const fatal = await page.locator(".notice-error, body.error-page").first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(fatal).toBe(false);
        await page.close();
        await ctx.close();
    });

    test('Test Case 2 - License page renders content', { tag: ['@pro', '@admin'] }, async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: a1 });
        const page = await ctx.newPage();
        await page.goto(toPath(`wp-admin/admin.php?page=dokan-license`));
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.trim().length).toBeGreaterThan(50);
        await page.close();
        await ctx.close();
    });
});

