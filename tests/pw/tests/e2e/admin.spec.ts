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

    test('admin can login', { tag: ['@lite', '@a'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin);
    });

    test('admin can logout', { tag: ['@lite', '@a'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.adminLogin(data.admin);
        await loginPage.logoutBackend();
    });

    // settings

    // tax settings

    test('admin can set standard tax rate', { tag: ['@lite', '@a'] }, async () => {
        await taxPage.addStandardTaxRate(data.tax);
    });

    // shipping settings

    test.skip('admin can set flat rate shipping', { tag: ['@lite', '@a'] }, async () => {
        await shippingPage.addShippingMethod(data.shipping.shippingMethods.flatRate);
    });

    test.skip('admin can set free shipping', { tag: ['@lite', '@a'] }, async () => {
        await shippingPage.addShippingMethod(data.shipping.shippingMethods.freeShipping);
    });

    test.skip('admin can set local pickup shipping', { tag: ['@lite', '@a'] }, async () => {
        await shippingPage.addShippingMethod(data.shipping.shippingMethods.localPickup);
    });

    test.skip('admin can set table rate shipping', { tag: ['@pro', '@a'] }, async () => {
        await shippingPage.addShippingMethod(data.shipping.shippingMethods.tableRateShipping);
    });

    test.skip('admin can set distance rate shipping', { tag: ['@pro', '@a'] }, async () => {
        await shippingPage.addShippingMethod(data.shipping.shippingMethods.distanceRateShipping);
    });

    test.skip('admin can set vendor shipping', { tag: ['@pro', '@a'] }, async () => {
        await shippingPage.addShippingMethod(data.shipping.shippingMethods.vendorShipping);
    });
});
