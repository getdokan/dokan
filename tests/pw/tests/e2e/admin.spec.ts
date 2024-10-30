import { test } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { data } from '@utils/testData';

test.describe('Admin functionality test', () => {
    test('admin can login', { tag: ['@lite', '@admin'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin);
    });

    test('admin can logout', { tag: ['@lite', '@admin'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin);
        await loginPage.logoutBackend();
    });
});
