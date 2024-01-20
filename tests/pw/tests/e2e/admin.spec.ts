import { test, Page } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { AdminPage } from '@pages/adminPage';
// import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
// import { payloads } from '@utils/payloads';

test.describe('Admin user functionality test', () => {
    test.use(data.auth.noAuth);

    let loginPage: LoginPage;
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        page = await context.newPage();
        loginPage = new LoginPage(page);
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('admin can login @lite', async () => {
        await loginPage.adminLogin(data.admin);
    });

    test('admin can logout @lite', async () => {
        await loginPage.adminLogin(data.admin);
        await loginPage.logoutBackend();
    });
});

test.describe('Admin functionality test', () => {
    let adminPage: AdminPage;
    let aPage: Page;

    test.beforeAll(async ({ browser }) => {
        const adminContext = await browser.newContext(data.auth.adminAuth);
        aPage = await adminContext.newPage();
        adminPage = new AdminPage(aPage);
    });

    test.afterAll(async () => {
        await aPage.close();
    });

    // test('admin can add categories @lite', async ( ) => {
    // 	await adminPage.addCategory(data.product.category.randomCategory());
    // });

    // test('admin can add attributes @lite', async ( ) => {
    // 	await adminPage.addAttributes(data.product.attribute.randomAttribute());
    // });

    // settings

    // tax settings
    // test('admin can set standard tax rate', async ( ) => {
    //     await adminPage.addStandardTaxRate(data.tax)
    // })

    // shipping settings
    // test('admin can set flat rate shipping', async ( ) => {
    //     await adminPage.addShippingMethod(data.shipping.shippingMethods.flatRate);
    // });

    // test('admin can set free shipping', async ( ) => {
    //     await adminPage.addShippingMethod(data.shipping.shippingMethods.freeShipping)
    // })

    // test('admin can set local pickup shipping', async ( ) => {
    //     await adminPage.addShippingMethod(data.shipping.shippingMethods.localPickup)
    // })

    // test('admin can set table rate shipping', async ( ) => {
    //     await adminPage.addShippingMethod(data.shipping.shippingMethods.tableRateShipping)
    // })

    // test('admin can set distance rate shipping', async ( ) => {
    //     await adminPage.addShippingMethod(data.shipping.shippingMethods.distanceRateShipping)
    // })

    // test('admin can set vendor shipping', async ( ) => {
    //     await adminPage.addShippingMethod(data.shipping.shippingMethods.vendorShipping)
    // })

    test('dokan notice @lite', async () => {
        await adminPage.dokanNotice();
    });

    test('dokan promotion @lite', async () => {
        await adminPage.dokanPromotion();
    });
});
