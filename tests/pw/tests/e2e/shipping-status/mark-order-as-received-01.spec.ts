import { LoginPage } from '@pages/loginPage';
import DokanShippingStatusPage from '@pages/wp-admin/dokan/settings/shipping-status.page';
import test, { expect } from '@playwright/test';

let baseUrl: string;
let loginPage: LoginPage;
let shippingStatusPage: DokanShippingStatusPage;

test.describe('Mark Order As Received - 01', () => {
    test.beforeEach(async ({ page }, testInfo) => {
        loginPage = new LoginPage(page);
        shippingStatusPage = new DokanShippingStatusPage(page);

        console.log(testInfo.project.use.baseURL);
        baseUrl = testInfo.project.use.baseURL as string;
        await page.goto(baseUrl);
    });

    test('Receive status is added when Mark received by Customer is enabled', async ({ page }) => {
        await loginPage.adminLogin({ username: 'admin1', password: 'admin1@email.com' });
        await page.goto(baseUrl + '/wp-admin/admin.php?page=dokan#/settings');
        await shippingStatusPage.clickOnShippingStatusTab();
        await shippingStatusPage.clickOnAllowShipmentTrackingCheckbox();
        await shippingStatusPage.clickOnAllowMarkAsReceivedCheckbox();
        await shippingStatusPage.clickOnSaveChangesButton();

        const status = await shippingStatusPage.shippingStatusItem('Received');
        expect(await status?.textContent()).toContain('Received');
    });
});
