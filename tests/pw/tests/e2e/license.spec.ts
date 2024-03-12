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

    test('dokan license menu page is rendering properly @pro @exp @a', async () => {
        await admin.adminLicenseRenderProperly();
    });

    test.skip("admin can't activate license with incorrect key @pro @a @neg", async () => {
        await admin.activateLicense(data.dokanLicense.incorrectKey, 'incorrect');
    });

    test.skip('admin can activate license @pro @a', async () => {
        await admin.activateLicense(data.dokanLicense.correctKey);
    });

    test('admin can refreseh license @pro @a', async () => {
        await admin.refresehLicense();
    });

    test.skip('admin can deactivate license @pro @a', async () => {
        await admin.activateLicense(data.dokanLicense.correctKey);
        await admin.deactivateLicense();
    });
});
