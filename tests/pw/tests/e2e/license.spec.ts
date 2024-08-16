import { test, Page } from '@playwright/test';
import { LicensePage } from '@pages/licensePage';
import { dbUtils } from '@utils/dbUtils';
import { data } from '@utils/testData';
import { dbData } from '@utils/dbData';

test.describe.only('License test', () => {
    let admin: LicensePage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        admin = new LicensePage(aPage);
    });

    test.afterAll(async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.dokanProLicense, dbData.dokan.dokanProLicense);
        await aPage.close();
    });

    // admin

    test('admin can view license menu page', { tag: ['@pro', '@exploratory', '@admin'] }, async () => {
        await admin.adminLicenseRenderProperly();
    });

    test("admin can't activate license with incorrect key", { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.dokanProLicense, '', false);
        await admin.activateLicense(data.dokanLicense.incorrectKey, 'incorrect');
    });

    test('admin can activate license', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.dokanProLicense, '', false);
        await admin.activateLicense(data.dokanLicense.correctKey);
    });

    test('admin can refresh license', { tag: ['@pro', '@admin'] }, async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.dokanProLicense, dbData.dokan.dokanProLicense);
        await admin.refreshLicense();
    });

    test('admin can deactivate license', { tag: ['@pro', '@admin', '@serial'] }, async () => {
        await dbUtils.setOptionValue(dbData.dokan.optionName.dokanProLicense, dbData.dokan.dokanProLicense);
        await admin.deactivateLicense();
    });
});
