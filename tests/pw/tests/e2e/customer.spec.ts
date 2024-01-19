import { test, Page, request, BrowserContext } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { CustomerPage } from '@pages/customerPage';
// import { ApiUtils } from '@utils/apiUtils';
import { data } from '@utils/testData';
// import { payloads } from '@utils/payloads';

test.describe('Customer user functionality test', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    let loginPage: LoginPage;
    let customer: CustomerPage;
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        page = await context.newPage();
        loginPage = new LoginPage(page);
        customer = new CustomerPage(page);
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('customer can register @lite', async () => {
        await customer.customerRegister(data.customer.customerInfo);
    });

    test('customer can login @lite', async () => {
        await loginPage.login(data.customer);
    });

    test('customer can logout @lite', async () => {
        await loginPage.login(data.customer);
        await loginPage.logout();
    });

    test('customer can become a vendor @lite', async () => {
        await customer.customerRegister(data.customer.customerInfo);
        await customer.customerBecomeVendor(data.customer.customerInfo);
    });
});

test.describe('Customer functionality test', () => {
    let customer: CustomerPage;
    let cPage: Page;
    let customerContext: BrowserContext;
    // let apiUtils: ApiUtils;

    test.beforeAll(async ({ browser }) => {
        customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new CustomerPage(cPage);
        // apiUtils = new ApiUtils(await request.newContext());
    });

    test.afterAll(async () => {
        await cPage.close();
    });

    test('customer can add billing details @lite', async () => {
        await customer.addBillingAddress(data.customer.customerInfo.billing);
    });

    test('customer can add shipping details @lite', async () => {
        await customer.addShippingAddress(data.customer.customerInfo.shipping);
    });

    test('customer can add customer details @lite', async () => {
        await customer.addCustomerDetails(data.customer);
    });

    test('customer can add product to cart @lite', async () => {
        const productName = data.predefined.simpleProduct.product1.name;
        await customer.addProductToCart(productName, 'single-product');
        await customer.productIsOnCart(productName);
    });

    test('customer can buy product @lite', async () => {
        await customer.addProductToCart(data.predefined.simpleProduct.product1.name, 'single-product');
        await customer.placeOrder();
    });

    test('customer can buy multi vendor products @lite', async () => {
        await customer.addProductToCart(data.predefined.simpleProduct.product1.name, 'single-product');
        await customer.addProductToCart(data.predefined.vendor2.simpleProduct.product1.name, 'single-product', false);
        await customer.placeOrder();
    });

    // test.skip('customer can download downloadables @lite', async ( ) => {
    // pre: complete download product
    // });
});
