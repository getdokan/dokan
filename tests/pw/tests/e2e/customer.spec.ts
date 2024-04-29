import { test, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '@pages/loginPage';
import { CustomerPage } from '@pages/customerPage';
import { data } from '@utils/testData';

test.describe('Customer functionality test', () => {
    let customer: CustomerPage;
    let cPage: Page;
    let customerContext: BrowserContext;

    test.beforeAll(async ({ browser }) => {
        customerContext = await browser.newContext(data.auth.customerAuth);
        cPage = await customerContext.newPage();
        customer = new CustomerPage(cPage);
    });

    test.afterAll(async () => {
        await cPage.close();
    });

    test('customer can register', { tag: ['@lite', '@customer'] }, async ({ page }) => {
        const customer = new CustomerPage(page);
        await customer.customerRegister(data.customer.customerInfo);
    });

    test('customer can login', { tag: ['@lite', '@customer'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.customer);
    });

    test('customer can logout', { tag: ['@lite', '@customer'] }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(data.customer);
        await loginPage.logout();
    });

    test('customer can become a vendor', { tag: ['@lite', '@customer'] }, async ({ page }) => {
        const customer = new CustomerPage(page);
        await customer.customerRegister(data.customer.customerInfo);
        await customer.customerBecomeVendor(data.customer.customerInfo);
    });

    test('customer can add billing details', { tag: ['@lite', '@customer'] }, async () => {
        await customer.addBillingAddress(data.customer.customerInfo.billing);
    });

    test('customer can add shipping details', { tag: ['@lite', '@customer'] }, async () => {
        await customer.addShippingAddress(data.customer.customerInfo.shipping);
    });

    test('customer can add customer details', { tag: ['@lite', '@customer'] }, async () => {
        await customer.addCustomerDetails(data.customer);
    });

    test('customer can add product to cart', { tag: ['@lite', '@customer'] }, async () => {
        const productName = data.predefined.simpleProduct.product1.name;
        await customer.addProductToCart(productName, 'single-product');
        await customer.productIsOnCart(productName);
    });

    test('customer can buy product', { tag: ['@lite', '@customer'] }, async () => {
        await customer.addProductToCart(data.predefined.simpleProduct.product1.name, 'single-product');
        await customer.placeOrder();
    });

    test('customer can buy multi-vendor products', { tag: ['@lite', '@customer'] }, async () => {
        await customer.addProductToCart(data.predefined.simpleProduct.product1.name, 'single-product');
        await customer.addProductToCart(data.predefined.vendor2.simpleProduct.product1.name, 'single-product', false);
        await customer.placeOrder();
    });

    // todo: customer can download downloadable product
});
