import { LoginPage } from '@pages/loginPage';
import DokanModulesPage from '@pages/wp-admin/dokan/settings/modules.page';
import test, { expect } from '@playwright/test';

import 'dotenv/config';
const { ADMIN, ADMIN_PASSWORD } = process.env;

let baseUrl: string;
let loginPage: LoginPage;

test.describe('Order Min-Max - Module Activation', () => {
    test.beforeEach(async ({ page }, testInfo) => {
        loginPage = new LoginPage(page);
        baseUrl = testInfo.project.use.baseURL as string;
        await page.goto(baseUrl);
    });

    test('Admin is able to enable min-max feature from modules page', { tag: ['@lite', '@admin'] }, async ({ page }) => {
        let modulesPage = new DokanModulesPage(page);

        await loginPage.adminLogin({ username: ADMIN, password: ADMIN_PASSWORD });
        await page.goto(baseUrl + '/wp-admin/admin.php?page=dokan#/modules');
        await modulesPage.searchFor('Min Max Quantities');
        await modulesPage.clickOnModuleToggleButton('Min Max Quantities');
        await modulesPage.clickOnActiveModulesTab();

        await page.waitForTimeout(2000);
        const titleList = await modulesPage.moduleTitle().allInnerTexts();

        expect(titleList.includes('Min Max Quantities')).toEqual(true);
    });
});
