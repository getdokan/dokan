import { test, expect } from '@playwright/test'
import { ApiUtils } from '../../utils/apiUtils'
import { endPoints } from '../../utils/apiEndPoints'
import { payloads } from '../../utils/payloads'
import { data } from '../../utils/testData'
import { LoginPage } from '../../pages/loginPage'
import { AdminPage } from '../../pages/adminPage'

// test.beforeAll(async ({ request }) => {});
// test.afterAll(async ({ request }) => { });
// test.beforeEach(async ({ request }) => { });
// test.afterEach(async ({ request }) => { });


test.describe(' api test', () => {

    // test('permalink set ', async ({ page }) => {
    //     const loginPage = new LoginPage(page)
    //     const adminPage = new AdminPage(page)
    //     await loginPage.adminLogin(data.admin)
    //     let a = await page.evaluate(() => window.myvars.nonce)
    //     console.log(a)
    // });

    // test('permalink set ', async ({ page }) => {
    //     const loginPage = new LoginPage(page)
    //     const adminPage = new AdminPage(page)
    //     await loginPage.adminLogin(data.admin)
    //     await adminPage.setPermalinkSettings(data.wpSettings.permalink)
    // });

    
});
