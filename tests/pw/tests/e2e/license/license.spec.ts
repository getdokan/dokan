import { test, Page } from '@playwright/test';
import { LicensePage, db, testData } from './licensePage';
import path from 'path';

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
