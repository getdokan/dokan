import { test, Page } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { TaxPage } from '@pages/taxPage';
import { data } from '@utils/testData';

const { DOKAN_PRO } = process.env;

test.describe('Admin functionality test', () => {
    let taxPage: TaxPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        taxPage = new TaxPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('admin can login', { tag: ['@lite', '@admin'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin);
    });

    test('admin can logout', { tag: ['@lite', '@admin'] }, async ({ page }) => {
        test.skip(DOKAN_PRO, 'skip on pro'); // todo: need to fix
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin);
        await loginPage.logoutBackend();
    });
});
