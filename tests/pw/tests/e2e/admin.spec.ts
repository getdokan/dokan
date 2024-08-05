import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { data } from '@utils/testData';

const { DOKAN_PRO } = process.env;

test.describe('Admin functionality test', () => {
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
