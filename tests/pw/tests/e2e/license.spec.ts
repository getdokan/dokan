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
        await aPage.close();
    });

    test('dokan license menu page is rendering properly @pro @explo', async () => {
        await admin.adminLicenseRenderProperly();
    });

    test("admin can't activate license with incorrect key @pro @neg", async () => {
        await admin.activateLicense(data.dokanLicense.incorrectKey, 'incorrect');
    });
    
    test('admin can activate license @pro', async ( ) => {
    	await admin.activateLicense(data.dokanLicense.correctKey);
    });

    test('admin can deactivate license @pro', async ( ) => {
        await admin.activateLicense(data.dokanLicense.correctKey);
    	await admin.deactivateLicense();
    });
});
