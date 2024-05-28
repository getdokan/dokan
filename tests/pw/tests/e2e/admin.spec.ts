import { test, Page } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { TaxPage } from '@pages/taxPage';
import { ShippingPage } from '@pages/shippingPage';
import { data } from '@utils/testData';

test.describe('Admin functionality test', () => {
    let taxPage: TaxPage;
    let shippingPage: ShippingPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        taxPage = new TaxPage(aPage);
        shippingPage = new ShippingPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    test('admin can login', { tag: ['@lite', '@admin'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin);
    });

    test('admin can logout', { tag: ['@lite', '@admin'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin);
        await loginPage.logoutBackend();
    });

    // settings

    // tax settings

    test('admin can add standard tax rate', { tag: ['@lite', '@admin'] }, async () => {
        await taxPage.addStandardTaxRate(data.tax);
    });

    // shipping settings

    test.skip('admin can add flat rate shipping', { tag: ['@lite', '@admin'] }, async () => {
        await shippingPage.addShippingMethod(data.shipping.shippingMethods.flatRate);
    });

    test.skip('admin can add free shipping', { tag: ['@lite', '@admin'] }, async () => {
        await shippingPage.addShippingMethod(data.shipping.shippingMethods.freeShipping);
    });

    test.skip('admin can add local pickup shipping', { tag: ['@lite', '@admin'] }, async () => {
        await shippingPage.addShippingMethod(data.shipping.shippingMethods.localPickup);
    });

    test.skip('admin can add table rate shipping', { tag: ['@pro', '@admin'] }, async () => {
        await shippingPage.addShippingMethod(data.shipping.shippingMethods.tableRateShipping);
    });

    test.skip('admin can add distance rate shipping', { tag: ['@pro', '@admin'] }, async () => {
        await shippingPage.addShippingMethod(data.shipping.shippingMethods.distanceRateShipping);
    });

    test.skip('admin can add vendor shipping', { tag: ['@pro', '@admin'] }, async () => {
        await shippingPage.addShippingMethod(data.shipping.shippingMethods.vendorShipping);
    });
});
