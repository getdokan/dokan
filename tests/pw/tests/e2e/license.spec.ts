import { test, Page } from '@playwright/test';
import { LicensePage } from '@pages/licensePage';
import { data } from '@utils/testData';

test.describe('License test', () => {
    let admin: LicensePage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new LicensePage(aPage);
    });

    test.afterAll(async () => {
        // await admin.activateLicense(data.dokanLicense.correctKey);
        await aPage.close();
    });

    // admin

    test('admin can view license menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminLicenseRenderProperly();
    });

    test.skip("admin can't activate license with incorrect key", { tag: ['@pro', '@negative', '@admin'] }, async () => {
        await admin.activateLicense(data.dokanLicense.incorrectKey, 'incorrect');
    });

    test.skip('admin can activate license', { tag: ['@pro', '@admin'] }, async () => {
        await admin.activateLicense(data.dokanLicense.correctKey);
    });

    test('admin can refresh license', { tag: ['@pro', '@admin'] }, async () => {
        await admin.refreshLicense();
    });

    test.skip('admin can deactivate license', { tag: ['@pro', '@admin'] }, async () => {
        await admin.activateLicense(data.dokanLicense.correctKey);
        await admin.deactivateLicense();
    });
});
